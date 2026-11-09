"""Assessment endpoints — create, list, retrieve, export."""

import csv
import io
import logging
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy import func, desc
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_optional_user
from app.db.session import get_db
from app.models.models import Assessment, User, AuditLog
from app.schemas.schemas import AssessmentCreate, AssessmentOut, AssessmentListOut
from app.ml.service import ml_service
from app.services.resource_planning import calculate_resources

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/assessments", tags=["Assessments"])


@router.post("", response_model=AssessmentOut, status_code=status.HTTP_201_CREATED)
def create_assessment(
    body: AssessmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Run ML prediction and persist the assessment."""
    if not ml_service.is_loaded:
        logger.warning("ML model is not loaded. Proceeding with baseline prediction.")

    # Run prediction
    prediction = ml_service.predict({
        "crowd_size": body.crowd_size,
        "venue_capacity": body.venue_capacity,
        "temperature_c": body.temperature_c,
        "holiday": body.holiday,
        "previous_incidents": body.previous_incidents,
        "weather": body.weather,
        "time_slot": body.time_slot,
        "day_of_week": body.day_of_week,
        "event_type": body.event_type,
    })

    # Calculate resource recommendations
    res = calculate_resources(
        risk_level=prediction["risk_level"],
        crowd_size=body.crowd_size,
        venue_capacity=body.venue_capacity,
    )

    assessment = Assessment(
        user_id=current_user.id,
        venue=body.venue,
        event_type=body.event_type,
        crowd_size=body.crowd_size,
        venue_capacity=body.venue_capacity,
        weather=body.weather,
        temperature_c=body.temperature_c,
        previous_incidents=body.previous_incidents,
        holiday=1 if body.holiday else 0,
        time_slot=body.time_slot,
        day_of_week=body.day_of_week,
        risk_level=prediction["risk_level"],
        risk_score=prediction["risk_score"],
        confidence=prediction["confidence"],
        model_version=prediction["model_version"],
        security_personnel=res["resources"]["security_personnel"],
        police_units=res["resources"]["police_units"],
        medical_teams=res["resources"]["medical_teams"],
        ambulances=res["resources"]["ambulances"],
    )
    db.add(assessment)
    db.add(AuditLog(
        user_id=current_user.id,
        action="create_assessment",
        detail=f"Assessment for {body.venue}: {prediction['risk_level']} (score {prediction['risk_score']})",
    ))
    db.commit()
    db.refresh(assessment)
    return assessment


@router.get("", response_model=AssessmentListOut)
def list_assessments(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    risk_level: Optional[str] = Query(None),
    venue: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List assessments with filtering, sorting, and pagination."""
    q = db.query(Assessment)

    # Non-admin users see only their own assessments
    if current_user.role != "admin":
        q = q.filter(Assessment.user_id == current_user.id)

    if risk_level:
        q = q.filter(Assessment.risk_level == risk_level)
    if venue:
        q = q.filter(Assessment.venue.ilike(f"%{venue}%"))
    if date_from:
        try:
            q = q.filter(Assessment.created_at >= datetime.fromisoformat(date_from))
        except ValueError:
            pass
    if date_to:
        try:
            q = q.filter(Assessment.created_at <= datetime.fromisoformat(date_to))
        except ValueError:
            pass

    # Sorting
    allowed_sorts = {"created_at", "risk_score", "crowd_size", "venue", "risk_level"}
    col = getattr(Assessment, sort_by if sort_by in allowed_sorts else "created_at")
    q = q.order_by(desc(col) if sort_order == "desc" else col)

    total = q.count()
    pages = max(1, (total + per_page - 1) // per_page)
    items = q.offset((page - 1) * per_page).limit(per_page).all()

    return AssessmentListOut(items=items, total=total, page=page, per_page=per_page, pages=pages)


@router.get("/export")
def export_assessments(
    risk_level: Optional[str] = Query(None),
    venue: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Export assessments to CSV."""
    q = db.query(Assessment)
    if current_user.role != "admin":
        q = q.filter(Assessment.user_id == current_user.id)
    if risk_level:
        q = q.filter(Assessment.risk_level == risk_level)
    if venue:
        q = q.filter(Assessment.venue.ilike(f"%{venue}%"))

    rows = q.order_by(desc(Assessment.created_at)).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "ID", "Date", "Venue", "Event Type", "Crowd Size", "Capacity",
        "Weather", "Temperature", "Incidents", "Holiday", "Time Slot",
        "Day", "Risk Level", "Risk Score", "Confidence",
        "Security", "Police", "Medical", "Ambulances",
    ])
    for r in rows:
        writer.writerow([
            r.id, r.created_at.isoformat() if r.created_at else "",
            r.venue, r.event_type, r.crowd_size, r.venue_capacity,
            r.weather, r.temperature_c, r.previous_incidents,
            "Yes" if r.holiday else "No", r.time_slot, r.day_of_week,
            r.risk_level, r.risk_score, r.confidence,
            r.security_personnel, r.police_units, r.medical_teams, r.ambulances,
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=safeai_assessments.csv"},
    )


@router.get("/{assessment_id}", response_model=AssessmentOut)
def get_assessment(
    assessment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve a single assessment by ID."""
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    if current_user.role != "admin" and assessment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorised to view this assessment")
    return assessment


@router.get("/{assessment_id}/resources")
def get_assessment_resources(
    assessment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get resource planning details for an assessment."""
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    if current_user.role != "admin" and assessment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorised")

    plan = calculate_resources(
        risk_level=assessment.risk_level,
        crowd_size=assessment.crowd_size,
        venue_capacity=assessment.venue_capacity,
    )
    return {
        "assessment_id": assessment.id,
        "risk_level": assessment.risk_level,
        "crowd_size": assessment.crowd_size,
        **plan,
    }


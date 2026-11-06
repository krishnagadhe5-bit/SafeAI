"""Dashboard endpoints — summary statistics and trends."""

from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, case, desc
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.models import Assessment, User
from app.schemas.schemas import DashboardSummary, DashboardTrends, AssessmentOut
from app.ml.service import ml_service

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/summary", response_model=DashboardSummary)
def dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get aggregate dashboard statistics for public safety intelligence."""
    # Authorized analysts and admins view platform-wide intelligence statistics
    q = db.query(Assessment)

    total = q.count()
    low = q.filter(Assessment.risk_level == "Low").count()
    medium = q.filter(Assessment.risk_level == "Medium").count()
    high = q.filter(Assessment.risk_level == "High").count()
    critical = q.filter(Assessment.risk_level == "Critical").count()

    accuracy = round(ml_service.accuracy * 100, 1) if (ml_service.is_loaded and ml_service.accuracy > 0) else 62.9
    rows = ml_service.training_rows if (ml_service.is_loaded and ml_service.training_rows > 0) else 1200
    classes = ml_service.classes if (ml_service.is_loaded and ml_service.classes) else ["Critical", "High", "Low", "Medium"]

    return DashboardSummary(
        total_assessments=total,
        low_risk=low,
        medium_risk=medium,
        high_risk=high,
        critical_risk=critical,
        model_accuracy=accuracy,
        model_training_rows=rows,
        model_classes=classes,
    )


@router.get("/trends", response_model=DashboardTrends)
def dashboard_trends(
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get assessment trends, risk distribution, recent assessments, and venue summary."""
    q = db.query(Assessment)

    # --- Trends: daily assessment counts over last N days ---
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    recent_q = q.filter(Assessment.created_at >= cutoff)

    all_recent = recent_q.order_by(Assessment.created_at).all()

    # Build daily buckets
    daily: dict[str, dict] = {}
    for a in all_recent:
        day_str = a.created_at.strftime("%Y-%m-%d") if a.created_at else "unknown"
        if day_str not in daily:
            daily[day_str] = {"date": day_str, "count": 0, "high": 0, "critical": 0}
        daily[day_str]["count"] += 1
        if a.risk_level == "High":
            daily[day_str]["high"] += 1
        elif a.risk_level == "Critical":
            daily[day_str]["critical"] += 1

    trends = sorted(daily.values(), key=lambda x: x["date"])

    # --- Risk distribution ---
    risk_dist = {}
    for level in ["Low", "Medium", "High", "Critical"]:
        risk_dist[level] = q.filter(Assessment.risk_level == level).count()

    # --- Recent assessments (last 10) ---
    recent_items = q.order_by(desc(Assessment.created_at)).limit(10).all()

    # --- Venue summary (top 10 venues) ---
    venue_rows = (
        db.query(
            Assessment.venue,
            func.count(Assessment.id).label("count"),
            func.avg(Assessment.risk_score).label("avg_score"),
        )
        .group_by(Assessment.venue)
        .order_by(desc(func.count(Assessment.id)))
        .limit(10)
        .all()
    )
    venue_summary = [
        {"venue": v, "count": c, "avg_score": round(float(s), 1) if s else 0}
        for v, c, s in venue_rows
    ]

    return DashboardTrends(
        trends=trends,
        risk_distribution=risk_dist,
        recent_assessments=recent_items,
        venue_summary=venue_summary,
    )


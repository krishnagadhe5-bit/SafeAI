"""Reports endpoints — summaries and export."""

from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, desc
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.models import Assessment, User
from app.schemas.schemas import ReportSummary

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/summary", response_model=ReportSummary)
def report_summary(
    venue: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get aggregated report summary."""
    from datetime import datetime

    q = db.query(Assessment)
    if current_user.role != "admin":
        q = q.filter(Assessment.user_id == current_user.id)

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

    total = q.count()

    # Risk breakdown
    by_risk = {}
    for level in ["Low", "Medium", "High", "Critical"]:
        by_risk[level] = q.filter(Assessment.risk_level == level).count()

    # Event type breakdown
    event_rows = (
        q.with_entities(Assessment.event_type, func.count(Assessment.id))
        .group_by(Assessment.event_type)
        .all()
    )
    by_event_type = {e: c for e, c in event_rows}

    # Venue breakdown (top 20)
    venue_rows = (
        q.with_entities(
            Assessment.venue,
            func.count(Assessment.id).label("count"),
            func.avg(Assessment.risk_score).label("avg_score"),
        )
        .group_by(Assessment.venue)
        .order_by(desc(func.count(Assessment.id)))
        .limit(20)
        .all()
    )
    by_venue = [
        {"venue": v, "count": c, "avg_score": round(float(s), 1) if s else 0}
        for v, c, s in venue_rows
    ]

    # Date range
    first = q.order_by(Assessment.created_at).first()
    last = q.order_by(desc(Assessment.created_at)).first()

    return ReportSummary(
        total=total,
        by_risk=by_risk,
        by_venue=by_venue,
        by_event_type=by_event_type,
        date_range={
            "from": first.created_at.isoformat() if first and first.created_at else None,
            "to": last.created_at.isoformat() if last and last.created_at else None,
        },
    )


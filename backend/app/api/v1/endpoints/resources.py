"""Resource planning endpoints."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.models import User
from app.schemas.schemas import ResourcePlanRequest, ResourcePlanOut
from app.services.resource_planning import calculate_resources

router = APIRouter(prefix="/resource-plans", tags=["Resource Planning"])


@router.post("", response_model=ResourcePlanOut)
def create_resource_plan(
    body: ResourcePlanRequest,
    current_user: User = Depends(get_current_user),
):
    """Calculate illustrative resource estimates for a given risk profile."""
    result = calculate_resources(
        risk_level=body.risk_level,
        crowd_size=body.crowd_size,
        venue_capacity=body.venue_capacity,
    )
    return ResourcePlanOut(
        risk_level=body.risk_level,
        crowd_size=body.crowd_size,
        venue_capacity=body.venue_capacity,
        resources=result["resources"],
        multiplier=result["multiplier"],
        methodology=result["methodology"],
        disclaimer=result["disclaimer"],
    )


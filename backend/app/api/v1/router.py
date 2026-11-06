"""API v1 router — aggregates all endpoint modules."""

from fastapi import APIRouter

from app.api.v1.endpoints import auth, assessments, dashboard, resources, reports, admin

router = APIRouter(prefix="/api/v1")

router.include_router(auth.router)
router.include_router(assessments.router)
router.include_router(dashboard.router)
router.include_router(resources.router)
router.include_router(reports.router)
router.include_router(admin.router)


"""Admin endpoints — user management."""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.deps import require_admin, get_current_user
from app.db.session import get_db
from app.models.models import User, AuditLog
from app.schemas.schemas import UserOut

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/users", response_model=list[UserOut])
def list_users(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """List all users (admin only)."""
    return db.query(User).order_by(User.id).all()


@router.patch("/users/{user_id}/role")
def update_user_role(
    user_id: int,
    role: str = Query(..., pattern="^(admin|analyst)$"),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Update a user's role (admin only)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot change your own role")

    old_role = user.role
    user.role = role
    db.add(AuditLog(
        user_id=admin.id,
        action="update_role",
        detail=f"Changed user {user.email} role from {old_role} to {role}",
    ))
    db.commit()
    return {"message": f"User role updated to {role}"}


@router.patch("/users/{user_id}/status")
def toggle_user_status(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Toggle a user's active status (admin only)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot deactivate yourself")

    user.is_active = not user.is_active
    db.add(AuditLog(
        user_id=admin.id,
        action="toggle_status",
        detail=f"{'Activated' if user.is_active else 'Deactivated'} user {user.email}",
    ))
    db.commit()
    return {"message": f"User {'activated' if user.is_active else 'deactivated'}"}


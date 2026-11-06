"""Authentication dependencies for FastAPI — supports real Supabase Auth JWTs & local sessions."""

import logging
import httpx
from fastapi import Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.models import User

logger = logging.getLogger(__name__)


def _extract_token(request: Request) -> str | None:
    """Extract token from Authorization: Bearer <token> header or access_token cookie."""
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header.split(" ", 1)[1].strip()
    return request.cookies.get("access_token")


def _verify_supabase_token(token: str) -> dict | None:
    """Verify access token against Supabase GoTrue Auth API."""
    if not settings.normalized_supabase_url or not settings.normalized_supabase_key:
        return None
    try:
        url = f"{settings.normalized_supabase_url}/auth/v1/user"
        headers = {
            "Authorization": f"Bearer {token}",
            "apikey": settings.normalized_supabase_key,
        }
        with httpx.Client(timeout=5.0) as client:
            resp = client.get(url, headers=headers)
            if resp.status_code == 200:
                return resp.json()
            logger.debug("Supabase token verification returned status: %d", resp.status_code)
    except Exception as e:
        logger.warning("Supabase token verification check failed: %s", e)
    return None


def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    """Extract and validate the authenticated user from Supabase or session token."""
    token = _extract_token(request)
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    # 1. Attempt Supabase Auth Verification
    sb_data = _verify_supabase_token(token)
    if sb_data and "id" in sb_data:
        sb_uid = sb_data["id"]
        sb_email = sb_data.get("email") or f"{sb_uid}@supabase.user"
        sb_meta = sb_data.get("user_metadata", {})
        sb_name = sb_meta.get("full_name") or (sb_email.split("@")[0] if sb_email else "Analyst")
        sb_role = sb_meta.get("role") or "analyst"

        # Sync user to database
        user = db.query(User).filter(
            (User.supabase_uid == sb_uid) | (User.email == sb_email)
        ).first()

        if not user:
            user = User(
                email=sb_email,
                full_name=sb_name,
                hashed_password="SUPABASE_AUTH_MANAGED",
                role=sb_role,
                is_active=True,
                supabase_uid=sb_uid,
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            logger.info("Created synced Supabase user record: %s (id: %d)", sb_email, user.id)
        else:
            # Update missing attributes
            updated = False
            if not user.supabase_uid:
                user.supabase_uid = sb_uid
                updated = True
            if user.full_name != sb_name and sb_meta.get("full_name"):
                user.full_name = sb_name
                updated = True
            if updated:
                db.commit()

        if not user.is_active:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is deactivated")
        return user

    # 2. Fallback: Internal JWT decoding (for tests or local cookie tokens)
    payload = decode_access_token(token)
    if payload is not None:
        user_id = payload.get("sub")
        if user_id is not None:
            user = db.query(User).filter(User.id == int(user_id)).first()
            if user and user.is_active:
                return user

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired authentication session",
    )


def get_optional_user(request: Request, db: Session = Depends(get_db)) -> User | None:
    """Return the current user if authenticated, otherwise None."""
    try:
        return get_current_user(request, db)
    except HTTPException:
        return None


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Require the current user to have the admin role."""
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user

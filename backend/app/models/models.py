"""SQLAlchemy ORM models."""

from datetime import datetime, timezone

from sqlalchemy import (
    Boolean, Column, DateTime, Enum, Float, ForeignKey,
    Integer, String, Text, Index,
)
from sqlalchemy.orm import relationship

from app.db.session import Base


# ---------------------------------------------------------------------------
# User
# ---------------------------------------------------------------------------

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=True)  # Nullable for Supabase-authenticated accounts
    role = Column(String(50), nullable=False, default="analyst")  # admin | analyst
    is_active = Column(Boolean, default=True, nullable=False)
    supabase_uid = Column(String(100), unique=True, nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    assessments = relationship("Assessment", back_populates="user")


# ---------------------------------------------------------------------------
# Assessment
# ---------------------------------------------------------------------------

class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Input fields (full record of what was submitted)
    venue = Column(String(200), nullable=False)
    event_type = Column(String(50), nullable=False)
    crowd_size = Column(Integer, nullable=False)
    venue_capacity = Column(Integer, nullable=False)
    weather = Column(String(50), nullable=False)
    temperature_c = Column(Float, nullable=False)
    previous_incidents = Column(Integer, nullable=False, default=0)
    holiday = Column(Integer, nullable=False, default=0)  # 0 or 1
    time_slot = Column(String(20), nullable=False)  # Morning/Afternoon/Evening/Night
    day_of_week = Column(String(20), nullable=False)

    # Prediction results
    risk_level = Column(String(20), nullable=False)
    risk_score = Column(Integer, nullable=False)
    confidence = Column(Float, nullable=True)
    model_version = Column(String(100), nullable=True)

    # Resource recommendations
    security_personnel = Column(Integer, nullable=True)
    police_units = Column(Integer, nullable=True)
    medical_teams = Column(Integer, nullable=True)
    ambulances = Column(Integer, nullable=True)

    user = relationship("User", back_populates="assessments")

    __table_args__ = (
        Index("ix_assessments_risk_level", "risk_level"),
        Index("ix_assessments_venue", "venue"),
    )


# ---------------------------------------------------------------------------
# Audit log
# ---------------------------------------------------------------------------

class AuditLog(Base):
    __tablename__ = "audit_log"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)
    detail = Column(Text, nullable=True)


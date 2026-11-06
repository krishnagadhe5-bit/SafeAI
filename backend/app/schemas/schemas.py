"""Pydantic schemas for request/response validation."""

from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, EmailStr, Field, field_validator


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------

class UserRegister(BaseModel):
    email: str = Field(..., min_length=3, max_length=255)
    full_name: str = Field(..., min_length=1, max_length=255)
    password: str = Field(..., min_length=6, max_length=128)

    @field_validator("email")
    @classmethod
    def validate_email_format(cls, v: str) -> str:
        v = v.strip().lower()
        if "@" not in v or "." not in v.split("@")[1]:
            raise ValueError("Invalid email format")
        return v


class UserLogin(BaseModel):
    email: str = Field(..., min_length=3, max_length=255)
    password: str


class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    is_active: bool
    supabase_uid: Optional[str] = None
    created_at: datetime
    model_config = {"from_attributes": True}


class TokenData(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ---------------------------------------------------------------------------
# Assessment — request
# ---------------------------------------------------------------------------

VALID_WEATHER = ["Clear", "Cloudy", "Rain", "Heavy Rain", "Extreme Heat"]
VALID_EVENTS = ["Normal Operations", "Sports Event", "Concert", "Festival", "Public Gathering"]
VALID_TIME_SLOTS = ["Morning", "Afternoon", "Evening", "Night"]
VALID_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


class AssessmentCreate(BaseModel):
    venue: str = Field(..., min_length=1, max_length=200, description="Location or venue name")
    event_type: Literal["Normal Operations", "Sports Event", "Concert", "Festival", "Public Gathering"]
    crowd_size: int = Field(..., ge=0, description="Expected crowd size")
    venue_capacity: int = Field(..., gt=0, description="Maximum venue capacity")
    weather: Literal["Clear", "Cloudy", "Rain", "Heavy Rain", "Extreme Heat"]
    temperature_c: float = Field(..., ge=-50, le=60, description="Temperature in Celsius")
    previous_incidents: int = Field(0, ge=0, le=100, description="Number of previous incidents")
    holiday: bool = Field(False, description="Whether this is a holiday")
    time_slot: Literal["Morning", "Afternoon", "Evening", "Night"]
    day_of_week: Literal["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

    @field_validator("venue")
    @classmethod
    def strip_venue(cls, v: str) -> str:
        return v.strip()


# ---------------------------------------------------------------------------
# Assessment — response
# ---------------------------------------------------------------------------

class ResourceEstimate(BaseModel):
    security_personnel: int
    police_units: int
    medical_teams: int
    ambulances: int


class AssessmentOut(BaseModel):
    id: int
    created_at: datetime
    venue: str
    event_type: str
    crowd_size: int
    venue_capacity: int
    weather: str
    temperature_c: float
    previous_incidents: int
    holiday: int
    time_slot: str
    day_of_week: str
    risk_level: str
    risk_score: int
    confidence: Optional[float] = None
    model_version: Optional[str] = None
    security_personnel: Optional[int] = None
    police_units: Optional[int] = None
    medical_teams: Optional[int] = None
    ambulances: Optional[int] = None
    user_id: Optional[int] = None
    model_config = {"from_attributes": True}


class AssessmentListOut(BaseModel):
    items: list[AssessmentOut]
    total: int
    page: int
    per_page: int
    pages: int


# ---------------------------------------------------------------------------
# Dashboard
# ---------------------------------------------------------------------------

class DashboardSummary(BaseModel):
    total_assessments: int
    high_risk: int
    critical_risk: int
    low_risk: int
    medium_risk: int
    model_accuracy: float
    model_training_rows: int
    model_classes: list[str]


class TrendPoint(BaseModel):
    date: str
    count: int
    high: int = 0
    critical: int = 0


class DashboardTrends(BaseModel):
    trends: list[TrendPoint]
    risk_distribution: dict[str, int]
    recent_assessments: list[AssessmentOut]
    venue_summary: list[dict]


# ---------------------------------------------------------------------------
# Resource planning
# ---------------------------------------------------------------------------

class ResourcePlanRequest(BaseModel):
    risk_level: Literal["Low", "Medium", "High", "Critical"]
    crowd_size: int = Field(..., ge=0)
    venue_capacity: int = Field(..., gt=0)


class ResourcePlanOut(BaseModel):
    risk_level: str
    crowd_size: int
    venue_capacity: int
    resources: ResourceEstimate
    multiplier: float
    methodology: str
    disclaimer: str


# ---------------------------------------------------------------------------
# Reports
# ---------------------------------------------------------------------------

class ReportSummary(BaseModel):
    total: int
    by_risk: dict[str, int]
    by_venue: list[dict]
    by_event_type: dict[str, int]
    date_range: dict[str, Optional[str]]


# ---------------------------------------------------------------------------
# General
# ---------------------------------------------------------------------------

class HealthResponse(BaseModel):
    status: str
    service: str
    version: str


class MessageResponse(BaseModel):
    message: str


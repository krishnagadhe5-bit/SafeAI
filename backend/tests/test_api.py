"""Backend test suite."""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.db.session import Base, get_db
from app.ml.service import ml_service

# Test database — in-memory SQLite
TEST_DB_URL = "sqlite:///./test_safeai.db"
test_engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestSession = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def override_get_db():
    db = TestSession()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="session", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=test_engine)
    if not ml_service.is_loaded:
        try:
            ml_service.load()
        except FileNotFoundError:
            pass
    yield
    test_engine.dispose()
    import os
    if os.path.exists("./test_safeai.db"):
        try:
            os.remove("./test_safeai.db")
        except Exception:
            pass


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def auth_client(client):
    """A client with an authenticated session (registers + logs in)."""
    client.post("/api/v1/auth/register", json={
        "email": "test_auth@example.com",
        "full_name": "Test Auth User",
        "password": "testpass123",
    })
    resp = client.post("/api/v1/auth/login", json={
        "email": "test_auth@example.com",
        "password": "testpass123",
    })
    assert resp.status_code == 200, f"Login failed: {resp.text}"
    return client


# ── Health ──────────────────────────────────────────────────

def test_health(client):
    r = client.get("/api/v1/health")
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "ok"
    assert data["service"] == "SafeAI"


# ── Auth ────────────────────────────────────────────────────

def test_register(client):
    r = client.post("/api/v1/auth/register", json={
        "email": "new@test.com",
        "full_name": "New User",
        "password": "secure123",
    })
    assert r.status_code == 201
    assert r.json()["email"] == "new@test.com"
    assert r.json()["role"] == "analyst"


def test_register_duplicate(client):
    client.post("/api/v1/auth/register", json={
        "email": "dup@test.com",
        "full_name": "Dup",
        "password": "secure123",
    })
    r = client.post("/api/v1/auth/register", json={
        "email": "dup@test.com",
        "full_name": "Dup2",
        "password": "secure456",
    })
    assert r.status_code == 400


def test_login_success(client):
    client.post("/api/v1/auth/register", json={
        "email": "login@test.com",
        "full_name": "Login User",
        "password": "pass123",
    })
    r = client.post("/api/v1/auth/login", json={
        "email": "login@test.com",
        "password": "pass123",
    })
    assert r.status_code == 200
    assert "access_token" in r.cookies


def test_login_bad_password(client):
    r = client.post("/api/v1/auth/login", json={
        "email": "login@test.com",
        "password": "wrong",
    })
    assert r.status_code == 401


def test_me_unauthenticated(client):
    r = client.get("/api/v1/auth/me")
    assert r.status_code == 401


# ── Assessment ──────────────────────────────────────────────

VALID_ASSESSMENT = {
    "venue": "Test Stadium",
    "event_type": "Concert",
    "crowd_size": 8000,
    "venue_capacity": 10000,
    "weather": "Rain",
    "temperature_c": 28,
    "previous_incidents": 3,
    "holiday": False,
    "time_slot": "Evening",
    "day_of_week": "Saturday",
}


def test_create_assessment_unauthenticated(client):
    r = client.post("/api/v1/assessments", json=VALID_ASSESSMENT)
    assert r.status_code == 401


def test_create_assessment(auth_client):
    r = auth_client.post("/api/v1/assessments", json=VALID_ASSESSMENT)
    assert r.status_code == 201
    data = r.json()
    assert data["venue"] == "Test Stadium"
    assert data["risk_level"] in ["Low", "Medium", "High", "Critical"]
    assert 0 <= data["risk_score"] <= 100
    assert data["security_personnel"] >= 2
    assert data["id"] > 0


def test_create_assessment_invalid_crowd(auth_client):
    bad = {**VALID_ASSESSMENT, "crowd_size": -100}
    r = auth_client.post("/api/v1/assessments", json=bad)
    assert r.status_code == 422


def test_create_assessment_invalid_weather(auth_client):
    bad = {**VALID_ASSESSMENT, "weather": "Tornado"}
    r = auth_client.post("/api/v1/assessments", json=bad)
    assert r.status_code == 422


def test_create_assessment_invalid_capacity(auth_client):
    bad = {**VALID_ASSESSMENT, "venue_capacity": 0}
    r = auth_client.post("/api/v1/assessments", json=bad)
    assert r.status_code == 422


def test_list_assessments(auth_client):
    r = auth_client.get("/api/v1/assessments")
    assert r.status_code == 200
    data = r.json()
    assert "items" in data
    assert "total" in data
    assert data["total"] >= 1


def test_get_assessment(auth_client):
    # Create one first
    create_r = auth_client.post("/api/v1/assessments", json=VALID_ASSESSMENT)
    aid = create_r.json()["id"]
    r = auth_client.get(f"/api/v1/assessments/{aid}")
    assert r.status_code == 200
    assert r.json()["id"] == aid


def test_assessment_resources(auth_client):
    create_r = auth_client.post("/api/v1/assessments", json=VALID_ASSESSMENT)
    aid = create_r.json()["id"]
    r = auth_client.get(f"/api/v1/assessments/{aid}/resources")
    assert r.status_code == 200
    data = r.json()
    assert "resources" in data
    assert "methodology" in data
    assert "disclaimer" in data


# ── Dashboard ───────────────────────────────────────────────

def test_dashboard_summary(auth_client):
    r = auth_client.get("/api/v1/dashboard/summary")
    assert r.status_code == 200
    data = r.json()
    assert "total_assessments" in data
    assert data["total_assessments"] >= 0


def test_dashboard_trends(auth_client):
    r = auth_client.get("/api/v1/dashboard/trends?days=30")
    assert r.status_code == 200
    data = r.json()
    assert "trends" in data
    assert "risk_distribution" in data
    assert "recent_assessments" in data


# ── Resource Planning ───────────────────────────────────────

def test_resource_plan(auth_client):
    r = auth_client.post("/api/v1/resource-plans", json={
        "risk_level": "High",
        "crowd_size": 5000,
        "venue_capacity": 8000,
    })
    assert r.status_code == 200
    data = r.json()
    assert data["resources"]["security_personnel"] >= 2
    assert data["resources"]["police_units"] >= 1


# ── Reports ─────────────────────────────────────────────────

def test_report_summary(auth_client):
    r = auth_client.get("/api/v1/reports/summary")
    assert r.status_code == 200
    data = r.json()
    assert "total" in data
    assert "by_risk" in data


# ── Export ──────────────────────────────────────────────────

def test_export_csv(auth_client):
    r = auth_client.get("/api/v1/assessments/export")
    assert r.status_code == 200
    assert "text/csv" in r.headers.get("content-type", "")


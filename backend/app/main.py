"""SafeAI — FastAPI application entry point."""

import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.security import hash_password
from app.db.session import Base, engine, SessionLocal
from app.models.models import User
from app.ml.service import ml_service
from app.api.v1.router import router as v1_router
from app.schemas.schemas import HealthResponse

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
logger = logging.getLogger("safeai")


def _init_db():
    """Create tables (for SQLite dev). In production, use Alembic migrations."""
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables ensured")


def _seed_admin():
    """Create the initial admin account if no users exist."""
    db = SessionLocal()
    try:
        if db.query(User).count() == 0:
            admin = User(
                email=settings.INIT_ADMIN_EMAIL,
                full_name="SafeAI Admin",
                hashed_password=hash_password(settings.INIT_ADMIN_PASSWORD),
                role="admin",
            )
            db.add(admin)
            db.commit()
            logger.info("Initial admin account created: %s", settings.INIT_ADMIN_EMAIL)
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown lifecycle."""
    # Startup
    _init_db()
    try:
        ml_service.load()
        logger.info("ML model loaded: version=%s", ml_service.version)
    except Exception as e:
        logger.error("Failed to load ML model: %s", e)
    yield
    # Shutdown
    logger.info("SafeAI shutting down")


app = FastAPI(
    title="SafeAI API",
    description="Intelligent Public Safety Risk Prediction and Resource Allocation",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health endpoint (no auth required)
@app.get("/api/v1/health", response_model=HealthResponse, tags=["System"])
def health():
    return HealthResponse(status="ok", service="SafeAI", version="2.0.0")


# Mount v1 API
app.include_router(v1_router)

# Mount production React build if dist exists
FRONTEND_CANDIDATES = [
    Path(__file__).resolve().parents[2] / "frontend" / "dist",
    Path(__file__).resolve().parents[1] / "frontend" / "dist",
    Path("frontend/dist").resolve(),
    Path("../frontend/dist").resolve(),
]
FRONTEND_DIST = next((p for p in FRONTEND_CANDIDATES if p.exists() and (p / "index.html").exists()), None)

if FRONTEND_DIST:
    logger.info("Serving static frontend from: %s", FRONTEND_DIST)
    assets_dir = FRONTEND_DIST / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        if full_path.startswith("api/") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            return None
        file_path = FRONTEND_DIST / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(FRONTEND_DIST / "index.html")
else:
    logger.warning("No compiled frontend/dist directory found. API endpoints will serve normally.")

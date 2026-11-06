"""SafeAI core configuration — loaded from environment variables."""

from pathlib import Path
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "SafeAI"
    APP_ENV: str = "development"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str = "sqlite:///./safeai_new.db"

    # Auth
    SECRET_KEY: str = "change-me-to-a-random-secret-key-at-least-32-chars"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    ALGORITHM: str = "HS256"

    # CORS
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    # ML
    MODEL_PATH: str = "../ml/model/model.joblib"

    # Initial admin
    INIT_ADMIN_EMAIL: str = "admin@safeai.local"
    INIT_ADMIN_PASSWORD: str = "admin123"

    # Supabase Auth
    SUPABASE_URL: str = "https://plnycngtqohraelhgoll.supabase.co"
    SUPABASE_KEY: str = "sb_publishable_txaUxbzHMRtD0EwsB5eVqA_G6izB5p_"
    VITE_SUPABASE_URL: str = ""
    VITE_SUPABASE_PUBLISHABLE_KEY: str = ""
    SUPABASE_JWT_SECRET: str = ""

    @property
    def normalized_supabase_url(self) -> str:
        raw = self.SUPABASE_URL or self.VITE_SUPABASE_URL or "https://plnycngtqohraelhgoll.supabase.co"
        return raw.replace("/rest/v1/", "").replace("/rest/v1", "").rstrip("/")

    @property
    def normalized_supabase_key(self) -> str:
        return (self.SUPABASE_KEY or self.VITE_SUPABASE_PUBLISHABLE_KEY or "sb_publishable_txaUxbzHMRtD0EwsB5eVqA_G6izB5p_").strip()

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    @property
    def is_sqlite(self) -> bool:
        return self.DATABASE_URL.startswith("sqlite")

    model_config = {"env_file": [".env", "../.env"], "env_file_encoding": "utf-8", "extra": "ignore"}


settings = Settings()


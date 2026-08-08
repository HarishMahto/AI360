"""
AI360 Backend – Application Configuration
All settings are loaded from environment variables with defaults for development.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from functools import lru_cache
from typing import List


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ─── App ──────────────────────────────────────────────────────────────────
    app_name: str = "AI360 API"
    app_version: str = "1.0.0"
    environment: str = Field(default="development", alias="PYTHON_ENV")
    log_level: str = "INFO"
    backend_host: str = "0.0.0.0"
    backend_port: int = 8000
    backend_cors_origins: str = "http://localhost:5173,http://localhost:3000,https://ai360-c1b0b.web.app,https://ai360-c1b0b.firebaseapp.com"

    @property
    def cors_origins(self) -> List[str]:
        return [o.strip() for o in self.backend_cors_origins.split(",")]

    # ─── Firebase Admin SDK ────────────────────────────────────────────────────
    firebase_project_id: str = Field(default="ai360-c1b0b", alias="FIREBASE_PROJECT_ID")
    firebase_private_key_id: str = Field(default="", alias="FIREBASE_PRIVATE_KEY_ID")
    firebase_private_key: str = Field(default="", alias="FIREBASE_PRIVATE_KEY")
    firebase_client_email: str = Field(default="", alias="FIREBASE_CLIENT_EMAIL")
    firebase_client_id: str = Field(default="", alias="FIREBASE_CLIENT_ID")

    # ─── JWT ──────────────────────────────────────────────────────────────────
    jwt_secret_key: str = Field(default="dev-secret-key-change-in-production", alias="JWT_SECRET_KEY")
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 1440  # 24 hours

    # ─── AI Providers ─────────────────────────────────────────────────────────
    openai_api_key: str = Field(default="", alias="OPENAI_API_KEY")
    gemini_api_key: str = Field(default="", alias="GEMINI_API_KEY")
    anthropic_api_key: str = Field(default="", alias="ANTHROPIC_API_KEY")

    # ─── Email ────────────────────────────────────────────────────────────────
    email_provider: str = "resend"
    email_api_key: str = Field(default="", alias="EMAIL_API_KEY")
    email_from: str = Field(default="noreply@ai360.app", alias="EMAIL_FROM")


@lru_cache
def get_settings() -> Settings:
    """Return cached settings instance."""
    return Settings()

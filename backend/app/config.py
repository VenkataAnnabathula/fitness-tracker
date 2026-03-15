"""
Central configuration loaded from environment variables.
All secrets must live in .env — never hardcoded here.
"""
from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # ── Database ─────────────────────────────────────────────────────────────
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/fitness_tracker"

    # ── LLM (LiteLLM) ────────────────────────────────────────────────────────
    LLM_MODEL: str = "ollama/qwen3:8b"
    OLLAMA_API_BASE: str = "http://localhost:11434"
    GROQ_API_KEY: str = ""

    # ── CORS ─────────────────────────────────────────────────────────────────
    ALLOWED_ORIGINS: str = "http://localhost:3000"

    # ── App ──────────────────────────────────────────────────────────────────
    DEFAULT_USER_ID: int = 1
    PORT: int = 8000

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()

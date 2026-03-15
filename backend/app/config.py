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
    # LiteLLM model string format: "provider/model-name"
    LLM_MODEL: str = "ollama/qwen3:8b"
    OLLAMA_API_BASE: str = "http://localhost:11434"

    # ── App ──────────────────────────────────────────────────────────────────
    # Single-user POC: all requests default to user_id=1
    DEFAULT_USER_ID: int = 1

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()

from __future__ import annotations

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "Aline"
    DEBUG: bool = False

    DATABASE_URL: str = "postgresql+asyncpg://aline:aline@localhost:5432/aline"
    DATABASE_URL_SYNC: str = "postgresql://aline:aline@localhost:5432/aline"

    REDIS_URL: str = "redis://localhost:6379/0"

    QDRANT_URL: str = ""
    QDRANT_API_KEY: str = ""
    QDRANT_HOST: str = "localhost"
    QDRANT_PORT: int = 6333

    GITHUB_TOKEN: str = ""

    PROXYCURL_API_KEY: str = ""

    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    JWT_SECRET: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 1440

    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    SPACY_MODEL: str = "en_core_web_sm"

    SEARCH_MAX_RAW_PROFILES: int = 50
    SEARCH_MIN_ACTIVITY_MONTHS: int = 12

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()

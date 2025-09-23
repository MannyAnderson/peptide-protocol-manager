"""Application settings and environment configuration.

This module defines a ``Settings`` class that reads configuration from
environment variables (like keys and URLs) using Pydantic's settings helper.

If you're new:
- We keep secrets (API keys) out of code. They are read from a ``.env`` file
  during local development, or injected by the hosting platform in prod.
- ``lru_cache`` is used so we only create and parse the settings once.
"""
from functools import lru_cache
from typing import List

from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Type-safe config values read from environment variables.

    Each attribute corresponds to an env var (e.g. ``SUPABASE_URL``). Defaults
    are provided where reasonable. Update your ``.env`` file to change values.
    """
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    PROJECT_NAME: str = "Peptide & Supplement Protocol Manager"
    PROJECT_VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"

    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] | List[str] = [
        "http://localhost:3000",
        "http://localhost:19006",
        "http://localhost:8081",
        "http://127.0.0.1:3000",
    ]

    SUPABASE_URL: str | None = None
    SUPABASE_ANON_KEY: str | None = None
    SUPABASE_SERVICE_ROLE_KEY: str | None = None
    OPENAI_API_KEY: str | None = None
    JWT_SECRET_KEY: str | None = None

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v):
        """Allow CORS origins to be specified as a JSON list or comma string.

        Beginners: this lets you set either
        - ``BACKEND_CORS_ORIGINS=["http://localhost:3000"]`` (JSON list), or
        - ``BACKEND_CORS_ORIGINS=http://localhost:3000,http://localhost:8081``
          (comma separated string).
        """
        if isinstance(v, str):
            if v.strip() == "":
                return []
            if v.startswith("[") and v.endswith("]"):
                # JSON list string
                import json

                return json.loads(v)
            return [o.strip() for o in v.split(",")]
        return v


@lru_cache
def get_settings() -> Settings:
    """Return a cached ``Settings`` instance.

    Using a cache ensures we parse env only once and reuse the same object.
    """
    # 1) Construct settings from environment variables
    settings = Settings()
    # 2) Return the cached instance
    return settings



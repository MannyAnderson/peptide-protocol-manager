from functools import lru_cache
from typing import List

from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
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
    return Settings()



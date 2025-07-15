from typing import Any, Dict, List, Optional

from pydantic import AnyHttpUrl, PostgresDsn, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "EDC - Electronic Data Capture API"
    
    # Environment settings
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # CORS settings
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    def assemble_cors_origins(cls, v: str | List[str]) -> List[AnyHttpUrl]:
        if isinstance(v, str) and not v.startswith("["):
            return [AnyHttpUrl(origin) for origin in v.split(",")]
        elif isinstance(v, (list, str)):
            return [AnyHttpUrl(origin) for origin in v]
        raise ValueError(v)

    # Database settings (optional for testing)
    DATABASE_URL: Optional[PostgresDsn] = None
    
    # JWT secret for local authentication
    JWT_SECRET: str = "your-secret-key-here-replace-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Pagination defaults
    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)


settings = Settings()
from typing import List, Optional, Union

from pydantic import AnyHttpUrl, PostgresDsn, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    API_PREFIX: str = "/api"
    DEBUG: bool = False
    
    # CORS settings
    ALLOWED_ORIGINS: List[AnyHttpUrl] = []

    @field_validator("ALLOWED_ORIGINS", mode="before")
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[AnyHttpUrl]:
        if isinstance(v, str) and not v.startswith("["):
            return [AnyHttpUrl(origin) for origin in v.split(",")]
        elif isinstance(v, (list, str)):
            return [AnyHttpUrl(origin) for origin in v]
        raise ValueError(v)

    # Database settings
    DATABASE_URL: PostgresDsn
    
    # JWT secret for local authentication
    JWT_SECRET: str = "your-secret-key-here"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Pagination defaults
    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)


settings = Settings()
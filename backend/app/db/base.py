from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from typing import Optional

from app.core.config import settings

# Base declarative class - will be used in unified_models.py
Base = declarative_base()

# Only create database connection if DATABASE_URL is provided
engine: Optional[create_async_engine] = None
AsyncSessionLocal: Optional[sessionmaker] = None

if settings.DATABASE_URL:
    # Configure SSL for Neon database
    connect_args = {}
    if "neon" in str(settings.DATABASE_URL):
        # For Neon PostgreSQL, use SSL
        connect_args = {
            "ssl": "require",
            "server_settings": {"jit": "off"}
        }

    # Create engine with SSL configuration for production
    engine = create_async_engine(
        str(settings.DATABASE_URL),
        echo=settings.DEBUG,
        future=True,
        pool_pre_ping=True,
        pool_recycle=300,
        connect_args=connect_args
    )

    AsyncSessionLocal = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False, autoflush=False
    )
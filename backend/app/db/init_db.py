import asyncio
import logging
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base import Base, engine
from app.db.session import AsyncSessionLocal

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def init_db() -> None:
    """
    Initialize database tables
    """
    try:
        # Create tables
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        raise


async def main() -> None:
    """
    Main function to initialize database
    """
    logger.info("Initializing database")
    await init_db()
    logger.info("Database initialization completed")


if __name__ == "__main__":
    asyncio.run(main())
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base import AsyncSessionLocal


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency for getting async database session.
    Returns None if no database is configured.
    """
    if AsyncSessionLocal is None:
        # Return a mock session for testing without database
        yield None
        return
        
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
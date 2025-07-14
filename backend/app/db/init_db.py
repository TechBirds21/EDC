import asyncio
import logging
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.base import Base, engine
from app.db.session import AsyncSessionLocal
from app.models.unified_models import User, UserRole, UserStatus
from app.core.security import get_password_hash

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def create_test_users(db: AsyncSession) -> None:
    """
    Create test users with different roles
    """
    test_users = [
        {
            "email": "superadmin@edc.com",
            "password": "SuperAdmin123!",
            "first_name": "Super",
            "last_name": "Admin",
            "role": UserRole.SUPER_ADMIN
        },
        {
            "email": "admin@edc.com", 
            "password": "Admin123!",
            "first_name": "Admin",
            "last_name": "User",
            "role": UserRole.ADMIN
        },
        {
            "email": "employee@edc.com",
            "password": "Employee123!",
            "first_name": "Employee",
            "last_name": "User", 
            "role": UserRole.EMPLOYEE
        }
    ]
    
    for user_data in test_users:
        # Check if user already exists
        result = await db.execute(
            select(User).where(User.email == user_data["email"])
        )
        existing_user = result.scalar_one_or_none()
        
        if not existing_user:
            user = User(
                email=user_data["email"],
                hashed_password=get_password_hash(user_data["password"]),
                first_name=user_data["first_name"],
                last_name=user_data["last_name"],
                role=user_data["role"],
                status=UserStatus.ACTIVE
            )
            db.add(user)
            logger.info(f"Created test user: {user_data['email']} ({user_data['role']})")
        else:
            logger.info(f"Test user already exists: {user_data['email']}")
    
    await db.commit()


async def init_db() -> None:
    """
    Initialize database tables and seed data
    """
    try:
        # Create tables
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        
        logger.info("Database tables created successfully")
        
        # Create test users
        async with AsyncSessionLocal() as db:
            await create_test_users(db)
        
        logger.info("Test users created successfully")
        
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
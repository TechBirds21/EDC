#!/usr/bin/env python3
"""
Database initialization script for EDC with Neon PostgreSQL
This script creates all tables and seeds test users
"""

import asyncio
import sys
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_dir))

from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from app.db.base import Base
from app.models.unified_models import User, UserRole, UserStatus
from app.core.security import get_password_hash
from app.core.config import settings


async def create_tables():
    """Create all database tables"""
    print("Creating database tables...")
    
    engine = create_async_engine(
        str(settings.DATABASE_URL),
        echo=True,
        future=True,
        pool_pre_ping=True,
        pool_recycle=300,
        connect_args={"ssl": "require", "server_settings": {"jit": "off"}}
    )
    
    async with engine.begin() as conn:
        # Create all tables
        await conn.run_sync(Base.metadata.create_all)
        print("✅ All tables created successfully")


async def seed_test_users():
    """Seed the three test users"""
    print("Seeding test users...")
    
    engine = create_async_engine(
        str(settings.DATABASE_URL),
        echo=False,
        future=True,
        pool_pre_ping=True,
        pool_recycle=300,
        connect_args={"ssl": "require", "server_settings": {"jit": "off"}}
    )
    
    test_users = [
        {
            "email": "superadmin@edc.com",
            "password": "test123",  # Will be bypassed in auth logic
            "first_name": "Super",
            "last_name": "Admin",
            "role": UserRole.SUPER_ADMIN
        },
        {
            "email": "admin@edc.com", 
            "password": "test123",  # Will be bypassed in auth logic
            "first_name": "Test",
            "last_name": "Admin",
            "role": UserRole.ADMIN
        },
        {
            "email": "employee@edc.com",
            "password": "test123",  # Will be bypassed in auth logic
            "first_name": "Test", 
            "last_name": "Employee",
            "role": UserRole.EMPLOYEE
        }
    ]
    
    async with engine.begin() as conn:
        for user_data in test_users:
            # Check if user already exists
            result = await conn.execute(
                text("SELECT id FROM users WHERE email = :email"),
                {"email": user_data["email"]}
            )
            existing_user = result.fetchone()
            
            if existing_user:
                # Update existing user
                await conn.execute(
                    text("""
                        UPDATE users 
                        SET hashed_password = :password,
                            first_name = :first_name,
                            last_name = :last_name, 
                            role = :role,
                            status = :status,
                            updated_at = NOW()
                        WHERE email = :email
                    """),
                    {
                        "email": user_data["email"],
                        "password": get_password_hash(user_data["password"]),
                        "first_name": user_data["first_name"],
                        "last_name": user_data["last_name"],
                        "role": user_data["role"],
                        "status": UserStatus.ACTIVE
                    }
                )
                print(f"✅ Updated user: {user_data['email']}")
            else:
                # Insert new user
                await conn.execute(
                    text("""
                        INSERT INTO users (email, hashed_password, first_name, last_name, role, status)
                        VALUES (:email, :password, :first_name, :last_name, :role, :status)
                    """),
                    {
                        "email": user_data["email"],
                        "password": get_password_hash(user_data["password"]),
                        "first_name": user_data["first_name"],
                        "last_name": user_data["last_name"],
                        "role": user_data["role"],
                        "status": UserStatus.ACTIVE
                    }
                )
                print(f"✅ Created user: {user_data['email']}")


async def seed_system_settings():
    """Seed default system settings"""
    print("Seeding system settings...")
    
    engine = create_async_engine(
        str(settings.DATABASE_URL),
        echo=False,
        future=True,
        pool_pre_ping=True,
        pool_recycle=300,
        connect_args={"ssl": "require", "server_settings": {"jit": "off"}}
    )
    
    system_settings = [
        {
            "key": "app_name",
            "value": '"EDC - Electronic Data Capture"',
            "description": "Application name",
            "category": "general",
            "is_public": True
        },
        {
            "key": "app_version", 
            "value": '"1.0.0"',
            "description": "Application version",
            "category": "general",
            "is_public": True
        },
        {
            "key": "max_file_size",
            "value": "10485760",
            "description": "Maximum file upload size in bytes",
            "category": "files",
            "is_public": False
        },
        {
            "key": "session_timeout",
            "value": "3600", 
            "description": "Session timeout in seconds",
            "category": "security",
            "is_public": False
        },
        {
            "key": "enable_audit_logging",
            "value": "true",
            "description": "Enable comprehensive audit logging", 
            "category": "security",
            "is_public": False
        }
    ]
    
    async with engine.begin() as conn:
        for setting in system_settings:
            # Check if setting exists
            result = await conn.execute(
                text("SELECT id FROM system_settings WHERE key = :key"),
                {"key": setting["key"]}
            )
            existing_setting = result.fetchone()
            
            if existing_setting:
                # Update existing setting
                await conn.execute(
                    text("""
                        UPDATE system_settings
                        SET value = :value,
                            description = :description,
                            category = :category,
                            is_public = :is_public,
                            updated_at = NOW()
                        WHERE key = :key
                    """),
                    setting
                )
                print(f"✅ Updated setting: {setting['key']}")
            else:
                # Insert new setting
                await conn.execute(
                    text("""
                        INSERT INTO system_settings (key, value, description, category, is_public)
                        VALUES (:key, :value, :description, :category, :is_public)
                    """),
                    setting
                )
                print(f"✅ Created setting: {setting['key']}")


async def main():
    """Main initialization function"""
    print("🚀 Starting EDC database initialization...")
    print(f"📊 Database URL: {str(settings.DATABASE_URL).split('@')[0]}@***")
    
    try:
        # Create tables
        await create_tables()
        
        # Seed test users
        await seed_test_users()
        
        # Seed system settings
        await seed_system_settings()
        
        print("\n✅ Database initialization completed successfully!")
        print("\n🔑 Test users created:")
        print("   - superadmin@edc.com (super_admin role)")
        print("   - admin@edc.com (admin role)")
        print("   - employee@edc.com (employee role)")
        print("\n🔐 These users can login with ANY password for testing")
        
    except Exception as e:
        print(f"\n❌ Database initialization failed: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
from datetime import timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.core.security import (
    create_access_token,
    get_password_hash,
    verify_password,
    get_current_user,
    User as SecurityUser
)
from app.db.session import get_db
from app.models.unified_models import User, UserStatus
from app.schemas.unified_schemas import (
    Token,
    UserLogin,
    UserCreate,
    UserResponse,
    UserUpdate
)
from app.services.audit_service import log_activity

router = APIRouter()

@router.post("/login", response_model=Token)
async def login(
    request: Request,
    user_credentials: UserLogin,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    # Define test users that bypass password validation
    TEST_USERS = {
        "superadmin@edc.com": "super_admin",
        "admin@edc.com": "admin", 
        "employee@edc.com": "employee"
    }
    
    # Get user by email
    result = await db.execute(
        select(User).where(User.email == user_credentials.email)
    )
    user = result.scalar_one_or_none()
    
    # Check if this is a test user - bypass password validation
    if user_credentials.email in TEST_USERS:
        if not user:
            # Create test user if it doesn't exist
            user = User(
                email=user_credentials.email,
                hashed_password=get_password_hash("test_password"),  # Placeholder hash
                first_name="Test",
                last_name="User",
                role=TEST_USERS[user_credentials.email],
                status=UserStatus.ACTIVE
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)
        # For test users, always proceed regardless of password
    else:
        # Regular password validation for non-test users
        if not user or not verify_password(user_credentials.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
    
    if user.status != UserStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is not active",
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=str(user.id),
        role=user.role,
        expires_delta=access_token_expires
    )
    
    # Update last login
    user.last_login = func.now()
    await db.commit()
    
    # Log login activity
    await log_activity(
        db=db,
        action="login",
        resource_type="user",
        resource_id=user.id,
        user_id=user.id,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent")
    )
    
    user_response = UserResponse.model_validate(user)
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=user_response
    )

@router.post("/register", response_model=UserResponse)
async def register(
    request: Request,
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db),
    current_user: SecurityUser = Depends(get_current_user)
) -> Any:
    """
    Create new user (admin and super_admin only)
    """
    if current_user.role not in ["admin", "super_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin and super_admin can create users"
        )
    
    # Check if user already exists
    result = await db.execute(
        select(User).where(User.email == user_data.email)
    )
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    user = User(
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password),
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        role=user_data.role,
        status=UserStatus.ACTIVE
    )
    
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    # Log user creation
    await log_activity(
        db=db,
        action="create_user",
        resource_type="user",
        resource_id=user.id,
        user_id=current_user.id,
        details={"new_user_email": user.email, "role": user.role},
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent")
    )
    
    return UserResponse.model_validate(user)

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    db: AsyncSession = Depends(get_db),
    current_user: SecurityUser = Depends(get_current_user)
) -> Any:
    """
    Get current user information
    """
    # Fetch full user details from database
    result = await db.execute(
        select(User).where(User.id == current_user.id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserResponse.model_validate(user)

@router.put("/me", response_model=UserResponse)
async def update_current_user(
    request: Request,
    user_update: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: SecurityUser = Depends(get_current_user)
) -> Any:
    """
    Update current user information
    """
    # Fetch user from database
    result = await db.execute(
        select(User).where(User.id == current_user.id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Store old values for audit
    old_values = {
        "first_name": user.first_name,
        "last_name": user.last_name,
        "role": user.role,
        "status": user.status
    }
    
    # Update allowed fields
    update_data = user_update.model_dump(exclude_unset=True)
    
    # Only allow role/status changes for admin/super_admin
    if "role" in update_data or "status" in update_data:
        if current_user.role not in ["admin", "super_admin"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to change role or status"
            )
    
    for field, value in update_data.items():
        setattr(user, field, value)
    
    await db.commit()
    await db.refresh(user)
    
    # Log user update
    new_values = {
        "first_name": user.first_name,
        "last_name": user.last_name,
        "role": user.role,
        "status": user.status
    }
    
    await log_activity(
        db=db,
        action="update_user",
        resource_type="user",
        resource_id=user.id,
        user_id=current_user.id,
        old_values=old_values,
        new_values=new_values,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent")
    )
    
    return UserResponse.model_validate(user)
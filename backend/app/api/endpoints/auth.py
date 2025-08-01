from datetime import timedelta
from typing import Any

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from app.core.config import settings
from app.core.security import create_access_token

# Test users configuration
TEST_USERS = {
    "superadmin@edc.com": {"role": "super_admin", "name": "Super Admin"},
    "admin@edc.com": {"role": "admin", "name": "Admin User"},
    "employee@edc.com": {"role": "employee", "name": "Employee User"},
}

router = APIRouter()


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: str
    email: str
    role: str
    first_name: str = ""
    last_name: str = ""


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


@router.post("/login", response_model=Token)
async def login(user_credentials: UserLogin) -> Any:
    """
    Login endpoint that bypasses password checks for test users.
    """
    email = user_credentials.email.lower().strip()
    
    # Check if it's a test user
    if email in TEST_USERS:
        # For test users, any password works
        user_info = TEST_USERS[email]
        
        # Create access token
        access_token = create_access_token(
            email=email,
            role=user_info["role"]
        )
        
        user_response = UserResponse(
            id=email.replace("@", "_").replace(".", "_"),
            email=email,
            role=user_info["role"],
            first_name=user_info["name"].split()[0],
            last_name=user_info["name"].split()[-1] if len(user_info["name"].split()) > 1 else ""
        )
        
        return Token(
            access_token=access_token,
            token_type="bearer",
            user=user_response
        )
    
    # For non-test users, reject for now
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid credentials. Only test accounts are supported.",
    )


@router.post("/logout")
async def logout() -> Any:
    """
    Logout endpoint - for JWT tokens, logout is handled client-side.
    """
    return {"message": "Successfully logged out"}


@router.get("/me")
async def get_current_user_info() -> Any:
    """
    Get current user info - placeholder for now.
    """
    return {"message": "User info endpoint"}

router = APIRouter()
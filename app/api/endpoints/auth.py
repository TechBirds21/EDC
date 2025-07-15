from datetime import timedelta
from typing import Any

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from app.core.config import settings
from app.core.security import TEST_USERS, create_access_token

router = APIRouter()


class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict


@router.post("/login", response_model=LoginResponse)
async def login(login_data: LoginRequest) -> Any:
    """
    Login endpoint that bypasses password checks for test users.
    """
    email = login_data.email.lower().strip()
    
    # Check if it's a test user
    if email in TEST_USERS:
        # For test users, any password works
        user_info = TEST_USERS[email]
        
        # Create access token
        access_token = create_access_token(
            email=email,
            role=user_info["role"]
        )
        
        return LoginResponse(
            access_token=access_token,
            token_type="bearer",
            user={
                "id": email.replace("@", "_").replace(".", "_"),
                "email": email,
                "role": user_info["role"],
                "name": user_info["name"]
            }
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
from datetime import datetime, timedelta
from typing import Any, Dict, Optional

import httpx
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from pydantic import BaseModel, Field

from app.core.config import settings


# Test users configuration
TEST_USERS = {
    "superadmin@edc.com": {"role": "super_admin", "name": "Super Admin"},
    "admin@edc.com": {"role": "admin", "name": "Admin User"},
    "employee@edc.com": {"role": "employee", "name": "Employee User"},
}


class TokenPayload(BaseModel):
    sub: str = Field(..., description="Subject (user ID)")
    role: Optional[str] = Field(None, description="User role")
    exp: Optional[int] = Field(None, description="Expiration timestamp")


class User(BaseModel):
    id: str
    role: str


class SimpleAuth(HTTPBearer):
    async def __call__(
        self, request: Request
    ) -> Optional[HTTPAuthorizationCredentials]:
        credentials = await super().__call__(request)
        
        if not credentials:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Could not validate credentials",
            )
            
        if not credentials.scheme == "Bearer":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid authentication scheme",
            )
            
        try:
            # Try to decode JWT token
            payload = jwt.decode(
                credentials.credentials,
                settings.JWT_SECRET,
                algorithms=[settings.JWT_ALGORITHM],
            )
            
            # Extract user ID and role
            user_id = payload.get("sub")
            user_email = payload.get("email")
            user_role = payload.get("role", "employee")
            
            if not user_id:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token",
                )
            
            # Store user info in request state
            request.state.user = User(id=user_id, role=user_role)
            
            return credentials
                
        except JWTError as e:
            # For test users, check if it's a test email
            try:
                # Try to extract email from a simple format
                email = credentials.credentials
                if email in TEST_USERS:
                    # Create a fake user for test accounts
                    request.state.user = User(
                        id=email.replace("@", "_").replace(".", "_"),
                        role=TEST_USERS[email]["role"]
                    )
                    return credentials
            except:
                pass
                
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Could not validate credentials: {str(e)}",
            )


def create_access_token(email: str, role: str, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token for a user."""
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.JWT_EXPIRE_MINUTES)
    
    to_encode = {
        "sub": email.replace("@", "_").replace(".", "_"),
        "email": email,
        "role": role,
        "exp": expire
    }
    
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt


def get_current_user(request: Request) -> User:
    """Get the current user from the request state."""
    if not hasattr(request.state, 'user'):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )
    return request.state.user


def get_admin_user(user: User = Depends(get_current_user)) -> User:
    if user.role not in ["admin", "super_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions",
        )
    return user


def get_super_admin_user(user: User = Depends(get_current_user)) -> User:
    if user.role != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions",
        )
    return user


# Auth dependency - require authentication for protected routes
auth_required = Depends(SimpleAuth())
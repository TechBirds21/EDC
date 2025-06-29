from datetime import datetime
from typing import Any, Dict, Optional

import httpx
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from pydantic import BaseModel, Field

from app.core.config import settings


class TokenPayload(BaseModel):
    sub: str = Field(..., description="Subject (user ID)")
    role: Optional[str] = Field(None, description="User role")
    exp: Optional[int] = Field(None, description="Expiration timestamp")


class User(BaseModel):
    id: str
    role: str


class SupabaseAuth(HTTPBearer):
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
            # Verify JWT with Supabase JWT secret
            payload = jwt.decode(
                credentials.credentials,
                settings.SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
            )
            
            # Extract user ID and role
            user_id = payload.get("sub")
            user_role = payload.get("role", "user")
            
            if not user_id:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token",
                )
            
            # Store user info in request state
            request.state.user = User(id=user_id, role=user_role)
            
            return credentials
                
        except JWTError as e:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Could not validate credentials: {str(e)}",
            )


def get_current_user(request: Request) -> User:
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
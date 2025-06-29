from datetime import datetime, timedelta
from typing import Any, Dict, Optional, Union

import httpx
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from pydantic import BaseModel

from app.core.config import settings


class TokenPayload(BaseModel):
    sub: Optional[str] = None
    exp: Optional[int] = None
    role: Optional[str] = None


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
            # Verify JWT with Supabase
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{settings.SUPABASE_URL}/auth/v1/user",
                    headers={
                        "Authorization": f"Bearer {credentials.credentials}",
                        "apikey": settings.SUPABASE_KEY,
                    },
                )
                
                if response.status_code != 200:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Invalid token",
                    )
                
                user_data = response.json()
                
                # Extract user ID and role
                user_id = user_data.get("id")
                user_role = user_data.get("app_metadata", {}).get("role", "user")
                
                # Store user info in request state
                request.state.user = User(id=user_id, role=user_role)
                
                return credentials
                
        except (JWTError, Exception) as e:
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
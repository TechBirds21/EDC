from datetime import datetime, timedelta
from typing import Any, Dict, Optional, Union

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class TokenPayload(BaseModel):
    sub: Optional[str] = None
    exp: Optional[int] = None
    role: Optional[str] = None


class User(BaseModel):
    id: str
    email: str
    role: str


def create_access_token(
    subject: Union[str, Any], expires_delta: timedelta = None
) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def decode_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
        )
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


class JWTAuth(HTTPBearer):
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
            payload = decode_token(credentials.credentials)
            if payload is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token",
                )
                
            user_id = payload.get("sub")
            if user_id is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token payload",
                )
                
            # For now, we'll create a basic user object
            # In production, you'd fetch user details from database
            request.state.user = User(
                id=user_id, 
                email=f"user_{user_id}@example.com",
                role="employee"  # Default role
            )
            
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
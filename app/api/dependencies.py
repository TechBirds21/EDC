from typing import Annotated, Optional

from fastapi import Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import User, get_current_user
from app.db.session import get_db


def get_pagination_params(
    page: Annotated[int, Query(ge=1)] = 1,
    size: Annotated[int, Query(ge=1, le=settings.MAX_PAGE_SIZE)] = settings.DEFAULT_PAGE_SIZE,
) -> tuple[int, int]:
    """
    Get pagination parameters with validation
    """
    return page, size


def get_current_user_id(current_user: User = Depends(get_current_user)) -> str:
    """
    Get the current user ID
    """
    return current_user.id


CommonDeps = Annotated[
    tuple[AsyncSession, str],
    Depends(
        lambda db: Depends(get_db),
        current_user_id: Depends(get_current_user_id),
    ),
]
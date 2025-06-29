from typing import Annotated, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Path, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_pagination_params
from app.core.security import User, get_current_user
from app.db.session import get_db
from app.schemas.change_log import ChangeLogPagination, ChangeLogResponse
from app.services import change_log as change_log_service
from app.services import form as form_service

router = APIRouter()


@router.get("/{form_id}", response_model=ChangeLogPagination)
async def list_changes(
    form_id: Annotated[UUID, Path(title="The ID of the form to get changes for")],
    db: AsyncSession = Depends(get_db),
    pagination: tuple[int, int] = Depends(get_pagination_params),
    current_user: User = Depends(get_current_user),
):
    """
    List change log entries for a form with pagination.
    """
    # Verify form exists
    form = await form_service.get_form(db=db, form_id=form_id)
    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Form not found"
        )
    
    page, size = pagination
    changes, total = await change_log_service.list_changes(
        db=db, form_id=form_id, page=page, size=size
    )
    
    # Calculate total pages
    pages = (total + size - 1) // size if size > 0 else 0
    
    return {
        "items": changes,
        "total": total,
        "page": page,
        "size": size,
        "pages": pages,
    }
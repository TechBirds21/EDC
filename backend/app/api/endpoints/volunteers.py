from typing import Annotated, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Path, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user_id, get_pagination_params
from app.core.security import User, get_current_user
from app.db.session import get_db
from app.schemas.volunteer import (
    VolunteerCreate,
    VolunteerPagination,
    VolunteerResponse,
    VolunteerUpdate,
)
from app.services import volunteer as volunteer_service

router = APIRouter()


@router.post(
    "/", response_model=VolunteerResponse, status_code=status.HTTP_201_CREATED
)
async def create_volunteer(
    volunteer_in: VolunteerCreate,
    db: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id),
):
    """
    Create a new volunteer.
    """
    volunteer = await volunteer_service.create_volunteer(
        db=db, obj_in=volunteer_in, created_by=UUID(current_user_id)
    )
    return volunteer


@router.get("/", response_model=VolunteerPagination)
async def list_volunteers(
    db: AsyncSession = Depends(get_db),
    pagination: tuple[int, int] = Depends(get_pagination_params),
    current_user: User = Depends(get_current_user),
):
    """
    List volunteers with pagination.
    """
    page, size = pagination
    volunteers, total = await volunteer_service.list_volunteers(
        db=db, page=page, size=size
    )
    
    # Calculate total pages
    pages = (total + size - 1) // size if size > 0 else 0
    
    return {
        "items": volunteers,
        "total": total,
        "page": page,
        "size": size,
        "pages": pages,
    }


@router.get("/{volunteer_id}", response_model=VolunteerResponse)
async def get_volunteer(
    volunteer_id: Annotated[UUID, Path(title="The ID of the volunteer to get")],
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get a specific volunteer by ID.
    """
    volunteer = await volunteer_service.get_volunteer(db=db, volunteer_id=volunteer_id)
    if not volunteer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Volunteer not found"
        )
    return volunteer


@router.patch("/{volunteer_id}", response_model=VolunteerResponse)
async def update_volunteer(
    volunteer_id: Annotated[UUID, Path(title="The ID of the volunteer to update")],
    volunteer_in: VolunteerUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update a volunteer.
    """
    volunteer = await volunteer_service.get_volunteer(db=db, volunteer_id=volunteer_id)
    if not volunteer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Volunteer not found"
        )
    
    updated_volunteer = await volunteer_service.update_volunteer(
        db=db, volunteer_id=volunteer_id, obj_in=volunteer_in
    )
    return updated_volunteer
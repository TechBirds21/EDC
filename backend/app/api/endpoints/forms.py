from typing import Annotated, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Path, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user_id, get_pagination_params
from app.core.security import User, get_current_user
from app.db.session import get_db
from app.schemas.form import (
    FormCreate,
    FormPagination,
    FormPatch,
    FormResponse,
    FormUpdate,
)
from app.services import form as form_service
from app.services import volunteer as volunteer_service

router = APIRouter()


@router.post(
    "/", response_model=FormResponse, status_code=status.HTTP_201_CREATED
)
async def create_form(
    form_in: FormCreate,
    db: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id),
):
    """
    Create a new form.
    """
    # Verify volunteer exists
    volunteer = await volunteer_service.get_volunteer(db=db, volunteer_id=form_in.volunteer_id)
    if not volunteer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Volunteer not found"
        )
    
    form = await form_service.create_form(
        db=db, obj_in=form_in, created_by=UUID(current_user_id)
    )
    return form


@router.get("/", response_model=FormPagination)
async def list_forms(
    volunteer_id: Optional[UUID] = None,
    template_id: Optional[UUID] = None,
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    pagination: tuple[int, int] = Depends(get_pagination_params),
    current_user: User = Depends(get_current_user),
):
    """
    List forms with optional filters and pagination.
    """
    page, size = pagination
    forms, total = await form_service.list_forms(
        db=db, 
        volunteer_id=volunteer_id,
        template_id=template_id,
        status=status,
        page=page, 
        size=size
    )
    
    # Calculate total pages
    pages = (total + size - 1) // size if size > 0 else 0
    
    return {
        "items": forms,
        "total": total,
        "page": page,
        "size": size,
        "pages": pages,
    }


@router.get("/{form_id}", response_model=FormResponse)
async def get_form(
    form_id: Annotated[UUID, Path(title="The ID of the form to get")],
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get a specific form by ID.
    """
    form = await form_service.get_form(db=db, form_id=form_id)
    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Form not found"
        )
    return form


@router.patch("/{form_id}", response_model=FormResponse)
async def update_form(
    form_id: Annotated[UUID, Path(title="The ID of the form to update")],
    form_in: FormUpdate,
    db: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id),
):
    """
    Update a form.
    """
    form = await form_service.get_form(db=db, form_id=form_id)
    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Form not found"
        )
    
    updated_form = await form_service.update_form(
        db=db, form_id=form_id, obj_in=form_in, updated_by=UUID(current_user_id)
    )
    return updated_form


@router.patch("/{form_id}/field", response_model=FormResponse)
async def patch_form_field(
    form_id: Annotated[UUID, Path(title="The ID of the form to patch")],
    patch_data: FormPatch,
    db: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id),
):
    """
    Update a specific field in a form and log the change.
    """
    form = await form_service.get_form(db=db, form_id=form_id)
    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Form not found"
        )
    
    # Ensure volunteer_id continuity
    if patch_data.field == "volunteer_id":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Cannot change volunteer_id"
        )
    
    # Validate date fields against volunteer.screening_date
    if form.volunteer and form.volunteer.screening_date:
        # This would validate date fields against the volunteer's screening date
        # Implementation depends on the structure of the form data
        pass
    
    updated_form = await form_service.patch_form_field(
        db=db, 
        form_id=form_id, 
        patch_data=patch_data, 
        changed_by=UUID(current_user_id)
    )
    return updated_form
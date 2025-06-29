from typing import Annotated, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Path, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user_id, get_pagination_params
from app.core.security import User, get_current_user
from app.db.session import get_db
from app.schemas.form_template import (
    FormTemplateCreate,
    FormTemplatePagination,
    FormTemplateResponse,
    FormTemplateUpdate,
)
from app.services import form_template as template_service

router = APIRouter()


@router.post(
    "/", response_model=FormTemplateResponse, status_code=status.HTTP_201_CREATED
)
async def create_template(
    template_in: FormTemplateCreate,
    db: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id),
):
    """
    Create a new form template.
    """
    template = await template_service.create_template(
        db=db, obj_in=template_in, created_by=UUID(current_user_id)
    )
    return template


@router.get("/", response_model=FormTemplatePagination)
async def list_templates(
    name: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    pagination: tuple[int, int] = Depends(get_pagination_params),
    current_user: User = Depends(get_current_user),
):
    """
    List form templates with optional name filter and pagination.
    """
    page, size = pagination
    templates, total = await template_service.list_templates(
        db=db, name=name, page=page, size=size
    )
    
    # Calculate total pages
    pages = (total + size - 1) // size if size > 0 else 0
    
    return {
        "items": templates,
        "total": total,
        "page": page,
        "size": size,
        "pages": pages,
    }


@router.get("/{template_id}", response_model=FormTemplateResponse)
async def get_template(
    template_id: Annotated[UUID, Path(title="The ID of the template to get")],
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get a specific form template by ID.
    """
    template = await template_service.get_template(db=db, template_id=template_id)
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Form template not found"
        )
    return template


@router.patch("/{template_id}", response_model=FormTemplateResponse)
async def update_template(
    template_id: Annotated[UUID, Path(title="The ID of the template to update")],
    template_in: FormTemplateUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update a form template.
    """
    template = await template_service.get_template(db=db, template_id=template_id)
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Form template not found"
        )
    
    updated_template = await template_service.update_template(
        db=db, template_id=template_id, obj_in=template_in
    )
    return updated_template


@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_template(
    template_id: Annotated[UUID, Path(title="The ID of the template to delete")],
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Delete a form template.
    """
    template = await template_service.get_template(db=db, template_id=template_id)
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Form template not found"
        )
    
    success = await template_service.delete_template(db=db, template_id=template_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Failed to delete template"
        )
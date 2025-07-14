from typing import Any, List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from sqlalchemy.orm import selectinload

from app.core.security import get_current_user, get_admin_user, User as SecurityUser
from app.db.session import get_db
from app.models.unified_models import Form, Project, FormStatus, FormType
from app.schemas.unified_schemas import (
    FormCreate,
    FormUpdate,
    FormSubmit,
    FormApproval,
    FormResponse,
    FormFilters,
    PaginationParams,
    PaginatedResponse
)
from app.services.audit_service import log_activity

router = APIRouter()

@router.post("/", response_model=FormResponse)
async def create_form(
    request: Request,
    form_data: FormCreate,
    db: AsyncSession = Depends(get_db),
    current_user: SecurityUser = Depends(get_current_user)
) -> Any:
    """
    Create a new form
    """
    # Validate project access if project_id is provided
    if form_data.project_id:
        project_result = await db.execute(
            select(Project)
            .options(selectinload(Project.assigned_users))
            .where(Project.id == form_data.project_id)
        )
        project = project_result.scalar_one_or_none()
        
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )
        
        # Check if user has access to this project
        if current_user.role == "employee":
            user_assigned = any(user.id == current_user.id for user in project.assigned_users)
            if not user_assigned:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You are not assigned to this project"
                )
    
    # Create the form
    form = Form(
        form_type=form_data.form_type,
        title=form_data.title,
        case_id=form_data.case_id,
        volunteer_id=form_data.volunteer_id,
        study_number=form_data.study_number,
        period_number=form_data.period_number,
        form_data=form_data.form_data,
        project_id=form_data.project_id,
        created_by=current_user.id,
        status=FormStatus.DRAFT
    )
    
    db.add(form)
    await db.commit()
    await db.refresh(form)
    
    # Load relationships for response
    result = await db.execute(
        select(Form)
        .options(
            selectinload(Form.creator),
            selectinload(Form.project)
        )
        .where(Form.id == form.id)
    )
    form_with_relations = result.scalar_one()
    
    # Log activity
    await log_activity(
        db=db,
        action="create_form",
        resource_type="form",
        resource_id=form.id,
        user_id=current_user.id,
        new_values={
            "form_type": form.form_type,
            "title": form.title,
            "case_id": form.case_id,
            "volunteer_id": form.volunteer_id
        },
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
        form_id=form.id
    )
    
    await db.commit()
    
    return FormResponse.model_validate(form_with_relations)

@router.get("/", response_model=PaginatedResponse)
async def get_forms(
    db: AsyncSession = Depends(get_db),
    current_user: SecurityUser = Depends(get_current_user),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    form_type: Optional[FormType] = None,
    status: Optional[FormStatus] = None,
    case_id: Optional[str] = None,
    volunteer_id: Optional[str] = None,
    study_number: Optional[str] = None,
    project_id: Optional[UUID] = None
) -> Any:
    """
    Get forms with filtering and pagination
    """
    query = select(Form).options(
        selectinload(Form.creator),
        selectinload(Form.approver),
        selectinload(Form.rejector),
        selectinload(Form.project)
    )
    
    # Apply role-based filtering
    if current_user.role == "employee":
        # Employees can only see forms they created or forms in projects they're assigned to
        user_projects_subquery = select(Project.id).join(
            Project.assigned_users
        ).where(Project.assigned_users.any(id=current_user.id))
        
        query = query.where(
            or_(
                Form.created_by == current_user.id,
                Form.project_id.in_(user_projects_subquery)
            )
        )
    # Admins and super_admins can see all forms
    
    # Apply filters
    if form_type:
        query = query.where(Form.form_type == form_type)
    if status:
        query = query.where(Form.status == status)
    if case_id:
        query = query.where(Form.case_id.ilike(f"%{case_id}%"))
    if volunteer_id:
        query = query.where(Form.volunteer_id.ilike(f"%{volunteer_id}%"))
    if study_number:
        query = query.where(Form.study_number.ilike(f"%{study_number}%"))
    if project_id:
        query = query.where(Form.project_id == project_id)
    
    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # Apply pagination
    offset = (page - 1) * limit
    query = query.order_by(Form.created_at.desc()).offset(offset).limit(limit)
    
    result = await db.execute(query)
    forms = result.scalars().all()
    
    return PaginatedResponse(
        items=[FormResponse.model_validate(form) for form in forms],
        total=total,
        page=page,
        limit=limit,
        pages=(total + limit - 1) // limit
    )

@router.get("/{form_id}", response_model=FormResponse)
async def get_form(
    form_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: SecurityUser = Depends(get_current_user)
) -> Any:
    """
    Get a specific form by ID
    """
    result = await db.execute(
        select(Form)
        .options(
            selectinload(Form.creator),
            selectinload(Form.approver),
            selectinload(Form.rejector),
            selectinload(Form.project).selectinload(Project.assigned_users)
        )
        .where(Form.id == form_id)
    )
    form = result.scalar_one_or_none()
    
    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Form not found"
        )
    
    # Check access permissions
    if current_user.role == "employee":
        # Check if user created the form or is assigned to the project
        has_access = form.created_by == current_user.id
        if form.project and not has_access:
            has_access = any(user.id == current_user.id for user in form.project.assigned_users)
        
        if not has_access:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have access to this form"
            )
    
    return FormResponse.model_validate(form)

@router.put("/{form_id}", response_model=FormResponse)
async def update_form(
    form_id: UUID,
    request: Request,
    form_update: FormUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: SecurityUser = Depends(get_current_user)
) -> Any:
    """
    Update a form (only draft forms can be updated by creators)
    """
    result = await db.execute(
        select(Form)
        .options(selectinload(Form.creator), selectinload(Form.project))
        .where(Form.id == form_id)
    )
    form = result.scalar_one_or_none()
    
    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Form not found"
        )
    
    # Check permissions
    can_update = False
    if current_user.role in ["admin", "super_admin"]:
        can_update = True
    elif form.created_by == current_user.id and form.status == FormStatus.DRAFT:
        can_update = True
    
    if not can_update:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own draft forms"
        )
    
    # Store old values for audit
    old_values = {
        "title": form.title,
        "form_data": form.form_data,
        "status": form.status,
        "review_comments": form.review_comments
    }
    
    # Update form
    update_data = form_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(form, field, value)
    
    await db.commit()
    await db.refresh(form)
    
    # Log activity
    new_values = {
        "title": form.title,
        "form_data": form.form_data,
        "status": form.status,
        "review_comments": form.review_comments
    }
    
    await log_activity(
        db=db,
        action="update_form",
        resource_type="form",
        resource_id=form.id,
        user_id=current_user.id,
        old_values=old_values,
        new_values=new_values,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
        form_id=form.id
    )
    
    await db.commit()
    
    return FormResponse.model_validate(form)

@router.post("/{form_id}/submit", response_model=FormResponse)
async def submit_form(
    form_id: UUID,
    request: Request,
    form_submit: FormSubmit,
    db: AsyncSession = Depends(get_db),
    current_user: SecurityUser = Depends(get_current_user)
) -> Any:
    """
    Submit a form for review
    """
    result = await db.execute(
        select(Form).where(Form.id == form_id)
    )
    form = result.scalar_one_or_none()
    
    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Form not found"
        )
    
    # Check permissions
    if form.created_by != current_user.id and current_user.role not in ["admin", "super_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only submit your own forms"
        )
    
    if form.status != FormStatus.DRAFT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only draft forms can be submitted"
        )
    
    # Store old values for audit
    old_values = {
        "form_data": form.form_data,
        "status": form.status,
        "review_comments": form.review_comments
    }
    
    # Update form
    form.form_data = form_submit.form_data
    form.status = FormStatus.SUBMITTED
    form.submitted_at = func.now()
    if form_submit.review_comments:
        form.review_comments = form_submit.review_comments
    
    await db.commit()
    await db.refresh(form)
    
    # Log activity
    new_values = {
        "form_data": form.form_data,
        "status": form.status,
        "review_comments": form.review_comments
    }
    
    await log_activity(
        db=db,
        action="submit_form",
        resource_type="form",
        resource_id=form.id,
        user_id=current_user.id,
        old_values=old_values,
        new_values=new_values,
        reason="Form submitted for review",
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
        form_id=form.id
    )
    
    await db.commit()
    
    return FormResponse.model_validate(form)

@router.post("/{form_id}/approve", response_model=FormResponse)
async def approve_or_reject_form(
    form_id: UUID,
    request: Request,
    approval: FormApproval,
    db: AsyncSession = Depends(get_db),
    current_user: SecurityUser = Depends(get_admin_user)  # Only admins can approve/reject
) -> Any:
    """
    Approve or reject a submitted form
    """
    result = await db.execute(
        select(Form).where(Form.id == form_id)
    )
    form = result.scalar_one_or_none()
    
    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Form not found"
        )
    
    if form.status != FormStatus.SUBMITTED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only submitted forms can be approved or rejected"
        )
    
    # Store old values for audit
    old_values = {
        "status": form.status,
        "approved_at": form.approved_at,
        "rejected_at": form.rejected_at,
        "rejection_reason": form.rejection_reason,
        "review_comments": form.review_comments
    }
    
    # Update form based on action
    if approval.action.lower() == "approve":
        form.status = FormStatus.APPROVED
        form.approved_at = func.now()
        form.approved_by = current_user.id
        action = "approve_form"
    elif approval.action.lower() == "reject":
        form.status = FormStatus.REJECTED
        form.rejected_at = func.now()
        form.rejected_by = current_user.id
        form.rejection_reason = approval.reason
        action = "reject_form"
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Action must be 'approve' or 'reject'"
        )
    
    if approval.comments:
        form.review_comments = approval.comments
    
    await db.commit()
    await db.refresh(form)
    
    # Log activity
    new_values = {
        "status": form.status,
        "approved_at": form.approved_at,
        "rejected_at": form.rejected_at,
        "rejection_reason": form.rejection_reason,
        "review_comments": form.review_comments
    }
    
    await log_activity(
        db=db,
        action=action,
        resource_type="form",
        resource_id=form.id,
        user_id=current_user.id,
        old_values=old_values,
        new_values=new_values,
        reason=approval.reason or approval.comments,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
        form_id=form.id
    )
    
    await db.commit()
    
    return FormResponse.model_validate(form)

@router.delete("/{form_id}")
async def delete_form(
    form_id: UUID,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: SecurityUser = Depends(get_current_user)
) -> Any:
    """
    Delete a form (only draft forms can be deleted)
    """
    result = await db.execute(
        select(Form).where(Form.id == form_id)
    )
    form = result.scalar_one_or_none()
    
    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Form not found"
        )
    
    # Check permissions
    can_delete = False
    if current_user.role in ["admin", "super_admin"]:
        can_delete = True
    elif form.created_by == current_user.id and form.status == FormStatus.DRAFT:
        can_delete = True
    
    if not can_delete:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own draft forms"
        )
    
    # Log activity before deletion
    await log_activity(
        db=db,
        action="delete_form",
        resource_type="form",
        resource_id=form.id,
        user_id=current_user.id,
        old_values={
            "form_type": form.form_type,
            "title": form.title,
            "case_id": form.case_id,
            "volunteer_id": form.volunteer_id,
            "status": form.status
        },
        reason="Form deleted",
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
        form_id=form.id
    )
    
    await db.delete(form)
    await db.commit()
    
    return {"message": "Form deleted successfully"}
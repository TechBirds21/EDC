from typing import Any, List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from sqlalchemy.orm import selectinload

from app.core.security import get_current_user, get_admin_user, User as SecurityUser
from app.db.session import get_db
from app.models.unified_models import AuditLog
from app.schemas.unified_schemas import AuditLogResponse, PaginatedResponse
from app.services.audit_service import get_audit_trail

router = APIRouter()

@router.get("/", response_model=PaginatedResponse)
async def get_audit_logs(
    db: AsyncSession = Depends(get_db),
    current_user: SecurityUser = Depends(get_current_user),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    resource_type: Optional[str] = None,
    resource_id: Optional[UUID] = None,
    user_id: Optional[UUID] = None,
    action: Optional[str] = None
) -> Any:
    """
    Get audit logs with filtering and pagination
    """
    # Role-based access control
    if current_user.role == "employee":
        # Employees can only see their own audit logs
        user_id = current_user.id
    elif current_user.role == "admin":
        # Admins can see all audit logs but might have some restrictions
        pass
    # Super admins can see everything
    
    query = select(AuditLog).options(selectinload(AuditLog.user))
    
    # Apply filters
    if resource_type:
        query = query.where(AuditLog.resource_type == resource_type)
    
    if resource_id:
        query = query.where(AuditLog.resource_id == resource_id)
    
    if user_id:
        query = query.where(AuditLog.user_id == user_id)
        
    if action:
        query = query.where(AuditLog.action == action)
    
    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # Apply pagination and ordering
    offset = (page - 1) * limit
    query = query.order_by(desc(AuditLog.created_at)).offset(offset).limit(limit)
    
    result = await db.execute(query)
    audit_logs = result.scalars().all()
    
    return PaginatedResponse(
        items=[AuditLogResponse.model_validate(log) for log in audit_logs],
        total=total,
        page=page,
        limit=limit,
        pages=(total + limit - 1) // limit
    )

@router.get("/form/{form_id}", response_model=List[AuditLogResponse])
async def get_form_audit_trail(
    form_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: SecurityUser = Depends(get_current_user)
) -> Any:
    """
    Get audit trail for a specific form
    """
    # Check if user has access to this form
    from app.models.unified_models import Form, Project
    
    form_result = await db.execute(
        select(Form)
        .options(
            selectinload(Form.project).selectinload(Project.assigned_users)
        )
        .where(Form.id == form_id)
    )
    form = form_result.scalar_one_or_none()
    
    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Form not found"
        )
    
    # Check access permissions
    if current_user.role == "employee":
        has_access = form.created_by == current_user.id
        if form.project and not has_access:
            has_access = any(user.id == current_user.id for user in form.project.assigned_users)
        
        if not has_access:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have access to this form's audit trail"
            )
    
    # Get audit logs for this form
    query = select(AuditLog).options(selectinload(AuditLog.user)).where(
        AuditLog.form_id == form_id
    ).order_by(desc(AuditLog.created_at))
    
    result = await db.execute(query)
    audit_logs = result.scalars().all()
    
    return [AuditLogResponse.model_validate(log) for log in audit_logs]

@router.get("/user/{user_id}", response_model=PaginatedResponse)
async def get_user_audit_trail(
    user_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: SecurityUser = Depends(get_admin_user),  # Only admins can view other users' audit trails
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100)
) -> Any:
    """
    Get audit trail for a specific user (admin only)
    """
    # Verify user exists
    from app.models.unified_models import User
    
    user_result = await db.execute(
        select(User).where(User.id == user_id)
    )
    user = user_result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Get audit logs for this user
    query = select(AuditLog).options(selectinload(AuditLog.user)).where(
        AuditLog.user_id == user_id
    )
    
    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # Apply pagination and ordering
    offset = (page - 1) * limit
    query = query.order_by(desc(AuditLog.created_at)).offset(offset).limit(limit)
    
    result = await db.execute(query)
    audit_logs = result.scalars().all()
    
    return PaginatedResponse(
        items=[AuditLogResponse.model_validate(log) for log in audit_logs],
        total=total,
        page=page,
        limit=limit,
        pages=(total + limit - 1) // limit
    )

@router.get("/project/{project_id}", response_model=PaginatedResponse)
async def get_project_audit_trail(
    project_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: SecurityUser = Depends(get_current_user),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100)
) -> Any:
    """
    Get audit trail for a specific project
    """
    # Check if user has access to this project
    from app.models.unified_models import Project
    
    project_result = await db.execute(
        select(Project)
        .options(selectinload(Project.assigned_users))
        .where(Project.id == project_id)
    )
    project = project_result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Check access permissions
    if current_user.role == "employee":
        user_assigned = any(user.id == current_user.id for user in project.assigned_users)
        if not user_assigned:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have access to this project's audit trail"
            )
    
    # Get audit logs for this project and related forms
    from sqlalchemy import text
    
    query = select(AuditLog).options(selectinload(AuditLog.user)).where(
        (AuditLog.resource_type == "project") & (AuditLog.resource_id == project_id)
    )
    
    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # Apply pagination and ordering
    offset = (page - 1) * limit
    query = query.order_by(desc(AuditLog.created_at)).offset(offset).limit(limit)
    
    result = await db.execute(query)
    audit_logs = result.scalars().all()
    
    return PaginatedResponse(
        items=[AuditLogResponse.model_validate(log) for log in audit_logs],
        total=total,
        page=page,
        limit=limit,
        pages=(total + limit - 1) // limit
    )

@router.get("/stats", response_model=dict)
async def get_audit_stats(
    db: AsyncSession = Depends(get_db),
    current_user: SecurityUser = Depends(get_admin_user)  # Only admins can view stats
) -> Any:
    """
    Get audit statistics
    """
    from sqlalchemy import text
    from datetime import datetime, timedelta
    
    # Get basic stats
    total_logs = await db.execute(select(func.count(AuditLog.id)))
    total_count = total_logs.scalar()
    
    # Get logs from last 24 hours
    yesterday = datetime.utcnow() - timedelta(days=1)
    recent_logs = await db.execute(
        select(func.count(AuditLog.id)).where(AuditLog.created_at >= yesterday)
    )
    recent_count = recent_logs.scalar()
    
    # Get top actions
    top_actions = await db.execute(
        select(AuditLog.action, func.count(AuditLog.id).label('count'))
        .group_by(AuditLog.action)
        .order_by(desc(text('count')))
        .limit(10)
    )
    top_actions_list = [{"action": row[0], "count": row[1]} for row in top_actions.fetchall()]
    
    # Get top users
    top_users = await db.execute(
        select(AuditLog.user_id, func.count(AuditLog.id).label('count'))
        .where(AuditLog.user_id.isnot(None))
        .group_by(AuditLog.user_id)
        .order_by(desc(text('count')))
        .limit(10)
    )
    top_users_list = [{"user_id": str(row[0]), "count": row[1]} for row in top_users.fetchall()]
    
    return {
        "total_logs": total_count,
        "recent_logs_24h": recent_count,
        "top_actions": top_actions_list,
        "top_users": top_users_list
    }
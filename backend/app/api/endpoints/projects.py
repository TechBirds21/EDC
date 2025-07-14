from typing import Any, List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, delete
from sqlalchemy.orm import selectinload

from app.core.security import get_current_user, get_admin_user, User as SecurityUser
from app.db.session import get_db
from app.models.unified_models import Project, User, user_projects, ProjectStatus
from app.schemas.unified_schemas import (
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
    ProjectAssignment,
    PaginatedResponse,
    UserResponse
)
from app.services.audit_service import log_activity

router = APIRouter()

@router.post("/", response_model=ProjectResponse)
async def create_project(
    request: Request,
    project_data: ProjectCreate,
    db: AsyncSession = Depends(get_db),
    current_user: SecurityUser = Depends(get_admin_user)  # Only admins can create projects
) -> Any:
    """
    Create a new project
    """
    project = Project(
        name=project_data.name,
        description=project_data.description,
        start_date=project_data.start_date,
        end_date=project_data.end_date,
        settings=project_data.settings,
        metadata=project_data.metadata,
        created_by=current_user.id,
        status=ProjectStatus.PLANNING
    )
    
    db.add(project)
    await db.commit()
    await db.refresh(project)
    
    # Load relationships for response
    result = await db.execute(
        select(Project)
        .options(selectinload(Project.creator))
        .where(Project.id == project.id)
    )
    project_with_relations = result.scalar_one()
    
    # Log activity
    await log_activity(
        db=db,
        action="create_project",
        resource_type="project",
        resource_id=project.id,
        user_id=current_user.id,
        new_values={
            "name": project.name,
            "description": project.description,
            "status": project.status
        },
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent")
    )
    
    await db.commit()
    
    return ProjectResponse.model_validate(project_with_relations)

@router.get("/", response_model=PaginatedResponse)
async def get_projects(
    db: AsyncSession = Depends(get_db),
    current_user: SecurityUser = Depends(get_current_user),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[ProjectStatus] = None,
    assigned_to_me: bool = Query(False)
) -> Any:
    """
    Get projects with filtering and pagination
    """
    query = select(Project).options(
        selectinload(Project.creator),
        selectinload(Project.assigned_users)
    )
    
    # Apply role-based filtering
    if current_user.role == "employee":
        # Employees can only see projects they're assigned to
        query = query.join(Project.assigned_users).where(
            Project.assigned_users.any(id=current_user.id)
        )
    elif assigned_to_me and current_user.role in ["admin", "super_admin"]:
        # Admins can optionally filter to projects assigned to them
        query = query.join(Project.assigned_users).where(
            Project.assigned_users.any(id=current_user.id)
        )
    
    # Apply filters
    if status:
        query = query.where(Project.status == status)
    
    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # Apply pagination
    offset = (page - 1) * limit
    query = query.order_by(Project.created_at.desc()).offset(offset).limit(limit)
    
    result = await db.execute(query)
    projects = result.scalars().all()
    
    return PaginatedResponse(
        items=[ProjectResponse.model_validate(project) for project in projects],
        total=total,
        page=page,
        limit=limit,
        pages=(total + limit - 1) // limit
    )

@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: SecurityUser = Depends(get_current_user)
) -> Any:
    """
    Get a specific project by ID
    """
    result = await db.execute(
        select(Project)
        .options(
            selectinload(Project.creator),
            selectinload(Project.assigned_users)
        )
        .where(Project.id == project_id)
    )
    project = result.scalar_one_or_none()
    
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
                detail="You don't have access to this project"
            )
    
    return ProjectResponse.model_validate(project)

@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: UUID,
    request: Request,
    project_update: ProjectUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: SecurityUser = Depends(get_admin_user)  # Only admins can update projects
) -> Any:
    """
    Update a project
    """
    result = await db.execute(
        select(Project).where(Project.id == project_id)
    )
    project = result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Store old values for audit
    old_values = {
        "name": project.name,
        "description": project.description,
        "status": project.status,
        "start_date": project.start_date,
        "end_date": project.end_date,
        "settings": project.settings,
        "metadata": project.metadata
    }
    
    # Update project
    update_data = project_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)
    
    await db.commit()
    await db.refresh(project)
    
    # Log activity
    new_values = {
        "name": project.name,
        "description": project.description,
        "status": project.status,
        "start_date": project.start_date,
        "end_date": project.end_date,
        "settings": project.settings,
        "metadata": project.metadata
    }
    
    await log_activity(
        db=db,
        action="update_project",
        resource_type="project",
        resource_id=project.id,
        user_id=current_user.id,
        old_values=old_values,
        new_values=new_values,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent")
    )
    
    await db.commit()
    
    return ProjectResponse.model_validate(project)

@router.post("/{project_id}/assign", response_model=dict)
async def assign_user_to_project(
    project_id: UUID,
    request: Request,
    assignment: ProjectAssignment,
    db: AsyncSession = Depends(get_db),
    current_user: SecurityUser = Depends(get_admin_user)  # Only admins can assign users
) -> Any:
    """
    Assign a user to a project
    """
    # Verify project exists
    project_result = await db.execute(
        select(Project).where(Project.id == project_id)
    )
    project = project_result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Verify user exists
    user_result = await db.execute(
        select(User).where(User.id == assignment.user_id)
    )
    user = user_result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if user is already assigned
    existing_assignment = await db.execute(
        select(user_projects).where(
            and_(
                user_projects.c.user_id == assignment.user_id,
                user_projects.c.project_id == project_id
            )
        )
    )
    
    if existing_assignment.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already assigned to this project"
        )
    
    # Create assignment
    await db.execute(
        user_projects.insert().values(
            user_id=assignment.user_id,
            project_id=project_id,
            assigned_by=current_user.id
        )
    )
    
    await db.commit()
    
    # Log activity
    await log_activity(
        db=db,
        action="assign_user_to_project",
        resource_type="project",
        resource_id=project_id,
        user_id=current_user.id,
        new_values={
            "assigned_user_id": str(assignment.user_id),
            "assigned_user_email": user.email,
            "project_name": project.name
        },
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent")
    )
    
    await db.commit()
    
    return {"message": f"User {user.email} assigned to project {project.name}"}

@router.delete("/{project_id}/unassign/{user_id}")
async def unassign_user_from_project(
    project_id: UUID,
    user_id: UUID,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: SecurityUser = Depends(get_admin_user)  # Only admins can unassign users
) -> Any:
    """
    Unassign a user from a project
    """
    # Verify project exists
    project_result = await db.execute(
        select(Project).where(Project.id == project_id)
    )
    project = project_result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Verify user exists
    user_result = await db.execute(
        select(User).where(User.id == user_id)
    )
    user = user_result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if user is assigned
    existing_assignment = await db.execute(
        select(user_projects).where(
            and_(
                user_projects.c.user_id == user_id,
                user_projects.c.project_id == project_id
            )
        )
    )
    
    if not existing_assignment.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is not assigned to this project"
        )
    
    # Remove assignment
    await db.execute(
        delete(user_projects).where(
            and_(
                user_projects.c.user_id == user_id,
                user_projects.c.project_id == project_id
            )
        )
    )
    
    await db.commit()
    
    # Log activity
    await log_activity(
        db=db,
        action="unassign_user_from_project",
        resource_type="project",
        resource_id=project_id,
        user_id=current_user.id,
        old_values={
            "assigned_user_id": str(user_id),
            "assigned_user_email": user.email,
            "project_name": project.name
        },
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent")
    )
    
    await db.commit()
    
    return {"message": f"User {user.email} unassigned from project {project.name}"}

@router.get("/{project_id}/users", response_model=List[UserResponse])
async def get_project_users(
    project_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: SecurityUser = Depends(get_current_user)
) -> Any:
    """
    Get all users assigned to a project
    """
    # Verify project exists and user has access
    result = await db.execute(
        select(Project)
        .options(selectinload(Project.assigned_users))
        .where(Project.id == project_id)
    )
    project = result.scalar_one_or_none()
    
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
                detail="You don't have access to this project"
            )
    
    return [UserResponse.model_validate(user) for user in project.assigned_users]

@router.delete("/{project_id}")
async def delete_project(
    project_id: UUID,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: SecurityUser = Depends(get_admin_user)  # Only admins can delete projects
) -> Any:
    """
    Delete a project (only if no forms are associated)
    """
    # Check if project has any forms
    from app.models.unified_models import Form
    
    forms_count = await db.execute(
        select(func.count(Form.id)).where(Form.project_id == project_id)
    )
    
    if forms_count.scalar() > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete project with associated forms"
        )
    
    # Get project for logging
    result = await db.execute(
        select(Project).where(Project.id == project_id)
    )
    project = result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Log activity before deletion
    await log_activity(
        db=db,
        action="delete_project",
        resource_type="project",
        resource_id=project.id,
        user_id=current_user.id,
        old_values={
            "name": project.name,
            "description": project.description,
            "status": project.status
        },
        reason="Project deleted",
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent")
    )
    
    # Remove all user assignments first
    await db.execute(
        delete(user_projects).where(user_projects.c.project_id == project_id)
    )
    
    # Delete the project
    await db.delete(project)
    await db.commit()
    
    return {"message": "Project deleted successfully"}
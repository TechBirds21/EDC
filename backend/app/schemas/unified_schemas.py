from datetime import datetime, date
from typing import Optional, Dict, Any, List
from uuid import UUID
from pydantic import BaseModel, EmailStr, ConfigDict

from app.models.unified_models import UserRole, UserStatus, ProjectStatus, FormStatus, FormType

# Base schemas with common configuration
class BaseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

# Authentication schemas
class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: UserRole = UserRole.EMPLOYEE

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: Optional[UserRole] = None
    status: Optional[UserStatus] = None

class UserResponse(BaseSchema):
    id: UUID
    email: str
    first_name: Optional[str]
    last_name: Optional[str]
    role: UserRole
    status: UserStatus
    created_at: datetime
    last_login: Optional[datetime]

    @property
    def full_name(self) -> str:
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        return self.email

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Project schemas
class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    settings: Optional[Dict[str, Any]] = {}
    project_metadata: Optional[Dict[str, Any]] = {}

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[ProjectStatus] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    settings: Optional[Dict[str, Any]] = None
    project_metadata: Optional[Dict[str, Any]] = None

class ProjectResponse(BaseSchema):
    id: UUID
    name: str
    description: Optional[str]
    status: ProjectStatus
    start_date: Optional[date]
    end_date: Optional[date]
    settings: Dict[str, Any]
    project_metadata: Dict[str, Any]
    created_at: datetime
    updated_at: datetime
    creator: Optional[UserResponse]

class ProjectAssignment(BaseModel):
    user_id: UUID
    project_id: UUID

# Form schemas
class FormCreate(BaseModel):
    form_type: FormType
    title: str
    case_id: Optional[str] = None
    volunteer_id: Optional[str] = None
    study_number: Optional[str] = None
    period_number: Optional[str] = None
    form_data: Dict[str, Any] = {}
    project_id: Optional[UUID] = None

class FormUpdate(BaseModel):
    title: Optional[str] = None
    form_data: Optional[Dict[str, Any]] = None
    status: Optional[FormStatus] = None
    review_comments: Optional[str] = None
    rejection_reason: Optional[str] = None

class FormSubmit(BaseModel):
    form_data: Dict[str, Any]
    review_comments: Optional[str] = None

class FormApproval(BaseModel):
    action: str  # "approve" or "reject"
    comments: Optional[str] = None
    reason: Optional[str] = None

class FormResponse(BaseSchema):
    id: UUID
    form_type: FormType
    title: str
    version: int
    case_id: Optional[str]
    volunteer_id: Optional[str]
    study_number: Optional[str]
    period_number: Optional[str]
    form_data: Dict[str, Any]
    status: FormStatus
    submitted_at: Optional[datetime]
    approved_at: Optional[datetime]
    rejected_at: Optional[datetime]
    rejection_reason: Optional[str]
    review_comments: Optional[str]
    created_at: datetime
    updated_at: datetime
    creator: Optional[UserResponse]
    approver: Optional[UserResponse]
    rejector: Optional[UserResponse]
    project: Optional[ProjectResponse]

# Audit schemas
class AuditLogResponse(BaseSchema):
    id: UUID
    action: str
    resource_type: str
    resource_id: UUID
    old_values: Optional[Dict[str, Any]]
    new_values: Optional[Dict[str, Any]]
    field_changes: Optional[Dict[str, Any]]
    reason: Optional[str]
    ip_address: Optional[str]
    user_agent: Optional[str]
    created_at: datetime
    user: Optional[UserResponse]

# Pagination schemas
class PaginationParams(BaseModel):
    page: int = 1
    limit: int = 20

class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    page: int
    limit: int
    pages: int

# Filter schemas
class FormFilters(BaseModel):
    form_type: Optional[FormType] = None
    status: Optional[FormStatus] = None
    case_id: Optional[str] = None
    volunteer_id: Optional[str] = None
    study_number: Optional[str] = None
    project_id: Optional[UUID] = None
    created_by: Optional[UUID] = None
    date_from: Optional[date] = None
    date_to: Optional[date] = None

class ProjectFilters(BaseModel):
    status: Optional[ProjectStatus] = None
    created_by: Optional[UUID] = None
    assigned_to: Optional[UUID] = None

class UserFilters(BaseModel):
    role: Optional[UserRole] = None
    status: Optional[UserStatus] = None
    project_id: Optional[UUID] = None

# Dashboard schemas
class DashboardStats(BaseModel):
    total_forms: int
    draft_forms: int
    submitted_forms: int
    approved_forms: int
    rejected_forms: int
    total_projects: int
    active_projects: int
    total_users: int
    recent_activities: List[AuditLogResponse]

# PDF Export schema
class PDFExportRequest(BaseModel):
    form_id: UUID
    include_audit_trail: bool = False
    watermark: Optional[str] = None
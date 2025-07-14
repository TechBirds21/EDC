from uuid import UUID
from datetime import datetime, date
from typing import Optional, Dict, Any, List
from enum import Enum

from sqlalchemy import Column, String, DateTime, Boolean, Integer, Date, Text, JSON, ForeignKey, Table
from sqlalchemy.dialects.postgresql import UUID as pg_UUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

Base = declarative_base()

# Enums for better type safety
class UserRole(str, Enum):
    EMPLOYEE = "employee"
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"

class UserStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"

class ProjectStatus(str, Enum):
    PLANNING = "planning"
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class FormStatus(str, Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    APPROVED = "approved"
    REJECTED = "rejected"
    LOCKED = "locked"

class FormType(str, Enum):
    VOLUNTEER_MEDICAL_SCREENING = "volunteer_medical_screening"
    PREGNANCY_TESTS = "pregnancy_tests"
    LABORATORY_REPORTS = "laboratory_reports"
    STUDY_PERIOD = "study_period"
    POST_STUDY = "post_study"
    CUSTOM = "custom"

# Association table for user-project relationships
user_projects = Table(
    'user_projects',
    Base.metadata,
    Column('user_id', pg_UUID(as_uuid=True), ForeignKey('users.id'), primary_key=True),
    Column('project_id', pg_UUID(as_uuid=True), ForeignKey('projects.id'), primary_key=True),
    Column('assigned_at', DateTime(timezone=True), server_default=func.now()),
    Column('assigned_by', pg_UUID(as_uuid=True), ForeignKey('users.id'))
)

class User(Base):
    __tablename__ = "users"

    id = Column(pg_UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    first_name = Column(String(100))
    last_name = Column(String(100))
    role = Column(String(20), nullable=False, default=UserRole.EMPLOYEE)
    status = Column(String(20), nullable=False, default=UserStatus.ACTIVE)
    
    # Audit fields
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    last_login = Column(DateTime(timezone=True))
    
    # Relationships
    assigned_projects = relationship("Project", secondary=user_projects, back_populates="assigned_users")
    created_projects = relationship("Project", foreign_keys="Project.created_by", back_populates="creator")
    created_forms = relationship("Form", foreign_keys="Form.created_by", back_populates="creator")
    audit_logs = relationship("AuditLog", back_populates="user")

    @property
    def full_name(self) -> str:
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        return self.email

class Project(Base):
    __tablename__ = "projects"

    id = Column(pg_UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    name = Column(String(255), nullable=False)
    description = Column(Text)
    status = Column(String(20), nullable=False, default=ProjectStatus.PLANNING)
    start_date = Column(Date)
    end_date = Column(Date)
    
    # Metadata for project configuration
    settings = Column(JSON, default={})
    metadata = Column(JSON, default={})
    
    # Audit fields
    created_by = Column(pg_UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    creator = relationship("User", foreign_keys=[created_by], back_populates="created_projects")
    assigned_users = relationship("User", secondary=user_projects, back_populates="assigned_projects")
    forms = relationship("Form", back_populates="project")

class Form(Base):
    __tablename__ = "forms"

    id = Column(pg_UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    
    # Form identification
    form_type = Column(String(50), nullable=False)  # FormType enum
    title = Column(String(255), nullable=False)
    version = Column(Integer, default=1)
    
    # Study/Case information
    case_id = Column(String(100))
    volunteer_id = Column(String(100))
    study_number = Column(String(100))
    period_number = Column(String(50))
    
    # Form data and status
    form_data = Column(JSON, nullable=False, default={})
    status = Column(String(20), nullable=False, default=FormStatus.DRAFT)
    
    # Workflow fields
    submitted_at = Column(DateTime(timezone=True))
    approved_at = Column(DateTime(timezone=True))
    rejected_at = Column(DateTime(timezone=True))
    approved_by = Column(pg_UUID(as_uuid=True), ForeignKey('users.id'))
    rejected_by = Column(pg_UUID(as_uuid=True), ForeignKey('users.id'))
    rejection_reason = Column(Text)
    review_comments = Column(Text)
    
    # Project relationship
    project_id = Column(pg_UUID(as_uuid=True), ForeignKey('projects.id'))
    
    # Audit fields
    created_by = Column(pg_UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    creator = relationship("User", foreign_keys=[created_by], back_populates="created_forms")
    approver = relationship("User", foreign_keys=[approved_by])
    rejector = relationship("User", foreign_keys=[rejected_by])
    project = relationship("Project", back_populates="forms")
    audit_logs = relationship("AuditLog", back_populates="form")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(pg_UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    
    # Action information
    action = Column(String(100), nullable=False)  # create, update, delete, approve, reject, etc.
    resource_type = Column(String(50), nullable=False)  # form, project, user, etc.
    resource_id = Column(pg_UUID(as_uuid=True), nullable=False)
    
    # Change details
    old_values = Column(JSON)
    new_values = Column(JSON)
    field_changes = Column(JSON)  # Specific field-level changes
    
    # Context information
    reason = Column(Text)
    ip_address = Column(String(45))  # IPv6 support
    user_agent = Column(Text)
    session_id = Column(String(100))
    
    # User and timing
    user_id = Column(pg_UUID(as_uuid=True), ForeignKey('users.id'))
    form_id = Column(pg_UUID(as_uuid=True), ForeignKey('forms.id'))
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="audit_logs")
    form = relationship("Form", back_populates="audit_logs")

# Create indexes for better performance
from sqlalchemy import Index

# User indexes
Index('idx_users_email', User.email)
Index('idx_users_role', User.role)
Index('idx_users_status', User.status)

# Project indexes
Index('idx_projects_status', Project.status)
Index('idx_projects_created_by', Project.created_by)

# Form indexes
Index('idx_forms_type', Form.form_type)
Index('idx_forms_status', Form.status)
Index('idx_forms_case_id', Form.case_id)
Index('idx_forms_volunteer_id', Form.volunteer_id)
Index('idx_forms_project_id', Form.project_id)
Index('idx_forms_created_by', Form.created_by)
Index('idx_forms_submitted_at', Form.submitted_at)

# Audit log indexes
Index('idx_audit_logs_user_id', AuditLog.user_id)
Index('idx_audit_logs_resource', AuditLog.resource_type, AuditLog.resource_id)
Index('idx_audit_logs_action', AuditLog.action)
Index('idx_audit_logs_created_at', AuditLog.created_at)
Index('idx_audit_logs_form_id', AuditLog.form_id)
import uuid
from typing import Optional

from sqlalchemy import Column, String, Text, DateTime, Boolean, func, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy.orm import relationship

from app.db.base import Base


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False)
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    role = Column(String, nullable=False, default='employee')
    status = Column(String, nullable=False, default='active')
    client_id = Column(UUID(as_uuid=True), ForeignKey('clients.id'), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    client = relationship("Client", back_populates="profiles")
    projects_assigned = relationship("ProjectAssignment", back_populates="user")


class Client(Base):
    __tablename__ = "clients"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    contact_email = Column(String, nullable=True)
    contact_phone = Column(String, nullable=True)
    address = Column(Text, nullable=True)
    status = Column(String, nullable=False, default='active')
    settings = Column(JSON, default={})
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    profiles = relationship("Profile", back_populates="client")
    projects = relationship("Project", back_populates="client")


class Project(Base):
    __tablename__ = "projects_enhanced"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    client_id = Column(UUID(as_uuid=True), ForeignKey('clients.id'), nullable=True)
    status = Column(String, nullable=False, default='planning')
    start_date = Column(DateTime(timezone=True), nullable=True)
    end_date = Column(DateTime(timezone=True), nullable=True)
    settings = Column(JSON, default={})
    metadata = Column(JSON, default={})
    created_by = Column(UUID(as_uuid=True), ForeignKey('profiles.id'), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    client = relationship("Client", back_populates="projects")
    assignments = relationship("ProjectAssignment", back_populates="project")
    form_templates = relationship("FormTemplate", back_populates="project")


class ProjectAssignment(Base):
    __tablename__ = "project_assignments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey('projects_enhanced.id'), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey('profiles.id'), nullable=False)
    role = Column(String, default='member')
    permissions = Column(JSON, default={})
    assigned_at = Column(DateTime(timezone=True), server_default=func.now())
    assigned_by = Column(UUID(as_uuid=True), ForeignKey('profiles.id'), nullable=True)

    # Relationships
    project = relationship("Project", back_populates="assignments")
    user = relationship("Profile", back_populates="projects_assigned", foreign_keys=[user_id])
import uuid
from typing import Optional

from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text, func, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class FormTemplate(Base):
    __tablename__ = "form_templates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    project_id = Column(String, nullable=True)
    client_id = Column(UUID(as_uuid=True), nullable=True)
    version = Column(Integer, nullable=False, default=1)
    json_schema = Column(JSONB, nullable=False, default={})
    is_active = Column(Boolean, default=True)
    template_type = Column(String, default='custom')
    field_order = Column(JSONB, default=[])
    validation_rules = Column(JSONB, default={})
    ui_config = Column(JSONB, default={})
    # Legacy fields for compatibility
    sections = Column(JSONB, nullable=True)
    side_headers = Column(JSONB, nullable=True)
    logic = Column(JSONB, nullable=True)
    created_by = Column(UUID(as_uuid=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class FieldDefinition(Base):
    __tablename__ = "field_definitions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    template_id = Column(UUID(as_uuid=True), ForeignKey('form_templates.id', ondelete='CASCADE'), nullable=False)
    field_name = Column(String, nullable=False)
    field_label = Column(String, nullable=False)
    field_type = Column(String, nullable=False)
    field_order = Column(Integer, nullable=False, default=0)
    section_id = Column(String, nullable=True)
    is_required = Column(Boolean, default=False)
    default_value = Column(JSONB, nullable=True)
    options = Column(JSONB, nullable=True)
    validation = Column(JSONB, default={})
    ui_props = Column(JSONB, default={})
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    template = relationship("FormTemplate", backref="field_definitions")
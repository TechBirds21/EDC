import uuid
from typing import Optional

from sqlalchemy import Column, DateTime, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class Form(Base):
    __tablename__ = "forms"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    template_id = Column(
        UUID(as_uuid=True), ForeignKey("form_templates.id", ondelete="CASCADE")
    )
    volunteer_id = Column(
        UUID(as_uuid=True), ForeignKey("volunteers.id", ondelete="CASCADE")
    )
    status = Column(String, default="draft")
    data = Column(JSONB, nullable=True)
    created_by = Column(UUID(as_uuid=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    template = relationship("FormTemplate", lazy="joined")
    volunteer = relationship("Volunteer", lazy="joined")


class PatientForm(Base):
    __tablename__ = "patient_forms"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id = Column(String, nullable=False)
    volunteer_id = Column(String, nullable=False)
    study_number = Column(String, nullable=False)
    template_name = Column(String, nullable=False)
    template_id = Column(UUID(as_uuid=True), ForeignKey('form_templates.id'), nullable=True)
    period_number = Column(String, nullable=True)
    answers = Column(JSONB, nullable=False, default={})
    status = Column(String, nullable=False, default='draft')
    metadata = Column(JSONB, default={})
    version = Column(String, default='1.0')
    form_data = Column(JSONB, default={})  # Legacy compatibility
    submitted_by = Column(UUID(as_uuid=True), nullable=True)
    submitted_at = Column(DateTime(timezone=True), nullable=True)
    reviewed_by = Column(UUID(as_uuid=True), nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    review_notes = Column(Text, nullable=True)
    created_by = Column(UUID(as_uuid=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    template = relationship("FormTemplate", backref="patient_forms")
    change_logs = relationship("ChangeLog", back_populates="form", cascade="all, delete-orphan")
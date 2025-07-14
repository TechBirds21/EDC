import uuid
from typing import Optional

from sqlalchemy import Column, DateTime, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class ChangeLog(Base):
    __tablename__ = "change_log"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    form_id = Column(
        UUID(as_uuid=True), ForeignKey("forms.id", ondelete="CASCADE")
    )
    patient_form_id = Column(
        UUID(as_uuid=True), ForeignKey("patient_forms.id", ondelete="CASCADE"), nullable=True
    )
    field_name = Column(String, nullable=True)
    field = Column(String, nullable=True)  # Legacy compatibility
    old_value = Column(JSONB, nullable=True)
    new_value = Column(JSONB, nullable=True)
    old = Column(JSONB, nullable=True)  # Legacy compatibility
    new = Column(JSONB, nullable=True)  # Legacy compatibility
    change_type = Column(String, nullable=False, default='update')
    reason = Column(Text, nullable=True)
    user_id = Column(UUID(as_uuid=True), nullable=True)
    changed_by = Column(UUID(as_uuid=True), nullable=True)  # Legacy compatibility
    user_role = Column(String, nullable=True)
    ip_address = Column(String, nullable=True)
    user_agent = Column(Text, nullable=True)
    changed_at = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    form = relationship("Form", lazy="joined")
    patient_form = relationship("PatientForm", backref="change_logs")
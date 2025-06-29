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
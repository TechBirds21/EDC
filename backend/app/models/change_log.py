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
    field = Column(String, nullable=True)
    old = Column(JSONB, nullable=True)
    new = Column(JSONB, nullable=True)
    reason = Column(Text, nullable=True)
    changed_at = Column(DateTime(timezone=True), server_default=func.now())
    changed_by = Column(UUID(as_uuid=True), nullable=True)

    # Relationships
    form = relationship("Form", lazy="joined")
import uuid
from datetime import date
from typing import Optional

from sqlalchemy import Column, Date, DateTime, Numeric, String, func
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class Volunteer(Base):
    __tablename__ = "volunteers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    screening_date = Column(Date, nullable=True)
    dob = Column(Date, nullable=True)
    gender = Column(String, nullable=True)
    bmi = Column(Numeric, nullable=True)
    created_by = Column(UUID(as_uuid=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
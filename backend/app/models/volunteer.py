import uuid
from datetime import date
from typing import Optional

from sqlalchemy import Column, Date, DateTime, Numeric, String, Text, JSON, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class Volunteer(Base):
    __tablename__ = "volunteers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    volunteer_id = Column(String, unique=True, nullable=False)
    study_number = Column(String, nullable=False)
    screening_date = Column(Date, nullable=True)
    dob = Column(Date, nullable=True)
    gender = Column(String, nullable=True)
    bmi = Column(Numeric, nullable=True)
    demographics = Column(JSON, default={})
    medical_history = Column(JSON, default={})
    status = Column(String, default='active')
    metadata = Column(JSON, default={})
    created_by = Column(UUID(as_uuid=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
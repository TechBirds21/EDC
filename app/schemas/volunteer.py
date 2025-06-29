from datetime import date
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field, field_validator


class VolunteerBase(BaseModel):
    screening_date: Optional[date] = None
    dob: Optional[date] = None
    gender: Optional[str] = None
    bmi: Optional[float] = None


class VolunteerCreate(VolunteerBase):
    screening_date: date = Field(..., description="Screening date of the volunteer")
    
    @field_validator("dob")
    def validate_dob(cls, v: Optional[date], values: dict) -> Optional[date]:
        if v is None:
            return v
        
        screening_date = values.get("screening_date")
        if screening_date and v > screening_date:
            raise ValueError("Date of birth must be before screening date")
        
        return v


class VolunteerUpdate(VolunteerBase):
    pass


class VolunteerInDB(VolunteerBase):
    id: UUID
    created_by: Optional[UUID] = None
    created_at: date
    updated_at: date

    class Config:
        from_attributes = True


class VolunteerResponse(VolunteerInDB):
    pass


class VolunteerPagination(BaseModel):
    items: list[VolunteerResponse]
    total: int
    page: int
    size: int
    pages: int
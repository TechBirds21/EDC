from datetime import date, datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, Field, field_validator, model_validator

from app.schemas.form_template import FormTemplateResponse
from app.schemas.volunteer import VolunteerResponse


class FormBase(BaseModel):
    template_id: UUID
    volunteer_id: UUID
    status: Optional[str] = "draft"
    data: Optional[Dict[str, Any]] = None


class FormCreate(FormBase):
    @model_validator(mode="after")
    def validate_data_dates(self) -> "FormCreate":
        """Validate that all date fields in data are >= volunteer.screening_date"""
        # This would be implemented in the service layer where we have access to the volunteer
        return self


class FormUpdate(BaseModel):
    status: Optional[str] = None
    data: Optional[Dict[str, Any]] = None


class FormPatch(BaseModel):
    field: str
    value: Any
    reason: str


class FormInDB(FormBase):
    id: UUID
    created_by: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class FormResponse(FormInDB):
    template: Optional[FormTemplateResponse] = None
    volunteer: Optional[VolunteerResponse] = None


class FormPagination(BaseModel):
    items: list[FormResponse]
    total: int
    page: int
    size: int
    pages: int
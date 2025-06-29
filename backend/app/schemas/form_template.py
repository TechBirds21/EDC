from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class FormTemplateBase(BaseModel):
    name: str
    version: int
    description: Optional[str] = None
    sections: Optional[Dict[str, Any]] = None
    side_headers: Optional[Dict[str, Any]] = None
    logic: Optional[Dict[str, Any]] = None


class FormTemplateCreate(FormTemplateBase):
    pass


class FormTemplateUpdate(BaseModel):
    name: Optional[str] = None
    version: Optional[int] = None
    description: Optional[str] = None
    sections: Optional[Dict[str, Any]] = None
    side_headers: Optional[Dict[str, Any]] = None
    logic: Optional[Dict[str, Any]] = None


class FormTemplateInDB(FormTemplateBase):
    id: UUID
    created_by: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class FormTemplateResponse(FormTemplateInDB):
    pass


class FormTemplatePagination(BaseModel):
    items: list[FormTemplateResponse]
    total: int
    page: int
    size: int
    pages: int
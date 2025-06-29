from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class ChangeLogBase(BaseModel):
    form_id: UUID
    field: str
    old: Optional[Dict[str, Any]] = None
    new: Optional[Dict[str, Any]] = None
    reason: str


class ChangeLogCreate(ChangeLogBase):
    changed_by: UUID


class ChangeLogInDB(ChangeLogBase):
    id: UUID
    changed_at: datetime
    changed_by: Optional[UUID] = None

    class Config:
        from_attributes = True


class ChangeLogResponse(ChangeLogInDB):
    pass


class ChangeLogPagination(BaseModel):
    items: list[ChangeLogResponse]
    total: int
    page: int
    size: int
    pages: int
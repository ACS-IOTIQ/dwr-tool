# backend/app/schemas/work_type.py
from pydantic import BaseModel
from typing import Optional


class WorkTypeCreate(BaseModel):
    label: str
    description: Optional[str] = None


class WorkTypeUpdate(BaseModel):
    label: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class WorkTypeRead(BaseModel):
    id: int
    label: str
    description: Optional[str] = None
    is_active: bool

    model_config = {"from_attributes": True}
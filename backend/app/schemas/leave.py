# backend/app/schemas/leave.py
from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


class LeaveCreate(BaseModel):
    user_id: int
    leave_date: date
    reason: Optional[str] = None


class LeaveRead(BaseModel):
    id: int
    user_id: int
    leave_date: date
    reason: Optional[str] = None
    marked_by_id: int
    created_at: datetime

    model_config = {"from_attributes": True}
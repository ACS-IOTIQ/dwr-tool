# backend/app/schemas/feedback.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.schemas.user import UserShort


class FeedbackCreate(BaseModel):
    comment: str
    is_flagged: bool = False


class FeedbackRead(BaseModel):
    id: int
    report_id: int
    reviewer: UserShort
    comment: str
    is_flagged: bool
    created_at: datetime

    model_config = {"from_attributes": True}
# backend/app/schemas/notification.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.notification import NotificationType


class NotificationRead(BaseModel):
    id: int
    type: NotificationType
    message: str
    is_read: bool
    report_id: Optional[int] = None
    created_at: datetime

    model_config = {"from_attributes": True}
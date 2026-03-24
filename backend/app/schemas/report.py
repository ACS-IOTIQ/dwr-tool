# backend/app/schemas/report.py
from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime
from app.models.report import ReportStatus, TaskStatus
from app.schemas.work_type import WorkTypeRead
from app.schemas.user import UserShort


class ReportTaskCreate(BaseModel):
    work_type_id: int
    task_description: str
    status: TaskStatus = TaskStatus.DONE
    time_spent_hours: Optional[float] = None
    notes: Optional[str] = None


class ReportTaskRead(BaseModel):
    id: int
    work_type_id: int
    work_type: WorkTypeRead
    task_description: str
    status: TaskStatus
    time_spent_hours: Optional[float] = None
    notes: Optional[str] = None

    model_config = {"from_attributes": True}


class ReportCreate(BaseModel):
    report_date: date
    plan_for_tomorrow: Optional[str] = None
    blockers: Optional[str] = None
    mood_rating: Optional[int] = None
    tasks: List[ReportTaskCreate]


class ReportRead(BaseModel):
    id: int
    user_id: int
    user: UserShort
    report_date: date
    plan_for_tomorrow: Optional[str] = None
    blockers: Optional[str] = None
    mood_rating: Optional[int] = None
    submitted_at: datetime
    is_late: bool
    review_status: ReportStatus
    tasks: List[ReportTaskRead]

    model_config = {"from_attributes": True}


class ReportFilter(BaseModel):
    user_ids: Optional[List[int]] = None
    work_type_ids: Optional[List[int]] = None
    date_from: Optional[date] = None
    date_to: Optional[date] = None
    review_status: Optional[ReportStatus] = None
    is_late: Optional[bool] = None
    has_blockers: Optional[bool] = None


class DailyStatusEntry(BaseModel):
    user: UserShort
    status: str  # SUBMITTED | LATE | MISSING | ON_LEAVE
    submitted_at: Optional[datetime] = None
    report_id: Optional[int] = None

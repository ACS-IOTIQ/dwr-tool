# backend/app/schemas/analysis.py
from pydantic import BaseModel
from typing import Optional
from datetime import date
from app.schemas.user import UserShort


class ReportAnalysisRequest(BaseModel):
    user_id: Optional[int] = None
    date_from: date
    date_to: date


class ReportAnalysisResult(BaseModel):
    user: UserShort
    working_days: int
    missed_reports: int
    underworked_days: int
    abnormal_duration_days: int
    sunday_reports: int
    blank_plan_reports: int


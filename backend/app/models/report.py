
# ── backend/app/models/report.py ────────────────────────────────
import enum
from datetime import datetime, date
from sqlalchemy import String, Text, Boolean, DateTime, Date, Float, Enum, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class ReportStatus(str, enum.Enum):
    PENDING   = "PENDING"
    REVIEWED  = "REVIEWED"
    FLAGGED   = "FLAGGED"

class TaskStatus(str, enum.Enum):
    DONE         = "DONE"
    IN_PROGRESS  = "IN_PROGRESS"
    CARRIED_OVER = "CARRIED_OVER"

class Report(Base):
    __tablename__ = "reports"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    report_date: Mapped[date] = mapped_column(Date, index=True)
    plan_for_tomorrow: Mapped[str | None] = mapped_column(Text, nullable=True)
    blockers: Mapped[str | None] = mapped_column(Text, nullable=True)
    mood_rating: Mapped[int | None] = mapped_column(Integer, nullable=True)  # 1-5
    submitted_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    is_late: Mapped[bool] = mapped_column(Boolean, default=False)
    review_status: Mapped[ReportStatus] = mapped_column(
        Enum(ReportStatus), default=ReportStatus.PENDING
    )

    user: Mapped["User"] = relationship("User", back_populates="reports")
    tasks: Mapped[list["ReportTask"]] = relationship(
        "ReportTask", back_populates="report", cascade="all, delete-orphan"
    )
    feedback: Mapped[list["Feedback"]] = relationship("Feedback", back_populates="report")


class ReportTask(Base):
    __tablename__ = "report_tasks"

    id: Mapped[int] = mapped_column(primary_key=True)
    report_id: Mapped[int] = mapped_column(ForeignKey("reports.id", ondelete="CASCADE"))
    work_type_id: Mapped[int] = mapped_column(ForeignKey("work_types.id"))
    task_description: Mapped[str] = mapped_column(Text)
    status: Mapped[TaskStatus] = mapped_column(Enum(TaskStatus), default=TaskStatus.DONE)
    time_spent_hours: Mapped[float | None] = mapped_column(Float, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    report: Mapped["Report"] = relationship("Report", back_populates="tasks")
    work_type: Mapped["WorkType"] = relationship("WorkType", back_populates="tasks")


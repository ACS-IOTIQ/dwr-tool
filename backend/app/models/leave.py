# backend/app/models/leave.py
from datetime import date, datetime
from sqlalchemy import Text, Date, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class LeaveLog(Base):
    __tablename__ = "leave_log"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE")
    )
    leave_date: Mapped[date] = mapped_column(Date)
    reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    marked_by_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE")
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Explicit foreign_keys required because two FKs point to users
    user: Mapped["User"] = relationship(
        "User",
        back_populates="leave_logs",
        foreign_keys=[user_id],
    )
    marked_by: Mapped["User"] = relationship(
        "User",
        foreign_keys=[marked_by_id],
    )
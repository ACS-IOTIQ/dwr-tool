# backend/app/models/notification.py
import enum
from datetime import datetime
from sqlalchemy import Text, Boolean, DateTime, Enum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class NotificationType(str, enum.Enum):
    NEW_SUBMISSION  = "NEW_SUBMISSION"
    FEEDBACK_GIVEN  = "FEEDBACK_GIVEN"
    LATE_SUBMISSION = "LATE_SUBMISSION"
    BROADCAST       = "BROADCAST"


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(primary_key=True)
    recipient_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE")
    )
    triggered_by_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    report_id: Mapped[int | None] = mapped_column(
        ForeignKey("reports.id", ondelete="SET NULL"), nullable=True
    )
    type: Mapped[NotificationType] = mapped_column(Enum(NotificationType))
    message: Mapped[str] = mapped_column(Text)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Explicit foreign_keys required because two FKs point to users
    recipient: Mapped["User"] = relationship(
        "User",
        back_populates="notifications",
        foreign_keys=[recipient_id],
    )
    triggered_by: Mapped["User | None"] = relationship(
        "User",
        foreign_keys=[triggered_by_id],
    )
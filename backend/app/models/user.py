# backend/app/models/user.py
import enum
from datetime import datetime
from sqlalchemy import String, Boolean, DateTime, Enum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Role(str, enum.Enum):
    ADMIN = "ADMIN"
    TEAM_MEMBER = "TEAM_MEMBER"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[Role] = mapped_column(Enum(Role), default=Role.TEAM_MEMBER)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    reporting_manager_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    secondary_manager_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )

    secondary_manager_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )

    # Self-referential
    reporting_manager: Mapped["User | None"] = relationship(
        "User",
        remote_side="User.id",
        foreign_keys=[reporting_manager_id],
        back_populates="reportees",
    )
    reportees: Mapped[list["User"]] = relationship(
        "User",
        back_populates="reporting_manager",
        foreign_keys="User.reporting_manager_id",
    )
    secondary_manager: Mapped["User | None"] = relationship(
        "User",
        remote_side="User.id",
        foreign_keys=[secondary_manager_id],
        back_populates="secondary_reportees",
    )
    secondary_reportees: Mapped[list["User"]] = relationship(
        "User",
        back_populates="secondary_manager",
        foreign_keys="User.secondary_manager_id",
    )

    # Cross-model relationships — resolved by string; all target models
    # must be imported before any mapper is configured (handled in __init__.py)
    reports: Mapped[list["Report"]] = relationship(
        "Report", back_populates="user"
    )
    feedback_given: Mapped[list["Feedback"]] = relationship(
        "Feedback", back_populates="reviewer"
    )
    notifications: Mapped[list["Notification"]] = relationship(
        "Notification",
        back_populates="recipient",
        primaryjoin="Notification.recipient_id == User.id",
        foreign_keys="[Notification.recipient_id]",
    )
    leave_logs: Mapped[list["LeaveLog"]] = relationship(
        "LeaveLog",
        back_populates="user",
        primaryjoin="LeaveLog.user_id == User.id",
        foreign_keys="[LeaveLog.user_id]",
    )
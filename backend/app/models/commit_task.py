import enum
from datetime import datetime
from sqlalchemy import DateTime, Enum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class CommitTaskStatus(str, enum.Enum):
    IMPORTED = "IMPORTED"
    UNMAPPED = "UNMAPPED"
    LINKED_TO_REPORT = "LINKED_TO_REPORT"


class CommitTask(Base):
    __tablename__ = "commit_tasks"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    repository_name: Mapped[str] = mapped_column(String(255), index=True)
    branch_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    commit_sha: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    commit_message: Mapped[str] = mapped_column(Text)
    commit_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    author_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    author_email: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    committed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True, index=True)
    received_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    status: Mapped[CommitTaskStatus] = mapped_column(
        Enum(CommitTaskStatus),
        default=CommitTaskStatus.IMPORTED,
        index=True,
    )

    user: Mapped["User | None"] = relationship("User")

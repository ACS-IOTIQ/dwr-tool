from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session, joinedload
from app.models.commit_task import CommitTask, CommitTaskStatus


def list_commit_tasks(
    db: Session,
    visible_user_ids: list[int] | None,
    user_id: Optional[int] = None,
    repository_name: Optional[str] = None,
    status: Optional[CommitTaskStatus] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
) -> list[CommitTask]:
    q = db.query(CommitTask).options(joinedload(CommitTask.user))

    if visible_user_ids is not None:
        q = q.filter(
            (CommitTask.user_id.is_(None)) | (CommitTask.user_id.in_(visible_user_ids))
        )
    if user_id is not None:
        q = q.filter(CommitTask.user_id == user_id)
    if repository_name:
        q = q.filter(CommitTask.repository_name == repository_name)
    if status:
        q = q.filter(CommitTask.status == status)
    if date_from:
        q = q.filter(CommitTask.received_at >= date_from)
    if date_to:
        q = q.filter(CommitTask.received_at <= date_to)

    return q.order_by(CommitTask.received_at.desc()).all()

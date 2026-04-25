from datetime import date, datetime, time
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user, require_admin_or_rm
from app.models.commit_task import CommitTaskStatus
from app.models.user import User
from app.schemas.commit_task import CommitTaskRead
from app.services.commit_task_service import list_commit_tasks
from app.services.user_service import get_visible_user_ids

router = APIRouter(prefix="/commit-tasks", tags=["commit-tasks"])


def _start_of_day(value: Optional[date]) -> Optional[datetime]:
    if value is None:
        return None
    return datetime.combine(value, time.min)


def _end_of_day(value: Optional[date]) -> Optional[datetime]:
    if value is None:
        return None
    return datetime.combine(value, time.max)


@router.get("/my", response_model=List[CommitTaskRead])
def my_commit_tasks(
    repository_name: Optional[str] = Query(default=None),
    status: Optional[CommitTaskStatus] = Query(default=None),
    date_from: Optional[date] = Query(default=None),
    date_to: Optional[date] = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return list_commit_tasks(
        db,
        visible_user_ids=[current_user.id],
        user_id=current_user.id,
        repository_name=repository_name,
        status=status,
        date_from=_start_of_day(date_from),
        date_to=_end_of_day(date_to),
    )


@router.get("/", response_model=List[CommitTaskRead])
def visible_commit_tasks(
    user_id: Optional[int] = Query(default=None),
    repository_name: Optional[str] = Query(default=None),
    status: Optional[CommitTaskStatus] = Query(default=None),
    date_from: Optional[date] = Query(default=None),
    date_to: Optional[date] = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_rm),
):
    visible_ids = get_visible_user_ids(db, current_user)
    return list_commit_tasks(
        db,
        visible_user_ids=visible_ids,
        user_id=user_id,
        repository_name=repository_name,
        status=status,
        date_from=_start_of_day(date_from),
        date_to=_end_of_day(date_to),
    )

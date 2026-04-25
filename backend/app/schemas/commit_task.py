from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.models.commit_task import CommitTaskStatus
from app.schemas.user import UserShort


class CommitTaskRead(BaseModel):
    id: int
    user_id: Optional[int] = None
    user: Optional[UserShort] = None
    repository_name: str
    branch_name: Optional[str] = None
    commit_sha: str
    commit_message: str
    commit_url: Optional[str] = None
    author_name: Optional[str] = None
    author_email: Optional[str] = None
    committed_at: Optional[datetime] = None
    received_at: datetime
    status: CommitTaskStatus

    model_config = {"from_attributes": True}

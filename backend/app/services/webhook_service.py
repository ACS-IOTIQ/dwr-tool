import hashlib
import hmac
import json
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.config import settings
from app.models.commit_task import CommitTask, CommitTaskStatus
from app.services.user_service import get_user_by_email


def verify_github_signature(payload: bytes, signature_header: str | None) -> bool:
    if not signature_header or not settings.GITHUB_WEBHOOK_SECRET:
        return False

    expected = "sha256=" + hmac.new(
        settings.GITHUB_WEBHOOK_SECRET.encode("utf-8"),
        payload,
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(expected, signature_header)


def parse_github_payload(payload: bytes) -> dict:
    return json.loads(payload.decode("utf-8"))


def _normalize_branch_name(ref: str | None) -> str | None:
    if not ref:
        return None
    prefix = "refs/heads/"
    if ref.startswith(prefix):
        return ref[len(prefix):]
    return ref


def _parse_commit_timestamp(value: str | None) -> datetime | None:
    if not value:
        return None

    parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if parsed.tzinfo is None:
        return parsed
    return parsed.astimezone(timezone.utc).replace(tzinfo=None)


def process_github_push_event(db: Session, payload: dict) -> dict:
    repo = payload.get("repository", {}) or {}
    repository_name = repo.get("full_name") or repo.get("name") or "unknown"
    branch_name = _normalize_branch_name(payload.get("ref"))
    commits = payload.get("commits") or []

    result = {
        "repository_name": repository_name,
        "branch_name": branch_name,
        "received_commits": len(commits),
        "stored_commits": 0,
        "mapped_commits": 0,
        "unmapped_commits": 0,
        "duplicate_commits": 0,
    }

    for commit in commits:
        commit_sha = commit.get("id")
        if not commit_sha:
            continue

        exists = db.query(CommitTask.id).filter(CommitTask.commit_sha == commit_sha).first()
        if exists:
            result["duplicate_commits"] += 1
            continue

        author = commit.get("author") or {}
        author_email = author.get("email")
        user = get_user_by_email(db, author_email) if author_email else None
        status = CommitTaskStatus.IMPORTED if user else CommitTaskStatus.UNMAPPED

        if user:
            result["mapped_commits"] += 1
        else:
            result["unmapped_commits"] += 1

        db.add(
            CommitTask(
                user_id=user.id if user else None,
                repository_name=repository_name,
                branch_name=branch_name,
                commit_sha=commit_sha,
                commit_message=(commit.get("message") or "").strip(),
                commit_url=commit.get("url"),
                author_name=author.get("name"),
                author_email=author_email.lower() if author_email else None,
                committed_at=_parse_commit_timestamp(commit.get("timestamp")),
                status=status,
            )
        )
        result["stored_commits"] += 1

    db.commit()
    return result

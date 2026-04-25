from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.webhook_service import (
    parse_github_payload,
    process_github_push_event,
    verify_github_signature,
)

router = APIRouter(prefix="/webhooks", tags=["webhooks"])


@router.get("/github")
def github_webhook_info():
    return {"detail": "GitHub webhook endpoint is live. Use POST for deliveries."}


@router.post("/github")
async def github_webhook(
    request: Request,
    db: Session = Depends(get_db),
    x_github_event: str | None = Header(default=None, alias="X-GitHub-Event"),
    x_hub_signature_256: str | None = Header(default=None, alias="X-Hub-Signature-256"),
):
    payload = await request.body()

    if not verify_github_signature(payload, x_hub_signature_256):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid GitHub signature",
        )

    event_payload = parse_github_payload(payload)

    if x_github_event == "ping":
        return {
            "detail": "GitHub webhook verified",
            "repository_name": (event_payload.get("repository") or {}).get("full_name"),
        }

    if x_github_event != "push":
        return {"detail": f"Ignored GitHub event: {x_github_event}"}

    return process_github_push_event(db, event_payload)

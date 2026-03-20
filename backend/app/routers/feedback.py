
# ── backend/app/routers/feedback.py ─────────────────────────────
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.feedback import FeedbackCreate, FeedbackRead
from app.models.feedback import Feedback
from app.services.report_service import get_report_by_id
from app.services.notification_service import notify_feedback
from app.services.user_service import get_visible_user_ids
from app.dependencies import get_current_user, require_admin_or_rm
from app.models.user import User

router = APIRouter(prefix="/feedback", tags=["feedback"])

@router.get("/report/{report_id}", response_model=List[FeedbackRead])
def get_feedback(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    report = get_report_by_id(db, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    visible = get_visible_user_ids(db, current_user)
    if visible is not None and report.user_id not in visible:
        raise HTTPException(status_code=403)
    return db.query(Feedback).filter(Feedback.report_id == report_id).all()

@router.post("/report/{report_id}", response_model=FeedbackRead)
def post_feedback(
    report_id: int,
    data: FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_rm)
):
    report = get_report_by_id(db, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    fb = Feedback(
        report_id=report_id,
        reviewer_id=current_user.id,
        comment=data.comment,
        is_flagged=data.is_flagged,
    )
    db.add(fb)
    db.commit()
    db.refresh(fb)
    notify_feedback(db, current_user, report.user_id, report_id)
    return fb


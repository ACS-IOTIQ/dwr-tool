

# ── backend/app/routers/reports.py ──────────────────────────────
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from app.database import get_db
from app.schemas.report import ReportCreate, ReportRead, ReportFilter, DailyStatusEntry
from app.schemas.analysis import ReportAnalysisRequest, ReportAnalysisResult
from app.schemas.user import UserShort
from app.services.report_service import (
    create_report, get_report_by_id, get_report_for_date,
    filter_reports, get_daily_status
)
from app.services.analysis_service import analyze_reports
from app.services.notification_service import notify_submission
from app.services.user_service import get_visible_user_ids, get_all_active_users
from app.dependencies import get_current_user, require_admin_or_rm
from app.models.user import User, Role
from app.models.report import ReportStatus

router = APIRouter(prefix="/reports", tags=["reports"])

@router.post("/", response_model=ReportRead)
def submit_report(
    data: ReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):



    if not data.tasks:
        raise HTTPException(status_code=400, detail="At least one task entry required")
    report = create_report(db, current_user.id, data)
    notify_submission(db, current_user, report.id)
    return report

@router.get("/my", response_model=List[ReportRead])
def my_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    f = ReportFilter(user_ids=[current_user.id])
    return filter_reports(db, f, [current_user.id])

@router.get("/daily-status", response_model=List[DailyStatusEntry])
def daily_status(
    target_date: date = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_rm)
):
    from datetime import date as date_cls
    d = target_date or date_cls.today()
    visible_ids = get_visible_user_ids(db, current_user)
    if visible_ids is None:
        users = get_all_active_users(db)
    else:
        from app.services.user_service import get_user_by_id
        users = [get_user_by_id(db, uid) for uid in visible_ids if uid != current_user.id]
    return get_daily_status(db, d, users)

@router.post("/search", response_model=List[ReportRead])
def search_reports(
    f: ReportFilter,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_rm)
):
    visible = get_visible_user_ids(db, current_user)
    return filter_reports(db, f, visible)

@router.get("/analysis/users", response_model=List[UserShort])
def analysis_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_rm)
):
    visible_ids = get_visible_user_ids(db, current_user)
    if visible_ids is None:
        users = get_all_active_users(db)
    else:
        ids = [i for i in visible_ids if i != current_user.id]
        users = db.query(User).filter(User.id.in_(ids), User.is_active == True).all()
    return [UserShort.model_validate(u) for u in users]

@router.post("/analysis", response_model=List[ReportAnalysisResult])
def analyze(
    req: ReportAnalysisRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_rm)
):
    if req.date_to < req.date_from:
        raise HTTPException(status_code=400, detail="date_to must be on or after date_from")

    visible_ids = get_visible_user_ids(db, current_user)
    if req.user_id:
        if visible_ids is not None and req.user_id not in visible_ids:
            raise HTTPException(status_code=403, detail="Access denied")
        if current_user.role != Role.ADMIN and req.user_id == current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")
        user = db.query(User).filter(User.id == req.user_id, User.is_active == True).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        users = [user]
    else:
        if visible_ids is None:
            users = get_all_active_users(db)
        else:
            ids = [i for i in visible_ids if i != current_user.id]
            users = db.query(User).filter(User.id.in_(ids), User.is_active == True).all()

    return analyze_reports(db, req, users)

@router.get("/{report_id}", response_model=ReportRead)
def get_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    report = get_report_by_id(db, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    visible = get_visible_user_ids(db, current_user)
    if visible is not None and report.user_id not in visible:
        raise HTTPException(status_code=403, detail="Access denied")
    return report

@router.patch("/{report_id}/status")
def update_review_status(
    report_id: int,
    review_status: ReportStatus,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_rm)
):
    report = get_report_by_id(db, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    report.review_status = review_status
    db.commit()
    return {"detail": "Status updated"}


# ── backend/app/routers/leave.py ─────────────────────────────────
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import date
from app.database import get_db
from app.schemas.leave import LeaveCreate, LeaveRead
from app.models.leave import LeaveLog
from app.dependencies import require_admin
from app.models.user import User

router = APIRouter(prefix="/leave", tags=["leave"])

@router.get("/", response_model=List[LeaveRead])
def list_leave(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return db.query(LeaveLog).order_by(LeaveLog.leave_date.desc()).all()

@router.post("/", response_model=LeaveRead)
def mark_leave(
    data: LeaveCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    existing = db.query(LeaveLog).filter(
        LeaveLog.user_id == data.user_id,
        LeaveLog.leave_date == data.leave_date
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Leave already marked for this date")
    leave = LeaveLog(**data.model_dump(), marked_by_id=current_user.id)
    db.add(leave)
    db.commit()
    db.refresh(leave)
    return leave

@router.delete("/{leave_id}")
def remove_leave(
    leave_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    leave = db.query(LeaveLog).filter(LeaveLog.id == leave_id).first()
    if not leave:
        raise HTTPException(status_code=404, detail="Leave record not found")
    db.delete(leave)
    db.commit()
    return {"detail": "Leave removed"}
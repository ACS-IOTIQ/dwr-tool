
# ── backend/app/routers/work_types.py ───────────────────────────
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.work_type import WorkTypeCreate, WorkTypeUpdate, WorkTypeRead
from app.models.work_type import WorkType
from app.dependencies import get_current_user, require_admin
from app.models.user import User

router = APIRouter(prefix="/work-types", tags=["work-types"])

@router.get("/", response_model=List[WorkTypeRead])
def list_work_types(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)
):
    return db.query(WorkType).filter(WorkType.is_active == True).all()

@router.post("/", response_model=WorkTypeRead)
def create_work_type(
    data: WorkTypeCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    wt = WorkType(**data.model_dump())
    db.add(wt)
    db.commit()
    db.refresh(wt)
    return wt

@router.put("/{wt_id}", response_model=WorkTypeRead)
def update_work_type(
    wt_id: int,
    data: WorkTypeUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    wt = db.query(WorkType).filter(WorkType.id == wt_id).first()
    if not wt:
        raise HTTPException(status_code=404, detail="WorkType not found")
    for f, v in data.model_dump(exclude_none=True).items():
        setattr(wt, f, v)
    db.commit()
    db.refresh(wt)
    return wt

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.user import UserCreate, UserUpdate, UserRead, PasswordChange
from app.services.auth_service import hash_password, verify_password
from app.services.user_service import get_all_active_users, get_user_by_id, get_visible_user_ids
from app.dependencies import get_current_user, require_admin, require_admin_or_rm
from app.models.user import User

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/", response_model=List[UserRead])
def list_users(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    users = get_all_active_users(db)
    result = []
    for u in users:
        ur = UserRead.model_validate(u)
        ur.reporting_manager_name = u.reporting_manager.name if u.reporting_manager else None
        ur.secondary_manager_name = u.secondary_manager.name if u.secondary_manager else None
        result.append(ur)
    return result


@router.get("/managers", response_model=List[UserRead])
def list_managers(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    return get_all_active_users(db)


@router.get("/visible", response_model=List[UserRead])
def list_visible_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_rm)
):
    visible_ids = get_visible_user_ids(db, current_user)
    if visible_ids is None:
        users = get_all_active_users(db)
    else:
        ids = [i for i in visible_ids if i != current_user.id]
        users = db.query(User).filter(User.id.in_(ids), User.is_active == True).all()

    result = []
    for u in users:
        ur = UserRead.model_validate(u)
        ur.reporting_manager_name = u.reporting_manager.name if u.reporting_manager else None
        ur.secondary_manager_name = u.secondary_manager.name if u.secondary_manager else None
        result.append(ur)
    return result


@router.post("/", response_model=UserRead)
def create_user(
    data: UserCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    from app.services.user_service import get_user_by_email
    if get_user_by_email(db, data.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        name=data.name,
        email=data.email,
        password_hash=hash_password(data.password),
        role=data.role,
        reporting_manager_id=data.reporting_manager_id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.put("/{user_id}", response_model=UserRead)
def update_user(
    user_id: int,
    data: dict,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Handle new_password separately
    new_password = data.pop("new_password", None)
    if new_password:
        user.password_hash = hash_password(new_password)

    # Update remaining fields
    allowed = {"name", "email", "role", "reporting_manager_id", "secondary_manager_id", "is_active"}
    for field, val in data.items():
        if field in allowed:
            setattr(user, field, val)

    db.commit()
    db.refresh(user)
    ur = UserRead.model_validate(user)
    ur.reporting_manager_name = user.reporting_manager.name if user.reporting_manager else None
    ur.secondary_manager_name = user.secondary_manager.name if user.secondary_manager else None
    return ur


@router.post("/{user_id}/deactivate")
def deactivate_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot deactivate yourself")
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = False
    db.commit()
    return {"detail": "User deactivated"}


@router.post("/me/change-password")
def change_password(
    data: PasswordChange,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not verify_password(data.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Current password incorrect")
    current_user.password_hash = hash_password(data.new_password)
    db.commit()
    return {"detail": "Password updated"}

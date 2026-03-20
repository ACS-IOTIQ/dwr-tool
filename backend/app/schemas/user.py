# backend/app/schemas/user.py
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from app.models.user import Role


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Role = Role.TEAM_MEMBER
    reporting_manager_id: Optional[int] = None
    secondary_manager_id: Optional[int] = None


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[Role] = None
    reporting_manager_id: Optional[int] = None
    secondary_manager_id: Optional[int] = None
    is_active: Optional[bool] = None


class UserRead(BaseModel):
    id: int
    name: str
    email: str
    role: Role
    is_active: bool
    reporting_manager_id: Optional[int] = None
    reporting_manager_name: Optional[str] = None
    secondary_manager_id: Optional[int] = None
    secondary_manager_name: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class UserShort(BaseModel):
    id: int
    name: str
    role: Role

    model_config = {"from_attributes": True}


class PasswordChange(BaseModel):
    current_password: str
    new_password: str
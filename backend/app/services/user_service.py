# backend/app/services/user_service.py
from sqlalchemy.orm import Session
from app.models.user import User, Role


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(db: Session, user_id: int) -> User | None:
    return db.query(User).filter(User.id == user_id).first()


def get_all_active_users(db: Session) -> list[User]:
    return db.query(User).filter(User.is_active == True).all()


def get_reportees(db: Session, manager_id: int) -> list[User]:
    """Return direct primary reportees of a manager."""
    return db.query(User).filter(
        User.reporting_manager_id == manager_id,
        User.is_active == True
    ).all()


def get_secondary_reportees(db: Session, manager_id: int) -> list[User]:
    """Return users who have this manager as secondary manager."""
    return db.query(User).filter(
        User.secondary_manager_id == manager_id,
        User.is_active == True
    ).all()


def get_visible_user_ids(db: Session, current_user: User) -> list[int] | None:
    """
    ADMIN → None (meaning all users)
    RM/Secondary RM → their primary + secondary reportees + themselves
    TM → only themselves
    """
    if current_user.role == Role.ADMIN:
        return None

    primary_ids = [u.id for u in get_reportees(db, current_user.id)]
    secondary_ids = [u.id for u in get_secondary_reportees(db, current_user.id)]

    # Combine, deduplicate, include self
    all_ids = list(set(primary_ids + secondary_ids + [current_user.id]))
    return all_ids


def is_reporting_manager(db: Session, user: User) -> bool:
    """True if user is primary OR secondary manager of anyone."""
    is_primary = db.query(User).filter(
        User.reporting_manager_id == user.id,
        User.is_active == True
    ).first() is not None

    is_secondary = db.query(User).filter(
        User.secondary_manager_id == user.id,
        User.is_active == True
    ).first() is not None

    return is_primary or is_secondary
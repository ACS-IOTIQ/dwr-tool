
# ── backend/app/services/notification_service.py ────────────────
from sqlalchemy.orm import Session
from app.models.notification import Notification, NotificationType
from app.models.user import User, Role

def _create(db: Session, recipient_id: int, triggered_by_id: int,
            report_id: int, ntype: NotificationType, message: str):
    n = Notification(
        recipient_id=recipient_id,
        triggered_by_id=triggered_by_id,
        report_id=report_id,
        type=ntype,
        message=message,
    )
    db.add(n)

def notify_submission(db: Session, submitter: User, report_id: int):
    """Notify RM (if any) and all ADMINs on new report submission."""
    msg = f"{submitter.name} submitted their daily report."
    notified = set()

    if submitter.reporting_manager_id:
        _create(db, submitter.reporting_manager_id, submitter.id,
                report_id, NotificationType.NEW_SUBMISSION, msg)
        notified.add(submitter.reporting_manager_id)

    admins = db.query(User).filter(User.role == Role.ADMIN, User.is_active == True).all()
    for admin in admins:
        if admin.id not in notified and admin.id != submitter.id:
            _create(db, admin.id, submitter.id, report_id,
                    NotificationType.NEW_SUBMISSION, msg)
    db.commit()

def notify_feedback(db: Session, reviewer: User, report_owner_id: int, report_id: int):
    msg = f"{reviewer.name} gave feedback on your report."
    _create(db, report_owner_id, reviewer.id, report_id,
            NotificationType.FEEDBACK_GIVEN, msg)
    db.commit()
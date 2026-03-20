from datetime import datetime, date
import pytz
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_
from app.models.report import Report, ReportTask
from app.models.leave import LeaveLog
from app.models.user import User
from app.schemas.report import ReportCreate, ReportFilter, DailyStatusEntry
from app.schemas.user import UserShort
from app.config import settings


def _is_late(submitted_at: datetime) -> bool:
    tz = pytz.timezone(settings.APP_TIMEZONE)
    # submitted_at is naive UTC — make it timezone-aware first
    if submitted_at.tzinfo is None:
        submitted_at = pytz.utc.localize(submitted_at)
    local_time = submitted_at.astimezone(tz)
    cutoff = local_time.replace(
        hour=settings.REPORT_CUTOFF_HOUR,
        minute=settings.REPORT_CUTOFF_MINUTE,
        second=0, microsecond=0
    )
    return local_time > cutoff


def create_report(db: Session, user_id: int, data: ReportCreate) -> Report:
    now = datetime.utcnow()
    report = Report(
        user_id=user_id,
        report_date=data.report_date,
        plan_for_tomorrow=data.plan_for_tomorrow,
        blockers=data.blockers,
        mood_rating=data.mood_rating,
        submitted_at=now,
        is_late=_is_late(now),
    )
    db.add(report)
    db.flush()
    for t in data.tasks:
        task = ReportTask(report_id=report.id, **t.model_dump())
        db.add(task)
    db.commit()
    db.refresh(report)
    return report


def get_report_by_id(db: Session, report_id: int) -> Report | None:
    return (
        db.query(Report)
        .options(
            joinedload(Report.user),
            joinedload(Report.tasks).joinedload(ReportTask.work_type),
            joinedload(Report.feedback),
        )
        .filter(Report.id == report_id)
        .first()
    )


def get_report_for_date(db: Session, user_id: int, report_date: date) -> Report | None:
    return db.query(Report).filter(
        Report.user_id == user_id,
        Report.report_date == report_date
    ).first()


def filter_reports(
    db: Session,
    f: ReportFilter,
    visible_user_ids: list[int] | None
) -> list[Report]:
    q = db.query(Report).options(
        joinedload(Report.user),
        joinedload(Report.tasks).joinedload(ReportTask.work_type),
    )
    if visible_user_ids is not None:
        q = q.filter(Report.user_id.in_(visible_user_ids))
    if f.user_ids:
        ids = f.user_ids if visible_user_ids is None else [
            i for i in f.user_ids if i in visible_user_ids
        ]
        q = q.filter(Report.user_id.in_(ids))
    if f.date_from:
        q = q.filter(Report.report_date >= f.date_from)
    if f.date_to:
        q = q.filter(Report.report_date <= f.date_to)
    if f.review_status:
        q = q.filter(Report.review_status == f.review_status)
    if f.is_late is not None:
        q = q.filter(Report.is_late == f.is_late)
    if f.has_blockers:
        q = q.filter(Report.blockers.isnot(None), Report.blockers != "")
    if f.work_type_ids:
        q = q.join(Report.tasks).filter(ReportTask.work_type_id.in_(f.work_type_ids))
    return q.order_by(Report.report_date.desc(), Report.submitted_at.desc()).all()


def get_daily_status(
    db: Session,
    target_date: date,
    users: list[User]
) -> list[DailyStatusEntry]:
    report_map = {
        r.user_id: r
        for r in db.query(Report).filter(Report.report_date == target_date).all()
    }
    leave_set = {
        l.user_id
        for l in db.query(LeaveLog).filter(LeaveLog.leave_date == target_date).all()
    }
    entries = []
    for u in users:
        r = report_map.get(u.id)
        if u.id in leave_set:
            status = "ON_LEAVE"
        elif r is None:
            status = "MISSING"
        elif r.is_late:
            status = "LATE"
        else:
            status = "SUBMITTED"
        entries.append(DailyStatusEntry(
            user=UserShort(id=u.id, name=u.name, role=u.role),
            status=status,
            submitted_at=r.submitted_at if r else None,
            report_id=r.id if r else None,
        ))
    return entries
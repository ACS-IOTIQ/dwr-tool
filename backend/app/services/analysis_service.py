from datetime import date, timedelta
from typing import Iterable
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_
from app.models.report import Report
from app.models.leave import LeaveLog
from app.models.user import User
from app.schemas.analysis import ReportAnalysisRequest, ReportAnalysisResult
from app.schemas.user import UserShort


HOLIDAYS_2026 = {
    date(2026, 1, 1),
    date(2026, 1, 14),
    date(2026, 1, 15),
    date(2026, 1, 26),
    date(2026, 3, 3),
    date(2026, 3, 19),
    date(2026, 3, 27),
    date(2026, 8, 15),
    date(2026, 9, 14),
    date(2026, 10, 2),
    date(2026, 10, 20),
    date(2026, 11, 9),
    date(2026, 12, 25),
}


def _date_range(start: date, end: date) -> Iterable[date]:
    d = start
    while d <= end:
        yield d
        d += timedelta(days=1)


def _is_second_saturday(d: date) -> bool:
    return d.weekday() == 5 and 8 <= d.day <= 14


def _is_non_working_day(d: date) -> bool:
    return d.weekday() == 6 or _is_second_saturday(d) or d in HOLIDAYS_2026


def _sum_hours(report: Report) -> float:
    return sum((t.time_spent_hours or 0) for t in report.tasks)


def analyze_reports(
    db: Session,
    req: ReportAnalysisRequest,
    users: list[User]
) -> list[ReportAnalysisResult]:
    if req.date_to < req.date_from:
        return []
    if not users:
        return []

    user_ids = [u.id for u in users]

    reports = (
        db.query(Report)
        .options(joinedload(Report.tasks))
        .filter(
            Report.user_id.in_(user_ids),
            and_(Report.report_date >= req.date_from, Report.report_date <= req.date_to)
        )
        .all()
    )

    leaves = (
        db.query(LeaveLog)
        .filter(
            LeaveLog.user_id.in_(user_ids),
            and_(LeaveLog.leave_date >= req.date_from, LeaveLog.leave_date <= req.date_to)
        )
        .all()
    )

    reports_by_user = {u.id: {} for u in users}
    for r in reports:
        reports_by_user[r.user_id][r.report_date] = r

    leaves_by_user = {u.id: set() for u in users}
    for l in leaves:
        leaves_by_user[l.user_id].add(l.leave_date)

    results = []
    for u in users:
        user_reports = reports_by_user.get(u.id, {})
        user_leaves = leaves_by_user.get(u.id, set())

        working_days = 0
        missed_reports = 0
        underworked_days = 0

        for d in _date_range(req.date_from, req.date_to):
            if _is_non_working_day(d) or d in user_leaves:
                continue
            working_days += 1
            report = user_reports.get(d)
            if not report:
                missed_reports += 1
                continue
            total_hours = _sum_hours(report)
            threshold = 3 if d.weekday() == 5 else 6
            if total_hours < threshold:
                underworked_days += 1

        sunday_reports = sum(
            1 for r in user_reports.values() if r.report_date.weekday() == 6
        )
        abnormal_duration_days = sum(
            1 for r in user_reports.values() if _sum_hours(r) > 10
        )
        blank_plan_reports = sum(
            1 for r in user_reports.values()
            if not (r.plan_for_tomorrow or "").strip()
        )

        results.append(ReportAnalysisResult(
            user=UserShort.model_validate(u),
            working_days=working_days,
            missed_reports=missed_reports,
            underworked_days=underworked_days,
            abnormal_duration_days=abnormal_duration_days,
            sunday_reports=sunday_reports,
            blank_plan_reports=blank_plan_reports,
        ))

    results.sort(key=lambda r: r.user.name)
    return results

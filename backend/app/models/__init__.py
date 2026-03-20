# backend/app/models/__init__.py
#
# IMPORT ORDER MATTERS — import in dependency order so SQLAlchemy
# string-based relationship references ("Report", "Feedback" etc.)
# are resolvable when mappers are configured.
#
# Rule: a model must be imported BEFORE any model that references
# it only by string name in a relationship().

from .work_type import WorkType        # no dependencies
from .user import User, Role           # references Report/Feedback by string → OK as long as those are imported before mapper config runs
from .report import Report, ReportTask, ReportStatus, TaskStatus   # depends on User, WorkType
from .feedback import Feedback         # depends on Report, User
from .notification import Notification, NotificationType           # depends on User
from .leave import LeaveLog            # depends on User

__all__ = [
    "User", "Role",
    "WorkType",
    "Report", "ReportTask", "ReportStatus", "TaskStatus",
    "Feedback",
    "Notification", "NotificationType",
    "LeaveLog",
]
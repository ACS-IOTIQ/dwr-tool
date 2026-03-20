# backend/seed.py
"""
Run once after migrations to create admin user + default work types.
Usage:  python seed.py
"""
import sys
import os

# Ensure 'backend/' is on the path so 'app' is importable
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# --- Import ALL models explicitly before touching the session ---
# This forces SQLAlchemy to register every mapper before any query runs.
from app.models import (       # noqa: F401  (order handled inside __init__)
    User, Role,
    WorkType,
    Report, ReportTask,
    Feedback,
    Notification,
    LeaveLog,
)

from app.database import SessionLocal
from app.services.auth_service import hash_password


def seed():
    db = SessionLocal()
    try:
        # ── Admin user ───────────────────────────────────────────
        if not db.query(User).filter(User.email == "admin@company.com").first():
            admin = User(
                name="Admin",
                email="admin@company.com",
                password_hash=hash_password("Admin@1234"),
                role=Role.ADMIN,
            )
            db.add(admin)
            print("✓ Admin user created: admin@company.com / Admin@1234")
        else:
            print("  Admin user already exists — skipping")

        # ── Default WorkTypes ────────────────────────────────────
        defaults = [
            ("Assigned Task",   "Sprint tickets, deliverables, project work"),
            ("Study",           "Learning, reading, online courses"),
            ("Experiment",      "POCs, prototyping, research spikes"),
            ("Meeting",         "Standups, calls, planning sessions"),
            ("Support",         "Bug fixes, production issues, help requests"),
            ("Admin / Process", "Documentation, code review, process work"),
            ("Other",           "Anything else — add a note"),
        ]
        for label, desc in defaults:
            if not db.query(WorkType).filter(WorkType.label == label).first():
                db.add(WorkType(label=label, description=desc))
                print(f"✓ WorkType: {label}")
            else:
                print(f"  WorkType '{label}' already exists — skipping")

        db.commit()
        print("\n✅ Seed complete.")

    except Exception as e:
        db.rollback()
        print(f"\n❌ Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
"""add commit tasks

Revision ID: 4e8fd9dfc3b1
Revises: 0bc4832e421b
Create Date: 2026-04-25 17:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "4e8fd9dfc3b1"
down_revision: Union[str, None] = "0bc4832e421b"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "commit_tasks",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("repository_name", sa.String(length=255), nullable=False),
        sa.Column("branch_name", sa.String(length=255), nullable=True),
        sa.Column("commit_sha", sa.String(length=64), nullable=False),
        sa.Column("commit_message", sa.Text(), nullable=False),
        sa.Column("commit_url", sa.String(length=500), nullable=True),
        sa.Column("author_name", sa.String(length=255), nullable=True),
        sa.Column("author_email", sa.String(length=255), nullable=True),
        sa.Column("committed_at", sa.DateTime(), nullable=True),
        sa.Column("received_at", sa.DateTime(), nullable=False),
        sa.Column(
            "status",
            sa.Enum(
                "IMPORTED",
                "UNMAPPED",
                "LINKED_TO_REPORT",
                name="committaskstatus",
            ),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_commit_tasks_author_email"), "commit_tasks", ["author_email"], unique=False)
    op.create_index(op.f("ix_commit_tasks_commit_sha"), "commit_tasks", ["commit_sha"], unique=True)
    op.create_index(op.f("ix_commit_tasks_committed_at"), "commit_tasks", ["committed_at"], unique=False)
    op.create_index(op.f("ix_commit_tasks_id"), "commit_tasks", ["id"], unique=False)
    op.create_index(op.f("ix_commit_tasks_received_at"), "commit_tasks", ["received_at"], unique=False)
    op.create_index(op.f("ix_commit_tasks_repository_name"), "commit_tasks", ["repository_name"], unique=False)
    op.create_index(op.f("ix_commit_tasks_status"), "commit_tasks", ["status"], unique=False)
    op.create_index(op.f("ix_commit_tasks_user_id"), "commit_tasks", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_commit_tasks_user_id"), table_name="commit_tasks")
    op.drop_index(op.f("ix_commit_tasks_status"), table_name="commit_tasks")
    op.drop_index(op.f("ix_commit_tasks_repository_name"), table_name="commit_tasks")
    op.drop_index(op.f("ix_commit_tasks_received_at"), table_name="commit_tasks")
    op.drop_index(op.f("ix_commit_tasks_id"), table_name="commit_tasks")
    op.drop_index(op.f("ix_commit_tasks_committed_at"), table_name="commit_tasks")
    op.drop_index(op.f("ix_commit_tasks_commit_sha"), table_name="commit_tasks")
    op.drop_index(op.f("ix_commit_tasks_author_email"), table_name="commit_tasks")
    op.drop_table("commit_tasks")
    sa.Enum(
        "IMPORTED",
        "UNMAPPED",
        "LINKED_TO_REPORT",
        name="committaskstatus",
    ).drop(op.get_bind(), checkfirst=False)

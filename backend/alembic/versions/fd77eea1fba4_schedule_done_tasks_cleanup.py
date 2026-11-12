"""schedule done tasks cleanup

Revision ID: fd77eea1fba4
Revises: 57bf3f8daf1d
Create Date: 2026-11-12 14:14:08.027560

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'fd77eea1fba4'
down_revision: Union[str, Sequence[str], None] = '57bf3f8daf1d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # pg_cron runs SQL on a schedule inside the database. This job runs at minute 0 of every hour
    # and deletes tasks that were marked done more than 24 hours ago.
    # It runs as the database owner, so RLS doesn't block it, and it covers every user's tasks.
    op.execute("""
        SELECT cron.schedule(
            'delete-done-tasks',
            '0 * * * *',
            $$DELETE FROM public.tasks WHERE done_at < now() - interval '24 hours'$$
        )
    """)


def downgrade() -> None:
    """Downgrade schema."""
    # Remove the scheduled job by its name.
    op.execute("SELECT cron.unschedule('delete-done-tasks')")

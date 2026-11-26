# Subtask rules shared by the tasks and subtasks routers.
# Works on the session it's given; the caller commits.

import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.features.tasks.models import Task
from app.features.subtasks.models import Subtask


def sync_task_done(task_id: uuid.UUID, db: Session) -> None:
    """Make the task done exactly when all its subtasks are done; leave it alone if it has none."""
    done_times = db.scalars(select(Subtask.done_at).where(Subtask.task_id == task_id)).all()
    if not done_times:
        return
    task = db.get(Task, task_id)
    # A template is never done, whatever its subtasks say
    if task.is_template:
        return
    if all(done_at is not None for done_at in done_times):
        # Keep the original done time if it was already done
        if task.done_at is None:
            task.done_at = datetime.now(timezone.utc)
    else:
        task.done_at = None

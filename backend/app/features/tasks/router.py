# The /tasks endpoints for the logged-in user's tasks.
# The user comes from the token (core/auth.py); The tasks come from the tasks table through a session (core/database.py)

import uuid

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.auth import get_current_user_id
from app.core.database import get_db
from app.features.tasks.models import Task
from app.features.tasks.schemas import TaskRead

# Every route in this file starts with /tasks. tag groups them under "tasks" on the docs page.
router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.get("")
def list_tasks(
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
) -> list[TaskRead]:
    """List the logged-in user's tasks, oldest first"""
    query = select(Task).where(Task.user_id == user_id).order_by(Task.created_at)
    tasks = db.scalars(query).all()

    return [TaskRead.model_validate(task) for task in tasks]
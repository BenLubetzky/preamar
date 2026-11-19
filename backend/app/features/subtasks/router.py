# The endpoints for the subtasks (checklist items) of the logged-in user's tasks.
# The user comes from the token (core/auth.py); ownership is checked through the parent task.

import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.auth import get_current_user_id
from app.core.database import get_db
from app.features.tasks.models import Task
from app.features.tasks.router import get_own_task
from app.features.subtasks.models import Subtask
from app.features.subtasks.schemas import SubtaskCreate, SubtaskRead, SubtaskUpdate

# No prefix: creating lives under /tasks/{id}/subtasks, the rest under /subtasks/{id}
router = APIRouter(tags=["subtasks"])

def get_own_subtask(subtask_id: uuid.UUID, user_id: uuid.UUID, db: Session) -> Subtask:
    """Return the subtask if it exists and its task belongs to the user, else raise 404"""
    subtask = db.get(Subtask, subtask_id)
    if subtask is None:
        raise HTTPException(status_code=404, detail="Subtask not found")
    task = db.get(Task, subtask.task_id)
    if task is None or task.user_id != user_id:
        raise HTTPException(status_code=404, detail="Subtask not found")
    return subtask


@router.post("/tasks/{task_id}/subtasks", status_code=201)
def create_subtask(
    task_id: uuid.UUID,
    subtask_in: SubtaskCreate,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> SubtaskRead:
    """Add a subtask to one of the logged in user's tasks"""
    get_own_task(task_id, user_id, db)
    subtask = Subtask(**subtask_in.model_dump(), task_id=task_id)
    db.add(subtask)
    db.commit()
    db.refresh(subtask)
    return SubtaskRead.model_validate(subtask)


@router.patch("/subtasks/{subtask_id}")
def update_subtask(
    subtask_id: uuid.UUID,
    subtask_in: SubtaskUpdate,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> SubtaskRead:
    """Rename one of the logged in user's subtasks"""
    subtask = get_own_subtask(subtask_id, user_id, db)
    subtask.title = subtask_in.title
    db.commit()
    db.refresh(subtask)
    return SubtaskRead.model_validate(subtask)


@router.delete("/subtasks/{subtask_id}", status_code=204)
def delete_subtask(
    subtask_id: uuid.UUID,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> None:
    """Delete one of the logged in user's subtasks"""
    subtask = get_own_subtask(subtask_id, user_id, db)
    db.delete(subtask)
    db.commit()
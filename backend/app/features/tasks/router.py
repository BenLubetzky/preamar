# The /tasks endpoints for the logged-in user's tasks.
# The user comes from the token (core/auth.py); The tasks come from the tasks table through a session (core/database.py)

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.auth import get_current_user_id
from app.core.database import get_db
from app.features.tasks.models import Task
from app.features.tasks.schemas import TaskRead, TaskCreate, TaskUpdate

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

# status_code=201 tells FastAPI to send 201 ("created") instead of 200 whenever the function is successfully done
@router.post("", status_code=201)
def create_task(
    task_in: TaskCreate,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> TaskRead:
    """Create a task for the logged-in user"""
    task = Task(**task_in.model_dump(), user_id=user_id)
    db.add(task)
    db.commit()
    db.refresh(task)
    return TaskRead.model_validate(task)

# Helper function
def get_own_task(task_id:uuid.UUID, user_id:uuid.UUID, db:Session) -> Task:
    """Return the task if it exists and belongs to the user, else raise 404"""
    task = db.get(Task, task_id)
    if task is None or task.user_id != user_id:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

# PATCH VS PUT: PATCH cchanges part of a resource, PUT replaces all of it. Since we change
# only what's sent we're using PATCH
@router.patch("/{task_id}")
def update_task(
    task_id: uuid.UUID,
    task_in: TaskUpdate,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
) -> TaskRead:
    """Change the sent fields of one of the logged in user's tasks"""
    task = get_own_task(task_id, user_id, db)
    for field, value in task_in.model_dump(exclude_unset=True).items():
        setattr(task, field, value)
    db.commit()
    # db.refresh reloads the row from the database into the Python object
    db.refresh(task)
    return TaskRead.model_validate(task)

# status code 204 is the usual success code for a delete
@router.delete("/{task_id}", status_code=204)
def delete_task(
    task_id: uuid.UUID,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
) -> None:
    """Delete one of the logged in user's tasks"""
    task = get_own_task(task_id, user_id, db)
    db.delete(task)
    db.commit()

@router.post("/{task_id}/done")
def mark_task_done(
    task_id: uuid.UUID,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
) -> TaskRead:
    """Mark one of the logged in user's tasks as done"""
    task = get_own_task(task_id, user_id, db)
    # In case there is already a done time, keep it
    if task.done_at is None:
        task.done_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(task)
    return TaskRead.model_validate(task)

@router.post("/{task_id}/undone")
def mark_task_undone(
    task_id: uuid.UUID,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
) -> TaskRead:
    """Mark one of the logged in user's tasks as not done"""
    task = get_own_task(task_id, user_id, db)
    task.done_at = None
    db.commit()
    db.refresh(task)
    return TaskRead.model_validate(task)
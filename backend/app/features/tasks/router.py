# The /tasks endpoints for the logged-in user's tasks.
# The user comes from the token (core/auth.py); The tasks come from the tasks table through a session (core/database.py)

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.auth import get_current_user_id
from app.core.database import get_db
from app.features.tasks.models import Task
from app.features.tasks.schemas import TaskRead, TaskCreate, TaskUpdate
from app.features.tasks.recommend import recommend
from app.features.subtasks.models import Subtask
from app.features.subtasks.service import sync_task_done

# Every route in this file starts with /tasks. tag groups them under "tasks" on the docs page.
router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("")
def list_tasks(
    templates: bool = False,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
) -> list[TaskRead]:
    """List the logged-in user's normal tasks, or their templates with ?templates=true, oldest first"""
    # selectinload fetches all the subtasks for all the tasks in one extra query.
    query = (
        select(Task)
        .where(Task.user_id == user_id, Task.is_template.is_(templates))
        .options(selectinload(Task.subtasks))
        .order_by(Task.created_at)
    )
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
    task = Task(**task_in.model_dump(exclude={"subtasks"}), user_id=user_id)
    task.subtasks = [Subtask(title=title) for title in task_in.subtasks]
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

@router.post("/{task_id}/copy", status_code=201)
def copy_task(
    task_id: uuid.UUID,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> TaskRead:
    """Create a new normal task with the same title, description, duration and subtask titles as one of the
    logged in user's tasks (used to copy a template)"""
    source = get_own_task(task_id, user_id, db)
    task = Task(
        user_id=user_id,
        title=source.title,
        description=source.description,
        duration_minutes=source.duration_minutes,
    )
    # Only the titles are copied, so every new subtask starts not done
    task.subtasks = [Subtask(title=subtask.title) for subtask in source.subtasks]
    db.add(task)
    db.commit()
    db.refresh(task)
    return TaskRead.model_validate(task)


# PATCH VS PUT: PATCH cchanges part of a resource, PUT replaces all of it. Since we change
# only what's sent we're using PATCH
@router.patch("/{task_id}")
def update_task(
    task_id: uuid.UUID,
    task_in: TaskUpdate,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
) -> TaskRead:
    """Change the sent fields of one of the logged in user's tasks; a sent subtask list replaces the current one"""
    task = get_own_task(task_id, user_id, db)
    for field, value in task_in.model_dump(exclude_unset=True, exclude={"subtasks"}).items():
        setattr(task, field, value)
    if task_in.subtasks is not None:
        # id -> subtask, so each edit finds its subtask in one lookup
        current = {subtask.id: subtask for subtask in task.subtasks}
        kept = []
        for edit in task_in.subtasks:
            subtask = current.get(edit.id)
            # No id, or an id that isn't one of this task's subtasks: it's a new one
            if subtask is None:
                subtask = Subtask(title=edit.title)
            else:
                subtask.title = edit.title
            kept.append(subtask)
        # delete-orphan: any subtask left out of this list is deleted
        task.subtasks = kept
        sync_task_done(task.id, db)
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
    if task.is_template:
        raise HTTPException(status_code=400, detail="A template can't be marked done")
    now = datetime.now(timezone.utc)
    for subtask in task.subtasks:
        if subtask.done_at is None:
            subtask.done_at = now
    # In case there is already a done time, keep it
    if task.done_at is None:
        task.done_at = now
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


@router.get("/recommend")
def recommend_tasks(
    minutes: int = Query(gt=0),
    skip: list[uuid.UUID] = Query(default=[]),
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
) -> list[TaskRead]:
    """Recommend which of the logged in user's unfinished tasks to do in the given free time,
    leaving out the skipped ones."""
    query = select(Task).where(Task.user_id == user_id,
                               Task.done_at.is_(None),
                               Task.is_template.is_(False),
                               Task.id.not_in(skip),).options(selectinload(Task.subtasks))
    tasks = db.scalars(query).all()
    chosen = recommend(list(tasks), minutes)
    return [TaskRead.model_validate(task) for task in chosen]
# The shapes of task data going in and out of the API (Pydantic).
# Kept apart from models.py so the API never exposes or accepts a column by accident.

import uuid
from datetime import datetime

from typing import Annotated
from pydantic import BaseModel, ConfigDict, Field

from app.features.subtasks.schemas import SubtaskEdit, SubtaskRead

class TaskCreate(BaseModel):
    # What the frontend sends to create a task. No id, user_id, done_at or created_at,
    # These will all be filled by the backend so they can't be faked
    title: str = Field(min_length=1)
    description: str | None = None
    # gt = greater than
    duration_minutes: int = Field(gt=0)
    subtasks: list[Annotated[str, Field(min_length=1)]] = []
    # Only set when creating: a task can't be turned into a template later (TaskUpdate has no is_template)
    is_template: bool = False

class TaskRead(BaseModel):
    # What the API sends back for one task. user_id is left out on purpose since the frontend knows already 
    # who's logged in.

    # model_config is where we put the schema's settings, when putting from_attributes as True,
    # pydantic also accepts an object, as opposed to just a dictionary
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    description: str | None
    duration_minutes: int
    done_at: datetime | None
    is_template: bool
    created_at: datetime
    subtasks: list[SubtaskRead]


class TaskUpdate(BaseModel):
    title: str = Field(default=None, min_length=1)
    description: str | None = None
    duration_minutes: int = Field(default=None, gt=0)
    # None = leave subtasks alone; a list = make the subtasks match it exactly
    subtasks: list[SubtaskEdit] | None = None
# The shapes of subtask data going in and out of the API (Pydantic).
# The parent task comes from the URL (/tasks/{task_id}/subtasks), so it's never in the body.

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

class SubtaskCreate(BaseModel):
    """What the frontend sends to add a subtask: just the title."""
    title: str = Field(min_length=1)

class SubtaskRead(BaseModel):
    """What the API sends back for one subtask."""
    model_config = ConfigDict(from_attributes=True)

    id:uuid.UUID
    task_id: uuid.UUID
    title: str
    done_at: datetime | None
    created_at: datetime

class SubtaskUpdate(BaseModel):
    """What the frontend sends to rename a subtask."""
    title: str = Field(min_length=1)

class SubtaskEdit(BaseModel):
    """One subtask as the edit form sends it: with an id it already exists, without one it's new."""
    id: uuid.UUID | None = None
    title: str = Field(min_length=1)
# The shapes of task data going in and out of the API (Pydantic).
# Kept apart from models.py so the API never exposes or accepts a column by accident.

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict

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
    created_at: datetime
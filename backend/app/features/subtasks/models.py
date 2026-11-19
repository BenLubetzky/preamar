# The subtasks table: one row per checklist item inside a task
# Each row belongs to a task through task_id; deleting the task deletes its subtasks.

import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
import app.features.tasks.models # noqa: F401

class Subtask(Base):
    """One checklist item that belongs to a task."""
    __tablename__ = "subtasks"

    id:Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    task_id:Mapped[uuid.UUID] = mapped_column(ForeignKey("tasks.id", ondelete="CASCADE"))
    title:Mapped[str]
    done_at:Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at:Mapped[datetime] = mapped_column(DateTime(timezone=True),server_default=func.now())
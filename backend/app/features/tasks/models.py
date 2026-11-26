# The tasks table: one row per task a user created, normal tasks and templates (is_template)
# Each row belongs to a user through user_id (points at the users table)

import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, false, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING

# To avoid circular import (since subtasks import tasks we don't want to get caught in an infinite loop)
if TYPE_CHECKING:
    from app.features.subtasks.models import Subtask

from app.core.database import Base
import app.features.users.models # noqa: F401

class Task(Base):
    __tablename__ = "tasks"

    id:Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id:Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    title:Mapped[str]
    description:Mapped[str | None]
    duration_minutes:Mapped[int]
    done_at:Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    # A template is never done; it's only copied into new normal tasks.
    # server_default fills in false for the rows that already exist when the column is added.
    is_template:Mapped[bool] = mapped_column(default=False, server_default=false())
    created_at:Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    subtasks: Mapped[list["Subtask"]] = relationship(
        order_by="Subtask.created_at", cascade="all, delete-orphan", passive_deletes=True
    )
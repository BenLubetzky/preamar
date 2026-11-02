# The tasks table: one row per task a user created
# Each row belongs to a user through user_id (points at the users table)

import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column

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
    created_at:Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
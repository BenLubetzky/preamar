# Shared database setup: the Base class every model inherits from.
# Also declared Supabase's auth.users so our tables can link to it.

from sqlalchemy import Column, Table, Uuid
from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass


# Supabase owns this table, we only declare its id so ForeignKeys can point at it (SQLAlchemy refuses to link to a table it has never heard of).
# Alembic is told to ignore it (in env.py), so it never tries to create it.
auth_users = Table("users", Base.metadata, Column("id", Uuid, primary_key=True), schema="auth")
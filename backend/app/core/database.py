# Shared database setup: the connection, a session per request, and the Base class every model inherits from.
# The connection address comes from the DATABASEURL in .env (the same one that Alembic uses).

import os

from dotenv import load_dotenv
from sqlalchemy import Column, Table, Uuid, create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

load_dotenv()

# The engine holds the connection to Supabase. It's made once when the app starts and resused for every request.
# SQLAlchemy handles connection pooling automatically.
engine = create_engine(os.environ["DATABASE_URL"])

SessionLocal = sessionmaker(engine, )

def get_db():
    """Get a database session for the current request."""
    with SessionLocal() as session:
        yield session

class Base(DeclarativeBase):
    pass


# Supabase owns this table, we only declare its id so ForeignKeys can point at it (SQLAlchemy refuses to link to a table it has never heard of).
# Alembic is told to ignore it (in env.py), so it never tries to create it.
auth_users = Table("users", Base.metadata, Column("id", Uuid, primary_key=True), schema="auth")
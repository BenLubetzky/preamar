"""create users row on signup

Revision ID: 57bf3f8daf1d
Revises: df20c7140887
Create Date: 2026-11-02 16:07:32.073466

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '57bf3f8daf1d'
down_revision: Union[str, Sequence[str], None] = 'df20c7140887'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # The frontend sends the signup staright to Supabase Auth, without going through our backend
    # Supabase adds the person to auth.users, but we also want a row in our users table. This trigger does that automatically.
    # The trigger is a function that runs after each new row in auth.users, it adds a matching row with the id and the username
    # to the users table
    op.execute("""
        CREATE FUNCTION public.handle_new_user()
        RETURNS trigger
        LANGUAGE plpgsql
        SECURITY DEFINER
        SET search_path = ''
        AS $$
        BEGIN
            -- NEW is the row that was just added to auth.users.
            -- raw_user_meta_data holds the extra fields the frontend sent with signUp; ->> reads one as text.
            INSERT INTO public.users (id, username)
            VALUES (NEW.id, NEW.raw_user_meta_data ->> 'username');
            RETURN NEW;
        END;
        $$
    """)

    # The trigger itself: after each new row in auth.users, run the function above.
    op.execute("""
        CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user()
    """)


def downgrade() -> None:
    """Downgrade schema."""
    # Remove them in reverse order: the trigger uses the function, so it goes first.
    op.execute("DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users")
    op.execute("DROP FUNCTION IF EXISTS public.handle_new_user()")
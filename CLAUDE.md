# Preamar

A web app where you say how much free time you have and it recommends which of your tasks to do. The idea and MVP scope are in [README.md](README.md).

## Working rules

The owner reviews and understands every line of code in this project. No vibe coding.

- **Small steps.** One feature or concept at a time. Never a big multi-file dump.
- **Plan first.** Say what you're about to change before writing it.
- **Explain after.** Walk through the key lines and any new library or concept.
- **Stop and wait.** Wait for the owner's review and OK before the next step. Don't chain steps.
- **Let the owner write it.** When they're learning something new, offer guidance instead of writing it for them.
- **"Just do it all"?** Remind them of these rules once, then follow their call.
- **Respect the MVP scope.** Don't push features into the MVP. Ideas go in the "Later" list in [README.md](README.md), without lobbying.
- **Be concise.** Short answers, unfamiliar terms explained in one line, and only blocking issues raised.

## Stack

| Part | Choice |
|---|---|
| Frontend | Next.js (real routes) |
| Server data on the frontend | TanStack Query |
| Backend | Python + FastAPI |
| Database access | SQLAlchemy + Alembic |
| Database | Supabase (Postgres) |
| Login | Supabase Auth |

## Structure principles (lessons from BookMatch)

- **Group by feature**, on the frontend and the backend. One feature lives in one folder.
- **No hub file.** Pages stay thin; nothing is "connected to everything".
- **One API client** holds the token and handles "logged out" in one place.
- **Auth context** (`useAuth()`) instead of passing the user and log-out down as props.
- **The session survives a refresh.**
- **A 2–3 line comment at the top of each file**: what it owns, where its data comes from.
- **Split files by job.** ~300 lines is a warning sign, not a rule.
- **Row security (RLS) on from the start** in Supabase.

Folder layout and names are not decided yet. See "Open decisions" in [README.md](README.md).

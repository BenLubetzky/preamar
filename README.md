# Preamar

You tell the app how much free time you have, and it tells you which of your tasks to do with it.

## MVP

- **Task list:** add, edit and delete tasks. Each task has a title, a short description and how long it takes.
- **Free time:** type in how many minutes you have.
- **Recommendation:** the app suggests which tasks fit into that time.
- **Login:** each user sees only their own tasks.

## Open decisions

Discussed one at a time, in this order:

1. **Database:** decided. `users` (id, username, created_at) and `tasks` (id, user_id, title, description, duration_minutes, done_at, created_at). RLS on both. A database trigger adds the `users` row when someone signs up (the username comes from the signup).
2. **Recommendation rule:** decided. From the unfinished tasks, pick the combination that uses the most of the free time without going over. If several combinations tie, pick the one that holds the oldest task (and among tasks with the same duration, the older one goes first).
3. **Structure and names:** backend decided. Each feature is a folder in `app/features/` with `models.py` (the table), `schemas.py` (the data shapes) and `router.py` (the endpoints). Shared code lives in `app/core/`. Frontend still open.

## Later

- Reading documents to create tasks from them.
- A countdown timer for the free time.
- Automatically delete tasks 24 hours after `done_at`.

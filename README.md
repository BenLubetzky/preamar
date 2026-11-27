# Preamar

You tell the app how much free time you have, and it tells you which of your tasks to do with it.

## MVP

- **Task list:** add, edit and delete tasks. Each task has a title, a short description and how long it takes.
- **Free time:** type in how many minutes you have.
- **Recommendation:** the app suggests which tasks fit into that time.
- **Login:** each user sees only their own tasks.

## After the MVP

- **Countdown timer:** a timer for the free time, with Start and Pause. It keeps counting below zero (turns red) instead of stopping, so running a little over is fine.
- **Per-task timer:** in the one-task view, each task gets its own small timer for its minutes, next to the task. Amber while there's time left, red below zero. It pauses with the main timer and starts again for each task.
- **Skip a task:** leave a task out of the current recommendation without marking it done. Skips last until the Refresh button or a page reload.
- **Auto-delete done tasks:** a pg_cron job in the database runs every hour and deletes tasks marked done more than 24 hours ago.

## Open decisions

Discussed one at a time, in this order:

1. **Database:** decided. `users` (id, username, created_at) and `tasks` (id, user_id, title, description, duration_minutes, done_at, created_at). RLS on both. A database trigger adds the `users` row when someone signs up (the username comes from the signup).
2. **Recommendation rule:** decided. From the unfinished tasks, pick the combination that uses the most of the free time without going over. If several combinations tie, pick the one that holds the oldest task (and among tasks with the same duration, the older one goes first).
3. **Structure and names:** decided.
   - **Backend:** each feature is a folder in `app/features/` with `models.py` (the table), `schemas.py` (the data shapes) and `router.py` (the endpoints). Shared code lives in `app/core/`.
   - **Frontend (TypeScript):** `src/app/` holds only routes: `/` (task list + free time), `/login`, `/signup`. Each feature is a folder in `src/features/` with `api.ts` (calls to the backend), `hooks.ts` (TanStack Query hooks), `types.ts` (the data shapes) and `components/`. The recommendation lives inside `tasks/`. Shared code lives in `src/core/`: the one API client, the Supabase connection, the auth context (`useAuth()`) and the TanStack Query setup. Components never call `fetch` directly: component → hook → `api.ts` → API client.

## Later

In order:

1. **Mic for descriptions** (done?, to confirm): speak to add to a task's description. The Moonshine model runs in the user's browser via transformers.js (free, private, works in every modern browser). Chrome's Web Speech API was tried first and was too inaccurate.
2. **Movable boxes** (done): drag the main screen's boxes around.
   - **Layout:** recommendation panel on the left, Tasks in the center, New task on the right with Templates under it (Templates moves to the top when New task is closed).
   - **Front window:** clicking or grabbing a window brings it in front of the others.
   - **Top-right bar:** always on top. A two-windows icon puts every window back in its default place (only the position changes), plus log out.
   - **Scrolling lists:** subtasks (in New task and Edit task) scroll after 3 rows, templates after 4. The scrollbar is hidden; a small down arrow shows there's more, and a newly added subtask scrolls into view.
3. **Instant updates** (done): change the screen right away (e.g. marking a task done) while the backend saves, instead of waiting for the refetch.

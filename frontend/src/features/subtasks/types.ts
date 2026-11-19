// The shapes of subtask data coming from and going to the backend.
// Mirrors backend/app/features/subtasks/schemas.py: change one, change the other

/** One subtask as the backend sends it (SubtaskRead). */
export type Subtask = {
    id: string;
    task_id: string;
    title: string;
    done_at: string | null;
    created_at: string;
};

/** What we send to create or rename a subtask (SubtaskCreate / SubtaskUpdate). */
export type SubtaskInput = {
    title: string;
};
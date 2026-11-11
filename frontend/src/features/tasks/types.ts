// The shapes of task data coming from and going to the backend
// Mirrors backend/app/features/tasks/schemas.py: change one, change the other

/** One task as the backend sends it (TaskRead). */
export type Task = {
    id: string;
    title: string;
    description: string | null;
    duration_minutes: number;
    done_at: string | null;
    created_at: string;
};

/** What we send to create a task (TaskCreate) */
export type TaskCreate = {
    title: string;
    description?: string | null;
    duration_minutes: number;
}

/** What we send to edit a task: only the fields that changed (TaskUpdate). */
// Partial takes a type and makes every field in it optional
export type TaskUpdate = Partial<TaskCreate>;
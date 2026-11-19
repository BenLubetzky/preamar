// The shapes of task data coming from and going to the backend
// Mirrors backend/app/features/tasks/schemas.py: change one, change the other

import type { Subtask, SubtaskDraft } from "@/features/subtasks/types";

/** One task as the backend sends it (TaskRead). */
export type Task = {
    id: string;
    title: string;
    description: string | null;
    duration_minutes: number;
    done_at: string | null;
    created_at: string;
    subtasks: Subtask[];
};

/** What we send to create a task (TaskCreate) */
export type TaskCreate = {
    title: string;
    description?: string | null;
    duration_minutes: number;
    subtasks?: string[];
}

/** What we send to edit a task: only the fields that changed (TaskUpdate). */
// Omit removes a field from a type; Partial makes every remaining field optional.
// & joins two types: the edited subtask list replaces the plain titles TaskCreate has.
export type TaskUpdate = Partial<Omit<TaskCreate, "subtasks">> & {
    subtasks?: SubtaskDraft[];
};
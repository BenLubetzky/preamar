"use client";

// The delete button for one task.
// Deletes through useDeleteTask() in hooks.ts, which then refreshes the task list.

import { useDeleteTask } from "../hooks";

/** Deletes the given task when clicked. */
export function DeleteTaskButton({ taskId }: { taskId: string }) {
    const deleteTask = useDeleteTask();

    return (
        <button
            type="button"
            onClick={() => deleteTask.mutate(taskId)}
            disabled={deleteTask.isPending}
            aria-label="Delete task"
            className="cursor-pointer text-dim hover:text-muted disabled:opacity-50"
        >
            ×
        </button>
    );
}
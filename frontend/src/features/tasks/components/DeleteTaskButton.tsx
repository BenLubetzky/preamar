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
            className="flex size-8 cursor-pointer items-center justify-center text-2xl text-dim hover:bg-btn hover:text-muted disabled:opacity-50"
        >
            ×
        </button>
    );
}
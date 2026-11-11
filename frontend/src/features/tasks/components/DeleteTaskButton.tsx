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
            className="text-sm text-red-600 disabled:opacity-50"
        >
            {deleteTask.isPending ? "Deleting..." : "Delete"}
        </button>
    );
}
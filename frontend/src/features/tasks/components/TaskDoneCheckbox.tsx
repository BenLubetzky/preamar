"use client";

// The done checkbox for one task.
// Saves through useSetTaskDone() in hooks.ts, which then refreshes the task list.

import { useSetTaskDone } from "../hooks";
import type { Task } from "../types";

/** Ticks or unticks the given task as done. */
export function TaskDoneCheckbox({ task }: { task:Task }) {
    const setTaskDone = useSetTaskDone();

    return (
        <input 
            type="checkbox"
            checked={task.done_at !== null}
            onChange={(e) => setTaskDone.mutate({ id:task.id, done: e.target.checked })}
            disabled={setTaskDone.isPending}
            aria-label={`Mark "${task.title}" done`}
            className="size-3 shrink-0 cursor-pointer appearance-none border border-muted checked:border-accent checked:bg-accent disabled:opacity-50"
        />
    );
}
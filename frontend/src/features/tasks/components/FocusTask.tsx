"use client"

// One-task view in the recommended tasks box, it contains: the current task's title, duration, description and subtasks.
// Marks the task done through useSetTaskDone() in hooks.ts; the parent decides which task comes next.

import { useSetTaskDone } from "../hooks";
import type { Task } from "../types";
import { SubtaskList } from "@/features/subtasks/components/SubtaskList";

type Props = {
    /** The task to show. */
    task: Task;
    /** Which task this is, counting from 1. */
    position: number;
    /**How many tasks there are in total. */
    count: number;
    /** Called once the task is saved as done, to move to the next one. */
    onDone: () => void;
};

/** Shows the single task to work on now, with a Done button. */
export function FocusTask({ task, position, count, onDone }: Props) {
    const setTaskDone = useSetTaskDone();

    return (
        <div>
            <p className="mt-1.5 text-base text-muted">Task {position} of {count}</p>
            <div className="mt-1 flex items-baseline justify-between gap-2">
                <h3 className="min-w-0 break-words text-2xl text-ink">{task.title}</h3>
                <span className="shrink-0 text-muted">{task.duration_minutes} min</span>
            </div>
            <p className="mt-1 text-base leading-[18px] text-soft">
                {task.description ?? "No description."}
            </p>
            {/* Ticking every box makes the task done but doesn't move on; only Done does that */}
            {task.subtasks.length > 0 && (
                <div className="mt-2">
                    <SubtaskList subtasks={task.subtasks} />
                </div>
            )}
            {/* Done also marks any open subtasks done (the backend does that) */}
            <button
                type="button"
                className="btn mt-3 h-8 w-full"
                disabled={setTaskDone.isPending}
                onClick={() => setTaskDone.mutate({ id:task.id, done: true }, { onSuccess: onDone })}
            >
                {setTaskDone.isPending ? "Saving..." : "Done"}
            </button>
            {setTaskDone.isError && <p className="mt-2 text-red-400">Couldn&apos;t mark it done.</p>}
        </div>
    );
}
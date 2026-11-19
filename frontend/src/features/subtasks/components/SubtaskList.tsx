"use client";

// A checklist of one task's subtasks: a done box and the title for each.
// The subtasks come from the parent task; ticking saves through useSetSubtaskDone() in subtasks/hooks.ts.

import { useSetSubtaskDone } from "../hooks";
import type { Subtask } from "../types";

type Props = {
    /** The subtasks to show, in order. */
    subtasks: Subtask[];
};

/** Shows each subtask with a box that ticks or unticks it as done. */
export function SubtaskList({ subtasks }: Props) {
    const setSubtaskDone = useSetSubtaskDone();

    return (
        <ul className="space-y-0.5">
            {subtasks.map((subtask) => (
                <li key={subtask.id} className="flex items-center gap-2 text-lg leading-5">
                    <input
                        type="checkbox"
                        checked={subtask.done_at !== null}
                        onChange={(e) => setSubtaskDone.mutate({ id: subtask.id, done: e.target.checked })}
                        disabled={setSubtaskDone.isPending}
                        aria-label={`Mark "${subtask.title}" done`}
                        className="size-3.5 shrink-0 cursor-pointer appearance-none border border-muted checked:border-accent checked:bg-accent disabled:opacity-50"
                    />
                    <span className={`min-w-0 flex-1 truncate ${subtask.done_at ? "text-dim line-through" : "text-soft"}`}>
                        {subtask.title}
                    </span>
                </li>
            ))}
        </ul>
    );
}

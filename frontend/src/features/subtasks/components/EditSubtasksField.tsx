"use client";

// The "Subtasks" section of the edit-task form: one title input per subtask, plus an "Add a new subtask" button.
// Holds no state itself; the rows live in EditTaskForm, which sends the whole list on Save.

import type { SubtaskDraft } from "../types";
import { SubtaskRows } from "./SubtaskRows";

type Props = {
    /** The subtask rows in the form (saved ones carry an id, newly added ones don't). */
    subtasks: SubtaskDraft[];
    /** Called with the new list whenever a row is added, typed in or removed. */
    onChange: (subtasks: SubtaskDraft[]) => void;
};

/** Lets the user rename, add and remove a task's subtasks before saving the task. */
export function EditSubtasksField({ subtasks, onChange }: Props) {
    /** Replaces the title of the row at one position, keeping its id. */
    function setTitle(index: number, title: string) {
        onChange(subtasks.map((s, i) => (i === index ? { ...s, title } : s)));
    }

    /** Removes the row at one position (a saved subtask is deleted when the task is saved). */
    function removeRow(index: number) {
        onChange(subtasks.filter((_, i) => i !== index));
    }

    return (
        <div>
            <p className="mt-2.5 mb-1 text-base tracking-wide text-muted">Subtasks</p>
            <SubtaskRows rowCount={subtasks.length} onAdd={() => onChange([...subtasks, { title: "" }])}>
                {subtasks.map((subtask, index) => (
                    // Saved rows are keyed by their id; new rows have none yet, so they use their position
                    <li key={subtask.id ?? `new-${index}`} className="flex items-center gap-1.5">
                        <input
                            aria-label={`Subtask ${index + 1}`}
                            className="field h-7 min-w-0 flex-1 px-1.5"
                            placeholder="Class 1"
                            value={subtask.title}
                            onChange={(e) => setTitle(index, e.target.value)}
                        />
                        <button
                            type="button"
                            aria-label={`Remove subtask ${index + 1}`}
                            className="btn-ghost size-6"
                            onClick={() => removeRow(index)}
                        >
                            ×
                        </button>
                    </li>
                ))}
            </SubtaskRows>
        </div>
    );
}

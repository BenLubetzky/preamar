"use client";

// The "Subtasks" section of the new-task form: a list of title inputs plus an "Add a new subtask" button.
// Holds no state itself; the titles live in AddTaskForm and are sent with the task on Save.

import { SubtaskRows } from "./SubtaskRows";

type Props = {
    /** The subtask titles typed so far. */
    titles: string[];
    /** Called with the new list whenever a title is added, typed or removed. */
    onChange: (titles: string[]) => void;
};

/** Lets the user type any number of subtask titles before the task is saved. */
export function NewSubtasksField({ titles, onChange }: Props) {
    /** Replaces the title at one position. */
    function setTitle(index: number, title: string) {
        onChange(titles.map((t, i) => (i === index ? title : t)));
    }

    /** Removes the title at one position. */
    function removeTitle(index: number) {
        onChange(titles.filter((_, i) => i !== index));
    }

    return (
        <div>
            <p className="mt-2.5 mb-1 text-base tracking-wide text-muted">Subtasks</p>
            <SubtaskRows rowCount={titles.length} onAdd={() => onChange([...titles, ""])}>
                {titles.map((title, index) => (
                    <li key={index} className="flex items-center gap-1.5">
                        <input
                            aria-label={`Subtask ${index + 1}`}
                            className="field h-7 min-w-0 flex-1 px-1.5"
                            placeholder="Class 1"
                            value={title}
                            onChange={(e) => setTitle(index, e.target.value)}
                        />
                        <button
                            type="button"
                            aria-label={`Remove subtask ${index + 1}`}
                            className="btn-ghost size-6"
                            onClick={() => removeTitle(index)}
                        >
                            ×
                        </button>
                    </li>
                ))}
            </SubtaskRows>
        </div>
    );
}

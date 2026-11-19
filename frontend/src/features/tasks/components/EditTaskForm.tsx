"use client";

// The form for editing one task, opened from the task list with the task's current values.
// Saves the task and its subtasks together through useUpdateTask() in hooks.ts, which then refreshes the task list.

import { useState, type FormEvent } from "react";
import { useUpdateTask } from "../hooks";
import type { Task } from "../types";
import { EditSubtasksField } from "@/features/subtasks/components/EditSubtasksField";
import type { SubtaskDraft } from "@/features/subtasks/types";

/** Lets the user change a task's title, description, subtasks and duration. */
export function EditTaskForm({ task, onClose }: { task:Task, onClose: () => void}) {
    const updateTask = useUpdateTask();
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description ?? "");
    const [duration, setDuration] = useState(String(task.duration_minutes));
    // Only the id and title go in the form; the backend keeps each subtask's done state by its id
    const [subtasks, setSubtasks] = useState<SubtaskDraft[]>(
        task.subtasks.map((s) => ({ id: s.id, title: s.title })),
    );

    /** Sends the changes to the backend and closes the form on success */
    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        updateTask.mutate(
            {
                id: task.id,
                changes: {
                    title,
                    description: description || null,
                    duration_minutes: Number(duration),
                    // The full list: left-out subtasks get deleted. Blank rows are dropped (the backend rejects empty titles)
                    subtasks: subtasks
                        .map((s) => ({ ...s, title: s.title.trim() }))
                        .filter((s) => s.title !== ""),
                },
            },
            { onSuccess: onClose },
        );
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <input
                className="field h-7 px-1.5"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
            />
            <input
                className="field h-7 px-1.5"
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />
            <EditSubtasksField subtasks={subtasks} onChange={setSubtasks} />
            <input
                className="field h-7 px-1.5"
                type="number"
                min={1}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
            />
            <div className="flex gap-3">
                <button
                    type="submit"
                    disabled={updateTask.isPending}
                    className="btn h-7 px-3"
                >
                    {updateTask.isPending ? "Saving..." : "Save"}
                </button>
                <button type="button" onClick={onClose} className="btn-ghost h-7 px-3">
                    Cancel
                </button>
            </div>
            {updateTask.isError && <p className="text-red-400">Couldn&apos;t save the task.</p>}
        </form>
    )
}
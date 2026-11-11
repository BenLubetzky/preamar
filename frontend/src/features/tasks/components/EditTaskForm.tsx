"use client";

// The form for editing one task, opened from the task list with the task's current values.
// Saves through useUpdateTask() in hooks.ts, which then refreshes the task list.

import { useState, type FormEvent } from "react";
import { useUpdateTask } from "../hooks";
import type { Task } from "../types";

/** Lets the user change a task's title, description and duration. */
export function EditTaskForm({ task, onClose }: { task:Task, onClose: () => void}) {
    const updateTask = useUpdateTask();
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description ?? "");
    const [duration, setDuration] = useState(String(task.duration_minutes));

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
                },
            },
            { onSuccess: onClose },
        );
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <input
                className="rounded border p-2"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
            />
            <input
                className="rounded border p-2"
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />
            <input
                className="rounded border p-2"
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
                    className="rounded bg-black px-3 py-1 text-white disabled:opacity-50"
                >
                    {updateTask.isPending ? "Saving..." : "Save"}
                </button>
                <button type="button" onClick={onClose} className="text-sm">
                    Cancel
                </button>
            </div>
            {updateTask.isError && <p className="text-red-600">Couldn&apos;t save the task.</p>}
        </form>
    )
}
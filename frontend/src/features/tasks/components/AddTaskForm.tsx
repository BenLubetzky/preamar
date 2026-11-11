"use client";

// The form for adding a task: title, optional description and duration in minutes.
// Saves through useCreateTask() in hooks.ts, which then refreshes the task list.

import { useState, type FormEvent } from "react";
import { useCreateTask } from "../hooks";

/** Lets the user add a new task. */
export function AddTaskForm() {
    const createTask = useCreateTask();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [duration, setDuration] = useState("");

    /** Sends the new task to the backend and empties the form on success. */
    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        createTask.mutate(
            {
                title,
                description: description || null,
                duration_minutes: Number(duration),
            },
            {
                onSuccess: () => {
                    setTitle("");
                    setDescription("");
                    setDuration("");
                },
            },
        );
    }

    return (
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
            <input
                className="rounded border p-2"
                placeholder="Title"
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
                placeholder="Minutes"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
            />
            <button
            type="submit"
            disabled={createTask.isPending}
            className="rounded bg-black p-2 text-white disabled:opacity-50"
            >
                {createTask.isPending ? "Adding..." : "Add task"}
            </button>
            {createTask.isError && <p className="text-red-600">Couldn&apos;t add the task.</p>}
        </form>
    );
}
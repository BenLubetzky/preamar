"use client";

// The form for adding a task: title, optional description and duration in minutes.
// Saves through useCreateTask() in hooks.ts, which then refreshes the task list.

import { useState, type FormEvent } from "react";
import { useCreateTask } from "../hooks";

/** Closes the New task box. */
type Props = {
    onClose: () => void;
}

/** Lets the user add a new task. */
export function AddTaskForm({ onClose }: Props) {
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

    /** Moves the minutes up or down by 5, never below 1 (for the − and + buttons). */
    function stepMinutes(change: number) {
        setDuration(String(Math.max(1, Number(duration) + change)));
    }

    return (
        <form onSubmit={handleSubmit}>
            <label htmlFor="new-task-name" className="mt-2.5 mb-1 block text-base tracking-wide text-muted">
                Name
            </label>
            <input
                id="new-task-name"
                className="field h-7 w-full px-1.5"
                placeholder="Water the plants"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
            />

            <label htmlFor="new-task-description" className="mt-2.5 mb-1 block text-base tracking-wide text-muted">
                Description
            </label>
            <textarea
                id="new-task-description"
                className="field w-full resize-none px-1.5 py-1 leading-[18px]"
                rows={3}
                placeholder="The ones by the window"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />

            <label htmlFor="new-task-minutes" className="mt-2.5 mb-1 block text-base tracking-wide text-muted">
                Minutes
            </label>
            <div className="flex items-center gap-1.5">
                <button type="button" aria-label="5 minutes less" className="btn-ghost size-6" onClick={() => stepMinutes(-5)}>
                    −
                </button>
                <input
                    id="new-task-minutes"
                    className="field h-6 w-9 text-center"
                    type="number"
                    min={1}
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    required
                />
                <button type="button" aria-label="5 minutes more" className="btn-ghost size-6" onClick={() => stepMinutes(5)}>
                    +
                </button>
                <span className="text-muted">min</span>
            </div>

            <div className="mt-3.5 mb-2.5 h-px bg-btn" />
            <div className="flex gap-2">
                <button type="submit" disabled={createTask.isPending} className="btn h-7 flex-1">
                    {createTask.isPending ? "Saving..." : "Save task"}
                </button>
                <button type="button" className="btn-ghost h-7 px-2.5" onClick={onClose}>
                    Cancel
                </button>
            </div>
            {createTask.isError && <p className="mt-2 text-red-400">Couldn&apos;t add the task.</p>}
        </form>
    );
}
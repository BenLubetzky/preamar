"use client";

// The free time box - the user types their free minutes and sees which tasks fit.
// The answer comes from useRecommendation() is hooks.ts

import { useState, type FormEvent } from "react";
import { useRecommendation } from "../hooks";

/** Asks for the free minutes and shows the recommended tasks. */
export function Recommendation(){
    const [input, setInput] = useState("");
    const [minutes, setMinutes] = useState<number | null>(null);
    // Since minutes is in the queryKey, when minute changes the key changes to TanStack Query treats
    // it as different data and fetches automatically.
    const {data: tasks, isPending, isError} = useRecommendation(minutes);

    /** Locks in the typed minutes, which stars the request */
    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setMinutes(Number(input));
    }

    /** Shows the answer, or nothing before the first request. */
    function renderResult() {
        if (minutes === null) return null;
        if (isPending) return <p>Finding tasks...</p>;
        if (isError) return <p className="text-red-600">Couldn&apos;t get a recommendation.</p>
        if (tasks.length === 0) return <p>No unfinished task fit in {minutes} minutes.</p>

        const total = tasks.reduce((sum, task) => sum + task.duration_minutes, 0);
        return (
            <div>
                <p>
                    {total} of {minutes} minutes used
                </p>
                <ul className="mt-2 space-y-1">
                    {tasks.map((task) => (
                        <li key={task.id} className="flex justify-between">
                            <span>{task.title}</span>
                            <span>{task.duration_minutes} min</span>
                        </li>
                    ))}
                </ul>
            </div>
        );
    }

    return (
        <section className="mt-6 rounded border p-4">
            <form onSubmit={handleSubmit} className="flex gap-3">
                <input 
                    className="flex-1 rounded border p-2"
                    type="number"
                    min={1}
                    placeholder="Free Minutes"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    required
                />
                <button type="submit" className="rounded bg-black px-4 text-white">
                    Recommend
                </button>
            </form>
            <div className="mt-4">{renderResult()}</div>
        </section>
    );
}
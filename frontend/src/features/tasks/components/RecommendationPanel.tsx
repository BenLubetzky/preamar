"use client";

// The left box: which tasks fit the user's free minutes, with skip and refresh.
// The minutes come from HomeLayout.tsx; the answer comes from useRecommendation in hooks.ts

import { useState } from "react";
import { useRecommendation } from "../hooks";
import { Countdown } from "./Countdown";

type Props = {
    /** The free minutes the user submitted, or null before the first request. */
    minutes: number | null;
}

/** Shows the recomended tasks for the given amount of minutes. */
export function RecommendationPanel({ minutes }: Props) {
    const [skipped, setSkipped] = useState<string[]>([]);
    const { data: tasks, isPending, isError } = useRecommendation(minutes, skipped);

    /** Adds a task for the skipped list so the next recommendation leaves it out. */
    function skipTask(id: string) {
        setSkipped([...skipped, id]);
    }

    if (minutes == null) return null;
    if (isPending) return <p>Finding tasks...</p>;
    if (isError) return <p className="text-red-600">Couldn&apos;t get a recommendation.</p>;
    if (tasks.length === 0) return <p>No unfinished task fits in {minutes} minutes.</p>;

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
                        <button
                            type="button"
                            className="border px-2 text-sm"
                            onClick={() => skipTask(task.id)}
                        >
                            Skip
                        </button>
                    </li>
                ))}
            </ul>
            {skipped.length > 0 && (
                <button 
                    type="button" 
                    className="mt-2 border px-2 text-sm" 
                    onClick={() => setSkipped([])}
                >
                Refresh
                </button>
            )}
            <Countdown key={minutes} minutes={minutes}/>
        </div>
    );
}
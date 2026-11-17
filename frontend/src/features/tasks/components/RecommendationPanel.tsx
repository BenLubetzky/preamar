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
    if (isPending) return <p className="text-muted">Finding tasks...</p>;
    if (isError) return <p className="text-red-400">Couldn&apos;t get a recommendation.</p>;
    if (tasks.length === 0) return <p className="text-soft">Nothing fits inside {minutes} minutes.</p>;

    const total = tasks.reduce((sum, task) => sum + task.duration_minutes, 0);
    return (
        <div>
            <p className="mt-1.5 mb-2.5 leading-[18px] text-soft">
                {fitMessage(tasks.length, minutes)}
            </p>
            <ul className="space-y-0.5">
                {tasks.map((task) => (
                    <li key={task.id} className="flex items-center gap-2 border border-focus px-1.5 py-0.5 leading-5">
                        <span className="text-accent">›</span>
                        <span className="min-w-0 flex-1 truncate">{task.title}</span>
                        <span className="text-muted">{task.duration_minutes}</span>
                        <button
                            type="button"
                            className="cursor-pointer text-base text-dim hover:text-muted"
                            onClick={() => skipTask(task.id)}
                        >
                            skip
                        </button>
                    </li>
                ))}
            </ul>
            {skipped.length > 0 && (
                <button
                    type="button"
                    className="btn-ghost mt-2 h-6 px-2 text-base"
                    onClick={() => setSkipped([])}
                >
                    Refresh
                </button>
            )}
            <div className="my-2.5 h-px bg-btn" />
            <div className="flex justify-between text-base text-muted">
                <span>used</span>
                <span>{total} / {minutes} min</span>
            </div>
            {/* The striped bar: its width is the share of the free minutes the tasks use. */}
            <div className="mt-1 h-2 border border-line p-px">
                <div
                    className="h-full bg-[repeating-linear-gradient(90deg,#B08A3A_0_4px,#8A6A30_4px_6px)]"
                    style={{ width: `${Math.min(100, Math.round((total / minutes) * 100))}%` }}
                />
            </div>
            <Countdown key={minutes} minutes={minutes}/>
        </div>
    );
}

const COUNT_WORDS = ["", "This one", "These two", "These three", "These four", "These five"];

/** Builds the sentence above the list, e.g. "These three fit inside your 45 minutes." */
function fitMessage(count: number, minutes: number) {
    const who = COUNT_WORDS[count] ?? `These ${count}`;
    return `${who} ${count === 1 ? "fits" : "fit"} inside your ${minutes} minutes.`;
}

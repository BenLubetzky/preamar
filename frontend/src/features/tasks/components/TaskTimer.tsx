"use client";

// A small countdown for the current task in the one-task view; amber while there's time, red below 0.
// The minutes come from FocusTask.tsx; running/paused comes from RecommendationPanel.tsx (shared with Countdown).

import { formatTime, useCountdown } from "../timer";

type Props = {
    /** The task's estimated minutes. */
    minutes: number;
    /** Whether the timer is ticking (the same value the main timer uses). */
    running: boolean;
};

/** Counts down one task's minutes, going negative once they run out. */
export function TaskTimer({ minutes, running }: Props) {
    const secondsLeft = useCountdown(minutes, running);
    const overtime = secondsLeft < 0;

    return (
        <span className={`shrink-0 ${overtime ? "text-red-400" : "text-accent"}`}>
            {formatTime(secondsLeft)}
        </span>
    );
}

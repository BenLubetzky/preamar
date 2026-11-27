"use client";

// A countdown for the free time - keeps going below 0 (turns red), with the play/pause button.
// The minutes and running/paused come from RecommendationPanel.tsx; nothing here talks to the backend

import { formatTime, useCountdown } from "../timer";

type Props = {
    /** Minutes to count down */
    minutes: number,
    /** Whether the timer is ticking (owned by the parent, so the task timer can share it). */
    running: boolean,
    /** Called when play/pause is pressed; the parent flips `running`. */
    onToggle: () => void,
}

/** Counts down the given minutes while `running` is true. */
export function Countdown({ minutes, running, onToggle }: Props) {
    const secondsLeft = useCountdown(minutes, running);
    const overtime = secondsLeft < 0;

    return (
        <div className="mt-3 flex items-center gap-3">
            <span className={`text-3xl leading-none ${overtime ? "text-red-400" : "text-accent"}`}>
                {formatTime(secondsLeft)}
            </span>
            <button
                type="button"
                className="btn flex size-8 items-center justify-center"
                title={running ? "Pause" : "Start"}
                aria-label={running ? "Pause" : "Start"}
                onClick={onToggle}
            >
                {running ? <PauseIcon /> : <PlayIcon />}
            </button>
        </div>
    );
}

/** A 7×7 pixel "play" triangle, in the same style as the magnifier icon. */
function PlayIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 7 7" shapeRendering="crispEdges" aria-hidden="true">
            <rect x="1" y="0" width="1" height="7" fill="#F2C86A" />
            <rect x="2" y="1" width="1" height="5" fill="#F2C86A" />
            <rect x="3" y="1" width="1" height="5" fill="#F2C86A" />
            <rect x="4" y="2" width="1" height="3" fill="#F2C86A" />
            <rect x="5" y="3" width="1" height="1" fill="#F2C86A" />
            <rect x="2" y="1" width="1" height="1" fill="#8A6A30" />
        </svg>
    );
}

/** A 7×7 pixel "pause" sign: two bars. */
function PauseIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 7 7" shapeRendering="crispEdges" aria-hidden="true">
            <rect x="1" y="0" width="2" height="7" fill="#F2C86A" />
            <rect x="4" y="0" width="2" height="7" fill="#F2C86A" />
            <rect x="1" y="0" width="1" height="1" fill="#8A6A30" />
            <rect x="4" y="0" width="1" height="1" fill="#8A6A30" />
        </svg>
    );
}
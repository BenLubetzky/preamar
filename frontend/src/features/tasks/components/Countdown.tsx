"use client";

// A countdown for the free time - starts on "Start", can pause, keeps going below 0 (turns red).
// The minutes come from RecommendationPanel.tsx; nothing here talks to the backend

import { useEffect, useState } from "react";

/** Turns seconds into "m:ss", with a leading "-" when below zero (e.g. -65 → "-1:05"). */
function formatTime(totalSeconds: number) {
    const sign = totalSeconds < 0 ? "-" : "";
    const abs = Math.abs(totalSeconds);
    const minutes = Math.floor(abs / 60);
    const seconds = String(abs % 60).padStart(2, "0");
    return `${sign}${minutes}:${seconds}`;
}

type Props = {
    /** Minutes to count down */
    minutes: number,
    /** Function from the parent to see if start was pressed */
    onStart: () => void,
}

/** Counts down the given minutes once the user presses Start. */
export function Countdown({ minutes, onStart }: Props) {
    const [secondsLeft, setSecondsLeft] =  useState(minutes * 60);
    const [running, setRunning] = useState(false);
    const overtime = secondsLeft < 0;

    useEffect(() => {
        if (!running) return;
        // setInterval is a function build into the browser that runs some code over and over with a fixed
        // wait time between runs
        const id = setInterval(() => {
            setSecondsLeft((s) => s - 1);
        }, 1000);
        return () => clearInterval(id);
    }, [running]);

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
                onClick={() => {
                    if (!running) onStart?.();
                    setRunning(!running);
                }}
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
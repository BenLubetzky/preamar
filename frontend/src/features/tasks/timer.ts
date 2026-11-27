// Shared timer logic for Countdown.tsx (the free time) and TaskTimer.tsx (one task).
// Pure browser timing; nothing here talks to the backend.

import { useEffect, useState } from "react";

/** Turns seconds into "m:ss", with a leading "-" when below zero (e.g. -65 → "-1:05"). */
export function formatTime(totalSeconds: number) {
    const sign = totalSeconds < 0 ? "-" : "";
    const abs = Math.abs(totalSeconds);
    const minutes = Math.floor(abs / 60);
    const seconds = String(abs % 60).padStart(2, "0");
    return `${sign}${minutes}:${seconds}`;
}

/** Counts down from `minutes`, one second at a time while `running`, and keeps going below 0. */
export function useCountdown(minutes: number, running: boolean) {
    const [secondsLeft, setSecondsLeft] = useState(minutes * 60);

    useEffect(() => {
        if (!running) return;
        // setInterval is a function built into the browser that runs some code over and over with a fixed
        // wait time between runs
        const id = setInterval(() => {
            setSecondsLeft((s) => s - 1);
        }, 1000);
        return () => clearInterval(id);
    }, [running]);

    return secondsLeft;
}

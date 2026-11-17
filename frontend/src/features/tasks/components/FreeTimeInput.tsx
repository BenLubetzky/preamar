"use client";

// The minutes input part in the center box where the user enters their free minutes.
// It only keeps the typed text, the submitted minutes go up to HomeLayout through onSubmit.

import { useState, FormEvent } from "react";

type Props = {
    /** Called with the typed minutes when the user asks for a recommendation. */
    onSubmit: (minutes: number) => void;
}

/** Asks how many free minutes the user has. */
export function FreeTimeInput({ onSubmit }: Props) {
    const [input, setInput] = useState("");

    /** Sends the typed minutes up to the parent. */
    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        onSubmit(Number(input));
    }

    return (
        <form onSubmit={handleSubmit}>
            <p className="text-2xl text-soft">Got free time?</p>
            <div className="mt-1 flex items-center gap-2">
                <input
                    className="field h-7 w-11 text-center"
                    type="number"
                    min={1}
                    value={input}
                    onChange={(e)=> setInput(e.target.value)}
                    required
                />
                <span className="text-muted">min</span>
                <button
                    type="submit"
                    className="btn flex h-7 w-8 items-center justify-center"
                    title="What fits"
                    aria-label="What fits"
                >
                    <MagnifierIcon />
                </button>
            </div>
        </form>
    );
}

/** A 7×7 pixel magnifying glass, drawn one square at a time (from the design file). */
function MagnifierIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 7 7" shapeRendering="crispEdges" aria-hidden="true">
            <rect x="1" y="0" width="3" height="1" fill="#F2C86A" />
            <rect x="0" y="1" width="1" height="3" fill="#F2C86A" />
            <rect x="4" y="1" width="1" height="3" fill="#F2C86A" />
            <rect x="1" y="4" width="3" height="1" fill="#F2C86A" />
            <rect x="4" y="4" width="1" height="1" fill="#F2C86A" />
            <rect x="5" y="5" width="1" height="1" fill="#F2C86A" />
            <rect x="6" y="6" width="1" height="1" fill="#F2C86A" />
            <rect x="1" y="1" width="1" height="1" fill="#8A6A30" />
        </svg>
    );
}
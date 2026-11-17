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
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <span>Got Free Time?</span>
            <input 
                className="w-16 border bg-transparent p-1"
                type="number"
                min={1}
                value={input}
                onChange={(e)=> setInput(e.target.value)}
                required
            />
            <span>min</span>
            <button type="submit" className="border px-2">
                Recommend
            </button>
        </form>
    );
}
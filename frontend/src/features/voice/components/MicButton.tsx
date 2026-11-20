"use client";

// A button that turns the mic on and off to speak text into a field.
// The words come from useDictation (the browser's speech tool); the form decides what to do with them via onText.

import { useDictation } from "../useDictation";

/** Turns the mic on and off; hidden when the browser can't do speech to text. */
export function MicButton({ onText }: { onText: (text: string) => void }) {
    const { supported, listening, start, stop } = useDictation(onText);

    if (!supported) return null;

    return (
        <button
            type="button"
            className="btn px-2 text-base"
            onClick={listening ? stop : start}
        >
            {listening ? "■ stop" : "● mic"}
        </button>
    );
}
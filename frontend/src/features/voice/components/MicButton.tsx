"use client";

// A button that turns the mic on and off to speak text into a field.
// The words come from useDictation (Moonshine in the browser); the form decides what to do with them:
// onText gets each finished phrase, onLiveText the draft of the phrase still being spoken.

import { useDictation } from "../useDictation";

/** What the form gives the button. */
type Props = {
    onText: (text: string) => void;
    onLiveText: (text: string) => void;
};

/** Turns the mic on and off; hidden when the browser can't record the mic. */
export function MicButton({ onText, onLiveText }: Props) {
    const { supported, listening, start, stop } = useDictation(onText, onLiveText);

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
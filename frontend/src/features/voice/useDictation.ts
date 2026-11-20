"use client";

// Turns speech into text with the browser's built-in Web Speech API (Chrome has it).
// Owns the "listening" on/off state; each finished phrase is handed to the onText callback.
// Browsers without the API (e.g. Firefox) get supported = false; a fallback comes later.

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

// TypeScript ships no types for the Web Speech API, so these describe the few parts we use.
type RecognitionResultEvent = {
    resultIndex: number;
    results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>;
};

type Recognition = {
    continuous: boolean;
    interimResults: boolean;
    onresult: ((event: RecognitionResultEvent) => void) | null;
    onend: (() => void) | null;
    start: () => void;
    stop: () => void;
};

type RecognitionClass = new () => Recognition;

/** Returns the browser's speech recognition class, or null if the browser has none. */
function getRecognitionClass(): RecognitionClass | null {
    const w = window as unknown as {
        SpeechRecognition?: RecognitionClass;
        webkitSpeechRecognition?: RecognitionClass;
    };
    return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/** A subscribe function that never fires: browser support doesn't change while the page is open. */
function subscribeNever() {
    return () => {};
}

/**
 * Listens to the mic and calls onText with each finished phrase.
 * onText should use a functional update (setX(prev => ...)) since it's captured when listening starts.
 * onText is a function the form gave us and it decides what to do with the words.
 */
export function useDictation(onText: (text: string) => void) {
    // Supported is true/false depending on if the browser has or not a speech to text,
    // useSyncExternalStore can re-check the answer when something changes, we tell it to not bother.
    // getRecognitionClass() checks in the browser, and () => false is on the server side,
    // since we don't have a microphone it says false.
    const supported = useSyncExternalStore(
        subscribeNever,
        () => getRecognitionClass() !== null,
        () => false,
    );

    // a state that says whether the mic is on or off.
    const [listening, setListening] = useState(false);

    // The box that holds the listener, the thing that's hearing your voice. Starts as null.
    const recognitionRef = useRef<Recognition | null>(null);

    // The useEffect runs once when the form opens, and it returns a function that is used later for cleanup.
    useEffect(() => {
        return () => recognitionRef.current?.stop();
    }, []);

    /** Starts listening; does nothing if unsupported or already listening. */
    function start() {
        // Getting the browser's speech tool.
        const RecognitionClass = getRecognitionClass();
        // If the browser has no speech tool or if we already have a listener, the mic is already on.
        if (!RecognitionClass || recognitionRef.current) return;

        // Making a new listener from the browser's speech tool
        const recognition = new RecognitionClass();
        recognition.continuous = true;      // keep listening through pauses until stop()
        recognition.interimResults = false; // only hand back finished phrases, not guesses

        // Giving the listener a function to call everytime it hears a text.
        recognition.onresult = (event) => {
            // results holds everything said so far; resultIndex is where the new part starts.
            // Iterating over new phrasses in the list.
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) onText(result[0].transcript.trim());
            }
        };
        // Fires after stop(), after an error, or when the browser gives up on silence.
        recognition.onend = () => {
            recognitionRef.current = null;
            setListening(false);
        };

        recognitionRef.current = recognition;
        // Turns the microphone on and starts listening.
        recognition.start();
        setListening(true);
    }

    /** Stops listening; the last phrase still arrives before onend. */
    function stop() {
        recognitionRef.current?.stop();
    }

    return { supported, listening, start, stop };
}

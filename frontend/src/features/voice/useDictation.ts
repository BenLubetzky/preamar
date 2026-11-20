"use client";

// Turns speech into text with the Moonshine model, which runs in the browser (speech.worker.ts).
// Owns the "listening" on/off state: records the mic (micRecorder.ts), cuts the sound at each pause,
// and sends each phrase to the worker; the text that comes back goes to the onText callback.

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { startMic } from "./micRecorder";
import type { AudioMessage, WorkerMessage } from "./speech.worker";

const SAMPLE_RATE = 16000;            // sound samples per second
const LOUD = 0.01;                    // a volume above this counts as speaking
const PAUSE = SAMPLE_RATE * 0.7;      // 0.7 seconds of quiet ends a phrase
const MAX_PHRASE = SAMPLE_RATE * 20;  // after 20 seconds, send the phrase anyway
const DRAFT_EVERY = SAMPLE_RATE * 0.5; // while speaking, send a draft every half second

/** Whether this browser can record the mic the way micRecorder.ts does. */
function isSupported() {
    return typeof AudioWorkletNode !== "undefined" && navigator.mediaDevices != null;
}

/** A subscribe function that never fires: browser support doesn't change while the page is open. */
function subscribeNever() {
    return () => {};
}

/** How loud a chunk of sound is, from 0 (silent) up to about 1. */
function volume(chunk: Float32Array) {
    let sum = 0;
    for (const sample of chunk) sum += sample * sample;
    return Math.sqrt(sum / chunk.length);
}

/** Glues many small chunks into one long piece of sound. */
function join(chunks: Float32Array[]) {
    const total = chunks.reduce((length, chunk) => length + chunk.length, 0);
    const sound = new Float32Array(total);
    let offset = 0;
    for (const chunk of chunks) {
        sound.set(chunk, offset);
        offset += chunk.length;
    }
    return sound;
}

/**
 * Listens to the mic and calls onText with each finished phrase.
 * onText should use a functional update (setX(prev => ...)) since it's captured when listening starts.
 * onText is a function the form gave us and it decides what to do with the words.
 * onLiveText gets the draft of the phrase still being spoken ("" when there is none), to show but not save.
 */
export function useDictation(onText: (text: string) => void, onLiveText: (text: string) => void) {
    // Supported is true/false depending on if the browser can record the mic,
    // useSyncExternalStore can re-check the answer when something changes, we tell it to not bother.
    // isSupported checks in the browser, and () => false is on the server side,
    // since we don't have a microphone it says false.
    const supported = useSyncExternalStore(subscribeNever, isSupported, () => false);

    // a state that says whether the mic is on or off.
    const [listening, setListening] = useState(false);

    // The box that holds the worker (the background program running Moonshine). Starts as null.
    const workerRef = useRef<Worker | null>(null);

    // The box that holds the function that turns the mic off. null means the mic is off.
    const stopRef = useRef<(() => void) | null>(null);

    // The useEffect runs once when the form opens, and it returns a function that is used later for cleanup:
    // turn the mic off and shut the worker down.
    useEffect(() => {
        return () => {
            stopRef.current?.();
            workerRef.current?.terminate();
        };
    }, []);

    /** Turns the mic on and starts sending phrases to the worker. */
    async function start() {
        if (stopRef.current) return; // already listening

        // The first time, start the worker; it begins loading the model right away.
        if (!workerRef.current) {
            workerRef.current = new Worker(new URL("./speech.worker.ts", import.meta.url), { type: "module" });
        }
        const worker = workerRef.current;

        // The phrase being spoken right now.
        let chunks: Float32Array[] = [];
        let length = 0;   // samples in the phrase
        let quiet = 0;    // samples of quiet since the last loud chunk
        let spoke = false;

        // Drafts.
        let phrase = 0;             // the number of the current phrase; goes up each time one ends
        let draftWaiting = false;   // a draft was sent and its text hasn't come back yet
        let sinceDraft = 0;         // samples since the last draft was sent

        worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
            const message = event.data;
            if (message.status !== "text") return;
            if (message.final) {
                // A finished phrase: the draft goes away and the real text is added for good.
                onLiveText("");
                if (message.text) onText(message.text);
            } else {
                draftWaiting = false;
                // Only show it if it's a draft of the phrase still being spoken, not an older one.
                if (message.phrase === phrase) onLiveText(message.text);
            }
        };

        /** Sends the phrase to the worker as final if anything was said, then starts a new one. */
        function endPhrase() {
            if (spoke) {
                const message: AudioMessage = { audio: join(chunks), final: true, phrase };
                worker.postMessage(message);
                phrase++;
            }
            chunks = [];
            length = 0;
            quiet = 0;
            spoke = false;
            sinceDraft = 0;
        }

        /** Sends the phrase so far as a draft, if speaking, it's been half a second, and no draft is waiting. */
        function maybeSendDraft() {
            if (!spoke || draftWaiting || sinceDraft < DRAFT_EVERY) return;
            const message: AudioMessage = { audio: join(chunks), final: false, phrase };
            worker.postMessage(message);
            draftWaiting = true;
            sinceDraft = 0;
        }

        /** Runs for every tiny chunk from the mic. */
        function onAudio(chunk: Float32Array) {
            chunks.push(chunk);
            length += chunk.length;
            sinceDraft += chunk.length;
            if (volume(chunk) > LOUD) {
                spoke = true;
                quiet = 0;
            } else {
                quiet += chunk.length;
            }
            // A long pause ends the phrase. Before any speech it just throws the silence away.
            if (quiet > PAUSE || length > MAX_PHRASE) endPhrase();
            else maybeSendDraft();
        }

        try {
            const stopMic = await startMic(onAudio);
            stopRef.current = () => {
                stopMic();
                endPhrase(); // whatever was said right before stopping still gets sent
            };
            setListening(true);
        } catch {
            // The user blocked the mic, or there is none: stay off.
        }
    }

    /** Turns the mic off; the last phrase still comes back as text. */
    function stop() {
        stopRef.current?.();
        stopRef.current = null;
        setListening(false);
    }

    return { supported, listening, start, stop };
}

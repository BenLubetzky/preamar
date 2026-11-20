// Background worker that runs the Moonshine speech-to-text model off the page, so the page never freezes.
// The page (useDictation) sends it pieces of mic audio; it sends back the text and a "ready"/"error" status.
// The model downloads from Hugging Face the first time; after that the browser keeps it cached.

import { pipeline } from "@huggingface/transformers";

/** The messages this worker sends back to the page. */
export type WorkerMessage =
    | { status: "ready" }
    | { status: "error" }
    | { status: "text"; text: string; final: boolean; phrase: number };

/** What the page sends: a piece of sound, which phrase it belongs to, and whether that phrase is finished. */
export type AudioMessage = { audio: Float32Array; final: boolean; phrase: number };

// Moonshine is a better speech to text than the browser one, even though it's not reall tested.
const MODEL = "onnx-community/moonshine-base-ONNX";

/** Loads the model on the graphics card if the browser allows it, otherwise on the processor. */
function loadModel() {
    // Checking if the browser can use the gpu since it runs much faster
    const hasGpu = "gpu" in navigator;
    // These settings (how compressed each part of the model is) follow the official Moonshine Web demo.
    // If we have a gpu to use, use the less compressed version "fp32", otherwise use lighter altenatives "q8", "q4"
    const options = hasGpu
        ? { device: "webgpu" as const, dtype: { encoder_model: "fp32" as const, decoder_model_merged: "q4" as const } }
        : { device: "wasm" as const, dtype: "q8" as const };
    // pipeline will get you a ready to use model
    return pipeline("automatic-speech-recognition", MODEL, options);
}

/** Sends one message to the page. */
// self is the worker itself. 
function send(message: WorkerMessage) {
    self.postMessage(message);
}

// Start loading as soon as the worker starts, so it's ready by the time the user speaks.
const modelPromise = loadModel();
modelPromise.then(() => send({ status: "ready" }), () => send({ status: "error" }));

/**
 * Turns one piece of audio (16,000 samples per second, mono) into text and sends it back,
 * with the same phrase number and final flag so the page knows what it's an answer to.
 */
async function transcribe({ audio, final, phrase }: AudioMessage) {
    let text = "";
    try {
        // transcriber is a speech to text function pipeline gave us.
        const transcriber = await modelPromise;
        const output = await transcriber(audio);
        // It answers with one result, or a list when given several pieces at once; we only ever send one.
        text = (Array.isArray(output) ? output[0].text : output.text).trim();
    } catch {
        // If it fails we still answer (with no text), so the page isn't left waiting.
    }
    send({ status: "text", text, final, phrase });
}

// The model works on one piece at a time, so pieces wait in line here, in the order they arrived.
let queue: Promise<void> = Promise.resolve();

// onmessage is what the worker does when it receives a message from the page.
self.onmessage = (event: MessageEvent<AudioMessage>) => {
    queue = queue.then(() => transcribe(event.data));
};

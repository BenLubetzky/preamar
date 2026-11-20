// Records the microphone as raw sound at 16,000 samples per second (the rate Moonshine expects).
// Used by useDictation: it hands over the sound in tiny chunks (128 samples, about 8 ms each) as they arrive.

// A tiny program the browser runs on its own sound thread; it just passes each chunk on to the page.
const CAPTURE_CODE = `
registerProcessor("capture", class extends AudioWorkletProcessor {
    process(inputs) {
        const channel = inputs[0][0];
        if (channel) this.port.postMessage(channel.slice());
        return true;
    }
});`;

/** Turns the mic on and calls onAudio with each chunk of sound; returns a function that turns it off. */
// onAudio startMic doesn't decide what to do with the sound, it just calls onAudio with each chunk.
export async function startMic(onAudio: (chunk: Float32Array) => void) {
    // Asks the user for mic permission the first time.
    // stream is a MediaStream object, it's a live feed from the mic.
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // measures the sounds 16,000 times per second, the rate that Moonshine expects.
    // AudioContext is the browser's sound system, if a website wants to do anything with audio beyond just
    // playing it, it needs one of these.
    const context = new AudioContext({ sampleRate: 16000 });

    // Turns the text into a fake temporary file and gives it a URL.
    // A Blob is a file that lives only in the browser's memory, not on the disk. We put the code text inside
    // it and label it as javascript.
    const codeUrl = URL.createObjectURL(new Blob([CAPTURE_CODE], { type: "text/javascript" }));
    // audioWorklet allows us to add out own tool, like the written code in CAPTURE_CODE.
    // The add module does the adding nad now we have a new tool called "capture".
    await context.audioWorklet.addModule(codeUrl);
    URL.revokeObjectURL(codeUrl);

    // Wire it up: mic → capture → speakers. Capture outputs silence, so nothing is heard;
    // the speakers connection only keeps the browser running it.
    // we get context, it's an object the browser gives us for working with sound. From context
    // we create nodes. A node is an object that sound passes through. 
    // When we define it here with context and "capture", context says which sound object this node belongs
    // to. A node can only connect to other nodes from the same context. "capture" specifies which code it should run,
    // addModule loaded out code, inside of CAPTURE_CODE there's registerProcessor("capture", ...) which gives the code the name 
    // "capture"
    const capture = new AudioWorkletNode(context, "capture");
    // capture is the node from the previous line that runs our CAPTURE_CODE.
    // onmessage runs everytime that a message arrives through this port.
    capture.port.onmessage = (event: MessageEvent<Float32Array>) => onAudio(event.data);
    // createMediaStreamSource is a function that makes a node out of a live sound system, stream is the live mic sound.
    // every node has a connect function, it takes another node and sends this node's sound into it. capture then runs the capture code there.
    context.createMediaStreamSource(stream).connect(capture);
    // context has a property called destination, which is a node for the speakers, whatever reaches it gets played.
    // Since CAPTURE_CODE never writes anything to its output, the speakers get nothing and nothing is played.
    // The reason we do is because the browser works out which nodes to run by following back the connection from the speakers.
    capture.connect(context.destination);

    return () => {
        stream.getTracks().forEach((track) => track.stop()); // turns off the mic light
        context.close();
    };
}

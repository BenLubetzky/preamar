// Full-screen animated forest that sits behind the page content
// It owns only the <canvas>; the drawing from ../forest.ts

"use client";

import { useEffect, useRef } from "react";
import { startForest } from "../forest";

/** Fills the screen with the animated forest, behind everything else. */
export function ForestBackground() {
    // canvasRef is a useRef element because a normal variable wouldn't work here.
    // We need the last canvas to be saved between renders, if we wouldn't use useRef, every time that there is a rerender
    // React is going to build ForestBackground.tsx from the ground up, making the last canvas null. Since we need the last
    // canvas to remain between renders, useRef is the obvious choice.
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current) return;
        return startForest(canvasRef.current);
    }, []);

    return (
        // ref is a special attribute that only React understands. It's not a name for the canvas and the browser never sees it.
        // ref={canvasRef} is an instruction to React that says that once you put this canvas on the screen,
        // store it in canvasRef.current
        <canvas 
            ref={canvasRef}
            width={200}
            height={120}
            aria-hidden="true"
            className="fixed inset-0 -z-10 h-full w-full bg-black object-cover [image-rendering:pixelated]"
        />
    );
}
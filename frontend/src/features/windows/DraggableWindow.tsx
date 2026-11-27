"use client";

// One movable window on the main screen: a panel whose title bar you drag to move it, with an optional × close button.
// Holds only its own drag offset and stacking order in local state; it fetches no data, its content comes in as children.
// Clicking anywhere on a window brings it in front of the others. A new resetSignal from HomeLayout.tsx moves it back to its start.

import { useRef, useState, type PointerEvent, type ReactNode } from "react";

type Props = {
    title: string;
    onClose?: () => void;
    /** Goes up by one each time the reset button is pressed; any change sends the window back to its start. */
    resetSignal?: number;
    children: ReactNode;
};

type DragStart = { mouseX: number; mouseY: number; x: number; y: number };

// The highest z-index handed out so far. It lives outside the component, so it's one number shared by
// every window (each window's own useState would only know about itself).
let topZ = 0;

/** A panel that can be moved around by dragging its title bar. */
export function DraggableWindow({ title, onClose, resetSignal = 0, children }: Props) {
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    // The last resetSignal this window reacted to. When the prop differs from it, a reset was pressed:
    // remember the new value and clear the offset. React's way to "adjust state when a prop changes" is to do it
    // right here during render (React then re-renders straight away), not in a useEffect.
    const [seenReset, setSeenReset] = useState(resetSignal);
    if (resetSignal !== seenReset) {
        setSeenReset(resetSignal);
        setOffset({ x: 0, y: 0 });
    }
    // z-index: which window is drawn on top when they overlap; the bigger number wins
    const [z, setZ] = useState(0);
    const dragStart = useRef<DragStart | null>(null);

    /** Puts this window in front of all the others, unless it already is. */
    function bringToFront() {
        if (z === topZ && z !== 0) return;
        topZ += 1;
        setZ(topZ);
    }

    /** Starts a drag: remembers where the mouse and the window were. */
    function handlePointerDown(e: PointerEvent<HTMLDivElement>) {
        if ((e.target as HTMLElement).closest("button")) return;
        // setPointerCapture: send this pointer's events to the window until release, even if the cursor
        // slips off it.
        e.currentTarget.setPointerCapture(e.pointerId);
        dragStart.current = { mouseX: e.clientX, mouseY: e.clientY, x: offset.x, y: offset.y };
    }

    /** Moves the window by how far the mouse has moved since the drag started. */
    function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
        const start = dragStart.current;
        if (!start) return;
        setOffset({
            x: start.x + e.clientX - start.mouseX,
            y: start.y + e.clientY - start.mouseY,
        });
    }

    /** Ends the drag. */
    function handlePointerUp() {
        dragStart.current = null;
    }

    return (
        // relative: z-index only works on positioned elements. onPointerDownCapture: runs before any child
        // handles the press (the "capture" phase), so a click on a button or input still brings the window up
        <section
            className="panel relative"
            style={{ transform: `translate(${offset.x}px, ${offset.y}px)`, zIndex: z }}
            onPointerDownCapture={bringToFront}
        >
            <div
                className="flex cursor-grab touch-none select-none items-center justify-between text-2xl text-accent active:cursor-grabbing"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
            >
                <h2>{title}</h2>
                {onClose && (
                    <button
                        type="button"
                        aria-label="Close"
                        className="cursor-pointer px-1 text-2xl text-dim hover:text-muted"
                        onClick={onClose}
                    >
                        ×
                    </button>
                )}
            </div>
            {children}
        </section>
    );
}

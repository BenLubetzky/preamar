"use client";

// One movable window on the main screen: a panel whose title bar you drag to move it, with an optional × close button.
// Holds only its own drag offset in local state; it fetches no data, its content comes in as children.

import { useRef, useState, type PointerEvent, type ReactNode } from "react";

type Props = {
    title: string;
    onClose?: () => void;
    children: ReactNode;
};

type DragStart = { mouseX: number; mouseY: number; x: number; y: number };

/** A panel that can be moved around by dragging its title bar. */
export function DraggableWindow({ title, onClose, children }: Props) {
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const dragStart = useRef<DragStart | null>(null);

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
        <section className="panel" style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}>
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

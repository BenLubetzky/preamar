"use client";

// The list part shared by both subtask fields: shows up to 3 rows, scrolls past that (scrollbar hidden),
// shows a small down arrow when there are more, and scrolls a newly added row into view. The rows come in as children.

import { useEffect, useRef, type ReactNode } from "react";

/** How many rows show before the list starts to scroll. */
const VISIBLE_ROWS = 3;

type Props = {
    /** How many rows there are, to know when one was added and when to show the arrow. */
    rowCount: number;
    /** Adds an empty row; called by the "+ Add a new subtask" button. */
    onAdd: () => void;
    /** The <li> rows. */
    children: ReactNode;
};

/** A list of subtask rows that scrolls after 3 and jumps to a row as soon as it's added. */
export function SubtaskRows({ rowCount, onAdd, children }: Props) {
    // useRef: a box that keeps a value between renders without causing a re-render when it changes
    const listRef = useRef<HTMLUListElement>(null);
    const prevCount = useRef(rowCount);

    // Only when the count went up (a row was added): scroll to the bottom. Removing a row, or the form
    // opening with saved subtasks, doesn't scroll.
    useEffect(() => {
        const list = listRef.current;
        if (list && rowCount > prevCount.current) list.scrollTop = list.scrollHeight;
        prevCount.current = rowCount;
    }, [rowCount]);

    return (
        <>
            {/* Up to 3 rows it's a plain list. Past that it gets a height limit and scrolls:
                94px = 3 × 28px rows (h-7) + 2 × 4px gaps (space-y-1) + 1px padding top and bottom (py-px),
                so the rows' borders never sit right on the cut edge. The last two classes hide the scrollbar:
                scrollbar-width for most browsers, ::-webkit-scrollbar for older Safari */}
            <ul
                ref={listRef}
                className={`space-y-1 ${
                    rowCount > VISIBLE_ROWS
                        ? "max-h-[94px] overflow-y-auto py-px [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                        : ""
                }`}
            >
                {children}
            </ul>
            <div className="mt-1.5 flex items-center justify-between">
                <button type="button" className="btn-ghost h-6 px-2 text-base" onClick={onAdd}>
                    + Add a new subtask
                </button>
                {/* Same width as the × buttons, so the arrow sits right under them */}
                {rowCount > VISIBLE_ROWS && (
                    <span className="flex w-6 justify-center" title="Scroll for more">
                        <DownArrow />
                    </span>
                )}
            </div>
        </>
    );
}

/** A 5×3 pixel arrow pointing down, in the same style as the play/pause icons. Also used by TemplateList. */
export function DownArrow() {
    return (
        <svg width="10" height="6" viewBox="0 0 5 3" shapeRendering="crispEdges" aria-hidden="true">
            <rect x="0" y="0" width="5" height="1" fill="#9A8A6A" />
            <rect x="1" y="1" width="3" height="1" fill="#9A8A6A" />
            <rect x="2" y="2" width="1" height="1" fill="#9A8A6A" />
        </svg>
    );
}

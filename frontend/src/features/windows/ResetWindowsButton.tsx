"use client";

// The "put windows back" button: a small pixel icon of two overlapping windows.
// Holds no state; HomeLayout.tsx owns the reset counter and passes it to every DraggableWindow.

type Props = {
    /** Called on click; the parent tells every window to go back to its default place. */
    onReset: () => void;
};

/** Sends every window back to its default place (only their position changes). */
export function ResetWindowsButton({ onReset }: Props) {
    return (
        <button
            type="button"
            className="btn flex size-8 items-center justify-center"
            title="Put windows back"
            aria-label="Put windows back"
            onClick={onReset}
        >
            <WindowsIcon />
        </button>
    );
}

/** A 9×8 pixel icon: one window outline behind another, in the same style as the play/pause icons. */
function WindowsIcon() {
    return (
        <svg width="18" height="16" viewBox="0 0 9 8" shapeRendering="crispEdges" aria-hidden="true">
            {/* Back window (top-left); its lines stop where the front window covers it */}
            <rect x="0" y="0" width="6" height="1" fill="#F2C86A" />
            <rect x="0" y="1" width="1" height="4" fill="#F2C86A" />
            <rect x="5" y="1" width="1" height="2" fill="#F2C86A" />
            <rect x="1" y="4" width="2" height="1" fill="#F2C86A" />
            {/* Front window (bottom-right) */}
            <rect x="3" y="3" width="6" height="1" fill="#F2C86A" />
            <rect x="3" y="4" width="1" height="4" fill="#F2C86A" />
            <rect x="8" y="4" width="1" height="4" fill="#F2C86A" />
            <rect x="4" y="7" width="4" height="1" fill="#F2C86A" />
        </svg>
    );
}

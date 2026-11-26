"use client";

// Wraps the Tasks window's content so a template dropped on it is copied into a new task.
// The template id comes from TemplateList's drag data; the copy goes through useCopyTask() (hooks.ts).

import { useEffect, useState, type DragEvent, type ReactNode } from "react";
import { useCopyTask } from "../hooks";
import { TEMPLATE_DRAG_TYPE } from "./TemplateList";

/** An area that copies any template dropped on it into a new task, outlined while any template is being dragged. */
export function TemplateDropZone({ children }: { children: ReactNode }) {
    const copyTask = useCopyTask();
    const [isDragging, setIsDragging] = useState(false);

    // Listens on the whole page, so the zone knows a template drag started even though it started
    // in another window. useEffect's return removes the listeners when the zone leaves the screen.
    useEffect(() => {
        /** Turns the outline on when the drag that just started is a template. */
        function handleAnyDragStart(e: globalThis.DragEvent) {
            if (e.dataTransfer?.types.includes(TEMPLATE_DRAG_TYPE)) setIsDragging(true);
        }
        /** Turns the outline off when any drag ends, dropped or not. */
        function handleAnyDragEnd() {
            setIsDragging(false);
        }
        document.addEventListener("dragstart", handleAnyDragStart);
        document.addEventListener("dragend", handleAnyDragEnd);
        return () => {
            document.removeEventListener("dragstart", handleAnyDragStart);
            document.removeEventListener("dragend", handleAnyDragEnd);
        };
    }, []);

    /** Allows the drop, but only for template drags. */
    function handleDragOver(e: DragEvent<HTMLDivElement>) {
        if (!e.dataTransfer.types.includes(TEMPLATE_DRAG_TYPE)) return;
        // The browser refuses drops by default; preventDefault says "this area accepts it".
        e.preventDefault();
        // dropEffect tells the browser what kind of drop this area will do.
        // The options are "copy", "move", "line", "none".
        // We specify it for 2 reasons, in TemplateList.tsx we said effectAllowed = "copy", if it wouldn't
        // match here the browser would refuse the drop. Second reason, with "copy" the browser shows a small + next to the
        // cursor while we hover over the drop zone.
        e.dataTransfer.dropEffect = "copy";
    }

    /** Copies the dropped template. */
    function handleDrop(e: DragEvent<HTMLDivElement>) {
        e.preventDefault();
        const id = e.dataTransfer.getData(TEMPLATE_DRAG_TYPE);
        if (id) copyTask.mutate(id);
    }

    return (
        <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            // Dashed the whole time a template is being dragged, whether it's over this zone or not
            className={isDragging ? "outline-2 outline-dashed outline-accent" : ""}
        >
            {children}
        </div>
    );
}

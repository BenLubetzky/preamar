"use client";

// The Templates window's list: tasks saved as templates. They can't be checked off, only edited, deleted,
// or dragged onto the Tasks window (TemplateDropZone) to copy them in. The templates come from useTemplates() (hooks.ts).
// Shows up to 4 rows; past that the list scrolls (scrollbar hidden) with a small down arrow under it.

import { useLayoutEffect, useRef, useState, type DragEvent } from "react";
import { isUnsaved, useTemplates } from "../hooks";
import { DeleteTaskButton } from "./DeleteTaskButton";
import { EditTaskForm } from "./EditTaskForm";
import { DownArrow } from "@/features/subtasks/components/SubtaskRows";

/** The drag data type that marks a drag as "a template's id", so other drags (like text) are ignored on drop. */
export const TEMPLATE_DRAG_TYPE = "application/x-preamar-template";

/** How many templates show before the list starts to scroll. */
const VISIBLE_ROWS = 4;

/** Shows each template's title and duration, or the edit form for the one being edited. */
export function TemplateList() {
    const { data: templates, isPending, isError } = useTemplates();
    const [editingId, setEditingId] = useState<string | null>(null);
    // The template being dragged right now, so it keeps its gold line until it's dropped
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const listRef = useRef<HTMLUListElement>(null);
    // The list's height limit in px, or undefined for "no limit" (4 templates or fewer)
    const [maxHeight, setMaxHeight] = useState<number | undefined>(undefined);
    const scrolls = (templates?.length ?? 0) > VISIBLE_ROWS;

    // Rows aren't all the same height (a description adds a line, the edit form is much taller), so instead of
    // a fixed number we measure where the 4th row ends. useLayoutEffect runs after React updates the page but
    // before the browser paints it, so the limit is in place before you'd ever see the list too tall.
    // Must sit above the early returns below: React needs the same hooks, in the same order, every render.
    useLayoutEffect(() => {
        const list = listRef.current;
        if (!list || !scrolls) {
            setMaxHeight(undefined);
            return;
        }
        const lastVisible = list.children[VISIBLE_ROWS - 1] as HTMLElement;
        // Distance from the list's top to the 4th row's bottom. + scrollTop: if the list is scrolled,
        // the rows have moved up by that much, so add it back. + 2: room for the py-px padding.
        const top = list.getBoundingClientRect().top;
        setMaxHeight(lastVisible.getBoundingClientRect().bottom - top + list.scrollTop + 2);
    }, [templates, editingId, scrolls]);

    if (isPending) return <p className="text-muted">Loading templates...</p>;
    if (isError) return <p className="text-muted">Couldn&apos;t load your templates.</p>;
    if (templates.length === 0) {
        return <p className="text-muted">No templates yet. Tick &quot;Save as template&quot; when adding a task.</p>;
    }

    /** Puts the template's id into the drag, for TemplateDropZone to read on drop. */
    function handleDragStart(e: DragEvent<HTMLLIElement>, id: string) {
        // e.dataTranser is like a little box the browser carries along with the drag.
        // The place where you drop onto can read it when the drop happens.
        // What we are doing is placing the id of the template's id under the name TEMPLATE_DRAG_TYPE.
        e.dataTransfer.setData(TEMPLATE_DRAG_TYPE, id);
        e.dataTransfer.effectAllowed = "copy";
        setDraggingId(id);
    }

    return (
        <>
            <p className="mb-1 text-lg text-dim">Drag one onto Tasks to add it.</p>
            {/* The last two scroll classes hide the scrollbar: scrollbar-width for most browsers,
                ::-webkit-scrollbar for older Safari */}
            <ul
                ref={listRef}
                className={`space-y-1 ${
                    scrolls ? "overflow-y-auto py-px [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" : ""
                }`}
                style={{ maxHeight }}
            >
                {templates.map((template) =>
                    editingId === template.id ? (
                        <li key={template.id} className="border border-line p-2">
                            <EditTaskForm task={template} onClose={() => setEditingId(null)} />
                        </li>
                    ) : (
                        <li
                            key={template.id}
                            // In JSX writing an attribute with no value sets its value to true by default
                            draggable
                            onDragStart={(e) => handleDragStart(e, template.id)}
                            onDragEnd={() => setDraggingId(null)}
                            // group: lets the gold line below react to hovering the whole row (group-hover).
                            // A template still waiting for its real id can't be clicked or dragged, and is dimmed.
                            className={`group relative cursor-grab px-1 py-1 text-[22px] leading-6 active:cursor-grabbing ${
                                isUnsaved(template) ? "pointer-events-none opacity-60" : ""
                            }`}
                        >
                            <div className="flex items-center gap-2.5">
                                <span className="min-w-0 flex-1 truncate">{template.title}</span>
                                <span className="text-muted">{template.duration_minutes} min</span>
                                <button
                                    type="button"
                                    onClick={() => setEditingId(template.id)}
                                    className="flex h-8 cursor-pointer items-center px-2 text-lg text-dim hover:bg-btn hover:text-muted"
                                >
                                    edit
                                </button>
                                <DeleteTaskButton taskId={template.id} />
                            </div>
                            {template.description && (
                                <p className="truncate text-lg text-dim">{template.description}</p>
                            )}
                            {/* A thin gold line under the row, centered, 75% wide; shows on hover and while dragged */}
                            <span
                                className={`absolute bottom-0 left-1/2 h-px w-3/4 -translate-x-1/2 bg-accent ${
                                    draggingId === template.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                }`}
                            />
                        </li>
                    ),
                )}
            </ul>
            {scrolls && (
                <div className="mt-1 flex justify-end px-1" title="Scroll for more">
                    <DownArrow />
                </div>
            )}
        </>
    );
}

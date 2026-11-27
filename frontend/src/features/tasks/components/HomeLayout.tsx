"use client";

// The main screen's draggable windows: recommendations (left), tasks (center), new task above templates (right).
// It only places existing components; each one fetches its own data through hooks.ts.
// Holds the free minutes given by the user. The center box is always present,
// the recommendation opens after minutes state is updated to a number, the add task box opens by clicking the button "+ Add new task", the templates box by the small "templates" button.
// A bar fixed at the top right holds "put windows back" and log out.

import { useState } from "react";
import { LogoutButton } from "@/features/auth/components/LogoutButton";
import { RecommendationPanel } from "./RecommendationPanel";
import { TaskList } from "./TaskList";
import { AddTaskForm } from "./AddTaskForm";
import { FreeTimeInput } from "./FreeTimeInput";
import { DraggableWindow } from "@/features/windows/DraggableWindow";
import { TemplateList } from "./TemplateList";
import { TemplateDropZone } from "./TemplateDropZone";
import { ResetWindowsButton } from "@/features/windows/ResetWindowsButton";

/** Lays out the left, center and right boxes of the main screen. */
export function HomeLayout() {
    const [minutes, setMinutes] = useState<number | null>(null);
    const [showAdd, setShowAdd] = useState(false);
    const [showTemplates, setShowTemplates] = useState(false);
    // Goes up on each "put windows back" click; every window watches it and resets its position
    const [resetCount, setResetCount] = useState(0);

    return (
      <div className="min-h-screen p-6 font-pixel text-xl text-ink">
        <h1 className="text-4xl text-accent">preamar</h1>

        {/* fixed: stays in the top-right corner, even when the page scrolls. z-10 puts it above the windows */}
        <div className="fixed top-6 right-6 z-10 flex items-center gap-3">
            <ResetWindowsButton onReset={() => setResetCount((c) => c + 1)} />
            <LogoutButton />
        </div>

        {/* isolate: the windows' z-indexes only compete with each other inside this box, so however high
            they climb, they can never cover the top-right bar */}
        <div className="isolate mt-6 grid grid-cols-[19rem_26rem_19rem] items-start justify-center gap-6">
            {/* The left column: just the recommendation panel */}
            <div>
                {minutes != null && (
                    <DraggableWindow title="What fits" onClose={() => setMinutes(null)} resetSignal={resetCount}>
                        <RecommendationPanel key={minutes} minutes={minutes}/>
                    </DraggableWindow>
                )}
            </div>

            <DraggableWindow title="Tasks" resetSignal={resetCount}>
                <TemplateDropZone>
                    <FreeTimeInput onSubmit={setMinutes}/>
                    <div className="mt-3 mb-2 h-px bg-btn" />
                    <TaskList />
                    <button type="button" className="btn mt-3 h-10 w-full text-2xl" onClick={() => setShowAdd(true)}>
                        + Add new task
                    </button>
                    <button
                        type="button"
                        className="mt-2 cursor-pointer text-lg text-dim hover:text-muted"
                        onClick={() => setShowTemplates((shown) => !shown)}
                    >
                        templates
                    </button>
                </TemplateDropZone>
            </DraggableWindow>

            {/* The right column: New task on top, Templates under it. Both are in the normal flow,
                so with New task closed, Templates moves up to the top */}
            <div className="flex flex-col gap-6">
                {showAdd && (
                    <DraggableWindow title="New task" onClose={() => setShowAdd(false)} resetSignal={resetCount}>
                        <AddTaskForm onClose={() => setShowAdd(false)} />
                    </DraggableWindow>
                )}
                {showTemplates && (
                    <DraggableWindow title="Templates" onClose={() => setShowTemplates(false)} resetSignal={resetCount}>
                        <TemplateList />
                    </DraggableWindow>
                )}
            </div>
        </div>
      </div>  
    );
}
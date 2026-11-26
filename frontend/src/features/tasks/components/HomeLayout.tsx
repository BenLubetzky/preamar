"use client";

// The main screen's draggable windows: recommendations and templates (left), tasks (center), new task (right).
// It only places existing components; each one fetches its own data through hooks.ts.
// Holds the free minutes given by the user. The center box is always present,
// the recommendation opens after minutes state is updated to a number, the add task box opens by clicking the button "+ Add new task", the templates box by the small "templates" button

import { useState } from "react";
import { LogoutButton } from "@/features/auth/components/LogoutButton";
import { RecommendationPanel } from "./RecommendationPanel";
import { TaskList } from "./TaskList";
import { AddTaskForm } from "./AddTaskForm";
import { FreeTimeInput } from "./FreeTimeInput";
import { DraggableWindow } from "@/features/windows/DraggableWindow";
import { TemplateList } from "./TemplateList";
import { TemplateDropZone } from "./TemplateDropZone";

/** Lays out the left, center and right boxes of the main screen. */
export function HomeLayout() {
    const [minutes, setMinutes] = useState<number | null>(null);
    const [showAdd, setShowAdd] = useState(false);
    const [showTemplates, setShowTemplates] = useState(false);

    return (
      <div className="min-h-screen p-6 font-pixel text-xl text-ink">
        <h1 className="text-4xl text-accent">preamar</h1>

        <div className="mt-6 grid grid-cols-[19rem_26rem_19rem] items-start justify-center gap-6">
            {/* The left column: What fits sits in the normal flow; Templates is absolute (taken out of the flow)
                at the column's top, so no other window's height can push it */}
            <div className="relative">
                {minutes != null && (
                    <DraggableWindow title="What fits" onClose={() => setMinutes(null)}>
                        <RecommendationPanel key={minutes} minutes={minutes}/>
                    </DraggableWindow>
                )}
                {showTemplates && (
                    <div className="absolute inset-x-0 top-0">
                        <DraggableWindow title="Templates" onClose={() => setShowTemplates(false)}>
                            <TemplateList />
                        </DraggableWindow>
                    </div>
                )}
            </div>

            <DraggableWindow title="Tasks">
                <TemplateDropZone>
                    <div className="flex justify-end">
                        <LogoutButton />
                    </div>
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

            {showAdd ? (
                <DraggableWindow title="New task" onClose={() => setShowAdd(false)}>
                    <AddTaskForm onClose={() => setShowAdd(false)} />
                </DraggableWindow>
            ) : (
                <div />
            )}
        </div>
      </div>  
    );
}
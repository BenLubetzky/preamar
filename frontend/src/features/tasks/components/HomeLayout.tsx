"use client";

// The main screen's three boxes: recommendations (left), tasks (center), new task (right).
// It only places existing components; each one fetches its own data through hooks.ts.
// Holds the free minutes given by the user. The center box is always present,
// the recommendation opens after minutes state is updated to a number, the add task box opens by clicking the button "+ Add new task"

import { useState } from "react";
import { LogoutButton } from "@/features/auth/components/LogoutButton";
import { RecommendationPanel } from "./RecommendationPanel";
import { TaskList } from "./TaskList";
import { AddTaskForm } from "./AddTaskForm";
import { FreeTimeInput } from "./FreeTimeInput";

/** Lays out the left, center and right boxes of the main screen. */
export function HomeLayout() {
    const [minutes, setMinutes] = useState<number | null>(null);
    const [showAdd, setShowAdd] = useState(false);

    return (
      <div className="min-h-screen p-6 font-pixel text-lg text-ink">
        <h1 className="text-3xl text-accent">preamar</h1>

        <div className="mt-6 grid grid-cols-[18rem_24rem_18rem] items-start justify-center gap-6">
            {minutes != null ? (
                <section className="panel">
                    <div className="flex items-center justify-between text-[22px] text-accent">
                        <h2>What fits</h2>
                        <button
                            type="button"
                            aria-label="Close"
                            className="cursor-pointer text-lg text-dim hover:text-muted"
                            onClick={() => setMinutes(null)}
                        >
                            ×
                        </button>
                    </div>
                    <RecommendationPanel minutes={minutes}/>
                </section>
            ) : (
                <div />
            )}

            <section className="panel">
                <div className="-mt-1 flex justify-end">
                    <LogoutButton />
                </div>
                <FreeTimeInput onSubmit={setMinutes}/>
                <div className="mt-3 mb-2 h-px bg-btn" />
                <TaskList />
                <button type="button" className="btn mt-3 h-9 w-full text-xl" onClick={() => setShowAdd(true)}>
                    + Add new task
                </button>
            </section>
            { showAdd ? (
                <section className="panel">
                    <div className="flex justify-between">
                        <h2>New task</h2>
                        <button type="button" onClick={() => setShowAdd(false)}>x</button>
                    </div>
                    <AddTaskForm onClose={() => setShowAdd(false)} />
                </section>
            ) : (
                <div />
            )}
        </div>
      </div>  
    );
}
"use client";

// The main screen's three boxes: recommendations (left), tasks (center), new task (right).
// It only places existing components; each one fetches its own data through hooks.ts.
// Holds the free minutes given by the user.

import { LogoutButton } from "@/features/auth/components/LogoutButton";
import { RecommendationPanel } from "./RecommendationPanel";
import { TaskList } from "./TaskList";
import { AddTaskForm } from "./AddTaskForm";
import { useState } from "react";
import { FreeTimeInput } from "./FreeTimeInput";

/** Lays out the left, center and right boxes of the main screen. */
export function HomeLayout() {
    const [minutes, setMinutes] = useState<number | null>(null);

    return (
      <div className="min-h-screen p-6 text-white">
        <h1 className="text-3xl">preamar</h1>

        <div className="mt-6 grid grid-cols-[18rem_24rem_18rem] items-start justify-center gap-6">
            <section className="border bg-black/70 p-4">
                <RecommendationPanel minutes={minutes}/>
            </section>

            <section className="border bg-black/70 p-4">
                <div className="flex justify-end">
                    <LogoutButton />
                </div>
                <FreeTimeInput onSubmit={setMinutes}/>
                <TaskList />
            </section>

            <section className="border bg-black/70 p-4">
                <AddTaskForm />
            </section>
        </div>
      </div>  
    );
}
// The main screen's three boxes: recommendations (left), tasks (center), new task (right).
// It only places existing components; each one fetches its own data through hooks.ts.

import { LogoutButton } from "@/features/auth/components/LogoutButton";
import { Recommendation } from "./Recommendation";
import { TaskList } from "./TaskList";
import { AddTaskForm } from "./AddTaskForm";

/** Lays out the left, center and right boxes of the main screen. */
export function HomeLayout() {
    return (
      <div className="min-h-screen p-6 text-white">
        <h1 className="text-3xl">preamar</h1>

        <div className="mt-6 grid grid-cols-[18rem_24rem_18rem] items-start justify-center gap-6">
            <section className="border bg-black/70 p-4">
                <Recommendation />
            </section>

            <section className="border bg-black/70 p-4">
                <div className="flex justify-end">
                    <LogoutButton />
                </div>
                <TaskList />
            </section>

            <section className="border bg-black/70 p-4">
                <AddTaskForm />
            </section>
        </div>
      </div>  
    );
}
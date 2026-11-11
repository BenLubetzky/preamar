// The "/" route: the main page, where the task list and free time will go.
// It only arranges feature components on the page; it fetches no data itself.

import { RequireAuth } from "@/features/auth/components/RequireAuth";
import { LogoutButton } from "@/features/auth/components/LogoutButton";
import { TaskList } from "@/features/tasks/components/TaskList";
import { AddTaskForm } from "@/features/tasks/components/AddTaskForm";

/** Shows the home page. */
export default function Home() {
  return (
    <RequireAuth>
      <main className="mx-auto max-w-2xl p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Preamar</h1>
          <LogoutButton />
        </div>
        <AddTaskForm/>
        <TaskList />
      </main>
    </RequireAuth>
  );
}
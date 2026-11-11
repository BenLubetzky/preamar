// Shows the user's task list.
// The tasks come from useTasks() (hooks.ts).
"use client";

import { useTasks } from "../hooks";

/** Shows each task's title, description and duration. */
export function TaskList() {
  const { data: tasks, isPending, isError } = useTasks();

  if (isPending) return <p>Loading tasks...</p>;
  if (isError) return <p>Couldn&apos;t load your tasks.</p>;
  if (tasks.length === 0) return <p>No tasks yet.</p>;

  return (
    <ul className="mt-6 space-y-2">
      {tasks.map((task) => (
        <li key={task.id} className="rounded border p-3">
          <div className="flex justify-between">
            <span className="font-medium">{task.title}</span>
            <span>{task.duration_minutes} min</span>
          </div>
          {task.description && <p className="text-sm text-gray-500">{task.description}</p>}
        </li>
      ))}
    </ul>
  );
}
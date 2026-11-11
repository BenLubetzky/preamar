// Shows the user's task list.
// The tasks come from useTasks() (hooks.ts).
"use client";

import { useTasks } from "../hooks";
import { DeleteTaskButton } from "./DeleteTaskButton";
import { TaskDoneCheckbox } from "./TaskDoneCheckbox";

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
            <div className="flex items-center gap-2">
              <TaskDoneCheckbox task={task} />
              <span className={`font-medium ${task.done_at ? "line-through text-gray-400" : ""}`}>
                {task.title}
              </span>
            </div>
            <div className="flex gap-3">
              <span>{task.duration_minutes} min</span>
              <DeleteTaskButton taskId={task.id} />
            </div>
          </div>
          {task.description && <p className="text-sm text-gray-500">{task.description}</p>}
        </li>
      ))}
    </ul>
  );
}
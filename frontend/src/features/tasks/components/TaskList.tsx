// Shows the user's task list; one task at a time can be switched into an edit form.
// The tasks come from useTasks() (hooks.ts).
"use client";

import { useState } from "react";
import { useTasks } from "../hooks";
import { DeleteTaskButton } from "./DeleteTaskButton";
import { TaskDoneCheckbox } from "./TaskDoneCheckbox";
import { EditTaskForm } from "./EditTaskForm";

/** Shows each task's title, description and duration, or the edit form for the one being edited. */
export function TaskList() {
  const { data: tasks, isPending, isError } = useTasks();
  const [editingId, setEditingId] = useState<string | null>(null);

  if (isPending) return <p>Loading tasks...</p>;
  if (isError) return <p>Couldn&apos;t load your tasks.</p>;
  if (tasks.length === 0) return <p>No tasks yet.</p>;

  return (
    <ul className="mt-6 space-y-2">
      {tasks.map((task) =>
        editingId === task.id ? (
          <li key={task.id} className="rounded border p-3">
            <EditTaskForm task={task} onClose={() => setEditingId(null)} />
          </li>
        ) : (
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
                <button type="button" onClick={() => setEditingId(task.id)} className="text-sm">
                  Edit
                </button>
                <DeleteTaskButton taskId={task.id} />
              </div>
            </div>
            {task.description && <p className="text-sm text-gray-500">{task.description}</p>}
          </li>
        ),
      )}
    </ul>
  );
}
// Shows the user's task list; one task at a time can be switched into an edit form.
// The tasks come from useTasks() (hooks.ts).
"use client";

import { useState } from "react";
import { useTasks } from "../hooks";
import { DeleteTaskButton } from "./DeleteTaskButton";
import { TaskDoneCheckbox } from "./TaskDoneCheckbox";
import { EditTaskForm } from "./EditTaskForm";
import { SubtaskList } from "@/features/subtasks/components/SubtaskList";

/** Shows each task's title, description and duration, or the edit form for the one being edited. */
export function TaskList() {
  const { data: tasks, isPending, isError } = useTasks();
  const [editingId, setEditingId] = useState<string | null>(null);

  if (isPending) return <p className="text-muted">Loading tasks...</p>;
  if (isError) return <p className="text-muted">Couldn&apos;t load your tasks.</p>;
  if (tasks.length === 0) return <p className="text-muted">No tasks yet.</p>;

  return (
    <ul className="space-y-1">
      {tasks.map((task) =>
        editingId === task.id ? (
          <li key={task.id} className="border border-line p-2">
            <EditTaskForm task={task} onClose={() => setEditingId(null)} />
          </li>
        ) : (
          <li key={task.id} className="px-1 py-1 text-[22px] leading-6">
            <div className="flex items-center gap-2.5">
              <TaskDoneCheckbox task={task} />
              <span className={`min-w-0 flex-1 truncate ${task.done_at ? "text-dim line-through" : ""}`}>
                {task.title}
              </span>
              <span className="text-muted">{task.duration_minutes} min</span>
              <button
                type="button"
                onClick={() => setEditingId(task.id)}
                className="flex h-8 cursor-pointer items-center px-2 text-lg text-dim hover:bg-btn hover:text-muted"
              >
                edit
              </button>
              <DeleteTaskButton taskId={task.id} />
            </div>
            {task.description && <p className="truncate pl-6 text-lg text-dim">{task.description}</p>}
            {task.subtasks.length > 0 && (
              <div className="mt-0.5 pl-6">
                <SubtaskList subtasks={task.subtasks} />
              </div>
            )}
          </li>
        ),
      )}
    </ul>
  );
}

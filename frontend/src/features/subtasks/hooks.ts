// TanStack Query hooks for subtasks: components use these, never api.ts directly.
// Subtasks arrive inside each task, so every change refreshes the "tasks" cache (TASKS_KEY)

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TASKS_KEY } from "@/features/tasks/hooks";
import type { Task } from "@/features/tasks/types";
import { createSubtask, deleteSubtask, markSubtaskDone, markSubtaskUndone, updateSubtask } from "./api";

/** Adds a subtask to a task then refreshes the task list. */
export function useCreateSubtask() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ taskId, title }: { taskId: string, title: string}) => 
            createSubtask(taskId, { title }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: TASKS_KEY })
    })
}


/** Renames a subtask, then refreshes the task list. */
export function useUpdateSubtask() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, title }: {id: string, title: string}) =>
            updateSubtask(id, { title }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: TASKS_KEY })
    })
}


/** Deletes a subtask, then refreshes the task list. */
export function useDeleteSubtask() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteSubtask,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: TASKS_KEY })
    })
}


/** Ticks or unticks a subtask (and its parent task, if that changes) on screen right away, then saves it and
 * refreshes the task list (putting the old lists back if the save fails). */
export function useSetSubtaskDone() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, done }: {id: string, done: boolean}) =>
            done ? markSubtaskDone(id) : markSubtaskUndone(id),
        onMutate: async ({ id, done }) => {
            await queryClient.cancelQueries({ queryKey: TASKS_KEY });
            const previous = queryClient.getQueriesData<Task[]>({ queryKey: TASKS_KEY });
            const now = new Date().toISOString();
            // Every list under TASKS_KEY, since the same task can show in the task list and in What fits
            queryClient.setQueriesData<Task[]>({ queryKey: TASKS_KEY }, (tasks) =>
                tasks?.map((task) => {
                    // A template's subtasks can't be ticked, so a template is left exactly as it is
                    if (task.is_template) return task;
                    if (!task.subtasks.some((s) => s.id === id)) return task;
                    const subtasks = task.subtasks.map((s) =>
                        s.id !== id ? s : { ...s, done_at: done ? (s.done_at ?? now) : null },
                    );
                    // Same rule as the backend (sync_task_done): the task is done exactly when all its subtasks are
                    const allDone = subtasks.every((s) => s.done_at !== null);
                    return { ...task, subtasks, done_at: allDone ? (task.done_at ?? now) : null };
                }),
            );
            return { previous };
        },
        onError: (_error, _variables, context) => {
            context?.previous.forEach(([key, data]) => queryClient.setQueryData(key, data));
        },
        onSettled: () => queryClient.invalidateQueries({ queryKey: TASKS_KEY }),
    })
}
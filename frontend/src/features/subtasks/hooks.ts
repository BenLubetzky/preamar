// TanStack Query hooks for subtasks: components use these, never api.ts directly.
// Subtasks arrive inside each task, so every change refreshes the "tasks" cache (TASKS_KEY)

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TASKS_KEY } from "@/features/tasks/hooks";
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


/** Marks a subtask done or not done, then refreshes the task list (the parent may have changed too). */
export function useSetSubtaskDone() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, done }: {id: string, done: boolean}) =>
            done ? markSubtaskDone(id) : markSubtaskUndone(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: TASKS_KEY })
    })
}
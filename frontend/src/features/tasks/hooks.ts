// TanStack Query hooks for tasks: components use these, never api.ts directly.
// The data lives in the shared query cache (src/core/query-provider.tsx) under the "tasks" key

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTask, getTasks, deleteTask, markTaskDone, markTaskUndone, updateTask } from "./api";
import type { TaskUpdate } from "./types";


/** The cache key for the task list, shared by every hook that reads or refreshes it. */
export const TASKS_KEY = ["tasks"]

/** Gets the user's task list (from the cache, or from the backend if needed). */
export function useTasks() {
    // useQuery is a hook that asks TanStack Query for some data. You give it 2 things:
    // 1. queryKey - the name the data is saved under in the cache, like a label on a box.
    // 2. queryFn: the function that fetches the data when the box is empty or out of date
    return useQuery({ queryKey: TASKS_KEY, queryFn: getTasks });
}


/** Creates a task, then refreshes the task list. */
export function useCreateTask() {
    // useQueryClient gives you the shared QueryClient, which is the cache created in query-provider.tsx
    const queryClient = useQueryClient();
    // useMutation is a hook for changing data (add, edit, delete, mark done).
    // useQuery is for reading.
    return useMutation({
        mutationFn: createTask,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: TASKS_KEY }),
    })
}


/** Deletes a task, then refreshes the task list. */
export function useDeleteTask() {
    const queryClient = useQueryClient();
    // queryClient.invalidateQueries tells the cache that the data under a key is out of date.
    // If a component on screen is using that key, TanStack Query fetches it from the backend again right away.
    return useMutation({
        mutationFn: deleteTask,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: TASKS_KEY }),
    });
}


/** Marks a task done or not done, then refreshes the task list. */
export function useSetTaskDone() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, done }: { id:string, done:boolean}) => 
            done ? markTaskDone(id) : markTaskUndone(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: TASKS_KEY}),
    })
}


/** Saves changes to a task, then refreshes the task list. */
export function useUpdateTask() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, changes }: { id: string; changes: TaskUpdate }) => updateTask(id, changes),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: TASKS_KEY}),
    });
}
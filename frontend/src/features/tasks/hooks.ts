// TanStack Query hooks for tasks: components use these, never api.ts directly.
// The data lives in the shared query cache (src/core/query-provider.tsx) under the "tasks" key

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTask, getTasks } from "./api";


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
        onSuccess: () => queryClient.invalidateQueries({ queryKey: TASKS_KEY })
    })
}
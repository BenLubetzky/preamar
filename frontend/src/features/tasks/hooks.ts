// TanStack Query hooks for tasks: components use these, never api.ts directly.
// The data lives in the shared query cache (src/core/query-provider.tsx) under the "tasks" key

import { useQuery } from "@tanstack/react-query";
import { getTasks } from "./api";


/** The cache key for the task list, shared by every hook that reads or refreshes it. */
export const TASKS_KEY = ["tasks"]

/** Gets the user's task list (from the cache, or from the backend if needed). */
export function useTasks() {
    // useQuery is a hook that asks TanStack Query for some data. You give it 2 things:
    // 1. queryKey - the name the data is saved under in the cache, like a label on a box.
    // 2. queryFn: the function that fetches the data when the box is empty or out of date
    return useQuery({ queryKey: TASKS_KEY, queryFn: getTasks });
}
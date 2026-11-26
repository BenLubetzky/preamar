// TanStack Query hooks for tasks: components use these, never api.ts directly.
// The data lives in the shared query cache (src/core/query-provider.tsx) under the "tasks" key

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createTask, getTasks, getTemplates, copyTask, deleteTask, markTaskDone, markTaskUndone, updateTask, getRecommendation,
} from "./api";
import type { Task, TaskUpdate } from "./types";


/** The cache key for the task list, shared by every hook that reads or refreshes it. */
export const TASKS_KEY = ["tasks"]

/** Gets the user's task list (from the cache, or from the backend if needed). */
export function useTasks() {
    // useQuery is a hook that asks TanStack Query for some data. You give it 2 things:
    // 1. queryKey - the name the data is saved under in the cache, like a label on a box.
    // 2. queryFn: the function that fetches the data when the box is empty or out of date
    return useQuery({ queryKey: TASKS_KEY, queryFn: getTasks });
}


/** Gets the user's templates (from the cache, or from the backend if needed). */
export function useTemplates() {
    // The key starts with TASKS_KEY, so every hook below that refreshes "tasks" refreshes this too.
    return useQuery({ queryKey: [...TASKS_KEY, "templates"], queryFn: getTemplates });
}


/** Copies a template into a new normal task, then refreshes the task list. */
export function useCopyTask() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: copyTask,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: TASKS_KEY }),
    });
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


/** Marks a task done or not done on screen right away, then saves it and refreshes the task list
 * (putting the old list back if the save fails). */
export function useSetTaskDone() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, done }: { id:string, done:boolean}) =>
            done ? markTaskDone(id) : markTaskUndone(id),
        // onMutate runs before mutationFn sends the request. What it returns is the "context",
        // handed to onError and onSettled later.
        onMutate: async ({ id, done }) => {
            // Stop any refetch already in flight, so its older data can't land on top of the change below
            await queryClient.cancelQueries({ queryKey: TASKS_KEY });
            const previous = queryClient.getQueryData<Task[]>(TASKS_KEY);
            const now = new Date().toISOString();
            // Same rules as the backend: done also ticks every subtask (keeping existing done times),
            // not done only unticks the task itself.
            queryClient.setQueryData<Task[]>(TASKS_KEY, (tasks) =>
                tasks?.map((task) => {
                    if (task.id !== id) return task;
                    if (!done) return { ...task, done_at: null };
                    return {
                        ...task,
                        done_at: task.done_at ?? now,
                        subtasks: task.subtasks.map((s) => ({ ...s, done_at: s.done_at ?? now })),
                    };
                }),
            );
            return { previous };
        },
        // The save failed: put back the list from before the change
        onError: (_error, _variables, context) => {
            if (context?.previous) queryClient.setQueryData(TASKS_KEY, context.previous);
        },
        // Success or failure, fetch the real data so the screen matches the backend
        onSettled: () => queryClient.invalidateQueries({ queryKey: TASKS_KEY }),
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


/** Gets the tasks recommended for the given free minutes; does nothing while minutes is null. */
export function useRecommendation(minutes: number | null, skip: string[]) {
    // enabled says whether it's allowed to run.
    // keepPreviousData makes it so that while the new list loads, the query
    // keeps returning the old list instead of switching to pending.
    return useQuery({
        queryKey: [...TASKS_KEY, "recommend", minutes, skip],
        queryFn: () => getRecommendation(minutes!, skip),
        enabled: minutes !== null,
        placeholderData: keepPreviousData,
    })
}
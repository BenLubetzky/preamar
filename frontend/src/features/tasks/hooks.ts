// TanStack Query hooks for tasks: components use these, never api.ts directly.
// The data lives in the shared query cache (src/core/query-provider.tsx) under the "tasks" key

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createTask, getTasks, getTemplates, copyTask, deleteTask, markTaskDone, markTaskUndone, updateTask, getRecommendation,
} from "./api";
import type { Task, TaskCreate, TaskUpdate } from "./types";


/** The cache key for the task list, shared by every hook that reads or refreshes it. */
export const TASKS_KEY = ["tasks"]

/** The start of the stand-in ids given to new tasks and subtasks until the backend's real ones arrive. */
const TEMP_ID_PREFIX = "temp-";

/** Whether the task is still a stand-in the backend doesn't know yet, so its buttons must not send anything. */
export function isUnsaved(task: Task) {
    return task.id.startsWith(TEMP_ID_PREFIX);
}

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


/** Adds a task (or template) to the screen right away, then creates it and refreshes the lists
 * (putting the old lists back if the create fails). */
export function useCreateTask() {
    // useQueryClient gives you the shared QueryClient, which is the cache created in query-provider.tsx
    const queryClient = useQueryClient();
    // useMutation is a hook for changing data (add, edit, delete, mark done).
    // useQuery is for reading.
    return useMutation({
        mutationFn: createTask,
        onMutate: async (newTask: TaskCreate) => {
            await queryClient.cancelQueries({ queryKey: TASKS_KEY });
            const previous = queryClient.getQueriesData<Task[]>({ queryKey: TASKS_KEY });
            const now = new Date().toISOString();
            // The backend makes the real ids; until the refetch brings them, the task uses a stand-in id
            const tempId = `${TEMP_ID_PREFIX}${crypto.randomUUID()}`;
            const optimistic: Task = {
                id: tempId,
                title: newTask.title,
                description: newTask.description ?? null,
                duration_minutes: newTask.duration_minutes,
                done_at: null,
                is_template: newTask.is_template ?? false,
                created_at: now,
                subtasks: (newTask.subtasks ?? []).map((title) => ({
                    id: `${TEMP_ID_PREFIX}${crypto.randomUUID()}`,
                    task_id: tempId,
                    title,
                    done_at: null,
                    created_at: now,
                })),
            };
            // A template goes at the end of the templates list, a normal task at the end of the task list (oldest first)
            const key = optimistic.is_template ? [...TASKS_KEY, "templates"] : TASKS_KEY;
            queryClient.setQueryData<Task[]>(key, (tasks) => (tasks ? [...tasks, optimistic] : tasks));
            return { previous };
        },
        onError: (_error, _newTask, context) => {
            context?.previous.forEach(([key, data]) => queryClient.setQueryData(key, data));
        },
        onSettled: () => queryClient.invalidateQueries({ queryKey: TASKS_KEY }),
    })
}


/** Removes a task (or template) from the screen right away, then deletes it and refreshes the lists
 * (putting the old lists back if the delete fails). */
export function useDeleteTask() {
    const queryClient = useQueryClient();
    // queryClient.invalidateQueries tells the cache that the data under a key is out of date.
    // If a component on screen is using that key, TanStack Query fetches it from the backend again right away.
    return useMutation({
        mutationFn: deleteTask,
        onMutate: async (id: string) => {
            await queryClient.cancelQueries({ queryKey: TASKS_KEY });
            // The "Queries" (plural) versions work on every cached list whose key starts with TASKS_KEY:
            // the task list, the templates and any recommendation. getQueriesData returns [key, data] pairs.
            const previous = queryClient.getQueriesData<Task[]>({ queryKey: TASKS_KEY });
            queryClient.setQueriesData<Task[]>({ queryKey: TASKS_KEY }, (tasks) =>
                tasks?.filter((task) => task.id !== id),
            );
            return { previous };
        },
        // The delete failed: put every list back the way it was
        onError: (_error, _id, context) => {
            context?.previous.forEach(([key, data]) => queryClient.setQueryData(key, data));
        },
        onSettled: () => queryClient.invalidateQueries({ queryKey: TASKS_KEY }),
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


/** Shows a task's (or template's) changes right away, then saves them and refreshes the lists
 * (putting the old lists back if the save fails). */
export function useUpdateTask() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, changes }: { id: string; changes: TaskUpdate }) => updateTask(id, changes),
        onMutate: async ({ id, changes }) => {
            await queryClient.cancelQueries({ queryKey: TASKS_KEY });
            const previous = queryClient.getQueriesData<Task[]>({ queryKey: TASKS_KEY });
            const now = new Date().toISOString();
            // Splits the sent subtask list off from the plain fields (title, description, duration)
            const { subtasks: drafts, ...fields } = changes;
            queryClient.setQueriesData<Task[]>({ queryKey: TASKS_KEY }, (tasks) =>
                tasks?.map((task) => {
                    if (task.id !== id) return task;
                    return {
                        ...task,
                        ...fields,
                        // Same rule as the backend: a draft with a known id keeps that subtask (and its done state)
                        // with the new title; anything else is a new subtask, not done.
                        subtasks: drafts === undefined ? task.subtasks : drafts.map((draft) => {
                            const existing = task.subtasks.find((s) => s.id === draft.id);
                            if (existing) return { ...existing, title: draft.title };
                            return {
                                id: `${TEMP_ID_PREFIX}${crypto.randomUUID()}`,
                                task_id: id,
                                title: draft.title,
                                done_at: null,
                                created_at: now,
                            };
                        }),
                    };
                }),
            );
            return { previous };
        },
        onError: (_error, _variables, context) => {
            context?.previous.forEach(([key, data]) => queryClient.setQueryData(key, data));
        },
        onSettled: () => queryClient.invalidateQueries({ queryKey: TASKS_KEY }),
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
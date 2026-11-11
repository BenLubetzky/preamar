// The calls to the backend's /tasks endpoints, one function per endpoint.
// Everything goes through apiFetch (src/core/api-client.ts), which adds the token.

import { apiFetch } from "@/core/api-client";
import type { Task, TaskCreate, TaskUpdate } from "./types";

/** Gets all the user's tasks, oldest first. */
export function getTasks(){
    // Telling TypeScript that this call returns a list of tasks and can autocomplete fields
    return apiFetch<Task[]>("/tasks");
}


/** Creates a task and returns it. */
export function createTask(task: TaskCreate) {
    return apiFetch<Task>("/tasks", { method: "POST", body: JSON.stringify(task) });
}


/** Changes the sent fields of a task and returns it. */
export function updateTask(id: string, changes: TaskUpdate) {
    return apiFetch<Task>(`/tasks/${id}`, { method:"PATCH", body:JSON.stringify(changes)});
}


/** Deletes a task.  */
export function deleteTask(id: string) {
    return apiFetch<void>(`/tasks/${id}`, { method: "DELETE" });
}


/** Marks a task as done and returns it. */
export function markTaskDone(id: string) {
    return apiFetch<Task>(`/tasks/${id}/done`, { method: "POST" })
}


/** Marks a task as not done and returns it. */
export function markTaskUndone(id: string) {
    return apiFetch<Task>(`/tasks/${id}/undone`, { method: "POST" });
}


/** Gets the tasks recommended for the given free minutes */
export function getRecommendation(minutes: number){
    return apiFetch<Task[]>(`/tasks/recommend?minutes=${minutes}`);
}
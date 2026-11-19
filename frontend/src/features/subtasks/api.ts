// The calls to the backend's subtask endpoints, one function per endpoint.
// Everything goes through apiFetch (src/core/api-client.ts), which adds the token.

import { apiFetch } from "@/core/api-client";
import type { Subtask, SubtaskInput } from "./types";

/** Adds a subtask to a task and returns it. */
export function createSubtask(taskId: string, subtask: SubtaskInput) {
    return apiFetch<Subtask>(`/tasks/${taskId}/subtasks`, { method: "POST", body:JSON.stringify(subtask) });
}

/** Renames a subtask and returns it. */
export function updateSubtask(id: string, changes: SubtaskInput) {
    return apiFetch<Subtask>(`/subtasks/${id}`, { method: "PATCH", body:JSON.stringify(changes)});
}

/** Deletes a subtask. */
export function deleteSubtask(id: string){
    return apiFetch<void>(`/subtasks/${id}`, { method: "DELETE" });
}

/** Marks a subtask as done and returns it. */
export function markSubtaskDone(id: string) {
    return apiFetch<Subtask>(`/subtasks/${id}/done`, { method: "POST" });
}

/** Marks a subtask as not done and returns it. */
export function markSubtaskUndone(id: string) {
    return apiFetch<Subtask>(`/subtasks/${id}/undone`, { method: "POST" });
}
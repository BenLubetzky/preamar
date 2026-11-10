// The one API client: every call to the FastAPI backend goes through here.
// It adds the Supabase token to each request and logs the user out if the backend rejects the token (401)

import { supabase } from "@/core/supabase";

/** The backend's address, from .env.local  */
const API_URL = process.env.NEXT_PUBLIC_API_URL!;


/** Calls the backend at 'path' with the user's token and returns the JSON answer. */
export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? {Authorization: `Bearer ${token}`}: {}),
        },
    });

    // The token is bad
    if (response.status === 401){
        await supabase.auth.signOut();
        throw new Error("Logged out");
    }
    if (!response.ok){
        throw new Error(`Request failed: ${response.status}`);
    }
    // In the case of delete (the function promises to return a T)
    if (response.status === 204){
        return undefined as T;
    }
    return response.json()
}

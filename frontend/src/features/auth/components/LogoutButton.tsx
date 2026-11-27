"use client";

// The log-out button: ends the Supabase session through useAuth().
// No redirect is needed here: RequireAuth sees the session is gone and sends the user to /login.

import { useAuth } from "@/core/auth-context";

/** Logs the current user out when clicked. */
export function LogoutButton(){
    const { signOut } = useAuth();
    return (
        <button type="button" onClick={signOut} className="cursor-pointer text-xl text-accent hover:text-ink">
            log out
        </button>
    )
}
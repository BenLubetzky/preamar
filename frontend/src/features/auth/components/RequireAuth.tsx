"use client";

// Guards a page: shows its content only to a logged-in user, otherwise sends them to /login.
// The login state comes from useAuth().

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/core/auth-context";

/** Shows its children only when someone is logged in; otherwise redirects to /login. */
export function RequireAuth({ children }: { children: ReactNode }){
    const { session, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !session){
            router.replace("/login");
        }
    }, [loading, session, router]);

    if (loading || !session) {
        return <p className="p-8">Loading...</p>;
    }
    return <>{children}</>
}
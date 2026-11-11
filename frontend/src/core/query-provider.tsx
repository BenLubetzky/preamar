// The TanStack Query setup: one QueryClient (the cache for all server data) shared by the whole app
// Hooks in src/features/*/hooks.ts read and write this cache
"use client";

import { useState } from "react";
import { QueryClient,  QueryClientProvider } from "@tanstack/react-query";

/** Gives every component below it acccess to the shared query cache. */
export function QueryProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
"use client";

// Owns who is logged in: the current Supabase session, shared with the whole app through useAuth().
// The session comes from Supabase, which saves it in the browser, so it survives a refresh.
// On log out it also empties the TanStack Query cache.

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/core/supabase";
import { useQueryClient } from "@tanstack/react-query";

/** What useAuth() gives every component. */
type AuthValue = {
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

/** Tracks the logged-in session and shares it with everything inside it. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Fires once right away with the saved session, then again on every login, logout and token refresh.
    const { data } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      setLoading(false);
      // Empty the cache so the next user never sees this user's data.
      if (event === "SIGNED_OUT") queryClient.clear();
    });
    return () => data.subscription.unsubscribe();
  }, [queryClient]);

  /** Logs the user out; the listener above then clears the session. */
  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

/** Gives the current session, the loading flag and signOut. */
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
"use client";

// The login form: email and password, checked by Supabase Auth.
// On success Supabase saves the session, AuthProvider hears about it, and we go home.

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/core/supabase";

/** Lets an existing user log in. */
export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  /** Sends the email and password to Supabase, then goes home or shows the error. */
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (loginError) {
      setError(loginError.message);
    } else {
      router.push("/");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        className="rounded border p-2"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        className="rounded border p-2"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit" className="rounded bg-black p-2 text-white">
        Log in
      </button>
      {error && <p className="text-red-600">{error}</p>}
    </form>
  );
}
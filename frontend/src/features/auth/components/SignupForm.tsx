"use client";

// The signup form: username, email and password, sent straight to Supabase Auth.
// The username rides along as extra data; the database trigger copies it into our users table.

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/core/supabase";

/** Lets a new user create an account. */
export function SignupForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  /** Sends the signup to Supabase, then goes home or asks the user to confirm their email. */
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });
    if (signUpError) {
      setError(signUpError.message);
    } else if (data.session) {
      router.push("/");
    } else {
      setMessage("Check your email to confirm your account.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        className="rounded border p-2"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
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
        Sign up
      </button>
      {error && <p className="text-red-600">{error}</p>}
      {message && <p>{message}</p>}
    </form>
  );
}
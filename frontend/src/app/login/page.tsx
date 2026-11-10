// The "/login" route: shows the login form.
// It only places the form on the page; the form talks to Supabase itself

import { LoginForm } from "@/features/auth/components/LoginForm";

/** Shows the login page */
export default function LoginPage() {
    return (
        <main className="mx-auto max-w-sm p-8">
            <h1 className="mb-4 text-2xl font-semibold">Log in</h1>
            <LoginForm />
        </main>
    );
}
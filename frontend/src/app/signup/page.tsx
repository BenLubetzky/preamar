// The "/signup" route: shows the signup form.
// It only places the form on the page; the form talks to Supabase itself.

import { SignupForm } from "@/features/auth/components/SignupForm";

/** Shows the signup page. */
export default function SignupPage(){
    return (
        <main className="mx-auto max-w-sm p-8">
            <h1 className="mb-4 text-2xl font-semibold">Sign up</h1>
            <SignupForm/>
        </main>
    )
}
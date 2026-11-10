// The "/" route: the main page, where the task list and free time will go.
// It only arranges feature components on the page; it fetches no data itself.

import { RequireAuth } from "@/features/auth/components/RequireAuth";

/** Shows the home page. */
export default function Home() {
  return (
    <RequireAuth>
      <main className="mx-auto max-w-2xl p-8">
        <h1 className="text-2xl font-semibold">Preamar</h1>
      </main>
    </RequireAuth>
  );
}
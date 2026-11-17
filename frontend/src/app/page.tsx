// The "/" route: the main page. ForestBackground as the background with HomeLayout on top, containing the 
// recommend window (left), task list (center) and add task form (right).
// It only arranges feature components on the page; it fetches no data itself.

import { RequireAuth } from "@/features/auth/components/RequireAuth";
import { HomeLayout } from "@/features/tasks/components/HomeLayout";
import { ForestBackground } from "@/features/scene/components/ForestBackground";

/** Shows the home page. */
export default function Home() {
  return (
    <RequireAuth>
      <ForestBackground />
      <HomeLayout />
    </RequireAuth>
  );
}
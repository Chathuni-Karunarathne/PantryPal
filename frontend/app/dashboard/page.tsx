import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACCESS_COOKIE, REFRESH_COOKIE, currentUser } from "@/lib/auth/server";
import { BackendError } from "@/lib/api/server";
import { DashboardCheckpoint } from "@/components/auth/dashboard-checkpoint";

export const metadata: Metadata = { title: "Workspace | PantryPal" };

export default async function DashboardPage() {
  const store = await cookies();
  const access = store.get(ACCESS_COOKIE)?.value;
  const refresh = store.get(REFRESH_COOKIE)?.value;
  if (!access && !refresh) redirect("/login");
  if (access) {
    try { await currentUser(access); }
    catch (error) {
      if (error instanceof BackendError && error.status === 401 && !refresh) redirect("/login");
      // Route handlers restore expired tokens and write cookies. During this step,
      // the checkpoint renders only its resolving UI, never protected user data.
    }
  }
  return <DashboardCheckpoint />;
}

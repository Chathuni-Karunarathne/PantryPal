"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-provider";
import { PantryPalLogo } from "@/components/brand/pantrypal-logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { AuthError } from "@/lib/auth/types";

// Temporary authentication checkpoint; replace its content during dashboard work.
export function DashboardCheckpoint() {
  const auth = useAuth();
  const router = useRouter();
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (auth.status === "anonymous") router.replace("/login");
  }, [auth.status, router]);

  async function logout() {
    setMessage("");
    try {
      await auth.logout();
      router.replace("/login");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof AuthError ? error.message : "We couldn't sign you out. Please try again.");
    }
  }

  return (
    <main className="mx-auto w-full max-w-2xl p-6 sm:p-12">
      <header className="mb-10 flex items-center justify-between"><PantryPalLogo /><ThemeToggle /></header>
      {auth.status === "error" ? (
        <div role="status"><p className="mb-4">{auth.message}</p><Button onClick={() => void auth.restore()}>Try again</Button></div>
      ) : auth.user && (auth.status === "authenticated" || auth.status === "logging-out") ? (
        <section className="rounded-xl border border-border bg-card p-6" aria-busy={auth.status === "logging-out"}>
          <h1 className="mb-4 text-2xl font-semibold">Welcome, {auth.user.name}</h1>
          <p className="mb-2">{auth.user.email}</p>
          <p className="mb-6">Role: {auth.user.role}</p>
          <Button onClick={() => void logout()} disabled={auth.status === "logging-out"}>{auth.status === "logging-out" ? "Signing out…" : "Logout"}</Button>
          {message && <p className="mt-4 text-destructive" role="status">{message}</p>}
        </section>
      ) : <p role="status">Checking your session…</p>}
    </main>
  );
}

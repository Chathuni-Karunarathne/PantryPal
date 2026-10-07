"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { authClient } from "@/lib/auth/client";
import { AuthError, type AuthUser, type LoginCredentials } from "@/lib/auth/types";

type Status = "resolving" | "authenticated" | "anonymous" | "error" | "logging-out";
type AuthState = { status: Status; user: AuthUser | null; message: string };
type AuthContextValue = AuthState & {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  restore: () => Promise<void>;
};
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "resolving", user: null, message: "" });
  const version = useRef(0);
  const mutation = useRef(false);
  const restore = useCallback(async () => {
    if (mutation.current) return;
    const attempt = ++version.current;
    try {
      const session = await authClient.session();
      if (attempt !== version.current) return;
      setState({
        status: session.user ? "authenticated" : "anonymous",
        user: session.user,
        message: session.expired ? "Your session has expired. Please sign in again." : "",
      });
    } catch (error) {
      if (attempt !== version.current) return;
      // A temporary outage is not a revoked session. Keep cookies for a retry.
      setState({ status: "error", user: null, message: error instanceof AuthError ? error.message : "Please try again." });
    }
  }, []);

  useEffect(() => {
    const generation = version;
    // State changes in restore happen after the network response, never synchronously.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void restore();
    const focus = () => { if (document.visibilityState === "visible") void restore(); };
    window.addEventListener("focus", focus);
    document.addEventListener("visibilitychange", focus);
    const timer = window.setInterval(focus, 60_000);
    return () => {
      ++generation.current;
      window.clearInterval(timer);
      window.removeEventListener("focus", focus);
      document.removeEventListener("visibilitychange", focus);
    };
  }, [restore]);

  async function login(credentials: LoginCredentials) {
    if (mutation.current) return;
    mutation.current = true;
    ++version.current;
    try {
      const session = await authClient.login(credentials);
      if (!session.user) throw new AuthError("We couldn't sign you in. Please try again.");
      setState({ status: "authenticated", user: session.user, message: "" });
    } finally { mutation.current = false; }
  }

  async function logout() {
    if (mutation.current) return;
    mutation.current = true;
    ++version.current;
    setState((current) => ({ ...current, status: "logging-out", message: "" }));
    try {
      await authClient.logout();
      setState({ status: "anonymous", user: null, message: "" });
    } catch (error) {
      setState((current) => ({ ...current, status: "authenticated" }));
      throw error;
    } finally { mutation.current = false; }
  }

  return <AuthContext.Provider value={{ ...state, login, logout, restore }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error("useAuth requires AuthProvider");
  return auth;
}

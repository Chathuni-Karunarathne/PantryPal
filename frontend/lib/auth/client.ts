import { apiRequest } from "@/lib/api/client";
import type { LoginCredentials, SessionResponse } from "./types";

let resolving: Promise<SessionResponse> | null = null;

export const authClient = {
  login: (credentials: LoginCredentials) => apiRequest<SessionResponse>("login", credentials),
  // StrictMode and concurrent consumers share one session/refresh request.
  session: () => {
    resolving ??= apiRequest<SessionResponse>("session").finally(() => { resolving = null; });
    return resolving;
  },
  logout: () => apiRequest<{ ok: boolean }>("logout"),
};

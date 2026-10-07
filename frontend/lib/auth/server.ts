import "server-only";
import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import { BackendError, backendRequest } from "@/lib/api/server";
import type { AuthUser } from "./types";

export const ACCESS_COOKIE = "pantrypal-access";
export const REFRESH_COOKIE = "pantrypal-refresh";
type Tokens = {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  refreshExpiresAt: string;
};
type CookieStore = Awaited<ReturnType<typeof cookies>>;

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.AUTH_COOKIE_SECURE === "true" ||
    (process.env.AUTH_COOKIE_SECURE !== "false" && process.env.NODE_ENV === "production"),
  sameSite: "strict" as const,
  path: "/",
});

export function clearSession(store: CookieStore) {
  for (const name of [ACCESS_COOKIE, REFRESH_COOKIE]) {
    store.set(name, "", { ...cookieOptions(), maxAge: 0 });
  }
}

export function saveSession(store: CookieStore, tokens: Tokens) {
  if (!tokens.accessToken || !tokens.refreshToken || !Number.isFinite(Date.parse(tokens.refreshExpiresAt))) {
    throw new BackendError(502);
  }
  // Session cookies: refresh restores across reloads, without defining Remember Me.
  store.set(ACCESS_COOKIE, tokens.accessToken, cookieOptions());
  store.set(REFRESH_COOKIE, tokens.refreshToken, cookieOptions());
}

const shared = globalThis as typeof globalThis & { pantryRefreshes?: Map<string, Promise<Tokens>> };
const refreshes = shared.pantryRefreshes ??= new Map<string, Promise<Tokens>>();

function refreshToken(token: string) {
  const key = createHash("sha256").update(token).digest("hex");
  const existing = refreshes.get(key);
  if (existing) return existing;
  if (refreshes.size >= 1000) throw new BackendError(503);
  const promise = backendRequest<Tokens>("refresh", { body: { refreshToken: token } });
  refreshes.set(key, promise);
  // A short grace window lets parallel tabs receive the same rotated credentials.
  void promise.then(() => {
    setTimeout(() => refreshes.delete(key), 5_000).unref();
  }, () => { refreshes.delete(key); });
  return promise;
}

export async function currentUser(token: string): Promise<AuthUser> {
  const user = await backendRequest<AuthUser>("me", { token });
  if (!user?.id || !user.name || !user.email || user.enabled !== true ||
      !["OWNER_ADMIN", "MANAGER", "ORDER_STAFF", "INVENTORY_STAFF"].includes(user.role)) {
    throw new BackendError(502);
  }
  // Allowlist the actual profile fields; never forward an arbitrary API payload.
  return { id: user.id, name: user.name, email: user.email, role: user.role, enabled: user.enabled };
}

export async function resolveSession(store: CookieStore) {
  let access = store.get(ACCESS_COOKIE)?.value;
  if (access) {
    try { return { token: access, user: await currentUser(access) }; }
    catch (error) {
      if (!(error instanceof BackendError) || error.status !== 401) throw error;
    }
  }
  const refresh = store.get(REFRESH_COOKIE)?.value;
  if (!refresh) throw new BackendError(401);
  if (!/^[A-Za-z0-9_-]{43}$/.test(refresh)) throw new BackendError(401);
  const tokens = await refreshToken(refresh);
  access = tokens.accessToken;
  // Persist rotation even if the subsequent profile request has a temporary outage.
  saveSession(store, tokens);
  const user = await currentUser(access);
  return { token: access, user };
}

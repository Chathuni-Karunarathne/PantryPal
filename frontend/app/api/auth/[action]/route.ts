import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { BackendError, backendRequest } from "@/lib/api/server";
import { ACCESS_COOKIE, REFRESH_COOKIE, clearSession, currentUser, resolveSession, saveSession } from "@/lib/auth/server";

export const runtime = "nodejs";
const unavailable = "We couldn't reach PantryPal right now. Please try again.";

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request, context: RouteContext<"/api/auth/[action]">) {
  const { action } = await context.params;
  if (!["login", "session", "logout"].includes(action)) return json({ message: "Not found." }, 404);
  // Cookies introduce CSRF at this boundary. Require an explicit same-origin POST.
  const origin = process.env.APP_ORIGIN ?? new URL(request.url).origin;
  if (request.headers.get("origin") !== origin || request.headers.get("sec-fetch-site") === "cross-site") {
    return json({ message: "This request could not be verified. Reload the page and try again." }, 403);
  }
  const store = await cookies();
  const hadSession = Boolean(store.get(ACCESS_COOKIE)?.value || store.get(REFRESH_COOKIE)?.value);
  try {
    if (action === "login") {
      if (!request.headers.get("content-type")?.startsWith("application/json")) throw new BackendError(400);
      const body = await request.json().catch(() => { throw new BackendError(400); });
      if (typeof body?.email !== "string" || typeof body?.password !== "string") throw new BackendError(400);
      const tokens = await backendRequest<Parameters<typeof saveSession>[1]>("login", {
        body: { email: body.email.trim(), password: body.password },
      });
      const user = await currentUser(tokens.accessToken);
      saveSession(store, tokens);
      return json({ user });
    }
    if (!hadSession) {
      clearSession(store);
      return json(action === "logout" ? { ok: true } : { user: null });
    }
    const session = await resolveSession(store);
    if (action === "logout") {
      await backendRequest("logout", { token: session.token, body: {} });
      clearSession(store);
      return json({ ok: true });
    }
    return json({ user: session.user });
  } catch (error) {
    const status = error instanceof BackendError ? error.status : 503;
    if (status === 401 && action !== "login") {
      clearSession(store);
      return json(action === "logout" ? { ok: true } : { user: null, expired: true });
    }
    if (status === 401) return json({ message: "Email or password is incorrect." }, 401);
    if (status === 400) {
      const fieldErrors: Record<string, string> = {};
      if (error instanceof BackendError) {
        for (const field of error.fields) {
          if (field === "email") fieldErrors.email = "Enter a valid email address (up to 254 characters).";
          if (field === "password") fieldErrors.password = "Enter a password of up to 128 characters.";
        }
      }
      return json({ message: "Check your sign-in details and try again.", fieldErrors }, 400);
    }
    if (status === 403) return json({ message: "You don't have permission to access this workspace." }, 403);
    return json({ message: unavailable }, 503);
  }
}

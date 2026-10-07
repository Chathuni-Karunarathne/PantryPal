import { AuthError } from "@/lib/auth/types";

// Browser requests stay on the frontend origin. Credentials never enter JS.
export async function apiRequest<T>(path: string, body?: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api/auth/${path}`, {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body ?? {}),
      signal: AbortSignal.timeout(35_000),
    });
  } catch {
    throw new AuthError("We couldn't reach PantryPal right now. Please try again.");
  }
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new AuthError(
      data?.message ?? "We couldn't reach PantryPal right now. Please try again.",
      data?.fieldErrors,
    );
  }
  return data as T;
}

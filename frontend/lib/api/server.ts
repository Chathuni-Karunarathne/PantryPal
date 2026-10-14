import "server-only";

export class BackendError extends Error {
  constructor(public readonly status: number, public readonly fields: string[] = [], public readonly code = "REQUEST_FAILED") {
    super("Backend request failed");
  }
}

export async function backendRequest<T>(path: string, options: { body?: unknown; token?: string } = {}): Promise<T> {
  return backendApiRequest<T>(`auth/${path}`, options);
}

export async function backendApiRequest<T>(path: string, options: { body?: unknown; token?: string; method?: string } = {}): Promise<T> {
  const base = process.env.API_URL;
  if (!base) throw new BackendError(503);
  let response: Response;
  try {
    response = await fetch(`${base.replace(/\/$/, "")}/api/${path}`, {
      method: options.method ?? (options.body === undefined ? "GET" : "POST"),
      headers: {
        "Content-Type": "application/json",
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
      redirect: "error",
    });
  } catch {
    throw new BackendError(503);
  }
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new BackendError(response.status, Object.keys(error?.fieldErrors ?? {}), typeof error?.code === "string" ? error.code : "REQUEST_FAILED");
  }
  if (response.status === 204) return undefined as T;
  try { return await response.json() as T; }
  catch { throw new BackendError(502); }
}

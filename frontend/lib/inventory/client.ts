export class InventoryError extends Error {
  constructor(message: string, public readonly status: number, public readonly fieldErrors: Record<string, string> = {}) {
    super(message); this.name = "InventoryError";
  }
}

export async function inventoryRequest<T>(path: string, options: { method?: string; body?: unknown; signal?: AbortSignal } = {}): Promise<T> {
  const method = options.method ?? "GET";
  let response: Response;
  try {
    response = await fetch(`/api/inventory/${path}`, {
      method, credentials: "same-origin", cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: options.signal ? AbortSignal.any([options.signal, AbortSignal.timeout(35_000)]) : AbortSignal.timeout(35_000),
    });
  } catch (error) {
    if (options.signal?.aborted) throw error;
    throw new InventoryError(method === "GET" ? "We couldn't load inventory. Please try again."
      : "We couldn't confirm the change. Refresh inventory before trying again.", 503);
  }
  if (response.status === 204) return undefined as T;
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new InventoryError(data?.message ?? "The inventory request failed.", response.status, data?.fieldErrors);
  if (!data) throw new InventoryError("We couldn't read the inventory response. Refresh inventory.", 502);
  return data as T;
}

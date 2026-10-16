export class ProductError extends Error {
  constructor(message: string, public readonly status: number, public readonly fieldErrors: Record<string, string> = {}, public readonly code = "REQUEST_FAILED") {
    super(message); this.name = "ProductError";
  }
}

export async function productRequest<T>(path = "", options: { method?: string; body?: unknown; signal?: AbortSignal } = {}): Promise<T> {
  const method = options.method ?? "GET";
  let response: Response;
  try {
    response = await fetch(`/api/products${path.startsWith("?") ? path : path ? `/${path}` : ""}`, {
      method, credentials: "same-origin", cache: "no-store", headers: { "Content-Type": "application/json" },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: options.signal ? AbortSignal.any([options.signal, AbortSignal.timeout(35_000)]) : AbortSignal.timeout(35_000),
    });
  } catch (error) {
    if (options.signal?.aborted) throw error;
    throw new ProductError(method === "GET" ? "We couldn't load your products. Please try again."
      : "We couldn't confirm the change. Refresh products before trying again.", 503);
  }
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new ProductError(data?.message ?? "The product request failed.", response.status, data?.fieldErrors, data?.code);
  if (!data) throw new ProductError("We couldn't read the response. Refresh products.", 502);
  return data as T;
}

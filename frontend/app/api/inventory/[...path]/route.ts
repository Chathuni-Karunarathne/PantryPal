import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { BackendError, backendApiRequest } from "@/lib/api/server";
import { clearSession, resolveSession } from "@/lib/auth/server";

export const runtime = "nodejs";
const messages: Record<string, string> = {
  INCOMPATIBLE_UNIT: "Choose a compatible measurement unit.",
  INVALID_QUANTITY: "Use a quantity with up to six decimal places in the stock unit.",
  INVALID_FILTER: "Check your search and filter values.",
  INVALID_PARAMETER: "Check the ingredient ID and filter values.",
  INGREDIENT_NOT_FOUND: "This ingredient could not be found. Refresh the inventory.",
  UNIT_FIXED: "The stock unit cannot be changed after ingredient creation.",
  STOCK_REMAINING: "Adjust remaining stock to zero before deleting this ingredient.",
  INSUFFICIENT_STOCK: "This adjustment would make stock negative. Reduce the quantity removed.",
  QUANTITY_TOO_LARGE: "The resulting stock quantity is too large.",
  ZERO_ADJUSTMENT: "Enter a non-zero stock quantity.",
  INVALID_EXPIRY: "An expiry date requires an opening stock quantity.",
  DATA_CONFLICT: "An ingredient with this name may already exist, or the change conflicts with existing data.",
  CONCURRENT_CHANGE: "Stock is being updated. Refresh and try again.",
};
const validation: Record<string, string> = {
  name: "Enter an ingredient name (up to 120 characters).",
  category: "Choose a category.", unit: "Choose a measurement unit.", storageLocation: "Choose a storage location.",
  minimumStock: "Enter a non-negative threshold with up to six decimal places.",
  initialQuantity: "Enter a non-negative quantity with up to six decimal places.",
  quantity: "Enter a positive quantity with up to six decimal places.",
  quantityDelta: "Enter a non-zero quantity with up to six decimal places.",
  expiryDate: "Choose today or a future expiry date.", reason: "Enter a reason (up to 500 characters).",
};
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

async function handle(request: Request, context: RouteContext<"/api/inventory/[...path]">) {
  const { path } = await context.params;
  const route = path.join("/");
  const item = /^ingredients\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const movement = /^ingredients\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/(intake|adjustments)$/i;
  const allowed = request.method === "GET" ? ["options", "overview", "ingredients"].includes(route) || item.test(route)
    : request.method === "POST" ? route === "ingredients" || movement.test(route) : item.test(route);
  if (!allowed) return json({ message: "Not found." }, 404);
  if (request.headers.get("sec-fetch-site") === "cross-site" || (request.method !== "GET" &&
      request.headers.get("origin") !== (process.env.APP_ORIGIN ?? new URL(request.url).origin))) {
    return json({ message: "This request could not be verified. Reload the page and try again." }, 403);
  }
  const store = await cookies();
  try {
    const session = await resolveSession(store);
    if (session.user.role === "ORDER_STAFF" || (request.method === "DELETE" && session.user.role === "INVENTORY_STAFF")) {
      return json({ message: "You don't have permission to perform this inventory operation." }, 403);
    }
    let body: unknown;
    if (["POST", "PUT"].includes(request.method)) {
      if (!request.headers.get("content-type")?.startsWith("application/json")) throw new BackendError(400);
      body = await request.json().catch(() => { throw new BackendError(400); });
    }
    const query = new URLSearchParams();
    if (route === "ingredients" && request.method === "GET") {
      const incoming = new URL(request.url).searchParams;
      for (const key of ["search", "category", "storageLocation", "lowStock", "page", "size"]) {
        const value = incoming.get(key);
        if (value !== null) query.set(key, value);
      }
    }
    const result = await backendApiRequest(`inventory/${route}${query.size ? `?${query}` : ""}`, {
      token: session.token, method: request.method, body,
    });
    return request.method === "DELETE" ? new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } })
      : json(result, request.method === "POST" && route === "ingredients" ? 201 : 200);
  } catch (error) {
    const status = error instanceof BackendError ? error.status : 503;
    if (status === 401) { clearSession(store); return json({ message: "Your session has expired. Please sign in again." }, 401); }
    if (status === 403) return json({ message: "You don't have permission to perform this inventory operation." }, 403);
    const fieldErrors: Record<string, string> = {};
    if (error instanceof BackendError) {
      for (const key of error.fields) {
        const field = key.replace(/^ingredient\./, "");
        if (validation[field]) fieldErrors[field] = validation[field];
      }
    }
    const message = error instanceof BackendError && messages[error.code] ? messages[error.code]
      : status === 400 ? "Check the submitted fields."
      : request.method === "GET" ? "We couldn't load inventory. Please try again."
      : "We couldn't confirm the change. Refresh inventory before trying again.";
    return json({ message, fieldErrors }, [400, 404, 409].includes(status) ? status : 503);
  }
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const DELETE = handle;

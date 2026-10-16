import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { BackendError, backendApiRequest } from "@/lib/api/server";
import { clearSession, resolveSession } from "@/lib/auth/server";

export const runtime = "nodejs";
const uuid = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";
const item = new RegExp(`^${uuid}$`, "i");
const recipe = new RegExp(`^${uuid}/recipe$`, "i");
const editable = new RegExp(`^(${uuid}(/availability|/recipe)?|categories/${uuid})$`, "i");
const messages: Record<string, string> = {
  PRODUCT_NOT_FOUND: "This product could not be found. Refresh products.",
  RECIPE_NOT_FOUND: "This product does not have a recipe yet.",
  INVALID_CATEGORY: "Choose an existing product category.",
  DUPLICATE_CATEGORY: "A category with this name already exists.",
  DUPLICATE_INGREDIENT: "Use each ingredient once. Adjust its quantity instead of adding another row.",
  INVALID_INGREDIENT: "An ingredient is missing or archived. Remove it or select an active inventory ingredient.",
  INCOMPATIBLE_UNIT: "Choose a unit compatible with the ingredient's stock unit.",
  INVALID_QUANTITY: "Use a positive quantity that fits the stock unit with up to six decimal places.",
  INVALID_FILTER: "Check your search and filter values.",
  INVALID_PARAMETER: "Check the product ID and filter values.",
  DATA_CONFLICT: "This change conflicts with existing data. Category names must be unique.",
  CONCURRENT_CHANGE: "This record is being updated. Refresh and try again.",
};
const validation: Record<string, string> = {
  name: "Enter a name (up to 120 characters).", description: "Use up to 2,000 characters.",
  categoryId: "Choose a category.", sellingPrice: "Enter a non-negative price with up to two decimal places.",
  active: "Choose an availability status.", yieldQuantity: "Enter a positive yield with up to six decimal places.",
  yieldDescription: "Describe the products this recipe produces (up to 120 characters).",
  ingredients: "Add between 1 and 200 ingredients with positive quantities and compatible units.",
  ingredientId: "Choose an inventory ingredient.", quantity: "Enter a positive quantity with up to six decimal places.",
  unit: "Choose a compatible unit.",
};
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

async function handle(request: Request, context: RouteContext<"/api/products/[[...path]]">) {
  const { path } = await context.params;
  const route = (path ?? []).join("/");
  const allowed = request.method === "GET" ? ["", "overview", "categories"].includes(route) || item.test(route) || recipe.test(route)
    : request.method === "POST" ? ["", "categories"].includes(route) : request.method === "PUT" && editable.test(route);
  if (!allowed) return json({ message: "Not found." }, 404);
  if (request.headers.get("sec-fetch-site") === "cross-site" || (request.method !== "GET" &&
      request.headers.get("origin") !== (process.env.APP_ORIGIN ?? new URL(request.url).origin))) {
    return json({ message: "This request could not be verified. Reload the page and try again." }, 403);
  }
  const store = await cookies();
  try {
    const session = await resolveSession(store);
    const canManage = ["OWNER_ADMIN", "MANAGER"].includes(session.user.role);
    if (!canManage && (request.method !== "GET" || recipe.test(route))) {
      return json({ message: "Only owners and managers can manage products and recipes." }, 403);
    }
    let body: unknown;
    if (request.method !== "GET") {
      if (!request.headers.get("content-type")?.startsWith("application/json")) throw new BackendError(400);
      body = await request.json().catch(() => { throw new BackendError(400); });
    }
    const query = new URLSearchParams();
    if (!route && request.method === "GET") {
      const incoming = new URL(request.url).searchParams;
      for (const key of ["search", "categoryId", "active", "page", "size"]) {
        const value = incoming.get(key);
        if (value !== null) query.set(key, value);
      }
    }
    const result = await backendApiRequest(`products${route ? `/${route}` : ""}${query.size ? `?${query}` : ""}`, {
      token: session.token, method: request.method, body,
    });
    return json(result, request.method === "POST" ? 201 : 200);
  } catch (error) {
    const status = error instanceof BackendError ? error.status : 503;
    if (status === 401) { clearSession(store); return json({ message: "Your session has expired. Please sign in again." }, 401); }
    if (status === 403) return json({ message: "You don't have permission to perform this operation." }, 403);
    const fieldErrors: Record<string, string> = {};
    if (error instanceof BackendError) {
      for (const field of error.fields) {
        const key = field.split(".").at(-1) ?? field;
        fieldErrors[field] = validation[key] ?? validation.ingredients;
      }
    }
    const message = error instanceof BackendError && messages[error.code] ? messages[error.code]
      : status === 400 ? "Check the submitted fields."
      : request.method === "GET" ? "We couldn't load products and recipes. Please try again."
      : "We couldn't confirm the change. Refresh products before trying again.";
    return json({ message, fieldErrors, code: error instanceof BackendError ? error.code : "REQUEST_FAILED" },
      [400, 404, 409].includes(status) ? status : 503);
  }
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;

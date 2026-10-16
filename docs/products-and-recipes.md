# Product and recipe management (EPIC-03)

The `/products` workspace connects the real product catalogue to inventory ingredients. It follows the inventory interface's semantic theme tokens and reuses its buttons, inputs, selects, field layout, dialogs, logo, theme switcher, and authentication provider. Desktop and mobile navigation link Inventory, Products & Recipes, and the workspace.

## Permissions and integration

All four authenticated roles can browse, search, and filter product metadata. Only `OWNER_ADMIN` and `MANAGER` can create/edit categories and products, change availability, or view/edit recipes. Both Spring Security HTTP rules and controller annotations enforce these restrictions. Order staff cannot access the inventory ingredient picker. The Next.js proxy independently checks the authoritative user role.

The existing HttpOnly access/refresh cookies, session refresh, API URL configuration, and same-origin communication are reused. Tokens never enter browser JavaScript. Mutations require the expected `Origin` header; cross-site requests are rejected. API responses use `Cache-Control: no-store`. Validation errors, session expiry, service outages, loading, empty results, and retries are handled in the interface. Successful mutations reload the catalogue and overview.

## Database

`V3__products_and_recipes.sql` follows the existing V1 authentication and V2 inventory migrations. It adds:

- `product_categories`: UUID, required name, creation/update timestamps, case-insensitive unique name index. Five editable starting categories: Cakes & Pastries, Beverages, Desserts, Main Dishes, and Snacks.
- `products`: UUID, required name/category, optional description, selling price `NUMERIC(12,2)`, active flag, timestamps, category/status and name indexes.
- `recipes`: UUID, unique product foreign key, positive yield `NUMERIC(19,6)`, required yield description, timestamps.
- `recipe_ingredients`: UUID, recipe and existing inventory ingredient foreign keys, positive quantity `NUMERIC(19,6)`, measurement unit, unique `(recipe_id, ingredient_id)`, ingredient reference index.

Foreign keys retain related records, and check constraints reject blank names, invalid units, non-positive recipe quantities/yields, and negative prices. Products have no physical-delete endpoint; deactivation retains their recipes and IDs. No existing inventory/authentication tables or records are changed by V3. Hibernate remains configured with `ddl-auto=validate`.

Each product has at most one recipe. Each recipe has 1–200 unique active inventory ingredients when saved. Existing recipes can still display ingredients subsequently archived through Inventory; those rows must be replaced or removed before saving changes. Ingredient archiving retains its original row and foreign-key references.

## Units, yield, and future orders

Recipe rows preserve the chosen quantity and compatible unit. Inventory's existing `MeasurementUnit.convert` performs exact g/kg and ml/L conversion, or pcs to pcs. Incompatible dimensions and conversions requiring more than six fractional digits in the stock unit are rejected. API responses include both the chosen unit/quantity and `stockUnit`/`stockQuantity` normalized to the ingredient's fixed inventory unit. Decimal values are strings in responses to preserve precision.

Yield is the number of the product's sellable units produced by the complete stored recipe, with a human-readable description. For example, yield `2` and description `1 kg cakes` means the listed ingredients make two cakes of the size sold. Future orders should calculate:

`required stock quantity = row.stockQuantity × ordered product quantity / recipe.yieldQuantity`

Product metadata updates do not change recipes. Recipe replacement is transactional, locks the product, validates all ingredients before changing any lines, and locks ingredients in deterministic ID order to serialize with inventory archiving. Existing ingredient rows are updated in place, removed rows are deleted only from the recipe, and new rows are inserted. Recipe creation/editing never changes ingredient balances, stock batches, or inventory movements. Orders, stock availability checks for orders, deductions, and historical consumption snapshots remain for EPIC-04.

## REST API

Next.js exposes the same paths on the frontend origin, forwarding bearer credentials server-side.

| Method | Spring Boot path | Purpose |
| --- | --- | --- |
| GET | `/api/products` | Paginated catalogue |
| POST | `/api/products` | Create a product (`201`) |
| GET | `/api/products/{id}` | Product details |
| PUT | `/api/products/{id}` | Update metadata, price, category, and active flag |
| PUT | `/api/products/{id}/availability` | Activate/deactivate without deleting |
| GET | `/api/products/overview` | Total products, active products, recipe counts |
| GET | `/api/products/categories` | Configurable categories |
| POST | `/api/products/categories` | Create category (`201`) |
| PUT | `/api/products/categories/{id}` | Rename category |
| GET | `/api/products/{id}/recipe` | Complete recipe; `404 RECIPE_NOT_FOUND` if not created |
| PUT | `/api/products/{id}/recipe` | Transactionally create or replace the recipe |

Catalogue query parameters: `search` (literal name substring, maximum 120 characters), `categoryId` (UUID), `active` (`true`/`false`), `page` (zero-based), `size` (1–100, default 25). Results are ordered by product name and ID and return `items`, `page`, `size`, `totalElements`, `totalPages`.

Product create/update body:

```json
{
  "name": "Butter Cake (1 kg)",
  "description": "Classic butter cake",
  "categoryId": "<existing-category-uuid>",
  "sellingPrice": "1250.50",
  "active": true
}
```

Availability body: `{"active":false}`. Category create/rename body: `{"name":"Signature bakes"}`.

Recipe create/replace body (all ingredient quantities describe the complete yield):

```json
{
  "yieldQuantity": "2",
  "yieldDescription": "1 kg cakes",
  "ingredients": [
    {"ingredientId":"<existing-inventory-ingredient-uuid>","quantity":"500","unit":"G"}
  ]
}
```

Errors use the existing `ApiError` envelope. Invalid bodies, references, duplicate ingredients, or units return `400`; missing products/recipes return `404`; duplicate category names and concurrent changes return `409`; anonymous access returns `401` and disallowed roles return `403`. Product names need not be unique. Prices support zero and up to two fractional digits; currency is not configured by the current requirements, so no currency is assumed in the interface.

## Files

New backend module under `backend/src/main/java/com/pantrypal/backend/product/`:

- `entity/`: `ProductCategory.java`, `Product.java`, `Recipe.java`, `RecipeIngredient.java`.
- `repository/`: `ProductCategoryRepository.java`, `ProductRepository.java`, `RecipeRepository.java`.
- `dto/`: `CategoryRequest.java`, `AvailabilityRequest.java`, `ProductRequest.java`, `ProductResponse.java`, `RecipeRequest.java`, `RecipeResponse.java`.
- `service/`: `ProductService.java`, `ProductException.java`.
- `controller/ProductController.java`.

Other new files:

- `backend/src/main/resources/db/migration/V3__products_and_recipes.sql`.
- `backend/src/test/java/com/pantrypal/backend/product/ProductSmokeTests.java`.
- `frontend/app/products/page.tsx`.
- `frontend/app/api/products/[[...path]]/route.ts`.
- `frontend/lib/products/client.ts`, `types.ts`.
- `frontend/components/products/products-workspace.tsx`, `product-dialog.tsx`, `category-dialog.tsx`, `recipe-dialog.tsx`.
- `frontend/tests/products.spec.ts`.
- This document.

Modified existing files:

- `backend/.../common/exception/ApiExceptionHandler.java`: product errors and resource-neutral shared messages.
- `backend/.../security/config/SecurityConfiguration.java`: product/recipe HTTP authorization.
- `backend/.../inventory/entity/Ingredient.java`: read-only archived-state accessor.
- `frontend/components/inventory/inventory-workspace.tsx`: desktop/mobile product navigation.
- `frontend/components/auth/dashboard-checkpoint.tsx`: product workspace link.

## Essential checks

Backend compilation: `mvn -DskipTests compile`. Frontend production build: `npm run build`; lint: `npm run lint`.

`ProductSmokeTests` is opt-in with `PANTRYPAL_PRODUCT_SMOKE=true` and requires `DB_URL=jdbc:postgresql://127.0.0.1:<port>/pantrypal_products_smoke`, with local `DB_USERNAME`/`DB_PASSWORD`. It refuses other database URLs. Run `mvn -Dtest=ProductSmokeTests,AuthenticationSecurityTests test`. Flyway and Hibernate validation run during startup; test records roll back. It covers products/categories, recipe creation and editing, valid ingredient references, unit normalization, invalid inputs, retained recipes on metadata updates, deactivation, unchanged stock/batches/movements, and anonymous/staff permissions.

The live Playwright check requires `PANTRYPAL_LIVE_PRODUCTS=true`, `PANTRYPAL_LIVE_AUTH=true`, `PANTRYPAL_TEST_EMAIL`, `PANTRYPAL_TEST_PASSWORD`, and `API_URL=http://127.0.0.1:<port>` pointing at an explicitly disposable backend with a temporary manager/owner account. Run `npm run test:e2e -- tests/products.spec.ts`. It exercises the real API through the UI on desktop and mobile, including recipe-editor accessibility and overflow checks. Screenshots and traces are disabled for credential-bearing checks. Browser test records must be discarded with the disposable database afterward.

No deployment, Neon migration, commit, push, merge, or branch change is part of this implementation.

## Verification on 16 October 2026

- Backend rebuilt successfully from fresh class output with Java 21.
- Frontend production build and ESLint passed. The build required network access for the existing Google Fonts configuration.
- Flyway applied V1, V2, and V3 successfully to isolated PostgreSQL 18 databases; Hibernate schema validation passed.
- All 3 product smoke tests, 26 existing authentication/security tests, and 2 existing inventory smoke tests passed.
- Both live Playwright product/recipe checks passed (desktop and mobile). They covered category creation, product creation/listing/search/filtering, recipe creation/editing/reopening after reload, metadata edits retaining recipes, deactivation/status filtering, unchanged stock, cross-origin rejection, no browser errors, recipe-editor WCAG A/AA checks, and viewport overflow.

Initial product test runs exposed relationship-query and transient-entity persistence errors; both were fixed before the successful runs. The first browser run exceeded the default five-second login assertion during local startup; both browsers passed on the rerun, and the test now allows 20 seconds for login navigation.

Backend smoke records rolled back. Both disposable databases and the temporary database cluster, credentials, logs, and service processes were removed after the browser checks. Live Neon migration and deployed-environment checks were not performed. Comprehensive/concurrent-load testing remains deferred, as requested. The ingredient picker loads active inventory in pages of 100; a remote searchable picker can be added if inventory grows substantially.

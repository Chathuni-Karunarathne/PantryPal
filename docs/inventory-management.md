# Core inventory management

The inventory workspace is available at `/inventory`, with a link from the authenticated dashboard. It uses the existing authentication provider, HttpOnly session cookies, same-origin Next.js API proxy, and light/dark theme. All inventory comes from Spring Boot; there is no seeded or mock ingredient data.

## Permissions

| Operation | Owner/Admin | Manager | Inventory Staff | Order Staff |
| --- | --- | --- | --- | --- |
| View, search, and filter inventory | Yes | Yes | Yes | No |
| Create and edit ingredients | Yes | Yes | Yes | No |
| Receive stock and record adjustments | Yes | Yes | Yes | No |
| Delete an ingredient with zero stock | Yes | Yes | No | No |

Permissions are enforced by Spring Security at both the HTTP and controller boundaries. The frontend hides unavailable operations and also checks the authoritative profile in its proxy.

## Persistence and integrity

Flyway `V2__inventory.sql` adds `ingredients`, `stock_batches`, and `inventory_movements`. It does not alter existing users or sessions. Hibernate continues to use `ddl-auto=validate`.

Quantities use PostgreSQL `NUMERIC(19,6)` and Java `BigDecimal`. API quantity fields are decimal strings, including six fractional digits, so the browser never needs to represent stock using floating-point arithmetic. Maximum quantities and minimum thresholds are `9999999999999.999999`; negative balances are rejected in business logic and by database constraints.

Each stock operation runs in a transaction and locks its ingredient row before reading or changing the balance. The balance, expiry-bearing receipts, and actor-attributed movement record are saved together. Metadata updates also lock the ingredient and cannot overwrite its quantity. Name uniqueness is case-insensitive among active ingredients.

The ingredient's stock unit is fixed after creation. Intake and adjustments accept compatible units and convert exactly: `g` ↔ `kg`, `ml` ↔ `L`, or `pcs`. Conversions requiring more than six fractional digits are rejected. A quantity equal to its minimum threshold is not low stock; only a strictly lower quantity is flagged. Zero stock is displayed separately.

Basic receipts preserve separate expiry dates. Negative adjustments reduce the earliest-expiring receipt first, then receipts without expiry dates. Positive adjustments have no expiry; use stock intake when receiving expiry-bearing stock. The displayed next expiry is the earliest date among receipts with remaining quantity. Expired stock remains in the balance until staff record its removal. This is not an advanced batch management or automatic expiry deduction system.

Deletion archives an ingredient with zero stock and retains its movement history. Stable UUIDs, fixed units, exact arithmetic, and transactional stock movements provide a foundation for future recipe consumption. Recipe and order operations are not implemented here.

## Spring Boot REST API

Every endpoint below requires a bearer token. Next.js exposes the corresponding paths on the frontend origin and supplies the token from its HttpOnly session cookies. Mutations at the Next.js boundary require a matching `Origin` header.

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/inventory/options` | Supported categories, units, and storage locations |
| GET | `/api/inventory/overview` | Counts for total, low, zero stock, and storage locations |
| GET | `/api/inventory/ingredients` | Paginated list and search/filter |
| GET | `/api/inventory/ingredients/{id}` | Ingredient details |
| POST | `/api/inventory/ingredients` | Create ingredient and optional opening stock |
| PUT | `/api/inventory/ingredients/{id}` | Edit metadata without changing stock |
| DELETE | `/api/inventory/ingredients/{id}` | Archive a zero-stock ingredient |
| POST | `/api/inventory/ingredients/{id}/intake` | Receive a positive quantity of stock |
| POST | `/api/inventory/ingredients/{id}/adjustments` | Apply a non-zero signed stock delta |

List parameters: `search` (name, maximum 120 characters), `category`, `storageLocation`, `lowStock`, `page` (zero-based), and `size` (1–100, default 25). The response contains `items`, `page`, `size`, `totalElements`, and `totalPages`. Results are ordered by name and ID. Filter values use enum names returned by `/options`.

Ingredient creation:

```json
{
  "ingredient": {
    "name": "All-purpose flour",
    "category": "FLOUR_AND_GRAINS",
    "unit": "KG",
    "storageLocation": "PANTRY",
    "minimumStock": "2"
  },
  "initialQuantity": "0",
  "expiryDate": null
}
```

`PUT` accepts only the nested `ingredient` object's fields above. It never accepts a stock balance.

Stock intake:

```json
{"quantity":"1000","unit":"G","expiryDate":null,"reason":"Stock received"}
```

Stock adjustment:

```json
{"quantityDelta":"-0.5","unit":"KG","reason":"Damaged stock"}
```

Invalid input returns `400`, missing ingredients return `404`, and conflicts (including insufficient stock, duplicate names, or deletion with remaining stock) return `409`. Anonymous requests return `401`; forbidden roles return `403`. Errors use the existing `ApiError` structure. Inventory responses are not cached. Clients must not automatically retry stock mutations after a timeout; reload inventory to confirm the result first.

## Essential verification

- Backend compilation: `mvn -DskipTests compile`.
- Frontend production build: `npm run build`; lint: `npm run lint`.
- Database/API smoke tests: `InventorySmokeTests` requires `PANTRYPAL_INVENTORY_SMOKE=true` and `DB_URL=jdbc:postgresql://127.0.0.1:<port>/pantrypal_inventory_smoke`, plus local database credentials. It refuses other database URLs. Flyway runs and Hibernate validates the schema on startup. Test data is rolled back.
- Run the smoke tests with `mvn -Dtest=InventorySmokeTests,AuthenticationSecurityTests test`. The inventory tests skip without the explicit flag.
- The live browser smoke test in `frontend/tests/inventory.spec.ts` requires `PANTRYPAL_LIVE_INVENTORY=true`, `PANTRYPAL_TEST_EMAIL`, and `PANTRYPAL_TEST_PASSWORD` for a temporary owner/manager account in the disposable local database. It creates an ingredient through the real UI, receives stock, adjusts stock, and deletes the ingredient. Set `API_URL` to the local Spring Boot server and `PANTRYPAL_LIVE_AUTH=true` to disable credential-bearing test artifacts. Run `npm run test:e2e -- tests/inventory.spec.ts`.

Existing `API_URL` and `APP_ORIGIN` configuration are reused. Database credentials and signing secrets remain server-side. Deploying the backend applies V2 through Flyway; local smoke verification does not migrate Neon.

Verification on 14 October 2026: backend compilation, frontend production build and lint, 2 PostgreSQL-backed inventory smoke tests, 26 existing authentication/security tests, and the live inventory browser smoke test on desktop and mobile all passed. Flyway reported successful V1 and V2 migrations and Hibernate validated the schema. The backend smoke-test rows rolled back; the browser checks used a disposable local database that was removed afterward. No Neon database was changed.

The Windows browser runner required manual termination of its temporary server processes during teardown after both checks passed; it then reported `2 passed` and exited successfully. Temporary service logs, the disposable database, and the copied Maven cache were removed. Traces and screenshots are disabled in the live inventory test itself.

## Changed files

Paths in the inventory Java module are relative to `backend/src/main/java/com/pantrypal/backend/inventory/`.

| Status | Files |
| --- | --- |
| Created | `controller/InventoryController.java` |
| Created | `dto/CreateIngredientRequest.java`, `dto/IngredientRequest.java`, `dto/IngredientResponse.java`, `dto/StockAdjustmentRequest.java`, `dto/StockIntakeRequest.java` |
| Created | `entity/Ingredient.java`, `entity/IngredientCategory.java`, `entity/InventoryMovement.java`, `entity/MeasurementUnit.java`, `entity/StockBatch.java`, `entity/StorageLocation.java` |
| Created | `repository/IngredientRepository.java`, `repository/InventoryMovementRepository.java`, `repository/StockBatchRepository.java` |
| Created | `service/InventoryException.java`, `service/InventoryService.java` |
| Created | `backend/src/main/resources/db/migration/V2__inventory.sql` |
| Created | `backend/src/test/java/com/pantrypal/backend/inventory/InventorySmokeTests.java` |
| Modified | `backend/src/main/java/com/pantrypal/backend/common/exception/ApiExceptionHandler.java` |
| Modified | `backend/src/main/java/com/pantrypal/backend/security/config/SecurityConfiguration.java` |
| Created | `frontend/app/inventory/page.tsx`, `frontend/app/api/inventory/[...path]/route.ts` |
| Created | `frontend/components/inventory/inventory-workspace.tsx`, `frontend/components/inventory/inventory-field.tsx`, `frontend/components/inventory/ingredient-dialog.tsx`, `frontend/components/inventory/stock-dialog.tsx`, `frontend/components/inventory/delete-ingredient-dialog.tsx` |
| Created | `frontend/components/ui/select.tsx`, `frontend/lib/inventory/types.ts`, `frontend/lib/inventory/client.ts` |
| Created | `frontend/tests/inventory.spec.ts` |
| Modified | `frontend/components/auth/dashboard-checkpoint.tsx`, `frontend/lib/api/server.ts` |
| Created | `docs/inventory-management.md` |

## Scope limits

Categories are predefined rather than business-configurable. The overview shows counts rather than summing incompatible units. Receipt history is retained in the database but does not yet have a history browser or per-receipt correction UI. Inventory is shared by this installation; business tenancy is not present in the current authentication model. Scanning, suppliers, purchase orders, recipes, orders, AI, and full reporting remain outside this feature.

# Epic 02 — Inventory and Stock Intake

**Epic ID:** EPIC-02  
**Project:** PantryPal  
**Status:** Not Started  
**Priority:** High

---

## 1. Epic Overview

The Inventory and Stock Intake epic provides the core inventory-management capabilities of PantryPal.

The system must maintain accurate information about ingredients used by a cookery or bakery SME, including their available quantities, units of measurement, storage locations, expiry dates, and minimum stock levels.

Stock may enter PantryPal through three supported methods:

1. Manual stock entry
2. Barcode scanning
3. Receipt scanning

Regardless of the intake method, inventory shall only be updated using validated ingredient and quantity information.

Ingredients shall initially be classified into the following storage locations:

- Pantry
- Refrigerator
- Freezer

This epic establishes the inventory foundation required by recipe management, order processing, reporting, and Sunday Stock Clearance.

---

## 2. Epic Goals

This epic aims to:

- Maintain a centralized ingredient inventory.
- Allow authorized users to register and maintain ingredients.
- Track available ingredient quantities.
- Support appropriate units of measurement.
- Classify ingredients according to storage location.
- Track ingredient expiry information.
- Identify low-stock ingredients.
- Allow stock to be received manually.
- Support barcode-assisted stock intake.
- Support receipt-based stock intake.
- Require user verification before automatically detected stock information modifies inventory.
- Maintain accurate inventory data for later recipe and order operations.

---

## 3. User Story Summary

| ID | User Story | Priority | Status |
|---|---|---|---|
| US-2.1 | Create Ingredient | High | Not Started |
| US-2.2 | View Inventory | High | Not Started |
| US-2.3 | Search and Filter Inventory | Medium | Not Started |
| US-2.4 | Update Ingredient | High | Not Started |
| US-2.5 | Manual Stock Addition | High | Not Started |
| US-2.6 | Storage Classification | High | Not Started |
| US-2.7 | Expiry Tracking | High | Not Started |
| US-2.8 | Low Stock Detection | Medium | Not Started |
| US-2.9 | Barcode Stock Entry | Medium | Not Started |
| US-2.10 | Barcode Information Confirmation | Medium | Not Started |
| US-2.11 | Receipt Upload | Medium | Not Started |
| US-2.12 | Receipt Information Extraction | Medium | Not Started |
| US-2.13 | Receipt Verification and Stock Confirmation | High | Not Started |

---

# US-2.1 — Create Ingredient

## User Story

As an Inventory Staff member or authorized Manager,  
I want to register an ingredient in PantryPal,  
so that the ingredient can be tracked and used by the inventory and recipe systems.

## Priority

High

## Acceptance Criteria

- Authorized users shall be able to create an ingredient.
- An ingredient shall have a unique system identifier.
- Ingredient name shall be required.
- A valid unit of measurement shall be specified.
- A storage location shall be assigned.
- A minimum stock level may be configured.
- Expiry information shall be supported where applicable.
- Invalid ingredient information shall not be persisted.
- Unauthorized users shall not be able to create ingredients.
- The system should prevent accidental duplicate ingredient records where reasonably identifiable.

## Initial Ingredient Information

An ingredient may contain:

- Ingredient ID
- Name
- Ingredient category
- Default unit of measurement
- Storage location
- Minimum stock level
- Current inventory information
- Created timestamp
- Updated timestamp

The final entity design shall be refined during database modelling.

## Supported Units

The initial system should support common units such as:

- g
- kg
- ml
- L
- pcs

Additional units may be introduced if required by valid business requirements.

## Test Scenarios

1. Create a valid ingredient.
2. Attempt to create an ingredient without a name.
3. Attempt to create an ingredient without a valid unit.
4. Attempt to create an ingredient without a storage location.
5. Attempt to create an invalid duplicate ingredient.
6. Unauthorized user attempts to create an ingredient.

## Status

`Not Started`

---

# US-2.2 — View Inventory

## User Story

As an authorized PantryPal user,  
I want to view current ingredient inventory,  
so that I can understand the stock currently available to the business.

## Priority

High

## Acceptance Criteria

- Authorized users shall be able to view inventory records.
- The inventory view shall display relevant ingredient information.
- Available quantities shall be displayed with their corresponding units.
- Storage location shall be visible.
- Relevant expiry information shall be visible.
- Low-stock status shall be identifiable where applicable.
- The inventory view shall handle an empty inventory state appropriately.

## UI Information

The inventory interface should display information such as:

- Ingredient name
- Category
- Available quantity
- Unit
- Storage location
- Expiry information
- Stock status

## Test Scenarios

1. View inventory containing multiple ingredients.
2. View an empty inventory.
3. Verify quantities and units are displayed correctly.
4. Verify storage locations are displayed.
5. Verify unauthorized access is rejected where applicable.

## Status

`Not Started`

---

# US-2.3 — Search and Filter Inventory

## User Story

As an authorized user,  
I want to search and filter inventory,  
so that I can quickly locate relevant ingredients.

## Priority

Medium

## Acceptance Criteria

- Users shall be able to search ingredients by name.
- Users shall be able to filter inventory by storage location.
- Users should be able to filter by ingredient category.
- Users should be able to identify low-stock ingredients.
- Users should be able to identify ingredients approaching expiry.
- Search and filter operations shall not modify inventory.

## Initial Filters

The interface may support:

- Ingredient name
- Ingredient category
- Pantry
- Refrigerator
- Freezer
- Low stock
- Approaching expiry

## Test Scenarios

1. Search for an existing ingredient.
2. Search for a non-existing ingredient.
3. Filter by Pantry.
4. Filter by Refrigerator.
5. Filter by Freezer.
6. Filter by low-stock status.
7. Combine search and filtering where supported.

## Status

`Not Started`

---

# US-2.4 — Update Ingredient

## User Story

As authorized inventory staff,  
I want to update ingredient information,  
so that incorrect or outdated ingredient details can be maintained.

## Priority

High

## Acceptance Criteria

- Authorized users shall be able to edit permitted ingredient information.
- Updated values shall be validated.
- Invalid changes shall not be persisted.
- Unauthorized users shall not be able to modify ingredients.
- Updating descriptive ingredient information shall not unintentionally modify stock quantities.

## Important Business Rule

Changes to ingredient metadata and changes to inventory quantity should be treated as separate operations.

For example:

Changing:

- ingredient name
- category
- minimum stock level

is different from:

- adding 5 kg of flour
- removing damaged stock

Inventory quantity should not be silently overwritten through normal ingredient editing.

## Test Scenarios

1. Update an ingredient name.
2. Update its storage location.
3. Update its minimum stock level.
4. Attempt an invalid update.
5. Unauthorized user attempts to modify an ingredient.
6. Verify metadata editing does not unexpectedly change inventory quantity.

## Status

`Not Started`

---

# US-2.5 — Manual Stock Addition

## User Story

As Inventory Staff,  
I want to manually record newly received ingredient stock,  
so that PantryPal accurately reflects available inventory.

## Priority

High

## Acceptance Criteria

- Authorized users shall be able to select an existing ingredient.
- Users shall be able to enter the quantity received.
- A valid unit shall be required.
- Expiry information shall be recorded where applicable.
- The quantity added shall be greater than zero.
- The user shall confirm the stock addition.
- Successful stock addition shall increase available inventory.
- Invalid stock additions shall not modify inventory.

## Example

Existing inventory:

```text
Flour: 5 kg
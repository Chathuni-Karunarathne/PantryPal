# Epic 02 — Inventory and Stock Intake

**Epic ID:** EPIC-02  
**Project:** PantryPal  
**Status:** Not Started  
**Priority:** High

---

## 1. Epic Overview

The Inventory and Stock Intake epic provides PantryPal's core ingredient and inventory-management functionality.

The system shall maintain information about ingredients used by cookery and bakery SMEs, including available quantities, units, storage locations, minimum stock levels, and expiry information.

Stock may enter PantryPal using:

1. Manual stock entry
2. Barcode scanning
3. Receipt scanning

Regardless of the intake method, inventory shall only be modified using validated and confirmed information.

Ingredients shall initially be classified into:

- Pantry
- Refrigerator
- Freezer

This epic establishes the inventory foundation required by recipes, orders, reporting, and Sunday Stock Clearance.

---

## 2. Epic Goals

- Maintain a centralized ingredient inventory.
- Register and maintain ingredients.
- Track ingredient quantities and units.
- Classify ingredients by storage location.
- Track expiry information.
- Identify low-stock ingredients.
- Support manual stock intake.
- Support barcode-assisted stock intake.
- Support receipt-assisted stock intake.
- Require user confirmation before scanned information modifies inventory.
- Maintain reliable inventory records for later business operations.

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

## US-2.1 — Create Ingredient

### User Story

As Inventory Staff or an authorized Manager,  
I want to register an ingredient,  
so that PantryPal can track it throughout inventory, recipes, and orders.

### Acceptance Criteria

- Authorized users shall be able to create ingredients.
- Ingredient name shall be required.
- A default unit shall be specified.
- A storage location shall be assigned.
- A minimum stock level may be configured.
- Invalid ingredient information shall not be persisted.
- Unauthorized users shall not create ingredients.
- The system should prevent unintended duplicate ingredient records.

### Initial Ingredient Information

- Ingredient ID
- Name
- Category
- Default unit
- Storage location
- Minimum stock level
- Created timestamp
- Updated timestamp

### Initial Units

- g
- kg
- ml
- L
- pcs

### Test Scenarios

1. Create a valid ingredient.
2. Create without a name.
3. Create without a valid unit.
4. Create without storage classification.
5. Attempt an unintended duplicate.
6. Unauthorized user attempts creation.

### Status

**Not Started**

---

## US-2.2 — View Inventory

### User Story

As an authorized user,  
I want to view current inventory,  
so that I can understand available ingredient stock.

### Acceptance Criteria

- Authorized users shall be able to view inventory.
- Ingredient quantities and units shall be displayed.
- Storage location shall be visible.
- Relevant expiry information shall be visible.
- Low-stock status shall be identifiable.
- Empty inventory shall be handled appropriately.

### Inventory View

The interface should display:

- Ingredient
- Category
- Available quantity
- Unit
- Storage location
- Expiry information
- Stock status

### Test Scenarios

1. View multiple ingredients.
2. View empty inventory.
3. Verify quantities and units.
4. Verify storage locations.
5. Verify appropriate authorization.

### Status

**Not Started**

---

## US-2.3 — Search and Filter Inventory

### User Story

As an authorized user,  
I want to search and filter inventory,  
so that I can quickly find relevant ingredients.

### Acceptance Criteria

Users shall be able to search/filter using relevant criteria including:

- Ingredient name.
- Ingredient category.
- Pantry.
- Refrigerator.
- Freezer.
- Low-stock status.
- Approaching-expiry status.

Search and filtering shall not modify inventory.

### Test Scenarios

1. Search an existing ingredient.
2. Search a nonexistent ingredient.
3. Filter by each storage location.
4. Filter low stock.
5. Filter approaching expiry.
6. Combine supported search/filter criteria.

### Status

**Not Started**

---

## US-2.4 — Update Ingredient

### User Story

As authorized inventory staff,  
I want to update ingredient information,  
so that PantryPal contains accurate ingredient details.

### Acceptance Criteria

- Authorized users shall edit permitted ingredient metadata.
- Changes shall be validated.
- Invalid updates shall not persist.
- Unauthorized users shall not modify ingredients.
- Editing metadata shall not silently overwrite stock quantities.

### Business Rule

Ingredient metadata and stock movement shall be separate concepts.

Changing an ingredient name or category is not equivalent to adding or removing physical stock.

### Test Scenarios

1. Update name.
2. Update category.
3. Update storage location.
4. Update minimum stock level.
5. Submit invalid information.
6. Verify quantity is not unintentionally modified.

### Status

**Not Started**

---

## US-2.5 — Manual Stock Addition

### User Story

As Inventory Staff,  
I want to manually record received stock,  
so that available inventory remains accurate.

### Acceptance Criteria

- An existing ingredient shall be selectable.
- Quantity shall be greater than zero.
- A valid compatible unit shall be supplied.
- Expiry information shall be supported where applicable.
- The user shall confirm the stock addition.
- Successful intake shall increase inventory.
- Failed validation shall not modify inventory.

### Example

Existing flour: **5 kg**  
Stock received: **10 kg**  
Updated available flour: **15 kg**

### Test Scenarios

1. Add valid stock.
2. Add zero quantity.
3. Add negative quantity.
4. Submit invalid unit information.
5. Verify correct inventory increase.
6. Unauthorized stock addition.

### Status

**Not Started**

---

## US-2.6 — Storage Classification

### User Story

As Inventory Staff,  
I want ingredients classified by storage location,  
so that PantryPal reflects how stock is physically stored.

### Initial Storage Locations

- Pantry
- Refrigerator
- Freezer

### Acceptance Criteria

- Every ingredient shall have a storage classification.
- Storage classification shall be visible.
- Inventory shall be filterable by storage classification.
- Authorized users shall be able to change classification.

### Example

- Flour → Pantry
- Sugar → Pantry
- Butter → Refrigerator
- Eggs → Refrigerator
- Frozen Fruit → Freezer

### Status

**Not Started**

---

## US-2.7 — Expiry Tracking

### User Story

As a Manager or Inventory Staff member,  
I want to track stock expiry dates,  
so that ingredients can be used before they expire.

### Acceptance Criteria

- Expiry dates shall be recorded for applicable received stock.
- Stock approaching expiry shall be identifiable.
- Expired stock shall be distinguishable from usable stock.
- Expiry information shall be available in inventory views.
- Expiry information shall be available to Sunday Stock Clearance.

### Important Design Requirement

Expiry shall be associated with received stock batches rather than assuming an ingredient has only one expiry date.

Example:

**Butter Batch A**
- Quantity: 2 kg
- Expiry: 2026-10-02

**Butter Batch B**
- Quantity: 3 kg
- Expiry: 2026-10-10

### Test Scenarios

1. Record stock with expiry.
2. Identify approaching expiry.
3. Identify expired stock.
4. Preserve separate expiry dates for separate stock intake.
5. Handle ingredients where expiry is not applicable.

### Status

**Not Started**

---

## US-2.8 — Low Stock Detection

### User Story

As a Manager,  
I want PantryPal to identify low-stock ingredients,  
so that replenishment can be planned.

### Acceptance Criteria

- Ingredients may have a minimum stock level.
- Current quantity shall be compared against the configured threshold.
- Ingredients below the threshold shall be identified.
- Low-stock status shall be visible.
- Low-stock ingredients shall be filterable.

### Test Scenarios

1. Quantity above minimum.
2. Quantity equal to minimum.
3. Quantity below minimum.
4. Ingredient without configured minimum where permitted.
5. Filter low-stock ingredients.

### Status

**Not Started**

---

## US-2.9 — Barcode Stock Entry

### User Story

As Inventory Staff,  
I want to scan a barcode,  
so that stock information can be entered more efficiently.

### Acceptance Criteria

- The application shall support barcode input/scanning.
- PantryPal shall attempt to identify the corresponding product/ingredient information.
- Detected information shall not immediately modify inventory.
- Detected information shall be presented for verification.
- Unknown barcodes shall allow an appropriate manual workflow.
- Failed scanning shall not modify inventory.

### Workflow

Barcode Scan → Product Identification → Preview → User Verification → Stock Confirmation

### Test Scenarios

1. Recognized barcode.
2. Unknown barcode.
3. Invalid barcode.
4. Scanning failure.
5. Verify no stock change before confirmation.

### Status

**Not Started**

---

## US-2.10 — Barcode Information Confirmation

### User Story

As Inventory Staff,  
I want to verify barcode-detected information,  
so that inaccurate information does not enter inventory.

### Acceptance Criteria

- Detected information shall be shown before stock modification.
- Editable information may be corrected.
- Quantity shall be supplied.
- Expiry shall be supplied where required.
- Users may cancel.
- Inventory shall only change after explicit confirmation.

### Test Scenarios

1. Confirm correct information.
2. Correct detected information.
3. Cancel the operation.
4. Verify cancellation causes no stock change.
5. Verify confirmed stock is added correctly.

### Status

**Not Started**

---

## US-2.11 — Receipt Upload

### User Story

As Inventory Staff,  
I want to upload or capture a purchase receipt,  
so that PantryPal can assist with entering purchased ingredients.

### Acceptance Criteria

- Authorized users shall provide a supported receipt image/file.
- Supported input types shall be validated.
- Invalid input shall be rejected.
- Upload alone shall not modify inventory.
- Valid input shall enter the receipt-processing workflow.

### Test Scenarios

1. Upload supported receipt.
2. Upload unsupported file.
3. Submit invalid input.
4. Verify inventory remains unchanged.

### Status

**Not Started**

---

## US-2.12 — Receipt Information Extraction

### User Story

As Inventory Staff,  
I want PantryPal to extract useful information from a receipt,  
so that manual data entry is reduced.

### Acceptance Criteria

The system should attempt to identify:

- Purchased item name.
- Quantity where detectable.
- Unit where detectable.
- Purchase date where relevant.
- Other relevant stock-intake information.

The system shall:

- Treat extracted information as unverified.
- Handle partial extraction.
- Handle unsuccessful extraction.
- Never modify inventory based solely on extracted data.
- Present extracted data for user review.

### Business Rule

**Extracted receipt data is not confirmed inventory data.**

### Test Scenarios

1. Extract multiple items.
2. Handle partial extraction.
3. Handle unreadable receipt.
4. Handle inaccurate detection.
5. Verify extraction does not modify stock.

### Status

**Not Started**

---

## US-2.13 — Receipt Verification and Stock Confirmation

### User Story

As Inventory Staff,  
I want to review and correct receipt-extracted information,  
so that only accurate stock enters PantryPal.

### Acceptance Criteria

Users shall be able to:

- Review extracted items.
- Remove irrelevant items.
- Correct item names.
- Correct quantities.
- Correct units.
- Supply missing expiry information.
- Match detected products to PantryPal ingredients.
- Correct an incorrect ingredient match.
- Confirm the final intake.
- Cancel the workflow.

Only confirmed items shall update inventory.

### Workflow

Receipt → Extraction → Unverified Items → Review/Correction → Confirmation → Inventory Update

### Test Scenarios

1. Confirm correctly extracted items.
2. Correct quantity.
3. Correct ingredient match.
4. Remove irrelevant item.
5. Supply missing information.
6. Cancel intake.
7. Verify cancellation causes no stock change.
8. Verify confirmed stock quantities.

### Status

**Not Started**

---

## 4. Inventory Integrity Requirements

1. Unverified barcode or receipt data shall never directly modify inventory.
2. Stock additions shall require positive quantities.
3. Ingredient metadata changes and stock movements shall be separate operations.
4. Backend authorization shall protect inventory operations.
5. Quantity calculations shall respect compatible units.
6. Failed operations shall not leave unintended partial updates.
7. Separately received stock shall support different expiry dates.
8. Inventory information shall be usable by recipes, orders, reporting, and Sunday Stock Clearance.
9. Inventory movements should be traceable through inventory transaction records.

---

## 5. Epic-Level Testing Scope

### Unit Tests

Cover:

- Quantity validation.
- Low-stock determination.
- Expiry status.
- Unit-related calculations.

### Integration Tests

Verify:

- Ingredient persistence.
- Stock intake.
- Inventory updates.
- Stock batches.
- Expiry persistence.
- Authorization.
- Transaction consistency.

### Frontend Tests

Cover:

- Ingredient forms.
- Inventory views.
- Search/filter controls.
- Stock intake forms.
- Barcode confirmation.
- Receipt verification.

### End-to-End Tests

Representative scenario:

Login as Inventory Staff → create Flour → add 5 kg → view inventory → verify 5 kg → add 2 kg → verify 7 kg.

Receipt scenario:

Upload Receipt → Extract Items → Correct Items → Confirm → Verify Inventory.

---

## 6. Epic Completion Criteria

- [ ] US-2.1 through US-2.13 are completed.
- [ ] Inventory authorization is enforced.
- [ ] Inventory validation is implemented.
- [ ] PostgreSQL persistence is working.
- [ ] Separate expiry-bearing stock batches are supported.
- [ ] Inventory transactions are traceable.
- [ ] Relevant automated tests pass.
- [ ] Core stock-intake workflows are manually verified.
- [ ] API documentation is updated where required.

---

## 7. Definition of Done

A user story may be marked **Completed** when:

- [ ] Acceptance criteria are satisfied.
- [ ] Required UI is implemented.
- [ ] Required backend functionality is implemented.
- [ ] Required persistence is implemented.
- [ ] Authorization is enforced.
- [ ] Validation and error handling are complete.
- [ ] Relevant automated tests pass.
- [ ] Manual verification is complete.
- [ ] Code has been reviewed/refactored where necessary.
- [ ] Changes are committed and pushed to GitHub.

# Epic 04 — Orders and Inventory Consumption

**Epic ID:** EPIC-04  
**Project:** PantryPal  
**Status:** Not Started  
**Priority:** High

---

## 1. Epic Overview

The Orders and Inventory Consumption epic manages customer orders and translates ordered products into ingredient consumption.

When an order is processed, PantryPal shall use stored recipes to calculate required ingredients. The system shall validate that sufficient usable inventory exists before performing inventory deduction.

Structured customer customizations shall also be supported, including additional ingredients and removed ingredients.

For example, a Butter Cake may normally consume:

- Flour — 250 g
- Sugar — 250 g
- Butter — 250 g
- Eggs — 4 pcs
- Baking Powder — 15 g
- Vanilla — 10 ml

If the customer requests **10 g Sprinkles** and **No Vanilla**, PantryPal shall deduct the standard recipe except vanilla and additionally deduct 10 g of sprinkles.

---

## 2. Epic Goals

- Create customer orders.
- Add multiple products and quantities.
- Calculate order totals.
- Support structured product customizations.
- Calculate ingredient requirements from recipes.
- Scale requirements according to quantities and recipe yield.
- Validate stock availability.
- Automatically deduct inventory.
- Maintain transactional consistency.
- Prevent duplicate deductions.
- Track order status.
- Preserve order and consumption history.

---

## 3. User Story Summary

| ID | User Story | Priority | Status |
|---|---|---|---|
| US-4.1 | Create Order | High | Not Started |
| US-4.2 | Add Products and Quantities | High | Not Started |
| US-4.3 | Calculate Order Total | High | Not Started |
| US-4.4 | Add Ingredient Customization | High | Not Started |
| US-4.5 | Remove Ingredient Customization | High | Not Started |
| US-4.6 | Validate Ingredient Availability | High | Not Started |
| US-4.7 | Calculate Recipe-Based Consumption | High | Not Started |
| US-4.8 | Apply Customizations to Consumption | High | Not Started |
| US-4.9 | Automatically Deduct Inventory | High | Not Started |
| US-4.10 | Manage Order Status | High | Not Started |
| US-4.11 | View Order History | Medium | Not Started |

---

## US-4.1 — Create Order

### User Story

As Order Staff or another authorized user,  
I want to create a customer order,  
so that customer purchases can be processed through PantryPal.

### Acceptance Criteria

- Authorized users shall create orders.
- Each order shall have a unique identifier.
- An order shall contain at least one valid item before confirmation.
- Creation time shall be recorded.
- The creating staff member shall be recorded where appropriate.
- Every order shall have a valid status.
- Invalid orders shall not be confirmed.
- Unauthorized creation shall be rejected.

### Status

**Not Started**

---

## US-4.2 — Add Products and Quantities

### User Story

As Order Staff,  
I want to add products and quantities to an order,  
so that the customer's requested items are accurately recorded.

### Acceptance Criteria

- Only available products shall be selectable.
- Quantity shall be greater than zero.
- Multiple products shall be supported.
- Multiple units of one product shall be supported.
- Invalid product references shall be rejected.

### Test Scenarios

1. Add one product.
2. Add multiple products.
3. Add multiple units.
4. Add unavailable product.
5. Add zero/negative quantity.
6. Add invalid product.

### Status

**Not Started**

---

## US-4.3 — Calculate Order Total

### User Story

As Order Staff,  
I want PantryPal to calculate the order total,  
so that the payable amount is accurate.

### Acceptance Criteria

- Each order-item subtotal shall be calculated.
- Overall total shall be calculated.
- Quantity shall affect subtotal.
- The price applicable when the order is processed shall be preserved.
- Later catalogue price changes shall not rewrite historical totals.

### Historical Pricing Rule

If Butter Cake costs Rs. 1,500 when ordered and later changes to Rs. 1,700, the historical order shall retain Rs. 1,500.

### Status

**Not Started**

---

## US-4.4 — Add Ingredient Customization

### User Story

As Order Staff,  
I want to add extra ingredients requested by a customer,  
so that the customized product and inventory usage are accurately represented.

### Acceptance Criteria

- Additional ingredients shall reference valid PantryPal ingredients.
- Additional quantity shall be explicitly specified.
- Quantity shall be positive.
- Unit shall be valid and compatible.
- Customization shall apply only to the associated order item.
- Additional requirements shall participate in stock validation and deduction.

### Example

Butter Cake + 10 g Sprinkles

### Business Rule

Customizations that affect inventory shall be structured data rather than free-form text.

### Status

**Not Started**

---

## US-4.5 — Remove Ingredient Customization

### User Story

As Order Staff,  
I want to record when a customer removes a standard ingredient,  
so that PantryPal does not deduct an ingredient that was not used.

### Acceptance Criteria

- Removed ingredient shall belong to the product recipe.
- Removal shall apply only to the associated order item.
- Removed ingredient shall be excluded from final consumption.
- Invalid removals shall be rejected.
- Free-form notes shall not directly modify inventory.

### Example

Butter Cake — No Vanilla

Standard vanilla requirement: 10 ml  
Final vanilla requirement: 0 ml

### Status

**Not Started**

---

## US-4.6 — Validate Ingredient Availability

### User Story

As Order Staff,  
I want PantryPal to verify ingredient availability,  
so that orders cannot create invalid stock levels.

### Acceptance Criteria

- Complete order requirements shall be calculated.
- Product quantities shall be considered.
- Customizations shall be considered.
- Usable stock shall be checked.
- Insufficient ingredients shall be identified.
- Inventory-consuming processing shall not continue with insufficient stock.
- Inventory shall not become negative.
- Failed validation shall not cause partial deductions.

### Test Scenarios

1. All stock available.
2. One ingredient insufficient.
3. Multiple ingredients insufficient.
4. Exactly enough inventory.
5. Failed validation leaves inventory unchanged.
6. Compatible units are handled correctly.

### Status

**Not Started**

---

## US-4.7 — Calculate Recipe-Based Consumption

### User Story

As the business,  
I want PantryPal to calculate ingredient consumption from recipes,  
so that stock usage reflects products ordered.

### Acceptance Criteria

- Applicable recipes shall be retrieved.
- Recipe ingredient quantities shall be retrieved.
- Recipe yield shall be considered.
- Requirements shall scale with order quantity.
- Shared ingredients across multiple products shall be aggregated correctly.
- Compatible units shall be normalized consistently.
- Calculation alone shall not modify inventory.

### Example

If one Butter Cake requires 250 g flour, three cakes require 750 g flour.

### Status

**Not Started**

---

## US-4.8 — Apply Customizations to Consumption

### User Story

As the business,  
I want structured customizations applied to calculated consumption,  
so that inventory reflects the ingredients actually used.

### Acceptance Criteria

- Standard recipe requirements shall be calculated first.
- Added ingredients shall increase requirements.
- Removed ingredients shall reduce/exclude applicable requirements.
- Multiple customizations shall be supported.
- Customizations shall affect only the associated order item.
- Final requirements shall undergo stock validation.

### Example

Standard Vanilla: 10 ml  
Remove Vanilla: -10 ml  
Add Sprinkles: +10 g

Final consumption includes 0 ml Vanilla and 10 g Sprinkles.

### Status

**Not Started**

---

## US-4.9 — Automatically Deduct Inventory

### User Story

As the business,  
I want PantryPal to automatically deduct consumed ingredients,  
so that inventory remains synchronized with processed orders.

### Acceptance Criteria

- Deduction shall use validated final ingredient requirements.
- Deduction shall only occur after stock validation.
- Relevant stock records shall be updated consistently.
- The operation shall be transactional.
- Failure shall roll back unintended partial changes.
- Inventory shall not become negative.
- Ingredient consumption shall be recorded.
- Reprocessing the same business event shall not deduct inventory twice.
- Consumption shall be associated with the relevant order.

### Stock Batch Consideration

Because stock batches may have different expiry dates, PantryPal should consume appropriate batches.

The preferred strategy for perishable stock is **FEFO — First Expired, First Out**, where appropriate.

### Test Scenarios

1. Successful deduction.
2. Multiple ingredient deduction.
3. Multiple product deduction.
4. Verify final quantities.
5. Simulate failure and verify rollback.
6. Insufficient stock.
7. Verify no negative inventory.
8. Verify duplicate deduction prevention.
9. Verify consumption history.

### Status

**Not Started**

---

## US-4.10 — Manage Order Status

### User Story

As authorized staff,  
I want to update order status,  
so that PantryPal reflects order progress.

### Initial Statuses

- Pending
- In Progress
- Completed
- Cancelled

### Acceptance Criteria

- Every order shall have a valid status.
- Valid transitions shall be supported.
- Invalid transitions shall be rejected.
- Status changes shall not trigger duplicate inventory deduction.
- Inventory deduction shall occur at one clearly defined lifecycle point.
- Cancellation after consumption shall follow an explicit inventory-handling rule.

### Important Rule

Cancelling an order after ingredients have been consumed does not necessarily mean those ingredients can be returned to usable inventory.

The cancellation/waste policy shall therefore be explicitly implemented rather than automatically restoring stock.

### Status

**Not Started**

---

## US-4.11 — View Order History

### User Story

As an authorized user,  
I want to view historical orders,  
so that previous business activity can be reviewed.

### Acceptance Criteria

- Previous orders shall be viewable.
- Order ID and timestamps shall be visible.
- Status shall be visible.
- Products and quantities shall be visible.
- Historical prices shall be preserved.
- Historical customizations shall be preserved.
- Historical information shall not change when current recipes or product prices change.
- Appropriate search/filtering should be supported.

### Suggested Filters

- Order ID
- Date range
- Status
- Product

### Status

**Not Started**

---

## 4. Order and Inventory Integrity Requirements

1. Only available products may be added to new orders.
2. Quantities shall be positive.
3. Historical prices shall be preserved.
4. Recipe yield shall be considered.
5. Structured customizations shall affect consumption.
6. Free-form notes shall not directly modify inventory.
7. Inventory shall be validated before deduction.
8. Inventory shall not become negative.
9. Failed operations shall not leave partial deductions.
10. Order/inventory operations requiring atomicity shall be transactional.
11. Duplicate inventory deduction shall be prevented.
12. Historical consumption shall survive later recipe changes.
13. Backend authorization shall protect operations.
14. Inventory deduction shall occur at one defined lifecycle point.

---

## 5. Epic-Level Testing Scope

### Unit Tests

Cover:

- Recipe scaling.
- Ingredient aggregation.
- Order subtotal.
- Order total.
- Added ingredients.
- Removed ingredients.
- Stock validation.
- Order-state transition rules.

### Integration Tests

Verify:

- Order persistence.
- Order items.
- Customizations.
- Inventory validation.
- Inventory deduction.
- Consumption history.
- Transaction rollback.
- Authorization.
- Duplicate-consumption prevention.

### Frontend Tests

Cover:

- Order form.
- Product selection.
- Quantity controls.
- Customizations.
- Totals.
- Insufficient-stock errors.
- Order status.

### End-to-End Test

Login as Order Staff → create Butter Cake order → add Sprinkles → remove Vanilla → process order → verify order → open inventory → verify expected ingredient deductions.

A second E2E test shall verify that an order with insufficient stock causes **no ingredient quantities to change**.

---

## 6. Epic Completion Criteria

- [ ] US-4.1 through US-4.11 are completed.
- [ ] Authorization is enforced.
- [ ] Order/inventory transactions are consistent.
- [ ] Historical pricing is preserved.
- [ ] Historical consumption is preserved.
- [ ] Duplicate inventory deduction is prevented.
- [ ] Relevant unit tests pass.
- [ ] Relevant integration tests pass.
- [ ] Relevant frontend tests pass.
- [ ] Core E2E order scenarios pass.
- [ ] API documentation is updated.

---

## 7. Definition of Done

A user story may be marked **Completed** when:

- [ ] Acceptance criteria are satisfied.
- [ ] Required UI is implemented.
- [ ] Required backend functionality is implemented.
- [ ] Database integration is complete.
- [ ] Authorization is enforced.
- [ ] Validation and error handling are implemented.
- [ ] Transaction requirements are satisfied where applicable.
- [ ] Appropriate automated tests pass.
- [ ] Manual verification is complete.
- [ ] Code has been reviewed/refactored where necessary.
- [ ] Changes are committed and pushed to GitHub.
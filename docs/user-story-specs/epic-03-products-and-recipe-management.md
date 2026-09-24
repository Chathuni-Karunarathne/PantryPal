# Epic 03 — Products and Recipe Management

**Epic ID:** EPIC-03  
**Project:** PantryPal  
**Status:** Not Started  
**Priority:** High

---

## 1. Epic Overview

This epic manages the food and beverage products sold by the business and connects them to the ingredients required for production.

Products shall be organized into configurable categories such as:

- Cakes and Pastries
- Desserts
- Drinks
- Entrees

Each product may have a recipe defining the ingredients, required quantities, and recipe yield.

Recipes connect PantryPal's product catalogue with inventory. This information will later allow the order system to calculate ingredient requirements and automatically update inventory.

---

## 2. Epic Goals

- Manage product categories.
- Create and maintain products.
- Control product availability.
- Associate recipes with products.
- Define recipe ingredients.
- Define ingredient quantities.
- Define recipe yield.
- Maintain recipes as production requirements change.
- Ensure recipes reference valid inventory ingredients.
- Provide reliable recipe information for order processing.

---

## 3. User Story Summary

| ID | User Story | Priority | Status |
|---|---|---|---|
| US-3.1 | Manage Product Categories | Medium | Not Started |
| US-3.2 | Create Product | High | Not Started |
| US-3.3 | View and Search Products | High | Not Started |
| US-3.4 | Update Product | Medium | Not Started |
| US-3.5 | Manage Product Availability | High | Not Started |
| US-3.6 | Create Recipe | High | Not Started |
| US-3.7 | Define Recipe Ingredients and Quantities | High | Not Started |
| US-3.8 | Define Recipe Yield | High | Not Started |
| US-3.9 | Update Recipe | High | Not Started |

---

## US-3.1 — Manage Product Categories

### User Story

As a Manager or Owner/Admin,  
I want to manage product categories,  
so that menu products can be logically organized.

### Acceptance Criteria

- Authorized users shall create categories.
- Category name shall be required.
- Existing categories shall be viewable.
- Categories shall be editable.
- Products shall reference valid categories.
- Unintended duplicate categories should be prevented.
- Unauthorized modification shall be rejected.

### Example Categories

- Cakes and Pastries
- Desserts
- Drinks
- Entrees

Businesses may create additional categories.

### Status

**Not Started**

---

## US-3.2 — Create Product

### User Story

As a Manager or Owner/Admin,  
I want to create a product,  
so that it can be included in the business catalogue and customer orders.

### Acceptance Criteria

- Product name shall be required.
- Product shall reference a valid category.
- Product may contain a description.
- Product shall support a valid selling price.
- Product shall have an availability status.
- Invalid information shall not persist.
- Unauthorized creation shall be rejected.

### Initial Product Information

- Product ID
- Name
- Description
- Category
- Selling price
- Availability
- Recipe relationship
- Created timestamp
- Updated timestamp

### Test Scenarios

1. Create valid product.
2. Missing name.
3. Invalid category.
4. Invalid price.
5. Verify availability.
6. Unauthorized creation.

### Status

**Not Started**

---

## US-3.3 — View and Search Products

### User Story

As an authorized user,  
I want to view and search products,  
so that I can quickly locate menu items.

### Acceptance Criteria

- Products shall be viewable.
- Relevant product information shall be displayed.
- Products shall be searchable by name.
- Products should be filterable by category.
- Products should be filterable by availability.
- Empty catalogue states shall be handled appropriately.

### Status

**Not Started**

---

## US-3.4 — Update Product

### User Story

As a Manager or Owner/Admin,  
I want to update product information,  
so that PantryPal reflects the current menu.

### Acceptance Criteria

- Permitted product information shall be editable.
- Updated information shall be validated.
- Category changes shall reference valid categories.
- Price shall remain valid.
- Updating product metadata shall not unintentionally modify its recipe.
- Unauthorized updates shall be rejected.

### Test Scenarios

1. Update name.
2. Update description.
3. Change category.
4. Change price.
5. Submit invalid update.
6. Verify recipe remains unchanged.
7. Unauthorized update.

### Status

**Not Started**

---

## US-3.5 — Manage Product Availability

### User Story

As a Manager or Owner/Admin,  
I want to control product availability,  
so that unavailable products cannot be selected for new orders.

### Acceptance Criteria

- Products may be marked available or unavailable.
- Unavailable products shall remain in historical records.
- Unavailable products shall not be selectable for new orders.
- Historical orders shall remain valid.
- Unauthorized availability changes shall be rejected.

### Business Rule

Product deactivation shall not destroy historical data.

### Status

**Not Started**

---

## US-3.6 — Create Recipe

### User Story

As a Manager or Owner/Admin,  
I want to create a recipe for a product,  
so that PantryPal knows which ingredients are required to produce it.

### Acceptance Criteria

- Recipe shall reference a valid product.
- Recipe shall support multiple ingredients.
- Recipe shall define a valid yield.
- Recipe data shall be validated.
- Unauthorized creation shall be rejected.
- Creating a recipe shall not modify inventory.

### Business Rule

A recipe describes expected ingredient consumption. It does not itself consume inventory.

### Status

**Not Started**

---

## US-3.7 — Define Recipe Ingredients and Quantities

### User Story

As a Manager or Owner/Admin,  
I want to define ingredients and quantities for a recipe,  
so that PantryPal can calculate inventory consumption.

### Acceptance Criteria

- Recipes shall contain one or more valid PantryPal ingredients.
- Every recipe ingredient shall specify a positive quantity.
- Each quantity shall use an appropriate unit.
- Invalid ingredient references shall be rejected.
- Unintended duplicate ingredients within one recipe shall be prevented.
- Recipe editing shall not directly modify inventory.

### Example — Butter Cake

| Ingredient | Quantity |
|---|---:|
| Flour | 250 g |
| Sugar | 250 g |
| Butter | 250 g |
| Eggs | 4 pcs |
| Baking Powder | 15 g |
| Vanilla | 10 ml |

### Unit Requirement

Compatible units must eventually be normalized correctly.

For example, an inventory quantity of **2 kg flour** must be comparable with a recipe requirement of **250 g flour**.

### Status

**Not Started**

---

## US-3.8 — Define Recipe Yield

### User Story

As a Manager or Owner/Admin,  
I want to define recipe yield,  
so that PantryPal can correctly scale ingredient requirements.

### Acceptance Criteria

- Every recipe shall define a meaningful yield.
- Yield shall be greater than zero.
- Yield shall describe what the stored ingredient quantities produce.
- Consumption calculations shall use yield when scaling production.

### Example

If the recipe produces one 1 kg Butter Cake using 250 g flour, an order for three equivalent cakes requires 750 g flour.

### Test Scenarios

1. Valid yield.
2. Zero yield.
3. Negative yield.
4. Persist yield.
5. Verify quantities remain associated with the yield.

### Status

**Not Started**

---

## US-3.9 — Update Recipe

### User Story

As a Manager or Owner/Admin,  
I want to update an existing recipe,  
so that PantryPal reflects changes in production requirements.

### Acceptance Criteria

Authorized users shall be able to:

- Add recipe ingredients.
- Remove recipe ingredients.
- Change quantities.
- Change applicable units.
- Change recipe yield.

The system shall:

- Validate changes.
- Reject invalid ingredient references.
- Reject invalid quantities.
- Prevent unauthorized modification.
- Avoid changing inventory merely because a recipe changes.
- Use the updated recipe for future applicable orders.

### Historical Rule

Changing today's recipe shall not rewrite ingredient consumption already recorded for previous orders.

### Test Scenarios

1. Add ingredient.
2. Remove ingredient.
3. Change quantity.
4. Change yield.
5. Invalid update.
6. Verify inventory remains unchanged.
7. Verify future calculations use updated recipe.
8. Verify historical consumption remains unchanged.
9. Unauthorized update.

### Status

**Not Started**

---

## 4. Product and Recipe Integrity Requirements

1. Products shall reference valid categories.
2. Recipes shall reference valid products.
3. Recipe ingredients shall reference valid inventory ingredients.
4. Recipe quantities shall be positive.
5. Recipe yield shall be greater than zero.
6. Unavailable products shall not be used for new orders.
7. Disabling products shall not destroy historical data.
8. Recipe creation/editing shall not directly modify inventory.
9. Historical consumption shall not be recalculated when recipes change.
10. Backend authorization shall protect product and recipe modifications.
11. Compatible unit conversion shall be handled consistently.

---

## 5. Epic-Level Testing Scope

### Unit Tests

Cover:

- Product validation.
- Recipe validation.
- Ingredient quantity validation.
- Yield validation.
- Availability rules.
- Recipe scaling.

### Integration Tests

Verify:

- Category persistence.
- Product persistence.
- Product/category relationships.
- Recipe persistence.
- Recipe/product relationships.
- Recipe/ingredient relationships.
- Database constraints.
- Authorization.

### Frontend Tests

Cover:

- Product forms.
- Category forms.
- Search/filtering.
- Recipe builder.
- Ingredient selection.
- Quantity validation.
- Availability controls.

### End-to-End Test

Login as Manager → create category → create Butter Cake → create recipe → select ingredients → define quantities → define yield → save → reopen product → verify recipe.

---

## 6. Epic Completion Criteria

- [ ] US-3.1 through US-3.9 are completed.
- [ ] Product/recipe authorization is enforced.
- [ ] Product and recipe data persists correctly.
- [ ] Recipe relationships are validated.
- [ ] Compatible unit handling is implemented.
- [ ] Recipe changes do not directly modify inventory.
- [ ] Historical consumption remains intact.
- [ ] Relevant automated tests pass.
- [ ] Core workflows are manually verified.
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
- [ ] Relevant automated tests pass.
- [ ] Manual verification is complete.
- [ ] Code has been reviewed/refactored where necessary.
- [ ] Changes are committed and pushed to GitHub.
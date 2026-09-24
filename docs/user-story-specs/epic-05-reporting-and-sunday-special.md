# Epic 05 — Reporting and Sunday Special

**Epic ID:** EPIC-05  
**Project:** PantryPal  
**Status:** Not Started  
**Priority:** Medium / High

---

## 1. Epic Overview

The Reporting and Sunday Special epic provides management insight into PantryPal's inventory and order data and introduces the project's initial AI-assisted functionality.

The reporting component shall help managers understand:

- Current inventory.
- Low-stock ingredients.
- Ingredients approaching expiry.
- Ingredient usage.
- Most ordered products.
- Least ordered products.
- Order activity over selected periods.

The Sunday Stock Clearance feature shall use ingredients approaching expiry to help the business identify suitable products for a Sunday Special menu.

The system shall first use deterministic business logic to identify at-risk stock, find compatible recipes, and determine which products can actually be produced.

The AI component shall then use this validated information to generate useful Sunday Special suggestions and explanations.

AI shall provide recommendations only. It shall not directly modify inventory or publish business decisions without authorized user approval.

---

## 2. Epic Goals

- Provide a useful manager dashboard.
- Report current inventory status.
- Analyze ingredient usage.
- Identify popular and less frequently ordered products.
- Report low-stock and expiring inventory.
- Support date-based report filtering.
- Identify stock at risk of expiry.
- Match at-risk ingredients to existing recipes.
- Calculate feasible production quantities.
- Use a beginner-friendly AI integration to generate Sunday Special recommendations.
- Explain why recommendations were generated.
- Require manager approval before activating a Sunday Special.

---

## 3. User Story Summary

| ID | User Story | Priority | Status |
|---|---|---|---|
| US-5.1 | Manager Dashboard | Medium | Not Started |
| US-5.2 | Current Inventory Report | Medium | Not Started |
| US-5.3 | Ingredient Usage Report | Medium | Not Started |
| US-5.4 | Most Ordered Products | Medium | Not Started |
| US-5.5 | Least Ordered Products | Medium | Not Started |
| US-5.6 | Expiry Report | High | Not Started |
| US-5.7 | Low Stock Report | Medium | Not Started |
| US-5.8 | Report Date Filtering | Medium | Not Started |
| US-5.9 | Identify At-Risk Sunday Stock | High | Not Started |
| US-5.10 | Match At-Risk Ingredients with Recipes | High | Not Started |
| US-5.11 | Calculate Feasible Production Quantities | High | Not Started |
| US-5.12 | Generate AI Sunday Special Recommendations | High | Not Started |
| US-5.13 | Explain AI Recommendations | Medium | Not Started |
| US-5.14 | Review Sunday Specials | High | Not Started |
| US-5.15 | Approve or Reject Sunday Specials | High | Not Started |

---

## US-5.1 — Manager Dashboard

### User Story

As a Manager,  
I want a dashboard summarizing important business information,  
so that I can quickly understand the current operational state.

### Acceptance Criteria

The dashboard should provide relevant summaries such as:

- Current stock overview.
- Low-stock count.
- Expiring-stock count.
- Recent orders.
- Order activity.
- Frequently ordered products.
- Relevant Sunday Stock Clearance information.

Dashboard information shall be derived from PantryPal data and shall respect authorization.

### Status

**Not Started**

---

## US-5.2 — Current Inventory Report

### User Story

As a Manager,  
I want a current inventory report,  
so that I can review available ingredient stock.

### Acceptance Criteria

The report shall provide relevant information including:

- Ingredient.
- Available quantity.
- Unit.
- Storage location.
- Stock status.
- Relevant expiry information.

The report should support appropriate filtering and shall not modify inventory.

### Status

**Not Started**

---

## US-5.3 — Ingredient Usage Report

### User Story

As a Manager,  
I want to analyze ingredient consumption,  
so that I can understand which ingredients are used most frequently.

### Acceptance Criteria

- Ingredient consumption shall be derived from recorded inventory-consumption data.
- Usage shall support a defined reporting period.
- Results shall identify quantity consumed using meaningful units.
- Historical recipe changes shall not rewrite previously recorded consumption.
- Results should be sortable or otherwise understandable.

### Status

**Not Started**

---

## US-5.4 — Most Ordered Products

### User Story

As a Manager,  
I want to see the most frequently ordered products,  
so that I can understand which menu items receive the most orders.

### Acceptance Criteria

- Product-order frequency shall be calculated from historical orders.
- A defined date range should be supported.
- Product quantities shall be considered appropriately.
- Results shall not depend solely on the current availability status of a product.

### Status

**Not Started**

---

## US-5.5 — Least Ordered Products

### User Story

As a Manager,  
I want to identify less frequently ordered products,  
so that I can understand which menu items have lower recorded demand.

### Acceptance Criteria

- Results shall be based on historical order data.
- Date-range filtering should be supported.
- Products with low or zero order quantities within the selected period shall be handled appropriately.
- The report shall present factual order information rather than automatically removing products.

### Status

**Not Started**

---

## US-5.6 — Expiry Report

### User Story

As a Manager,  
I want to view stock approaching expiry,  
so that the business can take action before ingredients are wasted.

### Acceptance Criteria

- The system shall identify stock approaching expiry.
- Expired stock shall be distinguishable from soon-to-expire stock.
- Ingredient name shall be visible.
- Relevant stock quantity shall be visible.
- Expiry date shall be visible.
- Storage location should be visible.
- Results shall use stock-batch expiry information.
- Expiry information shall feed the Sunday Stock Clearance workflow.

### Status

**Not Started**

---

## US-5.7 — Low Stock Report

### User Story

As a Manager,  
I want a report of low-stock ingredients,  
so that I can identify inventory requiring replenishment.

### Acceptance Criteria

- Current quantity shall be compared against configured minimum stock.
- Low-stock ingredients shall be displayed.
- Current quantity and minimum level shall be visible.
- Report generation shall not modify inventory.

### Status

**Not Started**

---

## US-5.8 — Report Date Filtering

### User Story

As a Manager,  
I want to filter applicable reports by date range,  
so that I can analyze business activity for a relevant period.

### Acceptance Criteria

- Start date and end date shall be supported where relevant.
- Invalid date ranges shall be rejected.
- Reports shall only include applicable information from the selected period.
- Date filtering shall behave consistently across supported reports.

### Test Scenarios

1. Valid date range.
2. Single-day period.
3. Invalid start/end relationship.
4. Period with no data.
5. Period containing multiple orders.

### Status

**Not Started**

---

## US-5.9 — Identify At-Risk Sunday Stock

### User Story

As a Manager,  
I want PantryPal to identify stock approaching expiry before Sunday,  
so that usable ingredients can be considered for stock-clearance specials.

### Acceptance Criteria

- The system shall identify stock batches approaching expiry according to a configured business rule.
- Expired stock shall not be proposed as usable stock.
- Available quantity shall be considered.
- Ingredient and expiry information shall be provided to the Sunday Special workflow.
- The identification process shall use deterministic application logic rather than relying on AI to determine inventory truth.

### Important Rule

The database and business logic remain the source of truth for:

- Ingredient identity.
- Quantity.
- Expiry date.
- Usability status.

AI shall not invent these values.

### Status

**Not Started**

---

## US-5.10 — Match At-Risk Ingredients with Recipes

### User Story

As a Manager,  
I want PantryPal to identify recipes that use at-risk ingredients,  
so that suitable products can be considered for Sunday Specials.

### Acceptance Criteria

- At-risk ingredients shall be compared with stored recipes.
- Products using those ingredients shall be identified.
- Only valid existing recipes shall be considered.
- Product availability and relevant business rules shall be considered.
- Recipe matching shall be performed using deterministic backend logic.
- Matching alone shall not modify inventory.

### Example

At-risk inventory:

- Fresh Cream
- Strawberries

Potential recipe matches:

- Strawberry Cake
- Strawberry Tart
- Cream Pastry

### Status

**Not Started**

---

## US-5.11 — Calculate Feasible Production Quantities

### User Story

As a Manager,  
I want PantryPal to determine how many units of a candidate product can actually be produced,  
so that Sunday Special recommendations are realistic.

### Acceptance Criteria

- The complete recipe shall be considered, not only the expiring ingredient.
- Available usable inventory shall be considered.
- Recipe yield shall be considered.
- Compatible units shall be handled.
- The limiting ingredient shall determine the maximum feasible production quantity.
- The calculation shall not modify inventory.
- Products that cannot currently be produced shall not be represented as feasible.

### Example

A candidate product requires:

- 250 g Flour
- 200 g Butter
- 100 g Fresh Cream

Available inventory:

- 2 kg Flour
- 1 kg Butter
- 350 g Fresh Cream

Fresh Cream limits production to three complete units.

The deterministic backend therefore reports a maximum feasible quantity of **3** before the AI recommendation stage.

### Status

**Not Started**

---

## US-5.12 — Generate AI Sunday Special Recommendations

### User Story

As a Manager,  
I want PantryPal to generate AI-assisted Sunday Special recommendations,  
so that I can turn feasible stock-clearance options into useful menu suggestions.

### Acceptance Criteria

- AI shall receive only relevant validated information from PantryPal.
- Input may include:
  - At-risk ingredients.
  - Quantities.
  - Feasible products.
  - Maximum feasible production quantities.
  - Relevant product categories.
  - Historical order information where implemented.
- AI shall generate one or more Sunday Special suggestions.
- Recommendations shall be treated as suggestions rather than system facts.
- AI shall not directly deduct inventory.
- AI shall not independently modify recipes.
- AI shall not independently publish or activate a special.
- Failure of the AI service shall not corrupt PantryPal data.
- The application shall handle unavailable or invalid AI responses gracefully.

### AI Boundary

Deterministic PantryPal logic performs:

At-risk detection → Recipe matching → Stock validation → Feasibility calculation.

AI performs:

Feasible candidates → Recommendation wording/reasoning → Suggested Sunday Special options.

This separation ensures the first AI implementation remains manageable and does not place critical inventory calculations under AI control.

### Status

**Not Started**

---

## US-5.13 — Explain AI Recommendations

### User Story

As a Manager,  
I want to understand why a Sunday Special was recommended,  
so that I can evaluate whether the suggestion makes sense for the business.

### Acceptance Criteria

A recommendation should provide useful reasoning such as:

- Which at-risk ingredients influenced the suggestion.
- Why the proposed product uses those ingredients.
- Feasible production quantity.
- Relevant historical order information if provided to the AI.
- A concise human-readable explanation.

AI explanations shall not override factual values calculated by PantryPal.

### Example

**Suggested Sunday Special:** Strawberry Cream Cake

**Reasoning:**
- Strawberry stock is approaching expiry.
- Fresh cream is also approaching expiry.
- The existing Strawberry Cream Cake recipe uses both ingredients.
- Current usable inventory supports up to 4 cakes.

The quantity value shall originate from PantryPal's feasibility calculation rather than being invented by the AI.

### Status

**Not Started**

---

## US-5.14 — Review Sunday Specials

### User Story

As a Manager,  
I want to review generated Sunday Special recommendations,  
so that I can evaluate them before taking business action.

### Acceptance Criteria

The review interface should display:

- Suggested product.
- At-risk ingredients involved.
- Relevant quantities.
- Maximum feasible production quantity.
- AI-generated explanation.
- Approval action.
- Rejection action.

Reviewing a recommendation shall not itself modify inventory.

### Status

**Not Started**

---

## US-5.15 — Approve or Reject Sunday Specials

### User Story

As a Manager,  
I want to approve or reject an AI-generated recommendation,  
so that a human remains responsible for the final business decision.

### Acceptance Criteria

- Authorized users shall approve a recommendation.
- Authorized users shall reject a recommendation.
- Approval status shall be recorded.
- Rejection status shall be recorded.
- Unauthorized users shall not approve/reject recommendations.
- Approval shall not immediately deduct ingredients merely because a recommendation was accepted.
- Actual inventory consumption shall continue through normal order/business workflows.
- AI shall never approve its own recommendation.

### Human-in-the-Loop Rule

AI Recommendation → Manager Review → Approve or Reject

Human approval remains mandatory.

### Status

**Not Started**

---

## 4. Reporting and AI Integrity Requirements

1. Reports shall use persisted PantryPal data.
2. Historical reports shall use recorded historical information rather than current recipe assumptions.
3. Reporting shall not modify inventory.
4. At-risk stock shall be determined by deterministic business logic.
5. Expired stock shall not be recommended as usable inventory.
6. Recipe matching shall use stored recipes.
7. Production feasibility shall be calculated by application logic.
8. AI shall not invent stock quantities.
9. AI shall not directly modify inventory.
10. AI shall not directly modify recipes.
11. AI shall not independently activate a Sunday Special.
12. Manager approval shall be required.
13. AI service failures shall not corrupt application data.
14. AI outputs shall be clearly treated as recommendations.
15. Backend authorization shall protect reporting and Sunday Special management operations.

---

## 5. Epic-Level Testing Scope

### Reporting Unit Tests

Cover:

- Ingredient usage calculations.
- Product-order counts.
- Low-stock determination.
- Expiry classification.
- Date-range validation.

### Sunday Clearance Unit Tests

Cover:

- At-risk stock detection.
- Recipe matching.
- Feasibility calculation.
- Limiting-ingredient calculation.
- Unit conversion.

### AI Integration Tests

Verify:

- Correct validated data is sent to the AI layer.
- Valid AI responses are handled.
- Malformed AI responses are handled safely.
- AI service failure is handled gracefully.
- AI output cannot directly change inventory.

The AI service should be mocked for most automated tests so tests remain repeatable and do not depend on external API availability.

### Frontend Tests

Cover:

- Dashboard components.
- Report filters.
- Expiry report.
- Sunday Special candidate display.
- AI recommendation display.
- Approval/rejection controls.
- Loading/error states.

### End-to-End Test

Representative Sunday workflow:

Manager login → open Sunday Stock Clearance → identify at-risk ingredients → generate feasible candidates → request AI suggestions → review recommendation → approve recommendation.

The test shall verify that simply generating or approving a recommendation does not incorrectly deduct inventory.

---

## 6. Epic Completion Criteria

EPIC-05 shall be complete when:

- [ ] US-5.1 Manager Dashboard is completed.
- [ ] US-5.2 Current Inventory Report is completed.
- [ ] US-5.3 Ingredient Usage Report is completed.
- [ ] US-5.4 Most Ordered Products is completed.
- [ ] US-5.5 Least Ordered Products is completed.
- [ ] US-5.6 Expiry Report is completed.
- [ ] US-5.7 Low Stock Report is completed.
- [ ] US-5.8 Report Date Filtering is completed.
- [ ] US-5.9 Identify At-Risk Sunday Stock is completed.
- [ ] US-5.10 Match At-Risk Ingredients with Recipes is completed.
- [ ] US-5.11 Calculate Feasible Production Quantities is completed.
- [ ] US-5.12 Generate AI Sunday Special Recommendations is completed.
- [ ] US-5.13 Explain AI Recommendations is completed.
- [ ] US-5.14 Review Sunday Specials is completed.
- [ ] US-5.15 Approve or Reject Sunday Specials is completed.
- [ ] AI is separated from critical inventory calculations.
- [ ] Human approval is enforced.
- [ ] AI failure handling is implemented.
- [ ] Relevant automated tests pass.
- [ ] Sunday Special E2E workflow passes.
- [ ] API documentation is updated where required.

---

## 7. Definition of Done

A user story may be marked **Completed** when:

- [ ] Acceptance criteria are satisfied.
- [ ] Required UI is implemented.
- [ ] Required backend functionality is implemented.
- [ ] Required database integration is complete.
- [ ] Authorization is enforced.
- [ ] Validation and error handling are implemented.
- [ ] AI failure handling is implemented where applicable.
- [ ] Appropriate automated tests pass.
- [ ] Manual verification is complete.
- [ ] Code has been reviewed/refactored where necessary.
- [ ] Changes are committed and pushed to GitHub.
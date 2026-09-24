# Epic 03 — Products and Recipe Management

**Epic ID:** EPIC-03  
**Project:** PantryPal  
**Status:** Not Started  
**Priority:** High

---

## 1. Epic Overview

The Products and Recipe Management epic defines the food and beverage items sold by the business and connects those products to the ingredients required to produce them.

Products shall be organized into business-defined categories such as:

- Cakes and Pastries
- Desserts
- Drinks
- Entrees

Each product may have a recipe defining the ingredients and quantities required to produce a specified yield.

Recipes form the connection between the product catalogue and PantryPal's inventory system. The recipe information established in this epic will later be used by the Order and Inventory Consumption epic to calculate ingredient requirements and automatically reduce inventory when orders are processed.

---

## 2. Epic Goals

This epic aims to:

- Allow authorized users to organize products into categories.
- Maintain the products offered by the business.
- Allow products to be enabled or disabled for ordering.
- Associate recipes with products.
- Define the ingredients required by each recipe.
- Define the quantity of each required ingredient.
- Define recipe yield.
- Allow recipes to be maintained when production requirements change.
- Ensure recipes reference valid PantryPal ingredients.
- Establish reliable recipe data for automatic inventory calculations.

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

# US-3.1 — Manage Product Categories

## User Story

As a Manager or Owner/Admin,  
I want to manage product categories,  
so that the products offered by the business can be logically organized.

## Priority

Medium

## Acceptance Criteria

- Authorized users shall be able to create product categories.
- Each category shall have a unique identifier.
- A category name shall be required.
- Category names shall be validated before persistence.
- Users shall be able to view existing categories.
- Authorized users shall be able to update category information.
- Products shall be assignable to a product category.
- Unauthorized users shall not be able to modify product categories.
- The system should prevent unintended duplicate categories.

## Example Categories

```text
Cakes and Pastries
Desserts
Drinks
Entrees
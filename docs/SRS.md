# PantryPal — Software Requirements Specification

**Project Name:** PantryPal
**Document:** Software Requirements Specification (SRS)
**Version:** 1.0
**Project Type:** Web-based Inventory and Order Management System
**Target Domain:** Small and Medium-sized Cookery and Bakery Businesses

---

## 1. Introduction

### 1.1 Purpose

PantryPal is a web-based inventory and order management system designed for small and medium-sized businesses in the cookery and bakery industry.

The system will help businesses manage ingredients, recipes, products, orders, and inventory in a centralized platform. PantryPal will automatically calculate ingredient consumption based on recipes when orders are placed, reducing manual inventory management.

The system will also provide an AI-powered **Sunday Stock Clearance** feature that identifies ingredients approaching expiry and generates suitable Sunday Special menu suggestions to help businesses reduce food waste.

---

### 1.2 Problem Statement

Small cookery and bakery businesses often manage inventory manually or using disconnected systems. This can make it difficult to:

* Maintain an accurate record of available ingredients.
* Track ingredient expiry dates.
* Determine how much stock is consumed when products are sold.
* Monitor frequently used ingredients.
* Identify products that are frequently or rarely ordered.
* Manage stock received from suppliers efficiently.
* Reduce waste caused by ingredients expiring before use.
* Make use of ingredients that are approaching expiry.

PantryPal aims to address these issues through a centralized system connecting inventory, recipes, orders, reporting, and AI-assisted menu planning.

---

### 1.3 Objectives

The main objectives of PantryPal are to:

1. Provide a centralized system for managing business inventory.
2. Support multiple methods of adding ingredients, including manual entry, barcode scanning, and receipt scanning.
3. Track ingredient quantities, units, storage locations, and expiry dates.
4. Allow businesses to create products and define their recipes.
5. Automatically deduct ingredient quantities when an order is processed.
6. Support customer-specific product customizations.
7. Provide useful inventory, order, and usage reports.
8. Identify ingredients approaching expiry.
9. Use AI to generate suitable Sunday Special menu suggestions based on available at-risk inventory.
10. Provide role-based access to protect business data and operations.

---

## 2. Scope

### 2.1 In Scope

The initial version of PantryPal will include:

* User authentication.
* Role-based access control.
* Ingredient management.
* Inventory management.
* Storage location management using Pantry, Refrigerator, and Freezer.
* Ingredient expiry tracking.
* Manual ingredient entry.
* Barcode-based ingredient entry.
* Receipt scanning and ingredient extraction.
* Product management.
* Product categories.
* Recipe management.
* Recipe-based inventory deduction.
* Order management.
* Order customizations.
* Inventory and order reports.
* Ingredient usage analysis.
* Product order analysis.
* Sunday Stock Clearance.
* AI-generated Sunday Special recommendations.
* Manager approval of AI-generated specials.

### 2.2 Out of Scope for Initial Version

The following features are intentionally excluded from the initial version and may be considered for future releases:

* Multi-branch management.
* Supplier and purchase-order management.
* Advanced demand forecasting.
* Automated purchasing.
* Advanced production planning.
* Kitchen display system.
* Ingredient substitution engine.
* Advanced profitability analysis.
* Advanced waste management.
* Stock transfer between branches.
* AI business chatbot.
* Advanced machine-learning forecasting.

---

## 3. Users and Roles

PantryPal will support role-based access control.

### 3.1 Owner / Administrator

The Owner/Admin has full access to the system.

Responsibilities include:

* Manage users and roles.
* Manage ingredients.
* Manage products and recipes.
* Manage inventory.
* Manage orders.
* View reports.
* Manage Sunday Specials.
* Configure business-level settings.

---

### 3.2 Manager

The Manager is responsible for day-to-day business operations.

Responsibilities include:

* View and manage inventory.
* Manage ingredients.
* Manage products and recipes.
* View and manage orders.
* View reports and analytics.
* Review expiring ingredients.
* Generate and review Sunday Special recommendations.
* Approve or reject AI-generated Sunday Specials.

---

### 3.3 Order Staff

Order Staff primarily handle customer orders.

Responsibilities include:

* View available products.
* Create orders.
* Add products to orders.
* Add customer customizations.
* View order status.
* View relevant product information.

Order Staff should not be able to directly modify inventory quantities or recipes.

---

### 3.4 Inventory Staff

Inventory Staff primarily handle stock-related operations.

Responsibilities include:

* Add ingredients.
* Receive stock.
* Scan barcodes.
* Scan receipts.
* Update stock quantities where permitted.
* View expiry information.
* Record relevant inventory adjustments.

Inventory Staff should not be able to modify recipes or access administrative functions unless explicitly permitted.

---

## 4. Functional Requirements

## 4.1 Authentication and Authorization

### FR-AUTH-01 — User Login

The system shall allow registered users to authenticate using their credentials.

### FR-AUTH-02 — User Logout

The system shall allow authenticated users to securely log out.

### FR-AUTH-03 — Role-Based Access Control

The system shall restrict system functionality according to the user's assigned role.

### FR-AUTH-04 — Protected Resources

The system shall prevent unauthorized users from accessing protected resources and operations.

### FR-AUTH-05 — User Management

Authorized administrators shall be able to create, update, deactivate, and manage user accounts.

---

# 4.2 Ingredient and Inventory Management

### FR-INV-01 — Ingredient Registration

The system shall allow authorized users to register ingredients.

An ingredient may contain:

* Name
* Category
* Unit of measurement
* Current quantity
* Minimum stock level
* Storage location
* Expiry information

### FR-INV-02 — Storage Classification

The system shall classify ingredients according to their storage location:

* Pantry
* Refrigerator
* Freezer

### FR-INV-03 — Quantity Tracking

The system shall maintain the available quantity of each ingredient.

### FR-INV-04 — Unit Tracking

The system shall support appropriate units such as:

* g
* kg
* ml
* L
* pcs

### FR-INV-05 — Expiry Tracking

The system shall allow expiry dates to be recorded for applicable inventory items.

### FR-INV-06 — Low Stock Identification

The system shall identify ingredients whose available quantity falls below the configured minimum stock level.

### FR-INV-07 — Inventory Updates

The system shall update ingredient quantities when stock is added, consumed, or manually adjusted.

### FR-INV-08 — Inventory Validation

The system shall prevent inventory quantities from becoming invalid due to unauthorized or incorrect operations.

---

# 4.3 Manual Ingredient Entry

### FR-MAN-01 — Manual Entry

Authorized users shall be able to manually enter ingredient information.

### FR-MAN-02 — Required Information

The system shall validate required information before an ingredient is added to inventory.

### FR-MAN-03 — Quantity Entry

Users shall be able to specify the quantity and unit of the ingredient.

### FR-MAN-04 — Expiry Entry

Users shall be able to specify an expiry date where applicable.

---

# 4.4 Barcode Scanning

### FR-BAR-01 — Barcode Scanning

The system shall allow users to scan a supported product barcode when adding stock.

### FR-BAR-02 — Product Identification

The system shall attempt to identify the scanned product using the barcode.

### FR-BAR-03 — User Confirmation

The system shall allow users to review and confirm the detected information before adding stock.

### FR-BAR-04 — Manual Correction

Users shall be able to correct or complete information when barcode information is unavailable or inaccurate.

---

# 4.5 Receipt Scanning

### FR-REC-01 — Receipt Upload

The system shall allow authorized users to upload or capture a receipt.

### FR-REC-02 — Receipt Processing

The system shall process the receipt and attempt to identify relevant ingredient information.

### FR-REC-03 — Extracted Information

The system should attempt to extract information such as:

* Ingredient/product name
* Quantity
* Unit
* Date
* Relevant purchase information

### FR-REC-04 — Review Before Confirmation

The system shall display extracted information to the user for verification.

### FR-REC-05 — Confirmation

Inventory shall only be updated after the user confirms the extracted information.

### FR-REC-06 — Correction

Users shall be able to modify incorrectly extracted information before confirmation.

---

# 4.6 Product Management

### FR-PROD-01 — Product Creation

Authorized users shall be able to create products.

### FR-PROD-02 — Product Information

A product may contain:

* Product name
* Description
* Product category
* Selling price
* Recipe
* Availability status

### FR-PROD-03 — Product Categories

The system shall allow products to be organized into categories such as:

* Cakes and Pastries
* Drinks
* Entrees
* Desserts

The system should allow authorized users to create additional business-specific categories.

### FR-PROD-04 — Product Availability

Authorized users shall be able to control whether a product is currently available for ordering.

---

# 4.7 Recipe Management

### FR-RECIP-01 — Recipe Creation

Authorized users shall be able to create recipes for products.

### FR-RECIP-02 — Recipe Ingredients

A recipe shall contain one or more ingredients.

### FR-RECIP-03 — Ingredient Quantity

The system shall allow the required quantity of each ingredient to be specified.

### FR-RECIP-04 — Recipe Yield

The system shall store the expected quantity or yield produced by a recipe.

### FR-RECIP-05 — Recipe Editing

Authorized users shall be able to modify recipe ingredients and quantities.

### FR-RECIP-06 — Recipe Validation

The system shall validate recipe information before saving changes.

---

# 4.8 Order Management

### FR-ORD-01 — Order Creation

Authorized users shall be able to create customer orders.

### FR-ORD-02 — Product Selection

Users shall be able to add available products to an order.

### FR-ORD-03 — Quantity Selection

Users shall be able to specify the quantity of each product ordered.

### FR-ORD-04 — Order Total

The system shall calculate the order total based on the selected products and quantities.

### FR-ORD-05 — Order Status

The system shall maintain the status of an order.

Possible statuses may include:

* Pending
* In Progress
* Completed
* Cancelled

### FR-ORD-06 — Order History

Authorized users shall be able to view previous orders.

---

# 4.9 Order Customizations

PantryPal shall support customer-specific product customizations.

### FR-CUS-01 — Add Ingredient

Users shall be able to add an ingredient to a product order.

Example:

> Butter Cake + 10g Sprinkles

The system shall account for the additional ingredient quantity.

### FR-CUS-02 — Remove Ingredient

Users shall be able to remove an ingredient from a product order.

Example:

> Butter Cake — No Vanilla

The system shall not deduct the removed ingredient quantity for that order.

### FR-CUS-03 — Structured Customizations

Customizations shall be represented as structured data rather than allowing free-form text to directly modify inventory.

### FR-CUS-04 — Validation

The system shall validate customizations before applying inventory changes.

---

# 4.10 Automatic Inventory Deduction

This is one of PantryPal's core functions.

### FR-CALC-01 — Recipe-Based Consumption

When an order is processed, the system shall calculate the required ingredient quantities based on the product recipe and ordered quantity.

### FR-CALC-02 — Inventory Deduction

The system shall deduct the calculated ingredient quantities from available inventory.

### FR-CALC-03 — Multiple Products

The system shall correctly calculate ingredient consumption when an order contains multiple products.

### FR-CALC-04 — Customization Adjustment

The system shall modify ingredient consumption according to valid order customizations.

### FR-CALC-05 — Insufficient Stock

The system shall identify insufficient inventory before completing an operation that would result in invalid stock levels.

### FR-CALC-06 — Transactional Update

Inventory deduction and the associated order operation shall be handled as a consistent transaction so that partial inventory updates do not occur if the operation fails.

---

# 4.11 Reports and Analytics

### FR-REP-01 — Inventory Report

Authorized users shall be able to view current inventory information.

### FR-REP-02 — Low Stock Report

The system shall identify ingredients that are below their minimum stock level.

### FR-REP-03 — Expiry Report

The system shall display ingredients that are approaching or have reached their expiry date.

### FR-REP-04 — Ingredient Usage Report

The system shall provide information about frequently consumed ingredients.

### FR-REP-05 — Product Order Report

The system shall provide information about frequently and infrequently ordered products.

### FR-REP-06 — Order Summary

The system shall provide summaries of orders over selected periods.

### FR-REP-07 — Report Filtering

Where applicable, users shall be able to filter reports by relevant criteria such as date range, product, category, or ingredient.

---

# 4.12 Sunday Stock Clearance

Sunday Stock Clearance is PantryPal's primary AI-assisted feature.

The purpose of this feature is to identify ingredients that are approaching expiry and help the business turn them into suitable Sunday Special products.

### FR-SUN-01 — Stock Clearance Analysis

The system shall identify inventory items approaching their expiry dates.

### FR-SUN-02 — At-Risk Ingredients

The system shall determine the quantity of ingredients considered at risk of expiry.

### FR-SUN-03 — Recipe Matching

The system shall identify recipes that can use the available at-risk ingredients.

### FR-SUN-04 — Feasibility Calculation

The system shall determine whether sufficient ingredients are available to produce a product.

### FR-SUN-05 — Maximum Production Quantity

The system shall calculate the maximum feasible quantity of a potential Sunday Special based on available ingredients.

### FR-SUN-06 — AI Recommendation

The system shall use an AI component to generate suitable Sunday Special recommendations from the feasible candidates.

### FR-SUN-07 — Recommendation Explanation

The system shall provide an explanation for each AI-generated recommendation.

The explanation may include:

* Ingredients approaching expiry.
* Quantity available.
* Recipe compatibility.
* Potential stock reduction.
* Relevant historical order information.

### FR-SUN-08 — Recommendation Review

The Manager or authorized administrator shall be able to review generated recommendations.

### FR-SUN-09 — Approval

An authorized user shall approve a recommendation before it becomes an active Sunday Special.

### FR-SUN-10 — Rejection

An authorized user shall be able to reject an AI-generated recommendation.

### FR-SUN-11 — Inventory Protection

The AI component shall not directly modify inventory quantities.

Inventory modifications shall be performed by the application's normal business logic after an approved business operation.

---

## 5. Business Rules

### BR-01 — Inventory Calculation

Inventory quantities shall be updated according to validated inventory transactions.

### BR-02 — Recipe Consumption

A product order shall consume ingredients according to its stored recipe.

### BR-03 — Customization

An approved ingredient addition or removal shall modify the normal recipe consumption for that specific order.

### BR-04 — Inventory Validation

The system shall validate available stock before completing an operation that consumes inventory.

### BR-05 — AI Safety

AI-generated recommendations shall not directly modify inventory.

### BR-06 — Sunday Special Approval

AI-generated Sunday Specials shall require authorization before becoming active.

### BR-07 — Data Consistency

Order creation and associated inventory consumption shall maintain data consistency.

### BR-08 — Role Restrictions

Users shall only perform operations permitted by their assigned role.

---

## 6. Non-Functional Requirements

### 6.1 Security

* The system shall authenticate users before granting access to protected resources.
* Role-based authorization shall be enforced on the backend.
* Passwords shall never be stored in plain text.
* Sensitive API endpoints shall require authentication.
* Users shall only access data and operations permitted by their roles.

### 6.2 Performance

* Normal application operations should respond within an acceptable time under expected SME workloads.
* Database queries should be optimized to avoid unnecessary data retrieval.
* AI processing may have longer response times but should provide appropriate loading/progress feedback.

### 6.3 Reliability

* The system shall maintain consistent inventory data.
* Failed order transactions shall not leave partial inventory updates.
* Invalid data shall be rejected before being persisted.

### 6.4 Usability

* The interface shall be simple enough for non-technical business staff.
* Important inventory warnings shall be clearly visible.
* Common operations such as adding stock and creating orders should require minimal steps.
* The system shall provide meaningful validation and error messages.

### 6.5 Maintainability

* The backend shall follow a modular architecture.
* Business logic shall be separated from controllers and data-access logic.
* APIs shall be documented.
* Automated tests shall cover important business logic.

### 6.6 Scalability

The system should be designed so that additional businesses, products, ingredients, and orders can be supported without major architectural changes.

### 6.7 Compatibility

The web application should support modern desktop and mobile web browsers.

---

# 7. High-Level System Architecture

The initial system is planned around the following architecture:

```text
┌───────────────────────────────────────────┐
│              Next.js Frontend             │
│                                           │
│ Dashboard │ Inventory │ Orders │ Reports  │
│ Recipes   │ Products  │ Sunday Special    │
└─────────────────────┬─────────────────────┘
                      │
                    REST API
                      │
┌─────────────────────▼─────────────────────┐
│              Spring Boot Backend          │
│                                           │
│ Auth │ Inventory │ Products │ Recipes     │
│ Orders │ Reports │ Sunday Special │ AI    │
└───────────────┬─────────────────┬─────────┘
                │                 │
                ▼                 ▼
       ┌────────────────┐   ┌──────────────┐
       │   PostgreSQL   │   │  AI Service  │
       │                │   │ / AI API     │
       └────────────────┘   └──────────────┘
```

---

# 8. Initial Technology Stack

## Frontend

* Next.js
* TypeScript
* TSX
* Tailwind CSS
* shadcn/ui

## Backend

* Java
* Spring Boot
* Spring Web
* Spring Security
* Spring Data JPA
* Hibernate
* Bean Validation

## Database

* PostgreSQL

## AI

The exact AI technology/API will be selected during the AI implementation phase.

## Testing

* JUnit
* Mockito
* Playwright

## Development and Deployment

* Git
* GitHub
* Docker

---

# 9. Core System Entities

The initial system is expected to contain entities similar to:

```text
User
Role
Ingredient
InventoryItem
StorageLocation
ProductCategory
Product
Recipe
RecipeIngredient
Order
OrderItem
OrderCustomization
InventoryTransaction
SundaySpecial
AIRecommendation
```

The final entity structure will be refined during database and ERD design.

---

# 10. Key System Workflows

## 10.1 Stock Intake

```text
User
  ↓
Manual / Barcode / Receipt
  ↓
Ingredient Identification
  ↓
User Verification
  ↓
Stock Added
  ↓
Inventory Updated
```

---

## 10.2 Customer Order

```text
Create Order
     ↓
Select Products
     ↓
Add Customizations
     ↓
Validate Order
     ↓
Calculate Recipe Requirements
     ↓
Check Inventory
     ↓
Confirm Order
     ↓
Deduct Inventory
```

---

## 10.3 Sunday Special

```text
Sunday Stock Clearance
          ↓
Find Expiring Ingredients
          ↓
Find Compatible Recipes
          ↓
Check Available Ingredients
          ↓
Calculate Feasible Products
          ↓
AI Generates Suggestions
          ↓
Manager Reviews
       ↙       ↘
   Reject       Approve
                 ↓
          Sunday Special
```

---

# 11. Future Enhancements

The following features may be considered after the initial version:

* Supplier management.
* Purchase orders.
* Batch and lot tracking.
* FEFO inventory consumption.
* Waste management.
* Recipe costing.
* Profitability analysis.
* Production planning.
* Demand forecasting.
* Smart reorder suggestions.
* Ingredient price history.
* Ingredient substitution.
* Kitchen display system.
* PWA/mobile staff interface.
* Smart notifications.
* AI business assistant.
* Multi-branch management.
* Stock transfers.
* What-if business simulations.

These features are **not part of the initial implementation scope** and should not influence the initial architecture unless a reasonable level of extensibility can be achieved without unnecessary complexity.

---

# 12. Success Criteria

The initial PantryPal system will be considered successful when:

1. Authorized users can securely access the system according to their roles.
2. Ingredients can be added through manual, barcode, and receipt-based workflows.
3. Inventory quantities and expiry information can be managed accurately.
4. Products and recipes can be created and maintained.
5. Orders can be created with valid customizations.
6. Ingredient consumption is automatically calculated from recipes.
7. Inventory is correctly updated after orders.
8. Users can obtain useful inventory and order reports.
9. The system can identify ingredients approaching expiry.
10. The AI component can generate feasible Sunday Special recommendations.
11. Managers can review and approve AI recommendations.
12. AI cannot directly modify inventory without passing through the application's business logic.

---

# 13. Initial Project Boundary

The core concept of PantryPal can be summarized as:

> **PantryPal is an intelligent inventory and order management system for cookery and bakery SMEs that connects ingredients, recipes, products, and orders while using AI-assisted Sunday Stock Clearance to help reduce food waste.**

The initial implementation will prioritize **correct inventory management, reliable business logic, role-based security, and a meaningful AI workflow** rather than maximizing the number of features.

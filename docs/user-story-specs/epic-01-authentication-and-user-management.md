# Epic 01 — Authentication and User Management

**Epic ID:** EPIC-01  
**Project:** PantryPal  
**Status:** Not Started  
**Priority:** High

---

## 1. Epic Overview

The Authentication and User Management epic provides secure access to PantryPal and ensures that users can only access functionality appropriate to their assigned roles.

PantryPal is intended to be used by multiple staff members within a cookery or bakery SME. Therefore, the system must authenticate users, maintain authenticated sessions, restrict protected functionality, and allow authorized administrators to manage staff accounts.

The initial system supports the following roles:

- Owner/Admin
- Manager
- Order Staff
- Inventory Staff

Authentication and authorization must be enforced by the backend and must not rely only on hiding frontend components.

---

## 2. Epic Goals

This epic aims to:

- Secure access to PantryPal.
- Authenticate registered users.
- Maintain authenticated user sessions.
- Provide secure logout functionality.
- Restrict features according to user roles.
- Allow administrators to manage staff accounts.
- Allow authenticated users to view their basic account information.
- Establish the security foundation required by all subsequent PantryPal modules.

---

## 3. User Story Summary

| ID | User Story | Priority | Status |
|---|---|---|---|
| US-1.1 | User Login | High | Not Started |
| US-1.2 | User Logout | High | Not Started |
| US-1.3 | Role-Based Access Control | High | Not Started |
| US-1.4 | User Management | High | Not Started |
| US-1.5 | Current User Profile | Medium | Not Started |

---

# US-1.1 — User Login

## User Story

As a registered PantryPal user,  
I want to log in using my credentials,  
so that I can securely access the features available to my role.

## Priority

High

## Acceptance Criteria

- The user shall be able to enter an email address and password.
- The email address shall be validated for a valid email format.
- The password field shall not accept an empty value.
- The system shall authenticate users with valid credentials.
- The system shall reject invalid credentials.
- The system shall reject login attempts for inactive user accounts.
- A successful login shall establish an authenticated session.
- The authenticated user's identity and assigned role shall be available to the application.
- The user shall be redirected to the appropriate authenticated area after successful login.
- An appropriate error message shall be displayed when authentication fails.
- The system shall not reveal whether the email or password specifically caused an authentication failure.
- Protected application pages shall not be accessible to unauthenticated users.

## UI Requirements

The login interface shall contain:

- PantryPal branding.
- Email input field.
- Password input field.
- Show/hide password control.
- Login button.
- Input validation messages.
- Authentication error message.
- Loading state while authentication is being processed.

## Backend Responsibilities

The backend shall:

- Receive login credentials.
- Validate the request.
- Retrieve the corresponding user account.
- Verify the submitted password against the securely stored password hash.
- Verify that the account is active.
- Authenticate the user.
- Establish or return the required authentication information.
- Make the authenticated user's role available for authorization.

The final authentication mechanism will be selected during implementation.

## Security Requirements

- Passwords shall never be stored in plain text.
- Authentication errors shall not expose sensitive account information.
- Protected backend endpoints shall reject unauthenticated requests.
- Authentication shall be enforced by Spring Security.

## Test Scenarios

1. Login using valid credentials.
2. Login using an incorrect password.
3. Login using an email that does not correspond to an account.
4. Attempt login with an invalid email format.
5. Attempt login with an empty email.
6. Attempt login with an empty password.
7. Attempt login using an inactive account.
8. Attempt to access a protected endpoint without authentication.
9. Verify that a successful login provides the authenticated user's role.
10. Verify that the user reaches the authenticated area after successful login.

## Status

`Not Started`

---

# US-1.2 — User Logout

## User Story

As an authenticated PantryPal user,  
I want to securely log out of the system,  
so that my authenticated session cannot continue to be used after I leave the application.

## Priority

High

## Acceptance Criteria

- An authenticated user shall be able to initiate logout.
- Logout shall terminate or invalidate the user's current authentication state as appropriate to the selected authentication mechanism.
- The user shall be redirected to the login page after logout.
- Protected pages shall no longer be accessible using the logged-out session.
- Using the browser navigation controls shall not restore access to protected functionality after logout.

## UI Requirements

The authenticated application interface shall provide an accessible logout action.

The interface should provide appropriate feedback while logout is being processed.

## Backend Responsibilities

The backend shall perform any required authentication cleanup or invalidation according to the authentication mechanism selected during implementation.

## Test Scenarios

1. Successfully log out while authenticated.
2. Verify redirection to the login page.
3. Attempt to access a protected endpoint after logout.
4. Attempt to navigate back to a protected page after logout.

## Status

`Not Started`

---

# US-1.3 — Role-Based Access Control

## User Story

As an Owner/Admin,  
I want users to have permissions according to their assigned roles,  
so that staff members can only perform operations relevant to their responsibilities.

## Priority

High

## Supported Roles

### Owner/Admin

May access all initial PantryPal functionality, including:

- User management.
- Inventory management.
- Product and recipe management.
- Order management.
- Reports and analytics.
- Sunday Special management.
- Administrative functionality.

### Manager

May access operational and management functionality, including:

- Inventory management.
- Product and recipe management.
- Order management.
- Reports and analytics.
- Sunday Special review and approval.

### Order Staff

Primarily responsible for order operations.

May:

- View available products.
- Create orders.
- Add order customizations.
- View relevant order information.

Order Staff shall not receive administrative or direct inventory-management permissions unless explicitly granted by the system design.

### Inventory Staff

Primarily responsible for inventory operations.

May:

- View inventory.
- Add ingredients.
- Add stock manually.
- Perform supported barcode-based stock intake.
- Perform supported receipt-based stock intake.
- View relevant expiry and stock information.

Inventory Staff shall not receive user-management or recipe-management permissions unless explicitly granted.

## Acceptance Criteria

- Every active user account shall have an assigned role.
- Protected operations shall define the roles authorized to perform them.
- Backend authorization shall be enforced regardless of the frontend interface.
- Unauthorized backend requests shall be rejected.
- The frontend shall avoid displaying actions that the current user is not authorized to perform.
- Manually navigating to a restricted frontend route shall not provide unauthorized access.
- A user's role shall be available after authentication.
- Role changes shall affect subsequent authorization according to the selected authentication/session strategy.

## Security Requirements

Frontend visibility shall not be treated as a security mechanism.

For example:

```text
Hidden Delete Button ≠ Authorization
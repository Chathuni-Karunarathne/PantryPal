# Epic 01 — Authentication and User Management

**Epic ID:** EPIC-01  
**Project:** PantryPal  
**Status:** Not Started  
**Priority:** High

---

## 1. Epic Overview

The Authentication and User Management epic provides secure access to PantryPal and ensures that users can only access functionality appropriate to their assigned roles.

PantryPal will be used by multiple staff members within a cookery or bakery SME. The system must therefore authenticate users, maintain authenticated sessions, protect application resources, and enforce role-based authorization.

The initial system supports four roles:

- Owner/Admin
- Manager
- Order Staff
- Inventory Staff

Authentication and authorization must be enforced by the backend. Hiding frontend controls alone shall not be considered sufficient authorization.

---

## 2. Epic Goals

This epic aims to:

- Authenticate registered PantryPal users.
- Secure protected frontend and backend resources.
- Maintain authenticated user sessions.
- Provide secure logout functionality.
- Restrict functionality according to user roles.
- Allow administrators to manage staff accounts.
- Support account activation and deactivation.
- Allow authenticated users to view their own basic profile information.
- Establish the security foundation required by all other PantryPal modules.

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

## US-1.1 — User Login

### User Story

As a registered PantryPal user,  
I want to log in using my credentials,  
so that I can securely access the features available to my role.

### Acceptance Criteria

- The user shall be able to enter an email address and password.
- Email shall be validated for a valid format.
- Password shall not be empty.
- Valid credentials shall authenticate the user.
- Invalid credentials shall be rejected.
- Inactive accounts shall not be permitted to log in.
- Successful login shall establish an authenticated session.
- The authenticated user's identity and role shall be available to the application.
- Successful authentication shall redirect the user to the authenticated area.
- Failed authentication shall display an appropriate error message.
- Authentication errors shall not reveal whether the email or password specifically caused the failure.
- Unauthenticated users shall not be able to access protected resources.

### UI Requirements

The login interface shall contain:

- PantryPal branding.
- Email field.
- Password field.
- Show/hide password control.
- Login button.
- Field validation messages.
- Authentication error message.
- Loading state.

### Backend Requirements

The backend shall:

- Receive login credentials.
- Validate the request.
- Locate the corresponding user.
- Verify the password against its securely stored hash.
- Verify that the account is active.
- Authenticate the user.
- Establish the selected authentication mechanism.
- Make the authenticated user's role available for authorization.

### Security Requirements

- Passwords shall never be stored in plain text.
- Authentication shall be enforced using Spring Security.
- Sensitive authentication information shall not be returned to the client.
- Protected endpoints shall reject unauthenticated requests.

### Test Scenarios

1. Login with valid credentials.
2. Login with an incorrect password.
3. Login with an unknown email.
4. Submit an invalid email.
5. Submit an empty password.
6. Attempt login with an inactive account.
7. Access a protected endpoint without authentication.
8. Verify the authenticated user's role.
9. Verify successful redirection after login.

### Status

**Not Started**

---

## US-1.2 — User Logout

### User Story

As an authenticated PantryPal user,  
I want to securely log out,  
so that my authenticated session cannot continue to be used after I leave the system.

### Acceptance Criteria

- Authenticated users shall be able to initiate logout.
- Logout shall invalidate or terminate the current authentication state as required by the selected authentication mechanism.
- The user shall be redirected to the login page.
- Protected resources shall no longer be accessible through the logged-out session.
- Browser navigation shall not restore unauthorized access to protected functionality.

### Test Scenarios

1. Successfully log out.
2. Verify redirection to login.
3. Access a protected endpoint after logout.
4. Attempt to navigate back to a protected page.

### Status

**Not Started**

---

## US-1.3 — Role-Based Access Control

### User Story

As an Owner/Admin,  
I want staff permissions to be determined by assigned roles,  
so that users can only perform operations relevant to their responsibilities.

### Supported Roles

#### Owner/Admin

May access all initial PantryPal functionality, including:

- User management.
- Inventory management.
- Product and recipe management.
- Order management.
- Reports and analytics.
- Sunday Special management.
- Administrative functionality.

#### Manager

May access:

- Inventory management.
- Product and recipe management.
- Order management.
- Reports and analytics.
- Sunday Special generation, review, and approval.

#### Order Staff

May:

- View available products.
- Create orders.
- Add order customizations.
- View relevant order information.

Order Staff shall not receive administrative or direct inventory-management privileges.

#### Inventory Staff

May:

- View inventory.
- Register ingredients.
- Add stock.
- Perform barcode-based stock intake.
- Perform receipt-based stock intake.
- View expiry and stock information.

Inventory Staff shall not receive user-management or recipe-management privileges.

### Acceptance Criteria

- Every active user shall have an assigned role.
- Protected operations shall define authorized roles.
- Backend authorization shall be enforced regardless of frontend visibility.
- Unauthorized API requests shall be rejected.
- Restricted frontend controls should not be shown to unauthorized roles.
- Direct navigation to restricted pages shall not grant access.
- User role information shall be available after authentication.

### Test Scenarios

1. Owner/Admin accesses administrative functionality.
2. Manager accesses management functionality.
3. Order Staff attempts to access user management.
4. Inventory Staff attempts to modify recipes.
5. An unauthenticated user accesses a protected operation.
6. An unauthorized API request is manually submitted.
7. Verify frontend restrictions.
8. Verify backend authorization independently of frontend restrictions.

### Status

**Not Started**

---

## US-1.4 — User Management

### User Story

As an Owner/Admin,  
I want to manage PantryPal staff accounts,  
so that I can control who has access to the business system.

### Acceptance Criteria

The Owner/Admin shall be able to:

- View staff accounts.
- Create staff accounts.
- Assign supported roles.
- View account information.
- Update permitted account information.
- Change assigned roles.
- Activate accounts.
- Deactivate accounts.

The system shall:

- Validate required information.
- Validate email addresses.
- Prevent duplicate accounts using the same email.
- Securely store passwords.
- Prevent inactive users from authenticating.
- Restrict user management to authorized roles.
- Preserve user records where historical business records depend on them.

Account deactivation is preferred over permanent deletion when historical references exist.

### Initial User Information

A user may contain:

- User ID
- Name
- Email
- Password hash
- Role
- Account status
- Created timestamp
- Updated timestamp

### UI Requirements

The user-management interface should provide:

- User list.
- Create-user form.
- Edit-user form.
- Role selection.
- Account-status controls.
- Validation and error feedback.

### Test Scenarios

1. Create a valid staff account.
2. Attempt duplicate email registration.
3. Submit invalid account data.
4. Change a user's role.
5. Deactivate a user.
6. Attempt login using the deactivated account.
7. Manager attempts Owner/Admin-only user management.
8. Order Staff attempts user management.
9. Inventory Staff attempts user management.

### Status

**Not Started**

---

## US-1.5 — Current User Profile

### User Story

As an authenticated PantryPal user,  
I want to view my basic account information,  
so that I know which account and role I am currently using.

### Acceptance Criteria

- Authenticated users shall be able to retrieve their own profile.
- Profile information shall correspond to the currently authenticated user.
- The assigned role shall be displayed.
- Sensitive information such as password hashes shall never be returned.
- Unauthenticated users shall not be able to access current-user information.

### Initial Profile Information

- Name
- Email
- Role
- Account status where appropriate

Profile editing is not required by this initial user story.

### Test Scenarios

1. Retrieve the authenticated user's profile.
2. Verify correct name and email.
3. Verify correct role.
4. Attempt profile access while unauthenticated.
5. Verify password hashes are never returned.

### Status

**Not Started**

---

## 4. Epic-Level Security Requirements

1. Passwords shall be securely hashed.
2. Plain-text passwords shall never be persisted.
3. Authentication shall be enforced by Spring Security.
4. Authorization shall be enforced on backend resources.
5. Frontend permission checks shall not replace backend authorization.
6. Sensitive authentication information shall not be exposed through APIs.
7. Authentication failures shall not unnecessarily reveal account information.
8. Inactive accounts shall not be permitted to authenticate.

---

## 5. Epic-Level Testing Scope

### Backend Unit Tests

Tests shall cover isolated authentication and user-management business logic where appropriate.

### Backend Integration Tests

Tests shall verify:

- Authentication.
- Protected endpoints.
- Role-based authorization.
- User persistence.
- Account status behavior.

### Frontend Component Tests

Tests should cover:

- Login form.
- Form validation.
- Error states.
- User-management components.

### End-to-End Tests

A representative scenario shall verify:

Login → authenticated application → current user information → logout → protected application inaccessible.

Role-based E2E tests should verify that users cannot access functionality outside their permissions.

---

## 6. Epic Completion Criteria

EPIC-01 shall be complete when:

- [ ] US-1.1 User Login is completed.
- [ ] US-1.2 User Logout is completed.
- [ ] US-1.3 Role-Based Access Control is completed.
- [ ] US-1.4 User Management is completed.
- [ ] US-1.5 Current User Profile is completed.
- [ ] Next.js and Spring Boot authentication are integrated.
- [ ] User data is persisted in PostgreSQL.
- [ ] Passwords are securely stored.
- [ ] Spring Security protects backend resources.
- [ ] Role-based authorization is enforced.
- [ ] Input validation and error handling are implemented.
- [ ] Relevant automated tests pass.
- [ ] Authentication E2E tests pass.
- [ ] API documentation is updated where required.

---

## 7. Definition of Done

A user story may be marked **Completed** when:

- [ ] Acceptance criteria are satisfied.
- [ ] Required UI is implemented.
- [ ] Required backend functionality is implemented.
- [ ] Database integration is complete where applicable.
- [ ] Authorization is enforced.
- [ ] Input validation is implemented.
- [ ] Relevant errors are handled.
- [ ] Appropriate automated tests pass.
- [ ] The feature is manually verified.
- [ ] Code has been reviewed/refactored where necessary.
- [ ] Changes are committed and pushed to GitHub.
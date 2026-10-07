# Authentication integration: Phase 3

Implemented on `feature/authentication`. No commit, push, merge, or PR was made.
The approved login CSS, illustration, layout, themes, typography, and animations
are unchanged. The dashboard is only an authentication checkpoint.

## Files

Created:

- `frontend/.env.example`
- `frontend/lib/api/client.ts`, `frontend/lib/api/server.ts`
- `frontend/lib/auth/types.ts`, `frontend/lib/auth/client.ts`, `frontend/lib/auth/server.ts`
- `frontend/components/auth/auth-provider.tsx`
- `frontend/components/auth/dashboard-checkpoint.tsx`
- `frontend/app/api/auth/[action]/route.ts`
- `frontend/app/dashboard/page.tsx`
- `frontend/tests/auth.spec.ts`
- `docs/authentication-phase3.md`

Modified:

- `frontend/.gitignore`: allow the safe example environment file.
- `frontend/app/layout.tsx`: mount the authentication provider.
- `frontend/components/auth/login-form.tsx`: replace the placeholder with real login,
  preserve field validation/loading, map API errors, and redirect after success.
- `frontend/playwright.config.ts`: configure the test frontend origin, local HTTP
  cookies, and disable traces/screenshots when live account tests are enabled.
- `frontend/tests/login.spec.ts`: replace the obsolete placeholder submission test
  with a focused rejected-login UI test.

No backend source or configuration changes were required.

## Architecture and API contract

The browser uses the existing login component, a React context provider, a small
authentication client, and native fetch. Next.js route handlers act as a server-side
boundary to the existing Spring REST API. There is no additional state library,
Axios, mock login implementation, public registration, or simulated delay.

| Browser request (same origin, POST) | Spring Boot request |
| --- | --- |
| `/api/auth/login`, email/password JSON | `POST /api/auth/login`, same credentials |
| `/api/auth/session` | `GET /api/auth/me`; on 401, `POST /api/auth/refresh`, then retry `/me` once |
| `/api/auth/logout` | Resolve current session, then `POST /api/auth/logout` with Bearer access token |

Spring's actual login/refresh response contains `accessToken`, `tokenType`,
`expiresAt`, `refreshToken`, `refreshExpiresAt`, and `user`. Refresh accepts
`{ refreshToken }`. `/me` returns `id`, `name`, `email`, `role`, and `enabled`.
The browser receives only the allowlisted profile fields, never the token JSON.

The provider exposes resolving, authenticated, anonymous, error, and logging-out
states, the current verified profile and role, login, restore, and logout. It
restores on mount and rechecks on focus, visibility changes, and every minute while
visible. Request generations prevent stale responses from replacing newer state.

## Credentials and session transport

Both tokens live in host-only, HttpOnly, SameSite=Strict cookies on the Next.js
origin. Cookies have no Max-Age/Expires: they are browser session cookies. There is
no token or profile persistence in localStorage/sessionStorage, and no token or
password logging. Production uses Secure cookies by default. No JWT secret is
needed by the frontend: Spring remains responsible for validation.

All cookie-authenticated handlers require an exact same-origin Origin header and
reject cross-site requests. All authentication responses and upstream fetches use
`no-store`. The Spring API continues to accept explicit Bearer/JSON credentials,
so its existing CSRF and CORS configuration does not need to change. Its allowed
origin defaults to `http://localhost:3000`, with credentials disabled; the browser
does not call Spring directly in this architecture.

Access tokens expire after the backend's configured 15 minutes. Refresh sessions
retain its existing fixed seven-day expiry. Rotation does not extend that expiry.
An expired access credential triggers at most one refresh and one profile retry.
Parallel consumers share a client request; the Next.js process also shares each
refresh request, with a bounded five-second completion grace window for overlapping
tabs. Rotated cookies are saved before profile verification, so a transient profile
outage does not lose the newly rotated refresh token.

Invalid refresh sessions clear both cookies and profile state, and redirect to
login with an expiry message. Temporary backend failures preserve the cookies for
retry. Successful logout revokes the backend session before clearing cookies and
frontend state. Backend outages during logout show a retryable error and preserve
the session rather than claiming it has been revoked.

## Routes, roles, and errors

Successful login verifies `/me`, establishes context state, clears the password
field, and replaces the route with `/dashboard`. An authenticated visit to `/login`
redirects to `/dashboard` after restoration.

The dashboard server checks credentials and `/me`. Requests with no credentials
redirect before rendering. Expired credentials with a refresh cookie enter the
client restoration step. No profile content is shown until authentication resolves.
The checkpoint only displays the name, email, current backend role, and Logout.
Spring enforces session validity, account status, and the current database role on
every authenticated request; frontend guards never replace backend authorization.

The supported backend roles are `OWNER_ADMIN`, `MANAGER`, `ORDER_STAFF`, and
`INVENTORY_STAFF`. No role dashboards or permissions for future modules were built.

Frontend required/email checks remain lightweight. Backend field errors map to
the existing field messages. Incorrect passwords and unknown accounts share
"Email or password is incorrect." Backend/network errors use
"We couldn't reach PantryPal right now. Please try again." Expiry uses
"Your session has expired. Please sign in again." Internal API messages, Java
exceptions, database errors, and token parsing details are never forwarded.

## Environment and local manual test

1. Configure the backend in a terminal with the existing `DB_URL`, `DB_USERNAME`,
   `DB_PASSWORD`, and `JWT_SECRET` environment variables. `DB_URL` must be a Neon
   JDBC PostgreSQL URL with SSL configured. `JWT_SECRET` must be a Base64-encoded
   random key of at least 32 bytes. Use local secrets; never commit them.
2. In `backend`, run `mvn test`, then `mvn spring-boot:run`. If using the wrapper,
   run `./mvnw.cmd test` and `./mvnw.cmd spring-boot:run` in PowerShell.
   Spring does not automatically load a `.env` file.
3. Use an existing active staff account. If an initial administrator is needed,
   use Phase 2's opt-in dev bootstrap with `SPRING_PROFILES_ACTIVE=dev`,
   `PANTRYPAL_BOOTSTRAP_ADMIN=true`, `PANTRYPAL_ADMIN_EMAIL`,
   `PANTRYPAL_ADMIN_PASSWORD` (12–128 characters), and optional
   `PANTRYPAL_ADMIN_NAME`. Disable bootstrap after provisioning. It does not reset
   an existing user's password.
4. Copy `frontend/.env.example` to `frontend/.env.local`. The required frontend
   variables are `API_URL=http://localhost:8080` and
   `APP_ORIGIN=http://localhost:3000`. The upstream URL is server-only; no
   `NEXT_PUBLIC_API_URL` is needed. Production should set the exact public HTTPS
   origin explicitly. `AUTH_COOKIE_SECURE=false` is only an optional override for
   local HTTP testing of a production build.
5. In `frontend`, run `npm.cmd run dev`. Open `http://localhost:3000/login`.
6. Submit empty fields, an invalid email, an unknown account, and an incorrect
   password. Check field messages, the generic credential error, preserved email,
   and the disabled loading button during a real request.
7. Sign in with the active account. Check `/dashboard`, name/email/role, then reload.
   Open `/login` while authenticated and confirm the redirect.
8. In browser storage tools, verify both PantryPal cookies are HttpOnly and
   SameSite=Strict, and that browser storage contains no credentials. Delete only
   the access cookie and reload to exercise refresh; the refresh cookie should
   rotate and the profile remain available. Wait for access expiry to test normal
   expiry as well. Corrupt the refresh cookie and remove access to test expiry UX.
9. Click Logout. Verify both cookies are removed, `/dashboard` redirects to login,
   and browser Back does not restore authenticated content. Repeat in another tab.
10. Stop Spring and try sign-in, session restoration, and logout; check safe errors
    and retry after restart. Check the existing dark/light themes and mobile layout.

## Automated checks and current results

The frontend lint, TypeScript check, and production build passed. The initial
sandboxed build could not download Google fonts; a build with network access passed
without changing the approved fonts.

The final Playwright run completed with **38 passed and 6 skipped** across desktop
and mobile. The skipped cases are the three live-backend scenarios in each browser
project. No hydration errors or unexpected browser console errors were detected by
the existing checks. The first sandboxed run needed its test server stopped to
finish Windows teardown; the final run completed normally with process access.

The final Git diff and added source files were reviewed. `git diff --check` passed;
no credentials, token logging, password logging, or unrelated features were added.

Playwright covers validation, failed-login UI, loading/duplicate prevention,
same-origin enforcement, unauthenticated protected navigation, malformed-session
cleanup, accessibility, themes, responsive sizing, no-JavaScript safety, and
hydration/browser error checks. Focused UI failure cases intercept responses only
inside tests; production authentication always calls the real Spring backend.

The live tests use real Spring authentication and an existing account. After
configuring/running Spring, set `PANTRYPAL_LIVE_AUTH=1`, `PANTRYPAL_TEST_EMAIL`,
and `PANTRYPAL_TEST_PASSWORD` in the test terminal. Run:

```powershell
cd frontend
npm.cmd run build
npm.cmd run test:e2e -- --grep live
```

The test server uses `127.0.0.1:3100`, sets its corresponding frontend origin,
and permits HTTP cookies only for this local test server. Live tests cover valid
login, verified profile/role, login redirect, reload, invalid-access recovery and
refresh rotation, logout, protected navigation afterward, incorrect passwords,
and unknown accounts. Traces/screenshots are disabled for these account tests.
Use a dedicated test account and keep credential environment variables private.

Maven tests were attempted with Java 21 and the existing dependency cache. The
existing `contextLoads` test failed because `DB_URL` is unset; the datasource URL
cannot be resolved to a JDBC URL. Application startup has the same external
configuration dependency. No Neon/backend credentials or running backend were
available in this session, so successful Spring startup and live Neon flows remain
unverified. Backend security was inspected, not weakened to bypass this dependency.

## Remaining limitations and next step

- Complete live verification against Neon with an existing test account before
  considering this phase acceptance-tested. Also check inactive accounts and
  expiry using the configured backend TTLs.
- Refresh coordination is process-local. Before deploying multiple Next.js
  instances, provide shared coordination for rotating refresh sessions. A consumed
  token presented to another process can otherwise cause a safe sign-out.
- A connection failure after the backend consumes a refresh token but before the
  frontend receives the result can require signing in again. Rotation remains
  authoritative at the backend; this phase does not add replay tolerance there.
- Session cookies may survive browser session restoration according to browser
  settings; backend expiry remains authoritative. Remember Me is absent in the
  approved UI, and longer persistent sessions are not defined or invented.
- Self-service password recovery remains future work. Its existing administrator
  help dialog is unchanged.
- Other modules, their route permissions, and future authenticated API requests
  are outside this phase. Extend the server API boundary when those modules exist.

The recommended next step is live Neon acceptance testing. No subsequent PantryPal
feature was started.

import { expect, test } from "@playwright/test";

test("unauthenticated protected navigation redirects to login", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "Welcome back." })).toBeVisible();
});

test("loading prevents duplicate submits and unavailable API errors are safe", async ({ page }) => {
  let requests = 0;
  let release!: () => void;
  const pending = new Promise<void>((resolve) => { release = resolve; });
  // Only the UI error scenario uses an intercepted response. Live login is below.
  await page.route("**/api/auth/login", async (route) => {
    requests++;
    await pending;
    await route.fulfill({ status: 503, json: { message: "We couldn't reach PantryPal right now. Please try again." } });
  });
  await page.goto("/login");
  await page.getByLabel("Email address").fill("staff@example.com");
  await page.getByLabel("Password", { exact: true }).fill("test-only-password");
  await page.getByRole("button", { name: /sign in to your workspace/i }).click();
  await expect(page.getByRole("button", { name: /Signing in/ })).toBeDisabled();
  await page.locator("form").evaluate((form) => {
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  });
  expect(requests).toBe(1);
  release();
  await expect(page.getByRole("status")).toContainText("We couldn't reach PantryPal right now.");
  await expect(page.getByRole("button", { name: /sign in to your workspace/i })).toBeEnabled();
});

test("cookie authentication boundary rejects cross-origin and missing-origin POSTs", async ({ request }) => {
  for (const origin of [undefined, "https://untrusted.example"]) {
    const response = await request.post("/api/auth/session", { headers: origin ? { Origin: origin } : {} });
    expect(response.status()).toBe(403);
  }
});

test("invalid refresh session is cleared safely", async ({ page, context }) => {
  await context.addCookies([{ name: "pantrypal-refresh", value: "invalid", domain: "127.0.0.1", path: "/", httpOnly: true, sameSite: "Strict" }]);
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("status")).toContainText("Your session has expired.");
  expect((await context.cookies()).filter((cookie) => cookie.name.startsWith("pantrypal-"))).toEqual([]);
});

test("live Spring login, authoritative profile, reload, refresh and logout", async ({ page, context }) => {
  test.skip(!process.env.PANTRYPAL_LIVE_AUTH || !process.env.PANTRYPAL_TEST_EMAIL || !process.env.PANTRYPAL_TEST_PASSWORD,
    "Set live auth flag and existing account credentials in the local environment.");
  // Tracing/screenshots can contain credentials: disable artifacts for live accounts.
  const email = process.env.PANTRYPAL_TEST_EMAIL!;
  const password = process.env.PANTRYPAL_TEST_PASSWORD!;
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto("/login");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: /sign in to your workspace/i }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { name: /Welcome,/ })).toBeVisible();
  await expect(page.getByText(email, { exact: true })).toBeVisible();
  await expect(page.getByText(/^Role: /)).toBeVisible();
  const saved = await context.cookies();
  expect(saved.filter((cookie) => cookie.name.startsWith("pantrypal-")).every((cookie) => cookie.httpOnly && cookie.sameSite === "Strict")).toBe(true);
  expect(await page.evaluate(() => document.cookie.includes("pantrypal-access") || document.cookie.includes("pantrypal-refresh"))).toBe(false);
  await page.reload();
  await expect(page.getByRole("heading", { name: /Welcome,/ })).toBeVisible();
  await page.goto("/login");
  await expect(page).toHaveURL(/\/dashboard$/);
  // Corrupt the short-lived access credential to exercise the same 401 recovery path as expiration.
  const access = saved.find((cookie) => cookie.name === "pantrypal-access")!;
  const refresh = (await context.cookies()).find((cookie) => cookie.name === "pantrypal-refresh")!;
  await context.addCookies([{ ...access, value: "expired-or-invalid" }]);
  await page.reload();
  await expect(page.getByRole("heading", { name: /Welcome,/ })).toBeVisible();
  const rotated = (await context.cookies()).find((cookie) => cookie.name === "pantrypal-refresh")!;
  expect(rotated.value !== refresh.value).toBe(true);
  await page.getByRole("button", { name: "Logout", exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  expect((await context.cookies()).filter((cookie) => cookie.name.startsWith("pantrypal-")).length).toBe(0);
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login$/);
  expect(errors).toEqual([]);
});

for (const unknownEmail of [false, true]) {
  test(`live ${unknownEmail ? "unknown email" : "invalid password"} is rejected`, async ({ page }) => {
    test.skip(!process.env.PANTRYPAL_LIVE_AUTH || !process.env.PANTRYPAL_TEST_EMAIL, "Requires live backend and account.");
    await page.goto("/login");
    await page.getByLabel("Email address").fill(unknownEmail ? `missing-${crypto.randomUUID()}@example.invalid` : process.env.PANTRYPAL_TEST_EMAIL!);
    await page.getByLabel("Password", { exact: true }).fill(`invalid-${crypto.randomUUID()}`);
    await page.getByRole("button", { name: /sign in to your workspace/i }).click();
    await expect(page.getByRole("status")).toContainText("Email or password is incorrect.");
    await expect(page).toHaveURL(/\/login$/);
  });
}

import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("root opens the branded login without browser errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page).toHaveURL(/\/login$/);
  await expect(page).toHaveTitle("Sign in | PantryPal");
  await expect(
    page.getByRole("heading", { name: "Welcome back." }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /sign in to your workspace/i }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("validates fields, focuses the first error, and clears corrected errors", async ({
  page,
}) => {
  await page.goto("/login");
  await page
    .getByRole("button", { name: /sign in to your workspace/i })
    .click();
  await expect(
    page.getByText("Enter your email address.", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Enter your password.", { exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("Email address")).toBeFocused();
  await page.getByLabel("Email address").fill("invalid");
  await page.getByLabel("Password", { exact: true }).fill("test-only-password");
  await page
    .getByRole("button", { name: /sign in to your workspace/i })
    .click();
  await expect(page.locator("#email-error")).toHaveText(
    "Enter a valid email address.",
  );
  await page.getByLabel("Email address").fill("staff@example.com");
  await expect(page.getByLabel("Email address")).toHaveAttribute(
    "aria-invalid",
    "false",
  );
  await expect(page.locator(".field-error")).toHaveCount(0);
});

test("password visibility is keyboard operable and preserves the value", async ({
  page,
}) => {
  await page.goto("/login");
  const input = page.getByLabel("Password", { exact: true });
  await input.fill("test-only-password");
  await expect(input).toHaveAttribute("type", "password");
  await page
    .getByRole("button", { name: "Show password", exact: true })
    .focus();
  await page.keyboard.press("Enter");
  await expect(input).toHaveAttribute("type", "text");
  await expect(input).toHaveValue("test-only-password");
  await page.keyboard.press("Space");
  await expect(input).toHaveAttribute("type", "password");
});

test("submission stays on login without sending or persisting credentials", async ({
  page,
  context,
}) => {
  const mutations: string[] = [];
  page.on("request", (request) => {
    if (request.method() !== "GET") mutations.push(request.url());
  });
  await page.goto("/login");
  await page.getByLabel("Email address").fill("staff@example.com");
  await page.getByLabel("Password", { exact: true }).fill("test-only-password");
  await page.getByLabel("Password", { exact: true }).press("Enter");
  await expect(page.getByRole("status")).toContainText(
    "Sign-in is not available yet.",
  );
  await expect(page).toHaveURL(/\/login$/);
  expect(mutations).toEqual([]);
  expect(await context.cookies()).toEqual([]);
  expect(
    await page.evaluate(() => ({
      local: localStorage.length,
      session: sessionStorage.length,
    })),
  ).toEqual({ local: 0, session: 0 });
});

test("help dialogs explain administrator access and restore focus", async ({
  page,
}) => {
  await page.goto("/login");
  const trigger = page.getByRole("button", { name: "Forgot password?" });
  await trigger.click();
  await expect(page.getByRole("dialog")).toContainText(
    "Self-service password reset is not available.",
  );
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await page.getByRole("button", { name: "Ask your administrator" }).click();
  await expect(page.getByRole("dialog")).toContainText(
    "accounts are created by your business owner or administrator",
  );
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("login and help dialog pass automated accessibility checks", async ({
  page,
}) => {
  await page.goto("/login");
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.getByRole("button", { name: "Forgot password?" }).click();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
});

test("reduced motion disables entrance animation and skip link works", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/login");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to sign in" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#login")).toBeFocused();
  expect(
    await page
      .locator(".brand-intro")
      .evaluate((element) => getComputedStyle(element).animationName),
  ).toBe("none");
});

test("reflows without horizontal overflow from small mobile to desktop", async ({
  page,
  isMobile,
}, testInfo) => {
  for (const width of isMobile ? [320, 390] : [768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/login");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await expect(page.getByLabel("Email address")).toBeVisible();
    await expect(
      page.getByRole("img", { name: /ingredients connect/i }),
    ).toBeVisible();
    await page.screenshot({
      path: testInfo.outputPath(`login-${width}.png`),
      fullPage: true,
      animations: "disabled",
    });
  }
});

test("without JavaScript the form cannot accidentally submit credentials", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:3100/login");
  await expect(page.getByLabel("Email address")).toBeDisabled();
  await expect(
    page.getByRole("button", { name: /sign in to your workspace/i }),
  ).toBeDisabled();
  await expect(
    page.getByText("JavaScript is needed to use the sign-in form."),
  ).toBeVisible();
  await context.close();
});

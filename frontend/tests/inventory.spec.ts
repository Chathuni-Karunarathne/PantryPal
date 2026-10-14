import { expect, test } from "@playwright/test";

test.use({ trace: "off", screenshot: "off" });

test("live inventory creation, listing, stock intake and adjustment", async ({ page, request }) => {
  test.skip(!process.env.PANTRYPAL_LIVE_INVENTORY || !process.env.PANTRYPAL_TEST_EMAIL || !process.env.PANTRYPAL_TEST_PASSWORD,
    "Requires an explicitly enabled disposable local backend and temporary manager account.");
  test.setTimeout(90_000);
  const name = `Smoke flour ${crypto.randomUUID()}`;
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));

  const anonymous = await request.get("/api/inventory/ingredients");
  expect(anonymous.status()).toBe(401);
  const crossOrigin = await request.post("/api/inventory/ingredients", {
    headers: { Origin: "https://untrusted.example" }, data: {},
  });
  expect(crossOrigin.status()).toBe(403);

  await page.goto("/login");
  await page.getByLabel("Email address").fill(process.env.PANTRYPAL_TEST_EMAIL!);
  await page.getByLabel("Password", { exact: true }).fill(process.env.PANTRYPAL_TEST_PASSWORD!);
  await page.getByRole("button", { name: /sign in to your workspace/i }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.getByRole("link", { name: "Open inventory" }).click();
  await expect(page.getByRole("heading", { name: "Inventory", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Add ingredient", exact: true })).toBeEnabled();

  await page.getByRole("button", { name: "Add ingredient", exact: true }).click();
  await page.getByLabel("Ingredient name", { exact: true }).fill(name);
  await page.getByLabel("Minimum stock (kg)").fill("3");
  await page.getByLabel("Opening stock (kg)").fill("5");
  await page.getByRole("dialog").getByRole("button", { name: "Add ingredient", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("textbox", { name: "Search ingredients" }).fill(name);
  await expect(page.getByRole("button", { name: `Receive stock for ${name}` })).toBeVisible();

  await page.getByRole("button", { name: `Receive stock for ${name}` }).click();
  await page.getByLabel("Quantity", { exact: true }).fill("1000");
  await page.getByLabel("Unit", { exact: true }).selectOption("G");
  await page.getByRole("button", { name: "Confirm stock intake" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByRole("button", { name: `Adjust stock for ${name}` })).toBeVisible();

  await page.getByRole("button", { name: `Adjust stock for ${name}` }).click();
  await expect(page.getByText("Current stock:")).toContainText("6 kg");
  await page.getByLabel("Quantity", { exact: true }).fill("4");
  await page.getByLabel("Reason for adjustment").fill("Smoke stock count");
  await page.getByRole("button", { name: "Confirm adjustment" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByLabel("Low stock only").check();
  await expect(page.getByRole("button", { name: `Adjust stock for ${name}` })).toBeVisible();
  await page.reload();
  await page.getByRole("textbox", { name: "Search ingredients" }).fill(name);
  await expect(page.getByRole("button", { name: `Adjust stock for ${name}` })).toBeVisible();
  await page.getByRole("button", { name: `Adjust stock for ${name}` }).click();
  await expect(page.getByText("Current stock:")).toContainText("2 kg");
  await page.getByLabel("Quantity", { exact: true }).fill("3");
  await page.getByLabel("Reason for adjustment").fill("Invalid negative balance");
  await page.getByRole("button", { name: "Confirm adjustment" }).click();
  await expect(page.getByRole("alert")).toContainText("make stock negative");
  await page.getByLabel("Quantity", { exact: true }).fill("2");
  await page.getByLabel("Reason for adjustment").fill("Remove temporary smoke stock");
  await page.getByRole("button", { name: "Confirm adjustment" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByRole("button", { name: `Delete ${name}` })).toBeVisible();
  await page.getByRole("button", { name: `Delete ${name}` }).click();
  await page.getByRole("button", { name: "Delete ingredient", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "No ingredients match your filters" })).toBeVisible();

  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(errors).toEqual([]);
  // The same-origin proxy also protects mutations from request contexts without Origin.
  expect((await request.post("/api/inventory/ingredients", { data: {} })).status()).toBe(403);
});

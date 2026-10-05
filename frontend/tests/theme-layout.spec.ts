import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const theme of ["dark", "light"] as const) {
  test(`${theme} theme fits desktop viewports and reflows on mobile`, async ({
    page,
    isMobile,
  }, testInfo) => {
    test.setTimeout(60_000);
    await page.addInitScript(
      (value) => localStorage.setItem("pantrypal-theme", value),
      theme,
    );
    await page.emulateMedia({ reducedMotion: "reduce" });
    const sizes = isMobile
      ? [
          [320, 740],
          [390, 844],
          [390, 420],
        ]
      : [
          [1920, 1080],
          [1440, 900],
          [1366, 768],
          [1280, 720],
          [768, 1024],
        ];

    for (const [width, height] of sizes) {
      await page.setViewportSize({ width, height });
      await page.goto("/login");
      await expect(page.getByLabel("Email address")).toBeEnabled();
      await expect(page.locator("html")).toHaveClass(
        new RegExp(`\\b${theme}\\b`),
      );
      await page.evaluate(() => document.fonts.ready);
      const dimensions = await page.evaluate(() => ({
        width: document.documentElement.scrollWidth,
        height: document.documentElement.scrollHeight,
        clipping: getComputedStyle(document.querySelector(".auth-page")!)
          .overflow,
      }));
      expect(dimensions.width).toBeLessThanOrEqual(width);
      expect(dimensions.clipping).toBe("visible");
      if (!isMobile) expect(dimensions.height).toBeLessThanOrEqual(height);
      else expect(dimensions.height).toBeGreaterThan(height);
      await expect(
        page.getByRole("button", { name: /sign in to your workspace/i }),
      ).toBeVisible();
      await page.screenshot({
        path: testInfo.outputPath(`${theme}-${width}x${height}.png`),
        fullPage: true,
        animations: "disabled",
      });
    }
  });

  test(`${theme} form, errors, help, and theme menu pass accessibility checks`, async ({
    page,
  }) => {
    await page.addInitScript(
      (value) => localStorage.setItem("pantrypal-theme", value),
      theme,
    );
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/login");
    await page
      .getByRole("button", { name: /sign in to your workspace/i })
      .click();
    const audit = () =>
      new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
    expect((await audit()).violations).toEqual([]);
    await page.getByRole("button", { name: "Forgot password?" }).click();
    expect((await audit()).violations).toEqual([]);
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "Choose color theme" }).click();
    expect((await audit()).violations).toEqual([]);
    expect(
      await page
        .locator(".theme-menu")
        .evaluate((el) => getComputedStyle(el).animationName),
    ).toBe("none");
  });
}

test("theme selection supports keyboard, persistence, and live system changes", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/login");
  await expect(page.locator("html")).toHaveClass(/\bdark\b/);
  const toggle = page.getByRole("button", { name: "Choose color theme" });
  await toggle.focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("menuitemradio", { name: "System", exact: true }),
  ).toHaveAttribute("aria-checked", "true");
  await page.keyboard.press("Home");
  await page.keyboard.press("Enter");
  await expect(page.locator("html")).toHaveClass(/\blight\b/);
  await expect(toggle).toBeFocused();
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/\blight\b/);
  expect(
    await page.evaluate(() => localStorage.getItem("pantrypal-theme")),
  ).toBe("light");
  await toggle.click();
  await page.getByRole("menuitemradio", { name: "Dark", exact: true }).click();
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).toHaveClass(/\bdark\b/);
  await toggle.click();
  await page
    .getByRole("menuitemradio", { name: "System", exact: true })
    .click();
  await expect(page.locator("html")).toHaveClass(/\blight\b/);
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.locator("html")).toHaveClass(/\bdark\b/);
  await page.reload();
  expect(
    await page.evaluate(() => localStorage.getItem("pantrypal-theme")),
  ).toBe("system");
});

test("saved theme applies before hydration without console errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.emulateMedia({ colorScheme: "light" });
  await page.addInitScript(() =>
    localStorage.setItem("pantrypal-theme", "dark"),
  );
  let releaseScripts!: () => void;
  const scriptsReady = new Promise<void>((resolve) => {
    releaseScripts = resolve;
  });
  await page.route("**/_next/**/*.js*", async (route) => {
    await scriptsReady;
    await route.continue();
  });
  try {
    await page.goto("/login", { waitUntil: "commit" });
    await expect(page.locator("html")).toHaveClass(/\bdark\b/);
    await expect(page.getByLabel("Email address")).toBeDisabled();
  } finally {
    releaseScripts();
  }
  await expect(page.getByLabel("Email address")).toBeEnabled();
  await expect(page.locator("html")).toHaveClass(/\bdark\b/);
  expect(errors).toEqual([]);
});

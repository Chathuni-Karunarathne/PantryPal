import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 2,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: process.env.PANTRYPAL_LIVE_AUTH ? "off" : "retain-on-failure",
    screenshot: process.env.PANTRYPAL_LIVE_AUTH ? "off" : "only-on-failure",
  },
  projects: [
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 1000 },
      },
    },
    {
      name: "mobile",
      use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" },
    },
  ],
  webServer: {
    command: "npm run start -- --hostname 127.0.0.1 --port 3100",
    env: { APP_ORIGIN: "http://127.0.0.1:3100", AUTH_COOKIE_SECURE: "false", API_URL: process.env.API_URL ?? "http://localhost:8080" },
    url: "http://127.0.0.1:3100/login",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});

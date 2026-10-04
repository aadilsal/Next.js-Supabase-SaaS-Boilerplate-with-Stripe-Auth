import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end smoke tests. Needs local Supabase running (`pnpm db:start`)
 * and .env.local filled in. Run with: pnpm test:e2e
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  // The dev server compiles each route on first visit, which can take several seconds.
  expect: { timeout: 15_000 },
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});

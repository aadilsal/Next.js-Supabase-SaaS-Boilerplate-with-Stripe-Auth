import { expect, test } from "@playwright/test";

test("landing page renders", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: "Get started" }).first()).toBeVisible();
});

test("protected pages redirect to sign-in", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/sign-in\?next=%2Fdashboard/);
});

test("admin panel is hidden from signed-out users", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/sign-in/);
});

test("seeded owner can sign in and reach their dashboard", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByLabel("Email").fill("owner@example.com");
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard\//);
});

test("non-admins get a 404 for /admin", async ({ page }) => {
  await page.goto("/sign-in?next=/admin");
  await page.getByLabel("Email").fill("member@example.com");
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
});

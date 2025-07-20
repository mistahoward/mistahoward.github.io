import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
	test("should navigate to all main pages", async ({ page }) => {
		await page.goto("/");

		// Test navigation to About page
		await page.click("text=About");
		await expect(page).toHaveURL(/.*about/);
		await expect(page.locator("h1")).toContainText("About");

		// Test navigation to Projects page
		await page.click("text=Projects");
		await expect(page).toHaveURL(/.*projects/);
		await expect(page.locator("h1")).toContainText("Projects");

		// Test navigation to PetDex page
		await page.click("text=PetDex");
		await expect(page).toHaveURL(/.*petdex/);
		await expect(page.locator("h1")).toContainText("PetDex");

		// Test navigation to Blogs page
		await page.click("text=Blogs");
		await expect(page).toHaveURL(/.*blogs/);
		await expect(page.locator("h1")).toContainText("Blogs");
	});

	test("should have responsive navigation", async ({ page }) => {
		await page.goto("/");

		// Test desktop navigation
		await expect(page.locator("nav")).toBeVisible();

		// Test mobile navigation
		await page.setViewportSize({ width: 375, height: 667 });
		await expect(page.locator(".navbar-toggler")).toBeVisible();
	});

	test("should toggle theme correctly", async ({ page }) => {
		await page.goto("/");

		const themeToggle = page.locator("[data-testid='theme-toggle']");
		await expect(themeToggle).toBeVisible();

		// Test theme toggle functionality
		await themeToggle.click();
		await expect(page.locator("html")).toHaveAttribute("data-bs-theme", "dark");
	});
}); 
import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('http://localhost:3030');
  await expect(page).toHaveTitle(/E2E/);
});

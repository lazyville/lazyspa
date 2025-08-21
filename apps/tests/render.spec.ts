import { test, expect } from '@playwright/test';

test('home page renders correctly', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Rules & How to Play')).toBeVisible();
  await page.screenshot({ path: 'test-results/home.png', fullPage: true });
});

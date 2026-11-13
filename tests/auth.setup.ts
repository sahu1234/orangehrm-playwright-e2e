import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { AUTH_FILE } from '../playwright.config';

setup('authenticate as Admin and persist storageState', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.login(
    process.env.OHRM_USERNAME ?? 'Admin',
    process.env.OHRM_PASSWORD ?? 'admin123'
  );

  await expect(page).toHaveURL(/\/web\/index\.php\/dashboard\/index/);
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

  await page.context().storageState({ path: AUTH_FILE });
});

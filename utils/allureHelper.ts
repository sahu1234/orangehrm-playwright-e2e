import { Page } from '@playwright/test';
import * as allure from 'allure-js-commons';

export async function attachMilestoneScreenshot(
  page: Page,
  name: string
): Promise<void> {
  const screenshot = await page.screenshot({ fullPage: false });
  await allure.attachment(name, screenshot, 'image/png');
}

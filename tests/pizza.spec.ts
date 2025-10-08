import { test, expect } from 'playwright-test-coverage';

test('home page', async ({ page }) => {
  await page.goto('/');

  expect(await page.title()).toBe('JWT Pizza');
});

test('not found', async ({ page }) => {
  await page.goto('/invalidurl');

  await expect(page.locator('div').filter({ hasText: 'OopsIt looks like we have' }).nth(2)).toBeVisible();
})

test('franchise page', async ({page}) => {
  await page.goto('/');
  await page.getByLabel('Global').getByRole('link', { name: 'Franchise' }).click();
  await expect(page.getByRole('main')).toContainText('Now is the time to get in on the JWT Pizza tsunami. The pizza sells itself. People cannot get enough. Setup your shop and let the pizza fly. Here are all the reasons why you should buy a franchise with JWT Pizza.');
});

test('about', async ({page}) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'About' }).click();
  await expect(page.getByRole('img').nth(3)).toBeVisible();
  await page.getByText('At JWT Pizza, our amazing').click();
});

test('docs', async ({page}) => {
  await page.goto('/docs');
  await expect(page.getByText('JWT Pizza API')).toBeVisible();
});

test('history', async ({page}) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'History' }).click();
  await expect(page.locator('div').filter({ hasText: 'It all started in Mama Ricci\'' }).nth(4)).toBeVisible();
})
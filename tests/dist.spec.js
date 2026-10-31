import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

// The release promise: link one CSS file and one JS file from dist/ and everything works, with no
// build step and no request to another origin. The fixture loads only the built files.
const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

test('a plain page using only dist/ works offline', async ({ page, baseURL }) => {
  const foreign = [];
  const failed = [];
  page.on('request', (r) => { if (!r.url().startsWith(baseURL) && !r.url().startsWith('data:')) foreign.push(r.url()); });
  page.on('requestfailed', (r) => failed.push(r.url()));
  page.on('response', (r) => { if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`); });
  await page.goto('/tests/fixtures/dist.html');
  await page.evaluate(() => document.fonts.ready);

  expect(await page.evaluate(() => window.Vectra?.version)).toBe(version);
  expect(await page.evaluate(() => document.fonts.check('16px "Inter Var"'))).toBe(true);
  const icon = await page.locator('.v-icon').boundingBox();
  expect(icon.width).toBeGreaterThan(0);
  await page.getByRole('button', { name: 'Open' }).click();
  await expect(page.getByRole('dialog', { name: 'It works' })).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).click();
  await expect(page.getByRole('dialog')).toBeHidden();

  expect(foreign).toEqual([]);
  expect(failed).toEqual([]);
});

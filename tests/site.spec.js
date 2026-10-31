import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readdirSync } from 'node:fs';
import { PAGES, WCAG_TAGS, open, describeViolations } from './helpers.js';

// The docs site in site/dist/ (built by tests/global-setup.js). Pages are listed from the sources so the
// list is known before the build runs. The home and button pages also run the full matrix in a11y.spec.js.
const BASE = '/site/dist/';
const SITE_PAGES = [
  '', 'getting-started/', 'changelog/', 'api/', 'patterns/', 'migration/', 'components/',
  ...['tokens', 'colour', 'typography', 'spacing', 'layout', 'utilities', 'icons', 'motion'].map((f) => `foundations/${f}/`),
  ...readdirSync('site/data/components').filter((f) => f.endsWith('.json')).map((f) => `components/${f.slice(0, -5)}/`),
];
const inMatrix = new Set(PAGES.filter((p) => p.path.startsWith(BASE)).map((p) => p.path.slice(BASE.length)));

for (const path of SITE_PAGES) {
  test(`site: ${path || 'home'} loads cleanly and passes axe in tech/dark and editorial/light`, async ({ page }) => {
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', (e) => errors.push(e.message));
    const target = { path: BASE + path, storage: 'vectra' };
    for (const [direction, theme] of inMatrix.has(path) ? [['tech', 'dark']] : [['tech', 'dark'], ['editorial', 'light']]) {
      await open(page, target, { direction, theme });
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('main#main')).toHaveCount(1);
      if (inMatrix.has(path)) continue;
      const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
      expect(describeViolations(violations), `${direction}/${theme}`).toEqual([]);
    }
    expect(errors).toEqual([]);
  });
}

test('site: search finds "dialog" and is keyboard friendly', async ({ page }) => {
  await open(page, { path: BASE, storage: 'vectra' });
  await page.keyboard.press('/');
  const input = page.locator('#site-search');
  await expect(input).toBeFocused();
  await input.pressSequentially('dialog');
  const options = page.locator('#site-results [role="option"]');
  await expect(options.first()).toContainText('Dialog');
  await expect(input).toHaveAttribute('aria-expanded', 'true');
  await expect(input).toHaveAttribute('aria-activedescendant', 'site-result-0');
  await page.keyboard.press('ArrowDown');
  await expect(input).toHaveAttribute('aria-activedescendant', 'site-result-1');
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('Escape');
  await expect(page.locator('#site-results')).toBeHidden();
  await input.press('ArrowDown');
  await input.fill('');
  await input.pressSequentially('dialog');
  await expect(options.first()).toContainText('Dialog');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/site\/dist\/components\/dialog\/$/);
  await expect(page.locator('h1')).toHaveText('Dialog');
});

test('site: copy buttons copy the example markup', async ({ page, context, browserName }) => {
  test.skip(browserName !== 'chromium', 'clipboard permissions are Chromium only in Playwright');
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await open(page, { path: `${BASE}components/button/`, storage: 'vectra' });
  const copy = page.locator('.site-example .v-code-copy').first();
  await copy.click();
  await expect(copy).toContainText('Copied');
  const text = await page.evaluate(() => navigator.clipboard.readText());
  expect(text).toContain('<button class="v-btn v-btn-primary" type="button">Primary</button>');
});

test('site: the inline direction and theme switch changes only its demo', async ({ page }) => {
  await open(page, { path: `${BASE}components/button/`, storage: 'vectra' }, { direction: 'tech', theme: 'dark' });
  const example = page.locator('.site-example').first();
  const frame = page.frameLocator('.site-example >> nth=0 >> iframe');
  await expect(frame.locator('html')).toHaveAttribute('data-direction', 'tech');
  await example.getByRole('radio', { name: 'Editorial' }).check();
  await expect(frame.locator('html')).toHaveAttribute('data-direction', 'editorial');
  await example.getByRole('radio', { name: 'Light' }).check();
  await expect(frame.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('html')).toHaveAttribute('data-direction', 'tech');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  // The second demo still follows the site.
  await expect(page.frameLocator('.site-example >> nth=1 >> iframe').locator('html')).toHaveAttribute('data-direction', 'tech');
});

test('site: demos follow the site theme switch', async ({ page }) => {
  await open(page, { path: `${BASE}components/button/`, storage: 'vectra' }, { direction: 'tech', theme: 'dark' });
  await page.locator('.site-direction').getByRole('radio', { name: 'Glass' }).check();
  await expect(page.frameLocator('.site-example >> nth=0 >> iframe').locator('html')).toHaveAttribute('data-direction', 'glass');
});

test.describe('site without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('pages read, demos render and search falls back to the component index', async ({ page }) => {
    await page.goto(BASE);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('.site-js-only').first()).toBeHidden();
    await expect(page.frameLocator('.site-example >> nth=0 >> iframe').locator('.v-card')).toBeVisible();
    await page.locator('#site-search').fill('dialog');
    await page.locator('#site-search').press('Enter');
    await expect(page).toHaveURL(/\/site\/dist\/components\/\?q=dialog$/);
    await expect(page.locator('h1')).toHaveText('Components');
    await page.getByRole('link', { name: /^Dialog/ }).first().click();
    await expect(page.locator('h1')).toHaveText('Dialog');
    await expect(page.locator('.site-example iframe').first()).toBeVisible();
  });
});

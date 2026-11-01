import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readdirSync, readFileSync } from 'node:fs';
import { PAGES, WCAG_TAGS, open, describeViolations } from './helpers.js';

// The docs site in site/dist/ (built by tests/global-setup.js). Pages are listed from the sources so the
// list is known before the build runs. The home and button pages also run the full matrix in a11y.spec.js.
const BASE = '/site/dist/';
const SITE_PAGES = [
  '', 'getting-started/', 'changelog/', 'theme-builder/', 'quality/', 'api/', 'patterns/', 'migration/', 'components/',
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

test('site: phone tables stack into cards with no horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page, { path: `${BASE}components/tabs/`, storage: 'vectra' }, { direction: 'tech', theme: 'dark' });
  const table = page.locator('#keyboard + .site-table');
  await expect(table.locator('td').first()).toHaveCSS('display', 'block');
  await expect(table.locator('thead')).toHaveCSS('position', 'absolute');
  const label = await table.locator('td').first().evaluate((td) => getComputedStyle(td, '::before').content);
  expect(label).toBe('"Keys"');
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
  // The theme builder and quality page too: the hue sweep scrolls inside its own box.
  for (const path of ['theme-builder/', 'quality/']) {
    await open(page, { path: `${BASE}${path}`, storage: 'vectra' }, { direction: 'glass', theme: 'light' });
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), path).toBeLessThanOrEqual(0);
  }
});

test('site: the width toggle shows a demo at phone and tablet width', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page, { path: `${BASE}components/button/`, storage: 'vectra' });
  const example = page.locator('.site-example').first();
  const frame = example.locator('iframe');
  const full = (await frame.boundingBox()).width;
  expect(full).toBeGreaterThan(700);
  await example.getByRole('radio', { name: 'Phone', exact: true }).check();
  await expect.poll(async () => Math.round((await frame.boundingBox()).width)).toBe(390);
  await example.getByRole('radio', { name: 'Tablet', exact: true }).check();
  await expect.poll(async () => Math.round((await frame.boundingBox()).width)).toBe(768);
  await example.getByRole('radio', { name: 'Desktop', exact: true }).check();
  await expect.poll(async () => Math.round((await frame.boundingBox()).width)).toBe(Math.round(full));
});

/* ---------- Theme builder ---------- */
const BUILDER = { path: `${BASE}theme-builder/`, storage: 'vectra' };
const ready = (page) => expect(page.locator('#tb')).toHaveAttribute('data-ready', '');
const previewVar = (page, name) => page.frameLocator('#tb-frame').locator('html').evaluate((el, n) => getComputedStyle(el).getPropertyValue(n).trim(), name);

test('theme builder: controls change the preview tokens, by mouse and keyboard', async ({ page }) => {
  await open(page, BUILDER, { direction: 'tech', theme: 'dark' });
  await ready(page);
  const html = page.frameLocator('#tb-frame').locator('html');
  await expect(html).toHaveAttribute('data-direction', 'tech');
  await expect(html).toHaveAttribute('data-theme', 'dark');
  const before = await previewVar(page, '--v-accent');
  await page.getByRole('radio', { name: 'Green', exact: true }).check();
  await expect(html).toHaveAttribute('style', /--v-accent-h: 145/);
  expect(await previewVar(page, '--v-accent')).not.toBe(before);
  const wheel = page.getByRole('slider', { name: 'Accent hue' });
  await wheel.focus();
  await page.keyboard.press('ArrowRight');
  await expect(wheel).toHaveAttribute('aria-valuenow', '146');
  await page.keyboard.press('PageDown');
  await expect(wheel).toHaveAttribute('aria-valuenow', '131');
  await expect(html).toHaveAttribute('style', /--v-accent-h: 131/);
  await page.locator('#tb-form input[name="direction"][value="editorial"]').check();
  await page.locator('#tb-form').getByRole('radio', { name: 'Light', exact: true }).check();
  await page.locator('#tb-form').getByRole('radio', { name: 'Round', exact: true }).check();
  await page.locator('#tb-form').getByRole('radio', { name: 'Compact', exact: true }).check();
  await expect(html).toHaveAttribute('data-direction', 'editorial');
  await expect(html).toHaveAttribute('data-theme', 'light');
  await expect(html).toHaveAttribute('data-corners', 'round');
  expect(Number(await previewVar(page, '--v-density'))).toBe(0.85);
  // The site itself is untouched until "Use on this site".
  await expect(page.locator('html')).toHaveAttribute('data-direction', 'tech');
  await page.locator('#tb-apply').click();
  await expect(page.locator('html')).toHaveAttribute('data-direction', 'editorial');
});

test('theme builder: the contrast report passes the defaults and flags a bad override', async ({ page, browserName }) => {
  // Eight loads of the heaviest page in one test: WebKit on the 4-core nightly runner needs more than 30 s.
  test.slow(browserName === 'webkit', 'eight theme builder loads are slow in WebKit');
  for (const direction of ['tech', 'editorial', 'soft', 'glass']) {
    for (const theme of ['light', 'dark']) {
      await open(page, BUILDER, { direction, theme });
      await ready(page);
      await expect(page.locator('#tb-report-status'), `${direction}/${theme}`).toHaveText(/^All \d+ pairings pass WCAG AA\.$/);
    }
  }
  await expect(page.locator('#tb-score')).toHaveAttribute('data-state', 'pass');
  await page.locator('#tb-fine > summary').click();
  const bg = await page.locator('#tb-o-surface').inputValue();
  await page.locator('#tb-o-text-3').fill(bg);
  await expect(page.locator('#tb-report-status')).toHaveText(/^\d+ of \d+ pairings fail WCAG AA\.$/);
  await expect(page.locator('#tb-score')).toHaveAttribute('data-state', 'fail');
  await expect(page.locator('#tb-failures')).toContainText('text-3 on surface');
  await expect(page.locator('#tb-sweep-summary')).toHaveAttribute('data-state', 'fail');
  await page.getByRole('button', { name: 'Reset --v-text-3' }).click();
  await expect(page.locator('#tb-report-status')).toHaveText(/^All \d+ pairings pass/);
});

test('theme builder: the export holds only the changed tokens', async ({ page }) => {
  await open(page, BUILDER, { direction: 'soft', theme: 'light' });
  await ready(page);
  const css = page.locator('#tb-css');
  await expect(css).toContainText('Nothing changed');
  await expect(page.locator('#tb-html')).toHaveText('<html lang="en" data-direction="soft" data-theme="light">');
  await page.getByRole('radio', { name: 'Pink', exact: true }).check();
  await page.locator('#tb-form').getByRole('radio', { name: 'Sharp', exact: true }).check();
  const text = await css.textContent();
  const tokens = [...text.matchAll(/^\s+(--v-[a-z0-9-]+):/gm)].map((m) => m[1]);
  expect(tokens).toContain('--v-accent-h');
  expect(tokens.filter((t) => t.startsWith('--v-radius-')).length).toBeGreaterThan(0);
  expect(tokens.every((t) => t === '--v-accent-h' || t.startsWith('--v-radius-'))).toBe(true);
  expect(text).toContain(':root[data-direction="soft"] {');
  expect(text).toContain('--v-accent-h: 330;');
  // A preset the direction already uses adds nothing: Editorial already sets serif display type.
  await page.locator('#tb-form input[name="direction"][value="editorial"]').check();
  await page.locator('#tb-form').getByRole('radio', { name: 'Serif', exact: true }).check();
  expect(await css.textContent()).not.toContain('--v-font-display');
});

test('theme builder: a share link restores the exact theme', async ({ page, context }) => {
  await open(page, BUILDER, { direction: 'tech', theme: 'light' });
  await ready(page);
  await page.locator('#tb-form input[name="direction"][value="glass"]').check();
  await page.locator('#tb-form').getByRole('radio', { name: 'Dark', exact: true }).check();
  await page.getByRole('radio', { name: 'Violet', exact: true }).check();
  await page.locator('#tb-form').getByRole('radio', { name: 'Spacious', exact: true }).check();
  await page.locator('#tb-fine > summary').click();
  await page.locator('#tb-o-border-control').fill('#a0b0c0');
  const link = await page.locator('#tb-link').inputValue();
  expect(link).toContain('#d=glass&m=dark&h=285&n=spacious&od=border-control.a0b0c0');
  const exported = await page.locator('#tb-css').textContent();
  const other = await context.newPage();
  await other.goto(link);
  await expect(other.locator('#tb')).toHaveAttribute('data-ready', '');
  await expect(other.locator('#tb-form input[name="direction"][value="glass"]')).toBeChecked();
  await expect(other.locator('#tb-form input[name="mode"][value="dark"]')).toBeChecked();
  await expect(other.locator('#tb-form input[name="density"][value="spacious"]')).toBeChecked();
  await expect(other.locator('#tb-css')).toHaveText(exported);
  await expect(other.locator('#tb-link')).toHaveValue(link);
});

test('quality page: the size table covers every budget in build/budgets.json', async ({ page }) => {
  const budgets = JSON.parse(readFileSync('build/budgets.json', 'utf8'));
  await open(page, { path: `${BASE}quality/`, storage: 'vectra' });
  const keys = Object.keys(budgets).filter((k) => !k.startsWith('_'));
  await expect(page.locator('[data-budget-key]')).toHaveCount(keys.length);
  for (const key of keys) {
    const bytes = typeof budgets[key] === 'object' ? budgets[key].raw : budgets[key];
    await expect(page.locator(`[data-budget-key="${key}"]`)).toHaveAttribute('data-budget-bytes', String(bytes));
    await expect(page.locator(`[data-budget-key="${key}"]`)).toHaveText(`${(bytes / 1024).toFixed(2)} KB`);
  }
  await expect(page.locator('#tests + p')).toContainText('tests');
  await expect(page.locator('.qa-built')).toContainText('Built');
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

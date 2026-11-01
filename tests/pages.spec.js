import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';
import { PAGES, EXAMPLE_PAGES, open } from './helpers.js';

// The full example pages (M7.3): structure, form semantics, phone layout, the states that must show without
// JS, and the stacked shell's menu. axe and screenshots for these pages live in a11y.spec.js and visual.spec.js.
const ALL = [...PAGES.filter((p) => ['pages-index', 'page-saas-home', 'page-app-shell'].includes(p.name)), ...EXAMPLE_PAGES];
const bySlug = (slug) => EXAMPLE_PAGES.find((p) => p.slug === slug);
const fileOf = (path) => new URL(`..${path.endsWith('/') ? `${path}index.html` : path}`, import.meta.url);

test.describe('pages', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'Structure and layout checks run in Chromium');

  for (const target of ALL) {
    test(`structure and phone layout: ${target.name}`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await open(page, target, { direction: 'tech', theme: 'dark' });
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('main')).toHaveCount(1);
      await expect(page.locator('a.v-skip-link[href="#main"]')).toHaveCount(1);
      const problems = await page.evaluate(() => {
        const out = [];
        for (const el of document.querySelectorAll('input:not([type="hidden"]), select, textarea')) {
          const named = el.labels?.length || el.getAttribute('aria-label') || el.getAttribute('aria-labelledby');
          if (!named) out.push(`${el.tagName.toLowerCase()}#${el.id || el.name} has no label`);
        }
        // Landmarks of one kind need different names (axe checks this too; this names the culprit).
        const seen = new Set();
        for (const el of document.querySelectorAll('nav, aside, [role="search"]')) {
          const key = `${el.getAttribute('role') ?? el.tagName}:${el.getAttribute('aria-label') ?? el.getAttribute('aria-labelledby') ?? ''}`;
          if (seen.has(key)) out.push(`duplicate landmark ${key}`);
          seen.add(key);
        }
        return out;
      });
      expect(problems).toEqual([]);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, 'no horizontal overflow at 390px').toBe(0);
    });
  }

  test('pages contain no external URLs and no em dashes', () => {
    const hits = [];
    for (const { path } of ALL) {
      const html = readFileSync(fileOf(path), 'utf8');
      for (const url of html.match(/(?:https?:)?\/\/[a-z0-9.-]+\.[a-z]{2,}[^\s"'<>]*/gi) ?? []) hits.push(`${path}: ${url}`);
      if (html.includes('—')) hits.push(`${path}: em dash`);
    }
    expect(hits).toEqual([]);
  });

  test('every system page links home and to its other layout', async ({ page }) => {
    const system = EXAMPLE_PAGES.filter((p) => p.slug.startsWith('system/'));
    expect(system).toHaveLength(18);
    for (const target of system) {
      await page.goto(target.path);
      await expect(page.locator('main a[href$="saas-home.html"], .v-system a[href$="saas-home.html"]').first(), target.slug).toBeVisible();
      await expect(page.getByRole('navigation', { name: 'Layout' }).getByRole('link')).toHaveCount(2);
    }
  });

  test('posting forms carry data-v-validate and the @csrf marker', async ({ page }) => {
    for (const [slug, id] of [['contact', 'contact-form'], ['app/settings-security', 'password-form'], ['app/settings-profile', 'profile-form'], ['app/settings-account', 'account-form']]) {
      await page.goto(bySlug(slug).path);
      const form = page.locator(`form#${id}`);
      await expect(form).toHaveAttribute('data-v-validate', '');
      await expect(form).toHaveAttribute('method', 'post');
      expect(await form.evaluate((f) => [...f.childNodes].some((n) => n.nodeType === 8 && n.data.includes('@csrf')))).toBe(true);
    }
  });

  test('the new password has a strength meter and the right autocomplete', async ({ page }) => {
    await page.goto(bySlug('app/settings-security').path);
    await expect(page.locator('#current-password')).toHaveAttribute('autocomplete', 'current-password');
    await expect(page.locator('#new-password')).toHaveAttribute('autocomplete', 'new-password');
    await expect(page.locator('#confirm-password')).toHaveAttribute('autocomplete', 'new-password');
    const meter = page.locator('#new-password-meter');
    await page.locator('#new-password').fill('slate harbour kettle ninety');
    await expect.poll(() => meter.evaluate((m) => m.value)).toBeGreaterThan(2);
  });

  test('contact form shows the error summary on an empty submit', async ({ page }) => {
    await page.goto(bySlug('contact').path);
    await page.getByRole('button', { name: 'Send message' }).click();
    const summary = page.locator('#contact-form .v-error-summary');
    await expect(summary).toBeFocused();
    await expect(summary.locator('a')).toHaveCount(5);
  });

  test('a bulk action bar follows the row checkboxes', async ({ page }) => {
    await page.goto(bySlug('app/list').path);
    const bar = page.locator('[data-bulk]');
    await expect(bar).toContainText('2 selected');
    await page.getByRole('checkbox', { name: 'Select all customers on this page' }).check();
    await expect(bar).toContainText('8 selected');
    await page.getByRole('checkbox', { name: 'Select all customers on this page' }).uncheck();
    await expect(bar).toBeHidden();
  });

  test('the stacked shell menu works at 390px', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(bySlug('app/stacked').path);
    const menu = page.locator('#app-menu');
    await expect(menu).toBeHidden();
    await expect(page.getByRole('button', { name: 'Account menu' })).toBeVisible();
    await page.getByRole('button', { name: 'Open menu' }).click();
    await expect(menu).toBeVisible();
    await expect(menu.getByRole('link', { name: 'Customers' })).toBeVisible();
    await page.getByRole('button', { name: 'Close menu' }).click();
    await expect(menu).toBeHidden();
  });

  test('the stacked shell shows its links inline on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(bySlug('app/stacked').path);
    await expect(page.locator('#app-menu').getByRole('link', { name: 'Jobs' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Open menu' })).toBeHidden();
  });

  test('grid-fit stretches a few items across the row, grid leaves room', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/examples/pages/');
    const widths = await page.evaluate(() => ['v-grid', 'v-grid v-grid-fit'].map((cls) => {
      const box = document.createElement('div');
      box.className = cls;
      box.style.cssText = 'inline-size: 960px; --v-min: 10rem; --v-gap: 0px';
      box.innerHTML = '<div></div><div></div>';
      document.body.append(box);
      const w = box.firstElementChild.getBoundingClientRect().width;
      box.remove();
      return Math.round(w);
    }));
    expect(widths[0]).toBeLessThan(200);
    expect(widths[1]).toBe(480);
  });

  test('the 429 page shows its countdown without JS', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    for (const slug of ['system/429', 'system/429-illustrated']) {
      await page.goto(bySlug(slug).path);
      await expect(page.getByRole('timer')).toHaveText('You can try again in 60 seconds.');
    }
    await context.close();
  });

  test('the 429 countdown counts down with JS', async ({ page }) => {
    await page.clock.install();
    await page.goto(bySlug('system/429').path);
    await page.clock.runFor(3000);
    await expect(page.getByRole('timer')).toHaveText('You can try again in 57 seconds.');
    await page.clock.runFor(60000);
    await expect(page.getByRole('timer')).toHaveText('You can try again now.');
  });

  test('app states render without JS', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    const families = ['list', 'detail', 'settings-profile', 'settings-account', 'settings-security', 'settings-notifications'];
    for (const family of families) {
      await page.goto(bySlug(`app/${family}-loading`).path);
      const loading = page.locator('[data-page-state="loading"]');
      await expect(loading, family).toHaveAttribute('aria-busy', 'true');
      await expect(loading.locator('.v-skeleton').first(), family).toBeVisible();
      await expect(page.getByRole('status').filter({ hasText: /^Loading / }), family).toHaveCount(1);

      await page.goto(bySlug(`app/${family}-empty`).path);
      await expect(page.locator('[data-page-state="empty"]').locator('.v-empty, .v-alert').first(), family).toBeVisible();

      await page.goto(bySlug(`app/${family}-error`).path);
      const error = page.locator('[data-page-state="error"]');
      await expect(error.getByRole('link', { name: 'Try again' }), family).toBeVisible();
      await expect(error.getByRole('link', { name: 'Try again' }), family).toHaveAttribute('href', `${family}.html`);

      await page.goto(bySlug(`app/${family}`).path);
      await expect(page.getByRole('navigation', { name: 'State' }).getByRole('link')).toHaveCount(4);
    }
    await context.close();
  });
  test('the site header mega menus open, and the current page is marked inside its panel', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(bySlug('features').path);
    const product = page.locator('header .v-mega').first();
    await product.locator('summary').click();
    await expect(product).toHaveAttribute('open', '');
    await expect(product.locator('a[aria-current="page"]')).toHaveText(/Features/);
    await page.keyboard.press('Escape');
    await expect(product).not.toHaveAttribute('open', '');
  });

  test('the app shell has a working notification centre and command palette', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(bySlug('app/settings-billing').path);
    const bell = page.locator('[popovertarget="app-notifications"]');
    await expect(bell).toHaveAttribute('aria-label', 'Notifications, 3 unread');
    await bell.click();
    await page.locator('#app-notifications [data-v-notifications-read]').click();
    await expect(bell).toHaveAttribute('aria-label', 'Notifications');
    await page.keyboard.press('Escape');
    await page.keyboard.press('Control+k');
    await expect(page.locator('#app-commands')).toBeVisible();
    await page.locator('#app-commands [role="combobox"]').fill('api');
    await expect(page.locator('#app-commands [role="option"]:visible')).toHaveCount(1);
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/settings-api\.html$/);
  });
});

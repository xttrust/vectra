import { test, expect } from '@playwright/test';
import { PAGES, open } from './helpers.js';

// Section galleries and the example pages composed from them (M7.1).
const SECTION_PAGES = [
  { name: 'sections-index', path: '/examples/sections/', storage: 'vectra' },
  ...PAGES.filter((p) => p.name.startsWith('sections-') || p.name.startsWith('page-')),
];
const page = (name) => SECTION_PAGES.find((p) => p.name === name);

const VARIANTS = {
  'sections-chrome': ['navbar-simple', 'navbar-cta', 'navbar-center', 'announcement', 'app-sidebar-grouped', 'app-sidebar-rail',
    'app-topbar', 'page-header', 'page-header-tabs', 'footer-simple', 'footer-columns', 'footer-newsletter', 'bottom-bar'],
  'sections-marketing': ['hero-center', 'hero-split', 'hero-shot', 'hero-form', 'logo-cloud', 'features-grid', 'features-alternate',
    'features-bento', 'how-it-works', 'stats', 'testimonial-single', 'testimonial-grid', 'pricing-tiers', 'pricing-toggle', 'faq',
    'cta-banner', 'cta-split', 'newsletter', 'contact', 'team', 'blog-list'],
  'sections-app': ['stats-row', 'list-actions', 'table-toolbar', 'settings-form', 'detail-view', 'empty-first-run',
    'empty-no-results', 'danger-zone'],
};

test.describe('sections', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'Layout checks run in Chromium');

  for (const target of SECTION_PAGES) {
    test(`no horizontal overflow at 390px: ${target.name}`, async ({ page: p }) => {
      await p.setViewportSize({ width: 390, height: 844 });
      for (const direction of ['tech', 'editorial', 'soft', 'glass']) {
        await open(p, target, { direction, theme: 'light' });
        const width = await p.evaluate(() => document.documentElement.scrollWidth);
        expect(width, `${direction}: page is ${width}px wide`).toBeLessThanOrEqual(390);
      }
    });

    test(`loads nothing from another origin: ${target.name}`, async ({ page: p, baseURL }) => {
      const foreign = [];
      p.on('request', (r) => {
        const url = r.url();
        if (!url.startsWith(baseURL) && !url.startsWith('data:')) foreign.push(url);
      });
      await open(p, target);
      await p.waitForLoadState('networkidle');
      expect(foreign).toEqual([]);
      const links = await p.locator('[src], link[href]').evaluateAll((els) => els
        .map((el) => el.getAttribute('src') ?? el.getAttribute('href'))
        .filter((v) => /^(https?:)?\/\//.test(v)));
      expect(links).toEqual([]);
    });
  }

  for (const [name, ids] of Object.entries(VARIANTS)) {
    test(`every variant is labelled: ${name}`, async ({ page: p }) => {
      await open(p, page(name));
      const found = await p.locator('section.ex-variant').evaluateAll((els) => els.map((el) => ({
        id: el.dataset.variant,
        name: el.querySelector('.ex-variant-head h2')?.textContent.trim(),
        classes: el.querySelector('.ex-variant-head .ex-label code')?.textContent.trim(),
        demo: Boolean(el.querySelector('.ex-demo > *')),
      })));
      expect(found.map((v) => v.id)).toEqual(ids);
      for (const v of found) {
        expect(v.name, v.id).toBeTruthy();
        expect(v.classes, v.id).toMatch(/^\.v-/);
        expect(v.demo, v.id).toBe(true);
      }
    });
  }

  for (const name of ['sections-marketing', 'page-saas-home']) {
    test.describe(() => {
      test.use({ javaScriptEnabled: false });

      test(`monthly / yearly toggle works without JS: ${name}`, async ({ page: p }) => {
        await p.goto(page(name).path);
        const billing = p.locator('.v-billing').first();
        const crew = billing.locator('.v-pricing').nth(1);
        await expect(crew.locator('[data-period="monthly"]')).toBeVisible();
        await expect(crew.locator('[data-period="monthly"]')).toContainText('€29');
        await expect(crew.locator('[data-period="yearly"]')).toBeHidden();

        // The radio covers its label text, as in the segmented control.
        await billing.getByRole('radio', { name: 'Yearly' }).click();
        await expect(billing.getByRole('radio', { name: 'Yearly' })).toBeChecked();
        await expect(crew.locator('[data-period="yearly"]')).toBeVisible();
        await expect(crew.locator('[data-period="yearly"]')).toContainText('€24');
        await expect(crew.locator('[data-period="monthly"]')).toBeHidden();
        // Plans with one price show it either way.
        await expect(billing.locator('.v-pricing').first().locator('.v-pricing-amount')).toHaveText('€0');

        await billing.getByRole('radio', { name: 'Monthly' }).click();
        await expect(crew.locator('[data-period="monthly"]')).toBeVisible();
        await expect(crew.locator('[data-period="yearly"]')).toBeHidden();
      });
    });
  }

  test('app shell: sidebar beside the page at desktop width', async ({ page: p }) => {
    await p.setViewportSize({ width: 1440, height: 900 });
    await open(p, page('page-app-shell'));
    const sidebar = p.locator('#app-nav');
    await expect(sidebar).toBeVisible();
    await expect(p.getByRole('button', { name: 'Open navigation' })).toBeHidden();
    const side = await sidebar.boundingBox();
    const main = await p.locator('main').boundingBox();
    expect(side.x + side.width).toBeLessThanOrEqual(main.x + 1);
    await expect(p.locator('.v-bottombar')).toBeHidden();
  });

  test('app shell: at 390px the sidebar becomes a sheet and stays usable', async ({ page: p }) => {
    await p.setViewportSize({ width: 390, height: 844 });
    await open(p, page('page-app-shell'));
    const sidebar = p.locator('#app-nav');
    await expect(sidebar).toBeHidden();
    await expect(p.locator('.v-bottombar')).toBeVisible();

    await p.getByRole('button', { name: 'Open navigation' }).click();
    await expect(sidebar).toBeVisible();
    const box = await sidebar.boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(390);
    const link = sidebar.getByRole('link', { name: 'Invoices' });
    await expect(link).toBeInViewport();
    await link.focus();
    await expect(link).toBeFocused();

    await p.keyboard.press('Escape');
    await expect(sidebar).toBeHidden();
    // The last rows of the page clear the fixed bottom bar.
    await p.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    const bar = await p.locator('.v-bottombar').boundingBox();
    const end = await p.locator('.v-app-page > :last-child').boundingBox();
    expect(end.y + end.height).toBeLessThanOrEqual(bar.y + 1);
  });
});

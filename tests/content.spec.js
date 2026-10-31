import { test, expect } from '@playwright/test';
import { PAGES, open } from './helpers.js';

const target = PAGES.find((p) => p.name === 'content');

test.describe('data and content at phone width', () => {
  test.use({ viewport: { width: 390, height: 844 } });
  test.beforeEach(async ({ page }) => { await open(page, target, { direction: 'tech', theme: 'light' }); });

  test('table wrapper scrolls sideways without widening the page', async ({ page }) => {
    const [docWidth, viewport] = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
    expect(docWidth).toBe(viewport);
    const wrap = page.locator('#table-invoices');
    const { scrollWidth, clientWidth } = await wrap.evaluate((el) => ({ scrollWidth: el.scrollWidth, clientWidth: el.clientWidth }));
    expect(scrollWidth).toBeGreaterThan(clientWidth);
    await wrap.evaluate((el) => { el.scrollLeft = 200; });
    expect(await wrap.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
  });

  test('table wrapper is a labelled, focusable region', async ({ page }) => {
    const wrap = page.locator('#table-invoices');
    await expect(wrap).toHaveAttribute('role', 'region');
    await expect(wrap).toHaveAccessibleName('Invoices, October 2026');
    await wrap.focus();
    await expect(wrap).toBeFocused();
  });
});

test.describe('data and content at desktop width', () => {
  test.use({ viewport: { width: 1280, height: 900 } });
  test.beforeEach(async ({ page }) => { await open(page, target, { direction: 'tech', theme: 'light' }); });

  test('sticky header stays in view when the wrapper scrolls', async ({ page }) => {
    const wrap = page.locator('#table-sticky');
    const head = wrap.locator('thead th').first();
    await wrap.scrollIntoViewIfNeeded();
    await wrap.evaluate((el) => { el.scrollTop = 120; });
    expect(await wrap.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
    const [wrapBox, headBox] = [await wrap.boundingBox(), await head.boundingBox()];
    expect(Math.abs(headBox.y - wrapBox.y)).toBeLessThan(3);
  });

  test('selected row is styled distinctly', async ({ page }) => {
    const bg = (sel) => page.locator(sel).evaluate((el) => getComputedStyle(el).backgroundColor);
    const [selected, plain] = [await bg('#row-selected'), await bg('#row-plain')];
    expect(selected).not.toBe(plain);
    const bar = await page.locator('#row-selected > :first-child').evaluate((el) => getComputedStyle(el).boxShadow);
    expect(bar).not.toBe('none');

    // Ticking a box selects its row with no JS involved.
    await page.locator('#row-plain input').check();
    expect(await bg('#row-plain')).toBe(selected);
  });

  test('scroll area overflows and is reachable and scrollable by keyboard', async ({ page }) => {
    const area = page.locator('#scroll-notes');
    expect(await area.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(true);
    await page.locator('#genres-title').evaluate((el) => el.scrollIntoView());
    // Tab from the element just before it in the DOM order.
    await page.locator('#table-sticky').focus();
    let reached = false;
    for (let i = 0; i < 80 && !reached; i += 1) {
      await page.keyboard.press('Tab');
      reached = await area.evaluate((el) => el === document.activeElement);
    }
    expect(reached).toBe(true);
    await page.keyboard.press('PageDown');
    await expect.poll(() => area.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
  });

  test('prose keeps a readable measure', async ({ page }) => {
    const ch = await page.locator('#prose-sample').evaluate((el) => {
      const probe = document.createElement('span');
      probe.style.cssText = 'position:absolute;visibility:hidden;inline-size:1ch';
      el.append(probe);
      const one = probe.getBoundingClientRect().width;
      probe.remove();
      return el.getBoundingClientRect().width / one;
    });
    expect(ch).toBeGreaterThanOrEqual(45);
    expect(ch).toBeLessThanOrEqual(80);
  });
});

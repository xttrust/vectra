import { test, expect } from '@playwright/test';
import { PAGES, open } from './helpers.js';

// v2.1 components on the plus gallery (examples/plus/).
const target = PAGES.find((p) => p.name === 'plus');
// data-v-menu runs on the split button menus, so a started module means the JS is live.
const ready = (page) => page.waitForFunction(() => window.Vectra || document.querySelector('[data-v-menu]'));

test.describe('split button', () => {
  test.use({ viewport: { width: 1280, height: 900 } });
  test.beforeEach(async ({ page }) => { await open(page, target, { direction: 'tech', theme: 'light' }); await ready(page); });

  test('the two buttons are joined: no gap, inner corners square', async ({ page }) => {
    const [main, toggle] = [page.locator('#split .v-split').first().locator('.v-btn').nth(0), page.locator('#split .v-split').first().locator('.v-btn').nth(1)];
    const [a, b] = [await main.boundingBox(), await toggle.boundingBox()];
    expect(Math.abs(a.x + a.width - b.x)).toBeLessThan(1.5);
    expect(Math.abs(a.height - b.height)).toBeLessThan(1);
    const radii = await main.evaluate((el) => getComputedStyle(el).borderStartEndRadius);
    expect(radii).toBe('0px');
    const toggleRadius = await toggle.evaluate((el) => getComputedStyle(el).borderEndEndRadius);
    expect(toggleRadius).not.toBe('0px');
  });

  test('ArrowDown on the toggle opens the menu on the first item; Escape returns focus', async ({ page }) => {
    const toggle = page.locator('[popovertarget="split-save"][aria-haspopup]');
    await toggle.focus();
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('#split-save')).toBeVisible();
    await expect(page.locator('#split-save .v-menu-item').first()).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.locator('#split-save')).toBeHidden();
    await expect(toggle).toBeFocused();
  });

  test('the main action is its own button and does not open the menu', async ({ page }) => {
    await page.locator('#split .v-split').first().locator('.v-btn').first().click();
    await expect(page.locator('#split-save')).toBeHidden();
  });

  test('radio items in the merge menu switch the checked method', async ({ page }) => {
    await page.click('[popovertarget="split-merge"]');
    await page.locator('#split-merge [role="menuitemradio"]', { hasText: 'Squash' }).click();
    await expect(page.locator('#split-merge [role="menuitemradio"]', { hasText: 'Squash' })).toHaveAttribute('aria-checked', 'true');
    await expect(page.locator('#split-merge [role="menuitemradio"]', { hasText: 'merge commit' })).toHaveAttribute('aria-checked', 'false');
  });
});

test.describe('back to top', () => {
  test.use({ viewport: { width: 1280, height: 700 } });
  test.beforeEach(async ({ page }) => {
    await open(page, target, { direction: 'tech', theme: 'light' });
    // Make the page long enough to scroll well past the threshold whatever the gallery holds.
    await page.evaluate(() => document.querySelector('main').append(Object.assign(document.createElement('div'), { style: 'block-size: 3000px' })));
  });
  const link = (page) => page.locator('.v-back-to-top');

  test('hidden and out of the Tab order at the top of the page (always shown without scroll timelines)', async ({ page }) => {
    const timelines = await page.evaluate(() => CSS.supports('animation-timeline: scroll()'));
    if (timelines) {
      await expect(link(page)).toBeHidden();
      expect(await link(page).evaluate((el) => getComputedStyle(el).visibility)).toBe('hidden');
    } else {
      await expect(link(page)).toBeVisible();
    }
  });

  test('appears after scrolling, sits in the end corner, and following it returns to the top', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 1500));
    await expect(link(page)).toBeVisible();
    const box = await link(page).boundingBox();
    expect(box.x + box.width).toBeGreaterThan(1280 - 60);
    expect(box.y + box.height).toBeGreaterThan(700 - 60);
    expect(box.width).toBeGreaterThanOrEqual(44);
    await page.emulateMedia({ reducedMotion: 'reduce' }); // jump, no smooth scroll to wait for
    await link(page).click();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(200);
    await expect(page).toHaveURL(/#top$/);
  });

  test('right to left: it moves to the left corner', async ({ page }) => {
    await page.evaluate(() => { document.documentElement.dir = 'rtl'; window.scrollTo(0, 1500); });
    const box = await link(page).boundingBox();
    expect(box.x).toBeLessThan(60);
  });
});

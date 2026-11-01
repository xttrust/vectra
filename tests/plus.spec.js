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

test.describe('table of contents', () => {
  test.use({ viewport: { width: 1280, height: 900 } });
  test.beforeEach(async ({ page }) => { await open(page, target, { direction: 'tech', theme: 'light' }); await ready(page); });
  const current = (page) => page.locator('#toc .v-toc a[aria-current="location"]');
  const scrollTo = (page, id) => page.evaluate((i) => {
    const box = document.getElementById('toc-article');
    box.scrollTop = document.getElementById(i).offsetTop - box.offsetTop - 8;
  }, id);

  test('starts on the first part and follows the scroll, nested parts included', async ({ page }) => {
    await expect(current(page)).toHaveText('Install');
    await scrollTo(page, 'toc-tokens');
    await expect(current(page)).toHaveText('Tokens');
    await scrollTo(page, 'toc-setup');
    await expect(current(page)).toHaveText('Set up');
    await expect(current(page)).toHaveCount(1);
  });

  test('the end of the scroller marks the last part even when it is short', async ({ page }) => {
    await page.evaluate(() => { const box = document.getElementById('toc-article'); box.scrollTop = box.scrollHeight; });
    await expect(current(page)).toHaveText('Ship it');
  });

  test('fires v:toc with the link when the section changes', async ({ page }) => {
    const detail = page.evaluate(() => new Promise((resolve) => {
      document.querySelector('#toc .v-toc').addEventListener('v:toc', (e) => resolve(e.detail.link.textContent), { once: true });
    }));
    await scrollTo(page, 'toc-directions');
    expect(await detail).toBe('Directions');
  });
});

test.describe('table of contents without JS', () => {
  test.use({ javaScriptEnabled: false });

  test('links still jump to each part, and nothing is marked', async ({ page }) => {
    await page.goto(target.path);
    await page.click('#toc a[href="#toc-ship"]');
    await expect(page).toHaveURL(/#toc-ship$/);
    await expect(page.locator('#toc [aria-current]')).toHaveCount(0);
  });
});

test.describe('table of contents on a real page', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('the blog post follows the window scroll, and only one link is marked', async ({ page }) => {
    await page.goto('/examples/pages/blog-post.html');
    const current = page.locator('.v-toc a[aria-current]');
    await expect(current).toHaveCount(1);
    await expect(current).toHaveAttribute('aria-current', 'location');
    await page.evaluate(() => window.scrollTo(0, document.getElementById('results').getBoundingClientRect().top + window.scrollY - 40));
    await expect(current).toHaveText('What happened when 40 trades tried it');
    await expect(current).toHaveCount(1);
  });
});

test.describe('context menu', () => {
  test.use({ viewport: { width: 1280, height: 900 } });
  test.beforeEach(async ({ page }) => {
    await open(page, target, { direction: 'tech', theme: 'light' });
    await ready(page);
    await page.locator('#ctx-region').scrollIntoViewIfNeeded(); // mouse coordinates are viewport-relative
  });
  const menu = (page) => page.locator('#ctx-files');
  const region = (page) => page.locator('#ctx-region');

  test('right-click opens it at the pointer with focus on the first item', async ({ page }) => {
    const box = await region(page).boundingBox();
    const [x, y] = [box.x + 60, box.y + 40];
    await page.mouse.click(x, y, { button: 'right' });
    await expect(menu(page)).toBeVisible();
    const m = await menu(page).boundingBox();
    expect(Math.abs(m.x - x)).toBeLessThan(2);
    expect(Math.abs(m.y - y)).toBeLessThan(2);
    await expect(menu(page).locator('.v-menu-item').first()).toBeFocused();
  });

  test('Escape closes it and returns focus to the region', async ({ page }) => {
    const box = await region(page).boundingBox();
    await page.mouse.click(box.x + 40, box.y + 40, { button: 'right' });
    await page.keyboard.press('ArrowDown');
    await expect(menu(page).locator('.v-menu-item').nth(1)).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(menu(page)).toBeHidden();
    await expect(region(page)).toBeFocused();
  });

  test('Shift+F10 on the focused region opens it from the keyboard', async ({ page }) => {
    await region(page).focus();
    await page.keyboard.press('Shift+F10');
    await expect(menu(page)).toBeVisible();
    await expect(menu(page).locator('.v-menu-item').first()).toBeFocused();
    const [m, r] = [await menu(page).boundingBox(), await region(page).boundingBox()];
    expect(m.x).toBeGreaterThanOrEqual(r.x);
    expect(m.y).toBeGreaterThanOrEqual(r.y);
  });

  test('near the viewport edge it flips to stay on screen', async ({ page }) => {
    await page.setViewportSize({ width: 600, height: 500 });
    await region(page).scrollIntoViewIfNeeded();
    await page.evaluate(() => {
      const r = document.getElementById('ctx-region');
      r.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 590, clientY: 490, button: 2 }));
    });
    const m = await menu(page).boundingBox();
    expect(m.x + m.width).toBeLessThanOrEqual(600);
    expect(m.y + m.height).toBeLessThanOrEqual(500);
  });

  test('choosing an item closes it', async ({ page }) => {
    const box = await region(page).boundingBox();
    await page.mouse.click(box.x + 40, box.y + 40, { button: 'right' });
    await menu(page).getByRole('menuitem', { name: /Download/ }).click();
    await expect(menu(page)).toBeHidden();
  });
});

import { test, expect } from '@playwright/test';
import { PAGES, open } from './helpers.js';

// Tabs and navbar behaviour from src/js (data-v-tabs, data-v-nav) on the navigation gallery.
const target = PAGES.find((p) => p.name === 'navigation');
// data-v-nav writes aria-expanded on the toggle, so its presence means the modules have started.
const ready = (page) => expect(page.locator('[popovertarget="nav-main"][aria-expanded]').first()).toBeAttached();

test.describe('tabs', () => {
  test.beforeEach(async ({ page }) => {
    await open(page, target, { direction: 'tech', theme: 'light' });
    await ready(page);
  });

  test('automatic: arrows select and wrap, Home and End jump, disabled tabs are skipped', async ({ page }) => {
    const tab = (n) => page.locator(`#tab-a${n}`);
    const changes = await page.evaluateHandle(() => {
      const seen = [];
      document.addEventListener('v:change', (e) => seen.push(e.detail.tab.id));
      return seen;
    });
    await tab(1).focus();
    await page.keyboard.press('ArrowRight');
    await expect(tab(2)).toBeFocused();
    await expect(tab(2)).toHaveAttribute('aria-selected', 'true');
    await expect(tab(1)).toHaveAttribute('aria-selected', 'false');
    await expect(tab(2)).toHaveAttribute('tabindex', '0');
    await expect(tab(1)).toHaveAttribute('tabindex', '-1');
    await expect(page.locator('#panel-a2')).toBeVisible();
    await expect(page.locator('#panel-a1')).toBeHidden();
    // Billing (tab 4) is disabled, so End and wrapping stop at Settings.
    await page.keyboard.press('End');
    await expect(tab(3)).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(tab(1)).toBeFocused();
    await page.keyboard.press('ArrowLeft');
    await expect(tab(3)).toBeFocused();
    await page.keyboard.press('Home');
    await expect(tab(1)).toBeFocused();
    await expect(page.locator('#panel-a1')).toBeVisible();
    expect(await changes.jsonValue()).toEqual(['tab-a2', 'tab-a3', 'tab-a1', 'tab-a3', 'tab-a1']);
  });

  test('manual: arrows move focus only, Enter and Space select', async ({ page }) => {
    const tab = (n) => page.locator(`#tab-b${n}`);
    await tab(2).focus();
    await page.keyboard.press('ArrowRight');
    await expect(tab(3)).toBeFocused();
    await expect(tab(3)).toHaveAttribute('aria-selected', 'false');
    await expect(page.locator('#panel-b2')).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(tab(3)).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('#panel-b3')).toBeVisible();
    await expect(page.locator('#panel-b2')).toBeHidden();
    await page.keyboard.press('Home');
    await page.keyboard.press(' ');
    await expect(tab(1)).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('#panel-b1')).toBeVisible();
  });

  test('vertical: Up and Down move, Left and Right do nothing', async ({ page }) => {
    const tab = (n) => page.locator(`#tab-c${n}`);
    await tab(1).focus();
    await page.keyboard.press('ArrowRight');
    await expect(tab(1)).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(tab(2)).toBeFocused();
    await expect(page.locator('#panel-c2')).toBeVisible();
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowUp');
    await expect(tab(3)).toBeFocused();
  });

  test('right to left: the arrow keys flip', async ({ page }) => {
    await page.evaluate(() => { document.documentElement.dir = 'rtl'; });
    const tab = (n) => page.locator(`#tab-a${n}`);
    await tab(1).focus();
    await page.keyboard.press('ArrowLeft');
    await expect(tab(2)).toBeFocused();
    await expect(tab(2)).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('ArrowRight');
    await expect(tab(1)).toBeFocused();
  });

  test('a click selects the tab and shows its panel', async ({ page }) => {
    await page.click('#tab-a3');
    await expect(page.locator('#tab-a3')).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('#panel-a3')).toBeVisible();
    await expect(page.locator('#panel-a1')).toBeHidden();
  });
});

test.describe('tabs without JS', () => {
  test.use({ javaScriptEnabled: false });

  test('the server-rendered selection still shows', async ({ page }) => {
    await page.goto(target.path);
    await expect(page.locator('#panel-a1')).toBeVisible();
    await expect(page.locator('#panel-b2')).toBeVisible();
    await expect(page.locator('#panel-a2')).toBeHidden();
  });
});

test.describe('navbar', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test.beforeEach(async ({ page }) => {
    await open(page, target, { direction: 'tech', theme: 'light' });
    await ready(page);
  });

  test('following a same-page link closes the menu and leaves focus with the browser', async ({ page }) => {
    const toggle = page.locator('.v-navbar-toggle[popovertarget="nav-main"]');
    const menu = page.locator('#nav-main');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();
    await expect(menu).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await menu.getByRole('link', { name: 'Projects' }).click();
    await expect(menu).toBeHidden();
    await expect(page).toHaveURL(/#sidenav$/);
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(await menu.evaluate((el) => el.contains(document.activeElement))).toBe(false);
  });

  test('a link handled by a client-side router closes the menu and returns focus to the toggle', async ({ page }) => {
    const toggle = page.locator('.v-navbar-toggle[popovertarget="nav-main"]');
    const menu = page.locator('#nav-main');
    await page.evaluate(() => {
      document.querySelector('#nav-main a[href="#tabs"]').href = '/app/team';
      document.addEventListener('click', (e) => { if (e.target.closest('a')) e.preventDefault(); });
    });
    await toggle.click();
    await menu.getByRole('link', { name: 'Team' }).click();
    await expect(menu).toBeHidden();
    await expect(toggle).toBeFocused();
  });

  test('widening the navbar closes the menu', async ({ page }) => {
    const menu = page.locator('#nav-main');
    await page.click('.v-navbar-toggle[popovertarget="nav-main"]');
    await expect(menu).toBeVisible();
    await page.setViewportSize({ width: 1280, height: 844 });
    await expect.poll(() => menu.evaluate((el) => el.matches(':popover-open'))).toBe(false);
    await expect(menu.getByRole('link', { name: 'Projects' })).toBeVisible();
    await expect(page.locator('.v-navbar-toggle[popovertarget="nav-main"]')).toHaveAttribute('aria-expanded', 'false');
  });
});

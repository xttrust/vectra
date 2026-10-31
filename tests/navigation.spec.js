import { test, expect } from '@playwright/test';
import { PAGES, open } from './helpers.js';

const target = PAGES.find((p) => p.name === 'navigation');

test.describe('navigation', () => {
  test.beforeEach(async ({ page }) => {
    await open(page, target, { direction: 'tech', theme: 'light' });
  });

  test('skip link: off-screen until focused, then moves focus to the main content', async ({ page, browserName }) => {
    const link = page.locator('.v-skip-link');
    const box = async () => link.boundingBox();
    expect((await box()).y + (await box()).height).toBeLessThanOrEqual(0);
    // WebKit leaves links out of the Tab order unless the user opts in (Safari's setting), so focus it directly there.
    if (browserName === 'webkit') await link.focus();
    else await page.keyboard.press('Tab');
    await expect(link).toBeFocused();
    expect((await box()).y).toBeGreaterThanOrEqual(0);
    await page.keyboard.press('Enter');
    await expect(page.locator('#main')).toBeFocused();
  });

  test('skip link: hidden means invisible, shadow included', async ({ page }) => {
    // The corner must render the same with the unfocused skip link as without it.
    const corner = { x: 0, y: 0, width: 320, height: 48 };
    const withLink = await page.screenshot({ clip: corner, animations: 'disabled' });
    await page.addStyleTag({ content: '.v-skip-link { display: none !important; }' });
    const withoutLink = await page.screenshot({ clip: corner, animations: 'disabled' });
    expect(withLink.equals(withoutLink)).toBe(true);
  });

  test('accordion: opening one item closes the other (native details name)', async ({ page }) => {
    const items = page.locator('.v-accordion details');
    await expect(items.nth(0)).toHaveAttribute('open', '');
    await items.nth(1).locator('summary').click();
    await expect(items.nth(1)).toHaveAttribute('open', '');
    await expect(items.nth(0)).not.toHaveAttribute('open', '');
    await expect(page.locator('.v-accordion details[open]')).toHaveCount(1);
  });

  test('aria-current items are styled distinctly from their siblings', async ({ page }) => {
    const style = (sel) => page.locator(sel).first().evaluate((el) => {
      const cs = getComputedStyle(el);
      return `${cs.color}|${cs.fontWeight}|${cs.backgroundColor}|${cs.textDecorationLine}`;
    });
    const pairs = [
      ['#navbar .v-navbar-links a[aria-current="page"]', '#navbar .v-navbar-links a:not([aria-current])'],
      ['.v-sidenav a[aria-current="page"]', '.v-sidenav a:not([aria-current])'],
      ['#paging .v-page[aria-current="page"]', '#paging a.v-page:not([aria-current])'],
      ['.v-breadcrumb [aria-current="page"]', '.v-breadcrumb a'],
      ['.v-bottombar a[aria-current="page"]', '.v-bottombar a:not([aria-current])'],
      ['.v-step[aria-current="step"] .v-step-label', '.v-step:not([aria-current], .v-step-complete) .v-step-label'],
    ];
    for (const [current, other] of pairs) {
      expect(await style(current), current).not.toEqual(await style(other));
    }
  });
});

// Popover menu at phone width, with and without JavaScript.
for (const javaScriptEnabled of [true, false]) {
  test.describe(`navbar mobile menu · JS ${javaScriptEnabled ? 'on' : 'off'}`, () => {
    test.use({ javaScriptEnabled, viewport: { width: 390, height: 844 } });

    test('opens from the toggle and closes from the close button and Escape', async ({ page }) => {
      await page.goto(target.path);
      const menu = page.locator('#nav-main');
      const toggle = page.locator('.v-navbar-toggle[popovertarget="nav-main"]');
      await expect(toggle).toBeVisible();
      await expect(menu).toBeHidden();

      await toggle.click();
      await expect(menu).toBeVisible();
      await expect(menu.getByRole('link', { name: 'Overview' })).toBeVisible();
      await menu.getByRole('button', { name: 'Close menu' }).click();
      await expect(menu).toBeHidden();

      await toggle.click();
      await expect(menu).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(menu).toBeHidden();
    });
  });
}

test('navbar: links are inline and the toggle is hidden in a wide slot', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await open(page, target, { direction: 'tech', theme: 'light' });
  await expect(page.locator('.v-navbar-toggle[popovertarget="nav-main"]')).toBeHidden();
  await expect(page.locator('#nav-main').getByRole('link', { name: 'Projects' })).toBeVisible();
  await expect(page.locator('.v-navbar-toggle[popovertarget="nav-compact"]')).toBeVisible();
});

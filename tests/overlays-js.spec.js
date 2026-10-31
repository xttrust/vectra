import { test, expect } from '@playwright/test';
import { PAGES, open } from './helpers.js';

// Menu, tooltip, dialog hooks and the anchor fallback from src/js, on the overlays gallery.
const target = PAGES.find((p) => p.name === 'overlays');
// data-v-menu takes its items out of the Tab order, so that means the modules have started.
const ready = (page) => expect(page.locator('#menu-project [role="menuitem"]').first()).toHaveAttribute('tabindex', '-1');

test.beforeEach(async ({ page }) => {
  await open(page, target, { direction: 'tech', theme: 'dark' });
  await ready(page);
});

test.describe('menu', () => {
  const item = (page, name) => page.locator('#menu-project').getByRole('menuitem', { name });

  test('opens on the first enabled item; arrows wrap past disabled items; Home and End', async ({ page }) => {
    const menu = page.locator('#menu-project');
    await page.click('#open-menu');
    await expect(item(page, 'Rename')).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(item(page, 'Duplicate')).toBeFocused();
    await page.keyboard.press('ArrowDown');
    // "Share (no access)" is aria-disabled, so focus skips to the first checkable item.
    await expect(menu.getByRole('menuitemcheckbox', { name: 'Show archived' })).toBeFocused();
    await page.keyboard.press('End');
    await expect(item(page, 'Delete')).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(item(page, 'Rename')).toBeFocused();
    await page.keyboard.press('ArrowUp');
    await expect(item(page, 'Delete')).toBeFocused();
    await page.keyboard.press('Home');
    await expect(item(page, 'Rename')).toBeFocused();
  });

  test('ArrowUp on the trigger opens on the last item, ArrowDown on the first', async ({ page }) => {
    const menu = page.locator('#menu-project');
    await page.focus('#open-menu');
    await page.keyboard.press('ArrowUp');
    await expect(menu).toBeVisible();
    await expect(item(page, 'Delete')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
    await expect(page.locator('#open-menu')).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(item(page, 'Rename')).toBeFocused();
  });

  test('typeahead moves to the next item starting with the letter', async ({ page }) => {
    const menu = page.locator('#menu-project');
    await page.click('#open-menu');
    await page.keyboard.press('d');
    await expect(item(page, 'Duplicate')).toBeFocused();
    await page.keyboard.press('d');
    await expect(item(page, 'Delete')).toBeFocused();
    await page.keyboard.press('s');
    await expect(menu.getByRole('menuitemcheckbox', { name: 'Show archived' })).toBeFocused();
    await page.keyboard.press('s');
    await expect(menu.getByRole('menuitemradio', { name: 'Sort by name' })).toBeFocused();
  });

  test('Escape closes and returns focus to the trigger', async ({ page }) => {
    await page.click('#open-menu');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Escape');
    await expect(page.locator('#menu-project')).toBeHidden();
    await expect(page.locator('#open-menu')).toBeFocused();
  });

  test('Tab closes the menu and moves on from the trigger', async ({ page }) => {
    await page.click('#open-menu');
    await page.keyboard.press('Tab');
    await expect(page.locator('#menu-project')).toBeHidden();
    // The next focusable element after the trigger is the no-popover tooltip's Help button.
    await expect(page.locator('[aria-describedby="tip-help"]')).toBeFocused();
  });

  test('an item closes the menu, returns focus and fires v:select', async ({ page }) => {
    const selected = page.evaluate(() => new Promise((resolve) => {
      document.addEventListener('v:select', (e) => resolve(e.detail.item.textContent.trim()), { once: true });
    }));
    await page.click('#open-menu');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    expect(await selected).toMatch(/^Duplicate/);
    await expect(page.locator('#menu-project')).toBeHidden();
    await expect(page.locator('#open-menu')).toBeFocused();
  });

  test('checkable items toggle and keep the menu open; radios are exclusive', async ({ page }) => {
    const menu = page.locator('#menu-project');
    const check = menu.getByRole('menuitemcheckbox', { name: 'Show archived' });
    const byName = menu.getByRole('menuitemradio', { name: 'Sort by name' });
    const byDate = menu.getByRole('menuitemradio', { name: 'Sort by date' });
    await page.click('#open-menu');
    await check.focus();
    await page.keyboard.press('Enter');
    await expect(check).toHaveAttribute('aria-checked', 'false');
    await expect(menu).toBeVisible();
    await page.keyboard.press(' ');
    await expect(check).toHaveAttribute('aria-checked', 'true');
    await byDate.click();
    await expect(byDate).toHaveAttribute('aria-checked', 'true');
    await expect(byName).toHaveAttribute('aria-checked', 'false');
    await expect(menu).toBeVisible();
  });

  test('a disabled item does nothing', async ({ page }) => {
    await page.click('#open-menu');
    await page.locator('#menu-project').getByRole('menuitem', { name: 'Share (no access)' }).click({ force: true });
    await expect(page.locator('#menu-project')).toBeVisible();
  });
});

test.describe('tooltip', () => {
  test('popover form: shows on hover after a delay and stays while the tooltip is hovered', async ({ page }) => {
    const tip = page.locator('#tip-copy');
    const trigger = page.locator('#open-tooltip');
    await trigger.hover();
    await expect(tip).toBeVisible();
    const box = await tip.boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 5 });
    await page.waitForTimeout(400);
    await expect(tip).toBeVisible();
    await page.mouse.move(5, 5);
    await expect(tip).toBeHidden();
  });

  test('popover form: shows on focus; Escape hides it and focus stays', async ({ page }) => {
    const tip = page.locator('#tip-copy');
    const trigger = page.locator('#open-tooltip');
    await trigger.focus();
    await expect(tip).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(tip).toBeHidden();
    await expect(trigger).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(tip).toBeHidden();
  });

  test('no-popover form: Escape hides it while focused, without moving focus', async ({ page }) => {
    const tip = page.locator('#tip-help');
    const trigger = page.locator('[aria-describedby="tip-help"]');
    await trigger.focus();
    await expect(tip).toHaveCSS('opacity', '1');
    await page.keyboard.press('Escape');
    await expect(tip).toBeHidden();
    await expect(trigger).toBeFocused();
    // The next hover or focus shows it again.
    await trigger.blur();
    await trigger.hover();
    await expect(tip).toBeVisible();
    await expect(tip).toHaveCSS('opacity', '1');
  });

  test('popover form: sits above its trigger without showPopover({ source }) (Chrome 125 to 132)', async ({ page }) => {
    test.skip(!(await page.evaluate(() => CSS.supports('position-area', 'top'))), 'this engine has no anchor positioning');
    // Drop the options argument, as browsers before source support do.
    await page.addInitScript(() => {
      const show = HTMLElement.prototype.showPopover;
      HTMLElement.prototype.showPopover = function () { return show.call(this); };
    });
    await page.reload();
    await ready(page);
    await page.evaluate(() => scrollBy(0, document.getElementById('open-tooltip').getBoundingClientRect().top - 300));
    await page.locator('#open-tooltip').focus();
    await expect(page.locator('#tip-copy')).toBeVisible();
    await expect.poll(async () => {
      const p = await page.locator('#tip-copy').boundingBox();
      const t = await page.locator('#open-tooltip').boundingBox();
      const centre = Math.abs(p.x + p.width / 2 - (t.x + t.width / 2)) <= 1;
      const gap = t.y - (p.y + p.height);
      return centre && gap >= 4 && gap <= 9;
    }).toBe(true);
  });

  test('no-popover form: stays shown while the pointer is over the tooltip', async ({ page }) => {
    const tip = page.locator('#tip-help');
    await page.locator('[aria-describedby="tip-help"]').hover();
    await expect(tip).toHaveCSS('opacity', '1');
    const box = await tip.boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 5 });
    await expect(tip).toHaveCSS('opacity', '1');
  });
});

test.describe('dialog hooks', () => {
  test('data-v-dialog-open opens modal, fires v:open and v:close, and focus returns', async ({ page }) => {
    const events = await page.evaluateHandle(() => {
      const seen = [];
      for (const type of ['v:open', 'v:close']) document.addEventListener(type, (e) => seen.push(`${type}:${e.target.id}:${e.detail.returnValue ?? ''}`));
      return seen;
    });
    const opener = page.locator('[data-v-dialog-open="dlg-lg"]');
    await opener.click();
    const dialog = page.locator('#dlg-lg');
    await expect(dialog).toBeVisible();
    expect(await dialog.evaluate((el) => el.matches(':modal'))).toBe(true);
    await dialog.getByRole('button', { name: 'Accept' }).click();
    await expect(dialog).toBeHidden();
    await expect(opener).toBeFocused();
    expect(await events.jsonValue()).toEqual(['v:open:dlg-lg:', 'v:close:dlg-lg:accept']);
  });

  test('data-v-dialog-close closes with its value', async ({ page }) => {
    await page.evaluate(() => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = 'Later';
      b.dataset.vDialogClose = 'later';
      document.querySelector('#dlg-sm .v-dialog-body').append(b);
    });
    await page.click('[data-v-dialog-open="dlg-sm"]');
    await page.locator('#dlg-sm').getByRole('button', { name: 'Later' }).click();
    await expect(page.locator('#dlg-sm')).toBeHidden();
    expect(await page.locator('#dlg-sm').evaluate((el) => el.returnValue)).toBe('later');
    await expect(page.locator('[data-v-dialog-open="dlg-sm"]')).toBeFocused();
  });

  test('a backdrop click closes a dismissable dialog, not an alert dialog', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.click('#open-dialog');
    await expect(page.locator('#dlg-invite')).toBeVisible();
    // A click inside the dialog's own box does not count.
    await page.locator('#dlg-invite .v-dialog-body').click();
    await expect(page.locator('#dlg-invite')).toBeVisible();
    await page.mouse.click(10, 10);
    await expect(page.locator('#dlg-invite')).toBeHidden();
    await expect(page.locator('#open-dialog')).toBeFocused();

    await page.click('[data-v-dialog-open="dlg-alert"]');
    await page.mouse.click(10, 10);
    await expect(page.locator('#dlg-alert')).toBeVisible();
  });

  test('a backdrop click closes a dismissable drawer', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.click('#open-drawer');
    await expect(page.locator('#drw-end')).toBeVisible();
    await page.mouse.click(10, 400);
    await expect(page.locator('#drw-end')).toBeHidden();
  });
});

test.describe('anchor fallback', () => {
  // Simulates a browser without anchor positioning: CSS.supports says no, and position-area is switched off.
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const supports = CSS.supports.bind(CSS);
      CSS.supports = (...args) => (String(args[0]).includes('position-area') ? false : supports(...args));
      document.addEventListener('DOMContentLoaded', () => {
        const style = document.createElement('style');
        style.textContent = '[popover] { position-area: none !important; position-try-fallbacks: none !important; }';
        document.head.append(style);
      });
    });
    await page.setViewportSize({ width: 1000, height: 700 });
    await page.reload();
    await ready(page);
  });

  const near = async (page, popover, trigger) => {
    const p = await page.locator(popover).boundingBox();
    const t = await page.locator(trigger).boundingBox();
    const vw = await page.evaluate(() => document.documentElement.clientWidth);
    const vh = await page.evaluate(() => innerHeight);
    expect(p.x).toBeGreaterThanOrEqual(0);
    expect(p.y).toBeGreaterThanOrEqual(0);
    expect(p.x + p.width).toBeLessThanOrEqual(vw);
    expect(p.y + p.height).toBeLessThanOrEqual(vh);
    return { p, t };
  };

  test('a popover opens just below its trigger, aligned to its start edge', async ({ page }) => {
    await page.locator('#open-popover').scrollIntoViewIfNeeded();
    await page.evaluate(() => scrollBy(0, document.getElementById('open-popover').getBoundingClientRect().top - 150));
    await page.click('#open-popover');
    await expect(page.locator('#pop-storage')).toBeVisible();
    await expect.poll(async () => {
      const { p, t } = await near(page, '#pop-storage', '#open-popover');
      return [Math.round(p.x - t.x), Math.round(p.y - (t.y + t.height))];
    }).toEqual([0, 6]);
  });

  test('a menu near the bottom flips above its trigger and follows scrolling', async ({ page }) => {
    await page.evaluate(() => scrollBy(0, document.getElementById('open-menu').getBoundingClientRect().bottom - innerHeight + 20));
    await page.click('#open-menu');
    await expect(page.locator('#menu-project')).toBeVisible();
    await expect.poll(async () => {
      const { p, t } = await near(page, '#menu-project', '#open-menu');
      return Math.round(t.y - (p.y + p.height));
    }).toBe(6);
    await page.evaluate(() => scrollBy(0, -40));
    await expect.poll(async () => {
      const { p, t } = await near(page, '#menu-project', '#open-menu');
      return Math.round(t.y - (p.y + p.height));
    }).toBe(6);
  });

  test('a tooltip sits centred above its trigger', async ({ page }) => {
    await page.evaluate(() => scrollBy(0, document.getElementById('open-tooltip').getBoundingClientRect().top - 300));
    await page.locator('#open-tooltip').focus();
    await expect(page.locator('#tip-copy')).toBeVisible();
    await expect.poll(async () => {
      const { p, t } = await near(page, '#tip-copy', '#open-tooltip');
      return [Math.abs(Math.round(p.x + p.width / 2 - (t.x + t.width / 2))), Math.round(t.y - (p.y + p.height))];
    }).toEqual([0, 6]);
  });

  test('with anchor positioning the fallback leaves popovers to CSS', async ({ page }) => {
    // A fresh page without the stub, so this engine's real CSS.supports answers.
    const fresh = await page.context().newPage();
    await fresh.goto(target.path);
    await ready(fresh);
    test.skip(!(await fresh.evaluate(() => CSS.supports('position-area', 'top'))), 'this engine has no anchor positioning');
    await fresh.click('#open-popover');
    await expect(fresh.locator('#pop-storage')).toBeVisible();
    await fresh.waitForTimeout(100);
    expect(await fresh.locator('#pop-storage').getAttribute('style')).toBeNull();
  });
});

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { PAGES, WCAG_TAGS, open, describeViolations } from './helpers.js';

// Overlays are native (<dialog>, popover), so everything here works without Vectra's JS.
const target = PAGES.find((p) => p.name === 'overlays');

test.beforeEach(async ({ page }) => {
  await open(page, target, { direction: 'tech', theme: 'dark' });
});

test('popover: opens from its trigger, Escape closes it', async ({ page }) => {
  const popover = page.locator('#pop-storage');
  await page.click('#open-popover');
  await expect(popover).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(popover).toBeHidden();
});

test('popover: clicking outside light-dismisses it', async ({ page }) => {
  const popover = page.locator('#pop-storage');
  await page.click('#open-popover');
  await expect(popover).toBeVisible();
  await page.mouse.click(5, 5);
  await expect(popover).toBeHidden();
});

test('menu: opens from its trigger, an item closes it, Escape closes it', async ({ page }) => {
  const menu = page.locator('#menu-project');
  await page.click('#open-menu');
  await expect(menu).toBeVisible();
  await menu.getByRole('menuitem', { name: 'Rename' }).click();
  await expect(menu).toBeHidden();
  await page.click('#open-menu');
  await expect(menu).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
});

test('tooltip: the popover tooltip opens from its trigger and Escape closes it', async ({ page }) => {
  const tip = page.locator('#tip-copy');
  await page.click('#open-tooltip');
  await expect(tip).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(tip).toBeHidden();
});

test('tooltip: the no-popover form shows on keyboard focus', async ({ page }) => {
  const tip = page.locator('#tip-help');
  await expect(tip).toHaveCSS('opacity', '0');
  await page.locator('[aria-describedby="tip-help"]').focus();
  await expect(tip).toHaveCSS('opacity', '1');
});

test('dialog: opens modal, traps focus, Escape closes and focus returns', async ({ page }) => {
  const opener = page.locator('#open-dialog');
  const dialog = page.locator('#dlg-invite');
  await opener.click();
  await expect(dialog).toBeVisible();
  expect(await dialog.evaluate((el) => el.matches(':modal'))).toBe(true);
  // Tab around more times than there are controls: focus never leaves the dialog.
  for (let i = 0; i < 6; i += 1) {
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => document.activeElement === document.body || Boolean(document.activeElement.closest('#dlg-invite')))).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(opener).toBeFocused();
});

test('dialog: a footer button closes it through <form method="dialog">', async ({ page }) => {
  await page.click('#open-dialog');
  await page.locator('#dlg-invite').getByRole('button', { name: 'Send invite' }).click();
  await expect(page.locator('#dlg-invite')).toBeHidden();
  expect(await page.locator('#dlg-invite').evaluate((el) => el.returnValue)).toBe('send');
});

test('dialog: only the body scrolls in a long dialog', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 600 });
  await page.click('[data-v-dialog-open="dlg-lg"]');
  const body = page.locator('#dlg-lg .v-dialog-body');
  expect(await body.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(true);
  await expect(page.locator('#dlg-lg .v-dialog-footer')).toBeInViewport();
});

test('drawer: open state is a bottom sheet at phone width', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.click('#open-drawer');
  const drawer = page.locator('#drw-end');
  await expect(drawer).toBeVisible();
  await expect(drawer).toBeInViewport({ ratio: 1 });
  const box = await drawer.boundingBox();
  expect(Math.round(box.width)).toBe(390);
  expect(Math.round(box.y + box.height)).toBe(844);
  await page.keyboard.press('Escape');
  await expect(drawer).toBeHidden();
});

test('drawer: the end drawer sits at the inline end on desktop, start in RTL', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.click('#open-drawer');
  let box = await page.locator('#drw-end').boundingBox();
  expect(Math.round(box.x + box.width)).toBe(1280);
  await page.keyboard.press('Escape');
  await page.evaluate(() => { document.documentElement.dir = 'rtl'; });
  await page.click('#open-drawer');
  box = await page.locator('#drw-end').boundingBox();
  expect(Math.round(box.x)).toBe(0);
});

for (const [id, opener] of [['dlg-invite', '#open-dialog'], ['dlg-alert', '[data-v-dialog-open="dlg-alert"]'], ['drw-end', '#open-drawer']]) {
  test(`axe: open ${id}`, async ({ page }) => {
    await page.click(opener);
    await expect(page.locator(`#${id}`)).toBeVisible();
    const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).include(`#${id}`).analyze();
    expect(describeViolations(violations)).toEqual([]);
  });
}

test('axe: open menu', async ({ page }) => {
  await page.click('#open-menu');
  await expect(page.locator('#menu-project')).toBeVisible();
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).include('#menu-project').analyze();
  expect(describeViolations(violations)).toEqual([]);
});

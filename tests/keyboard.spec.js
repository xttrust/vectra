import { test, expect } from '@playwright/test';
import { PAGES, open } from './helpers.js';

const target = PAGES.find((p) => p.name === 'prototype');

test.beforeEach(async ({ page }) => {
  await open(page, target, { direction: 'tech', theme: 'dark' });
});

test('tabs: arrow keys, Home and End move selection and focus', async ({ page }) => {
  await page.focus('#tab-overview');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#tab-activity')).toBeFocused();
  await expect(page.locator('#tab-activity')).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#panel-activity')).toBeVisible();
  await expect(page.locator('#panel-overview')).toBeHidden();
  await page.keyboard.press('End');
  await expect(page.locator('#tab-settings')).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#tab-overview')).toBeFocused();
});

test('menu: opens with focus on the first item, arrows move, Escape closes', async ({ page }) => {
  await page.click('.menu-trigger');
  const menu = page.locator('#options-menu');
  await expect(menu).toBeVisible();
  await expect(menu.getByRole('button', { name: 'Rename' })).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(menu.getByRole('button', { name: 'Duplicate' })).toBeFocused();
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('ArrowUp');
  await expect(menu.getByRole('button', { name: 'Delete' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
});

test('dialog: refuses an invalid email, Escape closes and returns focus', async ({ page }) => {
  const opener = page.locator('[data-dialog-open="invite-dialog"]');
  const dialog = page.locator('#invite-dialog');
  await opener.click();
  await expect(dialog).toBeVisible();
  await page.click('#invite-dialog button[value="send"]');
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(opener).toBeFocused();
});

test('dialog: a valid invite closes it and shows a toast', async ({ page }) => {
  await page.click('[data-dialog-open="invite-dialog"]');
  await page.fill('#invite-email', 'sam@example.com');
  await page.click('#invite-dialog button[value="send"]');
  await expect(page.locator('#invite-dialog')).toBeHidden();
  await expect(page.locator('#toasts')).toContainText('Invite sent to sam@example.com');
});

test('form: errors appear only after the user has typed', async ({ page }) => {
  const error = page.locator('.field:has(#ws-name) .error');
  await expect(error).toBeHidden();
  await page.fill('#ws-name', 'ab');
  await page.locator('#ws-email').focus();
  await expect(error).toBeVisible();
});

test('customizer: Escape closes and returns focus to the trigger', async ({ page }) => {
  const trigger = page.locator('.cz-trigger');
  await trigger.click();
  await expect(page.locator('#customizer')).toBeVisible();
  await expect(page.locator('input[name="cz-direction"][value="tech"]')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('#customizer')).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('customizer: choices sync, persist across reload and reset', async ({ page }) => {
  await page.click('.cz-trigger');
  // Soft rather than Aero: Aero's backdrop blur is very slow under software rendering in CI.
  await page.click('label:has(input[name="cz-direction"][value="soft"])');
  await page.click('label:has(input[name="cz-accent"][value="150"])');
  await expect(page.locator('html')).toHaveAttribute('data-direction', 'soft');
  await expect(page.locator('input[name="direction"][value="soft"]')).toBeChecked();
  await expect(page.locator('html')).toHaveAttribute('style', /--accent-h: 150/);

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-direction', 'soft');
  await expect(page.locator('html')).toHaveAttribute('style', /--accent-h: 150/);

  await page.click('.cz-trigger');
  await page.click('[data-cz-reset]');
  await expect(page.locator('html')).toHaveAttribute('data-direction', 'tech');
  await expect(page.locator('html')).not.toHaveAttribute('style', /--accent-h/);
});

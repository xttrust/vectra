import { test, expect } from '@playwright/test';
import { PAGES, open } from './helpers.js';

const target = PAGES.find((p) => p.name === 'elements');

test.beforeEach(async ({ page }) => {
  await open(page, target, { direction: 'tech', theme: 'light' });
});

test('toggle: a click flips aria-pressed and fires v:change', async ({ page }) => {
  const pin = page.getByRole('button', { name: 'Pin', exact: true });
  await page.evaluate(() => document.addEventListener('v:change', (e) => { window.lastToggle = e.detail; }));
  await pin.click();
  await expect(pin).toHaveAttribute('aria-pressed', 'true');
  expect(await page.evaluate(() => window.lastToggle)).toEqual({ pressed: true });
  await pin.press('Space');
  await expect(pin).toHaveAttribute('aria-pressed', 'false');
});

test('toggle: disabled buttons stay as they are', async ({ page }) => {
  const notes = page.getByRole('button', { name: 'Notes' });
  await notes.dispatchEvent('click');
  await expect(notes).toHaveAttribute('aria-pressed', 'false');
});

test('toggle: single mode keeps at most one pressed', async ({ page }) => {
  await page.evaluate(() => {
    const group = document.querySelector('[aria-label="Text style"]');
    group.dataset.vToggle = 'single';
  });
  const group = page.locator('[aria-label="Text style"]');
  await group.getByRole('button', { name: 'Italic' }).click();
  await expect(group.locator('[aria-pressed="true"]')).toHaveCount(1);
  await expect(group.getByRole('button', { name: 'Italic' })).toHaveAttribute('aria-pressed', 'true');
});

test('shortcut: / focuses the search, but not while typing in another field', async ({ page }) => {
  const search = page.locator('#s-docs');
  await page.locator('body').click({ position: { x: 5, y: 300 } });
  await page.keyboard.press('/');
  await expect(search).toBeFocused();
  await expect(search).toHaveValue('');
  const other = page.locator('input.v-input:not(#s-docs)').first();
  await other.focus();
  await page.keyboard.press('/');
  await expect(other).toBeFocused();
});

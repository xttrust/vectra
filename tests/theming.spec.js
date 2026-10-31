import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { PAGES, WCAG_TAGS, open, describeViolations } from './helpers.js';

// Theming (theme API, toggle, switch, customizer) and feedback (toast, connection, session, save status).
const target = PAGES.find((p) => p.name === 'theming');
const html = (page) => page.locator('html');
const css = (page, prop) => page.evaluate((p) => getComputedStyle(document.documentElement).getPropertyValue(p).trim(), prop);

test.describe('theme', () => {
  test.beforeEach(async ({ page }) => { await open(page, target, { direction: 'tech', theme: 'dark' }); });

  test('set applies direction, mode and tokens, get reports them, and they survive a reload', async ({ page }) => {
    await page.evaluate(() => window.Vectra.theme.set({ direction: 'soft', mode: 'light', accent: 120, corners: 'sharp', density: 'compact', font: 'serif' }));
    const check = async () => {
      await expect(html(page)).toHaveAttribute('data-direction', 'soft');
      await expect(html(page)).toHaveAttribute('data-theme', 'light');
      await expect(html(page)).toHaveAttribute('data-corners', 'sharp');
      expect(await css(page, '--v-accent-h')).toBe('120');
      expect(await css(page, '--v-radius-md')).toBe('2px');
      expect(await css(page, '--v-density')).toBe('0.85');
      expect(await page.evaluate(() => window.Vectra.theme.get())).toEqual({
        direction: 'soft', mode: 'light', accent: '120', corners: 'sharp', density: 'compact', font: 'serif', resolved: 'light',
      });
    };
    await check();
    await page.reload();
    await check();
  });

  test('ignores unknown values and emits v:theme', async ({ page }) => {
    const detail = await page.evaluate(() => new Promise((resolve) => {
      document.addEventListener('v:theme', (e) => resolve(e.detail), { once: true });
      window.Vectra.theme.set({ direction: 'nope', mode: 'light', colour: 'red' });
    }));
    expect(detail.direction).toBe('tech');
    expect(detail.mode).toBe('light');
    expect(detail).not.toHaveProperty('colour');
  });

  test('system mode follows the OS colour scheme as it changes', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.evaluate(() => window.Vectra.theme.set({ mode: 'system' }));
    await expect(html(page)).not.toHaveAttribute('data-theme');
    const bg = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    const lightBg = await bg();
    await expect(page.locator('#demo-toggle')).toHaveAttribute('aria-label', 'Theme: system (light). Switch to light');
    await page.emulateMedia({ colorScheme: 'dark' });
    await expect(page.locator('#demo-toggle')).toHaveAttribute('aria-label', 'Theme: system (dark). Switch to light');
    expect(await page.evaluate(() => window.Vectra.theme.get().resolved)).toBe('dark');
    expect(await bg()).not.toBe(lightBg);
  });

  test('toggle cycles dark, system, light with an accurate name, and every toggle follows', async ({ page }) => {
    const toggle = page.locator('#demo-toggle');
    await expect(toggle).toHaveAttribute('aria-label', 'Theme: dark. Switch to system');
    await toggle.click();
    await expect(html(page)).not.toHaveAttribute('data-theme');
    await expect(toggle).toHaveAttribute('data-mode', 'system');
    await toggle.click();
    await expect(html(page)).toHaveAttribute('data-theme', 'light');
    await expect(toggle).toHaveAttribute('aria-label', 'Theme: light. Switch to dark');
    await expect(page.locator('#hdr-toggle')).toHaveAttribute('aria-label', 'Theme: light. Switch to dark');
    await toggle.click();
    await expect(html(page)).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('[aria-live="polite"]')).toHaveText('Theme: dark');
  });

  test('switch changes data-direction and keeps the other switches in sync', async ({ page }) => {
    await page.locator('#demo-switch input[value="editorial"]').check();
    await expect(html(page)).toHaveAttribute('data-direction', 'editorial');
    await expect(page.locator('#hdr-switch input[value="editorial"]')).toBeChecked();
    await expect(page.locator('#customizer input[name="cz-direction"][value="editorial"]')).toBeChecked();
    await page.locator('#hdr-switch input[value="editorial"]').press('ArrowRight');
    await expect(html(page)).toHaveAttribute('data-direction', 'soft');
  });

  test('customizer: opens with focus on a choice, updates tokens, resets, Escape closes', async ({ page }) => {
    const panel = page.locator('#customizer');
    await page.click('#open-customizer');
    await expect(panel).toBeVisible();
    await expect(panel.locator('input[name="cz-direction"][value="tech"]')).toBeFocused();
    await panel.locator('input[value="sharp"]').check();
    expect(await css(page, '--v-radius-md')).toBe('2px');
    await panel.locator('input[value="spacious"]').check();
    expect(await css(page, '--v-density')).toBe('1.15');
    await panel.locator('input[value="285"]').check();
    expect(await css(page, '--v-accent-h')).toBe('285');
    await expect(panel.locator('#cz-hue')).toHaveValue('285');
    await panel.locator('#cz-hue').fill('40');
    expect(await css(page, '--v-accent-h')).toBe('40');
    await expect(panel.locator('output')).toHaveText('40°');
    await expect(page.locator('#pv-hue')).toHaveValue('40');
    await panel.getByRole('button', { name: 'Reset to defaults' }).click();
    await expect(html(page)).not.toHaveAttribute('data-corners');
    expect(await css(page, '--v-radius-md')).toBe('9px');
    expect(await css(page, '--v-accent-h')).toBe('200');
    await page.keyboard.press('Escape');
    await expect(panel).toBeHidden();
    await expect(page.locator('#open-customizer')).toBeFocused();
  });

  test('axe: open customizer and a live toast', async ({ page }) => {
    await page.click('#open-customizer');
    await page.evaluate(() => window.Vectra.toast('Saved', { action: { label: 'Undo' } }));
    const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).include('#customizer').include('.v-toast-region').analyze();
    expect(describeViolations(violations)).toEqual([]);
  });
});

test.describe('feedback (fake clock)', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.install();
    await open(page, target, { direction: 'tech', theme: 'dark' });
  });

  const live = (page) => page.locator('.v-toast-region .v-toast:not([data-leaving])');

  test('toast: newest first, three visible, the rest wait', async ({ page }) => {
    await page.click('#toast-many');
    await expect(live(page)).toHaveCount(5);
    await expect(live(page).locator('visible=true')).toHaveCount(3);
    await expect(live(page).first()).toHaveText('Toast five');
    await live(page).first().getByRole('button', { name: 'Dismiss' }).click();
    await expect(live(page).locator('visible=true')).toHaveCount(3);
    await expect(live(page).first()).toHaveText('Toast four');
  });

  test('toast: auto-dismisses, and the timer pauses while hovered', async ({ page }) => {
    await page.click('#toast-saved');
    await live(page).first().hover();
    await page.clock.runFor(8000);
    await expect(live(page)).toHaveCount(1);
    await page.mouse.move(5, 5);
    await page.clock.runFor(6000);
    await expect(live(page)).toHaveCount(0);
    await expect(page.locator('.v-toast-region')).toBeHidden();
  });

  test('toast: one with an action stays at least 10 seconds', async ({ page }) => {
    await page.evaluate(() => window.Vectra.toast('Archived', { undo: () => {}, duration: 2000 }));
    await page.clock.runFor(8000);
    await expect(live(page)).toHaveCount(1);
    await page.clock.runFor(3000);
    await expect(live(page)).toHaveCount(0);
  });

  test('toast: the action runs, Escape dismisses a focused toast', async ({ page }) => {
    await page.evaluate(() => {
      window.undone = false;
      window.Vectra.toast('Archived', { undo: () => { window.undone = true; } });
      window.Vectra.toast('Other');
    });
    await live(page).nth(1).getByRole('button', { name: 'Undo' }).click();
    expect(await page.evaluate(() => window.undone)).toBe(true);
    await expect(live(page)).toHaveCount(1);
    await live(page).first().getByRole('button', { name: 'Dismiss' }).focus();
    await page.keyboard.press('Escape');
    await expect(live(page)).toHaveCount(0);
  });

  test('toast: announced politely, danger assertively', async ({ page }) => {
    await page.click('#toast-saved');
    await page.clock.runFor(100);
    await expect(page.locator('[aria-live="polite"]')).toHaveText('Changes saved');
    await page.click('#toast-danger');
    await page.clock.runFor(100);
    await expect(page.locator('[aria-live="assertive"]').last()).toHaveText('Could not send the invite. Retry available.');
  });

  test('session: counts down, announces at minute marks, extends', async ({ page }) => {
    await page.click('#session-warn');
    const dialog = page.getByRole('alertdialog', { name: 'Your session is ending' });
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('.v-session-time')).toHaveText('1:10');
    await expect(dialog.getByRole('button', { name: 'Stay signed in' })).toBeFocused();
    await page.clock.runFor(1000);
    await expect(dialog.locator('.v-session-time')).toHaveText('1:09');
    const announced = dialog.locator('[aria-live]');
    await expect(announced).toHaveText('');
    await page.clock.runFor(9000);
    await expect(announced).toHaveText('1 minute left');
    await page.clock.runFor(5000);
    await expect(announced).toHaveText('1 minute left');
    await dialog.getByRole('button', { name: 'Stay signed in' }).click();
    await expect(dialog).toHaveCount(0);
    await expect(live(page).first()).toHaveText('You are still signed in');
  });

  test('session: Escape extends; expiry switches to signed out', async ({ page }) => {
    await page.click('#session-warn');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('alertdialog')).toHaveCount(0);
    await expect(live(page).first()).toHaveText('You are still signed in');
    await page.click('#session-warn');
    await page.clock.runFor(40_000);
    await expect(page.getByRole('alertdialog').locator('[aria-live]')).toHaveText('30 seconds left');
    await page.clock.runFor(31_000);
    const dialog = page.getByRole('alertdialog', { name: 'You have been signed out' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Sign in' })).toBeFocused();
    await dialog.getByRole('button', { name: 'Sign in' }).click();
    await expect(dialog).toHaveCount(0);
  });

  test('save status: texts, relative time and announcements', async ({ page }) => {
    const status = page.locator('#live-status');
    const set = (state) => page.click(`[data-status="${state}"]`);
    await set('saving');
    await expect(status).toHaveText('Saving…');
    await expect(status).toHaveAttribute('data-state', 'saving');
    await set('saved');
    await expect(status).toHaveText('Saved just now');
    await page.clock.runFor(100);
    await expect(page.locator('[aria-live="polite"]')).toHaveText('Saved');
    await page.clock.runFor(150_000);
    await expect(status).toHaveText('Saved 2 minutes ago');
    await set('failed');
    await expect(status).toHaveText('Not saved, try again');
    await page.clock.runFor(100);
    await expect(page.locator('[aria-live="polite"]')).toHaveText('Not saved, try again');
    await set('offline');
    await expect(status).toHaveText('Offline, will save when back online');
  });
});

test('connection: banner on offline, back online toast, slow notice', async ({ page, context }) => {
  await open(page, target, { direction: 'tech', theme: 'dark' });
  const banner = page.locator('#connection');
  await expect(banner).toBeHidden();
  await context.setOffline(true);
  await expect(banner).toBeVisible();
  await expect(banner).toContainText('You are offline.');
  await expect(banner.locator('[data-v-when="slow"]')).toBeHidden();
  await expect(page.locator('[aria-live="polite"]')).toContainText('You are offline.');
  await context.setOffline(false);
  await expect(banner).toBeHidden();
  await expect(page.locator('.v-toast-region .v-toast').first()).toHaveText('Back online');
  await page.evaluate(() => window.Vectra.connection.slow(true));
  await expect(banner).toBeVisible();
  await expect(banner).toContainText('Slow connection.');
  await page.evaluate(() => window.Vectra.connection.slow(false));
  await expect(banner).toBeHidden();
});

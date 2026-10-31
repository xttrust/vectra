import { test, expect } from '@playwright/test';

// JS core: auto-init, late content, teardown, events, storage and announcements.
test.beforeEach(async ({ page }) => {
  await page.goto('/tests/fixtures/core.html');
  await expect(page.locator('#first')).toHaveAttribute('data-ready', 'true');
});

test('starts modules on elements already in the page, once', async ({ page }) => {
  await page.evaluate(() => window.Vectra.init());
  expect(await page.evaluate(() => window.log)).toEqual(['init:first']);
});

test('starts modules on content added later and stops them when it is removed', async ({ page }) => {
  await page.evaluate(() => {
    document.getElementById('host').innerHTML = '<section><div id="late" data-v-probe></div></section>';
  });
  await expect(page.locator('#late')).toHaveAttribute('data-ready', 'true');
  await page.evaluate(() => document.querySelector('#host section').remove());
  await expect.poll(() => page.evaluate(() => window.log)).toEqual(['init:first', 'init:late', 'destroy:late']);
});

test('a moved element keeps running without a restart', async ({ page }) => {
  await page.evaluate(() => document.getElementById('host').append(document.getElementById('first')));
  await page.waitForTimeout(50);
  expect(await page.evaluate(() => window.log)).toEqual(['init:first']);
});

test('emit fires a bubbling, cancelable v: event', async ({ page }) => {
  const result = await page.evaluate(() => {
    let seen = null;
    document.addEventListener('v:change', (e) => { seen = e.detail; e.preventDefault(); }, { once: true });
    const allowed = window.Vectra.emit(document.getElementById('first'), 'change', { value: 3 });
    return { seen, allowed };
  });
  expect(result).toEqual({ seen: { value: 3 }, allowed: false });
});

test('storage uses the vectra- prefix and survives blocked localStorage', async ({ page }) => {
  expect(await page.evaluate(() => {
    window.Vectra.storage.set('theme', 'dark');
    return [localStorage.getItem('vectra-theme'), window.Vectra.storage.get('theme')];
  })).toEqual(['dark', 'dark']);
  expect(await page.evaluate(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked'); } });
    window.Vectra.storage.set('theme', 'light');
    return window.Vectra.storage.get('theme', 'fallback');
  })).toBe('fallback');
});

test('announce writes to one polite live region and repeats identical messages', async ({ page }) => {
  await page.evaluate(() => window.Vectra.announce('Saved'));
  const region = page.locator('[aria-live="polite"]');
  await expect(region).toHaveText('Saved');
  await page.evaluate(() => window.Vectra.announce('Saved'));
  await expect(region).toHaveCount(1);
  await expect(region).toHaveText('Saved');
});

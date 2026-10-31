import { test, expect } from '@playwright/test';
import { PAGES, open } from './helpers.js';

// States gallery (M7.4): slow loading, type to confirm, countdown, live regions, reflow and long content.
// axe, rendered contrast and the visual matrix come from PAGES in helpers.js.
const target = PAGES.find((p) => p.name === 'states');
const polite = (page) => page.locator('[aria-live="polite"]');

test.describe('state modules (fake clock)', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.install();
    await open(page, target, { direction: 'tech', theme: 'dark' });
    // An installed clock still follows real time; pause it so a slow machine can't add time between steps.
    await page.clock.pauseAt(await page.evaluate(() => Date.now() + 1000));
  });

  test('slow loading: the note appears after the delay, is announced once, and clears when content arrives', async ({ page }) => {
    const note = page.locator('#slow-note');
    await expect(note).toBeHidden();
    await page.click('#slow-start');
    await expect(page.locator('#slow-region')).toHaveAttribute('aria-busy', 'true');
    await page.clock.runFor(2900);
    await expect(note).toBeHidden();
    await page.clock.runFor(200);
    await expect(note).toBeVisible();
    await page.clock.runFor(100);
    await expect(polite(page)).toHaveText('This is taking longer than usual. Your orders are still loading.');
    await page.clock.runFor(5000);
    await expect(page.locator('#slow-region')).toHaveAttribute('aria-busy', 'false');
    await expect(note).toBeHidden();
    await expect(page.locator('#slow-content')).toHaveText('24 orders loaded.');
  });

  test('slow loading: a fast load never shows the note, and a retry starts a new wait', async ({ page }) => {
    const note = page.locator('#slow-note');
    await page.evaluate(() => {
      const region = document.getElementById('slow-region');
      region.setAttribute('aria-busy', 'true');
      setTimeout(() => region.setAttribute('aria-busy', 'false'), 1000);
    });
    await page.clock.runFor(4000);
    await expect(note).toBeHidden();
    await page.click('#slow-start');
    await page.clock.runFor(3100);
    await page.click('#slow-retry');
    await expect(note).toBeHidden();
    await page.clock.runFor(3100);
    await expect(note).toBeVisible();
    await page.click('#slow-cancel');
    await expect(note).toBeHidden();
    await expect(page.locator('#slow-start')).toBeFocused();
  });

  test('countdown: ticks silently, announces at 10 seconds and the end, then swaps to done', async ({ page }) => {
    for (let i = 0; i < 3; i += 1) await page.click('#rate-btn');
    const box = page.locator('#rate-slot [data-v-countdown]');
    await expect(box.locator('[data-v-countdown-time]')).toHaveText('0:15');
    await expect(box).toHaveAttribute('data-state', 'running');
    await page.clock.runFor(3000);
    await expect(box.locator('[data-v-countdown-time]')).toHaveText('0:12');
    await page.clock.runFor(1000);
    // The toasts from the first two tries are the last polite news; no ticks are read.
    await expect(polite(page)).not.toContainText('seconds');
    await page.clock.runFor(1100);
    await expect(polite(page)).toHaveText('10 seconds left');
    await page.clock.runFor(5000);
    await expect(polite(page)).toHaveText('10 seconds left');
    const done = page.evaluate(() => new Promise((resolve) => {
      document.querySelector('#rate-slot [data-v-countdown]').addEventListener('v:done', () => resolve(true), { once: true });
    }));
    await page.clock.runFor(5000);
    expect(await done).toBe(true);
    await expect(box).toHaveAttribute('data-state', 'done');
    await expect(box.locator('[data-v-when="running"]')).toBeHidden();
    await expect(box.locator('[data-v-when="done"]')).toBeVisible();
    await page.clock.runFor(100);
    await expect(polite(page)).toHaveText('You can try again now.');
  });

  test('countdown: minute marks and 30 seconds are announced; changing the attribute restarts it', async ({ page }) => {
    await page.evaluate(() => {
      document.getElementById('retry-slot').insertAdjacentHTML('beforeend', '<p id="cd" data-v-countdown="61"><b data-v-countdown-time></b><span data-v-when="done" hidden>Finished</span></p>');
    });
    const time = page.locator('#cd b');
    await expect(time).toHaveText('1:01');
    await page.clock.runFor(1100);
    await page.clock.runFor(100);
    await expect(polite(page)).toHaveText('1 minute left');
    await page.clock.runFor(30_000);
    await page.clock.runFor(100);
    await expect(polite(page)).toHaveText('30 seconds left');
    await page.evaluate(() => { document.getElementById('cd').dataset.vCountdown = '5'; });
    await expect(time).toHaveText('0:05');
    await page.clock.runFor(5100);
    await expect(page.locator('#cd')).toHaveAttribute('data-state', 'done');
    await expect(page.locator('#cd span')).toBeVisible();
  });

  test('retry: "Retry now" ends the countdown at once', async ({ page }) => {
    await page.click('#retry-start');
    const box = page.locator('#retry-slot [data-v-countdown]');
    await expect(box).toBeFocused();
    await box.getByRole('button', { name: 'Retry now' }).click();
    await expect(box).toHaveAttribute('data-state', 'done');
    await expect(box).toContainText('Connected again.');
  });
});

test.describe('type to confirm', () => {
  test.beforeEach(async ({ page }) => { await open(page, target, { direction: 'tech', theme: 'dark' }); });

  test('enables the destructive button only on an exact match, and resets', async ({ page }) => {
    const input = page.locator('#tc-input');
    const submit = page.locator('#tc-submit');
    await expect(submit).toBeDisabled();
    await input.fill('contrasts');
    await expect(submit).toBeDisabled();
    await input.fill('Contrasts-Records');
    await expect(submit).toBeDisabled();
    await input.fill('contrasts-records-x');
    await expect(submit).toBeDisabled();
    await input.fill('  contrasts-records ');
    await expect(submit).toBeEnabled();
    await input.fill('contrasts-record');
    await expect(submit).toBeDisabled();
    await input.fill('contrasts-records');
    await submit.click();
    await expect(input).toHaveValue('');
    await expect(submit).toBeDisabled();
  });

  test('closing the dialog it sits in resets it', async ({ page }) => {
    await page.evaluate(() => {
      document.body.insertAdjacentHTML('beforeend', '<dialog id="tc2"><form method="dialog"><label for="tc2-i">Name</label><input id="tc2-i" data-v-confirm-text="atlas"><button id="tc2-b">Delete</button></form></dialog>');
      document.getElementById('tc2').showModal();
    });
    const button = page.locator('#tc2-b');
    await expect(button).toBeDisabled();
    await page.locator('#tc2-i').fill('atlas');
    await expect(button).toBeEnabled();
    await page.keyboard.press('Escape');
    await expect(page.locator('#tc2')).toBeHidden();
    await expect(page.locator('#tc2-i')).toHaveValue('');
    await expect(button).toBeDisabled();
  });

  test('without JS the browser blocks the submit through pattern', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto(target.path);
    const input = page.locator('#tc-input');
    await input.fill('wrong');
    expect(await input.evaluate((el) => el.validity.valid)).toBe(false);
    await input.fill('contrasts-records');
    expect(await input.evaluate((el) => el.validity.valid)).toBe(true);
    await context.close();
  });
});

test.describe('live regions and demos', () => {
  test.beforeEach(async ({ page }) => { await open(page, target, { direction: 'tech', theme: 'dark' }); });

  test('statuses are polite; only the rate-limit title interrupts', async ({ page }) => {
    await expect(page.locator('#connection')).toHaveAttribute('role', 'status');
    await expect(page.locator('#more-status')).toHaveAttribute('role', 'status');
    await expect(page.locator('[role="alert"]')).toHaveCount(0);
    for (let i = 0; i < 3; i += 1) await page.click('#rate-btn');
    const alerts = page.locator('[role="alert"]');
    await expect(alerts).toHaveCount(1);
    await expect(alerts).toHaveText('Too many attempts');
    // The ticking time is outside every live region.
    expect(await page.locator('#rate-slot [data-v-countdown-time]').evaluate((el) => Boolean(el.closest('[aria-live], [role="alert"], [role="status"]')))).toBe(false);
  });

  test('load more announces politely, moves focus to the first new row, and ends the list', async ({ page }) => {
    await page.click('#more-btn');
    await expect(page.locator('#more-status')).toHaveText('3 more orders loaded. Showing 6 of 9.');
    await expect(page.locator('#more-list li').nth(3)).toBeFocused();
    await page.click('#more-btn');
    await expect(page.locator('#more-count')).toHaveText("That's all 9 orders.");
    await expect(page.locator('#more-btn')).toBeHidden();
  });

  test('undo restores the archived row in place, with focus on it', async ({ page }) => {
    const rows = page.locator('#undo-list li');
    await rows.nth(1).getByRole('button', { name: 'Archive' }).click();
    await expect(rows).toHaveCount(2);
    await page.locator('.v-toast-region .v-toast').getByRole('button', { name: 'Undo' }).click();
    await expect(rows).toHaveCount(3);
    await expect(rows.nth(1)).toContainText('Bluepeak brochure');
    await expect(rows.nth(1)).toBeFocused();
  });

  test('new posts: the pill takes no room, and showing them moves focus to the first', async ({ page }) => {
    const pill = page.locator('#feed-pill');
    const show = page.locator('#feed-show');
    await expect(show).toBeVisible();
    expect(await pill.evaluate((el) => el.getBoundingClientRect().height)).toBe(0);
    const offset = () => page.evaluate(() => document.querySelector('#feed li').getBoundingClientRect().top - document.getElementById('feed-scroll').getBoundingClientRect().top);
    const before = await offset();
    await show.click();
    await expect(show).toBeHidden();
    await expect(page.locator('#feed li')).toHaveCount(7);
    await expect(page.locator('#feed li').first()).toBeFocused();
    await page.click('#feed-sim');
    await expect(show).toBeVisible();
    expect(await offset()).toBeCloseTo(before, 0);
  });

  test('offline simulation shows the banner, back online hides it with a toast', async ({ page }) => {
    await page.click('#go-offline');
    await expect(page.locator('#connection')).toBeVisible();
    await page.click('#go-online');
    await expect(page.locator('#connection')).toBeHidden();
    await expect(page.locator('.v-toast-region .v-toast').first()).toHaveText('Back online');
  });
});

test.describe('layout', () => {
  test('no horizontal overflow at 320 px, in LTR and RTL', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await open(page, target, { direction: 'tech', theme: 'light' });
    const overflow = () => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(await overflow()).toBeLessThanOrEqual(0);
    await page.click('#flip-dir');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    expect(await overflow()).toBeLessThanOrEqual(0);
  });

  test('the long-content example keeps every part inside its box, at 320 px and on desktop', async ({ page }) => {
    for (const width of [320, 1280]) {
      await page.setViewportSize({ width, height: 800 });
      await open(page, target, { direction: 'editorial', theme: 'light' });
      const outside = await page.locator('#edge-long').evaluate((box) => {
        const edge = box.getBoundingClientRect();
        return [...box.querySelectorAll('*')].filter((el) => {
          const r = el.getBoundingClientRect();
          return r.width && (r.left < edge.left - 1 || r.right > edge.right + 1);
        }).map((el) => `${el.tagName}.${el.className}`);
      });
      expect(outside, `at ${width}px`).toEqual([]);
    }
  });

  test('the edge cases survive even longer strings', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await open(page, target, { direction: 'soft', theme: 'dark' });
    await page.evaluate(() => {
      const long = 'W'.repeat(120);
      for (const el of document.querySelectorAll('#edge-long :is(.v-list-title, .v-list-meta, .v-banner-body, .v-empty-title)')) el.textContent = long;
      document.querySelector('#st-action-failed .v-alert-title').textContent = long;
      document.querySelector('#st-action-failed .v-toast-text').textContent = long;
    });
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
  });
});

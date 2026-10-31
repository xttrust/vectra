import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';
import { PAGES, AUTH_PAGES, open } from './helpers.js';

// Structure, form semantics and layout behaviour of the auth gallery and every flow page.
const gallery = PAGES.find((p) => p.name === 'auth');
const flow = (slug) => AUTH_PAGES.find((p) => p.slug === slug);

for (const target of [gallery, ...AUTH_PAGES]) {
  test(`auth semantics: ${target.name}`, async ({ page }) => {
    await page.goto(target.path);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('main')).toHaveCount(1);

    const problems = await page.evaluate(() => {
      const out = [];
      for (const el of document.querySelectorAll('input:not([type="hidden"]):not([hidden]), select, textarea')) {
        const named = el.labels?.length || el.getAttribute('aria-label') || el.getAttribute('aria-labelledby');
        const who = `${el.tagName.toLowerCase()}#${el.id || el.name}`;
        if (!named) out.push(`${who} has no label`);
        const auto = el.getAttribute('autocomplete');
        if (el.type === 'password' && !['current-password', 'new-password'].includes(auto)) out.push(`${who} autocomplete="${auto}"`);
        if (el.name === 'password_confirmation' && auto !== 'new-password') out.push(`${who} should be new-password`);
        if (el.name === 'code' && (auto !== 'one-time-code' || el.inputMode !== 'numeric')) out.push(`${who} needs one-time-code and inputmode numeric`);
        if (el.name === 'recovery_code' && auto !== 'one-time-code') out.push(`${who} should be one-time-code`);
        if (el.name === 'email' && !['username', 'email', 'username webauthn'].includes(auto)) out.push(`${who} autocomplete="${auto}"`);
      }
      // Every form that posts carries the @csrf marker and the error summary hook.
      for (const form of document.querySelectorAll('form[method="post"]')) {
        if (!form.hasAttribute('data-v-validate')) out.push(`form#${form.id} has no data-v-validate`);
        if (![...form.childNodes].some((n) => n.nodeType === 8 && n.data.includes('@csrf'))) out.push(`form#${form.id} has no @csrf marker`);
      }
      return out;
    });
    expect(problems).toEqual([]);
  });
}

test('auth pages contain no external URLs', () => {
  const hits = [];
  for (const { path } of [gallery, ...AUTH_PAGES]) {
    const file = path.endsWith('/') ? `${path}index.html` : path;
    const html = readFileSync(new URL(`..${file}`, import.meta.url), 'utf8');
    for (const url of html.match(/(?:https?:)?\/\/[a-z0-9.-]+\.[a-z]{2,}[^\s"'<>]*/gi) ?? []) hits.push(`${file}: ${url}`);
  }
  expect(hits).toEqual([]);
});

test('server errors are linked to their fields', async ({ page }) => {
  await page.goto(flow('sign-in/error').path);
  const email = page.locator('#email');
  await expect(email).toHaveAttribute('aria-invalid', 'true');
  await expect(email).toHaveAccessibleDescription('These credentials do not match our records.');
  await expect(page.locator('#email-error')).toBeVisible();
});

test('login validation shows the error summary', async ({ page }) => {
  await page.goto(flow('sign-in/password').path);
  await page.getByRole('button', { name: 'Sign in' }).click();
  const summary = page.locator('.v-error-summary');
  await expect(summary).toBeVisible();
  await expect(summary).toBeFocused();
  await expect(summary.locator('a')).toHaveText(['Enter your email address, like name@example.com.', 'Enter your password.']);
  await page.locator('#email').fill('aoife@westline.ie');
  await expect(summary.locator('a')).toHaveCount(1);
});

test('password toggle reveals and hides the password', async ({ page }) => {
  await page.goto(flow('sign-in/password').path);
  const input = page.locator('#password');
  const toggle = page.getByRole('button', { name: 'Show password' });
  await input.fill('correct horse');
  await toggle.click();
  await expect(input).toHaveAttribute('type', 'text');
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await toggle.click();
  await expect(input).toHaveAttribute('type', 'password');
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
});

for (const slug of ['sign-in/password', 'sign-up/single', 'layouts/split-panel']) {
  test(`split layout stacks at 390px: ${slug}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, flow(slug), { direction: 'tech', theme: 'dark' });
    const main = await page.locator('.v-auth-main').boundingBox();
    const aside = await page.locator('.v-auth-aside').boundingBox();
    expect(Math.abs(main.x - aside.x)).toBeLessThan(1);
    expect(main.width).toBeGreaterThan(380);
    expect(aside.y + aside.height <= main.y + 1 || main.y + main.height <= aside.y + 1).toBe(true);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBe(0);
  });
}

test('split layout sits side by side at 1440px', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(flow('sign-in/password').path);
  const main = await page.locator('.v-auth-main').boundingBox();
  const aside = await page.locator('.v-auth-aside').boundingBox();
  expect(aside.x).toBeGreaterThanOrEqual(main.x + main.width - 1);
});

test('dialog layout opens, traps focus and closes', async ({ page }) => {
  await page.goto(gallery.path);
  const opener = page.getByRole('button', { name: 'Open the sign-in dialog' });
  const dialog = page.locator('#sign-in-dialog');
  await opener.click();
  await expect(dialog).toBeVisible();
  // showModal() makes the page inert: Tab cycles the dialog's controls, with one stop in the browser's own
  // UI (activeElement is <body> there). Focus must never land on page content behind the dialog.
  const seen = new Set();
  for (let i = 0; i < 20; i += 1) {
    const where = await page.evaluate(() => {
      const el = document.activeElement;
      return el === document.body ? 'browser' : el.closest('#sign-in-dialog') ? `${el.tagName}${el.id}${el.className}` : 'outside';
    });
    expect(where).not.toBe('outside');
    seen.add(where);
    await page.keyboard.press('Tab');
  }
  expect(seen.size).toBeGreaterThan(5);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(opener).toBeFocused();
});

test('dialog page opens the sign-in dialog on arrival', async ({ page }) => {
  await page.goto(flow('layouts/dialog').path);
  await expect(page.getByRole('dialog', { name: 'Welcome back' })).toBeVisible();
});

import { test, expect } from '@playwright/test';
import { DIRECTIONS, THEMES, PAGES, open } from './helpers.js';

// Forms behaviour: error timing, label targets, keyboard, forced colours and placeholder contrast.
const forms = PAGES.find((p) => p.name === 'forms');

test('a fresh field shows no error', async ({ page }) => {
  await open(page, forms);
  await expect(page.locator('#f-email-error')).toBeHidden();
  expect(await page.locator('#f-email').evaluate((el) => el.matches(':user-invalid'))).toBe(false);
});

test('typing invalid input and leaving the field shows the error', async ({ page }) => {
  await open(page, forms);
  const email = page.locator('#f-email');
  await email.fill('not-an-email');
  await expect(page.locator('#f-email-error')).toBeHidden();
  await email.press('Tab');
  await expect(page.locator('#f-email-error')).toBeVisible();
  // Thicker border as well as colour: the inset ring is drawn.
  expect(await email.evaluate((el) => getComputedStyle(el).boxShadow)).not.toBe('none');
  await email.fill('name@example.com');
  await expect(page.locator('#f-email-error')).toBeHidden();
});

test('clicking a label toggles its control', async ({ page }) => {
  await open(page, forms);
  const checkbox = page.getByRole('checkbox', { name: 'New reviews' });
  await expect(checkbox).not.toBeChecked();
  await page.getByText('New reviews', { exact: true }).click();
  await expect(checkbox).toBeChecked();

  await page.getByText('Yearly', { exact: true }).click();
  await expect(page.getByRole('radio', { name: /Yearly/ })).toBeChecked();

  const toggle = page.getByRole('switch', { name: 'Auto-reminders' });
  await page.getByText('Auto-reminders', { exact: true }).click();
  await expect(toggle).toBeChecked();
});

test('Space toggles a switch', async ({ page }) => {
  await open(page, forms);
  const toggle = page.getByRole('switch', { name: 'Auto-reminders' });
  await toggle.focus();
  await page.keyboard.press('Space');
  await expect(toggle).toBeChecked();
  await page.keyboard.press('Space');
  await expect(toggle).not.toBeChecked();
});

test.describe('forced colours', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'forced-colors emulation is Chromium only');

  for (const direction of DIRECTIONS) {
    test(`drawn controls stay visible · ${direction}`, async ({ page }) => {
      await page.emulateMedia({ forcedColors: 'active' });
      await open(page, forms, { direction, theme: 'light' });
      const result = await page.evaluate(() => {
        const page = getComputedStyle(document.body).backgroundColor;
        const style = (sel) => {
          const cs = getComputedStyle(document.querySelector(sel));
          return { border: cs.borderTopColor, bg: cs.backgroundColor };
        };
        const pairs = {
          checkbox: ['.v-checkbox:not(:checked, :indeterminate, :disabled)', '.v-checkbox:checked:not(:disabled)'],
          radio: ['.v-radio:not(:checked, :disabled)', '.v-radio:checked:not(:disabled)'],
          switch: ['.v-switch:not(:checked, :disabled)', '.v-switch:checked:not(:disabled)'],
        };
        return Object.entries(pairs).map(([name, [off, on]]) => ({ name, page, off: style(off), on: style(on) }));
      });
      for (const { name, page: pageBg, off, on } of result) {
        expect(off.border, `${name} border`).not.toBe('rgba(0, 0, 0, 0)');
        expect(off.border, `${name} border vs page`).not.toBe(pageBg);
        expect(on.bg, `${name} checked differs from unchecked`).not.toBe(off.bg);
      }
    });
  }
});

// Placeholders are pseudo-elements, so rendered.spec.js cannot reach them. Same method: hide the
// placeholder, screenshot the field and compare its colour with what is actually behind it.
test.describe('placeholder contrast', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'Rendered contrast runs in Chromium only');

  for (const direction of DIRECTIONS) {
    for (const theme of THEMES) {
      test(`placeholder contrast · ${direction} · ${theme}`, async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 900 });
        await open(page, forms, { direction, theme });
        const fields = page.locator('.v-input[placeholder]:placeholder-shown');
        const count = await fields.count();
        expect(count).toBeGreaterThan(4);
        const colors = await fields.evaluateAll((els) => els.map((el) => getComputedStyle(el, '::placeholder').color));
        await page.addStyleTag({ content: '.v-input::placeholder { color: transparent !important; }' });
        const failures = [];
        for (let i = 0; i < count; i += 1) {
          const png = (await fields.nth(i).screenshot({ animations: 'disabled' })).toString('base64');
          const ratio = await page.evaluate(async ([data, color]) => {
            const img = await createImageBitmap(await (await fetch(`data:image/png;base64,${data}`)).blob());
            const canvas = new OffscreenCanvas(img.width, img.height);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const lin = (v) => { const c = v / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
            const lum = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
            const x0 = Math.floor(img.width * 0.1); const x1 = Math.ceil(img.width * 0.9);
            const y0 = Math.floor(img.height * 0.3); const y1 = Math.ceil(img.height * 0.7);
            const px = ctx.getImageData(x0, y0, Math.max(1, x1 - x0), Math.max(1, y1 - y0)).data;
            let lo = 1; let hi = 0;
            for (let p = 0; p < px.length; p += 4) { const l = lum(px[p], px[p + 1], px[p + 2]); lo = Math.min(lo, l); hi = Math.max(hi, l); }
            const c = new OffscreenCanvas(1, 1).getContext('2d');
            c.fillStyle = color;
            c.fillRect(0, 0, 1, 1);
            const [r, g, b] = c.getImageData(0, 0, 1, 1).data;
            const f = lum(r, g, b);
            const pair = (a, z) => (Math.max(a, z) + 0.05) / (Math.min(a, z) + 0.05);
            return Math.min(pair(f, lo), pair(f, hi));
          }, [png, colors[i]]);
          if (ratio < 4.5) failures.push(`${await fields.nth(i).getAttribute('id')}: ${ratio.toFixed(2)} < 4.5`);
        }
        expect(failures).toEqual([]);
      });
    }
  }
});

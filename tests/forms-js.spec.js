import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { PAGES, WCAG_TAGS, open, describeViolations } from './helpers.js';

// Form and element behaviour (M4b): one fixture page for the edge cases, plus the forms and content galleries.
const forms = PAGES.find((p) => p.name === 'forms');
const content = PAGES.find((p) => p.name === 'content');
const said = (page) => page.evaluate(() => window.said);

test.describe('fixture', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/forms-js.html');
    await page.waitForFunction(() => window.Vectra);
  });

  test('password toggle reveals, keeps its name and the caret', async ({ page }) => {
    const input = page.locator('#pw');
    const button = page.getByRole('button', { name: 'Show password' });
    await input.evaluate((el) => { el.focus(); el.setSelectionRange(4, 4); });
    await button.click();
    await expect(input).toHaveAttribute('type', 'text');
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    await expect(button).toHaveAccessibleName('Show password');
    expect(await input.evaluate((el) => [el.selectionStart, el.selectionEnd])).toEqual([4, 4]);
    await button.click();
    await expect(input).toHaveAttribute('type', 'password');
    await expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  test('drop zone shows drag state without flicker over children', async ({ page }) => {
    const state = await page.evaluate(() => {
      const zone = document.getElementById('zone');
      const title = document.getElementById('zone-title');
      const fire = (el, type) => el.dispatchEvent(new DragEvent(type, { bubbles: true, cancelable: true, dataTransfer: new DataTransfer() }));
      const seen = [];
      fire(zone, 'dragenter');
      seen.push(zone.hasAttribute('data-v-dragover'));
      fire(title, 'dragenter'); // entering a child fires enter on it, then leave on the zone
      fire(zone, 'dragleave');
      seen.push(zone.hasAttribute('data-v-dragover'));
      fire(title, 'dragleave');
      seen.push(zone.hasAttribute('data-v-dragover'));
      return seen;
    });
    expect(state).toEqual([true, true, false]);
  });

  test('dropping files fills the native input, honours accept and multiple, announces refusals', async ({ page }) => {
    const result = await page.evaluate(() => {
      const drop = (id, files) => {
        const dt = new DataTransfer();
        for (const [name, type] of files) dt.items.add(new File(['x'], name, { type }));
        document.getElementById(id).dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dt }));
      };
      let changes = 0;
      document.getElementById('zone-input').addEventListener('change', () => changes++);
      drop('zone', [['notes.txt', 'text/plain'], ['scan.pdf', 'application/pdf'], ['photo.png', 'image/png']]);
      drop('zone-many', [['a.txt', 'text/plain'], ['b.txt', 'text/plain']]);
      return {
        single: [...document.getElementById('zone-input').files].map((f) => f.name),
        many: [...document.getElementById('zone-many-input').files].map((f) => f.name),
        shown: document.querySelector('#zone [data-v-dropzone-files]').textContent,
        changes,
        events: window.events.filter(([type]) => type === 'change').map(([, id]) => id),
      };
    });
    expect(result).toEqual({
      single: ['scan.pdf'],
      many: ['a.txt', 'b.txt'],
      shown: 'scan.pdf',
      changes: 1,
      events: ['zone', 'zone-many'],
    });
    await expect.poll(() => said(page)).toEqual(['notes.txt: file type not accepted. photo.png: only one file allowed.']);
  });

  test('stepper honours min and max, disables at the limits and fires input and change', async ({ page }) => {
    const input = page.locator('#qty');
    const down = page.getByRole('button', { name: 'Fewer guests' });
    const up = page.getByRole('button', { name: 'More guests' });
    await expect(up).toBeVisible();
    await input.evaluate((el) => {
      window.fired = [];
      for (const type of ['input', 'change']) el.addEventListener(type, () => window.fired.push(type));
    });
    await up.click();
    await expect(input).toHaveValue('3');
    await expect(up).toBeDisabled();
    await expect(input).toBeFocused(); // focus handed over when the button switched off
    expect(await page.evaluate(() => window.fired)).toEqual(['input', 'change']);
    await down.click();
    await down.click();
    await expect(input).toHaveValue('1');
    await expect(down).toBeDisabled();
    await expect(up).toBeEnabled();
    await input.fill('2');
    await expect(down).toBeEnabled();
  });

  test('counter shows n of max and announces only at thresholds', async ({ page }) => {
    const bio = page.locator('#bio');
    await expect(page.locator('#bio-counter')).toHaveText('0 of 10');
    await expect(bio).toHaveAttribute('aria-describedby', 'bio-counter');
    await bio.pressSequentially('abcdefgh');
    await expect(page.locator('#bio-counter')).toHaveText('8 of 10');
    await page.waitForTimeout(100);
    expect(await said(page)).toEqual([]);
    await bio.press('i');
    await expect(page.locator('#bio-counter')).toHaveAttribute('data-v-level', 'near');
    await bio.press('j');
    await expect.poll(() => said(page)).toEqual(['Characters left: 1', 'Character limit reached']);

    const soft = page.locator('#soft');
    await soft.fill('too long');
    await expect(page.locator('#soft-counter')).toHaveText('8 of 5');
    await expect(page.locator('#soft-counter')).toHaveAttribute('data-v-level', 'over');
    await expect.poll(() => said(page)).toContain('Over the limit by 3');
    expect(await page.locator('#soft-counter').evaluate((el) => getComputedStyle(el).color))
      .not.toBe(await page.locator('#bio-counter').evaluate((el) => getComputedStyle(el).color));
  });

  test('copy writes to the clipboard, says Copied and resets', async ({ page, context, browserName }) => {
    if (browserName === 'chromium') await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    const button = page.locator('#copy-target');
    await button.click();
    await expect(button).toHaveText('Copied');
    await expect.poll(() => said(page)).toEqual(['Copied to clipboard']);
    if (browserName === 'chromium') expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('npm install vectra');
    await expect(button).toHaveText('Copy', { timeout: 3000 });
  });

  test('copy failure says so and selects the text to copy by hand', async ({ page }) => {
    await page.evaluate(() => {
      Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.reject(new Error('blocked')) } });
    });
    await page.locator('#copy-target').click();
    await expect(page.locator('#copy-target')).toHaveText('Copy failed');
    expect(await page.evaluate(() => getSelection().toString())).toBe('npm install vectra');
    await expect.poll(() => said(page)).toEqual(['Could not copy. The text is selected, press Ctrl+C']);
    // An icon-only button changes its accessible name instead.
    await page.locator('#copy-value').click();
    await expect(page.locator('#copy-value')).toHaveAccessibleName('Copy failed');
  });

  test('clear empties the search, refocuses it, fires input and hides', async ({ page }) => {
    const input = page.locator('#find');
    const clear = page.getByRole('button', { name: 'Clear search' });
    await expect(clear).toBeHidden();
    await input.fill('Kelly');
    await expect(clear).toBeVisible();
    await input.evaluate((el) => el.addEventListener('input', () => { window.cleared = el.value === ''; }));
    await clear.click();
    await expect(input).toHaveValue('');
    await expect(input).toBeFocused();
    expect(await page.evaluate(() => window.cleared)).toBe(true);
    await expect(clear).toBeHidden();
  });

  test('dismiss removes the container, moves focus on, and can be cancelled', async ({ page }) => {
    await page.evaluate(() => document.addEventListener('v:dismiss', (e) => e.preventDefault(), { once: true }));
    await page.locator('#banner-close').click();
    await expect(page.locator('#banner')).toBeVisible();
    expect((await page.evaluate(() => window.events)).find(([type]) => type === 'dismiss')).toEqual(['dismiss', 'banner', {}]);

    await page.locator('#banner-close').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#banner')).toHaveCount(0);
    // The next focusable thing after the banner is the second banner's close button.
    await expect(page.locator('#banner-kept button')).toBeFocused();
  });

  test('dismiss with a key is remembered across visits', async ({ page }) => {
    await page.locator('#banner-kept button').click();
    await expect(page.locator('#banner-kept')).toHaveCount(0);
    expect(await page.evaluate(() => localStorage.getItem('vectra-dismissed-promo'))).toBe('1');
    await page.reload();
    await page.waitForFunction(() => window.Vectra);
    await expect(page.locator('#banner-kept')).toHaveCount(0);
    await expect(page.locator('#banner')).toBeVisible();
  });

  test('unsaved warns before leaving while dirty and clears on reset', async ({ page }) => {
    const leave = () => page.evaluate(() => {
      const e = new Event('beforeunload', { cancelable: true });
      dispatchEvent(e);
      return e.defaultPrevented;
    });
    expect(await leave()).toBe(false);
    await page.locator('#b-name').fill('Aoife');
    expect(await leave()).toBe(true);
    // A submit stopped by validation (no plan chosen) keeps the edits marked.
    await page.getByRole('button', { name: 'Send' }).click();
    expect(await leave()).toBe(true);
    await page.getByRole('button', { name: 'Reset' }).click();
    expect(await leave()).toBe(false);
    const dirty = (await page.evaluate(() => window.events)).filter(([type]) => type === 'dirty').map(([, , d]) => d.dirty);
    expect(dirty).toEqual([true, false]);
  });

  test('unsaved clears when a submit goes ahead', async ({ page }) => {
    await page.locator('#b-name').fill('Aoife');
    await page.locator('#plan-a').check();
    await page.getByRole('button', { name: 'Send' }).click();
    await expect(page).toHaveURL(/#done$/);
    expect(await page.evaluate(() => {
      const e = new Event('beforeunload', { cancelable: true });
      dispatchEvent(e);
      return e.defaultPrevented;
    })).toBe(false);
  });

  test('validate lists a radio group once and clears it when one is chosen', async ({ page }) => {
    await page.getByRole('button', { name: 'Send' }).click();
    const summary = page.locator('#both .v-error-summary');
    await expect(summary).toBeFocused();
    await expect(summary.getByRole('link')).toHaveCount(2);
    await expect(page.locator('#plan-a')).toHaveAttribute('aria-invalid', 'true');
    await page.locator('#plan-a').check();
    await expect(summary.getByRole('link')).toHaveCount(1);
    await expect(page.locator('#plan-a')).not.toHaveAttribute('aria-invalid');
    await page.getByRole('button', { name: 'Reset' }).click();
    await expect(summary).toBeHidden();
  });

  test('strength scores length, variety and common patterns', async ({ page }) => {
    const input = page.locator('#new-pw');
    const meter = page.locator('#new-pw-meter');
    const hint = page.locator('#new-pw-hint');
    const cases = [
      ['abc', 0, 'Too short'],
      ['password123', 1, 'Weak'],
      ['aaaaaaaaaaaa', 1, 'Weak'],
      ['correct-horse', 2, 'Fair'],
      ['correct horse battery staple', 3, 'Good'],
      ['Xk9#mP2$vL7!qR4@', 4, 'Strong'],
    ];
    for (const [value, score, word] of cases) {
      await input.fill(value);
      expect(await meter.evaluate((el) => el.value), value).toBe(score);
      await expect(meter).toHaveAttribute('aria-valuetext', word);
      await expect(hint).toContainText(`${word}.`);
    }
    await input.fill('');
    await expect(hint).toHaveText('At least 8 characters.');
    await expect.poll(() => said(page)).toContain('Password strength: Strong');
  });

  test('fieldState shows checking, valid and invalid, and clears', async ({ page }) => {
    const input = page.locator('#handle');
    const status = page.locator('#handle-status');
    await page.evaluate(() => window.Vectra.fieldState(document.getElementById('handle'), 'checking', 'Checking'));
    await expect(status).toHaveText('Checking');
    await expect(status).toHaveAttribute('data-v-state', 'checking');
    await expect(input).toHaveAttribute('aria-describedby', 'handle-hint handle-status');
    await page.evaluate(() => window.Vectra.fieldState(document.getElementById('handle'), 'invalid', 'Taken, try aoife-ie'));
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(await input.evaluate((el) => el.validationMessage)).toBe('Taken, try aoife-ie');
    await page.evaluate(() => window.Vectra.fieldState(document.getElementById('handle'), 'valid', 'Available'));
    await expect(status).toHaveAttribute('data-v-state', 'valid');
    await expect(input).not.toHaveAttribute('aria-invalid');
    expect(await input.evaluate((el) => el.validity.valid)).toBe(true);
    await expect.poll(() => said(page)).toEqual(['Checking', 'Taken, try aoife-ie', 'Available']);
    await page.evaluate(() => window.Vectra.fieldState(document.getElementById('handle'), 'clear'));
    await expect(status).toBeHidden();
    await expect(input).toHaveAttribute('aria-describedby', 'handle-hint');
  });
});

test.describe('forms gallery validation', () => {
  test('submit builds the summary, focuses it, links focus fields and fixing clears', async ({ page }) => {
    await open(page, forms);
    await page.getByRole('button', { name: 'Create account' }).click();
    const summary = page.getByRole('group', { name: 'There are 5 problems' });
    await expect(summary).toBeFocused();
    await expect(summary.getByRole('link')).toHaveCount(5);
    const name = page.locator('#v-name');
    await expect(name).toHaveAttribute('aria-invalid', 'true');
    await expect(name).toHaveAttribute('aria-describedby', 'v-name-error');
    await expect(page.locator('#v-name-error')).toBeVisible();
    await expect(page).not.toHaveURL(/\?/);

    await summary.getByRole('link', { name: /email address/ }).click();
    await expect(page.locator('#v-email')).toBeFocused();

    await name.fill('Aoife Kelly');
    await expect(name).not.toHaveAttribute('aria-invalid');
    await expect(page.locator('#v-name-error')).toBeHidden();
    await expect(summary.getByRole('link')).toHaveCount(4);
  });

  test('a taken username blocks submit and is listed with its own message', async ({ page }) => {
    await open(page, forms);
    await page.locator('#v-user').fill('admin');
    await expect(page.locator('#v-user-status')).toHaveText('admin is taken. Try admin-ie or admin2026.');
    await expect(page.locator('#v-user-error')).toBeHidden();
    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page.locator('#signup .v-error-summary')).toContainText('admin is taken');
    await page.locator('#v-user').fill('aoife');
    await expect(page.locator('#v-user-status')).toHaveText('aoife is free.');
    await expect(page.locator('#signup .v-error-summary')).not.toContainText('admin is taken');
  });

  test('the error summary passes axe', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit', 'axe misreads oklch colours in WebKit (see a11y.spec.js)');
    await open(page, forms);
    await page.getByRole('button', { name: 'Create account' }).click();
    await page.locator('#v-user').fill('admin');
    await expect(page.locator('#v-user-status')).toHaveAttribute('data-v-state', 'invalid');
    const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).include('#validation').analyze();
    expect(describeViolations(violations)).toEqual([]);
  });

  test.describe('without JS', () => {
    test.use({ javaScriptEnabled: false });

    test('native validation still stops the submit', async ({ page }) => {
      await page.goto(forms.path);
      await page.getByRole('button', { name: 'Create account' }).click();
      await expect(page).not.toHaveURL(/\?/);
      expect(await page.locator('#signup').evaluate((form) => [form.noValidate, form.checkValidity()])).toEqual([false, false]);
      await expect(page.locator('.v-error-summary')).toHaveCount(0);
    });
  });
});

test('content gallery code blocks copy their code', async ({ page, context, browserName }) => {
  test.skip(browserName !== 'chromium', 'reading the clipboard back needs Chromium permissions');
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await open(page, content);
  const button = page.locator('[data-v-copy-target="#code-shell"]');
  await button.click();
  await expect(button).toHaveText('Copied');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('npx playwright test');
});

import { test, expect } from '@playwright/test';
import { PAGES, open } from './helpers.js';

// v2.1 components, part 2, on examples/plus-content/.
const target = PAGES.find((p) => p.name === 'plus-content');
const ready = (page) => expect(page.locator('#readmore-long[data-clamped]')).toBeAttached();

test.describe('progress ring', () => {
  test.beforeEach(async ({ page }) => { await open(page, target, { direction: 'tech', theme: 'light' }); });

  test('is a labelled progressbar whose ring follows --v-value', async ({ page }) => {
    const ring = page.locator('#ring-upload');
    await expect(ring).toHaveAttribute('role', 'progressbar');
    await expect(ring).toHaveAccessibleName('Upload');
    const bg = await ring.evaluate((el) => getComputedStyle(el, '::before').backgroundImage);
    expect(bg).toContain('conic-gradient');
    expect(bg).toContain('72%');
    const box = await ring.boundingBox();
    expect(Math.abs(box.width - box.height)).toBeLessThan(1);
  });
});

test.describe('read more', () => {
  test.use({ viewport: { width: 1280, height: 900 } });
  test.beforeEach(async ({ page }) => { await open(page, target, { direction: 'tech', theme: 'light' }); await ready(page); });

  test('long text is clamped with a button; short text gets none', async ({ page }) => {
    const body = page.locator('#readmore-long .v-readmore-body');
    const lines = await body.evaluate((el) => Math.round(el.clientHeight / parseFloat(getComputedStyle(el).lineHeight)));
    expect(lines).toBe(4);
    await expect(page.locator('#readmore-long .v-readmore-toggle')).toBeVisible();
    await expect(page.locator('#readmore-long .v-readmore-toggle')).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#readmore-short .v-readmore-toggle')).toBeHidden();
  });

  test('the button shows the rest, says so, and closes again', async ({ page }) => {
    const button = page.locator('#readmore-long .v-readmore-toggle');
    const body = page.locator('#readmore-long .v-readmore-body');
    const before = (await body.boundingBox()).height;
    await button.click();
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await expect(button).toHaveText('Show less');
    expect((await body.boundingBox()).height).toBeGreaterThan(before * 1.4);
    await button.click();
    await expect(button).toHaveText('Read more');
    expect(Math.abs((await body.boundingBox()).height - before)).toBeLessThan(2);
  });

  test('a narrow column can need the button where a wide one did not', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.locator('#readmore-short .v-readmore-body').evaluate((el) => { el.textContent = 'Four lines fit at this width, but not in a narrow column on a phone. '.repeat(3); });
    await page.locator('#readmore-short').evaluate((el) => { el.style.inlineSize = '40rem'; });
    await page.waitForTimeout(100);
    await page.locator('#readmore-short').evaluate((el) => { el.style.inlineSize = '10rem'; });
    await expect(page.locator('#readmore-short .v-readmore-toggle')).toBeVisible();
  });
});

test.describe('read more without JS', () => {
  test.use({ javaScriptEnabled: false });

  test('shows the whole text', async ({ page }) => {
    await page.goto(target.path);
    const body = page.locator('#readmore-long .v-readmore-body');
    expect(await body.evaluate((el) => el.scrollHeight <= el.clientHeight + 1)).toBe(true);
  });
});

test.describe('device frames', () => {
  test.beforeEach(async ({ page }) => { await open(page, target, { direction: 'tech', theme: 'light' }); });

  test('each screen keeps its aspect ratio and the image fills it', async ({ page }) => {
    const ratio = async (sel) => page.locator(sel).evaluate((el) => { const r = el.getBoundingClientRect(); return r.width / r.height; });
    expect(await ratio('.v-device-browser .v-device-screen')).toBeCloseTo(1.6, 1);
    expect(await ratio('.v-device-phone .v-device-screen')).toBeCloseTo(9 / 19.5, 1);
    const [screen, img] = [await page.locator('.v-device-phone .v-device-screen').boundingBox(), await page.locator('.v-device-phone img').boundingBox()];
    expect(Math.abs(screen.width - img.width)).toBeLessThan(1);
  });

  test('the phone camera stays centred in right to left', async ({ page }) => {
    await page.evaluate(() => { document.documentElement.dir = 'rtl'; });
    const centre = await page.locator('.v-device-phone .v-device-screen').evaluate((el) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el, '::before');
      const left = r.left + parseFloat(cs.left) + parseFloat(cs.marginLeft); // auto margins centre it
      return Math.abs(left + parseFloat(cs.width) / 2 - (r.left + r.width / 2));
    });
    expect(centre).toBeLessThan(1.5);
  });
});

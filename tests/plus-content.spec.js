import { test, expect } from '@playwright/test';
import { PAGES, open } from './helpers.js';

// v2.1 components, part 2, on examples/plus-content/.
const target = PAGES.find((p) => p.name === 'plus-content');

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

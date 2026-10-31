import { test, expect } from '@playwright/test';
import { PAGES, open } from './helpers.js';

// Elements behaviour: toggle state, choice cards, and the layouts that must hold at phone width.
const elements = PAGES.find((p) => p.name === 'elements');

test('a pressed toggle button is styled distinctly and keeps aria-pressed', async ({ page }) => {
  await open(page, elements);
  const on = page.getByRole('button', { name: 'Pinned' });
  const off = page.getByRole('button', { name: 'Pin', exact: true });
  await expect(on).toHaveAttribute('aria-pressed', 'true');
  await expect(off).toHaveAttribute('aria-pressed', 'false');
  const look = (el) => el.evaluate((n) => {
    const cs = getComputedStyle(n);
    return { bg: cs.backgroundColor, border: cs.borderTopColor, color: cs.color, shadow: cs.boxShadow };
  });
  const [a, b] = [await look(on), await look(off)];
  expect(a.bg).not.toBe(b.bg);
  expect(a.border).not.toBe(b.border);
  expect(a.shadow).not.toBe('none');
});

test('clicking a choice card text checks its input and shows the checked style', async ({ page }) => {
  await open(page, elements);
  const card = page.locator('.v-choice-card').filter({ has: page.locator('#cc-simple') });
  const before = await card.evaluate((n) => getComputedStyle(n).borderTopColor);
  await card.getByText('Simple site', { exact: true }).click();
  await expect(page.locator('#cc-simple')).toBeChecked();
  expect(await card.evaluate((n) => n.matches(':has(:checked)'))).toBe(true);
  const after = await card.evaluate((n) => ({ border: getComputedStyle(n).borderTopColor, shadow: getComputedStyle(n).boxShadow }));
  expect(after.border).not.toBe(before);
  expect(after.shadow).not.toBe('none');
});

test('a choice card shows a focus ring when its input is keyboard-focused', async ({ page }) => {
  await open(page, elements);
  const input = page.locator('#cc-seo');
  const card = page.locator('.v-choice-card').filter({ has: input });
  expect(await card.evaluate((n) => getComputedStyle(n).outlineStyle)).toBe('none');
  // Tab from the checkbox before it, so focus arrives the keyboard way (:focus-visible).
  await page.locator('input[name="need"][value="site"]').focus();
  await page.keyboard.press('Tab');
  await expect(input).toBeFocused();
  const ring = await card.evaluate((n) => ({ style: getComputedStyle(n).outlineStyle, width: parseFloat(getComputedStyle(n).outlineWidth) }));
  expect(ring.style).toBe('solid');
  expect(ring.width).toBeGreaterThanOrEqual(2);
});

test.describe('phone width', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('the two-column form collapses to one column', async ({ page }) => {
    await open(page, elements);
    const columns = await page.locator('#form-two .v-form-grid').evaluate((n) => getComputedStyle(n).gridTemplateColumns.split(' ').length);
    expect(columns).toBe(1);
    const first = await page.locator('#fl-first').boundingBox();
    const last = await page.locator('#fl-last').boundingBox();
    expect(last.y).toBeGreaterThan(first.y + first.height);
  });

  test('the description list stays readable without horizontal overflow', async ({ page }) => {
    await open(page, elements);
    const dl = page.locator('#dl-order');
    const result = await dl.evaluate((n) => ({
      overflow: n.scrollWidth - n.clientWidth,
      page: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      cells: [...n.querySelectorAll('dd')].map((d) => d.getBoundingClientRect().right - n.getBoundingClientRect().right),
    }));
    expect(result.overflow).toBeLessThanOrEqual(0);
    expect(result.page).toBeLessThanOrEqual(0);
    for (const c of result.cells) expect(c).toBeLessThanOrEqual(1);
  });
});

test('wide form puts the two columns side by side', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page, elements);
  const columns = await page.locator('#form-two .v-form-grid').evaluate((n) => getComputedStyle(n).gridTemplateColumns.split(' ').length);
  expect(columns).toBe(2);
});

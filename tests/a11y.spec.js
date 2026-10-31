import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { DIRECTIONS, THEMES, PAGES, AUTH_PAGES, EXAMPLE_PAGES, WCAG_TAGS, open, describeViolations } from './helpers.js';

// In WebKit, axe intermittently fails to read oklch()/light-dark() text colours and reports them as
// black (verified: computed colours and screenshots are correct). Contrast is enforced in Chromium
// and Firefox, plus the Chromium hue sweep; WebKit still runs every other rule.
const axeFor = (page, browserName) => {
  const builder = new AxeBuilder({ page }).withTags(WCAG_TAGS);
  return browserName === 'webkit' ? builder.disableRules(['color-contrast']) : builder;
};

// Auth flow pages are many (about 40): the full 8-combo matrix measured 1.1 min on 10 local workers, about
// 5.5 min on the 2-worker CI runner. They run in two combos that cover both themes and two directions; the
// auth gallery holds the same components and runs the full matrix.
const AUTH_COMBOS = [['tech', 'dark'], ['editorial', 'light']];
// The generated full pages (about 50) use the same two combos; the gallery pages hold their components.
const combos = (target) => (AUTH_PAGES.includes(target) || EXAMPLE_PAGES.includes(target) ? AUTH_COMBOS : DIRECTIONS.flatMap((d) => THEMES.map((t) => [d, t])));

for (const target of [...PAGES, ...AUTH_PAGES, ...EXAMPLE_PAGES]) {
  for (const [direction, theme] of combos(target)) {
    test(`axe: ${target.name} · ${direction} · ${theme}`, async ({ page, browserName }) => {
      await open(page, target, { direction, theme });
      const { violations } = await axeFor(page, browserName).analyze();
      expect(describeViolations(violations)).toEqual([]);
    });
  }
}

// Opened programmatically: this checks the panel's markup, the click path is covered in keyboard.spec.js.
const prototype = PAGES.find((p) => p.name === 'prototype');
for (const direction of DIRECTIONS) {
  for (const theme of THEMES) {
    test(`axe: prototype customizer · ${direction} · ${theme}`, async ({ page, browserName }) => {
      await open(page, prototype, { direction, theme });
      await page.evaluate(() => document.getElementById('customizer').showPopover());
      await expect(page.locator('#customizer')).toBeVisible();
      const { violations } = await axeFor(page, browserName).include('#customizer').analyze();
      expect(describeViolations(violations)).toEqual([]);
    });
  }
}

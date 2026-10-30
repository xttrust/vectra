import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { DIRECTIONS, THEMES, PAGES, WCAG_TAGS, open, describeViolations } from './helpers.js';

// In WebKit, axe intermittently fails to read oklch()/light-dark() text colours and reports them as
// black (verified: computed colours and screenshots are correct). Contrast is enforced in Chromium
// and Firefox, plus the Chromium hue sweep; WebKit still runs every other rule.
const axeFor = (page, browserName) => {
  const builder = new AxeBuilder({ page }).withTags(WCAG_TAGS);
  return browserName === 'webkit' ? builder.disableRules(['color-contrast']) : builder;
};

for (const target of PAGES) {
  for (const direction of DIRECTIONS) {
    for (const theme of THEMES) {
      test(`axe: ${target.name} · ${direction} · ${theme}`, async ({ page, browserName }) => {
        await open(page, target, { direction, theme });
        const { violations } = await axeFor(page, browserName).analyze();
        expect(describeViolations(violations)).toEqual([]);
      });
    }
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

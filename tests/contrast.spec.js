import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { DIRECTIONS, THEMES, PAGES, open, describeViolations } from './helpers.js';

// Any accent hue must keep AA contrast: sweep the hue wheel in 30 degree steps.
const HUES = Array.from({ length: 12 }, (_, i) => i * 30);
const target = PAGES.find((p) => p.name === 'prototype');

// The sweep tests token maths, not engine behaviour, so one engine is enough.
test.skip(({ browserName }) => browserName !== 'chromium', 'Hue sweep runs in Chromium only');

for (const direction of DIRECTIONS) {
  for (const theme of THEMES) {
    test(`contrast sweep: ${direction} · ${theme}`, async ({ page }) => {
      test.setTimeout(120_000);
      const failures = [];
      for (const hue of HUES) {
        await open(page, target, { direction, theme, custom: { state: { accent: String(hue) }, vars: { '--accent-h': String(hue) } } });
        const { violations } = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();
        if (violations.length) failures.push({ hue, violations: describeViolations(violations) });
      }
      expect(failures).toEqual([]);
    });
  }
}

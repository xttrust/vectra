import { test, expect } from '@playwright/test';
import { DIRECTIONS, THEMES, PAGES, open } from './helpers.js';

// Baselines are generated in the pinned Playwright container (see .github/workflows), never on a dev machine.
const VIEWPORTS = { desktop: { width: 1440, height: 900 }, phone: { width: 390, height: 844 } };

for (const target of PAGES) {
  for (const [label, viewport] of Object.entries(VIEWPORTS)) {
    for (const direction of DIRECTIONS) {
      for (const theme of THEMES) {
        test(`visual: ${target.name} · ${direction} · ${theme} · ${label}`, { tag: '@visual' }, async ({ page }) => {
          await page.setViewportSize(viewport);
          await open(page, target, { direction, theme });
          await expect(page).toHaveScreenshot(`${target.name}-${direction}-${theme}-${label}.png`, { fullPage: true });
        });
      }
    }
  }
}

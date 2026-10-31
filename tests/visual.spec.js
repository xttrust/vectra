import { test, expect } from '@playwright/test';
import { DIRECTIONS, THEMES, PAGES, AUTH_PAGES, open } from './helpers.js';

// Baselines are generated in the pinned Playwright container (see .github/workflows), never on a dev machine.
const VIEWPORTS = { desktop: { width: 1440, height: 900 }, phone: { width: 390, height: 844 } };

for (const target of [...PAGES, ...AUTH_PAGES].filter((p) => p.visual !== 'none')) {
  const directions = target.visual === 'full' ? DIRECTIONS : ['tech'];
  for (const [label, viewport] of Object.entries(VIEWPORTS)) {
    for (const direction of directions) {
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

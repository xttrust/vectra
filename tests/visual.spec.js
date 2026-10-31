import { test, expect } from '@playwright/test';
import { DIRECTIONS, THEMES, PAGES, AUTH_PAGES, open } from './helpers.js';

// Baselines are generated in the pinned Playwright container (see .github/workflows), never on a dev machine.
// Tall pages under Glass (many blurred surfaces) need more than the default 5 s to give two matching captures there.
const VIEWPORTS = { desktop: { width: 1440, height: 900 }, phone: { width: 390, height: 844 } };

for (const target of [...PAGES, ...AUTH_PAGES].filter((p) => p.visual !== 'none')) {
  const directions = target.visual === 'full' ? DIRECTIONS : ['tech'];
  for (const [label, viewport] of Object.entries(VIEWPORTS)) {
    for (const direction of directions) {
      for (const theme of THEMES) {
        test(`visual: ${target.name} · ${direction} · ${theme} · ${label}`, { tag: '@visual' }, async ({ page }) => {
          await page.setViewportSize(viewport);
          await open(page, target, { direction, theme });
          // Numbers measured at build time (sizes, test counts, the build date and commit) change with every
          // commit, so the docs site marks them data-volatile and they are held still for the screenshot.
          await page.evaluate(() => document.querySelectorAll('[data-volatile]').forEach((el) => {
            if (el.tagName === 'METER') el.value = el.max / 2;
            else el.textContent = '0.00';
          }));
          // A page whose height has a fraction is 1px taller once the viewport grows to fit it, so the first
          // two shots never match; long glass pages can then need more than the default 5 s to settle.
          await expect(page).toHaveScreenshot(`${target.name}-${direction}-${theme}-${label}.png`, { fullPage: true, timeout: 15000 });
        });
      }
    }
  }
}

---
description: Run Vectra's visual regression tests and review any differences at phone and desktop width
---

Check Vectra v2 visually.

1. Run `npm run test:visual`. Baselines are made with the local Playwright Chromium on the owner's machine and are not checked in CI.
2. If tests fail, open the diff images in `test-results/` and decide for each: intended change or regression.
3. Look at the changed pages yourself at 390px and 1440px in both themes; don't rely on the pixel diff alone.
4. Only after confirming a change is intended, update baselines with
   `npm run test:visual:update`, then run `npm run test:visual` once more to confirm they are stable, and commit them with the change.
5. Report which screenshots changed, why, and what you looked at.

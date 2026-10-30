---
description: Run Vectra's visual regression tests and review any differences at phone and desktop width
---

Check Vectra v2 visually.

1. Run `npm run docker:test -- --project=chromium --grep @visual` (baselines are only valid in the pinned Playwright image, never run them on the host).
2. If tests fail, open the diff images in `test-results/` and decide for each: intended change or regression.
3. Look at the changed pages yourself at 390px and 1440px in both themes; don't rely on the pixel diff alone.
4. Only after confirming a change is intended, update baselines with
   `npm run docker:test -- --project=chromium --grep @visual --update-snapshots`
   (or the "Update visual baselines" workflow on the branch), and commit them with the change.
5. Report which screenshots changed, why, and what you looked at.

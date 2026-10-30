---
description: Run Vectra's accessibility, contrast and keyboard checks and report what failed
---

Run the accessibility gate for Vectra v2 and report the result.

1. `npm test` (Chromium: axe on every page × direction × theme, the open customizer, the 96-run accent hue sweep, keyboard tests).
2. If the change touches interaction or layout, also run the other engines in the pinned image:
   `npm run docker:test -- --project=firefox --project=webkit --grep-invert @visual`
3. Report: passed/failed counts per suite, and for each failure the rule, the element and the page/direction/theme.

Rules:
- Fix the cause. Never disable an axe rule or loosen a threshold to get green, except the documented WebKit color-contrast exclusion in `tests/a11y.spec.js`.
- If a failure looks like a tool artefact, prove it (computed styles plus a screenshot) before treating it as one.
- Keep the report short: counts, failures, what you changed.

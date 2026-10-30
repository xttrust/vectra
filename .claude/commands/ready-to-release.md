---
description: Release checklist for Vectra v2. Runs every automated gate and lists the manual checks
---

Prepare a Vectra v2 release. Stop and report at the first failing step.

Automated:
1. Working tree clean, on `main`, up to date with origin.
2. `npm ci && npm run check` (lint, build, size budgets, no external URLs, browser baseline).
3. `npm run docker:test -- --grep-invert @visual` (all three engines).
4. `npm run docker:test -- --project=chromium --grep @visual` (visual regression).
5. Report the size table and any budget within 10% of its limit.

Manual (list them for Florin, do not mark them done yourself):
- NVDA + Firefox on Windows, VoiceOver + Safari on macOS/iOS.
- A real iPhone and Android phone; Windows Chrome.
- Forced colours (Windows high contrast), 200% zoom, reduced motion.

Release (only after Florin confirms the manual checks):
6. Update CHANGELOG.md, bump the version in package.json.
7. Commit `release: vX.Y.Z`, tag `vX.Y.Z`, push with tags.
8. Draft the GitHub release notes from the changelog.

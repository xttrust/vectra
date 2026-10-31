# Vectra v2

A UI kit built on the web platform, with nothing to install at runtime: no Bootstrap, no icon fonts, no CDNs.

**Status: alpha, in development.** The plan, decisions and milestones are in [PLAN.md](PLAN.md). Vectra v1 (Bootstrap 5) is unchanged at [xttrust/Vectra-UI-KIT](https://github.com/xttrust/Vectra-UI-KIT).

## What it aims for

- **Zero runtime dependencies.** Link one CSS file and one JS file. Fonts and icons are self-hosted.
- **Four directions, one markup.** Dark tech, Editorial, Soft depth and Glass, each in light and dark, switched with `data-direction` and `data-theme` on `<html>`.
- **Accessible by construction.** WCAG 2.2 AA in every direction, theme and accent hue, checked in CI.
- **Native first.** `<dialog>`, `popover`, anchor positioning, container queries, `<details name>`, `:user-invalid`.
- **Small.** Size budgets fail the build when they are exceeded.

## Using it today

`dist/vectra.css` is the full bundle. For production, load `dist/vectra.core.css` plus one file from `dist/directions/` and set `data-direction` on `<html>`. Without `data-theme`, light and dark follow the OS. It includes base typography, layout primitives (`.v-container`, `.v-stack`, `.v-cluster`, `.v-grid`, `.v-sidebar`, `.v-switcher`, `.v-bento`) and utilities. Components arrive from milestone M3.

Reference pages (run `npm run serve`): `/examples/tokens/` and `/examples/layout/`.

**Fonts.** `vectra.core.css` declares Inter (self-hosted, `dist/fonts/`, latin and latin-ext subsets, `font-display: swap`). Keep `dist/fonts/` next to the CSS. A browser only downloads a font a page actually uses, so if you set your own `--v-font-sans`, Inter is never fetched.

**Icons.** `dist/icons/sprite.svg` holds about 160 icons; the names are in `dist/icons/icons.json` and on `/examples/icons/`. Use them with `<svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#search"/></svg>`. To ship only what a site uses, run `npx vectra-icons "pages/*.html" --out icons.svg`: it reads `<use href="...svg#name">` and `data-icon="name"` and fails on a name that is not in the set.

## Try the prototype

```sh
npm ci
npm run serve
```

Then open http://127.0.0.1:4173/prototype/. Use the switcher or the **Customize** panel to change direction, mode, accent, corners, density and typeface.

## Development

| Command | What it does |
|---|---|
| `npm run check` | Lint, build, size budgets, external-URL check, browser floor check |
| `npm test` | Accessibility, contrast sweep and keyboard tests in Chromium |
| `npm run build:icons` | Copy the icons listed in `src/icons/icons.json` from Lucide into `src/icons/svg/`, then build the sprite |
| `npm run build:fonts` | Re-make the Inter subsets in `src/fonts/` (only needed when the ranges or features change) |
| `npm run docker:test` | All tests in Chromium, Firefox and WebKit inside the pinned Playwright image (needed for visual tests) |

Supported browsers: Chrome/Edge 123+, Safari 17.5+, Firefox 125+.

## Licence

MIT, © Florin Pinta. Icons are from [Lucide](https://lucide.dev) (ISC) and the font is [Inter](https://rsms.me/inter/) (SIL OFL 1.1); their notices are in [LICENSE](LICENSE).

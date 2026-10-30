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

`dist/vectra.css` is the full bundle. For production, load `dist/vectra.core.css` plus one file from `dist/directions/` and set `data-direction` on `<html>`. Without `data-theme`, light and dark follow the OS. Components arrive from milestone M3, so for now this is the token layer.

The token reference page is at `/examples/tokens/` (run `npm run serve`).

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
| `npm run docker:test` | All tests in Chromium, Firefox and WebKit inside the pinned Playwright image (needed for visual tests) |

Supported browsers: Chrome/Edge 123+, Safari 17.5+, Firefox 125+.

## Licence

MIT, © Florin Pinta.

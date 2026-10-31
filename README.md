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

## Docs site

The docs site is generated from `site/` by `build/site.mjs` (plain Node, no dependencies) into `site/dist/`, using the built kit itself. Component pages come from one data file per component in `site/data/components/`, checked against `site/data/component.schema.json`, the catalogue, the built CSS and the JS hooks by `npm run site:check`.

```sh
npm run build        # the kit, into dist/
npm run site         # the site, into site/dist/
npm run serve        # then open http://127.0.0.1:4173/site/dist/
```

The site also has a **theme builder** (`/theme-builder/`: direction, mode, accent hue, corners, density, typeface and single-token overrides, with a live WCAG contrast report across every hue, a CSS export of only the changed tokens and a shareable link) and a **quality page** (`/quality/`) generated at build time from `build/budgets.json`, `dist/`, `playwright test --list`, the test page lists, `build/contrast-pairs.mjs` and `build/browsers.mjs`. The changelog is written from git tags and merged pull requests, so build from a full clone to see it filled in.

Every URL in the site is relative, so it works under any base path. It is deployed to GitHub Pages (https://xttrust.github.io/vectra/) by `.github/workflows/pages.yml`, only when a release is published or the workflow is run by hand.

## For AI assistants

`npm run build` also writes `dist/ai/`, generated from the same component data as the docs site:

- `vectra.manifest.json` (schema beside it): every component with its classes, states, hooks, events, keyboard, accessibility notes, tokens and a canonical example, plus the token contract, icon names, the JS API and the rules.
- `llms.txt` and `llms-full.txt`: the [llms.txt](https://llmstxt.org) index and one file an assistant can read in one go. Both are also at the root of the docs site.
- `claude-skill/vectra/` and `AGENTS.md`: the same guidance for Claude Code and for other assistants. The committed copies live in `ai/`.

**Claude Code skill.** Copy the folder into your project (or `~/.claude/skills/` for every project):

```sh
mkdir -p .claude/skills && cp -r node_modules/@creativeigniter/vectra/dist/ai/claude-skill/vectra .claude/skills/
```

Claude then uses it whenever you build UI with Vectra. For Codex, Cursor and other assistants, paste `ai/AGENTS.md` into your `AGENTS.md`.

`tests/manifest.spec.js` renders every canonical example from the manifest alone in a blank page and checks the classes, hooks, axe and visibility. After changing component data, run `npm run ai:skill` to refresh `ai/`; `npm run check:manifest` fails when it is stale.

## Development

| Command | What it does |
|---|---|
| `npm run check` | Lint (including `site/assets/*.css`), build, size budgets, external-URL check, browser floor check, AI manifest freshness |
| `npm run ai:skill` | Regenerate the committed Claude Code skill and `AGENTS.md` in `ai/` from the component data |
| `npm run site:check` | Validate the component data, build the docs site and check every page (one h1, landmarks, links, no external URLs) |
| `npm test` | Accessibility, contrast sweep and keyboard tests in Chromium |
| `npm run build:icons` | Copy the icons listed in `src/icons/icons.json` from Lucide into `src/icons/svg/`, then build the sprite |
| `npm run build:fonts` | Re-make the Inter subsets in `src/fonts/` (only needed when the ranges or features change) |
| `npm run docker:test` | All tests in Chromium, Firefox and WebKit inside the pinned Playwright image (needed for visual tests) |

Supported browsers: Chrome/Edge 123+, Safari 17.5+, Firefox 125+.

## Licence

MIT, © Florin Pinta. Icons are from [Lucide](https://lucide.dev) (ISC) and the font is [Inter](https://rsms.me/inter/) (SIL OFL 1.1); their notices are in [LICENSE](LICENSE).

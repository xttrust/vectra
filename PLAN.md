# Vectra v2: build plan

Status: decisions agreed 30 Oct 2026, awaiting go-ahead for M0. Nothing below is built yet except the prototype in `v2/prototype/`.

## 1. What "best" means here

"Best UI kit ever" is not measurable, so v2 commits to bars that are. Every one of them is checked in CI, not promised in the README.

| Bar | Target | How it is enforced |
|---|---|---|
| Runtime dependencies | 0. No CDN, no npm runtime deps, no icon fonts | CI greps built files and pages for external URLs |
| CSS size | Core + 1 direction ≤ 8 KB gz. All v2.0 components ≤ 22 KB gz. Each extra direction ≤ 2 KB gz | Size budget step fails the build |
| JS size | Core ≤ 2 KB gz. All v2.0 interactive components ≤ 9 KB gz | Same |
| Accessibility | WCAG 2.2 AA in every direction × theme, including any accent hue | axe on every page × 4 directions × 2 themes, plus the hue sweep from the prototype |
| Keyboard | Every interactive component fully usable by keyboard, following the WAI-ARIA Authoring Practices | Playwright interaction tests per component |
| Works without JS | Everything renders and reads correctly. Dialogs, popovers, accordions and forms work natively. Only tabs, toasts, menus' arrow keys and the customizer need JS | Test run with JS disabled |
| No build to use it | Link one CSS file and one JS file. Modules are optional | Example pages load `dist/` directly |
| Framework-agnostic | Plain HTML classes and data attributes. Works in Blade, Vue, Livewire, plain HTML | Example integrations in docs |
| Visual quality | Four directions, each reviewed at phone and desktop width, light and dark | Visual regression screenshots in CI |

What we deliberately do not chase: a React-only component library (shadcn/ui owns that), utility-class soup (Tailwind owns that), or hundreds of rarely used widgets.

## 2. Principles

1. **Platform first.** Use the native element when one exists: `<dialog>`, `popover`, `<details name>`, `:user-invalid`, `<progress>`, `<input type="range">`. JS only adds what HTML cannot do.
2. **Tokens drive everything.** Components never hard-code colour, radius, spacing or type. A direction is just a token set plus a few flourishes.
3. **Progressive enhancement.** Newer features (anchor positioning, view transitions, scroll-driven animation, `@starting-style`) enhance; the fallback is always usable.
4. **Flat specificity.** Cascade layers, single-class selectors, no `!important` except the reduced-motion override.
5. **Small by default.** Every component lives in its own file; the full bundle is a convenience, not a requirement.
6. **Accessible by construction.** Contrast is built into the token maths (OKLCH lightness per direction, hue correction), not fixed afterwards.

## 3. Browser support

Baseline target: browsers from roughly mid-2024 onward.

| Feature | Needed for | Chrome/Edge | Safari | Firefox | Without it |
|---|---|---|---|---|---|
| `light-dark()` | theming | 123 | 17.5 | 120 | **required** |
| `popover` | menus, toasts, customizer | 114 | 17 | 125 | **required** |
| `@layer`, `:has()`, container queries | everything | 105 | 16 | 121 | **required** |
| `oklch()`, `color-mix()`, `cos()` | colour maths | 111 | 16.2 | 113 | **required** |
| `:user-invalid` | form errors | 119 | 16.5 | 88 | **required** |
| Anchor positioning | menu/tooltip placement | 125 | 26 | 147 | 1 KB JS fallback |
| `<details name>` | exclusive accordion | 120 | 17.2 | 130 | accordion items open independently |
| `@starting-style`, `allow-discrete` | enter/exit animations | 117 | 17.5 | 129 | no animation |
| View transitions | theme reveal | 111 | 18 | 144 | instant switch |
| Scroll-driven animations | reveal on scroll | 115 | 26 | 159 | no animation |
| `interpolate-size` | accordion height animation | 129 | no | no | instant open |

Resulting floor: **Chrome/Edge 123+, Safari 17.5+, Firefox 125+**. Verified in M0 against MDN browser-compat-data; `npm run check:baseline` re-checks it in CI on every push.

## 4. Repository layout

```
src/
  css/
    layers.css              @layer order declaration
    reset.css
    tokens/
      primitives.css        spacing, type scale, motion, radii scales, status colours
      semantic.css          default token contract every direction must fill
    directions/
      tech.css  editorial.css  soft.css  glass.css
    base.css                typography, focus, selection, icons
    layout.css              container, stack, cluster, grid, sidebar, switcher, bento
    utilities.css           ~60 helpers that real pages need, nothing speculative
    components/
      button.css  badge.css  card.css  field.css  ... one file per component
  js/
    core.js                 auto-init, MutationObserver, events, storage helper
    components/
      tabs.js  menu.js  toast.js  dialog.js  ... one file per component
    customizer.js           runtime theming API (optional module)
  icons/
    svg/                    source SVGs
  fonts/                    Inter variable, latin + latin-ext subsets
build/                      small Node scripts: sprite, bundle, size report, manifest
site/                       docs site source (uses the kit itself)
examples/                   ported v1 pages and new templates
tests/
  a11y/  interaction/  visual/  contrast/
dist/                       built output (committed on release tags only)
```

### Naming

- Classes keep v1's `v-` prefix (`.v-btn`, `.v-card`) so Vectra can sit beside other CSS without collisions. The prototype used bare names only for speed.
- Tokens: `--v-*` (`--v-accent`, `--v-radius-md`). Component tokens: `--v-btn-bg` and similar, so a single component can be themed without touching the global set.
- Variants by modifier class (`.v-btn-primary`), states by native attributes and ARIA (`[aria-selected]`, `:disabled`, `[aria-busy]`), never by `.is-active` when an attribute exists.
- JS hooks by data attribute only (`data-v-tabs`, `data-v-toast`), never by styling classes.

## 5. Token system

Three tiers, as in the prototype but formalised:

1. **Primitives:** type scale (fluid `clamp()`), space scale × `--v-density`, motion durations and easings, status colours, radius presets.
2. **Semantic contract:** about 40 tokens every direction must define: `bg`, `bg-subtle`, `surface`, `surface-2`, `border`, `border-strong`, `text`, `text-2`, `text-3`, `accent`, `accent-hover`, `accent-text`, `accent-soft`, `on-accent`, `accent-2`, shadows 1 to 3, radii, fonts, display weight and tracking, feature surface. A Stylelint rule fails the build if a direction misses one.
3. **Component tokens:** defaults point at semantic tokens (`--v-btn-radius: var(--v-radius-md)`); directions override only where the personality needs it.

Accent maths: each direction fixes OKLCH lightness per theme and exposes one `--v-accent-h`. The `cos()` correction darkens the green-cyan band in light themes. The contrast sweep (12 hues × 4 directions × 2 themes = 96 runs, already passing in the prototype) runs in CI.

Directions ship as separate files. `vectra.css` includes all four for convenience; production sites load `vectra.core.css` plus one direction file.

## 6. Component inventory

Native base and JS needs listed so scope is honest. P0 ships in v2.0, P1 in v2.1, P2 later or on demand.

### P0: v2.0

| Group | Components | Native base | JS |
|---|---|---|---|
| Actions | button, icon button, button group, link button, segmented control | `<button>`, radio group | none |
| Display | badge, avatar + group, card, panel, stat card, divider, kbd, empty state, skeleton, spinner | | none |
| Feedback | alert, toast, progress, meter | `<progress>`, `<meter>`, `popover` | toast: yes |
| Forms | field (label, hint, error), input, textarea, select, checkbox, radio, switch, range, input group, password reveal, file drop zone | native inputs, `:user-invalid` | password reveal, drop zone |
| Overlays | dialog, drawer/sheet, popover, dropdown menu, tooltip | `<dialog>`, `popover`, anchor positioning | menu keys, fallback placement |
| Navigation | navbar, sidebar nav, tabs, breadcrumb, pagination, steps, skip link | `<nav>` | tabs, mobile nav |
| Disclosure | accordion, collapsible | `<details name>` | none |
| Data | table (responsive, sticky header, zebra, selectable rows) | `<table>` | row select only |
| Content | code block with copy, timeline, testimonial, pricing card | | copy |
| Theming | direction switcher, theme toggle, customizer | radio groups | yes |

### P1: v2.1

Combobox / autocomplete, command palette (⌘K), data table with sort and filter, carousel (CSS scroll-snap + buttons), OTP input, tag input, rating, sparkline and bar chart primitives (SVG), date input styling, notification centre.

### P2: later

Date picker calendar, colour picker, tree view, kanban board. Only if real demand appears; each is large and easy to get wrong.

Every v1 component maps to something above; the migration guide lists the exact class mapping.

## 7. JavaScript architecture

- **Core (≤ 2 KB gz):** finds `[data-v-*]` elements and initialises the matching module; a `MutationObserver` initialises content added later (Livewire, Vue, htmx) and tears down removed nodes. Event helpers emit namespaced DOM events (`v:open`, `v:close`, `v:change`).
- **Modules:** each exports `init(el, options) → { destroy }`. ES module build for bundlers, plus one IIFE file (`vectra.js`) for script tags.
- **Public API:** `Vectra.theme.set({ direction, mode, accent })`, `Vectra.toast('Saved')`, `Vectra.init(root)`. Nothing global beyond `window.Vectra`.
- **No framework wrappers in v2.0.** Vue and Blade usage is documented with examples; thin wrappers can come later if they prove worth it.

## 8. Icons and fonts

- **Icons:** curated set of about 150 SVGs in one sprite, `<svg><use href="sprite.svg#name">`. Source: Lucide (ISC licence, attribution in LICENSE) plus our own where needed. A build script makes the sprite and a per-project subset tool (`npx vectra-icons used.html` → only the icons that page uses).
- **Fonts:** Inter variable, self-hosted, split latin / latin-ext with `unicode-range`. Target ≤ 45 KB for latin (the prototype ships the full 66 KB file). Mono uses the system stack.

## 9. Tooling (dev dependencies only)

| Tool | Job |
|---|---|
| Lightning CSS | bundle `@import`s, minify, set browser targets |
| esbuild | bundle and minify JS (ESM + IIFE) |
| Stylelint | CSS rules, including the token-contract check and "no hard-coded colours in components" |
| ESLint | JS |
| Playwright + axe-core | a11y, keyboard, contrast sweep, visual regression, Chromium + Firefox + WebKit |
| Eleventy | docs site (static, no client framework) |
| Small Node scripts | sprite, size report, external-URL check |

### GitHub Actions on every push and PR

1. Lint (Stylelint, ESLint)
2. Build
3. Size budgets (fail on overrun, comment sizes on the PR)
4. External URL check (no CDNs anywhere)
5. axe: every example page × 4 directions × 2 themes
6. Contrast sweep: 96 hue runs
7. Keyboard interaction tests
8. Visual regression (Chromium; full three-engine run nightly)

`main` is protected: merge only by PR with all checks green.

Locally: `npm run check` (static gates), `npm test` (Chromium), `npm run docker:test` (all engines, pinned image, required for visual tests).

Screenshot budget: full-page baselines cost about 0.6 MB each. The prototype uses the full matrix (16 shots). Ported pages get default direction × light/dark × phone/desktop (4 shots); the full matrix stays on the component gallery only.

### Project slash commands

- `/check-a11y`: axe + contrast sweep + keyboard tests, summarised
- `/check-visual`: screenshots at phone and desktop for the changed pages
- `/ready-to-release`: changelog, version bump, build, all checks, tag

## 10. Testing beyond CI

- Manual screen reader pass per release: NVDA + Firefox (Windows), VoiceOver + Safari (macOS/iOS).
- Real device pass: an iPhone and an Android phone (Glass blur performance especially), plus Windows Chrome.
- Reduced motion, forced colours (Windows high contrast) and 200% zoom checks per release.

## 11. Docs site

Built with the kit itself, so the site is the biggest demo.

- Every component page: live demo, direction and theme switch inline, copyable markup, keyboard table, ARIA notes, tokens it reads.
- **Theme builder** (the customizer, grown up): pick direction, accent, corners, density, type; live contrast report; export a ready-to-use direction file.
- Getting started for plain HTML, Laravel Blade, Vue and Livewire.
- Migration guide v1 → v2 with a class map.
- Hosted on the existing Krystal/Hostivora setup or GitHub Pages (to decide).

## 12. Distribution and versioning

- npm: `@creativeigniter/vectra` (same scope as AdminVora), `dist/` + `src/` published.
- GitHub release zip with `dist/`, examples and fonts, for people who don't use npm.
- Semver. v1 stays on a `v1` branch with security and bug fixes only. Changelog per release.
- MIT licence unchanged.

## 13. Relationship to AdminVora

Separate design language, as decided. Vectra is free and covers marketing pages, auth and general app UI; AdminVora (paid) owns the full admin experience: dashboards, data-heavy screens, starter kits. Vectra docs can link to AdminVora as the upgrade path. No shared code in v2.0, to keep both free to evolve.

## 14. Milestones

One branch and one PR per milestone, each merged only with green checks. Sizes are relative (S, M, L), not dates.

| # | Milestone | Size | Done when |
|---|---|---|---|
| M0 | Repo setup: tooling, CI pipeline, budgets, test harness, slash commands, caniuse check of section 3 | M | CI runs green on an empty kit |
| M1 | Tokens + four directions + hue correction, ported from the prototype with `v-` naming | M | contrast sweep passes in CI |
| M2 | Foundations: reset, base, typography, layout, utilities | S | layout demo page passes axe |
| M3 | P0 static components (CSS only) | L | every component page passes axe and visual baseline |
| M4 | P0 interactive components + JS core | L | keyboard tests pass in three engines |
| M5 | Icon sprite pipeline + font subsetting | S | no external URLs, font ≤ 45 KB |
| M6 | Docs site + theme builder | L | site builds from the kit, deploys |
| M7 | Port v1 pages: 14 sections, 4 auth pages, components, forms, utilities, docs, index; add dashboard, pricing, settings, 404 examples | L | all pages pass the full CI matrix |
| M8 | Hardening: screen readers, real devices, forced colours, zoom, performance | M | release checklist clean |
| M9 | Release v2.0: npm, zip, README, migration guide, announcement | S | published |
| v2.1 | P1 components | L | per component, same gates |

## 15. Decisions (agreed 30 Oct 2026)

1. **Browser floor:** Chrome/Edge 123+, Safari 17.5+, Firefox 125+, with the fallbacks in section 3.
2. **Class prefix:** keep `v-`; tokens `--v-*`; JS hooks `data-v-*`.
3. **Docs hosting:** GitHub Pages, deployed from the repo on each release.
4. **Icons:** Lucide subset (ISC, attribution in LICENSE) plus custom icons where needed.
5. **npm scope:** `@creativeigniter/vectra` unless changed before M9.

## 16. Risks

- **Scope creep** is the main one. P1 and P2 stay out of v2.0, whatever happens.
- **Newer CSS features** shift between browser versions; the fallbacks in section 3 must stay tested, not assumed.
- **Glass blur** costs GPU on low-end phones (many blurred layers; in CI's software-rendered WebKit it is slow enough to stall tests). Mitigation: limit blur to surfaces in view, and the `prefers-reduced-transparency` fallback to solid surfaces, already in the prototype.
- **Breaking change for v1 users.** Mitigation: v1 branch, migration guide, class map.
- **Visual regression noise** from font rendering across machines. Mitigation: run visual tests in one pinned container image.

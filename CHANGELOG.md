# Changelog

Vectra follows [semantic versioning](https://semver.org). Pre-release versions (`-alpha`, `-beta`) may change markup and tokens between releases; each change is listed here.

## Unreleased

### Added

- **v2.1 components** in a new `vectra.plus.css` (own 12 KB budget; also inside `vectra.css`), shown on the new gallery `examples/plus/`:
  - **Mega menu** (`.v-mega`): a `<details name>` disclosure in the navbar, full width below the bar or inline in the mobile menu; `data-v-mega` adds Escape, click outside and focus leaving.
  - **Split button** (`.v-split`): a main action joined to a `.v-menu`.
  - **Back to top** (`.v-back-to-top`): a plain link, revealed by a scroll-driven animation.
  - **Table of contents scrollspy** (`data-v-toc`): marks the section being read with `aria-current="location"`. The `.v-toc` styles move from the article section to their own component.
  - **Context menu** (`.v-context-menu`, `data-v-context`): a `.v-menu` at the pointer, or at the focused region on Shift+F10.
  - **Hover card** (`.v-hovercard`, `data-v-hovercard`): a preview on hover or focus, per WCAG 1.4.13.
  - **Command palette** (`.v-command`, `data-v-command`): Ctrl+K or Cmd+K, a combobox over a grouped listbox.
  - **Lightbox** (`.v-lightbox`, `data-v-lightbox`): thumbnails are links, the viewer steps through them.
  - **Notification centre** (`.v-notify`, `.v-notifications`, `data-v-notifications`): unread count and mark as read.
- **v2.1 components, part 2**, on the new gallery `examples/plus-content/`:
  - **Progress ring** (`.v-progress-ring`): a circular progressbar drawn in CSS.
  - **Read more** (`.v-readmore`, `data-v-readmore`): clamps long text only when it is longer than `--v-lines`.
  - **Device frames** (`.v-device-browser`, `-laptop`, `-phone`): CSS frames around screenshots or live UI.
  - **Masonry gallery** (`.v-masonry`): CSS multi-column.
  - **Rating input** (`.v-rating-input`): radios drawn as stars, no JS.
  - **One-time code input** (`.v-otp`): one real input drawn as boxes, no JS.
  - **Carousel** (`.v-carousel`, `data-v-carousel`): scroll snap, one slide per press, no autoplay.
  - **Marquee** (`.v-marquee`, `data-v-marquee`): seamless loop with a pause button; still with reduced motion.
  - **Video embed** (`.v-video`, `data-v-video`): nothing loads from the player until the click.
  - **Tag input** (`.v-tag-input`, `data-v-tag-input`): same comma-separated form value with or without JS.
  - **Combobox** (`.v-combobox`, `data-v-combobox`): upgrades `<input list>` + `<datalist>`.
  - **Multi-step form** (`.v-wizard`, `data-v-wizard`): one form, checked step by step.
  - **Charts** (`.v-chart`, `.v-chart-bars`, `.v-chart-columns`, `.v-donut`, `.v-sparkline`, `.v-chart-line`, `.v-chart-legend`): tables, lists and SVG, no library.
- **18 new example pages** (`examples/pages/`): features, changelog, careers and a job with a multi-step application, customers and a case study, help centre and an article, developer docs, status and a waitlist; and in the app, billing, team, API keys and integrations settings, notifications, search results and a business profile.
- The example marketing header now has two mega menus (Product, Resources), the footer links to the new pages instead of the coming-soon page, and the app shell's top bar has a working notification centre and a Ctrl+K command palette.

- **Utilities:** position (`v-relative`, `v-absolute`, `v-inset-0`, `v-sticky` with `--v-sticky-top`), overflow, a scroll-snap row (`v-snap-row`), aspect ratios and object fit, line clamp (2 and 3 lines), dividers between children (`v-divide`), top and bottom borders, flex column and self-alignment, text sizes `xl`, `2xl` and `display`, `v-pretty`, `v-break-word`, `v-uppercase`, more spacing steps (margins 1 and 3, padding 1, 3, 8, inline and block padding, `v-ms-auto`, `v-me-auto`, `v-gap-8`), `v-h-full`, and container-width helpers `v-hide-narrow` and `v-hide-wide`.

### Changed

- `vectra.js` budget is now 16 KB (the v2.0 modules were 9.9 KB at alpha.1); `llms-full.txt` may grow to 300 KB.
- The anchor fallback exports an `anchors` map, so invokers that are not `popovertarget` buttons can be placed.
- `data-v-validate` also answers a `v:validate` event with `detail.scope`, checking part of a form (used by the multi-step form).
- The docs site copies `examples/shared/media` and rewrites `/media/` in examples, as it does `/img/`.

### Fixed

- The Utilities docs page and the AI manifest now list helpers wrapped in `@media` or `@container` (`v-hide-mobile` and `v-hide-desktop` were missing) and show the declarations of multi-line rules.

## 2.0.0-alpha.1 (2026-10-31)

The first public pre-release of Vectra v2, rebuilt from scratch on the web platform. Not yet recommended for production: see "Not verified yet" below.

### What is in it

- **77 P0 components** with every state, keyboard support and RTL: actions, display, feedback, forms, overlays, navigation, disclosure, data, content and theming. Native elements first (`<dialog>`, `popover`, `<details name>`, `:user-invalid`).
- **Four design directions** from one markup (Dark tech, Editorial, Soft depth, Glass), light, dark and system mode, any accent hue at WCAG 2.2 AA, corner, density and typeface presets.
- **JavaScript** (9.9 KB gz, optional): auto-init on `data-v-*` hooks with a MutationObserver for Livewire, Vue and htmx; tabs, menus, dialogs, tooltips with an anchor-positioning fallback, form validation with an error summary, password reveal, drop zone, stepper, counter, copy, toggles, toasts, connection and slow-network banners, session timeout, save status, theme API.
- **Sections:** 42 core variants (navbars, heroes, features, pricing, testimonials, FAQ, CTA, footers, app shell, settings, tables, empty states).
- **Auth set:** 43 pages in six layouts with Laravel Fortify field names.
- **States gallery:** loading, empty, errors, offline and slow network, permissions, session, validation, success, destructive actions and edge cases, each with copy guidance and accessibility wiring.
- **Example pages:** 53 system, marketing and app pages, app pages with loading, empty and error variants.
- **Icons and fonts:** 162 Lucide icons in one sprite with a subset tool (`vectra-icons`), self-hosted Inter (latin 44 KB).
- **Docs site** with a theme builder (live contrast report, export, share link) and a quality page built from the CI numbers.
- **AI manifest:** `dist/ai/vectra.manifest.json`, `llms.txt`, `llms-full.txt`, a Claude Code skill and `AGENTS.md`; every component example is validated from the manifest alone.

### Checked automatically on every push

Lint, size budgets, no external URLs, browser floor; axe on every page in four directions and two themes; rendered text contrast; a token contrast sweep across every accent hue; keyboard and behaviour tests; RTL, forced colours, 400% reflow, text spacing, focus visibility, reduced motion and transparency, target size; visual regression in a pinned browser image.

### Not verified yet

- Firefox and WebKit run the suite nightly, not on every push; Safari has not been tested on a real device.
- No manual screen reader pass (VoiceOver, NVDA, TalkBack) yet.
- No real-device pass on phones yet; phone layouts are emulated.
- Forced colours are tested with Chromium's emulation, not in Windows High Contrast itself.

# Changelog

Vectra follows [semantic versioning](https://semver.org). Pre-release versions (`-alpha`, `-beta`) may change markup and tokens between releases; each change is listed here.

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

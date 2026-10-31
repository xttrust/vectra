# Vectra v2: full catalogue

Status: agreed 31 Oct 2026, with the proposals in section 10 accepted. Companion to [PLAN.md](PLAN.md): the plan says how Vectra is built, this file says everything it will contain and when.

## 1. The bar

Benchmarked against what the leading kits ship: Tailwind Plus (UI blocks and Catalyst), shadcn/ui, Flowbite, Preline, daisyUI, Bootstrap, Untitled UI, Tabler, Radix and Ant Design. Together they set the expectation:

- **Components:** 60 to 100 primitives with every state, keyboard support and dark mode.
- **Blocks:** 300 to 600 copy-paste sections across marketing, app UI and e-commerce, several variants each.
- **Pages:** complete example pages and full site templates, not just isolated pieces.
- **Auth:** every flow, in more than one layout.

Vectra matches that breadth over v2.0 to v2.2, and keeps what none of them combine: zero dependencies, native platform first, four directions from one markup, AA contrast at any accent hue, and every item behind the CI gates in PLAN.md section 1. Depth per item still beats count: nothing ships without all its states, keyboard support, RTL and both themes.

### Tiers used below

| Tier | Ships in | Licence |
|---|---|---|
| **P0** | v2.0 | free (MIT) |
| **P1** | v2.1 | free (MIT) |
| **P2** | later, on demand | free (MIT) |
| **Pro** | v2.1 to v2.2 | paid (Vectra Pro) |

Status marks: **done** (merged), **planned** (has an agreed plan), blank (not started).

## 2. Components

About 115 components. Every one gets: all states (hover, focus, active, disabled, loading, error, empty where relevant), sizes where relevant, RTL, both themes in all four directions, axe, rendered contrast, visual baseline, and keyboard tests if interactive.

### Actions

| Component | Tier | Status | Notes |
|---|---|---|---|
| Button (primary, secondary, ghost, soft, danger, default; sizes, loading, block) | P0 | done | |
| Icon button | P0 | done | |
| Button group | P0 | done | |
| Link button | P0 | done | |
| Segmented control | P0 | done | |
| Toggle button (`aria-pressed`) | P0 | | |
| Split button (action + menu) | P1 | | uses dropdown menu |
| Copy button | P0 | | shared with code block |
| Floating action button | P2 | | mobile apps |

### Display

| Component | Tier | Status | Notes |
|---|---|---|---|
| Badge (tones, solid, outline, dot) | P0 | done | |
| Avatar + group | P0 | done | |
| Card (header, media, footer, link, feature) | P0 | done | |
| Stat card | P0 | done | |
| Divider (labelled) | P0 | done | |
| Empty state | P0 | done | |
| Skeleton | P0 | done | |
| Spinner | P0 | done | |
| Panel | P0 | | |
| Kbd | P0 | | |
| Tag / chip (removable, selectable) | P0 | | |
| List group (plain, with actions, with avatars) | P0 | | |
| Description list (stacked, two-column, in card) | P0 | | |
| Status indicator (online, busy, away; pulse) | P0 | | |
| Figure / image with caption, aspect-ratio frame | P0 | | |
| Icon (sprite `<use>`) | P0 | | after M5 |
| Ribbon / corner label | P2 | | |

### Feedback

| Component | Tier | Status | Notes |
|---|---|---|---|
| Alert (four tones) | P0 | done | |
| Progress (incl. indeterminate) | P0 | done | |
| Meter | P0 | done | |
| Toast (stack, actions, auto-dismiss) | P0 | | JS |
| Banner (page-level, dismissible) | P0 | | |
| Callout (docs style: note, tip, warning) | P0 | | |
| Progress ring | P1 | | SVG |
| Notification centre (panel + unread count) | P1 | | |

### Forms

| Component | Tier | Status | Notes |
|---|---|---|---|
| Field (label, hint, error), fieldset | P0 | planned | M3.2 |
| Input, textarea, select | P0 | planned | M3.2 |
| Checkbox, radio, switch | P0 | planned | M3.2 |
| Range | P0 | planned | M3.2 |
| Input group (addons, icons, buttons) | P0 | planned | M3.2 |
| Password reveal | P0 | planned | M3.2 static, M4 JS |
| File drop zone | P0 | planned | M3.2 static, M4 JS |
| Search field (with clear, shortcut hint) | P0 | | |
| Number stepper | P0 | | small JS |
| Character counter | P0 | | small JS |
| Checkbox / radio cards (rich selectable tiles) | P0 | | pricing, onboarding |
| Form layouts (stacked, two-column, sectioned settings, inline) | P0 | | |
| OTP input | P1 | | 2FA flows use a plain input in v2.0 |
| Tag input | P1 | | |
| Combobox / autocomplete | P1 | | |
| Multi-select | P1 | | built on combobox |
| Date and time input styling | P1 | | native inputs |
| Dual-thumb range | P1 | | |
| Rating input | P1 | | radio group |
| File list with upload progress | P1 | | |
| Multi-step form (wizard) | P1 | | uses steps |
| Date picker calendar | P2 | | |
| Colour picker | P2 | | |

### Overlays

| Component | Tier | Status | Notes |
|---|---|---|---|
| Dialog (incl. confirm / alert dialog) | P0 | | `<dialog>` |
| Drawer / sheet (four sides, bottom sheet on phones) | P0 | | `<dialog>` |
| Popover | P0 | | `popover` + anchor |
| Dropdown menu (items, groups, checkable, submenus) | P0 | | |
| Tooltip | P0 | | |
| Context menu | P1 | | |
| Hover card | P1 | | |
| Command palette (Ctrl/Cmd+K) | P1 | | |
| Lightbox (image viewer) | P1 | | `<dialog>` |

### Navigation

| Component | Tier | Status | Notes |
|---|---|---|---|
| Navbar (with mobile menu) | P0 | | |
| Sidebar nav (collapsible groups, icon rail) | P0 | | |
| Tabs (line, pill, vertical) | P0 | | JS |
| Breadcrumb | P0 | | |
| Pagination (numbered, simple, load more) | P0 | | |
| Steps (horizontal, vertical) | P0 | | |
| Skip link | P0 | | |
| Bottom tab bar (mobile) | P0 | | |
| Table of contents / scrollspy | P1 | | scroll-driven where supported |
| Mega menu | P1 | | |
| Back to top | P1 | | |
| Tree view | P2 | | |

### Disclosure

| Component | Tier | Status | Notes |
|---|---|---|---|
| Accordion (exclusive via `<details name>`) | P0 | | |
| Collapsible | P0 | | |
| Read more / line clamp | P1 | | |

### Data

| Component | Tier | Status | Notes |
|---|---|---|---|
| Table (responsive, sticky header, zebra, selectable rows, dense) | P0 | | |
| Timeline / activity feed | P0 | | |
| Data table (sort, filter, column toggle, bulk actions) | P1 | | |
| Charts: sparkline, bar, line, area, donut | P1 | | SVG, no library |
| Calendar (month, week) | P2 | | |
| Kanban board | P2 | | |

### Content

| Component | Tier | Status | Notes |
|---|---|---|---|
| Prose (long-form typography) | P0 | | |
| Code block with copy | P0 | | |
| Blockquote / testimonial | P0 | | |
| Pricing card | P0 | | |
| Logo cloud | P0 | | |
| Carousel (scroll-snap + buttons) | P1 | | |
| Gallery / masonry grid | P1 | | |
| Video embed (lite, click to load) | P1 | | no third-party request until clicked |
| Marquee / logo ticker | P1 | | respects reduced motion |
| Countdown | P1 | | |
| Map placeholder (static image + link) | P1 | | no map SDK |

### Theming and utility

| Component | Tier | Status | Notes |
|---|---|---|---|
| Direction switcher | P0 | | |
| Theme toggle (light, dark, system) | P0 | | |
| Customizer | P0 | | |
| Scroll area (styled scrollbars, fade edges) | P0 | | |
| Visually hidden, sticky helpers | P0 | | utilities |
| Cookie consent banner | P1 | | no tracking code shipped |
| Resizable split pane | P2 | | |

## 3. Sections (blocks)

A section is a full-width page piece built from components and layout primitives, with as little section-only CSS as possible. Every section ships several variants. **Core** variants are free and ship in v2.0 (the "about 20 core sections" in PLAN.md section 17); **Pro** variants extend each group.

Counts are variants: core / Pro.

### Navigation and chrome

| Section | Variants | Core variants |
|---|---|---|
| Navbar | 3 / 8 | simple, with CTA, centred logo. Pro: mega menu, search, transparent over hero, sticky shrink, two-row |
| Announcement bar | 1 / 3 | |
| App sidebar | 2 / 6 | grouped, icon rail. Pro: two-level, workspace switcher, with search, floating |
| App top bar | 1 / 4 | |
| Page header | 2 / 6 | title + actions, with tabs. Pro: with stats, with breadcrumb and meta, with cover |
| Footer | 3 / 8 | simple, multi-column, with newsletter. Pro: big brand, app footer, sitemap, social, dark band |
| Mobile bottom bar | 1 / 2 | |

### Marketing

| Section | Variants | Core variants |
|---|---|---|
| Hero | 4 / 14 | centred, split with image, with product screenshot, with signup form. Pro: video, bento, colour field, app store badges, stats, testimonial, illustration, angled, full-bleed image, carousel |
| Logo cloud | 1 / 4 | |
| Features | 3 / 12 | icon grid, alternating image/text, bento. Pro: tabs, list with screenshot, cards, numbered, comparison, centred, with code |
| How it works / steps | 1 / 4 | |
| Stats | 1 / 5 | |
| Testimonials | 2 / 8 | single quote, grid. Pro: wall, carousel, with logos, video, rating summary |
| Pricing | 2 / 8 | three tiers, monthly/yearly toggle. Pro: comparison table, single plan, usage slider, enterprise, add-ons |
| FAQ | 1 / 4 | accordion |
| CTA | 2 / 6 | banner, split |
| Newsletter | 1 / 4 | |
| Contact | 1 / 5 | form + details. Pro: offices, map, support channels, booking |
| Team | 1 / 5 | |
| Blog list | 1 / 5 | |
| Integrations grid | 0 / 3 | |
| Comparison (vs others) | 0 / 3 | |
| Timeline / changelog | 0 / 3 | |
| Gallery | 0 / 4 | |
| Trust and security badges | 0 / 3 | |
| Download app | 0 / 2 | |

### App UI

| Section | Variants | Core variants |
|---|---|---|
| Stats row | 1 / 4 | |
| List with actions | 1 / 5 | |
| Table with toolbar and filters | 1 / 5 | |
| Settings form (sectioned) | 1 / 4 | |
| Description list (detail view) | 1 / 3 | |
| Empty states (first run, no results, error) | 2 / 6 | |
| Activity feed / comments | 0 / 4 | |
| Notifications panel | 0 / 3 | |
| Team members / invites | 0 / 3 | |
| Billing: plan card, invoices, payment method | 0 / 5 | |
| API keys / tokens list | 0 / 2 | |
| Danger zone | 1 / 2 | |
| Onboarding checklist | 0 / 3 | |
| Chat thread | 0 / 3 | |

### E-commerce (all Pro)

Product grid (6), product card (6), product overview (5), image gallery (3), reviews (4), category filters (4), cart drawer and cart page (4), order summary (3), checkout form (4), order confirmation (2), promo banner (3), shipping progress (2).

### Local business and music (all Pro, CreativeIgniter niches)

Service list with prices, service area, before and after slider, opening hours, review summary (Google style, no embed), quote / booking request form, emergency call bar, restaurant menu, events listing, gig and tour dates, release / tracklist, artist bio, press kit.

### Totals

| | Core (free) | Pro |
|---|---|---|
| Section variants | about 45 | about 300 |

## 4. Auth

All free, all P0. This is the "full auth set" in PLAN.md section 17, made concrete.

### Layouts (each flow works in all of them, with the same markup inside)

1. **Centred card**: logo, card, footer links.
2. **Split screen, image**: form on one side, photo or colour field on the other.
3. **Split screen, testimonial or product panel**.
4. **Minimal**: no card, form on the page background.
5. **Full-bleed background**: card floating over an image or the Glass colour field.
6. **Dialog**: sign-in inside a `<dialog>` over a page.

### Flows

| Group | Pages |
|---|---|
| Sign in | password, magic link, passkey prompt, social buttons, SSO / SAML (company email first), remember me |
| Sign up | single step, multi-step (account, profile, workspace), with plan picker, invite-only waitlist |
| Recovery | forgot password, check your email, reset password, password changed |
| Verification | verify email (link sent, code entry), email verified |
| Two-factor | enter code, use recovery code, set up 2FA (QR + secret + confirm), recovery codes shown, SMS fallback |
| Sessions | lock screen, session expired, signed out, too many attempts (429), account locked, account suspended |
| Accounts | accept invite, choose workspace or team, consent / terms update, delete account confirmation |
| First run | welcome, onboarding steps, connect accounts, empty dashboard |

Gallery page shows login in all six layouts; every other flow ships in centred card and split screen, and the docs explain how to drop any flow into the other layouts. About 45 pages.

Laravel note: field names and error placement match Laravel Breeze / Fortify defaults, so the Blade package (v2.1) can wire them straight to Fortify routes.

## 5. Pages

Complete, realistic pages built only from components and sections. These are the demos people judge the kit by.

### System pages (P0, free)

401, 403, 404, 419 (page expired, Laravel), 429, 500, 503 maintenance, offline, coming soon. Two layouts: minimal and illustrated.

### Marketing pages

| Page | Tier |
|---|---|
| SaaS home | P0 |
| Product landing | P0 |
| Pricing | P0 |
| About | P0 |
| Contact | P0 |
| Blog index, blog post | P0 |
| Legal: terms, privacy, cookies | P0 |
| Features | P1 |
| Changelog | P1 |
| Careers, job detail | P1 |
| Customers, case study | P1 |
| Help centre, help article | P1 |
| Docs page (sidebar, prose, TOC) | P1 |
| Status page | P1 |
| Waitlist / launch | P1 |
| Integrations, integration detail | Pro |
| Press / media kit | Pro |
| Event page | Pro |
| Link in bio | Pro |

### App pages

Scope rule from PLAN.md section 13: Vectra covers general app UI; data-heavy admin screens belong to AdminVora. Vectra ships one showcase dashboard, not a dashboard family.

| Page | Tier |
|---|---|
| App shell (sidebar + top bar), stacked shell (top nav only) | P0 |
| Overview dashboard (one showcase) | P0 |
| List page, detail page | P0 |
| Settings: profile, account, security (password, 2FA, sessions), notifications | P0 |
| Settings: billing, team, API keys, integrations | P1 |
| User profile (public) | P1 |
| Notifications | P1 |
| Search results | P1 |
| Inbox / messages, chat | Pro |
| File manager | Pro |
| Calendar | P2 (needs the calendar component) |
| Kanban | P2 (needs the kanban component) |

### E-commerce pages (Pro)

Storefront home, category with filters, product detail, cart, checkout, order confirmation, order history, wishlist, account.

### Email templates (Pro, v2.2)

Welcome, verify email, reset password, magic link, invite, receipt, invoice, notification digest. Table-based HTML with inlined CSS, tested in the main mail clients. Separate toolchain from the kit, so it comes last.

### Print

Invoice and receipt print styles (P1): `@media print` rules in the kit, plus an invoice page.

## 6. Site templates (Pro, v2.2)

Full multi-page sites, each 5 to 10 pages, each shown in its best-fitting direction:

1. Trades (roofing, gardening, cleaning): home, services, service detail, areas, gallery, reviews, quote form.
2. Bar and restaurant: home, menu, events, bookings, gallery, contact.
3. Music label: home, releases, release detail, artists, artist detail, events, demo submission.
4. Artist / DJ: home, music, tour dates, press kit, contact.
5. SaaS: full marketing site plus auth plus app shell.
6. Agency / portfolio: home, work, case study, services, about, contact.
7. Docs: home, guide, reference, search, changelog.
8. Blog / magazine: home, category, article, author.
9. Online shop: the e-commerce pages as one site.
10. Startup launch: one-page with waitlist.

## 7. Kit-wide features

| Feature | Tier | Notes |
|---|---|---|
| Four directions (Tech, Editorial, Soft, Glass) | P0 | done |
| Light, dark, system; any accent hue at AA | P0 | done |
| Density and corner presets | P0 | done |
| RTL for every component and section | P0 | logical properties throughout, RTL visual baselines on gallery pages |
| Reduced motion, reduced transparency, forced colours | P0 | |
| Works without JS | P0 | test run with JS off |
| Container-query responsive components | P0 | components adapt to their slot, not the viewport |
| Motion set: enter/exit, view-transition theme reveal, scroll reveal | P0 | progressive enhancement |
| Icon sprite (about 150) + subset tool | P0 | M5 |
| Self-hosted Inter, subset | P0 | M5 |
| Docs site with live direction switch on every example | P0 | M6 |
| Theme builder with contrast report, shareable link, export | P0 | M6 |
| Copy-paste markup for every component, section and page | P0 | M6 |
| Public quality page (a11y, sizes, browsers) fed by CI | P0 | M6 |
| AI manifest, `llms.txt`, Claude Code skill | P0 | M8b |
| Print styles | P1 | |
| `npx vectra add <block>` | P1 | |
| Laravel Blade package | P1 | |
| Starter kits: plain HTML, Laravel (Blade), Vite | P1 | |
| Playground (edit markup live, switch direction) | P1 | on the docs site |
| Vue components for Inertia | P1 to P2 | v2.2 |
| Token exports: W3C DTCG JSON, Tailwind preset | Pro-adjacent, free | v2.2 |
| Figma library | later | after token exports prove the need |

## 8. Size and test budget at this scale

- **Components CSS** keeps its 22 KB gz ceiling for P0. P1 components get their own budget line when v2.1 starts.
- **Sections** add a new `vectra.sections.css` (budget 8 KB gz for the core set). Sections should be mostly composition; any section that needs more than about 30 lines of its own CSS is a sign a component is missing.
- **Visual tests** grow fast (pages × 4 directions × 2 themes × 2 widths). Rule: component and section gallery pages run the full matrix on every push; full example pages run two directions on every push and the full matrix in the nightly job.
- **axe** runs on every page in the full matrix, always. No page is exempt.

## 9. Milestones, re-cut

Replaces the M3 to M9 rows of PLAN.md section 14. Same gates as before: one branch and one PR per milestone (or sub-milestone), merged only with green checks.

| # | Milestone | Contains | Size |
|---|---|---|---|
| M3.1 | Actions, display, feedback | done | L |
| M3.2 | Forms (static) | planned | M |
| M3.3 | Display and form additions | toggle button, panel, kbd, tag, list group, description list, status indicator, figure, banner, callout, search field, checkbox cards, form layouts | M |
| M3.4 | Navigation and disclosure (static) | navbar, sidebar, tabs, breadcrumb, pagination, steps, skip link, bottom bar, accordion, collapsible | M |
| M3.5 | Overlays, data, content (static) | dialog, drawer, popover, menu, tooltip, table, timeline, prose, code block, testimonial, pricing card, logo cloud, scroll area | L |
| M4 | JS core + interactive P0 | toast, tabs, menu, mobile nav, dialog helpers, password reveal, drop zone, stepper, counter, copy, theming components | L |
| M5 | Icons + fonts | sprite, subset tool, Inter subset | S |
| M6 | Docs site + theme builder | as PLAN.md section 11 | L |
| M7.1 | Core sections | the about 45 core variants in section 3, `vectra.sections.css` | L |
| M7.2 | Auth set | six layouts, all flows in section 4 | L |
| M7.3 | Pages | system pages, P0 marketing pages, P0 app pages, v1 pages rebuilt | L |
| M8 | Hardening | screen readers, devices, forced colours, zoom, RTL pass, performance | M |
| M8b | AI manifest | unchanged | S |
| M9 | Release v2.0 | unchanged | S |
| v2.1 | Reach | P1 components, P1 pages, print, Blade package, `npx vectra add`, starter kits, playground, first Pro blocks | L |
| v2.2 | Templates and Pro | Pro sections and pages, e-commerce, site templates, email templates, Vue, token exports | L |

## 10. Decisions (agreed 31 Oct 2026)

1. **Free vs Pro line.** Proposed: all components, auth, system pages, core sections (about 45 variants) and P0/P1 pages free; extra section variants, e-commerce, niche sections, site templates and email templates Pro.
2. **App pages vs AdminVora.** Proposed: Vectra ships one showcase dashboard plus settings, profile and list/detail pages; dashboard families and data-heavy screens stay in AdminVora.
3. **v2.0 scope.** Proposed: v2.0 is everything marked P0 here (about 75 components, 45 section variants, 45 auth pages, about 25 pages). Everything else moves to v2.1 and later, so the release isn't held up by breadth.
4. **Email templates.** Proposed: Pro, v2.2, last, because they need their own toolchain and mail-client testing.

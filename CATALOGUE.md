# Vectra v2: full catalogue

Status: agreed 31 Oct 2026, with the proposals in section 10 accepted. Section 11 (states and patterns) added the same day. Companion to [PLAN.md](PLAN.md): the plan says how Vectra is built, this file says everything it will contain and when.

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
| Toggle button (`aria-pressed`) | P0 | done | |
| Split button (action + menu) | P1 | done | uses dropdown menu |
| Copy button | P0 | done | |
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
| Panel | P0 | done | |
| Kbd | P0 | done | |
| Tag / chip (removable, selectable) | P0 | done | |
| List group (plain, with actions, with avatars) | P0 | done | |
| Description list (stacked, two-column, in card) | P0 | done | |
| Status indicator (online, busy, away; pulse) | P0 | done | |
| Figure / image with caption, aspect-ratio frame | P0 | done | |
| Icon (sprite `<use>`) | P0 | done | M5, `examples/icons/` |
| Ribbon / corner label | P2 | | |

### Feedback

| Component | Tier | Status | Notes |
|---|---|---|---|
| Alert (four tones) | P0 | done | |
| Progress (incl. indeterminate) | P0 | done | |
| Meter | P0 | done | |
| Toast (stack, actions, auto-dismiss) | P0 | done | |
| Banner (page-level, dismissible) | P0 | done | |
| Callout (docs style: note, tip, warning) | P0 | done | |
| Inline save status (saving, saved, failed, offline) | P0 | done | |
| Connection banner (offline, back online, slow network) | P0 | done | |
| Session timeout warning (countdown dialog) | P0 | done | |
| Progress ring | P1 | | SVG |
| Typing / presence indicator | P1 | | section 11 |
| Notification centre (panel + unread count) | P1 | | |

### Forms

| Component | Tier | Status | Notes |
|---|---|---|---|
| Field (label, hint, error), fieldset | P0 | done | |
| Input, textarea, select | P0 | done | |
| Checkbox, radio, switch | P0 | done | |
| Range | P0 | done | |
| Input group (addons, icons, buttons) | P0 | done | |
| Password reveal | P0 | done | |
| File drop zone | P0 | done | |
| Search field (with clear, shortcut hint) | P0 | done | |
| Number stepper | P0 | done | |
| Character counter | P0 | done | |
| Error summary (links to each invalid field, takes focus on submit) | P0 | done | |
| Password strength meter | P0 | done | built on meter |
| Async field check (checking, available, taken) | P0 | done | |
| Checkbox / radio cards (rich selectable tiles) | P0 | done | pricing, onboarding |
| Form layouts (stacked, two-column, sectioned settings, inline) | P0 | done | |
| OTP input | P1 | | 2FA flows use a plain input in v2.0 |
| Tag input | P1 | | |
| Combobox / autocomplete | P1 | | |
| Multi-select | P1 | | built on combobox |
| Date and time input styling | P1 | | native inputs |
| Dual-thumb range | P1 | | |
| Rating input | P1 | | radio group |
| File list with upload progress | P1 | | |
| Multi-step form (wizard) | P1 | | uses steps |
| Repeater fields (add and remove rows, e.g. extra emails or line items) | P1 | | small JS |
| Date picker calendar | P2 | | |
| Colour picker | P2 | | |

### Overlays

| Component | Tier | Status | Notes |
|---|---|---|---|
| Dialog (incl. confirm / alert dialog) | P0 | done | open, close and light-dismiss hooks |
| Drawer / sheet (four sides, bottom sheet on phones) | P0 | done | `<dialog>` |
| Popover | P0 | done | `popover` + anchor |
| Dropdown menu (items, groups, checkable, submenus) | P0 | done | arrow keys, Home and End |
| Tooltip | P0 | done | Escape dismisses, stays open on hover |
| Context menu | P1 | | |
| Hover card | P1 | | |
| Command palette (Ctrl/Cmd+K) | P1 | | |
| Lightbox (image viewer) | P1 | | `<dialog>` |

### Navigation

| Component | Tier | Status | Notes |
|---|---|---|---|
| Navbar (with mobile menu) | P0 | done | mobile menu works without JS |
| Sidebar nav (collapsible groups, icon rail) | P0 | done | |
| Tabs (line, pill, vertical) | P0 | done | arrow keys, Home and End |
| Breadcrumb | P0 | done | |
| Pagination (numbered, simple, load more) | P0 | done | |
| Steps (horizontal, vertical) | P0 | done | |
| Skip link | P0 | done | |
| Bottom tab bar (mobile) | P0 | done | |
| Table of contents / scrollspy | P1 | | scroll-driven where supported |
| Mega menu | P1 | done | `<details name>` disclosure; inline in the mobile menu |
| Back to top | P1 | done | plain link; scroll-driven reveal |
| Tree view | P2 | | |

### Disclosure

| Component | Tier | Status | Notes |
|---|---|---|---|
| Accordion (exclusive via `<details name>`) | P0 | done | |
| Collapsible | P0 | done | |
| Read more / line clamp | P1 | | |

### Data

| Component | Tier | Status | Notes |
|---|---|---|---|
| Table (responsive, sticky header, zebra, selectable rows, dense) | P0 | done | |
| Timeline / activity feed | P0 | done | |
| Data table (sort, filter, column toggle, bulk actions) | P1 | | |
| Charts: sparkline, bar, line, area, donut | P1 | | SVG, no library |
| Chart legend and legend indicator | P1 | | with the charts |
| Calendar (month, week) | P2 | | |
| Kanban board | P2 | | |

### Content

| Component | Tier | Status | Notes |
|---|---|---|---|
| Prose (long-form typography) | P0 | done | |
| Code block with copy | P0 | done | copy button |
| Blockquote / testimonial | P0 | done | |
| Pricing card | P0 | done | |
| Logo cloud | P0 | done | |
| Carousel (scroll-snap + buttons) | P1 | | |
| Gallery / masonry grid | P1 | | |
| Video embed (lite, click to load) | P1 | | no third-party request until clicked |
| Marquee / logo ticker | P1 | | respects reduced motion |
| Device frames (phone, laptop, browser window) for screenshots in heroes and features | P1 | | pure CSS, holds real Vectra UI or an image |
| Countdown | P1 | | |
| Map placeholder (static image + link) | P1 | | no map SDK |

### Conversation and AI

Added 31 Oct 2026 after comparing current kits (section 12): chat and AI interfaces are now a standard category.

| Component | Tier | Status | Notes |
|---|---|---|---|
| Message bubble (sent, received, system, with avatar, time and status) | P1 | | |
| Message thread with scroller (sticks to the newest message, "new messages" jump) | P1 | | JS |
| Prompt input (auto-growing textarea, attachments, send and stop, shortcut hints) | P1 | | builds on input group and drop zone |
| Attachment chip and preview (file, image, upload progress, remove) | P1 | | |
| Streaming reply and reasoning or tool trace (collapsible steps) | P1 | | builds on collapsible and timeline |
| Suggested prompts | P1 | | builds on tag |

### Theming and utility

| Component | Tier | Status | Notes |
|---|---|---|---|
| Direction switcher | P0 | done | |
| Theme toggle (light, dark, system) | P0 | done | |
| Customizer | P0 | done | |
| Scroll area (styled scrollbars, fade edges) | P0 | done | |
| Visually hidden, sticky helpers | P0 | | shipped as utilities, not a component: `.v-sr-only` and `.v-sticky` in utilities.css, on the Utilities docs page |
| Cookie consent banner | P1 | | no tracking code shipped |
| Menubar (desktop-app style menus) | P2 | | |
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
| M3.2 | Forms (static) | done | M |
| M3.3 | Display and form additions | done: toggle button, panel, kbd, tag, list group, description list, status indicator, figure, banner, callout, search field, checkbox cards, form layouts | M |
| M3.4 | Navigation and disclosure (static) | done: navbar, sidebar, tabs, breadcrumb, pagination, steps, skip link, bottom bar, accordion, collapsible | M |
| M3.5 | Overlays, data, content (static) | done: dialog, drawer, popover, menu, tooltip, table, timeline, prose, code block, testimonial, pricing card, logo cloud, scroll area | L |
| M4 | JS core + interactive P0 | done: toast, tabs, menu, mobile nav, dialog helpers, password reveal, drop zone, stepper, counter, copy, theming components, plus the state helpers in section 11 (connection and slow-network detection, session timeout, error summary focus, unsaved changes, live announcements) | L |
| M5 | Icons + fonts | done: sprite, subset tool, Inter subset | S |
| M6 | Docs site + theme builder | done: docs site (87 pages, 72 component pages), theme builder with live contrast report, quality page | L |
| M7.1 | Core sections | done: 42 core variants in section 3, `vectra.sections.css` | L |
| M7.2 | Auth set | done: six layouts, all flows in section 4 | L |
| M7.3 | Pages | done: 53 pages (system pages in two layouts, marketing pages, app pages with loading, empty and error variants) | L |
| M7.4 | States | done: the states gallery and copy guide in section 11; every P0 app page gets its loading, empty and error variants | M |
| M8 | Hardening | automated part done (M8a: RTL, forced colours, 400% reflow, text spacing, focus, reduced motion and transparency, target size); manual screen reader and real-device pass still to do | M |
| M8b | AI manifest | done: manifest, `llms.txt`, `llms-full.txt`, Claude Code skill and `AGENTS.md`, every component example validated from the manifest alone | S |
| M9 | Release v2.0 | unchanged | S |
| v2.1 | Reach | P1 components, P1 pages, print, Blade package, `npx vectra add`, starter kits, playground, first Pro blocks | L |
| v2.2 | Templates and Pro | Pro sections and pages, e-commerce, site templates, email templates, Vue, token exports | L |

## 10. Decisions (agreed 31 Oct 2026)

1. **Free vs Pro line.** Proposed: all components, auth, system pages, core sections (about 45 variants) and P0/P1 pages free; extra section variants, e-commerce, niche sections, site templates and email templates Pro.
2. **App pages vs AdminVora.** Proposed: Vectra ships one showcase dashboard plus settings, profile and list/detail pages; dashboard families and data-heavy screens stay in AdminVora.
3. **v2.0 scope.** Proposed: v2.0 is everything marked P0 here (about 75 components, 45 section variants, 45 auth pages, about 25 pages). Everything else moves to v2.1 and later, so the release isn't held up by breadth.
4. **Email templates.** Proposed: Pro, v2.2, last, because they need their own toolchain and mail-client testing.

## 11. States and patterns

Real products spend most of their screens in some state other than "everything loaded and fine". The best kits show the happy path; Vectra ships the other states too, as a first-class part of the kit. Every state below gets:

- **A visual** built from existing components (empty state, skeleton, alert, banner, toast, dialog, progress) plus the few new pieces marked in section 2.
- **Copy guidance**: what happened, why, and what the person can do next, in plain words, with a sample line ready to paste.
- **Accessibility wiring**: the right live region (`role="status"` for polite news, `role="alert"` only when something urgent interrupts), where focus goes, and enough time to react (WCAG 2.2.1).
- **Tests**: axe and rendered contrast on the states gallery, plus behaviour tests for anything with JS.

Built in M7.4 as `examples/states/` (one gallery, grouped like the tables below) and a copy guide on the docs site. The JS parts (detection, timers, focus) come in M4. Every P0 app page in section 5 also ships its loading, empty and error variants.

### Loading

| State | Variants | Tier |
|---|---|---|
| Page skeletons | list, card grid, table, detail view, dashboard, profile | P0 |
| Inline loading | button busy (`aria-busy`), spinner in a field, refreshing a section in place | P0 |
| Long task progress | determinate bar with steps and time left, indeterminate with status text | P0 |
| Slow loading | "Taking longer than usual" message after a delay, with a cancel or retry | P0 |
| Image placeholders | colour or low-res placeholder, aspect ratio kept so nothing jumps | P0 |
| Loading more | infinite list footer, "load more" busy, end of list | P0 |
| Optimistic update | item shown at once in a pending style, rolled back with a message if it fails | P1 |
| Streaming text | typing indicator and progressive text for AI or chat replies | P1 |

### Empty

| State | Variants | Tier |
|---|---|---|
| First run | no data yet, with one clear first action and an optional sample-data link | P0 |
| No search results | the query repeated, spelling hint, suggestions, "clear search" | P0 |
| Filtered to nothing | which filters are on, "clear filters" | P0 |
| All done | inbox zero, no notifications, all tasks complete (calm, a little positive) | P0 |
| Nothing selected | the detail pane before a choice in a list and detail layout | P0 |
| Empty table, list, cart, favourites | in-place versions sized to their container | P0 |
| Item gone | deleted, archived, moved, with a way back or a restore action | P1 |

### Errors

| State | Variants | Tier |
|---|---|---|
| Field errors | required, format, too short or long, mismatch (password confirm), server rejected | P0 |
| Error summary | list at the top of the form linking to each field; focus moves to it on submit | P0 |
| Section failed to load | message in place of the section with retry; rest of the page keeps working | P0 |
| Action failed | toast or inline alert with retry and, where it helps, details to copy | P0 |
| Not found in app | item or page missing inside the app shell, not the bare 404 | P0 |
| Partial failure | "18 of 20 sent", which ones failed and why, retry the failed ones | P1 |
| Upload failed | per file, with reason (too large, wrong type, network) and retry | P0 |
| Payment failed | card declined, authentication needed, expired card | P1 |
| Too many requests | 429 with a countdown until it can be tried again | P0 |
| Edit conflict | someone else saved first: compare, keep mine, take theirs | P1 |
| Server error and maintenance | 500 and 503 inside the app shell, status page link | P0 |

### Connection and network

| State | Variants | Tier |
|---|---|---|
| Offline | banner that appears when the connection drops and says what still works | P0 |
| Back online | short polite toast, then the banner goes | P0 |
| Slow network | quiet notice when requests take long, lighter images suggested | P0 |
| Retrying | "Retrying in 5s" with a manual retry now | P0 |
| Sync status | synced, syncing, changes waiting to sync, sync failed | P0 |
| Stale data | "Updated 10 minutes ago", refresh action | P1 |
| Offline queue | actions saved while offline, sent when back, with a count | P1 |

### Permissions and access

| State | Variants | Tier |
|---|---|---|
| No permission | full page (403) and inline locked section, who to ask | P0 |
| Request access | form, then "request sent" and "request declined" | P0 |
| View only | read-only banner and disabled editing controls with the reason | P0 |
| Plan limit | feature locked or limit reached, with an upgrade prompt that isn't pushy | P0 |
| Invitation pending | invited but not yet accepted, resend | P1 |
| Account suspended or not available in a region | full page with next steps | P1 |
| Browser permission denied | camera, microphone, location, notifications: what was blocked and how to turn it back on | P1 |
| Embed blocked by consent | placeholder for a video or map until cookies are accepted | P1 |

### Session and account

| State | Variants | Tier |
|---|---|---|
| Session about to expire | dialog with a countdown and "stay signed in" (WCAG 2.2.1) | P0 |
| Session expired | sign in again without losing what was typed where possible | P0 |
| Signed out elsewhere | "You were signed out on this device" | P0 |
| Email not verified | persistent banner with resend | P0 |
| Viewing as another user | impersonation banner that can't be missed, with "stop" | P1 |
| Trial ending, payment overdue | banners with the date and one action | P1 |
| New sign-in detected | notice with "this was me" and "secure my account" | P1 |

### Form validation

| Pattern | Notes | Tier |
|---|---|---|
| When errors show | after the field is left (`:user-invalid`), on submit for untouched fields, never while typing the first time | P0, done in M3.2 |
| Server errors | `aria-invalid` with the message always visible, linked by `aria-describedby` | P0, done in M3.2 |
| Error summary | see Errors above | P0 |
| Valid field | quiet success mark for fields where it helps (username, card number), not on every field | P0 |
| Async checks | "Checking", "Available", "Taken, try ..." with suggestions | P0 |
| Password strength | meter with plain-language hints, no rules hidden until failure | P0 |
| Character limits | counter that announces when close to the limit | P0 |
| Submit button | stays enabled; pressing it shows what is missing instead of a dead button | P0 |
| Unsaved changes | warning when leaving with edits, and on closing a dialog with edits | P0 |
| Autosave | saving, saved (with time), failed with retry | P0 |
| Multi-step forms | per-step validation, step marked with errors, progress kept on back | P1 |

### Success and confirmation

| State | Variants | Tier |
|---|---|---|
| Saved | inline "Saved" status and a short toast, not both | P0 |
| Done page | sent, order placed, booking confirmed, with what happens next | P0 |
| Undo | toast with undo after delete or archive, long enough to use | P0 |
| Check your email | after sign-up, reset, invite, with resend and "wrong address?" | P0 |
| Copied | button feedback and announcement | P0 |
| Milestone reached | onboarding complete, first sale: a small celebration, still under reduced motion | P1 |

### Destructive actions

| Pattern | Notes | Tier |
|---|---|---|
| Confirm dialog | says exactly what will be lost, the destructive button names the action | P0 |
| Type to confirm | type the project name for the most serious actions | P0 |
| Bulk actions | count in the button and the dialog ("Delete 12 files") | P0 |
| Soft delete | moved to trash with restore, emptied later | P1 |

### Background work

| State | Variants | Tier |
|---|---|---|
| Processing | job started, running in the background, notify when done | P1 |
| Import results | "240 imported, 3 skipped" with reasons and a download of the skipped rows | P1 |
| Queued | position in queue or expected wait | P1 |

### Content status

| State | Variants | Tier |
|---|---|---|
| Publishing | draft, scheduled, published, archived, with matching badges | P0 |
| New and unread | unread dot, "new" badge, "3 new posts, show them" without jumping the page | P0 |
| Feature labels | beta, new, deprecated | P0 |
| Locked content | members-only or paid, with a preview and an unlock action | P1 |
| Expired | offer or link expired, what to do instead | P1 |

### Environment and edge cases

| Case | Notes | Tier |
|---|---|---|
| No JavaScript | everything still readable and usable (PLAN.md section 1); `<noscript>` notice only where a feature truly needs JS | P0 |
| Unsupported browser | quiet notice below the floor in PLAN.md section 3, page still usable | P1 |
| Long and unusual content | very long names and words, missing images, missing avatars, zero and huge numbers: nothing breaks or overflows | P0 |
| Small screens and zoom | 320 px wide and 400% zoom reflow (WCAG 1.4.10) | P0 |
| Right to left | every state in RTL | P0 |
| Reduced motion, forced colours, print | every state stays clear | P0 |
| New version available | "A new version is ready, reload" | P1 |

## 12. Research notes (31 Oct 2026)

Compared against the current component indexes of shadcn/ui and Preline, and the published structure of Tailwind Plus (Application UI, Marketing, Ecommerce; about 670 block variants by one unofficial count). Gaps found and now in the tables above: conversation and AI components, device frames, chart legends, repeater fields, menubar.

Platform features to use as progressive enhancement as they reach the browser floor (PLAN.md section 3), each with today's approach as the fallback:

| Feature | Use | Fallback today |
|---|---|---|
| `command` / `commandfor` invokers | open dialogs and drawers without JS | `data-v-dialog-open` (M4) |
| `popover="hint"` with `interestfor` | declarative tooltips and hover cards | `data-v-tooltip` (M4) |
| `closedby="any"` on `<dialog>` | light-dismiss dialogs | `data-v-dismissable` (M4) |
| `appearance: base-select` | fully styled `<select>` with rich options | styled native select (M3.2) |
| Cross-document view transitions | page-to-page transitions on multi-page sites | none needed |

Sources: [shadcn/ui components](https://ui.shadcn.com/docs/components), [Preline docs](https://preline.co/docs/index.html), [Tailwind Plus ecommerce blocks](https://tailwindcss.com/plus/ui-blocks/ecommerce), [Chrome: What's new in Web UI, I/O 2025](https://developer.chrome.com/blog/new-in-web-ui-io-2025-recap), [CSS Wrapped 2025](https://chrome.dev/css-wrapped-2025/).

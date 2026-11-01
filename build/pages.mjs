/* Dev-only generator for the full example pages (M7.3): system pages, marketing pages and app pages, plus
   the index that links them. Content lives in build/pages/*.mjs. The generated HTML is committed, because
   that is what people copy. Run `npm run pages` after editing; `node build/pages.mjs --check` (part of
   npm run check) fails if the committed pages are stale. saas-home.html and app-shell.html are hand-written
   and are not touched here. */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { page, icon } from './pages/shared.mjs';
import { SYSTEM, systemPages } from './pages/system.mjs';
import { marketingPages } from './pages/marketing.mjs';
import { morePages } from './pages/marketing-more.mjs';
import { appPages } from './pages/app.mjs';
import { moreAppPages } from './pages/app-more.mjs';

const OUT = 'examples/pages';
const CHECK = process.argv.includes('--check');

const files = new Map([...systemPages(page), ...marketingPages(page), ...morePages(page), ...appPages(page), ...moreAppPages(page)].map(([f, html]) => [`${OUT}/${f}`, html]));

const group = (id, title, text, cards) => `<section class="v-stack" aria-labelledby="${id}" style="--v-gap: var(--v-space-5)">
<div class="v-stack" style="--v-gap: var(--v-space-2)">
<h2 id="${id}">${title}</h2>
<p class="v-text-secondary v-max-prose">${text}</p>
</div>
<div class="v-grid" style="--v-min: 16rem">
${cards.join('\n')}
</div>
</section>`;
const card = (ic, title, text, links) => `<div class="v-card">
<div class="v-flex v-items-center v-gap-3"><span class="v-feature-icon">${icon(ic)}</span><h3 class="v-card-title">${title}</h3></div>
<p class="v-card-text">${text}</p>
<ul class="v-cluster v-text-sm" style="--v-gap: var(--v-space-2) var(--v-space-4)">
${links.map(([t, h]) => `<li><a href="${h}">${t}</a></li>`).join('\n')}
</ul>
</div>`;

const MARKETING = [
  ['home', 'SaaS home', 'The full home page: hero, features, customers, pricing, FAQ.', [['Open', 'saas-home.html']]],
  ['zap', 'Product landing', 'One product, told in steps, features, a quote and numbers.', [['Open', 'landing.html']]],
  ['card', 'Pricing', 'Plans with a monthly and yearly switch, a comparison table and FAQ.', [['Open', 'pricing.html']]],
  ['users', 'About', 'Story, values, a milestone timeline and the team.', [['Open', 'about.html']]],
  ['mail', 'Contact', 'Ways to get in touch and a validated form.', [['Open', 'contact.html']]],
  ['book', 'Blog', 'Index with a featured post, and a post with a table of contents.', [['Index', 'blog.html'], ['Post', 'blog-post.html']]],
  ['file', 'Legal', 'Terms, privacy and cookies, with contents and marked example text.', [['Terms', 'terms.html'], ['Privacy', 'privacy.html'], ['Cookies', 'cookies.html']]],
  ['zap', 'Features', 'A product tour with device frames around live screens.', [['Open', 'features.html']]],
  ['sparkle', 'Changelog', 'Releases with tags and a scrollspy list of versions.', [['Open', 'changelog.html']]],
  ['heart', 'Careers', 'Values, open roles, hiring steps, and a job with a multi-step application.', [['Careers', 'careers.html'], ['Job', 'careers-job.html']]],
  ['users', 'Customers', 'A logo marquee, a quote carousel and stories, plus a case study with a chart.', [['Customers', 'customers.html'], ['Case study', 'case-study.html']]],
  ['help', 'Help centre', 'Search with suggestions, topics, and an article with steps.', [['Help centre', 'help.html'], ['Article', 'help-article.html']]],
  ['book', 'Developer docs', 'Sidebar navigation, code with copy buttons and a table of contents.', [['Open', 'docs.html']]],
  ['chart', 'Status', 'Live service status, 30-day uptime and past incidents.', [['Open', 'status.html']]],
  ['sparkle', 'Waitlist', 'A launch page with a signup form.', [['Open', 'waitlist.html']]],
];
const SYSTEM_ICONS = { 401: 'key', 403: 'lock', 404: 'search', 419: 'clock', 429: 'zap', 500: 'alert', 503: 'gear', offline: 'wifi', 'coming-soon': 'sparkle' };
const states = (slug) => [['Loaded', `app/${slug}.html`], ['Loading', `app/${slug}-loading.html`], ['Empty', `app/${slug}-empty.html`], ['Error', `app/${slug}-error.html`]];
const APP = [
  ['layers', 'Sidebar shell', 'Sidebar, top bar and phone tab bar, with the overview dashboard.', [['Open', 'app-shell.html']]],
  ['menu', 'Stacked shell', 'Top navigation only, with an account menu.', [['Open', 'app/stacked.html']]],
  ['users', 'List page', 'Table with search, filters, bulk actions and pagination.', states('list')],
  ['user', 'Detail page', 'Header with actions, details, activity and related items.', states('detail')],
  ['user', 'Settings: profile', 'Photo, personal details, language and time.', states('settings-profile')],
  ['building', 'Settings: account', 'Business details, sign-in email, plan and danger zone.', states('settings-account')],
  ['shield', 'Settings: security', 'Password with strength meter, two-step sign-in, devices.', states('settings-security')],
  ['bell', 'Settings: notifications', 'Switches per channel, quiet hours and save status.', states('settings-notifications')],
  ['card', 'Settings: billing', 'Plan, usage rings, payment method and invoices.', [['Open', 'app/settings-billing.html']]],
  ['users', 'Settings: team', 'Members with roles and invites by tag input.', [['Open', 'app/settings-team.html']]],
  ['key', 'Settings: API keys', 'Keys with copy buttons, usage columns and a new key dialog.', [['Open', 'app/settings-api.html']]],
  ['link', 'Settings: integrations', 'Connected apps and ones to add.', [['Open', 'app/settings-integrations.html']]],
  ['bell', 'Notifications', 'Every notification, grouped by day, with mark all as read.', [['Open', 'app/notifications.html']]],
  ['search', 'Search results', 'Results across every kind of record.', [['Open', 'app/search.html']]],
  ['building', 'Business profile', 'About with read more, work in a lightbox, reviews.', [['Open', 'app/profile.html']]],
];

const index = `<main class="v-container ex-main v-skip-target" id="main" tabindex="-1">
<section class="v-stack">
<p class="v-kicker">Examples · pages</p>
<h1 class="v-display">Full pages.</h1>
<p class="v-lead v-max-prose">Complete pages for a pretend product called Northwind, built only from Vectra components and sections. Copy a whole page, or lift the part you need.</p>
<p><a href="../sections/">Section galleries</a> · <a href="../auth/">Auth pages</a></p>
</section>
${group('marketing', 'Marketing site', 'One site with a shared header and footer. Every link in the header and footer goes somewhere real.', MARKETING.map(([ic, t, d, l]) => card(ic, t, d, l)))}
${group('app', 'App', 'General app screens. Each page also ships its loading, empty (first run) and error states as separate files, so every state shows without JS.', APP.map(([ic, t, d, l]) => card(ic, t, d, l)))}
${group('system', 'System pages', 'Errors, maintenance, offline and coming soon. Each has a minimal layout and an illustrated one, drawn in SVG with the direction\'s colours.', SYSTEM.map((s) => card(SYSTEM_ICONS[s.slug], `${s.code ? `${s.code} ` : ''}${s.name}`, s.title, [['Minimal', `system/${s.slug}.html`], ['Illustrated', `system/${s.slug}-illustrated.html`]])))}
</main>`;

files.set(`${OUT}/index.html`, page({
  title: 'Vectra · Full pages',
  description: 'Vectra example pages: a marketing site, app screens with their states, and system pages.',
  label: 'all pages',
  body: index,
}));

const stale = [];
for (const [file, html] of files) {
  if (/—/.test(html)) throw new Error(`${file} contains an em dash`);
  if (CHECK) {
    const current = await readFile(file, 'utf8').catch(() => '');
    if (current !== html) stale.push(file);
  } else {
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, html);
  }
}
if (stale.length) {
  console.error(`Example pages are out of date, run npm run pages:\n${stale.join('\n')}`);
  process.exit(1);
}
console.log(`${CHECK ? 'Checked' : 'Wrote'} ${files.size} example pages in ${OUT}/`);

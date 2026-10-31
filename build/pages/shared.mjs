/* Shared pieces for the example pages (build/pages.mjs): icons, the page wrapper, the marketing site's
   header and footer, and the app shell. {root} becomes the path to the repo root, {p} the path to
   examples/pages/ from the page being written. */
import { format, THEME_SCRIPT } from '../html-format.mjs';

// Stroke icons on a 24 grid, drawn by .v-icon. Only the ones a page uses go into its sprite.
const ICONS = {
  logo: '<path d="M12 3l7.5 17.5L12 16.5l-7.5 4z"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  'arrow-left': '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  'check-circle': '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.7 2.7L16 9.8"/>',
  minus: '<path d="M6 12h12"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
  bell: '<path d="M6 16v-5a6 6 0 0112 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 004 0"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  home: '<path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z"/>',
  inbox: '<path d="M3 13l3-8h12l3 8v6H3z"/><path d="M3 13h5l1 2h6l1-2h5"/>',
  folder: '<path d="M3 6h6l2 2h10v11H3z"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.3-5.5 6.5-5.5s5.7 1.9 6.5 5.5"/><path d="M16 4.5a3.5 3.5 0 010 7M18.5 14.8c1.6.8 2.6 2.5 3 5.2"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4.4 4-6.5 8-6.5s7 2.1 8 6.5"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  file: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
  star: '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.3-4.1 5.9-.9z"/>',
  zap: '<path d="M13 3L5 14h6l-1 7 8-11h-6z"/>',
  shield: '<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/><path d="M9 12l2 2 4-4"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a1 1 0 01-1 1A16 16 0 014 5a1 1 0 011-1z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6.5l8.5 6.5 8.5-6.5"/>',
  pin: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0113 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.5"/>',
  more: '<path d="M5 12h.01M12 12h.01M19 12h.01" stroke-width="3"/>',
  filter: '<path d="M4 5h16l-6 7.5V19l-4 1.5v-8z"/>',
  download: '<path d="M12 4v11M7 10.5l5 5 5-5M5 20h14"/>',
  upload: '<path d="M12 20V9M7 13.5l5-5 5 5M5 4h14"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
  chat: '<path d="M4 5h16v11H9l-5 4z"/>',
  layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
  lock: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5v-3a4 4 0 018 0v3"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="M10.8 12.2L20 3M16.5 6.5l3 3M14 9l2 2"/>',
  globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.6 3.5 5.4 3.5 8.5s-1 5.9-3.5 8.5c-2.5-2.6-3.5-5.4-3.5-8.5s1-5.9 3.5-8.5z"/>',
  card: '<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h3"/>',
  help: '<circle cx="12" cy="12" r="8.5"/><path d="M9.6 9.5a2.5 2.5 0 014.8 1c0 1.7-2.4 2-2.4 3.5M12 17h.01"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  alert: '<path d="M12 3.5l9 16H3z"/><path d="M12 10v4M12 17h.01"/>',
  sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 16l.7 1.8 1.8.7-1.8.7L19 21l-.7-1.8-1.8-.7 1.8-.7z"/>',
  route: '<circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/><path d="M8.5 18H15a3 3 0 000-6H9a3 3 0 010-6h6.5"/>',
  refresh: '<path d="M20 11a8 8 0 00-14.5-4.5L4 8M4 4v4h4M4 13a8 8 0 0014.5 4.5L20 16M20 20v-4h-4"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 00-1-1H5a1 1 0 00-1 1v10a1 1 0 001 1h3"/>',
  archive: '<rect x="3" y="4" width="18" height="5" rx="1"/><path d="M5 9v11h14V9M10 13h4"/>',
  send: '<path d="M21 3L10 14M21 3l-7 18-4-7-7-4z"/>',
  tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.5"/>',
  laptop: '<rect x="4" y="5" width="16" height="11" rx="1.5"/><path d="M2 19h20"/>',
  smartphone: '<rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M11 18.5h2"/>',
  logout: '<path d="M15 4h3a2 2 0 012 2v12a2 2 0 01-2 2h-3M10 16l-4-4 4-4M6 12h10"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  'eye-off': '<path d="M10.6 5.1A10 10 0 0112 5c6.5 0 10 7 10 7a17 17 0 01-2.6 3.5M6.6 6.6A17 17 0 002 12s3.5 7 10 7a10 10 0 005.4-1.6M9.9 9.9a3 3 0 004.2 4.2M3 3l18 18"/>',
  wifi: '<path d="M2 9a15 15 0 0120 0M5 12.5a10 10 0 0114 0M8.5 16a5 5 0 017 0M12 19.5h.01"/>',
  building: '<path d="M4 21V5a1 1 0 011-1h9a1 1 0 011 1v16M15 9h4a1 1 0 011 1v11M3 21h18M8 8h3M8 12h3M8 16h3"/>',
  heart: '<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0112 7a4.3 4.3 0 017.5 2.8C19.5 15.4 12 20 12 20z"/>',
  leaf: '<path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14M5 19l7-7"/>',
  book: '<path d="M4 5a2 2 0 012-2h13v15H6a2 2 0 00-2 2zM4 20a2 2 0 002 2h13v-4"/>',
  coffee: '<path d="M4 9h13v5a5 5 0 01-5 5H9a5 5 0 01-5-5zM17 10h1.5a2.5 2.5 0 010 5H17M8 3v3M12 3v3"/>',
  printer: '<path d="M7 9V3h10v6M7 17H4v-7h16v7h-3M7 14h10v7H7z"/>',
  link: '<path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1"/>',
  quote: '<path d="M10 7H6a2 2 0 00-2 2v3a2 2 0 002 2h2v3H5M20 7h-4a2 2 0 00-2 2v3a2 2 0 002 2h2v3h-3"/>',
};

const sprite = (html) => {
  const used = Object.keys(ICONS).filter((name) => html.includes(`#i-${name}"`));
  return `<svg class="v-sr-only" aria-hidden="true" focusable="false">\n${used.map((n) => `<symbol id="i-${n}" viewBox="0 0 24 24">${ICONS[n]}</symbol>`).join('\n')}\n</svg>`;
};

export const icon = (name) => `<svg class="v-icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
export const CSRF = '<!-- Laravel: @csrf goes here. It prints the hidden _token field. -->';

// The example's own bar: a link back to the page index, optional variant links, and the switcher.
function exBar(label, variants) {
  const nav = variants ? `<nav class="ex-variants" aria-label="${variants.label}">
<span class="ex-variants-label" aria-hidden="true">${variants.label}</span>
<ul>
${variants.items.map(([text, href, current]) => `<li><a href="${href}"${current ? ' aria-current="page"' : ''}>${text}</a></li>`).join('\n')}
</ul>
</nav>` : '';
  return `<aside class="ex-bar" aria-label="Example settings">
<div class="v-container ex-bar-inner">
<a class="ex-title" href="{p}index.html">Vectra <span>example: ${label}</span></a>
${nav}
<label>Direction
<select id="direction">
<option value="tech">Dark tech</option>
<option value="editorial">Editorial</option>
<option value="soft">Soft depth</option>
<option value="glass">Glass</option>
</select>
</label>
<label>Theme
<select id="theme">
<option value="auto">Follow OS</option>
<option value="light">Light</option>
<option value="dark">Dark</option>
</select>
</label>
</div>
</aside>`;
}

/** A whole example page. depth: 0 for examples/pages/, 1 for a sub-folder. */
export function page({ title, description, depth = 0, label, variants, body, script, bodyAttrs = '' }) {
  const root = depth ? '../../../' : '../../';
  const p = depth ? '../' : '';
  const fill = (s) => s.replaceAll('{root}', root).replaceAll('{p}', p);
  const inner = fill(`<a class="v-skip-link" href="#main">Skip to content</a>\n${exBar(label, variants)}\n${body}`);
  const scripts = [`<script type="module" src="${root}src/js/index.js"></script>`];
  if (script) scripts.push(`<script type="module">\n${fill(script).trim().replace(/^/gm, '    ')}\n  </script>`);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <link rel="icon" href="data:,">
  ${THEME_SCRIPT}
  <link rel="stylesheet" href="${root}src/css/vectra.css">
  <link rel="stylesheet" href="${p}../shared/examples.css">
  <link rel="stylesheet" href="${p}pages.css">
  <script src="${p}../shared/switcher.js" defer></script>
</head>
<body${bodyAttrs}>
${format(`${sprite(inner)}\n${inner}`, 1)}
  ${scripts.join('\n  ')}
</body>
</html>
`;
}

export const brand = (href) => `<a class="v-navbar-brand" href="${href}"><svg class="v-icon" aria-hidden="true" style="color: var(--v-accent-text)"><use href="#i-logo"/></svg>Northwind</a>`;

// Marketing site. Pages that are not built yet (changelog, careers, help) point at the coming-soon page.
const SOON = '{p}system/coming-soon.html';
const NAV = [['Product', 'saas-home.html'], ['Pricing', 'pricing.html'], ['About', 'about.html'], ['Blog', 'blog.html'], ['Contact', 'contact.html']];

export const siteHeader = (current) => `<header class="v-navbar v-navbar-contained" data-v-nav>
${brand('{p}saas-home.html')}
<button class="v-btn v-btn-ghost v-btn-icon v-navbar-toggle" type="button" popovertarget="site-menu" aria-label="Open menu">${icon('menu')}</button>
<nav class="v-navbar-menu" id="site-menu" popover aria-label="Main">
<button class="v-btn v-btn-ghost v-btn-icon v-navbar-close" type="button" popovertarget="site-menu" popovertargetaction="hide" aria-label="Close menu">${icon('close')}</button>
<ul class="v-navbar-links">
${NAV.map(([text, href]) => `<li><a href="{p}${href}"${text === current ? ' aria-current="page"' : ''}>${text}</a></li>`).join('\n')}
</ul>
<div class="v-navbar-actions">
<a class="v-btn v-btn-ghost" href="{root}examples/auth/sign-in/password.html">Sign in</a>
<a class="v-btn v-btn-primary" href="{root}examples/auth/sign-up/single.html">Start free trial</a>
</div>
</nav>
</header>`;

export const siteFooter = `<footer class="v-footer">
<div class="v-container">
<div class="v-footer-grid">
<div class="v-footer-brand v-stack" style="--v-gap: var(--v-space-4)">
${brand('{p}saas-home.html')}
<p class="v-max-prose">Bookings, quotes and invoices for small service businesses. Built in the west of Ireland, used from Cork to Inverness.</p>
<span class="v-status">All systems running</span>
</div>
<div>
<h2 class="v-footer-title">Product</h2>
<ul class="v-footer-links">
<li><a href="{p}saas-home.html#features">Features</a></li>
<li><a href="{p}landing.html">Online booking</a></li>
<li><a href="{p}pricing.html">Pricing</a></li>
<li><a href="${SOON}">Changelog</a></li>
</ul>
</div>
<div>
<h2 class="v-footer-title">Company</h2>
<ul class="v-footer-links">
<li><a href="{p}about.html">About us</a></li>
<li><a href="{p}blog.html">Blog</a></li>
<li><a href="${SOON}">Careers</a></li>
<li><a href="{p}contact.html">Contact</a></li>
</ul>
</div>
<div>
<h2 class="v-footer-title">Help</h2>
<ul class="v-footer-links">
<li><a href="${SOON}">Help centre</a></li>
<li><a href="${SOON}">Guides</a></li>
<li><a href="${SOON}">Status</a></li>
<li><a href="{p}privacy.html#security">Security</a></li>
</ul>
</div>
</div>
<div class="v-footer-bottom">
<p>&copy; 2026 Northwind Ltd. Registered in Ireland.</p>
<ul class="v-cluster" style="--v-gap: var(--v-space-5)">
<li><a href="{p}privacy.html">Privacy</a></li>
<li><a href="{p}terms.html">Terms</a></li>
<li><a href="{p}cookies.html">Cookies</a></li>
</ul>
</div>
</div>
</footer>`;

/** A marketing page: shared header, main, shared footer. */
export const site = (current, main) => `${siteHeader(current)}
<main id="main" class="v-skip-target" tabindex="-1">
${main}
</main>
${siteFooter}`;

// App shell (sidebar). Links stay inside the example set: app pages, the dashboard, settings.
const APP_NAV = [
  ['Workspace', [['Dashboard', 'home', '{p}app-shell.html'], ['Jobs', 'folder', '{p}app/stacked.html', '4'], ['Calendar', 'calendar', '#main'], ['Invoices', 'file', '#main'], ['Customers', 'users', '{p}app/list.html']]],
  ['Insights', [['Reports', 'chart', '#main'], ['Reviews', 'star', '#main', '2']]],
  ['Account', [['Settings', 'gear', '{p}app/settings-profile.html'], ['Help and support', 'help', '#main']]],
];

export const appShell = (current, main) => `<div class="v-app">
<aside class="v-app-sidebar" id="app-nav" popover aria-label="Sidebar">
<button class="v-btn v-btn-ghost v-btn-icon v-app-close" type="button" popovertarget="app-nav" popovertargetaction="hide" aria-label="Close navigation">${icon('close')}</button>
${brand('{p}app-shell.html')}
<nav class="v-sidenav" aria-label="Workspace">
${APP_NAV.map(([heading, items]) => `<p class="v-sidenav-heading">${heading}</p>
<ul>
${items.map(([text, ic, href, badge]) => `<li><a href="${href}"${text === current ? ' aria-current="page"' : ''}>${icon(ic)}<span class="v-sidenav-label">${text}</span>${badge ? `<span class="v-badge v-badge-accent">${badge}</span>` : ''}</a></li>`).join('\n')}
</ul>`).join('\n')}
</nav>
<div class="v-flex v-items-center v-gap-3 v-p-2">
<span class="v-avatar v-avatar-sm" aria-hidden="true">AK</span>
<span class="v-grow v-text-sm" style="min-inline-size: 0"><span class="v-block v-fw-semibold v-truncate">Aoife Kelly</span><span class="v-block v-text-secondary v-truncate">Harbour Roofing</span></span>
<a class="v-btn v-btn-ghost v-btn-icon v-btn-sm" href="{p}app/settings-account.html" aria-label="Account settings">${icon('gear')}</a>
</div>
</aside>
<div class="v-app-main">
<header class="v-app-topbar">
<button class="v-btn v-btn-ghost v-btn-icon v-app-toggle" type="button" popovertarget="app-nav" aria-label="Open navigation">${icon('menu')}</button>
<form class="v-input-group v-search" role="search" aria-label="Search everything" action="{p}app/list.html">
<span class="v-input-addon">${icon('search')}</span>
<input class="v-input" id="app-search" name="q" type="search" placeholder="Search" aria-label="Search jobs, customers and invoices" aria-keyshortcuts="/" data-v-shortcut="/">
<span class="v-search-hint" aria-hidden="true"><kbd class="v-kbd">/</kbd></span>
</form>
<div class="v-cluster" style="--v-gap: var(--v-space-1)">
<a class="v-btn v-btn-ghost v-btn-icon v-hide-mobile" href="#main" aria-label="Help">${icon('help')}</a>
<a class="v-btn v-btn-ghost v-btn-icon" href="#main" aria-label="Notifications, 3 unread">${icon('bell')}</a>
<a class="v-btn v-btn-primary v-btn-sm v-hide-mobile" href="#main">${icon('plus')}New job</a>
<a class="v-avatar v-avatar-sm" href="{p}app/settings-profile.html" style="text-decoration: none"><span aria-hidden="true">AK</span><span class="v-sr-only">Your profile, Aoife Kelly</span></a>
</div>
</header>
<main class="v-app-page v-skip-target" id="main" tabindex="-1">
${main}
</main>
</div>
<nav class="v-bottombar v-hide-desktop" aria-label="App sections">
<a href="{p}app-shell.html">${icon('home')}<span>Today</span></a>
<a href="{p}app/stacked.html">${icon('folder')}<span>Jobs</span></a>
<a href="{p}app/list.html"${current === 'Customers' ? ' aria-current="page"' : ''}>${icon('users')}<span>Customers</span></a>
<a href="#main">${icon('inbox')}<span>Inbox</span><span class="v-badge v-badge-solid">3</span></a>
<a href="{p}app/settings-profile.html"${current === 'Settings' ? ' aria-current="page"' : ''}>${icon('user')}<span>Account</span></a>
</nav>
</div>`;

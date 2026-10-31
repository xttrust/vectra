/* Dev-only generator for the auth examples: wraps every flow in build/auth/flows.mjs in its layout and
   writes examples/auth/ (the gallery, five layout pages and one page per flow). The generated HTML is
   committed, because that is what people copy. Run `npm run auth:pages` after editing the content;
   `node build/auth-pages.mjs --check` (part of npm run check) fails if the committed pages are stale. */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { GROUPS, PAGES, signIn, dashboard } from './auth/flows.mjs';

const OUT = 'examples/auth';
const CHECK = process.argv.includes('--check');

// Stroke icons (24 grid, drawn by .v-icon) and the three generic provider marks (filled).
const ICONS = {
  northwind: '<circle cx="12" cy="12" r="9"/><path d="M12 5.5l3.2 9-3.2-1.8-3.2 1.8z"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  'eye-off': '<path d="M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-2.6 3.5M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7a10 10 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2M3 3l18 18"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="M10.8 12.2L20 3M16.5 6.5l3 3M14 9l2 2"/>',
  passkey: '<circle cx="9" cy="7.5" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 10-5.5"/><circle cx="17.5" cy="12.5" r="2.5"/><path d="M17.5 15v6M17.5 18.5h2"/>',
  shield: '<path d="M12 3l8 3v6c0 4.5-3.4 8.2-8 9-4.6-.8-8-4.5-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.5h.01"/>',
  lock: '<rect x="4.5" y="10.5" width="15" height="10" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  alert: '<path d="M12 3.5l9.5 16.5h-19z"/><path d="M12 10v4M12 17h.01"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
  download: '<path d="M12 4v11M7 10l5 5 5-5M4 19h16"/>',
  phone: '<rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M11 18.5h2"/>',
  building: '<path d="M4 21V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v16M15 9h4a1 1 0 0 1 1 1v11M3 21h18M8 8h3M8 12h3M8 16h3"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/>',
  logout: '<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 16l-4-4 4-4M6 12h10"/>',
  ban: '<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/>',
  sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 16v4M17 18h4"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  file: '<path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
  cloud: '<path d="M7 18a4.5 4.5 0 0 1-.5-9 6 6 0 0 1 11.5 1.5A3.75 3.75 0 0 1 17.5 18z"/>',
  'p-orbit': '<circle cx="12" cy="12" r="4" fill="currentColor" stroke="none"/><ellipse cx="12" cy="12" rx="10" ry="4.5" transform="rotate(-30 12 12)"/>',
  'p-quill': '<path d="M5 19c2-8 6-13 14-14-1 8-6 12-14 14zM5 19l7-7"/>',
  'p-hexa': '<path d="M12 2.5l8.2 4.75v9.5L12 21.5l-8.2-4.75v-9.5z" fill="currentColor" stroke="none"/>',
};

const sprite = (html) => {
  const used = Object.keys(ICONS).filter((name) => html.includes(`#i-${name}"`));
  return `<svg class="v-sr-only" aria-hidden="true" focusable="false">\n${used.map((n) => `<symbol id="i-${n}" viewBox="0 0 24 24">${ICONS[n]}</symbol>`).join('\n')}\n</svg>`;
};

const LOGO = '<a class="v-auth-logo" href="{auth}index.html"><svg class="v-icon" aria-hidden="true"><use href="#i-northwind"/></svg>Northwind</a>';
const FOOTER = '<footer class="v-auth-footer"><a href="#">Terms</a><a href="#">Privacy</a><a href="#">Help</a><span>© 2026 Northwind</span></footer>';

// Decorative art for the split layout: wind lines and a compass, painted in the feature colours.
const ART_SVG = `<svg viewBox="0 0 640 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
<g fill="none" stroke="currentColor" stroke-linecap="round">
<circle cx="470" cy="220" r="230" stroke-opacity=".14" stroke-width="2"/>
<circle cx="470" cy="220" r="150" stroke-opacity=".2" stroke-width="2"/>
<circle cx="470" cy="220" r="70" stroke-opacity=".28" stroke-width="2"/>
${[250, 300, 350, 400, 450].map((y, i) => `<path d="M-40 ${y}C140 ${y - 70} 300 ${y + 60} 680 ${y - 40}" stroke-opacity="${(0.34 - i * 0.05).toFixed(2)}" stroke-width="${(3 - i * 0.4).toFixed(1)}"/>`).join('\n')}
</g>
<path d="M470 120l38 110-38-22-38 22z" fill="currentColor" fill-opacity=".5"/>
<circle cx="150" cy="268" r="9" style="fill: var(--v-accent-2)"/>
<circle cx="390" cy="372" r="7" style="fill: var(--v-accent-2)"/>
<circle cx="560" cy="300" r="5" fill="currentColor" fill-opacity=".6"/>
</svg>`;

const ASIDES = {
  art: (tag) => `<${tag} class="v-auth-aside v-auth-art"${tag === 'aside' ? ' aria-label="About Northwind"' : ''}>
${ART_SVG}
<p>Plan the week in ten minutes.</p>
<p>Jobs, crews and invoices in one calm place, for small teams who would rather be out working.</p>
</${tag}>`,
  panel: (tag) => `<${tag} class="v-auth-aside v-auth-panel"${tag === 'aside' ? ' aria-label="What teams say"' : ''}>
<figure class="v-testimonial v-testimonial-lg">
<span class="v-rating" role="img" aria-label="Rated 5 out of 5"></span>
<blockquote class="v-testimonial-quote"><p>Monday planning used to take the whole morning. Now it takes ten minutes, and the crew can see the week on their phones.</p></blockquote>
<figcaption class="v-testimonial-author"><span class="v-avatar" aria-hidden="true">CR</span><span><span class="v-testimonial-name">Ciara Ryan</span><span class="v-testimonial-role">Operations, Westline Roofing</span></span></figcaption>
</figure>
<div class="v-cluster v-justify-center v-gap-6">
<div class="v-stat"><span class="v-stat-label">Teams on Northwind</span><span class="v-stat-value">4,200</span></div>
<div class="v-stat"><span class="v-stat-label">Jobs planned a week</span><span class="v-stat-value">61k</span></div>
</div>
</${tag}>`,
};

const LAYOUTS = {
  card: { cls: '' },
  'split-art': { cls: ' v-auth-split', aside: 'art' },
  'split-panel': { cls: ' v-auth-split', aside: 'panel' },
  minimal: { cls: ' v-auth-minimal' },
  bleed: { cls: ' v-auth-bleed' },
};

/** One layout around a box. page: the real <main>/<aside>; gallery: plain divs inside the gallery's main. */
function layout(kind, box, { gallery = false, wide = false } = {}) {
  const { cls, aside } = LAYOUTS[kind];
  const main = gallery ? '<div class="v-auth-main">' : '<main class="v-auth-main v-skip-target" id="main" tabindex="-1">';
  return `<div class="v-auth${cls}${wide ? ' v-auth-wide' : ''}">
${main}
${LOGO}
${box}
${FOOTER}
${gallery ? '</div>' : '</main>'}
${aside ? ASIDES[aside](gallery ? 'div' : 'aside') : ''}
</div>`;
}

// The email field takes focus when the dialog opens, rather than the close button.
const dialog = (box, id, { open = false, extra = '' } = {}) => `<dialog class="v-dialog v-auth-dialog${extra}" id="${id}" aria-labelledby="${id}-auth-title"${open ? ' open' : ''}>
<form method="dialog"><button class="v-btn v-btn-ghost v-btn-icon v-dialog-close" aria-label="Close"><svg class="v-icon" aria-hidden="true"><use href="#i-x"/></svg></button></form>
${open ? box : box.replace(`id="${id}-email"`, `id="${id}-email" autofocus`)}
</dialog>`;

// Gives every id (and every reference to one) a prefix, so one box can appear several times on a page.
const prefixIds = (html, p) => html
  .replace(/\b(id|for|aria-controls|aria-labelledby|aria-describedby)="([^"]+)"/g, (_, a, v) => `${a}="${v.split(' ').map((x) => p + x).join(' ')}"`)
  .replace(/\b(href|data-v-strength|data-v-copy-target)="#([^"#]+)"/g, (_, a, v) => `${a}="#${p}${v}"`);
const demote = (html, level) => html.replace(/<h1 class="v-auth-title"([^>]*)>([\s\S]*?)<\/h1>/, `<h${level} class="v-auth-title"$1>$2</h${level}>`);

const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
// Indents by tag depth, two spaces a level. <pre> blocks are kept exactly as written.
function format(html, base = 0) {
  let depth = base;
  let pre = false;
  const out = [];
  for (const raw of html.split('\n')) {
    if (pre) {
      out.push(raw);
      if (raw.includes('</pre>')) pre = false;
      continue;
    }
    const line = raw.trim();
    if (!line) continue;
    const opens = [...line.matchAll(/<([a-z][a-z0-9-]*)\b[^>]*?(\/?)>/gi)].filter((m) => !m[2] && !VOID.has(m[1].toLowerCase())).length;
    const closes = (line.match(/<\/[a-z][^>]*>/gi) ?? []).length;
    // A line that opens a <pre> closes it (and whatever opened with it) on the pre's last line.
    pre = line.includes('<pre') && !line.includes('</pre>');
    const delta = line.startsWith('<!--') || pre ? 0 : opens - closes;
    if (delta < 0) depth += delta;
    out.push('  '.repeat(Math.max(0, depth)) + line);
    if (delta > 0) depth += delta;
  }
  return out.join('\n');
}

const THEME_SCRIPT = `<script>
    /* Applies the saved direction and theme before first paint. No theme saved: follow the OS. */
    (function () {
      var root = document.documentElement;
      try {
        var d = localStorage.getItem('vectra-direction');
        var t = localStorage.getItem('vectra-theme');
        if (['tech', 'editorial', 'soft', 'glass'].indexOf(d) > -1) root.dataset.direction = d;
        if (t === 'light' || t === 'dark') root.dataset.theme = t;
      } catch (e) {}
    })();
  </script>`;

const OPENER = `/* Gallery only: modal dialogs need showModal(). */
document.querySelectorAll('[data-ex-open]').forEach((btn) => {
  btn.addEventListener('click', () => document.getElementById(btn.dataset.exOpen).showModal());
});`;

function page({ title, description, root, auth, home, bodyClass, body, script }) {
  const fill = (s) => s.replaceAll('{auth}', auth).replaceAll('{root}', root);
  const inner = fill(body);
  const scripts = [`<script type="module" src="${root}src/js/index.js"></script>`];
  if (script) scripts.push(`<script type="module">\n${fill(script).replace(/^/gm, '    ')}\n  </script>`);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <link rel="icon" href="data:,">
  ${THEME_SCRIPT}
  <link rel="stylesheet" href="${root}src/css/vectra.css">
  <link rel="stylesheet" href="${auth}../shared/examples.css">
  <link rel="stylesheet" href="${auth}auth.css">
  <script src="${auth}../shared/switcher.js" defer></script>
</head>
<body${bodyClass ? ` class="${bodyClass}"` : ''}>
${format(`${sprite(inner)}
<a class="v-skip-link" href="#main">Skip to content</a>
<header class="ex-bar">
<div class="v-container ex-bar-inner">
<a class="ex-title" href="${home}">Vectra <span>auth</span></a>
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
</header>
${inner}`, 1)}
  ${scripts.join('\n  ')}
</body>
</html>
`;
}

const files = new Map();
const flowPage = (path, title, body, extra = {}) => files.set(`${OUT}/${path}.html`, page({
  title: `${title} · Northwind · Vectra auth`,
  description: `${title}: a Northwind auth example built with Vectra.`,
  root: '../../../', auth: '../', home: '../', bodyClass: 'ex-auth', body, ...extra,
}));

// One page per flow.
for (const p of PAGES) {
  if (p.layout === 'app') {
    flowPage(`${p.group}/${p.slug}`, p.label, `<main class="v-container ex-main v-stack v-skip-target" id="main" tabindex="-1">\n${dashboard}\n</main>`, { bodyClass: '' });
  } else {
    flowPage(`${p.group}/${p.slug}`, p.label, layout(p.layout, p.box, { wide: p.wide }), { script: p.script });
  }
}

// The sign-in box in each layout as a full page (split screen with art is sign-in/password).
const LAYOUT_PAGES = [
  ['card', 'Centred card', 'The default: logo, a card and footer links on the page background.'],
  ['split-art', 'Split screen with art', 'The form beside a drawn art panel in the direction\'s feature colours. On phones the art becomes a short band on top.', 'sign-in/password.html'],
  ['split-panel', 'Split screen with a testimonial', 'The form beside a quote and a few numbers. On phones the panel follows the form.'],
  ['minimal', 'Minimal', 'No card: the form sits on the page background, near the top.'],
  ['bleed', 'Full-bleed background', 'The card floats over a colour field. Under Glass it is the page\'s own field.'],
];
for (const [kind, name] of LAYOUT_PAGES) {
  if (kind !== 'split-art') flowPage(`layouts/${kind}`, `Sign in, ${name.toLowerCase()}`, layout(kind, signIn()));
}
flowPage('layouts/dialog', 'Sign in, dialog', `<main class="v-container ex-main v-stack v-skip-target" id="main" tabindex="-1">
<p class="v-kicker">Northwind</p>
<h1 class="v-display">Plan the week in ten minutes.</h1>
<p class="v-lead">Sign in without leaving the page: the form opens in a dialog, and closing it brings you back here.</p>
<div class="v-cluster"><button class="v-btn v-btn-primary" type="button" data-ex-open="sign-in-dialog">Sign in</button></div>
</main>
${dialog(prefixIds(demote(signIn(), 2), 'sign-in-dialog-'), 'sign-in-dialog')}`, {
  bodyClass: '',
  script: `${OPENER}\n/* Open on arrival, as it would be after pressing "Sign in" on a real page. */\ndocument.getElementById('sign-in-dialog').showModal();`,
});

// The gallery: sign-in in all six layouts, then every flow by group.
const contrast = (html) => html
  .replace(/<(label class="v-label"|p class="v-auth-text"|h3 class="v-auth-title"|span class="v-testimonial-name"|span class="v-stat-label")/g, '<$1 data-contrast')
  .replace(/<p>(Plan the week|Jobs, crews)/g, '<p data-contrast>$1')
  .replace(/<footer class="v-auth-footer"><a href="#">Terms<\/a>/g, '<footer class="v-auth-footer"><a href="#" data-contrast>Terms</a>');
const frame = (kind, name, text, i, href = `layouts/${kind}.html`) => `<section class="ex-layout" aria-labelledby="layout-${kind}">
<div class="v-cluster v-justify-between v-items-baseline">
<h2 id="layout-${kind}">${i}. ${name}</h2>
<a href="${href}" data-contrast>Open as a page</a>
</div>
<p class="v-max-prose" data-contrast>${text}</p>
<div class="ex-frame">
${contrast(prefixIds(demote(layout(kind, signIn(), { gallery: true }), 3), `${kind}-`))}
</div>
</section>`;

const usage = `&lt;!-- Pick the layout on the wrapper. The box inside is the same for every layout. --&gt;
&lt;div class="v-auth v-auth-split"&gt;
  &lt;main class="v-auth-main"&gt;
    &lt;a class="v-auth-logo" href="/"&gt;...&lt;/a&gt;
    &lt;div class="v-auth-box"&gt;...&lt;/div&gt;
    &lt;footer class="v-auth-footer"&gt;...&lt;/footer&gt;
  &lt;/main&gt;
  &lt;aside class="v-auth-aside v-auth-art"&gt;...&lt;/aside&gt;
&lt;/div&gt;`;

const gallery = `<main class="v-container ex-main v-skip-target" id="main" tabindex="-1">
<section class="v-stack">
<p class="v-kicker">Sections · auth</p>
<h1 class="v-display">Auth.</h1>
<p class="v-lead" data-contrast>Every sign-in, sign-up and account page a product needs, for a pretend product called Northwind. Six layouts, one set of form markup, and field names that match Laravel Breeze and Fortify.</p>
</section>
${LAYOUT_PAGES.map(([kind, name, text, href], i) => frame(kind, name, text, i + 1, href)).join('\n')}
<section class="ex-layout" aria-labelledby="layout-dialog">
<div class="v-cluster v-justify-between v-items-baseline">
<h2 id="layout-dialog">6. Dialog</h2>
<a href="layouts/dialog.html" data-contrast>Open as a page</a>
</div>
<p class="v-max-prose" data-contrast>Sign in over the page you are on, in a native dialog. Shown in place here; the button opens it for real.</p>
<div class="ex-frame ex-frame-dialog">
${contrast(dialog(prefixIds(demote(signIn(), 3), 'static-dialog-'), 'static-dialog', { open: true, extra: ' ex-static' }))}
</div>
<div class="v-cluster"><button class="v-btn v-btn-primary" type="button" data-ex-open="sign-in-dialog" data-contrast>Open the sign-in dialog</button></div>
</section>
<section aria-labelledby="flows">
<h2 id="flows">Every flow</h2>
<p class="v-max-prose" data-contrast>Each flow is its own page, in a centred card or a split screen. Open one, then copy the box into whichever layout you use.</p>
<div class="v-grid ex-flows" style="--v-min: 15rem">
${GROUPS.map(([group, name]) => `<section class="v-card" aria-labelledby="group-${group}">
<h3 class="v-card-title" id="group-${group}">${name}</h3>
<ul class="ex-flow-list">
${PAGES.filter((p) => p.group === group).map((p) => `<li><a href="${p.group}/${p.slug}.html">${p.label}</a></li>`).join('\n')}
</ul>
</section>`).join('\n')}
</div>
</section>
<section aria-labelledby="use">
<h2 id="use">Use any flow in any layout</h2>
<p class="v-max-prose" data-contrast>Copy the <code>.v-auth-box</code> from a flow page and drop it into the layout you want: change the class on the wrapper, and add an aside for the split screens. In a dialog, the box goes straight inside <code>&lt;dialog class="v-dialog v-auth-dialog"&gt;</code>.</p>
<div class="v-code v-mt-4">
<div class="v-code-header"><span class="v-code-lang">HTML</span></div>
<pre class="v-code-body" tabindex="0"><code>${usage}</code></pre>
</div>
<p class="v-max-prose v-mt-4" data-contrast>For Laravel: the fields are named <code>email</code>, <code>password</code>, <code>password_confirmation</code>, <code>remember</code>, <code>code</code>, <code>recovery_code</code> and <code>token</code>, as Breeze and Fortify expect. Each form has a comment where <code>@csrf</code> goes, and server errors sit under their field with <code>aria-invalid</code>, like <a href="sign-in/error.html">the wrong password page</a>.</p>
</section>
</main>
${dialog(prefixIds(demote(signIn(), 2), 'sign-in-dialog-'), 'sign-in-dialog')}`;

files.set(`${OUT}/index.html`, page({
  title: 'Vectra · Auth',
  description: 'Vectra auth layouts and flows: sign in, sign up, recovery, two-factor, sessions and first run.',
  root: '../../', auth: '', home: '../components/', body: gallery, script: OPENER,
}));

const stale = [];
for (const [file, html] of files) {
  if (CHECK) {
    const current = await readFile(file, 'utf8').catch(() => '');
    if (current !== html) stale.push(file);
  } else {
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, html);
  }
}
if (stale.length) {
  console.error(`Auth pages are out of date, run npm run auth:pages:\n${stale.join('\n')}`);
  process.exit(1);
}
console.log(`${CHECK ? 'Checked' : 'Wrote'} ${files.size} auth pages in ${OUT}/`);

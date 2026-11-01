/* Docs site generator (PLAN.md section 11). Renders site/ into site/dist/ with the kit itself:
   dist/vectra.css, dist/vectra.js, the fonts and the icon sprite are copied into site/dist/assets/.
   Every URL is relative, so the site works from any base path (GitHub Pages project URL, /site/dist/
   under npm run serve). Component pages come from site/data/components/*.json; hand-written pages are
   HTML fragments in site/pages/. The galleries in examples/ are copied in with the src/ they load.
     node build/site.mjs           build (npm run site)
     node build/site.mjs --check   validate the data, build, then check the output (npm run site:check) */
import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, posix } from 'node:path';
import { gzipSync } from 'node:zlib';
import { execFileSync } from 'node:child_process';
import { loadComponents, validate, GROUPS, builtClasses } from './site-data.mjs';
import { esc, icon, inline, slugify, codeBlock, table, keys, resetCodeIds, PREPAINT } from './site-render.mjs';
import { themeBuilderPage, previewDoc } from './site-builder.mjs';
import { qualityPage, changelogBody } from './site-quality.mjs';
import { HUES, PAIRS } from './contrast-pairs.mjs';

const CHECK = process.argv.includes('--check');
const OUT = 'site/dist';
const pkg = JSON.parse(await readFile('package.json', 'utf8'));
const EM_DASH = '\u2014';

for (const need of ['dist/vectra.min.css', 'dist/vectra.js', 'dist/icons/sprite.svg']) {
  if (!existsSync(need)) {
    console.error(`${need} is missing: run npm run build first.`);
    process.exit(1);
  }
}

const components = await loadComponents();
if (CHECK) {
  const errors = await validate(components);
  if (errors.length) {
    console.error(`Component data has ${errors.length} problem(s):\n${errors.join('\n')}`);
    process.exit(1);
  }
  // Every v2 class the migration guide recommends must exist.
  const known = await builtClasses();
  const missing = JSON.parse(await readFile('site/data/migration.json', 'utf8')).flatMap((g) => g.rows.flatMap(([, v2]) => (v2.match(/(?<![-\w])v-[a-z0-9]+(?:-[a-z0-9]+)*/g) ?? [])
    .flatMap((k) => (k.startsWith('v-') && k.endsWith('-') ? [] : [k]))).filter((k) => !known.has(k)));
  if (missing.length) {
    console.error(`site/data/migration.json: v2 classes not in dist/vectra.css: ${[...new Set(missing)].join(', ')}`);
    process.exit(1);
  }
  console.log(`site:check: ${components.length} component entries valid.`);
}
const groups = await GROUPS();
const bySlug = new Map(components.map((c) => [c.slug, c]));
const icons = JSON.parse(await readFile('dist/icons/icons.json', 'utf8'));

/* ---------- Navigation ---------- */
const FOUNDATIONS = [
  ['tokens', 'Tokens'], ['colour', 'Colour and contrast'], ['typography', 'Typography'], ['spacing', 'Spacing and density'],
  ['layout', 'Layout primitives'], ['utilities', 'Utilities'], ['icons', 'Icons'], ['motion', 'Motion'],
];
const NAV = [
  { heading: 'Start', items: [['', 'Introduction', 'home'], ['getting-started/', 'Getting started', 'zap'], ['changelog/', 'Changelog', 'history']] },
  { heading: 'Tools', items: [['theme-builder/', 'Theme builder', 'palette'], ['quality/', 'Quality', 'shield-check']] },
  { heading: 'Foundations', items: FOUNDATIONS.map(([s, t]) => [`foundations/${s}/`, t]) },
  { heading: 'Components', items: [['components/', 'All components', 'grid']], groups },
  { heading: 'Reference', items: [['api/', 'JavaScript API', 'code'], ['patterns/', 'Patterns', 'layers'], ['migration/', 'Migrating from v1', 'arrow-up-right']] },
];
// Reading order for previous and next links.
const navItems = (heading) => NAV.find((s) => s.heading === heading).items.map(([p]) => p);
const ORDER = [
  ...navItems('Start'),
  ...navItems('Tools'),
  ...navItems('Foundations'),
  'components/',
  ...components.map((c) => `components/${c.slug}/`),
  ...navItems('Reference'),
];
const TITLES = new Map([...NAV.flatMap((s) => s.items.map(([p, t]) => [p, t])), ...components.map((c) => [`components/${c.slug}/`, c.name])]);

function sidebar(current) {
  const link = (path, title, ic) => `<li><a href="{{root}}${path}"${path === current ? ' aria-current="page"' : ''}>${ic ? icon('{{root}}', ic) : ''}<span class="v-sidenav-label">${esc(title)}</span></a></li>`;
  return NAV.map((section) => {
    let html = `<p class="v-sidenav-heading">${section.heading}</p>\n<ul>${section.items.map(([p, t, ic]) => link(p, t, ic)).join('')}`;
    if (section.groups) {
      for (const g of section.groups) {
        const list = components.filter((c) => c.group === g);
        if (!list.length) continue;
        const open = list.some((c) => `components/${c.slug}/` === current);
        html += `<li><details${open ? ' open' : ''}><summary><span class="v-sidenav-label">${esc(g)}</span><span class="v-badge">${list.length}</span></summary><ul>${list.map((c) => link(`components/${c.slug}/`, c.name)).join('')}</ul></details></li>`;
      }
    }
    return `${html}</ul>`;
  }).join('\n');
}

/* ---------- Live demos (each one is its own small page, shown in an iframe) ---------- */
const demoFiles = []; // [path, html]
const ROOM = /<dialog|\spopover[\s>=]|v-bottombar|v-toast|session|v-connection|v-skip-link/;

function demoDoc(root, { title, html, js, layout = 'row', needsJs }) {
  const markup = html.replace(/href="\/icons\/sprite\.svg#/g, `href="${root}assets/icons/sprite.svg#`);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)} · Vectra demo</title>
  <link rel="icon" href="data:,">
  ${PREPAINT}
  <script>
    /* ?direction= and ?theme= pin this demo (the home page shows the four directions side by side). */
    (function () {
      var q = new URLSearchParams(location.search), root = document.documentElement;
      if (q.get('direction')) root.dataset.direction = q.get('direction');
      if (q.get('theme')) root.dataset.theme = q.get('theme');
    })();
  </script>
  <link rel="stylesheet" href="${root}assets/vectra.css">
  <link rel="stylesheet" href="${root}assets/demo.css">
${needsJs || js ? `  <script src="${root}assets/vectra.js" defer></script>\n` : ''}${js ? `  <script type="module">\n${js.replace(/^/gm, '    ')}\n  </script>\n` : ''}</head>
<body>
  <main class="site-demo-main site-demo-${layout}" aria-label="${esc(title)}">
${markup.replace(/^/gm, '    ')}
  </main>
</body>
</html>
`;
}

/** Writes demo-<n>.html next to the page and returns the example block: toolbar, frame and code. */
function demo(page, ex, { code = true, lockDirection = '', bar = true, label = '' } = {}) {
  page.demos = (page.demos ?? 0) + 1;
  const n = page.demos;
  const file = `demo-${n}.html`;
  const root = page.root;
  const needsJs = /\sdata-v-|\spopover[\s>=]/.test(ex.html); // popovers use the anchor fallback
  demoFiles.push([`${page.path}${file}`, demoDoc(root, { ...ex, title: `${page.title}: ${ex.title}`, needsJs })]);
  const height = ex.height ?? 160;
  const min = ROOM.test(ex.html) || ex.js ? height : 0;
  const src = lockDirection ? `${file}?direction=${lockDirection}` : file;
  const id = `ex-${n}`;
  const radios = (name, legend, options) => `<fieldset class="v-segmented"><legend class="v-sr-only">${legend}</legend>${options.map(([v, t]) => `<label><input type="radio" name="${name}" value="${v}"><span>${t}</span></label>`).join('')}</fieldset>`;
  const toolbar = bar ? `<div class="site-demo-bar site-js-only">
      ${radios(`${id}-direction`, `Direction for ${esc(ex.title)}`, [['tech', 'Tech'], ['editorial', 'Editorial'], ['soft', 'Soft'], ['glass', 'Glass']])}
      ${radios(`${id}-mode`, `Theme for ${esc(ex.title)}`, [['light', 'Light'], ['dark', 'Dark']])}
      <fieldset class="v-segmented site-demo-width"><legend class="v-sr-only">Width for ${esc(ex.title)}</legend>${[['full', 'Desktop', 'monitor'], ['tablet', 'Tablet', 'laptop'], ['phone', 'Phone', 'smartphone']].map(([v, t, ic]) => `<label><input type="radio" name="${id}-width" value="${v}"${v === 'full' ? ' checked' : ''}><span>${icon(root, ic)}<span class="v-sr-only">${t}</span></span></label>`).join('')}</fieldset>
      <a class="v-btn v-btn-ghost v-btn-sm v-btn-icon site-demo-open" href="${file}" aria-label="Open ${esc(ex.title)} on its own">${icon(root, 'maximize')}</a>
    </div>` : '';
  const frame = `<iframe class="site-demo-frame" src="${src}" title="${esc(`${page.title}: ${ex.title}`)}" height="${height}" data-min="${min}"${lockDirection ? ` data-lock="${lockDirection}"` : ''}></iframe>`;
  const source = code ? codeBlock(root, ex.html, 'html') + (ex.js ? codeBlock(root, ex.js, 'js', 'JavaScript') : '') : '';
  return `<div class="site-example" id="${id}" data-demo>
    ${toolbar}
    ${frame}${label ? `\n    <p class="site-demo-label">${label}</p>` : ''}
    ${source ? `<div class="site-example-code">${source}</div>` : ''}
  </div>`;
}

/* ---------- Fragments (site/pages/*.html) ---------- */
const dedent = (s) => {
  const lines = s.replace(/^\n/, '').replace(/\s+$/, '').split('\n');
  const pad = Math.min(...lines.filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length));
  return lines.map((l) => l.slice(pad)).join('\n');
};

const unescape = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');

function processFragment(page, html) {
  return html
    .replace(/\{\{icon:([a-z-]+)\}\}/g, (_, name) => icon(page.root, name))
    .replace(/<pre data-code="(\w+)"(?: data-title="([^"]*)")?>([\s\S]*?)<\/pre>/g, (_, lang, title, src) => codeBlock(page.root, unescape(dedent(src)), lang, title ?? ''))
    .replace(/<template data-demo="([^"]+)"((?:\s+data-[a-z]+="[^"]*")*)>([\s\S]*?)<\/template>/g, (_, title, attrs, src) => {
      const a = Object.fromEntries([...attrs.matchAll(/data-([a-z]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));
      return demo(page, { title, html: dedent(src), height: a.height ? +a.height : undefined, layout: a.layout });
    });
}

async function fragment(name) {
  const text = await readFile(`site/pages/${name}.html`, 'utf8');
  const meta = JSON.parse(text.match(/^<!--meta ([\s\S]*?)-->/)[1]);
  return { meta, body: text.replace(/^<!--meta [\s\S]*?-->\n?/, '') };
}

/* ---------- Page shell ---------- */
const pages = [];
const addPage = (page) => { pages.push(page); return page; };
const newPage = (path, title, description, extra = {}) => ({ path, title, description, root: '../'.repeat(path.split('/').filter(Boolean).length), ...extra });

function withHeadingIds(html) {
  const seen = new Set();
  return html.replace(/<h([23])((?:\s[^>]*)?)>([\s\S]*?)<\/h\1>/g, (m, level, attrs, text) => {
    if (/\sid="/.test(attrs)) { seen.add(attrs.match(/\sid="([^"]+)"/)[1]); return m; }
    let id = slugify(text) || `section-${seen.size}`;
    while (seen.has(id)) id += '-2';
    seen.add(id);
    return `<h${level}${attrs} id="${id}">${text}</h${level}>`;
  });
}

function tocOf(html) {
  return [...html.matchAll(/<h2[^>]*\sid="([^"]+)"[^>]*>([\s\S]*?)<\/h2>/g)].map((m) => [m[1], m[2].replace(/<[^>]+>/g, '').trim()]);
}

function prevNext(path) {
  const i = ORDER.indexOf(path);
  if (i < 0) return '';
  const prev = ORDER[i - 1];
  const next = ORDER[i + 1];
  const card = (p, dir) => (p === undefined ? '<span></span>' : `<a class="site-pager-link site-pager-${dir}" href="{{root}}${p}"><span class="site-pager-dir">${dir === 'prev' ? 'Previous' : 'Next'}</span><span class="site-pager-title">${esc(TITLES.get(p) ?? p)}</span></a>`);
  return `<nav class="site-pager" aria-label="Previous and next page">${card(prev, 'prev')}${card(next, 'next')}</nav>`;
}

function shell(page) {
  const body = withHeadingIds(page.body);
  const toc = page.toc === false ? [] : tocOf(body);
  const root = page.root;
  const switchRadios = (prefix) => [['tech', 'Dark tech'], ['editorial', 'Editorial'], ['soft', 'Soft depth'], ['glass', 'Glass']]
    .map(([v, t]) => `<label><input type="radio" name="${prefix}-direction" value="${v}"><span>${t}</span></label>`).join('');
  const html = `<!DOCTYPE html>
<html lang="en" data-root="${root}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(page.path === '' ? 'Vectra · UI kit built on the web platform' : `${page.title} · Vectra`)}</title>
  <meta name="description" content="${esc(page.description)}">
  <link rel="icon" href="data:,">
  ${PREPAINT}
  <noscript><style>.site-js-only { display: none !important; }</style></noscript>
  <link rel="stylesheet" href="${root}assets/vectra.css">
  <link rel="stylesheet" href="${root}assets/site.css">
  <script src="${root}assets/vectra.js" defer></script>
  <script src="${root}assets/site.js" defer></script>
${(page.scripts ?? []).map((src) => `  <script src="${root}assets/${src}" defer></script>\n`).join('')}</head>
<body class="site${page.wide ? ' site-wide' : ''}">
  <a class="v-skip-link" href="#main">Skip to content</a>
  <header class="site-header">
    <div class="site-header-inner">
      <button class="v-btn v-btn-ghost v-btn-icon site-menu-btn" type="button" popovertarget="site-nav" aria-label="Open navigation">${icon(root, 'menu')}</button>
      <a class="site-brand" href="${root}">${icon(root, 'layers', ' focusable="false"')}<span>Vectra</span><span class="v-badge v-badge-accent site-version">v${esc(pkg.version.replace(/-.*/, ''))} alpha</span></a>
      <form class="site-search" role="search" action="${root}components/" method="get">
        <div class="v-input-group v-search">
          <span class="v-input-addon" aria-hidden="true">${icon(root, 'search')}</span>
          <input class="v-input" id="site-search" name="q" type="search" placeholder="Search the docs" aria-label="Search the docs" autocomplete="off" spellcheck="false">
          <span class="v-search-hint site-js-only" aria-hidden="true"><kbd class="v-kbd">/</kbd></span>
        </div>
      </form>
      <div class="site-header-actions">
        <fieldset class="v-segmented site-direction site-js-only" data-v-theme-switch><legend class="v-sr-only">Design direction</legend>${switchRadios('hdr')}</fieldset>
        <button class="v-btn v-btn-ghost v-btn-icon site-appearance-btn site-js-only" type="button" popovertarget="site-appearance" aria-label="Design direction">${icon(root, 'palette')}</button>
        <div class="v-popover site-appearance" id="site-appearance" popover>
          <fieldset class="v-segmented" data-v-theme-switch><legend class="site-appearance-title">Design direction</legend>${switchRadios('pop')}</fieldset>
          <a class="v-btn v-btn-ghost v-btn-sm" href="${root}components/customizer/">${icon(root, 'sliders')}More in the customizer</a>
        </div>
        <button class="v-btn v-btn-ghost v-btn-icon v-theme-toggle site-js-only" type="button" data-v-theme-toggle aria-label="Theme">${icon(root, 'sun', ' data-for="light"')}${icon(root, 'moon', ' data-for="dark"')}${icon(root, 'monitor', ' data-for="system"')}</button>
        <a class="v-btn v-btn-ghost v-btn-icon" href="https://github.com/xttrust/vectra" aria-label="Vectra on GitHub">${icon(root, 'code')}</a>
      </div>
    </div>
  </header>
  <div class="site-shell">
    <nav class="site-nav" id="site-nav" popover aria-label="Documentation">
      <div class="site-nav-head">
        <span class="site-brand">${icon(root, 'layers')}<span>Vectra</span></span>
        <button class="v-btn v-btn-ghost v-btn-icon" type="button" popovertarget="site-nav" popovertargetaction="hide" aria-label="Close navigation">${icon(root, 'close')}</button>
      </div>
      <div class="v-sidenav site-sidenav">
${sidebar(page.path)}
      </div>
    </nav>
    <main id="main" class="site-main v-skip-target" tabindex="-1">
      <article class="site-article">
${body}
      </article>
      ${page.pager === false ? '' : prevNext(page.path)}
      <footer class="site-footer">
        <p>Vectra ${esc(pkg.version)}. MIT licence, © Florin Pinta. Built with Vectra itself: no framework, no CDN, nothing loaded from another site.</p>
      </footer>
    </main>
    ${toc.length > 1 ? `<aside class="site-toc" aria-labelledby="toc-title">
      <p class="site-toc-title" id="toc-title">On this page</p>
      <ul>${toc.map(([id, text]) => `<li><a href="#${id}">${esc(text)}</a></li>`).join('')}</ul>
    </aside>` : ''}
  </div>
</body>
</html>
`;
  return html.replace(/\{\{root\}\}/g, root);
}

/* ---------- Component pages ---------- */
const badgeFor = { done: ['v-badge-success', 'Stable'], partial: ['v-badge-warning', 'CSS done, behaviour coming'], planned: ['', 'Planned'] };

function componentPage(c) {
  const page = newPage(`components/${c.slug}/`, c.name, c.summary, { component: c });
  resetCodeIds();
  const [tone, label] = badgeFor[c.status];
  const facts = [
    c.native && ['Built on', `<code>${esc(c.native)}</code>`],
    ['CSS', c.css.length ? c.css.map((f) => `<code>dist/components/${esc(f)}</code>`).join(', ') : 'Part of <code>vectra.core.css</code>'],
    c.js?.length && ['JavaScript', c.js.map((f) => `<code>src/js/${esc(f)}</code>`).join(', ')],
  ].filter(Boolean);
  let body = `<header class="site-page-head">
  <p class="v-kicker"><a href="{{root}}components/#${slugify(c.group)}">${esc(c.group)}</a></p>
  <h1>${esc(c.name)}</h1>
  <p class="v-lead">${inline(c.summary)}</p>
  <div class="v-cluster site-page-badges"><span class="v-badge ${tone} v-badge-dot">${label}</span><span class="v-badge v-badge-outline">${esc(c.tier)}</span>${c.js?.length || c.hooks?.length || c.api?.length ? '<span class="v-badge v-badge-info">JavaScript</span>' : '<span class="v-badge">CSS only</span>'}</div>
</header>
${c.description ? c.description.split(/\n\n/).map((p) => `<p>${inline(p)}</p>`).join('\n') : ''}
<dl class="v-dl v-dl-cols site-facts">${facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
<h2 id="examples">Examples</h2>
`;
  for (const ex of c.examples) {
    body += `<h3>${esc(ex.title)}</h3>\n${ex.description ? `<p>${inline(ex.description)}</p>\n` : ''}${demo(page, ex)}\n`;
  }
  const kindLabel = { base: 'Base', modifier: 'Modifier', part: 'Part', helper: 'Helper' };
  if (c.classes.length) body += `<h2 id="classes">Classes</h2>\n${table(['Class', 'Kind', 'What it does'], c.classes.map((k) => [`<code>.${esc(k.name)}</code>`, kindLabel[k.kind], inline(k.description)]), `${c.name} classes`)}`;
  if (c.states?.length) body += `<h2 id="states">States and attributes</h2>\n${table(['Attribute', 'Effect'], c.states.map((s) => [`<code>${esc(s.attribute)}</code>`, inline(s.description)]), `${c.name} states`)}`;
  if (c.hooks?.length || c.api?.length || c.events?.length) {
    body += '<h2 id="javascript">JavaScript</h2>\n';
    if (c.hooks?.length) body += `<h3>Data attributes</h3>\n${table(['Attribute', 'Value', 'On', 'What it does'], c.hooks.map((h) => [`<code>${esc(h.name)}</code>`, h.value ? inline(h.value) : '<span class="v-text-muted">flag</span>', h.on ? inline(h.on) : '', inline(h.description)]), `${c.name} data attributes`)}`;
    if (c.api?.length) body += `<h3>Functions</h3>\n${table(['Call', 'What it does'], c.api.map((a) => [`<code>${esc(a.signature)}</code>`, inline(a.description)]), `${c.name} functions`)}`;
    if (c.events?.length) body += `<h3>Events</h3>\n${table(['Event', 'Fired on', 'Detail', 'What it means'], c.events.map((e) => [`<code>${esc(e.name)}</code>`, e.on ? inline(e.on) : '', e.detail ? `<code>${esc(e.detail)}</code>` : '', inline(e.description) + (e.cancelable ? ' Cancelable.' : '')]), `${c.name} events`)}`;
  }
  if (c.keyboard?.length) body += `<h2 id="keyboard">Keyboard</h2>\n${table(['Keys', 'Action'], c.keyboard.map((k) => [keys(k.keys), inline(k.action)]), `${c.name} keyboard`)}`;
  body += `<h2 id="accessibility">Accessibility</h2>\n<ul class="site-list">${c.a11y.map((n) => `<li>${inline(n)}</li>`).join('')}</ul>`;
  body += `<h2 id="tokens">Tokens</h2>\n<p>Set these on the component, a parent or <code>:root</code> to theme it without touching the rest. <a href="{{root}}foundations/tokens/">All tokens</a>.</p>\n<ul class="site-tokens">${c.tokens.map((t) => `<li><code>${esc(t)}</code></li>`).join('')}</ul>`;
  if (c.related?.length) {
    body += `<h2 id="related">Related</h2>\n<div class="v-grid site-related">${c.related.map((r) => bySlug.get(r)).filter(Boolean).map((r) => `<a class="v-card site-card-link" href="{{root}}components/${r.slug}/"><span class="v-card-title">${esc(r.name)}</span><span class="v-card-text">${inline(r.summary)}</span></a>`).join('')}</div>`;
  }
  page.body = body;
  return addPage(page);
}

function componentsIndex() {
  const page = newPage('components/', 'Components', `All ${components.length} Vectra components, grouped as in the catalogue.`, { wide: true });
  let body = `<header class="site-page-head">
  <p class="v-kicker">Components</p>
  <h1>Components</h1>
  <p class="v-lead">${components.length} components on native HTML. Each page has live examples in every direction, copyable markup and the classes, attributes, keys and tokens it uses.</p>
</header>
<div class="site-filter site-js-only">
  <label class="v-label" for="component-filter">Filter components</label>
  <div class="v-input-group v-search"><span class="v-input-addon" aria-hidden="true">${icon('{{root}}', 'filter')}</span><input class="v-input" id="component-filter" type="search" placeholder="Name, class or attribute"></div>
  <p class="v-text-sm v-text-secondary" id="component-filter-status" role="status"></p>
</div>
`;
  for (const g of groups) {
    const list = components.filter((c) => c.group === g);
    if (!list.length) continue;
    body += `<section class="site-group" data-filter-group><h2 id="${slugify(g)}">${esc(g)}</h2>\n<div class="v-grid site-card-grid">${list.map((c) => `<a class="v-card site-card-link" href="{{root}}components/${c.slug}/" data-filter-text="${esc(`${c.name} ${c.group} ${c.summary} ${c.classes.map((k) => k.name).join(' ')} ${(c.hooks ?? []).map((h) => h.name).join(' ')}`.toLowerCase())}"><span class="v-card-title">${esc(c.name)}${c.status === 'partial' ? ' <span class="v-badge v-badge-warning">partial</span>' : ''}</span><span class="v-card-text">${inline(c.summary)}</span></a>`).join('')}</div></section>\n`;
  }
  page.body = body;
  return addPage(page);
}

/* ---------- Home ---------- */
const gz = async (file) => gzipSync(await readFile(file)).length;
const kb = (n) => `${(n / 1024).toFixed(1)} KB`;

async function home() {
  const page = newPage('', 'Introduction', 'Vectra v2: a zero-dependency UI kit on native HTML. Four design directions from one markup, WCAG 2.2 AA in every theme, size budgets enforced in CI.', { wide: true, toc: false });
  const directions = ['tech', 'editorial', 'soft', 'glass'];
  const coreGz = await gz('dist/vectra.core.min.css') + await gz('dist/directions/tech.min.css');
  const compGz = await gz('dist/vectra.components.min.css');
  const jsGz = await gz('dist/vectra.js');
  const showcase = (await readFile('site/pages/showcase.html', 'utf8')).trim();
  const names = { tech: 'Dark tech', editorial: 'Editorial', soft: 'Soft depth', glass: 'Glass' };
  const frames = directions.map((d) => demo(page, { title: names[d], html: showcase, height: 452, layout: 'fill' }, { code: false, bar: false, lockDirection: d, label: `<strong>${names[d]}</strong> <code>data-direction="${d}"</code>` })).join('\n');
  const frag = await fragment('home');
  page.body = processFragment(page, frag.body
    .replace('{{directions}}', frames)
    .replace('{{showcase-code}}', codeBlock(page.root, showcase, 'html', 'The markup in all four'))
    .replace('{{core-gz}}', `<span data-volatile>${kb(coreGz)}</span>`)
    .replace('{{components-gz}}', `<span data-volatile>${kb(compGz)}</span>`)
    .replace('{{js-gz}}', `<span data-volatile>${kb(jsGz)}</span>`)
    .replace('{{count}}', String(components.length))
    .replace('{{icons}}', String(icons.count))
    .replace('{{sweep}}', (4 * 2 * HUES.length * PAIRS.length).toLocaleString('en-IE')));
  return addPage(page);
}

/* ---------- Generated foundations: tokens, utilities, icons ---------- */
async function tokensBody() {
  const contract = JSON.parse(await readFile('build/token-contract.json', 'utf8'));
  const swatch = (t) => (/^(bg|surface|border|text|accent(?!-h)|on-accent|primary|danger|success|warning|info)/.test(t) && !/-w$|radius|shadow/.test(t)
    ? `<span class="site-swatch" style="background: var(--v-${t})"></span>` : '');
  const preview = (t) => (/^radius/.test(t) ? `<span class="site-radius" style="border-radius: var(--v-${t})"></span>`
    : /^shadow/.test(t) ? `<span class="site-shadow" style="box-shadow: var(--v-${t})"></span>` : swatch(t));
  const rows = (list) => list.map((t) => [`${preview(t)}<code>--v-${esc(t)}</code>`, `<code class="site-live" data-token="--v-${esc(t)}"></code>`]);
  return `<h2>Required tokens</h2>
<p>Every direction defines these ${contract.required.length}. <code>npm run check:tokens</code> fails the build if one is missing or a direction defines a token outside the contract. The values column shows what the current direction and theme resolve to, live.</p>
${table(['Token', 'Current value'], rows(contract.required), 'Required tokens')}
<h2>Optional tokens</h2>
<p>A direction may override these; the defaults live in <code>src/css/tokens/semantic.css</code>. Component tokens such as <code>--v-btn-radius</code> or <code>--v-card-bg</code> let one component be themed without touching the rest.</p>
${table(['Token', 'Current value'], rows(contract.optional), 'Optional tokens')}`;
}

// A utility rule at the top level of the layer, optionally inside a one-line @media or @container:
// class, the rest of its selector (e.g. " > * + *"), and the declarations when they sit on the same line.
const UTILITY_RULE = /^ {2}(?:@(?:media|container)[^{]*\{\s*)?\.(v-[a-z0-9-]+)([^{]*)\{\s*([^}]*?)\s*(?:\}\s*)*$/;

/** The declarations of the rule at lines[i]: the same line, or the lines up to its closing brace. */
function utilityDeclarations(lines, i, inline) {
  if (inline) return inline;
  const body = [];
  for (let j = i + 1; j < lines.length && !/^ {2}\}/.test(lines[j]); j++) body.push(lines[j].trim());
  return body.join(' ');
}

async function utilitiesBody() {
  const css = await readFile('src/css/utilities.css', 'utf8');
  const sections = [];
  let current = null;
  const lines = css.split('\n');
  for (const [i, line] of lines.entries()) {
    const heading = line.match(/^ {2}\/\* (.+?)(?: \*\/|$)/);
    const rule = line.match(UTILITY_RULE);
    if (heading) sections.push(current = { title: heading[1].replace(/\s*\*\/$/, ''), rules: [] });
    else if (rule && current) current.rules.push([rule[1] + rule[2].trimEnd(), utilityDeclarations(lines, i, rule[3])]);
  }
  return sections.filter((s) => s.rules.length).map((s) => `<h2>${esc(s.title.replace(/\s*\(.*\)$/, ''))}</h2>\n${table(['Class', 'Declaration'], s.rules.map(([k, d]) => [`<code>.${esc(k)}</code>`, d ? `<code>${esc(d.replace(/\s*\}$/, ''))}</code>` : '<span class="v-text-muted">see source</span>']), s.title)}`).join('\n');
}

function iconsBody(root) {
  return `<div class="site-filter site-js-only">
  <label class="v-label" for="icon-filter">Search ${icons.count} icons</label>
  <div class="v-input-group v-search"><span class="v-input-addon" aria-hidden="true">${icon(root, 'search')}</span><input class="v-input" id="icon-filter" type="search" placeholder="arrow, user, file"></div>
  <p class="v-text-sm v-text-secondary" id="icon-filter-status" role="status"></p>
</div>
<ul class="site-icons" id="icon-list">${icons.icons.map((i) => `<li data-filter-text="${esc(`${i.name} ${i.lucide}`)}"><button class="site-icon" type="button" data-v-copy="${esc(`<svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#${i.name}"/></svg>`)}" aria-label="Copy the ${esc(i.name)} icon">${icon(root, i.name)}<span>${esc(i.name)}</span></button></li>`).join('')}</ul>`;
}

/* ---------- Patterns ---------- */
const GALLERIES = [
  ['components', 'Actions, display and feedback', 'Buttons, badges, cards, alerts and loading states on one page.'],
  ['forms', 'Forms', 'Every control, validation timing and the form JS.'],
  ['elements', 'Display and form additions', 'Banners, callouts, tags, lists, search, choice cards and form layouts.'],
  ['navigation', 'Navigation and disclosure', 'Navbar, sidebar, tabs, pagination, steps, accordions, and a right-to-left check.'],
  ['overlays', 'Overlays', 'Dialogs, drawers, popovers, menus and tooltips.'],
  ['plus', 'More components (v2.1)', 'Split button, back to top, table of contents, context menu, hover card, command palette, lightbox and notification centre.'],
  ['content', 'Content', 'Tables, timelines, prose, code, testimonials, pricing and logos.'],
  ['theming', 'Theming and feedback', 'The customizer, toasts, connection, session and save status.'],
  ['layout', 'Layout and utilities', 'The layout primitives and helpers, in every direction.'],
  ['tokens', 'Tokens', 'Every token resolved in the current direction and theme.'],
  ['icons', 'Icons', 'The full sprite with names.'],
  ['states', 'States', 'Loading, empty, error, offline, permission and session states (milestone M7.4).'],
  ['sections', 'Sections', 'Marketing and app sections built from the components (milestone M7.1).'],
  ['auth', 'Auth', 'Sign in, sign up, reset and two-step layouts (milestone M7.2).'],
];

function patternsBody() {
  const card = ([dir, title, text]) => {
    const live = existsSync(`examples/${dir}/index.html`);
    return live
      ? `<a class="v-card site-card-link" href="{{root}}examples/${dir}/"><span class="v-card-title">${esc(title)}</span><span class="v-card-text">${esc(text)}</span></a>`
      : `<div class="v-card site-card-soon"><span class="v-card-title">${esc(title)} <span class="v-badge">coming</span></span><span class="v-card-text">${esc(text)}</span></div>`;
  };
  return `<h2>Galleries</h2>
<p>The galleries are the pages the tests run on: every one passes axe and the rendered-contrast check in all four directions and both themes. They open in this site with their own direction and theme switch.</p>
<div class="v-grid site-card-grid">${GALLERIES.map(card).join('')}</div>`;
}

/* ---------- Migration ---------- */
async function migrationTable() {
  const rows = JSON.parse(await readFile('site/data/migration.json', 'utf8'));
  return rows.map((group) => `<h3>${esc(group.group)}</h3>\n${table(['Vectra v1', 'Vectra v2', 'Notes'], group.rows.map(([a, b, n]) => [a ? `<code>${esc(a)}</code>` : '', b ? `<code>${esc(b)}</code>` : '<span class="v-text-muted">removed</span>', inline(n ?? '')]), `${group.group} class map`)}`).join('\n');
}

/* ---------- Build ---------- */
await rm(OUT, { recursive: true, force: true });
await mkdir(`${OUT}/assets/icons`, { recursive: true });
await cp('dist/vectra.min.css', `${OUT}/assets/vectra.css`);
await cp('dist/vectra.js', `${OUT}/assets/vectra.js`);
await cp('dist/fonts', `${OUT}/assets/fonts`, { recursive: true });
await cp('dist/icons/sprite.svg', `${OUT}/assets/icons/sprite.svg`);
await cp('dist/icons/icons.json', `${OUT}/assets/icons/icons.json`);
for (const f of await readdir('site/assets')) await cp(`site/assets/${f}`, `${OUT}/assets/${f}`);
for (const f of ['llms.txt', 'llms-full.txt']) if (existsSync(`dist/ai/${f}`)) await cp(`dist/ai/${f}`, `${OUT}/${f}`); // AI manifest (build/manifest.mjs)
// The galleries load ../../src/ and ../shared/, so both are copied with the same layout.
await cp('examples', `${OUT}/examples`, { recursive: true });
for (const d of ['css', 'js', 'fonts']) await cp(`src/${d}`, `${OUT}/src/${d}`, { recursive: true });

await home();
for (const name of ['getting-started', 'api', 'changelog', 'migration', 'patterns']) {
  const frag = await fragment(name);
  const page = newPage(`${name}/`, frag.meta.title, frag.meta.description);
  let body = frag.body;
  if (name === 'migration') body = body.replace('{{class-map}}', await migrationTable());
  if (name === 'patterns') body = body.replace('{{galleries}}', patternsBody());
  if (name === 'changelog') body = body.replace('{{changelog}}', changelogBody());
  page.body = processFragment(page, body);
  addPage(page);
}
for (const [slug, title] of FOUNDATIONS) {
  const frag = await fragment(`foundations-${slug}`);
  const page = newPage(`foundations/${slug}/`, title, frag.meta.description);
  let body = frag.body;
  if (slug === 'tokens') body = body.replace('{{tokens}}', await tokensBody());
  if (slug === 'utilities') body = body.replace('{{utilities}}', await utilitiesBody());
  if (slug === 'icons') body = body.replace('{{icons}}', iconsBody(page.root));
  page.body = processFragment(page, body.replace('{{title}}', esc(title)));
  addPage(page);
}
componentsIndex();
for (const c of components) componentPage(c);
{
  const frag = await fragment('theme-builder');
  const page = newPage('theme-builder/', frag.meta.title, frag.meta.description, { wide: true, toc: false, scripts: ['theme-builder.js'] });
  page.body = processFragment(page, await themeBuilderPage(frag.body));
  addPage(page);
  demoFiles.push(['theme-builder/preview.html', await previewDoc(page.root)]);
}
addPage(await qualityPage(newPage('quality/', 'Quality', 'The bars Vectra commits to, with the numbers from this build: sizes against budgets, tests, accessibility coverage, browsers and what is not verified yet.', { wide: true }), pages));

for (const page of pages) {
  await mkdir(join(OUT, page.path), { recursive: true });
  await writeFile(join(OUT, page.path, 'index.html'), shell(page));
}
for (const [path, html] of demoFiles) await writeFile(join(OUT, path), html);

// Search index: pages and components, small enough to fetch on first focus of the search field.
const search = pages.map((p) => {
  const c = p.component;
  return {
    t: p.title,
    u: p.path,
    s: c ? c.group : p.path.startsWith('foundations/') ? 'Foundations' : p.path === '' ? 'Start' : ['theme-builder/', 'quality/'].includes(p.path) ? 'Tools' : 'Guide',
    d: p.description,
    k: c ? [...c.classes.map((k) => k.name), ...(c.hooks ?? []).map((h) => h.name), ...(c.catalogue ?? [])].join(' ') : tocOf(withHeadingIds(p.body)).map(([, t]) => t).join(' '),
  };
});
await writeFile(`${OUT}/search.json`, JSON.stringify(search));
await writeFile(`${OUT}/.nojekyll`, '');
console.log(`site: ${pages.length} pages and ${demoFiles.length} live demos in ${OUT}/`);

/* ---------- Output checks (site:check) ---------- */
if (CHECK) {
  const problems = [];
  const files = [...pages.map((p) => join(OUT, p.path, 'index.html')), ...demoFiles.map(([p]) => join(OUT, p))];
  for (const file of files) {
    const html = await readFile(file, 'utf8');
    const isPage = file.endsWith('index.html');
    const count = (re) => (html.match(re) ?? []).length;
    if (html.includes(EM_DASH)) problems.push(`${file}: contains an em dash`);
    if (!/<html lang="en"/.test(html)) problems.push(`${file}: no lang on <html>`);
    if (count(/<title>/g) !== 1) problems.push(`${file}: needs one <title>`);
    if (count(/<main[\s>]/g) !== 1) problems.push(`${file}: needs exactly one <main>`);
    if (isPage) {
      if (count(/<h1[\s>]/g) !== 1) problems.push(`${file}: has ${count(/<h1[\s>]/g)} h1 elements, needs exactly one`);
      if (!/class="v-skip-link" href="#main"/.test(html)) problems.push(`${file}: no skip link to #main`);
      if (!/<header class="site-header"/.test(html) || !/<nav [^>]*aria-label="Documentation"/.test(html)) problems.push(`${file}: missing the banner or navigation landmark`);
    }
    // Relative URLs only, and every local link and asset must exist.
    for (const [, attr, url] of [...html.matchAll(/<[a-z][^>]*>/gi)].flatMap((t) => [...t[0].matchAll(/\s(href|src)="([^"]*)"/g)])) {
      if (/^(https?:|mailto:|data:|#)/.test(url)) continue;
      if (url.startsWith('/')) { problems.push(`${file}: root-relative ${attr}="${url}" breaks under a base path`); continue; }
      const target = posix.normalize(posix.join(dirname(file), url.replace(/[?#].*$/, '')));
      const resolved = url.replace(/[?#].*$/, '') === '' ? file : target.endsWith('/') || !/\.[a-z0-9]+$/i.test(target) ? join(target, 'index.html') : target;
      if (!existsSync(resolved)) problems.push(`${file}: ${attr}="${url}" points at nothing (${resolved})`);
    }
  }
  if (problems.length) {
    console.error(`Site output has ${problems.length} problem(s):\n${problems.join('\n')}`);
    process.exit(1);
  }
  execFileSync(process.execPath, ['build/check-urls.mjs'], { stdio: 'inherit' });
  console.log(`site:check: ${files.length} files: one h1, landmarks and skip link on every page, relative links that resolve, no em dash.`);
}

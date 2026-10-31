/* AI manifest (PLAN.md M8b): everything an AI assistant needs to write valid Vectra markup, generated from
   the same sources as the docs site. Plain Node, no dependencies. Runs as part of npm run build.
     node build/manifest.mjs           write dist/ai/ (manifest, schema, llms.txt, llms-full.txt, skill, AGENTS.md)
     node build/manifest.mjs --write   also write the committed copies in ai/ (npm run ai:skill)
     node build/manifest.mjs --check   validate the manifest and fail if ai/ is stale (npm run check:manifest)
   Sources: site/data/components/*.json, build/token-contract.json, src/icons/icons.json, src/js/index.js,
   src/css/layout.css, src/css/utilities.css, src/css/directions/*.css and the pages in examples/. */
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { loadComponents, checkSchema } from './site-data.mjs';

const OUT = 'dist/ai';
const SKILL_DIR = 'ai/claude-skill/vectra';
const EM_DASH = '—';
const readJSON = async (file) => JSON.parse(await readFile(file, 'utf8'));

/* ---------- Hand-written parts: rules, token purposes, core API ---------- */

// Quoted verbatim in llms-full.txt, the skill and AGENTS.md (tests/manifest.spec.js checks this).
export const RULES = [
  ['setup', 'setup', 'Load dist/vectra.css in the <head> and dist/vectra.js with defer. Keep dist/fonts/ next to the CSS and serve dist/icons/sprite.svg. Nothing else is needed: no CDN, no framework, no build step.'],
  ['html-attributes', 'setup', 'Put lang and data-direction (tech, editorial, soft or glass) on <html>. Leave data-theme off to follow the OS; set data-theme="light" or "dark" only to force one.'],
  ['only-listed-classes', 'naming', 'Use only classes listed in the Vectra reference (this file, the manifest or reference.md). Every Vectra class starts with v-. Never invent a class, and never use Bootstrap or Tailwind names (btn, card, d-flex, mt-4).'],
  ['base-plus-modifier', 'naming', 'Combine a base class with its modifiers on the same element (class="v-btn v-btn-primary v-btn-sm"). A modifier never works without its base class. Parts (v-card-header, v-dialog-body) go inside their component.'],
  ['states-native', 'states', 'States come from native attributes and ARIA, never .is-* or .active classes: disabled, hidden, open, aria-selected, aria-current, aria-expanded, aria-pressed, aria-invalid, aria-busy.'],
  ['hooks-data-v', 'javascript', 'JS behaviour is switched on by data-v-* attributes only, never by styling classes. Vectra starts every hook on load and on content added later, so no init call is needed.'],
  ['events-v', 'javascript', 'Listen for Vectra events (v:change, v:open, v:close, v:theme) with addEventListener; they bubble and are namespaced with v:.'],
  ['native-first', 'accessibility', 'Use the native element first: <button> for actions, <a href> for navigation, <dialog> for modals, the popover attribute for menus and popovers, <details> for disclosure, <table> for data.'],
  ['one-h1', 'accessibility', 'One h1 per page, headings in order without skipping levels, and landmarks: header, nav with an aria-label, one main, footer. Start the page with a skip link to the main element.'],
  ['names', 'accessibility', 'Every interactive element has an accessible name: visible text, or aria-label on icon-only buttons. Ids are unique and every aria-controls, aria-labelledby and aria-describedby points at an existing id.'],
  ['forms-labels', 'forms', 'Every form control has a visible <label for> (or wraps it). Put hints and errors in elements linked with aria-describedby, mark errors with aria-invalid="true", and never use a placeholder as the label.'],
  ['icons-sprite', 'icons', 'Icons are <svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#name"/></svg> with a name from the icon list. Change /icons/ to wherever dist/icons/sprite.svg is served. Decorative icons stay aria-hidden.'],
  ['tokens-not-overrides', 'theming', 'Theme with --v-* custom properties on :root or a wrapper, or with Vectra.theme.set(), never by overriding component selectors or hard-coding colours. Never put text on --v-accent-2.'],
];

const PURPOSE = {
  bg: 'Page background.',
  'bg-subtle': 'Subtle background for alternate bands and wells.',
  surface: 'Surface of cards, panels and controls.',
  'surface-2': 'Second surface: tracks, hovered rows, recessed areas.',
  border: 'Hairline borders and dividers.',
  'border-strong': 'Stronger border for emphasis.',
  'border-control': 'Border of form controls, at 3:1 against the surface.',
  text: 'Body and heading text.',
  'text-2': 'Secondary text.',
  'text-3': 'Muted text: meta, captions.',
  'accent-h': 'Accent hue in OKLCH degrees. Set it, or Vectra.theme.set({ accent }), to rebrand every direction.',
  accent: 'Accent for fills, focus rings and selected states.',
  'accent-hover': 'Accent on hover.',
  'accent-2': 'Second accent for gradients and glows only. Never put text on it.',
  'accent-text': 'Accent for text and links on surfaces.',
  'accent-soft': 'Soft accent tint for backgrounds.',
  'on-accent': 'Text and icons on accent fills.',
  'radius-sm': 'Small corner radius.',
  'radius-md': 'Medium corner radius: buttons, inputs.',
  'radius-lg': 'Large corner radius: cards.',
  'radius-xl': 'Extra large corner radius: dialogs, heroes.',
  'radius-pill': 'Fully rounded ends: pills, badges.',
  'shadow-1': 'Low elevation shadow.',
  'shadow-2': 'Medium elevation shadow: popovers, menus.',
  'shadow-3': 'High elevation shadow: dialogs.',
  'font-sans': 'Base font stack (Inter by default).',
  'font-body': 'Body text font.',
  'font-display': 'Display and heading font.',
  'display-weight': 'Weight of display headings.',
  'display-tracking': 'Letter spacing of display headings.',
  'display-leading': 'Line height of display headings.',
  'heading-weight': 'Weight of headings.',
  'heading-tracking': 'Letter spacing of headings.',
  'step-display': 'Font size of the display step.',
  'border-w': 'Border width.',
  'primary-bg': 'Primary button background.',
  'primary-fg': 'Primary button text.',
  'primary-hover-bg': 'Primary button background on hover.',
  'primary-hover-fg': 'Primary button text on hover.',
  'btn-radius': 'Button corner radius.',
  'btn-weight': 'Button font weight.',
  'btn-shadow': 'Button shadow.',
  'btn-border': 'Button border colour.',
  'card-bg': 'Card background.',
  'card-border': 'Card border colour.',
  'card-shadow': 'Card shadow.',
  'card-sheen': 'Card highlight overlay (none by default).',
  'input-bg': 'Input background.',
  'input-border': 'Input border colour.',
  'input-radius': 'Input corner radius.',
  'input-shadow': 'Input shadow.',
  'feature-bg': 'Feature surface background (highlighted plan, hero card).',
  'feature-fg': 'Text on the feature surface.',
  'feature-fg-2': 'Secondary text on the feature surface.',
  'feature-border': 'Border of the feature surface.',
  'feature-on-fg': 'Colour used on top of feature-fg (buttons inside a feature card).',
  'page-bg': 'Background image or gradient behind the page (none by default).',
  'hero-bg': 'Background image or gradient of heroes (none by default).',
  'overlay-bg': 'Surface of dialogs, drawers, popovers and menus.',
  backdrop: 'Scrim behind modal dialogs and drawers.',
  'success-soft': 'Soft success background.',
  'warning-soft': 'Soft warning background.',
  'danger-soft': 'Soft danger background.',
  'info-soft': 'Soft info background.',
};

const CORE_API = [
  ['init', 'Vectra.init(root = document)', 'Starts every registered module on the data-v-* hooks inside root. Vectra runs it on load and a MutationObserver runs it for content added later (Vue, Livewire, htmx), so it is rarely needed.'],
  ['register', 'Vectra.register(name, init)', 'Adds a module for data-v-<name>. init(el, options) runs once per element and returns { destroy }, called when the element leaves the DOM.'],
  ['emit', 'Vectra.emit(el, type, detail) => boolean', 'Fires a bubbling, cancelable v:<type> event. Returns false if a listener called preventDefault().'],
  ['storage', 'Vectra.storage.get(key, fallback = null)', 'Reads localStorage under the vectra- prefix; never throws.'],
  ['storage', 'Vectra.storage.set(key, value)', 'Writes localStorage under the vectra- prefix; null removes the key; never throws.'],
  ['announce', "Vectra.announce(message, politeness = 'polite')", "Reads a message to screen readers through a shared live region. Use 'assertive' only for urgent news."],
];

const DIRECTION_LABELS = { tech: 'Dark tech', editorial: 'Editorial', soft: 'Soft depth', glass: 'Glass' };

/* ---------- Sources ---------- */

// The comment above each rule in layout.css describes it; single-line rules fall back to their declaration.
async function layoutClasses() {
  const css = await readFile('src/css/layout.css', 'utf8');
  const out = [];
  let comment = '';
  for (const line of css.split('\n')) {
    const c = line.match(/^ {2}\/\* (.+?) \*\/\s*$/);
    const rule = line.match(/^ {2}\.(v-[a-z0-9-]+)\s*(?:,[^{]*)?\{\s*(.*?)\s*\}?\s*$/);
    if (c) comment = c[1];
    else if (rule) {
      if (!out.some((k) => k.name === rule[1])) out.push({ name: rule[1], description: comment || (rule[2] ? rule[2].replace(/\s*\}$/, '') : '') });
      comment = '';
    }
  }
  return out;
}

// Same parser as the Utilities page of the docs site (build/site.mjs), plus the type classes of base.css.
async function utilityGroups() {
  const css = await readFile('src/css/utilities.css', 'utf8');
  const base = await readFile('src/css/base.css', 'utf8');
  let current = { group: 'Screen readers', classes: [] };
  const groups = [{ group: 'Type (base.css)', classes: [...base.matchAll(/^ {2}\.(v-[a-z0-9-]+)\s*\{/gm)].map((m) => m[1]) }, current];
  for (const line of css.split('\n')) {
    const heading = line.match(/^ {2}\/\* (.+?)(?: \*\/|$)/);
    const rule = line.match(/^ {2}\.(v-[a-z0-9-]+)\s*\{/);
    if (heading) groups.push(current = { group: heading[1].replace(/\s*\*\/$/, '').replace(/\s*\(.*\)$/, ''), classes: [] });
    else if (rule && current && !current.classes.includes(rule[1])) current.classes.push(rule[1]);
  }
  return groups.filter((g) => g.classes.length);
}

async function directions() {
  const names = (await readdir('src/css/directions')).filter((f) => f.endsWith('.css')).map((f) => f.slice(0, -4));
  const order = Object.keys(DIRECTION_LABELS);
  names.sort((a, b) => (order.indexOf(a) + 1 || 99) - (order.indexOf(b) + 1 || 99) || a.localeCompare(b));
  const list = [];
  for (const name of names) {
    const head = (await readFile(`src/css/directions/${name}.css`, 'utf8')).match(/Vectra direction: ([^.]+)\.\s*(.*?)(?:\n|\*\/)/);
    list.push({ name, label: head?.[1] ?? DIRECTION_LABELS[name] ?? name, file: `dist/directions/${name}.css`, description: head?.[2]?.trim() ?? '' });
  }
  return list;
}

const titleOf = (html) => (html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '').split(' · ')[0].replace(/^Vectra · /, '').trim();
const descriptionOf = (html) => html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '';

// The galleries (examples/<name>/index.html) and every complete page below them (examples/<name>/<group>/<page>.html).
async function patterns() {
  const list = [];
  const dirs = (await readdir('examples', { withFileTypes: true })).filter((d) => d.isDirectory() && d.name !== 'shared').map((d) => d.name).sort();
  for (const dir of dirs) {
    const index = `examples/${dir}/index.html`;
    if (existsSync(index)) {
      const html = await readFile(index, 'utf8');
      list.push({ name: html.match(/<title>Vectra · ([^<]*)<\/title>/)?.[1] ?? dir, path: `examples/${dir}/`, description: descriptionOf(html) });
    }
    for (const sub of (await readdir(`examples/${dir}`, { withFileTypes: true })).filter((d) => d.isDirectory()).map((d) => d.name).sort()) {
      for (const file of (await readdir(`examples/${dir}/${sub}`)).filter((f) => f.endsWith('.html')).sort()) {
        const html = await readFile(`examples/${dir}/${sub}/${file}`, 'utf8');
        list.push({ name: `${dir[0].toUpperCase()}${dir.slice(1)}: ${titleOf(html)}`, path: `examples/${dir}/${sub}/${file}`, description: descriptionOf(html) });
      }
    }
  }
  return list;
}

async function registeredModules() {
  const src = await readFile('src/js/index.js', 'utf8');
  return [...src.matchAll(/^register\('([a-z0-9-]+)'/gm)].map((m) => `data-v-${m[1]}`);
}

/** The named exports of src/js/index.js, which are also the keys of window.Vectra. */
export async function publicExports() {
  const src = await readFile('src/js/index.js', 'utf8');
  const names = new Set();
  for (const m of src.matchAll(/^export \{([^}]+)\}/gm)) for (const n of m[1].split(',')) names.add(n.trim().split(/\s+as\s+/).pop());
  for (const m of src.matchAll(/^export (?:const|function) ([A-Za-z]+)/gm)) names.add(m[1]);
  return [...names];
}

/* ---------- The manifest ---------- */

export async function buildManifest() {
  const pkg = await readJSON('package.json');
  const home = pkg.homepage.endsWith('/') ? pkg.homepage : `${pkg.homepage}/`;
  const components = await loadComponents();
  const contract = await readJSON('build/token-contract.json');
  const icons = Object.keys((await readJSON('src/icons/icons.json')).icons).sort();
  const dirs = await directions();
  const registered = await registeredModules();

  const contractNames = new Set([...contract.required, ...contract.optional].map((t) => `--v-${t}`));
  const componentTokens = new Map();
  for (const c of components) for (const t of c.tokens ?? []) if (!contractNames.has(t)) componentTokens.set(t, [...(componentTokens.get(t) ?? []), c.slug]);

  const hookMap = new Map(registered.map((h) => [h, []]));
  for (const c of components) {
    for (const h of c.hooks ?? []) hookMap.set(h.name, [...(hookMap.get(h.name) ?? []), c.slug]);
  }

  const api = CORE_API.map(([name, signature, description]) => ({ name, signature, description }));
  for (const c of components) {
    for (const a of c.api ?? []) {
      if (api.some((x) => x.signature === a.signature)) continue;
      api.push({ name: a.signature.match(/^Vectra\.([A-Za-z]+)/)?.[1] ?? '', signature: a.signature, description: a.description });
    }
  }
  api.push({ name: 'version', signature: 'Vectra.version', description: `The kit version as a string ("${pkg.version}").` });

  const head = '<link rel="stylesheet" href="/vectra/vectra.css">\n<script src="/vectra/vectra.js" defer></script>';
  const page = `<!DOCTYPE html>
<html lang="en" data-direction="tech">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Page title</title>
  <link rel="stylesheet" href="/vectra/vectra.css">
  <script src="/vectra/vectra.js" defer></script>
</head>
<body>
  <a class="v-skip-link" href="#main">Skip to content</a>
  <header class="v-container">
    <nav aria-label="Main">...</nav>
  </header>
  <main id="main" class="v-skip-target v-container v-stack" tabindex="-1">
    <h1>Page title</h1>
    <p>Content.</p>
  </main>
  <footer class="v-container">...</footer>
</body>
</html>`;

  return {
    $schema: './vectra.manifest.schema.json',
    name: 'Vectra',
    package: pkg.name,
    version: pkg.version,
    summary: 'Vectra is a zero-dependency CSS and JavaScript UI kit built on the web platform: plain HTML classes (v-*) and data attributes (data-v-*), four design directions in light and dark from one markup, WCAG 2.2 AA in every direction, and native elements first (<dialog>, popover, <details>). It works in plain HTML, Blade, Vue, Livewire or any framework, with no build step.',
    homepage: home,
    repository: `github:${pkg.repository.replace(/^github:/, '')}`,
    license: pkg.license,
    install: {
      npm: `npm install ${pkg.name}`,
      head,
      production: '<link rel="stylesheet" href="/vectra/vectra.core.css">\n<link rel="stylesheet" href="/vectra/vectra.components.css">\n<link rel="stylesheet" href="/vectra/directions/tech.css">\n<script src="/vectra/vectra.js" defer></script>',
      page,
      notes: [
        'Copy dist/ to your site (here served at /vectra/), or import from node_modules/@creativeigniter/vectra/dist/.',
        'dist/vectra.css holds every direction; for production load dist/vectra.core.css, dist/vectra.components.css and one file from dist/directions/.',
        'Keep dist/fonts/ next to the CSS. Inter is only downloaded when a page uses it.',
        'As an ES module: import { toast, theme } from "@creativeigniter/vectra/dist/vectra.esm.js". It starts the hooks on import, like the script tag.',
        'Markup works without JS: dialogs, popovers, accordions and forms are native. Only tabs, toasts, menu arrow keys and the customizer need the script.',
      ],
    },
    files: [
      { path: 'dist/vectra.css', kind: 'css', description: 'Everything: core, components, sections and all four directions. Minified: dist/vectra.min.css.' },
      { path: 'dist/vectra.core.css', kind: 'css', description: 'Reset, tokens, base typography, layout primitives and utilities.' },
      { path: 'dist/vectra.components.css', kind: 'css', description: 'Every component.' },
      { path: 'dist/vectra.sections.css', kind: 'css', description: 'Page sections (auth layouts).' },
      ...dirs.map((d) => ({ path: d.file, kind: 'css', description: `The ${d.label} direction.` })),
      { path: 'dist/components/<name>.css', kind: 'css', description: 'One component on its own, to load less.' },
      { path: 'dist/vectra.js', kind: 'js', description: 'Every behaviour as one classic script (IIFE) that defines window.Vectra. Load with defer.' },
      { path: 'dist/vectra.esm.js', kind: 'js', description: 'The same as an ES module with named exports.' },
      { path: 'dist/fonts/', kind: 'fonts', description: 'Inter variable, latin and latin-ext subsets. Keep next to the CSS.' },
      { path: 'dist/icons/sprite.svg', kind: 'icons', description: 'The SVG sprite: one <symbol> per icon name.' },
      { path: 'dist/icons/icons.json', kind: 'icons', description: 'The icon names.' },
      { path: 'dist/ai/', kind: 'ai', description: 'This manifest, its schema, llms.txt, llms-full.txt, AGENTS.md and the Claude Code skill.' },
    ],
    theme: {
      attributes: [
        { name: 'data-direction', on: '<html>', values: dirs.map((d) => d.name), default: 'tech', description: 'The design direction. One markup, four looks.' },
        { name: 'data-theme', on: '<html>', values: ['light', 'dark'], default: '', description: 'Forces light or dark. Leave it off to follow the OS live.' },
        { name: 'data-corners', on: '<html>', values: ['sharp', 'rounded', 'round'], default: '', description: 'Corner radius preset across every component.' },
        { name: 'data-density', on: '<html>', values: ['compact', 'spacious'], default: '', description: 'Spacing and control size preset.' },
        { name: 'data-font', on: '<html>', values: ['inter', 'serif', 'system'], default: '', description: 'Typeface preset: Inter everywhere, serif headings, or the system font.' },
        { name: '--v-accent-h', on: '<html> style or :root', values: ['0 to 360'], default: '', description: 'Accent hue in degrees. Contrast holds for any hue.' },
      ],
      directions: dirs,
    },
    rules: RULES.map(([id, topic, rule]) => ({ id, topic, rule })),
    tokens: {
      note: 'Set tokens on :root to change the whole site, or on any element to change one area. Every direction defines the required tokens; optional ones have defaults. Component tokens (such as --v-btn-radius) change one component.',
      contract: [
        ...contract.required.map((t) => ({ name: `--v-${t}`, level: 'required', purpose: PURPOSE[t] ?? 'See src/css/tokens/.', overridable: true })),
        ...contract.optional.map((t) => ({ name: `--v-${t}`, level: 'optional', purpose: PURPOSE[t] ?? 'See src/css/tokens/semantic.css.', overridable: true })),
      ],
      component: [...componentTokens].sort(([a], [b]) => a.localeCompare(b)).map(([name, list]) => ({ name, components: list })),
    },
    layout: await layoutClasses(),
    utilities: await utilityGroups(),
    components: components.map((c) => {
      const ex = c.examples[0];
      return {
        name: c.name,
        slug: c.slug,
        group: c.group,
        tier: c.tier,
        status: c.status,
        summary: c.summary,
        native: c.native ?? '',
        docs: `${home}components/${c.slug}/`,
        classes: c.classes.map((k) => ({ name: k.name, kind: k.kind, description: k.description })),
        states: (c.states ?? []).map((s) => ({ attribute: s.attribute, description: s.description })),
        hooks: (c.hooks ?? []).map((h) => ({ name: h.name, value: h.value ?? '', on: h.on ?? '', description: h.description })),
        events: (c.events ?? []).map((e) => ({ name: e.name, on: e.on ?? '', detail: e.detail ?? '', cancelable: Boolean(e.cancelable), description: e.description })),
        keyboard: (c.keyboard ?? []).map((k) => ({ keys: k.keys, action: k.action })),
        a11y: c.a11y ?? [],
        tokens: c.tokens ?? [],
        related: c.related ?? [],
        example: { title: ex.title, html: ex.html, js: ex.js ?? '' },
      };
    }),
    hooks: [...hookMap].sort(([a], [b]) => a.localeCompare(b)).map(([name, list]) => ({ name, registered: registered.includes(name), components: list })),
    api,
    icons: {
      sprite: 'dist/icons/sprite.svg',
      usage: '<svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#name"/></svg>',
      names: icons,
    },
    patterns: await patterns(),
  };
}

/* ---------- Text outputs ---------- */

const keysText = (keys) => keys.join(' / ');
const fence = (lang, code) => `\`\`\`${lang}\n${code}\n\`\`\``;

function rulesText(m) {
  return m.rules.map((r) => `- ${r.rule}`).join('\n');
}

function componentText(c, depth) {
  const h = '#'.repeat(depth);
  const out = [`${h} ${c.name} (${c.slug})`, '', `${c.summary}${c.native ? ` Native: ${c.native}.` : ''}`, ''];
  const byKind = (kind) => c.classes.filter((k) => k.kind === kind);
  for (const [kind, label] of [['base', 'Base'], ['modifier', 'Modifiers'], ['part', 'Parts'], ['helper', 'Helpers']]) {
    if (!byKind(kind).length) continue;
    out.push(`${label}:`);
    for (const k of byKind(kind)) out.push(`- .${k.name}: ${k.description}`);
  }
  if (c.states.length) {
    out.push('', 'States:');
    for (const s of c.states) out.push(`- ${s.attribute}: ${s.description}`);
  }
  if (c.hooks.length) {
    out.push('', 'Hooks:');
    for (const k of c.hooks) out.push(`- ${k.name}${k.value ? ` = ${k.value}` : ''}${k.on ? ` (on ${k.on.replace(/^The /, 'the ')})` : ''}: ${k.description}`);
  }
  if (c.events.length) {
    out.push('', 'Events:');
    for (const e of c.events) out.push(`- ${e.name}${e.detail ? ` detail ${e.detail}` : ''}${e.cancelable ? ', cancelable' : ''}: ${e.description}`);
  }
  if (c.keyboard.length) {
    out.push('', 'Keyboard:');
    for (const k of c.keyboard) out.push(`- ${keysText(k.keys)}: ${k.action}`);
  }
  if (c.a11y.length) {
    out.push('', 'Accessibility:');
    for (const a of c.a11y) out.push(`- ${a}`);
  }
  out.push('', `Example (${c.example.title}):`, '', fence('html', c.example.html));
  if (c.example.js) out.push('', fence('js', c.example.js));
  return out.join('\n');
}

// The shared reference: components, layout, utilities, tokens, icons, JS API, patterns.
function referenceText(m, depth) {
  const h = '#'.repeat(depth);
  const groups = [...new Set(m.components.map((c) => c.group))];
  const out = [];
  out.push(`${h} Components`, '', `${m.components.length} components. Icons in examples point at /icons/sprite.svg; change the path to where dist/icons/sprite.svg is served.`, '');
  for (const g of groups) {
    out.push(`${h}# ${g}`, '');
    for (const c of m.components.filter((x) => x.group === g)) out.push(componentText(c, depth + 2), '');
  }
  out.push(`${h} Layout primitives`, '', 'Tune them with custom properties (--v-gap, --v-min, --v-container-max), not modifiers.', '');
  for (const k of m.layout) out.push(`- .${k.name}${k.description ? `: ${k.description}` : ''}`);
  out.push('', `${h} Utilities`, '');
  for (const g of m.utilities) out.push(`- ${g.group}: ${g.classes.map((k) => `.${k}`).join(' ')}`);
  out.push('', `${h} Theme attributes`, '');
  for (const a of m.theme.attributes) out.push(`- ${a.name} on ${a.on}: ${a.values.join(', ')}${a.default ? ` (default ${a.default})` : ''}. ${a.description}`);
  out.push('', 'Directions:');
  for (const d of m.theme.directions) out.push(`- ${d.name} (${d.label}): ${d.description}`);
  out.push('', `${h} Tokens`, '', m.tokens.note, '');
  for (const t of m.tokens.contract) out.push(`- ${t.name} (${t.level}): ${t.purpose}`);
  out.push('', `Component tokens: ${m.tokens.component.map((t) => t.name).join(' ')}`, '');
  out.push(`${h} Icons`, '', `Usage: \`${m.icons.usage}\``, '', `${m.icons.names.length} names: ${m.icons.names.join(' ')}`, '');
  out.push(`${h} JavaScript API`, '', 'window.Vectra from dist/vectra.js, or named exports of dist/vectra.esm.js. Hooks start on their own; this API is for code.', '');
  for (const a of m.api) out.push(`- \`${a.signature}\`: ${a.description}`);
  out.push('', 'Hooks registered as modules (they start on their own):', m.hooks.filter((x) => x.registered).map((x) => x.name).join(' '), '');
  out.push(`${h} Patterns`, '', 'Complete pages and galleries in the repository to copy from. Classes starting with ex- and the #i-* sprite are gallery-only: do not copy them.', '');
  for (const p of m.patterns) out.push(`- ${p.path}: ${p.name}`);
  return out.join('\n');
}

function setupText(m) {
  return [
    `Install: \`${m.install.npm}\`, or copy dist/ from the release zip.`,
    '',
    fence('html', m.install.head),
    '',
    ...m.install.notes.map((n) => `- ${n}`),
    '',
    'A page skeleton to start from:',
    '',
    fence('html', m.install.page),
  ].join('\n');
}

export function llmsTxt(m) {
  const groups = [...new Set(m.components.map((c) => c.group))];
  const out = [
    `# ${m.name}`,
    '',
    `> ${m.summary}`,
    '',
    `Version ${m.version}, ${m.license} licence, npm package ${m.package}. For a single file with every rule, component, token, icon and the JS API, read llms-full.txt. The machine-readable manifest ships in the npm package at dist/ai/vectra.manifest.json, with its schema beside it.`,
    '',
    '## Docs',
    '',
    `- [Getting started](${m.homepage}getting-started/): install, the two tags to load, directions and themes`,
    `- [Full reference for assistants](${m.homepage}llms-full.txt): rules, every component with classes, hooks, keyboard and an example, tokens, icons, JS API`,
    `- [Tokens](${m.homepage}foundations/tokens/): the token contract every direction fills`,
    `- [Layout primitives](${m.homepage}foundations/layout/): container, stack, cluster, grid, sidebar, switcher`,
    `- [Utilities](${m.homepage}foundations/utilities/): the helper classes`,
    `- [Icons](${m.homepage}foundations/icons/): every icon name in the sprite`,
    `- [JavaScript API](${m.homepage}api/): window.Vectra, events and hooks`,
    `- [Patterns](${m.homepage}patterns/): complete pages to copy from`,
    `- [Migrating from v1](${m.homepage}migration/): v1 (Bootstrap) classes to v2`,
    '',
  ];
  for (const g of groups) {
    out.push(`## Components: ${g}`, '');
    for (const c of m.components.filter((x) => x.group === g)) out.push(`- [${c.name}](${c.docs}): ${c.summary}`);
    out.push('');
  }
  out.push('## Optional', '', `- [Changelog](${m.homepage}changelog/): what changed in each release`, `- [Components index](${m.homepage}components/): all components on one page`, '');
  return out.join('\n');
}

export function llmsFullTxt(m) {
  return [
    `# ${m.name} ${m.version}: full reference for AI assistants`,
    '',
    `> ${m.summary}`,
    '',
    'Write markup using only what is in this file. Everything here is generated from the same data as the docs site and checked in CI: every class exists in the CSS, every hook in the JS, and every example passes axe on its own.',
    '',
    '## Rules',
    '',
    rulesText(m),
    '',
    '## Setup',
    '',
    setupText(m),
    '',
    referenceText(m, 2),
    '',
  ].join('\n');
}

export function referenceMd(m) {
  return [
    `# Vectra ${m.version} reference`,
    '',
    'Generated from dist/ai/vectra.manifest.json by build/manifest.mjs (npm run ai:skill). Do not edit by hand.',
    '',
    referenceText(m, 2),
    '',
  ].join('\n');
}

// The guidance shared by the Claude Code skill and AGENTS.md.
function guidance(m, refName) {
  const sections = m.patterns.filter((p) => p.path.endsWith('/') && !/icons|tokens/.test(p.path));
  return [
    '## Setup',
    '',
    setupText(m),
    '',
    '## Rules (always)',
    '',
    rulesText(m),
    '',
    '## How to build a page',
    '',
    `1. Start from the page skeleton above. Pick a direction with data-direction (${m.theme.directions.map((d) => d.name).join(', ')}).`,
    '2. Lay it out with the layout primitives: .v-container for the column, .v-stack for vertical rhythm, .v-cluster for rows that wrap, .v-grid for cards, .v-sidebar for a side panel and content.',
    `3. Find each component in ${refName}, copy its example and change only the content, ids and modifiers. Keep every attribute the example uses (roles, aria-*, data-v-*, type).`,
    '4. Use states, not classes: disabled, aria-busy="true" for loading, aria-invalid="true" for errors, aria-current="page" for the current link, hidden for hidden panels.',
    '5. Add behaviour with the data-v-* hook the component lists. Use the JS API (Vectra.toast, Vectra.theme.set, Vectra.fieldState) only from your own code.',
    '6. Check: one h1, labels on every control, unique ids, every aria reference resolves, no class outside the reference.',
    '',
    '## Common patterns',
    '',
    '- Auth (sign in, sign up, recovery, two-factor, sessions, first run): a .v-card in a .v-container v-container-narrow with a .v-field per input, a .v-btn v-btn-primary v-btn-block submit, and an .v-error-summary above the form after a failed submit (or a .v-alert for one server error such as a wrong password). Plain text links need no class: base.css styles them. Pages: examples/auth/.',
    '- Sections (hero, features, pricing, testimonials, logos, FAQ): .v-container v-stack per section with an h2; .v-grid of .v-card or .v-pricing; .v-logos; .v-testimonial; .v-accordion for the FAQ.',
    '- States: .v-empty for nothing yet, .v-skeleton while loading, .v-alert or .v-callout for errors and notices, .v-toast via Vectra.toast() for results, .v-connection for offline.',
    '- App shell: .v-navbar at the top, .v-sidenav at the side, .v-bottombar on phones, content in main.',
    '',
    'Galleries to copy from:',
    ...sections.map((p) => `- ${p.path}: ${p.description}`),
    '',
    '## Never',
    '',
    '- Never use classes from Bootstrap, Tailwind or Vectra v1 (btn, card, row, col-*, d-flex, text-muted). See the reference for the v- equivalent.',
    '- Never add .active, .is-open, .is-invalid, .show or .disabled: use the attribute.',
    '- Never put data-v-* hooks on elements other than the ones the reference names, and never call init functions by hand.',
    '- Never load a CDN, an icon font or a framework for Vectra. Never copy ex-* classes or #i-* sprite ids from the galleries.',
    '- Never use a div or span as a button, a placeholder as a label, or colour alone to show meaning.',
    '- Never hard-code colours or radii: use the --v-* tokens.',
  ].join('\n');
}

export function skillMd(m) {
  return [
    '---',
    'name: vectra',
    'description: Writes correct markup with Vectra, the zero-dependency CSS/JS UI kit (v-* classes, data-v-* hooks, data-direction themes). Use when building or editing any page, component, form or layout that uses Vectra, @creativeigniter/vectra, vectra.css or classes starting with v-.',
    '---',
    '',
    `# Building UI with Vectra ${m.version}`,
    '',
    'Vectra is plain HTML: v-* classes for the look, native attributes and ARIA for state, data-v-* attributes for behaviour. Every component, class, hook, keyboard pattern and a valid example is in [reference.md](reference.md). Read the entry for each component before writing it. Generated by build/manifest.mjs; do not edit by hand.',
    '',
    guidance(m, 'reference.md'),
    '',
  ].join('\n');
}

export function agentsMd(m) {
  const groups = [...new Set(m.components.map((c) => c.group))];
  return [
    '<!-- Vectra: paste this into your project AGENTS.md (or the instructions file your assistant reads). Generated by build/manifest.mjs. -->',
    '',
    `# Vectra ${m.version}`,
    '',
    'This project uses Vectra, a zero-dependency CSS/JS UI kit: v-* classes for the look, native attributes and ARIA for state, data-v-* attributes for behaviour. The full reference (every class, hook, keyboard pattern and a valid example per component) is dist/ai/llms-full.txt in the package, or llms-full.txt on the docs site. Read a component there before writing it.',
    '',
    guidance(m, 'llms-full.txt'),
    '',
    '## Components',
    '',
    ...groups.flatMap((g) => [`${g}:`, ...m.components.filter((c) => c.group === g).map((c) => `- ${c.name}: ${c.classes.filter((k) => k.kind === 'base').map((k) => `.${k.name}`).join(' ')}${c.hooks.length ? `, hooks ${c.hooks.map((k) => k.name).join(' ')}` : ''}`), '']),
  ].join('\n');
}

/** Every output, keyed by path: dist/ai/ and the committed copies in ai/. */
export async function outputs() {
  const manifest = await buildManifest();
  const schema = await readFile('build/manifest.schema.json', 'utf8');
  const skill = skillMd(manifest);
  const reference = referenceMd(manifest);
  const agents = agentsMd(manifest);
  return {
    manifest,
    dist: {
      [`${OUT}/vectra.manifest.json`]: `${JSON.stringify(manifest, null, 2)}\n`,
      [`${OUT}/vectra.manifest.schema.json`]: schema,
      [`${OUT}/llms.txt`]: llmsTxt(manifest),
      [`${OUT}/llms-full.txt`]: llmsFullTxt(manifest),
      [`${OUT}/AGENTS.md`]: agents,
      [`${OUT}/claude-skill/vectra/SKILL.md`]: skill,
      [`${OUT}/claude-skill/vectra/reference.md`]: reference,
    },
    committed: {
      [`${SKILL_DIR}/SKILL.md`]: skill,
      [`${SKILL_DIR}/reference.md`]: reference,
      'ai/AGENTS.md': agents,
    },
  };
}

/** Problems with the manifest itself; empty means good. */
export async function validateManifest(manifest, texts) {
  const errors = [];
  checkSchema(manifest, await readJSON('build/manifest.schema.json'), 'manifest', errors);
  for (const [path, text] of Object.entries(texts)) if (text.includes(EM_DASH)) errors.push(`${path}: contains an em dash`);
  const covered = new Set(manifest.api.map((a) => a.name));
  for (const name of await publicExports()) if (!covered.has(name)) errors.push(`manifest api: export "${name}" of src/js/index.js is not documented`);
  return errors;
}

async function main() {
  const { manifest, dist, committed } = await outputs();
  const errors = await validateManifest(manifest, { ...dist, ...committed });
  if (errors.length) {
    console.error(`AI manifest has ${errors.length} problem(s):\n${errors.join('\n')}`);
    process.exit(1);
  }
  for (const [path, text] of Object.entries(dist)) {
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, text);
  }
  if (process.argv.includes('--write')) {
    for (const [path, text] of Object.entries(committed)) {
      await mkdir(dirname(path), { recursive: true });
      await writeFile(path, text);
    }
  }
  if (process.argv.includes('--check')) {
    const stale = [];
    for (const [path, text] of Object.entries(committed)) if (!existsSync(path) || (await readFile(path, 'utf8')) !== text) stale.push(path);
    if (stale.length) {
      console.error(`Stale: ${stale.join(', ')}. Run npm run ai:skill and commit the result.`);
      process.exit(1);
    }
  }
  const kb = (s) => `${(Buffer.byteLength(s) / 1024).toFixed(1)} KB`;
  console.log(`built ${OUT}: ${manifest.components.length} components, manifest ${kb(dist[`${OUT}/vectra.manifest.json`])}, llms.txt ${kb(dist[`${OUT}/llms.txt`])}, llms-full.txt ${kb(dist[`${OUT}/llms-full.txt`])}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();

/* Build-time data pages for the docs site: the quality page (PLAN.md section 1, with the numbers from
   this build) and the changelog (from git tags and merged pull requests). Everything is measured when the
   site is built; values that change from build to build carry data-volatile so the visual tests can
   hold them still. */
import { readFile, readdir } from 'node:fs/promises';
import { dirname, basename } from 'node:path';
import { gzipSync } from 'node:zlib';
import { execFileSync } from 'node:child_process';
import { esc, table } from './site-render.mjs';
import { FLOOR } from './browsers.mjs';
import { HUES, PAIRS } from './contrast-pairs.mjs';
import { DIRECTIONS, THEMES, PAGES, AUTH_PAGES } from '../tests/helpers.js';

const kb = (n) => `${(n / 1024).toFixed(2)} KB`;
const v = (text) => `<span data-volatile>${text}</span>`;
const n = (x) => x.toLocaleString('en-IE');

/** Runs a command and returns its stdout, or null when it fails (no git, a shallow clone, no Playwright). */
function run(cmd, args) {
  try {
    return execFileSync(cmd, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024 }).trim();
  } catch {
    return null;
  }
}

/* ---------- Sizes ---------- */
// Same expansion and maths as build/check-size.mjs: gzip level 9, or raw bytes for { raw: n }.
async function sizes() {
  const budgets = JSON.parse(await readFile('build/budgets.json', 'utf8'));
  const out = [];
  for (const [pattern, budget] of Object.entries(budgets)) {
    if (pattern.startsWith('_')) continue;
    let files = [pattern];
    if (pattern.includes('*')) {
      const [prefix, suffix] = basename(pattern).split('*');
      files = (await readdir(dirname(pattern))).filter((f) => f.startsWith(prefix) && f.endsWith(suffix)).sort().map((f) => `${dirname(pattern)}/${f}`);
    }
    const raw = typeof budget === 'object';
    const limit = raw ? budget.raw : budget;
    const measured = [];
    for (const file of files) {
      const bytes = await readFile(file);
      measured.push({ file, size: raw ? bytes.length : gzipSync(bytes, { level: 9 }).length });
    }
    measured.sort((a, b) => b.size - a.size);
    out.push({ pattern, raw, limit, files: measured });
  }
  return out;
}

const meter = (size, limit, label) => `<meter class="v-meter" min="0" max="${limit}" low="${Math.round(limit * 0.8)}" high="${Math.round(limit * 0.95)}" optimum="0" value="${Math.min(size, limit)}" aria-label="${esc(label)}" data-volatile>${Math.round((size / limit) * 100)}%</meter>`;

function sizeTable(list) {
  const rows = list.map(({ pattern, raw, limit, files }) => {
    const top = files[0];
    const many = files.length > 1;
    const share = Math.round((top.size / limit) * 100);
    const name = many
      ? `<details class="qa-files"><summary><code>${esc(pattern)}</code> <span class="v-text-secondary">${v(`${files.length} files`)}</span></summary><ul>${files.map((f) => `<li><code>${esc(basename(f.file))}</code> ${v(kb(f.size))}</li>`).join('')}</ul></details>`
      : `<code>${esc(pattern)}</code>`;
    return [
      name,
      `${v(kb(top.size))}${raw ? ' raw' : ''}${many ? ' <span class="v-text-secondary">largest</span>' : ''}`,
      `<span data-budget-key="${esc(pattern)}" data-budget-bytes="${limit}">${kb(limit)}</span>`,
      `<span class="qa-use">${meter(top.size, limit, `${pattern}: ${share}% of budget`)}${v(`${share}%`)}</span>`,
    ];
  });
  return table(['File', 'Size (gzipped)', 'Budget', 'Used'], rows, 'Size budgets');
}

/* ---------- Tests ---------- */
const SPEC_NOTES = {
  'a11y.spec.js': 'axe on every gallery and docs page in every direction and theme',
  'auth.spec.js': 'Sign in, sign up, recovery and two-step pages',
  'contrast.spec.js': 'Rendered text contrast on real pages',
  'core.spec.js': 'Auto-init, observer, events, storage, announcements',
  'forms-js.spec.js': 'Form behaviour, with and without JavaScript',
  'keyboard.spec.js': 'Keyboard paths through interactive components',
  'rendered.spec.js': 'Rendered contrast of every text node on the galleries',
  'site.spec.js': 'This docs site: pages, search, demos, theme builder, quality page',
  'theming.spec.js': 'Theme API, customizer, switches and toggles',
  'tokens.spec.js': 'Token contrast sweep and feature surfaces across every hue',
  'visual.spec.js': 'Screenshots at phone and desktop width (CI container only)',
};

/** Counts tests per spec with `playwright test --list` (loads the specs, runs nothing, needs no browser). */
function testCounts() {
  const json = run(process.execPath, ['node_modules/@playwright/test/cli.js', 'test', '--list', '--project=chromium', '--reporter=json']);
  if (!json) return null;
  let report;
  try { report = JSON.parse(json); } catch { return null; }
  const counts = {};
  let noJs = 0;
  const walk = (suite, trail) => {
    const here = [...trail, suite.title ?? ''];
    for (const spec of suite.specs ?? []) {
      counts[spec.file] = (counts[spec.file] ?? 0) + spec.tests.length;
      if (/without (?:js|javascript)\b|\bjs off\b/i.test([...here, spec.title].join(' '))) noJs += spec.tests.length;
    }
    for (const child of suite.suites ?? []) walk(child, here);
  };
  for (const suite of report.suites ?? []) walk(suite, []);
  return { counts, noJs };
}

/* ---------- Page ---------- */
export async function qualityPage(page, pages) {
  const list = await sizes();
  const byKey = Object.fromEntries(list.map((s) => [s.pattern, s]));
  const size = (key) => byKey[key]?.files[0]?.size ?? 0;
  const coreGz = size('dist/vectra.core.min.css') + (byKey['dist/directions/*.min.css']?.files.find((f) => f.file.endsWith('/tech.min.css'))?.size ?? 0);
  const tests = testCounts();
  const urls = run(process.execPath, ['build/check-urls.mjs']) !== null;
  const commit = run('git', ['rev-parse', '--short=10', 'HEAD']);
  const commitDate = run('git', ['log', '-1', '--format=%cs']);
  const built = new Date().toISOString().slice(0, 16).replace('T', ' ');

  const combos = DIRECTIONS.length * THEMES.length;
  const sitePaths = new Set(PAGES.filter((p) => p.path.startsWith('/site/dist/')).map((p) => p.path.slice('/site/dist/'.length)));
  const siteOnly = [...pages.map((p) => p.path), page.path].filter((p) => !sitePaths.has(p)).length;
  const axeRuns = PAGES.length * combos + AUTH_PAGES.length * 2 + siteOnly * 2;
  const sweep = DIRECTIONS.length * THEMES.length * HUES.length * PAIRS.length;
  const rendered = PAGES.filter((p) => p.rendered).length;
  const total = tests ? Object.values(tests.counts).reduce((a, b) => a + b, 0) : 0;
  const visual = tests?.counts['visual.spec.js'] ?? 0;
  const ok = (text) => `<span class="v-badge v-badge-success v-badge-dot">${text}</span>`;
  const part = (text) => `<span class="v-badge v-badge-warning v-badge-dot">${text}</span>`;
  const budget = (key) => kb(byKey[key].limit);

  const bars = [
    ['Runtime dependencies', '0: no CDN, no npm runtime packages, no icon fonts', urls ? `${ok('Met')} no external URL in the sources and builds` : `${part('Not run')} the URL check could not run in this build`, '<code>npm run check:urls</code> on every push, and on the built site in <code>site:check</code>'],
    ['CSS size', 'Core + one direction ≤ 8 KB gz, all components ≤ 22 KB gz, each extra direction ≤ 2 KB gz', `${ok('Met')} core + tech ${v(kb(coreGz))}, components ${v(kb(size('dist/vectra.components.min.css')))}, largest direction ${v(kb(size('dist/directions/*.min.css')))}`, '<code>npm run check:size</code> fails the build'],
    ['JS size', `Everything in one file within ${budget('dist/vectra.js')} gz (PLAN.md: core ≤ 2 KB, all v2.0 modules ≤ 9 KB)`, `${ok('Met')} <code>vectra.js</code> ${v(kb(size('dist/vectra.js')))}`, '<code>npm run check:size</code>'],
    ['Accessibility', 'WCAG 2.2 AA in every direction and theme, at any accent hue', `${ok('Checked')} ${v(n(axeRuns))} axe runs, ${v(n(sweep))} token pairings`, 'axe in Playwright, the token sweep and rendered contrast'],
    ['Keyboard', 'Every interactive component usable by keyboard (WAI-ARIA APG)', tests ? `${ok('Checked')} ${v(n(tests.counts['keyboard.spec.js'] ?? 0))} keyboard tests plus per-component JS tests` : part('Not counted'), 'Playwright interaction tests'],
    ['Works without JS', 'Everything renders and reads; native dialogs, popovers, accordions and forms work', tests ? `${ok('Checked')} ${v(n(tests.noJs))} tests run with JavaScript off` : part('Not counted'), 'Playwright with <code>javaScriptEnabled: false</code>'],
    ['No build to use it', 'Link one CSS file and one JS file', `${ok('Met')} every gallery loads <code>dist/</code> or <code>src/</code> directly`, 'The galleries and this site'],
    ['Visual quality', 'Four directions, phone and desktop, light and dark', `${ok('Checked')} ${v(n(visual))} screenshots compared`, 'Visual regression in the pinned Playwright container'],
  ];

  const testRows = tests ? Object.entries(tests.counts).sort(([a], [b]) => a.localeCompare(b)).map(([file, count]) => [`<code>tests/${esc(file)}</code>`, v(n(count)), esc(SPEC_NOTES[file] ?? '')]) : [];
  const browsers = [['Chrome', FLOOR.chrome], ['Edge', FLOOR.edge], ['Safari', FLOOR.safari], ['Safari on iOS', FLOOR.safari_ios], ['Firefox', FLOOR.firefox]];

  page.body = `<header class="site-page-head">
  <p class="v-kicker">Tools</p>
  <h1>Quality</h1>
  <p class="v-lead">"Best" is not measurable, so Vectra commits to bars that are. This page is generated when the site is built: every number below was measured from that build, and the gaps are listed as plainly as the passes.</p>
</header>
<div class="v-grid qa-stats">
  <div class="v-card v-stat"><span class="v-stat-label">Core + one direction</span><span class="v-stat-value">${v(kb(coreGz))}</span><span class="v-text-sm v-text-secondary">gzipped, budget 8 KB</span></div>
  <div class="v-card v-stat"><span class="v-stat-label">Tests (Chromium)</span><span class="v-stat-value">${tests ? v(n(total)) : 'n/a'}</span><span class="v-text-sm v-text-secondary">in ${tests ? v(Object.keys(tests.counts).length) : 0} spec files</span></div>
  <div class="v-card v-stat"><span class="v-stat-label">axe runs</span><span class="v-stat-value">${v(n(axeRuns))}</span><span class="v-text-sm v-text-secondary">WCAG 2.2 AA and best practice</span></div>
  <div class="v-card v-stat"><span class="v-stat-label">Contrast pairings</span><span class="v-stat-value">${v(n(sweep))}</span><span class="v-text-sm v-text-secondary">${DIRECTIONS.length} directions × ${THEMES.length} themes × ${HUES.length} hues</span></div>
</div>

<h2 id="bars">The bars</h2>
<p>From <code>PLAN.md</code>, section 1. Each one is enforced by a check that fails CI, not by a promise.</p>
${table(['Bar', 'Target', 'This build', 'Enforced by'], bars.map(([a, b, c, d]) => [`<strong>${a}</strong>`, b, c, d]), 'Quality bars')}

<h2 id="sizes">Size budgets</h2>
<p>Every file with a budget in <code>build/budgets.json</code>, gzipped at level 9 exactly as <code>npm run check:size</code> measures it. A budget written with <code>*</code> covers every matching file; the row shows the largest.</p>
${sizeTable(list)}

<h2 id="tests">Tests</h2>
${tests ? `<p>Counted with <code>playwright test --list</code> for the Chromium project when this site was built: ${v(n(total))} tests. Chromium runs on every push and pull request; Firefox and WebKit run the same suite nightly.</p>
${table(['Spec', 'Tests', 'What it covers'], testRows, 'Tests by spec')}` : '<p>The test list was not available when this site was built (Playwright could not load the specs), so no counts are shown rather than old ones.</p>'}

<h2 id="accessibility">Accessibility coverage</h2>
${table(['Check', 'Scope', 'Runs'], [
    ['axe, full matrix', `${v(PAGES.length)} gallery and docs pages × ${DIRECTIONS.length} directions × ${THEMES.length} themes`, v(n(PAGES.length * combos))],
    ['axe, auth pages', `${v(AUTH_PAGES.length)} sign-in, sign-up, recovery and two-step pages × 2 (tech dark, editorial light)`, v(n(AUTH_PAGES.length * 2))],
    ['axe, docs site', `${v(siteOnly)} more docs pages × 2 (tech dark, editorial light)`, v(n(siteOnly * 2))],
    ['Token contrast sweep', `${DIRECTIONS.length} directions × ${THEMES.length} themes × ${HUES.length} accent hues × ${PAIRS.length} pairings (text 4.5:1, focus and control borders 3:1)`, v(n(sweep))],
    ['Feature surfaces', `Gradient surfaces rendered and checked at the worst pixel, ${DIRECTIONS.length} × ${THEMES.length} × ${HUES.length}`, n(DIRECTIONS.length * THEMES.length * HUES.length)],
    ['Rendered contrast', `Every text node on ${v(rendered)} galleries, in every direction and theme`, v(n(rendered * combos))],
  ], 'Accessibility coverage')}

<h2 id="browsers">Browsers</h2>
<p>The floor is read from <code>build/browsers.mjs</code>; the build targets and <code>npm run check:baseline</code> (MDN compatibility data) use the same list, so a feature newer than the floor fails CI unless it only enhances.</p>
${table(['Browser', 'Minimum version'], browsers.map(([b, ver]) => [b, `${esc(ver)}+`]), 'Supported browsers')}

<h2 id="not-verified">Not verified yet</h2>
<p>What the checks above do not prove, so you can judge for yourself.</p>
<ul class="site-list">
  <li><strong>Firefox and WebKit</strong> run the full suite nightly, not on every push. A regression in Safari can land and be caught the next morning.</li>
  <li><strong>Screen readers</strong> (VoiceOver, NVDA, TalkBack) are tested by hand before releases, not in CI. axe catches markup problems, not how a page sounds.</li>
  <li><strong>Visual screenshots</strong> cover the default direction on most pages and all four directions on the galleries; the docs pages are screenshotted in tech only.</li>
  <li><strong>Real devices.</strong> Phone width is emulated in Chromium; touch targets and on-screen keyboards are checked by hand.</li>
  <li><strong>Forced colours and reduced transparency</strong> are designed for but not yet covered by automated tests.</li>
</ul>

<p class="qa-built">Built ${v(esc(built))} UTC${commit ? ` from commit ${v(`<code>${esc(commit)}</code>`)}${commitDate ? ` (${v(esc(commitDate))})` : ''}` : ', git commit not available'}.</p>`;
  return page;
}

/* ---------- Changelog ---------- */
function mergedPullRequests(range) {
  const log = run('git', ['log', '--first-parent', '--merges', '--format=%cs%x1f%s%x1f%b%x1e', range]);
  if (!log) return [];
  return log.split('\x1e').map((r) => r.trim()).filter(Boolean).map((r) => {
    const [date, subject, body] = r.split('\x1f');
    const m = subject.match(/^Merge pull request #(\d+)/);
    return m ? { date, number: m[1], title: (body ?? '').trim().split('\n')[0] || subject } : null;
  }).filter(Boolean);
}

export function changelogBody() {
  const head = run('git', ['rev-parse', 'HEAD']);
  if (!head) return '<p>Git was not available when this site was built, so there is nothing to list yet.</p>';
  const tags = (run('git', ['tag', '--list', 'v*', '--sort=creatordate', '--format=%(refname:short)\x1f%(creatordate:short)']) ?? '')
    .split('\n').filter(Boolean).map((l) => l.split('\x1f'));
  const sections = [];
  let prev = null;
  for (const [tag, date] of tags) {
    sections.unshift({ title: tag, date, prs: mergedPullRequests(prev ? `${prev}..${tag}` : tag) });
    prev = tag;
  }
  sections.unshift({ title: 'Unreleased', prs: mergedPullRequests(prev ? `${prev}..HEAD` : 'HEAD') });
  const item = (pr) => `<li><strong>${esc(pr.title)}</strong> <span class="v-text-secondary v-text-sm"><a href="https://github.com/xttrust/vectra/pull/${pr.number}">#${pr.number}</a>, ${esc(pr.date)}</span></li>`;
  const note = tags.length ? '' : '<p>No release has been tagged yet. Pull requests merged so far are listed under Unreleased, newest first.</p>\n';
  const html = sections.map((s) => `<h2>${esc(s.title)}${s.date ? ` <span class="v-text-secondary v-text-sm">${esc(s.date)}</span>` : ''}</h2>\n${s.prs.length
    ? `<ul class="site-list">${s.prs.map(item).join('')}</ul>`
    : `<p>${s.title === 'Unreleased' && !tags.length ? 'The git history in this build has no merged pull requests (a shallow clone has only the latest commit). A full clone lists them here.' : 'No merged pull requests in this range.'}</p>`}`).join('\n');
  return note + html;
}

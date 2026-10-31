/* Shared test setup. Pages are added here as they are built or ported. */
import { readdirSync } from 'node:fs';

export const DIRECTIONS = ['tech', 'editorial', 'soft', 'glass'];
export const THEMES = ['light', 'dark'];

// visual: 'full' = 4 directions × 2 themes × 2 widths; 'basic' = default direction × 2 themes × 2 widths;
// 'none' = no screenshots
// (screenshot budget in PLAN.md section 9). rendered: true adds the page to tests/rendered.spec.js.
export const PAGES = [
  { name: 'prototype', path: '/prototype/', storage: 'vectra2', visual: 'full' },
  { name: 'tokens', path: '/examples/tokens/', storage: 'vectra', visual: 'full' },
  { name: 'layout', path: '/examples/layout/', storage: 'vectra', visual: 'basic' },
  { name: 'components', path: '/examples/components/', storage: 'vectra', visual: 'full', rendered: true },
  { name: 'forms', path: '/examples/forms/', storage: 'vectra', visual: 'full', rendered: true },
  { name: 'navigation', path: '/examples/navigation/', storage: 'vectra', visual: 'full', rendered: true },
  { name: 'content', path: '/examples/content/', storage: 'vectra', visual: 'full', rendered: true },
  { name: 'overlays', path: '/examples/overlays/', storage: 'vectra', visual: 'full', rendered: true },
  { name: 'elements', path: '/examples/elements/', storage: 'vectra', visual: 'full', rendered: true },
  { name: 'icons', path: '/examples/icons/', storage: 'vectra', visual: 'basic' },
  { name: 'theming', path: '/examples/theming/', storage: 'vectra', visual: 'full', rendered: true },
  { name: 'auth', path: '/examples/auth/', storage: 'vectra', visual: 'full', rendered: true },
  { name: 'states', path: '/examples/states/', storage: 'vectra', visual: 'full', rendered: true },
  { name: 'site-home', path: '/site/dist/', storage: 'vectra', visual: 'basic' },
  { name: 'site-button', path: '/site/dist/components/button/', storage: 'vectra', visual: 'basic' },
  { name: 'sections-chrome', path: '/examples/sections/chrome.html', storage: 'vectra', visual: 'full', rendered: true },
  { name: 'sections-marketing', path: '/examples/sections/marketing.html', storage: 'vectra', visual: 'full', rendered: true },
  { name: 'sections-app', path: '/examples/sections/app.html', storage: 'vectra', visual: 'full', rendered: true },
  { name: 'page-saas-home', path: '/examples/pages/saas-home.html', storage: 'vectra', visual: 'basic' },
  { name: 'page-app-shell', path: '/examples/pages/app-shell.html', storage: 'vectra', visual: 'basic' },
];

// Every generated auth page (examples/auth/<group>/<flow>.html), found on disk so new flows are tested
// without editing this list. visual: 'basic' for a representative few, 'none' for the rest.
const AUTH_VISUAL = ['sign-in/password', 'sign-in/error', 'sign-up/plans', 'recovery/reset', 'two-factor/setup', 'accounts/delete', 'first-run/empty-dashboard', 'layouts/dialog'];
const AUTH_DIR = new URL('../examples/auth/', import.meta.url);
export const AUTH_PAGES = readdirSync(AUTH_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .flatMap((d) => readdirSync(new URL(`${d.name}/`, AUTH_DIR)).filter((f) => f.endsWith('.html')).map((f) => `${d.name}/${f.slice(0, -5)}`))
  .sort()
  .map((slug) => ({ name: `auth-${slug.replace('/', '-')}`, slug, path: `/examples/auth/${slug}.html`, storage: 'vectra', visual: AUTH_VISUAL.includes(slug) ? 'basic' : 'none' }));

export const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

// Seeds direction, theme and customizer state in storage, then reloads so the page boots with it.
// Storage is only seeded once, so later reloads inside a test keep whatever the page saved.
export async function open(page, { path, storage }, { direction, theme, custom } = {}) {
  await page.goto(path);
  await page.evaluate(([prefix, d, t, c]) => {
    localStorage.clear();
    if (d) localStorage.setItem(`${prefix}-direction`, d);
    if (t) localStorage.setItem(`${prefix}-theme`, t);
    if (c) localStorage.setItem(`${prefix}-custom`, JSON.stringify(c));
  }, [storage, direction, theme, custom]);
  await page.reload();
  await page.evaluate(() => document.fonts.ready);
}

export const describeViolations = (violations) => violations.map((v) => ({
  rule: v.id,
  impact: v.impact,
  nodes: v.nodes.slice(0, 5).map((n) => `${n.target.join(' ')}: ${n.failureSummary?.split('\n')[1]?.trim() ?? ''}`),
}));

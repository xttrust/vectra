/* Shared test setup. Pages are added here as they are built or ported. */
export const DIRECTIONS = ['tech', 'editorial', 'soft', 'aero'];
export const THEMES = ['light', 'dark'];

export const PAGES = [
  { name: 'prototype', path: '/v2/prototype/', storage: 'vectra2' },
];

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

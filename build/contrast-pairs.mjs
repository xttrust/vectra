/* The token pairings every direction, theme and accent hue must pass (WCAG 2.2: text 4.5:1, focus
   indicators, large accent text and control borders 3:1). One list for tests/tokens.spec.js, the theme
   builder's live contrast report and the quality page, so all three always count the same checks.
   Each pair is [foreground token, background stack (painted bottom to top over white), minimum ratio,
   label, kind]. kind is text, focus (accent as focus ring, indicator or large text) or control. */
export const HUES = [null, ...Array.from({ length: 12 }, (_, i) => i * 30)];

const SURFACES = {
  bg: ['bg'], 'bg-subtle': ['bg', 'bg-subtle'], surface: ['bg', 'surface'],
  'surface-2': ['bg', 'surface', 'surface-2'], card: ['bg', 'card-bg'],
};

export const PAIRS = [];
for (const [label, s] of Object.entries(SURFACES)) {
  for (const t of ['text', 'text-2', 'text-3', 'accent-text']) PAIRS.push([t, s, 4.5, `${t} on ${label}`, 'text']);
  PAIRS.push(['accent', s, 3, `accent (focus, indicators) vs ${label}`, 'focus']);
}
for (const tone of ['success', 'warning', 'danger', 'info']) {
  PAIRS.push([tone, ['bg', 'surface'], 4.5, `${tone} on surface`, 'text']);
  PAIRS.push([tone, ['bg', 'card-bg'], 4.5, `${tone} on card`, 'text']);
  PAIRS.push([tone, ['bg', 'surface', `${tone}-soft`], 4.5, `${tone} on ${tone}-soft`, 'text']);
  PAIRS.push(['text', ['bg', 'surface', `${tone}-soft`], 4.5, `text on ${tone}-soft`, 'text']);
  PAIRS.push(['text-2', ['bg', 'surface', `${tone}-soft`], 4.5, `text-2 on ${tone}-soft`, 'text']);
}
PAIRS.push(['accent-text', ['bg', 'surface', 'accent-soft'], 4.5, 'accent-text on accent-soft', 'text']);
PAIRS.push(['on-accent', ['bg', 'accent'], 4.5, 'on-accent on accent', 'text']);
PAIRS.push(['primary-fg', ['bg', 'primary-bg'], 4.5, 'primary-fg on primary-bg', 'text']);
PAIRS.push(['primary-hover-fg', ['bg', 'primary-hover-bg'], 4.5, 'primary-hover-fg on primary-hover-bg', 'text']);
PAIRS.push(['on-danger', ['bg', 'danger'], 4.5, 'on-danger on danger', 'text']);
PAIRS.push(['on-danger', ['bg', 'danger-hover'], 4.5, 'on-danger on danger-hover', 'text']);
PAIRS.push(['text', ['bg', 'card-bg', 'input-bg'], 4.5, 'text in input', 'text']);
PAIRS.push(['text-3', ['bg', 'card-bg', 'input-bg'], 4.5, 'placeholder in input', 'text']);
PAIRS.push(['border-control', ['bg', 'card-bg'], 3, 'border-control vs card', 'control']);
PAIRS.push(['border-control', ['bg', 'surface'], 3, 'border-control vs surface', 'control']);
PAIRS.push(['border-control', ['bg', 'card-bg', 'input-bg'], 3, 'border-control vs input fill', 'control']);

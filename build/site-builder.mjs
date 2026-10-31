/* Theme builder page for the docs site (PLAN.md section 11): fills the controls into
   site/pages/theme-builder.html and writes the preview document the builder drives. The behaviour is
   site/assets/theme-builder.js; the contrast pairings come from build/contrast-pairs.mjs, the same list
   tests/tokens.spec.js checks in CI. */
import { readFile } from 'node:fs/promises';
import { esc, icon } from './site-render.mjs';
import { PAIRS } from './contrast-pairs.mjs';

// Each tile previews its direction with a few fixed colours from the direction files (light theme,
// default accent), so the choice reads before you make it.
const DIRECTIONS = [
  { id: 'tech', name: 'Dark tech', note: 'Deep, precise, a cool glow', bg: 'oklch(18.5% 0.014 255deg)', fg: 'oklch(96.5% 0.005 250deg)', line: 'oklch(100% 0 0deg / 16%)', accent: 'oklch(82% 0.13 200deg)', radius: '5px', font: 'var(--v-font-sans)' },
  { id: 'editorial', name: 'Editorial', note: 'Paper, ink and a serif', bg: 'oklch(97.2% 0.012 85deg)', fg: 'oklch(21% 0.02 55deg)', line: 'oklch(24% 0.02 60deg)', accent: 'oklch(52% 0.16 35deg)', radius: '1px', font: 'var(--v-font-serif)' },
  { id: 'soft', name: 'Soft depth', note: 'Layered, friendly, rounded', bg: 'oklch(96.6% 0.011 278deg)', fg: 'oklch(25% 0.035 278deg)', line: 'oklch(86% 0.016 278deg)', accent: 'oklch(54% 0.2 278deg)', radius: '9px', font: 'var(--v-font-sans)' },
  { id: 'glass', name: 'Glass', note: 'Frosted over a colour field', bg: 'linear-gradient(135deg, oklch(86% 0.08 290deg), oklch(88% 0.07 230deg))', fg: 'oklch(22% 0.05 290deg)', line: 'oklch(100% 0 0deg / 65%)', accent: 'oklch(50% 0.2 290deg)', radius: '8px', font: 'var(--v-font-sans)' },
];

export const PRESETS = [[200, 'Cyan'], [250, 'Blue'], [285, 'Violet'], [330, 'Pink'], [15, 'Red'], [50, 'Orange'], [80, 'Amber'], [145, 'Green'], [175, 'Teal']];

// Tokens the fine-tune panel can override, with what they paint.
const TOKENS = [
  ['bg', 'Page background'], ['surface', 'Cards and panels'], ['text', 'Body text'], ['text-2', 'Secondary text'],
  ['text-3', 'Hints and placeholders'], ['border-control', 'Input and control borders'], ['accent', 'Accent, focus ring'],
];

const tiles = (root) => DIRECTIONS.map((d) => `        <label class="tb-dir" style="--tb-bg: ${d.bg}; --tb-fg: ${d.fg}; --tb-line: ${d.line}; --tb-ac: ${d.accent}; --tb-r: ${d.radius}; --tb-font: ${d.font}">
          <input type="radio" name="direction" value="${d.id}">
          <span class="tb-dir-art" aria-hidden="true"><span class="tb-dir-aa">Aa</span><span class="tb-dir-line"></span><span class="tb-dir-pill"></span></span>
          <span class="tb-dir-text"><span class="tb-dir-name">${esc(d.name)}</span><span class="tb-dir-note">${esc(d.note)}</span></span>
          ${icon(root, 'check', ' data-tb-tick')}
        </label>`).join('\n');

const presets = () => [
  '        <label title="Direction default"><input type="radio" name="accent" value="default"><span class="v-swatch" aria-hidden="true"></span><span class="v-sr-only">Direction default</span></label>',
  ...PRESETS.map(([h, name]) => `        <label title="${name}, ${h}°"><input type="radio" name="accent" value="${h}"><span class="v-swatch" style="background-color: oklch(62% 0.15 ${h}deg)" aria-hidden="true"></span><span class="v-sr-only">${name}</span></label>`),
].join('\n');

const tokenRows = (root) => TOKENS.map(([t, what]) => `        <div class="tb-token" data-tb-row="${t}">
          <input type="color" id="tb-o-${t}" data-tb-token="${t}" aria-describedby="tb-o-${t}-what">
          <label for="tb-o-${t}"><code class="tb-token-name">--v-${t}</code><span class="tb-token-what" id="tb-o-${t}-what">${esc(what)}</span></label>
          <button class="v-btn v-btn-ghost v-btn-sm v-btn-icon" type="button" data-tb-reset="${t}" aria-label="Reset --v-${t}" hidden>${icon(root, 'reset')}</button>
        </div>`).join('\n');

/** The builder page body: controls filled in, plus the pairings as JSON for the in-browser report. */
export async function themeBuilderPage(body) {
  const root = '{{root}}';
  const data = { pairs: PAIRS, presets: PRESETS };
  return body
    .replace('{{direction-tiles}}', tiles(root))
    .replace('{{presets}}', presets())
    .replace('{{token-rows}}', tokenRows(root))
    + `\n<script type="application/json" id="tb-data">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>\n`;
}

/** theme-builder/preview.html: an app screen and a website section from real components. No storage,
    no pre-paint: the builder sets every attribute on it. */
export async function previewDoc(root) {
  const markup = (await readFile('site/pages/theme-preview.html', 'utf8')).trim()
    .replace(/href="\/icons\/sprite\.svg#/g, `href="${root}assets/icons/sprite.svg#`);
  return `<!DOCTYPE html>
<html lang="en" data-direction="tech">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Theme preview · Vectra theme builder</title>
  <link rel="icon" href="data:,">
  <link rel="stylesheet" href="${root}assets/vectra.css">
  <link rel="stylesheet" href="${root}assets/preview.css">
</head>
<body>
  <main class="tbp" data-view="app" aria-label="Theme preview">
${markup.replace(/^/gm, '    ')}
  </main>
</body>
</html>
`;
}

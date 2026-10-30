/* Verifies the browser floor against MDN browser-compat-data.
   Required features must be supported at the floor; enhancements are reported, not enforced. */
import { createRequire } from 'node:module';
import { appendFile } from 'node:fs/promises';
import { FLOOR } from './browsers.mjs';

const bcd = createRequire(import.meta.url)('@mdn/browser-compat-data');

const FEATURES = [
  ['light-dark()', 'css.types.color.light-dark', true],
  ['oklch()', 'css.types.color.oklch', true],
  ['color-mix()', 'css.types.color.color-mix', true],
  ['cos()', 'css.types.cos', true],
  ['@layer', 'css.at-rules.layer', true],
  [':has()', 'css.selectors.has', true],
  ['Container queries', 'css.at-rules.container', true],
  [':user-invalid', 'css.selectors.user-invalid', true],
  ['popover attribute', 'html.global_attributes.popover', true],
  ['<dialog>', 'html.elements.dialog', true],
  ['Anchor positioning', 'css.properties.anchor-name', false],
  ['<details name>', 'html.elements.details.name', false],
  ['@starting-style', 'css.at-rules.starting-style', false],
  ['View transitions', 'api.Document.startViewTransition', false],
  ['Scroll-driven animations', 'css.properties.animation-timeline', false],
  ['interpolate-size', 'css.properties.interpolate-size', false],
];

const lookup = (path) => path.split('.').reduce((node, key) => node?.[key], bcd)?.__compat;

// First version with full, unflagged, unprefixed support; Infinity when there is none.
const versionAdded = (support) => {
  const entries = [support].flat().filter((s) => s && !s.flags && !s.prefix && !s.alternative_name && !s.partial_implementation && !s.version_removed);
  const versions = entries.map((s) => s.version_added)
    .filter((v) => typeof v === 'string' && v !== 'preview')
    .map((v) => parseFloat(v.replace('≤', '')));
  return versions.length ? Math.min(...versions) : Infinity;
};

const browsers = Object.keys(FLOOR);
const rows = [];
let failed = false;

for (const [name, path, required] of FEATURES) {
  const compat = lookup(path);
  if (!compat) {
    rows.push(`| ${name} | ${browsers.map(() => '?').join(' | ')} | unknown BCD path ${path} |`);
    failed ||= required;
    continue;
  }
  const cells = browsers.map((b) => {
    const v = versionAdded(compat.support[b]);
    const ok = v <= parseFloat(FLOOR[b]);
    if (required && !ok) failed = true;
    return `${v === Infinity ? 'no' : v}${ok ? '' : required ? ' FAIL' : ' (fallback)'}`;
  });
  rows.push(`| ${name} | ${cells.join(' | ')} | ${required ? 'required' : 'enhancement'} |`);
}

const header = `| Feature | ${browsers.map((b) => `${b} (floor ${FLOOR[b]})`).join(' | ')} | |`;
const table = [header, `|${'---|'.repeat(browsers.length + 2)}`, ...rows].join('\n');
console.log(table);
if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, `### Browser baseline\n\n${table}\n`);
if (failed) {
  console.error('\nA required feature is not supported at the browser floor.');
  process.exit(1);
}

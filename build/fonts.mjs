/* Subsets Inter variable (inter-ui, OFL) into src/fonts/inter-latin.woff2 and inter-latin-ext.woff2.
   Dev-only: run `npm run build:fonts` after changing the ranges or features. The output is committed,
   so `npm run build` never needs subset-font. Ranges match the unicode-range lines in src/css/fonts.css. */
import { readFile, writeFile, copyFile, mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const subsetFont = require('subset-font');

// Kept: the default text shaping features plus the ones base.css and components ask for
// (cv11 single-storey a, ss03 round quotes, tnum tabular numbers, case for capitals).
const FEATURES = ['kern', 'liga', 'calt', 'ccmp', 'locl', 'mark', 'mkmk', 'rvrn', 'case', 'tnum', 'cv11', 'ss03'];
// The weight axis stays variable (100 to 900). Optical size is pinned to the text size to save space.
const AXES = { opsz: 14 };

export const SUBSETS = {
  latin: 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, '
    + 'U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  'latin-ext': 'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, '
    + 'U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
};

// "U+0100-02BA, U+2113" -> every code point in those ranges as one string.
const textFor = (ranges) => ranges.split(',').map((r) => r.trim().slice(2).split('-').map((h) => parseInt(h, 16)))
  .map(([a, b = a]) => Array.from({ length: b - a + 1 }, (_, i) => String.fromCodePoint(a + i)).join('')).join('');

const source = await readFile(require.resolve('inter-ui/variable/InterVariable.woff2'));
await mkdir('src/fonts', { recursive: true });
for (const [name, ranges] of Object.entries(SUBSETS)) {
  const out = await subsetFont(source, textFor(ranges), { targetFormat: 'woff2', keepFeatures: FEATURES, variationAxes: AXES });
  await writeFile(`src/fonts/inter-${name}.woff2`, out);
  console.log(`src/fonts/inter-${name}.woff2 ${(out.length / 1024).toFixed(1)} KB`);
}
await copyFile(require.resolve('inter-ui/LICENSE.txt'), 'src/fonts/OFL.txt');

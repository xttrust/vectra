/* Builds dist/ from src/ with Lightning CSS (bundled + minified CSS) and esbuild (JS as IIFE + ESM).
   CSS outputs: vectra.css (core + all directions), vectra.core.css, directions/<name>.css. */
import { mkdir, readdir, writeFile } from 'node:fs/promises';
import { bundle } from 'lightningcss';
import { build } from 'esbuild';
import { lightningTargets, esbuildTargets } from './browsers.mjs';

const directions = (await readdir('src/css/directions')).filter((f) => f.endsWith('.css')).map((f) => f.slice(0, -4));
const entries = [
  ['src/css/vectra.css', 'dist/vectra'],
  ['src/css/vectra.core.css', 'dist/vectra.core'],
  ...directions.map((d) => [`src/css/directions/${d}.css`, `dist/directions/${d}`]),
];

await mkdir('dist/directions', { recursive: true });
for (const [filename, out] of entries) {
  for (const minify of [false, true]) {
    const { code } = bundle({ filename, minify, targets: lightningTargets });
    await writeFile(`${out}${minify ? '.min' : ''}.css`, code);
  }
}
console.log(`built ${entries.length} CSS entries (plain + minified)`);

const shared = { entryPoints: ['src/js/index.js'], bundle: true, target: esbuildTargets, legalComments: 'none' };
await build({ ...shared, format: 'iife', globalName: 'Vectra', minify: true, outfile: 'dist/vectra.js' });
await build({ ...shared, format: 'esm', minify: false, outfile: 'dist/vectra.esm.js' });
console.log('built dist/vectra.js, dist/vectra.esm.js');

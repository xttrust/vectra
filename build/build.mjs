/* Builds dist/ from src/ with Lightning CSS (bundled + minified CSS) and esbuild (JS as IIFE + ESM).
   CSS outputs: vectra.css (everything), vectra.core.css, vectra.components.css, vectra.sections.css,
   directions/<name>.css, components/<name>.css and sections/<name>.css. */
import { mkdir, readdir, writeFile } from 'node:fs/promises';
import { bundle } from 'lightningcss';
import { build } from 'esbuild';
import { lightningTargets, esbuildTargets } from './browsers.mjs';

const names = async (dir) => (await readdir(dir)).filter((f) => f.endsWith('.css')).map((f) => f.slice(0, -4)).sort();
const entries = [
  ['src/css/vectra.css', 'dist/vectra'],
  ['src/css/vectra.core.css', 'dist/vectra.core'],
  ['src/css/vectra.components.css', 'dist/vectra.components'],
  ['src/css/vectra.sections.css', 'dist/vectra.sections'],
  ...(await names('src/css/directions')).map((d) => [`src/css/directions/${d}.css`, `dist/directions/${d}`]),
  ...(await names('src/css/components')).map((c) => [`src/css/components/${c}.css`, `dist/components/${c}`]),
  ...(await names('src/css/sections')).map((s) => [`src/css/sections/${s}.css`, `dist/sections/${s}`]),
];

await mkdir('dist/directions', { recursive: true });
await mkdir('dist/components', { recursive: true });
await mkdir('dist/sections', { recursive: true });
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

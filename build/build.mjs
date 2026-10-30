/* Builds dist/ from src/: bundled + minified CSS (Lightning CSS) and JS as IIFE + ESM (esbuild). */
import { mkdir, writeFile } from 'node:fs/promises';
import { bundle } from 'lightningcss';
import { build } from 'esbuild';
import { lightningTargets, esbuildTargets } from './browsers.mjs';

await mkdir('dist', { recursive: true });

for (const minify of [false, true]) {
  const { code } = bundle({ filename: 'src/css/vectra.css', minify, targets: lightningTargets });
  const file = minify ? 'dist/vectra.min.css' : 'dist/vectra.css';
  await writeFile(file, code);
  console.log(`built ${file}`);
}

const shared = { entryPoints: ['src/js/index.js'], bundle: true, target: esbuildTargets, legalComments: 'none' };
await build({ ...shared, format: 'iife', globalName: 'Vectra', minify: true, outfile: 'dist/vectra.js' });
await build({ ...shared, format: 'esm', minify: false, outfile: 'dist/vectra.esm.js' });
console.log('built dist/vectra.js, dist/vectra.esm.js');

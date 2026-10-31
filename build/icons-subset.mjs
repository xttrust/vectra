#!/usr/bin/env node
/* vectra-icons: writes a sprite with only the icons some HTML files use.
   Finds <use href="....svg#name"> (also xlink:href) and data-icon="name" in every file given.
     npx vectra-icons index.html "pages/*.html" --out public/icons.svg */
import { readFile, writeFile, glob } from 'node:fs/promises';
import { parseArgs } from 'node:util';
import { buildSprite, readIconMap } from './icons-lib.mjs';

const USAGE = `Usage: vectra-icons <file or glob>... [--out icons.subset.svg]

Writes a sprite with only the Vectra icons those HTML files reference, through
<use href="sprite.svg#name"> or data-icon="name".`;

const fail = (message) => {
  console.error(`vectra-icons: ${message}`);
  process.exit(1);
};

let args;
try {
  args = parseArgs({
    allowPositionals: true,
    options: { out: { type: 'string', short: 'o', default: 'icons.subset.svg' }, help: { type: 'boolean', short: 'h' } },
  });
} catch (error) {
  fail(`${error.message}\n\n${USAGE}`);
}
if (args.values.help) {
  console.log(USAGE);
  process.exit(0);
}
if (!args.positionals.length) fail(`no input files.\n\n${USAGE}`);

const files = new Set();
for (const pattern of args.positionals) {
  if (/[*?[{]/.test(pattern)) for await (const file of glob(pattern)) files.add(file);
  else files.add(pattern);
}
if (!files.size) fail(`no files match ${args.positionals.join(' ')}`);

// name -> first file that uses it, so an unknown name can be reported with where it came from.
const used = new Map();
const PATTERNS = [/<use\b[^>]*?\s(?:xlink:)?href\s*=\s*["'][^"'#]*\.svg(?:\?[^"'#]*)?#([\w-]+)["']/g, /\sdata-icon\s*=\s*["']([\w-]+)["']/g];
for (const file of [...files].sort()) {
  let html;
  try { html = await readFile(file, 'utf8'); } catch { fail(`cannot read ${file}`); }
  for (const pattern of PATTERNS) {
    for (const [, name] of html.matchAll(pattern)) if (!used.has(name)) used.set(name, file);
  }
}

const known = await readIconMap();
const unknown = [...used].filter(([name]) => !(name in known));
if (unknown.length) {
  fail(`unknown icon${unknown.length > 1 ? 's' : ''}:\n${unknown.map(([name, file]) => `  ${name} (in ${file})`).join('\n')}\n`
    + 'See dist/icons/icons.json or examples/icons/ for the names in the set.');
}

const names = [...used.keys()].sort();
const sprite = await buildSprite(names);
await writeFile(args.values.out, sprite);
console.log(`vectra-icons: wrote ${args.values.out} with ${names.length} icon${names.length === 1 ? '' : 's'} `
  + `from ${files.size} file${files.size === 1 ? '' : 's'} (${(Buffer.byteLength(sprite) / 1024).toFixed(1)} KB)`);

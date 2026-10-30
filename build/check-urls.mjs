/* Vectra loads nothing from the network: fails if v2 sources or builds reference an external URL.
   v1 pages at the repo root still use CDNs and are excluded until they are ported (milestone M7). */
import { readdir, readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';

const ROOTS = ['src', 'dist', 'v2'];
const EXTENSIONS = new Set(['.css', '.js', '.mjs', '.html', '.svg']);
// SVG/XML namespace identifiers are not fetched.
const ALLOWED = [/^https?:\/\/www\.w3\.org\//];
const URL_PATTERN = /https?:\/\/[^\s"'()<>%]+/g;

async function* walk(dir) {
  let entries;
  try { entries = await readdir(dir, { withFileTypes: true }); } catch { return; }
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else if (EXTENSIONS.has(extname(entry.name))) yield path;
  }
}

const hits = [];
for (const root of ROOTS) {
  for await (const file of walk(root)) {
    const text = decodeURIComponent((await readFile(file, 'utf8')).replace(/%(?![0-9A-Fa-f]{2})/g, '%25'));
    for (const url of text.match(URL_PATTERN) ?? []) {
      if (!ALLOWED.some((re) => re.test(url))) hits.push(`${file}: ${url}`);
    }
  }
}

if (hits.length) {
  console.error(`External URLs found:\n${hits.join('\n')}`);
  process.exit(1);
}
console.log(`No external URLs in ${ROOTS.join(', ')}.`);

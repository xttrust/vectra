/* Builds the icon set from src/icons/svg/ (part of npm run build):
     dist/icons/sprite.svg   one <symbol id="<name>"> per icon
     dist/icons/icons.json   manifest of names and Lucide sources
     dist/icons/svg/         the individual SVGs
   It also refreshes the copy the icons gallery loads (examples/icons/sprite.svg) and the gallery's grid.
   With --sync (npm run build:icons) it first copies the icons listed in src/icons/icons.json from
   lucide-static (dev dependency) into src/icons/svg/, normalised. */
import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { ROOT, SVG_DIR, buildSprite, normalise, readIconMap } from './icons-lib.mjs';

const map = await readIconMap();
const names = Object.keys(map).sort();

if (process.argv.includes('--sync')) {
  const require = createRequire(import.meta.url);
  await mkdir(SVG_DIR, { recursive: true });
  for (const [name, lucide] of Object.entries(map)) {
    const source = await readFile(require.resolve(`lucide-static/icons/${lucide}.svg`), 'utf8');
    await writeFile(`${SVG_DIR}/${name}.svg`, normalise(source));
  }
  for (const file of await readdir(SVG_DIR)) {
    if (!(file.slice(0, -4) in map)) await rm(`${SVG_DIR}/${file}`);
  }
  console.log(`synced ${names.length} icons from lucide-static into src/icons/svg/`);
}

const missing = names.filter((name) => !existsSync(`${SVG_DIR}/${name}.svg`));
if (missing.length) {
  console.error(`No SVG in src/icons/svg/ for: ${missing.join(', ')}. Run npm run build:icons.`);
  process.exit(1);
}

const sprite = await buildSprite(names);
const { version } = JSON.parse(await readFile(`${ROOT}package.json`, 'utf8'));
const lucide = JSON.parse(await readFile(`${ROOT}package-lock.json`, 'utf8')).packages['node_modules/lucide-static']?.version;
const manifest = {
  version,
  source: `lucide-static@${lucide}`,
  license: 'ISC',
  count: names.length,
  icons: names.map((name) => ({ name, lucide: map[name] })),
};

await mkdir(`${ROOT}dist/icons`, { recursive: true });
await writeFile(`${ROOT}dist/icons/sprite.svg`, sprite);
await writeFile(`${ROOT}dist/icons/icons.json`, `${JSON.stringify(manifest, null, 2)}\n`);
await rm(`${ROOT}dist/icons/svg`, { recursive: true, force: true });
await cp(SVG_DIR, `${ROOT}dist/icons/svg`, { recursive: true });

// The gallery: same sprite next to the page, and one grid cell per icon between the markers.
await writeFile(`${ROOT}examples/icons/sprite.svg`, sprite);
const page = `${ROOT}examples/icons/index.html`;
const use = (name, cls) => `<svg class="${cls}" aria-hidden="true"><use href="sprite.svg#${name}"/></svg>`;
const cells = names.map((name) => `        <li>${use(name, 'v-icon')}${use(name, 'v-icon ex-icon-lg')}<code>${name}</code></li>`);
const MARKERS = /<!-- icons:start -->[\s\S]*?<!-- icons:end -->/;
const html = await readFile(page, 'utf8');
if (!MARKERS.test(html)) throw new Error(`${page} has lost its <!-- icons:start --> and <!-- icons:end --> markers`);
await writeFile(page, html.replace(MARKERS, `<!-- icons:start -->\n${cells.join('\n')}\n        <!-- icons:end -->`));

console.log(`built dist/icons: ${names.length} icons, sprite ${(Buffer.byteLength(sprite) / 1024).toFixed(1)} KB`);

/* Shared by build/icons.mjs and the vectra-icons subset tool: reads the icon set and writes sprites. */
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

export const ROOT = fileURLToPath(new URL('..', import.meta.url));
export const SVG_DIR = `${ROOT}src/icons/svg`;

// Vectra name -> Lucide source name, in name order.
export const readIconMap = async () => JSON.parse(await readFile(`${ROOT}src/icons/icons.json`, 'utf8')).icons;

// The inner markup of one normalised SVG in src/icons/svg/ (everything inside the root <svg>).
export const readIconBody = async (name) => {
  const svg = await readFile(`${SVG_DIR}/${name}.svg`, 'utf8');
  return svg.slice(svg.indexOf('>') + 1, svg.lastIndexOf('</svg>')).trim();
};

// Lucide's own SVG -> Vectra's normalised standalone file: 24 viewBox, currentColor stroke, no size or class.
export const normalise = (source) => {
  const body = source.replace(/<!--[\s\S]*?-->/g, '').replace(/^[\s\S]*?<svg\b[^>]*>/, '').replace(/<\/svg>\s*$/, '')
    .replace(/\s+class="[^"]*"/g, '').replace(/\s*\n\s*/g, '').replace(/\s+\/>/g, '/>').trim();
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
    + `stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>\n`;
};

// One <symbol> per icon. Symbols carry geometry only, so .v-icon (base.css) sets fill, stroke and width.
export const buildSprite = async (names) => {
  const symbols = await Promise.all(names.map(async (name) => `<symbol id="${name}" viewBox="0 0 24 24">${await readIconBody(name)}</symbol>`));
  return '<svg xmlns="http://www.w3.org/2000/svg"><!-- Vectra icons, from Lucide (ISC). See LICENSE. -->'
    + `${symbols.join('')}</svg>\n`;
};

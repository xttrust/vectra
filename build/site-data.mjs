/* Docs site data: loads site/data/components/*.json and checks it against the schema, the catalogue,
   the built CSS and the JS sources. Used by build/site.mjs (npm run site, npm run site:check) and,
   later, by the AI manifest (M8b). Plain Node, no dependencies. */
import { readdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const DATA = 'site/data/components';
const readJSON = async (file) => JSON.parse(await readFile(file, 'utf8'));

/** Every component entry, sorted by group order then name. */
export async function loadComponents() {
  const files = (await readdir(DATA)).filter((f) => f.endsWith('.json')).sort();
  const list = [];
  for (const file of files) {
    let data;
    try { data = await readJSON(join(DATA, file)); } catch (e) { throw new Error(`${DATA}/${file}: ${e.message}`, { cause: e }); }
    list.push({ ...data, file });
  }
  const schema = await readJSON('site/data/component.schema.json');
  const groups = schema.properties.group.enum;
  return list.sort((a, b) => groups.indexOf(a.group) - groups.indexOf(b.group) || a.name.localeCompare(b.name));
}

export const GROUPS = async () => (await readJSON('site/data/component.schema.json')).properties.group.enum;

// A small JSON Schema subset: type, required, properties, additionalProperties, enum, pattern, items, minItems.
export function checkSchema(value, schema, path, errors) {
  if (schema.enum && !schema.enum.includes(value)) errors.push(`${path}: "${value}" is not one of ${schema.enum.join(', ')}`);
  const type = schema.type ?? (schema.enum ? null : undefined);
  const actual = Array.isArray(value) ? 'array' : Number.isInteger(value) ? 'integer' : typeof value;
  if (type && type !== actual && !(type === 'number' && actual === 'integer')) {
    errors.push(`${path}: expected ${type}, got ${actual}`);
    return;
  }
  if (type === 'string' && schema.pattern && !new RegExp(schema.pattern).test(value)) errors.push(`${path}: "${value}" does not match ${schema.pattern}`);
  if (type === 'array') {
    if (schema.minItems && value.length < schema.minItems) errors.push(`${path}: needs at least ${schema.minItems} item(s)`);
    value.forEach((item, i) => checkSchema(item, schema.items ?? {}, `${path}[${i}]`, errors));
  }
  if (type === 'object') {
    for (const key of schema.required ?? []) if (!(key in value)) errors.push(`${path}: missing "${key}"`);
    for (const [key, v] of Object.entries(value)) {
      if (schema.properties?.[key]) checkSchema(v, schema.properties[key], `${path}.${key}`, errors);
      else if (schema.additionalProperties === false) errors.push(`${path}: unknown field "${key}"`);
    }
  }
}

/** Rows of CATALOGUE.md section 2: { name, tier, status, group }. The name is the text before any bracket. */
export async function catalogueRows() {
  const text = await readFile('CATALOGUE.md', 'utf8');
  const section = text.slice(text.indexOf('## 2. Components'), text.indexOf('## 3.'));
  const rows = [];
  let group = '';
  for (const line of section.split('\n')) {
    const heading = line.match(/^### (.+)/);
    if (heading) group = heading[1].trim();
    const cells = line.split('|').slice(1, -1).map((c) => c.trim());
    if (cells.length < 3 || cells[0] === 'Component' || /^-+$/.test(cells[0])) continue;
    rows.push({ name: cells[0].replace(/\s*\(.*$/, '').replace(/`/g, '').trim(), tier: cells[1], status: cells[2], group });
  }
  return rows;
}

/** Every v- class that has a selector in the built CSS. */
export async function builtClasses() {
  const css = await readFile('dist/vectra.css', 'utf8');
  return new Set([...css.matchAll(/\.(v-[a-z0-9-]+)/g)].map((m) => m[1]));
}

/** Every data-v-* hook the JS reads: register('name'), literal data-v-name, and dataset.vName. */
export async function jsHooks() {
  const hooks = new Set();
  const walk = async (dir) => {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) await walk(path);
      else if (entry.name.endsWith('.js')) {
        const src = await readFile(path, 'utf8');
        for (const m of src.matchAll(/register\w*\('([a-z0-9-]+)'/g)) hooks.add(`data-v-${m[1]}`);
        for (const m of src.matchAll(/data-v-[a-z0-9-]+/g)) hooks.add(m[0]);
        for (const m of src.matchAll(/dataset\.v([A-Z]\w*)/g)) hooks.add(`data-v-${m[1].replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`).slice(1)}`);
      }
    }
  };
  await walk('src/js');
  return hooks;
}

const classesIn = (html) => [...html.matchAll(/class="([^"]*)"/g)].flatMap((m) => m[1].split(/\s+/)).filter((c) => c.startsWith('v-'));
const hooksIn = (html) => [...html.matchAll(/\s(data-v-[a-z0-9-]+)/g)].map((m) => m[1]);
const iconsIn = (html) => [...html.matchAll(/sprite\.svg#([a-z0-9-]+)/g)].map((m) => m[1]);
const EM_DASH = '\u2014';

/** Returns a list of problems; empty means the data is good. */
export async function validate(components) {
  const errors = [];
  const schema = await readJSON('site/data/component.schema.json');
  const css = await readFile('dist/vectra.css', 'utf8');
  const classes = await builtClasses();
  const hooks = await jsHooks();
  const icons = new Set((await readJSON('dist/icons/icons.json')).icons.map((i) => i.name));
  const rows = await catalogueRows();
  const rowNames = new Set(rows.map((r) => r.name));
  const slugs = new Set();
  const covered = new Set();

  for (const c of components) {
    const where = `${DATA}/${c.file}`;
    const { file, ...data } = c;
    checkSchema(data, schema, where, errors);
    if (`${c.slug}.json` !== file) errors.push(`${where}: slug "${c.slug}" does not match the file name`);
    if (slugs.has(c.slug)) errors.push(`${where}: duplicate slug "${c.slug}"`);
    slugs.add(c.slug);
    if (JSON.stringify(data).includes(EM_DASH)) errors.push(`${where}: contains an em dash`);
    for (const name of c.catalogue ?? []) {
      if (!rowNames.has(name)) errors.push(`${where}: catalogue row "${name}" is not in CATALOGUE.md section 2`);
      covered.add(name);
    }
    for (const f of c.css ?? []) if (!existsSync(`src/css/components/${f}`)) errors.push(`${where}: src/css/components/${f} does not exist`);
    for (const f of c.js ?? []) if (!existsSync(`src/js/${f}`)) errors.push(`${where}: src/js/${f} does not exist`);
    for (const k of c.classes ?? []) if (!classes.has(k.name)) errors.push(`${where}: class .${k.name} is not in dist/vectra.css`);
    for (const h of c.hooks ?? []) if (!hooks.has(h.name)) errors.push(`${where}: hook ${h.name} is not read anywhere in src/js`);
    for (const t of c.tokens ?? []) if (!css.includes(t)) errors.push(`${where}: token ${t} does not appear in dist/vectra.css`);
    (c.examples ?? []).forEach((ex, i) => {
      const at = `${where} example ${i + 1} (${ex.title})`;
      for (const k of classesIn(ex.html)) if (!classes.has(k)) errors.push(`${at}: class .${k} is not in dist/vectra.css`);
      for (const h of hooksIn(ex.html)) if (!hooks.has(h)) errors.push(`${at}: hook ${h} is not read anywhere in src/js`);
      for (const n of iconsIn(ex.html)) if (!icons.has(n)) errors.push(`${at}: icon "${n}" is not in dist/icons/icons.json`);
      if (/\bdata-contrast\b|class="[^"]*\bex-/.test(ex.html)) errors.push(`${at}: gallery-only markup (data-contrast or ex-*) left in`);
      if (/href="#i-/.test(ex.html)) errors.push(`${at}: uses a gallery sprite id (#i-...); use /icons/sprite.svg#name`);
      const ids = [...ex.html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
      const dupes = ids.filter((id, n) => ids.indexOf(id) !== n);
      if (dupes.length) errors.push(`${at}: duplicate id(s) ${[...new Set(dupes)].join(', ')}`);
    });
  }
  for (const c of components) {
    for (const r of c.related ?? []) if (!slugs.has(r)) errors.push(`${DATA}/${c.file}: related "${r}" has no entry`);
  }
  for (const row of rows) {
    if (row.tier === 'P0' && row.status === 'done' && !covered.has(row.name)) {
      errors.push(`CATALOGUE.md: P0 component "${row.name}" (${row.group}) is marked done but no entry lists it in "catalogue"`);
    }
  }
  return errors;
}

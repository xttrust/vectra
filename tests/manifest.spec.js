/* The M8b gate: an assistant can write valid Vectra markup from the AI manifest alone.
   (a) dist/ai/vectra.manifest.json matches its schema; (b) every component's canonical example, taken from
   the manifest and nothing else, renders in a blank page that loads only dist/vectra.css and dist/vectra.js:
   its classes exist in the CSS and the manifest, its hooks are registered, axe passes and it is visible;
   (c) llms-full.txt covers every component and every rule; (d) the committed skill and AGENTS.md are up to date. */
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
import { WCAG_TAGS, describeViolations } from './helpers.js';
import { outputs, validateManifest } from '../build/manifest.mjs';
import { builtClasses, jsHooks } from '../build/site-data.mjs';

const manifest = JSON.parse(readFileSync('dist/ai/vectra.manifest.json', 'utf8'));
const llmsFull = readFileSync('dist/ai/llms-full.txt', 'utf8');

const classesIn = (html) => [...html.matchAll(/class="([^"]*)"/g)].flatMap((m) => m[1].split(/\s+/)).filter((c) => c.startsWith('v-'));
const hooksIn = (html) => [...html.matchAll(/\s(data-v-[a-z0-9-]+)/g)].map((m) => m[1]);
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

// Every class the manifest declares: component classes, layout primitives and utilities.
const declared = new Set([
  ...manifest.components.flatMap((c) => c.classes.map((k) => k.name)),
  ...manifest.layout.map((k) => k.name),
  ...manifest.utilities.flatMap((g) => g.classes),
  ...manifest.sections.flatMap((g) => g.classes),
]);
const registered = new Set(manifest.hooks.map((h) => h.name));

const blankPage = (c) => `<!DOCTYPE html>
<html lang="en" data-direction="tech" data-theme="light">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(c.name)}: manifest example</title>
  <link rel="stylesheet" href="/dist/vectra.css">
  <script src="/dist/vectra.js" defer></script>
</head>
<body>
<main id="example">
<h1 class="v-sr-only">${esc(c.name)}</h1>
<h2 class="v-sr-only">Example</h2>
${c.example.html}
</main>
${c.example.js ? `<script type="module">\n${c.example.js}\n</script>` : ''}
</body>
</html>`;

test('manifest: matches its schema and documents every public export', async () => {
  const { manifest: fresh, dist } = await outputs();
  expect(await validateManifest(fresh, dist)).toEqual([]);
  expect(JSON.stringify(fresh, null, 2)).toBe(JSON.stringify(manifest, null, 2));
  expect(manifest.components.length).toBeGreaterThan(0);
});

test('manifest: every class and hook it declares exists in the build', async () => {
  const css = await builtClasses();
  const hooks = await jsHooks();
  expect([...declared].filter((k) => !css.has(k)), 'declared classes missing from dist/vectra.css').toEqual([]);
  expect([...registered].filter((h) => !hooks.has(h)), 'declared hooks not read in src/js').toEqual([]);
});

test('manifest: llms-full.txt covers every component, class, hook and rule', () => {
  expect(Buffer.byteLength(llmsFull)).toBeLessThan(200 * 1024);
  for (const c of manifest.components) {
    expect(llmsFull, c.slug).toContain(`${c.name} (${c.slug})`);
    for (const k of c.classes) expect(llmsFull, `${c.slug} .${k.name}`).toContain(`.${k.name}`);
    for (const h of c.hooks) expect(llmsFull, `${c.slug} ${h.name}`).toContain(h.name);
  }
  for (const r of manifest.rules) expect(llmsFull, r.id).toContain(r.rule);
  for (const file of ['dist/ai/llms-full.txt', 'ai/claude-skill/vectra/SKILL.md', 'ai/AGENTS.md']) {
    const mentioned = [...readFileSync(file, 'utf8').matchAll(/\.(v-[a-z0-9]+(?:-[a-z0-9]+)*)/g)].map((m) => m[1]);
    expect([...new Set(mentioned)].filter((k) => !declared.has(k)), `${file} mentions classes the manifest does not declare`).toEqual([]);
  }
  for (const a of manifest.api) expect(llmsFull, a.signature).toContain(a.signature);
});

test('manifest: the Claude Code skill and AGENTS.md are up to date (npm run ai:skill)', async () => {
  const { committed } = await outputs();
  for (const [path, text] of Object.entries(committed)) expect(readFileSync(path, 'utf8'), `${path} is stale: run npm run ai:skill`).toBe(text);
  const skill = committed['ai/claude-skill/vectra/SKILL.md'];
  expect(skill).toMatch(/^---\nname: vectra\ndescription: .+\n---\n/);
  for (const r of manifest.rules) expect(skill, r.id).toContain(r.rule);
});

test.describe('manifest: canonical examples render from the manifest alone', () => {
  for (const c of manifest.components) {
    test(`${c.slug}`, async ({ page }) => {
      const errors = [];
      page.on('pageerror', (e) => errors.push(e.message));
      await page.route('**/__manifest/**', (route) => route.fulfill({ contentType: 'text/html', body: blankPage(c) }));
      await page.route('**/icons/sprite.svg', (route) => route.fulfill({ path: 'dist/icons/sprite.svg', contentType: 'image/svg+xml' }));
      await page.goto(`/__manifest/${c.slug}.html`);
      await page.evaluate(() => document.fonts.ready);

      const css = await builtClasses();
      for (const k of classesIn(c.example.html)) {
        expect(css.has(k), `.${k} is not in dist/vectra.css`).toBe(true);
        expect(declared.has(k), `.${k} is not declared in the manifest`).toBe(true);
      }
      for (const h of hooksIn(c.example.html)) expect(registered.has(h), `${h} is not a hook in the manifest`).toBe(true);

      // Visible: at least one top-level element of the example has a box.
      const boxes = await page.locator('#example > :not(.v-sr-only)').evaluateAll((els) => els.map((el) => {
        const r = el.getBoundingClientRect();
        const s = getComputedStyle(el);
        return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none';
      }));
      expect(boxes.some(Boolean), 'nothing in the example is visible').toBe(true);

      const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
      expect(describeViolations(violations)).toEqual([]);
      expect(errors).toEqual([]);
    });
  }
});

import { test, expect } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { readFile, stat, writeFile } from 'node:fs/promises';
import { PAGES, open } from './helpers.js';
import { buildSprite } from '../build/icons-lib.mjs';

const target = PAGES.find((p) => p.name === 'icons');
const names = async () => Object.keys(JSON.parse(await readFile('src/icons/icons.json', 'utf8')).icons).sort();
const symbols = (sprite) => [...sprite.matchAll(/<symbol id="([\w-]+)"([^>]*)>([\s\S]*?)<\/symbol>/g)]
  .map(([, id, attrs, body]) => ({ id, attrs, body }));
// Runs the vectra-icons bin; returns { code, out } so failures can be asserted too.
const subset = (args) => {
  try {
    return { code: 0, out: execFileSync('node', ['build/icons-subset.mjs', ...args], { encoding: 'utf8', stdio: 'pipe' }) };
  } catch (error) {
    return { code: error.status, out: `${error.stdout}${error.stderr}` };
  }
};

test.describe('icon sprite', () => {
  test('the gallery sprite is current and holds every icon in icons.json', async () => {
    const sprite = await readFile('examples/icons/sprite.svg', 'utf8');
    const expected = await names();
    expect(sprite, 'examples/icons/sprite.svg is stale: run npm run build').toBe(await buildSprite(expected));
    expect(symbols(sprite).map((s) => s.id)).toEqual(expected);
    expect(expected.length).toBeGreaterThanOrEqual(140);
  });

  test('every symbol has a 24 viewBox and no hard-coded colour', async () => {
    for (const { id, attrs, body } of symbols(await readFile('examples/icons/sprite.svg', 'utf8'))) {
      expect(attrs, id).toContain('viewBox="0 0 24 24"');
      const paints = [...`${attrs}${body}`.matchAll(/\s(?:fill|stroke|color|style)="([^"]*)"/g)].map((m) => m[1]);
      expect(paints.filter((v) => v !== 'none' && v !== 'currentColor'), id).toEqual([]);
      expect(attrs, id).not.toMatch(/\s(?:width|height)=/);
      expect(body, id).not.toMatch(/\sclass=/);
    }
    // The standalone files in src/icons/svg/ follow the same rules, with the stroke set on the root.
    for (const name of await names()) {
      const root = (await readFile(`src/icons/svg/${name}.svg`, 'utf8')).match(/^<svg\b[^>]*>/)[0];
      expect(root, name).toContain('viewBox="0 0 24 24"');
      expect(root, name).toContain('stroke="currentColor"');
      expect(root, name).not.toMatch(/\s(?:width|height|class)=/);
    }
  });

  test('the subset tool keeps only the referenced icons', async () => {
    const testInfo = test.info();
    const out = testInfo.outputPath('subset.svg');
    const result = subset(['tests/fixtures/icons.html', '--out', out]);
    expect(result.code, result.out).toBe(0);
    expect(symbols(await readFile(out, 'utf8')).map((s) => s.id)).toEqual(['bell', 'close', 'search']);
  });

  test('the subset tool fails on an unknown icon name', async () => {
    const testInfo = test.info();
    const page = testInfo.outputPath('unknown.html');
    await writeFile(page, '<svg><use href="sprite.svg#search"/></svg><svg><use href="sprite.svg#not-an-icon"/></svg>');
    const result = subset([page, '--out', testInfo.outputPath('never.svg')]);
    expect(result.code).toBe(1);
    expect(result.out).toContain('not-an-icon');
    await expect(stat(testInfo.outputPath('never.svg'))).rejects.toThrow();
  });

  test('the icons gallery renders every icon at a non-zero size', async ({ page, browserName }) => {
    await open(page, target, { direction: 'tech', theme: 'light' });
    const expected = await names();
    const cells = page.locator('.ex-icons li');
    await expect(cells).toHaveCount(expected.length);
    // An external <use> that failed to load leaves an empty shadow tree: getBBox() is then 0 by 0 (a line such as minus is 0 high, so the sum is checked).
    const boxes = await page.locator('.ex-icons use').evaluateAll((uses) => uses.map((u) => {
      const box = u.getBBox();
      return { href: u.getAttribute('href'), width: box.width, height: box.height, shown: u.closest('svg').getBoundingClientRect().width };
    }));
    expect(boxes.length).toBe(expected.length * 2);
    // WebKit reports an empty 0 by 0 box for any shape with no area, so a straight line (minus) reads as
    // missing there although it renders; every other icon in the same sprite proves the sprite loaded.
    const lines = browserName === 'webkit' ? ['#minus'] : [];
    expect(boxes.filter((b) => !(b.width + b.height > 0 && b.shown > 0) && !lines.some((l) => b.href.endsWith(l)))).toEqual([]);
  });
});

test.describe('self-hosted Inter', () => {
  test('the latin subset is under its budget', async () => {
    const budget = JSON.parse(await readFile('build/budgets.json', 'utf8'))['dist/fonts/inter-latin.woff2'].raw;
    expect((await stat('src/fonts/inter-latin.woff2')).size).toBeLessThanOrEqual(budget);
  });

  test('a gallery page loads Inter from src/fonts', async ({ page }) => {
    const fonts = [];
    page.on('response', (r) => { if (r.url().endsWith('.woff2')) fonts.push([new URL(r.url()).pathname, r.status()]); });
    await open(page, PAGES.find((p) => p.name === 'components'), { direction: 'tech', theme: 'light' });
    expect(await page.evaluate(async () => { await document.fonts.ready; return document.fonts.check('16px "Inter Var"'); })).toBe(true);
    const loaded = await page.evaluate(() => [...document.fonts].filter((f) => f.family.replace(/"/g, '') === 'Inter Var' && f.status === 'loaded').length);
    expect(loaded).toBeGreaterThan(0);
    expect(fonts).toContainEqual(['/src/fonts/inter-latin.woff2', 200]);
  });
});

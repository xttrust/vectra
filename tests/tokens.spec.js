import { test, expect } from '@playwright/test';
import { DIRECTIONS, THEMES } from './helpers.js';

// Token-level contrast: resolves every token for each direction × theme × accent hue, stacks
// translucent surfaces the way components layer them, and checks WCAG ratios for each pairing.
// Engine-independent maths, so Chromium only. Gradient surfaces (feature, page field) are covered
// by the component tests in M3; translucent surfaces are composited over --v-bg.
test.skip(({ browserName }) => browserName !== 'chromium', 'Token maths runs in Chromium only');

const HUES = [null, ...Array.from({ length: 12 }, (_, i) => i * 30)];

test('token contrast: every direction, theme and accent hue', async ({ page }) => {
  await page.goto('/examples/tokens/');
  const result = await page.evaluate(({ directions, themes, hues }) => {
    const root = document.documentElement;
    const ctx = Object.assign(document.createElement('canvas'), { width: 1, height: 1 }).getContext('2d', { willReadFrequently: true });
    const rgba = (color) => {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = '#000';
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
      return [r, g, b, a / 255];
    };
    // The probe sits in a wrapper with a sentinel colour: a missing token, or one that is not a colour,
    // falls back to (or inherits) the sentinel instead of silently reading some other colour.
    const SENTINEL = 'rgb(1, 2, 3)';
    const wrap = document.body.appendChild(Object.assign(document.createElement('div'), { style: `color: ${SENTINEL}` }));
    const probe = wrap.appendChild(document.createElement('i'));
    const token = (name) => {
      probe.style.color = `var(--v-${name}, ${SENTINEL})`;
      const value = getComputedStyle(probe).color;
      if (value === SENTINEL) throw new Error(`--v-${name} is missing or not a colour`);
      return rgba(value);
    };
    const over = ([r, g, b, a], [br, bg, bb]) => [r * a + br * (1 - a), g * a + bg * (1 - a), b * a + bb * (1 - a)];
    const stack = (names) => names.reduce((base, n) => over(token(n), base), [255, 255, 255]);
    const lum = (rgb) => {
      const [r, g, b] = rgb.map((v) => { const c = v / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const ratio = (fg, bg) => { const [a, b] = [lum(fg), lum(bg)].sort((x, y) => y - x); return (a + 0.05) / (b + 0.05); };

    const SURFACES = {
      bg: ['bg'], 'bg-subtle': ['bg', 'bg-subtle'], surface: ['bg', 'surface'],
      'surface-2': ['bg', 'surface', 'surface-2'], card: ['bg', 'card-bg'],
    };
    const pairs = [];
    for (const [label, s] of Object.entries(SURFACES)) {
      for (const t of ['text', 'text-2', 'text-3', 'accent-text']) pairs.push([t, s, 4.5, `${t} on ${label}`]);
      pairs.push(['accent', s, 3, `accent (focus, indicators) vs ${label}`]);
    }
    for (const tone of ['success', 'warning', 'danger', 'info']) {
      pairs.push([tone, ['bg', 'surface'], 4.5, `${tone} on surface`]);
      pairs.push([tone, ['bg', 'card-bg'], 4.5, `${tone} on card`]);
      pairs.push([tone, ['bg', 'surface', `${tone}-soft`], 4.5, `${tone} on ${tone}-soft`]);
    }
    pairs.push(['accent-text', ['bg', 'surface', 'accent-soft'], 4.5, 'accent-text on accent-soft']);
    pairs.push(['on-accent', ['bg', 'accent'], 4.5, 'on-accent on accent']);
    pairs.push(['primary-fg', ['bg', 'primary-bg'], 4.5, 'primary-fg on primary-bg']);
    pairs.push(['primary-hover-fg', ['bg', 'primary-hover-bg'], 4.5, 'primary-hover-fg on primary-hover-bg']);
    pairs.push(['on-danger', ['bg', 'danger'], 4.5, 'on-danger on danger']);
    pairs.push(['text', ['bg', 'card-bg', 'input-bg'], 4.5, 'text in input']);
    pairs.push(['text-3', ['bg', 'card-bg', 'input-bg'], 4.5, 'placeholder in input']);
    pairs.push(['border-control', ['bg', 'card-bg'], 3, 'border-control vs card']);
    pairs.push(['border-control', ['bg', 'surface'], 3, 'border-control vs surface']);
    pairs.push(['border-control', ['bg', 'card-bg', 'input-bg'], 3, 'border-control vs input fill']);

    const failures = [];
    let checks = 0;
    let lowest = { value: Infinity };
    for (const d of directions) {
      for (const t of themes) {
        for (const h of hues) {
          root.dataset.direction = d;
          root.dataset.theme = t;
          if (h === null) root.style.removeProperty('--v-accent-h'); else root.style.setProperty('--v-accent-h', String(h));
          for (const [fg, bgStack, min, label] of pairs) {
            const bg = stack(bgStack);
            const value = ratio(over(token(fg), bg), bg);
            checks += 1;
            const where = `${d} · ${t} · hue ${h ?? 'default'} · ${label}`;
            if (value < lowest.value) lowest = { value, where };
            if (value < min) failures.push(`${where}: ${value.toFixed(2)} < ${min}`);
          }
        }
      }
    }
    return { failures, checks, lowest: `${lowest.value.toFixed(2)} (${lowest.where})` };
  }, { directions: DIRECTIONS, themes: THEMES, hues: HUES });

  test.info().annotations.push({ type: 'checks', description: `${result.checks} pairings, lowest ${result.lowest}` });
  console.log(`token contrast: ${result.checks} pairings checked, lowest ${result.lowest}`);
  expect(result.failures).toEqual([]);
});

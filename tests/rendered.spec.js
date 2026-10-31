import { test, expect } from '@playwright/test';
import { DIRECTIONS, THEMES, PAGES, open } from './helpers.js';

// Rendered contrast: for every [data-contrast] element, hide all text, screenshot the element, and
// compare its text colour with the lightest and darkest pixels where the text sits (the middle band).
// This covers what token maths cannot: gradients, glass blur, the page colour field, overlays.
// Chromium only; the default accent hue plus 150 (the brightest band) per direction and theme.
test.skip(({ browserName }) => browserName !== 'chromium', 'Rendered contrast runs in Chromium only');

const HUES = [null, 150];
const HIDE_TEXT = '*, *::before, *::after { color: transparent !important; -webkit-text-fill-color: transparent !important; text-shadow: none !important; }';

// Every gallery page marked rendered: true in helpers.js gets the check.
for (const target of PAGES.filter((p) => p.rendered)) {
  for (const direction of DIRECTIONS) {
    for (const theme of THEMES) {
      test(`rendered contrast: ${target.name} · ${direction} · ${theme}`, async ({ page }) => {
        test.setTimeout(180_000);
        await page.setViewportSize({ width: 1280, height: 900 });
        await open(page, target, { direction, theme });
        const items = page.locator('[data-contrast]');
        const count = await items.count();
        expect(count).toBeGreaterThan(20);
        const failures = [];

        for (const hue of HUES) {
          await page.evaluate((h) => {
            if (h === null) document.documentElement.style.removeProperty('--v-accent-h');
            else document.documentElement.style.setProperty('--v-accent-h', String(h));
          }, hue);

          const texts = await items.evaluateAll((els) => els.map((el) => {
            const cs = getComputedStyle(el);
            const size = parseFloat(cs.fontSize);
            const large = size >= 24 || (size >= 18.66 && Number(cs.fontWeight) >= 700);
            return { color: cs.color, large, label: `${el.tagName.toLowerCase()}.${[...el.classList].join('.')} "${el.textContent.trim().slice(0, 30)}"` };
          }));

          const style = await page.addStyleTag({ content: HIDE_TEXT });
          for (let i = 0; i < count; i += 1) {
            const png = (await items.nth(i).screenshot({ animations: 'disabled' })).toString('base64');
            const ratio = await page.evaluate(async ([data, color]) => {
              const img = await createImageBitmap(await (await fetch(`data:image/png;base64,${data}`)).blob());
              const canvas = new OffscreenCanvas(img.width, img.height);
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0);
              const lin = (v) => { const c = v / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
              const lum = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
              const x0 = Math.floor(img.width * 0.1); const x1 = Math.ceil(img.width * 0.9);
              const y0 = Math.floor(img.height * 0.25); const y1 = Math.ceil(img.height * 0.75);
              const px = ctx.getImageData(x0, y0, Math.max(1, x1 - x0), Math.max(1, y1 - y0)).data;
              let lo = 1; let hi = 0;
              for (let p = 0; p < px.length; p += 4) { const l = lum(px[p], px[p + 1], px[p + 2]); lo = Math.min(lo, l); hi = Math.max(hi, l); }
              const c = new OffscreenCanvas(1, 1).getContext('2d');
              c.fillStyle = color;
              c.fillRect(0, 0, 1, 1);
              const [r, g, b] = c.getImageData(0, 0, 1, 1).data;
              const f = lum(r, g, b);
              const pair = (a, z) => (Math.max(a, z) + 0.05) / (Math.min(a, z) + 0.05);
              return Math.min(pair(f, lo), pair(f, hi));
            }, [png, texts[i].color]);
            const min = texts[i].large ? 3 : 4.5;
            if (ratio < min) failures.push(`hue ${hue ?? 'default'} · ${texts[i].label}: ${ratio.toFixed(2)} < ${min}`);
          }
          await style.evaluate((el) => el.remove());
        }
        expect(failures).toEqual([]);
      });
    }
  }
}

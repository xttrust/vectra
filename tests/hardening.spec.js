import { test, expect } from '@playwright/test';
import { DIRECTIONS, PAGES, open } from './helpers.js';

// Hardening: the kit holds up for real people, not just the default setup. Right-to-left text, Windows
// high contrast (forced colours), 400% zoom reflow, user text spacing, keyboard focus, reduced motion and
// transparency, and pointer target size, over every gallery page (prototype and tokens are not galleries).
// Two combos (tech/dark, editorial/light) cover both themes and the most different type. Forced colours run
// all four directions (a direction's own state styling can undo a fix), Glass alone runs reduced transparency.
// Chromium-only checks say so; the rest also run in Firefox and WebKit (npm run test:browsers, nightly).
// Hidden (opacity 0) parts are not overflow: the CSS-only tooltip can still poke past the viewport edge when
// its trigger sits at the edge, which needs anchor positioning to fix (not done here).
const GALLERY = PAGES.filter((p) => !['prototype', 'tokens'].includes(p.name));
const COMBOS = [['tech', 'dark'], ['editorial', 'light']];
const byName = (name) => PAGES.find((p) => p.name === name);
const chromiumOnly = (why) => test.skip(({ browserName }) => browserName !== 'chromium', why);

// In-page helpers, injected once per page: a label for an element and the page-level overflow report.
const INJECT = () => {
  window.vLabel = (el) => {
    const id = el.id ? `#${el.id}` : '';
    const cls = [...el.classList].slice(0, 3).map((c) => `.${c}`).join('');
    const text = (el.getAttribute('aria-label') || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 24);
    return `${el.tagName.toLowerCase()}${id}${cls}${text ? ` "${text}"` : ''}`;
  };
  // Elements that stick out of the viewport sideways, unless an ancestor scrolls or clips them on purpose
  // (table wrappers, code blocks, tab rows). Only the outermost offender is reported.
  window.vOverflow = () => {
    const vw = document.documentElement.clientWidth;
    const handled = (el) => {
      for (let a = el.parentElement; a && a !== document.documentElement; a = a.parentElement) {
        if (getComputedStyle(a).overflowX !== 'visible') return true;
      }
      return false;
    };
    const hits = [];
    for (const el of document.body.querySelectorAll('*')) {
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) continue;
      if (r.right <= vw + 1 && r.left >= -1) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || Number(cs.opacity) === 0 || handled(el)) continue;
      if (hits.some((h) => h.contains(el))) continue;
      hits.push(el);
    }
    return {
      extra: document.documentElement.scrollWidth - vw,
      offenders: hits.slice(0, 8).map((el) => `${window.vLabel(el)} [${Math.round(el.getBoundingClientRect().left)}..${Math.round(el.getBoundingClientRect().right)}]`),
    };
  };
};

async function setup(page, target, opts) {
  await open(page, target, opts);
  await page.evaluate(INJECT);
}

const rtl = (page) => page.evaluate(() => { document.documentElement.dir = 'rtl'; });

// 1. Right to left ---------------------------------------------------------------------------------------
test.describe('RTL', () => {
  for (const target of GALLERY) {
    for (const [width, [direction, theme]] of [[390, COMBOS[0]], [1440, COMBOS[1]]]) {
      test(`rtl: no sideways overflow · ${target.name} · ${width}`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await setup(page, target, { direction, theme });
        await rtl(page);
        expect(await page.evaluate(() => window.vOverflow())).toEqual({ extra: 0, offenders: [] });
      });
    }
  }

  // Directional parts mirror: an element's distance from its container's start edge is the same in both
  // directions (measured from the left in LTR, from the right in RTL).
  const MIRROR = [
    ['navigation', '.v-breadcrumb ol'],
    ['navigation', '.v-pagination'],
    ['navigation', '.v-steps'],
    ['navigation', '.v-accordion'],
    ['navigation', '.v-sidenav'],
    ['navigation', '.v-tablist'],
    ['forms', '.v-input-group'],
    ['elements', '.v-input-group'],
    ['elements', '.v-list'],
    ['content', '.v-timeline'],
    ['content', '.v-table'],
    ['content', '.v-testimonial'],
    ['overlays', '.v-menu'],
    ['overlays', '.v-dialog-header'],
    ['components', '.v-alert'],
    ['components', '.v-card-header'],
    ['theming', '.v-toast'],
  ];
  // Containers inside a demo that sets its own dir="rtl" are skipped: they do not change with the page.
  const measure = (sel) => [...document.querySelectorAll(sel)].filter((c) => !c.closest('body [dir]')).map((c) => {
    const cr = c.getBoundingClientRect();
    return [...c.querySelectorAll('*')].map((el) => {
      const r = el.getBoundingClientRect();
      const visible = r.width > 1 && r.height > 1 && getComputedStyle(el).display !== 'inline';
      return visible ? { label: window.vLabel(el), start: r.left - cr.left, end: cr.right - r.right, w: r.width } : null;
    });
  });
  for (const [name, sel] of MIRROR) {
    test(`rtl: ${sel} mirrors · ${name}`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      await setup(page, byName(name), { direction: 'tech', theme: 'light' });
      // An explicit dir="ltr" first, so both measurements come from the same kind of style recalculation.
      await page.evaluate(() => { document.documentElement.dir = 'ltr'; });
      const ltr = await page.evaluate(measure, sel);
      await rtl(page);
      const rtlBoxes = await page.evaluate(measure, sel);
      expect(ltr.length, `${sel} on the page`).toBeGreaterThan(0);
      const bad = [];
      ltr.forEach((items, c) => items.forEach((a, i) => {
        const b = rtlBoxes[c][i];
        if (a && b && Math.abs(a.start - b.end) > 1.5) bad.push(`${a.label}: start ${a.start.toFixed(1)} vs ${b.end.toFixed(1)} (w ${a.w} vs ${b.w})`);
      }));
      expect(bad.slice(0, 8)).toEqual([]);
    });
  }

  // Drawn shapes (pseudo-elements and backgrounds) that point or sit at one side must change in RTL.
  const FLIPS = [
    ['navigation', '.v-breadcrumb li + li', '::before', 'rotate'],
    ['navigation', '.v-page-prev', '::before', 'rotate'],
    ['navigation', '.v-page-next', '::after', 'rotate'],
    ['navigation', '.v-collapsible > summary', '::before', 'rotate'],
    ['forms', '.v-select', '', 'backgroundPosition'],
    ['content', '.v-rating', '', 'backgroundImage'],
    ['content', '.v-table tbody tr:has(> .v-table-check input:checked) > :first-child', '', 'boxShadow'],
    ['elements', '.v-list-item[aria-current]', '', 'boxShadow'],
    ['overlays', '.v-drawer', '', '--v-drawer-dir'],
  ];
  for (const [name, sel, pseudo, prop] of FLIPS) {
    test(`rtl: ${sel}${pseudo} ${prop} flips · ${name}`, async ({ page }) => {
      await setup(page, byName(name), { direction: 'tech', theme: 'light' });
      const read = () => page.evaluate(([s, p, k]) => {
        const el = document.querySelector(s);
        if (!el) return null;
        const cs = getComputedStyle(el, p || null);
        return k.startsWith('--') ? cs.getPropertyValue(k) : cs[k];
      }, [sel, pseudo, prop]);
      const before = await read();
      expect(before, `${sel} exists`).not.toBeNull();
      await rtl(page);
      expect(await read()).not.toBe(before);
    });
  }

  test('rtl: the end drawer opens on the left, the start drawer on the right · overlays', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await setup(page, byName('overlays'), { direction: 'tech', theme: 'light' });
    await rtl(page);
    for (const [id, side] of [['drw-end', 'left'], ['drw-start', 'right']]) {
      await page.evaluate((i) => document.getElementById(i).showModal(), id);
      const box = await page.locator(`#${id}`).boundingBox();
      if (side === 'left') expect(box.x, id).toBeLessThanOrEqual(1);
      else expect(box.x + box.width, id).toBeGreaterThanOrEqual(1279);
      await page.evaluate((i) => document.getElementById(i).close(), id);
    }
  });

  test('rtl: toasts sit in the bottom start-side corner (left) · theming', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await setup(page, byName('theming'), { direction: 'tech', theme: 'light' });
    await rtl(page);
    await page.click('#toast-info');
    const box = await page.locator('.v-toast-region').boundingBox();
    expect(box.x).toBeLessThan(640 - box.width / 2);
  });

  test('rtl: progress fills from the right · components', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'pixel sampling of the progress fill runs in Chromium');
    await setup(page, byName('components'), { direction: 'tech', theme: 'light' });
    await rtl(page);
    const bar = page.locator('.v-progress[value]').first();
    await bar.scrollIntoViewIfNeeded();
    const { value, max } = await bar.evaluate((el) => ({ value: el.value, max: el.max }));
    const shot = (await bar.screenshot()).toString('base64');
    const [rightLum, leftLum, trackLum] = await page.evaluate(async ([data, fraction]) => {
      const img = await createImageBitmap(await (await fetch(`data:image/png;base64,${data}`)).blob());
      const ctx = new OffscreenCanvas(img.width, img.height).getContext('2d');
      ctx.drawImage(img, 0, 0);
      const at = (x) => { const [r, g, b] = ctx.getImageData(Math.round(x), Math.floor(img.height / 2), 1, 1).data; return r + g + b; };
      return [at(img.width * 0.97 - 2), at(img.width * (1 - fraction) * 0.5), at(img.width * 0.03 + 2)];
    }, [shot, value / max]);
    // The right end is filled (differs from the empty left end), the left end matches the track.
    expect(rightLum).not.toBe(trackLum);
    expect(leftLum).toBe(trackLum);
  });
});

// 2. Forced colours ----------------------------------------------------------------------------------------
// Chromium emulates forced-colors; Firefox and WebKit do not. Colours are forced to system colours, so a
// control drawn only with background colour or box-shadow disappears; selected states drawn that way vanish.
const CONTROLS = [
  'a[href]', 'button', 'a.v-btn', 'input:not([type="hidden"])', 'select', 'textarea', 'summary', '[role="tab"]',
  '[role^="menuitem"]', '.v-badge', '.v-tag', '.v-progress', '.v-meter', '.v-page', '.v-segmented span', '.v-swatch',
  '.v-rating', '.v-status',
].join(', ');

// Lowest and highest luminance inside each rect of a full-page screenshot (rects in page coordinates).
async function lumRange(page, rects) {
  const png = (await page.screenshot({ fullPage: true, animations: 'disabled' })).toString('base64');
  return page.evaluate(async ([data, boxes]) => {
    const img = await createImageBitmap(await (await fetch(`data:image/png;base64,${data}`)).blob());
    const ctx = new OffscreenCanvas(img.width, img.height).getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0);
    const lin = (v) => { const c = v / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
    return boxes.map(({ x, y, w, h }) => {
      const px = ctx.getImageData(Math.max(0, Math.floor(x)), Math.max(0, Math.floor(y)), Math.max(1, Math.ceil(w)), Math.max(1, Math.ceil(h))).data;
      let lo = 1; let hi = 0;
      for (let p = 0; p < px.length; p += 4) {
        const l = 0.2126 * lin(px[p]) + 0.7152 * lin(px[p + 1]) + 0.0722 * lin(px[p + 2]);
        lo = Math.min(lo, l); hi = Math.max(hi, l);
      }
      return (hi + 0.05) / (lo + 0.05);
    });
  }, [png, rects]);
}

test.describe('forced colours', () => {
  chromiumOnly('forced-colors emulation is Chromium only');

  for (const [target, direction] of GALLERY.flatMap((t) => DIRECTIONS.map((d) => [t, d]))) {
    test(`forced colours: every control keeps a visible edge or text · ${target.name} · ${direction}`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.emulateMedia({ forcedColors: 'active' });
      await setup(page, target, { direction, theme: 'light' });
      const items = await page.evaluate((sel) => [...document.querySelectorAll(sel)].flatMap((el) => {
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        if (r.width < 4 || r.height < 4 || cs.visibility === 'hidden' || Number(cs.opacity) === 0) return [];
        // Inactive controls are exempt (WCAG 1.4.11), and so is anything scrolled out of its own scroller.
        if (el.closest('[hidden], .v-sr-only, [aria-hidden="true"]') || el.matches(':disabled, [aria-disabled="true"]')) return [];
        for (let a = el.parentElement; a; a = a.parentElement) {
          if (getComputedStyle(a).overflowX === 'visible') continue;
          const b = a.getBoundingClientRect();
          if (r.right <= b.left || r.left >= b.right) return [];
        }
        return [{ label: window.vLabel(el), x: r.left + scrollX - 1, y: r.top + scrollY - 1, w: r.width + 2, h: r.height + 2 }];
      }), CONTROLS);
      expect(items.length).toBeGreaterThan(0);
      const ratios = await lumRange(page, items);
      const bad = items.flatMap((it, i) => (ratios[i] < 3 ? [`${it.label}: ${ratios[i].toFixed(2)}`] : []));
      expect(bad.slice(0, 12)).toEqual([]);
    });
  }

  // Selected or current items must differ from their siblings in something forced colours keep:
  // text or background colour, border, outline, underline or drawn marks (pseudo-element content).
  const STATES = [
    ['navigation', '.v-tablist:not(.v-tabs-pill *) [role="tab"][aria-selected="true"]', '.v-tablist:not(.v-tabs-pill *) [role="tab"][aria-selected="false"]'],
    ['navigation', '.v-tabs-pill [role="tab"][aria-selected="true"]', '.v-tabs-pill [role="tab"][aria-selected="false"]'],
    ['navigation', '.v-tabs-vertical [role="tab"][aria-selected="true"]', '.v-tabs-vertical [role="tab"][aria-selected="false"]'],
    ['navigation', '.v-page[aria-current="page"]', 'a.v-page:not([aria-current])'],
    ['navigation', '.v-sidenav a[aria-current="page"]', '.v-sidenav a:not([aria-current])'],
    ['navigation', '.v-bottombar a[aria-current="page"]', '.v-bottombar a:not([aria-current])'],
    ['navigation', '#navbar .v-navbar-links a[aria-current="page"]', '#navbar .v-navbar-links a:not([aria-current])'],
    ['navigation', '.v-step[aria-current="step"]', '.v-step:not([aria-current], .v-step-complete)'],
    ['components', '.v-segmented input:checked + span', '.v-segmented input:not(:checked) + span'],
    ['overlays', '[role="menuitemcheckbox"][aria-checked="true"]', '[role="menuitemcheckbox"][aria-checked="false"]'],
    ['overlays', '[role="menuitemradio"][aria-checked="true"]', '[role="menuitemradio"][aria-checked="false"]'],
    ['content', '.v-table tbody tr:has(> .v-table-check input:checked) > :first-child', '.v-table tbody tr:has(> .v-table-check input:not(:checked)) > :first-child'],
    ['elements', '.v-list-item[aria-current]', '.v-list-item:not([aria-current])'],
    ['elements', '.v-toggle-group [aria-pressed="true"]', '.v-toggle-group [aria-pressed="false"]'],
    ['theming', '.v-swatches input:checked + .v-swatch', '.v-swatches input:not(:checked) + .v-swatch'],
  ];
  // Every direction: a direction's own state styling can outrank a forced-colours rule in the components layer.
  for (const [[name, on, off], direction] of STATES.flatMap((st) => DIRECTIONS.map((d) => [st, d]))) {
    test(`forced colours: ${on} stands out · ${name} · ${direction}`, async ({ page }) => {
      await page.emulateMedia({ forcedColors: 'active' });
      await setup(page, byName(name), { direction, theme: 'light' });
      const sig = (sel) => page.evaluate((s) => {
        const el = document.querySelector(s);
        if (!el) return null;
        // A background equal to the page (Canvas) is invisible, and so is a border with no width.
        const canvas = getComputedStyle(document.body).backgroundColor;
        const bg = (c) => (c === canvas || /^rgba\(.*, 0\)$/.test(c) ? '-' : c);
        const side = (cs, k) => (cs[`border${k}Style`] === 'none' || parseFloat(cs[`border${k}Width`]) === 0 ? '-' : `${cs[`border${k}Width`]} ${cs[`border${k}Color`]}`);
        const part = (cs) => [cs.color, bg(cs.backgroundColor), ...['Top', 'Right', 'Bottom', 'Left'].map((k) => side(cs, k)),
          cs.outlineStyle, cs.textDecorationLine, cs.content].join('|');
        return [part(getComputedStyle(el)), part(getComputedStyle(el, '::before')), part(getComputedStyle(el, '::after'))].join(' / ');
      }, sel);
      const a = await sig(on);
      const b = await sig(off);
      expect(a, on).not.toBeNull();
      expect(b, off).not.toBeNull();
      expect(a).not.toBe(b);
    });
  }

  test('forced colours: progress and meter fills stay visible · components', async ({ page }) => {
    await page.emulateMedia({ forcedColors: 'active' });
    await setup(page, byName('components'), { direction: 'tech', theme: 'light' });
    const bars = page.locator('.v-progress[value], .v-meter');
    const n = await bars.count();
    expect(n).toBeGreaterThan(0);
    for (let i = 0; i < n; i += 1) {
      const bar = bars.nth(i);
      await bar.scrollIntoViewIfNeeded();
      const fraction = await bar.evaluate((el) => (el.value - (el.min || 0)) / ((el.max || 1) - (el.min || 0)));
      if (fraction <= 0.1 || fraction >= 0.9) continue;
      const shot = (await bar.screenshot()).toString('base64');
      const [filled, empty] = await page.evaluate(async ([data, f]) => {
        const img = await createImageBitmap(await (await fetch(`data:image/png;base64,${data}`)).blob());
        const ctx = new OffscreenCanvas(img.width, img.height).getContext('2d');
        ctx.drawImage(img, 0, 0);
        const at = (x) => [...ctx.getImageData(Math.round(x), Math.floor(img.height / 2), 1, 1).data].slice(0, 3).join(',');
        return [at(img.width * f * 0.5), at(img.width * (f + (1 - f) * 0.5))];
      }, [shot, fraction]);
      expect(filled, await bar.evaluate((el) => el.outerHTML.slice(0, 80))).not.toBe(empty);
    }
  });

  test('forced colours: focus rings use a forced colour, not a shadow · forms', async ({ page }) => {
    await page.emulateMedia({ forcedColors: 'active' });
    await setup(page, byName('forms'), { direction: 'tech', theme: 'light' });
    const bad = [];
    for (let i = 0; i < 40; i += 1) {
      await page.keyboard.press('Tab');
      const r = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;
        // The ring may sit on the element or on a wrapper drawn around it (input groups, choice cards).
        for (let a = el; a && a !== document.body; a = a.parentElement) {
          const cs = getComputedStyle(a);
          if (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) return { ok: true };
          const next = a.nextElementSibling && getComputedStyle(a.nextElementSibling);
          if (next && next.outlineStyle !== 'none' && parseFloat(next.outlineWidth) > 0) return { ok: true };
        }
        return { ok: false, label: window.vLabel(el) };
      });
      if (r && !r.ok) bad.push(r.label);
    }
    expect(bad).toEqual([]);
  });
});

// 3. Reflow at 400% zoom ---------------------------------------------------------------------------------
// 1280 x 1024 at 400% is 320 x 256 CSS px. Only content that needs two dimensions may scroll sideways, and
// it does so in its own wrapper (tables, code), never the page.
test.describe('reflow', () => {
  for (const target of GALLERY) {
    for (const [direction, theme] of COMBOS) {
      test(`reflow at 320 x 256: no page-level sideways scroll · ${target.name} · ${direction}`, async ({ page }) => {
        await page.setViewportSize({ width: 320, height: 256 });
        await setup(page, target, { direction, theme });
        expect(await page.evaluate(() => window.vOverflow())).toEqual({ extra: 0, offenders: [] });
      });
    }
  }
});

// 4. Text spacing (WCAG 1.4.12) -------------------------------------------------------------------------
const TEXT_SPACING = `
  * { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; }
  p { margin-block-end: 2em !important; }
`;
test.describe('text spacing', () => {
  for (const target of GALLERY) {
    for (const [direction, theme] of COMBOS) {
      test(`text spacing: nothing clipped · ${target.name} · ${direction}`, async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 900 });
        await setup(page, target, { direction, theme });
        await page.addStyleTag({ content: TEXT_SPACING });
        const bad = await page.evaluate(() => {
          const out = [];
          const hasText = (el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
          for (const el of document.body.querySelectorAll('*')) {
            const r = el.getBoundingClientRect();
            if (r.width < 4 || r.height < 4) continue;
            const cs = getComputedStyle(el);
            if (cs.visibility === 'hidden' || el.closest('.v-sr-only, [hidden]')) continue;
            // Text cut off by a clipping box. Deliberate truncation (ellipsis) shows it is cut and is allowed.
            // Checked per axis: a sideways scroller (overflow-x: auto) clips nothing horizontally.
            const clipX = /hidden|clip/.test(cs.overflowX) && el.scrollWidth > el.clientWidth + 1;
            const clipY = /hidden|clip/.test(cs.overflowY) && el.scrollHeight > el.clientHeight + 1;
            if ((clipX || clipY) && el.textContent.trim() && cs.textOverflow !== 'ellipsis' && !['PROGRESS', 'METER', 'svg'].includes(el.tagName)) {
              out.push(`${window.vLabel(el)} clipped (${el.scrollWidth}x${el.scrollHeight} in ${el.clientWidth}x${el.clientHeight})`);
            }
            // Text spilling out of a fixed-height box (it would overlap whatever sits below).
            if (hasText(el) && cs.display !== 'inline') {
              const range = document.createRange();
              range.selectNodeContents(el);
              const t = range.getBoundingClientRect();
              if (t.height && t.bottom > r.bottom + 4) out.push(`${window.vLabel(el)} text spills (${Math.round(t.height)} in ${Math.round(r.height)})`);
            }
          }
          return out;
        });
        expect(bad.slice(0, 12)).toEqual([]);
      });
    }
  }
});

// 5. Focus visible -------------------------------------------------------------------------------------------
// Tab through every gallery. Each stop must (a) not be hidden behind sticky or fixed elements (WCAG 2.4.11)
// and (b) show an indicator: comparing the focused and unfocused screenshots of the area around it, the pixels
// that change by at least 3:1 must cover at least three quarters of a 1px line around the element (a
// lighter take on WCAG 2.4.13's area measure; it lets Editorial's thickened underline count). One sample per kind of element (classes + parent + background) keeps it fast.
test.describe('focus visible', () => {
  chromiumOnly('pixel comparison of focus rings runs in Chromium');

  for (const target of GALLERY) {
    for (const [direction, theme] of COMBOS) {
      test(`focus: every stop shows a 3:1 indicator and is not hidden · ${target.name} · ${direction}`, async ({ page }) => {
        test.setTimeout(120_000);
        await page.setViewportSize({ width: 1280, height: 900 });
        await setup(page, target, { direction, theme });
        const seen = new Set();
        const failures = [];
        let first = null;
        for (let step = 0; step < 400; step += 1) {
          await page.keyboard.press('Tab');
          const info = await page.evaluate(() => {
            const el = document.activeElement;
            if (!el || el === document.body) return null;
            const r = el.getBoundingClientRect();
            // Fully covered by a sticky or fixed element that is not its own ancestor?
            const covers = [...document.querySelectorAll('body *')].filter((c) => {
              const p = getComputedStyle(c).position;
              return (p === 'fixed' || p === 'sticky') && !c.contains(el) && c.getBoundingClientRect().height > 0;
            }).map((c) => c.getBoundingClientRect());
            const hidden = covers.some((c) => c.left <= r.left && c.right >= r.right && c.top <= r.top && c.bottom >= r.bottom);
            let bg = 'none';
            for (let a = el; a; a = a.parentElement) {
              const b = getComputedStyle(a).backgroundColor;
              if (b !== 'rgba(0, 0, 0, 0)') { bg = b; break; }
            }
            const key = `${el.tagName}.${el.className}|${el.getAttribute('type')}|${el.parentElement?.className}|${bg}`;
            if (!el.dataset.vHardenId) el.dataset.vHardenId = String(Math.random()).slice(2);
            // The ring may be drawn on a wrapper (input group, choice card, tag) or on the next sibling
            // (a segmented option's span, a swatch): measure around whichever carries the outline.
            const ring = (n) => n && getComputedStyle(n).outlineStyle !== 'none' && parseFloat(getComputedStyle(n).outlineWidth) > 0;
            let host = el;
            if (!ring(el)) {
              const near = [el.nextElementSibling];
              for (let a = el.parentElement, i = 0; a && i < 4; a = a.parentElement, i += 1) near.push(a);
              host = near.find(ring) || el;
            }
            const hs = getComputedStyle(host);
            const reach = ring(host) ? Math.max(0, parseFloat(hs.outlineOffset)) + parseFloat(hs.outlineWidth) : 0;
            const inline = hs.display === 'inline';
            const h = host.getBoundingClientRect();
            // Edges of the host that are on screen, as a 1px line: what a full ring must at least cover.
            const rects = inline ? [...host.getClientRects()] : [h];
            const perimeter = rects.reduce((sum, b) => {
              const top = Math.max(0, b.top); const bottom = Math.min(innerHeight, b.bottom);
              const left = Math.max(0, b.left); const right = Math.min(innerWidth, b.right);
              if (bottom <= top || right <= left) return sum;
              return sum + (b.top >= 0 ? right - left : 0) + (b.bottom <= innerHeight ? right - left : 0)
                + (b.left >= 0 ? bottom - top : 0) + (b.right <= innerWidth ? bottom - top : 0);
            }, 0);
            return { id: el.dataset.vHardenId, key, label: window.vLabel(el), hidden, perimeter, pad: Math.max(8, reach + 3), rect: { x: h.left, y: h.top, w: h.width, h: h.height }, vh: innerHeight, vw: innerWidth };
          });
          if (!info) continue;
          if (info.id === first) break;
          first ??= info.id;
          if (info.hidden) failures.push(`${info.label}: hidden behind a sticky or fixed element`);
          if (seen.has(info.key)) continue;
          seen.add(info.key);
          const { x, y, w, h } = info.rect;
          if (w < 1 || h < 1) continue;
          const { pad } = info;
          const clip = { x: Math.max(0, x - pad), y: Math.max(0, y - pad), width: Math.min(info.vw, x + w + pad) - Math.max(0, x - pad), height: Math.min(info.vh, y + h + pad) - Math.max(0, y - pad) };
          if (clip.width < 2 || clip.height < 2) continue;
          const focused = (await page.screenshot({ clip, animations: 'disabled' })).toString('base64');
          await page.evaluate((id) => document.querySelector(`[data-v-harden-id="${id}"]`).blur(), info.id);
          const blurred = (await page.screenshot({ clip, animations: 'disabled' })).toString('base64');
          await page.evaluate((id) => document.querySelector(`[data-v-harden-id="${id}"]`).focus(), info.id);
          const strong = await page.evaluate(async ([a, b]) => {
            const load = async (d) => {
              const img = await createImageBitmap(await (await fetch(`data:image/png;base64,${d}`)).blob());
              const ctx = new OffscreenCanvas(img.width, img.height).getContext('2d');
              ctx.drawImage(img, 0, 0);
              return ctx.getImageData(0, 0, img.width, img.height).data;
            };
            const [p, q] = [await load(a), await load(b)];
            const lin = (v) => { const c = v / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
            const lum = (d, i) => 0.2126 * lin(d[i]) + 0.7152 * lin(d[i + 1]) + 0.0722 * lin(d[i + 2]);
            let n = 0;
            for (let i = 0; i < p.length; i += 4) {
              const l1 = lum(p, i); const l2 = lum(q, i);
              if ((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05) >= 3) n += 1;
            }
            return n;
          }, [focused, blurred]);
          if (strong < info.perimeter * 0.75) failures.push(`${info.label}: indicator ${strong}px at 3:1, needs ${Math.round(info.perimeter)}`);
        }
        expect(failures.slice(0, 12)).toEqual([]);
      });
    }
  }
});

// 6. Reduced motion and reduced transparency ---------------------------------------------------------------
test.describe('reduced motion', () => {
  // playwright.config.js already sets reducedMotion: 'reduce'; repeated here so the test stands alone.
  test.use({ reducedMotion: 'reduce' });
  const running = (page) => page.evaluate(() => new Promise((done) => {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      done(document.getAnimations()
        .filter((a) => a.playState === 'running' && (a.effect?.getComputedTiming().activeDuration ?? 0) > 17)
        .map((a) => `${a.animationName || a.transitionProperty || 'animation'} on ${window.vLabel(a.effect.target)}`));
    }));
  }));
  const ACTIONS = [
    ['overlays', 'dialog', async (page) => page.click('[data-v-dialog-open="dlg-invite"]')],
    ['overlays', 'drawer', async (page) => page.click('[data-v-dialog-open="drw-end"]')],
    ['overlays', 'menu', async (page) => page.click('[popovertarget="menu-project"]')],
    ['overlays', 'popover', async (page) => page.click('[popovertarget="pop-storage"]')],
    ['navigation', 'accordion', async (page) => page.locator('.v-accordion details').nth(1).locator('summary').click()],
    ['navigation', 'collapsible', async (page) => page.locator('.v-collapsible > summary').first().click()],
    ['theming', 'toast', async (page) => page.click('#toast-info')],
    ['theming', 'customizer', async (page) => page.click('[popovertarget="customizer"]')],
    ['components', 'page load (spinners, skeletons, progress)', async () => {}],
  ];
  for (const [name, what, act] of ACTIONS) {
    test(`reduced motion: nothing animates past a frame · ${what}`, async ({ page }) => {
      await setup(page, byName(name), { direction: 'tech', theme: 'light' });
      await act(page);
      expect(await running(page)).toEqual([]);
    });
  }
});

test.describe('reduced transparency', () => {
  chromiumOnly('prefers-reduced-transparency is emulated through the Chromium DevTools protocol');
  const SURFACES = [
    ['components', '.v-card'],
    ['overlays', '.v-dialog.ex-static, .v-dialog[open]'],
    ['overlays', '.v-drawer.ex-static'],
    ['overlays', '.v-menu'],
    ['overlays', '.v-popover'],
    ['theming', '.v-toast'],
    ['navigation', '.v-navbar'],
  ];
  for (const [name, sel] of SURFACES) {
    test(`reduced transparency: Glass ${sel} is opaque · ${name}`, async ({ page }) => {
      const cdp = await page.context().newCDPSession(page);
      await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-transparency', value: 'reduce' }] });
      for (const theme of ['light', 'dark']) {
        await setup(page, byName(name), { direction: 'glass', theme });
        expect(await page.evaluate(() => matchMedia('(prefers-reduced-transparency: reduce)').matches)).toBe(true);
        // Opaque: a solid background colour, or a gradient whose colours carry no alpha.
        const found = await page.evaluate((s) => [...document.querySelectorAll(s)].map((el) => {
          const cs = getComputedStyle(el);
          const c = new OffscreenCanvas(1, 1).getContext('2d');
          c.fillStyle = cs.backgroundColor;
          c.fillRect(0, 0, 1, 1);
          const solid = c.getImageData(0, 0, 1, 1).data[3] === 255;
          const image = cs.backgroundImage;
          const gradient = image.includes('gradient(') && !/\/ 0?\.\d|rgba\([^)]*,\s*0?\.\d+\)/.test(image);
          return { label: window.vLabel(el), alpha: solid || gradient ? 255 : c.getImageData(0, 0, 1, 1).data[3] };
        }), sel);
        expect(found.length, sel).toBeGreaterThan(0);
        expect(found.filter((f) => f.alpha < 255).map((f) => `${theme} ${f.label}: alpha ${f.alpha}`)).toEqual([]);
      }
    });
  }
});

// 7. Target size (WCAG 2.5.8) -------------------------------------------------------------------------------
// At least 24 x 24 CSS px, or a 24px circle on the target's centre that touches no other target. Exempt:
// links inside running text, and controls whose visible target is their label (the label is measured).
test.describe('target size', () => {
  for (const target of GALLERY) {
    test(`target size: 24 x 24 or spaced · ${target.name}`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      await setup(page, target, { direction: 'tech', theme: 'light' });
      const bad = await page.evaluate(() => {
        const SEL = 'a[href], button, input:not([type="hidden"]), select, textarea, summary, [role="tab"], [role^="menuitem"], [tabindex="0"]';
        const visible = (el) => {
          const r = el.getBoundingClientRect();
          const cs = getComputedStyle(el);
          return r.width >= 2 && r.height >= 2 && cs.visibility !== 'hidden' && Number(cs.opacity) > 0 && !el.closest('[hidden], [inert]');
        };
        const inText = (el) => {
          if (el.tagName !== 'A' || getComputedStyle(el).display !== 'inline') return false;
          return [...el.parentElement.childNodes].some((n) => n !== el && n.nodeType === 3 && n.textContent.trim());
        };
        const targets = [];
        for (const el of document.querySelectorAll(SEL)) {
          if (el.disabled || el.closest('.v-sr-only')) continue;
          let box = el;
          // A control that is visually hidden or wrapped by its label: the label is what people press.
          if (el.labels?.length && (!visible(el) || el.closest('label'))) box = el.closest('label') || el.labels[0];
          if (!visible(box) || inText(box)) continue;
          const r = box.getBoundingClientRect();
          targets.push({ el: box, label: window.vLabel(el), r, small: r.width < 23.5 || r.height < 23.5 });
        }
        const out = [];
        const distToRect = (x, y, r) => Math.hypot(Math.max(r.left - x, 0, x - r.right), Math.max(r.top - y, 0, y - r.bottom));
        for (const t of targets.filter((x) => x.small)) {
          const cx = t.r.left + t.r.width / 2; const cy = t.r.top + t.r.height / 2;
          // A scroll region or card that contains the target is its surroundings, not a neighbour.
          const clash = targets.find((u) => u !== t && !u.el.contains(t.el) && !t.el.contains(u.el) && (u.small
            ? Math.hypot(cx - (u.r.left + u.r.width / 2), cy - (u.r.top + u.r.height / 2)) < 24
            : distToRect(cx, cy, u.r) < 12));
          if (clash) out.push(`${t.label} ${Math.round(t.r.width)}x${Math.round(t.r.height)} too close to ${clash.label}`);
        }
        return out;
      });
      expect(bad.slice(0, 12)).toEqual([]);
    });
  }
});

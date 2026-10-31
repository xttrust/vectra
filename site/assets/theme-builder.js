/* Theme builder (docs site, /theme-builder/). Drives the preview frame with the kit's own theme API on
   its <html>: data-direction, data-theme, data-corners, data-density, data-font and --v-accent-h, plus
   any fine-tuned tokens as inline custom properties. From the resolved tokens it computes a live WCAG
   contrast report for the current settings and a sweep across every accent hue (the pairings and maths
   of tests/tokens.spec.js), writes a CSS file with only the changed tokens, and keeps every setting in
   the URL hash so a link restores the exact theme. */
(function () {
  const tb = document.getElementById('tb');
  if (!tb) return;
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
  const { pairs: PAIRS, presets: PRESETS } = JSON.parse($('#tb-data').textContent);

  const form = $('#tb-form');
  const frame = $('#tb-frame');
  const wheel = $('#tb-wheel');
  const hueInput = $('#tb-hue');
  const DIRECTIONS = { tech: 'Dark tech', editorial: 'Editorial', soft: 'Soft depth', glass: 'Glass' };
  const CHOICES = { corners: ['default', 'sharp', 'rounded', 'round'], density: ['default', 'compact', 'spacious'], font: ['default', 'inter', 'serif', 'system'] };
  const TOKENS = $$('[data-tb-token]', form).map((i) => i.dataset.tbToken);
  const SHAPE = ['radius-sm', 'radius-md', 'radius-lg', 'radius-xl', 'density', 'font-body', 'font-display'];
  const SWEEP = ['default', ...Array.from({ length: 24 }, (_, i) => i * 15)];
  const KINDS = { text: ['Text', '4.5:1'], focus: ['Focus, indicators, large accent text', '3:1'], control: ['Control borders', '3:1'] };
  const DEFAULTS = { direction: 'tech', mode: 'light', hue: 'default', corners: 'default', density: 'default', font: 'default' };
  const empty = () => ({ light: {}, dark: {} });

  let state = { ...DEFAULTS, overrides: empty() };
  let ready = false;
  let sweepKey = '';
  let lastStatus = '';

  const pdoc = () => frame.contentDocument;
  const proot = () => pdoc().documentElement;
  const announce = (text) => window.Vectra?.announce(text);

  /* ---------- Hue names ---------- */
  const NAMES = [[15, 'Red'], [45, 'Orange'], [75, 'Amber'], [105, 'Lime'], [150, 'Green'], [185, 'Teal'], [215, 'Cyan'], [255, 'Blue'], [275, 'Indigo'], [305, 'Violet'], [340, 'Pink'], [360, 'Red']];
  const hueName = (h) => NAMES.find(([max]) => h < max)[1];

  /* ---------- Contrast maths (ported from tests/tokens.spec.js) ---------- */
  const ctx = Object.assign(document.createElement('canvas'), { width: 1, height: 1 }).getContext('2d', { willReadFrequently: true });
  const rgba = (color) => {
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = '#000';
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
    return [r, g, b, a / 255];
  };
  const over = ([r, g, b, a], [br, bg, bb]) => [r * a + br * (1 - a), g * a + bg * (1 - a), b * a + bb * (1 - a)];
  const lum = (rgb) => {
    const [r, g, b] = rgb.map((v) => { const c = v / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const ratio = (fg, bg) => { const [a, b] = [lum(fg), lum(bg)].sort((x, y) => y - x); return (a + 0.05) / (b + 0.05); };
  const hex = ([r, g, b, a = 1]) => `#${[r, g, b, ...(a < 1 ? [Math.round(a * 255)] : [])].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`;
  const css = ([r, g, b, a = 1]) => `rgb(${Math.round(r)} ${Math.round(g)} ${Math.round(b)} / ${a})`;

  // Resolves tokens in the preview through a probe whose wrapper has a sentinel colour, so a missing token
  // or one that is not a colour shows up instead of silently reading some other colour.
  function resolver() {
    const doc = pdoc();
    const SENTINEL = 'rgb(1, 2, 3)';
    const wrap = doc.body.appendChild(doc.createElement('div'));
    wrap.style.cssText = `display: none; color: ${SENTINEL}`;
    const probe = wrap.appendChild(doc.createElement('i'));
    const cache = new Map();
    return {
      token(name) {
        if (!cache.has(name)) {
          probe.style.color = `var(--v-${name}, ${SENTINEL})`;
          const value = doc.defaultView.getComputedStyle(probe).color;
          cache.set(name, value === SENTINEL ? null : rgba(value));
        }
        return cache.get(name);
      },
      reset: () => cache.clear(),
      remove: () => wrap.remove(),
    };
  }

  function check(r) {
    return PAIRS.map(([fg, stack, min, label, kind]) => {
      const colours = [fg, ...stack].map((t) => r.token(t));
      if (colours.includes(null)) return { label, kind, min, value: 1, pass: false, missing: true };
      const bg = stack.reduce((base, t) => over(r.token(t), base), [255, 255, 255]);
      const value = ratio(over(r.token(fg), bg), bg);
      return { label, kind, min, value, pass: value >= min };
    });
  }

  /* ---------- Painting the preview ---------- */
  function paint(s, mode = s.mode, hue = s.hue) {
    const root = proot();
    root.dataset.direction = s.direction;
    root.dataset.theme = mode;
    for (const key of Object.keys(CHOICES)) {
      if (s[key] === 'default') delete root.dataset[key]; else root.dataset[key] = s[key];
    }
    if (hue === 'default') root.style.removeProperty('--v-accent-h'); else root.style.setProperty('--v-accent-h', String(hue));
    for (const t of TOKENS) {
      const value = s.overrides[mode][t];
      if (value) root.style.setProperty(`--v-${t}`, value); else root.style.removeProperty(`--v-${t}`);
    }
  }

  const readVar = (name) => pdoc().defaultView.getComputedStyle(proot()).getPropertyValue(`--v-${name}`).trim();
  const plain = () => ({ ...state, overrides: empty() });

  /* ---------- URL hash ---------- */
  function toHash() {
    const q = new URLSearchParams({ d: state.direction, m: state.mode });
    if (state.hue !== 'default') q.set('h', state.hue);
    if (state.corners !== 'default') q.set('c', state.corners);
    if (state.density !== 'default') q.set('n', state.density);
    if (state.font !== 'default') q.set('f', state.font);
    for (const mode of ['light', 'dark']) {
      const list = Object.entries(state.overrides[mode]).map(([t, v]) => `${t}.${v.slice(1)}`);
      if (list.length) q.set(mode === 'light' ? 'ol' : 'od', list.join('~'));
    }
    return q.toString();
  }

  function fromHash(hash) {
    const q = new URLSearchParams(hash.replace(/^#/, ''));
    if (!q.has('d')) return null;
    const s = { ...DEFAULTS, overrides: empty() };
    if (q.get('d') in DIRECTIONS) s.direction = q.get('d');
    if (['light', 'dark'].includes(q.get('m'))) s.mode = q.get('m');
    const h = Number(q.get('h'));
    if (q.has('h') && Number.isInteger(h) && h >= 0 && h < 360) s.hue = h;
    for (const [key, p] of [['corners', 'c'], ['density', 'n'], ['font', 'f']]) if (CHOICES[key].includes(q.get(p))) s[key] = q.get(p);
    for (const [mode, p] of [['light', 'ol'], ['dark', 'od']]) {
      for (const item of (q.get(p) ?? '').split('~')) {
        const [t, v] = item.split('.');
        if (TOKENS.includes(t) && /^[0-9a-f]{6}$/i.test(v ?? '')) s.overrides[mode][t] = `#${v.toLowerCase()}`;
      }
    }
    return s;
  }

  let hashTimer;
  let quiet = true; // the first render only fills the share box; the URL changes once the visitor does something
  function writeHash() {
    const link = `${location.href.split('#')[0]}#${toHash()}`;
    $('#tb-link').value = link;
    $('#tb-copy-link').dataset.vCopy = link;
    clearTimeout(hashTimer);
    if (quiet) return;
    hashTimer = setTimeout(() => history.replaceState(null, '', `#${toHash()}`), 150);
  }

  /* ---------- Controls ---------- */
  function syncControls() {
    for (const key of ['direction', 'mode', ...Object.keys(CHOICES)]) {
      $$(`input[name="${key}"]`, form).forEach((r) => { r.checked = r.value === state[key]; });
    }
    $$('input[name="accent"]', form).forEach((r) => { r.checked = r.value === String(state.hue); });
    const shown = state.hue === 'default' ? Number(readVar('accent-h')) || 0 : state.hue;
    const name = hueName(shown);
    wheel.style.setProperty('--tb-hue', shown);
    wheel.setAttribute('aria-valuenow', shown);
    wheel.setAttribute('aria-valuetext', `${shown} degrees, ${name}${state.hue === 'default' ? ', the direction default' : ''}`);
    $('#tb-hue-value').textContent = `${shown}°`;
    $('#tb-hue-name').textContent = state.hue === 'default' ? 'Default' : name;
    if (document.activeElement !== hueInput) hueInput.value = shown;
    const r = resolver();
    const accent = r.token('accent');
    const on = r.token('on-accent');
    if (accent) wheel.style.setProperty('--tb-accent', css(accent));
    if (on) wheel.style.setProperty('--tb-on-accent', css(on));
    let count = 0;
    // Colour inputs take opaque #rrggbb only, so translucent tokens are shown composited over the page.
    const page = over(r.token('bg') ?? [255, 255, 255, 1], [255, 255, 255]);
    for (const input of $$('[data-tb-token]', form)) {
      const t = input.dataset.tbToken;
      const set = state.overrides[state.mode][t];
      if (set) count += 1;
      const c = r.token(t);
      input.value = set ?? (c ? hex(over(c, page)) : '#000000');
      $(`[data-tb-reset="${t}"]`, form).hidden = !set;
      input.closest('.tb-token').classList.toggle('tb-token-set', Boolean(set));
    }
    r.remove();
    const badge = $('#tb-fine-count');
    badge.hidden = !count;
    badge.textContent = `${count} changed`;
  }

  /* ---------- Contrast report ---------- */
  const fmt = (v) => `${v.toFixed(2)}:1`;
  const where = () => `${DIRECTIONS[state.direction]}, ${state.mode}, ${state.hue === 'default' ? 'default hue' : `hue ${state.hue}°`}`;

  function report() {
    const r = resolver();
    const results = check(r);
    r.remove();
    const failed = results.filter((x) => !x.pass);
    const status = failed.length ? `${failed.length} of ${results.length} pairings fail WCAG AA.` : `All ${results.length} pairings pass WCAG AA.`;
    const statusEl = $('#tb-report-status');
    if (status !== lastStatus) { statusEl.textContent = status; lastStatus = status; }
    statusEl.dataset.state = failed.length ? 'fail' : 'pass';
    $('#tb-score').dataset.state = failed.length ? 'fail' : 'pass';
    $('#tb-score-text').textContent = failed.length ? `${failed.length} contrast ${failed.length === 1 ? 'failure' : 'failures'}` : `AA · ${results.length}/${results.length} pass`;

    $('#tb-kinds').replaceChildren(...Object.entries(KINDS).map(([kind, [title, min]]) => {
      const list = results.filter((x) => x.kind === kind);
      const pass = list.filter((x) => x.pass).length;
      const low = list.reduce((a, b) => (b.value < a.value ? b : a));
      const card = document.createElement('div');
      card.className = 'tb-kind';
      card.dataset.state = pass === list.length ? 'pass' : 'fail';
      card.innerHTML = '<span class="tb-kind-title"></span><span class="tb-kind-value"></span><span class="tb-kind-low"></span>';
      card.children[0].textContent = `${title} · ${min}`;
      card.children[1].textContent = `${pass}/${list.length}`;
      card.children[2].textContent = `Lowest ${fmt(low.value)}, ${low.label}`;
      return card;
    }));

    const fails = $('#tb-failures');
    fails.replaceChildren();
    if (failed.length) {
      const box = document.createElement('div');
      box.className = 'v-callout v-callout-danger tb-fail-list';
      box.innerHTML = '<p class="v-callout-title"></p><ul></ul>';
      box.firstChild.textContent = `Failing in ${where()}`;
      for (const f of failed) {
        const li = document.createElement('li');
        li.innerHTML = '<span></span> <strong></strong>';
        li.children[0].textContent = f.label;
        li.children[1].textContent = f.missing ? 'token missing' : `${fmt(f.value)}, needs ${f.min}:1`;
        box.lastChild.append(li);
      }
      fails.append(box);
    }

    const rows = [...results].sort((a, b) => a.value / a.min - b.value / b.min);
    const wrap = document.createElement('div');
    wrap.className = 'v-table-wrap site-table';
    wrap.innerHTML = '<table class="v-table"><caption class="v-sr-only">Every pairing for the current settings</caption><thead><tr><th scope="col">Pairing</th><th scope="col">Ratio</th><th scope="col">Needs</th><th scope="col">Result</th></tr></thead><tbody></tbody></table>';
    for (const x of rows) {
      const tr = document.createElement('tr');
      for (const [label, text] of [['Pairing', x.label], ['Ratio', fmt(x.value)], ['Needs', `${x.min}:1`], ['Result', x.pass ? 'Pass' : 'Fail']]) {
        const td = document.createElement('td');
        td.dataset.label = label;
        td.textContent = text;
        tr.append(td);
      }
      tr.lastChild.className = x.pass ? 'v-text-success' : 'v-text-danger';
      wrap.querySelector('tbody').append(tr);
    }
    $('#tb-pairs').replaceChildren(wrap);
  }

  /* ---------- Hue sweep ---------- */
  function sweep() {
    const key = JSON.stringify([state.direction, state.overrides]);
    if (key === sweepKey) { markSweep(); return; }
    sweepKey = key;
    const r = resolver();
    const grid = document.createElement('div');
    grid.className = 'tb-sweep-grid';
    grid.setAttribute('role', 'grid');
    grid.setAttribute('aria-label', `Contrast at every accent hue in ${DIRECTIONS[state.direction]}`);
    let failing = 0;
    for (const mode of ['light', 'dark']) {
      const row = document.createElement('div');
      row.className = 'tb-sweep-row';
      row.setAttribute('role', 'row');
      const head = document.createElement('span');
      head.className = 'tb-sweep-mode';
      head.setAttribute('role', 'rowheader');
      head.textContent = mode === 'light' ? 'Light' : 'Dark';
      row.append(head);
      for (const hue of SWEEP) {
        paint(state, mode, hue);
        r.reset();
        const results = check(r);
        const fails = results.filter((x) => !x.pass).length;
        const worst = results.reduce((a, b) => (b.value / b.min < a.value / a.min ? b : a));
        const accent = r.token('accent');
        const on = r.token('on-accent');
        if (fails) failing += 1;
        const cell = document.createElement('span');
        cell.setAttribute('role', 'gridcell');
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'tb-cell';
        btn.tabIndex = -1;
        btn.dataset.hue = hue;
        btn.dataset.mode = mode;
        btn.dataset.state = fails ? 'fail' : 'pass';
        if (accent) btn.style.setProperty('--tb-cell', css(accent));
        if (on) btn.style.setProperty('--tb-cell-fg', css(on));
        // Visible: the lowest ratio, or the number of failures. Screen readers hear the whole story.
        const label = hue === 'default' ? 'Default hue' : `Hue ${hue}°`;
        const story = `${label}, ${mode}: ${fails ? `${fails} failing` : 'all pass'}, closest ${worst.label} at ${fmt(worst.value)}`;
        btn.textContent = fails ? `${fails}✕` : worst.value.toFixed(1);
        btn.append(Object.assign(document.createElement('span'), { className: 'v-sr-only', textContent: ` ${story}` }));
        btn.title = story;
        cell.append(btn);
        row.append(cell);
      }
      grid.append(row);
    }
    paint(state);
    r.remove();
    const summary = $('#tb-sweep-summary');
    summary.dataset.state = failing ? 'fail' : 'pass';
    summary.textContent = failing ? `${failing} of ${SWEEP.length * 2} hue and mode combinations have a failing pairing.` : `Every hue passes in light and dark: ${SWEEP.length * 2 * PAIRS.length} pairings checked.`;
    $('#tb-sweep').replaceChildren(grid);
    markSweep();
  }

  function markSweep() {
    const cells = $$('.tb-cell', $('#tb-sweep'));
    let current = null;
    for (const c of cells) {
      const on = c.dataset.mode === state.mode && c.dataset.hue === String(state.hue);
      if (on) { c.setAttribute('aria-current', 'true'); current = c; } else c.removeAttribute('aria-current');
    }
    if (!cells.some((c) => c.tabIndex === 0) || current) {
      cells.forEach((c) => { c.tabIndex = -1; });
      (current ?? cells[0]).tabIndex = 0;
    }
  }

  $('#tb-sweep').addEventListener('click', (e) => {
    const cell = e.target.closest('.tb-cell');
    if (!cell) return;
    set({ hue: cell.dataset.hue === 'default' ? 'default' : Number(cell.dataset.hue), mode: cell.dataset.mode });
  });
  $('#tb-sweep').addEventListener('keydown', (e) => {
    const cell = e.target.closest('.tb-cell');
    if (!cell) return;
    const rows = $$('.tb-sweep-row', $('#tb-sweep')).map((r) => $$('.tb-cell', r));
    const y = rows.findIndex((r) => r.includes(cell));
    const x = rows[y].indexOf(cell);
    const move = { ArrowRight: [x + 1, y], ArrowLeft: [x - 1, y], ArrowDown: [x, y + 1], ArrowUp: [x, y - 1], Home: [0, y], End: [rows[y].length - 1, y] }[e.key];
    if (!move) return;
    e.preventDefault();
    const next = rows[Math.max(0, Math.min(rows.length - 1, move[1]))][Math.max(0, Math.min(rows[0].length - 1, move[0]))];
    cell.tabIndex = -1;
    next.tabIndex = 0;
    next.focus();
  });

  /* ---------- Export ---------- */
  function exportCss() {
    const lines = [];
    if (state.hue !== 'default') lines.push(['accent-h', String(state.hue)]);
    // Shape and type: compare the resolved values with the direction's own, so a preset that matches the
    // direction (serif display type in Editorial, say) adds nothing.
    paint({ ...plain(), corners: 'default', density: 'default', font: 'default' }, state.mode, 'default');
    const before = Object.fromEntries(SHAPE.map((t) => [t, readVar(t)]));
    const fonts = { [readVar('font-sans')]: 'var(--v-font-sans)', [readVar('font-serif')]: 'var(--v-font-serif)' };
    paint(plain());
    for (const t of SHAPE) {
      const now = readVar(t);
      if (now !== before[t]) lines.push([t, fonts[now] ?? now]);
    }
    // Fine-tuned colours: light-dark() with the other mode's resolved value when only one mode was changed.
    const touched = TOKENS.filter((t) => state.overrides.light[t] || state.overrides.dark[t]);
    if (touched.length) {
      const r = resolver();
      const value = (t, mode) => {
        if (state.overrides[mode][t]) return state.overrides[mode][t];
        paint(plain(), mode);
        r.reset();
        const c = r.token(t);
        return c ? hex(c) : 'inherit';
      };
      for (const t of touched) {
        const light = value(t, 'light');
        const dark = value(t, 'dark');
        lines.push([t, light === dark ? light : `light-dark(${light}, ${dark})`]);
      }
      r.remove();
    }
    paint(state);

    const name = DIRECTIONS[state.direction];
    const summary = [name, state.hue === 'default' ? '' : `accent hue ${state.hue}`, state.corners === 'default' ? '' : `${state.corners} corners`, state.density === 'default' ? '' : state.density, state.font === 'default' ? '' : `${state.font} type`, touched.length ? `${touched.length} fine-tuned ${touched.length === 1 ? 'colour' : 'colours'}` : ''].filter(Boolean).join(', ');
    const html = `<html lang="en" data-direction="${state.direction}" data-theme="${state.mode}">`;
    const body = lines.length ? lines.map(([t, v]) => `  --v-${t}: ${v};`).join('\n') : `  /* Nothing changed: the ${name} defaults are used as they are. */`;
    return {
      html,
      css: `/* Vectra theme: ${summary}. Made with the Vectra theme builder.
   Load after vectra.css (or vectra.core.css and directions/${state.direction}.css), then set
   ${html}
   Leave out data-theme to follow the visitor's light or dark setting. */
:root[data-direction="${state.direction}"] {
${body}
}
`,
    };
  }

  function renderExport() {
    const out = exportCss();
    $('#tb-html code').textContent = out.html;
    $('#tb-css code').textContent = out.css;
  }

  $('#tb-download').addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([exportCss().css], { type: 'text/css' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: `vectra-theme-${state.direction}.css` });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    announce('Theme file downloaded');
  });

  /* ---------- Update loop ---------- */
  function render() {
    if (!ready) return;
    paint(state);
    syncControls();
    report();
    sweep();
    renderExport();
    writeHash();
  }

  function set(changes) {
    Object.assign(state, changes);
    render();
  }

  form.addEventListener('change', (e) => {
    const t = e.target;
    if (t.name === 'accent') set({ hue: t.value === 'default' ? 'default' : Number(t.value) });
    else if (t.name in DEFAULTS) set({ [t.name]: t.value });
  });
  form.addEventListener('input', (e) => {
    const t = e.target;
    if (t.dataset.tbToken) {
      state.overrides[state.mode][t.dataset.tbToken] = t.value.toLowerCase();
      render();
    } else if (t === hueInput && hueInput.value !== '') {
      const h = Math.round(Number(hueInput.value));
      if (Number.isFinite(h)) set({ hue: ((h % 360) + 360) % 360 });
    }
  });
  form.addEventListener('submit', (e) => e.preventDefault());
  form.addEventListener('click', (e) => {
    const reset = e.target.closest('[data-tb-reset]');
    if (!reset) return;
    const t = reset.dataset.tbReset;
    delete state.overrides[state.mode][t];
    render();
    $(`#tb-o-${t}`).focus();
    announce(`--v-${t} reset`);
  });
  $('#tb-reset').addEventListener('click', () => {
    state = { ...DEFAULTS, mode: state.mode, overrides: empty() };
    render();
    announce('Theme builder reset to the defaults');
  });
  $('#tb-apply').addEventListener('click', () => {
    window.Vectra?.theme.set({ direction: state.direction, mode: state.mode, accent: String(state.hue), corners: state.corners, density: state.density, font: state.font });
    announce('This site now uses your theme. Fine-tuned colours stay in the builder.');
  });

  /* ---------- Hue wheel ---------- */
  const fromPointer = (e) => {
    const box = wheel.getBoundingClientRect();
    const x = e.clientX - (box.left + box.width / 2);
    const y = e.clientY - (box.top + box.height / 2);
    return Math.round(((Math.atan2(x, -y) * 180) / Math.PI + 360) % 360);
  };
  let frameRequest = 0;
  let pending = null;
  const setHueSoon = (h) => {
    pending = h;
    if (!frameRequest) frameRequest = requestAnimationFrame(() => { frameRequest = 0; set({ hue: pending }); });
  };
  wheel.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    wheel.setPointerCapture(e.pointerId);
    wheel.focus();
    wheel.dataset.dragging = '';
    setHueSoon(fromPointer(e));
  });
  wheel.addEventListener('pointermove', (e) => { if (wheel.hasPointerCapture(e.pointerId)) setHueSoon(fromPointer(e)); });
  const stop = () => { delete wheel.dataset.dragging; };
  wheel.addEventListener('pointerup', stop);
  wheel.addEventListener('pointercancel', stop);
  wheel.addEventListener('keydown', (e) => {
    const now = Number(wheel.getAttribute('aria-valuenow'));
    const big = e.shiftKey ? 10 : 1;
    const next = { ArrowRight: now + big, ArrowUp: now + big, ArrowLeft: now - big, ArrowDown: now - big, PageUp: now + 15, PageDown: now - 15, Home: 0, End: 359 }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    set({ hue: ((next % 360) + 360) % 360 });
  });

  /* ---------- Stage: view and width ---------- */
  const WIDTHS = { full: '', tablet: '768px', phone: '390px' };
  tb.addEventListener('change', (e) => {
    if (e.target.name === 'view') pdoc().querySelector('main').dataset.view = e.target.value;
    if (e.target.name === 'width') {
      frame.style.inlineSize = WIDTHS[e.target.value];
      $('#tb-canvas').dataset.width = e.target.value;
    }
  });

  /* ---------- Start ---------- */
  function initialState() {
    const linked = fromHash(location.hash);
    if (linked) return linked;
    const site = window.Vectra?.theme.get();
    if (!site) return { ...DEFAULTS, overrides: empty() };
    const hue = Number(site.accent);
    return { ...DEFAULTS, direction: site.direction, mode: site.resolved, hue: site.accent !== 'default' && Number.isInteger(hue) ? hue : 'default', corners: site.corners, density: site.density, font: site.font, overrides: empty() };
  }

  function start() {
    // Deferred scripts (vectra.js applies the saved theme) have all run by DOMContentLoaded; starting
    // earlier would read the defaults instead of the visitor's theme.
    if (ready || document.readyState === 'loading' || !pdoc()?.querySelector('.tbp')) return;
    ready = true;
    state = initialState();
    pdoc().querySelector('main').dataset.view = $('input[name="view"]:checked', tb)?.value ?? 'app';
    render();
    quiet = false;
    tb.dataset.ready = '';
  }
  frame.addEventListener('load', start);
  document.addEventListener('DOMContentLoaded', start);
  start();
  addEventListener('hashchange', () => {
    const linked = fromHash(location.hash);
    if (linked && ready && toHash() !== location.hash.slice(1)) { state = linked; render(); }
  });
  // Expose for tests and the curious: the current settings and the export.
  window.VectraThemeBuilder = { get: () => JSON.parse(JSON.stringify(state)), export: () => exportCss(), presets: PRESETS };
})();

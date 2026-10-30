/* Vectra v2 · direction prototype
   Small enhancements on top of native HTML. Everything still renders without JS. */
(() => {
  'use strict';

  const root = document.documentElement;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const prefersLight = matchMedia('(prefers-color-scheme: light)');
  const store = {
    get: (key) => { try { return localStorage.getItem(key); } catch { return null; } },
    set: (key, value) => { try { localStorage.setItem(key, value); } catch { /* private mode */ } },
  };

  const DIRECTIONS = { tech: 'Dark tech', editorial: 'Editorial', soft: 'Soft depth', aero: 'Aero' };
  const MODES = ['light', 'dark', 'auto'];

  // Runs a DOM update inside a view transition when the browser supports it.
  const withTransition = (update, className) => {
    if (!document.startViewTransition || reduceMotion.matches) { update(); return null; }
    if (className) root.classList.add(className);
    const transition = document.startViewTransition(update);
    transition.finished.finally(() => className && root.classList.remove(className));
    return transition;
  };
  const afterUpdate = (transition) => (transition ? transition.updateCallbackDone : Promise.resolve());

  const checkRadio = (name, value) => {
    document.querySelectorAll(`input[name="${name}"]`).forEach((input) => { input.checked = input.value === String(value); });
  };

  /* ── Toasts ────────────────────────────────────────────────── */
  const region = document.getElementById('toasts');
  const toast = (message, tone = 'success') => {
    if (!region) return;
    if (!region.matches(':popover-open')) region.showPopover();
    const el = document.createElement('div');
    el.className = 'toast';
    el.dataset.tone = tone;
    el.innerHTML = `<svg class="i" aria-hidden="true"><use href="#i-${tone === 'danger' ? 'x-circle' : 'check-circle'}"/></svg><span></span>`;
    el.querySelector('span').textContent = message;
    region.append(el);
    setTimeout(async () => {
      if (!reduceMotion.matches) {
        await el.animate({ opacity: [1, 0], translate: ['0 0', '0 8px'] }, { duration: 200, easing: 'ease-in' }).finished;
      }
      el.remove();
      if (!region.children.length) region.hidePopover();
    }, 3600);
  };
  document.querySelectorAll('[data-toast]').forEach((btn) => {
    btn.addEventListener('click', () => toast(btn.dataset.toast));
  });

  /* ── Customizer state ──────────────────────────────────────── */
  const CUSTOM_KEY = 'vectra2-custom';
  const DEFAULTS = { accent: 'default', corners: 'default', density: 'default', font: 'default' };
  const RADII = {
    sharp: ['0px', '2px', '4px', '6px', '4px'],
    rounded: ['8px', '12px', '18px', '24px', '999px'],
    round: ['12px', '18px', '28px', '36px', '999px'],
  };
  const DENSITY = { compact: '0.85', spacious: '1.15' };
  const INTER = '"Inter Var", ui-sans-serif, system-ui, sans-serif';
  const SYSTEM = 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
  const FONTS = {
    inter: { '--font-body': INTER, '--font-display': INTER },
    system: { '--font-body': SYSTEM, '--font-display': SYSTEM },
    serif: { '--font-body': INTER, '--font-display': 'var(--font-serif)' },
  };
  const MANAGED = ['--accent-h', '--radius-sm', '--radius-md', '--radius-lg', '--radius-xl', '--radius-pill', '--density', '--font-body', '--font-display'];

  const saved = (() => { try { return JSON.parse(store.get(CUSTOM_KEY)); } catch { return null; } })();
  const state = { ...DEFAULTS, ...(saved && saved.state) };
  let mode = MODES.includes(store.get('vectra2-theme')) ? store.get('vectra2-theme') : 'auto';

  // Turns customizer choices into CSS custom properties.
  const varsFor = (s) => {
    const vars = {};
    if (s.accent !== 'default') vars['--accent-h'] = String(s.accent);
    if (RADII[s.corners]) {
      ['sm', 'md', 'lg', 'xl', 'pill'].forEach((k, i) => { vars[`--radius-${k}`] = RADII[s.corners][i]; });
    }
    if (DENSITY[s.density]) vars['--density'] = DENSITY[s.density];
    Object.assign(vars, FONTS[s.font]);
    return vars;
  };

  /* ── Contrast check (WCAG 2.x relative luminance) ──────────── */
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
  // Flattens translucent backgrounds from the element up to the first opaque one.
  const solidBackground = (el) => {
    const layers = [];
    for (let node = el; node; node = node.parentElement) {
      const c = rgba(getComputedStyle(node).backgroundColor);
      if (c[3] > 0) layers.push(c);
      if (c[3] >= 1) break;
    }
    return layers.reverse().reduce((base, layer) => over(layer, base), [255, 255, 255]);
  };
  const luminance = (rgb) => {
    const [r, g, b] = rgb.map((v) => { const c = v / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const contrastOf = (el) => {
    const bg = solidBackground(el);
    const fg = over(rgba(getComputedStyle(el).color), bg);
    const [hi, lo] = [luminance(fg), luminance(bg)].sort((a, b) => b - a);
    return (hi + 0.05) / (lo + 0.05);
  };
  const CHECKS = {
    button: () => document.querySelector('.hero .btn-primary'),
    accent: () => document.querySelector('.kicker'),
    muted: () => document.querySelector('.hero-stats dt'),
  };
  const refreshContrast = () => {
    document.querySelectorAll('[data-ratio]').forEach((badge) => {
      const el = CHECKS[badge.dataset.ratio]?.();
      if (!el) return;
      const ratio = contrastOf(el);
      const [label, tone] = ratio >= 4.5 ? ['AA', 'success'] : ratio >= 3 ? ['AA large only', 'warning'] : ['Fails', 'danger'];
      badge.className = `badge badge-${tone}`;
      badge.textContent = `${ratio.toFixed(1)}:1 ${label}`;
    });
  };

  /* ── Export ────────────────────────────────────────────────── */
  const output = document.getElementById('cz-output');
  const refreshExport = () => {
    if (!output) return;
    const vars = varsFor(state);
    const theme = mode === 'auto' ? '' : ` data-theme="${mode}"`;
    const lines = [
      `<!-- ${DIRECTIONS[root.dataset.direction]}, ${mode === 'auto' ? 'follows the OS theme' : `${mode} theme`} -->`,
      `<html data-direction="${root.dataset.direction}"${theme}>`,
    ];
    const entries = Object.entries(vars);
    lines.push('', '/* After vectra.css */');
    if (entries.length) {
      lines.push(':root {', ...entries.map(([k, v]) => `  ${k}: ${v};`), '}');
    } else {
      lines.push('/* No token overrides: style defaults. */');
    }
    output.textContent = lines.join('\n');
  };

  /* ── Hue slider ────────────────────────────────────────────── */
  const hue = document.getElementById('cz-hue');
  const hueOut = document.getElementById('cz-hue-out');
  const refreshHue = () => {
    if (!hue) return;
    const h = Math.round(parseFloat(getComputedStyle(root).getPropertyValue('--accent-h'))) || 0;
    hue.value = h;
    hue.style.setProperty('--hue', h);
    hueOut.value = `${h}°`;
  };

  const refreshAll = () => { refreshHue(); refreshExport(); refreshContrast(); };

  const applyCustom = () => {
    MANAGED.forEach((k) => root.style.removeProperty(k));
    const vars = varsFor(state);
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
    store.set(CUSTOM_KEY, JSON.stringify({ state, vars }));
    refreshAll();
  };

  /* ── Direction ─────────────────────────────────────────────── */
  const setDirection = (value) => {
    if (!DIRECTIONS[value]) return;
    checkRadio('direction', value);
    checkRadio('cz-direction', value);
    if (root.dataset.direction === value) return;
    const t = withTransition(() => { root.dataset.direction = value; });
    store.set('vectra2-direction', value);
    afterUpdate(t).then(refreshAll);
  };
  document.querySelectorAll('input[name="direction"], input[name="cz-direction"]').forEach((input) => {
    input.addEventListener('change', () => setDirection(input.value));
  });

  /* ── Theme (circular reveal from whatever was clicked) ─────── */
  const themeBtn = document.querySelector('[data-theme-toggle]');
  const syncThemeButton = () => {
    if (!themeBtn) return;
    const dark = root.dataset.theme === 'dark';
    themeBtn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    themeBtn.querySelector('use').setAttribute('href', dark ? '#i-sun' : '#i-moon');
  };
  const applyTheme = (next, origin) => {
    if (root.dataset.theme === next) { refreshAll(); return; }
    const box = origin?.getBoundingClientRect();
    const x = box ? box.left + box.width / 2 : innerWidth / 2;
    const y = box ? box.top + box.height / 2 : 0;
    const t = withTransition(() => { root.dataset.theme = next; syncThemeButton(); }, 'vt-theme');
    t?.ready.then(() => {
      const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 560, easing: 'cubic-bezier(.2,.8,.2,1)', pseudoElement: '::view-transition-new(root)' },
      );
    });
    afterUpdate(t).then(refreshAll);
  };
  const resolveMode = (m) => (m === 'auto' ? (prefersLight.matches ? 'light' : 'dark') : m);
  const setMode = (m, origin) => {
    mode = m;
    store.set('vectra2-theme', m);
    checkRadio('cz-mode', m);
    applyTheme(resolveMode(m), origin);
  };
  prefersLight.addEventListener('change', () => { if (mode === 'auto') applyTheme(resolveMode('auto')); });
  themeBtn?.addEventListener('click', () => setMode(root.dataset.theme === 'dark' ? 'light' : 'dark', themeBtn));
  document.querySelectorAll('input[name="cz-mode"]').forEach((input) => {
    input.addEventListener('change', () => setMode(input.value, input.closest('label')));
  });

  /* ── Customizer controls ───────────────────────────────────── */
  const syncControls = () => {
    checkRadio('direction', root.dataset.direction);
    checkRadio('cz-direction', root.dataset.direction);
    checkRadio('cz-mode', mode);
    checkRadio('cz-accent', state.accent);
    checkRadio('cz-corners', state.corners);
    checkRadio('cz-density', state.density);
    checkRadio('cz-font', state.font);
  };
  [['cz-accent', 'accent'], ['cz-corners', 'corners'], ['cz-density', 'density'], ['cz-font', 'font']].forEach(([name, key]) => {
    document.querySelectorAll(`input[name="${name}"]`).forEach((input) => {
      input.addEventListener('change', () => { state[key] = input.value; applyCustom(); });
    });
  });
  hue?.addEventListener('input', () => {
    state.accent = hue.value;
    checkRadio('cz-accent', hue.value); // lights up a preset swatch if the hue matches one
    applyCustom();
  });
  document.querySelector('[data-cz-reset]')?.addEventListener('click', () => {
    Object.assign(state, DEFAULTS);
    setDirection('tech');
    setMode('auto');
    applyCustom();
    syncControls();
    toast('Theme reset to defaults');
  });

  const customizer = document.getElementById('customizer');
  let lastInvoker = null;
  document.querySelectorAll('[popovertarget="customizer"]:not([popovertargetaction="hide"])').forEach((btn) => {
    btn.addEventListener('click', () => { lastInvoker = btn; });
  });
  customizer?.addEventListener('toggle', (e) => {
    if (e.newState === 'open') {
      refreshAll();
      customizer.querySelector('input[name="cz-direction"]:checked')?.focus();
    } else {
      lastInvoker?.focus();
    }
  });
  // Manual popovers don't close on Escape by themselves.
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && customizer?.matches(':popover-open') && !document.querySelector('dialog[open], .menu:popover-open')) {
      customizer.hidePopover();
    }
  });

  syncThemeButton();
  syncControls();
  if (root.dataset.theme !== resolveMode(mode)) root.dataset.theme = resolveMode(mode);
  document.fonts.ready.then(refreshAll);

  /* ── Tabs (roving tabindex + sliding indicator) ────────────── */
  document.querySelectorAll('[role="tablist"]').forEach((list) => {
    const tabs = [...list.querySelectorAll('[role="tab"]')];
    const indicator = list.querySelector('.tabs-indicator');
    const active = () => tabs.find((t) => t.getAttribute('aria-selected') === 'true') || tabs[0];
    const moveIndicator = () => {
      const tab = active();
      indicator?.style.setProperty('--x', `${tab.offsetLeft}px`);
      indicator?.style.setProperty('--w', `${tab.offsetWidth}px`);
    };
    const select = (tab, focus = false) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      });
      if (focus) tab.focus();
      moveIndicator();
    };
    list.addEventListener('click', (e) => {
      const tab = e.target.closest('[role="tab"]');
      if (tab) select(tab);
    });
    list.addEventListener('keydown', (e) => {
      const i = tabs.indexOf(document.activeElement);
      const moves = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 };
      if (i < 0 || !(e.key in moves)) return;
      e.preventDefault();
      select(tabs[(moves[e.key] + tabs.length) % tabs.length], true);
    });
    select(active());
    const ro = new ResizeObserver(moveIndicator);
    tabs.forEach((t) => ro.observe(t));
  });

  /* ── Dialogs ───────────────────────────────────────────────── */
  document.querySelectorAll('[data-dialog-open]').forEach((btn) => {
    btn.addEventListener('click', () => document.getElementById(btn.dataset.dialogOpen)?.showModal());
  });
  document.querySelectorAll('dialog').forEach((dialog) => {
    // A click whose target is the dialog itself landed on the backdrop.
    dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close('cancel'); });
    dialog.querySelectorAll('[data-dialog-close]').forEach((btn) => btn.addEventListener('click', () => dialog.close('cancel')));
    dialog.addEventListener('close', () => {
      const form = dialog.querySelector('form');
      if (dialog.returnValue === 'send') toast(`Invite sent to ${form.elements.email.value}`);
      form?.reset();
    });
  });

  /* ── Menus (popover; JS positioning only without anchor support) ── */
  const hasAnchor = CSS.supports('position-area: bottom');
  document.querySelectorAll('.menu[popover]').forEach((menu) => {
    const trigger = document.querySelector(`[popovertarget="${menu.id}"]`);
    const items = () => [...menu.querySelectorAll('button')];
    menu.addEventListener('toggle', (e) => {
      if (e.newState !== 'open') return;
      if (!hasAnchor && trigger) {
        const r = trigger.getBoundingClientRect();
        menu.style.top = `${r.bottom + 6}px`;
        menu.style.left = `${Math.max(8, Math.min(r.left, innerWidth - menu.offsetWidth - 8))}px`;
      }
      items()[0]?.focus();
    });
    menu.addEventListener('keydown', (e) => {
      const list = items();
      const i = list.indexOf(document.activeElement);
      const moves = { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: list.length - 1 };
      if (!(e.key in moves)) return;
      e.preventDefault();
      list[(moves[e.key] + list.length) % list.length].focus();
    });
    menu.addEventListener('click', (e) => {
      const item = e.target.closest('button');
      if (!item) return;
      menu.hidePopover();
      trigger?.focus();
      toast(`${item.textContent.trim()} selected`, item.dataset.tone);
    });
  });

  /* ── Forms ─────────────────────────────────────────────────── */
  const seats = document.getElementById('ws-seats');
  const seatsOut = document.getElementById('ws-seats-out');
  seats?.addEventListener('input', () => { seatsOut.value = seats.value; });

  const wsForm = document.getElementById('workspace-form');
  wsForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    toast(`Workspace "${wsForm.elements.name.value}" created`);
    wsForm.reset();
    seatsOut.value = seats.value;
  });
  wsForm?.addEventListener('reset', () => requestAnimationFrame(() => { seatsOut.value = seats.value; }));

  /* ── Copy ──────────────────────────────────────────────────── */
  document.querySelectorAll('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const source = document.querySelector(btn.dataset.copy);
      try {
        await navigator.clipboard.writeText(source.textContent);
        toast('Copied to clipboard');
      } catch {
        toast('Copy failed, select the text instead', 'danger');
      }
    });
  });
})();

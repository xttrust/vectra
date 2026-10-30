/* Vectra v2 · direction prototype
   Small enhancements on top of native HTML. Everything still renders without JS. */
(() => {
  'use strict';

  const root = document.documentElement;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const store = {
    get: (key) => { try { return localStorage.getItem(key); } catch { return null; } },
    set: (key, value) => { try { localStorage.setItem(key, value); } catch { /* private mode */ } },
  };

  // Runs a DOM update inside a view transition when the browser supports it.
  const withTransition = (update, className) => {
    if (!document.startViewTransition || reduceMotion.matches) { update(); return null; }
    if (className) root.classList.add(className);
    const transition = document.startViewTransition(update);
    transition.finished.finally(() => className && root.classList.remove(className));
    return transition;
  };

  /* ── Direction ─────────────────────────────────────────────── */
  document.querySelectorAll('input[name="direction"]').forEach((input) => {
    input.checked = input.value === root.dataset.direction;
    input.addEventListener('change', () => {
      withTransition(() => { root.dataset.direction = input.value; });
      store.set('vectra2-direction', input.value);
    });
  });

  /* ── Theme (circular reveal from the toggle) ───────────────── */
  const themeBtn = document.querySelector('[data-theme-toggle]');
  const syncThemeButton = () => {
    const dark = root.dataset.theme === 'dark';
    themeBtn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    themeBtn.querySelector('use').setAttribute('href', dark ? '#i-sun' : '#i-moon');
  };
  if (themeBtn) {
    syncThemeButton();
    themeBtn.addEventListener('click', () => {
      const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      const { left, top, width, height } = themeBtn.getBoundingClientRect();
      const x = left + width / 2;
      const y = top + height / 2;
      const transition = withTransition(() => { root.dataset.theme = next; syncThemeButton(); }, 'vt-theme');
      store.set('vectra2-theme', next);
      transition?.ready.then(() => {
        const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
        root.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
          { duration: 560, easing: 'cubic-bezier(.2,.8,.2,1)', pseudoElement: '::view-transition-new(root)' },
        );
      });
    });
  }

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

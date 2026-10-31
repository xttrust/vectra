/* Tabs (WAI-ARIA tabs pattern) on a role="tablist" with data-v-tabs. Roving tabindex, arrow keys,
   Home and End. Selection follows focus unless data-v-tabs="manual", where Enter or Space selects.
   The server-rendered aria-selected tab and its panel are the no-JS state, so nothing here is needed
   to read the page. */
import { emit } from '../core.js';

export function init(el) {
  const manual = el.dataset.vTabs === 'manual';
  const tabs = () => [...el.querySelectorAll('[role="tab"]')];
  const panel = (tab) => document.getElementById(tab.getAttribute('aria-controls'));

  const select = (tab, quiet) => {
    if (!quiet && tab.getAttribute('aria-selected') === 'true') return;
    for (const t of tabs()) {
      const on = t === tab;
      t.setAttribute('aria-selected', on);
      t.tabIndex = on ? 0 : -1;
      const p = panel(t);
      if (p) p.hidden = !on;
    }
    if (!quiet) emit(el, 'change', { tab, panel: panel(tab) });
  };

  const onKey = (e) => {
    const all = tabs();
    const usable = all.filter((t) => !t.disabled && t.getAttribute('aria-disabled') !== 'true');
    const i = usable.indexOf(e.target);
    if (i < 0) return;
    const vertical = el.getAttribute('aria-orientation') === 'vertical';
    // In right-to-left text the next tab sits to the left, so the arrows swap.
    const rtl = !vertical && el.matches(':dir(rtl)');
    const next = vertical ? 'ArrowDown' : rtl ? 'ArrowLeft' : 'ArrowRight';
    const prev = vertical ? 'ArrowUp' : rtl ? 'ArrowRight' : 'ArrowLeft';
    const n = usable.length;
    const to = { [next]: (i + 1) % n, [prev]: (i - 1 + n) % n, Home: 0, End: n - 1 }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    const tab = usable[to];
    for (const t of all) t.tabIndex = t === tab ? 0 : -1;
    tab.focus();
    if (!manual) select(tab);
  };

  // Buttons turn Enter and Space into clicks, which covers manual activation and pointer use.
  const onClick = (e) => {
    const tab = e.target.closest('[role="tab"]');
    if (tab && el.contains(tab) && !tab.disabled) select(tab);
  };

  const initial = tabs().find((t) => t.getAttribute('aria-selected') === 'true') ?? tabs()[0];
  if (initial) select(initial, true);
  el.addEventListener('keydown', onKey);
  el.addEventListener('click', onClick);
  return {
    destroy() {
      el.removeEventListener('keydown', onKey);
      el.removeEventListener('click', onClick);
    },
  };
}

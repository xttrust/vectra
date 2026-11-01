/* Command palette (data-v-command on a <dialog class="v-dialog v-command">). Ctrl+K or Cmd+K opens and
   closes it (data-v-command="j" picks another letter); data-v-dialog-open buttons open it too. The input is
   a combobox over a listbox (WAI-ARIA combobox pattern with aria-activedescendant): typing filters the
   options by their text and data-keywords, the arrow keys move the highlight, Enter runs it. Running an
   option clicks it, so links navigate and buttons fire their own handlers, then the dialog closes unless
   a v:command listener calls preventDefault(). */
import { emit } from '../core.js';

let uid = 0;
const words = (s) => s.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').split(/\s+/).filter(Boolean);

export function init(el) {
  const input = el.querySelector('[role="combobox"]');
  const list = el.querySelector('[role="listbox"]');
  if (!input || !list) return {};
  const empty = el.querySelector('.v-command-empty');
  const key = (el.dataset.vCommand || 'k').toLowerCase();
  const options = [...list.querySelectorAll('[role="option"]')];
  const text = new Map(options.map((o) => [o, words(`${o.textContent} ${o.dataset.keywords ?? ''}`).join(' ')]));
  let active = null;

  for (const o of options) {
    o.id ||= `v-command-${(uid += 1)}`;
    o.tabIndex = -1;
  }

  const visible = () => options.filter((o) => !o.hidden);
  const highlight = (o) => {
    active?.setAttribute('aria-selected', 'false');
    active = o ?? null;
    if (active) {
      active.setAttribute('aria-selected', 'true');
      input.setAttribute('aria-activedescendant', active.id);
      active.scrollIntoView({ block: 'nearest' });
    } else input.removeAttribute('aria-activedescendant');
  };

  const filter = () => {
    const q = words(input.value);
    for (const o of options) o.hidden = !q.every((w) => text.get(o).includes(w));
    for (const g of list.querySelectorAll('[role="group"]')) g.hidden = !g.querySelector('[role="option"]:not([hidden])');
    const shown = visible();
    // The empty message lives in a role="status" element that stays in the page, so it is announced.
    if (empty) empty.textContent = shown.length ? '' : (empty.dataset.template || 'No results for "{q}"').replace('{q}', input.value.trim());
    input.setAttribute('aria-expanded', String(shown.length > 0));
    highlight(shown[0]);
  };

  const run = (o) => {
    if (!o || !emit(el, 'command', { item: o })) return;
    o.click();
    if (el.open) el.close();
  };

  const onInputKey = (e) => {
    const shown = visible();
    const i = shown.indexOf(active);
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (shown.length) highlight(shown[(i + (e.key === 'ArrowDown' ? 1 : -1) + shown.length) % shown.length]);
    } else if (e.key === 'Enter' && !e.isComposing) {
      e.preventDefault();
      run(active);
    }
  };

  const onDocKey = (e) => {
    if (e.key.toLowerCase() !== key || !(e.ctrlKey || e.metaKey) || e.altKey || e.shiftKey) return;
    e.preventDefault();
    if (el.open) el.close();
    else el.showModal();
  };

  // A click runs the option the same way as Enter; hovering moves the highlight with the pointer.
  const onClick = (e) => {
    const o = e.target.closest('[role="option"]');
    if (!o || !list.contains(o) || !e.isTrusted) return;
    if (!emit(el, 'command', { item: o })) {
      e.preventDefault();
      return;
    }
    if (el.open) el.close();
  };
  const onMove = (e) => {
    const o = e.target.closest('[role="option"]');
    if (o && o !== active && !o.hidden) highlight(o);
  };

  // Every time it opens: empty query, full list, focus in the input.
  const onOpen = new MutationObserver(() => {
    if (!el.open) return;
    input.value = '';
    filter();
    input.focus();
  });

  input.addEventListener('input', filter);
  input.addEventListener('keydown', onInputKey);
  list.addEventListener('click', onClick);
  list.addEventListener('pointermove', onMove);
  document.addEventListener('keydown', onDocKey);
  onOpen.observe(el, { attributes: true, attributeFilter: ['open'] });
  filter();
  return {
    destroy() {
      input.removeEventListener('input', filter);
      input.removeEventListener('keydown', onInputKey);
      list.removeEventListener('click', onClick);
      list.removeEventListener('pointermove', onMove);
      document.removeEventListener('keydown', onDocKey);
      onOpen.disconnect();
    },
  };
}

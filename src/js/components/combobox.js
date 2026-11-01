/* Combobox (data-v-combobox on a wrapper around an <input list> and its <datalist>). Replaces the native
   suggestions with a listbox below the input, following the WAI-ARIA combobox pattern with list
   autocomplete: typing filters the options (ignoring case and accents) and marks the matching letters,
   ArrowDown and ArrowUp move the highlight (aria-activedescendant), Enter or a click puts the option in
   the input, Escape closes the list and then clears the input. The typed text is always the value, as it
   is without JS. A datalist option's label shows as a hint beside it. Fires v:select with the value. */
import { emit } from '../core.js';

let uid = 0;
const fold = (s) => s.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');

export function init(el) {
  const input = el.querySelector('input[list]');
  const datalist = input && document.getElementById(input.getAttribute('list'));
  if (!datalist) return {};
  const id = `v-combobox-${(uid += 1)}`;
  const items = [...datalist.options].map((o) => ({ value: o.value, hint: o.label !== o.value ? o.label : '' }));
  const noMatch = el.dataset.empty || 'No matches';

  const list = document.createElement('ul');
  Object.assign(list, { id: `${id}-list`, className: 'v-combobox-list', hidden: true });
  list.setAttribute('role', 'listbox');
  list.setAttribute('aria-label', input.labels?.[0]?.textContent.trim() || input.getAttribute('aria-label') || 'Suggestions');
  const empty = Object.assign(document.createElement('div'), { className: 'v-combobox-list v-combobox-empty', hidden: true });
  empty.setAttribute('role', 'status');
  let options = [];
  let active = -1;

  const render = () => {
    const q = fold(input.value.trim());
    const matches = items.filter((it) => fold(`${it.value} ${it.hint}`).includes(q));
    options = matches.map((it, i) => {
      const li = document.createElement('li');
      Object.assign(li, { id: `${id}-${i}`, className: 'v-combobox-option' });
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', 'false');
      li.dataset.value = it.value;
      // Mark the matching letters when the query matches the plain text exactly (no accent folding).
      const raw = input.value.trim();
      const at = raw ? it.value.toLowerCase().indexOf(raw.toLowerCase()) : -1;
      if (at >= 0) {
        const mark = document.createElement('mark');
        mark.textContent = it.value.slice(at, at + raw.length);
        li.append(it.value.slice(0, at), mark, it.value.slice(at + raw.length));
      } else li.textContent = it.value;
      if (it.hint) li.append(Object.assign(document.createElement('span'), { className: 'v-combobox-hint', textContent: it.hint }));
      return li;
    });
    list.replaceChildren(...options);
    return matches.length;
  };
  const highlight = (i) => {
    options[active]?.setAttribute('aria-selected', 'false');
    active = i;
    const o = options[active];
    if (o) {
      o.setAttribute('aria-selected', 'true');
      input.setAttribute('aria-activedescendant', o.id);
      o.scrollIntoView({ block: 'nearest' });
    } else input.removeAttribute('aria-activedescendant');
  };
  const open = () => {
    const n = render();
    active = -1;
    input.removeAttribute('aria-activedescendant');
    list.hidden = n === 0;
    empty.hidden = n > 0 || !input.value.trim();
    empty.textContent = empty.hidden ? '' : noMatch;
    input.setAttribute('aria-expanded', String(n > 0));
  };
  const close = () => {
    list.hidden = true;
    empty.hidden = true;
    empty.textContent = '';
    active = -1;
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
  };
  const choose = (o) => {
    input.value = o.dataset.value;
    close();
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    emit(el, 'select', { value: o.dataset.value });
  };

  const onInput = (e) => { if (e.isTrusted) open(); };
  const onKey = (e) => {
    const shown = !list.hidden;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!shown) {
        open();
        if (!e.altKey && options.length) highlight(e.key === 'ArrowDown' ? 0 : options.length - 1);
        return;
      }
      const n = options.length;
      highlight(active < 0 ? (e.key === 'ArrowDown' ? 0 : n - 1) : (active + (e.key === 'ArrowDown' ? 1 : -1) + n) % n);
    } else if (e.key === 'Enter' && shown && active >= 0) {
      e.preventDefault();
      choose(options[active]);
    } else if (e.key === 'Escape') {
      if (shown || !empty.hidden) {
        e.preventDefault();
        close();
      } else if (input.value) {
        e.preventDefault();
        input.value = '';
      }
    }
  };
  // pointerdown, not click: picking an option must not blur the input and close the list first.
  const onPick = (e) => {
    const o = e.target.closest('[role="option"]');
    if (!o) return;
    e.preventDefault();
    choose(o);
  };
  const onBlur = () => close();

  input.removeAttribute('list');
  input.setAttribute('role', 'combobox');
  input.setAttribute('aria-autocomplete', 'list');
  input.setAttribute('aria-expanded', 'false');
  input.setAttribute('aria-controls', list.id);
  input.autocomplete = 'off';
  el.append(list, empty);
  input.addEventListener('input', onInput);
  input.addEventListener('keydown', onKey);
  input.addEventListener('blur', onBlur);
  list.addEventListener('pointerdown', onPick);
  return {
    destroy() {
      input.removeEventListener('input', onInput);
      input.removeEventListener('keydown', onKey);
      input.removeEventListener('blur', onBlur);
      list.removeEventListener('pointerdown', onPick);
      list.remove();
      empty.remove();
      for (const a of ['role', 'aria-autocomplete', 'aria-expanded', 'aria-controls', 'aria-activedescendant']) input.removeAttribute(a);
      input.setAttribute('list', datalist.id);
    },
  };
}

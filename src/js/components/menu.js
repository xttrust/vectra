/* Menu button (WAI-ARIA pattern) on a popover with role="menu" and data-v-menu. The popover opens and
   light-dismisses natively; this adds focus on open, arrow keys, Home/End, typeahead, Tab to close,
   checkable items and focus return. Triggers are the popovertarget buttons outside the menu. */
import { emit } from '../core.js';

const ITEM = '[role^="menuitem"]';

export function init(el) {
  const sel = `[popovertarget="${CSS.escape(el.id)}"]`;
  let trigger = [...document.querySelectorAll(sel)].find((t) => !el.contains(t));
  let fromEnd = false;
  let refocus = false;

  const items = () => [...el.querySelectorAll(ITEM)].filter((i) => !i.disabled && i.getAttribute('aria-disabled') !== 'true');
  const open = () => el.matches(':popover-open');
  const close = () => {
    if (open()) el.hidePopover();
    trigger?.focus();
  };
  const focusEnd = () => {
    const list = items();
    list[fromEnd ? list.length - 1 : 0]?.focus();
    fromEnd = false;
  };
  const move = (list, i) => list[(i + list.length) % list.length]?.focus();

  // ArrowDown or ArrowUp on the trigger opens the menu on its first or last item.
  const onTriggerKey = (e) => {
    const t = e.target.closest?.(sel);
    if (!t || el.contains(t) || !/^Arrow(Up|Down)$/.test(e.key)) return;
    e.preventDefault();
    trigger = t;
    fromEnd = e.key === 'ArrowUp';
    if (!open()) el.showPopover({ source: t });
    // Focus now rather than on the async toggle event, so a quick second key press lands in the menu.
    focusEnd();
  };

  const onClickDoc = (e) => {
    const t = e.target.closest?.(sel);
    if (t && !el.contains(t)) trigger = t;
  };

  const onToggle = (e) => {
    if (e.newState === 'open') {
      if (!el.contains(document.activeElement)) focusEnd();
      return;
    }
    // Native focus return only works when the trigger had focus first (not after a click in Safari).
    const lost = document.activeElement === document.body || el.contains(document.activeElement);
    if (refocus && lost) trigger?.focus();
    refocus = false;
  };

  const onBefore = (e) => {
    if (e.newState === 'closed') refocus = el.contains(document.activeElement);
  };

  const onKey = (e) => {
    const list = items();
    const i = list.indexOf(document.activeElement);
    const keys = { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: -1 };
    if (e.key in keys) {
      e.preventDefault();
      move(list, keys[e.key]);
    } else if (e.key === 'Tab') {
      // Focus the trigger first so the browser's own Tab moves on from it, as the pattern asks.
      close();
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey && e.key !== ' ') {
      const k = e.key.toLowerCase();
      const order = [...list.slice(i + 1), ...list.slice(0, i + 1)];
      order.find((item) => item.textContent.trim().toLowerCase().startsWith(k))?.focus();
    }
  };

  const onClick = (e) => {
    const item = e.target.closest(ITEM);
    if (!item || !el.contains(item)) return;
    if (!items().includes(item)) {
      e.preventDefault();
      return;
    }
    const role = item.getAttribute('role');
    if (role === 'menuitemradio') {
      const group = item.closest('[role="group"]') ?? el;
      for (const r of group.querySelectorAll('[role="menuitemradio"]')) r.setAttribute('aria-checked', r === item);
    } else if (role === 'menuitemcheckbox') {
      item.setAttribute('aria-checked', item.getAttribute('aria-checked') !== 'true');
    }
    if (!emit(el, 'select', { item })) return;
    if (role === 'menuitem') close();
  };

  for (const i of el.querySelectorAll(ITEM)) i.tabIndex = -1;
  const on = [
    [document, 'keydown', onTriggerKey],
    [document, 'click', onClickDoc, true],
    [el, 'toggle', onToggle],
    [el, 'beforetoggle', onBefore],
    [el, 'keydown', onKey],
    [el, 'click', onClick],
  ];
  for (const [t, type, fn, capture] of on) t.addEventListener(type, fn, capture);
  return { destroy: () => { for (const [t, type, fn, capture] of on) t.removeEventListener(type, fn, capture); } };
}

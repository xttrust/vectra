/* Hover card (data-v-hovercard="card-id" on a link). Opens the .v-hovercard (popover="manual") after a
   short delay on mouse hover or keyboard focus, keeps it open while the pointer moves onto the card, and
   closes it on leave, blur or Escape. Touch does nothing extra: a tap follows the link. Several links may
   share one card; the card follows whichever opened it. */
import { anchors } from './anchor.js';

const OPEN_DELAY = 500;
const FOCUS_DELAY = 300;
const CLOSE_DELAY = 250;
let count = 0;

export function init(el) {
  const card = document.getElementById(el.dataset.vHovercard);
  if (!card) return {};
  const name = `--v-hovercard-${(count += 1)}`;
  let timer = 0;

  const isOpen = () => card.matches(':popover-open') && anchors.get(card) === el;
  const later = (fn, ms) => { clearTimeout(timer); timer = setTimeout(fn, ms); };
  const show = () => {
    if (isOpen()) return;
    if (card.matches(':popover-open')) card.hidePopover();
    // An explicit anchor works wherever CSS anchor positioning does; anchor.js uses the map elsewhere.
    el.style.setProperty('anchor-name', name);
    card.style.setProperty('position-anchor', name);
    anchors.set(card, el);
    card.showPopover();
  };
  const hide = () => { if (isOpen()) card.hidePopover(); };

  const onEnter = (e) => { if (e.pointerType === 'mouse') later(show, isOpen() ? 0 : OPEN_DELAY); };
  const onLeave = (e) => { if (e.pointerType === 'mouse') later(hide, CLOSE_DELAY); };
  const onCardEnter = () => { if (anchors.get(card) === el) clearTimeout(timer); };
  const onCardLeave = (e) => { if (anchors.get(card) === el && e.pointerType === 'mouse') later(hide, CLOSE_DELAY); };
  const onFocus = () => { if (el.matches(':focus-visible')) later(show, FOCUS_DELAY); };
  const onBlur = () => later(hide, 0);
  const onKey = (e) => {
    if (e.key !== 'Escape' || !isOpen()) return;
    clearTimeout(timer);
    hide();
  };

  const on = [
    [el, 'pointerenter', onEnter],
    [el, 'pointerleave', onLeave],
    [el, 'focus', onFocus],
    [el, 'blur', onBlur],
    [card, 'pointerenter', onCardEnter],
    [card, 'pointerleave', onCardLeave],
    [document, 'keydown', onKey],
  ];
  for (const [t, type, fn] of on) t.addEventListener(type, fn);
  return {
    destroy() {
      clearTimeout(timer);
      hide();
      for (const [t, type, fn] of on) t.removeEventListener(type, fn);
    },
  };
}

/* Slow loading: data-v-slow="#orders" on a hidden note (.v-slow) points at the region that loads; an
   empty value means the note's parent. While the region has aria-busy="true", the note appears after
   data-v-slow-after milliseconds (default 5000) and its first <p> (or all its text) is announced
   politely. When aria-busy turns false (the content arrived) the note hides again; setting it back to
   true starts a new wait. Keep the note outside the busy region if it holds buttons, since screen
   readers may skip busy content. */
import { announce } from '../core.js';

export function init(note) {
  const region = note.dataset.vSlow ? document.querySelector(note.dataset.vSlow) : note.parentElement;
  if (!region) return {};
  let timer;
  const check = () => {
    clearTimeout(timer);
    note.hidden = true;
    if (region.getAttribute('aria-busy') !== 'true') return;
    timer = setTimeout(() => {
      note.hidden = false;
      announce((note.querySelector('p') ?? note).textContent.trim());
    }, +note.dataset.vSlowAfter || 5000);
  };
  const watch = new MutationObserver(check);
  watch.observe(region, { attributeFilter: ['aria-busy'] });
  check();
  return { destroy: () => { clearTimeout(timer); watch.disconnect(); } };
}

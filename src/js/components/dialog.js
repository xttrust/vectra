/* Dialog and drawer hooks on the native <dialog>, which already traps focus and closes on Escape.
   data-v-dialog-open="<id>" opens one with showModal(); data-v-dialog-close="<value>" closes the
   enclosing one; data-v-dismissable on the dialog closes it from a backdrop click. */
import { emit } from '../core.js';

const listen = (el, type, fn) => {
  el.addEventListener(type, fn);
  return { destroy: () => el.removeEventListener(type, fn) };
};

export const open = (el) => listen(el, 'click', () => {
  const dialog = document.getElementById(el.dataset.vDialogOpen);
  if (!dialog || dialog.open) return;
  dialog.showModal();
  emit(dialog, 'open', { opener: el });
  dialog.addEventListener('close', () => {
    emit(dialog, 'close', { returnValue: dialog.returnValue, opener: el });
    // Native focus return needs the opener to have had focus; Safari does not focus clicked buttons.
    if (document.activeElement === document.body) el.focus();
  }, { once: true });
});

export const close = (el) => listen(el, 'click', () => el.closest('dialog')?.close(el.dataset.vDialogClose || undefined));

export function dismissable(el) {
  let down = false;
  // The click must start and end on the backdrop, so a text selection dragged out of the dialog stays open.
  const outside = (e) => {
    const r = el.getBoundingClientRect();
    return e.target === el && (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom);
  };
  const a = listen(el, 'pointerdown', (e) => { down = outside(e); });
  const b = listen(el, 'click', (e) => {
    if (down && outside(e)) el.close();
    down = false;
  });
  return { destroy() { a.destroy(); b.destroy(); } };
}

/* Dismiss: data-v-dismiss on a close button inside a [data-v-dismissable] banner, alert, tag or callout.
   Fires a cancelable v:dismiss; unless a listener prevents it, the container goes and focus moves to the
   next control (or the previous one) so keyboard users are not sent back to the top of the page.
   data-v-dismiss-key="name" remembers the dismissal, and the container is removed on later visits. */
import { emit, storage } from '../core.js';

export function init(el) {
  const box = el.closest('[data-v-dismissable]');
  const name = el.dataset.vDismissKey;
  const key = `dismissed-${name}`;
  if (!box) return {};
  if (name && storage.get(key)) {
    box.remove();
    return {};
  }
  const click = () => {
    if (!emit(box, 'dismiss', { key: name })) return;
    if (box.contains(document.activeElement)) {
      const all = [...document.querySelectorAll('a[href], button, input, select, textarea, [tabindex="0"]')]
        .filter((n) => !n.disabled && !box.contains(n) && n.checkVisibility());
      const after = (n) => box.compareDocumentPosition(n) & 4; // Node.DOCUMENT_POSITION_FOLLOWING
      (all.find(after) ?? all.findLast((n) => !after(n)))?.focus();
    }
    if (name) storage.set(key, 1);
    box.remove();
  };
  el.addEventListener('click', click);
  return { destroy: () => el.removeEventListener('click', click) };
}

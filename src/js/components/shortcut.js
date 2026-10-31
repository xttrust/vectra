/* Keyboard shortcut to a field: data-v-shortcut="/" on an input focuses it when that key is pressed
   anywhere on the page, unless the person is already typing in a field (WCAG 2.1.4: a single
   character shortcut only works when focus is not in a text control, and the page shows the key). */
const typing = (el) => el?.closest?.('input, textarea, select, [contenteditable=""], [contenteditable="true"]');

export function init(el) {
  const key = el.dataset.vShortcut || '/';
  const onKey = (e) => {
    if (e.key !== key || e.ctrlKey || e.metaKey || e.altKey || e.defaultPrevented || typing(document.activeElement)) return;
    e.preventDefault();
    el.focus();
  };
  document.addEventListener('keydown', onKey);
  return { destroy: () => document.removeEventListener('keydown', onKey) };
}

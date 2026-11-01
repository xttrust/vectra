/* Mega menu (data-v-mega on <details class="v-mega">). The panel already opens and closes natively; this
   adds what the disclosure navigation pattern expects on top: Escape closes it and returns focus to the
   summary, and a click outside or focus moving out of it closes it. A followed link closes it too. */
export function init(el) {
  const summary = el.querySelector(':scope > summary');
  const close = (refocus) => {
    if (!el.open) return;
    el.open = false;
    if (refocus) summary?.focus();
  };

  const onKey = (e) => {
    if (e.key !== 'Escape' || !el.open) return;
    e.preventDefault();
    // Stop here so an enclosing popover (the mobile menu sheet) stays open.
    e.stopPropagation();
    close(true);
  };
  const onDocClick = (e) => { if (!el.contains(e.target)) close(false); };
  const onFocusOut = (e) => { if (e.relatedTarget && !el.contains(e.relatedTarget)) close(false); };
  const onClick = (e) => { if (e.target.closest('a[href]')) close(false); };

  el.addEventListener('keydown', onKey);
  el.addEventListener('focusout', onFocusOut);
  el.addEventListener('click', onClick);
  document.addEventListener('click', onDocClick);
  return {
    destroy() {
      el.removeEventListener('keydown', onKey);
      el.removeEventListener('focusout', onFocusOut);
      el.removeEventListener('click', onClick);
      document.removeEventListener('click', onDocClick);
    },
  };
}

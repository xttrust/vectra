/* Lightbox (data-v-lightbox="<dialog id>" on links to full-size images). A click opens the
   .v-lightbox dialog on that image instead of following the link; previous and next step through every
   link with the same dialog id, in page order, and wrap. ArrowLeft and ArrowRight (flipped in
   right-to-left) and a horizontal swipe do the same. The image's alt text comes from the thumbnail and
   the caption from data-caption. The count reads "2 of 6", or the count element's data-template. */
const viewers = new WeakMap(); // dialog -> { show(link) }

function viewer(dialog) {
  if (viewers.has(dialog)) return viewers.get(dialog);
  const img = dialog.querySelector('.v-lightbox-img');
  const caption = dialog.querySelector('.v-lightbox-caption');
  const count = dialog.querySelector('.v-lightbox-count');
  const links = () => [...document.querySelectorAll(`[data-v-lightbox="${CSS.escape(dialog.id)}"]`)];
  let current = null;
  let startX = null;

  const show = (link) => {
    const all = links();
    current = link;
    img.src = link.href;
    img.alt = link.querySelector('img')?.alt ?? '';
    if (caption) caption.textContent = link.dataset.caption ?? '';
    if (count) count.textContent = (count.dataset.template || '{n} of {total}').replace('{n}', all.indexOf(link) + 1).replace('{total}', all.length);
    dialog.toggleAttribute('data-single', all.length < 2);
  };
  const step = (by) => {
    const all = links();
    if (all.length < 2) return;
    show(all[(all.indexOf(current) + by + all.length) % all.length]);
  };
  const rtl = () => dialog.matches(':dir(rtl)');

  dialog.querySelector('.v-lightbox-prev')?.addEventListener('click', () => step(-1));
  dialog.querySelector('.v-lightbox-next')?.addEventListener('click', () => step(1));
  dialog.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    step((e.key === 'ArrowRight') !== rtl() ? 1 : -1);
  });
  dialog.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') startX = e.clientX; });
  dialog.addEventListener('pointerup', (e) => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    startX = null;
    if (Math.abs(dx) > 50) step((dx < 0) !== rtl() ? 1 : -1);
  });
  dialog.addEventListener('close', () => {
    // Safari does not focus a clicked link, so the native focus return can land on the body.
    if (document.activeElement === document.body || dialog.contains(document.activeElement)) current?.focus();
    img.removeAttribute('src');
  });

  const api = {
    open(link) {
      show(link);
      if (!dialog.open) dialog.showModal();
    },
  };
  viewers.set(dialog, api);
  return api;
}

export function init(el) {
  const onClick = (e) => {
    const dialog = document.getElementById(el.dataset.vLightbox);
    if (!dialog || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    viewer(dialog).open(el);
  };
  el.addEventListener('click', onClick);
  return { destroy: () => el.removeEventListener('click', onClick) };
}

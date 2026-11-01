/* Read more (data-v-readmore on .v-readmore). Clamps .v-readmore-body to --v-lines only when the text is
   longer than that, and keeps it so as the width changes; the .v-readmore-toggle button shows the rest and
   swaps aria-expanded and its words (data-more and data-less, default "Read more" and "Show less"). When
   the text fits, the button stays hidden. */
export function init(el) {
  const body = el.querySelector('.v-readmore-body');
  const button = el.querySelector('.v-readmore-toggle');
  if (!body || !button) return {};
  const more = button.dataset.more || button.textContent.trim() || 'Read more';
  const less = button.dataset.less || 'Show less';
  let open = false;
  body.id ||= `v-readmore-${Math.random().toString(36).slice(2, 8)}`;
  button.setAttribute('aria-controls', body.id);

  const measure = () => {
    if (open) return;
    el.dataset.clamped = 'true';
    // Clamped, the box is shorter than its content only when there is more to show.
    const long = body.scrollHeight > body.clientHeight + 1;
    el.dataset.clamped = String(long);
    button.hidden = !long;
  };
  const sync = () => {
    button.setAttribute('aria-expanded', String(open));
    button.textContent = open ? less : more;
  };
  const onClick = () => {
    open = !open;
    el.dataset.clamped = String(!open);
    sync();
    if (!open) measure();
  };

  sync();
  measure();
  button.addEventListener('click', onClick);
  // Only a change of width can change how many lines the text needs; reacting to height would loop.
  let width = 0;
  const resized = new ResizeObserver(([entry]) => {
    if (Math.abs(entry.contentRect.width - width) < 1) return;
    width = entry.contentRect.width;
    measure();
  });
  resized.observe(el);
  return {
    destroy() {
      button.removeEventListener('click', onClick);
      resized.disconnect();
      delete el.dataset.clamped;
    },
  };
}

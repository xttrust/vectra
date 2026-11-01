/* Marquee (data-v-marquee on .v-marquee). Copies the track's items once, marked aria-hidden and inert,
   so the loop is seamless but nothing is read or focused twice, then sets data-ready to start the CSS
   animation. The .v-marquee-toggle button (shown only when motion is allowed) stops and restarts it,
   swapping its words (data-pause and data-play, default "Pause" and "Play"). */
export function init(el) {
  const track = el.querySelector('.v-marquee-track');
  if (!track) return {};
  const toggle = el.querySelector('.v-marquee-toggle');
  const motion = matchMedia('(prefers-reduced-motion: no-preference)');
  const pause = toggle?.dataset.pause || 'Pause';
  const play = toggle?.dataset.play || 'Play';

  const copies = [...track.children].map((item) => {
    const copy = item.cloneNode(true);
    copy.setAttribute('aria-hidden', 'true');
    copy.inert = true;
    for (const node of copy.querySelectorAll('[id]')) node.removeAttribute('id');
    return copy;
  });
  track.append(...copies);
  el.dataset.ready = '';

  const sync = () => {
    if (!toggle) return;
    toggle.hidden = !motion.matches;
    toggle.textContent = 'paused' in el.dataset ? play : pause;
  };
  const onToggle = () => {
    el.toggleAttribute('data-paused');
    sync();
  };

  sync();
  toggle?.addEventListener('click', onToggle);
  motion.addEventListener('change', sync);
  return {
    destroy() {
      for (const c of copies) c.remove();
      delete el.dataset.ready;
      toggle?.removeEventListener('click', onToggle);
      motion.removeEventListener('change', sync);
    },
  };
}

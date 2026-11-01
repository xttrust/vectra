/* Carousel (data-v-carousel on .v-carousel). Shows the hidden .v-carousel-controls, steps the track by
   one slide per press of the data-v-carousel-prev and data-v-carousel-next buttons (mirrored in right to left), disables a
   button at its end and labels each slide "2 of 6" unless it has a label. Scrolling, swiping and the
   arrow keys on the focused track keep working as without JS. */
export function init(el) {
  const track = el.querySelector('.v-carousel-track');
  const controls = el.querySelector('.v-carousel-controls');
  const prev = el.querySelector('[data-v-carousel-prev]');
  const next = el.querySelector('[data-v-carousel-next]');
  if (!track || !prev || !next) return {};
  const slides = () => [...track.querySelectorAll('.v-carousel-slide')];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;

  slides().forEach((s, i, all) => {
    if (!s.hasAttribute('aria-label') && !s.hasAttribute('aria-labelledby')) s.setAttribute('aria-label', `${i + 1} of ${all.length}`);
    s.setAttribute('aria-roledescription', 'slide');
  });

  // scrollLeft runs from 0 to negative values in right to left; work in distance from the start edge.
  const sign = () => (getComputedStyle(track).direction === 'rtl' ? -1 : 1);
  const offset = () => Math.abs(track.scrollLeft);
  const update = () => {
    frame = 0;
    const max = track.scrollWidth - track.clientWidth;
    prev.disabled = offset() <= 1;
    next.disabled = offset() >= max - 1;
  };
  const step = (dir) => {
    const first = slides()[0];
    if (!first) return;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    track.scrollBy({ left: dir * sign() * (first.getBoundingClientRect().width + gap), behavior: reduce.matches ? 'auto' : 'smooth' });
  };
  const onPrev = () => step(-1);
  const onNext = () => step(1);
  const onScroll = () => { frame ||= requestAnimationFrame(update); };

  if (controls) controls.hidden = false;
  el.dataset.ready = '';
  update();
  prev.addEventListener('click', onPrev);
  next.addEventListener('click', onNext);
  track.addEventListener('scroll', onScroll, { passive: true });
  const resized = new ResizeObserver(onScroll);
  resized.observe(track);
  return {
    destroy() {
      cancelAnimationFrame(frame);
      prev.removeEventListener('click', onPrev);
      next.removeEventListener('click', onNext);
      track.removeEventListener('scroll', onScroll);
      resized.disconnect();
      if (controls) controls.hidden = true;
      delete el.dataset.ready;
    },
  };
}

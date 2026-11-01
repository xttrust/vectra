/* Scroll progress fallback (data-v-scroll-progress on a .v-scroll-progress bar or a
   .v-back-to-top-progress link). Where CSS scroll timelines exist the CSS does everything and this
   returns at once; elsewhere it writes how far the page has scrolled, 0 to 1, into --v-scroll-p. */
export function init(el) {
  if (typeof CSS !== 'undefined' && CSS.supports('animation-timeline: scroll()')) return {};
  let frame = 0;
  const update = () => {
    frame = 0;
    const max = document.documentElement.scrollHeight - innerHeight;
    el.style.setProperty('--v-scroll-p', String(max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0));
  };
  const onScroll = () => { frame ||= requestAnimationFrame(update); };
  update();
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
  return {
    destroy() {
      cancelAnimationFrame(frame);
      removeEventListener('scroll', onScroll);
      removeEventListener('resize', onScroll);
      el.style.removeProperty('--v-scroll-p');
    },
  };
}

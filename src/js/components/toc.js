/* Table of contents scrollspy (data-v-toc on .v-toc). Marks the link to the section being read with
   aria-current="location" (replacing any server-rendered aria-current): the last target whose top has passed a reading line near the top of the
   scroller (the window, or the nearest scrolling box around the targets). At the very end of the
   scroller the last target wins, so a short final section can still be reached. */
import { emit } from '../core.js';

const scrollerOf = (el) => {
  for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
    if (/(auto|scroll)/.test(getComputedStyle(p).overflowY) && p.scrollHeight > p.clientHeight) return p;
  }
  return null;
};

export function init(el) {
  const links = [...el.querySelectorAll('a[href^="#"]')]
    .map((a) => ({ a, target: document.getElementById(decodeURIComponent(a.hash.slice(1))) }))
    .filter((l) => l.target);
  if (!links.length) return {};
  const box = scrollerOf(links[0].target);
  const scroller = box ?? window;
  let current = null;
  let frame = 0;

  const update = () => {
    frame = 0;
    const top = box ? box.getBoundingClientRect().top : 0;
    const height = box ? box.clientHeight : window.innerHeight;
    // The reading line: a quarter of the way down, but never above a sticky header (--v-sticky-top).
    const line = top + Math.max(height * 0.25, parseFloat(getComputedStyle(el).getPropertyValue('--v-sticky-top')) || 0);
    const atEnd = box
      ? box.scrollTop + box.clientHeight >= box.scrollHeight - 2
      : window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
    let next = links[0];
    if (atEnd) next = links[links.length - 1];
    else for (const l of links) if (l.target.getBoundingClientRect().top <= line + 1) next = l;
    if (next === current) return;
    current?.a.removeAttribute('aria-current');
    next.a.setAttribute('aria-current', 'location');
    current = next;
    emit(el, 'toc', { link: next.a, target: next.target });
  };
  const onScroll = () => { frame ||= requestAnimationFrame(update); };

  // The JS takes over from any aria-current the server rendered.
  for (const l of links) l.a.removeAttribute('aria-current');
  update();
  scroller.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  return {
    destroy() {
      cancelAnimationFrame(frame);
      scroller.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      current?.a.removeAttribute('aria-current');
    },
  };
}

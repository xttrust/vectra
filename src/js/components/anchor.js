/* Placement fallback for browsers without CSS anchor positioning (PLAN.md section 3). Popovers, menus
   and tooltips open next to their invoker, flip to the other side when there is no room, stay inside
   the viewport and follow scroll and resize. Browsers with position-area never run any of this. */
const SEL = '.v-popover[popover], .v-menu[popover], .v-tooltip[popover]';
const GAP = 6;
const shown = new Map(); // popover -> invoker
/** Invokers that are not popovertarget buttons (a hover card's link): set before showPopover(). */
export const anchors = new WeakMap();

function place(el, anchor) {
  const a = anchor.getBoundingClientRect();
  const w = el.offsetWidth;
  const h = el.offsetHeight;
  const vw = document.documentElement.clientWidth;
  const vh = innerHeight;
  const below = a.bottom + GAP;
  const above = a.top - GAP - h;
  const top = el.matches('.v-tooltip:not(.v-tooltip-bottom), .v-popover-top')
    ? (above < 0 && below + h <= vh ? below : above)
    : (below + h > vh && above >= 0 ? above : below);
  // Menus and popovers line up with the invoker's start edge (end edge for .v-menu-end), tooltips centre.
  const end = anchor.matches(':dir(rtl)') !== el.matches('.v-menu-end');
  const left = el.matches('.v-tooltip') ? a.left + (a.width - w) / 2 : end ? a.right - w : a.left;
  const clamp = (v, room) => `${Math.max(GAP, Math.min(v, room - GAP))}px`;
  Object.assign(el.style, { inset: 'auto', margin: '0', left: clamp(left, vw - w), top: clamp(top, vh - h) });
}

export function fallback() {
  if (typeof CSS === 'undefined' || CSS.supports('position-area', 'top')) return;
  const update = () => { for (const [el, a] of shown) place(el, a); };
  // beforetoggle fires before the first paint of the open popover; one frame later it has a size.
  document.addEventListener('beforetoggle', (e) => {
    const el = e.target;
    if (!el.matches?.(SEL)) return;
    shown.delete(el);
    if (e.newState !== 'open') return;
    const id = el.id && CSS.escape(el.id);
    const anchor = e.source ?? anchors.get(el) ?? (id && document.querySelector(`[popovertarget="${id}"]:not(#${id} *), [aria-describedby~="${id}"]`));
    if (!anchor) return;
    shown.set(el, anchor);
    requestAnimationFrame(update);
  }, true);
  addEventListener('scroll', update, { capture: true, passive: true });
  addEventListener('resize', update);
}

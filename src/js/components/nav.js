/* Navbar (data-v-nav on .v-navbar). The mobile menu is a native popover; this closes it when a link
   inside is followed or when the navbar grows wide enough to show the links inline, and mirrors its
   state on the toggle's aria-expanded. */
export function init(el) {
  const menu = el.querySelector('[popover]');
  if (!menu) return {};
  const toggle = el.querySelector(`[popovertarget="${CSS.escape(menu.id)}"]:not([popovertargetaction="hide"])`);
  const open = () => menu.matches(':popover-open');

  const sync = () => toggle?.setAttribute('aria-expanded', open());
  const onClick = (e) => {
    const a = e.target.closest('a[href]');
    if (!a || !open()) return;
    menu.hidePopover();
    // A same-page link moves focus to its target itself. Anything else that keeps the page (a client-side
    // router) would leave focus inside the closed menu, so it goes back to the toggle.
    if (!a.hash || a.pathname !== location.pathname) toggle?.focus({ preventScroll: true });
  };
  // The toggle is display: none once the container query shows the links inline.
  const resized = new ResizeObserver(() => {
    if (open() && toggle && !toggle.offsetWidth) menu.hidePopover();
  });

  sync();
  menu.addEventListener('toggle', sync);
  menu.addEventListener('click', onClick);
  resized.observe(el);
  return {
    destroy() {
      menu.removeEventListener('toggle', sync);
      menu.removeEventListener('click', onClick);
      resized.disconnect();
    },
  };
}

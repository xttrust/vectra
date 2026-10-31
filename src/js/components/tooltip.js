/* Tooltip (data-v-tooltip on the trigger; aria-describedby names the .v-tooltip). A popover tooltip
   shows after a short hover or at once on focus, and stays while the pointer is over it. Escape hides
   either form without moving focus (WCAG 1.4.13); the no-popover form gets [hidden] until the next
   hover or focus, since CSS alone would keep showing it. */
const SHOW = 300;
const HIDE = 150;

export function init(el) {
  const tip = document.getElementById(el.getAttribute('aria-describedby')?.split(' ')[0]);
  if (!tip) return {};
  const pop = tip.hasAttribute('popover');
  let timer;
  let hovered = false;

  const open = () => (pop ? tip.matches(':popover-open') : !tip.hidden);
  const show = () => {
    clearTimeout(timer);
    tip.hidden = false;
    if (pop && !open()) tip.showPopover({ source: el });
  };
  const hide = () => {
    clearTimeout(timer);
    if (pop) {
      if (open()) tip.hidePopover();
    } else tip.hidden = true;
  };
  const later = (fn, ms) => {
    clearTimeout(timer);
    timer = setTimeout(fn, ms);
  };

  const onEnter = () => {
    hovered = true;
    if (!pop) show();
    else if (open()) clearTimeout(timer);
    else later(show, SHOW);
  };
  const onTipEnter = () => {
    hovered = true;
    clearTimeout(timer);
  };
  const onLeave = () => {
    hovered = false;
    if (pop && el !== document.activeElement) later(hide, HIDE);
  };
  const onBlur = () => {
    if (pop && !hovered) hide();
  };
  const onKey = (e) => {
    if (e.key === 'Escape' && open()) hide();
  };
  // A popovertarget trigger would toggle the tooltip shut on the click that follows hover or focus.
  const onClick = (e) => {
    if (pop && open()) e.preventDefault();
  };

  const on = [
    [el, 'pointerenter', onEnter],
    [el, 'pointerleave', onLeave],
    [tip, 'pointerenter', onTipEnter],
    [tip, 'pointerleave', onLeave],
    [el, 'focus', show],
    [el, 'blur', onBlur],
    [el, 'click', onClick],
    [document, 'keydown', onKey],
  ];
  for (const [t, type, fn] of on) t.addEventListener(type, fn);
  return {
    destroy() {
      clearTimeout(timer);
      for (const [t, type, fn] of on) t.removeEventListener(type, fn);
    },
  };
}

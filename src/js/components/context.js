/* Context menu (data-v-context="menu-id" on the region it belongs to). Right-click opens the .v-menu at
   the pointer; Shift+F10 or the Menu key opens it at the region when the region has focus. data-v-menu on
   the menu supplies the keyboard behaviour. When it closes, focus goes back to the region. Without JS the
   browser's own context menu shows, so the same actions must also be reachable another way. */
const GAP = 4;

export function init(el) {
  const menu = document.getElementById(el.dataset.vContext);
  if (!menu) return {};

  const openAt = (x, y) => {
    if (menu.matches(':popover-open')) menu.hidePopover();
    menu.style.setProperty('--v-context-x', `${x}px`);
    menu.style.setProperty('--v-context-y', `${y}px`);
    menu.showPopover();
    // Keep it inside the viewport: flip to the other side of the point when it would overflow.
    const { width: w, height: h } = menu.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    const vh = document.documentElement.clientHeight;
    const nx = x + w > vw - GAP ? Math.max(GAP, x - w) : x;
    const ny = y + h > vh - GAP ? Math.max(GAP, y - h) : y;
    menu.style.setProperty('--v-context-x', `${nx}px`);
    menu.style.setProperty('--v-context-y', `${ny}px`);
  };

  const onContext = (e) => {
    // Shift with right-click still gives the browser's own menu.
    if (e.shiftKey) return;
    e.preventDefault();
    if (e.button === -1 || (e.clientX === 0 && e.clientY === 0)) {
      // Opened from the keyboard: some browsers fire contextmenu with no pointer position.
      const r = el.getBoundingClientRect();
      openAt(r.left + GAP * 4, r.top + GAP * 4);
    } else if (e.buttons) {
      // Linux and macOS fire contextmenu on press: the release that follows would count as a click
      // outside the new popover and light-dismiss it. Open once the button is up instead.
      const [x, y] = [e.clientX, e.clientY];
      document.addEventListener('pointerup', () => setTimeout(() => openAt(x, y)), { once: true, capture: true });
    } else openAt(e.clientX, e.clientY);
  };

  const onKey = (e) => {
    if (!(e.key === 'ContextMenu' || (e.key === 'F10' && e.shiftKey))) return;
    e.preventDefault();
    const r = (document.activeElement && el.contains(document.activeElement) ? document.activeElement : el).getBoundingClientRect();
    openAt(r.left + GAP * 4, r.top + Math.min(r.height, 32));
  };

  const onToggle = (e) => {
    if (e.newState !== 'closed') return;
    const lost = document.activeElement === document.body || menu.contains(document.activeElement);
    if (lost) el.focus({ preventScroll: true });
  };

  el.addEventListener('contextmenu', onContext);
  el.addEventListener('keydown', onKey);
  menu.addEventListener('toggle', onToggle);
  return {
    destroy() {
      el.removeEventListener('contextmenu', onContext);
      el.removeEventListener('keydown', onKey);
      menu.removeEventListener('toggle', onToggle);
    },
  };
}

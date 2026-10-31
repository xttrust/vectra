/* Toasts: toast(message, { tone, action: { label, onClick }, undo, duration }) => { dismiss }.
   One region in the top layer (popover="manual"), newest first, up to three visible; the rest wait
   their turn. Timers pause while the region is hovered or holds focus. A toast with an action stays
   at least 10 seconds (WCAG 2.2.1); duration 0 keeps it until dismissed. Messages are announced
   politely, assertively only for tone 'danger'. Escape on a focused toast dismisses it. */
import { announce } from '../core.js';

const MAX = 3;
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const list = []; // newest first
let region;
let hover = false;
let focus = false;

// Runs the timers of the visible toasts and pauses the rest; hides toasts past the first three.
function refresh() {
  list.forEach((t, i) => {
    t.el.hidden = i >= MAX;
    if (hover || focus || i >= MAX) {
      if (t.id) t.left = Math.max(1000, t.left - (Date.now() - t.start));
      clearTimeout(t.id);
      t.id = 0;
    } else if (t.left && !t.id) {
      t.start = Date.now();
      t.id = setTimeout(t.dismiss, t.left);
    }
  });
}

function ensureRegion() {
  if (!region?.isConnected) {
    region = document.createElement('section');
    region.className = 'v-toast-region';
    region.popover = 'manual';
    region.setAttribute('aria-label', 'Notifications');
    const on = (type, fn) => region.addEventListener(type, (e) => { fn(e); refresh(); });
    on('pointerenter', () => { hover = true; });
    on('pointerleave', () => { hover = false; });
    on('focusin', () => { focus = true; });
    on('focusout', (e) => { focus = region.contains(e.relatedTarget); });
    on('keydown', (e) => { if (e.key === 'Escape') list.find((t) => t.el.contains(e.target))?.dismiss(); });
    document.body.append(region);
  }
  if (!region.matches(':popover-open')) region.showPopover();
}

export function toast(message, { tone, action, undo, duration } = {}) {
  ensureRegion();
  if (undo) action = { label: 'Undo', onClick: undo };
  const el = document.createElement('div');
  el.className = `v-toast${tone ? ` v-toast-${tone}` : ''}`;
  el.innerHTML = `<p class="v-toast-text"></p>${action ? '<button class="v-toast-action" type="button"></button>' : ''}<button class="v-toast-close" type="button" aria-label="Dismiss"></button>`;
  el.firstChild.textContent = message;

  let left = duration ?? (action ? 10000 : 5000);
  if (action && left) left = Math.max(left, 10000);
  const t = {
    el,
    left,
    dismiss() {
      const i = list.indexOf(t);
      if (i < 0) return;
      const hadFocus = el.contains(document.activeElement);
      clearTimeout(t.id);
      list.splice(i, 1);
      el.dataset.leaving = '';
      setTimeout(() => {
        el.remove();
        if (!list.length && region.matches(':popover-open')) region.hidePopover();
      }, reduce.matches ? 0 : 200);
      refresh();
      if (hadFocus) list[0]?.el.querySelector('button').focus();
    },
  };
  // The action runs first, then any button press (action or close) dismisses the toast.
  if (action) {
    const button = el.querySelector('.v-toast-action');
    button.textContent = action.label;
    button.onclick = () => action.onClick?.();
  }
  el.onclick = (e) => { if (e.target.closest('button')) t.dismiss(); };

  list.unshift(t);
  region.prepend(el);
  refresh();
  announce(action ? `${message}. ${action.label} available.` : message, tone === 'danger' ? 'assertive' : 'polite');
  return { dismiss: t.dismiss };
}

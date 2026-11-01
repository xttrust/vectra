/* Notification centre (data-v-notifications on the .v-notifications popover). Following a notification
   marks it read; data-v-notifications-read (a button in the panel) marks them all read. The unread count
   on the trigger (.v-notify-count) and the trigger's accessible name follow along: "Notifications, 3
   unread", or the trigger's data-label words with {n} for the number. data-empty on the panel shows the
   empty line once the last item is gone. */
import { emit } from '../core.js';

export function init(el) {
  const trigger = el.id && document.querySelector(`[popovertarget="${CSS.escape(el.id)}"]`);
  const badge = trigger?.querySelector('.v-notify-count');
  const base = trigger?.dataset.label || 'Notifications';
  const readAll = el.querySelector('[data-v-notifications-read]');

  const unread = () => [...el.querySelectorAll('.v-notification[data-unread]')];
  const sync = () => {
    const n = unread().length;
    if (badge) {
      badge.textContent = n > 99 ? '99+' : String(n);
      badge.hidden = n === 0;
    }
    if (trigger) trigger.setAttribute('aria-label', n ? (trigger.dataset.labelUnread || `${base}, {n} unread`).replace('{n}', n) : base);
    if (readAll) readAll.disabled = n === 0;
    el.dataset.empty = String(!el.querySelector('.v-notification'));
  };
  const markRead = (item) => {
    if (!item.hasAttribute('data-unread')) return false;
    item.removeAttribute('data-unread');
    item.querySelector('[data-unread-label]')?.remove();
    return true;
  };

  const onClick = (e) => {
    if (e.target.closest('[data-v-notifications-read]')) {
      const items = unread();
      for (const item of items) markRead(item);
      sync();
      emit(el, 'read', { items });
      return;
    }
    const item = e.target.closest('.v-notification');
    if (item && e.target.closest('a[href], button') && markRead(item)) {
      sync();
      emit(el, 'read', { items: [item] });
    }
  };

  // The server may render a different number; the list on the page is the truth from here on.
  sync();
  el.addEventListener('click', onClick);
  // Items added later (live updates) change the count too.
  const watch = new MutationObserver(sync);
  watch.observe(el, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-unread'] });
  return {
    destroy() {
      el.removeEventListener('click', onClick);
      watch.disconnect();
    },
  };
}

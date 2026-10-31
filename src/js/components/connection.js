/* Connection banner (data-v-connection on a .v-banner, hidden to start). Children marked
   data-v-when="offline" or "slow" hold the message for each state; the banner shows the one that
   applies and announces it. Offline wins over slow. Coming back online hides the banner and shows a
   short "Back online" toast. Slow is set with connection.slow(true|false), or detected from
   navigator.connection.effectiveType (2g, slow-2g) where the browser has it. */
import { announce } from '../core.js';
import { toast } from './toast.js';

const banners = new Set();
const net = navigator.connection;
let slow = false;
let wired = false;
let last = '';

function update() {
  const state = !navigator.onLine ? 'offline' : slow || /2g/.test(net?.effectiveType) ? 'slow' : '';
  if (last === 'offline' && state !== last) toast('Back online', { tone: 'success', duration: 3000 });
  last = state;
  for (const el of banners) {
    if (el.dataset.state === state) continue;
    el.dataset.state = state;
    el.hidden = !state;
    for (const part of el.querySelectorAll('[data-v-when]')) part.hidden = part.dataset.vWhen !== state;
    if (state) announce(el.innerText);
  }
}

export const connection = {
  /** Shows (true) or clears (false) the slow-network notice. */
  slow(on = true) {
    slow = Boolean(on);
    update();
  },
};

export function connectionBanner(el) {
  if (!wired) {
    wired = true;
    addEventListener('offline', update);
    addEventListener('online', update);
    net?.addEventListener('change', update);
  }
  banners.add(el);
  el.dataset.state = 'init';
  update();
  return { destroy: () => banners.delete(el) };
}

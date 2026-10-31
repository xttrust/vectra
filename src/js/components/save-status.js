/* Inline save status: saveStatus(el, 'saving' | 'saved' | 'failed' | 'offline', { at }) on a
   .v-save-status element. Sets data-state (CSS draws the icon) and the text, in
   the child marked data-v-save-status-text if present. Saved shows the time since `at` (default now) and refreshes it
   every 30 seconds. Only saved and failed are announced, politely; keep the element itself out of
   any live region so the refreshes stay quiet. */
import { announce } from '../core.js';

const TEXT = { saving: 'Saving…', failed: 'Not saved, try again', offline: 'Offline, will save when back online' };
const timers = new WeakMap();

const ago = (at) => {
  const minutes = Math.floor((Date.now() - at) / 60000);
  if (minutes < 1) return 'just now';
  return minutes < 60 ? `${minutes} minute${minutes > 1 ? 's' : ''} ago` : 'over an hour ago';
};

export function saveStatus(el, state, { at = Date.now() } = {}) {
  const target = el.querySelector('[data-v-save-status-text]') ?? el;
  const render = () => { target.textContent = TEXT[state] ?? `Saved ${ago(+at)}`; };
  clearInterval(timers.get(el));
  el.dataset.state = state;
  render();
  if (state === 'saved') {
    timers.set(el, setInterval(() => (el.isConnected ? render() : clearInterval(timers.get(el))), 30000));
    announce('Saved');
  }
  if (state === 'failed') announce(target.textContent);
}

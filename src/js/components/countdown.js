/* Countdown: data-v-countdown="30" (seconds) on a container, for "Try again in 0:30" after too many
   requests, or "Retrying in 0:05". [data-v-countdown-time] children show the time left as m:ss, and
   children marked data-v-when="running" or "done" swap at zero. Keep the container out of live
   regions: it is announced politely only at minute marks, 30 and 10 seconds and at the end (the
   done text), never every second. Fires v:done at zero; changing data-v-countdown starts it again. */
import { announce, emit } from '../core.js';

export function init(el) {
  let timer;
  let end;
  let last;
  const show = (state) => {
    el.dataset.state = state;
    for (const part of el.querySelectorAll('[data-v-when]')) part.hidden = part.dataset.vWhen !== state;
  };
  const tick = () => {
    const left = Math.max(0, Math.ceil((end - Date.now()) / 1000));
    for (const time of el.querySelectorAll('[data-v-countdown-time]')) time.textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
    if (!left) {
      clearInterval(timer);
      show('done');
      announce(el.querySelector('[data-v-when="done"]')?.textContent.trim() || 'Ready');
      emit(el, 'done');
    } else if (last && left !== last && (left % 60 === 0 || left === 30 || left === 10)) {
      announce(left < 60 ? `${left} seconds left` : `${left / 60} minute${left > 60 ? 's' : ''} left`);
    }
    last = left;
  };
  const start = () => {
    clearInterval(timer);
    end = Date.now() + (parseFloat(el.dataset.vCountdown) || 0) * 1000;
    last = 0;
    show('running');
    timer = setInterval(tick, 1000);
    tick();
  };
  const watch = new MutationObserver(start);
  watch.observe(el, { attributeFilter: ['data-v-countdown'] });
  start();
  return { destroy: () => { clearInterval(timer); watch.disconnect(); } };
}

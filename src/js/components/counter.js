/* Character counter: data-v-counter on a .v-field whose input or textarea has maxlength (a hard limit), or
   data-v-max="n" on the field (a soft limit that can be passed). Shows "n of max" and announces only on
   entering the last 10%, reaching the limit or going over, so screen readers do not hear every keystroke. */
import { announce } from '../core.js';
import { describedBy } from './util.js';

export function init(el) {
  const input = el.querySelector('input, textarea');
  const max = input && (input.maxLength > 0 ? input.maxLength : +el.dataset.vMax);
  if (!max) return {};
  // Write <p class="v-counter"> in the markup to place it yourself; otherwise it is added at the end.
  const out = el.querySelector('.v-counter') ?? el.appendChild(Object.assign(document.createElement('p'), { className: 'v-counter' }));
  out.id ||= `${input.id}-counter`;
  describedBy(input, out.id, true);
  let level; // unset, so a prefilled value is not announced on page load
  const update = () => {
    const n = input.value.length;
    const next = n > max ? 3 : n < max ? +(n >= max * 0.9) : 2;
    out.textContent = `${n} of ${max}`;
    out.dataset.vLevel = ['', 'near', 'full', 'over'][next];
    if (next > level) announce(['', `Characters left: ${max - n}`, 'Character limit reached', `Over the limit by ${n - max}`][next]);
    level = next;
  };
  update();
  input.addEventListener('input', update);
  return { destroy: () => input.removeEventListener('input', update) };
}

/* Number stepper: data-v-stepper around a number input and two buttons marked data-v-step="down" and
   data-v-step="up". stepUp and stepDown do the min, max and step maths natively. Ship the buttons hidden:
   without JS the plain number input still works with its own arrows and keys. */
import { listen, fire } from './util.js';

export function init(el) {
  const input = el.querySelector('input');
  if (!input) return {};
  const ac = new AbortController();
  const sync = () => {
    for (const button of el.querySelectorAll('[data-v-step]')) {
      const up = button.dataset.vStep === 'up';
      const limit = up ? input.max : input.min;
      const off = input.disabled || (limit !== '' && (up ? input.valueAsNumber >= limit : input.valueAsNumber <= limit));
      // A disabled button loses focus, so hand it to the input rather than to the page.
      if (off && document.activeElement === button) input.focus();
      button.disabled = off;
      button.hidden = false;
    }
  };
  listen(el, {
    click(e) {
      const step = e.target.closest('[data-v-step]')?.dataset.vStep;
      if (!step) return;
      input[step === 'up' ? 'stepUp' : 'stepDown']();
      fire(input);
    },
    input: sync,
  }, { signal: ac.signal });
  sync();
  return { destroy: () => ac.abort() };
}

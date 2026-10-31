/* Toggle buttons: data-v-toggle on a button with aria-pressed flips it on click. On a group, every
   aria-pressed button inside toggles; data-v-toggle="single" keeps at most one pressed, like a
   toolbar's alignment buttons. Emits v:change with { pressed } from the button that changed. */
import { emit } from '../core.js';

export function init(el) {
  const onClick = (e) => {
    // Read on every click, so switching the group to single mode later just works.
    const single = el.dataset.vToggle === 'single';
    const button = e.target.closest('[aria-pressed]');
    if (!button || !el.contains(button) || button.disabled || button.getAttribute('aria-disabled') === 'true') return;
    const pressed = button.getAttribute('aria-pressed') !== 'true';
    if (single && pressed) {
      for (const other of el.querySelectorAll('[aria-pressed="true"]')) if (other !== button) other.setAttribute('aria-pressed', 'false');
    }
    button.setAttribute('aria-pressed', String(pressed));
    emit(button, 'change', { pressed });
  };
  el.addEventListener('click', onClick);
  return { destroy: () => el.removeEventListener('click', onClick) };
}

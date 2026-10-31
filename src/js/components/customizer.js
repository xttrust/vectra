/* Customizer (data-v-customizer on a popover panel): direction, mode, accent swatches and hue slider,
   corners, density and typeface, all in sync with theme. An <output> shows the hue in use, a
   [data-v-reset] button restores the defaults. Opening it moves focus to the first checked choice;
   the popover itself gives Escape, light dismiss and focus return. */
import { announce } from '../core.js';
import { theme, DEFAULTS } from '../theme.js';
import { bindTheme } from './theme-switch.js';

export function customizer(el) {
  const output = el.querySelector('output');
  const range = el.querySelector('input[type="range"]');
  const binding = bindTheme(
    el,
    () => { if (output) output.value = `${range.value}°`; },
    [el, 'click', (e) => {
      if (!e.target.closest('[data-v-reset]')) return;
      theme.set(DEFAULTS);
      announce('Theme reset to defaults');
    }],
    [el, 'toggle', (e) => {
      if (e.newState !== 'open') return;
      binding.sync();
      el.querySelector('input:checked, input')?.focus();
    }],
  );
  return binding;
}

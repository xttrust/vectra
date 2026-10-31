/* Theme switch (data-v-theme-switch on a .v-segmented radio group): picks the direction, or any
   theme key. Each input's key is the last part of its name, so name="direction", "hdr-direction"
   and "cz-direction" all set the direction; "cz-mode", "cz-accent", "cz-corners" and so on work the
   same way. Radios follow theme changes made anywhere else; a range input with an accent name shows
   the hue in use. Shared by the customizer. */
import { theme, listen } from '../theme.js';

const root = document.documentElement;
const keyOf = (input) => input.name.split('-').pop();
const hue = () => Math.round(parseFloat(getComputedStyle(root).getPropertyValue('--v-accent-h'))) || 0;

// Extra [target, type, listener] triples are added and removed with the binding.
export function bindTheme(el, after, ...extra) {
  const sync = () => {
    const current = theme.get();
    for (const input of el.querySelectorAll('input[name]')) {
      const value = current[keyOf(input)];
      if (value === undefined) continue;
      if (input.type === 'radio') input.checked = input.value === value;
      else input.value = value === 'default' ? hue() : value;
    }
    after?.();
  };
  const change = ({ target }) => {
    if (target.name && keyOf(target) in theme.get()) theme.set({ [keyOf(target)]: target.value });
  };
  sync();
  return { sync, ...listen([el, 'input', change], [root, 'v:theme', sync], ...extra) };
}

export const themeSwitch = (el) => bindTheme(el);

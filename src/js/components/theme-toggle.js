/* Theme toggle (data-v-theme-toggle on a button): cycles light, dark, system. Sets data-mode on the
   button so CSS shows the matching icon, and keeps its accessible name accurate, for example
   "Theme: system (dark). Switch to light". */
import { announce } from '../core.js';
import { theme, listen } from '../theme.js';

const NEXT = { light: 'dark', dark: 'system', system: 'light' };

export function themeToggle(el) {
  const sync = () => {
    const { mode, resolved } = theme.get();
    el.dataset.mode = mode;
    el.setAttribute('aria-label', `Theme: ${mode === 'system' ? `system (${resolved})` : mode}. Switch to ${NEXT[mode]}`);
  };
  const click = () => {
    const mode = NEXT[theme.get().mode];
    theme.set({ mode });
    announce(`Theme: ${mode}`);
  };
  sync();
  return listen([el, 'click', click], [document.documentElement, 'v:theme', sync]);
}

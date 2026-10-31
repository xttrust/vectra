/* Theme API on <html>: data-direction, data-theme (none in system mode, so light-dark() follows the
   OS live), --v-accent-h for the accent hue, and data-corners, data-density and data-font, whose
   token values live in theming.css. Saved in storage under direction, theme and custom (JSON of
   accent, corners, density, font), which a pre-paint script can apply before first paint.
   Direction and mode changes run inside a view transition where supported (instant under reduced
   motion). Every change emits v:theme on <html> with theme.get(). */
import { emit, storage } from './core.js';

const root = document.documentElement;
const darkOS = matchMedia('(prefers-color-scheme: dark)');
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const ALLOWED = { direction: ['tech', 'editorial', 'soft', 'glass'], mode: ['light', 'dark', 'system'] };
export const DEFAULTS = { direction: 'tech', mode: 'system', accent: 'default', corners: 'default', density: 'default', font: 'default' };

const valid = (key, value) => value != null && key in DEFAULTS && (ALLOWED[key]?.includes(String(value)) ?? true);
const state = { ...DEFAULTS };
let saved = {};
try { saved = JSON.parse(storage.get('custom')) ?? {}; } catch { /* nothing saved */ }
for (const [key, value] of [...Object.entries(saved), ['direction', storage.get('direction') ?? root.dataset.direction], ['mode', storage.get('theme') ?? root.dataset.theme]]) {
  if (valid(key, value)) state[key] = String(value);
}

function apply() {
  const { mode, accent, ...attrs } = state;
  attrs.theme = mode;
  for (const [key, value] of Object.entries(attrs)) {
    if (value === 'default' || value === 'system') delete root.dataset[key];
    else root.dataset[key] = value;
  }
  if (accent === 'default') root.style.removeProperty('--v-accent-h');
  else root.style.setProperty('--v-accent-h', accent);
}

export const theme = {
  /** The current choices plus `resolved`: the theme actually showing ('light' or 'dark'). */
  get: () => ({ ...state, resolved: state.mode === 'system' ? (darkOS.matches ? 'dark' : 'light') : state.mode }),

  /** Changes any of direction, mode, accent (a hue or 'default'), corners, density, font. Unknown values are ignored. */
  set(changes = {}) {
    for (const key in changes) if (valid(key, changes[key])) state[key] = String(changes[key]);
    const { direction, mode, ...custom } = state;
    storage.set('direction', direction);
    storage.set('theme', mode);
    storage.set('custom', JSON.stringify(custom));
    const update = () => { apply(); emit(root, 'theme', theme.get()); };
    if (('direction' in changes || 'mode' in changes) && document.startViewTransition && !reduce.matches) document.startViewTransition(update);
    else update();
  },
};

/** Adds [target, type, listener] triples and returns { destroy } that removes them: the module teardown. */
export const listen = (...triples) => {
  for (const [target, type, fn] of triples) target.addEventListener(type, fn);
  return { destroy: () => triples.forEach(([target, type, fn]) => target.removeEventListener(type, fn)) };
};

apply();
darkOS.addEventListener('change', () => { if (state.mode === 'system') emit(root, 'theme', theme.get()); });

/* Vectra v2 JS entry. Component modules register themselves here as they land (see PLAN.md section 7).
   As a script tag (dist/vectra.js) everything below is window.Vectra; as a module, import what you need. */
import { start } from './core.js';

// Navigation and overlays
import { register } from './core.js';
import { init as tabs } from './components/tabs.js';
import { init as menu } from './components/menu.js';
import { init as nav } from './components/nav.js';
import { init as tooltip } from './components/tooltip.js';
import { open as dialogOpen, close as dialogClose, dismissable } from './components/dialog.js';
import { fallback as anchorFallback } from './components/anchor.js';

export { init, register, emit, storage, announce } from './core.js';
export const version = '2.0.0-alpha.0';

// Navigation and overlays
register('tabs', tabs);
register('menu', menu);
register('nav', nav);
register('tooltip', tooltip);
register('dialog-open', dialogOpen);
register('dialog-close', dialogClose);
register('dismissable', dismissable);
anchorFallback();

start();

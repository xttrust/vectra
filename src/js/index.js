/* Vectra v2 JS entry. Component modules register themselves here as they land (see PLAN.md section 7).
   As a script tag (dist/vectra.js) everything below is window.Vectra; as a module, import what you need. */
import { start, register } from './core.js';
// Forms and elements
import { init as password } from './components/password.js';
import { init as dropzone } from './components/dropzone.js';
import { init as stepper } from './components/stepper.js';
import { init as counter } from './components/counter.js';
import { init as copy } from './components/copy.js';
import { init as clear } from './components/clear.js';
import { init as dismiss } from './components/dismiss.js';
import { init as validate } from './components/validate.js';
import { init as unsaved } from './components/unsaved.js';
import { init as strength } from './components/strength.js';

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
// Forms and elements
export { fieldState } from './components/field.js';
register('password', password);
register('dropzone', dropzone);
register('stepper', stepper);
register('counter', counter);
register('copy', copy);
register('clear', clear);
register('dismiss', dismiss);
register('validate', validate);
register('unsaved', unsaved);
register('strength', strength);

// Theming and feedback
import { register as registerTheming } from './core.js';
import { themeToggle } from './components/theme-toggle.js';
import { themeSwitch } from './components/theme-switch.js';
import { customizer } from './components/customizer.js';
import { connectionBanner } from './components/connection.js';
export { theme } from './theme.js';
export { toast } from './components/toast.js';
export { connection } from './components/connection.js';
export { session } from './components/session.js';
export { saveStatus } from './components/save-status.js';
registerTheming('theme-toggle', themeToggle);
registerTheming('theme-switch', themeSwitch);
registerTheming('customizer', customizer);
registerTheming('connection', connectionBanner);

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

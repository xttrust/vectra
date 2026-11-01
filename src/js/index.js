/* Vectra v2 JS entry. Component modules register themselves here (see PLAN.md section 7).
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
import { init as toggle } from './components/toggle.js';
import { init as shortcut } from './components/shortcut.js';

// Navigation and overlays
import { init as tabs } from './components/tabs.js';
import { init as menu } from './components/menu.js';
import { init as nav } from './components/nav.js';
import { init as mega } from './components/mega.js';
import { init as toc } from './components/toc.js';
import { init as context } from './components/context.js';
import { init as hovercard } from './components/hovercard.js';
import { init as command } from './components/command.js';
import { init as lightbox } from './components/lightbox.js';
import { init as notifications } from './components/notifications.js';
import { init as tooltip } from './components/tooltip.js';
import { open as dialogOpen, close as dialogClose, dismissable } from './components/dialog.js';
import { fallback as anchorFallback } from './components/anchor.js';

// Theming and feedback
import { themeToggle } from './components/theme-toggle.js';
import { themeSwitch } from './components/theme-switch.js';
import { customizer } from './components/customizer.js';
import { connectionBanner } from './components/connection.js';

// States
import { init as slow } from './components/slow.js';
import { init as confirmText } from './components/confirm.js';
import { init as countdown } from './components/countdown.js';

export { init, register, emit, storage, announce } from './core.js';
export { fieldState } from './components/field.js';
export { theme } from './theme.js';
export { toast } from './components/toast.js';
export { connection } from './components/connection.js';
export { session } from './components/session.js';
export { saveStatus } from './components/save-status.js';
export const version = '2.0.0-alpha.1';

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
register('toggle', toggle);
register('shortcut', shortcut);

register('tabs', tabs);
register('menu', menu);
register('nav', nav);
register('mega', mega);
register('toc', toc);
register('context', context);
register('hovercard', hovercard);
register('command', command);
register('lightbox', lightbox);
register('notifications', notifications);
register('tooltip', tooltip);
register('dialog-open', dialogOpen);
register('dialog-close', dialogClose);
register('dismissable', dismissable);
anchorFallback();

register('theme-toggle', themeToggle);
register('theme-switch', themeSwitch);
register('customizer', customizer);
register('connection', connectionBanner);

register('slow', slow);
register('confirm-text', confirmText);
register('countdown', countdown);

start();

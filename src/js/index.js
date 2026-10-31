/* Vectra v2 JS entry. Component modules register themselves here as they land (see PLAN.md section 7).
   As a script tag (dist/vectra.js) everything below is window.Vectra; as a module, import what you need. */
import { start } from './core.js';

export { init, register, emit, storage, announce } from './core.js';
export const version = '2.0.0-alpha.0';

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

start();

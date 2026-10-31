/* Vectra v2 JS entry. Component modules register themselves here as they land (see PLAN.md section 7).
   As a script tag (dist/vectra.js) everything below is window.Vectra; as a module, import what you need. */
import { start } from './core.js';

export { init, register, emit, storage, announce } from './core.js';
export const version = '2.0.0-alpha.0';

start();

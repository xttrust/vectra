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

start();

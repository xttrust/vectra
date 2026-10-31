/* Field check API for async checks (username available, code accepted). fieldState(input, state, message)
   with state 'checking', 'valid', 'invalid' or 'clear' writes the message into a .v-field-status line under
   the field, links it with aria-describedby and announces it politely. 'invalid' also sets aria-invalid
   and a custom validity error, so the form will not submit until the check passes. */
import { announce } from '../core.js';
import { describedBy } from './util.js';

export function fieldState(input, state, message = '') {
  const field = input.closest('.v-field');
  let status = field.querySelector('.v-field-status');
  if (!status) {
    status = field.appendChild(document.createElement('p'));
    status.className = 'v-field-status';
    status.id = `${input.id}-status`;
  }
  const was = status.dataset.vState;
  const on = state !== 'clear' && message;
  status.textContent = on ? message : '';
  status.dataset.vState = on ? state : '';
  describedBy(input, status.id, on);
  // A custom validity error also stops the form submitting (and data-v-validate lists it).
  input.setCustomValidity(state === 'invalid' ? message : '');
  // Only undo our own aria-invalid, so an error from data-v-validate stays until that is fixed.
  if (state === 'invalid') input.ariaInvalid = 'true';
  else if (was === 'invalid') input.removeAttribute('aria-invalid');
  if (on) announce(message);
}

/* Form validation: data-v-validate on a <form>. Without JS the browser's own validation runs. With JS the
   form gets novalidate and, on a submit with problems: every invalid control gets aria-invalid and its
   .v-field-error linked by aria-describedby, an error summary (.v-error-summary) at the top lists each
   problem as a link to its field, and focus moves to the summary. A fixed field clears its own error. */
import { listen, describedBy } from './util.js';

export function init(form) {
  const ac = new AbortController();
  const marked = new Map(); // control -> its error message element
  let summary = form.querySelector('.v-error-summary');
  form.noValidate = true;

  const errorFor = (control) => {
    const field = control.closest('.v-field, fieldset') ?? control.parentElement;
    // A failed async check (fieldState 'invalid') already shows its own message: point at that one.
    const error = (control.validity.customError && field.querySelector('.v-field-status'))
      || (field.querySelector('.v-field-error') ?? field.appendChild(document.createElement('p')));
    if (!error.className) error.className = 'v-field-error';
    error.textContent ||= control.validationMessage;
    error.id ||= `${control.id}-error`;
    return error;
  };

  const clear = (control) => {
    control.removeAttribute('aria-invalid');
    describedBy(control, marked.get(control).id, false);
    marked.delete(control);
    summary?.querySelector(`[href="#${control.id}"]`)?.parentElement.remove();
    if (summary && !summary.querySelector('a')) summary.hidden = true;
  };
  const fix = () => marked.forEach((_, control) => control.validity.valid && clear(control));

  listen(form, {
    input: fix,
    change: fix,
    reset: () => marked.forEach((_, control) => clear(control)),
    // Summary links focus the field itself; following the #id alone would only scroll to it.
    click(e) {
      const link = e.target.closest('.v-error-summary a[href^="#"]');
      const control = link && document.getElementById(link.hash.slice(1));
      if (control) {
        e.preventDefault();
        control.focus();
      }
    },
  }, { signal: ac.signal });

  // Capture phase, so submit listeners added later (unsaved.js, app code) see defaultPrevented.
  form.addEventListener('submit', (e) => {
    const bad = [...form.elements].filter((c) => c.willValidate && !c.validity.valid);
    if (summary) summary.hidden = !bad.length;
    if (!bad.length) return;
    e.preventDefault();
    if (!summary) {
      const id = `${form.id || 'v'}-summary`;
      form.insertAdjacentHTML('afterbegin', `<div class="v-error-summary" role="group" aria-labelledby="${id}" tabindex="-1"><p class="v-error-summary-title" id="${id}"></p><ul></ul></div>`);
      summary = form.firstElementChild;
    }
    const list = summary.querySelector('ul');
    const listed = new Set(); // radios in one group share one message and one link
    list.replaceChildren();
    for (const control of bad) {
      control.id ||= `v-${control.name}`;
      const error = errorFor(control);
      control.ariaInvalid = 'true';
      describedBy(control, error.id, true);
      marked.set(control, error);
      if (listed.has(error)) continue;
      listed.add(error);
      list.appendChild(document.createElement('li')).appendChild(Object.assign(document.createElement('a'), { href: `#${control.id}`, textContent: error.textContent }));
    }
    const n = listed.size;
    summary.querySelector('.v-error-summary-title').textContent = n > 1 ? `There are ${n} problems` : 'There is a problem';
    summary.focus();
  }, { signal: ac.signal, capture: true });

  return {
    destroy() {
      ac.abort();
      form.noValidate = false;
    },
  };
}

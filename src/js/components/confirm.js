/* Type to confirm: data-v-confirm-text="atlas-web" on an input inside a form. The form's submit
   buttons stay disabled until the input holds exactly that text (spaces around it are ignored).
   Resetting the form, or closing the dialog it sits in, empties the input and disables them again.
   Without JS, also give the input required and pattern="atlas-web": the browser then blocks the submit. */
export function init(input) {
  const form = input.form;
  if (!form) return {};
  const sync = () => {
    const ok = input.value.trim() === input.dataset.vConfirmText;
    for (const control of form.elements) if (control.type === 'submit') control.disabled = !ok;
  };
  // The reset event fires before the values change, so wait a task before reading them.
  const reset = () => setTimeout(sync);
  const close = () => form.reset();
  const dialog = input.closest('dialog');
  input.addEventListener('input', sync);
  form.addEventListener('reset', reset);
  dialog?.addEventListener('close', close);
  sync();
  return {
    destroy() {
      input.removeEventListener('input', sync);
      form.removeEventListener('reset', reset);
      dialog?.removeEventListener('close', close);
    },
  };
}

/* Multi-step form (data-v-wizard on a <form> of .v-wizard-step fieldsets). Shows one step at a time and
   reveals the data-v-wizard-back and data-v-wizard-next buttons (hidden in the markup, for no-JS
   readers who see every step). Continue checks the current step first: with data-v-validate on the form
   through its v:validate event (inline errors and the summary), otherwise with the browser's own message.
   Back never checks. Steps not reached yet are disabled, so they are neither checked nor submitted early;
   Enter in a field acts as Continue until the last step. The .v-steps indicator marks done and current
   steps, focus moves to the new step (named by its .v-wizard-title legend), and v:step fires with
   { index, step }. */
import { emit } from '../core.js';

export function init(form) {
  const steps = [...form.querySelectorAll('.v-wizard-step')];
  if (steps.length < 2) return {};
  const back = form.querySelector('[data-v-wizard-back]');
  const next = form.querySelector('[data-v-wizard-next]');
  const submits = [...form.querySelectorAll('button[type="submit"], input[type="submit"]')];
  const marks = [...(form.querySelector('.v-steps')?.querySelectorAll('.v-step') ?? [])];
  const done = form.dataset.completed || 'Completed: ';
  let current = 0;

  const show = (i, focus = true) => {
    current = i;
    steps.forEach((step, j) => {
      step.hidden = j !== i;
      step.disabled = j > i;
    });
    marks.forEach((mark, j) => {
      mark.classList.toggle('v-step-complete', j < i);
      if (j === i) mark.setAttribute('aria-current', 'step');
      else mark.removeAttribute('aria-current');
      // "Completed:" is said, not only drawn: keep one hidden prefix on each finished step.
      const label = mark.querySelector('.v-step-label') ?? mark;
      let prefix = label.querySelector(':scope > [data-wizard-done]');
      if (j < i && !prefix) {
        prefix = Object.assign(document.createElement('span'), { className: 'v-sr-only', textContent: done });
        prefix.dataset.wizardDone = '';
        label.prepend(prefix);
      } else if (j >= i) prefix?.remove();
    });
    if (back) back.hidden = i === 0;
    if (next) next.hidden = i === steps.length - 1;
    for (const s of submits) s.hidden = i !== steps.length - 1;
    // Focus the step itself: its legend names it for screen readers, and Firefox will not focus a legend.
    if (focus) {
      if (!steps[i].hasAttribute('tabindex')) steps[i].tabIndex = -1;
      steps[i].focus({ preventScroll: true });
      steps[i].scrollIntoView({ block: 'nearest' });
    }
    emit(form, 'step', { index: i, step: steps[i] });
  };

  const valid = () => {
    if (form.matches('[data-v-validate]')) {
      const detail = { scope: steps[current], valid: true };
      form.dispatchEvent(new CustomEvent('v:validate', { detail }));
      return detail.valid;
    }
    const bad = [...steps[current].querySelectorAll('input, select, textarea')].find((c) => c.willValidate && !c.checkValidity());
    bad?.reportValidity();
    return !bad;
  };
  const forward = () => { if (valid()) show(current + 1); };
  const onBack = () => show(Math.max(0, current - 1));
  // Enter in a field submits the form natively; before the last step that means Continue instead.
  const onSubmit = (e) => {
    if (current === steps.length - 1 || e.defaultPrevented) return;
    e.preventDefault();
    forward();
  };

  back?.addEventListener('click', onBack);
  next?.addEventListener('click', forward);
  form.addEventListener('submit', onSubmit);
  show(0, false);
  return {
    destroy() {
      back?.removeEventListener('click', onBack);
      next?.removeEventListener('click', forward);
      form.removeEventListener('submit', onSubmit);
      for (const step of steps) Object.assign(step, { hidden: false, disabled: false });
      if (back) back.hidden = true;
      if (next) next.hidden = true;
      for (const s of submits) s.hidden = false;
    },
  };
}

/* File drop zone: data-v-dropzone on the .v-dropzone label. Dropped files go into the native input, so
   forms submit them as if they were picked. accept and multiple are honoured; refused files are announced. */
import { emit, announce } from '../core.js';
import { listen, fire } from './util.js';

const accepts = (file, accept) => !accept || accept.split(',').some((rule) => {
  rule = rule.trim().toLowerCase();
  return rule[0] === '.' ? file.name.toLowerCase().endsWith(rule)
    : rule.endsWith('/*') ? file.type.startsWith(rule.slice(0, -1))
    : file.type === rule;
});

export function init(el) {
  const input = el.querySelector('input[type="file"]');
  if (!input) return {};
  const ac = new AbortController();
  const over = (on) => el.toggleAttribute('data-v-dragover', on && !input.disabled);
  let depth = 0; // dragenter and dragleave fire for every child, so count them to avoid flicker
  let names = el.querySelector('[data-v-dropzone-files]');

  listen(el, {
    dragenter(e) { e.preventDefault(); over(++depth); },
    dragover(e) { e.preventDefault(); }, // marks the zone as a drop target
    dragleave() { over(--depth); },
    drop(e) {
      e.preventDefault(); // otherwise the browser opens the file
      over(depth = 0);
      if (input.disabled) return;
      const ok = new DataTransfer();
      const refused = [];
      for (const file of e.dataTransfer.files) {
        if (!accepts(file, input.accept)) refused.push(`${file.name}: file type not accepted.`);
        else if (ok.items.length && !input.multiple) refused.push(`${file.name}: only one file allowed.`);
        else ok.items.add(file);
      }
      if (refused.length) announce(refused.join(' '));
      if (!ok.items.length) return;
      input.files = ok.files;
      fire(input);
    },
  }, { signal: ac.signal });

  // Picked or dropped, the chosen names show in the zone.
  input.addEventListener('change', () => {
    if (!names) {
      names = document.createElement('span');
      names.setAttribute('data-v-dropzone-files', '');
      el.append(names);
    }
    names.textContent = [...input.files].map((f) => f.name).join(', ');
    emit(el, 'change', { files: input.files });
  }, { signal: ac.signal });
  return { destroy: () => ac.abort() };
}

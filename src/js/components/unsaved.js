/* Unsaved changes: data-v-unsaved on a <form>. Any edit marks it dirty (v:dirty, detail { dirty }) and the
   browser asks before the page is left. A submit that goes ahead, or a reset, marks it clean again. */
import { emit } from '../core.js';
import { listen } from './util.js';

export function init(form) {
  const ac = new AbortController();
  let dirty = false;
  const set = (value) => {
    if (dirty !== value) emit(form, 'dirty', { dirty: (dirty = value) });
  };
  const edit = () => set(true);
  // A submit stopped by validation (or by app code that ran first) keeps the edits marked.
  const clean = (e) => e.defaultPrevented || set(false);
  listen(form, { input: edit, change: edit, submit: clean, reset: clean }, { signal: ac.signal });
  addEventListener('beforeunload', (e) => {
    if (dirty) e.preventDefault();
  }, { signal: ac.signal });
  return { destroy: () => ac.abort() };
}

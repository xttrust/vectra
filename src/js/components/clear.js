/* Clear button: data-v-clear on a search field (.v-search). Its first button empties the input, returns
   focus to it, fires input so live filters update, and hides while there is nothing to clear. */
import { listen } from './util.js';

export function init(el) {
  const input = el.querySelector('input');
  const button = el.querySelector('button');
  if (!input || !button) return {};
  const ac = new AbortController();
  const sync = () => { button.hidden = !input.value; };
  listen(el, {
    input: sync,
    click(e) {
      if (!button.contains(e.target)) return;
      input.value = '';
      input.focus();
      input.dispatchEvent(new Event('input', { bubbles: true }));
    },
  }, { signal: ac.signal });
  sync();
  return { destroy: () => ac.abort() };
}

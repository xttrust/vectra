/* Copy button: data-v-copy="text" copies that text; data-v-copy-target="#id" copies that element's text.
   The label reads "Copied" for 2 seconds and screen readers hear it. If the clipboard is blocked the text
   is selected instead, so Ctrl+C or Cmd+C still works. */
import { announce } from '../core.js';

export function init(el) {
  let timer;
  // The name to change: aria-label if set (icon buttons), else the last text node (after any icon).
  const label = el.getAttributeNode('aria-label') ?? [...el.childNodes].findLast((n) => n.nodeType === 3 && n.data.trim());
  const original = label?.nodeValue;
  const click = async () => {
    const target = el.dataset.vCopyTarget && document.querySelector(el.dataset.vCopyTarget);
    let word = 'Copied';
    try {
      await navigator.clipboard.writeText(target ? target.textContent : el.dataset.vCopy);
      announce('Copied to clipboard');
    } catch {
      word = 'Copy failed';
      if (target) getSelection().selectAllChildren(target);
      announce(`Could not copy${target ? '. The text is selected, press Ctrl+C' : ''}`);
    }
    if (label) label.nodeValue = word;
    clearTimeout(timer);
    timer = setTimeout(() => { if (label) label.nodeValue = original; }, 2000);
  };
  el.addEventListener('click', click);
  return { destroy: () => { clearTimeout(timer); el.removeEventListener('click', click); } };
}

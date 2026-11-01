/* Tag input (data-v-tag-input on a wrapper around one text input). The input's comma-separated value
   becomes tags; a hidden input takes over its name with the same comma-separated value, so the server
   sees exactly what it would without JS. Enter or the separator (data-separator, default ",") adds what
   was typed, pasting a list adds each item, leaving the field keeps a half-typed value, Backspace in the
   empty field removes the last tag, and each tag's button removes it. Duplicates (ignoring case) are
   skipped; data-max caps the count. Changes are announced and fire v:tags with the full list. */
import { announce, emit } from '../core.js';

const X = '<svg class="v-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';

export function init(el) {
  const input = el.querySelector('input:not([type="hidden"])');
  if (!input) return {};
  const sep = el.dataset.separator || ',';
  const max = Number(el.dataset.max) || Infinity;
  const name = input.name;
  const label = input.labels?.[0]?.textContent.trim() || input.getAttribute('aria-label') || 'Tags';
  const words = { removed: el.dataset.removed || '{tag} removed', added: el.dataset.added || '{tag} added', remove: el.dataset.remove || 'Remove {tag}' };

  const list = document.createElement('ul');
  list.className = 'v-tag-input-list';
  list.setAttribute('role', 'list');
  const hidden = Object.assign(document.createElement('input'), { type: 'hidden', name });
  let tags = [];

  const render = () => {
    list.replaceChildren(...tags.map((tag) => {
      const li = document.createElement('li');
      const chip = Object.assign(document.createElement('span'), { className: 'v-tag', textContent: tag });
      const button = Object.assign(document.createElement('button'), { type: 'button', className: 'v-tag-remove', innerHTML: X });
      button.setAttribute('aria-label', words.remove.replace('{tag}', tag));
      button.dataset.tag = tag;
      chip.append(button);
      li.append(chip);
      return li;
    }));
    list.setAttribute('aria-label', `${label}: ${tags.length}`);
    hidden.value = tags.join(sep);
    emit(el, 'tags', { tags: [...tags] });
  };
  const add = (raw, speak = true) => {
    const added = [];
    for (const part of raw.split(sep)) {
      const tag = part.trim();
      if (!tag || tags.length >= max || tags.some((t) => t.toLowerCase() === tag.toLowerCase())) continue;
      tags.push(tag);
      added.push(tag);
    }
    if (!added.length) return;
    render();
    if (speak) announce(added.map((t) => words.added.replace('{tag}', t)).join(', '));
  };
  const remove = (tag) => {
    tags = tags.filter((t) => t !== tag);
    render();
    announce(words.removed.replace('{tag}', tag));
  };

  const onKey = (e) => {
    if ((e.key === 'Enter' || e.key === sep) && !e.isComposing) {
      if (!input.value.trim() && e.key === 'Enter') return; // an empty Enter still submits the form
      e.preventDefault();
      add(input.value);
      input.value = '';
    } else if (e.key === 'Backspace' && !input.value && tags.length) {
      remove(tags[tags.length - 1]);
    }
  };
  const onPaste = (e) => {
    const text = e.clipboardData?.getData('text') ?? '';
    if (!text.includes(sep)) return;
    e.preventDefault();
    add(text);
  };
  const onBlur = () => {
    if (!input.value.trim()) return;
    add(input.value);
    input.value = '';
  };
  const onClick = (e) => {
    const button = e.target.closest('.v-tag-remove');
    if (button) {
      remove(button.dataset.tag);
      input.focus();
    } else if (e.target === el) input.focus();
  };

  // Take over: tags from the server value, the name moves to the hidden input.
  add(input.value, false);
  render();
  input.value = '';
  input.removeAttribute('name');
  // The box draws the field now; the input drops .v-input so no direction styles it as a second field.
  const hadInputClass = input.classList.contains('v-input');
  input.classList.remove('v-input');
  input.classList.add('v-tag-input-field');
  el.prepend(list);
  el.append(hidden);
  el.dataset.ready = '';
  input.addEventListener('keydown', onKey);
  input.addEventListener('paste', onPaste);
  input.addEventListener('blur', onBlur);
  el.addEventListener('click', onClick);
  return {
    destroy() {
      input.removeEventListener('keydown', onKey);
      input.removeEventListener('paste', onPaste);
      input.removeEventListener('blur', onBlur);
      el.removeEventListener('click', onClick);
      input.value = tags.join(`${sep} `);
      if (name) input.name = name;
      input.classList.remove('v-tag-input-field');
      if (hadInputClass) input.classList.add('v-input');
      list.remove();
      hidden.remove();
      delete el.dataset.ready;
    },
  };
}

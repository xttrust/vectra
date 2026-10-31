/* Password reveal: data-v-password on the input group. The button flips the input between password and
   text. Give the button a fixed name (aria-label="Show password"); aria-pressed carries the state. A toggle
   button's name must not change with it, or screen readers say "Hide password, pressed". */
export function init(el) {
  const input = el.querySelector('input');
  const button = el.querySelector('button');
  if (!input || !button) return {};
  const sync = () => button.setAttribute('aria-pressed', input.type === 'text');
  const toggle = () => {
    // Changing type drops the selection in some browsers; keep the caret where the person left it.
    const { selectionStart: start, selectionEnd: end } = input;
    input.type = input.type === 'password' ? 'text' : 'password';
    input.setSelectionRange(start, end);
    sync();
  };
  sync();
  button.addEventListener('click', toggle);
  return { destroy: () => button.removeEventListener('click', toggle) };
}

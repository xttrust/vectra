/* Password strength: data-v-strength="#meter-id" on a password input. A small heuristic (length, variety,
   common words and patterns) scores 0 to 4 on the <meter>; the element right after the meter shows the
   rules while the field is empty and plain-language advice once typing starts. The level is announced
   only when it changes. */
import { announce } from '../core.js';

const WORDS = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];
const TIPS = [
  'Use at least 8 characters.',
  'Avoid common words and patterns.',
  'Add a few more characters or a word.',
  'Longer, or add numbers and symbols.',
  'Hard to guess.',
];
const COMMON = /(.)\1\1|1234|abcd|qwer|asdf|password|letmein|welcome|admin/i;

const score = (v) => {
  if (v.length < 8) return 0;
  const kinds = [/[a-z]/, /[A-Z]/, /\d/, /[^a-z\d]/i].filter((r) => r.test(v)).length;
  return COMMON.test(v) ? 1 : 1 + (v.length > 11) + (v.length > 15) + (kinds > 2);
};

export function init(input) {
  const meter = document.querySelector(input.dataset.vStrength);
  if (!meter) return {};
  const hint = meter.nextElementSibling;
  const rules = hint?.textContent;
  let last;
  const update = () => {
    const v = input.value;
    const s = v && score(v);
    meter.value = s;
    meter.ariaValueText = v ? WORDS[s] : 'Empty';
    if (hint) hint.textContent = v ? `${WORDS[s]}. ${TIPS[s]}` : rules;
    if (v && s !== last) announce(`Password strength: ${WORDS[s]}`);
    last = v && s;
  };
  update();
  input.addEventListener('input', update);
  return { destroy: () => input.removeEventListener('input', update) };
}

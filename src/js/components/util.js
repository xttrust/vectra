/* Small helpers shared by the form modules. */

/** Adds listeners from a { type: handler } map. Pass { signal } so one abort() removes them all. */
export const listen = (el, events, options) => {
  for (const type in events) el.addEventListener(type, events[type], options);
};

/** Fires bubbling input and change, as if the person had edited the control. */
export const fire = (el) => {
  for (const type of ['input', 'change']) el.dispatchEvent(new Event(type, { bubbles: true }));
};

/** Adds or removes one id in an element's aria-describedby, keeping any others. */
export function describedBy(el, id, add) {
  const ids = new Set(el.getAttribute('aria-describedby')?.split(' ').filter(Boolean));
  ids[add ? 'add' : 'delete'](id);
  if (ids.size) el.setAttribute('aria-describedby', [...ids].join(' '));
  else el.removeAttribute('aria-describedby');
}

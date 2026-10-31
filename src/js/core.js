/* Core: finds [data-v-<name>] hooks, starts the matching module on each, and stops it when the element
   leaves the DOM. A MutationObserver covers content added later (Livewire, Vue, htmx). */
const modules = new Map(); // name -> init(el, options) => { destroy }
const running = new WeakMap(); // element -> Map(name -> instance)
let observer = null;

const hooks = (root, name) => {
  const found = [...root.querySelectorAll(`[data-v-${name}]`)];
  if (root.nodeType === 1 && root.hasAttribute(`data-v-${name}`)) found.unshift(root);
  return found;
};

function attach(el, name) {
  const instances = running.get(el) ?? new Map();
  if (instances.has(name)) return;
  instances.set(name, modules.get(name)(el, {}) ?? {});
  running.set(el, instances);
}

function detach(root) {
  for (const name of modules.keys()) {
    for (const el of hooks(root, name)) {
      const instances = running.get(el);
      if (!el.isConnected && instances?.has(name)) {
        instances.get(name).destroy?.();
        instances.delete(name);
      }
    }
  }
}

/** Starts every registered module inside root (default: the whole document). Safe to call repeatedly. */
export function init(root = document) {
  for (const name of modules.keys()) for (const el of hooks(root, name)) attach(el, name);
}

/** Adds a module. Elements already on the page with its hook start straight away once Vectra is running. */
export function register(name, setup) {
  modules.set(name, setup);
  if (observer) init();
}

/** Begins auto-init and watches for added and removed nodes. Called once by the entry file. */
export function start() {
  if (observer || typeof document === 'undefined') return;
  const go = () => {
    init();
    observer = new MutationObserver((records) => {
      for (const { addedNodes, removedNodes } of records) {
        for (const node of removedNodes) if (node.nodeType === 1) detach(node);
        for (const node of addedNodes) if (node.nodeType === 1 && node.isConnected) init(node);
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go, { once: true });
  else go();
}

/** Fires a bubbling, cancelable `v:<type>` event. Returns false if a listener called preventDefault(). */
export const emit = (el, type, detail) => el.dispatchEvent(new CustomEvent(`v:${type}`, { bubbles: true, cancelable: true, detail }));

/** localStorage under a `vectra-` prefix that never throws (private mode, blocked storage). */
export const storage = {
  get(key, fallback = null) {
    try { return localStorage.getItem(`vectra-${key}`) ?? fallback; } catch { return fallback; }
  },
  set(key, value) {
    try {
      if (value === null || value === undefined) localStorage.removeItem(`vectra-${key}`);
      else localStorage.setItem(`vectra-${key}`, value);
    } catch { /* storage unavailable: the setting lasts for this page only */ }
  },
};

const regions = {};

/** Reads a message to screen readers through a shared live region. Use 'assertive' only for urgent news. */
export function announce(message, politeness = 'polite') {
  let region = regions[politeness];
  if (!region?.isConnected) {
    region = document.createElement('div');
    region.className = 'v-sr-only';
    region.setAttribute('aria-live', politeness);
    region.setAttribute('aria-atomic', 'true');
    document.body.append(region);
    regions[politeness] = region;
  }
  // Clearing first makes repeated identical messages announce again.
  region.textContent = '';
  setTimeout(() => { region.textContent = message; }, 50);
}

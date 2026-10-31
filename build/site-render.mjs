/* Docs site rendering helpers: escaping, icons, a tiny highlighter that emits the kit's .v-tok-* classes,
   code blocks with a copy button, tables and the page shell. Plain Node, no dependencies. */

export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const icon = (root, name, extra = '') => `<svg class="v-icon"${extra} aria-hidden="true"><use href="${root}assets/icons/sprite.svg#${name}"/></svg>`;

/** Inline markdown-ish text: `code`, **bold**, and <tags> shown as code. Everything else is escaped. */
export const inline = (s) => esc(s)
  .replace(/`([^`]+)`/g, '<code>$1</code>')
  .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  .replace(/(^|[\s(])(&lt;\/?[a-z](?:(?!&gt;).)*?&gt;)/g, '$1<code>$2</code>');

export const slugify = (s) => s.toLowerCase().replace(/<[^>]+>/g, '').replace(/&[a-z]+;/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const tok = (cls, s) => `<span class="v-tok-${cls}">${esc(s)}</span>`;

function highlightHTML(src) {
  let out = '';
  const re = /(<!--[\s\S]*?-->)|(<\/?)([a-zA-Z][\w-]*)((?:\s+[^\s=>/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*(\/?>)/g;
  let last = 0;
  for (const m of src.matchAll(re)) {
    out += esc(src.slice(last, m.index));
    last = m.index + m[0].length;
    if (m[1]) { out += tok('comment', m[1]); continue; }
    out += tok('punct', m[2]) + tok('tag', m[3]);
    out += m[4].replace(/(\s+)([^\s=>/]+)(?:(\s*=\s*)("[^"]*"|'[^']*'|[^\s>]+))?/g, (_, sp, name, eq, val) => sp + tok('attr', name) + (eq ? tok('punct', eq.trim()) + tok('string', val) : ''))
      .replace(/^$/, '');
    out += tok('punct', m[5]);
  }
  return out + esc(src.slice(last));
}

const JS_KEYWORDS = /^(?:import|from|export|const|let|var|function|return|if|else|for|of|in|new|await|async|class|extends|true|false|null|undefined|this|typeof|default)$/;
function highlightJS(src) {
  const re = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|('(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)(?=\s*\()|([A-Za-z_$][\w$]*)|([{}()[\];,.:=<>+\-*/!?&|]+)/g;
  let out = '';
  let last = 0;
  for (const m of src.matchAll(re)) {
    out += esc(src.slice(last, m.index));
    last = m.index + m[0].length;
    if (m[1]) out += tok('comment', m[1]);
    else if (m[2]) out += tok('string', m[2]);
    else if (m[3]) out += tok('number', m[3]);
    else if (m[4]) out += JS_KEYWORDS.test(m[4]) ? tok('keyword', m[4]) : tok('function', m[4]);
    else if (m[5]) out += JS_KEYWORDS.test(m[5]) ? tok('keyword', m[5]) : esc(m[5]);
    else out += tok('punct', m[6]);
  }
  return out + esc(src.slice(last));
}

function highlightCSS(src) {
  const re = /(\/\*[\s\S]*?\*\/)|("[^"]*"|'[^']*')|(--[\w-]+|[a-z-]+)(\s*:)(?!:)|([.#@][\w-]+|:root|\[[^\]]+\])|(\b\d+(?:\.\d+)?(?:%|[a-z]+)?\b)|([a-z-]+)(?=\()|([{}();:,])/g;
  let out = '';
  let last = 0;
  for (const m of src.matchAll(re)) {
    out += esc(src.slice(last, m.index));
    last = m.index + m[0].length;
    if (m[1]) out += tok('comment', m[1]);
    else if (m[2]) out += tok('string', m[2]);
    else if (m[3]) out += tok('property', m[3]) + tok('punct', m[4]);
    else if (m[5]) out += tok('tag', m[5]);
    else if (m[6]) out += tok('number', m[6]);
    else if (m[7]) out += tok('function', m[7]);
    else out += tok('punct', m[8]);
  }
  return out + esc(src.slice(last));
}

function highlightShell(src) {
  return src.split('\n').map((line) => (line.trim().startsWith('#') ? tok('comment', line) : esc(line)
    .replace(/^(\s*)(npm|npx|node|git|cd|php|composer)\b/, '$1<span class="v-tok-function">$2</span>'))).join('\n');
}

const HIGHLIGHT = { html: highlightHTML, blade: highlightHTML, vue: highlightHTML, js: highlightJS, css: highlightCSS, sh: highlightShell, json: highlightJS };
const LANG = { html: 'HTML', blade: 'Blade', vue: 'Vue', js: 'JavaScript', css: 'CSS', sh: 'Terminal', json: 'JSON' };

let codeId = 0;
export const resetCodeIds = () => { codeId = 0; };

/** A kit code block (.v-code) with a language label or title, a copy button and highlighted source. */
export function codeBlock(root, source, lang = 'html', title = '') {
  const id = `code-${++codeId}`;
  const body = (HIGHLIGHT[lang] ?? esc)(source.replace(/\s+$/, ''));
  return `<div class="v-code site-code">
  <div class="v-code-header">
    <span class="${title ? 'v-code-title' : 'v-code-lang'}">${esc(title || LANG[lang] || lang)}</span>
    <button class="v-btn v-btn-ghost v-btn-sm v-code-copy site-js-only" type="button" data-v-copy data-v-copy-target="#${id}">${icon(root, 'copy')}Copy</button>
  </div>
  <pre class="v-code-body" id="${id}" tabindex="0"><code>${body}</code></pre>
</div>`;
}

/** A table with a header row. cells are already-rendered HTML. */
export function table(head, rows, caption = '') {
  return `<div class="v-table-wrap site-table" tabindex="0" role="region" aria-label="${esc(caption || head.join(', '))}"><table class="v-table">${caption ? `<caption class="v-sr-only">${esc(caption)}</caption>` : ''}
  <thead><tr>${head.map((h) => `<th scope="col">${esc(h)}</th>`).join('')}</tr></thead>
  <tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('\n')}</tbody>
</table></div>`;
}

/** Keys as kbd elements: "Shift+Tab" becomes a combo. */
export const keys = (list) => list.map((k) => (k.includes('+') && k.length > 1
  ? `<kbd class="v-kbd-combo">${k.split('+').map((p) => `<kbd class="v-kbd">${esc(p)}</kbd>`).join('+')}</kbd>`
  : `<kbd class="v-kbd">${esc(k)}</kbd>`)).join(' <span class="site-or">or</span> ');

// Applies the saved direction, theme and customizer choices before first paint, like the kit's examples.
export const PREPAINT = `<script>
    (function () {
      var root = document.documentElement;
      try {
        var d = localStorage.getItem('vectra-direction');
        var t = localStorage.getItem('vectra-theme');
        var c = JSON.parse(localStorage.getItem('vectra-custom') || '{}');
        if (['tech', 'editorial', 'soft', 'glass'].indexOf(d) > -1) root.dataset.direction = d;
        if (t === 'light' || t === 'dark') root.dataset.theme = t;
        ['corners', 'density', 'font'].forEach(function (k) { if (c[k] && c[k] !== 'default') root.dataset[k] = c[k]; });
        if (c.accent && c.accent !== 'default') root.style.setProperty('--v-accent-h', c.accent);
      } catch (e) {}
    })();
  </script>`;

/* Shared by the example page generators (auth-pages.mjs, pages.mjs). */
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);

// Indents by tag depth, two spaces a level. <pre> blocks are kept exactly as written.
export function format(html, base = 0) {
  let depth = base;
  let pre = false;
  const out = [];
  for (const raw of html.split('\n')) {
    if (pre) {
      out.push(raw);
      if (raw.includes('</pre>')) pre = false;
      continue;
    }
    const line = raw.trim();
    if (!line) continue;
    const opens = [...line.matchAll(/<([a-z][a-z0-9-]*)\b[^>]*?(\/?)>/gi)].filter((m) => !m[2] && !VOID.has(m[1].toLowerCase())).length;
    const closes = (line.match(/<\/[a-z][^>]*>/gi) ?? []).length;
    // A line that opens a <pre> closes it (and whatever opened with it) on the pre's last line.
    pre = line.includes('<pre') && !line.includes('</pre>');
    const delta = line.startsWith('<!--') || pre ? 0 : opens - closes;
    if (delta < 0) depth += delta;
    out.push('  '.repeat(Math.max(0, depth)) + line);
    if (delta > 0) depth += delta;
  }
  return out.join('\n');
}

export const THEME_SCRIPT = `<script>
    /* Applies the saved direction and theme before first paint. No theme saved: follow the OS. */
    (function () {
      var root = document.documentElement;
      try {
        var d = localStorage.getItem('vectra-direction');
        var t = localStorage.getItem('vectra-theme');
        if (['tech', 'editorial', 'soft', 'glass'].indexOf(d) > -1) root.dataset.direction = d;
        if (t === 'light' || t === 'dark') root.dataset.theme = t;
      } catch (e) {}
    })();
  </script>`;

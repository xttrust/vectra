/* Docs site behaviour, on top of dist/vectra.js: search (press / to focus), live demo frames that follow
   the site's theme or their own inline switch (and can be shown at phone or tablet width), the table of contents highlight, and the filters on the
   component index and icon pages. Without JavaScript the search form opens the component index. */
(function () {
  var root = document.documentElement;
  var base = root.dataset.root || '';

  /* ---------- Search ---------- */
  var input = document.getElementById('site-search');
  var form = input && input.form;
  var index = null;
  var results = [];
  var active = -1;
  var list;

  function load() {
    if (index) return Promise.resolve(index);
    return fetch(base + 'search.json').then(function (r) { return r.json(); }).then(function (data) { index = data; return data; });
  }

  function score(item, q) {
    var t = item.t.toLowerCase();
    if (t === q) return 100;
    if (t.indexOf(q) === 0) return 80;
    if (t.indexOf(q) > -1) return 60;
    if (item.k.toLowerCase().indexOf(q) > -1) return 40;
    if (item.d.toLowerCase().indexOf(q) > -1) return 20;
    return 0;
  }

  function select(i) {
    active = i;
    [].forEach.call(list.children, function (li, n) { li.setAttribute('aria-selected', String(n === i)); });
    if (i > -1 && list.children[i]) {
      input.setAttribute('aria-activedescendant', list.children[i].id);
      list.children[i].scrollIntoView({ block: 'nearest' });
    } else input.removeAttribute('aria-activedescendant');
  }

  function close() {
    if (!list) return;
    list.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
    active = -1;
  }

  function go(item) { location.href = base + item.u; }

  function render() {
    var q = input.value.trim().toLowerCase();
    if (!q) { close(); return; }
    results = index.map(function (item) { return [score(item, q), item]; })
      .filter(function (p) { return p[0] > 0; })
      .sort(function (a, b) { return b[0] - a[0] || a[1].t.localeCompare(b[1].t); })
      .slice(0, 8).map(function (p) { return p[1]; });
    list.replaceChildren();
    results.forEach(function (item, n) {
      var li = document.createElement('li');
      li.id = 'site-result-' + n;
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', 'false');
      li.innerHTML = '<span class="site-result-section"></span><span class="site-result-title"></span><span class="site-result-meta"></span>';
      li.children[0].textContent = item.s;
      li.children[1].textContent = item.t;
      li.children[2].textContent = item.d;
      li.addEventListener('mousedown', function (e) { e.preventDefault(); go(item); });
      list.append(li);
    });
    if (!results.length) {
      var none = document.createElement('li');
      none.className = 'site-results-empty';
      none.setAttribute('role', 'option');
      none.setAttribute('aria-disabled', 'true');
      none.id = 'site-result-none';
      none.textContent = 'Nothing matches "' + input.value.trim() + '"';
      list.append(none);
    }
    list.hidden = false;
    input.setAttribute('aria-expanded', 'true');
    select(results.length ? 0 : -1);
    if (window.Vectra) window.Vectra.announce(results.length ? results.length + ' result' + (results.length > 1 ? 's' : '') : 'No results');
  }

  if (input) {
    list = document.createElement('ul');
    list.id = 'site-results';
    list.className = 'site-results';
    list.setAttribute('role', 'listbox');
    list.setAttribute('aria-label', 'Search results');
    list.hidden = true;
    form.append(list);
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-controls', 'site-results');
    input.setAttribute('aria-expanded', 'false');

    input.addEventListener('focus', load);
    input.addEventListener('input', function () { load().then(render); });
    input.addEventListener('blur', close);
    input.addEventListener('keydown', function (e) {
      var open = !list.hidden && results.length;
      if (e.key === 'ArrowDown' && open) { e.preventDefault(); select((active + 1) % results.length); }
      else if (e.key === 'ArrowUp' && open) { e.preventDefault(); select((active - 1 + results.length) % results.length); }
      else if (e.key === 'Enter' && open && active > -1) { e.preventDefault(); go(results[active]); }
      else if (e.key === 'Escape') {
        if (!list.hidden) { e.preventDefault(); close(); } else if (input.value) input.value = '';
      }
    });
    form.addEventListener('submit', function (e) {
      if (results.length) { e.preventDefault(); go(results[Math.max(active, 0)]); }
    });
    document.addEventListener('keydown', function (e) {
      var t = e.target;
      var typing = t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName);
      if ((e.key === '/' && !typing) || (e.key === 'k' && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        input.focus();
        input.select();
      }
    });
  }

  /* ---------- Demo frames ---------- */
  var KEYS = ['direction', 'theme', 'corners', 'density', 'font'];
  var WIDTHS = { full: '', tablet: '768px', phone: '390px' };
  var darkOS = matchMedia('(prefers-color-scheme: dark)');
  var resolved = function () { return root.dataset.theme || (darkOS.matches ? 'dark' : 'light'); };

  function frameRoot(frame) {
    try { return frame.contentDocument && frame.contentDocument.documentElement; } catch { return null; }
  }

  function apply(example) {
    var frame = example.querySelector('iframe');
    var doc = frameRoot(frame);
    if (!doc) return;
    KEYS.forEach(function (k) {
      if (root.dataset[k]) doc.dataset[k] = root.dataset[k]; else delete doc.dataset[k];
    });
    if (!root.dataset.direction) doc.dataset.direction = 'tech';
    var hue = root.style.getPropertyValue('--v-accent-h');
    if (hue) doc.style.setProperty('--v-accent-h', hue); else doc.style.removeProperty('--v-accent-h');
    var own = example.own || {};
    if (frame.dataset.lock) doc.dataset.direction = frame.dataset.lock;
    if (own.direction) doc.dataset.direction = own.direction;
    if (own.mode) doc.dataset.theme = own.mode;
    example.querySelectorAll('.site-demo-bar input').forEach(function (r) {
      var key = r.name.split('-').pop();
      if (key === 'width') return;
      r.checked = r.value === (key === 'direction' ? doc.dataset.direction : (own.mode || resolved()));
    });
  }

  function size(frame) {
    var doc = frame.contentDocument;
    var main = doc && doc.querySelector('main');
    if (!main) return;
    var h = Math.ceil(main.getBoundingClientRect().height);
    frame.style.height = Math.max(h, +frame.dataset.min || 0) + 'px';
  }

  function wire(example) {
    var frame = example.querySelector('iframe');
    var ready = function () {
      var doc = frame.contentDocument;
      if (!doc || !doc.querySelector('main')) return;
      apply(example);
      size(frame);
      if (!frame.observer && frame.contentWindow.ResizeObserver) {
        frame.observer = new frame.contentWindow.ResizeObserver(function () { size(frame); });
        frame.observer.observe(doc.querySelector('main'));
      }
    };
    frame.addEventListener('load', ready);
    if (frame.contentDocument && frame.contentDocument.readyState === 'complete') ready();
    example.addEventListener('change', function (e) {
      if (!e.target.closest('.site-demo-bar')) return;
      if (e.target.name.slice(-6) === '-width') {
        // Phone and tablet widths show the demo at that size, centred; the frame height follows.
        frame.style.inlineSize = WIDTHS[e.target.value];
        if (e.target.value === 'full') delete example.dataset.width; else example.dataset.width = e.target.value;
        return;
      }
      example.own = example.own || {};
      example.own[e.target.name.split('-').pop()] = e.target.value;
      apply(example);
    });
  }

  var examples = document.querySelectorAll('[data-demo]');
  examples.forEach(wire);
  var all = function () { examples.forEach(apply); };
  root.addEventListener('v:theme', all);
  darkOS.addEventListener('change', all);

  /* ---------- Table of contents ---------- */
  var tocLinks = document.querySelectorAll('.site-toc a');
  if (tocLinks.length && 'IntersectionObserver' in window) {
    var byId = {};
    tocLinks.forEach(function (a) { byId[a.hash.slice(1)] = a; });
    var visible = new Set();
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) visible.add(e.target.id); else visible.delete(e.target.id); });
      var first = Object.keys(byId).find(function (id) { return visible.has(id); });
      if (!first) return;
      tocLinks.forEach(function (a) { if (a === byId[first]) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
    }, { rootMargin: '-10% 0px -70% 0px' });
    Object.keys(byId).forEach(function (id) { var h = document.getElementById(id); if (h) observer.observe(h); });
  }

  /* ---------- Filters (component index, icons) ---------- */
  function filter(inputId, statusId, itemSelector, groupSelector, noun) {
    var field = document.getElementById(inputId);
    if (!field) return;
    var status = document.getElementById(statusId);
    var items = document.querySelectorAll(itemSelector);
    var run = function () {
      var q = field.value.trim().toLowerCase();
      var shown = 0;
      items.forEach(function (el) {
        var hit = !q || el.dataset.filterText.indexOf(q) > -1;
        (el.closest('li') || el).hidden = !hit;
        if (el.closest('li') !== el) el.hidden = !hit;
        if (hit) shown++;
      });
      if (groupSelector) {
        document.querySelectorAll(groupSelector).forEach(function (g) {
          g.hidden = !g.querySelector('[data-filter-text]:not([hidden])');
        });
      }
      status.textContent = q ? shown + ' of ' + items.length + ' ' + noun : '';
    };
    field.addEventListener('input', run);
    var q = new URLSearchParams(location.search).get('q');
    if (q) { field.value = q; run(); }
  }
  filter('component-filter', 'component-filter-status', '[data-filter-text]', '[data-filter-group]', 'components');
  filter('icon-filter', 'icon-filter-status', '#icon-list li', null, 'icons');

  /* ---------- Live token values ---------- */
  var live = document.querySelectorAll('[data-token]');
  var readTokens = function () {
    var cs = getComputedStyle(root);
    live.forEach(function (el) { el.textContent = cs.getPropertyValue(el.dataset.token).trim() || '(not set)'; });
  };
  if (live.length) { readTokens(); root.addEventListener('v:theme', function () { requestAnimationFrame(readTokens); }); }
})();

// Focus inside a demo frame is invisible to CSS in this page, so the card is marked while it lasts.
(function () {
  function markFrameFocus() {
    document.querySelectorAll('[data-frame-focus]').forEach(function (card) { card.removeAttribute('data-frame-focus'); });
    var active = document.activeElement;
    // Demo frames ring their example card; the theme builder's preview rings its stage.
    var card = active && active.matches && active.matches('.site-demo-frame, .tb-frame') ? active.closest('.site-example, .tb-stage') : null;
    if (card) card.setAttribute('data-frame-focus', '');
  }
  window.addEventListener('blur', markFrameFocus);
  window.addEventListener('focus', markFrameFocus);
  document.addEventListener('focusin', markFrameFocus);
})();

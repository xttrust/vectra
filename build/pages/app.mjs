/* App pages: the stacked shell, a list page, a detail page and four settings pages. Every page except the
   shell also comes as loading, empty (first run) and error files, so each state shows without JS and can
   be copied on its own. */
import { icon, brand, appShell, CSRF } from './shared.mjs';

const STATES = [['', 'Loaded'], ['-loading', 'Loading'], ['-empty', 'Empty'], ['-error', 'Error']];
const btn = (text, href = '#main', cls = 'v-btn-secondary', ic) => `<a class="v-btn ${cls}" href="${href}">${ic ? icon(ic) : ''}${text}</a>`;
const sk = (w, h = '1em', extra = '') => `<span class="v-skeleton" style="inline-size: ${w}; block-size: ${h}${extra}"></span>`;

const header = ({ kicker, crumbs, title, meta, actions = '', tabs = '' }) => `<div class="v-page-header">
<div>
${crumbs ? `<nav class="v-breadcrumb" aria-label="Breadcrumb">
<ol>
${crumbs.map(([t, h]) => `<li><a href="${h}">${t}</a></li>`).join('\n')}
<li><span aria-current="page">${title}</span></li>
</ol>
</nav>` : `<p class="v-kicker">${kicker}</p>`}
<h1 class="v-page-title">${title}</h1>
${meta ? `<p class="v-page-meta">${meta}</p>` : ''}
</div>
${actions ? `<div class="v-page-actions">\n${actions}\n</div>` : ''}
${tabs}
</div>`;

// The state wrapper: data-page-state names the variant; loading also sets aria-busy and a status line.
const state = (name, inner, what) => name === 'loading'
  ? `<div class="v-stack" style="--v-gap: var(--v-space-6); min-inline-size: 0" data-page-state="loading" aria-busy="true">
<p class="v-sr-only" role="status">Loading ${what}</p>
${inner}
</div>`
  : `<div class="v-stack" style="--v-gap: var(--v-space-6); min-inline-size: 0" data-page-state="${name}">
${inner}
</div>`;

// A whole section that failed: the message replaces its content, with a retry that reloads the page.
const failed = (what, retry, why = 'The connection to our server timed out. Nothing has been lost.') => `<div class="v-empty" role="status">
<span class="v-empty-icon" aria-hidden="true" style="color: var(--v-danger)">${icon('alert')}</span>
<h2 class="v-empty-title">We could not load ${what}</h2>
<p class="v-max-prose">${why} Try again, and if it keeps happening, check our status page.</p>
<div class="v-cluster v-justify-center">
${btn('Try again', retry, 'v-btn-primary', 'refresh')}
${btn('Status page', '../system/coming-soon.html', 'v-btn-ghost')}
</div>
<p class="v-text-sm v-text-secondary">Reference <code>NW-504-1188</code></p>
</div>`;

// A smaller failure inside one panel; the rest of the page keeps working.
const failedInline = (what, retry) => `<div class="v-alert v-alert-danger" role="status">
${icon('alert')}
<div class="v-alert-body v-stack" style="--v-gap: var(--v-space-2)">
<p class="v-alert-title">${what} did not load</p>
<p>Something went wrong on our side. The rest of this page is up to date.</p>
<div class="v-cluster">${btn('Try again', retry, 'v-btn-secondary v-btn-sm', 'refresh')}</div>
</div>
</div>`;

// ---------------------------------------------------------------- Stacked shell
const STACK_NAV = [['Today', '../app-shell.html'], ['Jobs', 'stacked.html'], ['Calendar', '#main'], ['Customers', 'list.html'], ['Invoices', '#main']];
const JOBS = [
  ['08:00', 'Roof survey', 'P&aacute;draig &Oacute; S&eacute;', 'Claregalway', 'Done', 'success'],
  ['10:30', 'Gutter clean', 'Mary Walsh', 'Tuam', 'On the way', 'info'],
  ['14:00', 'Chimney repair', 'The Quay Bar', 'Westport', 'Booked', 'accent'],
  ['16:30', 'Quote visit', 'Moss &amp; Fern Gardens', 'Clifden', 'Booked', 'accent'],
];
const stacked = `<div class="v-app-stacked">
<header class="v-navbar v-navbar-contained" data-v-nav>
${brand('../app-shell.html')}
<nav class="v-navbar-menu" id="app-menu" popover aria-label="App">
<button class="v-btn v-btn-ghost v-btn-icon v-navbar-close" type="button" popovertarget="app-menu" popovertargetaction="hide" aria-label="Close menu">${icon('close')}</button>
<ul class="v-navbar-links">
${STACK_NAV.map(([t, h]) => `<li><a href="${h}"${t === 'Jobs' ? ' aria-current="page"' : ''}>${t}</a></li>`).join('\n')}
</ul>
</nav>
<div class="v-navbar-end">
<a class="v-btn v-btn-ghost v-btn-icon" href="#main" aria-label="Notifications, 3 unread">${icon('bell')}</a>
<button class="v-btn v-btn-ghost v-btn-icon" type="button" popovertarget="account-menu" aria-haspopup="menu"><span class="v-avatar v-avatar-sm" aria-hidden="true">AK</span><span class="v-sr-only">Account menu, Aoife Kelly</span></button>
</div>
<button class="v-btn v-btn-ghost v-btn-icon v-navbar-toggle" type="button" popovertarget="app-menu" aria-label="Open menu">${icon('menu')}</button>
</header>
<div class="v-menu" id="account-menu" popover role="menu" data-v-menu aria-label="Account">
<a class="v-menu-item" role="menuitem" href="settings-profile.html">${icon('user')}Your profile</a>
<a class="v-menu-item" role="menuitem" href="settings-account.html">${icon('gear')}Settings</a>
<hr class="v-menu-sep">
<a class="v-menu-item" role="menuitem" href="../../auth/sessions/signed-out.html">${icon('logout')}Sign out</a>
</div>
<main class="v-app-page v-skip-target" id="main" tabindex="-1">
${header({ kicker: 'Week 46', title: 'Jobs', meta: '12 jobs this week, 4 today. 2 quotes waiting for an answer.', actions: `${btn('Day plan', '#main', 'v-btn-secondary', 'route')}\n${btn('New job', '#main', 'v-btn-primary', 'plus')}`, tabs: `<nav class="v-tablist" aria-label="Job views">
<a class="v-tab" href="stacked.html" aria-current="page">Today <span class="v-badge v-badge-accent">4</span></a>
<a class="v-tab" href="#main">This week</a>
<a class="v-tab" href="#main">Quotes <span class="v-badge">2</span></a>
<a class="v-tab" href="#main">Done</a>
</nav>` })}
<div class="v-grid v-grid-fit" style="--v-min: 12rem">
<div class="v-card v-stat"><span class="v-stat-label">Booked today</span><span class="v-stat-value">&euro;1,480</span><span class="v-text-sm v-text-secondary">4 jobs, 1 done</span></div>
<div class="v-card v-stat"><span class="v-stat-label">Driving today</span><span class="v-stat-value">96 km</span><span class="v-text-sm v-text-secondary">About 1 h 40 min</span></div>
<div class="v-card v-stat"><span class="v-stat-label">Quotes waiting</span><span class="v-stat-value">2</span><span class="v-text-sm v-text-secondary">&euro;3,900 in total</span></div>
</div>
<div class="v-panel">
<div class="v-panel-header"><h2 class="v-panel-title">Thursday 12 November</h2><span class="v-badge v-badge-success v-badge-dot">Dry, 11&deg;C</span></div>
<ul class="v-list" style="border: 0; border-radius: 0">
${JOBS.map(([time, job, who, where, st, tone]) => `<li><a class="v-list-item" href="detail.html"><span class="v-badge v-badge-accent v-tabular">${time}</span><span class="v-list-body"><span class="v-list-title">${job}, ${who}</span><span class="v-list-meta">${where}</span></span><span class="v-list-end"><span class="v-badge v-badge-${tone} v-badge-dot">${st}</span></span></a></li>`).join('\n')}
</ul>
<div class="v-panel-footer"><p class="v-text-sm v-text-secondary v-grow">Day ends around 18:00, back in Tuam.</p>${btn('Open the day plan', '#main', 'v-btn-ghost v-btn-sm', 'arrow')}</div>
</div>
</main>
</div>`;

// ---------------------------------------------------------------- List page (customers)
const CUSTOMERS = [
  ['MW', 'Mary Walsh', 'mary.walsh@example.ie', 'Galway', 4, '3 Nov', '2,170.00', 'Repeat', 'success', true],
  ['QB', 'The Quay Bar', 'conor@quaybar.example', 'Mayo', 6, '28 Oct', '4,830.00', 'Repeat', 'success', true],
  ['PS', 'P&aacute;draig &Oacute; S&eacute;', 'padraig@example.ie', 'Galway', 1, '27 Oct', '150.00', 'New', 'info'],
  ['MF', 'Moss &amp; Fern Gardens', 'niamh@mossfern.example', 'Galway', 3, '24 Oct', '960.00', 'Owes money', 'warning'],
  ['WC', 'Westshore Cleaning', 'roisin@westshore.example', 'Galway', 2, '20 Oct', '840.00', 'Active', 'accent'],
  ['KE', 'Keane Electrical', 'declan@keane.example', 'Mayo', 5, '12 Oct', '3,210.00', 'Repeat', 'success'],
  ['FD', 'Flynn &amp; Daughters', 'aisling@flynn.example', 'Clare', 1, '2 Oct', '420.00', 'Lead', 'info'],
  ['TW', 'Tierney Windows', 'lisa@tierney.example', 'Roscommon', 2, '18 Sep', '610.00', 'Active', 'accent'],
];
const listHeader = (meta = '214 customers, 12 new this month.') => header({
  kicker: 'Harbour Roofing', title: 'Customers', meta,
  actions: `${btn('Import', '#main', 'v-btn-secondary', 'upload')}\n${btn('Add customer', 'detail.html', 'v-btn-primary', 'plus')}`,
  tabs: `<nav class="v-tablist" aria-label="Customer views">
<a class="v-tab" href="list.html" aria-current="page">All</a>
<a class="v-tab" href="list.html">Repeat</a>
<a class="v-tab" href="list.html">Leads <span class="v-badge v-badge-accent">8</span></a>
<a class="v-tab" href="list.html">Archived</a>
</nav>`,
});
const toolbar = (disabled = '') => `<form class="v-toolbar" action="list.html" role="search" aria-label="Filter customers">
<div class="v-input-group v-search" data-v-clear>
<span class="v-input-addon">${icon('search')}</span>
<input class="v-input" id="customers-q" name="q" type="search" placeholder="Name, email or Eircode" aria-label="Search customers"${disabled}>
<button class="v-btn v-btn-ghost v-btn-icon v-search-clear" type="button" aria-label="Clear search">${icon('close')}</button>
</div>
<select class="v-select" id="customers-county" name="county" aria-label="County" style="inline-size: auto"${disabled}><option>All counties</option><option selected>Galway</option><option>Mayo</option><option>Clare</option><option>Roscommon</option></select>
<select class="v-select" id="customers-sort" name="sort" aria-label="Sort by" style="inline-size: auto"${disabled}><option>Last job, newest first</option><option>Name, A to Z</option><option>Total spent, highest first</option></select>
<button class="v-btn v-btn-secondary" type="button"${disabled}>${icon('filter')}More filters</button>
</form>`;

const listLoaded = state('loaded', `${listHeader()}
<div class="v-panel">
<div class="v-panel-body v-stack" style="--v-gap: var(--v-space-3)">
${toolbar()}
<div class="v-cluster" style="--v-gap: var(--v-space-2)">
<span class="v-text-sm v-text-secondary">Filters:</span>
<span class="v-tag" data-v-dismissable>County: Galway<button class="v-tag-remove" type="button" data-v-dismiss aria-label="Remove filter County: Galway">${icon('close')}</button></span>
<span class="v-tag" data-v-dismissable>Last job: this year<button class="v-tag-remove" type="button" data-v-dismiss aria-label="Remove filter Last job: this year">${icon('close')}</button></span>
<a class="v-btn v-btn-ghost v-btn-sm" href="list.html">Clear all</a>
</div>
</div>
<div class="v-panel-body v-flex v-wrap v-items-center v-justify-between v-gap-3" style="background-color: var(--v-accent-soft)" data-bulk>
<p class="v-text-sm v-fw-semibold" role="status"><span data-bulk-count>2</span> selected</p>
<div class="v-cluster" style="--v-gap: var(--v-space-2)">
<button class="v-btn v-btn-secondary v-btn-sm" type="button">${icon('mail')}Send message</button>
<button class="v-btn v-btn-secondary v-btn-sm" type="button">${icon('tag')}Add tag</button>
<button class="v-btn v-btn-secondary v-btn-sm" type="button">${icon('download')}Export</button>
<button class="v-btn v-btn-ghost v-btn-sm" type="button">${icon('archive')}Archive</button>
</div>
</div>
<div class="v-table-wrap" role="region" aria-labelledby="customers-caption" tabindex="0" style="--v-table-min: 52rem; border: 0; border-radius: 0">
<table class="v-table v-table-hover">
<caption class="v-sr-only" id="customers-caption">Customers in Galway, newest job first</caption>
<thead>
<tr>
<th class="v-table-check" scope="col"><input type="checkbox" aria-label="Select all customers on this page" data-bulk-all></th>
<th scope="col">Customer</th>
<th scope="col">County</th>
<th class="v-table-num" scope="col">Jobs</th>
<th scope="col">Last job</th>
<th class="v-table-num" scope="col">Total spent</th>
<th scope="col">Status</th>
<th class="v-table-actions" scope="col"><span class="v-sr-only">Open</span></th>
</tr>
</thead>
<tbody>
${CUSTOMERS.map(([ini, name, email, county, jobs, last, total, st, tone, checked]) => `<tr>
<td class="v-table-check"><input type="checkbox" aria-label="Select ${name}" data-bulk-row${checked ? ' checked' : ''}></td>
<th scope="row"><span class="v-flex v-items-center v-gap-3"><span class="v-avatar v-avatar-sm" aria-hidden="true">${ini}</span><span><a class="v-block v-fw-semibold" href="detail.html">${name}</a><span class="v-block v-text-sm v-text-secondary v-fw-regular">${email}</span></span></span></th>
<td>${county}</td>
<td class="v-table-num">${jobs}</td>
<td class="v-nowrap">${last}</td>
<td class="v-table-num">&euro;${total}</td>
<td><span class="v-badge v-badge-${tone} v-badge-dot">${st}</span></td>
<td class="v-table-actions"><a class="v-btn v-btn-ghost v-btn-sm v-btn-icon" href="detail.html" aria-label="Open ${name}">${icon('arrow')}</a></td>
</tr>`).join('\n')}
</tbody>
</table>
</div>
<div class="v-panel-footer v-justify-between">
<p class="v-text-sm v-text-secondary">Showing 1 to 8 of 96 in Galway</p>
<nav aria-label="Customer pages" style="flex: 1 1 18rem; max-inline-size: 24rem">
<ul class="v-pagination v-justify-end">
<li><span class="v-page v-page-prev" aria-disabled="true"><span class="v-page-label">Previous</span></span></li>
<li><a class="v-page" href="list.html" aria-label="Page 1" aria-current="page">1</a></li>
<li><a class="v-page" href="list.html" aria-label="Page 2">2</a></li>
<li><a class="v-page" href="list.html" aria-label="Page 3">3</a></li>
<li><span class="v-page-gap" aria-hidden="true">…</span></li>
<li><a class="v-page" href="list.html" aria-label="Page 12">12</a></li>
<li><a class="v-page v-page-next" href="list.html" rel="next"><span class="v-page-label">Next</span></a></li>
</ul>
</nav>
</div>
</div>`);

const BULK_SCRIPT = `/* Example only: the bulk bar follows the row checkboxes and the select-all box. */
const bar = document.querySelector('[data-bulk]');
const all = document.querySelector('[data-bulk-all]');
const rows = [...document.querySelectorAll('[data-bulk-row]')];
const update = () => {
  const n = rows.filter((r) => r.checked).length;
  bar.hidden = n === 0;
  bar.querySelector('[data-bulk-count]').textContent = n;
  all.checked = n === rows.length;
  all.indeterminate = n > 0 && n < rows.length;
};
all.addEventListener('change', () => { rows.forEach((r) => { r.checked = all.checked; }); update(); });
rows.forEach((r) => r.addEventListener('change', update));
update();`;

const skRow = () => `<div class="v-flex v-items-center v-gap-4" style="padding: var(--v-space-3) var(--v-space-4); border-block-start: var(--v-border-w) solid var(--v-border)">
<span class="v-skeleton v-skeleton-circle" style="--v-skeleton-size: 2rem"></span>
<span class="v-grow v-stack" style="--v-gap: var(--v-space-1)">${sk('min(14rem, 70%)')}${sk('min(10rem, 50%)', '0.75em')}</span>
<span class="v-hide-mobile">${sk('5rem')}</span>
<span class="v-hide-mobile">${sk('4rem')}</span>
${sk('4.5rem', '1.4em', '; border-radius: var(--v-radius-pill)')}
</div>`;
const listLoading = state('loading', `${listHeader('Counting your customers…')}
<div class="v-panel">
<div class="v-panel-body">${toolbar(' disabled')}</div>
<div aria-hidden="true">
${Array.from({ length: 6 }, skRow).join('\n')}
</div>
</div>`, 'customers');

const listEmpty = state('empty', `${listHeader('No customers yet.')}
<div class="v-panel">
<div class="v-empty">
<span class="v-empty-icon" aria-hidden="true">${icon('users')}</span>
<h2 class="v-empty-title">Your customers will live here</h2>
<p class="v-max-prose">Add the people you work for, or bring them across from a spreadsheet or your old system in one go. New bookings add customers on their own.</p>
<div class="v-cluster v-justify-center">
${btn('Add a customer', 'detail-empty.html', 'v-btn-primary', 'plus')}
${btn('Import a spreadsheet', '#main', 'v-btn-secondary', 'upload')}
</div>
<p class="v-text-sm">Just looking around? <a href="list.html">Fill it with sample customers</a></p>
</div>
</div>`);

const listError = state('error', `${listHeader('214 customers, 12 new this month.')}
<div class="v-panel">
<div class="v-panel-body">${toolbar()}</div>
${failed('your customers', 'list.html')}
</div>`);

// ---------------------------------------------------------------- Detail page (one customer)
const detailHeader = (meta = 'Customer since March 2024 · Tuam, Co. Galway · <span class="v-badge v-badge-success v-badge-dot">Repeat customer</span>') => header({
  crumbs: [['Customers', 'list.html']], title: 'Mary Walsh', meta,
  actions: `${btn('Call', 'tel:+353875550193', 'v-btn-secondary', 'phone')}
${btn('New job', '#main', 'v-btn-primary', 'plus')}
<button class="v-btn v-btn-secondary v-btn-icon" type="button" popovertarget="customer-menu" aria-haspopup="menu" aria-label="More actions">${icon('more')}</button>
<div class="v-menu" id="customer-menu" popover role="menu" data-v-menu aria-label="More actions">
<button class="v-menu-item" type="button" role="menuitem" popovertarget="customer-menu" popovertargetaction="hide">${icon('edit')}Edit details</button>
<button class="v-menu-item" type="button" role="menuitem" popovertarget="customer-menu" popovertargetaction="hide">${icon('send')}Send a message</button>
<button class="v-menu-item" type="button" role="menuitem" popovertarget="customer-menu" popovertargetaction="hide">${icon('archive')}Archive</button>
<hr class="v-menu-sep">
<button class="v-menu-item v-menu-item-danger" type="button" role="menuitem" popovertarget="customer-menu" popovertargetaction="hide">${icon('trash')}Delete customer</button>
</div>`,
});
const details = `<dl class="v-dl v-dl-cols">
<div><dt>Email</dt><dd>mary.walsh@example.ie</dd><dd class="v-dl-action"><button class="v-btn v-btn-ghost v-btn-sm" type="button" data-v-copy="mary.walsh@example.ie">Copy</button></dd></div>
<div><dt>Phone</dt><dd>087 555 0193</dd></div>
<div><dt>Address</dt><dd>14 Church View, Tuam, Co. Galway, H54 K7P2</dd><dd class="v-dl-action"><a class="v-btn v-btn-ghost v-btn-sm" href="#main">Directions</a></dd></div>
<div><dt>Preferred contact</dt><dd>Text message, after 17:00</dd></div>
<div><dt>Notes</dt><dd>Side gate is always open. Dog is friendly. Prefers a text before arrival.</dd><dd class="v-dl-action"><a class="v-btn v-btn-ghost v-btn-sm" href="#main">Edit</a></dd></div>
</dl>`;
const ACTIVITY = [
  ['card', 'Invoice INV-2046 paid', '3 Nov', '&euro;1,850.00 by card, two days after it was sent.'],
  ['AK', 'Aoife added a note', '1 Nov', '"Back gutter needs a new bracket next visit. Quoted &euro;60, she said yes."'],
  ['check-circle', 'Job completed: slate re-roof', '31 Oct', 'Finished a day early. Review request sent at 19:00.'],
  ['star', 'Left a 5-star review', '31 Oct', '"Tidy, on time and the price was the price."'],
  ['calendar', 'Booked online', '14 Oct', 'Slate re-roof, from the booking page on your website.'],
];
const activity = `<ol class="v-timeline">
${ACTIVITY.map(([ic, t, when, body]) => `<li class="v-timeline-item">
<span class="v-timeline-marker" aria-hidden="true">${ic.length === 2 ? `<span class="v-avatar">${ic}</span>` : icon(ic)}</span>
<div class="v-timeline-content">
<div class="v-timeline-header"><p class="v-timeline-title">${t}</p><span class="v-timeline-time">${when}</span></div>
<p class="v-timeline-body">${body}</p>
</div>
</li>`).join('\n')}
</ol>`;
const noteForm = (id) => `<form class="v-form v-mt-6" action="detail.html" method="post">
${CSRF}
<div class="v-field">
<label class="v-label" for="${id}">Add a note</label>
<textarea class="v-input" id="${id}" name="note" rows="2" placeholder="Only your team can see notes"></textarea>
</div>
<div class="v-form-actions"><button class="v-btn v-btn-secondary v-btn-sm" type="submit">Save note</button></div>
</form>`;
const relatedJobs = `<ul class="v-list" style="border: 0; border-radius: 0">
${[['Gutter bracket', 'Booked for 19 Nov', 'Booked', 'accent'], ['Slate re-roof', 'Finished 31 Oct', 'Done', 'success'], ['Chimney flashing', 'Finished June 2025', 'Done', 'success'], ['Roof survey', 'Finished March 2024', 'Done', 'success']].map(([t, m, s, tone]) => `<li><a class="v-list-item" href="#main"><span class="v-list-body"><span class="v-list-title">${t}</span><span class="v-list-meta">${m}</span></span><span class="v-list-end"><span class="v-badge v-badge-${tone} v-badge-dot">${s}</span></span></a></li>`).join('\n')}
</ul>`;
const relatedInvoices = `<ul class="v-list" style="border: 0; border-radius: 0">
${[['INV-2046', 'Paid 3 Nov', '1,850.00'], ['INV-1710', 'Paid June 2025', '170.00'], ['INV-1202', 'Paid March 2024', '150.00']].map(([n, m, a]) => `<li><a class="v-list-item" href="#main"><span class="v-list-body"><span class="v-list-title">${n}</span><span class="v-list-meta">${m}</span></span><span class="v-list-end v-tabular">&euro;${a}</span></a></li>`).join('\n')}
</ul>`;
const panel = (title, body, { action = '', footer = '', flush = false, id } = {}) => `<section class="v-panel"${id ? ` aria-labelledby="${id}"` : ''}>
<div class="v-panel-header"><h2 class="v-panel-title"${id ? ` id="${id}"` : ''}>${title}</h2>${action}</div>
${flush ? body : `<div class="v-panel-body">\n${body}\n</div>`}
${footer ? `<div class="v-panel-footer">${footer}</div>` : ''}
</section>`;
const detailLayout = (main, side) => `<div class="v-bento">
<div class="v-span-8 v-stack" style="--v-gap: var(--v-space-5)">
${main}
</div>
<div class="v-span-4 v-stack" style="--v-gap: var(--v-space-5)">
${side}
</div>
</div>`;

const stats = `<div class="v-grid v-grid-fit" style="--v-min: 9rem">
<div class="v-card v-stat"><span class="v-stat-label">Total paid</span><span class="v-stat-value">&euro;2,170</span></div>
<div class="v-card v-stat"><span class="v-stat-label">Jobs</span><span class="v-stat-value">4</span></div>
<div class="v-card v-stat"><span class="v-stat-label">Average review</span><span class="v-stat-value">5.0</span></div>
</div>`;
const detailLoaded = state('loaded', `${detailHeader()}
${detailLayout(`${stats}
${panel('Details', details, { action: btn('Edit', '#main', 'v-btn-ghost v-btn-sm', 'edit'), id: 'details-title' })}
${panel('Activity', `${activity}\n${noteForm('note')}`, { id: 'activity-title' })}`,
  `${panel('Jobs', relatedJobs, { action: btn('New', '#main', 'v-btn-ghost v-btn-sm', 'plus'), flush: true, id: 'jobs-title' })}
${panel('Invoices', relatedInvoices, { flush: true, footer: '<p class="v-text-sm v-text-secondary">Nothing owed. Last paid 3 Nov.</p>', id: 'invoices-title' })}
${panel('Tags', '<div class="v-cluster" style="--v-gap: var(--v-space-2)"><span class="v-tag">Repeat</span><span class="v-tag">Slate roof</span><span class="v-tag">Pays by card</span></div>', { id: 'tags-title' })}`)}`);

const skPanel = (title, lines) => `<div class="v-panel" aria-hidden="true">
<div class="v-panel-header">${sk('8rem', '1.2em')}</div>
<div class="v-panel-body v-stack" style="--v-gap: var(--v-space-3)" data-skeleton="${title}">
${lines.map((w) => sk(w)).join('\n')}
</div>
</div>`;
const detailLoading = state('loading', `${header({ crumbs: [['Customers', 'list.html']], title: 'Mary Walsh', meta: 'Loading details…' })}
<div aria-hidden="true">
${detailLayout(`<div class="v-grid v-grid-fit" style="--v-min: 9rem">${Array.from({ length: 3 }, () => `<div class="v-card v-stack" style="--v-gap: var(--v-space-2)">${sk('60%', '0.8em')}${sk('45%', '1.8em')}</div>`).join('')}</div>
${skPanel('Details', ['90%', '75%', '85%', '60%'])}
${skPanel('Activity', ['80%', '95%', '70%', '88%', '64%'])}`, `${skPanel('Jobs', ['85%', '70%', '78%'])}
${skPanel('Invoices', ['75%', '65%'])}`)}
</div>`, 'customer details');

const detailEmpty = state('empty', `${detailHeader('Added just now · Tuam, Co. Galway · <span class="v-badge v-badge-info v-badge-dot">New customer</span>')}
<div class="v-alert v-alert-success" role="status">${icon('check-circle')}<p class="v-alert-body"><span class="v-alert-title">Mary Walsh was added.</span> Book her first job, or send a quote.</p></div>
${detailLayout(`${panel('Details', `<dl class="v-dl v-dl-cols">
<div><dt>Email</dt><dd>mary.walsh@example.ie</dd></div>
<div><dt>Phone</dt><dd>087 555 0193</dd></div>
<div><dt>Address</dt><dd><a href="#main">Add an address</a></dd></div>
<div><dt>Notes</dt><dd><a href="#main">Add a note</a></dd></div>
</dl>`, { action: btn('Edit', '#main', 'v-btn-ghost v-btn-sm', 'edit'), id: 'details-title' })}
${panel('Activity', `<div class="v-empty" style="padding-block: var(--v-space-6)">
<span class="v-empty-icon" aria-hidden="true">${icon('clock')}</span>
<h3 class="v-empty-title">Nothing has happened yet</h3>
<p class="v-max-prose">Bookings, quotes, invoices and notes for Mary will show up here as they happen.</p>
</div>
${noteForm('note-empty')}`, { id: 'activity-title' })}`,
  `${panel('Jobs', `<div class="v-empty" style="padding-block: var(--v-space-5)">
<p>No jobs yet.</p>
${btn('Book the first job', '#main', 'v-btn-primary v-btn-sm', 'plus')}
</div>`, { flush: true, id: 'jobs-title' })}
${panel('Invoices', '<div class="v-empty" style="padding-block: var(--v-space-5)"><p>No invoices yet. They appear once a job is done.</p></div>', { flush: true, id: 'invoices-title' })}`)}`);

const detailError = state('error', `${detailHeader()}
${detailLayout(`${stats}
${panel('Details', details, { action: btn('Edit', '#main', 'v-btn-ghost v-btn-sm', 'edit'), id: 'details-title' })}
${panel('Activity', `${failedInline('Activity', 'detail.html')}\n${noteForm('note-error')}`, { id: 'activity-title' })}`,
  `${panel('Jobs', relatedJobs, { flush: true, id: 'jobs-title' })}
${panel('Invoices', relatedInvoices, { flush: true, id: 'invoices-title' })}`)}`);

// ---------------------------------------------------------------- Settings
const SETTINGS = [['profile', 'Profile'], ['account', 'Account'], ['security', 'Security'], ['notifications', 'Notifications']];
const settingsHeader = (current, extra = '') => header({
  kicker: 'Harbour Roofing', title: 'Settings', meta: 'Your own details, how you sign in and what we send you.',
  actions: extra,
  tabs: `<nav class="v-tablist" aria-label="Settings sections">
${SETTINGS.map(([s, t]) => `<a class="v-tab" href="settings-${s}.html"${s === current ? ' aria-current="page"' : ''}>${t}</a>`).join('\n')}
</nav>`,
});
const sectionRow = (title, text, body, id) => `<div class="v-form-section">
<div class="v-form-section-header">
<h2 class="v-form-section-title"${id ? ` id="${id}"` : ''}>${title}</h2>
<p class="v-form-section-text">${text}</p>
</div>
<div class="v-form-section-body">
${body}
</div>
</div>`;
const field = (id, label, input, { hint, error, optional } = {}) => `<div class="v-field">
<label class="v-label" for="${id}">${label}${optional ? ' <span class="v-optional">Optional</span>' : ''}</label>
${input}
${hint ? `<p class="v-hint" id="${id}-hint">${hint}</p>` : ''}
${error ? `<p class="v-field-error" id="${id}-error">${error}</p>` : ''}
</div>`;
const input = (id, name, { type = 'text', value = '', auto, required, describe, extra = '' } = {}) => `<input class="v-input" id="${id}" name="${name}" type="${type}"${value ? ` value="${value}"` : ''}${auto ? ` autocomplete="${auto}"` : ''}${required ? ' required' : ''}${describe ? ` aria-describedby="${id}-hint"` : ''}${extra}>`;
const actions = (saved = 'Last saved today at 09:12') => `<div class="v-form-actions">
<p class="v-hint v-form-actions-start">${saved}</p>
<button class="v-btn v-btn-ghost" type="reset">Discard</button>
<button class="v-btn v-btn-primary" type="submit">Save changes</button>
</div>`;

// Profile
const profileForm = (v, id = 'profile-form') => `<form class="v-form" id="${id}" method="post" action="settings-profile.html" data-v-validate data-v-unsaved>
${CSRF}
${sectionRow('Photo', 'Shown to your team and on messages to customers.', `<div class="v-flex v-items-center v-gap-4">
<span class="v-avatar v-avatar-lg" aria-hidden="true">${v.initials}</span>
<label class="v-dropzone v-grow" data-v-dropzone>
<span class="v-dropzone-title">Drop a photo or <strong>browse</strong></span>
<span>PNG or JPG, at least 256 pixels square</span>
<input type="file" name="photo" accept=".png,.jpg,.jpeg">
</label>
</div>`)}
${sectionRow('Personal details', 'Your name appears on quotes and invoices you send.', `<div class="v-form-grid">
${field('first-name', 'First name', input('first-name', 'first_name', { value: v.first, auto: 'given-name', required: true }), { error: 'Enter your first name.' })}
${field('last-name', 'Last name', input('last-name', 'last_name', { value: v.last, auto: 'family-name', required: true }), { error: 'Enter your last name.' })}
${field('job-title', 'Job title', input('job-title', 'job_title', { value: v.title, auto: 'organization-title' }), { optional: true })}
${field('phone', 'Mobile number', input('phone', 'phone', { type: 'tel', value: v.phone, auto: 'tel', describe: true }), { hint: 'For text alerts. Customers never see it.', optional: true })}
<div class="v-form-full">
<div class="v-field" data-v-counter>
<label class="v-label" for="bio">About you <span class="v-optional">Optional</span></label>
<textarea class="v-input" id="bio" name="bio" rows="3" maxlength="280" aria-describedby="bio-hint">${v.bio}</textarea>
<p class="v-hint" id="bio-hint">A line or two for your public booking page.</p>
</div>
</div>
</div>`)}
${sectionRow('Language and time', 'Used for dates, times and emails we send you.', `<div class="v-form-grid">
${field('language', 'Language', '<select class="v-select" id="language" name="language"><option selected>English (Ireland)</option><option>Gaeilge</option><option>English (UK)</option></select>')}
${field('timezone', 'Time zone', '<select class="v-select" id="timezone" name="timezone"><option selected>Dublin (GMT+0, summer GMT+1)</option><option>London (GMT+0, summer GMT+1)</option></select>')}
</div>`)}
${actions(v.saved)}
</form>`;
const PROFILE = { initials: 'AK', first: 'Aoife', last: 'Kelly', title: 'Owner', phone: '087 555 0142', bio: 'Roofer\'s daughter, roofer\'s boss. Slate, tile and flat roofs across north Galway since 2011.', saved: 'Last saved today at 09:12' };
const BLANK = { initials: 'AK', first: 'Aoife', last: 'Kelly', title: '', phone: '', bio: '', saved: 'Not saved yet' };

const profileLoaded = state('loaded', `${settingsHeader('profile')}\n${profileForm(PROFILE)}`);
const profileEmpty = state('empty', `${settingsHeader('profile')}
<div class="v-alert v-alert-info" role="status">${icon('sparkle')}<div class="v-alert-body"><p class="v-alert-title">Welcome to Northwind, Aoife</p><p>Add a photo and a mobile number so customers know who is coming, and so we can text you new bookings.</p></div></div>
${profileForm(BLANK, 'profile-form-empty')}`);
const skSection = (rows) => `<div class="v-form-section" aria-hidden="true">
<div class="v-form-section-header v-stack" style="--v-gap: var(--v-space-2)">${sk('9rem', '1.2em')}${sk('80%', '0.8em')}</div>
<div class="v-form-section-body v-stack" style="--v-gap: var(--v-space-4)">
${Array.from({ length: rows }, () => `<div class="v-stack" style="--v-gap: var(--v-space-2)">${sk('6rem', '0.8em')}${sk('100%', '2.6rem', '; border-radius: var(--v-radius-md)')}</div>`).join('\n')}
</div>
</div>`;
const skForm = (sections) => `<div class="v-form">\n${sections.map(skSection).join('\n')}\n</div>`;
const profileLoading = state('loading', `${settingsHeader('profile')}\n${skForm([1, 3, 2])}`, 'your profile');
const profileError = state('error', `${settingsHeader('profile')}\n<div class="v-panel">\n${failed('your profile', 'settings-profile.html', 'Your details are safe, but we could not fetch them just now.')}\n</div>`);

// Account
const accountBody = (v) => `<form class="v-form" id="account-form" method="post" action="settings-account.html" data-v-validate data-v-unsaved>
${CSRF}
${sectionRow('Business', 'Printed on your quotes, invoices and booking page.', `<div class="v-form-grid">
${field('business', 'Business name', input('business', 'business_name', { value: v.business, auto: 'organization', required: true }), { error: 'Enter your business name.' })}
${field('vat', 'VAT number', input('vat', 'vat', { value: v.vat, describe: true }), { hint: 'Leave blank if you are not registered.', optional: true })}
<div class="v-form-full">${field('address', 'Address', input('address', 'address', { value: v.address, auto: 'street-address' }))}</div>
${field('county', 'County', '<select class="v-select" id="county" name="county"><option>Galway</option><option>Mayo</option><option>Clare</option><option>Roscommon</option></select>')}
${field('eircode', 'Eircode', input('eircode', 'eircode', { value: v.eircode, auto: 'postal-code' }))}
</div>`)}
${sectionRow('Sign-in email', 'Where we send receipts and security alerts.', `<div class="v-form-inline">
${field('account-email', 'Email', input('account-email', 'email', { type: 'email', value: 'aoife@harbourroofing.ie', auto: 'email', required: true }), { error: 'Enter your email address, like name@example.com.' })}
<a class="v-btn v-btn-secondary" href="#main">Change email</a>
</div>
<p class="v-hint">${icon('check-circle')} Verified on 2 March 2024</p>`)}
${sectionRow('Region', 'Currency and the first day of your week.', `<div class="v-form-grid">
${field('currency', 'Currency', '<select class="v-select" id="currency" name="currency"><option selected>Euro (&euro;)</option><option>Pound sterling (&pound;)</option></select>')}
${field('week', 'Week starts on', '<select class="v-select" id="week" name="week"><option selected>Monday</option><option>Sunday</option></select>')}
</div>`)}
${actions()}
</form>`;
const ACCOUNT = { business: 'Harbour Roofing', vat: 'IE 3456789 PH', address: 'Unit 4, Dublin Road, Tuam', eircode: 'H54 R2X4' };
const planPanel = panel('Plan', `<dl class="v-dl v-dl-cols">
<div><dt>Current plan</dt><dd><span class="v-badge v-badge-accent">Crew</span> &euro;29 a month</dd></div>
<div><dt>Team logins</dt><dd>4 of 5 used</dd></div>
<div><dt>Next bill</dt><dd>1 December 2026, card ending 4242</dd></div>
</dl>`, { action: btn('Change plan', '../pricing.html', 'v-btn-secondary v-btn-sm'), id: 'plan-title' });
const dangerZone = `<section class="v-panel v-danger-zone" aria-labelledby="danger-title">
<div class="v-panel-header"><h2 class="v-panel-title" id="danger-title">Danger zone</h2></div>
<div class="v-panel-body">
<div><h3 class="v-fw-semibold" style="font-size: var(--v-step-0)">Export everything</h3><p class="v-text-sm">Download all customers, jobs and invoices as a spreadsheet.</p></div>
${btn('Export', '#main', 'v-btn-secondary v-btn-sm', 'download')}
</div>
<div class="v-panel-body">
<div><h3 class="v-fw-semibold" style="font-size: var(--v-step-0)">Transfer ownership</h3><p class="v-text-sm">Hand the account to another admin. You stay on the team as an admin.</p></div>
${btn('Transfer', '#main', 'v-btn-secondary v-btn-sm')}
</div>
<div class="v-panel-body">
<div><h3 class="v-fw-semibold" style="font-size: var(--v-step-0)">Delete this account</h3><p class="v-text-sm">Removes Harbour Roofing, its customers and every invoice. This cannot be undone.</p></div>
<a class="v-btn v-btn-danger v-btn-sm" href="../../auth/accounts/delete.html">${icon('trash')}Delete account</a>
</div>
</section>`;
const accountLoaded = state('loaded', `${settingsHeader('account')}\n${accountBody(ACCOUNT)}\n${planPanel}\n${dangerZone}`);
const accountEmpty = state('empty', `${settingsHeader('account')}
<div class="v-alert v-alert-info" role="status">${icon('info')}<div class="v-alert-body"><p class="v-alert-title">Add your business details before your first invoice</p><p>Customers see these on every quote and invoice. You can change them whenever you like.</p></div></div>
${accountBody({ business: '', vat: '', address: '', eircode: '' })}
${panel('Plan', `<p>You are on the <strong>Crew</strong> trial, with 14 days left. No card added, so nothing will be charged.</p>`, { action: btn('Choose a plan', '../pricing.html', 'v-btn-primary v-btn-sm'), id: 'plan-title' })}
${dangerZone}`);
const accountLoading = state('loading', `${settingsHeader('account')}\n${skForm([3, 1, 2])}`, 'your account');
const accountError = state('error', `${settingsHeader('account')}
${accountBody(ACCOUNT)}
${panel('Plan', failedInline('Your plan and billing details', 'settings-account.html'), { id: 'plan-title' })}
${dangerZone}`);

// Security
const pwField = (id, name, label, auto, { strength, hint, error }) => `<div class="v-field">
<label class="v-label" for="${id}">${label}</label>
<div class="v-input-group" data-v-password>
<input class="v-input" id="${id}" name="${name}" type="password" autocomplete="${auto}" required${auto === 'new-password' ? ' minlength="8"' : ''}${hint ? ` aria-describedby="${id}-hint"` : ''}${strength ? ` data-v-strength="#${id}-meter"` : ''}>
<button class="v-btn v-btn-ghost v-btn-icon v-password-toggle" type="button" aria-label="Show password" aria-pressed="false" aria-controls="${id}">${icon('eye')}${icon('eye-off')}</button>
</div>
${strength ? `<meter class="v-meter" id="${id}-meter" min="0" max="4" low="2" high="3" optimum="4" value="0" aria-label="Password strength"></meter>` : ''}
${hint ? `<p class="v-hint" id="${id}-hint">${hint}</p>` : ''}
<p class="v-field-error" id="${id}-error">${error}</p>
</div>`;
const passwordForm = `<form class="v-form" id="password-form" method="post" action="settings-security.html" data-v-validate>
${CSRF}
${sectionRow('Password', 'Last changed 4 months ago. Use one you do not use anywhere else.', `<input type="hidden" name="username" value="aoife@harbourroofing.ie" autocomplete="username">
${pwField('current-password', 'current_password', 'Current password', 'current-password', { error: 'Enter your current password.' })}
${pwField('new-password', 'password', 'New password', 'new-password', { strength: true, hint: 'At least 8 characters. A few unrelated words work well.', error: 'Use at least 8 characters.' })}
${pwField('confirm-password', 'password_confirmation', 'Confirm new password', 'new-password', { error: 'Type the new password again.' })}
<div class="v-cluster v-justify-end"><button class="v-btn v-btn-primary" type="submit">Update password</button></div>`)}
</form>`;
const twoFactorOn = panel('Two-step sign-in', `<div class="v-stack">
<div class="v-flex v-items-center v-gap-3 v-wrap"><span class="v-badge v-badge-success v-badge-dot">On</span><p>We ask for a code from your authenticator app when you sign in on a new device.</p></div>
<dl class="v-dl v-dl-cols">
<div><dt>Method</dt><dd>Authenticator app, added 2 March 2024</dd><dd class="v-dl-action"><a class="v-btn v-btn-ghost v-btn-sm" href="../../auth/two-factor/setup.html">Change</a></dd></div>
<div><dt>Recovery codes</dt><dd>7 of 10 left</dd><dd class="v-dl-action"><a class="v-btn v-btn-ghost v-btn-sm" href="../../auth/two-factor/recovery-codes.html">View or renew</a></dd></div>
<div><dt>Backup phone</dt><dd>Ends in 0142</dd><dd class="v-dl-action"><a class="v-btn v-btn-ghost v-btn-sm" href="#main">Edit</a></dd></div>
</dl>
</div>`, { action: '<button class="v-btn v-btn-ghost v-btn-sm" type="button">Turn off</button>', id: 'twofa-title' });
const twoFactorOff = panel('Two-step sign-in', `<div class="v-stack">
<div class="v-alert v-alert-warning">${icon('alert')}<div class="v-alert-body"><p class="v-alert-title">Two-step sign-in is off</p><p>Anyone with your password can get into your account. Turning it on takes two minutes and an app on your phone.</p></div></div>
<div class="v-cluster">${btn('Turn on two-step sign-in', '../../auth/two-factor/setup.html', 'v-btn-primary', 'shield')}</div>
</div>`, { id: 'twofa-title' });
const SESSIONS = [
  ['laptop', 'Chrome on Windows', 'Tuam, Ireland', 'Active now', true],
  ['smartphone', 'Safari on iPhone', 'Galway, Ireland', '2 hours ago'],
  ['smartphone', 'Northwind app on Android', 'Westport, Ireland', 'Yesterday at 18:40'],
  ['laptop', 'Firefox on Linux', 'Dublin, Ireland', '3 weeks ago'],
];
const sessionList = (items) => `<ul class="v-list" style="border: 0; border-radius: 0">
${items.map(([ic, device, where, when, current]) => `<li class="v-list-item">
<span class="v-feature-icon" aria-hidden="true">${icon(ic)}</span>
<span class="v-list-body"><span class="v-list-title">${device}</span><span class="v-list-meta">${where} · ${when}</span></span>
<span class="v-list-end">${current ? '<span class="v-badge v-badge-success v-badge-dot">This device</span>' : `<button class="v-btn v-btn-ghost v-btn-sm" type="button" aria-label="Sign out ${device} in ${where.split(',')[0]}">${icon('logout')}Sign out</button>`}</span>
</li>`).join('\n')}
</ul>`;
const sessions = (items, footer = true) => panel('Where you are signed in', sessionList(items), {
  flush: true, id: 'sessions-title',
  footer: footer ? `<p class="v-text-sm v-text-secondary v-grow">Do not recognise one? Sign it out and change your password.</p><button class="v-btn v-btn-secondary v-btn-sm" type="button">${icon('logout')}Sign out of all other devices</button>` : '',
});
const securityLog = panel('Recent security activity', `<ol class="v-timeline">
${[['Signed in from a new device', 'Safari on iPhone, Galway', 'Today, 07:12'], ['Recovery codes viewed', 'Chrome on Windows, Tuam', '28 Oct'], ['Password changed', 'Chrome on Windows, Tuam', '2 Jul']].map(([t, b, w]) => `<li class="v-timeline-item"><span class="v-timeline-marker" aria-hidden="true"></span><div class="v-timeline-content"><div class="v-timeline-header"><p class="v-timeline-title">${t}</p><span class="v-timeline-time">${w}</span></div><p class="v-timeline-body">${b}</p></div></li>`).join('\n')}
</ol>`, { id: 'log-title' });
const securityLoaded = state('loaded', `${settingsHeader('security')}\n${passwordForm}\n${twoFactorOn}\n${sessions(SESSIONS)}\n${securityLog}`);
const securityEmpty = state('empty', `${settingsHeader('security')}\n${passwordForm}\n${twoFactorOff}
${panel('Where you are signed in', `${sessionList([SESSIONS[0]])}
<p class="v-panel-body v-text-sm v-text-secondary">No other devices. When you sign in on your phone or another computer, it shows up here.</p>`, { flush: true, id: 'sessions-title' })}`);
const securityLoading = state('loading', `${settingsHeader('security')}\n${skForm([3])}\n${skPanel('Two-step sign-in', ['70%', '85%', '60%'])}\n${skPanel('Sessions', ['80%', '75%', '82%'])}`, 'your security settings');
const securityError = state('error', `${settingsHeader('security')}\n${passwordForm}\n${twoFactorOn}
${panel('Where you are signed in', failedInline('Your list of signed-in devices', 'settings-security.html'), { id: 'sessions-title' })}`);

// Notifications
const PREFS = [
  ['Jobs and bookings', 'What lands in your calendar.', [['booking', 'New booking', 'Someone books from your website or booking link.', [1, 1, 1]], ['cancel', 'Booking moved or cancelled', 'A customer changes their plans.', [1, 1, 0]], ['morning', 'Your day ahead', 'A short plan of today\'s jobs at 07:00.', [0, 1, 0]]]],
  ['Money', 'Payments in and out.', [['paid', 'Invoice paid', 'A customer pays an invoice.', [1, 0, 0]], ['failed', 'Payment failed', 'A card is declined or a payout bounces.', [1, 1, 1]], ['weekly', 'Weekly summary', 'Takings, unpaid invoices and next week, every Monday.', [1, 0, 0]]]],
  ['Reviews', 'What customers say.', [['review', 'New review', 'Someone leaves a review on your profile.', [1, 1, 0]]]],
];
const CHANNELS = ['Email', 'Push', 'Text'];
const prefsForm = (textOff = false) => `<form class="v-form" id="notifications-form" method="post" action="settings-notifications.html" data-autosave>
${CSRF}
${PREFS.map(([group, text, rows]) => sectionRow(group, text, rows.map(([id, label, hint, on]) => `<fieldset class="v-stack" style="--v-gap: var(--v-space-2); margin: 0; padding: 0; border: 0" aria-describedby="pref-${id}-hint">
<legend class="v-fw-semibold">${label}</legend>
<p class="v-hint" id="pref-${id}-hint">${hint}</p>
<div class="v-cluster" style="--v-gap: var(--v-space-2) var(--v-space-5)">
${CHANNELS.map((c, i) => `<label class="v-choice"><input class="v-switch" type="checkbox" role="switch" name="${id}[]" value="${c.toLowerCase()}"${on[i] && !(textOff && i === 2) ? ' checked' : ''}${textOff && i === 2 ? ' disabled' : ''}><span>${c}</span></label>`).join('\n')}
</div>
</fieldset>`).join('\n'))).join('\n')}
${sectionRow('Quiet hours', 'No push or text alerts in this window. Emails still arrive.', `<label class="v-choice"><input class="v-switch" type="checkbox" role="switch" name="quiet" checked><span>Pause alerts overnight</span></label>
<div class="v-form-grid">
${field('quiet-from', 'From', '<input class="v-input" id="quiet-from" name="quiet_from" type="time" value="21:00">')}
${field('quiet-to', 'Until', '<input class="v-input" id="quiet-to" name="quiet_to" type="time" value="07:00">')}
</div>`)}
</form>`;
const saveStatusEl = (text = 'Saved 2 minutes ago') => `<p class="v-save-status" data-state="saved" data-notify-status><span data-v-save-status-text>${text}</span></p>`;
const notifLoaded = state('loaded', `${settingsHeader('notifications', saveStatusEl())}
<p class="v-text-secondary">Changes save as you go.</p>
${prefsForm()}`);
const notifEmpty = state('empty', `${settingsHeader('notifications', saveStatusEl('Recommended settings'))}
<div class="v-alert v-alert-info" role="status">${icon('info')}<div class="v-alert-body"><p class="v-alert-title">These are the settings we recommend to start</p><p>Text alerts need a mobile number: <a href="settings-profile-empty.html">add one to your profile</a> to switch them on. Anything you change saves as you go.</p></div></div>
${prefsForm(true)}`);
const notifLoading = state('loading', `${settingsHeader('notifications')}\n${skForm([3, 3, 1])}`, 'your notification settings');
const notifError = state('error', `${settingsHeader('notifications', '<p class="v-save-status" data-state="failed"><span data-v-save-status-text>Not saved</span></p>')}
<div class="v-panel">
${failed('your notification settings', 'settings-notifications.html', 'Your settings have not changed, but we could not show them just now.')}
</div>`);
const AUTOSAVE = `import { saveStatus } from '../../../src/js/index.js';

/* Example only: each switch saves on change. A real app would send the form here and show 'failed' on an error. */
const status = document.querySelector('[data-notify-status]');
document.querySelector('[data-autosave]').addEventListener('change', () => {
  saveStatus(status, 'saving');
  setTimeout(() => saveStatus(status, 'saved'), 700);
});`;

// One family = the loaded page plus its three state files.
const FAMILIES = [
  ['list', 'Customers', 'Customer list', [listLoaded, listLoading, listEmpty, listError], BULK_SCRIPT],
  ['detail', 'Customers', 'Customer detail', [detailLoaded, detailLoading, detailEmpty, detailError]],
  ['settings-profile', 'Settings', 'Profile settings', [profileLoaded, profileLoading, profileEmpty, profileError]],
  ['settings-account', 'Settings', 'Account settings', [accountLoaded, accountLoading, accountEmpty, accountError]],
  ['settings-security', 'Settings', 'Security settings', [securityLoaded, securityLoading, securityEmpty, securityError]],
  ['settings-notifications', 'Settings', 'Notification settings', [notifLoaded, notifLoading, notifEmpty, notifError], AUTOSAVE],
];

export function appPages(page) {
  const out = [['app/stacked.html', page({
    title: 'Jobs · Northwind', description: 'The stacked app shell (top navigation only), an example built with Vectra.',
    depth: 1, label: 'stacked shell', body: stacked,
  })]];
  for (const [slug, nav, name, bodies, script] of FAMILIES) {
    STATES.forEach(([suffix, label], i) => {
      out.push([`app/${slug}${suffix}.html`, page({
        title: `${name}${i ? ` (${label.toLowerCase()})` : ''} · Northwind`,
        description: `${name}, ${label.toLowerCase()} state: a Northwind app page built with Vectra.`,
        depth: 1,
        label: name.toLowerCase(),
        variants: { label: 'State', items: STATES.map(([s, l]) => [l, `${slug}${s}.html`, s === suffix]) },
        body: appShell(nav, bodies[i]),
        script: i === 0 ? script : (slug === 'settings-notifications' && i === 2 ? AUTOSAVE : undefined),
      })]);
    });
  }
  return out;
}

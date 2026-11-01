/* v2.1 app pages (build/pages.mjs): settings for billing, team, API keys and integrations, plus the
   notifications page, search results and a public profile. They live in the sidebar shell, whose top bar
   now has the notification centre and the command palette, and they use the v2.1 components: progress
   rings and charts, tag input, split button, copy buttons, lightbox, masonry, rating and read more. */
import { icon, appShell, CSRF } from './shared.mjs';
import { btn, header, panel, sectionRow, field, input, settingsHeader } from './app.mjs';

const ring = (value, label, tone = '') => `<div class="v-progress-ring${tone}" role="progressbar" aria-valuenow="${value}" aria-valuemin="0" aria-valuemax="100" aria-label="${label}" style="--v-value: ${value}"><span>${value}%</span></div>`;

// ---------------------------------------------------------------- Billing
const INVOICES = [['NW-2026-10', '1 October 2026', '€59.00'], ['NW-2026-09', '1 September 2026', '€59.00'], ['NW-2026-08', '1 August 2026', '€59.00'], ['NW-2026-07', '1 July 2026', '€49.00']];
const billing = `${settingsHeader('billing')}
<div class="v-grid v-grid-fit" style="--v-min: 18rem">
${panel('Plan', `<div class="v-stack" style="--v-gap: var(--v-space-3)">
<div class="v-flex v-items-baseline v-gap-2"><span class="v-stat-value">€59</span><span class="v-text-secondary">a month, Crew plan</span></div>
<p class="v-text-secondary">Renews on 1 November 2026. Up to 5 people and unlimited quotes.</p>
<div class="v-cluster" style="--v-gap: var(--v-space-2)">
${btn('Change plan', '../pricing.html', 'v-btn-primary v-btn-sm')}
<button class="v-btn v-btn-ghost v-btn-sm" type="button">Cancel plan</button>
</div>
</div>`, { id: 'plan-title' })}
${panel('This month', `<div class="v-flex v-items-center v-gap-5 v-wrap">
<div class="v-flex v-items-center v-gap-3">${ring(60, 'Team seats used')}<span class="v-text-sm"><span class="v-block v-fw-semibold">3 of 5 seats</span><span class="v-text-secondary">used</span></span></div>
<div class="v-flex v-items-center v-gap-3">${ring(86, 'Text messages used', ' v-progress-ring-warning')}<span class="v-text-sm"><span class="v-block v-fw-semibold">430 of 500 texts</span><span class="v-text-secondary">resets on 1 November</span></span></div>
</div>`, { id: 'usage-title' })}
</div>
${panel('Payment method', `<div class="v-flex v-items-center v-justify-between v-wrap v-gap-3">
<div class="v-flex v-items-center v-gap-3">${icon('card')}<span><span class="v-block v-fw-semibold">Visa ending in 4242</span><span class="v-text-sm v-text-secondary">Expires 08/2028</span></span></div>
<button class="v-btn v-btn-secondary v-btn-sm" type="button">Update card</button>
</div>`, { id: 'payment-title' })}
${panel('Invoices', `<div class="v-table-wrap">
<table class="v-table">
<caption class="v-sr-only">Your Northwind invoices</caption>
<thead><tr><th scope="col">Invoice</th><th scope="col">Date</th><th scope="col" class="v-text-end">Amount</th><th scope="col"><span class="v-sr-only">Download</span></th></tr></thead>
<tbody>
${INVOICES.map(([n, d, a]) => `<tr><td>${n}</td><td>${d}</td><td class="v-text-end v-tabular">${a}</td><td class="v-text-end"><a class="v-btn v-btn-ghost v-btn-sm" href="#main" aria-label="Download ${n} as PDF">${icon('download')}PDF</a></td></tr>`).join('\n')}
</tbody>
</table>
</div>`, { flush: true, id: 'invoices-title' })}`;

// ---------------------------------------------------------------- Team
const MEMBERS = [['AK', 'Aoife Kelly', 'aoife@harbourroofing.ie', 'Owner'], ['DK', 'Dara Kelly', 'dara@harbourroofing.ie', 'Admin'], ['PB', 'Pádraig Burke', 'padraig@harbourroofing.ie', 'Crew']];
const team = `${settingsHeader('team')}
<form class="v-form" action="settings-team.html" method="post" data-v-validate>
${CSRF}
${sectionRow('Invite people', 'They get an email with a link to join Harbour Roofing. You have 2 seats left on the Crew plan.', `<div class="v-field">
<label class="v-label" for="invite-emails">Email addresses</label>
<p class="v-hint" id="invite-emails-hint">Press Enter or a comma after each address.</p>
<div class="v-tag-input" data-v-tag-input data-max="2"><input class="v-input" id="invite-emails" name="emails" aria-describedby="invite-emails-hint" autocomplete="off" placeholder="name@example.com"></div>
</div>
${field('invite-role', 'Role', `<select class="v-select" id="invite-role" name="role"><option>Crew</option><option>Admin</option></select>`, { hint: 'Crew see their own jobs. Admins see everything except billing.' })}
<div class="v-cluster v-justify-end"><button class="v-btn v-btn-primary" type="submit">${icon('send')}Send invites</button></div>`)}
</form>
${panel('Members', `<ul class="v-list" style="border: 0; border-radius: 0" role="list">
${MEMBERS.map(([i, n, e, r]) => `<li class="v-list-item"><span class="v-avatar v-avatar-sm" aria-hidden="true">${i}</span><span class="v-list-body"><span class="v-list-title">${n}</span><span class="v-list-meta">${e}</span></span><span class="v-list-end">${r === 'Owner' ? '<span class="v-badge">Owner</span>' : `<label class="v-sr-only" for="role-${i}">Role for ${n}</label><select class="v-select v-input-sm" id="role-${i}" name="role[${i}]" style="inline-size: auto"><option${r === 'Admin' ? ' selected' : ''}>Admin</option><option${r === 'Crew' ? ' selected' : ''}>Crew</option></select>`}</span></li>`).join('\n')}
</ul>`, { flush: true, id: 'members-title' })}
${panel('Pending invites', `<ul class="v-list" style="border: 0; border-radius: 0" role="list">
<li class="v-list-item"><span class="v-avatar v-avatar-sm" aria-hidden="true">${icon('mail')}</span><span class="v-list-body"><span class="v-list-title">ciara@harbourroofing.ie</span><span class="v-list-meta">Crew · sent 2 days ago</span></span><span class="v-list-end"><button class="v-btn v-btn-ghost v-btn-sm" type="button">Resend</button><button class="v-btn v-btn-ghost v-btn-sm" type="button">Revoke</button></span></li>
</ul>`, { flush: true, id: 'pending-title' })}`;

// ---------------------------------------------------------------- API keys
const KEYS = [['Website bookings', 'nw_live_8f3a…c21d', 'Used 4 minutes ago'], ['Xero sync', 'nw_live_51be…09af', 'Used yesterday']];
const api = `${settingsHeader('api', `<div class="v-split">
<button class="v-btn v-btn-primary" type="button" data-v-dialog-open="new-key">${icon('plus')}New key</button>
<button class="v-btn v-btn-primary" type="button" popovertarget="key-kind" aria-haspopup="menu" aria-label="More key types">${icon('chevron')}</button>
<div class="v-menu v-menu-end" id="key-kind" popover role="menu" data-v-menu aria-label="Key types">
<button class="v-menu-item" type="button" role="menuitem" popovertarget="key-kind" popovertargetaction="hide">Read-only key</button>
<button class="v-menu-item" type="button" role="menuitem" popovertarget="key-kind" popovertargetaction="hide">Test mode key</button>
</div>
</div>`)}
<div class="v-alert v-alert-info" role="status">${icon('info')}<p class="v-alert-body">Keys give full access to your workspace. Keep them on your server, never in a web page or an app. <a href="../docs.html">Read the API docs</a>.</p></div>
${panel('Keys', `<ul class="v-list" style="border: 0; border-radius: 0" role="list">
${KEYS.map(([n, k, used], i) => `<li class="v-list-item"><span class="v-list-body"><span class="v-list-title">${n}</span><span class="v-list-meta"><code id="key-${i}">${k}</code> · ${used}</span></span><span class="v-list-end"><button class="v-btn v-btn-ghost v-btn-sm" type="button" data-v-copy data-v-copy-target="#key-${i}" aria-label="Copy the ${n} key">${icon('copy')}Copy</button><button class="v-btn v-btn-ghost v-btn-sm" type="button">Revoke</button></span></li>`).join('\n')}
</ul>`, { flush: true, id: 'keys-title' })}
${panel('Requests in the last 14 days', `<figure class="v-chart">
<ul class="v-chart-columns" role="list" style="--v-chart-height: 7rem">
${[38, 42, 35, 50, 61, 22, 18, 45, 58, 66, 71, 30, 25, 80].map((v, i) => `<li><span class="v-chart-col" style="--v-value: ${v}%"></span><span class="v-chart-label" aria-hidden="true">${i % 2 ? '' : `${18 + i} Oct`}</span><span class="v-sr-only">${18 + i} October: ${v * 12} requests</span></li>`).join('\n')}
</ul>
</figure>`, { id: 'requests-title' })}
<dialog class="v-dialog" id="new-key" aria-labelledby="new-key-title" data-v-dismissable>
<form class="v-form" method="dialog">
<div class="v-dialog-header"><h2 class="v-dialog-title" id="new-key-title">Create an API key</h2></div>
<div class="v-dialog-body">${field('key-name', 'Name', input('key-name', 'name', { required: true, describe: true }), { hint: 'So you know what it is for, such as "Website bookings".' })}</div>
<div class="v-dialog-footer"><button class="v-btn v-btn-ghost" value="cancel" formnovalidate>Cancel</button><button class="v-btn v-btn-primary" value="create">Create key</button></div>
</form>
</dialog>`;

// ---------------------------------------------------------------- Integrations
const APPS = [['Xero', 'Send invoices and payments to your accounts.', true, 'chart'], ['Google Calendar', 'See Northwind jobs next to your own events.', true, 'calendar'], ['Stripe', 'Take card payments on quotes and invoices.', true, 'card'], ['QuickBooks', 'Sync customers and invoices both ways.', false, 'chart'], ['Mailchimp', 'Add new customers to your mailing list.', false, 'mail'], ['Zapier', 'Connect Northwind to thousands of other apps.', false, 'zap']];
const integrations = `${settingsHeader('integrations')}
<div class="v-grid v-grid-fit" style="--v-min: 16rem">
${APPS.map(([n, text, on, ic]) => `<article class="v-card v-stack" style="--v-gap: var(--v-space-3)">
<div class="v-flex v-items-center v-justify-between"><span class="v-feature-icon">${icon(ic)}</span>${on ? '<span class="v-badge v-badge-success v-badge-dot">Connected</span>' : ''}</div>
<h2 class="v-card-title" style="font-size: var(--v-step-0)">${n}</h2>
<p class="v-card-text">${text}</p>
${on ? `<label class="v-choice"><input class="v-switch" type="checkbox" role="switch" checked name="sync-${n.toLowerCase().replace(/\s/g, '-')}"><span>Sync automatically</span></label>` : `<button class="v-btn v-btn-secondary v-btn-sm v-self-start" type="button">${icon('link')}Connect ${n}</button>`}
</article>`).join('\n')}
</div>`;

// ---------------------------------------------------------------- Notifications page
const NOTES = [
  ['Today', [['MW', '<strong>Mary Walsh</strong> accepted the quote for <strong>slate re-roof</strong> (€8,950)', '12 minutes ago', true], ['JD', '<strong>John Doyle</strong> paid invoice <strong>#0412</strong>', '1 hour ago', true], ['NW', '<strong>Reminder:</strong> gutter clean in Athenry tomorrow at 9:00', '07:30', true]]],
  ['Yesterday', [['SC', '<strong>Siobhan Costello</strong> left a 5-star review: "Tidy, quick and fairly priced."', '18:20', false], ['PB', '<strong>Pádraig Burke</strong> marked <strong>chimney repair, Tuam</strong> as done', '16:05', false]]],
  ['Earlier this week', [['NW', 'Your <strong>October report</strong> is ready: €18,420 invoiced, 94% collected', 'Monday', false]]],
];
const notifications = `${header({ kicker: 'Harbour Roofing', title: 'Notifications', meta: 'Quotes, payments, reminders and reviews from the last 30 days.' })}
<div class="v-notifications v-card" id="notif-page" data-v-notifications style="padding: 0; inline-size: auto; max-inline-size: 48rem">
<div class="v-notifications-head">
<p class="v-fw-semibold">Last 30 days</p>
<button class="v-btn v-btn-secondary v-btn-sm" type="button" data-v-notifications-read>Mark all as read</button>
</div>
${NOTES.map(([day, items]) => `<section aria-labelledby="day-${day.replace(/\s/g, '-').toLowerCase()}">
<h2 class="v-notifications-head v-text-sm v-text-secondary" id="day-${day.replace(/\s/g, '-').toLowerCase()}" style="margin: 0">${day}</h2>
<ul class="v-notifications-list" role="list" style="max-block-size: none">
${items.map(([av, text, time, unread]) => `<li class="v-notification"${unread ? ' data-unread' : ''}><a class="v-notification-link" href="detail.html"><span class="v-avatar v-avatar-sm" aria-hidden="true">${av}</span><span>${unread ? '<span class="v-sr-only" data-unread-label>Unread: </span>' : ''}${text}<span class="v-notification-time">${time}</span></span></a></li>`).join('\n')}
</ul>
</section>`).join('\n')}
<p class="v-notifications-empty">You're all caught up.</p>
</div>`;

// ---------------------------------------------------------------- Search results
const RESULTS = [
  ['Customer', 'users', 'Mary <mark>Walsh</mark>', 'Tuam, Co. Galway · 6 jobs · last job 2 weeks ago', 'detail.html'],
  ['Quote', 'file', 'Slate re-roof for Mary <mark>Walsh</mark>', '€8,950 · accepted 12 minutes ago', 'detail.html'],
  ['Invoice', 'card', 'Invoice #0388, Ger <mark>Walsh</mark>', '€640 · paid 3 October', 'detail.html'],
  ['Job', 'folder', 'Gutter clean, <mark>Walsh</mark> family, Athenry', 'Booked for 14 November at 09:00', 'detail.html'],
];
const search = `${header({ kicker: 'Harbour Roofing', title: 'Search', meta: '4 results for "walsh"' })}
<form class="v-toolbar" action="search.html" role="search" aria-label="Refine these results">
<div class="v-input-group v-search" style="flex: 1 1 18rem">
<span class="v-input-addon">${icon('search')}</span>
<input class="v-input" id="search-q" name="q" type="search" value="walsh" aria-label="Search jobs, customers, quotes and invoices">
</div>
<div class="v-segmented" role="radiogroup" aria-label="Show">
${['All', 'Customers', 'Quotes', 'Invoices'].map((t, i) => `<label><input type="radio" name="type" value="${t.toLowerCase()}"${i === 0 ? ' checked' : ''}><span>${t}</span></label>`).join('')}
</div>
</form>
<ul class="v-list" role="list">
${RESULTS.map(([kind, ic, title, meta, href]) => `<li><a class="v-list-item" href="${href}"><span class="v-feature-icon">${icon(ic)}</span><span class="v-list-body"><span class="v-list-title">${title}</span><span class="v-list-meta">${kind} · ${meta}</span></span>${icon('arrow')}</a></li>`).join('\n')}
</ul>
<p class="v-text-sm v-text-secondary v-mt-4">Tip: press <kbd class="v-kbd">Ctrl K</kbd> to jump anywhere from any page.</p>`;

// ---------------------------------------------------------------- Public profile
const WORK = [['roof', 'Slate re-roof in Tuam'], ['coast', 'Flat roof with a sea view, Salthill'], ['garden', 'New gutters and fascias, Headford'], ['booth', 'Chimney rebuild, Galway city']];
const profile = `${header({ crumbs: [['Customers', 'list.html']], title: 'Harbour Roofing', meta: 'Roofing and gutters · Galway city · on Northwind since 2024', actions: `${btn('Request a quote', '#main', 'v-btn-primary', 'send')}` })}
<div class="v-bento">
<div class="v-span-8 v-stack" style="--v-gap: var(--v-space-5)">
${panel('About', `<div class="v-readmore" data-v-readmore>
<p class="v-readmore-body">A family firm since 1998, now three crews of qualified roofers. We do slate, tile and flat roofs, chimneys, gutters and fascias across Galway, Mayo and Roscommon. Every job gets a written quote with photos, a fixed price and a ten-year guarantee on workmanship. We are fully insured, registered with the CIF and happy to show you jobs we have done near you. Most quotes go out the same day as the visit, and we answer the phone ourselves.</p>
<button class="v-readmore-toggle" type="button">Read more</button>
</div>`, { id: 'about-title' })}
${panel('Recent work', `<ul class="v-masonry" role="list" style="--v-masonry-col: 12rem">
${WORK.map(([img, alt], i) => `<li><a href="../../shared/img/${img}.svg" data-v-lightbox="work-viewer" data-caption="${alt}"><img src="../../shared/img/${img}.svg" alt="${alt}" width="1200" height="900" style="aspect-ratio: ${['4/3', '3/4', '1/1', '4/5'][i]}; object-fit: cover"></a></li>`).join('\n')}
</ul>
<dialog class="v-lightbox" id="work-viewer" aria-label="Photo viewer" data-v-dismissable>
<p class="v-lightbox-count" aria-live="polite"></p>
<form method="dialog" class="v-lightbox-close"><button class="v-btn v-btn-secondary v-btn-icon" aria-label="Close viewer">${icon('close')}</button></form>
<button class="v-btn v-btn-secondary v-btn-icon v-lightbox-prev" type="button" aria-label="Previous photo">${icon('arrow-left')}</button>
<figure class="v-lightbox-figure"><img class="v-lightbox-img" alt=""><figcaption class="v-lightbox-caption"></figcaption></figure>
<button class="v-btn v-btn-secondary v-btn-icon v-lightbox-next" type="button" aria-label="Next photo">${icon('arrow')}</button>
</dialog>`, { id: 'work-title' })}
</div>
<div class="v-span-4 v-stack" style="--v-gap: var(--v-space-5)">
${panel('Reviews', `<div class="v-stack" style="--v-gap: var(--v-space-3)">
<div class="v-flex v-items-center v-gap-3"><span class="v-stat-value">4.9</span><span><span class="v-rating" role="img" aria-label="Rated 4.9 out of 5" style="--v-rating: 4.9"></span><span class="v-block v-text-sm v-text-secondary">from 128 reviews</span></span></div>
<blockquote class="v-testimonial"><p class="v-testimonial-quote">"Quoted on Tuesday, done on Friday, and they left the garden cleaner than they found it."</p><footer class="v-testimonial-author"><span class="v-testimonial-name">Mary Walsh</span><span class="v-testimonial-role">Tuam</span></footer></blockquote>
</div>`, { id: 'reviews-title' })}
${panel('Details', `<dl class="v-dl">
<div><dt>Areas</dt><dd>Galway, Mayo, Roscommon</dd></div>
<div><dt>Guarantee</dt><dd>10 years on workmanship</dd></div>
<div><dt>Phone</dt><dd><a href="tel:+35391555014">091 555 014</a></dd></div>
</dl>`, { id: 'details-title' })}
</div>
</div>`;

export function moreAppPages(page) {
  const mk = (file, nav, title, description, body) => [`app/${file}`, page({ title: `${title} · Northwind`, description: `${description} A Northwind app page built with Vectra.`, depth: 1, label: title.toLowerCase(), body: appShell(nav, body) })];
  return [
    mk('settings-billing.html', 'Settings', 'Billing settings', 'Plan, usage, payment method and invoices.', billing),
    mk('settings-team.html', 'Settings', 'Team settings', 'Members, roles and invites.', team),
    mk('settings-api.html', 'Settings', 'API keys', 'API keys, usage and a new key dialog.', api),
    mk('settings-integrations.html', 'Settings', 'Integrations', 'Connected apps and ones to add.', integrations),
    mk('notifications.html', 'Dashboard', 'Notifications', 'Every notification, grouped by day.', notifications),
    mk('search.html', 'Dashboard', 'Search results', 'Results across customers, quotes, invoices and jobs.', search),
    mk('profile.html', 'Customers', 'Business profile', 'A public business profile with work and reviews.', profile),
  ];
}

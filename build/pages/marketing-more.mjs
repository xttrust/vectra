/* v2.1 marketing pages (build/pages.mjs): features, changelog, careers and a job, customers and a case study,
   help centre and an article, developer docs, status and a waitlist. Each one uses the v2.1 components where
   they fit: mega menu (shared header), device frames, carousel, marquee, charts, combobox, tag input,
   multi-step form, table of contents scrollspy, read more, rating and video. */
import { icon, site, CSRF } from './shared.mjs';
import { TRIAL, check, head, section, faq, cta, toc } from './marketing.mjs';

const crumbs = (items) => `<nav class="v-breadcrumb" aria-label="Breadcrumb">
<ol>
${items.map(([t, h], i) => (i === items.length - 1 ? `<li><span aria-current="page">${t}</span></li>` : `<li><a href="{p}${h}">${t}</a></li>`)).join('\n')}
</ol>
</nav>`;
const card = (ic, title, text) => `<article class="v-card">
<span class="v-feature-icon">${icon(ic)}</span>
<h3 class="v-card-title">${title}</h3>
<p class="v-card-text">${text}</p>
</article>`;
const grid = (items, min = '16rem') => `<div class="v-grid v-grid-fit" style="--v-min: ${min}">\n${items.join('\n')}\n</div>`;
const quote = (text, name, role) => `<blockquote class="v-card v-testimonial">
<p class="v-testimonial-quote">${text}</p>
<footer class="v-testimonial-author"><span class="v-testimonial-name">${name}</span><span class="v-testimonial-role">${role}</span></footer>
</blockquote>`;

// A small app screen drawn in markup, for device frames.
const miniDashboard = `<div class="v-stack v-p-4" style="--v-gap: var(--v-space-3)">
<div class="v-flex v-justify-between v-items-center"><span class="v-fw-semibold">This week</span><span class="v-badge v-badge-success v-badge-dot">8 jobs booked</span></div>
<div class="v-grid" style="--v-min: 6rem; --v-gap: var(--v-space-2)">
<div class="v-card v-stat"><span class="v-stat-label">Quoted</span><span class="v-stat-value" style="font-size: var(--v-step-1)">€6,420</span></div>
<div class="v-card v-stat"><span class="v-stat-label">Paid</span><span class="v-stat-value" style="font-size: var(--v-step-1)">€4,180</span></div>
</div>
<ul class="v-list">
<li class="v-list-item"><span class="v-list-body"><span class="v-list-title">Slate repair, Tuam</span><span class="v-list-meta">Thu 09:00</span></span></li>
<li class="v-list-item"><span class="v-list-body"><span class="v-list-title">Gutter clean, Athenry</span><span class="v-list-meta">Thu 13:30</span></span></li>
</ul>
</div>`;
const miniPhone = `<div class="v-stack v-p-3" style="--v-gap: var(--v-space-2); padding-block-start: 2.6rem">
<span class="v-fw-semibold">Quote #0418</span>
<span class="v-text-sm v-text-secondary">Mary Walsh · Slate re-roof</span>
<span class="v-stat-value" style="font-size: var(--v-step-2)">€8,950</span>
<span class="v-badge v-badge-success">Accepted</span>
<span class="v-btn v-btn-primary v-btn-sm v-btn-block">Book the job</span>
</div>`;

// ---------------------------------------------------------------- Features
const features = site('features.html', `<section class="v-hero">
<div class="v-container v-hero-split">
<div class="v-hero-copy">
<p class="v-kicker">Features</p>
<h1 class="v-display">Everything between the phone call and the payment.</h1>
<p class="v-lead">Quotes, bookings, jobs, invoices and reviews in one place that works on a phone with one bar of signal.</p>
<div class="v-cluster">
<a class="v-btn v-btn-primary v-btn-lg" href="${TRIAL}">Start free trial ${icon('arrow')}</a>
<a class="v-btn v-btn-secondary v-btn-lg" href="#tour">Take the tour</a>
</div>
</div>
<div class="v-hero-art">
<figure class="v-device v-device-browser">
<div class="v-device-bar"><span class="v-device-url">app.northwind.ie</span></div>
<div class="v-device-screen" inert>${miniDashboard}</div>
</figure>
</div>
</div>
</section>
${section(`${head('The tour', 'Built around how a job really goes', 'Each part works on its own, and they all talk to each other.')}
${grid([
  card('file', 'Quotes in minutes', 'Pick from your price list, add photos and send it from the van. Customers accept with one tap.'),
  card('calendar', 'Bookings that fill themselves', 'A booking page with your real free slots and the questions you need answered.'),
  card('route', 'Jobs and routes', 'Today\'s jobs in driving order, with the address, notes and photos on each one.'),
  card('card', 'Invoices that get paid', 'Card and bank payments on every invoice, and polite reminders sent for you.'),
  card('star', 'Reviews on autopilot', 'Ask happy customers for a Google review the moment the job is marked done.'),
  card('chart', 'Know your numbers', 'See what you quoted, won and collected this month, without a spreadsheet.'),
])}`, ' id="tour"')}
${section(`<div class="v-alternate">
<div>
<div class="v-stack">
<p class="v-kicker">On the road</p>
<h2>The whole office in your pocket</h2>
<p class="v-text-secondary">Everything works offline and syncs when you are back in range, so a quote never gets lost on a mountain road.</p>
<ul class="v-stack" style="--v-gap: var(--v-space-2)">
${check('Works offline, syncs when you have signal')}
${check('Big buttons you can press with gloves on')}
${check('Customers sign quotes on your screen')}
</ul>
</div>
<figure class="v-device v-device-phone" style="--v-device-width: 15rem; margin-inline: auto">
<div class="v-device-screen" inert>${miniPhone}</div>
</figure>
</div>
</div>`)}
${section(`<div class="v-stats">
<div class="v-stat"><span class="v-stat-value">1,400+</span><span class="v-stat-label">businesses</span></div>
<div class="v-stat"><span class="v-stat-value">38,000</span><span class="v-stat-label">quotes sent last month</span></div>
<div class="v-stat"><span class="v-stat-value">4.8 / 5</span><span class="v-stat-label">average review</span></div>
<div class="v-stat"><span class="v-stat-value">11 days</span><span class="v-stat-label">faster payment</span></div>
</div>`)}
${section(`${head('Questions', 'Before you ask', '')}
${faq('features-faq', [
  ['Do I need a computer?', 'No. Everything works on a phone, and the screens grow to fill a tablet or laptop when you have one.'],
  ['Can I bring my customers across?', 'Yes. Upload a spreadsheet or connect your accounting software, and we move your customers and price list for you.'],
  ['What happens to my data if I leave?', 'You can export everything as a spreadsheet at any time. It is your data.'],
])}`)}
${cta('See it with your own jobs', 'Free for 30 days, no card needed. Most people send their first quote the same evening.')}`);

// ---------------------------------------------------------------- Changelog
const RELEASES = [
  ['v3-2', '3.2', '28 October 2026', [['New', 'accent', 'Recurring jobs: set a gutter clean to repeat every six months and it books itself.'], ['New', 'accent', 'Offline mode for quotes and job notes.'], ['Improved', 'info', 'Invoices load twice as fast on a weak signal.'], ['Fixed', 'success', 'Eircodes with a space no longer fail the address lookup.']]],
  ['v3-1', '3.1', '30 September 2026', [['New', 'accent', 'Ask for a Google review when a job is marked done.'], ['Improved', 'info', 'The booking page shows travel time between jobs.'], ['Fixed', 'success', 'Card payments in sterling show the right currency on receipts.']]],
  ['v3-0', '3.0', '2 September 2026', [['New', 'accent', 'A new app, rebuilt for phones first.'], ['New', 'accent', 'Team accounts with roles for office staff and crews.'], ['Improved', 'info', 'Search finds customers by phone number and Eircode.']]],
  ['v2-9', '2.9', '29 July 2026', [['Improved', 'info', 'Quotes remember the last price you charged each customer.'], ['Fixed', 'success', 'Calendar sync with Outlook keeps your time zone.']]],
];
const changelog = site('changelog.html', `${section(`${head('Changelog', 'What is new in Northwind', 'A new release most months. Every change, big or small, is written up here.', { center: false, level: 1 })}
<div class="v-article">
<aside class="v-article-aside">${toc(RELEASES.map(([id, v]) => [id, `Version ${v}`]), 'Releases')}</aside>
<div class="v-article-body v-stack" style="--v-gap: var(--v-space-6)">
${RELEASES.map(([id, v, date, items]) => `<article class="v-card v-stack" aria-labelledby="${id}" style="--v-gap: var(--v-space-3)">
<div class="v-flex v-flex-col" style="gap: 0.15rem">
<h2 id="${id}">Version ${v}</h2>
<p class="v-text-sm v-text-secondary"><time>${date}</time></p>
</div>
<ul class="v-stack" role="list" style="--v-gap: var(--v-space-2)">
${items.map(([kind, tone, text]) => `<li class="v-flex v-gap-3 v-items-baseline"><span class="v-badge v-badge-${tone}" style="min-inline-size: 5.5rem; justify-content: center">${kind}</span><span>${text}</span></li>`).join('\n')}
</ul>
</article>`).join('\n')}
<form class="v-card v-stack" action="{p}changelog.html" method="post" aria-labelledby="changelog-subscribe" style="--v-gap: var(--v-space-3)">
${CSRF}
<h2 id="changelog-subscribe" style="font-size: var(--v-step-1)">Get the next release in your inbox</h2>
<div class="v-field">
<label class="v-label" for="changelog-email">Email address</label>
<div class="v-cluster" style="--v-gap: var(--v-space-2)">
<input class="v-input" id="changelog-email" name="email" type="email" autocomplete="email" required style="flex: 1 1 14rem; inline-size: auto">
<button class="v-btn v-btn-primary" type="submit">Subscribe</button>
</div>
<p class="v-hint">One email a month at most. Unsubscribe from any of them.</p>
</div>
</form>
</div>
</div>`)}`);

// ---------------------------------------------------------------- Careers
const ROLES = [
  ['Senior front-end developer', 'Engineering', 'Tuam or remote (Ireland)', 'Full time'],
  ['Customer success lead', 'Customer success', 'Tuam', 'Full time'],
  ['Product designer', 'Design', 'Remote (Ireland or UK)', 'Full time'],
  ['Support specialist, evenings', 'Support', 'Tuam', 'Part time'],
];
const careers = site('careers.html', `<section class="v-hero v-hero-center">
<div class="v-container v-hero-copy">
<p class="v-kicker">Careers</p>
<h1 class="v-display">Build software for people who build things.</h1>
<p class="v-lead">We are 24 people in Tuam and around Ireland, making the tools trades use every day. Come and help.</p>
<div class="v-cluster v-justify-center"><a class="v-btn v-btn-primary v-btn-lg" href="#roles">See open roles</a></div>
</div>
</section>
${section(`${head('How we work', 'A small team that ships', '')}
${grid([
  card('users', 'Talk to customers', 'Everyone spends a morning a month on the phones. It changes what you build.'),
  card('clock', 'Sane hours', 'Four-day weeks in August and December, and nobody answers Slack at night.'),
  card('leaf', 'Remote or in Tuam', 'Work from home anywhere in Ireland, or from our office over the bakery.'),
])}`)}
${section(`${head('Open roles', 'Four roles open now', 'Salaries are on every listing. We reply to every application within a week.')}
<ul class="v-list" role="list">
${ROLES.map(([t, team, place, type]) => `<li><a class="v-list-item" href="{p}careers-job.html"><span class="v-list-body"><span class="v-list-title">${t}</span><span class="v-list-meta">${team} · ${place}</span></span><span class="v-list-end"><span class="v-tag">${type}</span>${icon('arrow')}</span></a></li>`).join('\n')}
</ul>`, ' id="roles"')}
${section(`${head('Hiring', 'What happens after you apply', '')}
<ol class="v-steps v-steps-vertical" aria-label="Hiring steps" style="max-inline-size: 36rem; margin-inline: auto">
<li class="v-step"><span class="v-step-label">A 20-minute call</span><span class="v-step-desc">With the person you would work for. No trick questions.</span></li>
<li class="v-step"><span class="v-step-label">A paid half-day task</span><span class="v-step-desc">Real work, paid at the role's day rate, done at home.</span></li>
<li class="v-step"><span class="v-step-label">Meet the team</span><span class="v-step-desc">Lunch in Tuam or a video call, your choice.</span></li>
<li class="v-step"><span class="v-step-label">An offer within a week</span><span class="v-step-desc">Or honest feedback if it is not a fit this time.</span></li>
</ol>`)}`);

// ---------------------------------------------------------------- Job detail with a multi-step application
const job = site('careers.html', `${section(`${crumbs([['Careers', 'careers.html'], ['Senior front-end developer', '']])}
<div class="v-stack v-mt-4" style="--v-gap: var(--v-space-3)">
<h1 class="v-display" style="font-size: var(--v-step-3)">Senior front-end developer</h1>
<ul class="v-cluster" role="list" style="--v-gap: var(--v-space-2)">
<li class="v-tag">${icon('pin')}Tuam or remote (Ireland)</li><li class="v-tag">${icon('clock')}Full time</li><li class="v-tag">${icon('card')}€70,000 to €85,000</li>
</ul>
</div>
<div class="v-article v-mt-8">
<div class="v-article-body v-prose">
<h2>The job</h2>
<p>You will build the screens trades use every day: quotes, bookings and invoices, on phones with a weak signal and on old laptops in site offices. We care about speed, accessibility and plain words more than about the newest framework.</p>
<h2>You will</h2>
<ul><li>Build and improve features with a designer and a back-end developer.</li><li>Keep the app fast and usable on cheap phones.</li><li>Spend a morning a month on customer calls.</li></ul>
<h2>You have</h2>
<ul><li>Five or more years building for the web, with strong HTML, CSS and JavaScript.</li><li>Care for accessibility, and you have tested with a screen reader.</li><li>Experience with Laravel and Vue is a plus, not a must.</li></ul>
</div>
<aside class="v-article-aside">
<div class="v-card v-stack" style="--v-gap: var(--v-space-3)">
<p class="v-fw-semibold">Apply in three short steps</p>
<p class="v-text-sm v-text-secondary">About five minutes. We reply within a week.</p>
<a class="v-btn v-btn-primary v-btn-block" href="#apply">Apply now</a>
</div>
</aside>
</div>`)}
${section(`<form class="v-wizard v-card" style="max-inline-size: 40rem; margin-inline: auto; padding: var(--v-space-6)" data-v-wizard data-v-validate id="apply" action="{p}careers-job.html" method="post" aria-labelledby="apply-title">
${CSRF}
<h2 id="apply-title">Apply for this role</h2>
<ol class="v-steps" aria-label="Application progress">
<li class="v-step"><span class="v-step-label">You</span></li>
<li class="v-step"><span class="v-step-label">Experience</span></li>
<li class="v-step"><span class="v-step-label">CV</span></li>
</ol>
<fieldset class="v-wizard-step">
<legend class="v-wizard-title">About you</legend>
<div class="v-field"><label class="v-label" for="apply-name">Full name</label><input class="v-input" id="apply-name" name="name" required autocomplete="name"></div>
<div class="v-field"><label class="v-label" for="apply-email">Email address</label><input class="v-input" id="apply-email" name="email" type="email" required autocomplete="email"></div>
</fieldset>
<fieldset class="v-wizard-step">
<legend class="v-wizard-title">Your experience</legend>
<div class="v-field">
<label class="v-label" for="apply-skills">Skills</label>
<span class="v-hint" id="apply-skills-hint">Press Enter or a comma after each.</span>
<div class="v-tag-input" data-v-tag-input data-max="10"><input class="v-input" id="apply-skills" name="skills" value="HTML, CSS, JavaScript" aria-describedby="apply-skills-hint" autocomplete="off" placeholder="Add a skill"></div>
</div>
<div class="v-field"><label class="v-label" for="apply-why">Why Northwind?</label><textarea class="v-input" id="apply-why" name="why" rows="4" required></textarea></div>
</fieldset>
<fieldset class="v-wizard-step">
<legend class="v-wizard-title">Your CV</legend>
<div class="v-field">
<label class="v-label" for="apply-cv">CV or portfolio link</label>
<input class="v-input" id="apply-cv" name="cv" type="url" placeholder="https://" required>
<p class="v-hint">A link to a PDF, your site or a GitHub profile.</p>
</div>
<label class="v-choice"><input class="v-checkbox" type="checkbox" name="consent" required><span>Keep my application for 12 months in case another role fits.</span></label>
</fieldset>
<div class="v-wizard-actions">
<button class="v-btn v-btn-ghost" type="button" data-v-wizard-back hidden>Back</button>
<button class="v-btn v-btn-primary" type="button" data-v-wizard-next hidden>Continue</button>
<button class="v-btn v-btn-primary" type="submit">Send application</button>
</div>
</form>`)}`);

// ---------------------------------------------------------------- Customers
const CLIENTS = ['Harbour Roofing', 'Corrib Gardens', 'West Clean', 'Bluepeak Gutters', 'Tuam Electrical', 'Shannon Plumbing', 'Atlantic Glazing', 'Kerry Kitchens'];
const STORIES = [
  ['Harbour Roofing', 'Quotes out in an hour, not a week', 'Roofing · Galway'],
  ['Corrib Gardens', 'A full calendar from one booking link', 'Gardening · Mayo'],
  ['West Clean', 'Paid eleven days sooner on average', 'Cleaning · Clare'],
];
const customers = site('customers.html', `<section class="v-hero v-hero-center">
<div class="v-container v-hero-copy">
<p class="v-kicker">Customers</p>
<h1 class="v-display">1,400 trades run their day on Northwind.</h1>
<p class="v-lead">Roofers, gardeners, cleaners, electricians and more, from one-van outfits to crews of forty.</p>
</div>
</section>
${section(`<div class="v-marquee" data-v-marquee>
<div class="v-marquee-viewport">
<ul class="v-marquee-track" role="list" aria-label="Some of our customers">
${CLIENTS.map((c) => `<li class="v-fw-semibold v-text-lg v-text-secondary">${c}</li>`).join('\n')}
</ul>
</div>
<button class="v-btn v-btn-ghost v-btn-sm v-marquee-toggle" type="button" hidden>Pause</button>
</div>`)}
${section(`${head('In their words', 'What owners say', '')}
<div class="v-carousel" aria-roledescription="carousel" aria-label="Customer quotes" data-v-carousel>
<ul class="v-carousel-track" role="list" tabindex="0" aria-label="Customer quotes">
${[['"We used to lose a day a week to paperwork. Now it is done in the van before we drive off."', 'Aoife Kelly', 'Harbour Roofing'], ['"Customers book themselves at night. I wake up to a full week."', 'Mike Joyce', 'Corrib Gardens'], ['"The reminders do the chasing, so I do not have to."', 'Sinéad Ryan', 'West Clean'], ['"My lads love the job list. Addresses, photos, notes, all there."', 'Pádraig Burke', 'Tuam Electrical'], ['"Setup took one evening. Support answered the phone on a Saturday."', 'Gráinne Walsh', 'Shannon Plumbing']].map(([q, n, r]) => `<li class="v-carousel-slide">${quote(q, n, r)}</li>`).join('\n')}
</ul>
<div class="v-carousel-controls" hidden>
<button class="v-btn v-btn-secondary v-btn-icon" type="button" data-v-carousel-prev aria-label="Previous quote">${icon('arrow-left')}</button>
<button class="v-btn v-btn-secondary v-btn-icon" type="button" data-v-carousel-next aria-label="Next quote">${icon('arrow')}</button>
</div>
</div>`)}
${section(`${head('Stories', 'How they did it', '')}
${grid(STORIES.map(([name, title, meta]) => `<a class="v-card" href="{p}case-study.html">
<span class="v-badge v-self-start">${meta}</span>
<h3 class="v-card-title">${title}</h3>
<p class="v-card-text">${name}</p>
<span class="v-inline-flex v-items-center v-gap-1 v-text-sm v-fw-semibold v-text-accent">Read the story ${icon('arrow')}</span>
</a>`))}`)}
${cta('Join them this week', 'Free for 30 days. We move your customers and price list across for you.')}`);

// ---------------------------------------------------------------- Case study
const caseStudy = site('customers.html', `${section(`${crumbs([['Customers', 'customers.html'], ['Harbour Roofing', '']])}
<div class="v-stack v-mt-4" style="--v-gap: var(--v-space-3)">
<p class="v-kicker">Case study · Roofing · Galway</p>
<h1 class="v-display" style="font-size: var(--v-step-3)">Harbour Roofing sends quotes in an hour, not a week.</h1>
</div>
<div class="v-grid v-mt-6" style="--v-min: 12rem">
<div class="v-card v-stat"><span class="v-stat-label">Quote turnaround</span><span class="v-stat-value">1 hour</span><span class="v-text-sm v-text-secondary">was 6 days</span></div>
<div class="v-card v-stat"><span class="v-stat-label">Quotes accepted</span><span class="v-stat-value">64%</span><span class="v-text-sm v-text-secondary">was 41%</span></div>
<div class="v-card v-stat"><span class="v-stat-label">Office hours saved</span><span class="v-stat-value">9 a week</span></div>
</div>`)}
${section(`<div class="v-article">
<div class="v-article-body v-prose">
<h2>Before</h2>
<p>Aoife Kelly runs the office for Harbour Roofing, a family firm with three crews. Quotes were written up at the kitchen table on Sunday nights, and by the time they arrived the customer had often gone with someone faster.</p>
<h2>What changed</h2>
<p>The crews now measure up and send the quote from the roof, with photos of the damage. Customers accept on their phone, and the job lands in the calendar with a deposit already paid.</p>
<blockquote><p>"The first week, a customer accepted a quote before the lads had their ladders back on the van."</p></blockquote>
<h2>The numbers</h2>
<figure class="v-chart">
<figcaption class="v-chart-title">Days from visit to quote sent</figcaption>
<table class="v-chart-bars">
<caption class="v-sr-only">Average days from visit to quote, before and after Northwind</caption>
<thead class="v-sr-only"><tr><th scope="col">Period</th><th scope="col">Days</th></tr></thead>
<tbody>
<tr><th scope="row">Before</th><td><div class="v-chart-track"><span class="v-chart-bar v-chart-c5" style="--v-value: 100%"></span><span class="v-chart-value">6 days</span></div></td></tr>
<tr><th scope="row">Month 1</th><td><div class="v-chart-track"><span class="v-chart-bar" style="--v-value: 25%"></span><span class="v-chart-value">1.5 days</span></div></td></tr>
<tr><th scope="row">Month 3</th><td><div class="v-chart-track"><span class="v-chart-bar" style="--v-value: 4%"></span><span class="v-chart-value">1 hour</span></div></td></tr>
</tbody>
</table>
</figure>
</div>
<aside class="v-article-aside">
<div class="v-card v-stack" style="--v-gap: var(--v-space-2)">
<p class="v-fw-semibold">Harbour Roofing</p>
<dl class="v-dl">
<div><dt>Based in</dt><dd>Galway city</dd></div>
<div><dt>Team</dt><dd>3 crews, 14 people</dd></div>
<div><dt>Uses</dt><dd>Quotes, bookings, invoices</dd></div>
</dl>
</div>
</aside>
</div>`)}
${cta('Your quotes, out today', 'Try Northwind free for 30 days.')}`);

// ---------------------------------------------------------------- Help centre
const TOPICS = ['Getting started', 'Send a quote', 'Take a card payment', 'Set up online booking', 'Add a team member', 'Connect Xero', 'Export your data', 'Change your plan', 'Reset your password', 'Recurring jobs'];
const CATEGORIES = [['zap', 'Getting started', 12], ['file', 'Quotes and invoices', 24], ['calendar', 'Bookings and calendar', 18], ['card', 'Payments', 15], ['users', 'Team and roles', 9], ['shield', 'Account and security', 11]];
const help = site('help.html', `<section class="v-hero v-hero-center">
<div class="v-container v-hero-copy">
<p class="v-kicker">Help centre</p>
<h1 class="v-display">How can we help?</h1>
<form class="v-field" role="search" action="{p}help-article.html" style="max-inline-size: 32rem; inline-size: 100%; margin-inline: auto; text-align: start">
<label class="v-label" for="help-q">Search the help centre</label>
<div class="v-combobox" data-v-combobox>
<input class="v-input v-input-lg" id="help-q" name="q" list="help-topics" autocomplete="off" placeholder="Try &quot;card payment&quot;">
<datalist id="help-topics">
${TOPICS.map((t) => `<option value="${t}"></option>`).join('\n')}
</datalist>
</div>
</form>
</div>
</section>
${section(`${head('Browse', 'Find it by topic', '')}
${grid(CATEGORIES.map(([ic, t, n]) => `<a class="v-card" href="{p}help-article.html">
<span class="v-feature-icon">${icon(ic)}</span>
<h3 class="v-card-title">${t}</h3>
<p class="v-card-text">${n} articles</p>
</a>`), '14rem')}`)}
${section(`<div class="v-grid" style="--v-min: 20rem; --v-gap: var(--v-space-8)">
<div class="v-stack" style="--v-gap: var(--v-space-3)">
<h2>Popular right now</h2>
<ul class="v-list" role="list">
${['Take a card payment on your phone', 'Send a quote customers can accept online', 'Set up recurring jobs', 'Connect your Google calendar'].map((t) => `<li><a class="v-list-item" href="{p}help-article.html"><span class="v-list-title">${t}</span>${icon('arrow')}</a></li>`).join('\n')}
</ul>
</div>
<div class="v-stack" style="--v-gap: var(--v-space-3)">
<h2>Still stuck?</h2>
<div class="v-card v-stack" style="--v-gap: var(--v-space-2)">
<p class="v-flex v-items-center v-gap-2 v-fw-semibold">${icon('phone')}Call us</p>
<p class="v-text-secondary">091 555 0100, 8am to 8pm, Monday to Saturday.</p>
</div>
<div class="v-card v-stack" style="--v-gap: var(--v-space-2)">
<p class="v-flex v-items-center v-gap-2 v-fw-semibold">${icon('mail')}Email</p>
<p class="v-text-secondary"><a href="mailto:help@northwind.ie">help@northwind.ie</a>, answered within four working hours.</p>
</div>
</div>
</div>`)}`);

// ---------------------------------------------------------------- Help article
const ARTICLE_TOC = [['before', 'Before you start'], ['steps', 'Take the payment'], ['receipt', 'Send the receipt'], ['problems', 'If it does not work']];
const helpArticle = site('help.html', `${section(`${crumbs([['Help centre', 'help.html'], ['Payments', 'help.html'], ['Take a card payment', '']])}
<div class="v-article v-mt-6">
<article class="v-article-body v-prose" aria-labelledby="article-title">
<h1 id="article-title">Take a card payment on your phone</h1>
<p class="v-lead">Tap the customer's card on the back of your phone, or type the number in. The money is in your bank in two working days.</p>
<h2 id="before">Before you start</h2>
<p>Card payments need a connected bank account. If you have not added one, go to <strong>Settings</strong>, then <strong>Billing</strong>, then <strong>Payouts</strong>.</p>
<aside class="v-callout v-callout-tip" aria-label="Tip"><p class="v-callout-title">${icon('info')}Tip</p><p>Tap to pay works on most Android phones and on iPhone XS or newer. Older phones can still take payments by typing the card number.</p></aside>
<h2 id="steps">Take the payment</h2>
<ol>
<li>Open the job and press <strong>Get paid</strong>.</li>
<li>Check the amount, then press <strong>Tap to pay</strong>.</li>
<li>Ask the customer to hold their card or phone against the back of yours.</li>
<li>Wait for the tick. That is it.</li>
</ol>
<h2 id="receipt">Send the receipt</h2>
<p>A receipt goes by email straight away if the customer has an address on file. Press <strong>Send by text</strong> to send it as a text message instead.</p>
<h2 id="problems">If it does not work</h2>
<p>Most failed taps are the card moving too soon. Ask the customer to hold it still for two seconds. If the card is declined, the customer's bank will tell them why; Northwind never sees the reason.</p>
<section class="v-card v-stack v-mt-8" aria-labelledby="helpful-title" style="--v-gap: var(--v-space-3)">
<h2 id="helpful-title" style="margin: 0; font-size: var(--v-step-0)">Was this article helpful?</h2>
<div class="v-cluster" style="--v-gap: var(--v-space-2)">
<button class="v-btn v-btn-secondary v-btn-sm" type="button" aria-pressed="false" data-v-toggle>Yes</button>
<button class="v-btn v-btn-secondary v-btn-sm" type="button" aria-pressed="false" data-v-toggle>No</button>
</div>
</section>
</article>
<aside class="v-article-aside">${toc(ARTICLE_TOC)}</aside>
</div>`)}`);

// ---------------------------------------------------------------- Developer docs
const DOCS_NAV = [['Getting started', [['Introduction', true], ['Authentication'], ['Errors']]], ['Resources', [['Customers'], ['Jobs'], ['Invoices']]], ['Webhooks', [['Events'], ['Signatures']]]];
const DOCS_TOC = [['auth', 'Authentication'], ['first', 'Your first request'], ['limits', 'Rate limits'], ['next', 'Next steps']];
const code = (id, lang, text) => `<div class="v-code">
<div class="v-code-header"><span class="v-code-lang">${lang}</span><button class="v-btn v-btn-ghost v-btn-sm v-code-copy" type="button" data-v-copy data-v-copy-target="#${id}">${icon('copy')}Copy</button></div>
<pre class="v-code-body" id="${id}" tabindex="0"><code>${text}</code></pre>
</div>`;
const docs = site('docs.html', `<div class="v-container v-section">
<div class="v-sidebar" style="--v-side: 14rem; --v-gap: var(--v-space-8)">
<nav class="v-sidenav" aria-label="Documentation">
${DOCS_NAV.map(([h, items]) => `<p class="v-sidenav-heading">${h}</p>
<ul>
${items.map(([t, cur]) => `<li><a href="{p}docs.html"${cur ? ' aria-current="page"' : ''}><span class="v-sidenav-label">${t}</span></a></li>`).join('\n')}
</ul>`).join('\n')}
</nav>
<div class="v-article">
<article class="v-article-body v-prose" aria-labelledby="docs-title">
<header>
<p class="v-kicker">API · Getting started</p>
<h1 id="docs-title">Introduction</h1>
<p class="v-lead">The Northwind API lets you read and write customers, jobs and invoices from your own software. It speaks JSON over HTTPS.</p>
</header>
<h2 id="auth">Authentication</h2>
<p>Create a key in <strong>Settings, API keys</strong> and send it as a bearer token. Keys belong to a workspace, not a person. The examples read the base address and the key from <code>NORTHWIND_API</code> and <code>NORTHWIND_KEY</code>.</p>
${code('code-auth', 'Shell', 'curl "$NORTHWIND_API/v1/customers" \\\n  -H "Authorization: Bearer $NORTHWIND_KEY"')}
<h2 id="first">Your first request</h2>
<p>List the ten most recent customers. Every list is paginated with <code>cursor</code> and <code>limit</code>.</p>
${code('code-first', 'JavaScript', 'const res = await fetch(`${process.env.NORTHWIND_API}/v1/customers?limit=10`, {\n  headers: { Authorization: `Bearer ${process.env.NORTHWIND_KEY}` },\n});\nconst { data, next_cursor } = await res.json();')}
<h2 id="limits">Rate limits</h2>
<p>Each key can make 120 requests a minute. Past that you get a <code>429</code> with a <code>Retry-After</code> header.</p>
<h2 id="next">Next steps</h2>
<p>Read about <a href="{p}docs.html">customers</a>, then set up <a href="{p}docs.html">webhooks</a> so Northwind tells you when things change.</p>
<nav class="v-pagination v-mt-8" aria-label="Pages in this section">
<a class="v-btn v-btn-secondary" href="{p}docs.html" rel="prev">${icon('arrow-left')}Overview</a>
<a class="v-btn v-btn-secondary" href="{p}docs.html" rel="next">Authentication${icon('arrow')}</a>
</nav>
</article>
<aside class="v-article-aside">${toc(DOCS_TOC)}</aside>
</div>
</div>
</div>`);

// ---------------------------------------------------------------- Status
const SERVICES = [['App and website', 'Operational', 'success'], ['Card payments', 'Operational', 'success'], ['Booking pages', 'Operational', 'success'], ['Email and text reminders', 'Degraded performance', 'warning'], ['Calendar sync', 'Operational', 'success'], ['API', 'Operational', 'success']];
const uptime = (bad) => `<ul class="v-chart-columns" role="list" style="--v-chart-height: 2rem; padding-block-end: 0; gap: 2px; border: 0">
${Array.from({ length: 30 }, (_, i) => {
  const b = bad[i];
  const tone = b === 'warning' ? ' v-chart-c4' : b ? '" style="--v-chart-color: var(--v-danger)' : ' v-chart-c3';
  return `<li><span class="v-chart-col${tone}${b && b !== 'warning' ? '; --v-value: 100%"' : '" style="--v-value: 100%"'}></span><span class="v-sr-only">${30 - i} days ago: ${b === 'warning' ? 'degraded' : b ? 'outage' : 'no problems'}</span></li>`;
}).join('\n')}
</ul>`;
const status = site('status.html', `${section(`${head('System status', 'Northwind is up and running', 'Live status of every part of Northwind, updated every minute.', { center: false, level: 1 })}
<div class="v-alert v-alert-warning" role="status">${icon('alert')}<p class="v-alert-body"><strong class="v-alert-title">Reminder texts are slower than usual.</strong> Texts are going out up to 20 minutes late. Emails are not affected. Next update by 11:00.</p></div>
<ul class="v-list v-mt-6" role="list">
${SERVICES.map(([n, s, tone]) => `<li class="v-list-item"><span class="v-list-title">${n}</span><span class="v-list-end"><span class="v-badge v-badge-${tone} v-badge-dot">${s}</span></span></li>`).join('\n')}
</ul>`)}
${section(`<div class="v-stack" style="--v-gap: var(--v-space-4)">
<h2>Last 30 days</h2>
<div class="v-card v-chart v-stack" style="--v-gap: var(--v-space-2)">
<div class="v-flex v-justify-between v-text-sm"><span class="v-fw-semibold">Card payments</span><span class="v-text-secondary">99.98% uptime</span></div>
${uptime({ 21: 'warning' })}
</div>
<div class="v-card v-chart v-stack" style="--v-gap: var(--v-space-2)">
<div class="v-flex v-justify-between v-text-sm"><span class="v-fw-semibold">Email and text reminders</span><span class="v-text-secondary">99.71% uptime</span></div>
${uptime({ 4: 'warning', 17: 'outage', 29: 'warning' })}
</div>
<h2 class="v-mt-6">Past incidents</h2>
<ol class="v-timeline">
<li class="v-timeline-item">
<span class="v-timeline-marker" aria-hidden="true">${icon('chat')}</span>
<div class="v-timeline-content">
<div class="v-timeline-header"><p class="v-timeline-title">Reminder texts delayed (resolved)</p><time class="v-timeline-time" datetime="2026-10-14">14 October</time></div>
<p class="v-timeline-body">A provider outage held texts for two hours. Every text was sent once it recovered.</p>
</div>
</li>
<li class="v-timeline-item">
<span class="v-timeline-marker" aria-hidden="true">${icon('card')}</span>
<div class="v-timeline-content">
<div class="v-timeline-header"><p class="v-timeline-title">Card payments slow to confirm (resolved)</p><time class="v-timeline-time" datetime="2026-10-02">2 October</time></div>
<p class="v-timeline-body">Confirmations took up to a minute for 25 minutes. No payment was lost.</p>
</div>
</li>
<li class="v-timeline-item">
<span class="v-timeline-marker" aria-hidden="true">${icon('gear')}</span>
<div class="v-timeline-content">
<div class="v-timeline-header"><p class="v-timeline-title">Planned maintenance (completed)</p><time class="v-timeline-time" datetime="2026-09-18">18 September</time></div>
<p class="v-timeline-body">The app was read-only for ten minutes at 06:00.</p>
</div>
</li>
</ol>
</div>`)}`);

// ---------------------------------------------------------------- Waitlist
const waitlist = site('waitlist.html', `<section class="v-hero v-hero-center">
<div class="v-container v-hero-copy">
<p class="v-kicker">Coming in spring 2027</p>
<h1 class="v-display">Northwind Teams.</h1>
<p class="v-lead">Schedules, timesheets and job costing for crews of five to fifty. Join the waitlist for early access and a year at half price.</p>
<form class="v-stack" action="{p}waitlist.html" method="post" style="--v-gap: var(--v-space-2); inline-size: 100%; max-inline-size: 30rem; margin-inline: auto; text-align: start">
${CSRF}
<label class="v-label" for="waitlist-email">Work email</label>
<div class="v-cluster" style="--v-gap: var(--v-space-2)">
<input class="v-input v-input-lg" id="waitlist-email" name="email" type="email" required autocomplete="email" style="flex: 1 1 14rem; inline-size: auto">
<button class="v-btn v-btn-primary v-btn-lg" type="submit">Join the waitlist</button>
</div>
<p class="v-hint">1,240 businesses are already on it. No spam, one email when it opens.</p>
</form>
</div>
</section>
${section(`${head('What you get', 'Run the whole crew from one place', '')}
${grid([
  card('calendar', 'Crew schedules', 'Drag jobs onto people, and everyone sees their week on their phone.'),
  card('clock', 'Timesheets', 'Clock in at the job with one tap; hours flow straight into payroll.'),
  card('chart', 'Job costing', 'See labour and materials against the quote while the job is running.'),
])}`)}
${section(`${head('Questions', 'About the waitlist', '')}
${faq('waitlist-faq', [
  ['When will Teams open?', 'Early access starts in March 2027, in the order people joined the list.'],
  ['What does it cost?', 'Pricing is not final. Everyone on the waitlist gets the first year at half price.'],
  ['Do I need Northwind already?', 'No. Teams works on its own and with Northwind.'],
])}`)}`);

export function morePages(page) {
  const mk = (file, label, title, description, body) => [file, page({ title: `${title} · Northwind`, description: `${description} An example page built with Vectra.`, label, body })];
  return [
    mk('features.html', 'features', 'Features', 'A Northwind features page with device frames.', features),
    mk('changelog.html', 'changelog', 'Changelog', 'Northwind release notes with a table of contents.', changelog),
    mk('careers.html', 'careers', 'Careers', 'Open roles and how hiring works at Northwind.', careers),
    mk('careers-job.html', 'job', 'Senior front-end developer', 'A job listing with a multi-step application.', job),
    mk('customers.html', 'customers', 'Customers', 'Northwind customers, quotes and stories.', customers),
    mk('case-study.html', 'case study', 'Harbour Roofing case study', 'A customer story with results and a chart.', caseStudy),
    mk('help.html', 'help centre', 'Help centre', 'Search and browse Northwind help.', help),
    mk('help-article.html', 'help article', 'Take a card payment on your phone', 'A help article with steps and a table of contents.', helpArticle),
    mk('docs.html', 'docs', 'API introduction', 'Developer documentation with code samples.', docs),
    mk('status.html', 'status', 'System status', 'Live status, uptime and incidents.', status),
    mk('waitlist.html', 'waitlist', 'Northwind Teams waitlist', 'A launch waitlist page.', waitlist),
  ];
}

/* Marketing pages for Northwind: product landing, pricing, about, contact, blog, blog post and the three
   legal pages. Each one shares the site header and footer with saas-home.html. */
import { icon, site, CSRF } from './shared.mjs';

const TRIAL = '{root}examples/auth/sign-up/single.html';
const check = (text) => `<li class="v-flex v-gap-2">${icon('check-circle')}<span>${text}</span></li>`;
const head = (kicker, title, lead, { center = true, level = 2 } = {}) => `<div class="v-section-head${center ? ' v-section-head-center' : ''}">
<p class="v-kicker">${kicker}</p>
<h${level}${level === 1 ? ' class="v-display"' : ''}>${title}</h${level}>
${lead ? `<p class="v-lead">${lead}</p>` : ''}
</div>`;
const section = (inner, attrs = '') => `<section class="v-section"${attrs}>
<div class="v-container">
${inner}
</div>
</section>`;
const faq = (name, items) => `<div class="v-accordion">
${items.map(([q, a], i) => `<details name="${name}"${i === 0 ? ' open' : ''}>
<summary>${q}</summary>
<p>${a}</p>
</details>`).join('\n')}
</div>`;
const cta = (title, text, primary = 'Start free trial') => section(`<div class="v-card v-card-feature v-cta">
<h2 class="v-display" style="font-size: var(--v-step-3)">${title}</h2>
<p class="v-lead">${text}</p>
<div class="v-cluster v-justify-center">
<a class="v-btn v-btn-primary v-btn-lg" href="${TRIAL}">${primary}</a>
<a class="v-btn v-btn-ghost v-btn-lg" href="{p}contact.html">Book a 15-minute demo</a>
</div>
</div>`);

// Blog cover art: drawn shapes in the direction's colours, so no photos are needed.
const COVERS = [
  '<rect width="480" height="270" style="fill: var(--v-accent-soft)"/><circle cx="360" cy="70" r="46" style="fill: var(--v-accent)" opacity="0.8"/><path d="M0 210L140 110l90 70 70-50 180 120V270H0z" style="fill: var(--v-accent-text)" opacity="0.9"/>',
  '<rect width="480" height="270" style="fill: var(--v-surface-2)"/><rect x="60" y="60" width="150" height="150" rx="18" style="fill: var(--v-accent)" opacity="0.85"/><rect x="230" y="100" width="190" height="24" rx="12" style="fill: var(--v-text-3)" opacity="0.6"/><rect x="230" y="140" width="140" height="24" rx="12" style="fill: var(--v-text-3)" opacity="0.4"/>',
  '<rect width="480" height="270" style="fill: var(--v-accent-soft)"/><g style="fill: var(--v-accent-text)"><rect x="70" y="150" width="50" height="80" rx="6" opacity="0.5"/><rect x="150" y="110" width="50" height="120" rx="6" opacity="0.65"/><rect x="230" y="80" width="50" height="150" rx="6" opacity="0.8"/><rect x="310" y="40" width="50" height="190" rx="6"/></g>',
  '<rect width="480" height="270" style="fill: var(--v-surface-2)"/><circle cx="240" cy="135" r="90" style="fill: var(--v-accent-soft)"/><path d="M240 60l20 60 62 2-50 38 18 60-50-36-50 36 18-60-50-38 62-2z" style="fill: var(--v-accent)"/>',
  '<rect width="480" height="270" style="fill: var(--v-accent-soft)"/><path d="M0 190q120-80 240-20t240-30V270H0z" style="fill: var(--v-accent)" opacity="0.6"/><path d="M0 220q120-50 240-10t240-20V270H0z" style="fill: var(--v-accent-text)"/>',
  '<rect width="480" height="270" style="fill: var(--v-surface-2)"/><rect x="90" y="50" width="300" height="170" rx="14" style="fill: var(--v-surface)"/><rect x="90" y="50" width="300" height="34" rx="14" style="fill: var(--v-accent)"/><g style="fill: var(--v-accent-soft)"><rect x="112" y="104" width="60" height="44" rx="6"/><rect x="186" y="104" width="60" height="44" rx="6"/><rect x="260" y="104" width="60" height="44" rx="6"/><rect x="112" y="160" width="60" height="44" rx="6"/></g>',
  '<rect width="480" height="270" style="fill: var(--v-accent-soft)"/><circle cx="160" cy="135" r="60" style="fill: var(--v-accent)" opacity="0.7"/><circle cx="260" cy="135" r="60" style="fill: var(--v-accent-text)" opacity="0.7"/><circle cx="360" cy="135" r="30" style="fill: var(--v-accent-2)"/>',
];
const cover = (i, ratio = '') => `<div class="v-card-media"><div class="v-frame${ratio}"><svg viewBox="0 0 480 270" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${COVERS[i % COVERS.length]}</svg></div></div>`;

export const POSTS = [
  ['Pricing', '28 October 2026', 6, 'How to put your prices up without losing customers', 'A three-step plan, a letter you can copy, and what happened when 40 trades tried it.'],
  ['Product', '21 October 2026', 3, 'Online booking is here', 'Customers can now pick a slot from your website. Here is how it works and how to switch it on.'],
  ['Guides', '14 October 2026', 8, 'The quiet season survival guide', 'Cash flow tricks for November to February, from businesses that have been through twenty winters.'],
  ['Stories', '7 October 2026', 5, 'From 11 reviews to 140 in a year', 'How a cleaning company in Galway doubled its bookings by asking at the right moment.'],
  ['Guides', '30 September 2026', 7, 'Quotes that win the job', 'What to put in, what to leave out, and why photos beat paragraphs.'],
  ['Product', '23 September 2026', 2, 'Deposits for big jobs', 'Ask for a part payment up front on any job over an amount you choose.'],
  ['Stories', '16 September 2026', 6, 'Running a bar and a function room on one calendar', 'The Quay Bar in Westport on deposits, no-shows and finally taking a Sunday off.'],
];
const postCard = ([cat, date, mins, title, text], i, level = 3) => `<a class="v-card" href="{p}blog-post.html">
${cover(i)}
<p class="v-cluster v-text-sm v-text-secondary"><span class="v-badge v-badge-accent">${cat}</span><span>${date} · ${mins} min read</span></p>
<h${level} class="v-card-title">${title}</h${level}>
<p class="v-card-text">${text}</p>
</a>`;

// ---------------------------------------------------------------- Product landing
const landing = site('Product', `<section class="v-hero">
<div class="v-container v-hero-split">
<div class="v-hero-copy">
<p class="v-kicker">Northwind Booking</p>
<h1 class="v-display">Let customers book you while you work.</h1>
<p class="v-lead">A booking page that shows your real free slots, asks the right questions and fills your calendar. No more phone tag from the top of a ladder.</p>
<div class="v-cluster">
<a class="v-btn v-btn-primary v-btn-lg" href="${TRIAL}">Start free trial ${icon('arrow')}</a>
<a class="v-btn v-btn-secondary v-btn-lg" href="#how">See how it works</a>
</div>
<p class="v-text-sm v-text-secondary">Included on every plan, even the free one.</p>
</div>
<div class="v-hero-art">
<div class="v-card" role="img" aria-label="A booking page for a gutter clean: Thursday is chosen and the 10:30 slot is selected.">
<div class="v-card-header"><span class="v-card-title">Book a gutter clean</span><span class="v-badge v-badge-success v-badge-dot">Free slots this week</span></div>
<div class="v-grid" style="--v-min: 3.5rem; --v-gap: var(--v-space-2)">
<span class="v-btn v-btn-secondary v-btn-sm">Mon 9</span><span class="v-btn v-btn-secondary v-btn-sm">Tue 10</span><span class="v-btn v-btn-primary v-btn-sm">Thu 12</span><span class="v-btn v-btn-secondary v-btn-sm">Fri 13</span>
</div>
<p class="v-text-sm v-text-secondary">Thursday 12 November</p>
<div class="v-cluster" style="--v-gap: var(--v-space-2)">
<span class="v-tag">08:00</span><span class="v-tag">09:00</span><span class="v-badge v-badge-solid">10:30</span><span class="v-tag">13:00</span><span class="v-tag">15:30</span>
</div>
<span class="v-btn v-btn-primary v-btn-block">Confirm 10:30 on Thursday</span>
</div>
</div>
</div>
</section>
${section(`${head('How it works', 'Three steps, then it runs itself', 'Most people set it up on their first evening and get a booking that week.')}
<ol class="v-howto">
<li class="v-card">
<h3>Set your hours and services</h3>
<p class="v-card-text">Say when you work, how long each job takes and how far you travel. Northwind keeps a buffer between jobs for the drive.</p>
</li>
<li class="v-card">
<h3>Share one link</h3>
<p class="v-card-text">Put it on your website, your Google profile, your van and your email signature. It works on any phone.</p>
</li>
<li class="v-card">
<h3>Bookings land in your calendar</h3>
<p class="v-card-text">With the address, the notes and any photos. The customer gets a text the day before, so fewer people forget.</p>
</li>
</ol>`, ' id="how"')}
${section(`<div class="v-alternate">
<div>
<div class="v-stack">
<p class="v-kicker">Questions up front</p>
<h2>Know the job before you knock</h2>
<p class="v-text-secondary">Ask for photos, the number of storeys or the size of the garden when people book. You arrive with the right ladder and an honest price.</p>
<ul class="v-stack" style="--v-gap: var(--v-space-2)">
${check('Custom questions for each service')}
${check('Photo uploads from the customer\'s phone')}
${check('Eircode lookup so you find the house first time')}
</ul>
</div>
<div class="v-hero-art">
<div class="v-card" role="img" aria-label="A booking request with three answers and two photos of a blocked gutter.">
<div class="v-card-header"><span class="v-card-title">Booking request</span><span class="v-badge v-badge-accent">2 photos</span></div>
<dl class="v-dl v-dl-cols">
<div><dt>Service</dt><dd>Gutter clean</dd></div>
<div><dt>Storeys</dt><dd>Two</dd></div>
<div><dt>Access</dt><dd>Side gate, always open</dd></div>
</dl>
<div class="v-switcher" style="--v-switch: 10rem; --v-gap: var(--v-space-2)">
<div class="v-frame v-frame-4x3"><svg viewBox="0 0 160 120" preserveAspectRatio="xMidYMid slice"><rect width="160" height="120" style="fill: var(--v-accent-soft)"/><path d="M0 40h160v14H0z" style="fill: var(--v-accent-text)"/><circle cx="60" cy="47" r="10" style="fill: var(--v-accent-2)"/></svg></div>
<div class="v-frame v-frame-4x3"><svg viewBox="0 0 160 120" preserveAspectRatio="xMidYMid slice"><rect width="160" height="120" style="fill: var(--v-surface-2)"/><path d="M20 120V60l60-40 60 40v60z" style="fill: var(--v-accent)" opacity="0.7"/></svg></div>
</div>
</div>
</div>
</div>
<div>
<div class="v-stack">
<p class="v-kicker">Your calendar</p>
<h2>Never double-booked again</h2>
<p class="v-text-secondary">Northwind checks your existing calendar, your team's days off and the drive between jobs before it offers a slot. If a job runs over, move the rest of the day with one drag.</p>
<ul class="v-stack" style="--v-gap: var(--v-space-2)">
${check('Two-way sync with Google and Outlook calendars')}
${check('Travel time worked out between jobs')}
${check('Holidays and days off blocked automatically')}
</ul>
</div>
<div class="v-hero-art">
<div class="v-card" role="img" aria-label="Thursday's plan: three jobs with travel time between them.">
<div class="v-card-header"><span class="v-card-title">Thursday</span><span class="v-badge">3 jobs, 41 km</span></div>
<ul class="v-list">
<li class="v-list-item"><span class="v-badge v-badge-accent">08:00</span><span class="v-list-body"><span class="v-list-title">Pádraig Ó Sé</span><span class="v-list-meta">Roof survey, Claregalway</span></span></li>
<li class="v-list-item"><span class="v-badge v-badge-accent">10:30</span><span class="v-list-body"><span class="v-list-title">Mary Walsh</span><span class="v-list-meta">Gutter clean, Tuam · 18 min drive</span></span></li>
<li class="v-list-item"><span class="v-badge v-badge-info">14:00</span><span class="v-list-body"><span class="v-list-title">The Quay Bar</span><span class="v-list-meta">Chimney repair, Westport · 52 min drive</span></span></li>
</ul>
</div>
</div>
</div>
</div>`)}
${section(`${head('Everything included', 'The small things that save the most time', '')}
<div class="v-grid v-grid-fit" style="--v-min: max(15rem, 30%); --v-gap: var(--v-space-6) var(--v-space-5)">
${[['phone', 'Text reminders', 'A friendly text the day before. No-shows drop by about a third.'], ['card', 'Deposits', 'Ask for a part payment on big jobs, paid by card when they book.'], ['globe', 'Your website', 'Add a book now button to any site with one line of code.'], ['users', 'Team calendars', 'Customers book the right person for the job, or the first one free.'], ['shield', 'Spam protection', 'Fake bookings are filtered out before they reach your calendar.'], ['chat', 'Two languages', 'Booking pages in English and Irish, with more on the way.']].map(([ic, t, d]) => `<div class="v-stack" style="--v-gap: var(--v-space-3)">
<span class="v-feature-icon">${icon(ic)}</span>
<h3>${t}</h3>
<p class="v-text-secondary">${d}</p>
</div>`).join('\n')}
</div>`)}
${section(`<figure class="v-card v-testimonial v-testimonial-lg v-mx-auto" style="max-inline-size: 50rem">
<span class="v-rating" role="img" aria-label="Rated 5 out of 5" style="--v-rating: 5"></span>
<blockquote class="v-testimonial-quote"><p>We used to lose two or three jobs a week because nobody could answer the phone. Now people book at ten at night and the calendar is full by Monday.</p></blockquote>
<figcaption class="v-testimonial-author"><span class="v-avatar" aria-hidden="true">NB</span><span><span class="v-testimonial-name">Niamh Brennan</span><span class="v-testimonial-role">Moss &amp; Fern Gardens, Clifden</span></span></figcaption>
</figure>`)}
${section(`<dl class="v-stats">
<div class="v-stat"><dt class="v-stat-label">bookings made last month</dt><dd class="v-stat-value">31,400</dd></div>
<div class="v-stat"><dt class="v-stat-label">booked outside working hours</dt><dd class="v-stat-value">46%</dd></div>
<div class="v-stat"><dt class="v-stat-label">fewer no-shows with reminders</dt><dd class="v-stat-value">34%</dd></div>
</dl>`, ' aria-label="Booking in numbers"')}
${section(`<div class="v-sidebar" style="--v-side: 18rem; --v-gap: var(--v-space-7)">
<div class="v-section-head v-mb-0">
<p class="v-kicker">Questions</p>
<h2>About online booking</h2>
<p class="v-text-secondary">Anything else? <a href="{p}contact.html">Ask us</a>, a real person replies within a working day.</p>
</div>
${faq('booking-faq', [
    ['Does it cost extra?', 'No. Online booking is part of every plan, including Solo, which is free. Text reminders are included up to 100 a month on Solo and without a limit on paid plans.'],
    ['Can I approve bookings first?', 'Yes. Switch on approval for any service and requests wait for you to accept them. The customer hears back by text either way.'],
    ['What if someone needs to cancel?', 'Every confirmation has a link to cancel or move the booking, up to a cut-off you set. Deposits follow the rules you choose.'],
    ['Will it work with my website?', 'Yes. Paste one line into WordPress, Wix, Squarespace or plain HTML, or simply link to your booking page.'],
  ])}
</div>`)}
${cta('Your next job could book itself tonight.', 'Switch on online booking in five minutes. Free on every plan, no card needed.')}`);

// ---------------------------------------------------------------- Pricing
const yes = `<span class="v-inline-flex">${icon('check')}</span><span class="v-sr-only">Included</span>`;
const no = `<span class="v-inline-flex v-text-muted">${icon('minus')}</span><span class="v-sr-only">Not included</span>`;
const COMPARE = [
  ['Bookings and jobs', [
    ['Online booking page', yes, yes, yes],
    ['Text reminders', '100 a month', 'Unlimited', 'Unlimited'],
    ['Custom booking questions', no, yes, yes],
    ['Route planning', no, no, yes],
  ]],
  ['Quotes and invoices', [
    ['Invoices', '20 a month', 'Unlimited', 'Unlimited'],
    ['Card payments and pay-now links', yes, yes, yes],
    ['Automatic payment reminders', no, yes, yes],
    ['Deposits and part payments', no, yes, yes],
    ['VAT-ready exports', yes, yes, yes],
  ]],
  ['Team', [
    ['Team logins', '1', 'Up to 5', 'Unlimited'],
    ['Roles and permissions', no, yes, yes],
    ['Several locations', no, no, yes],
  ]],
  ['Support', [
    ['Help centre and email', yes, yes, yes],
    ['Free data import', no, yes, yes],
    ['Priority phone support', no, no, yes],
  ]],
];
const plan = (name, desc, prices, features, button, featured) => `<article class="v-card v-pricing${featured ? ' v-pricing-featured' : ''}">
<header class="v-pricing-header"><h2 class="v-pricing-name">${name}</h2>${featured ? '<span class="v-badge v-badge-solid">Most popular</span>' : ''}</header>
${prices.map(([period, amount, note]) => `<p class="v-pricing-price"${period ? ` data-period="${period}"` : ''}><span class="v-pricing-amount">${amount}</span><span class="v-pricing-period">${note}</span></p>`).join('\n')}
<p class="v-pricing-desc">${desc}</p>
<ul class="v-pricing-features">
${features.map((f) => `<li>${icon('check')}${f}</li>`).join('\n')}
</ul>
${button}
</article>`;

const pricing = site('Pricing', `<section class="v-hero">
<div class="v-container">
${head('Pricing', 'Simple prices. No surprises.', 'Start free and move up when you take on help. Every plan includes online booking, card payments and EU hosting.', { level: 1 })}
<div class="v-billing">
<div class="v-cluster v-justify-center">
<fieldset class="v-segmented">
<legend class="v-sr-only">Billing period</legend>
<label><input type="radio" name="billing" value="monthly" checked><span>Monthly</span></label>
<label><input type="radio" name="billing" value="yearly"><span>Yearly</span></label>
</fieldset>
<span class="v-badge v-badge-success">Yearly saves two months</span>
</div>
<div class="v-switcher" style="--v-switch: 52rem">
${plan('Solo', 'For one person doing the work and the admin.', [['', '&euro;0', 'forever']], ['Online booking page', 'Up to 20 invoices a month', 'Card payments'], `<a class="v-btn v-btn-secondary v-btn-block" href="${TRIAL}">Start free</a>`)}
${plan('Crew', 'For a small team with a full calendar.', [['monthly', '&euro;29', 'per month'], ['yearly', '&euro;24', 'per month, billed &euro;288 yearly']], ['Everything in Solo', 'Unlimited quotes and invoices', 'Automatic review requests', 'Up to 5 team logins'], `<a class="v-btn v-btn-primary v-btn-block" href="${TRIAL}">Start 14-day trial</a>`, true)}
${plan('Business', 'For several crews, vans and locations.', [['monthly', '&euro;79', 'per month'], ['yearly', '&euro;66', 'per month, billed &euro;792 yearly']], ['Everything in Crew', 'Unlimited team logins', 'Route planning', 'Priority phone support'], `<a class="v-btn v-btn-primary v-btn-block" href="{p}contact.html">Talk to us</a>`)}
</div>
</div>
<ul class="v-cluster v-justify-center v-text-sm v-text-secondary v-mt-6" style="--v-gap: var(--v-space-2) var(--v-space-5)">
${['14-day free trial on paid plans', 'No card needed to start', 'Cancel any time', 'Prices include VAT'].map((t) => `<li class="v-flex v-gap-2 v-items-center">${icon('check-circle')}<span>${t}</span></li>`).join('\n')}
</ul>
</div>
</section>
${section(`${head('Compare plans', 'Every feature, side by side', 'All plans are month to month. Change or cancel whenever you like.')}
<div class="v-table-wrap" role="region" aria-labelledby="compare-title" tabindex="0" style="--v-table-min: 40rem">
<table class="v-table">
<caption class="v-sr-only" id="compare-title">Features in each Northwind plan</caption>
<thead>
<tr><th scope="col">Feature</th><th class="v-text-center" scope="col">Solo</th><th class="v-text-center" scope="col">Crew</th><th class="v-text-center" scope="col">Business</th></tr>
</thead>
${COMPARE.map(([group, rows]) => `<tbody>
<tr><th class="v-bg-subtle" colspan="4" scope="colgroup">${group}</th></tr>
${rows.map(([f, ...cells]) => `<tr><th class="v-fw-regular" scope="row">${f}</th>${cells.map((c) => `<td class="v-text-center">${c}</td>`).join('')}</tr>`).join('\n')}
</tbody>`).join('\n')}
</table>
</div>`)}
${section(`<div class="v-sidebar" style="--v-side: 18rem; --v-gap: var(--v-space-7)">
<div class="v-section-head v-mb-0">
<p class="v-kicker">Questions</p>
<h2>Pricing, answered</h2>
<p class="v-text-secondary">Still unsure which plan fits? <a href="{p}contact.html">Tell us about your business</a> and we will suggest one, honestly.</p>
</div>
${faq('pricing-faq', [
    ['Is Solo really free?', 'Yes, for as long as you like. It covers one login, online booking and up to 20 invoices a month. Card payments cost the usual processing fee and nothing more.'],
    ['What happens when my trial ends?', 'Nothing, unless you choose a plan. Your account drops to Solo and keeps all your data. We never charge a card you have not added.'],
    ['Can I switch plans later?', 'Any time, from Settings. Moving up takes effect at once and we charge the difference for the rest of the month. Moving down applies from your next bill.'],
    ['Do you charge per invoice or per booking?', 'No. Paid plans have no limits on invoices, quotes or bookings. Card payments are 1.4% plus 25 cent for European cards, paid straight to your bank.'],
    ['Do you offer discounts?', 'Yearly billing saves two months. Charities and new businesses in their first year get 50% off Crew for twelve months: just ask.'],
    ['How do I cancel?', 'From Settings, in two clicks. You keep access until the end of the period you paid for, and you can export everything first.'],
  ])}
</div>`)}
${cta('Try every feature free for 14 days.', 'No card needed. If it is not for you, your account simply moves to the free plan.')}`);

// ---------------------------------------------------------------- About
const TEAM = [['AK', 'Aoife Kelly', 'Founder', 'Ran the office for her dad\'s roofing firm for ten years. Built Northwind to fix it.'], ['SM', 'Se&aacute;n Murphy', 'Engineering', 'Keeps the app fast on a weak signal in the middle of Connemara.'], ['CR', 'Ciara Ryan', 'Customer success', 'Has moved over 400 businesses off paper. Answers the phone herself.'], ['TB', 'Tom&aacute;s Byrne', 'Design', 'Tests every screen with gloves on. Seriously.'], ['NF', 'Nuala Fahy', 'Engineering', 'Looks after payments, so your money lands where it should.'], ['DK', 'Declan Keane', 'Sales', 'Former electrician. Will tell you if Northwind is not right for you.'], ['RM', 'R&oacute;is&iacute;n Moran', 'Support', 'Writes the help centre, one plain sentence at a time.'], ['LT', 'Liam Tierney', 'Operations', 'Keeps the lights on, the books straight and the coffee strong.']];
const about = site('About', `<section class="v-hero v-hero-center">
<div class="v-container">
<div class="v-hero-copy">
<p class="v-kicker">About Northwind</p>
<h1 class="v-display">We build the back office our families never had.</h1>
<p class="v-lead">Northwind started at a kitchen table in Tuam, with a shoebox of receipts and a roofer who would rather be on a roof. Today it runs the admin for more than 1,200 small businesses.</p>
</div>
</div>
</section>
${section(`<div class="v-sidebar" style="--v-side: 18rem; --v-gap: var(--v-space-7)">
<div class="v-section-head v-mb-0">
<p class="v-kicker">Our story</p>
<h2>Built by people who did the paperwork</h2>
</div>
<div class="v-prose">
<p>Aoife Kelly spent ten years running the office of her father's roofing business: answering the phone between jobs, chasing invoices on Sunday evenings and keeping the diary in a notebook that lived in the van.</p>
<p>Every tool she tried was built for an accountant or a call centre, not for a crew of four in a county with patchy signal. So in 2019 she sat down with Se&aacute;n, a friend from school who wrote software, and started again from the job itself: a customer rings, someone goes out, the work gets done, the money comes in.</p>
<p>That is still the whole idea. Northwind does the boring parts quietly, works on the phone in your pocket, and stays out of the way of the actual work.</p>
</div>
</div>`)}
${section(`<dl class="v-stats">
<div class="v-stat"><dt class="v-stat-label">businesses run on Northwind</dt><dd class="v-stat-value">1,200+</dd></div>
<div class="v-stat"><dt class="v-stat-label">people on the team</dt><dd class="v-stat-value">9</dd></div>
<div class="v-stat"><dt class="v-stat-label">counties and shires</dt><dd class="v-stat-value">41</dd></div>
<div class="v-stat"><dt class="v-stat-label">investors to keep happy</dt><dd class="v-stat-value">0</dd></div>
</dl>`, ' aria-label="Northwind in numbers"')}
${section(`${head('What we believe', 'Three rules we will not break', '')}
<div class="v-grid v-grid-fit" style="--v-min: 16rem; --v-gap: var(--v-space-6) var(--v-space-5)">
${[['heart', 'Plain and kind', 'No jargon, no dark patterns, no small print that bites. If a screen needs a manual, we redo the screen.'], ['shield', 'Your data is yours', 'Hosted in the EU, never sold, and exportable in one click. Leaving should be as easy as joining.'], ['leaf', 'Built to last', 'We are profitable and independent, so we answer to customers, not investors. No surprise shutdowns.']].map(([ic, t, d]) => `<div class="v-stack" style="--v-gap: var(--v-space-3)">
<span class="v-feature-icon">${icon(ic)}</span>
<h3>${t}</h3>
<p class="v-text-secondary">${d}</p>
</div>`).join('\n')}
</div>`)}
${section(`<div class="v-sidebar" style="--v-side: 18rem; --v-gap: var(--v-space-7)">
<div class="v-section-head v-mb-0">
<p class="v-kicker">Milestones</p>
<h2>How we got here</h2>
<p class="v-text-secondary">Slowly, on purpose, and with our customers in the room.</p>
</div>
<ol class="v-timeline">
${[['2019', 'A notebook becomes an app', 'The first version runs one roofing business in Tuam. It does bookings and nothing else.'], ['2021', 'Invoices and card payments', 'Fifty businesses sign up by word of mouth. Pay-now links cut the average wait for payment from 31 days to 9.'], ['2023', 'The team grows to nine', 'We open an office on the Dublin Road and start answering the phone ourselves.'], ['2025', '1,000 businesses', 'Northwind reaches Scotland and Wales, still with no sales team and no adverts.'], ['2026', 'Online booking for everyone', 'Customers can book a slot from any website, on every plan, including the free one.']].map(([y, t, d], i, all) => `<li class="v-timeline-item">
<span class="v-timeline-marker" aria-hidden="true">${i === all.length - 1 ? icon('sparkle') : ''}</span>
<div class="v-timeline-content">
<div class="v-timeline-header"><h3 class="v-timeline-title">${t}</h3><span class="v-timeline-time">${y}</span></div>
<p class="v-timeline-body">${d}</p>
</div>
</li>`).join('\n')}
</ol>
</div>`)}
${section(`${head('The team', 'Small team, west of Ireland', 'Nine of us, mostly from families that ran a trade.')}
<ul class="v-grid" style="--v-min: 14rem; --v-gap: var(--v-space-6) var(--v-space-5)">
${TEAM.map(([ini, name, role, bio]) => `<li class="v-person">
<span class="v-avatar" aria-hidden="true">${ini}</span>
<h3 class="v-person-name">${name}</h3>
<span class="v-person-role">${role}</span>
<p>${bio}</p>
</li>`).join('\n')}
</ul>`)}
${section(`<div class="v-card v-cta">
<div class="v-cta-split">
<div class="v-stack" style="--v-gap: var(--v-space-3)">
<h2>Want to work with us?</h2>
<p class="v-text-secondary">We hire slowly and keep people. Remote within Ireland, with a desk in Tuam if you want one.</p>
</div>
<div class="v-cluster">
<a class="v-btn v-btn-secondary" href="{p}contact.html">Say hello</a>
<a class="v-btn v-btn-primary" href="{p}system/coming-soon.html">See open roles</a>
</div>
</div>
</div>`)}`);

// ---------------------------------------------------------------- Contact
const contactField = (id, label, input, { hint, error, optional } = {}) => `<div class="v-field">
<label class="v-label" for="${id}">${label}${optional ? ' <span class="v-optional">Optional</span>' : ''}</label>
${input}
${hint ? `<p class="v-hint" id="${id}-hint">${hint}</p>` : ''}
${error ? `<p class="v-field-error" id="${id}-error">${error}</p>` : ''}
</div>`;

const contact = site('Contact', `${section(`${head('Contact', 'Talk to a person, not a ticket', 'Call, email or call in. We are in Tuam, and we pick up the phone.', { center: false, level: 1 })}
<div class="v-grid v-grid-fit" style="--v-min: 16rem">
${[['zap', 'Sales and demos', 'See Northwind with your own price list in a 15-minute call.', 'Book a demo', '#contact-form'], ['help', 'Help with your account', 'Something not working, or not sure how? We reply within one working day.', 'Visit the help centre', '{p}system/coming-soon.html'], ['building', 'Partners and press', 'Accountants, trade bodies and journalists, this one is for you.', 'Email partners@northwind.ie', 'mailto:partners@northwind.ie']].map(([ic, t, d, link, href]) => `<div class="v-card">
<span class="v-feature-icon">${icon(ic)}</span>
<h2 class="v-card-title">${t}</h2>
<p class="v-card-text">${d}</p>
<a href="${href}">${link}</a>
</div>`).join('\n')}
</div>`, ' style="--v-section-pad: clamp(3rem, 6vw, 5rem) var(--v-space-6)"')}
${section(`<div class="v-sidebar" style="--v-side: 20rem; --v-gap: var(--v-space-7)">
<div class="v-stack" style="--v-gap: var(--v-space-6)">
<div class="v-stack" style="--v-gap: var(--v-space-2)">
<h2>Visit or call</h2>
<p class="v-text-secondary">Call in for a coffee and a demo. Parking at the door.</p>
</div>
<ul class="v-stack" style="--v-gap: var(--v-space-4)">
<li class="v-flex v-gap-3"><span class="v-feature-icon">${icon('phone')}</span><span><span class="v-block v-fw-semibold">Phone</span><a href="tel:+353915550142">091 555 0142</a></span></li>
<li class="v-flex v-gap-3"><span class="v-feature-icon">${icon('mail')}</span><span><span class="v-block v-fw-semibold">Email</span><a href="mailto:hello@northwind.ie">hello@northwind.ie</a></span></li>
<li class="v-flex v-gap-3"><span class="v-feature-icon">${icon('pin')}</span><span><span class="v-block v-fw-semibold">Office</span><span class="v-block">Unit 4, Dublin Road, Tuam, Co. Galway, H54 R2X4</span></span></li>
</ul>
<dl class="v-dl v-dl-cols">
<div><dt>Monday to Friday</dt><dd>08:00 to 18:00</dd></div>
<div><dt>Saturday</dt><dd>09:00 to 13:00</dd></div>
<div><dt>Sunday and bank holidays</dt><dd>Closed</dd></div>
</dl>
<figure class="v-figure">
<div class="v-frame v-frame-4x3">
<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Map: our office is on the Dublin Road, just east of Tuam town centre.">
<rect width="400" height="300" style="fill: var(--v-surface-2)"/>
<path d="M0 210C80 190 120 230 200 200s150-60 200-40" fill="none" style="stroke: var(--v-accent-soft)" stroke-width="26"/>
<path d="M-10 120h420M150 -10l40 320M300 -10l-60 320" fill="none" style="stroke: var(--v-surface)" stroke-width="14"/>
<path d="M-10 120h420" fill="none" style="stroke: var(--v-border-strong)" stroke-width="3" stroke-dasharray="10 8"/>
<rect x="40" y="40" width="80" height="54" rx="6" style="fill: var(--v-border)"/>
<rect x="210" y="150" width="70" height="40" rx="6" style="fill: var(--v-border)"/>
<path d="M262 104s-24-20-24-40a24 24 0 0148 0c0 20-24 40-24 40z" style="fill: var(--v-accent)"/>
<circle cx="262" cy="64" r="9" style="fill: var(--v-surface)"/>
</svg>
</div>
<figcaption>Unit 4, Dublin Road, Tuam. Five minutes from the square.</figcaption>
</figure>
</div>
<form class="v-form v-card" id="contact-form" method="post" action="{p}contact.html" data-v-validate>
${CSRF}
<div class="v-stack" style="--v-gap: var(--v-space-2)">
<h2>Send us a message</h2>
<p class="v-text-secondary">All fields are required unless they say optional.</p>
</div>
<div class="v-form-grid">
${contactField('contact-name', 'Your name', '<input class="v-input" id="contact-name" name="name" type="text" autocomplete="name" required>', { error: 'Enter your name.' })}
${contactField('contact-business', 'Business', '<input class="v-input" id="contact-business" name="business" type="text" autocomplete="organization">', { optional: true })}
${contactField('contact-email', 'Email', '<input class="v-input" id="contact-email" name="email" type="email" autocomplete="email" required>', { error: 'Enter your email address, like name@example.com.' })}
${contactField('contact-phone', 'Phone', '<input class="v-input" id="contact-phone" name="phone" type="tel" autocomplete="tel" aria-describedby="contact-phone-hint">', { optional: true, hint: 'If you would rather we call you back.' })}
<div class="v-form-full">
${contactField('contact-topic', 'What can we help with?', `<select class="v-select" id="contact-topic" name="topic" required>
<option value="">Choose a topic</option>
<option>A demo or a question before buying</option>
<option>Moving from another system</option>
<option>Billing</option>
<option>Something else</option>
</select>`, { error: 'Choose a topic, so the right person replies.' })}
</div>
<div class="v-form-full">
<div class="v-field" data-v-counter>
<label class="v-label" for="contact-message">Message</label>
<textarea class="v-input" id="contact-message" name="message" rows="5" minlength="20" maxlength="1000" required aria-describedby="contact-message-hint"></textarea>
<p class="v-hint" id="contact-message-hint">A few lines about your business help us give a useful answer.</p>
<p class="v-field-error" id="contact-message-error">Write at least 20 characters.</p>
</div>
</div>
<div class="v-form-full">
<div class="v-field">
<label class="v-choice"><input class="v-checkbox" id="contact-consent" name="consent" type="checkbox" value="1" required><span>I agree that Northwind may use these details to reply, as set out in the <a href="{p}privacy.html">privacy notice</a>.</span></label>
<p class="v-field-error" id="contact-consent-error">Tick the box so we can reply to you.</p>
</div>
</div>
</div>
<div class="v-form-actions">
<p class="v-hint v-form-actions-start">We reply within one working day.</p>
<button class="v-btn v-btn-primary" type="submit">${icon('send')}Send message</button>
</div>
</form>
</div>`)}`);

// ---------------------------------------------------------------- Blog index
const CATS = ['All posts', 'Guides', 'Product', 'Stories', 'Pricing'];
const blog = site('Blog', `${section(`${head('The Northwind blog', 'Practical reading for busy owners', 'Short guides on pricing, cash flow and getting found locally, plus what is new in Northwind.', { center: false, level: 1 })}
<nav class="v-tablist" aria-label="Blog categories">
${CATS.map((c, i) => `<a class="v-tab" href="{p}blog.html"${i === 0 ? ' aria-current="page"' : ''}>${c}</a>`).join('\n')}
</nav>
<a class="v-card v-mt-6" href="{p}blog-post.html">
<div class="v-switcher" style="--v-switch: 46rem; --v-gap: var(--v-space-6)">
${cover(0)}
<div class="v-stack v-justify-center" style="--v-gap: var(--v-space-3)">
<p class="v-cluster v-text-sm v-text-secondary"><span class="v-badge v-badge-solid">Featured</span><span class="v-badge v-badge-accent">Pricing</span><span>28 October 2026 · 6 min read</span></p>
<h2 style="font-size: var(--v-step-2)">How to put your prices up without losing customers</h2>
<p class="v-text-secondary">A three-step plan, a letter you can copy, and what happened when 40 trades tried it this autumn.</p>
<span class="v-flex v-items-center v-gap-3 v-text-sm"><span class="v-avatar v-avatar-sm" aria-hidden="true">CR</span><span><span class="v-block v-fw-semibold">Ciara Ryan</span><span class="v-block v-text-secondary">Customer success</span></span></span>
</div>
</div>
</a>`, ' style="--v-section-pad: clamp(3rem, 6vw, 5rem) var(--v-space-6)"')}
${section(`<h2 class="v-mb-6">Latest posts</h2>
<div class="v-grid" style="--v-min: 18rem; --v-gap: var(--v-space-5)">
${POSTS.slice(1).map((p, i) => postCard(p, i + 1)).join('\n')}
</div>
<nav class="v-mt-8" aria-label="Blog pages">
<ul class="v-pagination">
<li><span class="v-page v-page-prev" aria-disabled="true"><span class="v-page-label">Previous</span></span></li>
<li><a class="v-page" href="{p}blog.html" aria-label="Page 1" aria-current="page">1</a></li>
<li><a class="v-page" href="{p}blog.html" aria-label="Page 2">2</a></li>
<li><a class="v-page" href="{p}blog.html" aria-label="Page 3">3</a></li>
<li><span class="v-page-gap" aria-hidden="true">…</span></li>
<li><a class="v-page" href="{p}blog.html" aria-label="Page 8">8</a></li>
<li><a class="v-page v-page-next" href="{p}blog.html" rel="next"><span class="v-page-label">Next</span></a></li>
</ul>
</nav>`, ' style="--v-section-pad: 0 clamp(3rem, 7vw, 6rem)"')}
${newsletter('blog-newsletter')}`);

function newsletter(id) {
  return section(`<div class="v-card v-cta">
<div class="v-cta-split">
<div class="v-stack" style="--v-gap: var(--v-space-3)">
<span class="v-feature-icon">${icon('mail')}</span>
<h2>Tips for busy trades, once a month</h2>
<p class="v-text-secondary">Pricing, chasing payments, getting more reviews. Short, practical, and from people who do the work.</p>
</div>
<form class="v-form-inline" action="{p}blog.html" method="post">
${CSRF}
<div class="v-field v-grow">
<label class="v-label" for="${id}">Email address</label>
<input class="v-input" id="${id}" name="email" type="email" autocomplete="email" placeholder="you@business.ie" required>
</div>
<button class="v-btn v-btn-primary" type="submit">Subscribe</button>
</form>
</div>
</div>`);
}

// ---------------------------------------------------------------- Blog post
const TOC = [['why', 'Why prices have to move'], ['numbers', 'Step 1: know your numbers'], ['notice', 'Step 2: give fair notice'], ['value', 'Step 3: show what they get'], ['results', 'What happened when 40 trades tried it'], ['short', 'The short version']];
const toc = (items, label = 'On this page') => `<nav class="v-toc" aria-labelledby="toc-title" data-v-toc>
<p class="v-toc-title" id="toc-title">${label}</p>
<ol>
${items.map(([id, text], i) => `<li><a href="#${id}"${i === 0 ? ' aria-current="true"' : ''}>${text}</a></li>`).join('\n')}
</ol>
</nav>`;

const post = site('Blog', `<article>
${section(`<div class="v-stack" style="--v-gap: var(--v-space-4); max-inline-size: 52rem">
<nav class="v-breadcrumb" aria-label="Breadcrumb">
<ol>
<li><a href="{p}blog.html">Blog</a></li>
<li><a href="{p}blog.html">Pricing</a></li>
<li><span aria-current="page">Putting your prices up</span></li>
</ol>
</nav>
<h1 class="v-display" style="font-size: var(--v-step-display)">How to put your prices up without losing customers</h1>
<p class="v-lead">A three-step plan, a letter you can copy, and what happened when 40 trades tried it this autumn.</p>
<div class="v-flex v-items-center v-gap-3">
<span class="v-avatar" aria-hidden="true">CR</span>
<p class="v-text-sm"><span class="v-block v-fw-semibold">Ciara Ryan</span><span class="v-block v-text-secondary"><time datetime="2026-10-28">28 October 2026</time> · 6 min read</span></p>
</div>
</div>`, ' style="--v-section-pad: clamp(2.5rem, 5vw, 4rem) var(--v-space-6)"')}
<div class="v-container">
<div class="v-article">
<aside class="v-article-aside v-stack" aria-label="About this post" style="--v-gap: var(--v-space-6)">
${toc(TOC)}
<div class="v-stack" style="--v-gap: var(--v-space-2)">
<p class="v-text-sm v-fw-semibold">Share</p>
<div class="v-cluster" style="--v-gap: var(--v-space-2)">
<button class="v-btn v-btn-secondary v-btn-sm" type="button" data-v-copy="northwind.ie/blog/put-prices-up">${icon('link')}Copy link</button>
<a class="v-btn v-btn-secondary v-btn-sm" href="mailto:?subject=Putting%20prices%20up">${icon('mail')}Email</a>
</div>
</div>
</aside>
<div class="v-article-body v-prose">
<p>Most of the trades we talk to have not changed their prices in two or three years. Fuel, materials and insurance have all gone up in that time, so the same job now pays noticeably less. Nobody enjoys the conversation, but it is far easier than people expect, and almost nobody leaves.</p>
<h2 id="why">Why prices have to move</h2>
<p>If your costs rise by 6% a year and your prices stay put, you are taking a pay cut every January. After three years, a job that used to leave you &euro;100 might leave you &euro;80. Customers know prices go up. What they do not like is a surprise.</p>
<aside class="v-callout v-callout-tip">
<p class="v-callout-title">${icon('info')}Tip</p>
<p>Small, regular rises (once a year, in the quiet season) land far better than one large jump after five years of silence.</p>
</aside>
<h2 id="numbers">Step 1: know your numbers</h2>
<p>Before you pick a number, work out what a typical job really costs you. Include the things that are easy to forget:</p>
<ul>
<li>Travel time and fuel, not just time on site</li>
<li>Quoting time for the jobs you do not win</li>
<li>Insurance, phone, software and the van, spread over the year</li>
<li>Time spent chasing late payments</li>
</ul>
<p>In Northwind, the Reports page shows your average job value and margin by service, which makes this a ten-minute job.</p>
<h2 id="notice">Step 2: give fair notice</h2>
<p>Tell regular customers at least a month ahead, in writing, and keep it short. Here is a letter you can adapt:</p>
<blockquote>
<p>From 1 January our prices will rise by 7%, the first change in two years. It covers higher fuel and material costs and lets us keep the same team and standards. Any job booked before then stays at today's price. Thank you for your custom.</p>
</blockquote>
<p>Notice that it says what, when, why and what stays the same. It does not apologise, and it does not over-explain.</p>
<h2 id="value">Step 3: show what they get</h2>
<p>People pay for certainty. Remind them of the things that make you easy to deal with: you turn up when you say, you send a clear quote, you clean up after yourself. If you have added online booking, text reminders or a pay-now link, mention it.</p>
<h2 id="results">What happened when 40 trades tried it</h2>
<p>This autumn, 40 Northwind customers raised prices by between 5% and 12% using the steps above. We compared the three months before and after.</p>
<figure>
<svg viewBox="0 0 600 220" role="img" aria-label="Bar chart: average job value rose from 412 euro to 446 euro, while jobs booked stayed level at about 61 a month." style="inline-size: 100%; block-size: auto">
<g style="fill: var(--v-text-3)" font-size="14"><text x="40" y="212">Job value before</text><text x="190" y="212">Job value after</text><text x="340" y="212">Jobs before</text><text x="480" y="212">Jobs after</text></g>
<rect x="50" y="54" width="90" height="136" rx="6" style="fill: var(--v-accent-soft)"/>
<rect x="200" y="40" width="90" height="150" rx="6" style="fill: var(--v-accent)"/>
<rect x="350" y="70" width="90" height="120" rx="6" style="fill: var(--v-accent-soft)"/>
<rect x="490" y="72" width="90" height="118" rx="6" style="fill: var(--v-accent)"/>
<g style="fill: var(--v-text)" font-size="15" font-weight="600" text-anchor="middle"><text x="95" y="44">&euro;412</text><text x="245" y="30">&euro;446</text><text x="395" y="60">61</text><text x="535" y="62">60</text></g>
</svg>
<figcaption>Average job value and jobs booked per month, before and after the price rise.</figcaption>
</figure>
<table>
<thead><tr><th scope="col">Measure</th><th scope="col">Before</th><th scope="col">After</th></tr></thead>
<tbody>
<tr><td>Average job value</td><td>&euro;412</td><td>&euro;446</td></tr>
<tr><td>Jobs booked a month</td><td>61</td><td>60</td></tr>
<tr><td>Customers who left</td><td>Not measured</td><td>2 of 40 businesses lost one regular</td></tr>
</tbody>
</table>
<p>In short: income went up by about 8%, the number of jobs barely moved, and the conversations were, in the words of one roofer, "a lot less awkward than the dentist".</p>
<h2 id="short">The short version</h2>
<ol>
<li>Work out what a job really costs you, including travel and admin.</li>
<li>Give a month's notice in writing: what, when, why, and what stays the same.</li>
<li>Remind people why you are worth it, then get back to work.</li>
</ol>
<hr>
<p>Questions about pricing in Northwind? <a href="{p}contact.html">Talk to us</a>, we are happy to look at your numbers with you.</p>
</div>
</div>
<div class="v-card v-mt-8" style="max-inline-size: 52rem">
<div class="v-flex v-gap-4 v-items-start">
<span class="v-avatar v-avatar-lg" aria-hidden="true">CR</span>
<div class="v-stack" style="--v-gap: var(--v-space-2)">
<p class="v-kicker">Written by</p>
<p class="v-fw-semibold">Ciara Ryan, customer success at Northwind</p>
<p class="v-text-secondary">Ciara has helped more than 400 businesses move off paper. Before Northwind she ran the office for a plumbing firm in Ennis for eight years.</p>
<a class="v-text-sm" href="{p}blog.html">More posts by Ciara</a>
</div>
</div>
</div>
</div>
</article>
${section(`<h2 class="v-mb-6">Keep reading</h2>
<div class="v-grid v-grid-fit" style="--v-min: 18rem; --v-gap: var(--v-space-5)">
${[POSTS[2], POSTS[4], POSTS[3]].map((p, i) => postCard(p, i + 2)).join('\n')}
</div>`)}
${newsletter('post-newsletter')}`);

// ---------------------------------------------------------------- Legal
const EXAMPLE = `<aside class="v-callout v-callout-warning">
<p class="v-callout-title">${icon('alert')}Example text</p>
<p>This page shows how a legal page can be laid out. The wording is placeholder text for a made-up company and is not legal advice. Ask a solicitor to write yours.</p>
</aside>`;
const LEGAL = [['terms', 'Terms of service'], ['privacy', 'Privacy notice'], ['cookies', 'Cookie policy']];

function legal(slug, title, intro, sections, extra = '') {
  return site('', `${section(`<div class="v-stack" style="--v-gap: var(--v-space-4)">
<p class="v-kicker">Legal</p>
<h1 class="v-display" style="font-size: var(--v-step-display)">${title}</h1>
<p class="v-lead">${intro}</p>
<p class="v-text-sm v-text-secondary">Last updated <time datetime="2026-10-01">1 October 2026</time> · Questions? <a href="mailto:legal@northwind.ie">legal@northwind.ie</a></p>
<nav class="v-tablist" aria-label="Legal pages">
${LEGAL.map(([s, t]) => `<a class="v-tab" href="{p}${s}.html"${s === slug ? ' aria-current="page"' : ''}>${t}</a>`).join('\n')}
</nav>
</div>`, ' style="--v-section-pad: clamp(2.5rem, 5vw, 4rem) var(--v-space-6)"')}
<div class="v-container v-section" style="--v-section-pad: 0 clamp(3rem, 7vw, 6rem)">
<div class="v-article">
<aside class="v-article-aside" aria-label="Contents">
${toc(sections.map(([id, h]) => [id, h]), 'Contents')}
</aside>
<div class="v-article-body v-prose">
${EXAMPLE}
${sections.map(([id, h, html]) => `<h2 id="${id}">${h}</h2>\n${html}`).join('\n')}
${extra}
</div>
</div>
</div>`);
}

const terms = legal('terms', 'Terms of service', 'The agreement between your business and Northwind Ltd when you use Northwind. We have kept it as short and plain as we can.', [
  ['t-who', '1. Who we are', '<p>Northwind is run by Northwind Ltd, a company registered in Ireland (example number 000000), at Unit 4, Dublin Road, Tuam, Co. Galway. In these terms, "we" means Northwind Ltd and "you" means the business that holds the account.</p>'],
  ['t-account', '2. Your account', '<p>You need to be 18 or over and acting for a business to open an account. You are responsible for:</p><ul><li>keeping your sign-in details safe and turning on two-step sign-in</li><li>everything done by people you invite to your account</li><li>making sure the details you give us are correct</li></ul>'],
  ['t-plans', '3. Plans and payment', '<p>Paid plans are billed monthly or yearly in advance. Prices include VAT where it applies. You can change or cancel your plan at any time from Settings. If you cancel, you keep access until the end of the period you have paid for; we do not refund part periods unless the law says we must.</p><p>If a payment fails, we will email you and try again over 14 days before moving your account to the free plan.</p>'],
  ['t-data', '4. Your data', '<p>Everything you put into Northwind (customers, jobs, quotes, invoices, photos) belongs to you. You give us permission to store and process it only to run the service for you. You can export it at any time, and we delete it within 30 days of you closing your account. Our <a href="{p}privacy.html">privacy notice</a> explains the details.</p>'],
  ['t-use', '5. Fair use', '<p>Please do not use Northwind to send spam, to break the law, or in a way that harms the service or other customers. We may suspend an account that does, and we will tell you why unless the law stops us.</p>'],
  ['t-availability', '6. Availability and changes', '<p>We aim for the service to be available 99.9% of the time and post planned maintenance on our status page at least three days ahead. We may improve or change features; if a change takes away something you rely on, we will give you at least 30 days\' notice.</p>'],
  ['t-liability', '7. Liability', '<p>Nothing in these terms limits liability that cannot be limited by law. Otherwise, our total liability to you in any year is limited to the amount you paid us in the 12 months before the claim. We are not liable for indirect losses such as lost profits.</p>'],
  ['t-ending', '8. Ending the agreement', '<p>You can close your account at any time from Settings. We can end the agreement with 30 days\' notice, or straight away if you seriously break these terms.</p>'],
  ['t-law', '9. Law and disputes', '<p>These terms are governed by Irish law. If we disagree about something, please talk to us first at <a href="mailto:legal@northwind.ie">legal@northwind.ie</a>. If we cannot sort it out, the courts of Ireland decide.</p>'],
]);

const privacy = legal('privacy', 'Privacy notice', 'What personal data Northwind collects, why, how long we keep it, and the choices you have. Written for people, not lawyers.', [
  ['p-summary', 'Summary', '<ul><li>We collect what we need to run Northwind, and no more.</li><li>We never sell your data or your customers\' data.</li><li>Your data is stored in the EU (Ireland and Germany).</li><li>You can see, export or delete your data at any time.</li></ul>'],
  ['p-collect', 'What we collect', '<p>When you use Northwind we collect:</p><ul><li><strong>Account details:</strong> your name, email, phone number and business details.</li><li><strong>Your customers\' details:</strong> whatever you add, such as names, addresses and job notes. For this data you are the controller and we are your processor.</li><li><strong>Usage data:</strong> pages visited, device type and approximate location, to keep the service secure and working well.</li></ul>'],
  ['p-why', 'Why we use it', '<table><thead><tr><th scope="col">Purpose</th><th scope="col">Legal basis</th></tr></thead><tbody><tr><td>Running your account and the service</td><td>Contract</td></tr><tr><td>Billing and tax records</td><td>Legal obligation</td></tr><tr><td>Keeping the service secure</td><td>Legitimate interest</td></tr><tr><td>Product news by email (optional)</td><td>Consent</td></tr></tbody></table>'],
  ['p-share', 'Who we share it with', '<p>We use a small number of trusted suppliers to host data, take payments and send texts and emails. Each one is bound by a data processing agreement and keeps data in the EU or under approved safeguards. A full list is available on request.</p>'],
  ['p-keep', 'How long we keep it', '<p>We keep your data while your account is open. When you close it, we delete it within 30 days, except billing records, which the law requires us to keep for six years.</p>'],
  ['security', 'How we keep it safe', '<p>Data is encrypted in transit and at rest, backed up every night, and only a few named staff can reach production systems, always with two-step sign-in. We test our security every year with an outside firm.</p>'],
  ['p-rights', 'Your rights', '<p>You can ask to see, correct, export or delete your personal data, or object to how we use it. Email <a href="mailto:privacy@northwind.ie">privacy@northwind.ie</a> and we will reply within a month. You can also complain to the Data Protection Commission in Ireland.</p>'],
  ['p-contact', 'Contact', '<p>Our data protection lead can be reached at <a href="mailto:privacy@northwind.ie">privacy@northwind.ie</a> or by post at Unit 4, Dublin Road, Tuam, Co. Galway.</p>'],
]);

const COOKIES = [['nw_session', 'Keeps you signed in', 'Until you sign out', 'Essential'], ['nw_csrf', 'Protects forms from misuse', 'Session', 'Essential'], ['nw_prefs', 'Remembers your theme and language', '1 year', 'Preferences'], ['nw_stats', 'Counts visits without identifying you', '13 months', 'Analytics']];
const cookies = legal('cookies', 'Cookie policy', 'Which cookies Northwind sets, what each one does, and how to change your choices.', [
  ['c-what', 'What cookies are', '<p>Cookies are small text files a website saves in your browser. Some are needed for the site to work at all; others help us understand how it is used. We do not use advertising cookies.</p>'],
  ['c-list', 'Cookies we use', `<table><thead><tr><th scope="col">Name</th><th scope="col">Purpose</th><th scope="col">Lasts</th><th scope="col">Type</th></tr></thead><tbody>${COOKIES.map(([n, p, l, t]) => `<tr><td><code>${n}</code></td><td>${p}</td><td>${l}</td><td>${t}</td></tr>`).join('')}</tbody></table>`],
  ['c-choices', 'Your choices', '<p>Essential cookies are always on, because Northwind cannot work without them. You can switch the others on or off below at any time, and you can also clear cookies in your browser settings.</p>'],
], `<form class="v-card v-form" action="{p}cookies.html" method="post" aria-labelledby="cookie-form-title">
${CSRF}
<h3 id="cookie-form-title">Cookie settings</h3>
<label class="v-choice"><input class="v-switch" type="checkbox" role="switch" name="essential" checked disabled><span>Essential: sign-in and security (always on)</span></label>
<label class="v-choice"><input class="v-switch" type="checkbox" role="switch" name="preferences" checked><span>Preferences: theme and language</span></label>
<label class="v-choice"><input class="v-switch" type="checkbox" role="switch" name="analytics"><span>Analytics: anonymous visit counts</span></label>
<div class="v-form-actions">
<button class="v-btn v-btn-primary" type="submit">Save my choices</button>
</div>
</form>`);

export function marketingPages(page) {
  const mk = (file, label, title, description, body, script) => [file, page({ title: `${title} · Northwind`, description: `${description} An example page built with Vectra.`, label, body, script })];
  return [
    mk('landing.html', 'product landing', 'Online booking', 'Northwind Booking: a product landing page.', landing),
    mk('pricing.html', 'pricing', 'Pricing', 'Northwind pricing with a plan comparison and FAQ.', pricing),
    mk('about.html', 'about', 'About us', 'The story, values and team behind Northwind.', about),
    mk('contact.html', 'contact', 'Contact', 'Ways to reach Northwind and a contact form.', contact),
    mk('blog.html', 'blog', 'Blog', 'The Northwind blog index.', blog),
    mk('blog-post.html', 'blog post', 'How to put your prices up without losing customers', 'A Northwind blog post with a table of contents.', post),
    mk('terms.html', 'terms', 'Terms of service', 'Example terms of service.', terms),
    mk('privacy.html', 'privacy', 'Privacy notice', 'Example privacy notice.', privacy),
    mk('cookies.html', 'cookies', 'Cookie policy', 'Example cookie policy.', cookies),
  ];
}

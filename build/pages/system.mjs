/* System pages: one entry per status, each written in two layouts (minimal and illustrated).
   Copy follows the states guide: what happened, why, and what to do next, with a way home. */
import { icon, brand, CSRF } from './shared.mjs';

const fill = (token, extra = '') => `style="fill: var(--v-${token})"${extra}`;
const stroke = (token, w, extra = '') => `fill="none" style="stroke: var(--v-${token})" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${extra}`;

// Shared backdrop: a soft disc, a ground line and a few accent dots. Each motif sits on top.
const scene = (motif) => `<svg viewBox="0 0 320 260" aria-hidden="true" focusable="false">
<circle cx="160" cy="126" r="108" ${fill('accent-soft')}/>
<circle cx="160" cy="126" r="108" ${stroke('border', 2, ' stroke-dasharray="2 10"')}/>
<path d="M36 222h248" ${stroke('border-strong', 3)}/>
<circle cx="58" cy="70" r="6" ${fill('accent-2')}/>
<circle cx="276" cy="176" r="5" ${fill('accent-2')}/>
<circle cx="262" cy="52" r="3.5" ${fill('accent')}/>
${motif}
</svg>`;

const ART = {
  key: scene(`<circle cx="118" cy="126" r="30" ${stroke('accent-text', 12)}/>
<path d="M148 126h96M214 126v26M236 126v18" ${stroke('accent-text', 12)}/>
<circle cx="118" cy="126" r="9" ${fill('accent')}/>`),
  door: scene(`<rect x="110" y="58" width="100" height="164" rx="8" ${fill('surface')}/>
<rect x="110" y="58" width="100" height="164" rx="8" ${stroke('border-strong', 3)}/>
<rect x="124" y="74" width="72" height="56" rx="4" ${stroke('border', 3)}/>
<path d="M148 150v-12a12 12 0 0124 0v12" ${stroke('accent-text', 7)}/>
<rect x="138" y="148" width="44" height="34" rx="6" ${fill('accent')}/>
<circle cx="160" cy="162" r="4.5" ${fill('surface')}/>`),
  compass: scene(`<path d="M44 204C90 200 92 150 140 150s66-60 120-82" ${stroke('text-3', 4, ' stroke-dasharray="2 12"')}/>
<circle cx="160" cy="118" r="54" ${fill('surface')}/>
<circle cx="160" cy="118" r="54" ${stroke('accent-text', 8)}/>
<path d="M160 76l14 42h-28z" ${fill('accent')}/>
<path d="M160 160l-14-42h28z" ${fill('text-3')}/>
<circle cx="160" cy="118" r="6" ${fill('accent-text')}/>
<path d="M254 58l8 8M262 58l-8 8" ${stroke('accent-text', 4)}/>`),
  hourglass: scene(`<path d="M116 54h88M116 210h88" ${stroke('accent-text', 10)}/>
<path d="M128 56c0 40 28 50 28 76s-28 36-28 76M192 56c0 40-28 50-28 76s28 36 28 76" ${stroke('accent-text', 7)}/>
<path d="M142 88h36c-4 14-12 22-18 28-6-6-14-14-18-28z" ${fill('accent')}/>
<path d="M136 206c4-22 14-30 24-34 10 4 20 12 24 34z" ${fill('accent')}/>
<path d="M160 120v44" ${stroke('accent', 3, ' stroke-dasharray="3 6"')}/>`),
  gauge: scene(`<path d="M86 170a74 74 0 01148 0" ${stroke('border-strong', 16)}/>
<path d="M86 170a74 74 0 0198-70" ${stroke('accent', 16)}/>
<path d="M204 106a74 74 0 0130 64" ${stroke('danger', 16)}/>
<path d="M160 170l46-50" ${stroke('text', 7)}/>
<circle cx="160" cy="170" r="12" ${fill('accent-text')}/>
<path d="M122 206h76" ${stroke('text-3', 6)}/>`),
  plug: scene(`<path d="M30 168c40 0 50-42 86-42" ${stroke('text-2', 8)}/>
<rect x="112" y="104" width="44" height="44" rx="10" ${fill('accent-text')}/>
<path d="M156 116h18M156 136h18" ${stroke('accent-text', 7)}/>
<path d="M290 92c-40 0-50 34-80 34" ${stroke('text-2', 8)}/>
<rect x="198" y="104" width="22" height="44" rx="6" ${fill('surface')}/>
<rect x="198" y="104" width="22" height="44" rx="6" ${stroke('border-strong', 3)}/>
<path d="M182 92l6 10M186 160l6-10M176 126h8" ${stroke('warning', 4)}/>`),
  cone: scene(`<path d="M160 54l40 156h-80z" ${fill('accent')}/>
<path d="M146 108h28l6 26h-40zM136 150h48l6 26h-60z" ${fill('surface')}/>
<rect x="104" y="206" width="112" height="14" rx="5" ${fill('accent-text')}/>
<path d="M232 196l34-34m-6-14a14 14 0 1020 20l-8-2-6-6z" ${stroke('text-2', 8)}/>`),
  cloud: scene(`<path d="M104 176a34 34 0 01-2-68 46 46 0 0188-14 38 38 0 0128 82z" ${fill('surface')}/>
<path d="M104 176a34 34 0 01-2-68 46 46 0 0188-14 38 38 0 0128 82z" ${stroke('accent-text', 7)}/>
<path d="M96 72l132 136" ${stroke('text-2', 9)}/>
<path d="M140 200h40M160 200v14" ${stroke('text-3', 5)}/>`),
  rocket: scene(`<path d="M160 44c30 20 40 60 30 110h-60c-10-50 0-90 30-110z" ${fill('surface')}/>
<path d="M160 44c30 20 40 60 30 110h-60c-10-50 0-90 30-110z" ${stroke('accent-text', 6)}/>
<circle cx="160" cy="96" r="14" ${fill('accent')}/>
<path d="M130 132l-20 30h24M190 132l20 30h-24" ${stroke('accent-text', 6)}/>
<path d="M146 166c0 16 6 26 14 38 8-12 14-22 14-38z" ${fill('accent-2')}/>
<path d="M92 84h20M100 76v16M226 112h16M234 104v16" ${stroke('accent', 4)}/>`),
};

const btn = (text, href, cls = 'v-btn-secondary', ic) => `<a class="v-btn ${cls}" href="${href}">${ic ? icon(ic) : ''}${text}</a>`;
const HOME = '{p}saas-home.html';
const STATUS = 'coming-soon.html';

// Each status page. extra: markup placed after the actions; script: page-only behaviour.
export const SYSTEM = [
  {
    slug: '401', code: '401', kicker: 'Error 401', name: 'Sign in needed', art: 'key',
    title: 'Sign in to see this page',
    text: 'This page belongs to a Northwind account. You are not signed in, or you were signed out after a while without activity.',
    actions: [btn('Sign in', '{root}examples/auth/sign-in/password.html', 'v-btn-primary'), btn('Go to the home page', HOME)],
    note: 'No account yet? <a href="{root}examples/auth/sign-up/single.html">Start a free trial</a>, it takes two minutes.',
  },
  {
    slug: '403', code: '403', kicker: 'Error 403', name: 'No access', art: 'door',
    title: 'You do not have access to this page',
    text: 'You are signed in, but your role on this team does not include this page. Owners and admins can change roles in Settings.',
    actions: [btn('Back to your dashboard', '{p}app-shell.html', 'v-btn-primary'), btn('Go to the home page', HOME)],
    note: 'Think you should have access? Ask the owner of your account, or <a href="{p}contact.html">contact support</a>.',
  },
  {
    slug: '404', code: '404', kicker: 'Error 404', name: 'Page not found', art: 'compass',
    title: 'We cannot find that page',
    text: 'The link may be old, or the page may have moved. If you typed the address, check it for typos.',
    actions: [btn('Go to the home page', HOME, 'v-btn-primary'), btn('Contact us', '{p}contact.html')],
    extra: `<form class="v-system-extra" action="{p}blog.html" role="search" aria-label="Search the site">
<label class="v-sr-only" for="search-404">Search the site</label>
<div class="v-input-group v-search">
<span class="v-input-addon">${icon('search')}</span>
<input class="v-input" id="search-404" name="q" type="search" placeholder="Search guides and help">
<button class="v-btn v-btn-secondary" type="submit">Search</button>
</div>
</form>`,
    note: 'Popular pages: <a href="{p}pricing.html">Pricing</a>, <a href="{p}blog.html">Blog</a>, <a href="{p}landing.html">Online booking</a>.',
  },
  {
    slug: '419', code: '419', kicker: 'Error 419', name: 'Page expired', art: 'hourglass',
    title: 'This page has expired',
    text: 'For your security, forms stop working when they sit open for a long time. Refresh the page, then send the form again.',
    actions: [btn('Refresh the page', '419.html', 'v-btn-primary', 'refresh'), btn('Go to the home page', HOME)],
    note: 'Wrote something long? Copy it before you refresh, as it may not have been saved.',
  },
  {
    slug: '429', code: '429', kicker: 'Error 429', name: 'Too many requests', art: 'gauge',
    title: 'Too many requests, please wait a moment',
    text: 'To keep Northwind quick for everyone, we limit how often a page can be loaded or a form sent. Nothing is wrong with your account.',
    extraBefore: `<div class="v-alert v-alert-info v-system-extra" data-countdown="60">${icon('clock')}<p class="v-alert-body" role="timer">You can try again in <strong data-countdown-value>60 seconds</strong>.</p></div>`,
    actions: [btn('Try again', '429.html', 'v-btn-primary', 'refresh'), btn('Go to the home page', HOME)],
    note: 'Using our API? Wait for the time in the Retry-After header before sending more requests.',
    script: `/* Example only: counts the wait down once a second. Without JS the starting number stays. */
const box = document.querySelector('[data-countdown]');
const text = box.querySelector('.v-alert-body');
let left = Number(box.dataset.countdown);
const timer = setInterval(() => {
  left -= 1;
  if (left > 0) text.querySelector('strong').textContent = left === 1 ? '1 second' : \`\${left} seconds\`;
  else {
    clearInterval(timer);
    text.textContent = 'You can try again now.';
  }
}, 1000);`,
  },
  {
    slug: '500', code: '500', kicker: 'Error 500', name: 'Server error', art: 'plug',
    title: 'Something went wrong on our side',
    text: 'It is not something you did. Our team has been told and is looking into it. Please try again in a minute or two.',
    actions: [btn('Try again', '500.html', 'v-btn-primary', 'refresh'), btn('Go to the home page', HOME)],
    extra: `<p class="v-system-note">Reference <code>NW-7F3A-91C2</code> <button class="v-btn v-btn-ghost v-btn-sm" type="button" data-v-copy="NW-7F3A-91C2">${icon('copy')}Copy</button></p>`,
    note: `Still not working? Check the <a href="${STATUS}">status page</a> or <a href="{p}contact.html">contact support</a> and quote the reference above.`,
  },
  {
    slug: '503', code: '503', kicker: 'Error 503', name: 'Maintenance', art: 'cone',
    title: 'Down for planned maintenance',
    text: 'We are upgrading our servers. Northwind will be back by 06:00 Irish time on Sunday 8 November. Your data is safe, and bookings from your website will be waiting.',
    extraBefore: `<div class="v-system-extra v-stack" style="--v-gap: var(--v-space-2)">
<div class="v-cluster v-justify-between v-text-sm"><span>Started 04:00</span><span>About 40 minutes left</span></div>
<progress class="v-progress" value="65" max="100" aria-label="Maintenance progress">65%</progress>
</div>`,
    actions: [btn('See live updates', STATUS, 'v-btn-primary'), btn('Email support', 'mailto:help@northwind.ie', 'v-btn-secondary', 'mail')],
    note: 'Need something urgently? Call 091 555 0142 and a person will help.',
  },
  {
    slug: 'offline', kicker: 'Offline', name: 'Offline', art: 'cloud',
    title: 'You are offline',
    text: 'Northwind cannot reach the internet right now. Check your Wi-Fi or mobile data, then try again.',
    extraBefore: `<ul class="v-system-extra v-system-list">
<li>${icon('check-circle')}<span>Jobs you opened today are saved on this device</span></li>
<li>${icon('check-circle')}<span>Notes and photos you add now will sync later</span></li>
<li>${icon('check-circle')}<span>Nothing is lost if you close the app</span></li>
</ul>`,
    actions: [btn('Try again', 'offline.html', 'v-btn-primary', 'refresh')],
    note: 'Still offline after a few minutes? Restarting your router or phone often helps.',
  },
  {
    slug: 'coming-soon', kicker: 'Coming soon', name: 'Coming soon', art: 'rocket',
    title: 'Team scheduling is almost here',
    text: 'Plan every crew\'s week on one board, drag jobs between vans and text each person their day. We are testing it with 40 businesses now, and it opens to everyone in January.',
    extraBefore: `<form class="v-form-inline v-system-extra" action="coming-soon.html" method="post">
${CSRF}
<div class="v-field v-grow">
<label class="v-label" for="notify-email">Email address</label>
<input class="v-input" id="notify-email" name="email" type="email" autocomplete="email" placeholder="you@business.ie" required>
</div>
<button class="v-btn v-btn-primary" type="submit">Tell me when it is ready</button>
</form>`,
    actions: [btn('See what Northwind does today', HOME, 'v-btn-ghost', 'arrow')],
    note: 'One email when it launches. Nothing else, and you can unsubscribe in one click.',
  },
];

function body(s, illustrated) {
  const lead = illustrated || !s.code ? `<p class="v-kicker">${s.kicker}</p>` : `<p class="v-system-code"><span class="v-sr-only">Error </span>${s.code}</p>`;
  return `<div class="v-system${illustrated ? ' v-system-illustrated' : ''}">
<header class="v-system-header">
${brand(HOME)}
</header>
<main class="v-system-main v-skip-target" id="main" tabindex="-1">
${illustrated ? `<div class="v-system-art">\n${ART[s.art]}\n</div>` : ''}
<div class="v-system-copy">
${lead}
<h1 class="v-system-title">${s.title}</h1>
<p class="v-system-text">${s.text}</p>
${s.extraBefore ?? ''}
<div class="v-system-actions">
${s.actions.join('\n')}
</div>
${s.extra ?? ''}
${s.note ? `<p class="v-system-note">${s.note}</p>` : ''}
</div>
</main>
<footer class="v-system-footer">
<a href="${HOME}">Home</a>
<a href="{p}contact.html">Help</a>
<a href="${STATUS}">Status</a>
<span>&copy; 2026 Northwind</span>
</footer>
</div>`;
}

export function systemPages(page) {
  const out = [];
  for (const s of SYSTEM) {
    for (const illustrated of [false, true]) {
      const file = `${s.slug}${illustrated ? '-illustrated' : ''}`;
      out.push([`system/${file}.html`, page({
        title: `${s.code ? `${s.code} ` : ''}${s.name} · Northwind`,
        description: `${s.name}: a Northwind system page (${illustrated ? 'illustrated' : 'minimal'} layout) built with Vectra.`,
        depth: 1,
        label: `${s.name.toLowerCase()}`,
        variants: { label: 'Layout', items: [['Minimal', `${s.slug}.html`, !illustrated], ['Illustrated', `${s.slug}-illustrated.html`, illustrated]] },
        body: body(s, illustrated),
        script: s.script,
      })]);
    }
  }
  return out;
}

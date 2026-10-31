/* Content for the auth example pages: one entry per page, plus the small helpers that write the repeated
   form markup. build/auth-pages.mjs wraps each box in its layout and writes examples/auth/.
   {auth} becomes the path to examples/auth/ from the page (links between flows).
   Field names follow Laravel Breeze and Fortify, so the Blade package can post straight to their routes. */

const CSRF = '<!-- Laravel: @csrf goes here. It prints the hidden _token field. -->';
const icon = (name) => `<svg class="v-icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
const attr = (name, value) => (value === undefined || value === false ? '' : value === true ? ` ${name}` : ` ${name}="${value}"`);

export function field({ id, label, type = 'text', name = id, auto, required = true, hint, error, server, value, extra = '', end, cls = 'v-input', optional }) {
  const describe = [hint && `${id}-hint`, server && `${id}-error`].filter(Boolean).join(' ');
  const labelTag = `<label class="v-label" for="${id}">${label}${optional ? ' <span class="v-optional">Optional</span>' : ''}</label>`;
  return `<div class="v-field">
${end ? `<div class="v-cluster v-justify-between">\n${labelTag}\n${end}\n</div>` : labelTag}
<input class="${cls}" id="${id}" name="${name}" type="${type}"${attr('autocomplete', auto)}${attr('value', value)}${attr('required', required)}${attr('aria-invalid', server && 'true')}${attr('aria-describedby', describe || undefined)}${extra}>
${hint ? `<p class="v-hint" id="${id}-hint">${hint}</p>\n` : ''}${server || error ? `<p class="v-field-error" id="${id}-error">${server || error}</p>` : ''}
</div>`;
}

export function password({ id = 'password', name = id, label = 'Password', auto = 'current-password', error = 'Enter your password.', server, hint, strength, forgot } = {}) {
  const describe = [hint && `${id}-hint`, server && `${id}-error`].filter(Boolean).join(' ');
  const labelTag = `<label class="v-label" for="${id}">${label}</label>`;
  return `<div class="v-field">
${forgot ? `<div class="v-cluster v-justify-between">\n${labelTag}\n<a class="v-text-sm" href="{auth}recovery/forgot.html">Forgot password?</a>\n</div>` : labelTag}
<div class="v-input-group" data-v-password>
<input class="v-input" id="${id}" name="${name}" type="password" autocomplete="${auto}" required${auto === 'new-password' ? ' minlength="8"' : ''}${attr('aria-invalid', server && 'true')}${attr('aria-describedby', describe || undefined)}${strength ? ` data-v-strength="#${id}-meter"` : ''}>
<button class="v-btn v-btn-ghost v-btn-icon v-password-toggle" type="button" aria-label="Show password" aria-pressed="false" aria-controls="${id}">${icon('eye')}${icon('eye-off')}</button>
</div>
${strength ? `<meter class="v-meter" id="${id}-meter" min="0" max="4" low="2" high="3" optimum="4" value="0" aria-label="Password strength"></meter>\n` : ''}${hint ? `<p class="v-hint" id="${id}-hint">${hint}</p>\n` : ''}<p class="v-field-error" id="${id}-error">${server || error}</p>
</div>`;
}

export const code = ({ id = 'code', label = 'Code', hint, server } = {}) => field({
  id, label, hint, server, auto: 'one-time-code', cls: 'v-input v-auth-code',
  extra: ' inputmode="numeric" pattern="[0-9]{6}" maxlength="6"',
  error: 'Enter the 6-digit code.',
});

const header = (title, text, mark) => `<header class="v-auth-header">
${mark ?? ''}<h1 class="v-auth-title" id="auth-title">${title}</h1>
${text ? `<p class="v-auth-text">${text}</p>` : ''}
</header>`;
const mark = (name, tone) => `<span class="v-auth-icon${tone ? ` v-auth-icon-${tone}` : ''}" aria-hidden="true">${icon(name)}</span>\n`;
const form = (id, action, body, extra = '') => `<form class="v-form" id="${id}" method="post" action="${action}" data-v-validate${extra}>
${CSRF}
${body}
</form>`;
const submit = (text, cls = 'v-btn-primary') => `<button class="v-btn ${cls} v-btn-block" type="submit">${text}</button>`;
const alt = (html) => `<p class="v-auth-alt">${html}</p>`;
const box = (...parts) => `<div class="v-auth-box">\n${parts.filter(Boolean).join('\n')}\n</div>`;
const email = (o = {}) => field({ id: 'email', label: 'Email', type: 'email', auto: 'username', error: 'Enter your email address, like name@example.com.', ...o });
const remember = '<label class="v-choice"><input class="v-checkbox" type="checkbox" name="remember" value="1"><span>Keep me signed in on this device</span></label>';
const status = (text, tone = 'success') => `<div class="v-alert v-alert-${tone}" role="status">${icon(tone === 'success' ? 'check' : 'info')}<p class="v-alert-body">${text}</p></div>`;

// Generic provider marks drawn for the kit. Real buttons should use each provider's own artwork and rules.
const PROVIDERS = [['orbit', 'Orbit'], ['quill', 'Quill'], ['hexa', 'Hexa']];
const providers = `<!-- Provider marks are placeholders: swap in each provider's own button artwork. -->
<div class="v-stack v-gap-3">
${PROVIDERS.map(([id, name]) => `<a class="v-btn v-btn-secondary v-btn-block" href="#">${icon(`p-${id}`)}Continue with ${name}</a>`).join('\n')}
</div>`;

/** The password sign-in box. The gallery shows this one in all six layouts. */
export function signIn({ server = false } = {}) {
  return box(
    header('Welcome back', 'Sign in to pick up where you left off.'),
    form('sign-in-form', '{auth}first-run/welcome.html', [
      email(server ? { value: 'aoife@westline.ie', server: 'These credentials do not match our records.' } : {}),
      password({ forgot: true }),
      remember,
      submit('Sign in'),
    ].join('\n')),
    alt('New to Northwind? <a href="{auth}sign-up/single.html">Create an account</a>'),
  );
}

// A QR code placeholder: finder squares in three corners and a fixed scatter of modules between them.
function qr() {
  const n = 25;
  let seed = 7;
  const cells = [];
  const finder = (x, y) => x < 8 && y < 8;
  for (let y = 0; y < n; y += 1) {
    for (let x = 0; x < n; x += 1) {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      if (finder(x, y) || finder(n - 1 - x, y) || finder(x, n - 1 - y)) continue;
      if (seed % 7 < 3) cells.push(`M${x} ${y}h1v1h-1z`);
    }
  }
  const eye = (x, y) => `<path d="M${x} ${y}h7v7h-7zM${x + 1} ${y + 1}v5h5v-5z" fill-rule="evenodd"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3"/>`;
  return `<svg class="v-auth-qr" viewBox="-1 -1 27 27" role="img" aria-label="QR code for your authenticator app">
<g fill="currentColor">${eye(0, 0)}${eye(18, 0)}${eye(0, 18)}<path d="${cells.join('')}"/></g>
</svg>`;
}

const RECOVERY_CODES = ['7KQ2-M9XD', 'P4WN-8J3C', 'T6RB-2HVE', 'Z9LF-5QAK', 'C3YG-7NMP', 'H8DS-4UWT', 'R2XJ-6BKF', 'V5EQ-9LZA'];

/* Each page: group, slug (file name), layout ('card', 'split-art', 'split-panel', or a custom renderer),
   title for <title>, and the box. wide: true for plan pickers, set-up and onboarding. */
export const GROUPS = [
  ['sign-in', 'Sign in'],
  ['sign-up', 'Sign up'],
  ['recovery', 'Recovery'],
  ['verification', 'Verification'],
  ['two-factor', 'Two-factor'],
  ['sessions', 'Sessions'],
  ['accounts', 'Accounts'],
  ['first-run', 'First run'],
];

export const PAGES = [
  // Sign in
  { group: 'sign-in', slug: 'password', label: 'Password', layout: 'split-art', box: signIn() },
  { group: 'sign-in', slug: 'error', label: 'Wrong password (server error)', layout: 'card', box: signIn({ server: true }) },
  {
    group: 'sign-in', slug: 'magic-link', label: 'Magic link', layout: 'card',
    box: box(
      header('Sign in with a link', 'We\'ll email you a link that signs you in. No password needed.', mark('mail')),
      form('magic-form', '{auth}recovery/check-email.html', [email(), submit('Email me a sign-in link')].join('\n')),
      alt('Rather use a password? <a href="{auth}sign-in/password.html">Sign in with a password</a>'),
    ),
  },
  {
    group: 'sign-in', slug: 'passkey', label: 'Passkey', layout: 'card',
    box: box(
      header('Sign in with a passkey', 'Use your fingerprint, face or screen lock. Nothing to type, nothing to forget.', mark('passkey')),
      form('passkey-form', '{auth}first-run/welcome.html', [
        field({ id: 'email', label: 'Email', type: 'email', auto: 'username webauthn', required: false, optional: true, hint: 'Helps us find your passkey faster.' }),
        `<button class="v-btn v-btn-primary v-btn-block" type="submit">${icon('passkey')}Continue with a passkey</button>`,
      ].join('\n')),
      '<p class="v-divider"><span>or</span></p>',
      '<a class="v-btn v-btn-secondary v-btn-block" href="{auth}sign-in/password.html">Use your password instead</a>',
      alt('Passkeys live on your device or in your password manager. <a href="#">How passkeys work</a>'),
    ),
  },
  {
    group: 'sign-in', slug: 'social', label: 'Social buttons', layout: 'split-art',
    box: box(
      header('Sign in to Northwind', 'Pick how you\'d like to sign in.'),
      providers,
      '<p class="v-divider"><span>or use your email</span></p>',
      form('social-form', '{auth}sign-in/password.html', [email(), submit('Continue', 'v-btn-secondary')].join('\n')),
      alt('New to Northwind? <a href="{auth}sign-up/single.html">Create an account</a>'),
    ),
  },
  {
    group: 'sign-in', slug: 'sso', label: 'Single sign-on (SSO)', layout: 'card',
    box: box(
      header('Sign in with SSO', 'Enter your work email and we\'ll send you to your company\'s sign-in page.', mark('building')),
      form('sso-form', '#', [email({ label: 'Work email', hint: 'For example, aoife@westline.ie' }), submit('Continue')].join('\n')),
      alt('Not using single sign-on? <a href="{auth}sign-in/password.html">Sign in with a password</a>'),
    ),
  },
  {
    group: 'sign-in', slug: 'remember-me', label: 'Remembered accounts', layout: 'card',
    box: box(
      header('Welcome back', 'Choose an account to carry on.'),
      `<ul class="v-list">
<li><a class="v-list-item" href="{auth}sessions/lock.html"><span class="v-avatar v-avatar-sm" aria-hidden="true">AK</span><span class="v-list-body"><span class="v-list-title">Aoife Kelly</span><span class="v-list-meta">aoife@westline.ie</span></span></a></li>
<li><a class="v-list-item" href="{auth}sessions/lock.html"><span class="v-avatar v-avatar-sm" aria-hidden="true">AK</span><span class="v-list-body"><span class="v-list-title">Aoife Kelly</span><span class="v-list-meta">aoife.kelly@example.ie</span></span></a></li>
</ul>`,
      '<a class="v-btn v-btn-secondary v-btn-block" href="{auth}sign-in/password.html">Use another account</a>',
      alt('On a shared computer? <a href="#">Forget these accounts</a>'),
    ),
  },

  // Sign up
  {
    group: 'sign-up', slug: 'single', label: 'Single step', layout: 'split-panel',
    box: box(
      header('Create your account', 'Free for 14 days. No card needed.'),
      form('sign-up-form', '{auth}verification/link-sent.html', [
        field({ id: 'name', label: 'Full name', auto: 'name', error: 'Enter your name.' }),
        field({ id: 'email', label: 'Email', type: 'email', auto: 'email', error: 'Enter your email address, like name@example.com.' }),
        password({ label: 'Password', auto: 'new-password', strength: true, hint: 'At least 8 characters. A few unrelated words work well.', error: 'Use at least 8 characters.' }),
        password({ id: 'password_confirmation', label: 'Confirm password', auto: 'new-password', error: 'Type the same password again.' }),
        '<div class="v-field">\n<label class="v-choice"><input class="v-checkbox" id="terms" type="checkbox" name="terms" value="1" required><span>I agree to the <a href="#">terms</a> and <a href="#">privacy policy</a></span></label>\n<p class="v-field-error" id="terms-error">Agree to the terms to create an account.</p>\n</div>',
        submit('Create account'),
      ].join('\n')),
      alt('Already have an account? <a href="{auth}sign-in/password.html">Sign in</a>'),
    ),
  },
  {
    group: 'sign-up', slug: 'multi-step', label: 'Multi-step', layout: 'card', wide: true,
    box: box(
      `<ol class="v-steps" aria-label="Sign-up progress">
<li class="v-step v-step-complete"><span class="v-step-label"><span class="v-sr-only">Completed: </span>Account</span></li>
<li class="v-step" aria-current="step"><span class="v-step-label">Profile</span></li>
<li class="v-step"><span class="v-step-label">Workspace</span></li>
</ol>`,
      header('Tell us about you', 'Step 2 of 3. You can change all of this later.'),
      form('profile-form', '{auth}first-run/onboarding.html', [
        '<div class="v-form-grid">',
        field({ id: 'first_name', label: 'First name', auto: 'given-name', error: 'Enter your first name.' }),
        field({ id: 'last_name', label: 'Last name', auto: 'family-name', error: 'Enter your last name.' }),
        field({ id: 'job_title', label: 'Job title', auto: 'organization-title', required: false, optional: true }),
        field({ id: 'phone', label: 'Mobile number', type: 'tel', auto: 'tel', required: false, optional: true, hint: 'Only for sign-in codes.' }),
        '</div>',
        '<div class="v-form-actions">\n<a class="v-btn v-btn-ghost v-form-actions-start" href="{auth}sign-up/single.html">Back</a>\n<button class="v-btn v-btn-primary" type="submit">Continue</button>\n</div>',
      ].join('\n')),
    ),
  },
  {
    group: 'sign-up', slug: 'plans', label: 'With plan picker', layout: 'card', wide: true,
    box: box(
      header('Pick a plan', 'Every plan starts with a 14 day free trial. Switch or cancel any time.'),
      form('plan-form', '{auth}sign-up/single.html', [
        '<fieldset class="v-fieldset v-fieldset-plain">',
        '<legend class="v-legend">Plan</legend>',
        '<div class="v-stack v-gap-3">',
        ...[
          ['starter', 'Starter', 'For one person getting organised.', '€0', 'forever', false],
          ['team', 'Team', 'A shared schedule, crews and job notes.', '€12', 'per person a month', true],
          ['business', 'Business', 'Roles, an audit log and single sign-on.', '€24', 'per person a month', false],
        ].map(([value, name, text, price, per, checked]) => `<label class="v-choice-card">
<input class="v-radio" type="radio" name="plan" value="${value}"${checked ? ' checked' : ''}>
<span class="v-choice-card-body"><span class="v-choice-card-title">${name}</span><span class="v-choice-card-text">${text}</span></span>
<span class="v-choice-card-price">${price}<small>${per}</small></span>
</label>`),
        '</div>',
        '</fieldset>',
        submit('Start free trial'),
      ].join('\n')),
      alt('Need more than 50 seats? <a href="#">Talk to us</a>'),
    ),
  },
  {
    group: 'sign-up', slug: 'waitlist', label: 'Invite-only waitlist', layout: 'split-art',
    box: box(
      header('Northwind is invite-only for now', 'Join the waiting list and we\'ll email you when there\'s room. Got an invite? Use the link in your email.'),
      form('waitlist-form', '#', [
        field({ id: 'email', label: 'Email', type: 'email', auto: 'email', error: 'Enter your email address, like name@example.com.' }),
        `<div class="v-field">
<label class="v-label" for="team_size">Team size <span class="v-optional">Optional</span></label>
<select class="v-select" id="team_size" name="team_size">
<option value="">Choose one</option>
<option>Just me</option>
<option>2 to 10</option>
<option>11 to 50</option>
<option>More than 50</option>
</select>
</div>`,
        submit('Join the waiting list'),
      ].join('\n')),
      alt('We only email you about your invite. Already invited? <a href="{auth}accounts/invite.html">Accept your invite</a>'),
    ),
  },

  // Recovery
  {
    group: 'recovery', slug: 'forgot', label: 'Forgot password', layout: 'card',
    box: box(
      header('Forgot your password?', 'Enter your email and we\'ll send you a link to choose a new one.', mark('key')),
      form('forgot-form', '{auth}recovery/check-email.html', [
        field({ id: 'email', label: 'Email', type: 'email', auto: 'email', error: 'Enter your email address, like name@example.com.' }),
        submit('Email me a reset link'),
      ].join('\n')),
      alt('Remembered it? <a href="{auth}sign-in/password.html">Back to sign in</a>'),
    ),
  },
  {
    group: 'recovery', slug: 'check-email', label: 'Check your email', layout: 'card',
    box: box(
      header('Check your email', 'We sent a link to <strong>aoife@westline.ie</strong>. It works for the next 60 minutes.', mark('mail')),
      status('We have emailed your password reset link.'),
      form('resend-form', '#', submit('Send the link again', 'v-btn-secondary')),
      alt('Not there? Check your spam folder, or <a href="{auth}recovery/forgot.html">try another email</a>.'),
    ),
  },
  {
    group: 'recovery', slug: 'reset', label: 'Reset password', layout: 'card',
    box: box(
      header('Choose a new password', 'Make it at least 8 characters. A few unrelated words work well.'),
      form('reset-form', '{auth}recovery/changed.html', [
        '<input type="hidden" name="token" value="">',
        field({ id: 'email', label: 'Email', type: 'email', auto: 'username', value: 'aoife@westline.ie', error: 'Enter your email address, like name@example.com.' }),
        password({ label: 'New password', auto: 'new-password', strength: true, hint: 'At least 8 characters. A few unrelated words work well.', error: 'Use at least 8 characters.' }),
        password({ id: 'password_confirmation', label: 'Confirm new password', auto: 'new-password', error: 'Type the same password again.' }),
        submit('Reset password'),
      ].join('\n')),
    ),
  },
  {
    group: 'recovery', slug: 'changed', label: 'Password changed', layout: 'card',
    box: box(
      header('Password changed', 'You can sign in with your new password now. We signed you out on your other devices, just in case.', mark('check', 'success')),
      '<a class="v-btn v-btn-primary v-btn-block" href="{auth}sign-in/password.html">Sign in</a>',
    ),
  },

  // Verification
  {
    group: 'verification', slug: 'link-sent', label: 'Verify email (link sent)', layout: 'card',
    box: box(
      header('Verify your email', 'We sent a link to <strong>aoife@westline.ie</strong>. Open it to finish setting up your account.', mark('mail')),
      form('verify-resend-form', '#', submit('Send the email again', 'v-btn-secondary')),
      alt('Wrong address? <a href="#">Change it</a> or <a href="{auth}sessions/signed-out.html">sign out</a>.'),
    ),
  },
  {
    group: 'verification', slug: 'code', label: 'Verify email (code entry)', layout: 'card',
    box: box(
      header('Enter the code we emailed', 'We sent a 6-digit code to <strong>aoife@westline.ie</strong>. It expires in 10 minutes.', mark('mail')),
      form('verify-code-form', '{auth}verification/verified.html', [code({ label: 'Verification code' }), submit('Verify email')].join('\n')),
      alt('Didn\'t get it? <a href="#">Send a new code</a>'),
    ),
  },
  {
    group: 'verification', slug: 'verified', label: 'Email verified', layout: 'card',
    box: box(
      header('Email verified', 'Thanks, Aoife. Your account is ready.', mark('check', 'success')),
      '<a class="v-btn v-btn-primary v-btn-block" href="{auth}first-run/welcome.html">Go to Northwind</a>',
    ),
  },

  // Two-factor
  {
    group: 'two-factor', slug: 'code', label: 'Enter code', layout: 'card',
    box: box(
      header('Two-step verification', 'Enter the 6-digit code from your authenticator app.', mark('shield')),
      form('two-factor-form', '{auth}first-run/welcome.html', [code(), submit('Verify')].join('\n')),
      alt('<a href="{auth}two-factor/recovery.html">Use a recovery code</a> or <a href="{auth}two-factor/sms.html">text me a code</a>'),
    ),
  },
  {
    group: 'two-factor', slug: 'recovery', label: 'Use a recovery code', layout: 'card',
    box: box(
      header('Use a recovery code', 'Enter one of the codes you saved when you set up two-step verification. Each code works once.', mark('shield')),
      form('recovery-code-form', '{auth}first-run/welcome.html', [
        field({ id: 'recovery_code', label: 'Recovery code', auto: 'one-time-code', value: '7KQ2-M9XO', server: 'That code doesn\'t match. Check for typos, or try another code.', extra: ' autocapitalize="characters" spellcheck="false"' }),
        submit('Continue'),
      ].join('\n')),
      alt('<a href="{auth}two-factor/code.html">Use your authenticator app</a> instead. Lost your codes too? <a href="#">Contact support</a>'),
    ),
  },
  {
    group: 'two-factor', slug: 'setup', label: 'Set up 2FA', layout: 'card', wide: true,
    box: box(
      header('Set up two-step verification', 'A second step when you sign in, so a stolen password isn\'t enough.', mark('shield')),
      '<h2 class="v-form-section-title">1. Scan this code</h2>',
      '<p class="v-auth-text">Open your authenticator app and scan the code with your camera.</p>',
      qr(),
      '<h2 class="v-form-section-title">2. Or type in the key</h2>',
      `<div class="v-field">
<label class="v-label" for="secret">Setup key</label>
<div class="v-input-group">
<input class="v-input v-font-mono" id="secret" type="text" value="JBSW Y3DP EHPK 3PXP" readonly>
<button class="v-btn v-btn-ghost" type="button" data-v-copy="JBSWY3DPEHPK3PXP">${icon('copy')}Copy</button>
</div>
</div>`,
      '<h2 class="v-form-section-title">3. Enter the 6-digit code</h2>',
      form('confirm-two-factor-form', '{auth}two-factor/recovery-codes.html', [
        code({ hint: 'The code changes every 30 seconds.' }),
        '<div class="v-form-actions">\n<a class="v-btn v-btn-ghost v-form-actions-start" href="#">Cancel</a>\n<button class="v-btn v-btn-primary" type="submit">Turn on two-step verification</button>\n</div>',
      ].join('\n')),
    ),
  },
  {
    group: 'two-factor', slug: 'recovery-codes', label: 'Recovery codes', layout: 'card',
    box: box(
      header('Save your recovery codes', 'If you lose your phone, each code signs you in once. Keep them somewhere safe, like your password manager.', mark('shield', 'success')),
      `<ul class="v-auth-codes" id="codes" aria-label="Recovery codes">\n${RECOVERY_CODES.map((c) => `<li>${c}</li>`).join('\n')}\n</ul>`,
      `<div class="v-cluster">
<button class="v-btn v-btn-secondary" type="button" data-v-copy data-v-copy-target="#codes">${icon('copy')}Copy</button>
<a class="v-btn v-btn-secondary" href="data:text/plain;charset=utf-8,${encodeURIComponent(`Northwind recovery codes\n\n${RECOVERY_CODES.join('\n')}\n`)}" download="northwind-recovery-codes.txt">${icon('download')}Download</a>
</div>`,
      form('saved-codes-form', '{auth}first-run/welcome.html', [
        '<div class="v-field">\n<label class="v-choice"><input class="v-checkbox" id="saved" type="checkbox" name="saved" required><span>I\'ve saved my recovery codes</span></label>\n<p class="v-field-error" id="saved-error">Save your codes first, then tick the box.</p>\n</div>',
        submit('Done'),
      ].join('\n')),
    ),
  },
  {
    group: 'two-factor', slug: 'sms', label: 'SMS fallback', layout: 'card',
    box: box(
      header('Check your phone', 'We texted a 6-digit code to the number ending in 4821.', mark('phone')),
      form('sms-form', '{auth}first-run/welcome.html', [code(), submit('Verify')].join('\n')),
      alt('No text after a minute? <a href="#">Send it again</a> or <a href="{auth}two-factor/code.html">use your authenticator app</a>.'),
    ),
  },

  // Sessions
  {
    group: 'sessions', slug: 'lock', label: 'Lock screen', layout: 'card',
    box: box(
      `<header class="v-auth-header v-text-center">
<span class="v-avatar v-avatar-lg v-mx-auto" aria-hidden="true">AK</span>
<h1 class="v-auth-title" id="auth-title">Welcome back, Aoife</h1>
<p class="v-auth-text">Your screen locked after 15 minutes away. Enter your password to carry on; everything you had open is still here.</p>
</header>`,
      form('unlock-form', '{auth}first-run/empty-dashboard.html', [
        '<input type="email" name="email" autocomplete="username" value="aoife@westline.ie" hidden>',
        password(),
        submit('Unlock'),
      ].join('\n')),
      alt('Not Aoife? <a href="{auth}sign-in/password.html">Sign in as someone else</a>'),
    ),
  },
  {
    group: 'sessions', slug: 'expired', label: 'Session expired', layout: 'card',
    box: box(
      header('Your session expired', 'You were signed out after 2 hours without activity. Sign in again and we\'ll take you back to the page you were on.', mark('clock', 'warning')),
      status('Anything you\'d typed is saved as a draft.', 'info'),
      form('expired-form', '{auth}first-run/empty-dashboard.html', [
        email({ value: 'aoife@westline.ie' }),
        password({ forgot: true }),
        submit('Sign in again'),
      ].join('\n')),
    ),
  },
  {
    group: 'sessions', slug: 'signed-out', label: 'Signed out', layout: 'card',
    box: box(
      header('You were signed out on this device', 'This happens when you sign out everywhere from your settings, or change your password on another device.', mark('logout')),
      '<a class="v-btn v-btn-primary v-btn-block" href="{auth}sign-in/password.html">Sign in again</a>',
      alt('Wasn\'t you? <a href="{auth}recovery/forgot.html">Secure your account</a>'),
    ),
  },
  {
    group: 'sessions', slug: 'too-many', label: 'Too many attempts', layout: 'card',
    box: box(
      header('Too many attempts', 'To keep your account safe, signing in is paused for a moment.', mark('clock', 'warning')),
      '<p class="v-alert v-alert-warning" id="retry">Try again in <strong><span data-countdown="60">60</span> seconds</strong>.</p>',
      '<a class="v-btn v-btn-secondary v-btn-block" href="{auth}recovery/forgot.html">Reset your password</a>',
      alt('<a href="{auth}sign-in/password.html">Back to sign in</a>'),
    ),
    script: `/* Counts down the wait (HTTP 429, Retry-After). The number is not announced every second; the end is. */
import { announce } from '{root}src/js/index.js';
const out = document.querySelector('[data-countdown]');
let left = Number(out.dataset.countdown);
const tick = setInterval(() => {
  left -= 1;
  out.textContent = left;
  out.nextSibling.textContent = left === 1 ? ' second' : ' seconds';
  if (left > 0) return;
  clearInterval(tick);
  document.getElementById('retry').textContent = 'You can try again now.';
  announce('You can try again now.');
}, 1000);`,
  },
  {
    group: 'sessions', slug: 'locked', label: 'Account locked', layout: 'card',
    box: box(
      header('Your account is locked', 'After 10 wrong passwords in a row we locked your account to keep it safe. We\'ve emailed <strong>aoife@westline.ie</strong> a link to unlock it.', mark('lock', 'danger')),
      '<a class="v-btn v-btn-primary v-btn-block" href="{auth}recovery/forgot.html">Reset your password</a>',
      '<a class="v-btn v-btn-secondary v-btn-block" href="#">Contact support</a>',
    ),
  },
  {
    group: 'sessions', slug: 'suspended', label: 'Account suspended', layout: 'card',
    box: box(
      header('Your account is suspended', 'We suspended Westline Roofing on 28 October 2026 because two invoices are unpaid. Your data is safe and kept for 30 days.', mark('ban', 'danger')),
      `<div class="v-stack v-gap-2">
<h2 class="v-form-section-title">What you can do</h2>
<ul class="v-stack v-gap-2">
<li>Pay the open invoices and access comes back straight away.</li>
<li>Download your data from the billing page.</li>
<li>Write to us if you think this is a mistake.</li>
</ul>
</div>`,
      '<a class="v-btn v-btn-primary v-btn-block" href="#">Go to billing</a>',
      '<a class="v-btn v-btn-secondary v-btn-block" href="#">Contact support</a>',
    ),
  },

  // Accounts
  {
    group: 'accounts', slug: 'invite', label: 'Accept invite', layout: 'split-panel',
    box: box(
      `<header class="v-auth-header">
<span class="v-avatar v-avatar-lg" aria-hidden="true">NB</span>
<h1 class="v-auth-title" id="auth-title">Join Westline Roofing</h1>
<p class="v-auth-text">Niamh Brennan invited you to plan jobs with the team on Northwind.</p>
</header>`,
      form('invite-form', '{auth}first-run/welcome.html', [
        '<input type="hidden" name="token" value="">',
        field({ id: 'email', label: 'Email', type: 'email', auto: 'username', value: 'aoife@westline.ie', extra: ' readonly' }),
        field({ id: 'name', label: 'Full name', auto: 'name', error: 'Enter your name.' }),
        password({ label: 'Choose a password', auto: 'new-password', hint: 'At least 8 characters.', error: 'Use at least 8 characters.' }),
        submit('Accept invite'),
      ].join('\n')),
      alt('Already on Northwind? <a href="{auth}sign-in/password.html">Sign in to accept</a>'),
    ),
  },
  {
    group: 'accounts', slug: 'workspace', label: 'Choose workspace', layout: 'card',
    box: box(
      header('Choose a workspace', 'You\'re a member of three.'),
      `<ul class="v-list">
<li><a class="v-list-item" href="{auth}first-run/empty-dashboard.html"><span class="v-avatar v-avatar-sm v-avatar-square" aria-hidden="true">WR</span><span class="v-list-body"><span class="v-list-title">Westline Roofing</span><span class="v-list-meta">12 people · Owner</span></span></a></li>
<li><a class="v-list-item" href="{auth}first-run/empty-dashboard.html"><span class="v-avatar v-avatar-sm v-avatar-square" aria-hidden="true">HG</span><span class="v-list-body"><span class="v-list-title">Harbour Gardens</span><span class="v-list-meta">4 people · Member</span></span></a></li>
<li><a class="v-list-item" href="{auth}first-run/empty-dashboard.html"><span class="v-avatar v-avatar-sm v-avatar-square" aria-hidden="true">QB</span><span class="v-list-body"><span class="v-list-title">The Quay Bar</span><span class="v-list-meta">7 people · Admin</span></span></a></li>
</ul>`,
      `<a class="v-btn v-btn-secondary v-btn-block" href="{auth}first-run/onboarding.html">${icon('plus')}Create a workspace</a>`,
      alt('Signed in as aoife@westline.ie. <a href="{auth}sessions/signed-out.html">Not you?</a>'),
    ),
  },
  {
    group: 'accounts', slug: 'terms', label: 'Consent and terms update', layout: 'card', wide: true,
    box: box(
      header('We\'ve updated our terms', 'The new terms start on 1 December 2026. Here\'s what changed, in plain words:', mark('file')),
      `<ul class="v-stack v-gap-2">
<li>Invoices are now stored for 7 years, to match Irish tax rules.</li>
<li>You can export everything, any time, in one file.</li>
<li>We added two companies that help us send email. We never sell your data.</li>
</ul>`,
      '<p class="v-auth-text"><a href="#">Read the full terms</a> or <a href="#">see every change</a>.</p>',
      form('terms-form', '{auth}first-run/empty-dashboard.html', [
        '<div class="v-field">\n<label class="v-choice"><input class="v-checkbox" id="terms" type="checkbox" name="terms" value="1" required><span>I agree to the updated terms and privacy policy</span></label>\n<p class="v-field-error" id="terms-error">Tick the box to carry on using Northwind.</p>\n</div>',
        submit('Agree and continue'),
      ].join('\n')),
      alt('Don\'t agree? You can <a href="{auth}accounts/delete.html">export your data and close your account</a>.'),
    ),
  },
  {
    group: 'accounts', slug: 'delete', label: 'Delete account', layout: 'card',
    box: box(
      header('Delete your account', 'This deletes your account and the Westline Roofing workspace for everyone in it: jobs, files and invoices. It can\'t be undone.', mark('trash', 'danger')),
      `<div class="v-alert v-alert-warning">${icon('alert')}<p class="v-alert-body">Download your data first. <a href="#">Export everything</a></p></div>`,
      form('delete-form', '{auth}sessions/signed-out.html', [
        password({ server: 'That password isn\'t right. Try again.' }),
        field({ id: 'confirmation', label: 'Type DELETE to confirm', auto: 'off', extra: ' pattern="DELETE" autocapitalize="characters" spellcheck="false"', error: 'Type DELETE in capitals to confirm.' }),
        '<div class="v-form-actions">\n<a class="v-btn v-btn-ghost v-form-actions-start" href="{auth}first-run/empty-dashboard.html">Cancel</a>\n<button class="v-btn v-btn-danger" type="submit">Delete my account</button>\n</div>',
      ].join('\n')),
    ),
  },

  // First run
  {
    group: 'first-run', slug: 'welcome', label: 'Welcome', layout: 'split-art',
    box: box(
      header('Welcome to Northwind, Aoife', 'Three quick things and your week is planned.', mark('sparkle')),
      `<ol class="v-steps v-steps-vertical" aria-label="Getting started">
<li class="v-step"><span class="v-step-label">Add your first job</span><span class="v-step-desc">A customer, an address and a day.</span></li>
<li class="v-step"><span class="v-step-label">Invite your crew</span><span class="v-step-desc">They see their week on their phones.</span></li>
<li class="v-step"><span class="v-step-label">Connect your calendar</span><span class="v-step-desc">Jobs show up next to everything else.</span></li>
</ol>`,
      '<a class="v-btn v-btn-primary v-btn-block" href="{auth}first-run/onboarding.html">Get started</a>',
      alt('<a href="{auth}first-run/empty-dashboard.html">Skip for now</a>'),
    ),
  },
  {
    group: 'first-run', slug: 'onboarding', label: 'Onboarding steps', layout: 'card', wide: true,
    box: box(
      `<ol class="v-steps" aria-label="Set-up progress">
<li class="v-step" aria-current="step"><span class="v-step-label">Your team</span></li>
<li class="v-step"><span class="v-step-label">Your work</span></li>
<li class="v-step"><span class="v-step-label">Invite</span></li>
</ol>`,
      header('How big is your team?', 'We\'ll set up Northwind to fit. You can change this later.'),
      form('onboarding-form', '{auth}first-run/connect.html', [
        '<fieldset class="v-fieldset v-fieldset-plain">',
        '<legend class="v-legend">Team size</legend>',
        '<div class="v-grid" style="--v-min: 13rem">',
        ...[['solo', 'Just me', 'user', false], ['small', '2 to 10 people', 'users', true], ['medium', '11 to 50 people', 'building', false], ['large', 'More than 50', 'building', false]]
          .map(([value, text, ico, checked]) => `<label class="v-choice-card">
<input class="v-radio" type="radio" name="team_size" value="${value}"${checked ? ' checked' : ''}>
<span class="v-choice-card-icon">${icon(ico)}</span>
<span class="v-choice-card-body"><span class="v-choice-card-title">${text}</span></span>
</label>`),
        '</div>',
        '</fieldset>',
        `<div class="v-field">
<label class="v-label" for="trade">What kind of work do you do?</label>
<select class="v-select" id="trade" name="trade" required>
<option value="">Choose one</option>
<option>Roofing</option>
<option>Gardening and landscaping</option>
<option>Cleaning</option>
<option>Electrical</option>
<option>Something else</option>
</select>
<p class="v-field-error" id="trade-error">Choose the closest match.</p>
</div>`,
        '<div class="v-form-actions">\n<a class="v-btn v-btn-ghost v-form-actions-start" href="{auth}first-run/empty-dashboard.html">Skip set-up</a>\n<button class="v-btn v-btn-primary" type="submit">Continue</button>\n</div>',
      ].join('\n')),
    ),
  },
  {
    group: 'first-run', slug: 'connect', label: 'Connect accounts', layout: 'card', wide: true,
    box: box(
      header('Connect your tools', 'Bring in your calendar and email, so jobs land where you already look.'),
      `<ul class="v-list">
<li class="v-list-item"><span class="v-choice-card-icon">${icon('calendar')}</span><span class="v-list-body"><span class="v-list-title">Calendar</span><span class="v-list-meta">Jobs appear on your calendar.</span></span><span class="v-list-end"><span class="v-badge v-badge-success">${icon('check')}Connected</span></span></li>
<li class="v-list-item"><span class="v-choice-card-icon">${icon('mail')}</span><span class="v-list-body"><span class="v-list-title">Email</span><span class="v-list-meta">Send quotes and invoices from your own address.</span></span><span class="v-list-end"><button class="v-btn v-btn-secondary v-btn-sm" type="button">Connect<span class="v-sr-only"> email</span></button></span></li>
<li class="v-list-item"><span class="v-choice-card-icon">${icon('cloud')}</span><span class="v-list-body"><span class="v-list-title">File storage</span><span class="v-list-meta">Keep photos and job sheets in one place.</span></span><span class="v-list-end"><button class="v-btn v-btn-secondary v-btn-sm" type="button">Connect<span class="v-sr-only"> file storage</span></button></span></li>
</ul>`,
      '<a class="v-btn v-btn-primary v-btn-block" href="{auth}first-run/empty-dashboard.html">Continue</a>',
      alt('You can connect these later in Settings.'),
    ),
  },
  { group: 'first-run', slug: 'empty-dashboard', label: 'Empty dashboard', layout: 'app' },
];

/** The empty dashboard is an app page, not an auth layout. */
export const dashboard = `<div class="v-banner v-banner-warning" role="status">
${icon('mail')}
<p class="v-banner-body"><strong>Verify your email.</strong> We sent a link to aoife@westline.ie.</p>
<div class="v-banner-actions"><a class="v-btn v-btn-secondary v-btn-sm" href="{auth}verification/link-sent.html">Resend link</a></div>
</div>
<section class="v-stack">
<h1>Good morning, Aoife</h1>
<p class="v-text-secondary">Here's your week at Westline Roofing.</p>
</section>
<div class="v-switcher" style="--v-switch: 40rem">
<section class="v-card" aria-labelledby="jobs-title">
<h2 class="v-card-title" id="jobs-title">This week</h2>
<div class="v-empty">
<span class="v-empty-icon" aria-hidden="true">${icon('calendar')}</span>
<p class="v-empty-title">No jobs yet</p>
<p>Add a job and it shows up here, on the right day.</p>
<a class="v-btn v-btn-primary v-btn-sm" href="#">${icon('plus')}Add a job</a>
</div>
</section>
<section class="v-card" aria-labelledby="start-title">
<div class="v-card-header">
<h2 class="v-card-title" id="start-title">Getting started</h2>
<span class="v-badge">1 of 3 done</span>
</div>
<ol class="v-steps v-steps-vertical" aria-label="Getting started">
<li class="v-step v-step-complete"><span class="v-step-label"><span class="v-sr-only">Completed: </span>Create your account</span></li>
<li class="v-step" aria-current="step"><span class="v-step-label"><a href="#">Add your first job</a></span></li>
<li class="v-step"><span class="v-step-label"><a href="{auth}first-run/connect.html">Connect your calendar</a></span></li>
</ol>
</section>
</div>`;

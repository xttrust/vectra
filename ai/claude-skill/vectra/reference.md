# Vectra 2.0.0-alpha.0 reference

Generated from dist/ai/vectra.manifest.json by build/manifest.mjs (npm run ai:skill). Do not edit by hand.

## Components

72 components. Icons in examples point at /icons/sprite.svg; change the path to where dist/icons/sprite.svg is served.

### Actions

#### Button (button)

The main action control, in six variants and three sizes, on a button, a link or a submit input. Native: <button>, <a>, <input type="submit">.

Base:
- .v-btn: The button. On its own it is the default, neutral style.
Modifiers:
- .v-btn-primary: The main action: filled with the accent.
- .v-btn-secondary: Bordered, for actions next to a primary one.
- .v-btn-ghost: No fill or border until hovered; for toolbars and quiet actions.
- .v-btn-soft: A light accent tint.
- .v-btn-danger: Destructive actions. Name the action (Delete project), not just OK.
- .v-btn-sm: Small size.
- .v-btn-lg: Large size.
- .v-btn-block: Fills the width of its container.

States:
- disabled: Native disabled: dimmed, not focusable, no click.
- aria-disabled="true": Looks disabled but stays focusable, for links or when the reason should still be reachable.
- aria-busy="true": Loading: a spinner appears before the label. Pair it with disabled so it is not pressed twice.

Keyboard:
- Tab: Moves focus to the button.
- Enter / Space: Presses a button. A link button follows its link on Enter only.

Accessibility:
- Use <button type="button"> for actions and <a href> for navigation, so the role and keys match what people expect.
- A busy button keeps its label in the markup, so screen readers still hear what is loading.
- Every variant holds 4.5:1 text contrast in all four directions and both themes.

Example (Variants):

```html
<button class="v-btn v-btn-primary" type="button">Primary</button>
<button class="v-btn v-btn-secondary" type="button">Secondary</button>
<button class="v-btn v-btn-ghost" type="button">Ghost</button>
<button class="v-btn v-btn-soft" type="button">Soft</button>
<button class="v-btn v-btn-danger" type="button">Danger</button>
<button class="v-btn" type="button">Default</button>
```

#### Button group (button-group)

Buttons joined edge to edge into one bar, for a small set of related actions. Native: <div role="group">.

Base:
- .v-btn-group: Joins its .v-btn children: inner corners go square and borders overlap so there is one line between buttons.

States:
- role="group": Groups the buttons for assistive technology. Pair it with aria-label.
- disabled: On one button, disables just that button.

Keyboard:
- Tab / Shift+Tab: Moves between the buttons, one at a time.
- Enter / Space: Presses the focused button.

Accessibility:
- Put role="group" and an aria-label on the wrapper so screen readers announce what the buttons are for.
- The focused button is lifted above its neighbours, so the whole focus ring stays visible.
- Each button is its own tab stop. Keep groups short; a long row of tab stops is slow to move through.

Example (Text buttons):

```html
<div class="v-btn-group" role="group" aria-label="Text alignment">
  <button class="v-btn v-btn-secondary" type="button">Left</button>
  <button class="v-btn v-btn-secondary" type="button">Centre</button>
  <button class="v-btn v-btn-secondary" type="button">Right</button>
</div>
```

#### Copy button (copy-button)

A button that copies a fixed string or the text of another element to the clipboard. Native: <button>, navigator.clipboard.


States:
- aria-label: On an icon-only copy button this is the text that changes to Copied, so screen readers hear it too.

Hooks:
- data-v-copy = The text to copy. Leave it empty when data-v-copy-target is set. (on the <button>.): Turns the button into a copy button. Always needed, even with a target.
- data-v-copy-target = A CSS selector, e.g. #api-key. (on the <button>.): Copies the textContent of the element it points at instead of the data-v-copy value.

Keyboard:
- Tab: Moves focus to the button.
- Enter / Space: Copies, and the label reads Copied for two seconds.

Accessibility:
- The result is announced through Vectra's live region: "Copied to clipboard", or a note that the text is selected when copying fails.
- The visible label changes too (the last text node, or aria-label on an icon button), so sighted users get the same feedback.
- Keep a real text label or an aria-label such as "Copy API key"; a bare icon gives no name.

Example (Copy a value):

```html
<button class="v-btn v-btn-secondary" type="button" data-v-copy="npm install @creativeigniter/vectra"><svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#copy"/></svg>Copy install command</button>
```

#### Icon button (icon-button)

A square button that holds only an icon, for compact toolbars and row actions. Native: <button>.

Modifiers:
- .v-btn-icon: Add to any .v-btn: makes it square, as wide as it is tall, with no padding. Works with every variant and size.

States:
- aria-label: The accessible name. Required, because the icon itself is hidden from screen readers.
- disabled: Native disabled: dimmed, not focusable, no click.
- aria-pressed: Makes it a toggle; see the toggle button entry.

Keyboard:
- Tab: Moves focus to the button.
- Enter / Space: Presses the button.

Accessibility:
- Give every icon button an aria-label that names the action (Delete invoice), and mark the svg aria-hidden="true".
- At the default size the target is the control height (--v-control-h), well above the 24px minimum. Small stays above it too.
- Add a tooltip for icons that are less familiar, but keep the aria-label: a tooltip is not the accessible name.

Example (Variants):

```html
<button class="v-btn v-btn-primary v-btn-icon" type="button" aria-label="Add"><svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#plus"/></svg></button>
<button class="v-btn v-btn-secondary v-btn-icon" type="button" aria-label="Search"><svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#search"/></svg></button>
<button class="v-btn v-btn-ghost v-btn-icon" type="button" aria-label="Settings"><svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#settings"/></svg></button>
<button class="v-btn v-btn-danger v-btn-icon" type="button" aria-label="Delete"><svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#trash"/></svg></button>
```

#### Segmented control (segmented-control)

A radio group styled as a bar of options, for picking one of two to five choices. Native: <fieldset> with <input type="radio">.

Base:
- .v-segmented: On a <fieldset>. Each option is a <label> holding a radio and a <span> for the text. Scrolls sideways if the options do not fit.

States:
- checked: The selected radio: its span gets the raised surface and a shadow.
- name: All radios share one name, which makes them a single group with one value.

Keyboard:
- Tab: Moves focus into the group, onto the selected option, and out again.
- ArrowRight / ArrowDown: Selects the next option (native radio behaviour).
- ArrowLeft / ArrowUp: Selects the previous option.

Accessibility:
- Give the fieldset a <legend>; hide it with .v-sr-only if the bar is labelled visually some other way.
- Real radio inputs sit over each option, so screen readers announce "radio button, 1 of 3" with no ARIA needed.
- The selected option differs by surface and shadow as well as text colour, and the focus ring shows on the option span.

Example (Billing period):

```html
<fieldset class="v-segmented">
  <legend class="v-sr-only">Billing period</legend>
  <label><input type="radio" name="period" value="monthly" checked><span>Monthly</span></label>
  <label><input type="radio" name="period" value="yearly"><span>Yearly</span></label>
  <label><input type="radio" name="period" value="lifetime"><span>Lifetime</span></label>
</fieldset>
```

#### Toggle button (toggle-button)

A button that stays switched on or off, shown by aria-pressed, alone or in a toggle group. Native: <button aria-pressed>.

Base:
- .v-toggle-group: A padded tray for a row of toggle buttons that switch on and off independently. Buttons inside lose their own border and fill.

States:
- aria-pressed="true": Switched on: accent tint and a doubled accent border, so it does not rest on colour alone.
- aria-pressed="false": Switched off: the normal button style. Set it explicitly so screen readers know it is a toggle.
- disabled: Native disabled: dimmed, not focusable.

Hooks:
- data-v-toggle = empty, or "single" (on a button with aria-pressed, or any container of them): Flips aria-pressed on click (Enter and Space work natively). With "single", at most one button in the container stays pressed.

Events:
- v:change detail { pressed }: Fires after the pressed state flips.

Keyboard:
- Tab: Moves focus to the button.
- Enter / Space: Switches it on or off (your click handler flips aria-pressed).

Accessibility:
- Keep the label the same in both states; screen readers announce "pressed" or "not pressed" for you. Changing the label as well reads twice.
- Put role="group" and an aria-label on a .v-toggle-group.
- In forced colours mode the pressed button fills with the system Highlight colour.

Example (Single toggles):

```html
<div class="v-cluster" data-v-toggle>
  <button class="v-btn" type="button" aria-pressed="true">Pinned</button>
  <button class="v-btn" type="button" aria-pressed="false">Pin</button>
  <button class="v-btn v-btn-secondary" type="button" aria-pressed="true"><svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#star"/></svg>Starred</button>
  <button class="v-btn v-btn-ghost v-btn-icon" type="button" aria-pressed="false" aria-label="Favourite"><svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#heart"/></svg></button>
</div>
```

### Display

#### Avatar (avatar)

A round picture or initials for a person or account, alone or stacked in a group. Native: <span>, <img>.

Base:
- .v-avatar: A 2.5rem circle with an accent tint for initials. An <img> inside fills and crops to it.
- .v-avatar-group: A row of overlapping avatars with a ring in the surface colour; type shrinks so initials are never covered.
Modifiers:
- .v-avatar-sm: Small, 2rem.
- .v-avatar-lg: Large, 3.5rem.
- .v-avatar-square: Rounded square, for companies and teams rather than people.

Accessibility:
- Give a photo a useful alt (the person's name) unless the name is already written next to it; then use alt="".
- Initials alone are read letter by letter. When the name is not shown nearby, add it with aria-label or a .v-sr-only span.
- Label a group with its meaning, e.g. aria-label="3 team members", on the wrapper.

Example (Sizes and shape):

```html
<span class="v-avatar v-avatar-sm">FP</span>
<span class="v-avatar">AK</span>
<span class="v-avatar v-avatar-lg">RM</span>
<span class="v-avatar v-avatar-square">JS</span>
```

#### Badge (badge)

A small pill for a status, a count or a short label. Native: <span>.

Base:
- .v-badge: The badge. On its own it is neutral grey.
Modifiers:
- .v-badge-accent: Accent tint.
- .v-badge-solid: Filled with the accent, for the one badge that should stand out.
- .v-badge-success: Success tone: paid, live, done.
- .v-badge-warning: Warning tone: pending, due soon.
- .v-badge-danger: Danger tone: overdue, failed.
- .v-badge-info: Info tone.
- .v-badge-outline: Transparent with a border.
- .v-badge-dot: Adds a leading dot in the badge's colour.

Accessibility:
- The text carries the meaning; tone colour only supports it, so "Overdue" still reads in greyscale.
- A count badge next to an icon needs context for screen readers, e.g. a .v-sr-only "unread messages" after the number.
- Every tone holds 4.5:1 text contrast in all directions and both themes.

Example (Tones):

```html
<span class="v-badge">Default</span>
<span class="v-badge v-badge-accent">Accent</span>
<span class="v-badge v-badge-solid">Solid</span>
<span class="v-badge v-badge-success">Live</span>
<span class="v-badge v-badge-warning">Pending</span>
<span class="v-badge v-badge-danger">Overdue</span>
<span class="v-badge v-badge-info">Info</span>
<span class="v-badge v-badge-outline">Outline</span>
```

#### Card (card)

The main surface for grouped content, with optional header, media, footer, link and feature styles. Native: <article>, <a>.

Base:
- .v-card: The card: padded, bordered, with the direction's shadow and sheen. Its children stack with a gap. On an <a> the whole card is a link and lifts on hover.
Modifiers:
- .v-card-feature: The direction's emphasis surface, for the one card that should stand out. Text and border tokens are remapped inside.
Parts:
- .v-card-header: A row with the title at the start and a badge or action at the end.
- .v-card-title: The card heading, in the display font.
- .v-card-text: Body text in the secondary text colour.
- .v-card-footer: A row of actions under a rule.
- .v-card-media: An image (first child) that bleeds to the card's top and side edges.

Accessibility:
- Use a real heading (h2, h3) for .v-card-title so cards show up in the page outline.
- A link card is one link: keep buttons and other links out of it, or they nest inside the link.
- The link card shows the focus ring around the whole card.
- Text inside the feature card is checked for contrast against the feature surface in every direction and theme.

Example (Header, text and footer):

```html
<article class="v-card">
  <header class="v-card-header">
    <h3 class="v-card-title">Project Atlas</h3>
    <span class="v-badge v-badge-success">Live</span>
  </header>
  <p class="v-card-text">Marketing site for a roofing company. Launched last week, already ranking for local searches.</p>
  <footer class="v-card-footer">
    <button class="v-btn v-btn-primary v-btn-sm" type="button">Open</button>
    <button class="v-btn v-btn-ghost v-btn-sm" type="button">Share</button>
  </footer>
</article>
```

#### Description list (description-list)

Label and value pairs on a <dl>, stacked or in two columns, with an optional action per row. Native: <dl>.

Base:
- .v-dl: On a <dl> whose rows are <div>s holding a <dt> and its <dd>, with a rule between rows. Stacked by default.
Modifiers:
- .v-dl-cols: Term and value side by side once the list is at least 32rem wide (a container query).
Parts:
- .v-dl-action: A last <dd> in a row for an edit link or copy button, aligned to the end.

Accessibility:
- Wrapping each <dt>/<dd> pair in a <div> is valid HTML and keeps the pairs together for screen readers.
- Name actions with their row, e.g. a .v-sr-only "billing email" after "Change", when several rows have the same action.
- Terms are smaller muted text but still meet 4.5:1 contrast.

Example (Two columns in a card):

```html
<div class="v-card">
  <h3 class="v-card-title">Order summary</h3>
  <dl class="v-dl v-dl-cols">
    <div><dt>Plan</dt><dd>Professional site with client admin</dd></div>
    <div><dt>Billing email</dt><dd>accounts@roofing.example</dd><dd class="v-dl-action"><a class="v-btn v-btn-ghost v-btn-sm" href="#">Change<span class="v-sr-only"> billing email</span></a></dd></div>
    <div><dt>Care plan</dt><dd>€50 per month</dd><dd class="v-dl-action"><a class="v-btn v-btn-ghost v-btn-sm" href="#">Change<span class="v-sr-only"> care plan</span></a></dd></div>
    <div><dt>Total today</dt><dd><strong>€1,499</strong></dd></div>
  </dl>
</div>
```

#### Divider (divider)

A horizontal rule with a short label in the middle, such as "or continue with". Native: <p>, <hr>.

Base:
- .v-divider: Draws a line either side of its text, which sits in the middle in small muted type.

Accessibility:
- The label is ordinary text, so screen readers read it in place. Keep it meaningful ("or"), not decorative.
- A plain <hr> is announced as a separator; use it when there is no label.

Example (Labelled):

```html
<p class="v-divider"><span>or continue with</span></p>
```

#### Empty state (empty-state)

A centred icon, title, line of help and action, for a list or page with nothing in it yet. Native: <div>.

Base:
- .v-empty: Centres its children in a padded column.
Parts:
- .v-empty-icon: A soft tile that holds one icon.
- .v-empty-title: The short headline, in the display font.

Accessibility:
- Hide the icon tile with aria-hidden="true"; the title says it all.
- If the empty state appears after a search or filter, announce it (for example inside a role="status" region) so screen reader users know the result.
- Use a heading element for the title when the empty state stands in for a whole page section.

Example (First run):

```html
<div class="v-empty">
  <span class="v-empty-icon" aria-hidden="true"><svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#inbox"/></svg></span>
  <p class="v-empty-title">No invoices yet</p>
  <p>When you send your first invoice, it shows up here.</p>
  <button class="v-btn v-btn-primary v-btn-sm" type="button">Create invoice</button>
</div>
```

#### Figure (figure)

An image, video or embed with an optional caption, cropped to a fixed aspect ratio by a frame. Native: <figure>, <figcaption>.

Base:
- .v-figure: On a <figure>: an image or frame with a small muted caption under it.
- .v-frame: Crops its img, video, iframe, svg or picture to 16:9 with object-fit: cover and rounded corners.
Modifiers:
- .v-frame-1x1: Square.
- .v-frame-4x3: 4:3.
- .v-frame-16x9: 16:9, the default, written out.
- .v-frame-21x9: 21:9, for wide banners.

Accessibility:
- Give every meaningful image an alt that says what it shows; the caption adds context and does not replace alt.
- If the caption already describes the picture fully, alt="" avoids reading it twice.
- Cropping hides the edges of the image, so keep the important part in the middle.
- An embedded iframe in a frame needs a title attribute.

Example (Aspect-ratio frames):

```html
<div class="v-grid" style="--v-min: 11rem">
  <figure class="v-figure">
    <div class="v-frame v-frame-1x1"><svg viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" role="img" aria-label="A slate roof under an evening sky"><defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f2a65a"/><stop offset="1" stop-color="#6b5ca5"/></linearGradient></defs><rect width="400" height="400" fill="url(#sky)"/><path d="M0 260 200 120 400 260V400H0z" fill="#2f3542"/></svg></div>
    <figcaption>1:1. Slate re-roof.</figcaption>
  </figure>
  <figure class="v-figure">
    <div class="v-frame v-frame-4x3"><svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Green lawn and a hedge"><rect width="400" height="300" fill="#a8d8ea"/><path d="M0 170q100-40 200 0t200 0V300H0z" fill="#3c8d5a"/><rect y="230" width="400" height="70" fill="#5fae6f"/></svg></div>
    <figcaption>4:3. Spring garden clean-up.</figcaption>
  </figure>
  <figure class="v-figure">
    <div class="v-frame"><svg viewBox="0 0 480 270" preserveAspectRatio="xMidYMid slice" role="img" aria-label="A DJ booth lit in purple"><rect width="480" height="270" fill="#1e1b3a"/><circle cx="160" cy="80" r="70" fill="#7f5af0" opacity=".55"/><circle cx="330" cy="70" r="60" fill="#2cb67d" opacity=".4"/><rect x="120" y="180" width="240" height="60" rx="6" fill="#0f0e17"/></svg></div>
    <figcaption>16:9. Release night.</figcaption>
  </figure>
</div>
```

#### Icon (icon)

An SVG icon from the Vectra sprite, drawn with <use>, that takes the text colour and scales with the font size. Native: <svg><use href>.

Base:
- .v-icon: Sizes the svg to 1.15em, strokes it in currentcolor and stops it shrinking in flex rows. Components such as buttons and badges resize it to fit.

Accessibility:
- Mark an icon next to text aria-hidden="true", so it is not read.
- An icon that is the only content of a button needs an aria-label on the button.
- A standalone icon that carries meaning needs role="img" and an aria-label on the svg.
- Icons use currentcolor, so they follow the text colour and switch with forced colours mode.

Example (Usage):

```html
<svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#search"/></svg>
<svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#settings"/></svg>
<svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#download"/></svg>
<svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#heart"/></svg>
<svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#warning"/></svg>
<svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#check"/></svg>
```

#### Kbd (kbd)

A keyboard key, or a combination of keys, shown inline in text. Native: <kbd>.

Base:
- .v-kbd: One key: a small keycap in the mono font with a thicker bottom edge.
- .v-kbd-combo: An outer <kbd> around several .v-kbd keys and the + between them.

Accessibility:
- <kbd> is read as plain text, so write the key names in full where symbols are ambiguous, or add an aria-label (e.g. "Up arrow").
- Show the shortcut for the platform people are on (Ctrl or Cmd) when you know it.

Example (Keys and combinations):

```html
<p>Open the command palette with <kbd class="v-kbd-combo"><kbd class="v-kbd">Ctrl</kbd>+<kbd class="v-kbd">K</kbd></kbd>.</p>
<p>Save with <kbd class="v-kbd-combo"><kbd class="v-kbd">Cmd</kbd>+<kbd class="v-kbd">S</kbd></kbd>, close with <kbd class="v-kbd">Esc</kbd>.</p>
<p>Move between rows with <kbd class="v-kbd" aria-label="Up arrow">↑</kbd> <kbd class="v-kbd" aria-label="Down arrow">↓</kbd> and open one with <kbd class="v-kbd">Enter</kbd>.</p>
```

#### List group (list-group)

Rows of related items in one bordered box, plain or with avatars, meta and actions. Native: <ul>, <ol>.

Base:
- .v-list: The bordered box on a <ul>, <ol> or <div>, with a rule between rows.
Modifiers:
- .v-list-plain: No box: rows are separated by rules only.
Parts:
- .v-list-item: One row. Put it on the <li>, or on an <a> or <button> inside the <li> to make the whole row clickable.
- .v-list-body: The main text block, which grows to fill the row.
- .v-list-title: The row's main line.
- .v-list-meta: A second, smaller line under the title.
- .v-list-end: Actions, badges or meta pushed to the end of the row.

States:
- aria-current="page": On a linked row: tinted, with an accent bar at the start, for the current item.

Keyboard:
- Tab: Moves between linked rows and any buttons in the rows.
- Enter: Follows a linked row, or presses a button row.

Accessibility:
- Use <ul> or <ol> so screen readers announce the number of items.
- Wrap a list of navigation links in <nav aria-label> and mark the current one with aria-current="page".
- The current row shows a start bar as well as a tint, so it does not rest on colour; in forced colours the bar uses Highlight.
- Do not put buttons inside a linked row; give the row a separate action in .v-list-end instead.

Example (With actions):

```html
<ul class="v-list">
  <li class="v-list-item"><span class="v-list-body"><span class="v-list-title">Invoice INV-0142</span><span class="v-list-meta">Sent 28 Oct · €1,499</span></span><span class="v-list-end"><span class="v-badge v-badge-success">Paid</span></span></li>
  <li class="v-list-item"><span class="v-list-body"><span class="v-list-title">Invoice INV-0143</span><span class="v-list-meta">Sent 30 Oct · €799</span></span><span class="v-list-end"><span class="v-badge v-badge-warning">Due</span></span></li>
  <li class="v-list-item"><span class="v-list-body"><span class="v-list-title">Invoice INV-0144</span><span class="v-list-meta">Draft</span></span><span class="v-list-end"><button class="v-btn v-btn-secondary v-btn-sm" type="button">Send</button></span></li>
</ul>
```

#### Panel (panel)

A plain bordered box split into header, body sections and footer, lighter than a card. Native: <section>, <div>.

Base:
- .v-panel: The box. Each direct child gets a rule above it.
Parts:
- .v-panel-header: A row with the title at the start and an action or badge at the end.
- .v-panel-title: The panel heading.
- .v-panel-body: A padded section. Use several for separate blocks.
- .v-panel-footer: Actions aligned to the end, on a subtle background, pushed to the bottom.

Accessibility:
- Use a heading element for .v-panel-title, at the right level for the page.
- If the panel is a page region, use <section aria-labelledby> pointing at the title.
- Put the main action last in the footer so it is also last in tab order.

Example (Header, sections and footer):

```html
<div class="v-panel">
  <div class="v-panel-header">
    <h3 class="v-panel-title">Domains</h3>
    <span class="v-badge v-badge-success">3 active</span>
  </div>
  <div class="v-panel-body">
    <p>Point your nameservers to us and SSL is issued within the hour.</p>
  </div>
  <div class="v-panel-body">
    <p>Renewals are charged 14 days before expiry.</p>
  </div>
  <div class="v-panel-footer">
    <button class="v-btn v-btn-ghost v-btn-sm" type="button">Cancel</button>
    <button class="v-btn v-btn-primary v-btn-sm" type="button">Add domain</button>
  </div>
</div>
```

#### Skeleton (skeleton)

Shimmering grey shapes that hold the layout while content loads. Native: <span>.

Base:
- .v-skeleton: A block placeholder, 1em tall, with a slow shimmer. Set its size with inline-size and block-size.
Modifiers:
- .v-skeleton-text: A line of text: slightly shorter, with line spacing.
- .v-skeleton-circle: A circle for an avatar, sized by --v-skeleton-size (2.5rem).

States:
- aria-hidden="true": On the skeleton wrapper: the shapes mean nothing to screen readers.
- aria-busy="true": On the region being loaded, removed when the content arrives.

Accessibility:
- Hide skeletons with aria-hidden="true" and announce loading separately, e.g. a .v-sr-only "Loading clients" in a role="status" region.
- The shimmer stops under prefers-reduced-motion.
- Swap the skeleton for the real content in one go, so focus and reading order do not jump twice.

Example (List row):

```html
<div class="v-cluster" aria-hidden="true">
  <span class="v-skeleton v-skeleton-circle"></span>
  <span class="v-grow">
    <span class="v-skeleton v-skeleton-text" style="inline-size: 70%"></span>
    <span class="v-skeleton v-skeleton-text" style="inline-size: 45%"></span>
  </span>
</div>
<span class="v-sr-only" role="status">Loading clients</span>
```

#### Spinner (spinner)

A small spinning ring for a short wait of unknown length. Native: <span>.

Base:
- .v-spinner: The ring, 1.25rem by default, in the accent colour. Set --v-spinner-size or color to change it.
Modifiers:
- .v-spinner-lg: Large, 2.25rem, for a whole panel or page loading.

Accessibility:
- Mark the spinner aria-hidden="true" and put a text label next to it in a role="status" element, so the wait is announced.
- Under prefers-reduced-motion the ring stops turning; the text label still tells people something is happening.
- Remove the spinner (and the status text) when loading ends, or change the text to say it is done.

Example (With a label):

```html
<div class="v-cluster" role="status">
  <span class="v-spinner" aria-hidden="true"></span>
  <span>Loading projects…</span>
</div>
```

#### Stat card (stat-card)

A labelled number with an optional change badge, for dashboards and summaries. Native: <div>.

Base:
- .v-stat: A tight stack of label, value and any extra line, aligned to the start.
Parts:
- .v-stat-label: What the number is, in small secondary text.
- .v-stat-value: The number: display font, large, with tabular figures so tiles line up.

Accessibility:
- The label comes first in the markup, so screen readers hear "Monthly revenue, €12,940" in a sensible order.
- Say what a change means in words (+8.2% this month), not only with a green or red badge.
- For values that update live, wrap the value in a region with aria-live="polite" only if people need to hear each change.

Example (Stat tiles):

```html
<div class="v-grid" style="--v-min: 11rem">
  <div class="v-card v-stat"><span class="v-stat-label">Monthly revenue</span><span class="v-stat-value">€12,940</span><span class="v-badge v-badge-success">+8.2%</span></div>
  <div class="v-card v-stat"><span class="v-stat-label">Active clients</span><span class="v-stat-value">186</span><span class="v-badge v-badge-danger">-3</span></div>
  <div class="v-card v-stat"><span class="v-stat-label">Avg. response</span><span class="v-stat-value">1.4h</span><span class="v-badge">No change</span></div>
</div>
```

#### Status indicator (status-indicator)

A coloured dot with a label for presence or state: online, busy, away, offline, with an optional pulse. Native: <span>.

Base:
- .v-status: A dot before its label. Online (success colour) by default.
- .v-status-avatar: Wraps an avatar and a .v-status; the dot sits on the end corner with a ring in the surface colour.
Modifiers:
- .v-status-busy: Busy: danger colour.
- .v-status-away: Away: warning colour.
- .v-status-offline: Offline: a hollow ring in the muted colour, so it differs by shape too.
- .v-status-pulse: Adds a slow ring around the dot, for live states.

Accessibility:
- The label carries the meaning; on an avatar keep it as .v-sr-only text inside the .v-status.
- Offline is a hollow ring, not just a grey dot, so the states differ by shape as well as colour.
- The pulse stops under prefers-reduced-motion.
- If the status changes live, announce the change in a role="status" region rather than making every dot a live region.

Example (States):

```html
<span class="v-status"><span>Online</span></span>
<span class="v-status v-status-busy"><span>Busy</span></span>
<span class="v-status v-status-away"><span>Away</span></span>
<span class="v-status v-status-offline"><span>Offline</span></span>
<span class="v-status v-status-pulse"><span>Live now</span></span>
```

#### Tag (tag)

A pill label that can be plain, removed with a close button, or selected like a checkbox. Native: <span>, <label> with <input type="checkbox">, <button aria-pressed>.

Base:
- .v-tag: The tag. On a <label> around a checkbox, or a <button aria-pressed>, it becomes selectable with a control-strength border.
Modifiers:
- .v-tag-accent: Accent tone.
- .v-tag-success: Success tone.
- .v-tag-warning: Warning tone.
- .v-tag-danger: Danger tone.
- .v-tag-info: Info tone.
Parts:
- .v-tag-remove: The close button inside a removable tag: a 24px round target at the end.

States:
- checked: On the checkbox inside a label tag: fills with the accent and adds a check mark.
- aria-pressed="true": On a button tag: the same selected look. Your script flips it.
- disabled: On the checkbox or button: dimmed and not clickable.

Hooks:
- data-v-dismissable (on the .v-tag.): Marks the tag as the thing a close button inside removes.
- data-v-dismiss (on the .v-tag-remove button.): Removes the closest [data-v-dismissable] on click and moves focus to the next control.

Events:
- v:dismiss detail { key }, cancelable: Fires before the tag is removed. Call preventDefault() to keep it, e.g. to remove it yourself after a server call.

Keyboard:
- Tab: Moves to each selectable tag and each remove button.
- Space: Selects or clears a checkbox or button tag.
- Enter / Space: On a remove button, removes the tag; focus moves to the next control.

Accessibility:
- Give each remove button an aria-label that names the tag, such as "Remove Galway", not just "Remove".
- A selected tag gains a check mark as well as the fill, so the state never rests on colour.
- Group selectable tags in a <fieldset> with a <legend> so screen readers know what is being chosen.
- After a tag is removed focus moves to the next control (or the previous one), not to the top of the page.

Example (Tones):

```html
<span class="v-tag">Roofing</span>
<span class="v-tag v-tag-accent">Featured</span>
<span class="v-tag v-tag-success">Paid</span>
<span class="v-tag v-tag-warning">Overdue</span>
<span class="v-tag v-tag-danger">Disputed</span>
<span class="v-tag v-tag-info">Draft</span>
```

### Feedback

#### Alert (alert)

An inline message with a tone (info, success, warning, danger), placed next to the content it is about.

Base:
- .v-alert: The alert box: an icon, then the body. Info tone by default.
Modifiers:
- .v-alert-info: Info tone (the default).
- .v-alert-success: Success tone.
- .v-alert-warning: Warning tone.
- .v-alert-danger: Danger tone, for errors and failures.
Parts:
- .v-alert-body: The text, which takes the remaining width.
- .v-alert-title: A bold lead-in at the start of the body.

States:
- role="alert": Announced at once when it appears. Only for urgent messages added after the page loads.
- role="status": Announced politely, for news that can wait.

Accessibility:
- The tone colour is backed by an icon and the words, so the meaning never rests on colour alone.
- An alert that is in the page from the start needs no role; a live role only matters when it is added later.
- Keep role="alert" for messages that must interrupt, such as a failed payment; overuse makes screen readers noisy.
- Body text holds 4.5:1 contrast on every tone tint in both themes.

Example (Tones):

```html
<div class="v-alert v-alert-info"><svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#info"/></svg><p class="v-alert-body"><strong class="v-alert-title">Heads up.</strong> Maintenance on Sunday from 02:00.</p></div>
<div class="v-alert v-alert-success"><svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#success"/></svg><p class="v-alert-body"><strong class="v-alert-title">Payment received.</strong> Your invoice is marked as paid.</p></div>
<div class="v-alert v-alert-warning"><svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#warning"/></svg><p class="v-alert-body"><strong class="v-alert-title">Storage at 85%.</strong> Upgrade before it fills up.</p></div>
<div class="v-alert v-alert-danger" role="alert"><svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#error"/></svg><p class="v-alert-body"><strong class="v-alert-title">Card declined.</strong> Update your billing details.</p></div>
```

#### Banner (banner)

A full-width message strip at the top of a page or app, for maintenance, a trial ending or a new feature, with optional actions and a dismiss button.

Base:
- .v-banner: The strip: an icon, the body, optional actions and an optional dismiss button. Info tone by default.
Modifiers:
- .v-banner-success: Success tone.
- .v-banner-warning: Warning tone.
- .v-banner-danger: Danger tone.
- .v-banner-accent: Accent tone, for product news.
Parts:
- .v-banner-body: The message; a <strong> inside leads it.
- .v-banner-actions: A row of small buttons or links.
- .v-banner-dismiss: The close button, kept in the top end corner however the rest wraps.

States:
- role="status": Polite announcement, for news.
- role="alert": Interrupts, only when the message is urgent.

Hooks:
- data-v-dismissable (on the .v-banner): Marks the container that a dismiss button removes.
- data-v-dismiss (on the close button inside it): Removes the container on click and moves focus to the next control.
- data-v-dismiss-key = A name, e.g. maintenance-nov (on the close button): Remembers the dismissal in storage, so the banner is removed on later visits too.

Events:
- v:dismiss detail { key }, cancelable: Fires before the banner is removed. Call preventDefault() to keep it.

Keyboard:
- Tab: Moves to the actions and the dismiss button.
- Enter / Space: Dismisses the banner when the close button has focus; focus moves on to the next control.

Accessibility:
- The dismiss button is an icon button, so it needs aria-label="Dismiss".
- After a dismissal focus goes to the next control on the page, not back to the top.
- The tone is backed by the icon and the words; never rely on the colour alone.
- Use role="alert" sparingly; most banners are role="status" or no role at all when they load with the page.

Example (Dismissible):

```html
<div class="v-banner" role="status" data-v-dismissable>
  <svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#info"/></svg>
  <p class="v-banner-body"><strong>Scheduled maintenance</strong> on Sunday 8 November from 02:00 to 03:00 GMT.</p>
  <button class="v-btn v-btn-ghost v-btn-icon v-btn-sm v-banner-dismiss" type="button" data-v-dismiss aria-label="Dismiss"><svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#close"/></svg></button>
</div>
<div class="v-banner v-banner-accent" role="status" data-v-dismissable>
  <svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#sparkles"/></svg>
  <p class="v-banner-body"><strong>New:</strong> live QR tips are here for every artist page.</p>
  <div class="v-banner-actions">
    <a class="v-btn v-btn-primary v-btn-sm" href="#">See how it works</a>
  </div>
  <button class="v-btn v-btn-ghost v-btn-icon v-btn-sm v-banner-dismiss" type="button" data-v-dismiss aria-label="Dismiss"><svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#close"/></svg></button>
</div>
```

#### Callout (callout)

A docs-style aside inside long-form content: note, tip, warning or danger, with a titled type. Native: <aside>.

Base:
- .v-callout: The aside, with a tone rule on the start side. Note (info) tone by default.
Modifiers:
- .v-callout-tip: Tip, in the success tone.
- .v-callout-warning: Warning tone.
- .v-callout-danger: Danger tone, for things that cannot be undone.
Parts:
- .v-callout-title: The first line: an icon and the type name.

Accessibility:
- The title names the type (Note, Tip, Warning), so the meaning never rests on colour.
- An <aside> with aria-label is a complementary landmark; label it with the type so it is easy to find.
- Callouts are static content; give them no live role.

Example (Four types):

```html
<aside class="v-callout" aria-label="Note">
  <p class="v-callout-title"><svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#info"/></svg>Note</p>
  <p>Directions ship as separate files. Load one with the core for production.</p>
</aside>
<aside class="v-callout v-callout-tip" aria-label="Tip">
  <p class="v-callout-title"><svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#lightbulb"/></svg>Tip</p>
  <p>Every docs page has a search shortcut. Press <kbd class="v-kbd">/</kbd> to use it.</p>
</aside>
<aside class="v-callout v-callout-warning" aria-label="Warning">
  <p class="v-callout-title"><svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#warning"/></svg>Warning</p>
  <p>Changing the accent hue rebuilds every tint. Check custom colours afterwards.</p>
</aside>
<aside class="v-callout v-callout-danger" aria-label="Danger">
  <p class="v-callout-title"><svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#error"/></svg>Danger</p>
  <p>Deleting a site removes its backups too. This cannot be undone.</p>
</aside>
```

#### Connection banner (connection-banner)

A banner that stays hidden until the network drops or slows, then sticks to the top of the page with the right message.

Modifiers:
- .v-connection: On a .v-banner: sticks to the top of the viewport and turns to the warning tone when offline.

States:
- hidden: Set on the banner while the connection is fine, and on every message part except the current one.
- data-state="offline" | "slow": Set by the JS. Offline wins over slow.

Hooks:
- data-v-connection (on A .v-banner.v-connection, hidden to start): Wires the banner to the network state.
- data-v-when = offline or slow (on A child of the banner): The message for that state; only the one that applies is shown.

Accessibility:
- The banner carries role="status" and its text is announced when a state starts, so people know why things have stopped working.
- Back online is announced by a success toast, so the end of the problem is heard too.
- The message says what still works ("You can keep working"), not only what is wrong.

Example (Live):

```html
<div class="v-banner v-connection" data-v-connection role="status" hidden>
  <svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#wifi-off"/></svg>
  <p class="v-banner-body" data-v-when="offline"><strong>You are offline.</strong> You can keep working; changes save when the connection is back.</p>
  <p class="v-banner-body" data-v-when="slow"><strong>Slow connection.</strong> Pages may take longer to load.</p>
</div>
<div class="v-cluster">
  <button class="v-btn v-btn-secondary" type="button" id="go-offline">Go offline</button>
  <button class="v-btn v-btn-secondary" type="button" id="go-online">Back online</button>
  <button class="v-btn v-btn-secondary" type="button" id="go-slow">Slow network</button>
  <button class="v-btn v-btn-ghost" type="button" id="go-fast">Clear slow</button>
</div>
```

```js
const on = (id, fn) => document.getElementById(id).addEventListener('click', fn);
// Demo only: pretend the network dropped or came back.
const simulate = (online) => {
  Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => online });
  window.dispatchEvent(new Event(online ? 'online' : 'offline'));
};
on('go-offline', () => simulate(false));
on('go-online', () => simulate(true));
on('go-slow', () => Vectra.connection.slow(true));
on('go-fast', () => Vectra.connection.slow(false));
```

#### Inline save status (save-status)

A small line of text next to a form or editor that says whether changes are saving, saved, failed or waiting for the network.

Base:
- .v-save-status: The status line, with an icon drawn for each data-state.

States:
- data-state="saving": A small spinner.
- data-state="saved": A green check; the text says how long ago.
- data-state="failed": A red alert icon.
- data-state="offline": A cloud with a slash.

Accessibility:
- saveStatus() announces Saved and failed messages politely by itself; keep the element out of live regions so the 30-second refreshes stay quiet.
- Saving and offline are not announced, so a busy editor does not chatter.
- The icon is decoration; the words carry the state.

Example (Live):

```html
<p class="v-save-status" id="doc-status" data-state="saved">Saved just now</p>
<div class="v-cluster">
  <button class="v-btn v-btn-secondary v-btn-sm" type="button" data-status="saving">Saving</button>
  <button class="v-btn v-btn-secondary v-btn-sm" type="button" data-status="saved">Saved</button>
  <button class="v-btn v-btn-secondary v-btn-sm" type="button" data-status="failed">Failed</button>
  <button class="v-btn v-btn-secondary v-btn-sm" type="button" data-status="offline">Offline</button>
</div>
```

```js
const status = document.getElementById('doc-status');
for (const button of document.querySelectorAll('[data-status]')) {
  button.addEventListener('click', () => Vectra.saveStatus(status, button.dataset.status));
}
```

#### Meter (meter)

A styled native <meter> that shows a measurement in a known range, green, amber or red against the low, high and optimum marks. Native: <meter>.

Base:
- .v-meter: The gauge, on a <meter> element.

States:
- value, min, max: The measurement and its range.
- low, high, optimum: Where the good, middling and poor zones sit. The browser picks the colour: success, warning or danger.

Accessibility:
- Name it with aria-label or aria-labelledby; the native element reports its value to screen readers.
- The colour alone does not say whether a level is good or bad; show the number or a word next to it when that matters.
- Text inside <meter> is a fallback for browsers without support.

Example (Three zones):

```html
<span class="v-text-sm v-text-secondary" id="disk-a">Disk usage, 32%</span>
<meter class="v-meter" min="0" max="100" low="70" high="90" optimum="20" value="32" aria-labelledby="disk-a">32%</meter>
<span class="v-text-sm v-text-secondary" id="disk-b">Disk usage, 82%</span>
<meter class="v-meter" min="0" max="100" low="70" high="90" optimum="20" value="82" aria-labelledby="disk-b">82%</meter>
<span class="v-text-sm v-text-secondary" id="disk-c">Disk usage, 96%</span>
<meter class="v-meter" min="0" max="100" low="70" high="90" optimum="20" value="96" aria-labelledby="disk-c">96%</meter>
```

#### Progress (progress)

A styled native <progress> bar for a task that moves towards done, with an indeterminate sweep when there is no value. Native: <progress>.

Base:
- .v-progress: The bar, on a <progress> element. Leave out value for the indeterminate sweep.

States:
- value: How far along it is, out of max (default 1). Without it the bar is indeterminate.
- max: The value that means done.
- :indeterminate: No value: a band sweeps across the track.

Accessibility:
- Give every bar a name with aria-label or aria-labelledby, so screen readers say what is progressing.
- The native element already has the progressbar role and reports its value; no ARIA is needed beyond the name.
- Text inside <progress> is a fallback only; show the percentage next to the bar if people need to read it.
- For a long task, also announce the end (for example with a toast), since value changes are not read out.

Example (With a value and indeterminate):

```html
<div class="v-flex v-justify-between"><span id="checklist">Launch checklist</span><span class="v-tabular">68%</span></div>
<progress class="v-progress" value="68" max="100" aria-labelledby="checklist">68%</progress>
<span class="v-text-sm v-text-secondary" id="uploading">Uploading files</span>
<progress class="v-progress" aria-labelledby="uploading"></progress>
```

#### Session timeout warning (session-timeout)

A modal alert dialog, opened by Vectra.session.warn(), that counts down to sign-out and lets people stay signed in. Native: <dialog>.

Parts:
- .v-session-time: The countdown, in tabular figures so its width stays steady.

States:
- role="alertdialog": Set by the JS on the modal dialog.

Keyboard:
- Enter / Space: Presses the focused button: Stay signed in, or Sign in after expiry.
- Escape: Closes the warning and counts as staying signed in (calls onExtend).
- Tab: Stays inside the dialog while it is open.

Accessibility:
- Focus lands on Stay signed in when the dialog opens, and on Sign in after expiry.
- The countdown updates every second but is announced only at each minute and at 30 and 10 seconds (WCAG 2.2.1).
- Announcements go to a live region inside the dialog, since the rest of the page is inert while it is open.
- Escape extends the session rather than ignoring the warning, so the quickest key is the safe one.

Example (Live):

```html
<button class="v-btn v-btn-primary" type="button" id="warn-long">Warn, expires in 70 seconds</button>
<button class="v-btn v-btn-secondary" type="button" id="warn-short">Warn, expires in 5 seconds</button>
```

```js
const warn = (seconds) => Vectra.session.warn({
  expiresAt: Date.now() + seconds * 1000,
  onExtend: () => Vectra.toast('You are still signed in', { tone: 'success' }),
  onSignIn: () => Vectra.toast('Signed in again', { tone: 'success' }),
});
document.getElementById('warn-long').addEventListener('click', () => warn(70));
document.getElementById('warn-short').addEventListener('click', () => warn(5));
```

#### Toast (toast)

A short message that slides in at the bottom end corner, stacks with others and leaves on its own, built by Vectra.toast(). Native: popover="manual".

Base:
- .v-toast-region: The stack, pinned to the bottom end corner in the top layer. Made by the JS.
- .v-toast: One toast: a tone dot, the text, an optional action and a close button.
Modifiers:
- .v-toast-success: Success dot.
- .v-toast-info: Info dot.
- .v-toast-warning: Warning dot.
- .v-toast-danger: Danger dot; the message is announced assertively.
Parts:
- .v-toast-text: The message.
- .v-toast-action: An optional text button, such as Undo or Retry.
- .v-toast-close: The close button; the cross is drawn in CSS. Needs aria-label.

States:
- data-leaving: Set while a toast fades out, just before it is removed.
- hidden: Set on toasts past the first three; they wait their turn.

Keyboard:
- Tab: Moves into the toast to its action and close buttons. Timers pause while focus is inside.
- Enter / Space: Runs the action or closes the toast.
- Escape: Closes the focused toast.

Accessibility:
- Every message is read out through a polite live region, or an assertive one for tone danger; the action label is added, for example "Project archived. Undo available."
- A toast with an action stays at least 10 seconds, and all timers pause while the stack is hovered or focused (WCAG 2.2.1).
- The tone dot is decoration; the words carry the meaning.
- When a focused toast closes, focus moves to the next toast instead of being lost.

Example (Live toasts):

```html
<button class="v-btn v-btn-primary" type="button" id="toast-saved">Saved</button>
<button class="v-btn v-btn-secondary" type="button" id="toast-undo">Archive with undo</button>
<button class="v-btn v-btn-danger" type="button" id="toast-retry">Error with retry</button>
<button class="v-btn v-btn-secondary" type="button" id="toast-many">Five at once</button>
```

```js
const on = (id, fn) => document.getElementById(id).addEventListener('click', fn);
on('toast-saved', () => Vectra.toast('Changes saved', { tone: 'success' }));
on('toast-undo', () => Vectra.toast('Project archived', { undo: () => Vectra.toast('Project restored') }));
on('toast-retry', () => Vectra.toast('Could not send the invite', {
  tone: 'danger',
  action: { label: 'Retry', onClick: () => Vectra.toast('Invite sent', { tone: 'success' }) },
}));
on('toast-many', () => [1, 2, 3, 4, 5].forEach((n) => Vectra.toast(`Toast ${n}`)));
```

### Forms

#### Async field check (async-field-check)

A status line under a field for checks that need the server, such as "Checking", "Available" or "Taken, try ...".

Base:
- .v-field-status: The status line, with a spinner, a tick or an alert mark. Created by fieldState when missing; hidden while empty.

States:
- data-v-state: Set by fieldState: "checking" (spinner), "valid" (success tick) or "invalid" (danger mark).
- aria-invalid="true": Set on the input for an invalid result, with a custom validity error so the form will not submit.
- aria-describedby: The status line is linked while it has a message, and unlinked when cleared.

Accessibility:
- Each message is announced politely and linked to the input, so screen readers hear the result without moving focus.
- Every state has its own mark as well as colour, so "taken" never relies on red alone.
- Only fieldState undoes its own aria-invalid, so an error from data-v-validate stays until that is fixed.
- Wait for a short pause in typing (a debounce) before checking, so the line does not flicker on every key.

Example (Username):

```html
<div class="v-field">
  <label class="v-label" for="v-user">Username</label>
  <input class="v-input" id="v-user" name="username" type="text" autocomplete="username" required minlength="3" pattern="[a-z0-9\-]+" aria-describedby="v-user-hint">
  <p class="v-hint" id="v-user-hint">Lowercase letters, numbers and hyphens.</p>
</div>
```

```js
const user = document.getElementById('v-user');
let timer;
user.addEventListener('input', () => {
  clearTimeout(timer);
  Vectra.fieldState(user, 'clear');
  if (!user.value || !user.validity.valid) return;
  Vectra.fieldState(user, 'checking', 'Checking if it is free');
  timer = setTimeout(() => {
    const name = user.value;
    if (['admin', 'florin', 'vectra'].includes(name)) Vectra.fieldState(user, 'invalid', `${name} is taken. Try ${name}-ie or ${name}2026.`);
    else Vectra.fieldState(user, 'valid', `${name} is free.`);
  }, 600);
});
```

#### Character counter (character-counter)

An "n of max" line under a text field that gets louder near and past the limit.

Base:
- .v-counter: The counter line. Write it in the markup to place it yourself; otherwise the JS adds it at the end of the field.

States:
- data-v-level: Set by the JS: "near" (last 10%) and "full" in the warning colour, "over" in the danger colour.
- maxlength: A hard limit on the input or textarea. The counter reads it as max.

Hooks:
- data-v-counter (on .v-field): Counts the characters in the field's input or textarea. Needs maxlength or data-v-max.
- data-v-max = number (on .v-field): A soft limit, used when the control has no maxlength.

Accessibility:
- The counter is added to the control's aria-describedby, so it is read with the field.
- Announcements are polite and only at the 90%, full and over thresholds, so typing is not interrupted.
- Past the limit the colour changes and the text says so ("Over the limit by 4" is announced), never colour alone.

Example (Hard limit):

```html
<div class="v-field" data-v-counter>
  <label class="v-label" for="t-msg">Message</label>
  <textarea class="v-input" id="t-msg" name="message" rows="3" maxlength="280" placeholder="Tell us about the job" aria-describedby="t-msg-hint"></textarea>
  <p class="v-hint" id="t-msg-hint">Grows as you type, where the browser supports it.</p>
  <p class="v-counter" id="t-msg-count"></p>
</div>
```

#### Checkbox and radio cards (choice-card)

Rich selectable tiles with a title, text and an optional icon or price, built on a native checkbox or radio. Native: <label>, <input type="checkbox">, <input type="radio">.

Base:
- .v-choice-card: The <label> tile. The whole tile is the click target.
Parts:
- .v-choice-card-body: Holds the title and the text.
- .v-choice-card-title: The option name.
- .v-choice-card-text: One line of detail under the title.
- .v-choice-card-icon: An icon in a tinted square; it takes the accent when checked.
- .v-choice-card-price: A price at the end, with an optional <small> for the period.

States:
- checked: Accent border, doubled in width, plus a light tint.
- disabled: The tile is dimmed and does not react to hover.
- :focus-visible: The focus ring goes round the whole tile, not the small box inside it.

Keyboard:
- Tab: Moves to a checkbox card, or to the checked card of a radio group.
- Space: Toggles a checkbox card or checks the focused radio card.
- ArrowDown / ArrowRight / ArrowUp / ArrowLeft: Moves the choice between radio cards in the same group.

Accessibility:
- The native input stays visible as the state mark and keeps keyboard and form behaviour.
- All text in the tile is inside the <label>, so the title, text and price are read as the control's name. Keep it short.
- Wrap the cards in a <fieldset> with a <legend> that asks the question.
- The checked state is shown by the mark and a thicker border, not by colour alone.

Example (Radio cards with prices):

```html
<fieldset class="v-fieldset v-fieldset-plain">
  <legend class="v-legend">Choose a plan</legend>
  <div class="v-grid" style="--v-min: 14rem">
    <label class="v-choice-card">
      <input class="v-radio" type="radio" name="plan" value="simple" id="cc-simple">
      <span class="v-choice-card-body"><span class="v-choice-card-title">Simple site</span><span class="v-choice-card-text">Up to five pages, contact form, Google Business Profile set-up.</span></span>
      <span class="v-choice-card-price">€799<small>one-off</small></span>
    </label>
    <label class="v-choice-card">
      <input class="v-radio" type="radio" name="plan" value="pro" checked>
      <span class="v-choice-card-body"><span class="v-choice-card-title">Professional</span><span class="v-choice-card-text">Everything in Simple, plus a client admin to edit your own content.</span></span>
      <span class="v-choice-card-price">€1,499<small>one-off</small></span>
    </label>
    <label class="v-choice-card">
      <input class="v-radio" type="radio" name="plan" value="shop" disabled>
      <span class="v-choice-card-body"><span class="v-choice-card-title">Online shop</span><span class="v-choice-card-text">Coming in spring.</span></span>
      <span class="v-choice-card-price">€2,499</span>
    </label>
  </div>
</fieldset>
```

#### Checkbox, radio and switch (choice)

Native checkboxes, radios and switches drawn to match the theme, each wrapped in a label so the whole row is the click target. Native: <input type="checkbox">, <input type="radio">, role="switch".

Base:
- .v-choice: The <label> row that holds the control and its text.
- .v-checkbox: A checkbox, with a checkmark when checked and a dash when indeterminate.
- .v-radio: A round radio button with a dot when checked.
- .v-switch: A checkbox drawn as a sliding switch. Add role="switch".
Parts:
- .v-choice-group: Stacks several .v-choice rows with an even gap.

States:
- checked: Filled with the accent and marked.
- indeterminate: A DOM property only (not an attribute), set from script: shows a dash for a mixed state.
- disabled: The control and its row are dimmed and cannot be changed.
- aria-invalid="true": A danger border on an unchecked control, as does :user-invalid on a required one.
- role="switch": Announces a .v-switch as on or off rather than checked.

Keyboard:
- Tab: Moves to a checkbox or switch, or to the checked radio of a group.
- Space: Toggles a checkbox or switch, or checks the focused radio.
- ArrowDown / ArrowRight / ArrowUp / ArrowLeft: Moves the choice between radios in the same group.

Accessibility:
- The controls stay native inputs, so keyboard, form and label behaviour are the browser's own.
- Wrap the control and its text in <label class="v-choice"> so the text names the control and the whole row is clickable.
- Put a group of choices in a <fieldset> with a <legend> so the question is read with each option.
- Use role="switch" only for settings that apply at once; in a form that is submitted, a checkbox is clearer.

Example (Checkboxes):

```html
<fieldset class="v-fieldset v-fieldset-plain">
  <legend class="v-legend">Notifications</legend>
  <div class="v-choice-group">
    <label class="v-choice"><input class="v-checkbox" type="checkbox" name="n" checked><span>Invoices paid</span></label>
    <label class="v-choice"><input class="v-checkbox" type="checkbox" name="n"><span>New reviews</span></label>
    <label class="v-choice"><input class="v-checkbox" type="checkbox" name="n" id="c-ind"><span>Some projects (mixed)</span></label>
    <label class="v-choice"><input class="v-checkbox" type="checkbox" name="n" disabled><span>Weekly digest</span></label>
    <label class="v-choice"><input class="v-checkbox" type="checkbox" name="n" checked disabled><span>Security alerts</span></label>
  </div>
</fieldset>
```

```js
document.getElementById('c-ind').indeterminate = true;
```

#### Error summary (error-summary)

A box at the top of a form that lists every problem as a link to its field, and takes focus on submit. Native: <form>, constraint validation.

Base:
- .v-error-summary: The summary box, with a thick danger edge and a focus ring that is always drawn.
Parts:
- .v-error-summary-title: The heading line: "There is a problem" or "There are n problems".

States:
- novalidate: Set on the form by the JS, so the summary replaces the browser's bubbles.
- aria-invalid="true": Set by the JS on each invalid control, with its .v-field-error linked by aria-describedby.
- hidden: The summary hides once every problem is fixed, or when a submit passes.
- tabindex="-1": Lets the summary take focus from script without joining the Tab order.

Hooks:
- data-v-validate (on <form>): Turns on the error summary, field marking and focus handling. Reuses a .v-error-summary already in the form.

Keyboard:
- Enter: On submit with problems: focus moves to the summary.
- Tab: Moves through the links in the summary.
- Enter: On a link: focuses that field, not just scrolls to it.

Accessibility:
- Focus moves to the summary on a failed submit, so screen readers read the title and the list straight away.
- The summary is role="group" labelled by its title, and each link carries the same text as the field's error.
- Write a .v-field-error for each field in your own words; without one the browser's validation message is used.
- A failed async check (Vectra.fieldState invalid) is listed with its own message.

Example (Validated form):

```html
<form class="v-stack" id="signup" action="#" data-v-validate>
  <div class="v-field">
    <label class="v-label" for="v-name">Full name <span class="v-required" aria-hidden="true">*</span></label>
    <input class="v-input" id="v-name" name="name" type="text" autocomplete="name" required>
    <p class="v-field-error" id="v-name-error">Enter your full name.</p>
  </div>
  <div class="v-field">
    <label class="v-label" for="v-email">Email <span class="v-required" aria-hidden="true">*</span></label>
    <input class="v-input" id="v-email" name="email" type="email" autocomplete="email" required>
    <p class="v-field-error" id="v-email-error">Enter an email address like name@example.com.</p>
  </div>
  <div class="v-field">
    <label class="v-choice"><input class="v-checkbox" id="v-terms" name="terms" type="checkbox" required><span>I agree to the terms</span></label>
    <p class="v-field-error" id="v-terms-error">Agree to the terms to create an account.</p>
  </div>
  <div class="v-cluster">
    <button class="v-btn v-btn-primary" type="submit">Create account</button>
  </div>
</form>
```

#### Field (field)

The wrapper that stacks a label, a control, a hint and an error message, plus fieldset and legend for groups. Native: <label>, <fieldset>, <legend>.

Base:
- .v-field: Stacks label, control, hint and error with an even gap.
- .v-fieldset: A boxed group of fields with a legend.
Modifiers:
- .v-fieldset-plain: A fieldset that only groups (checkboxes, radios) and draws no box.
Parts:
- .v-label: The field label. Use a real <label for> so clicking it focuses the control.
- .v-required: The red asterisk in a label. Decoration only, mark it aria-hidden and put required on the control.
- .v-optional: A quiet "Optional" note pushed to the end of the label row.
- .v-hint: Help text under the control, linked with aria-describedby.
- .v-field-error: The error message, hidden until the control is invalid. Always shows an icon, never colour alone.
- .v-legend: The title of a fieldset.

States:
- :user-invalid: After the person has interacted with an invalid control, its .v-field-error shows. Nothing shows on a fresh form.
- aria-invalid="true": Server-side error: the message is always visible. Link it with aria-describedby on the control.
- required: What assistive tech reads as required. The asterisk is only a visual cue.
- aria-describedby: Points the control at its hint (and at a server error), so they are read after the label.

Accessibility:
- Every control needs a visible <label for>, placeholder text is not a label.
- For client-side errors keep the message out of aria-describedby: the browser already announces the invalid state. For server errors, set aria-invalid="true" and link the message.
- Error messages carry an icon and the invalid control gets a doubled border, so state never depends on colour alone.
- Group checkboxes and radios in a <fieldset> with a <legend>, so the question is read with each option.

Example (Label, hint and error):

```html
<div class="v-field">
  <label class="v-label" for="f-name">Full name <span class="v-required" aria-hidden="true">*</span></label>
  <input class="v-input" id="f-name" name="name" type="text" autocomplete="name" required value="Aoife Kelly">
</div>
<div class="v-field">
  <label class="v-label" for="f-email">Email <span class="v-required" aria-hidden="true">*</span></label>
  <input class="v-input" id="f-email" name="email" type="email" autocomplete="email" required placeholder="you@example.com" aria-describedby="f-email-hint">
  <p class="v-hint" id="f-email-hint">We only use it for receipts.</p>
  <p class="v-field-error" id="f-email-error">Enter an email address like name@example.com.</p>
</div>
<div class="v-field">
  <label class="v-label" for="f-company">Company <span class="v-optional">Optional</span></label>
  <input class="v-input" id="f-company" name="company" type="text" autocomplete="organization" placeholder="Kelly Roofing Ltd">
</div>
```

#### File drop zone (dropzone)

A large target around a native file input that takes dropped files as well as picked ones. Native: <label>, <input type="file">.

Base:
- .v-dropzone: The dashed <label> that wraps the file input and its text.
Parts:
- .v-dropzone-icon: The round icon at the top.
- .v-dropzone-title: The main line; a <strong> inside is drawn in the accent, like a link.

States:
- data-v-dragover: Set by the JS while files hover over the zone: accent border and tint.
- accept, multiple: Honoured on drop: refused files are announced and left out.
- disabled: On the input: the zone is dimmed and drops are ignored.
- aria-invalid="true": On the input, or :user-invalid on a required one: danger border on the zone.

Hooks:
- data-v-dropzone (on .v-dropzone): Adds drag and drop to the zone and lists the chosen file names.
- data-v-dropzone-files (on an element inside the zone): Where the chosen file names are written. Added at the end of the zone when missing.

Events:
- v:change detail { files }: Fires after files are picked or dropped, with the input's FileList.

Keyboard:
- Tab: Focuses the file input; the ring is drawn round the whole zone.
- Enter / Space: Opens the file picker.

Accessibility:
- The native input keeps focus and keyboard behaviour, so the zone works without a mouse.
- Say which types and sizes are accepted in the visible text, not only in accept.
- Refused files (wrong type, more than one when multiple is off) are announced politely.
- The upload icon is aria-hidden; the title and the input name the control.

Example (Drop or browse):

```html
<label class="v-dropzone" data-v-dropzone>
  <span class="v-dropzone-icon"><svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#upload"/></svg></span>
  <span class="v-dropzone-title">Drop files or <strong>browse</strong></span>
  <span>PDF, PNG or JPG, up to 10 MB</span>
  <input type="file" name="files" accept=".pdf,.png,.jpg,.jpeg" multiple>
</label>
```

#### Form layouts (form-layouts)

Layouts for whole forms: two columns, sectioned settings, a single inline row and the submit row, plus a helper that warns before leaving with unsaved edits. Native: <form>, container queries.

Base:
- .v-form: Stacks fields with an even gap and is the size container for the layouts inside.
- .v-form-inline: Fields and buttons on one wrapping row, aligned on the control line.
Modifiers:
- .v-form-full: On a field in a .v-form-grid: spans both columns.
Parts:
- .v-form-grid: Two columns from 36rem of form width, one below.
- .v-form-section: A settings row: title and description beside the fields from 48rem, above them below.
- .v-form-section-header: Holds the section title and text.
- .v-form-section-title: The section heading.
- .v-form-section-text: A line describing the section.
- .v-form-section-body: The section's fields. Also a container, so a grid inside follows the column width.
- .v-form-actions: The submit row, buttons at the end.
- .v-form-actions-start: A note or secondary action pushed to the start of the actions row.

Hooks:
- data-v-unsaved (on <form>): Marks the form dirty on any edit, and the browser asks before the page is left. A submit that goes ahead, or a reset, marks it clean.

Events:
- v:dirty detail { dirty }: Fires when the form changes between clean and dirty, from data-v-unsaved.

Accessibility:
- Keep the visual order and the source order the same, so Tab moves through the fields as they appear.
- Section titles are real headings (h3 or h4), so screen reader users can jump between sections of a long settings page.
- An inline form still needs a visible label on every field.
- The leave-page warning is the browser's own dialog, so it is accessible and cannot be styled.

Example (Two columns):

```html
<form class="v-form v-card" action="#">
  <div class="v-form-grid">
    <div class="v-field">
      <label class="v-label" for="fl-first">First name</label>
      <input class="v-input" id="fl-first" type="text" autocomplete="given-name" value="Aoife">
    </div>
    <div class="v-field">
      <label class="v-label" for="fl-last">Last name</label>
      <input class="v-input" id="fl-last" type="text" autocomplete="family-name" value="Kelly">
    </div>
    <div class="v-field v-form-full">
      <label class="v-label" for="fl-email">Email</label>
      <input class="v-input" id="fl-email" type="email" autocomplete="email" value="aoife@example.ie">
    </div>
    <div class="v-field">
      <label class="v-label" for="fl-county">County</label>
      <select class="v-select" id="fl-county"><option>Galway</option><option>Mayo</option><option>Clare</option><option>Roscommon</option></select>
    </div>
    <div class="v-field">
      <label class="v-label" for="fl-eircode">Eircode</label>
      <input class="v-input" id="fl-eircode" type="text" autocomplete="postal-code" value="H54 R2X4">
    </div>
  </div>
  <div class="v-form-actions">
    <button class="v-btn v-btn-ghost" type="reset">Cancel</button>
    <button class="v-btn v-btn-primary" type="submit">Save</button>
  </div>
</form>
```

#### Input group (input-group)

An input joined with text addons, icons or buttons inside one box, such as a URL prefix, a currency or a search button.

Base:
- .v-input-group: The box around the parts. It takes the focus ring and the invalid border of the input inside.
Parts:
- .v-input-addon: Text or an icon at the start or end, such as https:// or €.

States:
- aria-invalid="true": On the inner input: the whole group gets the danger border.
- disabled: On the inner input: the whole group is dimmed.

Accessibility:
- The label points at the input (<label for>), not at the group.
- Addon text is not part of the label; if the unit matters (per site, per month), repeat it in the label or a hint.
- Icon addons are decoration: mark the svg aria-hidden="true".
- A button in the group needs its own visible text or an aria-label.

Example (Text addons):

```html
<div class="v-field">
  <label class="v-label" for="g-site">Website</label>
  <div class="v-input-group">
    <span class="v-input-addon">https://</span>
    <input class="v-input" id="g-site" type="text" inputmode="url" placeholder="yourbusiness.ie">
  </div>
</div>
<div class="v-field">
  <label class="v-label" for="g-price">Price</label>
  <div class="v-input-group">
    <span class="v-input-addon">€</span>
    <input class="v-input" id="g-price" type="number" value="799">
    <span class="v-input-addon">per site</span>
  </div>
</div>
```

#### Input, textarea and select (input)

Text inputs, textareas and native selects, in three sizes, with disabled, read-only and invalid states. Native: <input>, <textarea>, <select>.

Base:
- .v-input: A text input or textarea. Textareas grow with their content where the browser supports it.
- .v-select: A native select with a chevron drawn in the text colour. Also works with multiple and size.
Modifiers:
- .v-input-sm: Small, for dense tables and toolbars.
- .v-input-lg: Large, for short forms that want room.

States:
- disabled: Dimmed, not focusable and not sent with the form.
- readonly: A tinted fill: the value can be focused and copied but not edited.
- aria-invalid="true": Danger border, doubled in width so it reads without colour. :user-invalid does the same after the person has interacted.
- placeholder: Example text in a quieter colour. It is not a label and disappears on typing.

Keyboard:
- Tab: Moves focus to the control.
- ArrowUp / ArrowDown: Changes the option in a closed select, or the value of a number input.
- Alt+ArrowDown / Space: Opens a select's option list.

Accessibility:
- Pair every control with a visible <label for>; placeholder text is not announced reliably and vanishes on typing.
- Set type, inputmode and autocomplete (email, tel, postal-code) so phones show the right keyboard and browsers can fill the field.
- The input border holds 3:1 against what sits behind it, and the focus ring is drawn outside the box.
- Disabled controls are skipped by Tab and not submitted; use readonly when the value should still be reachable.

Example (Text inputs):

```html
<div class="v-field">
  <label class="v-label" for="f-email">Email</label>
  <input class="v-input" id="f-email" name="email" type="email" autocomplete="email" placeholder="you@example.com">
</div>
<div class="v-field">
  <label class="v-label" for="f-date">Start date</label>
  <input class="v-input" id="f-date" name="start" type="date" value="2026-11-02">
</div>
```

#### Number stepper (number-stepper)

A number input with minus and plus buttons either side, for small counts such as seats or quantities. Native: <input type="number">.

Base:
- .v-stepper: Goes on the .v-input-group. Centres the number and hides the native spin arrows once the buttons show.

States:
- min, max, step: The native limits and step; stepUp and stepDown do the maths.
- hidden: Put it on both buttons in the markup. The JS removes it when it takes over.
- disabled: Set by the JS on a button at its limit, or on both when the input is disabled.

Hooks:
- data-v-stepper (on .v-input-group.v-stepper): Wires the step buttons to the number input inside.
- data-v-step = up | down (on each button): Which way the button steps.

Keyboard:
- ArrowUp / ArrowDown: In the input: steps the value up or down (native).
- Tab: Moves between the minus button, the input and the plus button.
- Enter / Space: On a button: steps once.

Accessibility:
- Name each button for what it does to this field (aria-label="More seats") and point aria-controls at the input.
- When a button is disabled at a limit while focused, focus moves to the input rather than being lost.
- Each step fires input and change, so live totals and the unsaved-changes helper see it.

Example (Seats):

```html
<div class="v-field">
  <label class="v-label" for="f-qty">Seats</label>
  <div class="v-input-group v-stepper" data-v-stepper>
    <button class="v-btn v-btn-ghost v-btn-icon" type="button" data-v-step="down" aria-label="Fewer seats" aria-controls="f-qty" hidden><svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#minus"/></svg></button>
    <input class="v-input" id="f-qty" name="seats" type="number" min="1" max="50" value="3">
    <button class="v-btn v-btn-ghost v-btn-icon" type="button" data-v-step="up" aria-label="More seats" aria-controls="f-qty" hidden><svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#plus"/></svg></button>
  </div>
</div>
```

#### Password reveal (password-reveal)

A button inside a password field that shows and hides what was typed. Native: <input type="password">.

Parts:
- .v-password-toggle: The toggle button. With two icons inside, aria-pressed decides which one shows.

States:
- aria-pressed="true": Set by the JS while the password is visible; the second icon (eye-off) shows.
- type="text": The input type while revealed. The caret stays where the person left it.

Hooks:
- data-v-password (on .v-input-group): Wires the first button in the group to flip the first input between password and text.

Keyboard:
- Tab: Moves from the input to the toggle.
- Enter / Space: Shows or hides the password.

Accessibility:
- Give the button a fixed name (aria-label="Show password"). aria-pressed carries the state; a name that changes with it would be read as "Hide password, pressed".
- aria-controls on the button points at the input it reveals.
- Both icons are aria-hidden, the button name does the talking.

Example (Password with reveal):

```html
<div class="v-field">
  <label class="v-label" for="g-pw">Password</label>
  <div class="v-input-group" data-v-password>
    <input class="v-input" id="g-pw" type="password" autocomplete="new-password" value="correct-horse" aria-describedby="g-pw-hint">
    <button class="v-btn v-btn-ghost v-btn-icon v-password-toggle" type="button" aria-label="Show password" aria-pressed="false" aria-controls="g-pw"><svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#eye"/></svg><svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#eye-off"/></svg></button>
  </div>
  <p class="v-hint" id="g-pw-hint">At least 12 characters.</p>
</div>
```

#### Password strength meter (password-strength)

A meter under a new-password field that scores what is typed and gives plain-language advice. Native: <meter>.


States:
- value: Set by the JS from 0 (too short) to 4 (strong). Give the meter min="0" max="4" low="2" high="3" optimum="4" so the colours follow.
- aria-valuetext: Set by the JS to the level in words (Weak, Fair, Good, Strong), or Empty.

Hooks:
- data-v-strength = CSS selector of the meter, e.g. #pw-meter (on <input type="password">): Scores the password on each input and updates the meter and the hint after it.

Accessibility:
- The meter needs a name (aria-label="Password strength"); its level is read as words through aria-valuetext.
- The level is announced politely only when it changes, not on every key.
- Show the rules before typing starts, in the hint after the meter, so nothing is hidden until it fails.
- Link the hint to the input with aria-describedby so the advice is read with the field.

Example (New password):

```html
<div class="v-field">
  <label class="v-label" for="v-pw">Password</label>
  <input class="v-input" id="v-pw" name="password" type="password" autocomplete="new-password" required minlength="8" aria-describedby="v-pw-hint" data-v-strength="#v-pw-meter">
  <meter class="v-meter" id="v-pw-meter" min="0" max="4" low="2" high="3" optimum="4" value="0" aria-label="Password strength"></meter>
  <p class="v-hint" id="v-pw-hint">At least 8 characters, 12 or more is better. A few unrelated words work well.</p>
</div>
```

#### Range (range)

A native range slider with a drawn track and thumb, for picking a value where the exact number matters less than the position. Native: <input type="range">.

Base:
- .v-range: The slider. Firefox also fills the track before the thumb.
Parts:
- .v-range-label: A row above the slider: the label at the start, the current value (<output>) at the end.

States:
- disabled: Dimmed and cannot be moved.
- min, max, step: The native scale; the browser does the maths and the keyboard steps.

Keyboard:
- ArrowLeft / ArrowDown: Lowers the value by one step.
- ArrowRight / ArrowUp: Raises the value by one step.
- PageDown / PageUp: Moves by a larger step.
- Home / End: Jumps to the minimum or maximum.

Accessibility:
- Give the slider a <label for>; the <output for> shows the value but does not label it.
- When the raw number means little (a price, a level), set aria-valuetext so screen readers hear "€600" rather than "600".
- The track uses the control border colour so it holds 3:1 against the page, and the focus ring goes round the whole slider.

Example (With value and scale):

```html
<div class="v-field">
  <div class="v-range-label">
    <label class="v-label" for="r-budget">Monthly budget</label>
    <output for="r-budget" id="r-budget-out">€600</output>
  </div>
  <input class="v-range" id="r-budget" type="range" min="100" max="2000" step="100" value="600" aria-valuetext="€600">
  <div class="v-flex v-justify-between"><span class="v-hint">€100</span><span class="v-hint">€2,000</span></div>
</div>
```

```js
const range = document.getElementById('r-budget');
const out = document.getElementById('r-budget-out');
range.addEventListener('input', () => {
  out.textContent = range.ariaValueText = '€' + Number(range.value).toLocaleString('en-IE');
});
```

#### Search field (search-field)

A search input with a leading icon, an optional clear button and an optional keyboard shortcut hint. Native: <input type="search">.

Base:
- .v-search: Goes on the .v-input-group. Hides the browser's own clear button and quietens the icon.
Modifiers:
- .v-search-pill: A fully rounded field, common in headers.
Parts:
- .v-search-clear: The clear button at the end. Hidden while the input is empty.
- .v-search-hint: A shortcut hint holding a .v-kbd. Hidden while the field is focused or filled.

States:
- placeholder: Required: the clear button and hint use :placeholder-shown to know whether the field is empty.
- aria-keyshortcuts: Tells assistive tech which shortcut focuses the field, matching the visible hint.
- hidden: Set on the clear button by the JS while there is nothing to clear.

Hooks:
- data-v-clear (on .v-search): Its first button empties the input, returns focus to it and fires input so live filters update.
- data-v-shortcut = the key, default "/" (on the input): Pressing the key anywhere on the page focuses the field, unless focus is already in a text field. Pair it with aria-keyshortcuts and a visible .v-search-hint.

Keyboard:
- Tab: Moves to the input, then to the clear button when there is text.
- Enter / Space: On the clear button: empties the field and puts focus back in it.
- Escape: Clears a search input in most browsers (native behaviour).

Accessibility:
- Keep a visible label, or at least an aria-label on the input; the icon is decoration and is aria-hidden.
- The clear button needs a name (aria-label="Clear search").
- The shortcut hint is aria-hidden; put the same key in aria-keyshortcuts on the input, and bind it in your own script.
- Put the field in a role="search" landmark (or a <search> element) when it searches the whole site.

Example (With a clear button):

```html
<div class="v-field">
  <label class="v-label" for="s-clients">Clients</label>
  <div class="v-input-group v-search" data-v-clear>
    <span class="v-input-addon"><svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#search"/></svg></span>
    <input class="v-input" id="s-clients" type="search" placeholder="Name or email" value="Kelly">
    <button class="v-btn v-btn-ghost v-btn-icon v-search-clear" type="button" aria-label="Clear search"><svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#close"/></svg></button>
  </div>
</div>
```

### Overlays

#### Dialog (dialog)

A modal window on the native <dialog>, with a header, a scrolling body, a footer, three sizes and an alert dialog for confirms. Native: <dialog>, showModal(), <form method="dialog">.

Base:
- .v-dialog: The dialog panel, on a <dialog> element. Animates in and out where the browser supports it.
Modifiers:
- .v-dialog-sm: Narrow, 24rem.
- .v-dialog-lg: Wide, 48rem, for longer content.
- .v-dialog-full: As wide as lg, and the whole screen on phones. Suits longer forms.
- .v-dialog-danger: Danger tone for the icon, for destructive confirms.
Parts:
- .v-dialog-header: Top row with the title and the close button.
- .v-dialog-title: The heading. Point aria-labelledby at its id.
- .v-dialog-close: The corner close button, usually a ghost icon button inside <form method="dialog">.
- .v-dialog-body: The content. Only this part scrolls, so the title and actions stay in view.
- .v-dialog-footer: The actions, aligned to the end. On phones the buttons share the width.
- .v-dialog-icon: A round tone icon beside the title, for alert dialogs.

States:
- open: Set by showModal(), which data-v-dialog-open calls. The dialog is shown; without it the dialog is hidden.
- role="alertdialog": An alert or confirm dialog: narrower (26rem) and announced as urgent. Add aria-describedby on the message.
- autofocus: On a button inside, picks which control gets focus on open. Use it on the safe choice in a destructive confirm.

Hooks:
- data-v-dialog-open = The id of the dialog (on A button outside the dialog): Opens that dialog with showModal() and returns focus to the button when it closes.
- data-v-dialog-close = Optional return value (on A button inside the dialog): Closes the enclosing dialog and sets its returnValue. Not needed for buttons in <form method="dialog">.
- data-v-dismissable (on the <dialog>): Closes the dialog on a click on the backdrop. A drag that starts inside the dialog does not close it.

Events:
- v:open detail { opener }: Fires after a data-v-dialog-open button opens it.
- v:close detail { returnValue, opener }: Fires when a dialog opened that way closes, however it was closed.

Keyboard:
- Tab / Shift+Tab: Moves focus between the controls inside. Focus stays in the dialog while it is open.
- Escape: Closes the dialog and fires its cancel event.
- Enter / Space: Presses the focused button. A button in <form method="dialog"> closes the dialog and sets its returnValue.

Accessibility:
- Open it with data-v-dialog-open or showModal(), not the open attribute: only a modal dialog makes the page behind it inert and traps focus.
- Name it with aria-labelledby pointing at the .v-dialog-title, and give the icon-only close button an aria-label.
- When the dialog closes, focus returns to the button that opened it, also in Safari, which does not focus clicked buttons.
- In a destructive confirm, name the action on the button (Delete, not OK), put autofocus on the safe choice and leave out data-v-dismissable.

Example (Modal dialog):

```html
<button class="v-btn v-btn-primary" type="button" data-v-dialog-open="invite">Invite a teammate</button>
<dialog class="v-dialog" id="invite" data-v-dismissable aria-labelledby="invite-title">
  <header class="v-dialog-header">
    <h2 class="v-dialog-title" id="invite-title">Invite a teammate</h2>
    <form method="dialog"><button class="v-btn v-btn-ghost v-btn-icon v-dialog-close" aria-label="Close"><svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#close"/></svg></button></form>
  </header>
  <div class="v-dialog-body">
    <p>They get an email with a link to join this workspace. You can change their role later.</p>
  </div>
  <form class="v-dialog-footer" method="dialog">
    <button class="v-btn v-btn-secondary" value="cancel">Cancel</button>
    <button class="v-btn v-btn-primary" value="send">Send invite</button>
  </form>
</dialog>
```

#### Drawer (drawer)

A panel that slides in from an edge of the screen, on the native <dialog>, and becomes a bottom sheet on phones. Native: <dialog>, showModal(), <form method="dialog">.

Base:
- .v-drawer: The drawer, on a <dialog>. Slides in from the end edge; on phones it becomes a bottom sheet.
Modifiers:
- .v-drawer-start: Slides in from the start edge and stays a side drawer on phones, for navigation.
- .v-drawer-top: A full-width sheet from the top edge.
- .v-drawer-bottom: A full-width sheet from the bottom edge, at every width.
Parts:
- .v-drawer-header: Top row with the title and the close button.
- .v-drawer-title: The heading. Point aria-labelledby at its id.
- .v-drawer-close: The close button, usually a ghost icon button inside <form method="dialog">.
- .v-drawer-body: The content. Only this part scrolls.
- .v-drawer-footer: The actions, with a border above. On phones the buttons share the width.

States:
- open: Set by showModal(), which data-v-dialog-open calls. The drawer slides in; without it the drawer is hidden.

Hooks:
- data-v-dialog-open = The id of the drawer (on A button outside the drawer): Opens that drawer with showModal() and returns focus to the button when it closes.
- data-v-dialog-close = Optional return value (on A button inside the drawer): Closes the enclosing drawer and sets its returnValue. Not needed for buttons in <form method="dialog">.
- data-v-dismissable (on the <dialog class="v-drawer">): Closes the drawer on a click on the backdrop.

Events:
- v:open detail { opener }: Fires after a data-v-dialog-open button opens it.
- v:close detail { returnValue, opener }: Fires when a drawer opened that way closes.

Keyboard:
- Tab / Shift+Tab: Moves focus between the controls inside. Focus stays in the drawer while it is open.
- Escape: Closes the drawer.
- Enter / Space: Presses the focused button. A button in <form method="dialog"> closes the drawer.

Accessibility:
- data-v-dialog-open uses showModal(), so the page behind is inert and focus is trapped; focus returns to the trigger on close.
- Name it with aria-labelledby pointing at the .v-drawer-title, and give the icon-only close button an aria-label.
- Start and end follow the writing direction, so the drawer comes from the correct side in right-to-left pages.

Example (Filters drawer):

```html
<button class="v-btn v-btn-primary" type="button" data-v-dialog-open="filters">Filters</button>
<dialog class="v-drawer" id="filters" data-v-dismissable aria-labelledby="filters-title">
  <header class="v-drawer-header">
    <h2 class="v-drawer-title" id="filters-title">Filters</h2>
    <form method="dialog"><button class="v-btn v-btn-ghost v-btn-icon v-drawer-close" aria-label="Close"><svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#close"/></svg></button></form>
  </header>
  <div class="v-drawer-body"><p>Narrow the list by status, owner and date. Filters apply as you change them.</p></div>
  <form class="v-drawer-footer" method="dialog">
    <button class="v-btn v-btn-ghost">Reset</button>
    <button class="v-btn v-btn-primary">Show 12 results</button>
  </form>
</dialog>
```

#### Dropdown menu (dropdown-menu)

A list of actions in a popover with role="menu", with groups, icons, shortcuts, checkable items and a danger item. Native: popover, popovertarget, popovertargetaction="hide".

Base:
- .v-menu: The menu panel, on a popover element with role="menu". Opens below its trigger like .v-popover.
Modifiers:
- .v-menu-end: Aligns the menu to the end edge of its trigger, for buttons at the end of a toolbar.
- .v-menu-item-danger: A destructive item, in the danger colour.
Parts:
- .v-menu-item: One item: a button or link with role="menuitem", "menuitemcheckbox" or "menuitemradio". Icons and a <kbd> shortcut sit inside.
- .v-menu-label: A small uppercase group label, with role="presentation".
- .v-menu-sep: A separator, on an <hr>.

States:
- popover: On .v-menu: hidden until opened; Escape and a click outside close it.
- popovertarget: On the trigger: the id of the menu. Add aria-haspopup="menu".
- popovertargetaction="hide": On an item: closes the menu when the item is chosen, without JS.
- aria-checked: On menuitemcheckbox and menuitemradio items: "true" shows a tick or a dot. The JS toggles it on click, one radio per group.
- aria-disabled="true": Dimmed and not clickable, but still announced. Skipped by the arrow keys. disabled works too.

Hooks:
- data-v-menu (on the .v-menu popover (role="menu")): Moves focus into the menu on open, adds arrow keys, Home, End, typeahead and Tab to close, toggles checkable items and returns focus to the trigger.

Events:
- v:select detail { item }, cancelable: Fires when an enabled item is chosen. Call preventDefault() to keep the menu open after a menuitem.

Keyboard:
- Enter / Space: On the trigger, opens the menu with focus on the first item. On an item, chooses it: a menuitem closes the menu, checkbox and radio items stay open.
- ArrowDown / ArrowUp: On the trigger, opens the menu on the first or last item. In the menu, moves to the next or previous item and wraps.
- Home / End: Moves to the first or last item.
- A-Z: Typeahead: moves to the next item whose text starts with that letter.
- Tab / Shift+Tab: Closes the menu and moves on from the trigger.
- Escape: Closes the menu and returns focus to the trigger.

Accessibility:
- Items get tabindex="-1" and are reached with the arrow keys, so the open menu is one Tab stop.
- Wrap each labelled group in role="group" with aria-labelledby on its .v-menu-label, and give the menu an aria-label.
- Checked state is in aria-checked, not only in the drawn tick, so screen readers hear it.
- Shortcut hints in <kbd> are only hints: the page has to handle those keys itself.

Example (Actions menu):

```html
<button class="v-btn v-btn-secondary" type="button" popovertarget="menu-project" aria-haspopup="menu"><svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#more"/></svg>Actions</button>
<div class="v-menu" id="menu-project" popover role="menu" data-v-menu aria-label="Project actions">
  <div role="group" aria-labelledby="menu-g1">
    <div class="v-menu-label" id="menu-g1" role="presentation">Project</div>
    <button class="v-menu-item" type="button" role="menuitem" popovertarget="menu-project" popovertargetaction="hide"><svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#edit"/></svg>Rename<kbd>F2</kbd></button>
    <button class="v-menu-item" type="button" role="menuitem" popovertarget="menu-project" popovertargetaction="hide"><svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#copy"/></svg>Duplicate<kbd>Ctrl D</kbd></button>
    <button class="v-menu-item" type="button" role="menuitem" aria-disabled="true"><svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#share"/></svg>Share (no access)</button>
  </div>
  <hr class="v-menu-sep">
  <div role="group" aria-labelledby="menu-g2">
    <div class="v-menu-label" id="menu-g2" role="presentation">View</div>
    <button class="v-menu-item" type="button" role="menuitemcheckbox" aria-checked="true">Show archived</button>
    <button class="v-menu-item" type="button" role="menuitemradio" aria-checked="true">Sort by name</button>
    <button class="v-menu-item" type="button" role="menuitemradio" aria-checked="false">Sort by date</button>
  </div>
  <hr class="v-menu-sep">
  <button class="v-menu-item v-menu-item-danger" type="button" role="menuitem" popovertarget="menu-project" popovertargetaction="hide"><svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#trash"/></svg>Delete</button>
</div>
```

#### Popover (popover)

A small floating panel on the native popover attribute, opened by a button with popovertarget and placed next to it. Native: popover, popovertarget, CSS anchor positioning.

Base:
- .v-popover: The panel, on an element with the popover attribute. Opens below its trigger, aligned to the start edge.
Modifiers:
- .v-popover-top: Prefers the space above the trigger.
- .v-popover-start: Opens beside the trigger on the start side.
- .v-popover-end: Opens beside the trigger on the end side.
Parts:
- .v-popover-title: A short bold heading.
- .v-popover-text: Body text in the secondary colour.

States:
- popover: Makes the element a popover: hidden until opened, then shown in the top layer. The default (auto) closes on Escape and on a click outside.
- popovertarget: On the trigger button: the id of the popover it toggles. It also makes the trigger the anchor.
- :popover-open: The open state, used by the CSS for the fade and scale.

Keyboard:
- Enter / Space: On the trigger, opens or closes the popover.
- Tab: From the trigger, moves into the open popover, then on through the page.
- Escape: Closes the popover and returns focus to the trigger if focus was inside.

Accessibility:
- Use a real <button> with popovertarget as the trigger, so the browser exposes the expanded state and handles focus.
- The popover follows its trigger in the focus order, so keyboard users reach its content straight after the button.
- Keep it to short content. Anything people must complete belongs in a dialog.

Example (Below and above):

```html
<button class="v-btn v-btn-secondary" type="button" popovertarget="pop-storage">Storage details</button>
<button class="v-btn v-btn-secondary" type="button" popovertarget="pop-top">Opens above</button>
<div class="v-popover" id="pop-storage" popover>
  <p class="v-popover-title">Storage</p>
  <p class="v-popover-text">You have used 8.2 GB of 10 GB. Old exports are removed after 30 days.</p>
</div>
<div class="v-popover v-popover-top" id="pop-top" popover>
  <p class="v-popover-text">This one prefers the space above its trigger.</p>
</div>
```

#### Tooltip (tooltip)

A short, high-contrast label for a control, shown on hover and focus or opened as a hint popover. Native: popover="hint", :hover, :focus-within.

Base:
- .v-tooltip: The label, with role="tooltip". Above its trigger by default.
Modifiers:
- .v-tooltip-bottom: Popover form: places it below the trigger.
Helpers:
- .v-tooltip-wrap: No-popover form: wraps the trigger and the tooltip, which shows on hover and keyboard focus.

States:
- popover="hint": Popover form: shown in the top layer without closing other popovers. Browsers without hint treat it as a manual popover.
- aria-describedby: On the trigger: the tooltip id, so the text is read as the control's description.

Hooks:
- data-v-tooltip (on the trigger, which names the tooltip in aria-describedby): Popover form: shows the tooltip after a short hover or at once on focus, keeps it while the pointer is over it and hides it on leave or blur. Both forms: Escape hides it without moving focus.

Keyboard:
- Tab: Focusing the trigger shows the tooltip; moving focus away hides it.
- Escape: Hides the tooltip and leaves focus on the trigger (with data-v-tooltip).

Accessibility:
- Point the trigger's aria-describedby at the tooltip; for an icon-only button the name still goes in aria-label.
- With data-v-tooltip, Escape dismisses the tooltip without moving focus, and the pointer can move onto it without it closing (WCAG 1.4.13).
- The text uses the page text colour on the page background, reversed, so it keeps strong contrast in both themes.

Example (On hover and focus):

```html
<span class="v-tooltip-wrap">
  <button class="v-btn v-btn-secondary" type="button" aria-describedby="tip-help" data-v-tooltip><svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#info"/></svg>Help</button>
  <span class="v-tooltip" role="tooltip" id="tip-help">No popover needed</span>
</span>
```

### Navigation

#### Bottom tab bar (bottom-bar)

Up to five icon and label links fixed to the bottom of the screen, for the main sections of a phone app. Native: <nav>, aria-current, env(safe-area-inset-*).

Base:
- .v-bottombar: The bar, on a <nav> of links. Fixed to the bottom edge, one equal column per link.

States:
- aria-current="page": On the current section: accent text and a tinted pill behind the icon.

Keyboard:
- Tab / Shift+Tab: Moves between the links.
- Enter: Follows the focused link.

Accessibility:
- Give the <nav> an aria-label such as App sections.
- Keep a visible text label under every icon; icons alone are hard to tell apart.
- A badge is read as part of the link name, so add .v-sr-only context where a bare number is unclear.
- Each link is at least 3.25rem tall, a comfortable touch target.

Example (Bottom tab bar):

```html
<nav class="v-bottombar" aria-label="App sections">
  <a href="#" aria-current="page"><svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#home"/></svg><span>Home</span></a>
  <a href="#"><svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#search"/></svg><span>Search</span></a>
  <a href="#"><svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#inbox"/></svg><span>Inbox</span><span class="v-badge v-badge-solid">3</span></a>
  <a href="#"><svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#user"/></svg><span>Profile</span></a>
</nav>
```

#### Breadcrumb (breadcrumb)

The path from the home page to the current page, as a row of links with drawn separators. Native: <nav>, <ol>, aria-current.

Base:
- .v-breadcrumb: On the <nav> around an <ol>. Draws chevron separators that point the other way in right-to-left text.

States:
- aria-current="page": On the last item, a <span>: bold, not a link, cut with an ellipsis if it is too long.

Accessibility:
- Wrap it in <nav aria-label="Breadcrumb"> so it is listed as its own landmark.
- Use an ordered list, so screen readers announce how many levels there are.
- The separators are drawn in CSS, so they are not read out.

Example (Breadcrumb):

```html
<nav class="v-breadcrumb" aria-label="Breadcrumb">
  <ol>
    <li><a href="#">Home</a></li>
    <li><a href="#">Projects</a></li>
    <li><a href="#">Website redesign</a></li>
    <li><span aria-current="page">Homepage copy</span></li>
  </ol>
</nav>
```

#### Navbar (navbar)

The top bar with a brand, page links and actions, which folds its links into a native popover menu in narrow slots. Native: <nav>, popover, popovertarget, container queries.

Base:
- .v-navbar: The bar. It is a size container, so it adapts to its slot.
Parts:
- .v-navbar-brand: The logo and name link.
- .v-navbar-toggle: The menu button that opens the links in narrow slots. Hidden when wide.
- .v-navbar-menu: The <nav popover> that holds the links and actions: inline when wide, a sheet from the end edge when narrow.
- .v-navbar-close: The close button inside the narrow sheet. Hidden when wide.
- .v-navbar-links: The list of page links.
- .v-navbar-actions: Buttons such as Sign in and Get started, pushed to the end when wide.

States:
- aria-current="page": On the link to the current page: underlined when wide, tinted in the sheet.
- popover: On .v-navbar-menu: lets the toggle open it as a sheet; Escape and a click outside close it.
- popovertarget: On the toggle and close buttons: the id of the menu. The close button adds popovertargetaction="hide".
- aria-expanded: On the toggle: set by the JS to match the sheet, open or closed.

Hooks:
- data-v-nav (on .v-navbar): Closes the sheet when a link inside is followed or when the bar becomes wide enough to show the links inline, and keeps aria-expanded on the toggle in step.

Keyboard:
- Tab / Shift+Tab: Moves through the brand, links and actions, or the menu button when narrow.
- Enter / Space: On the menu button, opens the sheet. On a link, follows it.
- Escape: Closes the open sheet and returns focus to the menu button.

Accessibility:
- The links sit in a <nav> with an aria-label, so it is listed as a landmark. Use a different label for each nav on one page.
- The menu and close buttons are icon-only, so each needs an aria-label.
- With data-v-nav, following a link in the sheet closes it and focus goes back to the menu button, unless the link moves focus to a target on the same page.
- Mark the current page with aria-current="page", not only with a colour.

Example (Navbar):

```html
<header class="v-navbar" data-v-nav>
  <a class="v-navbar-brand" href="#"><svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#layers"/></svg>Northwind</a>
  <button class="v-btn v-btn-ghost v-btn-icon v-navbar-toggle" type="button" popovertarget="nav-main" aria-label="Open menu"><svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#menu"/></svg></button>
  <nav class="v-navbar-menu" id="nav-main" popover aria-label="Main">
    <button class="v-btn v-btn-ghost v-btn-icon v-navbar-close" type="button" popovertarget="nav-main" popovertargetaction="hide" aria-label="Close menu"><svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#close"/></svg></button>
    <ul class="v-navbar-links">
      <li><a href="#" aria-current="page">Overview</a></li>
      <li><a href="#">Projects</a></li>
      <li><a href="#">Team</a></li>
      <li><a href="#">Pricing</a></li>
    </ul>
    <div class="v-navbar-actions">
      <a class="v-btn v-btn-ghost" href="#">Sign in</a>
      <a class="v-btn v-btn-primary" href="#">Get started</a>
    </div>
  </nav>
</header>
```

#### Pagination (pagination)

Links to move through pages of results: numbered with gaps, previous and next only, or a load more row. Native: <nav>, aria-current, rel="prev" and rel="next".

Base:
- .v-pagination: The list of pages, on a <ul> inside <nav>. A size container, so it adapts to its slot.
- .v-load-more: A centred row with a count and a Load more button.
Modifiers:
- .v-page-prev: Previous page, with a drawn arrow that flips in right-to-left text.
- .v-page-next: Next page, with a drawn arrow that flips in right-to-left text.
- .v-pagination-simple: Previous and next at the ends with a page count between.
Parts:
- .v-page: One page link, or a <span> for an end that is not available.
- .v-page-label: The Previous or Next text. Visually hidden in narrow slots, still read by screen readers.
- .v-page-gap: The ellipsis between page ranges. Mark it aria-hidden.
- .v-pagination-info: The page count text, such as Page 2 of 9.

States:
- aria-current="page": On the current page: accent border and tint.
- aria-disabled="true": On a <span class="v-page"> for an end that is not available, such as Previous on page 1: dimmed.

Keyboard:
- Tab / Shift+Tab: Moves between the page links.
- Enter: Follows the focused link.

Accessibility:
- Wrap the list in a <nav> with an aria-label, such as Results pages.
- Give number links an aria-label like Page 4, and mark the current one with aria-current="page".
- An unavailable Previous or Next is a <span>, not a link, so it is not in the focus order.
- After Load more, move focus to the first new item or announce how many were added.

Example (Numbered):

```html
<nav aria-label="Results pages">
  <ul class="v-pagination">
    <li><a class="v-page v-page-prev" href="#" rel="prev"><span class="v-page-label">Previous</span></a></li>
    <li><a class="v-page" href="#" aria-label="Page 1">1</a></li>
    <li><span class="v-page-gap" aria-hidden="true">…</span></li>
    <li><a class="v-page" href="#" aria-label="Page 4">4</a></li>
    <li><a class="v-page" href="#" aria-label="Page 5" aria-current="page">5</a></li>
    <li><a class="v-page" href="#" aria-label="Page 6">6</a></li>
    <li><span class="v-page-gap" aria-hidden="true">…</span></li>
    <li><a class="v-page" href="#" aria-label="Page 20">20</a></li>
    <li><a class="v-page v-page-next" href="#" rel="next"><span class="v-page-label">Next</span></a></li>
  </ul>
</nav>
```

#### Sidebar nav (sidenav)

Vertical navigation with group headings, icon and label items, badges, collapsible groups and an icon rail. Native: <nav>, <details>, <summary>.

Base:
- .v-sidenav: The navigation, on a <nav>. Styles its lists, links and summaries.
Modifiers:
- .v-sidenav-rail: Icons only. Labels and headings stay for screen readers; badges become a small count on the icon.
Parts:
- .v-sidenav-heading: A small uppercase group heading.
- .v-sidenav-label: The item text. Takes the free space so a badge sits at the end.

States:
- aria-current="page": On the link to the current page: tinted with the accent.
- open: On a <details> group: shows its links and turns the chevron up.

Keyboard:
- Tab / Shift+Tab: Moves through the links and group headers.
- Enter: Follows a link.
- Enter / Space: On a group header, opens or closes the group.

Accessibility:
- Give the <nav> an aria-label, and a different one if the page has more than one navigation.
- Mark the current page with aria-current="page".
- In the rail, every link keeps its .v-sidenav-label text, so it still has a name. Add a tooltip for sighted users if the icons are not obvious.
- A badge is read as part of the link text, so make it meaningful (12 unread, not only 12) with .v-sr-only text where needed.

Example (Groups and collapsible sections):

```html
<nav class="v-sidenav" aria-label="Workspace">
  <p class="v-sidenav-heading">Workspace</p>
  <ul>
    <li><a href="#" aria-current="page"><svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#home"/></svg><span class="v-sidenav-label">Dashboard</span></a></li>
    <li><a href="#"><svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#inbox"/></svg><span class="v-sidenav-label">Inbox</span><span class="v-badge v-badge-accent">12</span></a></li>
    <li>
      <details open>
        <summary><svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#folder"/></svg><span class="v-sidenav-label">Projects</span></summary>
        <ul>
          <li><a href="#"><span class="v-sidenav-label">Website redesign</span></a></li>
          <li><a href="#"><span class="v-sidenav-label">Mobile app</span><span class="v-badge">3</span></a></li>
        </ul>
      </details>
    </li>
    <li><a href="#"><svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#chart-bar"/></svg><span class="v-sidenav-label">Reports</span></a></li>
  </ul>
  <p class="v-sidenav-heading">Account</p>
  <ul>
    <li>
      <details>
        <summary><svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#users"/></svg><span class="v-sidenav-label">Team</span></summary>
        <ul>
          <li><a href="#"><span class="v-sidenav-label">Members</span></a></li>
          <li><a href="#"><span class="v-sidenav-label">Roles</span></a></li>
        </ul>
      </details>
    </li>
    <li><a href="#"><svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#settings"/></svg><span class="v-sidenav-label">Settings</span></a></li>
  </ul>
</nav>
```

#### Skip link (skip-link)

A link to the main content, hidden off-screen until it gets keyboard focus. Native: <a href="#main">, tabindex="-1".

Base:
- .v-skip-link: The link. Fixed at the top start corner, off-screen until focused.
Helpers:
- .v-skip-target: On the main content: removes the focus ring around the whole region when the skip link moves focus there.

States:
- :focus: The link slides into view.
- tabindex="-1": On the target, so focus really moves there and the next Tab continues from the content.

Keyboard:
- Tab: The first Tab on the page focuses the skip link and shows it.
- Enter: Moves focus to the main content.

Accessibility:
- Make it the first focusable element in the page.
- Point it at the <main> element and give that element tabindex="-1", or focus may stay at the top in some browsers.
- It uses the primary button colours, so it has full contrast when shown.

Example (Skip to content):

```html
<a class="v-skip-link" href="#content">Skip to content</a>
<div id="content" class="v-skip-target" tabindex="-1">
  <p>The main content. The skip link moves focus here.</p>
</div>
```

#### Steps (steps)

Shows progress through a flow of steps, horizontal or vertical, with complete, current and upcoming states. Native: <ol>, aria-current="step".

Base:
- .v-steps: The list, on an <ol>. Markers number themselves.
Modifiers:
- .v-steps-vertical: Markers in a column with the connector running down, room for a description.
- .v-step-complete: A finished step: filled marker with a drawn check, accent connector.
Parts:
- .v-step: One step, on an <li>. Upcoming unless marked otherwise.
- .v-step-label: The step name.
- .v-step-desc: A quieter line under the label, such as a date.

States:
- aria-current="step": On the current step: accent ring and bold label.

Accessibility:
- Give the <ol> an aria-label such as Sign-up progress.
- The check mark is drawn in CSS, so add a .v-sr-only "Completed: " to each finished label.
- aria-current="step" tells screen readers which step is current.

Example (Horizontal):

```html
<ol class="v-steps" aria-label="Sign-up progress">
  <li class="v-step v-step-complete"><span class="v-step-label"><span class="v-sr-only">Completed: </span>Account</span></li>
  <li class="v-step v-step-complete"><span class="v-step-label"><span class="v-sr-only">Completed: </span>Workspace</span></li>
  <li class="v-step" aria-current="step"><span class="v-step-label">Billing</span></li>
  <li class="v-step"><span class="v-step-label">Launch</span></li>
</ol>
```

#### Tabs (tabs)

Switch between panels of related content in one place, as line, pill or vertical tabs. Native: role="tablist", role="tab", role="tabpanel", hidden.

Base:
- .v-tabs: The wrapper around the tab list and its panels.
Modifiers:
- .v-tabs-pill: Tabs in a soft track with the selected one raised, like the segmented control.
- .v-tabs-vertical: Tabs beside the panel when the slot is at least 36rem wide, a row below that.
Parts:
- .v-tablist: The row of tabs, with role="tablist". Scrolls sideways when the tabs do not fit.
- .v-tab: One tab, a <button role="tab">. The selected one gets an accent underline.
- .v-tabpanel: A panel, with role="tabpanel". Hidden panels carry the hidden attribute.

States:
- aria-selected="true": On the current tab: underlined, raised in the pill form.
- tabindex="-1": On the other tabs, so Tab goes from the selected tab straight to its panel. The JS moves it as focus moves.
- hidden: On every panel except the current one. The JS sets it when a tab is selected.
- disabled: On a tab that cannot be chosen: dimmed.
- aria-orientation="vertical": On the tablist of vertical tabs, so the arrow keys move up and down.

Hooks:
- data-v-tabs = empty, or "manual" (on the role="tablist" element): Adds roving focus, arrow keys, Home and End, and shows the panel of the selected tab. Selection follows focus; with "manual" the arrows only move focus and Enter or Space selects.

Events:
- v:change detail { tab, panel }: Fires when another tab is selected, by click or keyboard.

Keyboard:
- Tab: Moves focus to the selected tab, then to its panel.
- ArrowRight / ArrowLeft: Moves to the next or previous tab and wraps at the ends. Swapped in right-to-left pages. Selects it unless the tabs are manual.
- ArrowDown / ArrowUp: The same for vertical tabs (aria-orientation="vertical").
- Home / End: Moves to the first or last tab.
- Enter / Space: Selects the focused tab. Needed with data-v-tabs="manual".

Accessibility:
- Disabled tabs are skipped by the arrow keys.
- Give the tablist an aria-label, link each tab to its panel with aria-controls, and each panel back with aria-labelledby.
- Panels have tabindex="0" so keyboard users can reach a panel that has no focusable content.
- Use data-v-tabs="manual" when showing a panel is slow (a fetch), so arrowing past a tab does not load it.

Example (Line tabs):

```html
<div class="v-tabs">
  <div class="v-tablist" role="tablist" aria-label="Project" data-v-tabs>
    <button class="v-tab" id="tab-a1" role="tab" type="button" aria-selected="true" aria-controls="panel-a1">Overview</button>
    <button class="v-tab" id="tab-a2" role="tab" type="button" aria-selected="false" aria-controls="panel-a2" tabindex="-1">Activity</button>
    <button class="v-tab" id="tab-a3" role="tab" type="button" aria-selected="false" aria-controls="panel-a3" tabindex="-1">Settings</button>
    <button class="v-tab" id="tab-a4" role="tab" type="button" aria-selected="false" aria-controls="panel-a4" tabindex="-1" disabled>Billing</button>
  </div>
  <div class="v-tabpanel" id="panel-a1" role="tabpanel" aria-labelledby="tab-a1" tabindex="0"><p>Line tabs: the selected tab gets an accent underline.</p></div>
  <div class="v-tabpanel" id="panel-a2" role="tabpanel" aria-labelledby="tab-a2" tabindex="0" hidden><p>Recent activity.</p></div>
  <div class="v-tabpanel" id="panel-a3" role="tabpanel" aria-labelledby="tab-a3" tabindex="0" hidden><p>Project settings.</p></div>
  <div class="v-tabpanel" id="panel-a4" role="tabpanel" aria-labelledby="tab-a4" tabindex="0" hidden><p>Billing.</p></div>
</div>
```

### Disclosure

#### Accordion (accordion)

A stack of questions or sections that open one at a time, built on native details elements. Native: <details name>.

Base:
- .v-accordion: The group. Put <details> items with a <summary> inside; it draws the dividers and the chevron.

States:
- open: On a <details>: the item is open and its chevron points up in the accent colour.
- name: The same name on every <details> makes the group exclusive: opening one closes the others. Browsers without support let items open independently.

Keyboard:
- Tab / Shift+Tab: Moves focus between the item headers.
- Enter / Space: Opens or closes the focused item.

Accessibility:
- The <summary> is the button: browsers expose it with its expanded state, so no ARIA is needed.
- Keep the summary text short and specific, it is all a screen reader hears before opening.
- The height animation runs only where ::details-content is supported and is off with reduced motion.
- Content inside a closed item is still found by the browser find-in-page, which opens the item.

Example (Exclusive FAQ):

```html
<div class="v-accordion">
  <details name="faq" open>
    <summary>Do I need JavaScript for this?</summary>
    <p>No. The accordion is native details elements sharing one name, so opening one closes the others.</p>
  </details>
  <details name="faq">
    <summary>Can several items be open at once?</summary>
    <p>Leave out the name attribute and every item opens on its own.</p>
  </details>
  <details name="faq">
    <summary>Does it animate?</summary>
    <p>Where the browser supports it, the height eases open. With reduced motion it opens at once.</p>
  </details>
</div>
```

#### Collapsible (collapsible)

A single show-and-hide section with a chevron before its label, built on a native details element. Native: <details>.

Base:
- .v-collapsible: On the <details> itself. The chevron points at the inline end and turns down when open.

States:
- open: The section is open and the chevron points down.

Keyboard:
- Tab: Moves focus to the summary.
- Enter / Space: Opens or closes the section.

Accessibility:
- The <summary> is announced as a button with its expanded state, with no ARIA added.
- The chevron flips in right-to-left text so it still points the way the text reads.
- Write the summary as what opens ("Show advanced options"), not a bare "More".

Example (Closed and open):

```html
<details class="v-collapsible">
  <summary>Show advanced options</summary>
  <p>Retry failed webhooks, custom headers and the request log.</p>
</details>
<details class="v-collapsible" open>
  <summary>Why we ask for your phone number</summary>
  <p>Only to send a code when you sign in from a new device. We never call or share it.</p>
</details>
```

### Data

#### Table (table)

Native table markup with zebra, hover, dense, bordered and sticky-header variants, selectable rows and a scrolling wrapper. Native: <table>.

Base:
- .v-table: The table: spacing, rules, header fill and caption.
Modifiers:
- .v-table-zebra: Tints every other body row.
- .v-table-hover: Tints the row under the pointer, on devices that hover.
- .v-table-dense: Tighter padding and smaller text.
- .v-table-bordered: Adds rules between columns.
- .v-table-sticky: Header cells stick to the top while the wrapper scrolls. Set --v-table-max on the wrapper.
Parts:
- .v-table-wrap: Scrolling container and card surface. Give it role="region", a label and tabindex="0".
- .v-table-num: Numeric cell: tabular figures, aligned to the end.
- .v-table-check: Narrow cell for a row checkbox. A checked box selects the row.
- .v-table-actions: Narrow end cell for row action buttons.
- .v-table-empty: A full-width cell (with colspan) for the message when there are no rows.

States:
- aria-selected="true": On a <tr>: tinted with an accent bar on the leading edge.
- checked: A checked checkbox in the row's .v-table-check cell selects the row the same way.
- role="region" tabindex="0": On .v-table-wrap: makes the scrolling box reachable and named for keyboard and screen reader users.

Keyboard:
- Tab: Moves focus to the scroll region, then through any checkboxes and buttons in the rows.
- ArrowLeft / ArrowRight / ArrowUp / ArrowDown: Scrolls the focused wrapper.
- Space: Toggles the focused row checkbox.

Accessibility:
- Use <th scope="col"> for column headers and <th scope="row"> for the cell that names each row.
- Give the table a <caption>, visible or with .v-sr-only, and point the wrapper's aria-labelledby at it.
- Each row checkbox and icon button needs its own label, such as "Select invoice INV-1041".
- Selected rows are marked by the bar as well as the tint, so the state does not rely on colour alone.

Example (Selectable rows with actions):

```html
<div class="v-table-wrap" role="region" aria-labelledby="invoices-caption" tabindex="0" style="--v-table-min: 46rem">
  <table class="v-table v-table-zebra v-table-hover">
    <caption id="invoices-caption">Invoices, October 2026</caption>
    <thead>
      <tr>
        <th class="v-table-check" scope="col"><input type="checkbox" aria-label="Select all invoices"></th>
        <th scope="col">Invoice</th>
        <th scope="col">Client</th>
        <th scope="col">Status</th>
        <th scope="col">Due</th>
        <th class="v-table-num" scope="col">Amount</th>
        <th class="v-table-actions" scope="col"><span class="v-sr-only">Actions</span></th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="v-table-check"><input type="checkbox" aria-label="Select invoice INV-1041"></td>
        <th class="v-nowrap" scope="row">INV-1041</th>
        <td>Harbour Roofing Ltd</td>
        <td><span class="v-badge v-badge-success v-badge-dot">Paid</span></td>
        <td>3 Oct</td>
        <td class="v-table-num">€1,499.00</td>
        <td class="v-table-actions"><button class="v-btn v-btn-ghost v-btn-sm v-btn-icon" type="button" aria-label="Edit INV-1041"><svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#edit"/></svg></button><button class="v-btn v-btn-ghost v-btn-sm v-btn-icon" type="button" aria-label="More for INV-1041"><svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#more"/></svg></button></td>
      </tr>
      <tr>
        <td class="v-table-check"><input type="checkbox" aria-label="Select invoice INV-1042" checked></td>
        <th class="v-nowrap" scope="row">INV-1042</th>
        <td>Moss &amp; Fern Gardens</td>
        <td><span class="v-badge v-badge-warning v-badge-dot">Pending</span></td>
        <td>14 Oct</td>
        <td class="v-table-num">€799.00</td>
        <td class="v-table-actions"><button class="v-btn v-btn-ghost v-btn-sm v-btn-icon" type="button" aria-label="Edit INV-1042"><svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#edit"/></svg></button><button class="v-btn v-btn-ghost v-btn-sm v-btn-icon" type="button" aria-label="More for INV-1042"><svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#more"/></svg></button></td>
      </tr>
      <tr>
        <td class="v-table-check"><input type="checkbox" aria-label="Select invoice INV-1043"></td>
        <th class="v-nowrap" scope="row">INV-1043</th>
        <td>The Quay Bar</td>
        <td><span class="v-badge v-badge-danger v-badge-dot">Overdue</span></td>
        <td>20 Oct</td>
        <td class="v-table-num">€50.00</td>
        <td class="v-table-actions"><button class="v-btn v-btn-ghost v-btn-sm v-btn-icon" type="button" aria-label="Edit INV-1043"><svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#edit"/></svg></button><button class="v-btn v-btn-ghost v-btn-sm v-btn-icon" type="button" aria-label="More for INV-1043"><svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#more"/></svg></button></td>
      </tr>
      <tr>
        <td class="v-table-check"><input type="checkbox" aria-label="Select invoice INV-1044"></td>
        <th class="v-nowrap" scope="row">INV-1044</th>
        <td>Westshore Cleaning</td>
        <td><span class="v-badge v-badge-info">Draft</span></td>
        <td>31 Oct</td>
        <td class="v-table-num">€2,350.00</td>
        <td class="v-table-actions"><button class="v-btn v-btn-ghost v-btn-sm v-btn-icon" type="button" aria-label="Edit INV-1044"><svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#edit"/></svg></button><button class="v-btn v-btn-ghost v-btn-sm v-btn-icon" type="button" aria-label="More for INV-1044"><svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#more"/></svg></button></td>
      </tr>
    </tbody>
    <tfoot>
      <tr>
        <td></td>
        <th scope="row" colspan="4">Total, 4 invoices</th>
        <td class="v-table-num">€4,698.00</td>
        <td></td>
      </tr>
    </tfoot>
  </table>
</div>
```

#### Timeline (timeline)

An ordered list of events joined by a line, with a dot, an icon or an avatar as each marker. Native: <ol>.

Base:
- .v-timeline: The list, usually an <ol>.
Modifiers:
- .v-timeline-compact: Smaller markers, tighter spacing and smaller text.
Parts:
- .v-timeline-item: One event. Draws the joining line to the next item.
- .v-timeline-marker: The marker. Leave it empty for a dot, or put an icon or a .v-avatar inside.
- .v-timeline-content: Wraps the header and body.
- .v-timeline-header: Title and time on one line, wrapping when narrow.
- .v-timeline-title: What happened.
- .v-timeline-time: When, on a <time datetime>. Tabular figures.
- .v-timeline-body: Optional detail under the title.

Accessibility:
- Use an <ol> so the order is announced and the number of events is known.
- Mark the marker aria-hidden="true": the title says what happened, the icon only decorates it.
- Put a machine-readable datetime on each <time>, so "Yesterday" still has an exact date.
- The line stops short of each marker, so no marker needs an opaque background and Glass stays see-through.

Example (Activity feed):

```html
<div class="v-card">
  <h3 class="v-card-title">Project activity</h3>
  <ol class="v-timeline">
    <li class="v-timeline-item">
      <span class="v-timeline-marker" aria-hidden="true"><svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#upload"/></svg></span>
      <div class="v-timeline-content">
        <div class="v-timeline-header"><p class="v-timeline-title">Site deployed to production</p><time class="v-timeline-time" datetime="2026-10-31T09:12">09:12</time></div>
        <p class="v-timeline-body">Build 214 is live. Page weight dropped by 18 KB after the image pass.</p>
      </div>
    </li>
    <li class="v-timeline-item">
      <span class="v-timeline-marker" aria-hidden="true"><span class="v-avatar">AK</span></span>
      <div class="v-timeline-content">
        <div class="v-timeline-header"><p class="v-timeline-title">Aoife left a comment</p><time class="v-timeline-time" datetime="2026-10-30T16:40">Yesterday</time></div>
        <p class="v-timeline-body">"Can we move the quote form above the gallery on mobile?"</p>
      </div>
    </li>
    <li class="v-timeline-item">
      <span class="v-timeline-marker" aria-hidden="true"><svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#credit-card"/></svg></span>
      <div class="v-timeline-content">
        <div class="v-timeline-header"><p class="v-timeline-title">Invoice INV-1041 paid</p><time class="v-timeline-time" datetime="2026-10-28">28 Oct</time></div>
        <p class="v-timeline-body">€1,499.00 received by card.</p>
      </div>
    </li>
    <li class="v-timeline-item">
      <span class="v-timeline-marker" aria-hidden="true"><svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#message"/></svg></span>
      <div class="v-timeline-content">
        <div class="v-timeline-header"><p class="v-timeline-title">Kick-off call</p><time class="v-timeline-time" datetime="2026-10-20">20 Oct</time></div>
      </div>
    </li>
  </ol>
</div>
```

### Content

#### Code block (code-block)

A framed code sample with a language or file name, a copy button and a scrolling body. Native: <pre><code>.

Base:
- .v-code: The frame: card surface, border and radius.
Modifiers:
- .v-code-wrap: Long lines wrap instead of scrolling sideways.
- .v-code-numbered: Shows line numbers. Wrap each line in .v-code-line.
Parts:
- .v-code-header: The top bar holding the label and the copy button.
- .v-code-lang: Language label, small uppercase mono.
- .v-code-title: A file name instead of a language, cut with an ellipsis when long.
- .v-code-copy: Pushes the copy button to the inline end of the header.
- .v-code-body: The <pre>. Scrolls both ways; cap its height with --v-code-max.
- .v-code-line: One line of code, counted when .v-code-numbered is set.
Helpers:
- .v-tok-comment: Comments, muted and italic.
- .v-tok-keyword: Keywords, in the accent text colour.
- .v-tok-tag: Tags and selectors, in the accent text colour.
- .v-tok-string: Strings, in the success colour.
- .v-tok-number: Numbers and literals, in the warning colour.
- .v-tok-function: Function names, in the info colour.
- .v-tok-property: CSS properties, in the danger colour.
- .v-tok-attr: HTML attributes, in the danger colour.
- .v-tok-punct: Punctuation, in secondary text.

States:
- tabindex="0": On the .v-code-body <pre>: lets keyboard users focus and scroll code that overflows.

Hooks:
- data-v-copy = Text to copy, or empty with data-v-copy-target (on the copy <button>): Turns the button into a copy button. The label reads "Copied" for 2 seconds.
- data-v-copy-target = A CSS selector, e.g. #code-css (on the copy <button>): Copies the text content of that element, so the token markup is left out.

Keyboard:
- Tab: Moves focus to the copy button, then to the code body.
- Enter / Space: Copies the code (with the JS module).
- ArrowLeft / ArrowRight / ArrowUp / ArrowDown: Scrolls the focused code body.

Accessibility:
- The copy result is announced in a live region ("Copied to clipboard"), not only shown in the label.
- If the clipboard is blocked, the code is selected instead and the announcement says to press Ctrl+C.
- Every token colour is a text-safe token, so highlighted code keeps 4.5:1 contrast.
- Line numbers are generated content with user-select: none, so they are not copied.

Example (Numbered CSS):

```html
<div class="v-code v-code-numbered">
  <div class="v-code-header">
    <span class="v-code-lang">CSS</span>
    <button class="v-btn v-btn-ghost v-btn-sm v-code-copy" type="button" data-v-copy data-v-copy-target="#code-css"><svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#copy"/></svg>Copy</button>
  </div>
  <pre class="v-code-body" id="code-css" tabindex="0"><code><span class="v-code-line"><span class="v-tok-comment">/* Theme one card without touching the rest */</span></span>
<span class="v-code-line"><span class="v-tok-tag">.pricing</span> <span class="v-tok-punct">{</span></span>
<span class="v-code-line">  <span class="v-tok-property">--v-card-bg</span><span class="v-tok-punct">:</span> <span class="v-tok-function">var</span><span class="v-tok-punct">(</span>--v-surface-2<span class="v-tok-punct">);</span></span>
<span class="v-code-line">  <span class="v-tok-property">--v-density</span><span class="v-tok-punct">:</span> <span class="v-tok-number">0.85</span><span class="v-tok-punct">;</span></span>
<span class="v-code-line">  <span class="v-tok-property">font-family</span><span class="v-tok-punct">:</span> <span class="v-tok-string">"Inter Var"</span><span class="v-tok-punct">;</span></span>
<span class="v-code-line"><span class="v-tok-punct">}</span></span></code></pre>
</div>
```

#### Logo cloud (logo-cloud)

A row or grid of monochrome client or press logos, muted until hovered.

Base:
- .v-logos: An auto-fit grid of logos, centred in their cells. Use it on a <ul>.
Modifiers:
- .v-logos-inline: A centred, wrapping row instead of a grid.

Accessibility:
- Give each SVG role="img" and an aria-label with the company name; give each <img> alt text with the name.
- Label the list (aria-label="Clients") so it is announced as a group with a purpose.
- Logos are muted to --v-text-3, which is fine for decoration because the label carries the name.
- Linked logos show full colour on keyboard focus as well as on hover.

Example (Grid):

```html
<ul class="v-logos" aria-label="Clients">
  <li><svg viewBox="0 0 136 32" role="img" aria-label="Halvex"><path d="M4 26L16 4l12 22z" fill="currentColor"/><text x="36" y="23" font-size="19" font-weight="650" fill="currentColor">Halvex</text></svg></li>
  <li><svg viewBox="0 0 136 32" role="img" aria-label="Morrow"><circle cx="16" cy="16" r="12" fill="none" stroke="currentColor" stroke-width="4"/><text x="36" y="23" font-size="19" font-weight="650" fill="currentColor">Morrow</text></svg></li>
  <li><svg viewBox="0 0 136 32" role="img" aria-label="Quillon"><rect x="4" y="4" width="24" height="24" rx="6" fill="currentColor"/><text x="36" y="23" font-size="19" font-weight="650" fill="currentColor">Quillon</text></svg></li>
  <li><svg viewBox="0 0 136 32" role="img" aria-label="Ostra"><path d="M4 16h8l4-10 4 20 4-10h8" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linejoin="round"/><text x="40" y="23" font-size="19" font-weight="650" fill="currentColor">Ostra</text></svg></li>
  <li><svg viewBox="0 0 136 32" role="img" aria-label="Vantis"><path d="M16 3l11 6.5v13L16 29 5 22.5v-13z" fill="currentColor"/><text x="36" y="23" font-size="19" font-weight="650" fill="currentColor">Vantis</text></svg></li>
  <li><svg viewBox="0 0 136 32" role="img" aria-label="Lumeo"><circle cx="11" cy="16" r="7" fill="currentColor"/><circle cx="22" cy="16" r="7" fill="currentColor" opacity="0.55"/><text x="36" y="23" font-size="19" font-weight="650" fill="currentColor">Lumeo</text></svg></li>
</ul>
```

#### Pricing card (pricing-card)

A plan card with name, price, description, feature list and a call to action, used on .v-card. Native: <article>.

Base:
- .v-pricing: Goes with .v-card on an <article>: sets the gap between the parts.
Modifiers:
- .v-pricing-featured: The recommended plan: an accent ring and a stronger shadow.
Parts:
- .v-pricing-header: Plan name and an optional badge in a row.
- .v-pricing-name: The plan name, in display type.
- .v-pricing-price: Amount and period on one baseline.
- .v-pricing-amount: The price, large with tabular figures.
- .v-pricing-period: What the price covers: per month, forever.
- .v-pricing-desc: One line on who the plan is for.
- .v-pricing-features: The feature <ul>. Icons in the items take the accent colour.

Accessibility:
- Use a heading for the plan name, so people can jump between plans by heading.
- Write the period as words ("per month") next to the amount, so the price reads as a whole.
- The featured plan is marked by its badge text, not only by the accent ring.
- Name each button for its plan ("Choose Pro") rather than repeating "Buy".

Example (Three plans):

```html
<div class="v-grid" style="--v-min: 16rem">
  <article class="v-card v-pricing">
    <header class="v-pricing-header"><h3 class="v-pricing-name">Starter</h3></header>
    <p class="v-pricing-price"><span class="v-pricing-amount">€0</span><span class="v-pricing-period">forever</span></p>
    <p class="v-pricing-desc">For a first site and a single person running it.</p>
    <ul class="v-pricing-features">
      <li><svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#check"/></svg>One site, five pages</li>
      <li><svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#check"/></svg>All four directions</li>
      <li><svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#check"/></svg>Community support</li>
    </ul>
    <a class="v-btn v-btn-secondary v-btn-block" href="#">Start free</a>
  </article>
  <article class="v-card v-pricing v-pricing-featured">
    <header class="v-pricing-header"><h3 class="v-pricing-name">Pro</h3><span class="v-badge v-badge-solid">Recommended</span></header>
    <p class="v-pricing-price"><span class="v-pricing-amount">€24</span><span class="v-pricing-period">per month</span></p>
    <p class="v-pricing-desc">For a business that updates its site every week.</p>
    <ul class="v-pricing-features">
      <li><svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#check"/></svg>Unlimited pages</li>
      <li><svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#check"/></svg>Client admin and forms</li>
      <li><svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#check"/></svg>Priority email support</li>
      <li><svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#check"/></svg>Monthly SEO report</li>
    </ul>
    <a class="v-btn v-btn-primary v-btn-block" href="#">Choose Pro</a>
  </article>
  <article class="v-card v-card-feature v-pricing">
    <header class="v-pricing-header"><h3 class="v-pricing-name">Team</h3></header>
    <p class="v-pricing-price"><span class="v-pricing-amount">€79</span><span class="v-pricing-period">per month</span></p>
    <p class="v-pricing-desc">For agencies and labels with several people and sites.</p>
    <ul class="v-pricing-features">
      <li><svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#check"/></svg>Ten sites, shared tokens</li>
      <li><svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#check"/></svg>Roles and audit log</li>
      <li><svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#check"/></svg>Onboarding call</li>
    </ul>
    <a class="v-btn v-btn-primary v-btn-block" href="#">Talk to us</a>
  </article>
</div>
```

#### Prose (prose)

Long-form typography for CMS and markdown output, where the HTML inside carries no classes.

Base:
- .v-prose: Styles the plain elements inside it. Vectra classes used inside still win, and classed tables, pre, figures and blockquotes are left alone.

Accessibility:
- The default measure of 68ch keeps lines short enough to read comfortably.
- Give a scrolling <pre> tabindex="0" so keyboard users can scroll long lines.
- Body text uses --v-text-2 and headings --v-text, both at 4.5:1 or better in every direction.
- Keep the heading levels in order inside the article; prose sizes them, it does not fix the outline.

Example (Article):

```html
<article class="v-prose">
  <p>Most small business websites fail in the same quiet way. Nobody updates them. The opening hours drift, the gallery shows a van that was sold two years ago, and the contact form forwards to an inbox nobody reads.</p>
  <p>A site that stays useful is built around the few things that change, and makes those things easy to change. Read the <a href="#">full checklist</a> before your next build.</p>
  <h2>What changes, and how often</h2>
  <p>Start by listing what a customer actually needs to know before they call. For a roofer, that is usually short:</p>
  <ul>
    <li>Which towns you cover, and how quickly you can come out.</li>
    <li>Recent jobs, with real photos and a line about each one.</li>
    <li>A phone number that works on a phone, as a link.</li>
  </ul>
  <blockquote>
    <p>The best website I ever had was the one I could update from the van between jobs.</p>
  </blockquote>
  <h3>A three-step update routine</h3>
  <ol>
    <li>Take two photos at the end of every job.</li>
    <li>Upload the better one on Friday, with the town name.</li>
    <li>Check the <code>opening-hours</code> line once a month.</li>
  </ol>
</article>
```

#### Testimonial (testimonial)

A customer quote with the author, their avatar and role, and an optional star rating. Native: <figure>, <blockquote>, <figcaption>.

Base:
- .v-testimonial: The <figure>: stacks rating, quote and author.
Modifiers:
- .v-testimonial-lg: A centred pull-quote with a large opening mark and display type.
Parts:
- .v-testimonial-quote: The <blockquote>.
- .v-testimonial-author: The <figcaption>: avatar, name and role in a row, pushed to the bottom of the card.
- .v-testimonial-name: The person's name.
- .v-testimonial-role: Their role and company, in secondary text.
- .v-rating: Five stars, display only. Set --v-rating from 0 to 5; halves are allowed.

States:
- role="img" aria-label: On .v-rating: the stars are painted with CSS, so the label carries the score, e.g. "Rated 4 out of 5".

Accessibility:
- A <figure> with a <blockquote> and a <figcaption> ties the quote to its author for screen readers.
- The rating has no text of its own: always give it role="img" and an aria-label with the score.
- Mark the initials avatar aria-hidden="true", the name follows straight after it.
- The large opening quote mark is generated with an empty alternative, so it is not read out.

Example (Cards with ratings):

```html
<div class="v-grid" style="--v-min: 16rem">
  <figure class="v-card v-testimonial">
    <span class="v-rating" role="img" aria-label="Rated 5 out of 5"></span>
    <blockquote class="v-testimonial-quote"><p>The new site paid for itself in the first month. Half our calls now say they found us on Google.</p></blockquote>
    <figcaption class="v-testimonial-author">
      <span class="v-avatar" aria-hidden="true">SM</span>
      <span><span class="v-testimonial-name">Seán Murphy</span><span class="v-testimonial-role">Owner, Harbour Roofing</span></span>
    </figcaption>
  </figure>
  <figure class="v-card v-testimonial">
    <span class="v-rating" role="img" aria-label="Rated 4.5 out of 5" style="--v-rating: 4.5"></span>
    <blockquote class="v-testimonial-quote"><p>Clear prices, no surprises, and I can change the opening hours myself.</p></blockquote>
    <figcaption class="v-testimonial-author">
      <span class="v-avatar" aria-hidden="true">NB</span>
      <span><span class="v-testimonial-name">Niamh Brennan</span><span class="v-testimonial-role">Manager, The Quay Bar</span></span>
    </figcaption>
  </figure>
  <figure class="v-card v-testimonial">
    <span class="v-rating" role="img" aria-label="Rated 4 out of 5" style="--v-rating: 4"></span>
    <blockquote class="v-testimonial-quote"><p>Promos go out to the right DJs and the splits are paid the same day.</p></blockquote>
    <figcaption class="v-testimonial-author">
      <span class="v-avatar" aria-hidden="true">LV</span>
      <span><span class="v-testimonial-name">Luca Valenti</span><span class="v-testimonial-role">A&amp;R, independent label</span></span>
    </figcaption>
  </figure>
</div>
```

### Theming

#### Customizer (customizer)

A panel of theme choices (direction, mode, accent swatches and any hue, corners, density, typeface) that applies live and is saved in the browser. Native: popover, <fieldset>, <input type="radio">, <input type="range">.

Base:
- .v-customizer: The panel. A popover sheet when it has the popover attribute, a card in the flow otherwise.
Parts:
- .v-customizer-header: The top row: title, a line of help and an optional close button.
- .v-customizer-title: The panel heading.
- .v-customizer-body: The <form> holding one fieldset per setting.
- .v-swatches: A row of round accent swatches made from radios.
- .v-swatch: One swatch; its colour comes from an inline background-color. Without one it shows the direction accents.
- .v-hue-label: The label row above the hue slider, with an <output> for the value.
- .v-hue: A range input whose track runs the whole hue wheel.

States:
- popover: Makes the panel a sheet in the top layer, opened by a popovertarget button.
- :popover-open: The open sheet; it slides in from the end side, or up from the bottom on phones.
- data-corners, data-density, data-font: Written on <html> by theme.set(); their values live in theming.css.

Hooks:
- data-v-customizer (on the .v-customizer panel): Binds every input inside to the theme by the last part of its name (direction, mode, accent, corners, density, font) and keeps them in sync.
- data-v-reset (on A button inside the panel): Restores every theme default and announces it.

Events:
- v:theme detail theme.get(): Fires after every change.

Keyboard:
- Tab / Shift+Tab: Moves between the setting groups, the hue slider and the reset button.
- ArrowLeft / ArrowRight / ArrowUp / ArrowDown: Picks a choice inside a group, or moves the hue slider.
- Escape: Closes the popover sheet and returns focus to the button that opened it.

Accessibility:
- Opening the sheet moves focus to the first checked choice; the popover gives Escape, light dismiss and focus return.
- Each group is a <fieldset> with a <legend>, and each swatch has a visually hidden name, so the colours are not only shown.
- The reset is announced through the shared live region.
- Label the panel with aria-labelledby pointing at its title.

Example (In the page):

```html
<aside class="v-customizer" data-v-customizer aria-labelledby="cz-title">
  <header class="v-customizer-header">
    <div>
      <h2 class="v-customizer-title" id="cz-title">Customize</h2>
      <p class="v-text-secondary">Changes apply live and are saved in this browser.</p>
    </div>
  </header>
  <form class="v-customizer-body">
    <fieldset>
      <legend>Mode</legend>
      <div class="v-segmented"><label><input type="radio" name="cz-mode" value="light"><span>Light</span></label><label><input type="radio" name="cz-mode" value="dark"><span>Dark</span></label><label><input type="radio" name="cz-mode" value="system"><span>System</span></label></div>
    </fieldset>
    <fieldset>
      <legend>Accent</legend>
      <div class="v-swatches"><label title="Style default"><input type="radio" name="cz-accent" value="default"><span class="v-swatch" aria-hidden="true"></span><span class="v-sr-only">Style default</span></label><label title="Cyan"><input type="radio" name="cz-accent" value="200"><span class="v-swatch" style="background-color: oklch(65% 0.15 200deg)" aria-hidden="true"></span><span class="v-sr-only">Cyan</span></label><label title="Blue"><input type="radio" name="cz-accent" value="245"><span class="v-swatch" style="background-color: oklch(65% 0.15 245deg)" aria-hidden="true"></span><span class="v-sr-only">Blue</span></label><label title="Violet"><input type="radio" name="cz-accent" value="285"><span class="v-swatch" style="background-color: oklch(65% 0.15 285deg)" aria-hidden="true"></span><span class="v-sr-only">Violet</span></label><label title="Pink"><input type="radio" name="cz-accent" value="340"><span class="v-swatch" style="background-color: oklch(65% 0.15 340deg)" aria-hidden="true"></span><span class="v-sr-only">Pink</span></label><label title="Red"><input type="radio" name="cz-accent" value="25"><span class="v-swatch" style="background-color: oklch(65% 0.15 25deg)" aria-hidden="true"></span><span class="v-sr-only">Red</span></label><label title="Amber"><input type="radio" name="cz-accent" value="65"><span class="v-swatch" style="background-color: oklch(65% 0.15 65deg)" aria-hidden="true"></span><span class="v-sr-only">Amber</span></label><label title="Green"><input type="radio" name="cz-accent" value="150"><span class="v-swatch" style="background-color: oklch(65% 0.15 150deg)" aria-hidden="true"></span><span class="v-sr-only">Green</span></label></div>
      <label class="v-hue-label" for="cz-hue"><span>Any hue</span><output for="cz-hue"></output></label>
      <input class="v-hue" id="cz-hue" name="cz-accent" type="range" min="0" max="359" step="1">
    </fieldset>
    <fieldset>
      <legend>Corners</legend>
      <div class="v-segmented"><label><input type="radio" name="cz-corners" value="default"><span>Default</span></label><label><input type="radio" name="cz-corners" value="sharp"><span>Sharp</span></label><label><input type="radio" name="cz-corners" value="rounded"><span>Rounded</span></label><label><input type="radio" name="cz-corners" value="round"><span>Round</span></label></div>
    </fieldset>
    <fieldset>
      <legend>Density</legend>
      <div class="v-segmented"><label><input type="radio" name="cz-density" value="compact"><span>Compact</span></label><label><input type="radio" name="cz-density" value="default"><span>Default</span></label><label><input type="radio" name="cz-density" value="spacious"><span>Spacious</span></label></div>
    </fieldset>
    <button class="v-btn v-btn-secondary v-btn-block" type="button" data-v-reset>Reset to defaults</button>
  </form>
</aside>
```

#### Direction switcher (direction-switcher)

A segmented radio group that switches between the four design directions (Dark tech, Editorial, Soft depth, Glass) live. Native: <fieldset> of <input type="radio">.


States:
- checked: Follows the current direction, including changes made anywhere else on the page.

Hooks:
- data-v-theme-switch (on A .v-segmented fieldset of radios): Each radio sets the theme key named by the last part of its name (direction, hdr-direction, cz-mode...) and stays in sync with theme changes.

Events:
- v:theme detail theme.get(): Fires after every theme change.

Keyboard:
- Tab: Moves focus to the checked direction.
- ArrowLeft / ArrowRight / ArrowUp / ArrowDown: Picks the previous or next direction (native radio group).

Accessibility:
- A <fieldset> with a <legend> (visually hidden is fine) names the group, for example Design direction.
- It is a native radio group, so the keys and the checked state are announced with no ARIA.
- The change runs inside a view transition, which is instant under prefers-reduced-motion.

Example (Switch direction):

```html
<fieldset class="v-segmented" data-v-theme-switch><legend class="v-sr-only">Design direction</legend><label><input type="radio" name="direction" value="tech"><span>Dark tech</span></label><label><input type="radio" name="direction" value="editorial"><span>Editorial</span></label><label><input type="radio" name="direction" value="soft"><span>Soft depth</span></label><label><input type="radio" name="direction" value="glass"><span>Glass</span></label></fieldset>
```

#### Scroll area (scroll-area)

A box with thin themed scrollbars whose edges fade where more content waits, vertically or sideways.

Base:
- .v-scroll: Scrolls vertically up to --v-scroll-max (default 20rem), with fading top and bottom edges.
Modifiers:
- .v-scroll-x: Scrolls sideways instead, fading the start and end edges (mirrored in right-to-left).

States:
- tabindex="0": Lets keyboard users focus the area and scroll it with the arrow keys. The fade drops while focused so the ring is never masked.
- role="region": With aria-label or aria-labelledby, names the area for screen readers.

Keyboard:
- Tab: Moves focus to the area when it has tabindex="0".
- ArrowUp / ArrowDown / ArrowLeft / ArrowRight / PageUp / PageDown: Scrolls the focused area (native).

Accessibility:
- An area that overflows needs tabindex="0", role="region" and a label, or keyboard users cannot reach the hidden part.
- The fade is a scroll-driven enhancement; without support the area simply scrolls.
- overscroll-behavior: contain stops the page from scrolling when the area reaches its end.

Example (Vertical):

```html
<h3 class="v-card-title" id="notes-title">Release notes</h3>
<div class="v-scroll" role="region" aria-labelledby="notes-title" tabindex="0" style="--v-scroll-max: 13rem">
  <ul class="v-stack" style="--v-gap: var(--v-space-3)">
    <li>Tables gain a sticky header and a dense variant.</li>
    <li>Timeline markers take an icon, an avatar or a dot.</li>
    <li>Prose styles CMS output with no classes at all.</li>
    <li>Code blocks number their lines with CSS counters.</li>
    <li>Testimonials show a rating that screen readers announce.</li>
    <li>Pricing cards line their buttons up across a row.</li>
    <li>Logo clouds stay monochrome until you hover them.</li>
    <li>Scroll areas fade their edges where more content waits.</li>
    <li>Every component reads its colours from tokens.</li>
    <li>Right-to-left layouts work through logical properties.</li>
  </ul>
</div>
```

#### Theme toggle (theme-toggle)

An icon button that cycles light, dark and system mode, showing the icon for the mode in use. Native: <button>.

Base:
- .v-theme-toggle: On an icon button holding three icons marked data-for="light|dark|system"; only the current one shows. Hidden until the JS sets data-mode.

States:
- data-mode="light" | "dark" | "system": Set by the JS; picks the visible icon.
- aria-label: Kept up to date by the JS, for example "Theme: system (dark). Switch to light".

Hooks:
- data-v-theme-toggle (on the button): Cycles light, dark, system on click and keeps the icon and the label in sync.

Events:
- v:theme detail theme.get(): Fires after every change, and when the OS switches while in system mode.

Keyboard:
- Tab: Moves focus to the toggle.
- Enter / Space: Switches to the next mode.

Accessibility:
- The accessible name says the current mode and the next one, so people know what pressing it will do.
- The new mode is announced through the shared live region.
- Without JS the button would do nothing, so it stays hidden until data-mode is set.

Example (Toggle the mode):

```html
<button class="v-btn v-btn-icon v-btn-ghost v-theme-toggle" type="button" data-v-theme-toggle aria-label="Theme"><svg class="v-icon" data-for="light" aria-hidden="true"><use href="/icons/sprite.svg#sun"/></svg><svg class="v-icon" data-for="dark" aria-hidden="true"><use href="/icons/sprite.svg#moon"/></svg><svg class="v-icon" data-for="system" aria-hidden="true"><use href="/icons/sprite.svg#monitor"/></svg></button>
```

## Sections

Page sections (dist/vectra.sections.css, included in dist/vectra.css) built from the components above. Copy them from the pages in examples/sections/.

- app-shell: App shell. .v-app holds a sidebar (.v-app-sidebar), the main column (.v-app-main: a .v-app-topbar and the .v-app-page) and, for phones, an optional .v-bottombar. - From 64rem of shell width the sidebar sits beside the main column and stays put while the page scrolls. Below that, a sidebar with the popover attribute and an id hides, and the top bar's .v-app-toggle (popovertarget) opens it as a sheet from the start edge; a .v-app-close button inside shows only while it is open. No JS needed. - The top bar is its own size container: the toggle hides once the bar is 48rem wide, which is when a 16rem sidebar is showing beside it. - A sidebar holding a .v-sidenav-rail stays an icon rail at every width. Classes: .v-app .v-app-sidebar .v-app-main .v-app-topbar .v-app-page .v-bottombar .v-app-toggle .v-app-close .v-sidenav-rail .v-navbar-brand .v-search
- app-ui: App UI sections. Most are composition (panels, lists, tables, forms, description lists, empty states); this file adds the two pieces that are not: - .v-toolbar: a filter row above a table or list. The search grows, filters and actions wrap. - .v-danger-zone: a .v-panel for destructive actions, in the danger tone, one action per .v-panel-body row (text first, button last). Classes: .v-toolbar .v-danger-zone .v-panel .v-panel-body .v-search .v-panel-title
- auth: Auth layouts: sign in, sign up, recovery and the rest. The wrapper picks the layout; the markup inside is the same in every one, so any flow drops into any layout by changing one class. <main class="v-auth"> centred card (default) <div class="v-auth-main"> <a class="v-auth-logo" href="/">..</a> <div class="v-auth-box"> .v-auth-header (.v-auth-title, .v-auth-text), a .v-form, .v-auth-alt <footer class="v-auth-footer">..</footer> </div> <aside class="v-auth-aside v-auth-art"> split layouts only: drawn art, or .v-auth-panel for a quote </main> Layouts: .v-auth-split (form beside an aside; stacks on phones), .v-auth-minimal (no card), .v-auth-bleed (card over a colour field; Glass shows its own), and .v-auth-dialog on a .v-dialog. .v-auth-wide widens the column for plan pickers, 2FA set-up and onboarding. Classes: .v-auth-header .v-auth-title .v-auth-text .v-form .v-auth-alt .v-auth-panel .v-auth-split .v-auth-minimal .v-auth-bleed .v-auth-dialog .v-dialog .v-auth-wide .v-auth .v-auth-main .v-auth-logo .v-icon .v-auth-box .v-auth-footer .v-auth-icon .v-auth-icon-success .v-auth-icon-warning .v-auth-icon-danger .v-auth-code .v-auth-qr .v-auth-codes .v-auth-aside .v-auth-art .v-testimonial-quote .v-dialog-close
- cta: Call to action, on a card (.v-card, often .v-card-feature for the direction's emphasis surface). .v-cta centres a title, a line of copy and the actions with generous padding. .v-cta-split puts the copy beside the actions (or a newsletter form) once the card is 44rem wide. Classes: .v-card .v-card-feature .v-cta .v-cta-split .v-lead
- features: Feature sections. Layout comes from .v-grid and .v-bento; this file adds only what they cannot do. - .v-feature-icon: the tinted tile an icon sits in. - .v-alternate: rows of copy and art, each row a direct child, art swapping sides on every second row from 48rem wide. - .v-howto: an <ol> of steps, numbered by CSS, in as many columns as fit. - .v-stats: a <dl> of .v-stat blocks (term first, shown under the number), split by rules. Classes: .v-grid .v-bento .v-feature-icon .v-alternate .v-howto .v-stats .v-stat .v-stat-value .v-stat-label
- footer: Site footer. .v-footer is the band (a size container); inside a .v-container: - .v-footer-grid: a brand column (.v-footer-brand) and link columns. Columns sit two up on phones and side by side from 48rem; set --v-footer-cols to the number of link columns (default 3). - .v-footer-title heads a column, .v-footer-links is its list. - .v-footer-bottom: the closing row (copyright, legal links), split by a rule; on its own it is the whole of a simple footer. Classes: .v-footer .v-container .v-footer-grid .v-footer-brand .v-footer-title .v-footer-links .v-footer-bottom .v-btn
- hero: Hero: the opening section. .v-hero paints the direction's hero background (fading out at the bottom) and is a size container, so the layout follows the hero's own width, not the window. - .v-hero-copy: badge, display title, lead, actions and a note, stacked. - .v-hero-center: copy centred. .v-hero-split: copy beside .v-hero-art from 56rem of hero width. - .v-hero-art: holds an illustration, a screenshot or a form; .v-hero-float pins a card over its corner. - .v-hero-shot: a .v-shot below centred copy. Classes: .v-hero .v-hero-copy .v-hero-center .v-hero-split .v-hero-art .v-hero-float .v-hero-shot .v-shot .v-display
- page-header: Page header: the top of an app page. A breadcrumb or kicker, the title (.v-page-title), a line of meta (.v-page-meta) and the page actions (.v-page-actions), which wrap under the title on narrow screens. Add a .v-tablist of links (aria-current="page" on the current one) as the last child for the tabbed variant; it then sits on the header's bottom rule. Classes: .v-page-title .v-page-meta .v-page-actions .v-tablist .v-page-header
- pricing-section: Pricing section with a monthly / yearly switch that needs no JS. Inside .v-billing put a .v-segmented radio pair with the values "monthly" and "yearly", then the plans; mark each price that differs with data-period="monthly" or data-period="yearly". The checked radio decides which ones show, so hidden prices are hidden from screen readers too. Classes: .v-billing .v-segmented
- section: Shared section pieces. - .v-section-head: kicker, title and lead above a section; .v-section-head-center centres it. - .v-shot: a window frame for a product screenshot composed from real Vectra components. Give the composed content role="img" and a label, and keep it free of focusable things: <a> without href, <span class="v-btn">. .v-shot-bar is the title strip, .v-shot-body the content. Classes: .v-section-head .v-section-head-center .v-shot .v-shot-bar .v-shot-body
- site-header: Site header pieces on top of the navbar and banner components. - .v-navbar-contained: keeps the navbar's content in line with a .v-container below it. - .v-navbar-center: links at the start, the brand in the middle, actions at the end, once the navbar is 48rem wide (below that it is the usual brand + menu button). - .v-announce: a slim, centred .v-banner strip above the navbar. Classes: .v-navbar-contained .v-container .v-navbar-center .v-announce .v-banner .v-navbar-brand .v-banner-body
- team: Team: a grid of people. Each .v-person is a <figure> or <li> with a large avatar, the name (.v-person-name), the role (.v-person-role) and an optional line of bio. Centred in its cell. Classes: .v-person .v-person-name .v-person-role .v-avatar

## Layout primitives

Tune them with custom properties (--v-gap, --v-min, --v-container-max), not modifiers.

- .v-container: Centred column with fluid side gutters.
- .v-container-narrow: --v-container-max: 48rem;
- .v-container-wide: --v-container-max: 90rem;
- .v-stack: Vertical rhythm: children spaced by --v-gap.
- .v-cluster: Inline group that wraps: buttons, tags, toolbars.
- .v-grid: As many columns as fit, each at least --v-min wide.
- .v-sidebar: Side panel + content. Stacks once the content would get narrower than --v-content-min.
- .v-switcher: Equal columns in a row, all stacking together below --v-switch (no media query).
- .v-bento: 12-column bento. Spans apply from 48rem; everything is full width below.
- .v-section: Page section rhythm.
- .v-cq: Makes an element a size container so children can use @container queries.

## Utilities

- Type (base.css): .v-display .v-lead .v-kicker .v-icon
- Screen readers: .v-sr-only
- Display: .v-block .v-inline-block .v-flex .v-inline-flex .v-none
- Flex alignment: .v-items-start .v-items-center .v-items-end .v-items-baseline .v-justify-start .v-justify-center .v-justify-end .v-justify-between .v-wrap .v-grow .v-shrink-0
- Gap: .v-gap-0 .v-gap-1 .v-gap-2 .v-gap-3 .v-gap-4 .v-gap-5 .v-gap-6
- Block margins: .v-mt-0 .v-mt-2 .v-mt-4 .v-mt-6 .v-mt-8 .v-mb-0 .v-mb-2 .v-mb-4 .v-mb-6 .v-mb-8 .v-mx-auto
- Padding: .v-p-0 .v-p-2 .v-p-4 .v-p-6
- Text: .v-text-start .v-text-center .v-text-end .v-text-sm .v-text-lg .v-text-secondary .v-text-muted .v-text-accent .v-text-success .v-text-warning .v-text-danger .v-text-info .v-font-mono .v-fw-regular .v-fw-medium .v-fw-semibold .v-fw-bold .v-nowrap .v-tabular .v-balance .v-truncate
- Surfaces: .v-bg-surface .v-bg-subtle .v-border .v-rounded .v-rounded-lg .v-rounded-pill .v-shadow-1 .v-shadow-2 .v-shadow-3
- Sizing: .v-w-full .v-max-prose

## Theme attributes

- data-direction on <html>: tech, editorial, soft, glass (default tech). The design direction. One markup, four looks.
- data-theme on <html>: light, dark. Forces light or dark. Leave it off to follow the OS live.
- data-corners on <html>: sharp, rounded, round. Corner radius preset across every component.
- data-density on <html>: compact, spacious. Spacing and control size preset.
- data-font on <html>: inter, serif, system. Typeface preset: Inter everywhere, serif headings, or the system font.
- --v-accent-h on <html> style or :root: 0 to 360. Accent hue in degrees. Contrast holds for any hue.

Directions:
- tech (Dark tech): Deep surfaces, hairline borders, a cool accent glow. Precise and quiet. Default when no data-direction is set.
- editorial (Editorial): Warm paper, serif display type, flat surfaces and ink-black actions.
- soft (Soft depth): Layered surfaces, soft shadows, generous radii. The neutrals take on the accent hue.
- glass (Glass): Frosted translucent surfaces over a vivid colour field that follows the accent hue.

## Tokens

Set tokens on :root to change the whole site, or on any element to change one area. Every direction defines the required tokens; optional ones have defaults. Component tokens (such as --v-btn-radius) change one component.

- --v-bg (required): Page background.
- --v-bg-subtle (required): Subtle background for alternate bands and wells.
- --v-surface (required): Surface of cards, panels and controls.
- --v-surface-2 (required): Second surface: tracks, hovered rows, recessed areas.
- --v-border (required): Hairline borders and dividers.
- --v-border-strong (required): Stronger border for emphasis.
- --v-border-control (required): Border of form controls, at 3:1 against the surface.
- --v-text (required): Body and heading text.
- --v-text-2 (required): Secondary text.
- --v-text-3 (required): Muted text: meta, captions.
- --v-accent-h (required): Accent hue in OKLCH degrees. Set it, or Vectra.theme.set({ accent }), to rebrand every direction.
- --v-accent (required): Accent for fills, focus rings and selected states.
- --v-accent-hover (required): Accent on hover.
- --v-accent-2 (required): Second accent for gradients and glows only. Never put text on it.
- --v-accent-text (required): Accent for text and links on surfaces.
- --v-accent-soft (required): Soft accent tint for backgrounds.
- --v-on-accent (required): Text and icons on accent fills.
- --v-radius-sm (required): Small corner radius.
- --v-radius-md (required): Medium corner radius: buttons, inputs.
- --v-radius-lg (required): Large corner radius: cards.
- --v-radius-xl (required): Extra large corner radius: dialogs, heroes.
- --v-radius-pill (required): Fully rounded ends: pills, badges.
- --v-shadow-1 (required): Low elevation shadow.
- --v-shadow-2 (required): Medium elevation shadow: popovers, menus.
- --v-shadow-3 (required): High elevation shadow: dialogs.
- --v-font-sans (optional): Base font stack (Inter by default).
- --v-font-body (optional): Body text font.
- --v-font-display (optional): Display and heading font.
- --v-display-weight (optional): Weight of display headings.
- --v-display-tracking (optional): Letter spacing of display headings.
- --v-display-leading (optional): Line height of display headings.
- --v-heading-weight (optional): Weight of headings.
- --v-heading-tracking (optional): Letter spacing of headings.
- --v-step-display (optional): Font size of the display step.
- --v-border-w (optional): Border width.
- --v-primary-bg (optional): Primary button background.
- --v-primary-fg (optional): Primary button text.
- --v-primary-hover-bg (optional): Primary button background on hover.
- --v-primary-hover-fg (optional): Primary button text on hover.
- --v-btn-radius (optional): Button corner radius.
- --v-btn-weight (optional): Button font weight.
- --v-btn-shadow (optional): Button shadow.
- --v-btn-border (optional): Button border colour.
- --v-card-bg (optional): Card background.
- --v-card-border (optional): Card border colour.
- --v-card-shadow (optional): Card shadow.
- --v-card-sheen (optional): Card highlight overlay (none by default).
- --v-input-bg (optional): Input background.
- --v-input-border (optional): Input border colour.
- --v-input-radius (optional): Input corner radius.
- --v-input-shadow (optional): Input shadow.
- --v-feature-bg (optional): Feature surface background (highlighted plan, hero card).
- --v-feature-fg (optional): Text on the feature surface.
- --v-feature-fg-2 (optional): Secondary text on the feature surface.
- --v-feature-border (optional): Border of the feature surface.
- --v-feature-on-fg (optional): Colour used on top of feature-fg (buttons inside a feature card).
- --v-page-bg (optional): Background image or gradient behind the page (none by default).
- --v-hero-bg (optional): Background image or gradient of heroes (none by default).
- --v-overlay-bg (optional): Surface of dialogs, drawers, popovers and menus.
- --v-backdrop (optional): Scrim behind modal dialogs and drawers.
- --v-success-soft (optional): Soft success background.
- --v-warning-soft (optional): Soft warning background.
- --v-danger-soft (optional): Soft danger background.
- --v-info-soft (optional): Soft info background.

Component tokens: --v-avatar-size --v-card-pad --v-code-max --v-control-h --v-danger --v-density --v-dialog-pad --v-dialog-w --v-drawer-pad --v-drawer-size --v-dur-1 --v-dur-2 --v-dur-3 --v-ease-out --v-ease-spring --v-focus-w --v-font-mono --v-font-serif --v-info --v-input-h --v-logos-h --v-logos-min --v-menu-pad --v-popover-gap --v-prose-flow --v-prose-measure --v-prose-size --v-range-thumb --v-range-track --v-rating --v-rating-size --v-save-icon --v-save-tone --v-scroll-fade --v-scroll-max --v-skeleton-size --v-space-2 --v-space-3 --v-space-4 --v-space-5 --v-space-7 --v-spinner-size --v-status-color --v-status-size --v-step-1 --v-step-3 --v-step-minus-1 --v-step-size --v-success --v-switch-travel --v-table-head-bg --v-table-max --v-table-min --v-table-pad-x --v-table-pad-y --v-tag-border --v-tl-dot --v-tl-size --v-tl-space --v-tone --v-tone-soft --v-warning

## Icons

Usage: `<svg class="v-icon" aria-hidden="true"><use href="/icons/sprite.svg#name"/></svg>`

162 names: accessibility activity alert archive arrow-down arrow-left arrow-right arrow-up arrow-up-right at-sign award bag ban bell bell-off bold book-open bookmark building calendar camera cart chart-bar chart-line chat check checkbox chevron-down chevron-left chevron-right chevron-up chevrons-left chevrons-right chevrons-up-down clipboard clipboard-check clock close code compass copy credit-card dashboard database disc dollar download drag edit edit-square enter error euro external eye eye-off file file-text filter flag folder folder-open gift globe grid hash headphones heart help history home image inbox info italic key languages laptop layers lightbulb link list list-ordered loader lock log-in log-out mail map map-pin maximize menu message mic mic-off minimize minus monitor moon more more-vertical music package palette paperclip pause percent phone play plus plus-circle power qr-code quote redo refresh reset save search send settings share shield shield-check sidebar sliders smartphone sort sort-asc sort-desc sparkles spinner star store success sun table tag terminal theme thumbs-down thumbs-up trash trending-up truck undo unlock upload upload-cloud user user-check user-circle user-plus users video volume volume-off wallet warning wifi wifi-off zap

## JavaScript API

window.Vectra from dist/vectra.js, or named exports of dist/vectra.esm.js. Hooks start on their own; this API is for code.

- `Vectra.init(root = document)`: Starts every registered module on the data-v-* hooks inside root. Vectra runs it on load and a MutationObserver runs it for content added later (Vue, Livewire, htmx), so it is rarely needed.
- `Vectra.register(name, init)`: Adds a module for data-v-<name>. init(el, options) runs once per element and returns { destroy }, called when the element leaves the DOM.
- `Vectra.emit(el, type, detail) => boolean`: Fires a bubbling, cancelable v:<type> event. Returns false if a listener called preventDefault().
- `Vectra.storage.get(key, fallback = null)`: Reads localStorage under the vectra- prefix; never throws.
- `Vectra.storage.set(key, value)`: Writes localStorage under the vectra- prefix; null removes the key; never throws.
- `Vectra.announce(message, politeness = 'polite')`: Reads a message to screen readers through a shared live region. Use 'assertive' only for urgent news.
- `Vectra.connection.slow(on = true)`: Shows (true) or clears (false) the slow network notice, for example when your own requests are timing out.
- `Vectra.saveStatus(el, 'saving' | 'saved' | 'failed' | 'offline', { at })`: Sets data-state and the text. Saved shows the time since at (default now) and refreshes it every 30 seconds. Writes into a .v-save-status-text child if there is one, otherwise into el itself.
- `Vectra.session.warn({ expiresAt, onExtend, onExpire, onSignIn }) => { close }`: Opens the warning. expiresAt is a Date or a timestamp. Stay signed in and Escape call onExtend; at expiry onExpire runs and the button becomes Sign in (onSignIn). Only one warning is open at a time.
- `Vectra.toast(message, { tone, action: { label, onClick }, undo, duration }) => { dismiss }`: Shows a toast. tone is 'success', 'info', 'warning' or 'danger'. undo is a shortcut for an Undo action. duration is in ms (default 5000, at least 10000 with an action, 0 to stay until closed). Returns dismiss() to close it early.
- `Vectra.fieldState(input, state, message)`: state is "checking", "valid", "invalid" or "clear". Writes the message under the input's .v-field and announces it politely.
- `Vectra.theme.set({ direction, mode, accent, corners, density, font })`: Changes any of the settings. accent is a hue in degrees or 'default'; unknown values are ignored. Saved in storage.
- `Vectra.theme.get()`: The current choices plus resolved, the theme actually showing.
- `Vectra.theme.set({ direction: 'tech' | 'editorial' | 'soft' | 'glass' })`: Changes the direction from code, inside a view transition where supported. Saved under the direction storage key.
- `Vectra.theme.set({ mode: 'light' | 'dark' | 'system' })`: Sets the mode from code. System removes data-theme so the OS setting applies live.
- `Vectra.version`: The kit version as a string ("2.0.0-alpha.0").

Hooks registered as modules (they start on their own):
data-v-clear data-v-connection data-v-copy data-v-counter data-v-customizer data-v-dialog-close data-v-dialog-open data-v-dismiss data-v-dismissable data-v-dropzone data-v-menu data-v-nav data-v-password data-v-shortcut data-v-stepper data-v-strength data-v-tabs data-v-theme-switch data-v-theme-toggle data-v-toggle data-v-tooltip data-v-unsaved data-v-validate

## Patterns

Complete pages and galleries in the repository to copy from. Classes starting with ex- and the #i-* sprite are gallery-only: do not copy them.

- examples/auth/: Auth
- examples/auth/accounts/delete.html: Auth: Delete account
- examples/auth/accounts/invite.html: Auth: Accept invite
- examples/auth/accounts/terms.html: Auth: Consent and terms update
- examples/auth/accounts/workspace.html: Auth: Choose workspace
- examples/auth/first-run/connect.html: Auth: Connect accounts
- examples/auth/first-run/empty-dashboard.html: Auth: Empty dashboard
- examples/auth/first-run/onboarding.html: Auth: Onboarding steps
- examples/auth/first-run/welcome.html: Auth: Welcome
- examples/auth/layouts/bleed.html: Auth: Sign in, full-bleed background
- examples/auth/layouts/card.html: Auth: Sign in, centred card
- examples/auth/layouts/dialog.html: Auth: Sign in, dialog
- examples/auth/layouts/minimal.html: Auth: Sign in, minimal
- examples/auth/layouts/split-panel.html: Auth: Sign in, split screen with a testimonial
- examples/auth/recovery/changed.html: Auth: Password changed
- examples/auth/recovery/check-email.html: Auth: Check your email
- examples/auth/recovery/forgot.html: Auth: Forgot password
- examples/auth/recovery/reset.html: Auth: Reset password
- examples/auth/sessions/expired.html: Auth: Session expired
- examples/auth/sessions/lock.html: Auth: Lock screen
- examples/auth/sessions/locked.html: Auth: Account locked
- examples/auth/sessions/signed-out.html: Auth: Signed out
- examples/auth/sessions/suspended.html: Auth: Account suspended
- examples/auth/sessions/too-many.html: Auth: Too many attempts
- examples/auth/sign-in/error.html: Auth: Wrong password (server error)
- examples/auth/sign-in/magic-link.html: Auth: Magic link
- examples/auth/sign-in/passkey.html: Auth: Passkey
- examples/auth/sign-in/password.html: Auth: Password
- examples/auth/sign-in/remember-me.html: Auth: Remembered accounts
- examples/auth/sign-in/social.html: Auth: Social buttons
- examples/auth/sign-in/sso.html: Auth: Single sign-on (SSO)
- examples/auth/sign-up/multi-step.html: Auth: Multi-step
- examples/auth/sign-up/plans.html: Auth: With plan picker
- examples/auth/sign-up/single.html: Auth: Single step
- examples/auth/sign-up/waitlist.html: Auth: Invite-only waitlist
- examples/auth/two-factor/code.html: Auth: Enter code
- examples/auth/two-factor/recovery-codes.html: Auth: Recovery codes
- examples/auth/two-factor/recovery.html: Auth: Use a recovery code
- examples/auth/two-factor/setup.html: Auth: Set up 2FA
- examples/auth/two-factor/sms.html: Auth: SMS fallback
- examples/auth/verification/code.html: Auth: Verify email (code entry)
- examples/auth/verification/link-sent.html: Auth: Verify email (link sent)
- examples/auth/verification/verified.html: Auth: Email verified
- examples/components/: Components
- examples/content/: Data and content
- examples/elements/: Elements
- examples/forms/: Forms
- examples/icons/: Icons
- examples/layout/: Foundations
- examples/navigation/: Navigation
- examples/overlays/: Overlays
- examples/pages/app-shell.html: Northwind
- examples/pages/saas-home.html: Northwind
- examples/sections/: Sections
- examples/sections/app.html: Sections: app UI
- examples/sections/chrome.html: Sections: navigation and chrome
- examples/sections/marketing.html: Sections: marketing
- examples/theming/: Theming and feedback
- examples/tokens/: Tokens

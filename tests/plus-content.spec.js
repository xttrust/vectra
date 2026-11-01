import { test, expect } from '@playwright/test';
import { PAGES, open } from './helpers.js';

// v2.1 components, part 2, on examples/plus-content/.
const target = PAGES.find((p) => p.name === 'plus-content');
const ready = (page) => expect(page.locator('#readmore-long[data-clamped]')).toBeAttached();

test.describe('progress ring', () => {
  test.beforeEach(async ({ page }) => { await open(page, target, { direction: 'tech', theme: 'light' }); });

  test('is a labelled progressbar whose ring follows --v-value', async ({ page }) => {
    const ring = page.locator('#ring-upload');
    await expect(ring).toHaveAttribute('role', 'progressbar');
    await expect(ring).toHaveAccessibleName('Upload');
    const bg = await ring.evaluate((el) => getComputedStyle(el, '::before').backgroundImage);
    expect(bg).toContain('conic-gradient');
    expect(bg).toContain('72%');
    const box = await ring.boundingBox();
    expect(Math.abs(box.width - box.height)).toBeLessThan(1);
  });
});

test.describe('read more', () => {
  test.use({ viewport: { width: 1280, height: 900 } });
  test.beforeEach(async ({ page }) => { await open(page, target, { direction: 'tech', theme: 'light' }); await ready(page); });

  test('long text is clamped with a button; short text gets none', async ({ page }) => {
    const body = page.locator('#readmore-long .v-readmore-body');
    const lines = await body.evaluate((el) => Math.round(el.clientHeight / parseFloat(getComputedStyle(el).lineHeight)));
    expect(lines).toBe(4);
    await expect(page.locator('#readmore-long .v-readmore-toggle')).toBeVisible();
    await expect(page.locator('#readmore-long .v-readmore-toggle')).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#readmore-short .v-readmore-toggle')).toBeHidden();
  });

  test('the button shows the rest, says so, and closes again', async ({ page }) => {
    const button = page.locator('#readmore-long .v-readmore-toggle');
    const body = page.locator('#readmore-long .v-readmore-body');
    const before = (await body.boundingBox()).height;
    await button.click();
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await expect(button).toHaveText('Show less');
    expect((await body.boundingBox()).height).toBeGreaterThan(before * 1.4);
    await button.click();
    await expect(button).toHaveText('Read more');
    expect(Math.abs((await body.boundingBox()).height - before)).toBeLessThan(2);
  });

  test('a narrow column can need the button where a wide one did not', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.locator('#readmore-short .v-readmore-body').evaluate((el) => { el.textContent = 'Four lines fit at this width, but not in a narrow column on a phone. '.repeat(3); });
    await page.locator('#readmore-short').evaluate((el) => { el.style.inlineSize = '40rem'; });
    await page.waitForTimeout(100);
    await page.locator('#readmore-short').evaluate((el) => { el.style.inlineSize = '10rem'; });
    await expect(page.locator('#readmore-short .v-readmore-toggle')).toBeVisible();
  });
});

test.describe('read more without JS', () => {
  test.use({ javaScriptEnabled: false });

  test('shows the whole text', async ({ page }) => {
    await page.goto(target.path);
    const body = page.locator('#readmore-long .v-readmore-body');
    expect(await body.evaluate((el) => el.scrollHeight <= el.clientHeight + 1)).toBe(true);
  });
});

test.describe('device frames', () => {
  test.beforeEach(async ({ page }) => { await open(page, target, { direction: 'tech', theme: 'light' }); });

  test('each screen keeps its aspect ratio and the image fills it', async ({ page }) => {
    const ratio = async (sel) => page.locator(sel).evaluate((el) => { const r = el.getBoundingClientRect(); return r.width / r.height; });
    expect(await ratio('.v-device-browser .v-device-screen')).toBeCloseTo(1.6, 1);
    expect(await ratio('.v-device-phone .v-device-screen')).toBeCloseTo(9 / 19.5, 1);
    const [screen, img] = [await page.locator('.v-device-phone .v-device-screen').boundingBox(), await page.locator('.v-device-phone img').boundingBox()];
    expect(Math.abs(screen.width - img.width)).toBeLessThan(1);
  });

  test('the phone camera stays centred in right to left', async ({ page }) => {
    await page.evaluate(() => { document.documentElement.dir = 'rtl'; });
    const centre = await page.locator('.v-device-phone .v-device-screen').evaluate((el) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el, '::before');
      const left = r.left + parseFloat(cs.left) + parseFloat(cs.marginLeft); // auto margins centre it
      return Math.abs(left + parseFloat(cs.width) / 2 - (r.left + r.width / 2));
    });
    expect(centre).toBeLessThan(1.5);
  });
});

test.describe('masonry gallery', () => {
  test('several columns on desktop, one on a phone, and no item splits across columns', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await open(page, target, { direction: 'tech', theme: 'light' });
    const lefts = async () => new Set(await page.locator('.v-masonry > li').evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().left))));
    expect((await lefts()).size).toBeGreaterThanOrEqual(3);
    expect(await page.locator('.v-masonry > li').evaluateAll((els) => els.every((e) => e.getClientRects().length === 1))).toBe(true);
    await page.setViewportSize({ width: 390, height: 844 });
    expect((await lefts()).size).toBe(1);
  });
});

test.describe('rating input', () => {
  test.beforeEach(async ({ page }) => { await open(page, target, { direction: 'tech', theme: 'light' }); });
  const stars = (page) => page.locator('#rating-visit .v-rating-input-star');
  const filled = (page) => stars(page).evaluateAll((els) => els.map((e) => getComputedStyle(e.querySelector('.v-icon')).fill !== 'none'));

  test('every star up to the checked one is filled', async ({ page }) => {
    expect(await filled(page)).toEqual([true, true, true, true, false]);
  });

  test('arrow keys change the choice like any radio group, and the fill and focus ring follow', async ({ page }) => {
    await page.locator('#rating-visit input[value="4"]').focus();
    await page.keyboard.press('ArrowLeft');
    await expect(page.locator('#rating-visit input[value="3"]')).toBeChecked();
    expect(await filled(page)).toEqual([true, true, true, false, false]);
    expect(await stars(page).nth(2).evaluate((el) => getComputedStyle(el).outlineStyle)).toBe('solid');
  });

  test('hover previews without changing the value; each radio has words', async ({ page }) => {
    await stars(page).nth(1).hover();
    expect(await filled(page)).toEqual([true, true, false, false, false]);
    await expect(page.locator('#rating-visit input[value="4"]')).toBeChecked();
    await expect(page.locator('#rating-visit input[value="2"]')).toHaveAccessibleName('2 stars');
  });

  test('a click picks a value and the form gets it', async ({ page }) => {
    await stars(page).nth(4).click();
    await expect(page.locator('#rating-visit input[value="5"]')).toBeChecked();
    expect(await filled(page)).toEqual([true, true, true, true, true]);
  });
});

test.describe('one-time code', () => {
  test.use({ viewport: { width: 390, height: 844 } });
  test.beforeEach(async ({ page }) => { await open(page, target, { direction: 'tech', theme: 'light' }); });
  const input = (page) => page.locator('#otp-code');

  test('is one ordinary field the browser can autofill', async ({ page }) => {
    await expect(input(page)).toHaveAttribute('autocomplete', 'one-time-code');
    await expect(input(page)).toHaveAttribute('inputmode', 'numeric');
    await expect(input(page)).toHaveAccessibleName('Verification code');
  });

  test('the boxes never scroll away from the digits, even with the caret after the last one', async ({ page }) => {
    await input(page).focus();
    await page.keyboard.type('482719');
    const wrap = page.locator('#otp .v-otp');
    expect(await wrap.evaluate((el) => el.scrollLeft)).toBe(0);
    expect(await input(page).evaluate((el) => el.scrollLeft)).toBe(0);
    // Six 2.75rem boxes and five 0.5rem gaps: 6 x 44 + 5 x 8 = 304 px.
    expect(Math.abs((await wrap.boundingBox()).width - 304)).toBeLessThan(2);
  });

  test('a pasted code fills it, the pattern decides validity, and maxlength stops a seventh digit', async ({ page }) => {
    await input(page).fill('48271');
    expect(await input(page).evaluate((el) => el.validity.valid)).toBe(false);
    await input(page).fill('482719');
    expect(await input(page).evaluate((el) => el.validity.valid)).toBe(true);
    await input(page).focus();
    await page.keyboard.type('5');
    await expect(input(page)).toHaveValue('482719');
  });
});

test.describe('carousel', () => {
  test.use({ viewport: { width: 1280, height: 900 } });
  test.beforeEach(async ({ page }) => {
    await open(page, target, { direction: 'tech', theme: 'light' });
    await expect(page.locator('#carousel-quotes[data-ready]')).toBeAttached();
  });
  const track = (page) => page.locator('#carousel-quotes .v-carousel-track');
  const offset = (page) => track(page).evaluate((el) => Math.abs(el.scrollLeft));

  test('shows its buttons, labels slides, and starts with previous disabled', async ({ page }) => {
    await expect(page.locator('#carousel-quotes .v-carousel-controls')).toBeVisible();
    await expect(page.locator('#carousel-quotes [data-v-carousel-prev]')).toBeDisabled();
    await expect(page.locator('#carousel-quotes .v-carousel-slide').nth(1)).toHaveAttribute('aria-label', '2 of 5');
  });

  test('next moves exactly one slide, and the last press disables next', async ({ page }) => {
    const slide = await page.locator('#carousel-quotes .v-carousel-slide').first().boundingBox();
    await page.locator('#carousel-quotes [data-v-carousel-next]').click();
    await expect.poll(() => offset(page)).toBeGreaterThan(slide.width * 0.9);
    expect(await offset(page)).toBeLessThan(slide.width * 1.3);
    // Step to the end, waiting for each scroll to land before reading the button again.
    const next = page.locator('#carousel-quotes [data-v-carousel-next]');
    for (let i = 0; i < 4 && (await next.isEnabled()); i += 1) {
      const before = await offset(page);
      await next.click();
      await expect.poll(() => offset(page)).toBeGreaterThan(before);
      await page.evaluate(() => new Promise(requestAnimationFrame));
    }
    await expect(page.locator('#carousel-quotes [data-v-carousel-next]')).toBeDisabled();
    await expect(page.locator('#carousel-quotes [data-v-carousel-prev]')).toBeEnabled();
  });

  test('right to left: next still moves forward, and the page never scrolls sideways', async ({ page }) => {
    await page.evaluate(() => { document.documentElement.dir = 'rtl'; });
    await page.locator('#carousel-quotes [data-v-carousel-next]').click();
    await expect.poll(() => offset(page)).toBeGreaterThan(100);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });

  test('a phone shows one slide and a peek of the next', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const [t, s] = [await track(page).boundingBox(), await page.locator('#carousel-quotes .v-carousel-slide').first().boundingBox()];
    expect(s.width / t.width).toBeGreaterThan(0.8);
    expect(s.width / t.width).toBeLessThan(0.95);
  });
});

test.describe('carousel without JS', () => {
  test.use({ javaScriptEnabled: false });

  test('the buttons stay hidden and the track still scrolls', async ({ page }) => {
    await page.goto(target.path);
    await expect(page.locator('#carousel-quotes .v-carousel-controls')).toBeHidden();
    expect(await page.locator('#carousel-quotes .v-carousel-track').evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(true);
  });
});

test('carousel: three slides per view on a wide page, set by the carousel width', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await open(page, target, { direction: 'tech', theme: 'light' });
  const [t, s] = [await page.locator('#carousel-quotes .v-carousel-track').boundingBox(), await page.locator('#carousel-quotes .v-carousel-slide').first().boundingBox()];
  expect(t.width / s.width).toBeGreaterThan(2.8);
  expect(t.width / s.width).toBeLessThan(3.3);
});

test.describe('marquee with motion allowed', () => {
  test.use({ viewport: { width: 1280, height: 900 }, reducedMotion: 'no-preference' });
  test.beforeEach(async ({ page }) => {
    await open(page, target, { direction: 'tech', theme: 'light' });
    await expect(page.locator('#marquee-clients[data-ready]')).toBeAttached();
  });
  const track = (page) => page.locator('#marquee-clients .v-marquee-track');

  test('copies the items once, hidden from assistive tech, and animates in one line', async ({ page }) => {
    await expect(track(page).locator('> li')).toHaveCount(14);
    await expect(track(page).locator('> li[aria-hidden="true"][inert]')).toHaveCount(7);
    expect(await track(page).evaluate((el) => getComputedStyle(el).animationName)).toBe('v-marquee');
    const tops = new Set(await track(page).locator('> li').evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().top))));
    expect(tops.size).toBe(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });

  test('half the track width is exactly one full set, so the loop is seamless', async ({ page }) => {
    const [w, firstCopy, first] = await track(page).evaluate((el) => {
      const items = el.querySelectorAll(':scope > li');
      return [el.getBoundingClientRect().width, items[7].getBoundingClientRect().left, items[0].getBoundingClientRect().left];
    });
    expect(Math.abs(firstCopy - first - w / 2)).toBeLessThan(1.5);
  });

  test('the button pauses and restarts it, and says which', async ({ page }) => {
    const button = page.locator('#marquee-clients .v-marquee-toggle');
    await expect(button).toBeVisible();
    await button.click();
    await expect(button).toHaveText('Play');
    await page.mouse.move(5, 5);
    expect(await track(page).evaluate((el) => getComputedStyle(el).animationPlayState)).toBe('paused');
    await button.click();
    await page.mouse.move(5, 5);
    await expect(button).toHaveText('Pause');
    expect(await track(page).evaluate((el) => getComputedStyle(el).animationPlayState)).toBe('running');
  });
});

test.describe('marquee with reduced motion', () => {
  test('is a still row of each item once, with no button', async ({ page }) => {
    await open(page, target, { direction: 'tech', theme: 'light' });
    await expect(page.locator('#marquee-clients[data-ready]')).toBeAttached();
    await expect(page.locator('#marquee-clients .v-marquee-toggle')).toBeHidden();
    await expect(page.locator('#marquee-clients .v-marquee-track > li:visible')).toHaveCount(7);
    expect(await page.locator('#marquee-clients .v-marquee-track').evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
  });
});

test.describe('video, click to load', () => {
  test('nothing is fetched from the player until the click, which swaps in a titled, focused iframe', async ({ page }) => {
    const requested = [];
    page.on('request', (r) => { if (r.url().includes('player.html')) requested.push(r.url()); });
    await open(page, target, { direction: 'tech', theme: 'light' });
    await expect(page.locator('#video iframe')).toHaveCount(0);
    expect(requested).toEqual([]);
    await page.locator('#video-tour').click();
    const frame = page.locator('#video iframe');
    await expect(frame).toHaveAttribute('title', 'Northwind product tour');
    await expect(frame).toBeFocused();
    expect(requested.length).toBe(1);
    await expect(page.frameLocator('#video iframe').locator('h1')).toHaveText('The video plays here');
    const box = await page.locator('#video .v-video').boundingBox();
    expect(box.width / box.height).toBeCloseTo(16 / 9, 1);
  });

  test('a file URL becomes a native video with controls', async ({ page }) => {
    await open(page, target, { direction: 'tech', theme: 'light' });
    await page.locator('#video-tour').evaluate((el) => { el.dataset.vVideo = '../shared/media/missing.mp4'; });
    await page.locator('#video-tour').click();
    await expect(page.locator('#video video[controls]')).toHaveAttribute('aria-label', 'Northwind product tour');
  });
});

test.describe('video without JS', () => {
  test.use({ javaScriptEnabled: false });

  test('the poster is a link to the video', async ({ page }) => {
    await page.goto(target.path);
    await page.locator('#video-tour').click();
    await expect(page).toHaveURL(/player\.html$/);
  });
});

test.describe('tag input', () => {
  test.beforeEach(async ({ page }) => {
    await open(page, target, { direction: 'tech', theme: 'light' });
    await expect(page.locator('#tags-skills-box[data-ready]')).toBeAttached();
  });
  const tags = (page) => page.locator('#tags-skills-box .v-tag').evaluateAll((els) => els.map((e) => e.firstChild.textContent));
  const hidden = (page) => page.locator('#tags-skills-box input[type="hidden"][name="skills"]');

  test('turns the server value into tags and keeps the same form value', async ({ page }) => {
    expect(await tags(page)).toEqual(['Roofing', 'Guttering', 'Chimney repair']);
    await expect(hidden(page)).toHaveValue('Roofing,Guttering,Chimney repair');
    await expect(page.locator('#tags-skills')).not.toHaveAttribute('name', /.*/);
  });

  test('Enter and comma add, duplicates are skipped, and each change is announced', async ({ page }) => {
    const input = page.locator('#tags-skills');
    await input.fill('Flat roofs');
    await input.press('Enter');
    await input.fill('roofing');
    await input.press(',');
    await input.type('Fascias,');
    expect(await tags(page)).toEqual(['Roofing', 'Guttering', 'Chimney repair', 'Flat roofs', 'Fascias']);
    await expect(page.locator('[aria-live="polite"]').last()).toHaveText('Fascias added');
  });

  test('Backspace in the empty field and the remove buttons take tags away', async ({ page }) => {
    const input = page.locator('#tags-skills');
    await input.focus();
    await page.keyboard.press('Backspace');
    expect(await tags(page)).toEqual(['Roofing', 'Guttering']);
    await page.getByRole('button', { name: 'Remove Roofing' }).click();
    expect(await tags(page)).toEqual(['Guttering']);
    await expect(input).toBeFocused();
    await expect(hidden(page)).toHaveValue('Guttering');
  });

  test('a pasted list adds each item', async ({ page, browserName }) => {
    // Firefox drops clipboardData passed to the ClipboardEvent constructor, so a scripted paste is empty there.
    test.skip(browserName === 'firefox', 'synthetic paste carries no data in Firefox');
    await page.locator('#tags-skills').focus();
    await page.evaluate(() => {
      const dt = new DataTransfer();
      dt.setData('text', 'Soffits, Leadwork, Velux');
      document.getElementById('tags-skills').dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
    });
    expect(await tags(page)).toEqual(['Roofing', 'Guttering', 'Chimney repair', 'Soffits', 'Leadwork', 'Velux']);
  });

  test('a half-typed value is kept on leaving, and data-max caps the count', async ({ page }) => {
    const input = page.locator('#tags-skills');
    await input.fill('Slating');
    await page.locator('#tag-input h2').click();
    expect(await tags(page)).toEqual(['Roofing', 'Guttering', 'Chimney repair', 'Slating']);
    await input.fill('Ridge, Valleys, Moss, Lead, Felt, Vents');
    await input.press('Enter');
    expect((await tags(page)).length).toBe(8);
  });
});

test.describe('tag input without JS', () => {
  test.use({ javaScriptEnabled: false });

  test('is a plain comma-separated field', async ({ page }) => {
    await page.goto(target.path);
    await expect(page.locator('#tags-skills')).toHaveValue('Roofing, Guttering, Chimney repair');
    await expect(page.locator('#tags-skills')).toHaveAttribute('name', 'skills');
  });
});

test.describe('combobox', () => {
  test.beforeEach(async ({ page }) => {
    await open(page, target, { direction: 'tech', theme: 'light' });
    await expect(page.locator('#cb-town[role="combobox"]')).toBeAttached();
  });
  const input = (page) => page.locator('#cb-town');
  const options = (page) => page.locator('#cb-town-box [role="option"]');
  const active = (page) => page.locator('#cb-town-box [role="option"][aria-selected="true"]');

  test('takes over from the datalist and filters as you type, ignoring case and accents', async ({ page }) => {
    await expect(input(page)).not.toHaveAttribute('list', /.*/);
    await input(page).fill('bal');
    await expect(options(page)).toHaveText(['BallinasloeCo. Galway', 'BallinaCo. Mayo']);
    await expect(options(page).first().locator('mark')).toHaveText('Bal');
    await expect(input(page)).toHaveAttribute('aria-expanded', 'true');
    await input(page).fill('dun');
    await expect(options(page)).toHaveCount(1);
    await expect(options(page)).toContainText('Dún Laoghaire');
  });

  test('arrow keys move the highlight and wrap, Enter puts the option in the input', async ({ page }) => {
    await input(page).fill('mayo');
    await page.keyboard.press('ArrowDown');
    await expect(active(page)).toContainText('Castlebar');
    expect(await input(page).getAttribute('aria-activedescendant')).toBe(await active(page).getAttribute('id'));
    await page.keyboard.press('ArrowUp');
    await expect(active(page)).toContainText('Claremorris');
    const chosen = page.evaluate(() => new Promise((r) => document.getElementById('cb-town-box').addEventListener('v:select', (e) => r(e.detail.value), { once: true })));
    await page.keyboard.press('Enter');
    await expect(input(page)).toHaveValue('Claremorris');
    expect(await chosen).toBe('Claremorris');
    await expect(page.locator('#cb-town-box [role="listbox"]')).toBeHidden();
    await expect(input(page)).toHaveAttribute('aria-expanded', 'false');
  });

  test('a click picks an option; Escape closes, a second Escape clears; free text stays', async ({ page }) => {
    await input(page).fill('we');
    await options(page).filter({ hasText: 'Westport' }).click();
    await expect(input(page)).toHaveValue('Westport');
    await expect(input(page)).toBeFocused();
    await input(page).fill('Oranmore');
    await expect(page.locator('#cb-town-box .v-combobox-empty')).toHaveText('No matches');
    await page.keyboard.press('Escape');
    await expect(input(page)).toHaveValue('Oranmore');
    await page.keyboard.press('Escape');
    await expect(input(page)).toHaveValue('');
  });

  test('ArrowDown on an empty field opens the whole list', async ({ page }) => {
    await input(page).focus();
    await page.keyboard.press('ArrowDown');
    await expect(options(page)).toHaveCount(11);
    await expect(active(page)).toContainText('Tuam');
  });
});

test.describe('multi-step form', () => {
  test.use({ viewport: { width: 1280, height: 900 } });
  test.beforeEach(async ({ page }) => {
    await open(page, target, { direction: 'tech', theme: 'light' });
    await expect(page.locator('#wizard-quote [data-v-wizard-next]')).toBeVisible();
  });
  const step = (page, n) => page.locator(`#wizard-step-${n}`);
  const marks = (page) => page.locator('#wizard-quote .v-step');

  test('shows the first step only, with the indicator on it and no Back or submit yet', async ({ page }) => {
    await expect(step(page, 1)).toBeVisible();
    await expect(step(page, 2)).toBeHidden();
    await expect(marks(page).nth(0)).toHaveAttribute('aria-current', 'step');
    await expect(page.locator('#wizard-quote [data-v-wizard-back]')).toBeHidden();
    await expect(page.locator('#wizard-quote [type="submit"]')).toBeHidden();
    expect(await step(page, 3).evaluate((el) => el.disabled)).toBe(true);
  });

  test('Continue checks the step: a missing answer stays put and shows the summary', async ({ page }) => {
    await page.locator('#wizard-quote [data-v-wizard-next]').click();
    await expect(step(page, 1)).toBeVisible();
    await expect(page.locator('#wizard-quote .v-error-summary')).toBeFocused();
    await expect(page.locator('#wz-job')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#wizard-quote .v-error-summary a')).toHaveCount(1); // later steps are not checked yet
  });

  test('moving on marks the step done, focuses the new title, and Back returns without checking', async ({ page }) => {
    await page.locator('#wz-job').selectOption('New roof');
    await page.locator('#wizard-quote [data-v-wizard-next]').click();
    await expect(step(page, 2)).toBeVisible();
    await expect(step(page, 2)).toBeFocused();
    await expect(step(page, 2)).toHaveAccessibleName('Where is it?');
    await expect(marks(page).nth(0)).toHaveClass(/v-step-complete/);
    await expect(marks(page).nth(0)).toContainText('Completed:');
    await expect(marks(page).nth(1)).toHaveAttribute('aria-current', 'step');
    await page.locator('#wizard-quote [data-v-wizard-back]').click();
    await expect(step(page, 1)).toBeVisible();
    await expect(page.locator('#wz-job')).toHaveValue('New roof');
  });

  test('Enter in a field acts as Continue, and the last step submits everything', async ({ page }) => {
    await page.locator('#wz-job').selectOption('Roof repair');
    await page.locator('#wizard-quote [data-v-wizard-next]').click();
    await page.locator('#wz-town').fill('Tuam');
    await page.locator('#wz-town').press('Enter');
    await expect(step(page, 3)).toBeVisible();
    await expect(page.locator('#wizard-quote [type="submit"]')).toBeVisible();
    await page.locator('#wz-name').fill('Florin');
    await page.locator('#wz-phone').fill('087 000 0000');
    const data = await page.locator('#wizard-quote').evaluate((form) => Object.fromEntries(new FormData(form)));
    expect(data).toMatchObject({ job: 'Roof repair', town: 'Tuam', name: 'Florin', phone: '087 000 0000' });
  });
});

test.describe('multi-step form without JS', () => {
  test.use({ javaScriptEnabled: false });

  test('every step shows, with the submit button and no Back or Continue', async ({ page }) => {
    await page.goto(target.path);
    for (const n of [1, 2, 3]) await expect(page.locator(`#wizard-step-${n}`)).toBeVisible();
    await expect(page.locator('#wizard-quote [data-v-wizard-next]')).toBeHidden();
    await expect(page.locator('#wizard-quote [type="submit"]')).toBeVisible();
  });
});

test.describe('charts', () => {
  test.use({ viewport: { width: 1280, height: 900 } });
  test.beforeEach(async ({ page }) => { await open(page, target, { direction: 'tech', theme: 'light' }); });

  test('the bar chart is a real table, and bar lengths follow the values', async ({ page }) => {
    const table = page.getByRole('table', { name: 'Leads by source this quarter' });
    await expect(table.getByRole('row')).toHaveCount(6);
    await expect(table.getByRole('rowheader', { name: 'Referrals' })).toBeVisible();
    const widths = await page.locator('#chart-bars .v-chart-bar').evaluateAll((els) => els.map((e) => e.getBoundingClientRect().width));
    expect(widths[1] / widths[0]).toBeCloseTo(0.62, 1);
    expect(widths).toEqual([...widths].sort((a, b) => b - a));
  });

  test('columns grow from the baseline in proportion, with each value in text', async ({ page }) => {
    const cols = await page.locator('#chart-columns .v-chart-col').evaluateAll((els) => els.map((e) => { const r = e.getBoundingClientRect(); return [r.height, Math.round(r.bottom)]; }));
    expect(cols[5][0] / cols[0][0]).toBeCloseTo(100 / 35, 0);
    expect(new Set(cols.map((c) => c[1])).size).toBe(1);
    await expect(page.locator('#chart-columns li').nth(3)).toContainText('Apr: 32 jobs');
  });

  test('the donut is an image with the numbers in its name and in the legend', async ({ page }) => {
    await expect(page.getByRole('img', { name: /roofing 45%, gutters 27%/ })).toBeVisible();
    await expect(page.locator('#chart-donut .v-chart-legend li')).toHaveCount(4);
    const bg = await page.locator('#chart-donut .v-donut').evaluate((el) => getComputedStyle(el, '::before').backgroundImage);
    expect(bg).toContain('conic-gradient');
  });

  test('lines keep a 2px stroke however the SVG stretches', async ({ page }) => {
    const stroke = await page.locator('#chart-line polyline').first().evaluate((el) => getComputedStyle(el).vectorEffect);
    expect(stroke).toBe('non-scaling-stroke');
    await page.setViewportSize({ width: 390, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
});

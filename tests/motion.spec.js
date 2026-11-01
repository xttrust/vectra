import { test, expect } from '@playwright/test';
import { PAGES, open } from './helpers.js';

// Motion (v2.1): scroll progress bar, back-to-top progress ring, scroll reveals and page transitions.
const gallery = PAGES.find((p) => p.name === 'plus-content');
const progress = (page, sel) => page.locator(sel).evaluate((el) => parseFloat(getComputedStyle(el).getPropertyValue('--v-scroll-p')));

test.describe('scroll progress', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('the bar is empty at the top, about half way at the middle, and full at the end', async ({ page }) => {
    await open(page, gallery, { direction: 'tech', theme: 'light' });
    expect(await progress(page, '.v-scroll-progress')).toBeLessThan(0.02);
    await page.evaluate(() => window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) / 2));
    await expect.poll(() => progress(page, '.v-scroll-progress')).toBeGreaterThan(0.4);
    expect(await progress(page, '.v-scroll-progress')).toBeLessThan(0.6);
    const fill = await page.locator('.v-scroll-progress').evaluate((el) => getComputedStyle(el, '::before').scale);
    expect(parseFloat(fill)).toBeGreaterThan(0.4);
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await expect.poll(() => progress(page, '.v-scroll-progress')).toBeGreaterThan(0.98);
  });

  test('the back-to-top ring follows the same progress', async ({ page }) => {
    await open(page, PAGES.find((p) => p.name === 'plus'), { direction: 'tech', theme: 'light' });
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await expect.poll(() => progress(page, '.v-back-to-top-progress')).toBeGreaterThan(0.98);
    const ring = await page.locator('.v-back-to-top-progress').evaluate((el) => getComputedStyle(el, '::before').backgroundImage);
    expect(ring).toContain('conic-gradient');
  });
});

test.describe('scroll reveal with motion allowed', () => {
  test.use({ viewport: { width: 1280, height: 800 }, reducedMotion: 'no-preference' });

  test('a section below the fold waits, then reveals as it scrolls into view', async ({ page, browserName }) => {
    test.skip(browserName === 'firefox', 'Firefox has no view timelines; there the content simply shows');
    await open(page, gallery, { direction: 'tech', theme: 'light' });
    const card = page.locator('#reveal-left');
    expect(Number(await card.evaluate((el) => getComputedStyle(el).opacity))).toBeLessThan(0.5);
    await card.evaluate((el) => el.scrollIntoView({ block: 'center' }));
    await expect.poll(() => card.evaluate((el) => Number(getComputedStyle(el).opacity))).toBeGreaterThan(0.95);
  });
});

test.describe('scroll reveal with reduced motion', () => {
  test('nothing is hidden or animated', async ({ page }) => {
    await open(page, gallery, { direction: 'tech', theme: 'light' });
    expect(await page.locator('#reveal-left').evaluate((el) => [getComputedStyle(el).opacity, getComputedStyle(el).animationName])).toEqual(['1', 'none']);
  });
});

test('page transitions: example pages opt in with vectra.transitions.css, which is off under reduced motion', async ({ page }) => {
  await page.goto('/examples/pages/features.html');
  const css = await page.evaluate(() => fetch('/src/css/vectra.transitions.css').then((r) => r.text()));
  expect(css).toMatch(/@media \(prefers-reduced-motion: no-preference\)\s*\{\s*@view-transition/);
  await expect(page.locator('link[href$="vectra.transitions.css"]')).toHaveCount(1);
});

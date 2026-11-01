import { test, expect } from '@playwright/test';
import { PAGES, open } from './helpers.js';

const target = PAGES.find((p) => p.name === 'layout');
const box = (page, selector) => page.locator(selector).boundingBox();

test.describe('layout primitives at desktop width', () => {
  test.use({ viewport: { width: 1280, height: 900 } });
  test.beforeEach(async ({ page }) => { await open(page, target, { direction: 'tech', theme: 'light' }); });

  test('sidebar sits beside the content', async ({ page }) => {
    const [side, content] = [await box(page, '#demo-sidebar > :first-child'), await box(page, '#demo-sidebar > :last-child')];
    expect(Math.abs(side.y - content.y)).toBeLessThan(2);
    expect(content.width).toBeGreaterThan(side.width);
  });

  test('switcher keeps its items in one row', async ({ page }) => {
    const tops = await page.locator('#demo-switcher > *').evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().top)));
    expect(new Set(tops).size).toBe(1);
  });

  test('grid fits several columns', async ({ page }) => {
    const tops = await page.locator('#demo-grid > *').evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().top)));
    expect(tops.filter((t) => t === tops[0]).length).toBeGreaterThanOrEqual(3);
  });

  test('bento spans follow the 12-column grid', async ({ page }) => {
    const [eight, four] = [await box(page, '#demo-bento .v-span-8'), await box(page, '#demo-bento .v-span-4')];
    expect(Math.abs(eight.y - four.y)).toBeLessThan(2);
    expect(eight.width / four.width).toBeGreaterThan(1.8);
  });

  test('hide-mobile shows, hide-desktop hides', async ({ page }) => {
    await expect(page.locator('.v-hide-mobile')).toBeVisible();
    await expect(page.locator('.v-hide-desktop')).toBeHidden();
  });
});

test.describe('layout primitives at phone width', () => {
  test.use({ viewport: { width: 390, height: 844 } });
  test.beforeEach(async ({ page }) => { await open(page, target, { direction: 'tech', theme: 'light' }); });

  test('sidebar stacks above the content', async ({ page }) => {
    const [side, content] = [await box(page, '#demo-sidebar > :first-child'), await box(page, '#demo-sidebar > :last-child')];
    expect(content.y).toBeGreaterThan(side.y + side.height - 1);
  });

  test('switcher stacks all items', async ({ page }) => {
    const tops = await page.locator('#demo-switcher > *').evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().top)));
    expect(new Set(tops).size).toBe(3);
  });

  test('grid falls back to one column', async ({ page }) => {
    const lefts = await page.locator('#demo-grid > *').evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().left)));
    expect(new Set(lefts).size).toBe(1);
  });

  test('bento items go full width', async ({ page }) => {
    const [eight, four] = [await box(page, '#demo-bento .v-span-8'), await box(page, '#demo-bento .v-span-4')];
    expect(Math.abs(eight.width - four.width)).toBeLessThan(2);
  });

  test('hide-desktop shows, hide-mobile hides', async ({ page }) => {
    await expect(page.locator('.v-hide-desktop')).toBeVisible();
    await expect(page.locator('.v-hide-mobile')).toBeHidden();
  });
});

test('hidden beats display utilities', async ({ page }) => {
  await open(page, target, {});
  await expect(page.locator('#demo-hidden')).toBeHidden();
});

test('reduced motion switches off transitions and shortens animations', async ({ page }) => {
  await open(page, target, {});
  const durations = await page.evaluate(() => {
    const el = document.body.appendChild(Object.assign(document.createElement('div'), { style: 'transition: opacity 2s; animation: x 3s infinite' }));
    const cs = getComputedStyle(el);
    return [parseFloat(cs.transitionDuration), parseFloat(cs.animationDuration), cs.animationIterationCount];
  });
  expect(durations[0]).toBe(0);
  expect(durations[1]).toBeLessThan(0.001);
  expect(durations[2]).toBe('1');
});

test.describe('v2.1 utilities', () => {
  test.use({ viewport: { width: 1280, height: 900 } });
  test.beforeEach(async ({ page }) => { await open(page, target, { direction: 'tech', theme: 'light' }); });

  test('aspect ratios hold their shape', async ({ page }) => {
    const [square, video] = [await box(page, '#demo-square'), await box(page, '#demo-video')];
    expect(Math.abs(square.width - square.height)).toBeLessThan(1);
    expect(video.width / video.height).toBeCloseTo(16 / 9, 1);
  });

  test('line clamp stops at two lines', async ({ page }) => {
    const lines = await page.locator('#demo-clamp').evaluate((el) => el.clientHeight / parseFloat(getComputedStyle(el).lineHeight));
    expect(Math.round(lines)).toBe(2);
  });

  test('divide draws a border between children only', async ({ page }) => {
    const widths = await page.locator('#demo-divide > li').evaluateAll((els) => els.map((e) => getComputedStyle(e).borderBlockStartWidth));
    expect(widths[0]).toBe('0px');
    expect(widths.slice(1).every((w) => w !== '0px')).toBe(true);
  });

  test('container helpers follow the container, not the viewport', async ({ page }) => {
    const host = page.locator('#demo-wide-only').locator('..');
    await host.evaluate((el) => { el.style.inlineSize = '20rem'; });
    await expect(page.locator('#demo-narrow-only')).toBeVisible();
    await expect(page.locator('#demo-wide-only')).toBeHidden();
    await host.evaluate((el) => { el.style.inlineSize = '40rem'; });
    await expect(page.locator('#demo-wide-only')).toBeVisible();
    await expect(page.locator('#demo-narrow-only')).toBeHidden();
  });

  test('snap row scrolls sideways without widening the page', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const row = await page.locator('#demo-snap').evaluate((el) => [el.scrollWidth > el.clientWidth, getComputedStyle(el).scrollSnapType]);
    expect(row[0]).toBe(true);
    expect(row[1]).toContain('x');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });

  test('sticky header stays at the top of its scroller', async ({ page }) => {
    const scroller = page.locator('#demo-sticky-box');
    await scroller.evaluate((el) => { el.scrollTop = 120; });
    const [outer, header] = [await scroller.boundingBox(), await box(page, '#demo-sticky')];
    expect(Math.abs(header.y - outer.y)).toBeLessThan(3);
  });
});

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

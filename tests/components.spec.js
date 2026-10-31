import { test, expect } from '@playwright/test';
import { PAGES, open } from './helpers.js';

const target = PAGES.find((p) => p.name === 'components');

// Stacked avatars: the next avatar (and its ring) must never cover the previous one's initials,
// even for the widest pairs, at every size. Measured against the real font.
test('avatar group never covers initials', async ({ page }) => {
  await open(page, target, { direction: 'tech', theme: 'light' });
  const gaps = await page.evaluate(() => ['v-avatar-sm', '', 'v-avatar-lg'].flatMap((size) => {
    const group = document.createElement('div');
    group.className = 'v-avatar-group';
    group.innerHTML = ['MW', 'WM', 'MM'].map((t) => `<span class="v-avatar ${size}">${t}</span>`).join('');
    document.querySelector('main').prepend(group);
    const avatars = [...group.children];
    return avatars.slice(0, -1).map((avatar, i) => {
      const ring = parseFloat(getComputedStyle(avatars[i + 1]).boxShadow.match(/(\d+(?:\.\d+)?)px\s*$/)?.[1] ?? 0);
      const text = document.createRange();
      text.selectNodeContents(avatar);
      return avatars[i + 1].getBoundingClientRect().left - ring - text.getBoundingClientRect().right;
    });
  }));
  for (const gap of gaps) expect(gap).toBeGreaterThanOrEqual(0);
});

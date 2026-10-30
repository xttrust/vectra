/* Direction and theme switcher for the token page. */
const root = document.documentElement;
const direction = document.getElementById('direction');
const theme = document.getElementById('theme');
const save = (key, value) => { try { localStorage.setItem(key, value); } catch { /* private mode */ } };

direction.value = root.dataset.direction || 'tech';
theme.value = root.dataset.theme || 'auto';

direction.addEventListener('change', () => {
  root.dataset.direction = direction.value;
  save('vectra-direction', direction.value);
});
theme.addEventListener('change', () => {
  if (theme.value === 'auto') delete root.dataset.theme;
  else root.dataset.theme = theme.value;
  save('vectra-theme', theme.value);
});

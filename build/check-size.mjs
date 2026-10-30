/* Fails when a built file goes over its gzipped budget. Writes a table to the GitHub job summary. */
import { readFile, readdir, appendFile } from 'node:fs/promises';
import { dirname, basename } from 'node:path';
import { gzipSync } from 'node:zlib';

const budgets = JSON.parse(await readFile('build/budgets.json', 'utf8'));
const kb = (n) => `${(n / 1024).toFixed(2)} KB`;
const rows = [];
let failed = false;

// Expands "dir/*.min.css" to every matching file in dir.
const expand = async (pattern) => {
  if (!pattern.includes('*')) return [pattern];
  const [prefix, suffix] = basename(pattern).split('*');
  const dir = dirname(pattern);
  return (await readdir(dir)).filter((f) => f.startsWith(prefix) && f.endsWith(suffix)).sort().map((f) => `${dir}/${f}`);
};

const checks = [];
for (const [pattern, limit] of Object.entries(budgets)) {
  if (pattern.startsWith('_')) continue;
  for (const file of await expand(pattern)) checks.push([file, limit]);
}

for (const [file, limit] of checks) {
  const size = gzipSync(await readFile(file), { level: 9 }).length;
  const ok = size <= limit;
  failed ||= !ok;
  rows.push(`| ${file} | ${kb(size)} | ${kb(limit)} | ${ok ? 'ok' : 'OVER'} |`);
}

const table = ['| File | Gzipped | Budget | |', '|---|---|---|---|', ...rows].join('\n');
console.log(table);
if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, `### Size budgets\n\n${table}\n`);
if (failed) {
  console.error('\nSize budget exceeded.');
  process.exit(1);
}

/* Token contract: every direction defines all required tokens, and nothing outside the contract
   (catches typos such as --v-acent). Primitives may only be overridden where listed as optional. */
import { readFile, readdir, appendFile } from 'node:fs/promises';

const contract = JSON.parse(await readFile('build/token-contract.json', 'utf8'));
const required = new Set(contract.required);
const allowed = new Set([...contract.required, ...contract.optional]);

const definedIn = (css) => new Set([...css.matchAll(/^\s*--v-([a-z0-9-]+)\s*:/gm)].map((m) => m[1]));
// Only the main direction rule counts towards "required"; @media overrides may add, never replace.
const mainBlock = (css) => css.split('@media')[0];

const files = (await readdir('src/css/directions')).filter((f) => f.endsWith('.css')).sort();
const rows = [];
let failed = false;

for (const file of files) {
  const css = await readFile(`src/css/directions/${file}`, 'utf8');
  const main = definedIn(mainBlock(css));
  const all = definedIn(css);
  const missing = [...required].filter((t) => !main.has(t));
  const unknown = [...all].filter((t) => !allowed.has(t));
  failed ||= missing.length > 0 || unknown.length > 0;
  rows.push(`| ${file} | ${main.size} | ${missing.join(', ') || 'none'} | ${unknown.join(', ') || 'none'} |`);
}

const table = ['| Direction | Tokens | Missing required | Not in contract |', '|---|---|---|---|', ...rows].join('\n');
console.log(table);
if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, `### Token contract\n\n${table}\n`);
if (failed) {
  console.error('\nToken contract broken. Fix the direction, or add the token to build/token-contract.json on purpose.');
  process.exit(1);
}

/* Builds the release zip from dist/ plus LICENSE, README.md and CHANGELOG.md: release/vectra-<version>.zip.
   Plain Node, no dependencies: entries are deflated with zlib and listed in a standard ZIP directory.
   Run after `npm run build`; `npm run release:zip` does both. */
import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { crc32, deflateRawSync } from 'node:zlib';

const { version } = JSON.parse(await readFile('package.json', 'utf8'));
const top = `vectra-${version}`;

async function files(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await files(path));
    else out.push(path);
  }
  return out;
}

try { await stat('dist/vectra.css'); } catch { throw new Error('dist/ is missing: run npm run build first'); }
const list = [...(await files('dist')).sort(), 'LICENSE', 'README.md', 'CHANGELOG.md'];

// DOS date and time for every entry: the build time, so the zip records when it was made.
const now = new Date();
const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | Math.floor(now.getSeconds() / 2);
const dosDate = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();

const locals = [];
const central = [];
let offset = 0;
for (const file of list) {
  const name = Buffer.from(`${top}/${relative('.', file).split('\\').join('/')}`);
  const data = await readFile(file);
  const packed = deflateRawSync(data, { level: 9 });
  const crc = crc32(data);
  const head = Buffer.alloc(30);
  head.writeUInt32LE(0x04034b50, 0); head.writeUInt16LE(20, 4); head.writeUInt16LE(0x0800, 6); head.writeUInt16LE(8, 8);
  head.writeUInt16LE(dosTime, 10); head.writeUInt16LE(dosDate, 12); head.writeUInt32LE(crc, 14);
  head.writeUInt32LE(packed.length, 18); head.writeUInt32LE(data.length, 22); head.writeUInt16LE(name.length, 26);
  locals.push(head, name, packed);
  const dir = Buffer.alloc(46);
  dir.writeUInt32LE(0x02014b50, 0); dir.writeUInt16LE(20, 4); dir.writeUInt16LE(20, 6); dir.writeUInt16LE(0x0800, 8); dir.writeUInt16LE(8, 10);
  dir.writeUInt16LE(dosTime, 12); dir.writeUInt16LE(dosDate, 14); dir.writeUInt32LE(crc, 16);
  dir.writeUInt32LE(packed.length, 20); dir.writeUInt32LE(data.length, 24); dir.writeUInt16LE(name.length, 28); dir.writeUInt32LE(offset, 42);
  central.push(dir, name);
  offset += head.length + name.length + packed.length;
}
const centralSize = central.reduce((n, b) => n + b.length, 0);
const end = Buffer.alloc(22);
end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(list.length, 8); end.writeUInt16LE(list.length, 10);
end.writeUInt32LE(centralSize, 12); end.writeUInt32LE(offset, 16);

await mkdir('release', { recursive: true });
const out = `release/${top}.zip`;
const zip = Buffer.concat([...locals, ...central, end]);
await writeFile(out, zip);
console.log(`${out}: ${list.length} files, ${(zip.length / 1024).toFixed(1)} KB`);

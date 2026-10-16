import { randomInt } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// Usage: node blind2.mjs <trial dir> <sealed dir> <arm>...; prints nothing about the answers.
const [dir, sealed, ...arms] = process.argv.slice(2);
if (!dir || !sealed || arms.length < 2) throw new Error('usage: node blind2.mjs <trial dir> <sealed dir> <arm>...');

for (let i = arms.length - 1; i > 0; i--) {
  const j = randomInt(i + 1);
  [arms[i], arms[j]] = [arms[j], arms[i]];
}

mkdirSync(join(dir, 'blind'), { recursive: true });
const labels = ['X', 'Y', 'Z'].slice(0, arms.length);
const map = [];
labels.forEach((label, i) => {
  const raw = readFileSync(join(dir, `arm-${arms[i]}-out.md`), 'utf8').replace(/\n?exit=\d+\s*$/, '\n');
  // Arms print progress chatter before their answer; the grader sees the answer from its first heading.
  const start = raw.search(/^#{1,3} /m);
  if (start === -1) throw new Error(`answer ${label} has no heading`);
  const text = raw.slice(start);
  if (text.trim().length < 200) throw new Error(`answer ${label} is too short to grade`);
  writeFileSync(join(dir, 'blind', `${label}.md`), text);
  map.push(`${label}=${arms[i]}`);
});
writeFileSync(join(sealed, 'arm-map.txt'), `${map.join('\n')}\n`);

let filled = readFileSync(join(dir, 'grader.md'), 'utf8').replace('{{KEY}}', join(sealed, 'key.md'));
for (const label of labels) filled = filled.replace(`{{${label}}}`, join(dir, 'blind', `${label}.md`));
if (filled.includes('{{')) throw new Error('grader prompt still has a placeholder');
writeFileSync(join(dir, 'grader-filled.md'), filled);
console.log(`${labels.length} blind copies and the grader prompt written; map sealed`);

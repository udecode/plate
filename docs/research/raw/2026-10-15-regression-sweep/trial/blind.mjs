import { randomInt } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));
const sealed = process.argv[2];
if (!sealed) throw new Error('usage: node blind.mjs <sealed dir>');

const arms = ['A', 'B', 'C'];
for (let i = arms.length - 1; i > 0; i--) {
  const j = randomInt(i + 1);
  [arms[i], arms[j]] = [arms[j], arms[i]];
}

mkdirSync(join(dir, 'blind'), { recursive: true });
const labels = ['X', 'Y', 'Z'];
const map = [];
labels.forEach((label, i) => {
  const raw = readFileSync(join(dir, `arm-${arms[i]}-out.md`), 'utf8')
    .replace(/\n?exit=\d+\s*$/, '\n');
  // Each arm printed progress chatter before its checklist; the grader sees the checklist only.
  const start = raw.search(/^# /m);
  if (start === -1) throw new Error(`arm ${arms[i]} answer has no top heading`);
  const text = raw.slice(start);
  if (text.trim().length < 200) throw new Error(`arm ${arms[i]} answer is too short to grade`);
  writeFileSync(join(dir, 'blind', `${label}.md`), text);
  map.push(`${label}=${arms[i]}`);
});
writeFileSync(join(sealed, 'arm-map.txt'), `${map.join('\n')}\n`);

const filled = readFileSync(join(dir, 'grader.md'), 'utf8')
  .replace('{{KEY}}', join(sealed, 'key.md'))
  .replace('{{X}}', join(dir, 'blind', 'X.md'))
  .replace('{{Y}}', join(dir, 'blind', 'Y.md'))
  .replace('{{Z}}', join(dir, 'blind', 'Z.md'));
if (filled.includes('{{')) throw new Error('grader prompt still has a placeholder');
writeFileSync(join(dir, 'grader-filled.md'), filled);
console.log('blind copies and grader prompt written; map sealed');

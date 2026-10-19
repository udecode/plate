import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// Splits the key writer's answer into fixture files and the sealed key without printing either.
const [answer, fixtureDir, sealedDir] = process.argv.slice(2);
if (!answer || !fixtureDir || !sealedDir) throw new Error('usage: node split.mjs <answer> <fixture dir> <sealed dir>');
const text = readFileSync(answer, 'utf8');
const parts = text.split(/^=== FILE: (.+?) ===\s*$/m).slice(1);
const files = new Map();
for (let i = 0; i < parts.length; i += 2) files.set(parts[i].trim(), parts[i + 1].replace(/\nseat: .*$/s, '').trim() + '\n');
const want = ['round-1.md', 'test-index.md', 'pages.md', 'key.md'];
const missing = want.filter((name) => !files.has(name));
if (missing.length) throw new Error(`answer lacks ${missing.join(', ')}`);
mkdirSync(fixtureDir, { recursive: true });
mkdirSync(sealedDir, { recursive: true });
for (const name of want) {
  const dir = name === 'key.md' ? sealedDir : fixtureDir;
  writeFileSync(join(dir, name), files.get(name));
  console.log(`${join(dir, name)} ${files.get(name).length} chars`);
}
const leaks = ['round-1.md', 'test-index.md', 'pages.md'].filter((name) =>
  /\b(trial|planted|expected answer|grader|correct)\b|\bkey\b/i.test(files.get(name))
);
console.log(leaks.length ? `fixture words to check: ${leaks.join(', ')}` : 'fixture holds none of the barred words');

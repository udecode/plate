import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));
const base = readFileSync(join(dir, 'arm-base.md'), 'utf8');
const lines = readFileSync(join(dir, 'arm-methods.md'), 'utf8').split('\n');

for (const arm of ['A', 'B', 'C']) {
  const line = lines.find((l) => l.startsWith(`${arm}: `));
  if (!line) throw new Error(`no method line for arm ${arm}`);
  const prompt = base.replace('{{METHOD}}', line.slice(3).trim());
  if (prompt.includes('{{')) throw new Error(`arm ${arm} prompt still has a placeholder`);
  writeFileSync(join(dir, `arm-${arm}-prompt.md`), prompt);
  console.log(`arm-${arm}-prompt.md ${prompt.length} chars`);
}

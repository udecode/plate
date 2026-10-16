import { randomInt } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Shuffles the runners into cand-1..3 for the cross-judge, dropping each answer's seat and exit lines.
const dir = dirname(fileURLToPath(import.meta.url));
const runners = ['opus', 'astra', 'sol'];
for (let i = runners.length - 1; i > 0; i--) {
  const j = randomInt(i + 1);
  [runners[i], runners[j]] = [runners[j], runners[i]];
}
mkdirSync(join(dir, 'judge'), { recursive: true });
const map = runners.map((runner, i) => {
  const raw = readFileSync(join(dir, `cand-${runner}.md`), 'utf8');
  const start = raw.search(/^#{1,3} /m);
  const text = raw
    .slice(start === -1 ? 0 : start)
    .replace(/\n(seat: .*|exit=\d+)\s*/g, '\n')
    .trimEnd();
  writeFileSync(join(dir, 'judge', `cand-${i + 1}.md`), `${text}\n`);
  return `cand-${i + 1}=${runner}`;
});
writeFileSync(join(dir, 'judge', 'map.txt'), `${map.join('\n')}\n`);
console.log('three blind candidates written; map in judge/map.txt');

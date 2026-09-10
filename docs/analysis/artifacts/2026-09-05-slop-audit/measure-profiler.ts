import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

import { profileEditableMutationDuration } from '../../../../packages/plitejs/src/react/editable/mutation-profiler';

const iterations = 1_000_000;
const expected = (iterations * (iterations - 1)) / 2;
const samples: { round: number; lane: string; ms: number; checksum: number }[] = [];

assert.equal(globalThis.__PLITE_REACT_RENDER_PROFILER__, undefined);

const direct = () => {
  let result = 0;
  for (let i = 0; i < iterations; i++) result += (() => i)();
  return result;
};
const profiled = () => {
  let result = 0;
  for (let i = 0; i < iterations; i++) {
    result += profileEditableMutationDuration('audit', () => i);
  }
  return result;
};

for (let i = 0; i < 5; i++) {
  assert.equal(direct(), expected);
  assert.equal(profiled(), expected);
}
for (let round = 0; round < 8; round++) {
  for (const lane of round % 2 === 0 ? ['direct', 'profiled'] : ['profiled', 'direct']) {
    const start = performance.now();
    const checksum = lane === 'direct' ? direct() : profiled();
    const ms = performance.now() - start;
    assert.equal(checksum, expected);
    samples.push({ round, lane, ms, checksum });
  }
}
const files = ['packages/plitejs/src/react/editable/mutation-profiler.ts', 'packages/plitejs/src/react/render-profiler.ts'];
const receipt = {
  runtime: Bun.version,
  iterations,
  samples,
  sha256: Object.fromEntries(files.map(file => [file, createHash('sha256').update(readFileSync(file)).digest('hex')])),
  limitation: 'Synthetic disabled-profiler diagnostic. JIT may inline or eliminate work. Not editor latency, browser allocation, or an end-to-end speedup estimate.',
};
writeFileSync(new URL('./profiler-measurements.json', import.meta.url), JSON.stringify(receipt, null, 2) + '\n');
console.log(JSON.stringify(receipt));

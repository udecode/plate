import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { isDeepStrictEqual } from 'node:util';

const root = resolve(import.meta.dir, '../../../..');
const file =
  'packages/plitejs/src/react/dom-strategy/use-virtualized-root-plan.ts';
const source = readFileSync(resolve(root, file), 'utf8');
const start = source.indexOf('const getMissingRanges =');
const end = source.indexOf('export const useVirtualizedRootPlan', start);
if (start < 0 || end < 0)
  throw new Error('Cannot identify the exact current owner');
const baselineSource = source.slice(start, end);
const candidateSource = baselineSource
  .replace(
    '    const nodeKeys = topLevelNodeKeys.slice(startIndex, endIndex + 1);',
    ''
  )
  .replace(
    'anchorNodeKey: nodeKeys[0] ?? null',
    'anchorNodeKey: topLevelNodeKeys[startIndex] ?? null'
  )
  .replace(
    'focusNodeKey: nodeKeys.at(-1) ?? null',
    'focusNodeKey: topLevelNodeKeys[endIndex] ?? null'
  )
  .replace('      nodeKeys,\n', '');
if (
  candidateSource.includes('nodeKeys,') ||
  candidateSource.includes('.slice(')
)
  throw new Error('Candidate patch did not remove the exact copy');
const transpiler = new Bun.Transpiler({ loader: 'ts' });
const compile = (code: string) =>
  new Function(`${transpiler.transformSync(code)}\nreturn getMissingRanges;`)();
const baseline = compile(baselineSource);
const candidate = compile(candidateSource);
const observed = (rows: any[]) =>
  rows.map(({ nodeKeys: _nodeKeys, ...boundary }) => boundary);
let seed = 97193;
const random = () =>
  (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296;
let cases = 0;
for (let test = 0; test < 1000; test++) {
  const count = Math.floor(random() * 300);
  const keys = Array.from({ length: count }, (_, i) => `node:${i}`);
  const mountedRanges = [];
  let index = 0;
  while (index < count) {
    index += Math.floor(random() * 10);
    if (index >= count) break;
    const endIndex = Math.min(count - 1, index + Math.floor(random() * 12));
    mountedRanges.push({ startIndex: index, endIndex });
    index = endIndex + 1 + Math.floor(random() * 10);
  }
  const input = { count, topLevelNodeKeys: keys, mountedRanges };
  if (!isDeepStrictEqual(observed(baseline(input)), candidate(input)))
    throw new Error(`Boundary mismatch in case ${test}`);
  cases++;
}
const percentile = (values: number[], percent: number) =>
  [...values].sort((a, b) => a - b)[Math.ceil(values.length * percent) - 1];
const measurements = [];
let sink = 0;
for (const count of [100, 1000, 10000, 100000]) {
  const input = {
    count,
    topLevelNodeKeys: Array.from({ length: count }, (_, i) => `node:${i}`),
    mountedRanges: [
      {
        startIndex: Math.floor(count / 2),
        endIndex: Math.min(count - 1, Math.floor(count / 2) + 30),
      },
    ],
  };
  const samples: Record<string, number[]> = { baseline: [], candidate: [] };
  for (let round = -3; round < 31; round++) {
    for (const name of round % 2
      ? ['baseline', 'candidate']
      : ['candidate', 'baseline']) {
      const fn = name === 'baseline' ? baseline : candidate;
      const began = performance.now();
      for (let operation = 0; operation < 100; operation++)
        sink += fn(input).length;
      const elapsed = performance.now() - began;
      if (round >= 0) samples[name].push(elapsed);
    }
  }
  measurements.push({
    count,
    callsPerSample: 100,
    baselineCopiedKeysPerCall: baseline(input).reduce(
      (sum: number, row: any) => sum + row.nodeKeys.length,
      0
    ),
    candidateCopiedKeysPerCall: 0,
    samples,
    summary: Object.fromEntries(
      Object.entries(samples).map(([name, values]) => [
        name,
        {
          n: values.length,
          p50: percentile(values, 0.5),
          p75: percentile(values, 0.75),
          p95: percentile(values, 0.95),
          max: Math.max(...values),
        },
      ])
    ),
  });
}
const report = {
  createdAt: new Date().toISOString(),
  source: file,
  sourceSha256: createHash('sha256').update(source).digest('hex'),
  currentSourceUnchanged: readFileSync(resolve(root, file), 'utf8') === source,
  baselineSource,
  candidateSource,
  cases,
  seed: 97193,
  sink,
  measurements,
  interpretation:
    'Disposable private-function experiment, not an adopted product change. Exact current source is extracted; comparison preserves the boundary payload consumed by EditableTextBlocks. It intentionally removes the unused nodeKeys field. Timing is for 100 plan calls, not scrolling/input/paint. Full view/native proof is a separate gate.',
};
writeFileSync(
  resolve(
    root,
    'docs/plans/artifacts/2026-09-09-editor-performance-research-iteration-2/virtual-boundaries-probe.json'
  ),
  JSON.stringify(report, null, 2) + '\n'
);
console.log(
  JSON.stringify({
    cases,
    measurements: measurements.map(
      ({ count, summary, baselineCopiedKeysPerCall }) => ({
        count,
        summary,
        baselineCopiedKeysPerCall,
      })
    ),
  })
);

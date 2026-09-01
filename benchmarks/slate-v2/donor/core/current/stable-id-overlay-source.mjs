import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { cpus, platform } from 'node:os';

import { createStableIdMappedSource } from '../../../../../packages/plitejs/src/react/stable-id-mapped-source.ts';
import { composeProjectionSources } from '../../../../../packages/plitejs/src/react/decoration-source.ts';
import { summarize, writeBenchmarkArtifact } from '../../shared/stats.mjs';

const sizes = (process.env.PLITE_OVERLAY_SOURCE_BENCH_SIZES ?? '100,1000,10000,100000')
  .split(',').map(Number);
assert.ok(sizes.every((size) => Number.isSafeInteger(size) && size > 0));
const sampleCount = Number(process.env.PLITE_OVERLAY_SOURCE_BENCH_SAMPLES ?? 15);
const warmupCount = Number(process.env.PLITE_OVERLAY_SOURCE_BENCH_WARMUPS ?? 3);
const strict = process.env.PLITE_OVERLAY_SOURCE_BENCH_STRICT === '1';
const frameBudgetMs = 16.67;
const wideBudgetMs = 100;
const measuredFiles = [
  'benchmarks/slate-v2/donor/core/current/stable-id-overlay-source.mjs',
  'packages/plitejs/src/react/stable-id-mapped-source.ts',
  'packages/plitejs/src/react/mapped-view-store.ts',
  'packages/plitejs/src/react/annotation-store.ts',
  'packages/plitejs/src/react/widget-store.ts',
  'packages/plitejs/src/react/decoration-source.ts',
  'pnpm-lock.yaml',
];
const fingerprints = () => Object.fromEntries(measuredFiles.map((file) => [
  file, createHash('sha256').update(readFileSync(file)).digest('hex'),
]));
const beforeFingerprints = fingerprints();

const measure = (size, layout, update) => {
  let revision = 0;
  let items = Array.from({ length: layout === 'wide-item' ? 1 : size }, (_, index) => ({
    id: layout === 'divergent-unicode' ? String.fromCodePoint(0x10000 + index) : 'item-' + index,
    value: 0,
  }));
  const start = performance.now();
  const source = createStableIdMappedSource(items, {
    getId: (item) => item.id,
    isEntityEqual: (left, right) => left.value === right.value,
    isItemEqual: (left, right) => left.value === right.value,
    isOutputEqual: Object.is,
    map: (item) => ({
      entity: item,
      outputs: layout === 'wide-item'
        ? Array.from({ length: size }, (_, index) => ({ key: 'bucket-' + index, value: item.value }))
        : [{ key: layout === 'shared' ? 'shared' : item.id, value: item.value }],
    }),
  });
  const coldMs = performance.now() - start;
  const samples = [];
  const maxWork = {};

  for (let iteration = 0; iteration < warmupCount + sampleCount; iteration += 1) {
    const index = (iteration * 7919) % items.length;
    const changed = update === 'all' ? items.map((item) => item.id) : [items[index].id];
    const previous = source.getSnapshot();
    const previousValue = previous.byId.get(items[index].id).value;
    revision += 1;
    if (update === 'all') {
      items = items.map((item) => ({ ...item, value: revision }));
    } else if (update === 'external') {
      items = items.map((item, itemIndex) => ({
        ...item, value: itemIndex === index ? revision : item.value,
      }));
    } else {
      items[index] = { ...items[index], value: revision };
    }
    const before = source.getWork();
    const startedAt = performance.now();
    const result = source.refresh(items, update === 'external' ? {} : { changedIds: changed });
    const duration = performance.now() - startedAt;
    assert.deepEqual(source.getIdsWithoutOutputs(), []);
    const after = source.getWork();

    for (const key of Object.keys(after)) {
      maxWork[key] = Math.max(maxWork[key] ?? 0, after[key] - before[key]);
    }
    assert.equal(result.fullFallback, false);
    assert.equal(result.changedEntityIds.length, changed.length);
    assert.equal(source.getSnapshot().byId.get(items[index].id).value, revision);
    assert.equal(previous.byId.get(items[index].id).value, previousValue);
    assert.equal(previous.allIds, source.getSnapshot().allIds);
    if (layout === 'wide-item') {
      assert.deepEqual(source.getSnapshot().byOutputKey['bucket-' + (size - 1)], [revision]);
    }
    if (iteration >= warmupCount) samples.push(duration);
  }

  let copiedOutputMemberships = 0;
  if (layout === 'shared' && update === 'all') {
    const NativeSet = globalThis.Set;
    const next = items.map(item => ({ ...item, value: revision + 1 }));
    globalThis.Set = new Proxy(NativeSet, {
      construct(target, args, constructor) {
        const input = args[0];
        if (Array.isArray(input) && input.length > 0 && input.every(key => key === 'shared')) copiedOutputMemberships += input.length;
        return Reflect.construct(target, args, constructor);
      },
    });
    try {
      source.refresh(next, { changedIds: next.map(item => item.id) });
    } finally {
      globalThis.Set = NativeSet;
    }
    assert.deepEqual(source.getSnapshot().byOutputKey.shared, Array(size).fill(revision + 1));
  }
  const changedCount = update === 'all' ? items.length : 1;
  const affectedOutputCount = layout === 'wide-item' || layout === 'shared' || update === 'all'
    ? size : 1;
  const summary = summarize(samples);
  const budgetMs = update === 'external' ? null
    : affectedOutputCount >= 10_000 ? wideBudgetMs : frameBudgetMs;
  const workPass = maxWork.entityCopies === changedCount &&
    maxWork.inputVisits === (update === 'external' ? size * 2 : changedCount) &&
    maxWork.unprojectedVisits === 0 &&
    maxWork.outputCandidateVisits <= affectedOutputCount * 2 &&
    maxWork.outputVisits <= affectedOutputCount * 2 &&
    maxWork.snapshotChildEntryCopies <= affectedOutputCount * 32 + 4096 &&
    maxWork.snapshotNodeCopies <= affectedOutputCount * 3 + 128 && copiedOutputMemberships === 0;

  return {
    affectedOutputCount,
    budgetMs,
    changedCount,
    coldBudgetMs: size >= 100_000 ? 2500 : 250,
    coldMs,
    copiedOutputMemberships,
    expectedComplexity: update === 'external'
      ? 'O(source items) comparison for an opaque recreated external snapshot; O(changed entities) publication'
      : 'O(changed ID bytes plus affected output memberships); bounded child-map copies and no unrelated entity copy or unresolved-ID scan',
    layout,
    maxWork,
    pass: workPass && (budgetMs === null || summary.p95 <= budgetMs) && coldMs <= (size >= 100_000 ? 2500 : 250),
    size,
    summary,
    update,
    workPass,
  };
};

const rows = [];
for (const size of sizes) {
  rows.push(measure(size, 'divergent-unicode', 'one'));
  Bun.gc(true);
  for (const update of ['one', 'external']) {
    rows.push(measure(size, 'distributed', update));
    Bun.gc(true);
  }
  if (size <= 10_000) {
    rows.push(measure(size, 'distributed', 'all'));
    rows.push(measure(size, 'wide-item', 'one'));
    rows.push(measure(size, 'shared', 'one'));
    rows.push(measure(size, 'shared', 'all'));
    Bun.gc(true);
  }
}

const composedSources = sizes.map((size) => {
  let enumerated = 0;
  let aggregateReads = 0;
  let runtimeReads = 0;
  const items = Array.from({ length: size }, (_, index) => ({ id: 'node-' + index, value: 0 }));
  const createSource = (input) => {
    const source = createStableIdMappedSource(input, {
      getId: (item) => item.id,
      isEntityEqual: Object.is,
      isItemEqual: Object.is,
      isOutputEqual: Object.is,
      map: (item) => ({ entity: item, outputs: [{ key: item.id, value: { data: item.value, end: 1, key: item.id, start: 0 } }] }),
    });
    let current;
    let snapshot;
    return { source, projection: {
      getRuntimeSnapshot(key) { runtimeReads++; return source.getSnapshot().byOutputKey[key] ?? []; },
      getSnapshot() {
        aggregateReads++;
        const next = source.getSnapshot().byOutputKey;
        if (next !== current) {
          current = next;
          snapshot = new Proxy(next, {
            ownKeys(target) { const keys = Reflect.ownKeys(target); enumerated += keys.length; return keys; },
          });
        }
        return snapshot;
      },
      subscribe: () => () => {},
    } };
  };
  const primary = createSource(items);
  const secondary = createSource(items.map((item) => ({ ...item })));
  const composed = composeProjectionSources([primary.projection, secondary.projection]);
  const unchanged = composed.getRuntimeSnapshot('node-' + (size - 1));
  const samples = [];
  let identityFailures = 0;
  for (let sample = 0; sample < sampleCount + warmupCount; sample++) {
    const previous = composed.getRuntimeSnapshot('node-0');
    items[0] = { id: 'node-0', value: sample + 1 };
    primary.source.refresh(items, { changedIds: ['node-0'] });
    const started = performance.now();
    const next = composed.getRuntimeSnapshot('node-0');
    const untouched = composed.getRuntimeSnapshot('node-' + (size - 1));
    const duration = performance.now() - started;
    assert.deepEqual(next.map((slice) => slice.data), [sample + 1, 0]);
    assert.deepEqual(previous.map((slice) => slice.data), [sample, 0]);
    if (untouched !== unchanged) identityFailures++;
    if (sample >= warmupCount) samples.push(duration);
  }
  const summary = summarize(samples);
  return { size, summary, counters: { aggregateReads, enumerated, identityFailures, runtimeReads }, pass: aggregateReads === 0 && enumerated === 0 && identityFailures === 0 && summary.p95 <= frameBudgetMs };
});
const afterFingerprints = fingerprints();
const sourceStable = JSON.stringify(beforeFingerprints) === JSON.stringify(afterFingerprints);
const pass = sourceStable && rows.every((row) => row.pass) && composedSources.every((row) => row.pass);
const artifact = {
  artifactVersion: 2,
  benchmark: 'plite-react-stable-id-overlay-source',
  config: { sampleCount, sizes, warmupCount },
  correctness: ['historical snapshot isolation', 'exact changed entities', 'stable source order', 'wide-item final bucket', 'empty unresolved set'],
  environment: { bun: Bun.version, cpu: cpus()[0]?.model, platform: platform() },
  pass,
  rows,
  composedSources,
  sourceIdentity: {
    after: afterFingerprints,
    before: beforeFingerprints,
    head: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    stable: sourceStable,
  },
  summary: {
    correctnessFailures: 0,
    maxTrustedOneIdP95Ms: Math.max(...rows.filter((row) => row.update === 'one' && ['distributed', 'divergent-unicode'].includes(row.layout)).map((row) => row.summary.p95)),
    redRows: rows.filter((row) => !row.pass).map((row) => row.layout + ':' + row.update + ':' + row.size),
    workPass: rows.every((row) => row.workPass) && composedSources.every((row) => row.pass),
  },
};
await writeBenchmarkArtifact('tmp/plite-stable-id-overlay-source-benchmark.json', artifact);
console.log('METRIC plite_mapped_source_trusted_one_id_p95_ms=' + artifact.summary.maxTrustedOneIdP95Ms);
console.log('METRIC plite_mapped_source_work_pass=' + Number(artifact.summary.workPass));
console.log('METRIC plite_composed_source_worst_p95_ms=' + Math.max(...composedSources.map((row) => row.summary.p95)));
console.log(JSON.stringify(artifact.summary));
if (strict && !pass) process.exitCode = 1;

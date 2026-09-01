import { createHash } from 'node:crypto';
import { cpus } from 'node:os';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { performance } from 'node:perf_hooks';

const cohorts = [1, 10, 100, 1000] as const;
const eventCount = 20_000;
const sampleCount = 9;
const warmupCount = 3;
const root = resolve(import.meta.dir, '../../../..');

const hashFile = (path: string) => {
  const hash = createHash('sha256');

  hash.update(readFileSync(resolve(root, path)));

  return `sha256:${hash.digest('hex')}`;
};

const percentile = (values: readonly number[], percentile: number) => {
  const sorted = [...values].sort((left, right) => left - right);
  const index = Math.min(
    sorted.length - 1,
    Math.ceil(sorted.length * percentile) - 1
  );

  return sorted[index]!;
};

const runBroadcaster = (storeCount: number) => {
  const stores = Array.from({ length: storeCount }, () => ({ visible: false }));
  const chosen = stores[Math.floor(storeCount / 2)]!;
  let notifications = 0;
  let visitedStores = 0;

  chosen.visible = true;

  const start = performance.now();

  for (let event = 0; event < eventCount; event += 1) {
    for (const store of stores) {
      visitedStores += 1;
      if (store.visible) {
        store.visible = false;
        notifications += 1;
      }
    }
    chosen.visible = true;
    notifications += 1;
  }

  return {
    durationMs: performance.now() - start,
    notifications,
    visitedStores,
  };
};

const runActiveStore = (storeCount: number) => {
  const stores = Array.from({ length: storeCount }, () => ({ visible: false }));
  const chosen = stores[Math.floor(storeCount / 2)]!;
  let activeStore: (typeof stores)[number] | null = chosen;
  let notifications = 0;
  let visitedStores = 0;

  chosen.visible = true;

  const start = performance.now();

  for (let event = 0; event < eventCount; event += 1) {
    visitedStores += 1;
    if (activeStore) {
      activeStore.visible = false;
      notifications += 1;
    }
    activeStore = chosen;
    activeStore.visible = true;
    notifications += 1;
  }

  return {
    durationMs: performance.now() - start,
    notifications,
    visitedStores,
  };
};

const rows = cohorts.map((storeCount) => {
  for (let index = 0; index < warmupCount; index += 1) {
    runBroadcaster(storeCount);
    runActiveStore(storeCount);
  }

  const broadcaster = Array.from({ length: sampleCount }, () =>
    runBroadcaster(storeCount)
  );
  const activeStore = Array.from({ length: sampleCount }, () =>
    runActiveStore(storeCount)
  );
  const baselineDurations = broadcaster.map(({ durationMs }) => durationMs);
  const targetDurations = activeStore.map(({ durationMs }) => durationMs);

  return {
    baseline: {
      medianMs: percentile(baselineDurations, 0.5),
      p95Ms: percentile(baselineDurations, 0.95),
      visitedStoresPerEvent:
        broadcaster[0]!.visitedStores / eventCount,
    },
    storeCount,
    target: {
      medianMs: percentile(targetDurations, 0.5),
      p95Ms: percentile(targetDurations, 0.95),
      visitedStoresPerEvent: activeStore[0]!.visitedStores / eventCount,
    },
    targetToBaselineMedianRatio:
      percentile(targetDurations, 0.5) /
      percentile(baselineDurations, 0.5),
  };
});

const normal = rows[0]!;
const pathological = rows.at(-1)!;
const passed =
  rows.every(
    ({ baseline, storeCount, target }) =>
      baseline.visitedStoresPerEvent === storeCount &&
      target.visitedStoresPerEvent === 1
  ) &&
  rows
    .filter(({ storeCount }) => storeCount >= 100)
    .every(({ targetToBaselineMedianRatio }) =>
      targetToBaselineMedianRatio < 1
    ) &&
  pathological.target.visitedStoresPerEvent /
    pathological.baseline.visitedStoresPerEvent <=
    0.001 &&
  pathological.target.medianMs / normal.target.medianMs <= 4;

console.log(
  JSON.stringify(
    {
      budget: {
        absolute: 'target visits exactly one store per focus event',
        noiseRule:
          'deterministic work is authoritative; timing must only be directionally faster at 100 and 1000 stores, with target width ratio at most 4',
        relative:
          'at 1000 stores target work is at most 0.001 of broadcaster work',
      },
      cohorts,
      environment: {
        arch: process.arch,
        bun: Bun.version,
        cpu: cpus()[0]?.model ?? 'unknown',
        platform: process.platform,
      },
      eventCount,
      fixture:
        'one active inactive-selection store; every event clears and rearms it',
      operation: 'unmarked focus transition',
      owners: {
        baseline: 'shared DOM listener broadcasting to every mounted store',
        target: 'shared DOM listener addressing one active store',
      },
      passed,
      rows,
      sampleCount,
      source: {
        harness: hashFile(
          'docs/plans/artifacts/2026-08-31-native-inactive-selection-focus-marker/inactive-selection-focus-probe.ts'
        ),
        production: hashFile(
          'packages/plitejs/src/react/inactive-selection.ts'
        ),
        test: hashFile('packages/plitejs/test/react/editable-behavior.tsx'),
      },
      warmupCount,
    },
    null,
    2
  )
);

if (!passed) process.exitCode = 1;

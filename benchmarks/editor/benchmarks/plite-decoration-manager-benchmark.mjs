import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { arch, cpus, platform, release, totalmem } from 'node:os';
import { dirname } from 'node:path';
import { performance } from 'node:perf_hooks';

import { createEditor, TextApi } from '../../../packages/plitejs/src/index.ts';
import {
  getNodeKey,
  getSnapshot,
} from '../../../packages/plitejs/src/internal/index.ts';
import { createPliteDecorationManager } from '../../../packages/plitejs/src/react/decoration-source.ts';

const COHORTS = [
  { activePerSource: 20, affected: 2, id: 'normal', nodes: 200, sources: 4 },
  { activePerSource: 200, affected: 8, id: 'large', nodes: 2000, sources: 8 },
  {
    activePerSource: 500,
    affected: 32,
    id: 'stress',
    nodes: 10_000,
    sources: 16,
  },
  {
    activePerSource: 1000,
    affected: 128,
    id: 'pathological',
    nodes: 10_000,
    sources: 32,
  },
];
const BUDGETS = Object.freeze({
  mountAbsoluteMs: { large: 50, normal: 16.67, pathological: 100, stress: 50 },
  mountRelativeRatio: 1.5,
  normalNoiseSlackMs: 2,
  readAbsoluteMs: {
    large: 16.67,
    normal: 16.67,
    pathological: 50,
    stress: 16.67,
  },
  readRelativeRatio: 1.05,
  updateAbsoluteMs: { large: 2, normal: 2, pathological: 5, stress: 2 },
  updateRelativeRatio: 1.2,
});
const PACKETS = 5;
const SAMPLES_PER_PACKET = 10;
const WARMUPS = 5;
const EMPTY = Object.freeze([]);
const outputPath =
  process.argv.find((value) => value.startsWith('--output='))?.slice(9) ??
  'docs/plans/artifacts/rendering-api-editor-audit/decoration-manager-benchmark.json';
const measuredInputs = [
  'packages/plitejs/src/react/decoration-source.ts',
  'packages/plitejs/src/react/components/plite.tsx',
  'packages/plitejs/src/react/components/editable-text.tsx',
  'packages/plitejs/test/react/decoration-manager-contract.test.ts',
  'packages/plitejs/test/react/decoration-rendering-contract.test.tsx',
  'benchmarks/editor/benchmarks/plite-decoration-manager-benchmark.mjs',
];

const hashFile = (path) =>
  createHash('sha256').update(readFileSync(path)).digest('hex');
const sourceBefore = Object.fromEntries(
  measuredInputs.map((path) => [path, hashFile(path)])
);
const round = (value) => Number(value.toFixed(6));
const percentile = (values, ratio) => {
  const sorted = [...values].sort((left, right) => left - right);

  return (
    sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * ratio) - 1)] ??
    0
  );
};
const summarize = (coldMs, packets) => {
  const samples = packets.flat();
  const packetP95 = packets.map((packet) => percentile(packet, 0.95));

  return {
    coldMs: round(coldMs),
    max: round(Math.max(...samples)),
    mean: round(
      samples.reduce((sum, sample) => sum + sample, 0) / samples.length
    ),
    min: round(Math.min(...samples)),
    p50: round(percentile(samples, 0.5)),
    p95: round(percentile(samples, 0.95)),
    packetP95: packetP95.map(round),
    p95PacketNoiseMs: round(Math.max(...packetP95) - Math.min(...packetP95)),
  };
};
const measure = (operation) => {
  const timed = () => {
    const startedAt = performance.now();

    operation();

    return performance.now() - startedAt;
  };
  const cold = timed();

  for (let index = 0; index < WARMUPS; index += 1) timed();
  const packets = Array.from({ length: PACKETS }, () =>
    Array.from({ length: SAMPLES_PER_PACKET }, timed)
  );

  return summarize(cold, packets);
};
const measurePair = (
  leftOperation,
  rightOperation,
  { beforeEach = () => {}, beforePacket = () => {} } = {}
) => {
  const timed = (operation) => {
    beforeEach();
    const startedAt = performance.now();

    operation();

    return performance.now() - startedAt;
  };
  beforePacket();
  const cold = [timed(leftOperation), timed(rightOperation)];

  for (let index = 0; index < WARMUPS; index += 1) {
    if (index % 2 === 0) {
      timed(leftOperation);
      timed(rightOperation);
    } else {
      timed(rightOperation);
      timed(leftOperation);
    }
  }
  const leftPackets = [];
  const rightPackets = [];

  for (let packetIndex = 0; packetIndex < PACKETS; packetIndex += 1) {
    beforePacket();
    const leftPacket = [];
    const rightPacket = [];

    for (
      let sampleIndex = 0;
      sampleIndex < SAMPLES_PER_PACKET;
      sampleIndex += 1
    ) {
      if ((packetIndex + sampleIndex) % 2 === 0) {
        leftPacket.push(timed(leftOperation));
        rightPacket.push(timed(rightOperation));
      } else {
        rightPacket.push(timed(rightOperation));
        leftPacket.push(timed(leftOperation));
      }
    }
    leftPackets.push(leftPacket);
    rightPackets.push(rightPacket);
  }

  return [summarize(cold[0], leftPackets), summarize(cold[1], rightPackets)];
};
const isActive = (cohort, source, node) =>
  (source === 0 && node < cohort.affected) ||
  (node * 31 + source * 17) % cohort.nodes < cohort.activePerSource;
const createFixture = (cohort) => {
  const editor = createEditor({
    initialValue: Array.from({ length: cohort.nodes }, () => ({
      children: [{ text: 'xx' }],
      type: 'paragraph',
    })),
  });
  const snapshot = getSnapshot(editor);
  const textEntries = Array.from({ length: cohort.nodes }, (_, node) => {
    const path = [node, 0];
    const text = snapshot.children[node].children[0];

    assert.ok(TextApi.isText(text));

    return {
      entry: [text, path],
      key: getNodeKey(editor, path),
      node,
      path,
    };
  });

  textEntries.forEach(({ key }) => assert.ok(key));

  return {
    editor,
    entries: snapshot.index.entries().map(([key, path]) => {
      let node = snapshot.children[path[0]];

      for (const index of path.slice(1)) node = node.children[index];

      return { entry: [node, path], key };
    }),
    textEntries,
    textEntryByKey: new Map(textEntries.map((entry) => [entry.key, entry])),
    textKeys: Object.freeze(textEntries.map(({ key }) => key)),
  };
};
const createDefinitions = (cohort) =>
  Array.from({ length: cohort.sources }, (_, source) => {
    const observers = new Set();
    let revision = 0;
    const counters = {
      observerSubscriptions: 0,
      reads: 0,
      refreshes: 0,
    };
    const definition = {
      id: `source:${source}`,
      observe({ refresh }) {
        observers.add(refresh);
        counters.observerSubscriptions += 1;

        return () => observers.delete(refresh);
      },
      read({ entry: [node, path] }) {
        counters.reads += 1;
        if (!TextApi.isText(node) || path.length !== 2) return EMPTY;

        const index = path[0];

        return isActive(cohort, source, index)
          ? Object.freeze([
              Object.freeze({
                attributes: Object.freeze({
                  className: `source-${source}`,
                  'data-decoration': `${source}:${index}:${revision}`,
                }),
                key: `source:${source}:node:${index}`,
                range: Object.freeze({
                  anchor: Object.freeze({ offset: 0, path }),
                  focus: Object.freeze({ offset: 2, path }),
                }),
              }),
            ])
          : EMPTY;
      },
    };

    return {
      counters,
      definition,
      observerCount: () => observers.size,
      update(keys) {
        revision += 1;
        counters.refreshes += 1;

        for (const refresh of observers) refresh({ nodeKeys: keys });
      },
    };
  });
const toSlices = (decorations) =>
  decorations.map((decoration) => ({
    attributes: decoration.attributes,
    end: decoration.range.focus.offset,
    key: decoration.key,
    start: decoration.range.anchor.offset,
  }));
const collectSignature = (decorations) =>
  decorations
    .map(
      (decoration) =>
        `${decoration.key}:${decoration.attributes['data-decoration']}`
    )
    .join('|');

const createBaselinePath = (cohort, fixture) => {
  const sources = createDefinitions(cohort);
  const bucketsBySource = sources.map(() => new Map());
  const listenersBySource = sources.map(() => new Map());
  let nodeSubscriptions = 0;
  let nodeWakes = 0;
  let renderSourceReads = 0;
  let transientRendererCalls = 0;

  sources.forEach((source, sourceIndex) => {
    fixture.entries.forEach(({ entry, key }) => {
      const slices = toSlices(source.definition.read({ entry }));

      if (slices.length > 0) bucketsBySource[sourceIndex].set(key, slices);
    });
    fixture.textKeys.forEach((key) => {
      listenersBySource[sourceIndex].set(key, new Set([() => {}]));
      nodeSubscriptions += 1;
    });
  });

  const renderKeys = (keys) => {
    const signatures = [];
    let wrappers = 0;

    keys.forEach((key) => {
      const merged = [];

      bucketsBySource.forEach((buckets) => {
        renderSourceReads += 1;
        merged.push(...(buckets.get(key) ?? EMPTY));
      });
      wrappers += merged.length;
      transientRendererCalls += Math.max(1, merged.length * 2 + 1);
      signatures.push(collectSignature(merged));
    });

    return { signatures, wrappers };
  };

  return {
    counters: () => ({
      bucketReads: 0,
      downstreamNodeSubscriptionCount: nodeSubscriptions,
      nodeWakes,
      renderSourceReads,
      sourceObserverCount: 0,
      sourceReadCount: sources.reduce(
        (sum, source) => sum + source.counters.reads,
        0
      ),
      transientRendererCalls,
    }),
    destroy() {
      nodeSubscriptions = 0;
      bucketsBySource.forEach((buckets) => buckets.clear());
      listenersBySource.forEach((listeners) => listeners.clear());
    },
    getBucketIdentity(key) {
      return bucketsBySource.map((buckets) => buckets.get(key) ?? EMPTY);
    },
    renderAll: () => renderKeys(fixture.textKeys),
    renderKeys,
    sources,
    update(sourceIndex, keys) {
      const source = sources[sourceIndex];

      source.update(keys);
      keys.forEach((key) => {
        const entry = fixture.textEntryByKey.get(key)?.entry;

        assert.ok(entry);
        const slices = toSlices(source.definition.read({ entry }));

        if (slices.length > 0) bucketsBySource[sourceIndex].set(key, slices);
        else bucketsBySource[sourceIndex].delete(key);
        for (const listener of listenersBySource[sourceIndex].get(key) ??
          EMPTY) {
          nodeWakes += 1;
          listener();
        }
      });

      return renderKeys(keys);
    },
  };
};

const createProductionPath = (cohort, fixture) => {
  const sources = createDefinitions(cohort);
  const manager = createPliteDecorationManager(
    fixture.editor,
    sources.map(({ definition }) => definition)
  );
  const unmount = manager.mount();
  const unsubscribeNodes = fixture.textKeys.map((key) =>
    manager.subscribeNodeKey(key, () => {})
  );

  const renderKeys = (keys) => {
    let wrappers = 0;
    const signatures = keys.map((key) => {
      const decorations = manager.getNodeSnapshot(key);

      wrappers += decorations.length;

      return collectSignature(decorations);
    });

    return { signatures, wrappers };
  };

  return {
    counters: () => {
      const metrics = manager.getMetrics();

      return {
        ...metrics,
        nodeWakes: metrics.wakeCount,
        renderSourceReads: 0,
        transientRendererCalls: 0,
      };
    },
    destroy() {
      unsubscribeNodes.forEach((unsubscribe) => unsubscribe());
      unmount();
      manager.destroy();
    },
    getBucketIdentity: (key) => manager.getNodeSnapshot(key),
    renderAll: () => renderKeys(fixture.textKeys),
    renderKeys,
    sources,
    update(sourceIndex, keys) {
      sources[sourceIndex].update(keys);

      return renderKeys(keys);
    },
  };
};

const createPath = (kind, cohort, fixture) =>
  kind === 'baseline'
    ? createBaselinePath(cohort, fixture)
    : createProductionPath(cohort, fixture);
const sumReads = (path) =>
  path.sources.reduce((sum, source) => sum + source.counters.reads, 0);
const affectedKeys = (cohort, fixture) =>
  fixture.textKeys.slice(0, cohort.affected);

const runCorrectness = (fixture) => {
  const cohort = COHORTS[0];
  const baseline = createBaselinePath(cohort, fixture);
  const production = createProductionPath(cohort, fixture);
  const baselineInitial = baseline.renderAll();
  const productionInitial = production.renderAll();

  assert.deepEqual(productionInitial.signatures, baselineInitial.signatures);
  assert.equal(productionInitial.wrappers, baselineInitial.wrappers);
  const unchangedKey = fixture.textKeys.at(-1);
  const unchangedBefore = production.getBucketIdentity(unchangedKey);
  const keys = affectedKeys(cohort, fixture);
  const baselineUpdate = baseline.update(0, keys);
  const productionUpdate = production.update(0, keys);

  assert.deepEqual(productionUpdate.signatures, baselineUpdate.signatures);
  assert.equal(production.getBucketIdentity(unchangedKey), unchangedBefore);
  assert.equal(production.counters().nodeWakes, keys.length);
  assert.equal(production.counters().transientRendererCalls, 0);
  baseline.destroy();
  production.destroy();
  assert.equal(
    production.sources.reduce((sum, source) => sum + source.observerCount(), 0),
    0
  );

  return {
    attributeOrderMatches: true,
    cleanupLeavesZeroObservers: true,
    productionTransientRendererCalls: 0,
    unchangedBucketIdentityStable: true,
    updateWakes: keys.length,
    wrappersMatch: true,
  };
};

const fixtures = new Map(
  COHORTS.map((cohort) => [cohort.id, createFixture(cohort)])
);
const clockNoise = measure(() => {});
const rows = [];

for (const cohort of COHORTS) {
  const fixture = fixtures.get(cohort.id);

  assert.ok(fixture);
  for (const operation of ['mount', 'read', 'update']) {
    const measuredPaths =
      operation === 'mount'
        ? null
        : {
            baseline: createBaselinePath(cohort, fixture),
            production: createProductionPath(cohort, fixture),
          };
    const runMeasuredPath = (kind) => {
      if (operation === 'mount') {
        const path = createPath(kind, cohort, fixture);

        path.destroy();

        return;
      }

      const path = measuredPaths[kind];

      if (operation === 'read') path.renderAll();
      else path.update(0, affectedKeys(cohort, fixture));
    };
    const [baselineSummary, productionSummary] = measurePair(
      () => runMeasuredPath('baseline'),
      () => runMeasuredPath('production'),
      {
        beforeEach:
          operation === 'mount' ? () => globalThis.Bun?.gc(true) : undefined,
        beforePacket: () => globalThis.Bun?.gc(true),
      }
    );

    measuredPaths?.baseline.destroy();
    measuredPaths?.production.destroy();

    for (const kind of ['baseline', 'production']) {
      const summary = kind === 'baseline' ? baselineSummary : productionSummary;
      const receiptPath = createPath(kind, cohort, fixture);
      const readsBefore = sumReads(receiptPath);
      const output =
        operation === 'mount'
          ? { signatures: [], wrappers: 0 }
          : operation === 'read'
            ? receiptPath.renderAll()
            : receiptPath.update(0, affectedKeys(cohort, fixture));
      const readsAfter = sumReads(receiptPath);
      const counters = receiptPath.counters();
      const retainedBeforeDestroy =
        counters.downstreamNodeSubscriptionCount + counters.sourceObserverCount;

      receiptPath.destroy();
      const afterDestroy = receiptPath.counters();

      rows.push({
        cohort: cohort.id,
        counters: {
          ...counters,
          operationSourceReads: readsAfter - readsBefore,
          retainedAfterDestroy:
            afterDestroy.downstreamNodeSubscriptionCount +
            afterDestroy.sourceObserverCount,
          retainedBeforeDestroy,
        },
        operation,
        path: kind,
        payloadBytes: Buffer.byteLength(JSON.stringify({ cohort, output })),
        summary,
      });
    }
  }
}

const rowFor = (cohort, operation, path) => {
  const row = rows.find(
    (candidate) =>
      candidate.cohort === cohort &&
      candidate.operation === operation &&
      candidate.path === path
  );

  assert.ok(row);

  return row;
};
const results = COHORTS.map((cohort) => {
  const baselineMount = rowFor(cohort.id, 'mount', 'baseline');
  const productionMount = rowFor(cohort.id, 'mount', 'production');
  const baselineRead = rowFor(cohort.id, 'read', 'baseline');
  const productionRead = rowFor(cohort.id, 'read', 'production');
  const baselineUpdate = rowFor(cohort.id, 'update', 'baseline');
  const productionUpdate = rowFor(cohort.id, 'update', 'production');
  const timing = {
    mountAbsolute:
      productionMount.summary.p95 <= BUDGETS.mountAbsoluteMs[cohort.id],
    mountRelative:
      productionMount.summary.p95 <=
      baselineMount.summary.p95 * BUDGETS.mountRelativeRatio +
        BUDGETS.normalNoiseSlackMs,
    readAbsolute:
      productionRead.summary.p95 <= BUDGETS.readAbsoluteMs[cohort.id],
    readRelative:
      productionRead.summary.p95 <=
      baselineRead.summary.p95 * BUDGETS.readRelativeRatio + 0.2,
    updateAbsolute:
      productionUpdate.summary.p95 <= BUDGETS.updateAbsoluteMs[cohort.id],
    updateRelative:
      productionUpdate.summary.p95 <=
      baselineUpdate.summary.p95 * BUDGETS.updateRelativeRatio + 0.2,
  };
  const deterministic = {
    baselineReadFanOut:
      baselineRead.counters.renderSourceReads === cohort.nodes * cohort.sources,
    baselineSubscriptions:
      baselineMount.counters.retainedBeforeDestroy ===
      cohort.nodes * cohort.sources,
    productionCleanup: productionMount.counters.retainedAfterDestroy === 0,
    productionReadFanOut:
      productionRead.counters.bucketReadCount === cohort.nodes &&
      productionRead.counters.operationSourceReads === 0,
    productionSubscriptions:
      productionMount.counters.retainedBeforeDestroy ===
      cohort.nodes + cohort.sources,
    productionUpdateReads:
      productionUpdate.counters.operationSourceReads === cohort.affected,
    productionUpdateWakes:
      productionUpdate.counters.nodeWakes === cohort.affected,
    productionUsesNoTransientRenderer:
      productionRead.counters.transientRendererCalls === 0,
  };

  return {
    cohort: cohort.id,
    deterministic,
    pass:
      Object.values(deterministic).every(Boolean) &&
      Object.values(timing).every(Boolean),
    timing,
  };
});

const correctness = runCorrectness(fixtures.get('normal'));
const sourceAfter = Object.fromEntries(
  measuredInputs.map((path) => [path, hashFile(path)])
);

assert.deepEqual(
  sourceAfter,
  sourceBefore,
  'Measured inputs changed during run'
);
const receipt = {
  artifactVersion: 2,
  benchmark: 'production-plite-decoration-manager',
  budgets: BUDGETS,
  cohorts: COHORTS,
  config: {
    collectBeforeMountSample: true,
    collectBeforePacket: true,
    packets: PACKETS,
    samplesPerPacket: SAMPLES_PER_PACKET,
    warmups: WARMUPS,
  },
  correctness,
  decision: results.every((result) => result.pass)
    ? 'production-scales'
    : 'production-rejected',
  environment: {
    arch: arch(),
    bun: globalThis.Bun?.version ?? 'unknown',
    cpu: cpus()[0]?.model ?? 'unknown',
    cpuCount: cpus().length,
    node: process.version,
    platform: platform(),
    release: release(),
    totalMemoryBytes: totalmem(),
  },
  fairness:
    'Both paths read the same editor snapshot with the same source definitions, source order, attributes, mounted text keys, affected-key update, and timing samples. The baseline retains one listener and render read per node and source. The production path uses the shipped manager, one observer per source, one listener per mounted text node, provider-compiled buckets, and attribute wrappers.',
  noise: clockNoise,
  privacy:
    'The fixture contains generated node keys, source indexes, counters, and timings only.',
  results,
  rows,
  sourceIdentity: sourceBefore,
};

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(receipt, null, 2)}\n`);
process.stdout.write(
  `METRIC plite_decoration_manager_hard_guard_failures=${results.filter((result) => !result.pass).length}\n`
);
process.stdout.write(
  `${JSON.stringify({ decision: receipt.decision, outputPath, results })}\n`
);
if (receipt.decision !== 'production-scales') process.exitCode = 1;

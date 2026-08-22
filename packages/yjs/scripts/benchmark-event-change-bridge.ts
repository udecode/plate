import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { performance } from 'node:perf_hooks';

import { failInvariant } from '@platejs/plite/internal';

import {
  clearYjsTrace,
  createSeededYjsPeers,
  getYjsTrace,
  paragraph,
  syncConnectedPeers,
} from '../test/support/collaboration';

const blockCount = Number(
  process.env.PLITE_YJS_EVENT_CHANGE_BENCH_BLOCKS ?? 10_000
);
const sampleCount = Number(
  process.env.PLITE_YJS_EVENT_CHANGE_BENCH_SAMPLES ?? 5
);
const outputArgument = process.argv.find((argument) =>
  argument.startsWith('--output=')
);

if (!Number.isSafeInteger(blockCount) || blockCount < 1) {
  throw new Error(
    'PLITE_YJS_EVENT_CHANGE_BENCH_BLOCKS must be a positive safe integer.'
  );
}
if (!Number.isSafeInteger(sampleCount) || sampleCount < 1) {
  throw new Error(
    'PLITE_YJS_EVENT_CHANGE_BENCH_SAMPLES must be a positive safe integer.'
  );
}

const percentile = (values: readonly number[], ratio: number) =>
  values[Math.min(values.length - 1, Math.ceil(values.length * ratio) - 1)];
const summarize = (values: readonly number[]) => {
  const sorted = [...values].sort((left, right) => left - right);

  return {
    max: sorted.at(-1) ?? failInvariant('Expected value to be defined'),
    min: sorted[0],
    p50: percentile(sorted, 0.5),
    p95: percentile(sorted, 0.95),
    p99: percentile(sorted, 0.99),
    samples: sorted,
  };
};
const ratio = (values: readonly number[]) =>
  Math.max(...values) / Math.max(Math.min(...values), 0.000001);
const corePhaseDurations = new Map<string, number>();
const corePhaseIds = new Set([
  'build-change',
  'notify-extension-change-listeners',
  'notify-listeners',
  'run-after-commit-handlers',
  'set-version',
  'transaction-active-change',
  'transaction-after-snapshot',
  'transaction-callback',
  'transaction-classify-commit',
  'transaction-commit-snapshot',
  'transaction-flush-post-commit',
  'transaction-has-net-changes',
  'transaction-publish-anchors',
  'transaction-publish-draft',
  'transaction-record-facets',
  'transaction-node-keys',
  'transaction-runtime-map-index',
  'transaction-runtime-source-index',
  'runtime-index-full-build',
  'runtime-index-map-descriptor',
  'runtime-index-publish-changed',
]);
const profilerGlobal = globalThis as typeof globalThis & {
  __PLITE_REACT_RENDER_PROFILER__?: {
    acceptsCoreDuration?: (id: string) => boolean;
    record?: (event: {
      duration?: number;
      id?: string | null;
      kind: string;
    }) => void;
  };
};
const seedStartedAt = performance.now();
const [source, target] = createSeededYjsPeers({
  children: Array.from({ length: blockCount }, (_, index) =>
    paragraph(`block-${index}`)
  ),
  clientIds: ['benchmark-source', 'benchmark-target'],
  numericClientIds: {
    'benchmark-source': 101,
    'benchmark-target': 202,
  },
});

assert.ok(source);
assert.ok(target);

const seedMs = performance.now() - seedStartedAt;
const previousProfiler = profilerGlobal.__PLITE_REACT_RENDER_PROFILER__;

profilerGlobal.__PLITE_REACT_RENDER_PROFILER__ = {
  acceptsCoreDuration: (id) => corePhaseIds.has(id),
  record(event) {
    if (
      event.kind === 'core-time' &&
      typeof event.duration === 'number' &&
      event.id
    ) {
      corePhaseDurations.set(
        event.id,
        (corePhaseDurations.get(event.id) ?? 0) + event.duration
      );
    }
  },
};

const readCorePhaseDurations = () =>
  Object.fromEntries(
    [...corePhaseDurations].sort(([left], [right]) => left.localeCompare(right))
  );
const summarizeCorePhaseDurations = (
  samples: ReadonlyArray<Record<string, number>>
) =>
  Object.fromEntries(
    [...corePhaseIds]
      .sort((left, right) => left.localeCompare(right))
      .map((id) => [id, summarize(samples.map((sample) => sample[id] ?? 0))])
  );

const positions = [0, Math.floor(blockCount / 2), blockCount - 1];
const rows = positions.map((index) => {
  const rawSamples = Array.from({ length: sampleCount }, () => {
    clearYjsTrace(source);
    clearYjsTrace(target);
    corePhaseDurations.clear();

    const offset = `block-${index}`.length;
    const startedAt = performance.now();
    const localEditStartedAt = performance.now();

    source.editor.update.text.insert('!', {
      at: { offset, path: [index, 0] },
    });
    const localEditMs = performance.now() - localEditStartedAt;
    const localCorePhaseDurationsMs = readCorePhaseDurations();

    corePhaseDurations.clear();

    const syncStartedAt = performance.now();

    syncConnectedPeers([source, target]);

    const syncMs = performance.now() - syncStartedAt;
    const elapsedMs = performance.now() - startedAt;
    const syncCorePhaseDurationsMs = readCorePhaseDurations();
    const [outboundTrace] = getYjsTrace(source);
    const [inboundTrace] = getYjsTrace(target);

    assert.deepEqual(outboundTrace, {
      canonicalStrategy: 'compatible',
      changedChildren: 0,
      changedRanges: 1,
      mode: 'canonical-change',
      tokenLengthNodes: 2,
    });
    assert.deepEqual(inboundTrace, {
      changedChildren: 1,
      changedRanges: 1,
      importKind: 'event-change',
      mode: 'remote-reconcile',
      readTopLevelNodes: 1,
    });

    return {
      elapsedMs,
      localCorePhaseDurationsMs,
      localEditMs,
      syncCorePhaseDurationsMs,
      syncMs,
    };
  });

  return {
    elapsedMs: summarize(rawSamples.map((sample) => sample.elapsedMs)),
    index,
    localCorePhaseDurationsMs: summarizeCorePhaseDurations(
      rawSamples.map((sample) => sample.localCorePhaseDurationsMs)
    ),
    localEditMs: summarize(rawSamples.map((sample) => sample.localEditMs)),
    localNodeKeysMs: summarize(
      rawSamples.map(
        (sample) =>
          sample.localCorePhaseDurationsMs['transaction-node-keys'] ?? 0
      )
    ),
    sampleCount,
    syncCorePhaseDurationsMs: summarizeCorePhaseDurations(
      rawSamples.map((sample) => sample.syncCorePhaseDurationsMs)
    ),
    syncMs: summarize(rawSamples.map((sample) => sample.syncMs)),
    syncNodeKeysMs: summarize(
      rawSamples.map(
        (sample) =>
          sample.syncCorePhaseDurationsMs['transaction-node-keys'] ?? 0
      )
    ),
  };
});

source.cleanup();
target.cleanup();
source.doc.destroy();
target.doc.destroy();
profilerGlobal.__PLITE_REACT_RENDER_PROFILER__ = previousProfiler;

const localEditMedianDistanceRatio = ratio(
  rows.map((row) => row.localEditMs.p50)
);
const syncMedianDistanceRatio = ratio(rows.map((row) => row.syncMs.p50));
const nodeKeysP95MaxMs = Math.max(
  ...rows.flatMap((row) => [row.localNodeKeysMs.p95, row.syncNodeKeysMs.p95])
);
const thresholdPolicy = {
  localEditMedianDistanceRatioMax: 2,
  nodeKeysP95MaxMs: 1,
  syncMedianDistanceRatioMax: 2,
  traceInvariantRequired: true,
};
const result = {
  benchmark: 'plite-yjs-event-change-bridge',
  blockCount,
  generatedAt: new Date().toISOString(),
  invariant:
    'Every edit refreshes two outbound Plite node lengths, decodes one inbound top-level Yjs node, and compiles one canonical range in each direction regardless of block index.',
  localEditMedianDistanceRatio,
  phaseTimingNote:
    'Core phases are nested instrumentation totals; compare each phase across samples rather than summing them.',
  rows,
  nodeKeyInvariant:
    'Classified non-structural changes reuse the committed runtime index and seed only changed paths and ancestors; transaction-node-keys stays below the explicit p95 budget.',
  nodeKeysP95MaxMs,
  sampleCount,
  seedMs,
  syncMedianDistanceRatio,
  thresholdPolicy,
  version: 1,
};
const output = `${JSON.stringify(result, null, 2)}\n`;

process.stdout.write(
  `METRIC plite_yjs_event_change_local_distance_ratio=${localEditMedianDistanceRatio}\n`
);
process.stdout.write(
  `METRIC plite_yjs_event_change_sync_distance_ratio=${syncMedianDistanceRatio}\n`
);
process.stdout.write(
  `METRIC plite_yjs_event_change_runtime_ids_p95_ms=${nodeKeysP95MaxMs}\n`
);

if (outputArgument) {
  writeFileSync(outputArgument.slice('--output='.length), output);
} else {
  process.stdout.write(output);
}

if (
  process.env.PLITE_YJS_EVENT_CHANGE_BENCH_STRICT === '1' &&
  (localEditMedianDistanceRatio >
    thresholdPolicy.localEditMedianDistanceRatioMax ||
    syncMedianDistanceRatio > thresholdPolicy.syncMedianDistanceRatioMax ||
    nodeKeysP95MaxMs > thresholdPolicy.nodeKeysP95MaxMs)
) {
  throw new Error(
    `Sparse Yjs bridge missed its gate: local=${localEditMedianDistanceRatio.toFixed(2)}x sync=${syncMedianDistanceRatio.toFixed(2)}x nodeKeysP95=${nodeKeysP95MaxMs.toFixed(3)}ms.`
  );
}

process.exit(0);

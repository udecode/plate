import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { performance } from 'node:perf_hooks';

import * as Y from 'yjs';

import { failInvariant } from '../../src/internal/failInvariant';
import { setYjsAttribute } from '../../src/yjs/core/attributes';
import { createYjsNode, getYjsNode } from '../../src/yjs/core/document';
import {
  type CapturedYjsEventBatch,
  YjsEventChangeBridge,
} from '../../src/yjs/core/event-change-bridge';
import {
  clearYjsTrace,
  createSeededYjsPeers,
  getYjsTrace,
  paragraph,
  syncConnectedPeers,
} from '../../test/yjs/support/collaboration';

const blockCount = Number(
  process.env.PLITE_YJS_EVENT_CHANGE_BENCH_BLOCKS ?? 10_000
);
const sampleCount = Number(
  process.env.PLITE_YJS_EVENT_CHANGE_BENCH_SAMPLES ?? 5
);
const outputArgument = process.argv.find((argument) =>
  argument.startsWith('--output=')
);
const measuredFiles = [
  'packages/platejs/scripts/yjs/benchmark-event-change-bridge.ts',
  'packages/platejs/src/yjs/core/editor-adapter.ts',
  'packages/platejs/src/yjs/core/extension.ts',
  'packages/platejs/src/yjs/core/event-change-bridge.ts',
  'packages/platejs/src/yjs/core/document.ts',
  'packages/plitejs/src/core/change/root-change.ts',
  'packages/plitejs/src/core/change/document-index.ts',
  'packages/plitejs/src/core/public-state.ts',
  'packages/plitejs/src/core/snapshot-index.ts',
  'packages/plitejs/src/core/commit.ts',
  'pnpm-lock.yaml',
];
const fingerprints = () =>
  Object.fromEntries(
    measuredFiles.map((file) => [
      file,
      createHash('sha256').update(readFileSync(file)).digest('hex'),
    ])
  );
const sourceBefore = fingerprints();

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
const corePhaseCounts = new Map<string, number>();
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
  'transaction-spec-callback',
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
      corePhaseCounts.set(event.id, (corePhaseCounts.get(event.id) ?? 0) + 1);
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
const batches = [
  ...new Set([128, 1000, 10_000].map((blocks) => Math.min(blocks, blockCount))),
].map((blocks) => {
  const edits = Math.min(120, Math.max(1, blocks - 1));
  const [batchSource, batchTarget] = createSeededYjsPeers({
    children: Array.from({ length: blocks }, (_, index) =>
      paragraph(`batch-${index}`)
    ),
    clientIds: ['batch-source', 'batch-target'],
  });
  assert.ok(batchSource);
  assert.ok(batchTarget);
  const samples: number[] = [];
  let detachedTransactions = 0;
  for (let sample = 0; sample <= sampleCount; sample++) {
    const before = batchTarget.editor.read.value();
    const unchanged = before.children[blocks - 1];
    batchSource.editor.update((tx) => {
      for (let index = 0; index < edits; index++) {
        tx.text.insert('!', { at: { path: [index, 0], offset: 0 } });
      }
    });
    clearYjsTrace(batchTarget);
    corePhaseDurations.clear();
    corePhaseCounts.clear();
    const started = performance.now();
    syncConnectedPeers([batchSource, batchTarget]);
    const elapsed = performance.now() - started;
    detachedTransactions = Math.max(
      detachedTransactions,
      corePhaseCounts.get('transaction-spec-callback') ?? 0
    );
    assert.deepEqual(
      batchTarget.editor.read.children(),
      batchSource.editor.read.children()
    );
    if (blocks > edits) {
      assert.equal(batchTarget.editor.read.children()[blocks - 1], unchanged);
    }
    assert.deepEqual(
      before.children[0],
      paragraph(`${'!'.repeat(sample)}batch-0`)
    );
    assert.deepEqual(getYjsTrace(batchTarget), [
      {
        changedChildren: edits,
        changedRanges: edits,
        importKind: 'event-change',
        mode: 'remote-reconcile',
        readTopLevelNodes: edits,
      },
    ]);
    if (sample > 0) samples.push(elapsed);
  }
  batchSource.editor.update.text.insert('?', {
    at: { path: [blocks - 1, 0], offset: 0 },
  });
  syncConnectedPeers([batchSource, batchTarget]);
  assert.deepEqual(
    batchTarget.editor.read.children()[blocks - 1],
    paragraph(
      `?${blocks === 1 ? '!'.repeat(sampleCount + 1) : ''}batch-${blocks - 1}`
    )
  );
  batchSource.cleanup();
  batchTarget.cleanup();
  batchSource.doc.destroy();
  batchTarget.doc.destroy();
  return { blocks, edits, detachedTransactions, syncMs: summarize(samples) };
});
profilerGlobal.__PLITE_REACT_RENDER_PROFILER__ = previousProfiler;
const propertyContexts = [
  ...new Set([100, 1000, 10_000].map((count) => Math.min(count, blockCount))),
].flatMap((blocks) =>
  (['text', 'property'] as const).map((mode) => {
    const affected = Math.floor(blocks / 2);
    let unrelatedReads = 0;
    const before = Object.freeze(
      Array.from(
        { length: blocks },
        (_, index) =>
          new Proxy(
            Object.freeze({
              type: 'paragraph',
              rank: 1,
              children: Object.freeze([
                Object.freeze({ text: `block-${index}` }),
              ]),
            }),
            {
              get(node, property, receiver) {
                if (property === 'type' && index !== affected) {
                  unrelatedReads += 1;
                }
                return Reflect.get(node, property, receiver);
              },
            }
          )
      )
    );
    const doc = new Y.Doc();
    const root = doc.getXmlElement('content');
    root.insert(
      0,
      before.map((node) => createYjsNode(node))
    );
    const bridge = new YjsEventChangeBridge(root, 'main', before);
    const affectedNode = getYjsNode(
      root,
      mode === 'text' ? [affected, 0] : [affected]
    );
    if (mode === 'text') {
      assert.ok(affectedNode instanceof Y.XmlText);
      affectedNode.insert(0, '!');
    } else {
      setYjsAttribute(affectedNode, 'rank', 2);
    }
    const batch = {
      deletedTextTargets: [],
      events: [
        {
          target: affectedNode,
          childListChanged: false,
          delta: [],
          keys: mode === 'text' ? [] : ['rank'],
        },
      ],
    } satisfies CapturedYjsEventBatch;
    assert.ok(
      batch.events[0].target === affectedNode,
      'Property-context events must target the edited node'
    );
    const normalization = {
      changedNodes: new Set<never>(),
      removedNodes: new Set<never>(),
    };
    unrelatedReads = 0;
    const result = bridge.translate(batch, normalization);
    const observedReads = unrelatedReads;
    assert.equal(result.kind, 'change');
    if (result.kind !== 'change') {
      throw new Error('Expected event-native translation');
    }
    assert.deepEqual(
      result.import.change.apply({ children: before }).children,
      result.import.children
    );
    const ordinary = Object.freeze(
      before.map((node) => Object.freeze({ ...node }))
    );
    const timedBridge = new YjsEventChangeBridge(root, 'main', ordinary);
    const samples: number[] = [];
    for (let sample = 0; sample <= sampleCount; sample++) {
      const started = performance.now();
      assert.equal(timedBridge.translate(batch, normalization).kind, 'change');
      const elapsed = performance.now() - started;
      if (sample > 0) samples.push(elapsed);
    }
    doc.destroy();
    const durationMs = summarize(samples);
    return {
      blocks,
      mode,
      unrelatedReads: observedReads,
      durationMs,
      pass: observedReads === 0 && durationMs.p95 <= 16.67,
    };
  })
);

const localEditMedianDistanceRatio = ratio(
  rows.map((row) => row.localEditMs.p50)
);
const syncMedianDistanceRatio = ratio(rows.map((row) => row.syncMs.p50));
const nodeKeysP95MaxMs = Math.max(
  ...rows.flatMap((row) => [row.localNodeKeysMs.p95, row.syncNodeKeysMs.p95])
);
const thresholdPolicy = {
  batchDetachedTransactionsMax: 0,
  batchSyncP95MaxMs: 5000,
  propertyContextUnrelatedReads: 0,
  eventPreparationP95MaxMs: 16.67,
  localEditMedianDistanceRatioMax: 2,
  nodeKeysP95MaxMs: 1,
  syncMedianDistanceRatioMax: 2,
  traceInvariantRequired: true,
};
const result = {
  benchmark: 'plite-yjs-event-change-bridge',
  blockCount,
  batches,
  propertyContexts,
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
  version: 2,
  sourceIdentity: { before: sourceBefore, after: fingerprints() },
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
process.stdout.write(
  `METRIC plite_yjs_event_change_batch_detached_transactions=${Math.max(...batches.map((batch) => batch.detachedTransactions))}\n`
);
process.stdout.write(
  `METRIC plite_yjs_event_change_batch_sync_p95_ms=${Math.max(...batches.map((batch) => batch.syncMs.p95))}\n`
);
process.stdout.write(
  `METRIC plite_yjs_event_change_property_context_failures=${propertyContexts.filter((row) => !row.pass).length}\n`
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
    nodeKeysP95MaxMs > thresholdPolicy.nodeKeysP95MaxMs ||
    batches.some(
      (batch) =>
        batch.detachedTransactions !== 0 ||
        batch.syncMs.p95 > thresholdPolicy.batchSyncP95MaxMs
    ) ||
    propertyContexts.some((row) => !row.pass) ||
    JSON.stringify(result.sourceIdentity.before) !==
      JSON.stringify(result.sourceIdentity.after))
) {
  throw new Error(
    `Sparse Yjs bridge missed its gate: local=${localEditMedianDistanceRatio.toFixed(2)}x sync=${syncMedianDistanceRatio.toFixed(2)}x nodeKeysP95=${nodeKeysP95MaxMs.toFixed(3)}ms.`
  );
}

process.exit(0);

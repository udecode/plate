import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { arch, cpus, platform, release, totalmem } from 'node:os';
import { performance } from 'node:perf_hooks';

import {
  FindPlugin,
  getFindOwner,
} from '../../../../apps/www/src/registry/components/editor/find';
import { writeBenchmarkArtifact } from '../../../../benchmarks/editor/benchmarks/benchmark-artifact';
import { createEditor as createPliteEditor } from '../../../plitejs/src';
import {
  getSnapshot as getPliteSnapshot,
  getLastCommit,
} from '../../../plitejs/src/internal';
import { createPliteAnnotationStore } from '../../../plitejs/src/react/annotation-store';
import { createDecorationSource } from '../../../plitejs/src/react/decoration-source';
import {
  type PliteWidget,
  createPliteWidgetStore,
} from '../../../plitejs/src/react/widget-store';
import type { Descendant, Range } from '../../src/core';
import { NodeApi, PathApi, TextApi } from '../../src/core';
import { createEditor as createPlateEditor } from '../../src/react';
import { getActiveYjsController } from '../../src/yjs/core/controller-registry';
import type {
  YjsAwarenessChange,
  YjsAwarenessLike,
  YjsAwarenessState,
} from '../../src/yjs/core/types';
import { getYjsCursorWidgetStore } from '../../src/yjs/react/cursor-widget-store';
import {
  createYjsDecorationProjectionList,
  subscribeYjsDecorationProjectionList,
} from '../../src/yjs/react/yjs-decoration-source.internal';
import {
  createYjsPeer,
  createYjsTestEditor,
  paragraph,
  runYjsUpdate,
} from '../../test/yjs/support/collaboration';

type Summary = Readonly<{
  max: number;
  mean: number;
  min: number;
  p50: number;
  p75: number;
  p95: number;
  p99: number | null;
  p95PacketNoiseMs: number;
  packetP95: readonly number[];
  samples: readonly number[];
}>;

type TimingRow = Readonly<{
  claimLimit?: string;
  cohort: string;
  counters: Readonly<Record<string, number>>;
  expectedComplexity: string;
  memory?: Readonly<Record<string, number>>;
  operation: string;
  owner: string;
  summary: Summary;
  verdict: 'green' | 'red';
}>;

const outputArgument = process.argv.find((argument) =>
  argument.startsWith('--output=')
);
const outputPath =
  outputArgument?.slice('--output='.length) ??
  'docs/plans/artifacts/transient-projection-scalability/node-benchmark.json';

const parsePositiveInteger = (name: string, fallback: number) => {
  const value = Number(process.env[name] ?? fallback);

  if (!Number.isSafeInteger(value) || value < 1) {
    throw new Error(`${name} must be a positive safe integer.`);
  }

  return value;
};

const parseCohorts = (name: string, fallback: readonly number[]) => {
  const raw = process.env[name];

  if (!raw) return [...fallback];

  const values = raw
    .split(',')
    .map(Number)
    .filter((value) => Number.isSafeInteger(value) && value > 0);

  if (values.length === 0) {
    throw new Error(`${name} must contain positive safe integers.`);
  }

  return values;
};

const packetCount = parsePositiveInteger(
  'TRANSIENT_PROJECTION_BENCH_PACKETS',
  5
);
const samplesPerPacket = parsePositiveInteger(
  'TRANSIENT_PROJECTION_BENCH_SAMPLES_PER_PACKET',
  20
);
const warmupCount = parsePositiveInteger(
  'TRANSIENT_PROJECTION_BENCH_WARMUPS',
  20
);
const cursorCohorts = parseCohorts(
  'TRANSIENT_PROJECTION_BENCH_CURSOR_COHORTS',
  [1, 10, 100, 1000]
);
const widgetCohorts = parseCohorts(
  'TRANSIENT_PROJECTION_BENCH_WIDGET_COHORTS',
  [1, 10, 100, 1000, 10_000]
);
const strict = process.env.TRANSIENT_PROJECTION_BENCH_STRICT === '1';
const frameBudgetMs = Number(
  process.env.TRANSIENT_PROJECTION_BENCH_FRAME_MS ?? 16.67
);

const MEASURED_INPUT_FILES = [
  'apps/www/src/registry/components/editor/find.tsx',
  'benchmarks/editor/benchmarks/benchmark-artifact.ts',
  'benchmarks/targets/slate-v2.json',
  'config/plite-source-aliases.ts',
  'packages/platejs/scripts/transient-projection/benchmark-scalability.ts',
  'packages/platejs/src/yjs/core/awareness-adapter.ts',
  'packages/platejs/src/yjs/core/controller-registry.ts',
  'packages/platejs/src/yjs/react/cursor-widget-store.ts',
  'packages/platejs/src/yjs/react/yjs-decoration-source.internal.tsx',
  'packages/platejs/src/yjs/react/YjsPlugin.tsx',
  'packages/platejs/src/yjs/react/useYjs.ts',
  'packages/platejs/test/yjs/awareness-contract.spec.ts',
  'packages/platejs/test/yjs/react-contract.spec.tsx',
  'packages/platejs/test/yjs/support/collaboration.ts',
  'packages/plitejs/src/react/decoration-source.ts',
  'packages/plitejs/src/core/anchor-state.ts',
  'packages/plitejs/src/core/anchor.ts',
  'packages/plitejs/src/core/commit.ts',
  'packages/plitejs/src/core/public-state.ts',
  'packages/plitejs/src/core/snapshot-index.ts',
  'packages/plitejs/src/react/annotation-store.ts',
  'packages/plitejs/src/react/mapped-view-store.ts',
  'packages/plitejs/src/react/keyed-projection-delta.ts',
  'packages/plitejs/src/react/projection-store.ts',
  'packages/plitejs/src/react/stable-id-mapped-source.ts',
  'packages/plitejs/src/react/widget-store.ts',
  'packages/plitejs/test/react/widget-layer-contract.test.tsx',
  'pnpm-lock.yaml',
] as const;

const sha256File = (file: string) =>
  createHash('sha256').update(readFileSync(file)).digest('hex');
const sourceBefore = Object.fromEntries(
  MEASURED_INPUT_FILES.map((file) => [file, sha256File(file)])
);

if (!Number.isFinite(frameBudgetMs) || frameBudgetMs <= 0) {
  throw new Error(
    'TRANSIENT_PROJECTION_BENCH_FRAME_MS must be a positive number.'
  );
}

const round = (value: number) => Number(value.toFixed(6));

const percentile = (sorted: readonly number[], ratio: number) =>
  sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * ratio) - 1)] ??
  0;

const summarize = (
  samples: readonly number[],
  packetSamples: ReadonlyArray<readonly number[]>
): Summary => {
  assert.ok(samples.length > 0);
  const sorted = [...samples].sort((left, right) => left - right);
  const packetP95 = packetSamples.map((packet) =>
    percentile(
      [...packet].sort((left, right) => left - right),
      0.95
    )
  );

  return Object.freeze({
    max: round(sorted.at(-1) ?? 0),
    mean: round(
      samples.reduce((total, sample) => total + sample, 0) / samples.length
    ),
    min: round(sorted[0] ?? 0),
    p50: round(percentile(sorted, 0.5)),
    p75: round(percentile(sorted, 0.75)),
    p95: round(percentile(sorted, 0.95)),
    p99: samples.length >= 100 ? round(percentile(sorted, 0.99)) : null,
    p95PacketNoiseMs: round(Math.max(...packetP95) - Math.min(...packetP95)),
    packetP95: packetP95.map(round),
    samples: samples.map(round),
  });
};

const measure = (
  operation: (iteration: number) => number,
  options: Readonly<{
    packets?: number;
    samplesPerPacket?: number;
    warmups?: number;
  }> = {}
) => {
  const measuredPacketCount = options.packets ?? packetCount;
  const measuredSamplesPerPacket = options.samplesPerPacket ?? samplesPerPacket;
  const measuredWarmups = options.warmups ?? warmupCount;

  for (let index = 0; index < measuredWarmups; index += 1) {
    operation(index);
  }

  const packets: number[][] = [];

  for (let packet = 0; packet < measuredPacketCount; packet += 1) {
    const samples: number[] = [];

    for (let index = 0; index < measuredSamplesPerPacket; index += 1) {
      samples.push(
        operation(measuredWarmups + packet * measuredSamplesPerPacket + index)
      );
    }
    packets.push(samples);
  }

  return summarize(packets.flat(), packets);
};

const measureCall = (callback: () => void) => {
  const startedAt = performance.now();

  callback();

  return performance.now() - startedAt;
};

class BenchmarkAwareness implements YjsAwarenessLike {
  readonly clientID: number;
  readonly doc: { readonly clientID: number };

  private readonly listeners = new Set<(event: YjsAwarenessChange) => void>();
  private localState: YjsAwarenessState | null = null;
  private readonly states = new Map<number, YjsAwarenessState>();

  constructor(clientID: number) {
    this.clientID = clientID;
    this.doc = { clientID };
  }

  getLocalState(): YjsAwarenessState | null {
    return this.localState;
  }

  getStates(): ReadonlyMap<number, YjsAwarenessState> {
    return this.states;
  }

  listenerCount() {
    return this.listeners.size;
  }

  off(_event: 'change', handler: (event: YjsAwarenessChange) => void): void {
    this.listeners.delete(handler);
  }

  on(_event: 'change', handler: (event: YjsAwarenessChange) => void): void {
    this.listeners.add(handler);
  }

  removeRemoteState(clientId: number): void {
    this.states.delete(clientId);
    this.emit({ added: [], removed: [clientId], updated: [] });
  }

  seedRemoteStates(states: ReadonlyMap<number, YjsAwarenessState>) {
    for (const [clientId, state] of states) this.states.set(clientId, state);
  }

  setLocalStateField(field: string, value: unknown): void {
    this.localState = { ...this.localState, [field]: value };
    this.states.set(this.clientID, this.localState);
    this.emit({ added: [], removed: [], updated: [this.clientID] });
  }

  setRemoteState(clientId: number, state: YjsAwarenessState): void {
    const known = this.states.has(clientId);

    this.states.set(clientId, state);
    this.emit({
      added: known ? [] : [clientId],
      removed: [],
      updated: known ? [clientId] : [],
    });
  }

  private emit(event: YjsAwarenessChange): void {
    for (const listener of this.listeners) listener(event);
  }
}

const cursorRange = (block: number, offset = 1): Range => ({
  anchor: { offset, path: [block, 0] },
  focus: { offset: offset + 2, path: [block, 0] },
});

type ProjectionMode = 'cache-only' | 'keyed';

const createCursorFixture = (count: number, mode: ProjectionMode) => {
  const awareness = new BenchmarkAwareness(2);
  const blockCount = mode === 'cache-only' ? 1 : count;
  const heapBefore = process.memoryUsage().heapUsed;
  const peer = createYjsPeer({
    awareness,
    children: Array.from({ length: blockCount }, (_, index) =>
      paragraph(`cursor target ${index} abcdefghijklmnopqrstuvwxyz`)
    ),
    clientId: 'transient-projection-benchmark',
    numericClientId: 2,
  });
  const relativeSelections: unknown[] = [];

  for (let index = 0; index < count; index += 1) {
    runYjsUpdate(peer, (yjs) =>
      yjs.sendSelection(cursorRange(index % blockCount))
    );
    relativeSelections.push(awareness.getLocalState()?.selection);
  }
  runYjsUpdate(peer, (yjs) => yjs.sendSelection(cursorRange(0, 2)));
  const alternateSelection = awareness.getLocalState()?.selection;
  const clientIds = Array.from({ length: count }, (_, index) => 100 + index);

  awareness.seedRemoteStates(
    new Map(
      clientIds.map((clientId, index) => [
        clientId,
        {
          data: { name: `cursor-${clientId}`, revision: 0 },
          selection: relativeSelections[index],
        },
      ])
    )
  );

  const controller = getActiveYjsController(peer.editor);

  assert.ok(controller);
  const cache = controller.cursorCache();

  cache.rebuild();
  assert.equal(cache.remoteCursorIds().length, count);

  const notifications = {
    cacheBroad: 0,
    cacheChanged: 0,
    cacheIds: 0,
    cacheOther: 0,
    sourceRuntime: 0,
    storeBroad: 0,
    storeChanged: 0,
    storeOther: 0,
  };
  const primaryClientId = clientIds[0];

  assert.ok(primaryClientId !== undefined);
  const cleanups: Array<() => void> = [
    cache.subscribeCursors(() => {
      notifications.cacheBroad += 1;
    }),
    cache.subscribeIds(() => {
      notifications.cacheIds += 1;
    }),
    cache.subscribeCursor(primaryClientId, () => {
      notifications.cacheChanged += 1;
    }),
  ];

  if (count > 1) {
    const otherClientId = clientIds[1];

    assert.ok(otherClientId !== undefined);
    cleanups.push(
      cache.subscribeCursor(otherClientId, () => {
        notifications.cacheOther += 1;
      })
    );
  }

  let source: ReturnType<typeof createDecorationSource> | undefined;
  let widgetStore: ReturnType<typeof getYjsCursorWidgetStore> | undefined;

  if (mode !== 'cache-only') {
    widgetStore = getYjsCursorWidgetStore(peer.editor);
    const projectionList = createYjsDecorationProjectionList(cache);

    source = createDecorationSource(peer.editor, {
      dirtiness: 'external',
      id: `transient-projection-${mode}-${count}`,
      read: projectionList.read,
    });

    for (const nodeKey of Object.keys(source.getSnapshot())) {
      cleanups.push(
        source.subscribeNodeKey(nodeKey, () => {
          notifications.sourceRuntime += 1;
        })
      );
    }
    cleanups.push(
      subscribeYjsDecorationProjectionList(cache, projectionList, () =>
        source?.refresh({ reason: 'external' })
      ),
      widgetStore.subscribe(() => {
        notifications.storeBroad += 1;
      }),
      widgetStore.subscribeWidget(String(primaryClientId), () => {
        notifications.storeChanged += 1;
      })
    );
    if (count > 1) {
      const otherClientId = clientIds[1];

      assert.ok(otherClientId !== undefined);
      cleanups.push(
        widgetStore.subscribeWidget(String(otherClientId), () => {
          notifications.storeOther += 1;
        })
      );
    }
  }

  const heapAfter = process.memoryUsage().heapUsed;

  return {
    alternateSelection,
    awareness,
    cache,
    cleanup() {
      for (const cleanup of cleanups.reverse()) cleanup();
      source?.destroy();
      widgetStore?.destroy();
      peer.cleanup();
      peer.doc.destroy();
    },
    clientIds,
    heapDeltaBytes: Math.max(0, heapAfter - heapBefore),
    notifications,
    peer,
    primarySelection: relativeSelections[0],
    source,
    widgetStore,
  };
};

const totalNotifications = (
  notifications: ReturnType<typeof snapshotNotifications>
) => Object.values(notifications).reduce((total, count) => total + count, 0);

const runCursorTeardownProof = (count: number) => {
  const fixture = createCursorFixture(count, 'keyed');
  const listenersBeforeCleanup = fixture.awareness.listenerCount();
  const notificationsBeforeCleanup = snapshotNotifications(
    fixture.notifications
  );
  const startedAt = performance.now();

  fixture.cleanup();

  const durationMs = round(performance.now() - startedAt);
  const listenersAfterCleanup = fixture.awareness.listenerCount();
  const clientId = fixture.clientIds[0];

  assert.ok(clientId !== undefined);
  fixture.awareness.setRemoteState(clientId, {
    data: { name: `cursor-${clientId}`, revision: 1 },
    selection: fixture.primarySelection,
  });
  fixture.cache.handleAwarenessChange({
    added: [],
    removed: [],
    updated: [clientId],
  });

  const postCleanupSubscriberWakes =
    totalNotifications(snapshotNotifications(fixture.notifications)) -
    totalNotifications(notificationsBeforeCleanup);
  const verdict =
    listenersBeforeCleanup === 1 &&
    listenersAfterCleanup === 0 &&
    postCleanupSubscriberWakes === 0
      ? 'green'
      : 'red';

  return Object.freeze({
    cohort: `n=${count}`,
    durationMs,
    expectedComplexity: 'O(n) release with zero retained registrations',
    listenersAfterCleanup,
    listenersBeforeCleanup,
    postCleanupSubscriberWakes,
    verdict,
  });
};

const snapshotNotifications = (
  notifications: ReturnType<typeof createCursorFixture>['notifications']
) => ({ ...notifications });

const notificationDelta = (
  before: ReturnType<typeof snapshotNotifications>,
  after: ReturnType<typeof snapshotNotifications>,
  key: keyof ReturnType<typeof snapshotNotifications>
) => after[key] - before[key];

const runCursorUpdateRow = (
  count: number,
  mode: ProjectionMode,
  operation: 'metadata-update' | 'selection-update'
): TimingRow => {
  const fixture = createCursorFixture(count, mode);
  let revision = 0;
  let alternate = false;
  let counters: Record<string, number> = {};
  const stableIds = fixture.cache.remoteCursorIds();
  const stableWidgetIds = fixture.widgetStore?.getSnapshot().allIds;

  const summary = measure(() => {
    revision += 1;
    const metricsBefore = fixture.cache.getMetrics();
    const sourceMetricsBefore = fixture.source?.getMetrics();
    const notificationsBefore = snapshotNotifications(fixture.notifications);
    const clientId = fixture.clientIds[0];

    assert.ok(clientId !== undefined);
    const previousState = fixture.awareness.getStates().get(clientId);

    assert.ok(previousState);
    if (operation === 'selection-update') alternate = !alternate;
    const nextSelection =
      operation === 'selection-update'
        ? alternate
          ? fixture.alternateSelection
          : fixture.primarySelection
        : previousState.selection;
    const duration = measureCall(() => {
      fixture.awareness.setRemoteState(clientId, {
        data: { name: `cursor-${clientId}`, revision },
        selection: nextSelection,
      });
    });
    const metricsAfter = fixture.cache.getMetrics();
    const sourceMetricsAfter = fixture.source?.getMetrics();

    assert.equal(
      metricsAfter.clientDecodeCount - metricsBefore.clientDecodeCount,
      1
    );
    assert.equal(
      metricsAfter.cursorResolutionPassCount -
        metricsBefore.cursorResolutionPassCount,
      operation === 'selection-update' ? 1 : 0
    );
    assert.equal(
      metricsAfter.endpointConversionCount -
        metricsBefore.endpointConversionCount,
      operation === 'selection-update' ? 2 : 0
    );
    assert.equal(
      metricsAfter.idsPublicationCount - metricsBefore.idsPublicationCount,
      0
    );
    assert.equal(fixture.cache.remoteCursorIds(), stableIds);
    assert.equal(
      notificationDelta(
        notificationsBefore,
        fixture.notifications,
        'cacheChanged'
      ),
      1
    );
    assert.equal(
      notificationDelta(
        notificationsBefore,
        fixture.notifications,
        'cacheOther'
      ),
      0
    );
    assert.equal(
      notificationDelta(notificationsBefore, fixture.notifications, 'cacheIds'),
      0
    );

    if (fixture.source && sourceMetricsBefore && sourceMetricsAfter) {
      const expectedProjected = 1;
      const expectedRuntimeWakes = 1;

      assert.equal(
        sourceMetricsAfter.sourceReadCount -
          sourceMetricsBefore.sourceReadCount,
        1
      );
      assert.equal(
        sourceMetricsAfter.projectedRangeCount -
          sourceMetricsBefore.projectedRangeCount,
        expectedProjected
      );
      assert.equal(
        sourceMetricsAfter.runtimeSubscriberWakeCount -
          sourceMetricsBefore.runtimeSubscriberWakeCount,
        expectedRuntimeWakes
      );
      assert.equal(
        notificationDelta(
          notificationsBefore,
          fixture.notifications,
          'sourceRuntime'
        ),
        expectedRuntimeWakes
      );
      assert.equal(
        notificationDelta(
          notificationsBefore,
          fixture.notifications,
          'storeChanged'
        ),
        1
      );
      assert.equal(
        notificationDelta(
          notificationsBefore,
          fixture.notifications,
          'storeOther'
        ),
        0
      );
      assert.equal(fixture.widgetStore?.getSnapshot().allIds, stableWidgetIds);

      counters = {
        clientDecodes: 1,
        endpointConversions: operation === 'selection-update' ? 2 : 0,
        projectedRanges: expectedProjected,
        resolutionPasses: operation === 'selection-update' ? 1 : 0,
        runtimeSubscriberWakes: expectedRuntimeWakes,
        unrelatedCursorWakes: 0,
        unrelatedWidgetWakes: 0,
      };
    } else {
      counters = {
        clientDecodes: 1,
        endpointConversions: operation === 'selection-update' ? 2 : 0,
        resolutionPasses: operation === 'selection-update' ? 1 : 0,
        unrelatedCursorWakes: 0,
      };
    }

    return duration;
  });

  fixture.cleanup();

  return {
    cohort: `n=${count}`,
    counters,
    expectedComplexity:
      mode === 'cache-only'
        ? 'O(1) changed-client decode/publication work independent of total n'
        : 'one keyed source update maps one cursor and wakes only its old/new runtime buckets',
    memory: {
      heapDeltaBytes: fixture.heapDeltaBytes,
      heapDeltaBytesPerCursor: round(fixture.heapDeltaBytes / count),
    },
    operation: `${mode}:${operation}`,
    owner: 'platejs/yjs remote cursor projection',
    summary,
    verdict:
      summary.p95 <= frameBudgetMs &&
      (counters.projectedRanges ?? 1) <= 1 &&
      (counters.runtimeSubscriberWakes ?? 1) <= 1
        ? 'green'
        : 'red',
  };
};

const runWidgetRow = (count: number): TimingRow => {
  const editor = createYjsTestEditor({
    children: [paragraph('widget target')],
  });
  let widgets: Array<PliteWidget<{ revision: number }>> = Array.from(
    { length: count },
    (_, index) => ({
      data: { revision: 0 },
      id: `widget-${index}`,
      target: { type: 'selection' },
    })
  );
  const store = createPliteWidgetStore(editor, () => widgets);
  let broadWakes = 0;
  let changedWakes = 0;
  let unrelatedWakes = 0;
  const cleanups = [
    store.subscribe(() => {
      broadWakes += 1;
    }),
    store.subscribeWidget('widget-0', () => {
      changedWakes += 1;
    }),
  ];

  if (count > 1) {
    cleanups.push(
      store.subscribeWidget('widget-1', () => {
        unrelatedWakes += 1;
      })
    );
  }

  let revision = 0;
  const ids = store.getSnapshot().allIds;
  const summary = measure(() => {
    revision += 1;
    widgets = [...widgets];
    const firstWidget = widgets[0];

    assert.ok(firstWidget !== undefined);
    widgets[0] = { ...firstWidget, data: { revision } };
    const metricsBefore = store.getMetrics();
    const before = { broadWakes, changedWakes, unrelatedWakes };
    const duration = measureCall(store.refresh);
    const metricsAfter = store.getMetrics();

    assert.equal(store.getSnapshot().allIds, ids);
    assert.equal(
      metricsAfter.widgetResolveCount - metricsBefore.widgetResolveCount,
      1
    );
    assert.equal(
      metricsAfter.changedWidgetCount - metricsBefore.changedWidgetCount,
      1
    );
    assert.equal(
      metricsAfter.fullFallbackCount - metricsBefore.fullFallbackCount,
      0
    );
    assert.equal(broadWakes - before.broadWakes, 1);
    assert.equal(changedWakes - before.changedWakes, 1);
    assert.equal(unrelatedWakes - before.unrelatedWakes, 0);

    return duration;
  });

  for (const cleanup of cleanups) cleanup();
  store.destroy();

  return {
    cohort: `n=${count}`,
    counters: {
      changedWidgetWakes: 1,
      listListenerChecks: 1,
      resolvedWidgets: 1,
      unrelatedWidgetWakes: 0,
    },
    expectedComplexity:
      'stable ids plus one mapped Widget and one keyed subscriber wake',
    memory: {
      snapshotIds: ids.length,
      snapshotItems: count,
    },
    operation: 'item-update',
    owner: 'plitejs/react Widget store',
    summary,
    verdict: summary.p95 <= frameBudgetMs ? 'green' : 'red',
  };
};

const runNodeWidgetRows = (count: number): TimingRow[] => {
  const editor = createPliteEditor({
    initialValue: Array.from({ length: count }, () =>
      paragraph('widget target')
    ),
  });
  const control = createPliteEditor({
    initialValue: Array.from({ length: count }, () =>
      paragraph('widget target')
    ),
  });
  const snapshot = getPliteSnapshot(editor);
  getPliteSnapshot(control).index.entries();
  let targetReads = 0;
  const widgets = Array.from({ length: count }, (_, index) => {
    const nodeKey = snapshot.index.keyAt([index]);
    assert.ok(nodeKey);
    return {
      id: `node-widget-${index}`,
      get target() {
        targetReads += 1;
        return { type: 'node' as const, nodeKey };
      },
    };
  });
  const store = createPliteWidgetStore(editor, () => widgets);
  let wakes = 0;
  store.subscribe(() => {
    wakes += 1;
  });
  const rows: TimingRow[] = [];
  const options =
    count >= 10_000 ? { packets: 3, samplesPerPacket: 10, warmups: 5 } : {};
  const measuredWarmups = options.warmups ?? warmupCount;
  const measuredPacketSize = options.samplesPerPacket ?? samplesPerPacket;

  for (const operation of ['text-edit', 'remove-target'] as const) {
    const baselineSamples: number[] = [];
    let counters: Record<string, number> = {};
    const edit = (owner: typeof editor) => {
      if (operation === 'text-edit') {
        owner.update.text.insert('x', { at: { path: [0, 0], offset: 0 } });
      } else owner.update.nodes.remove({ at: [0] });
    };
    const restore = (owner: typeof editor) => {
      if (operation !== 'remove-target') return;
      const change = getLastCommit(owner);
      assert.ok(change);
      owner.update((tx) => tx.changes.apply(change.inverseChanges));
    };
    const summary = measure((sample) => {
      const previous = store.getSnapshot();
      const metrics = store.getMetrics();
      const previousWakes = wakes;
      targetReads = 0;
      let baseline = 0;
      let duration = 0;
      if (sample % 2 === 0) {
        baseline = measureCall(() => edit(control));
        duration = measureCall(() => edit(editor));
      } else {
        duration = measureCall(() => edit(editor));
        baseline = measureCall(() => edit(control));
      }
      const resolvedWidgets =
        store.getMetrics().widgetResolveCount - metrics.widgetResolveCount;
      const expected = operation === 'text-edit' ? 0 : 1;
      assert.equal(resolvedWidgets, expected);
      assert.equal(wakes - previousWakes, expected);
      assert.ok(targetReads <= (expected === 0 ? 0 : 12));
      assert.equal(previous.byId.get('node-widget-0')?.available, true);
      assert.equal(
        store.getWidget('node-widget-0')?.available,
        operation === 'text-edit'
      );
      if (expected === 0) assert.equal(store.getSnapshot(), previous);
      counters = {
        resolvedWidgets,
        targetReads,
        widgetWakes: wakes - previousWakes,
      };
      if (sample >= measuredWarmups) baselineSamples.push(baseline);
      restore(control);
      restore(editor);
      assert.equal(store.getWidget('node-widget-0')?.available, true);
      return duration;
    }, options);
    const baselinePackets = Array.from(
      { length: baselineSamples.length / measuredPacketSize },
      (_, index) =>
        baselineSamples.slice(
          index * measuredPacketSize,
          (index + 1) * measuredPacketSize
        )
    );
    const baseline = summarize(baselineSamples, baselinePackets);
    const ownerBudgetMs = Math.max(baseline.p95 * 1.2, baseline.p95 + 5);
    rows.push({
      cohort: `nodes=${count}:widgets=${count}`,
      counters: { ...counters, baselineP95Ms: baseline.p95, ownerBudgetMs },
      expectedComplexity:
        'one affected target lookup; text edits resolve no node widgets; immutable core document work is matched by the plain-editor control',
      operation: `editor:${operation}`,
      owner: 'plitejs/react Widget store',
      summary,
      claimLimit:
        'The relative budget isolates Widget overhead; it does not assert the core edit itself meets a frame budget.',
      verdict: summary.p95 <= ownerBudgetMs ? 'green' : 'red',
    });
  }
  store.destroy();
  return rows;
};

const runAnnotationWidgetRow = (count: number): TimingRow => {
  const editor = createPliteEditor({
    initialValue: [paragraph('widget target')],
  });
  const range = {
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [0, 0], offset: 4 },
  };
  const annotations = Array.from({ length: count }, (_, index) => ({
    id: `annotation-${index}`,
    anchor: { resolve: () => range, release: () => null },
    data: { revision: 0 },
  }));
  const annotationStore = createPliteAnnotationStore(editor, () => annotations);
  const widgets = annotations.map(({ id }, index) => ({
    id: `widget-${index}`,
    target: { type: 'annotation' as const, annotationId: id },
  }));
  const store = createPliteWidgetStore(editor, () => widgets, annotationStore);
  let wakes = 0;
  let unrelatedWakes = 0;
  store.subscribe(() => {
    wakes += 1;
  });
  if (count > 1) {
    store.subscribeWidget('widget-1', () => {
      unrelatedWakes += 1;
    });
  }
  let counters: Record<string, number> = {};
  const summary = measure((revision) => {
    const metrics = store.getMetrics();
    const previousWakes = wakes;
    const previous = store.getSnapshot();
    annotations[0] = { ...annotations[0], data: { revision: revision + 1 } };
    const duration = measureCall(() =>
      annotationStore.refresh({ ids: ['annotation-0'] })
    );
    const resolvedWidgets =
      store.getMetrics().widgetResolveCount - metrics.widgetResolveCount;
    assert.equal(resolvedWidgets, 1);
    assert.equal(wakes - previousWakes, 1);
    assert.equal(unrelatedWakes, 0);
    assert.equal(
      store.getWidget('widget-0')?.annotation?.data?.revision,
      revision + 1
    );
    assert.equal(
      previous.byId.get('widget-0')?.annotation?.data?.revision,
      revision
    );
    counters = {
      resolvedWidgets,
      widgetWakes: wakes - previousWakes,
      unrelatedWidgetWakes: unrelatedWakes,
    };
    return duration;
  });
  store.destroy();
  annotationStore.destroy();
  return {
    cohort: `annotations=${count}:widgets=${count}`,
    counters,
    expectedComplexity:
      'one annotation batch resolves one indexed widget; explicit external annotation refresh still validates its source',
    operation: 'annotation:item-update',
    owner: 'plitejs/react Widget store',
    summary,
    verdict: summary.p95 <= frameBudgetMs ? 'green' : 'red',
  };
};

type FindCohort = Readonly<{
  blocks: number;
  id: string;
  matches: number;
  pathological: boolean;
  textPerBlock: number;
}>;

const FIND_COHORTS: readonly FindCohort[] = [
  {
    blocks: 100,
    id: 'normal',
    matches: 100,
    pathological: false,
    textPerBlock: 100,
  },
  {
    blocks: 1000,
    id: 'large',
    matches: 1000,
    pathological: false,
    textPerBlock: 100,
  },
  {
    blocks: 1,
    id: 'stress-single-leaf',
    matches: 10_000,
    pathological: false,
    textPerBlock: 100_000,
  },
  {
    blocks: 10_000,
    id: 'pathological-leaf-fanout',
    matches: 10_000,
    pathological: true,
    textPerBlock: 10,
  },
];

const textWithOneMatch = (length: number) => {
  const prefix = 'needle ';

  return `${prefix}${'x'.repeat(Math.max(0, length - prefix.length))}`;
};

const repeatedMatchText = (length: number, matches: number) => {
  const repeated = 'needle '.repeat(matches);

  assert.ok(repeated.length <= length);

  return `${repeated}${'x'.repeat(Math.max(0, length - repeated.length))}`;
};

const createFindChildren = (cohort: FindCohort): Descendant[] => {
  if (cohort.blocks === 1) {
    return [paragraph(repeatedMatchText(cohort.textPerBlock, cohort.matches))];
  }

  return Array.from({ length: cohort.blocks }, () =>
    paragraph(textWithOneMatch(cohort.textPerBlock))
  );
};

const flatProjectMatches = (
  editor: ReturnType<typeof createYjsTestEditor>,
  matches: readonly Range[]
) => {
  let comparisons = 0;
  let projected = 0;

  for (const [node, path] of NodeApi.nodes(editor)) {
    if (!TextApi.isText(node)) continue;

    for (const match of matches) {
      comparisons += 1;
      if (PathApi.equals(path, match.anchor.path)) projected += 1;
    }
  }

  return { comparisons, projected };
};

const indexedProjectMatches = (
  editor: ReturnType<typeof createPlateEditor>,
  owner: ReturnType<typeof getFindOwner>
) => {
  let lookups = 0;
  let projected = 0;

  for (const [node, path] of NodeApi.nodes(editor)) {
    if (!TextApi.isText(node)) continue;

    lookups += 1;
    projected += owner.matchesAt(path).length;
  }

  return { lookups, projected };
};

const runFindRows = (cohort: FindCohort): TimingRow[] => {
  const editor = createPlateEditor({
    plugins: [FindPlugin],
    initialValue: createFindChildren(cohort),
  });
  const query = 'needle';
  const matches = NodeApi.findTextRanges(editor, query, {
    caseSensitive: false,
  });
  const owner = getFindOwner(editor);

  owner.search(query);

  const flat = flatProjectMatches(editor, matches);
  const indexed = indexedProjectMatches(editor, owner);

  assert.equal(flat.projected, matches.length);
  assert.equal(indexed.projected, matches.length);
  assert.equal(owner.get().matches.length, matches.length);

  const slowRowOptions = cohort.pathological
    ? { packets: 1, samplesPerPacket: 5, warmups: 1 }
    : {};
  const matcher = measure(
    () =>
      measureCall(() => {
        const result = NodeApi.findTextRanges(editor, query, {
          caseSensitive: false,
        });

        assert.equal(result.length, matches.length);
      }),
    slowRowOptions
  );
  const current = measure(
    () =>
      measureCall(() => {
        const result = indexedProjectMatches(editor, owner);

        assert.equal(result.projected, matches.length);
      }),
    slowRowOptions
  );
  const publication = measure(
    () =>
      measureCall(() => {
        owner.search(query, true);

        assert.equal(owner.get().matches.length, matches.length);
      }),
    slowRowOptions
  );
  const baseline = measure(
    () =>
      measureCall(() => {
        const result = flatProjectMatches(editor, matches);

        assert.equal(result.projected, matches.length);
      }),
    slowRowOptions
  );
  const linearWorkBudget = matches.length + cohort.blocks;

  return [
    {
      cohort: `${cohort.id}:text=${
        cohort.blocks * cohort.textPerBlock
      }:leaves=${cohort.blocks}:matches=${matches.length}`,
      counters: { matcherReads: 1, matches: matches.length },
      expectedComplexity: 'one matcher read linear in text plus output matches',
      memory: { leaves: cohort.blocks, matches: matches.length },
      operation: 'query-match',
      owner: 'plitejs NodeApi.findTextRanges',
      summary: matcher,
      verdict: matcher.p95 <= frameBudgetMs ? 'green' : 'red',
    },
    {
      cohort: `${cohort.id}:text=${
        cohort.blocks * cohort.textPerBlock
      }:leaves=${cohort.blocks}:matches=${matches.length}`,
      counters: {
        matcherReads: 1,
        pathIndexBuilds: matches.length,
        resultPublishes: 1,
      },
      expectedComplexity:
        'one matcher read plus one linear Find result publication',
      memory: { leaves: cohort.blocks, matches: matches.length },
      operation: 'find-result-publication-current',
      owner: 'registry FindResultOwner',
      summary: publication,
      verdict: publication.p95 <= frameBudgetMs ? 'green' : 'red',
    },
    {
      cohort: `${cohort.id}:text=${
        cohort.blocks * cohort.textPerBlock
      }:leaves=${cohort.blocks}:matches=${matches.length}`,
      counters: {
        pathLookups: indexed.lookups,
        projectedMatches: indexed.projected,
      },
      expectedComplexity: 'O(leaves) Decoration lowering after publication',
      memory: { leaves: cohort.blocks, matches: matches.length },
      operation: 'indexed-match-projection-current',
      owner: 'registry Find Plate decorate lowering',
      summary: current,
      verdict:
        current.p95 <= frameBudgetMs && indexed.lookups <= linearWorkBudget
          ? 'green'
          : 'red',
    },
    {
      cohort: `${cohort.id}:text=${
        cohort.blocks * cohort.textPerBlock
      }:leaves=${cohort.blocks}:matches=${matches.length}`,
      counters: {
        pathComparisons: flat.comparisons,
        projectedMatches: flat.projected,
      },
      expectedComplexity: 'rejected O(leaves * matches) baseline',
      memory: { leaves: cohort.blocks, matches: matches.length },
      operation: 'flat-match-projection-baseline',
      owner: 'registry Find Plate decorate lowering',
      summary: baseline,
      verdict: 'red',
    },
  ];
};

const clockNoise = measure(() => measureCall(() => {}), {
  packets: 5,
  samplesPerPacket: 100,
  warmups: 100,
});
const rows: TimingRow[] = [];

for (const count of cursorCohorts) {
  for (const operation of ['metadata-update', 'selection-update'] as const) {
    rows.push(runCursorUpdateRow(count, 'cache-only', operation));
    rows.push(runCursorUpdateRow(count, 'keyed', operation));
  }
}

for (const count of widgetCohorts) {
  rows.push(
    runWidgetRow(count),
    ...runNodeWidgetRows(count),
    runAnnotationWidgetRow(count)
  );
}
for (const cohort of FIND_COHORTS) rows.push(...runFindRows(cohort));

const currentRows = rows.filter((row) => !row.operation.includes('baseline'));
const redRows = currentRows.filter((row) => row.verdict === 'red');
const cursorStressCount = cursorCohorts.includes(1000)
  ? 1000
  : Math.max(...cursorCohorts);
const teardown = runCursorTeardownProof(cursorStressCount);
const teardownFailures = teardown.verdict === 'green' ? 0 : 1;
const hardGuardFailures = redRows.length + teardownFailures;
const keyedStressRows = rows.filter(
  (row) =>
    row.cohort === `n=${cursorStressCount}` &&
    row.operation.startsWith('keyed:')
);
const keyedRuntimeWakes = Math.max(
  ...keyedStressRows.map((row) => row.counters.runtimeSubscriberWakes ?? 0)
);
const worstCurrentP95Ms = Math.max(
  ...currentRows.map((row) => row.summary.p95)
);
const pathologicalFindCurrent = rows.find(
  (row) =>
    row.cohort.startsWith('pathological-leaf-fanout:') &&
    row.operation === 'indexed-match-projection-current'
);
const pathologicalFindBaseline = rows.find(
  (row) =>
    row.cohort.startsWith('pathological-leaf-fanout:') &&
    row.operation === 'flat-match-projection-baseline'
);

assert.ok(pathologicalFindCurrent);
assert.ok(pathologicalFindBaseline);

const sourceAfter = Object.fromEntries(
  MEASURED_INPUT_FILES.map((file) => [file, sha256File(file)])
);
assert.deepEqual(
  sourceAfter,
  sourceBefore,
  'Measured sources changed during the benchmark'
);
const result = {
  artifactVersion: 1,
  benchmark: 'transient-projection-scalability',
  config: {
    cursorCohorts,
    findCohorts: FIND_COHORTS,
    frameBudgetMs,
    packetCount,
    samplesPerPacket,
    warmupCount,
    widgetCohorts,
  },
  decision:
    hardGuardFailures === 0 ? 'scales-through-stress' : 'does-not-scale',
  environment: {
    arch: arch(),
    bun: Bun.version,
    bunNodeCompat: process.version,
    cpu: cpus()[0]?.model ?? 'unknown',
    cpuCount: cpus().length,
    platform: platform(),
    release: release(),
    totalMemoryBytes: totalmem(),
  },
  fairness: {
    cursor:
      'Cache-only and keyed rows use the same production awareness adapter, document, cursor states, subscribers, action, warmups, and sample schedule. The keyed row adds the production Yjs projection list, private Plite delta kernel, and Widget adapter.',
    find: 'Current and rejected-baseline rows use the same document and enumerate the same editor leaves. Current installs FindPlugin, publishes through the exact FindResultOwner search path, projects through matchesAt, and asserts identical match counts.',
    timing:
      'Each sample times only the named production operation. Fixture construction, source-array creation, assertions, and cleanup stay outside the timed interval.',
  },
  generatedAt: new Date().toISOString(),
  noise: { clock: clockNoise },
  rows,
  sourceIdentity: {
    head: execFileSync('git', ['rev-parse', 'HEAD'], {
      encoding: 'utf-8',
    }).trim(),
    measuredInputs: sourceAfter,
  },
  summary: {
    hardGuardFailures,
    keyedRuntimeWakesAt1000: keyedRuntimeWakes,
    pathologicalFindBaselineComparisons:
      pathologicalFindBaseline.counters.pathComparisons,
    pathologicalFindBaselineP95Ms: pathologicalFindBaseline.summary.p95,
    pathologicalFindCurrentLookups:
      pathologicalFindCurrent.counters.pathLookups,
    pathologicalFindCurrentP95Ms: pathologicalFindCurrent.summary.p95,
    redRows: redRows.map(
      (row) => `${row.owner}:${row.operation}:${row.cohort}`
    ),
    teardownFailures,
    worstCurrentP95Ms,
  },
  teardown,
};

writeBenchmarkArtifact(outputPath, `${JSON.stringify(result, null, 2)}\n`);

process.stdout.write(
  `METRIC transient_projection_hard_guard_failures=${hardGuardFailures}\n`
);
process.stdout.write(
  `METRIC transient_projection_worst_current_p95_ms=${worstCurrentP95Ms}\n`
);
process.stdout.write(
  `METRIC transient_projection_yjs_keyed_stress_runtime_wakes=${keyedRuntimeWakes}\n`
);
process.stdout.write(
  `METRIC transient_projection_find_pathological_current_p95_ms=${pathologicalFindCurrent.summary.p95}\n`
);
process.stdout.write(
  `METRIC transient_projection_find_pathological_baseline_p95_ms=${pathologicalFindBaseline.summary.p95}\n`
);
process.stdout.write(
  `METRIC transient_projection_teardown_retained_registrations=${teardown.listenersAfterCleanup}\n`
);
process.stdout.write(`ARTIFACT ${outputPath}\n`);
process.stdout.write(`DECISION ${result.decision}\n`);

if (strict && hardGuardFailures > 0) {
  throw new Error(
    `Transient projection missed ${hardGuardFailures} scalability guards; see ${outputPath}.`
  );
}

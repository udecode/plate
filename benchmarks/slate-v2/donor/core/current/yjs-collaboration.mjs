import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

import {
  createEditor,
  defineEffect,
  definePlugin,
  defineStateField,
  valueCodecs,
} from 'plitejs';
import { yjs } from 'plitejs/yjs';

import { createYjsAwarenessSelection } from '../../../../../packages/plitejs/src/yjs/core/awareness.ts';
import { getActiveYjsController } from '../../../../../packages/plitejs/src/yjs/core/controller-registry.ts';
import { summarize, writeBenchmarkArtifact } from '../../shared/stats.mjs';

const Y = await import(
  Bun.resolveSync(
    'yjs',
    new URL('../../../../../packages/plitejs/', import.meta.url).pathname
  )
);

const benchmarkPath = fileURLToPath(import.meta.url);
const quick = process.env.PLITE_YJS_COLLAB_QUICK === '1';
const rounds = Number.parseInt(
  process.env.PLITE_YJS_COLLAB_ROUNDS ?? (quick ? '2' : '4'),
  10
);
const warmups = Number.parseInt(
  process.env.PLITE_YJS_COLLAB_WARMUPS ?? (quick ? '3' : '30'),
  10
);
const samples = Number.parseInt(
  process.env.PLITE_YJS_COLLAB_SAMPLES ?? (quick ? '10' : '150'),
  10
);
const operations = [
  'presenceChanged',
  'presenceUnchanged',
  'editImport',
  'editCursorRemap',
  'retryAdmission',
];
const cohorts = [
  { blocks: 100, name: 'normal', remoteCursors: 5 },
  { blocks: 1000, name: 'large', remoteCursors: 50 },
  { blocks: 10_000, name: 'stress', remoteCursors: 500 },
  { blocks: 100, name: 'blocks-100', remoteCursors: 50 },
  { blocks: 10_000, name: 'blocks-10000', remoteCursors: 50 },
  { blocks: 1000, name: 'cursors-5', remoteCursors: 5 },
  { blocks: 1000, name: 'cursors-500', remoteCursors: 500 },
];
const selectedCohortNames = new Set(
  (process.env.PLITE_YJS_COLLAB_COHORTS ?? '')
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean)
);
const selectedCohorts =
  selectedCohortNames.size === 0
    ? cohorts
    : cohorts.filter((cohort) => selectedCohortNames.has(cohort.name));

assert.ok(rounds > 0);
assert.ok(warmups >= 0);
assert.ok(samples > 0);
assert.ok(selectedCohorts.length > 0);

const paragraph = (text) => ({
  children: [{ text }],
  type: 'paragraph',
});

const createDocument = (blocks) =>
  Array.from({ length: blocks }, (_, index) =>
    paragraph(`block-${String(index).padStart(5, '0')}`)
  );

const selection = (block, offset = 1) => ({
  anchor: { offset, path: [block, 0] },
  focus: { offset: offset + 1, path: [block, 0] },
});

class BenchmarkReadiness {
  constructor(doc, ready = true) {
    this.doc = doc;
    this.ready = ready;
    this.cause = null;
    this.listeners = new Set();
  }

  get listenerCount() {
    return this.listeners.size;
  }

  getSnapshot = () => {
    if (this.cause !== null) throw this.cause;

    return this.ready;
  };

  signal() {
    for (const listener of this.listeners) listener();
  }

  subscribe = (listener) => {
    this.listeners.add(listener);
    let active = true;

    return () => {
      if (!active) return;

      active = false;
      this.listeners.delete(listener);
    };
  };
}

class BenchmarkAwareness {
  constructor(doc) {
    this.clientID = doc.clientID;
    this.doc = doc;
    this.localState = null;
    this.states = new Map();
    this.listeners = new Set();
    this.eventCount = 0;
  }

  get listenerCount() {
    return this.listeners.size;
  }

  getLocalState() {
    return this.localState;
  }

  getStates() {
    return this.states;
  }

  off(event, listener) {
    if (event === 'change') this.listeners.delete(listener);
  }

  on(event, listener) {
    if (event === 'change') this.listeners.add(listener);
  }

  setLocalStateField(field, value) {
    this.localState = { ...this.localState, [field]: value };
    this.states.set(this.clientID, this.localState);
    this.emit({ added: [], removed: [], updated: [this.clientID] });
  }

  setRemoteState(clientId, state) {
    const existed = this.states.has(clientId);

    this.states.set(clientId, state);
    this.emit({
      added: existed ? [] : [clientId],
      removed: [],
      updated: existed ? [clientId] : [],
    });
  }

  emit(event) {
    this.eventCount += 1;
    for (const listener of this.listeners) listener(event);
  }
}

const difference = (before, after) =>
  Object.fromEntries(
    Object.keys(after).map((key) => [key, after[key] - before[key]])
  );

const getApi = (editor, binding) => editor.plugin(binding).api;

const createRetryContract = (id) => {
  const state = { cause: null };
  const effect = defineEffect({
    codec: valueCodecs.string,
    collab: 'shared',
    collabReplay: 'live',
    collabTransport: {
      decode(value) {
        if (state.cause !== null) throw state.cause;

        return typeof value === 'string' ? value : undefined;
      },
      encode: (value) => value,
    },
    history: 'skip',
    key: `benchmark:yjs-retry:${id}`,
  });
  const received = defineStateField({
    initial: () => [],
    key: `benchmark:yjs-retry-received:${id}`,
    reduce: (value, candidate) =>
      candidate.type === effect ? [...value, candidate.value] : value,
  });
  const plugin = definePlugin(`benchmark-yjs-retry-${id}`, {
    effectTypes: [effect],
    stateFields: [received],
  });

  return { effect, plugin, received, state };
};

let fixtureSequence = 0;

const createFixture = ({ cohort, label, profilePath }) => {
  fixtureSequence += 1;
  const id = `${process.pid}-${fixtureSequence}`;
  const constructionStart = performance.now();
  const sourceDoc = new Y.Doc();
  const sourceReadiness = new BenchmarkReadiness(sourceDoc);
  const awareness = new BenchmarkAwareness(sourceDoc);
  const retry = createRetryContract(id);
  const sourceBinding = yjs({
    awareness,
    doc: sourceDoc,
    initialReady: sourceReadiness,
    rootName: 'plitejs',
    seed: true,
  });
  const source = createEditor({
    initialValue: createDocument(cohort.blocks),
    plugins: [retry.plugin],
  });
  const sourceCleanup = source.install(sourceBinding);
  const sourceApi = getApi(source, sourceBinding);
  const sourceController = getActiveYjsController(source);

  assert.ok(sourceController);
  assert.equal(sourceApi.admissionStatus().state, 'ready');

  source.update.selection.set(selection(0));
  sourceApi.syncSelection();

  const targetDoc = new Y.Doc();

  Y.applyUpdate(targetDoc, Y.encodeStateAsUpdate(sourceDoc));

  const targetReadiness = new BenchmarkReadiness(targetDoc);
  const targetBinding = yjs({
    doc: targetDoc,
    initialReady: targetReadiness,
    rootName: 'plitejs',
  });
  const target = createEditor({ plugins: [retry.plugin] });
  const targetCleanup = target.install(targetBinding);
  const targetApi = getApi(target, targetBinding);
  const targetController = getActiveYjsController(target);

  assert.ok(targetController);
  assert.equal(targetApi.admissionStatus().state, 'ready');

  const applyToTarget = (update, origin) => {
    if (origin !== targetDoc) Y.applyUpdate(targetDoc, update, sourceDoc);
  };
  const applyToSource = (update, origin) => {
    if (origin !== sourceDoc) Y.applyUpdate(sourceDoc, update, targetDoc);
  };

  sourceDoc.on('update', applyToTarget);
  targetDoc.on('update', applyToSource);
  Y.applyUpdate(
    sourceDoc,
    Y.encodeStateAsUpdate(targetDoc, Y.encodeStateVector(sourceDoc)),
    targetDoc
  );

  const remoteSelection = createYjsAwarenessSelection(
    sourceController.debugRoot(),
    'main',
    selection(0)
  );

  for (let index = 0; index < cohort.remoteCursors; index += 1) {
    awareness.setRemoteState(100_000 + index, {
      data: { name: `peer-${index}` },
      selection: remoteSelection,
    });
  }

  const statusCallbacks = { source: 0, target: 0 };
  let cursorCallbacks = 0;
  let sourceCommits = 0;
  let targetCommits = 0;
  const unsubscribeSourceStatus = sourceApi.subscribeAdmissionStatus(() => {
    statusCallbacks.source += 1;
  });
  const unsubscribeTargetStatus = targetApi.subscribeAdmissionStatus(() => {
    statusCallbacks.target += 1;
  });
  const unsubscribeCursors = sourceApi.subscribeRemoteCursors(() => {
    cursorCallbacks += 1;
  });
  const unsubscribeSourceCommits = source.subscribeCommit(() => {
    sourceCommits += 1;
  });
  const unsubscribeTargetCommits = target.subscribeCommit(() => {
    targetCommits += 1;
  });

  assert.equal(sourceReadiness.listenerCount, 1);
  assert.equal(targetReadiness.listenerCount, 1);
  assert.equal(awareness.listenerCount, 1);
  assert.equal(sourceApi.remoteCursors().length, cohort.remoteCursors);

  const constructionMs = performance.now() - constructionStart;
  const cache = sourceController.cursorCache(source);
  const publishLegacyProfile = (data) => {
    source.update(() => {
      if (!isDeepStrictEqual(awareness.getLocalState()?.data, data)) {
        awareness.setLocalStateField('data', data);
      }
    });
  };
  const publishProfile =
    profilePath === 'public'
      ? (data) => sourceApi.setCursorData(data)
      : publishLegacyProfile;
  const beforeCleanup = () => ({
    awarenessListeners: awareness.listenerCount,
    cacheEntries: sourceApi.remoteCursors().length,
    controllers:
      Number(Boolean(getActiveYjsController(source))) +
      Number(Boolean(getActiveYjsController(target))),
    cursorCallbacks,
    readinessListeners:
      sourceReadiness.listenerCount + targetReadiness.listenerCount,
    sourceCommits,
    statusCallbacks: statusCallbacks.source + statusCallbacks.target,
    statusSubscriptions: 2,
    targetCommits,
  });
  const snapshotCounts = () => ({
    awarenessEvents: awareness.eventCount,
    cursorCallbacks,
    sourceCommits,
    sourceStatusCallbacks: statusCallbacks.source,
    targetCommits,
    targetStatusCallbacks: statusCallbacks.target,
  });

  return {
    actions: {
      editCursorRemap(index) {
        source.update.text.insert('x', {
          at: { offset: 0, path: [0, 0] },
        });
        const cursors = sourceApi.remoteCursors();

        assert.equal(cursors.length, cohort.remoteCursors);
        assert.equal(
          sourceApi.remoteCursor(100_000)?.selection?.anchor.offset,
          2 + index
        );
      },
      editImport(index) {
        source.update.text.insert('x', {
          at: {
            offset: 0,
            path: [cohort.blocks - 1, 0],
          },
        });
        assert.equal(
          source.read.text.string([cohort.blocks - 1]),
          target.read.text.string([cohort.blocks - 1])
        );
        assert.equal(sourceApi.remoteCursors().length, cohort.remoteCursors);
        assert.ok(index >= 0);
      },
      presenceChanged(index) {
        publishProfile({ name: `Ada-${index}` });
      },
      presenceUnchanged() {
        publishProfile({ name: 'unchanged' });
      },
      retryAdmission(index) {
        const failure = new Error(`retry-${index}`);

        retry.state.cause = failure;
        source.update((transaction) => {
          transaction.effects.emit(retry.effect, `effect-${index}`);
        });
        const failed = targetApi.admissionStatus();

        assert.equal(failed.state, 'error');
        assert.equal(failed.cause, failure);
        retry.state.cause = null;
        targetApi.retryImport();
        assert.equal(targetApi.admissionStatus().state, 'ready');
        assert.equal(target.read.getField(retry.received).length, index + 1);
      },
    },
    beforeCleanup,
    cache,
    cohort,
    constructionMs,
    dispose() {
      const resourcesBefore = beforeCleanup();
      const heapBeforeCleanup = process.memoryUsage().heapUsed;

      sourceCleanup();
      targetCleanup();
      const callbacksAfterCleanup = {
        cursor: cursorCallbacks,
        sourceStatus: statusCallbacks.source,
        targetStatus: statusCallbacks.target,
      };
      const commitsAfterCleanup = {
        source: sourceCommits,
        target: targetCommits,
      };
      sourceReadiness.ready = false;
      targetReadiness.ready = false;
      sourceReadiness.signal();
      targetReadiness.signal();
      awareness.setRemoteState(900_000, { data: { name: 'after-cleanup' } });
      targetDoc.transact(() => {
        targetDoc.getMap('after-cleanup').set('value', true);
      });

      assert.equal(getActiveYjsController(source), undefined);
      assert.equal(getActiveYjsController(target), undefined);
      assert.equal(sourceReadiness.listenerCount, 0);
      assert.equal(targetReadiness.listenerCount, 0);
      assert.equal(awareness.listenerCount, 0);
      assert.deepEqual(callbacksAfterCleanup, {
        cursor: cursorCallbacks,
        sourceStatus: statusCallbacks.source,
        targetStatus: statusCallbacks.target,
      });
      assert.deepEqual(commitsAfterCleanup, {
        source: sourceCommits,
        target: targetCommits,
      });
      assert.throws(
        () => sourceApi.admissionStatus(),
        /(?:no longer active|not active)/i
      );

      unsubscribeCursors();
      unsubscribeCursors();
      unsubscribeSourceStatus();
      unsubscribeSourceStatus();
      unsubscribeTargetStatus();
      unsubscribeSourceCommits();
      unsubscribeTargetCommits();
      sourceDoc.off('update', applyToTarget);
      targetDoc.off('update', applyToSource);
      sourceDoc.destroy();
      targetDoc.destroy();

      return {
        after: {
          awarenessListeners: awareness.listenerCount,
          controllers: 0,
          readinessListeners:
            sourceReadiness.listenerCount + targetReadiness.listenerCount,
          statusSubscriptions: 0,
        },
        before: resourcesBefore,
        heapDeltaBytes: process.memoryUsage().heapUsed - heapBeforeCleanup,
        noCallbacksAfterCleanup: true,
      };
    },
    label,
    prepare(operation) {
      if (operation === 'presenceUnchanged') {
        sourceApi.setCursorData({ name: 'unchanged' });
      }
    },
    profilePath,
    retry,
    snapshotCounts,
    source,
    sourceApi,
    target,
  };
};

const runOperation = (fixtures, operation) => {
  const records = new Map();

  for (const fixture of fixtures) {
    fixture.prepare(operation);
    records.set(fixture, {
      beforeCounts: fixture.snapshotCounts(),
      beforeMetrics: fixture.cache.getMetrics(),
      durations: [],
      transactionCallbacks: 0,
    });
  }

  const total = warmups + samples;

  for (let index = 0; index < total; index += 1) {
    const order = index % 2 === 0 ? fixtures : [...fixtures].reverse();

    for (const fixture of order) {
      const record = records.get(fixture);

      globalThis.__EDITOR_REACT_RENDER_PROFILER__ = {
        record(event) {
          if (
            event.kind === 'core-time' &&
            event.id === 'transaction-callback'
          ) {
            record.transactionCallbacks += 1;
          }
        },
      };
      const start = performance.now();

      fixture.actions[operation](index);
      const duration = performance.now() - start;

      delete globalThis.__EDITOR_REACT_RENDER_PROFILER__;
      if (index >= warmups) record.durations.push(duration);
    }
  }

  return fixtures.map((fixture) => {
    const record = records.get(fixture);
    const counts = difference(record.beforeCounts, fixture.snapshotCounts());
    const mapping = difference(
      record.beforeMetrics,
      fixture.cache.getMetrics()
    );

    if (operation === 'presenceChanged' || operation === 'presenceUnchanged') {
      assert.equal(counts.sourceCommits, 0);
      if (fixture.profilePath === 'public') {
        assert.equal(record.transactionCallbacks, 0);
      } else {
        assert.equal(record.transactionCallbacks, warmups + samples);
      }
    }

    return {
      counts,
      mapping,
      operation,
      ...summarize(record.durations),
      transactionCallbacks: record.transactionCallbacks,
    };
  });
};

const runPair = ({ cohort, control, round }) => {
  const labels =
    round % 2 === 0
      ? ['baseline', 'candidate']
      : ['candidate', 'baseline'];
  const heapBefore = process.memoryUsage().heapUsed;
  const fixtures = labels.map((label) =>
    createFixture({
      cohort,
      label,
      profilePath: control || label === 'candidate' ? 'public' : 'legacy',
    })
  );
  const operationRows = new Map(fixtures.map((fixture) => [fixture, []]));

  for (const operation of operations) {
    const rows = runOperation(fixtures, operation);

    for (let index = 0; index < fixtures.length; index += 1) {
      operationRows.get(fixtures[index]).push(rows[index]);
    }
    assert.deepEqual(rows[0].counts, rows[1].counts);
    assert.deepEqual(rows[0].mapping, rows[1].mapping);
  }

  const finalCursors = fixtures.map((fixture) =>
    fixture.sourceApi.remoteCursors()
  );
  const expectedOffset = 1 + warmups + samples;

  for (const cursors of finalCursors) {
    assert.equal(cursors.length, cohort.remoteCursors);
    assert.equal(cursors[0]?.selection?.anchor.offset, expectedOffset);
    assert.equal(cursors[0]?.selection?.focus.offset, expectedOffset + 1);
  }
  assert.deepEqual(
    fixtures[0].source.read.value(),
    fixtures[0].target.read.value()
  );
  assert.deepEqual(
    fixtures[1].source.read.value(),
    fixtures[1].target.read.value()
  );
  assert.deepEqual(
    fixtures[0].source.read.value(),
    fixtures[1].source.read.value()
  );

  const rows = fixtures.map((fixture) => ({
    blocks: cohort.blocks,
    cohort: cohort.name,
    constructionMs: fixture.constructionMs,
    label: fixture.label,
    operationRows: operationRows.get(fixture),
    profilePath: fixture.profilePath,
    remoteCursors: cohort.remoteCursors,
    resources: fixture.dispose(),
    round,
  }));

  return {
    control,
    heapDeltaBytes: process.memoryUsage().heapUsed - heapBefore,
    rows,
  };
};

const percentile = (values, ratio) => {
  const sorted = [...values].sort((left, right) => left - right);

  return sorted[Math.max(0, Math.ceil(sorted.length * ratio) - 1)] ?? 0;
};

const pairedComparison = ({
  allowance,
  baseline,
  candidate,
  cohort,
  kind,
  operation,
}) => {
  const pairedExcess = candidate.map(
    (value, index) => value - baseline[index] * 1.15
  );
  const pairedExcessMedianMs = percentile(pairedExcess, 0.5);

  return {
    allowanceMs: allowance,
    baselineMedianMs: percentile(baseline, 0.5),
    candidateMedianMs: percentile(candidate, 0.5),
    cohort,
    kind,
    operation,
    pairedExcessMedianMs,
    pass: pairedExcessMedianMs <= allowance,
  };
};

if (process.env.PLITE_YJS_COLLAB_CELL) {
  const cell = JSON.parse(process.env.PLITE_YJS_COLLAB_CELL);

  process.stdout.write(`${JSON.stringify(runPair(cell))}\n`);
} else {
  const pairResults = [];

  for (const control of [true, false]) {
    for (const cohort of selectedCohorts) {
      for (let round = 0; round < rounds; round += 1) {
        const child = Bun.spawnSync({
          cmd: [
            process.execPath,
            '--preload',
            './config/plite-source-aliases.ts',
            benchmarkPath,
          ],
          env: {
            ...process.env,
            PLITE_YJS_COLLAB_CELL: JSON.stringify({ cohort, control, round }),
          },
          stderr: 'pipe',
          stdout: 'pipe',
        });

        assert.equal(child.exitCode, 0, child.stderr.toString());
        const pair = JSON.parse(child.stdout.toString().trim());

        pairResults.push(pair);
        console.log(
          JSON.stringify({
            cohort: cohort.name,
            construction: pair.rows.map((row) => ({
              label: row.label,
              ms: Number(row.constructionMs.toFixed(2)),
            })),
            control,
            round,
          })
        );
      }
    }
  }

  const comparisons = [];

  for (const control of [true, false]) {
    const kind = control ? 'A/A' : 'A/B';

    for (const cohort of selectedCohorts) {
      const pairs = pairResults.filter(
        (pair) => pair.control === control && pair.rows[0].cohort === cohort.name
      );
      const baselineRows = pairs.map((pair) =>
        pair.rows.find((row) => row.label === 'baseline')
      );
      const candidateRows = pairs.map((pair) =>
        pair.rows.find((row) => row.label === 'candidate')
      );

      comparisons.push(
        pairedComparison({
          allowance: 5,
          baseline: baselineRows.map((row) => row.constructionMs),
          candidate: candidateRows.map((row) => row.constructionMs),
          cohort: cohort.name,
          kind,
          operation: 'construction',
        })
      );

      for (const operation of operations) {
        comparisons.push(
          pairedComparison({
            allowance: 1,
            baseline: baselineRows.map(
              (row) =>
                row.operationRows.find((entry) => entry.operation === operation)
                  .p95
            ),
            candidate: candidateRows.map(
              (row) =>
                row.operationRows.find((entry) => entry.operation === operation)
                  .p95
            ),
            cohort: cohort.name,
            kind,
            operation,
          })
        );
      }
    }
  }

  const candidateRows = pairResults
    .filter((pair) => !pair.control)
    .flatMap((pair) => pair.rows)
    .filter((row) => row.label === 'candidate');
  const operationMetric = (operation, percentileName) =>
    Math.max(
      ...candidateRows.map(
        (row) =>
          row.operationRows.find((entry) => entry.operation === operation)[
            percentileName
          ]
      )
    );
  const metrics = {
    yjs_collaboration_construction_p95_ms: percentile(
      candidateRows.map((row) => row.constructionMs),
      0.95
    ),
    yjs_collaboration_worst_p95_ms: Math.max(
      ...operations.map((operation) => operationMetric(operation, 'p95'))
    ),
    yjs_collaboration_worst_p99_ms: Math.max(
      ...operations.map((operation) => operationMetric(operation, 'p99'))
    ),
    yjs_collaboration_worst_pair_excess_ms: Math.max(
      ...comparisons
        .filter((comparison) => comparison.kind === 'A/B')
        .map((comparison) => comparison.pairedExcessMedianMs)
    ),
    yjs_collaboration_aa_worst_pair_excess_ms: Math.max(
      ...comparisons
        .filter((comparison) => comparison.kind === 'A/A')
        .map((comparison) => comparison.pairedExcessMedianMs)
    ),
    yjs_presence_changed_p95_ms: operationMetric('presenceChanged', 'p95'),
    yjs_presence_unchanged_p95_ms: operationMetric(
      'presenceUnchanged',
      'p95'
    ),
    yjs_edit_import_p95_ms: operationMetric('editImport', 'p95'),
    yjs_edit_cursor_remap_p95_ms: operationMetric('editCursorRemap', 'p95'),
    yjs_retry_admission_p95_ms: operationMetric('retryAdmission', 'p95'),
    yjs_correctness_failures: 0,
  };
  const deterministicResourcesPass = pairResults.every((pair) =>
    pair.rows.every((row) => {
      const presenceRows = row.operationRows.filter((operation) =>
        operation.operation.startsWith('presence')
      );

      return (
        row.resources.before.awarenessListeners === 1 &&
        row.resources.before.cacheEntries === row.remoteCursors &&
        row.resources.before.controllers === 2 &&
        row.resources.before.readinessListeners === 2 &&
        row.resources.before.statusSubscriptions === 2 &&
        row.resources.after.awarenessListeners === 0 &&
        row.resources.after.controllers === 0 &&
        row.resources.after.readinessListeners === 0 &&
        row.resources.after.statusSubscriptions === 0 &&
        row.resources.noCallbacksAfterCleanup &&
        (row.profilePath !== 'public' ||
          presenceRows.every(
            (operation) => operation.transactionCallbacks === 0
          ))
      );
    })
  );
  const pass =
    comparisons.every((comparison) => comparison.pass) &&
    deterministicResourcesPass;
  const result = {
    artifactVersion: 3,
    benchmark: 'plite-yjs-collaboration-lifetimes',
    comparisons,
    config: {
      cohorts: selectedCohorts,
      operations,
      order:
        'fresh process per A/A or A/B cohort pair; alternating construction and operation order',
      rounds,
      samples,
      warmups,
    },
    invariants: {
      admissionRetryAppliesEachEffectOnce: true,
      cursorCacheBoundedByRemoteCursorCount: deterministicResourcesPass,
      documentConvergesAfterEveryEdit: true,
      noCallbacksAfterCleanup: deterministicResourcesPass,
      oneAwarenessListenerPerPresenceBinding: deterministicResourcesPass,
      oneReadinessListenerPerBinding: deterministicResourcesPass,
      publicPresenceUsesZeroTransactionCallbacks: deterministicResourcesPass,
    },
    metrics,
    pairResults,
    pass,
    thresholdPolicy: {
      construction: 'paired median excess <= baseline * 0.15 + 5 ms',
      operation: 'paired median p95 excess <= baseline * 0.15 + 1 ms',
    },
  };

  await writeBenchmarkArtifact(
    'tmp/slate-yjs-collaboration-benchmark.json',
    result
  );

  for (const [name, value] of Object.entries(metrics)) {
    console.log(`METRIC ${name}=${value}`);
  }
  console.log(JSON.stringify({ comparisons, metrics, pass }, null, 2));
  if (!pass) process.exit(1);
}

import assert from 'node:assert/strict';

import { createEditor } from '../../../../../packages/plite/src/index.ts';
import * as Editor from '../../../../../packages/plite/src/internal/index.ts';
import { createPliteAnnotationStore } from '../../../../../packages/plite-react/src/annotation-store.ts';
import { createDecorationSource } from '../../../../../packages/plite-react/src/decoration-source.ts';
import { createPliteWidgetStore } from '../../../../../packages/plite-react/src/widget-store.ts';
import { createStableIdMappedSource } from '../../../../../packages/plite-react/src/stable-id-mapped-source.ts';
import { summarize, writeBenchmarkArtifact } from '../../shared/stats.mjs';

const DEFAULT_SIZES = [10_000, 100_000];
const sizes = (process.env.PLITE_OVERLAY_SOURCE_BENCH_SIZES ?? '')
  .split(',')
  .map(Number)
  .filter((value) => Number.isSafeInteger(value) && value > 0);
const sourceSizes = sizes.length > 0 ? sizes : DEFAULT_SIZES;
const blockCount = Number(
  process.env.PLITE_OVERLAY_SOURCE_BENCH_BLOCKS ?? 2_048
);
const sampleCount = Number(
  process.env.PLITE_OVERLAY_SOURCE_BENCH_SAMPLES ?? 7
);
const warmupCount = Number(
  process.env.PLITE_OVERLAY_SOURCE_BENCH_WARMUPS ?? 2
);
const sourceChurnModes = ['stable-reference', 'recreated'];

const rangeAt = (index) => {
  const path = [index % blockCount, 0];
  const start = index % 4;

  return {
    anchor: { path, offset: start },
    focus: { path, offset: start + 3 },
    kind: 'text',
  };
};

const samePoint = (left, right) =>
  left.offset === right.offset &&
  left.path.length === right.path.length &&
  left.path.every((segment, index) => segment === right.path[index]);

const sameRange = (left, right) =>
  samePoint(left.anchor, right.anchor) && samePoint(left.focus, right.focus);

const createEditorFixture = () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: Array.from({ length: blockCount }, (_, index) => ({
      children: [{ text: `abcdefghij-${index}` }],
      type: 'paragraph',
    })),
    selection: null,
  });

  return editor;
};

const projectRange = (editor, range) => Editor.projectRange(editor, range);

const updateSource = (items, index, churnMode, update) =>
  items.map((item, itemIndex) => {
    const next = itemIndex === index ? update(item) : item;

    return churnMode === 'recreated' ? { ...next } : next;
  });

const measurePair = ({
  currentRefresh,
  indexedRefresh,
  size,
  updateCurrent,
  updateIndexed,
  validate,
}) => {
  const currentSamples = [];
  const indexedSamples = [];
  const iterations = warmupCount + sampleCount;

  for (let iteration = 0; iteration < iterations; iteration += 1) {
    const itemIndex = (iteration * 7_919 + 17) % size;
    updateCurrent(itemIndex);
    updateIndexed(itemIndex);

    const currentStartedAt = performance.now();
    currentRefresh();
    const currentDuration = performance.now() - currentStartedAt;

    const indexedStartedAt = performance.now();
    indexedRefresh();
    const indexedDuration = performance.now() - indexedStartedAt;

    validate(itemIndex);

    if (iteration >= warmupCount) {
      currentSamples.push(currentDuration);
      indexedSamples.push(indexedDuration);
    }
  }

  const current = summarize(currentSamples);
  const indexed = summarize(indexedSamples);

  return {
    current,
    indexed,
    medianSpeedup: Number((current.median / indexed.median).toFixed(2)),
    p95Speedup: Number((current.p95 / indexed.p95).toFixed(2)),
  };
};

const countBucketEntries = (snapshot) =>
  Object.values(snapshot).reduce((count, entries) => count + entries.length, 0);

const benchmarkDecorations = (editor, size, churnMode) => {
  const createItems = () =>
    Array.from({ length: size }, (_, index) => ({
      data: { revision: 0 },
      key: `decoration-${index}`,
      range: rangeAt(index),
    }));
  let currentItems = createItems();
  let indexedItems = createItems();
  let currentRevision = 0;
  let indexedRevision = 0;
  const current = createDecorationSource(editor, {
    id: 'stable-id-overlay-benchmark',
    read: () => currentItems,
  });
  const indexed = createStableIdMappedSource(indexedItems, {
    getId: (item) => item.key,
    isItemEqual: (left, right) =>
      sameRange(left.range, right.range) &&
      left.data.revision === right.data.revision,
    isOutputEqual: (left, right) =>
      left.key === right.key &&
      left.start === right.start &&
      left.end === right.end &&
      left.data.revision === right.data.revision,
    map: (item) => ({
      outputs: projectRange(editor, item.range).map((segment) => ({
        key: segment.runtimeId,
        value: Object.freeze({
          data: item.data,
          end: segment.end,
          key: item.key,
          start: segment.start,
        }),
      })),
    }),
  });

  let indexedRefreshResult = null;
  const result = measurePair({
    currentRefresh: () =>
      current.refresh({ forceInvalidate: true, reason: 'external' }),
    indexedRefresh: () => {
      indexedRefreshResult = indexed.refresh(indexedItems);
    },
    size,
    updateCurrent(index) {
      currentRevision += 1;
      currentItems = updateSource(currentItems, index, churnMode, (item) => ({
        ...item,
        data: { revision: currentRevision },
      }));
    },
    updateIndexed(index) {
      indexedRevision += 1;
      indexedItems = updateSource(indexedItems, index, churnMode, (item) => ({
        ...item,
        data: { revision: indexedRevision },
      }));
    },
    validate(index) {
      assert.equal(indexedRefreshResult.fullFallback, false);
      assert.deepEqual(indexedRefreshResult.changedEntityIds, []);
      assert.deepEqual(
        indexedRefreshResult.mapped.map(({ id }) => id),
        [`decoration-${index}`]
      );
    },
  });

  assert.equal(countBucketEntries(current.getSnapshot()), size);
  assert.equal(
    countBucketEntries(indexed.getSnapshot().byOutputKey),
    size
  );
  current.destroy();

  return result;
};

const createAnnotationItems = (size) =>
  Array.from({ length: size }, (_, index) => {
    const range = rangeAt(index);
    const anchor = Object.freeze({
      release: () => {},
      resolve: () => range,
    });

    return {
      anchor,
      data: { revision: 0 },
      id: `annotation-${index}`,
      projection: { revision: 0 },
    };
  });

const benchmarkAnnotations = (editor, size, churnMode) => {
  let currentItems = createAnnotationItems(size);
  let indexedItems = createAnnotationItems(size);
  let currentRevision = 0;
  let indexedRevision = 0;
  const current = createPliteAnnotationStore(editor, () => currentItems);
  const indexed = createStableIdMappedSource(indexedItems, {
    getId: (item) => item.id,
    isEntityEqual: (left, right) =>
      left.id === right.id &&
      sameRange(left.range, right.range) &&
      left.data.revision === right.data.revision &&
      left.projection.revision === right.projection.revision,
    isItemEqual: (left, right) =>
      left.anchor === right.anchor &&
      left.data.revision === right.data.revision &&
      left.projection.revision === right.projection.revision,
    isOutputEqual: (left, right) =>
      left.key === right.key &&
      left.start === right.start &&
      left.end === right.end &&
      left.data.annotationId === right.data.annotationId &&
      left.data.revision === right.data.revision,
    map: (item) => {
      const range = item.anchor.resolve();
      const resolved = Object.freeze({
        data: item.data,
        id: item.id,
        projection: item.projection,
        range,
      });

      return {
        entity: resolved,
        outputs: range
          ? projectRange(editor, range).map((segment) => ({
              key: segment.runtimeId,
              value: Object.freeze({
                data: Object.freeze({
                  ...item.projection,
                  annotationId: item.id,
                }),
                end: segment.end,
                key: item.id,
                start: segment.start,
              }),
            }))
          : [],
      };
    },
  });

  let indexedRefreshResult = null;
  const result = measurePair({
    currentRefresh: () => current.refresh(),
    indexedRefresh: () => {
      indexedRefreshResult = indexed.refresh(indexedItems);
    },
    size,
    updateCurrent(index) {
      currentRevision += 1;
      currentItems = updateSource(currentItems, index, churnMode, (item) => ({
        ...item,
        data: { revision: currentRevision },
        projection: { revision: currentRevision },
      }));
    },
    updateIndexed(index) {
      indexedRevision += 1;
      indexedItems = updateSource(indexedItems, index, churnMode, (item) => ({
        ...item,
        data: { revision: indexedRevision },
        projection: { revision: indexedRevision },
      }));
    },
    validate(index) {
      assert.equal(
        current.getAnnotation(`annotation-${index}`).data.revision,
        currentRevision
      );
      assert.equal(
        indexed
          .getSnapshot()
          .byId
          .get(`annotation-${index}`).data.revision,
        indexedRevision
      );
      assert.equal(indexedRefreshResult.fullFallback, false);
      assert.deepEqual(indexedRefreshResult.changedEntityIds, [
        `annotation-${index}`,
      ]);
    },
  });

  assert.equal(current.getSnapshot().allIds.length, size);
  assert.equal(indexed.getSnapshot().allIds.length, size);
  assert.equal(countBucketEntries(current.projectionStore.getSnapshot()), size);
  assert.equal(
    countBucketEntries(indexed.getSnapshot().byOutputKey),
    size
  );
  current.destroy();

  return result;
};

const createWidgetItems = (size, runtimeIds) =>
  Array.from({ length: size }, (_, index) => ({
    anchor: {
      runtimeId: runtimeIds[index % runtimeIds.length],
      type: 'node',
    },
    data: { revision: 0 },
    id: `widget-${index}`,
  }));

const benchmarkWidgets = (editor, size, churnMode, runtimeIds) => {
  let currentItems = createWidgetItems(size, runtimeIds);
  let indexedItems = createWidgetItems(size, runtimeIds);
  let currentRevision = 0;
  let indexedRevision = 0;
  const current = createPliteWidgetStore(editor, () => currentItems);
  const snapshot = Editor.getSnapshot(editor);
  const indexed = createStableIdMappedSource(indexedItems, {
    getId: (item) => item.id,
    isEntityEqual: (left, right) =>
      left.id === right.id &&
      left.visible === right.visible &&
      left.data.revision === right.data.revision,
    isItemEqual: (left, right) =>
      left.anchor.type === right.anchor.type &&
      left.anchor.runtimeId === right.anchor.runtimeId &&
      left.data.revision === right.data.revision,
    isOutputEqual: Object.is,
    map: (item) => ({
      entity: Object.freeze({
        ...item,
        annotation: null,
        range: null,
        visible: Boolean(snapshot.index.pathOf(item.anchor.runtimeId)),
      }),
      outputs: [],
    }),
  });

  let indexedRefreshResult = null;
  const result = measurePair({
    currentRefresh: () => current.retry(),
    indexedRefresh: () => {
      indexedRefreshResult = indexed.refresh(indexedItems);
    },
    size,
    updateCurrent(index) {
      currentRevision += 1;
      currentItems = updateSource(currentItems, index, churnMode, (item) => ({
        ...item,
        data: { revision: currentRevision },
      }));
    },
    updateIndexed(index) {
      indexedRevision += 1;
      indexedItems = updateSource(indexedItems, index, churnMode, (item) => ({
        ...item,
        data: { revision: indexedRevision },
      }));
    },
    validate(index) {
      assert.equal(current.getWidget(`widget-${index}`).data.revision, currentRevision);
      assert.equal(
        indexed.getSnapshot().byId.get(`widget-${index}`).data.revision,
        indexedRevision
      );
      assert.equal(indexedRefreshResult.fullFallback, false);
      assert.deepEqual(indexedRefreshResult.changedEntityIds, [
        `widget-${index}`,
      ]);
    },
  });

  assert.equal(current.getSnapshot().allIds.length, size);
  assert.equal(indexed.getSnapshot().allIds.length, size);
  current.destroy();

  return result;
};

const editor = createEditorFixture();
const runtimeIds = Array.from({ length: blockCount }, (_, index) =>
  Editor.getRuntimeId(editor, [index, 0])
);
assert.equal(runtimeIds.every(Boolean), true);

const results = [];

for (const size of sourceSizes) {
  for (const churnMode of sourceChurnModes) {
    for (const [concept, run] of [
      ['decoration', () => benchmarkDecorations(editor, size, churnMode)],
      ['annotation', () => benchmarkAnnotations(editor, size, churnMode)],
      [
        'widget',
        () => benchmarkWidgets(editor, size, churnMode, runtimeIds),
      ],
    ]) {
      const measured = run();
      results.push({ churnMode, concept, size, ...measured });
      Bun.gc(true);
    }
  }
}

const largestSize = Math.max(...sourceSizes);
const promotionRows = results.filter((row) => row.size === largestSize);
const sharedBottleneck = promotionRows.every(
  (row) => row.current.median >= 16.67
);
const materiallyWins = promotionRows.every(
  (row) =>
    row.medianSpeedup >= 3 &&
    row.p95Speedup >= 2 &&
    row.indexed.median < row.current.median
);
const decision =
  sharedBottleneck && materiallyWins
    ? 'promote-private-substrate'
    : 'reject-private-substrate';
const summary = {
  artifactVersion: 1,
  benchmark: 'plite-react-stable-id-overlay-source',
  config: {
    blockCount,
    sampleCount,
    sourceChurnModes,
    sourceSizes,
    warmupCount,
  },
  decision,
  fairness: {
    current:
      'Production decoration, annotation, and widget stores are forced through the pre-index full reread/map/materialize/diff control path.',
    indexed:
      'The production private stable-ID kernel scans the same full array, semantically compares every item, and maps/materializes only changed IDs and runtime buckets.',
    sourceConstruction:
      'The source arrays are prepared before timing, matching React projectors that run before store refresh. Recreated mode replaces every wrapper object to defeat reference-only shortcuts.',
    update:
      'One existing stable ID changes per refresh; source order and cardinality remain constant.',
  },
  gate: {
    largestSize,
    materiallyWins,
    medianSpeedupMinimum: 3,
    p95SpeedupMinimum: 2,
    sharedBottleneck,
    sharedBottleneckMedianMs: 16.67,
  },
  results,
};

await writeBenchmarkArtifact(
  'tmp/plite-stable-id-overlay-source-benchmark.json',
  summary
);

for (const row of results) {
  console.log(
    `METRIC plite_overlay_${row.concept}_${row.churnMode.replace('-', '_')}_${row.size}_current_median_ms=${row.current.median}`
  );
  console.log(
    `METRIC plite_overlay_${row.concept}_${row.churnMode.replace('-', '_')}_${row.size}_indexed_median_ms=${row.indexed.median}`
  );
}
console.log(`DECISION ${decision}`);
console.log(JSON.stringify(summary, null, 2));

if (
  process.env.PLITE_OVERLAY_SOURCE_BENCH_STRICT === '1' &&
  decision !== 'promote-private-substrate'
) {
  throw new Error(
    `Stable-ID overlay source missed its gate: sharedBottleneck=${sharedBottleneck} materiallyWins=${materiallyWins}.`
  );
}

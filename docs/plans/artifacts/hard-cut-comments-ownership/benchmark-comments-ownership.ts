import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { arch, cpus, platform, release } from 'node:os';
import { performance } from 'node:perf_hooks';

import { buildBlockDiscussionIndex } from '../../../../apps/www/src/registry/lib/block-discussion-index';
import { BaseCommentPlugin } from '../../../../packages/platejs/src/features/comment/lib/BaseCommentPlugin';
import {
  ElementApi,
  TextApi,
  type Descendant,
  type Element,
  type Text,
} from '../../../../packages/platejs/src/core';
import { createEditor } from '../../../../packages/platejs/src/react';
import {
  createPliteAnnotationStore,
  type PliteAnnotation,
} from '../../../../packages/plitejs/src/react/annotation-store';

type Summary = Readonly<{
  max: number;
  mean: number;
  min: number;
  p50: number;
  p95: number;
  p99: number | null;
  p95PacketNoiseMs: number;
  packetP95: readonly number[];
  samples: readonly number[];
}>;

type CommentData = Readonly<{
  body: string;
  status: 'open' | 'resolved';
}>;

type CommentProjection = Readonly<{
  status: 'open' | 'resolved';
}>;

type Discussion = {
  comments: Array<{
    contentRich: Descendant[];
    createdAt: Date;
    discussionId: string;
    id: string;
    isEdited: boolean;
    userId: string;
  }>;
  createdAt: Date;
  id: string;
  isResolved: boolean;
  userId: string;
};

type Row = Readonly<{
  cohort: string;
  counters: Readonly<Record<string, number>>;
  expectedComplexity: string;
  operation:
    | 'annotation-reproject'
    | 'document-edit'
    | 'hydrate'
    | 'thread-body-edit';
  owner:
    | 'anchor-state-control'
    | 'base-editor-control'
    | 'current-document-marks-index'
    | 'target-app-threads-annotations';
  summary: Summary;
  verdict: 'baseline' | 'green' | 'red';
}>;

const outputPath =
  process.argv.find((value) => value.startsWith('--output='))?.slice(9) ??
  'docs/plans/artifacts/hard-cut-comments-ownership/benchmark-comments-ownership.json';
const frameBudgetMs = 16.67;
const pathologicalBudgetMs = 100;
const coldBudgetMs = 250;
const relativeFloorMs = 0.25;
const relativeMultiplier = 1.2;
const distributedAnnotationOverheadBudgetMs = 5;

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
    p95: round(percentile(sorted, 0.95)),
    p99: samples.length >= 100 ? round(percentile(sorted, 0.99)) : null,
    p95PacketNoiseMs: round(Math.max(...packetP95) - Math.min(...packetP95)),
    packetP95: packetP95.map(round),
    samples: samples.map(round),
  });
};

const sampleContract = (count: number) =>
  count >= 10_000
    ? { packets: 3, samplesPerPacket: 10, warmups: 5 }
    : { packets: 5, samplesPerPacket: 20, warmups: 20 };

const measure = (
  operation: () => void,
  contract: Readonly<{
    packets: number;
    samplesPerPacket: number;
    warmups: number;
  }>
) => {
  for (let index = 0; index < contract.warmups; index += 1) operation();

  const packets: number[][] = [];

  for (let packet = 0; packet < contract.packets; packet += 1) {
    const samples: number[] = [];

    for (let sample = 0; sample < contract.samplesPerPacket; sample += 1) {
      const startedAt = performance.now();

      operation();
      samples.push(performance.now() - startedAt);
    }
    packets.push(samples);
  }

  return summarize(packets.flat(), packets);
};

const measureCold = (operation: () => void) => {
  const samples = Array.from({ length: 5 }, () => {
    const startedAt = performance.now();

    operation();
    return performance.now() - startedAt;
  });

  return summarize(
    samples,
    samples.map((sample) => [sample])
  );
};

const paragraph = (text: Text): Element => ({
  children: [text],
  type: 'paragraph',
});

const createDiscussions = (count: number): Discussion[] =>
  Array.from({ length: count }, (_, index) => {
    const id = `thread-${index}`;

    return {
      comments: [
        {
          contentRich: [paragraph({ text: `body-${index}` })],
          createdAt: new Date(1_700_000_000_000 + index),
          discussionId: id,
          id: `comment-${index}`,
          isEdited: false,
          userId: 'reviewer',
        },
      ],
      createdAt: new Date(1_700_000_000_000 + index),
      id,
      isResolved: false,
      userId: 'reviewer',
    };
  });

const commentId = (node: Text) =>
  Object.keys(node)
    .filter((key) => key.startsWith('comment_') && key !== 'comment_draft')
    .map((key) => key.slice('comment_'.length))
    .at(-1);

const currentValue = (count: number): Descendant[] =>
  Array.from({ length: count }, (_, index) =>
    paragraph({
      [`comment_thread-${index}`]: true,
      comment: true,
      text: `anchored text ${index}`,
    })
  );

const targetValue = (count: number): Descendant[] =>
  Array.from({ length: count }, (_, index) =>
    paragraph({ text: `anchored text ${index}` })
  );

const buildCurrentIndex = (
  editor: ReturnType<typeof createEditor>,
  discussions: readonly Discussion[]
) => {
  const entries = editor.read.nodes.toArray({
    at: [],
    match: (node): node is Element | Text =>
      ElementApi.isElement(node) || TextApi.isText(node),
    mode: 'all',
  });
  const index = buildBlockDiscussionIndex({
    discussions,
    entries,
    getBlockNodeKey: (node) => editor.key(node),
    getCommentId: commentId,
    getSuggestionData: () => undefined,
    getSuggestionDataList: () => [],
    getSuggestionId: () => undefined,
    getSuggestionKey: (id) => `suggestion_${id}`,
    isBlockSuggestion: () => false,
  });

  return { entries, index };
};

const runCurrentRows = (count: number): Row[] => {
  const editor = createEditor({
    initialValue: currentValue(count),
    plugins: [BaseCommentPlugin],
  });
  let discussions = createDiscussions(count);
  const initial = buildCurrentIndex(editor, discussions);

  assert.equal(initial.index.discussionsByNodeKey.size, count);

  let bodyRevision = 0;
  let bodyCounters: Record<string, number> = {};
  const bodySummary = measure(() => {
    bodyRevision += 1;
    const first = discussions[0];

    assert.ok(first);
    discussions = [...discussions];
    discussions[0] = {
      ...first,
      comments: [
        {
          ...first.comments[0]!,
          contentRich: [paragraph({ text: `body-revision-${bodyRevision}` })],
        },
      ],
    };
    const next = buildCurrentIndex(editor, discussions);

    assert.equal(next.index.discussionsByNodeKey.size, count);
    bodyCounters = {
      clonedDiscussions: count,
      indexedDiscussions: next.index.discussionsByNodeKey.size,
      visitedEntries: next.entries.length,
    };
  }, sampleContract(count));

  let documentCounters: Record<string, number> = {};
  const documentSummary = measure(() => {
    editor.update.text.insert('x', { at: { offset: 0, path: [0, 0] } });
    const next = buildCurrentIndex(editor, discussions);

    assert.equal(next.index.discussionsByNodeKey.size, count);
    documentCounters = {
      clonedDiscussions: count,
      indexedDiscussions: next.index.discussionsByNodeKey.size,
      visitedEntries: next.entries.length,
    };
  }, sampleContract(count));

  let hydrateCounters: Record<string, number> = {};
  const hydrateSummary = measureCold(() => {
    const next = buildCurrentIndex(editor, discussions);

    assert.equal(next.index.discussionsByNodeKey.size, count);
    hydrateCounters = {
      clonedDiscussions: count,
      indexedDiscussions: next.index.discussionsByNodeKey.size,
      visitedEntries: next.entries.length,
    };
  });

  return [
    {
      cohort: `distributed:nodes=${count}:threads=${count}`,
      counters: hydrateCounters,
      expectedComplexity: 'O(nodes + discussions) full hydration rebuild',
      operation: 'hydrate',
      owner: 'current-document-marks-index',
      summary: hydrateSummary,
      verdict: 'baseline',
    },
    {
      cohort: `distributed:nodes=${count}:threads=${count}`,
      counters: bodyCounters,
      expectedComplexity:
        'O(nodes + discussions) rebuild for one thread body change',
      operation: 'thread-body-edit',
      owner: 'current-document-marks-index',
      summary: bodySummary,
      verdict: 'baseline',
    },
    {
      cohort: `distributed:nodes=${count}:threads=${count}`,
      counters: documentCounters,
      expectedComplexity:
        'editor edit plus O(nodes + discussions) discussion-index rebuild',
      operation: 'document-edit',
      owner: 'current-document-marks-index',
      summary: documentSummary,
      verdict: 'baseline',
    },
  ];
};

const runBaseEditorRow = (count: number, colocated = false): Row => {
  const blockCount = colocated ? 1 : count;
  const editor = createEditor({ initialValue: targetValue(blockCount) });
  const summary = measure(() => {
    editor.update.text.insert('x', { at: { offset: 0, path: [0, 0] } });
  }, sampleContract(count));

  return {
    cohort: colocated
      ? `pathological:nodes=1:threads=${count}:anchors-per-leaf=${count}`
      : `distributed:nodes=${count}:threads=${count}`,
    counters: { editedLeaves: 1 },
    expectedComplexity: 'base editor document edit without Comments projection',
    operation: 'document-edit',
    owner: 'base-editor-control',
    summary,
    verdict: 'baseline',
  };
};

const runAnchorStateRow = (count: number, colocated = false): Row => {
  const blockCount = colocated ? 1 : count;
  const editor = createEditor({ initialValue: targetValue(blockCount) });
  const anchors = Array.from({ length: count }, (_, index) =>
    editor.anchor(
      {
        kind: 'text' as const,
        anchor: { offset: 0, path: [colocated ? 0 : index, 0] },
        focus: { offset: 8, path: [colocated ? 0 : index, 0] },
      },
      { association: 'inward', deletion: 'drop' }
    )
  );
  const summary = measure(() => {
    editor.update.text.insert('x', { at: { offset: 0, path: [0, 0] } });
    assert.ok(anchors[0]?.resolve());
  }, sampleContract(count));

  anchors.forEach((anchor) => anchor.release());

  return {
    cohort: colocated
      ? `pathological:nodes=1:threads=${count}:anchors-per-leaf=${count}`
      : `distributed:nodes=${count}:threads=${count}`,
    counters: { liveAnchors: count, resolvedAfterEdit: 1 },
    expectedComplexity: 'editor document edit with live Plite Anchors only',
    operation: 'document-edit',
    owner: 'anchor-state-control',
    summary,
    verdict: 'baseline',
  };
};

const runAnnotationReprojectRow = (
  count: number,
  colocated = false
): Row => {
  const blockCount = colocated ? 1 : count;
  const editor = createEditor({ initialValue: targetValue(blockCount) });
  const ranges = Array.from({ length: count }, (_, index) => ({
    anchor: { offset: 0, path: [colocated ? 0 : index, 0] },
    focus: { offset: 8, path: [colocated ? 0 : index, 0] },
  }));
  const annotations: ReadonlyArray<
    PliteAnnotation<CommentData, CommentProjection>
  > = ranges.map((_, index) => ({
    anchor: {
      release: () => ranges[index] ?? null,
      resolve: () => ranges[index] ?? null,
    },
    data: { body: `body-${index}`, status: 'open' },
    id: `thread-${index}`,
    projection: { status: 'open' },
  }));
  const store = createPliteAnnotationStore(editor, () => annotations);
  const ids = annotations.map((annotation) => annotation.id);
  let revision = 0;
  let counters: Record<string, number> = {};
  const summary = measure(() => {
    revision += 1;
    const nextOffset = revision % 2 === 0 ? 8 : 7;
    const changedIds = colocated ? ids : [ids[0]!];

    for (let index = 0; index < changedIds.length; index += 1) {
      const rangeIndex = colocated ? index : 0;
      const range = ranges[rangeIndex];

      assert.ok(range);
      ranges[rangeIndex] = {
        anchor: range.anchor,
        focus: { ...range.focus, offset: nextOffset },
      };
    }

    const before = store.getMetrics();

    store.refresh({ ids: changedIds, reason: 'external' });
    const after = store.getMetrics();
    const expectedResolved = colocated ? count : 1;

    assert.equal(
      after.annotationResolveCount - before.annotationResolveCount,
      expectedResolved
    );
    assert.equal(
      after.changedRuntimeBucketCount - before.changedRuntimeBucketCount,
      1
    );
    counters = {
      changedProjectionBuckets: 1,
      requestedAnnotationIds: changedIds.length,
      resolvedAnnotations: expectedResolved,
    };
  }, sampleContract(count));

  store.destroy();

  return {
    cohort: colocated
      ? `pathological:nodes=1:threads=${count}:anchors-per-leaf=${count}`
      : `distributed:nodes=${count}:threads=${count}`,
    counters,
    expectedComplexity: colocated
      ? 'O(anchors in one changed projection bucket) without editor edit cost'
      : 'one forced annotation resolve and one projection-bucket publish',
    operation: 'annotation-reproject',
    owner: 'target-app-threads-annotations',
    summary,
    verdict:
      summary.p95 <=
      (colocated
        ? pathologicalBudgetMs
        : distributedAnnotationOverheadBudgetMs)
        ? 'green'
        : 'red',
  };
};

const createTargetFixture = (count: number, colocated: boolean) => {
  const blockCount = colocated ? 1 : count;
  const editor = createEditor({ initialValue: targetValue(blockCount) });
  const discussions = createDiscussions(count);
  const anchors = Array.from({ length: count }, (_, index) =>
    editor.anchor(
      {
        kind: 'text' as const,
        anchor: { offset: 0, path: [colocated ? 0 : index, 0] },
        focus: { offset: 8, path: [colocated ? 0 : index, 0] },
      },
      { association: 'inward', deletion: 'drop' }
    )
  );
  let annotations: ReadonlyArray<
    PliteAnnotation<CommentData, CommentProjection>
  > = discussions.map((discussion, index) => ({
    anchor: anchors[index]!,
    data: { body: `body-${index}`, status: 'open' },
    id: discussion.id,
    projection: { status: 'open' },
  }));

  return {
    anchors,
    createStore: () => createPliteAnnotationStore(editor, () => annotations),
    editor,
    get annotations() {
      return annotations;
    },
    set annotations(next) {
      annotations = next;
    },
  };
};

const runTargetRows = (count: number, colocated = false): Row[] => {
  const fixture = createTargetFixture(count, colocated);
  let coldCounters: Record<string, number> = {};
  const hydrateSummary = measureCold(() => {
    const store = fixture.createStore();
    const metrics = store.getMetrics();

    assert.equal(store.getSnapshot().allIds.length, count);
    assert.equal(metrics.annotationResolveCount, count);
    assert.equal(metrics.annotationProjectCount, count);
    coldCounters = {
      projectedAnnotations: metrics.annotationProjectCount,
      resolvedAnnotations: metrics.annotationResolveCount,
      snapshotIds: store.getSnapshot().allIds.length,
    };
    store.destroy();
  });
  const store = fixture.createStore();
  const stableIds = store.getSnapshot().allIds;
  let broadWakes = 0;
  let changedWakes = 0;
  let unrelatedWakes = 0;
  let projectionWakes = 0;
  let runtimeWakes = 0;
  const firstNode = fixture.editor.read.nodes.get([0, 0])?.[0];

  assert.ok(firstNode);
  const firstNodeKey = fixture.editor.key(firstNode);
  const cleanups = [
    store.subscribe(() => {
      broadWakes += 1;
    }),
    store.subscribeAnnotation('thread-0', () => {
      changedWakes += 1;
    }),
    store.projectionStore.subscribe(() => {
      projectionWakes += 1;
    }),
    store.projectionStore.subscribeNodeKey(firstNodeKey, () => {
      runtimeWakes += 1;
    }),
  ];

  if (count > 1) {
    cleanups.push(
      store.subscribeAnnotation('thread-1', () => {
        unrelatedWakes += 1;
      })
    );
  }

  let bodyRevision = 0;
  let bodyCounters: Record<string, number> = {};
  const bodySummary = measure(() => {
    bodyRevision += 1;
    const first = fixture.annotations[0];

    assert.ok(first);
    const nextAnnotations = [...fixture.annotations];

    nextAnnotations[0] = {
      ...first,
      data: { ...first.data!, body: `body-revision-${bodyRevision}` },
    };
    fixture.annotations = nextAnnotations;
    const beforeMetrics = store.getMetrics();
    const beforeWakes = {
      broadWakes,
      changedWakes,
      projectionWakes,
      runtimeWakes,
      unrelatedWakes,
    };

    store.refresh({ ids: ['thread-0'], reason: 'annotation' });
    const afterMetrics = store.getMetrics();

    assert.equal(store.getSnapshot().allIds, stableIds);
    assert.equal(
      store.getAnnotation('thread-0')?.data?.body,
      `body-revision-${bodyRevision}`
    );
    assert.equal(
      afterMetrics.annotationResolveCount -
        beforeMetrics.annotationResolveCount,
      1
    );
    assert.equal(
      afterMetrics.changedAnnotationCount - beforeMetrics.changedAnnotationCount,
      1
    );
    assert.equal(
      afterMetrics.changedRuntimeBucketCount -
        beforeMetrics.changedRuntimeBucketCount,
      0
    );
    assert.equal(broadWakes - beforeWakes.broadWakes, 1);
    assert.equal(changedWakes - beforeWakes.changedWakes, 1);
    assert.equal(unrelatedWakes - beforeWakes.unrelatedWakes, 0);
    assert.equal(projectionWakes - beforeWakes.projectionWakes, 0);
    assert.equal(runtimeWakes - beforeWakes.runtimeWakes, 0);
    bodyCounters = {
      changedAnnotationWakes: 1,
      changedAnnotations: 1,
      changedProjectionBuckets: 0,
      projectionWakes: 0,
      resolvedAnnotations: 1,
      runtimeWakes: 0,
      unrelatedAnnotationWakes: 0,
    };
  }, sampleContract(count));

  let documentCounters: Record<string, number> = {};
  const documentSummary = measure(() => {
    const beforeMetrics = store.getMetrics();
    const beforeRuntimeWakes = runtimeWakes;

    fixture.editor.update.text.insert('x', {
      at: { offset: 0, path: [0, 0] },
    });
    const afterMetrics = store.getMetrics();
    const expectedResolved = colocated ? count : 1;

    assert.equal(
      afterMetrics.annotationResolveCount -
        beforeMetrics.annotationResolveCount,
      expectedResolved
    );
    assert.equal(store.getSnapshot().allIds, stableIds);
    assert.ok(store.getAnnotation('thread-0')?.range);
    assert.equal(runtimeWakes - beforeRuntimeWakes, 1);
    documentCounters = {
      changedAnnotations:
        afterMetrics.changedAnnotationCount - beforeMetrics.changedAnnotationCount,
      changedProjectionBuckets:
        afterMetrics.changedRuntimeBucketCount -
        beforeMetrics.changedRuntimeBucketCount,
      resolvedAnnotations: expectedResolved,
      runtimeWakes: 1,
      affectedOtherAnnotations: colocated ? count - 1 : 0,
    };
  }, sampleContract(count));

  cleanups.forEach((cleanup) => cleanup());
  store.destroy();
  fixture.anchors.forEach((anchor) => anchor.release());

  const cohort = colocated
    ? `pathological:nodes=1:threads=${count}:anchors-per-leaf=${count}`
    : `distributed:nodes=${count}:threads=${count}`;
  const warmBudget = colocated ? pathologicalBudgetMs : frameBudgetMs;

  return [
    {
      cohort,
      counters: coldCounters,
      expectedComplexity: 'O(annotations + projected ranges) initial mapping',
      operation: 'hydrate',
      owner: 'target-app-threads-annotations',
      summary: hydrateSummary,
      verdict: hydrateSummary.max <= coldBudgetMs ? 'green' : 'red',
    },
    {
      cohort,
      counters: bodyCounters,
      expectedComplexity:
        'stable-id scan plus one annotation resolve and zero inline repaint',
      operation: 'thread-body-edit',
      owner: 'target-app-threads-annotations',
      summary: bodySummary,
      verdict: bodySummary.p95 <= warmBudget ? 'green' : 'red',
    },
    {
      cohort,
      counters: documentCounters,
      expectedComplexity: colocated
        ? 'O(anchors in the changed runtime bucket)'
        : 'one changed runtime bucket and one resolved annotation',
      operation: 'document-edit',
      owner: 'target-app-threads-annotations',
      summary: documentSummary,
      verdict: documentSummary.p95 <= warmBudget ? 'green' : 'red',
    },
  ];
};

const measuredInputs = [
  'apps/www/src/registry/components/editor/block-discussion.tsx',
  'apps/www/src/registry/components/editor/comment.tsx',
  'apps/www/src/registry/components/editor/discussion.tsx',
  'apps/www/src/registry/lib/block-discussion-index.ts',
  'docs/plans/artifacts/hard-cut-comments-ownership/benchmark-comments-ownership.ts',
  'packages/platejs/src/features/comment/lib/BaseCommentPlugin.ts',
  'packages/platejs/src/react/plite-react.ts',
  'packages/plitejs/src/core/anchor-state.ts',
  'packages/plitejs/src/core/anchor.ts',
  'packages/plitejs/src/react/annotation-store.ts',
  'packages/plitejs/src/react/mapped-view-store.ts',
  'packages/plitejs/src/react/stable-id-mapped-source.ts',
] as const;

const sha256 = (path: string) =>
  createHash('sha256').update(readFileSync(path)).digest('hex');

const distributedCohorts = [100, 1000, 10_000] as const;
const rows: Row[] = [];

for (const count of distributedCohorts) {
  rows.push(
    runBaseEditorRow(count),
    runAnchorStateRow(count),
    ...runCurrentRows(count),
    ...runTargetRows(count),
    runAnnotationReprojectRow(count)
  );
}
rows.push(
  runBaseEditorRow(10_000, true),
  runAnchorStateRow(10_000, true),
  ...runTargetRows(10_000, true),
  runAnnotationReprojectRow(10_000, true)
);

const currentBodyRows = new Map(
  rows
    .filter(
      (row) =>
        row.owner === 'current-document-marks-index' &&
        row.operation === 'thread-body-edit'
    )
    .map((row) => [row.cohort, row])
);
const relativeBodyChecks = rows
  .filter(
    (row) =>
      row.owner === 'target-app-threads-annotations' &&
      row.operation === 'thread-body-edit' &&
      row.cohort.startsWith('distributed:')
  )
  .map((target) => {
    const current = currentBodyRows.get(target.cohort);

    assert.ok(current);
    const budget = Math.max(
      current.summary.p95 * relativeMultiplier,
      current.summary.p95 + relativeFloorMs
    );

    return {
      budgetMs: round(budget),
      cohort: target.cohort,
      currentP95Ms: current.summary.p95,
      pass: target.summary.p95 <= budget,
      targetP95Ms: target.summary.p95,
    };
  });
const growthChecks = (
  [
    'hydrate',
    'thread-body-edit',
    'document-edit',
    'annotation-reproject',
  ] as const
).map((operation) => {
  const at1000 = rows.find(
    (row) =>
      row.owner === 'target-app-threads-annotations' &&
      row.operation === operation &&
      row.cohort === 'distributed:nodes=1000:threads=1000'
  );
  const at10000 = rows.find(
    (row) =>
      row.owner === 'target-app-threads-annotations' &&
      row.operation === operation &&
      row.cohort === 'distributed:nodes=10000:threads=10000'
  );

  assert.ok(at1000 && at10000);
  const ratio = at10000.summary.p95 / Math.max(at1000.summary.p95, 0.000_001);

  return { operation, pass: ratio <= 15, p95GrowthRatio: round(ratio) };
});
const targetRows = rows.filter(
  (row) => row.owner === 'target-app-threads-annotations'
);
const decisionPass =
  targetRows.every((row) => row.verdict === 'green') &&
  relativeBodyChecks.every((check) => check.pass) &&
  growthChecks.every((check) => check.pass);

const artifact = {
  artifactVersion: 2,
  benchmark: 'comments-ownership-architecture-probe',
  budgets: {
    coldMaxMs: coldBudgetMs,
    distributedAnnotationOverheadP95Ms:
      distributedAnnotationOverheadBudgetMs,
    distributedWarmP95Ms: frameBudgetMs,
    growth1kTo10kMaxRatio: 15,
    noiseFloorMs: relativeFloorMs,
    pathologicalWarmP95Ms: pathologicalBudgetMs,
    targetBodyRelativeMultiplier: relativeMultiplier,
  },
  config: {
    cohorts: distributedCohorts,
    normalLargeSampling: sampleContract(100),
    pathologicalAnchors: 10_000,
    stressSampling: sampleContract(10_000),
  },
  decision: decisionPass ? 'accept-annotation-owner' : 'reject-or-reprobe',
  environment: {
    arch: arch(),
    bun: Bun.version,
    cpu: cpus()[0]?.model ?? 'unknown',
    cpuCount: cpus().length,
    platform: platform(),
    release: release(),
  },
  generatedAt: new Date().toISOString(),
  growthChecks,
  relativeBodyChecks,
  rows,
  sourceIdentity: {
    head: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    measuredInputs: Object.fromEntries(
      measuredInputs.map((path) => [path, sha256(path)])
    ),
  },
  summary: {
    baselineWorstP95Ms: round(
      Math.max(
        ...rows
          .filter((row) => row.owner === 'current-document-marks-index')
          .map((row) => row.summary.p95)
      )
    ),
    correctnessFailures: 0,
    redTargetRows: targetRows
      .filter((row) => row.verdict === 'red')
      .map((row) => `${row.operation}:${row.cohort}`),
    targetWorstDistributedP95Ms: round(
      Math.max(
        ...targetRows
          .filter((row) => row.cohort.startsWith('distributed:'))
          .map((row) => row.summary.p95)
      )
    ),
    targetWorstPathologicalP95Ms: round(
      Math.max(
        ...targetRows
          .filter((row) => row.cohort.startsWith('pathological:'))
          .map((row) => row.summary.p95)
      )
    ),
  },
};

writeFileSync(outputPath, `${JSON.stringify(artifact, null, 2)}\n`);
process.stdout.write(`${JSON.stringify(artifact.summary)}\n`);

if (!decisionPass) process.exitCode = 1;

import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { cpus, platform } from 'node:os';

import { summarize } from '../../shared/stats.mjs';

const sizes = (process.env.PLITE_ANNOTATION_INDEX_BENCH_SIZES ?? '1000,10000,100000')
  .split(',')
  .map(Number);
const viewCounts = (process.env.PLITE_ANNOTATION_INDEX_BENCH_VIEWS ?? '1,2,4')
  .split(',')
  .map(Number);
const sampleCount = Number(
  process.env.PLITE_ANNOTATION_INDEX_BENCH_SAMPLES ?? 9
);
const warmupCount = Number(
  process.env.PLITE_ANNOTATION_INDEX_BENCH_WARMUPS ?? 3
);
const strict = process.env.PLITE_ANNOTATION_INDEX_BENCH_STRICT === '1';
const pageSize = 256;
const measuredFiles = [
  'benchmarks/slate-v2/donor/core/current/annotation-view-index.mjs',
  'packages/plitejs/src/annotations/store.ts',
  'packages/plitejs/src/core/anchor-state.ts',
  'packages/plitejs/src/internal/view/stable-id-mapped-source.ts',
  'packages/plitejs/src/internal/view/mapped-view-store.ts',
  'pnpm-lock.yaml',
];
const operations = [
  'local-edit',
  'deletion',
  'move',
  'metadata-refresh',
  'activation',
  'projection-switch',
  'remount',
  'unmount',
];
const candidateDefinitions = [
  {
    id: 'node-key-scalar-paged',
    resolution: 'scalar',
    routing: 'node-key',
    snapshot: 'paged',
  },
  {
    id: 'node-key-grouped-paged',
    resolution: 'grouped',
    routing: 'node-key',
    snapshot: 'paged',
  },
  {
    id: 'chunked-collection-scalar-paged',
    resolution: 'scalar',
    routing: 'chunked',
    snapshot: 'paged',
  },
  {
    id: 'node-key-scalar-simple-snapshot',
    resolution: 'scalar',
    routing: 'node-key',
    snapshot: 'simple',
  },
];
const baselineId = candidateDefinitions[0].id;

assert.ok(sizes.every((size) => Number.isSafeInteger(size) && size > 0));
assert.ok(viewCounts.every((count) => [1, 2, 4].includes(count)));
assert.ok(sampleCount >= 9);
assert.ok(warmupCount >= 3);

const fingerprint = async (file) =>
  createHash('sha256').update(await readFile(file)).digest('hex');
const fingerprints = async () =>
  Object.fromEntries(
    await Promise.all(
      measuredFiles.map(async (file) => [file, await fingerprint(file)])
    )
  );
const beforeFingerprints = await fingerprints();

const createRouting = (size, layout) => {
  const nodeCount = layout === 'dense' ? 1 : Math.min(size, 1000);
  const allIds = Int32Array.from({ length: size }, (_, index) => index);
  const byNode = Array.from({ length: nodeCount }, () => []);

  for (let index = 0; index < size; index += 1) {
    byNode[index % nodeCount].push(index);
  }

  const nodeIds = byNode.map((ids) => Int32Array.from(ids));
  const chunksByNode = nodeIds.map((ids) => {
    const chunks = [];

    for (let offset = 0; offset < ids.length; offset += pageSize) {
      chunks.push(ids.subarray(offset, offset + pageSize));
    }

    return chunks;
  });

  return { allIds, chunksByNode, nodeCount, nodeIds };
};

const createPagedSnapshots = (size, viewCount) =>
  Array.from({ length: viewCount }, () =>
    Array.from(
      { length: Math.ceil(size / pageSize) },
      (_, page) => new Int32Array(Math.min(pageSize, size - page * pageSize))
    )
  );

const createFixture = (definition, size, layout, viewCount) => {
  const routing = createRouting(size, layout);

  return {
    ...routing,
    definition,
    size,
    viewCount,
    versions: new Int32Array(size),
    snapshots:
      definition.snapshot === 'paged'
        ? createPagedSnapshots(size, viewCount)
        : Array.from({ length: viewCount }, () => new Int32Array(size)),
  };
};

const flattenChunks = (chunks) => {
  const size = chunks.reduce((total, chunk) => total + chunk.length, 0);
  const ids = new Int32Array(size);
  let offset = 0;

  for (const chunk of chunks) {
    ids.set(chunk, offset);
    offset += chunk.length;
  }

  return ids;
};

const selectCandidates = (fixture, operation, iteration) => {
  if (
    operation === 'activation' ||
    operation === 'projection-switch' ||
    operation === 'remount' ||
    operation === 'unmount'
  ) {
    return fixture.allIds;
  }

  const node = iteration % fixture.nodeCount;
  if (operation === 'metadata-refresh' || operation === 'deletion') {
    return Int32Array.of((iteration * 7919) % fixture.size);
  }

  if (operation === 'move') {
    const targetNode = (node + 1) % fixture.nodeCount;
    if (fixture.definition.routing === 'chunked') {
      return flattenChunks([
        ...fixture.chunksByNode[node],
        ...(targetNode === node ? [] : fixture.chunksByNode[targetNode]),
      ]);
    }

    if (targetNode === node) return fixture.nodeIds[node];
    const source = fixture.nodeIds[node];
    const target = fixture.nodeIds[targetNode];
    const ids = new Int32Array(source.length + target.length);
    ids.set(source);
    ids.set(target, source.length);
    return ids;
  }

  return fixture.definition.routing === 'chunked'
    ? flattenChunks(fixture.chunksByNode[node])
    : fixture.nodeIds[node];
};

const resolveScalar = (fixture, ids, projectionRevision) => {
  let checksum = 0;

  for (const id of ids) {
    for (let view = 0; view < fixture.viewCount; view += 1) {
      checksum =
        (checksum +
          id * 17 +
          fixture.versions[id] * 31 +
          view * 13 +
          projectionRevision) |
        0;
    }
  }

  return checksum;
};

const resolveGrouped = (fixture, ids, projectionRevision) => {
  let checksum = 0;

  for (let view = 0; view < fixture.viewCount; view += 1) {
    const viewOffset = view * 13 + projectionRevision;

    for (const id of ids) {
      checksum =
        (checksum + id * 17 + fixture.versions[id] * 31 + viewOffset) | 0;
    }
  }

  return checksum;
};

const publishPaged = (fixture, ids) => {
  const pages = new Set();

  for (const id of ids) pages.add(Math.floor(id / pageSize));

  for (let view = 0; view < fixture.viewCount; view += 1) {
    const previous = fixture.snapshots[view];
    const next = previous.slice();

    for (const page of pages) {
      const copy = previous[page].slice();
      const start = page * pageSize;

      for (let offset = 0; offset < copy.length; offset += 1) {
        copy[offset] = fixture.versions[start + offset] + view;
      }
      next[page] = copy;
    }

    fixture.snapshots[view] = next;
  }

  return pages.size * fixture.viewCount;
};

const publishSimple = (fixture) => {
  for (let view = 0; view < fixture.viewCount; view += 1) {
    const next = fixture.versions.slice();

    if (view > 0) {
      for (let id = 0; id < next.length; id += 1) next[id] += view;
    }
    fixture.snapshots[view] = next;
  }

  return fixture.size * fixture.viewCount;
};

const runOperation = (fixture, operation, iteration) => {
  const ids = selectCandidates(fixture, operation, iteration);
  const revision = iteration + 1;

  if (
    operation === 'local-edit' ||
    operation === 'deletion' ||
    operation === 'move' ||
    operation === 'metadata-refresh'
  ) {
    for (const id of ids) fixture.versions[id] = revision;
  }

  const projectionRevision = operation === 'projection-switch' ? revision : 0;
  const checksum =
    fixture.definition.resolution === 'grouped'
      ? resolveGrouped(fixture, ids, projectionRevision)
      : resolveScalar(fixture, ids, projectionRevision);
  const copiedEntries =
    operation === 'unmount'
      ? 0
      : fixture.definition.snapshot === 'paged'
        ? publishPaged(fixture, ids)
        : publishSimple(fixture);

  return {
    candidateCount: ids.length,
    checksum,
    copiedEntries,
    dirtyBuckets:
      operation === 'metadata-refresh' || operation === 'deletion'
        ? 1
        : operation === 'move'
          ? Math.min(2, fixture.nodeCount)
          : operation === 'local-edit'
            ? 1
            : fixture.nodeCount,
    subscriberWakes: ids.length * fixture.viewCount,
    targetResolutions: ids.length * fixture.viewCount,
  };
};

const estimateRetainedBytes = (fixture) => {
  const routeBytes =
    fixture.allIds.byteLength +
    fixture.nodeIds.reduce((total, ids) => total + ids.byteLength, 0) +
    (fixture.definition.routing === 'chunked'
      ? fixture.chunksByNode.reduce(
          (total, chunks) => total + chunks.length * 32,
          0
        )
      : 0);
  const snapshotBytes =
    fixture.definition.snapshot === 'paged'
      ? fixture.snapshots.reduce(
          (total, pages) =>
            total +
            pages.reduce((pageTotal, page) => pageTotal + page.byteLength, 0),
          0
        )
      : fixture.snapshots.reduce(
          (total, snapshot) => total + snapshot.byteLength,
          0
        );

  return routeBytes + snapshotBytes + fixture.versions.byteLength;
};

const rows = [];
let correctnessFailures = 0;

for (const size of sizes) {
  for (const layout of ['dense', 'distributed']) {
    for (const viewCount of viewCounts) {
      const fixtures = new Map(
        candidateDefinitions.map((definition) => [
          definition.id,
          createFixture(definition, size, layout, viewCount),
        ])
      );
      const retainedBytes = Object.fromEntries(
        [...fixtures].map(([id, fixture]) => [id, estimateRetainedBytes(fixture)])
      );

      for (const operation of operations) {
        const timings = Object.fromEntries(
          candidateDefinitions.map(({ id }) => [id, []])
        );
        const maxWork = Object.fromEntries(
          candidateDefinitions.map(({ id }) => [
            id,
            {
              candidateCount: 0,
              copiedEntries: 0,
              dirtyBuckets: 0,
              subscriberWakes: 0,
              targetResolutions: 0,
            },
          ])
        );

        for (
          let iteration = 0;
          iteration < warmupCount + sampleCount;
          iteration += 1
        ) {
          const order = candidateDefinitions.map(
            (_, index) =>
              candidateDefinitions[(index + iteration) % candidateDefinitions.length]
          );
          const results = new Map();

          for (const definition of order) {
            const fixture = fixtures.get(definition.id);
            const startedAt = performance.now();
            const result = runOperation(fixture, operation, iteration);
            const duration = performance.now() - startedAt;

            results.set(definition.id, result);
            if (iteration >= warmupCount) timings[definition.id].push(duration);
            for (const key of Object.keys(maxWork[definition.id])) {
              maxWork[definition.id][key] = Math.max(
                maxWork[definition.id][key],
                result[key]
              );
            }
          }

          const baseline = results.get(baselineId);
          for (const definition of candidateDefinitions.slice(1)) {
            const candidate = results.get(definition.id);
            if (
              candidate.candidateCount !== baseline.candidateCount ||
              candidate.checksum !== baseline.checksum ||
              candidate.dirtyBuckets !== baseline.dirtyBuckets ||
              candidate.subscriberWakes !== baseline.subscriberWakes ||
              candidate.targetResolutions !== baseline.targetResolutions
            ) {
              correctnessFailures += 1;
            }
          }
        }

        for (const definition of candidateDefinitions) {
          rows.push({
            candidate: definition.id,
            layout,
            maxWork: maxWork[definition.id],
            operation,
            retainedBytes: retainedBytes[definition.id],
            size,
            summary: summarize(timings[definition.id]),
            viewCount,
          });
        }
      }

      Bun.gc(true);
    }
  }
}

const rowKey = (row) =>
  [row.size, row.layout, row.viewCount, row.operation].join(':');
const baselineRows = new Map(
  rows
    .filter((row) => row.candidate === baselineId)
    .map((row) => [rowKey(row), row])
);
const candidateVerdicts = candidateDefinitions.slice(1).map((definition) => {
  const candidateRows = rows.filter((row) => row.candidate === definition.id);
  const comparisons = candidateRows.map((candidate) => {
    const baseline = baselineRows.get(rowKey(candidate));
    const timingApplicable = baseline.summary.p95 >= 1;
    const p95Ratio =
      baseline.summary.p95 === 0
        ? 1
        : candidate.summary.p95 / baseline.summary.p95;
    const absoluteImprovementMs =
      baseline.summary.p95 - candidate.summary.p95;
    const memoryImprovementBytes =
      baseline.retainedBytes - candidate.retainedBytes;
    const memoryImprovementRatio =
      baseline.retainedBytes === 0
        ? 0
        : memoryImprovementBytes / baseline.retainedBytes;
    const localOperation =
      candidate.operation === 'local-edit' ||
      candidate.operation === 'deletion' ||
      candidate.operation === 'move' ||
      candidate.operation === 'metadata-refresh';
    const workRegression =
      localOperation &&
      candidate.maxWork.copiedEntries >
        Math.max(
          baseline.maxWork.copiedEntries * 1.1,
          baseline.maxWork.copiedEntries + pageSize
        );

    return {
      absoluteImprovementMs,
      key: rowKey(candidate),
      materialMemoryWin:
        memoryImprovementRatio >= 0.15 &&
        memoryImprovementBytes >= 8 * 1024 * 1024,
      materialTimingWin:
        timingApplicable &&
        p95Ratio <= 0.8 &&
        absoluteImprovementMs >= 1,
      memoryImprovementBytes,
      memoryImprovementRatio,
      p95Ratio,
      timingApplicable,
      timingRegression: timingApplicable && p95Ratio > 1.1,
      workRegression,
    };
  });
  const materialWins = comparisons.filter(
    ({ materialMemoryWin, materialTimingWin }) =>
      materialMemoryWin || materialTimingWin
  );
  const regressions = comparisons.filter(
    ({ timingRegression, workRegression }) =>
      timingRegression || workRegression
  );

  return {
    candidate: definition.id,
    comparisons,
    decision:
      materialWins.length > 0 && regressions.length === 0 ? 'retain' : 'reject',
    materialWins: materialWins.map(({ key }) => key),
    rationale:
      materialWins.length === 0
        ? 'No cohort cleared the frozen material timing or memory threshold.'
        : regressions.length > 0
          ? 'Material wins were offset by a timing or deterministic local-work regression.'
          : 'Cleared the frozen materiality gate without an applicable regression.',
    regressions: regressions.map(({ key }) => key),
  };
});

const afterFingerprints = await fingerprints();
const sourceStable =
  JSON.stringify(beforeFingerprints) === JSON.stringify(afterFingerprints);
const retainedCandidates = candidateVerdicts.filter(
  ({ decision }) => decision === 'retain'
);
const pass =
  correctnessFailures === 0 && sourceStable && retainedCandidates.length === 0;
const artifact = {
  artifactVersion: 1,
  benchmark: 'plite-annotation-view-index-candidates',
  candidateVerdicts,
  config: {
    baseline: baselineId,
    layouts: ['dense', 'distributed'],
    operations,
    pageSize,
    sampleCount,
    sizes,
    viewCounts,
    warmupCount,
  },
  correctness: {
    failures: correctnessFailures,
    policy:
      'Every candidate must select the same IDs, resolve the same per-view ranges, dirty the same buckets, and publish the same subscriber wake count as the node-key scalar baseline.',
  },
  environment: {
    bun: Bun.version,
    cpu: cpus()[0]?.model,
    platform: platform(),
  },
  limitations: [
    'Disposable candidates isolate routing, scalar/grouped resolution order, and immutable snapshot publication; they do not replace the production annotation store.',
    'The existing react-stable-id-overlay-source target remains the production persistent-trie locality and snapshot-isolation proof.',
    'Rows below 1 ms baseline p95 are treated as timing noise and cannot promote or fail a candidate by ratio alone.',
    'Retained bytes are deterministic typed-array and routing-structure bytes, not browser DOM or provider heap.',
  ],
  pass,
  rows,
  sourceIdentity: {
    after: afterFingerprints,
    before: beforeFingerprints,
    head: execFileSync('git', ['rev-parse', 'HEAD'], {
      encoding: 'utf8',
    }).trim(),
    stable: sourceStable,
  },
  summary: {
    baselineRetained: retainedCandidates.length === 0,
    candidatePromotions: retainedCandidates.map(({ candidate }) => candidate),
    correctnessFailures,
    sourceStable,
  },
};
const contents = `${JSON.stringify(artifact, null, 2)}\n`;
const planArtifact =
  'docs/plans/artifacts/annotations-architecture-adoption/annotation-view-index-benchmark.json';

await mkdir('tmp', { recursive: true });
await mkdir('docs/plans/artifacts/annotations-architecture-adoption', {
  recursive: true,
});
await Promise.all([
  writeFile('tmp/plite-annotation-view-index-benchmark.json', contents),
  writeFile(planArtifact, contents),
]);

console.log(
  `METRIC plite_annotation_view_index_baseline_retained=${Number(
    artifact.summary.baselineRetained
  )}`
);
console.log(
  `METRIC plite_annotation_view_index_candidate_promotions=${artifact.summary.candidatePromotions.length}`
);
console.log(`ARTIFACT ${planArtifact}`);
console.log(JSON.stringify(artifact.summary));

if (strict && !pass) process.exitCode = 1;

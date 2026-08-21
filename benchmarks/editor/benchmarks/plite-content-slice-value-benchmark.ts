import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';

import { encodeContentSlice } from '../../../packages/plite/src/core/content-slice';
import {
  ContentSlice,
  type Descendant,
  ElementApi,
} from '../../../packages/plite/src/index';
import { writeBenchmarkArtifact } from './benchmark-artifact';

const iterationsArgument = process.argv.find((argument) =>
  argument.startsWith('--iterations=')
);
const trustedIterationsArgument = process.argv.find((argument) =>
  argument.startsWith('--trusted-iterations=')
);
const outputArgument = process.argv.find((argument) =>
  argument.startsWith('--output=')
);
const iterations = iterationsArgument
  ? Number(iterationsArgument.slice('--iterations='.length))
  : 30;
const trustedIterations = trustedIterationsArgument
  ? Number(trustedIterationsArgument.slice('--trusted-iterations='.length))
  : 20_000;

for (const [name, value] of [
  ['--iterations', iterations],
  ['--trusted-iterations', trustedIterations],
] as const) {
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`${name} must be a positive integer.`);
  }
}

const percentile = (values: readonly number[], ratio: number) =>
  values[Math.min(values.length - 1, Math.ceil(values.length * ratio) - 1)]!;

const summarize = (samples: readonly number[]) => {
  const sorted = [...samples].sort((left, right) => left - right);

  return {
    p50: percentile(sorted, 0.5),
    p95: percentile(sorted, 0.95),
    p99: percentile(sorted, 0.99),
  };
};

const countNodes = (content: readonly Descendant[]): number =>
  content.reduce(
    (count, node) =>
      count + 1 + (ElementApi.isElement(node) ? countNodes(node.children) : 0),
    0
  );

const createContent = (nodeCount: number): Descendant[] => {
  assert.equal(nodeCount % 2, 0);

  const content: Descendant[] = Array.from(
    { length: nodeCount / 2 },
    (_value, index) => ({
      children: [
        {
          bold: index % 2 === 0,
          text: `content-slice-value-${index}`,
        },
      ],
      id: `paragraph-${index}`,
      type: 'paragraph',
    })
  );

  assert.equal(countNodes(content), nodeCount);

  return content;
};

const isDeepFrozen = (value: unknown): boolean => {
  if (typeof value !== 'object' || value === null) return true;
  if (!Object.isFrozen(value)) return false;

  return Object.values(value).every(isDeepFrozen);
};

const forceGc = () => {
  globalThis.gc?.();
  globalThis.gc?.();
  globalThis.gc?.();
};

const measureSnapshot = (snapshot: () => unknown) => {
  snapshot();
  snapshot();
  forceGc();

  const samples = Array.from({ length: iterations }, () => {
    const before = performance.now();

    snapshot();

    return performance.now() - before;
  });

  return summarize(samples);
};

const measureTrustedReuse = (reusesPreparedValue: () => boolean) => {
  let matches = 0;
  const samples = Array.from({ length: iterations }, () => {
    const before = process.hrtime.bigint();

    for (let index = 0; index < trustedIterations; index += 1) {
      if (reusesPreparedValue()) matches += 1;
    }

    return Number(process.hrtime.bigint() - before) / trustedIterations;
  });

  assert.equal(matches, iterations * trustedIterations);

  return {
    matches,
    ns: summarize(samples),
  };
};

const cohorts = [
  { name: 'tiny', nodes: 10 },
  { name: 'normal', nodes: 100 },
  { name: 'large', nodes: 1000 },
  { name: 'stress', nodes: 10_000 },
] as const;

const rows = cohorts.map(({ name, nodes }) => {
  const content = createContent(nodes);
  const json = { content, openEnd: 0, openStart: 0 };
  const closed = ContentSlice.closed(content);
  const decoded = ContentSlice.fromJSON(json);
  const closedMs = measureSnapshot(() => ContentSlice.closed(content));
  const fromJsonMs = measureSnapshot(() => ContentSlice.fromJSON(json));
  const prepared = encodeContentSlice(decoded);
  const trustedIdentity = measureTrustedReuse(
    () => ContentSlice.fromJSON(decoded) === decoded
  );
  const trustedPreparation = measureTrustedReuse(
    () => encodeContentSlice(decoded) === prepared
  );
  const sourceAliasFree =
    closed.content !== content &&
    decoded !== json &&
    decoded.content !== content &&
    decoded.content[0] !== content[0];
  const deeplyFrozen = isDeepFrozen(closed) && isDeepFrozen(decoded);

  assert.equal(sourceAliasFree, true);
  assert.equal(deeplyFrozen, true);
  assert.equal(ContentSlice.fromJSON(closed), closed);
  assert.equal(ContentSlice.fromJSON(decoded), decoded);

  return {
    closedMs,
    deeplyFrozen,
    fromJsonMs,
    iterations,
    name,
    nodes,
    payloadBytes: Buffer.byteLength(JSON.stringify(json)),
    repeatedUnit: 'one JSON descendant node',
    sourceAliasFree,
    trustedIdentityMatches: trustedIdentity.matches,
    trustedIterations,
    trustedPreparationMatches: trustedPreparation.matches,
    trustedPreparationReuseNs: trustedPreparation.ns,
    trustedReuseNs: trustedIdentity.ns,
  };
});

const tiny = rows[0]!;
const stress = rows.at(-1)!;
const trustedIdentityReuse = rows.every(
  (row) => row.trustedIdentityMatches === iterations * trustedIterations
);
const trustedPreparationReuse = rows.every(
  (row) => row.trustedPreparationMatches === iterations * trustedIterations
);
const sourceAliasFree = rows.every((row) => row.sourceAliasFree);
const deeplyFrozen = rows.every((row) => row.deeplyFrozen);
const trustedSizeRatio =
  stress.trustedReuseNs.p50 / Math.max(tiny.trustedReuseNs.p50, 0.001);
const trustedPreparationSizeRatio =
  stress.trustedPreparationReuseNs.p50 /
  Math.max(tiny.trustedPreparationReuseNs.p50, 0.001);
const closedSizeRatio =
  stress.closedMs.p50 / Math.max(tiny.closedMs.p50, 0.001);
const fromJsonSizeRatio =
  stress.fromJsonMs.p50 / Math.max(tiny.fromJsonMs.p50, 0.001);

if (process.env.PLITE_CONTENT_SLICE_VALUE_STRICT === '1') {
  assert.equal(trustedIdentityReuse, true);
  assert.equal(trustedPreparationReuse, true);
  assert.equal(sourceAliasFree, true);
  assert.equal(deeplyFrozen, true);
}

const result = {
  benchmark: 'plite-content-slice-value',
  cohorts: Object.fromEntries(
    cohorts.map(({ name, nodes }) => [name, `${nodes} JSON descendant nodes`])
  ),
  correctness: {
    deeplyFrozen,
    sourceAliasFree,
    trustedIdentityReuse,
    trustedPreparationReuse,
  },
  generatedAt: new Date().toISOString(),
  memoryTag:
    'payloadBytes records the serialized input retained by each immutable snapshot; retained JS heap is not inferred from allocator noise.',
  ratios: {
    closedSizeRatio,
    fromJsonSizeRatio,
    trustedPreparationSizeRatio,
    trustedSizeRatio,
  },
  rows,
  thresholdPolicy: {
    correctness:
      'Every constructor must clone away source aliases, deeply freeze the snapshot, and reuse trusted identity and preparation exactly.',
    timing:
      'Clone, validation, trusted identity, and trusted preparation timings establish the baseline. No absolute latency gate exists before comparable baselines are recorded.',
  },
  version: 1,
};
const output = `${JSON.stringify(result, null, 2)}\n`;

process.stdout.write(
  `METRIC plite_content_slice_value_trusted_identity_reuse=${trustedIdentityReuse ? 1 : 0}\n`
);
process.stdout.write(
  `METRIC plite_content_slice_value_trusted_preparation_reuse=${trustedPreparationReuse ? 1 : 0}\n`
);
process.stdout.write(
  `METRIC plite_content_slice_value_source_alias_free=${sourceAliasFree ? 1 : 0}\n`
);
process.stdout.write(
  `METRIC plite_content_slice_value_deeply_frozen=${deeplyFrozen ? 1 : 0}\n`
);
process.stdout.write(
  `METRIC plite_content_slice_value_closed_10000_p50_ms=${stress.closedMs.p50}\n`
);
process.stdout.write(
  `METRIC plite_content_slice_value_from_json_10000_p50_ms=${stress.fromJsonMs.p50}\n`
);
process.stdout.write(
  `METRIC plite_content_slice_value_trusted_10000_p50_ns=${stress.trustedReuseNs.p50}\n`
);
process.stdout.write(
  `METRIC plite_content_slice_value_trusted_preparation_10000_p50_ns=${stress.trustedPreparationReuseNs.p50}\n`
);
process.stdout.write(
  `METRIC plite_content_slice_value_trusted_size_ratio=${trustedSizeRatio}\n`
);
process.stdout.write(
  `METRIC plite_content_slice_value_trusted_preparation_size_ratio=${trustedPreparationSizeRatio}\n`
);

if (outputArgument) {
  writeBenchmarkArtifact(outputArgument.slice('--output='.length), output);
} else {
  process.stdout.write(output);
}

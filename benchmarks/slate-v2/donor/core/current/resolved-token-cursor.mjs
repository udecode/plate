import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { IndexedDocument } from '../../../../../packages/plite/src/core/document-change.ts';
import {
  createTreeIndex,
  ResolvedTokenCursor,
} from '../../../../../packages/plite/src/core/resolved-token-cursor.ts';
import { summarize } from '../../shared/stats.mjs';

const runs = Number.parseInt(process.env.PLITE_CURSOR_RUNS ?? '3', 10);
const samples = Number.parseInt(process.env.PLITE_CURSOR_SAMPLES ?? '15', 10);
const outputArgument = process.argv.find((argument) =>
  argument.startsWith('--output=')
);
const selectedCohorts = new Set(
  (process.env.PLITE_CURSOR_COHORTS ?? 'normal,large,stress').split(',')
);
const ratio = (value, baseline) =>
  Number((value / Math.max(baseline, 0.000_001)).toFixed(4));

const cohortSpecs = [
  { blocks: 500, id: 'normal', queryCount: 256 },
  { blocks: 10_000, id: 'large', queryCount: 128 },
  { blocks: 50_000, id: 'stress', queryCount: 48 },
].filter(({ id }) => selectedCohorts.has(id));

const createChildren = (blocks) =>
  Array.from({ length: blocks }, (_, index) => ({
    children: [
      {
        children: [{ text: `block-${index}-abcdefghijklmnop` }],
        type: 'paragraph',
      },
    ],
    type: 'section',
  }));

const comparePaths = (left, right) => {
  const length = Math.min(left.length, right.length);

  for (let index = 0; index < length; index++) {
    const order = left[index] - right[index];

    if (order !== 0) return order;
  }

  return left.length - right.length;
};

const indexEntries = (nodes) => {
  const entries = [];
  const entryMap = new Map();
  let position = 0;

  const visit = (node, path) => {
    const from = position++;
    const contentFrom = position;
    const kind = typeof node.text === 'string' ? 'text' : 'element';

    if (kind === 'text') {
      position += node.text.length;
    } else {
      node.children.forEach((child, index) => visit(child, [...path, index]));
    }

    const contentTo = position;

    position++;
    const entry = {
      contentFrom,
      contentTo,
      from,
      kind,
      path,
      to: position,
    };

    entries.push(entry);
    entryMap.set(path.join(','), entry);
  };

  nodes.forEach((node, index) => visit(node, [index]));

  return {
    entries,
    entryMap,
    length: position,
    texts: entries
      .filter(({ kind }) => kind === 'text')
      .sort((left, right) => left.contentFrom - right.contentFrom),
  };
};

class LegacyIndexedQueries {
  constructor(index, tree) {
    this.entries = index.entryMap;
    this.length = index.length;
    this.tree = tree;
  }

  nodeRangesTouching(from, to = from) {
    if (from < 0 || to < from || to > this.length) {
      throw new RangeError(`Invalid document range ${from}..${to}.`);
    }

    return [...this.entries.values()]
      .filter((entry) => entry.from <= to && entry.to >= from)
      .sort(
        (left, right) =>
          left.path.length - right.path.length ||
          comparePaths(left.path, right.path)
      );
  }

  nodeStartingAt(position) {
    const visit = (children, contentFrom, parentPath) => {
      for (let index = 0; index < children.children.length; index++) {
        const child = children.children[index];
        const from = contentFrom + children.offsets[index];
        const path = [...parentPath, index];

        if (position === from) {
          return {
            contentFrom: from + 1,
            contentTo: from + child.length - 1,
            from,
            kind: child.kind,
            path,
            to: from + child.length,
          };
        }

        if (
          from < position &&
          position < from + child.length &&
          child.kind === 'element' &&
          child.children
        ) {
          const nested = visit(child.children, from + 1, path);

          if (nested) return nested;
        }
      }

      return null;
    };

    return visit(this.tree, 0, []);
  }

  pointAt(position, assoc = -1) {
    if (position < 0 || position > this.length) {
      throw new RangeError(`Position ${position} is outside the document.`);
    }

    const texts = [...this.entries.values()]
      .filter((entry) => entry.kind === 'text')
      .sort((left, right) => left.contentFrom - right.contentFrom);
    const containing = texts.filter(
      (entry) => entry.contentFrom <= position && position <= entry.contentTo
    );

    if (containing.length > 0) {
      const entry = assoc < 0 ? containing[0] : containing.at(-1);

      return {
        offset: Math.max(
          0,
          Math.min(
            entry.contentTo - entry.contentFrom,
            position - entry.contentFrom
          )
        ),
        path: [...entry.path],
      };
    }

    const before = texts
      .filter((entry) => entry.contentTo < position)
      .at(-1);
    const after = texts.find((entry) => entry.contentFrom > position);
    const entry = assoc < 0 ? (before ?? after) : (after ?? before);

    if (!entry) return null;

    return {
      offset: entry === before ? entry.contentTo - entry.contentFrom : 0,
      path: [...entry.path],
    };
  }
}

const sampleEvenly = (values, count) => {
  const selectedCount = Math.min(count, values.length);

  return Array.from(
    { length: selectedCount },
    (_, index) =>
      values[
        Math.min(
          values.length - 1,
          Math.floor((index * values.length) / selectedCount)
        )
      ]
  );
};

const createQueries = (index, queryCount) => {
  const pointPositions = Array.from(
    { length: queryCount },
    (_, index_) =>
      Math.floor((index_ * index.length) / Math.max(1, queryCount - 1))
  );
  const nodeStartPositions = sampleEvenly(
    index.entries.map(({ from }) => from).sort((left, right) => left - right),
    queryCount
  );
  const rangeStarts = sampleEvenly(
    index.texts.map(({ contentFrom }) => contentFrom),
    Math.max(16, Math.floor(queryCount / 2))
  );
  const touchingRanges = rangeStarts.map((from, index_) => [
    from,
    Math.min(index.length, from + (index_ % 7)),
  ]);

  return { nodeStartPositions, pointPositions, touchingRanges };
};

const pointChecksum = (query, positions) => {
  let checksum = 0;

  for (let index = 0; index < positions.length; index++) {
    const point = query.pointAt(positions[index], index % 2 === 0 ? -1 : 1);

    if (point) {
      checksum += point.offset + point.path.length;
      for (const segment of point.path) checksum += segment;
    }
  }

  return checksum;
};

const startChecksum = (query, positions) => {
  let checksum = 0;

  for (const position of positions) {
    const entry = query.nodeStartingAt(position);

    if (entry) checksum += entry.from + entry.to + entry.path.length;
  }

  return checksum;
};

const touchingChecksum = (query, ranges) => {
  let checksum = 0;

  for (const [from, to] of ranges) {
    const entries = query.nodeRangesTouching(from, to);

    checksum += entries.length;
    for (const entry of entries) {
      checksum += entry.from + entry.to + entry.path.length;
    }
  }

  return checksum;
};

const laneDefinitions = {
  nodeStartWalk: (query, queries) =>
    startChecksum(query, queries.nodeStartPositions),
  pointWalk: (query, queries) =>
    pointChecksum(query, queries.pointPositions),
  touchingRangeWalk: (query, queries) =>
    touchingChecksum(query, queries.touchingRanges),
};
const implementationOrders = [
  ['legacy', 'cursor', 'live'],
  ['cursor', 'live', 'legacy'],
  ['live', 'legacy', 'cursor'],
  ['live', 'cursor', 'legacy'],
  ['cursor', 'legacy', 'live'],
  ['legacy', 'live', 'cursor'],
];

const assertParity = (queries, legacy, live, cursor) => {
  for (let index = 0; index < queries.pointPositions.length; index++) {
    const position = queries.pointPositions[index];
    const assoc = index % 2 === 0 ? -1 : 1;
    const expected = legacy.pointAt(position, assoc);

    assert.deepEqual(live.pointAt(position, assoc), expected);
    assert.deepEqual(cursor.pointAt(position, assoc), expected);
  }

  for (const position of queries.nodeStartPositions) {
    const expected = legacy.nodeStartingAt(position);

    assert.deepEqual(live.nodeStartingAt(position), expected);
    assert.deepEqual(cursor.nodeStartingAt(position), expected);
  }

  for (const [from, to] of queries.touchingRanges) {
    const expected = legacy.nodeRangesTouching(from, to);

    assert.deepEqual(live.nodeRangesTouching(from, to), expected);
    assert.deepEqual(cursor.nodeRangesTouching(from, to), expected);
  }
};

const measureCohort = ({ blocks, id, queryCount }) => {
  const children = createChildren(blocks);
  const flatIndex = indexEntries(children);
  const tree = createTreeIndex(children);
  const legacy = new LegacyIndexedQueries(flatIndex, tree);
  const live = IndexedDocument.fromValue(children);
  const cursor = new ResolvedTokenCursor(tree);
  const queries = createQueries(flatIndex, queryCount);

  assert.equal(live.length, flatIndex.length);
  assertParity(queries, legacy, live, cursor);

  const laneResults = {};

  for (const [laneId, runLane] of Object.entries(laneDefinitions)) {
    const implementations = { cursor, legacy, live };
    const laneSamples = { cursor: [], legacy: [], live: [] };

    for (let warmup = 0; warmup < 3; warmup++) {
      for (const query of Object.values(implementations)) {
        runLane(query, queries);
      }
    }

    for (let sample = 0; sample < samples; sample++) {
      const implementationOrder =
        implementationOrders[sample % implementationOrders.length];

      for (const implementationId of implementationOrder) {
        const start = performance.now();
        const checksum = runLane(implementations[implementationId], queries);

        laneSamples[implementationId].push(performance.now() - start);
        assert.ok(Number.isFinite(checksum));
      }
    }

    const cursorMs = summarize(laneSamples.cursor);
    const legacyMs = summarize(laneSamples.legacy);
    const liveMs = summarize(laneSamples.live);

    laneResults[laneId] = {
      cursorMs,
      legacyMs,
      liveMs,
      ratios: {
        cursorToLegacyMedian: ratio(cursorMs.median, legacyMs.median),
        cursorToLegacyP95: ratio(cursorMs.p95, legacyMs.p95),
        liveToLegacyMedian: ratio(liveMs.median, legacyMs.median),
        liveToLegacyP95: ratio(liveMs.p95, legacyMs.p95),
      },
    };
  }

  return {
    blocks,
    id,
    lanes: laneResults,
    memoryProxy: {
      cursorRetainedFramesMax: 3,
      flatEntryCountAvoided: flatIndex.entries.length,
      sourceNodeCount: blocks * 3,
      treeNodeCount: blocks * 3,
    },
    queryCount,
    tokenLength: flatIndex.length,
  };
};

const results = Array.from({ length: runs }, (_, index) => ({
  cohorts: cohortSpecs.map(measureCohort),
  run: index + 1,
}));

const thresholdPolicy = {
  largeAndStressMedianRatioMax: 0.8,
  largeAndStressP95RatioMax: 0.8,
  normalMedianRatioMax: 1.1,
  normalP95RatioMax: 1.1,
  parityRequired: true,
};
const gateCohorts = new Set(['large', 'stress']);
const promotionRows = results.flatMap(({ cohorts }) =>
  cohorts.flatMap(({ id, lanes }) =>
    Object.entries(lanes).map(([lane, { ratios }]) => ({
      cohort: id,
      lane,
      ...ratios,
    }))
  )
);
const largeAndStressRows = promotionRows.filter(({ cohort }) =>
  gateCohorts.has(cohort)
);
const largeAndStressWin = largeAndStressRows
  .every(
    ({ cursorToLegacyMedian, cursorToLegacyP95 }) =>
      cursorToLegacyMedian <=
        thresholdPolicy.largeAndStressMedianRatioMax &&
      cursorToLegacyP95 <= thresholdPolicy.largeAndStressP95RatioMax
  );
const normalDoesNotRegress = promotionRows
  .filter(({ cohort }) => cohort === 'normal')
  .every(
    ({ cursorToLegacyMedian, cursorToLegacyP95 }) =>
      cursorToLegacyMedian <= thresholdPolicy.normalMedianRatioMax &&
      cursorToLegacyP95 <= thresholdPolicy.normalP95RatioMax
  );
const promotionGate = largeAndStressWin && normalDoesNotRegress;
const worstLargeAndStressMedianRatio = Math.max(
  ...largeAndStressRows.map(({ cursorToLegacyMedian }) =>
    cursorToLegacyMedian
  )
);
const worstLargeAndStressP95Ratio = Math.max(
  ...largeAndStressRows.map(({ cursorToLegacyP95 }) => cursorToLegacyP95)
);
const artifact = {
  artifactVersion: 1,
  benchmark: 'plite-resolved-token-cursor',
  cohorts: {
    large: '10,000 depth-3 blocks',
    normal: '500 depth-3 blocks',
    pathological:
      'not a timing claim; generated equivalence tests own sparse, empty, and irregular nesting',
    stress: '50,000 depth-3 blocks',
  },
  fairness: {
    cursor:
      'one package-private ResolvedTokenCursor reuses the existing immutable TreeIndex; setup is excluded',
    legacy:
      'exact pre-cursor IndexedDocument algorithms over a prebuilt flat entry index and TreeIndex-equivalent positions; setup is excluded',
    live:
      'the checked-out IndexedDocument public query methods, measured with the same prebuilt document and query corpus',
    queryOrder:
      'deterministic monotonically increasing positions and ranges sampled across the full document',
    repeatedUnit:
      'one resolved point, node-start lookup, or small touching-range lookup',
    sampleOrder:
      'all six legacy/cursor/live measurement orders rotate across samples after three untimed warmups',
  },
  gate: {
    largeAndStressWin,
    normalDoesNotRegress,
    parity: true,
    promotePrivateCursor: promotionGate,
    publicPathApiUnchanged: true,
    worstLargeAndStressMedianRatio,
    worstLargeAndStressP95Ratio,
  },
  memory: {
    degradationContract:
      'none: query answers and public structural path APIs remain identical',
    retainedShape:
      'one cursor and at most document-depth frames; no second per-node index',
    transientAllocation:
      'O(document depth) cursor frames and output paths per lookup; no document-size-proportional query allocation',
  },
  results,
  runs,
  samples,
  thresholdPolicy,
};
const artifactPath = outputArgument
  ? resolve(outputArgument.slice('--output='.length))
  : fileURLToPath(
      new URL(
        '../../../../../docs/plans/artifacts/wordgard-plite-final-extraction/resolved-token-cursor-benchmark.json',
        import.meta.url
      )
    );

await mkdir(dirname(artifactPath), { recursive: true });
await writeFile(artifactPath, `${JSON.stringify(artifact, null, 2)}\n`);

console.log(JSON.stringify(artifact, null, 2));
console.log(
  `METRIC plite_resolved_token_cursor_worst_large_stress_median_ratio=${worstLargeAndStressMedianRatio}`
);
console.log(
  `METRIC plite_resolved_token_cursor_worst_large_stress_p95_ratio=${worstLargeAndStressP95Ratio}`
);

if (!promotionGate) process.exitCode = 1;

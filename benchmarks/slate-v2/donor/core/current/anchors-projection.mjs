import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { arch, cpus, platform, release } from "node:os";

import { createEditor, DocumentChange } from "../../../../../packages/plitejs/src/index.ts";
import {
  getSnapshot,
  observeAnchorStateWork,
  replace as editorReplace,
} from "../../../../../packages/plitejs/src/internal/index.ts";
import { projectRangeInSnapshot } from "../../../../../packages/plitejs/src/range-projection.ts";
import { writeBenchmarkArtifact } from "../../shared/stats.mjs";

const outputPath =
  process.argv.find((value) => value.startsWith("--output="))?.slice(9) ??
  "tmp/plite-anchors-projection-benchmark.json";
const strict = process.env.PLITE_ANCHORS_PROJECTION_STRICT === "1";
const cohorts = (
  process.env.PLITE_ANCHORS_PROJECTION_COUNTS?.split(",")
    .map(Number)
    .filter((value) => Number.isInteger(value) && value > 0) ?? [
    100, 1_000, 10_000,
  ]
);
const includePathological =
  process.env.PLITE_ANCHORS_PROJECTION_PATHOLOGICAL !== "0";
const frameBudgetMs = 16.67;
const distributedOverheadBudgetMs = 5;
const pathologicalBudgetMs = 100;
const coldAnchorBudgetMs = 250;
const bulkReleaseBudgetMs = 100;
const measuredInputs = [
  "benchmarks/slate-v2/donor/core/current/anchors-projection.mjs",
  "packages/plitejs/src/core/anchor-state.ts",
  "packages/plitejs/src/core/anchor.ts",
  "packages/plitejs/src/core/commit.ts",
  "packages/plitejs/src/core/public-state.ts",
  "packages/plitejs/src/core/snapshot-index.ts",
  "packages/plitejs/src/core/change/document-change.ts",
  "packages/plitejs/src/core/change/document-index.ts",
  "packages/plitejs/src/interfaces/node.ts",
  "packages/plitejs/src/range-projection.ts",
];
const fingerprint = () => Object.fromEntries(measuredInputs.map((path) => [
  path, createHash("sha256").update(readFileSync(path)).digest("hex"),
]));
const sourceBefore = fingerprint();

const round = (value) => Number(value.toFixed(6));
const percentile = (sorted, ratio) =>
  sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * ratio) - 1)] ??
  0;

const summarize = (samples, packets) => {
  const sorted = [...samples].sort((left, right) => left - right);
  const packetP95 = packets.map((packet) =>
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
    packetP95: packetP95.map(round),
    p95PacketNoiseMs: round(Math.max(...packetP95) - Math.min(...packetP95)),
    sampleCount: samples.length,
  });
};

const sampleContract = (count) =>
  count >= 10_000
    ? { packets: 3, samplesPerPacket: 5, warmups: 2 }
    : { packets: 3, samplesPerPacket: 12, warmups: 8 };

const createChildren = (count) =>
  Array.from({ length: count }, (_, index) => ({
    children: [{ text: `block-${index}-content` }],
    type: "paragraph",
  }));

const createEditorWithChildren = (count) => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createChildren(count),
    marks: null,
    selection: null,
  });

  return editor;
};

const createAnchors = (editor, count, colocated) =>
  Array.from({ length: count }, (_, index) =>
    editor.anchor(
      {
        anchor: { offset: 0, path: [colocated ? 0 : index, 0] },
        focus: { offset: 8, path: [colocated ? 0 : index, 0] },
      },
      { association: "inward", deletion: "drop" }
    )
  );

const measureEditPair = (count, colocated) => {
  const blockCount = colocated ? 1 : count;
  const baseEditor = createEditorWithChildren(blockCount);
  const anchorEditor = createEditorWithChildren(blockCount);
  const anchorCreationStartedAt = performance.now();
  const anchors = createAnchors(anchorEditor, count, colocated);
  const coldAnchorCreationMs = performance.now() - anchorCreationStartedAt;
  const coldAnchorCreation = summarize(
    [coldAnchorCreationMs],
    [[coldAnchorCreationMs]]
  );
  const contract = sampleContract(count);
  const work = {
    beginVisitedAnchors: 0,
    changeVisitedAnchors: 0,
    commitVisitedAnchors: 0,
    discardVisitedAnchors: 0,
  };
  let activeWork = null;
  let editCount = 0;
  const stopObserving = observeAnchorStateWork(anchorEditor, (entry) => {
    if (!activeWork) return;

    activeWork[`${entry.phase}VisitedAnchors`] += entry.visitedAnchors;
  });
  const edit = (editor) => {
    editor.update.text.insert("x", { at: { offset: 0, path: [0, 0] } });
  };
  const runBase = () => {
    const start = performance.now();

    edit(baseEditor);
    return performance.now() - start;
  };
  const runAnchors = () => {
    activeWork = {
      beginVisitedAnchors: 0,
      changeVisitedAnchors: 0,
      commitVisitedAnchors: 0,
      discardVisitedAnchors: 0,
    };
    const start = performance.now();

    edit(anchorEditor);
    const duration = performance.now() - start;
    editCount += 1;

    for (const key of Object.keys(work)) {
      work[key] = Math.max(work[key], activeWork[key]);
    }
    activeWork = null;
    assert.deepEqual(anchors[0]?.resolve(), {
      anchor: { offset: editCount, path: [0, 0] },
      focus: { offset: editCount + 8, path: [0, 0] },
    });

    return duration;
  };

  for (let index = 0; index < contract.warmups; index += 1) {
    if (index % 2 === 0) {
      runBase();
      runAnchors();
    } else {
      runAnchors();
      runBase();
    }
  }

  const basePackets = [];
  const anchorPackets = [];

  for (let packet = 0; packet < contract.packets; packet += 1) {
    const baseSamples = [];
    const anchorSamples = [];

    for (let sample = 0; sample < contract.samplesPerPacket; sample += 1) {
      if ((packet + sample) % 2 === 0) {
        baseSamples.push(runBase());
        anchorSamples.push(runAnchors());
      } else {
        anchorSamples.push(runAnchors());
        baseSamples.push(runBase());
      }
    }
    basePackets.push(baseSamples);
    anchorPackets.push(anchorSamples);
  }

  stopObserving();
  if (!colocated && count > 1) {
    anchorEditor.update.text.insert("y", {
      at: { offset: 0, path: [count - 1, 0] },
    });
  }
  const releaseStartedAt = performance.now();
  const released = anchors.map((anchor) => anchor.release());
  const bulkReleaseMs = performance.now() - releaseStartedAt;

  released.forEach((range, index) => {
    const offset = colocated || index === 0
      ? editCount
      : index === count - 1 ? 1 : 0;
    const path = [colocated ? 0 : index, 0];

    assert.deepEqual(range, {
      anchor: { offset, path },
      focus: { offset: offset + 8, path },
    });
    assert.equal(anchors[index].resolve(), null);
  });

  return {
    anchor: summarize(anchorPackets.flat(), anchorPackets),
    base: summarize(basePackets.flat(), basePackets),
    bulkRelease: summarize([bulkReleaseMs], [[bulkReleaseMs]]),
    coldAnchorCreation,
    correctnessGuards: [
      "exact range after every affected edit",
      "unread target after unrelated-then-affected edits",
      "unchanged ranges retain their positions",
      "all released handles expire",
    ],
    contract,
    work: Object.freeze({
      ...work,
      affectedAnchors: colocated ? count : 1,
      unrelatedChangeVisits: Math.max(
        0,
        work.changeVisitedAnchors - (colocated ? count : 1)
      ),
    }),
  };
};

const rows = [];

for (const count of cohorts) {
  const measured = measureEditPair(count, false);
  const budgetMs =
    count < 10_000
      ? frameBudgetMs
      : Math.max(
          measured.base.p95 * 1.2,
          measured.base.p95 + distributedOverheadBudgetMs
        );
  const pass =
    measured.anchor.p95 <= budgetMs &&
    measured.bulkRelease.max <= bulkReleaseBudgetMs &&
    measured.work.beginVisitedAnchors === 0 &&
    measured.work.changeVisitedAnchors <= 1 &&
    measured.work.commitVisitedAnchors <= 1 &&
    measured.work.unrelatedChangeVisits === 0;

  rows.push({
    budgetMs: round(budgetMs),
    cohort: `distributed:nodes=${count}:anchors=${count}`,
    expectedComplexity: "O(affected anchors) edit publication",
    ...measured,
    pass,
  });
}

const pathological = includePathological
  ? measureEditPair(10_000, true)
  : null;

if (pathological) {
  rows.push({
    budgetMs: pathologicalBudgetMs,
    cohort: "pathological:nodes=1:anchors=10000",
    expectedComplexity: "O(affected anchors) edit publication",
    ...pathological,
    pass:
      pathological.anchor.p95 <= pathologicalBudgetMs &&
      pathological.bulkRelease.max <= bulkReleaseBudgetMs &&
      pathological.work.beginVisitedAnchors === 0 &&
      pathological.work.changeVisitedAnchors <= 10_000 &&
      pathological.work.commitVisitedAnchors <= 10_000 &&
      pathological.work.unrelatedChangeVisits === 0,
  });
}

const projectionRows = [100, 1000, 10_000, 100_000].flatMap((count) =>
  [false, true].map((wideBlock) => {
    const editor = createEditor({ initialValue: wideBlock
      ? [{ type: "paragraph", children: Array.from({ length: count }, (_, part) => ({ text: "text", part })) }]
      : Array.from({ length: count }, () => ({ type: "paragraph", children: [{ text: "text" }] })),
    });
    const original = getSnapshot(editor);
    const start = { path: wideBlock ? [0, count - 2] : [count - 2, 0], offset: 1 };
    const end = { path: wideBlock ? [0, count - 1] : [count - 1, 0], offset: 2 };
    const expected = [
      { key: original.index.keyAt(start.path), path: start.path, start: 1, end: 4 },
      { key: original.index.keyAt(end.path), path: end.path, start: 0, end: 2 },
    ];
    const samples = [];
    let maxKeyReads = 0;
    for (let sample = 0; sample < 21; sample++) {
      let keyReads = 0;
      const snapshot = { ...original, index: {
        ...original.index,
        keyAt: (path) => { keyReads++; return original.index.keyAt(path); },
      } };
      const started = performance.now();
      const projected = projectRangeInSnapshot(snapshot, { anchor: start, focus: end });
      const duration = performance.now() - started;
      assert.deepEqual(projected, expected);
      assert.equal(Object.isFrozen(projected), true);
      assert.equal(Object.isFrozen(projected[0].path), true);
      maxKeyReads = Math.max(maxKeyReads, keyReads);
      if (sample > 0) samples.push(duration);
    }
    const durationMs = summarize(samples, [samples]);
    return { count, shape: wideBlock ? "wide-block" : "cross-block", durationMs, maxKeyReads,
      pass: maxKeyReads === 2 && durationMs.p95 <= frameBudgetMs };
  })
);
const repeatedReadRows = [100, 1000, 10_000].map((count) => {
  const editor = createEditorWithChildren(1);
  const anchors = createAnchors(editor, count, true);
  const originalMap = DocumentChange.prototype.mapPosition;
  let endpointMappings = 0;
  DocumentChange.prototype.mapPosition = function (...args) {
    endpointMappings++;
    return originalMap.apply(this, args);
  };
  try {
    editor.update.text.insert('x', { at: { path: [0, 0], offset: 0 } });
  } finally {
    DocumentChange.prototype.mapPosition = originalMap;
  }
  const original = getSnapshot(editor);
  let projectedKeyReads = 0;
  const snapshot = { ...original, index: {
    ...original.index,
    keyAt: (path) => { projectedKeyReads++; return original.index.keyAt(path); },
  } };
  for (const anchor of anchors) {
    const range = anchor.resolve();
    assert.deepEqual(range, { anchor: { path: [0, 0], offset: 1 }, focus: { path: [0, 0], offset: 9 } });
    const projected = projectRangeInSnapshot(snapshot, range);
    assert.equal(projected[0].start, 1);
    assert.equal(projected[0].end, 9);
    anchor.release();
  }
  return { count, endpointMappings, projectedKeyReads,
    pass: endpointMappings <= 4 && projectedKeyReads === 1 };
});
const sourceAfter = fingerprint();
assert.deepEqual(sourceAfter, sourceBefore, "Measured source changed during the benchmark");
const coldPass = rows.every(
  (row) => row.coldAnchorCreation.max <= coldAnchorBudgetMs
);
const pass = rows.every((row) => row.pass) && coldPass && projectionRows.every((row) => row.pass) && repeatedReadRows.every((row) => row.pass);
const artifact = {
  artifactVersion: 3,
  benchmark: "plite-anchor-state-scalability",
  budgets: {
    bulkReleaseMaxMs: bulkReleaseBudgetMs,
    coldAnchorCreationMaxMs: coldAnchorBudgetMs,
    distributedOverheadP95Ms: distributedOverheadBudgetMs,
    frameP95Ms: frameBudgetMs,
    pathologicalP95Ms: pathologicalBudgetMs,
  },
  environment: {
    arch: arch(),
    bun: Bun.version,
    cpu: cpus()[0]?.model ?? "unknown",
    cpuCount: cpus().length,
    platform: platform(),
    release: release(),
  },
  generatedAt: new Date().toISOString(),
  pass,
  projectionRows,
  repeatedReadRows,
  rows,
  sourceIdentity: {
    head: execFileSync("git", ["rev-parse", "HEAD"], {
      encoding: "utf8",
    }).trim(),
    measuredInputs: sourceAfter,
  },
  summary: {
    correctnessFailures: 0,
    distributed10000P95Ms:
      rows.find((row) => row.cohort === "distributed:nodes=10000:anchors=10000")
        ?.anchor.p95 ?? null,
    maxColdAnchorCreationMs: round(
      Math.max(...rows.map((row) => row.coldAnchorCreation.max))
    ),
    maxBulkReleaseMs: round(
      Math.max(...rows.map((row) => row.bulkRelease.max))
    ),
    maxUnrelatedChangeVisits: Math.max(
      ...rows.map((row) => row.work.unrelatedChangeVisits)
    ),
    pathological10000P95Ms: pathological?.anchor.p95 ?? null,
    redCohorts: rows.filter((row) => !row.pass).map((row) => row.cohort),
    projectionFailures: projectionRows.filter((row) => !row.pass).length,
    repeatedReadFailures: repeatedReadRows.filter((row) => !row.pass).length,
    projectionWorstP95Ms: Math.max(...projectionRows.map((row) => row.durationMs.p95)),
  },
};

await writeBenchmarkArtifact(outputPath, artifact);

console.log(
  `METRIC plite_anchor_state_distributed_10000_p95_ms=${artifact.summary.distributed10000P95Ms}`
);
console.log(
  `METRIC plite_anchor_state_pathological_10000_p95_ms=${artifact.summary.pathological10000P95Ms}`
);
console.log(
  `METRIC plite_anchor_state_max_unrelated_change_visits=${artifact.summary.maxUnrelatedChangeVisits}`
);
console.log(
  `METRIC plite_anchor_state_max_cold_creation_ms=${artifact.summary.maxColdAnchorCreationMs}`
);
console.log(
  `METRIC plite_anchor_state_max_bulk_release_ms=${artifact.summary.maxBulkReleaseMs}`
);
console.log("METRIC plite_anchor_state_correctness_failures=0");
console.log(JSON.stringify(artifact.summary));

if (strict && !pass) process.exitCode = 1;

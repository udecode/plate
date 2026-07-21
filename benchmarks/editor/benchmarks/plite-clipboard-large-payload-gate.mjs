import path from 'node:path';

export const CLIPBOARD_AUTHORITY_ARTIFACT_PATH =
  'tmp/slate-clipboard-large-payload-benchmark.json';

export const isClipboardAuthorityArtifactPath = (
  outputPath,
  cwd = process.cwd()
) =>
  path.resolve(cwd, outputPath) ===
  path.resolve(cwd, CLIPBOARD_AUTHORITY_ARTIFACT_PATH);

const LARGE_PASTE_BASELINE_SOURCE =
  'docs/solutions/performance-issues/2026-05-05-plite-large-paste-fast-path-must-still-be-a-logical-operation.md';

export const CLIPBOARD_ISSUE_TARGET_BUDGETS = Object.freeze({
  largePlainTextPaste10000P50: Object.freeze({
    baselineMs: 38.57,
    limitMs: 60,
    source: LARGE_PASTE_BASELINE_SOURCE,
  }),
  populatedFullSelectionCopy10000P50: Object.freeze({
    baselineMs: 12.16,
    limitMs: 20,
    source: LARGE_PASTE_BASELINE_SOURCE,
  }),
  populatedMiddlePlainTextPaste10000Into10000P50: Object.freeze({
    baselineMs: 185.49,
    limitMs: 280,
    source: LARGE_PASTE_BASELINE_SOURCE,
  }),
});

const timedThreshold = (lane, budget, exactSize) => ({
  actualMs: Number.isFinite(lane?.p50) ? lane.p50 : null,
  ...budget,
  passed: exactSize && Number.isFinite(lane?.p50) && lane.p50 <= budget.limitMs,
});

const countThreshold = (actual, exactSize) => ({
  actual: Number.isInteger(actual) ? actual : null,
  limit: 1,
  passed: exactSize && actual === 1,
});

export const createClipboardIssueTargetThresholds = ({
  hugeCutBlocks,
  issueTargetStressLines,
  issueTargets,
  pathological,
  releaseGate,
}) => {
  const thresholds = {
    commitCount: countThreshold(
      pathological?.cutTwoBlocksEditMs?.metadata?.commitCount,
      !releaseGate || hugeCutBlocks === 50_000
    ),
    cutTwoBlocksEditMsP50: {
      actualMs: pathological?.cutTwoBlocksEditMs?.p50 ?? null,
      limitMs: 150,
      passed:
        (!releaseGate || hugeCutBlocks === 50_000) &&
        Number.isFinite(pathological?.cutTwoBlocksEditMs?.p50) &&
        pathological.cutTwoBlocksEditMs.p50 < 150,
    },
    cutTwoBlocksMaximumChangedTokenSpan: {
      actual:
        pathological?.cutTwoBlocksEditMs?.metadata?.maximumChangedTokenSpan ??
        null,
      limit: 64,
      passed:
        (!releaseGate || hugeCutBlocks === 50_000) &&
        Number.isInteger(
          pathological?.cutTwoBlocksEditMs?.metadata?.maximumChangedTokenSpan
        ) &&
        pathological.cutTwoBlocksEditMs.metadata.maximumChangedTokenSpan <= 64,
    },
    cutTwoBlocksMaximumChangedTopLevelSpan: {
      actual:
        pathological?.cutTwoBlocksEditMs?.metadata
          ?.maximumChangedTopLevelSpan ?? null,
      limit: 1,
      passed:
        (!releaseGate || hugeCutBlocks === 50_000) &&
        Number.isInteger(
          pathological?.cutTwoBlocksEditMs?.metadata?.maximumChangedTopLevelSpan
        ) &&
        pathological.cutTwoBlocksEditMs.metadata.maximumChangedTopLevelSpan <=
          1,
    },
    cutTwoBlocksMsP50: {
      actualMs: pathological?.cutTwoBlocksMs?.p50 ?? null,
      limitMs: 250,
      passed:
        (!releaseGate || hugeCutBlocks === 50_000) &&
        Number.isFinite(pathological?.cutTwoBlocksMs?.p50) &&
        pathological.cutTwoBlocksMs.p50 < 250,
    },
  };

  const exactSize = issueTargetStressLines === 10_000;

  // Reduced smoke runs validate harness correctness only. An exact 10k
  // diagnostic exercises the same frozen issue budgets as the authority run;
  // only the 50k cut configuration remains authority-artifact-specific.
  if (!releaseGate && !exactSize) return thresholds;

  return {
    ...thresholds,
    largePlainTextPaste10000CommitCount: countThreshold(
      issueTargets?.largePlainTextPaste10000?.metadata?.commitCount,
      exactSize
    ),
    largePlainTextPaste10000P50: timedThreshold(
      issueTargets?.largePlainTextPaste10000,
      CLIPBOARD_ISSUE_TARGET_BUDGETS.largePlainTextPaste10000P50,
      exactSize
    ),
    populatedFullSelectionCopy10000P50: timedThreshold(
      issueTargets?.populatedFullSelectionCopy10000,
      CLIPBOARD_ISSUE_TARGET_BUDGETS.populatedFullSelectionCopy10000P50,
      exactSize
    ),
    populatedMiddlePlainTextPaste10000Into10000CommitCount: countThreshold(
      issueTargets?.populatedMiddlePlainTextPaste10000Into10000?.metadata
        ?.commitCount,
      exactSize
    ),
    populatedMiddlePlainTextPaste10000Into10000P50: timedThreshold(
      issueTargets?.populatedMiddlePlainTextPaste10000Into10000,
      CLIPBOARD_ISSUE_TARGET_BUDGETS.populatedMiddlePlainTextPaste10000Into10000P50,
      exactSize
    ),
  };
};

export const hasClipboardBenchmarkFailures = ({
  correctnessFailures,
  issueBudgetFailures,
}) => correctnessFailures.length > 0 || issueBudgetFailures.length > 0;

export declare const CLIPBOARD_AUTHORITY_ARTIFACT_PATH =
  'tmp/slate-clipboard-large-payload-benchmark.json';
export declare const isClipboardAuthorityArtifactPath: (
  outputPath: any,
  cwd?: string
) => boolean;
export declare const CLIPBOARD_ISSUE_TARGET_BUDGETS: Readonly<{
  largePlainTextPaste10000P50: Readonly<{
    baselineMs: 38.57;
    limitMs: 60;
    source: 'docs/solutions/performance-issues/2026-05-05-plite-large-paste-fast-path-must-still-be-a-logical-operation.md';
  }>;
  populatedFullSelectionCopy10000P50: Readonly<{
    baselineMs: 12.16;
    limitMs: 20;
    source: 'docs/solutions/performance-issues/2026-05-05-plite-large-paste-fast-path-must-still-be-a-logical-operation.md';
  }>;
  populatedMiddlePlainTextPaste10000Into10000P50: Readonly<{
    baselineMs: 185.49;
    limitMs: 280;
    source: 'docs/solutions/performance-issues/2026-05-05-plite-large-paste-fast-path-must-still-be-a-logical-operation.md';
  }>;
}>;
export declare const createClipboardIssueTargetThresholds: ({
  hugeCutBlocks,
  issueTargetStressLines,
  issueTargets,
  pathological,
  releaseGate,
}: {
  hugeCutBlocks: any;
  issueTargetStressLines: any;
  issueTargets: any;
  pathological: any;
  releaseGate: any;
}) =>
  | {
      commitCount: {
        actual: any;
        limit: number;
        passed: any;
      };
      cutTwoBlocksEditMsP50: {
        actualMs: any;
        limitMs: number;
        passed: boolean;
      };
      cutTwoBlocksMaximumChangedTokenSpan: {
        actual: any;
        limit: number;
        passed: boolean;
      };
      cutTwoBlocksMaximumChangedTopLevelSpan: {
        actual: any;
        limit: number;
        passed: boolean;
      };
      cutTwoBlocksMsP50: {
        actualMs: any;
        limitMs: number;
        passed: boolean;
      };
    }
  | {
      commitCount: {
        actual: any;
        limit: number;
        passed: any;
      };
      cutTwoBlocksEditMsP50: {
        actualMs: any;
        limitMs: number;
        passed: boolean;
      };
      cutTwoBlocksMaximumChangedTokenSpan: {
        actual: any;
        limit: number;
        passed: boolean;
      };
      cutTwoBlocksMaximumChangedTopLevelSpan: {
        actual: any;
        limit: number;
        passed: boolean;
      };
      cutTwoBlocksMsP50: {
        actualMs: any;
        limitMs: number;
        passed: boolean;
      };
      largePlainTextPaste10000CommitCount: {
        actual: any;
        limit: number;
        passed: any;
      };
      largePlainTextPaste10000P50: any;
      populatedFullSelectionCopy10000P50: any;
      populatedMiddlePlainTextPaste10000Into10000CommitCount: {
        actual: any;
        limit: number;
        passed: any;
      };
      populatedMiddlePlainTextPaste10000Into10000P50: any;
    };
export declare const hasClipboardBenchmarkFailures: ({
  correctnessFailures,
  issueBudgetFailures,
}: {
  correctnessFailures: any;
  issueBudgetFailures: any;
}) => boolean;

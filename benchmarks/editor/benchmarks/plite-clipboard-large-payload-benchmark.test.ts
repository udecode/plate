import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it } from 'node:test';

import {
  CLIPBOARD_AUTHORITY_ARTIFACT_PATH,
  CLIPBOARD_ISSUE_TARGET_BUDGETS,
  createClipboardIssueTargetThresholds,
  hasClipboardBenchmarkFailures,
  isClipboardAuthorityArtifactPath,
} from './plite-clipboard-large-payload-gate.mjs';

const root = resolve(import.meta.dir, '../../..');
const authorityArtifactPath = resolve(
  root,
  'tmp/slate-clipboard-large-payload-benchmark.json'
);
const boundedArtifactPath = resolve(
  root,
  'tmp/slate-clipboard-large-payload-benchmark-bounded.json'
);
const benchmarkPath = resolve(
  root,
  'benchmarks/slate-v2/donor/core/current/clipboard-large-payload.mjs'
);
const registryPath = resolve(root, 'benchmarks/targets/slate-v2.json');

type BenchmarkLane = {
  inspectionMs: { p95: number };
  metadata: {
    commitCount?: number;
    fitted?: boolean;
    hostParseMs?: number;
    publishedCommits?: number;
  };
  retainedHeapDeltaBytes: { samples: number[] } | null;
  setupMs: { p95: number };
};

type BenchmarkSummary = {
  cohorts: {
    stress: {
      hostCodecInsertMs: BenchmarkLane;
      sliceCommitMs: BenchmarkLane;
      sliceFitMs: BenchmarkLane;
    };
  };
  config: {
    authorityArtifact: boolean;
    hugeCutBlocks: number;
    issueTargetStressLines: number;
    issueTargetsEnabled: boolean;
  };
  correctnessFailures: string[];
  issueTargets: Record<string, BenchmarkLane>;
  metrics: Record<string, number>;
  thresholdPolicy: { releaseGate: boolean };
};

describe('clipboard large-payload benchmark authority', () => {
  it('fails closed on missing or reduced 10k authority thresholds', () => {
    const thresholds = createClipboardIssueTargetThresholds({
      hugeCutBlocks: 50_000,
      issueTargetStressLines: 10_000,
      issueTargets: {
        largePlainTextPaste10000: {
          metadata: { commitCount: 1 },
          p50: 38.57,
        },
        populatedFullSelectionCopy10000: { p50: 12.16 },
      },
      pathological: {
        cutTwoBlocksEditMs: {
          metadata: {
            commitCount: 1,
            maximumChangedTokenSpan: 36,
            maximumChangedTopLevelSpan: 1,
          },
          p50: 100,
        },
        cutTwoBlocksMs: { p50: 200 },
      },
      releaseGate: true,
    });

    assert.equal(
      thresholds.populatedMiddlePlainTextPaste10000Into10000P50.passed,
      false
    );
    assert.equal(
      thresholds.populatedMiddlePlainTextPaste10000Into10000CommitCount.passed,
      false
    );

    const reduced = createClipboardIssueTargetThresholds({
      hugeCutBlocks: 20,
      issueTargetStressLines: 20,
      issueTargets: {
        largePlainTextPaste10000: {
          metadata: { commitCount: 1 },
          p50: 1,
        },
        populatedFullSelectionCopy10000: { p50: 1 },
        populatedMiddlePlainTextPaste10000Into10000: {
          metadata: { commitCount: 1 },
          p50: 1,
        },
      },
      pathological: {
        cutTwoBlocksEditMs: {
          metadata: {
            commitCount: 1,
            maximumChangedTokenSpan: 1,
            maximumChangedTopLevelSpan: 1,
          },
          p50: 1,
        },
        cutTwoBlocksMs: { p50: 1 },
      },
      releaseGate: true,
    });

    assert.equal(reduced.largePlainTextPaste10000P50.passed, false);
    assert.equal(reduced.cutTwoBlocksEditMsP50.passed, false);

    const diagnostic = createClipboardIssueTargetThresholds({
      hugeCutBlocks: 20,
      issueTargetStressLines: 10_000,
      issueTargets: {
        largePlainTextPaste10000: {
          metadata: { commitCount: 1 },
          p50: 61,
        },
        populatedFullSelectionCopy10000: { p50: 12 },
        populatedMiddlePlainTextPaste10000Into10000: {
          metadata: { commitCount: 1 },
          p50: 200,
        },
      },
      pathological: {
        cutTwoBlocksEditMs: {
          metadata: {
            commitCount: 1,
            maximumChangedTokenSpan: 1,
            maximumChangedTopLevelSpan: 1,
          },
          p50: 1,
        },
        cutTwoBlocksMs: { p50: 1 },
      },
      releaseGate: false,
    });

    assert.equal(diagnostic.largePlainTextPaste10000P50.passed, false);
    assert.equal(diagnostic.populatedFullSelectionCopy10000P50.passed, true);
    assert.equal(
      diagnostic.populatedMiddlePlainTextPaste10000Into10000P50.passed,
      true
    );
    assert.deepEqual(CLIPBOARD_ISSUE_TARGET_BUDGETS, {
      largePlainTextPaste10000P50: {
        baselineMs: 38.57,
        limitMs: 60,
        source:
          'docs/solutions/performance-issues/2026-05-05-plite-large-paste-fast-path-must-still-be-a-logical-operation.md',
      },
      populatedFullSelectionCopy10000P50: {
        baselineMs: 12.16,
        limitMs: 20,
        source:
          'docs/solutions/performance-issues/2026-05-05-plite-large-paste-fast-path-must-still-be-a-logical-operation.md',
      },
      populatedMiddlePlainTextPaste10000Into10000P50: {
        baselineMs: 185.49,
        limitMs: 280,
        source:
          'docs/solutions/performance-issues/2026-05-05-plite-large-paste-fast-path-must-still-be-a-logical-operation.md',
      },
    });
  });

  it('fails correctness or issue-budget regressions and resolves authority aliases', () => {
    assert.equal(
      hasClipboardBenchmarkFailures({
        correctnessFailures: [],
        issueBudgetFailures: [],
      }),
      false
    );
    assert.equal(
      hasClipboardBenchmarkFailures({
        correctnessFailures: ['model mismatch'],
        issueBudgetFailures: [],
      }),
      true
    );
    assert.equal(
      hasClipboardBenchmarkFailures({
        correctnessFailures: [],
        issueBudgetFailures: ['cutTwoBlocksEditMsP50'],
      }),
      true
    );
    assert.equal(
      isClipboardAuthorityArtifactPath(CLIPBOARD_AUTHORITY_ARTIFACT_PATH, root),
      true
    );
    assert.equal(
      isClipboardAuthorityArtifactPath(
        `./${CLIPBOARD_AUTHORITY_ARTIFACT_PATH}`,
        root
      ),
      true
    );
    assert.equal(
      isClipboardAuthorityArtifactPath(authorityArtifactPath, root),
      true
    );
    assert.equal(
      isClipboardAuthorityArtifactPath(boundedArtifactPath, root),
      false
    );

    for (const [output, issueTargets] of [
      [`./${CLIPBOARD_AUTHORITY_ARTIFACT_PATH}`, '0'],
      [authorityArtifactPath, '1'],
    ]) {
      const result = spawnSync(
        process.execPath,
        [
          '--preload',
          './config/plite-source-aliases.ts',
          benchmarkPath,
          `--output=${output}`,
        ],
        {
          cwd: root,
          encoding: 'utf8',
          env: {
            ...process.env,
            PLITE_CLIPBOARD_BENCH_HUGE_CUT_BLOCKS: '20',
            PLITE_CLIPBOARD_BENCH_ISSUE_TARGETS: issueTargets,
          },
          timeout: 5000,
        }
      );

      assert.notEqual(result.status, 0);
      assert.match(
        `${result.stderr}\n${result.stdout}`,
        /canonical clipboard authority artifact requires 50,000 cut blocks/u
      );
    }
  });

  it('runs the live encode, decode, HostCodec, fit, and commit boundaries on a bounded corpus', {
    timeout: 30_000,
  }, () => {
    const result = spawnSync(
      process.execPath,
      [
        '--expose-gc',
        '--preload',
        './config/plite-source-aliases.ts',
        benchmarkPath,
        '--output=tmp/slate-clipboard-large-payload-benchmark-bounded.json',
      ],
      {
        cwd: root,
        encoding: 'utf8',
        env: {
          ...process.env,
          PLITE_CLIPBOARD_BENCH_HUGE_CUT_BLOCKS: '20',
          PLITE_CLIPBOARD_BENCH_HUGE_CUT_ITERATIONS: '1',
          PLITE_CLIPBOARD_BENCH_ISSUE_ITERATIONS: '1',
          PLITE_CLIPBOARD_BENCH_ISSUE_STRESS_LINES: '20',
          PLITE_CLIPBOARD_BENCH_ISSUE_TARGETS: '1',
          PLITE_CLIPBOARD_BENCH_ITERATIONS: '1',
          PLITE_CLIPBOARD_BENCH_STRESS_ITERATIONS: '1',
          PLITE_CLIPBOARD_BENCH_STRESS_LINES: '20',
        },
        maxBuffer: 10 * 1024 * 1024,
        timeout: 25_000,
      }
    );

    assert.equal(result.status, 0, `${result.stderr}\n${result.stdout}`.trim());
    assert.match(result.stdout, /METRIC plite_clipboard_worst_issue_p95_ms=/u);
    assert.match(
      result.stdout,
      /METRIC plite_clipboard_correctness_failures=0/u
    );

    const summary = JSON.parse(
      readFileSync(boundedArtifactPath, 'utf8')
    ) as BenchmarkSummary;

    assert.notEqual(boundedArtifactPath, authorityArtifactPath);
    assert.deepEqual(summary.correctnessFailures, []);
    assert.equal(summary.config.authorityArtifact, false);
    assert.equal(summary.config.hugeCutBlocks, 20);
    assert.equal(summary.config.issueTargetStressLines, 20);
    assert.equal(summary.config.issueTargetsEnabled, true);
    assert.equal(summary.metrics.plite_clipboard_correctness_failures, 0);
    assert.equal(summary.metrics.plite_clipboard_gc_available, 1);
    assert.equal(summary.thresholdPolicy.releaseGate, false);
    assert.equal(summary.cohorts.stress.sliceFitMs.metadata.fitted, true);
    assert.equal(
      summary.cohorts.stress.sliceFitMs.metadata.publishedCommits,
      0
    );
    assert.equal(summary.cohorts.stress.sliceCommitMs.metadata.commitCount, 1);
    assert.ok(summary.cohorts.stress.sliceCommitMs.inspectionMs.p95 >= 0);
    assert.ok(summary.cohorts.stress.sliceCommitMs.setupMs.p95 >= 0);
    assert.equal(
      summary.cohorts.stress.hostCodecInsertMs.metadata.commitCount,
      1
    );
    assert.ok(
      (summary.cohorts.stress.hostCodecInsertMs.metadata.hostParseMs ?? -1) >= 0
    );
    assert.ok(
      summary.cohorts.stress.sliceCommitMs.retainedHeapDeltaBytes !== null
    );
    assert.equal(Object.keys(summary.issueTargets).length, 3);
  });

  it('keeps one issue-sized target with native metrics and bounded correctness', () => {
    const registry = JSON.parse(readFileSync(registryPath, 'utf8')) as {
      targets: Array<{
        artifacts: Array<{ path: string; required: boolean }>;
        command: string;
        correctness: { command: string };
        id: string;
        metrics: { primary: string; printsMetric: boolean; unit: string };
      }>;
    };
    const targets = registry.targets.filter(
      ({ id }) => id === 'clipboard-large-payload'
    );
    const source = readFileSync(benchmarkPath, 'utf8');

    assert.equal(targets.length, 1);
    assert.match(targets[0]!.command, /HUGE_CUT_BLOCKS=50000/u);
    assert.match(targets[0]!.command, /ISSUE_TARGETS=1/u);
    assert.match(
      targets[0]!.command,
      /--output=tmp\/slate-clipboard-large-payload-benchmark\.json/u
    );
    assert.match(targets[0]!.command, /bun --expose-gc --preload/u);
    assert.equal(
      targets[0]!.correctness.command,
      'bun test benchmarks/editor/benchmarks/plite-clipboard-large-payload-benchmark.test.ts'
    );
    assert.equal(
      targets[0]!.metrics.primary,
      'plite_clipboard_worst_issue_p95_ms'
    );
    assert.equal(targets[0]!.metrics.printsMetric, true);
    assert.equal(targets[0]!.metrics.unit, 'ms');
    assert.deepEqual(targets[0]!.artifacts, [
      {
        path: 'tmp/slate-clipboard-large-payload-benchmark.json',
        required: true,
      },
    ]);
    assert.match(source, /editor\.update\.slice\.replace\(slice\)/u);
    assert.match(source, /editor\.read\.slice\.fit\(slice\)/u);
    assert.match(source, /new Set\(snapshot\.children\)/u);
    assert.match(source, /currentBlocks\.has\(node\)/u);
    assert.match(source, /METRIC \$\{name\}=\$\{value\}/u);
    assert.match(source, /CLIPBOARD_AUTHORITY_ARTIFACT_PATH/u);
    assert.match(source, /assertAuthorityConfiguration/u);
    assert.match(source, /isClipboardAuthorityArtifactPath\(outputPath\)/u);
    assert.match(source, /hugeCutBlocks !== 50_000/u);
    assert.match(source, /hugeCutIterations !== 3/u);
    assert.match(source, /issueTargetStressLines !== 10_000/u);
    assert.match(source, /!issueTargetsEnabled/u);
    assert.match(source, /hasClipboardBenchmarkFailures/u);
    assert.match(source, /plite_clipboard_plain_text_paste_10000_p50_ms/u);
    assert.match(
      source,
      /plite_clipboard_populated_full_selection_copy_10000_p50_ms/u
    );
    assert.match(
      source,
      /plite_clipboard_populated_plain_text_paste_10000_p50_ms/u
    );
  });
});

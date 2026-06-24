#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../..');
const autoresearchScript = path.resolve(
  root,
  '../codex-autoresearch/plugins/codex-autoresearch/scripts/autoresearch.mjs'
);
const slateV2Cwd = root;
const slateV2Tmp = path.join(root, '.tmp');
const focusedFailureLinePattern =
  /expected .*Received|failed|selector-runtime-node|shifted rerender/i;
const reactHugeCompareArtifactPattern =
  /^slate-react-huge-document-legacy-compare-benchmark-.*\.json$/;

const [command, ...rawArgs] = process.argv.slice(2);

if (!command) {
  console.error(
    'Usage: node tooling/scripts/slate-research.mjs <command> [...args]'
  );
  process.exit(1);
}

const args = rawArgs[0] === '--' ? rawArgs.slice(1) : rawArgs;

function readJsonIfExists(filePath) {
  if (!existsSync(filePath)) return null;

  try {
    return JSON.parse(readFileSync(filePath, 'utf8'));
  } catch (error) {
    return {
      __readError: error instanceof Error ? error.message : String(error),
    };
  }
}

function round(value, digits = 2) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;

  return Number(value.toFixed(digits));
}

function ratio(current, legacy) {
  if (
    typeof current !== 'number' ||
    typeof legacy !== 'number' ||
    legacy === 0
  ) {
    return null;
  }

  return current / legacy;
}

function artifactInfo(fileName) {
  const filePath = path.join(slateV2Tmp, fileName);
  if (!existsSync(filePath)) {
    return {
      exists: false,
      file: path.relative(root, filePath),
    };
  }

  return {
    exists: true,
    file: path.relative(root, filePath),
    mtime: statSync(filePath).mtime.toISOString(),
  };
}

function latestArtifact(pattern) {
  if (!existsSync(slateV2Tmp)) return null;

  const matches = readdirSync(slateV2Tmp)
    .filter((fileName) => pattern.test(fileName))
    .map((fileName) => {
      const filePath = path.join(slateV2Tmp, fileName);
      return {
        fileName,
        filePath,
        mtimeMs: statSync(filePath).mtimeMs,
      };
    })
    .sort((left, right) => right.mtimeMs - left.mtimeMs);

  return matches[0] ?? null;
}

function compareRows(artifact, target) {
  if (!artifact?.current || !artifact?.legacy || !artifact?.deltaMeanMs) {
    return [];
  }

  return Object.keys(artifact.deltaMeanMs)
    .map((metric) => {
      const current = artifact.current[metric]?.mean;
      const legacy = artifact.legacy[metric]?.mean;
      const metricRatio = ratio(current, legacy);

      return {
        current: round(current),
        delta: round(current - legacy),
        legacy: round(legacy),
        metric,
        ratio: round(metricRatio),
        target,
      };
    })
    .filter((row) => row.current !== null && row.legacy !== null);
}

function topByRatio(rows, limit = 5) {
  return [...rows]
    .filter((row) => typeof row.ratio === 'number' && row.ratio > 1)
    .sort((left, right) => right.ratio - left.ratio)
    .slice(0, limit);
}

function summarizeRichTextStructural() {
  const fileName = 'slate-rich-text-operations-compare-benchmark.json';
  const artifact = readJsonIfExists(path.join(slateV2Tmp, fileName));
  const rows = topByRatio(
    compareRows(artifact, 'core-rich-text-operations'),
    6
  );

  if (rows.length === 0) return null;

  const worst = rows[0];

  return {
    id: 'rich-text-structural-ops',
    priority: worst.ratio >= 100 ? 'P0' : 'P1',
    primaryMetric: 'rich_text_structural_ops_worst_ratio',
    direction: 'lower',
    baseline: `${worst.metric} ${worst.ratio}x legacy (${worst.current}ms vs ${worst.legacy}ms)`,
    benchmarkCommand:
      'pnpm bench:targets:run -- core-rich-text-operations-compare',
    correctnessCommand:
      'pnpm --filter @platejs/plite-react exec vitest run --config ./vitest.config.mjs test/provider-hooks-contract.test.tsx test/surface-contract.test.tsx',
    metricWork:
      'Add METRIC rich_text_structural_ops_worst_ratio=<number> to the rich-text compare benchmark or a thin artifact reader before running packets.',
    reason:
      'Structural editor operations are the largest current perf regression against legacy Plite.',
    stopRule:
      'Stop at <=10x legacy, then reopen only for <=3x; stop after 2 packets with <5% improvement.',
    discardRule:
      'Discard any packet that regresses native selection/input, path refs, history, or increases the worst ratio.',
    evidence: rows,
    artifacts: [artifactInfo(fileName)],
  };
}

function summarizeHistory() {
  const fileName = 'slate-history-compare-benchmark.json';
  const artifact = readJsonIfExists(path.join(slateV2Tmp, fileName));
  const rows = topByRatio(compareRows(artifact, 'history'), 4);

  if (rows.length === 0) return null;

  const worst = rows[0];

  return {
    id: 'history-fragment-ops',
    priority: worst.ratio >= 5 ? 'P1' : 'P2',
    primaryMetric: 'history_fragment_ops_worst_ratio',
    direction: 'lower',
    baseline: `${worst.metric} ${worst.ratio}x legacy (${worst.current}ms vs ${worst.legacy}ms)`,
    benchmarkCommand: 'pnpm bench:targets:run -- history-compare',
    correctnessCommand: 'pnpm --filter @platejs/plite-history test',
    metricWork:
      'Add METRIC history_fragment_ops_worst_ratio=<number> to the history compare benchmark or a thin artifact reader.',
    reason:
      'History fragment undo/redo is meaningfully slower than legacy and has a contained package boundary.',
    stopRule: 'Stop at <=2x legacy; stop after 2 packets with <5% improvement.',
    discardRule:
      'Discard any packet that changes undo/redo grouping semantics or corrupts selection restoration.',
    evidence: rows,
    artifacts: [artifactInfo(fileName)],
  };
}

function summarizeObservation() {
  const fileName = 'slate-core-observation-benchmark.json';
  const artifact = readJsonIfExists(path.join(slateV2Tmp, fileName));
  const rows = topByRatio(compareRows(artifact, 'core-observation'), 4);

  if (rows.length === 0) return null;

  const worst = rows[0];

  return {
    id: 'core-observation-reads',
    priority: worst.ratio >= 3 ? 'P2' : 'P3',
    primaryMetric: 'core_observation_reads_worst_ratio',
    direction: 'lower',
    baseline: `${worst.metric} ${worst.ratio}x legacy (${worst.current}ms vs ${worst.legacy}ms)`,
    benchmarkCommand: 'pnpm bench:targets:run -- core-observation-compare',
    correctnessCommand: 'pnpm --filter @platejs/plite test',
    metricWork:
      'Add METRIC core_observation_reads_worst_ratio=<number> to the observation compare benchmark or a thin artifact reader.',
    reason:
      'Read-observation overhead is smaller than structural ops but likely contributes to typing fanout.',
    stopRule:
      'Stop at <=1.5x legacy; stop after 2 packets with <5% improvement.',
    discardRule:
      'Discard any packet that weakens observer/ref correctness or stale path handling.',
    evidence: rows,
    artifacts: [artifactInfo(fileName)],
  };
}

function summarizePagination() {
  const fileName = 'slate-pagination-virtualized-char-burst-benchmark.json';
  const artifact = readJsonIfExists(path.join(slateV2Tmp, fileName));
  const metrics = artifact?.metrics;

  if (!metrics) return null;

  const value = metrics.pagination_virtualized_vs_table_ratio;
  if (typeof value !== 'number' || value <= 1.25) return null;

  return {
    id: 'pagination-virtualized-typing',
    priority: value >= 2 ? 'P1' : 'P2',
    primaryMetric: 'pagination_virtualized_vs_table_ratio',
    direction: 'lower',
    baseline: `${round(value)}x staged table (${round(metrics.pagination_virtualized_burst_ms)}ms virtualized burst vs ${round(metrics.pagination_staged_table_burst_ms)}ms staged table burst)`,
    benchmarkCommand:
      'pnpm bench:targets:run -- react-pagination-virtualized-char-burst',
    correctnessCommand:
      'pnpm --filter www exec playwright test --config playwright.slate.config.ts tests/plite-browser/donor/examples/pagination.test.ts --project=chromium -g "keeps rows=800 virtualized pagination in the staged-class perf envelope|keeps fast staged text after insert breaks at the model caret|selects projected pagination words on native double click|places virtualized pagination selection at wrapped line ends"',
    metricWork: 'Already emits METRIC pagination_virtualized_vs_table_ratio.',
    reason:
      'Virtualized pagination is correct but still slower than the staged table cohort.',
    stopRule:
      'Stop at <=1.25x staged table, stretch <=1.0x; stop after 2 packets with <5% improvement.',
    discardRule:
      'Discard any packet with dropped/reordered chars, selection regression, DOM >600, or page surfaces >8.',
    evidence: [
      {
        metric: 'pagination_virtualized_vs_table_ratio',
        value: round(value),
      },
      {
        metric: 'pagination_virtualized_p95_typing_ms',
        value: round(metrics.pagination_virtualized_p95_typing_ms),
      },
      {
        metric: 'pagination_virtualized_scroll_ms',
        value: round(metrics.pagination_virtualized_scroll_ms),
      },
    ],
    artifacts: [artifactInfo(fileName)],
  };
}

function summarizeReactHugeDoc() {
  const browserFile =
    'slate-react-huge-document-browser-trace-benchmark-surfaces-defaultAuto-stagedDomPresent-blocks-5000-iters-3-ops-10.json';
  const legacyFile =
    'slate-react-huge-document-plite-browser-trace-benchmark-surfaces-legacyChunkOn-blocks-5000-iters-3-ops-10.json';
  const browser = readJsonIfExists(path.join(slateV2Tmp, browserFile));
  const legacy = readJsonIfExists(path.join(slateV2Tmp, legacyFile));
  const rows = [];

  for (const [surfaceName, surface] of Object.entries(
    browser?.surfaces ?? {}
  )) {
    for (const blockName of ['startBlock', 'middleBlock']) {
      const p95 = surface?.lanes?.[blockName]?.typeToPaintMs?.p95;
      if (typeof p95 === 'number') {
        rows.push({
          metric: `${surfaceName}.${blockName}.typeToPaintP95Ms`,
          value: round(p95),
        });
      }
    }
  }

  const legacyRows = [];
  for (const [surfaceName, surface] of Object.entries(legacy?.surfaces ?? {})) {
    for (const blockName of ['startBlock', 'middleBlock']) {
      const p95 = surface?.lanes?.[blockName]?.typeToPaintMs?.p95;
      if (typeof p95 === 'number') {
        legacyRows.push({
          metric: `${surfaceName}.${blockName}.typeToPaintP95Ms`,
          value: round(p95),
        });
      }
    }
  }

  const worst = [...rows].sort((left, right) => right.value - left.value)[0];
  if (!worst || worst.value <= 75) return null;

  return {
    id: 'react-huge-doc-type-to-paint',
    priority: worst.value >= 100 ? 'P2' : 'P3',
    primaryMetric: 'react_huge_doc_type_to_paint_p95_ms',
    direction: 'lower',
    baseline: `${worst.metric} ${worst.value}ms p95`,
    benchmarkCommand:
      'pnpm bench:targets:run -- react-huge-document-browser-trace',
    correctnessCommand:
      'pnpm slate:packages:typecheck && pnpm slate:packages:test && pnpm --filter www test:plite-browser',
    metricWork:
      'Add METRIC react_huge_doc_type_to_paint_p95_ms=<number> to the browser trace benchmark or a thin artifact reader.',
    reason:
      'v2 already beats legacy browser paint hard, but p95 still sits above a 75ms interactive target.',
    stopRule:
      'Stop at <75ms p95, stretch <50ms; stop after 2 packets with <5% improvement.',
    discardRule:
      'Discard any packet that hides DOM incorrectly, regresses native selection, or increases mounted DOM/page counts.',
    evidence: [...rows, ...legacyRows],
    artifacts: [artifactInfo(browserFile), artifactInfo(legacyFile)],
  };
}

function summarizeRuntimeFanout(withChecks) {
  const result = withChecks
    ? spawnSync(
        'pnpm',
        [
          'exec',
          'vitest',
          'run',
          '--config',
          './vitest.config.mjs',
          'test/provider-hooks-contract.test.tsx',
          'test/surface-contract.test.tsx',
        ],
        {
          cwd: path.join(root, 'packages/plite-react'),
          encoding: 'utf8',
          maxBuffer: 16 * 1024 * 1024,
          stdio: 'pipe',
        }
      )
    : null;
  const output = result ? `${result.stdout}\n${result.stderr}` : '';
  const failed = result ? result.status !== 0 : null;
  const failureLines = output
    .split('\n')
    .filter((line) => focusedFailureLinePattern.test(line))
    .slice(0, 8);

  return {
    id: 'runtime-node-fanout',
    priority: failed ? 'P0' : 'P1',
    primaryMetric: 'slate_react_runtime_node_fanout_count',
    direction: 'lower',
    baseline:
      failed === null
        ? 'not probed; run with --with-checks for live focused vitest state'
        : failed
          ? 'focused slate-react contracts fail'
          : 'focused slate-react contracts currently pass',
    benchmarkCommand:
      'add a small METRIC benchmark around root insert/reorder/replace runtime-node selector checks',
    correctnessCommand:
      'pnpm --filter @platejs/plite-react exec vitest run --config ./vitest.config.mjs test/provider-hooks-contract.test.tsx test/surface-contract.test.tsx',
    metricWork:
      'Promote selector-runtime-node-check counts from the contract tests/profiler into METRIC slate_react_runtime_node_fanout_count=<number>.',
    reason:
      'Runtime-node fanout is the likely common cause behind slow root structural edits and shifted rerenders.',
    stopRule:
      'Stop when local root-order edits are 0 fanout and full replacement is <=1, or after 2 packets with no check improvement.',
    discardRule:
      'Discard any packet that fixes counters by skipping subscribers, stale-path updates, or selected-element correctness.',
    evidence: failureLines,
    artifacts: [],
  };
}

function priorityRank(priority) {
  return (
    {
      P0: 0,
      P1: 1,
      P2: 2,
      P3: 3,
    }[priority] ?? 9
  );
}

function renderLoopMarkdown(payload) {
  const lines = [
    '# Plite Research Loop Suggestions',
    '',
    `Generated: ${payload.generatedAt}`,
    `Source: ${payload.source}`,
    '',
  ];

  for (const [index, loop] of payload.loops.entries()) {
    lines.push(
      `## ${index + 1}. ${loop.priority} ${loop.id}`,
      '',
      `- Primary: \`${loop.primaryMetric}\` (${loop.direction})`,
      `- Baseline: ${loop.baseline}`,
      `- Why: ${loop.reason}`,
      `- Benchmark: \`${loop.benchmarkCommand}\``,
      `- Correctness: \`${loop.correctnessCommand}\``,
      `- Metric setup: ${loop.metricWork}`,
      `- Stop: ${loop.stopRule}`,
      `- Discard: ${loop.discardRule}`
    );

    if (loop.evidence?.length > 0) {
      lines.push(
        `- Evidence: \`${JSON.stringify(loop.evidence.slice(0, 6))}\``
      );
    }
    if (loop.artifacts?.length > 0) {
      lines.push(
        `- Artifacts: ${loop.artifacts
          .map((artifact) =>
            artifact.exists
              ? `${artifact.file} (${artifact.mtime})`
              : `${artifact.file} missing`
          )
          .join(', ')}`
      );
    }
    lines.push('');
  }

  lines.push(
    'Next move: pick one loop only, add or verify its METRIC output, then invoke the matching slate-ar skill or run Codex Autoresearch `setup-plan --cwd . --name "<loop-id>" --metric-name "<metric>"`.'
  );

  return `${lines.join('\n')}\n`;
}

function runSuggestLoops(args) {
  const json = args.includes('--json');
  const withChecks = args.includes('--with-checks');
  const limitIndex = args.indexOf('--limit');
  const limit =
    limitIndex >= 0 && args[limitIndex + 1]
      ? Number(args[limitIndex + 1])
      : Number.POSITIVE_INFINITY;
  const latestReactCompare = latestArtifact(reactHugeCompareArtifactPattern);
  const loops = [
    summarizeRuntimeFanout(withChecks),
    summarizeRichTextStructural(),
    summarizePagination(),
    summarizeHistory(),
    summarizeReactHugeDoc(),
    summarizeObservation(),
  ]
    .filter(Boolean)
    .sort(
      (left, right) =>
        priorityRank(left.priority) - priorityRank(right.priority)
    )
    .slice(0, Number.isFinite(limit) ? limit : undefined);
  const payload = {
    generatedAt: new Date().toISOString(),
    source: 'current Plate repo Plite v2 state plus latest benchmark artifacts',
    withChecks,
    latestReactCompareArtifact: latestReactCompare
      ? path.relative(root, latestReactCompare.filePath)
      : null,
    loops,
  };

  if (json) {
    console.log(JSON.stringify(payload, null, 2));
  } else {
    process.stdout.write(renderLoopMarkdown(payload));
  }
}

if (command === 'suggest-loops' || command === 'recommend-loops') {
  runSuggestLoops(args);
  process.exit(0);
}

const compactFinalizePreview =
  command === 'finalize-preview' && !args.includes('--full');
const forwardedArgs = compactFinalizePreview
  ? args.filter((arg) => arg !== '--full')
  : args;
const hasCwd = forwardedArgs.some(
  (arg) => arg === '--cwd' || arg.startsWith('--cwd=')
);
const cwdArgs = hasCwd ? [] : ['--cwd', slateV2Cwd];

if (compactFinalizePreview) {
  const result = spawnSync(
    process.execPath,
    [autoresearchScript, command, ...cwdArgs, ...forwardedArgs],
    {
      cwd: root,
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
      stdio: 'pipe',
    }
  );

  if (result.stderr) process.stderr.write(result.stderr);

  try {
    const payload = JSON.parse(result.stdout);
    const warnings = payload.warnings ?? [];
    const compact = {
      ok: payload.ok,
      workDir: payload.workDir,
      branch: payload.branch,
      trunk: payload.trunk,
      ready: payload.ready,
      groups: payload.groups?.length ?? 0,
      missingCommitCount: payload.missingCommitCount ?? 0,
      excludedCommitCount: payload.excludedCommits?.length ?? 0,
      warningCount: warnings.length,
      warnings: warnings.slice(0, 8),
      nextAction: payload.nextAction,
      suggestedCommand: payload.suggestedCommand,
      progress: payload.progress
        ? {
            status: payload.progress.status,
            latestOutputTail: payload.progress.latestOutputTail,
          }
        : null,
      fullOutput:
        'Run `node tooling/scripts/slate-research.mjs finalize-preview --full` for raw JSON.',
    };
    console.log(JSON.stringify(compact, null, 2));
  } catch {
    process.stdout.write(result.stdout);
  }

  process.exit(result.status ?? 1);
}

const result = spawnSync(
  process.execPath,
  [autoresearchScript, command, ...cwdArgs, ...forwardedArgs],
  {
    cwd: root,
    stdio: 'inherit',
  }
);

process.exit(result.status ?? 1);

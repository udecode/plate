import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../../../', import.meta.url));
const summarizer = path.join(root, 'docs/research/probes/2026-09-28-conversion-boundary/lanes/s5/summarize-matrix.ts');
const scratch = mkdtempSync(path.join(os.tmpdir(), 'plate-performance-review-'));
const cases = [
  'valid-control',
  'different-text',
  'missing-text',
  'missing-final-clock',
  'different-work-clock',
];
const share = { gc: 0, other: 0, parse: 1000, program: 0, react: 0, transaction: 0 };

const stream = (arm, pair, variant) => {
  const candidate = arm === 'candidate';
  const missingFinal = candidate && variant === 'missing-final-clock';

  return {
    arm,
    finalTextSha256: variant === 'missing-text'
      ? null
      : candidate && variant === 'different-text' ? 'b'.repeat(64) : 'a'.repeat(64),
    page: {
      finalMs: missingFinal ? null : 10,
      latencyP95Ms: 10,
      previews: 10,
      survival: { ratio: 1 },
    },
    ...(variant === 'different-work-clock' && !candidate
      ? { profile: { aligned: true, final: share, publish: share, stream: share } }
      : {}),
    role: `pair-${pair}`,
    timedOut: false,
    trace: {
      ...(missingFinal ? {} : { finalWorkMs: 10 }),
      publishMs: candidate ? 500 : 1000,
      totalMs: candidate ? 500 : 1000,
    },
  };
};

try {
  const matrix = path.join(scratch, 'matrix');
  mkdirSync(matrix);

  for (const variant of cases) {
    writeFileSync(path.join(matrix, `${variant}.json`), JSON.stringify({
      cell: variant,
      status: 'complete',
      streams: [1, 2, 3].flatMap((pair) => [
        stream('baseline', pair, variant),
        stream('candidate', pair, variant),
      ]),
    }));
  }

  execFileSync(process.execPath, ['--experimental-strip-types', summarizer, matrix], {
    cwd: root,
    stdio: 'pipe',
  });

  const rows = JSON.parse(readFileSync(path.join(scratch, 'matrix-summary.json'), 'utf8'));
  assert.equal(rows.find((row) => row.cell === 'valid-control').verdict, 'pass');

  const { summarize } = await import(path.join(root, 'benchmarks/editor/benchmarks/external-text-measurement.mjs'));
  const sparse = summarize(Array(3));
  const samples = [1, 2, 3];
  const retained = summarize(samples);
  samples[2] = 100;

  const { readBenchmarkRegistry, createBenchmarkArtifactRows, createRichTextEditorCoverageRows } = await import(path.join(root, 'benchmarks/editor/src/index.mjs'));
  const { buildTargetHistory, renderMarkdownReport } = await import(path.join(root, 'tooling/scripts/bench-targets.mjs'));
  const lab = path.join(root, 'benchmarks/editor');
  const registry = readBenchmarkRegistry({ rootDir: lab });
  const artifactAdmission = ['core-node-transforms', 'collab-readiness'].map((id) => {
    const spec = registry.artifacts.find((artifact) => artifact.id === id);
    const artifactPath = path.resolve(lab, spec.path);
    const artifact = JSON.parse(readFileSync(artifactPath, 'utf8'));
    const inputs = artifact.sourceIdentity?.measuredInputs ?? artifact.sourceBefore;
    const mismatches = Object.entries(inputs).filter(([file, hash]) => {
      const inputPath = path.resolve(root, file);

      return !existsSync(inputPath) || createHash('sha256').update(readFileSync(inputPath)).digest('hex') !== hash;
    });
    const admitted = createBenchmarkArtifactRows(spec, { rootDir: lab });

    return {
      id,
      artifactSha256: createHash('sha256').update(readFileSync(artifactPath)).digest('hex'),
      recordedInputs: Object.keys(inputs).length,
      mismatchedInputs: mismatches.length,
      rows: admitted.length,
      okRows: admitted.filter((row) => row.status === 'ok').length,
    };
  });

  const thresholdPath = path.join(scratch, 'cached-threshold.json');
  writeFileSync(thresholdPath, JSON.stringify({
    issueTargetThresholds: { probe: { passed: true, actualMs: 100, limitMs: 1 } },
  }));
  const cachedThreshold = createBenchmarkArtifactRows({
    id: 'cached-threshold', category: 'probe', kind: 'current', path: thresholdPath,
  }, { rootDir: lab }).map((row) => ({ status: row.status, actualMs: row.medianUs / 1000, limitMs: 1 }));
  const unsupportedCoverage = createRichTextEditorCoverageRows({
    rootDir: lab,
    registry: {
      artifacts: [], runtimeAdapters: [],
      workloads: [{ id: 'zero-artifacts', workload: 'probe', artifactIds: ['absent'], slateV2: true, legacy: true }],
    },
  }).filter((row) => row.category.endsWith('workload-coverage'))
    .map((row) => ({ library: row.library, status: row.status }));

  const read = (file) => JSON.parse(readFileSync(path.join(root, file), 'utf8'));
  const targets = read('benchmarks/targets/slate-v2.json');
  const previous = read('benchmarks/targets/history/slate-v2-latest.json');
  const currentHistory = buildTargetHistory(targets, [previous]);
  const shared = registry.artifacts.filter((artifact) => targets.targets.some((target) => target.id === artifact.id));
  const target = {
    ...targets.targets[0], command: 'changed-command',
    artifacts: [{ path: path.join(scratch, 'nonexistent.json'), required: true }],
  };
  const inherited = buildTargetHistory({ ...targets, targets: [target] }, [{
    targets: [{ id: target.id, command: 'old-command', artifacts: [{ path: target.artifacts[0].path, recorded: true }] }],
  }]);

  const result = {
    mode: 'synthetic receipt validation; no workload or browser measurement',
    summarizerSha256: createHash('sha256').update(readFileSync(summarizer)).digest('hex'),
    receiptCases: rows.map((row) => ({
      case: row.cell,
      verdict: row.verdict,
      checks: row.checks,
      finalTextsMatch: row.finalTextsMatch,
      finalMs: row.finalMs,
    })),
    externalHelper: {
      sparseSampleCount: sparse.sampleCount,
      sparseP95Finite: Number.isFinite(sparse.p95),
      retainedMax: retained.max,
      samplesAfterCallerMutation: retained.samples,
      currentCallerExercisingTheseInputs: 'not located',
    },
    artifactAdmission,
    cachedThreshold,
    unsupportedCoverage,
    registryAndHistory: {
      targets: targets.targets.length,
      artifactDefinitions: registry.artifacts.length,
      sharedIds: shared.length,
      lexicallyDifferentSharedCommands: shared.filter((artifact) => targets.targets.find((item) => item.id === artifact.id).command !== artifact.command).length,
      lexicalDifferenceProvesSemanticDrift: false,
      savedHistoryTargets: previous.targets.length,
      historyMatches: `${JSON.stringify(currentHistory, null, 2)}\n` === readFileSync(path.join(root, 'benchmarks/targets/history/slate-v2-latest.json'), 'utf8'),
      reportMatches: renderMarkdownReport(currentHistory) === readFileSync(path.join(root, 'benchmarks/targets/reports/slate-v2.md'), 'utf8'),
      inheritedReceipt: {
        artifactExists: existsSync(target.artifacts[0].path),
        displayedCommand: inherited.targets[0].command,
        status: inherited.targets[0].status,
      },
    },
  };
  const output = `${JSON.stringify(result, null, 2)}\n`;

  if (process.argv.includes('--write')) {
    writeFileSync(new URL('RESULTS.json', import.meta.url), output);
  }

  process.stdout.write(output);
} finally {
  rmSync(scratch, { force: true, recursive: true });
}

#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { runBoundedProcess } from './run-bounded-process.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../..');
const registryPath = path.join(root, 'benchmarks/targets/slate-v2.json');
const historyPath = path.join(
  root,
  'benchmarks/targets/history/slate-v2-latest.json'
);
const historyRepoPath = path
  .relative(root, historyPath)
  .replaceAll(path.sep, '/');
const reportPath = path.join(root, 'benchmarks/targets/reports/slate-v2.md');
const receiptDirectory = 'tmp/bench-targets/receipts';
const evidenceKinds = Object.freeze([
  'browser-trace',
  'compare',
  'current',
  'rows',
  'slate-legacy-compare',
]);
const staleReasons = Object.freeze([
  'contract-changed',
  'input-changed',
  'latest-run-failed',
]);
const leadingAssignments = /^(?:\s*[A-Za-z_]\w*=\S*)+/u;

const hasLaterAssignment = (command) =>
  /(?:^|[\s;&|(])(?:env\s+)?[A-Za-z_]\w*=/u.test(
    command
      .slice(command.match(leadingAssignments)?.[0].length ?? 0)
      .replaceAll(/'[^']*'|"[^"]*"/gu, '')
  );

const autoresearchScriptCandidates = [
  process.env.CODEX_AUTORESEARCH_SCRIPT,
  path.resolve(
    root,
    '../codex-autoresearch/plugins/codex-autoresearch/scripts/autoresearch.mjs'
  ),
].filter(Boolean);
const defaultTargetTimeouts = Object.freeze({
  benchmarkMs: 30 * 60_000,
  correctnessMs: 10 * 60_000,
});

const usage = `Usage:
  node tooling/scripts/bench-targets.mjs list
  node tooling/scripts/bench-targets.mjs check
  node tooling/scripts/bench-targets.mjs dry-run [target-id]
  node tooling/scripts/bench-targets.mjs report [--check|--dry-run]
  node tooling/scripts/bench-targets.mjs run <target-id>
  node tooling/scripts/bench-targets.mjs autoresearch-setup-plan <target-id>
  node tooling/scripts/bench-targets.mjs autoresearch-init <target-id>
`;

function fail(message, status = 1) {
  console.error(message);
  process.exit(status);
}

function resolveAutoresearchScript({ required = true } = {}) {
  const script = autoresearchScriptCandidates.find((candidate) =>
    fs.existsSync(candidate)
  );

  if (script) return script;
  if (!required) return null;

  fail(
    'Missing Codex Autoresearch script. Set CODEX_AUTORESEARCH_SCRIPT or clone codex-autoresearch next to this repo.'
  );

  return undefined;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

function readJsonIfExists(file) {
  if (!fs.existsSync(file)) return null;
  return readJson(file);
}

function readHeadJson(repoPath) {
  const result = spawnSync('git', ['show', `HEAD:${repoPath}`], {
    cwd: root,
    encoding: 'utf-8',
    stdio: 'pipe',
  });

  if (result.status !== 0 || result.stdout.trim().length === 0) return null;

  return JSON.parse(result.stdout);
}

function readTargetRegistry(repoRoot = root) {
  return readJson(path.join(repoRoot, path.relative(root, registryPath)));
}

function loadRegistry() {
  if (!fs.existsSync(registryPath)) {
    fail(
      `Missing ${path.relative(root, registryPath)}; restore the tracked registry.`
    );
  }
  return readTargetRegistry();
}

function sortedTargets(registry) {
  return [...registry.targets].sort((a, b) => a.id.localeCompare(b.id));
}

function getTarget(id) {
  if (!id) fail(usage);
  const registry = loadRegistry();
  const target = registry.targets.find((entry) => entry.id === id);
  if (!target) fail(`Unknown benchmark target: ${id}`);
  return resolveTarget(registry, target);
}

function resolveTarget(registry, target) {
  return {
    ...target,
    timeouts: resolveTargetTimeouts(target, registry.policy?.timeouts),
  };
}

function resolveTargetTimeouts(target, policyTimeouts = defaultTargetTimeouts) {
  return {
    benchmarkMs:
      target.timeouts?.benchmarkMs ??
      policyTimeouts?.benchmarkMs ??
      defaultTargetTimeouts.benchmarkMs,
    correctnessMs:
      target.timeouts?.correctnessMs ??
      policyTimeouts?.correctnessMs ??
      defaultTargetTimeouts.correctnessMs,
  };
}

function validateTimeouts(value, prefix, errors, { required = false } = {}) {
  if (value === undefined && !required) return;
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    errors.push(`${prefix} must be an object`);
    return;
  }

  for (const field of ['correctnessMs', 'benchmarkMs']) {
    if (value[field] === undefined && !required) continue;
    if (!Number.isInteger(value[field]) || value[field] <= 0) {
      errors.push(`${prefix}.${field} must be a positive integer`);
    }
  }
}

function outsideRepo(value) {
  return (
    path.isAbsolute(value) || path.normalize(value).split(path.sep)[0] === '..'
  );
}

function validateEvidence(evidence, prefix, errors) {
  if (!evidence || typeof evidence !== 'object' || Array.isArray(evidence)) {
    errors.push(`${prefix}: artifact evidence must be an object`);
    return;
  }
  if (!evidenceKinds.includes(evidence.kind)) {
    errors.push(
      `${prefix}: artifact evidence.kind must be one of ${evidenceKinds.join(', ')}`
    );
  }
  if (typeof evidence.category !== 'string' || evidence.category === '') {
    errors.push(`${prefix}: artifact evidence.category must be a string`);
  }
  if (evidence.library !== undefined && typeof evidence.library !== 'string') {
    errors.push(`${prefix}: artifact evidence.library must be a string`);
  }
  if (
    evidence.surfaceLibraries !== undefined &&
    (!evidence.surfaceLibraries ||
      typeof evidence.surfaceLibraries !== 'object' ||
      Object.values(evidence.surfaceLibraries).some(
        (library) => typeof library !== 'string'
      ))
  ) {
    errors.push(
      `${prefix}: artifact evidence.surfaceLibraries must map surfaces to libraries`
    );
  }
}

function validateRegistry(registry) {
  const errors = [];
  const seen = new Set();

  if (registry.version !== 1) errors.push('version must be 1');
  if (!Array.isArray(registry.targets) || registry.targets.length === 0) {
    errors.push('targets must be a non-empty array');
  }
  validateTimeouts(registry.policy?.timeouts, 'policy.timeouts', errors, {
    required: true,
  });

  for (const target of registry.targets ?? []) {
    const prefix = target.id || '<missing id>';

    for (const field of [
      'id',
      'question',
      'owner',
      'family',
      'cwd',
      'command',
    ]) {
      if (!target[field]) errors.push(`${prefix}: missing ${field}`);
    }
    if (seen.has(target.id)) errors.push(`${prefix}: duplicate id`);
    seen.add(target.id);

    if (outsideRepo(target.cwd ?? '')) {
      errors.push(`${prefix}: cwd must stay inside the repo`);
    }
    if (!target.metrics?.primary) {
      errors.push(`${prefix}: missing metrics.primary`);
    }
    if (!['lower', 'higher'].includes(target.metrics?.direction)) {
      errors.push(`${prefix}: metrics.direction must be lower or higher`);
    }
    if (typeof target.metrics?.printsMetric !== 'boolean') {
      errors.push(`${prefix}: metrics.printsMetric must be boolean`);
    }
    if (!target.correctness?.command) {
      errors.push(`${prefix}: missing correctness.command`);
    }
    for (const [label, command] of [
      ['command', target.command],
      ['correctness.command', target.correctness?.command],
    ]) {
      if (typeof command === 'string' && hasLaterAssignment(command)) {
        errors.push(
          `${prefix}: ${label} must set variables only before its first word`
        );
      }
    }
    if (!Array.isArray(target.artifacts) || target.artifacts.length === 0) {
      errors.push(`${prefix}: missing artifacts`);
    }
    validateTimeouts(target.timeouts, `${prefix}: timeouts`, errors);
    for (const artifact of target.artifacts ?? []) {
      if (!artifact.path) errors.push(`${prefix}: artifact missing path`);
      if (outsideRepo(artifact.path ?? '')) {
        errors.push(`${prefix}: artifact path must stay inside the repo`);
      }
      if (artifact.evidence !== undefined) {
        validateEvidence(artifact.evidence, prefix, errors);
      }
    }
    if (
      (target.artifacts ?? []).filter(
        (artifact) => artifact.evidence !== undefined
      ).length > 1
    ) {
      errors.push(`${prefix}: only one artifact may declare evidence`);
    }
  }

  return errors;
}

function listTargets() {
  for (const target of sortedTargets(loadRegistry())) {
    console.log(
      `${target.id}\t${target.family}\t${target.metrics.primary}\t${target.command}`
    );
  }
}

function checkTargets() {
  const registry = loadRegistry();
  const errors = validateRegistry(registry);
  if (errors.length > 0) {
    for (const error of errors) console.error(`ERROR ${error}`);
    process.exit(1);
  }
  console.log(`benchmark-targets ok: ${registry.targets.length} targets`);
}

function artifactKey(targetId, artifactPath) {
  return `${targetId}\0${artifactPath}`;
}

function previousRecordedArtifacts(histories) {
  const existing = new Set();

  for (const history of histories) {
    for (const target of history?.targets ?? []) {
      for (const artifact of target.artifacts ?? []) {
        if (artifact.recorded === true || artifact.exists === true) {
          existing.add(artifactKey(target.id, artifact.path));
        }
      }
    }
  }

  return existing;
}

function previousLatestRuns(histories) {
  const runs = new Map();

  for (const history of histories) {
    for (const target of history?.targets ?? []) {
      if (target.latestRun && !runs.has(target.id)) {
        runs.set(target.id, target.latestRun);
      }
    }
  }

  return runs;
}

function loadTargetHistoryInputs() {
  return [readJsonIfExists(historyPath), readHeadJson(historyRepoPath)].filter(
    Boolean
  );
}

function artifactState(targetId, artifact, previousRecorded) {
  const absolutePath = path.resolve(root, artifact.path);
  const recorded =
    fs.existsSync(absolutePath) ||
    previousRecorded.has(artifactKey(targetId, artifact.path));

  return {
    path: artifact.path,
    required: artifact.required !== false,
    recorded,
  };
}

function buildTargetHistory(
  registry,
  histories = loadTargetHistoryInputs(),
  { repoRoot = root } = {}
) {
  const previousRecorded = previousRecordedArtifacts(histories);
  const previousRuns = previousLatestRuns(histories);
  const targets = sortedTargets(registry).map((target) => {
    const artifacts = target.artifacts.map((artifact) =>
      artifactState(target.id, artifact, previousRecorded)
    );
    const missingArtifacts = artifacts.filter(
      (artifact) => artifact.required && !artifact.recorded
    );
    const missingOptionalArtifacts = artifacts.filter(
      (artifact) => !artifact.required && !artifact.recorded
    );
    const receipt = readReceipt(repoRoot, target.id);
    const latestRun = receipt
      ? {
          status: receipt.result.status,
          ...(receipt.result.stage && { stage: receipt.result.stage }),
          startedAt: receipt.startedAt,
          contractSha256: contractSha256(receipt.contract),
        }
      : (previousRuns.get(target.id) ?? null);

    return {
      id: target.id,
      family: target.family,
      kind: target.kind,
      owner: target.owner,
      question: target.question,
      command: target.command,
      cwd: target.cwd,
      metric: target.metrics.primary,
      direction: target.metrics.direction,
      printsMetric: target.metrics.printsMetric,
      correctnessCommand: target.correctness.command,
      artifacts,
      status:
        missingArtifacts.length > 0
          ? 'missing-required-artifact'
          : missingOptionalArtifacts.length > 0
            ? 'missing-optional-artifact'
            : 'recorded',
      migration: target.migration ?? null,
      latestRun,
      recipe:
        latestRun &&
        (latestRun.contractSha256 ===
        contractSha256(executionContract(resolveTarget(registry, target)))
          ? 'current'
          : 'changed'),
    };
  });
  const statusCounts = countBy(targets, (target) => target.status);
  const latestRunCounts = countBy(
    targets,
    (target) => target.latestRun?.status ?? 'none'
  );
  const artifactCounts = countArtifacts(targets);

  return {
    version: 3,
    registryPath: path.relative(root, registryPath),
    policy: registry.policy,
    counts: {
      targets: targets.length,
      ...artifactCounts,
      statusCounts,
      latestRunCounts,
    },
    targets,
  };
}

function countArtifacts(targets) {
  let artifacts = 0;
  let recordedArtifacts = 0;
  let missingOptionalArtifacts = 0;
  let missingRequiredArtifacts = 0;
  let requiredArtifacts = 0;

  for (const target of targets) {
    for (const artifact of target.artifacts) {
      artifacts += 1;
      if (artifact.required) requiredArtifacts += 1;
      if (artifact.recorded) recordedArtifacts += 1;
      if (!artifact.required && !artifact.recorded) {
        missingOptionalArtifacts += 1;
      }
      if (artifact.required && !artifact.recorded) {
        missingRequiredArtifacts += 1;
      }
    }
  }

  return {
    artifacts,
    recordedArtifacts,
    missingOptionalArtifacts,
    missingRequiredArtifacts,
    requiredArtifacts,
  };
}

function countBy(items, getKey) {
  const counts = {};

  for (const item of items) {
    const key = getKey(item);
    counts[key] = (counts[key] ?? 0) + 1;
  }

  return counts;
}

function renderMarkdownReport(history) {
  const rows = history.targets
    .map((target) => {
      const artifactSummary = `${target.artifacts.filter((artifact) => artifact.recorded).length}/${target.artifacts.length}`;
      const latestRun = target.latestRun
        ? `${target.latestRun.status}${target.latestRun.stage ? `:${target.latestRun.stage}` : ''} ${target.latestRun.startedAt.slice(0, 10)}`
        : 'none';
      return [
        target.id,
        target.family,
        target.metric,
        target.status,
        artifactSummary,
        latestRun,
        target.recipe ?? '-',
        target.printsMetric ? 'yes' : 'wrapped',
      ]
        .map(escapeMarkdownCell)
        .join(' | ');
    })
    .join('\n');

  return `# Plite v2 Benchmark Targets

This report is generated from \`${history.registryPath}\`.

Active benchmark decisions use target ids from this registry, then feed those targets into benchmark runners, Autoresearch, and report generation.

A recorded artifact was observed locally or retained in earlier history. This does not establish current availability, source freshness, or passing budgets.

The latest run comes from the target's receipt, written by \`bench:targets:run\` for every outcome, or from earlier history when no local receipt exists. Recipe \`current\` means that run used the recipe the registry declares now; \`changed\` means the recipe has changed since.

## Summary

- Targets: ${history.counts.targets}
- Required artifacts: ${history.counts.requiredArtifacts}
- Recorded artifacts: ${history.counts.recordedArtifacts}
- Missing optional artifacts: ${history.counts.missingOptionalArtifacts}
- Missing required artifacts: ${history.counts.missingRequiredArtifacts}
- Status counts: ${Object.entries(history.counts.statusCounts)
    .map(([status, count]) => `${status}=${count}`)
    .join(', ')}
- Latest runs: ${Object.entries(history.counts.latestRunCounts)
    .map(([status, count]) => `${status}=${count}`)
    .join(', ')}

## Targets

| Target | Family | Metric | Status | Artifacts | Latest run | Recipe | Metric output |
| --- | --- | --- | --- | --- | --- | --- | --- |
${rows
  .split('\n')
  .map((row) => `| ${row} |`)
  .join('\n')}
`;
}

function escapeMarkdownCell(value) {
  return String(value).replaceAll('|', '\\|');
}

function writeTargetReport({
  check = false,
  dryRun: innerDryRun = false,
} = {}) {
  const history = buildTargetHistory(loadRegistry());
  const json = `${JSON.stringify(history, null, 2)}\n`;
  const markdown = renderMarkdownReport(history);

  if (innerDryRun) {
    console.log(
      `target-report dry-run targets=${history.counts.targets} missingRequired=${history.counts.missingRequiredArtifacts}`
    );
    return;
  }

  if (check) {
    assertFileEquals(historyPath, json);
    assertFileEquals(reportPath, markdown);
    console.log(
      `checked ${path.relative(root, historyPath)} and ${path.relative(root, reportPath)}`
    );
    return;
  }

  fs.mkdirSync(path.dirname(historyPath), { recursive: true });
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(historyPath, json);
  fs.writeFileSync(reportPath, markdown);
  console.log(`wrote ${path.relative(root, historyPath)}`);
  console.log(`wrote ${path.relative(root, reportPath)}`);
}

function assertFileEquals(filePath, expected) {
  let current;

  try {
    current = fs.readFileSync(filePath, 'utf-8');
  } catch {
    throw new Error(`missing generated file: ${path.relative(root, filePath)}`);
  }
  if (current !== expected) {
    throw new Error(
      `generated file is stale: ${path.relative(root, filePath)}`
    );
  }
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
}

function artifactSnapshot(repoRoot, artifact) {
  const filePath = path.resolve(repoRoot, artifact.path);

  try {
    const stat = fs.statSync(filePath, { bigint: true, throwIfNoEntry: false });

    if (!stat) return { exists: false };
    if (!stat.isFile()) return { error: 'not a file', exists: false };
    return {
      digest: createHash('sha256')
        .update(fs.readFileSync(filePath))
        .digest('hex'),
      exists: true,
      mtimeNs: stat.mtimeNs,
      size: stat.size,
    };
  } catch (error) {
    return { error: error.message, exists: false };
  }
}

function recipeVariables(target) {
  const names = new Set();

  for (const command of [target.command, target.correctness.command]) {
    const assignments = command.match(leadingAssignments)?.[0] ?? '';

    for (const [, name] of assignments.matchAll(/([A-Za-z_]\w*)=/gu)) {
      names.add(name);
    }
  }
  return [...names].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
}

function executionContract(target) {
  return {
    cwd: target.cwd,
    command: target.command,
    correctness: target.correctness.command,
    unset: recipeVariables(target),
    artifacts: target.artifacts.map((artifact) => ({
      path: artifact.path,
      required: artifact.required,
    })),
    metric: Object.fromEntries(
      ['primary', 'direction', 'unit', 'printsMetric', 'guards']
        .filter((key) => target.metrics[key] !== undefined)
        .map((key) => [key, target.metrics[key]])
    ),
    timeouts: resolveTargetTimeouts(target),
  };
}

function canonicalJson(value) {
  return JSON.stringify(value, (_key, inner) =>
    inner && typeof inner === 'object' && !Array.isArray(inner)
      ? Object.fromEntries(
          Object.entries(inner).sort(([left], [right]) =>
            left < right ? -1 : left > right ? 1 : 0
          )
        )
      : inner
  );
}

function contractSha256(contract) {
  return createHash('sha256').update(canonicalJson(contract)).digest('hex');
}

function readReceipt(repoRoot, targetId) {
  const file = path.join(repoRoot, receiptDirectory, `${targetId}.json`);

  return fs.existsSync(file) ? readJson(file) : null;
}

function recordedInputs(value) {
  const inputs =
    value && typeof value === 'object' && !Array.isArray(value)
      ? Object.entries(value).filter(
          ([, digest]) =>
            typeof digest === 'string' && /^[0-9a-f]{64}$/u.test(digest)
        )
      : [];

  return inputs.length > 0 ? inputs : null;
}

function admitArtifact({ artifact, payload, registry, repoRoot, target }) {
  const codes = new Set();
  const reasons = [];
  const flag = (code, detail) => {
    codes.add(code);
    reasons.push(detail === undefined ? code : `${code}:${detail}`);
  };
  let receipt = null;

  try {
    receipt = readReceipt(repoRoot, target.id);
  } catch (error) {
    flag('receipt-unreadable', error.message);
  }
  if (receipt) {
    if (receipt.result.status !== 'passed') {
      flag('latest-run-failed', receipt.result.stage);
    }
    if (
      canonicalJson(receipt.contract) !==
      canonicalJson(executionContract(resolveTarget(registry, target)))
    ) {
      flag('contract-changed');
    }
    const recorded = receipt.artifacts.find(
      (entry) => entry.path === artifact.path
    )?.sha256;
    if (!recorded || recorded !== artifactSnapshot(repoRoot, artifact).digest) {
      flag('artifact-not-from-receipt');
    }
  } else if (reasons.length === 0) {
    flag('no-receipt');
  }

  const inputs = recordedInputs(payload?.sourceIdentity?.measuredInputs);

  if (inputs) {
    for (const [file, digest] of inputs) {
      if (artifactSnapshot(repoRoot, { path: file }).digest !== digest) {
        flag('input-changed', file);
      }
    }
  } else {
    flag('no-recorded-inputs');
  }

  return {
    latestRun: receipt?.result ?? null,
    reasons,
    state: staleReasons.some((code) => codes.has(code))
      ? 'stale'
      : reasons.length > 0
        ? 'unknown'
        : 'current',
  };
}

function snapshotKey(snapshot) {
  return snapshot.exists
    ? `${snapshot.digest}:${snapshot.mtimeNs}:${snapshot.size}`
    : 'missing';
}

function writeReceipt(repoRoot, receipt) {
  const file = path.join(repoRoot, receiptDirectory, `${receipt.target}.json`);
  const temporary = `${file}.${process.pid}.tmp`;

  fs.mkdirSync(path.dirname(file), { recursive: true });
  try {
    fs.writeFileSync(temporary, `${JSON.stringify(receipt, null, 2)}\n`);
    fs.renameSync(temporary, file);
  } catch (error) {
    fs.rmSync(temporary, { force: true });
    throw error;
  }
  return file;
}

function writeCommandOutput(result) {
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
}

function assertSuccessfulCommand(label, command, result) {
  if (result.error) {
    throw new Error(
      `${label} could not start: ${command}\n${result.error.message}`
    );
  }
  if (result.status !== 0) {
    const error = new Error(
      `${label} failed: exit=${result.status ?? 'null'} signal=${result.signal ?? 'none'}\n${command}`
    );

    error.exitCode = result.status ?? 1;
    throw error;
  }
}

function metricValue(stdout, metricName) {
  const match = stdout.match(
    new RegExp(`^METRIC ${escapeRegExp(metricName)}=([^\\s]+)\\s*$`, 'mu')
  );

  if (!match) return null;

  const value = Number(match[1]);
  return Number.isFinite(value) ? value : null;
}

async function runBenchmarkTarget(
  target,
  { repoRoot = root, runProcess = runBoundedProcess, writeOutput = true } = {}
) {
  const cwd = path.resolve(repoRoot, target.cwd);
  const contract = executionContract(target);
  const { timeouts } = contract;
  const env = Object.fromEntries(
    Object.entries(process.env).filter(
      ([name]) => !contract.unset.includes(name)
    )
  );
  const startedAt = new Date().toISOString();
  const processes = [];
  const run = async (label, command, timeoutMs) => {
    console.log(`${label}=${command}`);
    const started = performance.now();
    let result;

    try {
      result = await runProcess({
        args: [],
        captureLimitBytes: 64 * 1024 * 1024,
        command,
        cwd,
        env,
        shell: true,
        stdio: ['ignore', 'pipe', 'pipe'],
        timeoutMs,
      });
    } catch (error) {
      throw new Error(
        `${label} could not start: ${command}\n${error.message}`,
        {
          cause: error,
        }
      );
    }

    processes.push({
      role: label,
      exitCode: result.status,
      signal: result.signal ?? null,
      timedOut: result.timedOut === true,
      durationMs: Math.round(performance.now() - started),
    });
    if (writeOutput) writeCommandOutput(result);
    assertSuccessfulCommand(label, command, result);
    return result;
  };
  const snapshots = () =>
    new Map(
      target.artifacts.map((artifact) => [
        artifact.path,
        artifactSnapshot(repoRoot, artifact),
      ])
    );

  console.log(`target=${target.id}`);
  console.log(`cwd=${path.relative(repoRoot, cwd) || '.'}`);

  let stage = 'correctness';
  let before;
  let after;
  let failure;
  let primaryMetric = null;

  try {
    await run(
      'correctness',
      target.correctness.command,
      timeouts.correctnessMs
    );
    stage = 'benchmark';
    before = snapshots();
    const benchmark = await run(
      'benchmark',
      target.command,
      timeouts.benchmarkMs
    );
    stage = 'artifact';
    after = snapshots();

    for (const artifact of target.artifacts.filter((entry) => entry.required)) {
      const current = after.get(artifact.path);

      if (current.error) {
        throw new Error(
          `Benchmark artifact is unreadable: ${artifact.path}: ${current.error}`
        );
      }
      if (!current.exists) {
        throw new Error(
          `Benchmark did not produce required artifact: ${artifact.path}`
        );
      }
      if (snapshotKey(before.get(artifact.path)) === snapshotKey(current)) {
        throw new Error(`Benchmark artifact is stale: ${artifact.path}`);
      }
    }

    if (target.metrics.printsMetric) {
      stage = 'metric';
      primaryMetric = metricValue(benchmark.stdout, target.metrics.primary);

      if (primaryMetric === null) {
        throw new Error(
          `Benchmark did not print a finite primary metric: METRIC ${target.metrics.primary}=<number>`
        );
      }
    }
  } catch (error) {
    failure =
      error instanceof Error
        ? error
        : new Error('Benchmark target failed', { cause: error });
  }

  after ??= snapshots();
  const cpus = os.cpus();
  const receipt = {
    target: target.id,
    contract,
    host: {
      platform: process.platform,
      arch: process.arch,
      cpu: cpus[0]?.model ?? null,
      cpus: cpus.length,
      memoryBytes: os.totalmem(),
      node: process.version,
    },
    startedAt,
    finishedAt: new Date().toISOString(),
    processes,
    artifacts: target.artifacts.map((artifact) => {
      const current = after.get(artifact.path);

      return {
        path: artifact.path,
        required: artifact.required,
        sha256: current.digest ?? null,
        changed:
          before !== undefined &&
          snapshotKey(before.get(artifact.path)) !== snapshotKey(current),
        ...(current.error && { error: current.error }),
      };
    }),
    result: failure
      ? { status: 'failed', stage, message: failure.message }
      : { status: 'passed', primaryMetric },
  };
  let receiptPath;

  try {
    receiptPath = writeReceipt(repoRoot, receipt);
  } catch (error) {
    throw Object.assign(
      new Error(
        `${failure ? `${failure.message}\n` : ''}Could not write benchmark receipt for ${target.id}: ${error.message}`,
        { cause: error }
      ),
      { exitCode: failure?.exitCode ?? 1 }
    );
  }
  console.log(`receipt=${path.relative(repoRoot, receiptPath)}`);

  if (failure) throw failure;
  return { primaryMetric, receipt };
}

async function runTarget(id) {
  await runBenchmarkTarget(getTarget(id));
}

function inTargetDirectory(target, command) {
  const unset = recipeVariables(target);

  return [
    `cd '${path.resolve(root, target.cwd).replaceAll("'", "'\\''")}'`,
    ...(unset.length > 0 ? [`unset ${unset.join(' ')}`] : []),
    command,
  ].join(' && ');
}

function autoresearchSetupArgs(target, command) {
  return [
    command,
    '--cwd',
    root,
    '--name',
    target.id,
    '--metric-name',
    target.metrics.primary,
    '--metric-unit',
    target.metrics.unit ?? 'value',
    '--direction',
    target.metrics.direction,
    '--benchmark-command',
    inTargetDirectory(target, target.command),
    '--benchmark-prints-metric',
    String(Boolean(target.metrics.printsMetric)),
    '--checks-command',
    inTargetDirectory(target, target.correctness.command),
  ];
}

function runAutoresearchSetupPlan(id) {
  const target = getTarget(id);
  const args = autoresearchSetupArgs(target, 'setup-plan');
  const script = resolveAutoresearchScript();

  const result = spawnSync(process.execPath, [script, ...args], {
    cwd: root,
    stdio: 'inherit',
  });
  process.exit(result.status ?? 1);
}

function runAutoresearchInit(id) {
  const target = getTarget(id);
  const args = autoresearchSetupArgs(target, 'setup');
  const script = resolveAutoresearchScript();

  const result = spawnSync(process.execPath, [script, ...args], {
    cwd: root,
    stdio: 'inherit',
  });
  process.exit(result.status ?? 1);
}

function dryRun(id = 'react-active-typing-breakdown') {
  const registry = loadRegistry();
  const errors = validateRegistry(registry);
  if (errors.length > 0) {
    for (const error of errors) console.error(`ERROR ${error}`);
    process.exit(1);
  }

  const history = buildTargetHistory(registry);
  const target = getTarget(id);
  const script = resolveAutoresearchScript({ required: false });
  let autoresearchSetupOk = 'skipped';
  let benchmarkMode = 'codex-autoresearch script unavailable';

  if (script) {
    const setup = spawnSync(
      process.execPath,
      [script, ...autoresearchSetupArgs(target, 'setup-plan')],
      {
        cwd: root,
        encoding: 'utf-8',
        stdio: 'pipe',
      }
    );

    if (setup.status !== 0) {
      process.stdout.write(setup.stdout);
      process.stderr.write(setup.stderr);
      process.exit(setup.status ?? 1);
    }

    let setupPayload;
    try {
      setupPayload = JSON.parse(setup.stdout);
    } catch {
      fail('Autoresearch setup-plan did not return JSON.');
    }
    autoresearchSetupOk = String(setupPayload.ok === true);
    benchmarkMode = setupPayload.benchmarkMode?.note ?? 'unknown';
  }

  console.log('benchmark-targets dry-run ok');
  console.log(`targets=${history.counts.targets}`);
  console.log(
    `missingOptionalArtifacts=${history.counts.missingOptionalArtifacts}`
  );
  console.log(
    `missingRequiredArtifacts=${history.counts.missingRequiredArtifacts}`
  );
  console.log(`target=${target.id}`);
  console.log(`metric=${target.metrics.primary}`);
  console.log(`benchmarkCommand=${inTargetDirectory(target, target.command)}`);
  console.log(
    `checksCommand=${inTargetDirectory(target, target.correctness.command)}`
  );
  console.log(`autoresearchSetupOk=${autoresearchSetupOk}`);
  console.log(`benchmarkMode=${benchmarkMode}`);
}

async function main() {
  const [command, ...rawArgs] = process.argv.slice(2);
  const args = rawArgs[0] === '--' ? rawArgs.slice(1) : rawArgs;

  switch (command) {
    case 'autoresearch-init': {
      runAutoresearchInit(args[0]);
      break;
    }
    case 'autoresearch-setup': {
      runAutoresearchSetupPlan(args[0]);
      break;
    }
    case 'autoresearch-setup-plan': {
      runAutoresearchSetupPlan(args[0]);
      break;
    }
    case 'check': {
      checkTargets();
      break;
    }
    case 'dry-run': {
      dryRun(args[0]);
      break;
    }
    case 'list': {
      listTargets();
      break;
    }
    case 'report': {
      writeTargetReport({
        check: args.includes('--check'),
        dryRun: args.includes('--dry-run'),
      });
      break;
    }
    case 'run': {
      await runTarget(args[0]);
      break;
    }
    default: {
      fail(usage);
    }
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main().catch((error) => {
    fail(error?.stack ?? String(error), error?.exitCode ?? 1);
  });
}

export {
  admitArtifact,
  buildTargetHistory,
  readTargetRegistry,
  renderMarkdownReport,
  runBenchmarkTarget,
  validateRegistry,
};

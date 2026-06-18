#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../..');
const registryPath = path.join(root, 'benchmarks/targets/slate-v2.json');
const historyPath = path.join(
  root,
  'benchmarks/targets/history/slate-v2-latest.json'
);
const reportPath = path.join(root, 'benchmarks/targets/reports/slate-v2.md');
const evidenceKitRegistryPath = path.join(
  root,
  'benchmarks/editor/research/benchmark-registry.json'
);
const evidenceKitRoot = path.join(root, 'benchmarks/editor');
const autoresearchScriptCandidates = [
  process.env.CODEX_AUTORESEARCH_SCRIPT,
  path.resolve(
    root,
    '../codex-autoresearch/plugins/codex-autoresearch/scripts/autoresearch.mjs'
  ),
].filter(Boolean);

const usage = `Usage:
  node tooling/scripts/bench-targets.mjs list
  node tooling/scripts/bench-targets.mjs check
  node tooling/scripts/bench-targets.mjs dry-run [target-id]
  node tooling/scripts/bench-targets.mjs report [--check|--dry-run]
  node tooling/scripts/bench-targets.mjs run <target-id>
  node tooling/scripts/bench-targets.mjs autoresearch-setup-plan <target-id>
  node tooling/scripts/bench-targets.mjs autoresearch-init <target-id>
  node tooling/scripts/bench-targets.mjs import-evidence-kit [--write]
`;

function fail(message) {
  console.error(message);
  process.exit(1);
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
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function normalizeRepoPath(value) {
  if (!value) return value;
  const absolute = path.resolve(evidenceKitRoot, value);
  return path.relative(root, absolute).replaceAll(path.sep, '/');
}

function metricNameFor(artifact) {
  if (artifact.family === 'react-typing') return 'typing_seconds';
  if (artifact.kind === 'browser-trace') return 'browser_trace_seconds';
  if (artifact.family?.startsWith('core-')) return 'core_benchmark_seconds';
  if (artifact.family === 'browser-rich-text') return 'replay_seconds';
  if (artifact.family === 'clipboard') return 'clipboard_seconds';
  return 'benchmark_seconds';
}

function targetFromEvidenceKitArtifact(artifact) {
  return {
    id: artifact.id,
    question: artifact.decision,
    owner: artifact.owner ?? 'slate-v2',
    family: artifact.family ?? artifact.category ?? 'uncategorized',
    kind: artifact.kind ?? 'benchmark',
    cwd: normalizeRepoPath(artifact.cwd),
    command: artifact.command,
    metrics: {
      primary: metricNameFor(artifact),
      direction: 'lower',
      unit: 's',
      printsMetric: false,
      upgrade:
        'Prefer benchmark-native METRIC lines when this target is touched.',
    },
    correctness: {
      command: 'bun check',
      policy:
        'Use the target-specific correctness command when one exists; bun check is the fallback before promotion.',
    },
    artifacts: [
      {
        path: normalizeRepoPath(artifact.path),
        required: artifact.required !== false,
      },
    ],
    docs: {
      sources: [
        'benchmarks/editor/research/evidence-source-map.md',
        'benchmarks/editor/iterations/003-evidence-control-plane.md',
      ],
    },
    migration: {
      importedFrom: 'benchmarks/editor/research/benchmark-registry.json',
      evidenceKitId: artifact.id,
      evidenceKitCategory: artifact.category ?? null,
      evidenceKitActive: true,
    },
  };
}

function importEvidenceKit() {
  const legacy = readJson(evidenceKitRegistryPath);
  const targets = legacy.artifacts.map(targetFromEvidenceKitArtifact);

  return {
    version: 1,
    policy: {
      authority:
        'Benchmark targets are the future source of truth. Evidence Kit is a legacy import/report archive during migration.',
      benchmarkCode:
        'Benchmark implementation lives with the runtime/package code it measures.',
      activeLoops:
        'Autoresearch sessions optimize one target id at a time and own only active loop state.',
      docs: 'Docs and research files are linked evidence, not benchmark control state.',
    },
    targets,
  };
}

function loadRegistry() {
  if (!fs.existsSync(registryPath)) {
    fail(
      `Missing ${path.relative(root, registryPath)}. Run: pnpm bench:targets:import-evidence-kit`
    );
  }
  return readJson(registryPath);
}

function sortedTargets(registry) {
  return [...registry.targets].sort((a, b) => a.id.localeCompare(b.id));
}

function getTarget(id) {
  if (!id) fail(usage);
  const target = loadRegistry().targets.find((entry) => entry.id === id);
  if (!target) fail(`Unknown benchmark target: ${id}`);
  return target;
}

function validateRegistry(registry) {
  const errors = [];
  const seen = new Set();

  if (registry.version !== 1) errors.push('version must be 1');
  if (!Array.isArray(registry.targets) || registry.targets.length === 0) {
    errors.push('targets must be a non-empty array');
  }

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

    if (path.isAbsolute(target.cwd ?? '')) {
      errors.push(`${prefix}: cwd must be repo-relative`);
    }
    if (!target.metrics?.primary)
      errors.push(`${prefix}: missing metrics.primary`);
    if (!['lower', 'higher'].includes(target.metrics?.direction)) {
      errors.push(`${prefix}: metrics.direction must be lower or higher`);
    }
    if (typeof target.metrics?.printsMetric !== 'boolean') {
      errors.push(`${prefix}: metrics.printsMetric must be boolean`);
    }
    if (!target.correctness?.command) {
      errors.push(`${prefix}: missing correctness.command`);
    }
    if (!Array.isArray(target.artifacts) || target.artifacts.length === 0) {
      errors.push(`${prefix}: missing artifacts`);
    }
    for (const artifact of target.artifacts ?? []) {
      if (!artifact.path) errors.push(`${prefix}: artifact missing path`);
      if (path.isAbsolute(artifact.path ?? '')) {
        errors.push(`${prefix}: artifact path must be repo-relative`);
      }
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

function artifactState(artifact) {
  const absolutePath = path.resolve(root, artifact.path);
  const exists = fs.existsSync(absolutePath);

  return {
    path: artifact.path,
    required: artifact.required !== false,
    exists,
  };
}

function buildTargetHistory(registry) {
  const targets = sortedTargets(registry).map((target) => {
    const artifacts = target.artifacts.map(artifactState);
    const missingArtifacts = artifacts.filter(
      (artifact) => artifact.required && !artifact.exists
    );
    const missingOptionalArtifacts = artifacts.filter(
      (artifact) => !artifact.required && !artifact.exists
    );

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
            : 'ok',
      migration: target.migration ?? null,
    };
  });
  const statusCounts = countBy(targets, (target) => target.status);
  const artifactCounts = countArtifacts(targets);

  return {
    version: 1,
    registryPath: path.relative(root, registryPath),
    policy: registry.policy,
    counts: {
      targets: targets.length,
      ...artifactCounts,
      statusCounts,
    },
    targets,
  };
}

function countArtifacts(targets) {
  let artifacts = 0;
  let existingArtifacts = 0;
  let missingOptionalArtifacts = 0;
  let missingRequiredArtifacts = 0;
  let requiredArtifacts = 0;

  for (const target of targets) {
    for (const artifact of target.artifacts) {
      artifacts += 1;
      if (artifact.required) requiredArtifacts += 1;
      if (artifact.exists) existingArtifacts += 1;
      if (!artifact.required && !artifact.exists) missingOptionalArtifacts += 1;
      if (artifact.required && !artifact.exists) missingRequiredArtifacts += 1;
    }
  }

  return {
    artifacts,
    existingArtifacts,
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
      const artifactSummary = `${target.artifacts.filter((artifact) => artifact.exists).length}/${target.artifacts.length}`;
      return [
        target.id,
        target.family,
        target.metric,
        target.status,
        artifactSummary,
        target.printsMetric ? 'yes' : 'wrapped',
      ]
        .map(escapeMarkdownCell)
        .join(' | ');
    })
    .join('\n');

  return `# Slate v2 Benchmark Targets

This report is generated from \`${history.registryPath}\`.

Evidence Kit is legacy input during migration. Active benchmark decisions should
use target ids from this registry, then feed those targets into benchmark
runners, Autoresearch, and report generation.

## Summary

- Targets: ${history.counts.targets}
- Required artifacts: ${history.counts.requiredArtifacts}
- Existing artifacts: ${history.counts.existingArtifacts}
- Missing optional artifacts: ${history.counts.missingOptionalArtifacts}
- Missing required artifacts: ${history.counts.missingRequiredArtifacts}
- Status counts: ${Object.entries(history.counts.statusCounts)
    .map(([status, count]) => `${status}=${count}`)
    .join(', ')}

## Targets

| Target | Family | Metric | Status | Artifacts | Metric output |
|--------|--------|--------|--------|-----------|---------------|
${rows
  .split('\n')
  .map((row) => `| ${row} |`)
  .join('\n')}
`;
}

function escapeMarkdownCell(value) {
  return String(value).replaceAll('|', '\\|');
}

function writeTargetReport({ check = false, dryRun = false } = {}) {
  const history = buildTargetHistory(loadRegistry());
  const json = `${JSON.stringify(history, null, 2)}\n`;
  const markdown = renderMarkdownReport(history);

  if (dryRun) {
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
    current = fs.readFileSync(filePath, 'utf8');
  } catch {
    throw new Error(`missing generated file: ${path.relative(root, filePath)}`);
  }
  if (current !== expected) {
    throw new Error(
      `generated file is stale: ${path.relative(root, filePath)}`
    );
  }
}

function runTarget(id) {
  const target = getTarget(id);
  const cwd = path.resolve(root, target.cwd);
  console.log(`target=${target.id}`);
  console.log(`cwd=${path.relative(root, cwd)}`);
  console.log(`command=${target.command}`);

  const result = spawnSync(target.command, {
    cwd,
    shell: true,
    stdio: 'inherit',
  });
  process.exit(result.status ?? 1);
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
    `cd '${path.resolve(root, target.cwd).replaceAll("'", "'\\''")}' && ${target.command}`,
    '--benchmark-prints-metric',
    String(Boolean(target.metrics.printsMetric)),
    '--checks-command',
    target.correctness.command,
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

  if (!script) {
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
    console.log('autoresearchSetupOk=skipped');
    console.log('benchmarkMode=codex-autoresearch script unavailable');
    return;
  }

  const setup = spawnSync(
    process.execPath,
    [script, ...autoresearchSetupArgs(target, 'setup-plan')],
    {
      cwd: root,
      encoding: 'utf8',
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
  console.log(`autoresearchSetupOk=${setupPayload.ok === true}`);
  console.log(`benchmarkMode=${setupPayload.benchmarkMode?.note ?? 'unknown'}`);
}

function writeImportedRegistry() {
  const registry = importEvidenceKit();
  const errors = validateRegistry(registry);
  if (errors.length > 0) {
    for (const error of errors) console.error(`ERROR ${error}`);
    process.exit(1);
  }

  fs.mkdirSync(path.dirname(registryPath), { recursive: true });
  fs.writeFileSync(registryPath, `${JSON.stringify(registry, null, 2)}\n`);
  console.log(
    `wrote ${path.relative(root, registryPath)} (${registry.targets.length} targets)`
  );
}

const [command, ...rawArgs] = process.argv.slice(2);
const args = rawArgs[0] === '--' ? rawArgs.slice(1) : rawArgs;

switch (command) {
  case 'autoresearch-init':
    runAutoresearchInit(args[0]);
    break;
  case 'autoresearch-setup':
    runAutoresearchSetupPlan(args[0]);
    break;
  case 'autoresearch-setup-plan':
    runAutoresearchSetupPlan(args[0]);
    break;
  case 'check':
    checkTargets();
    break;
  case 'dry-run':
    dryRun(args[0]);
    break;
  case 'import-evidence-kit':
    if (args.includes('--write')) {
      writeImportedRegistry();
    } else {
      console.log(JSON.stringify(importEvidenceKit(), null, 2));
    }
    break;
  case 'list':
    listTargets();
    break;
  case 'report':
    writeTargetReport({
      check: args.includes('--check'),
      dryRun: args.includes('--dry-run'),
    });
    break;
  case 'run':
    runTarget(args[0]);
    break;
  default:
    fail(usage);
}

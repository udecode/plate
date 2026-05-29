import fs from 'node:fs';
import path from 'node:path';

import { readBenchmarkRegistry } from '../src/index.mjs';

const args = parseArgs(process.argv.slice(2));
const rootDir = process.cwd();
const resultPath =
  args.result || 'benchmarks/results/rich-text-editors-latest.json';
const outPath = args.out || 'benchmarks/results/benchmark-health-latest.json';
const staleDays = readNumber(args.staleDays || args['stale-days'], 14);
const registry = readBenchmarkRegistry({ rootDir });
const result = readJsonIfExists(path.resolve(rootDir, resultPath));
const health = buildHealthReport({
  registry,
  result,
  resultPath,
  rootDir,
  staleDays,
});

if (args.check) {
  assertHealth(health);
}

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(health, null, 2) + '\n');
console.log(`wrote ${outPath}`);
console.log(
  `benchmark health active=${health.registry.activeArtifacts} rows=${health.result.rowCount} nextActions=${health.nextActions.length}`
);

function buildHealthReport({
  registry,
  result,
  resultPath,
  rootDir,
  staleDays,
}) {
  const rows = Array.isArray(result?.rows) ? result.rows : [];
  const registeredArtifacts = registry.artifacts.map((artifact) =>
    describeArtifact(artifact, { rootDir, staleDays })
  );
  const missingRequiredArtifacts = registeredArtifacts.filter(
    (artifact) => artifact.required && !artifact.exists
  );
  const missingOptionalArtifacts = registeredArtifacts.filter(
    (artifact) => !artifact.required && !artifact.exists
  );
  const staleActiveArtifacts = registeredArtifacts.filter(
    (artifact) => artifact.exists && artifact.stale
  );
  const ignoredUnregisteredArtifacts = findIgnoredUnregisteredArtifacts(
    registry,
    { rootDir }
  );
  const statusCounts = countBy(rows, (row) => row.status || 'unknown');
  const nextActions = buildNextActions({
    ignoredUnregisteredArtifacts,
    missingOptionalArtifacts,
    missingRequiredArtifacts,
    rows,
    staleActiveArtifacts,
    statusCounts,
  });

  return {
    generatedAt: new Date().toISOString(),
    name: 'benchmark-health',
    nextActions,
    node: process.version,
    registry: {
      activeArtifacts: registeredArtifacts.length,
      discardedUnregisteredArtifacts: ignoredUnregisteredArtifacts.length,
      ignoredUnregisteredArtifacts: ignoredUnregisteredArtifacts.slice(0, 20),
      missingOptionalArtifacts: missingOptionalArtifacts.map((artifact) =>
        pickArtifactSummary(artifact)
      ),
      missingRequiredArtifacts: missingRequiredArtifacts.map((artifact) =>
        pickArtifactSummary(artifact)
      ),
      optionalArtifacts: registeredArtifacts.filter(
        (artifact) => !artifact.required
      ).length,
      registeredPath: path.relative(rootDir, registry.path),
      requiredArtifacts: registeredArtifacts.filter(
        (artifact) => artifact.required
      ).length,
      staleActiveArtifacts: staleActiveArtifacts.map((artifact) =>
        pickArtifactSummary(artifact)
      ),
    },
    result: {
      path: resultPath,
      rowCount: rows.length,
      statusCounts,
    },
  };
}

function describeArtifact(artifact, { rootDir, staleDays }) {
  const resolvedPath = path.resolve(rootDir, artifact.path);
  const exists = fs.existsSync(resolvedPath);
  const stat = exists ? fs.statSync(resolvedPath) : null;
  const ageDays = stat
    ? Math.max(0, (Date.now() - stat.mtimeMs) / 86_400_000)
    : null;

  return {
    ...artifact,
    ageDays,
    exists,
    resolvedPath,
    stale: ageDays !== null && ageDays > staleDays,
  };
}

function findIgnoredUnregisteredArtifacts(registry, { rootDir }) {
  const registered = new Set(
    registry.artifacts.map((artifact) => path.resolve(rootDir, artifact.path))
  );
  const ignored = [];

  for (const entry of registry.discardUnregistered) {
    const scanRoot = path.resolve(rootDir, entry.root);
    if (!fs.existsSync(scanRoot)) continue;

    for (const filePath of walkFiles(scanRoot)) {
      if (!filePath.endsWith('.json')) continue;
      if (!path.basename(filePath).includes(entry.match)) continue;
      if (registered.has(filePath)) continue;
      ignored.push(path.relative(rootDir, filePath));
    }
  }

  return ignored.sort();
}

function buildNextActions({
  ignoredUnregisteredArtifacts,
  missingOptionalArtifacts,
  missingRequiredArtifacts,
  rows,
  staleActiveArtifacts,
  statusCounts,
}) {
  const actions = [];

  for (const artifact of missingRequiredArtifacts) {
    actions.push({
      id: `rerun-${artifact.id}`,
      priority: 1,
      reason: `Required active artifact is missing: ${artifact.path}`,
      title: `Rerun ${artifact.id}`,
    });
  }

  const overBudgetRows = rows.filter((row) => row.status === 'over-budget');
  if (overBudgetRows.length > 0) {
    actions.push({
      id: 'investigate-over-budget',
      priority: 2,
      reason: `${overBudgetRows.length} benchmark rows are over budget.`,
      title: 'Investigate over-budget rows',
    });
  }

  const adapterMissingRows = rows.filter(
    (row) => row.status === 'adapter-missing'
  );
  if (adapterMissingRows.length > 0) {
    actions.push({
      id: 'resolve-adapter-gaps',
      priority: 3,
      reason: `${adapterMissingRows.length} active rows still lack a measured Slate baseline.`,
      title: 'Resolve active adapter gaps',
    });
  }

  for (const artifact of staleActiveArtifacts.slice(0, 5)) {
    actions.push({
      id: `refresh-${artifact.id}`,
      priority: 4,
      reason: `Active artifact is ${artifact.ageDays.toFixed(1)} days old: ${artifact.path}`,
      title: `Refresh ${artifact.id}`,
    });
  }

  for (const artifact of missingOptionalArtifacts) {
    actions.push({
      id: `optional-${artifact.id}`,
      priority: 5,
      reason: `Optional active artifact is missing: ${artifact.path}`,
      title: `Decide whether ${artifact.id} should stay optional`,
    });
  }

  if (ignoredUnregisteredArtifacts.length > 0) {
    actions.push({
      id: 'discard-unregistered-artifacts',
      priority: 6,
      reason: `${ignoredUnregisteredArtifacts.length} unregistered benchmark JSON files are ignored by the active Evidence Kit flow.`,
      title: 'Delete or ignore historical unregistered artifacts',
    });
  }

  if (actions.length === 0 && Number(statusCounts.ok || 0) > 0) {
    actions.push({
      id: 'keep-refreshing-active-registry',
      priority: 9,
      reason: 'No active health blockers found.',
      title: 'Keep refreshing the registered benchmark set',
    });
  }

  return actions.sort((left, right) => left.priority - right.priority);
}

function assertHealth(health) {
  if (health.registry.activeArtifacts < 20) {
    throw new Error(
      `expected at least 20 active registered artifacts, got ${health.registry.activeArtifacts}`
    );
  }
  if (health.registry.missingRequiredArtifacts.length > 0) {
    throw new Error(
      'missing required active artifacts: ' +
        health.registry.missingRequiredArtifacts
          .map((artifact) => artifact.id)
          .join(', ')
    );
  }
  if (health.result.rowCount < 250) {
    throw new Error(
      `expected rich-text evidence rows before health check, got ${health.result.rowCount}`
    );
  }
  if (health.nextActions.length === 0) {
    throw new Error('expected health report to produce next actions');
  }
}

function pickArtifactSummary(artifact) {
  return {
    ageDays:
      artifact.ageDays === null ? null : Math.round(artifact.ageDays * 10) / 10,
    command: artifact.command,
    cwd: artifact.cwd,
    id: artifact.id,
    path: artifact.path,
  };
}

function countBy(items, readKey) {
  const counts = {};
  for (const item of items) {
    const key = readKey(item);
    counts[key] = (counts[key] || 0) + 1;
  }

  return Object.fromEntries(
    Object.entries(counts).sort(([left], [right]) => left.localeCompare(right))
  );
}

function walkFiles(root) {
  const files = [];
  const stack = [root];

  while (stack.length > 0) {
    const current = stack.pop();
    const stat = fs.statSync(current);
    if (stat.isDirectory()) {
      for (const entry of fs.readdirSync(current)) {
        stack.push(path.join(current, entry));
      }
    } else {
      files.push(current);
    }
  }

  return files;
}

function readJsonIfExists(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function parseArgs(argv) {
  const out = {};
  let i = 0;

  while (i < argv.length) {
    const arg = argv[i];
    i++;
    if (!arg.startsWith('--')) continue;

    const key = arg.slice(2);
    if (key === 'check') {
      out.check = true;
      continue;
    }

    out[key] = argv[i] || true;
    i++;
  }

  return out;
}

function readNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

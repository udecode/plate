import fs from 'node:fs';
import path from 'node:path';

import {
  admitArtifact,
  readTargetRegistry,
} from '../../../tooling/scripts/bench-targets.mjs';

const compareStrings = (left, right) => {
  if (left < right) return -1;
  if (left > right) return 1;

  return 0;
};
const compareEntries = ([left], [right]) => compareStrings(left, right);

export const editorTargets = Object.freeze([
  {
    id: 'slate-v2',
    label: 'Slate v2',
    role: 'engine-and-react-runtime',
    sourcePath: '../..',
    evidenceOwner: 'scripts/benchmarks plus packages/slate*',
  },
  {
    id: 'slate',
    label: 'Slate',
    role: 'legacy-baseline',
    sourcePath: '../../../slate',
    evidenceOwner: 'upstream package behavior and local clone',
  },
]);

export const staleSurfacePaths = Object.freeze([
  'apps',
  'app',
  'assets',
  'components',
  'data',
  'lib/benchmark-types.ts',
  'scripts/benchmark/run_contract_benchmarks.mjs',
  'templates',
  'tests/config',
  'website',
]);

export const benchmarkRegistryDefaultPath = 'research/benchmark-registry.json';

export const slateLegacyCompareSurfaceOrder = Object.freeze([
  'v2DefaultRenderAuto',
  'v2DomPresent',
  'legacyChunkOn',
]);

export function normalizeBenchmarkRow(row, context = {}) {
  if (!row || typeof row !== 'object' || Array.isArray(row)) {
    throw new TypeError('benchmark row must be an object');
  }

  const normalized = {
    category: requireString(row.category, 'category'),
    fixture: requireString(row.fixture, 'fixture'),
    library: requireString(row.library, 'library'),
    status: requireString(row.status, 'status'),
  };

  for (const key of ['medianUs', 'p95Us', 'ops', 'bytes']) {
    if (row[key] === undefined) continue;
    normalized[key] = requireFiniteNumber(row[key], key);
  }

  if (row.note !== undefined) normalized.note = String(row.note);
  if (context.sourcePath) normalized.sourcePath = String(context.sourcePath);
  if (row.target !== undefined) {
    normalized.target = requireString(row.target, 'target');
  }
  if (row.admission !== undefined) {
    normalized.admission = requireString(row.admission, 'admission');
  }

  return normalized;
}

export function normalizeBenchmarkResult(payload, context = {}) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new TypeError('benchmark result must be an object');
  }

  const rows = Array.isArray(payload.rows)
    ? payload.rows
    : Array.isArray(payload.results)
      ? payload.results
      : [];

  return {
    name: typeof payload.name === 'string' ? payload.name : 'unnamed-benchmark',
    generatedAt:
      typeof payload.generatedAt === 'string'
        ? payload.generatedAt
        : new Date(0).toISOString(),
    node: typeof payload.node === 'string' ? payload.node : process.version,
    rows: rows.map((row) => normalizeBenchmarkRow(row, context)),
  };
}

export function readResearchSources(filePath) {
  const payload = readJson(filePath);
  const sources = Array.isArray(payload.sources) ? payload.sources : [];

  return sources.map((source) => ({
    name: requireString(source.name, 'source.name'),
    type: requireString(source.type, 'source.type'),
    why: source.why ? String(source.why) : '',
  }));
}

export function readBenchmarkRegistry({
  registryPath = benchmarkRegistryDefaultPath,
  rootDir = process.cwd(),
  repoRoot = path.resolve(rootDir, '../..'),
} = {}) {
  const resolvedPath = path.resolve(rootDir, registryPath);
  const payload = readJson(resolvedPath);
  const targetRegistry = readTargetRegistry(repoRoot);
  const workloads = Array.isArray(payload.workloads) ? payload.workloads : [];
  const retired = Array.isArray(payload.retired) ? payload.retired : [];
  const discardUnregistered = Array.isArray(payload.discardUnregistered)
    ? payload.discardUnregistered
    : [];

  return {
    artifacts: targetRegistry.targets.flatMap((target) =>
      target.artifacts
        .filter((artifact) => artifact.evidence)
        .map((artifact) => normalizeTargetArtifact(target, artifact))
    ),
    discardUnregistered: discardUnregistered.map((entry) => ({
      match: requireString(entry.match, 'discardUnregistered.match'),
      root: requireString(entry.root, 'discardUnregistered.root'),
    })),
    path: resolvedPath,
    policy:
      payload.policy && typeof payload.policy === 'object'
        ? { ...payload.policy }
        : {},
    repoRoot,
    retired: retired.map(normalizeRetiredArtifact),
    targetRegistry,
    version: Number(payload.version) || 1,
    workloads: workloads.map(normalizeRegistryWorkload),
  };
}

export function readArtifactAdmission(spec, payload, { registry }) {
  const target = registry.targetRegistry.targets.find(
    (entry) => entry.id === spec.id
  );
  const artifact = target?.artifacts.find((entry) => entry.path === spec.path);

  if (!artifact) {
    return { latestRun: null, reasons: ['no-target'], state: 'unknown' };
  }

  return admitArtifact({
    artifact,
    payload,
    registry: registry.targetRegistry,
    repoRoot: registry.repoRoot,
    target,
  });
}

export function createEvidenceReadinessRows({ rootDir = process.cwd() } = {}) {
  const sourceConfigPath = path.join(
    rootDir,
    'research/editor-frameworks-sources.json'
  );
  const sources = fs.existsSync(sourceConfigPath)
    ? readResearchSources(sourceConfigPath)
    : [];
  const staleMatches = findStaleSurfaces(rootDir);
  const knownTargets = editorTargets.filter((target) =>
    fs.existsSync(path.resolve(rootDir, target.sourcePath))
  );

  return [
    normalizeBenchmarkRow({
      category: 'evidence-readiness',
      fixture: 'editor-framework-source-map',
      library: 'plate-editor-evidence',
      status: sources.length >= editorTargets.length ? 'ok' : 'missing-source',
      ops: sources.length,
      note: `${sources.length} configured source entries for ${editorTargets.length} target editors`,
    }),
    normalizeBenchmarkRow({
      category: 'evidence-readiness',
      fixture: 'local-editor-targets',
      library: 'plate-editor-evidence',
      status: knownTargets.length >= editorTargets.length ? 'ok' : 'partial',
      ops: knownTargets.length,
      note: `${knownTargets.length} local target roots currently exist`,
    }),
    normalizeBenchmarkRow({
      category: 'hard-cut',
      fixture: 'legacy-app-surface-removed',
      library: 'plate-editor-evidence',
      status: staleMatches.length === 0 ? 'ok' : 'stale-surface',
      ops: staleMatches.length,
      note:
        staleMatches.length === 0
          ? 'old app/template benchmark lab paths are absent'
          : `stale paths: ${staleMatches.join(', ')}`,
    }),
  ];
}

export function createSlateLegacyCompareRows({
  artifactPath,
  registry,
  registryPath,
  rootDir = process.cwd(),
} = {}) {
  const benchmarkRegistry =
    registry || readBenchmarkRegistry({ registryPath, rootDir });
  const registeredSpec = benchmarkRegistry.artifacts.find(
    (spec) => spec.id === 'react-huge-document-legacy-compare'
  );

  if (!registeredSpec && !artifactPath) {
    return [
      normalizeBenchmarkRow({
        category: 'slate-react-huge-document-legacy-compare',
        fixture: 'react-huge-document-legacy-compare',
        library: 'plate-editor-evidence',
        status: 'unavailable',
        note: 'no target declares react-huge-document-legacy-compare; pass --artifact to read a legacy comparison artifact',
      }),
    ];
  }

  const spec = {
    ...(registeredSpec || {
      category: 'slate-react-huge-document-legacy-compare',
      id: 'react-huge-document-legacy-compare',
      kind: 'slate-legacy-compare',
      required: true,
    }),
    ...(artifactPath ? { path: path.resolve(rootDir, artifactPath) } : {}),
  };

  return createBenchmarkArtifactRows(spec, {
    registry: benchmarkRegistry,
    rootDir,
  });
}

export function createRichTextEditorBenchmarkRows({
  registry,
  registryPath,
  rootDir = process.cwd(),
} = {}) {
  const benchmarkRegistry =
    registry || readBenchmarkRegistry({ registryPath, rootDir });
  const artifactRows = readArtifactRows(benchmarkRegistry, rootDir);

  return [
    ...createRichTextEditorCoverageRows({
      artifactRows,
      registry: benchmarkRegistry,
      rootDir,
    }),
    ...[...artifactRows.values()].flat(),
    ...benchmarkRegistry.retired.map((retired) =>
      normalizeBenchmarkRow({
        admission: 'historical',
        category: retired.category,
        fixture: retired.id,
        library: retired.library || 'slate-v2',
        status: 'historical',
        note:
          `retired definition; related target ${retired.relatedTarget ?? 'none'}; ` +
          `artifact ${retired.path} ${fs.existsSync(path.resolve(benchmarkRegistry.repoRoot, retired.path)) ? 'retained' : 'unavailable'}`,
      })
    ),
  ];
}

export function createRichTextEditorCoverageRows({
  artifactRows,
  registry,
  registryPath,
  rootDir = process.cwd(),
} = {}) {
  const benchmarkRegistry =
    registry || readBenchmarkRegistry({ registryPath, rootDir });
  const { workloads } = benchmarkRegistry;
  const rowsBySpec =
    artifactRows ?? readArtifactRows(benchmarkRegistry, rootDir);
  const specs = new Map(
    benchmarkRegistry.artifacts.map((spec) => [spec.id, spec])
  );
  const localTargets = new Map(
    editorTargets.map((target) => [
      target.id,
      fs.existsSync(path.resolve(rootDir, target.sourcePath)),
    ])
  );
  const rows = editorTargets.map((target) =>
    normalizeBenchmarkRow({
      category: 'rich-text-editor-target-coverage',
      fixture: 'local-source-root',
      library: target.id,
      status: localTargets.get(target.id) ? 'ok' : 'missing-source',
      ops: localTargets.get(target.id) ? 1 : 0,
      note: `${target.label}; role=${target.role}; source=${target.sourcePath}; owner=${target.evidenceOwner}`,
    })
  );

  for (const workload of workloads) {
    for (const target of editorTargets) {
      const status = readWorkloadCoverageStatus(target, workload, {
        localTargets,
        rowsBySpec,
        specs,
      });
      rows.push(
        normalizeBenchmarkRow({
          category: 'rich-text-editor-workload-coverage',
          fixture: workload.id,
          library: target.id,
          status: status.status,
          ops: status.score,
          note: `${workload.workload}; ${status.note}`,
        })
      );
    }
  }

  return rows;
}

function readArtifactRows(registry, rootDir) {
  return new Map(
    registry.artifacts.map((spec) => [
      spec.id,
      createBenchmarkArtifactRows(spec, { registry, rootDir }),
    ])
  );
}

export function createBenchmarkArtifactRows(
  spec,
  { registry, rootDir = process.cwd() }
) {
  const resolvedPath = path.resolve(registry.repoRoot, spec.path);
  const relativeArtifactPath = path.relative(rootDir, resolvedPath);
  const artifactRow = (fields) =>
    normalizeBenchmarkRow({
      category: spec.category,
      fixture: spec.id,
      library: spec.library || 'slate-v2',
      target: spec.id,
      ...fields,
    });

  if (!fs.existsSync(resolvedPath)) {
    return [
      artifactRow({
        note: `missing artifact ${relativeArtifactPath}`,
        status: spec.required
          ? 'missing-artifact'
          : 'optional-missing-artifact',
      }),
    ];
  }

  let payload;
  try {
    payload = readJson(resolvedPath);
  } catch (error) {
    return [
      artifactRow({
        note: `unreadable artifact ${relativeArtifactPath}: ${error.message}`,
        status: 'integrity-error',
      }),
    ];
  }

  const admission = readArtifactAdmission(spec, payload, { registry });

  if (admission.latestRun?.status === 'failed') {
    const { message, stage } = admission.latestRun;

    return [
      artifactRow({
        admission: admission.state,
        note: `latest run failed at ${stage}: ${message}; older artifact ${relativeArtifactPath} not shown (${admission.reasons.join(', ')})`,
        status: admission.state,
      }),
    ];
  }

  const rows =
    spec.kind === 'slate-legacy-compare'
      ? normalizeSlateLegacyCompareArtifact(payload, {
          artifactPath: relativeArtifactPath,
          rootDir,
        })
      : spec.kind === 'rows'
        ? normalizeRowsArtifactRows(payload, {
            artifactPath: relativeArtifactPath,
          })
        : spec.kind === 'browser-trace'
          ? normalizeBrowserTraceArtifactRows(payload, spec, {
              artifactPath: relativeArtifactPath,
            })
          : spec.kind === 'compare'
            ? normalizeCompareArtifactRows(payload, spec, {
                artifactPath: relativeArtifactPath,
                rootDir,
              })
            : normalizeCurrentArtifactRows(payload, spec, {
                artifactPath: relativeArtifactPath,
              });

  if (rows.length === 0) {
    return [
      artifactRow({
        note: `artifact ${relativeArtifactPath} did not expose metric stats`,
        status: 'missing-metrics',
      }),
    ];
  }

  return rows.map((row) => ({
    ...row,
    admission: admission.state,
    ...(admission.state !== 'current' && {
      note: `${row.note ? `${row.note}; ` : ''}status=${row.status}; admission=${admission.state} (${admission.reasons.join(', ')})`,
      status: admission.state,
    }),
    target: spec.id,
  }));
}

export function normalizeSlateLegacyCompareArtifact(
  payload,
  { artifactPath = 'unknown-artifact', rootDir = process.cwd() } = {}
) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new TypeError('Slate legacy compare artifact must be an object');
  }

  const surfaces =
    payload.surfaces && typeof payload.surfaces === 'object'
      ? payload.surfaces
      : {};
  const presentSurfaces = slateLegacyCompareSurfaceOrder.filter(
    (surfaceName) =>
      surfaces[surfaceName] &&
      typeof surfaces[surfaceName] === 'object' &&
      !Array.isArray(surfaces[surfaceName])
  );

  if (presentSurfaces.length === 0) {
    return [
      normalizeBenchmarkRow({
        category: 'slate-react-huge-document-legacy-compare',
        fixture: 'artifact',
        library: 'plate-editor-evidence',
        status: 'missing-surfaces',
        note: `artifact ${artifactPath} does not contain comparable Slate surfaces`,
      }),
    ];
  }

  const metricNames = findCommonSlateCompareMetricNames(surfaces);
  if (metricNames.length === 0) {
    return [
      normalizeBenchmarkRow({
        category: 'slate-react-huge-document-legacy-compare',
        fixture: 'artifact',
        library: 'plate-editor-evidence',
        status: 'missing-metrics',
        note: `artifact ${artifactPath} does not contain shared millisecond metrics`,
      }),
    ];
  }

  const config = payload.config || {};
  const blocks = readPositiveNumber(config.blocks, 0);
  const iterations = readPositiveNumber(config.iterations, 0);
  const typeOps = readPositiveNumber(config.typeOps, 0);
  const selectionLane = config.splitSelectionLanes
    ? 'split-selection'
    : 'combined-selection';
  const currentRepo = formatRepoLabel(payload.currentRepo, rootDir);
  const legacyRepo = formatRepoLabel(payload.legacyRepo, rootDir);

  return presentSurfaces.flatMap((surfaceName) => {
    const surface = surfaces[surfaceName];
    const surfaceInfo = describeSlateCompareSurface(surfaceName);

    return metricNames.map((metricName) => {
      const stats = surface[metricName];
      const sampleCount = Array.isArray(stats.samples)
        ? stats.samples.length
        : iterations;
      const library = surfaceInfo.variant
        ? `${surfaceInfo.library}:${surfaceInfo.variant}`
        : surfaceInfo.library;

      return normalizeBenchmarkRow({
        category: 'slate-react-huge-document-legacy-compare',
        fixture: `${blocks || 'unknown'}-blocks/${selectionLane}/${metricName}`,
        library,
        status: 'ok',
        medianUs: msToUs(stats.median),
        p95Us: msToUs(stats.p95),
        ops: sampleCount,
        note:
          `surface=${surfaceName}; source=${artifactPath}; ` +
          `current=${currentRepo}; legacy=${legacyRepo}; ` +
          `iterations=${iterations}; typeOps=${typeOps}`,
      });
    });
  });
}

export function findStaleSurfaces(rootDir = process.cwd()) {
  return staleSurfacePaths.filter((relativePath) =>
    fs.existsSync(path.join(rootDir, relativePath))
  );
}

export function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function requireString(value, name) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new TypeError(`${name} must be a non-empty string`);
  }

  return value;
}

function normalizeTargetArtifact(target, artifact) {
  const normalized = {
    category: requireString(artifact.evidence.category, 'evidence.category'),
    command: target.command,
    cwd: target.cwd,
    decision: target.question,
    family: target.family,
    id: target.id,
    kind: requireString(artifact.evidence.kind, 'evidence.kind'),
    owner: target.owner,
    path: requireString(artifact.path, 'artifact.path'),
    required: artifact.required !== false,
  };

  if (artifact.evidence.library !== undefined) {
    normalized.library = String(artifact.evidence.library);
  }
  if (artifact.evidence.surfaceLibraries !== undefined) {
    normalized.surfaceLibraries = artifact.evidence.surfaceLibraries;
  }

  return normalized;
}

function normalizeRetiredArtifact(retired) {
  if (!retired || typeof retired !== 'object' || Array.isArray(retired)) {
    throw new TypeError('retired artifact must be an object');
  }

  return {
    category: requireString(retired.category, 'retired.category'),
    id: requireString(retired.id, 'retired.id'),
    ...(retired.library !== undefined && { library: String(retired.library) }),
    path: requireString(retired.path, 'retired.path'),
    ...(retired.relatedTarget !== undefined && {
      relatedTarget: String(retired.relatedTarget),
    }),
  };
}

function normalizeRegistryWorkload(workload) {
  if (!workload || typeof workload !== 'object' || Array.isArray(workload)) {
    throw new TypeError('registry workload must be an object');
  }

  return {
    id: requireString(workload.id, 'workload.id'),
    targets: Array.isArray(workload.targets)
      ? workload.targets.map(String)
      : [],
    workload: requireString(workload.workload, 'workload.workload'),
  };
}

function requireFiniteNumber(value, name) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    throw new TypeError(`${name} must be a finite number`);
  }

  return number;
}

function normalizeCompareArtifactRows(
  payload,
  spec,
  { artifactPath = 'unknown-artifact', rootDir = process.cwd() } = {}
) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new TypeError(`${spec.id} artifact must be an object`);
  }

  const lane = String(payload.lane || spec.id);
  const iterations = readPositiveNumber(payload.iterations, 0);
  const currentRepo = formatRepoLabel(payload.currentRepo, rootDir);
  const legacyRepo = formatRepoLabel(payload.legacyRepo, rootDir);
  const rows = [];

  for (const side of ['current', 'legacy']) {
    const bucket = payload[side];
    if (!bucket || typeof bucket !== 'object' || Array.isArray(bucket)) {
      continue;
    }

    const library = side === 'current' ? 'slate-v2:current' : 'slate:baseline';
    const repo = side === 'current' ? currentRepo : legacyRepo;

    for (const [metricName, stats] of Object.entries(bucket).sort(
      compareEntries
    )) {
      if (!isMetricStatsObject(stats)) continue;
      rows.push(
        normalizeMetricStatsRow(stats, {
          artifactPath,
          category: spec.category,
          fixture: `${summarizeConfig(payload.config)}/${metricName}`,
          library,
          metricName,
          note:
            `lane=${lane}; side=${side}; source=${artifactPath}; ` +
            `repo=${repo}; iterations=${iterations}; deltaMeanMs=${formatDeltaMean(payload.deltaMeanMs, metricName)}`,
        })
      );
    }
  }

  return rows;
}

function normalizeCurrentArtifactRows(
  payload,
  spec,
  { artifactPath = 'unknown-artifact' } = {}
) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new TypeError(`${spec.id} artifact must be an object`);
  }

  const rows = [];
  const lane = String(payload.lane || payload.benchmark || spec.id);

  collectMetricStatsRows(payload, {
    artifactPath,
    category: spec.category,
    library: spec.library || 'slate-v2:current',
    pathParts: [],
    rows,
    rootLane: lane,
  });
  collectThresholdRows(payload, spec, { artifactPath, rows });
  collectInvariantRows(payload, spec, { artifactPath, rows });

  return rows;
}

function normalizeRowsArtifactRows(
  payload,
  { artifactPath = 'unknown-artifact' } = {}
) {
  return normalizeBenchmarkResult(payload, {
    sourcePath: artifactPath,
  }).rows.map((row) => ({
    ...row,
    fixture: sanitizeOutOfScopeFixtureLabel(row.fixture),
    note: row.note ? sanitizeOutOfScopeFixtureLabel(row.note) : row.note,
  }));
}

function normalizeBrowserTraceArtifactRows(
  payload,
  spec,
  { artifactPath = 'unknown-artifact' } = {}
) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new TypeError(`${spec.id} artifact must be an object`);
  }

  const surfaces =
    payload.surfaces && typeof payload.surfaces === 'object'
      ? payload.surfaces
      : {};
  const rows = [];
  const lane = String(payload.lane || payload.benchmark || spec.id);

  for (const [surfaceName, surface] of Object.entries(surfaces).sort(
    compareEntries
  )) {
    if (!surface || typeof surface !== 'object' || Array.isArray(surface)) {
      continue;
    }
    if (
      spec.surfaceLibraries &&
      !Object.hasOwn(spec.surfaceLibraries, surfaceName)
    ) {
      continue;
    }

    collectMetricStatsRows(surface, {
      artifactPath,
      category: spec.category,
      library:
        spec.surfaceLibraries?.[surfaceName] ||
        spec.library ||
        `${spec.id}:${surfaceName}`,
      pathParts: [],
      rows,
      rootLane: `${lane}; surface=${surfaceName}`,
    });
  }

  return rows;
}

function collectMetricStatsRows(
  value,
  { artifactPath, category, library, pathParts, rows, rootLane }
) {
  if (!value || typeof value !== 'object') return;

  if (isMetricStatsObject(value)) {
    const metricName = pathParts.at(-1) || 'metric';
    rows.push(
      normalizeMetricStatsRow(value, {
        artifactPath,
        category,
        fixture: formatMetricFixture(pathParts),
        library,
        metricName,
        note: `lane=${rootLane}; source=${artifactPath}`,
      })
    );

    if (isMetricStatsObject(value.heapDeltaBytes)) {
      rows.push(
        normalizeMetricStatsRow(value.heapDeltaBytes, {
          artifactPath,
          category,
          fixture: `${formatMetricFixture(pathParts)}/heapDeltaBytes`,
          library,
          metricName: 'heapDeltaBytes',
          note: `lane=${rootLane}; source=${artifactPath}`,
        })
      );
    }
    return;
  }

  if (Array.isArray(value)) return;

  for (const [key, child] of Object.entries(value).sort(compareEntries)) {
    if (skipArtifactMetaKey(key)) continue;
    collectMetricStatsRows(child, {
      artifactPath,
      category,
      library,
      pathParts: [...pathParts, key],
      rows,
      rootLane,
    });
  }
}

const thresholdViolations = new Map([
  ['<', (value, limit) => value >= limit],
  ['<=', (value, limit) => value > limit],
  ['===', (value, limit) => value !== limit],
]);

const finiteNumber = (value) => (Number.isFinite(value) ? value : undefined);

function collectThresholdRows(payload, spec, { artifactPath, rows }) {
  const thresholds = payload.issueTargetThresholds;
  if (
    !thresholds ||
    typeof thresholds !== 'object' ||
    Array.isArray(thresholds)
  ) {
    return;
  }

  for (const [name, threshold] of Object.entries(thresholds).sort(
    compareEntries
  )) {
    if (
      !threshold ||
      typeof threshold !== 'object' ||
      Array.isArray(threshold)
    ) {
      continue;
    }

    const actualMs = finiteNumber(threshold.actualMs);
    const observed = actualMs ?? finiteNumber(threshold.actual);
    const limit = finiteNumber(threshold.limitMs ?? threshold.limit);
    const violates = thresholdViolations.get(threshold.operator);
    const violated =
      violates !== undefined &&
      observed !== undefined &&
      limit !== undefined &&
      violates(observed, limit);
    const row = {
      category: `${spec.category}-threshold`,
      fixture: name,
      library: spec.library || 'slate-v2:current',
      status: violated
        ? threshold.passed === true
          ? 'integrity-error'
          : 'over-budget'
        : 'unassessed',
      note: `source=${artifactPath}; operator=${threshold.operator ?? 'unrecorded'}; limitMs=${threshold.limitMs ?? 'n/a'}; limit=${threshold.limit ?? 'n/a'}; producer passed=${threshold.passed}`,
    };

    if (actualMs !== undefined) {
      row.medianUs = msToUs(actualMs);
      row.p95Us = msToUs(actualMs);
      row.ops = 1;
    } else if (observed !== undefined) {
      row.ops = observed;
    }

    rows.push(normalizeBenchmarkRow(row));
  }
}

function collectInvariantRows(payload, spec, { artifactPath, rows }) {
  const { lanes } = payload;
  if (!lanes || typeof lanes !== 'object' || Array.isArray(lanes)) return;

  for (const [laneName, lane] of Object.entries(lanes).sort(compareEntries)) {
    const invariants = lane?.invariants;
    if (
      !invariants ||
      typeof invariants !== 'object' ||
      Array.isArray(invariants)
    ) {
      continue;
    }

    for (const [name, passed] of Object.entries(invariants).sort(
      compareEntries
    )) {
      rows.push(
        normalizeBenchmarkRow({
          category: `${spec.category}-invariant`,
          fixture: `${laneName}/${name}`,
          library: spec.library || 'slate-v2:current',
          status: passed ? 'ok' : 'bad-result',
          ops: passed ? 1 : 0,
          note: `source=${artifactPath}`,
        })
      );
    }
  }
}

function normalizeMetricStatsRow(
  stats,
  { artifactPath, category, fixture, library, metricName, note }
) {
  const row = {
    category,
    fixture,
    library,
    status: 'ok',
    note: `${note}; samples=${readSampleCount(stats)}; metric=${metricName}; source=${artifactPath}`,
  };
  const median = readStatsMedian(stats);
  const p95 = readStatsP95(stats, median);

  if (isByteMetric(metricName, stats)) {
    row.bytes = Math.round(readByteMetricValue(metricName, median));
    row.ops = readSampleCount(stats);
  } else if (isTimeMetric(metricName)) {
    row.medianUs = msToUs(median);
    row.p95Us = msToUs(p95);
    row.ops = readSampleCount(stats);
  } else {
    row.ops = median;
  }

  return normalizeBenchmarkRow(row);
}

const editorOf = (library) => library.split(':')[0];

function readWorkloadCoverageStatus(
  target,
  workload,
  { localTargets, rowsBySpec, specs }
) {
  if (!localTargets.get(target.id)) {
    return {
      note: 'local source root missing',
      score: 0,
      status: 'missing-source',
    };
  }

  const claimed = workload.targets.filter((id) =>
    readEvidenceEditors(specs.get(id)).includes(target.id)
  );
  if (claimed.length === 0) {
    return {
      note: `no ${target.label} measurement is claimed for this workload`,
      score: 0,
      status: 'unsupported',
    };
  }

  const covering = claimed.filter((id) =>
    rowsBySpec
      .get(id)
      .some((row) => row.status === 'ok' && editorOf(row.library) === target.id)
  );
  if (covering.length > 0) {
    return {
      note: `current observations from ${covering.join(', ')}`,
      score: 1,
      status: 'ok',
    };
  }

  return {
    note: `no current observation: ${claimed
      .map((id) => `${id}=${rowsBySpec.get(id)[0].status}`)
      .join(', ')}`,
    score: 0,
    status: 'uncovered',
  };
}

function readEvidenceEditors(spec) {
  if (!spec) return [];
  if (['compare', 'rows', 'slate-legacy-compare'].includes(spec.kind)) {
    return ['slate-v2', 'slate'];
  }

  const libraries = spec.surfaceLibraries
    ? Object.values(spec.surfaceLibraries)
    : [spec.library || 'slate-v2:current'];

  return [...new Set(libraries.map(editorOf))];
}

function isMetricStatsObject(value) {
  return Boolean(
    value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    (Array.isArray(value.samples) ||
      Number.isFinite(Number(value.median)) ||
      Number.isFinite(Number(value.p50)) ||
      Number.isFinite(Number(value.mean))) &&
    (Number.isFinite(Number(value.median)) ||
      Number.isFinite(Number(value.p50)) ||
      Number.isFinite(Number(value.mean)))
  );
}

function skipArtifactMetaKey(key) {
  return [
    'artifactPaths',
    'artifactVersion',
    'benchmark',
    'config',
    'currentRepo',
    'deltaMeanMs',
    'issue',
    'issuePressure',
    'lane',
    'legacyRepo',
    'meta',
    'redFlags',
    'thresholdPolicy',
  ].includes(key);
}

function isTimeMetric(metricName) {
  return /(?:Ms|Duration)$/.test(metricName);
}

function isByteMetric(metricName, stats) {
  return /Bytes$|MB$/.test(metricName) || stats.unit === 'bytes';
}

function readByteMetricValue(metricName, value) {
  return metricName.endsWith('MB') ? value * 1024 * 1024 : value;
}

function readStatsMedian(stats) {
  for (const key of ['median', 'p50', 'mean']) {
    const value = Number(stats[key]);
    if (Number.isFinite(value)) return value;
  }

  throw new TypeError('stats object has no finite median, p50, or mean');
}

function readStatsP95(stats, median) {
  for (const key of ['p95', 'p99', 'max', 'mean']) {
    const value = Number(stats[key]);
    if (Number.isFinite(value)) return value;
  }

  return median;
}

function readSampleCount(stats) {
  return Array.isArray(stats.samples) ? stats.samples.length : 1;
}

function summarizeConfig(config) {
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    return 'default';
  }

  const parts = [];
  for (const key of [
    'blocks',
    'blockCount',
    'explicitBlocks',
    'insertBlocks',
    'insertOps',
    'typeOps',
    'remoteOps',
    'iterations',
  ]) {
    if (config[key] !== undefined) {
      parts.push(
        `${key}-${String(config[key]).replace(/[^a-z0-9.-]+/gi, '-')}`
      );
    }
  }

  return parts.length ? parts.join('/') : 'default';
}

function formatMetricFixture(pathParts) {
  return pathParts
    .filter((part) => part !== 'lanes' && part !== 'surfaces')
    .join('/');
}

function formatDeltaMean(deltaMeanMs, metricName) {
  const value = deltaMeanMs?.[metricName];
  return Number.isFinite(Number(value)) ? Number(value).toFixed(2) : 'n/a';
}

function findCommonSlateCompareMetricNames(surfaces) {
  const metricSets = slateLegacyCompareSurfaceOrder.map((surfaceName) => {
    const surface = surfaces[surfaceName];
    if (!surface || typeof surface !== 'object' || Array.isArray(surface)) {
      return new Set();
    }

    return new Set(
      Object.entries(surface)
        .filter(
          ([metricName, stats]) =>
            metricName.endsWith('Ms') &&
            isStatsObject(stats) &&
            Number.isFinite(Number(stats.median)) &&
            Number.isFinite(Number(stats.p95))
        )
        .map(([metricName]) => metricName)
    );
  });

  const [firstSet, ...remainingSets] = metricSets;
  if (!firstSet || firstSet.size === 0) return [];

  return [...firstSet]
    .filter((metricName) =>
      remainingSets.every((metricSet) => metricSet.has(metricName))
    )
    .sort(compareStrings);
}

function isStatsObject(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function describeSlateCompareSurface(surfaceName) {
  switch (surfaceName) {
    case 'legacyChunkOn': {
      return { library: 'slate', variant: '' };
    }
    case 'v2DefaultRenderAuto': {
      return { library: 'slate-v2', variant: 'default-render-auto' };
    }
    case 'v2DomPresent': {
      return { library: 'slate-v2', variant: 'dom-present' };
    }
    default: {
      return { library: 'unknown-editor', variant: surfaceName };
    }
  }
}

function msToUs(value) {
  return Number((requireFiniteNumber(value, 'milliseconds') * 1000).toFixed(3));
}

function readPositiveNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

function formatRepoLabel(value, rootDir) {
  if (typeof value !== 'string' || value.trim() === '') return 'unknown';
  const resolved = path.resolve(value);
  const relativePath = path.relative(rootDir, resolved);

  return relativePath || '.';
}

function sanitizeOutOfScopeFixtureLabel(value) {
  return String(value)
    .replaceAll('Lexical', 'External editor')
    .replaceAll('lexical', 'external-editor')
    .replaceAll('ProseMirror', 'External editor')
    .replaceAll('prosemirror', 'external-editor');
}

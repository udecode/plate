import fs from 'node:fs';
import path from 'node:path';

export const editorTargets = Object.freeze([
  {
    id: 'slate-v2',
    label: 'Slate v2',
    role: 'engine-and-react-runtime',
    sourcePath: '../../.tmp/slate-v2',
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
} = {}) {
  const resolvedPath = path.resolve(rootDir, registryPath);
  const payload = readJson(resolvedPath);
  const artifacts = Array.isArray(payload.artifacts) ? payload.artifacts : [];
  const workloads = Array.isArray(payload.workloads) ? payload.workloads : [];
  const runtimeAdapters = Array.isArray(payload.runtimeAdapters)
    ? payload.runtimeAdapters
    : [];
  const discardUnregistered = Array.isArray(payload.discardUnregistered)
    ? payload.discardUnregistered
    : [];

  return {
    artifacts: artifacts.map(normalizeRegistryArtifact),
    discardUnregistered: discardUnregistered.map((entry) => ({
      match: requireString(entry.match, 'discardUnregistered.match'),
      root: requireString(entry.root, 'discardUnregistered.root'),
    })),
    path: resolvedPath,
    policy:
      payload.policy && typeof payload.policy === 'object'
        ? { ...payload.policy }
        : {},
    runtimeAdapters: runtimeAdapters.map(normalizeRegistryRuntimeAdapter),
    version: Number(payload.version) || 1,
    workloads: workloads.map(normalizeRegistryWorkload),
  };
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
  const spec = {
    ...(registeredSpec || {
      category: 'slate-react-huge-document-legacy-compare',
      id: 'react-huge-document-legacy-compare',
      kind: 'slate-legacy-compare',
      required: true,
    }),
    ...(artifactPath ? { path: artifactPath } : {}),
  };

  return createBenchmarkArtifactRows(spec, { rootDir });
}

export function createRichTextEditorBenchmarkRows({
  registry,
  registryPath,
  rootDir = process.cwd(),
} = {}) {
  const benchmarkRegistry =
    registry || readBenchmarkRegistry({ registryPath, rootDir });
  const rows = [
    ...createRichTextEditorCoverageRows({
      registry: benchmarkRegistry,
      rootDir,
    }),
  ];

  for (const spec of benchmarkRegistry.artifacts) {
    rows.push(...createBenchmarkArtifactRows(spec, { rootDir }));
  }

  return rows;
}

export function createRichTextEditorCoverageRows({
  registry,
  registryPath,
  rootDir = process.cwd(),
} = {}) {
  const benchmarkRegistry =
    registry || readBenchmarkRegistry({ registryPath, rootDir });
  const artifactSpecs = benchmarkRegistry.artifacts;
  const workloads = benchmarkRegistry.workloads;
  const localTargets = new Map(
    editorTargets.map((target) => [
      target.id,
      fs.existsSync(path.resolve(rootDir, target.sourcePath)),
    ])
  );
  const measuredArtifacts = new Set(
    artifactSpecs
      .filter((spec) => fs.existsSync(path.resolve(rootDir, spec.path)))
      .map((spec) => spec.id)
  );
  const measuredSlateV2 = new Set(
    artifactSpecs
      .filter((spec) => spec.owner === 'slate-v2')
      .filter((spec) => measuredArtifacts.has(spec.id))
      .map((spec) => spec.id)
  );
  const runtimeAdapterCoverage = createRuntimeAdapterCoverageMap({
    measuredArtifacts,
    registry: benchmarkRegistry,
  });
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
        measuredSlateV2,
        runtimeAdapterCoverage,
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

export function createBenchmarkArtifactRows(
  spec,
  { rootDir = process.cwd() } = {}
) {
  const resolvedPath = path.resolve(rootDir, spec.path);
  const relativeArtifactPath = path.relative(rootDir, resolvedPath);

  if (!fs.existsSync(resolvedPath)) {
    return [
      normalizeBenchmarkRow({
        category: spec.category,
        fixture: spec.id,
        library: spec.library || 'slate-v2',
        status: spec.required
          ? 'missing-artifact'
          : 'optional-missing-artifact',
        note: `missing artifact ${relativeArtifactPath}`,
      }),
    ];
  }

  const payload = readJson(resolvedPath);
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
      normalizeBenchmarkRow({
        category: spec.category,
        fixture: spec.id,
        library: spec.library || 'slate-v2',
        status: 'missing-metrics',
        note: `artifact ${relativeArtifactPath} did not expose metric stats`,
      }),
    ];
  }

  return rows;
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
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function requireString(value, name) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new TypeError(`${name} must be a non-empty string`);
  }

  return value;
}

function normalizeRegistryArtifact(artifact) {
  if (!artifact || typeof artifact !== 'object' || Array.isArray(artifact)) {
    throw new TypeError('registry artifact must be an object');
  }

  const normalized = {
    category: requireString(artifact.category, 'artifact.category'),
    command: artifact.command ? String(artifact.command) : '',
    cwd: artifact.cwd ? String(artifact.cwd) : '',
    decision: artifact.decision ? String(artifact.decision) : '',
    family: artifact.family ? String(artifact.family) : '',
    id: requireString(artifact.id, 'artifact.id'),
    kind: requireString(artifact.kind, 'artifact.kind'),
    owner: artifact.owner ? String(artifact.owner) : '',
    path: requireString(artifact.path, 'artifact.path'),
    required: artifact.required !== false,
  };

  if (artifact.library !== undefined)
    normalized.library = String(artifact.library);
  if (artifact.surfaceLibraries !== undefined) {
    normalized.surfaceLibraries = artifact.surfaceLibraries;
  }

  return normalized;
}

function normalizeRegistryWorkload(workload) {
  if (!workload || typeof workload !== 'object' || Array.isArray(workload)) {
    throw new TypeError('registry workload must be an object');
  }

  return {
    artifactIds: Array.isArray(workload.artifactIds)
      ? workload.artifactIds.map(String)
      : [],
    id: requireString(workload.id, 'workload.id'),
    legacy: Boolean(workload.legacy),
    slateV2: Boolean(workload.slateV2),
    workload: requireString(workload.workload, 'workload.workload'),
  };
}

function normalizeRegistryRuntimeAdapter(adapter) {
  if (!adapter || typeof adapter !== 'object' || Array.isArray(adapter)) {
    throw new TypeError('registry runtime adapter must be an object');
  }

  return {
    artifactIds: Array.isArray(adapter.artifactIds)
      ? adapter.artifactIds.map(String)
      : [],
    decision: adapter.decision ? String(adapter.decision) : '',
    target: requireString(adapter.target, 'runtimeAdapter.target'),
    workloadIds: Array.isArray(adapter.workloadIds)
      ? adapter.workloadIds.map(String)
      : [],
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
    if (!bucket || typeof bucket !== 'object' || Array.isArray(bucket))
      continue;

    const library = side === 'current' ? 'slate-v2:current' : 'slate:baseline';
    const repo = side === 'current' ? currentRepo : legacyRepo;

    for (const [metricName, stats] of Object.entries(bucket).sort()) {
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

  for (const [surfaceName, surface] of Object.entries(surfaces).sort()) {
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
    const metricName = pathParts[pathParts.length - 1] || 'metric';
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

  for (const [key, child] of Object.entries(value).sort()) {
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

function collectThresholdRows(payload, spec, { artifactPath, rows }) {
  const thresholds = payload.issueTargetThresholds;
  if (
    !thresholds ||
    typeof thresholds !== 'object' ||
    Array.isArray(thresholds)
  )
    return;

  for (const [name, threshold] of Object.entries(thresholds).sort()) {
    if (!threshold || typeof threshold !== 'object' || Array.isArray(threshold))
      continue;

    const actualMs = Number(threshold.actualMs);
    const actual = Number(threshold.actual);
    const row = {
      category: `${spec.category}-threshold`,
      fixture: name,
      library: spec.library || 'slate-v2:current',
      status: threshold.passed ? 'ok' : 'over-budget',
      note: `source=${artifactPath}; limitMs=${threshold.limitMs ?? 'n/a'}; limit=${threshold.limit ?? 'n/a'}`,
    };

    if (Number.isFinite(actualMs)) {
      row.medianUs = msToUs(actualMs);
      row.p95Us = msToUs(actualMs);
      row.ops = 1;
    } else if (Number.isFinite(actual)) {
      row.ops = actual;
    }

    rows.push(normalizeBenchmarkRow(row));
  }
}

function collectInvariantRows(payload, spec, { artifactPath, rows }) {
  const lanes = payload.lanes;
  if (!lanes || typeof lanes !== 'object' || Array.isArray(lanes)) return;

  for (const [laneName, lane] of Object.entries(lanes).sort()) {
    const invariants = lane?.invariants;
    if (
      !invariants ||
      typeof invariants !== 'object' ||
      Array.isArray(invariants)
    )
      continue;

    for (const [name, passed] of Object.entries(invariants).sort()) {
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

function readWorkloadCoverageStatus(
  target,
  workload,
  { localTargets, measuredSlateV2, runtimeAdapterCoverage }
) {
  if (!localTargets.get(target.id)) {
    return {
      note: 'local source root missing',
      score: 0,
      status: 'missing-source',
    };
  }

  if (target.id === 'slate-v2') {
    const artifactIds =
      workload.artifactIds && workload.artifactIds.length > 0
        ? workload.artifactIds
        : [workload.id];
    const measuredByRegistry = artifactIds.some((artifactId) =>
      measuredSlateV2.has(artifactId)
    );

    return {
      note: workload.slateV2
        ? `measured by ${measuredByRegistry ? 'registered artifact' : 'registered artifact family'}`
        : 'not a Slate v2 workload',
      score: workload.slateV2 ? 1 : 0,
      status: workload.slateV2 ? 'ok' : 'unsupported',
    };
  }

  if (target.id === 'slate') {
    return {
      note: workload.legacy
        ? 'measured as Slate baseline where artifact supports Slate v2 vs Slate compare'
        : 'Slate v2-only workload; no Slate baseline is claimed',
      score: workload.legacy ? 1 : 0,
      status: workload.legacy ? 'ok' : 'unsupported',
    };
  }

  const runtimeAdapter = runtimeAdapterCoverage.get(
    `${target.id}:${workload.id}`
  );
  if (runtimeAdapter) {
    return {
      note:
        `measured by runtime adapter ${runtimeAdapter.artifactIds.join(', ')}; ` +
        runtimeAdapter.decision,
      score: 1,
      status: 'ok',
    };
  }

  return {
    note: 'source exists, but equivalent runtime adapter is not implemented yet',
    score: 0,
    status: 'adapter-missing',
  };
}

function createRuntimeAdapterCoverageMap({ measuredArtifacts, registry }) {
  const coverage = new Map();

  for (const adapter of registry.runtimeAdapters || []) {
    const measuredAdapterArtifacts = adapter.artifactIds.filter((artifactId) =>
      measuredArtifacts.has(artifactId)
    );
    if (measuredAdapterArtifacts.length === 0) continue;

    for (const workloadId of adapter.workloadIds) {
      coverage.set(`${adapter.target}:${workloadId}`, {
        artifactIds: measuredAdapterArtifacts,
        decision: adapter.decision,
      });
    }
  }

  return coverage;
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
  return /MB$/.test(metricName) ? value * 1024 * 1024 : value;
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
    .sort();
}

function isStatsObject(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function describeSlateCompareSurface(surfaceName) {
  switch (surfaceName) {
    case 'legacyChunkOn':
      return { library: 'slate', variant: '' };
    case 'v2DefaultRenderAuto':
      return { library: 'slate-v2', variant: 'default-render-auto' };
    case 'v2DomPresent':
      return { library: 'slate-v2', variant: 'dom-present' };
    default:
      return { library: 'unknown-editor', variant: surfaceName };
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
    .replaceAll('lexical', 'external-editor');
}

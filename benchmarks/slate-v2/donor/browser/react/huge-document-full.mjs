import { spawn } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import { readFile } from 'node:fs/promises';

import { round, writeBenchmarkArtifact } from '../../shared/stats.mjs';

const smoke = process.env.HUGE_DOC_FULL_SMOKE === '1';
const includeLegacyBrowserTrace =
  process.env.HUGE_DOC_FULL_INCLUDE_LEGACY_BROWSER_TRACE === '1';
const legacyRepo = process.env.HUGE_DOC_FULL_LEGACY_REPO || '../../../slate';

const blocks = Number(process.env.HUGE_DOC_FULL_BLOCKS || (smoke ? 20 : 5000));
const iterations = Number(
  process.env.HUGE_DOC_FULL_ITERATIONS || (smoke ? 1 : 5)
);
const coreIterations = Number(
  process.env.HUGE_DOC_FULL_CORE_ITERATIONS ||
    (smoke ? 1 : Math.max(iterations, 10))
);
const traceIterations = Number(
  process.env.HUGE_DOC_FULL_TRACE_ITERATIONS || iterations
);
const typeOps = Number(process.env.HUGE_DOC_FULL_TYPE_OPS || (smoke ? 3 : 10));
const overlayBlocks = Number(
  process.env.HUGE_DOC_FULL_OVERLAY_BLOCKS || (smoke ? 40 : blocks)
);
const overlayIslandSize = Number(
  process.env.HUGE_DOC_FULL_OVERLAY_ISLAND_SIZE || (smoke ? 10 : 32)
);
const skipBrowserBuild = process.env.HUGE_DOC_FULL_SKIP_BROWSER_BUILD === '1';
const strictBudget = process.env.HUGE_DOC_FULL_STRICT_BUDGET === '1';

const latestArtifactPath = 'tmp/slate-react-huge-document-full-benchmark.json';
const runArtifactPath = `${[
  'tmp/slate-react-huge-document-full-benchmark',
  `blocks-${blocks}`,
  `iters-${iterations}`,
  `trace-iters-${traceIterations}`,
  `ops-${typeOps}`,
  smoke ? 'smoke' : 'full',
].join('-')}.json`;
const browserTraceLatestArtifactPath =
  'tmp/slate-react-huge-document-browser-trace-benchmark.json';

const childLinePattern = /^[a-zA-Z][\w-]*: /;
const lineBreakPattern = /\r?\n/;
const nativeSurfacePattern = /^nativeSurface /;
const surfaceHeaderPattern = /^[a-zA-Z][\w-]* \([^)]*\)$/;

const stringifyEnv = (env) =>
  Object.fromEntries(
    Object.entries(env).map(([key, value]) => [key, String(value)])
  );

const rememberTail = (tail, line) => {
  tail.push(line);

  if (tail.length > 80) {
    tail.shift();
  }
};

const shouldEchoChildLine = (line) =>
  line.startsWith('METRIC ') ||
  line.startsWith('Wrote ') ||
  line.startsWith('huge-document ') ||
  nativeSurfacePattern.test(line) ||
  surfaceHeaderPattern.test(line) ||
  childLinePattern.test(line);

const pipeChildOutput = ({ stream, tail, writeLine }) => {
  let buffer = '';

  stream.setEncoding('utf8');
  stream.on('data', (chunk) => {
    buffer += chunk;
    const lines = buffer.split(lineBreakPattern);

    buffer = lines.pop() ?? '';

    for (const line of lines) {
      rememberTail(tail, line);

      if (shouldEchoChildLine(line)) {
        writeLine(line);
      }
    }
  });

  stream.on('end', () => {
    if (!buffer) {
      return;
    }

    rememberTail(tail, buffer);

    if (shouldEchoChildLine(buffer)) {
      writeLine(buffer);
    }
  });
};

const runStep = (step) =>
  new Promise((resolve) => {
    const start = performance.now();
    const stderrTail = [];
    const stdoutTail = [];
    let settled = false;

    console.log(`\n== ${step.id} ==`);
    console.log(step.command);

    if (step.artifactPath) {
      rmSync(step.artifactPath, { force: true });
    }

    const child = spawn('sh', ['-lc', step.command], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        ...stringifyEnv(step.env ?? {}),
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    pipeChildOutput({
      stream: child.stdout,
      tail: stdoutTail,
      writeLine: (line) => console.log(line),
    });
    pipeChildOutput({
      stream: child.stderr,
      tail: stderrTail,
      writeLine: (line) => console.error(line),
    });

    child.once('error', (error) => {
      if (settled) {
        return;
      }

      settled = true;
      resolve({
        ...step,
        durationMs: round(performance.now() - start),
        error: error.message,
        exitCode: 1,
        stderrTail,
        stdoutTail,
      });
    });

    child.once('close', async (code) => {
      if (settled) {
        return;
      }

      settled = true;
      const result = {
        ...step,
        durationMs: round(performance.now() - start),
        exitCode: code ?? 1,
        stderrTail,
        stdoutTail,
      };

      result.artifact = await readArtifact(step.artifactPath);
      result.summary = summarizeStepArtifact(step.id, result.artifact?.json);

      if (
        result.exitCode !== 0 ||
        !result.artifact?.exists ||
        result.artifact?.parseError
      ) {
        console.error(`\n${step.id} failed; recent output:`);
        console.error([...stdoutTail, ...stderrTail].slice(-80).join('\n'));
      }

      resolve(result);
    });
  });

const readArtifact = async (path) => {
  if (!path || !existsSync(path)) {
    return {
      exists: false,
      path,
    };
  }

  try {
    return {
      exists: true,
      json: JSON.parse(await readFile(path, 'utf8')),
      path,
    };
  } catch (error) {
    return {
      exists: true,
      parseError: error.message,
      path,
    };
  }
};

const statValue = (summary, statName) => {
  const value = summary?.[statName];

  return Number.isFinite(value) ? value : null;
};

const p95 = (stat) => statValue(stat, 'p95');
const p75 = (stat) => statValue(stat, 'p75');

const formatStatName = (statName) =>
  `${statName[0].toUpperCase()}${statName.slice(1)}`;

const sampleCountAbove = (samples, threshold) =>
  Array.isArray(samples) && Number.isFinite(threshold)
    ? samples.filter((sample) => Number.isFinite(sample) && sample > threshold)
        .length
    : null;

const maxFinite = (values) => {
  const finiteValues = values.filter(Number.isFinite);

  return finiteValues.length === 0 ? null : Math.max(...finiteValues);
};

const ratioRows = ({ current, legacy }) =>
  Object.entries(current ?? {}).flatMap(([laneName, currentLane]) => {
    const currentP95 = p95(currentLane);
    const legacyP95 = p95(legacy?.[laneName]);

    if (!currentP95 || !legacyP95) {
      return [];
    }

    return [
      {
        currentMaxMs: statValue(currentLane, 'max'),
        currentMedianMs: statValue(currentLane, 'median'),
        currentP75Ms: statValue(currentLane, 'p75'),
        currentP95Ms: currentP95,
        currentP99Ms: statValue(currentLane, 'p99'),
        currentSamples: Array.isArray(currentLane?.samples)
          ? currentLane.samples
          : [],
        laneName,
        legacyMaxMs: statValue(legacy?.[laneName], 'max'),
        legacyMedianMs: statValue(legacy?.[laneName], 'median'),
        legacyP75Ms: statValue(legacy?.[laneName], 'p75'),
        legacyP95Ms: legacyP95,
        legacyP99Ms: statValue(legacy?.[laneName], 'p99'),
        ratio: round(currentP95 / legacyP95),
      },
    ];
  });

const summarizeCoreCompare = (artifact) => {
  const rows = ratioRows({
    current: artifact?.current,
    legacy: artifact?.legacy,
  });
  const worst = rows.reduce(
    (winner, row) => (!winner || row.ratio > winner.ratio ? row : winner),
    null
  );

  return {
    blocks: artifact?.config?.blocks ?? null,
    lanes: rows,
    worstP95Ratio: worst?.ratio ?? null,
    worstP95RatioLane: worst?.laneName ?? null,
  };
};

const summarizeLegacyCompare = (artifact) => {
  const legacy = artifact?.surfaces?.legacyChunkOn;
  const comparableProductLanes = [
    'readyMs',
    'middleBlockTypeMs',
    'middleBlockSelectThenTypeMs',
    'replaceFullDocumentWithTextMs',
    'insertFragmentFullDocumentMs',
  ];
  const v2OnlyProductLanes = ['middleBlockPromoteThenTypeMs'];
  const rows = ['v2DefaultRenderAuto', 'v2DomPresent'].flatMap((surfaceName) =>
    comparableProductLanes.flatMap((laneName) => {
      const currentP95 = p95(artifact?.surfaces?.[surfaceName]?.[laneName]);
      const legacyP95 = p95(legacy?.[laneName]);

      if (!currentP95 || !legacyP95) {
        return [];
      }

      return [
        {
          currentP95Ms: currentP95,
          laneName,
          legacyP95Ms: legacyP95,
          ratio: round(currentP95 / legacyP95),
          surfaceName,
        },
      ];
    })
  );
  const v2OnlyRows = ['v2DefaultRenderAuto', 'v2DomPresent'].flatMap(
    (surfaceName) =>
      v2OnlyProductLanes.flatMap((laneName) => {
        const currentP95 = p95(artifact?.surfaces?.[surfaceName]?.[laneName]);

        if (!currentP95) {
          return [];
        }

        return [
          {
            currentP95Ms: currentP95,
            laneName,
            surfaceName,
          },
        ];
      })
  );
  const partialDOMPromotionThenType = v2OnlyRows.find(
    (row) =>
      row.surfaceName === 'v2DefaultRenderAuto' &&
      row.laneName === 'middleBlockPromoteThenTypeMs'
  );
  const worst = rows.reduce(
    (winner, row) => (!winner || row.ratio > winner.ratio ? row : winner),
    null
  );

  return {
    blocks: artifact?.config?.blocks ?? null,
    lanes: rows,
    partialDOMPromotionThenTypeP95Ms:
      partialDOMPromotionThenType?.currentP95Ms ?? null,
    v2OnlyLanes: v2OnlyRows,
    worstP95Ratio: worst?.ratio ?? null,
    worstP95RatioLane: worst?.laneName ?? null,
    worstP95RatioSurface: worst?.surfaceName ?? null,
  };
};

const browserLaneRows = (artifact) =>
  Object.entries(artifact?.surfaces ?? {}).flatMap(([surfaceName, surface]) =>
    Object.entries(surface.lanes ?? {}).map(([laneName, lane]) => ({
      domNodesP95: p95(lane.domTags?.domNodeCount),
      editorElementsP95: p95(lane.domTags?.editorElementCount),
      editorTextNodesP95: p95(lane.domTags?.editorTextNodeCount),
      burstToPaintP95Ms: p95(lane.burstToPaintMs),
      burstToPaintPerOpP95Ms: p95(lane.burstToPaintPerOpMs),
      clickToPaintP95Ms: p95(lane.clickToPaintMs),
      clickToSelectionReadyP95Ms: p95(lane.clickToSelectionReadyMs),
      coreNotifyListenersCountP95: p95(
        lane.profiler?.['core-time:notify-listeners']?.count
      ),
      coreNotifyListenersP95Ms: p95(
        lane.profiler?.['core-time:notify-listeners']?.durationMs
      ),
      coreNotifyCommitListenersP95Ms: p95(
        lane.profiler?.['core-time:notify-commit-listeners']?.durationMs
      ),
      coreNotifyExtensionCommitListenersP95Ms: p95(
        lane.profiler?.['core-time:notify-extension-commit-listeners']
          ?.durationMs
      ),
      coreNotifySnapshotListenersP95Ms: p95(
        lane.profiler?.['core-time:notify-snapshot-listeners']?.durationMs
      ),
      coreNotifySourceListenersP95Ms: p95(
        lane.profiler?.['core-time:notify-source-listeners']?.durationMs
      ),
      coreListenerSnapshotP95Ms: p95(
        lane.profiler?.['core-time:listener-snapshot']?.durationMs
      ),
      heapMBP95: p95(lane.domTags?.jsHeapUsedMB),
      laneName,
      longTaskMaxP95Ms: p95(lane.longTaskMaxMs),
      materializedSelectionReadyP95Ms: p95(lane.materializedSelectReadyMs),
      materializedSelectToPaintP95Ms: p95(lane.materializedSelectMs),
      materializedSelectMaterializationFramesP95: p95(
        lane.materializedSelectMaterializationFrames
      ),
      materializedSelectMaterializationScrollDeltaP95: p95(
        lane.materializedSelectMaterializationScrollDelta
      ),
      modelBurstToPaintPerOpP95Ms: p95(lane.modelBurstToPaintPerOpMs),
      modelTypeToPaintP95Ms: p95(lane.modelTypeToPaintMs),
      modelTypeToReadyP95Ms: p95(lane.modelTypeToReadyMs),
      selectionReadyP95Ms: p95(lane.selectReadyMs),
      selectMaterializationFramesP95: p95(lane.selectMaterializationFrames),
      selectMaterializationScrollDeltaP95: p95(
        lane.selectMaterializationScrollDelta
      ),
      selectToPaintP95Ms: p95(lane.selectMs),
      interactionSequenceToPaintP95Ms: p95(lane.interactionSequenceToPaintMs),
      selectorDispatchP95Ms: p95(
        lane.profiler?.['runtime-time:selector-dispatch']?.durationMs
      ),
      selectorDispatchCountP95: p95(
        lane.profiler?.['runtime-time:selector-dispatch']?.count
      ),
      selectorCheckCountP95: p95(
        lane.profiler?.['selector:selector-dispatch-checks']?.count
      ),
      selectorNotifyCountP95: p95(
        lane.profiler?.['selector:selector-dispatch-notifies']?.count
      ),
      selectorSubscriptionCountP95: p95(
        lane.profiler?.['selector:selector-dispatch-subscriptions']?.count
      ),
      surfaceName,
      typeToPaintP95Ms: p95(lane.typeToPaintMs),
    }))
  );

const summarizeBrowserTrace = (artifact) => {
  const lanes = browserLaneRows(artifact);
  const domNodesP95BySurface = Object.fromEntries(
    Object.entries(artifact?.surfaces ?? {}).map(([surfaceName, surface]) => [
      surfaceName,
      maxFinite(
        Object.values(surface.lanes ?? {}).map((lane) =>
          p95(lane.domTags?.domNodeCount)
        )
      ),
    ])
  );
  const editorElementsP95BySurface = Object.fromEntries(
    Object.entries(artifact?.surfaces ?? {}).map(([surfaceName, surface]) => [
      surfaceName,
      maxFinite(
        Object.values(surface.lanes ?? {}).map((lane) =>
          p95(lane.domTags?.editorElementCount)
        )
      ),
    ])
  );
  const editorTextNodesP95BySurface = Object.fromEntries(
    Object.entries(artifact?.surfaces ?? {}).map(([surfaceName, surface]) => [
      surfaceName,
      maxFinite(
        Object.values(surface.lanes ?? {}).map((lane) =>
          p95(lane.domTags?.editorTextNodeCount)
        )
      ),
    ])
  );

  return {
    blocks: artifact?.meta?.blocks ?? null,
    domNodesP95: maxFinite(lanes.map((lane) => lane.domNodesP95)),
    domNodesP95BySurface,
    editorElementsP95: maxFinite(lanes.map((lane) => lane.editorElementsP95)),
    editorElementsP95BySurface,
    editorTextNodesP95: maxFinite(lanes.map((lane) => lane.editorTextNodesP95)),
    editorTextNodesP95BySurface,
    burstToPaintP95Ms: maxFinite(lanes.map((lane) => lane.burstToPaintP95Ms)),
    burstToPaintPerOpP95Ms: maxFinite(
      lanes.map((lane) => lane.burstToPaintPerOpP95Ms)
    ),
    clickToPaintP95Ms: maxFinite(lanes.map((lane) => lane.clickToPaintP95Ms)),
    clickToSelectionReadyP95Ms: maxFinite(
      lanes.map((lane) => lane.clickToSelectionReadyP95Ms)
    ),
    coreNotifyListenersCountP95: maxFinite(
      lanes.map((lane) => lane.coreNotifyListenersCountP95)
    ),
    coreNotifyListenersP95Ms: maxFinite(
      lanes.map((lane) => lane.coreNotifyListenersP95Ms)
    ),
    coreNotifyCommitListenersP95Ms: maxFinite(
      lanes.map((lane) => lane.coreNotifyCommitListenersP95Ms)
    ),
    coreNotifyExtensionCommitListenersP95Ms: maxFinite(
      lanes.map((lane) => lane.coreNotifyExtensionCommitListenersP95Ms)
    ),
    coreNotifySnapshotListenersP95Ms: maxFinite(
      lanes.map((lane) => lane.coreNotifySnapshotListenersP95Ms)
    ),
    coreNotifySourceListenersP95Ms: maxFinite(
      lanes.map((lane) => lane.coreNotifySourceListenersP95Ms)
    ),
    coreListenerSnapshotP95Ms: maxFinite(
      lanes.map((lane) => lane.coreListenerSnapshotP95Ms)
    ),
    heapMBP95: maxFinite(lanes.map((lane) => lane.heapMBP95)),
    lanes,
    longTaskMaxP95Ms: maxFinite(lanes.map((lane) => lane.longTaskMaxP95Ms)),
    materializedSelectionReadyP95Ms: maxFinite(
      lanes.map((lane) => lane.materializedSelectionReadyP95Ms)
    ),
    materializedSelectToPaintP95Ms: maxFinite(
      lanes.map((lane) => lane.materializedSelectToPaintP95Ms)
    ),
    materializedSelectMaterializationFramesP95: maxFinite(
      lanes.map((lane) => lane.materializedSelectMaterializationFramesP95)
    ),
    materializedSelectMaterializationScrollDeltaP95: maxFinite(
      lanes.map((lane) => lane.materializedSelectMaterializationScrollDeltaP95)
    ),
    modelBurstToPaintPerOpP95Ms: maxFinite(
      lanes.map((lane) => lane.modelBurstToPaintPerOpP95Ms)
    ),
    modelTypeToPaintP95Ms: maxFinite(
      lanes.map((lane) => lane.modelTypeToPaintP95Ms)
    ),
    modelTypeToReadyP95Ms: maxFinite(
      lanes.map((lane) => lane.modelTypeToReadyP95Ms)
    ),
    selectionReadyP95Ms: maxFinite(
      lanes.map((lane) => lane.selectionReadyP95Ms)
    ),
    selectMaterializationFramesP95: maxFinite(
      lanes.map((lane) => lane.selectMaterializationFramesP95)
    ),
    selectMaterializationScrollDeltaP95: maxFinite(
      lanes.map((lane) => lane.selectMaterializationScrollDeltaP95)
    ),
    selectToPaintP95Ms: maxFinite(lanes.map((lane) => lane.selectToPaintP95Ms)),
    selectorDispatchP95Ms: maxFinite(
      lanes.map((lane) => lane.selectorDispatchP95Ms)
    ),
    selectorDispatchCountP95: maxFinite(
      lanes.map((lane) => lane.selectorDispatchCountP95)
    ),
    selectorCheckCountP95: maxFinite(
      lanes.map((lane) => lane.selectorCheckCountP95)
    ),
    selectorNotifyCountP95: maxFinite(
      lanes.map((lane) => lane.selectorNotifyCountP95)
    ),
    selectorSubscriptionCountP95: maxFinite(
      lanes.map((lane) => lane.selectorSubscriptionCountP95)
    ),
    nativeSurfaceTimeoutCount: Object.values(artifact?.surfaces ?? {}).reduce(
      (total, surface) => total + (surface.nativeSurface?.timeoutCount ?? 0),
      0
    ),
    typeToPaintP95Ms: maxFinite(lanes.map((lane) => lane.typeToPaintP95Ms)),
  };
};

const summarizeOverlays = (artifact) => ({
  activeEditP95Ms: p95(artifact?.activeEditAfterOverlay?.editMs),
  blocks: artifact?.config?.blockCount ?? null,
  overlayToggleP95Ms: p95(artifact?.overlayToggle?.overlayToggleMs),
  partialDOMPromotionColdP95Ms: p95(
    artifact?.partialDOMPromotion?.coldPromotionMs
  ),
  partialDOMPromotionSteadyP75Ms: p75(
    artifact?.partialDOMPromotion?.promotionMs
  ),
  partialDOMPromotionSteadyP95Ms: p95(
    artifact?.partialDOMPromotion?.promotionMs
  ),
  partialDOMPromotionTextAfterP95: p95(
    artifact?.partialDOMPromotion?.mountedTextAfter
  ),
});

const summarizeStepArtifact = (id, artifact) => {
  if (!artifact) {
    return null;
  }

  if (id === 'core-huge-document-compare') {
    return summarizeCoreCompare(artifact);
  }
  if (id === 'react-huge-document-legacy-compare') {
    return summarizeLegacyCompare(artifact);
  }
  if (
    id === 'react-huge-document-browser-trace' ||
    id === 'react-huge-document-staged-diagnostic-trace' ||
    id === 'react-huge-document-virtualized-type-to-paint' ||
    id === 'react-huge-document-slate-browser-trace'
  ) {
    return summarizeBrowserTrace(artifact);
  }
  if (id === 'react-huge-document-overlays') {
    return summarizeOverlays(artifact);
  }

  return null;
};

const diagnosticBudgetMetadata = {
  diagnostic: true,
  owner: 'staged-full-dom-debt',
  reason:
    'Measured for honesty, but not a strict promotion gate until staged/full-DOM correctness is promoted.',
};

const metricBudgetRows = (stepResults) => {
  const byId = Object.fromEntries(stepResults.map((step) => [step.id, step]));
  const rows = [];
  const add = ({ budget, metric, value, ...metadata }) => {
    if (!Number.isFinite(value)) {
      return;
    }

    rows.push({
      budget,
      metric,
      ...metadata,
      ratio: round(value / budget),
      value: round(value),
    });
  };
  const coreLaneBudgets = {
    insertFragmentFullDocumentMs: { budget: 50, stat: 'p95' },
    middleBlockTypeMs: { budget: 5, stat: 'p75' },
    replaceFullDocumentWithTextMs: { budget: 50, stat: 'p95' },
    selectAllMs: { budget: 5, stat: 'p75' },
    startBlockTypeMs: { budget: 5, stat: 'p75' },
  };

  for (const lane of byId['core-huge-document-compare']?.summary?.lanes ?? []) {
    const config = coreLaneBudgets[lane.laneName];

    if (!config) {
      continue;
    }

    const statLabel = formatStatName(config.stat);

    add({
      budget: config.budget,
      metric: `core.${lane.laneName}.current${statLabel}Ms`,
      overBudgetSampleCount: sampleCountAbove(
        lane.currentSamples,
        config.budget
      ),
      rawP95Ms: lane.currentP95Ms,
      stat: config.stat,
      value: lane[`current${statLabel}Ms`],
    });
  }

  if (!smoke) {
    add({
      budget: 1.5,
      metric: 'legacyCompareWorstP95Ratio',
      value: byId['react-huge-document-legacy-compare']?.summary?.worstP95Ratio,
    });
  }
  add({
    budget: 100,
    metric: 'legacyComparePartialDOMPromotionThenTypeP95Ms',
    ...diagnosticBudgetMetadata,
    value:
      byId['react-huge-document-legacy-compare']?.summary
        ?.partialDOMPromotionThenTypeP95Ms,
  });
  add({
    budget: 75,
    metric: 'browserTraceTypeToPaintP95Ms',
    value: byId['react-huge-document-browser-trace']?.summary?.typeToPaintP95Ms,
  });
  add({
    budget: 75,
    metric: 'virtualizedTypeToPaintP95Ms',
    value:
      byId['react-huge-document-virtualized-type-to-paint']?.summary
        ?.typeToPaintP95Ms,
  });
  add({
    budget: 1200,
    metric: 'browserTraceDomNodesP95',
    value: byId['react-huge-document-browser-trace']?.summary?.domNodesP95,
  });
  add({
    budget: 400,
    metric: 'virtualizedEditorElementsP95',
    value:
      byId['react-huge-document-virtualized-type-to-paint']?.summary
        ?.editorElementsP95,
  });
  add({
    budget: 1500,
    metric: 'virtualizedDocumentDomNodesP95',
    diagnostic: true,
    owner: 'browser-chrome-dom-budget',
    reason:
      'Full-document DOM includes page/app shell; virtualizedEditorElementsP95 is the strict editor-owned DOM budget.',
    value:
      byId['react-huge-document-virtualized-type-to-paint']?.summary
        ?.domNodesP95,
  });
  add({
    budget: 200,
    metric: 'browserTraceSelectToPaintP95Ms',
    value:
      byId['react-huge-document-browser-trace']?.summary?.selectToPaintP95Ms,
  });
  add({
    budget: 100,
    metric: 'browserTraceSelectionReadyP95Ms',
    value:
      byId['react-huge-document-browser-trace']?.summary?.selectionReadyP95Ms,
  });
  add({
    budget: 75,
    metric: 'browserTraceMaterializedSelectToPaintP95Ms',
    value:
      byId['react-huge-document-browser-trace']?.summary
        ?.materializedSelectToPaintP95Ms,
  });
  add({
    budget: 50,
    metric: 'browserTraceMaterializedSelectionReadyP95Ms',
    value:
      byId['react-huge-document-browser-trace']?.summary
        ?.materializedSelectionReadyP95Ms,
  });
  add({
    budget: 100,
    metric: 'browserTraceClickToPaintP95Ms',
    value:
      byId['react-huge-document-browser-trace']?.summary?.clickToPaintP95Ms,
  });
  add({
    budget: 75,
    metric: 'browserTraceClickToSelectionReadyP95Ms',
    value:
      byId['react-huge-document-browser-trace']?.summary
        ?.clickToSelectionReadyP95Ms,
  });
  add({
    budget: 200,
    metric: 'virtualizedSelectToPaintP95Ms',
    value:
      byId['react-huge-document-virtualized-type-to-paint']?.summary
        ?.selectToPaintP95Ms,
  });
  add({
    budget: 100,
    metric: 'virtualizedSelectionReadyP95Ms',
    value:
      byId['react-huge-document-virtualized-type-to-paint']?.summary
        ?.selectionReadyP95Ms,
  });
  add({
    budget: 75,
    metric: 'virtualizedMaterializedSelectToPaintP95Ms',
    value:
      byId['react-huge-document-virtualized-type-to-paint']?.summary
        ?.materializedSelectToPaintP95Ms,
  });
  add({
    budget: 50,
    metric: 'virtualizedMaterializedSelectionReadyP95Ms',
    value:
      byId['react-huge-document-virtualized-type-to-paint']?.summary
        ?.materializedSelectionReadyP95Ms,
  });
  add({
    budget: 100,
    metric: 'virtualizedClickToPaintP95Ms',
    value:
      byId['react-huge-document-virtualized-type-to-paint']?.summary
        ?.clickToPaintP95Ms,
  });
  add({
    budget: 75,
    metric: 'virtualizedClickToSelectionReadyP95Ms',
    value:
      byId['react-huge-document-virtualized-type-to-paint']?.summary
        ?.clickToSelectionReadyP95Ms,
  });
  add({
    budget: 16,
    metric: 'browserTraceBurstToPaintPerOpP95Ms',
    rawBurstToPaintP95Ms:
      byId['react-huge-document-browser-trace']?.summary?.burstToPaintP95Ms,
    value:
      byId['react-huge-document-browser-trace']?.summary
        ?.burstToPaintPerOpP95Ms,
  });
  add({
    budget: 75,
    metric: 'browserTraceModelTypeToPaintP95Ms',
    value:
      byId['react-huge-document-browser-trace']?.summary?.modelTypeToPaintP95Ms,
  });
  add({
    budget: 50,
    metric: 'browserTraceModelTypeToReadyP95Ms',
    value:
      byId['react-huge-document-browser-trace']?.summary?.modelTypeToReadyP95Ms,
  });
  add({
    budget: 16,
    metric: 'browserTraceModelBurstToPaintPerOpP95Ms',
    value:
      byId['react-huge-document-browser-trace']?.summary
        ?.modelBurstToPaintPerOpP95Ms,
  });
  add({
    budget: 16,
    metric: 'virtualizedBurstToPaintPerOpP95Ms',
    rawBurstToPaintP95Ms:
      byId['react-huge-document-virtualized-type-to-paint']?.summary
        ?.burstToPaintP95Ms,
    value:
      byId['react-huge-document-virtualized-type-to-paint']?.summary
        ?.burstToPaintPerOpP95Ms,
  });
  add({
    budget: 75,
    metric: 'virtualizedModelTypeToPaintP95Ms',
    value:
      byId['react-huge-document-virtualized-type-to-paint']?.summary
        ?.modelTypeToPaintP95Ms,
  });
  add({
    budget: 50,
    metric: 'virtualizedModelTypeToReadyP95Ms',
    value:
      byId['react-huge-document-virtualized-type-to-paint']?.summary
        ?.modelTypeToReadyP95Ms,
  });
  add({
    budget: 16,
    metric: 'virtualizedModelBurstToPaintPerOpP95Ms',
    value:
      byId['react-huge-document-virtualized-type-to-paint']?.summary
        ?.modelBurstToPaintPerOpP95Ms,
  });
  add({
    budget: 50,
    metric: 'browserTraceLongTaskMaxP95Ms',
    value: byId['react-huge-document-browser-trace']?.summary?.longTaskMaxP95Ms,
  });
  add({
    budget: 50,
    metric: 'browserTraceCoreNotifyListenersP95Ms',
    value:
      byId['react-huge-document-browser-trace']?.summary
        ?.coreNotifyListenersP95Ms,
  });
  add({
    budget: 16,
    metric: 'browserTraceSelectorDispatchP95Ms',
    value:
      byId['react-huge-document-browser-trace']?.summary?.selectorDispatchP95Ms,
  });
  add({
    budget: 50,
    metric: 'virtualizedLongTaskMaxP95Ms',
    value:
      byId['react-huge-document-virtualized-type-to-paint']?.summary
        ?.longTaskMaxP95Ms,
  });
  add({
    budget: 50,
    metric: 'virtualizedCoreNotifyListenersP95Ms',
    value:
      byId['react-huge-document-virtualized-type-to-paint']?.summary
        ?.coreNotifyListenersP95Ms,
  });
  add({
    budget: 16,
    metric: 'virtualizedSelectorDispatchP95Ms',
    value:
      byId['react-huge-document-virtualized-type-to-paint']?.summary
        ?.selectorDispatchP95Ms,
  });
  add({
    budget: 50,
    metric: 'overlayActiveEditP95Ms',
    value: byId['react-huge-document-overlays']?.summary?.activeEditP95Ms,
  });
  add({
    budget: 50,
    metric: 'overlayToggleP95Ms',
    value: byId['react-huge-document-overlays']?.summary?.overlayToggleP95Ms,
  });
  add({
    budget: 60,
    metric: 'partialDOMPromotionSteadyP75Ms',
    ...diagnosticBudgetMetadata,
    value:
      byId['react-huge-document-overlays']?.summary
        ?.partialDOMPromotionSteadyP75Ms,
  });
  add({
    budget: 75,
    metric: 'partialDOMPromotionSteadyP95Ms',
    ...diagnosticBudgetMetadata,
    value:
      byId['react-huge-document-overlays']?.summary
        ?.partialDOMPromotionSteadyP95Ms,
  });

  return rows;
};

const coreBudgetRatio = (budgetRows) =>
  maxFinite(
    budgetRows
      .filter((row) => row.metric.startsWith('core.'))
      .map((row) => row.ratio)
  );

const failedBudgetRows = (budgetRows) =>
  budgetRows.filter(
    (row) =>
      Number.isFinite(row.value) &&
      Number.isFinite(row.budget) &&
      row.value > row.budget
  );

const diagnosticStepIds = new Set([
  'react-huge-document-staged-diagnostic-trace',
]);

const steps = [
  {
    artifactPath: 'tmp/slate-core-huge-document-benchmark.json',
    command: 'bun run bench:core:huge-document:compare:local',
    env: {
      CORE_HUGE_BENCH_BLOCKS: blocks,
      CORE_HUGE_BENCH_ITERATIONS: coreIterations,
      CORE_HUGE_BENCH_LEGACY_REPO: legacyRepo,
      CORE_HUGE_BENCH_TYPE_OPS: typeOps,
    },
    id: 'core-huge-document-compare',
  },
  {
    artifactPath: 'tmp/slate-react-huge-document-legacy-compare-benchmark.json',
    command: 'bun run bench:react:huge-document:legacy-compare:local',
    env: {
      REACT_HUGE_COMPARE_BLOCKS: blocks,
      REACT_HUGE_COMPARE_DISPOSE_DELAY_MS: 0,
      REACT_HUGE_COMPARE_ISOLATE_SURFACES: 1,
      REACT_HUGE_COMPARE_ITERATIONS: iterations,
      REACT_HUGE_COMPARE_LEGACY_REPO: legacyRepo,
      REACT_HUGE_COMPARE_SPLIT_SELECTION: 1,
      REACT_HUGE_COMPARE_SURFACES: 'v2DefaultRenderAuto,v2DomPresent',
      REACT_HUGE_COMPARE_TYPE_OPS: typeOps,
    },
    id: 'react-huge-document-legacy-compare',
  },
  {
    artifactPath: browserTraceLatestArtifactPath,
    command: 'bun run bench:react:huge-document:browser-trace:local',
    env: {
      SLATE_BROWSER_TRACE_BLOCKS: blocks,
      SLATE_BROWSER_TRACE_ITERATIONS: traceIterations,
      SLATE_BROWSER_TRACE_SKIP_BUILD: skipBrowserBuild ? 1 : 0,
      SLATE_BROWSER_TRACE_SURFACES: 'defaultAuto',
      SLATE_BROWSER_TRACE_TYPE_OPS: typeOps,
    },
    id: 'react-huge-document-browser-trace',
  },
  {
    artifactPath: browserTraceLatestArtifactPath,
    command: 'bun run bench:react:huge-document:browser-trace:local',
    env: {
      SLATE_BROWSER_TRACE_BLOCKS: blocks,
      SLATE_BROWSER_TRACE_ITERATIONS: traceIterations,
      SLATE_BROWSER_TRACE_SKIP_BUILD: 1,
      SLATE_BROWSER_TRACE_SURFACES:
        'stagedActiveDOMGroup,stagedContentVisibility',
      SLATE_BROWSER_TRACE_TYPE_OPS: typeOps,
    },
    id: 'react-huge-document-staged-diagnostic-trace',
  },
  {
    artifactPath: browserTraceLatestArtifactPath,
    command: 'bun run bench:react:huge-document:browser-trace:local',
    env: {
      SLATE_BROWSER_TRACE_BLOCKS: blocks,
      SLATE_BROWSER_TRACE_ITERATIONS: traceIterations,
      SLATE_BROWSER_TRACE_NATIVE_TIMEOUT_MS: 5000,
      SLATE_BROWSER_TRACE_SKIP_BUILD: 1,
      SLATE_BROWSER_TRACE_SURFACES: 'virtualized',
      SLATE_BROWSER_TRACE_TYPE_OPS: typeOps,
    },
    id: 'react-huge-document-virtualized-type-to-paint',
  },
  {
    artifactPath:
      'packages/slate-react/tmp/slate-react-huge-document-overlays-benchmark.json',
    command: 'bun run bench:react:huge-document-overlays:local',
    env: {
      REACT_HUGE_DOC_ACTIVE_RADIUS: 1,
      REACT_HUGE_DOC_BENCH_ITERATIONS: iterations,
      REACT_HUGE_DOC_BLOCKS: overlayBlocks,
      REACT_HUGE_DOC_ISLAND_SIZE: overlayIslandSize,
    },
    id: 'react-huge-document-overlays',
  },
];

if (includeLegacyBrowserTrace) {
  steps.push({
    artifactPath:
      'tmp/slate-react-huge-document-slate-browser-trace-benchmark.json',
    command: 'bun run bench:react:huge-document:slate-browser-trace:local',
    env: {
      SLATE_LEGACY_BROWSER_TRACE_BLOCKS: blocks,
      SLATE_LEGACY_BROWSER_TRACE_ITERATIONS: traceIterations,
      SLATE_LEGACY_BROWSER_TRACE_REPO: legacyRepo,
      SLATE_LEGACY_BROWSER_TRACE_SURFACES: 'legacyChunkOn',
      SLATE_LEGACY_BROWSER_TRACE_TYPE_OPS: typeOps,
    },
    id: 'react-huge-document-slate-browser-trace',
  });
}

const stepResults = [];

for (const step of steps) {
  stepResults.push(await runStep(step));
}

const stepFailures = stepResults.filter(
  (step) =>
    step.exitCode !== 0 ||
    !step.artifact?.exists ||
    Boolean(step.artifact?.parseError)
);
const diagnosticFailures = stepFailures.filter((step) =>
  diagnosticStepIds.has(step.id)
);
const failures = stepFailures.filter((step) => !diagnosticStepIds.has(step.id));
const budgetRows = metricBudgetRows(stepResults);
const promotedBudgetRows = budgetRows.filter((row) => !row.diagnostic);
const diagnosticBudgetRows = budgetRows.filter((row) => row.diagnostic);
const budgetFailures = failedBudgetRows(promotedBudgetRows);
const diagnosticBudgetFailures = failedBudgetRows(diagnosticBudgetRows);
const maxBudgetRatio =
  maxFinite(promotedBudgetRows.map((row) => row.ratio)) ?? 0;
const diagnosticMaxBudgetRatio =
  maxFinite(diagnosticBudgetRows.map((row) => row.ratio)) ?? 0;

const byId = Object.fromEntries(stepResults.map((step) => [step.id, step]));
const summary = {
  artifactPaths: {
    latest: latestArtifactPath,
    run: runArtifactPath,
  },
  config: {
    blocks,
    coreIterations,
    includeLegacyBrowserTrace,
    iterations,
    legacyRepo,
    overlayBlocks,
    overlayIslandSize,
    skipBrowserBuild,
    smoke,
    strictBudget,
    traceIterations,
    typeOps,
  },
  budgetFailureCount: budgetFailures.length,
  budgetFailures,
  diagnosticBudgetFailureCount: diagnosticBudgetFailures.length,
  diagnosticBudgetFailures,
  diagnosticFailureCount: diagnosticFailures.length,
  diagnosticFailures: diagnosticFailures.map((step) => ({
    artifactExists: step.artifact?.exists ?? false,
    artifactParseError: step.artifact?.parseError ?? null,
    exitCode: step.exitCode,
    id: step.id,
  })),
  failureCount: failures.length,
  failures: failures.map((step) => ({
    artifactExists: step.artifact?.exists ?? false,
    artifactParseError: step.artifact?.parseError ?? null,
    exitCode: step.exitCode,
    id: step.id,
  })),
  lane: 'slate-react-huge-document-full',
  metrics: {
    budgetRows,
    diagnosticBudgetRows,
    coreWorstBudgetRatio: coreBudgetRatio(budgetRows),
    coreWorstP95Ratio:
      byId['core-huge-document-compare']?.summary?.worstP95Ratio ?? null,
    domNodesP95: maxFinite(
      [
        byId['react-huge-document-browser-trace']?.summary?.domNodesP95,
        byId['react-huge-document-virtualized-type-to-paint']?.summary
          ?.domNodesP95,
      ].filter(Number.isFinite)
    ),
    browserDomNodesP95:
      byId['react-huge-document-browser-trace']?.summary?.domNodesP95 ?? null,
    browserDomNodesP95BySurface:
      byId['react-huge-document-browser-trace']?.summary
        ?.domNodesP95BySurface ?? null,
    stagedDiagnosticBurstToPaintPerOpP95Ms:
      byId['react-huge-document-staged-diagnostic-trace']?.summary
        ?.burstToPaintPerOpP95Ms ?? null,
    stagedDiagnosticDomNodesP95:
      byId['react-huge-document-staged-diagnostic-trace']?.summary
        ?.domNodesP95 ?? null,
    stagedDiagnosticTypeToPaintP95Ms:
      byId['react-huge-document-staged-diagnostic-trace']?.summary
        ?.typeToPaintP95Ms ?? null,
    stagedDiagnosticSelectToPaintP95Ms:
      byId['react-huge-document-staged-diagnostic-trace']?.summary
        ?.selectToPaintP95Ms ?? null,
    virtualizedDomNodesP95:
      byId['react-huge-document-virtualized-type-to-paint']?.summary
        ?.domNodesP95 ?? null,
    virtualizedEditorElementsP95:
      byId['react-huge-document-virtualized-type-to-paint']?.summary
        ?.editorElementsP95 ?? null,
    virtualizedEditorTextNodesP95:
      byId['react-huge-document-virtualized-type-to-paint']?.summary
        ?.editorTextNodesP95 ?? null,
    burstToPaintP95Ms: maxFinite(
      [
        byId['react-huge-document-browser-trace']?.summary?.burstToPaintP95Ms,
        byId['react-huge-document-virtualized-type-to-paint']?.summary
          ?.burstToPaintP95Ms,
      ].filter(Number.isFinite)
    ),
    burstToPaintPerOpP95Ms: maxFinite(
      [
        byId['react-huge-document-browser-trace']?.summary
          ?.burstToPaintPerOpP95Ms,
        byId['react-huge-document-virtualized-type-to-paint']?.summary
          ?.burstToPaintPerOpP95Ms,
      ].filter(Number.isFinite)
    ),
    clickToPaintP95Ms: maxFinite(
      [
        byId['react-huge-document-browser-trace']?.summary?.clickToPaintP95Ms,
        byId['react-huge-document-virtualized-type-to-paint']?.summary
          ?.clickToPaintP95Ms,
      ].filter(Number.isFinite)
    ),
    clickToSelectionReadyP95Ms: maxFinite(
      [
        byId['react-huge-document-browser-trace']?.summary
          ?.clickToSelectionReadyP95Ms,
        byId['react-huge-document-virtualized-type-to-paint']?.summary
          ?.clickToSelectionReadyP95Ms,
      ].filter(Number.isFinite)
    ),
    coreNotifyListenersCountP95: maxFinite(
      [
        byId['react-huge-document-browser-trace']?.summary
          ?.coreNotifyListenersCountP95,
        byId['react-huge-document-virtualized-type-to-paint']?.summary
          ?.coreNotifyListenersCountP95,
      ].filter(Number.isFinite)
    ),
    coreNotifyListenersP95Ms: maxFinite(
      [
        byId['react-huge-document-browser-trace']?.summary
          ?.coreNotifyListenersP95Ms,
        byId['react-huge-document-virtualized-type-to-paint']?.summary
          ?.coreNotifyListenersP95Ms,
      ].filter(Number.isFinite)
    ),
    coreNotifyCommitListenersP95Ms: maxFinite(
      [
        byId['react-huge-document-browser-trace']?.summary
          ?.coreNotifyCommitListenersP95Ms,
        byId['react-huge-document-virtualized-type-to-paint']?.summary
          ?.coreNotifyCommitListenersP95Ms,
      ].filter(Number.isFinite)
    ),
    coreNotifyExtensionCommitListenersP95Ms: maxFinite(
      [
        byId['react-huge-document-browser-trace']?.summary
          ?.coreNotifyExtensionCommitListenersP95Ms,
        byId['react-huge-document-virtualized-type-to-paint']?.summary
          ?.coreNotifyExtensionCommitListenersP95Ms,
      ].filter(Number.isFinite)
    ),
    coreNotifySnapshotListenersP95Ms: maxFinite(
      [
        byId['react-huge-document-browser-trace']?.summary
          ?.coreNotifySnapshotListenersP95Ms,
        byId['react-huge-document-virtualized-type-to-paint']?.summary
          ?.coreNotifySnapshotListenersP95Ms,
      ].filter(Number.isFinite)
    ),
    coreNotifySourceListenersP95Ms: maxFinite(
      [
        byId['react-huge-document-browser-trace']?.summary
          ?.coreNotifySourceListenersP95Ms,
        byId['react-huge-document-virtualized-type-to-paint']?.summary
          ?.coreNotifySourceListenersP95Ms,
      ].filter(Number.isFinite)
    ),
    coreListenerSnapshotP95Ms: maxFinite(
      [
        byId['react-huge-document-browser-trace']?.summary
          ?.coreListenerSnapshotP95Ms,
        byId['react-huge-document-virtualized-type-to-paint']?.summary
          ?.coreListenerSnapshotP95Ms,
      ].filter(Number.isFinite)
    ),
    heapMBP95: maxFinite(
      [
        byId['react-huge-document-browser-trace']?.summary?.heapMBP95,
        byId['react-huge-document-virtualized-type-to-paint']?.summary
          ?.heapMBP95,
      ].filter(Number.isFinite)
    ),
    legacyCompareWorstP95Ratio:
      byId['react-huge-document-legacy-compare']?.summary?.worstP95Ratio ??
      null,
    longTaskMaxP95Ms: maxFinite(
      [
        byId['react-huge-document-browser-trace']?.summary?.longTaskMaxP95Ms,
        byId['react-huge-document-virtualized-type-to-paint']?.summary
          ?.longTaskMaxP95Ms,
      ].filter(Number.isFinite)
    ),
    maxBudgetRatio,
    diagnosticMaxBudgetRatio,
    partialDOMPromotionColdP95Ms:
      byId['react-huge-document-overlays']?.summary
        ?.partialDOMPromotionColdP95Ms ?? null,
    partialDOMPromotionSteadyP75Ms:
      byId['react-huge-document-overlays']?.summary
        ?.partialDOMPromotionSteadyP75Ms ?? null,
    partialDOMPromotionSteadyP95Ms:
      byId['react-huge-document-overlays']?.summary
        ?.partialDOMPromotionSteadyP95Ms ?? null,
    materializedSelectionReadyP95Ms: maxFinite(
      [
        byId['react-huge-document-browser-trace']?.summary
          ?.materializedSelectionReadyP95Ms,
        byId['react-huge-document-virtualized-type-to-paint']?.summary
          ?.materializedSelectionReadyP95Ms,
      ].filter(Number.isFinite)
    ),
    materializedSelectToPaintP95Ms: maxFinite(
      [
        byId['react-huge-document-browser-trace']?.summary
          ?.materializedSelectToPaintP95Ms,
        byId['react-huge-document-virtualized-type-to-paint']?.summary
          ?.materializedSelectToPaintP95Ms,
      ].filter(Number.isFinite)
    ),
    materializedSelectMaterializationFramesP95: maxFinite(
      [
        byId['react-huge-document-browser-trace']?.summary
          ?.materializedSelectMaterializationFramesP95,
        byId['react-huge-document-virtualized-type-to-paint']?.summary
          ?.materializedSelectMaterializationFramesP95,
      ].filter(Number.isFinite)
    ),
    materializedSelectMaterializationScrollDeltaP95: maxFinite(
      [
        byId['react-huge-document-browser-trace']?.summary
          ?.materializedSelectMaterializationScrollDeltaP95,
        byId['react-huge-document-virtualized-type-to-paint']?.summary
          ?.materializedSelectMaterializationScrollDeltaP95,
      ].filter(Number.isFinite)
    ),
    modelBurstToPaintPerOpP95Ms: maxFinite(
      [
        byId['react-huge-document-browser-trace']?.summary
          ?.modelBurstToPaintPerOpP95Ms,
        byId['react-huge-document-virtualized-type-to-paint']?.summary
          ?.modelBurstToPaintPerOpP95Ms,
      ].filter(Number.isFinite)
    ),
    modelTypeToPaintP95Ms: maxFinite(
      [
        byId['react-huge-document-browser-trace']?.summary
          ?.modelTypeToPaintP95Ms,
        byId['react-huge-document-virtualized-type-to-paint']?.summary
          ?.modelTypeToPaintP95Ms,
      ].filter(Number.isFinite)
    ),
    modelTypeToReadyP95Ms: maxFinite(
      [
        byId['react-huge-document-browser-trace']?.summary
          ?.modelTypeToReadyP95Ms,
        byId['react-huge-document-virtualized-type-to-paint']?.summary
          ?.modelTypeToReadyP95Ms,
      ].filter(Number.isFinite)
    ),
    selectionReadyP95Ms: maxFinite(
      [
        byId['react-huge-document-browser-trace']?.summary?.selectionReadyP95Ms,
        byId['react-huge-document-virtualized-type-to-paint']?.summary
          ?.selectionReadyP95Ms,
      ].filter(Number.isFinite)
    ),
    selectMaterializationFramesP95: maxFinite(
      [
        byId['react-huge-document-browser-trace']?.summary
          ?.selectMaterializationFramesP95,
        byId['react-huge-document-virtualized-type-to-paint']?.summary
          ?.selectMaterializationFramesP95,
      ].filter(Number.isFinite)
    ),
    selectMaterializationScrollDeltaP95: maxFinite(
      [
        byId['react-huge-document-browser-trace']?.summary
          ?.selectMaterializationScrollDeltaP95,
        byId['react-huge-document-virtualized-type-to-paint']?.summary
          ?.selectMaterializationScrollDeltaP95,
      ].filter(Number.isFinite)
    ),
    selectToPaintP95Ms: maxFinite(
      [
        byId['react-huge-document-browser-trace']?.summary?.selectToPaintP95Ms,
        byId['react-huge-document-virtualized-type-to-paint']?.summary
          ?.selectToPaintP95Ms,
      ].filter(Number.isFinite)
    ),
    selectorDispatchP95Ms: maxFinite(
      [
        byId['react-huge-document-browser-trace']?.summary
          ?.selectorDispatchP95Ms,
        byId['react-huge-document-virtualized-type-to-paint']?.summary
          ?.selectorDispatchP95Ms,
      ].filter(Number.isFinite)
    ),
    selectorDispatchCountP95: maxFinite(
      [
        byId['react-huge-document-browser-trace']?.summary
          ?.selectorDispatchCountP95,
        byId['react-huge-document-virtualized-type-to-paint']?.summary
          ?.selectorDispatchCountP95,
      ].filter(Number.isFinite)
    ),
    selectorCheckCountP95: maxFinite(
      [
        byId['react-huge-document-browser-trace']?.summary
          ?.selectorCheckCountP95,
        byId['react-huge-document-virtualized-type-to-paint']?.summary
          ?.selectorCheckCountP95,
      ].filter(Number.isFinite)
    ),
    selectorNotifyCountP95: maxFinite(
      [
        byId['react-huge-document-browser-trace']?.summary
          ?.selectorNotifyCountP95,
        byId['react-huge-document-virtualized-type-to-paint']?.summary
          ?.selectorNotifyCountP95,
      ].filter(Number.isFinite)
    ),
    selectorSubscriptionCountP95: maxFinite(
      [
        byId['react-huge-document-browser-trace']?.summary
          ?.selectorSubscriptionCountP95,
        byId['react-huge-document-virtualized-type-to-paint']?.summary
          ?.selectorSubscriptionCountP95,
      ].filter(Number.isFinite)
    ),
    typeToPaintP95Ms: maxFinite(
      [
        byId['react-huge-document-browser-trace']?.summary?.typeToPaintP95Ms,
        byId['react-huge-document-virtualized-type-to-paint']?.summary
          ?.typeToPaintP95Ms,
      ].filter(Number.isFinite)
    ),
    virtualizedTypeToPaintP95Ms:
      byId['react-huge-document-virtualized-type-to-paint']?.summary
        ?.typeToPaintP95Ms ?? null,
    virtualizedModelTypeToPaintP95Ms:
      byId['react-huge-document-virtualized-type-to-paint']?.summary
        ?.modelTypeToPaintP95Ms ?? null,
    virtualizedModelTypeToReadyP95Ms:
      byId['react-huge-document-virtualized-type-to-paint']?.summary
        ?.modelTypeToReadyP95Ms ?? null,
    virtualizedModelBurstToPaintPerOpP95Ms:
      byId['react-huge-document-virtualized-type-to-paint']?.summary
        ?.modelBurstToPaintPerOpP95Ms ?? null,
    virtualizedSelectToPaintP95Ms:
      byId['react-huge-document-virtualized-type-to-paint']?.summary
        ?.selectToPaintP95Ms ?? null,
    virtualizedSelectionReadyP95Ms:
      byId['react-huge-document-virtualized-type-to-paint']?.summary
        ?.selectionReadyP95Ms ?? null,
    virtualizedMaterializedSelectToPaintP95Ms:
      byId['react-huge-document-virtualized-type-to-paint']?.summary
        ?.materializedSelectToPaintP95Ms ?? null,
    virtualizedMaterializedSelectionReadyP95Ms:
      byId['react-huge-document-virtualized-type-to-paint']?.summary
        ?.materializedSelectionReadyP95Ms ?? null,
    virtualizedSelectMaterializationFramesP95:
      byId['react-huge-document-virtualized-type-to-paint']?.summary
        ?.selectMaterializationFramesP95 ?? null,
    virtualizedSelectMaterializationScrollDeltaP95:
      byId['react-huge-document-virtualized-type-to-paint']?.summary
        ?.selectMaterializationScrollDeltaP95 ?? null,
    virtualizedMaterializedSelectMaterializationFramesP95:
      byId['react-huge-document-virtualized-type-to-paint']?.summary
        ?.materializedSelectMaterializationFramesP95 ?? null,
    virtualizedMaterializedSelectMaterializationScrollDeltaP95:
      byId['react-huge-document-virtualized-type-to-paint']?.summary
        ?.materializedSelectMaterializationScrollDeltaP95 ?? null,
  },
  steps: stepResults.map((step) => ({
    artifactPath: step.artifactPath,
    durationMs: step.durationMs,
    exitCode: step.exitCode,
    id: step.id,
    summary: step.summary,
  })),
};

await writeBenchmarkArtifact(latestArtifactPath, summary);
await writeBenchmarkArtifact(runArtifactPath, summary);

console.log(
  `METRIC react_huge_doc_full_max_budget_ratio=${round(maxBudgetRatio)}`
);
console.log(
  `METRIC react_huge_doc_full_budget_failure_count=${budgetFailures.length}`
);
console.log(
  `METRIC react_huge_doc_full_diagnostic_budget_failure_count=${diagnosticBudgetFailures.length}`
);
console.log(`METRIC react_huge_doc_full_failure_count=${failures.length}`);
console.log(
  `METRIC react_huge_doc_full_diagnostic_failure_count=${diagnosticFailures.length}`
);
console.log(
  `METRIC react_huge_doc_full_diagnostic_max_budget_ratio=${round(
    diagnosticMaxBudgetRatio
  )}`
);
console.log(
  `METRIC react_huge_doc_full_legacy_compare_worst_p95_ratio=${round(
    summary.metrics.legacyCompareWorstP95Ratio ?? 0
  )}`
);
console.log(
  `METRIC react_huge_doc_full_core_worst_p95_ratio=${round(
    summary.metrics.coreWorstP95Ratio ?? 0
  )}`
);
console.log(
  `METRIC react_huge_doc_full_core_worst_budget_ratio=${round(
    summary.metrics.coreWorstBudgetRatio ?? 0
  )}`
);
console.log(
  `METRIC react_huge_doc_full_type_to_paint_p95_ms=${round(
    summary.metrics.typeToPaintP95Ms ?? 0
  )}`
);
console.log(
  `METRIC react_huge_doc_full_select_to_paint_p95_ms=${round(
    summary.metrics.selectToPaintP95Ms ?? 0
  )}`
);
console.log(
  `METRIC react_huge_doc_full_selection_ready_p95_ms=${round(
    summary.metrics.selectionReadyP95Ms ?? 0
  )}`
);
console.log(
  `METRIC react_huge_doc_full_materialized_select_to_paint_p95_ms=${round(
    summary.metrics.materializedSelectToPaintP95Ms ?? 0
  )}`
);
console.log(
  `METRIC react_huge_doc_full_materialized_selection_ready_p95_ms=${round(
    summary.metrics.materializedSelectionReadyP95Ms ?? 0
  )}`
);
console.log(
  `METRIC react_huge_doc_full_select_materialization_frames_p95=${round(
    summary.metrics.selectMaterializationFramesP95 ?? 0
  )}`
);
console.log(
  `METRIC react_huge_doc_full_select_materialization_scroll_delta_p95_px=${round(
    summary.metrics.selectMaterializationScrollDeltaP95 ?? 0
  )}`
);
console.log(
  `METRIC react_huge_doc_full_materialized_select_materialization_frames_p95=${round(
    summary.metrics.materializedSelectMaterializationFramesP95 ?? 0
  )}`
);
console.log(
  `METRIC react_huge_doc_full_materialized_select_materialization_scroll_delta_p95_px=${round(
    summary.metrics.materializedSelectMaterializationScrollDeltaP95 ?? 0
  )}`
);
console.log(
  `METRIC react_huge_doc_full_burst_to_paint_p95_ms=${round(
    summary.metrics.burstToPaintP95Ms ?? 0
  )}`
);
console.log(
  `METRIC react_huge_doc_full_burst_to_paint_per_op_p95_ms=${round(
    summary.metrics.burstToPaintPerOpP95Ms ?? 0
  )}`
);
console.log(
  `METRIC react_huge_doc_full_click_to_paint_p95_ms=${round(
    summary.metrics.clickToPaintP95Ms ?? 0
  )}`
);
console.log(
  `METRIC react_huge_doc_full_click_to_selection_ready_p95_ms=${round(
    summary.metrics.clickToSelectionReadyP95Ms ?? 0
  )}`
);
console.log(
  `METRIC react_huge_doc_full_model_type_to_paint_p95_ms=${round(
    summary.metrics.modelTypeToPaintP95Ms ?? 0
  )}`
);
console.log(
  `METRIC react_huge_doc_full_model_type_to_ready_p95_ms=${round(
    summary.metrics.modelTypeToReadyP95Ms ?? 0
  )}`
);
console.log(
  `METRIC react_huge_doc_full_model_burst_to_paint_per_op_p95_ms=${round(
    summary.metrics.modelBurstToPaintPerOpP95Ms ?? 0
  )}`
);
console.log(
  `METRIC react_huge_doc_full_virtualized_type_to_paint_p95_ms=${round(
    summary.metrics.virtualizedTypeToPaintP95Ms ?? 0
  )}`
);
console.log(
  `METRIC react_huge_doc_full_virtualized_model_type_to_paint_p95_ms=${round(
    summary.metrics.virtualizedModelTypeToPaintP95Ms ?? 0
  )}`
);
console.log(
  `METRIC react_huge_doc_full_virtualized_model_type_to_ready_p95_ms=${round(
    summary.metrics.virtualizedModelTypeToReadyP95Ms ?? 0
  )}`
);
console.log(
  `METRIC react_huge_doc_full_virtualized_model_burst_to_paint_per_op_p95_ms=${round(
    summary.metrics.virtualizedModelBurstToPaintPerOpP95Ms ?? 0
  )}`
);
console.log(
  `METRIC react_huge_doc_full_virtualized_select_to_paint_p95_ms=${round(
    summary.metrics.virtualizedSelectToPaintP95Ms ?? 0
  )}`
);
console.log(
  `METRIC react_huge_doc_full_virtualized_selection_ready_p95_ms=${round(
    summary.metrics.virtualizedSelectionReadyP95Ms ?? 0
  )}`
);
console.log(
  `METRIC react_huge_doc_full_virtualized_materialized_select_to_paint_p95_ms=${round(
    summary.metrics.virtualizedMaterializedSelectToPaintP95Ms ?? 0
  )}`
);
console.log(
  `METRIC react_huge_doc_full_virtualized_materialized_selection_ready_p95_ms=${round(
    summary.metrics.virtualizedMaterializedSelectionReadyP95Ms ?? 0
  )}`
);
console.log(
  `METRIC react_huge_doc_full_virtualized_select_materialization_frames_p95=${round(
    summary.metrics.virtualizedSelectMaterializationFramesP95 ?? 0
  )}`
);
console.log(
  `METRIC react_huge_doc_full_virtualized_select_materialization_scroll_delta_p95_px=${round(
    summary.metrics.virtualizedSelectMaterializationScrollDeltaP95 ?? 0
  )}`
);
console.log(
  `METRIC react_huge_doc_full_virtualized_materialized_select_materialization_frames_p95=${round(
    summary.metrics.virtualizedMaterializedSelectMaterializationFramesP95 ?? 0
  )}`
);
console.log(
  `METRIC react_huge_doc_full_virtualized_materialized_select_materialization_scroll_delta_p95_px=${round(
    summary.metrics
      .virtualizedMaterializedSelectMaterializationScrollDeltaP95 ?? 0
  )}`
);
console.log(
  `METRIC react_huge_doc_full_staged_diagnostic_burst_to_paint_per_op_p95_ms=${round(
    summary.metrics.stagedDiagnosticBurstToPaintPerOpP95Ms ?? 0
  )}`
);
console.log(
  `METRIC react_huge_doc_full_staged_diagnostic_dom_nodes_p95=${round(
    summary.metrics.stagedDiagnosticDomNodesP95 ?? 0
  )}`
);
console.log(
  `METRIC react_huge_doc_full_partial_dom_promotion_steady_p75_ms=${round(
    summary.metrics.partialDOMPromotionSteadyP75Ms ?? 0
  )}`
);
console.log(
  `METRIC react_huge_doc_full_partial_dom_promotion_steady_p95_ms=${round(
    summary.metrics.partialDOMPromotionSteadyP95Ms ?? 0
  )}`
);
console.log(
  `METRIC react_huge_doc_full_partial_dom_promotion_cold_p95_ms=${round(
    summary.metrics.partialDOMPromotionColdP95Ms ?? 0
  )}`
);
console.log(
  `METRIC react_huge_doc_full_dom_nodes_p95=${round(
    summary.metrics.domNodesP95 ?? 0
  )}`
);
console.log(
  `METRIC react_huge_doc_full_browser_dom_nodes_p95=${round(
    summary.metrics.browserDomNodesP95 ?? 0
  )}`
);
console.log(
  `METRIC react_huge_doc_full_virtualized_dom_nodes_p95=${round(
    summary.metrics.virtualizedDomNodesP95 ?? 0
  )}`
);
console.log(
  `METRIC react_huge_doc_full_virtualized_editor_elements_p95=${round(
    summary.metrics.virtualizedEditorElementsP95 ?? 0
  )}`
);
console.log(
  `METRIC react_huge_doc_full_virtualized_editor_text_nodes_p95=${round(
    summary.metrics.virtualizedEditorTextNodesP95 ?? 0
  )}`
);
console.log(
  `METRIC react_huge_doc_full_long_task_max_p95_ms=${round(
    summary.metrics.longTaskMaxP95Ms ?? 0
  )}`
);
console.log(
  `METRIC react_huge_doc_full_core_notify_listeners_p95_ms=${round(
    summary.metrics.coreNotifyListenersP95Ms ?? 0
  )}`
);
console.log(
  `METRIC react_huge_doc_full_core_notify_listeners_count_p95=${round(
    summary.metrics.coreNotifyListenersCountP95 ?? 0
  )}`
);
console.log(
  `METRIC react_huge_doc_full_core_notify_commit_listeners_p95_ms=${round(
    summary.metrics.coreNotifyCommitListenersP95Ms ?? 0
  )}`
);
console.log(
  `METRIC react_huge_doc_full_core_notify_extension_commit_listeners_p95_ms=${round(
    summary.metrics.coreNotifyExtensionCommitListenersP95Ms ?? 0
  )}`
);
console.log(
  `METRIC react_huge_doc_full_core_notify_snapshot_listeners_p95_ms=${round(
    summary.metrics.coreNotifySnapshotListenersP95Ms ?? 0
  )}`
);
console.log(
  `METRIC react_huge_doc_full_core_notify_source_listeners_p95_ms=${round(
    summary.metrics.coreNotifySourceListenersP95Ms ?? 0
  )}`
);
console.log(
  `METRIC react_huge_doc_full_core_listener_snapshot_p95_ms=${round(
    summary.metrics.coreListenerSnapshotP95Ms ?? 0
  )}`
);
console.log(
  `METRIC react_huge_doc_full_selector_dispatch_p95_ms=${round(
    summary.metrics.selectorDispatchP95Ms ?? 0
  )}`
);
console.log(
  `METRIC react_huge_doc_full_selector_dispatch_count_p95=${round(
    summary.metrics.selectorDispatchCountP95 ?? 0
  )}`
);
console.log(
  `METRIC react_huge_doc_full_selector_check_count_p95=${round(
    summary.metrics.selectorCheckCountP95 ?? 0
  )}`
);
console.log(
  `METRIC react_huge_doc_full_selector_notify_count_p95=${round(
    summary.metrics.selectorNotifyCountP95 ?? 0
  )}`
);
console.log(
  `METRIC react_huge_doc_full_selector_subscription_count_p95=${round(
    summary.metrics.selectorSubscriptionCountP95 ?? 0
  )}`
);
console.log(`\nWrote ${runArtifactPath}`);

if (failures.length > 0 || (strictBudget && budgetFailures.length > 0)) {
  process.exitCode = 1;
}

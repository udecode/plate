import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const coreCurrentDir = fileURLToPath(
  new URL('../../../scripts/benchmarks/core/current/', import.meta.url)
);
const packageJsonPath = fileURLToPath(
  new URL('../../../package.json', import.meta.url)
);
const legacyReactComparePath = fileURLToPath(
  new URL(
    '../../../scripts/benchmarks/browser/react/huge-document-legacy-compare.mjs',
    import.meta.url
  )
);
const hugeDocumentFullPath = fileURLToPath(
  new URL(
    '../../../scripts/benchmarks/browser/react/huge-document-full.mjs',
    import.meta.url
  )
);
const hugeDocumentBrowserTracePath = fileURLToPath(
  new URL(
    '../../../scripts/benchmarks/browser/react/huge-document-browser-trace.mjs',
    import.meta.url
  )
);
const hugeDocumentCrossEditorPath = fileURLToPath(
  new URL(
    '../../../scripts/benchmarks/browser/react/huge-document-cross-editor.mjs',
    import.meta.url
  )
);
const hugeDocumentOverlaysPath = fileURLToPath(
  new URL(
    '../../../scripts/benchmarks/browser/react/huge-document-overlays.tsx',
    import.meta.url
  )
);
const activeTypingBreakdownPath = fileURLToPath(
  new URL(
    '../../../scripts/benchmarks/browser/react/active-typing-breakdown.tsx',
    import.meta.url
  )
);
const observationComparePath = fileURLToPath(
  new URL(
    '../../../scripts/benchmarks/core/compare/observation.mjs',
    import.meta.url
  )
);
const hugeDocumentComparePath = fileURLToPath(
  new URL(
    '../../../scripts/benchmarks/core/compare/huge-document.mjs',
    import.meta.url
  )
);
const historyRetainedMemoryPath = fileURLToPath(
  new URL(
    '../../../scripts/benchmarks/core/current/history-retained-memory.mjs',
    import.meta.url
  )
);
const clipboardLargePayloadPath = fileURLToPath(
  new URL(
    '../../../scripts/benchmarks/core/current/clipboard-large-payload.mjs',
    import.meta.url
  )
);
const transactionExecutionPath = fileURLToPath(
  new URL(
    '../../../scripts/benchmarks/core/current/transaction-execution.mjs',
    import.meta.url
  )
);
const historyComparePath = fileURLToPath(
  new URL(
    '../../../scripts/benchmarks/core/compare/history.mjs',
    import.meta.url
  )
);
const normalizationComparePath = fileURLToPath(
  new URL(
    '../../../scripts/benchmarks/core/compare/normalization.mjs',
    import.meta.url
  )
);
const textSelectionPath = fileURLToPath(
  new URL(
    '../../../scripts/benchmarks/core/current/text-selection.mjs',
    import.meta.url
  )
);

type BenchmarkSummary = {
  max: number;
  mean: number;
  median: number;
  min: number;
  p75?: number;
  p95?: number;
  p99?: number;
  samples: number[];
};

const compareBenchmarkSummaryPaths = [
  legacyReactComparePath,
  observationComparePath,
  hugeDocumentComparePath,
  historyComparePath,
  normalizationComparePath,
];

const summaryNumbers = (summary: BenchmarkSummary) =>
  Object.values(summary).filter(
    (value): value is number => typeof value === 'number'
  );

const extractSummarizeSource = (source: string) => {
  const summarizeStart = source.indexOf('const summarize =');

  assert.ok(summarizeStart >= 0);

  const percentileStart = source.lastIndexOf(
    'const percentile =',
    summarizeStart
  );
  const extractionStart =
    percentileStart >= 0 ? percentileStart : summarizeStart;
  const bodyStart = source.indexOf('{', summarizeStart);

  assert.ok(bodyStart >= 0);

  let depth = 0;

  for (let index = bodyStart; index < source.length; index++) {
    if (source[index] === '{') {
      depth++;
    }

    if (source[index] === '}') {
      depth--;

      if (depth === 0) {
        let end = index + 1;

        if (source[end] === ')') {
          end += 1;
        }

        return source.slice(
          extractionStart,
          source[end] === ';' ? end + 1 : end
        );
      }
    }
  }

  throw new Error('Unable to extract summarize helper');
};

const extractConstFunctionSource = (
  source: string,
  functionName: string,
  dependencyName?: string
) => {
  const functionStart = source.indexOf(`const ${functionName} =`);

  assert.ok(functionStart >= 0);

  const dependencyStart = dependencyName
    ? source.lastIndexOf(`const ${dependencyName} =`, functionStart)
    : -1;
  const extractionStart =
    dependencyStart >= 0 ? dependencyStart : functionStart;
  const bodyStart = source.indexOf('{', functionStart);
  const nextDeclaration = source.indexOf('\nconst ', functionStart + 1);

  if (nextDeclaration >= 0 && nextDeclaration < bodyStart) {
    return source.slice(extractionStart, nextDeclaration).trimEnd();
  }

  assert.ok(bodyStart >= 0);

  let depth = 0;

  for (let index = bodyStart; index < source.length; index++) {
    if (source[index] === '{') {
      depth++;
    }

    if (source[index] === '}') {
      depth--;

      if (depth === 0) {
        let end = index + 1;

        if (source[end] === ')') {
          end += 1;
        }

        return source.slice(
          extractionStart,
          source[end] === ';' ? end + 1 : end
        );
      }
    }
  }

  throw new Error(`Unable to extract ${functionName} helper`);
};

const summarizeEmptySamplesFromPath = (path: string) => {
  const source = extractSummarizeSource(readFileSync(path, 'utf8'));
  const round = (value: number) => Number(value.toFixed(2));
  const summarize = Function('round', `${source}; return summarize`)(round) as (
    samples: number[]
  ) => BenchmarkSummary;

  return summarize([]);
};

const emptySummaryFromPath = <TSummary>(
  path: string,
  functionName: string,
  dependencyName?: string
) => {
  const source = extractConstFunctionSource(
    readFileSync(path, 'utf8'),
    functionName,
    dependencyName
  );
  const round = (value: number) => Number(value.toFixed(2));
  const summarize = Function(
    'round',
    `${source}; return ${functionName}`
  )(round) as (samples: number[]) => TSummary;

  return summarize([]);
};

describe('core benchmark scripts contract', () => {
  it('returns finite zero summaries for empty shared benchmark samples', async () => {
    const reactBenchmark = (await import(
      new URL(
        '../../../scripts/benchmarks/shared/react-benchmark.tsx',
        import.meta.url
      ).href
    )) as { summarize: (samples: number[]) => BenchmarkSummary };
    const stats = (await import(
      new URL('../../../scripts/benchmarks/shared/stats.mjs', import.meta.url)
        .href
    )) as { summarize: (samples: number[]) => BenchmarkSummary };
    const expected = {
      max: 0,
      mean: 0,
      median: 0,
      min: 0,
      p75: 0,
      p95: 0,
      p99: 0,
      samples: [],
    };

    for (const summary of [reactBenchmark.summarize([]), stats.summarize([])]) {
      assert.deepEqual(summary, expected);
      assert.ok(summaryNumbers(summary).every(Number.isFinite));
    }
  });

  it('returns finite zero summaries for empty copied benchmark compare samples', () => {
    const expectedWithPercentiles = {
      samples: [],
      mean: 0,
      median: 0,
      p75: 0,
      p95: 0,
      p99: 0,
      min: 0,
      max: 0,
    };
    const expectedWithoutPercentiles = {
      samples: [],
      mean: 0,
      median: 0,
      min: 0,
      max: 0,
    };

    for (const path of compareBenchmarkSummaryPaths) {
      const summary = summarizeEmptySamplesFromPath(path);

      assert.deepEqual(
        summary,
        path === normalizationComparePath
          ? expectedWithoutPercentiles
          : expectedWithPercentiles
      );
      assert.ok(summaryNumbers(summary).every(Number.isFinite));
    }
  });

  it('returns finite zero summaries for empty current benchmark samples', () => {
    const retainedHeapSummary = emptySummaryFromPath<{
      max: number;
      mean: number;
      min: number;
      samples: number[];
    }>(historyRetainedMemoryPath, 'summarizeHeapDeltas');
    const clipboardDurationSummary = emptySummaryFromPath<{
      max: number;
      mean: number;
      min: number;
      p50: number;
      p95: number;
      samples: number[];
    }>(clipboardLargePayloadPath, 'summarizeDurations', 'percentile');
    const clipboardHeapSummary = emptySummaryFromPath<{
      max: number;
      mean: number;
      samples: number[];
    }>(clipboardLargePayloadPath, 'summarizeHeapDeltas');
    const meanSource = extractConstFunctionSource(
      readFileSync(transactionExecutionPath, 'utf8'),
      'mean'
    );
    const mean = Function(`${meanSource}; return mean`) as () => (
      samples: number[]
    ) => number;

    assert.deepEqual(retainedHeapSummary, {
      samples: [],
      mean: 0,
      max: 0,
      min: 0,
    });
    assert.deepEqual(clipboardDurationSummary, {
      samples: [],
      mean: 0,
      p50: 0,
      p95: 0,
      min: 0,
      max: 0,
    });
    assert.deepEqual(clipboardHeapSummary, {
      max: 0,
      mean: 0,
      samples: [],
    });
    assert.equal(mean()([]), 0);
    assert.ok(summaryNumbers(retainedHeapSummary).every(Number.isFinite));
    assert.ok(summaryNumbers(clipboardDurationSummary).every(Number.isFinite));
    assert.ok(summaryNumbers(clipboardHeapSummary).every(Number.isFinite));
  });

  it('exposes every current core benchmark through a local core script', () => {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as {
      scripts: Record<string, string>;
    };
    const coreBenchmarkFiles = readdirSync(coreCurrentDir)
      .filter((file) => file.endsWith('.mjs'))
      .sort();
    const coreLocalScriptCommands = Object.entries(packageJson.scripts)
      .filter(
        ([name]) => name.startsWith('bench:core:') && name.endsWith(':local')
      )
      .map(([, command]) => command);

    const missingFiles = coreBenchmarkFiles.filter((file) => {
      const expectedCommand = `bun ./scripts/benchmarks/core/current/${file}`;

      return !coreLocalScriptCommands.includes(expectedCommand);
    });

    assert.deepEqual(missingFiles, []);
  });

  it('samples retained history heap after a post-run GC pass', () => {
    const source = readFileSync(historyRetainedMemoryPath, 'utf8');
    const measureStart = source.indexOf('const measureRetainedLane');
    const measureEnd = source.indexOf('const measureFullDocumentReplace');
    const measureSource = source.slice(measureStart, measureEnd);
    const runIndex = measureSource.indexOf('const result = run(context)');
    const gcAfterIndex = measureSource.indexOf(
      'const gcAfter = forceGc()',
      runIndex
    );
    const heapAfterIndex = measureSource.indexOf(
      'const heapAfter = heapUsed()',
      runIndex
    );

    assert.ok(runIndex >= 0);
    assert.ok(gcAfterIndex > runIndex);
    assert.ok(heapAfterIndex > gcAfterIndex);
    assert.match(measureSource, /postRunGcAvailable/);
    assert.match(measureSource, /heapGrowthDeltaBytes/);
  });

  it('prepares the move selection document before timing movement', () => {
    const source = readFileSync(textSelectionPath, 'utf8');
    const setupStart = source.indexOf('const createMoveEditor');
    const setupEnd = source.indexOf('const write =');
    const setupSource = source.slice(setupStart, setupEnd);
    const moveStart = source.indexOf('const moveMs = measureLane');
    const moveSource = source.slice(
      moveStart,
      source.indexOf('const collapseMs')
    );

    assert.ok(setupStart >= 0);
    assert.ok(setupEnd > setupStart);
    assert.match(setupSource, /Editor\.replace\(editor/);
    assert.match(setupSource, /text:\s*'x'\.repeat\(steps \+ 20\)/);
    assert.match(moveSource, /measureLane\(createMoveEditor/);
    assert.doesNotMatch(moveSource, /Editor\.replace\(editor/);
  });

  it('runs active typing warmups through the measured typing path', () => {
    const source = readFileSync(activeTypingBreakdownPath, 'utf8');
    const measureStart = source.indexOf('const measureScenario');
    const measureEnd = source.indexOf('const measureTyping');
    const measureSource = source.slice(measureStart, measureEnd);
    const promoteStart = measureSource.indexOf('if (promote)');
    const elseStart = measureSource.indexOf('} else {', promoteStart);
    const disposeStart = measureSource.indexOf(
      'await context.dispose()',
      elseStart
    );
    const promoteSource = measureSource.slice(promoteStart, elseStart);
    const nonPromoteSource = measureSource.slice(elseStart, disposeStart);

    assert.ok(measureStart >= 0);
    assert.ok(measureEnd > measureStart);
    assert.ok(promoteStart >= 0);
    assert.ok(elseStart > promoteStart);
    assert.ok(disposeStart > elseStart);

    for (const branchSource of [promoteSource, nonPromoteSource]) {
      const typingIndex = branchSource.indexOf(
        'const typingMetrics = measureTyping(context, blockIndex)'
      );
      const sampleGateIndex = branchSource.indexOf('if (iteration > 0)');

      assert.ok(typingIndex >= 0);
      assert.ok(sampleGateIndex > typingIndex);
      assert.match(branchSource, /\.\.\.typingMetrics/);
    }
  });

  it('keeps the core huge-document compare assertions out of snapshot materialization', () => {
    const source = readFileSync(hugeDocumentComparePath, 'utf8');
    const getChildrenStart = source.indexOf('const getChildren =');
    const getSelectionStart = source.indexOf('const getSelection =');
    const selectStart = source.indexOf('const select =');
    const getChildrenSource = source.slice(getChildrenStart, getSelectionStart);
    const getSelectionSource = source.slice(getSelectionStart, selectStart);

    assert.ok(getChildrenStart >= 0);
    assert.ok(getSelectionStart > getChildrenStart);
    assert.ok(selectStart > getSelectionStart);
    assert.ok(
      getChildrenSource.indexOf('Editor.getChildren') <
        getChildrenSource.indexOf('Editor.getSnapshot')
    );
    assert.ok(
      getSelectionSource.indexOf('Editor.getSelection') <
        getSelectionSource.indexOf('Editor.getSnapshot')
    );
  });

  it('keeps the core huge-document history lane subscribed to snapshots', () => {
    const source = readFileSync(hugeDocumentComparePath, 'utf8');

    assert.match(source, /const selectAllDeleteTypeUndo = \(\) =>/);
    assert.match(source, /subscribeSnapshot\(editor\)/);
    assert.match(source, /tx\.history\.undo\(\)/);
    assert.match(source, /selectAllDeleteTypeUndoMs/);
    assert.match(source, /current\.lanes\.selectAllDeleteTypeUndoMs\.mean/);
  });

  it('allows current-only huge-document core profiling without legacy compare cost', () => {
    const source = readFileSync(hugeDocumentComparePath, 'utf8');

    assert.match(source, /CORE_HUGE_BENCH_CURRENT_ONLY/);
    assert.match(source, /const legacyPackageManager = currentOnly/);
    assert.match(source, /legacy: legacy\?\.lanes \?\? null/);
    assert.match(source, /deltaMeanMs: legacy/);
  });

  it('keeps full huge-document core budget evidence separate from legacy ratios', () => {
    const source = readFileSync(hugeDocumentFullPath, 'utf8');
    const legacySource = readFileSync(legacyReactComparePath, 'utf8');
    const overlaysSource = readFileSync(hugeDocumentOverlaysPath, 'utf8');
    const activeTypingSource = readFileSync(activeTypingBreakdownPath, 'utf8');

    assert.match(source, /const coreIterations = Number\(/);
    assert.match(source, /HUGE_DOC_FULL_CORE_ITERATIONS/);
    assert.match(
      source,
      /HUGE_DOC_FULL_OVERLAY_ISLAND_SIZE \|\| \(smoke \? 10 : 32\)/
    );
    assert.match(legacySource, /REACT_HUGE_COMPARE_ISLAND_SIZE \|\| 32/);
    assert.match(legacySource, /const comparableProductLaneNames = readyOnly/);
    assert.match(legacySource, /const createResourceSummaryBySurface =/);
    assert.match(legacySource, /resourceSummaryBySurface/);
    assert.match(legacySource, /const measureLegacyReadySurfaceWeights =/);
    assert.match(legacySource, /'dom-strategy-dom-node-count'/);
    assert.match(legacySource, /'dom-node-count'/);
    assert.match(legacySource, /'root-group-mounted-count'/);
    assert.match(
      legacySource,
      /const v2OnlyProductLaneNames = readyOnly\s*\?\s*\[\]\s*:\s*\[\s*'middleBlockPromoteMs',\s*'middleBlockPromoteThenTypeMs',?\s*\]/
    );
    assert.match(legacySource, /v2OnlyP95Rows/);
    assert.match(legacySource, /REACT_HUGE_COMPARE_PRINT_JSON/);
    assert.match(
      legacySource,
      /const printHugeDocumentSummary = \(summary\) =>/
    );
    assert.match(
      legacySource,
      /react_huge_doc_legacy_compare_partial_dom_promotion_then_type_p95_ms/
    );
    assert.match(legacySource, /`chunk-\$\{chunkSize\}`/);
    assert.match(legacySource, /`segment-\$\{segmentSize\}`/);
    assert.match(legacySource, /`radius-\$\{overscan\}`/);
    assert.match(legacySource, /`dispose-\$\{disposeDelayMs\}`/);
    assert.match(legacySource, /readyOnly \? 'ready-only' : 'full-run'/);
    assert.match(
      legacySource,
      /includeSyntheticBeforeInput\s*\?\s*'synthetic-beforeinput'\s*:\s*'native-beforeinput'/
    );
    assert.match(overlaysSource, /REACT_HUGE_DOC_ISLAND_SIZE \|\| 32/);
    assert.match(
      activeTypingSource,
      /REACT_ACTIVE_TYPING_BREAKDOWN_ISLAND_SIZE \|\| 32/
    );
    assert.match(source, /CORE_HUGE_BENCH_ITERATIONS: coreIterations/);
    assert.match(source, /const coreBudgetRatio = \(budgetRows\) =>/);
    assert.match(source, /HUGE_DOC_FULL_STRICT_BUDGET/);
    assert.match(source, /const failedBudgetRows = \(budgetRows\) =>/);
    assert.match(source, /budgetFailureCount: budgetFailures\.length/);
    assert.match(source, /const comparableProductLanes = \[/);
    assert.match(
      source,
      /const v2OnlyProductLanes = \['middleBlockPromoteThenTypeMs'\]/
    );
    assert.match(source, /partialDOMPromotionThenTypeP95Ms/);
    assert.match(source, /legacyComparePartialDOMPromotionThenTypeP95Ms/);
    assert.match(source, /existsSync,\s*rmSync/);
    assert.match(
      source,
      /const browserTraceLatestArtifactPath =\s*'tmp\/slate-react-huge-document-browser-trace-benchmark\.json'/
    );
    assert.match(
      source,
      /rmSync\(step\.artifactPath,\s*\{\s*force:\s*true\s*\}\)/
    );
    assert.match(
      source,
      /artifactPath: browserTraceLatestArtifactPath,\s*command: 'bun run bench:react:huge-document:browser-trace:local'/
    );
    assert.match(
      source,
      /SLATE_BROWSER_TRACE_SURFACES:\s*'stagedActiveDOMGroup,stagedContentVisibility'/
    );
    assert.match(source, /SLATE_BROWSER_TRACE_SURFACES:\s*'virtualized'/);
    assert.match(source, /react-huge-document-staged-diagnostic-trace/);
    assert.match(source, /stagedDiagnosticBurstToPaintPerOpP95Ms/);
    assert.match(
      source,
      /if \(!smoke\) \{\s*add\(\{\s*budget: 1\.5,\s*metric: 'legacyCompareWorstP95Ratio'/
    );
    assert.match(
      source,
      /middleBlockTypeMs:\s*\{\s*budget:\s*5,\s*stat:\s*'p75'\s*\}/
    );
    assert.match(
      source,
      /selectAllMs:\s*\{\s*budget:\s*5,\s*stat:\s*'p75'\s*\}/
    );
    assert.match(
      source,
      /startBlockTypeMs:\s*\{\s*budget:\s*5,\s*stat:\s*'p75'\s*\}/
    );
    assert.match(source, /rawP95Ms: lane\.currentP95Ms/);
    assert.match(source, /overBudgetSampleCount: sampleCountAbove/);
    assert.match(source, /selectToPaintP95Ms/);
    assert.match(source, /selectionReadyP95Ms/);
    assert.match(source, /browserTraceSelectToPaintP95Ms/);
    assert.match(source, /browserTraceSelectionReadyP95Ms/);
    assert.match(source, /browserTraceMaterializedSelectToPaintP95Ms/);
    assert.match(source, /browserTraceMaterializedSelectionReadyP95Ms/);
    assert.match(source, /virtualizedSelectToPaintP95Ms/);
    assert.match(source, /virtualizedSelectionReadyP95Ms/);
    assert.match(source, /virtualizedMaterializedSelectToPaintP95Ms/);
    assert.match(source, /virtualizedMaterializedSelectionReadyP95Ms/);
    assert.match(source, /selectMaterializationFramesP95/);
    assert.match(source, /selectMaterializationScrollDeltaP95/);
    assert.match(source, /materializedSelectMaterializationFramesP95/);
    assert.match(source, /materializedSelectMaterializationScrollDeltaP95/);
    assert.match(source, /virtualizedSelectMaterializationFramesP95/);
    assert.match(source, /virtualizedSelectMaterializationScrollDeltaP95/);
    assert.match(
      source,
      /virtualizedMaterializedSelectMaterializationFramesP95/
    );
    assert.match(
      source,
      /virtualizedMaterializedSelectMaterializationScrollDeltaP95/
    );
    assert.match(source, /react_huge_doc_full_select_to_paint_p95_ms/);
    assert.match(source, /react_huge_doc_full_selection_ready_p95_ms/);
    assert.match(
      source,
      /react_huge_doc_full_materialized_select_to_paint_p95_ms/
    );
    assert.match(
      source,
      /react_huge_doc_full_materialized_selection_ready_p95_ms/
    );
    assert.match(
      source,
      /react_huge_doc_full_virtualized_select_to_paint_p95_ms/
    );
    assert.match(
      source,
      /react_huge_doc_full_virtualized_selection_ready_p95_ms/
    );
    assert.match(
      source,
      /react_huge_doc_full_virtualized_materialized_select_to_paint_p95_ms/
    );
    assert.match(
      source,
      /react_huge_doc_full_virtualized_materialized_selection_ready_p95_ms/
    );
    assert.match(
      source,
      /react_huge_doc_full_select_materialization_frames_p95/
    );
    assert.match(
      source,
      /react_huge_doc_full_select_materialization_scroll_delta_p95_px/
    );
    assert.match(
      source,
      /react_huge_doc_full_materialized_select_materialization_frames_p95/
    );
    assert.match(
      source,
      /react_huge_doc_full_materialized_select_materialization_scroll_delta_p95_px/
    );
    assert.match(
      source,
      /react_huge_doc_full_virtualized_select_materialization_frames_p95/
    );
    assert.match(
      source,
      /react_huge_doc_full_virtualized_select_materialization_scroll_delta_p95_px/
    );
    assert.match(
      source,
      /react_huge_doc_full_virtualized_materialized_select_materialization_frames_p95/
    );
    assert.match(
      source,
      /react_huge_doc_full_virtualized_materialized_select_materialization_scroll_delta_p95_px/
    );
    assert.match(source, /partialDOMPromotionSteadyP75Ms/);
    assert.match(source, /metric: 'partialDOMPromotionSteadyP75Ms'/);
    assert.match(source, /metric: 'partialDOMPromotionSteadyP95Ms'/);
    assert.match(
      source,
      /react_huge_doc_full_partial_dom_promotion_steady_p75_ms/
    );
    assert.match(source, /browserTraceBurstToPaintPerOpP95Ms/);
    assert.match(source, /browserTraceModelTypeToPaintP95Ms/);
    assert.match(source, /browserTraceModelTypeToReadyP95Ms/);
    assert.match(source, /browserTraceModelBurstToPaintPerOpP95Ms/);
    assert.match(source, /browserTraceCoreNotifyListenersP95Ms/);
    assert.match(source, /browserTraceSelectorDispatchP95Ms/);
    assert.match(source, /virtualizedBurstToPaintPerOpP95Ms/);
    assert.match(source, /virtualizedModelTypeToPaintP95Ms/);
    assert.match(source, /virtualizedModelTypeToReadyP95Ms/);
    assert.match(source, /virtualizedModelBurstToPaintPerOpP95Ms/);
    assert.match(source, /virtualizedCoreNotifyListenersP95Ms/);
    assert.match(source, /virtualizedSelectorDispatchP95Ms/);
    assert.match(source, /react_huge_doc_full_burst_to_paint_per_op_p95_ms/);
    assert.match(source, /react_huge_doc_full_model_type_to_paint_p95_ms/);
    assert.match(source, /react_huge_doc_full_model_type_to_ready_p95_ms/);
    assert.match(
      source,
      /react_huge_doc_full_model_burst_to_paint_per_op_p95_ms/
    );
    assert.match(
      source,
      /react_huge_doc_full_virtualized_model_type_to_paint_p95_ms/
    );
    assert.match(
      source,
      /react_huge_doc_full_virtualized_model_type_to_ready_p95_ms/
    );
    assert.match(
      source,
      /react_huge_doc_full_virtualized_model_burst_to_paint_per_op_p95_ms/
    );
    assert.match(source, /react_huge_doc_full_core_notify_listeners_p95_ms/);
    assert.match(source, /react_huge_doc_full_core_notify_listeners_count_p95/);
    assert.match(
      source,
      /react_huge_doc_full_core_notify_commit_listeners_p95_ms/
    );
    assert.match(
      source,
      /react_huge_doc_full_core_notify_extension_commit_listeners_p95_ms/
    );
    assert.match(
      source,
      /react_huge_doc_full_core_notify_snapshot_listeners_p95_ms/
    );
    assert.match(
      source,
      /react_huge_doc_full_core_notify_source_listeners_p95_ms/
    );
    assert.match(source, /react_huge_doc_full_core_listener_snapshot_p95_ms/);
    assert.match(source, /react_huge_doc_full_selector_dispatch_p95_ms/);
    assert.match(source, /react_huge_doc_full_selector_dispatch_count_p95/);
    assert.match(source, /react_huge_doc_full_selector_check_count_p95/);
    assert.match(source, /react_huge_doc_full_selector_notify_count_p95/);
    assert.match(source, /react_huge_doc_full_selector_subscription_count_p95/);
    assert.match(source, /react_huge_doc_full_budget_failure_count/);
    assert.match(source, /react_huge_doc_full_core_worst_budget_ratio/);
    assert.match(source, /react_huge_doc_full_virtualized_dom_nodes_p95/);
    assert.match(source, /strictBudget && budgetFailures\.length > 0/);
  });

  it('keeps browser long-task attribution claim width explicit', () => {
    const source = readFileSync(hugeDocumentBrowserTracePath, 'utf8');
    const helperSource = extractConstFunctionSource(
      source,
      'summarizeLongTaskAttributionTotals',
      'summarizeAttributionTotals'
    );
    const round = (value: number) => Number(value.toFixed(2));
    const summarizeLongTaskAttributionTotals = Function(
      'round',
      `${helperSource}; return summarizeLongTaskAttributionTotals`
    )(round) as (
      entries: Array<{
        attribution?: Array<{
          duration?: number;
          forcedStyleAndLayoutDuration?: number;
        }>;
        duration?: number;
      }>
    ) => {
      longTaskAttributionClaimWidth: string;
      longTaskAttributionEntryCount: number;
      longTaskAttributedDurationMs: number;
      longTaskUnattributedDurationMs: number;
    };

    assert.deepEqual(
      summarizeLongTaskAttributionTotals([
        {
          attribution: [{ duration: 0 }],
          duration: 119.2,
        },
      ]),
      {
        longTaskAttributionClaimWidth: 'unattributed',
        longTaskAttributionEntryCount: 1,
        longTaskAttributedDurationMs: 0,
        longTaskUnattributedDurationMs: 119.2,
      }
    );
    assert.deepEqual(
      summarizeLongTaskAttributionTotals([
        {
          attribution: [{ duration: 20 }],
          duration: 50,
        },
      ]),
      {
        longTaskAttributionClaimWidth: 'partial',
        longTaskAttributionEntryCount: 1,
        longTaskAttributedDurationMs: 20,
        longTaskUnattributedDurationMs: 30,
      }
    );
    assert.match(source, /longTaskAttributionClaimWidth/);
    assert.match(source, /longTaskAttributedDurationMs/);
    assert.match(source, /longTaskUnattributedDurationMs/);
    assert.match(
      source,
      /\$\{prefix\}_type_after_delete_long_task_attributed_ms/
    );
    assert.match(
      source,
      /\$\{prefix\}_type_after_delete_long_task_unattributed_ms/
    );
  });

  it('keeps huge-document burst typing normalized per operation', () => {
    const source = readFileSync(hugeDocumentBrowserTracePath, 'utf8');

    assert.match(
      source,
      /burstToPaintPerOpMs:\s*\(paintTime - typeStart\) \/ typeText\.length/
    );
    assert.match(source, /burstToPaintPerOpMs: summarizeMetric/);
    assert.match(source, /modelTypeToPaintMs: summarizeMetric/);
    assert.match(source, /modelTypeToReadyMs: summarizeMetric/);
    assert.match(source, /modelBurstToPaintPerOpMs: summarizeMetric/);
    assert.match(source, /react_huge_doc_model_type_to_paint_p95_ms/);
    assert.match(source, /react_huge_doc_model_type_to_ready_p95_ms/);
    assert.match(source, /react_huge_doc_model_burst_to_paint_per_op_p95_ms/);
    assert.match(source, /\$\{prefix\}_model_type_to_paint_p95_ms/);
    assert.match(source, /\$\{prefix\}_model_type_to_ready_p95_ms/);
    assert.match(source, /\$\{prefix\}_model_burst_to_paint_per_op_p95_ms/);
    assert.match(source, /selectReadyMs: summarizeMetric/);
    assert.match(source, /materializedSelectReadyMs: summarizeMetric/);
    assert.match(source, /selectMaterializationFrames: summarizeMetric/);
    assert.match(source, /selectMaterializationScrollDelta: summarizeMetric/);
    assert.match(
      source,
      /materializedSelectMaterializationFrames: summarizeMetric/
    );
    assert.match(
      source,
      /materializedSelectMaterializationScrollDelta: summarizeMetric/
    );
    assert.match(source, /react_huge_doc_selection_ready_p95_ms/);
    assert.match(source, /\$\{prefix\}_selection_ready_p95_ms/);
    assert.match(source, /materializedSelectMs: summarizeMetric/);
    assert.match(source, /react_huge_doc_materialized_select_to_paint_p95_ms/);
    assert.match(source, /react_huge_doc_materialized_selection_ready_p95_ms/);
    assert.match(source, /\$\{prefix\}_materialized_select_to_paint_p95_ms/);
    assert.match(source, /\$\{prefix\}_materialized_selection_ready_p95_ms/);
    assert.match(source, /react_huge_doc_select_materialization_frames_p95/);
    assert.match(
      source,
      /react_huge_doc_select_materialization_scroll_delta_p95_px/
    );
    assert.match(
      source,
      /react_huge_doc_materialized_select_materialization_frames_p95/
    );
    assert.match(
      source,
      /react_huge_doc_materialized_select_materialization_scroll_delta_p95_px/
    );
    assert.match(source, /\$\{prefix\}_select_materialization_frames_p95/);
    assert.match(
      source,
      /\$\{prefix\}_select_materialization_scroll_delta_p95_px/
    );
    assert.match(
      source,
      /\$\{prefix\}_materialized_select_materialization_frames_p95/
    );
    assert.match(
      source,
      /\$\{prefix\}_materialized_select_materialization_scroll_delta_p95_px/
    );
    assert.match(source, /clickDispatchMs: summarizeMetric/);
    assert.match(source, /clickMouseMoveMs: summarizeMetric/);
    assert.match(source, /clickMouseDownMs: summarizeMetric/);
    assert.match(source, /clickMouseDownPreEventMs: summarizeMetric/);
    assert.match(source, /clickMouseDownEventMs: summarizeMetric/);
    assert.match(source, /clickMouseDownPostEventMs: summarizeMetric/);
    assert.match(source, /clickMouseUpMs: summarizeMetric/);
    assert.match(source, /clickSelectionWaitMs: summarizeMetric/);
    assert.match(source, /clickPaintWaitMs: summarizeMetric/);
    assert.match(source, /react_huge_doc_click_dispatch_p95_ms/);
    assert.match(source, /react_huge_doc_click_mouse_move_p95_ms/);
    assert.match(source, /react_huge_doc_click_mouse_down_p95_ms/);
    assert.match(source, /react_huge_doc_click_mouse_down_pre_event_p95_ms/);
    assert.match(source, /react_huge_doc_click_mouse_down_event_p95_ms/);
    assert.match(source, /react_huge_doc_click_mouse_down_post_event_p95_ms/);
    assert.match(source, /react_huge_doc_click_mouse_down_event_missing_p95/);
    assert.match(source, /react_huge_doc_root_mousedown_capture_p95_ms/);
    assert.match(source, /react_huge_doc_root_mousedown_coordinate_p95_ms/);
    assert.match(source, /react_huge_doc_root_mousedown_start_range_p95_ms/);
    assert.match(
      source,
      /react_huge_doc_root_mousedown_projected_endpoint_p95_ms/
    );
    assert.match(
      source,
      /react_huge_doc_root_mousedown_apply_selection_p95_ms/
    );
    assert.match(source, /react_huge_doc_click_mouse_up_p95_ms/);
    assert.match(source, /react_huge_doc_click_selection_wait_p95_ms/);
    assert.match(source, /react_huge_doc_click_paint_wait_p95_ms/);
    assert.match(source, /\$\{prefix\}_click_dispatch_p95_ms/);
    assert.match(source, /\$\{prefix\}_click_mouse_move_p95_ms/);
    assert.match(source, /\$\{prefix\}_click_mouse_down_p95_ms/);
    assert.match(source, /\$\{prefix\}_click_mouse_down_pre_event_p95_ms/);
    assert.match(source, /\$\{prefix\}_click_mouse_down_event_p95_ms/);
    assert.match(source, /\$\{prefix\}_click_mouse_down_post_event_p95_ms/);
    assert.match(source, /\$\{prefix\}_click_mouse_down_event_missing_p95/);
    assert.match(source, /\$\{prefix\}_root_mousedown_capture_p95_ms/);
    assert.match(source, /\$\{prefix\}_root_mousedown_coordinate_p95_ms/);
    assert.match(source, /\$\{prefix\}_root_mousedown_start_range_p95_ms/);
    assert.match(
      source,
      /\$\{prefix\}_root_mousedown_projected_endpoint_p95_ms/
    );
    assert.match(source, /\$\{prefix\}_root_mousedown_apply_selection_p95_ms/);
    assert.match(source, /\$\{prefix\}_click_mouse_up_p95_ms/);
    assert.match(source, /SLATE_BROWSER_TRACE_SELECT_ALL_DELETE/);
    assert.match(source, /SLATE_BROWSER_TRACE_SELECT_ALL_DELETE_ALLOW_FAILURE/);
    assert.match(source, /SLATE_BROWSER_TRACE_AFTER_DELETE_TEXT/);
    assert.match(source, /SLATE_BROWSER_TRACE_AFTER_DELETE_INPUT_MODE/);
    assert.match(source, /SLATE_BROWSER_TRACE_RUN_LABEL/);
    assert.match(source, /runStartedAt/);
    assert.match(source, /selectAllDeleteSurfaceState/);
    assert.match(source, /surfaceState: selectAllDeleteSurfaceState/);
    assert.match(source, /effectiveStrategy: sample\.effectiveStrategy/);
    assert.match(source, /mountedTopLevelCount: sample\.mountedTopLevelCount/);
    assert.match(source, /timerEvents: \[\]/);
    assert.match(source, /slateTraceTimerCallback/);
    assert.match(source, /summarizeTimerEvents/);
    assert.match(source, /timerDurationMs/);
    assert.match(source, /timerEventCount/);
    assert.match(source, /page\.keyboard\.insertText\(typeText\)/);
    assert.match(
      source,
      /after-delete-\$\{sanitizeArtifactSegment\(selectAllDeleteInputMode\)\}/
    );
    assert.match(
      source,
      /after-delete-text-\$\{sanitizeArtifactSegment\(selectAllDeleteTypeText\)\}/
    );
    assert.match(
      source,
      /run-\$\{sanitizeArtifactSegment\(\[runLabel, runStartedAt\]/
    );
    assert.match(source, /measureSelectAllDeleteFlow/);
    assert.match(source, /\$\{prefix\}_select_all_ready_ms/);
    assert.match(source, /\$\{prefix\}_delete_ready_ms/);
    assert.match(source, /\$\{prefix\}_type_after_delete_dispatch_ms/);
    assert.match(source, /typeAfterDeleteInputMode/);
    assert.match(source, /\$\{prefix\}_type_after_delete_wait_for_model_ms/);
    assert.match(source, /\$\{prefix\}_type_after_delete_beforeinput_count/);
    assert.match(source, /\$\{prefix\}_type_after_delete_beforeinput_span_ms/);
    assert.match(
      source,
      /\$\{prefix\}_type_after_delete_beforeinput_max_gap_ms/
    );
    assert.match(
      source,
      /\$\{prefix\}_type_after_delete_beforeinput_p95_gap_ms/
    );
    assert.match(source, /\$\{prefix\}_type_after_delete_input_count/);
    assert.match(source, /\$\{prefix\}_type_after_delete_input_span_ms/);
    assert.match(source, /\$\{prefix\}_type_after_delete_input_max_gap_ms/);
    assert.match(source, /\$\{prefix\}_type_after_delete_input_p95_gap_ms/);
    assert.match(source, /\$\{prefix\}_type_after_delete_long_task_count/);
    assert.match(source, /\$\{prefix\}_type_after_delete_long_task_total_ms/);
    assert.match(source, /\$\{prefix\}_type_after_delete_long_task_max_ms/);
    assert.match(
      source,
      /\$\{prefix\}_type_after_delete_long_task_attributed_ms/
    );
    assert.match(
      source,
      /\$\{prefix\}_type_after_delete_long_task_unattributed_ms/
    );
    assert.match(
      source,
      /\$\{prefix\}_type_after_delete_long_animation_frame_count/
    );
    assert.match(
      source,
      /\$\{prefix\}_type_after_delete_long_animation_frame_total_ms/
    );
    assert.match(
      source,
      /\$\{prefix\}_type_after_delete_long_animation_frame_max_ms/
    );
    assert.match(source, /\$\{prefix\}_type_after_delete_profiler_duration_ms/);
    assert.match(source, /typeAfterDeleteBeforeInputEvents/);
    assert.match(source, /gapsMs: gaps\.slice\(-32\)/);
    assert.match(source, /timeline: events\.slice\(-32\)/);
    assert.match(source, /inputSelectionPreferenceReason/);
    assert.match(source, /modelOwnedTextInputGuard/);
    assert.match(source, /pendingNativeTextInputRepairPathKey/);
    assert.match(source, /compactPerformanceAttribution/);
    assert.match(source, /compactLongAnimationFrameScripts/);
    assert.match(source, /summarizeAttributionEntries/);
    assert.match(source, /summarizeLongTaskAttributionTotals/);
    assert.match(source, /longTaskAttribution/);
    assert.match(source, /longTaskAttributionClaimWidth/);
    assert.match(source, /longTaskDurationMs: summarizeMetric/);
    assert.match(source, /longTaskAttributedDurationMs: summarizeMetric/);
    assert.match(source, /longTaskAttributionEntryCount: summarizeMetric/);
    assert.match(source, /longTaskUnattributedDurationMs: summarizeMetric/);
    assert.match(source, /longTaskAttributedDurationMs/);
    assert.match(source, /longTaskUnattributedDurationMs/);
    assert.match(source, /interactionSequenceToPaintMs: summarizeMetric/);
    assert.match(source, /react_huge_doc_interaction_sequence_to_paint_p95_ms/);
    assert.match(source, /\$\{prefix\}_interaction_sequence_to_paint_p95_ms/);
    assert.match(source, /react_huge_doc_long_task_total_p95_ms/);
    assert.match(source, /react_huge_doc_long_task_attributed_p95_ms/);
    assert.match(source, /react_huge_doc_long_task_unattributed_p95_ms/);
    assert.match(source, /\$\{prefix\}_long_task_total_p95_ms/);
    assert.match(source, /\$\{prefix\}_long_task_attributed_p95_ms/);
    assert.match(source, /\$\{prefix\}_long_task_unattributed_p95_ms/);
    assert.match(source, /longAnimationFrameAttribution/);
    assert.match(source, /forcedStyleAndLayoutDuration/);
    assert.match(source, /\$\{prefix\}_undo_delete_to_paint_ms/);
    assert.match(source, /\$\{prefix\}_undo_delete_restored/);
    assert.match(source, /\$\{prefix\}_click_selection_wait_p95_ms/);
    assert.match(source, /\$\{prefix\}_click_paint_wait_p95_ms/);
    assert.match(source, /react_huge_doc_core_notify_listeners_p95_ms/);
    assert.match(source, /react_huge_doc_core_notify_listeners_count_p95/);
    assert.match(source, /react_huge_doc_core_notify_commit_listeners_p95_ms/);
    assert.match(
      source,
      /react_huge_doc_core_notify_extension_commit_listeners_p95_ms/
    );
    assert.match(
      source,
      /react_huge_doc_core_notify_snapshot_listeners_p95_ms/
    );
    assert.match(source, /react_huge_doc_core_notify_source_listeners_p95_ms/);
    assert.match(source, /react_huge_doc_core_listener_snapshot_p95_ms/);
    assert.match(source, /react_huge_doc_selector_dispatch_p95_ms/);
    assert.match(source, /react_huge_doc_selector_dispatch_count_p95/);
    assert.match(source, /react_huge_doc_selector_check_count_p95/);
    assert.match(source, /react_huge_doc_selector_notify_count_p95/);
    assert.match(source, /react_huge_doc_selector_subscription_count_p95/);
    assert.match(source, /\$\{prefix\}_core_notify_listeners_p95_ms/);
    assert.match(source, /\$\{prefix\}_core_notify_listeners_count_p95/);
    assert.match(source, /\$\{prefix\}_core_notify_commit_listeners_p95_ms/);
    assert.match(
      source,
      /\$\{prefix\}_core_notify_extension_commit_listeners_p95_ms/
    );
    assert.match(source, /\$\{prefix\}_core_notify_snapshot_listeners_p95_ms/);
    assert.match(source, /\$\{prefix\}_core_notify_source_listeners_p95_ms/);
    assert.match(source, /\$\{prefix\}_core_listener_snapshot_p95_ms/);
    assert.match(source, /\$\{prefix\}_selector_dispatch_p95_ms/);
    assert.match(source, /\$\{prefix\}_selector_dispatch_count_p95/);
    assert.match(source, /\$\{prefix\}_selector_check_count_p95/);
    assert.match(source, /\$\{prefix\}_selector_notify_count_p95/);
    assert.match(source, /\$\{prefix\}_selector_subscription_count_p95/);
    assert.match(source, /selector:selector-dispatch-checks/);
    assert.match(source, /selector:selector-dispatch-notifies/);
    assert.match(source, /selector:selector-dispatch-subscriptions/);
    assert.match(
      source,
      /const key = event\.id \? `\$\{event\.kind\}:\$\{event\.id\}` : event\.kind/
    );
    assert.match(
      source,
      /root\.__slateBrowserHandle\?\.importDOMSelection\?\.\(\)/
    );
    assert.match(
      source,
      /root\?\.__slateBrowserHandle\?\.getSelection\?\.\(\)/
    );
    assert.match(source, /pathMatches\(anchorPath\)/);
    assert.match(source, /handleSelection\?\.anchor\?\.offset === offset/);
    assert.match(source, /acceptsNativeSelection/);
    assert.match(source, /acceptsRepairBackedModelSelection/);
    assert.match(
      source,
      /inputState\?\.modelSelectionPreference\?\.reason === 'repair-induced'/
    );
    assert.match(source, /handle\?\.getInputState\?\.\(\) \?\? null/);
    assert.match(source, /react_huge_doc_burst_to_paint_per_op_p95_ms/);
  });

  it('exposes the huge-document cross-editor browser benchmark as a guarded local command', () => {
    const source = readFileSync(hugeDocumentCrossEditorPath, 'utf8');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as {
      scripts: Record<string, string>;
    };

    assert.equal(
      packageJson.scripts['bench:react:huge-document:cross-editor:local'],
      'bun ./scripts/benchmarks/browser/react/huge-document-cross-editor.mjs'
    );
    assert.match(
      source,
      /tmp\/slate-react-huge-document-cross-editor-benchmark\.json/
    );
    assert.match(source, /CROSS_EDITOR_HUGE_PROSEMIRROR_REPO/);
    assert.match(source, /CROSS_EDITOR_HUGE_LEXICAL_REPO/);
    assert.match(source, /prosemirrorTransform/);
    assert.match(source, /'slateAuto,slateVirtualized,prosemirror,lexical'/);
    assert.match(source, /createReactEditor/);
    assert.match(source, /Missing external editor build outputs/);
    assert.match(
      source,
      /burstToPaintPerOpMs:\s*\(typePaint - typeStart\) \/ typeOps/
    );
    assert.match(
      source,
      /react_huge_doc_cross_editor_\$\{surface\}_burst_to_paint_per_op_p95_ms/
    );
    assert.match(
      source,
      /react_huge_doc_cross_editor_\$\{surface\}_type_to_paint_p95_ms/
    );
    assert.match(
      source,
      /react_huge_doc_cross_editor_\$\{surface\}_select_to_paint_p95_ms/
    );
    assert.match(source, /materializedSelectToPaintMs/);
    assert.match(
      source,
      /react_huge_doc_cross_editor_\$\{surface\}_materialized_select_to_paint_p95_ms/
    );
    assert.match(
      source,
      /react_huge_doc_cross_editor_\$\{surface\}_dom_nodes_p95/
    );
    assert.match(
      source,
      /react_huge_doc_cross_editor_\$\{surface\}_long_task_max_p95_ms/
    );
  });

  it('runs the observation compare node traversal through legacy and v2 node APIs', () => {
    const source = readFileSync(observationComparePath, 'utf8');

    assert.match(
      source,
      /Slate\.NodeApi\s*\?\?\s*Slate\.Node\s*\?\?\s*SlateInternal\.NodeApi\s*\?\?\s*SlateInternal\.Node/
    );
    assert.match(source, /NodeApi\.nodes\(editor, \{ at: \[\] \}\)/);
    assert.doesNotMatch(source, /const \{\s*createEditor,\s*Node\s*\} = Slate/);
  });

  it('keeps observation compare children reads out of snapshot materialization', () => {
    const source = readFileSync(observationComparePath, 'utf8');
    const getChildrenStart = source.indexOf('const getChildren =');
    const insertTextStart = source.indexOf('const insertText =');
    const getChildrenSource = source.slice(getChildrenStart, insertTextStart);

    assert.ok(getChildrenStart >= 0);
    assert.ok(insertTextStart > getChildrenStart);
    assert.ok(
      getChildrenSource.indexOf('Editor.getChildren') <
        getChildrenSource.indexOf('Editor.getSnapshot')
    );
  });

  it('keeps normalization compare children reads out of snapshot materialization', () => {
    const source = readFileSync(normalizationComparePath, 'utf8');
    const getChildrenStart = source.indexOf('const getChildren =');
    const normalizeStart = source.indexOf('const normalizeEditor =');
    const getChildrenSource = source.slice(getChildrenStart, normalizeStart);

    assert.ok(getChildrenStart >= 0);
    assert.ok(normalizeStart > getChildrenStart);
    assert.ok(
      getChildrenSource.indexOf('Editor.getChildren') <
        getChildrenSource.indexOf('Editor.getSnapshot')
    );
  });
});

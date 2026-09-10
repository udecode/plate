import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const coreCurrentDir = fileURLToPath(
  new URL('../../../benchmarks/slate-v2/donor/core/current/', import.meta.url)
);
const benchmarkTargetsPath = fileURLToPath(
  new URL('../../../benchmarks/targets/slate-v2.json', import.meta.url)
);
const legacyReactComparePath = fileURLToPath(
  new URL(
    '../../../benchmarks/slate-v2/donor/browser/react/huge-document-legacy-compare.mjs',
    import.meta.url
  )
);

const observationComparePath = fileURLToPath(
  new URL(
    '../../../benchmarks/slate-v2/donor/core/compare/observation.mjs',
    import.meta.url
  )
);
const hugeDocumentComparePath = fileURLToPath(
  new URL(
    '../../../benchmarks/slate-v2/donor/core/compare/huge-document.mjs',
    import.meta.url
  )
);
const historyRetainedMemoryPath = fileURLToPath(
  new URL(
    '../../../benchmarks/slate-v2/donor/core/current/history-retained-memory.mjs',
    import.meta.url
  )
);
const clipboardLargePayloadPath = fileURLToPath(
  new URL(
    '../../../benchmarks/slate-v2/donor/core/current/clipboard-large-payload.mjs',
    import.meta.url
  )
);
const transactionExecutionPath = fileURLToPath(
  new URL(
    '../../../benchmarks/slate-v2/donor/core/current/transaction-execution.mjs',
    import.meta.url
  )
);
const historyComparePath = fileURLToPath(
  new URL(
    '../../../benchmarks/slate-v2/donor/core/compare/history.mjs',
    import.meta.url
  )
);
const normalizationComparePath = fileURLToPath(
  new URL(
    '../../../benchmarks/slate-v2/donor/core/compare/normalization.mjs',
    import.meta.url
  )
);

type BenchmarkSummary = {
  max: number;
  mean: number;
  median?: number;
  min?: number;
  p50?: number;
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

const readBenchmarkTargetCommands = () => {
  const targetRegistry = JSON.parse(
    readFileSync(benchmarkTargetsPath, 'utf-8')
  ) as {
    targets: Array<{ command: string }>;
  };

  return targetRegistry.targets.map((target) => target.command);
};

const summaryNumbers = (summary: BenchmarkSummary) =>
  Object.values(summary).filter(
    (value): value is number => typeof value === 'number'
  );

const extractSummarizeSource = (source: string) => {
  const summarizeStart = source.indexOf('const summarize =');

  assert.ok(summarizeStart !== -1);

  const percentileStart = source.lastIndexOf(
    'const percentile =',
    summarizeStart
  );
  const extractionStart =
    percentileStart !== -1 ? percentileStart : summarizeStart;
  const bodyStart = source.indexOf('{', summarizeStart);

  assert.ok(bodyStart !== -1);

  let depth = 0;

  for (let index = bodyStart; index < source.length; index++) {
    if (source[index] === '{') {
      depth += 1;
    }

    if (source[index] === '}') {
      depth -= 1;

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

  assert.ok(functionStart !== -1);

  const dependencyStart = dependencyName
    ? source.lastIndexOf(`const ${dependencyName} =`, functionStart)
    : -1;
  const extractionStart =
    dependencyStart >= 0 ? dependencyStart : functionStart;
  const bodyStart = source.indexOf('{', functionStart);
  const nextDeclaration = source.indexOf('\nconst ', functionStart + 1);

  if (nextDeclaration !== -1 && nextDeclaration < bodyStart) {
    return source.slice(extractionStart, nextDeclaration).trimEnd();
  }

  assert.ok(bodyStart !== -1);

  let depth = 0;

  for (let index = bodyStart; index < source.length; index++) {
    if (source[index] === '{') {
      depth += 1;
    }

    if (source[index] === '}') {
      depth -= 1;

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
  const source = extractSummarizeSource(readFileSync(path, 'utf-8'));
  const round = (value: number) => Number(value.toFixed(2));
  const summarize = new Function('round', `${source}; return summarize`)(
    round
  ) as (samples: number[]) => BenchmarkSummary;

  return summarize([]);
};

const emptySummaryFromPath = <TSummary>(
  path: string,
  functionName: string,
  dependencyName?: string
) => {
  const source = extractConstFunctionSource(
    readFileSync(path, 'utf-8'),
    functionName,
    dependencyName
  );
  const round = (value: number) => Number(value.toFixed(2));
  const summarize = new Function('round', `${source}; return ${functionName}`)(
    round
  ) as (samples: number[]) => TSummary;

  return summarize([]);
};

describe('core benchmark scripts contract', () => {
  it('returns finite zero summaries for empty shared benchmark samples', async () => {
    const stats = (await import(
      new URL(
        '../../../benchmarks/slate-v2/donor/shared/stats.mjs',
        import.meta.url
      ).href
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

    assert.deepEqual(stats.summarize([]), expected);
    assert.ok(summaryNumbers(stats.summarize([])).every(Number.isFinite));
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
      readFileSync(transactionExecutionPath, 'utf-8'),
      'mean'
    );
    const mean = new Function(`${meanSource}; return mean`) as () => (
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

  it('exposes every current core benchmark through the benchmark target registry', () => {
    const coreBenchmarkFiles = readdirSync(coreCurrentDir)
      .filter((file) => file.endsWith('.mjs'))
      .sort();
    const benchmarkTargetCommands = readBenchmarkTargetCommands();

    const missingFiles = coreBenchmarkFiles.filter((file) => {
      const expectedCommand = `benchmarks/slate-v2/donor/core/current/${file}`;

      return !benchmarkTargetCommands.some((command) =>
        command.includes(expectedCommand)
      );
    });
    const commandsWithoutSourceAliases = benchmarkTargetCommands.filter(
      (command) =>
        command.includes('benchmarks/slate-v2/donor/core/current/') &&
        !command.includes('--preload ./config/plite-source-aliases.ts')
    );

    assert.deepEqual(missingFiles, []);
    assert.deepEqual(commandsWithoutSourceAliases, []);
  });
});

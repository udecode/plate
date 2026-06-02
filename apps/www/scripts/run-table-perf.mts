import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import puppeteer, { type Page } from 'puppeteer';

type BenchmarkName = 'input' | 'mount' | 'selection';
type PresetName = 'smoke';

type TableConfig = {
  cols: number;
  rows: number;
};

type Metrics = {
  initialRender: number | null;
  lastRenderDuration: number | null;
  renderCount: number;
  renderDurations: number[];
};

type BenchmarkResult = {
  max: number;
  mean: number;
  median: number;
  min: number;
  p95: number;
  p99: number;
  stdDev: number;
};

type LatencyResult = {
  max: number;
  mean: number;
  median: number;
  min: number;
  p95: number;
  samples: number[];
};

type SelectionLatencyResult = LatencyResult & {
  selectedCells: number;
  simulatedDelayMs: number;
};

type SelectionSimulationConfig = {
  cols: number;
  delayMs: number;
  rows: number;
};

type TablePerfHarnessConfig = {
  cols: number;
  rows: number;
  selectionCols?: number;
  selectionDelayMs?: number;
  selectionRows?: number;
};

type TablePerfHarnessSnapshot = {
  benchmarkResult: BenchmarkResult | null;
  config: TableConfig;
  inputLatencyResult: LatencyResult | null;
  metrics: Metrics;
  selectionLatencyResult: SelectionLatencyResult | null;
  selectionSimulation: SelectionSimulationConfig;
};

type RunnerHarness = {
  configure: (
    config: TablePerfHarnessConfig
  ) => Promise<TablePerfHarnessSnapshot>;
  readSnapshot: () => TablePerfHarnessSnapshot;
  runBenchmark: (benchmark: BenchmarkName) => Promise<TablePerfHarnessSnapshot>;
};

type RunnerJob = TablePerfHarnessConfig & {
  benchmarks: BenchmarkName[];
  id: string;
  timeoutMs?: number;
};

type RunnerJobResult = {
  benchmarks: Partial<Record<BenchmarkName, TablePerfHarnessSnapshot>>;
  id: string;
  settings: TablePerfHarnessConfig;
};

function getArg(name: string) {
  const index = process.argv.indexOf(`--${name}`);

  if (index === -1) return;

  return process.argv[index + 1];
}

function parseNumberArg(name: string, defaultValue: number) {
  const value = getArg(name);
  const parsed = value ? Number(value) : Number.NaN;

  return Number.isFinite(parsed) ? parsed : defaultValue;
}

function parseBenchmarks(value?: string): BenchmarkName[] {
  if (!value) return ['mount', 'input', 'selection'];

  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean) as BenchmarkName[];
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getSmokeJobs(): RunnerJob[] {
  return [
    {
      benchmarks: ['mount'],
      cols: 20,
      id: 'table-mount-20x20',
      rows: 20,
      selectionCols: 5,
      selectionDelayMs: 0,
      selectionRows: 5,
      timeoutMs: 120_000,
    },
    {
      benchmarks: ['input'],
      cols: 20,
      id: 'table-input-20x20',
      rows: 20,
      selectionCols: 5,
      selectionDelayMs: 0,
      selectionRows: 5,
      timeoutMs: 120_000,
    },
    {
      benchmarks: ['selection'],
      cols: 40,
      id: 'table-selection-40x40-10x10',
      rows: 40,
      selectionCols: 10,
      selectionDelayMs: 0,
      selectionRows: 10,
      timeoutMs: 120_000,
    },
  ];
}

async function waitForHarness(page: Page, timeoutMs: number) {
  await page.waitForFunction(
    () =>
      typeof (
        window as typeof window & {
          __tablePerfHarness?: { configure?: unknown };
        }
      ).__tablePerfHarness?.configure === 'function',
    { timeout: timeoutMs }
  );
}

async function configurePage(page: Page, config: TablePerfHarnessConfig) {
  return page.evaluate(async (nextConfig) => {
    const harness = (
      window as typeof window & {
        __tablePerfHarness?: RunnerHarness;
      }
    ).__tablePerfHarness;

    if (!harness) {
      throw new Error('Table perf harness not available on window');
    }

    return harness.configure(nextConfig);
  }, config);
}

async function readSnapshot(page: Page) {
  return page.evaluate(() => {
    const harness = (
      window as typeof window & {
        __tablePerfHarness?: RunnerHarness;
      }
    ).__tablePerfHarness;

    if (!harness) {
      throw new Error('Table perf harness not available on window');
    }

    return harness.readSnapshot();
  });
}

async function runBenchmark(
  page: Page,
  benchmark: BenchmarkName,
  timeoutMs: number
) {
  const runPromise = page.evaluate(async (nextBenchmark) => {
    const harness = (
      window as typeof window & {
        __tablePerfHarness?: RunnerHarness;
      }
    ).__tablePerfHarness;

    if (!harness) {
      throw new Error('Table perf harness not available on window');
    }

    return harness.runBenchmark(nextBenchmark);
  }, benchmark);

  const timeoutPromise = sleep(timeoutMs).then(() => {
    throw new Error(
      `Table perf benchmark timed out after ${timeoutMs}ms while running ${benchmark}`
    );
  });

  return Promise.race([runPromise, timeoutPromise]);
}

function summarizeSnapshot(snapshot: TablePerfHarnessSnapshot) {
  return {
    benchmarkMean: snapshot.benchmarkResult?.mean ?? null,
    benchmarkP95: snapshot.benchmarkResult?.p95 ?? null,
    config: snapshot.config,
    initialRender: snapshot.metrics.initialRender,
    inputMean: snapshot.inputLatencyResult?.mean ?? null,
    lastRenderDuration: snapshot.metrics.lastRenderDuration,
    renderCount: snapshot.metrics.renderCount,
    selectionMean: snapshot.selectionLatencyResult?.mean ?? null,
    selectionP95: snapshot.selectionLatencyResult?.p95 ?? null,
    selectedCells: snapshot.selectionLatencyResult?.selectedCells ?? null,
    selectionSimulation: snapshot.selectionSimulation,
  };
}

function summarizeRun(run: RunnerJobResult) {
  return {
    benchmarks: Object.fromEntries(
      Object.entries(run.benchmarks).map(([benchmark, snapshot]) => [
        benchmark,
        snapshot ? summarizeSnapshot(snapshot) : null,
      ])
    ),
    id: run.id,
    settings: run.settings,
  };
}

async function main() {
  const url = getArg('url') ?? 'http://localhost:3000/dev/table-perf';
  const outArg = getArg('out') ?? '../../tmp/table-perf-smoke.json';
  const summaryOutArg =
    getArg('summary-out') ?? '../../tmp/table-perf-smoke-summary.json';
  const preset = getArg('preset') as PresetName | undefined;
  const timeoutMs = parseNumberArg('timeout', 120_000);

  const jobs = preset
    ? getSmokeJobs()
    : [
        {
          benchmarks: parseBenchmarks(getArg('benchmarks')),
          cols: parseNumberArg('cols', 20),
          id: 'custom',
          rows: parseNumberArg('rows', 20),
          selectionCols: parseNumberArg('selection-cols', 5),
          selectionDelayMs: parseNumberArg('selection-delay', 0),
          selectionRows: parseNumberArg('selection-rows', 5),
          timeoutMs,
        },
      ];

  const browser = await puppeteer.launch({
    headless: true,
    protocolTimeout: Math.max(300_000, timeoutMs * 2),
  });

  try {
    const page = await browser.newPage();

    await page.goto(url, {
      timeout: timeoutMs,
      waitUntil: 'networkidle2',
    });
    await waitForHarness(page, timeoutMs);

    const runs: RunnerJobResult[] = [];

    for (const job of jobs) {
      console.log(
        `[table-perf] configuring ${job.id} (${job.rows}x${job.cols}, selection ${job.selectionRows}x${job.selectionCols}, delay ${job.selectionDelayMs}ms)`
      );

      await configurePage(page, job);
      await readSnapshot(page);

      const jobResult: RunnerJobResult = {
        benchmarks: {},
        id: job.id,
        settings: {
          cols: job.cols,
          rows: job.rows,
          selectionCols: job.selectionCols,
          selectionDelayMs: job.selectionDelayMs,
          selectionRows: job.selectionRows,
        },
      };

      for (const benchmark of job.benchmarks) {
        console.log(`[table-perf] running ${job.id}:${benchmark}`);
        jobResult.benchmarks[benchmark] = await runBenchmark(
          page,
          benchmark,
          job.timeoutMs ?? timeoutMs
        );
      }

      runs.push(jobResult);
    }

    const capturedAt = new Date().toISOString();
    const outPath = path.resolve(process.cwd(), outArg);
    const summaryOutPath = path.resolve(process.cwd(), summaryOutArg);
    const rawPayload = { capturedAt, preset: preset ?? null, runs, url };
    const summaryPayload = {
      capturedAt,
      preset: preset ?? null,
      runs: runs.map(summarizeRun),
      url,
    };

    await mkdir(path.dirname(outPath), { recursive: true });
    await mkdir(path.dirname(summaryOutPath), { recursive: true });
    await writeFile(outPath, JSON.stringify(rawPayload, null, 2));
    await writeFile(summaryOutPath, JSON.stringify(summaryPayload, null, 2));

    console.log(`[table-perf] wrote ${outPath}`);
    console.log(`[table-perf] wrote ${summaryOutPath}`);
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

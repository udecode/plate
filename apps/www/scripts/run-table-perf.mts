import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import puppeteer, { type Page } from 'puppeteer';

import {
  TABLE_PERF_SMOKE_BUDGETS,
  type TablePerfBenchmarkName as BenchmarkName,
  type TablePerfHarness as RunnerHarness,
  type TablePerfHarnessConfig,
  type TablePerfHarnessSnapshot,
} from '../src/app/dev/table-perf/contract';

type PresetName = 'smoke';

type RunnerJob = TablePerfHarnessConfig & {
  benchmarks: BenchmarkName[];
  id: string;
  timeoutMs?: number;
};

type RunnerPressure = {
  domNodes: number;
  dragHandles: number;
  selectedCellElements: number;
  tableCells: number;
  usedJSHeapSize: number | null;
};

type RunnerSnapshot = TablePerfHarnessSnapshot & {
  pressure: RunnerPressure;
};

type RunnerJobResult = {
  benchmarks: Partial<Record<BenchmarkName, RunnerSnapshot>>;
  id: string;
  settings: TablePerfHarnessConfig;
};

function getArg(name: string) {
  const index = process.argv.indexOf(`--${name}`);

  if (index === -1) return undefined;

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
      timeoutMs: 300_000,
    },
    {
      benchmarks: ['resize'],
      cols: 40,
      id: 'table-resize-40x40',
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

  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_resolve, reject) => {
    timeoutId = setTimeout(() => {
      reject(
        new Error(
          `Table perf benchmark timed out after ${timeoutMs}ms while running ${benchmark}`
        )
      );
    }, timeoutMs);
  });

  try {
    return await Promise.race([runPromise, timeoutPromise]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

async function readPressure(page: Page): Promise<RunnerPressure> {
  return page.evaluate(() => {
    const root = document.querySelector('[data-table-perf-editor="true"]');
    const memory = performance as Performance & {
      memory?: { usedJSHeapSize?: number };
    };

    return {
      domNodes: root?.querySelectorAll('*').length ?? 0,
      dragHandles:
        root?.querySelectorAll('[data-table-cell-drag-handle="true"]').length ??
        0,
      selectedCellElements:
        root?.querySelectorAll('[data-table-cell-selected="true"]').length ?? 0,
      tableCells: root?.querySelectorAll('td,th').length ?? 0,
      usedJSHeapSize: memory.memory?.usedJSHeapSize ?? null,
    };
  });
}

function summarizeSnapshot(snapshot: RunnerSnapshot) {
  return {
    benchmarkMean: snapshot.benchmarkResult?.mean ?? null,
    benchmarkP95: snapshot.benchmarkResult?.p95 ?? null,
    benchmarkP99: snapshot.benchmarkResult?.p99 ?? null,
    config: snapshot.config,
    initialRender: snapshot.metrics.initialRender,
    inputMean: snapshot.inputLatencyResult?.mean ?? null,
    inputP95: snapshot.inputLatencyResult?.p95 ?? null,
    inputP99: snapshot.inputLatencyResult?.p99 ?? null,
    lastRenderDuration: snapshot.metrics.lastRenderDuration,
    pressure: snapshot.pressure,
    renderCount: snapshot.metrics.renderCount,
    resizeMean: snapshot.resizeLatencyResult?.mean ?? null,
    resizeP95: snapshot.resizeLatencyResult?.p95 ?? null,
    resizeP99: snapshot.resizeLatencyResult?.p99 ?? null,
    selectionMean: snapshot.selectionLatencyResult?.mean ?? null,
    selectionP95: snapshot.selectionLatencyResult?.p95 ?? null,
    selectionP99: snapshot.selectionLatencyResult?.p99 ?? null,
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

function getBudgetFailures(runs: RunnerJobResult[]) {
  const failures: string[] = [];

  for (const run of runs) {
    const budget =
      TABLE_PERF_SMOKE_BUDGETS[run.id as keyof typeof TABLE_PERF_SMOKE_BUDGETS];

    if (!budget) continue;

    for (const [benchmark, threshold] of Object.entries(budget) as Array<
      [
        BenchmarkName,
        {
          dragHandles?: number;
          maxMs: number;
          p95Ms: number;
          p99Ms: number;
          selectedCellElements?: number;
        },
      ]
    >) {
      const snapshot = run.benchmarks[benchmark];
      const result =
        benchmark === 'mount'
          ? snapshot?.benchmarkResult
          : benchmark === 'input'
            ? snapshot?.inputLatencyResult
            : benchmark === 'resize'
              ? snapshot?.resizeLatencyResult
              : snapshot?.selectionLatencyResult;

      if (!result) {
        failures.push(`${run.id}:${benchmark} produced no result`);
        continue;
      }
      if (result.p95 > threshold.p95Ms) {
        failures.push(
          `${run.id}:${benchmark} p95 ${result.p95.toFixed(2)}ms > ${threshold.p95Ms}ms`
        );
      }
      if (result.p99 > threshold.p99Ms) {
        failures.push(
          `${run.id}:${benchmark} p99 ${result.p99.toFixed(2)}ms > ${threshold.p99Ms}ms`
        );
      }
      if (result.max > threshold.maxMs) {
        failures.push(
          `${run.id}:${benchmark} max ${result.max.toFixed(2)}ms > ${threshold.maxMs}ms`
        );
      }
      if (
        benchmark === 'selection' &&
        threshold.selectedCellElements !== undefined &&
        snapshot?.pressure.selectedCellElements !==
          threshold.selectedCellElements
      ) {
        failures.push(
          `${run.id}:${benchmark} rendered ${snapshot?.pressure.selectedCellElements ?? 0} selected cells, expected ${threshold.selectedCellElements}`
        );
      }
      if (
        benchmark === 'selection' &&
        threshold.dragHandles !== undefined &&
        snapshot?.pressure.dragHandles !== threshold.dragHandles
      ) {
        failures.push(
          `${run.id}:${benchmark} rendered ${snapshot?.pressure.dragHandles ?? 0} drag handles, expected ${threshold.dragHandles}`
        );
      }
    }
  }

  return failures;
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
        const snapshot = await runBenchmark(
          page,
          benchmark,
          job.timeoutMs ?? timeoutMs
        );
        jobResult.benchmarks[benchmark] = {
          ...snapshot,
          pressure: await readPressure(page),
        };
      }

      runs.push(jobResult);
    }

    const capturedAt = new Date().toISOString();
    const budgetFailures = preset === 'smoke' ? getBudgetFailures(runs) : [];
    const outPath = path.resolve(process.cwd(), outArg);
    const summaryOutPath = path.resolve(process.cwd(), summaryOutArg);
    const rawPayload = {
      budgetFailures,
      capturedAt,
      preset: preset ?? null,
      runs,
      url,
    };
    const summaryPayload = {
      budgetFailures,
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

    if (budgetFailures.length > 0) {
      throw new Error(
        `Table performance budgets failed:\n${budgetFailures.join('\n')}`
      );
    }
  } finally {
    await browser.close();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});

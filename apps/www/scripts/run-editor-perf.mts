import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import puppeteer, { type Page } from 'puppeteer';

import {
  CORE_PLUGIN_CENSUS_ENTRIES,
  type CorePluginCensusEntryId,
} from '../src/app/dev/editor-perf/plugin-census';
import type { EditorPerfWorkloadId } from '../src/app/dev/editor-perf/workloads';

type BenchmarkName =
  | 'construction'
  | 'core-mount'
  | 'init-dissection'
  | 'nodeid-fragment'
  | 'input'
  | 'mount'
  | 'plugin-census'
  | 'prebuilt-mount'
  | 'store-fanout';
type PresetName =
  | 'layer-0'
  | 'layer-0-smoke'
  | 'layer-1-core-plugins'
  | 'layer-1-core-plugins-smoke'
  | 'layer-3-core-stress';
type ScenarioWorkloadId = EditorPerfWorkloadId;
type VisibilityMode = 'chunk' | 'element' | 'none';
type RunnerJob = {
  benchmarks: BenchmarkName[];
  blocks: number;
  chunkSize: number;
  chunking: boolean;
  coreMountCase?: string;
  coreMountNodeId?: string;
  fanoutSubscribers?: string;
  id: string;
  pluginCensusEntry?: CorePluginCensusEntryId | 'all';
  scenarioWorkload: ScenarioWorkloadId;
  timeoutMs?: number;
  visibility: VisibilityMode;
};

type PresetRunPayload = {
  benchmarks: BenchmarkName[];
  id: string;
  results: any;
  settings: {
    blocks: number;
    chunkSize: number;
    chunking: boolean;
    scenarioWorkload: ScenarioWorkloadId;
    visibility: VisibilityMode;
  };
};

function getArg(name: string) {
  const index = process.argv.indexOf(`--${name}`);

  if (index === -1) return;

  return process.argv[index + 1];
}

function hasFlag(name: string) {
  return process.argv.includes(`--${name}`);
}

function parseBenchmarks(value?: string): BenchmarkName[] {
  if (!value) return ['construction', 'mount', 'input'];

  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean) as BenchmarkName[];
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRecoverablePageError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);

  return (
    message.includes('Benchmark timed out') ||
    message.includes('Runtime.callFunctionOn timed out') ||
    message.includes('Execution context was destroyed') ||
    message.includes('Cannot find context with specified id') ||
    message.includes('Target closed') ||
    message.includes('Session closed')
  );
}

function getMaxJobTimeout(jobs: RunnerJob[], fallbackTimeoutMs: number) {
  return Math.max(
    fallbackTimeoutMs,
    ...jobs.map((job) => job.timeoutMs ?? fallbackTimeoutMs)
  );
}

function getProtocolTimeoutMs(
  preset: PresetName | undefined,
  fallbackTimeoutMs: number
) {
  const jobs = getJobsForPreset(preset);
  const maxJobTimeout = getMaxJobTimeout(jobs, fallbackTimeoutMs);

  return Math.max(300_000, maxJobTimeout + 120_000, fallbackTimeoutMs * 2);
}

function getMountMean(results: any, scenarioId: string) {
  return results?.results?.[scenarioId]?.mount?.mean ?? null;
}

function getPrebuiltMountMean(results: any, scenarioId: string) {
  return results?.results?.[scenarioId]?.prebuiltMount?.mean ?? null;
}

function getConstructionMean(results: any, scenarioId: string) {
  return results?.results?.[scenarioId]?.construction?.mean ?? null;
}

function getInitOnlyMean(results: any, caseId: string) {
  return results?.dissection?.results?.[caseId]?.initOnly?.mean ?? null;
}

function getPluginCensusEntry(results: any, entryId: CorePluginCensusEntryId) {
  return results?.pluginCensus?.results?.[entryId] ?? null;
}

function summarizePluginCensusEntry(
  results: any,
  entryId: CorePluginCensusEntryId
) {
  const entryResults = getPluginCensusEntry(results, entryId);

  if (!entryResults) return null;

  return {
    activated: {
      deltaVsCoreMean:
        entryResults.activated?.plugin?.mean != null &&
        entryResults.activated?.['plate-core']?.mean != null
          ? entryResults.activated.plugin.mean -
            entryResults.activated['plate-core'].mean
          : null,
      plateCoreMean: entryResults.activated?.['plate-core']?.mean ?? null,
      pluginMean: entryResults.activated?.plugin?.mean ?? null,
      slateMean: entryResults.activated?.slate?.mean ?? null,
    },
    inactive: {
      deltaVsCoreMean:
        entryResults.inactive?.plugin?.mean != null &&
        entryResults.inactive?.['plate-core']?.mean != null
          ? entryResults.inactive.plugin.mean -
            entryResults.inactive['plate-core'].mean
          : null,
      plateCoreMean: entryResults.inactive?.['plate-core']?.mean ?? null,
      pluginMean: entryResults.inactive?.plugin?.mean ?? null,
      slateMean: entryResults.inactive?.slate?.mean ?? null,
    },
  };
}

function summarizePresetRun(run: PresetRunPayload) {
  return {
    id: run.id,
    settings: run.settings,
    completed: run.results?.lastCompletedRun ?? null,
    slateMountMean: getMountMean(run.results, 'slate'),
    plateCoreMountMean: getMountMean(run.results, 'plate-core'),
    plateCoreNodeIdMountMean: getMountMean(run.results, 'plate-core-nodeid'),
    plateCoreNodeIdSeededMountMean: getMountMean(
      run.results,
      'plate-core-nodeid-seeded'
    ),
    plateBasicMountMean: getMountMean(run.results, 'plate-basic'),
    slatePrebuiltMountMean: getPrebuiltMountMean(run.results, 'slate'),
    plateCorePrebuiltMountMean: getPrebuiltMountMean(run.results, 'plate-core'),
    plateCoreConstructionMean: getConstructionMean(run.results, 'plate-core'),
    rawNodeIdInitMean: getInitOnlyMean(run.results, 'plate-core-nodeid-raw'),
    seededNodeIdInitMean: getInitOnlyMean(
      run.results,
      'plate-core-nodeid-seeded'
    ),
    skipInitialNormalizeInitMean: getInitOnlyMean(
      run.results,
      'plate-core-nodeid-skip-initial-normalize'
    ),
    pluginCensusEntry:
      run.results?.pluginCensus?.activeEntryId &&
      run.results.pluginCensus.activeEntryId !== 'all'
        ? run.results.pluginCensus.activeEntryId
        : null,
    pluginCensusSummary:
      run.results?.pluginCensus?.activeEntryId &&
      run.results.pluginCensus.activeEntryId !== 'all'
        ? summarizePluginCensusEntry(
            run.results,
            run.results.pluginCensus.activeEntryId
          )
        : null,
  };
}

function summarizePresetPayload({
  capturedAt,
  preset,
  runs,
  url,
}: {
  capturedAt: string;
  preset: PresetName;
  runs: PresetRunPayload[];
  url: string;
}) {
  return {
    capturedAt,
    preset,
    url,
    runs: runs.map(summarizePresetRun),
  };
}

async function waitForHarness(page: Page, timeoutMs: number) {
  await page.waitForFunction(
    () =>
      typeof (
        window as typeof window & {
          __editorPerfHarness?: { configure?: unknown };
        }
      ).__editorPerfHarness?.configure === 'function',
    { timeout: timeoutMs }
  );
}

async function recoverHarnessPage(page: Page, timeoutMs: number) {
  await page.goto(page.url(), {
    timeout: timeoutMs,
    waitUntil: 'networkidle2',
  });
  await page.waitForSelector('[data-testid="editor-perf-json"]', {
    timeout: timeoutMs,
  });
  await waitForHarness(page, timeoutMs);
}

async function configurePage(
  page: Page,
  job: Pick<
    RunnerJob,
    | 'blocks'
    | 'chunkSize'
    | 'chunking'
    | 'coreMountCase'
    | 'coreMountNodeId'
    | 'fanoutSubscribers'
    | 'pluginCensusEntry'
    | 'scenarioWorkload'
    | 'visibility'
  >
) {
  await page.evaluate(async (controls) => {
    const harness = (
      window as typeof window & {
        __editorPerfHarness?: {
          configure: (controls: {
            blocks: number;
            chunkSize: number;
            chunking: boolean;
            coreMountCase?: string;
            coreMountNodeId?: string;
            fanoutSubscribers?: string;
            pluginCensusEntry?: CorePluginCensusEntryId | 'all';
            scenarioWorkload: ScenarioWorkloadId;
            visibility: VisibilityMode;
          }) => Promise<void>;
        };
      }
    ).__editorPerfHarness;

    if (!harness) {
      throw new Error('Editor perf harness not available on window');
    }

    await harness.configure(controls);
  }, job);
}

async function runBenchmark(
  page: Page,
  benchmark: BenchmarkName,
  timeoutMs: number
) {
  let timedOut = false;

  const runPromise = page
    .evaluate(
      async ({ benchmark }: { benchmark: BenchmarkName }) => {
        const harness = (
          window as typeof window & {
            __editorPerfHarness?: {
              runBenchmark: (benchmark: BenchmarkName) => Promise<void>;
            };
          }
        ).__editorPerfHarness;

        if (!harness) {
          throw new Error('Editor perf harness not available on window');
        }

        await harness.runBenchmark(benchmark);
      },
      { benchmark }
    )
    .catch((error) => {
      if (timedOut) return;

      throw error;
    });

  try {
    await Promise.race([
      runPromise,
      sleep(timeoutMs).then(() => {
        timedOut = true;
        throw new Error(
          `Benchmark timed out after ${timeoutMs}ms: ${benchmark}`
        );
      }),
    ]);
  } finally {
    void runPromise.catch(() => {});
  }

  await sleep(Math.min(timeoutMs, 100));
}

async function getResults(page: Page) {
  return page.evaluate(() => {
    const node = document.querySelector('[data-testid="editor-perf-json"]');

    if (!(node instanceof HTMLElement) || !node.textContent) {
      throw new Error('Benchmark JSON export not found');
    }

    return JSON.parse(node.textContent);
  });
}

async function runJobWithRecovery(
  page: Page,
  job: RunnerJob,
  timeoutMs: number
) {
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      process.stderr.write(
        `\n[editor-perf] job ${job.id} (attempt ${attempt}/${maxAttempts})\n`
      );

      await configurePage(page, job);

      for (const benchmark of job.benchmarks) {
        process.stderr.write(`[editor-perf]   benchmark ${benchmark}\n`);
        await runBenchmark(page, benchmark, job.timeoutMs ?? timeoutMs);
      }

      return await getResults(page);
    } catch (error) {
      if (!isRecoverablePageError(error) || attempt === maxAttempts) {
        throw error;
      }

      process.stderr.write(
        `[editor-perf]   recoverable page error, retrying job ${job.id}: ${
          error instanceof Error ? error.message : String(error)
        }\n`
      );
      await recoverHarnessPage(page, timeoutMs);
    }
  }

  throw new Error(`Unreachable: retries exhausted for job ${job.id}`);
}

async function runBenchmarksWithRecovery(
  page: Page,
  {
    benchmarks,
    blocks,
    chunkSize,
    chunking,
    coreMountCase,
    coreMountNodeId,
    fanoutSubscribers,
    pluginCensusEntry,
    scenarioWorkload,
    timeoutMs,
    visibility,
  }: {
    benchmarks: BenchmarkName[];
    blocks: number;
    chunkSize: number;
    chunking: boolean;
    coreMountCase?: string;
    coreMountNodeId?: string;
    fanoutSubscribers?: string;
    pluginCensusEntry?: CorePluginCensusEntryId | 'all';
    scenarioWorkload: ScenarioWorkloadId;
    timeoutMs: number;
    visibility: VisibilityMode;
  }
) {
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await configurePage(page, {
        blocks,
        chunkSize,
        chunking,
        coreMountCase,
        coreMountNodeId,
        fanoutSubscribers,
        pluginCensusEntry,
        scenarioWorkload,
        visibility,
      });

      for (const benchmark of benchmarks) {
        process.stderr.write(
          `[editor-perf] benchmark ${benchmark} (attempt ${attempt}/${maxAttempts})\n`
        );
        await runBenchmark(page, benchmark, timeoutMs);
      }

      return await getResults(page);
    } catch (error) {
      if (!isRecoverablePageError(error) || attempt === maxAttempts) {
        throw error;
      }

      process.stderr.write(
        `[editor-perf] recoverable page error, retrying benchmark run: ${
          error instanceof Error ? error.message : String(error)
        }\n`
      );
      await recoverHarnessPage(page, timeoutMs);
    }
  }

  throw new Error('Unreachable: retries exhausted for benchmark run');
}

function getLayer0Jobs(): RunnerJob[] {
  return [
    {
      benchmarks: ['construction', 'mount', 'prebuilt-mount', 'input'],
      blocks: 5000,
      chunkSize: 1000,
      chunking: true,
      id: 'core-mixed-5k-chunk',
      scenarioWorkload: 'huge-mixed-block',
      visibility: 'chunk',
    },
    {
      benchmarks: ['mount', 'prebuilt-mount', 'input'],
      blocks: 5000,
      chunkSize: 1000,
      chunking: true,
      id: 'core-paragraph-5k-chunk',
      scenarioWorkload: 'huge-paragraph',
      visibility: 'chunk',
    },
    {
      benchmarks: ['mount', 'prebuilt-mount', 'input'],
      blocks: 5000,
      chunkSize: 1000,
      chunking: true,
      id: 'core-heading-5k-chunk',
      scenarioWorkload: 'huge-heading',
      visibility: 'chunk',
    },
    {
      benchmarks: ['mount', 'prebuilt-mount', 'input'],
      blocks: 5000,
      chunkSize: 1000,
      chunking: true,
      id: 'core-blockquote-5k-chunk',
      scenarioWorkload: 'huge-blockquote',
      visibility: 'chunk',
    },
    {
      benchmarks: ['mount', 'prebuilt-mount', 'input'],
      blocks: 5000,
      chunkSize: 1000,
      chunking: false,
      id: 'core-mixed-5k-no-chunk',
      scenarioWorkload: 'huge-mixed-block',
      visibility: 'none',
    },
    {
      benchmarks: ['init-dissection'],
      blocks: 10_000,
      chunkSize: 1000,
      chunking: true,
      id: 'nodeid-init-10k',
      scenarioWorkload: 'huge-mixed-block',
      timeoutMs: 240_000,
      visibility: 'chunk',
    },
  ];
}

function getLayer1CorePluginJobs({
  blocks,
  chunkSize,
  chunking,
  idPrefix,
  timeoutMs,
}: {
  blocks: number;
  chunkSize: number;
  chunking: boolean;
  idPrefix: string;
  timeoutMs?: number;
}): RunnerJob[] {
  return CORE_PLUGIN_CENSUS_ENTRIES.map((entry) => ({
    benchmarks: ['plugin-census'],
    blocks,
    chunkSize,
    chunking,
    id: `${idPrefix}-${entry.id}`,
    pluginCensusEntry: entry.id,
    scenarioWorkload: 'huge-paragraph',
    timeoutMs,
    visibility: 'chunk',
  }));
}

function getLayer3CoreStressJobs(): RunnerJob[] {
  return [
    {
      benchmarks: ['mount', 'prebuilt-mount', 'input'],
      blocks: 5000,
      chunkSize: 1000,
      chunking: true,
      id: 'core-dense-text-5k-chunk',
      scenarioWorkload: 'huge-dense-text',
      visibility: 'chunk',
    },
    {
      benchmarks: ['mount', 'prebuilt-mount', 'input'],
      blocks: 5000,
      chunkSize: 1000,
      chunking: true,
      id: 'core-dense-inline-props-5k-chunk',
      scenarioWorkload: 'huge-dense-inline-props',
      visibility: 'chunk',
    },
  ];
}

function getLayer0SmokeJobs(): RunnerJob[] {
  return [
    {
      benchmarks: ['construction', 'mount', 'prebuilt-mount'],
      blocks: 1000,
      chunkSize: 1000,
      chunking: true,
      id: 'smoke-core-mixed-1k-chunk',
      scenarioWorkload: 'huge-mixed-block',
      timeoutMs: 120_000,
      visibility: 'chunk',
    },
    {
      benchmarks: ['mount'],
      blocks: 1000,
      chunkSize: 1000,
      chunking: true,
      id: 'smoke-core-paragraph-1k-chunk',
      scenarioWorkload: 'huge-paragraph',
      timeoutMs: 120_000,
      visibility: 'chunk',
    },
    {
      benchmarks: ['mount'],
      blocks: 1000,
      chunkSize: 1000,
      chunking: true,
      id: 'smoke-core-heading-1k-chunk',
      scenarioWorkload: 'huge-heading',
      timeoutMs: 120_000,
      visibility: 'chunk',
    },
    {
      benchmarks: ['mount'],
      blocks: 1000,
      chunkSize: 1000,
      chunking: true,
      id: 'smoke-core-blockquote-1k-chunk',
      scenarioWorkload: 'huge-blockquote',
      timeoutMs: 120_000,
      visibility: 'chunk',
    },
    {
      benchmarks: ['init-dissection'],
      blocks: 5000,
      chunkSize: 1000,
      chunking: true,
      id: 'smoke-nodeid-init-5k',
      timeoutMs: 120_000,
      scenarioWorkload: 'huge-mixed-block',
      visibility: 'chunk',
    },
  ];
}

function getLayer1CorePluginSmokeJobs(): RunnerJob[] {
  return getLayer1CorePluginJobs({
    blocks: 1000,
    chunkSize: 1000,
    chunking: true,
    idPrefix: 'smoke-core-plugin-1k-chunk',
    timeoutMs: 120_000,
  });
}

function getLayer1CorePluginFullJobs(): RunnerJob[] {
  return getLayer1CorePluginJobs({
    blocks: 5000,
    chunkSize: 1000,
    chunking: true,
    idPrefix: 'core-plugin-5k-chunk',
    timeoutMs: 240_000,
  });
}

function getJobsForPreset(preset: PresetName | undefined): RunnerJob[] {
  if (preset === 'layer-0') return getLayer0Jobs();
  if (preset === 'layer-0-smoke') return getLayer0SmokeJobs();
  if (preset === 'layer-1-core-plugins') return getLayer1CorePluginFullJobs();
  if (preset === 'layer-1-core-plugins-smoke') {
    return getLayer1CorePluginSmokeJobs();
  }
  if (preset === 'layer-3-core-stress') return getLayer3CoreStressJobs();

  return [];
}

async function main() {
  const url = getArg('url') ?? 'http://localhost:3000/dev/editor-perf';
  const preset = getArg('preset') as PresetName | undefined;
  const blocks = Number(getArg('blocks') ?? '5000');
  const chunkSize = Number(getArg('chunk-size') ?? '1000');
  const chunking = (getArg('chunking') ?? 'true') === 'true';
  const contentVisibility = (getArg('visibility') ?? 'chunk') as VisibilityMode;
  const fanoutSubscribers = getArg('fanout-subscribers');
  const coreMountCase = getArg('core-mount-case');
  const coreMountNodeId = getArg('core-mount-nodeid');
  const pluginCensusEntry = getArg('plugin-census-entry') as
    | CorePluginCensusEntryId
    | 'all'
    | undefined;
  const scenarioWorkload =
    (getArg('scenario-workload') as ScenarioWorkloadId | undefined) ??
    'huge-mixed-block';
  const out = getArg('out');
  const summaryOut = getArg('summary-out');
  const timeoutMs = Number(getArg('timeout') ?? '180000');
  const benchmarks = parseBenchmarks(getArg('benchmarks'));
  const headless = !hasFlag('headed');
  const protocolTimeoutMs = getProtocolTimeoutMs(preset, timeoutMs);

  const browser = await puppeteer.launch({
    headless,
    protocolTimeout: protocolTimeoutMs,
  });

  try {
    const page = await browser.newPage();

    page.setDefaultTimeout(timeoutMs);
    await page.goto(url, { waitUntil: 'networkidle2' });
    await page.waitForSelector('[data-testid="editor-perf-json"]');
    await waitForHarness(page, timeoutMs);

    let payload: unknown;

    if (preset) {
      const jobs = getJobsForPreset(preset);
      const runs: Array<{
        benchmarks: BenchmarkName[];
        id: string;
        results: unknown;
        settings: {
          blocks: number;
          chunkSize: number;
          chunking: boolean;
          pluginCensusEntry?: CorePluginCensusEntryId | 'all';
          scenarioWorkload: ScenarioWorkloadId;
          visibility: VisibilityMode;
        };
      }> = [];

      for (const job of jobs) {
        runs.push({
          benchmarks: job.benchmarks,
          id: job.id,
          results: await runJobWithRecovery(page, job, timeoutMs),
          settings: {
            blocks: job.blocks,
            chunkSize: job.chunkSize,
            chunking: job.chunking,
            pluginCensusEntry: job.pluginCensusEntry,
            scenarioWorkload: job.scenarioWorkload,
            visibility: job.visibility,
          },
        });
      }

      const presetPayload = {
        capturedAt: new Date().toISOString(),
        preset,
        runs,
        url,
      };
      const summaryPayload = summarizePresetPayload(presetPayload);

      payload = presetPayload;

      if (summaryOut) {
        const summaryOutputPath = path.resolve(process.cwd(), summaryOut);

        await mkdir(path.dirname(summaryOutputPath), { recursive: true });
        await writeFile(
          summaryOutputPath,
          `${JSON.stringify(summaryPayload, null, 2)}\n`
        );
      }
    } else {
      const results = await runBenchmarksWithRecovery(page, {
        benchmarks,
        blocks,
        chunkSize,
        chunking,
        coreMountCase,
        coreMountNodeId,
        fanoutSubscribers,
        pluginCensusEntry,
        scenarioWorkload,
        timeoutMs,
        visibility: contentVisibility,
      });
      payload = {
        benchmarks,
        capturedAt: new Date().toISOString(),
        url,
        ...results,
      };
    }

    if (out) {
      const outputPath = path.resolve(process.cwd(), out);

      await mkdir(path.dirname(outputPath), { recursive: true });
      await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`);
    }

    process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
  } finally {
    await browser.close();
  }
}

await main();

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
  | 'element-id-fragment'
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
  | 'layer-3-core-stress'
  | 'public-slate-vs-plate';
type ScenarioWorkloadId = EditorPerfWorkloadId;
type ScenarioId =
  | 'slate'
  | 'plate-core'
  | 'plate-core-element-id'
  | 'plate-core-element-id-seeded'
  | 'plate-basic'
  | 'plate-code-only';
type VisibilityMode = 'chunk' | 'element' | 'none';
type RunnerJob = {
  benchmarks: BenchmarkName[];
  blocks: number;
  chunkSize: number;
  chunking: boolean;
  coreMountCase?: string;
  coreMountElementId?: string;
  fanoutSubscribers?: string;
  id: string;
  pluginCensusEntry?: CorePluginCensusEntryId | 'all';
  scenario?: ScenarioId;
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
    scenario?: ScenarioId;
    scenarioWorkload: ScenarioWorkloadId;
    visibility: VisibilityMode;
  };
};

function getArg(name: string) {
  const index = process.argv.indexOf(`--${name}`);

  if (index === -1) return undefined;

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
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function isRecoverablePageError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);

  return (
    message.includes('Benchmark timed out') ||
    message.includes('Runtime.callFunctionOn timed out') ||
    message.includes('Execution context was destroyed') ||
    message.includes('Cannot find context with specified id') ||
    message.includes('Editor perf harness not available on window') ||
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

function getInputMean(results: any, scenarioId: string) {
  return results?.results?.[scenarioId]?.input?.mean ?? null;
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
  const includesInput = run.benchmarks.includes('input');
  const includesMount = run.benchmarks.includes('mount');
  const includesPrebuiltMount = run.benchmarks.includes('prebuilt-mount');
  const includesConstruction = run.benchmarks.includes('construction');

  return {
    id: run.id,
    benchmarks: run.benchmarks,
    settings: run.settings,
    completed: run.results?.lastCompletedRun ?? null,
    slateMountMean: includesMount ? getMountMean(run.results, 'slate') : null,
    plateCoreMountMean: includesMount
      ? getMountMean(run.results, 'plate-core')
      : null,
    plateCoreElementIdMountMean: includesMount
      ? getMountMean(run.results, 'plate-core-element-id')
      : null,
    plateCoreElementIdSeededMountMean: includesMount
      ? getMountMean(run.results, 'plate-core-element-id-seeded')
      : null,
    plateBasicMountMean: includesMount
      ? getMountMean(run.results, 'plate-basic')
      : null,
    slateInputMean: includesInput ? getInputMean(run.results, 'slate') : null,
    plateCoreInputMean: includesInput
      ? getInputMean(run.results, 'plate-core')
      : null,
    plateCoreElementIdInputMean: includesInput
      ? getInputMean(run.results, 'plate-core-element-id')
      : null,
    plateCoreElementIdSeededInputMean: includesInput
      ? getInputMean(run.results, 'plate-core-element-id-seeded')
      : null,
    plateBasicInputMean: includesInput
      ? getInputMean(run.results, 'plate-basic')
      : null,
    slatePrebuiltMountMean: includesPrebuiltMount
      ? getPrebuiltMountMean(run.results, 'slate')
      : null,
    plateCorePrebuiltMountMean: includesPrebuiltMount
      ? getPrebuiltMountMean(run.results, 'plate-core')
      : null,
    plateCoreConstructionMean: includesConstruction
      ? getConstructionMean(run.results, 'plate-core')
      : null,
    rawElementIdInitMean: getInitOnlyMean(
      run.results,
      'plate-core-element-id-raw'
    ),
    seededElementIdInitMean: getInitOnlyMean(
      run.results,
      'plate-core-element-id-seeded'
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
    | 'coreMountElementId'
    | 'fanoutSubscribers'
    | 'pluginCensusEntry'
    | 'scenario'
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
            coreMountElementId?: string;
            fanoutSubscribers?: string;
            pluginCensusEntry?: CorePluginCensusEntryId | 'all';
            scenario?: ScenarioId;
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
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;

  const runPromise = page
    .evaluate(
      async ({ benchmark: innerBenchmark }: { benchmark: BenchmarkName }) => {
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

        await harness.runBenchmark(innerBenchmark);
      },
      { benchmark }
    )
    .catch((error: unknown) => {
      if (timedOut) return;

      throw error;
    });

  try {
    await Promise.race([
      runPromise,
      new Promise<never>((_resolve, reject) => {
        timeoutHandle = setTimeout(() => {
          timedOut = true;
          reject(
            new Error(`Benchmark timed out after ${timeoutMs}ms: ${benchmark}`)
          );
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutHandle) clearTimeout(timeoutHandle);
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
    coreMountElementId,
    fanoutSubscribers,
    pluginCensusEntry,
    scenario,
    scenarioWorkload,
    timeoutMs,
    visibility,
  }: {
    benchmarks: BenchmarkName[];
    blocks: number;
    chunkSize: number;
    chunking: boolean;
    coreMountCase?: string;
    coreMountElementId?: string;
    fanoutSubscribers?: string;
    pluginCensusEntry?: CorePluginCensusEntryId | 'all';
    scenario?: ScenarioId;
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
        coreMountElementId,
        fanoutSubscribers,
        pluginCensusEntry,
        scenario,
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
      id: 'element-id-init-10k',
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

function getPublicSlateVsPlateJobs(): RunnerJob[] {
  return [
    {
      benchmarks: ['mount', 'input'],
      blocks: 10_000,
      chunkSize: 1000,
      chunking: true,
      id: 'public-mixed-10k-chunk',
      scenarioWorkload: 'huge-mixed-block',
      timeoutMs: 300_000,
      visibility: 'chunk',
    },
    {
      benchmarks: ['mount'],
      blocks: 10_000,
      chunkSize: 1000,
      chunking: true,
      id: 'public-code-10k-chunk',
      scenarioWorkload: 'huge-code',
      timeoutMs: 300_000,
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
      id: 'smoke-element-id-init-5k',
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
  if (preset === 'public-slate-vs-plate') return getPublicSlateVsPlateJobs();

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
  const coreMountElementId = getArg('core-mount-element-id');
  const pluginCensusEntry = getArg('plugin-census-entry') as
    | CorePluginCensusEntryId
    | 'all'
    | undefined;
  const scenario = getArg('scenario') as ScenarioId | undefined;
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
          scenario?: ScenarioId;
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
            scenario: job.scenario,
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
        coreMountElementId,
        fanoutSubscribers,
        pluginCensusEntry,
        scenario,
        scenarioWorkload,
        timeoutMs,
        visibility: contentVisibility,
      });
      payload = {
        benchmarks,
        capturedAt: new Date().toISOString(),
        scenario: scenario ?? 'all',
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

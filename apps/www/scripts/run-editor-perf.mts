import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { cpus, loadavg } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import puppeteer, {
  type CDPSession,
  type KeyInput,
  type Page,
} from 'puppeteer';

import {
  FIND_DENSE_ALT_QUERY,
  FIND_DENSE_QUERY,
  FIND_SPARSE_QUERY,
  type FindAction,
  type FindBurst,
  type FindDocKind,
  type FindDocSpec,
  type FindInput,
  type FindReadBack,
  type FindRefreshMode,
  type FindRendering,
  type FindSample,
  findStep,
  findStepKey,
} from '../src/app/dev/editor-perf/find-workload';
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
  | 'find-edit'
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
  | 'plate-basic-aligned'
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

type FindDoc = Omit<FindDocSpec, 'rendering'>;

const FIND_DOCS: readonly FindDoc[] = [
  { blocks: 100, id: 'dense-100', kind: 'dense', query: FIND_DENSE_QUERY },
  { blocks: 1000, id: 'dense-1k', kind: 'dense', query: FIND_DENSE_QUERY },
  { blocks: 10_000, id: 'dense-10k', kind: 'dense', query: FIND_DENSE_QUERY },
  {
    blocks: 10_000,
    id: 'sparse-10k',
    kind: 'sparse',
    query: FIND_SPARSE_QUERY,
  },
  { blocks: 1000, id: 'idle-1k', kind: 'idle', query: '' },
  { blocks: 10_000, id: 'idle-10k', kind: 'idle', query: '' },
];

type FindCohort = Readonly<{
  action: FindAction;
  doc: string;
  id: string;
  input: FindInput;
}>;

const findCohort = (
  doc: string,
  action: FindAction,
  input: FindInput = 'proxy'
): FindCohort => ({ action, doc, id: `${doc}.${action}.${input}`, input });

const FIND_COHORTS: readonly FindCohort[] = [
  findCohort('dense-100', 'shift'),
  findCohort('dense-1k', 'no-change'),
  findCohort('dense-1k', 'shift'),
  findCohort('dense-1k', 'create-destroy'),
  findCohort('dense-1k', 'split-above'),
  findCohort('dense-1k', 'query-change'),
  findCohort('dense-1k', 'no-change', 'trusted'),
  findCohort('dense-1k', 'shift', 'trusted'),
  findCohort('dense-1k', 'create-destroy', 'trusted'),
  findCohort('dense-10k', 'no-change'),
  findCohort('dense-10k', 'shift'),
  findCohort('dense-10k', 'split-above'),
  findCohort('dense-10k', 'query-change'),
  findCohort('dense-10k', 'no-change', 'trusted'),
  findCohort('dense-10k', 'shift', 'trusted'),
  findCohort('sparse-10k', 'no-change'),
  findCohort('idle-1k', 'no-change'),
  findCohort('idle-1k', 'no-change', 'trusted'),
  findCohort('idle-10k', 'no-change'),
];

type FindCountLine = Readonly<{
  refresh: 'edited-block' | 'none';
  refreshCalls?: number;
  searches?: number;
  storeWrites: number;
}>;

const FIND_COUNT_LINES: Partial<
  Record<`${FindDocKind}.${FindAction}`, FindCountLine>
> = {
  'dense.create-destroy': { refresh: 'edited-block', storeWrites: 1 },
  'dense.no-change': { refresh: 'none', searches: 1, storeWrites: 0 },
  'dense.shift': { refresh: 'edited-block', storeWrites: 1 },
  'dense.split-above': { refresh: 'none', storeWrites: 1 },
  'idle.no-change': {
    refresh: 'none',
    refreshCalls: 0,
    searches: 0,
    storeWrites: 0,
  },
};

const FIND_FIRST_FRAME_ACTIONS: ReadonlySet<FindAction> = new Set([
  'create-destroy',
  'shift',
]);

/**
 * The decoration runtime re-reads natively typed nodes 50 to 250 ms after the
 * input, so every burst drains this long before its counters and its CDP
 * window close.
 */
const FIND_DRAIN_MS = 350;
const FIND_COUNT_STEPS = 4;
const FIND_SCAN_FUNCTIONS = ['findTextRanges', 'getTextEntryRanges'] as const;

type FindExpectation = Readonly<{
  blocks: number;
  matchedBlocks: number;
  matches: number;
  query: string;
}>;

type FindCdpDelta = Readonly<{
  layoutCount: number;
  recalcStyleCount: number;
  taskDurationMs: number;
}>;

type FindScan = Readonly<{ textRunsScanned: number; searches: number }>;

type FindRunOptions = Readonly<{
  plantMs: number;
  refresh: FindRefreshMode;
  rendering: FindRendering;
}>;

function summarize(values: number[]) {
  if (values.length === 0) return null;

  const sorted = [...values].sort((a, b) => a - b);
  const at = (quantile: number) =>
    sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * quantile))];

  return {
    max: sorted.at(-1),
    mean: values.reduce((sum, value) => sum + value, 0) / values.length,
    median: at(0.5),
    min: sorted[0],
    p95: at(0.95),
    samples: values.length,
    values,
  };
}

function findDocExpectation(doc: FindDoc): FindExpectation {
  const matches =
    doc.kind === 'dense' ? doc.blocks : doc.kind === 'sparse' ? 1 : 0;

  return {
    blocks: doc.blocks,
    matchedBlocks: matches,
    matches,
    query: doc.query,
  };
}

function expectAfterFindStep(
  doc: FindDoc,
  action: FindAction,
  index: number
): FindExpectation {
  const mounted = findDocExpectation(doc);

  if (index % 2 === 1) return mounted;
  if (action === 'split-above') {
    return { ...mounted, blocks: mounted.blocks + 1 };
  }
  if (action === 'create-destroy') {
    return { ...mounted, matches: mounted.matches + 1 };
  }
  if (action === 'query-change') {
    return { ...mounted, query: FIND_DENSE_ALT_QUERY };
  }

  return mounted;
}

function assertFindState({
  actual,
  expected,
  label,
  rendering,
}: {
  actual: FindReadBack;
  expected: FindExpectation;
  label: string;
  rendering: FindRendering;
}) {
  const problems: string[] = [];
  const check = (
    name: string,
    value: number | string,
    want: number | string
  ) => {
    if (value !== want) problems.push(`${name} ${value}, expected ${want}`);
  };

  check('blocks', actual.blocks, expected.blocks);
  check('query', `"${actual.query}"`, `"${expected.query}"`);
  check('matches', actual.matches, expected.matches);
  check('matched blocks', actual.matchedBlocks, expected.matchedBlocks);
  check('fresh search matches', actual.freshMatches, actual.matches);
  if (rendering === 'complete') {
    check('rendered blocks', actual.renderedBlocks, actual.blocks);
    check('painted matches', actual.paintedMatches, actual.freshMatches);
  }
  if (actual.paintMismatch) {
    problems.push(`stale paint: ${actual.paintMismatch}`);
  }
  if (problems.length > 0) {
    throw new Error(
      `Find ${label} read back wrong state: ${problems.join('; ')}`
    );
  }
}

async function callFindHarness<T>(
  page: Page,
  method:
    | 'arm'
    | 'between'
    | 'burst'
    | 'finish'
    | 'mount'
    | 'prepare'
    | 'readBack'
    | 'unmount',
  argument?: unknown
) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const stalled = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => {
      reject(
        new Error(
          `Find harness stalled: ${method} ran past ${FIND_CALL_TIMEOUT_MS}ms`
        )
      );
    }, FIND_CALL_TIMEOUT_MS);
  });
  const call = page.evaluate(
    (innerMethod, innerArgument) => {
      const find = (
        window as typeof window & {
          __editorPerfHarness?: {
            find: Record<string, (argument?: unknown) => unknown>;
          };
        }
      ).__editorPerfHarness?.find;

      if (!find) throw new Error('Editor perf harness not available on window');

      return find[innerMethod](innerArgument);
    },
    method,
    argument
  ) as Promise<T>;

  try {
    return await Promise.race([call, stalled]);
  } finally {
    clearTimeout(timer);
  }
}

async function readCdpMetrics(client: CDPSession) {
  const { metrics } = await client.send('Performance.getMetrics');

  return Object.fromEntries(metrics.map(({ name, value }) => [name, value]));
}

async function takeFindScan(client: CDPSession, scripts: Set<string>) {
  const { result } = await client.send('Profiler.takePreciseCoverage');
  const calls: Record<string, number> = {};

  for (const script of result) {
    for (const fn of script.functions) {
      if (
        !(FIND_SCAN_FUNCTIONS as readonly string[]).includes(fn.functionName)
      ) {
        continue;
      }
      scripts.add(script.url);
      calls[fn.functionName] =
        (calls[fn.functionName] ?? 0) + (fn.ranges[0]?.count ?? 0);
    }
  }

  return {
    textRunsScanned: calls.getTextEntryRanges ?? 0,
    searches: calls.findTextRanges ?? 0,
  };
}

async function openFindPage({
  coverage,
  timeoutMs,
  url,
}: {
  coverage: boolean;
  timeoutMs: number;
  url: string;
}) {
  const browser = await puppeteer.launch({
    headless: !hasFlag('headed'),
    protocolTimeout: FIND_CALL_TIMEOUT_MS + 30_000,
  });
  const page = await browser.newPage();
  const client = await page.createCDPSession();

  // Puppeteer enables the Performance domain, which turns every
  // console.timeStamp into a metrics event. React's dev build stamps each
  // component render, so a 10k-block mount floods the protocol until the page
  // stops answering, and every timed render pays for the event. Production
  // React stamps nothing.
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(console, 'timeStamp', { value: undefined });
  });

  if (coverage) {
    // Coverage started after the scripts compile loses calls once V8
    // optimizes the scan, so it starts before the page loads.
    await client.send('Profiler.enable');
    await client.send('Profiler.startPreciseCoverage', {
      callCount: true,
      detailed: true,
    });
  }
  page.setDefaultTimeout(timeoutMs);
  await page.goto(url, { waitUntil: 'networkidle2' });
  await waitForHarness(page, timeoutMs);

  return { browser, client, page };
}

function describeKeyMisses(sample: FindSample) {
  return sample.refreshExtraCount > 0
    ? `; ${sample.refreshExtraCount} refreshed keys outside the edited block (${sample.refreshExtra.join(', ')})`
    : '';
}

async function runFindBurst<T>({
  cohort,
  doc,
  firstIndex,
  inspect,
  measure,
  options,
  page,
  steps,
}: {
  cohort: FindCohort;
  doc: FindDoc;
  firstIndex: number;
  inspect: boolean;
  measure: (burst: () => Promise<FindSample>) => Promise<[FindSample, T]>;
  options: FindRunOptions;
  page: Page;
  steps: number;
}) {
  const { action } = cohort;
  const burst: FindBurst = {
    action,
    drainMs: FIND_DRAIN_MS,
    firstIndex,
    inspect,
    plantMs: options.plantMs,
    refresh: options.refresh,
    steps,
  };
  let run: () => Promise<FindSample>;

  if (cohort.input === 'trusted') {
    await callFindHarness(page, 'prepare', { action, index: firstIndex });
    run = async () => {
      await callFindHarness(page, 'arm', {
        inspect,
        plantMs: burst.plantMs,
        refresh: burst.refresh,
      });
      for (let offset = 0; offset < steps; offset++) {
        const key = findStepKey(findStep(action, firstIndex + offset));

        if (!key) throw new Error(`Find ${cohort.id} step has no key`);
        await page.keyboard.press(key as KeyInput);
        await callFindHarness(page, 'between');
      }

      return callFindHarness<FindSample>(page, 'finish', burst);
    };
  } else {
    run = () => callFindHarness<FindSample>(page, 'burst', burst);
  }

  const [sample, measured] = await measure(run);
  const lastIndex = firstIndex + steps - 1;
  const label = `${cohort.id} steps ${firstIndex}-${lastIndex}`;
  const problems: string[] = [];

  if (sample.firstIndex !== firstIndex) {
    problems.push(`first index ${sample.firstIndex}`);
  }
  if (sample.changedSteps !== steps) {
    problems.push(`${steps - sample.changedSteps} steps changed nothing`);
  }
  if (cohort.input === 'trusted' && !sample.trustedInput) {
    problems.push(
      `${sample.inputEvents} keydown and beforeinput events, not all trusted`
    );
  }
  if (cohort.input === 'proxy' && sample.inputEvents !== 0) {
    problems.push(
      `${sample.inputEvents} keydown and beforeinput events on a proxy step`
    );
  }
  if (problems.length > 0) {
    throw new Error(
      `Find ${label} did not run as named: ${problems.join('; ')}`
    );
  }
  if (
    sample.firstFrameMismatch &&
    options.rendering === 'complete' &&
    FIND_FIRST_FRAME_ACTIONS.has(action)
  ) {
    throw new Error(
      `Find ${label} painted stale highlights at the first frame after the step: ${sample.firstFrameMismatch}${describeKeyMisses(sample)}`
    );
  }
  assertFindState({
    actual: await callFindHarness<FindReadBack>(page, 'readBack'),
    expected: expectAfterFindStep(doc, action, lastIndex),
    label,
    rendering: options.rendering,
  });

  return { measured, sample };
}

const FIND_SAMPLE_FIELDS = [
  'leafRenders',
  'refreshCalls',
  'refreshKeys',
  'refreshReads',
  'runtimeReads',
  'storeWrites',
] as const;

async function timeFindCohort({
  cohort,
  doc,
  options,
  page,
  samples: sampleCount,
}: {
  cohort: FindCohort;
  doc: FindDoc;
  options: FindRunOptions;
  page: Page;
  samples: number;
}) {
  const client = await page.createCDPSession();

  await client.send('Performance.enable');

  let pair = 0;
  const run = async () => {
    const result = await runFindBurst<FindCdpDelta>({
      cohort,
      doc,
      firstIndex: 2 + pair * 2,
      inspect: false,
      measure: async (burst) => {
        await client.send('HeapProfiler.collectGarbage');

        const before = await readCdpMetrics(client);
        const sample = await burst();
        const after = await readCdpMetrics(client);

        return [
          sample,
          {
            layoutCount: after.LayoutCount - before.LayoutCount,
            recalcStyleCount: after.RecalcStyleCount - before.RecalcStyleCount,
            taskDurationMs: (after.TaskDuration - before.TaskDuration) * 1000,
          },
        ];
      },
      options,
      page,
      steps: 2,
    });

    pair += 1;

    return { ...result.sample, ...result.measured };
  };

  for (let index = 0; index < 2; index++) {
    await runFindBurst({
      cohort,
      doc,
      firstIndex: index,
      inspect: false,
      measure: async (burst) => [await burst(), null],
      options,
      page,
      steps: 1,
    });
  }

  const startedAt = performance.now();
  const samples: Array<Awaited<ReturnType<typeof run>>> = [];

  while (samples.length < sampleCount) samples.push(await run());
  await client.detach();

  const of = (values: number[]) => summarize(values);

  return {
    burst: { drainMs: FIND_DRAIN_MS, steps: 2 },
    elapsedMs: performance.now() - startedAt,
    layoutCount: of(samples.map((sample) => sample.layoutCount)),
    presentationMs: of(
      samples.flatMap((sample) =>
        sample.presentationMs === null ? [] : [sample.presentationMs]
      )
    ),
    presentationMissing: samples.filter(
      (sample) => sample.presentationMs === null
    ).length,
    recalcStyleCount: of(samples.map((sample) => sample.recalcStyleCount)),
    samples: samples.length,
    taskDurationMs: of(samples.map((sample) => sample.taskDurationMs)),
    warmupSteps: 2,
    ...Object.fromEntries(
      FIND_SAMPLE_FIELDS.map((field) => [
        field,
        of(samples.map((sample) => sample[field])),
      ])
    ),
  };
}

async function countFindCohort({
  client,
  cohort,
  doc,
  options,
  page,
}: {
  client: CDPSession;
  cohort: FindCohort;
  doc: FindDoc;
  options: FindRunOptions;
  page: Page;
}) {
  const scripts = new Set<string>();
  const steps: Array<FindSample & FindScan> = [];

  for (let index = 0; index < 2 + FIND_COUNT_STEPS; index++) {
    const { measured, sample } = await runFindBurst<FindScan>({
      cohort,
      doc,
      firstIndex: index,
      inspect: true,
      measure: async (burst) => {
        // Taking coverage resets its counters.
        await takeFindScan(client, scripts);

        const burstSample = await burst();

        return [burstSample, await takeFindScan(client, scripts)];
      },
      options,
      page,
      steps: 1,
    });

    if (measured.textRunsScanned < measured.searches) {
      throw new Error(
        `Find ${cohort.id} step ${index}: coverage lost calls (${measured.searches} findTextRanges calls, ${measured.textRunsScanned} runs scanned)`
      );
    }
    if (index >= 2) steps.push({ ...sample, ...measured });
  }

  const line = FIND_COUNT_LINES[`${doc.kind}.${cohort.action}`];
  const lineMisses = line
    ? steps.flatMap((step) => {
        const misses: string[] = [];
        const expect = (name: string, value: number, want?: number) => {
          if (want !== undefined && value !== want) {
            misses.push(`${name} ${value}, line ${want}`);
          }
        };

        expect('store writes', step.storeWrites, line.storeWrites);
        expect('searches', step.searches, line.searches);
        expect('refresh calls', step.refreshCalls, line.refreshCalls);
        expect('refresh-all calls', step.refreshAllCalls, 0);
        if (line.refresh === 'none') {
          expect('refresh keys', step.refreshKeys, 0);
        } else {
          const keyMisses = describeKeyMisses(step);

          if (keyMisses) misses.push(keyMisses.slice(2));
        }

        return misses.map((miss) => `step ${step.firstIndex}: ${miss}`);
      })
    : [];
  const of = (key: (typeof FIND_SAMPLE_FIELDS)[number] | keyof FindScan) =>
    summarize(steps.map((step) => step[key]));

  return {
    textRunsScanned: of('textRunsScanned'),
    drainMs: FIND_DRAIN_MS,
    line: line
      ? { ...line, holds: lineMisses.length === 0, misses: lineMisses }
      : null,
    scripts: [...scripts],
    searches: of('searches'),
    steps: steps.map((step) => ({
      textRunsScanned: step.textRunsScanned,
      droppedRefreshes: step.droppedRefreshes,
      firstFrameMismatch: step.firstFrameMismatch,
      index: step.firstIndex,
      leafRenders: step.leafRenders,
      refreshAllCalls: step.refreshAllCalls,
      refreshCalls: step.refreshCalls,
      refreshExtra: step.refreshExtra,
      refreshExtraCount: step.refreshExtraCount,
      refreshKeys: step.refreshKeys,
      refreshReads: step.refreshReads,
      runtimeReads: step.runtimeReads,
      searches: step.searches,
      storeWrites: step.storeWrites,
    })),
    ...Object.fromEntries(
      FIND_SAMPLE_FIELDS.map((field) => [field, of(field)])
    ),
  };
}

async function readServedSource(url: string, outputPath?: string) {
  const response = await fetch(new URL('/api/plite/ready', url));
  const ready = (await response.json()) as { devSource?: boolean };

  if (!ready.devSource) {
    throw new Error(
      `${url} serves built packages; start it with PLATE_WWW_DEV_SOURCE=1 so Find runs from source`
    );
  }

  const port = new URL(url).port || '80';
  const [pid] = execFileSync(
    'lsof',
    ['-nP', `-iTCP:${port}`, '-sTCP:LISTEN', '-t'],
    { encoding: 'utf-8' }
  )
    .trim()
    .split('\n');
  const cwd = execFileSync('lsof', ['-a', '-p', pid, '-d', 'cwd', '-Fn'], {
    encoding: 'utf-8',
  })
    .split('\n')
    .find((line) => line.startsWith('n'))
    ?.slice(1);

  if (!cwd) {
    throw new Error(`Cannot read the cwd of the server on port ${port}`);
  }

  const root = execFileSync(
    'git',
    ['-C', cwd, 'rev-parse', '--show-toplevel'],
    {
      encoding: 'utf-8',
    }
  ).trim();
  const git = (...args: string[]) =>
    execFileSync('git', ['-C', root, ...args], { encoding: 'utf-8' }).trim();
  const files = [
    'packages/platejs/src/features/find/lib/BaseFindPlugin.ts',
    'apps/www/src/registry/components/editor/find.tsx',
    'apps/www/src/app/dev/editor-perf/find-surface.tsx',
    'apps/www/src/app/dev/editor-perf/find-workload.ts',
    'apps/www/src/app/dev/editor-perf/page.tsx',
  ];
  const dirty = [
    ...git('diff', 'HEAD', '--name-only').split('\n'),
    ...git('ls-files', '--others', '--exclude-standard').split('\n'),
  ]
    .filter((file) => file && path.join(root, file) !== outputPath)
    .sort();
  const fingerprint = createHash('sha256');

  for (const file of dirty) {
    const full = path.join(root, file);

    fingerprint.update(`${file}\0`);
    fingerprint.update(existsSync(full) ? readFileSync(full) : 'deleted');
    fingerprint.update('\0');
  }

  return {
    dirty,
    fingerprint: fingerprint.digest('hex'),
    head: git('rev-parse', 'HEAD'),
    loaded: [
      ...files.map((file) => path.join(root, file)),
      fileURLToPath(import.meta.url),
    ],
    pid: Number(pid),
    root,
    status: git(
      'status',
      '--porcelain',
      '--',
      ...files,
      'apps/www/scripts/run-editor-perf.mts'
    ),
  };
}

const FIND_CALL_TIMEOUT_MS = 180_000;

async function closeFindBrowser(
  browser: Awaited<ReturnType<typeof puppeteer.launch>>
) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const closed = await Promise.race([
    browser.close().then(
      () => true,
      () => false
    ),
    new Promise<false>((resolve) => {
      timer = setTimeout(() => resolve(false), 15_000);
    }),
  ]);

  clearTimeout(timer);
  if (!closed) browser.process()?.kill('SIGKILL');
}

async function runFindDoc({
  client,
  cohorts,
  doc,
  onCohort,
  options,
  page,
}: {
  client: CDPSession;
  cohorts: readonly FindCohort[];
  doc: FindDoc;
  onCohort: (index: number, result: unknown) => Promise<void>;
  options: Readonly<{
    phase: 'counts' | 'timing';
    plantMs: ReadonlyMap<string, number>;
    refresh: ReadonlyMap<string, FindRefreshMode>;
    rendering: FindRendering;
    samples: number;
  }>;
  page: Page;
}) {
  const { phase, rendering } = options;
  const knownBad = doc.id === 'dense-1k' ? getArg('find-known-bad') : undefined;
  const mounted: FindDocSpec = {
    ...doc,
    ...(knownBad === 'workload' && { query: FIND_SPARSE_QUERY }),
    ...(knownBad === 'active' && { wrongActiveIndex: 1 }),
    rendering,
  };

  process.stderr.write(`[editor-perf] find ${phase} mount ${doc.id}\n`);
  assertFindState({
    actual: await callFindHarness<FindReadBack>(page, 'mount', mounted),
    expected: findDocExpectation(doc),
    label: `document ${doc.id} at mount`,
    rendering,
  });

  if (phase === 'counts') {
    const { searches } = await takeFindScan(client, new Set());

    if (searches === 0) {
      throw new Error(
        `Find coverage counted no findTextRanges call for the mount search of ${doc.id}, so it cannot count searches`
      );
    }
  }

  for (const [index, cohort] of cohorts.entries()) {
    if (cohort.doc !== doc.id) continue;
    process.stderr.write(`[editor-perf] find ${phase} ${cohort.id}\n`);

    const runOptions: FindRunOptions = {
      plantMs: options.plantMs.get(cohort.id) ?? 0,
      refresh: options.refresh.get(cohort.id) ?? 'pass',
      rendering,
    };

    await onCohort(
      index,
      phase === 'timing'
        ? await timeFindCohort({
            cohort,
            doc,
            options: runOptions,
            page,
            samples: options.samples,
          })
        : await countFindCohort({
            client,
            cohort,
            doc,
            options: runOptions,
            page,
          })
    );
  }
}

async function runFindLane({
  out,
  timeoutMs,
  url,
}: {
  out?: string;
  timeoutMs: number;
  url: string;
}) {
  const list = (name: string, fallback: string) =>
    (getArg(name) ?? fallback).split(',').filter(Boolean);
  const selected = list('find-cohorts', 'all');
  const renderingArg = getArg('find-rendering') ?? 'complete';

  if (renderingArg !== 'complete' && renderingArg !== 'virtualized') {
    throw new Error(`Unknown --find-rendering ${renderingArg}`);
  }

  const rendering: FindRendering = renderingArg;
  const samples = Number(getArg('find-samples') ?? '40');

  if (!(Number.isInteger(samples) && samples > 0)) {
    throw new Error(`--find-samples needs a positive integer, got ${samples}`);
  }
  const phases = list('find-phases', 'timing,counts');
  const planted = new Map(
    list('find-plant', '').map((entry) => {
      const [id, ms] = entry.split('=');

      if (
        !FIND_COHORTS.some((cohort) => cohort.id === id) ||
        !(Number(ms) > 0)
      ) {
        throw new Error(`--find-plant needs <cohort>=<ms> pairs, got ${entry}`);
      }

      return [id, Number(ms)] as const;
    })
  );
  const refreshModes = new Map(
    list('find-refresh', '').map((entry) => {
      const [id, mode] = entry.split('=');

      if (
        !FIND_COHORTS.some((cohort) => cohort.id === id) ||
        (mode !== 'drop' && mode !== 'oracle' && mode !== 'wrong-node')
      ) {
        throw new Error(
          `--find-refresh needs <cohort>=drop|oracle|wrong-node pairs, got ${entry}`
        );
      }

      return [id, mode] as const;
    })
  );
  const knownBad = getArg('find-known-bad');

  if (
    knownBad !== undefined &&
    knownBad !== 'workload' &&
    knownBad !== 'active'
  ) {
    throw new Error(`Unknown --find-known-bad ${knownBad}`);
  }

  const assertLines = hasFlag('find-assert-lines');

  if (assertLines && !phases.includes('counts')) {
    throw new Error('--find-assert-lines needs the counts phase');
  }
  const cohorts = FIND_COHORTS.filter(
    ({ id }) => selected.includes('all') || selected.includes(id)
  );
  const unknown = selected.filter(
    (id) => id !== 'all' && !FIND_COHORTS.some((cohort) => cohort.id === id)
  );

  if (cohorts.length === 0 || unknown.length > 0) {
    throw new Error(
      `--find-cohorts names no known cohort: ${unknown.join(',') || selected.join(',')}`
    );
  }

  const docs = FIND_DOCS.filter((doc) =>
    cohorts.some((cohort) => cohort.doc === doc.id)
  );
  const outputPath = out && path.resolve(process.cwd(), out);
  const source = await readServedSource(url, outputPath);
  const label = getArg('find-label') ?? `find-${rendering}`;
  const results: Array<
    Record<string, unknown> & { cohort: string; plantMs: number }
  > = cohorts.map((cohort) => {
    const doc = FIND_DOCS.find(({ id }) => id === cohort.doc);

    return {
      ...cohort,
      cohort: cohort.id,
      expected: doc ? findDocExpectation(doc) : null,
      plantMs: planted.get(cohort.id) ?? 0,
      refresh: refreshModes.get(cohort.id) ?? 'pass',
    };
  });
  const payload = {
    capturedAt: new Date().toISOString(),
    host: {
      cores: cpus().length,
      loadAfter: [] as number[],
      loadBefore: loadavg(),
    },
    label,
    rendering,
    results,
    samples,
    source,
    url,
  };
  const save = async () => {
    if (!outputPath) return;

    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`);
  };

  for (const phase of phases) {
    if (phase !== 'timing' && phase !== 'counts') {
      throw new Error(`Unknown --find-phases entry ${phase}`);
    }

    for (const doc of docs) {
      // Coverage deoptimizes the page, so counting runs in its own browser.
      const { browser, client, page } = await openFindPage({
        coverage: phase === 'counts',
        timeoutMs,
        url,
      });

      try {
        await runFindDoc({
          client,
          cohorts,
          doc,
          onCohort: async (index, result) => {
            results[index][phase] = result;
            payload.host.loadAfter = loadavg();
            await save();
          },
          options: {
            phase,
            plantMs: planted,
            refresh: refreshModes,
            rendering,
            samples,
          },
          page,
        });
      } finally {
        await closeFindBrowser(browser);
      }
    }
  }

  const misses = results.flatMap((result) => {
    const line = (
      result.counts as { line?: { misses: string[] } | null } | undefined
    )?.line;

    return (line?.misses ?? []).map((miss) => `${result.cohort} ${miss}`);
  });
  const stat = (
    result: Record<string, unknown>,
    phase: 'counts' | 'timing',
    key: string,
    at: 'median' | 'p95' = 'median'
  ) =>
    (
      result[phase] as
        | Record<string, { median: number; p95: number } | null>
        | undefined
    )?.[key]?.[at] ?? null;

  const served = await readServedSource(url, outputPath);

  if (
    served.fingerprint !== source.fingerprint ||
    served.head !== source.head
  ) {
    throw new Error(
      `The served checkout changed during the run: ${source.head} ${source.fingerprint} became ${served.head} ${served.fingerprint}`
    );
  }

  process.stdout.write(
    `${JSON.stringify({
      fingerprint: source.fingerprint,
      label,
      load: { after: payload.host.loadAfter, before: payload.host.loadBefore },
      loaded: source.loaded,
      results: results.map((result) => ({
        cohort: result.cohort,
        medianTextRunsScanned: stat(result, 'counts', 'textRunsScanned'),
        medianRefreshCalls: stat(result, 'counts', 'refreshCalls'),
        medianRefreshKeys: stat(result, 'counts', 'refreshKeys'),
        medianRuntimeReads: stat(result, 'counts', 'runtimeReads'),
        medianLayoutCount: stat(result, 'timing', 'layoutCount'),
        medianPresentationMs: stat(result, 'timing', 'presentationMs'),
        medianTimedStoreWrites: stat(result, 'timing', 'storeWrites'),
        medianRecalcStyleCount: stat(result, 'timing', 'recalcStyleCount'),
        medianSearches: stat(result, 'counts', 'searches'),
        medianStoreWrites: stat(result, 'counts', 'storeWrites'),
        medianTaskDurationMs: stat(result, 'timing', 'taskDurationMs'),
        p95TaskDurationMs: stat(result, 'timing', 'taskDurationMs', 'p95'),
      })),
    })}\n`
  );

  if (assertLines && misses.length > 0) {
    throw new Error(`Find count lines missed:\n${misses.join('\n')}`);
  }
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

  if (benchmarks.includes('find-edit')) {
    if (benchmarks.length > 1 || preset) {
      throw new Error(
        '--benchmarks find-edit runs alone; run the other benchmarks or the preset in their own invocation'
      );
    }

    await runFindLane({ out, timeoutMs, url });

    return;
  }

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

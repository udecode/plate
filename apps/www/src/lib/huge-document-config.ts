export const DEFAULT_HUGE_DOCUMENT_BLOCKS = 10_000;
export const DEFAULT_HUGE_DOCUMENT_CHUNK_SIZE = 1000;
export const HUGE_DOCUMENT_BENCHMARK_SCENARIO_WORKLOAD =
  'huge-mixed-block' as const;

export const HUGE_DOCUMENT_BLOCK_OPTIONS = [
  2, 1000, 2500, 5000, 7500, 10_000, 15_000, 20_000, 25_000, 30_000, 40_000,
  50_000, 100_000, 200_000,
];

export const HUGE_DOCUMENT_CHUNK_SIZE_OPTIONS = [3, 10, 100, 1000];

export type HugeDocumentEngineKind = 'plate' | 'slate';

export type HugeDocumentContentVisibilityMode = 'none' | 'element' | 'chunk';

export type HugeDocumentMountedEngines = 'both' | HugeDocumentEngineKind;

export type HugeDocumentConfig = {
  blocks: number;
  chunking: boolean;
  chunkSize: number;
  chunkDivs: boolean;
  chunkOutlines: boolean;
  contentVisibilityMode: HugeDocumentContentVisibilityMode;
  mountedEngines: HugeDocumentMountedEngines;
  showSelectedHeadings: boolean;
  strictMode: boolean;
};

export type HugeDocumentBenchmarkConfig = {
  blocks: number;
  chunking: boolean;
  chunkSize: number;
  contentVisibility: HugeDocumentContentVisibilityMode;
  scenarioWorkload: string;
};

export const HUGE_DOCUMENT_DEFAULT_CONFIG: HugeDocumentConfig = {
  blocks: DEFAULT_HUGE_DOCUMENT_BLOCKS,
  chunking: true,
  chunkSize: DEFAULT_HUGE_DOCUMENT_CHUNK_SIZE,
  chunkDivs: true,
  chunkOutlines: false,
  contentVisibilityMode: 'chunk',
  mountedEngines: 'both',
  showSelectedHeadings: false,
  strictMode: false,
};

export const HUGE_DOCUMENT_DEFAULT_BENCHMARK_CONFIG: HugeDocumentBenchmarkConfig =
  {
    blocks: 5000,
    chunking: true,
    chunkSize: DEFAULT_HUGE_DOCUMENT_CHUNK_SIZE,
    contentVisibility: 'chunk',
    scenarioWorkload: HUGE_DOCUMENT_BENCHMARK_SCENARIO_WORKLOAD,
  };

function getDocumentSearchParams() {
  if (typeof document === 'undefined') return null;

  return new URLSearchParams(document.location.search);
}

function parseNumber({
  defaultValue,
  key,
  searchParams,
}: {
  defaultValue: number;
  key: string;
  searchParams: URLSearchParams | null;
}) {
  return Number.parseInt(searchParams?.get(key) ?? '', 10) || defaultValue;
}

function parseBoolean({
  defaultValue,
  key,
  searchParams,
}: {
  defaultValue: boolean;
  key: string;
  searchParams: URLSearchParams | null;
}) {
  const value = searchParams?.get(key);

  if (value) return value === 'true';

  return defaultValue;
}

function parseEnum<T extends string>({
  defaultValue,
  key,
  options,
  searchParams,
}: {
  defaultValue: T;
  key: string;
  options: readonly T[];
  searchParams: URLSearchParams | null;
}) {
  const value = searchParams?.get(key) as T | null | undefined;

  if (value && options.includes(value)) return value;

  return defaultValue;
}

function replaceSearchParams(searchParams: URLSearchParams) {
  history.replaceState({}, '', `?${searchParams.toString()}`);
}

export function getInitialHugeDocumentConfig() {
  const searchParams = getDocumentSearchParams();

  return {
    blocks: parseNumber({
      defaultValue: HUGE_DOCUMENT_DEFAULT_CONFIG.blocks,
      key: 'blocks',
      searchParams,
    }),
    chunking: parseBoolean({
      defaultValue: HUGE_DOCUMENT_DEFAULT_CONFIG.chunking,
      key: 'chunking',
      searchParams,
    }),
    chunkSize: parseNumber({
      defaultValue: HUGE_DOCUMENT_DEFAULT_CONFIG.chunkSize,
      key: 'chunk_size',
      searchParams,
    }),
    chunkDivs: parseBoolean({
      defaultValue: HUGE_DOCUMENT_DEFAULT_CONFIG.chunkDivs,
      key: 'chunk_divs',
      searchParams,
    }),
    chunkOutlines: parseBoolean({
      defaultValue: HUGE_DOCUMENT_DEFAULT_CONFIG.chunkOutlines,
      key: 'chunk_outlines',
      searchParams,
    }),
    contentVisibilityMode: parseEnum({
      defaultValue: HUGE_DOCUMENT_DEFAULT_CONFIG.contentVisibilityMode,
      key: 'content_visibility',
      options: ['none', 'element', 'chunk'],
      searchParams,
    }),
    mountedEngines: parseEnum({
      defaultValue: HUGE_DOCUMENT_DEFAULT_CONFIG.mountedEngines,
      key: 'engines',
      options: ['both', 'plate', 'slate'],
      searchParams,
    }),
    showSelectedHeadings: parseBoolean({
      defaultValue: HUGE_DOCUMENT_DEFAULT_CONFIG.showSelectedHeadings,
      key: 'selected_headings',
      searchParams,
    }),
    strictMode: parseBoolean({
      defaultValue: HUGE_DOCUMENT_DEFAULT_CONFIG.strictMode,
      key: 'strict',
      searchParams,
    }),
  } satisfies HugeDocumentConfig;
}

export function writeHugeDocumentSearchParams(config: HugeDocumentConfig) {
  const searchParams = getDocumentSearchParams();

  if (!searchParams) return;

  searchParams.set('blocks', config.blocks.toString());
  searchParams.set('chunking', config.chunking ? 'true' : 'false');
  searchParams.set('chunk_size', config.chunkSize.toString());
  searchParams.set('chunk_divs', config.chunkDivs ? 'true' : 'false');
  searchParams.set('chunk_outlines', config.chunkOutlines ? 'true' : 'false');
  searchParams.set('content_visibility', config.contentVisibilityMode);
  searchParams.set('engines', config.mountedEngines);
  searchParams.set(
    'selected_headings',
    config.showSelectedHeadings ? 'true' : 'false'
  );
  searchParams.set('strict', config.strictMode ? 'true' : 'false');
  replaceSearchParams(searchParams);
}

export function getInitialHugeDocumentBenchmarkConfig() {
  const searchParams = getDocumentSearchParams();

  return {
    blocks: parseNumber({
      defaultValue: HUGE_DOCUMENT_DEFAULT_BENCHMARK_CONFIG.blocks,
      key: 'blocks',
      searchParams,
    }),
    chunking: parseBoolean({
      defaultValue: HUGE_DOCUMENT_DEFAULT_BENCHMARK_CONFIG.chunking,
      key: 'chunking',
      searchParams,
    }),
    chunkSize: parseNumber({
      defaultValue: HUGE_DOCUMENT_DEFAULT_BENCHMARK_CONFIG.chunkSize,
      key: 'chunk_size',
      searchParams,
    }),
    contentVisibility: parseEnum({
      defaultValue: HUGE_DOCUMENT_DEFAULT_BENCHMARK_CONFIG.contentVisibility,
      key: 'content_visibility',
      options: ['none', 'element', 'chunk'],
      searchParams,
    }),
    scenarioWorkload: parseEnum({
      defaultValue: HUGE_DOCUMENT_DEFAULT_BENCHMARK_CONFIG.scenarioWorkload,
      key: 'scenario_workload',
      options: [
        HUGE_DOCUMENT_BENCHMARK_SCENARIO_WORKLOAD,
        'huge-paragraph',
        'huge-heading',
        'huge-blockquote',
        'huge-dense-text',
        'huge-dense-inline-props',
        'huge-paragraph-fallback',
      ],
      searchParams,
    }),
  } satisfies HugeDocumentBenchmarkConfig;
}

export function writeHugeDocumentBenchmarkSearchParams(
  config: HugeDocumentBenchmarkConfig
) {
  const searchParams = getDocumentSearchParams();

  if (!searchParams) return;

  searchParams.set('blocks', config.blocks.toString());
  searchParams.set('chunking', config.chunking ? 'true' : 'false');
  searchParams.set('chunk_size', config.chunkSize.toString());
  searchParams.set('content_visibility', config.contentVisibility);
  searchParams.set('scenario_workload', config.scenarioWorkload);
  replaceSearchParams(searchParams);
}

export function getMountedEngines({
  mountedEngines,
}: Pick<HugeDocumentConfig, 'mountedEngines'>) {
  return mountedEngines === 'both'
    ? (['plate', 'slate'] as const)
    : [mountedEngines];
}

export function toHugeDocumentBenchmarkConfig({
  blocks,
  chunkSize,
  chunking,
  contentVisibilityMode,
}: Pick<
  HugeDocumentConfig,
  'blocks' | 'chunkSize' | 'chunking' | 'contentVisibilityMode'
>): HugeDocumentBenchmarkConfig {
  return {
    blocks,
    chunking,
    chunkSize,
    contentVisibility: contentVisibilityMode,
    scenarioWorkload: HUGE_DOCUMENT_BENCHMARK_SCENARIO_WORKLOAD,
  };
}

export function createHugeDocumentBenchmarkHref(config: HugeDocumentConfig) {
  const searchParams = new URLSearchParams();
  const benchmarkConfig = toHugeDocumentBenchmarkConfig(config);

  searchParams.set('blocks', benchmarkConfig.blocks.toString());
  searchParams.set('chunking', benchmarkConfig.chunking ? 'true' : 'false');
  searchParams.set('chunk_size', benchmarkConfig.chunkSize.toString());
  searchParams.set('content_visibility', benchmarkConfig.contentVisibility);
  searchParams.set('scenario_workload', benchmarkConfig.scenarioWorkload);

  return `/dev/editor-perf?${searchParams.toString()}`;
}

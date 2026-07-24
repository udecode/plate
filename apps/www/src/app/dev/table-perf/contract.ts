export type TablePerfBenchmarkName = 'input' | 'mount' | 'resize' | 'selection';

export type TablePerfConfig = {
  cols: number;
  rows: number;
};

export type TablePerfMetrics = {
  initialRender: number | null;
  lastRenderDuration: number | null;
  renderCount: number;
  renderDurations: number[];
};

export type TablePerfBenchmarkResult = {
  max: number;
  mean: number;
  median: number;
  min: number;
  p95: number;
  p99: number;
  stdDev: number;
};

export type TablePerfLatencyResult = {
  max: number;
  mean: number;
  median: number;
  min: number;
  p95: number;
  p99: number;
  samples: number[];
};

export type TablePerfSelectionLatencyResult = TablePerfLatencyResult & {
  selectedCells: number;
  simulatedDelayMs: number;
};

export type TablePerfResizeLatencyResult = TablePerfLatencyResult & {
  finalWidth: number;
};

export type TablePerfHarnessConfig = TablePerfConfig & {
  selectionCols?: number;
  selectionDelayMs?: number;
  selectionRows?: number;
};

export type TablePerfHarnessSnapshot = {
  benchmarkResult: TablePerfBenchmarkResult | null;
  config: TablePerfConfig;
  inputLatencyResult: TablePerfLatencyResult | null;
  metrics: TablePerfMetrics;
  resizeLatencyResult: TablePerfResizeLatencyResult | null;
  selectionLatencyResult: TablePerfSelectionLatencyResult | null;
  selectionSimulation: {
    cols: number;
    delayMs: number;
    rows: number;
  };
};

export type TablePerfHarness = {
  configure: (
    config: TablePerfHarnessConfig
  ) => Promise<TablePerfHarnessSnapshot>;
  readSnapshot: () => TablePerfHarnessSnapshot;
  runBenchmark: (
    benchmark: TablePerfBenchmarkName
  ) => Promise<TablePerfHarnessSnapshot>;
};

/** Local webpack-dev regression ceilings, not responsiveness targets. */
export const TABLE_PERF_SMOKE_BUDGETS = {
  'table-input-20x20': {
    input: { maxMs: 75, p95Ms: 75, p99Ms: 75 },
  },
  'table-mount-20x20': {
    mount: { maxMs: 450, p95Ms: 450, p99Ms: 450 },
  },
  'table-resize-40x40': {
    resize: { maxMs: 750, p95Ms: 500, p99Ms: 750 },
  },
  'table-selection-40x40-10x10': {
    selection: {
      dragHandles: 1,
      maxMs: 100,
      p95Ms: 100,
      p99Ms: 100,
      selectedCellElements: 100,
    },
  },
} as const;

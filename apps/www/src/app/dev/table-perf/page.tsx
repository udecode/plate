'use client';

import {
  Profiler,
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import type { ProfilerOnRenderCallback, RefObject } from 'react';

import type {
  TTableCellElement,
  TTableElement,
  TTableRowElement,
} from 'platejs';
import { TablePlugin } from '@platejs/table/react';

import type { PlateEditor } from 'platejs/react';

import { Plate, useEditorSelector, usePlateEditor } from 'platejs/react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { BasicBlocksKit } from '@/registry/components/editor/plugins/basic-blocks-kit';
import { BasicMarksKit } from '@/registry/components/editor/plugins/basic-marks-kit';
import { TableKit } from '@/registry/components/editor/plugins/table-kit';
import { Editor, EditorContainer } from '@/registry/ui/editor';

// Types
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

// Presets for O(n²) analysis
const PRESETS: { cells: number; cols: number; label: string; rows: number }[] =
  [
    { cells: 100, cols: 10, label: 'Small', rows: 10 },
    { cells: 400, cols: 20, label: 'Medium', rows: 20 },
    { cells: 1600, cols: 40, label: 'Large', rows: 40 },
    { cells: 3600, cols: 60, label: 'XLarge', rows: 60 },
  ];

// Table generator
function generateTableValue(rows: number, cols: number): TTableElement {
  const children: TTableRowElement[] = Array.from(
    { length: rows },
    (_, rowIndex) => ({
      children: Array.from(
        { length: cols },
        (_, colIndex): TTableCellElement => ({
          children: [
            { children: [{ text: `R${rowIndex}C${colIndex}` }], type: 'p' },
          ],
          id: `cell-${rowIndex}-${colIndex}`,
          type: 'td',
        })
      ),
      type: 'tr',
    })
  );

  return {
    children,
    colSizes: Array.from({ length: cols }, () => 100),
    type: 'table',
  };
}

function getCellPoint(rowIndex: number, colIndex: number) {
  return {
    offset: 0,
    path: [0, rowIndex, colIndex, 0, 0],
  };
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function waitForNextPaint() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resolve();
      });
    });
  });
}

function blockMainThread(durationMs: number) {
  const endTime = performance.now() + durationMs;

  while (performance.now() < endTime) {
    // Busy loop on purpose. This is a dev-only latency simulator.
  }
}

function calculateLatencyStats(samples: number[]): LatencyResult {
  if (samples.length === 0) {
    return { max: 0, mean: 0, median: 0, min: 0, p95: 0, samples: [] };
  }

  const sorted = [...samples].sort((a, b) => a - b);
  const n = sorted.length;

  return {
    max: sorted[n - 1] ?? 0,
    mean: samples.reduce((a, b) => a + b, 0) / n,
    median: sorted[Math.floor(n / 2)] ?? 0,
    min: sorted[0] ?? 0,
    p95: sorted[Math.floor(n * 0.95)] ?? sorted[n - 1] ?? 0,
    samples,
  };
}

function hasSameIds(
  nextValue: string[] | null | undefined,
  prevValue: string[] | null | undefined
) {
  if (nextValue === prevValue) return true;
  if (!nextValue || !prevValue) return !nextValue && !prevValue;
  if (nextValue.length !== prevValue.length) return false;

  for (const [index, nextId] of nextValue.entries()) {
    if (nextId !== prevValue[index]) return false;
  }

  return true;
}

// Statistics calculator
function calculateStats(samples: number[]): BenchmarkResult {
  if (samples.length === 0) {
    return { max: 0, mean: 0, median: 0, min: 0, p95: 0, p99: 0, stdDev: 0 };
  }

  const sorted = [...samples].sort((a, b) => a - b);
  const n = sorted.length;

  // Remove outliers (top/bottom 10%) for mean calculation
  const trimStart = Math.floor(n * 0.1);
  const trimEnd = Math.ceil(n * 0.9);
  const trimmed = sorted.slice(trimStart, trimEnd);

  const mean =
    trimmed.length > 0
      ? trimmed.reduce((a, b) => a + b, 0) / trimmed.length
      : 0;
  const median = sorted[Math.floor(n / 2)] ?? 0;
  const p95 = sorted[Math.floor(n * 0.95)] ?? sorted[n - 1] ?? 0;
  const p99 = sorted[Math.floor(n * 0.99)] ?? sorted[n - 1] ?? 0;

  const variance =
    trimmed.length > 0
      ? trimmed.reduce((sum, x) => sum + (x - mean) ** 2, 0) / trimmed.length
      : 0;
  const stdDev = Math.sqrt(variance);

  return {
    max: sorted[n - 1] ?? 0,
    mean,
    median,
    min: sorted[0] ?? 0,
    p95,
    p99,
    stdDev,
  };
}

// Metrics display component
function MetricsDisplay({
  benchmarkResult,
  inputLatencyResult,
  metrics,
  selectionLatencyResult,
}: {
  benchmarkResult: BenchmarkResult | null;
  inputLatencyResult: LatencyResult | null;
  metrics: Metrics;
  selectionLatencyResult: SelectionLatencyResult | null;
}) {
  const stats = calculateStats(metrics.renderDurations);

  return (
    <div className="rounded-lg border bg-muted/50 p-4">
      <h3 className="mb-3 font-semibold">Metrics</h3>
      <div className="space-y-2 font-mono text-sm">
        <div className="flex justify-between">
          <span>Initial render:</span>
          <span className="text-primary">
            {metrics.initialRender?.toFixed(2) ?? '—'} ms
          </span>
        </div>
        <div className="flex justify-between">
          <span>Re-render count:</span>
          <span className="text-primary">{metrics.renderCount}</span>
        </div>
        <div className="flex justify-between">
          <span>Last render:</span>
          <span className="text-primary">
            {metrics.lastRenderDuration?.toFixed(2) ?? '—'} ms
          </span>
        </div>
        {metrics.renderDurations.length > 0 && (
          <>
            <hr className="my-2" />
            <div className="flex justify-between">
              <span>Avg render:</span>
              <span className="text-primary">{stats.mean.toFixed(2)} ms</span>
            </div>
            <div className="flex justify-between">
              <span>Median:</span>
              <span className="text-primary">{stats.median.toFixed(2)} ms</span>
            </div>
            <div className="flex justify-between">
              <span>P95:</span>
              <span className="text-primary">{stats.p95.toFixed(2)} ms</span>
            </div>
          </>
        )}
        {benchmarkResult && (
          <>
            <hr className="my-2" />
            <div className="font-semibold">Benchmark Results:</div>
            <div className="flex justify-between">
              <span>Mean:</span>
              <span className="text-green-600">
                {benchmarkResult.mean.toFixed(2)} ms
              </span>
            </div>
            <div className="flex justify-between">
              <span>Median:</span>
              <span className="text-green-600">
                {benchmarkResult.median.toFixed(2)} ms
              </span>
            </div>
            <div className="flex justify-between">
              <span>P95:</span>
              <span className="text-green-600">
                {benchmarkResult.p95.toFixed(2)} ms
              </span>
            </div>
            <div className="flex justify-between">
              <span>P99:</span>
              <span className="text-green-600">
                {benchmarkResult.p99.toFixed(2)} ms
              </span>
            </div>
            <div className="flex justify-between">
              <span>Min/Max:</span>
              <span className="text-green-600">
                {benchmarkResult.min.toFixed(2)} /{' '}
                {benchmarkResult.max.toFixed(2)} ms
              </span>
            </div>
            <div className="flex justify-between">
              <span>Std Dev:</span>
              <span className="text-green-600">
                {benchmarkResult.stdDev.toFixed(2)} ms
              </span>
            </div>
          </>
        )}
        {inputLatencyResult && (
          <>
            <hr className="my-2" />
            <div className="font-semibold">Input Latency:</div>
            <div className="flex justify-between">
              <span>Mean:</span>
              <span className="text-blue-600">
                {inputLatencyResult.mean.toFixed(2)} ms
              </span>
            </div>
            <div className="flex justify-between">
              <span>Median:</span>
              <span className="text-blue-600">
                {inputLatencyResult.median.toFixed(2)} ms
              </span>
            </div>
            <div className="flex justify-between">
              <span>P95:</span>
              <span className="text-blue-600">
                {inputLatencyResult.p95.toFixed(2)} ms
              </span>
            </div>
            <div className="flex justify-between">
              <span>Min/Max:</span>
              <span className="text-blue-600">
                {inputLatencyResult.min.toFixed(2)} /{' '}
                {inputLatencyResult.max.toFixed(2)} ms
              </span>
            </div>
          </>
        )}
        {selectionLatencyResult && (
          <>
            <hr className="my-2" />
            <div className="font-semibold">Table Selection Latency:</div>
            <div className="flex justify-between">
              <span>Selected cells:</span>
              <span className="text-amber-600">
                {selectionLatencyResult.selectedCells}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Injected delay:</span>
              <span className="text-amber-600">
                {selectionLatencyResult.simulatedDelayMs.toFixed(0)} ms
              </span>
            </div>
            <div className="flex justify-between">
              <span>Mean:</span>
              <span className="text-amber-600">
                {selectionLatencyResult.mean.toFixed(2)} ms
              </span>
            </div>
            <div className="flex justify-between">
              <span>Median:</span>
              <span className="text-amber-600">
                {selectionLatencyResult.median.toFixed(2)} ms
              </span>
            </div>
            <div className="flex justify-between">
              <span>P95:</span>
              <span className="text-amber-600">
                {selectionLatencyResult.p95.toFixed(2)} ms
              </span>
            </div>
            <div className="flex justify-between">
              <span>Min/Max:</span>
              <span className="text-amber-600">
                {selectionLatencyResult.min.toFixed(2)} /{' '}
                {selectionLatencyResult.max.toFixed(2)} ms
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Main page component
export default function TablePerfPage() {
  const [config, setConfig] = useState<TableConfig>({ cols: 10, rows: 10 });
  const [editorKey, setEditorKey] = useState(0);
  const [metrics, setMetrics] = useState<Metrics>({
    initialRender: null,
    lastRenderDuration: null,
    renderCount: 0,
    renderDurations: [],
  });
  const [benchmarkResult, setBenchmarkResult] =
    useState<BenchmarkResult | null>(null);
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [inputLatencyResult, setInputLatencyResult] =
    useState<LatencyResult | null>(null);
  const [isMeasuringLatency, setIsMeasuringLatency] = useState(false);
  const [selectionLatencyResult, setSelectionLatencyResult] =
    useState<SelectionLatencyResult | null>(null);
  const [selectionSimulation, setSelectionSimulation] =
    useState<SelectionSimulationConfig>({
      cols: 3,
      delayMs: 0,
      rows: 3,
    });
  const [isMeasuringSelection, setIsMeasuringSelection] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const plateEditorRef = useRef<PlateEditor | null>(null);

  // Generate initial table value
  const tableValue = generateTableValue(config.rows, config.cols);

  const selectedCols = Math.min(selectionSimulation.cols, config.cols);
  const selectedRows = Math.min(selectionSimulation.rows, config.rows);

  // Use ref to collect profiler data without causing re-renders
  const profilerDataRef = useRef<{
    initialRender: number | null;
    lastRenderDuration: number | null;
    renderCount: number;
    renderDurations: number[];
  }>({
    initialRender: null,
    lastRenderDuration: null,
    renderCount: 0,
    renderDurations: [],
  });

  // Track if we should update metrics (only after user actions)
  const shouldUpdateMetricsRef = useRef(true);

  const onRenderCallback: ProfilerOnRenderCallback = useCallback(
    (id, phase, actualDuration, baseDuration) => {
      console.log(
        `[Profiler] ${id} (${phase}): ${actualDuration.toFixed(2)}ms (base: ${baseDuration.toFixed(2)}ms)`
      );

      // Store in ref
      profilerDataRef.current.lastRenderDuration = actualDuration;
      profilerDataRef.current.renderCount += 1;
      profilerDataRef.current.renderDurations.push(actualDuration);

      if (phase === 'mount') {
        profilerDataRef.current.initialRender = actualDuration;
      }

      // Only sync to state if triggered by user action (not by metrics update)
      if (shouldUpdateMetricsRef.current) {
        shouldUpdateMetricsRef.current = false;
        setTimeout(() => {
          setMetrics({ ...profilerDataRef.current });
        }, 0);
      }
    },
    []
  );

  const handleGenerate = useCallback(() => {
    // Reset metrics and force editor remount
    profilerDataRef.current = {
      initialRender: null,
      lastRenderDuration: null,
      renderCount: 0,
      renderDurations: [],
    };
    setMetrics({
      initialRender: null,
      lastRenderDuration: null,
      renderCount: 0,
      renderDurations: [],
    });
    setBenchmarkResult(null);
    setInputLatencyResult(null);
    setSelectionLatencyResult(null);
    shouldUpdateMetricsRef.current = true; // Allow metrics update
    setEditorKey((k) => k + 1);
  }, []);

  const handlePreset = useCallback((preset: (typeof PRESETS)[number]) => {
    setConfig({ cols: preset.cols, rows: preset.rows });
    setSelectionSimulation((current) => ({
      ...current,
      cols: Math.min(current.cols, preset.cols),
      rows: Math.min(current.rows, preset.rows),
    }));
  }, []);

  const focusEditor = useCallback(async () => {
    const editorElement = editorRef.current?.querySelector('[contenteditable]');

    if (editorElement) {
      (editorElement as HTMLElement).focus();
    }

    await wait(100);
  }, []);

  const collapseSelectionToFirstCell = useCallback((editor: PlateEditor) => {
    const firstCellPoint = getCellPoint(0, 0);

    editor.tf.select({
      anchor: firstCellPoint,
      focus: firstCellPoint,
    });
  }, []);

  const selectCellRange = useCallback(
    (editor: PlateEditor, rows: number, cols: number) => {
      const endRow = Math.max(1, Math.min(config.rows, rows)) - 1;
      const endCol = Math.max(1, Math.min(config.cols, cols)) - 1;

      editor.tf.select({
        anchor: getCellPoint(0, 0),
        focus: getCellPoint(endRow, endCol),
      });

      return { cols: endCol + 1, rows: endRow + 1 };
    },
    [config.cols, config.rows]
  );

  const runBenchmark = useCallback(async () => {
    setIsBenchmarking(true);
    setBenchmarkResult(null);

    const WARMUP_RUNS = 5;
    const MEASURED_RUNS = 20;
    const COOLDOWN_MS = 100;
    const renderTimes: number[] = [];

    console.log('[Benchmark] Starting benchmark...');
    console.log(`[Benchmark] Config: ${config.rows}x${config.cols} cells`);
    console.log(
      `[Benchmark] ${WARMUP_RUNS} warmup runs, ${MEASURED_RUNS} measured runs`
    );

    for (let i = 0; i < WARMUP_RUNS + MEASURED_RUNS; i++) {
      const isWarmup = i < WARMUP_RUNS;

      // Reset profiler data ref
      profilerDataRef.current = {
        initialRender: null,
        lastRenderDuration: null,
        renderCount: 0,
        renderDurations: [],
      };

      // Force remount
      setEditorKey((k) => k + 1);

      // Wait for render to complete
      await waitForNextPaint();

      // Small delay to ensure state is updated
      await wait(50);

      const initialRender = profilerDataRef.current.initialRender;

      if (initialRender !== null && !isWarmup) {
        renderTimes.push(initialRender);
        console.log(
          `[Benchmark] Run ${i - WARMUP_RUNS + 1}/${MEASURED_RUNS}: ${initialRender.toFixed(2)}ms`
        );
      } else if (isWarmup) {
        console.log(`[Benchmark] Warmup ${i + 1}/${WARMUP_RUNS}`);
      }

      // Cooldown between iterations
      await wait(COOLDOWN_MS);
    }

    const result = calculateStats(renderTimes);
    setBenchmarkResult(result);
    setIsBenchmarking(false);

    console.log('[Benchmark] Complete!');
    console.log('[Benchmark] Results:', result);
  }, [config.cols, config.rows]);

  const measureInputLatency = useCallback(async () => {
    setIsMeasuringLatency(true);
    setInputLatencyResult(null);

    const samples: number[] = [];
    const NUM_SAMPLES = 50;
    const WARMUP_SAMPLES = 10;

    console.log('[Input Latency] Starting measurement...');

    const editor = plateEditorRef.current;
    if (!editor) {
      console.error('[Input Latency] Could not find Plate editor');
      setIsMeasuringLatency(false);
      return;
    }

    await focusEditor();

    // Select the start of the first cell using Slate API
    try {
      collapseSelectionToFirstCell(editor);
    } catch (e) {
      console.error('[Input Latency] Could not select first cell:', e);
      setIsMeasuringLatency(false);
      return;
    }

    await wait(100);

    for (let i = 0; i < NUM_SAMPLES + WARMUP_SAMPLES; i++) {
      const isWarmup = i < WARMUP_SAMPLES;
      const char = String.fromCharCode(97 + (i % 26)); // a-z

      const startTime = performance.now();

      // Use Slate API to insert text - this triggers the full React update cycle
      editor.tf.insertText(char);

      // Wait for React to process and render the update
      await waitForNextPaint();

      const endTime = performance.now();
      const latency = endTime - startTime;

      if (!isWarmup) {
        samples.push(latency);
        if (i % 10 === 0) {
          console.log(
            `[Input Latency] Sample ${i - WARMUP_SAMPLES + 1}/${NUM_SAMPLES}: ${latency.toFixed(2)}ms`
          );
        }
      }

      // Small delay between inputs
      await wait(50);
    }

    const result = calculateLatencyStats(samples);

    setInputLatencyResult(result);
    setIsMeasuringLatency(false);

    console.log('[Input Latency] Complete!');
    console.log('[Input Latency] Results:', result);
  }, [collapseSelectionToFirstCell, focusEditor]);

  const simulateTableSelection = useCallback(async () => {
    const editor = plateEditorRef.current;
    if (!editor) {
      console.error('[Selection] Could not find Plate editor');
      return;
    }

    console.log(
      `[Selection] Simulating ${selectedRows}x${selectedCols} range with ${selectionSimulation.delayMs}ms injected delay`
    );

    await focusEditor();
    collapseSelectionToFirstCell(editor);
    await wait(50);

    shouldUpdateMetricsRef.current = true;
    selectCellRange(editor, selectedRows, selectedCols);

    await waitForNextPaint();
    setMetrics({ ...profilerDataRef.current });
  }, [
    collapseSelectionToFirstCell,
    focusEditor,
    selectedCols,
    selectedRows,
    selectCellRange,
    selectionSimulation.delayMs,
  ]);

  const measureTableSelectionLatency = useCallback(async () => {
    setIsMeasuringSelection(true);
    setSelectionLatencyResult(null);

    const editor = plateEditorRef.current;
    if (!editor) {
      console.error('[Selection] Could not find Plate editor');
      setIsMeasuringSelection(false);
      return;
    }

    const samples: number[] = [];
    const NUM_SAMPLES = 30;
    const WARMUP_SAMPLES = 5;

    console.log('[Selection] Starting latency measurement...');
    console.log(
      `[Selection] Range: ${selectedRows}x${selectedCols}, injected delay: ${selectionSimulation.delayMs}ms`
    );

    await focusEditor();
    collapseSelectionToFirstCell(editor);
    await wait(100);

    for (let i = 0; i < NUM_SAMPLES + WARMUP_SAMPLES; i++) {
      const isWarmup = i < WARMUP_SAMPLES;

      collapseSelectionToFirstCell(editor);
      await wait(16);

      const startTime = performance.now();
      selectCellRange(editor, selectedRows, selectedCols);
      await waitForNextPaint();

      const latency = performance.now() - startTime;

      if (!isWarmup) {
        samples.push(latency);
        if ((i - WARMUP_SAMPLES + 1) % 10 === 0) {
          console.log(
            `[Selection] Sample ${i - WARMUP_SAMPLES + 1}/${NUM_SAMPLES}: ${latency.toFixed(2)}ms`
          );
        }
      }

      await wait(50);
    }

    const result: SelectionLatencyResult = {
      ...calculateLatencyStats(samples),
      selectedCells: selectedRows * selectedCols,
      simulatedDelayMs: selectionSimulation.delayMs,
    };

    setSelectionLatencyResult(result);
    setIsMeasuringSelection(false);

    console.log('[Selection] Complete!');
    console.log('[Selection] Results:', result);
  }, [
    collapseSelectionToFirstCell,
    focusEditor,
    selectedCols,
    selectedRows,
    selectCellRange,
    selectionSimulation.delayMs,
  ]);

  return (
    <main className="container mx-auto p-8">
      <h1 className="mb-6 font-bold text-2xl">Table Performance Test</h1>

      {/* Configuration */}
      <div className="mb-6 rounded-lg border p-4">
        <h2 className="mb-4 font-semibold">Configuration</h2>

        <div className="mb-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm" htmlFor="table-rows">
              Rows:
            </label>
            <Input
              className="w-20"
              id="table-rows"
              max={100}
              min={1}
              type="number"
              value={config.rows}
              onChange={(e) => {
                const nextRows = Math.max(
                  1,
                  Math.min(100, Number(e.target.value) || 1)
                );

                setConfig((current) => ({ ...current, rows: nextRows }));
                setSelectionSimulation((current) => ({
                  ...current,
                  rows: Math.min(current.rows, nextRows),
                }));
              }}
            />
          </div>
          <span className="text-muted-foreground">x</span>
          <div className="flex items-center gap-2">
            <label className="text-sm" htmlFor="table-cols">
              Cols:
            </label>
            <Input
              className="w-20"
              id="table-cols"
              max={100}
              min={1}
              type="number"
              value={config.cols}
              onChange={(e) => {
                const nextCols = Math.max(
                  1,
                  Math.min(100, Number(e.target.value) || 1)
                );

                setConfig((current) => ({ ...current, cols: nextCols }));
                setSelectionSimulation((current) => ({
                  ...current,
                  cols: Math.min(current.cols, nextCols),
                }));
              }}
            />
          </div>
          <span className="text-muted-foreground">
            = {config.rows * config.cols} cells
          </span>
        </div>

        <div className="mb-4 flex gap-2">
          {PRESETS.map((preset) => (
            <Button
              key={preset.label}
              className={cn(
                config.rows === preset.rows &&
                  config.cols === preset.cols &&
                  'ring-2 ring-primary'
              )}
              size="sm"
              variant="outline"
              onClick={() => handlePreset(preset)}
            >
              {preset.label} ({preset.cells})
            </Button>
          ))}
        </div>

        <div className="mb-4 rounded-lg border border-dashed bg-muted/30 p-4">
          <h3 className="mb-3 font-medium text-sm">Selection Simulation</h3>

          <div className="mb-3 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm" htmlFor="selection-rows">
                Selected rows:
              </label>
              <Input
                className="w-20"
                id="selection-rows"
                max={config.rows}
                min={1}
                type="number"
                value={selectionSimulation.rows}
                onChange={(e) =>
                  setSelectionSimulation((current) => ({
                    ...current,
                    rows: Math.max(
                      1,
                      Math.min(config.rows, Number(e.target.value) || 1)
                    ),
                  }))
                }
              />
            </div>
            <span className="text-muted-foreground">x</span>
            <div className="flex items-center gap-2">
              <label className="text-sm" htmlFor="selection-cols">
                Selected cols:
              </label>
              <Input
                className="w-20"
                id="selection-cols"
                max={config.cols}
                min={1}
                type="number"
                value={selectionSimulation.cols}
                onChange={(e) =>
                  setSelectionSimulation((current) => ({
                    ...current,
                    cols: Math.max(
                      1,
                      Math.min(config.cols, Number(e.target.value) || 1)
                    ),
                  }))
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm" htmlFor="selection-delay">
                Added delay:
              </label>
              <Input
                className="w-24"
                id="selection-delay"
                max={2000}
                min={0}
                step={1}
                type="number"
                value={selectionSimulation.delayMs}
                onChange={(e) =>
                  setSelectionSimulation((current) => ({
                    ...current,
                    delayMs: Math.max(
                      0,
                      Math.min(2000, Number(e.target.value) || 0)
                    ),
                  }))
                }
              />
              <span className="text-muted-foreground text-sm">ms</span>
            </div>
            <span className="text-muted-foreground text-sm">
              = {selectedRows * selectedCols} selected cells
            </span>
          </div>

          <p className="text-muted-foreground text-sm">
            Delay is injected only on this page, right before paint, when the
            table&apos;s multi-cell selection changes.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={handleGenerate}>Generate Table</Button>
          <Button
            disabled={isBenchmarking}
            variant="secondary"
            onClick={runBenchmark}
          >
            {isBenchmarking ? 'Running...' : 'Run Benchmark (20 iter)'}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              shouldUpdateMetricsRef.current = true;
              setMetrics({ ...profilerDataRef.current });
            }}
          >
            Refresh Metrics
          </Button>
          <Button
            disabled={isMeasuringLatency}
            variant="secondary"
            onClick={measureInputLatency}
          >
            {isMeasuringLatency
              ? 'Measuring...'
              : 'Test Input Latency (50 samples)'}
          </Button>
          <Button
            disabled={isMeasuringSelection}
            variant="secondary"
            onClick={simulateTableSelection}
          >
            Simulate Table Selection
          </Button>
          <Button
            disabled={isMeasuringSelection}
            variant="outline"
            onClick={measureTableSelectionLatency}
          >
            {isMeasuringSelection
              ? 'Measuring...'
              : 'Test Selection Latency (30 samples)'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-[300px_1fr] gap-6">
        {/* Metrics */}
        <MetricsDisplay
          benchmarkResult={benchmarkResult}
          inputLatencyResult={inputLatencyResult}
          metrics={metrics}
          selectionLatencyResult={selectionLatencyResult}
        />

        {/* Editor */}
        <div ref={editorRef} className="rounded-lg border">
          <Profiler
            key={editorKey}
            id="TableEditor"
            onRender={onRenderCallback}
          >
            <TablePerfEditor
              editorRef={plateEditorRef}
              selectionSimulationDelayMs={selectionSimulation.delayMs}
              tableValue={tableValue}
            />
          </Profiler>
        </div>
      </div>
    </main>
  );
}

// Editor component (separated for profiling)
function TablePerfEditor({
  editorRef,
  selectionSimulationDelayMs,
  tableValue,
}: {
  editorRef?: RefObject<PlateEditor | null>;
  selectionSimulationDelayMs: number;
  tableValue: TTableElement;
}) {
  const editor = usePlateEditor({
    plugins: [...BasicBlocksKit, ...BasicMarksKit, ...TableKit],
    value: [tableValue],
  });

  useImperativeHandle(editorRef, () => editor, [editor]);

  return (
    <Plate editor={editor}>
      <SelectionCostSimulator delayMs={selectionSimulationDelayMs} />
      <EditorContainer className="h-[500px] overflow-auto">
        <Editor variant="none" className="p-4" />
      </EditorContainer>
    </Plate>
  );
}

function SelectionCostSimulator({ delayMs }: { delayMs: number }) {
  const selectedCellIds = useEditorSelector(
    (editor) => editor.getApi(TablePlugin).table.getSelectedCellIds(),
    [],
    {
      equalityFn: hasSameIds,
    }
  );

  useLayoutEffect(() => {
    if (!selectedCellIds?.length || delayMs <= 0) return;

    blockMainThread(delayMs);
  }, [delayMs, selectedCellIds]);

  return null;
}

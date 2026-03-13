'use client';

import {
  Profiler,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import type { ProfilerOnRenderCallback, RefObject } from 'react';

import type {
  TTableCellElement,
  TTableElement,
  TTableRowElement,
} from 'platejs';

import type { PlateEditor } from 'platejs/react';

import { Plate, usePlateEditor } from 'platejs/react';

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

type InputLatencyResult = {
  max: number;
  mean: number;
  median: number;
  min: number;
  p95: number;
  samples: number[];
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
}: {
  benchmarkResult: BenchmarkResult | null;
  inputLatencyResult: InputLatencyResult | null;
  metrics: Metrics;
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
    useState<InputLatencyResult | null>(null);
  const [isMeasuringLatency, setIsMeasuringLatency] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const plateEditorRef = useRef<PlateEditor | null>(null);

  // Generate initial table value
  const tableValue = generateTableValue(config.rows, config.cols);

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
    shouldUpdateMetricsRef.current = true; // Allow metrics update
    setEditorKey((k) => k + 1);
  }, []);

  const handlePreset = useCallback((preset: (typeof PRESETS)[number]) => {
    setConfig({ cols: preset.cols, rows: preset.rows });
  }, []);

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
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            resolve();
          });
        });
      });

      // Small delay to ensure state is updated
      await new Promise((resolve) => setTimeout(resolve, 50));

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
      await new Promise((resolve) => setTimeout(resolve, COOLDOWN_MS));
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

    // Focus the editor and select first cell
    const editorElement = editorRef.current?.querySelector('[contenteditable]');
    if (editorElement) {
      (editorElement as HTMLElement).focus();
    }

    // Wait for focus
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Select the start of the first cell using Slate API
    try {
      // Find first text node path in the table
      // Table structure: table > tr > td > p > text
      const firstCellPath = [0, 0, 0, 0, 0]; // table[0]/row[0]/cell[0]/p[0]/text[0]
      editor.tf.select({
        anchor: { offset: 0, path: firstCellPath },
        focus: { offset: 0, path: firstCellPath },
      });
    } catch (e) {
      console.error('[Input Latency] Could not select first cell:', e);
      setIsMeasuringLatency(false);
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 100));

    for (let i = 0; i < NUM_SAMPLES + WARMUP_SAMPLES; i++) {
      const isWarmup = i < WARMUP_SAMPLES;
      const char = String.fromCharCode(97 + (i % 26)); // a-z

      const startTime = performance.now();

      // Use Slate API to insert text - this triggers the full React update cycle
      editor.tf.insertText(char);

      // Wait for React to process and render the update
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            resolve();
          });
        });
      });

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
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    // Calculate stats
    const sorted = [...samples].sort((a, b) => a - b);
    const n = sorted.length;
    const mean = samples.reduce((a, b) => a + b, 0) / n;
    const median = sorted[Math.floor(n / 2)] ?? 0;
    const p95 = sorted[Math.floor(n * 0.95)] ?? sorted[n - 1] ?? 0;
    const min = sorted[0] ?? 0;
    const max = sorted[n - 1] ?? 0;

    const result: InputLatencyResult = {
      max,
      mean,
      median,
      min,
      p95,
      samples,
    };

    setInputLatencyResult(result);
    setIsMeasuringLatency(false);

    console.log('[Input Latency] Complete!');
    console.log('[Input Latency] Results:', result);
  }, []);

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
              onChange={(e) =>
                setConfig((c) => ({
                  ...c,
                  rows: Math.max(1, Math.min(100, Number(e.target.value) || 1)),
                }))
              }
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
              onChange={(e) =>
                setConfig((c) => ({
                  ...c,
                  cols: Math.max(1, Math.min(100, Number(e.target.value) || 1)),
                }))
              }
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

        <div className="flex gap-2">
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
        </div>
      </div>

      <div className="grid grid-cols-[300px_1fr] gap-6">
        {/* Metrics */}
        <MetricsDisplay
          benchmarkResult={benchmarkResult}
          inputLatencyResult={inputLatencyResult}
          metrics={metrics}
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
  tableValue,
}: {
  editorRef?: RefObject<PlateEditor | null>;
  tableValue: TTableElement;
}) {
  const editor = usePlateEditor({
    plugins: [...BasicBlocksKit, ...BasicMarksKit, ...TableKit],
    value: [tableValue],
  });

  useImperativeHandle(editorRef, () => editor, [editor]);

  return (
    <Plate editor={editor}>
      <EditorContainer className="h-[500px] overflow-auto">
        <Editor variant="none" className="p-4" />
      </EditorContainer>
    </Plate>
  );
}

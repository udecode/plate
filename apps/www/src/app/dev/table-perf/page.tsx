'use client';

import { NodeApi, type Value } from 'platejs';
import {
  Plate,
  type Editor as ProductEditor,
  useCreateEditor,
  useEditor,
} from 'platejs/react';
import type {
  TableCellElement,
  TableElement,
  TableRowElement,
} from 'platejs/table';
import { TablePlugin } from 'platejs/table/react';
import * as React from 'react';

import { BasicBlocksKit } from '@/registry/components/editor/basic-blocks';
import { DndKit } from '@/registry/components/editor/dnd';
import { Editor, EditorContainer } from '@/registry/components/editor/editor';
import { TableKit } from '@/registry/components/editor/table';

import type {
  TablePerfBenchmarkName,
  TablePerfBenchmarkResult,
  TablePerfConfig,
  TablePerfHarness,
  TablePerfHarnessConfig,
  TablePerfHarnessSnapshot,
  TablePerfLatencyResult,
  TablePerfMetrics,
  TablePerfResizeLatencyResult,
  TablePerfSelectionLatencyResult,
} from './contract';

const DEFAULT_CONFIG = { cols: 10, rows: 10 } satisfies TablePerfConfig;
const DEFAULT_SELECTION = { cols: 3, delayMs: 0, rows: 3 };
const MEASURED_RUNS = 22;
const WARMUP_RUNS = 3;
const EMPTY_METRICS: TablePerfMetrics = {
  initialRender: null,
  lastRenderDuration: null,
  renderCount: 0,
  renderDurations: [],
};
const EMPTY_SNAPSHOT: TablePerfHarnessSnapshot = {
  benchmarkResult: null,
  config: DEFAULT_CONFIG,
  inputLatencyResult: null,
  metrics: EMPTY_METRICS,
  resizeLatencyResult: null,
  selectionLatencyResult: null,
  selectionSimulation: DEFAULT_SELECTION,
};

const createTable = (rows: number, cols: number): TableElement => ({
  children: Array.from({ length: rows }, (_, rowIndex): TableRowElement => ({
    children: Array.from(
      { length: cols },
      (innerValue, colIndex): TableCellElement => ({
        children: [
          {
            children: [{ text: `R${rowIndex}C${colIndex}` }],
            type: 'paragraph',
          },
        ],
        type: 'tableCell',
      })
    ),
    type: 'tableRow',
  })),
  columnWidths: Array.from({ length: cols }, () => 100),
  type: 'table',
});

const cellPoint = (row: number, col: number) => ({
  offset: 0,
  path: [0, row, col, 0, 0],
});

const nextPaint = () =>
  new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resolve();
      });
    });
  });

const summarizeLatency = (samples: number[]): TablePerfLatencyResult => {
  const sorted = [...samples].sort((left, right) => left - right);
  const count = sorted.length;

  if (count === 0) {
    return {
      max: 0,
      mean: 0,
      median: 0,
      min: 0,
      p95: 0,
      p99: 0,
      samples,
    };
  }

  return {
    max: sorted.at(-1) ?? 0,
    mean: samples.reduce((total, sample) => total + sample, 0) / count,
    median: sorted[Math.floor(count / 2)] ?? 0,
    min: sorted[0] ?? 0,
    p95: sorted[Math.ceil(count * 0.95) - 1] ?? sorted.at(-1) ?? 0,
    p99: sorted[Math.ceil(count * 0.99) - 1] ?? sorted.at(-1) ?? 0,
    samples,
  };
};

const summarizeMount = (samples: number[]): TablePerfBenchmarkResult => {
  const latency = summarizeLatency(samples);
  const variance =
    samples.reduce((total, sample) => total + (sample - latency.mean) ** 2, 0) /
    Math.max(samples.length, 1);
  const sorted = [...samples].sort((left, right) => left - right);

  return {
    max: latency.max,
    mean: latency.mean,
    median: latency.median,
    min: latency.min,
    p95: latency.p95,
    p99: sorted[Math.ceil(sorted.length * 0.99) - 1] ?? latency.max,
    stdDev: Math.sqrt(variance),
  };
};

const clampDimension = (value: number | undefined, max: number) =>
  Math.max(1, Math.min(max, value ?? 1));

function assertRenderedTable(editor: ProductEditor, config: TablePerfConfig) {
  const root = editor.api.dom.root();
  const table = editor.read.nodes.get([0], { type: TablePlugin })?.[0];
  const cells = root?.querySelectorAll(
    'td[data-plite-path],th[data-plite-path]'
  );

  if (
    !root?.isConnected ||
    !cells ||
    cells.length !== config.rows * config.cols
  ) {
    throw new Error(
      `Table benchmark requires ${config.rows * config.cols} mounted cells; received ${cells?.length ?? 0}`
    );
  }
  if (!table || table.children.length !== config.rows) {
    throw new Error(
      'Table benchmark model dimensions do not match its fixture'
    );
  }
  table.children.forEach((row, rowIndex) => {
    if (!NodeApi.isElement(row) || row.children.length !== config.cols) {
      throw new Error('Table benchmark model column count changed');
    }
    row.children.forEach((cell, colIndex) => {
      const element = cells.item(rowIndex * config.cols + colIndex);
      if (
        element?.getAttribute('data-plite-path') !==
          `0,${rowIndex},${colIndex}` ||
        element.textContent !== NodeApi.string(cell)
      ) {
        throw new Error(
          `Table benchmark cell ${rowIndex},${colIndex} does not match its model`
        );
      }
    });
  });

  return { root, table };
}

export default function TablePerfPage() {
  const [config, setConfig] = React.useState<TablePerfConfig>(DEFAULT_CONFIG);
  const [editorKey, setEditorKey] = React.useState(0);
  const [selectionSimulation, setSelectionSimulation] =
    React.useState(DEFAULT_SELECTION);
  const editorRef = React.useRef<ProductEditor | null>(null);
  const configRef = React.useRef(config);
  const selectionSimulationRef = React.useRef(selectionSimulation);
  const metricsRef = React.useRef<TablePerfMetrics>({ ...EMPTY_METRICS });
  const initialRenderRef = React.useRef<number | null>(null);
  const benchmarkResultRef = React.useRef<TablePerfBenchmarkResult | null>(
    null
  );
  const inputLatencyResultRef = React.useRef<TablePerfLatencyResult | null>(
    null
  );
  const resizeLatencyResultRef =
    React.useRef<TablePerfResizeLatencyResult | null>(null);
  const selectionLatencyResultRef =
    React.useRef<TablePerfSelectionLatencyResult | null>(null);
  const [summary, setSummary] =
    React.useState<TablePerfHarnessSnapshot>(EMPTY_SNAPSHOT);

  const resetResults = React.useCallback(() => {
    metricsRef.current = { ...EMPTY_METRICS, renderDurations: [] };
    initialRenderRef.current = null;
    benchmarkResultRef.current = null;
    inputLatencyResultRef.current = null;
    resizeLatencyResultRef.current = null;
    selectionLatencyResultRef.current = null;
  }, []);

  const remount = React.useCallback(async () => {
    initialRenderRef.current = null;
    editorRef.current = null;
    setEditorKey((key) => key + 1);
    await nextPaint();

    if (!editorRef.current) {
      throw new Error('Table performance editor did not mount');
    }
    assertRenderedTable(editorRef.current, configRef.current);
  }, []);

  const readSnapshot = React.useCallback(
    (): TablePerfHarnessSnapshot => ({
      benchmarkResult: benchmarkResultRef.current,
      config: configRef.current,
      inputLatencyResult: inputLatencyResultRef.current,
      metrics: {
        ...metricsRef.current,
        renderDurations: [...metricsRef.current.renderDurations],
      },
      resizeLatencyResult: resizeLatencyResultRef.current,
      selectionLatencyResult: selectionLatencyResultRef.current,
      selectionSimulation: selectionSimulationRef.current,
    }),
    []
  );
  const refreshSummary = React.useCallback(() => {
    setSummary(readSnapshot());
  }, [readSnapshot]);

  const configure = React.useCallback(
    async (next: TablePerfHarnessConfig) => {
      const nextConfig = {
        cols: Math.max(1, next.cols),
        rows: Math.max(1, next.rows),
      };
      const nextSelection = {
        cols: clampDimension(next.selectionCols, nextConfig.cols),
        delayMs: Math.max(0, next.selectionDelayMs ?? 0),
        rows: clampDimension(next.selectionRows, nextConfig.rows),
      };

      configRef.current = nextConfig;
      selectionSimulationRef.current = nextSelection;
      setConfig(nextConfig);
      setSelectionSimulation(nextSelection);
      resetResults();
      await remount();
      refreshSummary();

      return readSnapshot();
    },
    [readSnapshot, refreshSummary, remount, resetResults]
  );

  const setCollapsedSelection = React.useCallback((editor: ProductEditor) => {
    const point = cellPoint(0, 0);
    editor.update.selection.set({ anchor: point, focus: point });
  }, []);

  const setTableSelection = React.useCallback(
    (
      editor: ProductEditor,
      selection: Pick<
        typeof DEFAULT_SELECTION,
        'cols' | 'rows'
      > = selectionSimulationRef.current
    ) => {
      const paths = Array.from({ length: selection.rows }, (_, row) =>
        Array.from({ length: selection.cols }, (innerValue, col) => [
          0,
          row,
          col,
        ])
      ).flat();

      editor.update((tx) => {
        tx.selection.setNodes(paths, {
          anchor: [0, 0, 0],
          focus: [0, selection.rows - 1, selection.cols - 1],
        });
      });
    },
    []
  );

  const runMount = React.useCallback(async () => {
    const samples: number[] = [];

    for (let index = 0; index < WARMUP_RUNS + MEASURED_RUNS; index++) {
      await remount();

      if (index >= WARMUP_RUNS && initialRenderRef.current !== null) {
        samples.push(initialRenderRef.current);
      }
    }

    benchmarkResultRef.current = summarizeMount(samples);
  }, [remount]);

  const runInput = React.useCallback(async () => {
    const editor = editorRef.current;

    if (!editor) throw new Error('Table performance editor is unavailable');

    setCollapsedSelection(editor);
    await nextPaint();

    const samples: number[] = [];
    assertRenderedTable(editor, configRef.current);
    const initialText = editor.read.text.string([0, 0, 0]);
    let insertedText = '';

    for (let index = 0; index < WARMUP_RUNS + MEASURED_RUNS; index++) {
      const character = String.fromCharCode(97 + (index % 26));
      const startedAt = performance.now();
      editor.update.text.insert(character);
      await nextPaint();
      const elapsed = performance.now() - startedAt;
      assertRenderedTable(editor, configRef.current);
      insertedText += character;
      if (editor.read.text.string([0, 0, 0]) !== insertedText + initialText) {
        throw new Error('Table benchmark input did not reach the first cell');
      }

      if (index >= WARMUP_RUNS) {
        samples.push(elapsed);
      }
    }

    inputLatencyResultRef.current = summarizeLatency(samples);
  }, [setCollapsedSelection]);

  const runSelection = React.useCallback(async () => {
    const editor = editorRef.current;

    if (!editor) throw new Error('Table performance editor is unavailable');

    const samples: number[] = [];

    for (let index = 0; index < WARMUP_RUNS + MEASURED_RUNS; index++) {
      setCollapsedSelection(editor);
      await nextPaint();

      const startedAt = performance.now();
      setTableSelection(editor);
      await nextPaint();
      const elapsed = performance.now() - startedAt;
      const { root } = assertRenderedTable(editor, configRef.current);
      const expected =
        selectionSimulationRef.current.rows *
        selectionSimulationRef.current.cols;
      if (
        root.querySelectorAll('[data-table-cell-selected="true"]').length !==
        expected
      ) {
        throw new Error(
          `Table benchmark did not render its ${expected} selected cells`
        );
      }

      if (index >= WARMUP_RUNS) {
        samples.push(elapsed);
      }
    }

    selectionLatencyResultRef.current = {
      ...summarizeLatency(samples),
      selectedCells:
        selectionSimulationRef.current.rows *
        selectionSimulationRef.current.cols,
      simulatedDelayMs: selectionSimulationRef.current.delayMs,
    };
  }, [setCollapsedSelection, setTableSelection]);

  const runResize = React.useCallback(async () => {
    const editor = editorRef.current;

    if (!editor) throw new Error('Table performance editor is unavailable');

    const samples: number[] = [];
    let finalWidth = 100;

    for (let index = 0; index < WARMUP_RUNS + MEASURED_RUNS; index++) {
      finalWidth = index % 2 === 0 ? 104 : 100;
      const startedAt = performance.now();
      editor
        .plugin(TablePlugin)
        .update.setColumnWidth({ colIndex: 0, width: finalWidth }, { at: [0] });
      await nextPaint();
      const elapsed = performance.now() - startedAt;
      const { root, table } = assertRenderedTable(editor, configRef.current);
      const columns = root.querySelectorAll('col');
      const firstColumn = columns.item(
        columns.length === configRef.current.cols + 1 ? 1 : 0
      );
      if (
        table.columnWidths?.[0] !== finalWidth ||
        firstColumn?.style.width !== `${finalWidth}px`
      ) {
        throw new Error(
          'Table benchmark column width did not reach the model and DOM'
        );
      }

      if (index >= WARMUP_RUNS) {
        samples.push(elapsed);
      }
    }

    resizeLatencyResultRef.current = {
      ...summarizeLatency(samples),
      finalWidth,
    };
  }, []);

  const runBenchmark = React.useCallback(
    async (benchmark: TablePerfBenchmarkName) => {
      switch (benchmark) {
        case 'input': {
          await runInput();
          break;
        }
        case 'mount': {
          await runMount();
          break;
        }
        case 'resize': {
          await runResize();
          break;
        }
        case 'selection': {
          await runSelection();
          break;
        }
      }

      refreshSummary();

      return readSnapshot();
    },
    [readSnapshot, refreshSummary, runInput, runMount, runResize, runSelection]
  );

  React.useEffect(() => {
    const target = window as typeof window & {
      __tablePerfHarness?: TablePerfHarness;
    };

    target.__tablePerfHarness = {
      configure,
      readSnapshot,
      runBenchmark,
    };

    return () => {
      target.__tablePerfHarness = undefined;
    };
  }, [configure, readSnapshot, runBenchmark]);

  const onRender = React.useCallback<React.ProfilerOnRenderCallback>(
    (_id, phase, actualDuration) => {
      const metrics = metricsRef.current;
      metrics.lastRenderDuration = actualDuration;
      metrics.renderCount += 1;
      metrics.renderDurations.push(actualDuration);

      if (phase === 'mount') {
        metrics.initialRender = actualDuration;
        initialRenderRef.current = actualDuration;
      }
    },
    []
  );

  return (
    <main className="container mx-auto p-8" data-table-perf-ready="true">
      <h1 className="mb-2 text-2xl font-bold">Table performance</h1>
      <p className="mb-4 text-sm text-muted-foreground">
        {config.rows} × {config.cols} table; {selectionSimulation.rows} ×{' '}
        {selectionSimulation.cols} selection
      </p>
      <pre className="mb-4 overflow-auto rounded-md bg-muted p-3 text-xs">
        {JSON.stringify(summary, null, 2)}
      </pre>

      <div className="rounded-lg border" data-table-perf-editor="true">
        <React.Profiler key={editorKey} id="TableEditor" onRender={onRender}>
          <TablePerfEditor
            onEditor={(editor) => {
              editorRef.current = editor;
            }}
            table={createTable(config.rows, config.cols)}
          />
        </React.Profiler>
      </div>
    </main>
  );
}

function TablePerfEditor({
  onEditor,
  table,
}: {
  onEditor: (editor: ProductEditor) => void;
  table: TableElement;
}) {
  const initialValue: Value = [table];
  const editor = useCreateEditor({
    initialValue,
    plugins: [...BasicBlocksKit, ...DndKit, ...TableKit],
  });

  return (
    <Plate editor={editor}>
      <BindTablePerfEditor onEditor={onEditor} />
      <EditorContainer className="h-[500px] overflow-auto">
        <Editor className="p-4" variant="none" />
      </EditorContainer>
    </Plate>
  );
}

function BindTablePerfEditor({
  onEditor,
}: {
  onEditor: (editor: ProductEditor) => void;
}) {
  const editor = useEditor();

  React.useLayoutEffect(() => {
    onEditor(editor);
  }, [editor, onEditor]);

  return null;
}

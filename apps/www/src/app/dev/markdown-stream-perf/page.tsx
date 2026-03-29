'use client';

import Link from 'next/link';
import { Profiler, useImperativeHandle, useRef, useState } from 'react';
import type { ProfilerOnRenderCallback, RefObject } from 'react';

import { AIChatPlugin, streamInsertChunk } from '@platejs/ai/react';
import { getPluginType, KEYS } from 'platejs';
import { Plate, type PlateEditor, usePlateEditor } from 'platejs/react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EditorKit } from '@/registry/components/editor/editor-kit';
import { CopilotKit } from '@/registry/components/editor/plugins/copilot-kit';
import {
  DEFAULT_PLAYBACK_BURST_SIZE,
  liveMarkdownEditorsArticleChunks,
  playbackBurstSizeOptions,
} from '@/registry/lib/markdown-streaming-demo-data';
import { Editor, EditorContainer } from '@/registry/ui/editor';
import {
  buildStreamingPerfDataset,
  calculatePerfStats,
  type PerfStats,
} from './perf-helpers';

const BASELINE_DATASET = buildStreamingPerfDataset(
  liveMarkdownEditorsArticleChunks
);
const DEFAULT_BENCHMARK_ITERATIONS = 5;
const EMPTY_EDITOR_VALUE = [
  {
    children: [{ text: '' }],
    type: 'p',
  },
] as const;
const REMOUNT_SETTLE_MS = 40;
const WARMUP_RUNS = 2;

type BenchmarkResult = {
  applyChunkStats: PerfStats;
  burstSize: number;
  joinerStats: PerfStats;
  iterations: number;
  mountStats: PerfStats;
  renderCountStats: PerfStats;
  renderStats: PerfStats;
  streamRunStats: PerfStats;
  stepStats: PerfStats;
};

type EditorMetrics = {
  initialRender: number | null;
  lastRenderDuration: number | null;
  renderCount: number;
  renderDurations: number[];
};

function createEmptyEditorMetrics(): EditorMetrics {
  return {
    initialRender: null,
    lastRenderDuration: null,
    renderCount: 0,
    renderDurations: [],
  };
}

function cloneEditorValue() {
  return JSON.parse(JSON.stringify(EMPTY_EDITOR_VALUE));
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

function formatDuration(duration: number | null | undefined) {
  if (duration == null) return '—';

  return `${duration.toFixed(2)} ms`;
}

function snapshotEditorMetrics(metrics: EditorMetrics): EditorMetrics {
  return {
    initialRender: metrics.initialRender,
    lastRenderDuration: metrics.lastRenderDuration,
    renderCount: metrics.renderCount,
    renderDurations: [...metrics.renderDurations],
  };
}

function resetStreamingState(editor: PlateEditor) {
  editor.setOption(AIChatPlugin, 'streaming', false);
  editor.setOption(AIChatPlugin, '_blockChunks', '');
  editor.setOption(AIChatPlugin, '_blockPath', null);
  editor.setOption(AIChatPlugin, '_mdxName', null);

  if (editor.selection) {
    editor.tf.deselect();
  }

  editor.tf.setValue(cloneEditorValue());
}

function applyChunk(editor: PlateEditor, chunk: string) {
  streamInsertChunk(editor, chunk, {
    textProps: {
      [getPluginType(editor, KEYS.ai)]: true,
    },
  });
}

function StatRow({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  );
}

function StatsSection({ stats, title }: { stats: PerfStats; title: string }) {
  return (
    <section className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <div className="space-y-1 font-mono text-sm">
        <StatRow label="Samples" value={stats.count} />
        <StatRow label="Mean" value={formatDuration(stats.mean)} />
        <StatRow label="Median" value={formatDuration(stats.median)} />
        <StatRow label="P95" value={formatDuration(stats.p95)} />
        <StatRow label="P99" value={formatDuration(stats.p99)} />
        <StatRow
          label="Min / Max"
          value={`${stats.min.toFixed(2)} / ${stats.max.toFixed(2)} ms`}
        />
        <StatRow label="Std Dev" value={formatDuration(stats.stdDev)} />
      </div>
    </section>
  );
}

function MetricsPanel({
  benchmarkResult,
  editorMetrics,
}: {
  benchmarkResult: BenchmarkResult | null;
  editorMetrics: EditorMetrics;
}) {
  const liveRenderStats = calculatePerfStats(editorMetrics.renderDurations);

  return (
    <div className="space-y-4">
      <section className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="font-semibold text-slate-900">Baseline Dataset</h2>
        <div className="space-y-1 font-mono text-sm">
          <StatRow label="Raw chunks" value={BASELINE_DATASET.rawChunkCount} />
          <StatRow
            label="Joined chunks"
            value={BASELINE_DATASET.transformedChunkCount}
          />
          <StatRow
            label="Raw characters"
            value={BASELINE_DATASET.rawCharacterCount}
          />
          <StatRow
            label="Joined characters"
            value={BASELINE_DATASET.transformedCharacterCount}
          />
          <StatRow
            label="Delay-bearing chunks"
            value={BASELINE_DATASET.delayedChunkCount}
          />
        </div>
      </section>

      <section className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="font-semibold text-slate-900">Current Editor</h2>
        <div className="space-y-1 font-mono text-sm">
          <StatRow
            label="Mount render"
            value={formatDuration(editorMetrics.initialRender)}
          />
          <StatRow
            label="Last render"
            value={formatDuration(editorMetrics.lastRenderDuration)}
          />
          <StatRow label="Render count" value={editorMetrics.renderCount} />
          <StatRow
            label="Avg render"
            value={formatDuration(liveRenderStats.mean)}
          />
          <StatRow label="P95" value={formatDuration(liveRenderStats.p95)} />
        </div>
      </section>

      {benchmarkResult && (
        <>
          <section className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
            <h2 className="font-semibold text-slate-900">Run Config</h2>
            <div className="space-y-1 font-mono text-sm">
              <StatRow
                label="Measured runs"
                value={benchmarkResult.iterations}
              />
              <StatRow label="Warmup runs" value={WARMUP_RUNS} />
              <StatRow label="Burst size" value={benchmarkResult.burstSize} />
            </div>
          </section>

          <StatsSection
            stats={benchmarkResult.streamRunStats}
            title="End-to-End Stream"
          />
          <StatsSection
            stats={benchmarkResult.stepStats}
            title="Burst Step + Paint"
          />
          <StatsSection
            stats={benchmarkResult.applyChunkStats}
            title="streamInsertChunk Call"
          />
          <StatsSection stats={benchmarkResult.joinerStats} title="Joiner" />
          <StatsSection
            stats={benchmarkResult.renderStats}
            title="React Render Duration"
          />
          <StatsSection
            stats={benchmarkResult.renderCountStats}
            title="Render Count Per Run"
          />
          <StatsSection
            stats={benchmarkResult.mountStats}
            title="Mount Render"
          />
        </>
      )}
    </div>
  );
}

export default function MarkdownStreamPerfPage() {
  const [benchmarkBurstSize, setBenchmarkBurstSize] = useState(
    Math.max(DEFAULT_PLAYBACK_BURST_SIZE, 5)
  );
  const [benchmarkResult, setBenchmarkResult] =
    useState<BenchmarkResult | null>(null);
  const [editorKey, setEditorKey] = useState(0);
  const [editorMetrics, setEditorMetrics] = useState(createEmptyEditorMetrics);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRunningBenchmark, setIsRunningBenchmark] = useState(false);
  const [isStreamingOnce, setIsStreamingOnce] = useState(false);
  const [iterationCount, setIterationCount] = useState(
    DEFAULT_BENCHMARK_ITERATIONS
  );
  const plateEditorRef = useRef<PlateEditor | null>(null);
  const profilerDataRef = useRef(createEmptyEditorMetrics());

  const onRenderCallback: ProfilerOnRenderCallback = (
    _id,
    phase,
    actualDuration
  ) => {
    profilerDataRef.current.lastRenderDuration = actualDuration;
    profilerDataRef.current.renderCount += 1;
    profilerDataRef.current.renderDurations.push(actualDuration);

    if (phase === 'mount') {
      profilerDataRef.current.initialRender = actualDuration;
    }
  };

  async function remountEditor() {
    profilerDataRef.current = createEmptyEditorMetrics();
    setEditorMetrics(createEmptyEditorMetrics());
    setEditorKey((current) => current + 1);
    await waitForNextPaint();
    await wait(REMOUNT_SETTLE_MS);
  }

  async function runMeasuredStreamPass() {
    await remountEditor();

    const editor = plateEditorRef.current;

    if (!editor) {
      throw new Error('Plate editor did not mount in time.');
    }

    const joinerStart = performance.now();
    const dataset = buildStreamingPerfDataset(liveMarkdownEditorsArticleChunks);
    const joinerDuration = performance.now() - joinerStart;
    const applyChunkSamples: number[] = [];
    const stepSamples: number[] = [];

    resetStreamingState(editor);
    await waitForNextPaint();

    const streamStart = performance.now();

    for (
      let index = 0;
      index < dataset.transformedChunks.length;
      index += benchmarkBurstSize
    ) {
      const stepStart = performance.now();

      for (const item of dataset.transformedChunks.slice(
        index,
        index + benchmarkBurstSize
      )) {
        const applyStart = performance.now();
        applyChunk(editor, item.chunk);
        applyChunkSamples.push(performance.now() - applyStart);
      }

      await waitForNextPaint();
      stepSamples.push(performance.now() - stepStart);
    }

    const streamDuration = performance.now() - streamStart;
    const metrics = snapshotEditorMetrics(profilerDataRef.current);

    setEditorMetrics(metrics);

    return {
      applyChunkSamples,
      joinerDuration,
      metrics,
      stepSamples,
      streamDuration,
    };
  }

  async function handleStreamOnce() {
    setBenchmarkResult(null);
    setErrorMessage(null);
    setIsStreamingOnce(true);

    try {
      await runMeasuredStreamPass();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to run stream pass.'
      );
    } finally {
      setIsStreamingOnce(false);
    }
  }

  async function handleRunBenchmark() {
    setBenchmarkResult(null);
    setErrorMessage(null);
    setIsRunningBenchmark(true);

    const applyChunkSamples: number[] = [];
    const joinerSamples: number[] = [];
    const mountSamples: number[] = [];
    const renderCountSamples: number[] = [];
    const renderSamples: number[] = [];
    const stepSamples: number[] = [];
    const streamRunSamples: number[] = [];

    try {
      for (
        let runIndex = 0;
        runIndex < WARMUP_RUNS + iterationCount;
        runIndex += 1
      ) {
        const isWarmup = runIndex < WARMUP_RUNS;
        const result = await runMeasuredStreamPass();

        if (!isWarmup) {
          applyChunkSamples.push(...result.applyChunkSamples);
          joinerSamples.push(result.joinerDuration);
          renderCountSamples.push(result.metrics.renderCount);
          renderSamples.push(...result.metrics.renderDurations);
          stepSamples.push(...result.stepSamples);
          streamRunSamples.push(result.streamDuration);

          if (result.metrics.initialRender != null) {
            mountSamples.push(result.metrics.initialRender);
          }
        }

        await wait(50);
      }

      setBenchmarkResult({
        applyChunkStats: calculatePerfStats(applyChunkSamples),
        burstSize: benchmarkBurstSize,
        iterations: iterationCount,
        joinerStats: calculatePerfStats(joinerSamples),
        mountStats: calculatePerfStats(mountSamples),
        renderCountStats: calculatePerfStats(renderCountSamples),
        renderStats: calculatePerfStats(renderSamples),
        stepStats: calculatePerfStats(stepSamples),
        streamRunStats: calculatePerfStats(streamRunSamples),
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to run benchmark.'
      );
    } finally {
      setIsRunningBenchmark(false);
    }
  }

  return (
    <main className="container mx-auto space-y-6 p-8">
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-bold text-3xl text-slate-900">
            Markdown Stream Performance
          </h1>
          <p className="max-w-3xl text-slate-500">
            Fixed benchmark over the captured live markdown chunks. Each run
            measures raw chunks through the joiner, into `streamInsertChunk`,
            and waits for paint after every burst.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href="/dev">Back to Demo</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/dev/table-perf">Open Table Perf</Link>
          </Button>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-[1fr_220px_220px_auto]">
          <div className="space-y-2">
            <span className="block font-medium text-slate-700 text-sm">
              Benchmark notes
            </span>
            <div className="rounded-2xl border border-slate-200 border-dashed bg-slate-50 px-4 py-3 text-slate-500 text-sm">
              No artificial playback delay. Burst size controls how many joined
              chunks are applied before waiting for the next paint.
            </div>
          </div>

          <label
            className="space-y-2"
            htmlFor="markdown-stream-perf-iterations"
          >
            <span className="block font-medium text-slate-700 text-sm">
              Measured runs
            </span>
            <Input
              id="markdown-stream-perf-iterations"
              min={1}
              max={20}
              type="number"
              value={iterationCount}
              onChange={(event) =>
                setIterationCount(
                  Math.max(1, Math.min(20, Number(event.target.value) || 1))
                )
              }
            />
          </label>

          <label
            className="space-y-2"
            htmlFor="markdown-stream-perf-burst-size"
          >
            <span className="block font-medium text-slate-700 text-sm">
              Burst size
            </span>
            <select
              id="markdown-stream-perf-burst-size"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
              value={benchmarkBurstSize}
              onChange={(event) =>
                setBenchmarkBurstSize(Number(event.target.value))
              }
            >
              {playbackBurstSizeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-wrap items-end gap-2">
            <Button
              disabled={isRunningBenchmark || isStreamingOnce}
              variant="outline"
              onClick={handleStreamOnce}
            >
              {isStreamingOnce ? 'Streaming...' : 'Stream Once'}
            </Button>
            <Button
              disabled={isRunningBenchmark || isStreamingOnce}
              onClick={handleRunBenchmark}
            >
              {isRunningBenchmark
                ? 'Running...'
                : `Run Benchmark (${iterationCount} iter)`}
            </Button>
          </div>
        </div>

        {errorMessage && (
          <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
            {errorMessage}
          </p>
        )}
      </section>

      <section className="grid gap-6 xl:grid-cols-[340px_1fr]">
        <MetricsPanel
          benchmarkResult={benchmarkResult}
          editorMetrics={editorMetrics}
        />

        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <Profiler
            key={editorKey}
            id="MarkdownStreamPerfEditor"
            onRender={onRenderCallback}
          >
            <MarkdownStreamPerfEditor editorRef={plateEditorRef} />
          </Profiler>
        </div>
      </section>
    </main>
  );
}

function MarkdownStreamPerfEditor({
  editorRef,
}: {
  editorRef?: RefObject<PlateEditor | null>;
}) {
  const editor = usePlateEditor(
    {
      plugins: [...CopilotKit, ...EditorKit],
      value: cloneEditorValue(),
    },
    []
  );

  useImperativeHandle(editorRef, () => editor, [editor]);

  return (
    <Plate editor={editor}>
      <EditorContainer className="h-[760px] overflow-auto">
        <Editor variant="none" className="p-6" />
      </EditorContainer>
    </Plate>
  );
}

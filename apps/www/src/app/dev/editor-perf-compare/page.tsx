'use client';

import * as React from 'react';

import {
  BasicBlocksPlugin,
  BasicMarksPlugin,
  CodePlugin,
} from '@platejs/basic-nodes/react';
import type { Descendant, RenderElementProps, TElement, Value } from 'platejs';
import {
  ContentVisibilityChunk,
  Editable,
  Plate,
  PlateContent,
  Slate,
  createPlateEditor,
  withReact,
} from 'platejs/react';
import { createEditor } from 'slate';

type BenchmarkConfig = {
  blocks: number;
  chunkSize: number;
  chunking: boolean;
  scenarioWorkload: 'huge-code' | 'huge-mixed-block';
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

type RunnerControls = BenchmarkConfig & {
  visibility?: 'chunk' | 'element' | 'none';
};

type RunnerHarness = {
  configure: (controls: RunnerControls) => Promise<void>;
  runBenchmark: (benchmark: 'mount') => Promise<void>;
};

type ScenarioId =
  | 'slate'
  | 'plate-core'
  | 'plate-core-nodeid'
  | 'plate-basic'
  | 'plate-code-only';

type Scenario = {
  id: ScenarioId;
  kind: 'plate' | 'slate';
  label: string;
  nodeId: boolean;
  plugins: 'basic' | 'code-only' | 'none';
};

type ScenarioMetrics = {
  mount: BenchmarkResult | null;
};

type MountedSurface = {
  editor: any;
  scenarioId: ScenarioId;
  value: Value;
};

const SCENARIOS: Scenario[] = [
  {
    id: 'slate',
    kind: 'slate',
    label: 'Slate baseline',
    nodeId: false,
    plugins: 'none',
  },
  {
    id: 'plate-core',
    kind: 'plate',
    label: 'Plate core',
    nodeId: false,
    plugins: 'none',
  },
  {
    id: 'plate-core-nodeid',
    kind: 'plate',
    label: 'Plate core + nodeId',
    nodeId: true,
    plugins: 'none',
  },
  {
    id: 'plate-basic',
    kind: 'plate',
    label: 'Plate basic',
    nodeId: false,
    plugins: 'basic',
  },
  {
    id: 'plate-code-only',
    kind: 'plate',
    label: 'Plate code only',
    nodeId: false,
    plugins: 'code-only',
  },
];

function calculateStats(samples: number[]): BenchmarkResult {
  if (samples.length === 0) {
    return { max: 0, mean: 0, median: 0, min: 0, p95: 0, p99: 0, stdDev: 0 };
  }

  const sorted = [...samples].sort((a, b) => a - b);
  const n = sorted.length;
  const trimStart = Math.floor(n * 0.1);
  const trimEnd = Math.ceil(n * 0.9);
  const trimmed = sorted.slice(trimStart, trimEnd);
  const mean =
    trimmed.length > 0
      ? trimmed.reduce((sum, sample) => sum + sample, 0) / trimmed.length
      : 0;
  const variance =
    trimmed.length > 0
      ? trimmed.reduce((sum, sample) => sum + (sample - mean) ** 2, 0) /
        trimmed.length
      : 0;

  return {
    max: sorted[n - 1] ?? 0,
    mean,
    median: sorted[Math.floor(n / 2)] ?? 0,
    min: sorted[0] ?? 0,
    p95: sorted[Math.floor(n * 0.95)] ?? sorted[n - 1] ?? 0,
    p99: sorted[Math.floor(n * 0.99)] ?? sorted[n - 1] ?? 0,
    stdDev: Math.sqrt(variance),
  };
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function waitForNextPaint() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

function createMixedValue(blocks: number): Value {
  return Array.from({ length: blocks }, (_, index) => ({
    children: [
      {
        text:
          'Benchmark paragraph copy. This isolates mount cost instead of layout noise.',
      },
    ],
    type: index % 100 === 0 ? 'h1' : 'p',
  })) as Value;
}

function createCodeValue(blocks: number): Value {
  return Array.from({ length: blocks }, () => ({
    children: [
      {
        code: true,
        text: 'Code benchmark copy. This isolates the code-mark mount path.',
      },
    ],
    type: 'p',
  })) as Value;
}

function getScenarioPlugins(plugins: Scenario['plugins']) {
  if (plugins === 'basic') {
    return [BasicBlocksPlugin, BasicMarksPlugin];
  }

  if (plugins === 'code-only') {
    return [CodePlugin];
  }

  return [];
}

function getWorkloadValue(config: BenchmarkConfig) {
  if (config.scenarioWorkload === 'huge-code') {
    return createCodeValue(config.blocks);
  }

  return createMixedValue(config.blocks);
}

function Element({ attributes, children, element }: RenderElementProps) {
  switch ((element as TElement).type) {
    case 'h1':
      return <h1 {...attributes}>{children}</h1>;
    default:
      return <p {...attributes}>{children}</p>;
  }
}

function BenchmarkSurface({
  config,
  surface,
}: {
  config: BenchmarkConfig;
  surface: MountedSurface | null;
}) {
  const renderElement = React.useCallback((props: any) => <Element {...props} />, []);

  if (!surface) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        Surface mounts only while the benchmark is running.
      </div>
    );
  }

  if (surface.scenarioId === 'slate') {
    return (
      <Slate editor={surface.editor} initialValue={surface.value} onChange={() => {}}>
        <Editable
          renderChunk={config.chunking ? ContentVisibilityChunk : undefined}
          renderElement={renderElement}
          spellCheck={false}
        />
      </Slate>
    );
  }

  return (
    <Plate editor={surface.editor}>
      <PlateContent
        renderChunk={config.chunking ? ContentVisibilityChunk : undefined}
        spellCheck={false}
      />
    </Plate>
  );
}

export default function EditorPerfComparePage() {
  const [config, setConfig] = React.useState<BenchmarkConfig>({
    blocks: 10_000,
    chunkSize: 1000,
    chunking: true,
    scenarioWorkload: 'huge-mixed-block',
  });
  const [results, setResults] = React.useState<Record<ScenarioId, ScenarioMetrics>>(
    () =>
      Object.fromEntries(
        SCENARIOS.map((scenario) => [
          scenario.id,
          { mount: null } satisfies ScenarioMetrics,
        ])
      ) as Record<ScenarioId, ScenarioMetrics>
  );
  const [runningLabel, setRunningLabel] = React.useState<string | null>(null);
  const [surface, setSurface] = React.useState<MountedSurface | null>(null);
  const [surfaceVersion, setSurfaceVersion] = React.useState(0);
  const mountResolverRef = React.useRef<((duration: number) => void) | null>(
    null
  );
  const lastCompletedBenchmarkTokenRef = React.useRef(0);
  const [lastCompletedBenchmarkToken, setLastCompletedBenchmarkToken] =
    React.useState(0);

  const markBenchmarkComplete = React.useCallback(() => {
    lastCompletedBenchmarkTokenRef.current += 1;
    setLastCompletedBenchmarkToken(lastCompletedBenchmarkTokenRef.current);
  }, []);

  const mountScenario = React.useCallback(
    async (scenarioId: ScenarioId) => {
      const scenario = SCENARIOS.find((item) => item.id === scenarioId)!;
      const value = getWorkloadValue(config);

      setSurface(null);
      setSurfaceVersion((version) => version + 1);
      await waitForNextPaint();
      await wait(30);

      const editor =
        scenario.kind === 'slate'
          ? (() => {
              const e: any = withReact(createEditor());
              e.children = value;
              e.getChunkSize = (node: unknown) =>
                config.chunking && node === e ? config.chunkSize : null;

              return e;
            })()
          : createPlateEditor({
              chunking: config.chunking ? { chunkSize: config.chunkSize } : false,
              nodeId: scenario.nodeId,
              plugins: getScenarioPlugins(scenario.plugins),
              value,
            });

      const duration = await new Promise<number>((resolve) => {
        mountResolverRef.current = resolve;
        setSurface({ editor, scenarioId, value });
        setSurfaceVersion((version) => version + 1);
      });

      await wait(30);

      return duration;
    },
    [config]
  );

  const onRender = React.useCallback(
    (_id: string, phase: string, actualDuration: number) => {
      if (phase !== 'mount' || !mountResolverRef.current) return;

      const resolve = mountResolverRef.current;
      mountResolverRef.current = null;
      resolve(actualDuration);
    },
    []
  );

  const runMountBenchmark = React.useCallback(async () => {
    const WARMUP_RUNS = 3;
    const MEASURED_RUNS = 10;

    setRunningLabel('Running compare mount benchmark');

    try {
      for (const scenario of SCENARIOS) {
        const samples: number[] = [];

        for (let run = 0; run < WARMUP_RUNS + MEASURED_RUNS; run++) {
          const isWarmup = run < WARMUP_RUNS;
          const duration = await mountScenario(scenario.id);

          if (!isWarmup) {
            samples.push(duration);
          }

          await wait(40);
        }

        setResults((current) => ({
          ...current,
          [scenario.id]: {
            mount: calculateStats(samples),
          },
        }));
      }
    } finally {
      setRunningLabel(null);
      setSurface(null);
    }

    markBenchmarkComplete();
  }, [markBenchmarkComplete, mountScenario]);

  React.useEffect(() => {
    const harness: RunnerHarness = {
      async configure(controls) {
        setSurface(null);
        setSurfaceVersion((version) => version + 1);
        setConfig({
          blocks: controls.blocks,
          chunkSize: controls.chunkSize,
          chunking: controls.chunking,
          scenarioWorkload: controls.scenarioWorkload,
        });
        await waitForNextPaint();
        await wait(30);
      },
      async runBenchmark(benchmark) {
        if (benchmark !== 'mount') {
          throw new Error(`Unsupported benchmark: ${benchmark}`);
        }

        await runMountBenchmark();
      },
    };

    (window as typeof window & { __editorPerfHarness?: RunnerHarness }).__editorPerfHarness =
      harness;

    return () => {
      delete (window as typeof window & { __editorPerfHarness?: RunnerHarness })
        .__editorPerfHarness;
    };
  }, [runMountBenchmark]);

  const exportData = React.useMemo(
    () => ({
      config,
      lastCompletedRun: {
        benchmark: 'mount',
        token: lastCompletedBenchmarkToken,
      },
      results,
      runs: {
        mount: 10,
      },
      scenarios: SCENARIOS,
    }),
    [config, lastCompletedBenchmarkToken, results]
  );

  return (
    <main className="p-6">
      <div className="mx-auto max-w-6xl space-y-4">
        <div className="rounded-xl border bg-background p-4">
          <h1 className="font-semibold text-xl">Editor Perf Compare</h1>
          <p className="mt-2 text-muted-foreground text-sm">
            Temporary 10k benchmark harness for cross-repo Plate comparison.
          </p>
          {runningLabel ? (
            <p className="mt-3 text-muted-foreground text-sm">{runningLabel}</p>
          ) : null}
        </div>

        <div className="rounded-xl border bg-background">
          <React.Profiler
            id={surface?.scenarioId ?? 'idle'}
            key={`${surface?.scenarioId ?? 'idle'}:${surfaceVersion}`}
            onRender={onRender}
          >
            <BenchmarkSurface config={config} surface={surface} />
          </React.Profiler>
        </div>

        <pre
          data-testid="editor-perf-json"
          className="overflow-auto rounded-md border bg-muted/30 p-4 text-xs"
        >
          {JSON.stringify(exportData, null, 2)}
        </pre>
      </div>
    </main>
  );
}

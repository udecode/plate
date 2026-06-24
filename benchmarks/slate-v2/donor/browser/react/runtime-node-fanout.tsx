import { mkdir, writeFile } from 'node:fs/promises';

import React, { act } from 'react';
import type { Descendant } from '../../../../../packages/slate/src/index.ts';
import {
  createReactEditor,
  Editable,
  Slate,
} from '../../../../../packages/slate-react/src/index.ts';
import { createSlateReactRenderCounter } from '../../../../../packages/slate-react/src/render-profiler.ts';
import {
  mountApp,
  round,
  summarizeMetrics,
} from '../../shared/react-benchmark.tsx';

void React;

type ScenarioId = 'appendRoot' | 'fullReplace' | 'prependRoot';

const blockCount = Number(process.env.REACT_FANOUT_BLOCKS || 1001);
const iterations = Number(process.env.REACT_FANOUT_ITERATIONS || 5);
const outputPath =
  process.env.REACT_FANOUT_OUTPUT ||
  'tmp/slate-react-runtime-node-fanout-benchmark.json';

const createValue = (count: number): Descendant[] =>
  Array.from({ length: count }, (_value, index) => ({
    type: 'block',
    children: [{ text: `line ${index}` }],
  }));

const getCount = (byKey: Record<string, number>, key: string) =>
  byKey[key] ?? 0;

const runScenario = async (scenario: ScenarioId, iteration: number) => {
  const editor = createReactEditor({ initialValue: createValue(blockCount) });
  const counter = createSlateReactRenderCounter();
  const previousProfiler = globalThis.__SLATE_REACT_RENDER_PROFILER__;
  let mounted: Awaited<ReturnType<typeof mountApp>> | null = null;

  globalThis.__SLATE_REACT_RENDER_PROFILER__ = counter.profiler;

  try {
    mounted = await mountApp(
      <Slate editor={editor}>
        <Editable data-testid={`runtime-node-fanout-${scenario}`} />
      </Slate>
    );

    counter.reset();
    const startedAt = performance.now();

    await act(async () => {
      editor.update((tx) => {
        if (scenario === 'appendRoot') {
          tx.nodes.insert(
            {
              type: 'block',
              children: [{ text: `append ${iteration}` }],
            } as never,
            { at: [blockCount] }
          );

          return;
        }

        if (scenario === 'prependRoot') {
          tx.nodes.insert(
            {
              type: 'block',
              children: [{ text: `prepend ${iteration}` }],
            } as never,
            { at: [0] }
          );

          return;
        }

        tx.value.replace({
          children: [
            {
              type: 'block',
              children: [{ text: `replacement ${iteration}` }],
            },
          ],
          selection: {
            anchor: { path: [0, 0], offset: 13 },
            focus: { path: [0, 0], offset: 13 },
          },
        });
      });
    });

    const elapsedMs = performance.now() - startedAt;
    const profile = counter.snapshot();

    return {
      elapsedMs: round(elapsedMs),
      fullReplaceAllowedFanout: scenario === 'fullReplace' ? 1 : 0,
      renderTotal: profile.total,
      rootRuntimeIdsNotify: getCount(
        profile.byKey,
        'selector:selector-root-runtime-ids-notify'
      ),
      runtimeNodeCheck: getCount(
        profile.byKey,
        'selector:selector-runtime-node-check'
      ),
      runtimeNodeNotify: getCount(
        profile.byKey,
        'selector:selector-runtime-node-notify'
      ),
      scenario,
    };
  } finally {
    await mounted?.dispose();
    globalThis.__SLATE_REACT_RENDER_PROFILER__ = previousProfiler;
  }
};

type ScenarioSample = Awaited<ReturnType<typeof runScenario>>;

const samples: ScenarioSample[] = [];

for (const scenario of ['appendRoot', 'prependRoot', 'fullReplace'] as const) {
  for (let iteration = 0; iteration < iterations; iteration += 1) {
    samples.push(await runScenario(scenario, iteration));
  }
}

const byScenario = Object.fromEntries(
  (['appendRoot', 'prependRoot', 'fullReplace'] as const).map((scenario) => [
    scenario,
    summarizeMetrics(
      samples
        .filter((sample) => sample.scenario === scenario)
        .map(
          ({
            elapsedMs,
            renderTotal,
            rootRuntimeIdsNotify,
            runtimeNodeCheck,
            runtimeNodeNotify,
          }) => ({
            elapsedMs,
            renderTotal,
            rootRuntimeIdsNotify,
            runtimeNodeCheck,
            runtimeNodeNotify,
          })
        )
    ),
  ])
);

const localRootOrderFanoutCount = Math.max(
  ...samples
    .filter((sample) => sample.scenario !== 'fullReplace')
    .map((sample) => sample.runtimeNodeCheck)
);
const fullReplaceFanoutCount = Math.max(
  ...samples
    .filter((sample) => sample.scenario === 'fullReplace')
    .map((sample) => sample.runtimeNodeCheck)
);
const fanoutViolationCount = Math.max(
  localRootOrderFanoutCount,
  fullReplaceFanoutCount - 1
);
const maxRuntimeNodeNotify = Math.max(
  ...samples.map((sample) => sample.runtimeNodeNotify)
);
const maxRenderTotal = Math.max(...samples.map((sample) => sample.renderTotal));
const maxElapsedMs = Math.max(...samples.map((sample) => sample.elapsedMs));

const result = {
  blockCount,
  byScenario,
  iterations,
  metrics: {
    fanoutViolationCount,
    fullReplaceFanoutCount,
    localRootOrderFanoutCount,
    maxElapsedMs: round(maxElapsedMs),
    maxRenderTotal,
    maxRuntimeNodeNotify,
  },
  samples,
};

await mkdir(outputPath.split('/').slice(0, -1).join('/') || '.', {
  recursive: true,
});
await writeFile(`${outputPath}`, `${JSON.stringify(result, null, 2)}\n`);

console.log(
  `runtime-node fanout: local=${localRootOrderFanoutCount} fullReplace=${fullReplaceFanoutCount} violation=${fanoutViolationCount} samples=${samples.length}`
);
console.log(
  `METRIC slate_react_runtime_node_fanout_count=${fanoutViolationCount}`
);
console.log(
  `METRIC slate_react_runtime_node_local_root_order_fanout_count=${localRootOrderFanoutCount}`
);
console.log(
  `METRIC slate_react_runtime_node_full_replace_fanout_count=${fullReplaceFanoutCount}`
);
console.log(
  `METRIC slate_react_runtime_node_notify_count=${maxRuntimeNodeNotify}`
);
console.log(`METRIC slate_react_runtime_node_render_count=${maxRenderTotal}`);
console.log(
  `METRIC slate_react_runtime_node_max_elapsed_ms=${round(maxElapsedMs)}`
);
console.log(`wrote ${outputPath}`);

import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

import React, { act } from 'react';
import type { Descendant, NodeKey } from '../../../../../packages/plitejs/src/index.ts';
import {
  createEditor,
  Editable,
  Plite,
} from '../../../../../packages/plitejs/src/react/index.ts';
import { createPliteReactRenderCounter } from '../../../../../packages/plitejs/src/react/render-profiler.ts';
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
  const editor = createEditor({ initialValue: createValue(blockCount) });
  const counter = createPliteReactRenderCounter();
  const previousProfiler = globalThis.__PLITE_REACT_RENDER_PROFILER__;
  let mounted: Awaited<ReturnType<typeof mountApp>> | null = null;

  globalThis.__PLITE_REACT_RENDER_PROFILER__ = counter.profiler;

  try {
    mounted = await mountApp(
      <Plite editor={editor}>
        <Editable data-testid={`runtime-node-fanout-${scenario}`} />
      </Plite>
    );

    counter.reset();
    const before = editor.read.runtime.snapshot();
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
            kind: 'text',
          },
        });
      });
    });

    const elapsedMs = performance.now() - startedAt;
    const profile = counter.snapshot();
    const after = editor.read.runtime.snapshot();
    const runtimeNodeChecks = profile.events
      .filter((event) => event.id === 'selector-runtime-node-check')
      .map(({ nodeKey }) => ({
        nodeKey,
        beforePath: nodeKey ? before.index.pathOf(nodeKey as NodeKey) : null,
        afterPath: nodeKey ? after.index.pathOf(nodeKey as NodeKey) : null,
      }));
    if (scenario === 'prependRoot') {
      assert.equal(after.children[1], before.children[0]);
    }
    const unrelatedRuntimeNodeChecks = runtimeNodeChecks.filter(({ beforePath, afterPath }) => {
      if (scenario === 'appendRoot') return true;
      return beforePath?.length !== 1 || beforePath[0] !== 0 ||
        afterPath?.length !== 1 || afterPath[0] !== (scenario === 'prependRoot' ? 1 : 0);
    }).length;

    return {
      elapsedMs: round(elapsedMs),
      runtimeNodeChecks,
      unrelatedRuntimeNodeChecks,
      allowedBoundaryChecks: scenario === 'appendRoot' ? 0 : 1,
      fullReplaceAllowedFanout: scenario === 'fullReplace' ? 1 : 0,
      renderTotal: profile.total,
      rootRuntimeIdsNotify: getCount(
        profile.byKey,
        'selector:selector-root-node-keys-notify'
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
    globalThis.__PLITE_REACT_RENDER_PROFILER__ = previousProfiler;
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
const fanoutViolationCount = Math.max(...samples.map((sample) =>
  Math.max(sample.unrelatedRuntimeNodeChecks, sample.runtimeNodeCheck - sample.allowedBoundaryChecks)
));
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
  `METRIC plite_react_runtime_node_fanout_count=${fanoutViolationCount}`
);
console.log(
  `METRIC plite_react_runtime_node_local_root_order_fanout_count=${localRootOrderFanoutCount}`
);
console.log(
  `METRIC plite_react_runtime_node_full_replace_fanout_count=${fullReplaceFanoutCount}`
);
console.log(
  `METRIC plite_react_runtime_node_notify_count=${maxRuntimeNodeNotify}`
);
console.log(`METRIC plite_react_runtime_node_render_count=${maxRenderTotal}`);
console.log(
  `METRIC plite_react_runtime_node_max_elapsed_ms=${round(maxElapsedMs)}`
);
console.log(`wrote ${outputPath}`);
assert.equal(fanoutViolationCount, 0, 'Root-order changes must not inspect unrelated runtime nodes');

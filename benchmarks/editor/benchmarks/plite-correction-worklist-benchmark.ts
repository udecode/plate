import { writeFileSync } from 'node:fs';

import {
  createEditor,
  defineExtension,
  ElementApi,
} from '../../../packages/plitejs/src/index';
import { getDefined } from '../../getDefined';

const iterationsArgument = process.argv.find((argument) =>
  argument.startsWith('--iterations=')
);
const iterations = iterationsArgument
  ? Number(iterationsArgument.slice('--iterations='.length))
  : 20;
const outputArgument = process.argv.find((argument) =>
  argument.startsWith('--output=')
);

if (!Number.isInteger(iterations) || iterations < 1) {
  throw new Error('--iterations must be a positive integer.');
}

const percentile = (values: readonly number[], ratio: number) =>
  values[Math.min(values.length - 1, Math.ceil(values.length * ratio) - 1)];

const cohorts = [
  { blocks: 100, name: 'normal' },
  { blocks: 1000, name: 'medium' },
  { blocks: 10_000, name: 'large' },
  { blocks: 50_000, name: 'stress' },
] as const;

const rows = cohorts.map(({ blocks, name }) => {
  let childrenVisits = 0;
  let contentVisits = 0;
  let propertyVisits = 0;
  const target = Math.floor(blocks / 2);
  const editor = createEditor({
    initialValue: Array.from({ length: blocks }, (_value, index) => ({
      type: 'paragraph',
      children: [{ text: `line ${index}` }],
    })),
  });

  editor.install(
    defineExtension(`correction-worklist-benchmark-${name}`, {
      corrections: [
        {
          event: 'properties',
          query: { type: 'paragraph' },
          correct({ entry: [node] }) {
            if (ElementApi.isElement(node)) propertyVisits += 1;
          },
        },
        {
          event: 'content',
          query: { type: 'paragraph' },
          correct({ entry: [node] }) {
            if (ElementApi.isElement(node)) contentVisits += 1;
          },
        },
        {
          event: 'children',
          query: { type: 'paragraph' },
          correct({ entry: [node] }) {
            if (ElementApi.isElement(node)) childrenVisits += 1;
          },
        },
      ],
    })
  );

  editor.update.nodes.set({ benchmarkProbe: -1 }, { at: [target] });
  childrenVisits = 0;
  contentVisits = 0;
  propertyVisits = 0;

  const heapBefore = process.memoryUsage().heapUsed;
  const samples: number[] = [];

  for (let iteration = 0; iteration < iterations; iteration += 1) {
    const before = performance.now();

    editor.update.nodes.set({ benchmarkProbe: iteration }, { at: [target] });
    samples.push(performance.now() - before);
  }

  if (
    propertyVisits !== iterations ||
    contentVisits !== iterations ||
    childrenVisits !== 0
  ) {
    throw new Error(
      `${name}: expected ${iterations} property/content visits and zero children visits, received ${propertyVisits}/${contentVisits}/${childrenVisits}.`
    );
  }

  samples.sort((left, right) => left - right);

  return {
    blocks,
    childrenVisits,
    contentVisits,
    heapDeltaBytes: process.memoryUsage().heapUsed - heapBefore,
    iterations,
    name,
    p50Ms: percentile(samples, 0.5),
    p95Ms: percentile(samples, 0.95),
    p99Ms: percentile(samples, 0.99),
    propertyVisits,
    repeatedUnit: 'matching correction target',
    target,
  };
});

const maximumTouchedTargets = Math.max(
  ...rows.map(
    ({
      childrenVisits,
      contentVisits,
      iterations: innerIterations,
      propertyVisits,
    }) => (childrenVisits + contentVisits + propertyVisits) / innerIterations
  )
);
const sizeRatio =
  getDefined(rows.at(-1)).p50Ms / Math.max(rows[0].p50Ms, 0.000001);

const output = `${JSON.stringify(
  {
    benchmark: 'plite-correction-worklist',
    generatedAt: new Date().toISOString(),
    maximumTouchedTargets,
    rows,
    sizeRatio,
    thresholdPolicy: {
      maximumTouchedTargets: 2,
      timingScope:
        'Whole editor publication is recorded but not gated because immutable plain-JSON root reconstruction scales with root width.',
    },
    version: 1,
  },
  null,
  2
)}\n`;

if (outputArgument) {
  writeFileSync(outputArgument.slice('--output='.length), output);
} else {
  process.stdout.write(output);
}

process.stdout.write(
  `METRIC plite_correction_worklist_max_touched_targets=${maximumTouchedTargets}\n`
);
process.stdout.write(
  `METRIC plite_correction_worklist_size_ratio=${sizeRatio}\n`
);

if (
  process.env.PLITE_CORRECTION_WORKLIST_STRICT === '1' &&
  maximumTouchedTargets > 2
) {
  throw new Error(
    `Correction worklist touched ${maximumTouchedTargets} targets per property write.`
  );
}

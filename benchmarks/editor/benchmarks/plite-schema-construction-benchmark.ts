import {
  createEditor,
  defineEditorExtension,
  ElementApi,
} from '../../../packages/plite/src/index';
import { writeBenchmarkArtifact } from './benchmark-artifact';

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
  values[Math.min(values.length - 1, Math.ceil(values.length * ratio) - 1)]!;

const schema = defineEditorExtension({
  elements: [
    {
      content: { allowed: 'text', default: 'text', min: 1 },
      create: () => ({ type: 'paragraph', children: [{ text: '' }] }),
      groups: ['block'],
      type: 'paragraph',
    },
    {
      content: {
        allowed: { group: 'block' },
        default: { type: 'paragraph' },
        min: 1,
      },
      create: () => ({ type: 'section', children: [] }),
      groups: ['block'],
      type: 'section',
    },
  ],
  name: 'schema-construction-benchmark',
  roots: {
    main: {
      allowed: { group: 'block' },
      default: { type: 'paragraph' },
      min: 1,
    },
  },
  textProperties: [{ key: 'bold', kind: 'boolean' }],
});

const cohorts = [100, 1000, 10_000, 50_000] as const;
const rows = cohorts.map((blocks) => {
  const target = Math.floor(blocks / 2);
  const editor = createEditor({
    extensions: [schema],
    initialValue: [
      {
        type: 'section',
        children: Array.from({ length: blocks }, (_value, index) => ({
          type: 'paragraph',
          children: [{ bold: true, text: `line ${index}` }],
        })),
      },
    ],
  });
  const sectionBefore = editor.read.children()[0];

  if (!ElementApi.isElement(sectionBefore)) {
    throw new Error('Benchmark section is missing.');
  }

  const first = sectionBefore.children[0];
  const last = sectionBefore.children.at(-1);
  const samples: number[] = [];
  let maximumChangedSpan = 0;

  for (let iteration = 0; iteration < iterations; iteration++) {
    const before = performance.now();

    editor.update((tx) => {
      tx.nodes.insert(
        { bold: true, text: 'x' },
        { at: { offset: 0, path: [0, target, 0] } }
      );
    });
    samples.push(performance.now() - before);
    editor.read
      .lastCommit()
      ?.changes.iterChangedRanges(
        (_root, _fromBefore, _toBefore, fromAfter, toAfter) => {
          maximumChangedSpan = Math.max(
            maximumChangedSpan,
            toAfter - fromAfter
          );
        }
      );
  }

  const sectionAfter = editor.read.children()[0];

  if (!ElementApi.isElement(sectionAfter)) {
    throw new Error('Benchmark section disappeared.');
  }
  if (
    sectionAfter.children[0] !== first ||
    sectionAfter.children.at(-1) !== last
  ) {
    throw new Error(`${blocks}: sparse edit recreated an untouched boundary.`);
  }
  if (maximumChangedSpan >= 64) {
    throw new Error(
      `${blocks}: sparse edit widened to ${maximumChangedSpan} tokens.`
    );
  }

  samples.sort((left, right) => left - right);

  return {
    blocks,
    boundaryIdentityPreserved: true,
    iterations,
    maximumChangedSpan,
    p50Ms: percentile(samples, 0.5),
    p95Ms: percentile(samples, 0.95),
    target,
  };
});
const sizeRatio = rows.at(-1)!.p50Ms / Math.max(rows[0].p50Ms, 0.001);
const strict = process.env.PLITE_SCHEMA_CONSTRUCTION_STRICT === '1';
const maximumChangedSpan = Math.max(
  ...rows.map((row) => row.maximumChangedSpan)
);
const boundaryIdentityPreserved = rows.every(
  (row) => row.boundaryIdentityPreserved
);

if (strict && (maximumChangedSpan >= 64 || !boundaryIdentityPreserved)) {
  throw new Error(
    `Sparse schema construction widened to ${maximumChangedSpan} tokens or replaced an untouched boundary.`
  );
}

const result = {
  benchmark: 'plite-schema-construction',
  boundaryIdentityPreserved,
  generatedAt: new Date().toISOString(),
  maximumChangedSpan,
  rows,
  sizeRatio,
  thresholdPolicy: {
    boundaryIdentityRequired: true,
    maximumChangedSpanExclusive: 64,
    timingScope:
      'Whole editor publication is recorded but not gated because immutable plain-JSON ancestor reconstruction scales with ancestor width.',
  },
  version: 1,
};
const output = `${JSON.stringify(result, null, 2)}\n`;

process.stdout.write(
  `METRIC plite_schema_construction_size_ratio=${sizeRatio}\n`
);
process.stdout.write(
  `METRIC plite_schema_construction_max_changed_span=${maximumChangedSpan}\n`
);
process.stdout.write(
  `METRIC plite_schema_construction_boundary_identity_preserved=${boundaryIdentityPreserved ? 1 : 0}\n`
);

if (outputArgument) {
  writeBenchmarkArtifact(outputArgument.slice('--output='.length), output);
} else {
  process.stdout.write(output);
}

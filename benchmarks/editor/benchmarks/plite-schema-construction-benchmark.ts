import {
  createEditor,
  defineExtension,
  ElementApi,
  property,
  schema,
  target,
} from '../../../packages/plite/src/index';
import { getCompiledEditorSchema } from '../../../packages/plite/src/internal/index';
import { getDefined } from '../../getDefined';
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
  values[Math.min(values.length - 1, Math.ceil(values.length * ratio) - 1)];

const schemaExtension = defineExtension('schema-construction-benchmark', {
  schema: {
    elements: {
      paragraph: {
        content: schema.content.text({ default: 'text', min: 1 }),
      },
      section: {
        content: schema.content.group('block', {
          default: { type: 'paragraph' },
          min: 1,
        }),
      },
    },
    id: 'schema-construction-benchmark',
    properties: [
      schema.textProperty('bold', property.boolean(), {
        target: target.group('block'),
      }),
    ],
    root: schema.content.group('block', {
      default: { type: 'paragraph' },
      min: 1,
    }),
    unknown: 'reject',
    version: 1,
  },
});

const sentinelEditor = createEditor({ extensions: [schemaExtension] });
const sentinelSchema = getCompiledEditorSchema(sentinelEditor);

if (
  sentinelSchema?.identity.id !== 'schema-construction-benchmark' ||
  !sentinelSchema.elements.byType.has('paragraph') ||
  !sentinelSchema.elements.byType.has('section') ||
  sentinelSchema.properties.byId.size !== 1
) {
  throw new Error(
    'Schema construction benchmark must install its canonical compiled schema before timing.'
  );
}

const cohorts = [100, 1000, 10_000, 50_000] as const;
const rows = cohorts.map((blocks) => {
  const innerTarget = Math.floor(blocks / 2);
  const editor = createEditor({
    extensions: [schemaExtension],
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
        { at: { offset: 0, path: [0, innerTarget, 0] } }
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
    target: innerTarget,
  };
});
const sizeRatio =
  getDefined(rows.at(-1)).p50Ms / Math.max(rows[0].p50Ms, 0.001);
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
  compiledSchema: {
    active: true,
    elementTypes: sentinelSchema.elements.byType.size,
    id: sentinelSchema.identity.id,
    properties: sentinelSchema.properties.byId.size,
  },
  generatedAt: new Date().toISOString(),
  immutablePublicationDiagnostic: {
    label: 'immutable-publication diagnostic',
    rows,
    sizeRatio,
    scope:
      'Sparse text insertion publishes immutable ancestor arrays. These timings expose DocumentChange publication width and are not schema-construction latency.',
  },
  maximumChangedSpan,
  thresholdPolicy: {
    boundaryIdentityRequired: true,
    maximumChangedSpanExclusive: 64,
    timingScope:
      'Whole editor publication is recorded but not gated because immutable plain-JSON ancestor reconstruction scales with ancestor width.',
  },
  version: 2,
};
const output = `${JSON.stringify(result, null, 2)}\n`;

process.stdout.write(
  `METRIC plite_schema_construction_immutable_publication_diagnostic_ratio=${sizeRatio}\n`
);
process.stdout.write(
  `METRIC plite_schema_construction_max_changed_span=${maximumChangedSpan}\n`
);
process.stdout.write(
  `METRIC plite_schema_construction_boundary_identity_preserved=${boundaryIdentityPreserved ? 1 : 0}\n`
);
process.stdout.write(
  'METRIC plite_schema_construction_compiled_schema_active=1\n'
);

if (outputArgument) {
  writeBenchmarkArtifact(outputArgument.slice('--output='.length), output);
} else {
  process.stdout.write(output);
}

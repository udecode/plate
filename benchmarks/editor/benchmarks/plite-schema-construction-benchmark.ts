import { createEditorSchemaContract } from '../../../packages/plitejs/src/core/schema-compiler';
import {
  ContentSlice,
  createEditor,
  defineEditorSchema,
  definePlugin,
  ElementApi,
  property,
  schema,
  target,
} from '../../../packages/plitejs/src/index';
import { getCompiledEditorSchema } from '../../../packages/plitejs/src/internal/index';
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
const propertyOnly = process.argv.includes('--property-only');
const strict = process.env.PLITE_SCHEMA_CONSTRUCTION_STRICT === '1';

if (!Number.isInteger(iterations) || iterations < 1) {
  throw new Error('--iterations must be a positive integer.');
}
if (strict && propertyOnly) {
  throw new Error('--property-only cannot satisfy the strict target.');
}

const percentile = (values: readonly number[], ratio: number) =>
  values[Math.min(values.length - 1, Math.ceil(values.length * ratio) - 1)];
const warmups = 3;
const prefixP95OverheadFloorMs = 2;
const prefixP95OverheadFraction = 0.25;

const changedSpan = (
  commit: {
    changes: {
      empty: boolean;
      iterChangedRanges: (
        visit: (
          root: string | null,
          fromBefore: number,
          toBefore: number,
          fromAfter: number,
          toAfter: number
        ) => void
      ) => void;
    };
  } | null
) => {
  if (!commit || commit.changes.empty) {
    throw new Error('Measured property edit did not publish a change.');
  }

  let maximum = 0;
  let ranges = 0;

  commit.changes.iterChangedRanges(
    (_root, _fromBefore, _toBefore, fromAfter, toAfter) => {
      maximum = Math.max(maximum, toAfter - fromAfter);
      ranges += 1;
    }
  );

  if (ranges === 0) {
    throw new Error('Measured property edit has no changed range.');
  }

  return { maximum, ranges };
};

const schemaPlugin = definePlugin('schema-construction-benchmark', {
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

const sentinelEditor = createEditor({ plugins: [schemaPlugin] });
const sentinelSchema = getCompiledEditorSchema(sentinelEditor);

if (
  sentinelSchema?.identity.kind !== 'named' ||
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
    plugins: [schemaPlugin],
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
const prefixRows = ([1, 2] as const).flatMap((prefixLength) => {
  const elements = {
    heading: {
      content: schema.content.text({ default: 'text', min: 1 }),
      properties: {
        level: property.number({ required: true }),
        note: property.string(),
      },
    },
    paragraph: {
      content: schema.content.text({ default: 'text', min: 1 }),
    },
    cell: {
      content: schema.content.text({ default: 'text', min: 1 }),
    },
    table: {
      content: schema.content.type('cell', { min: 1 }),
    },
  };
  const rest = schema.content.group('block', {
    default: { type: 'paragraph' },
    min: 1,
  });
  const PrefixSchema = defineEditorSchema(
    `schema:construction-prefix-${prefixLength}`,
    {
      elements,
      root: schema.content.prefix(
        prefixLength === 1
          ? [{ element: 'heading', properties: { level: 1 } }]
          : [
              { element: 'heading', properties: { level: 1 } },
              { element: 'paragraph' },
            ],
        rest
      ),
      unknown: 'reject',
    }
  );
  const PlainSchema = defineEditorSchema(
    `schema:construction-plain-${prefixLength}`,
    {
      elements,
      root: schema.content.group('block', {
        default: { type: 'paragraph' },
        min: 1,
      }),
      unknown: 'reject',
    }
  );

  return cohorts.map((blocks) => {
    const initialValue = [
      { children: [{ text: 'Title' }], level: 1, type: 'heading' },
      ...(prefixLength === 2
        ? [{ children: [{ text: 'Body' }], type: 'paragraph' }]
        : []),
      ...Array.from({ length: blocks }, (_value, index) => ({
        children: [{ text: `line ${index}` }],
        type: 'paragraph',
      })),
    ];
    const startupStart = performance.now();
    const editor = createEditor({ plugins: [PrefixSchema], initialValue });
    const startupMs = performance.now() - startupStart;
    const prefixPropertyEditor = createEditor({
      plugins: [PrefixSchema],
      initialValue,
    });
    const plainEditor = createEditor({ plugins: [PlainSchema], initialValue });
    const compiled = getCompiledEditorSchema(editor);

    if (!compiled || !getCompiledEditorSchema(plainEditor)) {
      throw new Error('Matched benchmark schemas are missing.');
    }

    const contractBytes = Buffer.byteLength(
      JSON.stringify(createEditorSchemaContract(compiled))
    );
    const prefixSamplesMs: number[] = [];
    const plainSamplesMs: number[] = [];
    const pairedDeltaSamplesMs: number[] = [];
    let prefixPropertyMaximumChangedSpan = 0;
    let plainPropertyMaximumChangedSpan = 0;
    let prefixPropertyMaximumChangedRanges = 0;
    let plainPropertyMaximumChangedRanges = 0;
    const firstBody = prefixPropertyEditor.read.children()[prefixLength];
    const lastBody = prefixPropertyEditor.read.children().at(-1);
    const plainFirstBody = plainEditor.read.children()[prefixLength];
    const plainLastBody = plainEditor.read.children().at(-1);
    const measureProperty = (
      measuredEditor: typeof editor,
      samples: number[],
      prefix: boolean,
      iteration: number
    ) => {
      Bun.gc(true);
      const note = iteration % 2 === 0 ? 'even' : 'odd';
      const start = performance.now();

      measuredEditor.update((tx) => tx.nodes.set({ note }, { at: [0] }));

      const duration = performance.now() - start;
      const change = changedSpan(measuredEditor.read.lastCommit());
      const heading = measuredEditor.read.children()[0];

      if (
        !ElementApi.isElement(heading) ||
        heading.type !== 'heading' ||
        heading.note !== note
      ) {
        throw new Error('Measured heading property edit was not retained.');
      }
      if (change.maximum >= 64) {
        throw new Error(
          `${blocks}: ${prefix ? 'prefix' : 'plain'} property edit widened to ${
            change.maximum
          } tokens.`
        );
      }
      if (prefix) {
        prefixPropertyMaximumChangedSpan = Math.max(
          prefixPropertyMaximumChangedSpan,
          change.maximum
        );
        prefixPropertyMaximumChangedRanges = Math.max(
          prefixPropertyMaximumChangedRanges,
          change.ranges
        );
      } else {
        plainPropertyMaximumChangedSpan = Math.max(
          plainPropertyMaximumChangedSpan,
          change.maximum
        );
        plainPropertyMaximumChangedRanges = Math.max(
          plainPropertyMaximumChangedRanges,
          change.ranges
        );
      }
      if (iteration >= warmups) samples.push(duration);

      return duration;
    };

    for (let iteration = 0; iteration < warmups + iterations; iteration++) {
      let plainMs: number;
      let prefixMs: number;

      if (iteration % 2 === 0) {
        plainMs = measureProperty(
          plainEditor,
          plainSamplesMs,
          false,
          iteration
        );
        prefixMs = measureProperty(
          prefixPropertyEditor,
          prefixSamplesMs,
          true,
          iteration
        );
      } else {
        prefixMs = measureProperty(
          prefixPropertyEditor,
          prefixSamplesMs,
          true,
          iteration
        );
        plainMs = measureProperty(
          plainEditor,
          plainSamplesMs,
          false,
          iteration
        );
      }
      if (iteration >= warmups) pairedDeltaSamplesMs.push(prefixMs - plainMs);
    }

    if (
      prefixPropertyEditor.read.children()[prefixLength] !== firstBody ||
      prefixPropertyEditor.read.children().at(-1) !== lastBody ||
      plainEditor.read.children()[prefixLength] !== plainFirstBody ||
      plainEditor.read.children().at(-1) !== plainLastBody
    ) {
      throw new Error(`${blocks}: property edit recreated an untouched body.`);
    }

    const prefixReadSchema: typeof prefixPropertyEditor.read.schema =
      prefixPropertyEditor.read.schema;
    const plainReadSchema: typeof plainEditor.read.schema =
      plainEditor.read.schema;

    prefixReadSchema.assertDocument(prefixPropertyEditor.read.value());
    plainReadSchema.assertDocument(plainEditor.read.value());
    prefixSamplesMs.sort((left, right) => left - right);
    plainSamplesMs.sort((left, right) => left - right);
    const sortedPairedDeltas = [...pairedDeltaSamplesMs].sort(
      (left, right) => left - right
    );
    const prefixPropertyEdit = {
      samplesMs: prefixSamplesMs,
      p50Ms: percentile(prefixSamplesMs, 0.5),
      p95Ms: percentile(prefixSamplesMs, 0.95),
    };
    const plainPropertyEdit = {
      samplesMs: plainSamplesMs,
      p50Ms: percentile(plainSamplesMs, 0.5),
      p95Ms: percentile(plainSamplesMs, 0.95),
    };
    const propertyP95OverheadMs = percentile(sortedPairedDeltas, 0.95);
    const propertyP95OverheadBudgetMs = Math.max(
      prefixP95OverheadFloorMs,
      plainPropertyEdit.p95Ms * prefixP95OverheadFraction
    );
    const propertyRow = {
      blocks,
      boundaryIdentityPreserved: true,
      contractBytes,
      iterations,
      maximumChangedSpan: prefixPropertyMaximumChangedSpan,
      plainPropertyEdit,
      plainPropertyMaximumChangedRanges,
      plainPropertyMaximumChangedSpan,
      pairedPropertyDelta: {
        samplesMs: pairedDeltaSamplesMs,
        p50Ms: percentile(sortedPairedDeltas, 0.5),
        p95Ms: percentile(sortedPairedDeltas, 0.95),
      },
      prefixLength,
      prefixPropertyEdit,
      prefixPropertyMaximumChangedRanges,
      prefixPropertyMaximumChangedSpan,
      propertyP95OverheadBudgetMs,
      propertyP95OverheadMs,
      propertyP95WithinBudget:
        propertyP95OverheadMs <= propertyP95OverheadBudgetMs,
      startupMs,
      warmups,
    };

    if (propertyOnly) return propertyRow;

    editor.update((tx) => tx.nodes.set({ note: 'measured' }, { at: [0] }));

    const bodyIndex = prefixLength + Math.floor(blocks / 2);
    const bodyStart = performance.now();

    editor.update((tx) =>
      tx.text.insert('!', { at: { offset: 0, path: [bodyIndex, 0] } })
    );

    const bodyEditMs = performance.now() - bodyStart;
    const bodyMaximumChangedSpan = changedSpan(
      editor.read.lastCommit()
    ).maximum;
    const title = editor.read.children()[0];
    const second = editor.read.children()[1];
    const pasteStart = performance.now();

    editor.update((tx) => {
      if (
        !tx.slice.replace(
          ContentSlice.closed([
            {
              children: [{ children: [{ text: 'pasted' }], type: 'cell' }],
              type: 'table',
            },
          ]),
          { at: { offset: 0, path: [0, 0] } }
        )
      ) {
        throw new Error('Prefix boundary paste was rejected.');
      }
    });

    const pasteMs = performance.now() - pasteStart;
    const children = editor.read.children();

    if (
      children[0] !== title ||
      (prefixLength === 2 && children[1] !== second) ||
      !ElementApi.isElement(children[prefixLength]) ||
      children[prefixLength].type !== 'table'
    ) {
      throw new Error(
        `Prefix boundary paste changed required nodes: ${JSON.stringify({
          prefixLength,
          titleSame: children[0] === title,
          secondSame: children[1] === second,
          firstTypes: children
            .slice(0, 4)
            .map((node) => (ElementApi.isElement(node) ? node.type : 'text')),
          tableIndex: children.findIndex(
            (node) => ElementApi.isElement(node) && node.type === 'table'
          ),
        })}`
      );
    }

    const validationStart = performance.now();

    const readSchema: typeof editor.read.schema = editor.read.schema;

    readSchema.assertDocument(editor.read.value());

    const fullValidationMs = performance.now() - validationStart;

    if (bodyMaximumChangedSpan >= 64) {
      throw new Error(
        `${blocks}: prefix body edit widened to ${bodyMaximumChangedSpan} tokens.`
      );
    }

    return {
      ...propertyRow,
      bodyEditMs,
      bodyMaximumChangedSpan,
      fullValidationMs,
      maximumChangedSpan: Math.max(
        prefixPropertyMaximumChangedSpan,
        bodyMaximumChangedSpan
      ),
      pasteMs,
    };
  });
});
const sizeRatio =
  getDefined(rows.at(-1)).p50Ms / Math.max(rows[0].p50Ms, 0.001);
const maximumChangedSpan = Math.max(
  ...rows.map((row) => row.maximumChangedSpan)
);
const boundaryIdentityPreserved = rows.every(
  (row) => row.boundaryIdentityPreserved
);
const prefixMaximumChangedSpan = Math.max(
  ...prefixRows.map((row) => row.maximumChangedSpan)
);
const prefixPropertyP95WithinBudget = prefixRows.every(
  (row) => row.propertyP95WithinBudget
);

if (strict && (prefixRows.length !== 8 || prefixMaximumChangedSpan >= 64)) {
  throw new Error('Required-prefix construction locality failed.');
}

if (strict && (iterations < 20 || !prefixPropertyP95WithinBudget)) {
  throw new Error(
    `Required-prefix property-edit p95 proof failed: samples=${iterations}, failing rows=${
      prefixRows
        .filter((row) => !row.propertyP95WithinBudget)
        .map((row) => `${row.prefixLength}/${row.blocks}`)
        .join(',') || 'none'
    }.`
  );
}

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
  prefixRows,
  prefixMaximumChangedSpan,
  prefixPropertyP95WithinBudget,
  propertyOnlyDiagnostic: propertyOnly,
  maximumChangedSpan,
  thresholdPolicy: {
    boundaryIdentityRequired: true,
    maximumChangedSpanExclusive: 64,
    prefixProperty: {
      minimumSamplesPerArm: 20,
      p95OverheadFloorMs: prefixP95OverheadFloorMs,
      p95OverheadFractionOfPlain: prefixP95OverheadFraction,
      warmupsPerArm: warmups,
      comparison:
        'Alternating-order matched plain and prefix editors use the same nodes, schema elements, property mutation and update path. Only the root content declaration differs. A full garbage collection before each timed arm keeps unrelated collection pauses out of the causal comparison. Paired prefix-minus-plain delta p95 must stay within max(2 ms, 25% of plain p95) in every cohort; individual-arm p50/p95 remain visible.',
    },
    timingScope:
      'Property-edit p50/p95 include whole-editor immutable publication in both arms. The matched delta isolates prefix-specific cost only within observed noise; changed spans count published token ranges, not internal schema visits. This does not establish document-length-independent whole-editor latency or exact validation visit counts.',
    propertyOnlyDiagnostic:
      'The --property-only probe omits body edit and paste correctness. It cannot satisfy the registered strict target.',
  },
  version: 3,
};
const output = `${JSON.stringify(result, null, 2)}\n`;

process.stdout.write(
  `METRIC plite_schema_construction_immutable_publication_diagnostic_ratio=${sizeRatio}\n`
);
process.stdout.write(
  `METRIC plite_schema_construction_max_changed_span=${maximumChangedSpan}\n`
);
process.stdout.write(
  `METRIC plite_schema_construction_boundary_identity_preserved=${
    boundaryIdentityPreserved ? 1 : 0
  }\n`
);
process.stdout.write(
  'METRIC plite_schema_construction_compiled_schema_active=1\n'
);
process.stdout.write(
  `METRIC plite_schema_construction_prefix_max_changed_span=${prefixMaximumChangedSpan}\n`
);
process.stdout.write(
  `METRIC plite_schema_construction_prefix_boundary_identity_preserved=${propertyOnly ? 0 : 1}\n`
);
process.stdout.write(
  `METRIC plite_schema_construction_prefix_property_p95_within_budget=${
    prefixPropertyP95WithinBudget && iterations >= 20 ? 1 : 0
  }\n`
);

if (outputArgument) {
  writeBenchmarkArtifact(outputArgument.slice('--output='.length), output);
} else {
  process.stdout.write(output);
}

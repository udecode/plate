import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';

import {
  ContentSlice,
  createEditor,
  defineEditorSchema,
  schema,
  type Editor,
  type EditorDocumentValue,
  type Element,
  type SchemaElement,
} from '../../../packages/plitejs/src/index';
import { getDefined } from '../../getDefined';
import { writeBenchmarkArtifact } from './benchmark-artifact';

const DOCUMENT_WIDTHS = [10, 1000, 10_000, 50_000] as const;
const SCHEMA_WIDTHS = [5, 50, 100] as const;
const SLICE_SIZES = [1, 10, 100] as const;

const argument = (name: string, fallback: number) => {
  const value = process.argv.find((candidate) =>
    candidate.startsWith(`--${name}=`)
  );
  const parsed = value ? Number(value.slice(name.length + 3)) : fallback;

  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`--${name} must be a positive integer.`);
  }

  return parsed;
};

const iterations = argument('iterations', 250);
const samples = argument('samples', 12);
const outputArgument = process.argv.find((candidate) =>
  candidate.startsWith('--output=')
);

const percentile = (values: readonly number[], ratio: number) =>
  values[Math.min(values.length - 1, Math.ceil(values.length * ratio) - 1)];

const summarize = (values: readonly number[]) => {
  const sorted = [...values].sort((left, right) => left - right);

  return {
    p50: percentile(sorted, 0.5),
    p95: percentile(sorted, 0.95),
    p99: percentile(sorted, 0.99),
  };
};

const paragraph = (text: string): Element => ({
  children: [{ text }],
  type: 'paragraph',
});
const cell = (): Element => ({
  children: [paragraph('existing')],
  type: 'cell',
});

const createFitSchema = (elementTypes: number) => {
  assert.ok(elementTypes >= 2);
  const elements: Record<string, SchemaElement> = {
    cell: {
      content: schema.content.group('block', {
        default: { type: 'paragraph' },
        min: 1,
      }),
    },
    paragraph: {
      content: schema.content.text({ default: 'text', min: 1 }),
    },
  };

  for (let index = 2; index < elementTypes; index += 1) {
    elements[`unused_${index}`] = {
      content: schema.content.text({ default: 'text', min: 1 }),
    };
  }

  return defineEditorSchema(`schema:fit-content-locality-${elementTypes}`, {
    elements,
    id: `fit-content-locality-${elementTypes}`,
    root: schema.content.group('block', {
      default: { type: 'paragraph' },
      min: 1,
    }),
    unknown: 'reject',
    version: 1,
  });
};

const createDocument = (blocks: number): EditorDocumentValue => ({
  children: Array.from({ length: blocks }, (_value, index) =>
    paragraph(`unrelated-${index}`)
  ),
});

const createMeasuredEditor = (
  elementTypes: number,
  value: EditorDocumentValue
) => {
  const definition = createFitSchema(elementTypes);
  const before = performance.now();
  const editor = createEditor({
    extensions: [definition],
    initialValue: value,
  });

  return {
    coldEditorMs: performance.now() - before,
    editor,
  };
};

const measureFit = (
  editor: Editor,
  slice: ContentSlice,
  expectedTopLevelNodes: number
) => {
  const parent = cell();
  const childrenBefore = editor.read.children();
  const commitBefore = editor.read.lastCommit();
  let commits = 0;

  editor.subscribeCommit(() => {
    commits += 1;
  });

  const fit = () => editor.read.slice.fitContent(slice, { parent });
  const proof = fit();

  assert.ok(proof);
  assert.equal(proof.length, expectedTopLevelNodes);
  assert.equal(Object.isFrozen(proof), true);
  assert.doesNotThrow(() =>
    editor.read.schema.validateFragment([{ ...parent, children: [...proof] }])
  );

  for (let index = 0; index < 50; index += 1) fit();

  let matches = 0;
  const timings = Array.from({ length: samples }, () => {
    const before = process.hrtime.bigint();

    for (let index = 0; index < iterations; index += 1) {
      if (fit()?.length === expectedTopLevelNodes) matches += 1;
    }

    return Number(process.hrtime.bigint() - before) / iterations;
  });

  assert.equal(matches, samples * iterations);
  assert.equal(editor.read.children(), childrenBefore);
  assert.equal(editor.read.lastCommit(), commitBefore);
  assert.equal(commits, 0);

  const replay = fit();

  assert.deepEqual(replay, proof);
  assert.deepEqual(
    editor.read.slice.fitContent(ContentSlice.closed(proof), { parent }),
    proof
  );

  return {
    commits,
    iterations,
    ns: summarize(timings),
    outputTopLevelNodes: proof.length,
    samples,
  };
};

const fixedSchemaWidth = SCHEMA_WIDTHS[0];
const fixedSlice = ContentSlice.closed([{ text: 'fitted' }]);
const documentWidthRows = DOCUMENT_WIDTHS.map((blocks) => {
  const value = createDocument(blocks);
  const { coldEditorMs, editor } = createMeasuredEditor(
    fixedSchemaWidth,
    value
  );

  return {
    blocks,
    coldEditorMs,
    inputBytes: Buffer.byteLength(JSON.stringify(value)),
    warmFit: measureFit(editor, fixedSlice, 1),
  };
});

const schemaWidthRows = SCHEMA_WIDTHS.map((elementTypes) => {
  const value = createDocument(10);
  const { coldEditorMs, editor } = createMeasuredEditor(elementTypes, value);

  return {
    coldEditorMs,
    elementTypes,
    warmFit: measureFit(editor, fixedSlice, 1),
  };
});

const sliceEditor = createMeasuredEditor(
  fixedSchemaWidth,
  createDocument(10)
).editor;
const sliceSizeRows = SLICE_SIZES.map((topLevelNodes) => {
  const content = Array.from({ length: topLevelNodes }, (_value, index) =>
    paragraph(`slice-${index}`)
  );
  const slice = ContentSlice.closed(content);

  return {
    inputBytes: Buffer.byteLength(JSON.stringify(slice)),
    topLevelNodes,
    warmFit: measureFit(sliceEditor, slice, topLevelNodes),
  };
});

const ratio = (stress: number, tiny: number) => stress / Math.max(tiny, 0.001);
const documentWidthRatio = ratio(
  getDefined(documentWidthRows.at(-1)).warmFit.ns.p50,
  documentWidthRows[0].warmFit.ns.p50
);
const schemaWidthRatio = ratio(
  getDefined(schemaWidthRows.at(-1)).warmFit.ns.p50,
  schemaWidthRows[0].warmFit.ns.p50
);
const allRows = [...documentWidthRows, ...schemaWidthRows, ...sliceSizeRows];
const correctness = {
  deterministicAndIdempotent: true,
  editorMutationFree: allRows.every(({ warmFit }) => warmFit.commits === 0),
  everyFitSucceeded: allRows.every(
    ({ warmFit }) =>
      warmFit.outputTopLevelNodes > 0 &&
      warmFit.iterations === iterations &&
      warmFit.samples === samples
  ),
};

const result = {
  benchmark: 'plite-fit-content-locality',
  correctness,
  corpus: {
    documentWidths: DOCUMENT_WIDTHS,
    fixedSchemaElementTypes: fixedSchemaWidth,
    fixedSliceTopLevelNodes: 1,
    schemaWidths: SCHEMA_WIDTHS,
    sliceSizes: SLICE_SIZES,
  },
  documentWidthRows,
  environment: {
    arch: process.arch,
    platform: process.platform,
    runtime: process.versions.bun ? 'bun' : 'node',
    runtimeVersion: process.versions.bun ?? process.version,
  },
  generatedAt: new Date().toISOString(),
  locality: {
    documentWidthRatio,
    policy:
      'Warm detached fitting may scale with the immutable slice and detached parent, never unrelated editor-root blocks or unused schema element types. Cold editor construction is reported separately.',
    schemaWidthRatio,
  },
  runtime: {
    fitCallsPerRow: iterations * samples,
    iterations,
    samples,
    totalMeasuredFitCalls: allRows.length * iterations * samples,
  },
  schemaWidthRows,
  sliceSizeRows,
  thresholdPolicy: {
    correctness:
      'Every fit succeeds, validates, is deterministic/idempotent, and publishes no editor mutation.',
    locality:
      '50,000 unrelated blocks and 100 declared element types must each remain within 1.5x the smallest warm-fit p50. Slice-size rows are absolute baselines because fitting is allowed to scale with input size.',
  },
  version: 1,
};

if (process.env.PLITE_FIT_CONTENT_LOCALITY_STRICT === '1') {
  assert.deepEqual(correctness, {
    deterministicAndIdempotent: true,
    editorMutationFree: true,
    everyFitSucceeded: true,
  });
  assert.ok(
    documentWidthRatio <= 1.5,
    `document-width ratio ${documentWidthRatio} exceeds 1.5`
  );
  assert.ok(
    schemaWidthRatio <= 1.5,
    `schema-width ratio ${schemaWidthRatio} exceeds 1.5`
  );
}

const output = `${JSON.stringify(result, null, 2)}\n`;
const widestDocument = getDefined(documentWidthRows.at(-1));
const widestSchema = getDefined(schemaWidthRows.at(-1));
const largestSlice = getDefined(sliceSizeRows.at(-1));

process.stdout.write(
  `METRIC plite_fit_content_document_width_ratio=${documentWidthRatio}\n`
);
process.stdout.write(
  `METRIC plite_fit_content_schema_width_ratio=${schemaWidthRatio}\n`
);
process.stdout.write(
  `METRIC plite_fit_content_50000_blocks_p50_ns=${widestDocument.warmFit.ns.p50}\n`
);
process.stdout.write(
  `METRIC plite_fit_content_100_schema_types_p50_ns=${widestSchema.warmFit.ns.p50}\n`
);
process.stdout.write(
  `METRIC plite_fit_content_100_slice_nodes_p50_ns=${largestSlice.warmFit.ns.p50}\n`
);
process.stdout.write(
  `METRIC plite_fit_content_total_measured_calls=${result.runtime.totalMeasuredFitCalls}\n`
);

if (outputArgument) {
  writeBenchmarkArtifact(outputArgument.slice('--output='.length), output);
} else {
  process.stdout.write(output);
}

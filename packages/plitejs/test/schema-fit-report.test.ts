import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  ContentSlice,
  createEditor,
  defineEditorSchema,
  property,
  schema,
  target,
  type EditorSchemaRepairCode,
} from 'plitejs';

import { getEditorSchema } from '../src/core/editor-runtime';

const codes = (repairs: ReadonlyArray<{ code: EditorSchemaRepairCode }>) =>
  repairs.map(({ code }) => code);

const Script = schema.property.exclusive('schema-fit-report:script');
let generatedPropertySequence = 0;
const PropertySchema = defineEditorSchema('schema:fit-report-properties', {
  elements: {
    paragraph: {
      content: schema.content.text({ default: 'text', min: 1 }),
      properties: {
        align: property.string({ default: 'start', omitDefault: true }),
        generated: property.string({
          generate: () => {
            generatedPropertySequence += 1;

            return `generated-${generatedPropertySequence}`;
          },
        }),
        status: property.string({ default: 'ready' }),
        tags: property.set(property.string()),
      },
    },
  },
  id: 'fit-report-properties',
  properties: [
    schema.textProperty('subscript', property.boolean(), {
      exclusive: [Script],
      target: target.type('paragraph'),
    }),
    schema.textProperty('superscript', property.boolean(), {
      exclusive: [Script],
      target: target.type('paragraph'),
    }),
  ],
  root: schema.content.type('paragraph', {
    default: { type: 'paragraph' },
    min: 1,
  }),
  unknown: 'reject',
  version: 1,
});

const createPropertyEditor = () =>
  createEditor({
    initialValue: [
      {
        children: [{ text: 'initial' }],
        generated: 'initial',
        status: 'ready',
        type: 'paragraph',
      },
    ],
    plugins: [PropertySchema],
  });

const RepresentationSchema = defineEditorSchema(
  'schema:fit-report-representation',
  {
    elements: {
      container: {
        content: schema.content.not(
          schema.content.any([
            schema.content.text(),
            schema.content.type('link'),
          ])
        ),
      },
      link: {
        content: schema.content.text({ default: 'text', min: 1 }),
        inline: true,
      },
      paragraph: {
        content: schema.content.any(
          [schema.content.text(), schema.content.type('link')],
          { default: 'text', min: 1 }
        ),
      },
    },
    id: 'fit-report-representation',
    root: schema.content.type('container', {
      default: { type: 'container' },
      min: 1,
    }),
    unknown: 'preserve',
    version: 1,
  }
);

const createRepresentationEditor = () =>
  createEditor({
    initialValue: [
      {
        children: [{ children: [{ text: 'initial' }], type: 'paragraph' }],
        type: 'container',
      },
    ],
    plugins: [RepresentationSchema],
  });

const inContainer = (children: readonly object[]) => ({
  children: [{ children, type: 'container' }],
});

describe('reported schema fitting', () => {
  it('reports property repairs without requiring repeatable generators', () => {
    const editor = createPropertyEditor();
    const input = {
      children: [
        {
          align: 'start',
          children: [{ subscript: true, superscript: true, text: 'marked' }],
          tags: ['z', 'a', 'z'],
          type: 'paragraph',
        },
      ],
      meta: { source: 'test' },
    } as const;
    const before = structuredClone(input);
    const publicResult = editor.read.schema.fitDocument(input);
    const report = getEditorSchema(editor).fitDocumentWithReport(input);

    assert.deepEqual(input, before);
    assert.throws(() => editor.read.schema.assertDocument(input));
    editor.read.schema.assertDocument(publicResult);
    editor.read.schema.assertDocument(report.document);
    assert.deepEqual(report.document.meta, input.meta);
    assert.notEqual(
      publicResult.children[0]?.generated,
      report.document.children[0]?.generated
    );
    assert.deepEqual(
      new Set(codes(report.repairs)),
      new Set<EditorSchemaRepairCode>([
        'canonicalize-set-property',
        'default-property',
        'generate-property',
        'omit-default-property',
        'resolve-exclusive-property',
      ])
    );
    assert.deepEqual(
      getEditorSchema(editor).fitDocumentWithReport(report.document).repairs,
      []
    );
    const freshReport = getEditorSchema(editor).fitDocumentWithReport(input);

    assert.notEqual(
      freshReport.document.children[0]?.generated,
      report.document.children[0]?.generated
    );
    assert.deepEqual(freshReport.repairs, report.repairs);
  });

  it('reports each committed canonical representation repair', () => {
    const editor = createRepresentationEditor();
    const inputs = [
      inContainer([
        {
          children: [{ text: 'a' }, { text: '' }, { text: 'b' }],
          type: 'paragraph',
        },
      ]),
      inContainer([
        {
          children: [{ children: [{ text: 'link' }], type: 'link' }],
          type: 'paragraph',
        },
      ]),
      inContainer([
        {
          children: [
            { text: 'before' },
            { children: [{ text: 'inside' }], type: 'paragraph' },
          ],
          type: 'raw',
        },
      ]),
      inContainer([
        {
          children: [
            { children: [{ text: 'block' }], type: 'paragraph' },
            { children: [{ text: 'link' }], type: 'link' },
          ],
          type: 'raw',
        },
      ]),
      inContainer([{ children: [], type: 'raw' }]),
    ] as const;
    const reports = inputs.map((input) => {
      const publicResult = editor.read.schema.fitDocument(input);
      const report = getEditorSchema(editor).fitDocumentWithReport(input);

      assert.deepEqual(report.document, publicResult);
      assert.deepEqual(
        getEditorSchema(editor).fitDocumentWithReport(report.document).repairs,
        []
      );

      return report;
    });

    assert.deepEqual(
      new Set(reports.flatMap(({ repairs }) => codes(repairs))),
      new Set<EditorSchemaRepairCode>([
        'flatten-block-content',
        'insert-empty-text',
        'insert-inline-spacer',
        'merge-text',
        'remove-empty-text',
        'remove-noncanonical-child',
      ])
    );
    const merge = reports[0]?.repairs.find(({ code }) => code === 'merge-text');

    assert.deepEqual(
      merge?.inputs.map(({ path }) => path),
      [
        [0, 0, 0],
        [0, 0, 2],
      ]
    );
    assert.deepEqual(
      merge?.outputs.map(({ path }) => path),
      [[0, 0, 0]]
    );
  });

  it('reports document and grammar repairs without changing rejection APIs', () => {
    const RequiredRootSchema = defineEditorSchema(
      'schema:fit-report-required-root',
      {
        elements: {
          heading: {
            content: schema.content.text({ default: 'text', min: 1 }),
          },
          paragraph: {
            content: schema.content.text({ default: 'text', min: 1 }),
          },
        },
        root: schema.content.type('paragraph', {
          default: { type: 'paragraph' },
          min: 1,
        }),
        roots: {
          header: schema.content.type('heading', {
            default: { type: 'heading' },
            min: 1,
          }),
        },
        unknown: 'reject',
      }
    );
    const requiredRootEditor = createEditor({
      initialValue: {
        children: [{ children: [{ text: 'initial' }], type: 'paragraph' }],
        roots: {
          header: [{ children: [{ text: 'header' }], type: 'heading' }],
        },
      },
      plugins: [RequiredRootSchema],
    });
    const missingRoot = {
      children: [{ children: [{ text: 'body' }], type: 'paragraph' }],
    } as const;

    assert.throws(() =>
      requiredRootEditor.read.schema.assertDocument(missingRoot)
    );
    const publicRequiredRoot =
      requiredRootEditor.read.schema.fitDocument(missingRoot);
    const requiredRootReport =
      getEditorSchema(requiredRootEditor).fitDocumentWithReport(missingRoot);

    assert.deepEqual(requiredRootReport.document, publicRequiredRoot);
    assert.deepEqual(
      new Set(codes(requiredRootReport.repairs)),
      new Set<EditorSchemaRepairCode>([
        'create-root',
        'insert-required-content',
      ])
    );
    const createdRoot = requiredRootReport.repairs.find(
      ({ code }) => code === 'create-root'
    );

    assert.deepEqual(createdRoot?.inputs, []);
    assert.deepEqual(
      createdRoot?.outputs.map(({ path }) => path),
      [[]]
    );

    const DropSchema = defineEditorSchema('schema:fit-report-drop', {
      elements: {
        atom: {
          content: schema.content.not(schema.content.text()),
        },
      },
      root: schema.content.type('atom', {
        default: { type: 'atom' },
        min: 1,
      }),
      unknown: 'reject',
    });
    const dropEditor = createEditor({ plugins: [DropSchema] });
    const dropped = getEditorSchema(dropEditor).fitDocumentWithReport({
      children: [{ text: 'stray' }],
    });

    assert.deepEqual(
      new Set(codes(dropped.repairs)),
      new Set<EditorSchemaRepairCode>([
        'drop-unplaceable-text',
        'insert-required-content',
      ])
    );
    assert.deepEqual(
      dropped.repairs.find(({ code }) => code === 'drop-unplaceable-text')
        ?.outputs,
      []
    );

    const WrapSchema = defineEditorSchema('schema:fit-report-wrap', {
      elements: {
        heading: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
        paragraph: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
        section: {
          content: schema.content.type('paragraph', {
            default: { type: 'paragraph' },
            min: 1,
          }),
        },
      },
      root: schema.content.type('section', {
        default: { type: 'section' },
        min: 1,
      }),
      unknown: 'reject',
    });
    const wrapEditor = createEditor({ plugins: [WrapSchema] });
    const wrapped = getEditorSchema(wrapEditor).fitDocumentWithReport({
      children: [{ children: [{ text: 'paragraph' }], type: 'paragraph' }],
    });
    const replaced = getEditorSchema(wrapEditor).fitDocumentWithReport({
      children: [
        {
          children: [{ children: [{ text: 'heading' }], type: 'heading' }],
          type: 'section',
        },
      ],
    });

    assert.ok(codes(wrapped.repairs).includes('wrap-content'));
    assert.ok(codes(replaced.repairs).includes('replace-element-shell'));
    for (const report of [requiredRootReport, dropped, wrapped, replaced]) {
      assert.ok(report.repairs.every((repair) => Object.isFrozen(repair)));
      assert.ok(
        report.repairs.every(
          (repair) =>
            Object.isFrozen(repair.inputs) && Object.isFrozen(repair.outputs)
        )
      );
    }
  });

  it('keeps projected-root reports transactional and deduplicated', () => {
    const ProjectedSchema = defineEditorSchema(
      'schema:fit-report-projected-root',
      {
        elements: {
          image: {
            content: schema.content.text({ default: 'text', min: 1 }),
            contentRoots: {
              caption: {
                content: schema.content.type('paragraph', {
                  default: { type: 'paragraph' },
                  min: 1,
                }),
                ownership: 'exclusive',
              },
            },
          },
          paragraph: {
            content: schema.content.text({ default: 'text', min: 1 }),
          },
        },
        root: schema.content.types(['image', 'paragraph'], {
          default: { type: 'paragraph' },
          min: 1,
        }),
        unknown: 'reject',
      }
    );
    const editor = createEditor({ plugins: [ProjectedSchema] });
    const input = {
      children: [
        {
          childRoots: { caption: 'caption:1' },
          children: [{ text: '' }],
          type: 'image',
        },
      ],
      roots: {
        'caption:1': [
          {
            children: [{ text: 'a' }, { text: 'b' }],
            type: 'paragraph',
          },
        ],
      },
    } as const;
    const report = getEditorSchema(editor).fitDocumentWithReport(input);

    assert.equal(
      report.repairs.filter(({ code }) => code === 'merge-text').length,
      1
    );
    assert.deepEqual(
      getEditorSchema(editor).fitDocumentWithReport(report.document).repairs,
      []
    );
    assert.throws(() =>
      getEditorSchema(editor).fitDocumentWithReport({
        children: [{ children: [{ text: '' }], type: 'unknown' }],
      })
    );
    assert.deepEqual(
      getEditorSchema(editor).fitDocumentWithReport(report.document).repairs,
      []
    );
  });
});

describe('detached slice schema admission', () => {
  it('checks shape, vocabulary, roots, and openness without destination fitting', () => {
    const AdmissionSchema = defineEditorSchema('schema:slice-admission', {
      elements: {
        image: {
          content: schema.content.text({ default: 'text', min: 1 }),
          contentRoots: {
            caption: {
              content: schema.content.type('paragraph'),
              ownership: 'exclusive',
            },
          },
        },
        paragraph: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
      root: schema.content.type('paragraph'),
      unknown: 'reject',
    });
    const schemaApi = getEditorSchema(
      createEditor({ plugins: [AdmissionSchema] })
    );
    const detached = ContentSlice.fromJSON({
      content: [
        {
          childRoots: { caption: 'caption:1' },
          children: [{ text: '' }],
          type: 'image',
        },
      ],
      openEnd: 1,
      openStart: 1,
      roots: {
        'caption:1': [{ children: [{ text: 'caption' }], type: 'paragraph' }],
      },
    });

    assert.doesNotThrow(() => schemaApi.assertContentSliceForSchema(detached));
    assert.doesNotThrow(() =>
      schemaApi.assertContentSliceForSchema({
        content: [{ text: 'destination-free text' }],
        openEnd: 0,
        openStart: 0,
      })
    );
    assert.throws(() =>
      schemaApi.assertContentSliceForSchema({
        content: [{ children: [{ text: '' }], type: 'unknown' }],
        openEnd: 0,
        openStart: 0,
      })
    );
    assert.throws(() =>
      schemaApi.assertContentSliceForSchema({
        content: [
          {
            children: [{ text: '' }],
            unexpected: true,
            type: 'paragraph',
          },
        ],
        openEnd: 0,
        openStart: 0,
      })
    );
    assert.throws(() =>
      schemaApi.assertContentSliceForSchema({
        content: [
          {
            childRoots: { caption: 'missing' },
            children: [{ text: '' }],
            type: 'image',
          },
        ],
        openEnd: 0,
        openStart: 0,
      })
    );
    assert.throws(() =>
      schemaApi.assertContentSliceForSchema({
        content: [{ children: [{ text: '' }], type: 'paragraph' }],
        openEnd: 0,
        openStart: 0,
        roots: {
          orphan: [{ children: [{ text: 'orphan' }], type: 'paragraph' }],
        },
      })
    );
    assert.throws(() =>
      schemaApi.assertContentSliceForSchema({
        content: [{ children: [{ text: '' }], type: 'paragraph' }],
        openEnd: 0,
        openStart: 2,
      })
    );
  });
});

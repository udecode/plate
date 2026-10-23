import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createEditor, defineEditorSchema, property, schema } from 'plitejs';

import { PreparedTokenSlice } from '../src/core/change/tokens';
import { getEditorSchema } from '../src/core/editor-runtime';

const paragraph = (text: string) => ({
  children: [{ text }],
  type: 'paragraph',
});

const DocumentFitSchema = defineEditorSchema('schema:document-fit-contract', {
  elements: {
    heading: {
      content: schema.content.text({ default: 'text', min: 1 }),
    },
    inner: {
      content: schema.content.text({ default: 'text', min: 1 }),
      contentRoots: {
        body: {
          content: schema.content.type('paragraph', {
            default: { type: 'paragraph' },
            min: 1,
          }),
          ownership: 'exclusive',
        },
      },
    },
    outer: {
      content: schema.content.text({ default: 'text', min: 1 }),
      contentRoots: {
        body: {
          content: schema.content.type('inner'),
          ownership: 'exclusive',
        },
      },
    },
    paragraph: {
      content: schema.content.text({ default: 'text', min: 1 }),
    },
  },
  id: 'document-fit-contract',
  root: schema.content.types(['paragraph', 'outer'], {
    default: { type: 'paragraph' },
    min: 1,
  }),
  roots: { header: schema.content.type('heading') },
  unknown: 'reject',
  version: 1,
});

const createSchemaEditor = () =>
  createEditor({
    plugins: [DocumentFitSchema],
    initialValue: [paragraph('initial')],
  });

describe('complete document fitting', () => {
  it('resolves nested projected roots when a child sorts before its owner', () => {
    const editor = createSchemaEditor();
    const input = {
      children: [
        {
          childRoots: { body: 'z-parent' },
          children: [{ text: '' }],
          type: 'outer',
        },
      ],
      roots: {
        'a-child': [paragraph('nested')],
        'z-parent': [
          {
            childRoots: { body: 'a-child' },
            children: [{ text: '' }],
            type: 'inner',
          },
        ],
      },
    };
    const before = JSON.stringify(input);
    const fitted = editor.read.schema.fitDocument(input);

    assert.deepEqual(fitted, input);
    assert.equal(JSON.stringify(input), before);
    editor.read.schema.assertDocument(fitted);
    assert.deepEqual(editor.read.children(), [paragraph('initial')]);
  });

  for (const root of ['main', 'header']) {
    it(`maps external selection through ${root} root wrapping`, () => {
      const editor = createSchemaEditor();
      const point = { offset: 2, path: [0] };
      const input =
        root === 'main'
          ? { children: [{ text: 'abcd' }] }
          : {
              children: [paragraph('body')],
              roots: { header: [{ text: 'abcd' }] },
            };
      const before = JSON.stringify(input);
      const fitted = getEditorSchema(editor).fitDocumentWithSelection(input, {
        root,
        selection: { anchor: point, focus: point },
      });
      const expectedPoint = { offset: 2, path: [0, 0] };

      assert.deepEqual(fitted.selection, {
        anchor: expectedPoint,
        focus: expectedPoint,
      });
      assert.deepEqual(
        root === 'main'
          ? fitted.document.children
          : fitted.document.roots?.header,
        [
          {
            children: [{ text: 'abcd' }],
            type: root === 'main' ? 'paragraph' : 'heading',
          },
        ]
      );
      assert.equal(JSON.stringify(input), before);
      editor.read.schema.assertDocument(fitted.document);
      assert.deepEqual(editor.read.children(), [paragraph('initial')]);
    });
  }
});

const BoldSchema = defineEditorSchema('schema:document-fit-bold', {
  elements: {
    paragraph: { content: schema.content.text() },
  },
  id: 'document-fit-bold',
  properties: [
    schema.textProperty(
      'bold',
      property.boolean({ default: false, omitDefault: true })
    ),
  ],
  root: schema.content.type('paragraph', {
    default: { type: 'paragraph' },
    min: 1,
  }),
  unknown: 'reject',
  version: 1,
});

const positionsConcatenated = (paragraphs: number) => {
  const editor = createEditor({
    initialValue: [paragraph('initial')],
    plugins: [BoldSchema],
  });
  const { concat } = PreparedTokenSlice;
  let positions = 0;

  PreparedTokenSlice.concat = (slices) => {
    for (const slice of slices) positions += slice.length;

    return concat.call(PreparedTokenSlice, slices);
  };

  try {
    const fitted = editor.read.schema.fitDocument({
      children: Array.from({ length: paragraphs }, () => ({
        children: [
          { bold: true, text: 'a ' },
          { bold: true, text: 'b' },
        ],
        type: 'paragraph',
      })),
    });

    assert.deepEqual(
      fitted.children,
      Array.from({ length: paragraphs }, () => ({
        children: [{ bold: true, text: 'a b' }],
        type: 'paragraph',
      }))
    );
  } finally {
    PreparedTokenSlice.concat = concat;
  }

  return positions;
};

it('concatenates each slice position once when fitting merges the runs of every paragraph', () => {
  const small = positionsConcatenated(100);
  const large = positionsConcatenated(400);

  assert.ok(small > 0, 'fitting concatenated no slice positions');
  assert.ok(
    large <= small * 5,
    `fitting 400 paragraphs concatenated ${large} slice positions, against ${small} for 100`
  );
});

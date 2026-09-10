import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createEditor, defineEditorSchema, schema } from 'plitejs';

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
    extensions: [DocumentFitSchema],
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

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Y from 'yjs';

import { getEditorSchema } from '../../src/core/editor-runtime';
import { holdsImportedRoot } from '../../src/core/editor-schema';
import { fitImportedBlock } from '../../src/core/representation';
import {
  createEditor,
  defineEditorSchema,
  type EditorDocumentValue,
  type Element,
  property,
  schema,
} from '../../src/index';
import { createYjsNode } from '../../src/yjs/core/document';
import { DEFAULT_YJS_ROOT_NAME } from '../../src/yjs/core/keys';
import { yjs } from '../../src/yjs/core/plugin';

const text = (type: string, value: string, extra = {}): Element => ({
  children: [{ text: value }],
  type,
  ...extra,
});

const Prefixed = defineEditorSchema('schema:yjs-imported-prefix', {
  elements: {
    heading: {
      content: schema.content.text({ default: 'text', min: 1 }),
      properties: { level: property.number({ required: true }) },
    },
    paragraph: { content: schema.content.text({ default: 'text', min: 1 }) },
    quote: {
      content: schema.content.type('paragraph', {
        default: { type: 'paragraph' },
        min: 1,
      }),
    },
  },
  id: 'yjs-imported-prefix',
  root: schema.content.prefix(
    [{ element: 'heading', properties: { level: 1 } }],
    schema.content.types(['paragraph', 'quote'], {
      default: { type: 'paragraph' },
      min: 1,
    })
  ),
  unknown: 'reject',
  version: 1,
});

const TwoHeadings = defineEditorSchema('schema:yjs-imported-two-headings', {
  elements: {
    heading: { content: schema.content.text({ default: 'text', min: 1 }) },
    paragraph: { content: schema.content.text({ default: 'text', min: 1 }) },
  },
  id: 'yjs-imported-two-headings',
  root: schema.content.prefix(
    [{ element: 'heading' }, { element: 'heading' }],
    schema.content.type('paragraph', { default: { type: 'paragraph' }, min: 1 })
  ),
  unknown: 'reject',
  version: 1,
});

const Captioned = defineEditorSchema('schema:yjs-imported-content-root', {
  elements: {
    media: {
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
    paragraph: { content: schema.content.text({ default: 'text', min: 1 }) },
  },
  id: 'yjs-imported-content-root',
  root: schema.content.types(['media', 'paragraph'], {
    default: { type: 'paragraph' },
    min: 1,
  }),
  unknown: 'reject',
  version: 1,
});

const prefixed: EditorDocumentValue = {
  children: [
    text('heading', 'Title', { level: 1 }),
    text('paragraph', 'a'),
    { children: [text('paragraph', 'quoted')], type: 'quote' },
    text('paragraph', 'b'),
  ],
};

const captioned: EditorDocumentValue = {
  children: [
    text('media', 'image', { childRoots: { caption: 'caption-1' } }),
    text('paragraph', 'after'),
  ],
  roots: { 'caption-1': [text('paragraph', 'A caption')] },
};

const rootsOf = (value: EditorDocumentValue) =>
  Object.entries({ main: value.children, ...value.roots });

const receive = (
  plugin: typeof Prefixed | typeof TwoHeadings,
  value: EditorDocumentValue,
  write: (root: Y.XmlElement) => void
) => {
  const doc = new Y.Doc();
  const editor = createEditor({ initialValue: value, plugins: [plugin] });
  const binding = yjs({ doc, initialReady: true, seed: true });

  editor.install(binding);
  doc.transact(() => write(doc.getXmlElement(DEFAULT_YJS_ROOT_NAME)));

  return {
    children: editor.read.children(),
    state: editor.plugin(binding).api.admissionStatus().state,
  };
};

describe('imported block fitting', () => {
  it('keeps every block of a valid root as whole-document fitting keeps it', () => {
    for (const [plugin, value] of [
      [Prefixed, prefixed],
      [Captioned, captioned],
    ] as const) {
      const editor = createEditor({ initialValue: value, plugins: [plugin] });
      const fitted = editor.read.schema.fitDocument(value);

      for (const [root, children] of rootsOf(fitted)) {
        for (const block of children) {
          assert.deepEqual(fitImportedBlock(editor, block, root), block);
        }
        assert.equal(
          holdsImportedRoot(
            getEditorSchema(editor),
            root,
            { at: (index) => children[index], length: children.length },
            []
          ),
          true
        );
      }
    }
  });

  it('repairs a block whose content its element rejects as whole-document fitting does', () => {
    const editor = createEditor({
      initialValue: prefixed,
      plugins: [Prefixed],
    });
    const loose = { children: [{ text: 'loose' }], type: 'quote' };
    const document = editor.read.schema.fitDocument({
      children: [...prefixed.children.slice(0, 2), loose],
    });

    assert.deepEqual(
      fitImportedBlock(editor, loose, 'main'),
      document.children[2]
    );
  });

  it('completes a remote root that lost its required title', () => {
    assert.deepEqual(
      receive(Prefixed, prefixed, (root) => root.delete(0, 1)),
      {
        children: [
          text('heading', '', { level: 1 }),
          ...prefixed.children.slice(1),
        ],
        state: 'ready',
      }
    );
  });

  it('refuses a remote root whose heading is pushed past a two-slot prefix', () => {
    const headed = {
      children: [
        text('heading', 'A'),
        text('heading', 'B'),
        text('paragraph', 'body'),
      ],
    };

    // The heading pushed out of the prefix lands two blocks past the insert,
    // outside its window.
    assert.deepEqual(
      receive(TwoHeadings, headed, (root) =>
        root.insert(0, [createYjsNode(text('heading', 'New'))])
      ),
      { children: headed.children, state: 'error' }
    );
  });
});

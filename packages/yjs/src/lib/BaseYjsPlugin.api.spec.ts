import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createBaseEditor } from '@platejs/core';
import { createPlateEditor } from '@platejs/core/react';
import { createEditor } from '@platejs/plite';
import * as Y from 'yjs';

import { createYjsExtension } from '../core/extension';
import { YjsPlugin } from '../react/YjsPlugin';
import { BaseYjsPlugin } from './BaseYjsPlugin';

const TestSchema = { id: 'plate:yjs-api-test', version: 1 } as const;
const paragraph = (text: string) => ({
  children: [{ text }],
  type: 'paragraph',
});

const createSeededYjsUpdate = (text: string) => {
  const doc = new Y.Doc();

  createEditor({
    extensions: [createYjsExtension({ clientId: 'seed', doc })] as const,
    initialValue: [paragraph(text)],
  });

  return Y.encodeStateAsUpdate(doc);
};

describe('BaseYjsPlugin', () => {
  it('installs the configured Plite Yjs extension', () => {
    const doc = new Y.Doc();
    const provider = { doc };
    const editor = createBaseEditor({
      plugins: [
        BaseYjsPlugin.configure({
          initialState: {
            clientId: 'base-user',
            doc,
            provider,
            rootName: 'base-room',
          },
        }),
      ],
      schema: TestSchema,
    });

    assert.equal(
      editor.read((state) => state.yjs.doc()),
      doc
    );
    assert.equal(
      editor.read((state) => state.yjs.clientId()),
      'base-user'
    );
    assert.equal(
      editor.read((state) => state.yjs.root()),
      doc.get('base-room', Y.XmlElement)
    );
  });

  it('preserves the extension through the React Plate plugin', () => {
    const doc = new Y.Doc();
    const editor = createPlateEditor({
      plugins: [
        YjsPlugin.configure({
          initialState: {
            clientId: 'react-user',
            doc,
            rootName: 'react-room',
          },
        }),
      ],
      schema: TestSchema,
    });

    assert.equal(
      editor.read((state) => state.yjs.doc()),
      doc
    );
    assert.equal(
      editor.read((state) => state.yjs.clientId()),
      'react-user'
    );
  });

  it('resolves Yjs state while a seeded document initializes', () => {
    const doc = new Y.Doc();

    Y.applyUpdate(doc, createSeededYjsUpdate('seeded'));
    const editor = createEditor({
      extensions: [createYjsExtension({ clientId: 'target', doc })] as const,
      initialValue: [paragraph('local')],
    });

    assert.equal(editor.read.text.string([]), 'seeded');
    assert.equal(
      editor.read((state) => state.yjs.clientId()),
      'target'
    );
  });

  it('resolves replacement Yjs state while a seeded document initializes', () => {
    const editor = createEditor({
      extensions: [
        createYjsExtension({ clientId: 'first', doc: new Y.Doc() }),
      ] as const,
      initialValue: [paragraph('first')],
    });
    const replacementDoc = new Y.Doc();

    Y.applyUpdate(replacementDoc, createSeededYjsUpdate('second'));
    editor.extend(
      createYjsExtension({
        clientId: 'second',
        doc: replacementDoc,
      })
    );

    assert.equal(editor.read.text.string([]), 'second');
    assert.equal(
      editor.read((state) => state.yjs.clientId()),
      'second'
    );
  });
});

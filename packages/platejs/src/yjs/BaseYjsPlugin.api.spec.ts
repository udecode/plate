import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  BaseParagraphPlugin,
  createEditor as createHeadlessEditor,
  createEditor as createPliteEditor,
} from 'platejs';
import { createEditor } from 'platejs/react';
import * as Y from 'yjs';

import { FakeProvider } from '../../test/yjs/support/provider';
import { BaseYjsPlugin } from './BaseYjsPlugin';
import { yjs } from './core/extension';
import { YjsPlugin } from './react/YjsPlugin';

const TestSchema = { id: 'plate:yjs-api-test', version: 1 } as const;
const paragraph = (text: string) => ({
  children: [{ text }],
  type: 'paragraph',
});

const createSeededYjsUpdate = (text: string) => {
  const doc = new Y.Doc();

  createPliteEditor({
    extensions: [yjs({ clientId: 'seed', doc })] as const,
    initialValue: [paragraph(text)],
  });

  return Y.encodeStateAsUpdate(doc);
};

describe('BaseYjsPlugin', () => {
  it('installs the configured Plite Yjs extension', () => {
    const doc = new Y.Doc();
    const provider = { doc };
    const editor = createHeadlessEditor({
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
    const editor = createEditor({
      plugins: [
        BaseParagraphPlugin,
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

  it('disconnects the configured provider through the Plate update portal', () => {
    const provider = new FakeProvider({
      status: 'connected',
      synced: true,
    });
    const editor = createEditor({
      initialValue: [{ children: [{ text: 'react' }], type: 'paragraph' }],
      plugins: [
        BaseParagraphPlugin,
        YjsPlugin.configure({
          initialState: {
            clientId: 'react-user',
            provider,
          },
        }),
      ],
      schema: TestSchema,
    });

    editor.update.yjs.disconnect();

    assert.equal(provider.status, 'disconnected');
    assert.equal(
      editor.read((state) => state.yjs.providerStatus()),
      'disconnected'
    );
  });

  it('publishes Plate selection commits through the configured provider', () => {
    const provider = new FakeProvider({
      awarenessClientId: 101,
      status: 'connected',
      synced: true,
    });
    const editor = createEditor({
      initialValue: [{ children: [{ text: 'react' }], type: 'paragraph' }],
      plugins: [
        BaseParagraphPlugin,
        YjsPlugin.configure({
          initialState: {
            clientId: 'react-user',
            provider,
            rootName: 'react-room',
          },
        }),
      ],
      schema: TestSchema,
    });

    editor.update.selection.set({
      anchor: { offset: 1, path: [0, 0] },
      focus: { offset: 1, path: [0, 0] },
    });

    assert.notEqual(provider.awareness.getLocalState()?.selection, undefined);
  });

  it('resolves Yjs state while a seeded document initializes', () => {
    const doc = new Y.Doc();

    Y.applyUpdate(doc, createSeededYjsUpdate('seeded'));
    const editor = createPliteEditor({
      extensions: [yjs({ clientId: 'target', doc })] as const,
      initialValue: [paragraph('local')],
    });

    assert.equal(editor.read.text.string([]), 'seeded');
    assert.equal(
      editor.read((state) => state.yjs.clientId()),
      'target'
    );
  });

  it('resolves replacement Yjs state while a seeded document initializes', () => {
    const editor = createPliteEditor({
      extensions: [yjs({ clientId: 'first', doc: new Y.Doc() })] as const,
      initialValue: [paragraph('first')],
    });
    const replacementDoc = new Y.Doc();

    Y.applyUpdate(replacementDoc, createSeededYjsUpdate('second'));
    editor.install(
      yjs({
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

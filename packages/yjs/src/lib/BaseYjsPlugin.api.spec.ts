import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createBaseEditor, createBasePlugin } from '@platejs/core';
import { createPlateEditor } from '@platejs/core/react';
import { createEditor } from '@platejs/plite';
import * as Y from 'yjs';

import { createYjsExtension } from '../core/extension';
import { YjsPlugin } from '../react/YjsPlugin';
import { FakeProvider } from '../../test/support/provider';
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

class CountingProvider extends FakeProvider {
  offCount = 0;
  onCount = 0;

  override off(...args: Parameters<FakeProvider['off']>): void {
    this.offCount++;
    super.off(...args);
  }

  override on(...args: Parameters<FakeProvider['on']>): void {
    this.onCount++;
    super.on(...args);
  }
}

describe('BaseYjsPlugin', () => {
  it('installs the configured Plite Yjs extension', () => {
    const doc = new Y.Doc();
    const provider = { doc };
    const editor = createBaseEditor({
      plugins: [
        BaseYjsPlugin.configure({
          options: {
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
          options: {
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

  it('preserves the provider controller and undo manager across unrelated Plate configuration', () => {
    const provider = new CountingProvider({ synced: true });
    const UnrelatedPlugin = createBasePlugin({
      config: { label: 'one' },
      key: 'unrelatedYjsLifecycle',
    });
    const editor = createBaseEditor({
      plugins: [
        BaseYjsPlugin.configure({
          options: { destroyProviderOnUnmount: true, provider },
        }),
        UnrelatedPlugin,
      ],
      schema: TestSchema,
    });
    const onCount = provider.onCount;

    editor.update.text.insert('x', { at: { offset: 0, path: [0, 0] } });
    editor.configure(UnrelatedPlugin, { label: 'two' });

    assert.equal(provider.onCount, onCount);
    assert.equal(provider.offCount, 0);
    assert.deepEqual(provider.calls, []);

    editor.update.yjs.undo();

    assert.equal(editor.read.text.string([]), '');
  });

  it('keeps a shared provider live and preserves undo history across Yjs configuration replacement', () => {
    const provider = new CountingProvider({ synced: true });
    const ConfiguredYjsPlugin = createBasePlugin({
      config: { clientId: 'first' },
      key: 'sameProviderYjsLifecycle',
    }).extendExtension(({ plugin }) =>
      createYjsExtension({
        clientId: plugin.config.clientId,
        destroyProviderOnUnmount: true,
        provider,
        rootName: 'same-provider-yjs-lifecycle',
      })
    );
    const editor = createBaseEditor({
      plugins: [ConfiguredYjsPlugin],
      schema: TestSchema,
    });

    editor.update.text.insert('x', { at: { offset: 0, path: [0, 0] } });
    editor.update.yjs.sendSelection({
      anchor: { offset: 1, path: [0, 0] },
      focus: { offset: 1, path: [0, 0] },
    });
    const awarenessSelection = provider.awareness.getLocalState()?.selection;

    assert.ok(awarenessSelection);
    editor.configure(ConfiguredYjsPlugin, { clientId: 'second' });

    assert.equal(
      editor.read((state) => state.yjs.clientId()),
      'second'
    );
    assert.deepEqual(provider.calls, []);
    assert.deepEqual(
      provider.awareness.getLocalState()?.selection,
      awarenessSelection
    );

    provider.emitStatus('connected');
    assert.equal(
      editor.read((state) => state.yjs.connected()),
      true
    );

    editor.update.text.insert('y', { at: { offset: 1, path: [0, 0] } });
    editor.update.yjs.undo();
    assert.equal(editor.read.text.string([]), 'x');
    editor.update.yjs.undo();
    assert.equal(editor.read.text.string([]), '');
    editor.update.yjs.redo();
    assert.equal(editor.read.text.string([]), 'x');
    editor.update.yjs.redo();
    assert.equal(editor.read.text.string([]), 'xy');
  });

  it('cleans up and activates exactly one Yjs resource when its configuration changes', () => {
    const first = new CountingProvider({ synced: true });
    const second = new CountingProvider({ synced: true });
    const providers = { first, second } as const;
    const ConfiguredYjsPlugin = createBasePlugin({
      config: { provider: 'first' as keyof typeof providers },
      key: 'configuredYjsLifecycle',
    }).extendExtension(({ plugin }) =>
      createYjsExtension({
        destroyProviderOnUnmount: true,
        provider: providers[plugin.config.provider],
        rootName: 'configured-yjs-lifecycle',
      })
    );
    const editor = createBaseEditor({
      plugins: [ConfiguredYjsPlugin],
      schema: TestSchema,
    });
    const firstOnCount = first.onCount;

    editor.configure(ConfiguredYjsPlugin, { provider: 'second' });

    assert.equal(first.onCount, firstOnCount);
    assert.equal(first.offCount, firstOnCount);
    assert.deepEqual(first.calls, ['destroy']);
    assert.equal(second.onCount, firstOnCount);
    assert.equal(second.offCount, 0);
    assert.deepEqual(second.calls, []);
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

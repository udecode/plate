import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Y from 'yjs';

import { createEditor, type Descendant } from '../../src/index';
import { yjs } from '../../src/yjs';
import type { YjsInitialReadiness } from '../../src/yjs/core/types';
import { FakeProvider } from './support/provider';

const rootName = 'application-provider-contract';

const paragraph = (text: string): Descendant => ({
  children: [{ text }],
  type: 'paragraph',
});

const providerReadiness = (provider: FakeProvider): YjsInitialReadiness => {
  assert.ok(provider.doc);

  return {
    doc: provider.doc,
    getSnapshot: () => provider.synced === true,
    subscribe(listener) {
      const onSync = (): void => listener();

      provider.on('sync', onSync);
      provider.on('synced', onSync);
      let active = true;

      return () => {
        if (!active) return;

        active = false;
        provider.off('sync', onSync);
        provider.off('synced', onSync);
      };
    },
  };
};

const createClaimedUpdate = (): Uint8Array => {
  const doc = new Y.Doc();
  const editor = createEditor({ initialValue: [paragraph('remote')] });
  const cleanup = editor.install(
    yjs({ doc, initialReady: true, rootName, seed: true })
  );

  cleanup();

  return Y.encodeStateAsUpdate(doc);
};

describe('plitejs/yjs application provider contract', () => {
  it('lets the application translate provider sync into initial readiness', () => {
    const doc = new Y.Doc();

    Y.applyUpdate(doc, createClaimedUpdate());

    const provider = new FakeProvider({ doc, synced: false });
    const binding = yjs({
      awareness: provider.awareness,
      doc,
      initialReady: providerReadiness(provider),
      rootName,
    });
    const editor = createEditor({
      initialValue: [paragraph('local')],
      plugins: [binding],
    });

    assert.deepEqual(editor.plugin(binding).api.admissionStatus(), {
      reason: 'load',
      state: 'waiting',
    });
    assert.deepEqual(editor.read.children(), [paragraph('local')]);

    provider.connect();
    provider.emitSync(true);

    assert.equal(editor.plugin(binding).api.admissionStatus().state, 'ready');
    assert.deepEqual(editor.read.children(), [paragraph('remote')]);

    void provider.disconnect();
    provider.destroy();
    assert.deepEqual(provider.calls, ['connect', 'disconnect', 'destroy']);
  });

  it('keeps an admitted editor ready while the application is offline', () => {
    const doc = new Y.Doc();

    Y.applyUpdate(doc, createClaimedUpdate());

    const provider = new FakeProvider({ doc, synced: false });
    const binding = yjs({
      doc,
      initialReady: providerReadiness(provider),
      rootName,
    });
    const editor = createEditor({
      initialValue: [paragraph('local')],
      plugins: [binding],
    });

    provider.emitSync(true);
    provider.emitSync(false);

    assert.equal(editor.plugin(binding).api.admissionStatus().state, 'ready');

    editor.update.text.insert('!', { at: { offset: 6, path: [0, 0] } });

    assert.deepEqual(editor.read.children(), [paragraph('remote!')]);
  });

  it('subscribes before its first external readiness snapshot', () => {
    const doc = new Y.Doc();
    const order: string[] = [];
    const readiness: YjsInitialReadiness = {
      doc,
      getSnapshot: () => {
        order.push('snapshot');

        return false;
      },
      subscribe: () => {
        order.push('subscribe');

        return () => {};
      },
    };
    const binding = yjs({ doc, initialReady: readiness, rootName, seed: true });
    const editor = createEditor({
      initialValue: [paragraph('local')],
      plugins: [binding],
    });

    assert.equal(order[0], 'subscribe');
    assert.equal(order[1], 'snapshot');
    assert.deepEqual(editor.plugin(binding).api.admissionStatus(), {
      reason: 'load',
      state: 'waiting',
    });
  });

  it('removes application readiness listeners on idempotent cleanup', () => {
    const doc = new Y.Doc();
    const provider = new FakeProvider({ doc, synced: false });
    const editor = createEditor({ initialValue: [paragraph('local')] });
    const cleanup = editor.install(
      yjs({
        doc,
        initialReady: providerReadiness(provider),
        rootName,
        seed: true,
      })
    );

    assert.equal(provider.listenerCount('sync'), 1);
    assert.equal(provider.listenerCount('synced'), 1);

    cleanup();
    cleanup();

    assert.equal(provider.listenerCount('sync'), 0);
    assert.equal(provider.listenerCount('synced'), 0);
    assert.deepEqual(provider.calls, []);
  });
});

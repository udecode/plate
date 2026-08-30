import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Y from 'yjs';

import {
  replace as editorReplace,
  string as editorString,
} from '#platejs-test-internal';

import {
  createEditor,
  type Descendant,
  type Range,
  type Editor as BasePlateEditor,
} from '../../src/core';
import { yjs } from '../../src/yjs';
import {
  connectedFromYjsProviderStatus,
  normalizeYjsProviderStatus,
  normalizeYjsProviderSynced,
} from '../../src/yjs/core/provider';
import type {
  YjsExtensionOptions,
  YjsProviderStatus,
} from '../../src/yjs/core/types';
import {
  createYjsPeer,
  FakeProvider,
  getHistoryUndoCount,
  getYjsProviderStatus,
  getYjsProviderSynced,
  isYjsPeerConnected,
  paragraph,
  readEditorYjsState,
  runEditorYjsUpdate,
  runYjsUpdate,
  undoEditorHistory,
} from './support/collaboration';

type Cleanup = () => void;

type ProviderEditor = {
  readonly cleanup: Cleanup;
  readonly editor: BasePlateEditor;
};

const initialValue = (): Descendant[] => [
  paragraph('alpha'),
  paragraph('beta'),
];

const selection = (): Range => ({
  anchor: { path: [0, 0], offset: 1 },
  focus: { path: [0, 0], offset: 3 },
});

const linkAwareness = (source: FakeProvider, target: FakeProvider): Cleanup => {
  const syncSourceAwareness = (): void => {
    const state = source.awareness.getLocalState();

    if (source.status !== 'connected' || state === null) {
      target.awareness.removeRemoteState(source.awareness.clientID);

      return;
    }

    target.awareness.setRemoteState(source.awareness.clientID, state);
  };
  const syncSourceStatus = (): void => {
    if (source.status !== 'connected') {
      target.awareness.removeRemoteState(source.awareness.clientID);
    }
  };

  source.awareness.on('change', syncSourceAwareness);
  source.on('status', syncSourceStatus);

  return (): void => {
    source.awareness.off('change', syncSourceAwareness);
    source.off('status', syncSourceStatus);
  };
};

class DeferredConnectProvider extends FakeProvider {
  override connect(): void {
    this.calls.push('connect');
  }
}

class AsyncDisconnectProvider extends FakeProvider {
  resolveDisconnect: (() => void) | null = null;

  override disconnect(): Promise<void> {
    this.calls.push('disconnect');

    return new Promise<void>((resolve) => {
      this.resolveDisconnect = () => {
        this.emitStatus('disconnected');
        resolve();
      };
    });
  }
}

class AsyncRejectDisconnectProvider extends FakeProvider {
  rejectDisconnect: (() => void) | null = null;

  override disconnect(): Promise<void> {
    this.calls.push('disconnect');

    return new Promise<void>((_resolve, reject) => {
      this.rejectDisconnect = () => {
        reject(new Error('disconnect failed'));
      };
    });
  }
}

class StatusOnlyProvider extends FakeProvider {
  override connect(): void {
    this.calls.push('connect');
    this.status = 'connected';
  }

  override disconnect(): void {
    this.calls.push('disconnect');
    this.status = 'disconnected';
  }
}

class FireAndForgetDisconnectProvider extends FakeProvider {
  override disconnect(): void {
    this.calls.push('disconnect');
  }
}

const createYjsUpdate = (children: readonly Descendant[]): Uint8Array => {
  const doc = new Y.Doc();

  createEditor({
    extensions: [
      yjs({
        clientId: 'seed',
        doc,
        rootName: 'plitejs',
      }),
    ],
    initialValue: [...children],
  });

  return Y.encodeStateAsUpdate(doc);
};

const applyProviderDoc = (
  provider: FakeProvider,
  children: readonly Descendant[]
): void => {
  Y.applyUpdate(provider.doc, createYjsUpdate(children));
};

const seedProviderDoc = (
  provider: FakeProvider,
  children: readonly Descendant[] = initialValue()
): void => {
  applyProviderDoc(provider, children);
  provider.emitSync(true);
};

const insertFirstBlockTextAtEnd = (
  editor: BasePlateEditor,
  text = '!'
): void => {
  editor.update.text.insert(text, {
    at: { path: [0, 0], offset: editorString(editor, [0]).length },
  });
};

const createInitialEditor = (): BasePlateEditor => {
  const editor = createEditor();

  editorReplace(editor, {
    children: initialValue(),
    selection: null,
  });

  return editor;
};

const createProviderEditor = (
  provider: FakeProvider,
  options: Partial<YjsExtensionOptions> = {}
): ProviderEditor => {
  const editor = createInitialEditor();

  const cleanup = editor.install(
    yjs({
      clientId: 'provider-peer',
      provider,
      rootName: 'plitejs',
      ...options,
    })
  );

  return { cleanup, editor };
};

const createProviderEditorWithHistory = (
  provider: FakeProvider,
  options: Partial<YjsExtensionOptions> = {}
): ProviderEditor => {
  const editor = createInitialEditor();
  const cleanup = editor.install(
    yjs({
      clientId: 'provider-peer-with-history',
      provider,
      rootName: 'plitejs',
      ...options,
    })
  );

  return {
    cleanup,
    editor,
  };
};

describe('platejs/yjs provider contract', () => {
  it('passes provider string statuses through', () => {
    assert.equal(normalizeYjsProviderStatus('connected'), 'connected');
    assert.equal(
      normalizeYjsProviderStatus({ status: 'disconnected' }),
      'disconnected'
    );
    assert.equal(normalizeYjsProviderStatus('open'), 'open');
    assert.equal(normalizeYjsProviderStatus({ status: 'stale' }), 'stale');
  });

  it('normalizes only boolean provider synced payloads', () => {
    assert.equal(normalizeYjsProviderSynced(true), true);
    assert.equal(normalizeYjsProviderSynced({ state: false }), false);
    assert.equal(normalizeYjsProviderSynced({ synced: true }), true);
    assert.equal(normalizeYjsProviderSynced('true'), null);
    assert.equal(normalizeYjsProviderSynced({ state: 'false' }), null);
    assert.equal(normalizeYjsProviderSynced({ synced: 1 }), null);
  });

  it('derives connection state from provider status with null fallback only', () => {
    assert.equal(connectedFromYjsProviderStatus('connected', false), true);
    assert.equal(connectedFromYjsProviderStatus('connecting', true), false);
    assert.equal(connectedFromYjsProviderStatus('disconnected', true), false);
    assert.equal(connectedFromYjsProviderStatus('open', true), true);
    assert.equal(connectedFromYjsProviderStatus('open', false), false);
    assert.equal(connectedFromYjsProviderStatus(null, true), true);
    assert.equal(connectedFromYjsProviderStatus(null, false), false);
  });

  it('returns nullable provider state without a provider', () => {
    const peer = createYjsPeer({
      children: initialValue(),
      clientId: 'a',
    });

    assert.equal(getYjsProviderStatus(peer), null);
    assert.equal(getYjsProviderSynced(peer), null);

    runYjsUpdate(peer, (innerYjs) => {
      innerYjs.disconnect();
      assert.equal(isYjsPeerConnected(peer), false);
      innerYjs.reconnect();
    });

    assert.equal(isYjsPeerConnected(peer), true);
  });

  it('notifies provider subscribers when local connection state changes without a provider', () => {
    const peer = createYjsPeer({
      children: initialValue(),
      clientId: 'a',
    });
    const innerYjs2 = readEditorYjsState(peer.editor);
    const seen: boolean[] = [];
    const unsubscribe = innerYjs2.subscribeProvider(() => {
      seen.push(innerYjs2.connected());
    });

    runYjsUpdate(peer, (innerYjs3) => {
      innerYjs3.disconnect();
      innerYjs3.connect();
    });
    unsubscribe();

    assert.deepEqual(seen, [false, true]);
  });

  it('uses provider doc and awareness as additive defaults', () => {
    const provider = new FakeProvider();
    seedProviderDoc(provider);
    const { cleanup, editor } = createProviderEditor(provider);
    const innerYjs4 = readEditorYjsState(editor);

    assert.equal(innerYjs4.doc(), provider.doc);
    assert.equal(innerYjs4.providerStatus(), 'disconnected');
    assert.equal(innerYjs4.providerSynced(), true);
    assert.equal(innerYjs4.connected(), false);

    runEditorYjsUpdate(editor, (innerYjs5) => {
      innerYjs5.sendSelection(selection(), { name: 'Provider peer' });
    });

    assert.deepEqual(provider.awareness.getLocalState()?.data, {
      name: 'Provider peer',
    });

    cleanup();
  });

  it('subscribes to provider status and provider-reported sync changes', () => {
    const provider = new FakeProvider();
    const { cleanup, editor } = createProviderEditor(provider);
    const innerYjs6 = readEditorYjsState(editor);
    const seen: Array<[YjsProviderStatus | null, boolean | null]> = [];
    const unsubscribe = innerYjs6.subscribeProvider(() => {
      seen.push([innerYjs6.providerStatus(), innerYjs6.providerSynced()]);
    });

    provider.emitStatus('connecting');
    provider.emitSync(true);
    provider.emitStatus({ status: 'connected' });
    provider.emitSynced(false);
    provider.emitSyncedState(true);
    unsubscribe();
    provider.emitStatus('disconnected');

    assert.deepEqual(seen, [
      ['connecting', false],
      ['connecting', true],
      ['connected', true],
      ['connected', false],
      ['connected', true],
    ]);

    cleanup();
  });

  it('does not notify provider subscribers for unchanged status or sync events', () => {
    const provider = new FakeProvider();
    const { cleanup, editor } = createProviderEditor(provider);
    const innerYjs7 = readEditorYjsState(editor);
    const seen: Array<[YjsProviderStatus | null, boolean | null]> = [];
    const unsubscribe = innerYjs7.subscribeProvider(() => {
      seen.push([innerYjs7.providerStatus(), innerYjs7.providerSynced()]);
    });

    provider.emitStatus('disconnected');
    provider.emitSync(false);
    provider.emitSynced(false);
    provider.emitStatus('connected');
    provider.emitStatus('connected');
    provider.emitSynced(true);
    provider.emitSync(true);

    unsubscribe();

    assert.deepEqual(seen, [
      ['connected', false],
      ['connected', true],
    ]);

    cleanup();
  });

  it('does not seed or import a provider-owned document before provider sync', () => {
    const provider = new FakeProvider();
    const { cleanup, editor } = createProviderEditor(provider);
    const root = provider.doc.get('plitejs', Y.XmlElement);

    assert.equal(root.length, 0);

    applyProviderDoc(provider, [paragraph('remote')]);

    assert.equal(editorString(editor, [0]), 'alpha');

    provider.emitSync(true);

    assert.equal(editorString(editor, [0]), 'remote');
    assert.equal(root.length, 1);

    cleanup();
  });

  it('does not reconcile an unsafe empty provider doc before sync', () => {
    const provider = new FakeProvider();
    const { cleanup, editor } = createProviderEditor(provider);
    const root = provider.doc.get('plitejs', Y.XmlElement);

    runEditorYjsUpdate(editor, (innerYjs8) => {
      innerYjs8.reconcile();
    });

    assert.equal(editorString(editor, [0]), 'alpha');
    assert.equal(root.length, 0);

    cleanup();
  });

  it('does not save rejected pre-sync provider edits in Plite history', async () => {
    const provider = new FakeProvider();
    const { cleanup, editor } = createProviderEditorWithHistory(provider);

    insertFirstBlockTextAtEnd(editor);
    await Promise.resolve();

    assert.equal(editorString(editor, [0]), 'alpha');
    assert.equal(getHistoryUndoCount(editor), 0);

    undoEditorHistory(editor);

    assert.equal(editorString(editor, [0]), 'alpha');

    cleanup();
  });

  it('imports provider content before exporting local edits after sync', () => {
    const provider = new FakeProvider();
    const { cleanup, editor } = createProviderEditor(provider);
    const root = provider.doc.get('plitejs', Y.XmlElement);

    applyProviderDoc(provider, [paragraph('remote')]);

    assert.equal(editorString(editor, [0]), 'alpha');
    assert.equal(root.length, 1);

    insertFirstBlockTextAtEnd(editor);

    assert.equal(editorString(editor, [0]), 'alpha');

    provider.emitSync(true);

    assert.equal(editorString(editor, [0]), 'remote');
    assert.equal(root.length, 1);

    insertFirstBlockTextAtEnd(editor);

    assert.equal(editorString(editor, [0]), 'remote!');

    cleanup();
  });

  it('seeds empty synced provider docs by default', () => {
    const provider = new FakeProvider();
    const { cleanup, editor } = createProviderEditor(provider);
    const root = provider.doc.get('plitejs', Y.XmlElement);

    assert.equal(root.length, 0);
    provider.emitSync(true);

    assert.equal(editorString(editor, [0]), 'alpha');
    assert.equal(root.length, 2);

    insertFirstBlockTextAtEnd(editor);

    assert.equal(editorString(editor, [0]), 'alpha!');
    assert.equal(root.length, 2);

    cleanup();
  });

  it('allows apps to opt out of seeding empty synced provider docs', () => {
    const provider = new FakeProvider();
    const { cleanup, editor } = createProviderEditor(provider, {
      seedProviderOnSync: false,
    });
    const root = provider.doc.get('plitejs', Y.XmlElement);

    provider.emitSync(true);

    assert.equal(editorString(editor, [0]), 'alpha');
    assert.equal(root.length, 0);

    insertFirstBlockTextAtEnd(editor);

    assert.equal(editorString(editor, [0]), 'alpha');
    assert.equal(root.length, 0);

    cleanup();
  });

  it('rejects local edits before an empty provider doc syncs', () => {
    const provider = new FakeProvider();
    const { cleanup, editor } = createProviderEditor(provider);
    const root = provider.doc.get('plitejs', Y.XmlElement);

    assert.equal(root.length, 0);
    assert.doesNotThrow(() => {
      insertFirstBlockTextAtEnd(editor);
    });
    assert.equal(editorString(editor, [0]), 'alpha');
    assert.equal(root.length, 0);

    provider.emitSync(true);

    assert.equal(editorString(editor, [0]), 'alpha');
    assert.equal(root.length, 2);

    insertFirstBlockTextAtEnd(editor);

    assert.equal(editorString(editor, [0]), 'alpha!');
    assert.equal(root.length, 2);

    cleanup();
  });

  it('keeps provider content authoritative after rejecting pre-sync edits', () => {
    const provider = new FakeProvider();
    const { cleanup, editor } = createProviderEditor(provider);
    const root = provider.doc.get('plitejs', Y.XmlElement);

    insertFirstBlockTextAtEnd(editor);

    assert.equal(editorString(editor, [0]), 'alpha');
    assert.equal(root.length, 0);

    applyProviderDoc(provider, [paragraph('remote')]);

    assert.equal(editorString(editor, [0]), 'alpha');
    assert.equal(root.length, 1);

    provider.emitSync(true);

    assert.equal(editorString(editor, [0]), 'remote');
    assert.equal(root.length, 1);

    cleanup();
  });

  it('does not seed provider docs with unknown sync state by default', () => {
    const provider = new FakeProvider({ exposeSynced: false });
    const { cleanup, editor } = createProviderEditor(provider);
    const root = provider.doc.get('plitejs', Y.XmlElement);

    assert.equal(root.length, 0);

    insertFirstBlockTextAtEnd(editor);

    assert.equal(editorString(editor, [0]), 'alpha');
    assert.equal(root.length, 0);

    cleanup();
  });

  it('does not seed provider docs with unknown sync state when explicitly requested', () => {
    const provider = new FakeProvider({ exposeSynced: false });
    const { cleanup, editor } = createProviderEditor(provider, {
      seedProviderOnSync: true,
    });
    const root = provider.doc.get('plitejs', Y.XmlElement);

    assert.equal(root.length, 0);

    insertFirstBlockTextAtEnd(editor);

    assert.equal(editorString(editor, [0]), 'alpha');
    assert.equal(root.length, 0);

    provider.emitSync(true);

    assert.equal(editorString(editor, [0]), 'alpha');
    assert.equal(root.length, 2);

    cleanup();
  });

  it('treats an explicit provider doc as sync-gated provider state', () => {
    const provider = new FakeProvider();
    const { cleanup, editor } = createProviderEditor(provider, {
      doc: provider.doc,
      seedProviderOnSync: true,
    });
    const root = provider.doc.get('plitejs', Y.XmlElement);

    assert.equal(root.length, 0);

    insertFirstBlockTextAtEnd(editor);

    assert.equal(editorString(editor, [0]), 'alpha');
    assert.equal(root.length, 0);

    provider.emitSync(true);

    assert.equal(editorString(editor, [0]), 'alpha');
    assert.equal(root.length, 2);

    cleanup();
  });

  it('sync-gates explicit docs even when providers do not expose a doc property', () => {
    const doc = new Y.Doc();
    const provider = new FakeProvider({ doc, exposeDoc: false });
    const { cleanup, editor } = createProviderEditor(provider, {
      doc,
      seedProviderOnSync: true,
    });
    const root = doc.get('plitejs', Y.XmlElement);

    assert.equal(root.length, 0);

    insertFirstBlockTextAtEnd(editor);

    assert.equal(editorString(editor, [0]), 'alpha');
    assert.equal(root.length, 0);

    provider.emitSync(true);

    assert.equal(editorString(editor, [0]), 'alpha');
    assert.equal(root.length, 2);

    cleanup();
  });

  it('seeds empty provider docs on sync when explicitly requested', () => {
    const provider = new FakeProvider();
    const { cleanup, editor } = createProviderEditorWithHistory(provider, {
      seedProviderOnSync: true,
    });
    const root = provider.doc.get('plitejs', Y.XmlElement);

    assert.equal(root.length, 0);
    provider.emitSync(true);

    assert.equal(editorString(editor, [0]), 'alpha');
    assert.equal(root.length, 2);

    insertFirstBlockTextAtEnd(editor);

    assert.equal(editorString(editor, [0]), 'alpha!');

    undoEditorHistory(editor);

    assert.equal(editorString(editor, [0]), 'alpha');

    cleanup();
  });

  it('uses provider status events as the remote cursor visibility gate', () => {
    const provider = new FakeProvider({ status: 'connected' });
    seedProviderDoc(provider);
    const { cleanup, editor } = createProviderEditor(provider);
    const innerYjs9 = readEditorYjsState(editor);

    runEditorYjsUpdate(editor, (innerYjs10) => {
      innerYjs10.sendSelection(selection(), { name: 'Remote peer' });
    });
    provider.awareness.setRemoteState(88, {
      data: { name: 'Remote peer' },
      selection: provider.awareness.getLocalState()?.selection,
    });

    assert.equal(innerYjs9.connected(), true);
    assert.equal(innerYjs9.remoteCursors().length, 1);

    provider.emitStatus({ status: 'disconnected' });

    assert.equal(innerYjs9.connected(), false);
    assert.deepEqual(innerYjs9.remoteCursors(), []);

    provider.emitStatus('connected');

    assert.equal(innerYjs9.connected(), true);
    assert.equal(innerYjs9.remoteCursors().length, 1);

    cleanup();
  });

  it('rebroadcasts local awareness after reconnect when the selected range is unchanged', () => {
    const doc = new Y.Doc();
    const providerA = new FakeProvider({
      awarenessClientId: 101,
      doc,
      status: 'connected',
      synced: true,
    });
    const providerB = new FakeProvider({
      awarenessClientId: 202,
      doc,
      status: 'connected',
      synced: true,
    });
    seedProviderDoc(providerA);
    const peerA = createProviderEditor(providerA);
    const peerB = createProviderEditor(providerB);
    const unlink = linkAwareness(providerA, providerB);
    const range = selection();

    runEditorYjsUpdate(peerA.editor, (innerYjs11) => {
      innerYjs11.sendSelection(range, { name: 'Ada' });
    });

    assert.deepEqual(readEditorYjsState(peerB.editor).remoteCursors(), [
      {
        clientId: 101,
        data: { name: 'Ada' },
        selection: range,
      },
    ]);

    runEditorYjsUpdate(peerA.editor, (innerYjs12) => {
      innerYjs12.disconnect();
    });

    assert.deepEqual(readEditorYjsState(peerB.editor).remoteCursors(), []);

    runEditorYjsUpdate(peerA.editor, (innerYjs13) => {
      innerYjs13.connect();
      innerYjs13.sendSelection(range, { name: 'Ada' });
    });

    assert.deepEqual(readEditorYjsState(peerB.editor).remoteCursors(), [
      {
        clientId: 101,
        data: { name: 'Ada' },
        selection: range,
      },
    ]);

    unlink();
    peerA.cleanup();
    peerB.cleanup();
  });

  it('does not expose stale cursors while provider connect is pending', () => {
    const provider = new DeferredConnectProvider();
    seedProviderDoc(provider);
    const { cleanup, editor } = createProviderEditor(provider);
    const innerYjs14 = readEditorYjsState(editor);

    runEditorYjsUpdate(editor, (innerYjs15) => {
      innerYjs15.sendSelection(selection(), { name: 'Remote peer' });
    });
    provider.awareness.setRemoteState(88, {
      data: { name: 'Remote peer' },
      selection: provider.awareness.getLocalState()?.selection,
    });

    assert.equal(innerYjs14.connected(), false);
    assert.deepEqual(innerYjs14.remoteCursors(), []);

    runEditorYjsUpdate(editor, (innerYjs16) => {
      innerYjs16.connect();
    });

    assert.deepEqual(provider.calls, ['connect']);
    assert.equal(innerYjs14.providerStatus(), 'disconnected');
    assert.equal(innerYjs14.connected(), false);
    assert.deepEqual(innerYjs14.remoteCursors(), []);

    provider.emitStatus('connected');

    assert.equal(innerYjs14.connected(), true);
    assert.equal(innerYjs14.remoteCursors().length, 1);

    cleanup();
  });

  it('reads imperative provider status after lifecycle calls without events', () => {
    const provider = new StatusOnlyProvider();
    seedProviderDoc(provider);
    const { cleanup, editor } = createProviderEditor(provider);
    const innerYjs17 = readEditorYjsState(editor);

    assert.equal(innerYjs17.providerStatus(), 'disconnected');
    assert.equal(innerYjs17.connected(), false);

    runEditorYjsUpdate(editor, (innerYjs18) => {
      innerYjs18.connect();
    });

    assert.deepEqual(provider.calls, ['connect']);
    assert.equal(innerYjs17.providerStatus(), 'connected');
    assert.equal(innerYjs17.connected(), true);

    runEditorYjsUpdate(editor, (innerYjs19) => {
      innerYjs19.disconnect();
    });

    assert.deepEqual(provider.calls, ['connect', 'disconnect']);
    assert.equal(innerYjs17.providerStatus(), 'disconnected');
    assert.equal(innerYjs17.connected(), false);

    cleanup();
  });

  it('keeps local disconnect authoritative while provider status is stale', () => {
    const provider = new FireAndForgetDisconnectProvider({
      status: 'connected',
    });
    seedProviderDoc(provider);
    const { cleanup, editor } = createProviderEditor(provider);
    const innerYjs20 = readEditorYjsState(editor);

    assert.equal(innerYjs20.connected(), true);

    runEditorYjsUpdate(editor, (innerYjs21) => {
      innerYjs21.disconnect();
    });

    assert.deepEqual(provider.calls, ['disconnect']);
    assert.equal(innerYjs20.providerStatus(), 'connected');
    assert.equal(innerYjs20.connected(), false);

    provider.emitStatus('connected');

    assert.equal(innerYjs20.providerStatus(), 'connected');
    assert.equal(innerYjs20.connected(), false);

    runEditorYjsUpdate(editor, (innerYjs22) => {
      innerYjs22.connect();
    });

    assert.deepEqual(provider.calls, ['disconnect', 'connect']);
    assert.equal(innerYjs20.providerStatus(), 'connected');
    assert.equal(innerYjs20.connected(), true);

    cleanup();
  });

  it('delegates reconnect to optional provider transport methods in order', () => {
    const provider = new FakeProvider();
    const { cleanup, editor } = createProviderEditor(provider);

    runEditorYjsUpdate(editor, (innerYjs23) => {
      innerYjs23.reconnect();
    });

    assert.deepEqual(provider.calls, ['disconnect', 'connect']);
    assert.equal(readEditorYjsState(editor).connected(), true);
    assert.equal(readEditorYjsState(editor).providerStatus(), 'connected');

    cleanup();
  });

  it('waits for async provider disconnect before reconnecting', async () => {
    const provider = new AsyncDisconnectProvider();
    const { cleanup, editor } = createProviderEditor(provider);

    runEditorYjsUpdate(editor, (innerYjs24) => {
      innerYjs24.reconnect();
    });

    assert.deepEqual(provider.calls, ['disconnect']);

    provider.resolveDisconnect?.();
    await Promise.resolve();

    assert.deepEqual(provider.calls, ['disconnect', 'connect']);

    cleanup();
  });

  it('does not reconnect when async provider disconnect rejects', async () => {
    const provider = new AsyncRejectDisconnectProvider();
    const { cleanup, editor } = createProviderEditor(provider);

    runEditorYjsUpdate(editor, (innerYjs25) => {
      innerYjs25.reconnect();
    });

    assert.deepEqual(provider.calls, ['disconnect']);

    provider.rejectDisconnect?.();
    await Promise.resolve();

    assert.deepEqual(provider.calls, ['disconnect']);
    assert.equal(readEditorYjsState(editor).connected(), false);

    cleanup();
  });

  it('keeps pause separate from provider disconnect', () => {
    const provider = new FakeProvider();
    const { cleanup, editor } = createProviderEditor(provider);

    runEditorYjsUpdate(editor, (innerYjs28) => {
      innerYjs28.pause();
      innerYjs28.disconnect();
    });

    const innerYjs26 = readEditorYjsState(editor);

    assert.equal(innerYjs26.paused(), true);
    assert.equal(innerYjs26.connected(), false);
    assert.deepEqual(provider.calls, ['disconnect']);

    cleanup();
  });

  it('cleans up provider listeners and local awareness selection without destroying app-owned providers', () => {
    const provider = new FakeProvider();
    seedProviderDoc(provider);
    const { cleanup, editor } = createProviderEditor(provider);
    let notifications = 0;
    const unsubscribe = readEditorYjsState(editor).subscribeProvider(() => {
      notifications += 1;
    });

    runEditorYjsUpdate(editor, (innerYjs27) => {
      innerYjs27.sendSelection(selection(), { name: 'Provider peer' });
    });

    cleanup();
    unsubscribe();
    provider.emitStatus('connected');
    provider.emitSynced(true);

    assert.equal(notifications, 0);
    assert.deepEqual(provider.calls, []);
    assert.equal(provider.awareness.getLocalState()?.selection, null);
    assert.deepEqual(provider.awareness.getLocalState()?.data, {
      name: 'Provider peer',
    });
  });

  it('does not create provider awareness state during cleanup', () => {
    const provider = new FakeProvider();
    seedProviderDoc(provider);
    const { cleanup } = createProviderEditor(provider);

    assert.equal(provider.awareness.getLocalState(), null);
    assert.equal(
      provider.awareness.getStates().has(provider.awareness.clientID),
      false
    );

    cleanup();

    assert.equal(provider.awareness.getLocalState(), null);
    assert.equal(
      provider.awareness.getStates().has(provider.awareness.clientID),
      false
    );
  });

  it('destroys providers only when explicitly owned by the editor', () => {
    const provider = new FakeProvider({ synced: true });
    const { cleanup } = createProviderEditor(provider, {
      destroyProviderOnUnmount: true,
    });

    cleanup();

    assert.deepEqual(provider.calls, ['destroy']);
  });
});

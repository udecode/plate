import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  createEditor,
  type Descendant,
  type Range,
  type Editor as SlateEditor,
} from '@platejs/slate';
import { Editor } from '@platejs/slate/internal';
import { history } from '@platejs/slate-history';
import * as Y from 'yjs';

import { createYjsExtension } from '../src';
import {
  connectedFromYjsProviderStatus,
  normalizeYjsProviderStatus,
  normalizeYjsProviderSynced,
} from '../src/core/provider';
import type { YjsExtensionOptions, YjsProviderStatus } from '../src/core/types';
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
  readonly editor: SlateEditor;
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
      createYjsExtension({
        clientId: 'seed',
        doc,
        rootName: '@platejs/slate',
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

const insertFirstBlockTextAtEnd = (editor: SlateEditor, text = '!'): void => {
  editor.update((tx) => {
    tx.text.insert(text, {
      at: { path: [0, 0], offset: Editor.string(editor, [0]).length },
    });
  });
};

const createInitialEditor = (): SlateEditor => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: initialValue(),
    marks: null,
    selection: null,
  });

  return editor;
};

const createProviderEditor = (
  provider: FakeProvider,
  options: Partial<YjsExtensionOptions> = {}
): ProviderEditor => {
  const editor = createInitialEditor();

  const cleanup = editor.extend(
    createYjsExtension({
      clientId: 'provider-peer',
      provider,
      rootName: '@platejs/slate',
      ...options,
    })
  );

  return { cleanup, editor };
};

const createProviderEditorWithHistory = (
  provider: FakeProvider,
  order: 'history-first' | 'yjs-first'
): ProviderEditor => {
  const editor = createInitialEditor();
  const cleanups: Cleanup[] = [];

  if (order === 'history-first') {
    cleanups.push(editor.extend(history()));
  }

  cleanups.push(
    editor.extend(
      createYjsExtension({
        clientId: `provider-peer-${order}`,
        provider,
        rootName: '@platejs/slate',
      })
    )
  );

  if (order === 'yjs-first') {
    cleanups.push(editor.extend(history()));
  }

  return {
    cleanup: (): void => {
      for (const cleanup of [...cleanups].reverse()) {
        cleanup();
      }
    },
    editor,
  };
};

describe('@platejs/yjs provider contract', () => {
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

    runYjsUpdate(peer, (yjs) => {
      yjs.disconnect();
      assert.equal(isYjsPeerConnected(peer), false);
      yjs.reconnect();
    });

    assert.equal(isYjsPeerConnected(peer), true);
  });

  it('notifies provider subscribers when local connection state changes without a provider', () => {
    const peer = createYjsPeer({
      children: initialValue(),
      clientId: 'a',
    });
    const yjs = readEditorYjsState(peer.editor);
    const seen: boolean[] = [];
    const unsubscribe = yjs.subscribeProvider(() => {
      seen.push(yjs.connected());
    });

    runYjsUpdate(peer, (yjs) => {
      yjs.disconnect();
      yjs.connect();
    });
    unsubscribe();

    assert.deepEqual(seen, [false, true]);
  });

  it('uses provider doc and awareness as additive defaults', () => {
    const provider = new FakeProvider();
    seedProviderDoc(provider);
    const { cleanup, editor } = createProviderEditor(provider);
    const yjs = readEditorYjsState(editor);

    assert.equal(yjs.doc(), provider.doc);
    assert.equal(yjs.providerStatus(), 'disconnected');
    assert.equal(yjs.providerSynced(), true);
    assert.equal(yjs.connected(), false);

    runEditorYjsUpdate(editor, (yjs) => {
      yjs.sendSelection(selection(), { name: 'Provider peer' });
    });

    assert.deepEqual(provider.awareness.getLocalState()?.data, {
      name: 'Provider peer',
    });

    cleanup();
  });

  it('subscribes to provider status and provider-reported sync changes', () => {
    const provider = new FakeProvider();
    const { cleanup, editor } = createProviderEditor(provider);
    const yjs = readEditorYjsState(editor);
    const seen: [YjsProviderStatus | null, boolean | null][] = [];
    const unsubscribe = yjs.subscribeProvider(() => {
      seen.push([yjs.providerStatus(), yjs.providerSynced()]);
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
    const yjs = readEditorYjsState(editor);
    const seen: [YjsProviderStatus | null, boolean | null][] = [];
    const unsubscribe = yjs.subscribeProvider(() => {
      seen.push([yjs.providerStatus(), yjs.providerSynced()]);
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

  it('does not seed a provider-owned document before provider sync', () => {
    const provider = new FakeProvider();
    const { cleanup, editor } = createProviderEditor(provider);
    const root = provider.doc.get('@platejs/slate', Y.XmlElement);

    assert.equal(root.length, 0);

    applyProviderDoc(provider, [paragraph('remote')]);

    assert.equal(Editor.string(editor, [0]), 'remote');

    provider.emitSync(true);

    assert.equal(Editor.string(editor, [0]), 'remote');
    assert.equal(root.length, 1);

    cleanup();
  });

  it('does not reconcile an unsafe empty provider doc before sync', () => {
    const provider = new FakeProvider();
    const { cleanup, editor } = createProviderEditor(provider);
    const root = provider.doc.get('@platejs/slate', Y.XmlElement);

    runEditorYjsUpdate(editor, (yjs) => {
      yjs.reconcile();
    });

    assert.equal(Editor.string(editor, [0]), 'alpha');
    assert.equal(root.length, 0);

    cleanup();
  });

  it('does not save rejected pre-sync provider edits in Slate history', async () => {
    for (const order of ['history-first', 'yjs-first'] as const) {
      const provider = new FakeProvider();
      const { cleanup, editor } = createProviderEditorWithHistory(
        provider,
        order
      );

      insertFirstBlockTextAtEnd(editor);
      await Promise.resolve();

      assert.equal(Editor.string(editor, [0]), 'alpha', order);
      assert.equal(getHistoryUndoCount(editor), 0, order);

      undoEditorHistory(editor);

      assert.equal(Editor.string(editor, [0]), 'alpha', order);

      cleanup();
    }
  });

  it('exports local edits after remote content arrives before provider sync', () => {
    const provider = new FakeProvider();
    const { cleanup, editor } = createProviderEditor(provider);
    const root = provider.doc.get('@platejs/slate', Y.XmlElement);

    applyProviderDoc(provider, [paragraph('remote')]);

    assert.equal(Editor.string(editor, [0]), 'remote');
    assert.equal(root.length, 1);

    insertFirstBlockTextAtEnd(editor);

    assert.equal(Editor.string(editor, [0]), 'remote!');

    provider.emitSync(true);

    assert.equal(Editor.string(editor, [0]), 'remote!');
    assert.equal(root.length, 1);

    cleanup();
  });

  it('seeds empty synced provider docs by default', () => {
    const provider = new FakeProvider();
    const { cleanup, editor } = createProviderEditor(provider);
    const root = provider.doc.get('@platejs/slate', Y.XmlElement);

    assert.equal(root.length, 0);
    provider.emitSync(true);

    assert.equal(Editor.string(editor, [0]), 'alpha');
    assert.equal(root.length, 2);

    insertFirstBlockTextAtEnd(editor);

    assert.equal(Editor.string(editor, [0]), 'alpha!');
    assert.equal(root.length, 2);

    cleanup();
  });

  it('allows apps to opt out of seeding empty synced provider docs', () => {
    const provider = new FakeProvider();
    const { cleanup, editor } = createProviderEditor(provider, {
      seedProviderOnSync: false,
    });
    const root = provider.doc.get('@platejs/slate', Y.XmlElement);

    provider.emitSync(true);

    assert.equal(Editor.string(editor, [0]), 'alpha');
    assert.equal(root.length, 0);

    insertFirstBlockTextAtEnd(editor);

    assert.equal(Editor.string(editor, [0]), 'alpha');
    assert.equal(root.length, 0);

    cleanup();
  });

  it('rejects local edits before an empty provider doc syncs', () => {
    const provider = new FakeProvider();
    const { cleanup, editor } = createProviderEditor(provider);
    const root = provider.doc.get('@platejs/slate', Y.XmlElement);

    assert.equal(root.length, 0);
    assert.doesNotThrow(() => {
      insertFirstBlockTextAtEnd(editor);
    });
    assert.equal(Editor.string(editor, [0]), 'alpha');
    assert.equal(root.length, 0);

    provider.emitSync(true);

    assert.equal(Editor.string(editor, [0]), 'alpha');
    assert.equal(root.length, 2);

    insertFirstBlockTextAtEnd(editor);

    assert.equal(Editor.string(editor, [0]), 'alpha!');
    assert.equal(root.length, 2);

    cleanup();
  });

  it('keeps provider content authoritative after rejecting pre-sync edits', () => {
    const provider = new FakeProvider();
    const { cleanup, editor } = createProviderEditor(provider);
    const root = provider.doc.get('@platejs/slate', Y.XmlElement);

    insertFirstBlockTextAtEnd(editor);

    assert.equal(Editor.string(editor, [0]), 'alpha');
    assert.equal(root.length, 0);

    applyProviderDoc(provider, [paragraph('remote')]);

    assert.equal(Editor.string(editor, [0]), 'remote');
    assert.equal(root.length, 1);

    provider.emitSync(true);

    assert.equal(Editor.string(editor, [0]), 'remote');
    assert.equal(root.length, 1);

    cleanup();
  });

  it('does not seed provider docs with unknown sync state by default', () => {
    const provider = new FakeProvider({ exposeSynced: false });
    const { cleanup, editor } = createProviderEditor(provider);
    const root = provider.doc.get('@platejs/slate', Y.XmlElement);

    assert.equal(root.length, 0);

    insertFirstBlockTextAtEnd(editor);

    assert.equal(Editor.string(editor, [0]), 'alpha');
    assert.equal(root.length, 0);

    cleanup();
  });

  it('does not seed provider docs with unknown sync state when explicitly requested', () => {
    const provider = new FakeProvider({ exposeSynced: false });
    const { cleanup, editor } = createProviderEditor(provider, {
      seedProviderOnSync: true,
    });
    const root = provider.doc.get('@platejs/slate', Y.XmlElement);

    assert.equal(root.length, 0);

    insertFirstBlockTextAtEnd(editor);

    assert.equal(Editor.string(editor, [0]), 'alpha');
    assert.equal(root.length, 0);

    provider.emitSync(true);

    assert.equal(Editor.string(editor, [0]), 'alpha');
    assert.equal(root.length, 2);

    cleanup();
  });

  it('treats an explicit provider doc as sync-gated provider state', () => {
    const provider = new FakeProvider();
    const { cleanup, editor } = createProviderEditor(provider, {
      doc: provider.doc,
      seedProviderOnSync: true,
    });
    const root = provider.doc.get('@platejs/slate', Y.XmlElement);

    assert.equal(root.length, 0);

    insertFirstBlockTextAtEnd(editor);

    assert.equal(Editor.string(editor, [0]), 'alpha');
    assert.equal(root.length, 0);

    provider.emitSync(true);

    assert.equal(Editor.string(editor, [0]), 'alpha');
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
    const root = doc.get('@platejs/slate', Y.XmlElement);

    assert.equal(root.length, 0);

    insertFirstBlockTextAtEnd(editor);

    assert.equal(Editor.string(editor, [0]), 'alpha');
    assert.equal(root.length, 0);

    provider.emitSync(true);

    assert.equal(Editor.string(editor, [0]), 'alpha');
    assert.equal(root.length, 2);

    cleanup();
  });

  it('seeds empty provider docs on sync when explicitly requested', () => {
    const provider = new FakeProvider();
    const { cleanup, editor } = createProviderEditor(provider, {
      seedProviderOnSync: true,
    });
    const root = provider.doc.get('@platejs/slate', Y.XmlElement);

    assert.equal(root.length, 0);
    provider.emitSync(true);

    assert.equal(Editor.string(editor, [0]), 'alpha');
    assert.equal(root.length, 2);

    insertFirstBlockTextAtEnd(editor);

    assert.equal(Editor.string(editor, [0]), 'alpha!');

    runEditorYjsUpdate(editor, (yjs) => {
      yjs.undo();
    });

    assert.equal(Editor.string(editor, [0]), 'alpha');

    cleanup();
  });

  it('uses provider status events as the remote cursor visibility gate', () => {
    const provider = new FakeProvider({ status: 'connected' });
    seedProviderDoc(provider);
    const { cleanup, editor } = createProviderEditor(provider);
    const yjs = readEditorYjsState(editor);

    runEditorYjsUpdate(editor, (yjs) => {
      yjs.sendSelection(selection(), { name: 'Remote peer' });
    });
    provider.awareness.setRemoteState(88, {
      data: { name: 'Remote peer' },
      selection: provider.awareness.getLocalState()?.selection,
    });

    assert.equal(yjs.connected(), true);
    assert.equal(yjs.remoteCursors().length, 1);

    provider.emitStatus({ status: 'disconnected' });

    assert.equal(yjs.connected(), false);
    assert.deepEqual(yjs.remoteCursors(), []);

    provider.emitStatus('connected');

    assert.equal(yjs.connected(), true);
    assert.equal(yjs.remoteCursors().length, 1);

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

    runEditorYjsUpdate(peerA.editor, (yjs) => {
      yjs.sendSelection(range, { name: 'Ada' });
    });

    assert.deepEqual(readEditorYjsState(peerB.editor).remoteCursors(), [
      {
        clientId: 101,
        data: { name: 'Ada' },
        selection: range,
      },
    ]);

    runEditorYjsUpdate(peerA.editor, (yjs) => {
      yjs.disconnect();
    });

    assert.deepEqual(readEditorYjsState(peerB.editor).remoteCursors(), []);

    runEditorYjsUpdate(peerA.editor, (yjs) => {
      yjs.connect();
      yjs.sendSelection(range, { name: 'Ada' });
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
    const yjs = readEditorYjsState(editor);

    runEditorYjsUpdate(editor, (yjs) => {
      yjs.sendSelection(selection(), { name: 'Remote peer' });
    });
    provider.awareness.setRemoteState(88, {
      data: { name: 'Remote peer' },
      selection: provider.awareness.getLocalState()?.selection,
    });

    assert.equal(yjs.connected(), false);
    assert.deepEqual(yjs.remoteCursors(), []);

    runEditorYjsUpdate(editor, (yjs) => {
      yjs.connect();
    });

    assert.deepEqual(provider.calls, ['connect']);
    assert.equal(yjs.providerStatus(), 'disconnected');
    assert.equal(yjs.connected(), false);
    assert.deepEqual(yjs.remoteCursors(), []);

    provider.emitStatus('connected');

    assert.equal(yjs.connected(), true);
    assert.equal(yjs.remoteCursors().length, 1);

    cleanup();
  });

  it('reads imperative provider status after lifecycle calls without events', () => {
    const provider = new StatusOnlyProvider();
    seedProviderDoc(provider);
    const { cleanup, editor } = createProviderEditor(provider);
    const yjs = readEditorYjsState(editor);

    assert.equal(yjs.providerStatus(), 'disconnected');
    assert.equal(yjs.connected(), false);

    runEditorYjsUpdate(editor, (yjs) => {
      yjs.connect();
    });

    assert.deepEqual(provider.calls, ['connect']);
    assert.equal(yjs.providerStatus(), 'connected');
    assert.equal(yjs.connected(), true);

    runEditorYjsUpdate(editor, (yjs) => {
      yjs.disconnect();
    });

    assert.deepEqual(provider.calls, ['connect', 'disconnect']);
    assert.equal(yjs.providerStatus(), 'disconnected');
    assert.equal(yjs.connected(), false);

    cleanup();
  });

  it('keeps local disconnect authoritative while provider status is stale', () => {
    const provider = new FireAndForgetDisconnectProvider({
      status: 'connected',
    });
    seedProviderDoc(provider);
    const { cleanup, editor } = createProviderEditor(provider);
    const yjs = readEditorYjsState(editor);

    assert.equal(yjs.connected(), true);

    runEditorYjsUpdate(editor, (yjs) => {
      yjs.disconnect();
    });

    assert.deepEqual(provider.calls, ['disconnect']);
    assert.equal(yjs.providerStatus(), 'connected');
    assert.equal(yjs.connected(), false);

    provider.emitStatus('connected');

    assert.equal(yjs.providerStatus(), 'connected');
    assert.equal(yjs.connected(), false);

    runEditorYjsUpdate(editor, (yjs) => {
      yjs.connect();
    });

    assert.deepEqual(provider.calls, ['disconnect', 'connect']);
    assert.equal(yjs.providerStatus(), 'connected');
    assert.equal(yjs.connected(), true);

    cleanup();
  });

  it('delegates reconnect to optional provider transport methods in order', () => {
    const provider = new FakeProvider();
    const { cleanup, editor } = createProviderEditor(provider);

    runEditorYjsUpdate(editor, (yjs) => {
      yjs.reconnect();
    });

    assert.deepEqual(provider.calls, ['disconnect', 'connect']);
    assert.equal(readEditorYjsState(editor).connected(), true);
    assert.equal(readEditorYjsState(editor).providerStatus(), 'connected');

    cleanup();
  });

  it('waits for async provider disconnect before reconnecting', async () => {
    const provider = new AsyncDisconnectProvider();
    const { cleanup, editor } = createProviderEditor(provider);

    runEditorYjsUpdate(editor, (yjs) => {
      yjs.reconnect();
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

    runEditorYjsUpdate(editor, (yjs) => {
      yjs.reconnect();
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

    runEditorYjsUpdate(editor, (yjs) => {
      yjs.pause();
      yjs.disconnect();
    });

    const yjs = readEditorYjsState(editor);

    assert.equal(yjs.paused(), true);
    assert.equal(yjs.connected(), false);
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

    runEditorYjsUpdate(editor, (yjs) => {
      yjs.sendSelection(selection(), { name: 'Provider peer' });
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

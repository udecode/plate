import assert from 'node:assert/strict';

import * as Y from 'yjs';

import {
  getSnapshot as editorGetSnapshot,
  replace as editorReplace,
  string as editorString,
} from '#platejs-test-internal';

import {
  createEditor,
  defineEditorSchema,
  type Descendant,
  type EditorDocumentValue,
  type Selection,
  type Editor as BasePlateEditor,
  schema,
} from '../../../src/core';
import type { HistoryStateApi, HistoryTxApi } from '../../../src/history';
import type { YjsNode } from '../../../src/yjs/core/attributes';
import type { YjsRemoteCursorCacheMetrics } from '../../../src/yjs/core/awareness-adapter';
import { getActiveYjsController } from '../../../src/yjs/core/controller-registry';
import {
  getYjsNode,
  readPliteValueFromYjs,
} from '../../../src/yjs/core/document';
import {
  getEditorYjsState,
  getEditorYjsTx,
} from '../../../src/yjs/core/editor-yjs';
import { yjs } from '../../../src/yjs/core/extension';
import type {
  YjsAwarenessLike,
  YjsCursorDataSchema,
  YjsProviderLike,
  YjsProviderStatus,
  YjsRemoteCursor,
  YjsRemoteCursorData,
  YjsState,
  YjsTraceEntry,
  YjsTx,
} from '../../../src/yjs/core/types';

export { FakeAwareness, FakeProvider } from './provider';

type TestEditor = BasePlateEditor;

export type Peer<TEditor extends TestEditor = TestEditor> = {
  readonly cleanup: () => void;
  readonly doc: Y.Doc;
  readonly editor: TEditor;
};

export type CreateYjsPeerOptions = {
  awareness?: YjsAwarenessLike;
  children: readonly Descendant[];
  clientId: string;
  cursorData?: YjsCursorDataSchema;
  numericClientId?: number;
  provider?: YjsProviderLike;
  roots?: Readonly<Record<string, readonly Descendant[]>>;
  seedUpdate?: Uint8Array;
};

export const paragraph = (
  text: string,
  attributes: Readonly<Record<string, unknown>> = {}
): Descendant => ({
  ...attributes,
  children: [{ text }],
  type: 'paragraph',
});

const YjsTestOpenSchema = defineEditorSchema('schema:yjs-test-open', {
  elements: {
    paragraph: { content: schema.content.text() },
  },
  root: schema.content.not(schema.content.text()),
  roots: {
    header: schema.content.not(schema.content.text()),
  },
  unknown: 'preserve',
});

export const createYjsTestEditor = (
  initialValue: EditorDocumentValue
): TestEditor =>
  createEditor({
    extensions: [YjsTestOpenSchema],
    initialValue,
  });

const isYjsNode = (value: unknown): value is YjsNode =>
  value instanceof Y.XmlElement || value instanceof Y.XmlText;

const getRawYjsChildren = (node: Y.XmlElement): YjsNode[] =>
  node.toArray().filter(isYjsNode);

export const createYjsPeerWithEditor = <TEditor extends TestEditor>(
  editor: TEditor,
  {
    children,
    awareness,
    clientId,
    cursorData,
    numericClientId,
    provider,
    roots,
    seedUpdate,
  }: CreateYjsPeerOptions
): Peer<TEditor> => {
  editorReplace(editor, {
    children: [...children],
    ...(roots ? { roots } : {}),
    selection: null,
  });
  editor.read.schema.assertDocument(editor.read.value());

  const doc = new Y.Doc();

  if (numericClientId !== undefined) {
    doc.clientID = numericClientId;
  }

  if (seedUpdate !== undefined) {
    Y.applyUpdate(doc, seedUpdate);
  }

  const cleanup = editor.install(
    yjs({
      awareness,
      clientId,
      ...(cursorData === undefined ? {} : { cursorData }),
      doc,
      provider,
      rootName: 'plitejs',
    })
  );

  return { cleanup, doc, editor };
};

export const createYjsPeer = (options: CreateYjsPeerOptions): Peer =>
  createYjsPeerWithEditor(
    createYjsTestEditor({
      children: options.children,
      ...(options.roots ? { roots: options.roots } : {}),
    }),
    options
  );

export const createYjsHistoryPeer = (options: CreateYjsPeerOptions): Peer =>
  createYjsPeer(options);

export const createSeededYjsPeers = ({
  children,
  clientIds,
  numericClientIds,
}: {
  children: readonly Descendant[];
  clientIds: readonly string[];
  numericClientIds?: Readonly<Record<string, number>>;
}): Peer[] => {
  const [firstClientId, ...remainingClientIds] = clientIds;

  if (firstClientId === undefined) {
    return [];
  }

  const firstPeer = createYjsPeer({
    children,
    clientId: firstClientId,
    numericClientId: numericClientIds?.[firstClientId],
  });
  const seedUpdate = Y.encodeStateAsUpdate(firstPeer.doc);

  return [
    firstPeer,
    ...remainingClientIds.map((clientId) =>
      createYjsPeer({
        children,
        clientId,
        numericClientId: numericClientIds?.[clientId],
        seedUpdate,
      })
    ),
  ];
};

export const createSeededYjsHistoryPeers = ({
  children,
  clientIds,
  createEditor: createHistoryEditor,
  numericClientIds,
  roots,
}: {
  children: readonly Descendant[];
  clientIds: readonly string[];
  createEditor?: () => TestEditor;
  numericClientIds?: Readonly<Record<string, number>>;
  roots?: Readonly<Record<string, readonly Descendant[]>>;
}) => {
  const [firstClientId, ...remainingClientIds] = clientIds;

  if (firstClientId === undefined) {
    return [];
  }

  const createPeer = (clientId: string, seedUpdate?: Uint8Array) =>
    createYjsPeerWithEditor(
      createHistoryEditor?.() ??
        createYjsTestEditor({
          children,
          ...(roots ? { roots } : {}),
        }),
      {
        children,
        clientId,
        numericClientId: numericClientIds?.[clientId],
        roots,
        seedUpdate,
      }
    );
  const firstPeer = createPeer(firstClientId);
  const seedUpdate = Y.encodeStateAsUpdate(firstPeer.doc);

  return [
    firstPeer,
    ...remainingClientIds.map((clientId) => createPeer(clientId, seedUpdate)),
  ];
};

export const readPeerChildren = (peer: Peer): readonly Descendant[] =>
  editorGetSnapshot(peer.editor).children;

export const readPeerSelection = (peer: Peer): Selection =>
  editorGetSnapshot(peer.editor).selection;

export const getPeerTopLevelTexts = (peer: Peer): string[] =>
  readPeerChildren(peer).map((_, index) => editorString(peer.editor, [index]));

export const getPeerTopLevelTypes = (peer: Peer): string[] =>
  readPeerChildren(peer).map((node) =>
    'type' in node ? String(node.type) : 'text'
  );

export const getYjsNodeAt = (peer: Peer, path: readonly number[]): YjsNode => {
  let current: YjsNode = getYjsRoot(peer);

  for (const index of path) {
    if (current instanceof Y.XmlText) {
      throw new Error(`Cannot descend into Y.XmlText at ${path.join('.')}`);
    }

    const child: YjsNode | undefined = getRawYjsChildren(current)[index];

    if (child === undefined) {
      throw new Error(`No Yjs node at ${path.join('.')}`);
    }

    current = child;
  }

  return current;
};

export const getVisibleYjsNodeAt = (
  peer: Peer,
  path: readonly number[]
): YjsNode => getYjsNode(getYjsRoot(peer), path);

export const readEditorYjsState = (editor: TestEditor): YjsState =>
  editor.read(getEditorYjsState);

export const getYjsState = (peer: Peer): YjsState =>
  readEditorYjsState(peer.editor);

export const getYjsRoot = (peer: Peer): Y.XmlElement =>
  getYjsState(peer).root();

export const getYjsTrace = (peer: Peer): readonly YjsTraceEntry[] =>
  getYjsState(peer).trace();

export const assertCanonicalYjsTrace = (
  peer: Peer,
  fallback: YjsTraceEntry['fallback'] | null = null
): void => {
  const trace = getYjsTrace(peer);

  assert.ok(trace.length > 0, 'expected a canonical Yjs change trace');

  for (const entry of trace) {
    assert.equal(entry.mode, 'canonical-change');
  }

  if (fallback === null) {
    assert.equal(
      trace.some((entry) => entry.fallback !== undefined),
      false
    );
  } else {
    assert.equal(
      trace.some((entry) => entry.fallback === fallback),
      true
    );
  }
};

export const getYjsRemoteCursors = (
  peer: Peer
): ReadonlyArray<YjsRemoteCursor<YjsRemoteCursorData>> =>
  getYjsState(peer).remoteCursors();

const getYjsCursorCache = (peer: Peer) => {
  const controller = getActiveYjsController(peer.editor);

  assert.ok(controller, 'expected an active Yjs controller');

  return controller.cursorCache();
};

export const getYjsRemoteCursorIds = (peer: Peer): readonly number[] =>
  getYjsCursorCache(peer).remoteCursorIds();

export const getYjsRemoteCursorCacheMetrics = (
  peer: Peer
): YjsRemoteCursorCacheMetrics => getYjsCursorCache(peer).getMetrics();

export const subscribeYjsRemoteCursor = (
  peer: Peer,
  clientId: number,
  listener: () => void
): (() => void) => getYjsCursorCache(peer).subscribeCursor(clientId, listener);

export const getYjsAwarenessRevision = (peer: Peer): number =>
  getYjsState(peer).awarenessRevision();

export const getYjsProviderStatus = (peer: Peer): YjsProviderStatus | null =>
  getYjsState(peer).providerStatus();

export const getYjsProviderSynced = (peer: Peer): boolean | null =>
  getYjsState(peer).providerSynced();

export const isYjsPeerConnected = (peer: Peer): boolean =>
  getYjsState(peer).connected();

export const subscribeYjsAwareness = (
  peer: Peer,
  listener: () => void
): (() => void) => getYjsState(peer).subscribeAwareness(listener);

export const readPeerPliteValue = (peer: Peer): Descendant[] =>
  readPliteValueFromYjs(getYjsRoot(peer));

export const runEditorYjsUpdate = (
  editor: TestEditor,
  fn: (tx: YjsTx) => void
): void => {
  editor.update((tx) => {
    fn(getEditorYjsTx(tx));
  });
};

export const runYjsUpdate = (peer: Peer, fn: (tx: YjsTx) => void): void => {
  runEditorYjsUpdate(peer.editor, fn);
};

export const disconnectYjsPeer = (peer: Peer): void => {
  runYjsUpdate(peer, (innerYjs) => innerYjs.disconnect());
};

export const connectYjsPeer = (peer: Peer): void => {
  runYjsUpdate(peer, (innerYjs2) => innerYjs2.connect());
};

export const clearYjsTrace = (peer: Peer): void => {
  runYjsUpdate(peer, (innerYjs3) => innerYjs3.clearTrace());
};

export const reconcileYjsPeer = (peer: Peer): void => {
  runYjsUpdate(peer, (innerYjs4) => innerYjs4.reconcile());
};

export const disconnectAndClearYjsTrace = (peer: Peer): void => {
  disconnectYjsPeer(peer);
  clearYjsTrace(peer);
};

export const getHistoryUndoCount = (editor: TestEditor): number =>
  editor.read(
    (state) =>
      (
        state as typeof state & {
          readonly history: HistoryStateApi;
        }
      ).history.undos().length
  );

export const getHistoryRedoCount = (editor: TestEditor): number =>
  editor.read(
    (state) =>
      (
        state as typeof state & {
          readonly history: HistoryStateApi;
        }
      ).history.redos().length
  );

export const undoEditorHistory = (editor: TestEditor): void => {
  editor.update((tx) => {
    (
      tx as typeof tx & {
        readonly history: HistoryTxApi;
      }
    ).history.undo();
  });
};

export const redoEditorHistory = (editor: TestEditor): void => {
  editor.update((tx) => {
    (
      tx as typeof tx & {
        readonly history: HistoryTxApi;
      }
    ).history.redo();
  });
};

export const undoHistoryPeer = (peer: Peer): void => {
  undoEditorHistory(peer.editor);
};

export const redoHistoryPeer = (peer: Peer): void => {
  redoEditorHistory(peer.editor);
};

export const syncConnectedPeers = (peers: readonly Peer[]): void => {
  for (const source of peers) {
    if (!isYjsPeerConnected(source)) {
      continue;
    }

    for (const target of peers) {
      if (source === target || !isYjsPeerConnected(target)) {
        continue;
      }

      const update = Y.encodeStateAsUpdate(
        source.doc,
        Y.encodeStateVector(target.doc)
      );

      Y.applyUpdate(target.doc, update, source);
    }
  }
};

export const connectYjsPeerAndSync = (
  peer: Peer,
  peers: readonly Peer[]
): void => {
  connectYjsPeer(peer);
  syncConnectedPeers(peers);
};

export const undoHistoryPeerAndSync = (
  peer: Peer,
  peers: readonly Peer[]
): void => {
  undoHistoryPeer(peer);
  syncConnectedPeers(peers);
};

export const redoHistoryPeerAndSync = (
  peer: Peer,
  peers: readonly Peer[]
): void => {
  redoHistoryPeer(peer);
  syncConnectedPeers(peers);
};

export const assertPeerTexts = (
  peers: readonly Peer[],
  expected: readonly string[]
): void => {
  for (const [index, peer] of peers.entries()) {
    assert.deepEqual(getPeerTopLevelTexts(peer), expected, `peer ${index}`);
  }
};

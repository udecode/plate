import assert from 'node:assert/strict';
import {
  createEditor,
  type Descendant,
  defineEditorExtension,
  type EditorCommitContext,
  type EditorExtensionSetupOutput,
  type Operation,
  type Range,
  type Selection,
  type Editor as BasePlateEditor,
} from '@platejs/plite';
import { Editor } from '@platejs/plite/internal';
import type {} from '@platejs/plite-history';
import * as Y from 'yjs';

import { createYjsExtension } from '../../src';
import type { YjsNode } from '../../src/core/attributes';
import { getYjsNode, readPliteValueFromYjs } from '../../src/core/document';
import { getEditorYjsState, getEditorYjsTx } from '../../src/core/editor-yjs';
import type {
  YjsAwarenessLike,
  YjsProviderLike,
  YjsProviderStatus,
  YjsRemoteCursor,
  YjsRemoteCursorData,
  YjsState,
  YjsTraceEntry,
  YjsTx,
} from '../../src/core/types';

export { FakeAwareness, FakeProvider } from './provider';

type TestEditorDomApi = {
  readonly isFocused?: () => boolean;
  readonly resolveRangeRect?: (range: Range) => unknown;
};

type TestEditor = BasePlateEditor & {
  api?: {
    dom?: TestEditorDomApi;
  };
};

export type Peer = {
  readonly cleanup: () => void;
  readonly doc: Y.Doc;
  readonly editor: TestEditor;
};

type OperationTypeRecorderOptions = {
  readonly name: string;
  readonly shouldRecord?: (context: EditorCommitContext<TestEditor>) => boolean;
};

export const paragraph = (
  text: string,
  attributes: Readonly<Record<string, unknown>> = {}
): Descendant => ({
  ...attributes,
  children: [{ text }],
  type: 'paragraph',
});

const isYjsNode = (value: unknown): value is YjsNode =>
  value instanceof Y.XmlElement || value instanceof Y.XmlText;

const getRawYjsChildren = (node: Y.XmlElement): YjsNode[] =>
  node.toArray().filter(isYjsNode);

export const createYjsPeer = ({
  children,
  awareness,
  clientId,
  numericClientId,
  provider,
  seedUpdate,
}: {
  awareness?: YjsAwarenessLike;
  children: readonly Descendant[];
  clientId: string;
  numericClientId?: number;
  provider?: YjsProviderLike;
  seedUpdate?: Uint8Array;
}): Peer => {
  const editor: TestEditor = createEditor();

  Editor.replace(editor, {
    children: [...children],
    marks: null,
    selection: null,
  });

  const doc = new Y.Doc();

  if (numericClientId !== undefined) {
    doc.clientID = numericClientId;
  }

  if (seedUpdate !== undefined) {
    Y.applyUpdate(doc, seedUpdate);
  }

  const cleanup = editor.extend(
    createYjsExtension({
      awareness,
      clientId,
      doc,
      provider,
      rootName: '@platejs/plite',
    })
  );

  return { cleanup, doc, editor };
};

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

export const readPeerChildren = (peer: Peer): readonly Descendant[] =>
  Editor.getSnapshot(peer.editor).children;

export const readPeerSelection = (peer: Peer): Selection =>
  Editor.getSnapshot(peer.editor).selection;

export const getPeerTopLevelTexts = (peer: Peer): string[] =>
  readPeerChildren(peer).map((_, index) => Editor.string(peer.editor, [index]));

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

    const child = getRawYjsChildren(current)[index];

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

export const getYjsRemoteCursors = <
  TCursorData extends YjsRemoteCursorData = YjsRemoteCursorData,
>(
  peer: Peer
): readonly YjsRemoteCursor<TCursorData>[] =>
  getYjsState(peer).remoteCursors<TCursorData>();

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

export const recordEditorOperationTypes = (
  editor: TestEditor,
  { name, shouldRecord }: OperationTypeRecorderOptions
): Operation['type'][] => {
  const operationTypes: Operation['type'][] = [];

  editor.extend(
    defineEditorExtension({
      name,
      setup(): EditorExtensionSetupOutput<TestEditor> {
        return {
          onCommit(context): void {
            if (shouldRecord && !shouldRecord(context)) {
              return;
            }

            operationTypes.push(
              ...context.commit.operations.map((operation) => operation.type)
            );
          },
        };
      },
    })
  );

  return operationTypes;
};

export const recordOperationTypes = (
  peer: Peer,
  options: OperationTypeRecorderOptions
): Operation['type'][] => recordEditorOperationTypes(peer.editor, options);

export const disconnectYjsPeer = (peer: Peer): void => {
  runYjsUpdate(peer, (yjs) => yjs.disconnect());
};

export const connectYjsPeer = (peer: Peer): void => {
  runYjsUpdate(peer, (yjs) => yjs.connect());
};

export const undoYjsPeer = (peer: Peer): void => {
  runYjsUpdate(peer, (yjs) => yjs.undo());
};

export const redoYjsPeer = (peer: Peer): void => {
  runYjsUpdate(peer, (yjs) => yjs.redo());
};

export const clearYjsTrace = (peer: Peer): void => {
  runYjsUpdate(peer, (yjs) => yjs.clearTrace());
};

export const reconcileYjsPeer = (peer: Peer): void => {
  runYjsUpdate(peer, (yjs) => yjs.reconcile());
};

export const disconnectAndClearYjsTrace = (peer: Peer): void => {
  disconnectYjsPeer(peer);
  clearYjsTrace(peer);
};

export const getHistoryUndoCount = (editor: TestEditor): number =>
  editor.read((state) => state.history.undos().length);

export const undoEditorHistory = (editor: TestEditor): void => {
  editor.update((tx) => {
    tx.history.undo();
  });
};

export const setEditorDomApi = (
  editor: TestEditor,
  dom: TestEditorDomApi
): void => {
  editor.api = {
    ...editor.api,
    dom: {
      ...editor.api?.dom,
      ...dom,
    },
  };
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

export const undoYjsPeerAndSync = (
  peer: Peer,
  peers: readonly Peer[]
): void => {
  undoYjsPeer(peer);
  syncConnectedPeers(peers);
};

export const redoYjsPeerAndSync = (
  peer: Peer,
  peers: readonly Peer[]
): void => {
  redoYjsPeer(peer);
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

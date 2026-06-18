import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  createEditor,
  type Descendant,
  type Operation,
  type Range,
} from '@platejs/slate';
import { Editor } from '@platejs/slate/internal';

import {
  assertPeerTexts,
  connectYjsPeerAndSync,
  createSeededYjsPeers,
  createYjsPeer,
  disconnectAndClearYjsTrace,
  disconnectYjsPeer,
  getPeerTopLevelTexts,
  getVisibleYjsNodeAt,
  getYjsTrace,
  type Peer,
  paragraph,
  recordEditorOperationTypes,
  redoYjsPeerAndSync,
  syncConnectedPeers,
  undoYjsPeerAndSync,
} from './support/collaboration';

const clientIds = {
  a: 1,
  b: 2,
  c: 3,
} as const;

type ClientId = keyof typeof clientIds;

const initialValue = (): Descendant[] => [
  paragraph('alpha'),
  paragraph('beta'),
  paragraph('gamma'),
];

const createPeer = (clientId: ClientId): Peer =>
  createYjsPeer({
    children: initialValue(),
    clientId,
    numericClientId: clientIds[clientId],
  });

const createPeers = (ids: readonly ClientId[]): Peer[] =>
  createSeededYjsPeers({
    children: initialValue(),
    clientIds: ids,
    numericClientIds: clientIds,
  });

const collectDeleteFragmentOperations = (
  selection: Range
): Operation['type'][] => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: initialValue(),
    marks: null,
    selection: null,
  });

  const operations = recordEditorOperationTypes(editor, {
    name: 'delete-fragment-operation-capture',
  });

  editor.update((tx) => {
    tx.selection.set(selection);
  });

  operations.length = 0;

  editor.update((tx) => {
    tx.fragment.delete();
  });

  return operations;
};

const selectAndDeleteFragment = (peer: Peer, selection: Range): void => {
  peer.editor.update((tx) => {
    tx.selection.set(selection);
  });

  peer.editor.update((tx) => {
    tx.fragment.delete();
  });
};

const deleteBetaMiddle = (peer: Peer): void => {
  selectAndDeleteFragment(peer, {
    anchor: { path: [1, 0], offset: 1 },
    focus: { path: [1, 0], offset: 3 },
  });
};

const deleteFromAlphaIntoGamma = (peer: Peer): void => {
  selectAndDeleteFragment(peer, {
    anchor: { path: [0, 0], offset: 2 },
    focus: { path: [2, 0], offset: 2 },
  });
};

const appendRemoteGamma = (peer: Peer): void => {
  peer.editor.update((tx) => {
    tx.text.insert('!', { at: { path: [2, 0], offset: 'gamma'.length } });
  });
};

describe('@platejs/yjs delete_fragment collaboration contract', () => {
  it('characterizes public deleteFragment inside one text as remove_text', () => {
    assert.deepEqual(
      collectDeleteFragmentOperations({
        anchor: { path: [1, 0], offset: 1 },
        focus: { path: [1, 0], offset: 3 },
      }),
      ['remove_text', 'set_selection']
    );
  });

  it('characterizes public deleteFragment across blocks as text removals, node removal, and merges', () => {
    assert.deepEqual(
      collectDeleteFragmentOperations({
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [2, 0], offset: 2 },
      }),
      [
        'remove_text',
        'remove_node',
        'remove_text',
        'merge_node',
        'merge_node',
        'set_selection',
      ]
    );
  });

  it('applies local offline deleteFragment without replacing the edited Yjs text node', () => {
    const peer = createPeer('b');
    const text = getVisibleYjsNodeAt(peer, [1, 0]);

    disconnectAndClearYjsTrace(peer);
    deleteBetaMiddle(peer);

    assert.deepEqual(getPeerTopLevelTexts(peer), ['alpha', 'ba', 'gamma']);
    assert.equal(getVisibleYjsNodeAt(peer, [1, 0]), text);
    assert.deepEqual(getYjsTrace(peer), [
      { mode: 'operation', operationType: 'remove_text' },
    ]);
  });

  it('preserves concurrent remote text inside the end block when an offline deleteFragment reconnects', () => {
    const peers = createPeers(['a', 'b', 'c']);
    const [a, b] = peers;

    disconnectYjsPeer(b);
    deleteFromAlphaIntoGamma(b);
    appendRemoteGamma(a);
    syncConnectedPeers(peers);

    assert.deepEqual(getPeerTopLevelTexts(a), ['alpha', 'beta', 'gamma!']);
    assert.deepEqual(getPeerTopLevelTexts(b), ['almma']);

    connectYjsPeerAndSync(b, peers);

    assertPeerTexts(peers, ['almma!']);
  });

  it('undoes and redoes only the local cross-block deleteFragment intent after reconnect', () => {
    const peers = createPeers(['a', 'b', 'c']);
    const [a, b] = peers;

    disconnectYjsPeer(b);
    deleteFromAlphaIntoGamma(b);
    appendRemoteGamma(a);
    syncConnectedPeers(peers);

    connectYjsPeerAndSync(b, peers);
    assertPeerTexts(peers, ['almma!']);

    undoYjsPeerAndSync(b, peers);
    assertPeerTexts(peers, ['alpha', 'beta', 'gamma!']);

    redoYjsPeerAndSync(b, peers);
    assertPeerTexts(peers, ['almma!']);
  });
});

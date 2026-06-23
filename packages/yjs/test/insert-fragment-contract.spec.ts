import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Descendant, Operation } from '@platejs/plite';

import {
  assertPeerTexts,
  connectYjsPeerAndSync,
  createSeededYjsPeers,
  createYjsPeer,
  disconnectAndClearYjsTrace,
  disconnectYjsPeer,
  getPeerTopLevelTexts,
  getYjsNodeAt,
  getYjsTrace,
  type Peer,
  paragraph,
  recordOperationTypes,
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

const initialValue = (): Descendant[] => [paragraph('alpha')];

const createPeer = (clientId: ClientId, seedUpdate?: Uint8Array): Peer =>
  createYjsPeer({
    children: initialValue(),
    clientId,
    numericClientId: clientIds[clientId],
    seedUpdate,
  });

const createPeers = (ids: readonly ClientId[]): Peer[] =>
  createSeededYjsPeers({
    children: initialValue(),
    clientIds: ids,
    numericClientIds: clientIds,
  });

const insertFragment = (peer: Peer): void => {
  peer.editor.update((tx) => {
    tx.selection.set({
      anchor: { path: [0, 0], offset: 'alpha'.length },
      focus: { path: [0, 0], offset: 'alpha'.length },
    });
  });
  peer.editor.update((tx) => {
    tx.fragment.insert([{ text: 'Lin fragment' }]);
  });
};

const appendRemoteText = (peer: Peer): void => {
  peer.editor.update((tx) => {
    tx.text.insert(' Ada', { at: { path: [0, 0], offset: 'alpha'.length } });
  });
};

const collectInsertFragmentOperations = (): Operation['type'][] => {
  const peer = createPeer('b');
  const operations = recordOperationTypes(peer, {
    name: 'insert-fragment-operation-recorder',
    shouldRecord: ({ commit }) =>
      commit.command?.type === 'insert_fragment' ||
      commit.operations.some((operation) =>
        ['insert_node', 'merge_node'].includes(operation.type)
      ),
  });
  insertFragment(peer);

  return operations;
};

describe('@platejs/yjs insert_fragment collaboration contract', () => {
  it('characterizes public insert_fragment as insert_node then text merge fallback', () => {
    assert.deepEqual(collectInsertFragmentOperations(), [
      'insert_node',
      'set_selection',
      'merge_node',
    ]);
  });

  it('applies local offline public insert_fragment without replacing the original Yjs text node', () => {
    const peer = createPeer('b');
    const text = getYjsNodeAt(peer, [0, 0]);

    disconnectAndClearYjsTrace(peer);
    insertFragment(peer);

    assert.deepEqual(getPeerTopLevelTexts(peer), ['alphaLin fragment']);
    assert.equal(getYjsNodeAt(peer, [0, 0]), text);
    assert.deepEqual(getYjsTrace(peer), [
      { mode: 'operation', operationType: 'insert_node' },
      {
        fallback: 'text-merge-preserve-yjs-boundary',
        mode: 'traceable-fallback',
        operationType: 'merge_node',
      },
    ]);
  });

  it('preserves concurrent remote text when an offline insert_fragment reconnects', () => {
    const peers = createPeers(['a', 'b', 'c']);
    const [a, b] = peers;

    disconnectYjsPeer(b);
    insertFragment(b);
    appendRemoteText(a);
    syncConnectedPeers(peers);

    assert.deepEqual(getPeerTopLevelTexts(a), ['alpha Ada']);
    assert.deepEqual(getPeerTopLevelTexts(b), ['alphaLin fragment']);

    connectYjsPeerAndSync(b, peers);

    assertPeerTexts(peers, ['alpha AdaLin fragment']);
  });

  it('recovers insert_fragment convergence through real Yjs updates after reconnect', () => {
    const peers = createPeers(['a', 'b', 'c']);
    const [, b] = peers;

    disconnectYjsPeer(b);
    insertFragment(b);
    connectYjsPeerAndSync(b, peers);

    assertPeerTexts(peers, ['alphaLin fragment']);
  });

  it('broadcasts remove_text at the end of a preserved insert_fragment text boundary', () => {
    const peers = createPeers(['a', 'b', 'c']);
    const [, b] = peers;

    insertFragment(b);
    syncConnectedPeers(peers);
    assertPeerTexts(peers, ['alphaLin fragment']);

    const [text] = getPeerTopLevelTexts(b);
    assert.equal(typeof text, 'string');

    b.editor.update((tx) => {
      tx.selection.set({
        anchor: { path: [0, 0], offset: text.length },
        focus: { path: [0, 0], offset: text.length },
      });
      tx.text.deleteBackward({ unit: 'character' });
    });
    syncConnectedPeers(peers);

    assertPeerTexts(peers, ['alphaLin fragmen']);
  });

  it('undoes and redoes only the local insert_fragment intent after reconnect', () => {
    const peers = createPeers(['a', 'b', 'c']);
    const [a, b] = peers;

    disconnectYjsPeer(b);
    insertFragment(b);
    appendRemoteText(a);
    syncConnectedPeers(peers);

    connectYjsPeerAndSync(b, peers);
    assertPeerTexts(peers, ['alpha AdaLin fragment']);

    undoYjsPeerAndSync(b, peers);
    assertPeerTexts(peers, ['alpha Ada']);

    redoYjsPeerAndSync(b, peers);
    assertPeerTexts(peers, ['alpha AdaLin fragment']);
  });
});

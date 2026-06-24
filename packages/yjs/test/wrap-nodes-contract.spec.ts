import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Descendant, Operation } from '@platejs/plite';
import {
  assertPeerTexts,
  clearYjsTrace,
  connectYjsPeerAndSync,
  createSeededYjsPeers,
  createYjsPeer,
  disconnectAndClearYjsTrace,
  disconnectYjsPeer,
  getPeerTopLevelTexts,
  getPeerTopLevelTypes,
  getYjsNodeAt,
  getYjsTrace,
  type Peer,
  paragraph,
  readPeerChildren,
  readPeerSelection,
  readPeerPliteValue,
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

const wrapFirstBlock = (peer: Peer): void => {
  peer.editor.update((tx) => {
    tx.nodes.wrap({ children: [], type: 'quote' }, { at: [0] });
  });
};

const appendRemoteText = (peer: Peer): void => {
  peer.editor.update((tx) => {
    tx.text.insert('!', { at: { path: [0, 0], offset: 'alpha'.length } });
  });
};

const collectWrapOperations = (): Operation['type'][] => {
  const peer = createPeer('b');
  const operations = recordOperationTypes(peer, {
    name: 'wrap-operation-recorder',
  });
  wrapFirstBlock(peer);

  return operations;
};

describe('@platejs/yjs wrapNodes collaboration contract', () => {
  it('characterizes public wrapNodes as insert_node then move_node', () => {
    assert.deepEqual(collectWrapOperations(), ['insert_node', 'move_node']);
  });

  it('applies local offline public wrap without replacing the original Yjs node', () => {
    const peer = createPeer('b');
    const original = getYjsNodeAt(peer, [0]);

    disconnectAndClearYjsTrace(peer);
    wrapFirstBlock(peer);

    assert.deepEqual(getPeerTopLevelTexts(peer), ['alpha']);
    assert.deepEqual(getPeerTopLevelTypes(peer), ['quote']);
    assert.equal(getYjsNodeAt(peer, [1]), original);
    assert.deepEqual(getYjsTrace(peer), [
      { mode: 'operation', operationType: 'insert_node' },
      {
        fallback: 'virtual-move-ref',
        mode: 'traceable-fallback',
        operationType: 'move_node',
      },
    ]);
  });

  it('preserves concurrent remote text when an offline wrap reconnects', () => {
    const peers = createPeers(['a', 'b', 'c']);
    const [a, b] = peers;

    disconnectYjsPeer(b);
    wrapFirstBlock(b);
    appendRemoteText(a);
    syncConnectedPeers(peers);

    assert.deepEqual(getPeerTopLevelTexts(a), ['alpha!']);
    assert.deepEqual(getPeerTopLevelTypes(a), ['paragraph']);
    assert.deepEqual(getPeerTopLevelTexts(b), ['alpha']);
    assert.deepEqual(getPeerTopLevelTypes(b), ['quote']);

    connectYjsPeerAndSync(b, peers);

    assertPeerTexts(peers, ['alpha!']);
    assert.deepEqual(getPeerTopLevelTypes(a), ['quote']);
    assert.deepEqual(getPeerTopLevelTypes(b), ['quote']);
  });

  it('splits text inside a virtual wrapped block without a root snapshot fallback', () => {
    const peer = createPeer('b');

    wrapFirstBlock(peer);
    clearYjsTrace(peer);

    peer.editor.update((tx) => {
      tx.selection.set({
        anchor: { path: [0, 0, 0], offset: 2 },
        focus: { path: [0, 0, 0], offset: 2 },
      });
      tx.break.insert();
    });

    assert.deepEqual(readPeerChildren(peer), [
      {
        children: [paragraph('al'), paragraph('pha')],
        type: 'quote',
      },
    ]);
    assert.deepEqual(readPeerPliteValue(peer), [
      {
        children: [paragraph('al'), paragraph('pha')],
        type: 'quote',
      },
    ]);
    assert.deepEqual(getYjsTrace(peer), [
      { mode: 'operation', operationType: 'split_node' },
      { mode: 'operation', operationType: 'split_node' },
    ]);
  });

  it('drops a preserved selection that no longer points to text after remote wrap import', () => {
    const peers = createPeers(['a', 'b', 'c']);
    const [a, b] = peers;

    a.editor.update((tx) => {
      tx.selection.set({
        anchor: { path: [0, 0], offset: 'alpha'.length },
        focus: { path: [0, 0], offset: 'alpha'.length },
      });
    });

    disconnectYjsPeer(b);
    wrapFirstBlock(b);
    appendRemoteText(a);
    syncConnectedPeers(peers);

    connectYjsPeerAndSync(b, peers);

    assertPeerTexts(peers, ['alpha!']);
    assert.deepEqual(getPeerTopLevelTypes(a), ['quote']);
    assert.equal(readPeerSelection(a), null);
  });

  it('recovers wrap convergence through real Yjs updates after reconnect', () => {
    const peers = createPeers(['a', 'b', 'c']);
    const [, b] = peers;

    disconnectYjsPeer(b);
    wrapFirstBlock(b);
    connectYjsPeerAndSync(b, peers);

    assertPeerTexts(peers, ['alpha']);
    assert.deepEqual(getPeerTopLevelTypes(b), ['quote']);
  });

  it('undoes and redoes only the local wrap intent after reconnect', () => {
    const peers = createPeers(['a', 'b', 'c']);
    const [a, b] = peers;

    disconnectYjsPeer(b);
    wrapFirstBlock(b);
    appendRemoteText(a);
    syncConnectedPeers(peers);

    connectYjsPeerAndSync(b, peers);
    assertPeerTexts(peers, ['alpha!']);
    assert.deepEqual(getPeerTopLevelTypes(b), ['quote']);

    undoYjsPeerAndSync(b, peers);
    assertPeerTexts(peers, ['alpha!']);
    assert.deepEqual(getPeerTopLevelTypes(b), ['paragraph']);

    redoYjsPeerAndSync(b, peers);
    assertPeerTexts(peers, ['alpha!']);
    assert.deepEqual(getPeerTopLevelTypes(b), ['quote']);
  });
});

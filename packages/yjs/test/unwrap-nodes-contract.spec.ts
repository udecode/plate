import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Descendant, Operation } from '@platejs/slate';

import {
  assertPeerTexts,
  clearYjsTrace,
  connectYjsPeerAndSync,
  createSeededYjsPeers,
  createYjsPeer,
  disconnectYjsPeer,
  getPeerTopLevelTexts,
  getPeerTopLevelTypes,
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

const wrapFirstBlock = (peer: Peer): void => {
  peer.editor.update((tx) => {
    tx.nodes.wrap({ children: [], type: 'quote' }, { at: [0] });
  });
};

const unwrapFirstBlock = (peer: Peer): void => {
  peer.editor.update((tx) => {
    tx.nodes.unwrap({ at: [0] });
  });
};

const appendRemoteText = (peer: Peer): void => {
  const [type] = getPeerTopLevelTypes(peer);
  const textPath = type === 'quote' ? [0, 0, 0] : [0, 0];

  peer.editor.update((tx) => {
    tx.text.insert('!', { at: { path: textPath, offset: 'alpha'.length } });
  });
};

const createWrappedPeer = (clientId: ClientId): Peer => {
  const peer = createPeer(clientId);

  wrapFirstBlock(peer);
  clearYjsTrace(peer);

  return peer;
};

const createWrappedPeers = (ids: readonly ClientId[]): Peer[] => {
  const peers = createPeers(ids);
  const [firstPeer] = peers;

  if (firstPeer === undefined) {
    throw new Error('Expected at least one wrapped peer.');
  }

  wrapFirstBlock(firstPeer);
  syncConnectedPeers(peers);

  for (const peer of peers) {
    clearYjsTrace(peer);
  }

  return peers;
};

const collectUnwrapOperations = (): Operation['type'][] => {
  const peer = createWrappedPeer('b');
  const operations = recordOperationTypes(peer, {
    name: 'unwrap-operation-recorder',
  });
  unwrapFirstBlock(peer);

  return operations;
};

describe('@platejs/yjs unwrapNodes collaboration contract', () => {
  it('characterizes public unwrapNodes as move_node then remove_node', () => {
    assert.deepEqual(collectUnwrapOperations(), ['move_node', 'remove_node']);
  });

  it('applies local offline public unwrap without replacing the original Yjs node', () => {
    const peer = createWrappedPeer('b');
    const original = getYjsNodeAt(peer, [1]);

    disconnectYjsPeer(peer);
    unwrapFirstBlock(peer);

    assert.deepEqual(getPeerTopLevelTexts(peer), ['alpha']);
    assert.deepEqual(getPeerTopLevelTypes(peer), ['paragraph']);
    assert.equal(getYjsNodeAt(peer, [0]), original);
    assert.deepEqual(getYjsTrace(peer), [
      {
        fallback: 'virtual-unwrap-ref',
        mode: 'traceable-fallback',
        operationType: 'move_node',
      },
      {
        fallback: 'virtual-unwrap-wrapper-remove',
        mode: 'traceable-fallback',
        operationType: 'remove_node',
      },
    ]);
  });

  it('preserves concurrent remote text when an offline unwrap reconnects', () => {
    const peers = createWrappedPeers(['a', 'b', 'c']);
    const [a, b] = peers;

    disconnectYjsPeer(b);
    unwrapFirstBlock(b);
    appendRemoteText(a);
    syncConnectedPeers(peers);

    assert.deepEqual(getPeerTopLevelTexts(a), ['alpha!']);
    assert.deepEqual(getPeerTopLevelTypes(a), ['quote']);
    assert.deepEqual(getPeerTopLevelTexts(b), ['alpha']);
    assert.deepEqual(getPeerTopLevelTypes(b), ['paragraph']);

    connectYjsPeerAndSync(b, peers);

    assertPeerTexts(peers, ['alpha!']);
    assert.deepEqual(getPeerTopLevelTypes(a), ['paragraph']);
    assert.deepEqual(getPeerTopLevelTypes(b), ['paragraph']);
  });

  it('recovers unwrap convergence through real Yjs updates after reconnect', () => {
    const peers = createWrappedPeers(['a', 'b', 'c']);
    const [, b] = peers;

    disconnectYjsPeer(b);
    unwrapFirstBlock(b);
    connectYjsPeerAndSync(b, peers);

    assertPeerTexts(peers, ['alpha']);
    assert.deepEqual(getPeerTopLevelTypes(b), ['paragraph']);
  });

  it('undoes and redoes only the local unwrap intent after reconnect', () => {
    const peers = createWrappedPeers(['a', 'b', 'c']);
    const [a, b] = peers;

    disconnectYjsPeer(b);
    unwrapFirstBlock(b);
    appendRemoteText(a);
    syncConnectedPeers(peers);

    connectYjsPeerAndSync(b, peers);
    assertPeerTexts(peers, ['alpha!']);
    assert.deepEqual(getPeerTopLevelTypes(b), ['paragraph']);

    undoYjsPeerAndSync(b, peers);
    assertPeerTexts(peers, ['alpha!']);
    assert.deepEqual(getPeerTopLevelTypes(b), ['quote']);

    redoYjsPeerAndSync(b, peers);
    assertPeerTexts(peers, ['alpha!']);
    assert.deepEqual(getPeerTopLevelTypes(b), ['paragraph']);
  });
});

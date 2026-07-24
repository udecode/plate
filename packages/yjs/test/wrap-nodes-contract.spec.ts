import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Descendant } from '@platejs/plite';
import {
  assertCanonicalYjsTrace,
  assertPeerTexts,
  clearYjsTrace,
  connectYjsPeerAndSync,
  createSeededYjsHistoryPeers,
  createYjsHistoryPeer,
  disconnectAndClearYjsTrace,
  disconnectYjsPeer,
  getPeerTopLevelTexts,
  getPeerTopLevelTypes,
  getVisibleYjsNodeAt,
  type Peer,
  paragraph,
  readPeerChildren,
  readPeerSelection,
  readPeerPliteValue,
  redoHistoryPeerAndSync,
  syncConnectedPeers,
  undoHistoryPeerAndSync,
} from './support/collaboration';

const clientIds = {
  a: 1,
  b: 2,
  c: 3,
} as const;

type ClientId = keyof typeof clientIds;

const initialValue = (): Descendant[] => [paragraph('alpha')];

const createPeer = (clientId: ClientId, seedUpdate?: Uint8Array): Peer =>
  createYjsHistoryPeer({
    children: initialValue(),
    clientId,
    numericClientId: clientIds[clientId],
    seedUpdate,
  });

const createPeers = (ids: readonly ClientId[]): Peer[] =>
  createSeededYjsHistoryPeers({
    children: initialValue(),
    clientIds: ids,
    numericClientIds: clientIds,
  });

const wrapFirstBlock = (peer: Peer): void => {
  peer.editor.update.nodes.wrap({ children: [], type: 'quote' }, { at: [0] });
};

const appendRemoteText = (peer: Peer): void => {
  peer.editor.update.text.insert('!', {
    at: { path: [0, 0], offset: 'alpha'.length },
  });
};

describe('@platejs/yjs wrapNodes collaboration contract', () => {
  it('applies a local offline public wrap as a canonical change', () => {
    const peer = createPeer('b');
    const wrapped = getVisibleYjsNodeAt(peer, [0]);

    disconnectAndClearYjsTrace(peer);
    wrapFirstBlock(peer);

    assert.deepEqual(getPeerTopLevelTexts(peer), ['alpha']);
    assert.deepEqual(getPeerTopLevelTypes(peer), ['quote']);
    assert.equal(getVisibleYjsNodeAt(peer, [0, 0]), wrapped);
    assertCanonicalYjsTrace(peer);
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

  it('splits text inside a wrapped block through a canonical change', () => {
    const peer = createPeer('b');

    wrapFirstBlock(peer);
    clearYjsTrace(peer);

    peer.editor.update((tx) => {
      tx.selection.set({
        kind: 'text',
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
    assertCanonicalYjsTrace(peer);
  });

  it('drops a preserved selection that no longer points to text after remote wrap import', () => {
    const peers = createPeers(['a', 'b', 'c']);
    const [a, b] = peers;

    a.editor.update.selection.set({
      kind: 'text',
      anchor: { path: [0, 0], offset: 'alpha'.length },
      focus: { path: [0, 0], offset: 'alpha'.length },
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

  it('undoes and redoes only the local wrap after reconnect', () => {
    const peers = createPeers(['a', 'b', 'c']);
    const [a, b] = peers;

    disconnectYjsPeer(b);
    wrapFirstBlock(b);
    appendRemoteText(a);
    syncConnectedPeers(peers);

    connectYjsPeerAndSync(b, peers);
    assertPeerTexts(peers, ['alpha!']);
    assert.deepEqual(getPeerTopLevelTypes(b), ['quote']);

    undoHistoryPeerAndSync(b, peers);
    assertPeerTexts(peers, ['alpha!']);
    assert.deepEqual(getPeerTopLevelTypes(b), ['paragraph']);

    redoHistoryPeerAndSync(b, peers);
    assertPeerTexts(peers, ['alpha!']);
    assert.deepEqual(getPeerTopLevelTypes(b), ['quote']);
  });
});

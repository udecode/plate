import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { type Descendant, type Range } from '@platejs/plite';

import {
  assertCanonicalYjsTrace,
  assertPeerTexts,
  connectYjsPeerAndSync,
  createSeededYjsHistoryPeers,
  createYjsHistoryPeer,
  disconnectAndClearYjsTrace,
  disconnectYjsPeer,
  getPeerTopLevelTexts,
  getVisibleYjsNodeAt,
  type Peer,
  paragraph,
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

const initialValue = (): Descendant[] => [
  paragraph('alpha'),
  paragraph('beta'),
  paragraph('gamma'),
];

const createPeer = (clientId: ClientId): Peer =>
  createYjsHistoryPeer({
    children: initialValue(),
    clientId,
    numericClientId: clientIds[clientId],
  });

const createPeers = (ids: readonly ClientId[]): Peer[] =>
  createSeededYjsHistoryPeers({
    children: initialValue(),
    clientIds: ids,
    numericClientIds: clientIds,
  });

const selectAndDeleteFragment = (peer: Peer, selection: Range): void => {
  peer.editor.update.selection.set(selection);

  peer.editor.update.fragment.delete();
};

const deleteBetaMiddle = (peer: Peer): void => {
  selectAndDeleteFragment(peer, {
    kind: 'text',
    anchor: { path: [1, 0], offset: 1 },
    focus: { path: [1, 0], offset: 3 },
  });
};

const deleteFromAlphaIntoGamma = (peer: Peer): void => {
  selectAndDeleteFragment(peer, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 2 },
    focus: { path: [2, 0], offset: 2 },
  });
};

const appendRemoteGamma = (peer: Peer): void => {
  peer.editor.update.text.insert('!', {
    at: { path: [2, 0], offset: 'gamma'.length },
  });
};

describe('@platejs/yjs delete_fragment collaboration contract', () => {
  it('applies local offline deleteFragment without replacing the edited Yjs text node', () => {
    const peer = createPeer('b');
    const text = getVisibleYjsNodeAt(peer, [1, 0]);

    disconnectAndClearYjsTrace(peer);
    deleteBetaMiddle(peer);

    assert.deepEqual(getPeerTopLevelTexts(peer), ['alpha', 'ba', 'gamma']);
    assert.equal(getVisibleYjsNodeAt(peer, [1, 0]), text);
    assertCanonicalYjsTrace(peer);
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

  it('undoes and redoes only the local cross-block deletion after reconnect', () => {
    const peers = createPeers(['a', 'b', 'c']);
    const [a, b] = peers;

    disconnectYjsPeer(b);
    deleteFromAlphaIntoGamma(b);
    appendRemoteGamma(a);
    syncConnectedPeers(peers);

    connectYjsPeerAndSync(b, peers);
    assertPeerTexts(peers, ['almma!']);

    undoHistoryPeerAndSync(b, peers);
    assertPeerTexts(peers, ['alpha', 'beta', 'gamma!']);

    redoHistoryPeerAndSync(b, peers);
    assertPeerTexts(peers, ['almma!']);
  });
});

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Descendant } from '../../src/core';
import {
  assertCanonicalYjsTrace,
  assertPeerTexts,
  connectYjsPeerAndSync,
  createSeededYjsHistoryPeers,
  createYjsHistoryPeer,
  disconnectAndClearYjsTrace,
  disconnectYjsPeer,
  getPeerTopLevelTexts,
  type Peer,
  paragraph,
  redoHistoryPeerAndSync,
  syncConnectedPeers,
  undoHistoryPeerAndSync,
} from './support/collaboration';

const initialValue = (): Descendant[] => [
  paragraph('alpha'),
  paragraph('beta'),
];

const textMergeValue = (): Descendant[] => [
  {
    type: 'paragraph',
    children: [{ text: 'alpha' }, { text: 'beta', source: 'right' }],
  },
];

const createPeer = (
  clientId: string,
  seedUpdate?: Uint8Array,
  children: readonly Descendant[] = initialValue()
): Peer => createYjsHistoryPeer({ children, clientId, seedUpdate });

const createPeers = (
  clientIds: readonly string[],
  children: readonly Descendant[] = initialValue()
): Peer[] => createSeededYjsHistoryPeers({ children, clientIds });

const mergeSecondParagraph = (peer: Peer): void => {
  peer.editor.update.nodes.merge({ at: [1] });
};

const mergeRightText = (peer: Peer): void => {
  peer.editor.update.nodes.merge({ at: [0, 1] });
};

const appendRemoteTextToLeftParagraph = (peer: Peer): void => {
  peer.editor.update.text.insert('!', {
    at: { path: [0, 0], offset: 'alpha'.length },
  });
};

describe('platejs/yjs merge_node collaboration contract', () => {
  it('applies a local offline public merge as a canonical change', () => {
    const peer = createPeer('b');

    disconnectAndClearYjsTrace(peer);
    mergeSecondParagraph(peer);

    assert.deepEqual(getPeerTopLevelTexts(peer), ['alphabeta']);
    assertCanonicalYjsTrace(peer);
  });

  it('preserves concurrent remote survivor edits when an offline merge reconnects', () => {
    const peers = createPeers(['a', 'b', 'c']);
    const [a, b] = peers;

    disconnectYjsPeer(b);
    mergeSecondParagraph(b);
    appendRemoteTextToLeftParagraph(a);
    syncConnectedPeers(peers);

    assert.deepEqual(getPeerTopLevelTexts(a), ['alpha!', 'beta']);
    assert.deepEqual(getPeerTopLevelTexts(b), ['alphabeta']);

    connectYjsPeerAndSync(b, peers);

    assertPeerTexts(peers, ['alpha!beta']);
  });

  it('recovers merge convergence through real Yjs updates after reconnect', () => {
    const peers = createPeers(['a', 'b', 'c']);
    const [, b] = peers;

    disconnectYjsPeer(b);
    mergeSecondParagraph(b);
    connectYjsPeerAndSync(b, peers);

    assertPeerTexts(peers, ['alphabeta']);
  });

  it('undoes and redoes only the local merge after reconnect', () => {
    const peers = createPeers(['a', 'b', 'c']);
    const [a, b] = peers;

    disconnectYjsPeer(b);
    mergeSecondParagraph(b);
    appendRemoteTextToLeftParagraph(a);
    syncConnectedPeers(peers);

    connectYjsPeerAndSync(b, peers);
    assertPeerTexts(peers, ['alpha!beta']);

    undoHistoryPeerAndSync(b, peers);
    assertPeerTexts(peers, ['alpha!', 'beta']);

    redoHistoryPeerAndSync(b, peers);
    assertPeerTexts(peers, ['alpha!beta']);
  });

  it('merges adjacent text leaves through a canonical change', () => {
    const peers = createPeers(['a', 'b', 'c'], textMergeValue());
    const [a, b] = peers;
    disconnectAndClearYjsTrace(b);
    mergeRightText(b);
    appendRemoteTextToLeftParagraph(a);
    syncConnectedPeers(peers);

    assert.deepEqual(getPeerTopLevelTexts(a), ['alpha!beta']);
    assert.deepEqual(getPeerTopLevelTexts(b), ['alphabeta']);
    assertCanonicalYjsTrace(b);

    connectYjsPeerAndSync(b, peers);
    assertPeerTexts(peers, ['alpha!beta']);

    undoHistoryPeerAndSync(b, peers);
    assertPeerTexts(peers, ['alpha!beta']);

    redoHistoryPeerAndSync(b, peers);
    assertPeerTexts(peers, ['alpha!beta']);
  });
});

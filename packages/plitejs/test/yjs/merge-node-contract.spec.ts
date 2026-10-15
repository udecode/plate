import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Descendant } from '../../src/index';
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
  getYjsTrace,
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

describe('plitejs/yjs merge_node collaboration contract', () => {
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

  it('keeps a peer’s typing in the right block when blocks with different properties merge', () => {
    const peers = createPeers(
      ['a', 'b'],
      [paragraph('ab'), paragraph('cd', { align: 'center' })]
    );
    const [a, b] = peers;

    mergeSecondParagraph(a);
    b.editor.update.text.insert('Z', { at: { path: [1, 0], offset: 2 } });
    syncConnectedPeers(peers);

    assertPeerTexts(peers, ['abcdZ']);
  });

  it('keeps two peers typing into the second half of a joined text in one block', () => {
    const peers = createPeers(['a', 'b']);
    const [a, b] = peers;

    mergeSecondParagraph(a);
    syncConnectedPeers(peers);

    for (let round = 1; round <= 3; round++) {
      for (const peer of peers) clearYjsTrace(peer);
      a.editor.update.text.insert('x', {
        at: { path: [0, 0], offset: 'alphab'.length },
      });
      b.editor.update.text.insert('y', {
        at: {
          path: [0, 0],
          offset: `alphab${'x'.repeat(round - 1)}eta`.length + round - 1,
        },
      });
      syncConnectedPeers(peers);

      assertPeerTexts(peers, [
        `alphab${'x'.repeat(round)}eta${'y'.repeat(round)}`,
      ]);
      for (const peer of peers) {
        assert.deepEqual(
          getYjsTrace(peer).flatMap((entry) => entry.fallback ?? []),
          []
        );
      }
    }
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

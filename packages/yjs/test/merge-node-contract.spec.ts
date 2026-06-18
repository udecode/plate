import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Descendant } from '@platejs/slate';

import {
  assertPeerTexts,
  clearYjsTrace,
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
  readPeerChildren,
  readPeerSlateValue,
  reconcileYjsPeer,
  redoYjsPeerAndSync,
  syncConnectedPeers,
  undoYjsPeerAndSync,
} from './support/collaboration';

const quote = (...children: readonly Descendant[]): Descendant => ({
  type: 'block-quote',
  children,
});

const initialValue = (): Descendant[] => [
  paragraph('alpha'),
  paragraph('beta'),
];

const incompatibleMergeValue = (): Descendant[] => [
  paragraph('block 2'),
  quote(paragraph('alpha'), paragraph('beta')),
];

const textMergeValue = (): Descendant[] => [
  {
    type: 'paragraph',
    children: [{ text: 'alpha' }, { text: 'beta' }],
  },
];

const createPeer = (
  clientId: string,
  seedUpdate?: Uint8Array,
  children: readonly Descendant[] = initialValue()
): Peer => createYjsPeer({ children, clientId, seedUpdate });

const createPeers = (
  clientIds: readonly string[],
  children: readonly Descendant[] = initialValue()
): Peer[] => createSeededYjsPeers({ children, clientIds });

const mergeSecondParagraph = (peer: Peer): void => {
  peer.editor.update((tx) => {
    tx.nodes.merge({ at: [1] });
  });
};

const mergeRightText = (peer: Peer): void => {
  peer.editor.update((tx) => {
    tx.operations.replay([
      {
        path: [0, 1],
        position: 'alpha'.length,
        properties: {},
        type: 'merge_node',
      },
    ]);
  });
};

const appendRemoteTextToLeftParagraph = (peer: Peer): void => {
  peer.editor.update((tx) => {
    tx.text.insert('!', { at: { path: [0, 0], offset: 'alpha'.length } });
  });
};

describe('@platejs/yjs merge_node collaboration contract', () => {
  it('elides incompatible structural merge instead of nesting blocks into a paragraph', () => {
    const peer = createPeer('b', undefined, incompatibleMergeValue());

    clearYjsTrace(peer);
    mergeSecondParagraph(peer);

    assert.deepEqual(readPeerSlateValue(peer), [
      paragraph('block 2'),
      quote(paragraph('alpha'), paragraph('beta')),
    ]);
    assert.deepEqual(getYjsTrace(peer), [
      {
        fallback: 'incompatible-structural-merge-elided',
        mode: 'traceable-fallback',
        operationType: 'merge_node',
      },
    ]);

    reconcileYjsPeer(peer);

    assert.deepEqual(readPeerChildren(peer), incompatibleMergeValue());
  });

  it('applies local offline public merge without a root snapshot fallback', () => {
    const peer = createPeer('b');
    const survivor = getYjsNodeAt(peer, [0]);

    disconnectAndClearYjsTrace(peer);
    mergeSecondParagraph(peer);

    assert.deepEqual(getPeerTopLevelTexts(peer), ['alphabeta']);
    assert.equal(getYjsNodeAt(peer, [0]), survivor);
    assert.deepEqual(getYjsTrace(peer), [
      {
        fallback: 'virtual-merge-ref',
        mode: 'traceable-fallback',
        operationType: 'merge_node',
      },
    ]);
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

  it('undoes and redoes only the local merge intent after reconnect', () => {
    const peers = createPeers(['a', 'b', 'c']);
    const [a, b] = peers;

    disconnectYjsPeer(b);
    mergeSecondParagraph(b);
    appendRemoteTextToLeftParagraph(a);
    syncConnectedPeers(peers);

    connectYjsPeerAndSync(b, peers);
    assertPeerTexts(peers, ['alpha!beta']);

    undoYjsPeerAndSync(b, peers);
    assertPeerTexts(peers, ['alpha!', 'beta']);

    redoYjsPeerAndSync(b, peers);
    assertPeerTexts(peers, ['alpha!beta']);
  });

  it('keeps raw text merge_node in a traceable identity-preserving fallback', () => {
    const peers = createPeers(['a', 'b', 'c'], textMergeValue());
    const [a, b] = peers;
    const survivor = getYjsNodeAt(b, [0, 0]);
    const rightText = getYjsNodeAt(b, [0, 1]);

    disconnectAndClearYjsTrace(b);
    mergeRightText(b);
    appendRemoteTextToLeftParagraph(a);
    syncConnectedPeers(peers);

    assert.deepEqual(getPeerTopLevelTexts(a), ['alpha!beta']);
    assert.deepEqual(getPeerTopLevelTexts(b), ['alphabeta']);
    assert.equal(getYjsNodeAt(b, [0, 0]), survivor);
    assert.equal(getYjsNodeAt(b, [0, 1]), rightText);
    assert.deepEqual(getYjsTrace(b), [
      {
        fallback: 'text-merge-preserve-yjs-boundary',
        mode: 'traceable-fallback',
        operationType: 'merge_node',
      },
    ]);

    connectYjsPeerAndSync(b, peers);
    assertPeerTexts(peers, ['alpha!beta']);

    undoYjsPeerAndSync(b, peers);
    assertPeerTexts(peers, ['alpha!beta']);

    redoYjsPeerAndSync(b, peers);
    assertPeerTexts(peers, ['alpha!beta']);
  });
});

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
  getVisibleYjsNodeAt,
  getYjsTrace,
  type Peer,
  paragraph,
  readPeerPliteValue,
  redoHistoryPeerAndSync,
  syncConnectedPeers,
  undoHistoryPeer,
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

const createPeer = (
  clientId: ClientId,
  children: readonly Descendant[] = initialValue()
): Peer =>
  createYjsHistoryPeer({
    children,
    clientId,
    numericClientId: clientIds[clientId],
  });

const createPeers = (ids: readonly ClientId[]): Peer[] =>
  createSeededYjsHistoryPeers({
    children: initialValue(),
    clientIds: ids,
    numericClientIds: clientIds,
  });

const appendRemoteAlpha = (peer: Peer): void => {
  peer.editor.update.text.insert('!', {
    at: { path: [0, 0], offset: 'alpha'.length },
  });
};

const insertBetaBang = (peer: Peer): void => {
  peer.editor.update.text.insert('!', {
    at: { path: [1, 0], offset: 'beta'.length },
  });
};

const removeBetaMiddle = (peer: Peer): void => {
  peer.editor.update.text.delete({
    at: { path: [1, 0], offset: 1 },
    distance: 2,
  });
};

const insertMiddleBlock = (peer: Peer): void => {
  peer.editor.update.nodes.insert([paragraph('bravo')], { at: [1] });
};

const replaceMiddleBlock = (peer: Peer): void => {
  peer.editor.update.nodes.replaceChildren([paragraph('bravo')], {
    at: [],
    count: 1,
    index: 1,
  });
};

const replaceFirstBlock = (peer: Peer): void => {
  peer.editor.update.nodes.replaceChildren([paragraph('bravo')], {
    at: [],
    count: 1,
    index: 0,
  });
};

describe('@platejs/yjs canonical change collaboration contract', () => {
  it('applies local offline insert_text in place without a root snapshot fallback', () => {
    const peer = createPeer('b');
    const text = getVisibleYjsNodeAt(peer, [1, 0]);

    disconnectAndClearYjsTrace(peer);
    insertBetaBang(peer);

    assert.deepEqual(getPeerTopLevelTexts(peer), ['alpha', 'beta!', 'gamma']);
    assert.equal(getVisibleYjsNodeAt(peer, [1, 0]), text);
    assertCanonicalYjsTrace(peer);
  });

  it('reconnects, undoes, and redoes insert_text while preserving remote edits', () => {
    const peers = createPeers(['a', 'b', 'c']);
    const [a, b] = peers;

    disconnectYjsPeer(b);
    insertBetaBang(b);
    appendRemoteAlpha(a);
    syncConnectedPeers(peers);

    connectYjsPeerAndSync(b, peers);
    assertPeerTexts(peers, ['alpha!', 'beta!', 'gamma']);

    undoHistoryPeerAndSync(b, peers);
    assertPeerTexts(peers, ['alpha!', 'beta', 'gamma']);

    redoHistoryPeerAndSync(b, peers);
    assertPeerTexts(peers, ['alpha!', 'beta!', 'gamma']);
  });

  it('applies local offline remove_text in place without a root snapshot fallback', () => {
    const peer = createPeer('b');
    const text = getVisibleYjsNodeAt(peer, [1, 0]);

    disconnectAndClearYjsTrace(peer);
    removeBetaMiddle(peer);

    assert.deepEqual(getPeerTopLevelTexts(peer), ['alpha', 'ba', 'gamma']);
    assert.equal(getVisibleYjsNodeAt(peer, [1, 0]), text);
    assertCanonicalYjsTrace(peer);
  });

  it('reconnects, undoes, and redoes remove_text while preserving remote edits', () => {
    const peers = createPeers(['a', 'b', 'c']);
    const [a, b] = peers;

    disconnectYjsPeer(b);
    removeBetaMiddle(b);
    appendRemoteAlpha(a);
    syncConnectedPeers(peers);

    connectYjsPeerAndSync(b, peers);
    assertPeerTexts(peers, ['alpha!', 'ba', 'gamma']);

    undoHistoryPeerAndSync(b, peers);
    assertPeerTexts(peers, ['alpha!', 'beta', 'gamma']);

    redoHistoryPeerAndSync(b, peers);
    assertPeerTexts(peers, ['alpha!', 'ba', 'gamma']);
  });

  it('applies local offline insert_node without replacing existing Yjs siblings', () => {
    const peer = createPeer('b');
    const alpha = getVisibleYjsNodeAt(peer, [0]);
    const beta = getVisibleYjsNodeAt(peer, [1]);

    disconnectAndClearYjsTrace(peer);
    insertMiddleBlock(peer);

    assert.deepEqual(getPeerTopLevelTexts(peer), [
      'alpha',
      'bravo',
      'beta',
      'gamma',
    ]);
    assert.equal(getVisibleYjsNodeAt(peer, [0]), alpha);
    assert.equal(getVisibleYjsNodeAt(peer, [2]), beta);
    assertCanonicalYjsTrace(peer);
  });

  it('inserts before a leading moved child', () => {
    const peer = createPeer('b', [
      { type: 'quote', children: [] },
      paragraph('moved'),
    ]);

    peer.editor.update.nodes.move({ at: [1], to: [0, 0] });
    const movedParagraph = getVisibleYjsNodeAt(peer, [0, 0]);

    disconnectAndClearYjsTrace(peer);
    peer.editor.update.nodes.insert([paragraph('before')], { at: [0, 0] });

    assert.deepEqual(getPeerTopLevelTexts(peer), ['beforemoved']);
    assert.equal(getVisibleYjsNodeAt(peer, [0, 1]), movedParagraph);
    assertCanonicalYjsTrace(peer);
  });

  it('reconnects, undoes, and redoes insert_node while preserving remote edits', () => {
    const peers = createPeers(['a', 'b', 'c']);
    const [a, b] = peers;

    disconnectYjsPeer(b);
    insertMiddleBlock(b);
    appendRemoteAlpha(a);
    syncConnectedPeers(peers);

    connectYjsPeerAndSync(b, peers);
    assertPeerTexts(peers, ['alpha!', 'bravo', 'beta', 'gamma']);

    undoHistoryPeerAndSync(b, peers);
    assertPeerTexts(peers, ['alpha!', 'beta', 'gamma']);

    redoHistoryPeerAndSync(b, peers);
    assertPeerTexts(peers, ['alpha!', 'bravo', 'beta', 'gamma']);
  });

  it('applies local offline replace_children while preserving unaffected Yjs siblings', () => {
    const peer = createPeer('b');
    const alpha = getVisibleYjsNodeAt(peer, [0]);
    const gamma = getVisibleYjsNodeAt(peer, [2]);

    disconnectAndClearYjsTrace(peer);
    replaceMiddleBlock(peer);

    assert.deepEqual(getPeerTopLevelTexts(peer), ['alpha', 'bravo', 'gamma']);
    assert.equal(getVisibleYjsNodeAt(peer, [0]), alpha);
    assert.equal(getVisibleYjsNodeAt(peer, [2]), gamma);
    assertCanonicalYjsTrace(peer);
  });

  it('preserves moved-node identity for a compatible child replacement', () => {
    const peer = createPeer('b', [
      { type: 'quote', children: [paragraph('left')] },
      { type: 'quote', children: [] },
      paragraph('moved'),
    ]);

    peer.editor.update.nodes.move({ at: [2], to: [1, 0] });
    const movedParagraph = getVisibleYjsNodeAt(peer, [1, 0]);

    disconnectAndClearYjsTrace(peer);
    peer.editor.update.nodes.replaceChildren([paragraph('moved!')], {
      at: [1],
      count: 1,
      index: 0,
    });

    assert.deepEqual(getPeerTopLevelTexts(peer), ['left', 'moved!']);
    assert.equal(getVisibleYjsNodeAt(peer, [1, 0]), movedParagraph);
    assertCanonicalYjsTrace(peer);
  });

  it('replaces moved children instead of throwing on removal', () => {
    const peer = createPeer('b', [
      { type: 'quote', children: [paragraph('left')] },
      { type: 'quote', children: [] },
      paragraph('moved'),
    ]);

    peer.editor.update.nodes.move({ at: [2], to: [1, 0] });

    disconnectAndClearYjsTrace(peer);
    assert.doesNotThrow(() => {
      peer.editor.update.nodes.replaceChildren(
        [paragraph('bravo'), paragraph('charlie')],
        { at: [1], count: 1, index: 0 }
      );
    });

    assert.deepEqual(getPeerTopLevelTexts(peer), ['left', 'bravocharlie']);
    assertCanonicalYjsTrace(peer);
  });

  it('reconnects, undoes, and redoes replace_children while preserving remote edits', () => {
    const peers = createPeers(['a', 'b', 'c']);
    const [a, b] = peers;

    disconnectYjsPeer(b);
    replaceMiddleBlock(b);
    appendRemoteAlpha(a);
    syncConnectedPeers(peers);

    connectYjsPeerAndSync(b, peers);
    assertPeerTexts(peers, ['alpha!', 'bravo', 'gamma']);

    undoHistoryPeerAndSync(b, peers);
    assertPeerTexts(peers, ['alpha!', 'beta', 'gamma']);

    redoHistoryPeerAndSync(b, peers);
    assertPeerTexts(peers, ['alpha!', 'bravo', 'gamma']);
  });

  it('preserves remote text when an offline replace_children is undone before reconnect', () => {
    const peers = createPeers(['a', 'b', 'c']);
    const [a, b] = peers;
    const paragraphNode = getVisibleYjsNodeAt(b, [0]);
    const textNode = getVisibleYjsNodeAt(b, [0, 0]);

    disconnectYjsPeer(b);
    replaceFirstBlock(b);
    assert.equal(getVisibleYjsNodeAt(b, [0]), paragraphNode);
    assert.equal(getVisibleYjsNodeAt(b, [0, 0]), textNode);
    assert.deepEqual(getPeerTopLevelTexts(b), ['bravo', 'beta', 'gamma']);

    undoHistoryPeer(b);
    assert.equal(getVisibleYjsNodeAt(b, [0]), paragraphNode);
    assert.equal(getVisibleYjsNodeAt(b, [0, 0]), textNode);
    assert.deepEqual(getPeerTopLevelTexts(b), ['alpha', 'beta', 'gamma']);

    appendRemoteAlpha(a);
    syncConnectedPeers(peers);
    assert.deepEqual(getPeerTopLevelTexts(a), ['alpha!', 'beta', 'gamma']);
    assert.deepEqual(getPeerTopLevelTexts(b), ['alpha', 'beta', 'gamma']);

    connectYjsPeerAndSync(b, peers);

    assertPeerTexts(peers, ['alpha!', 'beta', 'gamma']);
  });

  it('publishes non-main root edits through the document controller', () => {
    const peer = createPeer('b');

    clearYjsTrace(peer);
    peer.editor.update.roots.create('header', [paragraph('header')]);
    peer.editor.update.roots.replace('header', [paragraph('updated')]);

    assert.deepEqual(peer.editor.read.root('header'), [paragraph('updated')]);
    assert.deepEqual(readPeerPliteValue(peer), initialValue());
    assert.deepEqual(getPeerTopLevelTexts(peer), ['alpha', 'beta', 'gamma']);
    assert.equal(peer.doc.getMap('@platejs/plite:roots').has('header'), true);
    assert.equal(
      getYjsTrace(peer).every((entry) => entry.root === 'header'),
      true
    );
  });
});

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { string as editorString } from '#platejs-test-internal';

import type { Descendant } from '../../src/core';
import {
  assertCanonicalYjsTrace,
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
  readPeerChildren,
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

const section = (...children: readonly Descendant[]): Descendant => ({
  type: 'section',
  children,
});

const initialValue = (): Descendant[] => [
  paragraph('alpha'),
  paragraph('beta'),
  paragraph('gamma'),
];

const nestedInitialValue = (): Descendant[] => [
  section(paragraph('alpha'), paragraph('beta')),
  section(paragraph('gamma')),
];

const createPeer = (
  clientId: ClientId,
  seedUpdate?: Uint8Array,
  children: readonly Descendant[] = initialValue()
): Peer =>
  createYjsHistoryPeer({
    children,
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

const createNestedPeers = (ids: readonly ClientId[]): Peer[] =>
  createSeededYjsHistoryPeers({
    children: nestedInitialValue(),
    clientIds: ids,
    numericClientIds: clientIds,
  });

const nestedTexts = (peer: Peer): string[][] =>
  readPeerChildren(peer).map((node, index) =>
    'children' in node
      ? node.children.map((_, childIndex) =>
          editorString(peer.editor, [index, childIndex])
        )
      : []
  );

const moveFirstBlockToEnd = (peer: Peer): void => {
  peer.editor.update.nodes.move({ at: [0], to: [2] });
};

const moveNestedBlockToSecondSection = (peer: Peer): void => {
  peer.editor.update.nodes.move({ at: [0, 0], to: [1, 1] });
};

const appendRemoteAlpha = (peer: Peer): void => {
  peer.editor.update.text.insert('!', {
    at: { path: [0, 0], offset: 'alpha'.length },
  });
};

const appendNestedRemoteAlpha = (peer: Peer): void => {
  peer.editor.update.text.insert('!', {
    at: { path: [0, 0, 0], offset: 'alpha'.length },
  });
};

describe('platejs/yjs move_node collaboration contract', () => {
  it('applies a local offline same-parent move as a canonical change', () => {
    const peer = createPeer('b');
    const moved = getVisibleYjsNodeAt(peer, [0]);

    disconnectAndClearYjsTrace(peer);
    moveFirstBlockToEnd(peer);

    assert.deepEqual(getPeerTopLevelTexts(peer), ['beta', 'gamma', 'alpha']);
    assert.equal(getVisibleYjsNodeAt(peer, [2]), moved);
    assertCanonicalYjsTrace(peer);
    assert.equal(getYjsTrace(peer)[0]?.tokenLengthNodes, 0);
  });

  it('preserves concurrent remote text when an offline same-parent move reconnects', () => {
    const peers = createPeers(['a', 'b', 'c']);
    const [a, b] = peers;

    disconnectYjsPeer(b);
    moveFirstBlockToEnd(b);
    appendRemoteAlpha(a);
    syncConnectedPeers(peers);

    assert.deepEqual(getPeerTopLevelTexts(a), ['alpha!', 'beta', 'gamma']);
    assert.deepEqual(getPeerTopLevelTexts(b), ['beta', 'gamma', 'alpha']);

    connectYjsPeerAndSync(b, peers);

    for (const peer of peers) {
      assert.deepEqual(getPeerTopLevelTexts(peer), ['beta', 'gamma', 'alpha!']);
    }
  });

  it('updates a relocated node without a snapshot fallback', () => {
    const peer = createPeer('b');
    const moved = getVisibleYjsNodeAt(peer, [0]);

    moveFirstBlockToEnd(peer);
    clearYjsTrace(peer);
    peer.editor.update.text.insert('!', {
      at: { path: [2, 0], offset: 'alpha'.length },
    });

    assert.equal(getVisibleYjsNodeAt(peer, [2]), moved);
    assert.deepEqual(getPeerTopLevelTexts(peer), ['beta', 'gamma', 'alpha!']);
    assertCanonicalYjsTrace(peer);
  });

  it('undoes and redoes only the local same-parent move after reconnect', () => {
    const peers = createPeers(['a', 'b', 'c']);
    const [a, b] = peers;

    disconnectYjsPeer(b);
    moveFirstBlockToEnd(b);
    appendRemoteAlpha(a);
    syncConnectedPeers(peers);

    connectYjsPeerAndSync(b, peers);
    for (const peer of peers) {
      assert.deepEqual(getPeerTopLevelTexts(peer), ['beta', 'gamma', 'alpha!']);
    }

    undoHistoryPeerAndSync(b, peers);
    for (const peer of peers) {
      assert.deepEqual(getPeerTopLevelTexts(peer), ['alpha!', 'beta', 'gamma']);
    }

    redoHistoryPeerAndSync(b, peers);
    for (const peer of peers) {
      assert.deepEqual(getPeerTopLevelTexts(peer), ['beta', 'gamma', 'alpha!']);
    }
  });

  it('applies a local offline cross-parent move as a canonical change', () => {
    const peer = createPeer('b', undefined, nestedInitialValue());

    disconnectAndClearYjsTrace(peer);
    moveNestedBlockToSecondSection(peer);

    assert.deepEqual(nestedTexts(peer), [['beta'], ['gamma', 'alpha']]);
    assertCanonicalYjsTrace(peer);
  });

  it('moves a sibling before a leading virtual moved child', () => {
    const peer = createPeer('b', undefined, [
      section(),
      paragraph('moved'),
      paragraph('before'),
    ]);

    peer.editor.update.nodes.move({ at: [1], to: [0, 0] });
    disconnectAndClearYjsTrace(peer);
    peer.editor.update.nodes.move({ at: [1], to: [0, 0] });

    assert.deepEqual(nestedTexts(peer), [['before', 'moved']]);
    assertCanonicalYjsTrace(peer);
  });

  it('keeps an untouched projected sibling on the sparse event path', () => {
    const peers = createSeededYjsHistoryPeers({
      children: [section(), paragraph('moved'), paragraph('sibling')],
      clientIds: ['a', 'b'],
      numericClientIds: { a: 1, b: 2 },
    });
    const [a, b] = peers;

    b.editor.update.nodes.move({ at: [1], to: [0, 0] });
    syncConnectedPeers(peers);
    b.editor.update.text.insert('!', {
      at: { path: [1, 0], offset: 'sibling'.length },
    });
    syncConnectedPeers(peers);
    peers.forEach(clearYjsTrace);

    a.editor.update.nodes.insert(paragraph('remote'), { at: [2] });
    syncConnectedPeers(peers);

    assert.deepEqual(getPeerTopLevelTexts(b), ['moved', 'sibling!', 'remote']);
    const trace = getYjsTrace(b);

    assert.equal(
      trace.some((entry) => entry.fallback !== undefined),
      false
    );
    assert.equal(
      trace.some(
        (entry) =>
          entry.importKind === 'event-change' &&
          entry.changedRanges === 1 &&
          entry.readTopLevelNodes === 1
      ),
      true
    );
  });

  it('preserves concurrent remote text when an offline cross-parent move reconnects', () => {
    const peers = createNestedPeers(['a', 'b', 'c']);
    const [a, b] = peers;

    disconnectYjsPeer(b);
    moveNestedBlockToSecondSection(b);
    appendNestedRemoteAlpha(a);
    syncConnectedPeers(peers);

    assert.deepEqual(nestedTexts(a), [['alpha!', 'beta'], ['gamma']]);
    assert.deepEqual(nestedTexts(b), [['beta'], ['gamma', 'alpha']]);

    connectYjsPeerAndSync(b, peers);

    for (const peer of peers) {
      assert.deepEqual(nestedTexts(peer), [['beta'], ['gamma', 'alpha!']]);
    }
  });

  it('undoes and redoes only the local cross-parent move after reconnect', () => {
    const peers = createNestedPeers(['a', 'b', 'c']);
    const [a, b] = peers;

    disconnectYjsPeer(b);
    moveNestedBlockToSecondSection(b);
    appendNestedRemoteAlpha(a);
    syncConnectedPeers(peers);

    connectYjsPeerAndSync(b, peers);
    for (const peer of peers) {
      assert.deepEqual(nestedTexts(peer), [['beta'], ['gamma', 'alpha!']]);
    }

    undoHistoryPeerAndSync(b, peers);
    for (const peer of peers) {
      assert.deepEqual(nestedTexts(peer), [['alpha!', 'beta'], ['gamma']]);
    }

    redoHistoryPeerAndSync(b, peers);
    for (const peer of peers) {
      assert.deepEqual(nestedTexts(peer), [['beta'], ['gamma', 'alpha!']]);
    }
  });
});

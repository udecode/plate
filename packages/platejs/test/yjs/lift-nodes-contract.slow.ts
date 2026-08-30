import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Descendant } from '../../src/core';
import {
  assertCanonicalYjsTrace,
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

const section = (...children: readonly Descendant[]): Descendant => ({
  type: 'section',
  children,
});

const initialValue = (): Descendant[] => [
  section(paragraph('alpha'), paragraph('beta')),
  paragraph('gamma'),
];

const onlyChildValue = (): Descendant[] => [section(paragraph('alpha'))];

const tripleChildValue = (): Descendant[] => [
  section(paragraph('alpha'), paragraph('beta'), paragraph('gamma')),
  paragraph('delta'),
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

const createPeers = (
  ids: readonly ClientId[],
  children: readonly Descendant[] = initialValue()
): Peer[] =>
  createSeededYjsHistoryPeers({
    children,
    clientIds: ids,
    numericClientIds: clientIds,
  });

const liftFirstNestedBlock = (peer: Peer): void => {
  peer.editor.update.nodes.lift({ at: [0, 0] });
};

const liftLastNestedBlock = (peer: Peer): void => {
  peer.editor.update.nodes.lift({ at: [0, 1] });
};

const liftMiddleNestedBlock = (peer: Peer): void => {
  peer.editor.update.nodes.lift({ at: [0, 1] });
};

const appendNestedAlpha = (peer: Peer): void => {
  peer.editor.update.text.insert('!', {
    at: { path: [0, 0, 0], offset: 'alpha'.length },
  });
};

const appendNestedBeta = (peer: Peer): void => {
  peer.editor.update.text.insert('!', {
    at: { path: [0, 1, 0], offset: 'beta'.length },
  });
};

describe('platejs/yjs liftNodes collaboration contract', () => {
  it('applies a local offline first-child lift through a canonical change', () => {
    const peer = createPeer('b');
    const lifted = getVisibleYjsNodeAt(peer, [0, 0]);

    disconnectAndClearYjsTrace(peer);
    liftFirstNestedBlock(peer);

    assert.deepEqual(getPeerTopLevelTexts(peer), ['alpha', 'beta', 'gamma']);
    assert.equal(getVisibleYjsNodeAt(peer, [0]), lifted);
    assertCanonicalYjsTrace(peer);
  });

  it('preserves concurrent remote text when an offline first-child lift reconnects', () => {
    const peers = createPeers(['a', 'b', 'c']);
    const [a, b] = peers;

    disconnectYjsPeer(b);
    liftFirstNestedBlock(b);
    appendNestedAlpha(a);
    syncConnectedPeers(peers);

    assert.deepEqual(getPeerTopLevelTexts(a), ['alpha!beta', 'gamma']);
    assert.deepEqual(getPeerTopLevelTexts(b), ['alpha', 'beta', 'gamma']);

    connectYjsPeerAndSync(b, peers);

    for (const peer of peers) {
      assert.deepEqual(getPeerTopLevelTexts(peer), ['alpha!', 'beta', 'gamma']);
    }
  });

  it('recovers first-child lift convergence through real Yjs updates after reconnect', () => {
    const peers = createPeers(['a', 'b', 'c']);
    const [, b] = peers;

    disconnectYjsPeer(b);
    liftFirstNestedBlock(b);
    connectYjsPeerAndSync(b, peers);

    for (const peer of peers) {
      assert.deepEqual(getPeerTopLevelTexts(peer), ['alpha', 'beta', 'gamma']);
    }
  });

  it('undoes and redoes only the local first-child lift after reconnect', () => {
    const peers = createPeers(['a', 'b', 'c']);
    const [a, b] = peers;

    disconnectYjsPeer(b);
    liftFirstNestedBlock(b);
    appendNestedAlpha(a);
    syncConnectedPeers(peers);

    connectYjsPeerAndSync(b, peers);
    for (const peer of peers) {
      assert.deepEqual(getPeerTopLevelTexts(peer), ['alpha!', 'beta', 'gamma']);
    }

    undoHistoryPeerAndSync(b, peers);
    for (const peer of peers) {
      assert.deepEqual(getPeerTopLevelTexts(peer), ['alpha!beta', 'gamma']);
    }

    redoHistoryPeerAndSync(b, peers);
    for (const peer of peers) {
      assert.deepEqual(getPeerTopLevelTexts(peer), ['alpha!', 'beta', 'gamma']);
    }
  });

  it('applies a local offline only-child lift through a canonical change', () => {
    const peer = createPeer('b', undefined, onlyChildValue());

    disconnectAndClearYjsTrace(peer);
    liftFirstNestedBlock(peer);

    assert.deepEqual(getPeerTopLevelTexts(peer), ['alpha']);
    assertCanonicalYjsTrace(peer);
  });

  it('preserves concurrent remote text when an offline only-child lift reconnects', () => {
    const peers = createPeers(['a', 'b', 'c'], onlyChildValue());
    const [a, b] = peers;

    disconnectYjsPeer(b);
    liftFirstNestedBlock(b);
    appendNestedAlpha(a);
    syncConnectedPeers(peers);

    assert.deepEqual(getPeerTopLevelTexts(a), ['alpha!']);
    assert.deepEqual(getPeerTopLevelTexts(b), ['alpha']);

    connectYjsPeerAndSync(b, peers);

    for (const peer of peers) {
      assert.deepEqual(getPeerTopLevelTexts(peer), ['alpha!']);
    }
  });

  it('recovers only-child lift convergence through real Yjs updates after reconnect', () => {
    const peers = createPeers(['a', 'b', 'c'], onlyChildValue());
    const [, b] = peers;

    disconnectYjsPeer(b);
    liftFirstNestedBlock(b);
    connectYjsPeerAndSync(b, peers);

    for (const peer of peers) {
      assert.deepEqual(getPeerTopLevelTexts(peer), ['alpha']);
    }
  });

  it('undoes and redoes only the local only-child lift after reconnect', () => {
    const peers = createPeers(['a', 'b', 'c'], onlyChildValue());
    const [a, b] = peers;

    disconnectYjsPeer(b);
    liftFirstNestedBlock(b);
    appendNestedAlpha(a);
    syncConnectedPeers(peers);

    connectYjsPeerAndSync(b, peers);
    for (const peer of peers) {
      assert.deepEqual(getPeerTopLevelTexts(peer), ['alpha!']);
    }

    undoHistoryPeerAndSync(b, peers);
    for (const peer of peers) {
      assert.deepEqual(getPeerTopLevelTexts(peer), ['alpha!']);
    }

    redoHistoryPeerAndSync(b, peers);
    for (const peer of peers) {
      assert.deepEqual(getPeerTopLevelTexts(peer), ['alpha!']);
    }
  });

  it('applies a local offline last-child lift through a canonical change', () => {
    const peer = createPeer('b');

    disconnectAndClearYjsTrace(peer);
    liftLastNestedBlock(peer);

    assert.deepEqual(getPeerTopLevelTexts(peer), ['alpha', 'beta', 'gamma']);
    assertCanonicalYjsTrace(peer);
  });

  it('preserves concurrent remote text when an offline last-child lift reconnects', () => {
    const peers = createPeers(['a', 'b', 'c']);
    const [a, b] = peers;

    disconnectYjsPeer(b);
    liftLastNestedBlock(b);
    appendNestedBeta(a);
    syncConnectedPeers(peers);

    assert.deepEqual(getPeerTopLevelTexts(a), ['alphabeta!', 'gamma']);
    assert.deepEqual(getPeerTopLevelTexts(b), ['alpha', 'beta', 'gamma']);

    connectYjsPeerAndSync(b, peers);

    for (const peer of peers) {
      assert.deepEqual(getPeerTopLevelTexts(peer), ['alpha', 'beta!', 'gamma']);
    }
  });

  it('recovers last-child lift convergence through real Yjs updates after reconnect', () => {
    const peers = createPeers(['a', 'b', 'c']);
    const [, b] = peers;

    disconnectYjsPeer(b);
    liftLastNestedBlock(b);
    connectYjsPeerAndSync(b, peers);

    for (const peer of peers) {
      assert.deepEqual(getPeerTopLevelTexts(peer), ['alpha', 'beta', 'gamma']);
    }
  });

  it('undoes and redoes only the local last-child lift after reconnect', () => {
    const peers = createPeers(['a', 'b', 'c']);
    const [a, b] = peers;

    disconnectYjsPeer(b);
    liftLastNestedBlock(b);
    appendNestedBeta(a);
    syncConnectedPeers(peers);

    connectYjsPeerAndSync(b, peers);
    for (const peer of peers) {
      assert.deepEqual(getPeerTopLevelTexts(peer), ['alpha', 'beta!', 'gamma']);
    }

    undoHistoryPeerAndSync(b, peers);
    for (const peer of peers) {
      assert.deepEqual(getPeerTopLevelTexts(peer), ['alphabeta!', 'gamma']);
    }

    redoHistoryPeerAndSync(b, peers);
    for (const peer of peers) {
      assert.deepEqual(getPeerTopLevelTexts(peer), ['alpha', 'beta!', 'gamma']);
    }
  });

  it('applies a local offline middle-child lift through one canonical structural change', () => {
    const peer = createPeer('b', undefined, tripleChildValue());
    const lifted = getVisibleYjsNodeAt(peer, [0, 1]);
    disconnectAndClearYjsTrace(peer);
    liftMiddleNestedBlock(peer);

    assert.deepEqual(getPeerTopLevelTexts(peer), [
      'alpha',
      'beta',
      'gamma',
      'delta',
    ]);
    assert.equal(getVisibleYjsNodeAt(peer, [1]), lifted);
    assertCanonicalYjsTrace(peer);
  });

  it('preserves concurrent remote text when an offline middle-child lift reconnects', () => {
    const peers = createPeers(['a', 'b', 'c'], tripleChildValue());
    const [a, b] = peers;

    disconnectYjsPeer(b);
    liftMiddleNestedBlock(b);
    appendNestedBeta(a);
    syncConnectedPeers(peers);

    assert.deepEqual(getPeerTopLevelTexts(a), ['alphabeta!gamma', 'delta']);
    assert.deepEqual(getPeerTopLevelTexts(b), [
      'alpha',
      'beta',
      'gamma',
      'delta',
    ]);

    connectYjsPeerAndSync(b, peers);

    for (const peer of peers) {
      assert.deepEqual(getPeerTopLevelTexts(peer), [
        'alpha',
        'beta!',
        'gamma',
        'delta',
      ]);
    }
  });

  it('recovers middle-child lift convergence through real Yjs updates after reconnect', () => {
    const peers = createPeers(['a', 'b', 'c'], tripleChildValue());
    const [, b] = peers;

    disconnectYjsPeer(b);
    liftMiddleNestedBlock(b);
    connectYjsPeerAndSync(b, peers);

    for (const peer of peers) {
      assert.deepEqual(getPeerTopLevelTexts(peer), [
        'alpha',
        'beta',
        'gamma',
        'delta',
      ]);
    }
  });

  it('undoes and redoes only the local middle-child lift after reconnect', () => {
    const peers = createPeers(['a', 'b', 'c'], tripleChildValue());
    const [a, b] = peers;

    disconnectYjsPeer(b);
    liftMiddleNestedBlock(b);
    appendNestedBeta(a);
    syncConnectedPeers(peers);

    connectYjsPeerAndSync(b, peers);
    for (const peer of peers) {
      assert.deepEqual(getPeerTopLevelTexts(peer), [
        'alpha',
        'beta!',
        'gamma',
        'delta',
      ]);
    }

    undoHistoryPeerAndSync(b, peers);
    for (const peer of peers) {
      assert.deepEqual(getPeerTopLevelTexts(peer), [
        'alphabeta!gamma',
        'delta',
      ]);
    }

    redoHistoryPeerAndSync(b, peers);
    for (const peer of peers) {
      assert.deepEqual(getPeerTopLevelTexts(peer), [
        'alpha',
        'beta!',
        'gamma',
        'delta',
      ]);
    }
  });
});

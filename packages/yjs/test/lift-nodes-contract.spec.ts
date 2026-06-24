import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Descendant, Operation } from '@platejs/plite';

import {
  connectYjsPeerAndSync,
  createSeededYjsPeers,
  createYjsPeer,
  disconnectAndClearYjsTrace,
  disconnectYjsPeer,
  getPeerTopLevelTexts,
  getVisibleYjsNodeAt,
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
  createYjsPeer({
    children,
    clientId,
    numericClientId: clientIds[clientId],
    seedUpdate,
  });

const createPeers = (
  ids: readonly ClientId[],
  children: readonly Descendant[] = initialValue()
): Peer[] =>
  createSeededYjsPeers({
    children,
    clientIds: ids,
    numericClientIds: clientIds,
  });

const liftFirstNestedBlock = (peer: Peer): void => {
  peer.editor.update((tx) => {
    tx.nodes.lift({ at: [0, 0] });
  });
};

const liftLastNestedBlock = (peer: Peer): void => {
  peer.editor.update((tx) => {
    tx.nodes.lift({ at: [0, 1] });
  });
};

const liftMiddleNestedBlock = (peer: Peer): void => {
  peer.editor.update((tx) => {
    tx.nodes.lift({ at: [0, 1] });
  });
};

const appendNestedAlpha = (peer: Peer): void => {
  peer.editor.update((tx) => {
    tx.text.insert('!', { at: { path: [0, 0, 0], offset: 'alpha'.length } });
  });
};

const appendNestedBeta = (peer: Peer): void => {
  peer.editor.update((tx) => {
    tx.text.insert('!', { at: { path: [0, 1, 0], offset: 'beta'.length } });
  });
};

const collectLiftOperations = (
  lift: (peer: Peer) => void = liftFirstNestedBlock,
  children: readonly Descendant[] = initialValue()
): Operation['type'][] => {
  const peer = createPeer('b', undefined, children);
  const operations = recordOperationTypes(peer, {
    name: 'lift-operation-recorder',
  });
  lift(peer);

  return operations;
};

describe('@platejs/yjs liftNodes collaboration contract', () => {
  it('characterizes first-child public liftNodes as move_node', () => {
    assert.deepEqual(collectLiftOperations(), ['move_node']);
  });

  it('characterizes only-child public liftNodes as move_node then remove_node', () => {
    assert.deepEqual(
      collectLiftOperations(liftFirstNestedBlock, onlyChildValue()),
      ['move_node', 'remove_node']
    );
  });

  it('characterizes middle-child public liftNodes as split_node then move_node', () => {
    assert.deepEqual(
      collectLiftOperations(liftMiddleNestedBlock, tripleChildValue()),
      ['split_node', 'move_node']
    );
  });

  it('applies local offline first-child lift without replacing the original Yjs node', () => {
    const peer = createPeer('b');
    const original = getVisibleYjsNodeAt(peer, [0, 0]);

    disconnectAndClearYjsTrace(peer);
    liftFirstNestedBlock(peer);

    assert.deepEqual(getPeerTopLevelTexts(peer), ['alpha', 'beta', 'gamma']);
    assert.equal(getVisibleYjsNodeAt(peer, [0]), original);
    assert.deepEqual(getYjsTrace(peer), [
      {
        fallback: 'virtual-move-placeholder',
        mode: 'traceable-fallback',
        operationType: 'move_node',
      },
    ]);
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

  it('undoes and redoes only the local first-child lift intent after reconnect', () => {
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

    undoYjsPeerAndSync(b, peers);
    for (const peer of peers) {
      assert.deepEqual(getPeerTopLevelTexts(peer), ['alpha!beta', 'gamma']);
    }

    redoYjsPeerAndSync(b, peers);
    for (const peer of peers) {
      assert.deepEqual(getPeerTopLevelTexts(peer), ['alpha!', 'beta', 'gamma']);
    }
  });

  it('applies local offline only-child lift without replacing the original Yjs node', () => {
    const peer = createPeer('b', undefined, onlyChildValue());
    const original = getVisibleYjsNodeAt(peer, [0, 0]);

    disconnectAndClearYjsTrace(peer);
    liftFirstNestedBlock(peer);

    assert.deepEqual(getPeerTopLevelTexts(peer), ['alpha']);
    assert.equal(getVisibleYjsNodeAt(peer, [0]), original);
    assert.deepEqual(getYjsTrace(peer), [
      {
        fallback: 'virtual-move-placeholder',
        mode: 'traceable-fallback',
        operationType: 'move_node',
      },
      {
        fallback: 'virtual-move-parent-remove',
        mode: 'traceable-fallback',
        operationType: 'remove_node',
      },
    ]);
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

  it('undoes and redoes only the local only-child lift intent after reconnect', () => {
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

    undoYjsPeerAndSync(b, peers);
    for (const peer of peers) {
      assert.deepEqual(getPeerTopLevelTexts(peer), ['alpha!']);
    }

    redoYjsPeerAndSync(b, peers);
    for (const peer of peers) {
      assert.deepEqual(getPeerTopLevelTexts(peer), ['alpha!']);
    }
  });

  it('applies local offline last-child lift without replacing the original Yjs node', () => {
    const peer = createPeer('b');
    const original = getVisibleYjsNodeAt(peer, [0, 1]);

    disconnectAndClearYjsTrace(peer);
    liftLastNestedBlock(peer);

    assert.deepEqual(getPeerTopLevelTexts(peer), ['alpha', 'beta', 'gamma']);
    assert.equal(getVisibleYjsNodeAt(peer, [1]), original);
    assert.deepEqual(getYjsTrace(peer), [
      {
        fallback: 'virtual-move-placeholder',
        mode: 'traceable-fallback',
        operationType: 'move_node',
      },
    ]);
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

  it('undoes and redoes only the local last-child lift intent after reconnect', () => {
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

    undoYjsPeerAndSync(b, peers);
    for (const peer of peers) {
      assert.deepEqual(getPeerTopLevelTexts(peer), ['alphabeta!', 'gamma']);
    }

    redoYjsPeerAndSync(b, peers);
    for (const peer of peers) {
      assert.deepEqual(getPeerTopLevelTexts(peer), ['alpha', 'beta!', 'gamma']);
    }
  });

  it('applies local offline middle-child lift through split_node and move_node', () => {
    const peer = createPeer('b', undefined, tripleChildValue());
    const original = getVisibleYjsNodeAt(peer, [0, 1]);

    disconnectAndClearYjsTrace(peer);
    liftMiddleNestedBlock(peer);

    assert.deepEqual(getPeerTopLevelTexts(peer), [
      'alpha',
      'beta',
      'gamma',
      'delta',
    ]);
    assert.equal(getVisibleYjsNodeAt(peer, [1]), original);
    assert.deepEqual(getYjsTrace(peer), [
      { mode: 'operation', operationType: 'split_node' },
      {
        fallback: 'virtual-move-placeholder',
        mode: 'traceable-fallback',
        operationType: 'move_node',
      },
    ]);
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

  it('undoes and redoes only the local middle-child lift intent after reconnect', () => {
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

    undoYjsPeerAndSync(b, peers);
    for (const peer of peers) {
      assert.deepEqual(getPeerTopLevelTexts(peer), [
        'alphabeta!gamma',
        'delta',
      ]);
    }

    redoYjsPeerAndSync(b, peers);
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

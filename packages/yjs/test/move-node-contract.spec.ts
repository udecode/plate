import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Descendant, Operation } from '@platejs/plite';
import {
  string as editorString,
} from '@platejs/plite/internal';

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
  readPeerChildren,
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
  createYjsPeer({
    children,
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

const createNestedPeers = (ids: readonly ClientId[]): Peer[] =>
  createSeededYjsPeers({
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
  peer.editor.update((tx) => {
    tx.nodes.move({ at: [0], to: [2] });
  });
};

const moveNestedBlockToSecondSection = (peer: Peer): void => {
  peer.editor.update((tx) => {
    tx.nodes.move({ at: [0, 0], to: [1, 1] });
  });
};

const appendRemoteAlpha = (peer: Peer): void => {
  peer.editor.update((tx) => {
    tx.text.insert('!', { at: { path: [0, 0], offset: 'alpha'.length } });
  });
};

const appendNestedRemoteAlpha = (peer: Peer): void => {
  peer.editor.update((tx) => {
    tx.text.insert('!', { at: { path: [0, 0, 0], offset: 'alpha'.length } });
  });
};

const collectMoveOperations = (): Operation['type'][] => {
  const peer = createPeer('b');
  const operations = recordOperationTypes(peer, {
    name: 'move-operation-recorder',
  });
  moveFirstBlockToEnd(peer);

  return operations;
};

describe('@platejs/yjs move_node collaboration contract', () => {
  it('characterizes public moveNodes as move_node', () => {
    assert.deepEqual(collectMoveOperations(), ['move_node']);
  });

  it('applies local offline same-parent move without replacing the original Yjs node', () => {
    const peer = createPeer('b');
    const original = getVisibleYjsNodeAt(peer, [0]);

    disconnectAndClearYjsTrace(peer);
    moveFirstBlockToEnd(peer);

    assert.deepEqual(getPeerTopLevelTexts(peer), ['beta', 'gamma', 'alpha']);
    assert.equal(getVisibleYjsNodeAt(peer, [2]), original);
    assert.deepEqual(getYjsTrace(peer), [
      {
        fallback: 'virtual-move-placeholder',
        mode: 'traceable-fallback',
        operationType: 'move_node',
      },
    ]);
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

  it('undoes and redoes only the local same-parent move intent after reconnect', () => {
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

    undoYjsPeerAndSync(b, peers);
    for (const peer of peers) {
      assert.deepEqual(getPeerTopLevelTexts(peer), ['alpha!', 'beta', 'gamma']);
    }

    redoYjsPeerAndSync(b, peers);
    for (const peer of peers) {
      assert.deepEqual(getPeerTopLevelTexts(peer), ['beta', 'gamma', 'alpha!']);
    }
  });

  it('applies local offline cross-parent move without replacing the original Yjs node', () => {
    const peer = createPeer('b', undefined, nestedInitialValue());
    const original = getVisibleYjsNodeAt(peer, [0, 0]);

    disconnectAndClearYjsTrace(peer);
    moveNestedBlockToSecondSection(peer);

    assert.deepEqual(nestedTexts(peer), [['beta'], ['gamma', 'alpha']]);
    assert.equal(getVisibleYjsNodeAt(peer, [1, 1]), original);
    assert.deepEqual(getYjsTrace(peer), [
      {
        fallback: 'virtual-move-placeholder',
        mode: 'traceable-fallback',
        operationType: 'move_node',
      },
    ]);
  });

  it('moves a sibling before a leading virtual moved child', () => {
    const peer = createPeer('b', undefined, [
      section(),
      paragraph('moved'),
      paragraph('before'),
    ]);

    peer.editor.update((tx) => {
      tx.nodes.move({ at: [1], to: [0, 0] });
    });
    const moved = getVisibleYjsNodeAt(peer, [0, 0]);
    const before = getVisibleYjsNodeAt(peer, [1]);

    disconnectAndClearYjsTrace(peer);
    peer.editor.update((tx) => {
      tx.nodes.move({ at: [1], to: [0, 0] });
    });

    assert.deepEqual(nestedTexts(peer), [['before', 'moved', '']]);
    assert.equal(getVisibleYjsNodeAt(peer, [0, 0]), before);
    assert.equal(getVisibleYjsNodeAt(peer, [0, 1]), moved);
    assert.deepEqual(getYjsTrace(peer), [
      {
        fallback: 'virtual-move-placeholder',
        mode: 'traceable-fallback',
        operationType: 'move_node',
      },
    ]);
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

  it('undoes and redoes only the local cross-parent move intent after reconnect', () => {
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

    undoYjsPeerAndSync(b, peers);
    for (const peer of peers) {
      assert.deepEqual(nestedTexts(peer), [['alpha!', 'beta'], ['gamma']]);
    }

    redoYjsPeerAndSync(b, peers);
    for (const peer of peers) {
      assert.deepEqual(nestedTexts(peer), [['beta'], ['gamma', 'alpha!']]);
    }
  });
});

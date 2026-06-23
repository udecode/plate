import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Descendant, Operation } from '@platejs/plite';

import {
  assertPeerTexts,
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
  redoYjsPeerAndSync,
  syncConnectedPeers,
  undoYjsPeer,
  undoYjsPeerAndSync,
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
  createYjsPeer({
    children,
    clientId,
    numericClientId: clientIds[clientId],
  });

const createPeers = (ids: readonly ClientId[]): Peer[] =>
  createSeededYjsPeers({
    children: initialValue(),
    clientIds: ids,
    numericClientIds: clientIds,
  });

const appendRemoteAlpha = (peer: Peer): void => {
  peer.editor.update((tx) => {
    tx.text.insert('!', { at: { path: [0, 0], offset: 'alpha'.length } });
  });
};

const insertBetaBang = (peer: Peer): void => {
  peer.editor.update((tx) => {
    tx.text.insert('!', { at: { path: [1, 0], offset: 'beta'.length } });
  });
};

const removeBetaMiddle = (peer: Peer): void => {
  peer.editor.update((tx) => {
    tx.text.delete({ at: { path: [1, 0], offset: 1 }, distance: 2 });
  });
};

const insertMiddleBlock = (peer: Peer): void => {
  peer.editor.update((tx) => {
    tx.nodes.insert([paragraph('bravo')], { at: [1] });
  });
};

const replaceMiddleBlock = (peer: Peer): void => {
  const operation: Operation = {
    children: [paragraph('beta')],
    index: 1,
    newChildren: [paragraph('bravo')],
    newSelection: null,
    path: [],
    selection: null,
    type: 'replace_children',
  };

  peer.editor.update((tx) => {
    tx.operations.replay([operation]);
  });
};

const replaceFirstBlock = (peer: Peer): void => {
  const operation: Operation = {
    children: [paragraph('alpha')],
    index: 0,
    newChildren: [paragraph('bravo')],
    newSelection: null,
    path: [],
    selection: null,
    type: 'replace_children',
  };

  peer.editor.update((tx) => {
    tx.operations.replay([operation]);
  });
};

describe('@platejs/yjs simple operation collaboration contract', () => {
  it('applies local offline insert_text in place without a root snapshot fallback', () => {
    const peer = createPeer('b');
    const text = getVisibleYjsNodeAt(peer, [1, 0]);

    disconnectAndClearYjsTrace(peer);
    insertBetaBang(peer);

    assert.deepEqual(getPeerTopLevelTexts(peer), ['alpha', 'beta!', 'gamma']);
    assert.equal(getVisibleYjsNodeAt(peer, [1, 0]), text);
    assert.deepEqual(getYjsTrace(peer), [
      { mode: 'operation', operationType: 'insert_text' },
    ]);
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

    undoYjsPeerAndSync(b, peers);
    assertPeerTexts(peers, ['alpha!', 'beta', 'gamma']);

    redoYjsPeerAndSync(b, peers);
    assertPeerTexts(peers, ['alpha!', 'beta!', 'gamma']);
  });

  it('applies local offline remove_text in place without a root snapshot fallback', () => {
    const peer = createPeer('b');
    const text = getVisibleYjsNodeAt(peer, [1, 0]);

    disconnectAndClearYjsTrace(peer);
    removeBetaMiddle(peer);

    assert.deepEqual(getPeerTopLevelTexts(peer), ['alpha', 'ba', 'gamma']);
    assert.equal(getVisibleYjsNodeAt(peer, [1, 0]), text);
    assert.deepEqual(getYjsTrace(peer), [
      { mode: 'operation', operationType: 'remove_text' },
    ]);
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

    undoYjsPeerAndSync(b, peers);
    assertPeerTexts(peers, ['alpha!', 'beta', 'gamma']);

    redoYjsPeerAndSync(b, peers);
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
    assert.deepEqual(getYjsTrace(peer), [
      { mode: 'operation', operationType: 'insert_node' },
    ]);
  });

  it('inserts before a leading virtual moved child', () => {
    const peer = createPeer('b', [
      { type: 'quote', children: [] },
      paragraph('moved'),
    ]);

    peer.editor.update((tx) => {
      tx.operations.replay([
        {
          newPath: [0, 0],
          path: [1],
          type: 'move_node',
        },
      ]);
    });
    const movedParagraph = getVisibleYjsNodeAt(peer, [0, 0]);

    disconnectAndClearYjsTrace(peer);
    peer.editor.update((tx) => {
      tx.nodes.insert([paragraph('before')], { at: [0, 0] });
    });

    assert.deepEqual(getPeerTopLevelTexts(peer), ['beforemoved']);
    assert.equal(getVisibleYjsNodeAt(peer, [0, 1]), movedParagraph);
    assert.deepEqual(getYjsTrace(peer), [
      { mode: 'operation', operationType: 'insert_node' },
    ]);
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

    undoYjsPeerAndSync(b, peers);
    assertPeerTexts(peers, ['alpha!', 'beta', 'gamma']);

    redoYjsPeerAndSync(b, peers);
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
    assert.deepEqual(getYjsTrace(peer), [
      { mode: 'operation', operationType: 'replace_children' },
    ]);
  });

  it('preserves virtual moved-node identity for compatible replace_children', () => {
    const peer = createPeer('b', [
      { type: 'quote', children: [paragraph('left')] },
      { type: 'quote', children: [] },
      paragraph('moved'),
    ]);

    peer.editor.update((tx) => {
      tx.operations.replay([
        {
          newPath: [1, 0],
          path: [2],
          type: 'move_node',
        },
      ]);
    });
    const movedParagraph = getVisibleYjsNodeAt(peer, [1, 0]);

    disconnectAndClearYjsTrace(peer);
    peer.editor.update((tx) => {
      tx.operations.replay([
        {
          children: [paragraph('moved')],
          index: 0,
          newChildren: [paragraph('moved!')],
          newSelection: null,
          path: [1],
          selection: null,
          type: 'replace_children',
        },
      ]);
    });

    assert.deepEqual(getPeerTopLevelTexts(peer), ['left', 'moved!']);
    assert.equal(getVisibleYjsNodeAt(peer, [1, 0]), movedParagraph);
    assert.deepEqual(getYjsTrace(peer), [
      { mode: 'operation', operationType: 'replace_children' },
    ]);
  });

  it('replaces virtual moved children instead of throwing on removal', () => {
    const peer = createPeer('b', [
      { type: 'quote', children: [paragraph('left')] },
      { type: 'quote', children: [] },
      paragraph('moved'),
    ]);

    peer.editor.update((tx) => {
      tx.operations.replay([
        {
          newPath: [1, 0],
          path: [2],
          type: 'move_node',
        },
      ]);
    });

    disconnectAndClearYjsTrace(peer);
    assert.doesNotThrow(() => {
      peer.editor.update((tx) => {
        tx.operations.replay([
          {
            children: [paragraph('moved')],
            index: 0,
            newChildren: [paragraph('bravo'), paragraph('charlie')],
            newSelection: null,
            path: [1],
            selection: null,
            type: 'replace_children',
          },
        ]);
      });
    });

    assert.deepEqual(getPeerTopLevelTexts(peer), ['left', 'bravocharlie']);
    assert.deepEqual(getYjsTrace(peer), [
      {
        fallback: 'replace-children-virtual-removal',
        mode: 'traceable-fallback',
        operationType: 'replace_children',
      },
    ]);
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

    undoYjsPeerAndSync(b, peers);
    assertPeerTexts(peers, ['alpha!', 'beta', 'gamma']);

    redoYjsPeerAndSync(b, peers);
    assertPeerTexts(peers, ['alpha!', 'bravo', 'gamma']);
  });

  it('preserves remote text when an offline replace_children is undone before reconnect', () => {
    const peers = createPeers(['a', 'b', 'c']);
    const [a, b] = peers;

    disconnectYjsPeer(b);
    replaceFirstBlock(b);
    assert.deepEqual(getPeerTopLevelTexts(b), ['bravo', 'beta', 'gamma']);

    undoYjsPeer(b);
    assert.deepEqual(getPeerTopLevelTexts(b), ['alpha', 'beta', 'gamma']);

    appendRemoteAlpha(a);
    syncConnectedPeers(peers);
    assert.deepEqual(getPeerTopLevelTexts(a), ['alpha!', 'beta', 'gamma']);
    assert.deepEqual(getPeerTopLevelTexts(b), ['alpha', 'beta', 'gamma']);

    connectYjsPeerAndSync(b, peers);

    assertPeerTexts(peers, ['alpha!', 'beta', 'gamma']);
  });
});

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { type Descendant, type Element, ElementApi } from '../../src/index';
import { string as editorString } from '../../src/testing';
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
    ElementApi.isElement(node)
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

describe('plitejs/yjs move_node collaboration contract', () => {
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

  it('keeps the text of a block that one update moves and types in', () => {
    const peers = createPeers(['a', 'b']);
    const [a] = peers;

    a.editor.update((tx) => {
      tx.nodes.move({ at: [0], to: [1] });
      tx.text.insert('X', { at: { offset: 0, path: [1, 0] } });
    });
    syncConnectedPeers(peers);

    assert.deepEqual(peers.map(getPeerTopLevelTexts), [
      ['beta', 'Xalpha', 'gamma'],
      ['beta', 'Xalpha', 'gamma'],
    ]);
  });

  it("keeps a peer's typing in both blocks when one update moves a block and types in its new neighbor", () => {
    const peers = createPeers(['a', 'b']);
    const [a, b] = peers;

    disconnectYjsPeer(b);
    a.editor.update((tx) => {
      tx.nodes.move({ at: [0], to: [1] });
      tx.text.insert('X', { at: { offset: 0, path: [0, 0] } });
    });
    b.editor.update((tx) => {
      tx.text.insert('!', { at: { offset: 'alpha'.length, path: [0, 0] } });
      tx.text.insert('?', { at: { offset: 'beta'.length, path: [1, 0] } });
    });
    connectYjsPeerAndSync(b, peers);

    assert.deepEqual(peers.map(getPeerTopLevelTexts), [
      ['Xbeta?', 'alpha!', 'gamma'],
      ['Xbeta?', 'alpha!', 'gamma'],
    ]);
  });

  it("keeps a peer's typing when one update moves a block past the block it types in", () => {
    const peers = createPeers(['a', 'b']);
    const [a, b] = peers;

    disconnectYjsPeer(b);
    a.editor.update((tx) => {
      tx.nodes.move({ at: [0], to: [2] });
      tx.text.insert('X', { at: { offset: 0, path: [0, 0] } });
    });
    b.editor.update((tx) => {
      tx.text.insert('!', { at: { offset: 'alpha'.length, path: [0, 0] } });
      tx.text.insert('?', { at: { offset: 'beta'.length, path: [1, 0] } });
    });
    connectYjsPeerAndSync(b, peers);

    assert.deepEqual(peers.map(getPeerTopLevelTexts), [
      ['Xbeta?', 'gamma', 'alpha!'],
      ['Xbeta?', 'gamma', 'alpha!'],
    ]);
  });

  it('keeps every block when one update inserts a block, moves another to the front and sets a property on it', () => {
    const peers = createPeers(['a', 'b']);
    const [a] = peers;

    a.editor.update((tx) => {
      tx.nodes.insert(paragraph('new'), { at: [3] });
      tx.nodes.move({ at: [2], to: [0] });
      tx.nodes.set({ align: 'right' } as never, { at: [0] });
    });
    syncConnectedPeers(peers);

    const expected = [
      { ...paragraph('gamma'), align: 'right' },
      paragraph('alpha'),
      paragraph('beta'),
      paragraph('new'),
    ];

    assert.deepEqual(peers.map(readPeerChildren), [expected, expected]);
  });

  it("keeps a peer's typing when one update removes a block with no Yjs text and splits its neighbor", () => {
    const peers = createPeers(['a', 'b']);
    const [a, b] = peers;
    const empty = getVisibleYjsNodeAt(a, [0]);

    empty.delete(0, empty.length);
    syncConnectedPeers(peers);
    disconnectYjsPeer(b);
    a.editor.update((tx) => {
      tx.nodes.remove({ at: [0] });
      tx.nodes.split({ at: { offset: 'be'.length, path: [0, 0] } });
    });
    b.editor.update.text.insert('!', {
      at: { offset: 'beta'.length, path: [1, 0] },
    });
    connectYjsPeerAndSync(b, peers);

    assert.deepEqual(peers.map(getPeerTopLevelTexts), [
      ['be', 'ta!', 'gamma'],
      ['be', 'ta!', 'gamma'],
    ]);
  });

  it('keeps every block when one update moves a block and inserts another', () => {
    const peers = createPeers(['a', 'b']);
    const [a] = peers;

    a.editor.update((tx) => {
      tx.nodes.move({ at: [0], to: [1] });
      tx.nodes.insert(paragraph('new'), { at: [3] });
    });
    syncConnectedPeers(peers);

    assert.deepEqual(peers.map(getPeerTopLevelTexts), [
      ['beta', 'alpha', 'gamma', 'new'],
      ['beta', 'alpha', 'gamma', 'new'],
    ]);
  });

  it("keeps a peer's typing in a block that one update sets a property on while moving a block past it", () => {
    const peers = createPeers(['a', 'b']);
    const [a, b] = peers;

    disconnectYjsPeer(b);
    a.editor.update((tx) => {
      tx.nodes.move({ at: [0], to: [2] });
      tx.nodes.set({ align: 'right' } as never, { at: [0] });
    });
    b.editor.update.text.insert('?', {
      at: { offset: 'beta'.length, path: [1, 0] },
    });
    connectYjsPeerAndSync(b, peers);

    const expected = [
      { ...paragraph('beta?'), align: 'right' },
      paragraph('gamma'),
      paragraph('alpha'),
    ];

    assert.deepEqual(peers.map(readPeerChildren), [expected, expected]);
  });

  it('keeps every peer on one document when one update moves a block and unsets a mark in another', () => {
    const peers = createSeededYjsHistoryPeers({
      children: [
        paragraph('alpha'),
        {
          children: [{ text: 'a' }, { bold: true, text: 'b' }],
          type: 'paragraph',
        },
        paragraph('gamma'),
      ],
      clientIds: ['a', 'b'],
      numericClientIds: clientIds,
    });
    const [a] = peers;

    a.editor.update((tx) => {
      tx.nodes.move({ at: [0], to: [2] });
      tx.nodes.unset('bold', { at: [0, 1] });
    });
    syncConnectedPeers(peers);

    const expected = [paragraph('ab'), paragraph('gamma'), paragraph('alpha')];

    assert.deepEqual(peers.map(readPeerChildren), [expected, expected]);
  });

  it("keeps a peer's typing in a nested block that one update moves into another section while removing that section's block", () => {
    const peers = createSeededYjsHistoryPeers({
      children: [
        section(paragraph('a'), paragraph('b')),
        section(paragraph('c')),
      ],
      clientIds: ['a', 'b'],
      numericClientIds: clientIds,
    });
    const [a, b] = peers;

    disconnectYjsPeer(b);
    a.editor.update((tx) => {
      tx.nodes.move({ at: [0, 0], to: [1, 0] });
      tx.nodes.remove({ at: [1, 1] });
    });
    b.editor.update.text.insert('!', { at: { offset: 1, path: [0, 0, 0] } });
    connectYjsPeerAndSync(b, peers);

    assert.deepEqual(peers.map(nestedTexts), [
      [['b'], ['a!']],
      [['b'], ['a!']],
    ]);
  });

  it("keeps a peer's typing in a nested block that one update moves while removing its sibling", () => {
    const peers = createSeededYjsHistoryPeers({
      children: [section(paragraph('a'), paragraph('b'), paragraph('c'))],
      clientIds: ['a', 'b'],
      numericClientIds: clientIds,
    });
    const [a, b] = peers;

    a.editor.update((tx) => {
      tx.nodes.remove({ at: [0, 1] });
      tx.nodes.move({ at: [0, 1], to: [0, 0] });
    });
    b.editor.update.text.insert('!', { at: { offset: 1, path: [0, 2, 0] } });
    syncConnectedPeers(peers);

    assert.deepEqual(peers.map(nestedTexts), [[['c!', 'a']], [['c!', 'a']]]);
  });

  it("never moves a peer's property onto another block when one update removes a block and moves a nested one", () => {
    const peers = createSeededYjsHistoryPeers({
      children: [paragraph('drop'), section(paragraph('a'), paragraph('b'))],
      clientIds: ['a', 'b'],
      numericClientIds: clientIds,
    });
    const [a, b] = peers;

    a.editor.update((tx) => {
      tx.nodes.remove({ at: [0] });
      tx.nodes.move({ at: [0, 0], to: [0, 1] });
    });
    b.editor.update.nodes.set({ align: 'right' } as never, { at: [1, 0] });
    syncConnectedPeers(peers);

    const reads = peers.map(readPeerChildren);

    assert.deepEqual(reads[0], reads[1]);
    assert.deepEqual(
      reads.map((read) => (read[0] as Element).children[0]),
      [paragraph('b'), paragraph('b')]
    );
  });
});

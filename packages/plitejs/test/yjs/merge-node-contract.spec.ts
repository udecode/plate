import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Y from 'yjs';

import { editorCommands } from '../../src/core/editor-commands';
import type { Descendant } from '../../src/index';
import { DEFAULT_YJS_ROOT_NAME } from '../../src/yjs/core/keys';
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
  readPeerChildren,
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

const backspaceAtLineStart = (peer: Peer, line: number): void => {
  peer.editor.update((tx) => {
    tx.selection.set({
      anchor: { path: [line, 0], offset: 0 },
      focus: { path: [line, 0], offset: 0 },
    });
    tx.command(editorCommands.delete, {
      direction: 'backward',
      unit: 'character',
    });
  });
};

const deleteSecondLetter = (peer: Peer, path: number[]): void => {
  peer.editor.update.text.delete({
    at: { anchor: { path, offset: 1 }, focus: { path, offset: 2 } },
  });
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

  it('keeps two peers typing in one block after the second half of a joined text is deleted', () => {
    const peers = createPeers(['a', 'b']);
    const [a, b] = peers;

    mergeSecondParagraph(a);
    syncConnectedPeers(peers);
    a.editor.update.text.delete({
      at: {
        anchor: { path: [0, 0], offset: 'alpha'.length },
        focus: { path: [0, 0], offset: 'alphabeta'.length },
      },
    });
    syncConnectedPeers(peers);
    for (const peer of peers) clearYjsTrace(peer);
    a.editor.update.text.insert('x', { at: { path: [0, 0], offset: 1 } });
    b.editor.update.text.insert('y', {
      at: { path: [0, 0], offset: 'alpha'.length },
    });
    syncConnectedPeers(peers);

    assertPeerTexts(peers, ['axlphay']);
    for (const peer of peers) {
      assert.deepEqual(
        getYjsTrace(peer).flatMap((entry) => entry.fallback ?? []),
        []
      );
    }
  });

  it('keeps what a peer types beside an empty bold Yjs text plain on every peer', () => {
    const children: Descendant[] = [
      {
        type: 'paragraph',
        children: [{ bold: true, text: 'alpha' }, { text: 'z' }],
      },
    ];
    const seed = createPeer('seed', undefined, children);
    const root = seed.doc.share.get(DEFAULT_YJS_ROOT_NAME) as Y.XmlElement;
    const paragraphNode = root.get(0) as Y.XmlElement;
    const empty = new Y.XmlText();

    seed.doc.transact(() => {
      paragraphNode.insert(1, [empty]);
      empty.setAttribute('bold', true);
      empty.setAttribute('yjs:id', 'written-elsewhere');
    });

    const room = Y.encodeStateAsUpdate(seed.doc);
    const peers = [
      createPeer('a', room, children),
      createPeer('b', room, children),
    ];
    const [a] = peers;

    a.editor.update.text.insert('x', { at: { path: [0, 1], offset: 0 } });
    syncConnectedPeers(peers);

    assert.deepEqual(
      peers.map((peer) => peer.editor.read.children()),
      Array.from({ length: 2 }, () => [
        {
          type: 'paragraph',
          children: [{ bold: true, text: 'alpha' }, { text: 'xz' }],
        },
      ])
    );
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

  it('restores an undone deletion in place inside a line a peer merged', () => {
    const peers = createPeers(['a', 'b'], [paragraph('ab'), paragraph('cd')]);
    const [a, b] = peers;

    b.editor.update.text.delete({
      at: {
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 2 },
      },
    });
    syncConnectedPeers(peers);
    mergeSecondParagraph(a);
    syncConnectedPeers(peers);
    undoHistoryPeerAndSync(b, peers);

    assertPeerTexts(peers, ['abcd']);
  });

  it('undoes a line break without merging the line a peer moved under it', () => {
    const peers = createPeers(['a', 'b'], [paragraph('abcd'), paragraph('ef')]);
    const [a, b] = peers;

    b.editor.update((tx) => {
      tx.selection.set({
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [0, 0], offset: 2 },
      });
      tx.break.insert();
    });
    syncConnectedPeers(peers);
    a.editor.update.nodes.move({ at: [1], to: [2] });
    syncConnectedPeers(peers);
    undoHistoryPeerAndSync(b, peers);

    assertPeerTexts(peers, ['abcd', 'ef']);
  });

  it('undoes a line break without merging the lines a peer swapped', () => {
    const peers = createPeers(['a', 'b'], [paragraph('abcd'), paragraph('ef')]);
    const [a, b] = peers;

    b.editor.update((tx) => {
      tx.selection.set({
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [0, 0], offset: 2 },
      });
      tx.break.insert();
    });
    syncConnectedPeers(peers);
    a.editor.update.nodes.move({ at: [1], to: [0] });
    syncConnectedPeers(peers);
    undoHistoryPeerAndSync(b, peers);

    assertPeerTexts(peers, ['abcd', 'ef']);
  });

  it('does not glue an undone line onto the line a peer merged into it while empty', () => {
    const peers = createPeers(['a', 'b'], [paragraph('ab'), paragraph('cd')]);
    const [a, b] = peers;

    b.editor.update.text.delete({
      at: {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 2 },
      },
    });
    syncConnectedPeers(peers);
    mergeSecondParagraph(a);
    syncConnectedPeers(peers);
    undoHistoryPeerAndSync(b, peers);

    const [first, ...rest] = peers.map(getPeerTopLevelTexts);

    assert.notEqual(first?.[0], 'abcd');
    assert.ok(first?.includes('cd'));
    for (const texts of rest) assert.deepEqual(texts, first);
  });

  it('keeps a merged line whole when undoing an older removal beside it', () => {
    const peers = createPeers(
      ['a', 'b'],
      [paragraph('ab'), paragraph('xx'), paragraph('cd')]
    );
    const [a, b] = peers;

    b.editor.update.nodes.remove({ at: [1] });
    b.editor.update.text.delete({
      at: {
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 2 },
      },
    });
    syncConnectedPeers(peers);
    mergeSecondParagraph(a);
    syncConnectedPeers(peers);
    undoHistoryPeerAndSync(b, peers);
    undoHistoryPeerAndSync(b, peers);

    assertPeerTexts(peers, ['abcd', 'xx']);
  });

  it('restores an undone deletion in place when a peer merges and edits another line in one update', () => {
    const peers = createPeers(
      ['a', 'b'],
      [paragraph('ab'), paragraph('cd'), paragraph('ef')]
    );
    const [a, b] = peers;

    b.editor.update.text.delete({
      at: {
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 2 },
      },
    });
    syncConnectedPeers(peers);
    mergeSecondParagraph(a);
    a.editor.update.text.insert('Z', { at: { path: [1, 0], offset: 2 } });
    syncConnectedPeers(peers);
    undoHistoryPeerAndSync(b, peers);

    assertPeerTexts(peers, ['abcd', 'efZ']);
  });

  it('restores an undone deletion in place inside a quote whose lines a peer merged', () => {
    const peers = createPeers(
      ['a', 'b'],
      [{ type: 'quote', children: [paragraph('ab'), paragraph('cd')] }]
    );
    const [a, b] = peers;

    b.editor.update.text.delete({
      at: {
        anchor: { path: [0, 0, 0], offset: 1 },
        focus: { path: [0, 0, 0], offset: 2 },
      },
    });
    syncConnectedPeers(peers);
    a.editor.update.nodes.merge({ at: [0, 1] });
    syncConnectedPeers(peers);
    undoHistoryPeerAndSync(b, peers);

    for (const peer of peers) {
      assert.deepEqual(readPeerChildren(peer), [
        { type: 'quote', children: [paragraph('abcd')] },
      ]);
    }
  });

  it('restores an undone deletion in place inside a quote when a peer merges its lines and types outside it in one update', () => {
    const peers = createPeers(
      ['a', 'b'],
      [
        { type: 'quote', children: [paragraph('ab'), paragraph('cd')] },
        paragraph('zz'),
      ]
    );
    const [a, b] = peers;

    b.editor.update.text.delete({
      at: {
        anchor: { path: [0, 0, 0], offset: 1 },
        focus: { path: [0, 0, 0], offset: 2 },
      },
    });
    syncConnectedPeers(peers);
    a.editor.update.nodes.merge({ at: [0, 1] });
    a.editor.update.text.insert('Z', { at: { path: [1, 0], offset: 2 } });
    syncConnectedPeers(peers);
    undoHistoryPeerAndSync(b, peers);

    for (const peer of peers) {
      assert.deepEqual(readPeerChildren(peer), [
        { type: 'quote', children: [paragraph('abcd')] },
        paragraph('zzZ'),
      ]);
    }
  });

  it('undoes typing in the second of two lines a peer merged', () => {
    const peers = createPeers(['a', 'b'], [paragraph('ab'), paragraph('cd')]);
    const [a, b] = peers;

    b.editor.update.text.insert('Y', { at: { path: [1, 0], offset: 1 } });
    syncConnectedPeers(peers);
    mergeSecondParagraph(a);
    syncConnectedPeers(peers);
    undoHistoryPeerAndSync(b, peers);

    assertPeerTexts(peers, ['abcd']);
  });

  it('does not glue an undone line onto the line above when a peer merged it away while empty', () => {
    const peers = createPeers(['a', 'b'], [paragraph('ab'), paragraph('cd')]);
    const [a, b] = peers;

    b.editor.update.text.delete({
      at: {
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 2 },
      },
    });
    syncConnectedPeers(peers);
    mergeSecondParagraph(a);
    syncConnectedPeers(peers);
    undoHistoryPeerAndSync(b, peers);

    const [first, ...rest] = peers.map(getPeerTopLevelTexts);

    assert.notEqual(first?.[0], 'abcd');
    assert.ok(first?.includes('ab'));
    for (const texts of rest) assert.deepEqual(texts, first);
  });

  it('does not glue an undone heading onto the paragraph a peer merged into it while empty', () => {
    const peers = createPeers(
      ['a', 'b'],
      [{ type: 'heading', children: [{ text: 'ab' }] }, paragraph('cd')]
    );
    const [a, b] = peers;

    b.editor.update.text.delete({
      at: {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 2 },
      },
    });
    syncConnectedPeers(peers);
    mergeSecondParagraph(a);
    syncConnectedPeers(peers);
    undoHistoryPeerAndSync(b, peers);

    const [first, ...rest] = peers.map(getPeerTopLevelTexts);

    assert.notEqual(first?.[0], 'abcd');
    assert.ok(first?.includes('cd'));
    for (const texts of rest) assert.deepEqual(texts, first);
  });

  it('keeps both merged lines when undoing a Backspace in a blank line between them', () => {
    const peers = createPeers(
      ['a', 'b'],
      [paragraph('ab'), paragraph(''), paragraph('cd')]
    );
    const [a, b] = peers;

    b.editor.update((tx) => {
      tx.selection.set({
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 0 },
      });
      tx.command(editorCommands.delete, {
        direction: 'backward',
        unit: 'character',
      });
    });
    syncConnectedPeers(peers);
    mergeSecondParagraph(a);
    syncConnectedPeers(peers);
    undoHistoryPeerAndSync(b, peers);

    assertPeerTexts(peers, ['abcd', '']);
  });

  it('keeps both merged lines when undoing a Delete at the end of a blank line between them', () => {
    const peers = createPeers(
      ['a', 'b'],
      [paragraph('ab'), paragraph(''), paragraph('cd')]
    );
    const [a, b] = peers;

    b.editor.update((tx) => {
      tx.selection.set({
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 0 },
      });
      tx.command(editorCommands.delete, {
        direction: 'forward',
        unit: 'character',
      });
    });
    syncConnectedPeers(peers);
    mergeSecondParagraph(a);
    syncConnectedPeers(peers);
    undoHistoryPeerAndSync(b, peers);

    assertPeerTexts(peers, ['abcd', '']);
  });

  it("keeps a peer's join of the next line into the joined one when undoing a Backspace", () => {
    const peers = createPeers(
      ['a', 'b'],
      [paragraph('a'), paragraph('bc'), paragraph('defg')]
    );
    const [a, b] = peers;

    backspaceAtLineStart(b, 1);
    syncConnectedPeers(peers);
    backspaceAtLineStart(a, 1);
    syncConnectedPeers(peers);
    undoHistoryPeerAndSync(b, peers);

    assertPeerTexts(peers, ['a', 'bcdefg']);
  });

  it("redoes a line break and keeps a peer's join of the next line into its line", () => {
    const peers = createPeers(
      ['a', 'b'],
      [paragraph('abc'), paragraph('defg')]
    );
    const [a, b] = peers;

    b.editor.update((tx) => {
      tx.selection.set({
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 1 },
      });
      tx.break.insert();
    });
    syncConnectedPeers(peers);
    undoHistoryPeerAndSync(b, peers);
    mergeSecondParagraph(a);
    syncConnectedPeers(peers);
    redoHistoryPeerAndSync(b, peers);

    assertPeerTexts(peers, ['a', 'bcdefg']);
  });

  it('restores an undone deletion in place when a peer merges two pairs of lines in one update', () => {
    const peers = createPeers(
      ['a', 'b'],
      [paragraph('ab'), paragraph('cd'), paragraph('ef'), paragraph('gh')]
    );
    const [a, b] = peers;

    deleteSecondLetter(b, [0, 0]);
    syncConnectedPeers(peers);
    a.editor.update((tx) => {
      tx.nodes.merge({ at: [3] });
      tx.nodes.merge({ at: [1] });
    });
    syncConnectedPeers(peers);
    undoHistoryPeerAndSync(b, peers);

    assertPeerTexts(peers, ['abcd', 'efgh']);
  });

  it('restores an undone deletion in place when a peer merges and removes another line in one update', () => {
    const peers = createPeers(
      ['a', 'b'],
      [paragraph('ab'), paragraph('cd'), paragraph('ef'), paragraph('gh')]
    );
    const [a, b] = peers;

    deleteSecondLetter(b, [0, 0]);
    syncConnectedPeers(peers);
    a.editor.update((tx) => {
      tx.nodes.remove({ at: [3] });
      tx.nodes.merge({ at: [1] });
    });
    syncConnectedPeers(peers);
    undoHistoryPeerAndSync(b, peers);

    assertPeerTexts(peers, ['abcd', 'ef']);
  });

  it('restores an undone deletion in place when a peer also merges the lines above in one update', () => {
    const peers = createPeers(
      ['a', 'b'],
      [
        paragraph('xx'),
        paragraph('yy'),
        paragraph('ab'),
        paragraph('cd'),
        paragraph('ij'),
      ]
    );
    const [a, b] = peers;

    deleteSecondLetter(b, [2, 0]);
    syncConnectedPeers(peers);
    a.editor.update((tx) => {
      tx.nodes.merge({ at: [3] });
      tx.nodes.merge({ at: [1] });
    });
    syncConnectedPeers(peers);
    undoHistoryPeerAndSync(b, peers);

    assertPeerTexts(peers, ['xxyy', 'abcd', 'ij']);
  });

  it('restores an undone deletion in place when a peer merges and types in the merged line in one update', () => {
    const peers = createPeers(['a', 'b'], [paragraph('ab'), paragraph('cd')]);
    const [a, b] = peers;

    deleteSecondLetter(b, [0, 0]);
    syncConnectedPeers(peers);
    a.editor.update((tx) => {
      tx.text.insert('!', { at: { path: [1, 0], offset: 2 } });
      tx.nodes.merge({ at: [1] });
    });
    syncConnectedPeers(peers);
    undoHistoryPeerAndSync(b, peers);

    assertPeerTexts(peers, ['abcd!']);
  });

  it('restores an undone deletion in place when a peer merges three lines in one update', () => {
    const peers = createPeers(
      ['a', 'b'],
      [paragraph('aa'), paragraph('bxb'), paragraph('cc')]
    );
    const [a, b] = peers;

    deleteSecondLetter(b, [1, 0]);
    syncConnectedPeers(peers);
    a.editor.update((tx) => {
      tx.nodes.merge({ at: [2] });
      tx.nodes.merge({ at: [1] });
    });
    syncConnectedPeers(peers);
    undoHistoryPeerAndSync(b, peers);

    assertPeerTexts(peers, ['aabxbcc']);
  });

  it('undoes a line join that a peer bolded into equal text leaves', () => {
    const peers = createPeers(
      ['a', 'b'],
      [
        {
          type: 'paragraph',
          children: [{ text: 'a' }, { text: 'b', bold: true }, { text: 'c' }],
        },
        paragraph('d'),
        paragraph('q'),
      ]
    );
    const [a, b] = peers;

    b.editor.update.text.insert('Z', { at: { path: [2, 0], offset: 1 } });
    b.editor.update((tx) => {
      tx.history.newBatch();
      tx.text.delete({
        at: {
          anchor: { path: [0, 0], offset: 1 },
          focus: { path: [1, 0], offset: 0 },
        },
      });
    });
    a.editor.update((tx) => {
      tx.selection.set({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 2], offset: 1 },
      });
      tx.marks.toggle('bold');
    });
    syncConnectedPeers(peers);
    undoHistoryPeerAndSync(b, peers);
    undoHistoryPeerAndSync(b, peers);

    for (const peer of peers) {
      assert.deepEqual(readPeerChildren(peer), [
        {
          type: 'paragraph',
          children: [{ text: 'ab', bold: true }, { text: 'c' }],
        },
        paragraph('d'),
        paragraph('q'),
      ]);
    }
  });

  it('undoes a formatting line join that a peer bolded, then the edit before it', () => {
    const peers = createPeers(
      ['a', 'b'],
      [
        {
          type: 'paragraph',
          children: [{ text: 'a' }, { text: 'b', bold: true }, { text: 'c' }],
        },
        paragraph('d'),
        paragraph('q'),
      ]
    );
    const [a, b] = peers;

    b.editor.update.text.insert('Z', { at: { path: [2, 0], offset: 1 } });
    b.editor.update((tx) => {
      tx.history.newBatch();
      tx.selection.set({
        anchor: { path: [2, 0], offset: 0 },
        focus: { path: [2, 0], offset: 2 },
      });
      tx.marks.toggle('bold');
      tx.text.delete({
        at: {
          anchor: { path: [0, 0], offset: 1 },
          focus: { path: [1, 0], offset: 0 },
        },
      });
    });
    a.editor.update((tx) => {
      tx.selection.set({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 2], offset: 1 },
      });
      tx.marks.toggle('bold');
    });
    syncConnectedPeers(peers);
    undoHistoryPeerAndSync(b, peers);
    undoHistoryPeerAndSync(b, peers);

    assertPeerTexts(peers, ['abc', 'd', 'q']);
    assert.equal(b.editor.read.history().undos.length, 0);
  });

  const mergeTwoLines = () =>
    createPeers(
      ['a', 'b'],
      [
        {
          type: 'paragraph',
          children: [{ text: 'a' }, { text: 'bc', bold: true }],
        },
        {
          type: 'paragraph',
          children: [{ text: 'd' }, { text: 'e', bold: true }],
        },
        paragraph('f'),
      ]
    );
  const breakAt = (peer: Peer, path: number[], offset: number) => {
    peer.editor.update((tx) => {
      tx.selection.set({ anchor: { path, offset }, focus: { path, offset } });
      tx.break.insert();
    });
  };

  for (const [name, path, offset, first, second] of [
    ['a leaf edge', [0, 0], 1, [{ text: 'a' }], [{ text: 'bc', bold: true }]],
    [
      'a word',
      [0, 1],
      1,
      [{ text: 'a' }, { text: 'b', bold: true }],
      [{ text: 'c', bold: true }],
    ],
  ] as const) {
    it(`undoes a merge whose split-off line a peer emptied, keeping an Enter in ${name}`, () => {
      const peers = mergeTwoLines();
      const [a, b] = peers;

      mergeSecondParagraph(b);
      a.editor.update.text.delete({
        at: {
          anchor: { path: [0, 1], offset: 2 },
          focus: { path: [2, 0], offset: 1 },
        },
      });
      breakAt(a, [...path], offset);
      syncConnectedPeers(peers);
      undoHistoryPeerAndSync(b, peers);

      for (const peer of peers) {
        assert.deepEqual(readPeerChildren(peer), [
          { type: 'paragraph', children: first },
          { type: 'paragraph', children: second },
          paragraph(''),
        ]);
      }
    });
  }

  it('undoes a merge whose first line a peer split in a word, keeping the Enter', () => {
    const peers = mergeTwoLines();
    const [a, b] = peers;

    mergeSecondParagraph(b);
    breakAt(a, [0, 1], 1);
    syncConnectedPeers(peers);
    undoHistoryPeerAndSync(b, peers);

    for (const peer of peers) {
      assert.deepEqual(readPeerChildren(peer), [
        {
          type: 'paragraph',
          children: [{ text: 'a' }, { text: 'b', bold: true }],
        },
        {
          type: 'paragraph',
          children: [{ text: 'd' }, { text: 'e', bold: true }],
        },
        { type: 'paragraph', children: [{ text: 'c', bold: true }] },
        paragraph('f'),
      ]);
    }
  });
});

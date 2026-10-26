import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Y from 'yjs';

import { history } from '../../src/history';
import {
  createEditor,
  defineEditorSchema,
  type Descendant,
  type Point,
  property,
  schema,
} from '../../src/index';
import { string as editorString } from '../../src/testing';
import {
  assertCanonicalYjsTrace,
  assertPeerTexts,
  connectYjsPeerAndSync,
  createSeededYjsHistoryPeers,
  createYjsHistoryPeer,
  createYjsPeerWithEditor,
  disconnectAndClearYjsTrace,
  disconnectYjsPeer,
  FakeAwareness,
  getPeerTopLevelTexts,
  getVisibleYjsNodeAt,
  getYjsNodeAt,
  type Peer,
  paragraph,
  readPeerChildren,
  readPeerPliteValue,
  redoHistoryPeer,
  redoHistoryPeerAndSync,
  syncConnectedPeers,
  undoHistoryPeer,
  undoHistoryPeerAndSync,
} from './support/collaboration';

const initialValue = (): Descendant[] => [paragraph('alphabeta')];

const helloValue = (): Descendant[] => [paragraph('Hello world!')];

const createPeer = (
  clientId: string,
  seedUpdate?: Uint8Array,
  children: readonly Descendant[] = initialValue()
): Peer => createYjsHistoryPeer({ children, clientId, seedUpdate });

const createPeers = (
  clientIds: readonly string[],
  children: readonly Descendant[] = initialValue()
): Peer[] => createSeededYjsHistoryPeers({ children, clientIds });

// The split's cut and a letter typed at the split point follow the same
// letter, so Yjs orders them by client id. The typing peer's lower id keeps
// the letter on the first line.
const createOrderedPeers = (): Peer[] =>
  createSeededYjsHistoryPeers({
    children: initialValue(),
    clientIds: ['a', 'b', 'c'],
    numericClientIds: { a: 1, b: 2, c: 3 },
  });

/** Peers where `a` holds client id `aId` and `b` the other of 1 and 2. */
const createHelloPeers = (aId: 1 | 2): Peer[] =>
  createSeededYjsHistoryPeers({
    children: helloValue(),
    clientIds: ['a', 'b', 'c'],
    numericClientIds: { a: aId, b: 3 - aId, c: 3 },
  });

const splitParagraph = (peer: Peer): void => {
  peer.editor.update.nodes.split({
    at: { path: [0, 0], offset: 'alph'.length },
  });
};

const splitHelloParagraph = (peer: Peer): void => {
  peer.editor.update.nodes.split({
    at: { path: [0, 0], offset: 'Hello '.length },
  });
};

const insertRemoteTextAtSplitPoint = (peer: Peer): void => {
  peer.editor.update.text.insert('!', {
    at: { path: [0, 0], offset: 'alph'.length },
  });
};

const appendRemoteText = (peer: Peer): void => {
  peer.editor.update.text.insert('!', {
    at: { path: [0, 0], offset: 'alphabeta'.length },
  });
};

const appendExclamationToFirstParagraph = (peer: Peer): void => {
  const offset = editorString(peer.editor, [0]).length;

  peer.editor.update.text.insert('!', { at: { path: [0, 0], offset } });
};

const insertWorldParagraphAfterFirst = (peer: Peer): void => {
  const offset = editorString(peer.editor, [0]).length;

  peer.editor.update.selection.set({
    kind: 'text',
    anchor: { path: [0, 0], offset },
    focus: { path: [0, 0], offset },
  });
  peer.editor.update.break.insert();
  peer.editor.update.text.insert('world! after');
};

const insertTextSplitAndInsertRightText = (peer: Peer): void => {
  peer.editor.update.selection.set({
    kind: 'text',
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [0, 0], offset: 0 },
  });
  peer.editor.update.text.insert('a');
  peer.editor.update.break.insert();
  peer.editor.update.text.insert('b');
};

const MarkSchema = defineEditorSchema('schema:yjs-split-leaf-edge', {
  elements: { paragraph: { content: schema.content.text() } },
  properties: [
    schema.textProperty('bold', property.boolean()),
    schema.textProperty('color', property.string()),
  ],
  root: schema.content.not(schema.content.text()),
  unknown: 'reject',
});

const createMarkPeers = (
  children: readonly Descendant[],
  { awareness }: { awareness: boolean }
) => {
  const errors: unknown[] = [];
  const create = (
    numericClientId: number,
    seedUpdate?: Uint8Array,
    initial = children
  ) =>
    createYjsPeerWithEditor(
      createEditor({
        initialValue: initial,
        lifecycleErrorSink: (error) => errors.push(error.cause),
        plugins: [MarkSchema, history()],
      }),
      {
        ...(awareness ? { awareness: new FakeAwareness(numericClientId) } : {}),
        children: initial,
        clientId: String(numericClientId),
        numericClientId,
        seedUpdate,
      }
    );
  const writer = create(1);
  const peer = create(2, Y.encodeStateAsUpdate(writer.doc));

  return {
    peer,
    peers: [writer, peer],
    /** Each editor's value, and what a peer joining from the writer's Y.Doc shows. */
    read: () => ({
      errors,
      fresh: readPeerChildren(
        create(3, Y.encodeStateAsUpdate(writer.doc), [paragraph('seed')])
      ),
      peer: readPeerChildren(peer),
      writer: readPeerChildren(writer),
    }),
    writer,
  };
};

const breakAt = (peer: Peer, point: Point): void => {
  peer.editor.update((tx) => {
    tx.selection.set({ kind: 'text', anchor: point, focus: point });
    tx.break.insert();
  });
};

const settled = (expected: readonly Descendant[]) => ({
  errors: [],
  fresh: expected,
  peer: expected,
  writer: expected,
});

const redTail = (): Descendant[] => [
  {
    children: [{ text: 'word' }, { color: 'red', text: ' tail' }],
    type: 'paragraph',
  },
];

const boldName = (): Descendant[] => [
  {
    children: [
      { text: 'Ada and ' },
      { bold: true, text: 'Lin' },
      { text: ' edit.' },
    ],
    type: 'paragraph',
  },
];

const leafEdgeBreaks = [
  {
    awareness: false,
    children: redTail(),
    expected: [
      { children: [{ text: 'word' }], type: 'paragraph' },
      { children: [{ color: 'red', text: ' tail' }], type: 'paragraph' },
    ],
    point: { path: [0, 0], offset: 'word'.length },
    title: 'at the end of a leaf before a marked leaf',
  },
  {
    awareness: false,
    children: redTail(),
    expected: [
      { children: [{ text: 'word' }], type: 'paragraph' },
      { children: [{ color: 'red', text: ' tail' }], type: 'paragraph' },
    ],
    point: { path: [0, 1], offset: 0 },
    title: 'at the start of a marked leaf',
  },
  {
    awareness: true,
    children: boldName(),
    expected: [
      {
        children: [{ text: 'Ada and ' }, { bold: true, text: 'Lin' }],
        type: 'paragraph',
      },
      { children: [{ text: ' edit.' }], type: 'paragraph' },
    ],
    point: { path: [0, 1], offset: 'Lin'.length },
    title: 'at the end of a bold word with awareness on (plate#5278)',
  },
  {
    awareness: true,
    children: boldName(),
    expected: [
      { children: [{ text: 'Ada and ' }], type: 'paragraph' },
      {
        children: [{ bold: true, text: 'Lin' }, { text: ' edit.' }],
        type: 'paragraph',
      },
    ],
    point: { path: [0, 1], offset: 0 },
    title: 'at the start of a bold word with awareness on (plate#5278)',
  },
] as const;

describe('plitejs/yjs split_node collaboration contract', () => {
  for (const {
    awareness,
    children,
    expected,
    point,
    title,
  } of leafEdgeBreaks) {
    it(`stores both lines of an Enter ${title}`, () => {
      const { peers, read, writer } = createMarkPeers(children, { awareness });

      breakAt(writer, point);
      syncConnectedPeers(peers);

      assert.deepEqual(read(), settled(expected));
    });
  }

  for (const order of ['writer-first', 'peer-first'] as const) {
    it(`keeps a peer's typing beside an Enter after a bold word, ${order} (plate#5278)`, () => {
      const { peer, peers, read, writer } = createMarkPeers(boldName(), {
        awareness: true,
      });

      breakAt(writer, { path: [0, 1], offset: 'Lin'.length });
      peer.editor.update.text.insert('U', { at: { path: [0, 0], offset: 0 } });
      syncConnectedPeers(order === 'writer-first' ? peers : [peer, writer]);

      assert.deepEqual(
        read(),
        settled([
          {
            children: [{ text: 'UAda and ' }, { bold: true, text: 'Lin' }],
            type: 'paragraph',
          },
          { children: [{ text: ' edit.' }], type: 'paragraph' },
        ])
      );
    });
  }

  it('applies a local offline public split as a canonical change', () => {
    const peer = createPeer('b');
    const leftText = getYjsNodeAt(peer, [0, 0]);

    disconnectAndClearYjsTrace(peer);
    splitParagraph(peer);

    assert.deepEqual(getPeerTopLevelTexts(peer), ['alph', 'abeta']);
    assert.equal(getYjsNodeAt(peer, [0, 0]), leftText);
    assertCanonicalYjsTrace(peer);
  });

  it('splits a block at a text leaf boundary without materializing empty text', () => {
    const peer = createPeer('b', undefined, [
      {
        children: [{ text: 'alpha' }, { bold: true, text: 'beta' }],
        type: 'paragraph',
      },
    ]);

    peer.editor.update.nodes.split({
      at: { path: [0, 0], offset: 'alpha'.length },
    });

    assert.deepEqual(readPeerChildren(peer), [
      {
        children: [{ text: 'alpha' }],
        type: 'paragraph',
      },
      {
        children: [{ bold: true, text: 'beta' }],
        type: 'paragraph',
      },
    ]);
  });

  it('splits at the physical boundary resolved across canonical text leaves', () => {
    const peer = createPeer('b', undefined, [paragraph('alpha')]);
    const paragraphNode = getYjsNodeAt(peer, [0]);

    assert.ok(paragraphNode instanceof Y.XmlElement);

    peer.doc.transact(() => {
      const left = new Y.XmlText();
      const right = new Y.XmlText();

      left.insert(0, 'al');
      right.insert(0, 'pha');
      paragraphNode.delete(0, 1);
      paragraphNode.insert(0, [left, right]);
    });

    assert.equal(paragraphNode.toArray().length, 2);
    assert.deepEqual(readPeerChildren(peer), [paragraph('alpha')]);

    peer.editor.update.nodes.split({
      at: { path: [0, 0], offset: 3 },
    });

    assert.deepEqual(readPeerChildren(peer), [
      paragraph('alp'),
      paragraph('ha'),
    ]);
  });

  it('does not cross into an adjacent text leaf with different properties', () => {
    const children = [
      {
        children: [{ bold: true, text: 'alpha' }, { text: 'beta' }],
        type: 'paragraph',
      },
    ];
    const peers = createPeers(['a', 'b', 'c'], children);
    const [a] = peers;
    const expected = [
      {
        children: [{ bold: true, text: 'al' }],
        type: 'paragraph',
      },
      {
        children: [{ bold: true, text: 'pha' }, { text: 'beta' }],
        type: 'paragraph',
      },
    ];

    a.editor.update.nodes.split({ at: { path: [0, 0], offset: 2 } });

    assert.deepEqual(readPeerChildren(a), expected);
    assert.deepEqual(readPeerPliteValue(a), expected);
    syncConnectedPeers(peers);
    for (const peer of peers) {
      assert.deepEqual(readPeerChildren(peer), expected);
    }
  });

  it('splits moved content by visible child position', () => {
    const peer = createPeer('b', undefined, [
      { type: 'quote', children: [] },
      paragraph('moved'),
    ]);

    peer.editor.update.nodes.move({ at: [1], to: [0, 0] });
    const movedParagraph = getVisibleYjsNodeAt(peer, [0, 0]);

    disconnectAndClearYjsTrace(peer);
    peer.editor.update.nodes.split({ at: [0], position: 0 });
    assert.deepEqual(getPeerTopLevelTexts(peer), ['', 'moved']);
    assert.equal(getVisibleYjsNodeAt(peer, [1, 0]), movedParagraph);
    assertCanonicalYjsTrace(peer);
  });

  it('splits raw children after a leading moved child', () => {
    const peer = createPeer('b', undefined, [
      { type: 'quote', children: [] },
      paragraph('moved'),
    ]);

    peer.editor.update((tx) => {
      tx.nodes.move({ at: [1], to: [0, 0] });
      tx.nodes.insert([paragraph('raw')], { at: [0, 1] });
    });
    const movedParagraph = getVisibleYjsNodeAt(peer, [0, 0]);

    disconnectAndClearYjsTrace(peer);
    peer.editor.update.nodes.split({ at: [0], position: 1 });

    assert.deepEqual(getPeerTopLevelTexts(peer), ['moved', 'raw']);
    assert.equal(getVisibleYjsNodeAt(peer, [0, 0]), movedParagraph);
    assertCanonicalYjsTrace(peer);
  });

  it('preserves a concurrent remote insertion when an offline public split reconnects', () => {
    const peers = createOrderedPeers();
    const [a, b] = peers;

    disconnectYjsPeer(b);
    splitParagraph(b);
    insertRemoteTextAtSplitPoint(a);
    syncConnectedPeers(peers);

    assert.deepEqual(getPeerTopLevelTexts(a), ['alph!abeta']);
    assert.deepEqual(getPeerTopLevelTexts(b), ['alph', 'abeta']);

    connectYjsPeerAndSync(b, peers);

    assertPeerTexts(peers, ['alph!', 'abeta']);
  });

  it('recovers split convergence through real Yjs updates after reconnect', () => {
    const peers = createPeers(['a', 'b', 'c']);
    const [, b] = peers;

    disconnectYjsPeer(b);
    splitParagraph(b);
    connectYjsPeerAndSync(b, peers);

    assertPeerTexts(peers, ['alph', 'abeta']);
  });

  for (const aId of [1, 2] as const) {
    it(`preserves a remote split when an offline local split was undone before reconnect, a holding client id ${aId}`, () => {
      const peers = createHelloPeers(aId);
      const [a, b] = peers;

      disconnectYjsPeer(a);
      splitHelloParagraph(a);
      undoHistoryPeer(a);
      assert.deepEqual(getPeerTopLevelTexts(a), ['Hello world!']);

      splitHelloParagraph(b);
      syncConnectedPeers(peers);
      assert.deepEqual(getPeerTopLevelTexts(a), ['Hello world!']);
      assert.deepEqual(getPeerTopLevelTexts(b), ['Hello ', 'world!']);

      connectYjsPeerAndSync(a, peers);

      assertPeerTexts(peers, ['Hello ', 'world!']);
    });

    it(`replays an offline split redo onto the remote split boundary after reconnect, a holding client id ${aId}`, () => {
      const peers = createHelloPeers(aId);
      const [a, b] = peers;

      disconnectYjsPeer(a);
      splitHelloParagraph(a);
      undoHistoryPeer(a);
      assert.deepEqual(getPeerTopLevelTexts(a), ['Hello world!']);

      appendExclamationToFirstParagraph(b);
      syncConnectedPeers(peers);
      splitHelloParagraph(b);
      syncConnectedPeers(peers);
      assert.deepEqual(getPeerTopLevelTexts(a), ['Hello world!']);
      assert.deepEqual(getPeerTopLevelTexts(b), ['Hello ', 'world!!']);

      connectYjsPeerAndSync(a, peers);
      redoHistoryPeerAndSync(a, peers);

      assertPeerTexts(peers, ['Hello ', 'world!!']);
    });
  }

  it('does not absorb a later unrelated paragraph that matches the offline undo suffix', () => {
    const peers = createPeers(['a', 'b', 'c'], helloValue());
    const [a, b] = peers;

    disconnectYjsPeer(a);
    splitHelloParagraph(a);
    undoHistoryPeer(a);
    assert.deepEqual(getPeerTopLevelTexts(a), ['Hello world!']);

    connectYjsPeerAndSync(a, peers);
    assertPeerTexts(peers, ['Hello world!']);

    insertWorldParagraphAfterFirst(b);
    syncConnectedPeers(peers);
    assertPeerTexts(peers, ['Hello world!', 'world! after']);

    redoHistoryPeerAndSync(a, peers);

    assertPeerTexts(peers, ['Hello ', 'world!', 'world! after']);
  });

  it('undoes and redoes only the local split after reconnect', () => {
    const peers = createOrderedPeers();
    const [a, b] = peers;

    disconnectYjsPeer(b);
    splitParagraph(b);
    insertRemoteTextAtSplitPoint(a);
    syncConnectedPeers(peers);

    connectYjsPeerAndSync(b, peers);
    assertPeerTexts(peers, ['alph!', 'abeta']);

    undoHistoryPeerAndSync(b, peers);
    assertPeerTexts(peers, ['alph!abeta']);

    redoHistoryPeerAndSync(b, peers);
    assertPeerTexts(peers, ['alph!', 'abeta']);
  });

  it('redoes text inserted into a split-created paragraph after undoing to an empty document', () => {
    const peer = createPeer('b', undefined, [paragraph('')]);

    insertTextSplitAndInsertRightText(peer);
    assert.deepEqual(getPeerTopLevelTexts(peer), ['a', 'b']);

    undoHistoryPeer(peer);
    undoHistoryPeer(peer);
    assert.deepEqual(getPeerTopLevelTexts(peer), ['a']);

    undoHistoryPeer(peer);
    assert.deepEqual(getPeerTopLevelTexts(peer), ['']);

    redoHistoryPeer(peer);
    assert.deepEqual(getPeerTopLevelTexts(peer), ['a']);

    redoHistoryPeer(peer);
    redoHistoryPeer(peer);
    assert.deepEqual(getPeerTopLevelTexts(peer), ['a', 'b']);
  });

  it('undoes a split after a prior merge through canonical replay', () => {
    const peer = createPeer('b', undefined, [
      paragraph('Hello world!'),
      paragraph('block 2'),
    ]);

    peer.editor.update.nodes.merge({ at: [1] });
    assert.deepEqual(getPeerTopLevelTexts(peer), ['Hello world!block 2']);

    peer.editor.update.nodes.split({
      at: { path: [0, 0], offset: 'Hello wor'.length },
    });
    assert.deepEqual(getPeerTopLevelTexts(peer), ['Hello wor', 'ld!block 2']);

    undoHistoryPeer(peer);
    assert.deepEqual(getPeerTopLevelTexts(peer), ['Hello world!block 2']);
  });

  it('undoes a break split after a prior merge without leaving the right split node visible', () => {
    const peer = createPeer('b', undefined, [
      paragraph('Hello world!'),
      paragraph('block 2'),
    ]);

    peer.editor.update.nodes.merge({ at: [1] });
    assert.deepEqual(getPeerTopLevelTexts(peer), ['Hello world!block 2']);

    peer.editor.update((tx) => {
      tx.selection.set({
        kind: 'text',
        anchor: { path: [0, 0], offset: 'Hello wor'.length },
        focus: { path: [0, 0], offset: 'Hello wor'.length },
      });
      tx.break.insert();
    });
    assert.deepEqual(getPeerTopLevelTexts(peer), ['Hello wor', 'ld!block 2']);

    undoHistoryPeer(peer);
    assert.deepEqual(getPeerTopLevelTexts(peer), ['Hello world!block 2']);
  });

  it('undoes an offline public split after a concurrent remote append', () => {
    const peers = createPeers(['a', 'b', 'c']);
    const [a, b] = peers;

    disconnectYjsPeer(b);
    splitParagraph(b);
    appendRemoteText(a);
    syncConnectedPeers(peers);

    connectYjsPeerAndSync(b, peers);
    assertPeerTexts(peers, ['alph', 'abeta!']);

    undoHistoryPeerAndSync(b, peers);
    assertPeerTexts(peers, ['alphabeta!']);

    redoHistoryPeerAndSync(b, peers);
    assertPeerTexts(peers, ['alph', 'abeta!']);
  });

  it('keeps a retyped child type in the stored document after its parent splits', () => {
    const peer = createPeer('a', undefined, [
      { children: [paragraph('one'), paragraph('two')], type: 'quote' },
    ]);

    peer.editor.update.nodes.set({ type: 'heading-one' }, { at: [0, 1] });
    peer.editor.update.nodes.split({ at: [0], position: 1 });

    const fresh = createPeer('c', Y.encodeStateAsUpdate(peer.doc), [
      paragraph('seed'),
    ]);

    assert.deepEqual(readPeerChildren(fresh), [
      { children: [paragraph('one')], type: 'quote' },
      {
        children: [{ children: [{ text: 'two' }], type: 'heading-one' }],
        type: 'quote',
      },
    ]);
  });
});

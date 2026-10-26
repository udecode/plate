import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isDeepStrictEqual } from 'node:util';

import * as Y from 'yjs';

import { history } from '../../src/history';
import {
  createEditor,
  defineEditorSchema,
  type Descendant,
  type EditorUpdateTransaction as Transaction,
  NodeApi,
  property,
  schema,
  target,
} from '../../src/index';
import { getDefined } from '../../src/internal/get-defined';
import {
  assertCanonicalYjsTrace,
  assertPeerTexts,
  connectYjsPeerAndSync,
  createSeededYjsHistoryPeers,
  createYjsHistoryPeer,
  createYjsPeerWithEditor,
  disconnectAndClearYjsTrace,
  disconnectYjsPeer,
  getPeerTopLevelTexts,
  getVisibleYjsNodeAt,
  getYjsTrace,
  type Peer,
  paragraph,
  readPeerChildren,
  readPeerPliteValue,
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

const initialValue = (): Descendant[] => [paragraph('alpha')];
const roleValue = (): Descendant[] => [paragraph('alpha', { role: 'title' })];
const quoteValue = (): Descendant[] => [
  { children: [paragraph('alpha'), paragraph('beta')], type: 'quote' },
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

const createPeers = (
  ids: readonly ClientId[],
  children: readonly Descendant[] = initialValue()
): Peer[] =>
  createSeededYjsHistoryPeers({
    children,
    clientIds: ids,
    numericClientIds: clientIds,
  });

const setHeading = (peer: Peer): void => {
  peer.editor.update.nodes.set(
    { role: 'title', type: 'heading-one' },
    { at: [0], type: 'paragraph' }
  );
};

const unsetRole = (peer: Peer): void => {
  peer.editor.update.nodes.unset('role', { at: [0] });
};

const setTextMark = (peer: Peer): void => {
  peer.editor.update.nodes.set(
    { bold: true },
    { at: [0, 0], match: NodeApi.isText }
  );
};

const link = (url: string, text: string) => ({
  children: [{ text }],
  type: 'link',
  url,
});

const appendRemoteText = (peer: Peer): void => {
  peer.editor.update.text.insert('!', {
    at: { path: [0, 0], offset: 'alpha'.length },
  });
};

const LinkSchema = defineEditorSchema('schema:yjs-set-link-url', {
  elements: {
    link: {
      content: schema.content.text({ default: 'text', min: 1 }),
      inline: true,
    },
    paragraph: {
      content: schema.content.any(
        [schema.content.text(), schema.content.type('link')],
        { default: 'text', min: 1 }
      ),
    },
  },
  properties: [
    schema.elementProperty('url', property.string(), {
      target: target.type('link'),
    }),
  ],
  root: schema.content.types(['paragraph'], {
    default: { type: 'paragraph' },
    min: 1,
  }),
  unknown: 'reject',
});

const createLinkPeers = (children: readonly Descendant[]): Peer[] => {
  const create = (numericClientId: number, seedUpdate?: Uint8Array) =>
    createYjsPeerWithEditor(
      createEditor({
        initialValue: children,
        plugins: [LinkSchema, history()],
      }),
      {
        children,
        clientId: String(numericClientId),
        numericClientId,
        seedUpdate,
      }
    );
  const first = create(1);

  return [first, create(2, Y.encodeStateAsUpdate(first.doc))];
};

const urlWritesBesideTyping = [
  {
    before: '',
    expected: [{ text: '' }, link('v', 'aXb'), { text: '' }],
    title: 'inside the link',
    typed: { path: [0, 1, 0], offset: 1 },
  },
  {
    before: 'word',
    expected: [{ text: 'woXrd' }, link('v', 'ab'), { text: '' }],
    title: 'before the link',
    typed: { path: [0, 0], offset: 2 },
  },
] as const;

describe('plitejs/yjs set_node collaboration contract', () => {
  for (const { before, expected, title, typed } of urlWritesBesideTyping) {
    for (const order of ['writer-first', 'typist-first'] as const) {
      it(`keeps a link url write while a peer types ${title}, ${order}`, () => {
        const peers = createLinkPeers([
          {
            children: [{ text: before }, link('u', 'ab'), { text: '' }],
            type: 'paragraph',
          },
        ]);
        const [writer, typist] = peers;

        writer.editor.update.nodes.set({ url: 'v' }, { at: [0, 1] });
        typist.editor.update.text.insert('X', { at: typed });
        syncConnectedPeers(order === 'writer-first' ? peers : [typist, writer]);

        assert.deepEqual(peers.map(readPeerChildren), [
          [{ children: expected, type: 'paragraph' }],
          [{ children: expected, type: 'paragraph' }],
        ]);
      });
    }
  }

  it('applies local offline element set_node without replacing the Yjs element', () => {
    const peer = createPeer('b');
    const element = getVisibleYjsNodeAt(peer, [0]);

    disconnectAndClearYjsTrace(peer);
    setHeading(peer);

    assert.deepEqual(readPeerChildren(peer), [
      { type: 'heading-one', role: 'title', children: [{ text: 'alpha' }] },
    ]);
    assert.equal(getVisibleYjsNodeAt(peer, [0]), element);
    assertCanonicalYjsTrace(peer);
  });

  it('preserves concurrent remote text when an offline element set_node reconnects', () => {
    const peers = createPeers(['a', 'b', 'c']);
    const [a, b] = peers;

    disconnectYjsPeer(b);
    setHeading(b);
    appendRemoteText(a);
    syncConnectedPeers(peers);

    assert.deepEqual(getPeerTopLevelTexts(a), ['alpha!']);
    assert.deepEqual(readPeerChildren(b), [
      { type: 'heading-one', role: 'title', children: [{ text: 'alpha' }] },
    ]);

    connectYjsPeerAndSync(b, peers);

    for (const peer of peers) {
      assert.deepEqual(readPeerChildren(peer), [
        {
          type: 'heading-one',
          role: 'title',
          children: [{ text: 'alpha!' }],
        },
      ]);
    }
  });

  it('recovers element set_node convergence through real Yjs updates after reconnect', () => {
    const peers = createPeers(['a', 'b', 'c']);
    const [, b] = peers;

    disconnectYjsPeer(b);
    setHeading(b);
    connectYjsPeerAndSync(b, peers);

    for (const peer of peers) {
      assert.deepEqual(readPeerChildren(peer), [
        { type: 'heading-one', role: 'title', children: [{ text: 'alpha' }] },
      ]);
    }
  });

  it('undoes and redoes only the local element property change after reconnect', () => {
    const peers = createPeers(['a', 'b', 'c']);
    const [a, b] = peers;

    disconnectYjsPeer(b);
    setHeading(b);
    appendRemoteText(a);
    syncConnectedPeers(peers);

    connectYjsPeerAndSync(b, peers);
    for (const peer of peers) {
      assert.deepEqual(readPeerChildren(peer), [
        {
          type: 'heading-one',
          role: 'title',
          children: [{ text: 'alpha!' }],
        },
      ]);
    }

    undoHistoryPeerAndSync(b, peers);
    for (const peer of peers) {
      assert.deepEqual(readPeerChildren(peer), [
        { type: 'paragraph', children: [{ text: 'alpha!' }] },
      ]);
    }

    redoHistoryPeerAndSync(b, peers);
    for (const peer of peers) {
      assert.deepEqual(readPeerChildren(peer), [
        {
          type: 'heading-one',
          role: 'title',
          children: [{ text: 'alpha!' }],
        },
      ]);
    }
  });

  it('unsets a node property through a canonical change', () => {
    const peer = createPeer('b', roleValue());
    unsetRole(peer);

    assert.deepEqual(readPeerChildren(peer), [
      { type: 'paragraph', children: [{ text: 'alpha' }] },
    ]);
  });

  it('applies local offline text mark set_node without replacing the Yjs text node', () => {
    const peer = createPeer('b');
    const text = getVisibleYjsNodeAt(peer, [0, 0]);

    disconnectAndClearYjsTrace(peer);
    setTextMark(peer);

    assert.deepEqual(readPeerChildren(peer), [
      { type: 'paragraph', children: [{ bold: true, text: 'alpha' }] },
    ]);
    assert.equal(getVisibleYjsNodeAt(peer, [0, 0]), text);
    assertCanonicalYjsTrace(peer);
  });

  it('syncs text mark set_node through reconnect and undo without root snapshots', () => {
    const peers = createPeers(['a', 'b', 'c']);
    const [, b] = peers;

    disconnectYjsPeer(b);
    setTextMark(b);
    connectYjsPeerAndSync(b, peers);

    for (const peer of peers) {
      assert.deepEqual(readPeerChildren(peer), [
        { type: 'paragraph', children: [{ bold: true, text: 'alpha' }] },
      ]);
    }

    undoHistoryPeerAndSync(b, peers);
    assertPeerTexts(peers, ['alpha']);
    for (const peer of peers) {
      assert.deepEqual(readPeerChildren(peer), [
        { type: 'paragraph', children: [{ text: 'alpha' }] },
      ]);
    }
  });

  for (const [name, children] of [
    ['removes', [paragraph('alpha')]],
    ['inserts', [paragraph('alpha'), paragraph('beta'), paragraph('gamma')]],
  ] as const) {
    for (const first of ['property', 'child'] as const) {
      it(`keeps the Yjs element of a container when one commit sets its property and ${name} a child, the ${first} first`, () => {
        const peer = createPeer('b', quoteValue());
        const element = getVisibleYjsNodeAt(peer, [0]);
        const setRole = (tx: Transaction) =>
          tx.nodes.set({ role: 'title' }, { at: [0] });
        const changeChild = (tx: Transaction) => {
          if (name === 'removes') tx.nodes.remove({ at: [0, 1] });
          else tx.nodes.insert(paragraph('gamma'), { at: [0, 2] });
        };

        peer.editor.update((tx) => {
          for (const step of first === 'property'
            ? [setRole, changeChild]
            : [changeChild, setRole]) {
            step(tx);
          }
        });

        assert.deepEqual(
          {
            kept: getVisibleYjsNodeAt(peer, [0]) === element,
            room: readPeerPliteValue(peer),
          },
          {
            kept: true,
            room: [{ children: [...children], role: 'title', type: 'quote' }],
          }
        );
      });
    }
  }

  it('keeps each of two equal sibling containers’ Yjs elements when one commit sets both their properties and removes a child from each', () => {
    const peer = createPeer('b', [...quoteValue(), ...quoteValue()]);
    const elements = [[0], [1]].map((path) => getVisibleYjsNodeAt(peer, path));

    peer.editor.update((tx) => {
      tx.nodes.set({ role: 'title' }, { at: [0] });
      tx.nodes.set({ role: 'title' }, { at: [1] });
      tx.nodes.remove({ at: [1, 1] });
      tx.nodes.remove({ at: [0, 1] });
    });

    const quote = {
      children: [paragraph('alpha')],
      role: 'title',
      type: 'quote',
    };

    assert.deepEqual(
      {
        kept: [[0], [1]].map(
          (path, at) => getVisibleYjsNodeAt(peer, path) === elements[at]
        ),
        room: readPeerPliteValue(peer),
      },
      { kept: [true, true], room: [quote, quote] }
    );
  });

  it('leaves the room equal to the editor when one commit lowers one container in place and rewrites another', () => {
    const peer = createPeer('b', [
      ...quoteValue(),
      paragraph('mid'),
      ...quoteValue(),
    ]);
    const element = getVisibleYjsNodeAt(peer, [0]);

    peer.editor.update((tx) => {
      tx.nodes.set({ role: 'title' }, { at: [0] });
      tx.nodes.remove({ at: [0, 1] });
      tx.nodes.set({ type: 'aside' }, { at: [2] });
      tx.nodes.remove({ at: [2, 1] });
    });

    assert.deepEqual(
      {
        kept: getVisibleYjsNodeAt(peer, [0]) === element,
        room: readPeerPliteValue(peer),
      },
      {
        kept: true,
        room: [
          { children: [paragraph('alpha')], role: 'title', type: 'quote' },
          paragraph('mid'),
          { children: [paragraph('alpha')], type: 'aside' },
        ],
      }
    );
  });

  it('keeps a column’s and its quote’s Yjs elements when one commit sets the column’s property, removes a quote line and types into another', () => {
    const peer = createPeer('b', [
      { children: [...quoteValue(), paragraph('after')], type: 'column' },
    ]);
    const elements = [[0], [0, 0]].map((path) =>
      getVisibleYjsNodeAt(peer, path)
    );

    peer.editor.update((tx) => {
      tx.nodes.set({ role: 'title' }, { at: [0] });
      tx.nodes.remove({ at: [0, 0, 1] });
      tx.text.insert('!', { at: { offset: 0, path: [0, 0, 0, 0] } });
    });

    assert.deepEqual(
      {
        kept: [[0], [0, 0]].map(
          (path, at) => getVisibleYjsNodeAt(peer, path) === elements[at]
        ),
        room: readPeerPliteValue(peer),
      },
      {
        kept: [true, true],
        room: [
          {
            children: [
              { children: [paragraph('!alpha')], type: 'quote' },
              paragraph('after'),
            ],
            role: 'title',
            type: 'column',
          },
        ],
      }
    );
  });

  for (const [name, edit] of [
    ['join', (tx: Transaction) => tx.nodes.merge({ at: [0, 1] })],
    [
      'wrap',
      (tx: Transaction) =>
        tx.nodes.wrap({ children: [], type: 'quote' }, { at: [0, 0] }),
    ],
  ] as const) {
    it(`lowers a ${name} inside a container the same way when the commit also sets the container’s property`, () => {
      const lowered = [false, true].map((setsRole) => {
        const peer = createPeer('b', quoteValue());
        const elements = [[0], [0, 0]].map((path) =>
          getVisibleYjsNodeAt(peer, path)
        );

        peer.editor.update((tx) => {
          if (setsRole) tx.nodes.set({ role: 'title' }, { at: [0] });
          edit(tx);
        });

        return {
          kept: [
            getVisibleYjsNodeAt(peer, [0]) === elements[0],
            [
              [0, 0],
              [0, 0, 0],
            ].some((path) => getVisibleYjsNodeAt(peer, path) === elements[1]),
          ],
          roomIsEditor: isDeepStrictEqual(
            readPeerPliteValue(peer),
            readPeerChildren(peer)
          ),
        };
      });

      assert.deepEqual(lowered[1], lowered[0]);
    });
  }

  it('rewrites a container whose type and child one commit changed', () => {
    const peer = createPeer('b', quoteValue());
    const element = getVisibleYjsNodeAt(peer, [0]);

    peer.editor.update((tx) => {
      tx.nodes.set({ type: 'aside' }, { at: [0] });
      tx.nodes.remove({ at: [0, 1] });
    });

    assert.deepEqual(
      {
        kept: getVisibleYjsNodeAt(peer, [0]) === element,
        room: readPeerPliteValue(peer),
      },
      {
        kept: false,
        room: [{ children: [paragraph('alpha')], type: 'aside' }],
      }
    );
  });

  for (const projectedFirst of [true, false]) {
    it(`leaves the room equal to the editor and writes no attribute to an element it deletes when a commit that sets a container’s property falls back, the projected container ${projectedFirst ? 'first' : 'last'}`, () => {
      const lines = (...texts: string[]) => ({
        children: texts.map((text) => paragraph(text)),
        type: 'quote',
      });
      const [projected, peeled] = projectedFirst ? [0, 2] : [2, 0];
      const [a, b] = createPeers(
        ['a', 'b'],
        projectedFirst
          ? [
              lines('alpha', 'beta', 'x'),
              paragraph('mid'),
              lines('gamma', 'delta'),
            ]
          : [
              lines('gamma', 'delta'),
              paragraph('mid'),
              lines('alpha', 'beta', 'x'),
            ]
      );

      a.editor.update.nodes.merge({ at: [projected, 1] });
      syncConnectedPeers([a, b]);

      const doc = getDefined(getVisibleYjsNodeAt(b, [0]).doc);
      const written: Y.XmlElement[] = [];

      doc.on('afterTransaction', (transaction: Y.Transaction) => {
        for (const [type, keys] of transaction.changed) {
          if (type instanceof Y.XmlElement && [...keys].some(Boolean)) {
            written.push(type);
          }
        }
      });
      b.editor.update((tx) => {
        tx.nodes.set({ role: 'title' }, { at: [peeled] });
        tx.nodes.remove({ at: [peeled, 1] });
        tx.nodes.set({ type: 'aside' }, { at: [projected] });
        tx.nodes.remove({ at: [projected, 1] });
      });
      syncConnectedPeers([a, b]);

      assert.deepEqual(
        {
          deletedWritten: written.filter((element) => element._item?.deleted)
            .length,
          editor: readPeerChildren(a),
          fallback: getYjsTrace(b).at(-1)?.fallback,
          room: readPeerPliteValue(b),
        },
        {
          deletedWritten: 0,
          editor: readPeerChildren(b),
          fallback: 'canonical-change-projected-content',
          room: readPeerChildren(b),
        }
      );
    });
  }

  it('keeps the node key of a remote container whose property and child one commit changed', () => {
    const [a, b] = createPeers(['a', 'b'], quoteValue());
    const key = b.editor.key([0]);

    a.editor.update((tx) => {
      tx.nodes.set({ role: 'title' }, { at: [0] });
      tx.nodes.remove({ at: [0, 1] });
    });
    syncConnectedPeers([a, b]);

    assert.deepEqual(
      { children: readPeerChildren(b), key: b.editor.key([0]) },
      {
        children: [
          { children: [paragraph('alpha')], role: 'title', type: 'quote' },
        ],
        key,
      }
    );
  });

  it('converges on one document when a peer receives joins that set the properties of the blocks they join into, then edits the joined line', () => {
    const [a, b] = createPeers(
      ['a', 'b'],
      [...quoteValue(), { children: [paragraph('gamma')], type: 'quote' }]
    );

    a.editor.update((tx) => {
      tx.nodes.set({ role: 'x' }, { at: [0, 0] });
      tx.nodes.merge({ at: [0, 1] });
    });
    a.editor.update((tx) => {
      tx.nodes.set({ role: 'title' }, { at: [0] });
      tx.nodes.merge({ at: [1] });
    });
    syncConnectedPeers([a, b]);
    b.editor.update((tx) => {
      tx.nodes.set({ role: 'y' }, { at: [0, 0] });
      tx.text.insert('!', { at: { offset: 0, path: [0, 0, 0] } });
    });
    syncConnectedPeers([a, b]);

    const children = [
      {
        children: [paragraph('!alphabeta', { role: 'y' }), paragraph('gamma')],
        role: 'title',
        type: 'quote',
      },
    ];

    assert.deepEqual(
      [readPeerChildren(a), readPeerChildren(b), readPeerPliteValue(b)],
      [children, children, children]
    );
  });

  it('marks the end of a text leaf while keeping a concurrent append', () => {
    const [a, b] = createPeers(['a', 'b']);

    b.editor.update.nodes.set(
      { bold: true },
      {
        at: {
          anchor: { path: [0, 0], offset: 3 },
          focus: { path: [0, 0], offset: 5 },
        },
        match: NodeApi.isText,
        split: true,
      }
    );
    appendRemoteText(a);
    syncConnectedPeers([b, a]);

    for (const peer of [a, b]) {
      assert.deepEqual(readPeerChildren(peer), [
        {
          type: 'paragraph',
          children: [{ text: 'alp' }, { bold: true, text: 'ha!' }],
        },
      ]);
    }
  });
});

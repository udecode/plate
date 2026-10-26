import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Y from 'yjs';

import {
  createEditor,
  defineEditorSchema,
  type Descendant,
  type Element,
  NodeApi,
  property,
  schema,
  target,
} from '../../src/index';
import { setYjsAttribute } from '../../src/yjs/core/attributes';
import {
  createVirtualYjsMovePlaceholder,
  createYjsNodes,
  hideYjsNode,
  removeYjsChild,
  withYjsWrite,
} from '../../src/yjs/core/document';
import { yjsTextContent } from '../../src/yjs/core/text-runs';
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
  type Peer,
  paragraph,
  readPeerChildren,
  redoHistoryPeerAndSync,
  syncConnectedPeers,
  undoHistoryPeerAndSync,
} from './support/collaboration';

const yParagraph = (): Y.XmlElement => {
  const node = new Y.XmlElement('element');

  setYjsAttribute(node, 'type', 'paragraph');

  return node;
};

const initialValue = (): Descendant[] => [
  paragraph('alpha'),
  paragraph('beta'),
  paragraph('gamma'),
];

const createPeer = (
  clientId: string,
  seedUpdate?: Uint8Array,
  children: readonly Descendant[] = initialValue()
): Peer => createYjsHistoryPeer({ children, clientId, seedUpdate });

const createPeers = (clientIds: readonly string[]): Peer[] =>
  createSeededYjsHistoryPeers({ children: initialValue(), clientIds });

const Links = defineEditorSchema('schema:yjs-remove-links', {
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
    schema.elementProperty('align', property.string(), {
      target: target.type('paragraph'),
    }),
    schema.elementProperty('url', property.string(), {
      target: target.type('link'),
    }),
    schema.elementProperty('ref', property.string(), {
      split: 'drop',
      target: target.type('link'),
    }),
  ],
  root: schema.content.types(['paragraph'], {
    default: { type: 'paragraph' },
    min: 1,
  }),
  unknown: 'preserve',
});

const link = (url: string, text: string): Element => ({
  children: [{ text }],
  type: 'link',
  url,
});

const linkPeers = (children: readonly Descendant[]): Peer[] => {
  const create = (numericClientId: number, seedUpdate?: Uint8Array) =>
    createYjsPeerWithEditor(
      createEditor({
        initialValue: children,
        plugins: [Links] as never,
      }) as never,
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

/** Each block's children, a text as its letters and a link as `url:letters`. */
const inlinesOf = (peer: Peer) =>
  readPeerChildren(peer).map((block) =>
    (block as Element).children.map((child) =>
      NodeApi.isText(child)
        ? child.text
        : `${typeof child.url === 'string' ? child.url : ''}:${NodeApi.string(child)}`
    )
  );

const removeMiddleBlock = (peer: Peer): void => {
  peer.editor.update.nodes.remove({ at: [1] });
};

const insertRemoteText = (peer: Peer): void => {
  peer.editor.update.text.insert('!', {
    at: { path: [0, 0], offset: 'alpha'.length },
  });
};

describe('plitejs/yjs remove_node collaboration contract', () => {
  it('matches hidden text removals by text content', () => {
    const doc = new Y.Doc();
    const root = doc.get('document', Y.XmlElement);
    const parent = yParagraph();
    const [wrong] = createYjsNodes([{ text: 'wrong' }]);
    const [right] = createYjsNodes([{ text: 'right' }]);

    withYjsWrite(root, (write) => {
      hideYjsNode(write, wrong);
      hideYjsNode(write, right);
    });
    root.insert(0, [parent]);
    parent.insert(0, [wrong, right]);

    withYjsWrite(root, (write) =>
      removeYjsChild(write, parent, 0, { text: 'right' })
    );

    assert.deepEqual(
      parent
        .toArray()
        .filter((node): node is Y.XmlText => node instanceof Y.XmlText)
        .map(yjsTextContent),
      ['wrong']
    );
  });

  it('matches hidden element removals by child content when candidates share a type', () => {
    const doc = new Y.Doc();
    const root = doc.get('document', Y.XmlElement);
    const parent = new Y.XmlElement('root');
    const wrong = yParagraph();
    const right = yParagraph();

    wrong.insert(0, createYjsNodes([{ text: 'wrong' }]));
    right.insert(0, createYjsNodes([{ text: 'right' }]));
    withYjsWrite(root, (write) => {
      hideYjsNode(write, wrong);
      hideYjsNode(write, right);
    });
    root.insert(0, [parent]);
    parent.insert(0, [wrong, right]);

    withYjsWrite(root, (write) =>
      removeYjsChild(write, parent, 0, paragraph('right'))
    );

    assert.deepEqual(
      parent
        .toArray()
        .filter((node): node is Y.XmlElement => node instanceof Y.XmlElement)
        .map((node) =>
          node
            .toArray()
            .filter((child): child is Y.XmlText => child instanceof Y.XmlText)
            .map(yjsTextContent)
            .join('')
        ),
      ['wrong']
    );
  });

  it('matches hidden element removals through virtual placeholder content', () => {
    const doc = new Y.Doc();
    const root = doc.get('document', Y.XmlElement);
    const parent = new Y.XmlElement('root');
    const [movedText] = createYjsNodes([{ text: 'right' }]);
    const wrong = yParagraph();
    const right = yParagraph();

    wrong.insert(0, createYjsNodes([{ text: 'wrong' }]));
    withYjsWrite(root, (write) => {
      right.insert(0, [createVirtualYjsMovePlaceholder(write, movedText)]);
      hideYjsNode(write, wrong);
      hideYjsNode(write, right);
    });
    root.insert(0, [parent]);
    parent.insert(0, [movedText, wrong, right]);

    withYjsWrite(root, (write) =>
      removeYjsChild(write, parent, 0, paragraph('right'))
    );

    assert.deepEqual(
      parent
        .toArray()
        .filter((node): node is Y.XmlElement => node instanceof Y.XmlElement)
        .map((node) =>
          node
            .toArray()
            .filter((child): child is Y.XmlText => child instanceof Y.XmlText)
            .map(yjsTextContent)
            .join('')
        ),
      ['wrong']
    );
  });

  it('applies a local offline removal as a canonical change', () => {
    const peer = createPeer('b');

    disconnectAndClearYjsTrace(peer);
    removeMiddleBlock(peer);

    assert.deepEqual(getPeerTopLevelTexts(peer), ['alpha', 'gamma']);
    assertCanonicalYjsTrace(peer);
  });

  it('removes moved content from its destination parent', () => {
    const peer = createPeer('b', undefined, [
      { type: 'quote', children: [paragraph('left')] },
      { type: 'quote', children: [] },
      paragraph('moved'),
    ]);

    peer.editor.update.nodes.move({ at: [2], to: [1, 0] });

    disconnectAndClearYjsTrace(peer);
    peer.editor.update.nodes.remove({ at: [1, 0] });

    assert.deepEqual(getPeerTopLevelTexts(peer), ['left', '']);
    assertCanonicalYjsTrace(peer);
  });

  it('preserves concurrent remote sibling edits when an offline remove_node reconnects', () => {
    const peers = createPeers(['a', 'b', 'c']);
    const [a, b] = peers;

    disconnectYjsPeer(b);
    removeMiddleBlock(b);
    insertRemoteText(a);
    syncConnectedPeers(peers);

    assert.deepEqual(getPeerTopLevelTexts(a), ['alpha!', 'beta', 'gamma']);
    assert.deepEqual(getPeerTopLevelTexts(b), ['alpha', 'gamma']);

    connectYjsPeerAndSync(b, peers);

    assertPeerTexts(peers, ['alpha!', 'gamma']);
  });

  it('recovers convergence through real Yjs updates after reconnect', () => {
    const peers = createPeers(['a', 'b', 'c']);
    const [, b] = peers;

    disconnectYjsPeer(b);
    removeMiddleBlock(b);
    connectYjsPeerAndSync(b, peers);

    assertPeerTexts(peers, ['alpha', 'gamma']);
  });

  it('undoes and redoes only the local removal after reconnect', () => {
    const peers = createPeers(['a', 'b', 'c']);
    const [a, b] = peers;

    disconnectYjsPeer(b);
    removeMiddleBlock(b);
    insertRemoteText(a);
    syncConnectedPeers(peers);

    connectYjsPeerAndSync(b, peers);
    assertPeerTexts(peers, ['alpha!', 'gamma']);

    undoHistoryPeerAndSync(b, peers);
    assertPeerTexts(peers, ['alpha!', 'beta', 'gamma']);

    redoHistoryPeerAndSync(b, peers);
    assertPeerTexts(peers, ['alpha!', 'gamma']);
  });

  it('merges concurrent leaf removals that each merge the same block', () => {
    const peers = createSeededYjsHistoryPeers({
      children: [
        {
          type: 'paragraph',
          children: [
            { text: 'B' },
            { bold: true, text: 'as' },
            { italic: true, text: 'XY' },
            { text: 'e' },
          ],
        },
      ],
      clientIds: ['a', 'b'],
    });
    const [a, b] = peers;

    a.editor.update((tx) => {
      tx.nodes.remove({ at: [0, 1] });
      tx.nodes.unset('italic', { at: [0, 1] });
    });
    b.editor.update((tx) => {
      tx.nodes.remove({ at: [0, 2] });
      tx.nodes.unset('bold', { at: [0, 1] });
    });
    syncConnectedPeers(peers);

    assertPeerTexts(peers, ['Be']);
  });

  it('keeps one copy of a link when two peers each remove the link before it and set its url', () => {
    const peers = linkPeers([
      {
        children: [
          { text: 'x' },
          link('a', 'A'),
          { text: 'y' },
          link('b', 'B'),
          { text: 'z' },
        ],
        type: 'paragraph',
      },
    ]);

    for (const peer of peers) {
      peer.editor.update((tx) => {
        tx.nodes.set({ url: 'b7' } as never, { at: [0, 3] });
        tx.nodes.remove({ at: [0, 1] });
      });
    }
    syncConnectedPeers(peers);

    assert.deepEqual(peers.map(inlinesOf), [
      [['xy', 'b7:B', 'z']],
      [['xy', 'b7:B', 'z']],
    ]);
  });

  it('keeps one copy of a block when two peers each remove the block before it and set its align', () => {
    const peers = linkPeers([
      paragraph('one'),
      paragraph('two'),
      paragraph('three'),
    ]);

    for (const peer of peers) {
      peer.editor.update((tx) => {
        tx.nodes.remove({ at: [0] });
        tx.nodes.set({ align: 'right' } as never, { at: [0] });
      });
    }
    syncConnectedPeers(peers);

    const merged = [paragraph('two', { align: 'right' }), paragraph('three')];

    assert.deepEqual(peers.map(readPeerChildren), [merged, merged]);
  });

  it('writes a link url set in the update that joins its line into the line above to every peer', () => {
    const peers = linkPeers([
      paragraph('ab'),
      {
        children: [{ text: 'c' }, link('u', 'd'), { text: 'e' }],
        type: 'paragraph',
      },
    ]);

    peers[0].editor.update((tx) => {
      tx.nodes.set({ url: 'v' } as never, { at: [1, 1] });
      tx.nodes.merge({ at: [1] });
    });
    syncConnectedPeers(peers);

    assert.deepEqual(peers.map(inlinesOf), [
      [['abc', 'v:d', 'e']],
      [['abc', 'v:d', 'e']],
    ]);
  });

  it("keeps a peer's typing on both sides of a link another peer removes", () => {
    const peers = linkPeers([
      {
        children: [{ text: 'x' }, link('a', 'A'), { text: 'y' }],
        type: 'paragraph',
      },
    ]);
    const [a, b] = peers;

    a.editor.update.nodes.remove({ at: [0, 1] });
    b.editor.update((tx) => {
      tx.text.insert('Q', { at: { offset: 1, path: [0, 0] } });
      tx.text.insert('R', { at: { offset: 0, path: [0, 2] } });
    });
    syncConnectedPeers(peers);

    assert.deepEqual(peers.map(inlinesOf), [[['xQRy']], [['xQRy']]]);
  });

  it("keeps a peer's typing beside a link another peer removes while typing there", () => {
    const peers = linkPeers([
      {
        children: [{ text: 'x' }, link('a', 'A'), { text: 'y' }],
        type: 'paragraph',
      },
    ]);
    const [a, b] = peers;

    a.editor.update((tx) => {
      tx.nodes.remove({ at: [0, 1] });
      tx.text.insert('P', { at: { offset: 1, path: [0, 0] } });
    });
    b.editor.update((tx) => {
      tx.text.insert('Q', { at: { offset: 1, path: [0, 0] } });
      tx.text.insert('R', { at: { offset: 0, path: [0, 2] } });
    });
    syncConnectedPeers(peers);

    assert.deepEqual(peers.map(inlinesOf), [[['xPQRy']], [['xPQRy']]]);
  });

  it('deletes the letter each peer deleted when one also removes the link between two equal letters', () => {
    const peers = linkPeers([
      {
        children: [{ text: 'a' }, link('a', 'A'), { text: 'a' }],
        type: 'paragraph',
      },
    ]);
    const [a, b] = peers;
    const lastLetter = {
      anchor: { offset: 0, path: [0, 2] },
      focus: { offset: 1, path: [0, 2] },
    };

    a.editor.update((tx) => {
      tx.text.delete({ at: lastLetter });
      tx.nodes.remove({ at: [0, 1] });
      tx.text.insert('P', { at: { offset: 0, path: [0, 0] } });
    });
    b.editor.update.text.delete({ at: lastLetter });
    syncConnectedPeers(peers);

    assert.deepEqual(peers.map(inlinesOf), [[['Pa']], [['Pa']]]);
  });

  it("keeps a peer's marks beside a link another peer removes while typing on its other side", () => {
    const peers = linkPeers([
      {
        children: [{ bold: true, text: 'x' }, link('a', 'A'), { text: 'y' }],
        type: 'paragraph',
      },
    ]);
    const [a, b] = peers;

    a.editor.update((tx) => {
      tx.nodes.remove({ at: [0, 1] });
      tx.text.insert('P', { at: { offset: 0, path: [0, 1] } });
    });
    b.editor.update.text.insert('Q', { at: { offset: 1, path: [0, 0] } });
    syncConnectedPeers(peers);

    const merged = [
      {
        children: [{ bold: true, text: 'xQ' }, { text: 'Py' }],
        type: 'paragraph',
      },
    ];

    assert.deepEqual(peers.map(readPeerChildren), [merged, merged]);
  });

  it("keeps a peer's typing beside a link another peer removes while typing a new mark in its place", () => {
    const peers = linkPeers([
      {
        children: [{ bold: true, text: 'x' }, link('a', 'A'), { text: 'y' }],
        type: 'paragraph',
      },
    ]);
    const [a, b] = peers;

    a.editor.update((tx) => {
      tx.nodes.remove({ at: [0, 1] });
      tx.selection.set({
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      });
      tx.marks.set({ italic: true } as never);
      tx.text.insert('P');
    });
    b.editor.update((tx) => {
      tx.text.insert('Q', { at: { offset: 1, path: [0, 0] } });
      tx.text.insert('R', { at: { offset: 0, path: [0, 2] } });
    });
    syncConnectedPeers(peers);

    const block = {
      children: [
        { bold: true, text: 'xQ' },
        { italic: true, text: 'P' },
        { text: 'Ry' },
      ],
      type: 'paragraph',
    };

    assert.deepEqual(peers.map(readPeerChildren), [[block], [block]]);
  });

  it("keeps a peer's typing on one side of a link another peer removes while inserting a text on its other side", () => {
    const peers = linkPeers([
      {
        children: [{ text: 'x' }, link('a', 'A'), { text: 'y' }],
        type: 'paragraph',
      },
    ]);
    const [a, b] = peers;

    a.editor.update((tx) => {
      tx.nodes.insert({ italic: true, text: 'P' } as never, { at: [0, 2] });
      tx.nodes.remove({ at: [0, 1] });
    });
    b.editor.update.text.insert('Q', { at: { offset: 1, path: [0, 0] } });
    syncConnectedPeers(peers);

    const block = {
      children: [{ text: 'xQ' }, { italic: true, text: 'P' }, { text: 'y' }],
      type: 'paragraph',
    };

    assert.deepEqual(peers.map(readPeerChildren), [[block], [block]]);
  });

  for (const first of [0, 1]) {
    it(`keeps a peer's typing beside a link another peer removes while typing into an empty text before it, typist ${first + 1}`, () => {
      const peers = linkPeers([
        {
          children: [{ text: '' }, link('a', 'A'), { text: 'y' }],
          type: 'paragraph',
        },
      ]);

      syncConnectedPeers(peers);
      peers[first].editor.update((tx) => {
        tx.text.insert('P', { at: { offset: 0, path: [0, 0] } });
        tx.nodes.remove({ at: [0, 1] });
      });
      peers[1 - first].editor.update((tx) => {
        tx.text.insert('R', { at: { offset: 0, path: [0, 2] } });
        tx.nodes.remove({ at: [0, 1] });
      });
      syncConnectedPeers(peers);

      assert.deepEqual(peers.map(inlinesOf), [[['PRy']], [['PRy']]]);
    });
  }

  it("keeps both peers' typing when each removes a link between two empty texts", () => {
    const peers = linkPeers([
      {
        children: [{ text: '' }, link('a', 'A'), { text: '' }],
        type: 'paragraph',
      },
    ]);
    const [a, b] = peers;

    syncConnectedPeers(peers);
    a.editor.update((tx) => {
      tx.text.insert('P', { at: { offset: 0, path: [0, 0] } });
      tx.nodes.remove({ at: [0, 1] });
    });
    b.editor.update((tx) => {
      tx.text.insert('R', { at: { offset: 0, path: [0, 2] } });
      tx.nodes.remove({ at: [0, 1] });
    });
    syncConnectedPeers(peers);

    assert.deepEqual(peers.map(inlinesOf), [[['PR']], [['PR']]]);
  });

  it('keeps the letters a peer retypes over a link while another peer deletes a letter they replaced', () => {
    const peers = linkPeers([
      {
        children: [{ text: 'xa' }, link('a', 'A'), { text: 'bz' }],
        type: 'paragraph',
      },
    ]);
    const [a, b] = peers;

    a.editor.update.fragment.replace([{ text: 'ab' }], {
      at: {
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 2] },
      },
    });
    b.editor.update.text.delete({
      at: {
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      },
    });
    syncConnectedPeers(peers);

    assert.deepEqual(peers.map(inlinesOf), [[['xabz']], [['xabz']]]);
  });
});

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Y from 'yjs';

import {
  createEditor,
  defineEditorSchema,
  type Descendant,
  ElementApi,
  NodeApi,
  property,
  schema,
  target,
} from '../../src/index';
import { string as editorString } from '../../src/testing';
import {
  clearYjsTrace,
  createSeededYjsPeers,
  createYjsPeer,
  createYjsPeerWithEditor,
  getPeerTopLevelTexts,
  getVisibleYjsNodeAt,
  type Peer,
  paragraph,
  readPeerChildren,
  readPeerPliteValue,
  syncConnectedPeers,
} from './support/collaboration';

const clientIds = {
  a: 1,
  b: 2,
  c: 3,
} as const;

type ClientId = keyof typeof clientIds;

const paragraphParts = (...texts: readonly string[]): Descendant => ({
  type: 'paragraph',
  children: [{ text: texts.join('') }],
});

const quote = (children: readonly Descendant[]): Descendant => ({
  type: 'quote',
  children,
});

const section = (children: readonly Descendant[]): Descendant => ({
  type: 'section',
  children,
});

const SplitMergeSchema = defineEditorSchema('schema:yjs-split-merge', {
  elements: {
    paragraph: { content: schema.content.text() },
    quote: { content: schema.content.open() },
    section: { content: schema.content.open() },
  },
  root: schema.content.not(schema.content.text()),
  unknown: 'preserve',
});

const initialValue = (): Descendant[] => [paragraph('Hello world!')];

const createPeer = (
  clientId: ClientId,
  children: readonly Descendant[] = initialValue()
): Peer =>
  createYjsPeerWithEditor(
    createEditor({
      initialValue: children,
      plugins: [SplitMergeSchema],
    }),
    {
      children,
      clientId,
      numericClientId: clientIds[clientId],
    }
  );

const createPeers = (ids: readonly ClientId[]): Peer[] =>
  createSeededYjsPeers({
    children: initialValue(),
    clientIds: ids,
    numericClientIds: clientIds,
  });

const ColorSchema = defineEditorSchema('schema:yjs-split-color', {
  elements: {
    paragraph: { content: schema.content.text() },
  },
  properties: [schema.textProperty('color', property.string())],
  root: schema.content.not(schema.content.text()),
  unknown: 'reject',
});

const InlineMetadataSchema = defineEditorSchema(
  'schema:yjs-split-inline-metadata',
  {
    elements: {
      link: { content: schema.content.text(), inline: true },
      paragraph: { content: schema.content.open() },
    },
    properties: [
      schema.textProperty('commentIds', property.set(property.string()), {
        role: 'metadata',
      }),
    ],
    root: schema.content.not(schema.content.text()),
    unknown: 'reject',
  }
);

const ParagraphSetSchema = defineEditorSchema(
  'schema:yjs-split-paragraph-set',
  {
    elements: {
      heading: { content: schema.content.text() },
      paragraph: { content: schema.content.text() },
    },
    properties: [
      schema.elementProperty('tags', property.set(property.string()), {
        target: target.type('paragraph'),
      }),
      schema.textProperty('commentIds', property.set(property.string()), {
        target: target.type('paragraph'),
      }),
    ],
    root: schema.content.not(schema.content.text()),
    unknown: 'reject',
  }
);

const RetypeEncodingSchema = defineEditorSchema(
  'schema:yjs-split-retype-encoding',
  {
    elements: {
      heading: { content: schema.content.text() },
      paragraph: { content: schema.content.text() },
    },
    properties: [
      schema.elementProperty('tags', property.set(property.string()), {
        target: target.type('paragraph'),
      }),
      schema.elementProperty('tags', property.json(), {
        target: target.type('heading'),
      }),
      schema.textProperty('commentIds', property.set(property.string()), {
        target: target.type('paragraph'),
      }),
      schema.textProperty('commentIds', property.json(), {
        target: target.type('heading'),
      }),
    ],
    root: schema.content.not(schema.content.text()),
    unknown: 'reject',
  }
);

const SectionSetSchema = defineEditorSchema('schema:yjs-split-section-set', {
  elements: {
    paragraph: { content: schema.content.text() },
    section: { content: schema.content.open() },
  },
  properties: [
    schema.elementProperty('tags', property.set(property.string()), {
      target: target.and(
        target.type('paragraph'),
        target.parent(target.type('section'))
      ),
    }),
  ],
  root: schema.content.not(schema.content.text()),
  unknown: 'reject',
});

const LinkSetSchema = defineEditorSchema('schema:yjs-split-link-set', {
  elements: {
    heading: { content: schema.content.open() },
    link: { content: schema.content.text(), inline: true },
    paragraph: { content: schema.content.open() },
  },
  properties: [
    schema.textProperty('commentIds', property.set(property.string()), {
      target: target.type('link'),
    }),
  ],
  root: schema.content.not(schema.content.text()),
  unknown: 'reject',
});

const LinkParentTagsSchema = defineEditorSchema(
  'schema:yjs-split-link-parent-tags',
  {
    elements: {
      heading: { content: schema.content.open() },
      link: { content: schema.content.text(), inline: true },
      paragraph: { content: schema.content.open() },
    },
    properties: [
      schema.elementProperty('tags', property.set(property.string()), {
        target: target.and(
          target.type('link'),
          target.parent(target.type('paragraph'))
        ),
      }),
      schema.elementProperty('tags', property.json(), {
        target: target.and(
          target.type('link'),
          target.parent(target.type('heading'))
        ),
      }),
      schema.textProperty('color', property.string()),
    ],
    root: schema.content.not(schema.content.text()),
    unknown: 'reject',
  }
);

const createSchemaPeers = (
  plugin:
    | typeof ColorSchema
    | typeof InlineMetadataSchema
    | typeof LinkParentTagsSchema
    | typeof LinkSetSchema
    | typeof ParagraphSetSchema
    | typeof RetypeEncodingSchema
    | typeof SectionSetSchema,
  children: readonly Descendant[]
): Peer[] => {
  const create = (clientId: ClientId, seedUpdate?: Uint8Array) =>
    createYjsPeerWithEditor(
      createEditor({ initialValue: children, plugins: [plugin] }),
      {
        children,
        clientId,
        numericClientId: clientIds[clientId],
        seedUpdate,
      }
    );
  const first = create('a');

  return [first, create('b', Y.encodeStateAsUpdate(first.doc))];
};

const splitThenDeleteBackwardEmptyParagraph = (peer: Peer): void => {
  const textLength = editorString(peer.editor, [0]).length;

  peer.editor.update.selection.set({
    kind: 'text',
    anchor: { path: [0, 0], offset: textLength },
    focus: { path: [0, 0], offset: textLength },
  });

  peer.editor.update.break.insert();

  peer.editor.update.selection.set({
    kind: 'text',
    anchor: { path: [1, 0], offset: 0 },
    focus: { path: [1, 0], offset: 0 },
  });

  peer.editor.update.text.deleteBackward({ unit: 'character' });
};

const repeatSplitMerge = (peer: Peer, times: number): void => {
  for (let index = 0; index < times; index++) {
    splitThenDeleteBackwardEmptyParagraph(peer);
  }
};

const assertNoLeakedVirtualPlaceholder = (
  nodes: readonly Descendant[]
): void => {
  for (const node of nodes) {
    if (!ElementApi.isElement(node)) {
      continue;
    }

    assert.notEqual(node.type, 'element');
    assertNoLeakedVirtualPlaceholder(node.children);
  }
};

const assertNoNestedElements = (nodes: readonly Descendant[]): void => {
  for (const node of nodes) {
    if (!ElementApi.isElement(node)) {
      continue;
    }

    assert.equal(
      node.children.some((child) => 'children' in child),
      false
    );
  }
};

describe('plitejs/yjs split and merge collaboration contract', () => {
  it('keeps repeated paragraph split and merge from leaking virtual placeholders', () => {
    const peers = createPeers(['a', 'b', 'c']);
    const [a] = peers;

    repeatSplitMerge(a, 2);
    syncConnectedPeers(peers);

    for (const peer of peers) {
      const snapshotChildren = readPeerChildren(peer);

      assert.deepEqual(getPeerTopLevelTexts(peer), ['Hello world!']);
      assertNoLeakedVirtualPlaceholder(snapshotChildren);
      assertNoNestedElements(snapshotChildren);
      assert.deepEqual(readPeerPliteValue(peer), [paragraph('Hello world!')]);
    }
  });

  it('keeps repeated local paragraph split and merge traceable', () => {
    const peer = createPeer('b');

    clearYjsTrace(peer);
    repeatSplitMerge(peer, 2);

    const snapshotChildren = readPeerChildren(peer);

    assert.deepEqual(getPeerTopLevelTexts(peer), ['Hello world!']);
    assertNoLeakedVirtualPlaceholder(snapshotChildren);
    assertNoNestedElements(snapshotChildren);
    assert.deepEqual(readPeerPliteValue(peer), [paragraph('Hello world!')]);
  });

  for (const [edit, write, beforeUndo] of [
    [
      'delete',
      (peer: Peer) =>
        peer.editor.update.text.delete({
          at: {
            anchor: { path: [0, 0], offset: 4 },
            focus: { path: [0, 0], offset: 5 },
          },
        }),
      'f',
    ],
    [
      'typing',
      (peer: Peer) =>
        peer.editor.update.text.insert('X', {
          at: { path: [0, 0], offset: 5 },
        }),
      'eXf',
    ],
  ] as const) {
    for (const first of ['writer', 'peer'] as const) {
      it(`undoes a peer's ${edit} after a split that crossed it, in a line an earlier split and join left, ${first} first`, () => {
        const children = [paragraph('abcdef')];
        const a = createYjsPeer({
          children,
          clientId: 'a',
          numericClientId: 1,
        });
        const b = createYjsPeer({
          children,
          clientId: 'b',
          numericClientId: 2,
          seedUpdate: Y.encodeStateAsUpdate(a.doc),
        });
        const caret = (offset: number) => ({
          kind: 'text' as const,
          anchor: { path: [0, 0], offset },
          focus: { path: [0, 0], offset },
        });

        a.editor.update((tx) => {
          tx.selection.set(caret(2));
          tx.break.insert();
        });
        syncConnectedPeers([a, b]);
        a.editor.update.nodes.merge({ at: [1] });
        syncConnectedPeers([a, b]);
        a.editor.update((tx) => {
          tx.text.delete({
            at: {
              anchor: { path: [0, 0], offset: 2 },
              focus: { path: [0, 0], offset: 3 },
            },
          });
          tx.selection.set(caret(3));
          tx.break.insert();
        });
        write(b);
        syncConnectedPeers(first === 'writer' ? [a, b] : [b, a]);

        assert.deepEqual(readPeerChildren(b), [
          paragraph('abd'),
          paragraph(beforeUndo),
        ]);

        b.editor.api.history.undo();
        syncConnectedPeers([b, a]);
        syncConnectedPeers([a, b]);

        const fresh = createYjsPeer({
          children: [paragraph('seed')],
          clientId: 'c',
          numericClientId: 3,
          seedUpdate: Y.encodeStateAsUpdate(a.doc),
        });
        const expected = [paragraph('abd'), paragraph('ef')];

        assert.deepEqual(
          [a, b, fresh].map((peer) => readPeerChildren(peer)),
          [expected, expected, expected]
        );
      });
    }
  }

  for (const offset of [0, 2]) {
    it(`sends the right half's new color when one commit splits a block at offset ${offset} and colors that half`, () => {
      const peers = createSchemaPeers(ColorSchema, [paragraph('word')]);
      const [a, b] = peers;

      a.editor.update((tx) => {
        tx.selection.set({
          kind: 'text',
          anchor: { path: [0, 0], offset },
          focus: { path: [0, 0], offset },
        });
        tx.break.insert();
        tx.nodes.set({ color: 'green' }, { at: [1, 0] });
      });
      syncConnectedPeers(peers);

      assert.deepEqual(readPeerPliteValue(a), [
        paragraph('word'.slice(0, offset)),
        {
          type: 'paragraph',
          children: [{ color: 'green', text: 'word'.slice(offset) }],
        },
      ]);
      assert.deepEqual(readPeerPliteValue(b), readPeerPliteValue(a));
      for (const peer of peers) {
        assert.deepEqual(readPeerChildren(peer), readPeerPliteValue(a));
      }
    });
  }

  for (const delivered of ['split first', 'typing first']) {
    it(`keeps a peer's concurrent typing in the left half when one commit splits a block and colors the right half, ${delivered}`, () => {
      const peers = createSchemaPeers(ColorSchema, [paragraph('word')]);
      const [a, b] = peers;

      a.editor.update((tx) => {
        tx.selection.set({
          kind: 'text',
          anchor: { path: [0, 0], offset: 2 },
          focus: { path: [0, 0], offset: 2 },
        });
        tx.break.insert();
        tx.nodes.set({ color: 'green' }, { at: [1, 0] });
      });
      b.editor.update((tx) => {
        tx.text.insert('X', { at: { path: [0, 0], offset: 1 } });
      });
      syncConnectedPeers(delivered === 'split first' ? peers : [b, a]);

      assert.deepEqual(readPeerPliteValue(a), [
        paragraph('wXo'),
        { type: 'paragraph', children: [{ color: 'green', text: 'rd' }] },
      ]);
      assert.deepEqual(readPeerPliteValue(b), readPeerPliteValue(a));
      for (const peer of peers) {
        assert.deepEqual(readPeerChildren(peer), readPeerPliteValue(a));
      }
    });
  }

  for (const delivered of ['split first', 'typing first']) {
    it(`keeps a peer's concurrent typing and sends the empty right leaf's metadata when one commit splits a block before an inline element, ${delivered}`, () => {
      const link = { type: 'link', children: [{ text: 'link' }] };
      const peers = createSchemaPeers(InlineMetadataSchema, [
        {
          type: 'paragraph',
          children: [{ text: 'word' }, link, { text: 'tail' }],
        },
      ]);
      const [a, b] = peers;

      a.editor.update((tx) => {
        tx.selection.set({
          kind: 'text',
          anchor: { path: [0, 0], offset: 4 },
          focus: { path: [0, 0], offset: 4 },
        });
        tx.break.insert();
        tx.nodes.set({ commentIds: ['new'] }, { at: [1, 0] });
      });
      b.editor.update((tx) => {
        tx.text.insert('X', { at: { path: [0, 0], offset: 1 } });
      });
      syncConnectedPeers(delivered === 'split first' ? peers : [b, a]);

      assert.deepEqual(readPeerPliteValue(a), [
        paragraph('wXord'),
        {
          type: 'paragraph',
          children: [{ commentIds: ['new'], text: '' }, link, { text: 'tail' }],
        },
      ]);
      assert.deepEqual(readPeerPliteValue(b), readPeerPliteValue(a));
      for (const peer of peers) {
        assert.deepEqual(readPeerChildren(peer), readPeerPliteValue(a));
      }
    });
  }

  it('colors the right letters in the shared document when a range crosses the join of two merged blocks', () => {
    const peers = createSchemaPeers(ColorSchema, [
      paragraph('ab'),
      paragraph('cd'),
    ]);
    const [a, b] = peers;

    a.editor.update((tx) => {
      tx.selection.set({
        kind: 'text',
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 0 },
      });
      tx.text.deleteBackward({ unit: 'character' });
    });
    a.editor.update((tx) => {
      tx.nodes.set(
        { color: 'green' },
        {
          at: {
            anchor: { path: [0, 0], offset: 1 },
            focus: { path: [0, 0], offset: 3 },
          },
          match: NodeApi.isText,
          split: true,
        }
      );
    });
    syncConnectedPeers(peers);

    const colored = [
      {
        type: 'paragraph',
        children: [
          { text: 'a' },
          { color: 'green', text: 'bc' },
          { text: 'd' },
        ],
      },
    ];

    assert.deepEqual(readPeerPliteValue(a), colored);
    assert.deepEqual(readPeerPliteValue(b), colored);
    for (const peer of peers) {
      assert.deepEqual(readPeerChildren(peer), colored);
    }
  });

  it('keeps every editor and the shared document in step when one commit changes a letter of the left half and splits the block', () => {
    const peers = createSchemaPeers(ColorSchema, [paragraph('word')]);
    const [a, b] = peers;

    a.editor.update((tx) => {
      tx.text.delete({
        at: {
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 1 },
        },
      });
      tx.text.insert('W', { at: { path: [0, 0], offset: 0 } });
      tx.selection.set({
        kind: 'text',
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [0, 0], offset: 2 },
      });
      tx.break.insert();
    });
    syncConnectedPeers(peers);

    const split = [paragraph('Wo'), paragraph('rd')];

    assert.deepEqual(readPeerPliteValue(a), split);
    assert.deepEqual(readPeerPliteValue(b), split);
    for (const peer of peers) {
      assert.deepEqual(readPeerChildren(peer), split);
    }
  });

  it('sends a property the same commit sets after an inline element when it splits the block before that element', () => {
    const link = { type: 'link', children: [{ text: 'L' }] };
    const peers = createSchemaPeers(InlineMetadataSchema, [
      {
        type: 'paragraph',
        children: [{ text: 'word' }, link, { text: 'tail' }],
      },
    ]);
    const [a, b] = peers;

    a.editor.update((tx) => {
      tx.selection.set({
        kind: 'text',
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [0, 0], offset: 2 },
      });
      tx.break.insert();
      tx.nodes.set({ commentIds: ['new'] }, { at: [1, 2] });
    });
    syncConnectedPeers(peers);

    const split = [
      paragraph('wo'),
      {
        type: 'paragraph',
        children: [{ text: 'rd' }, link, { commentIds: ['new'], text: 'tail' }],
      },
    ];

    assert.deepEqual(readPeerPliteValue(a), split);
    assert.deepEqual(readPeerPliteValue(b), split);
    for (const peer of peers) {
      assert.deepEqual(readPeerChildren(peer), split);
    }
  });

  it("removes the right half's set-valued property on every client when one commit splits a block, makes that half a heading and unsets the property", () => {
    const peers = createSchemaPeers(ParagraphSetSchema, [
      { type: 'paragraph', children: [{ commentIds: ['a'], text: 'word' }] },
    ]);
    const [a, b] = peers;

    a.editor.update((tx) => {
      tx.selection.set({
        kind: 'text',
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [0, 0], offset: 2 },
      });
      tx.break.insert();
      tx.nodes.set({ type: 'heading' }, { at: [1] });
      tx.nodes.unset('commentIds', { at: [1, 0] });
    });
    syncConnectedPeers(peers);

    assert.deepEqual(readPeerPliteValue(b), [
      { type: 'paragraph', children: [{ commentIds: ['a'], text: 'wo' }] },
      { type: 'heading', children: [{ text: 'rd' }] },
    ]);
    assert.deepEqual(readPeerPliteValue(a), readPeerPliteValue(b));
    for (const peer of peers) {
      assert.deepEqual(readPeerChildren(peer), readPeerPliteValue(b));
    }
  });

  it('removes a set-valued property on every client when one commit makes a paragraph a heading in place and unsets the property', () => {
    const peers = createSchemaPeers(ParagraphSetSchema, [
      { type: 'paragraph', children: [{ commentIds: ['a'], text: 'word' }] },
    ]);
    const [a] = peers;

    a.editor.update((tx) => {
      tx.nodes.set({ type: 'heading' }, { at: [0] });
      tx.nodes.unset('commentIds', { at: [0, 0] });
    });
    syncConnectedPeers(peers);

    const heading = [{ type: 'heading', children: [{ text: 'word' }] }];
    for (const peer of peers) {
      assert.deepEqual(readPeerPliteValue(peer), heading);
      assert.deepEqual(readPeerChildren(peer), heading);
    }
  });

  it("removes a block's own set-valued property from the shared document when one commit makes a paragraph a heading and unsets the property", () => {
    const peers = createSchemaPeers(ParagraphSetSchema, [
      { type: 'paragraph', tags: ['a'], children: [{ text: 'word' }] },
    ]);
    const [a] = peers;

    a.editor.update((tx) => {
      tx.nodes.set({ type: 'heading' }, { at: [0] });
      tx.nodes.unset('tags', { at: [0] });
    });
    syncConnectedPeers(peers);

    const heading = [{ type: 'heading', children: [{ text: 'word' }] }];
    for (const peer of peers) {
      assert.deepEqual(readPeerPliteValue(peer), heading);
      assert.deepEqual(readPeerChildren(peer), heading);
    }
  });

  it("sends a block's new value on every client when one commit makes a paragraph a heading and sets a property that is a set only on paragraphs", () => {
    const peers = createSchemaPeers(RetypeEncodingSchema, [
      { type: 'paragraph', tags: ['a'], children: [{ text: 'word' }] },
    ]);
    const [a] = peers;

    a.editor.update((tx) => {
      tx.nodes.set({ type: 'heading' }, { at: [0] });
      tx.nodes.set({ tags: ['b'] }, { at: [0] });
    });
    syncConnectedPeers(peers);

    const heading = [
      { type: 'heading', tags: ['b'], children: [{ text: 'word' }] },
    ];
    for (const peer of peers) {
      assert.deepEqual(readPeerPliteValue(peer), heading);
      assert.deepEqual(readPeerChildren(peer), heading);
    }
  });

  it("removes a property a peer set under the heading's rules when a later commit makes the paragraph a heading again and unsets it", () => {
    const peers = createSchemaPeers(RetypeEncodingSchema, [
      { type: 'heading', children: [{ text: 'word' }] },
    ]);
    const [a, b] = peers;

    a.editor.update((tx) => {
      tx.nodes.set({ type: 'paragraph' }, { at: [0] });
    });
    b.editor.update((tx) => {
      tx.nodes.set({ commentIds: ['b'] }, { at: [0, 0] });
    });
    syncConnectedPeers(peers);
    a.editor.update((tx) => {
      tx.nodes.set({ type: 'heading' }, { at: [0] });
      tx.nodes.unset('commentIds', { at: [0, 0] });
    });
    syncConnectedPeers(peers);

    const heading = [{ type: 'heading', children: [{ text: 'word' }] }];
    for (const peer of peers) {
      assert.deepEqual(readPeerPliteValue(peer), heading);
      assert.deepEqual(readPeerChildren(peer), heading);
    }
  });

  it('removes a set-valued property on every client when one commit unsets it on a paragraph and merges the paragraph into a heading', () => {
    const peers = createSchemaPeers(ParagraphSetSchema, [
      { type: 'heading', children: [{ text: 'ab' }] },
      { type: 'paragraph', children: [{ commentIds: ['a'], text: 'cd' }] },
    ]);
    const [a] = peers;

    a.editor.update((tx) => {
      tx.nodes.unset('commentIds', { at: [1, 0] });
      tx.nodes.merge({ at: [1] });
    });
    syncConnectedPeers(peers);

    const heading = [{ type: 'heading', children: [{ text: 'abcd' }] }];
    for (const peer of peers) {
      assert.deepEqual(readPeerPliteValue(peer), heading);
      assert.deepEqual(readPeerChildren(peer), heading);
    }
  });

  it("keeps a peer's concurrent set member when one commit merges two paragraphs and changes the joined one's set-valued property, which is set-valued only under its parent", () => {
    const peers = createSchemaPeers(SectionSetSchema, [
      section([
        { type: 'paragraph', tags: ['a'], children: [{ text: 'ab' }] },
        { type: 'paragraph', children: [{ text: 'cd' }] },
      ]),
    ]);
    const [a, b] = peers;

    a.editor.update((tx) => {
      tx.nodes.merge({ at: [0, 1] });
      tx.nodes.set({ tags: ['a', 'c'] }, { at: [0, 0] });
    });
    b.editor.update((tx) => {
      tx.nodes.set({ tags: ['a', 'b'] }, { at: [0, 0] });
    });
    syncConnectedPeers(peers);

    const merged = [
      section([
        {
          type: 'paragraph',
          tags: ['a', 'b', 'c'],
          children: [{ text: 'abcd' }],
        },
      ]),
    ];
    for (const peer of peers) {
      assert.deepEqual(readPeerPliteValue(peer), merged);
      assert.deepEqual(readPeerChildren(peer), merged);
    }
  });

  it("keeps a peer's concurrent set member in a link's text when one commit adds a member to it and merges its paragraph into a heading", () => {
    const peers = createSchemaPeers(LinkSetSchema, [
      { type: 'heading', children: [{ text: 'ab' }] },
      {
        type: 'paragraph',
        children: [
          { text: 'x' },
          { type: 'link', children: [{ commentIds: ['a'], text: 'cd' }] },
          { text: 'y' },
        ],
      },
    ]);
    const [a, b] = peers;

    a.editor.update((tx) => {
      tx.nodes.set({ commentIds: ['a', 'c'] }, { at: [1, 1, 0] });
      tx.nodes.merge({ at: [1] });
    });
    b.editor.update((tx) => {
      tx.nodes.set({ commentIds: ['a', 'b'] }, { at: [1, 1, 0] });
    });
    syncConnectedPeers(peers);

    const merged = [
      {
        type: 'heading',
        children: [
          { text: 'abx' },
          {
            type: 'link',
            children: [{ commentIds: ['a', 'b', 'c'], text: 'cd' }],
          },
          { text: 'y' },
        ],
      },
    ];
    for (const peer of peers) {
      assert.deepEqual(readPeerPliteValue(peer), merged);
      assert.deepEqual(readPeerChildren(peer), merged);
    }
  });

  it("keeps a peer's concurrent set member in merged text whose property the merge keeps but the heading stores as a scalar", () => {
    const peers = createSchemaPeers(RetypeEncodingSchema, [
      { type: 'heading', children: [{ text: 'ab' }] },
      { type: 'paragraph', children: [{ commentIds: ['a'], text: 'cd' }] },
    ]);
    const [a, b] = peers;

    a.editor.update((tx) => {
      tx.nodes.merge({ at: [1] });
    });
    b.editor.update((tx) => {
      tx.nodes.set({ commentIds: ['a', 'b'] }, { at: [1, 0] });
    });
    syncConnectedPeers(peers);

    const merged = [
      {
        type: 'heading',
        children: [{ text: 'ab' }, { commentIds: ['a', 'b'], text: 'cd' }],
      },
    ];
    for (const peer of peers) {
      assert.deepEqual(readPeerPliteValue(peer), merged);
      assert.deepEqual(readPeerChildren(peer), merged);
    }
  });

  it("keeps a peer's concurrent set member on a link whose property the merge keeps but its new parent stores as a scalar", () => {
    const peers = createSchemaPeers(LinkParentTagsSchema, [
      { type: 'heading', children: [{ text: 'ab' }] },
      {
        type: 'paragraph',
        children: [
          { text: 'x' },
          { type: 'link', tags: ['a'], children: [{ text: 'cd' }] },
          { text: 'y' },
        ],
      },
    ]);
    const [a, b] = peers;

    a.editor.update((tx) => {
      tx.nodes.set({ color: 'red' }, { at: [1, 1, 0] });
      tx.nodes.merge({ at: [1] });
    });
    b.editor.update((tx) => {
      tx.nodes.set({ tags: ['a', 'b'] }, { at: [1, 1] });
    });
    syncConnectedPeers(peers);

    const merged = [
      {
        type: 'heading',
        children: [
          { text: 'abx' },
          {
            type: 'link',
            tags: ['a', 'b'],
            children: [{ color: 'red', text: 'cd' }],
          },
          { text: 'y' },
        ],
      },
    ];
    for (const peer of peers) {
      assert.deepEqual(readPeerPliteValue(peer), merged);
      assert.deepEqual(readPeerChildren(peer), merged);
    }
  });

  it('keeps nested virtual placeholder content when splitting a parent element', () => {
    const peer = createPeer('b', [
      quote([paragraph('intro'), paragraph('alpha'), paragraph('beta')]),
    ]);

    peer.editor.update.nodes.merge({ at: [0, 2] });

    assert.deepEqual(readPeerPliteValue(peer), [
      quote([paragraph('intro'), paragraphParts('alpha', 'beta')]),
    ]);

    peer.editor.update.nodes.split({ at: [0], position: 1 });

    assert.deepEqual(readPeerPliteValue(peer), [
      quote([paragraph('intro')]),
      quote([paragraphParts('alpha', 'beta')]),
    ]);
  });

  it('keeps parent-level virtual move content when merging the adopted target element', () => {
    const peer = createPeer('b', [
      quote([paragraph('left')]),
      quote([]),
      paragraph('moved'),
    ]);

    peer.editor.update.nodes.move({ at: [2], to: [1, 0] });

    assert.deepEqual(readPeerPliteValue(peer), [
      quote([paragraph('left')]),
      quote([paragraph('moved')]),
    ]);

    peer.editor.update.nodes.merge({ at: [1] });

    assert.deepEqual(readPeerPliteValue(peer), [
      quote([paragraph('left'), paragraph('moved')]),
    ]);
  });

  it('keeps nested parent-level virtual move content when splitting a grandparent element', () => {
    const peer = createPeer('b', [
      section([quote([]), paragraph('right')]),
      paragraph('moved'),
    ]);

    peer.editor.update.nodes.move({ at: [1], to: [0, 0, 0] });

    assert.deepEqual(readPeerPliteValue(peer), [
      section([quote([paragraph('moved')]), paragraph('right')]),
    ]);
    const movedParagraph = getVisibleYjsNodeAt(peer, [0, 0, 0]);

    peer.editor.update.nodes.split({ at: [0], position: 0 });

    assert.deepEqual(readPeerPliteValue(peer), [
      section([{ text: '' }]),
      section([quote([paragraph('moved')]), paragraph('right')]),
    ]);
    assert.equal(getVisibleYjsNodeAt(peer, [1, 0, 0]), movedParagraph);
  });
});

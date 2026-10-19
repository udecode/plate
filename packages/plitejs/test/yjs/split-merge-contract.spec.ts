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
      schema.textProperty('commentIds', property.set(property.string()), {
        target: target.type('paragraph'),
      }),
    ],
    root: schema.content.not(schema.content.text()),
    unknown: 'reject',
  }
);

const createSchemaPeers = (
  plugin:
    | typeof ColorSchema
    | typeof InlineMetadataSchema
    | typeof ParagraphSetSchema,
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

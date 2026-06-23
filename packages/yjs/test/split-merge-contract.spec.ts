import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { type Descendant } from '@platejs/plite';
import { Editor } from '@platejs/plite/internal';

import {
  clearYjsTrace,
  createSeededYjsPeers,
  createYjsPeer,
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
  children: texts.map((text) => ({ text })),
});

const quote = (children: readonly Descendant[]): Descendant => ({
  type: 'quote',
  children,
});

const section = (children: readonly Descendant[]): Descendant => ({
  type: 'section',
  children,
});

const initialValue = (): Descendant[] => [paragraph('Hello world!')];

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

const splitThenDeleteBackwardEmptyParagraph = (peer: Peer): void => {
  const textLength = Editor.string(peer.editor, [0]).length;

  peer.editor.update((tx) => {
    tx.selection.set({
      anchor: { path: [0, 0], offset: textLength },
      focus: { path: [0, 0], offset: textLength },
    });
  });

  peer.editor.update((tx) => {
    tx.break.insert();
  });

  peer.editor.update((tx) => {
    tx.selection.set({
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 0], offset: 0 },
    });
  });

  peer.editor.update((tx) => {
    tx.text.deleteBackward({ unit: 'character' });
  });
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
    if (!('children' in node)) {
      continue;
    }

    assert.notEqual(node.type, 'plite-yjs-virtual-placeholder');
    assertNoLeakedVirtualPlaceholder(node.children);
  }
};

const assertNoNestedElements = (nodes: readonly Descendant[]): void => {
  for (const node of nodes) {
    if (!('children' in node)) {
      continue;
    }

    assert.equal(
      node.children.some((child) => 'children' in child),
      false
    );
  }
};

describe('@platejs/yjs split and merge collaboration contract', () => {
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

  it('keeps nested virtual placeholder content when splitting a parent element', () => {
    const peer = createPeer('b', [
      quote([paragraph('intro'), paragraph('alpha'), paragraph('beta')]),
    ]);

    peer.editor.update((tx) => {
      tx.nodes.merge({ at: [0, 2] });
    });

    assert.deepEqual(readPeerPliteValue(peer), [
      quote([paragraph('intro'), paragraphParts('alpha', 'beta')]),
    ]);

    peer.editor.update((tx) => {
      tx.operations.replay([
        {
          path: [0],
          position: 1,
          properties: { type: 'quote' },
          type: 'split_node',
        },
      ]);
    });

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

    peer.editor.update((tx) => {
      tx.operations.replay([
        {
          newPath: [1, 0],
          path: [2],
          type: 'move_node',
        },
      ]);
    });

    assert.deepEqual(readPeerPliteValue(peer), [
      quote([paragraph('left')]),
      quote([paragraph('moved')]),
    ]);

    peer.editor.update((tx) => {
      tx.nodes.merge({ at: [1] });
    });

    assert.deepEqual(readPeerPliteValue(peer), [
      quote([paragraph('left'), paragraph('moved')]),
    ]);
  });

  it('keeps nested parent-level virtual move content when splitting a grandparent element', () => {
    const peer = createPeer('b', [
      section([quote([]), paragraph('right')]),
      paragraph('moved'),
    ]);

    peer.editor.update((tx) => {
      tx.operations.replay([
        {
          newPath: [0, 0, 0],
          path: [1],
          type: 'move_node',
        },
      ]);
    });

    assert.deepEqual(readPeerPliteValue(peer), [
      section([quote([paragraph('moved')]), paragraph('right')]),
    ]);
    const movedParagraph = getVisibleYjsNodeAt(peer, [0, 0, 0]);

    peer.editor.update((tx) => {
      tx.operations.replay([
        {
          path: [0],
          position: 0,
          properties: { type: 'section' },
          type: 'split_node',
        },
      ]);
    });

    assert.deepEqual(readPeerPliteValue(peer), [
      section([{ text: '' }]),
      section([quote([paragraph('moved')]), paragraph('right')]),
    ]);
    assert.equal(getVisibleYjsNodeAt(peer, [1, 0, 0]), movedParagraph);
  });
});

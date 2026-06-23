import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Descendant } from '@platejs/plite';
import { Editor } from '@platejs/plite/internal';
import * as Y from 'yjs';

import {
  getPliteYjsElementType,
  setPliteYjsAttribute,
} from '../src/core/attributes';
import { createSplitElement } from '../src/core/replacement';
import {
  assertPeerTexts,
  connectYjsPeerAndSync,
  createSeededYjsPeers,
  createYjsPeer,
  disconnectAndClearYjsTrace,
  disconnectYjsPeer,
  getPeerTopLevelTexts,
  getVisibleYjsNodeAt,
  getYjsNodeAt,
  getYjsTrace,
  type Peer,
  paragraph,
  readPeerChildren,
  redoYjsPeer,
  redoYjsPeerAndSync,
  syncConnectedPeers,
  undoYjsPeer,
  undoYjsPeerAndSync,
} from './support/collaboration';

const initialValue = (): Descendant[] => [paragraph('alphabeta')];

const helloValue = (): Descendant[] => [paragraph('Hello world!')];

const createPeer = (
  clientId: string,
  seedUpdate?: Uint8Array,
  children: readonly Descendant[] = initialValue()
): Peer => createYjsPeer({ children, clientId, seedUpdate });

const createPeers = (
  clientIds: readonly string[],
  children: readonly Descendant[] = initialValue()
): Peer[] => createSeededYjsPeers({ children, clientIds });

const splitParagraph = (peer: Peer): void => {
  peer.editor.update((tx) => {
    tx.nodes.split({ at: { path: [0, 0], offset: 'alph'.length } });
  });
};

const splitHelloParagraph = (peer: Peer): void => {
  peer.editor.update((tx) => {
    tx.nodes.split({ at: { path: [0, 0], offset: 'Hello '.length } });
  });
};

const insertRemoteTextAtSplitPoint = (peer: Peer): void => {
  peer.editor.update((tx) => {
    tx.text.insert('!', { at: { path: [0, 0], offset: 'alph'.length } });
  });
};

const appendRemoteText = (peer: Peer): void => {
  peer.editor.update((tx) => {
    tx.text.insert('!', { at: { path: [0, 0], offset: 'alphabeta'.length } });
  });
};

const appendExclamationToFirstParagraph = (peer: Peer): void => {
  const offset = Editor.string(peer.editor, [0]).length;

  peer.editor.update((tx) => {
    tx.text.insert('!', { at: { path: [0, 0], offset } });
  });
};

const insertWorldParagraphAfterFirst = (peer: Peer): void => {
  const offset = Editor.string(peer.editor, [0]).length;

  peer.editor.update((tx) => {
    tx.selection.set({
      anchor: { path: [0, 0], offset },
      focus: { path: [0, 0], offset },
    });
  });
  peer.editor.update((tx) => {
    tx.break.insert();
  });
  peer.editor.update((tx) => {
    tx.text.insert('world! after');
  });
};

const insertTextSplitAndInsertRightText = (peer: Peer): void => {
  peer.editor.update((tx) => {
    tx.selection.set({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });
  });
  peer.editor.update((tx) => {
    tx.text.insert('a');
  });
  peer.editor.update((tx) => {
    tx.break.insert();
  });
  peer.editor.update((tx) => {
    tx.text.insert('b');
  });
};

describe('@platejs/yjs split_node collaboration contract', () => {
  it('keeps the original element type when split properties carry a non-string type', () => {
    const doc = new Y.Doc();
    const root = doc.get('@platejs/plite', Y.XmlElement);
    const original = new Y.XmlElement('paragraph');

    root.insert(0, [original]);
    setPliteYjsAttribute(original, 'type', 'paragraph');

    const right = createSplitElement(original, { role: 'note', type: 123 }, []);

    root.insert(1, [right]);

    assert.equal(getPliteYjsElementType(right), 'paragraph');
    assert.equal(right.getAttribute('role'), 'note');
  });

  it('applies local offline public split without a root snapshot fallback', () => {
    const peer = createPeer('b');
    const leftText = getYjsNodeAt(peer, [0, 0]);

    disconnectAndClearYjsTrace(peer);
    splitParagraph(peer);

    assert.deepEqual(getPeerTopLevelTexts(peer), ['alph', 'abeta']);
    assert.equal(getYjsNodeAt(peer, [0, 0]), leftText);
    assert.deepEqual(getYjsTrace(peer), [
      { mode: 'operation', operationType: 'split_node' },
      { mode: 'operation', operationType: 'split_node' },
    ]);
  });

  it('splits a block at a text leaf boundary without materializing empty text', () => {
    const peer = createPeer('b', undefined, [
      {
        children: [{ text: 'alpha' }, { bold: true, text: 'beta' }],
        type: 'paragraph',
      },
    ]);

    peer.editor.update((tx) => {
      tx.nodes.split({ at: { path: [0, 0], offset: 'alpha'.length } });
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

  it('splits virtual moved content by visible child position', () => {
    const peer = createPeer('b', undefined, [
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
      tx.operations.replay([
        {
          path: [0],
          position: 0,
          properties: { type: 'quote' },
          type: 'split_node',
        },
      ]);
    });

    assert.deepEqual(getPeerTopLevelTexts(peer), ['', 'moved']);
    assert.equal(getVisibleYjsNodeAt(peer, [1, 0]), movedParagraph);
    assert.deepEqual(getYjsTrace(peer), [
      { mode: 'operation', operationType: 'split_node' },
      { mode: 'operation', operationType: 'insert_node' },
    ]);
  });

  it('splits raw children after a leading virtual moved child', () => {
    const peer = createPeer('b', undefined, [
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
        {
          node: paragraph('raw'),
          path: [0, 1],
          type: 'insert_node',
        },
      ]);
    });
    const movedParagraph = getVisibleYjsNodeAt(peer, [0, 0]);

    disconnectAndClearYjsTrace(peer);
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

    assert.deepEqual(getPeerTopLevelTexts(peer), ['moved', 'raw']);
    assert.equal(getVisibleYjsNodeAt(peer, [0, 0]), movedParagraph);
    assert.deepEqual(getYjsTrace(peer), [
      { mode: 'operation', operationType: 'split_node' },
    ]);
  });

  it('preserves concurrent remote insert intent when an offline public split reconnects', () => {
    const peers = createPeers(['a', 'b', 'c']);
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

  it('preserves a remote split when an offline local split was undone before reconnect', () => {
    const peers = createPeers(['a', 'b', 'c'], helloValue());
    const [a, b] = peers;

    disconnectYjsPeer(a);
    splitHelloParagraph(a);
    undoYjsPeer(a);
    assert.deepEqual(getPeerTopLevelTexts(a), ['Hello world!']);

    splitHelloParagraph(b);
    syncConnectedPeers(peers);
    assert.deepEqual(getPeerTopLevelTexts(a), ['Hello world!']);
    assert.deepEqual(getPeerTopLevelTexts(b), ['Hello ', 'world!']);

    connectYjsPeerAndSync(a, peers);

    assertPeerTexts(peers, ['Hello ', 'world!']);
  });

  it('replays an offline split redo onto the remote split boundary after reconnect', () => {
    const peers = createPeers(['a', 'b', 'c'], helloValue());
    const [a, b] = peers;

    disconnectYjsPeer(a);
    splitHelloParagraph(a);
    undoYjsPeer(a);
    assert.deepEqual(getPeerTopLevelTexts(a), ['Hello world!']);

    appendExclamationToFirstParagraph(b);
    syncConnectedPeers(peers);
    splitHelloParagraph(b);
    syncConnectedPeers(peers);
    assert.deepEqual(getPeerTopLevelTexts(a), ['Hello world!']);
    assert.deepEqual(getPeerTopLevelTexts(b), ['Hello ', 'world!!']);

    connectYjsPeerAndSync(a, peers);
    redoYjsPeerAndSync(a, peers);

    assertPeerTexts(peers, ['Hello ', 'world!!']);
  });

  it('does not absorb a later unrelated paragraph that matches the offline undo suffix', () => {
    const peers = createPeers(['a', 'b', 'c'], helloValue());
    const [a, b] = peers;

    disconnectYjsPeer(a);
    splitHelloParagraph(a);
    undoYjsPeer(a);
    assert.deepEqual(getPeerTopLevelTexts(a), ['Hello world!']);

    connectYjsPeerAndSync(a, peers);
    assertPeerTexts(peers, ['Hello world!']);

    insertWorldParagraphAfterFirst(b);
    syncConnectedPeers(peers);
    assertPeerTexts(peers, ['Hello world!', 'world! after']);

    redoYjsPeerAndSync(a, peers);

    assertPeerTexts(peers, ['Hello ', 'world!', 'world! after']);
  });

  it('undoes and redoes only the local split intent after reconnect', () => {
    const peers = createPeers(['a', 'b', 'c']);
    const [a, b] = peers;

    disconnectYjsPeer(b);
    splitParagraph(b);
    insertRemoteTextAtSplitPoint(a);
    syncConnectedPeers(peers);

    connectYjsPeerAndSync(b, peers);
    assertPeerTexts(peers, ['alph!', 'abeta']);

    undoYjsPeerAndSync(b, peers);
    assertPeerTexts(peers, ['alph!abeta']);

    redoYjsPeerAndSync(b, peers);
    assertPeerTexts(peers, ['alph!', 'abeta']);
  });

  it('redoes text inserted into a split-created paragraph after undoing to an empty document', () => {
    const peer = createPeer('b', undefined, [paragraph('')]);

    insertTextSplitAndInsertRightText(peer);
    assert.deepEqual(getPeerTopLevelTexts(peer), ['a', 'b']);

    undoYjsPeer(peer);
    undoYjsPeer(peer);
    assert.deepEqual(getPeerTopLevelTexts(peer), ['a']);

    undoYjsPeer(peer);
    assert.deepEqual(getPeerTopLevelTexts(peer), ['']);

    redoYjsPeer(peer);
    assert.deepEqual(getPeerTopLevelTexts(peer), ['a']);

    redoYjsPeer(peer);
    redoYjsPeer(peer);
    assert.deepEqual(getPeerTopLevelTexts(peer), ['a', 'b']);
  });

  it('undoes a split after a prior merge without custom split-history replay', () => {
    const peer = createPeer('b', undefined, [
      paragraph('Hello world!'),
      paragraph('block 2'),
    ]);

    peer.editor.update((tx) => {
      tx.nodes.merge({ at: [1] });
    });
    assert.deepEqual(getPeerTopLevelTexts(peer), ['Hello world!block 2']);

    peer.editor.update((tx) => {
      tx.operations.replay([
        {
          path: [0, 0],
          position: 'Hello wor'.length,
          properties: {},
          type: 'split_node',
        },
        {
          path: [0],
          position: 1,
          properties: { type: 'paragraph' },
          type: 'split_node',
        },
      ]);
    });
    assert.deepEqual(getPeerTopLevelTexts(peer), ['Hello wor', 'ld!block 2']);

    undoYjsPeer(peer);
    assert.deepEqual(getPeerTopLevelTexts(peer), ['Hello world!block 2']);
  });

  it('undoes a break split after a prior merge without leaving the right split node visible', () => {
    const peer = createPeer('b', undefined, [
      paragraph('Hello world!'),
      paragraph('block 2'),
    ]);

    peer.editor.update((tx) => {
      tx.nodes.merge({ at: [1] });
    });
    assert.deepEqual(getPeerTopLevelTexts(peer), ['Hello world!block 2']);

    peer.editor.update((tx) => {
      tx.selection.set({
        anchor: { path: [0, 0], offset: 'Hello wor'.length },
        focus: { path: [0, 0], offset: 'Hello wor'.length },
      });
      tx.break.insert();
    });
    assert.deepEqual(getPeerTopLevelTexts(peer), ['Hello wor', 'ld!block 2']);

    undoYjsPeer(peer);
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
    assertPeerTexts(peers, ['alph!', 'abeta']);

    undoYjsPeerAndSync(b, peers);
    assertPeerTexts(peers, ['alph!abeta']);

    redoYjsPeerAndSync(b, peers);
    assertPeerTexts(peers, ['alph!', 'abeta']);
  });
});

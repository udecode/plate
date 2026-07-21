import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Descendant } from '@platejs/plite';
import { string as editorString } from '@platejs/plite/internal';
import * as Y from 'yjs';
import {
  assertCanonicalYjsTrace,
  assertPeerTexts,
  connectYjsPeerAndSync,
  createSeededYjsPeers,
  createYjsPeer,
  disconnectAndClearYjsTrace,
  disconnectYjsPeer,
  getPeerTopLevelTexts,
  getVisibleYjsNodeAt,
  getYjsNodeAt,
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

describe('@platejs/yjs split_node collaboration contract', () => {
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

  it('undoes and redoes only the local split after reconnect', () => {
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

    peer.editor.update.nodes.merge({ at: [1] });
    assert.deepEqual(getPeerTopLevelTexts(peer), ['Hello world!block 2']);

    peer.editor.update.nodes.split({
      at: { path: [0, 0], offset: 'Hello wor'.length },
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

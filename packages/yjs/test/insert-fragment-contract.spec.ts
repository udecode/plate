import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DocumentChange, type Descendant } from '@platejs/plite';

import {
  assertCanonicalYjsTrace,
  assertPeerTexts,
  connectYjsPeerAndSync,
  createSeededYjsPeers,
  createYjsPeer,
  disconnectAndClearYjsTrace,
  disconnectYjsPeer,
  getPeerTopLevelTexts,
  getYjsNodeAt,
  type Peer,
  paragraph,
  redoYjsPeerAndSync,
  syncConnectedPeers,
  undoYjsPeerAndSync,
} from './support/collaboration';

const clientIds = {
  a: 1,
  b: 2,
  c: 3,
} as const;

type ClientId = keyof typeof clientIds;

const initialValue = (): Descendant[] => [paragraph('alpha')];

const createPeer = (clientId: ClientId, seedUpdate?: Uint8Array): Peer =>
  createYjsPeer({
    children: initialValue(),
    clientId,
    numericClientId: clientIds[clientId],
    seedUpdate,
  });

const createPeers = (ids: readonly ClientId[]): Peer[] =>
  createSeededYjsPeers({
    children: initialValue(),
    clientIds: ids,
    numericClientIds: clientIds,
  });

const replaceSlice = (peer: Peer): void => {
  peer.editor.update.selection.set({
    kind: 'text',
    anchor: { path: [0, 0], offset: 'alpha'.length },
    focus: { path: [0, 0], offset: 'alpha'.length },
  });
  peer.editor.update((tx) => {
    tx.fragment.replace([{ text: 'Lin fragment' }]);
  });
};

const replaceAlphaBlock = (peer: Peer): void => {
  peer.editor.update((tx) => {
    tx.selection.set({
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 'alpha'.length },
    });
    tx.fragment.replace([paragraph('local')]);
  });
};

const appendRemoteText = (peer: Peer): void => {
  peer.editor.update.text.insert(' Ada', {
    at: { path: [0, 0], offset: 'alpha'.length },
  });
};

describe('@platejs/yjs insert_fragment collaboration contract', () => {
  it('applies local offline public insert_fragment without replacing the original Yjs text node', () => {
    const peer = createPeer('b');
    const text = getYjsNodeAt(peer, [0, 0]);
    const before = peer.editor.read.value();

    disconnectAndClearYjsTrace(peer);
    replaceSlice(peer);

    assert.deepEqual(getPeerTopLevelTexts(peer), ['alphaLin fragment']);
    assert.equal(getYjsNodeAt(peer, [0, 0]), text);
    assertCanonicalYjsTrace(peer);

    const change = peer.editor.read.lastCommit()?.changes;
    const after = peer.editor.read.value();
    const direct = DocumentChange.between(before, after);

    assert(change instanceof DocumentChange);
    assert.deepEqual(change.apply(before), direct.apply(before));
    assert.deepEqual(change.invert(before).apply(after), before);
    assert.deepEqual(
      DocumentChange.fromJSON(change.toJSON()).toJSON(),
      change.toJSON()
    );
    assert.doesNotMatch(JSON.stringify(change.toJSON()), /"open(?:End|Start)"/);
  });

  it('preserves concurrent remote text when an offline insert_fragment reconnects', () => {
    const peers = createPeers(['a', 'b', 'c']);
    const [a, b] = peers;

    disconnectAndClearYjsTrace(b);
    replaceSlice(b);
    appendRemoteText(a);
    syncConnectedPeers(peers);

    assert.deepEqual(getPeerTopLevelTexts(a), ['alpha Ada']);
    assert.deepEqual(getPeerTopLevelTexts(b), ['alphaLin fragment']);

    connectYjsPeerAndSync(b, peers);

    assertPeerTexts(peers, ['alpha AdaLin fragment']);
  });

  it('recovers insert_fragment convergence through real Yjs updates after reconnect', () => {
    const peers = createPeers(['a', 'b', 'c']);
    const [, b] = peers;

    disconnectYjsPeer(b);
    replaceSlice(b);
    connectYjsPeerAndSync(b, peers);

    assertPeerTexts(peers, ['alphaLin fragment']);
  });

  it('broadcasts remove_text at the end of a preserved insert_fragment text boundary', () => {
    const peers = createPeers(['a', 'b', 'c']);
    const [, b] = peers;

    replaceSlice(b);
    syncConnectedPeers(peers);
    assertPeerTexts(peers, ['alphaLin fragment']);

    const [text] = getPeerTopLevelTexts(b);
    assert.equal(typeof text, 'string');

    b.editor.update((tx) => {
      tx.selection.set({
        kind: 'text',
        anchor: { path: [0, 0], offset: text.length },
        focus: { path: [0, 0], offset: text.length },
      });
      tx.text.deleteBackward({ unit: 'character' });
    });
    syncConnectedPeers(peers);

    assertPeerTexts(peers, ['alphaLin fragmen']);
  });

  it('undoes and redoes only the local inserted fragment after reconnect', () => {
    const peers = createPeers(['a', 'b', 'c']);
    const [a, b] = peers;

    disconnectYjsPeer(b);
    replaceSlice(b);
    appendRemoteText(a);
    syncConnectedPeers(peers);

    connectYjsPeerAndSync(b, peers);
    assertPeerTexts(peers, ['alpha AdaLin fragment']);

    undoYjsPeerAndSync(b, peers);
    assertPeerTexts(peers, ['alpha Ada']);

    redoYjsPeerAndSync(b, peers);
    assertPeerTexts(peers, ['alpha AdaLin fragment']);
  });

  it('converges a structural slice with a concurrent block insert across reconnect and history', () => {
    const peers = createPeers(['a', 'b', 'c']);
    const [a, b] = peers;

    disconnectAndClearYjsTrace(b);
    replaceAlphaBlock(b);
    a.editor.update.nodes.insert([paragraph('remote')], { at: [1] });
    syncConnectedPeers(peers);

    assert.deepEqual(getPeerTopLevelTexts(a), ['alpha', 'remote']);
    assert.deepEqual(getPeerTopLevelTexts(b), ['local']);
    assertCanonicalYjsTrace(b);

    connectYjsPeerAndSync(b, peers);
    assertPeerTexts(peers, ['local', 'remote']);

    undoYjsPeerAndSync(b, peers);
    assertPeerTexts(peers, ['alpha', 'remote']);

    redoYjsPeerAndSync(b, peers);
    assertPeerTexts(peers, ['local', 'remote']);
  });
});

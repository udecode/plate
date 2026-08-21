import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Descendant } from '@platejs/plite';

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
  getVisibleYjsNodeAt,
  getYjsNodeAt,
  getYjsTrace,
  type Peer,
  paragraph,
  readPeerPliteValue,
  redoHistoryPeer,
  redoHistoryPeerAndSync,
  syncConnectedPeers,
  undoHistoryPeer,
  undoHistoryPeerAndSync,
} from './support/collaboration';

const clientIds = {
  a: 1,
  b: 2,
  c: 3,
} as const;

type ClientId = keyof typeof clientIds;
const numericClientIds: Readonly<Record<string, number>> = { ...clientIds };

const initialValue = (): Descendant[] => [paragraph('alpha')];

const multiLeafValue = (): Descendant[] => [
  {
    type: 'paragraph',
    children: [{ text: 'alpha' }, { bold: true, text: ' beta' }],
  },
];

const quote = (children: readonly Descendant[]): Descendant => ({
  type: 'quote',
  children,
});

const createPeer = (
  clientId: ClientId,
  seedUpdate?: Uint8Array,
  children: readonly Descendant[] = initialValue()
): Peer =>
  createYjsHistoryPeer({
    children,
    clientId,
    numericClientId: clientIds[clientId],
    seedUpdate,
  });

const createPeers = (ids: readonly ClientId[]): Peer[] =>
  createSeededYjsHistoryPeers({
    children: initialValue(),
    clientIds: ids,
    numericClientIds,
  });

const replaceAlphaWithFragment = (peer: Peer): void => {
  peer.editor.update.nodes.replaceChildren([{ text: 'alphaLin fragment' }], {
    at: [0],
  });
};

const replaceMultiLeafTextWithFragment = (peer: Peer): void => {
  peer.editor.update.nodes.replaceChildren(
    [{ text: 'alphaLin' }, { bold: true, text: ' betaAda' }],
    { at: [0] }
  );
};

const replaceRootWithFallback = (peer: Peer): void => {
  peer.editor.update.nodes.replaceChildren(
    [paragraph('bravo'), paragraph('charlie')],
    { at: [] }
  );
};

const appendRemoteText = (peer: Peer): void => {
  peer.editor.update.text.insert(' Ada', {
    at: { path: [0, 0], offset: 'alpha'.length },
  });
};

const insertLocalBang = (peer: Peer): void => {
  peer.editor.update.text.insert('!', {
    at: { path: [0, 0], offset: 'alpha'.length },
  });
};

const replayNoopRootReplaceFragment = (peer: Peer): void => {
  peer.editor.update((tx) => {
    tx.nodes.replaceChildren(initialValue(), { at: [] });
    tx.selection.set({
      kind: 'text',
      anchor: { path: [0, 0], offset: 'alpha'.length },
      focus: { path: [0, 0], offset: 'alpha'.length },
    });
  });
};

const moveParagraphIntoEmptyQuote = (peer: Peer): void => {
  peer.editor.update.nodes.move({ at: [2], to: [1, 0] });
};

const replaceMovedQuoteText = (peer: Peer): void => {
  peer.editor.update.nodes.replaceChildren([paragraph('moved!')], {
    at: [1],
  });
};

const replaceMovedQuoteChildren = (peer: Peer): void => {
  peer.editor.update.nodes.replaceChildren(
    [paragraph('bravo'), paragraph('charlie')],
    { at: [1] }
  );
};

describe('@platejs/yjs canonical replacement collaboration contract', () => {
  it('replaces local offline text without replacing the Yjs text node', () => {
    const peer = createPeer('b');
    const text = getYjsNodeAt(peer, [0, 0]);

    disconnectAndClearYjsTrace(peer);
    replaceAlphaWithFragment(peer);

    assert.deepEqual(getPeerTopLevelTexts(peer), ['alphaLin fragment']);
    assert.equal(getYjsNodeAt(peer, [0, 0]), text);
    assertCanonicalYjsTrace(peer);
  });

  it('preserves every Yjs text node for a same-width multi-leaf replacement', () => {
    const peer = createPeer('b', undefined, multiLeafValue());

    const firstText = getYjsNodeAt(peer, [0, 0]);
    const secondText = getYjsNodeAt(peer, [0, 1]);

    clearYjsTrace(peer);
    replaceMultiLeafTextWithFragment(peer);

    assert.deepEqual(getPeerTopLevelTexts(peer), ['alphaLin betaAda']);
    assert.equal(getYjsNodeAt(peer, [0, 0]), firstText);
    assert.equal(getYjsNodeAt(peer, [0, 1]), secondText);
    assertCanonicalYjsTrace(peer);
  });

  it('preserves moved-node identity for a compatible replacement', () => {
    const peer = createPeer('b', undefined, [
      quote([paragraph('left')]),
      quote([]),
      paragraph('moved'),
    ]);

    moveParagraphIntoEmptyQuote(peer);
    const movedParagraph = getVisibleYjsNodeAt(peer, [1, 0]);

    clearYjsTrace(peer);
    replaceMovedQuoteText(peer);

    assert.deepEqual(getPeerTopLevelTexts(peer), ['left', 'moved!']);
    assert.equal(getVisibleYjsNodeAt(peer, [1, 0]), movedParagraph);
    assertCanonicalYjsTrace(peer);
  });

  it('replaces moved children instead of appending beside them', () => {
    const peer = createPeer('b', undefined, [
      quote([paragraph('left')]),
      quote([]),
      paragraph('moved'),
    ]);

    moveParagraphIntoEmptyQuote(peer);

    clearYjsTrace(peer);
    replaceMovedQuoteChildren(peer);

    assert.deepEqual(readPeerPliteValue(peer), [
      quote([paragraph('left')]),
      quote([paragraph('bravo'), paragraph('charlie')]),
    ]);
    assertCanonicalYjsTrace(peer);
  });

  it('preserves concurrent remote text when an offline replacement reconnects', () => {
    const peers = createPeers(['a', 'b', 'c']);
    const [a, b] = peers;

    disconnectYjsPeer(b);
    replaceAlphaWithFragment(b);
    appendRemoteText(a);
    syncConnectedPeers(peers);

    assert.deepEqual(getPeerTopLevelTexts(a), ['alpha Ada']);
    assert.deepEqual(getPeerTopLevelTexts(b), ['alphaLin fragment']);

    connectYjsPeerAndSync(b, peers);

    assertPeerTexts(peers, ['alpha AdaLin fragment']);
  });

  it('recovers replacement convergence through real Yjs updates after reconnect', () => {
    const peers = createPeers(['a', 'b', 'c']);
    const [, b] = peers;

    disconnectYjsPeer(b);
    replaceAlphaWithFragment(b);
    connectYjsPeerAndSync(b, peers);

    assertPeerTexts(peers, ['alphaLin fragment']);
  });

  it('undoes and redoes only the local replacement after reconnect', () => {
    const peers = createPeers(['a', 'b', 'c']);
    const [a, b] = peers;

    disconnectYjsPeer(b);
    replaceAlphaWithFragment(b);
    appendRemoteText(a);
    syncConnectedPeers(peers);

    connectYjsPeerAndSync(b, peers);
    assertPeerTexts(peers, ['alpha AdaLin fragment']);

    undoHistoryPeerAndSync(b, peers);
    assertPeerTexts(peers, ['alpha Ada']);

    redoHistoryPeerAndSync(b, peers);
    assertPeerTexts(peers, ['alpha AdaLin fragment']);
  });

  it('ignores a no-op replacement so redo history stays usable', () => {
    const peer = createPeer('b');

    insertLocalBang(peer);
    assert.deepEqual(getPeerTopLevelTexts(peer), ['alpha!']);

    undoHistoryPeer(peer);
    assert.deepEqual(getPeerTopLevelTexts(peer), ['alpha']);

    clearYjsTrace(peer);
    replayNoopRootReplaceFragment(peer);

    assert.deepEqual(getPeerTopLevelTexts(peer), ['alpha']);
    assert.deepEqual(getYjsTrace(peer), []);

    redoHistoryPeer(peer);
    assert.deepEqual(getPeerTopLevelTexts(peer), ['alpha!']);
  });

  it('lowers a broad replacement through canonical ranges', () => {
    const peer = createPeer('b');

    clearYjsTrace(peer);
    replaceRootWithFallback(peer);

    assert.deepEqual(getPeerTopLevelTexts(peer), ['bravo', 'charlie']);
    assertCanonicalYjsTrace(peer);
  });
});

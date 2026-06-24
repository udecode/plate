import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Descendant, Operation } from '@platejs/plite';
import {
  assertPeerTexts,
  clearYjsTrace,
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
  readPeerPliteValue,
  redoYjsPeer,
  redoYjsPeerAndSync,
  syncConnectedPeers,
  undoYjsPeer,
  undoYjsPeerAndSync,
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
  createYjsPeer({
    children,
    clientId,
    numericClientId: clientIds[clientId],
    seedUpdate,
  });

const createPeers = (ids: readonly ClientId[]): Peer[] =>
  createSeededYjsPeers({
    children: initialValue(),
    clientIds: ids,
    numericClientIds,
  });

const replaceAlphaWithFragment = (peer: Peer): void => {
  const operation: Operation = {
    children: [{ text: 'alpha' }],
    newChildren: [{ text: 'alphaLin fragment' }],
    newSelection: null,
    path: [0],
    selection: null,
    type: 'replace_fragment',
  };

  peer.editor.update((tx) => {
    tx.operations.replay([operation]);
  });
};

const replaceMultiLeafTextWithFragment = (peer: Peer): void => {
  const operation: Operation = {
    children: [{ text: 'alpha' }, { bold: true, text: ' beta' }],
    newChildren: [{ text: 'alphaLin' }, { bold: true, text: ' betaAda' }],
    newSelection: null,
    path: [0],
    selection: null,
    type: 'replace_fragment',
  };

  peer.editor.update((tx) => {
    tx.operations.replay([operation]);
  });
};

const replaceRootWithFallback = (peer: Peer): void => {
  const operation: Operation = {
    children: initialValue(),
    newChildren: [paragraph('bravo'), paragraph('charlie')],
    newSelection: null,
    path: [],
    selection: null,
    type: 'replace_fragment',
  };

  peer.editor.update((tx) => {
    tx.operations.replay([operation]);
  });
};

const appendRemoteText = (peer: Peer): void => {
  peer.editor.update((tx) => {
    tx.text.insert(' Ada', { at: { path: [0, 0], offset: 'alpha'.length } });
  });
};

const insertLocalBang = (peer: Peer): void => {
  peer.editor.update((tx) => {
    tx.text.insert('!', { at: { path: [0, 0], offset: 'alpha'.length } });
  });
};

const replayNoopRootReplaceFragment = (peer: Peer): void => {
  const operation: Operation = {
    children: initialValue(),
    newChildren: initialValue(),
    newSelection: {
      anchor: { path: [0, 0], offset: 'alpha'.length },
      focus: { path: [0, 0], offset: 'alpha'.length },
    },
    path: [],
    selection: null,
    type: 'replace_fragment',
  };

  peer.editor.update((tx) => {
    tx.operations.replay([operation]);
  });
};

const moveParagraphIntoEmptyQuote = (peer: Peer): void => {
  peer.editor.update((tx) => {
    tx.operations.replay([
      {
        newPath: [1, 0],
        path: [2],
        type: 'move_node',
      },
    ]);
  });
};

const replaceMovedQuoteText = (peer: Peer): void => {
  const operation: Operation = {
    children: [paragraph('moved')],
    newChildren: [paragraph('moved!')],
    newSelection: null,
    path: [1],
    selection: null,
    type: 'replace_fragment',
  };

  peer.editor.update((tx) => {
    tx.operations.replay([operation]);
  });
};

const replaceMovedQuoteChildren = (peer: Peer): void => {
  const operation: Operation = {
    children: [paragraph('moved')],
    newChildren: [paragraph('bravo'), paragraph('charlie')],
    newSelection: null,
    path: [1],
    selection: null,
    type: 'replace_fragment',
  };

  peer.editor.update((tx) => {
    tx.operations.replay([operation]);
  });
};

describe('@platejs/yjs replace_fragment collaboration contract', () => {
  it('applies local offline single-text replace_fragment without replacing the Yjs text node', () => {
    const peer = createPeer('b');
    const text = getYjsNodeAt(peer, [0, 0]);

    disconnectAndClearYjsTrace(peer);
    replaceAlphaWithFragment(peer);

    assert.deepEqual(getPeerTopLevelTexts(peer), ['alphaLin fragment']);
    assert.equal(getYjsNodeAt(peer, [0, 0]), text);
    assert.deepEqual(getYjsTrace(peer), [
      { mode: 'operation', operationType: 'replace_fragment' },
    ]);
  });

  it('preserves every Yjs text node for same-width multi-leaf replace_fragment', () => {
    const peer = createPeer('b', undefined, multiLeafValue());

    const firstText = getYjsNodeAt(peer, [0, 0]);
    const secondText = getYjsNodeAt(peer, [0, 1]);

    clearYjsTrace(peer);
    replaceMultiLeafTextWithFragment(peer);

    assert.deepEqual(getPeerTopLevelTexts(peer), ['alphaLin betaAda']);
    assert.equal(getYjsNodeAt(peer, [0, 0]), firstText);
    assert.equal(getYjsNodeAt(peer, [0, 1]), secondText);
    assert.deepEqual(getYjsTrace(peer), [
      { mode: 'operation', operationType: 'replace_fragment' },
    ]);
  });

  it('preserves virtual moved-node identity for compatible replace_fragment', () => {
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
    assert.deepEqual(getYjsTrace(peer), [
      { mode: 'operation', operationType: 'replace_fragment' },
    ]);
  });

  it('replaces virtual moved children instead of appending beside them', () => {
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
    assert.deepEqual(getYjsTrace(peer), [
      {
        fallback: 'replace-fragment-scoped-replace-identity-risk',
        mode: 'traceable-fallback',
        operationType: 'replace_fragment',
      },
    ]);
  });

  it('preserves concurrent remote text when an offline replace_fragment reconnects', () => {
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

  it('recovers replace_fragment convergence through real Yjs updates after reconnect', () => {
    const peers = createPeers(['a', 'b', 'c']);
    const [, b] = peers;

    disconnectYjsPeer(b);
    replaceAlphaWithFragment(b);
    connectYjsPeerAndSync(b, peers);

    assertPeerTexts(peers, ['alphaLin fragment']);
  });

  it('undoes and redoes only the local replace_fragment intent after reconnect', () => {
    const peers = createPeers(['a', 'b', 'c']);
    const [a, b] = peers;

    disconnectYjsPeer(b);
    replaceAlphaWithFragment(b);
    appendRemoteText(a);
    syncConnectedPeers(peers);

    connectYjsPeerAndSync(b, peers);
    assertPeerTexts(peers, ['alpha AdaLin fragment']);

    undoYjsPeerAndSync(b, peers);
    assertPeerTexts(peers, ['alpha Ada']);

    redoYjsPeerAndSync(b, peers);
    assertPeerTexts(peers, ['alpha AdaLin fragment']);
  });

  it('ignores no-op replace_fragment so redo history stays usable', () => {
    const peer = createPeer('b');

    insertLocalBang(peer);
    assert.deepEqual(getPeerTopLevelTexts(peer), ['alpha!']);

    undoYjsPeer(peer);
    assert.deepEqual(getPeerTopLevelTexts(peer), ['alpha']);

    clearYjsTrace(peer);
    replayNoopRootReplaceFragment(peer);

    assert.deepEqual(getPeerTopLevelTexts(peer), ['alpha']);
    assert.deepEqual(getYjsTrace(peer), []);

    redoYjsPeer(peer);
    assert.deepEqual(getPeerTopLevelTexts(peer), ['alpha!']);
  });

  it('uses a traceable fallback for broad replace_fragment replacement', () => {
    const peer = createPeer('b');

    clearYjsTrace(peer);
    replaceRootWithFallback(peer);

    assert.deepEqual(getPeerTopLevelTexts(peer), ['bravo', 'charlie']);
    assert.deepEqual(getYjsTrace(peer), [
      {
        fallback: 'replace-fragment-scoped-replace-identity-risk',
        mode: 'traceable-fallback',
        operationType: 'replace_fragment',
      },
    ]);
  });
});

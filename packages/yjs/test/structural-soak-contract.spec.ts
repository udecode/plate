import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Descendant, Operation, Path } from '@platejs/slate';
import * as Y from 'yjs';

import { applySlateOperationToYjs } from '../src/core/operations';
import type { Peer } from './support/collaboration';
import {
  createSeededYjsPeers,
  createYjsPeer,
  FakeAwareness,
  getPeerTopLevelTexts,
  getYjsRoot,
  isYjsPeerConnected,
  paragraph,
  readPeerChildren,
  readPeerSlateValue,
  reconcileYjsPeer,
  redoYjsPeer,
  runYjsUpdate,
  syncConnectedPeers,
  undoYjsPeer,
} from './support/collaboration';

const peerIds = ['a', 'b', 'c', 'd'] as const;

type PeerId = (typeof peerIds)[number];
type SoakPeers = Record<PeerId, Peer>;

const clientIds: Readonly<Record<PeerId, number>> = {
  a: 101,
  b: 202,
  c: 303,
  d: 404,
};

const appendTexts: Readonly<Record<PeerId, string>> = {
  a: ' Ada',
  b: ' Lin',
  c: ' Ken',
  d: ' Eve',
};

const fragmentTexts: Readonly<Record<PeerId, string>> = {
  a: 'Ada fragment',
  b: 'Lin fragment',
  c: 'Ken fragment',
  d: 'Eve fragment',
};

const replacementTexts: Readonly<Record<PeerId, string>> = {
  a: 'Ada canonical snapshot.',
  b: 'Lin canonical snapshot.',
  c: 'Ken canonical snapshot.',
  d: 'Eve canonical snapshot.',
};

const initialValue = (): Descendant[] => [paragraph('Hello world!')];

const createPeers = (): SoakPeers => {
  const peers = createSeededYjsPeers({
    children: initialValue(),
    clientIds: [...peerIds],
    numericClientIds: clientIds,
  });

  const [a, b, c, d] = peers;

  if (!a || !b || !c || !d) {
    throw new Error('Expected four structural soak peers.');
  }

  return { a, b, c, d };
};

const createAwarePeers = (): SoakPeers => {
  const first = createYjsPeer({
    awareness: new FakeAwareness(clientIds.a),
    children: initialValue(),
    clientId: 'a',
    numericClientId: clientIds.a,
  });
  const seedUpdate = Y.encodeStateAsUpdate(first.doc);
  const peers = {
    a: first,
    b: createYjsPeer({
      awareness: new FakeAwareness(clientIds.b),
      children: initialValue(),
      clientId: 'b',
      numericClientId: clientIds.b,
      seedUpdate,
    }),
    c: createYjsPeer({
      awareness: new FakeAwareness(clientIds.c),
      children: initialValue(),
      clientId: 'c',
      numericClientId: clientIds.c,
      seedUpdate,
    }),
    d: createYjsPeer({
      awareness: new FakeAwareness(clientIds.d),
      children: initialValue(),
      clientId: 'd',
      numericClientId: clientIds.d,
      seedUpdate,
    }),
  };

  return peers;
};

const allPeers = (peers: Readonly<Record<PeerId, Peer>>): Peer[] =>
  peerIds.map((id) => peers[id]);

const editorValueOf = (peer: Peer): readonly Descendant[] =>
  readPeerChildren(peer);

type TextEntry = {
  readonly path: Path;
  readonly text: string;
};

const isText = (node: Descendant): node is Descendant & { text: string } =>
  'text' in node;

const hasChildren = (
  node: Descendant
): node is Descendant & { children: readonly Descendant[] } =>
  'children' in node && Array.isArray(node.children);

const findTextEntryInNode = (
  node: Descendant,
  path: Path,
  direction: 'first' | 'last'
): TextEntry | null => {
  if (isText(node)) {
    return { path, text: node.text };
  }

  if (!hasChildren(node)) {
    return null;
  }

  const start = direction === 'first' ? 0 : node.children.length - 1;
  const end = direction === 'first' ? node.children.length : -1;
  const step = direction === 'first' ? 1 : -1;

  for (let index = start; index !== end; index += step) {
    const child = node.children[index];

    if (child === undefined) {
      continue;
    }

    const entry = findTextEntryInNode(child, [...path, index], direction);

    if (entry !== null) {
      return entry;
    }
  }

  return null;
};

const firstBlockTextEntry = (
  peer: Peer,
  direction: 'first' | 'last'
): TextEntry | null => {
  const [block] = editorValueOf(peer);

  return block === undefined
    ? null
    : findTextEntryInNode(block, [0], direction);
};

const topLevelCount = (peer: Peer): number => editorValueOf(peer).length;

const assertPeerTopLevelTexts = (
  peers: readonly Peer[],
  expected: readonly string[]
): void => {
  for (const peer of peers) {
    assert.deepEqual(getPeerTopLevelTexts(peer), expected);
  }
};

const assertFirstParagraphTextChildren = (
  peers: readonly Peer[],
  expected: readonly string[]
): void => {
  for (const peer of peers) {
    const [firstBlock] = editorValueOf(peer);

    assert.deepEqual(
      hasChildren(firstBlock)
        ? firstBlock.children.map((child) => child.text)
        : [],
      expected,
      JSON.stringify(editorValueOf(peer))
    );
    assert.deepEqual(
      readPeerSlateValue(peer)[0]?.children.map((child) => child.text),
      expected
    );
  }
};

const firstBlockIsQuote = (peer: Peer): boolean => {
  const [firstBlock] = editorValueOf(peer);

  return (
    firstBlock !== undefined &&
    'type' in firstBlock &&
    firstBlock.type === 'block-quote'
  );
};

const hasNestedParagraph = (
  node: Descendant,
  insideParagraph = false
): boolean => {
  if (!hasChildren(node)) {
    return false;
  }

  const isParagraph = 'type' in node && node.type === 'paragraph';

  if (insideParagraph && isParagraph) {
    return true;
  }

  return node.children.some((child) =>
    hasNestedParagraph(child, insideParagraph || isParagraph)
  );
};

const assertNoNestedParagraphs = (peers: readonly Peer[]): void => {
  for (const peer of peers) {
    const value = editorValueOf(peer);

    assert.equal(
      value.some((node) => hasNestedParagraph(node)),
      false,
      JSON.stringify(value)
    );
    assert.equal(
      readPeerSlateValue(peer).some((node) => hasNestedParagraph(node)),
      false
    );
  }
};

const hasElementDescendantInsideParagraph = (
  node: Descendant,
  insideParagraph = false
): boolean => {
  if (!hasChildren(node)) {
    return false;
  }

  if (insideParagraph) {
    return true;
  }

  const isParagraph = 'type' in node && node.type === 'paragraph';

  return node.children.some((child) =>
    hasElementDescendantInsideParagraph(child, isParagraph)
  );
};

const assertNoElementDescendantsInsideParagraphs = (
  peers: readonly Peer[]
): void => {
  for (const peer of peers) {
    const value = editorValueOf(peer);
    const yjsValue = readPeerSlateValue(peer);

    assert.equal(
      value.some((node) => hasElementDescendantInsideParagraph(node)),
      false,
      JSON.stringify(value)
    );
    assert.equal(
      yjsValue.some((node) => hasElementDescendantInsideParagraph(node)),
      false,
      JSON.stringify(yjsValue)
    );
  }
};

const getNodeAtPath = (
  children: readonly Descendant[],
  path: readonly number[]
): Descendant | null => {
  const root = { children };
  let current: typeof root | Descendant = root;

  for (const index of path) {
    if (!hasChildren(current)) {
      return null;
    }

    const child = current.children[index];

    if (child === undefined) {
      return null;
    }

    current = child;
  }

  return current === root ? null : current;
};

const assertSelectionsTargetText = (peers: readonly Peer[]): void => {
  for (const peer of peers) {
    const selection = peer.editor.read((state) => state.selection.get());

    if (selection === null) {
      continue;
    }

    const value = editorValueOf(peer);

    for (const point of [selection.anchor, selection.focus]) {
      const node = getNodeAtPath(value, point.path);

      assert.equal(
        node !== null && isText(node),
        true,
        JSON.stringify({ selection, value })
      );
    }
  }
};

const sync = (peers: Readonly<Record<PeerId, Peer>>): void => {
  const peerList = allPeers(peers);

  syncConnectedPeers(peerList);

  for (const peer of peerList) {
    if (!isYjsPeerConnected(peer)) {
      continue;
    }

    reconcileYjsPeer(peer);
  }
};

const runCommand = (
  peers: Readonly<Record<PeerId, Peer>>,
  peerId: PeerId,
  command: (peer: Peer, peerId: PeerId) => void
): void => {
  command(peers[peerId], peerId);
  sync(peers);
};

const runIncrementalCommand = (
  peers: Readonly<Record<PeerId, Peer>>,
  peerId: PeerId,
  command: (peer: Peer, peerId: PeerId) => void
): void => {
  const source = peers[peerId];
  const stateVector = Y.encodeStateVector(source.doc);

  command(source, peerId);

  if (isYjsPeerConnected(source)) {
    const update = Y.encodeStateAsUpdate(source.doc, stateVector);

    for (const target of allPeers(peers)) {
      if (source === target || !isYjsPeerConnected(target)) {
        continue;
      }

      Y.applyUpdate(target.doc, update, source);
    }
  }

  for (const peer of allPeers(peers)) {
    if (!isYjsPeerConnected(peer)) {
      continue;
    }

    reconcileYjsPeer(peer);
  }
};

const setConnected = (
  peers: Readonly<Record<PeerId, Peer>>,
  peerId: PeerId,
  connected: boolean
): void => {
  runYjsUpdate(peers[peerId], (yjs) =>
    connected ? yjs.connect() : yjs.disconnect()
  );
  sync(peers);
};

const connectAll = (peers: Readonly<Record<PeerId, Peer>>): void => {
  for (const peerId of peerIds) {
    setConnected(peers, peerId, true);
  }
};

const appendText = (peer: Peer, peerId: PeerId): void => {
  const entry = firstBlockTextEntry(peer, 'last');

  if (entry === null) {
    return;
  }

  peer.editor.update((tx) => {
    tx.text.insert(appendTexts[peerId], {
      at: { path: entry.path, offset: entry.text.length },
    });
  });
};

const splitFirstText = (peer: Peer): void => {
  const entry = firstBlockTextEntry(peer, 'first');

  if (!entry || entry.text.length < 2) {
    return;
  }

  const offset = Math.max(1, Math.floor(entry.text.length / 2));

  peer.editor.update((tx) => {
    tx.selection.set({
      anchor: { path: entry.path, offset },
      focus: { path: entry.path, offset },
    });
    tx.break.insert();
  });
};

const ensureTopLevelCount = (peer: Peer, count: number): void => {
  const current = topLevelCount(peer);

  if (current >= count) {
    return;
  }

  peer.editor.update((tx) => {
    for (let index = current; index < count; index++) {
      tx.nodes.insert(paragraph(`block ${index + 1}`), { at: [index] });
    }
  });
};

const moveFirstBlockDown = (peer: Peer): void => {
  ensureTopLevelCount(peer, 2);

  peer.editor.update((tx) => {
    tx.nodes.move({ at: [0], to: [1] });
  });
};

const moveFirstBlockAfterSecond = (peer: Peer): void => {
  if (topLevelCount(peer) < 2) {
    return;
  }

  peer.editor.update((tx) => {
    tx.nodes.move({ at: [0], to: [1] });
  });
};

const mergeSecondBlock = (peer: Peer): void => {
  if (topLevelCount(peer) < 2) {
    return;
  }

  peer.editor.update((tx) => {
    tx.nodes.merge({ at: [1] });
  });
};

const removeSecondBlock = (peer: Peer): void => {
  if (topLevelCount(peer) < 2) {
    return;
  }

  peer.editor.update((tx) => {
    tx.nodes.remove({ at: [1] });
  });
};

const replaceDocument = (peer: Peer, peerId: PeerId): void => {
  const children = editorValueOf(peer);
  const text = replacementTexts[peerId];

  peer.editor.update((tx) => {
    tx.operations.replay([
      {
        children,
        index: 0,
        newChildren: [paragraph(text)],
        newSelection: {
          anchor: { path: [0, 0], offset: text.length },
          focus: { path: [0, 0], offset: text.length },
        },
        path: [],
        selection: null,
        type: 'replace_children',
      },
    ]);
  });
};

const wrapFirstBlock = (peer: Peer): void => {
  peer.editor.update((tx) => {
    tx.selection.clear();
    tx.nodes.wrap({ children: [], type: 'block-quote' }, { at: [0] });
    tx.selection.clear();
  });
};

const unwrapFirstBlock = (peer: Peer): void => {
  if (!firstBlockIsQuote(peer)) {
    return;
  }

  peer.editor.update((tx) => {
    tx.nodes.unwrap({ at: [0] });
  });
};

const liftFirstWrappedBlock = (peer: Peer): void => {
  if (!firstBlockIsQuote(peer)) {
    return;
  }

  peer.editor.update((tx) => {
    tx.nodes.lift({ at: [0, 0] });
  });
};

const unsetFirstBlockRole = (peer: Peer): void => {
  const [firstBlock] = editorValueOf(peer);

  if (!firstBlock || !('role' in firstBlock)) {
    return;
  }

  peer.editor.update((tx) => {
    tx.nodes.unset('role', { at: [0] });
  });
};

const setFirstBlockRole = (peer: Peer): void => {
  peer.editor.update((tx) => {
    tx.nodes.set({ role: 'title' }, { at: [0] });
  });
};

const insertExclamation = (peer: Peer): void => {
  const entry = firstBlockTextEntry(peer, 'last');

  if (entry === null) {
    return;
  }

  peer.editor.update((tx) => {
    tx.text.insert('!', {
      at: { path: entry.path, offset: entry.text.length },
    });
  });
};

const insertPeerFragment = (peer: Peer, peerId: PeerId): void => {
  const entry = firstBlockTextEntry(peer, 'last');

  if (entry === null) {
    return;
  }

  peer.editor.update((tx) => {
    tx.selection.set({
      anchor: { path: entry.path, offset: entry.text.length },
      focus: { path: entry.path, offset: entry.text.length },
    });
    tx.fragment.insert([{ text: fragmentTexts[peerId] }]);
  });
};

const deleteFirstFragment = (peer: Peer): void => {
  const entry = firstBlockTextEntry(peer, 'first');

  if (entry === null) {
    return;
  }

  const length = Math.min(5, entry.text.length);

  if (length === 0) {
    return;
  }

  peer.editor.update((tx) => {
    tx.selection.set({
      anchor: { path: entry.path, offset: 0 },
      focus: { path: entry.path, offset: length },
    });
    tx.fragment.delete();
  });
};

const deleteBackwardFromFirstBlockEnd = (peer: Peer): void => {
  const entry = firstBlockTextEntry(peer, 'last');

  if (!entry || entry.text.length === 0) {
    return;
  }

  peer.editor.update((tx) => {
    tx.selection.set({
      anchor: { path: entry.path, offset: entry.text.length },
      focus: { path: entry.path, offset: entry.text.length },
    });
    tx.text.deleteBackward({ unit: 'character' });
  });
};

const reconcilePeer = (peer: Peer): void => {
  reconcileYjsPeer(peer);
};

const undoPeer = (peer: Peer): void => {
  undoYjsPeer(peer);
};

const redoPeer = (peer: Peer): void => {
  redoYjsPeer(peer);
};

const toggleFirstBlockBold = (peer: Peer): void => {
  const entry = firstBlockTextEntry(peer, 'first');

  if (entry === null) {
    return;
  }

  const length = Math.min(5, entry.text.length);

  peer.editor.update((tx) => {
    tx.selection.set({
      anchor: { path: entry.path, offset: 0 },
      focus: { path: entry.path, offset: length },
    });
    tx.marks.toggle('bold');
  });
};

const assertDocumentHasTextBoundary = (peers: readonly Peer[]): void => {
  for (const peer of peers) {
    const value = editorValueOf(peer);

    assert.notEqual(
      firstBlockTextEntry(peer, 'first'),
      null,
      JSON.stringify(value)
    );
    assert.notEqual(
      firstBlockTextEntry(peer, 'last'),
      null,
      JSON.stringify(value)
    );
  }
};

describe('@platejs/yjs structural soak contract', () => {
  it('keeps random-control seed 10 prefix from nesting paragraphs', () => {
    const peers = createPeers();

    runCommand(peers, 'a', wrapFirstBlock);
    runCommand(peers, 'c', appendText);
    runCommand(peers, 'a', splitFirstText);
    runCommand(peers, 'c', moveFirstBlockDown);
    runCommand(peers, 'c', mergeSecondBlock);

    assertNoNestedParagraphs(allPeers(peers));
  });

  it('keeps offline structural mix seed 3 from producing stale leaf paths', () => {
    const peers = createPeers();

    setConnected(peers, 'a', false);
    runCommand(peers, 'a', unsetFirstBlockRole);
    runCommand(peers, 'd', liftFirstWrappedBlock);
    runCommand(peers, 'a', moveFirstBlockDown);
    runCommand(peers, 'd', wrapFirstBlock);
    runCommand(peers, 'a', moveFirstBlockDown);
    runCommand(peers, 'b', unwrapFirstBlock);

    assertNoNestedParagraphs(allPeers(peers));
    assertPeerTopLevelTexts([peers.a], ['Hello world!', 'block 2']);
    assertPeerTopLevelTexts([peers.b, peers.c, peers.d], ['Hello world!']);

    setConnected(peers, 'a', true);

    assertPeerTopLevelTexts(allPeers(peers), ['Hello world!', 'block 2']);
  });

  it('exports selection after structural unwrap only when the Yjs target is text', () => {
    const peers = createAwarePeers();

    runCommand(peers, 'd', wrapFirstBlock);
    peers.b.editor.update((tx) => {
      tx.selection.set({
        anchor: { path: [0], offset: 0 },
        focus: { path: [0], offset: 0 },
      });
    });

    assert.doesNotThrow(() => {
      runCommand(peers, 'b', unwrapFirstBlock);
    });
  });

  it('keeps random-control seed 42 from missing Yjs path 1.0', () => {
    const peers = createAwarePeers();

    runCommand(peers, 'b', insertExclamation);
    runCommand(peers, 'c', wrapFirstBlock);
    runCommand(peers, 'b', appendText);
    runCommand(peers, 'b', splitFirstText);
    reconcilePeer(peers.d);
    runCommand(peers, 'd', moveFirstBlockAfterSecond);
    runCommand(peers, 'c', removeSecondBlock);
    runCommand(peers, 'c', insertExclamation);
    setConnected(peers, 'a', true);
    setConnected(peers, 'd', false);
    runCommand(peers, 'c', mergeSecondBlock);

    assert.doesNotThrow(() => {
      runCommand(peers, 'c', unwrapFirstBlock);
    });
    assertNoNestedParagraphs(allPeers(peers));
    assertPeerTopLevelTexts(
      [peers.a, peers.b, peers.c],
      ['Hello wo', 'rld!! Lin!']
    );
    assertPeerTopLevelTexts([peers.d], ['Hello world!! Lin!']);

    setConnected(peers, 'd', true);

    assertPeerTopLevelTexts(allPeers(peers), ['Hello wo', 'rld!! Lin!']);
  });

  it('keeps remote wrap after lift from duplicating the wrapped block', () => {
    const peers = createAwarePeers();

    runCommand(peers, 'd', wrapFirstBlock);
    runCommand(peers, 'c', liftFirstWrappedBlock);
    runCommand(peers, 'a', wrapFirstBlock);

    assertPeerTopLevelTexts(allPeers(peers), ['Hello world!']);
    assertNoElementDescendantsInsideParagraphs(allPeers(peers));
  });

  it('keeps repeated root moves from duplicating a virtual placeholder block', () => {
    const peers = createAwarePeers();

    runCommand(peers, 'b', wrapFirstBlock);
    runCommand(peers, 'c', moveFirstBlockDown);
    runCommand(peers, 'd', setFirstBlockRole);
    runCommand(peers, 'a', moveFirstBlockDown);

    assertPeerTopLevelTexts(allPeers(peers), ['Hello world!', 'block 2']);
    assertNoElementDescendantsInsideParagraphs(allPeers(peers));
  });

  it('keeps random-control seed 75 empty trailing block converged', () => {
    const peers = createAwarePeers();

    runCommand(peers, 'b', insertExclamation);
    runCommand(peers, 'a', deleteBackwardFromFirstBlockEnd);
    runCommand(peers, 'b', undoPeer);
    runCommand(peers, 'c', insertPeerFragment);
    setConnected(peers, 'c', false);
    runCommand(peers, 'd', splitFirstText);
    runCommand(peers, 'd', unwrapFirstBlock);
    runCommand(peers, 'a', moveFirstBlockAfterSecond);
    runCommand(peers, 'a', deleteBackwardFromFirstBlockEnd);
    runCommand(peers, 'd', mergeSecondBlock);
    runCommand(peers, 'b', redoPeer);
    runCommand(peers, 'c', unsetFirstBlockRole);
    runCommand(peers, 'd', deleteFirstFragment);
    runCommand(peers, 'd', mergeSecondBlock);
    connectAll(peers);
    runCommand(peers, 'a', reconcilePeer);

    assertPeerTopLevelTexts(allPeers(peers), ['!Ken fragmenHello ']);
  });

  it('keeps offline structural mix seed 99 from retaining a zero-width prefix', () => {
    const peers = createAwarePeers();

    setConnected(peers, 'b', false);
    runCommand(peers, 'b', deleteFirstFragment);
    runCommand(peers, 'c', splitFirstText);
    runCommand(peers, 'b', moveFirstBlockDown);
    runCommand(peers, 'c', appendText);
    runCommand(peers, 'b', moveFirstBlockDown);
    runCommand(peers, 'd', splitFirstText);
    runCommand(peers, 'b', mergeSecondBlock);
    runCommand(peers, 'c', splitFirstText);
    connectAll(peers);
    runCommand(peers, 'a', reconcilePeer);

    assertPeerTopLevelTexts(allPeers(peers), [
      'block 2',
      'llo',
      '  Ken',
      'world!',
    ]);
    assertFirstParagraphTextChildren(allPeers(peers), ['block 2']);
  });

  it('keeps random-control seed 116 empty trailing block converged', () => {
    const peers = createAwarePeers();

    runCommand(peers, 'b', moveFirstBlockDown);
    runCommand(peers, 'a', reconcilePeer);
    runCommand(peers, 'c', insertPeerFragment);
    setConnected(peers, 'b', true);
    runCommand(peers, 'c', unwrapFirstBlock);
    runCommand(peers, 'b', mergeSecondBlock);
    runCommand(peers, 'd', liftFirstWrappedBlock);
    runCommand(peers, 'b', setFirstBlockRole);
    runCommand(peers, 'b', insertExclamation);
    runCommand(peers, 'a', replaceDocument);
    runCommand(peers, 'c', removeSecondBlock);
    runCommand(peers, 'a', setFirstBlockRole);
    runCommand(peers, 'c', replaceDocument);
    runCommand(peers, 'c', unsetFirstBlockRole);
    connectAll(peers);
    runCommand(peers, 'a', reconcilePeer);

    assertPeerTopLevelTexts(allPeers(peers), ['Ken canonical snapshot.']);
  });

  it('keeps random-control seed 131 empty trailing block converged', () => {
    const peers = createAwarePeers();

    runCommand(peers, 'b', mergeSecondBlock);
    runCommand(peers, 'c', replaceDocument);
    runCommand(peers, 'c', setFirstBlockRole);
    runCommand(peers, 'd', toggleFirstBlockBold);
    runCommand(peers, 'a', splitFirstText);
    runCommand(peers, 'a', deleteBackwardFromFirstBlockEnd);
    runCommand(peers, 'c', setFirstBlockRole);
    runCommand(peers, 'd', setFirstBlockRole);
    runCommand(peers, 'd', liftFirstWrappedBlock);
    runCommand(peers, 'b', moveFirstBlockDown);
    runCommand(peers, 'a', unwrapFirstBlock);
    runCommand(peers, 'a', toggleFirstBlockBold);
    runCommand(peers, 'b', mergeSecondBlock);
    runCommand(peers, 'b', splitFirstText);
    connectAll(peers);
    runCommand(peers, 'a', reconcilePeer);

    assertPeerTopLevelTexts(allPeers(peers), ['n', ' canonical snapshot.K']);
  });

  it('keeps structural edits from projecting block placeholders inside paragraphs', () => {
    const peers = createAwarePeers();

    runCommand(peers, 'a', splitFirstText);
    runCommand(peers, 'c', deleteFirstFragment);
    runCommand(peers, 'c', setFirstBlockRole);
    reconcilePeer(peers.d);
    runCommand(peers, 'd', deleteBackwardFromFirstBlockEnd);
    setConnected(peers, 'a', true);
    runCommand(peers, 'c', removeSecondBlock);

    assertNoElementDescendantsInsideParagraphs(allPeers(peers));
    assertSelectionsTargetText(allPeers(peers));
  });

  it('keeps random-control seed 85 from missing Yjs nodes', () => {
    const peers = createAwarePeers();

    runCommand(peers, 'b', reconcilePeer);
    runCommand(peers, 'a', moveFirstBlockDown);
    runCommand(peers, 'a', mergeSecondBlock);
    runCommand(peers, 'd', replaceDocument);
    runCommand(peers, 'c', moveFirstBlockAfterSecond);
    setConnected(peers, 'b', true);
    runCommand(peers, 'c', moveFirstBlockDown);
    runCommand(peers, 'b', splitFirstText);
    runCommand(peers, 'c', unsetFirstBlockRole);

    assert.doesNotThrow(() => {
      runCommand(peers, 'd', appendText);
    });
    assertNoElementDescendantsInsideParagraphs(allPeers(peers));
    assertSelectionsTargetText(allPeers(peers));
  });

  it('keeps offline structural mix seed 108 from nesting paragraphs', () => {
    const peers = createAwarePeers();

    setConnected(peers, 'b', false);
    runCommand(peers, 'b', wrapFirstBlock);
    runCommand(peers, 'd', wrapFirstBlock);
    runCommand(peers, 'b', moveFirstBlockDown);
    runCommand(peers, 'c', deleteBackwardFromFirstBlockEnd);
    runCommand(peers, 'b', unsetFirstBlockRole);
    runCommand(peers, 'c', liftFirstWrappedBlock);
    runCommand(peers, 'b', mergeSecondBlock);
    runCommand(peers, 'd', insertExclamation);

    assertNoElementDescendantsInsideParagraphs(allPeers(peers));
    assertSelectionsTargetText(allPeers(peers));
  });

  it('keeps structural mix seed 42 selections on text leaves', () => {
    const peers = createAwarePeers();

    setConnected(peers, 'b', false);
    runCommand(peers, 'b', wrapFirstBlock);
    runCommand(peers, 'c', splitFirstText);
    runCommand(peers, 'b', moveFirstBlockDown);

    assertNoElementDescendantsInsideParagraphs(allPeers(peers));
    assertSelectionsTargetText(allPeers(peers));
  });

  it('keeps random-control seed 42 disconnected remove selections on text leaves', () => {
    const peers = createAwarePeers();

    runCommand(peers, 'b', insertExclamation);
    runCommand(peers, 'c', wrapFirstBlock);
    runCommand(peers, 'b', appendText);
    runCommand(peers, 'b', splitFirstText);
    reconcilePeer(peers.d);
    runCommand(peers, 'd', moveFirstBlockAfterSecond);
    runCommand(peers, 'c', removeSecondBlock);
    runCommand(peers, 'c', insertExclamation);
    setConnected(peers, 'a', true);
    setConnected(peers, 'd', false);
    runCommand(peers, 'c', mergeSecondBlock);
    runCommand(peers, 'c', unwrapFirstBlock);
    runCommand(peers, 'd', removeSecondBlock);

    assertNoElementDescendantsInsideParagraphs(allPeers(peers));
    assertSelectionsTargetText(allPeers(peers));
  });

  it('keeps structural mix seed 43 selections on text leaves', () => {
    const peers = createAwarePeers();

    setConnected(peers, 'b', false);
    runCommand(peers, 'b', (peer, peerId) => {
      const entry = firstBlockTextEntry(peer, 'last');

      if (entry === null) {
        return;
      }

      peer.editor.update((tx) => {
        tx.selection.set({
          anchor: { path: entry.path, offset: entry.text.length },
          focus: { path: entry.path, offset: entry.text.length },
        });
        tx.fragment.insert([{ text: `${peerId} fragment` }]);
      });
    });
    runCommand(peers, 'a', splitFirstText);
    runCommand(peers, 'b', wrapFirstBlock);
    runCommand(peers, 'd', liftFirstWrappedBlock);
    runCommand(peers, 'b', wrapFirstBlock);
    runCommand(peers, 'c', appendText);
    runCommand(peers, 'b', moveFirstBlockDown);

    assertNoElementDescendantsInsideParagraphs(allPeers(peers));
    assertSelectionsTargetText(allPeers(peers));
  });

  it('keeps structural mix seed 46 selections on text leaves', () => {
    const peers = createAwarePeers();

    setConnected(peers, 'b', false);
    runCommand(peers, 'b', setFirstBlockRole);
    runCommand(peers, 'a', mergeSecondBlock);
    runCommand(peers, 'b', wrapFirstBlock);
    runCommand(peers, 'a', insertExclamation);
    runCommand(peers, 'b', mergeSecondBlock);

    assertNoElementDescendantsInsideParagraphs(allPeers(peers));
    assertSelectionsTargetText(allPeers(peers));
  });

  it('keeps structural mix seed 49 selections on text leaves', () => {
    const peers = createAwarePeers();

    setConnected(peers, 'b', false);
    runCommand(peers, 'b', mergeSecondBlock);
    runCommand(peers, 'c', moveFirstBlockAfterSecond);
    runCommand(peers, 'b', wrapFirstBlock);
    runCommand(peers, 'a', moveFirstBlockAfterSecond);
    runCommand(peers, 'b', unsetFirstBlockRole);

    assertNoElementDescendantsInsideParagraphs(allPeers(peers));
    assertSelectionsTargetText(allPeers(peers));
  });

  it('keeps structural mix seed 55 selections on text leaves', () => {
    const peers = createAwarePeers();

    setConnected(peers, 'b', false);
    runCommand(peers, 'b', wrapFirstBlock);
    runCommand(peers, 'a', moveFirstBlockAfterSecond);
    runCommand(peers, 'b', wrapFirstBlock);
    runCommand(peers, 'a', insertExclamation);
    runCommand(peers, 'b', mergeSecondBlock);
    runCommand(peers, 'c', mergeSecondBlock);

    assertNoElementDescendantsInsideParagraphs(allPeers(peers));
    assertSelectionsTargetText(allPeers(peers));
  });

  it('elides stale move_node source paths after concurrent structural removal', () => {
    const peer = createPeers().a;
    const operation: Operation = {
      newPath: [1],
      path: [1, 0],
      type: 'move_node',
    };

    assert.deepEqual(applySlateOperationToYjs(getYjsRoot(peer), operation), {
      fallback: 'missing-move-source-elided',
      mode: 'traceable-fallback',
      operationType: 'move_node',
    });
  });

  it('keeps offline structural mix seed 16 from losing root text boundaries', () => {
    const peers = createAwarePeers();

    setConnected(peers, 'a', false);
    runCommand(peers, 'a', mergeSecondBlock);
    runCommand(peers, 'd', splitFirstText);
    runCommand(peers, 'a', wrapFirstBlock);
    runCommand(peers, 'c', splitFirstText);
    runCommand(peers, 'a', deleteFirstFragment);
    runCommand(peers, 'c', moveFirstBlockDown);
    runCommand(peers, 'a', wrapFirstBlock);
    runCommand(peers, 'd', splitFirstText);
    setConnected(peers, 'a', true);

    assertNoNestedParagraphs(allPeers(peers));
    assertDocumentHasTextBoundary(allPeers(peers));
    assertPeerTopLevelTexts(allPeers(peers), ['', 'l', 'o ', '', 'world!']);
  });

  it('keeps remote wrap and unwrap from dropping split-merge text prefixes', () => {
    const peers = createAwarePeers();

    runIncrementalCommand(peers, 'b', splitFirstText);
    runIncrementalCommand(peers, 'a', appendText);
    runIncrementalCommand(peers, 'c', insertExclamation);
    runIncrementalCommand(peers, 'a', appendText);
    runIncrementalCommand(peers, 'a', appendText);
    runIncrementalCommand(peers, 'b', insertExclamation);
    runIncrementalCommand(peers, 'c', splitFirstText);
    runIncrementalCommand(peers, 'd', mergeSecondBlock);

    assertPeerTopLevelTexts(allPeers(peers), [
      'Hello  Ada! Ada Ada!',
      'world!',
    ]);

    runIncrementalCommand(peers, 'a', wrapFirstBlock);

    assertPeerTopLevelTexts(allPeers(peers), [
      'Hello  Ada! Ada Ada!',
      'world!',
    ]);
    assertNoElementDescendantsInsideParagraphs(allPeers(peers));

    runIncrementalCommand(peers, 'b', unwrapFirstBlock);

    assertPeerTopLevelTexts(allPeers(peers), [
      'Hello  Ada! Ada Ada!',
      'world!',
    ]);
    assertNoElementDescendantsInsideParagraphs(allPeers(peers));
  });
});

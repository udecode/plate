import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Descendant } from '@platejs/plite';
import * as Y from 'yjs';
import {
  createVirtualYjsMovePlaceholder,
  createYjsText,
  getYjsTextContent,
  hideYjsNode,
  removeYjsChild,
} from '../src/core/document';
import {
  assertPeerTexts,
  connectYjsPeerAndSync,
  createSeededYjsPeers,
  createYjsPeer,
  disconnectAndClearYjsTrace,
  disconnectYjsPeer,
  getPeerTopLevelTexts,
  getYjsTrace,
  type Peer,
  paragraph,
  redoYjsPeerAndSync,
  syncConnectedPeers,
  undoYjsPeerAndSync,
} from './support/collaboration';

const initialValue = (): Descendant[] => [
  paragraph('alpha'),
  paragraph('beta'),
  paragraph('gamma'),
];

const createPeer = (
  clientId: string,
  seedUpdate?: Uint8Array,
  children: readonly Descendant[] = initialValue()
): Peer => createYjsPeer({ children, clientId, seedUpdate });

const createPeers = (clientIds: readonly string[]): Peer[] =>
  createSeededYjsPeers({ children: initialValue(), clientIds });

const removeMiddleBlock = (peer: Peer): void => {
  peer.editor.update((tx) => {
    tx.nodes.remove({ at: [1] });
  });
};

const insertRemoteText = (peer: Peer): void => {
  peer.editor.update((tx) => {
    tx.text.insert('!', { at: { path: [0, 0], offset: 'alpha'.length } });
  });
};

describe('@platejs/yjs remove_node collaboration contract', () => {
  it('matches hidden text removals by text content', () => {
    const doc = new Y.Doc();
    const root = doc.get('@platejs/plite', Y.XmlElement);
    const parent = new Y.XmlElement('paragraph');
    const wrong = createYjsText('wrong', {});
    const right = createYjsText('right', {});

    hideYjsNode(wrong);
    hideYjsNode(right);
    root.insert(0, [parent]);
    parent.insert(0, [wrong, right]);

    removeYjsChild(root, parent, 0, { text: 'right' });

    assert.deepEqual(
      parent
        .toArray()
        .filter((node): node is Y.XmlText => node instanceof Y.XmlText)
        .map(getYjsTextContent),
      ['wrong']
    );
  });

  it('matches hidden element removals by child content when candidates share a type', () => {
    const doc = new Y.Doc();
    const root = doc.get('@platejs/plite', Y.XmlElement);
    const parent = new Y.XmlElement('root');
    const wrong = new Y.XmlElement('paragraph');
    const right = new Y.XmlElement('paragraph');

    wrong.insert(0, [createYjsText('wrong', {})]);
    right.insert(0, [createYjsText('right', {})]);
    hideYjsNode(wrong);
    hideYjsNode(right);
    root.insert(0, [parent]);
    parent.insert(0, [wrong, right]);

    removeYjsChild(root, parent, 0, paragraph('right'));

    assert.deepEqual(
      parent
        .toArray()
        .filter((node): node is Y.XmlElement => node instanceof Y.XmlElement)
        .map((node) =>
          node
            .toArray()
            .filter((child): child is Y.XmlText => child instanceof Y.XmlText)
            .map(getYjsTextContent)
            .join('')
        ),
      ['wrong']
    );
  });

  it('matches hidden element removals through virtual placeholder content', () => {
    const doc = new Y.Doc();
    const root = doc.get('@platejs/plite', Y.XmlElement);
    const parent = new Y.XmlElement('root');
    const movedText = createYjsText('right', {});
    const wrong = new Y.XmlElement('paragraph');
    const right = new Y.XmlElement('paragraph');

    root.insert(0, [parent]);
    parent.insert(0, [movedText]);
    wrong.insert(0, [createYjsText('wrong', {})]);
    right.insert(0, [createVirtualYjsMovePlaceholder(movedText)]);
    hideYjsNode(wrong);
    hideYjsNode(right);
    parent.insert(1, [wrong, right]);

    removeYjsChild(root, parent, 0, paragraph('right'));

    assert.deepEqual(
      parent
        .toArray()
        .filter((node): node is Y.XmlElement => node instanceof Y.XmlElement)
        .map((node) =>
          node
            .toArray()
            .filter((child): child is Y.XmlText => child instanceof Y.XmlText)
            .map(getYjsTextContent)
            .join('')
        ),
      ['wrong']
    );
  });

  it('applies local offline remove_node without a root snapshot fallback', () => {
    const peer = createPeer('b');

    disconnectAndClearYjsTrace(peer);
    removeMiddleBlock(peer);

    assert.deepEqual(getPeerTopLevelTexts(peer), ['alpha', 'gamma']);
    assert.deepEqual(getYjsTrace(peer), [
      { mode: 'operation', operationType: 'remove_node' },
    ]);
  });

  it('removes virtual moved content from its visible parent', () => {
    const peer = createPeer('b', undefined, [
      { type: 'quote', children: [paragraph('left')] },
      { type: 'quote', children: [] },
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

    disconnectAndClearYjsTrace(peer);
    peer.editor.update((tx) => {
      tx.nodes.remove({ at: [1, 0] });
    });

    assert.deepEqual(getPeerTopLevelTexts(peer), ['left', '']);
    assert.deepEqual(getYjsTrace(peer), [
      {
        fallback: 'virtual-unwrap-wrapper-remove',
        mode: 'traceable-fallback',
        operationType: 'remove_node',
      },
    ]);
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

  it('undoes and redoes only the local remove_node intent after reconnect', () => {
    const peers = createPeers(['a', 'b', 'c']);
    const [a, b] = peers;

    disconnectYjsPeer(b);
    removeMiddleBlock(b);
    insertRemoteText(a);
    syncConnectedPeers(peers);

    connectYjsPeerAndSync(b, peers);
    assertPeerTexts(peers, ['alpha!', 'gamma']);

    undoYjsPeerAndSync(b, peers);
    assertPeerTexts(peers, ['alpha!', 'beta', 'gamma']);

    redoYjsPeerAndSync(b, peers);
    assertPeerTexts(peers, ['alpha!', 'gamma']);
  });
});

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { type Descendant, type Element, NodeApi } from '@platejs/slate';

import {
  assertPeerTexts,
  connectYjsPeerAndSync,
  createSeededYjsPeers,
  createYjsPeer,
  disconnectAndClearYjsTrace,
  disconnectYjsPeer,
  getPeerTopLevelTexts,
  getVisibleYjsNodeAt,
  getYjsTrace,
  type Peer,
  paragraph,
  readPeerChildren,
  recordOperationTypes,
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
const roleValue = (): Descendant[] => [paragraph('alpha', { role: 'title' })];

const createPeer = (
  clientId: ClientId,
  children: readonly Descendant[] = initialValue()
): Peer =>
  createYjsPeer({
    children,
    clientId,
    numericClientId: clientIds[clientId],
  });

const createPeers = (
  ids: readonly ClientId[],
  children: readonly Descendant[] = initialValue()
): Peer[] =>
  createSeededYjsPeers({
    children,
    clientIds: ids,
    numericClientIds: clientIds,
  });

const setHeading = (peer: Peer): void => {
  peer.editor.update((tx) => {
    tx.nodes.set<Element>({ role: 'title', type: 'heading-one' }, { at: [0] });
  });
};

const unsetRole = (peer: Peer): void => {
  peer.editor.update((tx) => {
    tx.nodes.unset('role', { at: [0] });
  });
};

const setTextMark = (peer: Peer): void => {
  peer.editor.update((tx) => {
    tx.nodes.set({ bold: true }, { at: [0, 0], match: NodeApi.isText });
  });
};

const appendRemoteText = (peer: Peer): void => {
  peer.editor.update((tx) => {
    tx.text.insert('!', { at: { path: [0, 0], offset: 'alpha'.length } });
  });
};

describe('@platejs/yjs set_node collaboration contract', () => {
  it('characterizes public setNodes as set_node', () => {
    const peer = createPeer('b');
    const operations = recordOperationTypes(peer, {
      name: 'set-node-operation-recorder',
    });
    setHeading(peer);

    assert.deepEqual(operations, ['set_node']);
  });

  it('applies local offline element set_node without replacing the Yjs element', () => {
    const peer = createPeer('b');
    const element = getVisibleYjsNodeAt(peer, [0]);

    disconnectAndClearYjsTrace(peer);
    setHeading(peer);

    assert.deepEqual(readPeerChildren(peer), [
      { type: 'heading-one', role: 'title', children: [{ text: 'alpha' }] },
    ]);
    assert.equal(getVisibleYjsNodeAt(peer, [0]), element);
    assert.deepEqual(getYjsTrace(peer), [
      { mode: 'operation', operationType: 'set_node' },
    ]);
  });

  it('preserves concurrent remote text when an offline element set_node reconnects', () => {
    const peers = createPeers(['a', 'b', 'c']);
    const [a, b] = peers;

    disconnectYjsPeer(b);
    setHeading(b);
    appendRemoteText(a);
    syncConnectedPeers(peers);

    assert.deepEqual(getPeerTopLevelTexts(a), ['alpha!']);
    assert.deepEqual(readPeerChildren(b), [
      { type: 'heading-one', role: 'title', children: [{ text: 'alpha' }] },
    ]);

    connectYjsPeerAndSync(b, peers);

    for (const peer of peers) {
      assert.deepEqual(readPeerChildren(peer), [
        {
          type: 'heading-one',
          role: 'title',
          children: [{ text: 'alpha!' }],
        },
      ]);
    }
  });

  it('recovers element set_node convergence through real Yjs updates after reconnect', () => {
    const peers = createPeers(['a', 'b', 'c']);
    const [, b] = peers;

    disconnectYjsPeer(b);
    setHeading(b);
    connectYjsPeerAndSync(b, peers);

    for (const peer of peers) {
      assert.deepEqual(readPeerChildren(peer), [
        { type: 'heading-one', role: 'title', children: [{ text: 'alpha' }] },
      ]);
    }
  });

  it('undoes and redoes only the local element set_node intent after reconnect', () => {
    const peers = createPeers(['a', 'b', 'c']);
    const [a, b] = peers;

    disconnectYjsPeer(b);
    setHeading(b);
    appendRemoteText(a);
    syncConnectedPeers(peers);

    connectYjsPeerAndSync(b, peers);
    for (const peer of peers) {
      assert.deepEqual(readPeerChildren(peer), [
        {
          type: 'heading-one',
          role: 'title',
          children: [{ text: 'alpha!' }],
        },
      ]);
    }

    undoYjsPeerAndSync(b, peers);
    for (const peer of peers) {
      assert.deepEqual(readPeerChildren(peer), [
        { type: 'paragraph', children: [{ text: 'alpha!' }] },
      ]);
    }

    redoYjsPeerAndSync(b, peers);
    for (const peer of peers) {
      assert.deepEqual(readPeerChildren(peer), [
        {
          type: 'heading-one',
          role: 'title',
          children: [{ text: 'alpha!' }],
        },
      ]);
    }
  });

  it('characterizes public unsetNodes as set_node', () => {
    const peer = createPeer('b', roleValue());
    const operations = recordOperationTypes(peer, {
      name: 'unset-node-operation-recorder',
    });
    unsetRole(peer);

    assert.deepEqual(operations, ['set_node']);
    assert.deepEqual(readPeerChildren(peer), [
      { type: 'paragraph', children: [{ text: 'alpha' }] },
    ]);
  });

  it('applies local offline text mark set_node without replacing the Yjs text node', () => {
    const peer = createPeer('b');
    const text = getVisibleYjsNodeAt(peer, [0, 0]);

    disconnectAndClearYjsTrace(peer);
    setTextMark(peer);

    assert.deepEqual(readPeerChildren(peer), [
      { type: 'paragraph', children: [{ bold: true, text: 'alpha' }] },
    ]);
    assert.equal(getVisibleYjsNodeAt(peer, [0, 0]), text);
    assert.deepEqual(getYjsTrace(peer), [
      { mode: 'operation', operationType: 'set_node' },
    ]);
  });

  it('syncs text mark set_node through reconnect and undo without root snapshots', () => {
    const peers = createPeers(['a', 'b', 'c']);
    const [, b] = peers;

    disconnectYjsPeer(b);
    setTextMark(b);
    connectYjsPeerAndSync(b, peers);

    for (const peer of peers) {
      assert.deepEqual(readPeerChildren(peer), [
        { type: 'paragraph', children: [{ bold: true, text: 'alpha' }] },
      ]);
    }

    undoYjsPeerAndSync(b, peers);
    assertPeerTexts(peers, ['alpha']);
    for (const peer of peers) {
      assert.deepEqual(readPeerChildren(peer), [
        { type: 'paragraph', children: [{ text: 'alpha' }] },
      ]);
    }
  });
});

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Y from 'yjs';

import { history } from '../../src/history';
import {
  createEditor,
  defineEditorSchema,
  type Descendant,
  NodeApi,
  property,
  schema,
  target,
} from '../../src/index';
import {
  assertCanonicalYjsTrace,
  assertPeerTexts,
  connectYjsPeerAndSync,
  createSeededYjsHistoryPeers,
  createYjsHistoryPeer,
  createYjsPeerWithEditor,
  disconnectAndClearYjsTrace,
  disconnectYjsPeer,
  getPeerTopLevelTexts,
  getVisibleYjsNodeAt,
  type Peer,
  paragraph,
  readPeerChildren,
  redoHistoryPeerAndSync,
  syncConnectedPeers,
  undoHistoryPeerAndSync,
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
  createYjsHistoryPeer({
    children,
    clientId,
    numericClientId: clientIds[clientId],
  });

const createPeers = (
  ids: readonly ClientId[],
  children: readonly Descendant[] = initialValue()
): Peer[] =>
  createSeededYjsHistoryPeers({
    children,
    clientIds: ids,
    numericClientIds: clientIds,
  });

const setHeading = (peer: Peer): void => {
  peer.editor.update.nodes.set(
    { role: 'title', type: 'heading-one' },
    { at: [0], type: 'paragraph' }
  );
};

const unsetRole = (peer: Peer): void => {
  peer.editor.update.nodes.unset('role', { at: [0] });
};

const setTextMark = (peer: Peer): void => {
  peer.editor.update.nodes.set(
    { bold: true },
    { at: [0, 0], match: NodeApi.isText }
  );
};

const link = (url: string, text: string) => ({
  children: [{ text }],
  type: 'link',
  url,
});

const appendRemoteText = (peer: Peer): void => {
  peer.editor.update.text.insert('!', {
    at: { path: [0, 0], offset: 'alpha'.length },
  });
};

const LinkSchema = defineEditorSchema('schema:yjs-set-link-url', {
  elements: {
    link: {
      content: schema.content.text({ default: 'text', min: 1 }),
      inline: true,
    },
    paragraph: {
      content: schema.content.any(
        [schema.content.text(), schema.content.type('link')],
        { default: 'text', min: 1 }
      ),
    },
  },
  properties: [
    schema.elementProperty('url', property.string(), {
      target: target.type('link'),
    }),
  ],
  root: schema.content.types(['paragraph'], {
    default: { type: 'paragraph' },
    min: 1,
  }),
  unknown: 'reject',
});

const createLinkPeers = (children: readonly Descendant[]): Peer[] => {
  const create = (numericClientId: number, seedUpdate?: Uint8Array) =>
    createYjsPeerWithEditor(
      createEditor({
        initialValue: children,
        plugins: [LinkSchema, history()],
      }),
      {
        children,
        clientId: String(numericClientId),
        numericClientId,
        seedUpdate,
      }
    );
  const first = create(1);

  return [first, create(2, Y.encodeStateAsUpdate(first.doc))];
};

const urlWritesBesideTyping = [
  {
    before: '',
    expected: [{ text: '' }, link('v', 'aXb'), { text: '' }],
    title: 'inside the link',
    typed: { path: [0, 1, 0], offset: 1 },
  },
  {
    before: 'word',
    expected: [{ text: 'woXrd' }, link('v', 'ab'), { text: '' }],
    title: 'before the link',
    typed: { path: [0, 0], offset: 2 },
  },
] as const;

describe('plitejs/yjs set_node collaboration contract', () => {
  for (const { before, expected, title, typed } of urlWritesBesideTyping) {
    for (const order of ['writer-first', 'typist-first'] as const) {
      it(`keeps a link url write while a peer types ${title}, ${order}`, () => {
        const peers = createLinkPeers([
          {
            children: [{ text: before }, link('u', 'ab'), { text: '' }],
            type: 'paragraph',
          },
        ]);
        const [writer, typist] = peers;

        writer.editor.update.nodes.set({ url: 'v' }, { at: [0, 1] });
        typist.editor.update.text.insert('X', { at: typed });
        syncConnectedPeers(order === 'writer-first' ? peers : [typist, writer]);

        assert.deepEqual(peers.map(readPeerChildren), [
          [{ children: expected, type: 'paragraph' }],
          [{ children: expected, type: 'paragraph' }],
        ]);
      });
    }
  }

  it('applies local offline element set_node without replacing the Yjs element', () => {
    const peer = createPeer('b');
    const element = getVisibleYjsNodeAt(peer, [0]);

    disconnectAndClearYjsTrace(peer);
    setHeading(peer);

    assert.deepEqual(readPeerChildren(peer), [
      { type: 'heading-one', role: 'title', children: [{ text: 'alpha' }] },
    ]);
    assert.equal(getVisibleYjsNodeAt(peer, [0]), element);
    assertCanonicalYjsTrace(peer);
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

  it('undoes and redoes only the local element property change after reconnect', () => {
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

    undoHistoryPeerAndSync(b, peers);
    for (const peer of peers) {
      assert.deepEqual(readPeerChildren(peer), [
        { type: 'paragraph', children: [{ text: 'alpha!' }] },
      ]);
    }

    redoHistoryPeerAndSync(b, peers);
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

  it('unsets a node property through a canonical change', () => {
    const peer = createPeer('b', roleValue());
    unsetRole(peer);

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
    assertCanonicalYjsTrace(peer);
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

    undoHistoryPeerAndSync(b, peers);
    assertPeerTexts(peers, ['alpha']);
    for (const peer of peers) {
      assert.deepEqual(readPeerChildren(peer), [
        { type: 'paragraph', children: [{ text: 'alpha' }] },
      ]);
    }
  });

  it('marks the end of a text leaf while keeping a concurrent append', () => {
    const [a, b] = createPeers(['a', 'b']);

    b.editor.update.nodes.set(
      { bold: true },
      {
        at: {
          anchor: { path: [0, 0], offset: 3 },
          focus: { path: [0, 0], offset: 5 },
        },
        match: NodeApi.isText,
        split: true,
      }
    );
    appendRemoteText(a);
    syncConnectedPeers([b, a]);

    for (const peer of [a, b]) {
      assert.deepEqual(readPeerChildren(peer), [
        {
          type: 'paragraph',
          children: [{ text: 'alp' }, { bold: true, text: 'ha!' }],
        },
      ]);
    }
  });
});

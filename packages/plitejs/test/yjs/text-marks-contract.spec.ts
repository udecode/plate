import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Y from 'yjs';

import {
  createSeededYjsPeers,
  readPeerChildren,
} from './support/collaboration';

describe('plitejs/yjs text marks', () => {
  for (const first of [0, 1]) {
    it(`keeps untouched letters unmarked after delete || differently marked insert, peer ${first} delivered first`, () => {
      const peers = createSeededYjsPeers({
        children: [
          {
            type: 'paragraph',
            children: [
              { text: 'a' },
              { text: 'hers', bold: true },
              { text: 'b' },
            ],
          },
        ],
        clientIds: ['alice', 'bob'],
        numericClientIds: { alice: 1, bob: 2 },
      });
      try {
        const [alice, bob] = peers;
        alice.editor.update((tx) => {
          tx.selection.set({
            kind: 'text',
            anchor: { path: [0, 1], offset: 0 },
            focus: { path: [0, 1], offset: 4 },
          });
          tx.fragment.delete();
        });
        bob.editor.update((tx) => {
          tx.selection.set({
            kind: 'text',
            anchor: { path: [0, 1], offset: 2 },
            focus: { path: [0, 1], offset: 2 },
          });
          tx.fragment.replace([{ text: 'Q', italic: true }]);
        });
        const updates = peers.map((peer) => Y.encodeStateAsUpdate(peer.doc));
        for (const index of [first, 1 - first]) {
          Y.applyUpdate(peers[1 - index].doc, updates[index]);
        }
        for (const peer of peers) {
          assert.deepEqual(readPeerChildren(peer), [
            {
              type: 'paragraph',
              children: [
                { text: 'a' },
                { text: 'Q', italic: true },
                { text: 'b' },
              ],
            },
          ]);
        }
      } finally {
        for (const peer of peers) peer.cleanup();
      }
    });

    it(`keeps both same-key overlapping formats, peer ${first} delivered first`, () => {
      const peers = createSeededYjsPeers({
        children: [{ type: 'paragraph', children: [{ text: 'abcdef' }] }],
        clientIds: ['alice', 'bob'],
        numericClientIds: { alice: 1, bob: 2 },
      });
      try {
        peers.forEach((peer, index) => {
          peer.editor.update((tx) => {
            tx.selection.set({
              kind: 'text',
              anchor: { path: [0, 0], offset: index * 2 },
              focus: { path: [0, 0], offset: index * 2 + 4 },
            });
            tx.marks.add('bold', true);
          });
        });
        const updates = peers.map((peer) => Y.encodeStateAsUpdate(peer.doc));
        for (const index of [first, 1 - first]) {
          Y.applyUpdate(peers[1 - index].doc, updates[index]);
        }
        for (const peer of peers) {
          assert.deepEqual(readPeerChildren(peer), [
            { type: 'paragraph', children: [{ text: 'abcdef', bold: true }] },
          ]);
        }
      } finally {
        for (const peer of peers) peer.cleanup();
      }
    });
  }
});

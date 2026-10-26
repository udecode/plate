import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Y from 'yjs';

import {
  createEditor,
  type Descendant,
  defineEditorSchema,
  schema,
} from '../../src/index';
import {
  createYjsPeerWithEditor,
  type Peer,
  paragraph,
  readPeerChildren,
  syncConnectedPeers,
} from './support/collaboration';

const Schema = defineEditorSchema('schema:yjs-emptied-element', {
  elements: {
    paragraph: { content: schema.content.text() },
    quote: { content: schema.content.types(['paragraph']) },
  },
  root: schema.content.not(schema.content.text()),
  unknown: 'reject',
});

type Edit = (peer: Peer) => void;

const quote = (...children: Descendant[]): Descendant => ({
  children,
  type: 'quote',
});

const createRoom = (
  children: readonly Descendant[],
  writerId: number,
  order: 'writer-first' | 'peer-first'
) => {
  const errors: unknown[] = [];
  const create = (
    numericClientId: number,
    seedUpdate?: Uint8Array,
    initial = children
  ) =>
    createYjsPeerWithEditor(
      createEditor({
        initialValue: initial,
        lifecycleErrorSink: (error) => errors.push(error.cause),
        plugins: [Schema],
      }),
      {
        children: initial,
        clientId: String(numericClientId),
        numericClientId,
        seedUpdate,
      }
    );
  const writer = create(writerId);
  const peer = create(
    writerId === 1 ? 2 : 1,
    Y.encodeStateAsUpdate(writer.doc)
  );

  return {
    peer,
    read: () => ({
      errors,
      joiner: readPeerChildren(
        create(3, Y.encodeStateAsUpdate(writer.doc), [paragraph('seed')])
      ),
      peer: readPeerChildren(peer),
      writer: readPeerChildren(writer),
    }),
    sync: () =>
      syncConnectedPeers(
        order === 'writer-first' ? [writer, peer] : [peer, writer]
      ),
    writer,
  };
};

const settled = (expected: readonly Descendant[]) => ({
  errors: [],
  joiner: expected,
  peer: expected,
  writer: expected,
});

const removeAt =
  (path: number[]): Edit =>
  (peer) => {
    peer.editor.update.nodes.remove({ at: path });
  };

const joinAt =
  (path: number[]): Edit =>
  (peer) => {
    peer.editor.update.nodes.merge({ at: path });
  };

const breakAt =
  (path: number[], offset: number): Edit =>
  (peer) => {
    const at = { offset, path };

    peer.editor.update((tx) => {
      tx.selection.set({ anchor: at, focus: at, kind: 'text' });
      tx.break.insert();
      tx.selection.set(null);
    });
  };

const moveTo =
  (from: number, to: number): Edit =>
  (peer) => {
    peer.editor.update.nodes.move({ at: [from], to: [to] });
  };

const wrapAt =
  (index: number): Edit =>
  (peer) => {
    peer.editor.update((tx) => {
      tx.selection.set(null);
      tx.nodes.wrap({ children: [], type: 'quote' }, { at: [index] });
    });
  };

const typeAt =
  (path: number[], offset: number, text: string): Edit =>
  (peer) => {
    peer.editor.update.text.insert(text, { at: { offset, path } });
  };

describe('plitejs/yjs an element emptied of its children', () => {
  for (const writerId of [1, 2]) {
    for (const order of ['writer-first', 'peer-first'] as const) {
      const variant = `writer id ${writerId}, ${order}`;

      it(`removing a quote's only paragraph leaves the quote empty on every peer, ${variant}`, () => {
        const room = createRoom(
          [paragraph('ab'), quote(paragraph('ef'))],
          writerId,
          order
        );

        removeAt([1, 0])(room.writer);
        room.sync();

        assert.deepEqual(room.read(), settled([paragraph('ab'), quote()]));
      });

      it(`a line joined before a quote emptied while a teammate split that line reaches every peer, ${variant}`, () => {
        const room = createRoom(
          [paragraph('ab'), paragraph('cd'), paragraph('ef')],
          writerId,
          order
        );

        typeAt([0, 0], 0, 'X')(room.writer);
        wrapAt(2)(room.peer);
        room.sync();
        moveTo(1, 0)(room.peer);
        room.sync();
        removeAt([2, 0])(room.writer);
        breakAt([1, 0], 0)(room.peer);
        room.sync();
        joinAt([1])(room.writer);
        room.sync();

        assert.deepEqual(
          room.read(),
          settled([paragraph('cd'), paragraph('Xab'), quote()])
        );
      });
    }
  }
});

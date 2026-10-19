import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Y from 'yjs';

import { createAuthoredPlugin } from '../../src/authored/authored';
import {
  authoredRecords,
  contextRecordOf,
} from '../../src/authored/facts/records';
import { authoredMarksSchema } from '../../src/authored/tree/marks';
import { createEditor, definePlugin } from '../../src/index';
import { yjs } from '../../src/yjs/core/plugin';

const alice = { at: 1, author: 'alice', change: 'A' };
const inAlice = contextRecordOf(null, alice);
const hers = {
  children: [{ authored: [{ ...alice, kind: 'insert' }], text: 'hers' }],
  type: 'paragraph',
};

const AuthoredWithoutRecorder = definePlugin('authored', {
  dependencies: [authoredRecords],
  schema: authoredMarksSchema,
});

const peer = (doc: Y.Doc, authored: unknown, seed = false) => {
  const editor = createEditor({
    initialValue: [
      hers,
      { children: [{ text: 'more' }], type: 'paragraph' },
    ] as never,
    plugins: [authored as never],
  });

  const binding = yjs({
    doc,
    initialReady: true,
    ...(seed ? { seed: true } : {}),
  });

  editor.install(binding);

  return {
    admission: () => editor.plugin(binding).api.admissionStatus(),
    editor,
  };
};

const send = (from: Y.Doc, to: Y.Doc, since: Uint8Array) =>
  Y.applyUpdate(to, Y.encodeStateAsUpdate(from, since));

const nested = (author: string, change: string, text: string) => ({
  authored: [
    { at: 2, author, change, kind: 'insert' },
    { ctx: inAlice.ctx, kind: 'in' },
  ],
  text,
});

describe('plitejs/yjs authored context hold', () => {
  it('holds a remote run until the context it rests on arrives', () => {
    const bobDoc = new Y.Doc();
    const { editor: bob } = peer(bobDoc, AuthoredWithoutRecorder, true);
    const carolDoc = new Y.Doc();
    const danaDoc = new Y.Doc();

    send(bobDoc, carolDoc, new Uint8Array([0]));
    send(bobDoc, danaDoc, new Uint8Array([0]));

    const { editor: carol } = peer(carolDoc, AuthoredWithoutRecorder);
    const { admission, editor: dana } = peer(
      danaDoc,
      createAuthoredPlugin({ authorId: 'dana' })
    );

    for (const [from, to] of [
      [carolDoc, danaDoc],
      [danaDoc, carolDoc],
    ] as const) {
      send(from, to, Y.encodeStateVector(to));
    }

    const bobSince = Y.encodeStateVector(danaDoc);

    bob.update((tx) => {
      tx.records.put('authored-contexts', inAlice.ctx, { member: alice });
      tx.nodes.insert(nested('bob', 'B', 'X') as never, { at: [0, 1] });
    });
    send(bobDoc, carolDoc, Y.encodeStateVector(carolDoc));

    const carolSince = Y.encodeStateVector(carolDoc);

    carol.update((tx) => {
      tx.nodes.insert(nested('carol', 'C', 'Q') as never, { at: [1, 0] });
    });

    const before = dana.read.value();

    send(carolDoc, danaDoc, carolSince);

    assert.deepEqual(
      { state: admission(), value: dana.read.value() },
      { state: { reason: 'reference', state: 'waiting' }, value: before }
    );
    assert.throws(
      () => dana.update.text.insert('!', { at: { offset: 0, path: [1, 0] } }),
      {
        message:
          'Cannot publish collaborative editor work while the binding is waiting for reference.',
      }
    );

    send(bobDoc, danaDoc, bobSince);

    assert.deepEqual(
      { state: admission(), value: dana.read.value() },
      { state: { state: 'ready' }, value: carol.read.value() }
    );
  });
});

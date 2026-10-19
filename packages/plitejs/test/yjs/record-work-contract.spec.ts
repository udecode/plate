import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Y from 'yjs';

import { recordWork as work } from '../support/record-work';

const { createAuthoredPlugin } = await import('../../src/authored/authored');
const { contextRecordOf } = await import('../../src/authored/facts/records');
const { createEditor } = await import('../../src/index');
const { yjs } = await import('../../src/yjs/core/plugin');
const { reviewRecords } = await import('../support/authored');

const paragraph = (text: string) => ({
  children: [{ text }],
  type: 'paragraph',
});

// The records a long review history leaves: each decided suggestion keeps a
// context and an accept verdict, and the text names none of them.
const decidedHistory = (count: number) => {
  const members = Array.from({ length: count }, (_, index) => ({
    at: 1,
    author: 'carol',
    change: `carol:${index}`,
  }));

  return reviewRecords({
    contexts: members.map((member) => contextRecordOf(null, member)),
    verdicts: members.map((member, index) => ({
      decision: `d:${index}`,
      member,
      verdict: 'accept' as const,
    })),
  });
};

const peer = (
  doc: Y.Doc,
  authorId: string,
  intent: 'edit' | 'propose',
  records?: ReturnType<typeof decidedHistory>
) => {
  let minted = 0;
  // A verdict lookup reads the record its probe lands on, so a random change
  // id would read one record or none by where it sorts.
  const editor = createEditor({
    initialValue: {
      children: [paragraph('Body')],
      ...(records ? { records } : {}),
    },
    plugins: [
      createAuthoredPlugin({
        authorId,
        createChangeId: () => `${authorId}:k${(minted += 1)}`,
        intent,
      }),
    ],
  } as never);
  const cleanup = editor.install(
    yjs({ doc, initialReady: true, ...(records ? { seed: true } : {}) })
  );

  return { cleanup, doc, editor };
};

const send = (from: Y.Doc, to: Y.Doc) =>
  Y.applyUpdate(to, Y.encodeStateAsUpdate(from, Y.encodeStateVector(to)));

const measure = (run: () => void) => {
  work.copied = 0;
  work.read = 0;
  run();

  return { ...work };
};

const keyWork = (count: number, intent: 'edit' | 'propose') => {
  const records = decidedHistory(count);
  const a = peer(new Y.Doc(), 'alice', intent, records);
  const joined = new Y.Doc();

  send(a.doc, joined);

  const b = peer(joined, 'bob', intent);
  const type = () => ({
    local: measure(() =>
      a.editor.update((tx) =>
        tx.text.insert('x', { at: { offset: 0, path: [0, 0] } })
      )
    ),
    remote: measure(() => send(a.doc, b.doc)),
  });
  const keys = [type(), type()];

  assert.deepEqual(
    [a.editor.read.value().records, b.editor.read.value().records].map(
      (held) => Object.keys(held?.['authored-contexts'] ?? {}).length
    ),
    [count, count]
  );
  a.cleanup();
  b.cleanup();

  return keys;
};

describe('plitejs/yjs record work per key', () => {
  it('copies no record on a key that writes none and reads as many at 1,000 as at 10,000 records, locally and remotely', () => {
    measure(() => decidedHistory(1));
    // A load walks its records, so the zeros below are the key's, not a dead
    // counter's.
    assert.ok(
      measure(() =>
        peer(new Y.Doc(), 'alice', 'edit', decidedHistory(10_000)).cleanup()
      ).copied >= 20_000
    );

    for (const intent of ['edit', 'propose'] as const) {
      const none = { copied: 0, read: 0 };
      const [empty, small, large] = [0, 1000, 10_000].map((count) =>
        keyWork(count, intent)
      );

      assert.deepEqual(empty, [
        { local: none, remote: none },
        { local: none, remote: none },
      ]);
      assert.deepEqual(large, small, intent);
      assert.ok(
        large.every(({ local, remote }) => local.copied + remote.copied === 0),
        intent
      );
    }
  });
});

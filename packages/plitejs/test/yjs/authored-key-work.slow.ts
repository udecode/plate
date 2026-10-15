import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Y from 'yjs';

import { recordWork } from '../support/record-work';

const { createAuthoredPlugin } = await import('../../src/authored/authored');
const { contextRecordOf } = await import('../../src/authored/facts/records');
const { readLedgerWork, resetLedgerWork } =
  await import('../../src/authored/ledger/work');
const { getEditorRuntime } = await import('../../src/core/editor-runtime');
const { readCoreWork, resetCoreWork } = await import('../../src/core/work');
const {
  createEditor,
  createEditorView,
  defineEditorSchema,
  editorCommands,
  schema,
} = await import('../../src/index');
const { yjs } = await import('../../src/yjs/core/plugin');
const { reviewRecords } = await import('../support/authored');

// The framed-command law rebuilds whole indexes on every key to check them.
process.env.PLITE_LAW_CHECK = '0';

type Intent = 'edit' | 'propose';
type Key = 'backspace' | 'enter' | 'final' | 'initial' | 'letter';
type Arm = Readonly<{ blocks: number; records: number; suggestions: number }>;

const Titled = defineEditorSchema('w1-titled', {
  elements: {
    paragraph: schema.element.textBlock(),
    title: schema.element.textBlock(),
  },
  id: 'w1-titled',
  root: schema.content.prefix(
    [{ element: 'title' }],
    schema.content.any([schema.content.type('paragraph')], {
      default: { type: 'paragraph' },
      min: 1,
    })
  ),
  unknown: 'reject',
  version: 1,
});

const paragraph = (text: string) => ({
  children: [{ text }],
  type: 'paragraph',
});
const struck = (text: string, change: string) => ({
  children: [
    { text: `${text} ` },
    {
      authored: [{ at: 1, author: 'bob', change, kind: 'delete' }],
      text: 'gone',
    },
  ],
  type: 'paragraph',
});

const plainLine = (index: number) => `plain ${index}`;
const CARET_LINE = 5;
const KEY_OFFSETS: Readonly<Record<Key, number>> = {
  backspace: 0,
  enter: 3,
  final: plainLine(CARET_LINE).length,
  initial: 0,
  letter: 3,
};
const FIRST_SUGGESTION = 10;

// A title, then lines whose suggestions start well past the caret's line.
const documentOf = (blocks: number, suggestions: number) => {
  const lines = blocks - 1;
  const step = Math.floor((lines - FIRST_SUGGESTION) / suggestions);

  return [
    { children: [{ text: 'Title' }], type: 'title' },
    ...Array.from({ length: lines }, (_, index) => {
      const nth = (index - FIRST_SUGGESTION) / step;

      return index >= FIRST_SUGGESTION &&
        Number.isInteger(nth) &&
        nth < suggestions
        ? struck(`struck ${index}`, `bob:${nth}`)
        : paragraph(plainLine(index));
    }),
  ];
};

// What a long review history leaves: a context and an accept verdict for
// each decided suggestion, none of them named by the text.
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

let minted = 0;

const peer = (
  doc: Y.Doc,
  authorId: string,
  intent: Intent,
  seed?: Readonly<{ children: unknown[]; records?: unknown }>
) => {
  const editor = createEditor({
    initialValue: seed ?? { children: documentOf(2, 1) },
    plugins: [
      Titled,
      createAuthoredPlugin({
        authorId,
        createChangeId: () => `${authorId}:k${(minted += 1)}`,
        intent,
        now: () => 2,
      }),
    ],
  });
  const cleanup = editor.install(
    yjs({ doc, initialReady: true, ...(seed ? { seed: true } : {}) })
  );

  return { cleanup, doc, editor };
};

type Peer = ReturnType<typeof peer>;

const send = (from: Y.Doc, to: Y.Doc) =>
  Y.applyUpdate(to, Y.encodeStateAsUpdate(from, Y.encodeStateVector(to)));

const subscribeChanges = (editor: Peer['editor']) =>
  editor.api.authored.subscribeChanges(() => {});

const mountReview = (editor: Peer['editor']) => {
  const views = (['accepted', 'proposed'] as const).map((preview) =>
    createEditorView(editor, { authored: { preview } })
  );

  views.forEach((view) => view.read.children());

  const stops = [
    ...views.map((view) => getEditorRuntime(view).subscribe(() => {})),
    subscribeChanges(editor),
  ];

  return () => stops.forEach((stop) => stop());
};

// The receiver: a change listener, and an accepted preview rendered once and
// then dropped.
const mountReceiver = (editor: Peer['editor']) => {
  createEditorView(editor, {
    authored: { preview: 'accepted' },
  }).read.children();

  return subscribeChanges(editor);
};

const press = (editor: Peer['editor'], key: Key) =>
  editor.update((tx) => {
    if (key === 'letter' || key === 'initial' || key === 'final') {
      tx.command(editorCommands.insertText, { text: 'x' });
    } else if (key === 'enter') tx.break.insert();
    else tx.text.deleteBackward();
  });

const reset = () => {
  resetLedgerWork();
  resetCoreWork();
  recordWork.copied = 0;
  recordWork.read = 0;
};

const read = () => ({
  ...readLedgerWork(),
  ...readCoreWork(),
  recordsCopied: recordWork.copied,
  recordsRead: recordWork.read,
});

// The work of the first key a fresh editor takes, and of its commit on a
// second peer.
const keyWork = (intent: Intent, key: Key, arm: Arm) => {
  const a = peer(new Y.Doc(), 'alice', intent, {
    children: documentOf(arm.blocks, arm.suggestions),
    ...(arm.records > 0 ? { records: decidedHistory(arm.records) } : {}),
  });
  const joined = new Y.Doc();

  send(a.doc, joined);

  const b = peer(joined, 'bob', intent);
  const unmount = [mountReview(a.editor), mountReceiver(b.editor)];
  const point = {
    offset: KEY_OFFSETS[key],
    path: [CARET_LINE + 1, 0],
  };

  a.editor.update((tx) => tx.selection.set({ anchor: point, focus: point }));
  send(a.doc, b.doc);
  reset();
  press(a.editor, key);

  const local = read();

  reset();
  send(a.doc, b.doc);

  const remote = read();

  assert.deepEqual(
    b.editor.read.children(),
    a.editor.read.children(),
    'the peer received the key'
  );
  unmount.forEach((stop) => stop());
  a.cleanup();
  b.cleanup();

  return { local, remote };
};

type Work = ReturnType<typeof keyWork>;

const differing = (
  actual: Work,
  expected: Work,
  counters?: ReadonlyArray<keyof Work['local']>
) =>
  Object.fromEntries(
    (['local', 'remote'] as const).flatMap((side) =>
      (counters ?? (Object.keys(expected[side]) as Array<keyof Work['local']>))
        .filter((counter) => actual[side][counter] !== expected[side][counter])
        .map((counter) => [
          `${side} ${counter}`,
          `${expected[side][counter]} -> ${actual[side][counter]}`,
        ])
    )
  );

const CARD_LINE = 8;
const CARD_SPAN = 10_000;

// A title and plain lines, then 10,000 paragraphs whose last `size` alice
// proposed one at a time with the oldest first or last, which make one card,
// then plain lines. Every arm holds as many blocks, since a deeper sequence
// copies more slots per key whatever the review holds.
const cardDocument = (size: number, oldest: 'first' | 'last') => [
  { children: [{ text: 'Title' }], type: 'title' },
  ...Array.from({ length: CARD_LINE }, (_, index) =>
    paragraph(`plain ${index}`)
  ),
  ...Array.from({ length: CARD_SPAN }, (_, index) => {
    const nth = index - (CARD_SPAN - size);

    return nth < 0
      ? paragraph(`plain ${CARD_LINE + index}`)
      : {
          authored: [
            {
              at: oldest === 'first' ? nth + 1 : size - nth,
              author: 'alice',
              change: `alice:${nth}`,
              kind: 'insert',
            },
          ],
          children: [{ text: `proposed ${nth}` }],
          type: 'paragraph',
        };
  }),
  ...Array.from({ length: 4 }, (_, index) => paragraph(`after ${index}`)),
];

type CardArm = Readonly<{
  author: 'alice' | 'bob';
  key: Key;
  oldest: 'first' | 'last';
  /**
   * In the card's last paragraph, in its middle one, at the end of its last
   * one, or in the line after it.
   */
  place: 'beside' | 'end' | 'inside' | 'middle';
  size: number;
}>;

// The work of a Suggesting key at a place in the card, of its commit on a
// second peer, and of the same key pressed again.
const cardKeyWork = (arm: CardArm) => {
  const a = peer(new Y.Doc(), arm.author, 'propose', {
    children: cardDocument(arm.size, arm.oldest),
  });
  const joined = new Y.Doc();

  send(a.doc, joined);

  const b = peer(joined, 'carol', 'propose');
  const unmount = [mountReview(a.editor), mountReceiver(b.editor)];
  const first = 1 + CARD_LINE + CARD_SPAN - arm.size;
  const last = first + arm.size - 1;
  const point = {
    beside: { offset: 3, path: [last + 1, 0] },
    end: { offset: `proposed ${arm.size - 1}`.length, path: [last, 0] },
    inside: { offset: 3, path: [last, 0] },
    middle: { offset: 3, path: [first + Math.floor((arm.size - 1) / 2), 0] },
  }[arm.place];

  a.editor.update((tx) => tx.selection.set({ anchor: point, focus: point }));
  send(a.doc, b.doc);
  reset();
  press(a.editor, arm.key);

  const local = read();

  reset();
  send(a.doc, b.doc);

  const remote = read();

  assert.deepEqual(
    b.editor.read.children(),
    a.editor.read.children(),
    'the peer received the key'
  );
  reset();
  press(a.editor, arm.key);

  const next = read();

  unmount.forEach((stop) => stop());
  a.cleanup();
  b.cleanup();

  return { local, next, remote };
};

describe("a key's work follows its edit, not the document", () => {
  for (const intent of ['edit', 'propose'] as const) {
    for (const key of [
      'letter',
      'initial',
      'final',
      'backspace',
      'enter',
    ] as const) {
      it(`${intent} ${key}`, { timeout: 300_000 }, () => {
        const base = keyWork(intent, key, {
          blocks: 96,
          records: 0,
          suggestions: 50,
        });
        const records = keyWork(intent, key, {
          blocks: 96,
          records: 10_000,
          suggestions: 50,
        });

        assert.deepEqual(
          differing(
            keyWork(intent, key, { blocks: 4992, records: 0, suggestions: 50 }),
            base
          ),
          {},
          'at 4,992 blocks'
        );
        assert.deepEqual(
          differing(
            keyWork(intent, key, { blocks: 96, records: 0, suggestions: 1 }),
            base
          ),
          {},
          'with one suggestion'
        );
        assert.deepEqual(
          differing(
            records,
            keyWork(intent, key, { blocks: 96, records: 1000, suggestions: 50 })
          ),
          {},
          'at 10,000 records against 1,000'
        );
        assert.deepEqual(
          differing(records, base, [
            'contextHops',
            'contextsMinted',
            'documentFacts',
            'recordsCopied',
          ]),
          {},
          'builds no facts at 10,000 records'
        );
      });
    }
  }
});

describe("a card's walks follow the key, not the card", () => {
  for (const place of ['inside', 'beside'] as const) {
    it(`the card's author typing ${place} it`, { timeout: 300_000 }, () => {
      const arm = {
        author: 'alice',
        key: 'letter',
        oldest: 'first',
        place,
      } as const;

      // A one-change card has no neighbor whose pair a key rechecks, so the
      // arm that grows it starts from two changes.
      assert.deepEqual(
        differing(
          cardKeyWork({ ...arm, size: 10_000 } as const),
          cardKeyWork({ ...arm, size: 2 } as const)
        ),
        {},
        'at 10,000 changes against two'
      );
    });
  }

  for (const oldest of ['first', 'last'] as const) {
    it(
      `another author's key splitting it, the oldest change ${oldest}`,
      { timeout: 300_000 },
      () => {
        const work = cardKeyWork({
          author: 'bob',
          key: 'letter',
          oldest,
          place: 'middle',
          size: 10_000,
        });

        // The 5,000 changes on the far side of the key from the oldest one,
        // and bob's new change.
        assert.deepEqual(
          [work.local.cardWalks, work.remote.cardWalks, work.next.cardWalks],
          [5001, 5001, 0]
        );
      }
    );
  }

  it(
    "the card's author proposing a new paragraph at its end",
    { timeout: 300_000 },
    () => {
      const work = cardKeyWork({
        author: 'alice',
        key: 'enter',
        oldest: 'first',
        place: 'end',
        size: 10_000,
      });

      assert.deepEqual([work.local.cardWalks, work.remote.cardWalks], [0, 0]);
    }
  );
});

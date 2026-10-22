import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Y from 'yjs';

import { withoutLawCheck } from '../support/law-check';
import { recordWork } from '../support/record-work';

const { createAuthoredPlugin } = await import('../../src/authored/authored');
const { contextRecordOf } = await import('../../src/authored/facts/records');
const { readLedgerWork, resetLedgerWork } =
  await import('../../src/authored/ledger/work');
const { getEditorRuntime } = await import('../../src/core/editor-runtime');
const { getDefined } = await import('../../src/internal/get-defined');
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

withoutLawCheck();

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

type Editor = Peer['editor'];
type Preview = 'accepted' | 'proposed';
type ViewKey = NonNullable<
  ReturnType<ReturnType<typeof createEditorView>['key']>
>;

const badges = { named: 0, rereads: 0 };

// A badge list on a preview of each mode: a delta marks the blocks it names,
// and the draw after a key rereads the cards of those and of the typed block,
// and mounts the badge of a block it names for the first time.
const mountReview = (
  editor: Editor,
  typed: (preview: Preview) => readonly number[]
) => {
  const previews = ['accepted', 'proposed'] as const;
  const views = previews.map((preview) =>
    createEditorView(editor, { authored: { preview } })
  );
  const shown = views.map(
    (view) =>
      new Set(
        view.read.children().flatMap((_, index) => view.key([index]) ?? [])
      )
  );
  const marked = views.map(() => new Set<ViewKey>());
  const stops = [
    ...views.map((view) => getEditorRuntime(view).subscribe(() => {})),
    ...views.map((view, index) =>
      view.api.authored.subscribeChanges((delta) => {
        badges.named += delta.blocks.length;
        for (const key of delta.blocks) marked[index].add(key);
      })
    ),
    subscribeChanges(editor),
  ];
  const keys = views.map((view, index) => view.key(typed(previews[index])));
  const draw = () =>
    views.map((view, index) => {
      const key = keys[index];
      const drawn = [...marked[index]];

      if (key && !marked[index].has(key)) drawn.push(key);
      marked[index].clear();

      const reread = drawn.filter((at) => shown[index].has(at));

      for (const at of drawn) {
        view.read.authored.groups({ at });
        shown[index].add(at);
      }
      badges.rereads += reread.length;

      return reread;
    });

  return { draw, keys, stop: () => stops.forEach((stop) => stop()) };
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
  badges.named = 0;
  badges.rereads = 0;
};

const read = () => ({
  ...readLedgerWork(),
  ...readCoreWork(),
  badgeRereads: badges.rereads,
  namedBlocks: badges.named,
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
  const review = mountReview(a.editor, () => [CARET_LINE + 1]);
  const unmount = [review.stop, mountReceiver(b.editor)];
  const point = {
    offset: KEY_OFFSETS[key],
    path: [CARET_LINE + 1, 0],
  };

  a.editor.update((tx) => tx.selection.set({ anchor: point, focus: point }));
  send(a.doc, b.doc);
  review.draw();
  reset();
  press(a.editor, key);
  review.draw();

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

const KEY_COUNTERS = [
  'placesBuilt',
  'resolvedRuns',
  'comparedBlocks',
  'pairsCompared',
  'cardSummaries',
  'entriesScanned',
  'namedBlocks',
  'badgeRereads',
  'copiedSlots',
  'wholeReadNodes',
] as const;

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
const BLOCKS_PER_ARM = 500;

// A title and plain lines, then 500 paragraphs whose last `size` alice
// proposed one at a time with the oldest first or last, which make one card,
// then plain lines. Every arm holds as many blocks, since a deeper sequence
// copies more slots per key whatever the review holds.
const cardDocument = (size: number, oldest: 'first' | 'last') => [
  { children: [{ text: 'Title' }], type: 'title' },
  ...Array.from({ length: CARD_LINE }, (_, index) =>
    paragraph(`plain ${index}`)
  ),
  ...Array.from({ length: BLOCKS_PER_ARM }, (_, index) => {
    const nth = index - (BLOCKS_PER_ARM - size);

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
  const first = 1 + CARD_LINE + BLOCKS_PER_ARM - arm.size;
  const last = first + arm.size - 1;
  const point = {
    beside: { offset: 3, path: [last + 1, 0] },
    end: { offset: `proposed ${arm.size - 1}`.length, path: [last, 0] },
    inside: { offset: 3, path: [last, 0] },
    middle: { offset: 3, path: [first + Math.floor((arm.size - 1) / 2), 0] },
  }[arm.place];
  const review = mountReview(a.editor, () => [point.path[0]]);
  const unmount = [review.stop, mountReceiver(b.editor)];

  a.editor.update((tx) => tx.selection.set({ anchor: point, focus: point }));
  send(a.doc, b.doc);
  review.draw();
  reset();
  press(a.editor, arm.key);

  const rereads = review.draw();
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
  review.draw();

  const next = read();

  unmount.forEach((stop) => stop());
  a.cleanup();
  b.cleanup();

  return { keys: review.keys, local, next, remote, rereads };
};

describe("a key's work follows its edit, not the document", () => {
  it('visits as many mark records per typed letter after 200 old writes as after 20', () => {
    const workAt = (history: number) => {
      const doc = new Y.Doc();
      const seed = createEditor({ initialValue: [paragraph('z')] });
      const cleanupSeed = seed.install(
        yjs({ doc, initialReady: true, seed: true })
      );
      for (let old = 0; old < history; old++) {
        const bold = old % 2 === 0;
        seed.update((tx) => {
          tx.selection.set({
            kind: 'text',
            anchor: { path: [0, 0], offset: 1 },
            focus: { path: [0, 0], offset: 1 },
          });
          tx.fragment.replace([{ text: 'x', ...(bold ? { bold } : {}) }]);
        });
        seed.update((tx) => {
          tx.selection.set({
            kind: 'text',
            anchor: { path: [0, 0], offset: 1 },
            focus: bold
              ? { path: [0, 1], offset: 1 }
              : { path: [0, 0], offset: 2 },
          });
          tx.fragment.delete();
        });
      }
      assert.deepEqual(seed.read.children(), [paragraph('z')]);
      cleanupSeed();
      const joined = new Y.Doc();
      send(doc, joined);
      const editors = [doc, joined].map((document) => {
        const editor = createEditor({ initialValue: [paragraph('z')] });
        return {
          editor,
          cleanup: editor.install(yjs({ doc: document, initialReady: true })),
        };
      });
      try {
        return [0, 1, 2].map((letter) => {
          resetCoreWork();
          editors[0].editor.update.text.insert('x', {
            at: { path: [0, 0], offset: letter + 1 },
          });
          const local = readCoreWork().yjsMarkRecordsVisited;
          resetCoreWork();
          send(doc, joined);
          const remote = readCoreWork().yjsMarkRecordsVisited;
          for (const instance of editors) {
            assert.deepEqual(instance.editor.read.children(), [
              paragraph(`z${'x'.repeat(letter + 1)}`),
            ]);
          }
          return { local, remote };
        });
      } finally {
        for (const instance of editors) instance.cleanup();
        doc.destroy();
        joined.destroy();
      }
    };
    const small = workAt(20);
    const large = workAt(200);
    assert.ok(small.every(({ local, remote }) => local > 0 && remote > 0));
    assert.deepEqual(large, small);
  });

  for (const intent of ['edit', 'propose'] as const) {
    for (const key of [
      'letter',
      'initial',
      'final',
      'backspace',
      'enter',
    ] as const) {
      it(`${intent} ${key}`, () => {
        const base = keyWork(intent, key, {
          blocks: 96,
          records: 0,
          suggestions: 50,
        });
        const records = keyWork(intent, key, {
          blocks: 96,
          records: 2000,
          suggestions: 50,
        });

        const large = keyWork(intent, key, {
          blocks: 992,
          records: 0,
          suggestions: 50,
        });
        const one = keyWork(intent, key, {
          blocks: 96,
          records: 0,
          suggestions: 1,
        });

        console.info(
          JSON.stringify({
            key: `${intent} ${key}`,
            work: Object.fromEntries(
              KEY_COUNTERS.map((counter) => [
                counter,
                [base, large, one].map(({ local }) => local[counter]),
              ])
            ),
          })
        );
        assert.deepEqual(
          {
            'at 992 blocks': differing(large, base),
            'with one suggestion': differing(one, base),
            'at 2,000 records against 200': differing(
              records,
              keyWork(intent, key, {
                blocks: 96,
                records: 200,
                suggestions: 50,
              })
            ),
            'builds no facts at 2,000 records': differing(records, base, [
              'contextHops',
              'contextsMinted',
              'documentFacts',
              'recordsCopied',
            ]),
          },
          {
            'at 992 blocks': {},
            'with one suggestion': {},
            'at 2,000 records against 200': {},
            'builds no facts at 2,000 records': {},
          }
        );
      });
    }
  }
});

// Each join leaves the joined-away line as a hidden root child, since the line
// it joined shows its text by reference.
const enterAfterJoinsWork = (blocks: number) => {
  const a = peer(new Y.Doc(), 'alice', 'edit', {
    children: [
      { children: [{ text: 'Title' }], type: 'title' },
      ...Array.from({ length: blocks - 1 }, (_, index) =>
        paragraph(plainLine(index))
      ),
    ],
  });
  const joined = new Y.Doc();

  send(a.doc, joined);

  const b = peer(joined, 'bob', 'edit');
  const unmount = mountReceiver(b.editor);

  for (let line = blocks - 50; line > 0; line -= 100) {
    const point = { offset: 0, path: [line, 0] };

    a.editor.update((tx) => tx.selection.set({ anchor: point, focus: point }));
    press(a.editor, 'backspace');
    send(a.doc, b.doc);
  }

  const remote = [0, 1].map(() => {
    const last = a.editor.read.children().length - 1;
    const point = { offset: 3, path: [last, 0] };

    a.editor.update((tx) => tx.selection.set({ anchor: point, focus: point }));
    send(a.doc, b.doc);
    press(a.editor, 'enter');
    reset();
    send(a.doc, b.doc);

    return read();
  });

  assert.deepEqual(
    b.editor.read.children(),
    a.editor.read.children(),
    'the peer received the joins and the Enters'
  );
  unmount();
  a.cleanup();
  b.cleanup();

  return remote;
};

describe('a remote Enter after Editing joins', () => {
  it('reads as much at 992 lines with ten joins as at 96 with one', () => {
    const small = enterAfterJoinsWork(96);
    const large = enterAfterJoinsWork(992);

    console.info(JSON.stringify({ large, small }));
    assert.deepEqual(
      large.map((work, index) =>
        Object.fromEntries(
          (Object.keys(work) as Array<keyof typeof work>)
            .filter((counter) => work[counter] !== small[index][counter])
            .map((counter) => [
              counter,
              `${small[index][counter]} -> ${work[counter]}`,
            ])
        )
      ),
      [{}, {}]
    );
  });
});

describe("a card's walks follow the key, not the card", () => {
  for (const place of ['inside', 'beside'] as const) {
    it(`the card's author typing ${place} it`, () => {
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
          cardKeyWork({ ...arm, size: 500 } as const),
          cardKeyWork({ ...arm, size: 2 } as const)
        ),
        {},
        'at 500 changes against two'
      );
    });
  }

  for (const oldest of ['first', 'last'] as const) {
    it(`another author's key splitting it, the oldest change ${oldest}`, () => {
      const size = 500;
      const work = cardKeyWork({
        author: 'bob',
        key: 'letter',
        oldest,
        place: 'middle',
        size,
      });
      const farHalfAndBobsChange = size / 2 + 1;

      assert.deepEqual(
        [work.local.cardWalks, work.remote.cardWalks, work.next.cardWalks],
        [farHalfAndBobsChange, farHalfAndBobsChange, 0]
      );
    });
  }

  it("the card's author proposing a new paragraph at its end", () => {
    const work = cardKeyWork({
      author: 'alice',
      key: 'enter',
      oldest: 'first',
      place: 'end',
      size: 500,
    });

    assert.deepEqual([work.local.cardWalks, work.remote.cardWalks], [0, 0]);
  });

  for (const key of ['letter', 'backspace'] as const) {
    it(`rereads only the typed badge for a ${key} at the end of a card of 500 blocks`, () => {
      const work = cardKeyWork({
        author: 'alice',
        key,
        oldest: 'first',
        place: 'end',
        size: 500,
      });

      assert.deepEqual(
        work.rereads,
        work.keys.map((typed) => [typed])
      );
    });
  }
});

const c = schema.content;
const Nested = defineEditorSchema('s6-nested', {
  elements: {
    paragraph: schema.element.textBlock(),
    quote: {
      content: c.types(['paragraph', 'quote'], {
        default: { type: 'paragraph' },
        min: 1,
      }),
    },
  },
  id: 's6-nested',
  root: c.any([c.type('paragraph'), c.type('quote')], {
    default: { type: 'paragraph' },
    min: 1,
  }),
  unknown: 'reject',
  version: 1,
});

type Block = Readonly<Record<string, unknown>>;

const by = (author: string, kind: string, extra: object = {}) => ({
  at: 1,
  author,
  change: `${author}:1`,
  kind,
  ...extra,
});
const follows = (change: string) => ({ follows: JSON.stringify([change, 1]) });
const line = (text: string, authored?: object[]): Block => ({
  children: [{ text }],
  type: 'paragraph',
  ...(authored ? { authored } : {}),
});
const quote = (...children: Block[]): Block => ({ children, type: 'quote' });
const lines = (
  count: number,
  at: (index: number) => Block | null = () => null
) => Array.from({ length: count }, (_, index) => at(index) ?? line('tail'));
const leaves = (...children: object[]): Block => ({
  children,
  type: 'paragraph',
});

const caret = (path: readonly number[], offset: number) => ({
  anchor: { offset, path: [...path] },
  focus: { offset, path: [...path] },
});
const typeAt =
  (path: (n: number) => readonly number[], offset: number) =>
  (editor: Editor, n: number) =>
    editor.update((tx) => {
      tx.selection.set(caret(path(n), offset));
      tx.command(editorCommands.insertText, { text: 'k' });
    });
const removeAt =
  (
    path: (n: number) => readonly number[],
    offset: number,
    direction: 'backward' | 'forward'
  ) =>
  (editor: Editor, n: number) =>
    editor.update((tx) => {
      tx.selection.set(caret(path(n), offset));
      tx.command(editorCommands.delete, { direction, unit: 'character' });
    });
const breakAt =
  (path: (n: number) => readonly number[], offset: number) =>
  (editor: Editor, n: number) =>
    editor.update((tx) => {
      tx.selection.set(caret(path(n), offset));
      tx.break.insert();
    });
const suggesting =
  (write: (editor: Editor, n: number) => void) =>
  (editor: Editor, n: number) => {
    editor.api.authored.setView({ intent: 'propose' });
    write(editor, n);
  };

type Cohort = Readonly<{
  doc: (n: number) => Block[];
  /** Work before the warm key, such as another far Suggesting key. */
  setup?: (editor: Editor, n: number) => void;
  /** A key that warms the views, when the measured key cannot repeat. */
  warm?: (editor: Editor, n: number) => void;
  key: (editor: Editor, n: number) => void;
  typed: (n: number, preview: Preview) => readonly number[];
  /** False for a key no preview watches. */
  views?: false;
}>;

const unwatched = { draw: (): ViewKey[][] => [], keys: [], stop: () => {} };

const nestedWork = (cohort: Cohort, intent: Intent, n: number) => {
  let ids = 0;
  const editor = createEditor({
    initialValue: structuredClone(cohort.doc(n)) as never,
    plugins: [
      Nested,
      createAuthoredPlugin({
        authorId: 'dave',
        createChangeId: () => `dave:${(ids += 1)}`,
        intent,
        now: () => 2,
      }),
    ],
    // The helpers take the titled editor's type and read nothing its schema
    // decides.
  }) as unknown as Editor;
  const refusals: unknown[] = [];
  const stopRefusals = editor.api.authored.subscribeRefusals((refusal) =>
    refusals.push(refusal)
  );

  cohort.setup?.(editor, n);
  editor.api.authored.setView({ intent });

  const review =
    cohort.views === false
      ? unwatched
      : mountReview(editor, (preview) => cohort.typed(n, preview));

  (cohort.warm ?? cohort.key)(editor, n);
  review.draw();

  const before = editor.read.children();

  reset();
  cohort.key(editor, n);

  const rereads = review.draw();
  const work = read();

  review.stop();
  stopRefusals();
  assert.deepEqual(refusals, [], 'no key was refused');
  assert.notDeepEqual(editor.read.children(), before, 'the key wrote');

  return { keys: review.keys, rereads, work };
};

type NestedWork = ReturnType<typeof nestedWork>['work'];

const sameAt = (
  small: NestedWork,
  large: NestedWork,
  counters: ReadonlyArray<keyof NestedWork>
) =>
  Object.fromEntries(
    counters
      .filter((counter) => small[counter] !== large[counter])
      .map((counter) => [counter, `${small[counter]} -> ${large[counter]}`])
  );

const report = (name: string, sizes: readonly number[], works: NestedWork[]) =>
  console.info(
    JSON.stringify({
      name,
      sizes,
      work: Object.fromEntries(
        (Object.keys(works[0]) as Array<keyof NestedWork>)
          .filter((counter) => works.some((work) => work[counter] !== 0))
          .map((counter) => [counter, works.map((work) => work[counter])])
      ),
    })
  );

const followerDoc = (n: number, far: Block | null = null) => [
  line('before'),
  quote(
    line('aa'),
    line('bb', [by('bob', 'delete')]),
    line('ff', [by('carol', 'split', follows('alice:1'))]),
    line('cc', [by('alice', 'join')]),
    ...lines(n - 4, (index) => (index === n - 10 ? far : null))
  ),
  line('after'),
];
const inFollower = typeAt(() => [1, 2, 0], 1);
const inQuote = () => [1];

const WINDOWS: Readonly<Record<string, Cohort>> = {
  alone: { doc: (n) => followerDoc(n), key: inFollower, typed: inQuote },
  "beside another author's far insertion": {
    doc: (n) =>
      followerDoc(
        n,
        leaves(
          { text: 'ta' },
          { authored: [by('erin', 'insert')], text: 'zz' },
          { text: 'il' }
        )
      ),
    key: inFollower,
    typed: inQuote,
  },
  'after a far Suggesting key': {
    doc: (n) => followerDoc(n),
    key: inFollower,
    setup: suggesting(typeAt((n) => [1, n - 10, 0], 2)),
    typed: inQuote,
  },
  'beside another far pending join': {
    doc: (n) => followerDoc(n, line('jj', [by('gina', 'join')])),
    key: inFollower,
    typed: inQuote,
  },
  "beside a pending move's linked copy": {
    doc: (n) => [
      line('before'),
      quote(line('aa'), line('mm'), line('bb'), ...lines(n - 3)),
      line('after'),
    ],
    key: typeAt(() => [1, 0, 0], 1),
    setup: suggesting((editor) =>
      editor.update((tx) => tx.nodes.move({ at: [1, 1], to: [1, 3] }))
    ),
    typed: inQuote,
  },
};

const WINDOW_COUNTERS = [
  'comparedNodes',
  'factNodes',
  'joinScans',
  'levelBuilds',
  'levelSlots',
  'orderSegments',
  'resolvedNodes',
] as const;

describe("a follower window's work follows the window, not its quote", () => {
  for (const [name, cohort] of Object.entries(WINDOWS)) {
    for (const intent of ['edit', 'propose'] as const) {
      it(`${intent} ${name}`, () => {
        const [small, large] = [96, 4992].map(
          (n) => nestedWork(cohort, intent, n).work
        );

        report(`${intent} ${name}`, [96, 4992], [small, large]);
        assert.ok(
          small.levelSlots > 0,
          "the key went through the quote's level"
        );
        assert.deepEqual(
          sameAt(small, large, WINDOW_COUNTERS),
          {},
          'at 4,992 children against 96'
        );
      });
    }
  }

  it('reports the window of a follower moved far from its join', () => {
    const cohort: Cohort = {
      doc: (n) => [
        line('before'),
        quote(
          line('aa'),
          line('cc', [by('alice', 'join')]),
          ...lines(n - 3),
          line('ff', [by('carol', 'split', follows('alice:1'))])
        ),
        line('after'),
      ],
      key: typeAt((n) => [1, n - 1, 0], 1),
      typed: inQuote,
    };

    for (const intent of ['edit', 'propose'] as const) {
      const works = [96, 992].map((n) => nestedWork(cohort, intent, n).work);

      report(`${intent} a follower moved far from its join`, [96, 992], works);
      assert.ok(works.every((work) => work.windowSlots > 0));
    }
  });
});

describe("a place read in an ordered run follows the read, not the run's order", () => {
  // Erin's quote follows Alice's pending join on `end`, and each `f` line in
  // it is a split that follows the join on the `t` line after it, so the
  // quote's run order holds a segment for each line.
  const splitsDoc = (n: number) => [
    line('head'),
    {
      ...quote(
        ...Array.from({ length: n / 3 }, (_, index) => [
          line(`a${index}`),
          line(`f${index}`, [by(`b${index}`, 'split', follows(`j${index}:1`))]),
          line(`t${index}`, [by(`j${index}`, 'join')]),
        ]).flat()
      ),
      authored: [
        by('erin', 'insert', { change: '~edit:erin', ...follows('alice:1') }),
      ],
    },
    line('end', [by('alice', 'join')]),
  ];
  const changesAt = (n: number) => {
    const editor = createEditor({
      initialValue: splitsDoc(n) as never,
      plugins: [Nested, createAuthoredPlugin({ authorId: 'dave' })],
    });
    const view = createEditorView(editor, {
      authored: { preview: 'proposed' },
    });
    const key = getDefined(view.key([1, 1]));

    view.read.authored.groups({ at: key });
    reset();

    const ids = view.read.authored
      .changes({ at: key })
      .items.map(({ id }) => id);

    return { ids, work: read() };
  };

  it('reads the changes of the first split under Proposed in a quote of 992 children as in one of 96', () => {
    const [small, large] = [96, 992].map(changesAt);

    report(
      'a warmed Proposed read of one split',
      [96, 992],
      [small.work, large.work]
    );
    assert.deepEqual(
      [small.ids, large.ids],
      [['b0:1'], ['b0:1']],
      'the read names the first split'
    );
    assert.ok(
      small.work.orderSegments > 0,
      "the read went through the run's order"
    );
    assert.deepEqual(
      sameAt(small.work, large.work, WINDOW_COUNTERS),
      {},
      'at 992 children against 96'
    );
  });

  const typeOver = (offset: number) => (editor: Editor) =>
    editor.update((tx) => {
      tx.selection.set({
        anchor: { offset, path: [3, 2] },
        focus: { offset: offset + 2, path: [3, 2] },
      });
      tx.command(editorCommands.insertText, { text: 'k' });
    });
  // Bob's line follows Alice's join, so the writer's view shows it inside
  // the quote, above Carol's insertion.
  const movedLine: Cohort = {
    doc: (letters) => [
      quote(line('ab')),
      line('c', [by('alice', 'join')]),
      {
        ...leaves({ authored: [by('carol', 'insert')], text: 'carol' }),
        authored: [by('carol', 'insert')],
      },
      {
        ...leaves(
          { text: 'a' },
          { authored: [by('erin', 'delete')], text: 'y'.repeat(letters) },
          { text: `bc${'x'.repeat(letters)}` }
        ),
        authored: [by('bob', 'split', follows('alice:1'))],
      },
    ],
    key: typeOver(0),
    typed: () => [0],
    views: false,
    warm: typeOver(8),
  };

  for (const intent of ['edit', 'propose'] as const) {
    it(`${intent} typing over two letters of a moved line after 10,000 struck letters and before 10,000 plain ones as after and before 1,000`, () => {
      const [small, large] = [1000, 10_000].map(
        (letters) => nestedWork(movedLine, intent, letters).work
      );

      report(
        `${intent} typing over two moved letters`,
        [1000, 10_000],
        [small, large]
      );
      assert.ok(small.orderSegments > 0, 'the key placed a range in the order');
      assert.deepEqual(
        sameAt(small, large, WINDOW_COUNTERS),
        {},
        'at 10,000 letters against 1,000'
      );
    });
  }
});

const quoteDoc = (n: number) => [
  line('before'),
  quote(...lines(n)),
  line('after'),
];

describe('counted keys whose work follows the container', () => {
  const edges: Readonly<Record<string, Cohort>> = {
    'Backspace at the start of the block after a quote': {
      doc: quoteDoc,
      key: removeAt(() => [2, 0], 0, 'backward'),
      typed: () => [1],
      warm: typeAt(() => [2, 0], 5),
    },
    "Delete at a quote's end": {
      doc: quoteDoc,
      key: removeAt((n) => [1, n - 1, 0], 4, 'forward'),
      typed: () => [1],
      warm: typeAt(() => [2, 0], 5),
    },
  };

  for (const [name, cohort] of Object.entries(edges)) {
    for (const intent of ['edit', 'propose'] as const) {
      it(`${intent} ${name}`, () => {
        const works = [96, 4992].map((n) => nestedWork(cohort, intent, n).work);

        report(`${intent} ${name}`, [96, 4992], works);
        assert.ok(works.every((work) => work.wholeReadNodes > 0));
        assert.ok(works.every((work) => work.diffedNodes > 0));
      });
    }
  }

  const deletions: Cohort = {
    doc: (marks) => [
      quote(
        line('aa'),
        line('ff', [by('carol', 'split', follows('alice:1'))]),
        line('cc', [by('alice', 'join')]),
        ...lines(4992, (index) =>
          index < marks
            ? leaves(
                { text: 'ta' },
                {
                  authored: [by('erin', 'delete', { change: `erin:${index}` })],
                  text: 'zz',
                },
                { text: 'il' }
              )
            : null
        )
      ),
    ],
    key: typeAt(() => [0, 1, 0], 1),
    typed: () => [0],
  };

  for (const intent of ['edit', 'propose'] as const) {
    it(`${intent} a key in a quote of 1 and 992 separate pending deletions`, () => {
      const works = [1, 992].map(
        (marks) => nestedWork(deletions, intent, marks).work
      );

      report(
        `${intent} a key among separate pending deletions`,
        [1, 992],
        works
      );
      assert.ok(works.every((work) => work.claimKeys > 0));
    });
  }
});

const unwrapDoc = (n: number, fourth?: Block) => [
  {
    authored: [by('alice', 'unwrap')],
    children: Array.from(
      { length: n },
      (_, index) =>
        (index === 3 ? fourth : undefined) ??
        leaves(
          { text: `p${index}` },
          { authored: [by(`c${index}`, 'insert')], text: '+' }
        )
    ),
    type: 'quote',
  },
];
// Proposed lifts the children; Accepted shows the quote, which holds them.
const lifted = (_n: number, preview: Preview) =>
  preview === 'proposed' ? [3] : [0];
// Under a pending unwrap the slots the core copies on each key grow faster
// than the quote's children, so the larger quote stops at 500 children to
// keep the file inside its timeout.
const UNWRAP_SIZES = [96, 500];

describe('a key under a pending unwrap rereads only its own badge', () => {
  // With the nodes each key writes: the whole quote for a letter, and nothing
  // for an Enter, which resolves.
  const keys: Readonly<
    Record<string, Readonly<{ cohort: Cohort; written: (n: number) => number }>>
  > = {
    letter: {
      cohort: {
        doc: (n) => unwrapDoc(n),
        key: typeAt(() => [0, 3, 0], 1),
        typed: lifted,
      },
      written: (n) => 3 * n + 3,
    },
    Enter: {
      cohort: {
        doc: (n) => unwrapDoc(n),
        key: breakAt(() => [0, 3, 0], 1),
        typed: lifted,
        warm: typeAt(() => [0, 3, 0], 1),
      },
      written: () => 0,
    },
  };

  for (const [name, { cohort, written }] of Object.entries(keys)) {
    it(`a Suggesting ${name} in the fourth child`, () => {
      const works = UNWRAP_SIZES.map((n) => nestedWork(cohort, 'propose', n));

      report(
        `Suggesting ${name} under an unwrap`,
        UNWRAP_SIZES,
        works.map(({ work }) => work)
      );
      assert.deepEqual(
        works.map(({ work }) => work.writtenNodes),
        UNWRAP_SIZES.map(written),
        'writes the whole quote for a letter and nothing for an Enter'
      );
      for (const { keys: typed, rereads } of works) {
        assert.deepEqual(
          rereads.map((reread) => reread.filter((key) => !typed.includes(key))),
          [[], []],
          'only the typed block rereads'
        );
      }
    });
  }

  it('names only the fourth child for an Editing key that regroups its change', () => {
    const regroup: Cohort = {
      doc: (n) =>
        unwrapDoc(
          n,
          leaves(
            { authored: [by('carol', 'insert')], text: 'a' },
            { text: 'xy' },
            {
              authored: [by('carol', 'insert', { change: 'carol:2' })],
              text: 'b',
            }
          )
        ),
      key: removeAt(() => [0, 3, 1], 1, 'backward'),
      typed: lifted,
      warm: removeAt(() => [0, 3, 1], 2, 'backward'),
    };

    for (const n of UNWRAP_SIZES) {
      const { keys: typed, rereads } = nestedWork(regroup, 'edit', n);

      assert.deepEqual(
        rereads,
        typed.map((key) => [key]),
        `at ${n} children`
      );
    }
  });
});

describe("a card's reads follow the key, not the card", () => {
  // A quote whose unmarked first paragraph is followed by `members`
  // paragraphs Bob proposed, which make one card.
  const oneCard: Cohort = {
    doc: (members) => [
      quote(
        line('lead'),
        ...Array.from({ length: members }, (_, index) => {
          const insert = by('bob', 'insert', { change: `bob:${index + 1}` });

          return {
            authored: [insert],
            children: [{ authored: [insert], text: 'x' }],
            type: 'paragraph',
          };
        })
      ),
    ],
    key: typeAt(() => [0, 0, 0], 2),
    typed: () => [0, 0],
  };

  for (const intent of ['edit', 'propose'] as const) {
    it(`${intent} in the unmarked paragraph of a quote holding one card of 250 and of 2,000`, () => {
      const [small, large] = [250, 2000].map(
        (members) => nestedWork(oneCard, intent, members).work
      );

      report(`${intent} beside one card`, [250, 2000], [small, large]);
      assert.ok(small.cardSummaries > 0, 'the draw read a card');
      assert.deepEqual(
        sameAt(small, large, ['cardSummaries', 'entriesScanned']),
        {}
      );
    });
  }

  const MOUNT_NAMES = {
    each: 'one card each',
    hidden: 'a deleted paragraph after each',
    shared: 'one shared card',
  };

  const mount = (count: number, cohort: keyof typeof MOUNT_NAMES) => {
    const marked = (mark: object) => ({
      authored: [mark],
      children: [{ authored: [mark], text: 'x' }],
      type: 'paragraph',
    });
    const editor = createEditor({
      initialValue: [
        {
          authored: [by('alice', 'unwrap')],
          children: Array.from({ length: count }, (_, index) => {
            if (cohort === 'each') return [marked(by(`c${index}`, 'insert'))];

            const insert = marked(
              by('bob', 'insert', { change: `bob:${index + 1}` })
            );

            return cohort === 'hidden'
              ? [insert, marked(by(`d${index}`, 'delete'))]
              : [insert];
          }).flat(),
          type: 'quote',
        },
      ] as never,
      plugins: [Nested, createAuthoredPlugin({ authorId: 'zed' })],
    });
    const view = createEditorView(editor, {
      authored: { preview: 'proposed' },
    });
    const blocks = view.read.children();

    assert.equal(blocks.length, count, 'the preview lifts every child');
    resetLedgerWork();

    const cards = blocks.map((_, index) =>
      view.read.authored
        .groups({ at: getDefined(view.key([index])) })
        .map(({ id }) => id)
    );
    const { entriesScanned, hiddenBlocks, occurrencesVisited } =
      readLedgerWork();

    return { cards, entriesScanned, hiddenBlocks, occurrencesVisited };
  };

  for (const cohort of ['each', 'shared', 'hidden'] as const) {
    it(`mounts N badges under a Proposed unwrap with ${MOUNT_NAMES[cohort]} within a log factor of N per badge`, () => {
      const [small, large] = [64, 1024].map((count) => mount(count, cohort));
      const bound = Math.log2(1024) / Math.log2(64);

      console.info(
        JSON.stringify({
          cohort,
          sizes: [64, 1024],
          small: { ...small, cards: undefined },
          large: { ...large, cards: undefined },
        })
      );
      assert.ok(
        large.cards.every((ids) => ids.length === 2 && ids[0] === 'alice:1')
      );
      assert.ok(small.occurrencesVisited > 0, 'the mount read occurrences');
      if (cohort === 'hidden') {
        assert.ok(small.hiddenBlocks > 0, 'the mount read hidden blocks');
      }
      for (const counter of [
        'entriesScanned',
        'hiddenBlocks',
        'occurrencesVisited',
      ] as const) {
        assert.ok(
          large[counter] / 1024 <= (small[counter] / 64) * bound,
          `${counter} per badge ${small[counter] / 64} at 64 and ${large[counter] / 1024} at 1,024`
        );
      }
    });
  }
});

describe('a dormant preview adds no work as the document grows', () => {
  for (const intent of ['edit', 'propose'] as const) {
    it(`${intent} with an Accepted preview indexed and then unsubscribed`, () => {
      const dormant: Cohort = {
        doc: (n) => [line('lead'), quote(...lines(n - 2)), line('after')],
        key: typeAt(() => [0, 0], 2),
        setup: (editor) => {
          const view = createEditorView(editor, {
            authored: { preview: 'accepted' as const },
          });

          view.read.children();
          view.api.authored.subscribeChanges(() => {})();
        },
        typed: () => [0],
        views: false,
      };
      const [small, large] = [96, 4992].map(
        (n) => nestedWork(dormant, intent, n).work
      );

      report(
        `${intent} a dormant Accepted preview`,
        [96, 4992],
        [small, large]
      );
      assert.deepEqual(
        sameAt(small, large, Object.keys(small) as Array<keyof NestedWork>),
        {}
      );
    });
  }
});

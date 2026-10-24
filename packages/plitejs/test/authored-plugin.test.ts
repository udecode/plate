import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  ContentSlice,
  createEditor,
  createEditorView,
  defineCommand,
  defineEditorSchema,
  editorCommands,
  type EditorUpdateTransaction,
  property,
  schema,
  SelectionApi,
  target as nodeTarget,
  transfer,
} from 'plitejs';
import * as authoredEntry from 'plitejs/authored';

import type {
  AuthoredChangesDelta,
  AuthoredRefusal,
  AuthoredView,
} from '../src/authored';
import { createAuthoredPlugin } from '../src/authored/authored';
import { readLedgerWork, resetLedgerWork } from '../src/authored/ledger/work';
import { evaluateCommand } from '../src/core/command-registry';
import { applyTransactionSpec } from '../src/core/public-state';
import { setEditorComposing } from '../src/internal';
import { reviewedValue, reviewRecords } from './support/authored';

const Blocks = defineEditorSchema('authored-plugin-blocks', {
  elements: {
    heading: schema.element.textBlock(),
    paragraph: schema.element.textBlock(),
  },
  id: 'authored-plugin-blocks',
  root: schema.content.types(['paragraph', 'heading'], {
    default: { type: 'paragraph' },
    min: 1,
  }),
  unknown: 'reject',
  version: 1,
});

const Quotes = defineEditorSchema('authored-plugin-quotes', {
  elements: {
    paragraph: schema.element.textBlock(),
    quote: { content: schema.content.type('paragraph', { min: 1 }) },
  },
  id: 'authored-plugin-quotes',
  properties: [
    schema.textProperty('bold', property.boolean()),
    schema.elementProperty('cite', property.string(), {
      target: nodeTarget.type('quote'),
    }),
  ],
  root: schema.content.types(['paragraph', 'quote'], {
    default: { type: 'paragraph' },
    min: 1,
  }),
  unknown: 'reject',
  version: 1,
});

const Tables = defineEditorSchema('authored-plugin-tables', {
  elements: {
    cell: { content: schema.content.type('paragraph', { min: 1 }) },
    paragraph: schema.element.textBlock(),
    row: { content: schema.content.type('cell', { min: 1 }) },
    table: { content: schema.content.type('row', { min: 1 }) },
  },
  id: 'authored-plugin-tables',
  root: schema.content.types(['paragraph', 'table'], {
    default: { type: 'paragraph' },
    min: 1,
  }),
  unknown: 'reject',
  version: 1,
});

const mark = (
  change: string,
  kind: 'delete' | 'insert' | 'join' | 'split',
  at: number,
  author = 'carol'
) => ({ at, author, change, kind });

const format = (change: string, at: number) => ({
  at,
  author: 'carol',
  before: 'paragraph',
  change,
  id: `${change}:type`,
  key: 'type',
  kind: 'format',
  write: { kind: 'set', value: 'heading' },
});

// "Keep old new text more": carol replaces "old" with "new", dave adds " more".
const start = [
  {
    children: [
      { text: 'Keep ' },
      { authored: [mark('carol:1', 'delete', 1)], text: 'old' },
      { authored: [mark('carol:2', 'insert', 2)], text: 'new' },
      { text: ' text' },
      { authored: [mark('dave:3', 'insert', 3, 'dave')], text: ' more' },
    ],
    type: 'paragraph',
  },
];

const make = (intent: 'edit' | 'propose' = 'edit') => {
  const editor = createEditor({
    initialValue: structuredClone(start) as never,
    plugins: [
      Blocks,
      createAuthoredPlugin({
        authorId: 'bob',
        createChangeId: () => 'bob:1',
        intent,
        now: () => 10,
      }),
    ],
  });
  const authored = editor as unknown as {
    api: {
      authored: {
        setView: (view: AuthoredView) => void;
        subscribeChanges: (
          listener: (delta: AuthoredChangesDelta) => void
        ) => () => void;
      };
    };
    read: { authored: Record<string, (...args: any[]) => any> };
  };

  return { authored, editor };
};

const run = (
  editor: ReturnType<typeof make>['editor'],
  write: (tx: EditorUpdateTransaction & { authored: any }) => unknown
) => {
  let result: unknown;

  editor.update((tx) => {
    result = write(tx as never);
  });

  return result;
};

const textOf = (value: readonly unknown[]) =>
  (value as Array<{ children: Array<{ text: string }> }>)
    .map((block) => block.children.map((child) => child.text).join(''))
    .join('\n');

const caret = (path: number[], offset: number) => ({
  anchor: { offset, path },
  focus: { offset, path },
});

const suggesting = (lines: readonly unknown[]) => {
  let count = 0;
  const editor = createEditor({
    initialValue: lines.map((line) =>
      typeof line === 'string'
        ? { children: [{ text: line }], type: 'paragraph' }
        : line
    ) as never,
    plugins: [
      Blocks,
      createAuthoredPlugin({
        authorId: 'alice',
        createChangeId: () => `alice:${(count += 1)}`,
        intent: 'propose',
        now: () => 1,
      }),
    ],
  });
  const { read } = editor as unknown as ReturnType<typeof make>['authored'];

  return {
    cards: (at: number[]): Array<[string, number]> =>
      read.authored
        .groups({ at })
        .map(({ changeCount, id }: { changeCount: number; id: string }) => [
          id,
          changeCount,
        ]),
    editor,
  };
};

describe('authored plugin', () => {
  it('previews each projection without changing the stored document', () => {
    const { authored, editor } = make();
    const read = (view: AuthoredView) => {
      authored.api.authored.setView(view);
      return [authored.read.authored.view(), textOf(editor.read.children())];
    };

    assert.deepEqual(read({ preview: 'accepted' }), [
      { preview: 'accepted' },
      'Keep old text',
    ]);
    assert.equal(authored.read.authored.changes().items.length, 3);
    assert.deepEqual(read({ preview: 'proposed' }), [
      { preview: 'proposed' },
      'Keep new text more',
    ]);
    assert.deepEqual(read({ intent: 'propose' }), [
      { intent: 'propose' },
      'Keep oldnew text more',
    ]);
    assert.deepEqual(editor.read.children(), start);
  });

  it('switches the view once a composition ends, keeping the last switch asked for', async () => {
    const { authored, editor } = make();

    setEditorComposing(editor, true);
    authored.api.authored.setView({ intent: 'propose' });
    authored.api.authored.setView({ preview: 'proposed' });
    await Promise.resolve();

    assert.deepEqual(authored.read.authored.view(), { intent: 'edit' });

    setEditorComposing(editor, false);
    await Promise.resolve();

    assert.deepEqual(authored.read.authored.view(), { preview: 'proposed' });
  });

  it('reads pending changes by page, author, range, details and group', () => {
    const { authored } = make();
    const { read } = authored;
    const ids = (changes: ReadonlyArray<{ id: string }>) =>
      changes.map((change) => change.id);

    assert.deepEqual(ids(read.authored.changes().items), [
      'carol:1',
      'carol:2',
      'dave:3',
    ]);
    assert.deepEqual(ids(read.authored.changes({ authorId: 'dave' }).items), [
      'dave:3',
    ]);

    const first = read.authored.changes({ limit: 1 });

    assert.deepEqual(ids(first.items), ['carol:1']);
    assert.deepEqual(
      ids(read.authored.changes({ cursor: first.cursor, limit: 2 }).items),
      ['carol:2', 'dave:3']
    );
    assert.throws(
      () => read.authored.changes({ authorId: 'dave', cursor: first.cursor }),
      /Stale authored page cursor/
    );
    assert.deepEqual(
      ids(
        read.authored.changes({
          at: {
            anchor: { offset: 1, path: [0, 2] },
            focus: { offset: 2, path: [0, 2] },
          },
        }).items
      ),
      ['carol:2']
    );
    assert.deepEqual(ids(read.authored.changes({ group: 'carol:2' }).items), [
      'carol:1',
      'carol:2',
    ]);
    assert.deepEqual(read.authored.details('carol:1').parts, [
      {
        action: 'delete',
        after: null,
        before: { content: [{ text: 'old' }], openEnd: 0, openStart: 0 },
        kind: 'content',
        range: {
          anchor: { offset: 0, path: [0, 1] },
          focus: { offset: 3, path: [0, 1] },
        },
      },
    ]);
    assert.deepEqual(
      read.authored
        .groups({ at: [0] })
        .map((group: { changeCount: number; id: string }) => [
          group.id,
          group.changeCount,
        ]),
      [
        ['carol:1', 2],
        ['dave:3', 1],
      ]
    );
    assert.equal(read.authored.groupOf('carol:2')?.id, 'carol:1');
  });

  it('reads the changes at a place and in a card together', () => {
    const { authored } = make();

    assert.deepEqual(
      authored.read.authored
        .changes({ at: [0], group: 'carol:2' })
        .items.map((change: { id: string }) => change.id),
      ['carol:1', 'carol:2']
    );
  });

  it("reads the cards and changes at a place in its view's root", () => {
    const paragraph = (text: string, author: string, at: number) => ({
      children: [
        { authored: [mark(`${author}:1`, 'insert', at, author)], text },
      ],
      type: 'paragraph',
    });
    const editor = createEditor({
      initialValue: {
        children: [paragraph('main', 'alice', 1)],
        roots: { notes: [paragraph('note', 'bob', 2)] },
      } as never,
      plugins: [createAuthoredPlugin({ authorId: 'zed' })],
    });
    const notes = createEditorView(editor, { root: 'notes' }) as unknown as {
      read: ReturnType<typeof make>['authored']['read'];
    };
    const ids = (items: ReadonlyArray<{ id: string }>) =>
      items.map((item) => item.id);
    const range = {
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 2, path: [0, 0] },
    };

    assert.deepEqual(
      {
        changes: ids(notes.read.authored.changes({ at: [0] }).items),
        groups: ids(notes.read.authored.groups({ at: [0] })),
        range: ids(notes.read.authored.changes({ at: range }).items),
      },
      { changes: ['bob:1'], groups: ['bob:1'], range: ['bob:1'] }
    );
  });

  it('reads content that runs across an inline edge or fills a block as one part', () => {
    const insert = mark('ann:1', 'insert', 4, 'ann');
    const editor = createEditor({
      initialValue: [
        {
          children: [
            { text: 'Use ' },
            {
              children: [{ authored: [insert], text: 'links' }],
              type: 'link',
            },
            { text: '' },
            { authored: [insert], text: ' here' },
            { children: [{ text: '' }], type: 'mention' },
            { authored: [insert], text: 'after' },
          ],
          type: 'paragraph',
        },
        {
          authored: [insert],
          children: [{ authored: [insert], text: 'New line' }],
          type: 'paragraph',
        },
      ] as never,
      plugins: [
        defineEditorSchema('authored-plugin-inlines', {
          elements: {
            link: { content: schema.content.text(), inline: true },
            mention: { inline: true, void: 'inline' },
            paragraph: schema.element.textBlock(),
          },
          id: 'authored-plugin-inlines',
          root: schema.content.types(['paragraph'], {
            default: { type: 'paragraph' },
            min: 1,
          }),
          unknown: 'reject',
          version: 1,
        }),
        createAuthoredPlugin({ authorId: 'bob' }),
      ],
    });
    const read = (editor as unknown as ReturnType<typeof make>['authored']).read
      .authored;
    const inserted = read
      .details('ann:1')
      .parts.map(
        (part: { after: { content: unknown[] } }) => part.after.content
      );

    assert.deepEqual(inserted, [
      [{ text: 'links' }, { text: ' here' }],
      [{ text: 'after' }],
      [{ children: [{ text: 'New line' }], type: 'paragraph' }],
    ]);
    assert.equal(read.change('ann:1').ranges.length, 3);
  });

  it('reads a proposed Enter whose tail keeps its type as only a break, and still shows a type the title slot forces and a property set where none was', () => {
    const Titled = defineEditorSchema('authored-plugin-titled', {
      elements: {
        paragraph: schema.element.textBlock(),
        title: schema.element.textBlock(),
      },
      id: 'authored-plugin-titled',
      properties: [
        schema.elementProperty('tone', property.string(), {
          target: nodeTarget.type('paragraph'),
        }),
      ],
      root: schema.content.prefix(
        [{ element: 'title' }],
        schema.content.types(['paragraph'], { default: { type: 'paragraph' } })
      ),
      unknown: 'reject',
      version: 1,
    });
    const proposed = (write: (tx: EditorUpdateTransaction) => void) => {
      const editor = createEditor({
        initialValue: [
          { children: [{ text: 'Title' }], type: 'title' },
          { children: [{ text: 'Body' }], type: 'paragraph' },
        ] as never,
        plugins: [
          Titled,
          createAuthoredPlugin({
            authorId: 'alice',
            createChangeId: () => 'alice:1',
            intent: 'propose',
            now: () => 1,
          }),
        ],
      });

      editor.update(write);

      const { read } = editor as unknown as ReturnType<typeof make>['authored'];

      return {
        kind: read.authored.change('alice:1').kind,
        parts: read.authored
          .details('alice:1')
          .parts.map((part: { kind: string }) => part.kind),
      };
    };
    const enterAt = (path: number[]) => (tx: EditorUpdateTransaction) => {
      tx.selection.set(caret(path, 2));
      tx.break.insert();
    };

    assert.deepEqual(
      {
        body: proposed(enterAt([1, 0])),
        title: proposed(enterAt([0, 0])),
        tone: proposed((tx) =>
          tx.nodes.set({ tone: 'v' } as never, { at: [1] })
        ),
      },
      {
        body: { kind: 'structure', parts: ['boundary'] },
        title: { kind: 'mixed', parts: ['properties', 'boundary'] },
        tone: { kind: 'format', parts: ['properties'] },
      }
    );
  });

  it('reads a card of 2,100 touching changes as one summary', () => {
    // The oldest change sits mid-card.
    const editor = createEditor({
      initialValue: Array.from({ length: 2100 }, (_, index) => ({
        authored: [format(`run:${index}`, index === 1050 ? 1 : index + 2)],
        children: [{ text: 'x' }],
        type: 'heading',
      })) as never,
      plugins: [Blocks, createAuthoredPlugin({ authorId: 'bob' })],
    });
    const { read } = editor as unknown as ReturnType<typeof make>['authored'];

    assert.deepEqual(
      read.authored
        .groups({ at: [0] })
        .map((group: { changeCount: number; id: string }) => [
          group.id,
          group.changeCount,
        ]),
      [['run:1050', 2100]]
    );
  });

  it('keeps a change cursor once the change it names next is decided, and refuses it once neither change remains', () => {
    const { authored, editor } = make();
    const { read } = authored;
    const page = read.authored.changes({ limit: 1 });

    // The cursor names carol:2 next; deciding it leaves the last one read.
    run(editor, (tx) =>
      tx.authored.decide({
        action: 'accept',
        changes: [read.authored.change('carol:2')],
      })
    );
    assert.deepEqual(
      read.authored
        .changes({ cursor: page.cursor, limit: 1 })
        .items.map((change: { id: string }) => change.id),
      ['dave:3']
    );

    const { authored: other, editor: otherEditor } = make();
    const stale = other.read.authored.changes({ limit: 1 });

    run(otherEditor, (tx) =>
      tx.authored.decide({
        action: 'accept',
        groups: [other.read.authored.groupOf('carol:1')],
      })
    );
    assert.throws(
      () => other.read.authored.changes({ cursor: stale.cursor, limit: 1 }),
      /Stale authored page cursor/
    );
  });

  it('names a card by its oldest change in every editor and after a reload', () => {
    // The card's second change in the document is its oldest.
    const value = [
      {
        children: [
          { text: 'Keep ' },
          { authored: [mark('carol:a', 'insert', 2)], text: 'new' },
          { authored: [mark('carol:b', 'insert', 1)], text: ' words' },
        ],
        type: 'paragraph',
      },
    ];
    const open = (initialValue: unknown) =>
      (
        createEditor({
          initialValue: initialValue as never,
          plugins: [Blocks, createAuthoredPlugin({ authorId: 'bob' })],
        }) as unknown as ReturnType<typeof make>['authored']
      ).read.authored;
    const first = open(structuredClone(value));
    const second = open(structuredClone(value));
    const reloaded = open(JSON.parse(JSON.stringify(value)));

    assert.deepEqual(
      [first, second, reloaded].map((read) => read.groupOf('carol:a')?.id),
      ['carol:b', 'carol:b', 'carol:b']
    );
  });

  it('moves a card’s id to its next oldest change once its author withdraws the oldest', () => {
    const editor = createEditor({
      initialValue: [
        {
          children: [
            { text: 'Keep ' },
            { authored: [mark('carol:1', 'insert', 1)], text: 'old' },
            { authored: [mark('carol:2', 'insert', 2)], text: 'new' },
          ],
          type: 'paragraph',
        },
      ] as never,
      plugins: [
        Blocks,
        createAuthoredPlugin({ authorId: 'carol', intent: 'propose' }),
      ],
    });
    const { read } = editor as unknown as ReturnType<typeof make>['authored'];

    editor.update((tx) => {
      tx.text.delete({
        at: {
          anchor: { offset: 0, path: [0, 1] },
          focus: { offset: 3, path: [0, 1] },
          kind: 'text',
        },
      });
    });

    assert.equal(read.authored.groupOf('carol:2')?.id, 'carol:2');
  });

  const headings = (intent: 'edit' | 'propose') => {
    const editor = createEditor({
      initialValue: [
        {
          authored: [format('carol:1', 1)],
          children: [{ text: 'One' }],
          type: 'heading',
        },
        {
          authored: [format('carol:2', 2)],
          children: [{ text: 'Two' }],
          type: 'heading',
        },
      ] as never,
      plugins: [
        Blocks,
        createAuthoredPlugin({
          authorId: 'bob',
          createChangeId: () => 'bob:1',
          intent,
        }),
      ],
    });
    const { read } = editor as unknown as ReturnType<typeof make>['authored'];

    return {
      cardOfSecond: () => {
        const card = read.authored.groupOf('carol:2');

        return [card?.id, card?.changeCount];
      },
      editor,
    };
  };

  it('splits a card when an unmarked block lands between its blocks', () => {
    const { cardOfSecond, editor } = headings('edit');
    const joined = cardOfSecond();

    editor.update((tx) => {
      tx.nodes.insert(
        { children: [{ text: 'Plain' }], type: 'paragraph' },
        { at: [1] }
      );
    });

    assert.deepEqual(
      [joined, cardOfSecond()],
      [
        ['carol:1', 2],
        ['carol:2', 1],
      ]
    );
  });

  it('splits a card when another author’s change lands after its first block’s format', () => {
    const { cardOfSecond, editor } = headings('propose');
    const joined = cardOfSecond();

    editor.update((tx) => {
      tx.text.insert('!', { at: { offset: 3, path: [0, 0] } });
    });

    assert.deepEqual(
      [joined, cardOfSecond()],
      [
        ['carol:1', 2],
        ['carol:2', 1],
      ]
    );
  });

  it('keeps one card entry for a change that spreads into an earlier block', () => {
    const editor = createEditor({
      initialValue: [
        { children: [{ text: 'One' }], type: 'paragraph' },
        {
          children: [
            { text: 'Two' },
            { authored: [mark('carol:2', 'insert', 2)], text: ' more' },
          ],
          type: 'paragraph',
        },
      ] as never,
      plugins: [
        Blocks,
        createAuthoredPlugin({ authorId: 'carol', intent: 'propose' }),
      ],
    });
    const { read } = editor as unknown as ReturnType<typeof make>['authored'];

    editor.update((tx) => {
      (tx as typeof tx & { authored: any }).authored.propose({
        changeId: 'carol:2',
      });
      tx.text.insert('!', { at: { offset: 3, path: [0, 0] } });
    });

    assert.equal(read.authored.groupOf('carol:2')?.changeCount, 1);
  });

  it('keeps one card for deletions on both sides of a pending join', () => {
    const { cards, editor } = suggesting(['abc', 'def']);

    editor.update((tx) => {
      tx.selection.set(caret([1, 0], 0));
      tx.text.deleteBackward();
    });
    editor.update((tx) => {
      tx.selection.set(caret([0, 0], 3));
      tx.text.deleteBackward();
    });
    editor.update((tx) => {
      tx.text.delete({
        at: {
          anchor: { offset: 0, path: [1, 0] },
          focus: { offset: 1, path: [1, 0] },
        },
      });
    });

    assert.deepEqual(
      [cards([0]), cards([1])].map((line) => line.map(([id]) => id)),
      [['alice:1'], ['alice:1']]
    );
  });

  it('keeps one card for one author’s adjacent line insertions and deletions', () => {
    const { cards, editor } = suggesting(['Before', 'Mid', 'After']);
    const line = (text: string) => ({
      children: [{ text }],
      type: 'paragraph',
    });

    editor.update((tx) => {
      tx.nodes.insert(line('One'), { at: [1] });
    });
    editor.update((tx) => {
      tx.nodes.insert(line('Two'), { at: [3] });
    });
    editor.update((tx) => {
      tx.nodes.remove({ at: [2] });
    });

    assert.deepEqual(
      [cards([1]), cards([2]), cards([3])],
      [[['alice:1', 3]], [['alice:1', 3]], [['alice:1', 3]]]
    );
  });

  it('keeps one card for a deletion inside one’s own struck line', () => {
    const { cards, editor } = suggesting(['Before', 'Mid', 'After']);

    editor.update((tx) => {
      tx.selection.set(caret([1, 0], 3));
      tx.text.deleteBackward();
    });
    editor.update((tx) => {
      tx.nodes.remove({ at: [1] });
    });

    assert.deepEqual(cards([1]), [['alice:1', 2]]);
  });

  it('puts Enter at the edge of one’s own typing under that typing', () => {
    const { cards, editor } = suggesting(['ab']);

    editor.update((tx) => {
      tx.text.insert('xy', { at: { offset: 2, path: [0, 0] } });
    });
    editor.update((tx) => {
      tx.selection.set(caret([0, 1], 2));
      tx.break.insert();
    });
    editor.update((tx) => {
      tx.text.insert('zw', { at: { offset: 0, path: [1, 0] } });
    });

    assert.deepEqual(cards([1]), [['alice:1', 1]]);
  });

  it('keeps one card for a pending split of a quote and the deletion opening it', () => {
    const editor = createEditor({
      initialValue: [
        { children: [{ text: 'top' }], type: 'paragraph' },
        {
          authored: [mark('carol:1', 'split', 1)],
          children: [
            {
              children: [
                { authored: [mark('carol:2', 'delete', 2)], text: 'x' },
                { text: 'yz' },
              ],
              type: 'paragraph',
            },
            { children: [{ text: 'w' }], type: 'paragraph' },
          ],
          type: 'quote',
        },
      ] as never,
      plugins: [Quotes, createAuthoredPlugin({ authorId: 'bob' })],
    });
    const { read } = editor as unknown as ReturnType<typeof make>['authored'];

    assert.deepEqual(
      read.authored.groups({ at: [1] }).map(({ id }: { id: string }) => id),
      ['carol:1']
    );
  });

  it('puts a second Enter after one’s own typing under that typing', () => {
    const { cards, editor } = suggesting(['ab']);

    editor.update((tx) => {
      tx.text.insert('xy', { at: { offset: 2, path: [0, 0] } });
    });
    editor.update((tx) => {
      tx.selection.set(caret([0, 1], 2));
      tx.break.insert();
    });
    editor.update((tx) => {
      tx.selection.set(caret([1, 0], 0));
      tx.break.insert();
    });

    assert.deepEqual(cards([2]), [['alice:1', 1]]);
  });

  it('keeps a second plain Enter a change of its own in the same card', () => {
    const { cards, editor } = suggesting(['ab']);

    editor.update((tx) => {
      tx.selection.set(caret([0, 0], 1));
      tx.break.insert();
    });
    editor.update((tx) => {
      tx.selection.set(caret([1, 0], 0));
      tx.break.insert();
    });

    assert.deepEqual(cards([2]), [['alice:1', 2]]);
  });

  it('puts Enter at the left edge of one’s own typing under that typing', () => {
    const { cards, editor } = suggesting([
      {
        children: [
          { authored: [mark('bob:1', 'insert', 1, 'bob')], text: 'ab' },
        ],
        type: 'paragraph',
      },
    ]);

    editor.update((tx) => {
      tx.text.insert('rs', { at: { offset: 2, path: [0, 0] } });
    });
    editor.update((tx) => {
      tx.selection.set(caret([0, 0], 2));
      tx.break.insert();
    });

    assert.deepEqual(cards([1]), [['alice:1', 1]]);
  });

  it('keeps Enter at the start of a line apart from one’s own typing that ends the line above', () => {
    const { cards, editor } = suggesting(['ab', 'cd']);

    editor.update((tx) => {
      tx.text.insert('xy', { at: { offset: 2, path: [0, 0] } });
    });
    editor.update((tx) => {
      tx.selection.set(caret([1, 0], 0));
      tx.break.insert();
    });

    assert.deepEqual(
      [cards([0]), cards([2])],
      [[['alice:1', 1]], [['alice:2', 1]]]
    );
  });

  it('puts a line break pasted inside one’s own typing under that typing', () => {
    const { cards, editor } = suggesting(['ab']);

    editor.update((tx) => {
      tx.text.insert('xyz', { at: { offset: 2, path: [0, 0] } });
    });
    editor.update((tx) => {
      tx.slice.replace(
        ContentSlice.fromJSON({
          content: [
            { children: [{ text: 'P' }], type: 'paragraph' },
            { children: [{ text: 'q' }], type: 'paragraph' },
          ],
          openEnd: 1,
          openStart: 1,
        }),
        { at: { offset: 1, path: [0, 1] } }
      );
    });

    assert.deepEqual(cards([1]), [['alice:1', 1]]);
  });

  it('decides a card as read, and refuses it once a change left it', () => {
    const { authored, editor } = make();
    const card = authored.read.authored.groupOf('carol:1');

    assert.deepEqual(
      run(editor, (tx) =>
        tx.authored.decide({
          action: 'accept',
          changes: [authored.read.authored.change('carol:2')],
        })
      ),
      { ids: ['carol:2'], status: 'applied' }
    );
    assert.deepEqual(
      run(editor, (tx) =>
        tx.authored.decide({ action: 'accept', groups: [card] })
      ),
      { ids: ['carol:1'], status: 'stale' }
    );
    assert.deepEqual(
      run(editor, (tx) =>
        tx.authored.decide({
          action: 'accept',
          groups: [authored.read.authored.groupOf('carol:1')],
        })
      ),
      { ids: ['carol:1'], status: 'applied' }
    );
  });

  it('decides a change read before a block was added above it', () => {
    const { authored, editor } = make();
    const read = authored.read.authored.change('carol:2');

    run(editor, (tx) =>
      tx.nodes.insert(
        { children: [{ text: 'Above' }], type: 'paragraph' } as never,
        { at: [0] }
      )
    );

    assert.deepEqual(
      run(editor, (tx) =>
        tx.authored.decide({ action: 'accept', changes: [read] })
      ),
      { ids: ['carol:2'], status: 'applied' }
    );
  });

  it('refuses a block change read before the text inside it changed', () => {
    const { authored, editor } = make('propose');

    run(editor, (tx) => tx.nodes.set({ type: 'heading' }, { at: [0] }));

    const [id] = authored.read.authored
      .changes()
      .items.filter((change: { authorId: string }) => change.authorId === 'bob')
      .map((change: { id: string }) => change.id);
    const read = authored.read.authored.change(id);

    authored.api.authored.setView({ intent: 'edit' });
    run(editor, (tx) => tx.text.insert('!', { at: caret([0, 0], 0).anchor }));

    assert.deepEqual(
      run(editor, (tx) =>
        tx.authored.decide({ action: 'accept', changes: [read] })
      ),
      { ids: [id], status: 'stale' }
    );
  });

  it('decides inside an update and refuses a change read before it went', () => {
    const { authored, editor } = make();
    const read = authored.read.authored.change('carol:2');

    assert.deepEqual(
      run(editor, (tx) =>
        tx.authored.decide({ action: 'accept', changes: [read] })
      ),
      { ids: ['carol:2'], status: 'applied' }
    );
    assert.equal(textOf(editor.read.children()), 'Keep oldnew text more');
    assert.equal(authored.read.authored.change('carol:2'), null);
    assert.deepEqual(
      run(editor, (tx) =>
        tx.authored.decide({ action: 'reject', changes: [read] })
      ),
      { ids: ['carol:2'], status: 'stale' }
    );
  });

  it('blocks a decision that would remove another change unless that change is decided too', () => {
    const ann = mark('ann:1', 'insert', 4, 'ann');
    const { authored, editor } = make();

    authored.api.authored.setView({ intent: 'edit' });
    editor.update((tx) =>
      tx.nodes.insert(
        {
          children: [
            { text: 'Base' },
            { authored: [ann], text: ' dr' },
            { authored: [ann, mark('bob:2', 'insert', 5, 'bob')], text: '!' },
            { authored: [ann], text: 'aft' },
          ],
          type: 'paragraph',
        } as never,
        { at: [1] }
      )
    );
    const change = (id: string) => authored.read.authored.change(id);

    assert.deepEqual(
      run(editor, (tx) =>
        tx.authored.decide({ action: 'reject', changes: [change('ann:1')] })
      ),
      { ids: ['ann:1'], status: 'blocked', with: ['bob:2'] }
    );
    assert.deepEqual(
      run(editor, (tx) =>
        tx.authored.decide({
          action: 'reject',
          changes: [change('ann:1'), change('bob:2')],
        })
      ),
      { ids: ['ann:1', 'bob:2'], status: 'applied' }
    );
    assert.equal(textOf(editor.read.children()).split('\n')[1], 'Base');
  });

  it('records writes under a proposed change in a document that already holds changes', () => {
    const { authored, editor } = make();

    run(editor, (tx) => {
      tx.authored.propose({ changeId: 'bob:9' });
      tx.selection.set(caret([0, 0], 5));
      tx.command(editorCommands.insertText, { text: 'Z' });
    });

    assert.deepEqual(
      authored.read.authored
        .changes({ authorId: 'bob' })
        .items.map((change: { id: string; kind: string }) => [
          change.id,
          change.kind,
        ]),
      [['bob:9', 'insert']]
    );
    authored.api.authored.setView({ preview: 'accepted' });
    assert.equal(textOf(editor.read.children()), 'Keep old text');
  });

  it('refuses a proposal under the change Editing records under', () => {
    const { authored, editor } = make();

    assert.throws(
      () =>
        run(editor, (tx) => {
          tx.authored.propose({ changeId: '~edit:bob' });
          tx.selection.set(caret([0, 0], 5));
          tx.command(editorCommands.insertText, { text: 'Z' });
        }),
      /reserved for Editing/
    );
    assert.deepEqual(
      authored.read.authored.changes({ authorId: 'bob' }).items,
      []
    );
  });

  it('withdraws its author’s own proposal without leaving a record, and refuses another author’s', () => {
    const { authored, editor } = make();
    const before = editor.read.value();

    run(editor, (tx) => {
      tx.authored.propose({ changeId: 'bob:9' });
      tx.selection.set(caret([0, 0], 5));
      tx.command(editorCommands.insertText, { text: 'Z' });
    });

    const withdraw = (id: string) =>
      run(editor, (tx) =>
        tx.authored.withdraw([authored.read.authored.change(id)])
      );

    assert.deepEqual(withdraw('dave:3'), {
      ids: ['dave:3'],
      status: 'invalid',
    });
    assert.equal(withdraw('bob:9').status, 'applied');
    assert.deepEqual(editor.read.value(), before);
  });

  it('proposes a slice that replaces the text and type of a block as a format change', () => {
    const editor = createEditor({
      initialValue: [{ children: [{ text: 'Old' }], type: 'paragraph' }],
      plugins: [
        Blocks,
        createAuthoredPlugin({
          authorId: 'bob',
          createChangeId: () => 'bob:1',
          intent: 'propose',
          now: () => 10,
        }),
      ],
    });

    editor.update((tx) =>
      tx.slice.replace(
        ContentSlice.fromJSON({
          content: [
            { children: [{ text: 'New' }], type: 'heading' },
            { children: [{ text: 'Two' }], type: 'paragraph' },
          ],
          openEnd: 0,
          openStart: 0,
        }),
        {
          at: {
            anchor: { offset: 0, path: [0, 0] },
            focus: { offset: 3, path: [0, 0] },
          },
        }
      )
    );
    const authored = editor as unknown as ReturnType<typeof make>['authored'];
    const view = (preview: 'accepted' | 'proposed') => {
      authored.api.authored.setView({ preview });

      return editor.read
        .children()
        .map((block) => [block.type, textOf([block])]);
    };

    assert.deepEqual(view('accepted'), [['paragraph', 'Old']]);
    assert.deepEqual(view('proposed'), [
      ['heading', 'New'],
      ['paragraph', 'Two'],
    ]);
  });

  it('keeps the block a change joins into when the same change deleted its text', () => {
    const ann = (kind: 'delete' | 'insert' | 'join') =>
      mark('ann:1', kind, 4, 'ann');
    const editor = createEditor({
      initialValue: [
        {
          children: [{ authored: [ann('delete')], text: 'A' }],
          type: 'heading',
        },
        {
          authored: [ann('join')],
          children: [
            { authored: [ann('delete')], text: 'C' },
            { authored: [ann('insert')], text: 'a' },
          ],
          type: 'paragraph',
        },
      ] as never,
      plugins: [Blocks, createAuthoredPlugin({ authorId: 'bob' })],
    });
    const authored = editor as unknown as ReturnType<typeof make>['authored'];

    run(editor, (tx) =>
      tx.authored.decide({
        action: 'accept',
        changes: [authored.read.authored.change('ann:1')],
      })
    );

    assert.deepEqual(editor.read.children(), [
      { children: [{ text: 'a' }], type: 'heading' },
    ]);
  });

  it('keeps an anchor inside the letters a rejection keeps', () => {
    const { authored, editor } = make();
    // Over "Keep old new": "old" is struck, "new" inserted.
    const held = editor.anchor(
      {
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 2, path: [0, 1] },
      },
      { association: 'inward', deletion: 'drop' }
    );

    run(editor, (tx) =>
      tx.authored.decide({
        action: 'reject',
        changes: [
          authored.read.authored.change('carol:1'),
          authored.read.authored.change('carol:2'),
        ],
      })
    );

    assert.equal(textOf(editor.read.children()), 'Keep old text more');
    assert.deepEqual(held.resolve(), {
      anchor: { offset: 1, path: [0, 0] },
      focus: { offset: 7, path: [0, 0] },
    });
  });

  it('writes a rejected change again as a new incarnation', () => {
    let time = 10;
    const editor = createEditor({
      initialValue: [{ children: [{ text: 'Keep' }], type: 'paragraph' }],
      plugins: [
        Blocks,
        createAuthoredPlugin({
          authorId: 'bob',
          createIncarnationId: () => 'rt:1',
          now: () => (time += 1),
        }),
      ],
    });
    const authored = editor as unknown as ReturnType<typeof make>['authored'];
    const write = (text: string) =>
      run(editor, (tx) => {
        tx.authored.propose({ changeId: 'bob:ai' });
        tx.selection.set(caret([0, 0], 4));
        tx.command(editorCommands.insertText, { text });
      });

    write(' one');
    run(editor, (tx) =>
      tx.authored.decide({
        action: 'reject',
        changes: [authored.read.authored.change('bob:ai')],
      })
    );
    write(' two');

    assert.deepEqual(editor.read.children()[0].children, [
      { text: 'Keep' },
      {
        authored: [{ ...mark('bob:ai', 'insert', 12, 'bob'), inc: 'rt:1' }],
        text: ' two',
      },
    ]);
  });

  it('strikes on Backspace in Suggesting the text a rejected replacement gives back', () => {
    let count = 0;
    const editor = createEditor({
      initialValue: [{ children: [{ text: 'abc' }], type: 'paragraph' }],
      plugins: [
        Blocks,
        createAuthoredPlugin({
          authorId: 'bob',
          createChangeId: () => `bob:${(count += 1)}`,
          intent: 'propose',
          now: () => 7,
        }),
      ],
    });
    const authored = editor as unknown as ReturnType<typeof make>['authored'];

    run(editor, (tx) => {
      tx.selection.set({
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      });
      tx.text.insert('X');
    });
    run(editor, (tx) =>
      tx.authored.decide({
        action: 'reject',
        changes: [authored.read.authored.change('bob:1')],
      })
    );
    run(editor, (tx) => {
      tx.selection.set(caret([0, 1], 1));
      tx.command(editorCommands.delete, {
        direction: 'backward',
        unit: 'character',
      });
    });

    assert.deepEqual(reviewedValue(editor).children, [
      {
        children: [
          { text: 'a' },
          { authored: [mark('bob:2', 'delete', 7, 'bob')], text: 'b' },
          { text: 'c' },
        ],
        type: 'paragraph',
      },
    ]);
  });

  it('holds the deletion of a rejected replacement in the commit the decision makes', () => {
    const editor = createEditor({
      initialValue: [{ children: [{ text: 'abc' }], type: 'paragraph' }],
      plugins: [
        Blocks,
        createAuthoredPlugin({
          authorId: 'bob',
          createChangeId: () => 'bob:1',
          intent: 'propose',
          now: () => 7,
        }),
      ],
    });
    const authored = editor as unknown as ReturnType<typeof make>['authored'];
    const committed: unknown[] = [];

    run(editor, (tx) => {
      tx.selection.set({
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      });
      tx.text.insert('X');
    });

    const unsubscribe = editor.subscribeCommit(() =>
      committed.push(editor.read.children())
    );

    run(editor, (tx) =>
      tx.authored.decide({
        action: 'reject',
        changes: [authored.read.authored.change('bob:1')],
      })
    );
    unsubscribe();

    assert.deepEqual(committed, [
      [
        {
          children: [
            { text: 'a' },
            {
              authored: [
                { at: 7, author: 'bob', change: 'bob:1', kind: 'held' },
              ],
              text: 'b',
            },
            { text: 'c' },
          ],
          type: 'paragraph',
        },
      ],
    ]);
  });

  it('writes a change only a verdict names again as a new incarnation', () => {
    const editor = createEditor({
      initialValue: {
        children: [{ children: [{ text: 'Keep' }], type: 'paragraph' }],
        records: reviewRecords({
          verdicts: [
            {
              decision: 'd:1',
              member: { at: 5, change: 'bob:ai' },
              verdict: 'reject',
            },
          ],
        }),
      } as never,
      plugins: [
        Blocks,
        createAuthoredPlugin({
          authorId: 'bob',
          createIncarnationId: () => 'rt:1',
          now: () => 12,
        }),
      ],
    });

    run(editor, (tx) => {
      tx.authored.propose({ changeId: 'bob:ai' });
      tx.selection.set(caret([0, 0], 4));
      tx.command(editorCommands.insertText, { text: ' two' });
    });

    assert.deepEqual(editor.read.children()[0].children, [
      { text: 'Keep' },
      {
        authored: [{ ...mark('bob:ai', 'insert', 12, 'bob'), inc: 'rt:1' }],
        text: ' two',
      },
    ]);
  });

  const sorted = (delta: AuthoredChangesDelta) => ({
    blocks: delta.blocks,
    changed: [...delta.changed].sort(),
    groups: [...delta.groups].sort(),
    removed: [...delta.removed].sort(),
  });

  // Rejecting Dave's insertion takes his pair off the first block.
  const rejectDaveOn = (editor: ReturnType<typeof make>['editor']) => ({
    blocks: [editor.key([0])],
    changed: [],
    groups: ['dave:3'],
    removed: ['dave:3'],
  });

  it('delivers a decision’s delta once per commit until unsubscribed', () => {
    const { authored, editor } = make();
    const seen: AuthoredChangesDelta[] = [];
    const stop = authored.api.authored.subscribeChanges((delta) =>
      seen.push(delta)
    );

    run(editor, (tx) =>
      tx.authored.decide({
        action: 'reject',
        changes: [authored.read.authored.change('dave:3')],
      })
    );
    run(editor, (tx) => {
      tx.selection.set(caret([0, 0], 0));
      tx.command(editorCommands.insertText, { text: 'Z' });
    });
    stop();
    run(editor, (tx) =>
      tx.authored.decide({
        action: 'accept',
        changes: [authored.read.authored.change('carol:1')],
      })
    );

    assert.deepEqual(seen, [rejectDaveOn(editor)]);
  });

  it('names the block a merge renames when the decision does not write it', () => {
    const editor = createEditor({
      initialValue: [
        {
          authored: [format('carol:1', 1)],
          children: [
            { text: 'One' },
            { authored: [mark('bob:1', 'insert', 3, 'bob')], text: '!' },
          ],
          type: 'heading',
        },
        {
          authored: [format('carol:2', 2)],
          children: [{ text: 'Two' }],
          type: 'heading',
        },
      ] as never,
      plugins: [Blocks, createAuthoredPlugin({ authorId: 'bob' })],
    });
    const { api, read } = editor as unknown as ReturnType<
      typeof make
    >['authored'];
    const seen: AuthoredChangesDelta[] = [];

    api.authored.subscribeChanges((delta) => seen.push(delta));
    editor.update((tx) => {
      (tx as typeof tx & { authored: any }).authored.decide({
        action: 'accept',
        changes: [read.authored.change('bob:1')],
      });
    });

    assert.deepEqual(seen.map(sorted), [
      {
        blocks: [editor.key([0]), editor.key([1])],
        changed: ['carol:1'],
        groups: ['bob:1', 'carol:1', 'carol:2'],
        removed: ['bob:1'],
      },
    ]);
  });

  for (const [side, ats, renamed] of [
    ['before the key', [1, 2, 3], [1, 2]],
    ['after the key', [2, 3, 1], [0, 1]],
  ] as const) {
    it(`names the blocks of the part a split renames, with the oldest change ${side}`, () => {
      const editor = createEditor({
        initialValue: ats.map((at, index) => ({
          authored: [format(`carol:${index + 1}`, at)],
          children: [{ text: 'Line' }],
          type: 'heading',
        })) as never,
        plugins: [
          Blocks,
          createAuthoredPlugin({
            authorId: 'bob',
            createChangeId: () => 'bob:9',
            intent: 'propose',
          }),
        ],
      });
      const { api } = editor as unknown as ReturnType<typeof make>['authored'];
      const seen: AuthoredChangesDelta[] = [];

      api.authored.subscribeChanges((delta) => seen.push(delta));
      editor.update((tx) => {
        tx.text.insert('!', { at: { offset: 4, path: [1, 0] } });
      });

      assert.deepEqual(seen.map(sorted), [
        {
          blocks: renamed.map((rank) => editor.key([rank])),
          changed: ['bob:9', 'carol:2'],
          groups: ['bob:9', 'carol:1', 'carol:3'],
          removed: [],
        },
      ]);
    });
  }

  it('leaves the delta whole for a commit listener that reads cards first', () => {
    const { authored, editor } = make();
    const seen: AuthoredChangesDelta[] = [];

    editor.subscribeCommit(() => authored.read.authored.groups({ at: [0] }));
    authored.api.authored.subscribeChanges((delta) => seen.push(delta));
    run(editor, (tx) =>
      tx.authored.decide({
        action: 'reject',
        changes: [authored.read.authored.change('dave:3')],
      })
    );

    assert.deepEqual(seen, [rejectDaveOn(editor)]);
  });

  it('hands every subscriber of a view the same delta once', () => {
    const { authored, editor } = make();
    const first: AuthoredChangesDelta[] = [];
    const second: AuthoredChangesDelta[] = [];

    authored.api.authored.subscribeChanges((delta) => first.push(delta));
    authored.api.authored.subscribeChanges((delta) => second.push(delta));
    run(editor, (tx) =>
      tx.authored.decide({
        action: 'reject',
        changes: [authored.read.authored.change('dave:3')],
      })
    );

    assert.deepEqual(
      [first.length, second.length, first[0] === second[0]],
      [1, 1, true]
    );
  });

  it('hands each view of the editor the delta of a commit', () => {
    const { authored, editor } = make();
    const writer = createEditorView(editor, {
      authored: { intent: 'propose' },
    }) as unknown as typeof authored;
    const seen: AuthoredChangesDelta[][] = [[], []];

    authored.api.authored.subscribeChanges((delta) => seen[0].push(delta));
    writer.api.authored.subscribeChanges((delta) => seen[1].push(delta));
    run(editor, (tx) =>
      tx.authored.decide({
        action: 'reject',
        changes: [authored.read.authored.change('dave:3')],
      })
    );

    assert.deepEqual(seen, [[rejectDaveOn(editor)], [rejectDaveOn(editor)]]);
  });

  it('keeps what an aborted update read out of the next delta', () => {
    const { authored, editor } = make();
    const seen: AuthoredChangesDelta[] = [];
    const card = authored.read.authored.groupOf('carol:1');
    let onDraft: unknown;

    authored.api.authored.subscribeChanges((delta) => seen.push(delta));
    assert.throws(() =>
      run(editor, (tx) => {
        tx.authored.decide({
          action: 'accept',
          changes: [authored.read.authored.change('carol:1')],
        });
        // The draft renamed the card, so deciding it there reads as stale.
        onDraft = tx.authored.decide({ action: 'accept', groups: [card] });
        throw new Error('abort');
      })
    );
    run(editor, (tx) =>
      tx.authored.decide({
        action: 'reject',
        changes: [authored.read.authored.change('dave:3')],
      })
    );

    assert.deepEqual(
      [onDraft, seen],
      [{ ids: ['carol:1'], status: 'stale' }, [rejectDaveOn(editor)]]
    );
  });

  it('keeps the node keys of a preview view across commits', () => {
    const editor = createEditor({
      initialValue: [
        { children: [{ text: 'alpha' }], type: 'paragraph' },
        { children: [{ text: 'beta' }], type: 'paragraph' },
      ],
      plugins: [Blocks, createAuthoredPlugin({ authorId: 'alice' })],
    });
    const accepted = createEditorView(editor, {
      authored: { preview: 'accepted' },
    });
    const writer = createEditorView(editor, {
      authored: { intent: 'propose' },
    });
    const keysOf = () =>
      accepted.read
        .children()
        .flatMap((block) => [
          accepted.key(block),
          accepted.key(block.children[0]),
        ]);
    const keys = keysOf();

    writer.update.text.insert('++', { at: caret([0, 0], 0).anchor });
    editor.update.text.insert('!', { at: caret([1, 0], 0).anchor });

    assert.equal(textOf(accepted.read.children()), 'alpha\n!beta');
    assert.deepEqual(keysOf(), keys);

    editor.update((tx) =>
      tx.nodes.insert(
        { children: [{ text: 'gamma' }], type: 'paragraph' } as never,
        { at: [2] }
      )
    );

    assert.equal(textOf(accepted.read.children()), 'alpha\n!beta\ngamma');
    assert.deepEqual(keysOf().slice(0, 4), keys);
  });

  it('keeps the accepted preview blocks while a suggestion strikes every block', () => {
    const editor = createEditor({
      initialValue: [
        { children: [{ text: 'alpha' }], type: 'paragraph' },
        { children: [{ text: 'beta' }], type: 'paragraph' },
      ],
      plugins: [Blocks, createAuthoredPlugin({ authorId: 'alice' })],
    });
    const accepted = createEditorView(editor, {
      authored: { preview: 'accepted' },
    });
    const writer = createEditorView(editor, {
      authored: { intent: 'propose' },
    });
    const blocks = accepted.read.children();

    writer.update((tx) =>
      tx.text.delete({
        at: { anchor: caret([0, 0], 0).anchor, focus: caret([1, 0], 4).focus },
      })
    );

    assert.notEqual(editor.read.children()[0], blocks[0]);
    assert.deepEqual(
      accepted.read.children().map((block, index) => block === blocks[index]),
      [true, true]
    );
  });

  it('drops the line a join filled once a line is appended after it', () => {
    const TwoLines = defineEditorSchema('authored-plugin-two-lines', {
      elements: { paragraph: schema.element.textBlock() },
      id: 'authored-plugin-two-lines',
      root: schema.content.types(['paragraph'], {
        default: { type: 'paragraph' },
        min: 2,
      }),
      unknown: 'reject',
      version: 1,
    });
    const editor = createEditor({
      initialValue: [
        { children: [{ text: 'ab' }], type: 'paragraph' },
        {
          authored: [mark('carol:1', 'join', 1)],
          children: [{ text: 'cd' }],
          type: 'paragraph',
        },
      ] as never,
      plugins: [TwoLines, createAuthoredPlugin({ authorId: 'alice' })],
    });
    const proposed = createEditorView(editor, {
      authored: { preview: 'proposed' },
    });

    assert.equal(textOf(proposed.read.children()), 'abcd\n');

    editor.update((tx) =>
      tx.nodes.insert(
        { children: [{ text: 'ef' }], type: 'paragraph' } as never,
        {
          at: [2],
        }
      )
    );

    assert.equal(textOf(proposed.read.children()), 'abcd\nef');
  });

  it('previews a document no change touches as the stored document, without a copy', () => {
    const editor = createEditor({
      initialValue: [{ children: [{ text: 'alpha' }], type: 'paragraph' }],
      plugins: [Blocks, createAuthoredPlugin({ authorId: 'alice' })],
    });
    const proposed = createEditorView(editor, {
      authored: { preview: 'proposed' },
    });

    assert.equal(proposed.read.children(), editor.read.children());

    editor.update.text.insert('!', { at: caret([0, 0], 0).anchor });

    assert.equal(textOf(proposed.read.children()), '!alpha');
    assert.equal(proposed.read.children(), editor.read.children());
  });
});

describe('authored plugin beside content a pending join moves', () => {
  type Value = readonly unknown[] | Readonly<{ children: readonly unknown[] }>;
  type Point = Readonly<{ offset: number; path: readonly number[] }>;

  const editorOf = (
    value: Value,
    author: string,
    intent: 'edit' | 'propose' = 'propose',
    content: typeof Quotes | typeof Tables = Quotes
  ) => {
    let count = 0;
    const editor = createEditor({
      initialValue: structuredClone(value) as never,
      plugins: [
        content,
        transfer(),
        createAuthoredPlugin({
          authorId: author,
          createChangeId: () => `${author}:${(count += 1)}`,
          intent,
          now: () => 1,
        }),
      ],
    });
    const authored = editor as unknown as ReturnType<
      typeof make
    >['authored'] & {
      api: {
        authored: {
          subscribeRefusals: (
            listener: (refusal: AuthoredRefusal) => void
          ) => () => void;
        };
      };
    };

    return { authored, editor };
  };
  type Built = ReturnType<typeof editorOf>;

  const point = (path: readonly number[], offset: number): Point => ({
    offset,
    path,
  });
  const command = (
    { editor }: Built,
    anchor: Point,
    focus: Point,
    write: (tx: EditorUpdateTransaction) => void
  ) =>
    editor.update((tx) => {
      tx.selection.set({ anchor, focus });
      write(tx as unknown as EditorUpdateTransaction);
    });
  // What a reader opening the saved document sees under Proposed.
  const freshProposed = (built: Built) =>
    createEditorView(editorOf(built.editor.read.value(), 'erin').editor, {
      authored: { preview: 'proposed' },
    }).read.children();

  type Member = Readonly<Record<string, unknown>>;
  type Leaf = Readonly<{ authored?: readonly Member[]; text: string }>;
  type Block = Readonly<{
    authored?: readonly Member[];
    children: ReadonlyArray<Block | Leaf>;
    type: string;
  }>;

  const by = (author: string, kind: string, extra: Member = {}): Member => ({
    at: 1,
    author,
    change: `${author}:1`,
    kind,
    ...extra,
  });
  const follows = (change: string) => ({
    follows: JSON.stringify([change, 1]),
  });
  const paragraph = (
    children: string | readonly Leaf[],
    authored?: readonly Member[]
  ): Block => ({
    ...(authored && { authored }),
    children: typeof children === 'string' ? [{ text: children }] : children,
    type: 'paragraph',
  });
  const quote = (...children: Block[]): Block => ({ children, type: 'quote' });
  const leaf = (text: string, ...authored: Member[]): Leaf =>
    authored.length > 0 ? { authored, text } : { text };
  const texts = (blocks: ReadonlyArray<Block | Leaf>): unknown[] =>
    blocks.map((node) =>
      'text' in node
        ? node.text
        : node.children.every((child) => 'text' in child)
          ? node.children
              .map((child) => ('text' in child ? child.text : ''))
              .join('')
          : texts(node.children)
    );

  // Alice joins `c` into `ab` inside the quote, Carol inserts `carol` below
  // it, and Bob's `bob`, split off the joined line, follows the join, so
  // Proposed shows `bob` above `carol`: [quote[abc, bob], carol].
  const reorder = (carol: string, bob: string): Block[] => [
    quote(paragraph('ab')),
    paragraph('c', [by('alice', 'join')]),
    paragraph([leaf(carol, by('carol', 'insert'))], [by('carol', 'insert')]),
    paragraph(bob, [by('bob', 'split', follows('alice:1'))]),
  ];
  const typeBreak = (doc: Built, at: Point) =>
    command(doc, at, at, (tx) => tx.command(editorCommands.insertBreak));
  const back = { direction: 'backward', unit: 'character' } as const;
  const forward = { direction: 'forward', unit: 'character' } as const;
  const remove =
    (at: Point, options: typeof back | typeof forward) => (dave: Built) =>
      command(dave, at, at, (tx) => tx.command(editorCommands.delete, options));
  const deleteRange = (anchor: Point, focus: Point) => (dave: Built) =>
    command(dave, anchor, focus, (tx) =>
      tx.command(editorCommands.deleteFragment, { direction: 'forward' })
    );
  const insertAt = (at: readonly number[]) => (dave: Built) =>
    dave.editor.update((tx) =>
      tx.command(editorCommands.insertNodes, {
        nodes: paragraph('N'),
        options: { at: [...at] },
      })
    );
  // One editor's Alice joins `cd` into the quote's `ab`, Bob splits `d` off
  // the joined line and Carol inserts `TT` above the joined line, so Proposed
  // shows [quote[abc, TT, d]].
  const built = () => {
    const alice = editorOf([quote(paragraph('ab')), paragraph('cd')], 'alice');

    remove(point([1, 0], 0), back)(alice);

    const bob = editorOf(alice.editor.read.value(), 'bob');

    typeBreak(bob, point([0, 1, 0], 1));

    const carol = editorOf(bob.editor.read.value(), 'carol');

    carol.editor.update((tx) =>
      tx.nodes.insert(paragraph('TT') as never, { at: [0, 1] })
    );

    return carol.editor.read.value().children as readonly Block[];
  };
  const BUILT: readonly Block[] = [
    quote(
      paragraph('ab'),
      paragraph(
        [leaf('TT', by('carol', 'insert'))],
        [by('carol', 'insert', follows('alice:1'))]
      ),
      paragraph(
        [leaf('c', by('alice', 'insert'))],
        [by('alice', 'insert'), by('alice', 'join')]
      ),
      paragraph(
        [leaf('d', by('alice', 'insert'))],
        [by('alice', 'insert'), by('bob', 'split', follows('alice:1'))]
      )
    ),
    paragraph([leaf('cd', by('alice', 'delete'))], [by('alice', 'delete')]),
  ];
  // Sol's crossed deletion: Bob deletes `b`, Carol's `f` follows Alice's join
  // of `c`, so Proposed shows [ac, f].
  const sol = (a: string, b: string, f: string, c: string): Block[] => [
    paragraph(a),
    paragraph([leaf(b, by('bob', 'delete'))], [by('bob', 'delete')]),
    paragraph(f, [by('carol', 'split', follows('alice:1'))]),
    paragraph(c, [by('alice', 'join')]),
  ];

  // Dave's editor on `value`, with a live Proposed view read before he types
  // and the refusals his commands meet.
  const daveOn = (
    value: readonly Block[],
    intent: 'edit' | 'propose' = 'propose'
  ) => {
    const dave = editorOf(value, 'dave', intent);
    const live = createEditorView(dave.editor, {
      authored: { preview: 'proposed' },
    });
    const refusals: Array<readonly string[]> = [];

    live.read.children();
    dave.authored.api.authored.subscribeRefusals((refusal) =>
      refusals.push(refusal.reasons)
    );

    return { ...dave, live, refusals };
  };
  const shows = (dave: ReturnType<typeof daveOn>) => [
    dave.live.read.children(),
    freshProposed(dave),
  ];
  const DAVE_INSERT = by('dave', 'insert');
  const DAVE_DELETE = by('dave', 'delete');
  const FORMAT = {
    at: 1,
    author: 'dave',
    change: 'dave:1',
    key: 'bold',
    kind: 'format',
    write: { kind: 'set', value: true },
  };
  type Bolded = (text: string, ...authored: Member[]) => Leaf;
  const bolded =
    (intent: 'edit' | 'propose'): Bolded =>
    (text, ...authored) => {
      const marks = intent === 'edit' ? authored : [...authored, FORMAT];

      return {
        ...(marks.length > 0 && { authored: marks }),
        bold: true,
        text,
      } as Leaf;
    };
  // A format member's id hashes its place, which says nothing here.
  const withoutIds = (nodes: readonly unknown[]): unknown[] =>
    nodes.map((node) => {
      const { authored, children, ...rest } = node as Block & Leaf;

      return {
        ...rest,
        ...(authored && {
          authored: authored.map(({ id: _id, ...member }) => member),
        }),
        ...(children && { children: withoutIds(children) }),
      };
    });
  const within = (block: Block, ...children: Leaf[]): Block => ({
    ...block,
    children,
  });
  const leafMarks = (block: Block) =>
    (block.children[0] as Leaf).authored ?? [];
  const addBold = (dave: Built, anchor: Point, focus: Point) =>
    command(dave, anchor, focus, (tx) =>
      tx.command(editorCommands.addMark, { key: 'bold', value: true })
    );
  const typeAt = (typist: Built, at: Point, text: string) =>
    command(typist, at, at, (tx) =>
      tx.command(editorCommands.insertText, { text })
    );

  // A key strictly inside Carol's insertion names that insertion as its
  // context.
  const IN_CAROL = { ctx: 'c:86ff3f2ee6ebe132', kind: 'in' };

  // `value` with Dave's `D` typed at `offset` of the leaf at `path`.
  const withKey = (
    value: readonly Block[],
    path: readonly number[],
    offset: number
  ): Block[] =>
    value.map((block, index) => {
      if (index !== path[0]) return block;
      if (path.length > 2) {
        return {
          ...block,
          children: withKey(block.children as Block[], path.slice(1), offset),
        };
      }

      const children = block.children.flatMap((child, at) => {
        if (at !== path[1]) return [child];

        const { text, ...marks } = child as Leaf;
        const inside =
          offset > 0 &&
          offset < text.length &&
          marks.authored?.some((member) => member.change === 'carol:1');

        return [
          { ...marks, text: text.slice(0, offset) },
          inside ? leaf('D', DAVE_INSERT, IN_CAROL) : leaf('D', DAVE_INSERT),
          { ...marks, text: text.slice(offset) },
        ].filter((part) => part.text !== '');
      });

      return { ...block, children };
    });

  it('saves a key at the start, middle and end of each block of the reorder document as Dave insertion alone, and accept-all after a reload keeps Carol paragraph', () => {
    for (const [carol, bob] of [
      ['xy', 'uv'],
      ['zz', 'zz'],
    ]) {
      const value = reorder(carol, bob);
      const blocks = [
        { path: [0, 0, 0], text: 'ab' },
        { path: [1, 0], text: 'c' },
        { path: [2, 0], text: carol },
        { path: [3, 0], text: bob },
      ];

      for (const { path, text } of blocks) {
        for (const offset of new Set([0, text.length >> 1, text.length])) {
          const dave = daveOn(value);
          const typed = (at: number, of: string) =>
            path[0] === at ? `${of.slice(0, offset)}D${of.slice(offset)}` : of;

          typeAt(dave, point(path, offset), 'D');

          const label = `D at ${offset} of ${text} in [${carol}, ${bob}]`;
          const saved = editorOf(dave.editor.read.value(), 'erin', 'edit');

          saved.editor.update((tx) =>
            tx.authored.decide({
              action: 'accept',
              changes: saved.authored.read.authored.changes({}).items,
            })
          );
          assert.deepEqual(
            [dave.refusals, dave.editor.read.children(), ...shows(dave)],
            [
              [],
              withKey(value, path, offset),
              freshProposed(dave),
              freshProposed(dave),
            ],
            label
          );
          if (carol !== bob) {
            assert.deepEqual(
              saved.editor.read.children(),
              [
                quote(
                  paragraph(typed(0, 'ab') + typed(1, 'c')),
                  paragraph(typed(3, bob))
                ),
                paragraph(typed(2, carol)),
              ],
              label
            );
          }
        }
      }
    }
  });

  it('saves a key at the start, middle and end of each block of the document one editor builds as Dave insertion alone', () => {
    for (const { path, text } of [
      { path: [0, 0, 0], text: 'ab' },
      { path: [0, 1, 0], text: 'TT' },
      { path: [0, 2, 0], text: 'c' },
      { path: [0, 3, 0], text: 'd' },
    ]) {
      for (const offset of new Set([0, text.length >> 1, text.length])) {
        const dave = daveOn(BUILT);

        typeAt(dave, point(path, offset), 'D');
        assert.deepEqual(
          [dave.refusals, dave.editor.read.children(), ...shows(dave)],
          [
            [],
            withKey(BUILT, path, offset),
            freshProposed(dave),
            freshProposed(dave),
          ],
          `D at ${offset} of ${text}`
        );
      }
    }
  });

  it('records Backspace and Delete at the point inside a merged line where a moved block was cut out into the line on its side', () => {
    const quoted = BUILT[0].children as readonly Block[];
    const inQuote = (...children: Block[]) => [quote(...children), BUILT[1]];
    const struckB = paragraph([leaf('a'), leaf('b', DAVE_DELETE)]);
    const struckC = paragraph(
      [leaf('c', by('alice', 'insert'), DAVE_DELETE)],
      quoted[2].authored
    );
    const solValue = sol('aa', 'bb', 'ff', 'cc');
    const [aa, bb, ff, cc] = solValue as [Block, Block, Block, Block];
    const struckA = paragraph([leaf('a'), leaf('a', DAVE_DELETE)]);
    const struckFirstC = paragraph(
      [leaf('c', DAVE_DELETE), leaf('c')],
      cc.authored
    );
    const cases: Array<
      [string, readonly Block[], (dave: Built) => void, readonly Block[]]
    > = [
      [
        'Backspace at the end of ab',
        BUILT,
        remove(point([0, 0, 0], 2), back),
        inQuote(struckB, quoted[1], quoted[2], quoted[3]),
      ],
      [
        'Delete at the end of ab',
        BUILT,
        remove(point([0, 0, 0], 2), forward),
        inQuote(quoted[0], quoted[1], struckC, quoted[3]),
      ],
      [
        'Backspace at the start of c',
        BUILT,
        remove(point([0, 2, 0], 0), back),
        inQuote(struckB, quoted[1], quoted[2], quoted[3]),
      ],
      [
        'Delete at the start of c',
        BUILT,
        remove(point([0, 2, 0], 0), forward),
        inQuote(quoted[0], quoted[1], struckC, quoted[3]),
      ],
      [
        'Backspace at the end of aa',
        solValue,
        remove(point([0, 0], 2), back),
        [struckA, bb, ff, cc],
      ],
      [
        'Delete at the end of aa',
        solValue,
        remove(point([0, 0], 2), forward),
        [aa, bb, ff, struckFirstC],
      ],
      [
        'Backspace at the start of cc',
        solValue,
        remove(point([3, 0], 0), back),
        [struckA, bb, ff, cc],
      ],
      [
        'Delete at the start of cc',
        solValue,
        remove(point([3, 0], 0), forward),
        [aa, bb, ff, struckFirstC],
      ],
    ];

    for (const [name, value, act, saved] of cases) {
      const dave = daveOn(value);

      act(dave);
      assert.deepEqual(
        [dave.refusals, dave.editor.read.children(), ...shows(dave)],
        [[], saved, freshProposed(dave), freshProposed(dave)],
        name
      );
    }
    for (const [name, path, offset] of [
      ['a key at the end of aa', [0, 0], 2],
      ['a key at the start of cc', [3, 0], 0],
    ] as const) {
      const dave = daveOn(solValue);

      typeAt(dave, point(path, offset), 'D');
      assert.deepEqual(
        [dave.refusals, dave.editor.read.children(), ...shows(dave)],
        [
          [],
          withKey(solValue, path, offset),
          freshProposed(dave),
          freshProposed(dave),
        ],
        name
      );
    }
  });

  it('stores TT with the follower claim of Alice’s join and c and d inside the quote as moved copies, when one editor builds the document', () => {
    assert.deepEqual(built(), BUILT);
  });

  it('records Backspace, Delete and a selection across a moved piece’s edge as the merge the frame shows, in both intents', () => {
    const solValue = sol('a', 'b', 'f', 'c');
    const cases: Array<
      [string, readonly Block[], (dave: Built) => void, readonly unknown[]]
    > = [
      [
        'Backspace at the start of TT',
        BUILT,
        remove(point([0, 1, 0], 0), back),
        [['abcTT', 'd']],
      ],
      [
        'Delete at the end of TT',
        BUILT,
        remove(point([0, 1, 0], 2), forward),
        [['abc', 'TTd']],
      ],
      [
        'Backspace at the start of d',
        BUILT,
        remove(point([0, 3, 0], 0), back),
        [['abc', 'TTd']],
      ],
      [
        'Delete at the end of abc',
        BUILT,
        remove(point([0, 2, 0], 1), forward),
        [['abcTT', 'd']],
      ],
      [
        'a selection of TT and d',
        BUILT,
        deleteRange(point([0, 1, 0], 0), point([0, 3, 0], 1)),
        [['abc', '']],
      ],
      [
        'Backspace at the start of f',
        solValue,
        remove(point([2, 0], 0), back),
        ['acf'],
      ],
      [
        'Delete at the end of ac',
        solValue,
        remove(point([3, 0], 1), forward),
        ['acf'],
      ],
    ];

    for (const [name, value, act, shown] of cases) {
      for (const intent of ['propose', 'edit'] as const) {
        const dave = daveOn(value, intent);

        act(dave);
        assert.deepEqual(
          [
            dave.refusals,
            texts(dave.live.read.children() as never),
            ...shows(dave),
          ],
          [[], shown, freshProposed(dave), freshProposed(dave)],
          `${name} in ${intent}`
        );
      }
    }
  });

  it('refuses with crosses, leaving the saved value as it was, a new paragraph or a selection where a moved piece meets its neighbours', () => {
    const solValue = sol('a', 'b', 'f', 'c');
    const cases: Array<[string, readonly Block[], (dave: Built) => void]> = [
      ['a paragraph inserted above TT', BUILT, insertAt([0, 1])],
      ['a paragraph inserted above d', BUILT, insertAt([0, 3])],
      [
        'Enter at the end of ab',
        BUILT,
        (dave) => typeBreak(dave, point([0, 0, 0], 2)),
      ],
      [
        'Enter at the start of c',
        BUILT,
        (dave) => typeBreak(dave, point([0, 2, 0], 0)),
      ],
      ['a paragraph inserted above f', solValue, insertAt([2])],
      [
        'Enter at the end of a',
        solValue,
        (dave) => typeBreak(dave, point([0, 0], 1)),
      ],
      [
        'Enter at the start of c',
        solValue,
        (dave) => typeBreak(dave, point([3, 0], 0)),
      ],
    ];

    for (const [name, value, act] of cases) {
      for (const intent of ['propose', 'edit'] as const) {
        const dave = daveOn(value, intent);

        act(dave);
        assert.deepEqual(
          [dave.refusals, dave.editor.read.children()],
          [[['crosses']], value],
          `${name} in ${intent}`
        );
      }
    }
  });

  type BoldCase = [
    string,
    readonly Block[],
    Point,
    Point,
    (bold: Bolded) => readonly Block[],
  ];
  const assertBolds = (cases: readonly BoldCase[]) => {
    for (const [name, value, anchor, focus, saved] of cases) {
      for (const intent of ['propose', 'edit'] as const) {
        const dave = daveOn(value, intent);

        addBold(dave, anchor, focus);
        assert.deepEqual(
          [
            dave.refusals,
            withoutIds(dave.editor.read.children()),
            ...shows(dave),
          ],
          [[], saved(bolded(intent)), freshProposed(dave), freshProposed(dave)],
          `${name} in ${intent}`
        );
      }
    }
  };

  it('records Bold over a selection that crosses a break inside it, and Bold beside a move edge, in both intents', () => {
    const [, c, xy, uv] = reorder('xy', 'uv');

    assertBolds([
      [
        'a to c on the reorder document',
        reorder('xy', 'uv'),
        point([0, 0, 0], 0),
        point([1, 0], 1),
        (bold) => [
          quote(paragraph([bold('ab')])),
          within(c, bold('c')),
          xy,
          uv,
        ],
      ],
      [
        'b alone in ab on the reorder document',
        reorder('xy', 'uv'),
        point([0, 0, 0], 1),
        point([0, 0, 0], 2),
        (bold) => [quote(paragraph([leaf('a'), bold('b')])), c, xy, uv],
      ],
    ]);
  });

  it('records select-all Bold on every shown block, the moved ones included, in both intents', () => {
    const [, c, xy, uv] = reorder('xy', 'uv');
    const [[, tt, joined, d], cd] = [
      BUILT[0].children as readonly Block[],
      BUILT[1],
    ];
    const [, b, f, solC] = sol('a', 'b', 'f', 'c');

    assertBolds([
      [
        'select-all on the reorder document',
        reorder('xy', 'uv'),
        point([0, 0, 0], 0),
        point([3, 0], 2),
        (bold) => [
          quote(paragraph([bold('ab')])),
          within(c, bold('c')),
          within(xy, bold('xy', ...leafMarks(xy))),
          within(uv, bold('uv')),
        ],
      ],
      [
        'select-all on the document one editor builds',
        BUILT,
        point([0, 0, 0], 0),
        point([1, 0], 2),
        (bold) => [
          quote(
            paragraph([bold('ab')]),
            within(tt, bold('TT', ...leafMarks(tt))),
            within(joined, bold('c', ...leafMarks(joined))),
            within(d, bold('d', ...leafMarks(d)))
          ),
          cd,
        ],
      ],
      [
        "select-all on Sol's crossed deletion",
        sol('a', 'b', 'f', 'c'),
        point([0, 0], 0),
        point([3, 0], 1),
        (bold) => [
          paragraph([bold('a')]),
          b,
          within(f, bold('f')),
          within(solC, bold('c')),
        ],
      ],
    ]);
  });

  it("records Bold from the document's start point to its end point on Sol's crossed deletion on every shown block, in both intents", () => {
    const value = sol('a', 'b', 'f', 'c');
    const [, b, f, solC] = value;

    for (const intent of ['propose', 'edit'] as const) {
      const dave = daveOn(value, intent);
      const bold = bolded(intent);

      addBold(
        dave,
        dave.editor.read.points.start([])!,
        dave.editor.read.points.end([])!
      );
      assert.deepEqual(
        [
          dave.refusals,
          withoutIds(dave.editor.read.children()),
          ...shows(dave),
        ],
        [
          [],
          [
            paragraph([bold('a')]),
            b,
            within(f, bold('f')),
            within(solC, bold('c')),
          ],
          freshProposed(dave),
          freshProposed(dave),
        ],
        intent
      );
    }
  });

  it('refuses with crosses, leaving the saved value as it was, a selection whose frame image runs backward, in both intents', () => {
    const value = sol('a', 'b', 'f', 'c');

    for (const intent of ['propose', 'edit'] as const) {
      const dave = daveOn(value, intent);

      deleteRange(point([2, 0], 0), point([3, 0], 1))(dave);
      assert.deepEqual(
        [dave.refusals, dave.editor.read.children()],
        [[['crosses']], value],
        intent
      );
    }
  });

  it('records text typed at an explicit point while the selection runs backward in the frame elsewhere, in both intents', () => {
    for (const intent of ['propose', 'edit'] as const) {
      const dave = daveOn(
        [...sol('a', 'b', 'f', 'c'), paragraph('safe')],
        intent
      );

      command(dave, point([2, 0], 0), point([3, 0], 1), (tx) =>
        tx.command(editorCommands.insertText, {
          options: { at: point([4, 0], 4) },
          text: 'Z',
        })
      );
      assert.deepEqual(
        [dave.refusals, dave.editor.read.children().at(-1)],
        [
          [],
          intent === 'edit'
            ? paragraph('safeZ')
            : paragraph([leaf('safe'), leaf('Z', DAVE_INSERT)]),
        ],
        intent
      );
    }
  });

  it('applies text a command evaluated at an explicit point while the selection runs backward in the frame elsewhere, in both intents', () => {
    for (const intent of ['propose', 'edit'] as const) {
      const dave = daveOn(
        [...sol('a', 'b', 'f', 'c'), paragraph('safe')],
        intent
      );

      dave.editor.update((tx) => {
        tx.selection.set({ anchor: point([2, 0], 0), focus: point([3, 0], 1) });
      });

      const spec = evaluateCommand(dave.editor, editorCommands.insertText, {
        options: { at: point([4, 0], 4) },
        text: 'Z',
      }).result;

      assert.ok(spec, intent);
      dave.editor.update(() => applyTransactionSpec(dave.editor, spec));
      assert.deepEqual(
        [dave.refusals, dave.editor.read.children().at(-1)],
        [
          [],
          intent === 'edit'
            ? paragraph('safeZ')
            : paragraph([leaf('safe'), leaf('Z', DAVE_INSERT)]),
        ],
        intent
      );
    }
  });

  it('refuses with crosses text a command evaluated at a selection whose frame image runs backward, in both intents', () => {
    const value = [...sol('a', 'b', 'f', 'c'), paragraph('safe')];

    for (const intent of ['propose', 'edit'] as const) {
      const dave = daveOn(value, intent);

      dave.editor.update((tx) => {
        tx.selection.set({ anchor: point([2, 0], 0), focus: point([3, 0], 1) });
      });

      const spec = evaluateCommand(dave.editor, editorCommands.insertText, {
        text: 'Z',
      }).result;

      assert.ok(spec, intent);
      dave.editor.update(() => applyTransactionSpec(dave.editor, spec));
      assert.deepEqual(
        [dave.refusals, dave.editor.read.children()],
        [[['crosses']], value],
        intent
      );
    }
  });

  it("refuses Bold from aa's second letter through the struck bb, whose end the preview shows at the joined line's break, rather than bolding cc, in both intents", () => {
    const value = sol('aa', 'bb', 'ff', 'cc');

    for (const intent of ['propose', 'edit'] as const) {
      const dave = daveOn(value, intent);

      addBold(dave, point([0, 0], 1), point([1, 0], 2));
      assert.deepEqual(
        [dave.refusals, dave.editor.read.children()],
        [[['crosses']], value],
        intent
      );
    }
  });

  it('records Bold set at an explicit path inside the frame image of a selection elsewhere, in both intents', () => {
    const value = reorder('xy', 'uv');

    for (const intent of ['propose', 'edit'] as const) {
      const dave = daveOn(value, intent);

      command(dave, point([0, 0, 0], 1), point([2, 0], 1), (tx) =>
        tx.command(editorCommands.setNodes, {
          options: { at: [3, 0] },
          props: { bold: true },
        })
      );
      assert.deepEqual(
        [dave.refusals, withoutIds([dave.editor.read.children()[3]])],
        [[], [within(value[3], bolded(intent)('uv'))]],
        intent
      );
    }
  });

  it("refuses Enter at the 7 points of Sol's crossed deletion that would save another split and saves the frame's own Enter at the other 5, in both intents", () => {
    const value = sol('aa', 'bb', 'ff', 'cc');
    const [aa, bb, ff, cc] = value as [Block, Block, Block, Block];
    const refused: Array<[string, Point, string]> = [
      ['the end of aa', point([0, 0], 2), 'crosses'],
      ['the start of bb', point([1, 0], 0), 'crosses'],
      ['the middle of bb', point([1, 0], 1), 'crosses'],
      ['the end of bb', point([1, 0], 2), 'crosses'],
      ['the start of cc', point([3, 0], 0), 'crosses'],
      ['the middle of cc', point([3, 0], 1), 'reordered'],
      ['the end of cc', point([3, 0], 2), 'reordered'],
    ];

    for (const intent of ['propose', 'edit'] as const) {
      const change = intent === 'edit' ? '~edit:dave' : 'dave:1';
      const split = (...extra: Member[]) =>
        intent === 'edit' && extra.length === 0
          ? undefined
          : [{ ...by('dave', 'split', Object.assign({}, ...extra)), change }];
      const follower = split(follows('alice:1'));
      const saved: Array<[string, Point, readonly Block[], string]> = [
        [
          'the start of aa',
          point([0, 0], 0),
          [paragraph(''), paragraph('aa', split()), bb, ff, cc],
          '\naacc\nff',
        ],
        [
          'the middle of aa',
          point([0, 0], 1),
          [paragraph('a'), paragraph('a', split()), bb, ff, cc],
          'a\nacc\nff',
        ],
        [
          'the start of ff',
          point([2, 0], 0),
          [aa, bb, paragraph('', ff.authored), paragraph('ff', follower), cc],
          'aacc\n\nff',
        ],
        [
          'the middle of ff',
          point([2, 0], 1),
          [aa, bb, paragraph('f', ff.authored), paragraph('f', follower), cc],
          'aacc\nf\nf',
        ],
        [
          'the end of ff',
          point([2, 0], 2),
          [aa, bb, paragraph('ff', ff.authored), paragraph('', follower), cc],
          'aacc\nff\n',
        ],
      ];

      for (const [name, at, reason] of refused) {
        const dave = daveOn(value, intent);

        typeBreak(dave, at);
        assert.deepEqual(
          [dave.refusals, dave.editor.read.children()],
          [[[reason]], value],
          `Enter at ${name} in ${intent}`
        );
      }
      for (const [name, at, stored, shown] of saved) {
        const dave = daveOn(value, intent);

        typeBreak(dave, at);
        assert.deepEqual(
          [
            dave.refusals,
            dave.editor.read.children(),
            textOf(dave.live.read.children()),
            ...shows(dave),
          ],
          [[], stored, shown, freshProposed(dave), freshProposed(dave)],
          `Enter at ${name} in ${intent}`
        );
      }
    }
  });

  it("refuses with crosses select-all Delete on Sol's crossed deletion, whose moved last block follows the joined line, and stores nothing, in both intents", () => {
    const value = sol('a', 'b', 'f', 'c');

    for (const intent of ['propose', 'edit'] as const) {
      const dave = daveOn(value, intent);

      deleteRange(point([0, 0], 0), point([3, 0], 1))(dave);
      assert.deepEqual(
        [dave.refusals, dave.editor.read.children()],
        [[['crosses']], value],
        intent
      );
    }
  });

  it('refuses with crosses select-all Delete where a joined line and its follower sit in a quote, and stores nothing', () => {
    const dave = daveOn(BUILT);

    deleteRange(point([0, 0, 0], 0), point([1, 0], 2))(dave);
    assert.deepEqual(
      [dave.refusals, dave.editor.read.children()],
      [[['crosses']], BUILT]
    );
  });

  it('refuses with reordered Enter at the end of a joined line whose follower is saved before the joiner, in Suggesting and in Editing on an intent view', () => {
    const proposing = daveOn(BUILT);
    const editing = daveOn(BUILT);
    const view = createEditorView(editing.editor, {
      authored: { intent: 'edit' },
    });
    const enter = point([0, 2, 0], 1);

    typeBreak(proposing, enter);
    view.update((tx) => {
      tx.selection.set({ anchor: enter, focus: enter });
      tx.command(editorCommands.insertBreak);
    });
    assert.deepEqual(
      [
        proposing.refusals,
        proposing.editor.read.children(),
        editing.refusals,
        editing.editor.read.children(),
      ],
      [[['reordered']], BUILT, [['reordered']], BUILT]
    );
  });

  it('refuses with reordered Enter at the end of abc beside an edit in a distant paragraph, in both intents', () => {
    // A short root and one long enough that the two edits share no part of
    // its index.
    for (const gaps of [1, 80]) {
      const value = [
        ...BUILT,
        ...Array.from({ length: gaps }, () => paragraph('xx')),
        paragraph('yy'),
      ];
      const enterAndType = defineCommand(`test.enterAndType.${gaps}`, {
        build: ({ state }) =>
          state.transaction((tx) => {
            tx.break.insert();
            // `yy` in the frame's document, below the quote and the gaps.
            tx.text.insert('!', { at: point([gaps + 1, 0], 0) as never });
          }),
      });

      for (const intent of ['propose', 'edit'] as const) {
        const dave = daveOn(value, intent);
        const enter = point([0, 2, 0], 1);

        command(dave, enter, enter, (tx) => tx.command(enterAndType));
        assert.deepEqual(
          [dave.refusals, dave.editor.read.children()],
          [[['reordered']], value],
          `${gaps} in ${intent}`
        );
      }
    }
  });

  it('guard: reaches a moved paragraph through a node command at its path and a node selection on it', () => {
    const value = reorder('xy', 'uv');
    const removed = [
      ...value.slice(0, 3),
      paragraph(
        [leaf('uv', DAVE_DELETE)],
        [by('bob', 'split', follows('alice:1')), by('dave', 'unwrap')]
      ),
    ];
    const atPath = daveOn(value);
    const selected = daveOn(value);

    atPath.editor.update((tx) =>
      tx.command(editorCommands.removeNodes, { options: { at: [3] } })
    );
    selected.editor.update((tx) => {
      tx.selection.set(SelectionApi.nodes([[3]], { mode: 'block' }));
      tx.command(editorCommands.removeNodes, {});
    });
    assert.deepEqual(
      [
        atPath.refusals,
        atPath.editor.read.children(),
        ...shows(atPath),
        selected.refusals,
        selected.editor.read.children(),
      ],
      [[], removed, freshProposed(atPath), freshProposed(atPath), [], removed]
    );
  });

  it('keeps an anchor inside a moved paragraph on its letter, refuses a command range across a move edge and drops a highlight inside text the frame deletes', () => {
    const typing = daveOn(reorder('xy', 'uv'));
    const anchor = typing.editor.anchor(point([3, 0], 1), {
      deletion: 'drop',
    });
    const deleting = daveOn(reorder('xy', 'uv'), 'edit');
    const highlight = deleting.editor.anchor(
      { anchor: point([3, 0], 0), focus: point([3, 0], 1) },
      { deletion: 'drop' }
    );
    const ranged = daveOn(BUILT);

    typeAt(typing, point([3, 0], 0), 'D');
    deleteRange(point([3, 0], 0), point([3, 0], 2))(deleting);
    ranged.editor.update((tx) =>
      tx.command(editorCommands.insertText, {
        options: {
          at: { anchor: point([0, 1, 0], 1), focus: point([0, 2, 0], 1) },
        },
        text: 'D',
      })
    );
    assert.deepEqual(
      [
        anchor.resolve(),
        highlight.resolve(),
        ranged.refusals,
        ranged.editor.read.children(),
      ],
      [{ offset: 1, path: [3, 1] }, null, [['crosses']], BUILT]
    );
  });

  // Bob's join of `gh` into `ef` strikes all of `gh`, so Carol's `ab`, saved
  // between them, already shows where it lands: [cd, e, ab].
  it('records an Editing delete from struck text to a follower that only struck text keeps from its landing point', () => {
    const value = [
      paragraph('cd'),
      paragraph([leaf('e'), leaf('f', by('bob', 'delete'))]),
      paragraph('ab', [by('carol', 'split', follows('bob:1'))]),
      paragraph([leaf('gh', by('bob', 'delete'))], [by('bob', 'join')]),
    ];
    const dave = daveOn(value, 'edit');

    const shown = [paragraph('cd'), paragraph('eab')];

    deleteRange(point([1, 1], 0), point([2, 0], 0))(dave);
    assert.deepEqual(
      [dave.refusals, dave.editor.read.children(), ...shows(dave)],
      [
        [],
        [
          value[0],
          value[1],
          paragraph('ab', [
            by('carol', 'split', follows('bob:1')),
            { at: 1, author: 'dave', change: '~edit:dave', kind: 'join' },
          ]),
          value[3],
        ],
        shown,
        shown,
      ]
    );
  });

  it('records Bold over the letters a selection holds where the preview hides a pending deletion between them and shows it nowhere else, in both intents', () => {
    // M6's document with Bob's pending deletion of `x` inside its first line.
    const value = [
      quote(
        paragraph([leaf('c'), leaf('x', by('bob', 'delete')), leaf('d')]),
        paragraph('ab', [by('carol', 'split', follows('alice:1'))]),
        paragraph('ef', [by('alice', 'join')])
      ),
    ];
    const [, ab, ef] = value[0].children as readonly Block[];

    assertBolds([
      [
        'c and the struck x',
        value,
        point([0, 0, 0], 0),
        point([0, 0, 1], 1),
        (bold) => [
          quote(
            paragraph([bold('c'), leaf('x', by('bob', 'delete')), leaf('d')]),
            ab,
            ef
          ),
        ],
      ],
    ]);
  });

  it('refuses with crosses, leaving the saved value as it was, an edit whose selected letters show elsewhere than its frame image, in both intents', () => {
    // Proposed shows [cdef, ab], so nothing lies between the end of cd and the
    // start of ef.
    const emptyImage = [
      paragraph('cd'),
      paragraph('ab', [by('carol', 'split', follows('alice:1'))]),
      paragraph('ef', [by('alice', 'join')]),
    ];
    const erinFollows = (change: string) => [
      {
        at: 1,
        author: 'erin',
        change: '~edit:erin',
        kind: 'insert',
        ...follows(change),
      },
    ];
    // The quote follows Carol's join of wx and its empty paragraph Bob's join
    // of yz, so Proposed shows uvwx first and the quote after it.
    const nested = [
      paragraph('uv'),
      {
        authored: erinFollows('carol:1'),
        children: [
          paragraph('cd'),
          paragraph('', erinFollows('bob:1')),
          paragraph('ef'),
        ],
        type: 'quote',
      },
      paragraph('wx', [by('carol', 'join')]),
      paragraph('gh'),
      paragraph('yz', [by('bob', 'join')]),
    ];
    const typeOver = (anchor: Point, focus: Point) => (dave: Built) =>
      command(dave, anchor, focus, (tx) =>
        tx.command(editorCommands.insertText, { text: 'Z' })
      );
    const bold = (anchor: Point, focus: Point) => (dave: Built) =>
      addBold(dave, anchor, focus);
    const cases: Array<[string, readonly Block[], (dave: Built) => void]> = [
      [
        'Bold from the end of cd to the start of ef',
        emptyImage,
        bold(point([0, 0], 2), point([2, 0], 0)),
      ],
      [
        'Z typed from the end of cd to the start of ef',
        emptyImage,
        typeOver(point([0, 0], 2), point([2, 0], 0)),
      ],
      [
        'Bold from the end of uv to the start of wx',
        nested,
        bold(point([0, 0], 2), point([2, 0], 0)),
      ],
    ];

    for (const [name, value, act] of cases) {
      for (const intent of ['propose', 'edit'] as const) {
        const dave = daveOn(value, intent);

        act(dave);
        assert.deepEqual(
          [dave.refusals, dave.editor.read.children()],
          [[['crosses']], value],
          `${name} in ${intent}`
        );
      }
    }
  });

  describe('reads a preview by its own places', () => {
    type Reader = Readonly<{
      key: (path: readonly number[]) => string | undefined;
      read: Readonly<{
        authored: Record<string, (...args: any[]) => any>;
        children: () => readonly Block[];
      }>;
    }>;
    type Preview = 'accepted' | 'proposed';

    const previewOf = (
      { editor }: Built,
      preview: Preview,
      root?: string
    ): Reader =>
      createEditorView(editor, {
        authored: { preview },
        ...(root && { root }),
      }) as unknown as Reader;
    const ownerOf = ({ editor }: Built) => editor as unknown as Reader;
    const idsAt = (view: Reader, at: unknown): string[] =>
      view.read.authored
        .changes({ at })
        .items.map(({ id }: { id: string }) => id);
    const cardsAt = (view: Reader, at: unknown): string[] =>
      view.read.authored.groups({ at }).map(({ id }: { id: string }) => id);
    // The same block read by the view's path and by the view's key.
    const byPathAndKey = (view: Reader, path: readonly number[]) => [
      idsAt(view, path),
      idsAt(view, view.key(path)),
    ];

    // Bob inserts `new` above Dave's struck `!`, so Accepted shows [alpha!, beta].
    const insertedAbove = [
      paragraph([leaf('new', by('bob', 'insert'))], [by('bob', 'insert')]),
      paragraph([leaf('alpha'), leaf('!', by('dave', 'delete'))]),
      paragraph('beta'),
    ];

    it('reads a block after an inserted block under Accepted by its key and its path', () => {
      const accepted = previewOf(editorOf(insertedAbove, 'zed'), 'accepted');

      assert.deepEqual(texts(accepted.read.children()), ['alpha!', 'beta']);
      assert.deepEqual(
        [byPathAndKey(accepted, [0]), byPathAndKey(accepted, [1])],
        [
          [['dave:1'], ['dave:1']],
          [[], []],
        ]
      );
    });

    it('reads the card of an insertion Accepted hides in a block, by its key and its path', () => {
      const accepted = previewOf(
        editorOf(
          [paragraph([leaf('alpha'), leaf('++', by('carol', 'insert'))])],
          'zed'
        ),
        'accepted'
      );
      const key = accepted.key([0]);

      assert.deepEqual(texts(accepted.read.children()), ['alpha']);
      assert.deepEqual(
        [idsAt(accepted, [0]), idsAt(accepted, key), cardsAt(accepted, key)],
        [['carol:1'], ['carol:1'], ['carol:1']]
      );
    });

    it('throws the typed error for a point or a range read on a preview, on the owner in Accepted and on a view inheriting it', () => {
      const doc = editorOf(insertedAbove, 'zed');
      const place = { offset: 0, path: [0, 0] };
      const range = { anchor: place, focus: { offset: 2, path: [0, 0] } };
      const refuses = (view: Reader) => {
        for (const read of [
          () => view.read.authored.changes({ at: place }),
          () => view.read.authored.changes({ at: range }),
          () => view.read.authored.groups({ at: range }),
        ]) {
          assert.throws(read, (error: unknown) => {
            assert.ok(error instanceof authoredEntry.AuthoredPlaceError);
            assert.equal(error.name, 'AuthoredPlaceError');
            assert.match(error.message, /key or path/);

            return true;
          });
        }
      };

      assert.deepEqual(idsAt(ownerOf(doc), range), ['bob:1']);
      refuses(previewOf(doc, 'accepted'));
      doc.authored.api.authored.setView({ preview: 'accepted' });
      refuses(ownerOf(doc));
      refuses(createEditorView(doc.editor) as unknown as Reader);
    });

    it('reads each block of a reordered run by its key and its path, with equal or distinct text, loaded fresh and built by commands', () => {
      for (const bob of ['uv', 'xy']) {
        const proposed = previewOf(
          editorOf(reorder('xy', bob), 'zed'),
          'proposed'
        );

        assert.deepEqual(texts(proposed.read.children()), [['abc', bob], 'xy']);
        assert.deepEqual(
          [
            byPathAndKey(proposed, [0, 0]),
            byPathAndKey(proposed, [0, 1]),
            byPathAndKey(proposed, [1]),
          ],
          [
            [['alice:1'], ['alice:1']],
            [['bob:1'], ['bob:1']],
            [['carol:1'], ['carol:1']],
          ],
          bob
        );
      }

      const proposed = previewOf(editorOf(built(), 'zed'), 'proposed');

      assert.deepEqual(texts(proposed.read.children()), [['abc', 'TT', 'd']]);
      assert.deepEqual(
        [
          byPathAndKey(proposed, [0, 0]),
          byPathAndKey(proposed, [0, 1]),
          byPathAndKey(proposed, [0, 2]),
        ],
        [
          [['alice:1'], ['alice:1']],
          [['carol:1'], ['carol:1']],
          [
            ['alice:1', 'bob:1'],
            ['alice:1', 'bob:1'],
          ],
        ]
      );
    });

    it("reads Bob's card on the line Sol's crossed deletion merges and only Carol's on the piece it moves", () => {
      const proposed = previewOf(
        editorOf(sol('a', 'b', 'f', 'c'), 'zed'),
        'proposed'
      );

      assert.deepEqual(texts(proposed.read.children()), ['ac', 'f']);
      assert.deepEqual(
        [
          byPathAndKey(proposed, [0]),
          cardsAt(proposed, [0]),
          byPathAndKey(proposed, [1]),
        ],
        [
          [
            ['bob:1', 'alice:1'],
            ['bob:1', 'alice:1'],
          ],
          ['bob:1', 'alice:1'],
          [['carol:1'], ['carol:1']],
        ]
      );
    });

    it('reads in no block a paragraph hidden between a joiner and its follower, which an intent view reads', () => {
      const doc = editorOf(
        [
          quote(paragraph('ab')),
          paragraph('c', [by('alice', 'join')]),
          paragraph([leaf('X', by('dan', 'delete'))], [by('dan', 'delete')]),
          paragraph('uv', [by('bob', 'split', follows('alice:1'))]),
        ],
        'zed'
      );
      const proposed = previewOf(doc, 'proposed');

      assert.deepEqual(texts(proposed.read.children()), [['abc', 'uv']]);
      assert.deepEqual(
        [
          idsAt(proposed, [0]),
          idsAt(proposed, [0, 0]),
          idsAt(proposed, [0, 1]),
          idsAt(ownerOf(doc), [2]),
        ],
        [['alice:1', 'bob:1'], ['alice:1'], ['bob:1'], ['dan:1']]
      );
    });

    it('reads a paragraph hidden between two a quote shows on the quote, by its key and its path, and on neither of the two', () => {
      const proposed = previewOf(
        editorOf(
          [
            quote(
              paragraph('A'),
              paragraph(
                [leaf('H', by('bob', 'delete'))],
                [by('bob', 'delete')]
              ),
              paragraph('B')
            ),
          ],
          'zed'
        ),
        'proposed'
      );

      assert.deepEqual(texts(proposed.read.children()), [['A', 'B']]);
      assert.deepEqual(
        [
          byPathAndKey(proposed, [0]),
          byPathAndKey(proposed, [0, 0]),
          byPathAndKey(proposed, [0, 1]),
        ],
        [
          [['bob:1'], ['bob:1']],
          [[], []],
          [[], []],
        ]
      );
    });

    it("reads an emptied join target's changes on the joined line", () => {
      const proposed = previewOf(
        editorOf(
          [
            quote(paragraph([leaf('a', by('dave', 'delete'))])),
            paragraph('c', [by('alice', 'join')]),
            paragraph(
              [leaf('xy', by('carol', 'insert'))],
              [by('carol', 'insert')]
            ),
            paragraph('uv', [by('bob', 'split', follows('alice:1'))]),
          ],
          'zed'
        ),
        'proposed'
      );

      assert.deepEqual(texts(proposed.read.children()), [['c', 'uv'], 'xy']);
      assert.deepEqual(byPathAndKey(proposed, [0, 0]), [
        ['dave:1', 'alice:1'],
        ['dave:1', 'alice:1'],
      ]);
    });

    // What one read of the middle child costs, after a read that warms it.
    const readWork = (view: Reader, at: readonly number[]) => {
      const read = () => ({ cards: cardsAt(view, at), ids: idsAt(view, at) });

      read();
      resetLedgerWork();

      const result = read();
      const { cardSummaries, entriesScanned, occurrencesVisited } =
        readLedgerWork();

      return {
        ...result,
        work: { cardSummaries, entriesScanned, occurrencesVisited },
      };
    };

    it("reads the quote's card and its own on each child a pending unwrap lifts, never a sibling's, at a cost per read that stays at 64 and 512 children", () => {
      const lifted = (count: number) => {
        const proposed = previewOf(
          editorOf(
            [
              {
                authored: [by('alice', 'unwrap')],
                children: Array.from({ length: count }, (_, index) =>
                  paragraph([leaf('p'), leaf('+', by(`c${index}`, 'insert'))])
                ),
                type: 'quote',
              },
            ],
            'zed'
          ),
          'proposed'
        );

        assert.equal(proposed.read.children().length, count);

        return readWork(proposed, [count / 2]);
      };
      const small = lifted(64);
      const large = lifted(512);

      assert.deepEqual(
        [small.ids, small.cards, large.ids, large.cards],
        [
          ['alice:1', 'c32:1'],
          ['alice:1', 'c32:1'],
          ['alice:1', 'c256:1'],
          ['alice:1', 'c256:1'],
        ]
      );
      assert.ok(small.work.occurrencesVisited > 0);
      assert.deepEqual(large.work, small.work);
    });

    it('reads one card of 64 and 512 members in one quote at a cost per child read that stays', () => {
      const card = (count: number) => {
        const proposed = previewOf(
          editorOf(
            [
              quote(
                ...Array.from({ length: count }, (_, index) => {
                  const insert = by('bob', 'insert', {
                    change: `bob:${index + 1}`,
                  });

                  return paragraph([leaf('x', insert)], [insert]);
                })
              ),
            ],
            'zed'
          ),
          'proposed'
        );
        const read = readWork(proposed, [0, count / 2]);
        const [summary] = proposed.read.authored.groups({ at: [0, 0] });

        return { ...read, changeCount: summary.changeCount };
      };
      const small = card(64);
      const large = card(512);

      assert.deepEqual(
        [small.ids, small.cards, small.changeCount],
        [['bob:33'], ['bob:1'], 64]
      );
      assert.deepEqual(
        [large.ids, large.cards, large.changeCount],
        [['bob:257'], ['bob:1'], 512]
      );
      assert.ok(small.work.occurrencesVisited > 0);
      assert.deepEqual(large.work, small.work);
    });

    it('reads a suggested move on the moved block where each preview shows it', () => {
      const doc = editorOf(
        [
          paragraph('a'),
          paragraph([leaf('b'), leaf('+', by('carol', 'insert'))]),
          paragraph('c'),
        ],
        'bob'
      );

      doc.editor.update((tx) => tx.nodes.move({ at: [1], to: [2] }));

      const proposed = previewOf(doc, 'proposed');
      const accepted = previewOf(doc, 'accepted');

      assert.deepEqual(
        [texts(proposed.read.children()), texts(accepted.read.children())],
        [
          ['a', 'c', 'b+'],
          ['a', 'b', 'c'],
        ]
      );
      assert.deepEqual(
        [
          byPathAndKey(proposed, [1]),
          byPathAndKey(proposed, [2]),
          byPathAndKey(accepted, [1]),
          byPathAndKey(accepted, [2]),
        ],
        [
          [[], []],
          [
            ['bob:1', 'carol:1'],
            ['bob:1', 'carol:1'],
          ],
          [
            ['bob:1', 'carol:1'],
            ['bob:1', 'carol:1'],
          ],
          [[], []],
        ]
      );
    });

    it('reads no card on the block schema completion adds for a deleted only block, by its key', () => {
      const proposed = previewOf(
        editorOf(
          [
            paragraph(
              [leaf('gone', by('bob', 'delete'))],
              [by('bob', 'delete')]
            ),
          ],
          'zed'
        ),
        'proposed'
      );

      assert.deepEqual(texts(proposed.read.children()), ['']);
      assert.deepEqual(
        [...byPathAndKey(proposed, [0]), cardsAt(proposed, [0])],
        [[], [], []]
      );
    });

    it("reads a notes root by its own shown paths, never main's", () => {
      // Quotes declares no notes root, so this editor runs without a schema.
      const editor = createEditor({
        initialValue: {
          children: [paragraph('m'), paragraph('n')],
          roots: { notes: insertedAbove },
        } as never,
        plugins: [createAuthoredPlugin({ authorId: 'zed' })],
      });
      const notes = previewOf({ editor } as Built, 'accepted', 'notes');

      assert.deepEqual(texts(notes.read.children()), ['alpha!', 'beta']);
      assert.deepEqual(
        [byPathAndKey(notes, [0]), byPathAndKey(notes, [1])],
        [
          [['dave:1'], ['dave:1']],
          [[], []],
        ]
      );
    });

    it('reads nothing by a stored key the preview lacks', () => {
      const doc = editorOf(insertedAbove, 'zed');
      const key = doc.editor.key([0]);

      assert.deepEqual(idsAt(previewOf(doc, 'accepted'), key), []);
    });

    it('reads an insertion Accepted hides between two texts on their block, never on either text', () => {
      const accepted = previewOf(
        editorOf(
          [
            paragraph([
              { bold: true, text: 'a' } as Leaf,
              leaf('X', by('carol', 'insert')),
              leaf('b'),
            ]),
          ],
          'zed'
        ),
        'accepted'
      );

      assert.deepEqual(texts(accepted.read.children()), ['ab']);
      assert.deepEqual(
        [
          byPathAndKey(accepted, [0]),
          byPathAndKey(accepted, [0, 0]),
          byPathAndKey(accepted, [0, 1]),
        ],
        [
          [['carol:1'], ['carol:1']],
          [[], []],
          [[], []],
        ]
      );
    });

    it("reads nothing on a Proposed view of a root a suggested card deletion drops, though Alice's pending text sits in it, and throws the typed error for a point", () => {
      const text = () => schema.content.text({ default: 'text', min: 1 });
      const Cards = defineEditorSchema('authored-plugin-cards', {
        elements: {
          card: {
            content: text(),
            contentRoots: {
              body: {
                content: schema.content.type('paragraph', {
                  default: { type: 'paragraph' },
                  min: 1,
                }),
                ownership: 'exclusive',
              },
            },
          },
          paragraph: { content: text() },
        },
        id: 'authored-plugin-cards',
        root: schema.content.types(['paragraph', 'card'], {
          default: { type: 'paragraph' },
          min: 1,
        }),
        unknown: 'reject',
        version: 1,
      });
      const cardsOf = (author: string, value: unknown) => {
        let count = 0;

        return createEditor({
          initialValue: structuredClone(value) as never,
          plugins: [
            Cards,
            createAuthoredPlugin({
              authorId: author,
              createChangeId: () => `${author}:${(count += 1)}`,
              intent: 'propose',
              now: () => 1,
            }),
          ],
        });
      };
      const alice = cardsOf('alice', {
        children: [
          {
            childRoots: { body: 'b1' },
            children: [{ text: 'C' }],
            type: 'card',
          },
          paragraph('aa'),
        ],
        roots: { b1: [paragraph('Body')] },
      });
      const end = { offset: 4, path: [0, 0], root: 'b1' };

      alice.update((tx) => {
        tx.selection.set({ anchor: end, focus: end });
        tx.text.insert('Z');
      });

      const bob = cardsOf('bob', alice.read.value());

      bob.update((tx) => tx.nodes.remove({ at: [0] }));

      const proposed = previewOf({ editor: bob } as never, 'proposed', 'b1');
      const intent = createEditorView(bob, { root: 'b1' }) as unknown as Reader;

      assert.deepEqual(
        [
          idsAt(intent, [0]),
          proposed.read.children().length,
          idsAt(proposed, [0]),
          cardsAt(proposed, [0]),
        ],
        [['alice:1'], 0, [], []]
      );
      assert.throws(
        () => idsAt(proposed, { offset: 0, path: [0, 0] }),
        authoredEntry.AuthoredPlaceError
      );
    });

    it("guard: reads a quote's property change on the quote, never on a paragraph inside it, in each preview", () => {
      const doc = editorOf(
        [
          {
            authored: [
              {
                at: 1,
                author: 'alice',
                before: 'old',
                change: 'alice:1',
                id: 'alice:1:cite',
                key: 'cite',
                kind: 'format',
                write: { kind: 'set', value: 'new' },
              },
            ],
            children: [paragraph('a'), paragraph('b')],
            cite: 'new',
            type: 'quote',
          },
        ],
        'zed'
      );

      for (const preview of ['accepted', 'proposed'] as const) {
        const view = previewOf(doc, preview);

        assert.deepEqual(
          [idsAt(view, [0]), idsAt(view, [0, 0]), idsAt(view, [0, 1])],
          [['alice:1'], [], []],
          preview
        );
      }
    });

    it('guard: keeps a page cursor read without a place working on another preview', () => {
      const doc = editorOf(sol('a', 'b', 'f', 'c'), 'zed');
      const page = previewOf(doc, 'proposed').read.authored.changes({
        limit: 1,
      });

      assert.deepEqual(
        previewOf(doc, 'accepted')
          .read.authored.changes({ cursor: page.cursor, limit: 1 })
          .items.map(({ id }: { id: string }) => id),
        ['carol:1']
      );
    });

    it('refuses on another preview a page cursor read at a place', () => {
      const doc = editorOf(sol('a', 'b', 'f', 'c'), 'zed');
      const page = previewOf(doc, 'proposed').read.authored.changes({
        at: [0],
        limit: 1,
      });

      assert.deepEqual(
        page.items.map(({ id }: { id: string }) => id),
        ['bob:1']
      );
      assert.throws(
        () =>
          previewOf(doc, 'accepted').read.authored.changes({
            at: [0],
            cursor: page.cursor,
            limit: 1,
          }),
        /Stale authored page cursor/
      );
    });

    describe('names the view blocks a delta changes', () => {
      type Live = Reader &
        Readonly<{ api: ReturnType<typeof make>['authored']['api'] }>;

      // The blocks each delta a subscriber of `view` gets names.
      const watch = (view: Reader | Built['editor']) => {
        const seen: Array<readonly string[]> = [];

        (view as unknown as Live).read.children();
        (view as unknown as Live).api.authored.subscribeChanges((delta) =>
          seen.push(delta.blocks)
        );

        return seen;
      };
      const decide = (
        doc: Built,
        action: 'accept' | 'reject',
        decision:
          | { changes: readonly string[] }
          | { groups: readonly unknown[] }
      ) => {
        let result: unknown;

        doc.editor.update((tx) => {
          result = tx.authored.decide(
            'changes' in decision
              ? {
                  action,
                  changes: decision.changes.map((id) =>
                    doc.authored.read.authored.change(id)
                  ),
                }
              : ({ action, groups: decision.groups } as never)
          );
        });

        return result;
      };
      const editing = (doc: Built) =>
        createEditorView(doc.editor, {
          authored: { intent: 'edit' },
        }) as unknown as Built['editor'];
      const revisionOf = (doc: Built, id: string): number =>
        doc.authored.read.authored.change(id).revision;
      const revisions = (doc: Built) =>
        Object.fromEntries(
          doc.authored.read.authored
            .changes()
            .items.map(({ id, revision }: { id: string; revision: number }) => [
              id,
              revision,
            ])
        );
      const ALPHA_PLUS = paragraph([
        leaf('alpha'),
        leaf('+', by('carol', 'insert')),
      ]);
      // A paragraph Accepted hides and one Proposed hides, so a view block's
      // rank differs from its stored block's.
      const HIDDEN_IN_ACCEPTED = paragraph(
        [leaf('new', by('erin', 'insert'))],
        [by('erin', 'insert')]
      );
      const HIDDEN_IN_PROPOSED = paragraph(
        [leaf('gone', by('erin', 'delete'))],
        [by('erin', 'delete')]
      );

      it('keeps node keys whether or not a publisher subscribes, across a split, a join and an Editing move', () => {
        // Every key each view reads after each step, without the editor's
        // scope, and draft keys by first read, since both count across
        // editors.
        const keysAfterEachStep = (subscribed: boolean) => {
          const drafts = new Map<string, string>();
          const local = (key: string) => {
            if (!/^d[\da-z]+$/.test(key)) return key.replace(/^r[\da-z]+:/, '');
            const named = drafts.get(key) ?? `draft${drafts.size}`;

            drafts.set(key, named);

            return named;
          };
          const doc = editorOf(
            [HIDDEN_IN_ACCEPTED, ALPHA_PLUS, paragraph('beta')],
            'bob'
          );
          const views = [
            ownerOf(doc),
            previewOf(doc, 'accepted'),
            previewOf(doc, 'proposed'),
          ];
          const keysOf = (view: Reader) => {
            const keys: string[] = [];
            const visit = (
              nodes: ReadonlyArray<Block | Leaf>,
              parent: readonly number[]
            ) => {
              nodes.forEach((node, index) => {
                const path = [...parent, index];

                keys.push(local(String(view.key(path))));
                if ('children' in node) visit(node.children, path);
              });
            };

            visit(view.read.children(), []);

            return keys;
          };
          const steps: string[][][] = [];
          const record = () => steps.push(views.map(keysOf));

          for (const view of views) {
            if (subscribed) watch(view);
            else view.read.children();
          }
          typeBreak(doc, point([1, 0], 2));
          record();
          remove(point([3, 0], 0), back)(doc);
          record();
          editing(doc).update((tx) => tx.nodes.move({ at: [0], to: [2] }));
          record();

          return steps;
        };

        assert.deepEqual(keysAfterEachStep(true), keysAfterEachStep(false));
      });

      it('names alpha for a proposal Accepted hides in it', () => {
        const doc = editorOf(
          [HIDDEN_IN_ACCEPTED, paragraph('alpha'), paragraph('beta')],
          'bob'
        );
        const accepted = previewOf(doc, 'accepted');
        const seen = watch(accepted);

        typeAt(doc, point([1, 0], 5), '+');

        assert.deepEqual(
          [seen, idsAt(accepted, accepted.key([0]))],
          [[[accepted.key([0])]], ['bob:1']]
        );
      });

      it('names the line a block Accepted hides whole collapses into when a key lands in that block', () => {
        const deleted = by('alice', 'delete');
        const inserted = by('alice', 'insert');
        const doc = editorOf(
          [
            paragraph([leaf('g', deleted)], [deleted]),
            paragraph([leaf('Y', by('bob', 'insert'))], [inserted]),
            paragraph(
              [leaf('y', by('bob', 'insert')), leaf('h', deleted)],
              [inserted, by('bob', 'split')]
            ),
          ],
          'zed'
        );
        const accepted = previewOf(doc, 'accepted');
        const seen = watch(accepted);

        typeAt(doc, point([1, 0], 0), 'Z');

        assert.deepEqual(
          [seen, idsAt(accepted, accepted.key([1]))],
          [[[accepted.key([1])]], ['alice:1', 'zed:1', 'bob:1']]
        );
      });

      it('names alpha when accepting its insertion under Proposed', () => {
        const doc = editorOf(
          [HIDDEN_IN_PROPOSED, ALPHA_PLUS, paragraph('beta')],
          'zed'
        );
        const proposed = previewOf(doc, 'proposed');
        const seen = watch(proposed);

        decide(doc, 'accept', { changes: ['carol:1'] });

        assert.deepEqual(
          [seen, idsAt(proposed, proposed.key([0]))],
          [[[proposed.key([0])]], []]
        );
      });

      it("names the merged block when accepting Bob's deletion under Proposed, whose read loses Bob", () => {
        const doc = editorOf(
          [
            paragraph('a'),
            paragraph([leaf('b', by('bob', 'delete'))], [by('bob', 'delete')]),
            paragraph(
              [leaf('c', by('carol', 'delete'))],
              [by('carol', 'delete')]
            ),
            paragraph('d', [by('alice', 'join')]),
          ],
          'zed'
        );
        const proposed = previewOf(doc, 'proposed');
        const before = idsAt(proposed, proposed.key([0]));
        const seen = watch(proposed);

        assert.deepEqual(decide(doc, 'accept', { changes: ['bob:1'] }), {
          ids: ['bob:1'],
          status: 'applied',
        });
        assert.deepEqual(
          [before, seen, idsAt(proposed, proposed.key([0]))],
          [
            ['bob:1', 'carol:1', 'alice:1'],
            [[proposed.key([0])]],
            ['carol:1', 'alice:1'],
          ]
        );
      });

      it('names each child when accepting a Suggesting unwrap under Proposed', () => {
        const doc = editorOf(
          [
            HIDDEN_IN_PROPOSED,
            quote(paragraph('x'), paragraph('y')),
            paragraph('z'),
          ],
          'bob'
        );

        doc.editor.update((tx) => tx.nodes.unwrap({ at: [1] }));

        const proposed = previewOf(doc, 'proposed');
        const seen = watch(proposed);

        decide(doc, 'accept', { changes: ['bob:1'] });

        assert.deepEqual(
          [
            texts(proposed.read.children()),
            seen,
            idsAt(proposed, proposed.key([0])),
            idsAt(proposed, proposed.key([1])),
          ],
          [['x', 'y', 'z'], [[proposed.key([0]), proposed.key([1])]], [], []]
        );
      });

      it('names each child it held when rejecting a Suggesting wrap under Accepted, keeping the view objects', () => {
        const doc = editorOf(
          [HIDDEN_IN_ACCEPTED, paragraph('x'), paragraph('y'), paragraph('z')],
          'bob'
        );

        doc.editor.update((tx) =>
          tx.nodes.wrap({ children: [], type: 'quote' } as never, {
            at: { anchor: point([1, 0], 0), focus: point([2, 0], 1) },
          })
        );

        const accepted = previewOf(doc, 'accepted');
        const blocks = accepted.read.children();
        const seen = watch(accepted);

        decide(doc, 'reject', { changes: ['bob:1'] });

        assert.deepEqual(
          [
            texts(blocks),
            accepted.read.children().map((block, at) => block === blocks[at]),
            seen,
            idsAt(accepted, accepted.key([0])),
            idsAt(accepted, accepted.key([1])),
          ],
          [
            ['x', 'y', 'z'],
            [true, true, true],
            [[accepted.key([0]), accepted.key([1])]],
            [],
            [],
          ]
        );
      });

      it('names a block whose last change is decided while the preview keeps its element', () => {
        const doc = editorOf(
          [HIDDEN_IN_ACCEPTED, ALPHA_PLUS, paragraph('beta')],
          'zed'
        );
        const accepted = previewOf(doc, 'accepted');
        const alpha = accepted.read.children()[0];
        const seen = watch(accepted);

        decide(doc, 'reject', { changes: ['carol:1'] });

        assert.deepEqual(
          [
            accepted.read.children()[0] === alpha,
            seen,
            idsAt(accepted, accepted.key([0])),
          ],
          [true, [[accepted.key([0])]], []]
        );
      });

      it('names the right key without throwing after two syncs before one publication, one removing a slot', () => {
        const doc = editorOf(
          [
            paragraph('alpha'),
            paragraph([leaf('beta'), leaf('+', by('carol', 'insert'))]),
          ],
          'zed',
          'edit'
        );
        const seen = watch(doc.editor);

        doc.editor.update((tx) => {
          tx.authored.decide({
            action: 'reject',
            changes: [doc.authored.read.authored.change('carol:1')],
          });
          tx.nodes.remove({ at: [0] });
        });

        assert.deepEqual(
          [
            texts(doc.editor.read.children() as never),
            seen,
            idsAt(ownerOf(doc), doc.editor.key([0])),
          ],
          [['beta'], [[doc.editor.key([0])]], []]
        );
      });

      it('names alpha for two keys by Bob under Accepted before one publication', () => {
        const doc = editorOf(
          [HIDDEN_IN_ACCEPTED, paragraph('alpha'), paragraph('beta')],
          'bob'
        );
        const accepted = previewOf(doc, 'accepted');
        const seen = watch(accepted);

        doc.editor.update((tx) => {
          tx.selection.set(caret([1, 0], 5));
          tx.command(editorCommands.insertText, { text: 'x' });
          tx.command(editorCommands.insertText, { text: 'y' });
        });

        assert.deepEqual(
          [seen, idsAt(accepted, accepted.key([0]))],
          [[[accepted.key([0])]], ['bob:1']]
        );
      });

      it('names the view key of a block a regroup after a dropped block reaches', () => {
        const doc = editorOf(
          [
            HIDDEN_IN_ACCEPTED,
            paragraph('dropped'),
            paragraph([
              leaf('+', by('bob', 'insert')),
              leaf('x'),
              leaf('+', by('bob', 'insert', { change: 'bob:2' })),
            ]),
          ],
          'zed',
          'edit'
        );
        const accepted = previewOf(doc, 'accepted');
        const before = cardsAt(accepted, accepted.key([1]));
        const seen = watch(accepted);

        doc.editor.update((tx) => {
          tx.nodes.remove({ at: [1] });
          tx.text.delete({
            at: { anchor: point([1, 1], 0), focus: point([1, 1], 1) },
          });
        });

        assert.deepEqual(
          [
            before,
            seen,
            idsAt(accepted, accepted.key([0])),
            cardsAt(accepted, accepted.key([0])),
          ],
          [
            ['bob:1', 'bob:2'],
            [[accepted.key([0])]],
            ['bob:1', 'bob:2'],
            ['bob:1'],
          ]
        );
      });

      it('names view keys to the owner in a preview', () => {
        const doc = editorOf(
          [HIDDEN_IN_ACCEPTED, ALPHA_PLUS, paragraph('beta')],
          'zed',
          'edit'
        );

        doc.authored.api.authored.setView({ preview: 'accepted' });

        const seen = watch(doc.editor);

        decide(doc, 'reject', { changes: ['carol:1'] });

        assert.deepEqual(
          [
            texts(ownerOf(doc).read.children()),
            seen,
            idsAt(ownerOf(doc), doc.editor.key([0])),
          ],
          [['alpha', 'beta'], [[doc.editor.key([0])]], []]
        );
      });

      it('names the view key of a decision after switching into Proposed, and maps no occurrence through Proposed places after switching back', () => {
        const doc = editorOf(
          [
            HIDDEN_IN_PROPOSED,
            ALPHA_PLUS,
            paragraph('beta'),
            paragraph('gamma'),
            paragraph('delta'),
          ],
          'zed'
        );
        const seen = watch(doc.editor);

        doc.authored.api.authored.setView({ preview: 'proposed' });
        decide(doc, 'accept', { changes: ['carol:1'] });

        const decided = [
          seen.splice(0),
          idsAt(ownerOf(doc), doc.editor.key([0])),
        ];
        const proposedKey = doc.editor.key([0]);

        doc.authored.api.authored.setView({ intent: 'propose' });
        resetLedgerWork();
        for (const block of [2, 3, 4]) typeAt(doc, point([block, 0], 0), 'x');

        assert.deepEqual(
          [decided, seen, readLedgerWork().previewSites],
          [
            [[[proposedKey]], []],
            [2, 3, 4].map((block) => [doc.editor.key([block])]),
            0,
          ]
        );
      });

      it('maps each Suggesting keystroke selection through a projection both previews already hold', () => {
        const doc = editorOf(
          [HIDDEN_IN_ACCEPTED, HIDDEN_IN_PROPOSED, paragraph('alpha')],
          'zed'
        );

        for (const preview of ['accepted', 'proposed'] as const) {
          const view = createEditorView(doc.editor, { authored: { preview } });

          view.subscribeCommit(() => view.read.selection());
        }
        typeAt(doc, point([2, 0], 0), 'x');
        resetLedgerWork();
        for (const offset of [1, 2, 3]) typeAt(doc, point([2, 0], offset), 'x');

        assert.equal(readLedgerWork().apartSelections, 0);
      });

      it('maps the first Suggesting keystroke after a caret move through the projection Proposed holds, with no view of it subscribed', () => {
        const doc = editorOf(
          [HIDDEN_IN_PROPOSED, paragraph('alpha'), paragraph('beta')],
          'zed'
        );

        createEditorView(doc.editor, { authored: { preview: 'proposed' } }).key(
          [0]
        );
        typeAt(doc, point([1, 0], 0), 'x');
        doc.editor.update((tx) => {
          tx.selection.set(caret([2, 0], 0));
        });
        resetLedgerWork();
        typeAt(doc, point([2, 0], 0), 'x');

        assert.equal(readLedgerWork().apartSelections, 0);
      });

      it("names beta under Accepted for Bob's forced proposal reaching it, whose badge shows Bob's card", () => {
        const doc = editorOf(
          [
            paragraph([
              leaf('alpha'),
              leaf('+', by('bob', 'insert', { change: 'bob:ai' })),
            ]),
            paragraph('beta'),
          ],
          'bob',
          'edit'
        );
        const accepted = previewOf(doc, 'accepted');
        const seen = watch(accepted);

        doc.editor.update((tx) => {
          tx.authored.propose({ changeId: 'bob:ai' });
          tx.selection.set(caret([1, 0], 4));
          tx.command(editorCommands.insertText, { text: '!' });
        });

        assert.deepEqual(
          [
            seen,
            idsAt(accepted, accepted.key([1])),
            cardsAt(accepted, accepted.key([1])),
          ],
          [[[accepted.key([1])]], ['bob:ai'], ['bob:ai']]
        );
      });

      it("names beta under Accepted for an Editing move of Bob's pending text into it, whose badge shows Bob's card", () => {
        const doc = editorOf(
          [
            paragraph([
              leaf('al'),
              leaf('XY', by('bob', 'insert')),
              leaf('pha'),
            ]),
            paragraph('beta'),
          ],
          'zed',
          'edit'
        );
        const accepted = previewOf(doc, 'accepted');
        const seen = watch(accepted);

        doc.editor.api.transfer.move({
          range: { anchor: point([0, 1], 0), focus: point([0, 1], 1) },
          to: { point: point([1, 0], 4) },
        });

        assert.deepEqual(
          [
            seen,
            idsAt(accepted, accepted.key([1])),
            cardsAt(accepted, accepted.key([1])),
          ],
          [[[accepted.key([1])]], ['bob:1'], ['bob:1']]
        );
      });

      for (const on of ['accepted', 'intent'] as const) {
        it(`names alpha and beta for an Editing move of all of Bob's pending text from alpha into beta, and alpha's badge loses Bob's card, ${on === 'accepted' ? 'under Accepted' : 'on an intent view'}`, () => {
          const doc = editorOf(
            [
              paragraph([
                leaf('al'),
                leaf('XY', by('bob', 'insert')),
                leaf('pha'),
              ]),
              paragraph('beta'),
            ],
            'zed',
            'edit'
          );
          const view =
            on === 'accepted'
              ? previewOf(doc, 'accepted')
              : (createEditorView(doc.editor, {
                  authored: { intent: 'propose' },
                }) as unknown as Reader);
          const seen = watch(view);

          doc.editor.api.transfer.move({
            range: { anchor: point([0, 1], 0), focus: point([0, 1], 2) },
            to: { point: point([1, 0], 4) },
          });

          assert.deepEqual(
            [seen, cardsAt(view, view.key([0])), cardsAt(view, view.key([1]))],
            [[[view.key([0]), view.key([1])]], [], ['bob:1']]
          );
        });
      }

      it("names the block an Editing move takes out of Bob's pending join under Proposed, whose read loses Bob", () => {
        const doc = editorOf(
          [
            paragraph('a'),
            paragraph('f', [
              by('erin', 'insert', {
                change: '~edit:erin',
                ...follows('bob:1'),
              }),
            ]),
            paragraph('c', [by('bob', 'join')]),
            paragraph('d'),
          ],
          'dave',
          'edit'
        );
        const proposed = previewOf(doc, 'proposed');
        const key = proposed.key([0]);
        const before = idsAt(proposed, key);
        const seen = watch(proposed);

        doc.editor.update((tx) => tx.nodes.move({ at: [0], to: [3] }));

        assert.deepEqual(
          [before, seen, proposed.key([3]), idsAt(proposed, key)],
          [['bob:1'], [[key]], key, []]
        );
      });

      for (const [name, content, value, at] of [
        [
          'a quote',
          Quotes,
          [HIDDEN_IN_ACCEPTED, quote(paragraph('a'), paragraph('b'))],
          [1, 1, 0],
        ],
        [
          'a table cell',
          Tables,
          [
            HIDDEN_IN_ACCEPTED,
            {
              children: [
                {
                  children: [
                    {
                      children: [paragraph('a'), paragraph('b')],
                      type: 'cell',
                    },
                  ],
                  type: 'row',
                },
              ],
              type: 'table',
            },
          ],
          [1, 0, 0, 1, 0],
        ],
      ] as const) {
        it(`names the kept block holding Bob's suggestion in the second paragraph of ${name}, whose badge shows his card under Accepted and loses it when accepted under Proposed`, () => {
          const doc = editorOf(value, 'bob', 'propose', content);
          const accepted = previewOf(doc, 'accepted');
          const proposed = previewOf(doc, 'proposed');
          const shown = watch(accepted);

          typeAt(doc, point(at, 1), '+');

          const seen = watch(proposed);

          decide(doc, 'accept', { changes: ['bob:1'] });

          assert.deepEqual(
            [shown.slice(0, 1), cardsAt(accepted, accepted.key([0]))],
            [[[accepted.key([0])]], []]
          );
          assert.deepEqual(
            [seen, cardsAt(proposed, proposed.key([1]))],
            [[[proposed.key([1])]], []]
          );
        });
      }

      // Alice's pending unwrap of a quote of eight children, each with its own
      // pending insertion.
      const unwrapOfEight = (author: string, intent: 'edit' | 'propose') =>
        editorOf(
          [
            {
              authored: [by('alice', 'unwrap')],
              children: Array.from({ length: 8 }, (_, index) =>
                paragraph([
                  leaf(`p${index}`),
                  leaf('+', by(`c${index}`, 'insert')),
                ])
              ),
              type: 'quote',
            },
          ],
          author,
          intent
        );

      it("names only the fourth child for typing in it under a Proposed unwrap of eight, keeping the unwrap card's revision", () => {
        const doc = unwrapOfEight('bob', 'propose');
        const proposed = previewOf(doc, 'proposed');
        const revision = revisionOf(doc, 'alice:1');
        const seen = watch(proposed);

        typeAt(doc, point([0, 3, 0], 1), 'k');

        assert.deepEqual(
          [
            seen,
            idsAt(proposed, proposed.key([3])),
            revisionOf(doc, 'alice:1') === revision,
          ],
          [[[proposed.key([3])]], ['alice:1', 'bob:1', 'c3:1'], true]
        );
      });

      it('changes no child’s change revision for an Enter in the fourth child under a Proposed unwrap of eight, only the unwrap’s, whose child list grows', () => {
        const doc = unwrapOfEight('bob', 'propose');
        const before = revisions(doc);

        typeBreak(doc, point([0, 3, 0], 1));

        const after = revisions(doc);

        assert.deepEqual(
          [
            Object.keys(after).filter((id) => !(id in before)),
            Object.keys(before).filter((id) => before[id] !== after[id]),
          ],
          [['bob:1'], ['alice:1']]
        );
      });

      it('names the fifth child for a forced proposal that spreads from the fourth into it under a Proposed unwrap of eight', () => {
        const doc = unwrapOfEight('bob', 'edit');
        const proposed = previewOf(doc, 'proposed');
        const seen = watch(proposed);

        doc.editor.update((tx) => {
          tx.authored.propose({ changeId: 'bob:ai' });
          tx.selection.set(caret([0, 3, 0], 1));
          tx.command(editorCommands.insertText, { text: 'k' });
        });
        doc.editor.update((tx) => {
          tx.authored.propose({ changeId: 'bob:ai' });
          tx.selection.set(caret([0, 4, 0], 1));
          tx.command(editorCommands.insertText, { text: 'k' });
        });

        assert.deepEqual(
          [seen, idsAt(proposed, proposed.key([4]))],
          [
            [[proposed.key([3])], [proposed.key([4])]],
            ['alice:1', 'bob:ai', 'c4:1'],
          ]
        );
      });

      // Bob's Suggesting split of `abcd` after `ab`, with the card Dave read.
      const splitOf = (value: readonly Block[], at: readonly number[]) => {
        const doc = editorOf(value, 'bob');

        typeBreak(doc, point(at, 2));

        return { card: doc.authored.read.authored.groupOf('bob:1'), doc };
      };
      it("keeps the split's revision for a paragraph inserted above `ab` and typing in `ab`", () => {
        const kept = (
          value: readonly Block[],
          at: readonly number[],
          inserted: readonly number[],
          typed: readonly number[]
        ) => {
          const { doc } = splitOf(value, at);
          const revision = revisionOf(doc, 'bob:1');

          editing(doc).update((tx) =>
            tx.nodes.insert(paragraph('N') as never, { at: [...inserted] })
          );

          const above = revisionOf(doc, 'bob:1');

          editing(doc).update((tx) => {
            tx.selection.set(caret([...typed], 1));
            tx.command(editorCommands.insertText, { text: 'k' });
          });

          return [
            texts(doc.editor.read.children() as never).flat(),
            above === revision,
            revisionOf(doc, 'bob:1') === revision,
          ];
        };

        assert.deepEqual(kept([paragraph('abcd')], [0, 0], [0], [1, 0]), [
          ['N', 'akb', 'cd'],
          true,
          true,
        ]);
      });

      it('guard: refuses as stale a reject of a split inside a quote after a paragraph between its halves', () => {
        const { card, doc } = splitOf([quote(paragraph('abcd'))], [0, 0, 0]);

        editing(doc).update((tx) =>
          tx.nodes.insert(paragraph('N') as never, { at: [0, 1] })
        );

        const value = doc.editor.read.value();

        assert.deepEqual(
          [decide(doc, 'reject', { groups: [card] }), doc.editor.read.value()],
          [{ ids: ['bob:1'], status: 'stale' }, value]
        );
      });

      it('lists a split inside a quote as changed after a paragraph lands before its halves', () => {
        const { doc } = splitOf([quote(paragraph('abcd'))], [0, 0, 0]);
        const revision = revisionOf(doc, 'bob:1');
        const changed: string[] = [];

        (doc.editor as unknown as Live).read.children();
        (doc.editor as unknown as Live).api.authored.subscribeChanges((delta) =>
          changed.push(...delta.changed)
        );
        editing(doc).update((tx) =>
          tx.nodes.insert(paragraph('N') as never, { at: [0, 0] })
        );

        assert.deepEqual(
          [revisionOf(doc, 'bob:1') === revision, changed],
          [false, ['bob:1']]
        );
      });

      it('guard: names the second block on an intent view when Bob extends a deletion into it', () => {
        const doc = editorOf(
          [
            paragraph('alpha'),
            paragraph([
              leaf('be', by('bob', 'delete', { change: 'bob:5' })),
              leaf('ta'),
            ]),
          ],
          'bob'
        );
        const writer = createEditorView(doc.editor, {
          authored: { intent: 'propose' },
        }) as unknown as Reader;
        const seen = watch(writer);

        deleteRange(point([0, 0], 3), point([1, 1], 1))(doc);

        assert.deepEqual(
          [
            seen.length,
            seen.flat().includes(writer.key([1])),
            idsAt(writer, writer.key([1])).sort(),
          ],
          [1, true, ['bob:1', 'bob:5']]
        );
      });

      it("guard: names no block but the typed one for typing at the end of Bob's insertion across 40 paragraphs", () => {
        const insert = by('bob', 'insert');
        const doc = editorOf(
          Array.from({ length: 40 }, () =>
            paragraph([leaf('p', insert)], [insert])
          ),
          'bob'
        );
        const seen = watch(doc.editor);

        typeAt(doc, point([39, 0], 1), 'k');

        assert.deepEqual(
          [
            seen.length,
            seen.flat().filter((key) => key !== doc.editor.key([39])),
            idsAt(ownerOf(doc), [39]),
          ],
          [1, [], ['bob:1']]
        );
      });
    });
  });
});

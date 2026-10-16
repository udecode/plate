import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  ContentSlice,
  createEditor,
  createEditorView,
  defineEditorSchema,
  editorCommands,
  type EditorUpdateTransaction,
  schema,
} from 'plitejs';

import type { AuthoredChangesDelta, AuthoredView } from '../src/authored';
import { createAuthoredPlugin } from '../src/authored/authored';
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

const mark = (
  change: string,
  kind: 'delete' | 'insert' | 'join',
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

  it('reads a card of ten thousand touching changes as one summary', () => {
    // The oldest change sits mid-card.
    const editor = createEditor({
      initialValue: Array.from({ length: 10_000 }, (_, index) => ({
        authored: [format(`run:${index}`, index === 5000 ? 1 : index + 2)],
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
      [['run:5000', 10_000]]
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

  const rejectDave = {
    blocks: [],
    changed: [],
    groups: ['dave:3'],
    removed: ['dave:3'],
  };

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

    assert.deepEqual(seen, [rejectDave]);
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
        blocks: [editor.key([1])],
        changed: ['carol:1'],
        groups: ['bob:1', 'carol:1', 'carol:2'],
        removed: ['bob:1'],
      },
    ]);
  });

  for (const [side, ats, renamed] of [
    ['before the key', [1, 2, 3], [2]],
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

    assert.deepEqual(seen, [rejectDave]);
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

    assert.deepEqual(seen, [[rejectDave], [rejectDave]]);
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
      [{ ids: ['carol:1'], status: 'stale' }, [rejectDave]]
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

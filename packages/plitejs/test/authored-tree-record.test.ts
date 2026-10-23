import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import fc from 'fast-check';
import {
  ContentSlice,
  createEditor,
  createEditorView,
  defineEditorSchema,
  editorCommands,
  property,
  schema,
  target,
  transfer,
} from 'plitejs';
import { history } from 'plitejs/history';

import { createAuthoredPlugin } from '../src/authored/authored';
import {
  authoredTestApi,
  expandedChildren,
  recordsOf,
  reviewedValue,
  storedContexts,
} from './support/authored';

const AT = 1000;
const mark = (
  kind: 'delete' | 'insert' | 'join' | 'split' | 'unwrap' | 'wrap',
  author = 'bob',
  change = `${author}:1`
) => ({ at: AT, author, change, kind });
const paragraph = (...children: Array<Record<string, unknown>>) => ({
  type: 'paragraph',
  children,
});
const point = (offset: number, path = [0, 0]) => ({ offset, path });
/** A whole-block suggestion marks the block and every node inside it. */
const whole = (
  node: Record<string, unknown>,
  ...marks: Array<Record<string, unknown>>
): Record<string, unknown> => ({
  ...node,
  authored: [...((node.authored as unknown[] | undefined) ?? []), ...marks],
  ...(Array.isArray(node.children)
    ? {
        children: node.children.map((child: Record<string, unknown>) =>
          whole(child, ...marks)
        ),
      }
    : {}),
});
const Quotes = defineEditorSchema('record-quotes', {
  elements: {
    paragraph: { content: schema.content.text() },
    quote: { content: schema.content.type('paragraph', { min: 1 }) },
  },
  id: 'record-quotes',
  properties: [schema.textProperty('bold', property.boolean())],
  root: schema.content.any(
    [schema.content.type('paragraph'), schema.content.type('quote')],
    { default: { type: 'paragraph' }, min: 1 }
  ),
  unknown: 'reject',
  version: 1,
});
const NestedQuotes = defineEditorSchema('record-nested-quotes', {
  elements: {
    paragraph: { content: schema.content.text() },
    quote: {
      content: schema.content.types(['paragraph', 'quote'], {
        default: { type: 'paragraph' },
        min: 1,
      }),
    },
  },
  id: 'record-nested-quotes',
  root: schema.content.types(['paragraph', 'quote'], {
    default: { type: 'paragraph' },
    min: 1,
  }),
  unknown: 'reject',
  version: 1,
});
const Links = defineEditorSchema('record-links', {
  elements: {
    link: { content: schema.content.text(), inline: true },
    paragraph: schema.element.textBlock(),
  },
  id: 'record-links',
  root: schema.content.type('paragraph', { min: 1 }),
  unknown: 'reject',
  version: 1,
});
const TitleThenParagraphs = (typeChange: 'drop' | 'preserve-if-allowed') =>
  defineEditorSchema(`record-titled-${typeChange}`, {
    elements: {
      paragraph: { content: schema.content.text() },
      title: { content: schema.content.text() },
    },
    id: `record-titled-${typeChange}`,
    properties: [
      schema.elementProperty('level', property.number(), {
        target: target.type('title'),
      }),
      schema.elementProperty('align', property.string(), {
        target: target.types(['paragraph', 'title']),
        typeChange,
      }),
    ],
    root: schema.content.prefix(
      [{ element: 'title' }],
      schema.content.types(['paragraph'], { default: { type: 'paragraph' } })
    ),
    unknown: 'reject',
    version: 1,
  });
const counter = (author: string) => {
  let count = 0;

  return () => {
    count += 1;

    return `${author}:${count}`;
  };
};

const editorFor = (
  initialValue: Array<Record<string, unknown>>,
  intent: 'edit' | 'propose',
  author = 'bob',
  plugins: readonly unknown[] = []
) =>
  createEditor({
    plugins: [
      ...(plugins as []),
      createAuthoredPlugin({
        authorId: author,
        createChangeId: counter(author),
        createTagId: counter(`${author}-tag`),
        intent,
        now: () => AT,
      }),
    ],
    initialValue,
  });
const suggesting = (
  initialValue: Array<Record<string, unknown>>,
  author = 'bob'
) => editorFor(initialValue, 'propose', author);
const editing = (
  initialValue: Array<Record<string, unknown>>,
  author = 'bob'
) => editorFor(initialValue, 'edit', author);
const annBlue = () => [
  paragraph({
    authored: [
      {
        at: AT,
        author: 'ann',
        change: 'ann:1',
        id: 'a1',
        key: 'color',
        kind: 'format',
        write: { kind: 'set', value: 'blue' },
      },
    ],
    color: 'blue',
    text: 'word',
  }),
];
const colorState = (editor: ReturnType<typeof editorFor>) => {
  const [leaf] = (
    editor.read.children()[0] as { children: Array<{ color?: string }> }
  ).children;

  return {
    accepted: editor.read.authored.reviewOf(leaf).accepted.color ?? null,
    color: leaf.color ?? null,
    pending: editor.read.authored.changes().items.map(({ id }) => id),
  };
};
const setColor = (editor: ReturnType<typeof editorFor>, value: string) =>
  editor.update((tx) =>
    tx.nodes.set({ color: value } as never, { at: [0, 0] })
  );

describe('authored review tree recording', () => {
  it('records typed text as an insertion in Suggesting', () => {
    const editor = suggesting([paragraph({ text: 'keep tail' })]);

    editor.update((tx) => {
      tx.text.insert('new ', { at: point(5) });
    });

    assert.deepEqual(editor.read.children(), [
      paragraph(
        { text: 'keep ' },
        { text: 'new ', authored: [mark('insert')] },
        { text: 'tail' }
      ),
    ]);
  });

  it('keeps deleted text in place under a delete mark in Suggesting', () => {
    const editor = suggesting([paragraph({ text: 'keep gone tail' })]);

    editor.update((tx) => {
      tx.text.delete({ at: { anchor: point(5), focus: point(10) } });
    });

    assert.deepEqual(editor.read.children(), [
      paragraph(
        { text: 'keep ' },
        { text: 'gone ', authored: [mark('delete')] },
        { text: 'tail' }
      ),
    ]);
  });

  it('records a replacement as struck text followed by the new text', () => {
    const editor = suggesting([paragraph({ text: 'keep gone tail' })]);

    editor.update((tx) => {
      tx.selection.set({ anchor: point(5), focus: point(10) });
      tx.text.insert('NEW ');
    });

    assert.deepEqual(editor.read.children(), [
      paragraph(
        { text: 'keep ' },
        { text: 'gone ', authored: [mark('delete')] },
        { text: 'NEW ', authored: [mark('insert')] },
        { text: 'tail' }
      ),
    ]);
  });

  it('removes one’s own pending insertion for real when deleting it', () => {
    const editor = suggesting([
      paragraph(
        { text: 'a' },
        { text: 'mine', authored: [mark('insert')] },
        { text: 'b' }
      ),
    ]);

    editor.update((tx) => {
      tx.text.delete({
        at: { anchor: point(1, [0, 1]), focus: point(3, [0, 1]) },
      });
    });

    assert.deepEqual(editor.read.children(), [
      paragraph(
        { text: 'a' },
        { text: 'me', authored: [mark('insert')] },
        { text: 'b' }
      ),
    ]);
  });

  it('leaves already struck text unchanged when deleting it again', () => {
    const struck = [
      paragraph(
        { text: 'a' },
        { text: 'gone', authored: [mark('delete', 'alice')] },
        { text: 'b' }
      ),
    ];
    const editor = suggesting(struck);

    editor.update((tx) => {
      tx.text.delete({
        at: { anchor: point(0, [0, 1]), focus: point(4, [0, 1]) },
      });
    });

    assert.deepEqual(editor.read.children(), struck);
  });

  it('amends one’s own pending insertion when typing inside it', () => {
    const editor = suggesting([
      paragraph(
        { text: 'a' },
        { text: 'mine', authored: [mark('insert')] },
        { text: 'b' }
      ),
    ]);

    editor.update((tx) => {
      tx.text.insert('X', { at: point(2, [0, 1]) });
    });

    assert.deepEqual(expandedChildren(editor), [
      paragraph(
        { text: 'a' },
        { text: 'miXne', authored: [mark('insert')] },
        { text: 'b' }
      ),
    ]);
  });

  it('amends one’s own pending insertion when typing at its end', () => {
    const editor = suggesting([
      paragraph(
        { text: 'a' },
        { text: 'mine', authored: [mark('insert')] },
        { text: 'b' }
      ),
    ]);

    editor.update((tx) => {
      tx.text.insert('X', { at: point(4, [0, 1]) });
    });

    assert.deepEqual(editor.read.children(), [
      paragraph(
        { text: 'a' },
        { text: 'mineX', authored: [mark('insert')] },
        { text: 'b' }
      ),
    ]);
  });

  it('gives Suggesting text inside another author’s insertion both insert marks', () => {
    const editor = suggesting([
      paragraph(
        { text: 'a' },
        { text: 'hers', authored: [mark('insert', 'alice')] },
        { text: 'b' }
      ),
    ]);

    editor.update((tx) => {
      tx.text.insert('X', { at: point(2, [0, 1]) });
    });

    assert.deepEqual(expandedChildren(editor), [
      paragraph(
        { text: 'a' },
        { text: 'he', authored: [mark('insert', 'alice')] },
        { text: 'X', authored: [mark('insert', 'alice'), mark('insert')] },
        { text: 'rs', authored: [mark('insert', 'alice')] },
        { text: 'b' }
      ),
    ]);
  });

  it('records a Suggesting format on another author’s insertion within one’s own, so rejecting it restores the text', () => {
    const editor = editorFor(
      [
        paragraph(
          { text: 'mi', authored: [mark('insert', 'bob', 'bob:9')] },
          {
            text: 'QR',
            authored: [mark('insert', 'bob', 'bob:9'), mark('insert', 'alice')],
          },
          { text: 'ne', authored: [mark('insert', 'bob', 'bob:9')] }
        ),
      ],
      'propose',
      'bob',
      [Quotes]
    );
    const before = expandedChildren(editor);

    editor.update((tx) => {
      tx.selection.set({ anchor: point(0, [0, 1]), focus: point(2, [0, 1]) });
      tx.marks.add('bold', true);
    });
    authoredTestApi(editor).decide({ action: 'reject', changes: ['bob:1'] });

    assert.deepEqual(expandedChildren(editor), before);
  });

  it('records a Suggesting link in another author’s paragraph within one’s own quote as its own change, so rejecting it restores the text', () => {
    const QuotedLinks = defineEditorSchema('record-quoted-links', {
      elements: {
        link: { content: schema.content.text(), inline: true },
        paragraph: schema.element.textBlock(),
        quote: { content: schema.content.type('paragraph', { min: 1 }) },
      },
      id: 'record-quoted-links',
      root: schema.content.type('quote', { min: 1 }),
      unknown: 'reject',
      version: 1,
    });
    const editor = editorFor(
      [
        whole(
          {
            type: 'quote',
            children: [
              whole(paragraph({ text: 'hers' }), mark('insert', 'alice')),
            ],
          },
          mark('insert', 'bob', 'bob:9')
        ),
      ],
      'propose',
      'bob',
      [QuotedLinks]
    );
    const before = expandedChildren(editor);

    editor.update((tx) =>
      tx.nodes.insert({ type: 'link', children: [{ text: 'L' }] } as never, {
        at: point(2, [0, 0, 0]),
      })
    );
    authoredTestApi(editor).decide({ action: 'reject', changes: ['bob:1'] });

    assert.deepEqual(expandedChildren(editor), before);
  });

  for (const [where, block] of [
    [
      'another author’s insertion',
      paragraph(
        { text: 'a' },
        { text: 'QR', authored: [mark('insert', 'alice')] },
        { text: 'b' }
      ),
    ],
    [
      'another author’s insertion within one’s own',
      paragraph(
        { text: 'mi', authored: [mark('insert', 'bob', 'bob:9')] },
        {
          text: 'QR',
          authored: [mark('insert', 'bob', 'bob:9'), mark('insert', 'alice')],
        },
        { text: 'ne', authored: [mark('insert', 'bob', 'bob:9')] }
      ),
    ],
    [
      'another author’s insertion within one’s own block',
      whole(
        paragraph(
          { text: 'mi' },
          { text: 'QR', authored: [mark('insert', 'alice')] },
          { text: 'ne' }
        ),
        mark('insert', 'bob', 'bob:9')
      ),
    ],
    [
      'the formatted end of another author’s insertion within one’s own',
      paragraph(
        { text: 'mi', authored: [mark('insert', 'bob', 'bob:9')] },
        {
          bold: true,
          text: 'Q',
          authored: [mark('insert', 'bob', 'bob:9'), mark('insert', 'alice')],
        },
        {
          text: 'R',
          authored: [mark('insert', 'bob', 'bob:9'), mark('insert', 'alice')],
        },
        { text: 'ne', authored: [mark('insert', 'bob', 'bob:9')] }
      ),
    ],
  ] as const) {
    it(`removes one’s own text typed inside ${where} for real on Backspace`, () => {
      const editor = suggesting([block]);
      const before = expandedChildren(editor);

      editor.update((tx) => {
        tx.selection.set({ anchor: point(1, [0, 1]), focus: point(1, [0, 1]) });
        tx.text.insert('XY');
      });
      editor.update((tx) => tx.text.deleteBackward());
      editor.update((tx) => tx.text.deleteBackward());

      assert.deepEqual(expandedChildren(editor), before);
    });
  }

  it('rests Suggesting text typed between insertions by A and B and by B and C on B alone, with its own claim', () => {
    const editor = suggesting(
      [
        paragraph(
          {
            text: 'ab',
            authored: [mark('insert', 'alice'), mark('insert', 'bob')],
          },
          {
            text: 'cd',
            authored: [mark('insert', 'bob'), mark('insert', 'carol')],
          }
        ),
      ],
      'dan'
    );

    editor.update((tx) => {
      tx.text.insert('X', { at: point(2, [0, 0]) });
    });

    const value = editor.read.value() as {
      children: ReadonlyArray<{
        children: ReadonlyArray<Record<string, unknown>>;
      }>;
      roots?: Record<string, ReadonlyArray<Record<string, unknown>>>;
    };
    const typed = value.children[0].children[1];
    const restsOn = new Set(
      (typed.authored as ReadonlyArray<Record<string, unknown>>)
        .filter((member) => member.kind === 'in')
        .map(({ ctx }) => ctx)
    );

    assert.equal(typed.text, 'X');
    assert.deepEqual(
      (typed.authored as ReadonlyArray<Record<string, unknown>>).filter(
        (member) => member.kind !== 'in'
      ),
      [mark('insert', 'dan')]
    );
    assert.deepEqual(
      storedContexts(editor.read.value())
        .filter(({ ctx }) => restsOn.has(ctx))
        .map(({ author, base, change }) => ({ author, base, change })),
      [{ author: 'bob', base: undefined, change: 'bob:1' }]
    );
    assert.deepEqual(editor.read.authored.reviewOf(typed).marks, [
      mark('insert', 'bob'),
      mark('insert', 'dan'),
    ]);
  });

  it('stores one landed write for an accepted or stacking Editing format commit, however many leaves it writes', () => {
    const Color = defineEditorSchema('landed-color-schema', {
      elements: { paragraph: { content: schema.content.text() } },
      id: 'landed-color-schema',
      properties: [schema.textProperty('color', property.string())],
      root: schema.content.type('paragraph'),
      unknown: 'reject',
      version: 1,
    });
    const colorAll = (
      editor: ReturnType<typeof editorFor>,
      count: number,
      value: string
    ) =>
      editor.update((tx) => {
        tx.selection.set({ anchor: point(0), focus: point(4, [count - 1, 0]) });
        tx.marks.add('color', value);
      });
    const leaves = (count: number, intent: 'edit' | 'propose') =>
      editorFor(
        Array.from({ length: count }, () => paragraph({ text: 'word' })),
        intent,
        'bob',
        [Color]
      );
    const landed = (editor: ReturnType<typeof editorFor>) =>
      Object.keys(recordsOf(editor.read.value())['authored-landed'] ?? {})
        .length;
    const accepted = [1, 10, 1000].map((count) => {
      const editor = leaves(count, 'propose');

      colorAll(editor, count, 'red');
      authoredTestApi(editor).decide({ action: 'accept', changes: ['bob:1'] });

      return landed(editor);
    });
    const editor = leaves(1000, 'propose');

    colorAll(editor, 1000, 'red');
    authoredTestApi(editor).setIntent('edit');
    colorAll(editor, 1000, 'green');

    assert.deepEqual(
      { accepted, stacked: landed(editor) },
      { accepted: [1, 1, 1], stacked: 1 }
    );
  });

  it('reads the accepted value of a key two suggestions formatted at once from the tag with the smallest id', () => {
    const tag = (id: string, author: string, before: string) => ({
      at: AT,
      author,
      before,
      change: `${author}:1`,
      id,
      key: 'color',
      kind: 'format',
      write: { kind: 'set', value: 'green' },
    });
    const editor = suggesting([
      paragraph({
        authored: [tag('t2', 'ann', 'red'), tag('t1', 'cal', 'blue')],
        color: 'green',
        text: 'word',
      }),
    ]);
    const [text] = (
      editor.read.children()[0] as { children: Array<Record<string, unknown>> }
    ).children;

    assert.deepEqual(editor.read.authored.reviewOf(text).accepted, {
      color: 'blue',
    });
  });

  it('keeps the pending suggestions under an Editing write to their key, through undo and their decisions', () => {
    const editor = editorFor(annBlue(), 'propose', 'bob', [
      history({ newBatchDelay: 0 }),
    ]);
    const api = authoredTestApi(editor);

    setColor(editor, 'yellow');
    api.setIntent('edit');
    setColor(editor, 'green');
    const edited = colorState(editor);

    editor.api.history.undo();
    const undone = colorState(editor);

    editor.api.history.redo();
    api.decide({ action: 'reject', changes: ['bob:1'] });
    const bobRejected = colorState(editor);

    api.decide({ action: 'reject', changes: ['ann:1'] });

    assert.deepEqual(
      { bobRejected, edited, end: colorState(editor), undone },
      {
        bobRejected: { accepted: 'green', color: 'green', pending: ['ann:1'] },
        edited: {
          accepted: 'green',
          color: 'green',
          pending: ['ann:1', 'bob:1'],
        },
        end: { accepted: 'green', color: 'green', pending: [] },
        undone: {
          accepted: null,
          color: 'yellow',
          pending: ['ann:1', 'bob:1'],
        },
      }
    );
  });

  it('keeps an Editing value accepted under the suggestion its writer then writes over it', () => {
    const editor = editing(annBlue());
    const api = authoredTestApi(editor);

    setColor(editor, 'green');
    api.setIntent('propose');
    setColor(editor, 'purple');
    const suggested = colorState(editor);

    api.decide({ action: 'reject', changes: ['bob:1'] });

    assert.deepEqual(
      { rejected: colorState(editor), suggested },
      {
        rejected: { accepted: 'green', color: 'green', pending: ['ann:1'] },
        suggested: {
          accepted: 'green',
          color: 'purple',
          pending: ['ann:1', 'bob:1'],
        },
      }
    );
  });

  it('keeps an Editing value when the suggestion under it is accepted before the one over it is rejected', () => {
    const editor = editing(annBlue());
    const api = authoredTestApi(editor);

    setColor(editor, 'green');
    api.setIntent('propose');
    setColor(editor, 'purple');
    api.decide({ action: 'accept', changes: ['ann:1'] });
    api.decide({ action: 'reject', changes: ['bob:1'] });

    assert.deepEqual(editor.read.children(), [
      paragraph({ color: 'green', text: 'word' }),
    ]);
  });

  it('keeps an Editing value that returns a key to the suggested value', () => {
    const editor = editing(annBlue());
    const api = authoredTestApi(editor);

    setColor(editor, 'green');
    setColor(editor, 'blue');
    const returned = colorState(editor);

    api.decide({ action: 'reject', changes: ['ann:1'] });

    assert.deepEqual(
      { rejected: colorState(editor), returned },
      {
        rejected: { accepted: 'blue', color: 'blue', pending: [] },
        returned: { accepted: 'blue', color: 'blue', pending: ['ann:1'] },
      }
    );
  });

  it('keeps another author’s pending property on the block an Editing removal leaves in its place', () => {
    const Aligned = defineEditorSchema('record-aligned-shell', {
      elements: { paragraph: { content: schema.content.text() } },
      id: 'record-aligned-shell',
      properties: [
        schema.elementProperty('align', property.string(), {
          target: target.type('paragraph'),
        }),
      ],
      root: schema.content.type('paragraph', {
        default: { type: 'paragraph' },
        min: 1,
      }),
      unknown: 'reject',
      version: 1,
    });
    const editor = editorFor(
      [
        {
          type: 'paragraph',
          align: 'center',
          authored: [
            {
              at: AT,
              author: 'ann',
              change: 'ann:1',
              id: 'a1',
              key: 'align',
              kind: 'format',
              write: { kind: 'set', value: 'center' },
            },
          ],
          children: [{ text: 'a' }],
        },
      ],
      'edit',
      'bob',
      [Aligned]
    );

    editor.update((tx) => tx.nodes.remove({ at: [0] }));
    const [shell] = editor.read.children() as Array<{ align?: string }>;
    const pending = editor.read.authored.changes().items.map(({ id }) => id);

    authoredTestApi(editor).decide({ action: 'reject', changes: ['ann:1'] });
    const [rejected] = editor.read.children() as Array<{ align?: string }>;

    assert.deepEqual(
      {
        align: shell.align ?? null,
        pending,
        rejected: {
          align: rejected.align ?? null,
          pending: editor.read.authored.changes().items,
        },
      },
      {
        align: null,
        pending: ['ann:1'],
        rejected: { align: null, pending: [] },
      }
    );
  });

  it('keeps the Editing value of the block an Editing removal leaves in its place when the suggestion under it is accepted before the one over it is rejected', () => {
    const Aligned = defineEditorSchema('record-aligned-landed-shell', {
      elements: { paragraph: { content: schema.content.text() } },
      id: 'record-aligned-landed-shell',
      properties: [
        schema.elementProperty('align', property.string(), {
          target: target.type('paragraph'),
        }),
      ],
      root: schema.content.type('paragraph', {
        default: { type: 'paragraph' },
        min: 1,
      }),
      unknown: 'reject',
      version: 1,
    });
    const editor = editorFor(
      [
        {
          type: 'paragraph',
          align: 'center',
          authored: [
            {
              at: AT,
              author: 'ann',
              change: 'ann:1',
              id: 'a1',
              key: 'align',
              kind: 'format',
              write: { kind: 'set', value: 'center' },
            },
          ],
          children: [{ text: 'a' }],
        },
      ],
      'edit',
      'bob',
      [Aligned]
    );
    const api = authoredTestApi(editor);

    editor.update((tx) => tx.nodes.remove({ at: [0] }));
    api.setIntent('propose');
    editor.update((tx) =>
      tx.nodes.set({ align: 'right' } as never, { at: [0] })
    );
    api.decide({ action: 'accept', changes: ['ann:1'] });
    api.decide({ action: 'reject', changes: ['bob:1'] });
    const [shell] = editor.read.children() as Array<{ align?: string }>;

    assert.deepEqual(
      {
        align: shell.align ?? null,
        pending: editor.read.authored.changes().items,
      },
      { align: null, pending: [] }
    );
  });

  it('rewrites the writer’s own pending property on the block their removal leaves in its place', () => {
    const Aligned = defineEditorSchema('record-aligned-own-shell-rewrite', {
      elements: { paragraph: { content: schema.content.text() } },
      id: 'record-aligned-own-shell-rewrite',
      properties: [
        schema.elementProperty('align', property.string(), {
          target: target.type('paragraph'),
        }),
      ],
      root: schema.content.type('paragraph', {
        default: { type: 'paragraph' },
        min: 1,
      }),
      unknown: 'reject',
      version: 1,
    });
    const editor = editorFor(
      [{ type: 'paragraph', align: 'left', children: [{ text: 'a' }] }],
      'propose',
      'bob',
      [Aligned]
    );
    const api = authoredTestApi(editor);

    api.propose('bob:1', (tx) =>
      tx.nodes.set({ align: 'center' }, { at: [0] })
    );
    api.propose('bob:1', (tx) => tx.nodes.remove({ at: [0] }));
    const [shell] = editor.read.children() as Array<{ align?: string }>;
    const formats = editor.read.authored
      .reviewOf(shell)
      .marks.filter(({ kind }) => kind === 'format');

    assert.deepEqual(
      {
        align: shell.align ?? null,
        formats: formats.map(({ before, write }) => ({ before, write })),
      },
      { align: null, formats: [{ before: 'left', write: { kind: 'remove' } }] }
    );
    api.decide({ action: 'reject', changes: ['bob:1'] });
    assert.equal(
      (editor.read.children() as Array<{ align?: string }>)[0]?.align,
      'left'
    );
  });

  it('withdraws the writer’s own pending property on the block their removal leaves in its place', () => {
    const Aligned = defineEditorSchema('record-aligned-own-shell', {
      elements: { paragraph: { content: schema.content.text() } },
      id: 'record-aligned-own-shell',
      properties: [
        schema.elementProperty('align', property.string(), {
          target: target.type('paragraph'),
        }),
      ],
      root: schema.content.type('paragraph', {
        default: { type: 'paragraph' },
        min: 1,
      }),
      unknown: 'reject',
      version: 1,
    });
    const editor = editorFor(
      [{ type: 'paragraph', children: [{ text: 'a' }] }],
      'propose',
      'bob',
      [Aligned]
    );

    const api = authoredTestApi(editor);

    api.propose('bob:1', (tx) =>
      tx.nodes.set({ align: 'center' }, { at: [0] })
    );
    api.propose('bob:1', (tx) => tx.nodes.remove({ at: [0] }));
    const [shell] = editor.read.children() as Array<{ align?: string }>;

    assert.deepEqual(
      {
        align: shell.align ?? null,
        formats: editor.read.authored
          .reviewOf(shell)
          .marks.filter(({ kind }) => kind === 'format'),
      },
      { align: null, formats: [] }
    );
  });

  it('stores no context record for an Editing keystroke inside text that rests on one', () => {
    const editor = editing(
      [
        paragraph(
          { text: 'a' },
          {
            text: 'xyz',
            authored: [mark('insert', 'ann'), mark('insert', 'bob')],
          }
        ),
      ],
      'dan'
    );

    editor.update((tx) => {
      tx.text.insert('!', { at: point(1, [0, 1]) });
    });

    assert.deepEqual(
      storedContexts(editor.read.value()).map(({ author, base, change }) => ({
        author,
        base,
        change,
      })),
      [{ author: 'bob', base: undefined, change: 'bob:1' }]
    );
  });

  it('stores the context a Suggesting insert mints under another, for content carrying two stacked insertions', () => {
    const editor = suggesting([paragraph({ text: 'a' })], 'dan');

    editor.update((tx) => {
      tx.nodes.insert(
        paragraph({
          text: 'xy',
          authored: [mark('insert', 'ann'), mark('insert', 'bob')],
        }) as never,
        { at: [1] }
      );
    });

    const contexts = storedContexts(editor.read.value());
    const authorOf = new Map(contexts.map(({ author, ctx }) => [ctx, author]));

    assert.deepEqual(
      contexts
        .map(({ author, base }) => ({
          author,
          on: base === undefined ? undefined : authorOf.get(base),
        }))
        .sort((left, right) =>
          String(left.author).localeCompare(String(right.author))
        ),
      [
        { author: 'ann', on: 'bob' },
        { author: 'bob', on: undefined },
      ]
    );
  });

  it('keeps Suggesting text at either edge of another author’s insertion out of it', () => {
    for (const offset of [0, 4]) {
      const editor = suggesting([
        paragraph(
          { text: 'a' },
          { text: 'hers', authored: [mark('insert', 'alice')] },
          { text: 'b' }
        ),
      ]);

      editor.update((tx) => {
        tx.text.insert('X', { at: point(offset, [0, 1]) });
      });

      const children = editor.read.children() as Array<{
        children: Array<{ authored?: unknown; text: string }>;
      }>;
      const typed = children[0].children.find((leaf) => leaf.text === 'X');

      assert.deepEqual(typed?.authored, [mark('insert')], `edge ${offset}`);
    }
  });

  it('joins Editing text typed inside another author’s insertion to that insertion', () => {
    const editor = editing([
      paragraph(
        { text: 'a' },
        { text: 'hers', authored: [mark('insert', 'alice')] },
        { text: 'b' }
      ),
    ]);

    editor.update((tx) => {
      tx.text.insert('X', { at: point(2, [0, 1]) });
    });

    assert.deepEqual(expandedChildren(editor), [
      paragraph(
        { text: 'a' },
        { text: 'heXrs', authored: [mark('insert', 'alice')] },
        { text: 'b' }
      ),
    ]);
  });

  it('keeps Editing text at either edge of another author’s insertion plain', () => {
    for (const [offset, before, after] of [
      [0, 'aX', 'b'],
      [4, 'a', 'Xb'],
    ] as const) {
      const editor = editing([
        paragraph(
          { text: 'a' },
          { text: 'hers', authored: [mark('insert', 'alice')] },
          { text: 'b' }
        ),
      ]);

      editor.update((tx) => {
        tx.text.insert('X', { at: point(offset, [0, 1]) });
      });

      assert.deepEqual(
        expandedChildren(editor),
        [
          paragraph(
            { text: before },
            { text: 'hers', authored: [mark('insert', 'alice')] },
            { text: after }
          ),
        ],
        `edge ${offset}`
      );
    }
  });

  it('splits a deletion around text typed inside struck text, in both modes', () => {
    for (const intent of ['edit', 'propose'] as const) {
      const editor = editorFor(
        [
          paragraph(
            { text: 'a' },
            { text: 'gone', authored: [mark('delete', 'alice')] },
            { text: 'b' }
          ),
        ],
        intent
      );

      editor.update((tx) => {
        tx.text.insert('X', { at: point(2, [0, 1]) });
      });

      assert.deepEqual(
        editor.read.children(),
        [
          paragraph(
            { text: 'a' },
            { text: 'go', authored: [mark('delete', 'alice')] },
            intent === 'edit'
              ? { text: 'X' }
              : { text: 'X', authored: [mark('insert')] },
            { text: 'ne', authored: [mark('delete', 'alice')] },
            { text: 'b' }
          ),
        ],
        intent
      );
    }
  });

  it('leaves struck text to its deletion when Editing deletes it', () => {
    const start = [
      paragraph(
        { text: 'a' },
        { text: 'gone', authored: [mark('delete', 'alice')] },
        { text: 'b' }
      ),
    ];
    const editor = editing(start);

    editor.update((tx) => {
      tx.text.delete({
        at: { anchor: point(0, [0, 1]), focus: point(4, [0, 1]) },
      });
    });

    assert.deepEqual(editor.read.children(), start);
  });

  it('records Enter in Suggesting as a split mark on the new block', () => {
    const editor = suggesting([paragraph({ text: 'abcd' })]);

    editor.update((tx) => {
      tx.selection.set({ anchor: point(2), focus: point(2) });
      tx.break.insert();
    });

    assert.deepEqual(editor.read.children(), [
      paragraph({ text: 'ab' }),
      { ...paragraph({ text: 'cd' }), authored: [mark('split')] },
    ]);
  });

  it('records Backspace at a block start in Suggesting as a join mark', () => {
    const editor = suggesting([
      paragraph({ text: 'ab' }),
      paragraph({ text: 'cd' }),
    ]);

    editor.update((tx) => {
      tx.selection.set({ anchor: point(0, [1, 0]), focus: point(0, [1, 0]) });
      tx.text.deleteBackward();
    });

    assert.deepEqual(editor.read.children(), [
      paragraph({ text: 'ab' }),
      { ...paragraph({ text: 'cd' }), authored: [mark('join')] },
    ]);
  });

  it('withdraws one’s own pending split for real on Backspace', () => {
    const editor = suggesting([
      paragraph({ text: 'ab' }),
      { ...paragraph({ text: 'cd' }), authored: [mark('split')] },
    ]);

    editor.update((tx) => {
      tx.selection.set({ anchor: point(0, [1, 0]), focus: point(0, [1, 0]) });
      tx.text.deleteBackward();
    });

    assert.deepEqual(editor.read.children(), [paragraph({ text: 'abcd' })]);
  });

  it('moves the caret into the new block on Enter at a block’s end, in both modes', () => {
    for (const editor of [
      editing([paragraph({ text: 'ab' })]),
      suggesting([paragraph({ text: 'ab' })]),
    ]) {
      editor.update((tx) => {
        tx.selection.set({ anchor: point(2), focus: point(2) });
      });
      editor.update((tx) => tx.break.insert());

      assert.deepEqual(editor.read.selection()?.anchor, point(0, [1, 0]));
    }
  });

  it('keeps two letters typed right before struck text in one insertion', () => {
    const gone = { text: 'gone', authored: [mark('delete', 'ann', 'ann:1')] };
    const editor = suggesting([paragraph(gone)]);

    editor.update((tx) => {
      tx.selection.set({ anchor: point(0), focus: point(0) });
    });
    editor.update((tx) => tx.text.insert('x'));
    editor.update((tx) => tx.text.insert('y'));

    assert.deepEqual(editor.read.children(), [
      paragraph({ text: 'xy', authored: [mark('insert')] }, gone),
    ]);
  });

  it('withdraws one’s own empty split block when Backspace removes it', () => {
    const editor = suggesting([
      paragraph({ text: 'ab' }),
      { ...paragraph({ text: '' }), authored: [mark('split')] },
      { ...paragraph({ text: 'cd' }), authored: [mark('split')] },
    ]);

    editor.update((tx) => {
      tx.selection.set({ anchor: point(0, [2, 0]), focus: point(0, [2, 0]) });
    });
    editor.update((tx) => tx.text.deleteBackward());

    assert.deepEqual(editor.read.children(), [
      paragraph({ text: 'ab' }),
      { ...paragraph({ text: 'cd' }), authored: [mark('split')] },
    ]);
  });

  it('strikes the joined block’s first letter on a second Delete', () => {
    const editor = suggesting([
      paragraph({ text: 'ab' }),
      paragraph({ text: 'cd' }),
    ]);

    editor.update((tx) => {
      tx.selection.set({ anchor: point(2), focus: point(2) });
    });
    editor.update((tx) => tx.text.deleteForward());
    editor.update((tx) => tx.text.deleteForward());

    assert.deepEqual(editor.read.children(), [
      paragraph({ text: 'ab' }),
      {
        ...paragraph(
          { text: 'c', authored: [mark('delete', 'bob', 'bob:2')] },
          { text: 'd' }
        ),
        authored: [mark('join')],
      },
    ]);
    assert.deepEqual(editor.read.selection()?.anchor, point(0, [1, 1]));
  });

  it('leaves the caret before a block’s first letter when Backspace strikes it', () => {
    const editor = suggesting([
      paragraph({ text: 'ab' }),
      paragraph({ text: 'cd' }),
    ]);

    editor.update((tx) => {
      tx.selection.set({ anchor: point(0, [1, 0]), focus: point(0, [1, 0]) });
    });
    for (let press = 0; press < 3; press += 1) {
      editor.update((tx) => tx.text.deleteBackward());
    }

    assert.deepEqual(editor.read.children(), [
      paragraph({ text: 'ab', authored: [mark('delete', 'bob', 'bob:2')] }),
      { ...paragraph({ text: 'cd' }), authored: [mark('join')] },
    ]);
    assert.deepEqual(editor.read.selection()?.anchor, point(0));
  });

  it('keeps the caret in the first block after an Editing range delete back across blocks', () => {
    const editor = editing([
      paragraph({ text: 'ab' }),
      paragraph({ text: 'ab' }),
      paragraph({ text: 'ab' }, { bold: true, text: 'ab' }, { text: 'ab' }),
    ]);

    editor.update((tx) => {
      tx.text.delete({ at: { anchor: point(0, [2, 2]), focus: point(0) } });
    });

    assert.deepEqual(editor.read.children(), [paragraph({ text: 'ab' })]);
    assert.deepEqual(editor.read.selection()?.anchor, point(0));
  });

  it('records a Suggesting format change as one tag with the value it replaced', () => {
    const Bold = defineEditorSchema('bold-schema', {
      elements: { paragraph: { content: schema.content.text() } },
      id: 'bold-schema',
      properties: [schema.textProperty('bold', property.boolean())],
      root: schema.content.type('paragraph'),
      unknown: 'reject',
      version: 1,
    });
    const editor = editorFor([paragraph({ text: 'word' })], 'propose', 'bob', [
      Bold,
    ]);

    editor.update((tx) => {
      tx.selection.set({ anchor: point(0), focus: point(4) });
      tx.marks.add('bold', true);
    });

    assert.deepEqual(editor.read.children(), [
      paragraph({
        authored: [
          {
            at: AT,
            author: 'bob',
            change: 'bob:1',
            id: 'bob-tag:1',
            key: 'bold',
            kind: 'format',
            write: { kind: 'set', value: true },
          },
        ],
        bold: true,
        text: 'word',
      }),
    ]);
  });

  it('records nothing for a format an empty line cannot hold', () => {
    const Bold = defineEditorSchema('bold-schema', {
      elements: { paragraph: { content: schema.content.text() } },
      id: 'bold-schema',
      properties: [schema.textProperty('bold', property.boolean())],
      root: schema.content.type('paragraph'),
      unknown: 'reject',
      version: 1,
    });
    const before = [paragraph({ text: 'a' }), paragraph({ text: '' })];
    const editor = editorFor(before, 'propose', 'bob', [Bold]);

    editor.update((tx) => tx.nodes.set({ bold: true }, { at: [1, 0] }));

    assert.deepEqual(editor.read.children(), before);
  });

  it('records a format on a mention, whose empty text keeps its marks', () => {
    const Mentions = defineEditorSchema('mention-schema', {
      elements: {
        mention: { void: 'markable-inline' },
        paragraph: {
          content: schema.content.any(
            [schema.content.text(), schema.content.type('mention')],
            { default: 'text', min: 1 }
          ),
        },
      },
      id: 'mention-schema',
      properties: [schema.textProperty('bold', property.boolean())],
      root: schema.content.type('paragraph'),
      unknown: 'reject',
      version: 1,
    });
    const before = [
      paragraph(
        { text: 'a' },
        { type: 'mention', children: [{ text: '' }] },
        { text: '' }
      ),
    ];
    const plain = createEditor({ initialValue: before, plugins: [Mentions] });
    const edited = editorFor(before, 'edit', 'bob', [Mentions]);
    const suggested = editorFor(before, 'propose', 'bob', [Mentions]);

    for (const editor of [plain, edited, suggested]) {
      editor.update((tx) =>
        tx.nodes.set({ bold: true }, { at: [0, 1, 0], voids: true })
      );
    }
    assert.deepEqual(plain.read.children(), [
      paragraph(
        { text: 'a' },
        { type: 'mention', children: [{ bold: true, text: '' }] },
        { text: '' }
      ),
    ]);
    assert.deepEqual(edited.read.children(), plain.read.children());
    authoredTestApi(suggested).decide({ action: 'accept', changes: ['bob:1'] });
    assert.deepEqual(expandedChildren(suggested), plain.read.children());
  });

  it('moves text out of a struck line in Editing without copying it', () => {
    const editor = editorFor(
      [
        whole(paragraph({ text: 'ab' }), mark('delete', 'alice')),
        paragraph({ text: 'cd' }),
      ],
      'edit',
      'bob',
      [transfer()]
    );

    editor.api.transfer.move({
      range: { anchor: point(0), focus: point(1) },
      to: { point: point(1, [1, 0]) },
    });

    assert.deepEqual(editor.read.children(), [
      whole(paragraph({ text: 'b' }), mark('delete', 'alice')),
      paragraph(
        { text: 'c' },
        { authored: [mark('delete', 'alice')], text: 'a' },
        { text: 'd' }
      ),
    ]);
  });

  it('keeps one tag when a writer changes a value they already suggested', () => {
    const Color = defineEditorSchema('color-schema', {
      elements: { paragraph: { content: schema.content.text() } },
      id: 'color-schema',
      properties: [schema.textProperty('color', property.string())],
      root: schema.content.type('paragraph'),
      unknown: 'reject',
      version: 1,
    });
    const editor = editorFor(
      [paragraph({ color: 'green', text: 'word' })],
      'propose',
      'bob',
      [Color]
    );

    editor.update((tx) => {
      tx.selection.set({ anchor: point(0), focus: point(4) });
      tx.marks.add('color', 'red');
    });
    editor.update((tx) => tx.marks.add('color', 'blue'));

    assert.deepEqual(editor.read.children(), [
      paragraph({
        authored: [
          {
            at: AT,
            author: 'bob',
            before: 'green',
            change: 'bob:2',
            id: 'bob-tag:2',
            key: 'color',
            kind: 'format',
            write: { kind: 'set', value: 'blue' },
          },
        ],
        color: 'blue',
        text: 'word',
      }),
    ]);
  });

  it('records pasted content, whose copy dropped its review marks, as one insertion', () => {
    const source = editing([
      paragraph({ text: 'pasted', authored: [mark('delete', 'eve', 'eve:9')] }),
    ]);

    // Projected copy reads this content slice.
    const copied = source.read.slice.get({
      at: { anchor: point(0), focus: point(6) },
    }).content;
    const editor = suggesting([paragraph({ text: 'ab' })]);

    editor.update((tx) => {
      tx.nodes.insert(copied, { at: [1] });
    });

    assert.deepEqual(editor.read.children(), [
      paragraph({ text: 'ab' }),
      whole(paragraph({ text: 'pasted' }), mark('insert')),
    ]);
  });

  it('strikes a whole removed block and every text in it', () => {
    const editor = suggesting([
      paragraph({ text: 'ab' }),
      paragraph({ text: 'cd' }),
    ]);

    editor.update((tx) => {
      tx.nodes.remove({ at: [1] });
    });

    assert.deepEqual(editor.read.children(), [
      paragraph({ text: 'ab' }),
      whole(paragraph({ text: 'cd' }), mark('delete')),
    ]);
  });

  it('passes undo through unrecorded, restoring the document before a suggested deletion', () => {
    const initial = [paragraph({ text: 'keep gone tail' })];
    const editor = editorFor(initial, 'propose', 'bob', [history()]);

    editor.update((tx) => {
      tx.text.delete({ at: { anchor: point(5), focus: point(10) } });
    });
    editor.api.history.undo();

    assert.deepEqual(editor.read.children(), initial);
  });

  for (const [where, offset] of [
    ['after', 4],
    ['inside', 2],
  ] as const) {
    it(`undoes a word typed as a suggestion ${where} a word in one step`, () => {
      const initial = [paragraph({ text: 'Base' })];
      const editor = editorFor(initial, 'propose', 'bob', [history()]);

      editor.update((tx) => {
        tx.selection.set({ anchor: point(offset), focus: point(offset) });
      });
      for (const letter of 'new') {
        editor.update((tx) => {
          tx.text.insert(letter);
        });
      }
      editor.api.history.undo();

      assert.deepEqual(editor.read.children(), initial);
    });
  }

  it('lands Editing text typed inside a struck block at the end of the kept text before it', () => {
    const editor = editing([
      paragraph({ text: 'keep' }),
      whole(paragraph({ text: 'gone' }), mark('delete', 'alice')),
    ]);

    editor.update((tx) => {
      tx.text.insert('X', { at: point(2, [1, 0]) });
    });
    authoredTestApi(editor).decide({ action: 'accept', changes: ['alice:1'] });

    assert.deepEqual(editor.read.children(), [paragraph({ text: 'keepX' })]);
  });

  it('records Suggesting text typed inside a struck block outside the deletion', () => {
    const editor = suggesting([
      whole(paragraph({ text: 'gone' }), mark('delete', 'alice')),
    ]);

    editor.update((tx) => {
      tx.text.insert('X', { at: point(2) });
    });

    assert.deepEqual(editor.read.children(), [
      {
        ...paragraph(
          { text: 'go', authored: [mark('delete', 'alice')] },
          { text: 'X', authored: [mark('insert')] },
          { text: 'ne', authored: [mark('delete', 'alice')] }
        ),
        authored: [mark('delete', 'alice')],
      },
    ]);
  });

  it('marks Suggesting text typed inside one’s own pending block with that block’s change', () => {
    const editor = suggesting([
      paragraph({ text: 'keep' }),
      { ...paragraph({ text: 'mine' }), authored: [mark('insert')] },
    ]);

    editor.update((tx) => {
      tx.text.insert('X', { at: point(2, [1, 0]) });
    });

    assert.deepEqual(editor.read.children(), [
      paragraph({ text: 'keep' }),
      {
        ...paragraph(
          { text: 'mi' },
          { text: 'X', authored: [mark('insert')] },
          { text: 'ne' }
        ),
        authored: [mark('insert')],
      },
    ]);
  });

  it('leaves text typed inside one’s own pending one-text block unsplit', () => {
    const Code = defineEditorSchema('own-code-schema', {
      elements: {
        code: {
          content: schema.content.text({ default: 'text', max: 1, min: 1 }),
        },
        paragraph: { content: schema.content.text() },
      },
      id: 'own-code-schema',
      root: schema.content.group('block', {
        default: { type: 'paragraph' },
        min: 1,
      }),
      unknown: 'reject',
      version: 1,
    });
    const editor = editorFor(
      [
        {
          type: 'code',
          authored: [mark('insert')],
          children: [{ text: 'let a' }],
        },
      ],
      'propose',
      'bob',
      [Code]
    );

    editor.update((tx) => {
      tx.text.insert('X', { at: point(3) });
    });

    assert.deepEqual(editor.read.children(), [
      {
        type: 'code',
        authored: [mark('insert')],
        children: [{ text: 'letX a' }],
      },
    ]);
  });

  it('stacks a delete mark over another author’s insertion when Suggesting deletes it', () => {
    const editor = suggesting([
      paragraph(
        { text: 'a' },
        { text: 'hers', authored: [mark('insert', 'alice')] },
        { text: 'b' }
      ),
    ]);

    editor.update((tx) => {
      tx.text.delete({
        at: { anchor: point(0, [0, 1]), focus: point(4, [0, 1]) },
      });
    });

    assert.deepEqual(editor.read.children(), [
      paragraph(
        { text: 'a' },
        { text: 'hers', authored: [mark('insert', 'alice'), mark('delete')] },
        { text: 'b' }
      ),
    ]);
  });

  it('grows one’s own pending deletion on repeated Backspace instead of adding a suggestion', () => {
    const editor = suggesting([paragraph({ text: 'abcd' })]);

    for (let step = 0; step < 2; step += 1) {
      editor.update((tx) => {
        tx.selection.set({ anchor: point(4 - step), focus: point(4 - step) });
        tx.text.deleteBackward();
      });
    }

    assert.deepEqual(editor.read.children(), [
      paragraph({ text: 'ab' }, { text: 'cd', authored: [mark('delete')] }),
    ]);
  });

  it('steps Backspace over struck text in Suggesting without changing it', () => {
    const initial = [
      paragraph(
        { text: 'ab' },
        { text: 'gone', authored: [mark('delete', 'alice')] },
        { text: 'cd' }
      ),
    ];
    const editor = suggesting(initial);

    editor.update((tx) => {
      tx.selection.set({ anchor: point(4, [0, 1]), focus: point(4, [0, 1]) });
      tx.text.deleteBackward();
    });

    assert.deepEqual(editor.read.children(), initial);
    assert.deepEqual(editor.read.selection()?.anchor, point(3, [0, 1]));
  });

  it('steps Delete over struck text in Suggesting without changing it', () => {
    const initial = [
      paragraph(
        { text: 'ab' },
        { text: 'gone', authored: [mark('delete', 'alice')] },
        { text: 'cd' }
      ),
    ];
    const editor = suggesting(initial);

    // The caret exists before the keystroke, as in a browser.
    editor.update((tx) => {
      tx.selection.set({ anchor: point(1, [0, 1]), focus: point(1, [0, 1]) });
    });
    editor.update((tx) => tx.text.deleteForward());

    assert.deepEqual(editor.read.children(), initial);
    assert.deepEqual(editor.read.selection()?.anchor, point(2, [0, 1]));
  });

  it('leaves the caret before a backward-selected range that Suggesting strikes', () => {
    const editor = suggesting([paragraph({ text: 'abcd' })]);

    editor.update((tx) => {
      tx.selection.set({ anchor: point(3, [0, 0]), focus: point(1, [0, 0]) });
    });
    editor.update((tx) => tx.text.delete());

    assert.deepEqual(editor.read.selection()?.anchor, point(1, [0, 0]));
  });

  it('refuses a Suggesting edit whose review form breaks a one-text element', () => {
    const Code = defineEditorSchema('code-schema', {
      elements: {
        code: {
          content: schema.content.text({ default: 'text', max: 1, min: 1 }),
        },
        paragraph: { content: schema.content.text() },
      },
      id: 'code-schema',
      root: schema.content.group('block', {
        default: { type: 'paragraph' },
        min: 1,
      }),
      unknown: 'reject',
      version: 1,
    });
    const initial = [{ type: 'code', children: [{ text: 'let a' }] }];
    const editor = editorFor(initial, 'propose', 'bob', [Code]);

    assert.throws(
      () =>
        editor.update((tx) => {
          tx.text.insert('X', { at: point(3) });
        }),
      /allows at most 1 children/
    );
    assert.deepEqual(editor.read.children(), initial);
  });

  it('gives each session of one author its own change ids', () => {
    const first = createEditor({
      plugins: [
        createAuthoredPlugin({
          authorId: 'alice',
          intent: 'propose',
          now: () => 1,
        }),
      ],
      initialValue: [paragraph({ text: 'ab' }), paragraph({ text: 'cd' })],
    });

    first.update((tx) => tx.text.insert('x', { at: point(2) }));

    const second = createEditor({
      plugins: [
        createAuthoredPlugin({
          authorId: 'alice',
          intent: 'propose',
          now: () => 2,
        }),
      ],
      initialValue: first.read.children() as Array<Record<string, unknown>>,
    });

    second.update((tx) => tx.text.insert('y', { at: point(2, [1, 0]) }));

    const [x, y] = (
      second.read.children() as Array<{
        children: Array<{ authored?: Array<{ at: number; change: string }> }>;
      }>
    ).map((block) => block.children[1]?.authored?.[0]);

    assert.deepEqual([x?.at, y?.at], [1, 2]);
    assert.notEqual(x?.change, y?.change);
  });

  it('keeps one forced change’s time across its transactions', () => {
    let clock = 1;
    const editor = createEditor({
      plugins: [createAuthoredPlugin({ authorId: 'bob', now: () => clock })],
      initialValue: [paragraph({ text: 'ab' }), paragraph({ text: 'cd' })],
    });

    authoredTestApi(editor).propose('ai:1', (tx) =>
      tx.text.insert('X', { at: point(1) })
    );
    clock = 2;
    authoredTestApi(editor).propose('ai:1', (tx) =>
      tx.text.insert('Y', { at: point(1, [1, 0]) })
    );

    const forced = { at: 1, author: 'bob', change: 'ai:1', kind: 'insert' };

    assert.deepEqual(editor.read.children(), [
      paragraph(
        { text: 'a' },
        { text: 'X', authored: [forced] },
        { text: 'b' }
      ),
      paragraph(
        { text: 'c' },
        { text: 'Y', authored: [forced] },
        { text: 'd' }
      ),
    ]);
  });

  it('keeps a named root selected by the transaction that edits it', () => {
    const editor = createEditor({
      plugins: [createAuthoredPlugin({ authorId: 'bob', now: () => AT })],
      initialValue: {
        children: [paragraph({ text: 'body' })],
        roots: { header: [paragraph({ text: 'head' })] },
      },
    });

    editor.update((tx) => {
      const caret = { offset: 1, path: [0, 0], root: 'header' };

      tx.selection.set({ anchor: caret, focus: caret });
      tx.text.insert('X');
    });
    editor.update((tx) => tx.text.insert('Y'));

    assert.deepEqual(editor.read.value(), {
      children: [paragraph({ text: 'body' })],
      roots: { header: [paragraph({ text: 'hXYead' })] },
    });
  });

  it('records two edits of one transaction inside a struck block', () => {
    const editor = editing([
      whole(paragraph({ text: 'abcd' }), mark('delete', 'alice')),
    ]);

    editor.update((tx) => {
      tx.text.insert('X', { at: point(1) });
      tx.text.insert('Y', { at: point(3) });
    });

    const struck = { authored: [mark('delete', 'alice')] };

    assert.deepEqual(editor.read.children(), [
      {
        ...paragraph(
          { ...struck, text: 'a' },
          { text: 'X' },
          { ...struck, text: 'b' },
          { text: 'Y' },
          { ...struck, text: 'cd' }
        ),
        ...struck,
      },
    ]);
  });

  it('keeps another author’s pending insertion inside a block that a move carries, in both modes', () => {
    const alices = paragraph({
      text: 'X',
      authored: [mark('insert', 'alice')],
    });
    const plain = editing([
      paragraph({ text: 'a' }),
      alices,
      paragraph({ text: 'c' }),
    ]);
    const suggested = suggesting([
      paragraph({ text: 'a' }),
      alices,
      paragraph({ text: 'c' }),
    ]);

    for (const editor of [plain, suggested]) {
      editor.update((tx) => tx.nodes.move({ at: [1], to: [2] }));
    }
    assert.deepEqual(plain.read.children(), [
      paragraph({ text: 'a' }),
      paragraph({ text: 'c' }),
      alices,
    ]);
    authoredTestApi(suggested).decide({ action: 'accept', changes: ['bob:1'] });
    assert.deepEqual(expandedChildren(suggested), plain.read.children());
  });

  it('keeps another author’s marks on content one transaction moves and types into, in Editing', () => {
    const editor = editorFor(
      [
        paragraph({ text: 'a' }),
        paragraph({ text: 'ab', authored: [mark('insert', 'alice')] }),
        paragraph({ text: 'c' }),
      ],
      'edit',
      'bob',
      [Quotes]
    );

    editor.update((tx) => {
      tx.nodes.move({ at: [1], to: [2] });
      tx.text.insert('X', { at: point(1, [2, 0]) });
    });

    assert.deepEqual(editor.read.children(), [
      paragraph({ text: 'a' }),
      paragraph({ text: 'c' }),
      paragraph({ text: 'aXb', authored: [mark('insert', 'alice')] }),
    ]);
  });

  it('keeps another author’s marks on content one transaction wraps and formats, in Editing', () => {
    const editor = editorFor(
      [paragraph({ text: 'X', authored: [mark('insert', 'alice')] })],
      'edit',
      'bob',
      [Quotes]
    );

    editor.update((tx) => {
      tx.nodes.wrap({ type: 'quote', children: [] }, { at: [0] });
      tx.nodes.set({ bold: true }, { at: [0, 0, 0] });
    });

    assert.deepEqual(editor.read.children(), [
      {
        type: 'quote',
        children: [
          paragraph({
            text: 'X',
            bold: true,
            authored: [mark('insert', 'alice')],
          }),
        ],
      },
    ]);
  });

  it('unwraps a quote at once in Editing', () => {
    const editor = editorFor(
      [{ type: 'quote', children: [paragraph({ text: 'ab' })] }],
      'edit',
      'bob',
      [Quotes]
    );

    editor.update((tx) => tx.nodes.unwrap({ at: [0] }));

    assert.deepEqual(editor.read.children(), [paragraph({ text: 'ab' })]);
  });

  it('keeps Editing ranges, anchors and node keys on surviving text after unwrap', () => {
    const initialValue = [
      {
        type: 'quote',
        children: [paragraph({ text: 'Inner' }), paragraph({ text: 'Body' })],
      },
      paragraph({ text: 'After' }),
    ];
    const source = editorFor(initialValue, 'edit', 'alice', [
      Quotes,
      history(),
    ]);
    const view = createEditorView(source, { authored: { intent: 'edit' } });
    const before = {
      anchor: { path: [0, 0, 0], offset: 0 },
      focus: { path: [0, 0, 0], offset: 2 },
    };
    view.update.selection.set(before);
    const anchor = view.anchor(before, { deletion: 'drop' });
    const after = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 2 },
    };
    const keys = [view.key([0, 0, 0]), view.key([0, 1])];
    const wrapperKey = view.key([0]);

    try {
      view.update.nodes.unwrap({ at: view.key([0]) });

      assert.deepEqual(
        {
          active: view.read.selection(),
          anchor: anchor.resolve(),
          keys: [view.key([0, 0]), view.key([1])],
        },
        {
          active: after,
          anchor: after,
          keys,
        },
        'unwrap preserves the selected characters and retained anchors'
      );
      view.api.history.undo();
      assert.deepEqual(view.read.children(), initialValue);
      assert.deepEqual(view.read.selection(), before);
      assert.equal(view.key([0]), wrapperKey);
      view.api.history.redo();
      assert.deepEqual(view.read.selection(), after);
      view.update.text.insert('Z');
      assert.deepEqual(source.read.children(), [
        paragraph({ text: 'Zner' }),
        paragraph({ text: 'Body' }),
        paragraph({ text: 'After' }),
      ]);
    } finally {
      anchor.release();
    }
  });

  it('keeps one copy of struck content an Editing reorder moves when its deletion is rejected', () => {
    const struckQuote = whole(
      { type: 'quote', children: [paragraph({ text: 'x' })] },
      mark('delete', 'alice')
    );
    const editor = editorFor(
      [paragraph({ text: 'ab' }), struckQuote],
      'edit',
      'bob',
      [Quotes]
    );

    editor.update((tx) =>
      tx.nodes.replaceChildren(
        [struckQuote, paragraph({ text: 'ab' })] as never,
        { at: [], count: 2 }
      )
    );
    authoredTestApi(editor).decide({ action: 'reject', changes: ['alice:1'] });

    assert.deepEqual(editor.read.children(), [
      { type: 'quote', children: [paragraph({ text: 'x' })] },
      paragraph({ text: 'ab' }),
    ]);
  });

  it('keeps a quote line another author struck when an Editing unwrap lifts its text into the quote', () => {
    const value = [
      {
        type: 'quote',
        children: [
          paragraph({ text: 'ef' }),
          whole(paragraph({ text: 'gh' }), mark('delete', 'alice')),
        ],
      },
    ];
    const editor = editorFor(value, 'edit');

    editor.update((tx) => tx.nodes.unwrap({ at: [0, 1] }));

    assert.deepEqual(editor.read.children(), value);
  });

  it('joins a line an Editing Backspace pulls across struck lines to the line before them, or to the last of them when their deletion is rejected', () => {
    const editor = editing([
      paragraph({ text: 'ab' }),
      whole(paragraph({ text: 'cd' }), mark('delete', 'alice')),
      whole(paragraph({ text: 'ef' }), mark('delete', 'alice')),
      paragraph({ text: 'gh' }),
    ]);

    editor.update((tx) => {
      tx.selection.set({ anchor: point(0, [3, 0]), focus: point(0, [3, 0]) });
      tx.command(editorCommands.delete, {
        direction: 'backward',
        unit: 'character',
      });
    });
    const decided = (action: 'accept' | 'reject') => {
      const reviewer = editing(editor.read.children() as never, 'carol');

      authoredTestApi(reviewer).decide({ action, changes: ['alice:1'] });

      return reviewer.read.children();
    };

    assert.deepEqual(decided('accept'), [paragraph({ text: 'abgh' })]);
    assert.deepEqual(decided('reject'), [
      paragraph({ text: 'ab' }),
      paragraph({ text: 'cd' }),
      paragraph({ text: 'efgh' }),
    ]);
  });

  it('keeps its own deleted pending text for another author’s pending insertion that also holds it', () => {
    const alice = editorFor(
      [
        paragraph(
          { text: 'a' },
          { text: 'N', authored: [mark('insert', 'bob', 'bob:9')] },
          { text: 'b' }
        ),
        paragraph({ text: 'cd' }),
      ],
      'propose',
      'alice',
      [transfer()]
    );

    alice.api.transfer.move({
      range: { anchor: point(0, [0, 1]), focus: point(1, [0, 1]) },
      to: { point: point(1, [1, 0]) },
    });

    const editor = suggesting(alice.read.value() as never);

    editor.update((tx) =>
      tx.text.delete({
        at: { anchor: point(0, [1, 1]), focus: point(1, [1, 1]) },
      })
    );

    authoredTestApi(editor).decide([
      { action: 'reject', changes: ['bob:1'] },
      { action: 'accept', changes: ['alice:1', 'bob:9'] },
    ]);

    assert.deepEqual(editor.read.children(), [
      paragraph({ text: 'ab' }),
      paragraph({ text: 'cNd' }),
    ]);
  });

  it('keeps an Editing join into a quote another author’s pending unwrap dissolves until that unwrap is decided', () => {
    const editor = editorFor(
      [
        paragraph({ text: 'ab' }),
        {
          type: 'quote',
          authored: [mark('unwrap', 'alice')],
          children: [paragraph({ text: 'cd' }), paragraph({ text: 'ef' })],
        },
      ],
      'edit',
      'bob',
      [Quotes]
    );

    editor.update((tx) => {
      tx.selection.set({ anchor: point(1), focus: point(1, [1, 1, 0]) });
      tx.command(editorCommands.deleteFragment, { direction: 'forward' });
    });
    authoredTestApi(editor).decide({ action: 'accept', changes: ['alice:1'] });

    assert.deepEqual(editor.read.children(), [paragraph({ text: 'af' })]);
  });

  it('keeps an Editing join out of a quote nested in another until both pending unwraps that dissolve them are decided', () => {
    const editor = editorFor(
      [
        paragraph({ text: 'a' }),
        {
          type: 'quote',
          authored: [mark('unwrap', 'alice')],
          children: [
            {
              type: 'quote',
              authored: [mark('unwrap', 'carol')],
              children: [paragraph({ text: 'b' })],
            },
            paragraph({ text: 'c' }),
          ],
        },
      ],
      'edit',
      'bob',
      [NestedQuotes]
    );

    editor.update((tx) => {
      tx.selection.set({ anchor: point(1), focus: point(1, [1, 0, 0, 0]) });
      tx.command(editorCommands.deleteFragment, { direction: 'forward' });
    });
    authoredTestApi(editor).decide({
      action: 'accept',
      changes: ['alice:1', 'carol:1'],
    });

    assert.deepEqual(editor.read.children(), [
      paragraph({ text: 'a' }),
      paragraph({ text: 'c' }),
    ]);
  });

  it('keeps an Editing join out of a quote another author’s pending deletion strikes, nested in quotes pending unwraps dissolve', () => {
    const editor = editorFor(
      [
        paragraph({ text: 'a' }),
        {
          type: 'quote',
          authored: [mark('unwrap', 'alice')],
          children: [
            {
              type: 'quote',
              authored: [mark('unwrap', 'carol')],
              children: [
                {
                  type: 'quote',
                  authored: [mark('unwrap', 'eve'), mark('delete', 'dana')],
                  children: [paragraph({ text: 'b' })],
                },
              ],
            },
            paragraph({ text: 'c' }),
          ],
        },
      ],
      'edit',
      'bob',
      [NestedQuotes]
    );

    editor.update((tx) => {
      tx.selection.set({
        anchor: point(1),
        focus: point(1, [1, 0, 0, 0, 0]),
      });
      tx.command(editorCommands.deleteFragment, { direction: 'forward' });
    });
    authoredTestApi(editor).decide({
      action: 'accept',
      changes: ['alice:1', 'carol:1', 'dana:1', 'eve:1'],
    });

    assert.deepEqual(editor.read.children(), [
      paragraph({ text: 'a' }),
      paragraph({ text: 'c' }),
    ]);
  });

  it('removes the quote a Suggesting deletion empties even when the pending unwrap of that quote is rejected', () => {
    const editor = editorFor(
      [
        { type: 'quote', children: [paragraph({ text: 'xab' })] },
        paragraph({ text: 'cd' }),
        {
          type: 'quote',
          authored: [mark('unwrap', 'alice')],
          children: [paragraph({ text: 'ef' })],
        },
        paragraph({ text: 'gh' }),
      ],
      'propose',
      'bob',
      [Quotes]
    );

    editor.update((tx) => {
      tx.selection.set({
        anchor: point(0, [2, 0, 0]),
        focus: point(1, [0, 0, 0]),
      });
      tx.command(editorCommands.deleteFragment, { direction: 'backward' });
    });
    authoredTestApi(editor).decide([
      { action: 'reject', changes: ['alice:1'] },
      { action: 'accept', changes: ['bob:1'] },
    ]);

    assert.deepEqual(editor.read.children(), [
      { type: 'quote', children: [paragraph({ text: 'xef' })] },
      paragraph({ text: 'gh' }),
    ]);
  });

  it('removes both nested quotes a Suggesting deletion moves the only line out of even when the pending unwraps of both are rejected', () => {
    const editor = editorFor(
      [
        { type: 'quote', children: [paragraph({ text: 'xab' })] },
        paragraph({ text: 'cd' }),
        {
          type: 'quote',
          authored: [mark('unwrap', 'alice')],
          children: [
            {
              type: 'quote',
              authored: [mark('unwrap', 'carol')],
              children: [paragraph({ text: 'ef' })],
            },
          ],
        },
        paragraph({ text: 'gh' }),
      ],
      'propose',
      'bob',
      [NestedQuotes]
    );

    editor.update((tx) => {
      tx.selection.set({
        anchor: point(0, [2, 0, 0, 0]),
        focus: point(1, [0, 0, 0]),
      });
      tx.command(editorCommands.deleteFragment, { direction: 'backward' });
    });
    authoredTestApi(editor).decide([
      { action: 'reject', changes: ['alice:1', 'carol:1'] },
      { action: 'accept', changes: ['bob:1'] },
    ]);

    assert.deepEqual(editor.read.children(), [
      { type: 'quote', children: [paragraph({ text: 'xef' })] },
      paragraph({ text: 'gh' }),
    ]);
  });

  it('decides the pending unwrap of a quote alone after a Suggesting deletion that keeps a line of it', () => {
    const editor = editorFor(
      [
        paragraph({ text: 'ab' }),
        {
          type: 'quote',
          authored: [mark('unwrap', 'alice')],
          children: [paragraph({ text: 'cd' }), paragraph({ text: 'kl' })],
        },
      ],
      'propose',
      'bob',
      [Quotes]
    );

    editor.update((tx) => {
      tx.selection.set({
        anchor: point(1, [1, 1, 0]),
        focus: point(1, [1, 0, 0]),
      });
      tx.command(editorCommands.deleteFragment, { direction: 'backward' });
    });

    assert.equal(
      authoredTestApi(editor).decide({ action: 'accept', changes: ['alice:1'] })
        .status,
      'applied'
    );
  });

  it('decides the pending unwrap of a quote alone after a deletion takes the last live letter of a line another author’s pending deletion strikes in it, in either intent', () => {
    const decided = (['edit', 'propose'] as const).map((intent) => {
      const editor = editorFor(
        [
          paragraph({ text: 'xy' }),
          {
            type: 'quote',
            authored: [mark('unwrap', 'alice')],
            children: [
              {
                ...paragraph(
                  { text: 'ab', authored: [mark('delete', 'dana')] },
                  { text: 'N' }
                ),
                authored: [mark('delete', 'dana')],
              },
            ],
          },
        ],
        intent,
        'bob',
        [Quotes]
      );

      editor.update((tx) => {
        tx.selection.set({
          anchor: point(1, [1, 0, 1]),
          focus: point(0, [1, 0, 1]),
        });
        tx.command(editorCommands.deleteFragment, { direction: 'backward' });
      });

      return authoredTestApi(editor).decide({
        action: 'accept',
        changes: ['alice:1'],
      }).status;
    });

    assert.deepEqual(decided, ['applied', 'applied']);
  });

  it('joins a line holding another author’s pending insertion at once on an Editing Backspace', () => {
    const inserted = { text: 'X', authored: [mark('insert', 'alice')] };
    const editor = editing([
      paragraph({ text: 'ab' }),
      paragraph({ text: 'c' }, inserted, { text: 'd' }),
    ]);

    editor.update((tx) => {
      tx.selection.set({ anchor: point(0, [1, 0]), focus: point(0, [1, 0]) });
      tx.command(editorCommands.delete, {
        direction: 'backward',
        unit: 'character',
      });
    });

    assert.deepEqual(expandedChildren(editor), [
      paragraph({ text: 'abc' }, inserted, { text: 'd' }),
    ]);
  });

  it('joins at once the line an Editing write types into across the break, beside text another author struck', () => {
    const struck = { text: 'ab', authored: [mark('delete', 'alice')] };
    const editor = editing([paragraph(struck), paragraph({ text: 'cd' })]);

    editor.update((tx) => {
      tx.selection.set({ anchor: point(0, [1, 0]), focus: point(1) });
      tx.text.insert('N');
    });

    assert.deepEqual(editor.read.children(), [
      paragraph(struck, { text: 'Ncd' }),
    ]);
  });

  it('records an Editing delete across two lines that each keep another author’s pending insertion', () => {
    const pending = { text: 'ab', authored: [mark('insert', 'alice')] };
    const editor = editing([
      paragraph({ text: 'ab' }, pending, { text: 'ab' }),
      paragraph({ text: 'ab' }, pending),
    ]);

    editor.update((tx) => {
      tx.text.delete({
        at: { anchor: point(2, [1, 0]), focus: point(0, [0, 2]) },
      });
    });

    assert.deepEqual(editor.read.children(), [
      paragraph({ text: 'ab' }, pending),
      { ...paragraph(pending), authored: [mark('join', 'bob', '~edit:bob')] },
    ]);
  });

  it('keeps an Editing join waiting on a struck quote before the line the write removes', () => {
    const quote = whole(
      { type: 'quote', children: [paragraph({ text: 'cd' })] },
      mark('delete', 'alice')
    );
    const editor = editorFor(
      [
        paragraph({ text: 'ab' }),
        quote,
        paragraph({ text: 'ef' }),
        paragraph({ text: 'gh' }),
      ],
      'edit',
      'bob',
      [Quotes]
    );

    editor.update((tx) => {
      tx.selection.set({ anchor: point(2), focus: point(0, [3, 0]) });
      tx.command(editorCommands.deleteFragment, { direction: 'forward' });
    });
    const recorded = editor.read.children();

    authoredTestApi(editor).decide({ action: 'accept', changes: ['alice:1'] });

    assert.deepEqual(
      { accepted: editor.read.children(), recorded },
      {
        accepted: [paragraph({ text: 'abgh' })],
        recorded: [
          paragraph({ text: 'ab' }),
          quote,
          {
            ...paragraph({ text: 'gh' }),
            authored: [mark('join', 'bob', '~edit:bob')],
          },
        ],
      }
    );
  });

  it('keeps an Editing join waiting on struck lines when another Editing write touches the line after it', () => {
    const editor = editing(
      [
        paragraph({ text: 'ab' }),
        whole(paragraph({ text: 'cd' }), mark('delete', 'alice')),
        whole(paragraph({ text: 'ef' }), mark('delete', 'alice')),
        {
          ...paragraph({ text: 'gh' }),
          authored: [
            { at: 0, author: 'bob', change: '~edit:bob', kind: 'join' },
          ],
        },
        paragraph({ text: 'ij' }),
      ],
      'carol'
    );

    editor.update((tx) => tx.text.insert('X', { at: point(0, [4, 0]) }));
    authoredTestApi(editor).decide({ action: 'accept', changes: ['alice:1'] });

    assert.deepEqual(editor.read.children(), [
      paragraph({ text: 'abgh' }),
      paragraph({ text: 'Xij' }),
    ]);
  });

  it('keeps an Editing delete into a line another author joined off the line before the emptied line', () => {
    const editor = editing([
      paragraph({ text: 'xZ' }),
      paragraph({ text: 'ab' }),
      { ...paragraph({ text: 'cd' }), authored: [mark('join', 'alice')] },
    ]);

    editor.update((tx) =>
      tx.text.delete({
        at: { anchor: point(0, [1, 0]), focus: point(1, [2, 0]) },
      })
    );

    assert.deepEqual(
      authoredTestApi(editor).project('proposed').value.children,
      [paragraph({ text: 'xZ' }), paragraph({ text: 'd' })]
    );
  });

  it('accepts a Suggesting delete into a line another author joined while the join waits', () => {
    const editor = suggesting([
      paragraph({ text: 'xZ' }),
      paragraph({ text: 'ab' }),
      { ...paragraph({ text: 'cd' }), authored: [mark('join', 'alice')] },
    ]);

    editor.update((tx) =>
      tx.text.delete({
        at: { anchor: point(0, [1, 0]), focus: point(1, [2, 0]) },
      })
    );

    assert.deepEqual(
      authoredTestApi(editor).decide({ action: 'accept', changes: ['bob:1'] }),
      { ids: ['bob:1'], status: 'applied' }
    );
  });

  it('keeps a Suggesting delete into a line another author split off the line before the emptied line once the split is rejected', () => {
    const editor = suggesting([
      paragraph({ text: 'xZ' }),
      paragraph({ text: 'ab' }),
      { ...paragraph({ text: 'cd' }), authored: [mark('split', 'alice')] },
    ]);

    editor.update((tx) =>
      tx.text.delete({
        at: { anchor: point(0, [1, 0]), focus: point(1, [2, 0]) },
      })
    );
    authoredTestApi(editor).decide([
      { action: 'accept', changes: ['bob:1'] },
      { action: 'reject', changes: ['alice:1'] },
    ]);

    assert.deepEqual(editor.read.children(), [
      paragraph({ text: 'xZ' }),
      paragraph({ text: 'd' }),
    ]);
  });

  for (const intent of ['edit', 'propose'] as const) {
    it(`keeps another author's join of the line a delete empties in ${intent === 'edit' ? 'Editing' : 'Suggesting'}`, () => {
      const editor = editorFor(
        [
          paragraph({ text: 'xZ' }),
          { ...paragraph({ text: 'ab' }), authored: [mark('join', 'carol')] },
          paragraph({ text: 'cd' }),
        ],
        intent
      );

      editor.update((tx) =>
        tx.text.delete({
          at: { anchor: point(0, [1, 0]), focus: point(1, [2, 0]) },
        })
      );

      assert.deepEqual(
        authoredTestApi(editor).project('proposed').value.children,
        [paragraph({ text: 'xZd' })]
      );
    });
  }

  it('lands Editing text typed in two children of a struck block on the kept text after it, with nothing kept before', () => {
    const editor = editorFor(
      [
        whole(
          {
            type: 'quote',
            children: [paragraph({ text: 'ab' }), paragraph({ text: 'cd' })],
          },
          mark('delete', 'alice')
        ),
        paragraph({ text: 'tail' }),
      ],
      'edit',
      'bob',
      [Quotes]
    );

    editor.update((tx) => {
      tx.text.insert('X', { at: point(1, [0, 0, 0]) });
      tx.text.insert('Y', { at: point(1, [0, 1, 0]) });
    });
    authoredTestApi(editor).decide({ action: 'accept', changes: ['alice:1'] });

    assert.deepEqual(editor.read.children(), [paragraph({ text: 'YXtail' })]);
  });

  it('records Editing that removes one child of a struck block and types in another', () => {
    const editor = editorFor(
      [
        whole(
          {
            type: 'quote',
            children: [paragraph({ text: 'a' }), paragraph({ text: 'bc' })],
          },
          mark('delete', 'alice')
        ),
      ],
      'edit',
      'bob',
      [Quotes]
    );

    editor.update((tx) => {
      tx.nodes.remove({ at: [0, 0] });
      tx.text.insert('X', { at: point(1, [0, 0, 0]) });
    });
    authoredTestApi(editor).decide({ action: 'accept', changes: ['alice:1'] });

    assert.deepEqual(editor.read.children(), [
      { type: 'quote', children: [paragraph({ text: 'X' })] },
    ]);
  });

  it('records a wrap in Suggesting as a wrap mark and keeps the wrapped suggestions', () => {
    const alices = paragraph({
      text: 'X',
      authored: [mark('insert', 'alice')],
    });
    const editor = editorFor([alices], 'propose', 'bob', [Quotes]);

    editor.update((tx) =>
      tx.nodes.wrap({ type: 'quote', children: [] }, { at: [0] })
    );

    assert.deepEqual(editor.read.children(), [
      { type: 'quote', authored: [mark('wrap')], children: [alices] },
    ]);
    authoredTestApi(editor).decide({ action: 'reject', changes: ['bob:1'] });
    assert.deepEqual(editor.read.children(), [alices]);
  });
});

describe('authored review tree recording laws', () => {
  const leafArbitrary = fc.record({
    marked: fc.constantFrom('none', 'insert', 'delete'),
    text: fc.constantFrom('ab', 'cde', 'f'),
  });
  const documentArbitrary = fc.array(
    fc.array(leafArbitrary, { maxLength: 3, minLength: 1 }),
    { maxLength: 3, minLength: 1 }
  );
  const editArbitrary = fc.record({
    block: fc.nat(),
    focusBlock: fc.nat(),
    focusLeaf: fc.nat(),
    focusOffset: fc.nat(),
    intent: fc.constantFrom('edit' as const, 'propose' as const),
    kind: fc.constantFrom('insert', 'delete', 'break', 'backspace'),
    leaf: fc.nat(),
    offset: fc.nat(),
  });

  it('restores the document before any recorded edit on undo', () => {
    fc.assert(
      fc.property(documentArbitrary, editArbitrary, (blocks, edit) => {
        // Equal neighbouring leaves merge, as the canonical representation has it.
        const leavesOf = (leaves: (typeof blocks)[number]) => {
          const out: Array<Record<string, unknown>> = [];

          leaves.forEach((leaf, index) => {
            const next =
              leaf.marked === 'none'
                ? {
                    text: leaf.text,
                    ...(index % 2 === 1 ? { bold: true } : {}),
                  }
                : {
                    authored: [
                      mark(leaf.marked as 'delete' | 'insert', 'alice'),
                    ],
                    text: leaf.text,
                  };
            const previous = out.at(-1);
            const { text: _previousText, ...previousProps } = previous ?? {};
            const { text: _nextText, ...nextProps } = next;

            if (
              previous &&
              JSON.stringify(previousProps) === JSON.stringify(nextProps)
            ) {
              out[out.length - 1] = {
                ...previous,
                text: String(previous.text) + String(next.text),
              };
            } else {
              out.push(next);
            }
          });

          return out;
        };
        const initial = blocks.map((leaves) => paragraph(...leavesOf(leaves)));
        let editor;

        try {
          editor = editorFor(initial, edit.intent, 'bob', [history()]);
        } catch {
          return;
        }

        const before = editor.read.children();
        const at = (blockIndex: number, leafIndex: number, offset: number) => {
          const block = before[blockIndex % before.length] as {
            children: Array<{ text: string }>;
          };
          const leaf = leafIndex % block.children.length;

          return {
            offset: offset % (block.children[leaf].text.length + 1),
            path: [blockIndex % before.length, leaf],
          };
        };
        const anchor = at(edit.block, edit.leaf, edit.offset);
        const focus = at(edit.focusBlock, edit.focusLeaf, edit.focusOffset);

        editor.update((tx) => {
          if (edit.kind === 'insert') {
            tx.text.insert('Z', { at: anchor });
          } else if (edit.kind === 'delete') {
            tx.text.delete({ at: { anchor, focus } });
          } else {
            tx.selection.set({ anchor, focus: anchor });
            if (edit.kind === 'break') tx.break.insert();
            else tx.text.deleteBackward();
          }
        });
        if (JSON.stringify(editor.read.children()) === JSON.stringify(before)) {
          return;
        }
        editor.api.history.undo();
        assert.deepEqual(editor.read.children(), before);
      }),
      { numRuns: 400 }
    );
  });

  // S7 of docs/plans/2026-10-10-authored-values.md.
  it('keeps one default child in a struck quote whose block children a suggestion all withdraws', () => {
    const own = [mark('insert', 'bob', 'bob:0')];
    const editor = editorFor(
      [
        paragraph({ text: 'ab' }),
        {
          type: 'quote',
          children: [
            { ...paragraph({ authored: own, text: 'cd' }), authored: own },
            { ...paragraph({ authored: own, text: 'ef' }), authored: own },
          ],
        },
        paragraph({ text: 'gh' }),
      ],
      'propose',
      'bob',
      [Quotes]
    );

    editor.update((tx) =>
      tx.text.delete({
        at: {
          anchor: { offset: 1, path: [0, 0] },
          focus: { offset: 2, path: [2, 0] },
        },
      })
    );
    const quote = (
      editor.read.children() as Array<Record<string, unknown>>
    )[1] as {
      children: Array<{ children: Array<{ text: string }>; type: string }>;
      type: string;
    };

    assert.deepEqual(
      quote.children.map((child) => ({
        texts: child.children.map((leaf) => leaf.text),
        type: child.type,
      })),
      [{ texts: [''], type: 'paragraph' }]
    );
  });
  it('removes a struck quote with its default child when its removal is accepted', () => {
    const own = [mark('insert', 'bob', 'bob:0')];
    const bob = editorFor(
      [
        paragraph({ text: 'ab' }),
        {
          type: 'quote',
          children: [
            { ...paragraph({ authored: own, text: 'cd' }), authored: own },
          ],
        },
      ],
      'propose',
      'bob',
      [Quotes]
    );

    bob.update((tx) => tx.nodes.remove({ at: [1] }));
    const judge = editorFor(bob.read.children() as never, 'edit', 'zed', [
      Quotes,
    ]);

    // Removing the quote withdrew Bob's own pending paragraph inside it.
    authoredTestApi(judge).decide({ action: 'accept', changes: ['bob:1'] });

    assert.deepEqual(judge.read.children(), [paragraph({ text: 'ab' })]);
  });

  it('fills a struck element whose children are all withdrawn as completion builds them, down to an empty row', () => {
    const Grid = defineEditorSchema('record-grid', {
      elements: {
        cell: { content: schema.content.text() },
        group: { content: schema.content.type('row', { min: 1 }) },
        paragraph: { content: schema.content.text() },
        row: { content: schema.content.type('cell', { min: 0 }) },
      },
      id: 'record-grid',
      root: schema.content.any(
        [schema.content.type('paragraph'), schema.content.type('group')],
        { default: { type: 'paragraph' }, min: 1 }
      ),
      unknown: 'reject',
      version: 1,
    });
    const own = [mark('insert', 'bob', 'bob:0')];
    const bob = editorFor(
      [
        paragraph({ text: 'a' }),
        {
          type: 'group',
          children: [
            {
              type: 'row',
              authored: own,
              children: [
                {
                  type: 'cell',
                  authored: own,
                  children: [{ authored: own, text: 'x' }],
                },
              ],
            },
          ],
        },
      ],
      'propose',
      'bob',
      [Grid]
    );

    bob.update((tx) => tx.nodes.remove({ at: [1] }));

    const shapeOf = (node: {
      children?: readonly unknown[];
      text?: string;
      type?: string;
    }): unknown =>
      node.children
        ? {
            [node.type!]: node.children.map((child) => shapeOf(child as never)),
          }
        : node.text;

    assert.deepEqual(shapeOf(bob.read.children()[1]), {
      group: [{ row: [] }],
    });
  });

  it('keeps the pending tag of a split-kept property that depends on an ancestor the same transaction moves', () => {
    const Aligned = defineEditorSchema('record-aligned', {
      elements: {
        paragraph: { content: schema.content.text() },
        quote: { content: schema.content.type('paragraph', { min: 1 }) },
      },
      id: 'record-aligned',
      properties: [
        schema.elementProperty('align', property.string(), {
          target: target.and(
            target.type('paragraph'),
            target.parent(target.type('quote'))
          ),
        }),
      ],
      root: schema.content.any(
        [schema.content.type('paragraph'), schema.content.type('quote')],
        { default: { type: 'paragraph' }, min: 1 }
      ),
      unknown: 'reject',
      version: 1,
    });
    const tag = {
      at: AT,
      author: 'alice',
      change: 'alice:1',
      id: 'align-1',
      key: 'align',
      kind: 'format',
      write: { kind: 'set', value: 'center' },
    };
    const bob = editorFor(
      [
        {
          type: 'quote',
          children: [
            {
              ...paragraph({ text: 'abcd' }),
              align: 'center',
              authored: [tag],
            },
          ],
        },
      ],
      'propose',
      'bob',
      [Aligned]
    );

    bob.update((tx) => {
      tx.nodes.split({
        always: true,
        at: point(2, [0, 0, 0]),
        match: (node) => (node as { type?: string }).type === 'paragraph',
      });
      tx.nodes.insert(paragraph({ text: 'top' }), { at: [0] });
    });

    assert.deepEqual(
      (
        bob.read.children()[1] as {
          children: Array<{ authored?: Array<{ change: string }> }>;
        }
      ).children[1].authored?.map((item) => item.change),
      ['alice:1', 'bob:1']
    );
  });

  describe('rejecting a pending property change after Enter places the tail in another slot', () => {
    const bobTag = (key: string, before?: unknown, value?: unknown) => ({
      at: AT,
      author: 'bob',
      ...(before === undefined ? {} : { before }),
      change: 'bob:1',
      id: `${key}-1`,
      key,
      kind: 'format',
      write: value === undefined ? { kind: 'remove' } : { kind: 'set', value },
    });
    const title = (props: Record<string, unknown>) => ({
      type: 'title',
      ...props,
      children: [{ text: 'Title' }],
    });
    const enterThenReject = (
      first: Record<string, unknown>,
      plugin: unknown,
      intent: 'edit' | 'propose' = 'edit',
      body: Record<string, unknown> = paragraph({ text: 'Body' })
    ) => {
      const alice = editorFor([first, body], intent, 'alice', [plugin]);

      alice.update((tx) => {
        tx.selection.set({ anchor: point(2), focus: point(2) });
        tx.break.insert();
      });

      const result = authoredTestApi(alice).decide({
        action: 'reject',
        changes: ['bob:1'],
      });

      return { children: alice.read.children(), result };
    };

    it('rejects a pending level change on the title, in both modes', () => {
      for (const intent of ['edit', 'propose'] as const) {
        const { children, result } = enterThenReject(
          title({ authored: [bobTag('level', 2, 3)], level: 3 }),
          TitleThenParagraphs('drop'),
          intent
        );

        assert.equal(result.status, 'applied', intent);
        assert.deepEqual(
          children,
          [
            { type: 'title', children: [{ text: 'Ti' }], level: 2 },
            intent === 'edit'
              ? paragraph({ text: 'tle' })
              : {
                  ...paragraph({ text: 'tle' }),
                  authored: [mark('split', 'alice')],
                },
            paragraph({ text: 'Body' }),
          ],
          intent
        );
      }
    });

    it('leaves the tail without a property its type change dropped', () => {
      const { children, result } = enterThenReject(
        title({
          align: 'center',
          authored: [bobTag('align', 'left', 'center')],
        }),
        TitleThenParagraphs('drop')
      );

      assert.equal(result.status, 'applied');
      assert.deepEqual(children, [
        { type: 'title', align: 'left', children: [{ text: 'Ti' }] },
        paragraph({ text: 'tle' }),
        paragraph({ text: 'Body' }),
      ]);
    });

    it('gives a removed property the type change keeps back to both halves', () => {
      const { children, result } = enterThenReject(
        title({ authored: [bobTag('align', 'left')] }),
        TitleThenParagraphs('preserve-if-allowed')
      );

      assert.equal(result.status, 'applied');
      assert.deepEqual(children, [
        { type: 'title', align: 'left', children: [{ text: 'Ti' }] },
        { ...paragraph({ text: 'tle' }), align: 'left' },
        paragraph({ text: 'Body' }),
      ]);
    });

    it('leaves the tail its value when its type refuses the value rejecting gives back', () => {
      const Aligned = defineEditorSchema('record-titled-aligned', {
        elements: {
          paragraph: { content: schema.content.text() },
          title: { content: schema.content.text() },
        },
        id: 'record-titled-aligned',
        properties: [
          schema.elementProperty(
            'align',
            property.enum(['center', 'justify']),
            {
              target: target.type('title'),
              typeChange: 'preserve-if-allowed',
            }
          ),
          schema.elementProperty('align', property.enum(['center', 'left']), {
            target: target.type('paragraph'),
          }),
        ],
        root: schema.content.prefix(
          [{ element: 'title' }],
          schema.content.types(['paragraph'], {
            default: { type: 'paragraph' },
          })
        ),
        unknown: 'reject',
        version: 1,
      });
      const { children, result } = enterThenReject(
        title({
          align: 'center',
          authored: [bobTag('align', 'justify', 'center')],
        }),
        Aligned
      );

      assert.equal(result.status, 'applied');
      assert.deepEqual(children, [
        { type: 'title', align: 'justify', children: [{ text: 'Ti' }] },
        { ...paragraph({ text: 'tle' }), align: 'center' },
        paragraph({ text: 'Body' }),
      ]);
    });

    it('keeps the Editing value on the tail over a pending value its type refuses', () => {
      const Aligned = defineEditorSchema('record-titled-aligned-editing', {
        elements: {
          paragraph: { content: schema.content.text() },
          title: { content: schema.content.text() },
        },
        id: 'record-titled-aligned-editing',
        properties: [
          schema.elementProperty(
            'align',
            property.enum(['center', 'justify']),
            {
              target: target.type('title'),
              typeChange: 'preserve-if-allowed',
            }
          ),
          schema.elementProperty('align', property.enum(['center', 'left']), {
            target: target.type('paragraph'),
          }),
        ],
        root: schema.content.prefix(
          [{ element: 'title' }],
          schema.content.types(['paragraph'], {
            default: { type: 'paragraph' },
          })
        ),
        unknown: 'reject',
        version: 1,
      });
      const handOff = (
        from: ReturnType<typeof editorFor>,
        intent: 'edit' | 'propose',
        author: string
      ) =>
        editorFor(
          JSON.parse(JSON.stringify(from.read.value())),
          intent,
          author,
          [Aligned]
        );
      const bob = editorFor(
        [title({}), paragraph({ text: 'Body' })],
        'propose',
        'bob',
        [Aligned]
      );

      bob.update((tx) =>
        tx.nodes.set({ align: 'justify' } as never, { at: [0] })
      );
      const dana = handOff(bob, 'edit', 'dana');

      dana.update((tx) =>
        tx.nodes.set({ align: 'center' } as never, { at: [0] })
      );
      const alice = handOff(dana, 'edit', 'alice');

      alice.update((tx) => {
        tx.selection.set({ anchor: point(2), focus: point(2) });
        tx.break.insert();
      });
      const tail = alice.read.children()[1];

      assert.deepEqual(
        alice.read.authored
          .reviewOf(tail)
          .marks.filter(({ kind }) => kind === 'format'),
        []
      );
      const result = authoredTestApi(alice).decide({
        action: 'reject',
        changes: ['bob:1'],
      });

      assert.equal(result.status, 'applied');
      assert.deepEqual(
        (alice.read.children() as Array<Record<string, unknown>>).map(
          ({ authored: _authored, ...block }) => block
        ),
        [
          { type: 'title', align: 'center', children: [{ text: 'Ti' }] },
          { ...paragraph({ text: 'tle' }), align: 'center' },
          paragraph({ text: 'Body' }),
        ]
      );
    });

    it('leaves the tail the value its slot fixes', () => {
      const Fixed = defineEditorSchema('record-fixed-slot', {
        elements: { paragraph: { content: schema.content.text() } },
        id: 'record-fixed-slot',
        properties: [
          schema.elementProperty('align', property.string(), {
            target: target.type('paragraph'),
          }),
        ],
        root: schema.content.prefix(
          [
            { element: 'paragraph' },
            { element: 'paragraph', properties: { align: 'left' } },
          ],
          schema.content.types(['paragraph'], {
            default: { type: 'paragraph' },
          })
        ),
        unknown: 'reject',
        version: 1,
      });
      const { children, result } = enterThenReject(
        {
          ...paragraph({ text: 'Title' }),
          align: 'center',
          authored: [bobTag('align', 'right', 'center')],
        },
        Fixed,
        'edit',
        { ...paragraph({ text: 'Body' }), align: 'left' }
      );

      assert.equal(result.status, 'applied');
      assert.deepEqual(children, [
        { ...paragraph({ text: 'Ti' }), align: 'right' },
        { ...paragraph({ text: 'tle' }), align: 'left' },
        { ...paragraph({ text: 'Body' }), align: 'left' },
      ]);
    });
  });

  it('rejects a struck quote another author inserted, with its default child, when every change is rejected', () => {
    const carol = [mark('insert', 'carol', 'carol:0')];
    const alice = [mark('insert', 'alice', 'alice:0')];
    const start = [
      paragraph({ text: 'ab' }),
      {
        type: 'quote',
        authored: carol,
        children: [
          { ...paragraph({ authored: carol, text: 'p1' }), authored: carol },
          { ...paragraph({ authored: alice, text: 'p2' }), authored: alice },
        ],
      },
    ];
    const carolEditor = editorFor(start, 'propose', 'carol', [Quotes]);

    carolEditor.update((tx) => tx.nodes.remove({ at: [1, 0] }));
    const aliceEditor = editorFor(
      carolEditor.read.children() as never,
      'propose',
      'alice',
      [Quotes]
    );

    aliceEditor.update((tx) => tx.nodes.remove({ at: [1] }));
    const judge = editorFor(
      aliceEditor.read.children() as never,
      'edit',
      'zed',
      [Quotes]
    );

    // Each author's removal withdrew their own pending paragraph.
    authoredTestApi(judge).decide({
      action: 'reject',
      changes: ['carol:0', 'alice:1'],
    });

    assert.deepEqual(judge.read.children(), [paragraph({ text: 'ab' })]);
  });
  it('records a paragraph pasted over a link edge in Suggesting, accepting to the Editing result', () => {
    const before = [
      paragraph(
        { text: 'using ' },
        { type: 'link', children: [{ text: 'comments' }] },
        { text: ' on many.' }
      ),
    ];
    const pasted = () =>
      ContentSlice.fromJSON({
        content: [paragraph({ text: 'Improved' })],
        openEnd: 0,
        openStart: 0,
      });
    const at = { anchor: point(0, [0, 1, 0]), focus: point(5, [0, 2]) };
    const edited = editorFor(before, 'edit', 'bob', [Links]);
    const accepted = editorFor(before, 'propose', 'bob', [Links]);
    const rejected = editorFor(before, 'propose', 'bob', [Links]);

    for (const editor of [edited, accepted, rejected]) {
      editor.update((tx) => tx.slice.replace(pasted(), { at }));
    }

    assert.deepEqual(accepted.read.children(), [
      paragraph(
        { text: 'using ' },
        {
          type: 'link',
          children: [{ text: 'comments', authored: [mark('delete')] }],
        },
        { text: ' on m', authored: [mark('delete')] }
      ),
      whole(paragraph({ text: 'Improved' }), mark('insert')),
      { ...paragraph({ text: 'any.' }), authored: [mark('split')] },
    ]);
    authoredTestApi(accepted).decide({ action: 'accept', changes: ['bob:1'] });
    authoredTestApi(rejected).decide({ action: 'reject', changes: ['bob:1'] });
    assert.deepEqual(accepted.read.children(), edited.read.children());
    assert.deepEqual(reviewedValue(rejected).children, before);
  });

  it('records text pasted from before a link into it in Suggesting, accepting to the Editing result', () => {
    const before = [
      paragraph(
        { text: 'using ' },
        { type: 'link', children: [{ text: 'comments' }] },
        { text: ' on many.' }
      ),
    ];
    const pasted = () =>
      ContentSlice.fromJSON({
        content: [paragraph({ text: 'Improved' })],
        openEnd: 1,
        openStart: 1,
      });
    const at = { anchor: point(2, [0, 0]), focus: point(4, [0, 1, 0]) };
    const edited = editorFor(before, 'edit', 'bob', [Links]);
    const accepted = editorFor(before, 'propose', 'bob', [Links]);
    const rejected = editorFor(before, 'propose', 'bob', [Links]);

    for (const editor of [edited, accepted, rejected]) {
      editor.update((tx) => tx.slice.replace(pasted(), { at }));
    }

    authoredTestApi(accepted).decide({ action: 'accept', changes: ['bob:1'] });
    authoredTestApi(rejected).decide({ action: 'reject', changes: ['bob:1'] });
    assert.deepEqual(accepted.read.children(), edited.read.children());
    assert.deepEqual(reviewedValue(rejected).children, before);
  });

  it('keeps the claims of a leaf a replacement writes over a whole leaf, under the writer’s insertion in Suggesting', () => {
    const before = [paragraph({ text: 'x' })];
    const replacing = [
      paragraph({ authored: [mark('insert', 'ann')], text: 'he' }),
    ];
    const edited = editing(before);
    const accepted = suggesting(before);
    const rejected = suggesting(before);

    for (const editor of [edited, accepted, rejected]) {
      editor.update((tx) => tx.value.replace({ children: replacing } as never));
    }

    authoredTestApi(accepted).decide({ action: 'accept', changes: ['bob:1'] });
    assert.deepEqual(edited.read.children(), replacing);
    assert.deepEqual(accepted.read.children(), replacing);
    assert.deepEqual(
      authoredTestApi(rejected).decide({
        action: 'reject',
        changes: ['bob:1'],
      }),
      { ids: ['bob:1'], status: 'blocked', with: ['ann:1'] }
    );
  });
});

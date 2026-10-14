import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  createEditorView,
  defineCommand,
  defineEditorSchema,
  definePlugin,
  definePluginSlot,
  NodeApi,
  property,
  schema,
  target,
  transfer,
} from 'plitejs';

import { createAuthoredPlugin } from '../src/authored/authored';
import { dispatchCommand } from '../src/internal';
import { authoredTestApi, reviewedValue } from './support/authored';

type Node = Record<string, unknown>;

const paragraph = (...children: Node[]) => ({ type: 'paragraph', children });
const quote = (...children: Node[]) => ({ type: 'quote', children });
const text = (value: string, ...authored: Node[]) =>
  authored.length > 0 ? { authored, text: value } : { text: value };
const mark = (kind: string, change: string, author: string) => ({
  at: 1,
  author,
  change,
  kind,
});
const alices = mark('delete', 'alice:1', 'alice');
const bobsOwn = mark('insert', 'bob:0', 'bob');
/** A whole-block suggestion marks the block and every node inside it. */
const whole = (node: Node, ...marks: Node[]): Node => ({
  ...node,
  authored: [...((node.authored as Node[] | undefined) ?? []), ...marks],
  ...(Array.isArray(node.children)
    ? {
        children: (node.children as Node[]).map((child) =>
          whole(child, ...marks)
        ),
      }
    : {}),
});
const point = (offset: number, path: number[]) => ({ offset, path });
const range = (anchor: ReturnType<typeof point>, focus = anchor) => ({
  anchor,
  focus,
});

const Blocks = defineEditorSchema('steps-blocks', {
  elements: {
    card: {
      content: schema.content.text({ default: 'text', min: 1 }),
      contentRoots: {
        body: {
          content: schema.content.types(['paragraph'], {
            default: { type: 'paragraph' },
            min: 1,
          }),
          ownership: 'exclusive',
        },
      },
    },
    heading: { content: schema.content.text() },
    paragraph: { content: schema.content.text() },
    quote: { content: schema.content.type('paragraph', { min: 1 }) },
  },
  id: 'steps-blocks',
  properties: [
    schema.textProperty('bold', property.boolean()),
    schema.textProperty('note', property.string(), { split: 'drop' }),
  ],
  root: schema.content.types(['card', 'heading', 'paragraph', 'quote'], {
    default: { type: 'paragraph' },
    min: 1,
  }),
  unknown: 'reject',
  version: 1,
});

const editorFor = (
  initialValue: unknown,
  intent: 'edit' | 'propose',
  author = 'bob',
  plugins: readonly unknown[] = [Blocks]
) =>
  createEditor({
    plugins: [
      ...(plugins as []),
      transfer(),
      createAuthoredPlugin({
        authorId: author,
        createChangeId: () => `${author}:1`,
        intent,
        now: () => 1,
      }),
    ],
    initialValue: initialValue as never,
  });
const struckBy = (initial: unknown, path: number[]) => {
  const alice = editorFor(initial, 'propose', 'alice');

  alice.update((tx) => tx.nodes.remove({ at: path }));

  return alice.read.value();
};
const decided = (
  value: unknown,
  action: 'accept' | 'reject',
  changes: string[]
) => {
  const editor = editorFor(value, 'edit', 'carol');

  authoredTestApi(editor).decide({ action, changes });

  return reviewedValue(editor);
};

describe('authored review tree recording, step by step', () => {
  it('lands text typed into a struck paragraph that the same Editing transaction moved on the kept text before it', () => {
    const editor = editorFor(
      struckBy(
        [paragraph(text('a')), paragraph(text('gone')), paragraph(text('c'))],
        [1]
      ),
      'edit'
    );

    editor.update((tx) => {
      tx.nodes.move({ at: [1], to: [2] });
      tx.text.insert('X', { at: point(2, [2, 0]) });
    });
    authoredTestApi(editor).decide({ action: 'accept', changes: ['alice:1'] });

    assert.deepEqual(editor.read.children(), [
      paragraph(text('a')),
      paragraph(text('cX')),
    ]);
  });

  it('lands text typed into a struck quote after an Editing delete inside it on the kept text after it', () => {
    const editor = editorFor(
      struckBy(
        [
          quote(
            paragraph(text('ab')),
            paragraph(text('cd')),
            paragraph(text('ef'))
          ),
          paragraph(text('tail')),
        ],
        [0]
      ),
      'edit'
    );

    editor.update((tx) => {
      tx.text.delete({ at: range(point(1, [0, 0, 0]), point(1, [0, 1, 0])) });
      tx.text.insert('X', { at: point(1, [0, 0, 0]) });
      tx.text.insert('Y', { at: point(1, [0, 1, 0]) });
    });
    authoredTestApi(editor).decide({ action: 'accept', changes: ['alice:1'] });

    assert.deepEqual(editor.read.children(), [paragraph(text('YXtail'))]);
  });

  it('keeps the deletion on a paragraph an Editing move takes out of a struck quote', () => {
    const editor = editorFor(
      struckBy(
        [
          quote(paragraph(text('ab')), paragraph(text('cd'))),
          paragraph(text('tail')),
        ],
        [0]
      ),
      'edit'
    );

    editor.update((tx) => tx.nodes.move({ at: [0, 0], to: [1] }));
    authoredTestApi(editor).decide({ action: 'accept', changes: ['alice:1'] });

    assert.deepEqual(editor.read.children(), [paragraph(text('tail'))]);
  });

  const moved = [text('cd', alices), text('ef', bobsOwn)];
  const card = {
    type: 'card',
    childRoots: { body: 'card:1' },
    children: [text('')],
  };

  for (const [name, initial, move, accepted] of [
    [
      'inside one paragraph',
      [paragraph(text('ab'), ...moved, text('gh'))],
      (editor: ReturnType<typeof editorFor>) =>
        editor.api.transfer.move({
          range: range(point(0, [0, 1]), point(2, [0, 2])),
          to: { point: point(2, [0, 3]) },
        }),
      { children: [paragraph(text('abgh'), ...moved)] },
    ],
    [
      'across two paragraphs',
      [paragraph(text('ab'), ...moved), paragraph(text('gh'))],
      (editor: ReturnType<typeof editorFor>) =>
        editor.api.transfer.move({
          range: range(point(0, [0, 1]), point(2, [0, 2])),
          to: { point: point(1, [1, 0]) },
        }),
      {
        children: [
          paragraph(text('ab')),
          paragraph(text('g'), ...moved, text('h')),
        ],
      },
    ],
    [
      'from a content root into the document',
      {
        children: [paragraph(text('top')), card],
        roots: { 'card:1': [paragraph(text('ab'), ...moved)] },
      },
      (editor: ReturnType<typeof editorFor>) =>
        editor.api.transfer.move({
          from: createEditorView(editor, { root: 'card:1' }),
          range: range(point(0, [0, 1]), point(2, [0, 2])),
          to: { point: point(3, [0, 0]) },
        }),
      {
        children: [paragraph(text('top'), ...moved), card],
        roots: { 'card:1': [paragraph(text('ab'))] },
      },
    ],
    [
      'as a block from a content root into the document',
      {
        children: [paragraph(text('top')), card],
        roots: {
          'card:1': [paragraph(text('ab')), paragraph(...moved)],
        },
      },
      (editor: ReturnType<typeof editorFor>) => {
        const body = createEditorView(editor, { root: 'card:1' });

        return editor.api.transfer.move({
          from: body,
          nodes: [body.key([1])!],
          to: { edge: 'after', key: editor.key([0])! },
        });
      },
      {
        children: [paragraph(text('top')), paragraph(...moved), card],
        roots: { 'card:1': [paragraph(text('ab'))] },
      },
    ],
  ] as const) {
    it(`moves another author's struck text and one's own pending text ${name} in Suggesting`, () => {
      const editor = editorFor(initial, 'propose');
      const before = editor.read.value();
      const outcome = move(editor);
      const recorded = editor.read.value();

      assert.equal(outcome.status, 'moved');
      assert.deepEqual(decided(recorded, 'accept', ['bob:1']), {
        ...before,
        ...accepted,
      });
      assert.deepEqual(decided(recorded, 'reject', ['bob:1']), before);
    });
  }

  it('records a replaceChildren relocation of one’s own pending paragraph as a deletion plus an insertion', () => {
    const mine = whole(paragraph(text('mine')), bobsOwn);
    const editor = editorFor(
      [paragraph(text('a')), mine, paragraph(text('c'))],
      'propose'
    );

    editor.update((tx) => {
      const [first, second, third] = editor.read.children();

      tx.nodes.replaceChildren([first, third, second], { at: [], count: 3 });
    });
    const recorded = editor.read.value();

    // A limit: without a move link the old suggestion does not come back, so
    // rejecting the relocation takes it too and waits until it is decided.
    assert.deepEqual(
      authoredTestApi(editorFor(recorded, 'edit', 'carol')).decide({
        action: 'reject',
        changes: ['bob:1'],
      }),
      { ids: ['bob:1'], status: 'blocked', with: ['bob:0'] }
    );
    assert.deepEqual(decided(recorded, 'reject', ['bob:0', 'bob:1']).children, [
      paragraph(text('a')),
      paragraph(text('c')),
    ]);
    assert.deepEqual(decided(recorded, 'accept', ['bob:1']).children, [
      paragraph(text('a')),
      paragraph(text('c')),
      mine,
    ]);
  });

  for (const intent of ['edit', 'propose'] as const) {
    it(`gives text typed over all of another author's struck text none of its marks, in ${intent === 'edit' ? 'Editing' : 'Suggesting'}`, () => {
      const editor = editorFor([paragraph(text('cd', alices))], intent);

      editor.update((tx) => {
        tx.selection.set(range(point(0, [0, 0]), point(2, [0, 0])));
        tx.text.insert('X');
      });

      const typed = [
        ...NodeApi.texts({ children: editor.read.children() } as never),
      ]
        .map(([node]) => node)
        .find((node) => node.text === 'X');

      assert.deepEqual(
        typed,
        intent === 'edit'
          ? { text: 'X' }
          : text('X', mark('insert', 'bob:1', 'bob'))
      );
    });
  }

  it('keeps a letter typed in Editing out of the deletion of struck text it types into', () => {
    const editor = editorFor([paragraph(text('abc', alices))], 'edit');

    editor.update((tx) => {
      tx.text.delete({ at: range(point(0, [0, 0]), point(1, [0, 0])) });
      tx.text.insert('a', { at: point(2, [0, 0]) });
    });

    assert.deepEqual(editor.read.children(), [
      paragraph(text('abc', alices), text('a')),
    ]);
  });

  it('accepts and rejects a Suggesting delete across three blocks whose middle one is a heading', () => {
    const initial = [
      paragraph(text('ab')),
      { type: 'heading', children: [text('H')] },
      paragraph(text('cd')),
    ];
    const editor = editorFor(initial, 'propose');

    editor.update((tx) => {
      tx.text.delete({ at: range(point(1, [0, 0]), point(1, [2, 0])) });
    });

    const removed = mark('delete', 'bob:1', 'bob');

    // The heading's text carries the deletion itself, so it keeps it wherever
    // the text goes.
    assert.deepEqual(editor.read.children(), [
      paragraph(text('a'), text('b', removed)),
      whole({ type: 'heading', children: [text('H')] }, removed),
      {
        ...paragraph(text('c', removed), text('d')),
        authored: [mark('join', 'bob:1', 'bob')],
      },
    ]);
    assert.deepEqual(
      decided(editor.read.value(), 'accept', ['bob:1']).children,
      [paragraph(text('ad'))]
    );
    assert.deepEqual(
      decided(editor.read.value(), 'reject', ['bob:1']).children,
      initial
    );
  });

  it('records a Suggesting unwrap of a paragraph inside a quote that accepts as Editing unwraps it', () => {
    const initial = [quote(paragraph(text('ab')), paragraph(text('cd')))];
    const unwrap = (intent: 'edit' | 'propose') => {
      const editor = editorFor(initial, intent, 'bob', []);

      editor.update((tx) => tx.nodes.unwrap({ at: [0, 0] }));

      return editor.read.value();
    };
    const decide = (action: 'accept' | 'reject') => {
      const editor = editorFor(unwrap('propose'), 'edit', 'carol', []);

      assert.equal(
        authoredTestApi(editor).decide({ action, changes: ['bob:1'] }).status,
        'applied'
      );

      return editor.read.children();
    };

    assert.deepEqual(decide('accept'), unwrap('edit').children);
    assert.deepEqual(decide('reject'), initial);
  });

  it('keeps a Suggesting merge of a bold and a plain text apart, as a format change of the plain one', () => {
    const editor = editorFor(
      [paragraph({ bold: true, text: 'a' }, text('b'))],
      'propose'
    );

    editor.update((tx) => tx.nodes.merge({ at: [0, 1] }));

    assert.deepEqual(
      decided(editor.read.value(), 'accept', ['bob:1']).children,
      [paragraph({ bold: true, text: 'ab' })]
    );
    assert.deepEqual(
      decided(editor.read.value(), 'reject', ['bob:1']).children,
      [paragraph({ bold: true, text: 'a' }, text('b'))]
    );
  });

  it('records the property a Suggesting Enter drops from the right half as that text’s format change', () => {
    const initial = [paragraph({ note: 'n', text: 'ab' })];
    const editor = editorFor(initial, 'propose');

    editor.update((tx) => {
      tx.selection.set(range(point(1, [0, 0])));
      tx.break.insert();
    });

    assert.deepEqual(
      decided(editor.read.value(), 'accept', ['bob:1']).children,
      [paragraph({ note: 'n', text: 'a' }), paragraph(text('b'))]
    );
    assert.deepEqual(
      decided(editor.read.value(), 'reject', ['bob:1']).children,
      initial
    );
  });

  it('records a move then a type the same way run directly, through a command spec and across a schema rebind', () => {
    const initial = [
      paragraph(text('a')),
      paragraph(text('bc')),
      paragraph(text('d')),
    ];
    const moveThenType = defineCommand('steps.move-then-type');
    const command = definePlugin('steps-command', {
      commands: ({ handle }) => [
        handle(moveThenType, ({ state }) =>
          state.transaction((tx) => {
            tx.nodes.move({ at: [1], to: [2] });
            tx.text.insert('X', { at: point(1, [2, 0]) });
          })
        ),
      ],
    });
    const slot = definePluginSlot('steps-schema');
    const revision = (version: number) =>
      defineEditorSchema('steps-revision', {
        elements: { paragraph: { content: schema.content.text() } },
        id: 'steps-revision',
        properties:
          version === 2
            ? [
                schema.elementProperty('align', property.string(), {
                  target: target.type('paragraph'),
                }),
              ]
            : [],
        root: schema.content.type('paragraph', { min: 1 }),
        unknown: 'reject',
        version,
      });
    const direct = editorFor(initial, 'propose');
    const spec = editorFor(initial, 'propose', 'bob', [Blocks, command]);
    const rebound = editorFor(initial, 'propose', 'bob', [
      slot.of(revision(1)),
    ]);

    direct.update((tx) => {
      tx.nodes.move({ at: [1], to: [2] });
      tx.text.insert('X', { at: point(1, [2, 0]) });
    });
    dispatchCommand(spec, moveThenType);
    rebound.update((tx) => {
      tx.nodes.move({ at: [1], to: [2] });
      tx.text.insert('X', { at: point(1, [2, 0]) });
      // A migration that writes the document rebinds the draft to the new
      // schema, replaying the steps so far. It sees the plain draft, so it
      // edits only the block both drafts hold unchanged.
      tx.plugins.reconfigure(slot, revision(2), {
        migrate: ({ document }) => ({
          ...document,
          children: document.children.map((node, index) =>
            index === 0 ? { ...node, align: 'left' } : node
          ),
        }),
      });
    });

    const inserted = mark('insert', 'bob:1', 'bob');
    const removed = mark('delete', 'bob:1', 'bob');
    const expected = [
      paragraph(text('a')),
      whole(paragraph(text('bc')), removed),
      paragraph(text('d')),
      whole(paragraph(text('bXc')), inserted),
    ];

    assert.deepEqual(direct.read.children(), expected);
    assert.deepEqual(spec.read.children(), expected);
    assert.deepEqual(rebound.read.children(), [
      { ...expected[0], align: 'left' },
      ...expected.slice(1),
    ]);
  });

  it('records nothing for a plugin reconfigured in Suggesting, its migration included', () => {
    const slot = definePluginSlot('steps-migration');
    const revision = (version: number) =>
      defineEditorSchema('steps-migration-schema', {
        elements: { paragraph: { content: schema.content.text() } },
        id: 'steps-migration-schema',
        properties:
          version === 2
            ? [
                schema.elementProperty('align', property.string(), {
                  target: target.type('paragraph'),
                }),
              ]
            : [],
        root: schema.content.type('paragraph', { min: 1 }),
        unknown: 'reject',
        version,
      });
    const editor = editorFor([paragraph(text('a'))], 'propose', 'bob', [
      slot.of(revision(1)),
    ]);

    editor.update((tx) => {
      tx.plugins.reconfigure(slot, revision(2), {
        migrate: ({ document }) => ({
          ...document,
          children: document.children.map((node) => ({
            ...node,
            align: 'left',
          })),
        }),
      });
    });

    assert.deepEqual(editor.read.children(), [
      { ...paragraph(text('a')), align: 'left' },
    ]);
  });

  it('reads text typed in Editing inside a struck paragraph as content before the deletion is decided', () => {
    const editor = editorFor(struckBy([paragraph(text('gone'))], [0]), 'edit');

    editor.update((tx) => tx.text.insert('X', { at: point(2, [0, 0]) }));

    assert.equal(editor.read.text.string([], { content: true }), 'X');
    assert.deepEqual(NodeApi.findTextRanges(editor, 'X', { content: true }), [
      range(point(0, [0, 1]), point(1, [0, 1])),
    ]);
  });
});

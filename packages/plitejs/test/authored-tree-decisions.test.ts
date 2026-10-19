import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  ContentSlice,
  createEditor,
  defineEditorSchema,
  editorCommands,
  NodeApi,
  property,
  schema,
  target,
} from 'plitejs';

import { createAuthoredPlugin } from '../src/authored/authored';
import {
  authoredTestApi,
  expandedChildren,
  reviewedValue,
} from './support/authored';

type Node = Record<string, unknown> & {
  children?: readonly Node[];
  text?: string;
};
type Editor = ReturnType<typeof editorFor>;
type Edit = Readonly<{
  author: string;
  change: string;
  run: (editor: Editor) => void;
}>;

const paragraph = (text: string) => ({
  type: 'paragraph',
  children: [{ text }],
});
const quote = (...children: Node[]) => ({ type: 'quote', children });

const Quotes = defineEditorSchema('decisions-quotes', {
  elements: {
    heading: { content: schema.content.text() },
    hr: { void: 'block' },
    paragraph: { content: schema.content.text() },
    quote: {
      content: schema.content.types(['hr', 'paragraph', 'quote'], {
        default: { type: 'paragraph' },
        min: 1,
      }),
    },
  },
  id: 'decisions-quotes',
  root: schema.content.types(['heading', 'hr', 'paragraph', 'quote'], {
    default: { type: 'paragraph' },
    min: 1,
  }),
  unknown: 'reject',
  version: 1,
});

const editorFor = (
  initialValue: readonly Node[],
  author: string,
  intent: 'edit' | 'propose',
  change: string,
  withSchema: boolean
) =>
  createEditor({
    plugins: [
      ...(withSchema ? [Quotes] : []),
      createAuthoredPlugin({
        authorId: author,
        createChangeId: () => change,
        intent,
        now: () => 1,
      }),
    ],
    initialValue: initialValue as never,
  });

const pointBefore = (editor: Editor, letter: string) => {
  for (const [node, path] of NodeApi.texts({
    children: editor.read.children(),
  } as never)) {
    const offset = (node as Node).text?.indexOf(letter) ?? -1;

    if (offset !== -1) return { offset, path };
  }

  throw new Error(`No text holds ${letter}.`);
};
const blockOf = (editor: Editor, letter: string) =>
  pointBefore(editor, letter).path.slice(0, -1);
const backspaceAt = (letter: string) => (editor: Editor) =>
  editor.update((tx) => {
    const caret = pointBefore(editor, letter);

    tx.selection.set({ anchor: caret, focus: caret });
    tx.text.deleteBackward();
  });
const removeBlockOf = (letter: string) => (editor: Editor) =>
  editor.update((tx) => tx.nodes.remove({ at: blockOf(editor, letter) }));

const record = (
  initial: readonly Node[],
  history: readonly Edit[],
  intent: 'edit' | 'propose',
  withSchema: boolean
) =>
  history.reduce<readonly Node[]>((value, edit) => {
    const editor = editorFor(
      value,
      edit.author,
      intent,
      edit.change,
      withSchema
    );

    edit.run(editor);

    return editor.read.children();
  }, initial);
const decide = (
  value: readonly Node[],
  changes: readonly string[],
  withSchema: boolean
) => {
  const editor = editorFor(value, 'carol', 'edit', 'carol:1', withSchema);
  const result = authoredTestApi(editor).decide({ action: 'accept', changes });

  return { result, value: editor.read.children() as Node[] };
};

/**
 * Accepting the changes together, or one at a time in every order where a
 * blocked step decides with what it waits on, gives one document, and unless
 * `editing` is false, that document is the history replayed in Editing.
 * `initialChanges` are the pending changes `initial` already holds, decided
 * with the history's.
 */
const assertOneResult = (
  initial: readonly Node[],
  history: readonly Edit[],
  {
    editing = true,
    initialChanges = [],
    withSchema = true,
  }: Readonly<{
    editing?: boolean;
    initialChanges?: readonly string[];
    withSchema?: boolean;
  }> = {}
) => {
  const recorded = record(initial, history, 'propose', withSchema);
  const changes = [...initialChanges, ...history.map((edit) => edit.change)];
  const together = decide(recorded, changes, withSchema);
  const permutations = (items: readonly string[]): string[][] =>
    items.length <= 1
      ? [[...items]]
      : items.flatMap((item, index) =>
          permutations(items.filter((_, other) => other !== index)).map(
            (rest) => [item, ...rest]
          )
        );

  assert.equal(together.result.status, 'applied');
  if (editing) {
    assert.deepEqual(
      together.value,
      record(initial, history, 'edit', withSchema)
    );
  }
  for (const order of permutations(changes)) {
    let value = recorded;
    const remaining = [...order];

    while (remaining.length > 0) {
      const batch = new Set([remaining.shift()!]);
      let step = decide(value, [...batch], withSchema);

      while (step.result.status === 'blocked') {
        for (const change of step.result.with) batch.add(change);
        step = decide(value, [...batch], withSchema);
      }
      for (const change of batch) {
        if (remaining.includes(change)) {
          remaining.splice(remaining.indexOf(change), 1);
        }
      }
      ({ value } = step);
    }
    assert.deepEqual(value, together.value, `order ${order.join(', ')}`);
  }

  return recorded;
};

describe('authored review tree decisions on recorded structure', () => {
  for (const withSchema of [true, false]) {
    const name = withSchema ? 'the quote schema' : 'no content declarations';

    it(`decides a join into a block another change empties to one result, on ${name}`, () => {
      // A limit: Backspace after the quote recorded a move into the second
      // quote and a join, so accepting both leaves the paragraph there, where
      // Editing, run after the deletion, merges it into the first quote.
      assertOneResult(
        [quote(paragraph('a')), quote(paragraph('b')), paragraph('c')],
        [
          { author: 'alice', change: 'alice:1', run: removeBlockOf('b') },
          { author: 'bob', change: 'bob:1', run: backspaceAt('c') },
        ],
        { editing: false, withSchema }
      );
    });

    it(`records merging a quote into the paragraph before it as a move decided as Editing merges, on ${name}`, () => {
      assertOneResult(
        [paragraph('a'), quote(paragraph('b'), paragraph('c'))],
        [
          {
            author: 'bob',
            change: 'bob:1',
            run: (editor) => editor.update((tx) => tx.nodes.merge({ at: [1] })),
          },
        ],
        { withSchema }
      );
    });
  }

  it('decides a quote’s pending unwrap with its pending deletion', () => {
    const recorded = record(
      [quote(paragraph('a')), paragraph('z')],
      [
        {
          author: 'alice',
          change: 'alice:1',
          run: (editor) => editor.update((tx) => tx.nodes.remove({ at: [0] })),
        },
        {
          author: 'bob',
          change: 'bob:1',
          run: (editor) => editor.update((tx) => tx.nodes.unwrap({ at: [0] })),
        },
      ],
      'propose',
      true
    );

    assert.deepEqual(decide(recorded, ['bob:1'], true).result, {
      ids: ['bob:1'],
      status: 'blocked',
      with: ['alice:1'],
    });
    assert.equal(
      decide(recorded, ['alice:1', 'bob:1'], true).result.status,
      'applied'
    );
  });

  it('decides a quote’s deletion with a pending deletion of text typed inside it, to one result', () => {
    // Live text inside a struck quote, as a stored or collaborative document
    // holds it; Editing lands typed text on kept text instead.
    const struck = {
      authored: [{ at: 1, author: 'alice', change: 'alice:1', kind: 'delete' }],
    };
    const inside = [
      {
        type: 'quote',
        ...struck,
        children: [
          {
            type: 'paragraph',
            ...struck,
            children: [
              { ...struck, text: 'a' },
              { text: 'X' },
              { ...struck, text: 'b' },
            ],
          },
        ],
      },
      paragraph('z'),
    ] as Node[];

    assertOneResult(inside, [
      {
        author: 'carol',
        change: 'carol:2',
        run: (editor) =>
          editor.update((tx) => {
            const x = pointBefore(editor, 'X');

            tx.text.delete({
              at: { anchor: x, focus: { ...x, offset: x.offset + 1 } },
            });
          }),
      },
    ]);
    assert.equal(
      decide(
        record(
          inside,
          [
            {
              author: 'carol',
              change: 'carol:2',
              run: (editor) =>
                editor.update((tx) => {
                  const x = pointBefore(editor, 'X');

                  tx.text.delete({
                    at: { anchor: x, focus: { ...x, offset: x.offset + 1 } },
                  });
                }),
            },
          ],
          'propose',
          true
        ),
        ['alice:1'],
        true
      ).result.status,
      'blocked'
    );
  });

  const strikeH: Edit = {
    author: 'bob',
    change: 'bob:1',
    run: (editor) =>
      editor.update((tx) =>
        tx.text.delete({
          at: {
            anchor: pointBefore(editor, 'H'),
            focus: { ...pointBefore(editor, 'H'), offset: 1 },
          },
        })
      ),
  };

  it('accepts a heading’s deleted text and a raw backward deletion from the next paragraph into that heading', () => {
    // Replayed in Editing, the raw merge drops the emptied heading and keeps
    // the paragraph instead, so only the decision orders are compared.
    const recorded = assertOneResult(
      [{ type: 'heading', children: [{ text: 'H' }] }, paragraph('x')],
      [strikeH, { author: 'bob', change: 'bob:2', run: backspaceAt('x') }],
      { editing: false }
    );

    assert.deepEqual(decide(recorded, ['bob:1', 'bob:2'], true).value, [
      { type: 'heading', children: [{ text: 'x' }] },
    ]);
  });

  it('accepts a heading’s deleted text and a Backspace from the next paragraph to that paragraph alone', () => {
    const recorded = assertOneResult(
      [{ type: 'heading', children: [{ text: 'H' }] }, paragraph('x')],
      [
        strikeH,
        {
          author: 'bob',
          change: 'bob:2',
          run: (editor) =>
            editor.update((tx) => {
              const caret = pointBefore(editor, 'x');

              tx.selection.set({ anchor: caret, focus: caret });
              tx.command(editorCommands.delete, {
                direction: 'backward',
                unit: 'character',
              });
            }),
        },
      ]
    );

    assert.deepEqual(decide(recorded, ['bob:1', 'bob:2'], true).value, [
      paragraph('x'),
    ]);
  });

  it('lands a join whose struck target it skips inside the quote before it', () => {
    const recorded = assertOneResult(
      [quote(paragraph('a')), paragraph('b'), paragraph('c')],
      [
        { author: 'alice', change: 'alice:1', run: removeBlockOf('b') },
        { author: 'bob', change: 'bob:1', run: backspaceAt('c') },
      ]
    );

    assert.deepEqual(decide(recorded, ['alice:1', 'bob:1'], true).value, [
      quote(paragraph('ac')),
    ]);
  });

  it('resolves two quotes merged and the first then wrapped to the Editing nesting', () => {
    assertOneResult(
      [quote(paragraph('a')), quote(paragraph('b'))],
      [
        {
          author: 'bob',
          change: 'bob:1',
          run: (editor) => editor.update((tx) => tx.nodes.merge({ at: [1] })),
        },
        {
          author: 'alice',
          change: 'alice:1',
          run: (editor) =>
            editor.update((tx) =>
              tx.nodes.wrap({ type: 'quote', children: [] } as never, {
                at: [0],
              })
            ),
        },
      ]
    );
  });

  it('keeps a joined block whose earlier blocks Editing deleted', () => {
    const joined = record(
      [paragraph('a'), paragraph('b')],
      [{ author: 'bob', change: 'bob:1', run: backspaceAt('b') }],
      'propose',
      true
    );
    const deleted = record(
      joined,
      [{ author: 'carol', change: 'carol:1', run: removeBlockOf('a') }],
      'edit',
      true
    );

    assert.deepEqual(decide(deleted, ['bob:1'], true).value, [paragraph('b')]);
  });

  it('keeps a paragraph whose only text an accepted suggestion deletes', () => {
    assertOneResult(
      [paragraph('a'), paragraph('b')],
      [
        {
          author: 'bob',
          change: 'bob:1',
          run: (editor) =>
            editor.update((tx) =>
              tx.text.delete({
                at: {
                  anchor: pointBefore(editor, 'a'),
                  focus: { ...pointBefore(editor, 'a'), offset: 1 },
                },
              })
            ),
        },
      ]
    );
  });

  it('limits an Editing move of the only paragraph out of a quote with a pending unwrap, which keeps the empty paragraph the core fills the quote with', () => {
    const unwrapping = record(
      [paragraph('a'), quote(paragraph('b'))],
      [
        {
          author: 'alice',
          change: 'alice:1',
          run: (editor) => editor.update((tx) => tx.nodes.unwrap({ at: [1] })),
        },
      ],
      'propose',
      true
    );
    const moveOut = (intent: 'edit' | 'propose') =>
      decide(
        record(
          unwrapping,
          [
            {
              author: 'bob',
              change: 'bob:1',
              run: (editor) =>
                editor.update((tx) => tx.nodes.move({ at: [1, 0], to: [1] })),
            },
          ],
          intent,
          true
        ),
        intent === 'edit' ? ['alice:1'] : ['alice:1', 'bob:1'],
        true
      ).value;

    assert.deepEqual(moveOut('propose'), [paragraph('a'), paragraph('b')]);
    assert.deepEqual(moveOut('edit'), [
      paragraph('a'),
      paragraph('b'),
      paragraph(''),
    ]);
  });

  it('limits a move of a paragraph a pending join extends, which leaves the join on its own paragraph', () => {
    const joined = record(
      [paragraph('x'), paragraph('a'), paragraph('b'), paragraph('c')],
      [{ author: 'alice', change: 'alice:1', run: backspaceAt('b') }],
      'propose',
      true
    );
    const moved = record(
      joined,
      [
        {
          author: 'carol',
          change: 'carol:1',
          run: (editor) =>
            editor.update((tx) => tx.nodes.move({ at: [1], to: [3] })),
        },
      ],
      'edit',
      true
    );
    const texts = (value: readonly Node[]) =>
      value.map((block) => NodeApi.string(block as never));

    assert.deepEqual(texts(decide(moved, ['alice:1'], true).value), [
      'xb',
      'c',
      'a',
    ]);

    const rejecter = editorFor(moved, 'zed', 'edit', 'zed:1', true);

    authoredTestApi(rejecter).decide({
      action: 'reject',
      changes: ['alice:1'],
    });
    assert.deepEqual(texts(rejecter.read.children() as Node[]), [
      'x',
      'b',
      'c',
      'a',
    ]);
  });

  it('keeps text typed in Editing inside struck text when the same transaction wraps its paragraph', () => {
    const struck = record(
      [paragraph('ab')],
      [
        {
          author: 'alice',
          change: 'alice:1',
          run: (editor) =>
            editor.update((tx) =>
              tx.text.delete({
                at: {
                  anchor: pointBefore(editor, 'a'),
                  focus: { ...pointBefore(editor, 'b'), offset: 2 },
                },
              })
            ),
        },
      ],
      'propose',
      true
    );
    const wrapped = record(
      struck,
      [
        {
          author: 'carol',
          change: 'carol:1',
          run: (editor) =>
            editor.update((tx) => {
              tx.text.insert('X', { at: { ...pointBefore(editor, 'b') } });
              tx.nodes.wrap({ type: 'quote', children: [] } as never, {
                at: [0],
              });
            }),
        },
      ],
      'edit',
      true
    );

    assert.deepEqual(decide(wrapped, ['alice:1'], true).value, [
      quote(paragraph('X')),
    ]);
  });

  it('decides format changes recorded on top of each other from the top down, the bottom up or together', () => {
    const Formats = defineEditorSchema('decisions-format-order', {
      elements: { paragraph: { content: schema.content.text() } },
      id: 'decisions-format-order',
      properties: [
        schema.textProperty('bold', property.boolean()),
        schema.textProperty('color', property.string()),
      ],
      root: schema.content.types(['paragraph'], {
        default: { type: 'paragraph' },
        min: 1,
      }),
      unknown: 'reject',
      version: 1,
    });
    const formatEditor = (
      value: unknown,
      change: string,
      intent: 'edit' | 'propose'
    ) =>
      createEditor({
        initialValue: value as never,
        plugins: [
          Formats,
          // One author per change, so a later change stacks on an earlier one
          // instead of withdrawing it.
          createAuthoredPlugin({
            authorId: change,
            createChangeId: () => change,
            intent,
            now: () => 1,
          }),
        ],
      });
    const recorded = (
      steps: ReadonlyArray<readonly [string, Record<string, unknown> | string]>
    ) =>
      steps.reduce<unknown>(
        (value, [change, set]) => {
          const editor = formatEditor(value, change, 'propose');

          editor.update((tx) =>
            typeof set === 'string'
              ? tx.nodes.unset(set as never, { at: [0, 0] })
              : tx.nodes.set(set as never, { at: [0, 0] })
          );
          return editor.read.value();
        },
        [paragraph('x')]
      );
    const decideOn = (
      current: unknown,
      decisions: Parameters<ReturnType<typeof authoredTestApi>['decide']>[0]
    ) => {
      const editor = formatEditor(current, 'zed', 'edit');
      const result = authoredTestApi(editor).decide(decisions);

      return { result, value: reviewedValue(editor) };
    };
    const decided = (
      current: unknown,
      decisions: Parameters<typeof decideOn>[1]
    ) => decideOn(current, decisions).value;
    const reject = (changes: string[]) => ({
      action: 'reject' as const,
      changes,
    });
    const colors = recorded([
      ['z', { color: 'red' }],
      ['a', { color: 'blue' }],
    ]);
    const toggles = recorded([
      ['A', { bold: true }],
      ['B', 'bold'],
      ['C', { bold: true }],
    ]);

    assert.deepEqual(decided(colors, reject(['z', 'a'])), {
      children: [paragraph('x')],
    });
    assert.deepEqual(decideOn(colors, reject(['z'])), {
      result: { ids: ['z'], status: 'blocked', with: ['a'] },
      value: colors,
    });
    assert.deepEqual(
      decided(decided(colors, reject(['a'])), reject(['z'])),
      decided(colors, reject(['z', 'a']))
    );
    assert.deepEqual(
      decideOn(toggles, { action: 'accept', changes: ['C'] }).result,
      { ids: ['C'], status: 'blocked', with: ['A', 'B'] }
    );
    assert.deepEqual(
      decided(toggles, [
        { action: 'accept', changes: ['C'] },
        reject(['A', 'B']),
      ]),
      {
        children: [
          { children: [{ bold: true, text: 'x' }], type: 'paragraph' },
        ],
      }
    );

    // C bolds, D unbolds, then C is made again on top of D.
    const reopen = formatEditor(
      recorded([
        ['C', { bold: true }],
        ['D', 'bold'],
      ]),
      'C',
      'edit'
    );

    authoredTestApi(reopen).propose('C', (tx) =>
      tx.nodes.set({ bold: true }, { at: [0, 0] })
    );
    const reopened = reopen.read.value();

    assert.deepEqual(
      [decideOn(reopened, reject(['C'])), decideOn(reopened, reject(['D']))],
      [
        {
          result: { ids: ['C'], status: 'blocked', with: ['D'] },
          value: reopened,
        },
        {
          result: { ids: ['D'], status: 'blocked', with: ['C'] },
          value: reopened,
        },
      ]
    );
    assert.deepEqual(decided(reopened, reject(['C', 'D'])), {
      children: [paragraph('x')],
    });
  });

  it('restores both halves of a link an Enter split after a pending url change', () => {
    const Links = defineEditorSchema('decisions-links', {
      elements: {
        link: {
          content: schema.content.text({ default: 'text', min: 1 }),
          inline: true,
        },
      },
      id: 'decisions-links',
      properties: [
        schema.elementProperty('url', property.string(), {
          target: target.type('link'),
        }),
      ],
      root: schema.content.not(schema.content.text()),
      unknown: 'preserve',
      version: 1,
    });
    const linkEditor = (value: unknown, author: string) =>
      createEditor({
        initialValue: value as never,
        plugins: [
          Links,
          createAuthoredPlugin({
            authorId: author,
            createChangeId: () => `${author}:1`,
            intent: 'propose',
            now: () => 1,
          }),
        ],
      });
    const carol = linkEditor(
      [
        {
          children: [
            { text: '' },
            { children: [{ text: 'abc' }], type: 'link', url: 'u' },
            { text: '' },
          ],
          type: 'paragraph',
        },
      ],
      'carol'
    );

    carol.update((tx) => tx.nodes.set({ url: 'u2' } as never, { at: [0, 1] }));
    const bob = linkEditor(carol.read.value(), 'bob');

    bob.update((tx) => {
      tx.selection.set({
        anchor: { offset: 1, path: [0, 1, 0] },
        focus: { offset: 1, path: [0, 1, 0] },
      });
      tx.break.insert();
    });
    const judge = linkEditor(bob.read.value(), 'zed');

    authoredTestApi(judge).decide({ action: 'reject', changes: ['carol:1'] });

    const urls = (nodes: readonly Node[]): unknown[] =>
      nodes.flatMap((node) => [
        ...(node.type === 'link' ? [node.url] : []),
        ...urls(node.children ?? []),
      ]);

    assert.deepEqual(urls(judge.read.value().children as readonly Node[]), [
      'u',
      'u',
    ]);
  });

  it('judges a container’s children by the type a rejected change restores', () => {
    const Containers = defineEditorSchema('decisions-containers', {
      elements: {
        loose: {
          content: schema.content.types(['paragraph'], {
            default: { type: 'paragraph' },
            min: 1,
          }),
        },
        paragraph: { content: schema.content.text() },
        strict: {
          content: schema.content.types(['paragraph'], {
            default: { type: 'paragraph' },
            min: 2,
          }),
        },
      },
      id: 'decisions-containers',
      root: schema.content.types(['loose', 'paragraph', 'strict'], {
        default: { type: 'paragraph' },
        min: 1,
      }),
      unknown: 'reject',
      version: 1,
    });
    const containerEditor = (
      value: unknown,
      author: string,
      intent: 'edit' | 'propose',
      change: string
    ) =>
      createEditor({
        initialValue: value as never,
        plugins: [
          Containers,
          createAuthoredPlugin({
            authorId: author,
            createChangeId: () => change,
            createIncarnationId: () => 'd:1',
            intent,
            now: () => 1,
          }),
        ],
      });
    const alice = containerEditor(
      [{ type: 'loose', children: [paragraph('a'), paragraph('b')] }],
      'alice',
      'propose',
      'c1'
    );

    alice.update((tx) =>
      tx.nodes.set({ type: 'strict' } as never, { at: [0] })
    );
    const bob = containerEditor(alice.read.value(), 'bob', 'propose', 'c2');

    bob.update((tx) => tx.nodes.remove({ at: [0, 1] }));

    const decided = (
      decisions: Parameters<ReturnType<typeof authoredTestApi>['decide']>[0],
      value: unknown
    ) => {
      const editor = containerEditor(value, 'zed', 'edit', 'zed:1');

      authoredTestApi(editor).decide(decisions);
      return editor.read.value();
    };
    const batch = decided(
      [
        { action: 'reject', changes: ['c1'] },
        { action: 'accept', changes: ['c2'] },
      ],
      bob.read.value()
    );

    assert.deepEqual(
      batch,
      decided(
        { action: 'accept', changes: ['c2'] },
        decided({ action: 'reject', changes: ['c1'] }, bob.read.value())
      )
    );
    assert.deepEqual((batch as { children: unknown[] }).children, [
      { type: 'loose', children: [paragraph('a')] },
    ]);
  });

  it('refuses a change both accepted and rejected in one decision', () => {
    const recorded = record(
      [paragraph('a')],
      [
        {
          author: 'bob',
          change: 'bob:1',
          run: (editor) =>
            editor.update((tx) =>
              tx.text.insert('X', { at: pointBefore(editor, 'a') })
            ),
        },
      ],
      'propose',
      true
    );
    const editor = editorFor(recorded, 'carol', 'edit', 'carol:1', true);

    assert.deepEqual(
      authoredTestApi(editor).decide([
        { action: 'accept', changes: ['bob:1'] },
        { action: 'reject', changes: ['bob:1'] },
      ]),
      { ids: ['bob:1'], status: 'invalid' }
    );
    assert.deepEqual(editor.read.children(), recorded);
  });

  it('accepts typing that joined its author’s pending fill with the changes that built the fill', () => {
    const Grid = defineEditorSchema('decisions-grid', {
      elements: {
        cell: { content: schema.content.text() },
        group: { content: schema.content.type('cell', { min: 2 }) },
      },
      id: 'decisions-grid',
      root: schema.content.type('group', { min: 1 }),
      unknown: 'reject',
      version: 1,
    });
    const cell = (text: string) => ({ type: 'cell', children: [{ text }] });
    const gridEditor = (
      value: readonly Node[],
      intent: 'edit' | 'propose',
      change: string
    ) =>
      createEditor({
        plugins: [
          Grid,
          createAuthoredPlugin({
            authorId: 'ann',
            createChangeId: () => change,
            intent,
            now: () => 1,
          }),
        ],
        initialValue: value as never,
      });
    const steps: ReadonlyArray<
      readonly [string, (editor: Editor, tx: any) => void]
    > = [
      ['ann:0', (editor, tx) => tx.nodes.remove({ at: blockOf(editor, 'a') })],
      ['ann:1', (editor, tx) => tx.nodes.remove({ at: blockOf(editor, 'b') })],
      [
        'ann:2',
        (editor, tx) => {
          const [, path] = [
            ...NodeApi.texts({ children: editor.read.children() } as never),
          ].find(([node]) => (node as Node).text === '')!;
          const caret = { offset: 0, path };

          tx.selection.set({ anchor: caret, focus: caret });
          tx.text.insert('Q');
        },
      ],
    ];
    const replay = (intent: 'edit' | 'propose') =>
      steps.reduce<readonly Node[]>(
        (value, [change, run]) => {
          const editor = gridEditor(value, intent, change);

          editor.update((tx) => run(editor as never, tx));

          return expandedChildren(editor);
        },
        [{ type: 'group', children: [cell('a'), cell('b'), cell('c')] }]
      );
    const review = replay('propose');
    const editor = gridEditor(review, 'edit', 'zed:1');

    // The typing joined the fill cell ann:0 and ann:1 inserted, so ann:2
    // marks nothing.
    assert.equal(editor.read.authored.change('ann:2'), null);
    assert.equal(
      authoredTestApi(editor).decide({
        action: 'accept',
        changes: ['ann:0', 'ann:1', 'ann:2'],
      }).status,
      'applied'
    );
    assert.deepEqual(expandedChildren(editor), replay('edit'));
  });

  it('keeps a legal empty container no decision touches', () => {
    assertOneResult(
      [quote({ type: 'paragraph', children: [{ text: '' }] }), paragraph('x')],
      [
        {
          author: 'bob',
          change: 'bob:1',
          run: (editor) =>
            editor.update((tx) =>
              tx.text.insert('Y', { at: pointBefore(editor, 'x') })
            ),
        },
      ]
    );
  });
});

describe('an accepted join keeps the line it merges into', () => {
  const heading = (...children: Node[]) => ({ type: 'heading', children });
  const ann = (kind: string) => ({
    at: 1,
    author: 'ann',
    change: 'ann:1',
    kind,
  });
  const joined = (block: Node) => ({
    ...block,
    authored: [{ at: 2, author: 'alice', change: 'alice:1', kind: 'join' }],
  });
  const editIn = (
    value: readonly Node[],
    intent: 'edit' | 'propose',
    author: string,
    run: Edit['run']
  ) => record(value, [{ author, change: `${author}:1`, run }], intent, true);
  const deleteIn =
    (path: number[], from: number, to: number) => (editor: Editor) =>
      editor.update((tx) =>
        tx.text.delete({
          at: { anchor: { offset: from, path }, focus: { offset: to, path } },
        })
      );

  it('lands in a heading whose rest one change deletes after an older change struck its start, in every decision order', () => {
    const recorded = assertOneResult(
      [
        heading({ authored: [ann('delete')], text: 'a' }, { text: 'b' }),
        joined(paragraph('cd')),
      ],
      [{ author: 'carol', change: 'carol:1', run: deleteIn([0, 1], 0, 1) }],
      { editing: false, initialChanges: ['ann:1', 'alice:1'] }
    );

    assert.deepEqual(
      decide(recorded, ['ann:1', 'alice:1', 'carol:1'], true).value,
      [heading({ text: 'cd' })]
    );
  });

  it('lands in a heading Editing emptied after a pending fill there is rejected', () => {
    const deleted = editIn(
      [
        paragraph('x'),
        heading({ authored: [ann('insert')], text: 'ab' }),
        joined(paragraph('cd')),
      ],
      'edit',
      'bob',
      deleteIn([1, 0], 0, 2)
    );
    const filled = editIn(deleted, 'propose', 'carol', (editor) =>
      editor.update((tx) =>
        tx.text.insert('z', { at: { offset: 0, path: [1, 0] } })
      )
    );
    const editor = editorFor(filled, 'dana', 'edit', 'dana:1', true);
    const review = authoredTestApi(editor);

    assert.equal(
      review.decide({ action: 'reject', changes: ['carol:1'] }).status,
      'applied'
    );
    assert.equal(
      review.decide({ action: 'accept', changes: ['alice:1'] }).status,
      'applied'
    );
    assert.deepEqual(editor.read.children(), [
      paragraph('x'),
      heading({ text: 'cd' }),
    ]);
  });

  it('lands an Editing Backspace into a line of only pending text at once, as that line', () => {
    const joinedNow = editIn(
      [heading({ authored: [ann('insert')], text: 'ab' }), paragraph('cd')],
      'edit',
      'bob',
      (editor) =>
        editor.update((tx) => {
          const caret = pointBefore(editor, 'c');

          tx.selection.set({ anchor: caret, focus: caret });
          tx.command(editorCommands.delete, {
            direction: 'backward',
            unit: 'character',
          });
        })
    );

    assert.deepEqual(joinedNow, [
      heading({ authored: [ann('insert')], text: 'ab' }, { text: 'cd' }),
    ]);
  });
});

describe('authored review tree edits that touch struck content', () => {
  const by = (kind: string) => ({
    at: 1,
    author: 'alice',
    change: 'alice:0',
    kind,
  });
  const struck = (text: string) => ({ authored: [by('delete')], text });
  const marked = (node: Node, ...kinds: string[]) => ({
    ...node,
    authored: kinds.map(by),
  });
  const point = (offset: number, path: number[]) => ({ offset, path });
  const pendingIn = (value: readonly Node[]) => {
    const changes = new Set<string>();
    const visit = (node: Node) => {
      for (const mark of (node.authored as Array<{ change: string }>) ?? []) {
        changes.add(mark.change);
      }
      node.children?.forEach(visit);
    };

    value.forEach(visit);

    return [...changes];
  };
  const rejectAll = (value: readonly Node[]) => {
    const editor = editorFor(value, 'zed', 'edit', 'zed:1', true);

    authoredTestApi(editor).decide({
      action: 'reject',
      changes: pendingIn(value),
    });

    return reviewedValue(editor).children;
  };
  /**
   * Bob's edit gives `accepted` once every pending change is accepted, in
   * Editing and in Suggesting, and rejecting every change after his
   * suggestion gives what rejecting every change before it gives.
   */
  const assertLands = (
    before: readonly Node[],
    run: (editor: Editor) => void,
    accepted: readonly Node[]
  ) => {
    for (const intent of ['edit', 'propose'] as const) {
      const editor = editorFor(before, 'bob', intent, 'bob:1', true);

      run(editor);

      const after = editor.read.children() as Node[];

      assert.deepEqual(
        decide(after, pendingIn(after), true).value,
        accepted,
        intent
      );
      if (intent === 'propose') {
        assert.deepEqual(rejectAll(after), rejectAll(before));
      }
    }
  };
  const selectThen =
    (
      anchor: ReturnType<typeof point>,
      focus: ReturnType<typeof point>,
      edit: (tx: Parameters<Parameters<Editor['update']>[0]>[0]) => void
    ) =>
    (editor: Editor) =>
      editor.update((tx) => {
        tx.selection.set({ anchor, focus });
        edit(tx);
      });
  const keepThenGone = () => [
    paragraph('keep'),
    marked({ type: 'paragraph', children: [struck('gone')] }, 'delete'),
  ];

  it('types over a range from a struck block in one quote to the next quote into the kept line', () => {
    assertLands(
      [
        quote(
          { type: 'paragraph', children: [{ text: 'a' }, struck('b')] },
          marked({ type: 'paragraph', children: [struck('cd')] }, 'delete'),
          marked(
            {
              type: 'paragraph',
              children: [
                { authored: [by('delete'), by('insert')], text: 'e' },
                { authored: [by('insert')], text: 'f' },
              ],
            },
            'insert',
            'join'
          )
        ),
        quote(
          marked({ type: 'paragraph', children: [struck('ef')] }, 'delete'),
          paragraph('gh')
        ),
      ],
      selectThen(point(1, [0, 1, 0]), point(2, [1, 1, 0]), (tx) =>
        tx.text.insert('Z')
      ),
      [quote(paragraph('aZ'))]
    );
  });

  it('types over struck blocks alone at the end of the kept text before them', () => {
    assertLands(
      [
        paragraph('ab'),
        marked({ type: 'paragraph', children: [struck('cd')] }, 'delete'),
        marked({ type: 'paragraph', children: [struck('ef')] }, 'delete'),
        marked({ type: 'paragraph', children: [struck('gh')] }, 'delete'),
      ],
      selectThen(point(1, [1, 0]), point(2, [2, 0]), (tx) =>
        tx.text.insert('Z')
      ),
      [paragraph('abZ')]
    );
  });

  it('types over a range in a named root by that root’s lines, not the main root’s', () => {
    const struckMain = marked(
      { type: 'paragraph', children: [struck('abcd')] },
      'delete'
    );
    const header = [
      paragraph('keep'),
      paragraph('abcd'),
      paragraph('efgh'),
      paragraph('tail'),
    ];
    const paragraphs = schema.content.types(['paragraph'], {
      default: { type: 'paragraph' },
      min: 1,
    });
    const editor = createEditor({
      plugins: [
        defineEditorSchema('decisions-header', {
          elements: { paragraph: { content: schema.content.text() } },
          id: 'decisions-header',
          root: paragraphs,
          roots: { header: paragraphs },
          unknown: 'reject',
          version: 1,
        }),
        createAuthoredPlugin({
          authorId: 'bob',
          createChangeId: () => 'bob:1',
          intent: 'edit',
          now: () => 1,
        }),
      ],
      initialValue: {
        children: [
          paragraph(''),
          struckMain,
          paragraph('efgh'),
          paragraph('tail'),
        ],
        roots: { header },
      } as never,
    });

    editor.update((tx) =>
      tx.command(editorCommands.insertText, {
        text: 'Z',
        options: {
          at: {
            anchor: { offset: 1, path: [1, 0], root: 'header' },
            focus: { offset: 4, path: [2, 0], root: 'header' },
          },
        },
      })
    );

    assert.deepEqual(editor.read.children(), [
      paragraph(''),
      struckMain,
      paragraph('efgh'),
      paragraph('tail'),
    ]);
    assert.deepEqual(editor.read.root('header'), [
      paragraph('keep'),
      paragraph('aZ'),
      paragraph('tail'),
    ]);
  });

  it('removes a quote whose deletion is accepted, whatever is decided on a paragraph deletion inside it', () => {
    const removes = (author: string, at: number[]) => ({
      author,
      change: `${author}:1`,
      run: (editor: Editor) => editor.update((tx) => tx.nodes.remove({ at })),
    });
    const review = record(
      record(
        [quote(paragraph('ab'), paragraph('cd')), paragraph('ef')],
        [removes('ann', [0, 0])],
        'propose',
        true
      ),
      [removes('bob', [0])],
      'propose',
      true
    );
    const decideInOrder = (
      decisions: ReadonlyArray<['accept' | 'reject', string]>
    ) => {
      const editor = editorFor(review, 'zed', 'edit', 'zed:1', true);

      for (const [action, change] of decisions) {
        authoredTestApi(editor).decide({ action, changes: [change] });
      }

      return editor.read.children();
    };

    assert.deepEqual(
      decideInOrder([
        ['reject', 'ann:1'],
        ['accept', 'bob:1'],
      ]),
      [paragraph('ef')]
    );
    assert.deepEqual(
      decideInOrder([
        ['accept', 'bob:1'],
        ['reject', 'ann:1'],
      ]),
      [paragraph('ef')]
    );
    assert.deepEqual(
      decideInOrder([
        ['accept', 'ann:1'],
        ['reject', 'bob:1'],
      ]),
      [quote(paragraph('cd')), paragraph('ef')]
    );
  });

  it('types past a horizontal rule into the line after a struck line', () => {
    const hr = { type: 'hr', children: [{ text: '' }] };

    assertLands(
      [
        paragraph('keep'),
        hr,
        marked({ type: 'paragraph', children: [struck('gone')] }, 'delete'),
        paragraph('tail'),
      ],
      selectThen(point(2, [2, 0]), point(2, [2, 0]), (tx) =>
        tx.text.insert('X')
      ),
      [paragraph('keep'), hr, paragraph('Xtail')]
    );
  });

  it('types past a horizontal rule that ends a quote into the line after a struck line', () => {
    const hr = { type: 'hr', children: [{ text: '' }] };

    assertLands(
      [
        quote(paragraph('keep'), hr),
        marked({ type: 'paragraph', children: [struck('gone')] }, 'delete'),
        paragraph('tail'),
      ],
      selectThen(point(2, [1, 0]), point(2, [1, 0]), (tx) =>
        tx.text.insert('X')
      ),
      [quote(paragraph('keep'), hr), paragraph('Xtail')]
    );
  });

  it('pastes at the path of a struck line where it pastes at its start point', () => {
    assertLands(
      [
        paragraph('keep'),
        marked({ type: 'paragraph', children: [struck('gone')] }, 'delete'),
      ],
      (editor) =>
        editor.update((tx) =>
          tx.slice.replace(ContentSlice.closed([{ text: 'X' }]), { at: [1] })
        ),
      [paragraph('keepX')]
    );
  });

  it('joins on Backspace into a struck line that live text keeps', () => {
    assertLands(
      [
        paragraph('x'),
        marked({ type: 'paragraph', children: [{ text: 'N' }] }, 'delete'),
        paragraph('yz'),
      ],
      selectThen(point(0, [2, 0]), point(0, [2, 0]), (tx) =>
        tx.text.deleteBackward()
      ),
      [paragraph('x'), paragraph('Nyz')]
    );
  });

  it('types, breaks and pastes inside a struck block at the end of the kept text before it', () => {
    const caret = point(2, [1, 0]);

    assertLands(
      keepThenGone(),
      selectThen(caret, caret, (tx) => tx.text.insert('X')),
      [paragraph('keepX')]
    );
    assertLands(
      keepThenGone(),
      selectThen(caret, caret, (tx) => tx.break.insert()),
      [paragraph('keep'), paragraph('')]
    );
    assertLands(
      keepThenGone(),
      selectThen(caret, caret, (tx) =>
        tx.slice.replace(ContentSlice.closed([{ text: 'P' }]))
      ),
      [paragraph('keepP')]
    );
  });
});

describe('authored review tree decisions on an element several insertions built', () => {
  const Mixed = defineEditorSchema('decisions-mixed', {
    elements: {
      el: {
        content: schema.content.any(
          [schema.content.text(), schema.content.type('xb')],
          { default: { type: 'xb' }, min: 2 }
        ),
      },
      xb: { content: schema.content.text() },
    },
    id: 'decisions-mixed',
    root: schema.content.type('el', { min: 1 }),
    unknown: 'reject',
    version: 1,
  });
  const claim = (change: string, kind: 'delete' | 'insert') => ({
    at: 1,
    author: change.split(':')[0],
    change,
    kind,
  });
  const decidedInTurn = (
    value: readonly Node[],
    turns: ReadonlyArray<
      Parameters<ReturnType<typeof authoredTestApi>['decide']>[0]
    >
  ) => {
    const editor = createEditor({
      initialValue: value as never,
      plugins: [Mixed, createAuthoredPlugin({ authorId: 'zed' })],
    });

    for (const turn of turns) {
      assert.equal(authoredTestApi(editor).decide(turn).status, 'applied');
    }

    return reviewedValue(editor).children;
  };

  it('keeps an element holding accepted text resting on the insertions still pending', () => {
    const built = ['bob:0', 'bob:1', 'bob:2'].map((change) =>
      claim(change, 'insert')
    );

    assert.deepEqual(
      decidedInTurn(
        [
          {
            type: 'el',
            children: [
              {
                type: 'xb',
                authored: [claim('bob:2', 'delete')],
                children: [{ authored: [claim('bob:2', 'delete')], text: 'a' }],
              },
              { authored: [claim('bob:0', 'delete')], text: 'h' },
              { authored: [claim('bob:1', 'delete')], text: 'ello' },
              {
                type: 'xb',
                authored: built,
                children: [{ authored: [claim('ann:3', 'insert')], text: 'S' }],
              },
              {
                type: 'xb',
                authored: built,
                children: [{ authored: built, text: '' }],
              },
            ],
          },
        ],
        [
          [
            { action: 'reject', changes: ['bob:0'] },
            { action: 'accept', changes: ['ann:3'] },
          ],
          [{ action: 'reject', changes: ['bob:1'] }],
          [{ action: 'reject', changes: ['bob:2'] }],
        ]
      ),
      [
        {
          type: 'el',
          children: [
            { type: 'xb', children: [{ text: 'a' }] },
            { text: 'hello' },
            { type: 'xb', children: [{ text: 'S' }] },
          ],
        },
      ]
    );
  });

  it('accepts one of the insertions an element was built inside', () => {
    const built = ['ann:1', 'bob:2', 'bob:0'].map((change) =>
      claim(change, 'insert')
    );

    assert.deepEqual(
      decidedInTurn(
        [
          {
            type: 'el',
            children: [
              {
                type: 'xb',
                children: [{ authored: [claim('bob:2', 'delete')], text: 'a' }],
              },
              { authored: [claim('bob:0', 'delete')], text: 'h' },
              { authored: [claim('ann:1', 'delete')], text: 'e' },
              { authored: [claim('bob:2', 'delete')], text: 'llo' },
              {
                type: 'xb',
                authored: built,
                children: [{ authored: built, text: '' }],
              },
            ],
          },
        ],
        [
          [{ action: 'accept', changes: ['ann:1'] }],
          [{ action: 'reject', changes: ['bob:0'] }],
          [{ action: 'reject', changes: ['bob:2'] }],
        ]
      ),
      [
        {
          type: 'el',
          children: [
            { type: 'xb', children: [{ text: 'a' }] },
            { text: 'hllo' },
          ],
        },
      ]
    );
  });
});

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  defineEditorSchema,
  NodeApi,
  property,
  schema,
  target,
} from 'plitejs';

import { authoredTreeProof } from '../src/authored/tree/proof-plugin';

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
    paragraph: { content: schema.content.text() },
    quote: {
      content: schema.content.types(['paragraph', 'quote'], {
        default: { type: 'paragraph' },
        min: 1,
      }),
    },
  },
  id: 'decisions-quotes',
  root: schema.content.types(['heading', 'paragraph', 'quote'], {
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
      authoredTreeProof({
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
  const result = editor.api.authoredTree.decide({ action: 'accept', changes });

  return { result, value: editor.read.children() as Node[] };
};

/**
 * Accepting the changes together, or one at a time in every order where a
 * blocked step decides with what it waits on, gives one document, and unless
 * `editing` is false, that document is the history replayed in Editing.
 */
const assertOneResult = (
  initial: readonly Node[],
  history: readonly Edit[],
  { editing = true, withSchema = true } = {}
) => {
  const recorded = record(initial, history, 'propose', withSchema);
  const changes = history.map((edit) => edit.change);
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
    const typed = record(
      [quote(paragraph('ab')), paragraph('z')],
      [
        {
          author: 'alice',
          change: 'alice:1',
          run: (editor) => editor.update((tx) => tx.nodes.remove({ at: [0] })),
        },
      ],
      'propose',
      true
    );
    const inside = record(
      typed,
      [
        {
          author: 'bob',
          change: 'bob:1',
          run: (editor) =>
            editor.update((tx) =>
              tx.text.insert('X', { at: pointBefore(editor, 'b') })
            ),
        },
      ],
      'edit',
      true
    );

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

  it('accepts a heading’s deleted text and a Backspace from the next paragraph to that paragraph alone', () => {
    const recorded = assertOneResult(
      [{ type: 'heading', children: [{ text: 'H' }] }, paragraph('x')],
      [
        {
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
        },
        { author: 'bob', change: 'bob:2', run: backspaceAt('x') },
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

    rejecter.api.authoredTree.decide({
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
          authoredTreeProof({
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
      decisions: Parameters<
        ReturnType<typeof formatEditor>['api']['authoredTree']['decide']
      >[0]
    ) => {
      const editor = formatEditor(current, 'zed', 'edit');
      const result = editor.api.authoredTree.decide(decisions);

      return { result, value: editor.read.value() };
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

    reopen.api.authoredTree.propose('C', () =>
      reopen.update((tx) =>
        tx.nodes.set({ bold: true } as never, { at: [0, 0] })
      )
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
          authoredTreeProof({
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

    judge.api.authoredTree.decide({ action: 'reject', changes: ['carol:1'] });

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
          authoredTreeProof({
            authorId: author,
            createChangeId: () => change,
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
      decisions: Parameters<
        ReturnType<typeof containerEditor>['api']['authoredTree']['decide']
      >[0],
      value: unknown
    ) => {
      const editor = containerEditor(value, 'zed', 'edit', 'zed:1');

      editor.api.authoredTree.decide(decisions);
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
      editor.api.authoredTree.decide([
        { action: 'accept', changes: ['bob:1'] },
        { action: 'reject', changes: ['bob:1'] },
      ]),
      { ids: ['bob:1'], status: 'invalid' }
    );
    assert.deepEqual(editor.read.children(), recorded);
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

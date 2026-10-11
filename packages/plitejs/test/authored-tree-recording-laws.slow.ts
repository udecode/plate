import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import fc from 'fast-check';
import {
  ContentSlice,
  createEditor,
  defineEditorSchema,
  definePlugin,
  EditorSchemaValidationError,
  NodeApi,
  schema,
  transfer,
} from 'plitejs';

import {
  authoredMarksSchema,
  readAuthoredMarks,
} from '../src/authored/tree/marks';
import { authoredTreeProof } from '../src/authored/tree/proof-plugin';
import { AuthoredUnrepresentableError } from '../src/authored/tree/record';

type Node = Record<string, unknown> & { children?: Node[]; text?: string };
type Editor = ReturnType<typeof editorFor>;
type Command =
  | Readonly<{ at: string; kind: 'break' | 'paste' | 'type'; side: number }>
  | Readonly<{ at: string; direction: 'backward' | 'forward'; kind: 'delete' }>
  | Readonly<{ from: string; kind: 'deleteRange' | 'typeOver'; to: string }>
  | Readonly<{ at: string; kind: 'removeLink' | 'unwrap' | 'wrap' }>
  | Readonly<{
      at: string;
      edge: 'after' | 'before';
      kind: 'moveNode' | 'transferNode';
      to: string;
    }>
  | Readonly<{ at: string; kind: 'transferText'; to: string }>
  | Readonly<{ kind: 'replaceChildren'; shift: number }>;
type Edit = Readonly<{
  author: 'alice' | 'bob';
  command: Command;
  intent: 'edit' | 'propose';
}>;

const Quotes = defineEditorSchema('recording-laws', {
  elements: {
    link: { content: schema.content.text({ min: 1 }), inline: true },
    paragraph: schema.element.textBlock(),
    quote: { content: schema.content.type('paragraph', { min: 1 }) },
  },
  id: 'recording-laws',
  root: schema.content.any(
    [schema.content.type('paragraph'), schema.content.type('quote')],
    { default: { type: 'paragraph' }, min: 1 }
  ),
  unknown: 'reject',
  version: 1,
});
const LETTERS = 'abcdefghijkl';

const editorFor = (
  initialValue: readonly Node[],
  author: string,
  intent: 'edit' | 'propose' | 'plain',
  changeId: string,
  withSchema = true
) =>
  createEditor({
    plugins: [
      ...(withSchema ? [Quotes] : []),
      transfer(),
      // Plain editing reads review marks as ordinary properties, so a
      // document holding suggestions loads, and nothing records.
      ...(intent === 'plain'
        ? [
            definePlugin('recording-laws-marks', {
              schema: authoredMarksSchema,
            }),
          ]
        : [
            authoredTreeProof({
              authorId: author,
              createChangeId: () => changeId,
              intent,
              now: () => 1,
            }),
          ]),
    ],
    initialValue: initialValue as never,
  });

const texts = (children: readonly Node[]) =>
  [...NodeApi.texts({ children } as never)] as Array<[Node, number[]]>;
const locate = (editor: Editor, letter: string) => {
  for (const [node, path] of texts(editor.read.children() as Node[])) {
    const offset = (node.text ?? '').indexOf(letter);

    if (offset !== -1) return { offset, path };
  }

  return null;
};

/** Run one command on the editor; `false` when it does not apply here. */
const run = (editor: Editor, command: Command, typed: string): boolean => {
  const at = 'at' in command ? locate(editor, command.at) : null;

  switch (command.kind) {
    case 'type':
    case 'break':
    case 'paste': {
      if (!at) return false;
      const caret = { offset: at.offset + command.side, path: at.path };

      editor.update((tx) => {
        tx.selection.set({ anchor: caret, focus: caret });
        if (command.kind === 'type') tx.text.insert(typed);
        else if (command.kind === 'break') tx.break.insert();
        else {
          tx.slice.replace(
            ContentSlice.fromJSON({
              content: [
                { type: 'paragraph', children: [{ text: typed }] },
                {
                  type: 'paragraph',
                  children: [{ text: typed.toLowerCase() }],
                },
              ],
              openEnd: 1,
              openStart: 1,
            }),
            { at: caret }
          );
        }
      });
      return true;
    }
    case 'delete': {
      if (!at) return false;
      const caret = { offset: at.offset, path: at.path };

      editor.update((tx) => {
        tx.selection.set({ anchor: caret, focus: caret });
        if (command.direction === 'backward') tx.text.deleteBackward();
        else tx.text.deleteForward();
      });
      return true;
    }
    case 'deleteRange':
    case 'typeOver': {
      const from = locate(editor, command.from);
      const to = locate(editor, command.to);

      if (!from || !to) return false;
      const selection = {
        anchor: from,
        focus: { offset: to.offset + 1, path: to.path },
      };

      editor.update((tx) => {
        if (command.kind === 'deleteRange') {
          tx.text.delete({ at: selection });
        } else {
          tx.selection.set(selection);
          tx.text.insert(typed);
        }
      });
      return true;
    }
    case 'removeLink': {
      const link = at?.path.slice(0, -1);

      if (
        !link ||
        (editor.read.nodes.get(link)?.[0] as Node | undefined)?.type !== 'link'
      ) {
        return false;
      }
      editor.update((tx) => tx.nodes.remove({ at: link }));
      return true;
    }
    case 'wrap':
    case 'unwrap': {
      if (!at) return false;
      const block = at.path.slice(0, command.kind === 'wrap' ? -1 : 1);

      // Plain editing drops a paragraph's text when it unwraps the paragraph
      // at the root, so only quotes are unwrapped.
      if (
        command.kind === 'unwrap' &&
        (editor.read.children() as Node[])[block[0]]?.type !== 'quote'
      ) {
        return false;
      }

      editor.update((tx) => {
        if (command.kind === 'wrap') {
          tx.nodes.wrap({ type: 'quote', children: [] } as never, {
            at: block,
          });
        } else {
          tx.nodes.unwrap({ at: block });
        }
      });
      return true;
    }
    case 'moveNode':
    case 'transferNode': {
      const target = locate(editor, command.to);

      if (!at || !target) return false;
      const source = at.path.slice(0, -1);
      const landing = target.path.slice(0, -1);

      if (
        source.length === landing.length &&
        source.every((index, depth) => index === landing[depth])
      ) {
        return false;
      }
      if (command.kind === 'moveNode') {
        const to = [...landing];

        to[to.length - 1] += command.edge === 'after' ? 1 : 0;
        editor.update((tx) => tx.nodes.move({ at: source, to }));
      } else {
        editor.api.transfer.move({
          nodes: [editor.key(source)!],
          to: { edge: command.edge, key: editor.key(landing)! },
        });
      }
      return true;
    }
    case 'transferText': {
      const target = locate(editor, command.to);

      if (!at || !target) return false;
      editor.api.transfer.move({
        range: {
          anchor: at,
          focus: { offset: at.offset + 1, path: at.path },
        },
        to: { point: target },
      });
      return true;
    }
    case 'replaceChildren': {
      const children = editor.read.children() as Node[];
      const shift = command.shift % children.length;

      if (shift === 0) return false;
      editor.update((tx) =>
        tx.nodes.replaceChildren(
          [...children.slice(shift), ...children.slice(0, shift)] as never,
          { at: [], count: children.length }
        )
      );
      return true;
    }
    default: {
      const unknown: never = command;

      throw new Error(`Unknown command ${JSON.stringify(unknown)}`);
    }
  }
};

const isRefusal = (error: unknown) =>
  error instanceof EditorSchemaValidationError ||
  error instanceof AuthoredUnrepresentableError;

/**
 * Apply `edit`, or return null when its command does not apply, the schema
 * refuses it, or it fails in plain editing with no review plugin.
 */
const apply = (
  value: readonly Node[],
  edit: Edit,
  changeId: string,
  typed: string
) => {
  try {
    if (
      !run(
        editorFor(value, edit.author, 'plain', changeId),
        edit.command,
        typed
      )
    ) {
      return null;
    }
  } catch {
    return null;
  }

  const editor = editorFor(value, edit.author, edit.intent, changeId);

  try {
    run(editor, edit.command, typed);
  } catch (error) {
    if (isRefusal(error)) return null;
    throw error;
  }

  return editor.read.children() as Node[];
};

const letterArbitrary = (pool: string) => fc.constantFrom(...pool.split(''));
const commandArbitrary = (pool: string): fc.Arbitrary<Command> =>
  fc.oneof(
    fc.record({
      at: letterArbitrary(pool),
      kind: fc.constantFrom(
        'type' as const,
        'break' as const,
        'paste' as const
      ),
      side: fc.constantFrom(0, 1),
    }),
    fc.record({
      at: letterArbitrary(pool),
      direction: fc.constantFrom('backward' as const, 'forward' as const),
      kind: fc.constant('delete' as const),
    }),
    fc.record({
      from: letterArbitrary(pool),
      kind: fc.constantFrom('deleteRange' as const, 'typeOver' as const),
      to: letterArbitrary(pool),
    }),
    fc.record({
      at: letterArbitrary(pool),
      kind: fc.constantFrom('unwrap' as const, 'wrap' as const),
    }),
    fc.record({
      at: letterArbitrary(pool),
      edge: fc.constantFrom('after' as const, 'before' as const),
      kind: fc.constantFrom('moveNode' as const, 'transferNode' as const),
      to: letterArbitrary(pool),
    }),
    fc.record({
      at: letterArbitrary(pool),
      kind: fc.constant('transferText' as const),
      to: letterArbitrary(pool),
    }),
    fc.record({
      kind: fc.constant('replaceChildren' as const),
      shift: fc.integer({ max: 3, min: 1 }),
    })
  );

// Two to four blocks of two letters each, some in a quote. Links appear only
// in the cut law below.
const documentArbitrary = fc
  .array(fc.integer({ max: 2, min: 0 }), { maxLength: 4, minLength: 2 })
  .map((shape) => {
    let next = 0;
    const take = () => {
      const text = LETTERS.slice(next, next + 2);

      next += 2;
      return { type: 'paragraph', children: [{ text }] } as Node;
    };

    return shape.map((kind) =>
      kind === 0
        ? take()
        : {
            type: 'quote',
            children: Array.from({ length: kind }, take),
          }
    );
  });
const historyArbitrary = fc.array(
  fc.record({
    author: fc.constantFrom('alice' as const, 'bob' as const),
    command: commandArbitrary(LETTERS.slice(0, 8)),
    intent: fc.constantFrom('edit' as const, 'propose' as const),
  }),
  { maxLength: 3, minLength: 0 }
);

const projection = (value: readonly Node[], read: 'accepted' | 'proposed') =>
  editorFor(value, 'carol', 'edit', 'carol:1').api.authoredTree.project(read)
    .value.children as Node[];
const letterCounts = (value: readonly Node[]) => {
  const counts = new Map<string, number>();

  for (const [node] of texts(value)) {
    for (const letter of node.text ?? '') {
      counts.set(letter, (counts.get(letter) ?? 0) + 1);
    }
  }

  return counts;
};
const withoutEmptyBlocks = (nodes: readonly Node[]): Node[] =>
  nodes.flatMap((node) => {
    if (typeof node.text === 'string') return [node];

    const children = withoutEmptyBlocks(node.children ?? []);

    return children.some((child) => child.text !== '')
      ? [{ ...node, children }]
      : [];
  });
const jsonEqual = (left: unknown, right: unknown) =>
  JSON.stringify(left) === JSON.stringify(right);
// A text block holds texts and inline links.
const isInlineContent = (node: Node) =>
  typeof node.text === 'string' || node.type === 'link';
const hasStruckTextBlock = (nodes: readonly Node[]): boolean =>
  nodes.some(
    (node) =>
      typeof node.text !== 'string' &&
      ((node.children ?? []).every(isInlineContent)
        ? readAuthoredMarks(node).some((mark) => mark.kind === 'delete')
        : hasStruckTextBlock(node.children ?? []))
  );
const withMergedTexts = (nodes: readonly Node[]) => {
  const out: Node[] = [];

  for (const node of nodes) {
    const previous = out.at(-1);
    const { text: _text, ...props } = node;
    const { text: _previousText, ...previousProps } = previous ?? {};

    if (
      typeof node.text === 'string' &&
      typeof previous?.text === 'string' &&
      jsonEqual(props, previousProps)
    ) {
      out[out.length - 1] = { ...previous, text: previous.text + node.text };
    } else {
      out.push(node);
    }
  }

  return out;
};
/**
 * The first letter of each text block that follows a struck text block in
 * `before`: the only blocks whose boundary the named join limit moves.
 */
const afterStruckTextBlocks = (before: readonly Node[]) => {
  const blocks: Node[] = [];
  const collect = (nodes: readonly Node[]) => {
    for (const node of nodes) {
      if (typeof node.text === 'string') continue;
      if ((node.children ?? []).every(isInlineContent)) blocks.push(node);
      else collect(node.children ?? []);
    }
  };

  collect(before);

  return new Set(
    blocks.flatMap((block, index) =>
      index > 0 &&
      readAuthoredMarks(blocks[index - 1]).some(
        (mark) => mark.kind === 'delete'
      )
        ? [
            [...texts([block])].map(([leaf]) => leaf.text ?? '').join('')[0] ??
              '',
          ]
        : []
    )
  );
};
const withJoinedTextBlocks = (
  nodes: readonly Node[],
  joins: ReadonlySet<string>
): Node[] => {
  const out: Node[] = [];

  for (const node of nodes) {
    if (typeof node.text === 'string') {
      out.push(node);
      continue;
    }

    const previous = out.at(-1);
    const textBlock = (node.children ?? []).every(isInlineContent);
    const first = [...texts([node])]
      .map(([leaf]) => leaf.text ?? '')
      .join('')[0];

    if (
      textBlock &&
      first !== undefined &&
      joins.has(first) &&
      previous?.type === node.type &&
      (previous.children ?? []).every(isInlineContent)
    ) {
      out[out.length - 1] = {
        ...previous,
        children: withMergedTexts([
          ...(previous.children ?? []),
          ...(node.children ?? []),
        ]),
      };
      continue;
    }
    out.push(
      textBlock
        ? node
        : {
            ...node,
            children: withJoinedTextBlocks(node.children ?? [], joins),
          }
    );
  }

  return out;
};
const changesIn = (value: readonly Node[]) => {
  const changes = new Set<string>();
  const visit = (nodes: readonly Node[]) => {
    for (const node of nodes) {
      for (const mark of readAuthoredMarks(node)) changes.add(mark.change);
      visit(node.children ?? []);
    }
  };

  visit(value);
  return [...changes];
};

const replay = (initial: readonly Node[], history: readonly Edit[]) => {
  let value = initial;

  history.forEach((edit, index) => {
    value =
      apply(
        value,
        edit,
        `${edit.author}:${index}`,
        String.fromCharCode(77 + index)
      ) ?? value;
  });

  return value;
};

const TYPED = 'Z';

const deleteAcrossOwnPasteBetweenQuotes = [
  [
    {
      type: 'quote',
      children: [
        { type: 'paragraph', children: [{ text: 'ab' }] },
        { type: 'paragraph', children: [{ text: 'cd' }] },
      ],
    },
    {
      type: 'quote',
      children: [
        { type: 'paragraph', children: [{ text: 'ef' }] },
        { type: 'paragraph', children: [{ text: 'gh' }] },
      ],
    },
  ],
  [
    {
      author: 'bob',
      command: { at: 'g', kind: 'paste', side: 0 },
      intent: 'propose',
    },
  ],
  { from: 'b', kind: 'deleteRange', to: 'g' },
] as never;
const deleteBackwardOverOwnPaste = [
  [
    { type: 'paragraph', children: [{ text: 'ab' }] },
    { type: 'paragraph', children: [{ text: 'cd' }] },
  ],
  [
    {
      author: 'bob',
      command: { at: 'c', kind: 'paste', side: 0 },
      intent: 'propose',
    },
  ],
  { from: 'd', kind: 'deleteRange', to: 'a' },
] as never;

/**
 * Runs one generated command as Bob in both intents on a document a generated
 * history of Alice's and Bob's edits produced, and checks `law` on the
 * results when the command applies in both.
 */
const recordedCommands = (
  law: (
    recorded: Readonly<{
      before: readonly Node[];
      edited: readonly Node[];
      suggested: readonly Node[];
    }>
  ) => void,
  numRuns: number
) => {
  let compared = 0;

  fc.assert(
    fc.property(
      documentArbitrary,
      historyArbitrary,
      commandArbitrary(LETTERS.slice(0, 8)),
      (initial, history, command) => {
        const before = replay(initial, history);
        const suggested = apply(
          before,
          { author: 'bob', command, intent: 'propose' },
          'bob:last',
          TYPED
        );
        const edited = apply(
          before,
          { author: 'bob', command, intent: 'edit' },
          'bob:last',
          TYPED
        );

        if (!suggested || !edited) return;
        compared += 1;
        law({ before, edited, suggested });
      }
    ),
    {
      examples: [
        // A suggested move into a quote keeps the struck source before the
        // landing, so the landing's anchors map by position.
        [
          [
            { type: 'paragraph', children: [{ text: 'ab' }] },
            {
              type: 'quote',
              children: [{ type: 'paragraph', children: [{ text: 'cd' }] }],
            },
          ],
          [],
          { at: 'a', edge: 'after', kind: 'transferNode', to: 'c' },
        ] as never,
        // Deleting one's own pending paragraph keeps the letter another
        // author typed into it, struck, until someone decides it.
        [
          [
            { type: 'paragraph', children: [{ text: 'ab' }] },
            {
              type: 'paragraph',
              authored: [
                { at: 1, author: 'bob', change: 'bob:0', kind: 'insert' },
              ],
              children: [
                {
                  authored: [
                    { at: 1, author: 'bob', change: 'bob:0', kind: 'insert' },
                  ],
                  text: 'cd',
                },
                {
                  authored: [
                    {
                      at: 1,
                      author: 'alice',
                      change: 'alice:0',
                      kind: 'insert',
                    },
                  ],
                  text: 'X',
                },
              ],
            },
            { type: 'paragraph', children: [{ text: 'ef' }] },
          ],
          [],
          { from: 'b', kind: 'deleteRange', to: 'e' },
        ] as never,
        // A paste that splits another author's pending paragraph makes the
        // new half that author's insertion too, so rejecting everything
        // leaves nothing behind.
        [
          [
            { type: 'paragraph', children: [{ text: 'ab' }] },
            { type: 'paragraph', children: [{ text: 'cd' }] },
            { type: 'paragraph', children: [{ text: 'ef' }] },
          ],
          [
            {
              author: 'alice',
              command: { at: 'e', edge: 'before', kind: 'moveNode', to: 'a' },
              intent: 'propose',
            },
          ],
          { at: 'f', kind: 'paste', side: 0 },
        ] as never,
        deleteAcrossOwnPasteBetweenQuotes,
        deleteBackwardOverOwnPaste,
      ],
      numRuns,
    }
  );

  return compared;
};

describe('authored review tree recording laws', () => {
  it('gives typed text no deletion and every letter one owner, and rejecting everything undoes a suggestion', () => {
    const compared = recordedCommands(({ before, edited, suggested }) => {
      const childless = (nodes: readonly Node[]): boolean =>
        nodes.some(
          (node) =>
            typeof node.text !== 'string' &&
            ((node.children ?? []).length === 0 ||
              childless(node.children ?? []))
        );

      assert.ok(
        !childless(suggested),
        `an element holds no child: ${JSON.stringify(suggested)}`
      );
      for (const value of [suggested, edited]) {
        for (const [node] of texts(value)) {
          if (!node.text?.includes(TYPED)) continue;
          assert.ok(
            !readAuthoredMarks(node).some((mark) => mark.kind === 'delete'),
            `typed text carries a deletion: ${JSON.stringify(value)}`
          );
        }
      }
      for (const read of ['accepted', 'proposed'] as const) {
        for (const [letter, count] of letterCounts(
          projection(suggested, read)
        )) {
          assert.ok(count <= 1, `${letter} doubled in ${read}`);
        }
      }
      const kept = letterCounts(suggested);

      for (const [node] of texts(before)) {
        if (
          !readAuthoredMarks(node).some(
            (mark) => mark.kind === 'insert' && mark.author !== 'bob'
          )
        ) {
          continue;
        }
        for (const letter of node.text ?? '') {
          assert.ok(
            kept.has(letter),
            `${letter} of another author lost: ${JSON.stringify(suggested)}`
          );
        }
      }
      assert.deepEqual(
        projection(suggested, 'accepted'),
        projection(before, 'accepted')
      );
    }, 250);

    assert.ok(compared > 150, `only ${compared} commands compared`);
  });

  it('accepting everything gives what Editing gives, and accepting or rejecting everything applies', () => {
    const compared = recordedCommands(({ before, edited, suggested }) => {
      const proposed = projection(suggested, 'proposed');
      const editing = projection(edited, 'proposed');

      // Two named limits, each pinned by a decisions test: Editing keeps the
      // empty block the core fills an emptied container with, and a join
      // whose block Editing merges into struck text lands in the nearest kept
      // text block of the same parent when suggested.
      const emptied = [
        withoutEmptyBlocks(proposed),
        withoutEmptyBlocks(editing),
      ];

      if (!jsonEqual(emptied[0], emptied[1])) {
        assert.ok(
          hasStruckTextBlock(before),
          'only a join into struck text moves a boundary'
        );
        assert.deepEqual(
          withJoinedTextBlocks(emptied[0], afterStruckTextBlocks(before)),
          withJoinedTextBlocks(emptied[1], afterStruckTextBlocks(before))
        );
      }
      for (const action of ['accept', 'reject'] as const) {
        const editor = editorFor(suggested, 'carol', 'edit', 'carol:1');
        const result = editor.api.authoredTree.decide({
          action,
          changes: changesIn(suggested),
        });

        assert.equal(
          result.status,
          changesIn(suggested).length > 0 ? 'applied' : 'unchanged',
          `${action} everything did not apply: ${JSON.stringify(suggested)}`
        );
      }
    }, 250);

    assert.ok(compared > 150, `only ${compared} commands compared`);
  });

  it('decides recorded changes to one document in every order, with and without content declarations', () => {
    let compared = 0;

    fc.assert(
      fc.property(
        documentArbitrary,
        fc.array(
          fc.record({
            author: fc.constantFrom('alice' as const, 'bob' as const),
            command: commandArbitrary(LETTERS.slice(0, 8)),
            intent: fc.constantFrom('edit' as const, 'propose' as const),
          }),
          { maxLength: 4, minLength: 1 }
        ),
        fc.array(
          fc.constantFrom(
            'accept' as const,
            'keep' as const,
            'reject' as const
          ),
          {
            maxLength: 4,
            minLength: 4,
          }
        ),
        fc.integer({ max: 23, min: 0 }),
        (initial, history, actions, rotation) => {
          const recorded = replay(initial, history);
          const changes = changesIn(recorded);
          const decisions = new Map(
            changes.flatMap((change, index) =>
              actions[index % actions.length] === 'keep'
                ? []
                : [
                    [
                      change,
                      actions[index % actions.length] as 'accept' | 'reject',
                    ],
                  ]
            )
          );

          if (decisions.size === 0) return;
          for (const withSchema of [true, false]) {
            // Without content declarations, an empty block needs a text.
            try {
              editorFor(recorded, 'carol', 'edit', 'carol:1', withSchema);
            } catch (error) {
              if (error instanceof EditorSchemaValidationError) continue;
              throw error;
            }

            const decide = (
              value: readonly Node[],
              batch: readonly string[]
            ) => {
              const editor = editorFor(
                value,
                'carol',
                'edit',
                'carol:1',
                withSchema
              );
              const result = editor.api.authoredTree.decide(
                (['accept', 'reject'] as const).map((action) => ({
                  action,
                  changes: batch.filter(
                    (change) => decisions.get(change) === action
                  ),
                }))
              );

              return { result, value: editor.read.children() as Node[] };
            };
            const together = decide(recorded, [...decisions.keys()]);

            if (together.result.status !== 'applied') continue;
            const order = [...decisions.keys()];

            order.push(...order.splice(0, rotation % order.length));
            let value: readonly Node[] = recorded;
            let admissible = true;

            while (order.length > 0 && admissible) {
              const batch = new Set([order.shift()!]);
              let step = decide(value, [...batch]);

              while (step.result.status === 'blocked') {
                // A change the decision set leaves undecided cannot join it.
                if (step.result.with.some((change) => !decisions.has(change))) {
                  admissible = false;
                  break;
                }
                for (const change of step.result.with) batch.add(change);
                step = decide(value, [...batch]);
              }
              for (const change of batch) {
                if (order.includes(change)) {
                  order.splice(order.indexOf(change), 1);
                }
              }
              ({ value } = step);
            }
            if (!admissible) continue;
            compared += 1;
            assert.deepEqual(value, together.value);
          }
          for (const action of ['accept', 'reject'] as const) {
            const { status } = editorFor(
              recorded,
              'carol',
              'edit',
              'carol:1'
            ).api.authoredTree.decide({ action, changes });

            assert.ok(
              status === 'applied' || status === 'unchanged',
              `${action} everything returned ${status}: ${JSON.stringify(recorded)}`
            );
          }
        }
      ),
      { numRuns: 300 }
    );
    assert.ok(compared > 150, `only ${compared} decision orders compared`);
  });
});

describe('authored review tree recording laws for cuts', () => {
  it('rejects every Enter inside a link to one link holding what a removal keeps, in every order and either intent', () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(fc.integer({ max: 5, min: 1 }), {
          maxLength: 3,
          minLength: 2,
        }),
        fc.nat({ max: 3 }),
        fc.constantFrom('edit' as const, 'propose' as const),
        fc.infiniteStream(fc.nat({ max: 1000 })),
        (offsets, removedPiece, intent, shuffle) => {
          const word = 'abcdef';
          let value: readonly Node[] = [
            {
              type: 'paragraph',
              children: [
                { text: '' },
                { type: 'link', children: [{ text: word }] },
                { text: '' },
              ],
            },
          ];
          const enters = offsets.map((_, index) => `s${index}`);

          offsets.forEach((offset, index) => {
            const editor = editorFor(value, 'bob', 'propose', enters[index]);

            if (
              !run(editor, { at: word[offset], kind: 'break', side: 0 }, '')
            ) {
              throw new Error(`no letter ${word[offset]}`);
            }
            value = editor.read.children() as Node[];
          });

          const bounds = [
            0,
            ...[...offsets].sort((a, b) => a - b),
            word.length,
          ];
          const piece = removedPiece % (bounds.length - 1);
          const removed = word.slice(bounds[piece], bounds[piece + 1]);
          const remover = editorFor(value, 'eve', intent, 'eve:1');

          run(remover, { at: removed[0], kind: 'removeLink' }, '');
          value = remover.read.children() as Node[];

          const actions = new Map([
            ...enters.map((change) => [change, 'reject'] as const),
            ...(intent === 'propose' ? [['eve:1', 'accept'] as const] : []),
          ]);
          const decide = (
            current: readonly Node[],
            changes: readonly string[]
          ) => {
            const editor = editorFor(current, 'carol', 'edit', 'carol:1');
            const result = editor.api.authoredTree.decide(
              (['accept', 'reject'] as const).flatMap((action) => {
                const picked = changes.filter(
                  (change) => actions.get(change) === action
                );

                return picked.length > 0 ? [{ action, changes: picked }] : [];
              })
            );

            return { result, value: editor.read.children() as Node[] };
          };
          const order = [...actions.keys()].sort(
            () => shuffle.next().value - 500
          );
          let stepped = value;
          let waiting: string[] = [];

          for (const change of order) {
            waiting = waiting.concat(change);
            const step = decide(stepped, waiting);

            if (step.result.status === 'blocked') continue;
            stepped = step.value;
            waiting = [];
          }

          const kept = word.replace(removed, '');
          const expected = [
            {
              type: 'paragraph',
              children: [
                { text: '' },
                { type: 'link', children: [{ text: kept }] },
                { text: '' },
              ],
            },
          ];

          assert.deepEqual(
            {
              batch: decide(value, [...actions.keys()]).value,
              stepped,
              waiting,
            },
            { batch: expected, stepped: expected, waiting: [] },
            `${JSON.stringify(offsets)} without "${removed}" (${intent}) in order ${order.join(',')}`
          );
        }
      ),
      { numRuns: 150 }
    );
  });
});

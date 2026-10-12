import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isDeepStrictEqual } from 'node:util';

import fc from 'fast-check';
import {
  ContentSlice,
  createEditor,
  defineEditorSchema,
  definePlugin,
  EditorSchemaValidationError,
  NodeApi,
  property,
  schema,
  target,
  transfer,
} from 'plitejs';

import {
  type AuthoredMarkKind,
  authoredMarksSchema,
  readAuthoredMarks,
} from '../src/authored/tree/marks';
import {
  authoredResolveSchemaOf,
  authoredTreeProof,
} from '../src/authored/tree/proof-plugin';
import { proposedChildren } from '../src/authored/tree/proposed';
import { AuthoredUnrepresentableError } from '../src/authored/tree/record';
import { projectAuthoredValue } from '../src/authored/tree/resolve';
import { getDefined } from '../src/internal/get-defined';
import { helpers, shapes } from './support/content-shapes';

type Node = Record<string, unknown> & {
  children?: readonly Node[];
  text?: string;
};
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
      intent === 'plain'
        ? definePlugin('recording-laws-marks', {
            schema: authoredMarksSchema,
          })
        : authoredTreeProof({
            authorId: author,
            createChangeId: () => changeId,
            intent,
            now: () => 1,
          }),
    ],
    initialValue: initialValue as never,
  });

const texts = (children: readonly Node[]) =>
  [...NodeApi.texts({ children } as never)] as Array<[Node, number[]]>;
const locate = (editor: Editor, letter: string) => {
  for (const [node, path] of texts(editor.read.children())) {
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
        (editor.read.children() as readonly Node[])[block[0]]?.type !== 'quote'
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
      const destination = locate(editor, command.to);

      if (!at || !destination) return false;
      const source = at.path.slice(0, -1);
      const landing = destination.path.slice(0, -1);

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
      const destination = locate(editor, command.to);

      if (!at || !destination) return false;
      editor.api.transfer.move({
        range: {
          anchor: at,
          focus: { offset: at.offset + 1, path: at.path },
        },
        to: { point: destination },
      });
      return true;
    }
    case 'replaceChildren': {
      const children = editor.read.children() as readonly Node[];
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

  return editor.read.children() as readonly Node[];
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
const jsonEqual = (left: unknown, right: unknown) =>
  JSON.stringify(left) === JSON.stringify(right);
// A text block holds texts and inline links.
const isInlineContent = (node: Node) =>
  typeof node.text === 'string' || node.type === 'link';
/**
 * Editing runs on the review tree, where an element that a pending change of
 * a `removing` kind takes away still stands. Editing's completion fills that
 * element, and the fill would keep it alive or lift into its parent, so this
 * strikes the fill by that change. The recorder's own fills carry insert
 * marks, so this leaves them alone.
 */
const withEditingFillsStruck = (
  nodes: readonly Node[],
  removing: readonly AuthoredMarkKind[] = ['delete']
): Node[] =>
  nodes.map((node) => {
    if (!node.children) return node;

    const deletes = readAuthoredMarks(node).flatMap((mark) =>
      removing.includes(mark.kind) ? [{ ...mark, kind: 'delete' as const }] : []
    );
    const isFill = (child: Node) =>
      !!child.children &&
      readAuthoredMarks(child).length === 0 &&
      child.children.every(
        (text) => text.text === '' && readAuthoredMarks(text).length === 0
      );
    const children = withEditingFillsStruck(node.children, removing).map(
      (child) =>
        deletes.length > 0 && isFill(child)
          ? {
              ...child,
              authored: deletes,
              children: (child.children ?? []).map((text) => ({
                ...text,
                authored: deletes,
              })),
            }
          : child
    );

    return { ...node, children };
  });
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
      previous !== undefined &&
      previous.type === node.type &&
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

const holdsMark = (nodes: readonly Node[], kind: AuthoredMarkKind): boolean =>
  nodes.some(
    (node) =>
      readAuthoredMarks(node).some((mark) => mark.kind === kind) ||
      holdsMark(node.children ?? [], kind)
  );

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
  numRuns: number,
  prepare: (value: readonly Node[]) => readonly Node[] = (value) => value
) => {
  let compared = 0;

  fc.assert(
    fc.property(
      documentArbitrary,
      historyArbitrary,
      commandArbitrary(LETTERS.slice(0, 8)),
      (initial, history, command) => {
        const before = prepare(replay(initial, history));
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
        // Editing fills the quote Alice's pending rotation strikes, and Bob's
        // suggested rotation copies that fill with the quote.
        [
          [
            {
              type: 'quote',
              children: [{ type: 'paragraph', children: [{ text: 'ab' }] }],
            },
            { type: 'paragraph', children: [{ text: 'cd' }] },
          ],
          [
            {
              author: 'alice',
              command: { kind: 'replaceChildren', shift: 1 },
              intent: 'propose',
            },
            {
              author: 'alice',
              command: { at: 'a', edge: 'after', kind: 'moveNode', to: 'c' },
              intent: 'edit',
            },
          ],
          { kind: 'replaceChildren', shift: 1 },
        ] as never,
        // Editing fills the quote Alice's pending unwrap dissolves.
        [
          [
            { type: 'paragraph', children: [{ text: 'ab' }] },
            { type: 'paragraph', children: [{ text: 'cd' }] },
            {
              type: 'quote',
              children: [{ type: 'paragraph', children: [{ text: 'gh' }] }],
            },
          ],
          [
            {
              author: 'alice',
              command: { at: 'h', kind: 'unwrap' },
              intent: 'propose',
            },
          ],
          { at: 'h', edge: 'after', kind: 'moveNode', to: 'a' },
        ] as never,
        // Deleting the text of a paragraph in a quote Alice's pending unwrap
        // dissolves keeps the paragraph, as replaying the unwrap first does.
        [
          [
            { type: 'paragraph', children: [{ text: 'ab' }] },
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
              author: 'alice',
              command: { at: 'g', kind: 'unwrap' },
              intent: 'propose',
            },
          ],
          { from: 'g', kind: 'deleteRange', to: 'h' },
        ] as never,
        // The paragraph after the quote joins back into the quote's empty
        // last paragraph, which accepting everything removes.
        [
          [
            { type: 'paragraph', children: [{ text: 'ab' }] },
            {
              type: 'quote',
              children: [
                { type: 'paragraph', children: [{ text: 'cd' }] },
                { type: 'paragraph', children: [{ text: 'ef' }] },
              ],
            },
            { type: 'paragraph', children: [{ text: 'gh' }] },
          ],
          [
            {
              author: 'alice',
              command: { from: 'f', kind: 'deleteRange', to: 'd' },
              intent: 'propose',
            },
            {
              author: 'alice',
              command: { from: 'd', kind: 'deleteRange', to: 'a' },
              intent: 'edit',
            },
          ],
          { at: 'f', edge: 'before', kind: 'moveNode', to: 'h' },
        ] as never,
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
        // Moving the only paragraph out of a quote another change struck
        // leaves Editing's fill in that quote, where Suggesting strikes the
        // paragraph and leaves the quote struck.
        [
          [
            { type: 'paragraph', children: [{ text: 'ab' }] },
            {
              type: 'quote',
              children: [
                { type: 'paragraph', children: [{ text: 'cd' }] },
                { type: 'paragraph', children: [{ text: 'ef' }] },
              ],
            },
            {
              type: 'quote',
              children: [{ type: 'paragraph', children: [{ text: 'gh' }] }],
            },
          ],
          [
            {
              author: 'alice',
              command: { kind: 'replaceChildren', shift: 1 },
              intent: 'propose',
            },
          ],
          { at: 'h', edge: 'after', kind: 'moveNode', to: 'a' },
        ] as never,
        // An earlier edit leaves that fill in the review tree, so both sides
        // hold it.
        [
          [
            {
              type: 'quote',
              children: [{ type: 'paragraph', children: [{ text: 'ab' }] }],
            },
            { type: 'paragraph', children: [{ text: 'cd' }] },
            { type: 'paragraph', children: [{ text: 'ef' }] },
            { type: 'paragraph', children: [{ text: 'gh' }] },
          ],
          [
            {
              author: 'alice',
              command: { kind: 'replaceChildren', shift: 1 },
              intent: 'propose',
            },
            {
              author: 'alice',
              command: { at: 'a', edge: 'after', kind: 'moveNode', to: 'h' },
              intent: 'edit',
            },
          ],
          { from: 'a', kind: 'deleteRange', to: 'a' },
        ] as never,
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
    const compared = recordedCommands(
      ({ before, edited, suggested }) => {
        const proposed = projection(
          withEditingFillsStruck(suggested),
          'proposed'
        );
        const editing = projection(withEditingFillsStruck(edited), 'proposed');
        // A fill in an element a pending unwrap dissolves looks like a block
        // the command emptied there, so instead of striking it on both sides
        // the law lets the suggestion lack it.
        const unwrapFillsGone = projection(
          withEditingFillsStruck(edited, ['delete', 'unwrap']),
          'proposed'
        );

        // Two named limits: Editing, run on the review tree, fills an element
        // a pending deletion strikes or a pending unwrap dissolves, which the
        // Open work of docs/plans/2026-10-11-authored-fill.md keeps until
        // commands run on the proposed document; and, pinned by a decisions
        // test, a join whose block Editing merges into struck text lands in
        // the nearest kept text block of the same parent when suggested.
        if (
          !jsonEqual(proposed, editing) &&
          !jsonEqual(proposed, unwrapFillsGone)
        ) {
          assert.ok(
            hasStruckTextBlock(before),
            'only a join into struck text moves a boundary'
          );
          assert.deepEqual(
            withJoinedTextBlocks(proposed, afterStruckTextBlocks(before)),
            withJoinedTextBlocks(editing, afterStruckTextBlocks(before))
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
      },
      250,
      withEditingFillsStruck
    );

    assert.ok(compared > 150, `only ${compared} commands compared`);
  });

  it('reads each element’s proposed children as accepting everything holds them before completion builds', () => {
    type Shape = Readonly<{ children: Shape[]; text: boolean; type: unknown }>;
    const shapeOf = (
      children: readonly Node[],
      read: (node: Node, index: number) => readonly Node[]
    ): Shape[] =>
      children.flatMap((node, index) =>
        typeof node.text === 'string'
          ? []
          : [
              {
                children: shapeOf(read(node, index), read),
                text: read(node, index).some((child) => !!child.text),
                type: node.type,
              },
            ]
      );
    const proposedShape = (
      children: readonly Node[],
      path: readonly number[]
    ): Shape[] => {
      const entries = proposedChildren(children as never, path);

      return entries.flatMap(({ node, path: at }) =>
        typeof node.text === 'string'
          ? []
          : [
              {
                children: proposedShape(children, at),
                text: proposedChildren(children as never, at).some(
                  ({ node: child }) => !!child.text
                ),
                type: node.type,
              },
            ]
      );
    };
    const compared = recordedCommands(({ suggested }) => {
      const resolution = projectAuthoredValue(
        { children: suggested } as never,
        'proposed',
        authoredResolveSchemaOf(
          editorFor(suggested, 'carol', 'edit', 'carol:1') as never
        )
      );
      const reviewed = new Set<unknown>();
      const visit = (nodes: readonly Node[]) => {
        for (const node of nodes) {
          reviewed.add(resolution.resolvedOf(node));
          visit(node.children ?? []);
        }
      };

      visit(suggested);
      assert.deepEqual(
        proposedShape(suggested, []),
        shapeOf(resolution.value.children as Node[], (node) =>
          (node.children ?? []).filter(
            (child) => typeof child.text === 'string' || reviewed.has(child)
          )
        ),
        `proposed children differ: ${JSON.stringify(suggested)}`
      );
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

              return {
                result,
                value: editor.read.children() as readonly Node[],
              };
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
            value = editor.read.children();
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
          value = remover.read.children();

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

            return { result, value: editor.read.children() as readonly Node[] };
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

/** A child Editing holds, with where the document being edited holds it. */
type Entry = Readonly<{ node: Node; path: readonly number[] }>;
/** The children of `host`, or of the root when it is null. */
type Kids = (host: Entry | null) => readonly Entry[];
/** A gesture's transaction on the document `kids` reads, or null when it does not apply there. */
type Gesture = (kids: Kids, typed: string) => ((tx: any) => void) | null;
type World = Readonly<{
  /** Content with a maximum, where a fill the review tree cannot hold waits for the decision (R1). */
  bounded?: boolean;
  /** Gestures whose histories must decide in every order without waiting, as probes 4 and 8 do. */
  everyOrder?: readonly string[];
  /** A named family's gestures: every complete decision set of a history made of them is held to Editing. */
  family?: readonly string[];
  gestures: Readonly<Record<string, Gesture>>;
  name: string;
  plugin: unknown;
  start: readonly Node[];
}>;

const editingKids =
  (children: readonly Node[]): Kids =>
  (host) =>
    (host ? (host.node.children ?? []) : children).map((node, index) => ({
      node,
      path: [...(host?.path ?? []), index],
    }));
const hasMark = (node: Node | undefined, kind: string) =>
  readAuthoredMarks(node ?? {}).some((mark) => mark.kind === kind);
/**
 * The proposed children, plus the children of the blocks a pending join folds
 * into this one, and the empty text Editing holds in an element whose texts
 * are all struck, placed at its first struck text, so typing goes before that
 * text and removing it changes nothing, as Editing rebuilds it.
 */
const proposedKids =
  (children: readonly Node[]): Kids =>
  (host) => {
    const own = (entry: Entry | null) =>
      proposedChildren(
        children as never,
        entry?.path ?? []
      ) as readonly Entry[];
    const kids = [...own(host)];

    if (host && host.path.length > 0) {
      const level = host.path
        .slice(0, -1)
        .reduce<readonly Node[]>(
          (nodes, index) => nodes[index]?.children ?? [],
          children
        );

      for (
        let index = getLast(host.path) + 1;
        index < level.length;
        index += 1
      ) {
        const sibling = level[index];

        if (hasMark(sibling, 'delete')) continue;
        if (!hasMark(sibling, 'join')) break;
        kids.push(
          ...own({
            node: getDefined(sibling),
            path: [...host.path.slice(0, -1), index],
          })
        );
      }
    }

    const struck = (host?.node.children ?? []).findIndex(
      (child) => typeof child.text === 'string'
    );

    return host && kids.length === 0 && struck !== -1
      ? [{ node: leaf(''), path: [...host.path, struck] }]
      : kids;
  };
const findEntry = (
  kids: Kids,
  test: (entry: Entry) => boolean,
  host: Entry | null = null
): Entry | null => {
  for (const entry of kids(host)) {
    if (test(entry)) return entry;
    if (entry.node.children) {
      const found = findEntry(kids, test, entry);

      if (found) return found;
    }
  }

  return null;
};
const textsIn = (host: Entry): Entry[] =>
  (host.node.children ?? []).flatMap((node, index) => {
    const entry = { node, path: [...host.path, index] };

    return typeof node.text === 'string' ? [entry] : textsIn(entry);
  });
/** The first empty text Editing holds in `host` or below it. */
const emptyIn = (kids: Kids, host: Entry): Entry | null => {
  const inner = kids(host);
  const empty = inner.find((child) => child.node.text === '');

  if (empty) return empty;
  for (const child of inner) {
    const found = child.node.children ? emptyIn(kids, child) : null;

    if (found) return found;
  }

  return null;
};
/** The first empty text Editing holds inside an element of `type`. */
const emptySpot = (
  kids: Kids,
  type: string,
  host: Entry | null = null
): Entry | null => {
  for (const entry of kids(host)) {
    const found =
      (entry.node.type === type ? emptyIn(kids, entry) : null) ??
      (entry.node.children ? emptySpot(kids, type, entry) : null);

    if (found) return found;
  }

  return null;
};
const textsUnder = (kids: Kids, host: Entry): Entry[] =>
  kids(host).flatMap((entry) =>
    typeof entry.node.text === 'string' ? [entry] : textsUnder(kids, entry)
  );
const holding = (letter: string) => (entry: Entry) =>
  typeof entry.node.text === 'string' && entry.node.text.includes(letter);
const element = (kids: Kids, type: string, letter?: string) =>
  findEntry(
    kids,
    (entry) =>
      entry.node.type === type &&
      (letter === undefined || findEntry(kids, holding(letter), entry) !== null)
  );
const propsOf = ({ authored: _authored, text: _text, ...rest }: Node) => rest;
/**
 * The texts beside the one holding `letter` that Editing holds as one text
 * node, since review marks keep texts apart that Editing merges.
 */
const textRun = (
  kids: Kids,
  letter: string,
  host: Entry | null = null
): Entry[] | null => {
  const level = kids(host);
  const at = level.findIndex(holding(letter));

  if (at === -1) {
    for (const entry of level) {
      const found = entry.node.children ? textRun(kids, letter, entry) : null;

      if (found) return found;
    }

    return null;
  }

  const same = (entry: Entry | undefined) =>
    typeof entry?.node.text === 'string' &&
    isDeepStrictEqual(propsOf(entry.node), propsOf(getDefined(level[at]).node));
  let from = at;
  let to = at;

  while (same(level[from - 1])) from -= 1;
  while (same(level[to + 1])) to += 1;

  return level.slice(from, to + 1);
};
/** Children as Editing holds them: each element, and each run of texts it merges. */
const unitsOf = (level: readonly Entry[]): Entry[][] =>
  level.reduce<Entry[][]>((units, entry) => {
    const last = units.at(-1)?.at(-1);

    if (
      last &&
      typeof last.node.text === 'string' &&
      typeof entry.node.text === 'string' &&
      isDeepStrictEqual(propsOf(last.node), propsOf(entry.node))
    ) {
      units.at(-1)?.push(entry);
    } else {
      units.push([entry]);
    }

    return units;
  }, []);
const after = (path: readonly number[]) => [
  ...path.slice(0, -1),
  getLast(path) + 1,
];
const getLast = (path: readonly number[]) => path.at(-1) ?? 0;

const gesture = {
  deleteChar:
    (letter: string): Gesture =>
    (kids) => {
      const text = findEntry(kids, holding(letter));

      if (!text) return null;
      const offset = (text.node.text ?? '').indexOf(letter);

      return (tx) =>
        tx.text.delete({
          at: {
            anchor: { offset, path: text.path },
            focus: { offset: offset + 1, path: text.path },
          },
        });
    },
  deleteEvery:
    (type: string): Gesture =>
    (kids) => {
      const host = element(kids, type);
      // From the element's start to its end, struck text included, as
      // Editing's range from its first text to its last.
      const all = host ? textsIn(host) : [];
      const first = all[0];
      const last = all.at(-1);

      if (
        !first ||
        !last ||
        (host &&
          textsUnder(kids, host).every((entry) => entry.node.text === ''))
      ) {
        return null;
      }

      return (tx) =>
        tx.text.delete({
          at: {
            anchor: { offset: 0, path: first.path },
            focus: { offset: (last.node.text ?? '').length, path: last.path },
          },
        });
    },
  insertBefore:
    (make: (typed: string) => Node, type?: string, letter?: string): Gesture =>
    (kids, typed) => {
      const found = type ? element(kids, type, letter) : kids(null)[0];

      if (!found) return null;

      return (tx) => tx.nodes.insert(make(typed), { at: found.path });
    },
  insertText:
    (type: string): Gesture =>
    (kids, typed) => {
      const host = element(kids, type);

      if (!host) return null;
      const last = kids(host).at(-1);
      const at = last
        ? after(last.path)
        : [...host.path, (host.node.children ?? []).length];

      return (tx) => tx.nodes.insert({ text: typed }, { at });
    },
  merge:
    (type: string, letter: string): Gesture =>
    (kids) => {
      const found = element(kids, type, letter);

      return found && ((tx) => tx.nodes.merge({ at: found.path }));
    },
  remove:
    (type: string, letter?: string): Gesture =>
    (kids) => {
      const found = element(kids, type, letter);

      return found && ((tx) => tx.nodes.remove({ at: found.path }));
    },
  removeEvery:
    (type: string): Gesture =>
    (kids) => {
      const host = element(kids, type);
      const children = host ? kids(host) : [];

      if (children.length === 0) return null;

      return (tx) => {
        for (const child of [...children].reverse()) {
          tx.nodes.remove({ at: child.path });
        }
      };
    },
  removeLast:
    (type: string): Gesture =>
    (kids) => {
      const host = element(kids, type);
      const last = host ? unitsOf(kids(host)).at(-1) : undefined;

      return last
        ? (tx) => {
            for (const entry of [...last].reverse()) {
              tx.nodes.remove({ at: entry.path });
            }
          }
        : null;
    },
  removeText:
    (letter: string): Gesture =>
    (kids) => {
      const struck = textRun(kids, letter);

      return (
        struck &&
        ((tx) => {
          for (const entry of [...struck].reverse()) {
            tx.nodes.remove({ at: entry.path });
          }
        })
      );
    },
  typeEmpty:
    (type: string): Gesture =>
    (kids, typed) => {
      const empty = emptySpot(kids, type);

      if (!empty) return null;
      const caret = { offset: 0, path: empty.path };

      return (tx) => {
        tx.selection.set({ anchor: caret, focus: caret });
        tx.text.insert(typed);
      };
    },
  unwrap:
    (type: string, letter?: string): Gesture =>
    (kids) => {
      const found = element(kids, type, letter);

      return found && ((tx) => tx.nodes.unwrap({ at: found.path }));
    },
};

const fillSchema = (
  id: string,
  elements: Readonly<Record<string, unknown>>,
  root: unknown,
  properties: readonly unknown[] = []
) =>
  defineEditorSchema(`fill-law-${id}`, {
    elements,
    id: `fill-law-${id}`,
    properties,
    root,
    unknown: 'reject',
    version: 1,
  } as never);
const fc_ = schema.content;
const blocksOf = (first: string, ...rest: string[]) =>
  fc_.any([fc_.type(first), ...rest.map((type) => fc_.type(type))], {
    default: { type: first },
    min: 1,
  });
const leaf = (text: string, extra: object = {}): Node => ({ text, ...extra });
const block = (type: string, ...children: Node[]): Node => ({
  children,
  type,
});
const lettersOf = (nodes: readonly Node[]) =>
  [...texts(nodes)].flatMap(([node]) => (node.text ?? '').split(''));
/** Gestures on the letters of `nodes` inside an element of `type`, all of them or those `only` names. */
const contentGestures = (
  type: string,
  nodes: readonly Node[],
  only?: readonly string[]
) => {
  const all: Record<string, Gesture> = {
    ...Object.fromEntries(
      lettersOf(nodes).flatMap((letter) => [
        [`delete ${letter}`, gesture.deleteChar(letter)],
        [`remove the text holding ${letter}`, gesture.removeText(letter)],
      ])
    ),
    'delete every character': gesture.deleteEvery(type),
    'insert a text node': gesture.insertText(type),
    'remove every child': gesture.removeEvery(type),
    'remove the last child': gesture.removeLast(type),
    'type into an empty text': gesture.typeEmpty(type),
  };

  return only
    ? Object.fromEntries(
        Object.entries(all).filter(
          ([name]) =>
            only.includes(name) ||
            (only.includes('delete a character') && /^delete .$/.test(name)) ||
            (only.includes('remove a text node') &&
              name.startsWith('remove the text holding'))
        )
      )
    : all;
};
/** The law's gestures for the C2 gestures a shape declares, and typing where it holds text. */
const SHAPE_GESTURES: Readonly<Record<string, readonly string[]>> = {
  'delete every character': [
    'delete every character',
    'delete a character',
    'type into an empty text',
    'insert a text node',
  ],
  'remove every child': ['remove every child'],
  'remove the last block': ['remove the last child'],
  'remove the only text node': ['remove a text node'],
};

const shapeWorlds: World[] = shapes.map((shape) => {
  const start = [
    block('paragraph', leaf('p')),
    block('el', ...(shape.start as Node[])),
  ];

  return {
    bounded: (shape.content as { max?: number }).max !== undefined,
    gestures: contentGestures(
      'el',
      shape.start,
      shape.gestures.flatMap((name) => SHAPE_GESTURES[name] ?? [])
    ),
    name: shape.name,
    plugin: fillSchema(
      `shape-${shape.name.replaceAll(/[^a-z0-9]+/gi, '-')}`,
      { ...helpers, ...shape.elements, el: { content: shape.content } },
      blocksOf('paragraph', 'el'),
      shape.properties
    ),
    start,
  };
});
const cellsOf = (options: object) => ({
  cell: { content: fc_.text() },
  group: { content: fc_.type('cell', options) },
  paragraph: { content: fc_.text() },
  wrapper: { content: fc_.type('cell', { min: 1 }) },
});
const cell = (letter: string) => block('cell', leaf(letter));
const gridGestures = (letters: string) => ({
  ...Object.fromEntries(
    letters
      .split('')
      .map((letter) => [
        `delete cell ${letter}`,
        gesture.remove('cell', letter),
      ])
  ),
  'delete the group': gesture.remove('group'),
  'type into an empty cell': gesture.typeEmpty('cell'),
  'unwrap the group': gesture.unwrap('group'),
});
const namedWorlds: World[] = [
  {
    everyOrder: ['delete cell a', 'delete cell b'],
    family: ['delete cell a', 'delete cell b', 'unwrap the group'],
    gestures: gridGestures('ab'),
    name: 'grid of two cells under a minimum of two',
    plugin: fillSchema(
      'grid',
      cellsOf({ min: 2 }),
      blocksOf('paragraph', 'group', 'cell')
    ),
    start: [
      block('paragraph', leaf('p')),
      block('group', cell('a'), cell('b')),
    ],
  },
  {
    everyOrder: ['delete cell a', 'delete cell b', 'delete cell c'],
    family: [
      'delete cell a',
      'delete cell b',
      'delete cell c',
      'unwrap the group',
    ],
    gestures: gridGestures('abc'),
    name: 'grid of three cells under a minimum of two',
    plugin: fillSchema(
      'grid3',
      cellsOf({ min: 2 }),
      blocksOf('paragraph', 'group', 'cell')
    ),
    start: [
      block('paragraph', leaf('p')),
      block('group', cell('a'), cell('b'), cell('c')),
    ],
  },
  {
    bounded: true,
    gestures: gridGestures('ab'),
    name: 'grid of two cells under a minimum and maximum of two',
    plugin: fillSchema(
      'grid-max',
      cellsOf({ max: 2, min: 2 }),
      blocksOf('paragraph', 'group', 'cell')
    ),
    start: [
      block('paragraph', leaf('p')),
      block('group', cell('a'), cell('b')),
    ],
  },
  {
    // Unwrapping the group would put the wrapper at the root, which the
    // schema refuses in Editing too.
    gestures: Object.fromEntries(
      Object.entries({
        ...gridGestures('ab'),
        'unwrap the wrapper': gesture.unwrap('wrapper'),
      }).filter(([name]) => name !== 'unwrap the group')
    ),
    name: 'grid with a wrapped cell beside a cell',
    plugin: fillSchema(
      'wrapped-grid',
      {
        ...cellsOf({}),
        group: {
          content: fc_.types(['cell', 'wrapper'], {
            default: { type: 'cell' },
            min: 2,
          }),
        },
      },
      blocksOf('paragraph', 'group', 'cell')
    ),
    start: [
      block('paragraph', leaf('p')),
      block('group', block('wrapper', cell('a')), cell('b')),
    ],
  },
  {
    family: [
      'delete the paragraph',
      'delete the title',
      'insert a heading above the prefix',
      'insert a paragraph before the title',
    ],
    gestures: {
      'delete the body heading': gesture.remove('h1', 'B'),
      'delete the paragraph': gesture.remove('paragraph', 'p'),
      'delete the title': gesture.remove('h1', 'T'),
      'insert a heading above the prefix': gesture.insertBefore((typed) =>
        block('h1', leaf(typed))
      ),
      'insert a paragraph before the title': gesture.insertBefore(
        (typed) => block('paragraph', leaf(typed)),
        'h1',
        'T'
      ),
      'type into an empty heading': gesture.typeEmpty('h1'),
    },
    name: 'a required title',
    plugin: fillSchema(
      'titled',
      {
        h1: { content: fc_.text({ default: 'text', min: 1 }) },
        paragraph: { content: fc_.text({ default: 'text', min: 1 }) },
      },
      fc_.prefix([{ element: 'h1' }], blocksOf('paragraph', 'h1'))
    ),
    start: [
      block('h1', leaf('T')),
      block('paragraph', leaf('p')),
      block('h1', leaf('B')),
      block('paragraph', leaf('q')),
    ],
  },
  {
    gestures: {
      ...contentGestures(
        'quote',
        [leaf('ab'), leaf('cd')],
        [
          'delete a character',
          'remove a text node',
          'remove every child',
          'remove the last child',
          'type into an empty text',
        ]
      ),
      'delete the quote': gesture.remove('quote'),
      'delete the paragraph holding a': gesture.remove('paragraph', 'a'),
      'unwrap the quote': gesture.unwrap('quote'),
    },
    name: 'a quote of two paragraphs',
    plugin: fillSchema(
      'quotes',
      {
        paragraph: { content: fc_.text() },
        quote: { content: fc_.type('paragraph', { min: 1 }) },
      },
      blocksOf('paragraph', 'quote')
    ),
    start: [
      block(
        'quote',
        block('paragraph', leaf('ab')),
        block('paragraph', leaf('cd'))
      ),
      block('paragraph', leaf('ef')),
    ],
  },
  {
    gestures: {
      'delete the group': gesture.remove('group'),
      'delete the row': gesture.remove('row', 'x'),
      'remove every row': gesture.removeEvery('group'),
      'unwrap the box': gesture.unwrap('box'),
    },
    name: 'a row whose role its parent decides, inside a box',
    plugin: fillSchema(
      'scoped-rows',
      {
        box: { content: fc_.type('group', { min: 1 }) },
        group: { content: fc_.type('row', { min: 1 }) },
        paragraph: { content: fc_.text() },
        row: { content: fc_.text() },
      },
      blocksOf('paragraph', 'group', 'box'),
      [
        schema.elementProperty('role', property.string({ default: 'nested' }), {
          target: target.and(
            target.type('row'),
            target.parent(target.type('group'))
          ),
        }),
      ]
    ),
    start: [
      block('paragraph', leaf('p')),
      block(
        'box',
        block('group', { ...block('row', leaf('x')), role: 'nested' })
      ),
    ],
  },
  {
    gestures: {
      ...contentGestures('link', [leaf('cd')]),
      'delete the link': gesture.remove('link', 'c'),
      'join the link’s paragraph to the one above': gesture.merge(
        'paragraph',
        'c'
      ),
    },
    name: 'a join above a link whose text a scoped default targets',
    plugin: fillSchema(
      'scoped-link',
      {
        link: { content: fc_.text({ default: 'text', min: 1 }), inline: true },
        paragraph: { content: fc_.any([fc_.text(), fc_.type('link')]) },
      },
      blocksOf('paragraph'),
      [
        schema.textProperty('lang', property.string({ default: 'en' }), {
          target: target.type('link'),
        }),
      ]
    ),
    start: [
      block('paragraph', leaf('ab')),
      block(
        'paragraph',
        leaf(''),
        block('link', leaf('cd', { lang: 'en' })),
        leaf('')
      ),
    ],
  },
  {
    gestures: {
      ...contentGestures(
        'el',
        [leaf('a'), leaf('hello')],
        [
          'delete a character',
          'remove a text node',
          'remove every child',
          'remove the last child',
          'type into an empty text',
        ]
      ),
      'delete the block': gesture.remove('xb', 'a'),
    },
    name: 'mixed content with a block default at a minimum of two',
    plugin: fillSchema(
      'mixed-two',
      {
        el: {
          content: fc_.any([fc_.text(), fc_.type('xb')], {
            default: { type: 'xb' },
            min: 2,
          }),
        },
        paragraph: { content: fc_.text() },
        xb: { content: fc_.text() },
      },
      blocksOf('paragraph', 'el')
    ),
    start: [
      block('paragraph', leaf('p')),
      block('el', block('xb', leaf('a')), leaf('hello')),
    ],
  },
  {
    everyOrder: [
      'delete a',
      'delete b',
      'remove the text holding a',
      'remove the text holding b',
    ],
    gestures: contentGestures('t0', [leaf('a'), leaf('b')]),
    name: 'two texts one change each empties (probe 4)',
    plugin: fillSchema(
      'two-texts',
      { paragraph: { content: fc_.text() }, t0: { content: fc_.text() } },
      blocksOf('paragraph', 't0'),
      [schema.textProperty('bold', property.boolean())]
    ),
    start: [
      block('paragraph', leaf('p')),
      block('t0', leaf('a'), leaf('b', { bold: true })),
    ],
  },
];
const WORLDS = [...shapeWorlds, ...namedWorlds];

const fillEditor = (
  world: World,
  value: readonly Node[],
  review?: Readonly<{ author: string; change: string }>
) =>
  createEditor({
    initialValue: structuredClone(value) as never,
    plugins: [
      world.plugin,
      ...(review
        ? [
            authoredTreeProof({
              authorId: review.author,
              createChangeId: () => review.change,
              intent: 'propose',
              now: () => 1,
            }),
          ]
        : []),
    ] as never,
  });
const plainNodes = (nodes: readonly Node[]): Node[] =>
  nodes.map(({ authored: _authored, children, ...rest }) =>
    children ? { ...rest, children: plainNodes(children) } : rest
  );
const unmarkedElements = (nodes: readonly Node[]): number =>
  nodes.reduce(
    (count, node) =>
      node.children
        ? count +
          (readAuthoredMarks(node).length > 0 ? 0 : 1) +
          unmarkedElements(node.children)
        : count,
    0
  );
const decideAll = (
  world: World,
  value: readonly Node[],
  decisions: ReadonlyArray<
    Readonly<{ action: 'accept' | 'reject'; changes: readonly string[] }>
  >
) => {
  const editor = createEditor({
    initialValue: structuredClone(value) as never,
    plugins: [world.plugin, authoredTreeProof({ authorId: 'zed' })] as never,
  });
  const result = (editor.api as Editor['api']).authoredTree.decide(
    decisions.filter((decision) => decision.changes.length > 0)
  );

  return { children: editor.read.children() as readonly Node[], result };
};
type Recorded = Readonly<{
  change: string;
  steps: ReadonlyArray<readonly [string, string]>;
}>;
/** Editing replaying `steps` from the start; null when a step finds no target, `refused` when Editing refuses one. */
const replayEditing = (
  world: World,
  start: readonly Node[],
  steps: ReadonlyArray<readonly [string, string]>
): readonly Node[] | 'refused' | null => {
  const editor = fillEditor(world, start);

  for (const [name, typed] of steps) {
    const step = getDefinedGesture(world, name)(
      editingKids(editor.read.children() as readonly Node[]),
      typed
    );

    if (!step) return null;
    try {
      editor.update((tx) => {
        step(tx);
        tx.selection.set(null);
      });
    } catch (error) {
      if (isRefusal(error)) return 'refused';
      throw error;
    }
  }

  return editor.read.children();
};
const getDefinedGesture = (world: World, name: string) => {
  const found = world.gestures[name];

  if (!found) throw new Error(`${world.name} has no gesture ${name}`);
  return found;
};

describe('authored review tree fill laws', () => {
  it('records what Editing does and decides every change set as Editing replays it', () => {
    const seed = process.env.FILL_LAW_SEED;
    const runs = new Map<string, number>();
    const deferred: string[] = [];
    // Gestures Editing has a place for that the review tree lacks, because a
    // maximum deferred the fill that holds it (R1).
    const unlocatable = new Map<string, number>();
    let coalesced = 0;
    const refusedAtMaximum: string[] = [];
    let liftedPendingUnwrap = 0;
    let refusedSets = 0;
    let leftOut = 0;
    let orders = 0;
    let sets = 0;

    fc.assert(
      fc.property(
        fc.nat({ max: WORLDS.length - 1 }),
        fc.array(
          fc.record({
            author: fc.constantFrom('ann', 'bob'),
            gestures: fc.array(fc.nat(), { maxLength: 2, minLength: 1 }),
          }),
          { maxLength: 4, minLength: 1 }
        ),
        fc.array(fc.boolean(), { maxLength: 4, minLength: 4 }),
        (worldIndex, history, accepts) => {
          const world = getDefinedWorld(worldIndex);
          const names = Object.keys(world.gestures);
          const start = fillEditor(
            world,
            world.start
          ).read.children() as readonly Node[];
          let review = start;
          let edited = start;
          const recorded: Recorded[] = [];
          // One author's insertion beside their own pending one joins that
          // change, so its step has no change of its own to decide.
          let joined = false;

          for (const [index, step] of history.entries()) {
            const change = `${step.author}:${index}`;
            const suggesting = fillEditor(world, review, {
              author: step.author,
              change,
            });
            const editing = fillEditor(world, edited);
            const done: Array<readonly [string, string]> = [];

            for (const [part, pick] of step.gestures.entries()) {
              const name = getDefined(names[pick % names.length]);
              const typed = String.fromCharCode(77 + index * 2 + part);
              const inEditing = getDefinedGesture(world, name)(
                editingKids(editing.read.children() as readonly Node[]),
                typed
              );

              if (!inEditing) continue;

              const editedBefore = editing.read.children();

              try {
                editing.update((tx) => {
                  inEditing(tx);
                  tx.selection.set(null);
                });
              } catch (error) {
                if (isRefusal(error)) continue;
                throw error;
              }

              const inReview = getDefinedGesture(world, name)(
                proposedKids(suggesting.read.children() as readonly Node[]),
                typed
              );

              if (!inReview) {
                // Removing what Editing rebuilds at once changes nothing.
                if (isDeepStrictEqual(editing.read.children(), editedBefore)) {
                  continue;
                }
                // Only a fill a maximum defers (R1) leaves Editing a place
                // the review lacks.
                assert.ok(
                  world.bounded,
                  `"${name}" has no place in the review of ${world.name} after ${JSON.stringify([...recorded, { change, steps: done }])}\n${JSON.stringify(suggesting.read.children())}`
                );
                unlocatable.set(
                  `${world.name} | ${name}`,
                  (unlocatable.get(`${world.name} | ${name}`) ?? 0) + 1
                );
                return;
              }
              const unmarked = unmarkedElements(
                suggesting.read.children() as readonly Node[]
              );
              const marksBefore = marksByChange(
                suggesting.read.children() as readonly Node[]
              );

              try {
                suggesting.update((tx) => {
                  inReview(tx);
                  tx.selection.set(null);
                });
              } catch (error) {
                // The struck texts and line anchors Suggesting keeps apart,
                // where Editing merges them, can overflow a maximum.
                if (isRefusal(error) && world.bounded) {
                  refusedAtMaximum.push(`${world.name} | ${name}`);
                  return;
                }
                // A pending unwrap keeps its element in the review tree, so
                // lifting it out of its parent can land it where the schema
                // refuses its type.
                if (isRefusal(error) && holdsMark(review, 'unwrap')) {
                  liftedPendingUnwrap += 1;
                  return;
                }
                throw new Error(
                  `Suggesting refused "${name}" in ${world.name}: ${String(error)}\n${JSON.stringify(review)}`,
                  { cause: error }
                );
              }
              assert.ok(
                unmarkedElements(
                  suggesting.read.children() as readonly Node[]
                ) <= unmarked,
                `the recorder slot built an unmarked element: ${world.name}, ${name}`
              );
              const marksAfter = marksByChange(
                suggesting.read.children() as readonly Node[]
              );

              joined ||= [...marksAfter].some(
                ([other, count]) =>
                  other !== change && count > (marksBefore.get(other) ?? 0)
              );
              runs.set(
                `${world.name} | ${name}`,
                (runs.get(`${world.name} | ${name}`) ?? 0) + 1
              );
              done.push([name, typed]);
            }
            if (done.length === 0) continue;
            review = suggesting.read.children() as readonly Node[];
            edited = editing.read.children() as readonly Node[];
            recorded.push({ change, steps: done });
          }

          const changes = recorded.map(({ change }) => change);

          if (changes.length === 0) return;
          const context = `${world.name}: ${JSON.stringify(recorded)}\n${JSON.stringify(review)}`;
          const accepted = decideAll(world, review, [
            { action: 'accept', changes },
          ]);

          if (
            !isDeepStrictEqual(
              plainNodes(accepted.children),
              plainNodes(edited)
            )
          ) {
            if (!world.bounded) {
              assert.deepEqual(
                plainNodes(accepted.children),
                plainNodes(edited),
                `accepting everything differs from Editing in ${context}`
              );
            }
            deferred.push(context);
          }
          assert.deepEqual(
            plainNodes(
              decideAll(world, review, [{ action: 'reject', changes }]).children
            ),
            plainNodes(start),
            `rejecting everything differs from the start in ${context}`
          );

          // Every order of one complete decision set ends where the batch does.
          const actionOf = (change: string) =>
            accepts[changes.indexOf(change) % accepts.length]
              ? 'accept'
              : 'reject';
          const split = (batch: readonly string[]) =>
            (['accept', 'reject'] as const).map((action) => ({
              action,
              changes: batch.filter((change) => actionOf(change) === action),
            }));
          const together = decideAll(world, review, split(changes));
          const everyOrder = recorded.every(({ steps }) =>
            steps.every(([name]) => world.everyOrder?.includes(name))
          );

          for (const order of permutations(changes)) {
            let value = review;
            const pending = [...order];

            while (pending.length > 0) {
              const batch = new Set([getDefined(pending.shift())]);
              let step = decideAll(world, value, split([...batch]));

              while (step.result.status === 'blocked') {
                assert.ok(!everyOrder, `a decision waited in ${context}`);
                assert.deepEqual(
                  step.children,
                  value,
                  `a blocked decision changed ${context}`
                );
                for (const change of step.result.with) {
                  batch.add(change);
                  if (pending.includes(change)) {
                    pending.splice(pending.indexOf(change), 1);
                  }
                }
                step = decideAll(world, value, split([...batch]));
              }
              value = step.children;
            }
            orders += 1;
            assert.deepEqual(
              value,
              together.children,
              `order ${order.join(', ')} differs in ${context}`
            );
          }
          const { family } = world;

          if (
            !family ||
            !recorded.every(({ steps }) =>
              steps.every(([name]) => family.includes(name))
            )
          ) {
            return;
          }
          if (joined) {
            coalesced += 1;
            return;
          }

          // Each complete decision set equals Editing replaying what it accepts.
          for (let mask = 0; mask < 2 ** changes.length; mask += 1) {
            const kept = recorded.filter((_, index) => (mask >> index) & 1);
            const oracle = replayEditing(
              world,
              start,
              kept.flatMap(({ steps }) => steps)
            );
            const decided = decideAll(world, review, [
              { action: 'accept', changes: kept.map(({ change }) => change) },
              {
                action: 'reject',
                changes: changes.filter(
                  (change) => !kept.some((item) => item.change === change)
                ),
              },
            ]);

            if (oracle === null) {
              leftOut += 1;
              continue;
            }
            if (oracle === 'refused') {
              refusedSets += 1;
              assert.equal(
                decided.result.status,
                'invalid',
                `a set Editing refuses applied in ${context}`
              );
              continue;
            }
            sets += 1;
            assert.deepEqual(
              plainNodes(decided.children),
              plainNodes(oracle),
              `accepting ${JSON.stringify(kept.map(({ change }) => change))} differs from Editing in ${context}`
            );
          }
        }
      ),
      {
        examples: FILL_EXAMPLES,
        numRuns: Number(process.env.FILL_LAW_RUNS ?? 1200),
        ...(seed ? { seed: Number(seed) } : {}),
      }
    );

    const unexercised = WORLDS.flatMap((world) =>
      Object.keys(world.gestures)
        // A world whose recordings can overflow its maximum may refuse
        // before a gesture runs, so none of its gestures is required to record.
        .filter(
          (name) =>
            !runs.has(`${world.name} | ${name}`) &&
            !refusedAtMaximum.some((refusal) =>
              refusal.startsWith(`${world.name} | `)
            )
        )
        .map((name) => `${world.name} | ${name}`)
    );

    process.stdout.write(
      `fill law: ${runs.size} gestures recorded, ${orders} orders, ${sets} decision sets, ${refusedSets} sets Editing refuses, ${leftOut} left out, ${coalesced} with joined insertions, ${[...unlocatable.values()].reduce((sum, count) => sum + count, 0)} histories reaching what a maximum deferred (${[...unlocatable].map(([key, count]) => `${key}: ${count}`).join('; ')}), ${liftedPendingUnwrap} lifting a pending unwrap, ${deferred.length} R1 deferrals, ${refusedAtMaximum.length} refusals at a maximum (${[...new Set(refusedAtMaximum)].join('; ')})\n${deferred.join('\n')}\n`
    );
    assert.deepEqual(unexercised, [], 'every gesture records in its world');
  });
});

const marksByChange = (nodes: readonly Node[]) => {
  const counts = new Map<string, number>();
  const visit = (level: readonly Node[]) => {
    for (const node of level) {
      for (const mark of readAuthoredMarks(node)) {
        counts.set(mark.change, (counts.get(mark.change) ?? 0) + 1);
      }
      visit(node.children ?? []);
    }
  };

  visit(nodes);
  return counts;
};
const getDefinedWorld = (index: number) => {
  const world = WORLDS[index];

  if (!world) throw new Error(`no world ${index}`);
  return world;
};
/** A history the generator must always run, by world and gesture names. */
const example = (
  worldName: string,
  steps: ReadonlyArray<readonly [string, ...string[]]>,
  accepts: readonly boolean[] = [true, false, true, false]
): [number, Array<{ author: string; gestures: number[] }>, boolean[]] => {
  const index = WORLDS.findIndex((world) => world.name === worldName);
  const names = Object.keys(getDefinedWorld(index).gestures);

  return [
    index,
    steps.map(([author, ...gestures]) => ({
      author,
      gestures: gestures.map((name) => {
        const at = names.indexOf(name);

        if (at === -1) throw new Error(`${worldName} has no gesture ${name}`);
        return at;
      }),
    })),
    [...accepts],
  ];
};
const GRID = 'grid of two cells under a minimum of two';
const GRID3 = 'grid of three cells under a minimum of two';
const TITLE = 'a required title';
// Probe 12's grid and title histories, cases 6a and 6b, two authors on a
// title, probe 8's two-cell orders and probe 4's two texts, then one history
// for each gesture a random history rarely reaches.
const FILL_EXAMPLES = [
  example(TITLE, [
    ['ann', 'insert a heading above the prefix'],
    ['ann', 'delete the title'],
  ]),
  example(TITLE, [
    ['ann', 'delete the title'],
    ['ann', 'insert a heading above the prefix'],
  ]),
  example(TITLE, [['ann', 'delete the title']]),
  example(TITLE, [
    ['ann', 'delete the title'],
    ['bob', 'delete the title'],
  ]),
  example(TITLE, [
    ['ann', 'insert a heading above the prefix'],
    ['bob', 'insert a paragraph before the title'],
  ]),
  example(TITLE, [
    ['ann', 'insert a heading above the prefix'],
    ['bob', 'delete the title'],
    ['ann', 'delete the paragraph'],
  ]),
  example(GRID, [
    ['ann', 'delete cell a'],
    ['bob', 'unwrap the group'],
  ]),
  example(GRID, [
    ['ann', 'unwrap the group'],
    ['bob', 'delete cell a'],
  ]),
  example(GRID, [
    ['ann', 'delete cell a'],
    ['bob', 'delete cell b'],
    ['ann', 'unwrap the group'],
  ]),
  example(GRID, [
    ['ann', 'delete cell b'],
    ['bob', 'delete cell a'],
    ['ann', 'unwrap the group'],
  ]),
  example(GRID, [['ann', 'delete cell b']]),
  example(
    GRID,
    [
      ['ann', 'delete cell a'],
      ['bob', 'delete cell b'],
    ],
    [true, false, false, false]
  ),
  example(
    GRID,
    [
      ['ann', 'delete cell a'],
      ['bob', 'delete cell b'],
    ],
    [false, true, false, false]
  ),
  example(
    GRID3,
    [
      ['ann', 'delete cell a'],
      ['bob', 'delete cell c'],
    ],
    [false, true, false, false]
  ),
  example(GRID3, [
    ['ann', 'delete cell a'],
    ['bob', 'delete cell b'],
    ['ann', 'type into an empty cell'],
  ]),
  example(GRID3, [
    ['ann', 'delete cell a', 'delete cell b'],
    ['bob', 'type into an empty cell'],
  ]),
  example('two texts one change each empties (probe 4)', [
    ['ann', 'delete a'],
    ['bob', 'delete b'],
  ]),
  example('a parent-scoped static default on a text', [['ann', 'delete a']]),
  example('a parent-scoped static default on a text', [
    ['ann', 'remove the text holding a'],
    ['bob', 'type into an empty text'],
  ]),
  example('a prefix with room for text', [
    ['ann', 'remove every child'],
    ['ann', 'remove every child'],
  ]),
  example('a quote of two paragraphs', [
    ['ann', 'remove the text holding a'],
    ['bob', 'type into an empty text'],
  ]),
  example('mixed content with a block default at a minimum of two', [
    ['ann', 'remove the text holding h'],
    ['bob', 'type into an empty text'],
  ]),
];
const permutations = <T>(items: readonly T[]): T[][] =>
  items.length <= 1
    ? [[...items]]
    : items.flatMap((item, index) =>
        permutations([...items.slice(0, index), ...items.slice(index + 1)]).map(
          (rest) => [item, ...rest]
        )
      );

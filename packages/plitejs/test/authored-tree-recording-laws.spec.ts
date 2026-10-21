import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isDeepStrictEqual } from 'node:util';

import fc from 'fast-check';
import {
  ContentSlice,
  createEditor,
  createEditorView,
  defineEditorSchema,
  definePlugin,
  editorCommands,
  EditorSchemaValidationError,
  NodeApi,
  type NodeKey,
  PathApi,
  type Point,
  PointApi,
  property,
  schema,
  target,
  transfer,
} from 'plitejs';
import { history as historyPlugin } from 'plitejs/history';
import * as Y from 'yjs';

import { createAuthoredPlugin } from '../src/authored/authored';
import {
  groupAuthoredChanges,
  indexAuthoredChanges,
} from '../src/authored/changes';
import {
  carriedIn,
  compactClaims,
  expandContexts,
  outerToInner,
} from '../src/authored/facts/compact';
import { factsOf } from '../src/authored/facts/facts';
import { authoredLocationMap } from '../src/authored/format';
import { getReviewLedger } from '../src/authored/ledger/ledger';
import { type BlockFacts, blockFactsOf } from '../src/authored/ledger/runs';
import {
  readLedgerWork,
  takeGateWindows,
  takeLevelFacts,
  watchGateWindows,
  watchLevelFacts,
} from '../src/authored/ledger/work';
import type { AuthoredRefusal } from '../src/authored/refusal';
import { authoredResolveSchemaOf } from '../src/authored/resolve-schema';
import { decidedAlignment } from '../src/authored/tree/alignment';
import {
  AuthoredMarkError,
  type AuthoredMarkKind,
  authoredMarksSchema,
  readAuthoredMarks,
} from '../src/authored/tree/marks';
import { proposedChildren } from '../src/authored/tree/proposed';
import { projectAuthoredValue } from '../src/authored/tree/resolve';
import {
  DocumentChange,
  getInternalDocumentRootChange,
  valueRoot,
} from '../src/core/change/document-change';
import { DocumentIndex } from '../src/core/change/document-index';
import type { JsonEditorValue, JsonNode } from '../src/core/change/tokens';
import {
  type CommandProjectionMap,
  projectionMapOf,
} from '../src/core/command-document';
import {
  EditorRefusalError,
  subscribeEditorRefusals,
} from '../src/core/refusal';
import { getDefined } from '../src/internal/get-defined';
import { yjs } from '../src/yjs/core/plugin';
import {
  authoredTestApi,
  expandedChildren,
  reviewedValue,
} from './support/authored';
import { helpers, shapes } from './support/content-shapes';

type Node = Record<string, unknown> & {
  children?: readonly Node[];
  text?: string;
};
type Editor = ReturnType<typeof editorFor>;
type Command =
  | Readonly<{
      at: string;
      kind: 'break' | 'nest' | 'paste' | 'type';
      side: number;
    }>
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
  author: 'alice' | 'bob' | 'dan' | 'erin';
  command: Command;
  intent: 'edit' | 'propose';
}>;

const quoteElements = {
  link: { content: schema.content.text({ min: 1 }), inline: true },
  paragraph: schema.element.textBlock(),
  quote: { content: schema.content.type('paragraph', { min: 1 }) },
} as const;
const quoteRoot = (min: number) =>
  schema.content.any(
    [schema.content.type('paragraph'), schema.content.type('quote')],
    { default: { type: 'paragraph' }, min }
  );
const Quotes = defineEditorSchema('recording-laws', {
  elements: quoteElements,
  id: 'recording-laws',
  root: quoteRoot(1),
  unknown: 'reject',
  version: 1,
});
const LETTERS = 'abcdefghijkl';

/** A refused update reports and returns; the laws handle it as thrown. */
const throwingRefusals = <E>(editor: E) => {
  subscribeEditorRefusals(editor as never, (refusal) => {
    throw new EditorRefusalError(refusal, 'refused');
  });

  return editor;
};
const isRefusal = (error: unknown) =>
  error instanceof EditorSchemaValidationError ||
  error instanceof EditorRefusalError;

const editorFor = (
  initialValue: readonly Node[] | Readonly<{ children: readonly Node[] }>,
  author: string,
  intent: 'edit' | 'propose' | 'plain',
  changeId: string | (() => string),
  withSchema: boolean | typeof Quotes = true,
  withHistory = false
) =>
  throwingRefusals(
    createEditor({
      plugins: [
        ...(withSchema === true ? [Quotes] : withSchema ? [withSchema] : []),
        ...(withHistory ? [historyPlugin()] : []),
        transfer(),
        // Plain editing reads review marks as ordinary properties, so a
        // document holding suggestions loads, and nothing records.
        intent === 'plain'
          ? definePlugin('recording-laws-marks', {
              schema: authoredMarksSchema,
            })
          : createAuthoredPlugin({
              authorId: author,
              createChangeId:
                typeof changeId === 'string' ? () => changeId : changeId,
              intent,
              now: () => 1,
            }),
      ],
      initialValue: initialValue as never,
    })
  );

const texts = (children: readonly Node[]) =>
  [...NodeApi.texts({ children } as never)] as Array<[Node, number[]]>;
// The children of the root an editor edits, a root view's own included.
const rootChildren = (editor: Editor) =>
  valueRoot(
    expandContexts(editor.read.value() as unknown as JsonEditorValue),
    (editor as { root?: string }).root ?? 'main'
  ) as readonly Node[];
const locate = (editor: Editor, letter: string) => {
  for (const [node, path] of texts(rootChildren(editor))) {
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
    case 'nest':
    case 'break':
    case 'paste': {
      if (!at) return false;
      const caret = { offset: at.offset + command.side, path: at.path };

      editor.update((tx) => {
        tx.selection.set({ anchor: caret, focus: caret });
        if (command.kind === 'type') tx.text.insert(typed);
        else if (command.kind === 'nest') {
          tx.text.insert(typed + typed.toLowerCase());
        } else if (command.kind === 'break') tx.break.insert();
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
        rootChildren(editor)[getDefined(block[0])]?.type !== 'quote'
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
      const children = rootChildren(editor);
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

  return expandedChildren(editor) as readonly Node[];
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
const editArbitrary = fc.record({
  author: fc.constantFrom('alice' as const, 'bob' as const),
  command: commandArbitrary(LETTERS.slice(0, 8)),
  intent: fc.constantFrom('edit' as const, 'propose' as const),
});
// Proposals by four authors, each typing a two-letter word, its letter and
// its lowercase twin, into or beside a word an earlier one typed, so
// insertions nest and meet at their edges, nested or not.
const nestingArbitrary = fc.array(
  fc.record({
    author: fc.constantFrom(
      'alice' as const,
      'bob' as const,
      'dan' as const,
      'erin' as const
    ),
    command: fc.record({
      at: letterArbitrary('abcdMNOPmnop'),
      kind: fc.constant('nest' as const),
      side: fc.constantFrom(0, 1),
    }),
    intent: fc.constant('propose' as const),
  }),
  { maxLength: 4, minLength: 2 }
);
const withNesting = (edits: fc.Arbitrary<Edit[]>) =>
  fc.oneof(
    { arbitrary: edits, weight: 2 },
    {
      arbitrary: fc
        .tuple(nestingArbitrary, edits)
        .map(([nesting, rest]) => [...nesting, ...rest.slice(0, 1)]),
      weight: 1,
    }
  );
const historyArbitrary = withNesting(
  fc.array(editArbitrary, { maxLength: 3, minLength: 0 })
);

const projection = (value: readonly Node[], read: 'accepted' | 'proposed') =>
  authoredTestApi(editorFor(value, 'carol', 'edit', 'carol:1')).project(read)
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

/**
 * A text write run in a plain editor on the document accepting everything
 * gives, when each letter it targets appears once in `before`, unstruck, so
 * the letter names the same position in both documents, and `before` holds no
 * pending join; null otherwise.
 */
const onProposed = (before: readonly Node[], command: Command) => {
  if (
    command.kind !== 'deleteRange' &&
    command.kind !== 'typeOver' &&
    command.kind !== 'type'
  ) {
    return null;
  }

  const letters = 'at' in command ? [command.at] : [command.from, command.to];
  const holders = (letter: string) =>
    texts(before).filter(([node]) => node.text?.includes(letter));

  if (
    letters.some((letter) => {
      const found = holders(letter);

      return (
        found.length !== 1 ||
        found[0][0].text?.indexOf(letter) !==
          found[0][0].text?.lastIndexOf(letter) ||
        readAuthoredMarks(found[0][0]).some((mark) => mark.kind === 'delete')
      );
    })
  ) {
    return null;
  }

  const joins = (nodes: readonly Node[]): boolean =>
    nodes.some(
      (node) =>
        readAuthoredMarks(node).some((mark) => mark.kind === 'join') ||
        joins(node.children ?? [])
    );

  // A limit: a pending join keeps two blocks where the proposed document
  // holds one, so a range over both removes them where a plain editor keeps
  // an empty block.
  if (joins(before)) return null;

  // A limit: a physical write acts on stored positions as given, so a range
  // across a container's edge keeps the emptied container a plain editor
  // removes. Commands, which decide on the accepted document, cross it.
  const parents = letters.map((letter) =>
    PathApi.parent(PathApi.parent(holders(letter)[0][1])).join(',')
  );

  if (new Set(parents).size > 1) return null;

  const editor = editorFor(
    projection(before, 'proposed'),
    'bob',
    'plain',
    'bob:plain'
  );

  try {
    if (!run(editor, command, TYPED)) return null;
  } catch (error) {
    if (isRefusal(error)) return null;
    throw error;
  }

  return expandedChildren(editor) as readonly Node[];
};

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
const moveJoinTarget = [
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
      author: 'alice',
      command: { from: 'h', kind: 'deleteRange', to: 'a' },
      intent: 'propose',
    },
    {
      author: 'alice',
      command: {
        at: 'a',
        edge: 'before',
        kind: 'transferNode',
        to: 'g',
      },
      intent: 'edit',
    },
  ],
  { from: 'a', kind: 'deleteRange', to: 'a' },
] as never;
const joinPastMovedLine = [
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
      author: 'alice',
      command: { from: 'h', kind: 'deleteRange', to: 'c' },
      intent: 'propose',
    },
    {
      author: 'alice',
      command: {
        at: 'a',
        edge: 'before',
        kind: 'transferNode',
        to: 'g',
      },
      intent: 'edit',
    },
  ],
  { from: 'c', kind: 'deleteRange', to: 'c' },
] as never;
const joinIntoJoiningLine = [
  [
    {
      type: 'quote',
      children: [{ type: 'paragraph', children: [{ text: 'ab' }] }],
    },
    { type: 'paragraph', children: [{ text: 'cd' }] },
    { type: 'paragraph', children: [{ text: 'ef' }] },
  ],
  [
    {
      author: 'alice',
      command: { at: 'd', direction: 'backward', kind: 'delete' },
      intent: 'propose',
    },
    {
      author: 'alice',
      command: { from: 'd', kind: 'deleteRange', to: 'e' },
      intent: 'edit',
    },
  ],
  { at: 'c', direction: 'backward', kind: 'delete' },
] as never;

type RecordedLaw = (
  recorded: Readonly<{
    before: readonly Node[];
    command: Command;
    edited: readonly Node[];
    history: ReadonlyArray<Readonly<{ command: Command }>>;
    suggested: readonly Node[];
  }>
) => void;
type Prepare = (value: readonly Node[]) => readonly Node[];

/**
 * Runs `command` as Bob in both intents on the document `history` gives
 * `initial`, and checks `law` on the results. False when the command does
 * not apply in both.
 */
const recordedCase =
  (law: RecordedLaw, prepare: Prepare = (value) => value) =>
  (
    initial: readonly Node[],
    history: readonly Edit[],
    command: Command
  ): boolean => {
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

    if (!suggested || !edited) return false;
    law({ before, command, edited, history, suggested });

    return true;
  };

const RECORDED_SEED = process.env.PLITE_RECORDED_SEED;

/**
 * Runs one generated command as Bob in both intents on a document a generated
 * history of Alice's and Bob's edits produced, and checks `law` on the
 * results when the command applies in both.
 */
const recordedCommands = (
  law: RecordedLaw,
  numRuns: number,
  prepare?: Prepare,
  seed?: number
) => {
  const runSeed = RECORDED_SEED === undefined ? seed : Number(RECORDED_SEED);
  let compared = 0;
  const recorded = recordedCase(law, prepare);

  fc.assert(
    fc.property(
      documentArbitrary,
      historyArbitrary,
      commandArbitrary(LETTERS.slice(0, 8)),
      (initial, history, command) => {
        if (recorded(initial, history, command)) compared += 1;
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
        moveJoinTarget,
        joinPastMovedLine,
        joinIntoJoiningLine,
      ],
      numRuns: Number(process.env.PLITE_RECORDED_RUNS ?? numRuns),
      ...(runSeed === undefined ? {} : { seed: runSeed }),
    }
  );

  return compared;
};

type Caret = Readonly<{ letter: string; side: 0 | 1 }>;
type CommandStep =
  | Readonly<{
      at: Caret;
      direction: 'backward' | 'forward';
      kind: 'delete';
      unit: 'character' | 'line' | 'word';
    }>
  | Readonly<{ at: Caret; kind: 'break' | 'type' }>
  | Readonly<{
      direction: 'backward' | 'forward';
      from: Caret;
      kind: 'fragment';
      to: Caret;
    }>;
type TextBlock = Readonly<{ path: number[]; text: string }>;

const caretArbitrary = fc.record({
  letter: letterArbitrary(LETTERS.slice(0, 8)),
  side: fc.constantFrom(0 as const, 1 as const),
});
const directionArbitrary = fc.constantFrom(
  'backward' as const,
  'forward' as const
);
const stepArbitrary: fc.Arbitrary<CommandStep> = fc.oneof(
  fc.record({
    at: caretArbitrary,
    direction: directionArbitrary,
    kind: fc.constant('delete' as const),
    unit: fc.constantFrom(
      'character' as const,
      'line' as const,
      'word' as const
    ),
  }),
  fc.record({
    at: caretArbitrary,
    kind: fc.constantFrom('break' as const, 'type' as const),
  }),
  fc.record({
    direction: directionArbitrary,
    from: caretArbitrary,
    kind: fc.constant('fragment' as const),
    to: caretArbitrary,
  })
);

const runStep = (
  editor: Editor,
  selection: Readonly<{ anchor: Point; focus: Point }>,
  step: CommandStep
) =>
  editor.update((tx) => {
    tx.selection.set(selection);
    if (step.kind === 'delete') {
      tx.command(editorCommands.delete, {
        direction: step.direction,
        unit: step.unit,
      });
    } else if (step.kind === 'fragment') {
      tx.command(editorCommands.deleteFragment, { direction: step.direction });
    } else if (step.kind === 'break') {
      tx.command(editorCommands.insertBreak);
    } else {
      tx.command(editorCommands.insertText, { text: TYPED });
    }
  });

const textBlocks = (
  nodes: readonly Node[],
  path: readonly number[] = []
): TextBlock[] =>
  nodes.flatMap((node, index) => {
    if (!node.children) return [];

    const at = [...path, index];

    return node.children.every((child) => typeof child.text === 'string')
      ? [{ path: at, text: node.children.map((child) => child.text).join('') }]
      : textBlocks(node.children, at);
  });

const MARKER = '¶';

/** `value` with a live, unmarked marker letter at `point`. */
const withMarker = (value: readonly Node[], point: Point): Node[] => {
  const clone = structuredClone(value) as Node[];
  const parent = point.path
    .slice(0, -1)
    .reduce<Node>((node, index) => getDefined(node.children)[index], {
      children: clone,
    });
  const children = getDefined(parent.children) as Node[];
  const leafIndex = getDefined(point.path.at(-1));
  const leaf = children[leafIndex];
  const text = leaf.text ?? '';

  children.splice(
    leafIndex,
    1,
    ...[
      { ...leaf, text: text.slice(0, point.offset) },
      { text: MARKER },
      { ...leaf, text: text.slice(point.offset) },
    ].filter((node) => node.text !== '')
  );

  return clone;
};

const isStruck = (node: Node) =>
  readAuthoredMarks(node).some((mark) => mark.kind === 'delete');
const survives = (node: Node): boolean =>
  !isStruck(node) || (node.children ?? []).some(survives);

/**
 * Where accepting everything puts a stored point: a text block, counted in
 * document order, and an offset in its text, read by projecting a live marker
 * put there. A caret in a line that does not survive lands as a text write
 * does, at the nearest surviving line beside it in its parent, the one before
 * first. A range's start in such a line moves to the next live line, and its
 * end, like a caret with no such neighbor, to the end of the live line before.
 */
const acceptedSpot = (
  before: readonly Node[],
  point: Point,
  lean: 'ahead' | 'back' | 'caret'
): Readonly<{ block: number; offset: number }> => {
  const nodeAt = (path: readonly number[]) =>
    path.reduce<Node | undefined>((node, index) => node?.children?.[index], {
      children: before,
    });
  const edgeOf = (path: number[], backward: boolean): Point | null => {
    const node = getDefined(nodeAt(path));

    if (typeof node.text === 'string') {
      return { offset: backward ? node.text.length : 0, path };
    }
    if (!survives(node)) return null;

    const children = node.children ?? [];

    for (
      let index = backward ? children.length - 1 : 0;
      index >= 0 && index < children.length;
      index += backward ? -1 : 1
    ) {
      const found = edgeOf([...path, index], backward);

      if (found) return found;
    }

    return null;
  };
  const gone = point.path
    .slice(0, -1)
    .map((_, depth) => point.path.slice(0, depth + 1))
    .find((path) => !survives(getDefined(nodeAt(path))));
  // The start of the line completion gives where the gone node stood.
  const completed = (path: readonly number[]) => {
    const replace = (nodes: readonly Node[], at: readonly number[]): Node[] =>
      nodes.map((node, index) =>
        index !== at[0]
          ? node
          : at.length === 1
            ? { children: [{ text: MARKER }], type: 'paragraph' }
            : { ...node, children: replace(node.children ?? [], at.slice(1)) }
      );
    const blocks = textBlocks(projection(replace(before, path), 'proposed'));

    return {
      block: blocks.findIndex(({ text }) => text.includes(MARKER)),
      offset: 0,
    };
  };

  if (gone && lean === 'caret') {
    const parent = gone.slice(0, -1);
    const at = getDefined(gone.at(-1));

    for (const step of [-1, 1]) {
      for (let index = at + step; nodeAt([...parent, index]); index += step) {
        const landed = edgeOf([...parent, index], step < 0);

        if (landed) return acceptedSpot(before, landed, lean);
      }
    }

    // A container whose lines are all gone keeps the line completion gives
    // it, and the caret stays in that line.
    if (gone.length > 1) return completed(gone);
  }
  if (gone) {
    const lines = textBlocks(before).filter(({ path }) =>
      survives(getDefined(nodeAt(path)))
    );
    const previous = lines.findLast(
      ({ path }) => PathApi.compare(path, point.path) < 0
    );
    const next = lines.find(
      ({ path }) => PathApi.compare(path, point.path) > 0
    );
    const landing =
      lean === 'ahead'
        ? ((next && edgeOf(next.path, false)) ??
          (previous && edgeOf(previous.path, true)))
        : ((previous && edgeOf(previous.path, true)) ??
          (next && edgeOf(next.path, false)));

    if (landing) return acceptedSpot(before, landing, lean);

    // With no line left, every place is a line completion gives: the nearest
    // top-level container's that stays, else the root's.
    if (gone.length === 1) {
      for (const step of [-1, 1]) {
        for (
          let index = gone[0] + step;
          index >= 0 && index < before.length;
          index += step
        ) {
          if (survives(before[index])) return completed([index, 0]);
        }
      }
    }

    return completed(gone);
  }

  const blocks = textBlocks(projection(withMarker(before, point), 'proposed'));
  const block = blocks.findIndex(({ text }) => text.includes(MARKER));

  return { block, offset: blocks[block].text.indexOf(MARKER) };
};

const isStruckLeaf = (node: Node) =>
  typeof node.text === 'string' &&
  readAuthoredMarks(node).some((mark) => mark.kind === 'delete');
const mostJoins = (nodes: readonly Node[]): number =>
  Math.max(
    0,
    ...nodes.map((node) =>
      Math.max(
        readAuthoredMarks(node).filter((mark) => mark.kind === 'join').length,
        mostJoins(node.children ?? [])
      )
    )
  );
const decided = (
  value: readonly Node[],
  action: 'accept' | 'reject',
  changes = changesIn(value)
) => {
  const editor = editorFor(value, 'carol', 'edit', 'carol:1');
  const result =
    changes.length > 0
      ? authoredTestApi(editor).decide({ action, changes })
      : { status: 'unchanged' as const };

  return {
    status: result.status,
    value: reviewedValue(editor).children as readonly Node[],
  };
};

/**
 * Accepting everything after Bob's command, in either intent, gives what a
 * plain editor gives on the accepted document, and accepting or rejecting
 * everything applies. `counts.plain` counts the plain-editor comparisons.
 */
const acceptsLikePlainEditor =
  (counts: { plain: number }): RecordedLaw =>
  ({ before, command, edited, suggested }) => {
    const plain = onProposed(before, command);

    if (plain) {
      counts.plain += 1;
      assert.deepEqual(projection(suggested, 'proposed'), plain);
      assert.deepEqual(projection(edited, 'proposed'), plain);
    }
    for (const action of ['accept', 'reject'] as const) {
      const editor = editorFor(suggested, 'carol', 'edit', 'carol:1');
      const result = authoredTestApi(editor).decide({
        action,
        changes: changesIn(suggested),
      });

      assert.equal(
        result.status,
        changesIn(suggested).length > 0 ? 'applied' : 'unchanged',
        `${action} everything did not apply: ${JSON.stringify(suggested)}`
      );
    }
  };

const commandCounts = () => ({
  blocked: 0,
  compared: 0,
  joined: 0,
  struckEnd: 0,
});

/**
 * Runs `step` as Bob, in `intent`, on the document `history` gives
 * `initial` and on a plain editor holding its accepted form: accepting
 * everything gives what the plain editor gives, before and after a letter
 * typed next.
 */
const commandCase =
  (counts: ReturnType<typeof commandCounts>) =>
  (
    initial: readonly Node[],
    history: readonly Edit[],
    step: CommandStep,
    intent: 'edit' | 'propose'
  ): void => {
    const before = replay(initial, history);
    const stored = (caret: Caret) => {
      const found = locate(
        editorFor(before, 'bob', 'plain', 'bob:plain'),
        caret.letter
      );

      return found && { ...found, offset: found.offset + caret.side };
    };
    const ends =
      step.kind === 'fragment'
        ? [stored(step.from), stored(step.to)]
        : [stored(step.at), stored(step.at)];
    const [anchor, focus] = ends;

    if (!anchor || !focus) return;

    const accepted = textBlocks(projection(before, 'proposed'));
    const plainPoint = ({
      block,
      offset,
    }: ReturnType<typeof acceptedSpot>) => ({
      offset,
      path: [...accepted[block].path, 0],
    });
    const caretAt = (point: Point) =>
      plainPoint(acceptedSpot(before, point, 'caret'));
    const backward = PointApi.compare(anchor, focus) > 0;
    const [start, end] = backward ? [focus, anchor] : [anchor, focus];
    const from = acceptedSpot(before, start, 'ahead');
    const to = acceptedSpot(before, end, 'back');
    const crossed =
      from.block > to.block ||
      (from.block === to.block && from.offset >= to.offset);
    const plainSelection = crossed
      ? { anchor: caretAt(start), focus: caretAt(start) }
      : backward
        ? { anchor: plainPoint(to), focus: plainPoint(from) }
        : { anchor: plainPoint(from), focus: plainPoint(to) };
    const plain = editorFor(
      projection(before, 'proposed'),
      'bob',
      'plain',
      'bob:plain'
    );

    try {
      runStep(plain, plainSelection, step);
    } catch (error) {
      if (isRefusal(error)) return;
      throw error;
    }

    const review = editorFor(before, 'bob', intent, 'bob:last');
    const context = JSON.stringify({ before, intent, step });

    runStep(review, { anchor, focus }, step);
    const after = expandedChildren(review) as readonly Node[];

    counts.compared += 1;
    if (holdsMark(before, 'join')) counts.joined += 1;
    if (
      [anchor, focus].some((point) =>
        isStruckLeaf(
          getDefined(
            editorFor(before, 'bob', 'plain', 'bob:plain').read.nodes.get(
              point.path
            )
          )[0] as Node
        )
      )
    ) {
      counts.struckEnd += 1;
    }
    const sameAsPlain = (label: string, value: readonly Node[]) => {
      const acceptedValue = projection(value, 'proposed');
      const expected = expandedChildren(plain);

      assert.deepEqual(
        acceptedValue,
        expected,
        `${label}: ${context} gives ${JSON.stringify(acceptedValue)}, not ${JSON.stringify(expected)}`
      );
    };

    sameAsPlain('accepting everything differs from the plain editor', after);
    assert.ok(mostJoins(after) <= 1, `a line carries two joins: ${context}`);
    if (intent === 'propose') {
      // Bob's command can grow or withdraw his own earlier suggestions,
      // so rejecting all of his changes is what gives back the start.
      const bob = (value: readonly Node[]) =>
        changesIn(value).filter((change) => change.startsWith('bob:'));
      const rejected = decided(after, 'reject', bob(after));
      const original = decided(before, 'reject', bob(before));

      assert.deepEqual(
        decided(after, 'reject').value,
        decided(before, 'reject').value,
        `rejecting everything differs: ${context}`
      );
      if (rejected.status === 'blocked' || original.status === 'blocked') {
        counts.blocked += 1;
      } else {
        assert.deepEqual(
          rejected.value,
          original.value,
          `rejecting Bob's changes does not give back the original: ${context}`
        );
      }
    } else {
      const left = letterCounts(after);

      // Editing decides only Bob's own suggestions.
      for (const [node] of texts(before).filter(
        ([leaf]) =>
          isStruckLeaf(leaf) &&
          readAuthoredMarks(leaf).some(
            (mark) => mark.kind === 'delete' && mark.author !== 'bob'
          )
      )) {
        for (const letter of node.text ?? '') {
          assert.ok(
            left.has(letter),
            `Editing removed Alice's struck "${letter}": ${context}`
          );
        }
      }
    }

    for (const editor of [review, plain]) {
      editor.update((tx) =>
        tx.command(editorCommands.insertText, { text: 'Y' })
      );
    }
    sameAsPlain(
      'a letter typed next lands elsewhere',
      expandedChildren(review)
    );
  };

/**
 * Typed text carries no deletion, no letter doubles, no letter of another
 * author's insertion is lost, and rejecting everything after Bob's command
 * gives what rejecting everything before it gives.
 */
const undoesSuggestion: RecordedLaw = ({ before, edited, suggested }) => {
  const childless = (nodes: readonly Node[]): boolean =>
    nodes.some(
      (node) =>
        typeof node.text !== 'string' &&
        ((node.children ?? []).length === 0 || childless(node.children ?? []))
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
    for (const [letter, count] of letterCounts(projection(suggested, read))) {
      assert.ok(count <= 1, `${letter} doubled in ${read}`);
    }
  }
  const kept = letterCounts(suggested);

  const carried = carriedIn({ children: before });

  for (const [node] of texts(before)) {
    const inserter = outerToInner(
      readAuthoredMarks(node).filter((mark) => mark.kind === 'insert'),
      carried
    ).at(-1)?.author;

    if (inserter === undefined || inserter === 'bob') continue;
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
};

/**
 * Undoing Bob’s commands and a decision on every change restores each
 * document before them, and redoing restores each result.
 */
const undoRestores = (
  initial: readonly Node[],
  edits: readonly Edit[],
  commands: readonly Command[],
  intent: 'edit' | 'propose',
  action: 'accept' | 'reject'
): 'compared' | 'unchanged' => {
  let minted = 0;
  const editor = editorFor(
    replay(initial, edits),
    'bob',
    intent,
    () => `bob:${(minted += 1)}`,
    true,
    true
  );
  const states = [expandedChildren(editor)];

  for (const [index, command] of commands.entries()) {
    try {
      if (!run(editor, command, 'XYZ'[index])) continue;
    } catch (error) {
      if (isRefusal(error)) break;
      throw error;
    }
    if (!isDeepStrictEqual(expandedChildren(editor), states.at(-1))) {
      states.push(expandedChildren(editor));
    }
  }
  if (states.length < 2) return 'unchanged';

  const label = `in ${intent} after ${JSON.stringify(commands)}`;
  // History may merge adjacent commands into one step, and a command
  // that leaves the document as it was may still take one, so each
  // step lands on the same, an earlier, or a later recorded document.
  const walk = (direction: 'redo' | 'undo') => {
    const ahead = direction === 'undo' ? -1 : 1;
    const last = direction === 'undo' ? 0 : states.length - 1;
    const pending = () =>
      direction === 'undo'
        ? editor.read.history.hasUndo()
        : editor.read.history.hasRedo();
    let at = states.length - 1 - last;

    while (pending()) {
      editor.api.history[direction]();
      while (
        at >= 0 &&
        at < states.length &&
        !isDeepStrictEqual(states[at], expandedChildren(editor))
      ) {
        at += ahead;
      }
      assert.ok(
        at >= 0 && at < states.length,
        `${direction} ${label} gave ${JSON.stringify(expandedChildren(editor))}`
      );
    }
    assert.equal(at, last, `${direction} ${label} stopped early`);
  };

  walk('undo');
  walk('redo');

  const last = expandedChildren(editor);
  const decision = authoredTestApi(editor).decide({
    action,
    changes: changesIn(last),
  });

  if (decision.status !== 'applied') return 'compared';

  const after = expandedChildren(editor);

  editor.api.history.undo();
  assert.deepEqual(expandedChildren(editor), last, `undo ${action} ${label}`);
  editor.api.history.redo();
  assert.deepEqual(expandedChildren(editor), after, `redo ${action} ${label}`);
  return 'compared';
};

type LedgerStep =
  | Readonly<{
      command: Command;
      intent: 'edit' | 'propose';
      kind: 'command';
    }>
  // A command the authored plugin frames, as a key runs, and whose write
  // the review ledger takes as its next projection.
  | Readonly<{
      intent: 'edit' | 'propose';
      kind: 'framed';
      mustApply?: true;
      step: CommandStep;
    }>
  | Readonly<{ kind: 'redo' | 'undo' }>
  | Readonly<{ action: 'accept' | 'reject'; kind: 'decide' }>;

const settles = ({
  command,
  intent,
}: Readonly<{ command: Command; intent: 'edit' | 'propose' }>) =>
  command.kind !== 'unwrap' || intent !== 'propose';

const ledgerStepArbitrary: fc.Arbitrary<LedgerStep> = fc.oneof(
  {
    arbitrary: fc.record({
      command: commandArbitrary(LETTERS.slice(0, 8)),
      intent: fc.constantFrom('edit' as const, 'propose' as const),
      kind: fc.constant('command' as const),
    }),
    weight: 5,
  },
  {
    arbitrary: fc.record({
      intent: fc.constantFrom('edit' as const, 'propose' as const),
      kind: fc.constant('framed' as const),
      step: stepArbitrary,
    }),
    weight: 4,
  },
  {
    arbitrary: fc.record({
      kind: fc.constantFrom('redo' as const, 'undo' as const),
    }),
    weight: 2,
  },
  {
    arbitrary: fc.record({
      action: fc.constantFrom('accept' as const, 'reject' as const),
      kind: fc.constant('decide' as const),
    }),
    weight: 1,
  }
);

// Lines holding no command letter, so a window lands among blocks the
// ledger keeps and a long document builds sequences more than one level deep.
const filler = (count: number, prefix: string): Node[] =>
  Array.from({ length: count }, (_, index) => ({
    children: [{ text: `${prefix}${index}` }],
    type: 'paragraph',
  }));

type LedgerValue = Readonly<{
  children: readonly Node[];
  roots: Readonly<Record<string, readonly Node[]>>;
}>;

/** A root the ledger law edits: its schema, its start and the root its commands edit. */
type LedgerRoot = Readonly<{
  /** Cases the law always runs before its random ones, by what each covers. */
  examples?: Readonly<
    Record<
      string,
      [readonly Node[], readonly Edit[], number, readonly LedgerStep[]]
    >
  >;
  /** The most filler lines the start adds. */
  padding: number;
  plugin: typeof Quotes;
  root?: string;
  start: (
    blocks: readonly Node[],
    padding: number
  ) => readonly Node[] | LedgerValue;
}>;

const movedBetweenJoin = (
  step: CommandStep,
  intent: 'edit' | 'propose' = 'edit'
): [readonly Node[], readonly Edit[], number, readonly LedgerStep[]] => [
  [
    { children: [{ text: 'ab' }], type: 'paragraph' },
    {
      children: [
        { children: [{ text: 'cd' }], type: 'paragraph' },
        { children: [{ text: 'ef' }], type: 'paragraph' },
      ],
      type: 'quote',
    },
  ],
  [
    {
      author: 'alice',
      command: { at: 'e', direction: 'backward', kind: 'delete' },
      intent: 'propose',
    },
  ],
  0,
  [
    {
      command: { at: 'a', edge: 'before', kind: 'moveNode', to: 'f' },
      intent: 'edit',
      kind: 'command',
    },
    { intent, kind: 'framed', mustApply: true, step },
  ],
];

const MAIN_ROOT: LedgerRoot = {
  examples: {
    "Alice's two nest proposals keep their cards through a proposed deletion and a move":
      [
        [
          { children: [{ text: 'ab' }], type: 'paragraph' },
          { children: [{ text: 'cd' }], type: 'paragraph' },
        ],
        [
          {
            author: 'alice',
            command: { at: 'a', kind: 'nest', side: 0 },
            intent: 'propose',
          },
          {
            author: 'alice',
            command: { at: 'a', kind: 'nest', side: 0 },
            intent: 'propose',
          },
        ],
        0,
        [
          {
            command: { from: 'a', kind: 'deleteRange', to: 'a' },
            intent: 'propose',
            kind: 'command',
          },
          {
            command: { at: 'a', edge: 'after', kind: 'moveNode', to: 'a' },
            intent: 'edit',
            kind: 'command',
          },
        ],
      ],
    "Alice's two cards become one once the letter between them goes": [
      [{ children: [{ text: 'ab' }], type: 'paragraph' }],
      [
        {
          author: 'alice',
          command: { at: 'a', kind: 'type', side: 1 },
          intent: 'propose',
        },
        {
          author: 'alice',
          command: { at: 'b', kind: 'type', side: 1 },
          intent: 'propose',
        },
      ],
      0,
      [
        {
          command: { at: 'b', direction: 'forward', kind: 'delete' },
          intent: 'edit',
          kind: 'command',
        },
      ],
    ],
    'B3 Backspace merges a moved line into the joined line': movedBetweenJoin({
      at: { letter: 'a', side: 0 },
      direction: 'backward',
      kind: 'delete',
      unit: 'character',
    }),
    'B4 a range deletion merges the joined line with a moved line':
      movedBetweenJoin({
        direction: 'backward',
        from: { letter: 'd', side: 0 },
        kind: 'fragment',
        to: { letter: 'b', side: 0 },
      }),
    'J1 a Suggesting line deletion crosses the joined text around a moved line':
      movedBetweenJoin(
        {
          at: { letter: 'f', side: 0 },
          direction: 'backward',
          kind: 'delete',
          unit: 'line',
        },
        'propose'
      ),
    'a line split off a joined line, moved above its join with a line between':
      [
        [
          { children: [{ text: 'ab' }], type: 'paragraph' },
          { children: [{ text: 'cd' }], type: 'paragraph' },
          {
            children: [
              { children: [{ text: 'ef' }], type: 'paragraph' },
              { children: [{ text: 'gh' }], type: 'paragraph' },
            ],
            type: 'quote',
          },
        ],
        [
          {
            author: 'alice',
            command: { at: 'g', direction: 'backward', kind: 'delete' },
            intent: 'propose',
          },
          {
            author: 'alice',
            command: { at: 'g', kind: 'paste', side: 0 },
            intent: 'edit',
          },
        ],
        0,
        [
          {
            command: { at: 'g', edge: 'after', kind: 'moveNode', to: 'a' },
            intent: 'edit',
            kind: 'command',
          },
        ],
      ],
    // Alice's pending join pulls `cd` up into the quote's `ab`, and Bob's
    // Enter leaves `d` following it.
    'a line moved between a join target and its joined line, undone, redone and decided':
      [
        [
          {
            children: [{ children: [{ text: 'ab' }], type: 'paragraph' }],
            type: 'quote',
          },
          { children: [{ text: 'cd' }], type: 'paragraph' },
          { children: [{ text: 'ef' }], type: 'paragraph' },
        ],
        [
          {
            author: 'alice',
            command: { at: 'c', direction: 'backward', kind: 'delete' },
            intent: 'propose',
          },
          {
            author: 'bob',
            command: { at: 'd', kind: 'break', side: 0 },
            intent: 'propose',
          },
        ],
        0,
        [
          {
            command: { at: 'e', edge: 'before', kind: 'moveNode', to: 'c' },
            intent: 'edit',
            kind: 'command',
          },
          { kind: 'undo' },
          { kind: 'redo' },
          { action: 'accept', kind: 'decide' },
        ],
      ],
    'keys typed in a paragraph pasted above a joined line and in its follower':
      [
        [
          {
            children: [{ children: [{ text: 'ab' }], type: 'paragraph' }],
            type: 'quote',
          },
          { children: [{ text: 'cd' }], type: 'paragraph' },
          { children: [{ text: 'ef' }], type: 'paragraph' },
        ],
        [
          {
            author: 'alice',
            command: { at: 'c', direction: 'backward', kind: 'delete' },
            intent: 'propose',
          },
          {
            author: 'bob',
            command: { at: 'd', kind: 'break', side: 0 },
            intent: 'propose',
          },
          {
            author: 'alice',
            command: { at: 'b', kind: 'paste', side: 1 },
            intent: 'propose',
          },
        ],
        0,
        [
          {
            intent: 'propose',
            kind: 'framed',
            step: { at: { letter: 'o', side: 1 }, kind: 'type' },
          },
          {
            intent: 'edit',
            kind: 'framed',
            step: { at: { letter: 'd', side: 0 }, kind: 'type' },
          },
          { kind: 'undo' },
          { action: 'reject', kind: 'decide' },
        ],
      ],
    // Bob's Editing join of `gh` waits on Alice's deletion of `cd`, and his
    // Editing split left `ij` following it past a paragraph that goes with no
    // join, so Accepted shows `ij` above `kl` too.
    'a key typed between an Editing join and its Editing follower': [
      [
        { children: [{ text: 'ab' }], type: 'paragraph' },
        {
          authored: [
            { at: 1, author: 'alice', change: 'alice:0', kind: 'delete' },
          ],
          children: [
            {
              authored: [
                { at: 1, author: 'alice', change: 'alice:0', kind: 'delete' },
              ],
              text: 'cd',
            },
          ],
          type: 'paragraph',
        },
        {
          authored: [
            { at: 1, author: 'bob', change: '~edit:bob', kind: 'join' },
          ],
          children: [{ text: 'gh' }],
          type: 'paragraph',
        },
        { children: [{ text: 'kl' }], type: 'paragraph' },
        {
          authored: [
            {
              at: 1,
              author: 'bob',
              change: '~edit:bob',
              follows: JSON.stringify(['~edit:bob', 1]),
              kind: 'split',
            },
          ],
          children: [{ text: 'ij' }],
          type: 'paragraph',
        },
      ],
      [],
      0,
      [
        {
          intent: 'propose',
          kind: 'framed',
          step: { at: { letter: 'k', side: 1 }, kind: 'type' },
        },
        { kind: 'undo' },
        { action: 'accept', kind: 'decide' },
      ],
    ],
    // Rejecting Bob's deletion of every line leaves each held, so the quote
    // shows its line as stored after an Editing deletion inside it.
    'an Editing deletion inside a quote whose line a rejected deletion holds': [
      [
        {
          children: [{ children: [{ text: 'ab' }], type: 'paragraph' }],
          type: 'quote',
        },
        { children: [{ text: 'cd' }], type: 'paragraph' },
        { children: [{ text: 'ef' }], type: 'paragraph' },
      ],
      [
        {
          author: 'alice',
          command: { at: 'd', kind: 'nest', side: 0 },
          intent: 'propose',
        },
        {
          author: 'alice',
          command: { at: 'M', kind: 'nest', side: 0 },
          intent: 'propose',
        },
        {
          author: 'alice',
          command: { at: 'O', kind: 'nest', side: 0 },
          intent: 'propose',
        },
      ],
      0,
      [
        {
          intent: 'propose',
          kind: 'framed',
          step: {
            direction: 'backward',
            from: { letter: 'f', side: 0 },
            kind: 'fragment',
            to: { letter: 'a', side: 0 },
          },
        },
        { action: 'reject', kind: 'decide' },
        {
          intent: 'edit',
          kind: 'framed',
          step: {
            direction: 'backward',
            from: { letter: 'a', side: 0 },
            kind: 'fragment',
            to: { letter: 'a', side: 1 },
          },
        },
      ],
    ],
    // The quote Bob wraps around his moved line shows after that line, which
    // follows Alice's join, so the struck joined line shows in the line it
    // joins and the deletion's end lies there, before the moved line.
    'a deletion into a struck joined line whose follower was wrapped in a quote':
      [
        [
          { children: [{ text: 'ab' }], type: 'paragraph' },
          { children: [{ text: 'cd' }], type: 'paragraph' },
          { children: [{ text: 'ef' }], type: 'paragraph' },
          { children: [{ text: 'gh' }], type: 'paragraph' },
        ],
        [],
        0,
        [
          {
            command: { from: 'f', kind: 'deleteRange', to: 'h' },
            intent: 'propose',
            kind: 'command',
          },
          {
            command: { at: 'c', edge: 'before', kind: 'transferNode', to: 'g' },
            intent: 'edit',
            kind: 'command',
          },
          {
            command: { at: 'd', kind: 'wrap' },
            intent: 'edit',
            kind: 'command',
          },
          {
            intent: 'edit',
            kind: 'framed',
            step: {
              direction: 'backward',
              from: { letter: 'a', side: 1 },
              kind: 'fragment',
              to: { letter: 'h', side: 0 },
            },
          },
        ],
      ],
    // Rejecting the paste merges the line it split off back into the pasted
    // line before the quote, and rejecting the wrap removes that quote, so
    // nothing shows out of its stored order.
    'a proposed quote around a pasted line that rejecting merges back': [
      [
        { children: [{ text: 'ab' }], type: 'paragraph' },
        { children: [{ text: 'cd' }], type: 'paragraph' },
      ],
      [],
      0,
      [
        {
          command: { at: 'a', kind: 'paste', side: 0 },
          intent: 'propose',
          kind: 'command',
        },
        {
          command: { at: 'a', kind: 'wrap' },
          intent: 'propose',
          kind: 'command',
        },
      ],
    ],
    // The same join and follower: a deletion from the struck `e` back to the
    // struck `d` starts inside `ef`, which the deletion strikes whole.
    'a deletion between struck letters of the line a join passes over and its follower':
      [
        [
          {
            children: [{ children: [{ text: 'ab' }], type: 'paragraph' }],
            type: 'quote',
          },
          { children: [{ text: 'cd' }], type: 'paragraph' },
          { children: [{ text: 'ef' }], type: 'paragraph' },
          { children: [{ text: 'gh' }], type: 'paragraph' },
        ],
        [],
        0,
        [
          {
            intent: 'propose',
            kind: 'framed',
            step: {
              direction: 'backward',
              from: { letter: 'd', side: 0 },
              kind: 'fragment',
              to: { letter: 'h', side: 0 },
            },
          },
          {
            command: { at: 'a', edge: 'before', kind: 'moveNode', to: 'g' },
            intent: 'edit',
            kind: 'command',
          },
          {
            intent: 'edit',
            kind: 'framed',
            step: {
              direction: 'backward',
              from: { letter: 'e', side: 0 },
              kind: 'fragment',
              to: { letter: 'd', side: 0 },
            },
          },
        ],
      ],
    // Bob's proposed deletion joins `h` up to `c`, and `ab`, moved between
    // them, follows the join, so a deletion from `a` back to the struck `d`
    // also takes `h` and the boundary before `ab`, which refuses.
    'a deletion from a moved follower back to the struck letters after its join target':
      [
        [
          {
            children: [{ children: [{ text: 'ab' }], type: 'paragraph' }],
            type: 'quote',
          },
          { children: [{ text: 'cd' }], type: 'paragraph' },
          { children: [{ text: 'ef' }], type: 'paragraph' },
          { children: [{ text: 'gh' }], type: 'paragraph' },
        ],
        [],
        0,
        [
          {
            intent: 'propose',
            kind: 'framed',
            step: {
              direction: 'backward',
              from: { letter: 'd', side: 0 },
              kind: 'fragment',
              to: { letter: 'h', side: 0 },
            },
          },
          {
            command: { at: 'a', edge: 'before', kind: 'moveNode', to: 'g' },
            intent: 'edit',
            kind: 'command',
          },
          {
            intent: 'edit',
            kind: 'framed',
            step: {
              direction: 'backward',
              from: { letter: 'a', side: 1 },
              kind: 'fragment',
              to: { letter: 'd', side: 0 },
            },
          },
        ],
      ],
    // Alice's join pulls `cd` up into the quote's `ab`, Bob's Enter leaves
    // `d` following it, and `ef`, moved between them, shows below the joined
    // line, so b|c is the point it was cut from.
    'Enter, a key and Backspace at the point a moved line was cut from inside a joined line':
      [
        [
          {
            children: [{ children: [{ text: 'ab' }], type: 'paragraph' }],
            type: 'quote',
          },
          { children: [{ text: 'cd' }], type: 'paragraph' },
          { children: [{ text: 'ef' }], type: 'paragraph' },
        ],
        [
          {
            author: 'alice',
            command: { at: 'c', direction: 'backward', kind: 'delete' },
            intent: 'propose',
          },
          {
            author: 'bob',
            command: { at: 'd', kind: 'break', side: 0 },
            intent: 'propose',
          },
        ],
        0,
        [
          {
            command: { at: 'e', edge: 'before', kind: 'moveNode', to: 'c' },
            intent: 'edit',
            kind: 'command',
          },
          {
            intent: 'propose',
            kind: 'framed',
            step: { at: { letter: 'b', side: 1 }, kind: 'break' },
          },
          {
            intent: 'propose',
            kind: 'framed',
            step: { at: { letter: 'b', side: 1 }, kind: 'type' },
          },
          {
            intent: 'edit',
            kind: 'framed',
            step: {
              at: { letter: 'c', side: 0 },
              direction: 'backward',
              kind: 'delete',
              unit: 'character',
            },
          },
        ],
      ],
  },
  padding: 40,
  plugin: Quotes,
  start: (blocks, padding) => [
    ...filler(padding >> 1, '0'),
    ...blocks,
    ...filler(padding, '1'),
  ],
};

// Bob's letter in a line he suggested moving makes the gate weigh the window
// of the move's source.
const typedInSuggestedMove: [
  readonly Node[],
  readonly Edit[],
  number,
  readonly LedgerStep[],
] = [
  [
    { children: [{ text: 'ab' }], type: 'paragraph' },
    {
      children: [
        { children: [{ text: 'cd' }], type: 'paragraph' },
        { children: [{ text: 'ef' }], type: 'paragraph' },
      ],
      type: 'quote',
    },
    {
      children: [{ children: [{ text: 'gh' }], type: 'paragraph' }],
      type: 'quote',
    },
  ],
  [],
  0,
  [
    {
      command: { from: 'a', kind: 'typeOver', to: 'e' },
      intent: 'propose',
      kind: 'command',
    },
    {
      command: { at: 'c', edge: 'after', kind: 'transferNode', to: 'h' },
      intent: 'propose',
      kind: 'command',
    },
    {
      intent: 'propose',
      kind: 'framed',
      step: { at: { letter: 'c', side: 1 }, kind: 'type' },
    },
  ],
];

const OTHER_ROOTS: Readonly<Record<string, LedgerRoot>> = {
  // The first paragraph becomes the title, so commands edit it.
  titled: {
    examples: {
      'a suggested Backspace across lines Dan and Erin suggested nesting': [
        [
          {
            children: [
              { children: [{ text: 'ab' }], type: 'paragraph' },
              { children: [{ text: 'cd' }], type: 'paragraph' },
            ],
            type: 'quote',
          },
          { children: [{ text: 'ef' }], type: 'paragraph' },
          { children: [{ text: 'gh' }], type: 'paragraph' },
        ],
        [
          {
            author: 'dan',
            command: { at: 'm', kind: 'nest', side: 1 },
            intent: 'propose',
          },
          {
            author: 'erin',
            command: { at: 'o', kind: 'nest', side: 0 },
            intent: 'propose',
          },
          {
            author: 'alice',
            command: { at: 'h', direction: 'forward', kind: 'delete' },
            intent: 'propose',
          },
        ],
        2,
        [
          {
            intent: 'propose',
            kind: 'framed',
            step: {
              direction: 'backward',
              from: { letter: 'f', side: 1 },
              kind: 'fragment',
              to: { letter: 'c', side: 1 },
            },
          },
        ],
      ],
      'an inserted line left first fits no title, so the root completes nothing':
        [
          [
            { children: [{ text: 'ab' }], type: 'paragraph' },
            { children: [{ text: 'cd' }], type: 'paragraph' },
            { children: [{ text: 'ef' }], type: 'paragraph' },
            {
              children: [{ children: [{ text: 'gh' }], type: 'paragraph' }],
              type: 'quote',
            },
          ],
          [
            {
              author: 'alice',
              command: { from: 'a', kind: 'deleteRange', to: 'g' },
              intent: 'propose',
            },
          ],
          0,
          [{ action: 'accept', kind: 'decide' }],
        ],
    },
    padding: 2,
    plugin: defineEditorSchema('recording-laws-titled', {
      elements: { ...quoteElements, title: schema.element.textBlock() },
      id: 'recording-laws-titled',
      root: schema.content.prefix([{ element: 'title' }], quoteRoot(1)),
      unknown: 'reject',
      version: 1,
    }) as never,
    start: ([first, ...rest], padding) => {
      const [title, body] =
        first?.type === 'paragraph'
          ? [{ ...first, type: 'title' }, rest]
          : [
              { children: [{ text: 'T' }], type: 'title' },
              first ? [first, ...rest] : rest,
            ];

      // The root holds at least one line after its title.
      return [
        title,
        ...body,
        ...filler(Math.max(padding, 1 - body.length), '1'),
      ];
    },
  },
  'two-block': {
    examples: {
      'the last line, which no decision touches, fills the minimum alone': [
        [
          {
            children: [
              { children: [{ text: 'ab' }], type: 'paragraph' },
              { children: [{ text: 'cd' }], type: 'paragraph' },
            ],
            type: 'quote',
          },
          { children: [{ text: 'ef' }], type: 'paragraph' },
          { children: [{ text: 'gh' }], type: 'paragraph' },
          { children: [{ text: 'ij' }], type: 'paragraph' },
        ],
        [
          {
            author: 'alice',
            command: { from: 'a', kind: 'deleteRange', to: 'h' },
            intent: 'propose',
          },
        ],
        0,
        [{ kind: 'undo' }],
      ],
      'a letter typed in a line Bob suggested moving': typedInSuggestedMove,
    },
    padding: 2,
    plugin: defineEditorSchema('recording-laws-two-block', {
      elements: quoteElements,
      id: 'recording-laws-two-block',
      root: quoteRoot(2),
      unknown: 'reject',
      version: 1,
    }) as never,
    start: (blocks, padding) => [
      ...blocks,
      ...filler(Math.max(padding, 2 - blocks.length), '1'),
    ],
  },
  named: {
    examples: {
      'Enter keeps the caret in the new empty leaf': [
        [
          { type: 'paragraph', children: [{ text: 'ab' }] },
          {
            type: 'quote',
            children: [
              { type: 'paragraph', children: [{ text: 'cd' }] },
              { type: 'paragraph', children: [{ text: 'ef' }] },
            ],
          },
        ],
        [
          {
            author: 'alice',
            command: { at: 'a', kind: 'nest', side: 0 },
            intent: 'propose',
          },
          {
            author: 'alice',
            command: { at: 'a', kind: 'nest', side: 0 },
            intent: 'propose',
          },
        ],
        0,
        [
          {
            command: { from: 'd', kind: 'deleteRange', to: 'f' },
            intent: 'propose',
            kind: 'command',
          },
          {
            command: { from: 'a', kind: 'deleteRange', to: 'c' },
            intent: 'edit',
            kind: 'command',
          },
          {
            intent: 'edit',
            kind: 'framed',
            mustApply: true,
            step: { at: { letter: 'f', side: 1 }, kind: 'break' },
          },
        ],
      ],
    },
    padding: 2,
    plugin: defineEditorSchema('recording-laws-named', {
      elements: quoteElements,
      id: 'recording-laws-named',
      root: quoteRoot(1),
      roots: { notes: quoteRoot(1) },
      unknown: 'reject',
      version: 1,
    }) as never,
    root: 'notes',
    start: (blocks, padding) => ({
      children: filler(1, '0'),
      roots: { notes: [...blocks, ...filler(padding, '1')] },
    }),
  },
  // Every block sits in one quote, so a quote among them sits in another and
  // its lines show through two levels.
  nested: {
    examples: {
      'a letter typed in a line Bob suggested moving': typedInSuggestedMove,
    },
    padding: 2,
    plugin: defineEditorSchema('recording-laws-nested', {
      elements: {
        ...quoteElements,
        quote: {
          content: schema.content.types(['paragraph', 'quote'], {
            default: { type: 'paragraph' },
            min: 1,
          }),
        },
      },
      id: 'recording-laws-nested',
      root: quoteRoot(1),
      unknown: 'reject',
      version: 1,
    }) as never,
    start: (blocks, padding) => [
      ...filler(1, '0'),
      { children: [...blocks, ...filler(padding, '1')], type: 'quote' },
    ],
  },
};

// How many runs the other roots' pinned histories must resolve as a head, and
// how many must fill a minimum.
const HEAD_RUNS = 3;
const FILLED_RUNS = 12;

/**
 * The ledger's frame of the stored document holds what the kernel's
 * projection holds, and its map answers as its composed change does.
 */
const withoutRecords = ({
  records: _records,
  ...content
}: JsonEditorValue): JsonEditorValue => content;

// Every node path of one root, and every point strictly inside a text, where
// a letter sits on each side, in document order.
const locationsOf = (nodes: readonly Node[]) => {
  const letters: Array<{ offset: number; path: number[] }> = [];
  const paths: number[][] = [];
  const walk = (children: readonly Node[], at: number[]) => {
    children.forEach((child, index) => {
      const path = [...at, index];

      paths.push(path);
      if (typeof child.text === 'string') {
        for (let offset = 1; offset < child.text.length; offset += 1) {
          letters.push({ offset, path });
        }
      } else {
        walk(child.children as Node[], path);
      }
    });
  };

  walk(nodes, []);

  return { letters, paths };
};

const COMPARED = {
  deltas: 0,
  diffed: 0,
  letters: 0,
  moved: 0,
  ordered: { accepted: 0, proposed: 0 },
  renames: 0,
};

const LAST_FRAMES = new WeakMap<
  Editor,
  Readonly<{
    length: number;
    map: CommandProjectionMap;
    reference: CommandProjectionMap;
    keeps: (position: number) => boolean;
  }>
>();

// Whether a stored position lies inside content `change` keeps.
const keptBy = (change: ReturnType<typeof getInternalDocumentRootChange>) => {
  if (!change) return () => true;

  const kept = new Set<number>();
  let at = 0;

  for (let index = 0; index < change.sections.length; index += 2) {
    const length = getDefined(change.sections[index]);

    if (getDefined(change.sections[index + 1]) < 0) {
      for (let position = at + 1; position < at + length; position += 1) {
        kept.add(position);
      }
    }
    at += length;
  }

  return (position: number) => kept.has(position);
};

/** `value` with each character replaced by one no other character holds. */
const relabeled = (value: JsonEditorValue): JsonEditorValue => {
  let next = 0x4e_00;
  const relabel = (nodes: readonly JsonNode[]): JsonNode[] =>
    nodes.map((node) => {
      if (typeof node.text === 'string') {
        const from = next;

        next += node.text.length;

        return {
          ...node,
          text: Array.from(node.text, (_, at) =>
            String.fromCharCode(from + at)
          ).join(''),
        };
      }

      return node.children
        ? { ...node, children: relabel(node.children) }
        : node;
    });

  return {
    ...value,
    children: relabel(value.children),
    ...(value.roots && {
      roots: Object.fromEntries(
        Object.entries(value.roots).map(([name, nodes]) => [
          name,
          relabel(nodes),
        ])
      ),
    }),
  };
};

// Each character of one root and where it sits.
const charactersOf = (nodes: readonly JsonNode[]) => {
  const index = DocumentIndex.fromValue(nodes);
  const characters = new Map<string, number>();
  const walk = (children: readonly JsonNode[], at: readonly number[]) => {
    children.forEach((child, rank) => {
      const path = [...at, rank];

      if (typeof child.text === 'string') {
        const from = index.positionAt({ offset: 0, path });

        for (let offset = 0; offset < child.text.length; offset += 1) {
          characters.set(getDefined(child.text[offset]), from + offset);
        }
      } else {
        walk(child.children ?? [], path);
      }
    });
  };

  walk(nodes, []);

  return { characters, index };
};

type Projection = ReturnType<typeof projectAuthoredValue>;

/**
 * What a root's maps answer inside the runs a mode shows in another order
 * than the stored one, read from where each character and element lands in
 * the projection of the relabeled document. Each answer is undefined where
 * no character or element start on its side tells.
 */
const orderTruth = (
  spans: ReadonlyArray<
    Readonly<{
      output: readonly [number, number];
      stored: readonly [number, number];
    }>
  >,
  labeled: JsonEditorValue,
  resolution: Projection,
  root: string,
  joins: boolean
) => {
  const before = charactersOf(valueRoot(labeled, root));
  const after = charactersOf(valueRoot(resolution.value, root));
  const storedAt = new Map(
    [...before.characters].map(([character, at]) => [at, character])
  );
  const outputAt = new Map(
    [...after.characters].map(([character, at]) => [at, character])
  );
  const outputPaths = new Map<unknown, number[]>();
  const paths = new Map<string, number[]>();
  const starts = new Map<number, number>();
  const walk = (
    children: readonly JsonNode[],
    at: readonly number[],
    visit: (node: JsonNode, path: number[]) => void
  ) =>
    children.forEach((child, rank) => {
      if (!child.children) return;

      const path = [...at, rank];

      visit(child, path);
      walk(child.children, path, visit);
    });

  walk(valueRoot(resolution.value, root), [], (node, path) =>
    outputPaths.set(node, path)
  );
  walk(valueRoot(labeled, root), [], (node, path) => {
    const placed = outputPaths.get(resolution.resolvedOf(node));

    // A join the mode takes hides the block's open, so neither its start nor
    // its path tells where the block lands, even where the merged block keeps
    // it as its origin, as it does after an empty line.
    if (
      !placed ||
      (joins && readAuthoredMarks(node).some((mark) => mark.kind === 'join'))
    ) {
      return;
    }
    paths.set(String(path), placed);
    starts.set(
      before.index.nodeRange(path).from,
      after.index.nodeRange(placed).from
    );
  });

  const live = (character: string | undefined) =>
    character !== undefined && after.characters.has(character);
  const within = (side: 'output' | 'stored') => (position: number) =>
    spans.some(
      (span) => span[side][0] <= position && position <= span[side][1]
    );

  return {
    /** Whether a projected position holds output characters on both sides. */
    between: (position: number) =>
      outputAt.has(position - 1) && outputAt.has(position),
    hides: (position: number) => {
      const sides = [storedAt.get(position - 1), storedAt.get(position)];

      if (sides.some(live)) return false;

      return sides.every((side) => side !== undefined) ? true : undefined;
    },
    inOutput: within('output'),
    inStored: within('stored'),
    path: (path: readonly number[]) => paths.get(String(path)),
    toProjected: (position: number, association: 'backward' | 'forward') => {
      if (association === 'backward') {
        const character = storedAt.get(position - 1);

        return live(character)
          ? getDefined(after.characters.get(getDefined(character))) + 1
          : undefined;
      }

      const character = storedAt.get(position);

      return live(character)
        ? after.characters.get(getDefined(character))
        : starts.get(position);
    },
    toStored: (position: number, assoc: -1 | 1) => {
      const character = outputAt.get(assoc < 0 ? position - 1 : position);

      if (character === undefined) return undefined;

      const at = getDefined(before.characters.get(character));

      return assoc < 0 ? at + 1 : at;
    },
  };
};

/**
 * The ledger shows each mode's preview as the kernel does, its maps follow
 * the change it composes, and every letter a decision keeps lands where that
 * decision puts it. A decision aligns the whole root and pairs the tokens
 * between two kept letters across blocks, where the ledger aligns run by
 * run, so only the letters compare.
 */
const assertLedger = (editor: Editor, label: string) => {
  const ledger = getDefined(getReviewLedger(editor as never));
  const stored = editor.read.value() as unknown as JsonEditorValue;
  const resolveSchema = authoredResolveSchemaOf(editor as never);
  const frame = ledger.frame(stored);
  const last = LAST_FRAMES.get(editor);
  let labeled: JsonEditorValue | undefined;
  const truths = new Map<string, ReturnType<typeof orderTruth> | null>();
  // The reference inside a run with an order, where the composed change
  // moves content by deleting and inserting it.
  const truthOf = (mode: 'accepted' | 'proposed', root: string) => {
    const key = `${mode} ${root}`;

    if (!truths.has(key)) {
      const spans = ledger.orderedSpans(stored, mode, root);

      labeled ??= spans.length > 0 ? relabeled(stored) : undefined;
      truths.set(
        key,
        labeled && spans.length > 0
          ? orderTruth(
              spans,
              labeled,
              projectAuthoredValue(labeled, mode, resolveSchema),
              root,
              mode === 'proposed'
            )
          : null
      );
    }

    return truths.get(key) ?? null;
  };

  for (let position = 0; position <= (last?.length ?? -1); position += 1) {
    if (!last?.keeps(position)) continue;
    for (const association of ['backward', 'forward'] as const) {
      assert.equal(
        last?.map.toProjected('main', position, association),
        last?.reference.toProjected('main', position, association),
        `${label}: the last frame still maps its stored ${position} ${association}`
      );
    }
  }
  if (frame) {
    LAST_FRAMES.set(editor, {
      length: DocumentIndex.fromValue(valueRoot(stored, 'main')).length,
      map: frame.map,
      reference: projectionMapOf(frame.map.change()),
      keeps:
        frame.map.breaks('main', 0, Infinity).length > 0
          ? keptBy(getInternalDocumentRootChange(frame.map.change(), 'main'))
          : () => true,
    });
  } else {
    LAST_FRAMES.delete(editor);
  }
  const book = ledger.changes(stored);
  const indexed = indexAuthoredChanges(stored);

  const cards = groupAuthoredChanges(indexed);

  assert.deepEqual(
    [...book.idsFrom({})],
    cards.flatMap((card) => card.map((change) => change.id)),
    `${label}: the book orders the changes as the kernel's cards do`
  );
  for (const [id, change] of indexed.changes) {
    assert.deepEqual(
      [book.change(id), book.occurrences(id)],
      [change, indexed.occurrences.get(id)],
      `${label}: the book reads ${id} as the kernel does`
    );
  }
  for (const card of cards) {
    const oldest = card.reduce((left, right) =>
      right.createdAt < left.createdAt ||
      (right.createdAt === left.createdAt && right.id < left.id)
        ? right
        : left
    );

    for (const change of card) {
      const { revision: _revision, ...summary } = getDefined(
        book.groupOf(change.id)
      );

      assert.deepEqual(
        summary,
        {
          authorId: change.authorId,
          changeCount: card.length,
          createdAt: oldest.createdAt,
          id: oldest.id,
        },
        `${label}: the book puts ${change.id} in the kernel's card`
      );
    }
  }

  for (const mode of ['accepted', 'proposed'] as const) {
    const projected = projectAuthoredValue(stored, mode, resolveSchema).value;
    const preview = ledger.preview(stored, mode);
    const map = ledger.projectionMap(stored, mode);
    const change = map.change();
    const reference = projectionMapOf(change);
    const alignment = decidedAlignment(
      withoutRecords(stored),
      withoutRecords(projected),
      {
        facts: factsOf(stored),
        outcomes: mode === 'proposed' ? 'accept' : 'reject',
      }
    );

    if (mode === 'proposed') {
      assert.equal(
        frame?.value ?? null,
        map.roots.length > 0 ? preview : null,
        `${label}: commands read the proposed preview`
      );
    }
    if (!alignment) COMPARED.diffed += 1;
    for (const root of ['main', ...Object.keys(stored.roots ?? {})]) {
      const before = DocumentIndex.fromValue(valueRoot(stored, root));
      const after = DocumentIndex.fromValue(valueRoot(preview, root));
      const rootChange = getInternalDocumentRootChange(change, root);

      assert.deepEqual(
        valueRoot(preview, root),
        valueRoot(projected, root),
        `${label}: the ${mode} preview shows ${root} as the kernel does`
      );
      assert.deepEqual(
        rootChange ? rootChange.apply(before).value : before.value,
        after.value,
        `${label}: the ${mode} change gives the preview of ${root}`
      );
      const ordered = map.breaks(root, 0, Infinity).length > 0;
      const kept = ordered ? keptBy(rootChange) : () => true;
      const projectedKept =
        ordered && rootChange ? keptBy(rootChange.invert(before)) : () => true;
      const truth = truthOf(mode, root);

      COMPARED.ordered[mode] += ledger.orderedSpans(stored, mode, root).length;
      for (let position = 0; position <= before.length; position += 1) {
        if (!kept(position)) {
          if (!truth?.inStored(position)) continue;
          for (const association of ['backward', 'forward'] as const) {
            const want = truth.toProjected(position, association);

            if (want === undefined) continue;
            assert.equal(
              map.toProjected(root, position, association),
              want,
              `${label}: ${mode} ${root} maps stored ${position} ${association} inside a run with an order`
            );
          }

          const hidden = truth.hides(position);

          if (hidden !== undefined) {
            assert.equal(
              map.hides(root, position),
              hidden,
              `${label}: ${mode} ${root} hides stored ${position} inside a run with an order`
            );
          }
          continue;
        }
        for (const association of ['backward', 'forward'] as const) {
          assert.equal(
            map.toProjected(root, position, association),
            reference.toProjected(root, position, association),
            `${label}: ${mode} ${root} maps stored ${position} ${association}`
          );
        }
        assert.equal(
          map.hides(root, position),
          reference.hides(root, position),
          `${label}: ${mode} ${root} hides stored ${position}`
        );
      }
      for (let position = 0; position <= after.length; position += 1) {
        if (!projectedKept(position)) {
          if (!truth?.inOutput(position)) continue;
          for (const assoc of [-1, 1] as const) {
            const want = truth.toStored(position, assoc);

            if (want === undefined) continue;
            assert.equal(
              map.toStored(root, position, assoc),
              want,
              `${label}: ${mode} ${root} maps projected ${position} ${assoc} inside a run with an order`
            );
          }
          if (truth.between(position)) {
            assert.equal(
              map.added(root, position),
              null,
              `${label}: ${mode} ${root} adds nothing between moved characters at projected ${position}`
            );
          }
          continue;
        }
        for (const assoc of [-1, 1] as const) {
          assert.equal(
            map.toStored(root, position, assoc),
            reference.toStored(root, position, assoc),
            `${label}: ${mode} ${root} maps projected ${position} ${assoc}`
          );
        }
        assert.deepEqual(
          map.added(root, position),
          reference.added(root, position),
          `${label}: ${mode} ${root} adds at projected ${position}`
        );
      }

      // `acceptedSpot` places a letter as accepting everything does, so it
      // answers only for Proposed; the order oracle checks Accepted.
      if (ordered && mode === 'proposed') {
        const expanded = valueRoot(expandContexts(stored), root);
        const lines = textBlocks(after.value);

        for (const point of locationsOf(expanded).letters) {
          const position = before.positionAt(point);

          if (kept(position) || map.hides(root, position)) continue;
          COMPARED.moved += 1;
          const expected = acceptedSpot(expanded, point, 'caret');

          for (const assoc of [-1, 1] as const) {
            const mapped = getDefined(
              map.toProjected(
                root,
                position,
                assoc < 0 ? 'backward' : 'forward'
              )
            );
            const landed = getDefined(after.pointAt(mapped, assoc));
            const parent = landed.path.slice(0, -1);
            const block = lines.findIndex((line) =>
              PathApi.equals(line.path, parent)
            );
            const offset = (after.node(parent).children ?? [])
              .slice(0, getDefined(landed.path.at(-1)))
              .reduce(
                (sum, leaf) => sum + (leaf.text?.length ?? 0),
                landed.offset
              );

            assert.deepEqual(
              { block, offset },
              expected,
              `${label}: moved ${root} point ${JSON.stringify(point)} follows its marker ${assoc}`
            );
            assert.equal(
              map.toStored(root, mapped, assoc),
              position,
              `${label}: moved ${root} point maps back ${assoc}`
            );
          }
        }
      }

      const actual = ledger.lens(stored, mode).locations(root);
      const own = authoredLocationMap(stored, preview, change, root);
      const { letters, paths } = locationsOf(valueRoot(stored, root));

      for (const path of paths) {
        if (!kept(before.nodeRange(path).from)) {
          const want = truth?.inStored(before.nodeRange(path).from)
            ? truth.path(path)
            : undefined;

          if (want !== undefined) {
            assert.deepEqual(
              actual.path(path),
              want,
              `${label}: the ${mode} preview maps ${root} path ${path} inside a run with an order`
            );
          }
          continue;
        }
        assert.deepEqual(
          actual.path(path),
          own.path(path),
          `${label}: the ${mode} preview maps ${root} path ${path}`
        );
      }
      if (!alignment) continue;

      const expected = authoredLocationMap(stored, projected, alignment, root);
      const keeps = keptBy(getInternalDocumentRootChange(alignment, root));

      for (const letter of letters) {
        const at = before.positionAt(letter);

        if (!kept(at)) {
          if (!truth?.inStored(at)) continue;
          for (const assoc of [-1, 1] as const) {
            const want = truth.toProjected(
              at,
              assoc < 0 ? 'backward' : 'forward'
            );
            const point = actual.point(letter, assoc);

            if (want === undefined) continue;
            assert.equal(
              point && after.positionAt(point),
              want,
              `${label}: the ${mode} preview maps ${root} point ${JSON.stringify(letter)} ${assoc} inside a run with an order`
            );
          }
          continue;
        }
        for (const assoc of [-1, 1] as const) {
          assert.deepEqual(
            actual.point(letter, assoc),
            own.point(letter, assoc),
            `${label}: the ${mode} preview maps ${root} point ${JSON.stringify(letter)} ${assoc}`
          );
        }
        if (!keeps(before.positionAt(letter))) continue;
        COMPARED.letters += 1;
        for (const assoc of [-1, 1] as const) {
          assert.deepEqual(
            actual.point(letter, assoc),
            expected.point(letter, assoc),
            `${label}: the ${mode} preview keeps ${root} letter ${JSON.stringify(letter)} ${assoc} where a decision does`
          );
        }
      }
    }
  }
};

type ReviewCount = Readonly<{
  /** Each change's card, named by its oldest change. */
  cards: ReadonlyMap<string, string>;
  /** Each card's changes and their revisions, serialized to compare. */
  members: ReadonlyMap<string, string>;
  /** The main-root blocks holding each change. */
  ranks: ReadonlyMap<string, readonly number[]>;
  revisions: ReadonlyMap<string, number>;
}>;

const countReview = (editor: Editor): ReviewCount => {
  const indexed = indexAuthoredChanges(editor.read.value());
  const cards = new Map<string, string>();
  const members = new Map<string, string>();

  for (const card of groupAuthoredChanges(indexed)) {
    const oldest = card.reduce((left, right) =>
      right.createdAt < left.createdAt ||
      (right.createdAt === left.createdAt && right.id < left.id)
        ? right
        : left
    );

    members.set(
      oldest.id,
      JSON.stringify(
        card
          .map((change) => [change.id, change.revision] as const)
          .sort(([left], [right]) => left.localeCompare(right))
      )
    );
    for (const change of card) cards.set(change.id, oldest.id);
  }

  return {
    cards,
    members,
    ranks: new Map(
      [...indexed.occurrences].map(([id, occurrences]) => [
        id,
        occurrences
          .filter((occurrence) => occurrence.root === 'main')
          .map((occurrence) => occurrence.path[0]),
      ])
    ),
    revisions: new Map(
      [...indexed.changes].map(([id, change]) => [id, change.revision])
    ),
  };
};

/**
 * Check every review delta an editor delivers against the kernel's recount
 * of the commit before it, and that a commit changing nothing in the review
 * delivers none.
 */
const watchDeltas = (editor: Editor) => {
  const delivered: unknown[] = [];
  const expected: unknown[] = [];
  // The deltas name at least each block holding a member of a card that
  // changed; which other blocks they name is the delta law's.
  const required = new Set<string>();
  const named = new Set<string>();
  let renames = 0;
  let last = countReview(editor);

  editor.subscribeCommit(() => {
    const next = countReview(editor);
    let regrouped = false;

    for (const [id, card] of next.cards) {
      const was = last.cards.get(id);

      if (was === undefined || was === card) continue;
      for (const rank of next.ranks.get(id) ?? []) {
        required.add(getDefined(editor.key([rank])));
        regrouped = true;
      }
    }
    if (regrouped) renames += 1;

    const delta = {
      changed: [...next.revisions]
        .filter(([id, revision]) => last.revisions.get(id) !== revision)
        .map(([id]) => id)
        .sort(),
      groups: [
        ...[...next.members]
          .filter(([id, members]) => last.members.get(id) !== members)
          .map(([id]) => id),
        ...[...last.members.keys()].filter((id) => !next.members.has(id)),
      ].sort(),
      removed: [...last.revisions.keys()]
        .filter((id) => !next.revisions.has(id))
        .sort(),
    };

    last = next;
    if (Object.values(delta).some((ids) => ids.length > 0)) {
      expected.push(delta);
    }
  });
  editor.api.authored.subscribeChanges((delta) => {
    for (const key of delta.blocks) named.add(key);

    const ids = {
      changed: [...delta.changed].sort(),
      groups: [...delta.groups].sort(),
      removed: [...delta.removed].sort(),
    };

    if (Object.values(ids).some((list) => list.length > 0)) {
      delivered.push(ids);
    }
  });

  return (label: string) => {
    COMPARED.deltas += expected.length;
    COMPARED.renames += renames;
    renames = 0;
    assert.deepEqual(
      delivered.splice(0),
      expected.splice(0),
      `${label}: the review deltas match the kernel's recount of each commit`
    );
    for (const key of required) {
      assert.ok(named.has(key), `${label}: the deltas name ${key}`);
    }
    required.clear();
    named.clear();
  };
};

const LEDGER_SEED = Number(
  process.env.PLITE_LEDGER_SEED ??
    (process.env.FAST_CHECK_SEED === 'random'
      ? Math.floor(Math.random() * 2_147_483_648)
      : 20_261_015)
);

// The share of random ledger steps that must change their root, below the
// least a 40-seed sweep saw.
const EDITING_SHARE = 0.1;

/**
 * What the ledger laws saw on framed steps and refusals, per law: framed
 * steps run, those on a run with an order, those whose window the gate must
 * resolve, written runs adopted, and refusals by reason.
 */
const FRAMED = () => ({
  adopted: 0,
  framed: 0,
  gated: 0,
  ordered: 0,
  refusals: {} as Record<string, number>,
  reordered: [] as string[],
  /** Framed steps that folded a level's facts, by the level's depth. */
  levels: {} as Record<number, number>,
  /** Framed steps that resolved or adopted a container whole. */
  whole: 0,
});

type FramedCounts = ReturnType<typeof FRAMED>;

// Facts hold their keys in the order their children give them.
const sortedFacts = (facts: BlockFacts) => ({
  ...facts,
  deletes: facts.deletes.toSorted(),
  follows: facts.follows.toSorted(),
  joins: facts.joins.toSorted(),
});

const membersOf = (node: Node | JsonNode) =>
  ((node as { authored?: unknown }).authored ?? []) as ReadonlyArray<
    Readonly<{
      at: number;
      change: string;
      follows?: string;
      inc?: number;
      kind: string;
    }>
  >;

const incarnation = ({
  at,
  change,
  inc,
}: Readonly<{ at: number; change: string; inc?: number }>) =>
  JSON.stringify(inc === undefined ? [change, at] : [change, inc]);

const everyNode = function* (
  nodes: ReadonlyArray<Node | JsonNode>
): Generator<Node | JsonNode> {
  for (const node of nodes) {
    yield node;
    yield* everyNode(node.children ?? []);
  }
};

/**
 * Whether the stored marks of `blocks` hold what the gate resolves a window
 * for: a follower claim, or the source copy of a pending move, which is a
 * deletion whose incarnation an insertion in the document holds.
 */
const gatesWindow = (
  blocks: ReadonlyArray<Node | JsonNode>,
  value: JsonEditorValue
) => {
  const inserted = new Set<string>();

  for (const nodes of [value.children, ...Object.values(value.roots ?? {})]) {
    for (const node of everyNode(nodes)) {
      // An empty leaf inserts nothing, so its mark lands no moved content.
      if (node.text === '') continue;
      for (const member of membersOf(node)) {
        if (member.kind === 'insert') inserted.add(incarnation(member));
      }
    }
  }

  return [...everyNode(blocks)].some((node) =>
    membersOf(node).some(
      (member) =>
        member.follows !== undefined ||
        (member.kind === 'delete' && inserted.has(incarnation(member)))
    )
  );
};

/**
 * Run the ledger law on one root shape after its pinned examples; returns the
 * random steps it compared and how many of them changed the root its
 * commands edit.
 */
const ledgerSteps = (
  shape: LedgerRoot,
  numRuns: number,
  counts: FramedCounts
) => {
  const examples = Object.values(shape.examples ?? {});
  let randomEdits = 0;
  let randomSteps = 0;
  let runs = 0;

  watchGateWindows(true);
  watchLevelFacts(true);
  try {
    fc.assert(
      fc.property(
        documentArbitrary,
        historyArbitrary,
        fc.integer({ max: shape.padding, min: 0 }),
        fc.array(ledgerStepArbitrary, { maxLength: 6, minLength: 1 }),
        (initial, recorded, padding, plan) => {
          // fast-check runs the pinned examples before any random run.
          const random = (runs += 1) > examples.length;
          const value = shape.start(replay(initial, recorded), padding);
          // Past the replayed history's ids, so a new suggestion never joins a
          // recorded change, such as one a step's decision rejected.
          let minted = recorded.length;
          const leader = editorFor(
            value,
            'bob',
            'propose',
            () => `bob:${(minted += 1)}`,
            shape.plugin,
            true
          );
          // A root view edits a named root as the editor edits main.
          const actor = shape.root
            ? createEditorView(leader, { root: shape.root })
            : leader;
          const follower = editorFor(
            value,
            'carol',
            'edit',
            'carol:1',
            shape.plugin
          );
          const delivered: Array<
            Parameters<Parameters<typeof leader.subscribeCommit>[0]>[0]
          > = [];

          leader.subscribeCommit((commit) => {
            delivered.push(commit);
          });

          const label = `after ${JSON.stringify(plan)}`;
          const leaderDeltas = watchDeltas(leader);
          const followerDeltas = watchDeltas(follower);

          assertLedger(leader, `load ${label}`);
          for (const [index, step] of plan.entries()) {
            const before = rootChildren(actor);
            const ordered =
              getDefined(getReviewLedger(leader as never))
                .projectionMap(leader.read.value(), 'proposed')
                .breaks(shape.root ?? 'main', 0, Infinity).length > 0;
            let framed = false;
            const { wholeContainers, writtenRuns: written } = readLedgerWork();

            takeGateWindows();
            takeLevelFacts();
            if (random) randomSteps += 1;
            try {
              if (step.kind === 'command') {
                actor.api.authored.setView({ intent: step.intent });
                run(actor, step.command, 'XYZWV'[index % 5]);
              } else if (step.kind === 'framed') {
                const point = ({ letter, side }: Caret) => {
                  const found = locate(actor, letter);

                  return found && { ...found, offset: found.offset + side };
                };
                const [anchor, focus] =
                  step.step.kind === 'fragment'
                    ? [point(step.step.from), point(step.step.to)]
                    : [point(step.step.at), point(step.step.at)];

                if (step.mustApply) {
                  assert.ok(
                    anchor && focus,
                    `required frame has no selection: ${label}`
                  );
                }
                if (anchor && focus) {
                  const refusals: string[] = [];
                  const unsubscribe = actor.api.authored.subscribeRefusals(
                    ({ code }) => refusals.push(code)
                  );

                  actor.api.authored.setView({ intent: step.intent });
                  framed = true;
                  try {
                    runStep(actor, { anchor, focus }, step.step);
                  } finally {
                    unsubscribe();
                  }
                  if (step.mustApply) {
                    assert.deepEqual(
                      refusals,
                      [],
                      `required frame refused: ${label}`
                    );
                  }
                }
              } else if (step.kind === 'decide') {
                const ids = changesIn(rootChildren(actor));

                if (ids.length > 0) {
                  authoredTestApi(leader).decide({
                    action: step.action,
                    changes: ids.slice(0, 1),
                  });
                }
              } else {
                leader.api.history[step.kind]();
              }
            } catch (error) {
              if (
                !isRefusal(error) ||
                (step.kind === 'framed' && step.mustApply)
              ) {
                throw error;
              }

              const refusal =
                error instanceof EditorRefusalError
                  ? (error.refusal as AuthoredRefusal)
                  : null;
              const reasons = refusal
                ? refusal.reasons.length > 0
                  ? refusal.reasons
                  : [refusal.code]
                : ['schema'];
              const at = `seed ${LEDGER_SEED} step ${index} ${label}`;

              for (const reason of reasons) {
                counts.refusals[reason] = (counts.refusals[reason] ?? 0) + 1;
              }
              assert.ok(
                !reasons.includes('diverged'),
                `${at}: a framed write would save other content than it wrote`
              );
              assert.ok(
                !reasons.includes('crosses') || ordered,
                `${at}: refused crosses on a run with no order`
              );
              // The frame refuses crosses only for a range, and the recorder
              // lowers characters typed at a caret before it reads any break.
              assert.ok(
                !reasons.includes('crosses') ||
                  !(
                    framed &&
                    step.kind === 'framed' &&
                    step.step.kind === 'type'
                  ),
                `${at}: refused crosses on letters typed at a caret`
              );
              if (reasons.includes('reordered')) counts.reordered.push(at);
              continue;
            }
            assertLedger(leader, `step ${index} ${label}`);
            leaderDeltas(`step ${index} ${label}`);
            const windows = takeGateWindows();
            const levels = takeLevelFacts();

            if (framed) {
              for (const { depth, facts, node } of levels) {
                assert.deepEqual(
                  sortedFacts(facts as BlockFacts),
                  sortedFacts(blockFactsOf(structuredClone(node))),
                  `seed ${LEDGER_SEED} step ${index} ${label}: the facts a level folds at depth ${depth} are those its container reads cold`
                );
              }
              for (const depth of new Set(levels.map((level) => level.depth))) {
                counts.levels[depth] = (counts.levels[depth] ?? 0) + 1;
              }
              const work = readLedgerWork();

              if (work.wholeContainers > wholeContainers) counts.whole += 1;
              const after = expandContexts(
                leader.read.value() as unknown as JsonEditorValue
              );

              counts.framed += 1;
              if (ordered) counts.ordered += 1;
              if (work.writtenRuns > written) counts.adopted += 1;
              // Every block of each window the gate weighed, as the gate reads
              // them, not only the blocks the step changed.
              const gated = windows.filter(({ blocks }) =>
                gatesWindow(blocks, after)
              );

              if (gated.length > 0) {
                counts.gated += 1;
                assert.ok(
                  !gated.some((window) => window.adopted),
                  `seed ${LEDGER_SEED} step ${index} ${label}: the gate adopted a written run beside a follower claim or a move source`
                );
              }
            }
            for (const commit of delivered.splice(0)) {
              follower.update(
                { tags: ['collaboration', 'history-skip'] },
                // A peer receives the change as data, never the sender's nodes.
                (tx) =>
                  tx.changes.apply(
                    DocumentChange.fromJSON(
                      JSON.parse(JSON.stringify(commit.changes.toJSON()))
                    )
                  )
              );
            }
            assertLedger(follower, `remote step ${index} ${label}`);
            followerDeltas(`remote step ${index} ${label}`);
            if (random && !isDeepStrictEqual(rootChildren(actor), before)) {
              randomEdits += 1;
            }
          }
        }
      ),
      {
        examples: examples as never,
        // fast-check counts the pinned examples inside numRuns.
        numRuns: examples.length + numRuns,
        seed: LEDGER_SEED,
      }
    );
  } finally {
    watchGateWindows(false);
    watchLevelFacts(false);
  }

  return { randomEdits, randomSteps };
};

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
): Shape[] =>
  proposedChildren(children as never, path).flatMap(({ node, path: at }) =>
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

/** Each element's proposed children are the ones accepting everything keeps. */
const assertProposedChildren = (suggested: readonly Node[]) => {
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
};

/**
 * Each preview of `value`, relabeled so every character is unique, with its
 * map and where each character sits in the stored root and in the preview.
 */
const relabeledPreviews = (
  value: readonly Node[] | Readonly<{ children: readonly Node[] }>,
  plugin: typeof Quotes
) => {
  const loaded = editorFor(value, 'carol', 'edit', 'carol:1', plugin);
  const editor = editorFor(
    relabeled(loaded.read.value()),
    'carol',
    'edit',
    'carol:1',
    plugin
  );
  const ledger = getDefined(getReviewLedger(editor as never));
  const stored: JsonEditorValue = editor.read.value();
  const resolveSchema = authoredResolveSchemaOf(editor as never);

  return (['accepted', 'proposed'] as const).map((mode) => {
    const { value: output } = projectAuthoredValue(stored, mode, resolveSchema);

    return {
      after: charactersOf(valueRoot(output, 'main')).characters,
      before: charactersOf(valueRoot(stored, 'main')).characters,
      map: ledger.projectionMap(stored, mode),
      mode,
      output,
      stored,
    };
  });
};

/**
 * Under each preview, the ledger maps each live character of `value` onto
 * that character, and each preview character back onto its stored one, on
 * either side of it. Returns the previews that show a character away from
 * its stored order.
 */
const assertIdentity = (
  value: readonly Node[] | Readonly<{ children: readonly Node[] }>,
  label: string,
  plugin: typeof Quotes = Quotes
) => {
  const reordered = { accepted: 0, proposed: 0 };

  for (const { after, before, map, mode, stored } of relabeledPreviews(
    value,
    plugin
  )) {
    const shown: number[] = [];

    for (const [character, at] of before) {
      const place = after.get(character);

      if (place === undefined) continue;
      shown.push(place);
      assert.deepEqual(
        [
          map.toProjected('main', at, 'forward'),
          map.toProjected('main', at + 1, 'backward'),
        ],
        [place, place + 1],
        `${label}: ${mode} maps stored ${JSON.stringify(
          character
        )} onto itself in ${JSON.stringify(stored.children)}`
      );
    }
    for (const [character, place] of after) {
      const at = getDefined(before.get(character));

      assert.deepEqual(
        [map.toStored('main', place, 1), map.toStored('main', place + 1, -1)],
        [at, at + 1],
        `${label}: ${mode} maps shown ${JSON.stringify(
          character
        )} back onto itself in ${JSON.stringify(stored.children)}`
      );
    }
    if (shown.some((place, index) => place < (shown[index - 1] ?? place))) {
      reordered[mode] += 1;
    }
  }

  return reordered;
};

const assertCrosses = (
  value: readonly Node[] | Readonly<{ children: readonly Node[] }>,
  label: string,
  plugin: typeof Quotes = Quotes
) => {
  let crossed = 0;

  for (const { after, before, map, mode, output, stored } of relabeledPreviews(
    value,
    plugin
  )) {
    const document = JSON.stringify(stored.children);
    const shownOutside = (
      low: number,
      high: number,
      from: number,
      to: number
    ) =>
      [...after].some(([character, place]) => {
        const at = getDefined(before.get(character));

        return (at < low || at >= high) && place >= from && place < to;
      });
    const edges = [
      ...new Set([...before.values()].flatMap((at) => [at, at + 1])),
    ].sort((left, right) => left - right);

    assert.deepEqual(
      map.projectRange(
        'main',
        0,
        DocumentIndex.fromValue(valueRoot(stored, 'main')).length
      ),
      {
        from: 0,
        kind: 'placed',
        to: DocumentIndex.fromValue(valueRoot(output, 'main')).length,
      },
      `${label}: ${mode} places the whole root over the whole preview`
    );
    for (const [rank, low] of edges.entries()) {
      const caret = map.projectRange('main', low, low);

      assert.ok(
        caret?.kind !== 'refused' || caret.reason !== 'crosses',
        `${label}: ${mode} refuses crosses at the caret ${low} in ${document}`
      );
      for (const high of edges.slice(rank + 1)) {
        const placed = map.projectRange('main', low, high);
        const empty =
          getDefined(map.toProjected('main', low, 'forward')) >=
            getDefined(map.toProjected('main', high, 'backward')) &&
          [...after.keys()].some((character) => {
            const at = getDefined(before.get(character));

            return at >= low && at < high;
          });

        if (placed?.kind !== 'placed') {
          assert.ok(
            placed?.reason !== 'crosses' || empty,
            `${label}: ${mode} refuses ${low} to ${high}, whose image holds its shown letters, in ${document}`
          );
          continue;
        }
        assert.ok(
          !empty || placed.from < placed.to,
          `${label}: ${mode} places ${low} to ${high}, whose shown letters lie outside its image, in ${document}`
        );

        if (shownOutside(low, high, placed.from, placed.to)) crossed += 1;
      }
    }
  }

  return crossed;
};

const Followers = defineEditorSchema('recording-laws-followers', {
  elements: {
    ...quoteElements,
    divider: { void: 'block' },
    quote: {
      content: schema.content.types(['divider', 'paragraph'], {
        default: { type: 'paragraph' },
        min: 1,
      }),
    },
  },
  id: 'recording-laws-followers',
  root: schema.content.types(['divider', 'paragraph', 'quote'], {
    default: { type: 'paragraph' },
    min: 1,
  }),
  unknown: 'reject',
  version: 1,
}) as never;

type FollowerAct = Readonly<{
  act: (editor: Editor) => void;
  author: 'alice' | 'bob' | 'carol' | 'dan' | 'erin';
  intent: 'edit' | 'plain' | 'propose';
}>;

const paragraph = (text: string): Node => ({
  children: [{ text }],
  type: 'paragraph',
});

// The path of the block holding `letter`.
const blockOf = (editor: Editor, letter: string) =>
  getDefined(locate(editor, letter)).path.slice(0, -1);
const pointOf = (editor: Editor, letter: string, side: 0 | 1) => {
  const at = getDefined(locate(editor, letter));

  return { ...at, offset: at.offset + side };
};

// A framed command at a point, or at one side of a letter.
const framed =
  (
    command:
      | typeof editorCommands.delete
      | typeof editorCommands.insertBreak
      | typeof editorCommands.insertText,
    options: object | undefined,
    at: Point | readonly [string, 0 | 1]
  ) =>
  (editor: Editor) => {
    const point = 'path' in at ? at : pointOf(editor, at[0], at[1]);

    editor.update((tx) => {
      tx.selection.set({ anchor: point, focus: point });
      tx.command(command as never, options as never);
    });
  };
const backspaceAt = (letter: string) =>
  framed(editorCommands.delete, { direction: 'backward', unit: 'character' }, [
    letter,
    0,
  ]);
const enterAt = (letter: string, side: 0 | 1 = 0) =>
  framed(editorCommands.insertBreak, undefined, [letter, side]);
const typeAt = (at: Point | readonly [string, 0 | 1], text: string) =>
  framed(editorCommands.insertText, { text }, at);
// Core node writes, which no frame checks, by the block holding a letter.
const moveBlock =
  (letter: string, to: (editor: Editor) => number[]) => (editor: Editor) => {
    const at = blockOf(editor, letter);
    const path = to(editor);

    editor.update((tx) => tx.nodes.move({ at, to: path }));
  };
const insertBlock =
  (node: Node, at: (editor: Editor) => number[]) => (editor: Editor) => {
    const path = at(editor);

    editor.update((tx) => tx.nodes.insert(node as never, { at: path }));
  };
const aboveBlock = (letter: string) => (editor: Editor) =>
  blockOf(editor, letter);
const belowBlock = (letter: string) => (editor: Editor) => {
  const path = blockOf(editor, letter);

  return [...path.slice(0, -1), getDefined(path.at(-1)) + 1];
};

/** Each document `acts` build from `start`, one editor per act. */
const builtByCommands = (
  start: readonly Node[],
  acts: readonly FollowerAct[]
) => {
  const values = [start];

  acts.forEach(({ act, author, intent }, index) => {
    const editor = editorFor(
      getDefined(values.at(-1)),
      author,
      intent,
      `${author}:${index}`,
      Followers
    );

    act(editor);
    values.push(expandedChildren(editor));
  });

  return values;
};

const DIVIDER: Node = { children: [{ text: '' }], type: 'divider' };
const struckBy = (author: string, node: Node): Node => {
  const mark = { at: 1, author, change: `${author}:0`, kind: 'delete' };

  return {
    ...node,
    authored: [mark],
    children: (node.children ?? []).map((child) => ({
      ...child,
      authored: [mark],
    })),
  };
};

// Alice's pending join pulls `cd` up into the quote's `ab`, and Bob's Enter
// after its `c` leaves `d` as a piece that follows the join.
const JOINED: readonly [readonly Node[], readonly FollowerAct[]] = [
  [
    { children: [paragraph('ab')], type: 'quote' },
    paragraph('cd'),
    paragraph('xy'),
  ],
  [
    { act: backspaceAt('c'), author: 'alice', intent: 'propose' },
    { act: enterAt('d'), author: 'bob', intent: 'propose' },
  ],
];
// Sol's case: a piece stored before the joined line it follows, across a
// line Bob deleted whole, which no one editor's commands build.
const sol = (wrap: (nodes: Node[]) => Node[]) =>
  wrap([
    paragraph('aa'),
    struckBy('bob', paragraph('bb')),
    {
      ...paragraph('ff'),
      authored: [
        {
          at: 1,
          author: 'carol',
          change: 'carol:0',
          follows: JSON.stringify(['alice:0', 1]),
          kind: 'split',
        },
      ],
    },
    {
      ...paragraph('cc'),
      authored: [{ at: 1, author: 'alice', change: 'alice:0', kind: 'join' }],
    },
  ]);

// Bob's Editing join of `gh` waits on Alice's pending deletion of `cd`, so
// Accepted keeps it, and his Editing split left `ij` following it, with Erin's
// paragraph saved between them that goes with no join.
const EDITING_FOLLOWER: readonly Node[] = [
  paragraph('ab'),
  struckBy('alice', paragraph('cd')),
  {
    ...paragraph('gh'),
    authored: [{ at: 1, author: 'bob', change: '~edit:bob', kind: 'join' }],
  },
  paragraph('kl'),
  {
    ...paragraph('ij'),
    authored: [
      {
        at: 1,
        author: 'bob',
        change: '~edit:bob',
        follows: JSON.stringify(['~edit:bob', 1]),
        kind: 'split',
      },
    ],
  },
];

// The previews of the documents built around followers that must show a
// character away from its stored order.
const REORDERED = { accepted: 4, proposed: 41 };

/**
 * Carol's paragraph saved between Alice's joined line and Bob's piece that
 * follows it, by Yjs peers: Bob saw Alice's join and pressed Enter at the end
 * of its line, and Carol, who never saw it, inserted a paragraph after that
 * line. Her client id runs lower and higher than Bob's, so Yjs puts her
 * paragraph on each side of his. Each merged document, then Dave's key typed
 * into her paragraph.
 */
const concurrentFollowers = () =>
  [300, 600].flatMap((carolId) => {
    let minted = 0;
    const peer = (
      doc: Y.Doc,
      author: string,
      intent: 'edit' | 'propose',
      seed?: readonly Node[]
    ) => {
      const editor = editorFor(
        seed ?? [paragraph('')],
        author,
        intent,
        () => `${author}:${(minted += 1)}`,
        Followers
      );

      return {
        cleanup: editor.install(
          yjs({ doc, initialReady: true, ...(seed ? { seed: true } : {}) })
        ),
        editor,
      };
    };
    const send = (from: Y.Doc, to: Y.Doc) =>
      Y.applyUpdate(to, Y.encodeStateAsUpdate(from, Y.encodeStateVector(to)));
    const docOf = (clientID: number) => {
      const doc = new Y.Doc();

      doc.clientID = clientID;

      return doc;
    };
    const aliceDoc = docOf(500);
    const bobDoc = docOf(400);
    const carolDoc = docOf(carolId);
    const alice = peer(aliceDoc, 'alice', 'propose', [
      { children: [paragraph('ab'), paragraph('cd')], type: 'quote' },
    ]);

    send(aliceDoc, bobDoc);
    send(aliceDoc, carolDoc);

    const bob = peer(bobDoc, 'bob', 'propose');
    const carol = peer(carolDoc, 'carol', 'edit');

    backspaceAt('c')(alice.editor);
    send(aliceDoc, bobDoc);
    enterAt('d', 1)(bob.editor);
    bob.editor.update((tx) =>
      tx.command(editorCommands.insertText, { text: 'yz' })
    );
    insertBlock(paragraph('xw'), () => [0, 2])(carol.editor);
    for (const [from, to] of [
      [aliceDoc, carolDoc],
      [bobDoc, carolDoc],
      [carolDoc, aliceDoc],
      [carolDoc, bobDoc],
      [bobDoc, aliceDoc],
      [aliceDoc, bobDoc],
    ] as const) {
      send(from, to);
    }

    const merged: Readonly<{ children: readonly Node[] }> =
      alice.editor.read.value();

    for (const { cleanup } of [alice, bob, carol]) cleanup();

    const dave = editorFor(merged, 'dave', 'propose', 'dave:1', Followers);

    typeAt(['x', 1], '!')(dave);

    const typed: Readonly<{ children: readonly Node[] }> = dave.read.value();

    return [
      [`merged with Carol's client at ${carolId}`, merged],
      [`Dave's key in Carol's paragraph with her client at ${carolId}`, typed],
    ] as const;
  });

/** The follower corpus's documents, each one its commands build, and the concurrent ones. */
const followerDocuments = () => ({
  built: followerCorpus().flatMap(([name, start, acts]) =>
    builtByCommands(start, acts).map((value) => [name, value] as const)
  ),
  concurrent: concurrentFollowers(),
});

/** Documents built by commands where a piece follows a pending join. */
const followerCorpus = (): Array<
  readonly [string, readonly Node[], readonly FollowerAct[]]
> =>
  (['edit', 'propose'] as const).flatMap((intent) => {
    const by = (act: FollowerAct['act']): FollowerAct => ({
      act,
      author: 'dan',
      intent,
    });
    const plain = (act: FollowerAct['act']): FollowerAct => ({
      act,
      author: 'erin',
      intent: 'plain',
    });
    const [joined, joining] = JOINED;
    const cases: Array<
      readonly [string, readonly Node[], readonly FollowerAct[]]
    > = [
      [
        'a paragraph inserted between the join target and its joined line',
        joined,
        [...joining, by(insertBlock(paragraph('gh'), aboveBlock('c')))],
      ],
      [
        'Enter at the end of the join target, and a key typed on the new line',
        joined,
        [
          ...joining,
          by(enterAt('b', 1)),
          by(typeAt({ offset: 0, path: [0, 1, 0] }, 'G')),
        ],
      ],
      [
        'a block moved between the join target and its joined line',
        joined,
        [...joining, by(moveBlock('x', aboveBlock('c')))],
      ],
      [
        'the follower moved before the quote',
        joined,
        [...joining, by(moveBlock('d', () => [0]))],
      ],
      [
        'the follower moved to the end',
        joined,
        [
          ...joining,
          by(moveBlock('d', (editor) => [rootChildren(editor).length])),
        ],
      ],
      [
        'the joined line moved past its follower',
        joined,
        [...joining, by(moveBlock('c', belowBlock('d')))],
      ],
      [
        'a chain of followers, and a paragraph inserted above the joined line',
        [
          { children: [paragraph('ab')], type: 'quote' },
          paragraph('cdgh'),
          paragraph('xy'),
        ],
        [
          ...joining,
          by(enterAt('g')),
          by(insertBlock(paragraph('ij'), aboveBlock('c'))),
          by(typeAt(['i', 1], 'H')),
        ],
      ],
      [
        'an empty paragraph saved between the joined line and its follower, and a key typed into it',
        joined,
        [
          ...joining,
          plain(insertBlock(paragraph(''), aboveBlock('d'))),
          by(typeAt({ offset: 0, path: [0, 2, 0] }, 'K')),
        ],
      ],
      [
        'a void saved between the joined line and its follower, and a key typed beside it',
        joined,
        [
          ...joining,
          plain(insertBlock(DIVIDER, aboveBlock('d'))),
          by(typeAt(['d', 0], 'V')),
        ],
      ],
      [
        'a paragraph saved between an Editing join and its Editing follower, and a key typed into it',
        EDITING_FOLLOWER,
        [by(typeAt(['k', 1], 'T'))],
      ],
      [
        'a key typed in each line of Sol’s case',
        sol((nodes) => nodes),
        ['a', 'b', 'f', 'c'].map((letter, index) =>
          by(typeAt([letter, 1], 'PQRS'[index] ?? 'P'))
        ),
      ],
      [
        'a key typed in each line of Sol’s case in a quote',
        sol((nodes) => [{ children: nodes, type: 'quote' }, paragraph('zq')]),
        ['a', 'b', 'f', 'c'].map((letter, index) =>
          by(typeAt([letter, 1], 'PQRS'[index] ?? 'P'))
        ),
      ],
    ];

    return cases.map(
      ([name, start, acts]) => [`${name} (${intent})`, start, acts] as const
    );
  });

describe('authored review tree recording laws', () => {
  it('maps each live character onto itself and each shown character back onto its stored one under each preview, where pieces follow a join', () => {
    const unaligned = readLedgerWork().unalignedRuns;
    const { built, concurrent } = followerDocuments();
    const reordered = { accepted: 0, proposed: 0 };
    let concurrentReordered = 0;

    for (const [name, value] of [...built, ...concurrent]) {
      const counts = assertIdentity(value, name, Followers);

      reordered.accepted += counts.accepted;
      reordered.proposed += counts.proposed;
    }
    for (const [name, value] of concurrent) {
      concurrentReordered += assertIdentity(value, name, Followers).proposed;
    }

    console.info(JSON.stringify({ concurrentReordered, reordered }));
    assert.equal(
      readLedgerWork().unalignedRuns - unaligned,
      0,
      'a run fell back to a diff'
    );
    assert.ok(
      reordered.proposed >= REORDERED.proposed &&
        reordered.accepted >= REORDERED.accepted,
      `only ${JSON.stringify(reordered)} previews shown in another order`
    );
    assert.ok(
      concurrentReordered >= 2,
      `only ${concurrentReordered} concurrent previews shown in another order`
    );
  });

  it('maps each live character onto itself and each shown character back onto its stored one under each preview of a recorded document', () => {
    const unaligned = readLedgerWork().unalignedRuns;
    const compared = recordedCommands(
      ({ before, edited, suggested }) => {
        for (const value of [before, edited, suggested]) {
          assertIdentity(value, 'recorded');
        }
      },
      30,
      undefined,
      LEDGER_SEED
    );

    assert.ok(compared > 18, `only ${compared} commands compared`);
    assert.equal(
      readLedgerWork().unalignedRuns - unaligned,
      0,
      'a run fell back to a diff'
    );
  });

  it('reports a stored range whose preview image shows content stored outside it where pieces follow a join, never refuses a caret with crosses, and places the whole root over the whole preview', () => {
    const { built, concurrent } = followerDocuments();
    let crossed = 0;

    for (const [name, value] of [...built, ...concurrent]) {
      crossed += assertCrosses(value, name, Followers);
    }

    console.info(JSON.stringify({ crossed }));
    assert.ok(crossed > 1000, `only ${crossed} ranges crossed a move`);
  });

  it('reports a stored range whose preview image shows content stored outside it in a recorded document, never refuses a caret with crosses, and places the whole root over the whole preview', () => {
    let crossed = 0;
    const compared = recordedCommands(
      ({ before, edited, suggested }) => {
        for (const value of [before, edited, suggested]) {
          crossed += assertCrosses(value, 'recorded');
        }
      },
      30,
      undefined,
      LEDGER_SEED
    );

    console.info(JSON.stringify({ compared, crossed }));
    assert.ok(compared > 18, `only ${compared} commands compared`);
  });

  it('gives typed text no deletion and every letter one owner, and rejecting everything undoes a suggestion', () => {
    const compared = recordedCommands(undoesSuggestion, 30);

    assert.ok(compared > 18, `only ${compared} commands compared`);
  });

  it('keeps every recorded document through compaction and expansion', () => {
    let stacked = 0;
    const compared = recordedCommands(({ before, edited, suggested }) => {
      for (const children of [before, edited, suggested]) {
        const value = { children };
        const compacted = compactClaims(value);

        if (compacted !== value) stacked += 1;
        assert.deepEqual(expandContexts(compacted).children, children);
      }
    }, 40);

    assert.ok(compared > 24, `only ${compared} commands compared`);
    assert.ok(stacked >= 1, `only ${stacked} documents held a stack`);
  });

  it('accepting everything after a command in either intent gives what a plain editor gives on the accepted document, and accepting or rejecting everything applies', () => {
    const counts = { plain: 0 };
    const compared = recordedCommands(acceptsLikePlainEditor(counts), 30);

    console.info(JSON.stringify({ compared, plainCompared: counts.plain }));
    assert.ok(compared > 18, `only ${compared} commands compared`);
    assert.ok(
      counts.plain > 0,
      `only ${counts.plain} commands compared with a plain editor`
    );
  });

  it('undoing commands and a decision restores each document before them, review marks included, and redoing them restores each result', () => {
    let compared = 0;

    fc.assert(
      fc.property(
        documentArbitrary,
        historyArbitrary,
        fc.array(commandArbitrary(LETTERS.slice(0, 8)), {
          maxLength: 3,
          minLength: 1,
        }),
        fc.constantFrom('edit' as const, 'propose' as const),
        fc.constantFrom('accept' as const, 'reject' as const),
        (initial, history, commands, intent, action) => {
          if (
            undoRestores(initial, history, commands, intent, action) ===
            'compared'
          ) {
            compared += 1;
          }
        }
      ),
      {
        examples: [
          // A suggested move selects the moved copy, not the struck original.
          [
            [
              { type: 'paragraph', children: [{ text: 'ab' }] },
              {
                type: 'quote',
                children: [{ type: 'paragraph', children: [{ text: 'cd' }] }],
              },
            ],
            [],
            [{ at: 'a', edge: 'after', kind: 'transferNode', to: 'c' }],
            'propose',
            'reject',
          ] as never,
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
            ],
            [],
            [
              { kind: 'replaceChildren', shift: 1 },
              { at: 'f', direction: 'backward', kind: 'delete' },
              { from: 'a', kind: 'typeOver', to: 'a' },
            ],
            'propose',
            'accept',
          ] as never,
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
                command: {
                  at: 'c',
                  edge: 'after',
                  kind: 'moveNode',
                  to: 'a',
                },
                intent: 'propose',
              },
            ],
            [
              { at: 'c', direction: 'forward', kind: 'delete' },
              { from: 'a', kind: 'typeOver', to: 'a' },
            ],
            'edit',
            'reject',
          ] as never,
          // The second drag moves a struck letter onto itself.
          [
            [
              { type: 'paragraph', children: [{ text: 'ab' }] },
              { type: 'paragraph', children: [{ text: 'cd' }] },
            ],
            [
              {
                author: 'alice',
                command: { kind: 'replaceChildren', shift: 1 },
                intent: 'propose',
              },
            ],
            [
              { at: 'd', kind: 'transferText', to: 'a' },
              { at: 'd', kind: 'transferText', to: 'a' },
            ],
            'edit',
            'accept',
          ] as never,
        ],
        numRuns: 40,
      }
    );

    assert.ok(compared > 24, `only ${compared} command runs compared`);
  });

  it('refuses crosses for a letter typed with Bold toggled inside a text beside a break, and records one at a text boundary beside a link', () => {
    const Bold = defineEditorSchema('recording-laws-caret', {
      elements: quoteElements,
      id: 'recording-laws-caret',
      properties: [schema.textProperty('bold', property.boolean())],
      root: quoteRoot(1),
      unknown: 'reject',
      version: 1,
    }) as never;
    const line = (...children: Node[]): Node => ({
      children,
      type: 'paragraph',
    });
    // `ab` follows Carol's join of `ef`, so Proposed shows `cdef` then `ab`.
    const around = (first: Node, joined: Node): Node[] => [
      first,
      {
        ...line({ text: 'ab' }),
        authored: [
          {
            at: 1,
            author: 'erin',
            change: '~edit:erin',
            follows: JSON.stringify(['carol:1', 1]),
            kind: 'insert',
          },
        ],
      },
      {
        ...joined,
        authored: [{ at: 1, author: 'carol', change: 'carol:1', kind: 'join' }],
      },
    ];
    const typeBold = (
      value: readonly Node[],
      intent: 'edit' | 'propose',
      point: Point
    ) => {
      const editor = editorFor(value, 'bob', intent, 'bob:1', Bold);
      const stored = structuredClone(rootChildren(editor));

      editor.update((tx) => {
        tx.selection.set({ anchor: point, focus: point });
        tx.command(editorCommands.addMark, { key: 'bold', value: true });
      });
      try {
        editor.update((tx) =>
          tx.command(editorCommands.insertText, { text: 'Z' })
        );
      } catch (error) {
        assert.ok(error instanceof EditorRefusalError, String(error));

        return {
          editor,
          reasons: (error.refusal as AuthoredRefusal).reasons,
          stored,
        };
      }

      return { editor, reasons: null, stored };
    };
    const shown = (editor: Editor) =>
      [
        ...NodeApi.texts({
          children: createEditorView(editor, {
            authored: { preview: 'proposed' },
          }).read.children(),
        } as never),
      ].flatMap(([leaf]) =>
        (leaf as { text: string }).text
          ? [
              `${(leaf as { bold?: true }).bold ? '*' : ''}${(leaf as { text: string }).text}`,
            ]
          : []
      );

    for (const intent of ['edit', 'propose'] as const) {
      const flat = typeBold(
        around(line({ text: 'cd' }), line({ text: 'ef' })),
        intent,
        { offset: 2, path: [0, 0] }
      );

      assert.deepEqual(flat.reasons, ['crosses'], `${intent}: end of cd`);
      assert.deepEqual(rootChildren(flat.editor), flat.stored, intent);

      const linked = typeBold(
        around(
          line({ children: [{ text: 'cd' }], type: 'link' }),
          line({ text: 'ef' })
        ),
        intent,
        { offset: 2, path: [0, 1, 0] }
      );

      assert.equal(linked.reasons, null, `${intent}: end of the link`);
      assert.deepEqual(shown(linked.editor), ['cd', '*Z', 'ef', 'ab'], intent);
    }
  });

  it('keeps the review ledger equal to the kernel after every step, undo, redo, decision and remote commit of the pinned main-root histories', () => {
    const counts = FRAMED();

    ledgerSteps(MAIN_ROOT, 0, counts);
    console.info('ledger pinned main: compared', COMPARED);
    console.info('ledger pinned main: framed', counts);
    assert.ok(COMPARED.moved > 0, 'no points inside moved content compared');
    // The examples alone show these runs in another order, so the relabel
    // reference checks them on every seed.
    assert.ok(
      COMPARED.ordered.proposed >= 13 && COMPARED.ordered.accepted >= 5,
      `only ${JSON.stringify(COMPARED.ordered)} runs shown in another order`
    );
    // The examples type on runs with an order, so every seed frames one.
    assert.ok(
      counts.framed >= 12 && counts.ordered > 0,
      `only ${counts.framed} framed steps, ${counts.ordered} on a run with an order`
    );
    assert.ok(counts.gated >= 5, `only ${counts.gated} gated steps`);
    assert.ok(
      (counts.levels[1] ?? 0) >= 8,
      `only ${counts.levels[1]} framed steps folded a quote's facts`
    );
    assert.ok(
      COMPARED.letters > 300,
      `only ${COMPARED.letters} kept letters compared`
    );
    assert.ok(
      COMPARED.deltas > 40 && COMPARED.renames > 0,
      `only ${COMPARED.deltas} review deltas compared, ${COMPARED.renames} renaming a card`
    );
  });

  it('keeps the review ledger equal to the kernel after every step, undo, redo, decision and remote commit of random main-root histories', () => {
    console.info(JSON.stringify({ ledgerSeed: LEDGER_SEED }));

    const counts = FRAMED();
    const { randomEdits, randomSteps } = ledgerSteps(
      { ...MAIN_ROOT, examples: {} },
      12,
      counts
    );

    console.info(`ledger seed ${LEDGER_SEED}: random main framed`, counts);
    console.info(`ledger seed ${LEDGER_SEED}: random main`, {
      randomEdits,
      randomSteps,
    });
    assert.ok(
      randomEdits > randomSteps * EDITING_SHARE,
      `only ${randomEdits} of ${randomSteps} random steps changed the main root`
    );
  });

  it('keeps the review ledger equal to the kernel on the pinned histories of a titled root, a root of at least two blocks, a named root and a nested root', () => {
    const before = readLedgerWork();

    for (const [name, shape] of Object.entries(OTHER_ROOTS)) {
      const counts = FRAMED();

      ledgerSteps(shape, 0, counts);
      console.info(`ledger pinned ${name}: framed`, counts);
      assert.ok(
        counts.framed > 0 && counts.gated > 0,
        `only ${counts.framed} framed steps, ${counts.gated} gated, in the ${name} root`
      );
      if (name === 'nested') {
        assert.ok(
          (counts.levels[2] ?? 0) > 0,
          'no framed step folded the facts of a quote in a quote'
        );
      }
    }

    const after = readLedgerWork();
    const runs = {
      filled: after.filledRuns - before.filledRuns,
      head: after.headRuns - before.headRuns,
    };

    console.info('ledger pinned other roots: runs', runs);
    assert.ok(runs.head > HEAD_RUNS, `only ${runs.head} head runs resolved`);
    assert.ok(
      runs.filled > FILLED_RUNS,
      `only ${runs.filled} runs filled a minimum`
    );
  });

  it('keeps the review ledger equal to the kernel on random histories in a titled root, a root of at least two blocks, a named root and a nested root', () => {
    for (const [name, shape] of Object.entries(OTHER_ROOTS)) {
      const counts = FRAMED();
      const { randomEdits, randomSteps } = ledgerSteps(
        { ...shape, examples: {} },
        8,
        counts
      );

      console.info(`ledger seed ${LEDGER_SEED}: random ${name} framed`, counts);
      console.info(`ledger seed ${LEDGER_SEED}: random ${name}`, {
        randomEdits,
        randomSteps,
      });
      assert.ok(
        randomEdits > randomSteps * EDITING_SHARE,
        `only ${randomEdits} of ${randomSteps} random steps changed the ${name} root`
      );
    }
  });

  it('a command gives, once everything is accepted, what a plain editor gives on the accepted document, and a letter typed next lands where it does', () => {
    const counts = commandCounts();
    const rejectionWaitingOnPendingText = [
      [
        { type: 'paragraph', children: [{ text: 'ab' }] },
        { type: 'paragraph', children: [{ text: 'cd' }] },
        {
          type: 'quote',
          children: [{ type: 'paragraph', children: [{ text: 'ef' }] }],
        },
      ],
      [
        {
          author: 'alice',
          command: { at: 'd', kind: 'type', side: 1 },
          intent: 'propose',
        },
        {
          author: 'bob',
          command: { at: 'b', kind: 'wrap' },
          intent: 'edit',
        },
      ],
      { at: { letter: 'd', side: 1 }, kind: 'break' },
      'propose',
    ] as never;
    const commandOverPendingJoin = [
      [
        {
          type: 'quote',
          children: [
            { type: 'paragraph', children: [{ text: 'ab' }] },
            { type: 'paragraph', children: [{ text: 'cd' }] },
          ],
        },
        { type: 'paragraph', children: [{ text: 'ef' }] },
        { type: 'paragraph', children: [{ text: 'gh' }] },
      ],
      [
        {
          author: 'alice',
          command: { at: 'b', kind: 'wrap' },
          intent: 'edit',
        },
        {
          author: 'alice',
          command: { at: 'c', direction: 'backward', kind: 'delete' },
          intent: 'propose',
        },
      ],
      { at: { letter: 'g', side: 1 }, kind: 'type' },
      'propose',
    ] as never;
    const endInStruckText = [
      [
        { type: 'paragraph', children: [{ text: 'ab' }] },
        { type: 'paragraph', children: [{ text: 'cd' }] },
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
          command: { kind: 'replaceChildren', shift: 1 },
          intent: 'propose',
        },
      ],
      { at: { letter: 'e', side: 0 }, kind: 'type' },
      'propose',
    ] as never;

    fc.assert(
      fc.property(
        documentArbitrary,
        // Limits: a pending unwrap comes only from a write outside commands,
        // as Plate's keys record lifting a line out of a quote as a move, and
        // commands that cross its wrapper's edge are not settled.
        historyArbitrary.map((edits) => edits.filter(settles)),
        stepArbitrary,
        fc.constantFrom('edit' as const, 'propose' as const),
        commandCase(counts)
      ),
      {
        examples: [
          rejectionWaitingOnPendingText,
          commandOverPendingJoin,
          endInStruckText,
        ],
        numRuns: 25,
      }
    );

    console.info(JSON.stringify(counts));
    assert.ok(
      counts.compared > 15,
      `only ${counts.compared} commands compared`
    );
    assert.ok(counts.joined >= 1, 'no command ran over a pending join');
    assert.ok(counts.blocked >= 1, 'no rejection waited on another change');
    assert.ok(
      counts.struckEnd >= 1,
      `only ${counts.struckEnd} with an end in struck text`
    );
  });

  it('reads each element’s proposed children as accepting everything holds them before completion builds', () => {
    const compared = recordedCommands(
      ({ suggested }) => assertProposedChildren(suggested),
      30
    );

    assert.ok(compared > 18, `only ${compared} commands compared`);
  });

  it('decides recorded changes to one document in every order, with and without content declarations', () => {
    let blocked = 0;
    let compared = 0;
    const rejectInsertionHoldingAcceptedInsertion = [
      [
        { type: 'paragraph', children: [{ text: 'ab' }] },
        { type: 'paragraph', children: [{ text: 'cd' }] },
      ],
      [
        {
          author: 'alice',
          command: { at: 'a', kind: 'nest', side: 0 },
          intent: 'propose',
        },
        {
          author: 'bob',
          command: { at: 'M', kind: 'nest', side: 1 },
          intent: 'propose',
        },
      ],
      ['reject', 'accept', 'accept', 'accept'],
      0,
    ] as never;

    fc.assert(
      fc.property(
        documentArbitrary,
        withNesting(fc.array(editArbitrary, { maxLength: 4, minLength: 1 })),
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

            const decide = (value: unknown, batch: readonly string[]) => {
              const editor = editorFor(
                value as readonly Node[],
                'carol',
                'edit',
                'carol:1',
                withSchema
              );
              const result = authoredTestApi(editor).decide(
                (['accept', 'reject'] as const).map((action) => ({
                  action,
                  changes: batch.filter(
                    (change) => decisions.get(change) === action
                  ),
                }))
              );

              return {
                result,
                reviewed: reviewedValue(editor).children,
                value: editor.read.value(),
              };
            };
            const together = decide(recorded, [...decisions.keys()]);

            if (together.result.status !== 'applied') continue;
            const order = [...decisions.keys()];

            order.push(...order.splice(0, rotation % order.length));
            let value: unknown = recorded;
            let reviewed: unknown = recorded;
            let admissible = true;

            while (order.length > 0 && admissible) {
              const batch = new Set([order.shift()!]);
              let step = decide(value, [...batch]);

              while (step.result.status === 'blocked') {
                blocked += 1;
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
              ({ reviewed, value } = step);
            }
            if (!admissible) continue;
            compared += 1;
            assert.deepEqual(reviewed, together.reviewed);
          }
          for (const action of ['accept', 'reject'] as const) {
            const { status } = authoredTestApi(
              editorFor(recorded, 'carol', 'edit', 'carol:1')
            ).decide({ action, changes });

            assert.ok(
              status === 'applied' || status === 'unchanged',
              `${action} everything returned ${status}: ${JSON.stringify(recorded)}`
            );
          }
        }
      ),
      { examples: [rejectInsertionHoldingAcceptedInsertion], numRuns: 25 }
    );
    assert.ok(compared > 12, `only ${compared} decision orders compared`);
    assert.ok(blocked >= 1, 'no decision waited on another change');
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
            value = expandedChildren(editor);
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
          value = expandedChildren(remover);

          const actions = new Map([
            ...enters.map((change) => [change, 'reject'] as const),
            ...(intent === 'propose' ? [['eve:1', 'accept'] as const] : []),
          ]);
          const decide = (current: unknown, changes: readonly string[]) => {
            const editor = editorFor(
              current as readonly Node[],
              'carol',
              'edit',
              'carol:1'
            );
            const result = authoredTestApi(editor).decide(
              (['accept', 'reject'] as const).flatMap((action) => {
                const picked = changes.filter(
                  (change) => actions.get(change) === action
                );

                return picked.length > 0 ? [{ action, changes: picked }] : [];
              })
            );

            return {
              result,
              reviewed: reviewedValue(editor).children,
              value: editor.read.value(),
            };
          };
          const order = [...actions.keys()].sort(
            () => shuffle.next().value - 500
          );
          let stepped: unknown = value;
          let reviewed: unknown = value;
          let waiting: string[] = [];

          for (const change of order) {
            waiting = waiting.concat(change);
            const step = decide(stepped, waiting);

            if (step.result.status === 'blocked') continue;
            ({ reviewed, value: stepped } = step);
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
              batch: decide(value, [...actions.keys()]).reviewed,
              stepped: reviewed,
              waiting,
            },
            { batch: expected, stepped: expected, waiting: [] },
            `${JSON.stringify(offsets)} without "${removed}" (${intent}) in order ${order.join(',')}`
          );
        }
      ),
      { numRuns: 20 }
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

/** An editor with no schema, which takes any step a world's schema refuses. */
const schemaFreeEditor = (value: readonly Node[]) =>
  createEditor({ initialValue: structuredClone(value) as never });
const fillEditor = (
  world: World,
  value: readonly Node[],
  review?: Readonly<{ author: string; change: string }>
) =>
  throwingRefusals(
    createEditor({
      initialValue: structuredClone(value) as never,
      plugins: [
        world.plugin,
        ...(review
          ? [
              createAuthoredPlugin({
                authorId: review.author,
                createChangeId: () => review.change,
                intent: 'propose',
                now: () => 1,
              }),
            ]
          : []),
      ] as never,
    })
  );
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
const reviewer = (world: World, value: unknown) =>
  createEditor({
    initialValue: structuredClone(value) as never,
    plugins: [world.plugin, createAuthoredPlugin({ authorId: 'zed' })],
  });
const decideAll = (
  world: World,
  value: unknown,
  decisions: ReadonlyArray<
    Readonly<{ action: 'accept' | 'reject'; changes: readonly string[] }>
  >
) => {
  const editor = reviewer(world, value);
  const result = authoredTestApi(editor as never).decide(
    decisions.filter((decision) => decision.changes.length > 0)
  );

  return {
    children: reviewedValue(editor as never).children as readonly Node[],
    result,
    value: editor.read.value(),
  };
};
type RecordedStep = readonly [
  name: string,
  typed: string,
  authorBuiltFill: boolean,
];
type Recorded = Readonly<{
  change: string;
  steps: readonly RecordedStep[];
}>;
const emptyElementKeys = (editor: ReturnType<typeof fillEditor>) => {
  const keys = new Set<NodeKey>();
  const visit = (nodes: readonly Node[], parent: readonly number[]) => {
    nodes.forEach((node, index) => {
      const path = [...parent, index];

      if (!node.children) return;
      if (node.children.every((child) => child.text === '')) {
        const key = editor.key(path);

        if (key) keys.add(key);
      }
      visit(node.children, path);
    });
  };

  visit(editor.read.children() as readonly Node[], []);

  return keys;
};
/**
 * Editing replaying `steps` from the start as their authors saw them: a fill
 * a step builds where its author's view built none goes, and a step the plain
 * replay refuses, which its author's view took, applies without the schema,
 * which then judges the result once.
 */
const replayAsAuthorsSaw = (
  world: World,
  start: readonly Node[],
  steps: readonly RecordedStep[]
):
  | Readonly<{ kind: 'authorView' | 'plain'; value: readonly Node[] }>
  | Readonly<{ kind: 'noTarget' }>
  | Readonly<{ kind: 'refused' }> => {
  const editor = fillEditor(world, start);
  const unauthoredFills = new Set<NodeKey>();
  let schemaless: ReturnType<typeof schemaFreeEditor> | null = null;
  const unauthoredPaths = () =>
    [...emptyElementKeys(editor)]
      .filter((key) => unauthoredFills.has(key))
      .map((key) => editor.read.nodes.path(key))
      .filter((path) => path !== null && path !== undefined)
      .sort((left, right) => PathApi.compare(right, left));

  for (const [name, typed, authorBuiltFill] of steps) {
    const step = getDefinedGesture(world, name)(
      editingKids(expandedChildren(schemaless ?? editor)),
      typed
    );

    if (!step) return { kind: 'noTarget' };
    if (schemaless) {
      schemaless.update((tx) => {
        step(tx);
        tx.selection.set(null);
      });
      continue;
    }

    const before = emptyElementKeys(editor);

    try {
      editor.update((tx) => {
        step(tx);
        tx.selection.set(null);
      });
    } catch (error) {
      if (!isRefusal(error)) throw error;
      const gone = unauthoredPaths();
      const schemaFree = schemaFreeEditor(expandedChildren(editor));

      schemaFree.update((tx) => {
        for (const at of gone) tx.nodes.remove({ at });
        step(tx);
        tx.selection.set(null);
      });
      schemaless = schemaFree;
      continue;
    }
    if (authorBuiltFill) continue;
    for (const key of emptyElementKeys(editor)) {
      if (!before.has(key)) unauthoredFills.add(key);
    }
  }

  if (!schemaless) {
    const gone = unauthoredPaths();

    if (gone.length > 0) {
      editor.update((tx) => {
        for (const at of gone) tx.nodes.remove({ at });
        tx.selection.set(null);
      });
    }

    return {
      kind: gone.length === 0 ? 'plain' : 'authorView',
      value: expandedChildren(editor),
    };
  }

  const value = expandedChildren(schemaless) as readonly Node[];

  try {
    const judged = expandedChildren(
      fillEditor(world, value)
    ) as readonly Node[];

    return isDeepStrictEqual(plainNodes(judged), plainNodes(value))
      ? { kind: 'authorView', value }
      : { kind: 'refused' };
  } catch (error) {
    if (isRefusal(error)) return { kind: 'refused' };
    throw error;
  }
};
const getDefinedGesture = (world: World, name: string) => {
  const found = world.gestures[name];

  if (!found) throw new Error(`${world.name} has no gesture ${name}`);
  return found;
};

const fillLaw = (
  worldIndex: number,
  examples: typeof FILL_EXAMPLES,
  randomRuns: number
) => {
  const world = getDefinedWorld(worldIndex);
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
  let authorViews = 0;

  fc.assert(
    fc.property(
      fc.constant(worldIndex),
      fc.array(
        fc.record({
          author: fc.constantFrom('ann', 'bob'),
          gestures: fc.array(fc.nat(), { maxLength: 2, minLength: 1 }),
        }),
        { maxLength: 4, minLength: 1 }
      ),
      fc.array(fc.boolean(), { maxLength: 4, minLength: 4 }),
      (_world, history, accepts) => {
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
          const done: RecordedStep[] = [];

          for (const [part, pick] of step.gestures.entries()) {
            const name = getDefined(names[pick % names.length]);
            const typed = String.fromCharCode(77 + index * 2 + part);
            const inEditing = getDefinedGesture(world, name)(
              editingKids(expandedChildren(editing)),
              typed
            );

            if (!inEditing) continue;

            const editedBefore = expandedChildren(editing);
            const fillsBefore = emptyElementKeys(editing);

            try {
              editing.update((tx) => {
                inEditing(tx);
                tx.selection.set(null);
              });
            } catch (error) {
              if (isRefusal(error)) continue;
              throw error;
            }
            const authorBuiltFill = [...emptyElementKeys(editing)].some(
              (key) => !fillsBefore.has(key)
            );

            const inReview = getDefinedGesture(world, name)(
              proposedKids(expandedChildren(suggesting)),
              typed
            );

            if (!inReview) {
              // Removing what Editing rebuilds at once changes nothing.
              if (isDeepStrictEqual(expandedChildren(editing), editedBefore)) {
                continue;
              }
              // Only a fill a maximum defers (R1) leaves Editing a place
              // the review lacks.
              assert.ok(
                world.bounded,
                `"${name}" has no place in the review of ${world.name} after ${JSON.stringify([...recorded, { change, steps: done }])}\n${JSON.stringify(expandedChildren(suggesting))}`
              );
              unlocatable.set(
                `${world.name} | ${name}`,
                (unlocatable.get(`${world.name} | ${name}`) ?? 0) + 1
              );
              return;
            }
            const unmarked = unmarkedElements(expandedChildren(suggesting));
            const marksBefore = marksByChange(expandedChildren(suggesting));

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
              unmarkedElements(expandedChildren(suggesting)) <= unmarked,
              `the recorder slot built an unmarked element: ${world.name}, ${name}`
            );
            const marksAfter = marksByChange(expandedChildren(suggesting));

            joined ||= [...marksAfter].some(
              ([other, count]) =>
                other !== change && count > (marksBefore.get(other) ?? 0)
            );
            runs.set(
              `${world.name} | ${name}`,
              (runs.get(`${world.name} | ${name}`) ?? 0) + 1
            );
            done.push([name, typed, authorBuiltFill]);
          }
          if (done.length === 0) continue;
          review = expandedChildren(suggesting);
          edited = expandedChildren(editing);
          recorded.push({ change, steps: done });
        }

        const changes = recorded.map(({ change }) => change);

        if (changes.length === 0) return;
        const context = `${world.name}: ${JSON.stringify(recorded)}\n${JSON.stringify(review)}`;
        const accepted = decideAll(world, review, [
          { action: 'accept', changes },
        ]);

        if (
          !isDeepStrictEqual(plainNodes(accepted.children), plainNodes(edited))
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

        // Every order of one complete decision set ends where the batch
        // does. A batch the schema refuses decides nothing, while an order
        // still applies the decisions independent of the refused ones, so
        // each order of a refused batch is refused too.
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

        const loaded = reviewedValue(reviewer(world, review) as never)
          .children as readonly Node[];

        for (const order of permutations(changes)) {
          let value: unknown = review;
          let children = loaded;
          const pending = [...order];
          let refused = false;

          while (pending.length > 0) {
            const batch = new Set([getDefined(pending.shift())]);
            let step = decideAll(world, value, split([...batch]));

            while (step.result.status === 'blocked') {
              assert.ok(!everyOrder, `a decision waited in ${context}`);
              assert.deepEqual(
                step.children,
                children,
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
            refused ||= step.result.status === 'invalid';
            ({ children, value } = step);
          }
          orders += 1;
          if (together.result.status === 'invalid') {
            assert.ok(
              refused,
              `order ${order.join(', ')} applies a set its batch refuses in ${context}`
            );
            continue;
          }
          assert.deepEqual(
            children,
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

        for (let mask = 0; mask < 2 ** changes.length; mask += 1) {
          const kept = recorded.filter((_, index) => (mask >> index) & 1);
          const oracle = replayAsAuthorsSaw(
            world,
            start,
            kept.flatMap(({ steps }) => steps)
          );
          const outcome = decideAll(world, review, [
            { action: 'accept', changes: kept.map(({ change }) => change) },
            {
              action: 'reject',
              changes: changes.filter(
                (change) => !kept.some((item) => item.change === change)
              ),
            },
          ]);

          if (oracle.kind === 'noTarget') {
            leftOut += 1;
            continue;
          }
          if (oracle.kind === 'refused') {
            refusedSets += 1;
            assert.equal(
              outcome.result.status,
              'invalid',
              `a set Editing refuses applied in ${context}`
            );
            continue;
          }
          sets += 1;
          if (oracle.kind === 'authorView') authorViews += 1;
          assert.deepEqual(
            plainNodes(outcome.children),
            plainNodes(oracle.value),
            `accepting ${JSON.stringify(kept.map(({ change }) => change))} differs from Editing as its authors saw it in ${context}`
          );
        }
      }
    ),
    {
      examples,
      numRuns: examples.length + randomRuns,
      ...(seed ? { seed: Number(seed) } : {}),
    }
  );

  process.stdout.write(
    `fill law in ${world.name}: ${runs.size} gestures recorded, ${orders} orders, ${sets} decision sets, ${authorViews} differing from a plain replay, ${refusedSets} sets Editing refuses, ${leftOut} left out, ${coalesced} with joined insertions, ${[...unlocatable.values()].reduce((sum, count) => sum + count, 0)} histories reaching what a maximum deferred (${[...unlocatable].map(([key, count]) => `${key}: ${count}`).join('; ')}), ${liftedPendingUnwrap} lifting a pending unwrap, ${deferred.length} R1 deferrals, ${refusedAtMaximum.length} refusals at a maximum (${[...new Set(refusedAtMaximum)].join('; ')})\n${deferred.join('\n')}\n`
  );
  return { authorViews, refusedAtMaximum, runs };
};

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
const EMPTIED_BY: Readonly<Record<string, string>> = {
  'type into an empty cell': 'delete cell a',
  'type into an empty heading': 'delete the title',
  'type into an empty text': 'delete every character',
};
const FILL_EXAMPLES = [
  // Seed 1896659244: deleting the title behind Bob's pending heading built no
  // fill in Ann's view, so accepting Ann's changes alone builds none. Seed
  // 43389289 adds a deletion of the paragraph; seed 393318344 makes both of
  // Ann's steps one change of Bob's, in each order.
  example(TITLE, [
    ['bob', 'insert a heading above the prefix'],
    ['ann', 'delete the title'],
    ['ann', 'insert a heading above the prefix'],
  ]),
  example(TITLE, [
    ['bob', 'insert a heading above the prefix'],
    ['ann', 'insert a heading above the prefix'],
    ['ann', 'delete the title'],
  ]),
  example(TITLE, [
    ['bob', 'insert a heading above the prefix'],
    ['ann', 'delete the title'],
    ['ann', 'insert a heading above the prefix'],
    ['ann', 'delete the paragraph'],
  ]),
  example(TITLE, [
    ['ann', 'insert a heading above the prefix'],
    ['bob', 'delete the title', 'insert a heading above the prefix'],
    ['ann', 'delete the paragraph'],
  ]),
  example(TITLE, [
    ['ann', 'insert a heading above the prefix'],
    ['bob', 'insert a heading above the prefix', 'delete the title'],
    ['ann', 'delete the paragraph'],
  ]),
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
  // Under a maximum of two, only one change deleting both cells leaves an
  // empty cell to type into.
  example('grid of two cells under a minimum and maximum of two', [
    ['ann', 'delete cell a', 'delete cell b'],
    ['bob', 'type into an empty cell'],
  ]),
  example('two texts one change each empties (probe 4)', [
    ['ann', 'delete a'],
    ['bob', 'delete b'],
  ]),
  // Seed 825394039: once Bob's heading goes, the plain replay refuses Ann's
  // paragraph before the title, which her view took.
  example(
    TITLE,
    [
      ['bob', 'insert a heading above the prefix'],
      ['ann', 'insert a paragraph before the title'],
      ['ann', 'insert a heading above the prefix'],
    ],
    [false, false, false, false]
  ),
  // Seeds 4 and -1976749684: a refused batch beside an independent decision.
  example(
    TITLE,
    [
      ['ann', 'delete the body heading'],
      ['bob', 'insert a heading above the prefix'],
      ['ann', 'insert a paragraph before the title'],
    ],
    [false, false, true, false]
  ),
  // Seed -1657036058: the same, with the independent decision last.
  example(
    TITLE,
    [
      ['ann', 'insert a heading above the prefix'],
      ['bob', 'insert a paragraph before the title', 'delete the body heading'],
      ['ann', 'delete the paragraph'],
    ],
    [false, true, false, false]
  ),
  example('a parent-scoped static default on a text', [['ann', 'delete a']]),
  // Seed 5: only a first gesture finds b, so a random run can miss it.
  example('a parent-scoped static default on a text', [['ann', 'delete b']]),
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
// Every gesture as a first step, so coverage of one a first step can record
// never waits on a random history reaching it. Typing into an empty element
// follows the gesture that empties one.
const firstSteps = (world: (typeof WORLDS)[number]) =>
  Object.keys(world.gestures).map((name) => {
    const emptiedBy = EMPTIED_BY[name];

    return example(world.name, [
      emptiedBy && emptiedBy in world.gestures
        ? (['ann', emptiedBy, name] as const)
        : (['ann', name] as const),
    ]);
  });
const PINNED_PER_CASE = 4;
const permutations = <T>(items: readonly T[]): T[][] =>
  items.length <= 1
    ? [[...items]]
    : items.flatMap((item, index) =>
        permutations([...items.slice(0, index), ...items.slice(index + 1)]).map(
          (rest) => [item, ...rest]
        )
      );

describe('authored review tree fill laws', () => {
  for (const [worldIndex, world] of WORLDS.entries()) {
    it(`records every gesture of ${world.name} as Editing does and decides every change set as Editing replays it`, () => {
      const names = Object.keys(world.gestures);
      const unrecorded = (runs: ReadonlyMap<string, number>) =>
        names.filter((name) => !runs.has(`${world.name} | ${name}`));
      const first = fillLaw(
        worldIndex,
        firstSteps(world),
        Number(process.env.FILL_LAW_RUNS ?? 3)
      );
      const missing = unrecorded(first.runs);
      const reaching = FILL_EXAMPLES.filter(
        ([index, history]) =>
          index === worldIndex &&
          history.some(({ gestures }) =>
            gestures.some((at) => missing.includes(getDefined(names[at])))
          )
      );
      const rest =
        reaching.length > 0
          ? fillLaw(worldIndex, reaching, 0)
          : { refusedAtMaximum: [], runs: new Map<string, number>() };
      // A world whose recordings can overflow its maximum may refuse before a
      // gesture runs, so none of its gestures is required to record.
      const unexercised =
        first.refusedAtMaximum.length + rest.refusedAtMaximum.length > 0
          ? []
          : unrecorded(new Map([...first.runs, ...rest.runs]));

      assert.deepEqual(unexercised, [], 'every gesture records in its world');
    });

    const pinned = FILL_EXAMPLES.filter(([index]) => index === worldIndex);

    for (let from = 0; from < pinned.length; from += PINNED_PER_CASE) {
      const examples = pinned.slice(from, from + PINNED_PER_CASE);

      it(`decides every change set of ${world.name}'s pinned histories ${from + 1} to ${from + examples.length} as Editing replays it`, () => {
        fillLaw(worldIndex, examples, 0);
      });
    }
  }

  it('decides a set differently from a plain replay where its authors saw otherwise', () => {
    const [titleHistory] = FILL_EXAMPLES;
    const { authorViews } = fillLaw(titleHistory[0], [titleHistory], 0);

    assert.ok(
      authorViews > 0,
      'a decision set differs from a plain replay where its authors saw otherwise'
    );
  });
});

describe('authored review tree folded defects', () => {
  const p = (text: string): Node => ({
    type: 'paragraph',
    children: [{ text }],
  });
  const quote = (...children: Node[]): Node => ({ type: 'quote', children });
  const acceptsAll = recordedCase(acceptsLikePlainEditor({ plain: 0 }));

  it('accepts text typed over a quote line Bob split inside Alice’s pending deletion as Editing does (seed -1186800544)', () => {
    assert.ok(
      acceptsAll(
        [quote(p('ab'), p('cd')), p('ef'), p('gh')],
        [
          {
            author: 'alice',
            command: { from: 'f', kind: 'deleteRange', to: 'a' },
            intent: 'propose',
          },
          {
            author: 'bob',
            command: { at: 'g', kind: 'break', side: 0 },
            intent: 'propose',
          },
        ],
        { from: 'c', kind: 'typeOver', to: 'h' }
      )
    );
  });

  it('accepts everything after Alice types over a range holding the quote her Backspace struck (seed -904070578)', () => {
    const recorded = replay(
      [p('ab'), quote(p('cd')), p('ef'), p('gh')],
      [
        {
          author: 'alice',
          command: { at: 'c', direction: 'backward', kind: 'delete' },
          intent: 'propose',
        },
        {
          author: 'alice',
          command: { from: 'h', kind: 'typeOver', to: 'a' },
          intent: 'propose',
        },
      ]
    );

    assert.equal(decided(recorded, 'accept').status, 'applied');
  });

  it('accepts a physical deletion of lines Alice already struck as Editing does', () => {
    assert.ok(
      acceptsAll(
        [p('ab'), p('cd'), p('ef'), p('gh')],
        [
          {
            author: 'alice',
            command: { from: 'c', kind: 'deleteRange', to: 'g' },
            intent: 'propose',
          },
        ],
        { from: 'd', kind: 'deleteRange', to: 'g' }
      )
    );
  });

  it('accepts a physical deletion across lines Alice moved as Editing does', () => {
    assert.ok(
      acceptsAll(
        [p('ab'), quote(p('cd'), p('ef')), p('gh')],
        [
          {
            author: 'alice',
            command: { at: 'a', edge: 'after', kind: 'moveNode', to: 'g' },
            intent: 'propose',
          },
          {
            author: 'alice',
            command: { at: 'g', edge: 'before', kind: 'moveNode', to: 'a' },
            intent: 'edit',
          },
        ],
        { from: 'f', kind: 'deleteRange', to: 'a' }
      )
    );
  });

  it('records an Editing Delete at a quote’s edge as the accepted document shows it (f-23)', () => {
    const counts = commandCounts();

    commandCase(counts)(
      [p('ab'), p('cd'), quote(p('ef')), p('gh')],
      [
        {
          author: 'alice',
          command: { from: 'd', kind: 'deleteRange', to: 'e' },
          intent: 'propose',
        },
        {
          author: 'alice',
          command: { from: 'a', kind: 'typeOver', to: 'f' },
          intent: 'propose',
        },
      ],
      {
        at: { letter: 'a', side: 0 },
        direction: 'forward',
        kind: 'delete',
        unit: 'character',
      },
      'edit'
    );
    assert.equal(counts.compared, 1);
  });

  it('lands a letter typed after an Editing range delete as a plain editor does, after an Editing reorder moved the line a pending join pulls (seed 804742650)', () => {
    const counts = commandCounts();

    commandCase(counts)(
      [p('ab'), quote(p('cd'), p('ef'))],
      [
        {
          author: 'alice',
          command: { at: 'c', direction: 'backward', kind: 'delete' },
          intent: 'propose',
        },
        {
          author: 'alice',
          command: { kind: 'replaceChildren', shift: 1 },
          intent: 'edit',
        },
      ],
      {
        direction: 'backward',
        from: { letter: 'c', side: 0 },
        kind: 'fragment',
        to: { letter: 'e', side: 0 },
      },
      'edit'
    );
    assert.equal(counts.compared, 1);
  });

  it('keeps the line a suggested Delete empties at a quote’s edge (f-23)', () => {
    const counts = commandCounts();

    commandCase(counts)(
      [p('ab'), p('cd'), quote(p('ef')), p('gh')],
      [
        {
          author: 'alice',
          command: { from: 'd', kind: 'deleteRange', to: 'e' },
          intent: 'propose',
        },
        {
          author: 'alice',
          command: { from: 'a', kind: 'typeOver', to: 'f' },
          intent: 'propose',
        },
      ],
      {
        at: { letter: 'a', side: 0 },
        direction: 'forward',
        kind: 'delete',
        unit: 'character',
      },
      'propose'
    );
    assert.equal(counts.compared, 1);
  });

  it('records an Editing Enter in a line Alice struck across a quote (f-24)', () => {
    const counts = commandCounts();

    commandCase(counts)(
      [p('ab'), quote(p('cd'), p('ef')), p('gh')],
      [
        {
          author: 'alice',
          command: { from: 'g', kind: 'deleteRange', to: 'd' },
          intent: 'propose',
        },
        {
          author: 'alice',
          command: { from: 'a', kind: 'deleteRange', to: 'h' },
          intent: 'edit',
        },
      ],
      { at: { letter: 'g', side: 0 }, kind: 'break' },
      'edit'
    );
    assert.equal(counts.compared, 1);
  });

  it('keeps the line an Editing Enter splits off a pending join inside the quote that wraps it (f-27)', () => {
    const counts = commandCounts();

    commandCase(counts)(
      [p('ab'), p('cd')],
      [
        {
          author: 'alice',
          command: { at: 'c', direction: 'backward', kind: 'delete' },
          intent: 'propose',
        },
        {
          author: 'alice',
          command: { at: 'a', kind: 'wrap' },
          intent: 'edit',
        },
      ],
      { at: { letter: 'd', side: 0 }, kind: 'break' },
      'edit'
    );
    assert.equal(counts.compared, 1);
  });

  it('keeps the line a suggested Enter splits off a pending join inside the quote that wraps it (f-27)', () => {
    const counts = commandCounts();

    commandCase(counts)(
      [p('ab'), p('cd')],
      [
        {
          author: 'alice',
          command: { at: 'c', direction: 'backward', kind: 'delete' },
          intent: 'propose',
        },
        {
          author: 'alice',
          command: { at: 'a', kind: 'wrap' },
          intent: 'edit',
        },
      ],
      { at: { letter: 'd', side: 0 }, kind: 'break' },
      'propose'
    );
    assert.equal(counts.compared, 1);
  });

  it('keeps a line Alice split off outside the quote when Bob joins its source into the quote (seed 496851576)', () => {
    assert.ok(
      recordedCase(acceptsLikePlainEditor({ plain: 0 }))(
        [p('ab'), p('cd'), quote(p('ef'), p('gh'))],
        [
          {
            author: 'alice',
            command: { kind: 'replaceChildren', shift: 1 },
            intent: 'edit',
          },
          {
            author: 'alice',
            command: { at: 'b', kind: 'break', side: 0 },
            intent: 'propose',
          },
        ],
        { from: 'a', kind: 'deleteRange', to: 'h' }
      )
    );
  });

  it('keeps a line Bob moves after a pending join inside the quote that wraps it', () => {
    assert.ok(
      recordedCase(acceptsLikePlainEditor({ plain: 0 }))(
        [p('ab'), p('cd'), p('ef')],
        [
          {
            author: 'alice',
            command: { at: 'c', direction: 'backward', kind: 'delete' },
            intent: 'propose',
          },
          {
            author: 'alice',
            command: { at: 'a', kind: 'wrap' },
            intent: 'edit',
          },
        ],
        { at: 'e', edge: 'after', kind: 'moveNode', to: 'a' }
      )
    );
  });

  for (const [name, retyped] of [
    ['typed in Editing', { at: 'a', kind: 'type', side: 0 }],
    ['typed over in Editing', { from: 'a', kind: 'typeOver', to: 'a' }],
  ] as const) {
    it(`rejects everything after Bob splits a line Alice suggested, holding a letter ${name}, to the document before the split`, () => {
      const counts = commandCounts();

      commandCase(counts)(
        [p('ab'), p('cd')],
        [
          {
            author: 'alice',
            command: { kind: 'replaceChildren', shift: 1 },
            intent: 'propose',
          },
          { author: 'alice', command: retyped, intent: 'edit' },
        ],
        { at: { letter: 'a', side: 0 }, kind: 'break' },
        'propose'
      );
      assert.equal(counts.compared, 1);
    });
  }

  it('rejects everything after Bob splits a line inside his own suggested rotation, to the document before the split', () => {
    assert.ok(
      recordedCase(undoesSuggestion)(
        [p('ab'), p('cd'), quote(p('ef'))],
        [
          {
            author: 'bob',
            command: { kind: 'replaceChildren', shift: 2 },
            intent: 'propose',
          },
          {
            author: 'alice',
            command: { at: 'f', kind: 'transferText', to: 'a' },
            intent: 'edit',
          },
          {
            author: 'alice',
            command: { at: 'a', kind: 'transferText', to: 'f' },
            intent: 'edit',
          },
        ],
        { at: 'a', kind: 'break', side: 1 }
      )
    );
  });

  it('undoes accepting Bob’s suggested text moves and rotation over Alice’s rotations (seed 225757176)', () => {
    assert.equal(
      undoRestores(
        [p('ab'), p('cd')],
        [
          {
            author: 'alice',
            command: { kind: 'replaceChildren', shift: 1 },
            intent: 'propose',
          },
          {
            author: 'alice',
            command: { kind: 'replaceChildren', shift: 1 },
            intent: 'edit',
          },
        ],
        [
          { at: 'd', kind: 'transferText', to: 'a' },
          { at: 'a', kind: 'transferText', to: 'd' },
          { kind: 'replaceChildren', shift: 1 },
        ],
        'propose',
        'accept'
      ),
      'compared'
    );
  });

  it('accepts Bob’s Editing fragment delete across text Alice moved and struck as a plain editor does (seed -1756456884)', () => {
    const counts = commandCounts();

    commandCase(counts)(
      [p('ab'), quote(p('cd'), p('ef'))],
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
        {
          author: 'alice',
          command: { at: 'd', kind: 'transferText', to: 'a' },
          intent: 'edit',
        },
      ],
      {
        direction: 'backward',
        from: { letter: 'a', side: 0 },
        kind: 'fragment',
        to: { letter: 'e', side: 0 },
      },
      'edit'
    );
    assert.equal(counts.compared, 1);
  });

  // Alice's pending join pulls `c` up into `ab`, and Dan's split leaves `d`
  // as a piece that follows it inside the quote.
  const joinedQuote = [
    {
      author: 'alice',
      command: { at: 'c', direction: 'backward', kind: 'delete' },
      intent: 'propose',
    },
    {
      author: 'alice',
      command: { at: 'a', kind: 'wrap' },
      intent: 'edit',
    },
    {
      author: 'dan',
      command: { at: 'd', kind: 'break', side: 0 },
      intent: 'propose',
    },
  ] as const satisfies readonly Edit[];

  it('lands a line moved before a split piece that follows a pending join where the frame shows it, in both intents', () => {
    const before = replay([p('ab'), p('cd'), p('ef')], joinedQuote);

    for (const intent of ['edit', 'propose'] as const) {
      const moved = apply(
        before,
        {
          author: 'bob',
          command: { at: 'e', edge: 'before', kind: 'transferNode', to: 'd' },
          intent,
        },
        'bob:last',
        TYPED
      );

      assert.deepEqual(
        moved && projection(moved, 'proposed'),
        [quote(p('abc'), p('ef'), p('d'))],
        intent
      );
    }
  });

  it('inserts a line by path before a split piece that follows a pending join without the join taking it, in both intents', () => {
    const before = replay([p('ab'), p('cd'), p('ef')], joinedQuote);

    for (const intent of ['edit', 'propose'] as const) {
      const editor = editorFor(before, 'bob', intent, 'bob:last');

      editor.update((tx) => tx.nodes.insert(p('X') as never, { at: [0, 1] }));
      assert.deepEqual(
        projection(expandedChildren(editor) as readonly Node[], 'proposed'),
        [quote(p('abc'), p('X'), p('d')), p('ef')],
        intent
      );
    }
  });

  it('keeps a line Bob’s Editing move puts among a pending join’s followers with the join after Dan’s split is rejected', () => {
    const before = replay([p('ab'), p('cd'), p('ef')], joinedQuote);
    const moved = getDefined(
      apply(
        before,
        {
          author: 'bob',
          command: { at: 'e', edge: 'before', kind: 'transferNode', to: 'd' },
          intent: 'edit',
        },
        'bob:last',
        TYPED
      )
    );
    const editor = editorFor(moved, 'carol', 'edit', 'carol:1');

    for (const [action, change] of [
      ['reject', 'dan:2'],
      ['accept', 'alice:0'],
    ] as const) {
      assert.equal(
        authoredTestApi(editor).decide({ action, changes: [change] }).status,
        'applied'
      );
    }
    assert.deepEqual(reviewedValue(editor).children, [
      quote(p('abc'), p('efd')),
    ]);
  });

  it('reads the proposed children of a quote whose only line is struck before a pending join', () => {
    const struck = {
      at: 1,
      author: 'alice',
      change: 'alice:2',
      kind: 'delete',
    };

    assertProposedChildren([
      {
        children: [
          {
            authored: [struck],
            children: [{ authored: [struck], text: 'ab' }],
            type: 'paragraph',
          },
        ],
        type: 'quote',
      },
      {
        authored: [{ at: 1, author: 'alice', change: 'alice:0', kind: 'join' }],
        children: [{ text: 'cd' }],
        type: 'paragraph',
      },
    ]);
  });

  it('reads the proposed children of a quote whose emptied line Bob moves out after Alice’s Enter split her joined deletion (seed -2021479456)', () => {
    const suggested = apply(
      replay(
        [quote(p('ab'), p('cd')), p('ef'), p('gh')],
        [
          {
            author: 'alice',
            command: { from: 'd', kind: 'deleteRange', to: 'h' },
            intent: 'propose',
          },
          {
            author: 'alice',
            command: { at: 'd', kind: 'break', side: 0 },
            intent: 'edit',
          },
        ]
      ),
      {
        author: 'bob',
        command: { at: 'h', edge: 'after', kind: 'moveNode', to: 'e' },
        intent: 'propose',
      },
      'bob:last',
      TYPED
    );

    assert.ok(suggested);
    assertProposedChildren(suggested);
  });

  it('keeps the letter Alice suggested deleting when Bob’s Editing Backspace after it empties the quote line (seed -2124377103)', () => {
    const counts = commandCounts();

    commandCase(counts)(
      [p('ab'), p('cd'), p('ef'), quote(p('gh'))],
      [
        {
          author: 'alice',
          command: { from: 'g', kind: 'deleteRange', to: 'h' },
          intent: 'propose',
        },
      ],
      {
        at: { letter: 'h', side: 1 },
        direction: 'backward',
        kind: 'delete',
        unit: 'character',
      },
      'edit'
    );
    assert.equal(counts.compared, 1);
  });

  // In this test and the next, Alice's suggestion strikes every line of the
  // quote, so accepting it leaves the quote only the empty line completion
  // gives it.
  it('types the next letter into the line a struck quote keeps after Bob’s Delete lands the caret there', () => {
    const counts = commandCounts();

    for (const intent of ['edit', 'propose'] as const) {
      commandCase(counts)(
        [p('ab'), p('cd')],
        [
          {
            author: 'alice',
            command: { kind: 'replaceChildren', shift: 1 },
            intent: 'propose',
          },
          {
            author: 'alice',
            command: { at: 'a', kind: 'break', side: 0 },
            intent: 'edit',
          },
          {
            author: 'alice',
            command: { at: 'd', kind: 'wrap' },
            intent: 'edit',
          },
        ],
        {
          at: { letter: 'a', side: 0 },
          direction: 'forward',
          kind: 'delete',
          unit: 'character',
        },
        intent
      );
    }
    assert.equal(counts.compared, 2);
  });

  it('starts Bob’s deletion from struck text before a struck quote at the next line the quote does not hold', () => {
    const counts = commandCounts();

    for (const intent of ['edit', 'propose'] as const) {
      commandCase(counts)(
        [p('ab'), p('cd'), p('ef'), p('gh')],
        [
          {
            author: 'alice',
            command: { from: 'a', kind: 'deleteRange', to: 'd' },
            intent: 'propose',
          },
          {
            author: 'alice',
            command: { at: 'c', kind: 'wrap' },
            intent: 'edit',
          },
        ],
        {
          direction: 'backward',
          from: { letter: 'g', side: 0 },
          kind: 'fragment',
          to: { letter: 'a', side: 0 },
        },
        intent
      );
    }
    assert.equal(counts.compared, 2);
  });

  // Accepting Bob's suggestions opens the document with a quote that holds
  // only its completion line, and his range ends in struck text right after it.
  it('places Bob’s range whose end has no line before the completion line it reaches back into', () => {
    const counts = commandCounts();

    commandCase(counts)(
      [p('ab'), quote(p('cd')), quote(p('ef')), p('gh')],
      [
        {
          author: 'bob',
          command: { at: 'd', kind: 'transferText', to: 'b' },
          intent: 'propose',
        },
        {
          author: 'bob',
          command: { kind: 'replaceChildren', shift: 2 },
          intent: 'propose',
        },
        {
          author: 'bob',
          command: { at: 'b', kind: 'wrap' },
          intent: 'propose',
        },
      ],
      {
        direction: 'forward',
        from: { letter: 'c', side: 0 },
        kind: 'fragment',
        to: { letter: 'h', side: 0 },
      },
      'propose'
    );
    assert.equal(counts.compared, 1);
  });

  it('reads the proposed children of a line that keeps the joined line’s text after Bob strikes the last letter Alice’s joined deletion left it (seed 1617081736)', () => {
    const suggested = apply(
      replay(
        [p('ab'), p('cd')],
        [
          {
            author: 'alice',
            command: { from: 'd', kind: 'deleteRange', to: 'a' },
            intent: 'propose',
          },
        ]
      ),
      {
        author: 'bob',
        command: { at: 'b', direction: 'backward', kind: 'delete' },
        intent: 'propose',
      },
      'bob:last',
      TYPED
    );

    assert.ok(suggested);
    assertProposedChildren(suggested);
  });

  it('accepts Alice’s changes one at a time after her suggested rotation copies a line her Editing move put among a pending join’s followers (seed -1078156175)', () => {
    let value: unknown = replay(
      [p('ab'), p('cd'), quote(p('ef'), p('gh'))],
      [
        {
          author: 'alice',
          command: { at: 'e', direction: 'backward', kind: 'delete' },
          intent: 'propose',
        },
        {
          author: 'alice',
          command: { at: 'g', edge: 'after', kind: 'moveNode', to: 'c' },
          intent: 'edit',
        },
        {
          author: 'alice',
          command: { kind: 'replaceChildren', shift: 1 },
          intent: 'propose',
        },
      ]
    );

    for (const change of ['alice:2', '~edit:alice', 'alice:0']) {
      const editor = editorFor(
        value as readonly Node[],
        'carol',
        'edit',
        'carol:1'
      );

      authoredTestApi(editor).decide({ action: 'accept', changes: [change] });
      value = editor.read.value();
    }
    assert.deepEqual(
      reviewedValue(
        editorFor(value as readonly Node[], 'carol', 'edit', 'carol:1')
      ).children,
      [p('cdef'), p('gh'), quote(p('')), p('ab')]
    );
  });

  it('accepts everything after undoing and redoing Bob’s Editing move of a letter Alice suggested deleting (seed -2004105441)', () => {
    assert.equal(
      undoRestores(
        [p('ab'), p('cd'), quote(p('ef'), p('gh'))],
        [
          {
            author: 'alice',
            command: { kind: 'replaceChildren', shift: 1 },
            intent: 'propose',
          },
          {
            author: 'alice',
            command: { at: 'a', kind: 'break', side: 0 },
            intent: 'edit',
          },
        ],
        [
          { at: 'a', kind: 'transferText', to: 'h' },
          { from: 'a', kind: 'deleteRange', to: 'a' },
        ],
        'edit',
        'accept'
      ),
      'compared'
    );
  });

  it('accepts everything after undoing and redoing Bob’s Editing moves of letters into a line Alice suggested moving (seed 1489020932)', () => {
    assert.equal(
      undoRestores(
        [p('ab'), quote(p('cd'), p('ef'))],
        [
          {
            author: 'alice',
            command: { at: 'a', kind: 'nest', side: 0 },
            intent: 'propose',
          },
          {
            author: 'alice',
            command: { at: 'a', kind: 'nest', side: 0 },
            intent: 'propose',
          },
          {
            author: 'alice',
            command: { at: 'f', edge: 'after', kind: 'moveNode', to: 'a' },
            intent: 'propose',
          },
        ],
        [
          { at: 'c', kind: 'transferText', to: 'e' },
          { at: 'f', kind: 'transferText', to: 'e' },
        ],
        'edit',
        'accept'
      ),
      'compared'
    );
  });

  it('accepts Bob’s Editing delete from before a quote through the line Alice’s pending join merges into as a plain editor does (seed 1225982517)', () => {
    const counts = commandCounts();

    commandCase(counts)(
      [p('ab'), quote(p('cd'), p('ef'))],
      [
        {
          author: 'alice',
          command: { at: 'a', kind: 'nest', side: 0 },
          intent: 'propose',
        },
        {
          author: 'alice',
          command: { at: 'a', kind: 'nest', side: 0 },
          intent: 'propose',
        },
        {
          author: 'alice',
          command: { at: 'e', direction: 'backward', kind: 'delete' },
          intent: 'propose',
        },
      ],
      {
        direction: 'backward',
        from: { letter: 'e', side: 1 },
        kind: 'fragment',
        to: { letter: 'b', side: 0 },
      },
      'edit'
    );
    assert.equal(counts.compared, 1);
  });

  it('accepts Bob’s Editing delete across an empty line and the line Alice’s pending join merges into as a plain editor does (seed -1526588553)', () => {
    const counts = commandCounts();

    commandCase(counts)(
      [p('ab'), p('cd'), p('ef')],
      [
        {
          author: 'alice',
          command: { at: 'a', kind: 'break', side: 0 },
          intent: 'edit',
        },
        {
          author: 'alice',
          command: { at: 'c', direction: 'backward', kind: 'delete' },
          intent: 'propose',
        },
        {
          author: 'alice',
          command: { kind: 'replaceChildren', shift: 3 },
          intent: 'edit',
        },
      ],
      {
        direction: 'backward',
        from: { letter: 'c', side: 1 },
        kind: 'fragment',
        to: { letter: 'f', side: 0 },
      },
      'edit'
    );
    assert.equal(counts.compared, 1);
  });
});

describe('authored review delta law', () => {
  type DeltaStep =
    | Readonly<{
        command: Command;
        intent: 'edit' | 'propose';
        kind: 'command';
      }>
    | Readonly<{ at: string; kind: 'forced'; side: number }>
    | Readonly<{ action: 'accept' | 'reject'; kind: 'decide' }>;
  type Watched = Readonly<{
    mode: 'accepted' | 'proposed' | null;
    view: Editor;
  }>;
  type Shown = ReadonlyMap<
    string,
    Readonly<{ block: unknown; cards: string; ids: readonly string[] }>
  >;
  type Reads = Readonly<{
    read: Readonly<{
      authored: Record<string, (query: object) => any>;
      children: () => readonly unknown[];
    }>;
  }>;

  const deltaStepArbitrary: fc.Arbitrary<DeltaStep> = fc.oneof(
    {
      arbitrary: fc.record({
        command: commandArbitrary(LETTERS.slice(0, 8)),
        intent: fc.constantFrom('edit' as const, 'propose' as const),
        kind: fc.constant('command' as const),
      }),
      weight: 5,
    },
    {
      arbitrary: fc.record({
        at: letterArbitrary(LETTERS.slice(0, 8)),
        kind: fc.constant('forced' as const),
        side: fc.constantFrom(0, 1),
      }),
      weight: 2,
    },
    {
      arbitrary: fc.record({
        action: fc.constantFrom('accept' as const, 'reject' as const),
        kind: fc.constant('decide' as const),
      }),
      weight: 2,
    }
  );

  // Each top-level block a view shows, by its key, with its read's card ids.
  const shownOf = ({ view }: Watched): Shown =>
    new Map(
      (view as unknown as Reads).read.children().map((shown, rank) => {
        const key = getDefined(view.key([rank]));
        const { authored } = (view as unknown as Reads).read;
        const idsOf = (items: ReadonlyArray<{ id: string }>) =>
          items.map(({ id }) => id).sort();

        return [
          key,
          {
            block: shown,
            cards: idsOf(authored.groups({ at: key })).join(' '),
            ids: idsOf(authored.changes({ at: key, limit: 200 }).items),
          },
        ];
      })
    );
  it('names each top-level view block whose read of cards changed since its publisher last published, under each preview and with none', () => {
    const counts = {
      batches: 0,
      named: 0,
      publications: 0,
      rewritten: 0,
    };

    fc.assert(
      fc.property(
        documentArbitrary,
        historyArbitrary,
        fc.array(fc.array(deltaStepArbitrary, { maxLength: 3, minLength: 1 }), {
          maxLength: 4,
          minLength: 1,
        }),
        (initial, recorded, batches) => {
          const value = replay(initial, recorded);
          let minted = recorded.length;
          const leader = editorFor(
            value,
            'bob',
            'propose',
            () => `bob:${(minted += 1)}`,
            Quotes
          );
          const ledger = getDefined(getReviewLedger(leader as never));
          const stored = () =>
            leader.read.value() as unknown as JsonEditorValue;
          const watched: Watched[] = [
            { mode: null, view: leader },
            ...(['accepted', 'proposed'] as const).map((mode) => ({
              mode,
              view: createEditorView(leader, {
                authored: { preview: mode },
              }) as unknown as Editor,
            })),
          ];
          const publishers = watched.map((each) => {
            const sink = ledger.subscribe(stored(), each.mode);
            const delivered = new Set<string>();

            each.view.api.authored.subscribeChanges((delta) => {
              for (const key of delta.blocks) delivered.add(key);
            });

            return {
              delivered,
              shown: shownOf(each),
              sink,
            };
          });
          const label = `after ${JSON.stringify(batches)}`;

          for (const [batch, steps] of batches.entries()) {
            for (const step of steps) {
              try {
                if (step.kind === 'command') {
                  leader.api.authored.setView({ intent: step.intent });
                  run(leader, step.command, 'XYZWV'[batch % 5]);
                } else if (step.kind === 'forced') {
                  const at = locate(leader, step.at);

                  if (!at) continue;

                  const caret = { ...at, offset: at.offset + step.side };

                  leader.api.authored.setView({ intent: 'edit' });
                  leader.update((tx) => {
                    tx.authored.propose({ changeId: 'bob:ai' });
                    tx.selection.set({ anchor: caret, focus: caret });
                    tx.text.insert('Q');
                  });
                } else {
                  const ids = changesIn(rootChildren(leader));

                  if (ids.length > 0) {
                    authoredTestApi(leader).decide({
                      action: step.action,
                      changes: ids.slice(0, 1),
                    });
                  }
                }
              } catch (error) {
                // A command can still write marks the admission check refuses,
                // which is not what this law judges.
                if (
                  !isRefusal(error) &&
                  !(error instanceof AuthoredMarkError)
                ) {
                  throw error;
                }
              }
            }
            counts.batches += 1;
            for (const [at, each] of watched.entries()) {
              const publisher = getDefined(publishers[at]);
              const { ranks } = ledger.publish(
                stored(),
                publisher.sink,
                each.mode,
                'main'
              );
              const named = new Set<string>(
                ranks.map((rank) => getDefined(each.view.key([rank])))
              );
              const shown = shownOf(each);
              const where = `${each.mode ?? 'stored'} batch ${batch} ${label}`;

              counts.publications += 1;
              counts.named += named.size;
              for (const [key, now] of shown) {
                const was = publisher.shown.get(key);

                if (!was || was.cards === now.cards) continue;
                if (was.block !== now.block) {
                  counts.rewritten += 1;
                  continue;
                }
                assert.ok(
                  named.has(key) && publisher.delivered.has(key),
                  `${where}: the publication names ${key}, whose cards went from [${was.cards}] to [${now.cards}]`
                );
              }
              publisher.delivered.clear();
              publisher.shown = shown;
            }
          }
        }
      ),
      { numRuns: 20, seed: LEDGER_SEED }
    );
    console.info(`delta law seed ${LEDGER_SEED}:`, counts);
    assert.ok(
      counts.named > 40 && counts.publications > 60,
      `only ${JSON.stringify(counts)}`
    );
  });
});

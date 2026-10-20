import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  createEditorView,
  defineEditorSchema,
  definePlugin,
  editorCommands,
  property,
  schema,
  target,
} from 'plitejs';

import { createAuthoredPlugin } from '../src/authored/authored';
import { getReviewLedger } from '../src/authored/ledger/ledger';
import { projectAuthoredFragment } from '../src/authored/tree/resolve';
import { DocumentIndex } from '../src/core/change/document-index';
import { getDefined } from '../src/internal/get-defined';
import { authoredTestApi } from './support/authored';

const struck = { at: 1, author: 'bob', change: 'bob:1', kind: 'delete' };
const paragraph = (text: string) => ({
  type: 'paragraph',
  children: [{ text }],
});
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

const Columns = defineEditorSchema('projection-columns', {
  elements: {
    column: { content: schema.content.type('paragraph', { min: 1 }) },
    column_group: { content: schema.content.type('column', { min: 2 }) },
    paragraph: { content: schema.content.text() },
  },
  id: 'projection-columns',
  properties: [
    schema.elementProperty('width', property.number(), {
      target: target.type('column'),
    }),
  ],
  root: schema.content.any(
    [schema.content.type('paragraph'), schema.content.type('column_group')],
    { default: { type: 'paragraph' }, min: 1 }
  ),
  unknown: 'reject',
  version: 1,
});

// Column widths add up to 100, as the column plugin's correction keeps them.
const ColumnWidths = definePlugin('projection-column-widths', {
  corrections: [
    {
      event: 'children',
      query: { type: 'column_group' },
      correct({ entry, tx }) {
        const [group, path] = entry as [
          { children: Array<{ width?: number }> },
          number[],
        ];
        const total = group.children.reduce(
          (sum, column) => sum + (column.width ?? 0),
          0
        );

        if (total === 100 || total === 0) return;
        group.children.forEach((column, index) => {
          tx.nodes.set(
            { width: ((column.width ?? 0) * 100) / total },
            { at: [...path, index] }
          );
        });
      },
    },
  ],
});

describe('authored review tree projections', () => {
  it('reads correction-derived values unrecomputed in the pure proposed read, and names the container', () => {
    const editor = createEditor({
      plugins: [
        Columns,
        ColumnWidths,
        createAuthoredPlugin({ authorId: 'bob' }),
      ],
      initialValue: [
        {
          type: 'column_group',
          children: [
            { type: 'column', width: 25, children: [paragraph('a')] },
            { type: 'column', width: 25, children: [paragraph('b')] },
            whole(
              { type: 'column', width: 50, children: [paragraph('c')] },
              struck
            ),
          ],
        },
      ],
    });
    const proposed = authoredTestApi(editor).project('proposed');

    authoredTestApi(editor).decide({ action: 'accept', changes: ['bob:1'] });

    const widths = (children: readonly unknown[]) =>
      (children[0] as { children: Array<{ width: number }> }).children.map(
        (column) => column.width
      );

    assert.deepEqual(widths(proposed.value.children), [25, 25]);
    assert.deepEqual(widths(editor.read.children()), [50, 50]);
    assert.deepEqual(proposed.diagnostics, [
      {
        code: 'authored-uncorrected',
        message:
          'A decision restructured the children of column_group, and corrections that depend on them did not run.',
        path: [0],
        severity: 'warning',
        type: 'column_group',
      },
    ]);
  });

  it('reads a fragment under a struck table as removed by projecting the whole document first', () => {
    const value = {
      children: [
        whole(
          {
            type: 'table',
            children: [
              {
                type: 'row',
                children: [{ type: 'cell', children: [paragraph('x')] }],
              },
            ],
          },
          struck
        ),
        paragraph('after'),
      ],
    };

    assert.deepEqual(
      projectAuthoredFragment(value, 'proposed', [[0, 0, 0, 0], [1]]),
      [null, paragraph('after')]
    );
    assert.deepEqual(
      projectAuthoredFragment(value, 'accepted', [[0, 0, 0, 0]]),
      [paragraph('x')]
    );
  });

  it('reads the left block of a join as the merged block the projection holds', () => {
    const value = {
      children: [
        paragraph('a'),
        { ...paragraph('b'), authored: [{ ...struck, kind: 'join' }] },
      ],
    };

    assert.deepEqual(projectAuthoredFragment(value, 'proposed', [[0], [1]]), [
      paragraph('ab'),
      null,
    ]);
  });
});

describe('authored preview reads of a block a pending join passes and hides whole', () => {
  type Block = Readonly<{
    authored?: readonly unknown[];
    children: readonly unknown[];
    type: string;
  }>;
  type Reader = Readonly<{
    key: (path: readonly number[]) => string | undefined;
    read: Readonly<{
      authored: Readonly<{
        changes: (options: { at: unknown }) => {
          items: ReadonlyArray<{ id: string }>;
        };
      }>;
      children: () => readonly Block[];
    }>;
  }>;

  const Quotes = defineEditorSchema('projection-quotes', {
    elements: {
      paragraph: schema.element.textBlock(),
      quote: {
        content: schema.content.types(['paragraph', 'quote'], {
          default: { type: 'paragraph' },
          min: 1,
        }),
      },
    },
    id: 'projection-quotes',
    root: schema.content.types(['paragraph', 'quote'], {
      default: { type: 'paragraph' },
      min: 1,
    }),
    unknown: 'reject',
    version: 1,
  });
  const by = (author: string, kind: string, extra = {}) => ({
    at: 1,
    author,
    change: `${author}:1`,
    kind,
    ...extra,
  });
  const line = (text: string, ...authored: object[]): Block => ({
    ...(authored.length > 0 && { authored }),
    children: [{ text }],
    type: 'paragraph',
  });
  const quote = (...children: Block[]): Block => ({ children, type: 'quote' });
  const ab = line('ab');
  const c = line('c', by('alice', 'join'));
  const uv = line('uv', by('bob', 'split', { follows: '["alice:1",1]' }));
  const deleted: Block = {
    authored: [by('dan', 'delete')],
    children: [{ authored: [by('dan', 'delete')], text: 'H' }],
    type: 'paragraph',
  };
  const texts = (blocks: readonly Block[]): unknown[] =>
    blocks.map((block) =>
      block.type === 'quote'
        ? texts(block.children as Block[])
        : (block.children as Array<{ text: string }>)
            .map(({ text }) => text)
            .join('')
    );
  const previewOf = (value: readonly Block[], preview: string): Reader =>
    createEditorView(
      createEditor({
        initialValue: structuredClone(value) as never,
        plugins: [
          Quotes,
          createAuthoredPlugin({
            authorId: 'zed',
            createChangeId: () => 'zed:1',
            intent: 'propose',
            now: () => 1,
          }),
        ],
      }),
      { authored: { preview } } as never
    ) as unknown as Reader;
  const reads = (view: Reader) => {
    const all: Array<[string, string[], string[]]> = [];
    const walk = (blocks: readonly Block[], path: readonly number[]) => {
      for (const [index, block] of blocks.entries()) {
        const at = [...path, index];
        const ids = (where: unknown) =>
          view.read.authored.changes({ at: where }).items.map(({ id }) => id);

        all.push([at.join('.'), ids(at), ids(view.key(at))]);
        if (block.type === 'quote') walk(block.children as Block[], at);
      }
    };

    walk(view.read.children(), []);

    return all;
  };
  const expectReads = (
    value: readonly Block[],
    preview: string,
    shown: unknown[],
    expected: Record<string, readonly string[]>
  ) => {
    const view = previewOf(value, preview);

    assert.deepEqual(texts(view.read.children()), shown);
    assert.deepEqual(
      reads(view).toSorted(([left], [right]) => left.localeCompare(right)),
      Object.entries(expected)
        .map(([at, ids]) => [at, ids, ids])
        .toSorted(([left], [right]) =>
          String(left).localeCompare(String(right))
        )
    );
  };

  it('reads in no block a paragraph deleted after the joined line, beside the quote the line ends', () => {
    const value = [quote(ab), c, deleted, uv];

    expectReads(value, 'proposed', [['abc', 'uv']], {
      '0': ['alice:1', 'bob:1'],
      '0.0': ['alice:1'],
      '0.1': ['bob:1'],
    });
    expectReads(value, 'accepted', [['ab'], 'c', 'Huv'], {
      '0': [],
      '0.0': [],
      '1': ['alice:1'],
      '2': ['dan:1', 'bob:1'],
    });
  });

  it('reads a paragraph deleted after the joined line inside its quote on the quote, not on the line', () => {
    const value = [quote(ab, c, deleted), uv];

    expectReads(value, 'proposed', [['abc', 'uv']], {
      '0': ['alice:1', 'dan:1', 'bob:1'],
      '0.0': ['alice:1'],
      '0.1': ['bob:1'],
    });
    expectReads(value, 'accepted', [['ab', 'c', 'Huv']], {
      '0': ['alice:1', 'dan:1', 'bob:1'],
      '0.0': [],
      '0.1': ['alice:1'],
      '0.2': ['dan:1', 'bob:1'],
    });
  });

  it('reads a paragraph deleted inside a quote the follower passes on that quote and the line completion fills it with', () => {
    const value = [ab, c, quote(deleted), uv];

    expectReads(value, 'proposed', ['abc', 'uv', ['']], {
      '0': ['alice:1'],
      '1': ['bob:1'],
      '2': ['dan:1'],
      '2.0': ['dan:1'],
    });
    expectReads(value, 'accepted', ['ab', 'c', ['Huv']], {
      '0': [],
      '1': ['alice:1'],
      '2': ['dan:1', 'bob:1'],
      '2.0': ['dan:1', 'bob:1'],
    });
  });

  it("reads a paragraph deleted inside a quote between a joined line's pieces on that quote, not on the line", () => {
    const value = [ab, quote(deleted), c];
    const proposed = reads(previewOf(value, 'proposed'));

    assert.deepEqual(
      proposed.filter(([at]) => at !== '1'),
      [
        ['0', ['alice:1'], ['alice:1']],
        ['1.0', ['dan:1'], ['dan:1']],
      ],
      "the quote's own row, left out, also reads Alice's join, because `c` shows before the quote with no order that says so and the run's alignment is a diff"
    );
    expectReads(value, 'accepted', ['ab', ['H'], 'c'], {
      '0': [],
      '1': ['dan:1'],
      '1.0': ['dan:1'],
      '2': ['alice:1'],
    });
  });

  it('maps each letter after a follower inside a nested quote where it shows, and keeps the next key, in both intents', () => {
    type Leaf = Readonly<{ path: readonly number[]; text: string }>;
    type Editor = Readonly<{
      api: {
        authored: {
          subscribeRefusals: (listener: (refusal: unknown) => void) => void;
        };
      };
      read: Readonly<{
        children: () => readonly Block[];
        value: () => { children: readonly Block[] };
      }>;
      update: (
        run: (
          tx: Readonly<{
            command: (command: unknown, input: unknown) => void;
            selection: { set: (selection: unknown) => void };
          }>
        ) => void
      ) => void;
    }>;
    const leaves = function* (
      blocks: readonly unknown[],
      path: readonly number[] = []
    ): Generator<Leaf> {
      for (const [index, node] of blocks.entries()) {
        const { children, text } = node as {
          children?: readonly unknown[];
          text?: string;
        };

        if (typeof text === 'string') yield { path: [...path, index], text };
        else yield* leaves(children ?? [], [...path, index]);
      }
    };
    const editorOf = (value: unknown, intent: 'edit' | 'propose') => {
      let ids = 0;

      return createEditor({
        initialValue: structuredClone(value) as never,
        plugins: [
          Quotes,
          createAuthoredPlugin({
            authorId: 'dave',
            createChangeId: () => `dave:${(ids += 1)}`,
            intent,
            now: () => 1,
          }),
        ],
      }) as unknown as Editor;
    };
    const proposed = (editor: Editor) =>
      (
        createEditorView(
          editor as never,
          {
            authored: { preview: 'proposed' },
          } as never
        ) as unknown as Reader
      ).read.children();
    const typeAfter = (editor: Editor, letter: string) => {
      const leaf = [...leaves(editor.read.children())].find(({ text }) =>
        text.includes(letter)
      );
      const at = {
        offset: (leaf?.text.indexOf(letter) ?? 0) + 1,
        path: leaf?.path,
      };

      editor.update((tx) => {
        tx.selection.set({ anchor: at, focus: at });
        tx.command(editorCommands.insertText, { text: 'Z' });
      });
    };
    const places = (editor: Editor) => {
      const stored = editor.read.value();
      const shown = proposed(editor);
      const before = DocumentIndex.fromValue(stored.children as never);
      const after = DocumentIndex.fromValue(shown as never);
      const map = getDefined(getReviewLedger(editor as never)).projectionMap(
        stored as never,
        'proposed'
      );
      const at = (
        index: DocumentIndex,
        blocks: readonly unknown[],
        letter: string
      ) => {
        const leaf = getDefined(
          [...leaves(blocks)].find(({ text }) => text.includes(letter))
        );

        return index.positionAt({
          offset: leaf.text.indexOf(letter),
          path: leaf.path,
        });
      };

      return ['x', 'y'].map((letter) => {
        const from = at(before, stored.children, letter);

        return [
          letter,
          [
            map.toProjected('main', from, 'forward'),
            map.toProjected('main', from + 1, 'backward'),
          ],
          [at(after, shown, letter), at(after, shown, letter) + 1],
        ];
      });
    };
    const clean = (blocks: readonly unknown[]): unknown[] =>
      blocks.map((node) => {
        const {
          authored: _authored,
          children,
          ...own
        } = node as { authored?: unknown; children?: readonly unknown[] };

        return children ? { ...own, children: clean(children) } : own;
      });

    for (const intent of ['edit', 'propose'] as const) {
      const editor = editorOf([quote(ab, c, quote(uv), line('xy'))], intent);
      const refusals: unknown[] = [];

      editor.api.authored.subscribeRefusals((refusal) =>
        refusals.push(refusal)
      );
      typeAfter(editor, 'u');
      for (const [letter, mapped, shown] of places(editor)) {
        assert.deepEqual(
          mapped,
          shown,
          `${intent}: ${letter} maps where it shows`
        );
      }
      typeAfter(editor, 'x');
      assert.deepEqual(refusals, [], intent);
      assert.deepEqual(texts(proposed(editor)), [['abc', 'uZv', [''], 'xZy']]);
      assert.deepEqual(
        clean(proposed(editor)),
        clean(proposed(editorOf(editor.read.value(), intent))),
        `${intent}: the live preview is a fresh load's`
      );
    }
  });

  it("reads a paragraph deleted between a joined line's pieces on that line, at the root's head and after it", () => {
    const value = [
      line('a'),
      deleted,
      line('f', by('carol', 'split', { follows: '["alice:1",1]' })),
      line('c', by('alice', 'join')),
    ];

    expectReads(value, 'proposed', ['ac', 'f'], {
      '0': ['dan:1', 'alice:1'],
      '1': ['carol:1'],
    });
    expectReads([line('x'), ...value], 'proposed', ['x', 'ac', 'f'], {
      '0': [],
      '1': ['dan:1', 'alice:1'],
      '2': ['carol:1'],
    });
  });
});

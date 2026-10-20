import assert from 'node:assert/strict';
import { join } from 'node:path';
import { after, before as beforeAll, describe, it } from 'node:test';
import { isDeepStrictEqual } from 'node:util';

import * as ledgerModule from '../src/authored/ledger/ledger';
import { readLedgerWork } from '../src/authored/ledger/work';
import * as marks from '../src/authored/tree/marks';
import * as recordCompletion from '../src/authored/tree/record-completion';
import * as resolve from '../src/authored/tree/resolve';
import { DocumentIndex } from '../src/core/change/document-index';
import * as tokens from '../src/core/change/tokens';
import * as representation from '../src/core/representation';
import { readCoreWork, resetCoreWork } from '../src/core/work';
import type { EditorDocumentRecords } from '../src/interfaces/editor';

const real = { ...marks };
const realLedger = { ...ledgerModule };
const realTokens = { ...tokens };
const realCompletion = { ...recordCompletion };
const realRepresentation = { ...representation };
const realResolve = { ...resolve };
let markReads = 0;
let memberReads = 0;
let resolvedNodes = 0;
let encodedTokens = 0;
let recorderReads = 0;
let recorderMemberReads = 0;
let projectorReads = 0;
let built = 0;

mock.module(join(import.meta.dir, '../src/authored/tree/marks.ts'), () => ({
  ...real,
  readAuthoredMarks: (node: unknown) => {
    markReads += 1;

    return real.readAuthoredMarks(node);
  },
  readMembers: (node: unknown) => {
    memberReads += 1;

    return real.readMembers(node);
  },
}));
mock.module(
  join(import.meta.dir, '../src/authored/tree/record-completion.ts'),
  () => ({
    ...realCompletion,
    completeProposed: (
      input: Parameters<typeof recordCompletion.completeProposed>[0]
    ) => {
      const before = markReads;
      const members = memberReads;

      try {
        return realCompletion.completeProposed(input);
      } finally {
        recorderReads += markReads - before;
        recorderMemberReads += memberReads - members;
      }
    },
  })
);
const nodeCount = (
  nodes: ReadonlyArray<{ children?: readonly unknown[] }>
): number =>
  nodes.reduce(
    (total, node) =>
      total +
      1 +
      nodeCount(
        (node.children ?? []) as ReadonlyArray<{ children?: unknown[] }>
      ),
    0
  );

mock.module(join(import.meta.dir, '../src/authored/ledger/ledger.ts'), () => ({
  ...realLedger,
  createReviewLedger: (
    ...args: Parameters<typeof ledgerModule.createReviewLedger>
  ) => {
    const ledger = realLedger.createReviewLedger(...args);
    const frame = ledger.frame.bind(ledger);

    ledger.frame = (...input: Parameters<typeof frame>) => {
      const before = markReads + memberReads;

      try {
        return frame(...input);
      } finally {
        projectorReads += markReads + memberReads - before;
      }
    };

    return ledger;
  },
}));
mock.module(join(import.meta.dir, '../src/authored/tree/resolve.ts'), () => ({
  ...realResolve,
  resolveAuthoredChildren: (
    ...args: Parameters<typeof resolve.resolveAuthoredChildren>
  ) => {
    resolvedNodes += nodeCount(args[0]);

    return realResolve.resolveAuthoredChildren(...args);
  },
}));
mock.module(join(import.meta.dir, '../src/core/representation.ts'), () => ({
  ...realRepresentation,
  completeChildrenAt: (
    ...args: Parameters<typeof representation.completeChildrenAt>
  ) => {
    const completion = realRepresentation.completeChildrenAt(...args);

    built += completion.built.length;

    return completion;
  },
}));
mock.module(join(import.meta.dir, '../src/core/change/tokens.ts'), () => ({
  ...realTokens,
  encodeNodes: (nodes: Parameters<typeof tokens.encodeNodes>[0]) => {
    const encoded = realTokens.encodeNodes(nodes);

    encodedTokens += encoded.slice.tokens.length;

    return encoded;
  },
  encodeTrustedNodes: (
    ...args: Parameters<typeof tokens.encodeTrustedNodes>
  ) => {
    const encoded = realTokens.encodeTrustedNodes(...args);

    encodedTokens += encoded.length;

    return encoded;
  },
}));

const {
  authoredVeto,
  createEditor,
  createEditorView,
  defineEditorSchema,
  definePlugin,
  editorCommands,
  property,
  schema,
  SelectionApi,
  target,
} = await import('plitejs');
const { createAuthoredPlugin } = await import('../src/authored/authored');
const { proposedChildren, proposedHost } =
  await import('../src/authored/tree/proposed');
const { expandContexts } = await import('../src/authored/facts/compact');
const { projectAuthoredDocumentUnder } = await import('../src/authored/format');
const { authoredResolveSchemaOf } =
  await import('../src/authored/resolve-schema');
const { getCompiledEditorSchema } = await import('../src/core/plugin-registry');
const { getEditorAuthoredDocumentCapability } =
  await import('../src/create-editor');
const { history } = await import('plitejs/history');
const { reviewRecords, storedContexts } = await import('./support/authored');

const Inline = defineEditorSchema('work-inline', {
  elements: {
    link: {
      content: schema.content.text({ default: 'text', min: 1 }),
      inline: true,
    },
  },
  id: 'work-inline',
  properties: [
    schema.textProperty('bold', property.boolean()),
    schema.elementProperty('url', property.string(), {
      target: target.type('link'),
    }),
  ],
  root: schema.content.not(schema.content.text()),
  unknown: 'preserve',
  version: 1,
});

const Blocks = defineEditorSchema('work-blocks', {
  elements: {
    cell: { content: schema.content.text() },
    group: { content: schema.content.type('cell', { min: 2 }) },
    paragraph: { content: schema.content.text() },
    quote: { content: schema.content.type('paragraph', { min: 1 }) },
  },
  id: 'work-blocks',
  root: schema.content.types(['paragraph', 'group', 'quote'], {
    default: { type: 'paragraph' },
    min: 1,
  }),
  unknown: 'reject',
  version: 1,
});

type Node = Record<string, unknown> & {
  children?: readonly Node[];
  text?: string;
};

const paragraph = (...children: Node[]) => ({ children, type: 'paragraph' });
const linked = () =>
  paragraph(
    { text: 'a ' },
    { children: [{ text: 'abc' }], type: 'link', url: 'u' },
    { text: ' b' }
  );

let count = 0;
const editorFor = (
  value: readonly Node[],
  intent: 'edit' | 'propose',
  author = 'alice',
  content: typeof Inline | typeof Blocks = Inline,
  veto?: Parameters<typeof authoredVeto.of>[0]
) =>
  createEditor({
    initialValue: value as never,
    plugins: [
      content,
      definePlugin('work-veto', {
        contributions: veto ? [authoredVeto.of(veto)] : [],
      }),
      createAuthoredPlugin({
        authorId: author,
        createChangeId: () => `${author}:${(count += 1)}`,
        createTagId: () => `${author}-tag:${(count += 1)}`,
        intent,
        now: () => 1,
      }),
    ],
  });
type Editor = ReturnType<typeof editorFor>;

const blocks = (size: number, tail: readonly Node[]) => [
  ...Array.from({ length: size }, (_, index) =>
    paragraph({ text: `plain ${index}` })
  ),
  ...tail,
];

const quote = (size: number) => ({
  children: blocks(size, []),
  type: 'quote',
});
const deletedBy = (change: string) => [
  { at: 1, author: 'bob', change, kind: 'delete' },
];
const struckParagraph = (text: string, change: string) => ({
  authored: deletedBy(change),
  children: [{ authored: deletedBy(change), text }],
  type: 'paragraph',
});
const cells = () =>
  [0, 1, 2].map((index) => ({
    children: [
      { children: [{ text: `a${index}` }], type: 'cell' },
      { children: [{ text: `b${index}` }], type: 'cell' },
    ],
    type: 'group',
  }));
const twiceSplitLink = () => {
  const editor = editorFor([linked()], 'propose', 'bob');

  enter(editor, [0, 1, 0], 2);
  enter(editor, [0, 1, 0], 1);

  return editor.read.children() as readonly Node[];
};

const middlePieceOf = (first: number, run: number) => [first + run * 3 + 1, 1];

const enter = (editor: Editor, path: number[], offset: number) =>
  editor.update((tx) => {
    tx.selection.set({ anchor: { offset, path }, focus: { offset, path } });
    tx.break.insert();
  });
const splitLinks = [
  twiceSplitLink(),
  twiceSplitLink(),
  twiceSplitLink(),
].flat();

const workPerEdit = (editor: Editor, edit: (run: number) => void) => {
  const counts = [0, 1, 2].map((run) => {
    const before = {
      breakRuns: readLedgerWork().breakRuns,
      built,
      encodedTokens,
      markReads,
      memberReads,
      projectorReads,
      recorderMemberReads,
      recorderReads,
      resolvedNodes,
      visitedNodes: readLedgerWork().visitedNodes,
    };

    edit(run);

    const recorded = recorderReads - before.recorderReads;
    const projected = projectorReads - before.projectorReads;

    return {
      breakRuns: readLedgerWork().breakRuns - before.breakRuns,
      built: built - before.built,
      encodedTokens: encodedTokens - before.encodedTokens,
      markReads: markReads - before.markReads,
      otherReads:
        markReads -
        before.markReads +
        memberReads -
        before.memberReads -
        recorded -
        (recorderMemberReads - before.recorderMemberReads) -
        projected,
      recorderReads: recorded,
      resolvedNodes: resolvedNodes - before.resolvedNodes,
      visitedNodes: readLedgerWork().visitedNodes - before.visitedNodes,
    };
  });

  // Equal zeros would only mean the counter never ran.
  if (counts.every((work) => work.markReads === 0)) {
    throw new Error('The read counter saw no reads.');
  }

  return counts;
};

const buildFirstIndexOutsideCount = (editor: Editor) => {
  const before = encodedTokens;

  // Loading may already index the document, so a copy proves the counter runs.
  DocumentIndex.fromValue(structuredClone(editor.read.children()));
  if (encodedTokens === before) {
    throw new Error('The encode counter saw no first index.');
  }
  DocumentIndex.fromValue(editor.read.children());
};

const atBothSizes = (
  setup: (size: number) => Editor,
  edit: (editor: Editor, size: number, run: number) => void,
  sizes = [100, 2000]
) =>
  sizes.map((size) => {
    const editor = setup(size);

    buildFirstIndexOutsideCount(editor);

    return workPerEdit(editor, (run) => edit(editor, size, run));
  });

const typeAtEnd = (editor: Editor, size: number) =>
  editor.update((tx) =>
    tx.text.insert('k', { at: { offset: 0, path: [size - 1, 0] } })
  );

describe('authored review tree work per edit', () => {
  // The test build's law check projects each framed recording again, and
  // these counters would count its reads.
  const lawCheck = process.env.PLITE_LAW_CHECK;

  beforeAll(() => {
    process.env.PLITE_LAW_CHECK = '0';
  });
  after(() => {
    if (lawCheck === undefined) delete process.env.PLITE_LAW_CHECK;
    else process.env.PLITE_LAW_CHECK = lawCheck;
  });

  for (const intent of ['edit', 'propose'] as const) {
    for (const inside of [false, true]) {
      for (const key of ['letter', 'Backspace', 'Enter'] as const) {
        it(`does as much work for ${intent === 'edit' ? 'an Editing' : 'a Suggesting'} ${key} ${inside ? 'inside a moved line' : 'outside ordered runs'} at 5,000 blocks as at 100`, () => {
          const [small, large] = atBothSizes(
            (size) =>
              editorFor(
                Array.from({ length: size }, (_, index) => {
                  const change = `bob:join-${Math.floor(index / 100)}`;
                  const node = paragraph({ text: 'plain content' });

                  if (index % 100 === 51) {
                    return {
                      ...node,
                      authored: [
                        {
                          at: 1,
                          author: 'erin',
                          change: `~edit:erin-${Math.floor(index / 100)}`,
                          follows: JSON.stringify([change, 1]),
                          kind: 'insert',
                        },
                      ],
                    };
                  }
                  if (index % 100 === 52) {
                    return {
                      ...node,
                      authored: [
                        { at: 1, author: 'bob', change, kind: 'join' },
                      ],
                    };
                  }

                  return node;
                }),
                intent,
                'alice',
                Blocks
              ),
            (editor, size) =>
              editor.update((tx) => {
                // In the middle hundred blocks, so a read from either end
                // grows with size.
                const hundred = Math.floor(size / 200) * 100;
                const caret = {
                  offset: 1,
                  path: [hundred + (inside ? 51 : 10), 0],
                };

                tx.selection.set({ anchor: caret, focus: caret });
                if (key === 'letter') {
                  tx.command(editorCommands.insertText, { text: 'k' });
                } else if (key === 'Enter') {
                  tx.command(editorCommands.insertBreak);
                } else {
                  tx.command(editorCommands.delete, {
                    direction: 'backward',
                    unit: 'character',
                  });
                }
              }),
            [100, 5000]
          );

          assert.deepEqual(large, small);
        });
      }
    }
  }

  it('does as much work for Editing typing at 2,000 blocks as at 100', () => {
    const [small, large] = atBothSizes(
      (size) => editorFor(blocks(size, []), 'edit'),
      typeAtEnd
    );

    assert.deepEqual(large, small);
  });

  it('copies as many index slots and allocates as many index nodes for an Editing letter at 5,000 blocks as at 100', () => {
    const [small, large] = [100, 5000].map((size) => {
      const editor = editorFor(blocks(size, []), 'edit');

      typeAtEnd(editor, size);
      resetCoreWork();
      typeAtEnd(editor, size);

      return readCoreWork();
    });

    if (small.copiedSlots === 0) {
      throw new Error('The sequence counter saw no copies.');
    }
    assert.deepEqual(large, small);
  });

  it('resolves as many nodes for an Editing letter and Backspace in another author’s pending line at 5,000 blocks as at 100', () => {
    const pending = [
      {
        children: [
          {
            authored: [
              { at: 1, author: 'bob', change: 'bob:pending', kind: 'insert' },
            ],
            text: 'tail',
          },
        ],
        type: 'paragraph',
      },
    ];
    const [small, large] = atBothSizes(
      (size) => editorFor(blocks(size, pending), 'edit'),
      (editor, size, run) =>
        run === 2
          ? editor.update((tx) => {
              const path = [size, 0];

              tx.selection.set({
                anchor: { offset: 0, path },
                focus: { offset: 0, path },
              });
              tx.command(editorCommands.delete, {
                direction: 'backward',
                unit: 'character',
              });
            })
          : editor.update((tx) =>
              tx.text.insert('k', { at: { offset: 2, path: [size, 0] } })
            ),
      [100, 5000]
    );

    const resolved = (counts: typeof small) =>
      counts.map((work) => work.resolvedNodes);

    // The command projector still reads the whole document on a Backspace
    // that joins lines, which line W1 of the review-tree pivot owns.
    assert.ok(resolved(small).every((nodes) => nodes > 0));
    assert.deepEqual(resolved(large), resolved(small));
  });

  it('writes an Editing letter, Backspace, Enter and select-all delete on plain lines as a plain editor does, resolving and completing nothing', () => {
    const edits = [
      (editor: Editor, size: number) => typeAtEnd(editor, size),
      (editor: Editor, size: number) =>
        editor.update((tx) => {
          const path = [size - 1, 0];

          tx.selection.set({
            anchor: { offset: 0, path },
            focus: { offset: 0, path },
          });
          tx.command(editorCommands.delete, {
            direction: 'backward',
            unit: 'character',
          });
        }),
      (editor: Editor, size: number) => enter(editor, [size - 3, 0], 2),
    ];
    const work = atBothSizes(
      (size) => editorFor(blocks(size, []), 'edit'),
      (editor, size, run) => edits[run](editor, size),
      [100, 1000]
    );
    const selectAll = atBothSizes(
      (size) => editorFor(blocks(size, []), 'edit'),
      (editor, size, run) =>
        run === 0
          ? editor.update((tx) => {
              tx.selection.set({
                anchor: { offset: 0, path: [0, 0] },
                focus: { offset: 7, path: [size - 1, 0] },
              });
              tx.command(editorCommands.delete, {
                direction: 'backward',
                unit: 'character',
              });
            })
          : typeAtEnd(editor, 1),
      [100, 1000]
    );

    assert.deepEqual(
      [...work, ...selectAll]
        .flat()
        .map((counts) => [counts.resolvedNodes, counts.recorderReads]),
      Array.from({ length: 12 }, () => [0, 0])
    );
  });

  for (const intent of ['propose', 'edit'] as const) {
    it(`settles as much for ${intent === 'edit' ? 'an Editing' : 'a Suggesting'} letter, Backspace and Enter at 5,000 blocks holding 50 suggestions and a verdict as at 100, from the first key`, () => {
      const verdict = (change: string, result: 'accept' | 'reject') => ({
        decision: `d:${change}`,
        member: { at: 1, change },
        verdict: result,
      });
      const [small, large] = atBothSizes(
        (size) => {
          const step = Math.floor((size - 10) / 50);
          const struck = new Set(
            Array.from({ length: 50 }, (_, index) => index * step)
          );

          return createEditor({
            initialValue: {
              children: Array.from({ length: size }, (_, index) =>
                struck.has(index)
                  ? struckParagraph(`struck ${index}`, `bob:s${index}`)
                  : paragraph({ text: `plain ${index}` })
              ),
              records: reviewRecords({
                verdicts: [
                  verdict('carol:0', 'accept'),
                  verdict('dave:0', 'reject'),
                ],
              }),
            } as never,
            plugins: [
              Inline,
              createAuthoredPlugin({
                authorId: 'alice',
                createChangeId: () => `alice:${(count += 1)}`,
                createTagId: () => `alice-tag:${(count += 1)}`,
                intent,
                now: () => 1,
              }),
            ],
          });
        },
        (editor, size, run) => {
          if (run === 0) {
            typeAtEnd(editor, size);
            return;
          }
          editor.update((tx) => {
            const path = [editor.read.children().length - 1, 0];

            tx.selection.set({
              anchor: { offset: run === 1 ? 0 : 1, path },
              focus: { offset: run === 1 ? 0 : 1, path },
            });
            if (run === 1) {
              tx.command(editorCommands.delete, {
                direction: 'backward',
                unit: 'character',
              });
            } else {
              tx.break.insert();
            }
          });
        },
        [100, 5000]
      );
      const other = (counts: typeof small) =>
        counts.map((work) => work.otherReads);

      assert.ok(other(small).every((reads) => reads >= 0));
      assert.deepEqual(other(large), other(small));
    });
  }

  it('does as much work for Suggesting typing at 2,000 blocks as at 100', () => {
    const [small, large] = atBothSizes(
      (size) => editorFor(blocks(size, []), 'propose'),
      typeAtEnd
    );

    assert.deepEqual(large, small);
  });

  for (const [name, edit] of [
    ['typing', typeAtEnd],
    [
      'a whole-leaf bold toggle',
      (editor: Editor, size: number, run: number) =>
        editor.update((tx) => {
          const path = [size - 1, 0];

          tx.selection.set({
            anchor: { offset: 0, path },
            focus: { offset: 4, path },
          });
          if (run % 2 === 0) tx.marks.add('bold', true);
          else tx.marks.remove('bold');
        }),
    ],
  ] as const) {
    it(`does as much work for Suggesting ${name} inside a list item at 2,000 blocks as at 100`, () => {
      const calls = new Map<number, number>();
      const editors = new Map<number, Editor>();
      const [small, large] = atBothSizes((size) => {
        const editor = editorFor(
          blocks(size - 1, [
            { ...paragraph({ text: 'item' }), listType: 'disc' },
          ]),
          'propose',
          'alice',
          Inline,
          (element, touch) => {
            calls.set(size, (calls.get(size) ?? 0) + 1);

            return element.listType && touch !== 'content' ? 'list' : null;
          }
        );

        editors.set(size, editor);

        return editor;
      }, edit);

      assert.ok((calls.get(100) ?? 0) > 0);
      assert.equal(calls.get(2000), calls.get(100));
      assert.ok(editors.get(2000)!.read.authored.changes().items.length > 0);
      assert.deepEqual(large, small);
    });
  }

  it('does as much work for a Suggesting bold toggle at 2,000 blocks as at 100', () => {
    const [small, large] = atBothSizes(
      (size) => editorFor(blocks(size, []), 'propose'),
      (editor, size, run) =>
        editor.update((tx) => {
          const path = [size - 1, 0];

          tx.selection.set({
            anchor: { offset: 0, path },
            focus: { offset: 5, path },
          });
          if (run % 2 === 0) tx.marks.add('bold', true);
          else tx.marks.remove('bold');
        })
    );

    assert.deepEqual(large, small);
  });

  it('does as much work for a Suggesting Enter inside a link at 2,000 blocks as at 100', () => {
    const [small, large] = atBothSizes(
      (size) =>
        editorFor(blocks(size, [linked(), linked(), linked()]), 'propose'),
      (editor, size, run) => enter(editor, [size + 2 - run, 1, 0], 2)
    );

    assert.deepEqual(large, small);
  });

  it('does as much work for an Editing removal of a split link piece at 2,000 blocks as at 100', () => {
    const [small, large] = atBothSizes(
      (size) => editorFor(blocks(size, splitLinks), 'edit'),
      (editor, size, run) =>
        editor.update((tx) => tx.nodes.remove({ at: middlePieceOf(size, run) }))
    );

    assert.deepEqual(large, small);
  });
  it('does as much work for one Editing transaction that edits the first and the last block at 2,000 blocks as at 100', () => {
    const [small, large] = atBothSizes(
      (size) => editorFor(blocks(size, []), 'edit'),
      (editor, size) =>
        editor.update((tx) => {
          tx.text.insert('k', { at: { offset: 0, path: [0, 0] } });
          tx.text.insert('k', { at: { offset: 0, path: [size - 1, 0] } });
        })
    );

    assert.deepEqual(large, small);
  });
  it('does as much work for one Editing transaction that splits the first block and edits the last at 2,000 blocks as at 100', () => {
    const [small, large] = atBothSizes(
      (size) => editorFor(blocks(size, []), 'edit'),
      (editor, size) =>
        editor.update((tx) => {
          tx.text.insert('k', { at: { offset: 0, path: [size - 1, 0] } });
          tx.nodes.split({ at: { offset: 1, path: [0, 0] } });
        })
    );

    assert.deepEqual(large, small);
  });
  it('does as much work for one Editing transaction that edits inside a long quote and splits the first block at 2,000 quoted blocks as at 100', () => {
    const [small, large] = atBothSizes(
      (size) => editorFor([paragraph({ text: 'abcdef' }), quote(size)], 'edit'),
      (editor, size, run) =>
        editor.update((tx) => {
          tx.text.insert('k', {
            at: { offset: 0, path: [1 + run, size - 1, 0] },
          });
          tx.nodes.split({ at: { offset: 1, path: [run, 0] } });
        })
    );

    assert.deepEqual(large, small);
  });
  it('does as much work for one Editing transaction that edits inside a long quote and removes a split link piece after it at 2,000 quoted blocks as at 100', () => {
    const [small, large] = atBothSizes(
      (size) => editorFor([quote(size), ...splitLinks], 'edit'),
      (editor, _size, run) =>
        editor.update((tx) => {
          tx.text.insert('k', { at: { offset: 0, path: [0, 0, 0] } });
          tx.nodes.remove({ at: middlePieceOf(1, run) });
        })
    );

    assert.deepEqual(large, small);
  });
  it('does as much work for Editing removals of the last piece of a split link, the first just before a long quote, at 2,000 quoted blocks as at 100', () => {
    const [small, large] = atBothSizes(
      (size) => editorFor([...splitLinks, quote(size)], 'edit'),
      (editor, _size, run) =>
        editor.update((tx) => tx.nodes.remove({ at: [6 - run * 3 + 2] }))
    );

    assert.deepEqual(large, small);
  });
  it('does as much work for Editing removals of the first piece of a split link, the first just after a long quote, at 2,000 quoted blocks as at 100', () => {
    const [small, large] = atBothSizes(
      (size) => editorFor([quote(size), ...splitLinks], 'edit'),
      (editor, _size, run) =>
        editor.update((tx) => tx.nodes.remove({ at: [1 + run * 2] }))
    );

    assert.deepEqual(large, small);
  });
  it('reads as many nodes to check Suggesting typing for completion under a root minimum at 20,000 blocks as at 100', () => {
    const [small, large] = atBothSizes(
      (size) => editorFor(blocks(size, []), 'propose', 'alice', Blocks),
      typeAtEnd,
      [100, 20_000]
    );

    assert.ok(small.every((work) => work.recorderReads > 0));
    assert.deepEqual(
      large.map((work) => work.recorderReads),
      small.map((work) => work.recorderReads)
    );
  });

  it('reads as many nodes to complete a Suggesting Backspace join at 20,000 blocks as at 100', () => {
    const [small, large] = atBothSizes(
      (size) => editorFor(blocks(size, []), 'propose', 'alice', Blocks),
      (editor, size, run) =>
        editor.update((tx) => tx.nodes.merge({ at: [size - 1 - run] })),
      [100, 20_000]
    );

    assert.ok(small.every((work) => work.recorderReads > 0));
    assert.deepEqual(
      large.map((work) => work.recorderReads),
      small.map((work) => work.recorderReads)
    );
  });

  it('reads as many nodes to fill a Suggesting cell deletion at 20,000 blocks as at 100', () => {
    const [small, large] = atBothSizes(
      (size) => editorFor(blocks(size, cells()), 'propose', 'alice', Blocks),
      (editor, size, run) =>
        editor.update((tx) => tx.nodes.remove({ at: [size + run, 0] })),
      [100, 20_000]
    );

    assert.ok(small.every((work) => work.built > 0));
    assert.deepEqual(
      large.map(({ built: fills, recorderReads: reads }) => [fills, reads]),
      small.map(({ built: fills, recorderReads: reads }) => [fills, reads])
    );
  });

  it('reads as much on each Suggesting Backspace join beside a struck run of 1,000 lines as beside 100, at 20,000 blocks as at 100', () => {
    const reads = (run: number, sizes: number[]) =>
      atBothSizes(
        (size) =>
          editorFor(
            [
              ...Array.from({ length: run }, (_, index) =>
                struckParagraph(`struck ${index}`, 'bob:struck')
              ),
              ...blocks(size, []),
            ],
            'propose',
            'alice',
            Blocks
          ),
        (editor, size, edit) =>
          editor.update((tx) =>
            tx.nodes.merge({ at: [run + size - 1 - edit] })
          ),
        sizes
      ).map((work) => work.map((entry) => entry.recorderReads));
    const [short, shortInLarge] = reads(100, [100, 20_000]);
    const [long] = reads(1000, [100]);

    assert.deepEqual(shortInLarge, short);
    assert.deepEqual(long, short);
  });

  it('copies as many tokens and reads as many marks for an Editing letter typed beside 1,000 struck lines as beside 100', () => {
    const [small, large] = atBothSizes(
      (size) =>
        editorFor(
          [
            paragraph({ text: 'live' }),
            ...Array.from({ length: size }, (_, index) =>
              struckParagraph(`struck ${index}`, 'bob:struck')
            ),
            paragraph({ text: 'tail' }),
          ],
          'edit',
          'alice',
          Blocks
        ),
      (editor, _size, run) =>
        editor.update((tx) => {
          const caret = { offset: 4 + run, path: [0, 0] };

          tx.selection.set({ anchor: caret, focus: caret });
          tx.command(editorCommands.insertText, { text: 'k' });
        }),
      [100, 1000]
    );
    assert.deepEqual(large, small);
  });

  it('copies as many tokens for each Suggesting letter after the first, which projects the whole document, typed above 1,000 lines that each hold a struck letter as above 100', () => {
    const [small, large] = atBothSizes(
      (size) =>
        editorFor(
          Array.from({ length: size }, () =>
            paragraph(
              { text: 'S' },
              { authored: deletedBy('bob:struck'), text: 'e' },
              { text: 'ed.' }
            )
          ),
          'propose',
          'alice',
          Blocks
        ),
      (editor, _size, run) =>
        editor.update((tx) => {
          const caret = { offset: run, path: [0, 0] };

          tx.selection.set({ anchor: caret, focus: caret });
          tx.command(editorCommands.insertText, { text: 'k' });
        }),
      [100, 1000]
    );

    assert.deepEqual(
      large?.slice(1).map((work) => work.encodedTokens),
      small?.slice(1).map((work) => work.encodedTokens)
    );
  });

  it('copies as many tokens for an Editing Backspace that joins lines across 1,000 struck lines as across 100', () => {
    const [small, large] = atBothSizes(
      (size) =>
        editorFor(
          [
            paragraph({ text: 'live' }),
            ...Array.from({ length: size }, (_, index) =>
              struckParagraph(`struck ${index}`, 'bob:struck')
            ),
            ...blocks(3, []),
          ],
          'edit',
          'alice',
          Blocks
        ),
      (editor, size) =>
        editor.update((tx) => {
          const caret = { offset: 0, path: [size + 1, 0] };

          tx.selection.set({ anchor: caret, focus: caret });
          tx.command(editorCommands.delete, {
            direction: 'backward',
            unit: 'character',
          });
        }),
      [100, 1000]
    );

    assert.ok(small?.every((work) => work.encodedTokens > 0));
    assert.deepEqual(
      large?.map((work) => work.encodedTokens),
      small?.map((work) => work.encodedTokens)
    );
  });

  it('resolves no ledger node for Editing and Suggesting Backspaces that join lines across 20 or 1,000 struck lines and then delete, taking the written lines', () => {
    const resolved = (intent: 'edit' | 'propose', size: number) => {
      const editor = editorFor(
        [
          paragraph({ text: 'live' }),
          ...Array.from({ length: size }, (_, index) =>
            struckParagraph(`struck ${index}`, 'bob:struck')
          ),
          ...blocks(3, []),
        ],
        intent,
        'alice',
        Blocks
      );

      return [0, 1, 2].map((run) => {
        const before = readLedgerWork();

        editor.update((tx) => {
          if (run === 0) {
            const caret = { offset: 0, path: [size + 1, 0] };

            tx.selection.set({ anchor: caret, focus: caret });
          }
          tx.command(editorCommands.delete, {
            direction: 'backward',
            unit: 'character',
          });
        });

        const end = readLedgerWork();

        return [
          end.resolvedNodes - before.resolvedNodes,
          end.writtenRuns - before.writtenRuns,
        ];
      });
    };

    // Without what the commands wrote, each Backspace after the join would
    // resolve the struck run again.
    assert.deepEqual(
      (['edit', 'propose'] as const).flatMap((intent) =>
        [20, 1000].map((size) => resolved(intent, size))
      ),
      Array.from({ length: 4 }, () => [
        [0, 1],
        [0, 1],
        [0, 1],
      ])
    );
  });

  it('reads only an element’s level and its ancestors for its proposed children under a pending unwrap, at 2,000 blocks as at 100', () => {
    const reads = (size: number) => {
      const value = blocks(size, [
        {
          authored: [{ at: 1, author: 'bob', change: 'bob:1', kind: 'unwrap' }],
          children: [paragraph({ text: 'lifted' })],
          type: 'quote',
        },
      ]);
      const before = markReads;
      const host = proposedHost(value as never, [size, 0]);

      assert.deepEqual(host, [size, 0]);
      assert.deepEqual(
        proposedChildren(value as never, [size, 0]).map(
          ({ node }) => node.text
        ),
        ['lifted']
      );

      return markReads - before;
    };

    assert.equal(reads(2000), reads(100));
  });

  it('resolves and compares as many nodes for a key inside a follower window in a quote of 2,000 children as of 100', () => {
    const by = (author: string, kind: string, extra = {}) => ({
      at: 1,
      author,
      change: `${author}:1`,
      kind,
      ...extra,
    });
    // Bob's `uv` follows Alice's join of `c` into `ab`, at the quote's start.
    const work = (size: number) => {
      const editor = editorFor(
        [
          {
            children: [
              paragraph({ text: 'ab' }),
              { ...paragraph({ text: 'c' }), authored: [by('alice', 'join')] },
              paragraph({ text: 'xy' }),
              {
                ...paragraph({ text: 'uv' }),
                authored: [
                  by('bob', 'split', {
                    follows: JSON.stringify(['alice:1', 1]),
                  }),
                ],
              },
              ...blocks(size - 4, []),
            ],
            type: 'quote',
          },
        ],
        'edit',
        'dave',
        Blocks
      );
      const key = () =>
        editor.update((tx) => {
          const caret = { offset: 1, path: [0, 3, 0] };

          tx.selection.set({ anchor: caret, focus: caret });
          tx.command(editorCommands.insertText, { text: 'k' });
        });

      key();

      const kernel = resolvedNodes;
      const before = readLedgerWork();

      key();

      const measured = readLedgerWork();

      return {
        compared: measured.comparedBlocks - before.comparedBlocks,
        kernel: resolvedNodes - kernel,
        ledger: measured.resolvedNodes - before.resolvedNodes,
      };
    };
    const small = work(100);

    assert.ok(small.ledger > 0 && small.compared > 0, JSON.stringify(small));
    assert.deepEqual(work(2000), small);
  });

  describe('a level for each container that shows as one block', () => {
    const by = (author: string, kind: string, extra = {}) => ({
      at: 1,
      author,
      change: `${author}:1`,
      kind,
      ...extra,
    });
    const line = (text: string, ...authored: object[]): Node => ({
      ...(authored.length > 0 && { authored }),
      children: [{ text }],
      type: 'paragraph',
    });
    const quoted = (...children: Node[]): Node => ({ children, type: 'quote' });
    const follows = () => ({ follows: JSON.stringify(['alice:1', 1]) });
    const sol = () => [
      line('aa'),
      struckParagraph('bb', 'bob:1'),
      line('ff', by('carol', 'split', follows())),
      line('cc', by('alice', 'join')),
    ];
    const tails = (length: number, far?: Node) =>
      Array.from({ length }, (_, index) =>
        far && index === length - 6 ? far : line('tail')
      );
    const erin = () =>
      paragraph(
        { text: 'ta' },
        { authored: [by('erin', 'insert')], text: 'zz' },
        { text: 'il' }
      );
    const kinds = [
      'resolvedNodes',
      'writtenNodes',
      'comparedNodes',
      'levelSlots',
      'factNodes',
      'levelBuilds',
    ] as const;
    type Kind = keyof ReturnType<typeof readLedgerWork>;
    const since = <K extends Kind>(
      start: ReturnType<typeof readLedgerWork>,
      counted: readonly K[]
    ) => {
      const end = readLedgerWork();

      return Object.fromEntries(
        counted.map((kind) => [kind, end[kind] - start[kind]])
      ) as Record<K, number>;
    };
    const at = (path: readonly number[], offset: number) => ({
      offset,
      path: [...path],
    });
    const type = (
      editor: Editor,
      path: readonly number[],
      { propose = false, text = 'k' } = {}
    ) =>
      editor.update((tx) => {
        if (propose) tx.authored.propose();
        tx.selection.set({ anchor: at(path, 1), focus: at(path, 1) });
        tx.command(editorCommands.insertText, { text });
      });
    const viewOf = (editor: Editor, preview: 'accepted' | 'proposed') =>
      createEditorView(editor, { authored: { preview } } as never);
    const withoutMarks = (nodes: readonly Node[]): unknown[] =>
      nodes.map(({ authored: _authored, children, ...own }) =>
        children ? { ...own, children: withoutMarks(children) } : own
      );
    const assertFresh = (
      editor: Editor,
      intent: 'edit' | 'propose',
      label: string
    ) => {
      const loaded = editorFor(
        structuredClone(editor.read.value()) as never,
        intent,
        'dave',
        Blocks
      );

      for (const preview of ['accepted', 'proposed'] as const) {
        assert.deepEqual(
          withoutMarks(viewOf(editor, preview).read.children() as Node[]),
          withoutMarks(viewOf(loaded, preview).read.children() as Node[]),
          `${label}: the ${preview} preview is a fresh load's`
        );
      }
    };
    const texts = (nodes: readonly Node[]): unknown[] =>
      nodes.map((node) =>
        node.type === 'quote'
          ? texts(node.children ?? [])
          : (node.children ?? []).map(({ text }) => text).join('')
      );

    it('reads, resolves and compares as much for a key beside a merge at a quote’s start at 4,992 children as at 96, beside far marks, a far key and an Accepted view, in both intents', () => {
      const cases: ReadonlyArray<
        Readonly<{
          accepted?: boolean;
          before?: (editor: Editor, size: number) => void;
          name: string;
          value: (size: number) => Node[];
        }>
      > = [
        {
          name: 'no other mark',
          value: (size) => [quoted(...sol(), ...tails(size - 4))],
        },
        {
          name: "Erin's far insertion",
          value: (size) => [quoted(...sol(), ...tails(size - 4, erin()))],
        },
        {
          before: (editor, size) =>
            type(editor, [0, size - 3, 0], { propose: true, text: 'Q' }),
          name: 'a far Suggesting key first',
          value: (size) => [quoted(...sol(), ...tails(size - 4))],
        },
        {
          name: "Erin's far pending join",
          value: (size) => [
            quoted(
              ...sol(),
              ...tails(size - 4, line('jj', by('erin', 'join')))
            ),
          ],
        },
        {
          accepted: true,
          name: "Erin's far insertion under an Accepted view",
          value: (size) => [quoted(...sol(), ...tails(size - 4, erin()))],
        },
      ];

      for (const intent of ['edit', 'propose'] as const) {
        for (const { accepted, before, name, value } of cases) {
          const [small, large] = [96, 4992].map((size) => {
            const editor = editorFor(value(size), intent, 'dave', Blocks);
            const view = accepted ? viewOf(editor, 'accepted') : null;

            before?.(editor, size);
            view?.read.children();
            type(editor, [0, 2, 0]);
            view?.read.children();

            const start = readLedgerWork();

            type(editor, [0, 2, 0]);
            view?.read.children();

            return since(start, kinds);
          });
          const label = `${name} in ${intent}: ${JSON.stringify(small)}`;

          assert.deepEqual(large, small, label);
          for (const kind of [
            'resolvedNodes',
            'comparedNodes',
            'levelSlots',
            'factNodes',
          ] as const) {
            assert.ok((small?.[kind] ?? 0) > 0, `${label}: ${kind}`);
          }
          assert.equal(small?.levelBuilds, 0, label);
        }
      }
    });

    it('reads as many facts for a key in a far child of an unmarked quote of 4,992 children as of 96, in both intents', () => {
      for (const intent of ['edit', 'propose'] as const) {
        const [small, large] = [96, 4992].map((size) => {
          const editor = editorFor(
            [quoted(...tails(size))],
            intent,
            'dave',
            Blocks
          );

          type(editor, [0, size - 20, 0]);

          const start = readLedgerWork();

          type(editor, [0, size - 20, 0]);

          return since(start, kinds);
        });

        assert.deepEqual(large, small, intent);
        assert.ok((small?.factNodes ?? 0) > 0, JSON.stringify(small));
      }
    });

    it('resolves a key inside a quote with pending marks through the quote’s level, never the whole quote, in both intents', () => {
      for (const intent of ['edit', 'propose'] as const) {
        const editor = editorFor(
          [paragraph({ text: 'pp' }), quoted(...sol(), ...tails(20))],
          intent,
          'dave',
          Blocks
        );

        type(editor, [1, 2, 0]);

        const start = readLedgerWork();

        type(editor, [1, 2, 0]);

        const work = since(start, ['wholeContainers', 'levelSlots']);

        assert.equal(work.wholeContainers, 0, intent);
        assert.ok(work.levelSlots > 0, intent);
        assertFresh(editor, intent, intent);
      }
    });

    it('resolves a quote whole and builds no level for it while a join inside links it to the paragraph before', () => {
      const editor = editorFor(
        [paragraph({ text: 'pp' }), quoted(...sol())],
        'propose',
        'dave',
        Blocks
      );

      for (const path of [
        [1, 0, 0],
        [1, 3, 0],
      ]) {
        const start = readLedgerWork();

        type(editor, path);
        assert.deepEqual(
          since(start, ['wholeContainers', 'levelBuilds']),
          { levelBuilds: 0, wholeContainers: 1 },
          `a key at ${path}`
        );
      }
      assertFresh(editor, 'propose', 'after both keys');
    });

    it('resolves a later line whose join reaches back into the edited line with it, as much at 4,992 children as at 96', () => {
      for (const intent of ['edit', 'propose'] as const) {
        const [small, large] = [96, 4992].map((size) => {
          const editor = editorFor(
            [
              quoted(
                line('aa'),
                line('bb'),
                line('cc', by('alice', 'join')),
                ...tails(size - 3)
              ),
            ],
            intent,
            'dave',
            Blocks
          );

          type(editor, [0, 1, 0]);

          const start = readLedgerWork();

          type(editor, [0, 1, 0]);

          const work = since(start, [...kinds, 'windowSlots']);

          assert.deepEqual(
            texts(viewOf(editor, 'proposed').read.children() as Node[])[0]
              ?.toString()
              .split(',')
              .slice(0, 2),
            ['aa', 'bkkbcc']
          );
          assertFresh(editor, intent, `${intent} at ${size}`);

          return work;
        });

        assert.deepEqual(large, small, intent);
        // The window holds `bb` and `cc`, which resolve as one run.
        assert.equal(small?.levelSlots, 2, JSON.stringify(small));
      }
    });

    it('resolves the window from a join to its far follower, as large at 4,992 children as at 96', () => {
      const windowAt = (gap: number, size: number) => {
        const editor = editorFor(
          [
            quoted(
              line('aa'),
              line('cc', by('alice', 'join')),
              ...tails(gap),
              line('ff', by('carol', 'split', follows())),
              ...tails(size - gap - 3)
            ),
          ],
          'propose',
          'dave',
          Blocks
        );

        type(editor, [0, gap + 2, 0]);

        const start = readLedgerWork();

        type(editor, [0, gap + 2, 0]);

        const work = since(start, [...kinds, 'windowSlots']);

        assertFresh(editor, 'propose', `${gap} lines apart at ${size}`);

        return work;
      };

      for (const gap of [10, 40]) {
        const small = windowAt(gap, 96);

        assert.deepEqual(windowAt(gap, 4992), small, `${gap} lines apart`);
        // `aa` to `ff`: the join's line, the join, the lines between and the
        // follower.
        assert.equal(small.levelSlots, gap + 3, JSON.stringify(small));
      }
    });

    it('resolves a window beside an unchanged move source once its copy is inserted elsewhere, and adopts the write before, in both intents', () => {
      for (const intent of ['edit', 'propose'] as const) {
        for (const copy of [false, true]) {
          const counts = [8, 96].map((size) => {
            const editor = editorFor(
              [
                quoted(
                  line('aa'),
                  struckParagraph('mm', 'bob:1'),
                  ...tails(size)
                ),
                paragraph({ text: 'zz' }),
              ],
              intent,
              'dave',
              Blocks
            );

            if (copy) {
              editor.update((tx) =>
                tx.nodes.insert(line('mm', by('bob', 'insert')) as never, {
                  at: [1],
                })
              );
            }

            const start = readLedgerWork();

            editor.update((tx) => {
              tx.selection.set({
                anchor: at([0, 2, 0], 0),
                focus: at([0, 2, 0], 0),
              });
              tx.command(editorCommands.delete, {
                direction: 'backward',
                unit: 'character',
              });
            });

            const work = since(start, [...kinds, 'writtenRuns']);

            assertFresh(editor, intent, `${intent}, copy ${copy}, at ${size}`);

            return work;
          });
          const [small, large] = counts;

          assert.deepEqual(large, small, `${intent}, copy ${copy}`);
          assert.equal(
            small?.writtenRuns,
            copy ? 0 : 1,
            `${intent}, copy ${copy}: ${JSON.stringify(small)}`
          );
        }
      }
    });

    it('shows a quote whose lines are all removed as the kernel does under each mode, and keeps it on the next key, in both intents', () => {
      for (const intent of ['edit', 'propose'] as const) {
        const editor = editorFor(
          [
            paragraph({ text: 'pp' }),
            quoted(line('aa'), line('bb')),
            paragraph({ text: 'qq' }),
          ],
          intent,
          'dave',
          Blocks
        );

        viewOf(editor, 'accepted').read.children();
        editor.update((tx) => {
          tx.selection.set({
            anchor: at([1, 0, 0], 0),
            focus: at([1, 1, 0], 2),
          });
          tx.command(editorCommands.deleteFragment, { direction: 'backward' });
        });
        assert.deepEqual(
          [
            texts(viewOf(editor, 'proposed').read.children() as Node[]),
            texts(viewOf(editor, 'accepted').read.children() as Node[]),
          ],
          intent === 'edit'
            ? [
                ['pp', 'qq'],
                ['pp', 'qq'],
              ]
            : [
                ['pp', 'qq'],
                ['pp', ['aa', 'bb'], 'qq'],
              ]
        );
        assertFresh(editor, intent, `${intent} after the removal`);
        type(editor, [0, 0]);
        assertFresh(editor, intent, `${intent} after the next key`);
      }
    });

    it('does as much map and level work on each of five keys in a row at 4,992 children as at 96, in both intents', () => {
      for (const intent of ['edit', 'propose'] as const) {
        const [small, large] = [96, 4992].map((size) => {
          const editor = editorFor(
            [quoted(...sol(), ...tails(size - 4))],
            intent,
            'dave',
            Blocks
          );

          return Array.from({ length: 5 }, () => {
            const start = readLedgerWork();

            type(editor, [0, 2, 0]);

            return since(start, [
              ...kinds,
              'composedChanges',
              'visitedNodes',
              'windowSlots',
            ]);
          });
        });

        assert.ok(
          small?.slice(1).every((work) => isDeepStrictEqual(work, small[1])),
          JSON.stringify(small)
        );
        assert.deepEqual(large, small, intent);
      }
    });

    it('refuses Enter at the end of the joined line twice without a rebuild, then does as much for the safe keys after at 96 children as at 8, in both intents', () => {
      for (const intent of ['edit', 'propose'] as const) {
        const [small, large] = [8, 96].map((size) => {
          const editor = editorFor(
            [quoted(...sol(), ...tails(size - 4))],
            intent,
            'dave',
            Blocks
          );
          const refusals: unknown[] = [];

          editor.api.authored.subscribeRefusals((refusal) =>
            refusals.push(refusal.reasons)
          );

          const steps = ['enter', 'enter', 'key', 'key'].map((step) => {
            const start = readLedgerWork();

            if (step === 'enter') {
              editor.update((tx) => {
                tx.selection.set({
                  anchor: at([0, 3, 0], 1),
                  focus: at([0, 3, 0], 1),
                });
                tx.command(editorCommands.insertBreak);
              });
            } else {
              type(editor, [0, 2, 0]);
            }

            return [
              step,
              refusals.length,
              since(start, ['rebuilds', 'resolvedNodes', 'levelSlots']),
            ] as const;
          });

          assertFresh(editor, intent, `${intent} at ${size}`);

          return steps;
        });

        assert.deepEqual(
          small?.map(([step, refused, { rebuilds }]) => [
            step,
            refused,
            rebuilds,
          ]),
          [
            ['enter', 1, 0],
            ['enter', 2, 0],
            ['key', 2, 0],
            ['key', 2, 0],
          ],
          intent
        );
        assert.deepEqual(large?.at(-1), small?.at(-1), intent);
      }
    });
  });

  describe('with content roots', () => {
    const cards = (ownership: 'exclusive' | 'shared') =>
      defineEditorSchema(`work-cards-${ownership}`, {
        elements: {
          card: {
            content: schema.content.text({ default: 'text', min: 1 }),
            contentRoots: {
              body: {
                content: schema.content.type('paragraph', {
                  default: { type: 'paragraph' },
                  min: 1,
                }),
                ownership,
              },
            },
          },
          paragraph: {
            content: schema.content.text({ default: 'text', min: 1 }),
          },
        },
        id: `work-cards-${ownership}`,
        root: schema.content.types(['paragraph', 'card'], {
          default: { type: 'paragraph' },
          min: 1,
        }),
        unknown: 'reject',
        version: 1,
      });
    const Cards = cards('exclusive');
    const SharedCards = cards('shared');
    const card = (root: string) => ({
      childRoots: { body: root },
      children: [{ text: 'C' }],
      type: 'card',
    });
    const inserted = (change: string) => ({
      authored: [{ at: 1, author: 'alice', change, kind: 'insert' }],
      text: 'a',
    });
    const struckCard = (root: string, change: string) => {
      const authored = [{ at: 1, author: 'carol', change, kind: 'delete' }];

      return { ...card(root), authored, children: [{ authored, text: 'C' }] };
    };

    const deck = (
      size: number,
      {
        pendingPerParagraph = 0,
        struck = 0,
      }: Readonly<{ pendingPerParagraph?: number; struck?: number }> = {}
    ) => ({
      children: Array.from({ length: size }, (_, index) => [
        paragraph(
          ...Array.from(
            { length: index < 10 ? pendingPerParagraph : 0 },
            (_slot, run) => inserted(`alice:${index}:${run}`)
          ),
          { text: `plain ${index}` }
        ),
        index < struck
          ? struckCard(`b${index}`, `carol:${index}`)
          : card(`b${index}`),
      ]).flat(),
      roots: Object.fromEntries(
        Array.from({ length: size }, (_, index) => [
          `b${index}`,
          [paragraph({ text: `body ${index}` })],
        ])
      ),
    });
    const work = () =>
      ({ ...readCoreWork(), ...readLedgerWork() }) as Record<string, number>;
    const workOf = (step: () => void) => {
      const start = work();

      step();
      const end = work();

      return Object.fromEntries(
        Object.keys(end).map((key) => [key, end[key] - start[key]])
      );
    };
    const pick = (counts: Record<string, number>, keys: readonly string[]) =>
      Object.fromEntries(keys.map((key) => [key, counts[key]]));
    const KEY_OWNERSHIP = [
      'ownedRootsJudged',
      'ownerIndexReads',
      'ownershipBuilds',
      'wholeReadNodes',
    ];
    const KEY_OWNERSHIP_UNDER_HISTORY = KEY_OWNERSHIP.filter(
      (key) => key !== 'wholeReadNodes'
    );
    const assertKeyOwnership = (
      small: ReadonlyArray<Record<string, number>>,
      large: ReadonlyArray<Record<string, number>>,
      keys = KEY_OWNERSHIP
    ) => {
      assert.ok(
        small.some((counts) => counts.ownerIndexReads > 0),
        'The ownership counter saw no reads.'
      );
      assert.deepEqual(
        large.map((counts) => pick(counts, keys)),
        small.map((counts) => pick(counts, keys)),
        'ownership work grew with the document'
      );
      assert.deepEqual(
        small.map((counts) => [
          counts.ownedRootsJudged,
          counts.ownershipBuilds,
        ]),
        small.map(() => [0, 0])
      );
    };
    const assertLinear = (
      small: readonly number[],
      large: readonly number[]
    ) => {
      assert.ok(small.every((reads) => reads > 0));
      assert.ok(
        large.every((reads, index) => reads <= 60 * small[index]),
        `ownership work grew faster than the document: ${JSON.stringify({ large, small })}`
      );
    };
    const at = (path: number[], root?: string) => {
      const point = { offset: 0, path, ...(root ? { root } : {}) };

      return { anchor: point, focus: point };
    };
    const suggesting = (value: unknown, plugins: readonly unknown[] = []) => {
      let editor: any;
      const preview = () =>
        realLedger
          .getReviewLedger(editor)!
          .preview(editor.read.value(), 'proposed');
      const step = (edit: () => void) =>
        workOf(() => {
          edit();
          preview();
        });
      const loaded = workOf(() => {
        editor = createEditor({
          initialValue: value as never,
          plugins: [
            Cards,
            ...plugins,
            createAuthoredPlugin({
              authorId: 'bob',
              createChangeId: () => `bob:${(count += 1)}`,
              intent: 'propose',
              now: () => 1,
            }),
          ] as never,
        });
        editor.update((tx) => tx.selection.set(at([0, 0])));
        preview();
      });
      const keys = (selection: unknown) => {
        editor.update((tx) => tx.selection.set(selection));
        preview();

        return Array.from({ length: 8 }, () =>
          step(() => editor.update((tx) => tx.text.insert('k')))
        );
      };

      return { editor, keys, loaded, preview, step };
    };
    const SIZES = [20, 1000];
    const SLOW = { timeout: 20_000 };

    it(
      'does as much work for 8 Suggesting keys in a main paragraph, a card body root and a card’s own text at 1,000 cards as at 20, and as much ownership work for Backspace over a selected card',
      SLOW,
      () => {
        const [small, large] = SIZES.map((size) => {
          const { editor, keys, step } = suggesting(deck(size));
          const typed = [at([0, 0]), at([0, 0], 'b1'), at([1, 0])].map(keys);

          editor.update((tx) =>
            tx.selection.set(SelectionApi.nodes([[5]], { mode: 'block' }))
          );

          return {
            backspace: step(() =>
              editor.update((tx) =>
                tx.command(editorCommands.delete, {
                  direction: 'backward',
                  unit: 'character',
                })
              )
            ),
            typed,
          };
        });

        for (const [site, keys] of small.typed.entries()) {
          assertKeyOwnership(keys, large.typed[site]);
        }
        assert.deepEqual(large.typed, small.typed);
        assert.ok(small.backspace.ownedRootsJudged > 0);
        assert.deepEqual(
          pick(large.backspace, ['ownedRootsJudged', 'ownerIndexReads']),
          pick(small.backspace, ['ownedRootsJudged', 'ownerIndexReads']),
          'ownership work grew with the document'
        );
      }
    );

    it(
      'does as much work for 8 Suggesting keys beside 50 pending insertions at 1,000 cards as at 20',
      SLOW,
      () => {
        const [small, large] = SIZES.map((size) =>
          suggesting(deck(size, { pendingPerParagraph: 5 })).keys(at([0, 0]))
        );

        assertKeyOwnership(small, large);
        assert.deepEqual(large, small);
      }
    );

    it(
      'does as much ownership work for 8 Suggesting keys, an export and a decision while 10 card deletions are pending at 1,000 cards as at 20, and previews what the resolver gives',
      SLOW,
      () => {
        const [small, large] = SIZES.map((size) => {
          const { editor, keys, loaded, preview } = suggesting(
            deck(size, { struck: 10 })
          );
          const typed = keys(at([0, 0]));
          const stored = editor.read.value();
          const proposed = preview() as any;

          assert.deepEqual(
            proposed,
            projectAuthoredDocumentUnder(
              stored,
              'proposed',
              authoredResolveSchemaOf(editor)
            ).document
          );
          assert.deepEqual(
            Array.from({ length: 10 }, (_, index) =>
              Object.hasOwn(proposed.roots ?? {}, `b${index}`)
            ),
            Array.from({ length: 10 }, () => false)
          );

          const deletion = editor.read.authored
            .changes()
            .items.find((item: any) => item.id === 'carol:0');
          const unindexedCopy = JSON.parse(JSON.stringify(stored));
          const operations = [
            workOf(() =>
              getEditorAuthoredDocumentCapability(editor)!.project(
                unindexedCopy,
                'proposed',
                getCompiledEditorSchema(editor)
              )
            ),
            workOf(() =>
              editor.update.authored.decide({
                action: 'accept',
                changes: [deletion],
              })
            ),
          ].map((counts) =>
            pick(counts, ['ownedRootsJudged', 'ownerIndexReads'])
          );

          return { loaded: loaded.ownerIndexReads, operations, typed };
        });

        assertLinear([small.loaded], [large.loaded]);
        assertKeyOwnership(small.typed, large.typed);
        assert.ok(
          small.operations.every((counts) => counts.ownedRootsJudged > 0)
        );
        assert.deepEqual(
          large.operations,
          small.operations,
          'ownership work grew with the document'
        );
      }
    );

    it(
      'does as much ownership work for an undo, a redo and a key after them at 1,000 cards as at 20',
      SLOW,
      () => {
        const [small, large] = SIZES.map((size) => {
          const { editor, keys, step } = suggesting(deck(size), [history()]);

          keys(at([0, 0]));

          return [
            step(() => editor.api.history.undo()),
            step(() => editor.api.history.redo()),
            step(() => editor.update((tx) => tx.text.insert('k'))),
          ];
        });

        assertKeyOwnership(small, large, KEY_OWNERSHIP_UNDER_HISTORY);
      }
    );

    it('reads at most linearly more owner indexes to remove one owner of a shared root at 1,000 cards than at 20', () => {
      const [small, large] = SIZES.map((size) => {
        const value = deck(size);
        const editor = createEditor({
          initialValue: { ...value, children: [...value.children, card('b0')] },
          plugins: [SharedCards],
        });

        return workOf(() =>
          editor.update((tx) => tx.nodes.remove({ at: [2 * size] }))
        ).ownerIndexReads;
      });

      assertLinear([small], [large]);
    });
  });
});

describe('authored review tree storage', () => {
  const lawCheck = process.env.PLITE_LAW_CHECK;

  beforeAll(() => {
    process.env.PLITE_LAW_CHECK = '0';
  });
  after(() => {
    if (lawCheck === undefined) delete process.env.PLITE_LAW_CHECK;
    else process.env.PLITE_LAW_CHECK = lawCheck;
  });

  const texts = function* (nodes: readonly Node[]): Generator<Node> {
    for (const node of nodes) {
      if (typeof node.text === 'string') yield node;
      yield* texts(node.children ?? []);
    }
  };
  const members = (nodes: readonly Node[]): number =>
    nodes.reduce(
      (sum, node) =>
        sum +
        ((node.authored as readonly unknown[] | undefined)?.length ?? 0) +
        members(node.children ?? []),
      0
    );
  const storedAt = (value: {
    children: readonly Node[];
    records?: EditorDocumentRecords;
  }) => ({
    bytes: JSON.stringify(value).length,
    changes: new Set(
      [...texts(expandContexts(value as never).children as readonly Node[])]
        .flatMap(
          (leaf) =>
            (leaf.authored as Array<{ change: string }> | undefined) ?? []
        )
        .map(({ change }) => change)
    ).size,
    members: members(value.children),
    records: storedContexts(value).length,
  });

  it('stores k nested proposals by alternating authors in at most 4k + 1 members and k context records, in bytes linear in k', () => {
    const sizes = [1, 10, 50, 100, 200];
    let author = 'alice';
    const editor = createEditor({
      initialValue: [paragraph({ text: 'seed' })] as never,
      plugins: [
        Inline,
        createAuthoredPlugin({
          authorId: () => author,
          intent: 'propose',
          now: () => 1,
        }),
      ],
    });
    const stored: Array<ReturnType<typeof storedAt>> = [];

    // Each proposal types two letters between the two the previous one
    // typed, so it sits inside every earlier proposal.
    for (let step = 0; step < 200; step += 1) {
      const leaves = (editor.read.children()[0] as Node).children ?? [];
      let leaf = 0;
      let offset = 2 + step;

      while (offset > (leaves[leaf]?.text ?? '').length) {
        offset -= (leaves[leaf]?.text ?? '').length;
        leaf += 1;
      }
      author = step % 2 === 0 ? 'alice' : 'bob';
      editor.update((tx) => {
        tx.authored.propose();
        tx.text.insert('xy', { at: { offset, path: [0, leaf] } });
      });
      if (sizes.includes(step + 1)) {
        stored.push(storedAt(editor.read.value()));
      }
    }

    for (const [index, k] of sizes.entries()) {
      const { changes, members: memberCount, records } = stored[index];

      assert.equal(changes, k);
      assert.ok(
        memberCount <= 4 * k + 1,
        `${memberCount} members for k = ${k}`
      );
      assert.ok(records <= k, `${records} records for k = ${k}`);
    }

    const [fifty, hundred, twoHundred] = stored
      .slice(2)
      .map(({ bytes }) => bytes);

    assert.ok(
      (twoHundred - hundred) / 100 <= ((hundred - fifty) / 50) * 1.1,
      `bytes grow faster than k: ${JSON.stringify(stored)}`
    );
  });
});

import assert from 'node:assert/strict';
import { join } from 'node:path';
import { after, before as beforeAll, describe, it } from 'node:test';

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
  defineEditorSchema,
  definePlugin,
  editorCommands,
  property,
  schema,
  target,
} = await import('plitejs');
const { createAuthoredPlugin } = await import('../src/authored/authored');
const { proposedChildren, proposedHost } =
  await import('../src/authored/tree/proposed');
const { expandContexts } = await import('../src/authored/facts/compact');
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

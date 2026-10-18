import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  createEditorView,
  defineEditorSchema,
  DocumentChange,
  schema,
} from 'plitejs';

import { createAuthoredPlugin } from '../src/authored/authored';
import { compactClaims, expandContexts } from '../src/authored/facts/compact';
import { claimsOf, factsOf } from '../src/authored/facts/facts';
import { contextRecordOf } from '../src/authored/facts/records';
import { normalizeSetValues } from '../src/core/change/transform';
import type { EditorDocumentRecords } from '../src/interfaces/editor';
import {
  authoredTestApi,
  recordsOf,
  reviewRecords,
  storedContexts,
} from './support/authored';

const Blocks = defineEditorSchema('authored-facts-blocks', {
  elements: { paragraph: schema.element.textBlock() },
  id: 'authored-facts-blocks',
  root: schema.content.type('paragraph', {
    default: { type: 'paragraph' },
    min: 1,
  }),
  unknown: 'reject',
  version: 1,
});

type Node = Readonly<{
  authored?: readonly unknown[];
  children?: readonly Node[];
  text?: string;
}>;

type Value = Readonly<{
  children: readonly Node[];
  records?: EditorDocumentRecords;
}>;

const entriesIn = (nodes: readonly Node[]): number =>
  nodes.reduce(
    (sum, node) =>
      sum + (node.authored?.length ?? 0) + entriesIn(node.children ?? []),
    0
  );

/**
 * What recording gives when Alice and Bob take turns proposing two letters
 * between the two the last proposal inserted, so each proposal sits inside
 * every earlier one.
 */
const stacked = (k: number): Value => {
  const claims = (depth: number) =>
    normalizeSetValues(
      Array.from({ length: depth }, (_, index) => ({
        at: index + 1,
        author: index % 2 === 0 ? 'alice' : 'bob',
        change: `c${2 * index + 1}`,
        kind: 'insert',
      }))
    );
  const outer = Array.from({ length: k - 1 }, (_, index) => index + 1);

  return {
    children: [
      {
        children: [
          { text: 'se' },
          ...outer.map((depth) => ({ authored: claims(depth), text: 'x' })),
          { authored: claims(k), text: 'xy' },
          ...outer
            .reverse()
            .map((depth) => ({ authored: claims(depth), text: 'y' })),
          { text: 'ed' },
        ],
        type: 'paragraph',
      } as Node,
    ],
  };
};

const A = { at: 2, author: 'alice', change: 'A', kind: 'insert' };
const B = { at: 1, author: 'bob', change: 'B', kind: 'insert' };

const reusedId: Value = {
  children: [
    {
      children: [
        { authored: [A], text: 'he' },
        { authored: [B, A], text: 'X' },
        { authored: [A], text: 'rs' },
        { text: ' ' },
        { authored: [B], text: 'Y' },
      ],
      type: 'paragraph',
    } as Node,
  ],
};

describe('authored review facts', () => {
  for (const [k, entries, contexts] of [
    [1, 1, 0],
    [10, 36, 9],
    [50, 196, 49],
    [100, 396, 99],
    [200, 796, 199],
  ]) {
    it(`compacts ${k} nested proposals to ${entries} claims and ${contexts} contexts`, () => {
      const value = stacked(k);
      const compacted = compactClaims(value);

      assert.deepEqual(
        {
          contexts: storedContexts(compacted).length,
          entries: entriesIn(compacted.children),
          expanded: expandContexts(compacted),
        },
        { contexts, entries, expanded: value }
      );
    });
  }

  it('stores bytes linear in the nesting depth', () => {
    const bytes = (k: number) => {
      const compacted = compactClaims(stacked(k));

      return JSON.stringify({ ...compacted, records: recordsOf(compacted) })
        .length;
    };

    assert.ok(
      bytes(200) < 2.1 * bytes(100),
      `${bytes(200)} > 2.1 × ${bytes(100)}`
    );
  });

  it('keeps a reused change id on each node that carries it', () => {
    const compacted = compactClaims(reusedId);
    const { ctx } = contextRecordOf(null, {
      at: 2,
      author: 'alice',
      change: 'A',
    });

    assert.deepEqual(
      { ...compacted, records: recordsOf(compacted) },
      {
        children: [
          {
            children: [
              { authored: [A], text: 'he' },
              { authored: [B, { ctx, kind: 'in' }], text: 'X' },
              { authored: [A], text: 'rs' },
              { text: ' ' },
              { authored: [B], text: 'Y' },
            ],
            type: 'paragraph',
          },
        ],
        records: reviewRecords({
          contexts: [
            contextRecordOf(null, { at: 2, author: 'alice', change: 'A' }),
          ],
        }),
      }
    );
    assert.deepEqual(expandContexts(compacted), reusedId);
  });

  const C = { at: 3, author: 'carol', change: 'C', kind: 'insert' };
  const inA = contextRecordOf(null, A);
  const inAB = contextRecordOf(inA.ctx, B);
  const inB = contextRecordOf(null, B);
  const inBA = contextRecordOf(inB.ctx, A);
  const claimsAt = (value: Value, at: number) =>
    claimsOf(value.children[0].children![at], factsOf(value))
      .map((claim) => claim.change)
      .toSorted();
  const resting = (
    marks: readonly unknown[],
    contexts: Parameters<typeof reviewRecords>[0]['contexts']
  ): Value => ({
    children: [
      {
        children: [
          { authored: [A], text: 'he' },
          { authored: [A], text: 'r' },
          { authored: [B, { ctx: inA.ctx, kind: 'in' }], text: 'b' },
          { authored: marks, text: 'X' },
        ],
        type: 'paragraph',
      } as Node,
    ],
    records: reviewRecords({ contexts }),
  });

  it('moves the insertions a node holds beside its context into one context', () => {
    const value = resting([B, C, { ctx: inA.ctx, kind: 'in' }], [inA]);
    const compacted = compactClaims(value);

    assert.deepEqual(compacted.children[0].children?.[3], {
      authored: [C, { ctx: inAB.ctx, kind: 'in' }],
      text: 'X',
    });
    assert.deepEqual(
      recordsOf(compacted),
      reviewRecords({ contexts: [inA, inAB] })
    );
    assert.deepEqual(claimsAt(compacted, 3), ['A', 'B', 'C']);
  });

  it('folds the two contexts two peers compacting one node at once leave on it', () => {
    const value = resting(
      [C, { ctx: inAB.ctx, kind: 'in' }, { ctx: inBA.ctx, kind: 'in' }],
      [inA, inAB, inB, inBA]
    );
    const compacted = compactClaims(value);

    assert.deepEqual(compacted.children[0].children?.[3], {
      authored: [C, { ctx: inAB.ctx, kind: 'in' }],
      text: 'X',
    });
    assert.deepEqual(recordsOf(compacted), value.records);
    assert.deepEqual(claimsAt(compacted, 3), ['A', 'B', 'C']);
  });
});

describe('authored review fact validation', () => {
  const alice = { at: 2, author: 'alice', change: 'A' };
  const root = contextRecordOf(null, alice);
  const refused = (reason: string) => ({ message: reason });
  const load = (value: Value) => () =>
    createEditor({
      initialValue: value as never,
      plugins: [Blocks, createAuthoredPlugin({ authorId: 'dana' })],
    });
  const restingOn = (
    ctx: string,
    contexts: Readonly<Record<string, unknown>>
  ): Value => ({
    children: [
      {
        children: [{ authored: [B, { ctx, kind: 'in' }], text: 'X' }],
        type: 'paragraph',
      } as Node,
    ],
    records: { 'authored-contexts': contexts } as EditorDocumentRecords,
  });

  it('refuses text resting on a context the document lacks', () => {
    assert.throws(
      load(restingOn(root.ctx, {})),
      refused(
        `Review context ${root.ctx} is missing. Save the whole read.value(), not only its children, so review contexts travel with the text.`
      )
    );
  });

  it('refuses contexts that rest on each other', () => {
    assert.throws(
      load(
        restingOn('c:one', {
          'c:one': { base: 'c:two', member: root.member },
          'c:two': { base: 'c:one', member: root.member },
        })
      ),
      refused('Review context c:one rests on itself.')
    );
  });

  it('refuses a landed write whose record names no member', () => {
    assert.throws(
      load({
        children: [{ children: [{ text: 'X' }], type: 'paragraph' } as Node],
        records: {
          'authored-landed': { w1: { change: 'A' } },
        },
      }),
      refused('Review landed write w1 is malformed.')
    );
  });

  it('refuses a record its id does not hash', () => {
    assert.throws(
      load(
        restingOn(root.ctx, {
          [root.ctx]: { member: { ...root.member, author: 'mallory' } },
        })
      ),
      refused(`Review context ${root.ctx} does not match its content.`)
    );
  });
});

describe('authored admission', () => {
  it('compacts stacked insertions an undo brings back, in the commit that brings them', () => {
    const editor = createEditor({
      initialValue: [{ children: [{ text: 'x' }], type: 'paragraph' }] as never,
      plugins: [Blocks, createAuthoredPlugin({ authorId: 'dana' })],
    });

    editor.update({ tags: ['historic'] }, (tx) => {
      tx.nodes.insert(reusedId.children[0] as never, { at: [1] });
    });

    assert.deepEqual(editor.read.value(), {
      children: [
        { children: [{ text: 'x' }], type: 'paragraph' },
        {
          children: [
            { authored: [A], text: 'he' },
            {
              authored: [B, { ctx: contextRecordOf(null, A).ctx, kind: 'in' }],
              text: 'X',
            },
            { authored: [A], text: 'rs' },
            { text: ' ' },
            { authored: [B], text: 'Y' },
          ],
          type: 'paragraph',
        },
      ],
      records: reviewRecords({ contexts: [contextRecordOf(null, A)] }),
    });
  });

  const bob = { at: 2, author: 'bob', change: 'bob:1' };
  const rejected = (kind: 'delete' | 'held') => ({
    children: [
      {
        children: [
          { text: 'a' },
          { authored: [{ ...bob, kind }], text: 'b' },
          { text: 'c' },
        ],
        type: 'paragraph',
      },
    ],
    records: reviewRecords({
      verdicts: [
        {
          decision: 'd:1',
          member: { at: bob.at, change: bob.change },
          verdict: 'reject',
        },
      ],
    }),
  });

  it('settles the document a view shows', () => {
    const editor = createEditor({
      initialValue: [{ children: [{ text: 'x' }], type: 'paragraph' }] as never,
      plugins: [Blocks, createAuthoredPlugin({ authorId: 'dana' })],
    });

    assert.deepEqual(
      createEditorView(editor, {
        document: rejected('delete'),
      }).read.value(),
      rejected('held')
    );
  });

  const heldDeletionUnder = (
    join: Readonly<Record<string, unknown>>,
    verdict: Readonly<{ change: string; verdict: 'accept' | 'reject' }>
  ) => ({
    children: [
      { children: [{ text: 'x' }], type: 'paragraph' },
      {
        children: [
          {
            authored: [
              { at: 3, author: 'bob', change: '~edit:bob', kind: 'delete' },
            ],
            text: 'ab',
          },
        ],
        type: 'heading',
      },
      { ...join, children: [{ text: 'cd' }], type: 'paragraph' },
    ],
    records: reviewRecords({
      verdicts: [
        {
          decision: 'd:1',
          member: { at: 2, change: verdict.change },
          verdict: verdict.verdict,
        },
      ],
    }),
  });
  const pendingJoinHolds = () =>
    heldDeletionUnder(
      {
        authored: [{ at: 1, author: 'carol', change: 'carol:1', kind: 'join' }],
      },
      { change: 'dana:1', verdict: 'accept' }
    );
  const rejectedJoinHeld = () =>
    heldDeletionUnder({}, { change: 'carol:1', verdict: 'reject' });

  it('keeps an Editing deletion a pending join holds through a load that settles verdicts', () => {
    const editor = createEditor({
      initialValue: pendingJoinHolds() as never,
      plugins: [createAuthoredPlugin({ authorId: 'dana' })],
    });

    assert.deepEqual(editor.read.children(), pendingJoinHolds().children);
    authoredTestApi(editor).decide({ action: 'accept', changes: ['carol:1'] });
    assert.deepEqual(editor.read.children(), [
      { children: [{ text: 'x' }], type: 'paragraph' },
      { children: [{ text: 'cd' }], type: 'heading' },
    ]);
  });

  it('applies an Editing deletion once its join is decided', () => {
    const editor = createEditor({
      initialValue: rejectedJoinHeld() as never,
      plugins: [createAuthoredPlugin({ authorId: 'dana' })],
    });

    assert.deepEqual(editor.read.children(), [
      { children: [{ text: 'x' }], type: 'paragraph' },
      { children: [{ text: '' }], type: 'heading' },
      { children: [{ text: 'cd' }], type: 'paragraph' },
    ]);
  });

  it('keeps an Editing deletion a pending join holds through an edit to the joining line', () => {
    const editor = createEditor({
      initialValue: pendingJoinHolds() as never,
      plugins: [createAuthoredPlugin({ authorId: 'dana', intent: 'edit' })],
    });

    editor.update((tx) =>
      tx.text.insert('!', { at: { offset: 2, path: [2, 0] } })
    );

    assert.deepEqual(editor.read.children()[1], pendingJoinHolds().children[1]);
  });

  const followerBetween = () => {
    const { children, records } = pendingJoinHolds();

    return {
      children: [
        children[0],
        children[1],
        {
          authored: [
            {
              at: 4,
              author: 'dana',
              change: 'dana:2',
              follows: JSON.stringify(['carol:1', 1]),
              kind: 'insert',
            },
          ],
          children: [{ text: 'X' }],
          type: 'paragraph',
        },
        children[2],
      ],
      records,
    };
  };

  it('keeps an Editing deletion a pending join holds past a block that goes with the join, through a load that settles verdicts', () => {
    const editor = createEditor({
      initialValue: followerBetween() as never,
      plugins: [createAuthoredPlugin({ authorId: 'erin' })],
    });

    assert.deepEqual(editor.read.children(), followerBetween().children);
    authoredTestApi(editor).decide({
      action: 'accept',
      changes: ['carol:1', 'dana:2'],
    });
    assert.deepEqual(editor.read.children(), [
      { children: [{ text: 'x' }], type: 'paragraph' },
      { children: [{ text: 'cd' }], type: 'heading' },
      { children: [{ text: 'X' }], type: 'paragraph' },
    ]);
  });

  for (const intent of ['edit', 'propose'] as const) {
    it(`keeps an Editing deletion a pending join holds past a block that goes with the join, through ${intent === 'edit' ? 'an Editing' : 'a suggested'} write to the held line`, () => {
      const editor = createEditor({
        initialValue: followerBetween() as never,
        plugins: [createAuthoredPlugin({ authorId: 'erin', intent })],
      });

      editor.update((tx) => tx.nodes.set({ id: 'h' }, { at: [1] }));

      assert.deepEqual(
        (editor.read.children()[1] as { children: unknown }).children,
        followerBetween().children[1].children
      );
    });
  }

  it('lands a join whose change emptied its line in an earlier incarnation as two changes do', () => {
    const accepted = (deleter: string, joiner: string) => {
      const editor = createEditor({
        initialValue: [
          { children: [{ text: 'x' }], type: 'paragraph' },
          {
            children: [
              {
                authored: [
                  {
                    at: 1,
                    author: 'bob',
                    change: deleter,
                    inc: 'del',
                    kind: 'delete',
                  },
                ],
                text: 'ab',
              },
            ],
            type: 'heading',
          },
          {
            authored: [
              {
                at: 2,
                author: 'bob',
                change: joiner,
                inc: 'join',
                kind: 'join',
              },
            ],
            children: [{ text: 'cd' }],
            type: 'paragraph',
          },
        ] as never,
        plugins: [createAuthoredPlugin({ authorId: 'dana' })],
      });

      authoredTestApi(editor).decide({
        action: 'accept',
        changes: [...new Set([deleter, joiner])],
      });

      return editor.read.children();
    };
    const joined = [
      { children: [{ text: 'x' }], type: 'paragraph' },
      { children: [{ text: 'cd' }], type: 'paragraph' },
    ];

    assert.deepEqual(
      { one: accepted('C', 'C'), two: accepted('C', 'D') },
      { one: joined, two: joined }
    );
  });

  it("admits an edit to a root's first block while its last block holds a held Editing deletion", () => {
    const quote = {
      children: [
        {
          children: [
            {
              authored: [
                { at: 3, author: 'bob', change: '~edit:bob', kind: 'delete' },
              ],
              text: 'ab',
            },
          ],
          type: 'paragraph',
        },
        {
          authored: [
            { at: 1, author: 'carol', change: 'carol:1', kind: 'join' },
          ],
          children: [{ text: 'cd' }],
          type: 'paragraph',
        },
      ],
      type: 'blockquote',
    };
    const editor = createEditor({
      initialValue: {
        children: [{ children: [{ text: 'x' }], type: 'paragraph' }],
        roots: {
          notes: [{ children: [{ text: 'n' }], type: 'paragraph' }, quote],
        },
      } as never,
      plugins: [createAuthoredPlugin({ authorId: 'dana', intent: 'edit' })],
    });

    createEditorView(editor, { root: 'notes' }).update((tx) =>
      tx.text.insert('!', { at: { offset: 1, path: [0, 0] } })
    );

    assert.deepEqual(editor.read.value().roots?.notes, [
      { children: [{ text: 'n!' }], type: 'paragraph' },
      quote,
    ]);
  });

  const replacing = (intent: 'edit' | 'propose') => {
    const source = createEditor({
      initialValue: {
        children: [
          { children: [{ text: 'x' }], type: 'paragraph' },
          reusedId.children[0],
          ...rejected('delete').children,
        ],
        records: rejected('delete').records,
      } as never,
      plugins: [Blocks, createAuthoredPlugin({ authorId: 'zed' })],
    });
    const editor = createEditor({
      initialValue: [{ children: [{ text: 'x' }], type: 'paragraph' }] as never,
      plugins: [
        Blocks,
        createAuthoredPlugin({ authorId: 'dana', intent, now: () => 5 }),
      ],
    });

    editor.update((tx) => {
      if (intent === 'propose') tx.authored.propose({ changeId: 'D' });
      tx.value.replace(source.read.value());
    });

    return { replaced: expandContexts(editor.read.value()), source };
  };

  it('stores a replacing value that rests on review contexts as it is, in Editing', () => {
    const { replaced, source } = replacing('edit');

    assert.deepEqual(replaced, expandContexts(source.read.value()));
  });

  it('nests the claims of a replacing value that rests on review contexts under the writer’s, in Suggesting', () => {
    const D = { at: 5, author: 'dana', change: 'D', kind: 'insert' };

    assert.deepEqual(replacing('propose').replaced, {
      children: [
        { children: [{ text: 'x' }], type: 'paragraph' },
        {
          authored: [D],
          children: [
            { authored: [A, D], text: 'he' },
            { authored: [B, A, D], text: 'X' },
            { authored: [A, D], text: 'rs' },
            { authored: [D], text: ' ' },
            { authored: [B, D], text: 'Y' },
          ],
          type: 'paragraph',
        },
        {
          authored: [D],
          children: [
            { authored: [D], text: 'a' },
            { authored: [{ ...bob, kind: 'held' }, D], text: 'b' },
            { authored: [D], text: 'c' },
          ],
          type: 'paragraph',
        },
      ],
      records: rejected('held').records,
    });
  });

  it('stores a replacing value that holds 50 nested proposals stacked as loading it does, and in 4k + 1 claims and k contexts in Suggesting', () => {
    const value = stacked(50);
    const editorOf = (
      initialValue: unknown,
      intent: 'edit' | 'propose' = 'edit'
    ) =>
      createEditor({
        initialValue: initialValue as never,
        plugins: [
          Blocks,
          createAuthoredPlugin({ authorId: 'dana', intent, now: () => 5 }),
        ],
      });
    const replaced = (intent: 'edit' | 'propose') => {
      const editor = editorOf(
        [{ children: [{ text: 'x' }], type: 'paragraph' }],
        intent
      );

      editor.update((tx) => {
        if (intent === 'propose') tx.authored.propose({ changeId: 'D' });
        tx.value.replace(value as never);
      });

      return editor.read.value() as Value;
    };
    const suggested = replaced('propose');

    assert.deepEqual(
      {
        edit: replaced('edit'),
        suggested: {
          contexts: storedContexts(suggested).length,
          entries: entriesIn(suggested.children),
        },
      },
      {
        edit: editorOf(value).read.value(),
        suggested: { contexts: 50, entries: 201 },
      }
    );
  });

  it('stores a root a replacing value adds as it is, with the review contexts it rests on, in Editing', () => {
    // An open schema lets a document hold roots it does not declare.
    const Open = defineEditorSchema('authored-facts-open', {
      elements: { paragraph: schema.element.textBlock() },
      id: 'authored-facts-open',
      root: schema.content.types(['paragraph'], {
        default: { type: 'paragraph' },
        min: 1,
      }),
      unknown: 'preserve',
      version: 1,
    });
    const source = createEditor({
      initialValue: {
        children: [{ children: [{ text: 'x' }], type: 'paragraph' }],
        roots: { aside: reusedId.children },
      } as never,
      plugins: [Open, createAuthoredPlugin({ authorId: 'zed' })],
    });
    const editor = createEditor({
      initialValue: [{ children: [{ text: 'x' }], type: 'paragraph' }] as never,
      plugins: [Open, createAuthoredPlugin({ authorId: 'dana' })],
    });

    editor.update((tx) => tx.value.replace(source.read.value()));
    assert.deepEqual(
      expandContexts(editor.read.value()),
      expandContexts(source.read.value())
    );
  });

  it('keeps the records struck text rests on when a Suggesting replacement brings none', () => {
    const D = { at: 5, author: 'dana', change: 'D' };
    const editor = createEditor({
      initialValue: reusedId.children as never,
      plugins: [
        Blocks,
        createAuthoredPlugin({
          authorId: 'dana',
          intent: 'propose',
          now: () => 5,
        }),
      ],
    });

    editor.update((tx) => {
      tx.authored.propose({ changeId: 'D' });
      tx.value.replace({
        children: [{ children: [{ text: 'q' }], type: 'paragraph' }],
      });
    });
    assert.deepEqual(expandContexts(editor.read.value()), {
      children: [
        {
          children: [
            { authored: [A, { ...D, kind: 'delete' }], text: 'he' },
            { authored: [B, A, { ...D, kind: 'delete' }], text: 'X' },
            { authored: [A, { ...D, kind: 'delete' }], text: 'rs' },
            { authored: [{ ...D, kind: 'delete' }], text: ' ' },
            { authored: [B, { ...D, kind: 'delete' }], text: 'Y' },
            { authored: [{ ...D, kind: 'insert' }], text: 'q' },
          ],
          type: 'paragraph',
        },
      ],
    });
  });
});

describe('authored records across a value change', () => {
  const blocks = [{ children: [{ text: 'q' }], type: 'paragraph' }];
  const changes = {
    between: (editor: ReturnType<typeof createEditor>) =>
      editor.update((tx) =>
        tx.changes.apply(
          DocumentChange.between(editor.read.value(), {
            children: blocks,
          })
        )
      ),
    replace: (editor: ReturnType<typeof createEditor>) =>
      editor.update((tx) => tx.value.replace({ children: blocks })),
  };

  for (const [name, change] of Object.entries(changes)) {
    it(`keeps the records through a ${name} that brings none, and loads them again`, () => {
      const plugins = [Blocks, createAuthoredPlugin({ authorId: 'dana' })];
      const editor = createEditor({
        initialValue: reusedId.children as never,
        plugins,
      });
      const { records } = editor.read.value();

      change(editor);

      const reloaded = createEditor({
        initialValue: editor.read.value() as never,
        plugins,
      });

      assert.notEqual(records, undefined);
      assert.deepEqual(
        [editor.read.value(), reloaded.read.value()],
        [
          { children: blocks, records },
          { children: blocks, records },
        ]
      );
    });
  }
});

describe('authored incarnations', () => {
  it('gives two peers proposing a decided id in one millisecond distinct incarnations', () => {
    const peer = () => {
      const editor = createEditor({
        initialValue: [
          {
            children: [{ authored: [A], text: 'hers' }],
            type: 'paragraph',
          },
        ] as never,
        plugins: [
          Blocks,
          createAuthoredPlugin({ authorId: 'alice', now: () => 5 }),
        ],
      });

      authoredTestApi(editor).decide({ action: 'reject', changes: ['A'] });
      editor.update((tx) => {
        tx.authored.propose({ changeId: 'A' });
        tx.text.insert('!', { at: { offset: 0, path: [0, 0] } });
      });

      return (editor.read.children()[0] as Node).children ?? [];
    };
    const [left, right] = [peer(), peer()];
    const incOf = (leaves: readonly Node[]) =>
      (leaves[0]?.authored?.[0] as { inc?: string } | undefined)?.inc;

    assert.notEqual(incOf(left), undefined);
    assert.notEqual(incOf(left), incOf(right));
  });

  it('keeps a format pending through a load that settles its earlier incarnation', () => {
    const bold = {
      at: 1,
      author: 'ann',
      change: 'C',
      key: 'bold',
      kind: 'format',
      write: { kind: 'set', value: true },
    };
    const editor = createEditor({
      initialValue: {
        children: [
          {
            children: [
              {
                authored: [
                  { ...bold, id: 'old' },
                  {
                    ...bold,
                    at: 2,
                    before: true,
                    id: 'new',
                    inc: 'ann:next',
                    write: { kind: 'set', value: false },
                    base: { kind: 'remove' },
                    over: [
                      [{ id: 'old', write: { kind: 'set', value: true } }],
                    ],
                  },
                ],
                bold: false,
                text: 'x',
              },
            ],
            type: 'paragraph',
          },
        ],
        records: reviewRecords({
          verdicts: [
            {
              decision: 'd:1',
              member: { at: 1, change: 'C' },
              verdict: 'accept',
            },
          ],
        }),
      } as never,
      plugins: [createAuthoredPlugin({ authorId: 'dana' })],
    });

    authoredTestApi(editor).decide({ action: 'reject', changes: ['C'] });

    assert.deepEqual(editor.read.children(), [
      { children: [{ bold: true, text: 'x' }], type: 'paragraph' },
    ]);
  });

  describe('a fork that keeps an accepted tag', () => {
    const color = (change: 'C' | 'D', at: number, value: string) => ({
      at,
      author: change === 'C' ? 'ann' : 'bob',
      before: 'red',
      change,
      id: change.toLowerCase(),
      key: 'color',
      kind: 'format',
      write: { kind: 'set', value },
    });
    const over = {
      at: 4,
      author: 'eve',
      base: { kind: 'remove' },
      before: 'purple',
      change: 'F',
      id: 'f',
      key: 'color',
      kind: 'format',
      over: [
        [
          { id: 'c', write: { kind: 'set', value: 'blue' } },
          { id: 'd', write: { kind: 'set', value: 'purple' } },
        ],
      ],
      write: { kind: 'set', value: 'green' },
    };
    const start = (top: readonly unknown[] = []) =>
      createEditor({
        initialValue: {
          children: [
            {
              children: [
                {
                  authored: [
                    color('C', 1, 'blue'),
                    color('D', 2, 'purple'),
                    ...top,
                  ],
                  color: top.length > 0 ? 'green' : 'purple',
                  text: 'x',
                },
              ],
              type: 'paragraph',
            },
            {
              children: [
                { text: 'z' },
                {
                  authored: [
                    { at: 3, author: 'eve', change: 'E', kind: 'insert' },
                  ],
                  text: 'e',
                },
              ],
              type: 'paragraph',
            },
          ],
          records: reviewRecords({
            verdicts: [
              {
                decision: 'd:1',
                member: { at: 1, change: 'C' },
                verdict: 'accept',
              },
            ],
          }),
        } as never,
        plugins: [createAuthoredPlugin({ authorId: 'ann', now: () => 5 })],
      });
    const leaf = (editor: ReturnType<typeof start>) =>
      (editor.read.children()[0] as Node).children?.[0] as Node & {
        color?: string;
      };

    it('keeps the accepted value when the pending one is rejected', () => {
      const editor = start();

      authoredTestApi(editor).decide({ action: 'reject', changes: ['D'] });

      assert.deepEqual(leaf(editor), { color: 'blue', text: 'x' });
    });

    it('decides other changes without waiting on the pending one', () => {
      const restyled = () => {
        const editor = start();

        editor.update((tx) => {
          tx.authored.propose({ changeId: 'C' });
          tx.nodes.set({ color: 'yellow' } as never, { at: [0, 0] });
        });

        return editor;
      };
      const rejected = restyled();
      const rejection = authoredTestApi(rejected).decide({
        action: 'reject',
        changes: ['C'],
      });

      assert.deepEqual(
        {
          acceptE: authoredTestApi(start()).decide({
            action: 'accept',
            changes: ['E'],
          }).status,
          acceptOver: authoredTestApi(start([over])).decide({
            action: 'accept',
            changes: ['F'],
          }),
          acceptNewC: authoredTestApi(restyled()).decide({
            action: 'accept',
            changes: ['C'],
          }),
          rejectNewC: [
            rejection.status,
            leaf(rejected).color,
            (leaf(rejected).authored as Array<{ change: string }>).map(
              ({ change }) => change
            ),
          ],
        },
        {
          acceptE: 'applied',
          acceptNewC: { ids: ['C'], status: 'blocked', with: ['D'] },
          acceptOver: { ids: ['F'], status: 'blocked', with: ['D'] },
          rejectNewC: ['applied', 'purple', ['C', 'D']],
        }
      );
    });
  });

  it('starts a new incarnation of a change whose accepted claim a pending fork keeps', () => {
    const bold = {
      key: 'bold',
      kind: 'format',
      write: { kind: 'set', value: true },
    };
    const editor = createEditor({
      initialValue: {
        children: [
          {
            children: [
              {
                authored: [
                  { ...bold, at: 1, author: 'ann', change: 'C', id: 'c' },
                  { ...bold, at: 2, author: 'bob', change: 'D', id: 'd' },
                ],
                bold: true,
                text: 'x',
              },
            ],
            type: 'paragraph',
          },
          { children: [{ text: 'z' }], type: 'paragraph' },
        ],
        records: reviewRecords({
          verdicts: [
            {
              decision: 'd:1',
              member: { at: 1, change: 'C' },
              verdict: 'accept',
            },
          ],
        }),
      } as never,
      plugins: [createAuthoredPlugin({ authorId: 'ann', now: () => 5 })],
    });

    editor.update((tx) => {
      tx.authored.propose({ changeId: 'C' });
      tx.text.insert('!', { at: { offset: 1, path: [1, 0] } });
    });

    assert.deepEqual(
      editor.read.authored
        .changes()
        .items.map(({ createdAt, id, kind }) => [id, kind, createdAt]),
      [
        ['D', 'format', 2],
        ['C', 'insert', 5],
      ]
    );
  });
});

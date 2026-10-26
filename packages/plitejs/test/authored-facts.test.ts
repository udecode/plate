import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  createEditorView,
  defineEditorSchema,
  DocumentChange,
  type EditorUpdateTransaction,
  property,
  schema,
  target,
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

    const [fifty, hundred] = [50, 100].map(bytes);

    assert.ok(hundred < 2.1 * fifty, `${hundred} > 2.1 × ${fifty}`);
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
      { children: [{ text: 'cd' }], type: 'heading' },
    ];

    assert.deepEqual(
      { one: accepted('C', 'C'), two: accepted('C', 'D') },
      { one: joined, two: joined }
    );
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

describe('authored settle of a deleted link', () => {
  const Links = defineEditorSchema('authored-facts-links', {
    elements: {
      link: {
        content: schema.content.text({ default: 'text', min: 1 }),
        inline: true,
      },
    },
    id: 'authored-facts-links',
    properties: [
      schema.elementProperty('url', property.string(), {
        target: target.type('link'),
      }),
    ],
    root: schema.content.not(schema.content.text()),
    unknown: 'preserve',
    version: 1,
  });
  const carol = { at: 1, author: 'carol', change: 'carol:1', kind: 'delete' };
  const loadedWithLink = (children: readonly Node[]) =>
    createEditor({
      initialValue: {
        children: [
          {
            children: [
              { text: 'see ' },
              { authored: [carol], children, type: 'link', url: 'u' },
              { text: ' now' },
            ],
            type: 'paragraph',
          },
        ],
        records: reviewRecords({
          verdicts: [
            {
              decision: 'd:1',
              member: { at: carol.at, change: carol.change },
              verdict: 'accept',
            },
          ],
        }),
      } as never,
      plugins: [Links, createAuthoredPlugin({ authorId: 'dana' })],
    }).read.children();

  it('removes a link whose deletion a verdict accepted, and its neighbours merge', () => {
    assert.deepEqual(loadedWithLink([{ authored: [carol], text: 'site' }]), [
      { children: [{ text: 'see  now' }], type: 'paragraph' },
    ]);
  });

  it('keeps a link whose deletion a verdict accepted while it holds another author’s pending text', () => {
    const dan = { at: 2, author: 'dan', change: 'dan:1', kind: 'insert' };

    assert.deepEqual(
      loadedWithLink([
        { authored: [carol], text: 'site' },
        { authored: [dan], text: 'x' },
      ]),
      [
        {
          children: [
            { text: 'see ' },
            {
              authored: [carol],
              children: [{ authored: [dan], text: 'x' }],
              type: 'link',
              url: 'u',
            },
            { text: ' now' },
          ],
          type: 'paragraph',
        },
      ]
    );
  });
});

describe('authored settle of a deleted block', () => {
  const Shapes = defineEditorSchema('authored-facts-shapes', {
    elements: {
      blockquote: { content: schema.content.type('paragraph', { min: 1 }) },
      heading: schema.element.textBlock(),
      paragraph: schema.element.textBlock(),
    },
    id: 'authored-facts-shapes',
    root: schema.content.any(
      ['blockquote', 'heading', 'paragraph'].map((type) =>
        schema.content.type(type)
      ),
      { default: { type: 'paragraph' }, min: 1 }
    ),
    unknown: 'reject',
    version: 1,
  });
  const carol = { at: 1, author: 'carol', change: 'carol:1', kind: 'delete' };
  const dan = { at: 2, author: 'dan', change: 'dan:1' };
  const accepted = reviewRecords({
    verdicts: [
      {
        decision: 'd:1',
        member: { at: carol.at, change: carol.change },
        verdict: 'accept',
      },
    ],
  });
  const line = (text: string, type = 'paragraph') => ({
    children: [{ text }],
    type,
  });
  const deleted = (text: string, authored: readonly unknown[] = []) => ({
    authored: [carol, ...authored],
    children: [{ authored: [carol], text }],
    type: 'paragraph',
  });
  const editorOf = (value: Value, shapes = Shapes) =>
    createEditor({
      initialValue: value as never,
      plugins: [shapes, createAuthoredPlugin({ authorId: 'bob' })],
    });
  const decided = (
    children: readonly Node[],
    decisions: Parameters<ReturnType<typeof authoredTestApi>['decide']>[0],
    shapes = Shapes
  ) => {
    const editor = editorOf({ children }, shapes);

    authoredTestApi(editor).decide(decisions);

    return editor.read.children();
  };
  const assertMatchesDecidingAtOnce = (
    children: readonly Node[],
    action: 'accept' | 'reject',
    shapes = Shapes
  ) => {
    const editor = editorOf({ children, records: accepted }, shapes);

    authoredTestApi(editor).decide({ action, changes: ['dan:1'] });
    assert.deepEqual(
      editor.read.children(),
      decided(
        children,
        [
          { action: 'accept', changes: ['carol:1'] },
          { action, changes: ['dan:1'] },
        ],
        shapes
      )
    );
  };
  const Titled = defineEditorSchema('authored-facts-titled', {
    elements: {
      paragraph: schema.element.textBlock(),
      title: schema.element.textBlock(),
    },
    id: 'authored-facts-titled',
    root: schema.content.prefix(
      [{ element: 'title' }],
      schema.content.types(['paragraph'], { default: { type: 'paragraph' } })
    ),
    unknown: 'reject',
    version: 1,
  });
  const HeadingFirst = defineEditorSchema('authored-facts-heading-first', {
    elements: {
      heading: schema.element.textBlock(),
      paragraph: schema.element.textBlock(),
    },
    id: 'authored-facts-heading-first',
    root: schema.content.prefix(
      [{ element: 'heading' }],
      schema.content.types(['heading', 'paragraph'], {
        default: { type: 'paragraph' },
      })
    ),
    unknown: 'reject',
    version: 1,
  });
  const quote = (
    children: readonly unknown[],
    authored: readonly unknown[] = []
  ) => ({ authored, children, type: 'blockquote' });
  const loaded = (children: readonly Node[]) =>
    editorOf({ children, records: accepted }).read.children();
  const committed = (
    children: readonly Node[],
    write: (tx: EditorUpdateTransaction) => void
  ) => {
    const editor = editorOf({ children, records: accepted });

    editor.update({ tags: ['collaboration'] }, write);

    return editor.read.children();
  };

  it('removes a paragraph whose deletion a verdict accepted', () => {
    assert.deepEqual(loaded([line('keep'), deleted('gone'), line('after')]), [
      line('keep'),
      line('after'),
    ]);
  });

  it('keeps the empty paragraph an accepted deletion of only its text leaves', () => {
    assert.deepEqual(
      loaded([
        line('keep'),
        { children: [{ authored: [carol], text: 'gone' }], type: 'paragraph' },
        line('after'),
      ]),
      [line('keep'), line(''), line('after')]
    );
  });

  it('removes a deleted quote with its lines', () => {
    assert.deepEqual(
      loaded([
        line('keep'),
        {
          authored: [carol],
          children: [deleted('a'), deleted('b')],
          type: 'blockquote',
        },
        line('after'),
      ]),
      [line('keep'), line('after')]
    );
  });

  it('leaves an empty line in a quote whose only line goes', () => {
    assert.deepEqual(
      loaded([
        line('keep'),
        { children: [deleted('gone')], type: 'blockquote' },
        line('after'),
      ]),
      [
        line('keep'),
        { children: [line('')], type: 'blockquote' },
        line('after'),
      ]
    );
  });

  it('leaves an empty line when the only block goes', () => {
    assert.deepEqual(loaded([deleted('gone')]), [line('')]);
  });

  it('removes the paragraphs a peer’s commit brings after their deletion was accepted', () => {
    assert.deepEqual(
      committed([line('keep'), line('after')], (tx) => {
        tx.nodes.insert(deleted('one') as never, { at: [1] });
        tx.nodes.insert(deleted('two') as never, { at: [2] });
      }),
      [line('keep'), line('after')]
    );
  });

  it('leaves an empty line when a peer’s commit leaves only a block whose deletion was accepted', () => {
    assert.deepEqual(
      committed([line('x')], (tx) => {
        tx.nodes.insert(deleted('gone') as never, { at: [1] });
        tx.nodes.remove({ at: [0] });
      }),
      [line('')]
    );
  });

  it('joins a pending join after a removed paragraph into the line before it, as deciding both does', () => {
    const editor = editorOf({
      children: [
        line('keep', 'heading'),
        deleted('gone'),
        { ...line('after'), authored: [{ ...dan, kind: 'join' }] },
      ],
      records: accepted,
    });

    authoredTestApi(editor).decide({ action: 'accept', changes: ['dan:1'] });
    assert.deepEqual(editor.read.children(), [line('keepafter', 'heading')]);
  });

  it('drops another author’s pending split with the paragraph it sits on, as deciding both does', () => {
    const editor = editorOf({
      children: [
        line('keep', 'heading'),
        deleted('gone', [{ ...dan, kind: 'split' }]),
        line('after'),
      ],
      records: accepted,
    });

    authoredTestApi(editor).decide({ action: 'reject', changes: ['dan:1'] });
    assert.deepEqual(editor.read.children(), [
      line('keep', 'heading'),
      line('after'),
    ]);
  });

  it('settles a removed line Editing moved after a pending join as deciding both does', () => {
    assertMatchesDecidingAtOnce(
      [
        line('cd'),
        deleted('ab', [
          {
            at: 1,
            author: 'erin',
            change: '~edit:erin',
            follows: JSON.stringify([dan.change, dan.at]),
            kind: 'insert',
          },
        ]),
        { ...line('ef'), authored: [{ ...dan, kind: 'join' }] },
      ],
      'accept'
    );
  });

  it('keeps the line a pending unwrap of its quote would dissolve', () => {
    assertMatchesDecidingAtOnce(
      [
        line('keep'),
        quote([deleted('gone')], [{ ...dan, kind: 'unwrap' }]),
        line('after'),
      ],
      'accept'
    );
  });

  it('keeps the line of a quote whose own deletion is pending', () => {
    assertMatchesDecidingAtOnce(
      [
        line('keep'),
        quote([deleted('gone')], [{ ...dan, kind: 'delete' }]),
        line('after'),
      ],
      'accept'
    );
  });

  it('keeps the line of a quote whose insertion is pending', () => {
    assertMatchesDecidingAtOnce(
      [
        line('keep'),
        quote([deleted('gone')], [{ ...dan, kind: 'insert' }]),
        line('after'),
      ],
      'reject'
    );
  });

  it('builds the block its root needs to stay at its minimum', () => {
    const Pair = defineEditorSchema('authored-facts-pair', {
      elements: { paragraph: schema.element.textBlock() },
      id: 'authored-facts-pair',
      root: schema.content.types(['paragraph'], {
        default: { type: 'paragraph' },
        min: 2,
      }),
      unknown: 'reject',
      version: 1,
    });
    const children = [line('keep'), deleted('gone')];

    assert.deepEqual(
      editorOf({ children, records: accepted }, Pair).read.children(),
      decided(children, { action: 'accept', changes: ['carol:1'] }, Pair)
    );
  });

  it('builds the title its root’s prefix needs', () => {
    const children = [{ ...deleted('gone'), type: 'title' }, line('x')];

    assert.deepEqual(
      editorOf({ children, records: accepted }, Titled).read.children(),
      decided(children, { action: 'accept', changes: ['carol:1'] }, Titled)
    );
  });

  it('builds a fresh heading in a vacated slot instead of moving the next one up', () => {
    const children = [
      { ...deleted('gone'), type: 'heading' },
      line('x', 'heading'),
      line('p'),
    ];

    assert.deepEqual(
      editorOf({ children, records: accepted }, HeadingFirst).read.children(),
      decided(
        children,
        { action: 'accept', changes: ['carol:1'] },
        HeadingFirst
      )
    );
  });

  it('keeps a heading a pending insertion after it could take the place of', () => {
    const insert = { ...dan, kind: 'insert' };

    assertMatchesDecidingAtOnce(
      [
        { ...deleted('gone'), type: 'heading' },
        {
          authored: [insert],
          children: [{ authored: [insert], text: 'new' }],
          type: 'heading',
        },
        line('p'),
      ],
      'reject',
      HeadingFirst
    );
  });

  it('lets a heading whose insertion was accepted take the place of a removed heading before it, as deciding both does', () => {
    const insert = { ...dan, kind: 'insert' };
    const children = [
      { ...deleted('gone'), type: 'heading' },
      {
        authored: [insert],
        children: [{ authored: [insert], text: 'new' }],
        type: 'heading',
      },
      line('p'),
    ];
    const both = reviewRecords({
      verdicts: [
        {
          decision: 'd:1',
          member: { at: carol.at, change: carol.change },
          verdict: 'accept',
        },
        {
          decision: 'd:2',
          member: { at: dan.at, change: dan.change },
          verdict: 'accept',
        },
      ],
    });

    assert.deepEqual(
      editorOf({ children, records: both }, HeadingFirst).read.children(),
      decided(
        children,
        { action: 'accept', changes: ['carol:1', 'dan:1'] },
        HeadingFirst
      )
    );
  });

  it('keeps a title whose rebuild waits on a pending join after it', () => {
    assertMatchesDecidingAtOnce(
      [
        { ...deleted('gone'), type: 'title' },
        { ...line('x'), authored: [{ ...dan, kind: 'join' }] },
      ],
      'accept',
      Titled
    );
  });

  it('keeps the emptied line when the root’s default is a list no removed line becomes', () => {
    const Listed = defineEditorSchema('authored-facts-listed', {
      elements: {
        list: { content: schema.content.type('paragraph', { min: 1 }) },
        paragraph: schema.element.textBlock(),
      },
      id: 'authored-facts-listed',
      root: schema.content.any(
        ['list', 'paragraph'].map((type) => schema.content.type(type)),
        { default: { type: 'list' }, min: 1 }
      ),
      unknown: 'reject',
      version: 1,
    });

    assert.deepEqual(
      editorOf(
        { children: [deleted('gone')], records: accepted },
        Listed
      ).read.children(),
      [{ ...deleted(''), children: [{ text: '' }] }]
    );
  });

  it('makes the only removed quote the line that completes the root', () => {
    assert.deepEqual(loaded([quote([deleted('gone')], [carol])]), [line('')]);
  });

  it('makes each of two removed blocks one of the two its root needs', () => {
    const TitledLine = defineEditorSchema('authored-facts-titled-line', {
      elements: {
        paragraph: schema.element.textBlock(),
        title: schema.element.textBlock(),
      },
      id: 'authored-facts-titled-line',
      root: schema.content.prefix(
        [{ element: 'title' }],
        schema.content.types(['paragraph'], {
          default: { type: 'paragraph' },
          min: 1,
        })
      ),
      unknown: 'reject',
      version: 1,
    });

    assert.deepEqual(
      editorOf(
        {
          children: [{ ...deleted('one'), type: 'title' }, deleted('two')],
          records: accepted,
        },
        TitledLine
      ).read.children(),
      [line('', 'title'), line('')]
    );
  });

  it('settles a block after one a peer’s commit removes', () => {
    assert.deepEqual(
      committed([line('keep'), line('after')], (tx) => {
        tx.nodes.insert(deleted('one') as never, { at: [1] });
        tx.nodes.insert({ authored: [carol], text: 'x' } as never, {
          at: [2, 0],
        });
      }),
      [line('keep'), line('after')]
    );
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

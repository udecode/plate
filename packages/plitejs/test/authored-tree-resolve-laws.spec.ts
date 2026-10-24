import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import fc from 'fast-check';
import {
  createEditor,
  definePlugin,
  defineEditorSchema,
  property,
  schema as schemaBuilder,
  target,
} from 'plitejs';

import { createAuthoredPlugin } from '../src/authored/authored';
import { expandContexts } from '../src/authored/facts/compact';
import type { LandedRecord } from '../src/authored/facts/records';
import type { AuthoredMark } from '../src/authored/tree/marks';
import type { AuthoredOutcome } from '../src/authored/tree/resolve';
import type { JsonNode } from '../src/core/change/tokens';
import { authoredTestApi } from './support/authored';
import {
  all,
  type Block2,
  LANDED,
  linksToPresentTags,
  quotesEditor,
  quotesSchema,
  resolveWithVerdicts,
  schema,
  settleAsAdmission,
  spread,
  type Verdict,
  withCuts,
  withMarksOf,
  writesOf,
} from './support/authored-laws';

type Leaf = { authored?: AuthoredMark[]; bold?: boolean; text: string };
type Block = { authored?: AuthoredMark[]; children: Leaf[]; type: 'paragraph' };

const CHANGES = ['c0', 'c1', 'c2', 'c3', 'c4', 'c5'];
const mark = (kind: AuthoredMark['kind'], change: string): AuthoredMark => {
  if (kind === 'format') {
    return {
      at: 1,
      author: change,
      change,
      id: `t-${change}`,
      key: 'bold',
      kind,
      write: { kind: 'set', value: true },
    };
  }
  if (kind === 'insert' || kind === 'split') {
    return { at: 1, author: change, change, kind };
  }

  return { at: 1, author: change, change, kind };
};

/**
 * Up to three linked tags on one key, as recording writes them: stacks, forks
 * written from one point, and a change written again on top. A tag's change
 * never also inserted or deleted the node it sits on.
 */
const tagsArbitrary = (
  key: string,
  changes: readonly string[],
  values: readonly unknown[],
  excluded: readonly string[] = []
) => {
  const write = (index: number) =>
    index < values.length
      ? { kind: 'set' as const, value: values[index] as never }
      : { kind: 'remove' as const };
  const pick = fc.nat({ max: values.length });

  return fc
    .array(
      fc.record({
        base: pick,
        before: pick,
        change: fc.constantFrom(...changes),
        gone: fc.constantFrom(null, 'g', 'l'),
        over: fc.array(fc.boolean(), { maxLength: 3, minLength: 3 }),
        write: pick,
      }),
      { maxLength: 3 }
    )
    .map((rows) =>
      rows.flatMap((row, index): AuthoredMark[] => {
        if (excluded.includes(row.change)) return [];
        const over = [
          ...(row.gone === null
            ? []
            : [[{ id: `${key}${row.gone}`, write: write(row.base) }]]),
          ...rows.slice(0, index).flatMap((earlier, at) =>
            row.over[at]
              ? [
                  [
                    {
                      id: `${key}${at}${earlier.change}`,
                      write: write(earlier.write),
                    },
                  ],
                ]
              : []
          ),
        ];

        return [
          {
            at: 1,
            author: row.change,
            change: row.change,
            id: `${key}${index}${row.change}`,
            key,
            kind: 'format',
            write: write(row.write),
            ...(row.before < values.length
              ? { before: values[row.before] as never }
              : {}),
            ...(over.length > 0 ? { base: write(row.base), over } : {}),
          },
        ];
      })
    )
    .map(linksToPresentTags);
};

// One leaf carries at most one mark of each change and at most one format
// mark, as recording produces; boundary marks sit only on non-first blocks.
const leafArbitrary = fc
  .record({
    bold: fc.boolean(),
    deletes: fc.subarray(CHANGES, { maxLength: 2 }),
    inserts: fc.subarray(CHANGES, { maxLength: 2 }),
    text: fc.constantFrom('a', 'b', 'cd', 'e'),
  })
  .chain((leaf) =>
    tagsArbitrary(
      'bold',
      CHANGES,
      [true],
      [...leaf.inserts, ...leaf.deletes]
    ).map((tags) => ({ ...leaf, tags }))
  )
  .map(({ bold, deletes, inserts, tags, text }): Leaf => {
    const usedByInsert = new Set(inserts);
    const marks = [
      ...inserts.map((change) => mark('insert', change)),
      ...deletes
        .filter((change) => !usedByInsert.has(change))
        .map((change) => mark('delete', change)),
      ...tags,
    ];

    return {
      ...(marks.length > 0 ? { authored: marks } : {}),
      ...(tags.length > 0 && bold ? { bold: true } : {}),
      text,
    };
  });

const blockArbitrary = (first: boolean) =>
  fc
    .record({
      boundary: first
        ? fc.constant(undefined)
        : fc.option(
            fc.record({
              change: fc.constantFrom(...CHANGES),
              kind: fc.constantFrom('split' as const, 'join' as const),
            }),
            { nil: undefined }
          ),
      content: fc.option(
        fc.record({
          change: fc.constantFrom(...CHANGES),
          kind: fc.constantFrom('insert' as const, 'delete' as const),
        }),
        { nil: undefined }
      ),
      leaves: fc.array(leafArbitrary, { maxLength: 3, minLength: 1 }),
    })
    .map(({ boundary, content, leaves }): Block => ({
      ...(boundary || content
        ? {
            authored: [
              ...(boundary ? [mark(boundary.kind, boundary.change)] : []),
              ...(content && content.change !== boundary?.change
                ? [mark(content.kind, content.change)]
                : []),
            ],
          }
        : {}),
      children:
        content && content.change !== boundary?.change
          ? leaves.map((leaf) =>
              spread(leaf, mark(content.kind, content.change))
            )
          : leaves,
      type: 'paragraph',
    }));

const documentArbitrary = fc
  .integer({ max: 3, min: 1 })
  .chain((count) =>
    fc.tuple(
      blockArbitrary(true),
      ...Array.from({ length: count - 1 }, () => blockArbitrary(false))
    )
  );

const decisionsArbitrary = fc
  .shuffledSubarray(CHANGES, { maxLength: 6, minLength: 1 })
  .chain((order) =>
    fc.tuple(
      fc.constant(order),
      fc.array(fc.constantFrom('accept' as const, 'reject' as const), {
        maxLength: order.length,
        minLength: order.length,
      })
    )
  );

describe('authored review tree decision laws', () => {
  it('gives the same content for every admissible order of the same decisions', () => {
    let compared = 0;

    fc.assert(
      fc.property(
        documentArbitrary,
        decisionsArbitrary,
        (document, [order, actions]) => {
          const decisions = new Map(
            order.map((change, index) => [change, actions[index]])
          );
          const decidedAtOnce = resolveWithVerdicts(
            new Map(),
            document,
            all(decisions)
          );
          const decided = new Map<string, Verdict>();
          let landed: readonly LandedRecord[] = LANDED;
          let stepped: readonly unknown[] = document;
          let waiting: string[] = [];

          if (decidedAtOnce.blockers.length > 0) return;
          const atOnce = settleAsAdmission(decisions, decidedAtOnce, LANDED);
          // A decision that waits joins the next one.
          for (const change of order) {
            waiting = waiting.concat(change);
            const batch = new Map(
              waiting.map((item) => [item, decisions.get(item)!])
            );
            const step = resolveWithVerdicts(
              decided,
              stepped as Block[],
              all(batch),
              schema,
              landed
            );

            if (step.blockers.length > 0) continue;
            for (const [item, verdict] of batch) decided.set(item, verdict);
            ({ children: stepped, landed } = settleAsAdmission(
              decided,
              step,
              landed
            ));
            waiting = [];
          }

          compared += 1;
          assert.deepEqual(
            { children: stepped, landed: writesOf(landed, stepped), waiting },
            {
              children: atOnce.children,
              landed: writesOf(atOnce.landed, atOnce.children),
              waiting: [],
            }
          );
        }
      ),
      { numRuns: 1000 }
    );
    assert.ok(compared > 300, `only ${compared} admissible orders compared`);
  });

  it('accepting every change at once equals accepting admissible batches in turn', () => {
    fc.assert(
      fc.property(
        documentArbitrary,
        fc.shuffledSubarray(CHANGES, { minLength: 6 }),
        (document, order) => {
          const accepted = settleAsAdmission(
            new Map(order.map((change) => [change, 'accept' as const])),
            resolveWithVerdicts(new Map(), document, () => 'accept'),
            LANDED
          );
          const decided = new Map<string, Verdict>();
          let landed: readonly LandedRecord[] = LANDED;
          let stepped: readonly unknown[] = document;
          const remaining = [...order];
          const acceptIn =
            (batch: ReadonlySet<string>): AuthoredOutcome =>
            (id) =>
              batch.has(id) ? 'accept' : 'keep';

          while (remaining.length > 0) {
            // A blocked step grows into a batch with the changes it waits for.
            const batch = new Set([remaining.shift()!]);
            const stepOf = () =>
              resolveWithVerdicts(
                decided,
                stepped as Block[],
                acceptIn(batch),
                schema,
                landed
              );
            let step = stepOf();

            while (step.blockers.some((change) => !batch.has(change))) {
              for (const change of step.blockers) batch.add(change);
              step = stepOf();
            }
            for (const change of batch) {
              const at = remaining.indexOf(change);

              if (at !== -1) remaining.splice(at, 1);
              decided.set(change, 'accept');
            }
            ({ children: stepped, landed } = settleAsAdmission(
              decided,
              step,
              landed
            ));
          }

          assert.deepEqual(
            { children: stepped, landed: writesOf(landed, stepped) },
            {
              children: accepted.children,
              landed: writesOf(accepted.landed, accepted.children),
            }
          );
        }
      ),
      { numRuns: 300 }
    );
  });

  it('decides two chained format changes on one key to one value in every admissible order', () => {
    // Alice bolds, then Bob unbolds on top of Alice's tag.
    const leaf = {
      authored: [
        {
          at: 1,
          author: 'alice:1',
          change: 'alice:1',
          id: 'ta',
          key: 'bold',
          kind: 'format' as const,
          write: { kind: 'set' as const, value: true },
        },
        {
          at: 1,
          author: 'bob:1',
          before: true,
          change: 'bob:1',
          id: 'tb',
          key: 'bold',
          kind: 'format' as const,
          write: { kind: 'remove' as const },
          base: { kind: 'remove' as const },
          over: [[{ id: 'ta', write: { kind: 'set' as const, value: true } }]],
        },
      ],
      text: 'a',
    };

    const verdictKeepingEditor = () =>
      createEditor({
        initialValue: [{ children: [leaf], type: 'paragraph' }] as never,
        plugins: [createAuthoredPlugin({ authorId: 'laws' })],
      });

    for (const first of ['accept', 'reject'] as const) {
      for (const second of ['accept', 'reject'] as const) {
        const decisions = new Map([
          ['alice:1', first],
          ['bob:1', second],
        ]);
        const decide = (
          editor: ReturnType<typeof verdictKeepingEditor>,
          changes: readonly string[]
        ) =>
          authoredTestApi(editor).decide(
            changes.map((change) => ({
              action: decisions.get(change)!,
              changes: [change],
            }))
          );
        const once = verdictKeepingEditor();

        decide(once, ['alice:1', 'bob:1']);

        // A decision that waits joins the next one, so every order is tried
        // as the admissible steps it allows.
        for (const order of [
          ['alice:1', 'bob:1'],
          ['bob:1', 'alice:1'],
        ]) {
          const editor = verdictKeepingEditor();
          let waiting: string[] = [];

          for (const change of order) {
            waiting = waiting.concat(change);
            if (decide(editor, waiting).status === 'blocked') continue;
            waiting = [];
          }
          assert.deepEqual(
            [waiting, editor.read.children()],
            [[], once.read.children()],
            `${first}/${second} in order ${order}`
          );
        }
      }
    }
  });
});

const STRUCTURAL = ['s0', 's1', 's2', 's3'];
const optionalMark = (kinds: ReadonlyArray<AuthoredMark['kind']>) =>
  fc.option(
    fc.record({
      change: fc.constantFrom(...STRUCTURAL),
      kind: fc.constantFrom(...kinds),
    }),
    { nil: undefined }
  );
const structuralParagraph = (first: boolean) =>
  fc
    .record({
      boundary: first
        ? fc.constant(undefined)
        : optionalMark(['join', 'split']),
      content: optionalMark(['delete', 'insert']),
      leaf: optionalMark(['delete', 'insert']),
      text: fc.constantFrom('a', 'b', 'cd'),
    })
    .map(({ boundary, content, leaf, text }) =>
      withMarksOf(
        {
          type: 'paragraph',
          children: [withMarksOf({ text }, [leaf])],
        },
        [boundary, content]
      )
    );
const structuralBlock = (first: boolean) =>
  fc.oneof(
    structuralParagraph(first),
    fc
      .record({
        boundary: first
          ? fc.constant(undefined)
          : optionalMark(['join', 'split']),
        children: fc
          .integer({ max: 2, min: 1 })
          .chain((count) =>
            fc.tuple(
              structuralParagraph(true),
              ...Array.from({ length: count - 1 }, () =>
                structuralParagraph(false)
              )
            )
          ),
        align: fc.boolean(),
        content: optionalMark(['delete', 'insert']),
        enclosure: optionalMark(['unwrap', 'wrap']),
        tags: tagsArbitrary('align', STRUCTURAL, ['center', 'right']),
      })
      .map(({ align, boundary, children, content, enclosure, tags }) => {
        const quote: { authored?: AuthoredMark[] } & Record<string, unknown> =
          withMarksOf({ type: 'quote', children }, [
            boundary,
            content,
            enclosure,
          ]);

        const own = new Set(
          (quote.authored ?? [])
            .filter((item) => item.kind === 'insert')
            .map((item) => item.change)
        );
        const written = linksToPresentTags(
          tags.filter((tag) => !own.has(tag.change))
        );

        if (written.length === 0) return quote;

        return {
          ...quote,
          ...(align ? { align: 'center' } : {}),
          authored: [...(quote.authored ?? []), ...written],
        };
      })
  );
const structuralDocument = fc
  .integer({ max: 3, min: 1 })
  .chain((count) =>
    fc.tuple(
      structuralBlock(true),
      ...Array.from({ length: count - 1 }, () => structuralBlock(false))
    )
  )
  .chain((blocks) =>
    fc
      .array(fc.boolean(), {
        maxLength: blocks.length,
        minLength: blocks.length,
      })
      .map((flags) => withCuts(blocks as readonly Block2[], flags))
  );
const structuralDecisions = fc
  .shuffledSubarray(STRUCTURAL, { maxLength: 4, minLength: 1 })
  .chain((order) =>
    fc.tuple(
      fc.constant(order),
      fc.array(fc.constantFrom('accept' as const, 'reject' as const), {
        maxLength: order.length,
        minLength: order.length,
      })
    )
  );

describe('authored review tree structural decision laws', () => {
  it('gives the same document for every admissible order of structural, enclosure and content decisions', () => {
    let compared = 0;

    fc.assert(
      fc.property(
        structuralDocument,
        structuralDecisions,
        (generated, [order, actions]) => {
          let document: readonly JsonNode[];

          try {
            document = expandContexts(
              quotesEditor(generated).read.value()
            ).children;
          } catch {
            return;
          }

          const decisions = new Map(
            order.map((change, index) => [change, actions[index]])
          );
          const decidedAtOnce = resolveWithVerdicts(
            new Map(),
            document,
            all(decisions),
            quotesSchema
          );
          const decided = new Map<string, Verdict>();
          let landed: readonly LandedRecord[] = LANDED;
          let stepped = document;

          if (decidedAtOnce.blockers.length > 0 || decidedAtOnce.unplaceable) {
            return;
          }
          const atOnce = settleAsAdmission(
            decisions,
            decidedAtOnce,
            LANDED,
            quotesSchema
          );

          for (const change of order) {
            const verdict = decisions.get(change)!;
            const step = resolveWithVerdicts(
              decided,
              stepped,
              all(new Map([[change, verdict]])),
              quotesSchema,
              landed
            );

            if (step.blockers.length > 0 || step.unplaceable) return;
            decided.set(change, verdict);
            ({ children: stepped, landed } = settleAsAdmission(
              decided,
              step,
              landed,
              quotesSchema
            ));
          }

          compared += 1;
          assert.deepEqual(
            { children: stepped, landed: writesOf(landed, stepped) },
            {
              children: atOnce.children,
              landed: writesOf(atOnce.landed, atOnce.children),
            }
          );
        }
      ),
      {
        examples: [
          // A rejected split inside a quote whose unwrap is pending lands
          // beyond the quote only once the unwrap is accepted.
          [
            [
              {
                type: 'quote',
                children: [{ type: 'paragraph', children: [{ text: 'a' }] }],
              },
              {
                type: 'quote',
                authored: [mark('unwrap', 's3')],
                children: [
                  spread(
                    { type: 'paragraph', children: [{ text: 'a' }] },
                    mark('insert', 's0')
                  ),
                  {
                    type: 'paragraph',
                    authored: [mark('split', 's0')],
                    children: [{ text: 'a' }],
                  },
                ],
              },
            ] as never,
            [
              ['s2', 's1', 's0', 's3'],
              ['accept', 'accept', 'reject', 'accept'],
            ] as never,
          ],
        ],
        numRuns: 150,
      }
    );
    assert.ok(compared > 22, `only ${compared} admissible orders compared`);
  });
});

// S5 of docs/plans/2026-10-10-authored-values.md: decisions through the public
// `decide` on an editor whose correction derives values from children.
const Sizes = defineEditorSchema('laws-sizes', {
  elements: {
    cell: { content: schemaBuilder.content.text() },
    group: { content: schemaBuilder.content.type('cell', { min: 1 }) },
  },
  id: 'laws-sizes',
  properties: [
    schemaBuilder.elementProperty('size', property.number(), {
      target: target.type('cell'),
    }),
  ],
  root: schemaBuilder.content.type('group', { min: 1 }),
  unknown: 'reject',
  version: 1,
});

type Cell = {
  authored?: unknown;
  children: ReadonlyArray<{ text: string }>;
  size?: number;
};

const round = (value: number) => Math.round(value * 1e4) / 1e4;

// Resizes a group's content cells to sum to 100, scaling an over-full group
// and spreading a deficit, as the column plugin does.
const SumTo100 = definePlugin('laws-sum-to-100', {
  corrections: [
    {
      event: 'content',
      query: { type: 'group' },
      correct({ entry: [node, path], tx }) {
        const cells = (
          (node as { children: readonly Cell[] }).children ?? []
        ).flatMap((cell, index) =>
          tx.nodes.isContent(cell as never)
            ? [{ index, size: cell.size ?? 0 }]
            : []
        );
        const sum = cells.reduce((total, cell) => total + cell.size, 0);

        if (cells.length === 0 || Math.abs(sum - 100) < 1e-3) return;
        for (const { index, size } of cells) {
          tx.nodes.set(
            {
              size: round(
                sum > 100
                  ? (size * 100) / sum
                  : size + (100 - sum) / cells.length
              ),
            } as never,
            { at: [...path, index] }
          );
        }
      },
    },
  ],
});

const sizesEditor = (value: unknown) =>
  createEditor({
    initialValue: value as never,
    plugins: [
      Sizes,
      SumTo100,
      createAuthoredPlugin({ authorId: 'x', intent: 'edit', now: () => 1 }),
    ],
  });

type SizeOp =
  | { kind: 'insert'; at: number }
  | { kind: 'remove'; at: number }
  | { kind: 'preset'; sizes: number[] }
  | { kind: 'type' }
  | { kind: 'editInsert' };

const sizeOpArbitrary: fc.Arbitrary<SizeOp> = fc.oneof(
  fc.record({ at: fc.nat({ max: 3 }), kind: fc.constant('insert' as const) }),
  fc.record({ at: fc.nat({ max: 3 }), kind: fc.constant('remove' as const) }),
  fc.record({
    kind: fc.constant('preset' as const),
    sizes: fc.array(fc.constantFrom(10, 20, 30, 40, 50, 60), {
      maxLength: 4,
      minLength: 4,
    }),
  }),
  fc.constant({ kind: 'type' as const }),
  fc.constant({ kind: 'editInsert' as const })
);

const cell = (text: string, size: number) => ({
  children: [{ text }],
  size,
  type: 'cell',
});

/** Records `ops`: suggestions under their own change ids, the rest in Editing. */
const sizeHistory = (ops: readonly SizeOp[]) => {
  const editor = sizesEditor([
    { children: [cell('a', 30), cell('b', 70)], type: 'group' },
  ]);
  const proof = authoredTestApi(editor);
  const live = () =>
    (
      editor.read.value().children[0] as { children: readonly Cell[] }
    ).children.flatMap((item, index) =>
      editor.read.nodes.isContent(item as never) ? [index] : []
    );

  ops.forEach((op, step) => {
    const change = `c${step}`;
    const indexes = live();

    if (op.kind === 'type') {
      editor.update((tx) =>
        tx.text.insert('z', { at: { offset: 0, path: [0, indexes[0], 0] } })
      );
    } else if (op.kind === 'editInsert') {
      editor.update((tx) =>
        tx.nodes.insert(cell('e', 50) as never, { at: [0, 0] })
      );
    } else {
      proof.propose(change, (tx) => {
        if (op.kind === 'insert') {
          tx.nodes.insert(cell('n', 50), {
            at: [0, Math.min(op.at, indexes.length)],
          });
        } else if (op.kind === 'remove') {
          if (indexes.length > 1) {
            tx.nodes.remove({ at: [0, indexes[op.at % indexes.length]] });
          }
        } else {
          indexes.forEach((index, at) => {
            tx.nodes.set(
              { size: op.sizes[at % op.sizes.length] },
              {
                at: [0, index],
              }
            );
          });
        }
      });
    }
  });

  return editor.read.value().children;
};

/**
 * A document's structure, texts and review marks with each size masked, and
 * each group's live sizes summed: a correction inside a decision writes live
 * sizes from what that decision leaves, so the numbers can depend on the
 * order, while every order keeps the same structure and tags and the plugin's
 * sum (a named limit).
 */
const sizesOutcome = (editor: ReturnType<typeof sizesEditor>) => {
  const children = editor.read.value().children as ReadonlyArray<{
    children: readonly Cell[];
  }>;

  return {
    masked: children.map((group) => ({
      ...group,
      children: group.children.map(({ size: _size, ...rest }) => rest),
    })),
    // A group whose every cell is pending deletion has nothing to sum.
    sums: children.flatMap((group) => {
      const content = group.children.filter((item) =>
        editor.read.nodes.isContent(item as never)
      );

      return content.length === 0
        ? []
        : [
            Math.round(
              content.reduce((total, item) => total + (item.size ?? 0), 0)
            ),
          ];
    }),
  };
};

const pendingIn = (nodes: readonly unknown[]): string[] => [
  ...new Set(
    (
      nodes as Array<{
        authored?: Array<{ change: string }>;
        children?: unknown[];
      }>
    ).flatMap((node) => [
      ...(node.authored ?? []).map((item) => item.change),
      ...pendingIn(node.children ?? []),
    ])
  ),
];

describe('authored review tree decision laws with corrections', () => {
  it('gives the batch structure and tags, with sizes summing to 100, for every admissible partition of decisions', () => {
    let compared = 0;

    fc.assert(
      fc.property(
        fc.array(sizeOpArbitrary, { maxLength: 5, minLength: 1 }),
        fc.infiniteStream(fc.boolean()),
        fc.infiniteStream(fc.nat({ max: 1000 })),
        (ops, coins, shuffle) => {
          const value = sizeHistory(ops);
          const changes = pendingIn(value);

          if (changes.length === 0) return;

          const actions = new Map(
            changes.map((change) => [
              change,
              coins.next().value ? ('accept' as const) : ('reject' as const),
            ])
          );
          const decisionsOf = (picked: readonly string[]) =>
            (['accept', 'reject'] as const).flatMap((action) => {
              const of = picked.filter(
                (change) => actions.get(change) === action
              );

              return of.length > 0 ? [{ action, changes: of }] : [];
            });
          const batchEditor = sizesEditor(value);
          const batchResult = authoredTestApi(batchEditor).decide(
            decisionsOf(changes)
          );

          if (batchResult.status !== 'applied') return;

          const order = [...changes].sort(() => shuffle.next().value - 500);
          const stepped = sizesEditor(value);
          let waiting: string[] = [];

          for (const change of order) {
            waiting = waiting.concat(change);
            const result = authoredTestApi(stepped).decide(
              decisionsOf(waiting)
            );

            if (result.status === 'blocked') continue;
            waiting = [];
            // Each decision leaves the proposed view whole: the cells that
            // stay sum to 100 while other changes are still pending.
            assert.deepEqual(
              sizesOutcome(stepped).sums,
              sizesOutcome(stepped).sums.map(() => 100),
              `after deciding ${change}`
            );
          }

          const batch = sizesOutcome(batchEditor);

          compared += 1;
          assert.deepEqual(
            { ...sizesOutcome(stepped), waiting },
            { ...batch, sums: batch.sums.map(() => 100), waiting: [] },
            `order ${order.join(',')} with ${JSON.stringify([...actions])}`
          );
        }
      ),
      { numRuns: 30 }
    );
    assert.ok(compared > 15, `only ${compared} histories compared`);
  });
});

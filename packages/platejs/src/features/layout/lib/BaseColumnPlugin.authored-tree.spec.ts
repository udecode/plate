import { createAuthoredPlugin } from 'plitejs/authored';

import { authoredTestApi } from '../../../authored/__tests__/authoredTestApi';
import { BaseParagraphPlugin, createEditor } from '../../../core';
import {
  BaseColumnItemPlugin,
  BaseColumnPlugin,
  type ColumnElement,
} from './BaseColumnPlugin';

// S2 of docs/plans/2026-10-10-authored-values.md: the column plugin's
// corrections, commands and drops skip a column a pending suggestion deletes.

type Node = {
  authored?: ReadonlyArray<{ change: string }>;
  children?: readonly Node[];
};

const paragraph = (text: string) => ({
  children: [{ text }],
  type: 'paragraph',
});
const group = (...widths: number[]) => ({
  children: widths.map((width, index) => ({
    children: [paragraph(String.fromCharCode(97 + index))],
    type: 'column',
    width: `${width}%`,
  })),
  type: 'columnGroup',
});

const make = (initialValue: unknown[], intent: 'edit' | 'propose' = 'edit') => {
  const proof = createAuthoredPlugin({
    authorId: 'alice',
    createChangeId: () => 'alice:1',
    intent,
    now: () => 1,
  });
  const editor = createEditor({
    initialValue: initialValue as never,
    plugins: [
      BaseParagraphPlugin,
      BaseColumnItemPlugin,
      BaseColumnPlugin,
      proof,
    ],
  });

  return { editor, proof: authoredTestApi(editor) };
};

type Editor = ReturnType<typeof make>['editor'];

const widths = (editor: Editor) =>
  editor.read
    .children()[0]
    .children.map((column) =>
      Number(Number.parseFloat((column as ColumnElement).width).toFixed(2))
    );

const pending = (nodes: readonly Node[]): string[] => [
  ...new Set(
    nodes.flatMap((node) => [
      ...(node.authored ?? []).map((mark) => mark.change),
      ...pending(node.children ?? []),
    ])
  ),
];

const typeInFirstColumn = (editor: Editor, column: number) =>
  editor.update((tx) =>
    tx.text.insert('z', { at: { offset: 1, path: [0, column, 0, 0] } })
  );

describe('columns beside a pending column deletion', () => {
  for (const struck of [0, 1, 2]) {
    const kept = [0, 1, 2].find((index) => index !== struck)!;
    const suggest = () => {
      const run = make([group(20, 30, 50)]);

      run.proof.propose('bob:1', (tx) => tx.nodes.remove({ at: [0, struck] }));
      run.proof.propose('alice:1', (tx) =>
        tx.columnGroup.setColumns({ at: [0], widths: ['30%', '70%'] })
      );

      return run;
    };

    it(`restores the start when column ${struck} is struck and the preset over it is rejected`, () => {
      const batch = suggest();
      const ordered = suggest();
      const typed = suggest();

      batch.proof.decide({ action: 'reject', changes: ['alice:1', 'bob:1'] });
      ordered.proof.decide({ action: 'reject', changes: ['alice:1'] });
      ordered.proof.decide({ action: 'reject', changes: ['bob:1'] });
      typeInFirstColumn(typed.editor, kept);
      const whileTyping = widths(typed.editor);

      typed.proof.decide({ action: 'reject', changes: ['alice:1', 'bob:1'] });

      expect({
        batch: widths(batch.editor),
        ordered: widths(ordered.editor),
        typed: widths(typed.editor),
        whileTyping,
      }).toEqual({
        batch: [20, 30, 50],
        ordered: [20, 30, 50],
        typed: [20, 30, 50],
        whileTyping: [
          ...[30, 70].slice(0, struck),
          [20, 30, 50][struck],
          ...[30, 70].slice(struck),
        ],
      });
    });

    // A preset over a struck last column already lands on the kept columns.
    if (struck === 2) continue;

    it(`accepts what Editing gives when column ${struck} is struck under a preset`, () => {
      const review = suggest();
      const editing = make([group(20, 30, 50)]);

      review.proof.decide({
        action: 'accept',
        changes: pending(
          review.editor.read.value().children as readonly Node[]
        ),
      });
      editing.editor.update((tx) => tx.nodes.remove({ at: [0, struck] }));
      editing.editor.update((tx) =>
        tx.columnGroup.setColumns({ at: [0], widths: ['30%', '70%'] })
      );

      expect(widths(review.editor)).toEqual(widths(editing.editor));
    });
  }

  it('keeps a suggested shrink and the struck column width while Editing types', () => {
    const run = make([group(20, 30, 50)], 'propose');

    run.editor.update((tx) =>
      tx.columnGroup.setColumns({ at: [0], widths: ['30%', '70%'] })
    );
    run.proof.setIntent('edit');
    typeInFirstColumn(run.editor, 0);
    const whileTyping = widths(run.editor);

    run.proof.decide({ action: 'reject', changes: ['alice:1'] });

    expect({ rejected: widths(run.editor), whileTyping }).toEqual({
      rejected: [20, 30, 50],
      whileTyping: [30, 70, 50],
    });
  });

  it('sizes and limits a drop beside a column by the columns that stay', () => {
    const drop = (initialValue: unknown[], struck: number | null) => {
      const run = make([...initialValue, paragraph('dragged')]);

      if (struck !== null) {
        run.proof.propose('bob:1', (tx) =>
          tx.nodes.remove({ at: [0, struck] })
        );
      }
      const result = run.editor.api.transfer.move({
        nodes: [run.editor.key([1])!],
        to: { key: run.editor.key([0, 0, 0])!, side: 'end' },
      });

      if (struck !== null) {
        run.proof.decide({
          action: 'accept',
          changes: pending(run.editor.read.value().children as readonly Node[]),
        });
      }

      return { status: result.status, widths: widths(run.editor) };
    };
    const editing = make([group(20, 30, 50), paragraph('dragged')]);

    editing.editor.update((tx) => tx.nodes.remove({ at: [0, 2] }));
    editing.editor.api.transfer.move({
      nodes: [editing.editor.key([1])!],
      to: { key: editing.editor.key([0, 0, 0])!, side: 'end' },
    });

    expect({
      full: drop([group(20, 20, 20, 20, 20)], 4).status,
      sized: drop([group(20, 30, 50)], 2),
    }).toEqual({
      full: 'moved',
      sized: { status: 'moved', widths: widths(editing.editor) },
    });
  });
});

// S3 of docs/plans/2026-10-10-authored-values.md: stacked width suggestions
// decide from the top down, the bottom up or together.
type Decision = { action: 'accept' | 'reject'; changes: string[] };

const permutations = <T>(items: readonly T[]): T[][] =>
  items.length <= 1
    ? [[...items]]
    : items.flatMap((item, index) =>
        permutations([...items.slice(0, index), ...items.slice(index + 1)]).map(
          (rest) => [item, ...rest]
        )
      );

/**
 * Decides `actions` one change at a time in every order, carrying a change
 * that waits into the next step, and returns each order's widths beside the
 * batch's.
 */
const everyOrder = (
  setup: () => ReturnType<typeof make>,
  actions: Readonly<Record<string, Decision['action']>>
) => {
  const batch = setup();
  const decisions = (changes: readonly string[]) =>
    (['accept', 'reject'] as const).flatMap((action) => {
      const picked = changes.filter((change) => actions[change] === action);

      return picked.length > 0 ? [{ action, changes: picked }] : [];
    });

  batch.proof.decide(decisions(Object.keys(actions)));

  return {
    batch: widths(batch.editor),
    orders: permutations(Object.keys(actions)).map((order) => {
      const run = setup();
      let waiting: string[] = [];

      for (const change of order) {
        waiting = waiting.concat(change);
        if (run.proof.decide(decisions(waiting)).status !== 'blocked') {
          waiting = [];
        }
      }

      return { order, waiting, widths: widths(run.editor) };
    }),
  };
};

describe('stacked width suggestions', () => {
  it('gives Editing widths when a suggestion under an Editing correction is rejected', () => {
    const editing = make([group(20, 30, 50)]);
    const run = make([group(20, 30, 50)]);

    editing.editor.update((tx) => tx.nodes.remove({ at: [0, 2] }));
    run.proof.propose('alice:1', (tx) => tx.column.insert({}, { at: [0, 3] }));
    run.editor.update((tx) => tx.nodes.remove({ at: [0, 2] }));
    run.proof.decide({ action: 'reject', changes: ['alice:1'] });

    expect(widths(run.editor)).toEqual(widths(editing.editor));
  });

  it('decides two pending column inserts newest first or together, and the older one waits', () => {
    const setup = () => {
      const run = make([group(30, 70)]);

      run.proof.propose('alice:1', (tx) =>
        tx.column.insert({}, { at: [0, 2] })
      );
      run.proof.propose('bob:1', (tx) => tx.column.insert({}, { at: [0, 1] }));
      typeInFirstColumn(run.editor, 0);

      return run;
    };
    const { batch, orders } = everyOrder(setup, {
      'alice:1': 'reject',
      'bob:1': 'reject',
    });

    expect({
      aliceAlone: setup().proof.decide({
        action: 'reject',
        changes: ['alice:1'],
      }),
      batch,
      orders: orders.map(({ waiting, widths: result }) => ({
        result,
        waiting,
      })),
    }).toEqual({
      aliceAlone: { ids: ['alice:1'], status: 'blocked', with: ['bob:1'] },
      batch: [30, 70],
      orders: [
        { result: [30, 70], waiting: [] },
        { result: [30, 70], waiting: [] },
      ],
    });
  });

  it('waits to accept a preset over a pending deletion and insertion, and gives one result in every order', () => {
    const setup = () => {
      const run = make([group(20, 30, 50)]);

      run.proof.propose('bob:1', (tx) => tx.nodes.remove({ at: [0, 2] }));
      run.proof.propose('carol:1', (tx) =>
        tx.column.insert({}, { at: [0, 0] })
      );
      run.proof.propose('alice:1', (tx) =>
        tx.columnGroup.setColumns({ at: [0], widths: ['25%', '25%', '50%'] })
      );

      return run;
    };
    const alone = setup().proof.decide({
      action: 'accept',
      changes: ['alice:1'],
    });
    const results = (['accept', 'reject'] as const).flatMap((bob) =>
      (['accept', 'reject'] as const).flatMap((carol) =>
        (['accept', 'reject'] as const).map((alice) => {
          const { batch, orders } = everyOrder(setup, {
            'alice:1': alice,
            'bob:1': bob,
            'carol:1': carol,
          });

          return orders.every(
            ({ waiting, widths: result }) =>
              waiting.length === 0 &&
              JSON.stringify(result) === JSON.stringify(batch)
          );
        })
      )
    );

    expect({ alone: alone.status, results }).toEqual({
      alone: 'blocked',
      results: results.map(() => true),
    });
  });

  it('gives the plugin repair, not Editing widths, when a preset is rejected after Editing inserted a column', () => {
    const run = make([group(30, 70)]);
    const column = {
      children: [paragraph('z')],
      type: 'column',
      width: '100%',
    };

    run.proof.propose('alice:1', (tx) =>
      tx.columnGroup.setColumns({ at: [0], widths: ['60%', '40%'] })
    );
    run.editor.update((tx) => tx.nodes.insert(column, { at: [0, 2] }));
    run.proof.decide({ action: 'reject', changes: ['alice:1'] });

    // Editing alone gives 15/35/50; the correction's 50 for the new column
    // carries no tag, so the repair rescales from it (a named limit).
    expect(widths(run.editor)).toEqual([20, 46.67, 33.33]);
  });
});

describe('moveMiddle beside pending content', () => {
  it('decides on the middle column as accepting everything shows it', () => {
    const review = make([group(20, 30, 50)]);
    const editing = make([group(20, 30, 50)]);
    const middle = {
      anchor: { offset: 0, path: [0, 1, 0, 0] },
      focus: { offset: 1, path: [0, 1, 0, 0] },
    };
    const moveMiddle = (editor: Editor) =>
      editor.update.column.moveMiddle([editor.read.children()[0], [0]], {
        direction: 'left',
      });

    review.proof.propose('bob:1', (tx) => tx.text.delete({ at: middle }));
    moveMiddle(review.editor);
    review.proof.decide({
      action: 'accept',
      changes: pending(review.editor.read.value().children as readonly Node[]),
    });
    editing.editor.update((tx) => tx.text.delete({ at: middle }));
    moveMiddle(editing.editor);

    expect(review.editor.read.children()).toEqual(
      editing.editor.read.children()
    );
  });
});

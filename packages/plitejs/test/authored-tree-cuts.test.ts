import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  definePlugin,
  defineEditorSchema,
  DocumentChange,
  NodeApi,
  property,
  schema,
  target,
  type EditorUpdateTransaction,
} from 'plitejs';

import { createAuthoredPlugin } from '../src/authored/authored';
import { authoredTestApi, reviewRecords } from './support/authored';

// S4 of docs/plans/2026-10-10-authored-values.md: an Enter inside an inline
// element records a cut on both halves, and rejecting it joins exactly them.

type Node = Record<string, unknown> & {
  children?: readonly Node[];
  ref?: string;
  text?: string;
  url?: string;
};
type Decision = { action: 'accept' | 'reject'; changes: string[] };

const Links = defineEditorSchema('cuts-links', {
  elements: {
    link: {
      content: schema.content.text({ default: 'text', min: 1 }),
      inline: true,
    },
  },
  id: 'cuts-links',
  properties: [
    schema.elementProperty('url', property.string(), {
      target: target.type('link'),
    }),
    // Stands for an element id, which a split drops from its new half.
    schema.elementProperty('ref', property.string(), {
      split: 'drop',
      target: target.type('link'),
    }),
  ],
  root: schema.content.not(schema.content.text()),
  unknown: 'preserve',
  version: 1,
});

const link = (
  text: string,
  url = 'u',
  extra: Record<string, unknown> = {}
) => ({
  children: [{ text }],
  type: 'link',
  url,
  ...extra,
});
const paragraph = (...children: Node[]) => ({ children, type: 'paragraph' });
const linked = (...links: Node[]) =>
  paragraph(
    { text: '' },
    ...links.flatMap((item, index) =>
      index === 0 ? [item] : [{ text: '' }, item]
    ),
    { text: '' }
  );

// Removes a link that holds only "m", standing for a plugin correction that
// removes an element by what it holds.
const RemoveLinksOfM = definePlugin('cuts-remove-links-of-m', {
  corrections: [
    {
      event: 'content',
      query: { type: 'link' },
      correct({ entry: [node, path], tx }) {
        if (NodeApi.string(node) === 'm') tx.nodes.remove({ at: path });
      },
    },
  ],
});

const editorFor = (
  value: unknown,
  author: string,
  intent: 'edit' | 'propose' = 'propose'
) => {
  let count = 0;

  return createEditor({
    initialValue: value as never,
    plugins: [
      Links,
      RemoveLinksOfM,
      createAuthoredPlugin({
        authorId: author,
        createChangeId: () => `${author}:${(count += 1)}`,
        intent,
        now: () => 1,
      }),
    ],
  });
};
type Editor = ReturnType<typeof editorFor>;
type AuthoredRead = {
  read: {
    authored: { groups: (input: { at: number[] }) => Array<{ id: string }> };
  };
};

const enterIn = (
  tx: EditorUpdateTransaction,
  path: number[],
  offset: number
) => {
  tx.selection.set({ anchor: { offset, path }, focus: { offset, path } });
  tx.break.insert();
};
const enter = (editor: Editor, path: number[], offset: number) =>
  editor.update((tx) => enterIn(tx, path, offset));

const decide = (value: unknown, decisions: Decision | Decision[]) => {
  const editor = editorFor(value, 'zed', 'edit');
  const result = authoredTestApi(editor).decide(decisions);

  return { result, value: editor.read.value().children as readonly Node[] };
};

/** Each block's links as `text@url`, without review marks. */
const shape = (nodes: readonly Node[]) =>
  nodes.map((block) =>
    (block.children ?? []).flatMap((child) =>
      child.type === 'link'
        ? [
            `${(child.children ?? []).map((leaf) => leaf.text).join('')}@${child.url}${child.ref ? `#${child.ref}` : ''}`,
          ]
        : child.text
          ? [child.text]
          : []
    )
  );

/**
 * Decides `actions` one change at a time in every order, carrying a change
 * that waits into the next step; returns each order's shape and the batch's.
 */
const everyOrder = (
  value: unknown,
  actions: Readonly<Record<string, Decision['action']>>
) => {
  const decisionsOf = (changes: readonly string[]) =>
    (['accept', 'reject'] as const).flatMap((action) => {
      const picked = changes.filter((change) => actions[change] === action);

      return picked.length > 0 ? [{ action, changes: picked }] : [];
    });
  const changes = Object.keys(actions);
  const orders =
    changes.length === 2 ? [changes, [...changes].reverse()] : [changes];

  return {
    batch: shape(decide(value, decisionsOf(changes)).value),
    orders: orders.map((order) => {
      let current = value;
      let waiting: string[] = [];

      for (const change of order) {
        waiting = waiting.concat(change);
        const step = decide(current, decisionsOf(waiting));

        if (step.result.status === 'blocked') continue;
        current = step.value;
        waiting = [];
      }

      return { shape: shape(current as Node[]), waiting };
    }),
  };
};

describe('cuts', () => {
  it('joins exactly the pieces of two Enters inside one link in every order and mix', () => {
    const editor = editorFor([linked(link('abc'))], 'bob');

    enter(editor, [0, 1, 0], 2);
    enter(editor, [0, 1, 0], 1);
    const value = editor.read.value().children;
    const expected = {
      'accept/accept': [['a@u'], ['b@u'], ['c@u']],
      'accept/reject': [['ab@u'], ['c@u']],
      'reject/accept': [['a@u'], ['bc@u']],
      'reject/reject': [['abc@u']],
    };

    for (const first of ['accept', 'reject'] as const) {
      for (const second of ['accept', 'reject'] as const) {
        const { batch, orders } = everyOrder(value, {
          'bob:1': first,
          'bob:2': second,
        });

        assert.deepEqual(
          { batch, orders },
          {
            batch: expected[`${first}/${second}`],
            orders: orders.map(() => ({
              shape: expected[`${first}/${second}`],
              waiting: [],
            })),
          },
          `${first}/${second}`
        );
      }
    }
  });

  it('joins the halves over text the same batch removes between them', () => {
    const bob = editorFor([linked(link('ab'))], 'bob');

    enter(bob, [0, 1, 0], 1);
    const carol = editorFor(bob.read.value().children, 'carol');

    carol.update((tx) =>
      tx.text.insert('X', { at: { offset: 0, path: [1, 0] } })
    );

    assert.deepEqual(
      shape(
        decide(carol.read.value().children, {
          action: 'reject',
          changes: ['bob:1', 'carol:1'],
        }).value
      ),
      [['ab@u']]
    );
  });

  it('joins accepted text typed between the halves into the link', () => {
    const bob = editorFor([linked(link('ab'))], 'bob');

    enter(bob, [0, 1, 0], 1);
    const carol = editorFor(bob.read.value().children, 'carol');

    carol.update((tx) =>
      tx.text.insert('X', { at: { offset: 0, path: [1, 0] } })
    );

    assert.deepEqual(
      shape(
        decide(carol.read.value().children, [
          { action: 'accept', changes: ['carol:1'] },
          { action: 'reject', changes: ['bob:1'] },
        ]).value
      ),
      [['aXb@u']]
    );
  });

  it('returns two links one suggestion split as two links when it is rejected', () => {
    const editor = editorFor(
      [linked(link('ab', 'u1'), link('cd', 'u2'))],
      'bob'
    );

    authoredTestApi(editor).propose('bob:1', (tx) => enterIn(tx, [0, 3, 0], 1));
    authoredTestApi(editor).propose('bob:1', (tx) => enterIn(tx, [0, 1, 0], 1));

    assert.deepEqual(
      shape(
        decide(editor.read.value().children, {
          action: 'reject',
          changes: ['bob:1'],
        }).value
      ),
      [['ab@u1', 'cd@u2']]
    );
  });

  it('keeps two links for an accepted Enter', () => {
    const editor = editorFor([linked(link('ab'))], 'bob');

    enter(editor, [0, 1, 0], 1);

    assert.deepEqual(
      shape(
        decide(editor.read.value().children, {
          action: 'accept',
          changes: ['bob:1'],
        }).value
      ),
      [['a@u'], ['b@u']]
    );
  });

  it('keeps the left half url when a url change on the right half is accepted and the Enter rejected, and waits while it is pending', () => {
    const bob = editorFor([linked(link('ab'))], 'bob');

    enter(bob, [0, 1, 0], 1);
    const carol = editorFor(bob.read.value().children, 'carol');

    carol.update((tx) => tx.nodes.set({ url: 'u2' } as never, { at: [1, 1] }));
    const value = carol.read.value().children;

    assert.deepEqual(
      {
        accepted: everyOrder(value, { 'bob:1': 'accept', 'carol:1': 'accept' }),
        alone: decide(value, { action: 'reject', changes: ['bob:1'] }).result,
        rejected: everyOrder(value, { 'bob:1': 'reject', 'carol:1': 'accept' }),
      },
      {
        accepted: {
          batch: [['a@u'], ['b@u2']],
          orders: [
            { shape: [['a@u'], ['b@u2']], waiting: [] },
            { shape: [['a@u'], ['b@u2']], waiting: [] },
          ],
        },
        alone: { ids: ['bob:1'], status: 'blocked', with: ['carol:1'] },
        rejected: {
          batch: [['ab@u']],
          orders: [
            { shape: [['ab@u']], waiting: [] },
            { shape: [['ab@u']], waiting: [] },
          ],
        },
      }
    );
  });

  it('waits to accept removing the left half until the Enter is decided, and the batch is unchanged', () => {
    const bob = editorFor([linked(link('p', 'u1'), link('ab', 'u2'))], 'bob');

    enter(bob, [0, 3, 0], 1);
    const carol = editorFor(bob.read.value().children, 'carol');

    carol.update((tx) => tx.nodes.set({ url: 'u3' } as never, { at: [1, 1] }));
    const remover = editorFor(carol.read.value().children, 'bob');

    authoredTestApi(remover).propose('bob:2', (tx) =>
      tx.nodes.remove({ at: [0, 3] })
    );
    const value = remover.read.value().children;
    const batch = [
      { action: 'reject' as const, changes: ['bob:1', 'carol:1'] },
      { action: 'accept' as const, changes: ['bob:2'] },
    ];

    assert.deepEqual(
      {
        alone: decide(value, { action: 'accept', changes: ['bob:2'] }).result,
        batch: shape(decide(value, batch).value),
      },
      {
        alone: { ids: ['bob:2'], status: 'blocked', with: ['bob:1'] },
        batch: [['p@u1', 'b@u2']],
      }
    );
  });

  it('waits to reject an Enter whose left half alone is struck, and the batch keeps the right half', () => {
    const bob = editorFor([linked(link('ab'))], 'bob');

    enter(bob, [0, 1, 0], 1);
    const carol = editorFor(bob.read.value().children, 'carol');

    carol.update((tx) => tx.nodes.remove({ at: [0, 1] }));
    const value = carol.read.value().children;

    assert.deepEqual(
      {
        alone: decide(value, { action: 'reject', changes: ['bob:1'] }).result,
        batch: shape(
          decide(value, [
            { action: 'reject', changes: ['bob:1'] },
            { action: 'accept', changes: ['carol:1'] },
          ]).value
        ),
      },
      {
        alone: { ids: ['bob:1'], status: 'blocked', with: ['carol:1'] },
        batch: [['b@u']],
      }
    );
  });

  it('gives one link when Editing deletes the middle piece of a twice-split link and both Enters are rejected', () => {
    const bob = editorFor([linked(link('abc'))], 'bob');

    enter(bob, [0, 1, 0], 2);
    enter(bob, [0, 1, 0], 1);
    const editing = editorFor(bob.read.value().children, 'eve', 'edit');

    editing.update((tx) => tx.nodes.remove({ at: [1, 1] }));
    const value = editing.read.value().children;

    assert.deepEqual(
      everyOrder(value, { 'bob:1': 'reject', 'bob:2': 'reject' }),
      {
        batch: [['ac@u']],
        orders: [
          { shape: [['ac@u']], waiting: [] },
          { shape: [['ac@u']], waiting: [] },
        ],
      }
    );
  });

  it('gives back the dropped ref of a rejected split, also after Editing deletes the left half', () => {
    const bob = editorFor([linked(link('ab', 'u', { ref: 'r1' }))], 'bob');

    enter(bob, [0, 1, 0], 1);
    const split = bob.read.value().children;
    const editing = editorFor(split, 'eve', 'edit');

    editing.update((tx) => tx.nodes.remove({ at: [0, 1] }));

    assert.deepEqual(
      {
        leftDeleted: shape(
          decide(editing.read.value().children, {
            action: 'reject',
            changes: ['bob:1'],
          }).value
        ),
        rejected: shape(
          decide(split, { action: 'reject', changes: ['bob:1'] }).value
        ),
      },
      { leftDeleted: [['b@u#r1']], rejected: [['ab@u#r1']] }
    );
  });

  it('gives back the dropped ref of an Enter that a change made again after its accept', () => {
    const bob = editorFor([linked(link('abc', 'u', { ref: 'r1' }))], 'bob');
    const propose = (write: (tx: EditorUpdateTransaction) => void) =>
      bob.update((tx) => {
        (
          tx as unknown as {
            authored: { propose: (input: { changeId: string }) => void };
          }
        ).authored.propose({ changeId: 'bob:c' });
        write(tx);
      });

    propose((tx) =>
      tx.text.insert('X', { at: { offset: 3, path: [0, 1, 0] } })
    );
    authoredTestApi(bob).decide({ action: 'accept', changes: ['bob:c'] });
    propose((tx) => enterIn(tx, [0, 1, 0], 1));

    assert.deepEqual(
      shape(
        decide(bob.read.value(), { action: 'reject', changes: ['bob:c'] }).value
      ),
      [['abcX@u#r1']]
    );
  });

  it('waits on each incarnation of a change that formats one half before joining a rejected Enter', () => {
    const carol = editorFor([linked(link('ab'))], 'carol');

    enter(carol, [0, 1, 0], 1);
    const value = structuredClone(carol.read.value()) as {
      children: Array<{ children: Node[] }>;
      records?: unknown;
    };
    const setUrl = (half: Node, inc: string, url: string) =>
      Object.assign(half, {
        authored: [
          ...((half.authored as unknown[]) ?? []),
          {
            at: 1,
            author: 'alice',
            before: 'u',
            change: 'A',
            id: inc,
            inc,
            key: 'url',
            kind: 'format',
            write: { kind: 'set', value: url },
          },
        ],
        url,
      });

    setUrl(value.children[0].children[1], 'a1', 'v');
    setUrl(value.children[1].children[1], 'a2', 'w');
    value.records = reviewRecords({
      verdicts: [
        { decision: 'd:1', member: { at: 1, change: 'A' }, verdict: 'accept' },
      ],
    });

    assert.deepEqual(
      decide(value, { action: 'reject', changes: ['carol:1'] }).result,
      { ids: ['carol:1'], status: 'blocked', with: ['A'] }
    );
  });

  it('gives one link when an Enter and another author’s Backspace are both rejected, and two when both are accepted', () => {
    const alice = editorFor([linked(link('ab'))], 'alice');

    enter(alice, [0, 1, 0], 1);
    const bob = editorFor(alice.read.value().children, 'bob');

    bob.update((tx) => {
      tx.selection.set({
        anchor: { offset: 0, path: [1, 0] },
        focus: { offset: 0, path: [1, 0] },
      });
      tx.text.deleteBackward({ unit: 'character' });
    });
    const value = bob.read.value().children;

    assert.deepEqual(
      {
        accepted: shape(
          decide(value, { action: 'accept', changes: ['alice:1', 'bob:1'] })
            .value
        ),
        rejected: shape(
          decide(value, { action: 'reject', changes: ['alice:1', 'bob:1'] })
            .value
        ),
      },
      { accepted: [['a@u', 'b@u']], rejected: [['ab@u']] }
    );
  });

  it('keeps the chain when a correction inside a decision removes the middle piece', () => {
    // Rejecting Dave's pending "X" leaves the middle piece holding "m", which
    // the correction removes inside the decision.
    const dave = editorFor([linked(link('amc'))], 'dave');

    dave.update((tx) =>
      tx.text.insert('X', { at: { offset: 2, path: [0, 1, 0] } })
    );
    const bob = editorFor(dave.read.value().children, 'bob');

    enter(bob, [0, 1, 2], 0);
    enter(bob, [0, 1, 0], 1);
    const corrected = decide(bob.read.value().children, {
      action: 'reject',
      changes: ['dave:1'],
    }).value;

    assert.deepEqual(
      {
        corrected: shape(corrected),
        rejected: everyOrder(corrected, {
          'bob:1': 'reject',
          'bob:2': 'reject',
        }),
      },
      {
        corrected: [['a@u'], [], ['c@u']],
        rejected: {
          batch: [['ac@u']],
          orders: [
            { shape: [['ac@u']], waiting: [] },
            { shape: [['ac@u']], waiting: [] },
          ],
        },
      }
    );
  });

  it('gives one link when removing the link from the middle of a range is rejected', () => {
    const editor = editorFor([linked(link('abc'))], 'bob');

    editor.update((tx) =>
      tx.nodes.unwrap({
        at: {
          anchor: { offset: 1, path: [0, 1, 0] },
          focus: { offset: 2, path: [0, 1, 0] },
        },
        match: (node) => (node as Node).type === 'link',
        split: true,
      })
    );

    assert.deepEqual(
      shape(
        decide(editor.read.value().children, {
          action: 'reject',
          changes: ['bob:1'],
        }).value
      ),
      [['abc@u']]
    );
  });
  it("gives one link when the author of a pending link withdraws the middle piece of another author's two Enters", () => {
    const own = [{ at: 1, author: 'alice', change: 'alice:1', kind: 'insert' }];
    const bob = editorFor(
      [
        linked({
          authored: own,
          children: [{ authored: own, text: 'abc' }],
          type: 'link',
          url: 'u',
        }),
      ],
      'bob'
    );

    enter(bob, [0, 1, 0], 2);
    enter(bob, [0, 1, 0], 1);
    const alice = editorFor(bob.read.value().children, 'alice');

    alice.update((tx) => tx.nodes.remove({ at: [1, 1] }));

    assert.deepEqual(
      shape(
        decide(alice.read.value().children, [
          { action: 'reject', changes: ['bob:1', 'bob:2'] },
          { action: 'accept', changes: ['alice:1'] },
        ]).value
      ),
      [['ac@u']]
    );
  });

  it('joins a rejected split of a link nested inside another inline element', () => {
    const Nested = defineEditorSchema('cuts-nested', {
      elements: {
        link: {
          content: schema.content.text({ default: 'text', min: 1 }),
          inline: true,
        },
        outer: {
          content: schema.content.any(
            [schema.content.text(), schema.content.type('link')],
            { default: 'text', min: 1 }
          ),
          inline: true,
        },
      },
      id: 'cuts-nested',
      properties: [
        schema.elementProperty('url', property.string(), {
          target: target.type('link'),
        }),
      ],
      root: schema.content.not(schema.content.text()),
      unknown: 'preserve',
      version: 1,
    });
    const editorOf = (
      value: unknown,
      author: string,
      intent: 'edit' | 'propose'
    ) =>
      createEditor({
        initialValue: value as never,
        plugins: [
          Nested,
          createAuthoredPlugin({
            authorId: author,
            createChangeId: () => `${author}:1`,
            intent,
            now: () => 1,
          }),
        ],
      });
    const bob = editorOf(
      [
        paragraph(
          { text: '' },
          { children: [{ text: '' }, link('ab'), { text: '' }], type: 'outer' },
          { text: '' }
        ),
      ],
      'bob',
      'propose'
    );

    bob.update((tx) =>
      tx.nodes.split({
        always: true,
        at: { offset: 1, path: [0, 1, 1, 0] },
        match: (node) => (node as Node).type === 'link',
      })
    );
    const judge = editorOf(bob.read.value().children, 'zed', 'edit');

    authoredTestApi(judge).decide({ action: 'reject', changes: ['bob:1'] });

    assert.deepEqual(
      shape(
        (
          (judge.read.value().children as readonly Node[])[0].children ?? []
        ).filter((child) => child.type === 'outer')
      ),
      [['ab@u']]
    );
  });

  it('keeps a right half without the dropped ref when its left half stays in another block', () => {
    const bob = editorFor([linked(link('ab', 'u', { ref: 'r1' }))], 'bob');

    enter(bob, [0, 1, 0], 1);
    const editing = editorFor(bob.read.value().children, 'eve', 'edit');

    editing.update((tx) => {
      const at = { offset: 0, path: [1, 0] };

      tx.selection.set({ anchor: at, focus: at });
      tx.break.insert();
    });

    assert.deepEqual(
      shape(
        decide(editing.read.value().children, {
          action: 'reject',
          changes: ['bob:1'],
        }).value
      ),
      [['a@u#r1'], ['b@u']]
    );
  });

  it('rejects Enter at the edge of one’s own typing in a link with that typing, back to one link', () => {
    const bob = editorFor([linked(link('ab'))], 'bob');

    bob.update((tx) => {
      tx.text.insert('xy', { at: { offset: 1, path: [0, 1, 0] } });
    });
    enter(bob, [0, 1, 1], 2);

    assert.deepEqual(
      shape(
        decide(bob.read.value().children, {
          action: 'reject',
          changes: ['bob:1'],
        }).value
      ),
      [['ab@u']]
    );
  });

  it('keeps a deletion at the end of a line apart from a later Enter inside a link on the next line', () => {
    const bob = editorFor(
      [paragraph({ text: 'ab' }), linked(link('cd'))],
      'bob'
    );

    bob.update((tx) => {
      tx.text.delete({
        at: {
          anchor: { offset: 1, path: [0, 0] },
          focus: { offset: 2, path: [0, 0] },
        },
      });
    });
    enter(bob, [1, 1, 0], 1);

    assert.deepEqual(
      (bob as unknown as AuthoredRead).read.authored
        .groups({ at: [1] })
        .map(({ id }) => id),
      ['bob:2']
    );
  });

  it("rejects a writer's taken-back Enter inside a link to one link and accepts it as Editing's two", () => {
    const takeBack = (editor: Editor) => {
      enter(editor, [0, 1, 0], 1);
      editor.update((tx) => {
        const at = { offset: 0, path: [1, 0] };

        tx.selection.set({ anchor: at, focus: at });
        tx.text.deleteBackward();
      });
    };
    const bob = editorFor([linked(link('ab'))], 'bob');
    const editing = editorFor([linked(link('ab'))], 'eve', 'edit');

    takeBack(bob);
    takeBack(editing);

    assert.deepEqual(
      {
        accept: shape(
          decide(bob.read.value().children, {
            action: 'accept',
            changes: ['bob:1', 'bob:2'],
          }).value
        ),
        reject: everyOrder(bob.read.value().children, {
          'bob:1': 'reject',
          'bob:2': 'reject',
        }),
      },
      {
        accept: shape(editing.read.value().children as readonly Node[]),
        reject: {
          batch: [['ab@u']],
          orders: [
            { shape: [['ab@u']], waiting: [] },
            { shape: [['ab@u']], waiting: [] },
          ],
        },
      }
    );
  });

  const twiceSplit = () => {
    const bob = editorFor([linked(link('abc'))], 'bob');

    enter(bob, [0, 1, 0], 2);
    enter(bob, [0, 1, 0], 1);

    return bob.read.value().children as readonly Node[];
  };
  const rejectBoth = (value: unknown) => {
    const judge = editorFor(value, 'zed', 'edit');

    authoredTestApi(judge).decide({
      action: 'reject',
      changes: ['bob:1', 'bob:2'],
    });

    return shape(judge.read.value().children);
  };

  it('gives one link when Editing deletes the middle piece while the last piece sits in another root', () => {
    const [a, b, c] = twiceSplit();
    const note = paragraph({ text: 'n' });
    const editing = editorFor(
      { children: [a, b, c], roots: { other: [note] } },
      'eve',
      'edit'
    );

    editing.update((tx) =>
      tx.changes.apply(
        DocumentChange.between(tx.value(), {
          children: [a, b],
          roots: { other: [note, c] },
        })
      )
    );
    editing.update((tx) => tx.nodes.remove({ at: [1, 1] }));
    const moved = editing.read.value() as {
      children: readonly Node[];
      roots: { other: readonly Node[] };
    };

    editing.update((tx) =>
      tx.changes.apply(
        DocumentChange.between(tx.value(), {
          children: [...moved.children, moved.roots.other[1]],
          roots: { other: [note] },
        })
      )
    );

    assert.deepEqual(rejectBoth(editing.read.value()), [['ac@u']]);
  });

  it('gives one link when Editing deletes the root holding the middle piece with a lifecycle-only change', () => {
    const [a, b, c] = twiceSplit();
    const editing = editorFor(
      { children: [a, c, paragraph({ text: 'p' })], roots: { aux: [b] } },
      'eve',
      'edit'
    );

    editing.update((tx) => {
      tx.changes.apply(
        DocumentChange.fromJSON({ deleteRoots: ['aux'], version: 3 })
      );
      tx.text.insert('z', { at: { offset: 1, path: [2, 0] } });
    });

    assert.deepEqual(rejectBoth(editing.read.value()), [['ac@u'], ['pz']]);
  });

  const carolAccepted = reviewRecords({
    verdicts: [
      {
        decision: 'd:1',
        member: { at: 1, change: 'carol:1' },
        verdict: 'accept',
      },
    ],
  });

  it('settles a suggested removal of the middle piece of a twice-split link to what Editing’s removal leaves, on load and when the verdict arrives', () => {
    const split = twiceSplit();
    const carol = editorFor(split, 'carol');
    const editing = editorFor(split, 'eve', 'edit');

    carol.update((tx) => tx.nodes.remove({ at: [1, 1] }));
    editing.update((tx) => tx.nodes.remove({ at: [1, 1] }));
    const suggested = carol.read.value();
    const peer = editorFor(suggested, 'dan');

    peer.update((tx) =>
      tx.changes.apply(
        DocumentChange.between(tx.value(), {
          ...tx.value(),
          records: carolAccepted,
        })
      )
    );

    assert.deepEqual(
      {
        arrived: peer.read.children(),
        loaded: editorFor(
          { ...suggested, records: carolAccepted },
          'dan'
        ).read.children(),
      },
      { arrived: editing.read.children(), loaded: editing.read.children() }
    );
  });

  it('settles away the suggested removal of the last piece of a once-split link while its Enter is pending, and the Enter still decides', () => {
    const bob = editorFor([linked(link('ab'))], 'bob');

    enter(bob, [0, 1, 0], 1);
    const carol = editorFor(bob.read.value().children, 'carol');

    carol.update((tx) => tx.nodes.remove({ at: [1, 1] }));
    const suggested = carol.read.value();
    const loaded = editorFor(
      { ...suggested, records: carolAccepted },
      'dan'
    ).read.value();
    const decided = (action: Decision['action']) =>
      shape(decide(loaded, { action, changes: ['bob:1'] }).value);

    assert.deepEqual(
      {
        accepted: decided('accept'),
        alone: decide(suggested.children, {
          action: 'accept',
          changes: ['carol:1'],
        }).result,
        loaded: shape(loaded.children as readonly Node[]),
        rejected: decided('reject'),
      },
      {
        accepted: [['a@u'], []],
        alone: { ids: ['carol:1'], status: 'blocked', with: ['bob:1'] },
        loaded: [['a@u'], []],
        rejected: [['a@u']],
      }
    );
  });
});

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
import { getDefined } from '../src/internal/get-defined';
import { authoredTestApi, reviewRecords } from './support/authored';

// S4 of docs/plans/2026-10-10-authored-values.md: an Enter inside an inline
// element records a cut on both halves, and rejecting it joins exactly them.

type Node = Record<string, unknown> & {
  children?: readonly Node[];
  ref?: string;
  text?: string;
  tone?: string;
  type?: string;
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
    authored: {
      groups: (input: { at: number[] }) => Array<{ id: string }>;
      reviewOf: (node: unknown) => {
        accepted: Readonly<Record<string, unknown>>;
      };
    };
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
  const document = editor.read.value();

  return { document, result, value: document.children as readonly Node[] };
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
        current = step.document;
        waiting = [];
      }

      return {
        shape: shape(
          Array.isArray(current)
            ? current
            : (current as { children: Node[] }).children
        ),
        waiting,
      };
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

  it('keeps both halves when a url change on the right half is accepted and the Enter rejected, and waits while it is pending', () => {
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
          batch: [['a@u', 'b@u2']],
          orders: [
            { shape: [['a@u', 'b@u2']], waiting: [] },
            { shape: [['a@u', 'b@u2']], waiting: [] },
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

const editorIn = (
  plugin: unknown,
  value: unknown,
  author: string,
  intent: 'edit' | 'propose'
) =>
  createEditor({
    initialValue: value as never,
    plugins: [
      plugin,
      createAuthoredPlugin({
        authorId: author,
        createChangeId: () => author,
        intent,
        now: () => 1,
      }),
    ] as never,
  });
const commit = (
  plugin: unknown,
  value: unknown,
  author: string,
  intent: 'edit' | 'propose',
  run: (tx: EditorUpdateTransaction) => void
) => {
  const editor = editorIn(plugin, value, author, intent);

  editor.update(run);

  return editor.read.value() as { children: Node[] };
};
const decideIn = (
  plugin: unknown,
  value: unknown,
  decisions: Decision | Decision[]
) => {
  const editor = editorIn(plugin, value, 'zed', 'edit');
  const result = authoredTestApi(editor).decide(decisions);

  return {
    editor,
    result,
    value: editor.read.value().children as readonly Node[],
  };
};
const lines = (nodes: readonly Node[]) =>
  nodes.map(
    (block) =>
      `${block.type}${block.tone ? `(${block.tone})` : ''}: ${(
        block.children ?? []
      )
        .map((child) =>
          child.type === 'link'
            ? `[${(child.children ?? []).map((leaf) => leaf.text).join('')}${child.ref ? `#${child.ref}` : ''}]`
            : child.text
        )
        .join('')}`
  );
const splitLink = (tx: EditorUpdateTransaction, path: number[]) =>
  tx.nodes.split({
    always: true,
    at: { offset: 1, path },
    match: (node) => (node as Node).type === 'link',
  });
const linkPaths = (nodes: readonly Node[]) =>
  nodes.flatMap((block, at) =>
    (block.children ?? []).flatMap((child, index) =>
      child.type === 'link' ? [[at, index]] : []
    )
  );
const withIdRank = (tag: { id: string }, rank: string) =>
  JSON.parse(JSON.stringify(tag).replaceAll(tag.id, `${rank}-${tag.id}`));

describe('rejected cuts at the place their halves land', () => {
  const inline = () =>
    schema.content.any([schema.content.text(), schema.content.type('link')], {
      default: 'text',
      min: 1,
    });
  const RefInParagraph = defineEditorSchema('cuts-ref-in-paragraph', {
    elements: {
      heading: { content: inline() },
      link: {
        content: schema.content.text({ default: 'text', min: 1 }),
        inline: true,
      },
      paragraph: { content: inline() },
    },
    id: 'cuts-ref-in-paragraph',
    properties: [
      schema.elementProperty('ref', property.string(), {
        target: target.and(
          target.type('link'),
          target.parent(target.type('paragraph'))
        ),
      }),
    ],
    root: schema.content.types(['heading', 'paragraph'], {
      default: { type: 'paragraph' },
      min: 1,
    }),
    unknown: 'preserve',
    version: 1,
  });

  it('drops a value a merge carries into a block whose links cannot hold it, so the merge and the rejected cut apply', () => {
    const carol = commit(
      RefInParagraph,
      [
        { children: [{ text: 'h' }], type: 'heading' },
        paragraph(
          { text: '' },
          { children: [{ text: 'ab' }], type: 'link' },
          { text: '' }
        ),
      ],
      'carol',
      'propose',
      (tx) => splitLink(tx, [1, 1, 0])
    );
    const ed = commit(RefInParagraph, carol, 'ed', 'edit', (tx) => {
      tx.nodes.set({ ref: 'x' } as never, { at: [1, 1] });
      tx.nodes.set({ ref: 'y' } as never, { at: [1, 3] });
    });
    // The stored form of Dave's proposed Backspace into the heading.
    const value = structuredClone(ed);

    value.children[1].authored = [
      ...((value.children[1].authored as unknown[]) ?? []),
      { at: 1, author: 'dave', change: 'dave', kind: 'join' },
    ];
    const decided = decideIn(RefInParagraph, value, [
      { action: 'accept', changes: ['dave'] },
      { action: 'reject', changes: ['carol'] },
    ]);

    assert.deepEqual(
      { lines: lines(decided.value), status: decided.result.status },
      { lines: ['heading: h[ab]'], status: 'applied' }
    );
  });

  const ColorInParagraph = defineEditorSchema('cuts-color-in-paragraph', {
    elements: {
      heading: { content: schema.content.text() },
      paragraph: { content: schema.content.text() },
    },
    id: 'cuts-color-in-paragraph',
    properties: [
      schema.textProperty(
        'color',
        property.string({ default: 'u', omitDefault: true }),
        { target: target.type('paragraph') }
      ),
    ],
    root: schema.content.types(['heading', 'paragraph'], {
      default: { type: 'paragraph' },
      min: 1,
    }),
    unknown: 'preserve',
    version: 1,
  });
  // Eve's unrelated proposed line, Ed's direct writes on the paragraph, and
  // the stored form of Dave's proposed Backspace into the heading.
  const mergedState = (
    plugin: unknown,
    second: Node,
    write: (tx: EditorUpdateTransaction) => void
  ) => {
    const eve = commit(
      plugin,
      [{ children: [{ text: 'h' }], type: 'heading' }, second],
      'eve',
      'propose',
      (tx) => tx.nodes.insert(paragraph({ text: 'z' }) as never, { at: [2] })
    );
    const value = structuredClone(commit(plugin, eve, 'ed', 'edit', write));

    value.children[1].authored = [
      ...((value.children[1].authored as unknown[]) ?? []),
      { at: 1, author: 'dave', change: 'dave', kind: 'join' },
    ];

    return value;
  };
  const merges = [
    {
      name: 'a written text color',
      plugin: ColorInParagraph,
      value: () =>
        mergedState(ColorInParagraph, paragraph({ text: 'ab' }), (tx) =>
          tx.nodes.set({ color: 'u' } as never, { at: [1, 0] })
        ),
      joined: 'heading: hab',
      kept: 'paragraph: ab',
      held: '"color":"u"',
    },
    {
      name: 'link refs',
      plugin: RefInParagraph,
      value: () =>
        mergedState(RefInParagraph, linked(link('a'), link('b')), (tx) => {
          tx.nodes.set({ ref: 'x' } as never, { at: [1, 1] });
          tx.nodes.set({ ref: 'y' } as never, { at: [1, 3] });
        }),
      joined: 'heading: h[a][b]',
      kept: 'paragraph: [a#x][b#y]',
      held: '"ref":"x"',
    },
  ];

  for (const { name, plugin, value, joined, kept, held } of merges) {
    it(`previews a merge into a heading that cannot hold ${name}, without the value`, () => {
      const editor = editorIn(plugin, value(), 'zed', 'edit') as ReturnType<
        typeof editorIn
      > & {
        api: { authored: { setView: (view: unknown) => void } };
      };

      editor.api.authored.setView({ preview: 'proposed' });
      const preview = editor.read.children() as readonly Node[];

      assert.deepEqual(
        { held: JSON.stringify(preview).includes(held), lines: lines(preview) },
        { held: false, lines: [joined, 'paragraph: z'] }
      );
    });

    for (const changes of [['dave'], ['dave', 'eve']]) {
      it(`accepts ${changes.join(' and ')} into a heading that cannot hold ${name}, without the value`, () => {
        const decided = decideIn(plugin, value(), {
          action: 'accept',
          changes,
        });

        assert.deepEqual(
          {
            held: JSON.stringify(decided.value).includes(held),
            lines: lines(decided.value),
            status: decided.result.status,
          },
          {
            held: false,
            lines: [joined, 'paragraph: z'],
            status: 'applied',
          }
        );
      });
    }

    it(`keeps ${name} under the paragraph when the merge into a heading is rejected`, () => {
      const decided = decideIn(plugin, value(), {
        action: 'reject',
        changes: ['dave'],
      });

      assert.deepEqual(
        {
          held: JSON.stringify(decided.value).includes(held),
          lines: lines(decided.value),
          status: decided.result.status,
        },
        {
          held: true,
          lines: ['heading: h', kept, 'paragraph: z'],
          status: 'applied',
        }
      );
    });
  }
});

describe('rejected cuts compare their halves', () => {
  const entered = () => {
    const carol = editorFor([linked(link('ab'))], 'carol');

    enter(carol, [0, 1, 0], 1);

    return carol.read.value().children;
  };
  const urls = (
    value: unknown,
    author: string,
    left: string,
    right: string
  ) => {
    const editor = editorFor(value, author);

    editor.update((tx) => {
      tx.nodes.set({ url: left } as never, { at: [0, 1] });
      tx.nodes.set({ url: right } as never, { at: [1, 1] });
    });

    return editor.read.value().children;
  };
  const splitOf = (value: unknown) => {
    const carol = editorFor(value, 'carol');

    carol.update((tx) => splitLink(tx, [0, 1, 0]));

    return carol.read.value().children as readonly Node[];
  };
  const withRefOnWhole = () => {
    const bob = editorFor([linked(link('ab', 'u', { ref: 'r1' }))], 'bob');

    bob.update((tx) => tx.nodes.set({ ref: 'r2' } as never, { at: [0, 1] }));

    return bob.read.value().children;
  };
  const Paras = defineEditorSchema('cuts-paras', {
    elements: { paragraph: { content: schema.content.text() } },
    id: 'cuts-paras',
    properties: [
      schema.elementProperty('tone', property.string(), {
        target: target.type('paragraph'),
      }),
    ],
    root: schema.content.types(['paragraph'], {
      default: { type: 'paragraph' },
      min: 1,
    }),
    unknown: 'preserve',
    version: 1,
  });
  const Titled = defineEditorSchema('cuts-titled', {
    elements: {
      paragraph: { content: schema.content.text() },
      title: { content: schema.content.text() },
    },
    id: 'cuts-titled',
    properties: [],
    root: schema.content.prefix(
      [{ element: 'title' }],
      schema.content.types(['paragraph'], { default: { type: 'paragraph' } })
    ),
    unknown: 'preserve',
    version: 1,
  });
  const RefW = defineEditorSchema('cuts-ref-w', {
    elements: {
      link: {
        content: schema.content.text({ default: 'text', min: 1 }),
        inline: true,
      },
    },
    id: 'cuts-ref-w',
    properties: [
      schema.elementProperty('url', property.string(), {
        target: target.type('link'),
      }),
      schema.elementProperty(
        'ref',
        property.string({ default: 'w', omitDefault: true }),
        { split: 'drop', target: target.type('link') }
      ),
    ],
    root: schema.content.not(schema.content.text()),
    unknown: 'preserve',
    version: 1,
  });

  it('waits to reject an Enter on the one pending change that wrote different urls on its halves', () => {
    const value = urls(entered(), 'alice', 'v', 'w');

    assert.deepEqual(
      decide(value, { action: 'reject', changes: ['carol:1'] }).result,
      { ids: ['carol:1'], status: 'blocked', with: ['alice:1'] }
    );
  });

  it('waits to reject an Enter on every pending change that still decides whether its halves differ', () => {
    const value = urls(urls(entered(), 'alice', 'v', 'w'), 'bob', 'q', 'q');

    assert.deepEqual(
      decide(value, { action: 'reject', changes: ['carol:1'] }).result,
      { ids: ['carol:1'], status: 'blocked', with: ['alice:1', 'bob:1'] }
    );
  });

  it('waits to reject an inline split on a pending insertion between its halves', () => {
    const split = splitOf([linked(link('ab'))]);
    const dave = editorFor(split, 'dave');

    dave.update((tx) =>
      tx.nodes.insert(link('x', 'z') as never, { at: linkPaths(split)[1] })
    );
    const value = dave.read.value().children;

    assert.deepEqual(
      {
        alone: decide(value, { action: 'reject', changes: ['carol:1'] }).result,
        decided: shape(
          decide(value, { action: 'reject', changes: ['carol:1', 'dave:1'] })
            .value
        ),
      },
      {
        alone: { ids: ['carol:1'], status: 'blocked', with: ['dave:1'] },
        decided: [['ab@u']],
      }
    );
  });

  it('rejects an inline split at once under a pending ref on the whole link, and rejecting that ref gives r1 back', () => {
    const rejected = decide(splitOf(withRefOnWhole()), {
      action: 'reject',
      changes: ['carol:1'],
    });

    assert.deepEqual(
      {
        bob: shape(
          decide(rejected.value, { action: 'reject', changes: ['bob:1'] }).value
        ),
        carol: { shape: shape(rejected.value), status: rejected.result.status },
      },
      {
        bob: [['ab@u#r1']],
        carol: { shape: [['ab@u#r2']], status: 'applied' },
      }
    );
  });

  it('waits to reject an inline split on a pending ref once the right half holds its own value, and every order keeps both refs', () => {
    const split = splitOf(withRefOnWhole());
    const ed = editorFor(split, 'ed', 'edit');

    ed.update((tx) =>
      tx.nodes.set({ ref: 'r2' } as never, { at: linkPaths(split)[1] })
    );
    const value = ed.read.value();

    assert.deepEqual(
      {
        alone: decide(value, { action: 'reject', changes: ['carol:1'] }).result,
        rejected: everyOrder(value, { 'bob:1': 'reject', 'carol:1': 'reject' }),
      },
      {
        alone: { ids: ['carol:1'], status: 'blocked', with: ['bob:1'] },
        rejected: {
          batch: [['a@u#r1', 'b@u#r2']],
          orders: [
            { shape: [['a@u#r1', 'b@u#r2']], waiting: [] },
            { shape: [['a@u#r1', 'b@u#r2']], waiting: [] },
          ],
        },
      }
    );
  });

  it('keeps apart the paragraphs of a rejected Enter whose accepted tones differ, and waits while the tones are pending', () => {
    const carol = commit(
      Paras,
      [{ children: [{ text: 'ab' }], type: 'paragraph' }],
      'carol',
      'propose',
      (tx) => enterIn(tx, [0, 0], 1)
    );
    const value = commit(Paras, carol, 'alice', 'propose', (tx) => {
      tx.nodes.set({ tone: 'v' } as never, { at: [0] });
      tx.nodes.set({ tone: 'w' } as never, { at: [1] });
    });
    const acceptAlice = { action: 'accept' as const, changes: ['alice'] };
    const rejectCarol = { action: 'reject' as const, changes: ['carol'] };

    assert.deepEqual(
      {
        alone: decideIn(Paras, value, rejectCarol).result,
        batch: lines(decideIn(Paras, value, [acceptAlice, rejectCarol]).value),
        ordered: lines(
          decideIn(
            Paras,
            decideIn(Paras, value, acceptAlice).value,
            rejectCarol
          ).value
        ),
      },
      {
        alone: { ids: ['carol'], status: 'blocked', with: ['alice'] },
        batch: ['paragraph(v): a', 'paragraph(w): b'],
        ordered: ['paragraph(v): a', 'paragraph(w): b'],
      }
    );
  });

  it('keeps apart the halves of a rejected Enter that an Editing retype made differ, though the root would force the same type', () => {
    const carol = commit(
      Titled,
      [
        { children: [{ text: 'h' }], type: 'title' },
        { children: [{ text: 'ab' }], type: 'paragraph' },
      ],
      'carol',
      'propose',
      (tx) => enterIn(tx, [1, 0], 1)
    );
    const ed = commit(Titled, carol, 'ed', 'edit', (tx) => {
      tx.nodes.set({ type: 'title' } as never, { at: [1] });
      tx.nodes.remove({ at: [0] });
    });
    const rejected = decideIn(Titled, ed, {
      action: 'reject',
      changes: ['carol'],
    });

    assert.deepEqual(
      { lines: lines(rejected.value), status: rejected.result.status },
      { lines: ['title: a', 'paragraph: b'], status: 'applied' }
    );
  });

  it('joins a rejected Enter in a required title back into the title, also from a save that left no type tag', () => {
    const carol = commit(
      Titled,
      [{ children: [{ text: 'ab' }], type: 'title' }],
      'carol',
      'propose',
      (tx) => enterIn(tx, [0, 0], 1)
    );
    const untagged = structuredClone(carol);

    untagged.children[1].authored = (
      untagged.children[1].authored as Array<{ key?: string }>
    ).filter((mark) => mark.key !== 'type');
    const rejected = (value: unknown) =>
      lines(
        decideIn(Titled, value, { action: 'reject', changes: ['carol'] }).value
      );

    assert.deepEqual(
      { tagged: rejected(carol), untagged: rejected(untagged) },
      { tagged: ['title: ab'], untagged: ['title: ab'] }
    );
  });

  it('stores the same url in every order when two changes write the left-out default on the halves of a rejected Enter', () => {
    const UrlU = defineEditorSchema('cuts-url-u', {
      elements: {
        link: {
          content: schema.content.text({ default: 'text', min: 1 }),
          inline: true,
        },
      },
      id: 'cuts-url-u',
      properties: [
        schema.elementProperty(
          'url',
          property.string({ default: 'u', omitDefault: true }),
          { target: target.type('link') }
        ),
      ],
      root: schema.content.not(schema.content.text()),
      unknown: 'preserve',
      version: 1,
    });
    const carol = commit(
      UrlU,
      [linked({ children: [{ text: 'ab' }], type: 'link' })],
      'carol',
      'propose',
      (tx) => enterIn(tx, [0, 1, 0], 1)
    );
    const alice = commit(UrlU, carol, 'alice', 'propose', (tx) =>
      tx.nodes.set({ url: 'u' } as never, { at: [0, 1] })
    );
    const value = commit(UrlU, alice, 'bob', 'propose', (tx) =>
      tx.nodes.set({ url: 'u' } as never, { at: [1, 1] })
    );
    const rest = [
      { action: 'reject' as const, changes: ['alice'] },
      { action: 'accept' as const, changes: ['bob'] },
    ];
    const rejectCarol = { action: 'reject' as const, changes: ['carol'] };
    const stored = (nodes: readonly Node[]) =>
      linkPaths(nodes).map(
        ([block, child]) => nodes[block].children?.[child].url ?? null
      );

    assert.deepEqual(
      {
        alone: decideIn(UrlU, value, rejectCarol).result.status,
        batch: stored(decideIn(UrlU, value, [rejectCarol, ...rest]).value),
        last: stored(
          decideIn(UrlU, decideIn(UrlU, value, rest).value, rejectCarol).value
        ),
      },
      { alone: 'blocked', batch: ['u'], last: ['u'] }
    );
  });

  it('keeps apart at once the halves of a rejected split that Editing wrote different refs on', () => {
    const carol = commit(
      RefW,
      [linked(link('ab', 'u', { ref: 'r1' }))],
      'carol',
      'propose',
      (tx) => splitLink(tx, [0, 1, 0])
    );
    const [left, right] = linkPaths(carol.children);
    const ed = commit(RefW, carol, 'ed', 'edit', (tx) =>
      tx.nodes.set({ ref: 'z' } as never, { at: right })
    );
    const frank = commit(RefW, ed, 'frank', 'edit', (tx) => {
      tx.nodes.set({ ref: 'v' } as never, { at: left });
      tx.nodes.set({ ref: 'w' } as never, { at: right });
    });
    const { editor, result, value } = decideIn(RefW, frank, {
      action: 'reject',
      changes: ['carol'],
    });
    const read = editor.read.schema as unknown as {
      getProperty: (node: unknown, key: string, at: unknown) => unknown;
    };

    assert.deepEqual(
      {
        refs: linkPaths(value).map(([block, child]) =>
          read.getProperty(value[block].children?.[child], 'ref', {
            ancestors: [value[block]],
            parent: value[block],
          })
        ),
        status: result.status,
      },
      { refs: ['v', 'w'], status: 'applied' }
    );
  });

  const rejectedOverAFork = (
    removesLeft: boolean,
    winner: 'alice' | 'bob',
    leftRef?: string
  ) => {
    const RefFilled = defineEditorSchema('cuts-ref-filled', {
      elements: {
        link: {
          content: schema.content.text({ default: 'text', min: 1 }),
          inline: true,
        },
      },
      id: 'cuts-ref-filled',
      properties: [
        schema.elementProperty('url', property.string(), {
          target: target.type('link'),
        }),
        schema.elementProperty('ref', property.string({ default: 'w' }), {
          split: 'drop',
          target: target.type('link'),
        }),
      ],
      root: schema.content.not(schema.content.text()),
      unknown: 'preserve',
      version: 1,
    });
    const carol = commit(
      RefFilled,
      [linked(link('ab', 'u', { ref: 'r1' }))],
      'carol',
      'propose',
      (tx) => splitLink(tx, [0, 1, 0])
    );
    const [left, right] = linkPaths(carol.children);
    const ed = commit(RefFilled, carol, 'ed', 'edit', (tx) => {
      tx.nodes.set({ ref: 'r0' } as never, { at: right });
      if (leftRef) tx.nodes.set({ ref: leftRef } as never, { at: left });
      if (removesLeft) tx.nodes.remove({ at: left });
    });
    const at = getDefined(linkPaths(ed.children).at(-1));
    const [block = 0, child = 0] = at;
    const written = (author: string, ref: string, rank: string) => {
      const { children } = commit(RefFilled, ed, author, 'propose', (tx) =>
        tx.nodes.set({ ref } as never, { at })
      );
      const node = getDefined(children[block]?.children?.[child]);
      const marks = node.authored as Array<{ change: string; id: string }>;
      const own = getDefined(marks.find((mark) => mark.change === author));

      return { node, tag: withIdRank(own, rank) };
    };
    // Yjs keeps both tags as one fork and lets either write win the value,
    // while Alice's tag has the smaller id.
    const alice = written('alice', 'w', '0');
    const bob = written('bob', 'r2', '1');
    const won = winner === 'alice' ? alice : bob;
    const marks = (won.node.authored as Array<{ change: string }>).filter(
      (mark) => mark.change !== winner
    );
    const forked = structuredClone(ed);

    getDefined(forked.children[block]?.children)[child] = {
      ...won.node,
      authored: [...marks, alice.tag, bob.tag],
    };
    const accepted = decideIn(RefFilled, forked, {
      action: 'accept',
      changes: ['alice', 'bob'],
    }).editor.read.value();

    return decideIn(RefFilled, accepted, {
      action: 'reject',
      changes: ['carol'],
    }).value;
  };

  it('keeps the accepted value of a concurrent pair of writes on the right half when one of them writes the filled default and the split is rejected', () => {
    assert.deepEqual(shape(rejectedOverAFork(true, 'bob')), [['b@u#r2']]);
  });

  it('gives back the copied value when the filled default wins a concurrent pair of writes on the right half and the split is rejected', () => {
    assert.deepEqual(shape(rejectedOverAFork(true, 'alice')), [['b@u#r1']]);
  });

  it('keeps apart the halves of a rejected split when a concurrent pair of writes on the right half leaves a value other than the filled default', () => {
    assert.deepEqual(shape(rejectedOverAFork(false, 'bob')), [
      ['a@u#r1', 'b@u#r2'],
    ]);
  });

  it('joins the halves of a rejected split on the later value of the left half when the filled default wins a concurrent pair of writes on the right half', () => {
    assert.deepEqual(shape(rejectedOverAFork(false, 'alice', 'r7')), [
      ['ab@u#r7'],
    ]);
  });

  it('gives back the copied value when every branch of a fork on the right half removes the dropped key and the split is rejected', () => {
    const carol = commit(
      Links,
      [linked(link('ab', 'u', { ref: 'r1' }))],
      'carol',
      'propose',
      (tx) => splitLink(tx, [0, 1, 0])
    );
    const [left, right] = linkPaths(carol.children);
    const ed = commit(Links, carol, 'ed', 'edit', (tx) => {
      tx.nodes.set({ ref: 'r0' } as never, { at: right });
      tx.nodes.remove({ at: left });
    });
    const at = getDefined(linkPaths(ed.children).at(-1));
    const [block = 0, child = 0] = at;
    const nodeOf = (value: { children: Node[] }) =>
      getDefined(value.children[block]?.children?.[child]);
    const alice = commit(Links, ed, 'alice', 'propose', (tx) =>
      tx.nodes.set({ ref: 'r2' } as never, { at })
    );
    const cat = commit(Links, alice, 'cat', 'propose', (tx) =>
      tx.nodes.unset('ref', { at })
    );
    const bob = commit(Links, ed, 'bob', 'propose', (tx) =>
      tx.nodes.unset('ref', { at })
    );
    const bobTag = getDefined(
      (nodeOf(bob).authored as Array<{ change: string; id: string }>).find(
        (mark) => mark.change === 'bob'
      )
    );
    const forked = structuredClone(cat);

    getDefined(forked.children[block]?.children)[child] = {
      ...nodeOf(cat),
      authored: [
        ...(nodeOf(cat).authored as unknown[]),
        withIdRank(bobTag, '1'),
      ],
    };
    const accepted = decideIn(Links, forked, {
      action: 'accept',
      changes: ['alice', 'bob', 'cat'],
    }).editor.read.value();

    assert.deepEqual(
      shape(
        decideIn(Links, accepted, { action: 'reject', changes: ['carol'] })
          .value
      ),
      [['b@u#r1']]
    );
  });

  const forkBobWins = (
    value: unknown,
    at: number[],
    alice: string | null,
    bob: string
  ) => {
    const [block = 0, child = 0] = at;
    const written = (author: string, ref: string | null, rank: string) => {
      const after = commit(Links, value, author, 'propose', (tx) =>
        ref === null
          ? tx.nodes.unset('ref', { at })
          : tx.nodes.set({ ref } as never, { at })
      );
      const node = getDefined(after.children[block]?.children?.[child]);
      const marks = node.authored as Array<{ change: string; id: string }>;
      const own = getDefined(marks.find((mark) => mark.change === author));

      return { after, node, tag: withIdRank(own, rank) };
    };
    const first = written('alice', alice, '0');
    const second = written('bob', bob, '1');
    const result = structuredClone(second.after);

    getDefined(result.children[block]?.children)[child] = {
      ...second.node,
      authored: [
        ...(second.node.authored as Array<{ change: string }>).filter(
          (mark) => mark.change !== 'bob'
        ),
        first.tag,
        second.tag,
      ],
    };

    return result;
  };
  const rejectedOverACopiedFork = (alice: string | null) => {
    const start = [linked(link('ab', 'u', { ref: 'r1' }))];
    const carol = commit(
      Links,
      forkBobWins(start, getDefined(linkPaths(start)[0]), alice, 'r3'),
      'carol',
      'propose',
      (tx) => splitLink(tx, [0, 1, 0])
    );
    const accepted = decideIn(Links, carol, {
      action: 'accept',
      changes: ['alice', 'bob'],
    }).editor.read.value();
    const removed = commit(Links, accepted, 'ed', 'edit', (tx) =>
      tx.nodes.remove({ at: getDefined(linkPaths(carol.children)[0]) })
    );

    return decideIn(Links, removed, { action: 'reject', changes: ['carol'] })
      .value;
  };

  it('gives back the value a fork the split copied settled on, not the write with the smaller id', () => {
    assert.deepEqual(shape(rejectedOverACopiedFork('r2')), [['b@u#r3']]);
  });

  it('gives back the value a fork the split copied settled on when its other write removes the ref', () => {
    assert.deepEqual(shape(rejectedOverACopiedFork(null)), [['b@u#r3']]);
  });

  it('gives back the value an accepted fork settled on through a chain of rejected splits, in every order', () => {
    const carol = commit(
      Links,
      [linked(link('abc', 'u', { ref: 'r1' }))],
      'carol',
      'propose',
      (tx) => splitLink(tx, [0, 1, 0])
    );
    const right = getDefined(linkPaths(carol.children)[1]);
    const accepted = decideIn(Links, forkBobWins(carol, right, 'r3', 'r2'), {
      action: 'accept',
      changes: ['alice', 'bob'],
    }).editor.read.value();
    const cat = commit(Links, accepted, 'cat', 'propose', (tx) =>
      splitLink(tx, [...right, 0])
    );
    const [a = [], b = []] = linkPaths(cat.children);
    const removed = commit(Links, cat, 'ed', 'edit', (tx) => {
      tx.nodes.remove({ at: b });
      tx.nodes.remove({ at: a });
    });
    const inTurn = (first: string, second: string) =>
      decideIn(
        Links,
        decideIn(Links, removed, {
          action: 'reject',
          changes: [first],
        }).editor.read.value(),
        { action: 'reject', changes: [second] }
      ).value;

    assert.deepEqual(
      {
        atOnce: shape(
          decideIn(Links, removed, {
            action: 'reject',
            changes: ['carol', 'cat'],
          }).value
        ),
        carolFirst: shape(inTurn('carol', 'cat')),
        catFirst: shape(inTurn('cat', 'carol')),
      },
      {
        atOnce: [['c@u#r2']],
        carolFirst: [['c@u#r2']],
        catFirst: [['c@u#r2']],
      }
    );
  });
});

describe('rejected cuts give back what the split took', () => {
  const change = (
    value: unknown,
    author: string,
    intent: 'edit' | 'propose',
    run: (tx: EditorUpdateTransaction, links: number[][]) => void
  ) => {
    const editor = editorFor(value, author, intent);
    const links = linkPaths(editor.read.value().children);

    editor.update((tx) => run(tx, links));

    return editor.read.value();
  };
  const after = (value: unknown, ...steps: Array<Decision | Decision[]>) => {
    let current = value;

    for (const step of steps) current = decide(current, step).document;

    return shape((current as { children: Node[] }).children);
  };
  const accept = (...changes: string[]) => ({
    action: 'accept' as const,
    changes,
  });
  const reject = (...changes: string[]) => ({
    action: 'reject' as const,
    changes,
  });
  const start = () => [linked(link('ab', 'u', { ref: 'r1' }))];
  const cut = (value: unknown) =>
    change(value, 'carol', 'propose', (tx) => splitLink(tx, [0, 1, 0]));
  const bobOnWhole = () =>
    change(start(), 'bob', 'propose', (tx) =>
      tx.nodes.set({ ref: 'r2' } as never, { at: [0, 1] })
    );
  // Carol's Enter, with an Editing Enter that keeps its halves in two blocks.
  const inTwoBlocks = () => {
    const carol = editorFor(start(), 'carol');

    enter(carol, [0, 1, 0], 1);

    return change(carol.read.value(), 'eve', 'edit', (tx) => {
      const at = { offset: 0, path: [1, 0] };

      tx.selection.set({ anchor: at, focus: at });
      tx.break.insert();
    });
  };

  it('gives the right half the ref of a removed left half after a suggestion made before the split is rejected, in every order', () => {
    const value = change(cut(bobOnWhole()), 'dave', 'propose', (tx, [left]) =>
      tx.nodes.remove({ at: left ?? [] })
    );
    const removal = [accept('dave:1'), reject('carol:1')];

    assert.deepEqual(
      {
        batch: after(value, [...removal, reject('bob:1')]),
        bobFirst: after(value, reject('bob:1'), removal),
        bobLast: after(value, removal, reject('bob:1')),
      },
      {
        batch: [['b@u#r1']],
        bobFirst: [['b@u#r1']],
        bobLast: [['b@u#r1']],
      }
    );
  });

  it('lets a suggestion made before the split decide the right half after the left half is removed directly', () => {
    const value = change(cut(bobOnWhole()), 'ed', 'edit', (tx, [left]) =>
      tx.nodes.remove({ at: left ?? [] })
    );
    const rejected = decide(value, reject('carol:1')).document;

    assert.deepEqual(
      {
        accepted: after(rejected, accept('bob:1')),
        pending: after(rejected),
        rejected: after(rejected, reject('bob:1')),
      },
      {
        accepted: [['b@u#r2']],
        pending: [['b@u#r2']],
        rejected: [['b@u#r1']],
      }
    );
  });

  it('gives the right half the value from before the split, never a direct write the left half took after it', () => {
    const bobRejected = decide(cut(bobOnWhole()), reject('bob:1')).document;
    const rewritten = change(cut(start()), 'ed', 'edit', (tx, [left]) =>
      tx.nodes.set({ ref: 'r7' } as never, { at: left ?? [] })
    );
    const removed = change(bobRejected, 'ed', 'edit', (tx, [left]) => {
      tx.nodes.set({ ref: 'r9' } as never, { at: left ?? [] });
      tx.nodes.remove({ at: left ?? [] });
    });

    assert.deepEqual(
      {
        joined: after(rewritten, reject('carol:1')),
        removed: after(removed, reject('carol:1')),
      },
      { joined: [['ab@u#r7']], removed: [['b@u#r1']] }
    );
  });

  it('gives the ref back over a value Editing wrote and removed again on the right half', () => {
    const written = change(cut(start()), 'ed', 'edit', (tx, [, right]) =>
      tx.nodes.set({ ref: 'r8' } as never, { at: right ?? [] })
    );
    const unset = change(written, 'ed', 'edit', (tx, [, right]) =>
      tx.nodes.unset('ref', { at: right ?? [] })
    );
    const value = change(unset, 'ed', 'edit', (tx, [left]) =>
      tx.nodes.remove({ at: left ?? [] })
    );

    assert.deepEqual(after(value, reject('carol:1')), [['b@u#r1']]);
  });

  it("keeps the split's own later write on the right half when a suggestion beneath it is rejected, in every order", () => {
    const value = change(
      cut(bobOnWhole()),
      'carol',
      'propose',
      (tx, [, right]) =>
        tx.nodes.set({ ref: 'r2' } as never, { at: right ?? [] })
    );
    const kept = [['a@u#r1', 'b@u#r2']];

    assert.deepEqual(
      everyOrder(value, { 'bob:1': 'reject', 'carol:1': 'accept' }),
      {
        batch: kept,
        orders: [
          { shape: kept, waiting: [] },
          { shape: kept, waiting: [] },
        ],
      }
    );
  });

  it("rejects each of two cuts of one link alone when the later cut's change also removes the first piece", () => {
    const first = change(
      [linked(link('abc', 'u', { ref: 'r1' }))],
      'carol',
      'propose',
      (tx) => splitLink(tx, [0, 1, 0])
    );
    const value = change(first, 'cat', 'propose', (tx, [left, rest]) => {
      splitLink(tx, [...(rest ?? []), 0]);
      tx.nodes.remove({ at: left ?? [] });
    });
    const joined = [['abc@u#r1']];

    assert.deepEqual(
      everyOrder(value, { 'carol:1': 'reject', 'cat:1': 'reject' }),
      {
        batch: joined,
        orders: [
          { shape: joined, waiting: [] },
          { shape: joined, waiting: [] },
        ],
      }
    );
  });

  it('keeps the dropped ref on the left half alone when the halves of a rejected split stay apart, in every order', () => {
    const value = change(
      cut(start()),
      'alice',
      'propose',
      (tx, [left, right]) => {
        tx.nodes.set({ url: 'v' } as never, { at: left ?? [] });
        tx.nodes.set({ url: 'w' } as never, { at: right ?? [] });
      }
    );
    const apart = [['a@v#r1', 'b@w']];

    assert.deepEqual(
      everyOrder(value, { 'alice:1': 'accept', 'carol:1': 'reject' }),
      {
        batch: apart,
        orders: [
          { shape: apart, waiting: [] },
          { shape: apart, waiting: [] },
        ],
      }
    );
  });

  it('gives no ref back to the right half of a rejected Enter in another block when only the left half’s own pending removal removes it, in every order', () => {
    const value = change(inTwoBlocks(), 'dave', 'propose', (tx, [left]) =>
      tx.nodes.remove({ at: left ?? [] })
    );
    const apart = [[], ['b@u']];

    assert.deepEqual(
      everyOrder(value, { 'carol:1': 'reject', 'dave:1': 'accept' }),
      {
        batch: apart,
        orders: [
          { shape: apart, waiting: [] },
          { shape: apart, waiting: [] },
        ],
      }
    );
  });

  it('gives the ref back to the right half of a rejected Enter in another block when the left half goes with its block, in every order', () => {
    const value = change(inTwoBlocks(), 'dave', 'propose', (tx) =>
      tx.nodes.remove({ at: [0] })
    );
    const givenBack = [[], ['b@u#r1']];

    assert.deepEqual(
      everyOrder(value, { 'carol:1': 'reject', 'dave:1': 'accept' }),
      {
        batch: givenBack,
        orders: [
          { shape: givenBack, waiting: [] },
          { shape: givenBack, waiting: [] },
        ],
      }
    );
  });

  it("decides a rejected cut one step at a time as at once while the right half's own write is pending", () => {
    const alice = change(
      cut(start()),
      'alice',
      'propose',
      (tx, [left, right]) => {
        tx.nodes.set({ ref: 'v1' } as never, { at: right ?? [] });
        tx.nodes.remove({ at: left ?? [] });
      }
    );
    const bob = change(alice, 'bob', 'propose', (tx, links) =>
      tx.nodes.unset('ref', { at: links.at(-1) ?? [] })
    );
    const value = change(bob, 'dave', 'propose', (tx, links) =>
      tx.nodes.set({ ref: 'v2' } as never, { at: links.at(-1) ?? [] })
    );
    const decided = [reject('carol:1'), accept('alice:1')];

    assert.deepEqual(
      {
        batch: after(value, [...decided, reject('dave:1')]),
        steps: after(value, decided, reject('dave:1')),
      },
      { batch: [['b@u']], steps: [['b@u']] }
    );
  });

  it("gives a right half that stays apart no ref when a write over the split's output is rejected, in every order", () => {
    const apart = change(cut(start()), 'ed', 'edit', (tx, [, right]) =>
      tx.nodes.set({ url: 'w' } as never, { at: right ?? [] })
    );
    const value = change(apart, 'alice', 'propose', (tx, [, right]) =>
      tx.nodes.set({ ref: 'r3' } as never, { at: right ?? [] })
    );
    const kept = [['a@u#r1', 'b@w']];

    assert.deepEqual(
      everyOrder(value, { 'alice:1': 'reject', 'carol:1': 'reject' }),
      {
        batch: kept,
        orders: [
          { shape: kept, waiting: [] },
          { shape: kept, waiting: [] },
        ],
      }
    );
  });

  it("keeps the right half's accepted write above a given-back write that is decided later", () => {
    const unset = change(start(), 'bob', 'propose', (tx) =>
      tx.nodes.unset('ref', { at: [0, 1] })
    );
    const dan = change(unset, 'dan', 'propose', (tx) =>
      tx.nodes.set({ ref: 'v1' } as never, { at: [0, 1] })
    );
    const written = change(cut(dan), 'alice', 'propose', (tx, [, right]) =>
      tx.nodes.set({ ref: 'v2' } as never, { at: right ?? [] })
    );
    const value = change(written, 'alice', 'propose', (tx, [left]) =>
      tx.nodes.remove({ at: left ?? [] })
    );
    const decided = [reject('carol:1'), accept('dan:1', 'alice:1')];

    assert.deepEqual(
      {
        atOnce: after(value, [...decided, reject('bob:1')]),
        inTurn: after(value, decided, reject('bob:1')),
      },
      { atOnce: [['b@u#v2']], inTurn: [['b@u#v2']] }
    );
  });

  it("copies the splitter's own earlier write, so an accepted split leaves the right half no ref", () => {
    const bob = change(start(), 'bob', 'propose', (tx) =>
      tx.nodes.unset('ref', { at: [0, 1] })
    );
    const value = change(bob, 'carol', 'propose', (tx) => {
      tx.nodes.set({ ref: 'r5' } as never, { at: [0, 1] });
      splitLink(tx, [0, 1, 0]);
    });

    assert.deepEqual(after(value, [accept('carol:1'), reject('bob:1')]), [
      ['a@u#r5', 'b@u'],
    ]);
  });

  it("gives back the splitter's accepted earlier change once the left half is removed", () => {
    const carol = editorFor(start(), 'carol');

    carol.update((tx) => tx.nodes.set({ ref: 'r5' } as never, { at: [0, 1] }));
    carol.update((tx) => splitLink(tx, [0, 1, 0]));
    const value = change(carol.read.value(), 'ed', 'edit', (tx, [left]) =>
      tx.nodes.remove({ at: left ?? [] })
    );

    assert.deepEqual(after(value, [accept('carol:1'), reject('carol:2')]), [
      ['b@u#r5'],
    ]);
  });

  it('leaves the last piece no ref when a later split that wrote the ref first is accepted and the earlier split rejected', () => {
    const first = change(
      [linked(link('abc', 'u', { ref: 'r1' }))],
      'carol',
      'propose',
      (tx) => splitLink(tx, [0, 1, 0])
    );
    const cat = change(first, 'cat', 'propose', (tx, [, right]) => {
      tx.nodes.set({ ref: 'r9' } as never, { at: right ?? [] });
      splitLink(tx, [...(right ?? []), 0]);
    });
    const value = change(cat, 'ed', 'edit', (tx, [left]) =>
      tx.nodes.remove({ at: left ?? [] })
    );

    assert.deepEqual(after(value, [accept('cat:1'), reject('carol:1')]), [
      ['b@u#r9', 'c@u'],
    ]);
  });

  it('withdraws a split whose copy is pending without bringing the split back', () => {
    const value = change(cut(bobOnWhole()), 'ed', 'edit', (tx, [left]) =>
      tx.nodes.remove({ at: left ?? [] })
    );
    const carol = editorFor(value, 'carol');
    const status = carol.update((tx) =>
      tx.authored.withdraw([getDefined(carol.read.authored.change('carol:1'))])
    );
    const withdrawn = carol.read.value();
    const pending = editorFor(withdrawn, 'zed', 'edit')
      .read.authored.changes()
      .items.map((item) => item.id);

    assert.deepEqual(
      {
        pending,
        rejected: after(withdrawn, reject('bob:1')),
        status: status.status,
        stored: after(withdrawn),
      },
      {
        pending: ['bob:1'],
        rejected: [['b@u#r1']],
        status: 'applied',
        stored: [['b@u#r2']],
      }
    );
  });

  it('keeps a later direct write on the last piece when a suggestion under two rejected splits is decided last', () => {
    const alice = change(
      [linked(link('abc', 'u', { ref: 'r1' }))],
      'alice',
      'propose',
      (tx) => tx.nodes.set({ ref: 'w' } as never, { at: [0, 1] })
    );
    const carol = change(alice, 'carol', 'propose', (tx) =>
      splitLink(tx, [0, 1, 0])
    );
    const bob = change(carol, 'bob', 'propose', (tx, [, right]) =>
      tx.nodes.set({ ref: 'q' } as never, { at: right ?? [] })
    );
    const cat = change(bob, 'cat', 'propose', (tx, [, right]) =>
      splitLink(tx, [...(right ?? []), 0])
    );
    const ed = change(cat, 'ed', 'edit', (tx, links) =>
      tx.nodes.set({ ref: 'v' } as never, { at: links.at(-1) ?? [] })
    );
    const value = change(ed, 'ed', 'edit', (tx, [first, second]) => {
      tx.nodes.remove({ at: second ?? [] });
      tx.nodes.remove({ at: first ?? [] });
    });

    assert.deepEqual(
      {
        atOnce: after(value, [
          accept('alice:1', 'bob:1'),
          reject('carol:1', 'cat:1'),
        ]),
        inTurn: after(
          value,
          reject('carol:1'),
          accept('bob:1'),
          reject('cat:1'),
          accept('alice:1')
        ),
      },
      { atOnce: [['c@u#v']], inTurn: [['c@u#v']] }
    );
  });

  it('stores no tag on the right half once the split is accepted and a suggestion under it rejected', () => {
    const decided = decide(cut(bobOnWhole()), [
      accept('carol:1'),
      reject('bob:1'),
    ]).value;
    const [, right = []] = linkPaths(decided);
    const [block = 0, at = 0] = right;

    assert.deepEqual(decided[block]?.children?.[at]?.authored ?? [], []);
  });

  describe('a split of a right half whose rejected split waits on a write over it', () => {
    const split = () =>
      change(
        [linked(link('abc', 'u', { ref: 'r1' }))],
        'carol',
        'propose',
        (tx) => splitLink(tx, [0, 1, 0])
      );
    const open = (write = (value: unknown) => value) => {
      const written = change(split(), 'ed', 'edit', (tx, [, right]) =>
        tx.nodes.set({ ref: 'r8' } as never, { at: right ?? [] })
      );
      const unset = change(written, 'ed', 'edit', (tx, [, right]) =>
        tx.nodes.unset('ref', { at: right ?? [] })
      );
      const removed = change(unset, 'ed', 'edit', (tx, [left]) =>
        tx.nodes.remove({ at: left ?? [] })
      );
      const alice = change(removed, 'alice', 'propose', (tx, links) =>
        tx.nodes.set({ ref: 'v' } as never, { at: links.at(-1) ?? [] })
      );

      return decide(write(alice), reject('carol:1')).document;
    };

    it('gives back the ref the earlier split took when the later split and the write are rejected, in every order', () => {
      const cat = change(open(), 'cat', 'propose', (tx, links) =>
        splitLink(tx, [...(links.at(-1) ?? []), 0])
      );
      const value = change(cat, 'ed', 'edit', (tx, [left]) =>
        tx.nodes.remove({ at: left ?? [] })
      );
      const givenBack = [['c@u#r1']];

      assert.deepEqual(
        everyOrder(value, { 'alice:1': 'reject', 'cat:1': 'reject' }),
        {
          batch: givenBack,
          orders: [
            { shape: givenBack, waiting: [] },
            { shape: givenBack, waiting: [] },
          ],
        }
      );
    });

    it('gives back the ref the earlier split took when a write over its history is rejected last', () => {
      const bob = (value: unknown) =>
        change(value, 'bob', 'propose', (tx, links) =>
          tx.nodes.set({ ref: 'w' } as never, { at: links.at(-1) ?? [] })
        );
      const cat = change(open(bob), 'cat', 'propose', (tx, links) =>
        splitLink(tx, [...(links.at(-1) ?? []), 0])
      );
      const value = change(cat, 'ed', 'edit', (tx, [left]) =>
        tx.nodes.remove({ at: left ?? [] })
      );

      assert.deepEqual(
        {
          atOnce: after(value, [reject('alice:1', 'bob:1', 'cat:1')]),
          inTurn: after(
            value,
            reject('alice:1'),
            reject('cat:1'),
            reject('bob:1')
          ),
        },
        { atOnce: [['c@u#r1']], inTurn: [['c@u#r1']] }
      );
    });

    it('reviews the accepted ref as rejecting the write gives it', () => {
      const value = open();
      const reader = editorFor(value, 'zed', 'edit');
      const [path = []] = linkPaths(reader.read.value().children);
      const [block = 0, at = 0] = path;
      const node = (reader.read.value().children as Node[])[block]?.children?.[
        at
      ];

      assert.deepEqual(
        {
          accepted:
            (reader as unknown as AuthoredRead).read.authored.reviewOf(node)
              .accepted.ref ?? null,
          rejected: after(value, reject('alice:1')),
        },
        { accepted: 'r1', rejected: [['bc@u#r1']] }
      );
    });

    it('joins the halves of a second rejected split at once as in turn', () => {
      const written = change(split(), 'ed', 'edit', (tx, [, right]) =>
        tx.nodes.set({ ref: 'r2' } as never, { at: right ?? [] })
      );
      const bob = change(written, 'bob', 'propose', (tx, [, right]) =>
        tx.nodes.unset('ref', { at: right ?? [] })
      );
      const cat = change(bob, 'cat', 'propose', (tx, [, right]) =>
        splitLink(tx, [...(right ?? []), 0])
      );
      const set = change(cat, 'ed', 'edit', (tx, links) =>
        tx.nodes.set({ ref: 'r1' } as never, { at: links.at(-1) ?? [] })
      );
      const removed = change(set, 'ed', 'edit', (tx, [left]) =>
        tx.nodes.remove({ at: left ?? [] })
      );
      const value = decide(removed, reject('carol:1')).document;

      assert.deepEqual(
        {
          steps: after(value, accept('bob:1'), reject('cat:1')),
          together: after(value, [accept('bob:1'), reject('cat:1')]),
        },
        { steps: [['bc@u#r1']], together: [['bc@u#r1']] }
      );
    });
  });
});

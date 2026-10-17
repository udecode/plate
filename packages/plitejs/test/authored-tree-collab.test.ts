import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';

import {
  createEditor,
  definePlugin,
  defineEditorSchema,
  type EditorUpdateTransaction,
  property,
  schema,
  target,
} from 'plitejs';
import { history } from 'plitejs/history';
import * as Y from 'yjs';

import { createAuthoredPlugin } from '../src/authored/authored';
import { expandContexts } from '../src/authored/facts/compact';
import { yjs } from '../src/yjs';
import { getActiveYjsController } from '../src/yjs/core/controller-registry';
import { authoredTestApi } from './support/authored';

// Phase 1 of docs/plans/2026-10-08-authored-review.md: two clients on the
// ordinary Yjs binding. Each case asserts convergence and prints its outcome
// as `case <name>: <json>` for the plan's record.

const AT = 1000;
const documents = new Set<Y.Doc>();

const Columns = defineEditorSchema('collab-columns', {
  elements: {
    column: { content: schema.content.type('paragraph', { min: 1 }) },
    column_group: { content: schema.content.type('column', { min: 2 }) },
    paragraph: { content: schema.content.text() },
  },
  id: 'collab-columns',
  root: schema.content.any(
    [schema.content.type('paragraph'), schema.content.type('column_group')],
    { default: { type: 'paragraph' }, min: 1 }
  ),
  unknown: 'reject',
  version: 1,
});

afterEach(() => {
  for (const doc of documents) doc.destroy();
  documents.clear();
});

type Intent = 'edit' | 'propose';

const counter = (author: string) => {
  let count = 0;

  return () => {
    count += 1;

    return `${author}:${count}`;
  };
};
type Peer = ReturnType<typeof createPeer>;

const createPeer = (
  authorId: string,
  doc: Y.Doc,
  initialValue:
    | Array<Record<string, unknown>>
    | Readonly<{ children: unknown[]; roots?: Record<string, unknown[]> }>,
  intent: Intent,
  plugins: ReadonlyArray<typeof Columns> = []
) => {
  const editor = createEditor({
    plugins: [
      ...plugins,
      createAuthoredPlugin({
        authorId,
        createChangeId: counter(authorId),
        intent,
        now: () => AT,
      }),
      history(),
      yjs({
        doc,
        initialReady: true,
        rootName: 'authored-tree',
        ...(doc.share.size === 0 ? { seed: true as const } : {}),
      }),
    ],
    initialValue,
  });
  let updates = 0;

  doc.on('update', () => {
    updates += 1;
  });

  return { doc, editor, updates: () => updates };
};

/** Deliver what `to` has not seen from `from`, through the ordinary binding. */
const deliver = (from: Peer, to: Peer) => {
  Y.applyUpdate(
    to.doc,
    Y.encodeStateAsUpdate(from.doc, Y.encodeStateVector(to.doc))
  );
  const controller = getActiveYjsController(to.editor);

  assert.ok(controller, 'expected the ordinary Yjs binding');
  controller.debugProcessAvailableInput();
};

const pair = (
  value: Array<Record<string, unknown>>,
  intents: [Intent, Intent] = ['propose', 'propose'],
  plugins: ReadonlyArray<typeof Columns> = []
) => {
  const leftDoc = new Y.Doc();
  const rightDoc = new Y.Doc();

  documents.add(leftDoc);
  documents.add(rightDoc);
  const alice = createPeer('alice', leftDoc, value, intents[0], plugins);

  Y.applyUpdate(rightDoc, Y.encodeStateAsUpdate(leftDoc));
  const bob = createPeer(
    'bob',
    rightDoc,
    JSON.parse(JSON.stringify(alice.editor.read.value())),
    intents[1],
    plugins
  );

  deliver(bob, alice);

  return { alice, bob };
};

const api = (peer: Peer) => authoredTestApi(peer.editor);

const paragraph = (...children: Array<Record<string, unknown>>) => ({
  type: 'paragraph',
  children,
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

/** Converged children, or a failure naming both. */
const converged = (alice: Peer, bob: Peer) => {
  assert.deepEqual(bob.editor.read.children(), alice.editor.read.children());

  return alice.editor.read.children();
};

// The plan records each case's outcome from the test output.
const record = (name: string, outcome: unknown) => {
  process.stdout.write(`case ${name}: ${JSON.stringify(outcome)}\n`);
};

const point = (offset: number, path = [0, 0]) => ({ offset, path });

describe('authored review tree on two clients', () => {
  it('converges a suggestion and its decision through the ordinary binding', () => {
    const { alice, bob } = pair([paragraph({ text: 'Base' })]);
    const before = alice.updates();

    alice.editor.update((tx) => tx.text.insert('!', { at: point(4) }));
    assert.ok(alice.updates() > before, 'the local edit reached the Yjs doc');
    deliver(alice, bob);
    const proposed = converged(alice, bob);

    assert.equal(
      api(bob).decide({ action: 'accept', changes: ['alice:1'] }).status,
      'applied'
    );
    deliver(bob, alice);
    const decided = converged(alice, bob);

    record('suggestion and decision converge', { decided, proposed });
    assert.deepEqual(decided, [paragraph({ text: 'Base!' })]);
  });

  const suggestions = {
    deletion: (peer: Peer) =>
      peer.editor.update((tx) =>
        tx.text.delete({ at: { anchor: point(1), focus: point(3) } })
      ),
    insertion: (peer: Peer) =>
      peer.editor.update((tx) => tx.text.insert('XY', { at: point(2) })),
    replacement: (peer: Peer) =>
      peer.editor.update((tx) => {
        tx.selection.set({ anchor: point(1), focus: point(3) });
        tx.text.insert('XY');
      }),
  };

  for (const [kind, suggest] of Object.entries(suggestions)) {
    for (const order of ['accept first', 'reject first'] as const) {
      it(`converges a concurrent accept and reject of a ${kind}, ${order}`, () => {
        const { alice, bob } = pair([paragraph({ text: 'Base' })]);

        suggest(alice);
        deliver(alice, bob);
        assert.equal(
          api(alice).decide({ action: 'accept', changes: ['alice:1'] }).status,
          'applied'
        );
        assert.equal(
          api(bob).decide({ action: 'reject', changes: ['alice:1'] }).status,
          'applied'
        );
        if (order === 'accept first') {
          deliver(alice, bob);
          deliver(bob, alice);
        } else {
          deliver(bob, alice);
          deliver(alice, bob);
        }

        record(
          `concurrent accept and reject of a ${kind}, ${order}`,
          converged(alice, bob)
        );
      });
    }
  }

  // The plain-editing control for the replacement: each peer removes one
  // leaf and a property from another, so its paragraph merges to one leaf.
  for (const order of ['left first', 'right first'] as const) {
    it(`records the plain-editing control for concurrent multi-leaf merges, ${order}`, () => {
      const { alice, bob } = pair(
        [
          paragraph(
            { text: 'B' },
            { bold: true, text: 'as' },
            { italic: true, text: 'XY' },
            { text: 'e' }
          ),
        ],
        ['edit', 'edit']
      );

      alice.editor.update((tx) => {
        tx.nodes.remove({ at: [0, 1] });
        tx.nodes.unset('italic', { at: [0, 1] });
      });
      bob.editor.update((tx) => {
        tx.nodes.remove({ at: [0, 2] });
        tx.nodes.unset('bold', { at: [0, 1] });
      });
      if (order === 'left first') {
        deliver(alice, bob);
        deliver(bob, alice);
      } else {
        deliver(bob, alice);
        deliver(alice, bob);
      }

      record(
        `plain-editing control for concurrent multi-leaf merges, ${order}`,
        converged(alice, bob)
      );
    });
  }

  const seeded = (kind: string, change = 'alice:1') => ({
    at: AT,
    author: change.split(':')[0],
    change,
    kind,
  });
  const decideBoth = (alice: Peer, bob: Peer, action: 'accept' | 'reject') => {
    const left = api(alice).decide({ action, changes: ['alice:1'] }).status;
    const right = api(bob).decide({ action, changes: ['alice:1'] }).status;
    const decided = alice.editor.read.children();

    deliver(alice, bob);
    deliver(bob, alice);

    return { decided, statuses: [left, right] };
  };
  const columnGroup = [
    {
      type: 'column_group',
      children: [
        { type: 'column', children: [paragraph({ text: 'left' })] },
        whole(
          { type: 'column', children: [paragraph({ text: 'right' })] },
          seeded('delete')
        ),
      ],
    },
  ];
  const structural: Array<
    [string, Array<Record<string, unknown>>, Array<typeof Columns>?]
  > = [
    [
      'split',
      [
        paragraph({ text: 'ab' }),
        { ...paragraph({ text: 'cd' }), authored: [seeded('split')] },
      ],
    ],
    [
      'join',
      [
        paragraph({ text: 'ab' }),
        { ...paragraph({ text: 'cd' }), authored: [seeded('join')] },
      ],
    ],
    [
      'wrap',
      [
        {
          type: 'quote',
          authored: [seeded('wrap')],
          children: [paragraph({ text: 'ab' })],
        },
      ],
    ],
    [
      'unwrap',
      [
        {
          type: 'quote',
          authored: [seeded('unwrap')],
          children: [paragraph({ text: 'ab' })],
        },
      ],
    ],
    [
      'column deletion that leaves a column group below its minimum',
      columnGroup,
      [Columns],
    ],
  ];

  for (const [kind, value, plugins] of structural) {
    for (const action of ['accept', 'reject'] as const) {
      it(`converges an identical concurrent ${action} of a ${kind}`, () => {
        const { alice, bob } = pair(value, undefined, plugins);
        const { decided, statuses } = decideBoth(alice, bob, action);
        const outcome = converged(alice, bob);

        record(`identical concurrent ${action} of a ${kind}`, {
          statuses,
          value: outcome,
        });
        assert.deepEqual(statuses, ['applied', 'applied']);
        assert.deepEqual(outcome, decided);
      });
    }
  }

  it('records a peer typing in the surviving column while a decision builds a column beside it', () => {
    const { alice, bob } = pair(columnGroup, ['propose', 'edit'], [Columns]);
    const { status } = api(alice).decide({
      action: 'accept',
      changes: ['alice:1'],
    });

    bob.editor.update((tx) =>
      tx.text.insert('Z', { at: point(4, [0, 0, 0, 0]) })
    );
    deliver(alice, bob);
    deliver(bob, alice);
    record('peer typing in the surviving column during the decision', {
      status,
      value: converged(alice, bob),
    });
    assert.equal(status, 'applied');
    assert.deepEqual(alice.editor.read.children(), [
      {
        type: 'column_group',
        children: [
          { type: 'column', children: [paragraph({ text: 'leftZ' })] },
          { type: 'column', children: [paragraph({ text: '' })] },
        ],
      },
    ]);
  });

  it('converges an overlapping batch accept and reject', () => {
    const { alice, bob } = pair([
      paragraph(
        { authored: [seeded('insert', 'alice:1')], text: 'one ' },
        { authored: [seeded('insert', 'alice:2')], text: 'two ' },
        { authored: [seeded('insert', 'alice:3')], text: 'three' }
      ),
    ]);
    const left = api(alice).decide({
      action: 'accept',
      changes: ['alice:1', 'alice:2'],
    }).status;
    const right = api(bob).decide({
      action: 'reject',
      changes: ['alice:2', 'alice:3'],
    }).status;

    deliver(alice, bob);
    deliver(bob, alice);
    record('overlapping batch accept and reject', {
      statuses: [left, right],
      value: converged(alice, bob),
    });
  });

  for (const [subject, action] of [
    ['inline insertion', 'accept'],
    ['inline insertion', 'reject'],
    ['inserted block', 'accept'],
    ['inserted block', 'reject'],
  ] as const) {
    it(`converges an offline late amendment to ${action}ing an ${subject}`, () => {
      const { alice, bob } = pair([paragraph({ text: 'Base' })]);

      if (subject === 'inline insertion') {
        alice.editor.update((tx) => tx.text.insert('XY', { at: point(4) }));
      } else {
        alice.editor.update((tx) =>
          tx.nodes.insert(paragraph({ text: 'New' }), { at: [1] })
        );
      }
      deliver(alice, bob);
      const decided = api(bob).decide({ action, changes: ['alice:1'] }).status;

      alice.editor.update((tx) =>
        tx.text.insert('Z', {
          at:
            subject === 'inline insertion'
              ? point(1, [0, 1])
              : point(1, [1, 0]),
        })
      );
      deliver(bob, alice);
      deliver(alice, bob);
      record(`offline late amendment to ${action}ing an ${subject}`, {
        decided,
        value: converged(alice, bob),
      });
    });
  }

  for (const decision of [
    ['accept', 'reject'],
    ['reject', 'accept'],
  ] as const) {
    it(`converges concurrent format suggestions on one key, alice ${decision[0]}ed and bob ${decision[1]}ed`, () => {
      const { alice, bob } = pair([paragraph({ text: 'ab' })]);

      alice.editor.update((tx) =>
        tx.nodes.set({ color: 'red' }, { at: [0, 0] })
      );
      bob.editor.update((tx) =>
        tx.nodes.set({ color: 'blue' }, { at: [0, 0] })
      );
      deliver(alice, bob);
      deliver(bob, alice);
      const suggested = converged(alice, bob);
      const statuses = [
        api(alice).decide({ action: decision[0], changes: ['alice:1'] }).status,
        api(alice).decide({ action: decision[1], changes: ['bob:1'] }).status,
      ];

      deliver(alice, bob);
      record(
        `concurrent format suggestions on one key, alice ${decision[0]}ed and bob ${decision[1]}ed`,
        {
          statuses,
          suggested,
          value: converged(alice, bob),
        }
      );
    });
  }

  it('keeps a peer’s typing in the right block when a join is accepted, as plain editing does', () => {
    // Bob types in Editing on both pairs, so only the join differs.
    const authoredPair = pair(
      [
        paragraph({ text: 'ab' }),
        { ...paragraph({ text: 'cd' }), authored: [seeded('join')] },
      ],
      ['propose', 'edit']
    );
    const plainPair = pair(
      [paragraph({ text: 'ab' }), paragraph({ text: 'cd' })],
      ['edit', 'edit']
    );

    api(authoredPair.alice).decide({ action: 'accept', changes: ['alice:1'] });
    plainPair.alice.editor.update((tx) => tx.nodes.merge({ at: [1] }));
    for (const { bob } of [authoredPair, plainPair]) {
      bob.editor.update((tx) => tx.text.insert('Z', { at: point(2, [1, 0]) }));
    }
    for (const { alice, bob } of [authoredPair, plainPair]) {
      deliver(alice, bob);
      deliver(bob, alice);
    }
    const authored = converged(authoredPair.alice, authoredPair.bob);
    const plain = converged(plainPair.alice, plainPair.bob);

    record('join decision against a peer typing in the right block', {
      authored,
      plain,
    });
    assert.deepEqual(authored, plain);
  });

  for (const order of ['decision first', 'typing first'] as const) {
    it(`keeps a peer’s typing in an untouched leaf when an accept merges two other leaves, ${order}`, () => {
      const { alice, bob } = pair(
        [
          paragraph(
            { bold: true, text: 'A' },
            { text: 'B' },
            { authored: [seeded('insert')], text: 'C' }
          ),
        ],
        ['propose', 'edit']
      );

      api(alice).decide({ action: 'accept', changes: ['alice:1'] });
      bob.editor.update((tx) => tx.text.insert('X', { at: point(1) }));
      if (order === 'decision first') {
        deliver(alice, bob);
        deliver(bob, alice);
      } else {
        deliver(bob, alice);
        deliver(alice, bob);
      }

      assert.deepEqual(converged(alice, bob), [
        paragraph({ bold: true, text: 'AX' }, { text: 'BC' }),
      ]);
    });
  }

  it('records the multi-leaf merge loss that plain editing shares', () => {
    const plainPair = pair(
      [
        paragraph({ text: 'ab' }),
        paragraph({ text: 'c' }, { bold: true, text: 'd' }),
      ],
      ['edit', 'edit']
    );

    plainPair.alice.editor.update((tx) => tx.nodes.merge({ at: [1] }));
    plainPair.bob.editor.update((tx) =>
      tx.text.insert('Z', { at: point(1, [1, 1]) })
    );
    deliver(plainPair.alice, plainPair.bob);
    deliver(plainPair.bob, plainPair.alice);
    record(
      'plain-editing multi-leaf merge against a peer typing',
      converged(plainPair.alice, plainPair.bob)
    );
  });

  it('undoes a local decision after a remote edit inside the decided content', () => {
    const { alice, bob } = pair([paragraph({ text: 'Base' })]);

    alice.editor.update((tx) => tx.text.insert('XY', { at: point(4) }));
    deliver(alice, bob);
    api(alice).decide({ action: 'accept', changes: ['alice:1'] });
    deliver(alice, bob);
    api(bob).setIntent('edit');
    bob.editor.update((tx) => tx.text.insert('Z', { at: point(5) }));
    deliver(bob, alice);
    alice.editor.api.history.undo();
    deliver(alice, bob);
    record(
      'undo of a local decision after a remote edit inside it',
      converged(alice, bob)
    );
  });

  it('records the plain-editing control for an identical concurrent merge', () => {
    const { alice, bob } = pair(
      [paragraph({ text: 'ab' }), paragraph({ text: 'cd' })],
      ['edit', 'edit']
    );

    for (const peer of [alice, bob]) {
      peer.editor.update((tx) => tx.nodes.merge({ at: [1] }));
    }
    deliver(alice, bob);
    deliver(bob, alice);
    record(
      'plain-editing control for an identical concurrent merge',
      converged(alice, bob)
    );
  });
});

describe('authored review tree structure on two clients', () => {
  const Quotes = defineEditorSchema('collab-quotes', {
    elements: {
      paragraph: { content: schema.content.text() },
      quote: { content: schema.content.type('paragraph', { min: 1 }) },
    },
    id: 'collab-quotes',
    root: schema.content.any(
      [schema.content.type('paragraph'), schema.content.type('quote')],
      { default: { type: 'paragraph' }, min: 1 }
    ),
    unknown: 'reject',
    version: 1,
  });
  const seeded = (kind: string, change: string) => ({
    at: AT,
    author: change.split(':')[0],
    change,
    kind,
  });
  const text = (value: string) => ({ text: value });
  const syncInOrder = (alice: Peer, bob: Peer, aliceFirst: boolean) => {
    if (aliceFirst) {
      deliver(alice, bob);
      deliver(bob, alice);
    } else {
      deliver(bob, alice);
      deliver(alice, bob);
    }
  };

  for (const aliceFirst of [true, false]) {
    const order = aliceFirst
      ? "alice's delivered first"
      : "bob's delivered first";

    it(`blocks a join accept and an accept of its target's deletion on two clients, ${order}`, () => {
      const initial = [
        whole(paragraph(text('a')), seeded('delete', 'carol:1')),
        { ...paragraph(text('b')), authored: [seeded('join', 'carol:2')] },
      ];
      const { alice, bob } = pair(initial, ['edit', 'edit']);
      const statuses = [
        api(alice).decide({ action: 'accept', changes: ['carol:2'] }).status,
        api(bob).decide({ action: 'accept', changes: ['carol:1'] }).status,
      ];

      syncInOrder(alice, bob, aliceFirst);
      assert.deepEqual(statuses, ['blocked', 'blocked']);
      assert.deepEqual(converged(alice, bob), initial);
    });

    it(`applies two joins with a paragraph between them accepted on two clients, ${order}`, () => {
      const { alice, bob } = pair(
        [
          paragraph(text('a')),
          { ...paragraph(text('b')), authored: [seeded('join', 'carol:1')] },
          paragraph(text('c')),
          { ...paragraph(text('d')), authored: [seeded('join', 'carol:2')] },
        ],
        ['edit', 'edit']
      );
      const before = [alice.updates(), bob.updates()];

      assert.equal(
        api(alice).decide({ action: 'accept', changes: ['carol:1'] }).status,
        'applied'
      );
      assert.equal(
        api(bob).decide({ action: 'accept', changes: ['carol:2'] }).status,
        'applied'
      );
      assert.ok(alice.updates() > before[0] && bob.updates() > before[1]);
      syncInOrder(alice, bob, aliceFirst);
      assert.deepEqual(converged(alice, bob), [
        paragraph(text('ab')),
        paragraph(text('cd')),
      ]);
    });

    it(`keeps a paragraph inserted in Editing inside a quote whose suggested deletion is then accepted, beside the paragraph the deletion builds, ${order}`, () => {
      const { alice, bob } = pair(
        [{ type: 'quote', children: [paragraph(text('a'))] }],
        ['propose', 'edit'],
        [Quotes]
      );

      alice.editor.update((tx) => tx.nodes.remove({ at: [0] }));
      bob.editor.update((tx) =>
        tx.nodes.insert(paragraph(text('new')), { at: [0, 1] })
      );
      syncInOrder(alice, bob, aliceFirst);
      assert.equal(
        api(alice).decide({ action: 'accept', changes: ['alice:1'] }).status,
        'applied'
      );
      syncInOrder(alice, bob, aliceFirst);
      assert.deepEqual(converged(alice, bob), [
        { type: 'quote', children: [paragraph(text('new'))] },
        paragraph(text('')),
      ]);
    });
  }

  it('merges an accepted join into the nearest surviving block after a remote Editing deletion of its target', () => {
    const { alice, bob } = pair(
      [
        paragraph(text('a')),
        paragraph(text('b')),
        { ...paragraph(text('c')), authored: [seeded('join', 'carol:1')] },
      ],
      ['edit', 'edit']
    );

    bob.editor.update((tx) => tx.nodes.remove({ at: [1] }));
    deliver(bob, alice);
    assert.equal(
      api(alice).decide({ action: 'accept', changes: ['carol:1'] }).status,
      'applied'
    );
    deliver(alice, bob);
    assert.deepEqual(converged(alice, bob), [paragraph(text('ac'))]);
  });
});

describe('authored review tree concurrency limits on two clients', () => {
  reviewVerdictRaces(true);
  const text = (value: string) => ({ text: value });
  const deleted = {
    at: AT,
    author: 'alice',
    change: 'alice:1',
    kind: 'delete',
  };
  const inserted = { at: AT, author: 'bob', change: 'bob:1', kind: 'insert' };

  // Each limit: Alice suggests deleting a paragraph while Bob edits inside it.
  for (const [name, intent, run, expected] of [
    [
      'types inside its text in Editing, which gives the typed text the deletion',
      'edit',
      (tx: any) => tx.text.insert('X', { at: point(1) }),
      [whole(paragraph(text('aXb')), deleted), paragraph(text('z'))],
    ],
    [
      'types inside its text in Suggesting, which gives the typed text the deletion',
      'propose',
      (tx: any) => tx.text.insert('X', { at: point(1) }),
      [
        {
          ...paragraph(
            { authored: [deleted], text: 'a' },
            { authored: [deleted, inserted], text: 'X' },
            { authored: [deleted], text: 'b' }
          ),
          authored: [deleted],
        },
        paragraph(text('z')),
      ],
    ],
    [
      'presses Enter inside it in Editing, which leaves the new paragraph without the deletion',
      'edit',
      (tx: any) => {
        tx.selection.set({ anchor: point(1), focus: point(1) });
        tx.break.insert();
      },
      [
        whole(paragraph(text('a')), deleted),
        paragraph(text('b')),
        paragraph(text('z')),
      ],
    ],
  ] as const) {
    for (const aliceFirst of [true, false]) {
      it(`limits a suggested deletion of a paragraph while the other client ${name}, ${
        aliceFirst ? "alice's delivered first" : "bob's delivered first"
      }`, () => {
        const { alice, bob } = pair(
          [paragraph(text('ab')), paragraph(text('z'))],
          ['propose', intent]
        );

        alice.editor.update((tx) => tx.nodes.remove({ at: [0] }));
        bob.editor.update(run as never);
        if (aliceFirst) {
          deliver(alice, bob);
          deliver(bob, alice);
        } else {
          deliver(bob, alice);
          deliver(alice, bob);
        }
        assert.deepEqual(converged(alice, bob), expected);
      });
    }
  }

  for (const aliceFirst of [true, false]) {
    it(`limits a join accepted while the other client deletes its target in Editing, which loses the joined text, ${
      aliceFirst ? "alice's delivered first" : "bob's delivered first"
    }`, () => {
      const { alice, bob } = pair(
        [
          paragraph(text('a')),
          paragraph(text('b')),
          {
            ...paragraph(text('c')),
            authored: [
              { at: AT, author: 'carol', change: 'carol:1', kind: 'join' },
            ],
          },
        ],
        ['edit', 'edit']
      );

      bob.editor.update((tx) => tx.nodes.remove({ at: [1] }));
      assert.equal(
        api(alice).decide({ action: 'accept', changes: ['carol:1'] }).status,
        'applied'
      );
      if (aliceFirst) {
        deliver(alice, bob);
        deliver(bob, alice);
      } else {
        deliver(bob, alice);
        deliver(alice, bob);
      }
      assert.deepEqual(converged(alice, bob), [paragraph(text('a'))]);
    });
  }
});

// S6 of docs/plans/2026-10-10-authored-values.md: linked property tags on
// clients that suggest and decide concurrently. Each case runs with each
// client winning a concurrent scalar write, and records its outcome.
describe('authored property tags on several clients', () => {
  const Formats = defineEditorSchema('collab-formats', {
    elements: {
      cell: { content: schema.content.text() },
      group: { content: schema.content.type('cell', { min: 1 }) },
      link: { content: schema.content.text({ min: 1 }), inline: true },
      paragraph: schema.element.textBlock(),
    },
    id: 'collab-formats',
    properties: [
      schema.textProperty('color', property.string()),
      schema.elementProperty('size', property.number(), {
        target: target.type('cell'),
      }),
    ],
    root: schema.content.any(
      [schema.content.type('paragraph'), schema.content.type('group')],
      { default: { type: 'paragraph' }, min: 1 }
    ),
    unknown: 'reject',
    version: 1,
  });
  // Resizes a group's content cells to sum to 100, as the column plugin does.
  const SumTo100 = definePlugin('collab-sum-to-100', {
    corrections: [
      {
        event: 'content',
        query: { type: 'group' },
        correct({ entry: [node, path], tx }) {
          const cells = (
            (node as { children: Array<{ size?: number }> }).children ?? []
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
                size:
                  Math.round(
                    (sum > 100
                      ? (size * 100) / sum
                      : size + (100 - sum) / cells.length) * 1e4
                  ) / 1e4,
              } as never,
              { at: [...path, index] }
            );
          }
        },
      },
    ],
  });

  type Client = Readonly<{
    api: {
      decide: (
        decisions:
          | { action: 'accept' | 'reject'; changes: readonly string[] }
          | ReadonlyArray<{
              action: 'accept' | 'reject';
              changes: readonly string[];
            }>
      ) => { status: string; with?: readonly string[] };
      propose: (change: string, run: () => void) => void;
      setIntent: (intent: Intent) => void;
    };
    doc: Y.Doc;
    editor: Peer['editor'];
  }>;

  /**
   * Clients on one document; `order` sets their Yjs client ids, so the last
   * one wins a concurrent scalar write.
   */
  const clients = (
    names: readonly string[],
    value: Array<Record<string, unknown>>,
    order: readonly number[],
    intent: Intent = 'propose'
  ): Client[] => {
    const docs = names.map((_, index) => {
      const doc = new Y.Doc();

      doc.clientID = 10 + order[index];
      documents.add(doc);

      return doc;
    });
    const made: Client[] = [];

    names.forEach((name, index) => {
      if (index > 0) {
        Y.applyUpdate(docs[index], Y.encodeStateAsUpdate(docs[0]));
      }
      const editor = createEditor({
        plugins: [
          Formats,
          SumTo100,
          createAuthoredPlugin({
            authorId: name,
            createChangeId: counter(name),
            // Ordered ids, so a fork's smallest-id bottom is the same in
            // every run.
            createTagId: counter(`${name}-t`),
            intent,
            now: () => AT,
          }),
          yjs({
            doc: docs[index],
            initialReady: true,
            rootName: 'authored-tags',
            ...(index === 0 ? { seed: true as const } : {}),
          }),
        ],
        initialValue:
          index === 0
            ? value
            : JSON.parse(JSON.stringify(made[0].editor.read.children())),
      });

      made.push({
        api: authoredTestApi(editor),
        doc: docs[index],
        editor,
      });
    });
    syncAll(made);

    return made;
  };
  const send = (from: Client, to: Client) => {
    Y.applyUpdate(
      to.doc,
      Y.encodeStateAsUpdate(from.doc, Y.encodeStateVector(to.doc))
    );
    getActiveYjsController(to.editor)?.debugProcessAvailableInput();
  };
  const syncAll = (all: readonly Client[]) => {
    for (const from of all) {
      for (const to of all) if (from !== to) send(from, to);
    }
    for (const from of all) {
      for (const to of all) if (from !== to) send(from, to);
    }
  };
  const children = (client: Client) => client.editor.read.children();
  const same = (all: readonly Client[]) => {
    for (const client of all.slice(1)) {
      assert.deepEqual(children(client), children(all[0]));
    }

    return children(all[0]);
  };
  const colorOf = (client: Client) =>
    (children(client)[0] as { children: Array<{ color?: string }> }).children[0]
      .color ?? null;
  const tagsOf = (client: Client) =>
    (
      (
        children(client)[0] as {
          children: Array<{
            authored?: Array<{ change: string; kind: string; over?: string[] }>;
          }>;
        }
      ).children[0].authored ?? []
    )
      .filter((mark) => mark.kind === 'format')
      .map((mark) => mark.change)
      .sort();
  const color = (tx: EditorUpdateTransaction, value: string) =>
    tx.nodes.set({ color: value } as never, { at: [0, 0] });
  const setColor = (client: Client, value: string) =>
    client.editor.update((tx) => color(tx, value));
  const word = [paragraph({ text: 'word' })];

  for (const order of [
    [0, 1],
    [1, 0],
  ]) {
    const winner = order[0] > order[1] ? 'alice' : 'bob';

    it(`forms one fork from two concurrent writes and decides it as one group, ${winner} winning`, () => {
      const run = () => {
        const [alice, bob] = clients(['alice', 'bob'], word, order);

        setColor(alice, 'red');
        setColor(bob, 'blue');
        syncAll([alice, bob]);

        return [alice, bob] as const;
      };
      const [alice, bob] = run();
      const live = colorOf(alice);
      const single = alice.api.decide({
        action: 'reject',
        changes: ['alice:1'],
      });
      const accepted = run();

      accepted[1].api.decide({
        action: 'accept',
        changes: ['alice:1', 'bob:1'],
      });
      syncAll(accepted);
      const mixed = run();

      mixed[0].api.decide([
        { action: 'accept', changes: ['alice:1'] },
        { action: 'reject', changes: ['bob:1'] },
      ]);
      syncAll(mixed);
      same([alice, bob]);
      record(`concurrent writes form a fork, ${winner} winning`, {
        accepted: colorOf(accepted[0]),
        live,
        mixed: colorOf(mixed[0]),
        single,
      });
      assert.deepEqual(
        {
          accepted: [
            colorOf(accepted[0]),
            tagsOf(accepted[0]),
            same(accepted) !== null,
          ],
          mixed: [colorOf(mixed[0]), tagsOf(mixed[0]), same(mixed) !== null],
          single,
          tags: tagsOf(alice),
        },
        {
          accepted: [live, [], true],
          mixed: [null, [], true],
          single: { ids: ['alice:1'], status: 'blocked', with: ['bob:1'] },
          tags: ['alice:1', 'bob:1'],
        }
      );
    });

    it(`decides a fork of branches of different lengths, and an amendment beside a stack on the old tag, as one group, ${winner} winning`, () => {
      const lengths = () => {
        const [alice, bob] = clients(['alice', 'bob'], word, order);

        setColor(alice, 'red');
        alice.api.propose('alice:2', (tx) => color(tx, 'green'));
        setColor(bob, 'blue');
        syncAll([alice, bob]);

        return [alice, bob] as const;
      };
      const amended = () => {
        const [alice, bob] = clients(['alice', 'bob'], word, order);

        setColor(alice, 'red');
        syncAll([alice, bob]);
        alice.api.propose('alice:1', (tx) => color(tx, 'green'));
        setColor(bob, 'blue');
        syncAll([alice, bob]);

        return [alice, bob] as const;
      };
      const results = {
        amendedSingle: amended()[0].api.decide({
          action: 'reject',
          changes: ['bob:1'],
        }),
        lengthsSingle: lengths()[0].api.decide({
          action: 'accept',
          changes: ['alice:2'],
        }),
      };
      const rejected = lengths();

      rejected[0].api.decide({
        action: 'reject',
        changes: ['alice:1', 'alice:2', 'bob:1'],
      });
      syncAll(rejected);
      const amendedRejected = amended();

      amendedRejected[1].api.decide({
        action: 'reject',
        changes: ['bob:1', 'alice:1'],
      });
      syncAll(amendedRejected);
      record(
        `fork of unequal branches and an amendment, ${winner} winning`,
        results
      );
      assert.deepEqual(
        {
          amendedRejected: [
            colorOf(amendedRejected[0]),
            same(amendedRejected) !== null,
          ],
          amendedSingle: results.amendedSingle.status,
          lengthsSingle: results.lengthsSingle.status,
          rejected: [colorOf(rejected[0]), same(rejected) !== null],
        },
        {
          amendedRejected: [null, true],
          amendedSingle: 'blocked',
          lengthsSingle: 'blocked',
          rejected: [null, true],
        }
      );
    });

    it(`keeps the decisions of a tag stacked above a fork, and converges two reviewers deciding the whole fork, ${winner} winning`, () => {
      const forked = () => {
        const [alice, bob] = clients(['alice', 'bob'], word, order);

        setColor(alice, 'red');
        setColor(bob, 'blue');
        syncAll([alice, bob]);
        alice.api.propose('alice:2', (tx) => color(tx, 'green'));
        syncAll([alice, bob]);

        return [alice, bob] as const;
      };
      const [alice, bob] = forked();
      const live = colorOf(bob);

      bob.api.decide({ action: 'reject', changes: ['alice:2'] });
      syncAll([alice, bob]);
      const below = colorOf(alice);
      const reviewers = forked();

      reviewers[0].api.decide({
        action: 'accept',
        changes: ['alice:1', 'bob:1', 'alice:2'],
      });
      reviewers[1].api.decide({
        action: 'reject',
        changes: ['alice:1', 'bob:1', 'alice:2'],
      });
      syncAll(reviewers);
      record(
        `stack above a fork and concurrent fork reviewers, ${winner} winning`,
        {
          below,
          live,
          reviewers: [colorOf(reviewers[0]), tagsOf(reviewers[0])],
        }
      );
      assert.deepEqual(
        {
          below: [below, tagsOf(alice), same([alice, bob]) !== null],
          live,
          reviewersConverge: same(reviewers) !== null,
        },
        {
          below: [
            below === 'red' || below === 'blue' ? below : 'fork value',
            ['alice:1', 'bob:1'],
            true,
          ],
          live: 'green',
          reviewersConverge: true,
        }
      );
    });

    it(`gives 30/70 on every client when two concurrent column inserts are rejected after a third client types in Editing, ${winner} winning`, () => {
      const [alice, bob, carol] = clients(
        ['alice', 'bob', 'carol'],
        [
          {
            children: [
              { children: [{ text: 'a' }], size: 30, type: 'cell' },
              { children: [{ text: 'b' }], size: 70, type: 'cell' },
            ],
            type: 'group',
          },
        ],
        [...order, 2]
      );
      const insert = (client: Client) =>
        client.editor.update((tx) =>
          tx.nodes.insert(
            { children: [{ text: 'n' }], size: 50, type: 'cell' } as never,
            {
              at: [0, 2],
            }
          )
        );

      insert(alice);
      insert(bob);
      syncAll([alice, bob, carol]);
      carol.api.setIntent('edit');
      carol.editor.update((tx) =>
        tx.text.insert('z', { at: { offset: 1, path: [0, 0, 0] } })
      );
      syncAll([alice, bob, carol]);
      const result = alice.api.decide({
        action: 'reject',
        changes: ['alice:1', 'bob:1'],
      });

      syncAll([alice, bob, carol]);
      const sizes = (
        same([alice, bob, carol])[0] as { children: Array<{ size: number }> }
      ).children.map((cell) => cell.size);

      record(
        `two column inserts, Editing typing, rejected, ${winner} winning`,
        { result, sizes }
      );
      assert.deepEqual(
        { result: result.status, sizes },
        { result: 'applied', sizes: [30, 70] }
      );
    });

    it(`forms one fork region from a partial delivery, and reads a tag over an accepted tag as over the accepted value, ${winner} winning`, () => {
      const [alice, bob, carol] = clients(['alice', 'bob', 'carol'], word, [
        ...order,
        2,
      ]);

      setColor(alice, 'red');
      setColor(bob, 'blue');
      send(alice, carol);
      carol.api.propose('carol:1', (tx) => color(tx, 'green'));
      syncAll([alice, bob, carol]);
      const partial = alice.api.decide({
        action: 'reject',
        changes: ['carol:1'],
      });
      const [left, right] = clients(['alice', 'bob'], word, order);

      setColor(left, 'red');
      syncAll([left, right]);
      left.api.decide({ action: 'accept', changes: ['alice:1'] });
      setColor(right, 'blue');
      syncAll([left, right]);
      right.api.decide({ action: 'reject', changes: ['bob:1'] });
      syncAll([left, right]);
      record(
        `partial delivery and a tag over an accepted tag, ${winner} winning`,
        {
          overAccepted: colorOf(left),
          partial,
        }
      );
      assert.deepEqual(
        {
          overAccepted: [colorOf(left), same([left, right]) !== null],
          partial: partial.status,
        },
        { overAccepted: ['red', true], partial: 'blocked' }
      );
    });

    it(`restates c6: concurrent single rejections of a fork each wait, and one batch restores the original, ${winner} winning`, () => {
      const [alice, bob] = clients(['alice', 'bob'], word, order);

      setColor(alice, 'red');
      setColor(bob, 'blue');
      syncAll([alice, bob]);
      const singles = [
        alice.api.decide({ action: 'reject', changes: ['alice:1'] }).status,
        bob.api.decide({ action: 'reject', changes: ['bob:1'] }).status,
      ];

      syncAll([alice, bob]);
      alice.api.decide({ action: 'reject', changes: ['alice:1', 'bob:1'] });
      syncAll([alice, bob]);
      assert.deepEqual(
        {
          color: colorOf(alice),
          converged: same([alice, bob]) !== null,
          singles,
        },
        { color: null, converged: true, singles: ['blocked', 'blocked'] }
      );
    });

    // Named races: each records its exact result and asserts convergence.
    it(`records the named races on one key, ${winner} winning`, () => {
      const race = (
        setup: (alice: Client, bob: Client, carol: Client) => void
      ) => {
        const [alice, bob, carol] = clients(['alice', 'bob', 'carol'], word, [
          ...order,
          2,
        ]);

        setup(alice, bob, carol);
        syncAll([alice, bob, carol]);
        same([alice, bob, carol]);

        return { color: colorOf(alice), tags: tagsOf(alice) };
      };
      const outcomes = {
        // Alice rejects her tag while Bob stacks on it.
        rejectionVersusStack: race((alice, bob) => {
          setColor(alice, 'red');
          syncAll([alice, bob]);
          bob.api.propose('bob:1', (tx) => color(tx, 'blue'));
          alice.api.decide({ action: 'reject', changes: ['alice:1'] });
        }),
        // Two reviewers decide overlapping batches on one key differently.
        overlappingBatches: race((alice, bob, carol) => {
          setColor(alice, 'red');
          syncAll([alice, bob, carol]);
          bob.api.propose('bob:1', (tx) => color(tx, 'blue'));
          syncAll([alice, bob, carol]);
          alice.api.decide({ action: 'accept', changes: ['alice:1', 'bob:1'] });
          carol.api.decide({ action: 'reject', changes: ['alice:1', 'bob:1'] });
        }),
        // Carol takes the key over in Editing while Bob stacks on Alice's tag.
        takeoverVersusStack: race((alice, bob, carol) => {
          setColor(alice, 'red');
          syncAll([alice, bob, carol]);
          bob.api.propose('bob:1', (tx) => color(tx, 'blue'));
          carol.api.setIntent('edit');
          setColor(carol, 'green');
        }),
        // Alice withdraws her own run while Bob stacks on it.
        withdrawalVersusStack: race((alice, bob) => {
          setColor(alice, 'red');
          syncAll([alice, bob]);
          bob.api.propose('bob:1', (tx) => color(tx, 'blue'));
          alice.editor.update((tx) =>
            tx.nodes.unset('color' as never, { at: [0, 0] })
          );
        }),
      };

      // Two clients each remove a neighbouring piece of a twice-split link
      // in Editing, then both Enters are rejected.
      const [alice, bob, carol] = clients(
        ['alice', 'bob', 'carol'],
        [
          paragraph(
            { text: '' },
            { children: [{ text: 'abc' }], type: 'link' },
            { text: '' }
          ),
        ],
        [...order, 2]
      );
      const enter = (offset: number) =>
        bob.editor.update((tx) => {
          tx.selection.set({
            anchor: { offset, path: [0, 1, 0] },
            focus: { offset, path: [0, 1, 0] },
          });
          tx.break.insert();
        });

      enter(2);
      enter(1);
      syncAll([alice, bob, carol]);
      alice.api.setIntent('edit');
      carol.api.setIntent('edit');
      alice.editor.update((tx) => tx.nodes.remove({ at: [0, 1] }));
      carol.editor.update((tx) => tx.nodes.remove({ at: [1, 1] }));
      syncAll([alice, bob, carol]);
      bob.api.decide({ action: 'reject', changes: ['bob:1', 'bob:2'] });
      syncAll([alice, bob, carol]);
      const links = (
        same([alice, bob, carol]) as Array<{
          children: Array<{
            children?: Array<{ text: string }>;
            type?: string;
          }>;
        }>
      ).map((block) =>
        block.children.flatMap((child) =>
          child.type === 'link'
            ? [child.children!.map((leaf) => leaf.text).join('')]
            : []
        )
      );
      // A correction on one client before a fork: Bob's Editing resize makes
      // the widths his preset replaces differ from those Alice's replaces,
      // and the fork restores the smallest-id bottom's.
      const group = [
        {
          children: [
            { children: [{ text: 'a' }], size: 30, type: 'cell' },
            { children: [{ text: 'b' }], size: 70, type: 'cell' },
          ],
          type: 'group',
        },
      ];
      const sizesIn = (tx: EditorUpdateTransaction, sizes: readonly number[]) =>
        sizes.forEach((size, index) =>
          tx.nodes.set({ size } as never, { at: [0, index] })
        );
      const preset = (client: Client, sizes: readonly number[]) =>
        client.editor.update((tx) => sizesIn(tx, sizes));
      const [left, right] = clients(['alice', 'bob'], group, order);

      preset(left, [40, 60]);
      right.api.setIntent('edit');
      right.editor.update((tx) =>
        tx.nodes.set({ size: 25 } as never, { at: [0, 0] })
      );
      right.api.propose('bob:9', (tx) => sizesIn(tx, [10, 90]));
      syncAll([left, right]);
      left.api.decide({ action: 'reject', changes: ['alice:1', 'bob:9'] });
      syncAll([left, right]);
      const sizes = (
        same([left, right])[0] as { children: Array<{ size: number }> }
      ).children.map((cell) => cell.size);
      // An Editing insert of a sibling re-creates the cells in the Yjs
      // binding, which drops a concurrent suggestion's tags on them.
      const [first, second] = clients(['alice', 'bob'], group, order);

      preset(first, [40, 60]);
      second.api.setIntent('edit');
      second.editor.update((tx) =>
        tx.nodes.insert(
          { children: [{ text: 'n' }], size: 50, type: 'cell' } as never,
          { at: [0, 2] }
        )
      );
      syncAll([first, second]);
      const dropped = (
        same([first, second])[0] as {
          children: Array<{ authored?: unknown[]; size: number }>;
        }
      ).children.map((cell) => [cell.size, (cell.authored ?? []).length]);

      record(`named races, ${winner} winning`, {
        ...outcomes,
        cuts: links,
        dropped,
        sizes,
      });
      assert.deepEqual(
        { ...outcomes, cuts: links, dropped, sizes },
        {
          // The piece Alice removed comes back with the join.
          cuts: [[], ['ac']],
          dropped: [
            [20, 0],
            [46.6667, 0],
            [33.3333, 0],
          ],
          overlappingBatches: { color: null, tags: [] },
          rejectionVersusStack: { color: 'blue', tags: ['bob:1'] },
          sizes: [30, 70],
          takeoverVersusStack: { color: 'green', tags: ['bob:1'] },
          withdrawalVersusStack: { color: 'blue', tags: ['bob:1'] },
        }
      );
    });
  }
});

function reviewVerdictRaces(limits: boolean) {
  const A = { at: AT, author: 'alice', change: 'alice:9', kind: 'insert' };
  const B = { at: AT, author: 'bob', change: 'bob:9', kind: 'insert' };
  const starts = {
    flat: () => [
      paragraph({ text: 'a' }, { text: 'hers', authored: [A] }, { text: 'b' }),
    ],
    nested: () => [
      paragraph(
        { text: 'a' },
        { text: 'he', authored: [A] },
        { text: 'X', authored: [A, B] },
        { text: 'rs', authored: [A] },
        { text: 'b' }
      ),
    ],
    replacement: () => [
      paragraph(
        { text: 'a' },
        { text: 'old', authored: [{ ...A, kind: 'delete' }] },
        { text: 'new', authored: [A] },
        { text: 'b' }
      ),
    ],
    deletion: () => [
      paragraph(
        { text: 'a' },
        { text: 'old', authored: [{ ...A, kind: 'delete' }] },
        { text: 'b' }
      ),
    ],
    format: () => [
      paragraph(
        { text: 'a' },
        {
          authored: [
            {
              ...A,
              id: 'alice:9:color',
              key: 'color',
              kind: 'format',
              write: { kind: 'set', value: 'red' },
            },
          ],
          color: 'red',
          text: 'old',
        },
        { text: 'b' }
      ),
    ],
  };
  type Start = keyof typeof starts;
  type Action = (peer: Peer, start: Start) => unknown;

  const peersOf = (
    authors: readonly [string, string],
    value: Array<Record<string, unknown>>
  ) => {
    const leftDoc = new Y.Doc();
    const rightDoc = new Y.Doc();

    documents.add(leftDoc);
    documents.add(rightDoc);
    const left = createPeer(authors[0], leftDoc, value, 'propose');

    Y.applyUpdate(rightDoc, Y.encodeStateAsUpdate(leftDoc));
    const right = createPeer(
      authors[1],
      rightDoc,
      JSON.parse(JSON.stringify(left.editor.read.value())),
      'propose'
    );

    deliver(right, left);

    return [left, right] as const;
  };
  // Each leaf with every insertion it belongs to, however it stores them.
  const leaves = (peer: Peer) =>
    (
      expandContexts(peer.editor.read.value()).children as Array<{
        children: any[];
      }>
    ).flatMap((block) =>
      block.children.map(({ authored, text, ...props }) =>
        [
          text,
          ...Object.entries(props).map(
            ([key, value]) => `{${key}=${String(value)}}`
          ),
          ...(authored
            ? [
                `|${authored.map((m: any) => `${m.kind}:${m.change}`).join(',')}`,
              ]
            : []),
        ].join('')
      )
    );
  const leafAt = (peer: Peer, text: string) =>
    (peer.editor.read.children()[0] as any).children.findIndex(
      (leaf: any) => leaf.text === text
    );
  const roundsUntilSettled = 2;
  const exchange = (left: Peer, right: Peer, leftFirst: boolean) => {
    for (let round = 0; round < roundsUntilSettled; round += 1) {
      if (leftFirst) {
        deliver(left, right);
        deliver(right, left);
      } else {
        deliver(right, left);
        deliver(left, right);
      }
    }
  };

  const decide =
    (action: 'accept' | 'reject', id = 'alice:9'): Action =>
    (peer) =>
      api(peer).decide({ action, changes: [id] });
  const typeInside: Action = (peer, start) => {
    const [text, offset] =
      start === 'flat'
        ? ['hers', 2]
        : start === 'nested'
          ? ['rs', 1]
          : start === 'replacement'
            ? ['new', 1]
            : ['old', 1];

    peer.editor.update((tx) =>
      tx.text.insert('Q', { at: point(offset, [0, leafAt(peer, text)]) })
    );
  };
  const withdraw =
    (text: (start: Start) => string, from = 0, to = 2): Action =>
    (peer, start) =>
      peer.editor.update((tx) =>
        tx.text.delete({
          at: {
            anchor: point(from, [0, leafAt(peer, text(start))]),
            focus: point(to, [0, leafAt(peer, text(start))]),
          },
        })
      );
  const firstPiece = withdraw((start) => (start === 'flat' ? 'hers' : 'he'));

  const race = (
    name: string,
    authors: readonly [string, string],
    first: Action,
    second: Action,
    expected: Partial<Record<Start, readonly string[]>>
  ) => {
    for (const [start, outcome] of Object.entries(expected) as Array<
      [Start, readonly string[]]
    >) {
      for (const leftFirst of [true, false]) {
        it(`${name}, ${start} start, ${
          leftFirst ? 'left' : 'right'
        } delivered first`, () => {
          const [left, right] = peersOf(authors, starts[start]());

          first(left, start);
          second(right, start);
          exchange(left, right, leftFirst);
          converged(left, right);
          record(
            `${name} (${start}, ${leftFirst ? 'left' : 'right'} first)`,
            leaves(left)
          );
          assert.deepEqual(leaves(left), outcome);
        });
      }
    }
  };

  if (limits) {
    race(
      'keeps only the typed letters when a reject races typing inside its insertion',
      ['alice', 'bob'],
      decide('reject'),
      typeInside,
      { flat: ['a', 'Q|insert:alice:9,insert:bob:1', 'b'] }
    );
    race(
      'keeps only the typed new letters when a reject races typing inside its replacement',
      ['alice', 'bob'],
      decide('reject'),
      typeInside,
      {
        replacement: [
          'a',
          'old|delete:alice:9',
          'Q|insert:alice:9,insert:bob:1',
          'b',
        ],
      }
    );
    race(
      'keeps the typed letters and unwithdrawn suffix when a withdrawal races typing inside its insertion',
      ['alice', 'bob'],
      firstPiece,
      typeInside,
      { flat: ['a', 'Q|insert:alice:9,insert:bob:1', 'rs|insert:alice:9', 'b'] }
    );
    it('keeps only the typed new letters when typing inside a rejected replacement arrives', () => {
      const [decider, typer] = peersOf(['alice', 'bob'], starts.replacement());
      decide('reject')(decider, 'replacement');
      typeInside(typer, 'replacement');
      deliver(typer, decider);
      assert.deepEqual(leaves(decider), [
        'a',
        'old|delete:alice:9',
        'Q|insert:alice:9,insert:bob:1',
        'b',
      ]);
    });
    return;
  }

  race(
    'accept || typing inside',
    ['alice', 'bob'],
    decide('accept'),
    typeInside,
    {
      flat: ['ahe', 'Q|insert:bob:1', 'rsb'],
      nested: ['ahe', 'X|insert:bob:9', 'r', 'Q|insert:bob:1', 'sb'],
    }
  );
  race(
    'reject || typing inside',
    ['alice', 'bob'],
    decide('reject'),
    typeInside,
    {
      nested: [
        'a',
        'he|insert:alice:9',
        'X|insert:alice:9,insert:bob:9',
        'r|insert:alice:9',
        'Q|insert:alice:9,insert:bob:1',
        's|insert:alice:9',
        'b',
      ],
    }
  );
  race(
    'accept || accept the nested change',
    ['alice', 'bob'],
    decide('accept'),
    decide('accept', 'bob:9'),
    {
      nested: ['aheXrsb'],
    }
  );
  race(
    'accept || accept',
    ['alice', 'bob'],
    decide('accept'),
    decide('accept'),
    {
      flat: ['ahersb'],
      replacement: ['anewb'],
    }
  );
  race(
    'accept || the nested author amends',
    ['alice', 'bob'],
    decide('accept'),
    (peer) =>
      peer.editor.update((tx) =>
        tx.text.insert('Z', { at: point(1, [0, leafAt(peer, 'X')]) })
      ),
    { nested: ['ahe', 'XZ|insert:bob:9', 'rsb'] }
  );
  race(
    'accept || the author amends',
    ['bob', 'alice'],
    decide('accept'),
    typeInside,
    {
      flat: ['aheQrsb'],
    }
  );
  race('withdraw || typing inside', ['alice', 'bob'], firstPiece, typeInside, {
    nested: [
      'a',
      'X|insert:alice:9,insert:bob:9',
      'r|insert:alice:9',
      'Q|insert:alice:9,insert:bob:1',
      's|insert:alice:9',
      'b',
    ],
  });
  race(
    'two withdrawals of one change',
    ['alice', 'alice'],
    firstPiece,
    (peer, start) =>
      start === 'flat'
        ? withdraw(() => 'hers', 2, 4)(peer, start)
        : withdraw(() => 'rs')(peer, start),
    { flat: ['ab'], nested: ['a', 'X|insert:alice:9,insert:bob:9', 'b'] }
  );
  race('withdraw || reject', ['alice', 'bob'], firstPiece, decide('reject'), {
    flat: ['ab'],
    nested: ['a', 'X|insert:alice:9,insert:bob:9', 'rs|insert:alice:9', 'b'],
  });
  race(
    'accept || reject',
    ['alice', 'bob'],
    decide('accept'),
    decide('reject'),
    {
      flat: ['ab'],
      nested: ['ahe', 'X|insert:bob:9', 'rsb'],
      replacement: ['ab'],
    }
  );

  const typeInEditing: Action = (peer, start) => {
    api(peer).setIntent('edit');
    typeInside(peer, start);
  };

  race(
    'accept a deletion || typing inside it in Editing',
    ['alice', 'bob'],
    decide('accept'),
    typeInEditing,
    { deletion: ['aQb'] }
  );
  race(
    'reject a format || typing inside it in Editing',
    ['alice', 'bob'],
    decide('reject'),
    typeInEditing,
    { format: ['ao', 'Q{color=red}', 'ldb'] }
  );

  for (const [action, start] of [
    ['accept', 'flat'],
    ['reject', 'replacement'],
  ] as const) {
    it(`undoes and redoes a ${action} on the other client`, () => {
      const [left, right] = peersOf(['alice', 'bob'], starts[start]());
      const stages: Record<string, readonly string[]> = {};

      decide(action)(left, start);
      exchange(left, right, true);
      converged(left, right);
      stages.decided = leaves(left);
      left.editor.api.history.undo();
      exchange(left, right, true);
      converged(left, right);
      stages.undone = leaves(left);
      left.editor.api.history.redo();
      exchange(left, right, true);
      converged(left, right);
      stages.redone = leaves(left);
      record(`undo and redo of a ${action}`, stages);
      assert.deepEqual(
        stages,
        action === 'accept'
          ? {
              decided: ['ahersb'],
              undone: ['a', 'hers|insert:alice:9', 'b'],
              redone: ['ahersb'],
            }
          : {
              decided: ['a', 'old|held:alice:9', 'b'],
              undone: ['a', 'old|delete:alice:9', 'new|insert:alice:9', 'b'],
              redone: ['a', 'old|held:alice:9', 'b'],
            }
      );
    });
  }

  for (const start of ['flat', 'replacement'] as const) {
    it(`keeps a ${start} change accepted when one client undoes its accept while the other accepts`, () => {
      const [left, right] = peersOf(['alice', 'bob'], starts[start]());

      decide('accept')(left, start);
      decide('accept')(right, start);
      left.editor.api.history.undo();
      exchange(left, right, true);
      converged(left, right);
      record(
        `undo of an accept while the other client accepts (${start})`,
        leaves(left)
      );
      assert.deepEqual(leaves(left), start === 'flat' ? ['ahersb'] : ['anewb']);
    });
  }

  for (const [removed, remove, expected] of [
    [
      'its text',
      (tx: EditorUpdateTransaction) =>
        tx.text.delete({
          at: { anchor: point(0, [2, 0]), focus: point(2, [2, 0]) },
        }),
      ['a', 'old|held:alice:9', 'b', 'c', '|insert:alice:9'],
    ],
    [
      'its block',
      (tx: EditorUpdateTransaction) => tx.nodes.remove({ at: [2] }),
      ['a', 'old|held:alice:9', 'b', 'c'],
    ],
  ] as const) {
    it(`holds a rejected deletion again once ${removed}, which gave it back, goes`, () => {
      const [decider, typer] = peersOf(
        ['alice', 'bob'],
        [
          paragraph(
            { text: 'a' },
            { text: 'old', authored: [{ ...A, kind: 'delete' }] },
            { text: 'b' }
          ),
          paragraph({ text: 'c' }, { text: 'new', authored: [A] }),
        ]
      );
      const stages: Record<string, readonly string[]> = {};

      decide('reject')(decider, 'replacement');
      api(typer).setIntent('edit');
      typer.editor.update((tx) => {
        tx.selection.set({ anchor: point(1, [1, 1]), focus: point(1, [1, 1]) });
        tx.break.insert();
      });
      deliver(typer, decider);
      stages.given = leaves(decider);
      api(decider).setIntent('edit');
      decider.editor.update(remove);
      stages.removed = leaves(decider);
      record(
        `a cross-block replacement given back, then ${removed} removed`,
        stages
      );
      assert.deepEqual(stages, {
        given: ['a', 'old|delete:alice:9', 'b', 'c', 'ew|insert:alice:9'],
        removed: expected,
      });
    });
  }
}

describe('review verdicts on two clients', () => reviewVerdictRaces(false));

describe('review contexts on two clients', () => {
  it('keeps the context the first key typed in it rests on after that key is undone, while the other client’s text rests on it', () => {
    const carol = {
      at: AT,
      author: 'carol',
      change: 'carol:9',
      kind: 'insert',
    };
    const { alice, bob } = pair([
      paragraph(
        { text: 'a' },
        { text: 'hers', authored: [carol] },
        { text: 'b' }
      ),
    ]);
    const contextsOf = (peer: Peer) =>
      Object.keys(
        peer.editor.read.value().records?.['authored-contexts'] ?? {}
      );

    alice.editor.update((tx) => tx.text.insert('X', { at: point(2, [0, 1]) }));
    deliver(alice, bob);
    bob.editor.update((tx) => tx.text.insert('Y', { at: point(1, [0, 3]) }));
    deliver(bob, alice);

    const minted = contextsOf(alice);

    assert.equal(minted.length, 1);
    alice.editor.api.history.undo();
    deliver(alice, bob);
    deliver(bob, alice);
    converged(alice, bob);

    for (const peer of [alice, bob]) {
      assert.deepEqual(contextsOf(peer), minted);
      const [, ...leaves] = (
        peer.editor.read.children()[0] as {
          children: ReadonlyArray<Record<string, unknown>>;
        }
      ).children;
      const typed = leaves.find((leaf) => leaf.text === 'Y');

      assert.ok(typed, JSON.stringify(leaves));
      assert.deepEqual(peer.editor.read.authored.reviewOf(typed).marks, [
        carol,
        { at: AT, author: 'bob', change: 'bob:1', kind: 'insert' },
      ]);
    }
  });
});

describe('an Editing deletion a suggested join holds, on two clients', () => {
  const ann = { at: AT, author: 'ann', change: 'ann:1', kind: 'insert' };
  const start = () =>
    pair(
      [
        paragraph({ text: 'x' }),
        { children: [{ authored: [ann], text: 'ab' }], type: 'heading' },
        paragraph({ text: 'cd' }),
      ],
      ['propose', 'edit']
    );
  const deleteHeldLine = (peer: Peer) =>
    peer.editor.update((tx) =>
      tx.text.delete({
        at: { anchor: point(0, [1, 0]), focus: point(2, [1, 0]) },
      })
    );
  const undone = [
    paragraph({ text: 'x' }),
    {
      children: [
        {
          authored: [
            ann,
            { at: AT, author: 'bob', change: '~edit:bob', kind: 'delete' },
          ],
          text: 'ab',
        },
      ],
      type: 'heading',
    },
    paragraph({ text: 'cd' }),
  ];

  it('keeps its claim once the join is undone', () => {
    const { alice, bob } = start();

    alice.editor.update((tx) => tx.nodes.merge({ at: [2] }));
    deliver(alice, bob);
    deleteHeldLine(bob);
    deliver(bob, alice);
    alice.editor.api.history.undo();
    deliver(alice, bob);

    assert.deepEqual(converged(alice, bob), undone);
  });

  for (const undoFirst of [true, false]) {
    it(`keeps its claim once the join is undone apart from the deletion, ${undoFirst ? 'the undo' : 'the deletion'} delivered first`, () => {
      const { alice, bob } = start();

      alice.editor.update((tx) => tx.nodes.merge({ at: [2] }));
      deliver(alice, bob);
      deleteHeldLine(bob);
      alice.editor.api.history.undo();
      if (undoFirst) {
        deliver(alice, bob);
        deliver(bob, alice);
      } else {
        deliver(bob, alice);
        deliver(alice, bob);
      }

      assert.deepEqual(converged(alice, bob), undone);
    });
  }
});

import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';

import {
  createEditor,
  definePlugin,
  defineEditorSchema,
  editorCommands,
  type EditorUpdateTransaction,
  NodeApi,
  type PluginReference,
  property,
  schema,
  target,
} from 'plitejs';
import { history } from 'plitejs/history';
import * as Y from 'yjs';

import { createAuthoredPlugin } from '../src/authored/authored';
import { expandContexts } from '../src/authored/facts/compact';
import { readCoreWork, resetCoreWork } from '../src/core/work';
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
  plugins: readonly PluginReference[] = []
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
  plugins: readonly PluginReference[] = []
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
      mention: { void: 'markable-inline' },
      paragraph: schema.element.textBlock(),
      quote: { content: schema.content.type('paragraph', { min: 1 }) },
    },
    id: 'collab-formats',
    properties: [
      schema.textProperty('color', property.string()),
      schema.textProperty('weight', property.string()),
      schema.elementProperty('align', property.string(), {
        target: target.type('paragraph'),
      }),
      schema.elementProperty('size', property.number(), {
        target: target.type('cell'),
      }),
    ],
    root: schema.content.any(
      [
        schema.content.type('paragraph'),
        schema.content.type('group'),
        schema.content.type('quote'),
      ],
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

  let now = AT;

  afterEach(() => {
    now = AT;
  });

  /**
   * Clients on one document; `order` sets their Yjs client ids, so the last
   * one wins a concurrent scalar write.
   */
  const clients = (
    names: readonly string[],
    value: Array<Record<string, unknown>>,
    order: readonly number[],
    intent: Intent = 'propose',
    withHistory = false
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
            now: () => now,
          }),
          ...(withHistory ? [history({ newBatchDelay: 0 })] : []),
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
            authored?: Array<{ change: string; kind: string }>;
          }>;
        }
      ).children[0].authored ?? []
    )
      .filter((mark) => mark.kind === 'format')
      .map((mark) => mark.change)
      .sort();
  type Reading = Readonly<{
    read: Readonly<{
      authored: Readonly<{
        changes: () => Readonly<{
          items: ReadonlyArray<Readonly<{ id: string }>>;
        }>;
      }>;
      children: () => readonly unknown[];
      value: () => unknown;
    }>;
  }>;
  const leafColor = (nodes: readonly unknown[]) =>
    (nodes[0] as { children: Array<{ color?: string }> }).children[0].color ??
    null;
  const outcomeOf = (editor: Reading) => ({
    color: leafColor(editor.read.children()),
    pending: editor.read.authored.changes().items.map(({ id }) => id),
  });
  const acceptedColor = (editor: Reading) =>
    leafColor(
      (
        authoredTestApi(editor as never).project('accepted').value as {
          children: readonly unknown[];
        }
      ).children
    );
  const reload = (client: Client) => {
    const editor = createEditor({
      plugins: [
        Formats,
        SumTo100,
        createAuthoredPlugin({ authorId: 'dana', now: () => AT }),
      ],
      initialValue: JSON.parse(JSON.stringify(client.editor.read.value())),
    });

    return { api: authoredTestApi(editor), editor };
  };
  const rejectInBothOrders = (
    order: readonly number[],
    setup: (clients: readonly Client[], sync: () => void) => void,
    batches: ReadonlyArray<readonly string[]>,
    withHistory = false,
    names: readonly string[] = ['alice', 'bob', 'carol']
  ) =>
    [false, true].map((reversed) => {
      const all = clients(
        names,
        word,
        [...order, ...names.slice(2).map((_, index) => 2 + index)],
        'propose',
        withHistory
      );
      const sync = () => syncAll(reversed ? [...all].reverse() : all);

      setup(all, sync);
      sync();
      same(all);
      const saved = reload(all[0]);
      const preview = acceptedColor(all[0].editor);

      assert.equal(acceptedColor(saved.editor), preview, 'reloaded preview');

      return {
        preview,
        rejected: batches.map((changes) => {
          all[0].api.decide({ action: 'reject', changes });
          sync();
          same(all);
          saved.api.decide({ action: 'reject', changes });
          assert.deepEqual(
            outcomeOf(saved.editor),
            outcomeOf(all[0].editor),
            'a reloaded copy decides the same'
          );

          return outcomeOf(all[0].editor);
        }),
      };
    });
  const leafOf = (editor: Reading) => {
    const {
      authored: _authored,
      text: _text,
      ...props
    } = (
      editor.read.children()[0] as { children: Array<Record<string, unknown>> }
    ).children[0];

    return {
      pending: editor.read.authored.changes().items.map(({ id }) => id),
      props,
    };
  };
  const seenInBothOrders = (
    ids: readonly number[],
    setup: (all: readonly Client[], sync: () => void, seen: () => void) => void
  ) =>
    [false, true].map((reversed) => {
      const all = clients(
        ['alice', 'bob', 'carol'],
        word,
        ids,
        'propose',
        true
      );
      const sync = () => syncAll(reversed ? [...all].reverse() : all);
      const states: Array<ReturnType<typeof leafOf>> = [];

      setup(all, sync, () => {
        sync();
        same(all);
        states.push(leafOf(all[0].editor));
      });

      return states;
    });
  const inBothOrders = <T>(value: T) => [value, value];
  const color = (tx: EditorUpdateTransaction, value: string) =>
    tx.nodes.set({ color: value } as never, { at: [0, 0] });
  const setColor = (client: Client, value: string) =>
    client.editor.update((tx) => color(tx, value));
  const enterAt = (tx: EditorUpdateTransaction, offset: number) => {
    tx.selection.set({
      kind: 'text',
      anchor: { offset, path: [0, 0] },
      focus: { offset, path: [0, 0] },
    });
    tx.break.insert();
  };
  const markRange = (
    client: Client,
    [from, to]: readonly [readonly number[], readonly number[]],
    value: string
  ) =>
    client.editor.update((tx) => {
      tx.selection.set({
        kind: 'text',
        anchor: { offset: from[2], path: from.slice(0, 2) },
        focus: { offset: to[2], path: to.slice(0, 2) },
      });
      tx.marks.add('color', value);
    });
  type Shape = Readonly<{
    align?: string;
    children?: readonly Shape[];
    color?: string;
    text?: string;
  }>;
  const leavesOf = (node: Shape): Array<[string, string | null]> =>
    node.children
      ? node.children.flatMap(leavesOf)
      : [[node.text ?? '', node.color ?? null]];
  const shapeOf = (nodes: readonly unknown[]) =>
    (nodes as readonly Shape[]).map((block) => ({
      align: block.align ?? null,
      leaves: leavesOf(block),
    }));
  const word = [paragraph({ text: 'word' })];

  it("joins an Editing writer's later turns over a pending suggestion into their own tag", () => {
    const all = clients(['alice', 'carol'], word, [0, 1]);
    const [alice, carol] = all;

    setColor(alice, 'red');
    syncAll(all);
    carol.api.setIntent('edit');
    for (const value of ['green', 'blue']) {
      now += 1000;
      setColor(carol, value);
    }
    syncAll(all);
    same(all);
    assert.deepEqual(tagsOf(alice), ['alice:1', '~edit:carol']);
  });

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
          mixed: ['red', [], true],
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
        editingOverStack: race((alice, bob, carol) => {
          setColor(alice, 'red');
          syncAll([alice, bob, carol]);
          bob.api.propose('bob:1', (tx) => color(tx, 'blue'));
          carol.api.setIntent('edit');
          setColor(carol, 'green');
        }),
        rejectionRaceHoldsEditing: race((alice, bob) => {
          setColor(alice, 'red');
          syncAll([alice, bob]);
          bob.api.setIntent('edit');
          setColor(bob, 'green');
          alice.api.decide({ action: 'reject', changes: ['alice:1'] });
        }),
        withdrawalRaceHoldsEditing: race((alice, bob) => {
          setColor(alice, 'red');
          syncAll([alice, bob]);
          bob.api.setIntent('edit');
          setColor(bob, 'green');
          alice.editor.update((tx) =>
            tx.nodes.unset('color' as never, { at: [0, 0] })
          );
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
          cuts: [['ac']],
          dropped: [
            [20, 0],
            [46.6667, 0],
            [33.3333, 0],
          ],
          overlappingBatches: { color: null, tags: [] },
          rejectionRaceHoldsEditing: {
            color: winner === 'bob' ? 'green' : null,
            tags: ['~edit:bob'],
          },
          rejectionVersusStack: { color: 'blue', tags: ['bob:1'] },
          sizes: [30, 70],
          editingOverStack: {
            color: 'green',
            tags: ['alice:1', 'bob:1', '~edit:carol'],
          },
          withdrawalRaceHoldsEditing: {
            color: winner === 'bob' ? 'green' : null,
            tags: ['~edit:bob'],
          },
          withdrawalVersusStack: { color: 'blue', tags: ['bob:1'] },
        }
      );
    });

    it(`keeps the suggestions an Editing write lands over pending, in both delivery orders and after a reload, ${winner} winning`, () => {
      const amendment = rejectInBothOrders(
        order,
        ([alice, bob], sync) => {
          setColor(alice, 'blue');
          sync();
          setColor(alice, 'yellow');
          bob.api.setIntent('edit');
          setColor(bob, 'green');
        },
        [['alice:2']]
      );
      const writeBack = rejectInBothOrders(
        order,
        ([alice, bob, carol], sync) => {
          setColor(alice, 'red');
          sync();
          carol.api.setIntent('edit');
          setColor(carol, 'green');
          sync();
          setColor(carol, 'red');
          bob.api.propose('bob:1', (tx) => color(tx, 'blue'));
        },
        [['bob:1'], ['alice:1']]
      );
      const thirdPeer = rejectInBothOrders(
        order,
        ([alice, bob, carol], sync) => {
          setColor(alice, 'red');
          sync();
          bob.api.propose('bob:1', (tx) => color(tx, 'blue'));
          carol.api.setIntent('edit');
          setColor(carol, 'green');
        },
        [['bob:1'], ['alice:1']]
      );

      assert.deepEqual(
        { amendment, thirdPeer, writeBack },
        {
          amendment: [false, true].map(() => ({
            preview: 'green',
            rejected: [{ color: 'green', pending: [] }],
          })),
          thirdPeer: [false, true].map(() => ({
            preview: 'green',
            rejected: [
              { color: 'green', pending: ['alice:1'] },
              { color: 'green', pending: [] },
            ],
          })),
          writeBack: [false, true].map(() => ({
            preview: 'red',
            rejected: [
              { color: 'red', pending: ['alice:1'] },
              { color: 'red', pending: [] },
            ],
          })),
        }
      );
    });

    it(`reads an Editing write undone under a stack as gone, in both delivery orders and after a reload, ${winner} winning`, () => {
      const stackOverUndone = (undoAlice: boolean) =>
        rejectInBothOrders(
          order,
          ([alice, bob, carol], sync) => {
            setColor(alice, 'red');
            sync();
            carol.api.setIntent('edit');
            setColor(carol, 'green');
            sync();
            setColor(bob, 'blue');
            sync();
            carol.editor.api.history.undo();
            if (undoAlice) {
              sync();
              alice.editor.api.history.undo();
            }
          },
          [['bob:1']],
          true
        );

      assert.deepEqual(
        { bothUndone: stackOverUndone(true), undone: stackOverUndone(false) },
        {
          bothUndone: [false, true].map(() => ({
            preview: null,
            rejected: [{ color: null, pending: [] }],
          })),
          undone: [false, true].map(() => ({
            preview: null,
            rejected: [{ color: 'red', pending: ['alice:1'] }],
          })),
        }
      );
    });

    it(`reads a tag a stack was written over as gone once it is rejected or withdrawn, in both delivery orders and after a reload, ${winner} winning`, () => {
      const stackOver = (remove: (alice: Client) => void) =>
        rejectInBothOrders(
          order,
          ([alice, bob], sync) => {
            setColor(alice, 'red');
            sync();
            bob.api.propose('bob:1', (tx) => color(tx, 'blue'));
            remove(alice);
          },
          [['bob:1']]
        );
      const nothingLeft = [false, true].map(() => ({
        preview: null,
        rejected: [{ color: null, pending: [] }],
      }));

      assert.deepEqual(
        {
          rejection: stackOver((alice) =>
            alice.api.decide({ action: 'reject', changes: ['alice:1'] })
          ),
          withdrawal: stackOver((alice) =>
            alice.editor.update((tx) =>
              tx.nodes.unset('color' as never, { at: [0, 0] })
            )
          ),
          lateSiblingDropsAccepted: rejectInBothOrders(
            order,
            ([alice, bob]) => {
              setColor(alice, 'red');
              setColor(bob, 'blue');
              alice.api.decide({ action: 'accept', changes: ['alice:1'] });
            },
            [['bob:1']]
          ),
        },
        {
          lateSiblingDropsAccepted: nothingLeft,
          rejection: nothingLeft,
          withdrawal: nothingLeft,
        }
      );
    });

    it(`keeps the writer's accepted value under the suggestion they write over their own pending one, in both delivery orders and after a reload, ${winner} winning`, () => {
      const writeAgain = (write: (alice: Client) => void) =>
        rejectInBothOrders(
          order,
          ([alice], sync) => {
            alice.api.propose('alice:7', (tx) => color(tx, 'red'));
            alice.api.propose('alice:8', (tx) => color(tx, 'blue'));
            sync();
            alice.api.decide({ action: 'accept', changes: ['alice:7'] });
            sync();
            write(alice);
          },
          [['alice:3']]
        );
      const keptRed = [false, true].map(() => ({
        preview: 'red',
        rejected: [{ color: 'red', pending: [] }],
      }));

      assert.deepEqual(
        {
          rewritten: writeAgain((alice) => setColor(alice, 'green')),
          unset: writeAgain((alice) =>
            alice.editor.update((tx) =>
              tx.nodes.unset('color' as never, { at: [0, 0] })
            )
          ),
        },
        { rewritten: keptRed, unset: keptRed }
      );
    });

    it(`reads a suggestion undone under a stack as gone even once the rest of its change is accepted, and keeps an accepted one, in both delivery orders and after a reload, ${winner} winning`, () => {
      const undoUnderStack = (
        [alice, bob]: readonly Client[],
        sync: () => void
      ) => {
        alice.api.propose('alice:1', (tx) =>
          tx.text.insert('!', { at: point(4) })
        );
        alice.api.propose('alice:1', (tx) => color(tx, 'red'));
        sync();
        bob.api.propose('bob:1', (tx) => color(tx, 'blue'));
        sync();
        alice.editor.api.history.undo();
        sync();
      };
      const undone = (accept: boolean) =>
        rejectInBothOrders(
          order,
          (all, sync) => {
            undoUnderStack(all, sync);
            if (accept) {
              all[0].api.decide({ action: 'accept', changes: ['alice:1'] });
            }
          },
          [['bob:1']],
          true
        );
      const together = [false, true].map((reversed) => {
        const all = clients(
          ['alice', 'bob', 'carol'],
          word,
          [...order, 2],
          'propose',
          true
        );
        const sync = () => syncAll(reversed ? [...all].reverse() : all);

        undoUnderStack(all, sync);
        all[0].api.decide([
          { action: 'accept', changes: ['alice:1'] },
          { action: 'reject', changes: ['bob:1'] },
        ]);
        sync();
        same(all);

        return outcomeOf(all[0].editor);
      });
      const accepted = rejectInBothOrders(
        order,
        ([alice, bob], sync) => {
          setColor(alice, 'red');
          sync();
          bob.api.propose('bob:1', (tx) => color(tx, 'blue'));
          sync();
          alice.api.decide({ action: 'accept', changes: ['alice:1'] });
        },
        [['bob:1']]
      );

      assert.deepEqual(
        {
          accepted,
          together,
          undone: undone(false),
          undoneThenAccepted: undone(true),
        },
        {
          accepted: [false, true].map(() => ({
            preview: 'red',
            rejected: [{ color: 'red', pending: [] }],
          })),
          together: [false, true].map(() => ({ color: null, pending: [] })),
          undone: [false, true].map(() => ({
            preview: null,
            rejected: [{ color: null, pending: ['alice:1'] }],
          })),
          undoneThenAccepted: [false, true].map(() => ({
            preview: null,
            rejected: [{ color: null, pending: [] }],
          })),
        }
      );
    });

    it(`keeps an accepted or Editing value a stack reads after its tag left the key, in both delivery orders and after a reload, ${winner} winning`, () => {
      const redoOver = (decideAlice: 'accept' | 'reject', editing: boolean) =>
        rejectInBothOrders(
          order,
          ([alice, bob, carol], sync) => {
            setColor(alice, 'red');
            sync();
            if (editing) {
              carol.api.setIntent('edit');
              setColor(carol, 'green');
              sync();
            }
            setColor(bob, 'blue');
            sync();
            bob.editor.api.history.undo();
            sync();
            alice.api.decide({ action: decideAlice, changes: ['alice:1'] });
            sync();
            bob.editor.api.history.redo();
          },
          [['bob:1']],
          true
        );
      const decidedWhileStacking = (decideAlice: 'accept' | 'reject') =>
        rejectInBothOrders(
          order,
          ([alice, bob, carol], sync) => {
            setColor(alice, 'red');
            sync();
            carol.api.setIntent('edit');
            setColor(carol, 'green');
            sync();
            alice.api.decide({ action: decideAlice, changes: ['alice:1'] });
            setColor(bob, 'blue');
          },
          [['bob:1']]
        );
      const acceptedUnseen = rejectInBothOrders(
        order,
        ([alice, bob], sync) => {
          setColor(alice, 'red');
          sync();
          alice.api.decide({ action: 'accept', changes: ['alice:1'] });
          setColor(bob, 'blue');
        },
        [['bob:1']]
      );
      const lands = (value: string) =>
        [false, true].map(() => ({
          preview: value,
          rejected: [{ color: value, pending: [] }],
        }));

      assert.deepEqual(
        {
          acceptedUnseen,
          acceptedWhileStacking: decidedWhileStacking('accept'),
          redoOverAccepted: redoOver('accept', false),
          redoOverEditing: redoOver('reject', true),
          rejectedWhileStacking: decidedWhileStacking('reject'),
        },
        {
          acceptedUnseen: lands('red'),
          acceptedWhileStacking: lands('green'),
          redoOverAccepted: lands('red'),
          redoOverEditing: lands('green'),
          rejectedWhileStacking: lands('green'),
        }
      );
    });

    it(`reads a tag undone before a stack is decided by what stood when the stack was written, in both delivery orders and after a reload, ${winner} winning`, () => {
      const undoneUnderEditing = (suggestAgain: boolean) =>
        rejectInBothOrders(
          order,
          ([alice, bob, carol], sync) => {
            setColor(alice, 'red');
            sync();
            carol.api.setIntent('edit');
            setColor(carol, 'green');
            sync();
            alice.editor.api.history.undo();
            if (suggestAgain) setColor(alice, 'blue');
            else setColor(bob, 'blue');
          },
          [[suggestAgain ? 'alice:2' : 'bob:1']],
          true
        );
      const undoneUnderFork = rejectInBothOrders(
        order,
        ([alice, bob, carol, dave], sync) => {
          setColor(alice, 'red');
          sync();
          setColor(bob, 'blue');
          setColor(carol, 'green');
          sync();
          setColor(dave, 'yellow');
          sync();
          alice.editor.api.history.undo();
        },
        [['dave:1']],
        true,
        ['alice', 'bob', 'carol', 'dave']
      );
      const forkShown = [false, true].map(() => {
        const all = clients(['alice', 'bob', 'carol', 'dave'], word, [
          ...order,
          2,
          3,
        ]);

        setColor(all[0], 'red');
        syncAll(all);
        setColor(all[1], 'blue');
        setColor(all[2], 'green');
        syncAll(all);

        return colorOf(all[0]);
      });

      assert.deepEqual(
        {
          suggestedAgain: undoneUnderEditing(true),
          undoneUnderEditing: undoneUnderEditing(false),
          undoneUnderFork,
        },
        {
          suggestedAgain: [false, true].map(() => ({
            preview: 'green',
            rejected: [{ color: 'green', pending: [] }],
          })),
          undoneUnderEditing: [false, true].map(() => ({
            preview: 'green',
            rejected: [{ color: 'green', pending: [] }],
          })),
          undoneUnderFork: forkShown.map((value) => ({
            preview: null,
            rejected: [{ color: value, pending: ['bob:1', 'carol:1'] }],
          })),
        }
      );
    });

    it(`keeps an accepted value a third peer saw settle before the stack over it arrived, ${winner} winning`, () => {
      const [alice, bob, carol] = clients(['alice', 'bob', 'carol'], word, [
        ...order,
        2,
      ]);
      const relay = (from: Client, to: Client, run: () => void) => {
        const updates: Uint8Array[] = [];
        const keep = (update: Uint8Array) => updates.push(update);

        from.doc.on('update', keep);
        run();
        from.doc.off('update', keep);
        Y.applyUpdate(to.doc, Y.mergeUpdates(updates));
        getActiveYjsController(to.editor)?.debugProcessAvailableInput();
      };

      setColor(alice, 'red');
      syncAll([alice, bob, carol]);
      setColor(bob, 'blue');
      send(bob, alice);
      relay(alice, carol, () =>
        alice.api.decide({ action: 'accept', changes: ['alice:1'] })
      );
      syncAll([alice, bob, carol]);
      same([alice, bob, carol]);
      carol.api.decide({ action: 'reject', changes: ['bob:1'] });
      syncAll([alice, bob, carol]);

      assert.deepEqual(
        { color: colorOf(alice), tags: tagsOf(alice) },
        { color: 'red', tags: [] }
      );
    });

    it(`undoes and redoes a decision over a stack with what it landed, ${winner} winning`, () => {
      const [alice, bob] = clients(
        ['alice', 'bob'],
        word,
        order,
        'propose',
        true
      );

      setColor(alice, 'red');
      syncAll([alice, bob]);
      setColor(bob, 'blue');
      syncAll([alice, bob]);
      alice.api.decide({ action: 'accept', changes: ['alice:1'] });
      syncAll([alice, bob]);
      const accepted = tagsOf(alice);

      alice.editor.api.history.undo();
      syncAll([alice, bob]);
      const undone = {
        pending: outcomeOf(alice.editor).pending,
        tags: tagsOf(alice),
      };

      alice.editor.api.history.redo();
      syncAll([alice, bob]);
      bob.api.decide({ action: 'reject', changes: ['bob:1'] });
      syncAll([alice, bob]);

      assert.deepEqual(
        { accepted, redone: same([alice, bob]), undone },
        {
          accepted: ['bob:1'],
          redone: [paragraph({ color: 'red', text: 'word' })],
          undone: { pending: ['alice:1', 'bob:1'], tags: ['alice:1', 'bob:1'] },
        }
      );
    });

    it(`brings back what rejecting a write gives when its writer undoes it after the write under it left or landed, ${winner} winning`, () => {
      const undoneLast = (
        setup: (all: readonly Client[], sync: () => void) => void
      ) =>
        [false, true].map((reversed) => {
          const all = clients(
            ['alice', 'bob', 'carol'],
            word,
            [...order, 2],
            'propose',
            true
          );
          const sync = () => syncAll(reversed ? [...all].reverse() : all);

          setup(all, sync);
          sync();
          same(all);

          return outcomeOf(all[0].editor);
        });
      const editingOver = (leave: (alice: Client) => void) =>
        undoneLast(([alice, , carol], sync) => {
          setColor(alice, 'red');
          sync();
          carol.api.setIntent('edit');
          setColor(carol, 'green');
          sync();
          leave(alice);
          sync();
          carol.editor.api.history.undo();
        });
      const nothingLeft = [false, true].map(() => ({
        color: null,
        pending: [],
      }));

      assert.deepEqual(
        {
          editingOverRejected: editingOver((alice) =>
            alice.api.decide({ action: 'reject', changes: ['alice:1'] })
          ),
          editingOverUndone: editingOver((alice) =>
            alice.editor.api.history.undo()
          ),
          suggestingOverAccepted: undoneLast(([alice, bob], sync) => {
            setColor(alice, 'red');
            sync();
            setColor(bob, 'blue');
            sync();
            alice.api.decide({ action: 'accept', changes: ['alice:1'] });
            sync();
            bob.editor.api.history.undo();
          }),
          suggestingOverUndone: undoneLast(([alice, bob], sync) => {
            setColor(alice, 'red');
            sync();
            setColor(bob, 'blue');
            sync();
            alice.editor.api.history.undo();
            sync();
            bob.editor.api.history.undo();
          }),
        },
        {
          editingOverRejected: nothingLeft,
          editingOverUndone: nothingLeft,
          suggestingOverAccepted: [false, true].map(() => ({
            color: 'red',
            pending: [],
          })),
          suggestingOverUndone: nothingLeft,
        }
      );
    });

    it(`brings back what rejecting a write gives when its writer undoes it with a block it inserted beside, ${winner} winning`, () => {
      const undone = (at: number) =>
        [false, true].map((reversed) => {
          const all = clients(
            ['alice', 'bob', 'carol'],
            [...word, paragraph({ text: 'tail' })],
            [...order, 2],
            'propose',
            true
          );
          const sync = () => syncAll(reversed ? [...all].reverse() : all);
          const [alice, , carol] = all;

          setColor(alice, 'red');
          sync();
          carol.api.setIntent('edit');
          carol.editor.update((tx) => {
            color(tx, 'green');
            tx.nodes.insert(paragraph({ text: 'new' }), { at: [at] });
          });
          sync();
          alice.api.decide({ action: 'reject', changes: ['alice:1'] });
          sync();
          carol.editor.api.history.undo();
          sync();
          same(all);

          return outcomeOf(all[0].editor);
        });
      const nothingLeft = [false, true].map(() => ({
        color: null,
        pending: [],
      }));

      assert.deepEqual(
        { after: undone(2), before: undone(0) },
        { after: nothingLeft, before: nothingLeft }
      );
    });

    it(`brings back what rejecting a write gives when its writer undoes it, over two keys, under another Editing writer or beside a fork, ${winner} winning`, () => {
      const ids = [...order, 2];
      const bobWins = [order[0], 2, order[1]];
      const left = (value?: string) => ({
        pending: [],
        props: value === undefined ? {} : { color: value },
      });
      const underAlice = (value: string) => ({
        pending: ['alice:1'],
        props: { color: value },
      });

      assert.deepEqual(
        {
          besideEditingFork: seenInBothOrders(
            ids,
            ([alice, bob, carol], sync, seen) => {
              setColor(alice, 'red');
              sync();
              bob.api.setIntent('edit');
              carol.api.setIntent('edit');
              setColor(bob, 'yellow');
              setColor(carol, 'green');
              sync();
              carol.editor.api.history.undo();
              seen();
              alice.api.decide({ action: 'reject', changes: ['alice:1'] });
              seen();
            }
          ),
          besideSuggestingFork: seenInBothOrders(
            bobWins,
            ([alice, bob, carol], sync, seen) => {
              setColor(alice, 'red');
              sync();
              carol.api.setIntent('edit');
              setColor(bob, 'blue');
              setColor(carol, 'green');
              sync();
              bob.editor.api.history.undo();
              seen();
              alice.api.decide({ action: 'reject', changes: ['alice:1'] });
              seen();
            }
          ),
          forkRejectRedone: seenInBothOrders(
            bobWins,
            ([alice, bob, carol], sync, seen) => {
              setColor(alice, 'red');
              sync();
              carol.api.setIntent('edit');
              setColor(bob, 'blue');
              setColor(carol, 'green');
              sync();
              alice.api.decide({ action: 'reject', changes: ['bob:1'] });
              sync();
              alice.editor.api.history.undo();
              sync();
              alice.editor.api.history.redo();
              seen();
            }
          ),
          twoKeys: seenInBothOrders(ids, ([, bob], sync, seen) => {
            bob.editor.update((tx) =>
              tx.nodes.set({ color: 'blue', weight: 'bold' } as never, {
                at: [0, 0],
              })
            );
            setColor(bob, 'yellow');
            sync();
            bob.editor.api.history.undo();
            seen();
            bob.api.decide({ action: 'accept', changes: ['bob:1'] });
            seen();
          }),
          underAnotherEditingWriter: seenInBothOrders(
            ids,
            ([alice, bob, carol], sync, seen) => {
              setColor(alice, 'red');
              sync();
              bob.api.setIntent('edit');
              carol.api.setIntent('edit');
              setColor(carol, 'green');
              sync();
              setColor(bob, 'yellow');
              sync();
              carol.editor.api.history.undo();
              seen();
              bob.editor.api.history.undo();
              seen();
              alice.api.decide({ action: 'reject', changes: ['alice:1'] });
              seen();
            }
          ),
        },
        {
          besideEditingFork: inBothOrders([
            underAlice('yellow'),
            left('yellow'),
          ]),
          besideSuggestingFork: inBothOrders([
            underAlice('green'),
            left('green'),
          ]),
          forkRejectRedone: inBothOrders([underAlice('green')]),
          twoKeys: inBothOrders([
            { pending: ['bob:1'], props: { color: 'blue', weight: 'bold' } },
            { pending: [], props: { color: 'blue', weight: 'bold' } },
          ]),
          underAnotherEditingWriter: inBothOrders([
            underAlice('yellow'),
            underAlice('red'),
            left(),
          ]),
        }
      );
    });

    it(`keeps an undone Editing write gone when the accept under it is undone, ${winner} winning`, () => {
      assert.deepEqual(
        seenInBothOrders([...order, 2], ([alice, , carol], sync, seen) => {
          setColor(alice, 'red');
          sync();
          carol.api.setIntent('edit');
          setColor(carol, 'green');
          sync();
          alice.api.decide({ action: 'accept', changes: ['alice:1'] });
          sync();
          carol.editor.api.history.undo();
          sync();
          alice.editor.api.history.undo();
          seen();
          alice.api.decide({ action: 'reject', changes: ['alice:1'] });
          seen();
        }),
        inBothOrders([
          { pending: ['alice:1'], props: { color: 'red' } },
          { pending: [], props: {} },
        ])
      );
    });

    it(`brings back what rejecting a block's write gives when its writer undoes it with a block inserted or removed before it, ${winner} winning`, () => {
      const undone = (
        value: Array<Record<string, unknown>>,
        at: number,
        beside: (tx: EditorUpdateTransaction) => void
      ) =>
        [false, true].map((reversed) => {
          const all = clients(
            ['alice', 'bob', 'carol'],
            value,
            [...order, 2],
            'propose',
            true
          );
          const sync = () => syncAll(reversed ? [...all].reverse() : all);
          const [alice, , carol] = all;

          alice.editor.update((tx) =>
            tx.nodes.set({ align: 'center' } as never, { at: [at] })
          );
          sync();
          carol.api.setIntent('edit');
          carol.editor.update((tx) => {
            tx.nodes.set({ align: 'right' } as never, { at: [at] });
            beside(tx);
          });
          sync();
          alice.api.decide({ action: 'reject', changes: ['alice:1'] });
          sync();
          carol.editor.api.history.undo();
          sync();
          same(all);

          return all[0].editor.read
            .children()
            .map((block) => (block as { align?: string }).align ?? null);
        });

      assert.deepEqual(
        {
          alone: undone(word, 0, () => {}),
          inserted: undone(word, 0, (tx) =>
            tx.nodes.insert(paragraph({ text: 'new' }), { at: [0] })
          ),
          removed: undone([paragraph({ text: 'head' }), ...word], 1, (tx) =>
            tx.nodes.remove({ at: [0] })
          ),
        },
        {
          alone: inBothOrders([null]),
          inserted: inBothOrders([null]),
          removed: inBothOrders([null, null]),
        }
      );
    });

    it(`brings back what rejecting a block's write gives when its writer undoes it with the block wrapped or unwrapped, ${winner} winning`, () => {
      const undone = (
        value: Array<Record<string, unknown>>,
        at: readonly number[],
        change: (tx: EditorUpdateTransaction) => void
      ) =>
        [false, true].map((reversed) => {
          const all = clients(
            ['alice', 'bob', 'carol'],
            value,
            [...order, 2],
            'propose',
            true
          );
          const sync = () => syncAll(reversed ? [...all].reverse() : all);
          const [alice, , carol] = all;

          alice.editor.update((tx) =>
            tx.nodes.set({ align: 'center' } as never, { at })
          );
          sync();
          carol.api.setIntent('edit');
          carol.editor.update((tx) => {
            tx.nodes.set({ align: 'right' } as never, { at });
            change(tx);
          });
          sync();
          alice.api.decide({ action: 'reject', changes: ['alice:1'] });
          sync();
          carol.editor.api.history.undo();
          sync();
          const block = NodeApi.get({ children: same(all) } as never, at) as {
            align?: string;
          };

          return block.align ?? null;
        });

      assert.deepEqual(
        {
          unwrapped: undone(
            [{ type: 'quote', children: [paragraph({ text: 'word' })] }],
            [0, 0],
            (tx) => tx.nodes.unwrap({ at: [0] })
          ),
          wrapped: undone(word, [0], (tx) =>
            tx.nodes.wrap({ type: 'quote', children: [] }, { at: [0] })
          ),
        },
        { unwrapped: inBothOrders(null), wrapped: inBothOrders(null) }
      );
    });

    const idsSwappingAliceAndCarol = order[0] === 0 ? [0, 1, 2] : [2, 1, 0];

    it(`brings back what rejecting a write gives when its writer undoes it on a mention's empty text, ${winner} winning`, () => {
      const at = [0, 1, 0];
      const undone = [false, true].map((reversed) => {
        const all = clients(
          ['alice', 'bob', 'carol'],
          [
            paragraph(
              { text: 'a' },
              { type: 'mention', children: [{ text: '' }] },
              { text: '' }
            ),
          ],
          idsSwappingAliceAndCarol,
          'propose',
          true
        );
        const sync = () => syncAll(reversed ? [...all].reverse() : all);
        const [alice, , carol] = all;

        alice.editor.update((tx) =>
          tx.nodes.set({ color: 'red' } as never, { at, voids: true })
        );
        sync();
        carol.api.setIntent('edit');
        carol.editor.update((tx) =>
          tx.nodes.set({ color: 'green' } as never, { at, voids: true })
        );
        sync();
        alice.api.decide({ action: 'reject', changes: ['alice:1'] });
        sync();
        carol.editor.api.history.undo();
        sync();

        return NodeApi.get({ children: same(all) } as never, at);
      });

      assert.deepEqual(undone, inBothOrders({ text: '' }));
    });

    const undoneOver = (
      value: Array<Record<string, unknown>>,
      suggest: (tx: EditorUpdateTransaction) => void,
      edit: (tx: EditorUpdateTransaction) => void,
      leave: 'reject' | 'undo' = 'reject'
    ) =>
      [false, true].map((reversed) => {
        const all = clients(
          ['alice', 'bob', 'carol'],
          value,
          idsSwappingAliceAndCarol,
          'propose',
          true
        );
        const sync = () => syncAll(reversed ? [...all].reverse() : all);
        const [alice, , carol] = all;

        alice.editor.update(suggest);
        sync();
        carol.api.setIntent('edit');
        carol.editor.update(edit);
        sync();
        if (leave === 'undo') alice.editor.api.history.undo();
        else alice.api.decide({ action: 'reject', changes: ['alice:1'] });
        sync();
        carol.editor.api.history.undo();
        sync();

        return shapeOf(same(all));
      });
    const plainWord = inBothOrders([{ align: null, leaves: [['word', null]] }]);

    it(`brings back what rejecting a write gives when its writer undoes it with an Enter at the block's start or a join, ${winner} winning`, () => {
      const red = (tx: EditorUpdateTransaction) => color(tx, 'red');

      assert.deepEqual(
        {
          enterAtStart: undoneOver(word, red, (tx) => {
            color(tx, 'green');
            enterAt(tx, 0);
          }),
          enterAtStartColoringTheSecondHalf: undoneOver(word, red, (tx) => {
            enterAt(tx, 0);
            tx.nodes.set({ color: 'green' } as never, { at: [1, 0] });
          }),
          enterAtStartAfterTheSuggesterUndid: undoneOver(
            word,
            red,
            (tx) => {
              color(tx, 'green');
              enterAt(tx, 0);
            },
            'undo'
          ),
          joinIntoTheBlockBefore: undoneOver(
            [paragraph({ text: 'head' }), ...word],
            (tx) => tx.nodes.set({ color: 'red' } as never, { at: [1, 0] }),
            (tx) => {
              tx.nodes.set({ color: 'green' } as never, { at: [1, 0] });
              tx.nodes.merge({ at: [1] });
            }
          ),
        },
        {
          enterAtStart: plainWord,
          enterAtStartColoringTheSecondHalf: plainWord,
          enterAtStartAfterTheSuggesterUndid: plainWord,
          joinIntoTheBlockBefore: inBothOrders([
            { align: null, leaves: [['head', null]] },
            { align: null, leaves: [['word', null]] },
          ]),
        }
      );
    });

    it(`gives each part of a leaf an undo joins the value rejecting the undone write gives that part, ${winner} winning`, () => {
      const joined = (
        names: readonly string[],
        value: Array<Record<string, unknown>>,
        setup: (all: readonly Client[], sync: () => void) => void
      ) =>
        [false, true].map((reversed) => {
          const all = clients(
            names,
            value,
            idsSwappingAliceAndCarol,
            'propose',
            true
          );
          const sync = () => syncAll(reversed ? [...all].reverse() : all);

          setup(all, sync);
          sync();
          const done = same(all);
          all[2].editor.api.history.undo();
          sync();
          const undone = shapeOf(same(all))[0].leaves;
          all[2].editor.api.history.redo();
          sync();
          assert.deepEqual(
            same(all),
            done,
            'the redo puts back the undone write'
          );

          return undone;
        });

      assert.deepEqual(
        {
          oneAcceptedOneRejected: joined(
            ['alice', 'dave', 'carol'],
            word,
            ([alice, dave, carol], sync) => {
              markRange(
                alice,
                [
                  [0, 0, 0],
                  [0, 0, 2],
                ],
                'red'
              );
              sync();
              markRange(
                dave,
                [
                  [0, 1, 0],
                  [0, 1, 2],
                ],
                'red'
              );
              sync();
              carol.api.setIntent('edit');
              markRange(
                carol,
                [
                  [0, 0, 0],
                  [0, 1, 2],
                ],
                'green'
              );
              sync();
              dave.api.decide({ action: 'accept', changes: ['dave:1'] });
              sync();
              alice.api.decide({ action: 'reject', changes: ['alice:1'] });
            }
          ),
          intoAPlainNeighbour: joined(
            ['alice', 'bob', 'carol'],
            [paragraph({ color: 'red', text: 'w' }, { text: 'ord' })],
            ([alice, , carol], sync) => {
              alice.editor.update((tx) =>
                tx.nodes.set({ color: 'red' } as never, { at: [0, 1] })
              );
              sync();
              carol.api.setIntent('edit');
              carol.editor.update((tx) =>
                tx.nodes.set({ color: 'green' } as never, { at: [0, 1] })
              );
              sync();
              alice.api.decide({ action: 'reject', changes: ['alice:1'] });
            }
          ),
          restoredNeighbour: joined(
            ['alice', 'bob', 'carol'],
            [paragraph({ text: 'a' }, { color: 'red', text: 'b' })],
            ([alice, , carol], sync) => {
              alice.editor.update((tx) =>
                tx.nodes.set({ color: 'red' } as never, { at: [0, 0] })
              );
              sync();
              carol.api.setIntent('edit');
              carol.editor.update((tx) => {
                tx.nodes.set({ color: 'green' } as never, { at: [0, 0] });
                tx.nodes.remove({ at: [0, 1] });
              });
              sync();
              alice.api.decide({ action: 'reject', changes: ['alice:1'] });
            }
          ),
          restoredBetween: joined(
            ['alice', 'bob', 'carol'],
            [
              paragraph(
                { text: 'w' },
                { color: 'red', text: 'X' },
                { text: 'rd' }
              ),
            ],
            ([alice, , carol], sync) => {
              alice.editor.update((tx) => {
                tx.nodes.set({ color: 'red' } as never, { at: [0, 0] });
                tx.nodes.set({ color: 'red' } as never, { at: [0, 2] });
              });
              sync();
              carol.api.setIntent('edit');
              carol.editor.update((tx) => {
                tx.nodes.set({ color: 'green' } as never, { at: [0, 0] });
                tx.nodes.set({ color: 'green' } as never, { at: [0, 2] });
                tx.nodes.remove({ at: [0, 1] });
              });
              sync();
              alice.api.decide({ action: 'reject', changes: ['alice:1'] });
            }
          ),
        },
        {
          oneAcceptedOneRejected: inBothOrders([
            ['wo', null],
            ['rd', 'red'],
          ]),
          intoAPlainNeighbour: inBothOrders([
            ['w', 'red'],
            ['ord', null],
          ]),
          restoredNeighbour: inBothOrders([
            ['a', null],
            ['b', 'red'],
          ]),
          restoredBetween: inBothOrders([
            ['w', null],
            ['X', 'red'],
            ['rd', null],
          ]),
        }
      );
    });

    it(`keeps an undo's repair from reading more as the document grows, ${winner} winning`, () => {
      const undoWork = (
        blocks: number,
        shape: 'alone' | 'enterAtStart' | 'joined'
      ) => {
        // A middle block, so work over the blocks after it shows.
        const middle = blocks / 2;
        const at = [middle, shape === 'joined' ? 1 : 0];
        const all = clients(
          ['alice', 'bob', 'carol'],
          Array.from({ length: blocks }, (_, index) =>
            index === middle && shape === 'joined'
              ? paragraph({ color: 'red', text: 'w' }, { text: 'ord' })
              : paragraph({ text: `plain ${index}` })
          ),
          idsSwappingAliceAndCarol,
          'propose',
          true
        );
        const [alice, , carol] = all;

        alice.editor.update((tx) =>
          tx.nodes.set({ color: 'red' } as never, { at })
        );
        syncAll(all);
        carol.api.setIntent('edit');
        carol.editor.update((tx) => {
          tx.nodes.set({ color: 'green' } as never, { at });
          if (shape === 'enterAtStart') {
            tx.selection.set({
              kind: 'text',
              anchor: { offset: 0, path: at },
              focus: { offset: 0, path: at },
            });
            tx.break.insert();
          }
        });
        syncAll(all);
        alice.api.decide({ action: 'reject', changes: ['alice:1'] });
        syncAll(all);
        resetCoreWork();
        carol.editor.api.history.undo();
        const work = readCoreWork();

        return {
          indexedNodes: work.indexedNodes,
          leaves: shapeOf(carol.editor.read.children())[middle]?.leaves,
          walkedSlots: work.walkedSlots,
          wholeReadNodes: work.wholeReadNodes,
        };
      };
      const shapes = ['alone', 'enterAtStart', 'joined'] as const;
      const measured = Object.fromEntries(
        shapes.map((shape) => [
          shape,
          { at100: undoWork(100, shape), at2000: undoWork(2000, shape) },
        ])
      ) as Record<
        (typeof shapes)[number],
        Record<'at100' | 'at2000', ReturnType<typeof undoWork>>
      >;

      process.stdout.write(`case undo work: ${JSON.stringify(measured)}\n`);
      for (const shape of shapes) {
        const { at100, at2000 } = measured[shape];

        assert.equal(
          at2000.indexedNodes,
          at100.indexedNodes,
          `${shape}: indexed nodes grow with the document`
        );
        assert.equal(
          at2000.walkedSlots,
          at100.walkedSlots,
          `${shape}: walked slots grow with the document`
        );
        for (const [blocks, { leaves, wholeReadNodes }] of [
          [100, at100],
          [2000, at2000],
        ] as const) {
          assert.deepEqual(
            leaves,
            shape === 'joined'
              ? [
                  ['w', 'red'],
                  ['ord', null],
                ]
              : [[`plain ${blocks / 2}`, null]],
            `${shape}: the undo repairs the value`
          );
          // A whole read of the blocks the undo changed adds a few nodes.
          assert.ok(
            wholeReadNodes <=
              { alone: 12, enterAtStart: 14, joined: 12 }[shape] * blocks + 8,
            `${shape}: ${wholeReadNodes} nodes read whole at ${blocks} blocks`
          );
        }
      }
    });

    it(`keeps every client on the redone value after undoing a write with an Enter at the block's start, ${winner} winning`, () => {
      const steps = [false, true].map((reversed) => {
        const all = clients(
          ['alice', 'bob', 'carol'],
          word,
          idsSwappingAliceAndCarol,
          'propose',
          true
        );
        const sync = () => syncAll(reversed ? [...all].reverse() : all);
        const [alice, , carol] = all;

        setColor(alice, 'red');
        sync();
        carol.api.setIntent('edit');
        carol.editor.update((tx) => {
          color(tx, 'green');
          enterAt(tx, 0);
        });
        sync();
        alice.api.decide({ action: 'reject', changes: ['alice:1'] });
        sync();
        carol.editor.api.history.undo();
        sync();
        const undone = shapeOf(same(all));

        carol.editor.api.history.redo();
        sync();
        const redone = same(all);

        return {
          redone: shapeOf(redone),
          tags: (
            (
              redone[1] as {
                children: Array<{
                  authored?: Array<{ change: string; kind: string }>;
                }>;
              }
            ).children[0].authored ?? []
          )
            .filter((mark) => mark.kind === 'format')
            .map((mark) => mark.change),
          undone,
        };
      });

      assert.deepEqual(
        steps,
        inBothOrders({
          redone: [
            { align: null, leaves: [['', null]] },
            { align: null, leaves: [['word', 'green']] },
          ],
          tags: ['~edit:carol'],
          undone: [{ align: null, leaves: [['word', null]] }],
        })
      );
    });

    it(`gives a block a redo puts in place of a suggested one none of the suggestion's values, with the same text or another, ${winner} winning`, () => {
      const redone = (text: string) => {
        const [alice, , carol] = clients(
          ['alice', 'bob', 'carol'],
          [paragraph({ color: 'blue', text: 'word' })],
          [...order, 2],
          'propose',
          true
        );
        const all = [alice, carol];

        setColor(alice, 'red');
        syncAll(all);
        carol.api.setIntent('edit');
        carol.editor.update((tx) => {
          tx.nodes.remove({ at: [0] });
          tx.nodes.insert(paragraph({ text }), { at: [0] });
        });
        syncAll(all);
        carol.editor.api.history.undo();
        syncAll(all);
        carol.editor.api.history.redo();
        syncAll(all);
        same(all);

        return alice.editor.read.children();
      };

      assert.deepEqual(
        { other: redone('other'), same: redone('word') },
        {
          other: [paragraph({ text: 'other' })],
          same: [paragraph({ text: 'word' })],
        }
      );
    });

    it(`keeps an Editing value over a suggestion its writer undoes and redoes, in both delivery orders and after a reload, ${winner} winning`, () => {
      const redoneUnder = (
        stacked: boolean,
        batches: ReadonlyArray<readonly string[]>
      ) =>
        rejectInBothOrders(
          order,
          ([alice, bob, carol], sync) => {
            setColor(alice, 'red');
            sync();
            carol.api.setIntent('edit');
            setColor(carol, 'green');
            sync();
            if (stacked) {
              setColor(bob, 'blue');
              sync();
            }
            alice.editor.api.history.undo();
            sync();
            alice.editor.api.history.redo();
          },
          batches,
          true
        );

      assert.deepEqual(
        {
          redone: redoneUnder(false, [['alice:1']]),
          redoneUnderStack: redoneUnder(true, [['bob:1'], ['alice:1']]),
        },
        {
          redone: [false, true].map(() => ({
            preview: 'green',
            rejected: [{ color: 'green', pending: [] }],
          })),
          redoneUnderStack: [false, true].map(() => ({
            preview: 'green',
            rejected: [
              { color: 'green', pending: ['alice:1'] },
              { color: 'green', pending: [] },
            ],
          })),
        }
      );
    });

    it(`reads a fork sibling or a plain value under a stack once the tag between them left, in both delivery orders and after a reload, ${winner} winning`, () => {
      const siblingUndone = rejectInBothOrders(
        order,
        ([alice, bob, carol, dave], sync) => {
          setColor(carol, 'red');
          sync();
          setColor(alice, 'blue');
          setColor(bob, 'green');
          sync();
          setColor(dave, 'yellow');
          sync();
          bob.editor.api.history.undo();
        },
        [['dave:1']],
        true,
        ['alice', 'bob', 'carol', 'dave']
      );
      const plainUnder = rejectInBothOrders(
        order,
        ([alice, bob, carol], sync) => {
          carol.api.setIntent('edit');
          setColor(carol, 'purple');
          sync();
          setColor(alice, 'red');
          sync();
          setColor(bob, 'blue');
          sync();
          alice.editor.api.history.undo();
        },
        [['bob:1']],
        true
      );

      assert.deepEqual(
        { plainUnder, siblingUndone },
        {
          plainUnder: [false, true].map(() => ({
            preview: 'purple',
            rejected: [{ color: 'purple', pending: [] }],
          })),
          siblingUndone: [false, true].map(() => ({
            preview: null,
            rejected: [{ color: 'blue', pending: ['alice:1', 'carol:1'] }],
          })),
        }
      );
    });

    it(`reads a write a settle landed as gone once the accept it relied on is undone, ${winner} winning`, () => {
      const settledThenUndone = (reincarnated: boolean) =>
        [false, true].map((reversed) => {
          const all = clients(
            ['alice', 'bob', 'carol'],
            word,
            [...order, 2],
            'propose',
            true
          );
          const [alice, bob, carol] = all;
          const sync = () => syncAll(reversed ? [...all].reverse() : all);

          if (reincarnated) {
            alice.api.propose('alice:1', (tx) =>
              tx.text.insert('?', { at: point(4) })
            );
            sync();
            carol.api.decide({ action: 'accept', changes: ['alice:1'] });
            sync();
          }
          alice.api.propose('alice:1', (tx) =>
            tx.text.insert('!', { at: point(4) })
          );
          sync();
          // Carol accepts before the red reaches her, so the other clients'
          // settles drop its tag and land its write.
          alice.api.propose('alice:1', (tx) => color(tx, 'red'));
          send(alice, bob);
          bob.api.propose('bob:1', (tx) => color(tx, 'blue'));
          send(bob, alice);
          carol.api.decide({ action: 'accept', changes: ['alice:1'] });
          sync();
          carol.editor.api.history.undo();
          sync();
          alice.api.decide({ action: 'reject', changes: ['bob:1'] });
          sync();
          same(all);

          return outcomeOf(alice.editor);
        });
      const gone = [false, true].map(() => ({
        color: null,
        pending: ['alice:1'],
      }));

      assert.deepEqual(
        {
          reincarnated: settledThenUndone(true),
          undone: settledThenUndone(false),
        },
        { reincarnated: gone, undone: gone }
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

describe('an Editing deletion beside a suggested join, on two clients', () => {
  const ann = { at: AT, author: 'ann', change: 'ann:1', kind: 'insert' };
  const carol = { at: AT, author: 'carol', change: 'carol:1', kind: 'insert' };
  const alicePending = {
    at: AT,
    author: 'alice',
    change: 'alice:2',
    kind: 'insert',
  };
  const heading = (...children: Array<Record<string, unknown>>) => ({
    type: 'heading',
    children,
  });
  const ab = (annotated: boolean) =>
    annotated ? { authored: [ann], text: 'ab' } : { text: 'ab' };
  const restored = (annotated: boolean, rest = 'cd') =>
    annotated
      ? heading(ab(true), { text: rest })
      : heading({ text: `ab${rest}` });
  const lines = (annotated: boolean) => [
    paragraph({ text: 'x' }),
    heading(ab(annotated)),
    paragraph({ text: 'cd' }),
  ];
  const deleteAb =
    (path = [1, 0]) =>
    (peer: Peer) =>
      peer.editor.update((tx) =>
        tx.text.delete({
          at: { anchor: point(0, path), focus: point(2, path) },
        })
      );
  const typeAt =
    (path: number[], offset: number, value: string) => (peer: Peer) =>
      peer.editor.update((tx) =>
        tx.text.insert(value, { at: point(offset, path) })
      );
  const joinAt = (path: number[]) => (peer: Peer) =>
    peer.editor.update((tx) => tx.nodes.merge({ at: path }));
  const withoutClaimsOf = (change: string, node: unknown): unknown =>
    JSON.parse(
      JSON.stringify(node, (key, value) => {
        if (key !== 'authored') return value;

        const kept = (value as Array<{ change: string }>).filter(
          (member) => member.change !== change
        );

        return kept.length > 0 ? kept : undefined;
      })
    );
  const backspaceAt = (path: number[]) => (peer: Peer) =>
    peer.editor.update((tx) => {
      tx.selection.set({ anchor: point(0, path), focus: point(0, path) });
      tx.command(editorCommands.delete, {
        direction: 'backward',
        unit: 'character',
      });
    });

  it('applies in its commit on both clients, a link going with its text', () => {
    const deleted = (
      line: Record<string, unknown>,
      remove: (bob: Peer) => void
    ) => {
      const { alice, bob } = pair(
        [paragraph({ text: 'x' }), line, paragraph({ text: 'cd' })],
        ['propose', 'edit'],
        [Links]
      );

      joinAt([2])(alice);
      deliver(alice, bob);
      remove(bob);
      deliver(bob, alice);

      return converged(alice, bob)[1];
    };

    assert.deepEqual(
      {
        link: deleted(
          heading({ text: 'see ' }, link, { text: '' }),
          deleteLink
        ),
        text: withoutClaimsOf('ann:1', deleted(heading(ab(true)), deleteAb())),
      },
      { link: heading({ text: '' }), text: heading({ text: '' }) }
    );
  });

  const Links = defineEditorSchema('collab-links', {
    elements: {
      link: {
        content: schema.content.text({ default: 'text', min: 1 }),
        inline: true,
      },
    },
    id: 'collab-links',
    properties: [
      schema.elementProperty('url', property.string(), {
        target: target.type('link'),
      }),
    ],
    root: schema.content.not(schema.content.text()),
    unknown: 'preserve',
    version: 1,
  });
  const link = { type: 'link', url: 'u', children: [{ text: 'site' }] };
  const deleteLink = (bob: Peer) =>
    bob.editor.update((tx) =>
      tx.text.delete({
        at: { anchor: point(0, [1, 0]), focus: point(0, [1, 2]) },
      })
    );
  type Case = Readonly<{
    accept?: readonly string[];
    afterAccept?: (alice: Peer) => void;
    expected: (annotated: boolean) => unknown[];
    name: string;
    plugins?: readonly PluginReference[];
    remove?: (bob: Peer) => void;
    start?: (annotated: boolean) => Array<Record<string, unknown>>;
    suggest?: (alice: Peer) => void;
    variants: readonly boolean[];
  }>;
  const cases: readonly Case[] = [
    {
      expected: (annotated) => [paragraph({ text: 'x' }), restored(annotated)],
      name: 'Alice accepts her join',
      variants: [false, true],
    },
    {
      expected: () => [
        paragraph({ text: 'x' }),
        heading({ text: 'see ' }, link, { text: 'cd' }),
      ],
      name: 'Alice accepts her join into a heading that holds a link',
      plugins: [Links],
      remove: deleteLink,
      start: () => [
        paragraph({ text: 'x' }),
        heading({ text: 'see ' }, link, { text: '' }),
        paragraph({ text: 'cd' }),
      ],
      variants: [false],
    },
    {
      accept: ['alice:1', 'carol:1'],
      expected: (annotated) => [paragraph({ text: 'xQ' }), restored(annotated)],
      name: "an Accept all that also accepts Carol's insertion in the line above",
      start: (annotated) => [
        paragraph({ text: 'x' }, { authored: [carol], text: 'Q' }),
        heading(ab(annotated)),
        paragraph({ text: 'cd' }),
      ],
      variants: [false, true],
    },
    {
      afterAccept: (alice) => {
        api(alice).setIntent('edit');
        typeAt([0, 0], 1, '!')(alice);
      },
      expected: (annotated) => [paragraph({ text: 'x!' }), restored(annotated)],
      name: 'Alice accepts her join and types in the line above',
      variants: [false, true],
    },
    {
      accept: ['alice:1', 'alice:2'],
      expected: (annotated) => [
        paragraph({ text: 'x' }),
        restored(annotated),
        paragraph({ text: 'efgh' }),
      ],
      name: 'an Accept all of two joins',
      start: (annotated) => [
        ...lines(annotated),
        paragraph({ text: 'ef' }),
        paragraph({ text: 'gh' }),
      ],
      suggest: (alice) => {
        joinAt([2])(alice);
        joinAt([4])(alice);
      },
      variants: [false, true],
    },
    {
      accept: ['alice:1', 'alice:2'],
      expected: () => [paragraph({ text: 'x' }), restored(true, 'cQd')],
      name: 'Alice accepts her join with her Q inside the joined line',
      suggest: (alice) => {
        joinAt([2])(alice);
        typeAt([2, 0], 1, 'Q')(alice);
      },
      variants: [true],
    },
    {
      afterAccept: (alice) => {
        api(alice).setIntent('edit');
        typeAt([1, 0], 2, '!')(alice);
      },
      expected: () => [paragraph({ text: 'x' }), restored(true, 'cd!')],
      name: "Alice accepts her join and types at the joined line's end",
      variants: [true],
    },
    {
      afterAccept: typeAt([1, 0], 1, 'Z'),
      expected: () => [
        paragraph({ text: 'x' }),
        heading(
          ab(true),
          { text: 'c' },
          { authored: [alicePending], text: 'Z' },
          { text: 'd' }
        ),
      ],
      name: 'Alice accepts her join and suggests Z inside the joined line',
      variants: [true],
    },
    {
      accept: ['alice:1', 'carol:1'],
      expected: (annotated) => [
        paragraph({ text: 'xQ' }),
        { type: 'blockquote', children: [restored(annotated)] },
      ],
      name: "an Accept all inside a quote that also accepts Carol's insertion outside it",
      remove: deleteAb([1, 0, 0]),
      start: (annotated) => [
        paragraph({ text: 'x' }, { authored: [carol], text: 'Q' }),
        {
          type: 'blockquote',
          children: [heading(ab(annotated)), paragraph({ text: 'cd' })],
        },
      ],
      suggest: joinAt([1, 1]),
      variants: [false, true],
    },
    {
      expected: (annotated) => [
        paragraph({ text: 'x' }),
        { type: 'blockquote', children: [restored(annotated)] },
      ],
      name: "Alice's Backspace that joins the line after a quote into the quote's heading",
      remove: deleteAb([1, 0, 0]),
      start: (annotated) => [
        paragraph({ text: 'x' }),
        { type: 'blockquote', children: [heading(ab(annotated))] },
        paragraph({ text: 'cd' }),
      ],
      suggest: backspaceAt([2, 0]),
      variants: [false, true],
    },
    {
      expected: () => [
        paragraph({ text: 'x' }),
        { type: 'blockquote', children: [restored(true, 'zcd')] },
      ],
      name: "Alice's Backspace that joins the line after a quote into a quote heading whose plain z Bob deleted",
      remove: (bob) =>
        bob.editor.update((tx) =>
          tx.text.delete({
            at: { anchor: point(0, [1, 0, 1]), focus: point(1, [1, 0, 1]) },
          })
        ),
      start: () => [
        paragraph({ text: 'x' }),
        { type: 'blockquote', children: [heading(ab(true), { text: 'z' })] },
        paragraph({ text: 'cd' }),
      ],
      suggest: backspaceAt([2, 0]),
      variants: [true],
    },
    {
      accept: ['alice:1', 'ann:2'],
      expected: () => [
        paragraph({ text: 'x' }),
        { type: 'blockquote', children: [restored(true)] },
      ],
      name: "an Accept all that also accepts Ann's line above a quote, after Alice's Backspace joins the line after the quote into the quote's heading",
      remove: deleteAb([1, 0, 0]),
      start: () => [
        paragraph({ authored: [{ ...ann, change: 'ann:2' }], text: 'x' }),
        { type: 'blockquote', children: [heading(ab(true))] },
        paragraph({ text: 'cd' }),
      ],
      suggest: backspaceAt([2, 0]),
      variants: [true],
    },
    {
      accept: ['alice:1', 'carol:1'],
      expected: (annotated) => [
        paragraph({ text: 'x' }),
        {
          type: 'blockquote',
          children: [paragraph({ text: 'N' }), restored(annotated)],
        },
      ],
      name: "an Accept all that also accepts Carol's line before the heading inside the quote",
      remove: deleteAb([1, 1, 0]),
      start: (annotated) => [
        paragraph({ text: 'x' }),
        {
          type: 'blockquote',
          children: [
            {
              type: 'paragraph',
              authored: [carol],
              children: [{ authored: [carol], text: 'N' }],
            },
            heading(ab(annotated)),
          ],
        },
        paragraph({ text: 'cd' }),
      ],
      suggest: backspaceAt([2, 0]),
      variants: [false, true],
    },
    {
      accept: ['alice:1', 'carol:1'],
      expected: (annotated) => [
        paragraph({ text: 'x' }),
        { type: 'blockquote', children: [restored(annotated)] },
      ],
      name: "an Accept all that also accepts Carol's quote around the heading",
      remove: deleteAb([1, 0, 0]),
      start: (annotated) => [
        paragraph({ text: 'x' }),
        {
          type: 'blockquote',
          authored: [carol],
          children: [{ ...heading(ab(annotated)), authored: [carol] }],
        },
        paragraph({ text: 'cd' }),
      ],
      suggest: backspaceAt([2, 0]),
      variants: [false, true],
    },
    {
      accept: ['alice:1', 'alice:2', 'carol:1'],
      expected: (annotated) => [
        paragraph({ text: 'x' }),
        paragraph({ text: 'N' }),
        restored(annotated, 'cQd'),
      ],
      name: "an Accept all of Alice's join and her Q inside the joined line that also accepts Carol's line above",
      remove: deleteAb([2, 0]),
      start: (annotated) => [
        paragraph({ text: 'x' }),
        {
          type: 'paragraph',
          authored: [carol],
          children: [{ authored: [carol], text: 'N' }],
        },
        heading(ab(annotated)),
        paragraph({ text: 'cd' }),
      ],
      suggest: (alice) => {
        joinAt([3])(alice);
        typeAt([3, 0], 1, 'Q')(alice);
      },
      variants: [false, true],
    },
  ];

  for (const c of cases) {
    for (const annotated of c.variants) {
      it(`lands Bob's undone text in the joined heading after ${c.name}${annotated ? ", beside Ann's pending text" : ''}`, () => {
        const { alice, bob } = pair(
          c.start?.(annotated) ?? lines(annotated),
          ['propose', 'edit'],
          c.plugins
        );

        (c.suggest ?? joinAt([2]))(alice);
        deliver(alice, bob);
        (c.remove ?? deleteAb())(bob);
        deliver(bob, alice);
        assert.equal(
          api(alice).decide({
            action: 'accept',
            changes: [...(c.accept ?? ['alice:1'])],
          }).status,
          'applied'
        );
        c.afterAccept?.(alice);
        deliver(alice, bob);
        bob.editor.api.history.undo();
        deliver(bob, alice);

        assert.deepEqual(converged(alice, bob), c.expected(annotated));
      });
    }
  }

  it("gives abcd on Bob's first undo and his removed line back after it on his second, after he removed the line Alice's join targeted and deleted b", () => {
    const { alice, bob } = pair(
      [
        heading({ text: 'ab' }),
        paragraph({ text: 'yy' }),
        paragraph({ text: 'cd' }),
      ],
      ['propose', 'edit']
    );

    joinAt([2])(alice);
    deliver(alice, bob);
    bob.editor.update((tx) => tx.nodes.remove({ at: [1] }));
    bob.editor.update((tx) =>
      tx.text.delete({
        at: { anchor: point(1, [0, 0]), focus: point(2, [0, 0]) },
      })
    );
    deliver(bob, alice);
    assert.equal(
      api(alice).decide({ action: 'accept', changes: ['alice:1'] }).status,
      'applied'
    );
    deliver(alice, bob);
    const undone: unknown[] = [];

    for (const _ of [1, 2]) {
      bob.editor.api.history.undo();
      deliver(bob, alice);
      undone.push(converged(alice, bob));
    }

    assert.deepEqual(undone, [
      [heading({ text: 'abcd' })],
      [heading({ text: 'abcd' }), paragraph({ text: 'yy' })],
    ]);
  });
});

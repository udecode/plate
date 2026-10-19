import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';

import {
  createEditor,
  defineEditorSchema,
  editorCommands,
  type EditorUpdateTransaction,
  type PluginReference,
  property,
  schema,
  target,
} from 'plitejs';
import { history } from 'plitejs/history';
import * as Y from 'yjs';

import { createAuthoredPlugin } from '../src/authored/authored';
import { getInternalDocumentRootChange } from '../src/core/change/document-change';
import { DocumentIndex } from '../src/core/change/document-index';
import { joinsOf } from '../src/core/change/join';
import type { JsonNode } from '../src/core/change/tokens';
import { readCoreWork, resetCoreWork } from '../src/core/work';
import { getDefined } from '../src/internal/get-defined';
import { yjs } from '../src/yjs';
import { getActiveYjsController } from '../src/yjs/core/controller-registry';
import {
  assignFreshYjsNodeId,
  createVirtualYjsMovePlaceholder,
  createYjsNode,
  getYjsNode,
  getYjsVisibleChildren,
  hideYjsNode,
  readPliteValueFromYjs,
} from '../src/yjs/core/document';
import {
  YJS_VIRTUAL_CHILD_ID_KEY,
  YJS_VIRTUAL_PLACEHOLDER_KEY,
} from '../src/yjs/core/keys';
import { authoredTestApi } from './support/authored';

const AT = 1000;
const ROOT = 'join-collab';
const documents = new Set<Y.Doc>();

afterEach(() => {
  for (const doc of documents) doc.destroy();
  documents.clear();
});

const Links = defineEditorSchema('join-collab-links', {
  elements: {
    link: {
      content: schema.content.text({ default: 'text', min: 1 }),
      inline: true,
    },
  },
  id: 'join-collab-links',
  properties: [
    schema.elementProperty('url', property.string(), {
      target: target.type('link'),
    }),
  ],
  root: schema.content.not(schema.content.text()),
  unknown: 'preserve',
  version: 1,
});

type Node = Record<string, unknown>;
type Start =
  | Node[]
  | Readonly<{ children: Node[]; roots: Record<string, Node[]> }>;
type Intent = 'edit' | 'propose';
type Edit = (tx: EditorUpdateTransaction) => void;

const counter = (author: string) => {
  let count = 0;

  return () => `${author}:${(count += 1)}`;
};

const createPeer = (
  authorId: string,
  doc: Y.Doc,
  initialValue: Start,
  intent: Intent
) => {
  documents.add(doc);

  return {
    doc,
    editor: createEditor({
      plugins: [
        Links as PluginReference,
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
          rootName: ROOT,
          ...(doc.share.size === 0 ? { seed: true as const } : {}),
        }),
      ],
      initialValue,
    }),
  };
};
type Peer = ReturnType<typeof createPeer>;

const deliver = (from: Peer, to: Peer) => {
  Y.applyUpdate(
    to.doc,
    Y.encodeStateAsUpdate(from.doc, Y.encodeStateVector(to.doc))
  );
  getActiveYjsController(to.editor)?.debugProcessAvailableInput();
};

const pair = (value: Start, aliceIntent: Intent = 'edit') => {
  const alice = createPeer('alice', new Y.Doc(), value, aliceIntent);
  const bobDoc = new Y.Doc();

  Y.applyUpdate(bobDoc, Y.encodeStateAsUpdate(alice.doc));

  const bob = createPeer(
    'bob',
    bobDoc,
    JSON.parse(JSON.stringify(alice.editor.read.value())),
    'edit'
  );

  deliver(bob, alice);

  return { alice, bob };
};

const children = (peer: Peer) => peer.editor.read.children() as Node[];

const converged = (alice: Peer, bob: Peer) => {
  assert.deepEqual(children(bob), children(alice));

  return children(alice);
};

const trace = (peer: Peer) =>
  getActiveYjsController(peer.editor)?.debugTrace() ?? [];

const undo = (peer: Peer) => peer.editor.api.history.undo();

const p = (...nodes: Node[]) => ({ type: 'paragraph', children: nodes });
const h = (...nodes: Node[]) => ({ type: 'heading', children: nodes });
const q = (...nodes: Node[]) => ({ type: 'blockquote', children: nodes });
const t = (text: string, marks: Node = {}) => ({ ...marks, text });
const line = (text: string) => p(t(text));
const link = (text: string) => ({
  type: 'link',
  url: 'u',
  children: [t(text)],
});
const fill = (count: number) =>
  Array.from({ length: count }, (_, index) => line(`f${index}`));
const at = (path: number[], offset: number) => ({ offset, path });
const cut =
  (path: number[], from: number, to: number) => (tx: EditorUpdateTransaction) =>
    tx.text.delete({ at: { anchor: at(path, from), focus: at(path, to) } });
const type =
  (path: number[], offset: number, text: string) =>
  (tx: EditorUpdateTransaction) =>
    tx.text.insert(text, { at: at(path, offset) });
const join = (path: number[]) => (tx: EditorUpdateTransaction) =>
  tx.nodes.merge({ at: path });
const backspace = (path: number[]) => (tx: EditorUpdateTransaction) => {
  tx.selection.set({ anchor: at(path, 0), focus: at(path, 0) });
  tx.command(editorCommands.delete, {
    direction: 'backward',
    unit: 'character',
  });
};
const both =
  (...edits: Edit[]): Edit =>
  (tx) => {
    for (const edit of edits) edit(tx);
  };

const yjsLineAt = (peer: Peer, path: readonly number[]) => {
  const root = peer.doc.get(ROOT, Y.XmlElement);
  let node: Y.XmlElement = root;

  for (const index of path) {
    const next = getYjsVisibleChildren(root, node)[index];

    assert.ok(next instanceof Y.XmlElement, `no Yjs line at [${path}]`);
    node = next;
  }

  return node;
};

const holdsPlaceholder = (element: Y.XmlElement) =>
  element
    .toArray()
    .some(
      (child) =>
        child instanceof Y.XmlElement &&
        (child.getAttribute(YJS_VIRTUAL_PLACEHOLDER_KEY) as unknown) === true
    );

const deliverJoins = (alice: Peer, bob: Peer) => {
  const before = DocumentIndex.fromValue(children(bob) as JsonNode[]);
  const from = trace(bob).length;

  deliver(alice, bob);

  const change = bob.editor.read.lastCommit()?.changes;
  const remote = change && getInternalDocumentRootChange(change, 'main');

  return {
    imported: trace(bob).slice(from),
    joins: remote ? joinsOf(remote, before) : [],
  };
};

const ann = (count: number) => ({
  at: AT,
  author: 'ann',
  change: `ann:${count}`,
  kind: 'insert',
});
const carol = { at: AT, author: 'carol', change: 'carol:1', kind: 'insert' };
const carolLine = (text: string) => ({
  type: 'paragraph',
  authored: [carol],
  children: [{ authored: [carol], text }],
});

type HopCase = Readonly<{
  accept: string[];
  after?: (alice: Peer) => void;
  alice: Edit[];
  bob: Edit;
  expected: Node[][];
  joined: number[];
  name: string;
  pre?: Edit;
  start: Node[];
}>;

const hopCases = (annotated: boolean): HopCase[] => {
  const ab = annotated ? t('ab', { authored: [ann(1)] }) : t('ab');
  const heading = h(ab);
  const restored = (rest: string) =>
    annotated ? h(ab, t(rest)) : h(t(`ab${rest}`));

  return [
    {
      accept: ['alice:1'],
      alice: [backspace([2, 0])],
      bob: cut([1, 0, 0], 0, 2),
      expected: [[line('x'), q(restored('cd'))]],
      joined: [1, 0],
      name: "Alice's Backspace after a quote, accepted (R0, red test 2)",
      start: [line('x'), q(heading), line('cd')],
    },
    ...[10, 80].flatMap((count): HopCase[] => [
      {
        accept: ['alice:1', 'ann:2'],
        alice: [backspace([count + 2, 0])],
        bob: cut([count + 1, 0, 0], 0, 2),
        expected: [[line('x'), ...fill(count), q(restored('cd'))]],
        joined: [count + 1, 0],
        name: `an Accept all of the join and Ann's line ${count} lines above it (U${count})`,
        start: [
          p(t('x', { authored: [ann(2)] })),
          ...fill(count),
          q(heading),
          line('cd'),
        ],
      },
      {
        accept: ['alice:1', 'alice:2', 'carol:1'],
        alice: [join([count + 3]), type([count + 3, 0], 1, 'Q')],
        bob: cut([count + 2, 0], 0, 2),
        expected: [[line('x'), line('N'), ...fill(count), restored('cQd')]],
        joined: [count + 2],
        name: `an Accept all of the join, Alice's Q in it and Carol's line ${count} lines above (R${count})`,
        start: [line('x'), carolLine('N'), ...fill(count), heading, line('cd')],
      },
    ]),
    {
      accept: ['alice:1', 'alice:2', 'carol:1'],
      alice: [join([3]), type([3, 0], 1, 'Q')],
      bob: cut([2, 0], 0, 2),
      expected: [[line('x'), line('N'), restored('cQd')]],
      joined: [2],
      name: "an Accept all of the join, Alice's Q in it and Carol's line above (R0)",
      start: [line('x'), carolLine('N'), heading, line('cd')],
    },
    {
      accept: ['alice:1', 'carol:1'],
      alice: [backspace([2, 0])],
      bob: cut([1, 0, 0], 0, 2),
      expected: [
        [line('x'), q(restored('Zcd'))],
        [line('x'), q(restored('cd'))],
      ],
      joined: [1, 0],
      name: "an Accept all of the join and Carol's quote, after Bob typed Z (C3)",
      pre: type([1, 0, 0], 2, 'Z'),
      start: [
        line('x'),
        {
          type: 'blockquote',
          authored: [carol],
          children: [{ type: 'heading', authored: [carol], children: [ab] }],
        },
        line('cd'),
      ],
    },
    {
      accept: ['alice:1'],
      after: (alice) =>
        authoredTestApi(alice.editor).decide({
          action: 'reject',
          changes: ['alice:2'],
        }),
      alice: [
        backspace([2, 0]),
        (tx) => tx.nodes.set({ type: 'callout' }, { at: [1] }),
      ],
      bob: cut([1, 0, 0], 0, 2),
      expected: [[line('x'), q(restored('cd'))]],
      joined: [1, 0],
      name: "the join accepted and Alice's type change rejected (C7)",
      start: [line('x'), q(heading), line('cd')],
    },
    {
      accept: ['alice:1', 'carol:1'],
      alice: [join([3])],
      bob: cut([2, 0], 0, 2),
      expected: [[line('x'), line('accepted'), restored('cd')]],
      joined: [2],
      name: "an Accept all of the join and Carol's line above (D)",
      start: [line('x'), carolLine('accepted'), heading, line('cd')],
    },
  ];
};

const runHop = (c: HopCase) => {
  const { alice, bob } = pair(c.start, 'propose');

  if (c.pre) {
    bob.editor.update(c.pre);
    deliver(bob, alice);
  }
  for (const edit of c.alice) alice.editor.update(edit);
  deliver(alice, bob);
  bob.editor.update(c.bob);
  deliver(bob, alice);

  const from = trace(alice).length;

  assert.equal(
    authoredTestApi(alice.editor).decide({
      action: 'accept',
      changes: c.accept,
    }).status,
    'applied'
  );
  c.after?.(alice);

  const exported = trace(alice).slice(from);
  const placeholder = holdsPlaceholder(yjsLineAt(alice, c.joined));
  const { imported, joins } = deliverJoins(alice, bob);
  const undone = c.expected.map(() => {
    undo(bob);
    deliver(bob, alice);

    return converged(alice, bob);
  });

  return { exported, imported, joins, placeholder, undone };
};

describe('a join through Yjs', () => {
  for (const annotated of [false, true]) {
    for (const c of hopCases(annotated)) {
      it(`exports a join with no whole-root fallback after ${c.name}${annotated ? ", beside Ann's pending text" : ''}`, () => {
        const { exported, placeholder } = runHop(c);

        assert.deepEqual(
          exported.filter((entry) => 'fallback' in entry),
          [],
          'export fallback'
        );
        assert.equal(placeholder, true, 'placeholder in the joined line');
      });

      it(`imports the join and keeps it under Bob's undo after ${c.name}${annotated ? ", beside Ann's pending text" : ''}`, () => {
        const { imported, joins, undone } = runHop(c);

        assert.deepEqual(
          imported.map((entry) => entry.importKind),
          imported.map(() => 'event-change'),
          'import'
        );
        assert.ok(joins.length > 0, 'join in Bob’s remote change');
        assert.deepEqual(undone, c.expected);
      });
    }
  }

  for (const annotated of [false, true]) {
    it(`keeps the join when Alice moves the last filler line to the top after accepting R80${annotated ? ", beside Ann's pending text" : ''}`, () => {
      const r80 = getDefined(
        hopCases(annotated).find((c) => c.name.endsWith('(R80)'))
      );
      // [x, N, f0 … f79, the joined line]: f79 moves above x.
      const moved = (tree: Node[]) => [
        getDefined(tree.at(-2)),
        ...tree.slice(0, -2),
        getDefined(tree.at(-1)),
      ];
      const { imported, joins, undone } = runHop({
        ...r80,
        after: (alice) => {
          authoredTestApi(alice.editor).setIntent('edit');
          alice.editor.update((tx) => tx.nodes.move({ at: [81], to: [0] }));
        },
      });

      // The move reaches Bob in the same batch, so his import recovers from
      // the whole root, and the recovery keeps the join.
      assert.deepEqual(
        imported.map((entry) => entry.importKind),
        ['full-diff-fallback']
      );
      assert.ok(joins.length > 0, 'join in Bob’s remote change');
      assert.deepEqual(undone, r80.expected.map(moved));
    });
  }

  it("travels as a join after Alice joins a line she edited, and Bob's undo restores his letter (plain tail)", () => {
    const { alice, bob } = pair([line('x'), h(t('ab')), line('cd')]);

    bob.editor.update(cut([1, 0], 1, 2));
    deliver(bob, alice);

    const from = trace(alice).length;

    alice.editor.update(join([2]));

    assert.deepEqual(
      trace(alice)
        .slice(from)
        .filter((entry) => 'fallback' in entry),
      []
    );
    assert.equal(holdsPlaceholder(yjsLineAt(alice, [1])), true);

    const { imported, joins } = deliverJoins(alice, bob);

    assert.deepEqual(
      imported.map((entry) => entry.importKind),
      ['event-change']
    );
    assert.equal(joins.length, 1);
    undo(bob);
    deliver(bob, alice);
    assert.deepEqual(converged(alice, bob), [line('x'), h(t('abcd'))]);
  });
});

describe('a join into a line that ends with a link, through Yjs', () => {
  it("keeps the join under Bob's undo when the export removes the empty text after the link", () => {
    const { joins, undone } = undoOverJoin(
      [h(t('cb', bold), t('b'), link('ab'), t('')), h(t('d'))],
      [type([1, 0], 1, 'X')],
      [join([1])]
    );

    assert.equal(joins.length, 1);
    assert.deepEqual(undone, [[h(t('cb', bold), t('b'), link('ab'), t('d'))]]);
  });
});

describe('a join of a line whose first text Bob emptied, through Yjs', () => {
  it('gives back his letter at the junction under his undo', () => {
    const { undone } = undoOverJoin(
      [q(p(t('cbaba')), h(t('a'), link('ca'), t('')))],
      [cut([0, 1, 0], 0, 1)],
      [join([0, 1])]
    );

    assert.deepEqual(undone, [[q(p(t('cbabaa'), link('ca'), t('')))]]);
  });
});

describe('a join beside a line that holds the joined text, through Yjs', () => {
  it('keeps the joined text when the next line holds the same text', () => {
    const { alice, bob } = pair([line('a'), line('b'), line('b')]);

    alice.editor.update(join([1]));
    deliver(alice, bob);

    assert.deepEqual(converged(alice, bob), [line('ab'), line('b')]);
  });

  it('keeps the joined text when its commit shortens the first line and the next line starts with that text', () => {
    const { alice, bob } = pair([line('ax'), line('b'), line('bc')]);

    alice.editor.update(both(cut([0, 0], 1, 2), join([1])));
    deliver(alice, bob);

    assert.deepEqual(converged(alice, bob), [line('ab'), line('bc')]);
  });
});

const select = (anchor: [number[], number], focus: [number[], number]) =>
  ((tx: EditorUpdateTransaction) =>
    tx.selection.set({
      anchor: at(...anchor),
      focus: at(...focus),
    })) satisfies Edit;

const undoOverJoin = (
  start: Node[],
  bobEdits: readonly Edit[],
  aliceEdits: readonly Edit[],
  undos = 1
) => {
  const { alice, bob } = pair(start);

  for (const edit of bobEdits) {
    bob.editor.update({ history: 'new-batch' }, edit);
  }
  deliver(bob, alice);
  for (const edit of aliceEdits) alice.editor.update(edit);

  const { imported, joins } = deliverJoins(alice, bob);
  const undone = Array.from({ length: undos }, () => {
    undo(bob);
    deliver(bob, alice);

    return converged(alice, bob);
  });

  return { imported, joins, undone };
};

describe('a join and other edits in one commit, through Yjs', () => {
  it('keeps the placeholder of a join when the same commit inserts a link in the joined line', () => {
    const { alice, bob } = pair([line('ab'), line('cd'), line('ef')]);

    alice.editor.update((tx) => {
      tx.nodes.merge({ at: [1] });
      tx.nodes.insert(link('L'), { at: [0, 1] });
    });

    assert.equal(holdsPlaceholder(yjsLineAt(alice, [0])), true);
    deliver(alice, bob);
    assert.deepEqual(converged(alice, bob), [
      p(t('ab'), link('L'), t('cd')),
      line('ef'),
    ]);
  });

  it("deletes the e Alice deleted from beed, not the next one (case 164's export)", () => {
    const { alice, bob } = pair(
      [
        line('a'),
        line(''),
        line('a'),
        line('cee'),
        line('e'),
        { type: 'heading', level: 2, children: [t('XYdac')] },
        line('be'),
      ],
      'edit'
    );

    bob.editor.update((tx) => {
      cut([5, 0], 0, 2)(tx);
      type([6, 0], 2, 'ed')(tx);
    });
    deliver(bob, alice);

    const writes: unknown[] = [];
    const root = alice.doc.get(ROOT, Y.XmlElement);
    const record = (events: Array<Y.YEvent<Y.XmlElement | Y.XmlText>>) => {
      for (const event of events) {
        if (event.target instanceof Y.XmlText) {
          writes.push({ delta: event.delta, text: event.target.toString() });
        }
      }
    };

    root.observeDeep(record);
    alice.editor.update((tx) => {
      cut([6, 0], 1, 2)(tx);
      join([6])(tx);
    });
    root.unobserveDeep(record);

    assert.deepEqual(writes, [
      { delta: [{ retain: 1 }, { delete: 1 }], text: 'bed' },
    ]);

    deliver(alice, bob);
    undo(bob);
    deliver(bob, alice);
    assert.deepEqual(converged(alice, bob).slice(5), [
      { type: 'heading', level: 2, children: [t('XYdacb')] },
    ]);
  });

  it("undoes Bob's letter when Alice's commit deletes after an emoji in the joined line", () => {
    const { undone } = undoOverJoin(
      [h(t('ab')), line('😀cd')],
      [type([1, 0], 4, 'X')],
      [both(cut([1, 0], 2, 3), join([1]))]
    );

    assert.deepEqual(undone, [[h(t('ab😀d'))]]);
  });

  it("undoes Bob's letter when Alice's commit adds a line to the quote she joins in", () => {
    const { joins, undone } = undoOverJoin(
      [q(line('ab'), line('cd'))],
      [type([0, 1, 0], 1, 'X')],
      [both((tx) => tx.nodes.insert(line('new'), { at: [0, 0] }), join([0, 2]))]
    );

    assert.equal(joins.length, 1);
    assert.deepEqual(undone, [[q(line('new'), line('abcd'))]]);
  });
});

const bold = { bold: true };
const italic = { italic: true };
const typeX = type([1, 0], 1, 'X');

describe("a join whose commit also removes inline elements, through Yjs, under Bob's undo", () => {
  const typeT = (tx: EditorUpdateTransaction) =>
    tx.command(editorCommands.insertText, { text: 'T' });

  it('removes his letter after her deletion removes a link and a bold text at the end of the first line', () => {
    const { undone } = undoOverJoin(
      [h(t('a'), link('ab'), t('dcc', bold)), h(t('d'))],
      [type([1, 0], 1, 'X')],
      [
        (tx) =>
          tx.text.delete({
            at: { anchor: at([0, 0], 1), focus: at([1, 0], 0) },
          }),
      ]
    );

    assert.deepEqual(undone, [[h(t('ad'))]]);
  });

  it('removes his letter after her typing replaces a bold text and a link at the start of the second line', () => {
    const { undone } = undoOverJoin(
      [line('cbc'), p(t('aad', bold), link('bcb'), t('dbba'))],
      [type([1, 2], 2, 'X')],
      [both(select([[0, 0], 3], [[1, 2], 0]), typeT)]
    );

    assert.deepEqual(undone, [[line('cbcTdbba')]]);
  });

  it('removes his letter after her commit removes a link inside the second line and joins it', () => {
    const { undone } = undoOverJoin(
      [h(t('ab')), p(t('cd'), link('L'), t('ef'))],
      [typeX],
      [both((tx) => tx.nodes.remove({ at: [1, 1] }), join([1]))]
    );

    assert.deepEqual(undone, [[h(t('abcdef'))]]);
  });

  it('removes his letter after her Backspace joins a line into one whose link sits between empty texts, beside a block move', () => {
    const { undone } = undoOverJoin(
      [
        p(t(''), link('bac'), t('dbc')),
        h(t(''), link('cdc'), t('')),
        h(t('ac')),
        line('cb'),
      ],
      [type([2, 0], 1, 'X')],
      [both(backspace([2, 0]), (tx) => tx.nodes.move({ at: [2], to: [0] }))]
    );

    assert.deepEqual(undone, [
      [
        line('cb'),
        p(t(''), link('bac'), t('dbc')),
        h(t(''), link('cdc'), t('ac')),
      ],
    ]);
  });

  it('removes his letter after her deletion removes a whole line between two lines of a quote', () => {
    const { undone } = undoOverJoin(
      [q(p(t('ab')), p(t('Y')), p(t('cd')))],
      [type([0, 2, 0], 1, 'X')],
      [
        (tx) =>
          tx.text.delete({
            at: { anchor: at([0, 0, 0], 2), focus: at([0, 2, 0], 0) },
          }),
      ]
    );

    assert.deepEqual(undone, [[q(p(t('abcd')))]]);
  });

  it('removes his letter after her deletion removes a link and a bold text beside a block move, which the import recovers from the whole root', () => {
    const { imported, undone } = undoOverJoin(
      [h(t('a'), link('ab'), t('dcc', bold)), h(t('d')), line('z')],
      [type([1, 0], 1, 'X')],
      [
        both(
          (tx) =>
            tx.text.delete({
              at: { anchor: at([0, 0], 1), focus: at([1, 0], 0) },
            }),
          (tx) => tx.nodes.move({ at: [1], to: [0] })
        ),
      ]
    );

    assert.deepEqual(
      imported.map((entry) => entry.importKind),
      ['full-diff-fallback']
    );
    assert.deepEqual(undone, [[line('z'), h(t('ad'))]]);
  });

  it('removes his letter after her later deletion removes the placeholder of her earlier join', () => {
    const { alice, bob } = pair([h(t('ab')), p(t('cd')), p(t('ef'))]);

    alice.editor.update(join([1]));
    deliver(alice, bob);
    bob.editor.update({ history: 'new-batch' }, type([1, 0], 1, 'X'));
    deliver(bob, alice);
    alice.editor.update((tx) =>
      tx.text.delete({ at: { anchor: at([0, 0], 1), focus: at([1, 0], 0) } })
    );
    deliver(alice, bob);
    undo(bob);
    deliver(bob, alice);

    assert.deepEqual(converged(alice, bob), [h(t('aef'))]);
  });

  it('removes his letter after one delivery holds her link insert and then her commit that removes it and joins', () => {
    const { alice, bob } = pair([h(t('ab')), p(t('cdef'))]);

    bob.editor.update({ history: 'new-batch' }, typeX);
    deliver(bob, alice);
    alice.editor.update((tx) => tx.nodes.insert(link('L'), { at: [1, 1] }));
    alice.editor.update(
      both((tx) => tx.nodes.remove({ at: [1, 1] }), join([1]))
    );
    deliver(alice, bob);
    undo(bob);
    deliver(bob, alice);

    assert.deepEqual(converged(alice, bob), [h(t('abcdef'))]);
  });

  it('gives back the link he removed at the end of the first line under his undo', () => {
    const { undone } = undoOverJoin(
      [p(t('ab'), link('L'), t('')), line('cd')],
      [(tx) => tx.nodes.remove({ at: [0, 1] })],
      [join([1])]
    );

    assert.deepEqual(undone, [[p(t('ab'), link('L'), t('cd'))]]);
  });

  it('gives back the link he removed at the start of the second line under his undo', () => {
    const { undone } = undoOverJoin(
      [line('ab'), p(t(''), link('L'), t('cd'))],
      [(tx) => tx.nodes.remove({ at: [1, 1] })],
      [join([1])]
    );

    assert.deepEqual(undone, [[p(t('ab'), link('L'), t('cd'))]]);
  });

  it('gives back the link and bold text she removed under her undo, and removes them again under her redo', () => {
    const start = [h(t('a'), link('ab'), t('dcc', bold)), h(t('d'))];
    const { alice, bob } = pair(start);

    alice.editor.update((tx) =>
      tx.text.delete({ at: { anchor: at([0, 0], 1), focus: at([1, 0], 0) } })
    );
    deliver(alice, bob);
    undo(alice);
    deliver(alice, bob);

    assert.deepEqual(converged(alice, bob), start);

    alice.editor.api.history.redo();
    deliver(alice, bob);

    assert.deepEqual(converged(alice, bob), [h(t('ad'))]);
  });

  it('removes his letter before the link her deletion removes with the text after it', () => {
    const { undone } = undoOverJoin(
      [h(t('dbd'), link('d'), t('cdcb')), h(t('ccbadcb'))],
      [type([0, 0], 1, 'X')],
      [
        (tx) =>
          tx.text.delete({
            at: { anchor: at([0, 0], 4), focus: at([1, 0], 0) },
          }),
      ]
    );

    assert.deepEqual(undone, [[h(t('dbdccbadcb'))]]);
  });
});

describe("a join whose commit also sets marks, through Yjs, under Bob's undo", () => {
  it('keeps the join when the commit bolds the first line', () => {
    const { joins, undone } = undoOverJoin(
      [h(t('ab')), line('cd')],
      [typeX],
      [
        (tx) => {
          join([1])(tx);
          select([[0, 0], 0], [[0, 0], 2])(tx);
          tx.marks.add('bold', true);
        },
      ]
    );

    assert.equal(joins.length, 1);
    assert.deepEqual(undone, [[h(t('ab', bold), t('cd'))]]);
  });

  it('keeps the join when the commit removes the first line’s bold', () => {
    const { joins, undone } = undoOverJoin(
      [h(t('ab', bold)), line('cd')],
      [typeX],
      [
        (tx) => {
          join([1])(tx);
          select([[0, 0], 0], [[0, 0], 2])(tx);
          tx.marks.remove('bold');
        },
      ]
    );

    assert.equal(joins.length, 1);
    assert.deepEqual(undone, [[h(t('abcd'))]]);
  });

  it('keeps the join when the commit bolds a letter inside the first line, splitting its text', () => {
    const { joins, undone } = undoOverJoin(
      [h(t('abe')), line('cd')],
      [typeX],
      [
        (tx) => {
          join([1])(tx);
          select([[0, 0], 1], [[0, 0], 2])(tx);
          tx.marks.add('bold', true);
        },
      ]
    );

    assert.equal(joins.length, 1);
    assert.deepEqual(undone, [[h(t('a'), t('b', bold), t('ecd'))]]);
  });

  it('keeps the join when the commit bolds letters on both sides of the junction', () => {
    const { joins, undone } = undoOverJoin(
      [h(t('ab')), line('cd')],
      [typeX],
      [
        (tx) => {
          join([1])(tx);
          select([[0, 0], 1], [[0, 1], 1])(tx);
          tx.marks.add('bold', true);
        },
      ]
    );

    assert.equal(joins.length, 1);
    assert.deepEqual(undone, [[h(t('a'), t('bc', bold), t('d'))]]);
  });
});

const italicize =
  (path: number[], from: number, to: number): Edit =>
  (tx) => {
    select([path, from], [path, to])(tx);
    tx.marks.add('italic', true);
  };
const unitalicize =
  (path: number[], from: number, to: number): Edit =>
  (tx) => {
    select([path, from], [path, to])(tx);
    tx.marks.remove('italic');
  };

describe("Bob's mark on the second line's text under his undo, after Alice's join through Yjs", () => {
  it('removes his italic after her Backspace joins the line into the one above', () => {
    const { undone } = undoOverJoin(
      [line('ddc'), p(t('acb'), t('cb', bold))],
      [italicize([1, 0], 2, 3)],
      [backspace([1, 0])]
    );

    assert.deepEqual(undone, [[p(t('ddcacb'), t('cb', bold))]]);
  });

  it('removes his italic on the text after a link after her Delete at the end of the line above', () => {
    const { undone } = undoOverJoin(
      [h(t('c', bold), t('d')), h(t('aa'), link('ca'), t('d'))],
      [italicize([1, 2], 0, 1)],
      [
        both(caret([0, 1], 1), (tx) =>
          tx.command(editorCommands.delete, {
            direction: 'forward',
            unit: 'character',
          })
        ),
      ]
    );

    assert.deepEqual(undone, [[h(t('c', bold), t('daa'), link('ca'), t('d'))]]);
  });

  it('gives back the italic he removed on the joined copy of the text the line above holds', () => {
    const { undone } = undoOverJoin(
      [line('ab'), p(t('ab', italic))],
      [unitalicize([1, 0], 0, 2)],
      [join([1])]
    );

    assert.deepEqual(undone, [[p(t('ab'), t('ab', italic))]]);
  });

  it('removes his italic on the last line of a chain of joins', () => {
    const { undone } = undoOverJoin(
      [h(t('ab')), line('cd'), line('ef')],
      [italicize([2, 0], 0, 2)],
      [both(join([1]), join([1]))]
    );

    assert.deepEqual(undone, [[h(t('abcdef'))]]);
  });
});

describe("Bob's mark on the first line's text under his undo, after Alice's join through Yjs", () => {
  it('restores nothing when her deletion across the line break removes the letter he unitalicized', () => {
    const { undone } = undoOverJoin(
      [p(t('a'), t('b', italic)), line('bc')],
      [unitalicize([0, 1], 0, 1)],
      [
        (tx) =>
          tx.text.delete({
            at: { anchor: at([0, 0], 1), focus: at([1, 0], 0) },
          }),
      ]
    );

    assert.deepEqual(undone, [[p(t('abc'))]]);
  });
});

describe('a chain of joins through Yjs', () => {
  for (const [name, middle, joined] of [
    ['a line', 'c', 'abcef'],
    ['an empty line', '', 'abef'],
  ] as const) {
    const start = () => [h(t('ab')), line(middle), line('ef')];
    const typeY = type([2, 0], 1, 'Y');

    it(`joins three lines through ${name} in one transaction`, () => {
      const { joins, undone } = undoOverJoin(
        start(),
        [typeY],
        [
          (tx) => {
            join([2])(tx);
            join([1])(tx);
          },
        ]
      );

      assert.ok(joins.length > 0);
      assert.deepEqual(undone, [[h(t(joined))]]);
    });

    it(`joins three lines through ${name} in two transactions delivered together`, () => {
      const { joins, undone } = undoOverJoin(
        start(),
        [typeY],
        [join([2]), join([1])]
      );

      assert.ok(joins.length > 0);
      assert.deepEqual(undone, [[h(t(joined))]]);
    });
  }
});

const caret =
  (path: number[], offset: number) => (tx: EditorUpdateTransaction) =>
    tx.selection.set({ anchor: at(path, offset), focus: at(path, offset) });
const press = (direction: 'backward' | 'forward', path: number[]) =>
  both(caret(path, 0), (tx) =>
    tx.command(editorCommands.delete, { direction, unit: 'character' })
  );
const span =
  (from: [number[], number], to: [number[], number]) =>
  (tx: EditorUpdateTransaction) =>
    tx.text.delete({ at: { anchor: at(...from), focus: at(...to) } });

// The two-undo cases of test/join-transform.test.ts, with Alice's join of the
// first two lines reaching Bob through Yjs.
describe("Bob's undos over Alice's join, through Yjs", () => {
  const cases: Array<[string, Node[], Edit[], Node[][]]> = [
    [
      'undoes typing inside a removed line the join moved after the joined line',
      [h(t('ab')), line('Y'), line('cd')],
      [type([1, 0], 0, 'X'), (tx) => tx.nodes.remove({ at: [1] })],
      [
        [h(t('abcd')), line('XY')],
        [h(t('abcd')), line('Y')],
      ],
    ],
    [
      'undoes typing that a deletion across lines took, kept in the joined line',
      [h(t('ab')), line('Y'), line('cd')],
      [type([0, 0], 2, 'X'), span([[0, 0], 2], [[1, 0], 1])],
      [
        [h(t('abXcd')), line('Y')],
        [h(t('abcd')), line('Y')],
      ],
    ],
    [
      'undoes typing in the second of two equal restored lines',
      [h(t('abX')), line('Y'), line(''), line('cd')],
      [type([2, 0], 0, 'Y'), span([[0, 0], 2], [[2, 0], 1])],
      [
        [h(t('abXcd')), line('Y'), line('Y')],
        [h(t('abXcd')), line('Y'), line('')],
      ],
    ],
    [
      'restores a blank line and then its text after a Backspace in it',
      [line('ab'), line('Q'), line('cd')],
      [cut([1, 0], 0, 1), press('backward', [1, 0])],
      [
        [line('abcd'), line('')],
        [line('abcd'), line('Q')],
      ],
    ],
    [
      'restores a line typed into a blank line and then the blank line',
      [h(t('abX')), line(''), line('cd')],
      [type([1, 0], 0, 'Y'), span([[0, 0], 2], [[1, 0], 1])],
      [
        [h(t('abXcd')), line('Y')],
        [h(t('abXcd')), line('')],
      ],
    ],
    [
      'restores a blank line after a Delete at its end',
      [line('ab'), line(''), line('cd')],
      [press('forward', [1, 0])],
      [[line('abcd'), line('')]],
    ],
  ];

  for (const [name, start, edits, expected] of cases) {
    it(name, () => {
      const { undone } = undoOverJoin(
        start,
        edits,
        [join([1])],
        expected.length
      );

      assert.deepEqual(undone, expected);
    });
  }
});

describe("Bob's undo after Alice removes both lines, through Yjs", () => {
  const removeTwo: Edit = (tx) => {
    tx.nodes.remove({ at: [0] });
    tx.nodes.remove({ at: [0] });
  };
  const start = () => [line('ab'), line('cd'), line('xaybzcwd')];
  const restored = [line('ab'), line('cd'), line('xaybzcwd')];

  it('restores both lines when Alice removes them and types in the third in one update (F1)', () => {
    const { undone } = undoOverJoin(
      start(),
      [cut([0, 0], 1, 2)],
      [both(removeTwo, type([0, 0], 8, '!'))]
    );

    assert.deepEqual(undone, [restored]);
  });

  it('restores both lines when Bob edited the second and Alice removes them, then types in the third (F3)', () => {
    const { undone } = undoOverJoin(
      start(),
      [cut([1, 0], 0, 1)],
      [removeTwo, type([0, 0], 8, '!')]
    );

    assert.deepEqual(undone, [restored]);
  });
});

describe('a change the import does not read as a join, through Yjs', () => {
  const typeInQuote = type([1, 0, 0], 1, 'X');

  it('reads no join when Alice removes a quote and retypes its text at the end of the line above', () => {
    const { alice, bob } = pair([h(t('ab')), q(line('cd'), line('ef'))]);

    alice.editor.update(join([1, 1]));
    deliver(alice, bob);
    bob.editor.update(typeInQuote);
    deliver(bob, alice);
    alice.editor.update((tx) => tx.nodes.remove({ at: [1] }));
    alice.editor.update(type([0, 0], 2, 'cXdef'));

    const { joins } = deliverJoins(alice, bob);

    assert.equal(joins.length, 0);
    undo(bob);
    deliver(bob, alice);
    assert.deepEqual(converged(alice, bob), [h(t('abcXdef'))]);
  });

  it('reads no join when Alice moves a line into the quote before it', () => {
    const { joins, undone } = undoOverJoin(
      [q(line('ab')), line('cd')],
      [typeX],
      [(tx) => tx.nodes.move({ at: [1], to: [0, 1] })]
    );

    assert.equal(joins.length, 0);
    assert.deepEqual(undone, [[q(line('ab'), line('cd'))]]);
  });

  it('reads no join when Alice moves only the last text of a line to the end of the line above and removes the rest', () => {
    const { joins, undone } = undoOverJoin(
      [h(t('ab')), p(t('cd'), link('L'), t('ef'))],
      [typeX],
      [
        (tx) => {
          tx.nodes.move({ at: [1, 2], to: [0, 1] });
          tx.nodes.remove({ at: [1] });
        },
      ]
    );

    assert.equal(joins.length, 0);
    assert.deepEqual(undone, [[h(t('abef'))]]);
  });

  it('converges when Alice joins a line and then removes the link it brought', () => {
    const { undone } = undoOverJoin(
      [h(t('ab')), p(t('cd'), link('L'), t('ef'))],
      [typeX],
      [join([1]), (tx) => tx.nodes.remove({ at: [0, 1] })]
    );

    assert.deepEqual(undone, [[h(t('abcXdef'))]]);
  });

  it('reads no join when Alice inserts a line and joins the next line into it in one commit', () => {
    const { joins, undone } = undoOverJoin(
      [h(t('ab')), line('cd')],
      [typeX],
      [
        (tx) => {
          tx.nodes.insert(line('N'), { at: [1] });
          tx.nodes.merge({ at: [2] });
        },
      ]
    );

    assert.equal(joins.length, 0);
    assert.deepEqual(undone, [[h(t('ab')), line('Ncd')]]);
  });
});

describe('a line removed and its text typed again at the end of the line above in one commit, through Yjs', () => {
  const removeLine: Edit = (tx) => tx.nodes.remove({ at: [1] });

  it("keeps Alice's retyped letters under Bob's undo", () => {
    const { undone } = undoOverJoin(
      [h(t('ab')), line('cd')],
      [typeX],
      [both(removeLine, type([0, 0], 2, 'cXd'))]
    );

    assert.deepEqual(undone, [[h(t('abcXd'))]]);
  });

  it("reads the retype as a join when an older build wrote it as one, so Bob's undo removes his letter", () => {
    const { alice, bob } = pair([h(t('ab')), line('cd')]);

    bob.editor.update(typeX);
    deliver(bob, alice);

    const root = alice.doc.get(ROOT, Y.XmlElement);
    const heading = yjsLineAt(alice, [0]);
    const retyped = yjsLineAt(alice, [1]);
    const [text] = getYjsVisibleChildren(root, retyped);

    alice.doc.transact(() => {
      heading.insert(heading.length, [
        createVirtualYjsMovePlaceholder(getDefined(text)),
      ]);
      hideYjsNode(retyped);
    });
    getActiveYjsController(alice.editor)?.debugProcessAvailableInput();
    deliver(alice, bob);
    undo(bob);
    deliver(bob, alice);

    assert.deepEqual(converged(alice, bob), [h(t('abcd'))]);
  });
});

describe("Alice's redo of text she typed over a line break, through Yjs", () => {
  it('keeps a letter she typed over the boundary after Bob deletes the equal original letter', () => {
    const { alice, bob } = pair([line('ab'), line('cd'), line('ef')]);

    alice.editor.update((tx) => {
      tx.text.insert('bcQ', {
        at: { anchor: at([0, 0], 1), focus: at([1, 0], 1) },
      });
      italicize([1, 0], 0, 2)(tx);
    });
    deliver(alice, bob);
    undo(alice);
    deliver(alice, bob);
    bob.editor.update(cut([1, 0], 0, 1));
    deliver(bob, alice);
    alice.editor.api.history.redo();
    deliver(alice, bob);

    assert.deepEqual(converged(alice, bob), [
      line('abcQd'),
      p(t('ef', italic)),
    ]);
  });
});

describe('a join beside an edit in a named root, through Yjs', () => {
  it("keeps the join when Alice's update also types in the header", () => {
    const { alice, bob } = pair({
      children: [h(t('ab')), line('cd')],
      roots: { header: [line('H')] },
    });

    bob.editor.update(typeX);
    deliver(bob, alice);
    alice.editor.update((tx) => {
      join([1])(tx);
      tx.text.insert('!', { at: { offset: 1, path: [0, 0], root: 'header' } });
    });

    const { imported, joins } = deliverJoins(alice, bob);

    assert.deepEqual(
      imported.map((entry) => entry.importKind),
      ['snapshot-change', 'snapshot-change']
    );
    assert.equal(joins.length, 1);
    undo(bob);
    deliver(bob, alice);
    assert.deepEqual(converged(alice, bob), [h(t('abcd'))]);
    assert.deepEqual(bob.editor.read.value().roots, { header: [line('H!')] });
  });
});

describe("the import's whole-document recovery and join search, through Yjs", () => {
  it('reads the lines of a chain of joins in one commit a bounded number of times each, at the root and in a quote', () => {
    const linesRead = (count: number, quoted: boolean) => {
      const lines = [
        line('A'),
        ...Array.from({ length: count }, () => line('x')),
        line('y'),
      ];
      const joined = [line(`A${'x'.repeat(count)}`), line('y')];
      const { alice, bob } = pair(quoted ? [q(...lines)] : lines);

      alice.editor.update((tx) => {
        for (let index = 0; index < count; index += 1) {
          join(quoted ? [0, 1] : [1])(tx);
        }
      });
      resetCoreWork();
      deliver(alice, bob);
      assert.deepEqual(converged(alice, bob), quoted ? [q(...joined)] : joined);

      return readCoreWork();
    };

    for (const quoted of [false, true]) {
      const short = linesRead(40, quoted);
      const long = linesRead(160, quoted);

      for (const kind of ['yjsJoinSiblingsRead', 'yjsChildrenRead'] as const) {
        assert.ok(
          long[kind] <= 5 * short[kind],
          `${kind}${quoted ? ' in a quote' : ''}: ${long[kind]} for 160 lines, ${short[kind]} for 40`
        );
      }
    }
  });

  it("maps Bob's undo of his marks across a chain of joins in one commit with work that follows the chain, with plain lines and with lines that alternate plain and bold", () => {
    const undoWork = (count: number, alternate: boolean) => {
      const marks = (index: number) => (alternate && index % 2 ? bold : {});
      const leaves = [t('A')];

      for (let index = 1; index <= count; index += 1) {
        if (alternate) {
          leaves.push(t('x', marks(index)));
        } else {
          leaves[0] = t(`${leaves[0].text}x`);
        }
      }

      const { alice, bob } = pair([
        h(t('A')),
        ...Array.from({ length: count }, (_, index) =>
          p(t('x', marks(index + 1)))
        ),
      ]);

      bob.editor.update((tx) => {
        for (let index = 1; index <= count; index += 1) {
          italicize([index, 0], 0, 1)(tx);
        }
      });
      deliver(bob, alice);
      alice.editor.update((tx) => {
        for (let joined = 0; joined < count; joined += 1) join([1])(tx);
      });
      deliver(alice, bob);
      resetCoreWork();
      undo(bob);

      const work = readCoreWork();

      deliver(bob, alice);
      assert.deepEqual(converged(alice, bob), [h(...leaves)]);

      return work;
    };

    for (const alternate of [false, true]) {
      const short = undoWork(40, alternate);
      const long = undoWork(160, alternate);

      for (const kind of ['sectionsWalked', 'walkedSlots'] as const) {
        assert.ok(
          long[kind] <= 5 * short[kind],
          `${kind}${alternate ? ' with alternating bold' : ''}: ${long[kind]} for 160 lines, ${short[kind]} for 40`
        );
      }
    }
  });

  it('keeps a join that a diff of the two documents would write as the first line retyped into the second', () => {
    const { alice, bob } = pair({
      children: [line('ab'), line('cdef')],
      roots: { header: [line('H')] },
    });

    bob.editor.update(type([0, 0], 1, 'X'));
    deliver(bob, alice);
    alice.editor.update((tx) => {
      join([1])(tx);
      tx.text.insert('!', { at: { offset: 1, path: [0, 0], root: 'header' } });
    });

    const { imported } = deliverJoins(alice, bob);

    assert.deepEqual(
      imported.map((entry) => entry.importKind),
      ['snapshot-change', 'snapshot-change'],
      'the whole-document recovery'
    );
    undo(bob);
    deliver(bob, alice);
    assert.deepEqual(converged(alice, bob), [line('abcdef')]);
  });

  it("reads no join when Bob's link in the second line has no placeholder at the end of the line above", () => {
    const { alice, bob } = pair([h(t('ab')), line('cd')]);

    bob.editor.update((tx) => tx.nodes.insert(link('M'), { at: [1, 1] }));
    alice.editor.update(join([1]));

    assert.equal(deliverJoins(alice, bob).joins.length, 0);
  });
});

describe('case 164 beside an edit in a named root, through Yjs', () => {
  it('deletes the e Alice deleted from beed when her update also types in the header', () => {
    const { alice, bob } = pair({
      children: [
        line('a'),
        line(''),
        line('a'),
        line('cee'),
        line('e'),
        { type: 'heading', level: 2, children: [t('XYdac')] },
        line('be'),
      ],
      roots: { header: [line('H')] },
    });

    bob.editor.update((tx) => {
      cut([5, 0], 0, 2)(tx);
      type([6, 0], 2, 'ed')(tx);
    });
    deliver(bob, alice);
    alice.editor.update((tx) => {
      cut([6, 0], 1, 2)(tx);
      join([6])(tx);
      tx.text.insert('!', { at: { offset: 1, path: [0, 0], root: 'header' } });
    });

    const { joins } = deliverJoins(alice, bob);

    assert.equal(joins.length, 1);
    undo(bob);
    deliver(bob, alice);
    assert.deepEqual(converged(alice, bob).slice(5), [
      { type: 'heading', level: 2, children: [t('XYdacb')] },
    ]);
  });
});

// A joined line shows one text through several Yjs texts until it is
// rewritten, so each later edit in it must reach the same Yjs children.
describe("Alice's edit in a joined line right after her join reached Bob, through Yjs", () => {
  const afterJoin = (start: Node[], edit: Edit) => {
    const { alice, bob } = pair(start);

    alice.editor.update(join([1]));
    deliver(alice, bob);
    assert.equal(holdsPlaceholder(yjsLineAt(alice, [0])), true);
    alice.editor.update(edit);
    deliver(alice, bob);

    return converged(alice, bob);
  };
  const plain = () => [h(t('ab')), line('cd')];

  it('converges after Alice inserts a link in it', () => {
    assert.deepEqual(
      afterJoin(plain(), (tx) =>
        tx.nodes.insert(link('L'), { at: at([0, 0], 3) })
      ),
      [h(t('abc'), link('L'), t('d'))]
    );
  });

  it('converges after Alice removes a link it holds', () => {
    assert.deepEqual(
      afterJoin([h(t('ab')), p(t('cd'), link('L'), t('ef'))], (tx) =>
        tx.nodes.remove({ at: [0, 1] })
      ),
      [h(t('abcdef'))]
    );
  });

  it('converges after Alice bolds letters on both sides of the junction', () => {
    assert.deepEqual(
      afterJoin(
        plain(),
        both(select([[0, 0], 1], [[0, 0], 3]), (tx) =>
          tx.marks.add('bold', true)
        )
      ),
      [h(t('a'), t('bc', bold), t('d'))]
    );
  });

  it('converges after Alice presses Enter at the junction', () => {
    assert.deepEqual(
      afterJoin(
        plain(),
        both(caret([0, 0], 2), (tx) => tx.break.insert())
      ),
      [h(t('ab')), h(t('cd'))]
    );
  });

  it('converges after Alice deletes across the junction', () => {
    assert.deepEqual(afterJoin(plain(), cut([0, 0], 1, 3)), [h(t('ad'))]);
  });

  it("converges after Alice sets the joined line's type", () => {
    assert.deepEqual(
      afterJoin(plain(), (tx) =>
        tx.nodes.set({ type: 'paragraph' }, { at: [0] })
      ),
      [line('abcd')]
    );
  });

  it('converges after Alice types at the junction', () => {
    assert.deepEqual(afterJoin(plain(), type([0, 0], 2, 'X')), [h(t('abXcd'))]);
  });

  it('converges after Alice moves a link it holds to another line', () => {
    assert.deepEqual(
      afterJoin(
        [h(t('ab')), p(t('cd'), link('L'), t('ef')), p(t('gh'))],
        (tx) => tx.nodes.move({ at: [0, 1], to: [1, 1] })
      ),
      [h(t('abcdef')), p(t('gh'), link('L'), t(''))]
    );
  });
});

describe('an inline element added to or removed from a joined line, through Yjs', () => {
  const afterJoin = (start: Node[], aliceEdit: Edit, bobEdit: Edit) => {
    const { alice, bob } = pair(start);

    alice.editor.update(join([1]));
    deliver(alice, bob);
    alice.editor.update(aliceEdit);
    bob.editor.update(bobEdit);
    deliver(alice, bob);
    deliver(bob, alice);

    return converged(alice, bob);
  };

  it("keeps Bob's letter when Alice adds a link at the end of the joined line", () => {
    assert.deepEqual(
      afterJoin(
        [h(t('ab')), p(t('cd'))],
        (tx) => tx.nodes.insert(link('M'), { at: [0, 1] }),
        type([0, 0], 3, 'Y')
      ),
      [h(t('abcYd'), link('M'), t(''))]
    );
  });

  it("keeps Bob's letter when Alice adds a link where the two lines met", () => {
    assert.deepEqual(
      afterJoin(
        [h(t('ab')), p(t('cd'))],
        (tx) => tx.nodes.insert(link('M'), { at: at([0, 0], 2) }),
        type([0, 0], 3, 'Y')
      ),
      [h(t('ab'), link('M'), t('cYd'))]
    );
  });

  it("keeps Bob's letter when Alice removes a link from the first line's part", () => {
    assert.deepEqual(
      afterJoin(
        [h(t('a'), link('L'), t('b')), p(t('cd'))],
        (tx) => tx.nodes.remove({ at: [0, 1] }),
        type([0, 2], 2, 'Y')
      ),
      [h(t('abcYd'))]
    );
  });

  it("undoes Bob's letter when Alice's later commit removes a link from the first line's part", () => {
    const { undone } = undoOverJoin(
      [h(t('a'), link('L'), t('b')), p(t('cd'))],
      [type([1, 0], 1, 'X')],
      [join([1]), (tx) => tx.nodes.remove({ at: [0, 1] })]
    );

    assert.deepEqual(undone, [[h(t('abcd'))]]);
  });

  it("keeps the second line's letters when Alice removes the link she added at the end of the joined line", () => {
    const { alice, bob } = pair([h(t('ab')), p(t('cd'))]);

    for (const edit of [
      join([1]),
      (tx: EditorUpdateTransaction) =>
        tx.nodes.insert(link('M'), { at: [0, 1] }),
      (tx: EditorUpdateTransaction) => tx.nodes.remove({ at: [0, 1] }),
    ]) {
      alice.editor.update(edit);
      deliver(alice, bob);
    }

    assert.deepEqual(converged(alice, bob), [h(t('abcd'))]);
  });
});

describe('placeholders a peer writes beside a split, through Yjs', () => {
  const seeded = (value: Node[]) => {
    const { doc } = createPeer('alice', new Y.Doc(), value, 'edit');
    const writer = new Y.Doc();

    documents.add(writer);
    Y.applyUpdate(writer, Y.encodeStateAsUpdate(doc));

    return writer;
  };
  const reader = (writer: Y.Doc) => {
    const doc = new Y.Doc();

    Y.applyUpdate(doc, Y.encodeStateAsUpdate(writer));

    return createPeer(
      'bob',
      doc,
      readPliteValueFromYjs(writer.get(ROOT, Y.XmlElement)),
      'edit'
    );
  };
  const send = (writer: Y.Doc, to: Peer) => {
    Y.applyUpdate(
      to.doc,
      Y.encodeStateAsUpdate(writer, Y.encodeStateVector(to.doc))
    );
    getActiveYjsController(to.editor)?.debugProcessAvailableInput();
  };

  it('keeps the moved text when a line inside a quote shows again through a placeholder after it', () => {
    const writer = seeded([q(line('b'), line('a'), line('b'))]);
    const quote = getYjsNode(writer.get(ROOT, Y.XmlElement), [0]);
    assert.ok(quote instanceof Y.XmlElement);
    const [first, left, donor] = quote.toArray();

    assert.ok(first instanceof Y.XmlElement);
    assert.ok(left instanceof Y.XmlElement);
    assert.ok(donor instanceof Y.XmlElement);
    hideYjsNode(donor);
    const suffix = createVirtualYjsMovePlaceholder(getDefined(donor.get(0)));
    quote.insert(1, [createVirtualYjsMovePlaceholder(first)]);
    const bob = reader(writer);

    writer.transact(() => {
      quote.push([createVirtualYjsMovePlaceholder(first)]);
      left.push([suffix]);
    });
    send(writer, bob);

    assert.deepEqual(children(bob), [q(line('b'), line('ab'))]);
  });

  it('keeps the moved text when a removed placeholder had shown a line through another line', () => {
    const writer = seeded([
      line('e'),
      line(''),
      line('a'),
      line('x'),
      line('x'),
    ]);
    const root = writer.get(ROOT, Y.XmlElement);
    const [e, b, a] = [0, 1, 2].map((index) => getYjsNode(root, [index]));

    assert.ok(e instanceof Y.XmlElement);
    assert.ok(b instanceof Y.XmlElement);
    assert.ok(a instanceof Y.XmlElement);
    const shown = createVirtualYjsMovePlaceholder(getYjsNode(root, [3, 0]));
    a.push([shown]);
    const id = assignFreshYjsNodeId(shown);
    b.delete(0, b.length);
    b.setAttribute(YJS_VIRTUAL_CHILD_ID_KEY, id);
    const suffix = createVirtualYjsMovePlaceholder(getYjsNode(root, [4, 0]));
    const bob = reader(writer);

    writer.transact(() => {
      root.insert(2, [createYjsNode(line('z'))]);
      root.insert(4, [createYjsNode(line('x'))]);
      e.push([suffix]);
    });
    send(writer, bob);

    assert.deepEqual(children(bob), [
      line('ex'),
      line('x'),
      line('z'),
      line('a'),
      line('x'),
      line(''),
      line(''),
    ]);
  });
});

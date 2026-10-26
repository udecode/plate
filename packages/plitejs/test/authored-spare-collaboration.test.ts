import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';

import {
  createEditor,
  createEditorView,
  defineEditorSchema,
  type Editor,
  property,
  schema,
  target,
  type Value as EditorValue,
} from 'plitejs';
import * as Y from 'yjs';

import { createAuthoredPlugin } from '../src/authored/authored';
import { reserveIdOf } from '../src/authored/facts/records';
import { readCoreWork } from '../src/core/work';
import { getDefined } from '../src/internal/get-defined';
import { yjs } from '../src/yjs';
import { getActiveYjsController } from '../src/yjs/core/controller-registry';
import { createYjsNode, readPliteValueFromYjs } from '../src/yjs/core/document';
import {
  authoredTestApi,
  recordsOf,
  unsettledCommits,
} from './support/authored';
import { withoutLawCheck } from './support/law-check';
import { getVisibleYjsNode } from './yjs/support/collaboration';

type Node = Readonly<{
  authored?: ReadonlyArray<Record<string, unknown>>;
  children?: readonly Node[];
  id?: string;
  text?: string;
  type?: string;
  [key: string]: unknown;
}>;
/** A start value: the main root's children, or those and the named roots'. */
type Start =
  | readonly Node[]
  | Readonly<{
      children: readonly Node[];
      roots: Readonly<Record<string, readonly Node[]>>;
    }>;
type TestEditor = Editor<EditorValue, readonly unknown[]>;
type Decision = Readonly<{ action: 'accept' | 'reject'; changes: string[] }>;

const c = schema.content;
let made = 0;
const elements = {
  column: {
    content: c.types(['paragraph', 'quote'], {
      default: { type: 'paragraph' },
      min: 1,
    }),
  },
  pair: {
    content: c.type('paragraph', { default: { type: 'paragraph' }, min: 2 }),
  },
  paragraph: schema.element.textBlock(),
  quote: {
    content: c.type('paragraph', { default: { type: 'paragraph' }, min: 1 }),
  },
};
const root = c.types(['paragraph', 'quote', 'column', 'pair'], {
  default: { type: 'paragraph' },
  min: 1,
});
const Generated = defineEditorSchema('schema:authored-spare-collaboration', {
  elements,
  id: 'authored-spare-collaboration',
  properties: [
    schema.elementProperty(
      'id',
      property.string({ generate: () => `g${(made += 1)}` }),
      {
        role: 'metadata',
        target: target.group('element'),
        typeChange: 'preserve-if-allowed',
        unique: true,
      }
    ),
    schema.elementProperty('align', property.string(), {
      target: target.type('quote'),
    }),
  ],
  root,
  unknown: 'reject',
  version: 1,
} as never);
const Plain = defineEditorSchema('schema:authored-spare-collaboration-plain', {
  elements,
  id: 'authored-spare-collaboration-plain',
  properties: [
    schema.elementProperty('align', property.string(), {
      target: target.type('quote'),
    }),
  ],
  root,
  unknown: 'reject',
  version: 1,
} as never);

const documents = new Set<Y.Doc>();
const { guard, take: unsettled } = unsettledCommits();

afterEach(() => {
  for (const doc of documents) doc.destroy();
  documents.clear();
  assert.deepEqual(unsettled(), [], 'a commit left a ready group unsettled');
});

const mark = (kind: string, change: string) => ({
  at: 1,
  author: change,
  change,
  kind,
});
/** A node and everything inside it under one mark, as a whole-node suggestion records it. */
const whole = (node: Node, kind: string, change: string): Node => ({
  ...node,
  authored: [...(node.authored ?? []), mark(kind, change)],
  ...(node.children
    ? { children: node.children.map((child) => whole(child, kind, change)) }
    : {}),
});
const p = (text: string, id = `p-${text}`): Node => ({
  children: [{ text }],
  id,
  type: 'paragraph',
});
const el = (type: string, id: string, ...children: Node[]): Node => ({
  children,
  id,
  type,
});
const accept = (change: string): Decision => ({
  action: 'accept',
  changes: [change],
});

const peerOf = (
  doc: Y.Doc,
  value?: Start,
  plugin: unknown = Generated,
  authored: Readonly<Record<string, unknown>> = {}
): TestEditor => {
  documents.add(doc);

  return guard(
    createEditor<EditorValue, readonly unknown[]>({
      ...(value ? { initialValue: structuredClone(value) as never } : {}),
      plugins: [
        plugin,
        createAuthoredPlugin({ authorId: 'zed', ...authored }),
        yjs({ doc, initialReady: true, ...(value ? { seed: true } : {}) }),
      ] as never,
    })
  );
};
const roomOf = (editor: TestEditor) =>
  getDefined(getActiveYjsController(editor)).debugRoot();
const elementsAt = (
  editor: TestEditor,
  paths: ReadonlyArray<readonly number[]>
) => paths.map((path) => getVisibleYjsNode(roomOf(editor), [...path]));

/**
 * Three peers on one room: the first two decide, the third makes `edit`, all
 * before anything is delivered. The deciders' updates reach the third peer
 * and each other in `order`, then every peer receives everything.
 */
const race = ({
  decisions,
  edit,
  elements: paths,
  order,
  start,
}: Readonly<{
  decisions: readonly [Decision, Decision];
  edit: (editor: TestEditor) => void;
  elements: ReadonlyArray<readonly number[]>;
  order: 'one first' | 'two first';
  start: readonly Node[];
}>) => {
  const docs = [new Y.Doc(), new Y.Doc(), new Y.Doc()];
  const peers = [peerOf(docs[0], start)];
  const seed = Y.encodeStateAsUpdate(docs[0]);

  Y.applyUpdate(docs[1], seed);
  Y.applyUpdate(docs[2], seed);
  peers.push(peerOf(docs[1]), peerOf(docs[2]));

  const keptByDeciders = decisions.map((decision, index) => {
    const before = elementsAt(peers[index], paths);

    authoredTestApi(peers[index]).decide(decision);

    return elementsAt(peers[index], paths).map(
      (element, at) => element === before[at]
    );
  });

  edit(peers[2]);

  const deliver = (from: number, to: number) => {
    Y.applyUpdate(
      docs[to],
      Y.encodeStateAsUpdate(docs[from], Y.encodeStateVector(docs[to]))
    );
    getDefined(getActiveYjsController(peers[to])).debugProcessAvailableInput();
  };
  const [first, second] = order === 'one first' ? [0, 1] : [1, 0];

  deliver(first, 2);
  deliver(second, 2);
  deliver(2, first);
  deliver(2, second);
  deliver(first, second);
  deliver(second, first);
  for (const from of [0, 1, 2]) {
    for (const to of [0, 1, 2]) if (from !== to) deliver(from, to);
  }

  return {
    editors: peers.map((peer) => peer.read.value().children),
    keptByDeciders,
    rooms: peers.map((peer) => readPliteValueFromYjs(roomOf(peer))),
  };
};
const textsOf = (nodes: readonly Node[]): unknown[] =>
  nodes.map((node) =>
    node.children?.some((child) => child.type)
      ? { [getDefined(node.type)]: textsOf(node.children) }
      : (node.children ?? []).map(({ text }) => text).join('')
  );
const idsOf = (nodes: readonly Node[]): unknown[] =>
  nodes.flatMap((node) =>
    node.children ? [node.id, ...idsOf(node.children)] : []
  );
const typeAt = (path: readonly number[]) => (editor: TestEditor) =>
  editor.update((tx) =>
    tx.text.insert('X', { at: { offset: 0, path: [...path] } })
  );
const raced = (
  input: Omit<Parameters<typeof race>[0], 'order'>,
  order: 'one first' | 'two first'
) => {
  const outcome = race({ ...input, order });

  for (const [index, room] of outcome.rooms.entries()) {
    assert.deepEqual(room, outcome.editors[index], `${order}: room ${index}`);
  }

  return {
    keptByDeciders: outcome.keptByDeciders,
    texts: outcome.editors.map((children) => textsOf(children as Node[])),
  };
};

describe('a decision that spans two regions of a shared room', () => {
  for (const [quote, path] of [
    ['first', [0, 1, 0]],
    ['second', [2, 1, 0]],
  ] as const) {
    for (const line of ['plain', 'inserted'] as const) {
      it(`keeps both quotes’ Yjs elements and a third peer’s letter in the ${quote} quote’s ${line} kept line when two peers accept one deletion across two quotes an untouched paragraph separates, in both delivery orders`, () => {
        const kept = (text: string, id: string) =>
          line === 'plain' ? p(text, id) : whole(p('', id), 'insert', 'A');
        const keptText = (text: string, typed: boolean) =>
          `${typed ? 'X' : ''}${line === 'plain' ? text : ''}`;
        const texts = [
          { quote: [keptText('k1', path[0] === 0)] },
          'mid',
          { quote: [keptText('k2', path[0] === 2)] },
        ];

        for (const order of ['one first', 'two first'] as const) {
          assert.deepEqual(
            raced(
              {
                decisions: [accept('A'), accept('A')],
                edit: typeAt(path),
                elements: [[0], [2]],
                start: [
                  el(
                    'quote',
                    'q1',
                    whole(p('a1'), 'delete', 'A'),
                    kept('k1', 'f1')
                  ),
                  p('mid'),
                  el(
                    'quote',
                    'q2',
                    whole(p('a2'), 'delete', 'A'),
                    kept('k2', 'f2')
                  ),
                ],
              },
              order
            ),
            {
              keptByDeciders: [
                [true, true],
                [true, true],
              ],
              texts: [texts, texts, texts],
            },
            order
          );
        }
      });
    }
  }

  it('keeps a column’s and both its quotes’ Yjs elements and a third peer’s letter when two peers accept one deletion across the two quotes, in both delivery orders', () => {
    const texts = [{ column: [{ quote: ['Xk1'] }, 'mid', { quote: ['k2'] }] }];

    for (const order of ['one first', 'two first'] as const) {
      assert.deepEqual(
        raced(
          {
            decisions: [accept('A'), accept('A')],
            edit: typeAt([0, 0, 1, 0]),
            elements: [[0], [0, 0], [0, 2]],
            start: [
              el(
                'column',
                'c',
                el('quote', 'q1', whole(p('a1'), 'delete', 'A'), p('k1')),
                p('mid'),
                el('quote', 'q2', whole(p('a2'), 'delete', 'A'), p('k2'))
              ),
            ],
          },
          order
        ),
        {
          keptByDeciders: [
            [true, true, true],
            [true, true, true],
          ],
          texts: [texts, texts, texts],
        },
        order
      );
    }
  });
});

describe('a decision that keeps a container in a shared room', () => {
  it('keeps the quote’s and its kept line’s Yjs elements and writes no element when a peer accepts the deletion that settles the quote’s spare', () => {
    const editor = peerOf(new Y.Doc(), [
      el(
        'quote',
        'q',
        whole(p('a'), 'delete', 'A'),
        whole(p('', 'fill'), 'insert', 'A')
      ),
    ]);
    const doc = getDefined(getActiveYjsController(editor)).debugRoot().doc!;
    const before = elementsAt(editor, [[0], [0, 1]]);
    const vector = Y.encodeStateVector(doc);

    authoredTestApi(editor).decide(accept('A'));

    const written = Y.decodeUpdate(Y.encodeStateAsUpdate(doc, vector));

    assert.deepEqual(
      {
        elements: elementsAt(editor, [[0], [0, 0]]).map(
          (element, at) => element === before[at]
        ),
        newElements: written.structs.filter(
          (struct) =>
            struct instanceof Y.Item && struct.content instanceof Y.ContentType
        ).length,
        room: readPliteValueFromYjs(roomOf(editor)),
      },
      {
        elements: [true, true],
        newElements: 0,
        room: editor.read.value().children,
      }
    );
  });

  it('keeps a quote’s Yjs element when a peer suggests setting its format and removing one of its lines, and when it accepts that suggestion, under a schema that stores no spares', () => {
    const editor = peerOf(
      new Y.Doc(),
      [
        {
          children: [
            { children: [{ text: 'a' }], type: 'paragraph' },
            { children: [{ text: 'b' }], type: 'paragraph' },
          ],
          type: 'quote',
        },
      ],
      Plain,
      { createChangeId: () => 'F', intent: 'propose' }
    );
    const [quote] = elementsAt(editor, [[0]]);
    const kept = () => elementsAt(editor, [[0]])[0] === quote;

    editor.update((tx) => {
      tx.nodes.set({ align: 'center' }, { at: [0] });
      tx.nodes.remove({ at: [0, 1] });
    });

    const suggested = kept();

    authoredTestApi(editor).decide(accept('F'));

    assert.deepEqual(
      {
        kept: [suggested, kept()],
        room: readPliteValueFromYjs(roomOf(editor)),
      },
      {
        kept: [true, true],
        room: [
          {
            align: 'center',
            children: [{ children: [{ text: 'a' }], type: 'paragraph' }],
            type: 'quote',
          },
        ],
      }
    );
  });
});

describe('a change that sets a block’s properties and changes its lines', () => {
  const editorOf = (
    value: readonly Node[],
    plugin: unknown,
    authored?: Readonly<Record<string, unknown>>
  ) =>
    guard(
      createEditor<EditorValue, readonly unknown[]>({
        initialValue: structuredClone(value) as never,
        plugins: [
          plugin,
          ...(authored
            ? [createAuthoredPlugin({ authorId: 'zed', ...authored })]
            : []),
        ] as never,
      })
    );
  const line = (text: string): Node => ({
    children: [{ text }],
    type: 'paragraph',
  });

  it('keeps the block’s node key when an app replaces the value', () => {
    const editor = editorOf(
      [{ children: [line('a'), line('b')], type: 'quote' }],
      Plain
    );
    const key = editor.key([0]);
    const children = [
      { align: 'center', children: [line('a')], type: 'quote' },
    ];

    editor.update((tx) => tx.value.replace({ children } as never));

    assert.deepEqual(
      { children: editor.read.value().children, key: editor.key([0]) },
      { children, key }
    );
  });

  it('keeps the block’s node key when a value replace loads pending changes that its spare repair completes', () => {
    const editor = editorOf([el('quote', 'q', p('z'))], Generated, {});
    const key = editor.key([0]);

    editor.update((tx) =>
      tx.value.replace({
        children: [
          {
            ...el(
              'quote',
              'q',
              p('z'),
              whole(p('b'), 'delete', 'B'),
              whole(p('c'), 'insert', 'C')
            ),
            align: 'center',
          },
        ],
      } as never)
    );

    const [quote] = editor.read.value().children as Node[];

    assert.deepEqual(
      {
        align: quote.align,
        key: editor.key([0]),
        lines: quote.children?.map(({ id }) => id),
        spares: (quote.authored ?? []).map(({ kind }) => kind),
      },
      {
        align: 'center',
        key,
        lines: ['p-z', 'p-b', 'p-c'],
        spares: ['reserve'],
      }
    );
  });

  for (const [preview, action, shown] of [
    ['accepted', 'accept', [line('x')]],
    ['proposed', 'reject', [line('x'), line('y')]],
  ] as const) {
    it(`shows two quotes the same in the ${preview} preview after a peer ${action}s a suggestion that sets their format and removes a line from each`, () => {
      const editor = editorOf(
        [
          { children: [line('x'), line('y')], type: 'quote' },
          { children: [line('x'), line('y')], type: 'quote' },
        ],
        Plain,
        { createChangeId: () => 'F', intent: 'propose' }
      );

      editor.update((tx) => {
        for (const at of [0, 1]) {
          tx.nodes.set({ align: 'center' }, { at: [at] });
          tx.nodes.remove({ at: [at, 1] });
        }
      });
      (
        editor.api as unknown as {
          authored: { setView: (view: object) => void };
        }
      ).authored.setView({ preview });
      authoredTestApi(editor).decide({ action, changes: ['F'] });

      const quote = {
        ...(action === 'accept' ? { align: 'center' } : {}),
        children: shown,
        type: 'quote',
      };

      assert.deepEqual(editor.read.children(), [quote, quote]);
    });
  }
});

describe('a line only the editors hold', () => {
  const orders = ['one first', 'two first'] as const;
  const generatedId = schema.elementProperty(
    'id',
    property.string({ generate: () => `g${(made += 1)}` }),
    {
      role: 'metadata',
      target: target.group('element'),
      typeChange: 'preserve-if-allowed',
      unique: true,
    }
  );
  const RootPair = defineEditorSchema(
    'schema:authored-spare-collaboration-root-pair',
    {
      elements,
      id: 'authored-spare-collaboration-root-pair',
      properties: [generatedId],
      root: c.type('paragraph', { default: { type: 'paragraph' }, min: 2 }),
      unknown: 'reject',
      version: 1,
    } as never
  );
  const sideRoot = c.type('paragraph', {
    default: { type: 'paragraph' },
    min: 1,
  });
  const WithSide = defineEditorSchema(
    'schema:authored-spare-collaboration-side',
    {
      elements,
      id: 'authored-spare-collaboration-side',
      properties: [generatedId],
      root: sideRoot,
      roots: { side: sideRoot },
      unknown: 'reject',
      version: 1,
    } as never
  );
  const WithSideAndContentRoots = defineEditorSchema(
    'schema:authored-spare-collaboration-side-content-roots',
    {
      elements: {
        ...elements,
        card: {
          content: c.text({ default: 'text', min: 1 }),
          contentRoots: {
            body: { content: sideRoot, ownership: 'exclusive' },
          },
        },
      },
      id: 'authored-spare-collaboration-side-content-roots',
      properties: [generatedId],
      root: c.types(['paragraph', 'card'], {
        default: { type: 'paragraph' },
        min: 1,
      }),
      roots: { side: sideRoot },
      unknown: 'reject',
      version: 1,
    } as never
  );
  const RootQuote = defineEditorSchema(
    'schema:authored-spare-collaboration-root-quote',
    {
      elements,
      id: 'authored-spare-collaboration-root-quote',
      properties: [generatedId],
      root: c.type('quote', { default: { type: 'quote' }, min: 1 }),
      unknown: 'reject',
      version: 1,
    } as never
  );
  const roomFor = (start: Start, plugin: unknown = Generated) => {
    const docs = [new Y.Doc(), new Y.Doc(), new Y.Doc()];
    const authored = { createChangeId: () => 'M' };
    const peers = [peerOf(docs[0], start, plugin, authored)];
    const seed = Y.encodeStateAsUpdate(docs[0]);

    Y.applyUpdate(docs[1], seed);
    Y.applyUpdate(docs[2], seed);
    peers.push(
      peerOf(docs[1], undefined, plugin, authored),
      peerOf(docs[2], undefined, plugin, authored)
    );

    const deliver = (from: number, to: number) => {
      Y.applyUpdate(
        docs[to],
        Y.encodeStateAsUpdate(docs[from], Y.encodeStateVector(docs[to]))
      );
      getDefined(
        getActiveYjsController(peers[to])
      ).debugProcessAvailableInput();
    };
    const settle = () => {
      for (let round = 0; round < 2; round++) {
        for (const from of [0, 1, 2]) {
          for (const to of [0, 1, 2]) if (from !== to) deliver(from, to);
        }
      }
    };
    /** A peer that joins once every update reached every room. */
    const latecomer = () => {
      const doc = new Y.Doc();

      for (const from of docs) Y.applyUpdate(doc, Y.encodeStateAsUpdate(from));

      const peer = peerOf(doc, undefined, plugin, authored);

      getDefined(getActiveYjsController(peer)).debugProcessAvailableInput();

      return { doc, peer };
    };

    return { deliver, docs, latecomer, peers, settle };
  };
  const decided = (
    start: Start,
    decisions: readonly [Decision, Decision],
    order: (typeof orders)[number],
    plugin: unknown = Generated
  ) => {
    const room = roomFor(start, plugin);
    const [first, second] = order === 'one first' ? [0, 1] : [1, 0];

    for (const [index, decision] of decisions.entries()) {
      authoredTestApi(room.peers[index]).decide(decision);
    }
    room.deliver(first, 2);
    room.deliver(second, 2);
    room.deliver(first, second);
    room.deliver(second, first);
    room.settle();

    return room;
  };
  const values = (peers: readonly TestEditor[]) =>
    peers.map((peer) => peer.read.value());
  const rooms = (peers: readonly TestEditor[]) =>
    peers.map((peer) => readPliteValueFromYjs(roomOf(peer)));
  const children = (peers: readonly TestEditor[]) =>
    peers.map((peer) => peer.read.value().children as Node[]);
  const spareIdIn = (node: Node) =>
    (
      node.authored?.find(({ kind }) => kind === 'reserve')?.node as
        | Node
        | undefined
    )?.id;
  const emptiedQuote = () => [
    el(
      'quote',
      'q',
      whole(p('a'), 'delete', 'D1'),
      whole(p('b'), 'delete', 'D2')
    ),
  ];
  const both = [accept('D1'), accept('D2')] as const;
  const reservesOf = (records: Readonly<Record<string, unknown>> = {}) =>
    Object.fromEntries(
      Object.entries(records).map(([id, record]) => [
        id,
        typeof record === 'string' ? JSON.parse(record) : record,
      ])
    );
  const roomReserves = (doc: Y.Doc) =>
    reservesOf(doc.getMap('document:records:authored-reserves').toJSON());
  const editorReserves = (peer: TestEditor) =>
    reservesOf(recordsOf(peer.read.value())['authored-reserves']);
  const lettersOf = (nodes: readonly Node[]) =>
    textsOf(nodes).join('').split('').sort();
  const typeInto =
    (letter: string, path: readonly number[]) => (editor: TestEditor) =>
      editor.update((tx) =>
        tx.text.insert(letter, { at: { offset: 0, path: [...path] } })
      );

  it('builds the line of a quote two peers’ accepts empty from the quote’s spare in every editor, in both delivery orders', () => {
    for (const order of orders) {
      const { peers } = decided(emptiedQuote(), both, order);
      const [editor] = children(peers);
      const [quote] = editor;

      assert.deepEqual(
        {
          built: quote.authored?.map(({ built }) => built),
          editors: children(peers),
          lines: (quote.children ?? []).map(({ id }) => id),
        },
        {
          built: [true],
          editors: [editor, editor, editor],
          lines: [spareIdIn(quote)],
        },
        order
      );
    }
  });

  const spareQuotesWithRepeatedId = () => {
    const doc = new Y.Doc();
    const decider = peerOf(doc, [
      el(
        'quote',
        'q1',
        whole(p('a'), 'delete', 'D1'),
        whole(p('b'), 'delete', 'D2')
      ),
      p('x1'),
      p('x2'),
      p('x3'),
      el(
        'quote',
        'q2',
        whole(p('c'), 'delete', 'D3'),
        whole(p('d'), 'delete', 'D4')
      ),
    ]);

    authoredTestApi(decider).decide({
      action: 'accept',
      changes: ['D1', 'D3'],
    });

    const raw = new Y.Doc();

    documents.add(raw);
    Y.applyUpdate(raw, Y.encodeStateAsUpdate(doc));
    raw.transact(() => {
      const main = raw.get('document', Y.XmlElement);

      for (const at of [0, 4]) (main.get(at) as Y.XmlElement).delete(0, 1);
      main.insert(0, [createYjsNode(p('x', 'q2') as never)]);
    });

    return Y.encodeStateAsUpdate(raw);
  };

  it('keeps the Yjs element of every block between two quotes whose lines only the editors hold when a peer’s load renames an id the room repeats', () => {
    const doc = new Y.Doc();

    Y.applyUpdate(doc, spareQuotesWithRepeatedId());

    const before = doc.get('document', Y.XmlElement).toArray();

    getDefined(
      getActiveYjsController(peerOf(doc))
    ).debugProcessAvailableInput();

    const after = doc.get('document', Y.XmlElement).toArray();

    assert.deepEqual(
      [2, 3, 4].map((at) => after[at] === before[at]),
      [true, true, true]
    );
  });

  it('builds each quote’s line from its spare and gives both editors one document when two peers load a room that repeats an id at once', () => {
    const update = spareQuotesWithRepeatedId();
    const docs = [new Y.Doc(), new Y.Doc()];

    for (const doc of docs) Y.applyUpdate(doc, update);

    const peers = docs.map((doc) => peerOf(doc));

    for (const [from, to] of [
      [0, 1],
      [1, 0],
    ] as const) {
      Y.applyUpdate(
        docs[to],
        Y.encodeStateAsUpdate(docs[from], Y.encodeStateVector(docs[to]))
      );
      getDefined(
        getActiveYjsController(peers[to])
      ).debugProcessAvailableInput();
    }

    const [editor] = children(peers);
    const quotes = editor.filter(({ type }) => type === 'quote');

    assert.deepEqual(
      {
        blocks: editor.length,
        editors: children(peers),
        lines: quotes.map((quote) =>
          (quote.children ?? []).map(({ id }) => id)
        ),
      },
      {
        blocks: 6,
        editors: [editor, editor],
        lines: quotes.map((quote) => [spareIdIn(quote)]),
      }
    );
  });

  it('builds the line of a root two peers’ accepts empty from the root’s spare in every editor, in both delivery orders', () => {
    const start = [
      whole(p('a'), 'delete', 'D1'),
      whole(p('b'), 'delete', 'D2'),
    ];

    for (const order of orders) {
      const { peers } = decided(start, both, order);
      const [value] = values(peers);
      const spares = Object.values(
        recordsOf(value)['authored-reserves'] ?? {}
      ) as Array<{ built?: true; node: Node }>;

      assert.deepEqual(
        {
          built: spares.map(({ built }) => built),
          editors: values(peers),
          lines: (value.children as Node[]).map(({ id }) => id),
        },
        {
          built: [true],
          editors: [value, value, value],
          lines: [spares[0]?.node.id],
        },
        order
      );
    }
  });

  it('builds the spare a decision takes in every editor when two peers stored a spare for the slot, in both delivery orders', () => {
    const spare = (change: string, id: string) => ({
      ...mark('reserve', change),
      node: { children: [{ text: '' }], id, type: 'paragraph' },
      slot: { min: 0 },
      type: 'quote',
    });
    const start = [
      {
        ...el(
          'quote',
          'q',
          whole(p('a'), 'delete', 'D1'),
          whole(p('b'), 'delete', 'D2')
        ),
        authored: [spare('D2', 'spare-b'), spare('D1', 'spare-a')],
      },
    ];
    const alone = peerOf(new Y.Doc(), start);

    authoredTestApi(alone).decide({
      action: 'accept',
      changes: ['D1', 'D2'],
    });

    const taken = (alone.read.value().children as Node[])[0].children?.map(
      ({ id }) => id
    );

    for (const order of orders) {
      assert.deepEqual(
        children(decided(start, both, order).peers).map(([quote]) =>
          quote.children?.map(({ id }) => id)
        ),
        [taken, taken, taken],
        order
      );
    }
    assert.deepEqual(taken, ['spare-a']);
  });

  it('keeps both letters in one quote, on two lines of different ids, in every editor and in the room, when two peers type into a line the editors built from its spare at once', () => {
    for (const order of orders) {
      const room = decided(emptiedQuote(), both, order);

      typeInto('X', [0, 0, 0])(room.peers[0]);
      typeInto('Y', [0, 0, 0])(room.peers[1]);
      room.settle();

      const [editor] = children(room.peers);

      assert.deepEqual(
        {
          editors: children(room.peers),
          ids: new Set(idsOf(editor)).size,
          letters: textsOf(editor)
            .flatMap((quote) =>
              Object.values(quote as Record<string, string[]>).flat()
            )
            .sort(),
          rooms: rooms(room.peers),
          shape: textsOf(editor).map((quote) => Object.keys(quote as object)),
        },
        {
          editors: [editor, editor, editor],
          ids: 3,
          letters: ['X', 'Y'],
          rooms: [editor, editor, editor],
          shape: [['quote']],
        },
        order
      );
    }
  });

  it('gives every editor and the room one document, one copy of the other quote’s line and a third peer’s letter when two peers then accept the deletion of another quote’s lines while the third types between the quotes', () => {
    const start = [
      ...emptiedQuote(),
      p('mid'),
      el(
        'quote',
        'q2',
        whole(p('c'), 'delete', 'D'),
        whole(p('d'), 'delete', 'D')
      ),
    ];

    for (const order of orders) {
      const room = decided(start, both, order);
      const [first, second] = order === 'one first' ? [0, 1] : [1, 0];

      authoredTestApi(room.peers[0]).decide(accept('D'));
      authoredTestApi(room.peers[1]).decide(accept('D'));
      typeInto('X', [1, 0])(room.peers[2]);
      room.deliver(first, 2);
      room.deliver(second, 2);
      room.deliver(2, first);
      room.deliver(2, second);
      room.settle();

      const [editor] = children(room.peers);

      // Each accept drops the first quote's built mark, so each writes that
      // quote's line to the room, as a first edit in it does.
      assert.deepEqual(
        {
          editors: children(room.peers),
          rooms: rooms(room.peers),
          texts: textsOf(editor),
        },
        {
          editors: [editor, editor, editor],
          rooms: [editor, editor, editor],
          texts: [{ quote: ['', ''] }, 'Xmid', { quote: [''] }],
        },
        order
      );
    }
  });

  it('keeps a quote’s Yjs element when a peer types into the line the editors built after two concurrent Editing deletions emptied it, under a schema that stores no spares', () => {
    const line = (text: string): Node => ({
      children: [{ text }],
      type: 'paragraph',
    });
    const room = roomFor(
      [{ children: [line('a'), line('b')], type: 'quote' }],
      Plain
    );

    room.peers[0].update((tx) => tx.nodes.remove({ at: [0, 0] }));
    room.peers[1].update((tx) => tx.nodes.remove({ at: [0, 1] }));
    room.settle();

    const [quote] = elementsAt(room.peers[2], [[0]]);

    typeInto('X', [0, 0, 0])(room.peers[2]);
    room.settle();

    const [editor] = children(room.peers);

    assert.deepEqual(
      {
        editors: children(room.peers),
        kept: elementsAt(room.peers[2], [[0]])[0] === quote,
        rooms: rooms(room.peers),
      },
      {
        editors: [[{ children: [line('X')], type: 'quote' }], editor, editor],
        kept: true,
        rooms: [editor, editor, editor],
      }
    );
  });

  it('keeps one quote and a peer’s letter when another peer inserts a line after the line the editors built from its spare', () => {
    for (const order of orders) {
      const room = decided(emptiedQuote(), both, order);

      room.peers[0].update((tx) =>
        tx.nodes.insert(p('pasted') as never, { at: [0, 1] })
      );
      typeInto('X', [0, 0, 0])(room.peers[1]);
      room.settle();

      const [editor] = children(room.peers);
      const ids = idsOf(editor);

      // The paste and the typing each write the built line, so the quote
      // holds a second copy of it, and Yjs orders the concurrent inserts by
      // client id.
      assert.deepEqual(
        {
          distinct: new Set(ids).size,
          editors: children(room.peers),
          ids: ids.length,
          lines: textsOf(editor[0].children ?? [])
            .map(String)
            .sort(),
          quotes: textsOf(editor).map((block) => Object.keys(block as object)),
          rooms: rooms(room.peers),
        },
        {
          distinct: 4,
          editors: [editor, editor, editor],
          ids: 4,
          lines: ['', 'X', 'pasted'],
          quotes: [['quote']],
          rooms: [editor, editor, editor],
        },
        order
      );
    }
  });

  it('keeps both quotes, both letters and unique ids in every editor and in the room when two peers type at once into a root the editors built from its spare quote', () => {
    const start = [
      whole(el('quote', 'q1', p('a')), 'delete', 'D1'),
      whole(el('quote', 'q2', p('b')), 'delete', 'D2'),
    ];

    for (const order of orders) {
      const room = decided(start, both, order, RootQuote);

      typeInto('X', [0, 0, 0])(room.peers[0]);
      typeInto('Y', [0, 0, 0])(room.peers[1]);
      room.settle();

      const [editor] = children(room.peers);

      assert.deepEqual(
        {
          editors: children(room.peers),
          ids: new Set(idsOf(editor)).size,
          rooms: rooms(room.peers),
          texts: textsOf(editor)
            .map((quote) => (quote as { quote: string[] }).quote.join(''))
            .sort(),
        },
        {
          editors: [editor, editor, editor],
          ids: 4,
          rooms: [editor, editor, editor],
          texts: ['X', 'Y'],
        },
        order
      );
    }
  });

  it('gives a pair two lines of different ids and a peer’s letter in every editor and in the room when only the merge of two peers’ accepts empties it and that peer’s typing into the first line the editors built reaches the others first', () => {
    const start = [
      el(
        'pair',
        'pr',
        whole(p('a'), 'delete', 'D1'),
        whole(p('b'), 'delete', 'D1'),
        whole(p('c'), 'delete', 'D2'),
        whole(p('d'), 'delete', 'D2')
      ),
    ];

    for (const order of orders) {
      const room = decided(start, both, order);

      typeInto('X', [0, 0, 0])(room.peers[0]);
      room.deliver(0, 1);
      room.deliver(0, 2);
      room.settle();

      const [editor] = children(room.peers);
      const ids = editor[0].children?.map(({ id }) => id) ?? [];

      assert.deepEqual(
        {
          distinct: new Set(ids).size,
          editors: children(room.peers),
          rooms: rooms(room.peers),
          texts: textsOf(editor),
        },
        {
          distinct: 2,
          editors: [editor, editor, editor],
          rooms: [editor, editor, editor],
          texts: [{ pair: ['X', ''] }],
        },
        order
      );
    }
  });

  it('gives every editor and room the same document and keeps the line’s id when a peer moves a typed line the editors built from its spare out of its quote, in both delivery orders', () => {
    for (const order of orders) {
      const room = decided(emptiedQuote(), both, order);

      typeInto('X', [0, 0, 0])(room.peers[0]);
      room.settle();

      const id = children(room.peers)[0][0].children?.[0]?.id;

      room.peers[2].update((tx) => tx.nodes.move({ at: [0, 0], to: [1] }));
      room.settle();

      const [value] = values(room.peers);
      const [quote, moved] = value.children as Node[];

      assert.deepEqual(
        {
          editors: values(room.peers),
          moved: { id: moved?.id, text: textsOf([moved]) },
          quote: textsOf([quote]),
          rooms: rooms(room.peers),
        },
        {
          editors: [value, value, value],
          moved: { id, text: ['X'] },
          quote: [{ quote: [''] }],
          rooms: [value.children, value.children, value.children],
        },
        order
      );
    }
  });

  for (const action of ['accept', 'reject'] as const) {
    it(`gives every editor and room the same document and unique ids, and calls no generator, when a peer suggests moving a typed line the editors built from its spare out of its quote and another peer ${action}s it, in both delivery orders`, () => {
      const liveIds = (nodes: readonly Node[]): string[] =>
        nodes.flatMap((node) => [
          ...(node.id ? [node.id] : []),
          ...liveIds(node.children ?? []),
        ]);

      for (const order of orders) {
        const room = decided(emptiedQuote(), both, order);

        typeInto('X', [0, 0, 0])(room.peers[0]);
        room.settle();

        const id = children(room.peers)[0][0].children?.[0]?.id;

        (
          room.peers[2].api as unknown as {
            authored: { setView: (view: object) => void };
          }
        ).authored.setView({ intent: 'propose' });
        room.peers[2].update((tx) => tx.nodes.move({ at: [0, 0], to: [1] }));
        room.settle();

        const minted = made;

        authoredTestApi(room.peers[0]).decide({ action, changes: ['M'] });
        room.settle();

        const [value] = values(room.peers);
        const nodes = value.children as Node[];
        const [quote, moved] = nodes;
        const ids = liveIds(nodes);

        assert.deepEqual(
          {
            editors: values(room.peers),
            generated: made - minted,
            line: (action === 'accept' ? moved : quote?.children?.[0])?.id,
            quote: textsOf([quote]),
            rooms: rooms(room.peers),
            unique: new Set(ids).size === ids.length,
          },
          {
            editors: [value, value, value],
            generated: 0,
            line: id,
            quote: [{ quote: [action === 'accept' ? '' : 'X'] }],
            rooms: [value.children, value.children, value.children],
            unique: true,
          },
          `${action}, ${order}`
        );
      }
    });
  }

  it('gives a late joiner the editors’ document and builds the next line from a new spare, calling no generator, when a peer suggests deleting a typed line the editors built from its quote’s spare and another peer accepts it, in both delivery orders', () => {
    for (const order of orders) {
      const room = decided(emptiedQuote(), both, order);

      typeInto('X', [0, 0, 0])(room.peers[0]);
      room.settle();

      const [typed] = values(room.peers);
      const builtId = (typed.children as Node[])[0].children?.[0]?.id;
      const late = room.latecomer();

      (
        room.peers[2].api as unknown as {
          authored: { setView: (view: object) => void };
        }
      ).authored.setView({ intent: 'propose' });
      room.peers[2].update((tx) => tx.nodes.remove({ at: [0, 0] }));
      room.settle();

      const minted = made;

      authoredTestApi(room.peers[0]).decide({
        action: 'accept',
        changes: ['M'],
      });
      room.settle();

      const [value] = values(room.peers);
      const [quote] = value.children as Node[];
      const lines = (quote.children ?? []).map(({ id }) => id);
      const ids = idsOf(value.children);

      assert.deepEqual(
        {
          editors: values(room.peers),
          generated: made - minted,
          late: late.peer.read.value(),
          newLine: lines.length === 1 && lines[0] !== builtId,
          rooms: rooms(room.peers),
          unique: new Set(ids).size === ids.length,
        },
        {
          editors: [value, value, value],
          generated: 0,
          late: typed,
          newLine: true,
          rooms: [value.children, value.children, value.children],
          unique: true,
        },
        order
      );
    }
  });

  /**
   * Peers 0 and 1 accept D1 and D2 and exchange them while peer 2 types X at
   * `typed`; the typing then reaches them, and then their accepts reach it.
   * `built` is the first decider's document once the accepts crossed.
   */
  const typedAfterTheAccepts = (
    start: readonly Node[],
    typed: readonly number[],
    order: (typeof orders)[number]
  ) => {
    const room = roomFor(start);
    const [first, second] = order === 'one first' ? [0, 1] : [1, 0];

    authoredTestApi(room.peers[0]).decide(accept('D1'));
    authoredTestApi(room.peers[1]).decide(accept('D2'));
    typeInto('X', typed)(room.peers[2]);
    room.deliver(first, second);
    room.deliver(second, first);

    const built = children(room.peers)[first];

    room.deliver(2, first);
    room.deliver(2, second);
    room.deliver(first, 2);
    room.deliver(second, 2);
    room.settle();

    return { built, peers: room.peers };
  };

  it('keeps the line every editor built from a quote’s spare when a peer’s typing into another quote of the same column arrives after the accepts that emptied it, in both delivery orders', () => {
    const start = [
      el(
        'column',
        'c',
        el(
          'quote',
          'q1',
          whole(p('a'), 'delete', 'D1'),
          whole(p('b'), 'delete', 'D2')
        ),
        el('quote', 'q2', p('stay'))
      ),
    ];
    const linesOf = (editor: readonly Node[]) =>
      editor[0].children?.[0]?.children?.map(({ id }) => id);

    for (const order of orders) {
      const { built, peers } = typedAfterTheAccepts(start, [0, 1, 0, 0], order);
      const [editor] = children(peers);
      const [room] = rooms(peers);
      const spare = spareIdIn(getDefined(built[0].children?.[0]));

      assert.deepEqual(
        {
          built: linesOf(built),
          editors: children(peers),
          lines: children(peers).map(linesOf),
          rooms: rooms(peers),
          texts: textsOf(editor),
        },
        {
          built: [spare],
          editors: [editor, editor, editor],
          lines: [[spare], [spare], [spare]],
          rooms: [room, room, room],
          texts: [{ column: [{ quote: [''] }, { quote: ['Xstay'] }] }],
        },
        order
      );
    }
  });

  it('keeps the line every editor built from a pair’s spare when a peer’s typing into the pair’s kept line arrives after the accepts that left it one line, in both delivery orders', () => {
    const start = [
      el(
        'pair',
        'pr',
        whole(p('a'), 'delete', 'D1'),
        whole(p('b'), 'delete', 'D2'),
        p('k', 'k')
      ),
    ];
    const linesOf = (editor: readonly Node[]) =>
      editor[0].children?.map(({ id }) => id);

    for (const order of orders) {
      const { built, peers } = typedAfterTheAccepts(start, [0, 2, 0], order);
      const [editor] = children(peers);
      const [room] = rooms(peers);
      const lines = linesOf(built);

      assert.deepEqual(
        {
          built: lines?.[1] === spareIdIn(built[0]),
          editors: children(peers),
          lines: children(peers).map(linesOf),
          rooms: rooms(peers),
          texts: textsOf(editor),
        },
        {
          built: true,
          editors: [editor, editor, editor],
          lines: [lines, lines, lines],
          rooms: [room, room, room],
          texts: [{ pair: ['Xk', ''] }],
        },
        order
      );
    }
  });

  it('keeps the kept line’s Yjs element and both peers’ letters in every editor and in the room when a peer types into it after the editors built a root’s second line from its spare, in both delivery orders', () => {
    const start = [
      whole(p('a'), 'delete', 'D1'),
      whole(p('b'), 'delete', 'D2'),
      p('k', 'k'),
    ];

    for (const order of orders) {
      const room = roomFor(start, RootPair);
      const [first, second] = order === 'one first' ? [0, 1] : [1, 0];

      typeInto('X', [2, 0])(room.peers[2]);
      authoredTestApi(room.peers[0]).decide(accept('D1'));
      authoredTestApi(room.peers[1]).decide(accept('D2'));
      room.deliver(first, second);
      room.deliver(second, first);

      const [kept] = elementsAt(room.peers[first], [[0]]);

      typeInto('Y', [0, 0])(room.peers[first]);

      const keeps = elementsAt(room.peers[first], [[0]])[0] === kept;

      room.settle();

      const joiner = room.latecomer();
      const peers = [...room.peers, joiner.peer];
      const [value] = values(peers);
      const reserves = editorReserves(peers[0]);

      assert.deepEqual(
        {
          editors: values(peers),
          keeps,
          letters: lettersOf(value.children as Node[]),
          lines: (value.children as Node[]).length,
          reserves: [...room.docs, joiner.doc].map(roomReserves),
          rooms: rooms(peers),
        },
        {
          editors: [value, value, value, value],
          keeps: true,
          letters: ['X', 'Y', 'k'],
          lines: 2,
          reserves: [reserves, reserves, reserves, reserves],
          rooms: [
            value.children,
            value.children,
            value.children,
            value.children,
          ],
        },
        order
      );
    }
  });

  /**
   * The editors, a late joiner and every room's spare records, beside what
   * they hold when all of them agree with peer 0.
   */
  const agreed = (room: ReturnType<typeof roomFor>) => {
    const joiner = room.latecomer();
    const peers = [...room.peers, joiner.peer];
    const [value] = values(peers);
    const reserves = editorReserves(peers[0]);

    return {
      actual: {
        editors: values(peers),
        reserves: [
          ...peers.map(editorReserves),
          ...[...room.docs, joiner.doc].map(roomReserves),
        ],
      },
      expected: {
        editors: [value, value, value, value],
        reserves: Array.from({ length: 8 }, () => reserves),
      },
    };
  };

  it('gives every editor, every room and a late joiner one main root and one set of its spare records when a peer’s offline insert into the main root reaches the editors that built its line from the spare, in both delivery orders', () => {
    for (const order of orders) {
      const room = roomFor([
        whole(p('a'), 'delete', 'D1'),
        whole(p('b'), 'delete', 'D2'),
      ]);
      const [first, second] = order === 'one first' ? [0, 1] : [1, 0];

      authoredTestApi(room.peers[0]).decide(accept('D1'));
      authoredTestApi(room.peers[1]).decide(accept('D2'));
      room.deliver(first, second);
      room.deliver(second, first);
      room.peers[2].update((tx) =>
        tx.nodes.insert(p('new', 'n') as never, { at: [2] })
      );
      room.settle();

      const { actual, expected } = agreed(room);

      assert.deepEqual(actual, expected, order);
    }
  });

  for (const [schemaName, plugin] of [
    ['', WithSide],
    [', under a schema with content roots', WithSideAndContentRoots],
  ] as const) {
    /**
     * The editors build an emptied main root's line from its spare, and then
     * peer 0 accepts a deletion in the side root, which drops that spare.
     */
    const droppedInSide = (order: (typeof orders)[number]) => {
      const room = decided(
        {
          children: [
            whole(p('a'), 'delete', 'D1'),
            whole(p('b'), 'delete', 'D2'),
          ],
          roots: { side: [p('t', 't'), whole(p('s', 's'), 'delete', 'N')] },
        },
        both,
        order,
        plugin
      );

      authoredTestApi(room.peers[0]).decide(accept('N'));
      room.settle();

      return room;
    };

    it(`gives every editor, every room and a late joiner one main root and one set of its spare records when a decision in another root drops the spare the editors built the main root’s line from, in both delivery orders${schemaName}`, () => {
      for (const order of orders) {
        const { actual, expected } = agreed(droppedInSide(order));

        assert.deepEqual(actual, expected, order);
      }
    });

    it(`gives every editor, every room and a late joiner one main root and one set of its spare records when the decider types into the main root after a decision in another root dropped its spare, in both delivery orders${schemaName}`, () => {
      for (const order of orders) {
        const room = droppedInSide(order);

        typeInto('X', [0, 0])(room.peers[0]);
        room.settle();

        const { actual, expected } = agreed(room);

        assert.deepEqual(actual, expected, order);
      }
    });

    it(`gives every editor, every room and a late joiner one main root and one set of its spare records when a peer that did not decide types into the main root after a decision in another root dropped its spare, in both delivery orders${schemaName}`, () => {
      for (const order of orders) {
        const room = droppedInSide(order);

        typeInto('X', [0, 0])(room.peers[2]);
        room.settle();

        const { actual, expected } = agreed(room);

        assert.deepEqual(actual, expected, order);
      }
    });
  }

  const card = {
    childRoots: { body: 'body' },
    children: [{ text: 'C' }],
    id: 'card',
    type: 'card',
  };
  const emptiedBody = (order: (typeof orders)[number]) =>
    decided(
      {
        children: [p('stay', 'stay'), card],
        roots: {
          body: [whole(p('a'), 'delete', 'D1'), whole(p('b'), 'delete', 'D2')],
          side: [p('t', 't')],
        },
      },
      both,
      order,
      WithSideAndContentRoots
    );
  const removeCard = (peer: TestEditor) =>
    peer.update((tx) => tx.nodes.remove({ at: [1] }));
  const agreedIds = (room: ReturnType<typeof roomFor>) => {
    const { actual, expected } = agreed(room);

    return {
      actual: { ...actual, reserves: actual.reserves.map(Object.keys) },
      expected: { ...expected, reserves: expected.reserves.map(Object.keys) },
    };
  };

  it('leaves no spare record of a deleted root in any editor, any room or a late joiner when a peer deletes a root the editors built from its spare, in both delivery orders', () => {
    for (const order of orders) {
      const room = emptiedBody(order);
      const built = editorReserves(room.peers[0]);

      removeCard(room.peers[0]);
      room.settle();

      const { actual, expected } = agreedIds(room);

      assert.deepEqual(
        { ...actual, built: Object.keys(built).length },
        { ...expected, built: 1 },
        order
      );
      assert.deepEqual(expected.reserves[0], [], order);
    }
  });

  it('writes none of a deleted root’s old spare records when the peer that deleted it, or one that received the deletion, creates it again and types into it, in both delivery orders', () => {
    for (const order of orders) {
      for (const creator of [0, 2]) {
        const room = emptiedBody(order);

        removeCard(room.peers[0]);
        room.settle();
        room.peers[creator].update((tx) => {
          tx.roots.create('body', [p('n', 'n')] as never);
          tx.nodes.insert(card as never, { at: [1] });
        });
        room.peers[creator].update((tx) =>
          tx.text.insert('X', { at: { offset: 0, path: [0, 0], root: 'body' } })
        );
        room.settle();

        const { actual, expected } = agreedIds(room);

        assert.deepEqual(actual, expected, `${order}, peer ${creator} creates`);
        assert.deepEqual(
          expected.reserves[0],
          [],
          `${order}, peer ${creator} creates`
        );
      }
    }
  });

  describe('the work a keystroke costs beside a root the editors built from its spares', () => {
    withoutLawCheck();

    const keystrokeBeside = (lines: number) => {
      const side = c.type('paragraph', {
        default: { type: 'paragraph' },
        min: lines,
      });
      const plugin = defineEditorSchema(
        `schema:authored-spare-collaboration-side-${lines}`,
        {
          elements,
          id: `authored-spare-collaboration-side-${lines}`,
          properties: [generatedId],
          root: sideRoot,
          roots: { side },
          unknown: 'reject',
          version: 1,
        } as never
      );
      const deleted = (change: string) =>
        Array.from({ length: lines }, (_, index) =>
          whole(p(`${change}${index}`), 'delete', change)
        );
      const room = decided(
        {
          children: [p('m', 'm')],
          roots: { side: [...deleted('D1'), ...deleted('D2')] },
        },
        both,
        'one first',
        plugin
      );
      const built = Object.keys(editorReserves(room.peers[2])).length;
      const before = readCoreWork().spareIdChecks;

      typeInto('X', [0, 0])(room.peers[2]);

      return { built, checks: readCoreWork().spareIdChecks - before };
    };

    it('checks no spare id of a root the keystroke does not write, however many lines the editors built there', () => {
      const small = keystrokeBeside(1);
      const large = keystrokeBeside(20);

      assert.deepEqual(
        {
          built: [small.built, large.built],
          checks: [small.checks, large.checks],
        },
        { built: [1, 20], checks: [0, 0] }
      );
    });
  });
});

describe('spares a peer’s record write alone changes', () => {
  it('shows the spare a peer’s records-only update stores in each mode, as a fresh load does', () => {
    const docs = [new Y.Doc(), new Y.Doc()];
    const writer = peerOf(docs[0], [
      whole(p('x'), 'delete', 'A'),
      whole(p('y'), 'delete', 'B'),
    ]);

    Y.applyUpdate(docs[1], Y.encodeStateAsUpdate(docs[0]));

    const reader = peerOf(docs[1]);
    const viewsOf = (editor: TestEditor) =>
      (['accepted', 'proposed'] as const).map((preview) =>
        createEditorView(editor, { authored: { preview } }).read.children()
      );
    const spare = {
      at: 1,
      author: 'B',
      change: 'B',
      node: { children: [{ text: '' }], id: 'a', type: 'paragraph' },
      root: 'main',
      slot: { min: 0 },
    };

    viewsOf(reader);
    writer.update((tx) =>
      tx.records.put('authored-reserves', reserveIdOf(spare), spare)
    );
    Y.applyUpdate(
      docs[1],
      Y.encodeStateAsUpdate(docs[0], Y.encodeStateVector(docs[1]))
    );

    assert.deepEqual(
      viewsOf(reader),
      viewsOf(
        createEditor<EditorValue, readonly unknown[]>({
          initialValue: structuredClone(reader.read.value()),
          plugins: [Generated, createAuthoredPlugin({ authorId: 'zed' })],
        })
      )
    );
  });
});

describe('the work a remote keystroke costs in a room whose schema stores spares and unique ids', () => {
  // The test build's law check replays each commit, and these counters would
  // count its reads.
  withoutLawCheck();

  const keystrokeIn = (size: number) => {
    const docs = [new Y.Doc(), new Y.Doc()];
    const writer = peerOf(docs[0], [
      p('before', 'before'),
      el(
        'quote',
        'q',
        ...Array.from({ length: size }, (_, index) =>
          p(`${index}`, `p${index}`)
        )
      ),
    ]);
    const deliver = (from: number, to: number) =>
      Y.applyUpdate(
        docs[to],
        Y.encodeStateAsUpdate(docs[from], Y.encodeStateVector(docs[to]))
      );

    deliver(0, 1);

    const reader = peerOf(docs[1]);

    // An insert of a taken id builds the index the keystroke then moves.
    reader.update((tx) => {
      tx.nodes.insert(p('taken', 'before') as never, { at: [2] });
    });
    deliver(1, 0);
    writer.update((tx) => {
      tx.text.insert('x', { at: { offset: 0, path: [1, size >> 1, 0] } });
    });

    const draws = made;
    const before = readCoreWork();

    deliver(0, 1);

    const after = readCoreWork();

    assert.deepEqual(reader.read.value(), writer.read.value());

    return {
      generated: made - draws,
      holderReads: after.uniqueHolderReads - before.uniqueHolderReads,
      indexedNodes: after.uniqueIndexedNodes - before.uniqueIndexedNodes,
      spareReads: after.spareReads - before.spareReads,
    };
  };

  it('reads no spare, calls no generator and follows the path to a keystroke inside a quote of 1,000 paragraphs', () => {
    const small = keystrokeIn(10);

    assert.deepEqual(keystrokeIn(1000), small);
    assert.deepEqual(
      [small.generated, small.indexedNodes, small.spareReads],
      [0, 0, 0]
    );
  });

  it('reads no spare for a keystroke inside nested details that each hold their summary, whose required role is an omitted default, and a line while their summaries wait on a deletion', () => {
    const WithDetails = defineEditorSchema(
      'schema:authored-spare-collaboration-details',
      {
        elements: {
          details: {
            content: c.prefix(
              [{ element: 'summary', properties: { role: 'summary' } }],
              c.types(['paragraph', 'details'], {
                default: { type: 'paragraph' },
                min: 1,
              })
            ),
          },
          paragraph: schema.element.textBlock(),
          summary: schema.element.textBlock(),
        },
        id: 'authored-spare-collaboration-details',
        properties: [
          schema.elementProperty(
            'id',
            property.string({ generate: () => `g${(made += 1)}` }),
            {
              role: 'metadata',
              target: target.group('element'),
              typeChange: 'preserve-if-allowed',
              unique: true,
            }
          ),
          schema.elementProperty(
            'role',
            property.string({ default: 'summary', omitDefault: true }),
            { target: target.type('summary') }
          ),
        ],
        root: c.types(['paragraph', 'details'], {
          default: { type: 'paragraph' },
          min: 1,
        }),
        unknown: 'reject',
        version: 1,
      } as never
    );
    const nested = (depth: number): Node =>
      el(
        'details',
        `d${depth}`,
        whole(
          { children: [{ text: 's' }], id: `s${depth}`, type: 'summary' },
          'delete',
          `S${depth}`
        ),
        depth === 0 ? p('body', 'body') : nested(depth - 1)
      );
    const docs = [new Y.Doc(), new Y.Doc()];
    const writer = peerOf(docs[0], [nested(3)], WithDetails);

    Y.applyUpdate(docs[1], Y.encodeStateAsUpdate(docs[0]));

    const reader = peerOf(docs[1], undefined, WithDetails);

    writer.update((tx) => {
      tx.text.insert('x', { at: { offset: 0, path: [0, 1, 1, 1, 1, 0] } });
    });

    const before = readCoreWork().spareReads;

    Y.applyUpdate(
      docs[1],
      Y.encodeStateAsUpdate(docs[0], Y.encodeStateVector(docs[1]))
    );

    assert.deepEqual(
      {
        spareReads: readCoreWork().spareReads - before,
        value: reader.read.value(),
      },
      { spareReads: 0, value: writer.read.value() }
    );
  });
});

import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';

import {
  createEditor,
  createEditorView,
  defineCommand,
  defineEditorSchema,
  definePluginSlot,
  type Editor,
  property,
  schema,
  target,
  transfer,
  type Value as EditorValue,
} from 'plitejs';
import * as Y from 'yjs';

import { createAuthoredPlugin } from '../src/authored/authored';
import { reserveIdOf } from '../src/authored/facts/records';
import { readLedgerWork } from '../src/authored/ledger/work';
import { isAuthoredSetValued } from '../src/authored/tree/marks';
import { DocumentChange } from '../src/core/change/document-change';
import type { JsonEditorValue } from '../src/core/change/tokens';
import { getCompiledEditorSchema } from '../src/core/plugin-registry';
import { readCoreWork } from '../src/core/work';
import { getEditorAuthoredDocumentCapability } from '../src/create-editor';
import { history as withHistory } from '../src/history';
import { getDefined } from '../src/internal/get-defined';
import { yjs } from '../src/yjs';
import { authoredTestApi, recordsOf } from './support/authored';
import { withoutLawCheck } from './support/law-check';

type Node = Readonly<{
  authored?: ReadonlyArray<Record<string, unknown>>;
  children?: readonly Node[];
  id?: string;
  text?: string;
  type?: string;
  [key: string]: unknown;
}>;
type Value = Readonly<{ children: readonly Node[]; records?: object }>;
type Decision = Readonly<{ action: 'accept' | 'reject'; changes: string[] }>;

const c = schema.content;
let made = 0;
let mint = () => `g${(made += 1)}`;
const elements = {
  cell: schema.element.textBlock(),
  details: {
    content: c.prefix(
      [{ element: 'summary' }],
      c.types(['paragraph'], { default: { type: 'paragraph' }, min: 1 })
    ),
  },
  group: { content: c.type('cell', { min: 2 }) },
  image: { void: 'block' },
  pair: { content: c.type('paragraph', { min: 2 }) },
  paragraph: schema.element.textBlock(),
  quote: {
    content: c.types(['paragraph', 'image'], {
      default: { type: 'paragraph' },
      min: 1,
    }),
  },
  summary: schema.element.textBlock(),
};
const root = c.types(['paragraph', 'pair', 'quote', 'group', 'details'], {
  default: { type: 'paragraph' },
  min: 1,
});
const Generated = defineEditorSchema('schema:authored-tree-spares', {
  elements,
  id: 'authored-tree-spares',
  properties: [
    schema.elementProperty('id', property.string({ generate: () => mint() }), {
      copy: 'drop',
      role: 'metadata',
      target: target.group('element'),
      typeChange: 'preserve-if-allowed',
    }),
  ],
  root,
  unknown: 'reject',
  version: 1,
} as never);
const Plain = defineEditorSchema('schema:authored-tree-spares-plain', {
  elements,
  id: 'authored-tree-spares-plain',
  properties: [
    schema.elementProperty('id', property.string(), {
      target: target.group('element'),
    }),
  ],
  root,
  unknown: 'reject',
  version: 1,
} as never);

/** A root that needs two paragraphs, so a decision can build one while a claim stays pending. */
const RootPair = defineEditorSchema('schema:authored-tree-spares-root', {
  elements: { paragraph: schema.element.textBlock() },
  id: 'authored-tree-spares-root',
  properties: [
    schema.elementProperty('id', property.string({ generate: () => mint() }), {
      copy: 'drop',
      role: 'metadata',
      target: target.group('element'),
    }),
  ],
  root: c.type('paragraph', { min: 2 }),
  unknown: 'reject',
  version: 1,
} as never);
/** Only a paragraph holds an id, so a retype to heading drops it. */
const ParagraphIds = defineEditorSchema(
  'schema:authored-tree-spares-paragraph-ids',
  {
    elements: {
      heading: schema.element.textBlock(),
      paragraph: schema.element.textBlock(),
    },
    id: 'authored-tree-spares-paragraph-ids',
    properties: [
      schema.elementProperty(
        'id',
        property.string({ generate: () => mint() }),
        {
          copy: 'drop',
          role: 'metadata',
          target: target.type('paragraph'),
          typeChange: 'preserve-if-allowed',
        }
      ),
    ],
    root: c.types(['paragraph', 'heading'], {
      default: { type: 'paragraph' },
      min: 1,
    }),
    unknown: 'reject',
    version: 1,
  } as never
);

const documents = new Set<Y.Doc>();

afterEach(() => {
  mint = () => `g${(made += 1)}`;
  for (const doc of documents) doc.destroy();
  documents.clear();
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
type TestEditor = Editor<EditorValue, readonly unknown[]>;
const editorOf = (value: unknown, plugin: unknown = Generated): TestEditor =>
  createEditor<EditorValue, readonly unknown[]>({
    initialValue: structuredClone(value) as never,
    plugins: [plugin, createAuthoredPlugin({ authorId: 'zed' })],
  });
/** The document as an editor stores it once loaded: its spares written. */
const loaded = (
  children: readonly Node[],
  records?: object,
  plugin: unknown = Generated
): Value =>
  structuredClone(
    editorOf(records ? { children, records } : children, plugin).read.value()
  );
const sparesOf = (node: Node | undefined) =>
  (node?.authored ?? []).filter((member) => member.kind === 'reserve');
const spareId = (node: Node | undefined, slot: object) =>
  (
    sparesOf(node).find(
      (spare) => JSON.stringify(spare.slot) === JSON.stringify(slot)
    )?.node as Node | undefined
  )?.id;
const stored = (value: unknown) => {
  const { children, records } = value as Value;

  return {
    children,
    reserves:
      (recordsOf({ children, records })['authored-reserves'] as
        | object
        | undefined) ?? {},
  };
};
/** Every order of single decisions, and all of them at once. */
const schedulesOf = (decisions: readonly Decision[]): Decision[][][] => {
  const orders = (rest: readonly Decision[]): Decision[][] =>
    rest.length <= 1
      ? [[...rest]]
      : rest.flatMap((first, index) =>
          orders(rest.filter((_, other) => other !== index)).map((order) => [
            first,
            ...order,
          ])
        );

  return [
    ...orders(decisions).map((order) => order.map((decision) => [decision])),
    [[...decisions]],
  ];
};
/** Decide `schedule` on a fresh editor of `value`, counting the generator. */
const decideIn = (
  value: Value,
  schedule: ReadonlyArray<readonly Decision[]>,
  plugin: unknown = Generated
) => {
  const editor = editorOf(value, plugin);
  const before = made;
  const statuses = schedule.map(
    (step) => authoredTestApi(editor).decide(step).status
  );

  return {
    generated: made - before,
    statuses,
    stored: stored(editor.read.value()),
  };
};
/**
 * The bytes every schedule stores, after checking they agree. A schedule
 * whose step the resolver holds until another change is decided with it is
 * not an order a reviewer can take, so it is left out; deciding all at once
 * is always one.
 */
const decidedInEveryOrder = (
  value: Value,
  decisions: readonly Decision[],
  plugin: unknown = Generated
) => {
  const runs = schedulesOf(decisions)
    .map((schedule) => decideIn(value, schedule, plugin))
    .filter(({ statuses }) => !statuses.includes('blocked'));
  const together = getDefined(runs.at(-1));

  for (const run of runs) {
    assert.deepEqual(
      {
        generated: run.generated,
        statuses: run.statuses.filter(
          (status) => status !== 'applied' && status !== 'unchanged'
        ),
        stored: run.stored,
      },
      { generated: 0, statuses: [], stored: together.stored }
    );
  }
  assert.deepEqual(together.statuses, ['applied']);

  return together.stored;
};
const accept = (change: string): Decision => ({
  action: 'accept',
  changes: [change],
});
const reject = (change: string): Decision => ({
  action: 'reject',
  changes: [change],
});
const idsIn = (node: Node | undefined): Array<string | undefined> =>
  (node?.children ?? []).map((child) => child.id);
const historyOf = (editor: TestEditor) =>
  (editor as unknown as { api: { history: { undo: () => void } } }).api.history;

describe('spare blocks a decision builds from', () => {
  it('give a pair holding two deleted paragraphs the same two ids in every order, with no spare left', () => {
    const value = loaded([
      el(
        'pair',
        'pair',
        whole(p('a'), 'delete', 'A'),
        whole(p('b'), 'delete', 'B')
      ),
    ]);
    const [pair] = value.children;
    const decided = decidedInEveryOrder(value, [accept('A'), accept('B')]);

    assert.deepEqual(
      {
        ids: idsIn(decided.children[0]),
        reserves: decided.reserves,
        spares: sparesOf(decided.children[0]),
      },
      {
        ids: [spareId(pair, { min: 0 }), spareId(pair, { min: 1 })],
        reserves: {},
        spares: [],
      }
    );
  });

  it('give a group that needs two cells the same two ids in every order (probe 8)', () => {
    const value = loaded([
      p('p'),
      el(
        'group',
        'group',
        whole(el('cell', 'a', { text: 'a' }), 'delete', 'a:1'),
        whole(el('cell', 'b', { text: 'b' }), 'delete', 'b:1')
      ),
    ]);
    const group = value.children[1];
    const decided = decidedInEveryOrder(value, [accept('a:1'), accept('b:1')]);

    assert.deepEqual(idsIn(decided.children[1]), [
      spareId(group, { min: 0 }),
      spareId(group, { min: 1 }),
    ]);
  });

  it('give a quote its spare id for the line a rejected split rejoins, in every order', () => {
    const value = loaded([
      el('quote', 'q', whole(p('a'), 'delete', 'A')),
      { ...p('b'), authored: [mark('split', 'B')] },
    ]);
    const quote = value.children[0];
    const decided = decidedInEveryOrder(value, [accept('A'), reject('B')]);

    assert.deepEqual(
      decided.children.map((node) => ({
        ids: idsIn(node),
        type: node.type,
      })),
      [{ ids: [spareId(quote, { min: 0 })], type: 'quote' }]
    );
  });

  it('give a quote its spare id for the line a rejected split rejoins, in every order, when the id holds only on blocks and an inline type is declared', () => {
    const BlockIds = defineEditorSchema(
      'schema:authored-tree-spares-block-ids',
      {
        elements: {
          ...elements,
          link: { content: c.text({ default: 'text', min: 1 }), inline: true },
        },
        id: 'authored-tree-spares-block-ids',
        properties: [
          schema.elementProperty(
            'id',
            property.string({ generate: () => mint() }),
            {
              copy: 'drop',
              role: 'metadata',
              target: target.group('block'),
              typeChange: 'preserve-if-allowed',
            }
          ),
        ],
        root,
        unknown: 'reject',
        version: 1,
      } as never
    );
    const value = loaded(
      [
        el('quote', 'q', whole(p('a'), 'delete', 'A')),
        { ...p('b'), authored: [mark('split', 'B')] },
      ],
      undefined,
      BlockIds
    );
    const quote = value.children[0];
    const decided = decidedInEveryOrder(
      value,
      [accept('A'), reject('B')],
      BlockIds
    );

    assert.deepEqual(
      decided.children.map((node) => ({
        ids: idsIn(node),
        type: node.type,
      })),
      [{ ids: [spareId(quote, { min: 0 })], type: 'quote' }]
    );
  });

  const rejoinedUnder = (
    name: string,
    idTarget: unknown,
    quote: Readonly<{ id?: string }>,
    extra: Readonly<Record<string, unknown>> = {}
  ) => {
    const Ids = defineEditorSchema(`schema:authored-tree-spares-${name}`, {
      elements: {
        ...elements,
        ...extra,
        link: { content: c.text({ default: 'text', min: 1 }), inline: true },
      },
      id: `authored-tree-spares-${name}`,
      properties: [
        schema.elementProperty(
          'id',
          property.string({ generate: () => mint() }),
          {
            copy: 'drop',
            role: 'metadata',
            target: idTarget,
            typeChange: 'preserve-if-allowed',
          }
        ),
      ],
      root,
      unknown: 'reject',
      version: 1,
    } as never);
    const value = loaded(
      [
        { ...quote, children: [whole(p('a'), 'delete', 'A')], type: 'quote' },
        { ...p('b'), authored: [mark('split', 'B')] },
      ],
      undefined,
      Ids
    );
    const decided = decidedInEveryOrder(value, [accept('A'), reject('B')], Ids);

    return decided.children.map((node) => ({
      ids: idsIn(node),
      texts: (node.children ?? []).map(
        (line) => line.children?.[0]?.text ?? line.text
      ),
      type: node.type,
    }));
  };
  // The handover moves no id a retype can drop, so the rejoined line keeps
  // the split line's own id, as joining it into the built line keeps it.
  const rejoined = [{ ids: ['p-b'], texts: ['b'], type: 'quote' }];

  it('rejoin a rejected split into the quote line a decision empties, in every order, when the id holds only on paragraphs', () => {
    const landed = rejoinedUnder(
      'paragraph-only-ids',
      target.type('paragraph'),
      {}
    );

    assert.deepEqual(landed, rejoined);
  });

  it('rejoin a rejected split into the quote line a decision empties, in every order, when the id holds only on blocks and an unused type admits text, paragraphs and links', () => {
    const landed = rejoinedUnder(
      'block-ids-mixed',
      target.group('block'),
      { id: 'q' },
      {
        mixed: {
          content: c.any([c.text(), c.type('paragraph'), c.type('link')]),
        },
      }
    );

    assert.deepEqual(landed, rejoined);
  });

  it('take the spare whose node comes first in canonical JSON when two peers stored one for a slot', () => {
    const spare = (change: string, id: string) => ({
      ...mark('reserve', change),
      node: { children: [{ text: '' }], id, type: 'paragraph' },
      slot: { min: 0 },
      type: 'quote',
    });
    const value = loaded([
      {
        ...el(
          'quote',
          'q',
          whole(p('a'), 'delete', 'A'),
          whole(p('b'), 'delete', 'B')
        ),
        authored: [spare('B', 'spare-b'), spare('A', 'spare-a')],
      },
    ]);
    const decided = decidedInEveryOrder(value, [accept('A'), accept('B')]);

    assert.deepEqual(idsIn(decided.children[0]), ['spare-a']);
  });

  it('store the same bytes in every order for each of the architect replay’s quotes', () => {
    const cases: ReadonlyArray<
      readonly [readonly Node[], readonly Decision[]]
    > = [
      [
        [
          el(
            'quote',
            'q',
            whole(p('a'), 'delete', 'A'),
            whole(p('b'), 'insert', 'B')
          ),
        ],
        [accept('A'), reject('B')],
      ],
      [
        [
          el(
            'quote',
            'q',
            whole(p('a'), 'delete', 'A'),
            whole(p('b'), 'delete', 'B'),
            whole(p('c'), 'insert', 'C')
          ),
        ],
        [accept('A'), accept('B'), reject('C')],
      ],
      [
        [
          el(
            'quote',
            'q',
            whole(p('a'), 'delete', 'A'),
            whole(whole(p('b'), 'delete', 'B'), 'delete', 'D')
          ),
        ],
        [accept('A'), accept('B'), accept('D')],
      ],
      [
        [
          el(
            'quote',
            'q1',
            whole(p('a'), 'delete', 'A'),
            whole(p('b'), 'delete', 'B')
          ),
          el(
            'quote',
            'q2',
            whole(p('c'), 'delete', 'B'),
            whole(p('d'), 'delete', 'A')
          ),
        ],
        [accept('A'), accept('B')],
      ],
    ];

    for (const [children, decisions] of cases) {
      const value = loaded(children);
      const decided = decidedInEveryOrder(value, decisions);

      assert.deepEqual(
        decided.children.map(idsIn),
        value.children.map((quote) => [spareId(quote, { min: 0 })])
      );
    }
  });

  it('give a quote holding a deleted image and paragraph one paragraph', () => {
    const value = loaded([
      el(
        'quote',
        'q',
        whole(el('image', 'i', { text: '' }), 'delete', 'A'),
        whole(p('a'), 'delete', 'A')
      ),
    ]);
    const decided = decidedInEveryOrder(value, [accept('A')]);

    assert.deepEqual(
      decided.children[0].children?.map(({ id, type }) => ({ id, type })),
      [{ id: spareId(value.children[0], { min: 0 }), type: 'paragraph' }]
    );
  });

  it('give a details element one id per slot in every order', () => {
    const value = loaded([
      p('before', 'p0'),
      el(
        'details',
        'd',
        whole(el('summary', 's', { text: 'sum' }), 'delete', 'carol:1'),
        whole(p('body', 'p'), 'delete', 'dave:1')
      ),
    ]);
    const details = value.children[1];
    const decided = decidedInEveryOrder(value, [
      accept('carol:1'),
      accept('dave:1'),
    ]);

    assert.deepEqual(idsIn(decided.children[1]), [
      spareId(details, { prefix: 0 }),
      spareId(details, { min: 0 }),
    ]);
  });

  it('keep a root its spare while a quote the decision lifts leaves a pending deletion there', () => {
    for (const [kind, lift] of [
      ['unwrap', accept('A')],
      ['wrap', reject('A')],
    ] as const) {
      const value = loaded([
        {
          ...el('quote', 'q', whole(p('a'), 'delete', 'B')),
          authored: [mark(kind, 'A')],
        },
      ]);
      const [spare] = Object.values(stored(value).reserves) as Array<{
        node: Node;
      }>;
      const decided = decidedInEveryOrder(value, [lift, accept('B')]);

      assert.deepEqual(
        { ids: decided.children.map(({ id }) => id), kind },
        { ids: [spare?.node.id], kind }
      );
    }
  });

  it('store none under a schema that generates no element value', () => {
    const children = [
      el(
        'pair',
        'pair',
        whole(p('a'), 'delete', 'A'),
        whole(p('b'), 'delete', 'B')
      ),
    ];
    const value = loaded(children, undefined);
    const plain = structuredClone(editorOf(children, Plain).read.value());

    assert.deepEqual(
      [
        plain,
        decideIn(plain as Value, [[accept('A'), accept('B')]], Plain).stored,
      ],
      [
        { children },
        {
          children: [
            {
              children: [
                { children: [{ text: '' }], type: 'paragraph' },
                { children: [{ text: '' }], type: 'paragraph' },
              ],
              id: 'pair',
              type: 'pair',
            },
          ],
          reserves: {},
        },
      ]
    );
    assert.notDeepEqual(sparesOf(value.children[0]), []);
  });

  it('give a pair two distinct ids when its built block changes between two decisions', () => {
    const value = loaded([
      el(
        'pair',
        'pair',
        whole(p('a'), 'delete', 'A'),
        whole(p('b'), 'delete', 'B')
      ),
      p('after'),
    ]);
    const steps: Record<string, (editor: TestEditor) => TestEditor> = {
      'an Editing drag out of the pair': (editor) => {
        editor.update((tx) => tx.nodes.move({ at: [0, 1], to: [2] }));

        return editor;
      },
      'a pending change of its id': (editor) =>
        editorOf({
          ...editor.read.value(),
          children: editor.read
            .value()
            .children.map((node: Node, at: number) =>
              at === 0
                ? {
                    ...node,
                    children: node.children?.map((child, index) =>
                      index === 1
                        ? {
                            ...child,
                            authored: [
                              {
                                ...mark('format', 'E'),
                                before: child.id,
                                id: 'E-id',
                                key: 'id',
                                write: { kind: 'set', value: 'renamed' },
                              },
                            ],
                            id: 'renamed',
                          }
                        : child
                    ),
                  }
                : node
            ),
        }),
      'typing into it': (editor) => {
        editor.update((tx) =>
          tx.text.insert('typed', { at: { path: [0, 1, 0], offset: 0 } })
        );

        return editor;
      },
      'a reload through JSON': (editor) =>
        editorOf(JSON.parse(JSON.stringify(editor.read.value()))),
      'a reload through Yjs': (editor) => {
        const seeded = new Y.Doc();
        const joined = new Y.Doc();

        documents.add(seeded);
        documents.add(joined);
        createEditor({
          initialValue: structuredClone(editor.read.value()) as never,
          plugins: [
            Generated,
            createAuthoredPlugin({ authorId: 'zed' }),
            yjs({ doc: seeded, initialReady: true, seed: true }),
          ] as never,
        });
        Y.applyUpdate(joined, Y.encodeStateAsUpdate(seeded));

        return createEditor<EditorValue, readonly unknown[]>({
          plugins: [
            Generated,
            createAuthoredPlugin({ authorId: 'zed' }),
            yjs({ doc: joined, initialReady: true }),
          ],
        });
      },
    };

    for (const [name, step] of Object.entries(steps)) {
      const first = editorOf(value);
      const statuses = [authoredTestApi(first).decide(accept('A')).status];
      const between = step(first);

      statuses.push(authoredTestApi(between).decide(accept('B')).status);

      const ids = (between.read.value().children as Node[]).flatMap((node) =>
        node.type === 'pair' ? idsIn(node) : []
      );

      assert.deepEqual(
        { distinct: new Set(ids).size, name, size: ids.length, statuses },
        { distinct: 2, name, size: 2, statuses: ['applied', 'applied'] }
      );
    }
  });

  it('keep a built root spare apart from the spare a load stores for its slot under one change, the same on two loads', () => {
    const built = editorOf(
      [whole(p('a'), 'delete', 'A'), whole(p('b'), 'delete', 'B')],
      RootPair
    );

    // Accepting B builds the root's second block from A's spare of slot 0.
    authoredTestApi(built).decide(accept('B'));

    const after = JSON.stringify(built.read.value());
    // Each load stores a new spare for slot 0, which A's pending deletion
    // can still empty.
    const [here, there] = [0, 1].map(() =>
      editorOf(JSON.parse(after), RootPair)
    );
    const keysOf = (editor: typeof here) =>
      Object.keys(stored(editor.read.value()).reserves).toSorted();
    const [hereKeys, thereKeys] = [keysOf(here), keysOf(there)];
    const { status } = authoredTestApi(here).decide(accept('A'));
    const ids = (here.read.value().children as Node[]).map(({ id }) => id);

    assert.deepEqual(
      {
        distinct: new Set(ids).size,
        spares: hereKeys.length,
        status,
        there: thereKeys,
      },
      { distinct: 2, spares: 3, status: 'applied', there: hereKeys }
    );
  });

  it('keep a built root spare and the spare a later write stores for its slot under one change through Yjs, beside a concurrent decision', () => {
    const peerOf = (doc: Y.Doc, value?: readonly Node[]) => {
      documents.add(doc);

      return createEditor<EditorValue, readonly unknown[]>({
        ...(value ? { initialValue: structuredClone(value) as never } : {}),
        plugins: [
          RootPair,
          createAuthoredPlugin({ authorId: 'zed' }),
          yjs({ doc, initialReady: true, ...(value ? { seed: true } : {}) }),
        ],
      });
    };
    const oneDoc = new Y.Doc();
    const twoDoc = new Y.Doc();
    const sync = () => {
      Y.applyUpdate(
        twoDoc,
        Y.encodeStateAsUpdate(oneDoc, Y.encodeStateVector(twoDoc))
      );
      Y.applyUpdate(
        oneDoc,
        Y.encodeStateAsUpdate(twoDoc, Y.encodeStateVector(oneDoc))
      );
    };
    const one = peerOf(oneDoc, [
      whole(p('a'), 'delete', 'A'),
      whole(p('b'), 'delete', 'B'),
    ]);

    Y.applyUpdate(twoDoc, Y.encodeStateAsUpdate(oneDoc));

    const two = peerOf(twoDoc);

    authoredTestApi(one).decide(accept('B'));
    sync();
    // An Editing insertion at the root runs the write rule there, which
    // stores a new spare for slot 0 beside A's spare that accepting B built.
    two.update((tx) => tx.nodes.insert(p('n') as never, { at: [2] }));

    const written = Object.values(stored(two.read.value()).reserves) as Array<{
      built?: true;
    }>;

    authoredTestApi(one).decide(reject('A'));
    sync();

    const ids = (one.read.value().children as Node[]).map(({ id }) => id);

    assert.deepEqual(
      {
        built: written.filter(({ built }) => built).length,
        converged: two.read.value(),
        distinct: new Set(ids).size,
        spares: written.length,
      },
      {
        built: 1,
        converged: one.read.value(),
        distinct: ids.length,
        spares: 3,
      }
    );
  });

  it('give a pair two blocks under a generator that returns one value', () => {
    mint = () => 'same';

    const value = loaded([
      el(
        'pair',
        'pair',
        whole(p('a'), 'delete', 'A'),
        whole(p('b'), 'delete', 'B')
      ),
    ]);
    const decided = decidedInEveryOrder(value, [accept('A'), accept('B')]);

    assert.deepEqual(idsIn(decided.children[0]), ['same', 'same']);
  });

  it('leave a quote with no spare once its last pending claim is decided, adding none on the way', () => {
    const changes = Array.from({ length: 20 }, (_, index) => `c${index}`);
    const value = loaded([
      el(
        'quote',
        'q',
        p('kept'),
        ...changes.map((change) => whole(p(change), 'delete', change))
      ),
    ]);
    const editor = editorOf(value);
    const counts = changes.map((change) => {
      authoredTestApi(editor).decide(accept(change));

      return sparesOf(editor.read.value().children[0]).length;
    });

    assert.deepEqual(
      { counts, ids: idsIn(editor.read.value().children[0] as Node) },
      {
        counts: [...changes.slice(1).map(() => 1), 0],
        ids: ['p-kept'],
      }
    );
  });

  it('store spares when a reconfiguration adds a generator to an id every element holds, so accepting a deletion that empties a quote applies', () => {
    const slot = definePluginSlot('authored-tree-spares:schema');
    const editor = createEditor<EditorValue, readonly unknown[]>({
      initialValue: [el('quote', 'q', whole(p('a'), 'delete', 'A'))] as never,
      plugins: [slot.of(Plain), createAuthoredPlugin({ authorId: 'zed' })],
    });

    editor.update((tx) => tx.plugins.reconfigure(slot, Generated));

    const spare = spareId(editor.read.value().children[0], {
      min: 0,
    });
    const before = made;
    const { status } = authoredTestApi(editor).decide(accept('A'));

    assert.deepEqual(
      {
        generated: made - before,
        ids: idsIn(editor.read.value().children[0] as Node),
        status,
      },
      { generated: 0, ids: [spare], status: 'applied' }
    );
  });

  it('store spares when a value replace loads a document whose pending changes lack them', () => {
    const editor = editorOf([p('a')]);

    editor.update((tx) =>
      tx.value.replace({
        children: [
          el(
            'quote',
            'q',
            whole(p('b'), 'delete', 'B'),
            whole(p('c'), 'insert', 'C')
          ),
        ],
      } as never)
    );

    const spare = spareId(editor.read.value().children[0], {
      min: 0,
    });
    const before = made;
    const statuses = [reject('C'), accept('B')].map(
      (decision) => authoredTestApi(editor).decide(decision).status
    );

    assert.deepEqual(
      {
        generated: made - before,
        ids: idsIn(editor.read.value().children[0] as Node),
        statuses,
      },
      { generated: 0, ids: [spare], statuses: ['applied', 'applied'] }
    );
  });

  it('refuse a build that finds no spare as uncovered, in the capability’s projection and a decision', () => {
    // A peer's content arrives with the deletion and no spare, which only a
    // load would repair.
    const editor = editorOf([el('quote', 'q', p('a'))]);
    const live = editor.read.value() as JsonEditorValue;

    editor.update({ tags: ['collaboration'] }, (tx) =>
      tx.changes.apply(
        DocumentChange.between(
          live,
          {
            ...live,
            children: [el('quote', 'q', whole(p('a'), 'delete', 'A'))],
          } as JsonEditorValue,
          { isSetValued: isAuthoredSetValued }
        )
      )
    );

    const before = structuredClone(editor.read.value());
    const projected = getDefined(
      getEditorAuthoredDocumentCapability(editor)
    ).project(before, 'proposed', getCompiledEditorSchema(editor));
    const decision = authoredTestApi(editor).decide(accept('A'));

    assert.deepEqual(
      {
        after: editor.read.value(),
        code: projected.ok ? null : projected.diagnostics[0].code,
        decision,
      },
      {
        after: before,
        code: 'authored-uncovered',
        decision: { ids: ['A'], status: 'invalid' },
      }
    );
  });

  it('refuse, not repair, a build whose spare a Yjs peer’s content lacks', () => {
    const peerOf = (doc: Y.Doc, seed: boolean) => {
      documents.add(doc);

      return createEditor({
        ...(seed ? { initialValue: [el('quote', 'q', p('a'))] as never } : {}),
        plugins: [
          Generated,
          createAuthoredPlugin({ authorId: 'zed' }),
          yjs({ doc, initialReady: true, ...(seed ? { seed: true } : {}) }),
        ] as never,
      });
    };
    const writerDoc = new Y.Doc();
    const readerDoc = new Y.Doc();
    const writer = peerOf(writerDoc, true);

    Y.applyUpdate(readerDoc, Y.encodeStateAsUpdate(writerDoc));

    const reader = peerOf(readerDoc, false);
    const live = writer.read.value() as JsonEditorValue;

    // A historic update skips the recorder, so the writer publishes the
    // deletion without the spare a recording stores.
    writer.update({ tags: ['historic'] }, (tx) =>
      tx.changes.apply(
        DocumentChange.between(
          live,
          {
            ...live,
            children: [el('quote', 'q', whole(p('a'), 'delete', 'A'))],
          } as JsonEditorValue,
          { isSetValued: isAuthoredSetValued }
        )
      )
    );
    Y.applyUpdate(
      readerDoc,
      Y.encodeStateAsUpdate(writerDoc, Y.encodeStateVector(readerDoc))
    );

    const received = structuredClone(reader.read.value());
    const [quote] = received.children as Node[];
    const projected = getDefined(
      getEditorAuthoredDocumentCapability(reader)
    ).project(received, 'proposed', getCompiledEditorSchema(reader));
    const decision = authoredTestApi(reader).decide(accept('A'));

    assert.deepEqual(
      {
        after: reader.read.value(),
        code: projected.ok ? null : projected.diagnostics[0].code,
        decision,
        spares: sparesOf(quote).length,
        status: quote?.children?.[0]?.authored?.[0]?.kind,
      },
      {
        after: received,
        code: 'authored-uncovered',
        decision: { ids: ['A'], status: 'invalid' },
        spares: 0,
        status: 'delete',
      }
    );
  });

  it('keep a letter a peer types into a quote’s kept line while another peer accepts the deletion that settles the quote’s spare, in both delivery orders and with a third peer', () => {
    const peerOf = (doc: Y.Doc, value?: readonly Node[]) => {
      documents.add(doc);

      return createEditor<EditorValue, readonly unknown[]>({
        ...(value ? { initialValue: structuredClone(value) as never } : {}),
        plugins: [
          Generated,
          createAuthoredPlugin({ authorId: 'zed' }),
          yjs({ doc, initialReady: true, ...(value ? { seed: true } : {}) }),
        ],
      });
    };
    const deliver = (from: Y.Doc, to: Y.Doc) =>
      Y.applyUpdate(to, Y.encodeStateAsUpdate(from, Y.encodeStateVector(to)));
    const outcomes = (['accept first', 'typing first'] as const).map(
      (order) => {
        const docs = [new Y.Doc(), new Y.Doc(), new Y.Doc()];
        const [acceptDoc, typingDoc, thirdDoc] = docs;
        const accepting = peerOf(acceptDoc, [
          el(
            'quote',
            'q',
            whole(p('a'), 'delete', 'A'),
            whole(p('', 'fill'), 'insert', 'A')
          ),
        ]);
        const seed = Y.encodeStateAsUpdate(acceptDoc);

        Y.applyUpdate(typingDoc, seed);
        Y.applyUpdate(thirdDoc, seed);

        const typing = peerOf(typingDoc);
        const peers = [accepting, typing, peerOf(thirdDoc)];

        authoredTestApi(accepting).decide(accept('A'));
        typing.update((tx) =>
          tx.text.insert('X', { at: { offset: 0, path: [0, 1, 0] } })
        );

        const [first, second] =
          order === 'accept first'
            ? [acceptDoc, typingDoc]
            : [typingDoc, acceptDoc];

        deliver(first, thirdDoc);
        deliver(second, thirdDoc);
        deliver(first, second);
        deliver(second, first);
        for (const from of docs) for (const to of docs) deliver(from, to);

        const rooms = docs.map((doc) =>
          Buffer.from(Y.encodeStateAsUpdate(doc)).toString('base64')
        );

        return {
          lines: peers.map((peer) =>
            (peer.read.value().children as Node[]).map((quote) =>
              (quote.children ?? []).map((line) =>
                (line.children ?? []).map(({ text }) => text).join('')
              )
            )
          ),
          order,
          sameRooms: rooms.every((room) => room === rooms[0]),
        };
      }
    );

    assert.deepEqual(outcomes, [
      {
        lines: [[['X']], [['X']], [['X']]],
        order: 'accept first',
        sameRooms: true,
      },
      {
        lines: [[['X']], [['X']], [['X']]],
        order: 'typing first',
        sameRooms: true,
      },
    ]);
  });
});

describe('generated values a recording or a merge would repeat', () => {
  it('give a quote the spare its pending join needs once an Editing wrap puts the join’s follower there, so accepting the join applies', () => {
    const editor = createEditor<EditorValue, readonly unknown[]>({
      initialValue: [
        p('ab'),
        {
          children: [{ text: 'e' }, { ...whole({ text: 'f' }, 'delete', 'B') }],
          id: 'pe',
          type: 'paragraph',
        },
        { ...whole(p('gh'), 'delete', 'B'), authored: [mark('join', 'B')] },
      ] as never,
      plugins: [
        Generated,
        transfer(),
        createAuthoredPlugin({ authorId: 'zed' }),
      ],
    });

    // The move lands the block among the join's followers, so the join takes
    // it out of the quote the wrap puts it in.
    editor.api.transfer.move({
      nodes: [getDefined(editor.key([0]))],
      to: { edge: 'before', key: getDefined(editor.key([2])) },
    });
    editor.update((tx) =>
      tx.nodes.wrap({ children: [], type: 'quote' }, { at: [1] })
    );

    const quoteIn = (value: unknown) =>
      (value as Value).children.find((node) => node.type === 'quote');
    const spare = spareId(quoteIn(editor.read.value()), { min: 0 });
    const decision = authoredTestApi(editor).decide(accept('B'));

    assert.deepEqual(
      { decision, lines: idsIn(quoteIn(editor.read.value())) },
      { decision: { ids: ['B'], status: 'applied' }, lines: [spare] }
    );
  });

  it('keep both blocks storing one constant generated value when a merged keystroke lands beside them', () => {
    mint = () => 'same';

    const blank = { children: [{ text: '' }], id: 'same', type: 'paragraph' };
    const editor = editorOf([el('pair', 'pair', blank, blank, p('c'))]);
    const live = editor.read.value() as Value;
    const [pair] = live.children;

    editor.update({ tags: ['collaboration'] }, (tx) =>
      tx.changes.apply(
        DocumentChange.between(
          live as never,
          {
            ...live,
            children: [
              {
                ...pair,
                children: [
                  getDefined(pair.children)[0],
                  getDefined(pair.children)[1],
                  p('cd', 'p-c'),
                ],
              },
            ],
          } as never,
          { isSetValued: isAuthoredSetValued }
        )
      )
    );

    assert.deepEqual(idsIn((editor.read.value().children as Node[])[0]), [
      'same',
      'same',
      'p-c',
    ]);
  });

  it('give a moved copy its original’s id once the move and the original’s deletion are both accepted, in every order', () => {
    const copy: Node = {
      ...whole(p('a', 'm'), 'insert', 'M'),
      authored: [mark('insert', 'M'), { kind: 'as', values: { id: 'p-a' } }],
    };
    const decided = decidedInEveryOrder(
      loaded([whole(p('a'), 'delete', 'D'), copy]),
      [accept('D'), accept('M')]
    );

    assert.deepEqual(decided.children, [p('a')]);
  });
});

describe('the work a recording does for its generated values', () => {
  // The test build's law check projects each framed recording again, and
  // these counters would count its reads.
  withoutLawCheck();

  it('follows the edit, not the document, when an Editing Enter splits a line', () => {
    const enterIn = (size: number) => {
      const editor = editorOf(
        Array.from({ length: size }, (_, index) => p(`line ${index}`))
      );
      const mid = size >> 1;
      const at = { offset: 2, path: [mid, 0] };
      const before = readCoreWork();

      editor.update((tx) => {
        tx.selection.set({ anchor: at, focus: at });
        tx.break.insert();
      });

      const after = readCoreWork();
      const [left, right] = (editor.read.value() as Value).children.slice(
        mid,
        mid + 2
      );

      return {
        canonicalNodes: after.canonicalNodes - before.canonicalNodes,
        heldBlocks: after.heldBlocks - before.heldBlocks,
        indexedNodes: after.indexedNodes - before.indexedNodes,
        split: [
          left?.id === p(`line ${mid}`).id,
          typeof right?.id === 'string' && right.id !== left?.id,
        ],
      };
    };
    const small = enterIn(100);

    assert.deepEqual(
      { large: enterIn(2000), split: small.split },
      { large: small, split: [true, true] }
    );
  });

  const shower: Node = {
    ...whole(p('copy', 'm'), 'insert', 'M'),
    authored: [mark('insert', 'M'), { kind: 'as', values: { id: 'p-line 0' } }],
  };
  /**
   * The holder and group reads of the second of two Enters at the start of
   * the line at `path`, the first having read the document.
   */
  const readsSplitting = (children: readonly Node[], path: number[]) => {
    const editor = editorOf(children);
    const split = () =>
      editor.update((tx) => {
        const at = { offset: 0, path: [...path, 0] };

        tx.selection.set({ anchor: at, focus: at });
        tx.break.insert();
      });

    split();

    const before = readCoreWork();

    split();

    const after = readCoreWork();

    return {
      groups: after.valueGroupReads - before.valueGroupReads,
      holders: after.valueHolderReads - before.valueHolderReads,
    };
  };

  it('reads the holders of only the paragraph an Enter splits, and not the pending group shown beside it, however long the document', () => {
    const readsIn = (size: number) =>
      readsSplitting(
        [
          ...Array.from({ length: size }, (_, index) => p(`line ${index}`)),
          shower,
        ],
        [size >> 1]
      );
    const small = readsIn(1000);

    assert.deepEqual(
      { groups: small.groups, large: readsIn(10_000) },
      { groups: 0, large: small }
    );
  });

  it('reads the holders of only the line an Enter splits deep inside a quote, and not the pending group shown beside it, however long the quote and however many lines follow it', () => {
    const readsWith = (lines: number, after: number) =>
      readsSplitting(
        [
          el(
            'quote',
            'q',
            ...Array.from({ length: lines }, (_, index) => p(`quoted ${index}`))
          ),
          ...Array.from({ length: after }, (_, index) => p(`line ${index}`)),
          shower,
        ],
        [0, lines - 1]
      );
    const small = readsWith(100, 1000);

    assert.deepEqual(
      { groups: small.groups, large: readsWith(1000, 10_000) },
      { groups: 0, large: small }
    );
  });
});

describe('the work a decision does under a schema that stores spares', () => {
  withoutLawCheck();

  it('is what the same decision does where no spare is stored, accepting or rejecting a line inside a quote', () => {
    const children = [
      ...Array.from({ length: 1000 }, (_, index) => p(`line ${index}`)),
      el('quote', 'q', p('a'), whole(p('b'), 'delete', 'A'), p('c')),
    ];
    const workOf = (plugin: unknown, action: Decision['action']) => {
      const saved = structuredClone(editorOf(children, plugin).read.value());
      const editor = editorOf(saved, plugin);
      const before = readCoreWork();
      const { status } = authoredTestApi(editor).decide({
        action,
        changes: ['A'],
      });
      const after = readCoreWork();

      return {
        canonicalNodes: after.canonicalNodes - before.canonicalNodes,
        indexedNodes: after.indexedNodes - before.indexedNodes,
        spares: sparesOf((saved as Value).children.at(-1)).length,
        status,
        wholeReadNodes: after.wholeReadNodes - before.wholeReadNodes,
      };
    };
    const actions = ['accept', 'reject'] as const;

    assert.deepEqual(
      actions.map((action) => workOf(Generated, action)),
      actions.map((action) => ({ ...workOf(Plain, action), spares: 1 }))
    );
  });
});

describe('generators no spare holds', () => {
  it('run when a decision builds under a generated element property with the content role, as an editor with no spares does', () => {
    const ContentRole = defineEditorSchema(
      'schema:authored-tree-content-role',
      {
        elements,
        id: 'authored-tree-content-role',
        properties: [
          schema.elementProperty(
            'id',
            property.string({ generate: () => mint() }),
            { split: 'preserve', target: target.group('element') }
          ),
        ],
        root,
        unknown: 'reject',
        version: 1,
      } as never
    );
    const run = decideIn(
      { children: [el('quote', 'q', whole(p('x', 'a'), 'delete', 'D'))] },
      [[accept('D')]],
      ContentRole
    );

    assert.deepEqual(
      {
        generated: run.generated,
        ids: idsIn(run.stored.children[0]).map((id) => typeof id),
        statuses: run.statuses,
      },
      { generated: 1, ids: ['string'], statuses: ['applied'] }
    );
  });

  it('run inside a text generator that builds through another schema', () => {
    const helper = createEditor({
      plugins: [
        defineEditorSchema('schema:authored-tree-spares-helper', {
          elements: { token: schema.element.textBlock() },
          id: 'authored-tree-spares-helper',
          properties: [
            schema.elementProperty(
              'id',
              property.string({ generate: () => mint() }),
              {
                copy: 'drop',
                role: 'metadata',
                target: target.group('element'),
              }
            ),
          ],
          root: c.type('token', { default: { type: 'token' }, min: 1 }),
          unknown: 'reject',
          version: 1,
        } as never),
      ],
    });
    const TextOnly = defineEditorSchema('schema:authored-tree-spares-text', {
      elements: { paragraph: schema.element.textBlock() },
      id: 'authored-tree-spares-text',
      properties: [
        schema.textProperty(
          'tok',
          property.string({
            generate: () => String(helper.read.schema.create('token').id),
          })
        ),
      ],
      root: c.type('paragraph', { default: { type: 'paragraph' }, min: 1 }),
      unknown: 'reject',
      version: 1,
    } as never);
    const editor = editorOf(
      [
        {
          children: [{ ...whole({ text: 'a' }, 'delete', 'A'), tok: 't-a' }],
          type: 'paragraph',
        },
      ],
      TextOnly
    );

    assert.equal(authoredTestApi(editor).decide(accept('A')).status, 'applied');
  });
});

describe('spares a schema change leaves behind', () => {
  const idProperty = (key: string, generate: (() => string) | null) =>
    schema.elementProperty(
      key,
      generate ? property.string({ generate }) : property.string(),
      {
        copy: 'drop',
        role: 'metadata',
        target: target.group('element'),
        typeChange: 'preserve-if-allowed',
      }
    );

  it('give way to a spare of the type a quote now builds, so accepting the deletion that empties it applies', () => {
    const lines = (id: string, line: string) =>
      defineEditorSchema(id, {
        elements: {
          line: schema.element.textBlock(),
          paragraph: schema.element.textBlock(),
          quote: {
            content: c.types(['paragraph', 'line'], {
              default: { type: line },
              min: 1,
            }),
          },
        },
        id,
        properties: [idProperty('id', () => mint())],
        root: c.types(['paragraph', 'quote'], {
          default: { type: 'paragraph' },
          min: 1,
        }),
        unknown: 'reject',
        version: 1,
      } as never);
    const saved = structuredClone(
      editorOf(
        [el('quote', 'q', whole(p('x', 'a'), 'delete', 'D'))],
        lines('authored-tree-spares-paragraphs', 'paragraph')
      ).read.value()
    );
    const run = decideIn(
      saved,
      [[accept('D')]],
      lines('authored-tree-spares-lines', 'line')
    );

    assert.deepEqual(
      {
        generated: run.generated,
        lines: run.stored.children[0]?.children?.map(({ type }) => type),
        statuses: run.statuses,
      },
      { generated: 0, lines: ['line'], statuses: ['applied'] }
    );
  });

  it('give way to a spare holding a property a reconfiguration starts generating', () => {
    const withRef = (id: string, generated: boolean) =>
      defineEditorSchema(id, {
        elements,
        id,
        properties: [
          idProperty('id', () => mint()),
          idProperty('ref', generated ? () => `r${mint()}` : null),
        ],
        root,
        unknown: 'reject',
        version: 1,
      } as never);
    const slot = definePluginSlot('authored-tree-spares:ref');
    const editor = createEditor<EditorValue, readonly unknown[]>({
      initialValue: [
        {
          ...el('quote', 'q', { ...whole(p('a'), 'delete', 'A'), ref: 'ra' }),
          ref: 'rq',
        },
      ] as never,
      plugins: [
        slot.of(withRef('authored-tree-spares-ref', false)),
        createAuthoredPlugin({ authorId: 'zed' }),
      ],
    });

    editor.update((tx) =>
      tx.plugins.reconfigure(
        slot,
        withRef('authored-tree-spares-ref-made', true)
      )
    );

    const before = made;
    const { status } = authoredTestApi(editor).decide(accept('A'));

    assert.deepEqual(
      { generated: made - before, status },
      { generated: 0, status: 'applied' }
    );
  });

  it('store a spare for the type rejecting a type tag restores, in every order', () => {
    const value = loaded([
      {
        ...el(
          'pair',
          'pair',
          whole(p('a'), 'delete', 'D'),
          whole(p('b'), 'delete', 'D')
        ),
        authored: [
          {
            ...mark('format', 'F'),
            before: 'quote',
            id: 'F-id',
            key: 'type',
            write: { kind: 'set', value: 'pair' },
          },
        ],
      },
    ]);
    const decided = decidedInEveryOrder(value, [reject('F'), accept('D')]);

    assert.equal(decided.children[0]?.type, 'quote');
  });

  it('give way to a spare a reconfigured validator rejects, and keep one it still accepts', () => {
    const validated = (id: string, rejects: string | null, version: number) =>
      defineEditorSchema(id, {
        elements,
        id,
        properties: [
          schema.elementProperty(
            'id',
            property.string({
              generate: () => mint(),
              validate: (value: unknown): value is string =>
                typeof value === 'string' && value !== rejects,
              validationVersion: version,
            }),
            {
              copy: 'drop',
              role: 'metadata',
              target: target.group('element'),
              typeChange: 'preserve-if-allowed',
            }
          ),
        ],
        root,
        unknown: 'reject',
        version: 1,
      } as never);
    const slot = definePluginSlot('authored-tree-spares:validated');
    const editor = createEditor<EditorValue, readonly unknown[]>({
      initialValue: [el('quote', 'q', whole(p('a'), 'delete', 'A'))] as never,
      plugins: [
        slot.of(validated('authored-tree-spares-valid-1', null, 1)),
        createAuthoredPlugin({ authorId: 'zed' }),
      ],
    });
    const spareNow = () => spareId(editor.read.value().children[0], { min: 0 });
    const first = spareNow();

    editor.update((tx) =>
      tx.plugins.reconfigure(
        slot,
        validated('authored-tree-spares-valid-2', 'other', 2)
      )
    );

    const kept = spareNow();

    editor.update((tx) =>
      tx.plugins.reconfigure(
        slot,
        validated('authored-tree-spares-valid-3', first ?? null, 3)
      )
    );

    const replaced = spareNow();
    const before = made;
    const { status } = authoredTestApi(editor).decide(accept('A'));

    assert.deepEqual(
      {
        generated: made - before,
        kept: kept === first,
        line: idsIn(editor.read.value().children[0] as Node),
        replaced: replaced !== first,
        status,
      },
      {
        generated: 0,
        kept: true,
        line: [replaced],
        replaced: true,
        status: 'applied',
      }
    );
  });

  it('give way to a spare whose lines a raised minimum no longer allows, so accepting the deletion stores a valid quote', () => {
    const quotes = (id: string, min: number) =>
      defineEditorSchema(id, {
        elements: {
          paragraph: schema.element.textBlock(),
          quote: {
            content: c.type('paragraph', {
              default: { type: 'paragraph' },
              min,
            }),
          },
        },
        id,
        properties: [idProperty('id', () => mint())],
        root: c.types(['quote', 'paragraph'], {
          default: { type: 'quote' },
          min: 1,
        }),
        unknown: 'reject',
        version: 1,
      } as never);
    const slot = definePluginSlot('authored-tree-spares:min');
    const editor = createEditor<EditorValue, readonly unknown[]>({
      initialValue: [
        whole(el('quote', 'q', p('a'), p('b')), 'delete', 'D'),
      ] as never,
      plugins: [
        slot.of(quotes('authored-tree-spares-min-1', 1)),
        createAuthoredPlugin({ authorId: 'zed' }),
      ],
    });

    editor.update((tx) =>
      tx.plugins.reconfigure(slot, quotes('authored-tree-spares-min-2', 2))
    );

    const { status } = authoredTestApi(editor).decide(accept('D'));

    assert.deepEqual(
      {
        lines: (editor.read.value().children as Node[]).map(
          (node) => node.children?.length
        ),
        status,
      },
      { lines: [2], status: 'applied' }
    );
  });

  it('give a kept spare the values its prefix slot now requires, as a build without spares does', () => {
    const quotes = (id: string, role: string, generate: boolean) =>
      defineEditorSchema(id, {
        elements: {
          paragraph: schema.element.textBlock(),
          quote: {
            content: c.prefix(
              [{ element: 'row', properties: { role } }],
              c.text({ max: 0 })
            ),
          },
          row: schema.element.textBlock(),
        },
        id,
        properties: [
          idProperty('id', generate ? () => mint() : null),
          schema.elementProperty(
            'role',
            property.string({ default: role, omitDefault: true }),
            { target: target.type('row') }
          ),
        ],
        root: c.types(['quote', 'paragraph'], {
          default: { type: 'paragraph' },
          min: 1,
        }),
        unknown: 'reject',
        version: 1,
      } as never);
    const decided = (generate: boolean) => {
      const slot = definePluginSlot('authored-tree-spares:prefix');
      const editor = createEditor<EditorValue, readonly unknown[]>({
        initialValue: [
          el(
            'quote',
            'q',
            whole(
              { children: [{ text: 'r' }], id: 'r', type: 'row' },
              'delete',
              'D'
            )
          ),
        ] as never,
        plugins: [
          slot.of(
            quotes(`authored-tree-spares-old-${generate}`, 'old', generate)
          ),
          createAuthoredPlugin({ authorId: 'zed' }),
        ],
      });

      editor.update((tx) =>
        tx.plugins.reconfigure(
          slot,
          quotes(`authored-tree-spares-new-${generate}`, 'new', generate)
        )
      );

      const { status } = authoredTestApi(editor).decide(accept('D'));
      const rows = (editor.read.value().children[0] as Node).children ?? [];

      return { rows: rows.map(({ id: _id, ...row }) => row), status };
    };

    assert.deepEqual(decided(true), decided(false));
  });
});

describe('a spare an ancestor’s decision moves', () => {
  const idProperty = schema.elementProperty(
    'id',
    property.string({ generate: () => mint() }),
    {
      copy: 'drop',
      role: 'metadata',
      target: target.group('element'),
      typeChange: 'preserve-if-allowed',
    }
  );

  it('takes the default its new place adds, in every order', () => {
    const Rows = defineEditorSchema('schema:authored-tree-spares-rows', {
      elements: {
        box: {
          content: c.type('group', { default: { type: 'group' }, min: 1 }),
        },
        group: { content: c.type('row', { default: { type: 'row' }, min: 1 }) },
        other: {
          content: c.type('group', { default: { type: 'group' }, min: 1 }),
        },
        row: schema.element.textBlock(),
      },
      id: 'authored-tree-spares-rows',
      properties: [
        idProperty,
        schema.elementProperty('role', property.string({ default: 'nested' }), {
          target: target.and(
            target.type('row'),
            target.parent(target.parent(target.type('box')))
          ),
        }),
      ],
      root: c.types(['box', 'other'], { default: { type: 'box' }, min: 1 }),
      unknown: 'reject',
      version: 1,
    } as never);
    const value = loaded(
      [
        {
          ...el(
            'other',
            'o',
            el(
              'group',
              'g',
              whole(
                { children: [{ text: 'r' }], id: 'r', type: 'row' },
                'delete',
                'D'
              )
            )
          ),
          authored: [
            {
              ...mark('format', 'F'),
              before: 'box',
              id: 'F-id',
              key: 'type',
              write: { kind: 'set', value: 'other' },
            },
          ],
        },
      ],
      undefined,
      Rows
    );
    const group = value.children[0]?.children?.[0];
    const decided = decidedInEveryOrder(
      value,
      [reject('F'), accept('D')],
      Rows
    );

    assert.deepEqual(decided.children[0]?.children?.[0]?.children, [
      {
        children: [{ text: '' }],
        id: spareId(group, { min: 0 }),
        role: 'nested',
        type: 'row',
      },
    ]);
  });

  it('drops a value its new place forbids, in every order', () => {
    const Nested = defineEditorSchema('schema:authored-tree-spares-nested', {
      elements: {
        paragraph: schema.element.textBlock(),
        quote: {
          content: c.type('paragraph', {
            default: { type: 'paragraph' },
            min: 1,
          }),
        },
        section: {
          content: c.type('quote', { default: { type: 'quote' }, min: 1 }),
        },
      },
      id: 'authored-tree-spares-nested',
      properties: [
        idProperty,
        schema.elementProperty('nest', property.string({ default: 'deep' }), {
          role: 'metadata',
          target: target.and(
            target.type('paragraph'),
            target.parent(target.parent(target.type('section')))
          ),
        }),
      ],
      root: c.types(['section', 'quote', 'paragraph'], {
        default: { type: 'paragraph' },
        min: 1,
      }),
      unknown: 'reject',
      version: 1,
    } as never);
    const value = loaded(
      [
        {
          ...el(
            'section',
            's',
            el('quote', 'q', whole({ ...p('a'), nest: 'deep' }, 'delete', 'D'))
          ),
          authored: [mark('unwrap', 'W')],
        },
      ],
      undefined,
      Nested
    );
    const quote = value.children[0]?.children?.[0];
    const decided = decidedInEveryOrder(
      value,
      [accept('W'), accept('D')],
      Nested
    );

    assert.deepEqual(decided.children, [
      el('quote', 'q', {
        children: [{ text: '' }],
        id: spareId(quote, { min: 0 }),
        type: 'paragraph',
      }),
    ]);
  });

  it('drops a value its new place’s validator rejects, in every order', () => {
    const Rows = defineEditorSchema(
      'schema:authored-tree-spares-checked-rows',
      {
        elements: {
          box: {
            content: c.type('group', { default: { type: 'group' }, min: 1 }),
          },
          group: {
            content: c.type('row', { default: { type: 'row' }, min: 1 }),
          },
          other: {
            content: c.type('group', { default: { type: 'group' }, min: 1 }),
          },
          row: schema.element.textBlock(),
        },
        id: 'authored-tree-spares-checked-rows',
        properties: [
          idProperty,
          schema.elementProperty(
            'role',
            property.string({ default: 'other' }),
            {
              target: target.and(
                target.type('row'),
                target.parent(target.parent(target.type('other')))
              ),
            }
          ),
          schema.elementProperty(
            'role',
            property.string({
              default: 'box',
              validate: (value: unknown): value is string => value === 'box',
              validationVersion: 1,
            }),
            {
              target: target.and(
                target.type('row'),
                target.parent(target.parent(target.type('box')))
              ),
            }
          ),
        ],
        root: c.types(['box', 'other'], { default: { type: 'box' }, min: 1 }),
        unknown: 'reject',
        version: 1,
      } as never
    );
    const value = loaded(
      [
        {
          ...el(
            'other',
            'o',
            el(
              'group',
              'g',
              whole(
                {
                  children: [{ text: 'r' }],
                  id: 'r',
                  role: 'other',
                  type: 'row',
                },
                'delete',
                'D'
              )
            )
          ),
          authored: [
            {
              ...mark('format', 'F'),
              before: 'box',
              id: 'F-id',
              key: 'type',
              write: { kind: 'set', value: 'other' },
            },
          ],
        },
      ],
      undefined,
      Rows
    );
    const group = value.children[0]?.children?.[0];
    const decided = decidedInEveryOrder(
      value,
      [reject('F'), accept('D')],
      Rows
    );

    assert.deepEqual(decided.children[0]?.children?.[0]?.children, [
      {
        children: [{ text: '' }],
        id: spareId(group, { min: 0 }),
        role: 'box',
        type: 'row',
      },
    ]);
  });
});

describe('a reconfiguration that stops storing spares', () => {
  it('leaves no spare and drops each `as` value, so each block keeps the value it stores', () => {
    const slot = definePluginSlot('authored-tree-spares:drop');
    const quote = whole(el('quote', 'q', p('a')), 'delete', 'A');
    const copy = whole(p('b', 'm'), 'insert', 'M');
    const twice = whole(p('c', 'n'), 'insert', 'N');
    const editor = createEditor<EditorValue, readonly unknown[]>({
      initialValue: [
        quote,
        {
          ...copy,
          authored: [
            ...(copy.authored ?? []),
            { kind: 'as', values: { id: 'p-a' } },
          ],
        },
        {
          ...twice,
          authored: [
            ...(twice.authored ?? []),
            { kind: 'as', values: { id: 'shown' } },
            { kind: 'as', values: { id: 'unshown' } },
          ],
        },
      ] as never,
      plugins: [slot.of(Generated), createAuthoredPlugin({ authorId: 'zed' })],
    });
    const spared = stored(editor.read.value());

    editor.update((tx) => tx.plugins.reconfigure(slot, Plain));

    assert.deepEqual(
      {
        after: stored(editor.read.value()),
        spared:
          sparesOf(spared.children[0]).length +
          Object.keys(spared.reserves).length,
      },
      {
        after: {
          children: [quote, copy, twice],
          reserves: {},
        },
        spared: 2,
      }
    );
  });
});

describe('spares a pending join still needs', () => {
  it('stay through an unrelated decision while the join’s follower is a quote’s only line, so accepting the join applies', () => {
    const editor = createEditor<EditorValue, readonly unknown[]>({
      initialValue: [
        p('ab'),
        {
          children: [{ text: 'e' }, whole({ text: 'f' }, 'delete', 'B')],
          id: 'pe',
          type: 'paragraph',
        },
        { ...whole(p('gh'), 'delete', 'B'), authored: [mark('join', 'B')] },
        {
          ...p('z', 'formatted'),
          authored: [
            {
              ...mark('format', 'C'),
              before: 'p-z',
              id: 'C-id',
              key: 'id',
              write: { kind: 'set', value: 'formatted' },
            },
          ],
        },
      ] as never,
      plugins: [
        Generated,
        transfer(),
        createAuthoredPlugin({ authorId: 'zed' }),
      ],
    });

    editor.api.transfer.move({
      nodes: [getDefined(editor.key([0]))],
      to: { edge: 'before', key: getDefined(editor.key([2])) },
    });
    editor.update((tx) =>
      tx.nodes.wrap({ children: [], type: 'quote' }, { at: [1] })
    );

    const quoteIn = (value: unknown) =>
      (value as Value).children.find((node) => node.type === 'quote');
    const spare = spareId(quoteIn(editor.read.value()), { min: 0 });
    const statuses = [accept('C'), accept('B')].map(
      (decision) => authoredTestApi(editor).decide(decision).status
    );

    assert.deepEqual(
      { lines: idsIn(quoteIn(editor.read.value())), statuses },
      { lines: [spare], statuses: ['applied', 'applied'] }
    );
  });

  it('stay through a peer’s settle of a verdict on text inside the join’s follower, so accepting the join applies there as where it was decided', () => {
    const editorOver = (value: unknown) =>
      createEditor<EditorValue, readonly unknown[]>({
        initialValue: structuredClone(value) as never,
        plugins: [
          Generated,
          transfer(),
          createAuthoredPlugin({ authorId: 'zed' }),
        ],
      });
    const editor = editorOver([
      {
        children: [{ text: 'ab' }, whole({ text: 'c' }, 'insert', 'C')],
        id: 'p-ab',
        type: 'paragraph',
      },
      {
        children: [{ text: 'e' }, whole({ text: 'f' }, 'delete', 'B')],
        id: 'pe',
        type: 'paragraph',
      },
      { ...whole(p('gh'), 'delete', 'B'), authored: [mark('join', 'B')] },
    ]);

    editor.api.transfer.move({
      nodes: [getDefined(editor.key([0]))],
      to: { edge: 'before', key: getDefined(editor.key([2])) },
    });
    editor.update((tx) =>
      tx.nodes.wrap({ children: [], type: 'quote' }, { at: [1] })
    );

    const deciding = editorOver(editor.read.value());
    const peer = editorOver(editor.read.value());

    authoredTestApi(deciding).decide(accept('C'));
    peer.update({ tags: ['collaboration'] }, (tx) => {
      for (const [id, record] of Object.entries(
        recordsOf(deciding.read.value())['authored-verdicts'] ?? {}
      )) {
        tx.records.put('authored-verdicts', id, record);
      }
    });
    authoredTestApi(deciding).decide(accept('B'));

    assert.deepEqual(
      {
        status: authoredTestApi(peer).decide(accept('B')).status,
        stored: stored(peer.read.value()),
      },
      { status: 'applied', stored: stored(deciding.read.value()) }
    );
  });
});

describe('the prefix check of a build', () => {
  it('reads the spare the shown completion takes, so accepting a deletion beside a pending inserted summary applies', () => {
    const Prefixed = defineEditorSchema('schema:authored-tree-spares-card', {
      elements: {
        ...elements,
        card: {
          content: c.prefix(
            [{ element: 'summary' }, { element: 'summary' }],
            c.types(['summary', 'paragraph'], {
              default: { type: 'paragraph' },
              min: 1,
            })
          ),
        },
      },
      id: 'authored-tree-spares-card',
      properties: [
        schema.elementProperty(
          'id',
          property.string({ generate: () => mint() }),
          {
            copy: 'drop',
            role: 'metadata',
            target: target.group('element'),
            typeChange: 'preserve-if-allowed',
          }
        ),
      ],
      root: c.types(['paragraph', 'card'], {
        default: { type: 'paragraph' },
        min: 1,
      }),
      unknown: 'reject',
      version: 1,
    } as never);
    const summary = (text: string): Node => ({
      children: [{ text }],
      id: text,
      type: 'summary',
    });
    const editor = editorOf(
      [
        el(
          'card',
          'card',
          whole(summary('b'), 'insert', 'B'),
          summary('s0'),
          whole(summary('s1'), 'delete', 'A'),
          p('p')
        ),
      ],
      Prefixed
    );

    assert.equal(authoredTestApi(editor).decide(accept('A')).status, 'applied');
  });
});

describe('spares of a root an element owns', () => {
  const Cards = defineEditorSchema('schema:authored-tree-spares-cards', {
    elements: {
      card: {
        content: c.text({ default: 'text', min: 1 }),
        contentRoots: {
          body: {
            content: c.types(['paragraph'], {
              default: { type: 'paragraph' },
              min: 1,
            }),
            ownership: 'exclusive',
          },
        },
      },
      paragraph: { content: c.text() },
    },
    id: 'authored-tree-spares-cards',
    properties: [
      schema.elementProperty(
        'id',
        property.string({ generate: () => mint() }),
        {
          copy: 'drop',
          role: 'metadata',
          target: target.group('element'),
          typeChange: 'preserve-if-allowed',
        }
      ),
    ],
    root: c.types(['card', 'paragraph'], {
      default: { type: 'paragraph' },
      min: 1,
    }),
    unknown: 'reject',
    version: 1,
  } as never);
  const card = {
    children: [
      p('top'),
      {
        ...whole(
          { children: [{ text: 'c' }], id: 'card', type: 'card' },
          'delete',
          'A'
        ),
        childRoots: { body: 'card:1' },
      },
    ],
    roots: { 'card:1': [whole(p('x'), 'delete', 'B')] },
  };
  const rootsOf = (reserves: object) =>
    Object.values(reserves).map((record: { root: string }) => record.root);

  it('leave the same records in every order once a decision drops the root with its owner', () => {
    const value = structuredClone(editorOf(card, Cards).read.value()) as Value;
    const decided = decidedInEveryOrder(
      value,
      [accept('A'), accept('B')],
      Cards
    );

    assert.deepEqual(
      {
        after: rootsOf(decided.reserves),
        before: rootsOf(stored(value).reserves).toSorted(),
      },
      { after: [], before: ['card:1', 'main'] }
    );
  });

  it('leave no record of the root an Editing removal of its owner drops', () => {
    const editor = editorOf(
      {
        ...card,
        children: [
          p('top'),
          {
            childRoots: { body: 'card:1' },
            children: [{ text: 'c' }],
            id: 'card',
            type: 'card',
          },
        ],
      },
      Cards
    );

    editor.update((tx) => tx.nodes.remove({ at: [1] }));

    assert.equal(
      rootsOf(stored(editor.read.value()).reserves).includes('card:1'),
      false
    );
  });

  it('leave no record at a load for a root the document does not hold', () => {
    const stale = {
      at: 1,
      author: 'B',
      change: 'B',
      node: { children: [{ text: '' }], id: 'stale', type: 'paragraph' },
      root: 'card:1:copy',
      slot: { min: 0 },
    };
    const editor = editorOf(
      {
        ...card,
        records: {
          'authored-reserves': { [reserveIdOf(stale)]: stale },
        },
      },
      Cards
    );

    assert.deepEqual(rootsOf(stored(editor.read.value()).reserves).toSorted(), [
      'card:1',
      'main',
    ]);
  });
});

describe('spares a record write alone changes', () => {
  const reserve = (
    change: string,
    id: string,
    { in: rootKey = 'main', slot = { min: 0 }, type = 'paragraph' } = {}
  ) => ({
    at: 1,
    author: change,
    change,
    node: { children: [{ text: '' }], id, type },
    root: rootKey,
    slot,
  });
  const put = (editor: TestEditor, record: ReturnType<typeof reserve>) =>
    editor.update((tx) =>
      tx.records.put('authored-reserves', reserveIdOf(record as never), record)
    );
  const proposedIds = (editor: TestEditor) =>
    createEditorView(editor, { authored: { preview: 'proposed' } })
      .read.children()
      .map((node) => (node as Node).id);
  const viewsOf = (
    editor: TestEditor,
    roots: readonly string[] = ['main'],
    previews: ReadonlyArray<'accepted' | 'proposed'> = ['accepted', 'proposed']
  ) =>
    previews.map((preview) => {
      const view = createEditorView(editor, { authored: { preview } });

      return roots.map((key) =>
        key === 'main' ? view.read.children() : view.read.root(key)
      );
    });
  const againstLoad = (
    editor: TestEditor,
    plugin: unknown,
    roots?: readonly string[]
  ) => ({
    load: viewsOf(
      editorOf(structuredClone(editor.read.value()), plugin),
      roots
    ),
    view: viewsOf(editor, roots),
  });
  const workOf = (
    editor: TestEditor,
    write: () => void,
    roots: readonly string[] = ['main']
  ) => {
    const start = readLedgerWork();

    write();

    const runs = (['accepted', 'proposed'] as const).map((preview) => {
      const before = readLedgerWork().resolvedRuns;

      viewsOf(editor, roots, [preview]);

      return readLedgerWork().resolvedRuns - before;
    });

    return { rebuilds: readLedgerWork().rebuilds - start.rebuilds, runs };
  };
  const Headed = defineEditorSchema('schema:authored-tree-spares-headed', {
    elements: {
      paragraph: schema.element.textBlock(),
      summary: schema.element.textBlock(),
    },
    id: 'authored-tree-spares-headed',
    properties: [
      schema.elementProperty(
        'id',
        property.string({ generate: () => mint() }),
        {
          copy: 'drop',
          role: 'metadata',
          target: target.group('element'),
          typeChange: 'preserve-if-allowed',
        }
      ),
    ],
    root: c.prefix(
      [{ element: 'summary' }],
      c.types(['paragraph'], { default: { type: 'paragraph' }, min: 1 })
    ),
    unknown: 'reject',
    version: 1,
  } as never);
  const Cards = defineEditorSchema('schema:authored-tree-spares-two-cards', {
    elements: {
      card: {
        content: c.text({ default: 'text', min: 1 }),
        contentRoots: {
          body: {
            content: c.types(['paragraph'], {
              default: { type: 'paragraph' },
              min: 1,
            }),
            ownership: 'exclusive',
          },
        },
      },
      paragraph: { content: c.text() },
    },
    id: 'authored-tree-spares-two-cards',
    properties: [
      schema.elementProperty(
        'id',
        property.string({ generate: () => mint() }),
        {
          copy: 'drop',
          role: 'metadata',
          target: target.group('element'),
          typeChange: 'preserve-if-allowed',
        }
      ),
    ],
    root: c.types(['card', 'paragraph'], {
      default: { type: 'paragraph' },
      min: 1,
    }),
    unknown: 'reject',
    version: 1,
  } as never);
  const card = (id: string, body: string) => ({
    childRoots: { body },
    children: [{ text: id }],
    id,
    type: 'card',
  });
  const twoCards = {
    children: [card('one', 'card:1'), card('two', 'card:2')],
    roots: {
      'card:1': [whole(p('x'), 'delete', 'A')],
      'card:2': [whole(p('y'), 'delete', 'B')],
    },
  };

  it('show the spare a later record write stores, as a fresh load does', () => {
    const first = reserve('A', 'z');
    const editor = editorOf({
      children: [whole(p('x'), 'delete', 'A'), whole(p('y'), 'delete', 'B')],
      records: {
        'authored-reserves': { [reserveIdOf(first)]: first },
      },
    });

    proposedIds(editor);
    const added = reserve('B', 'a');

    editor.update((tx) =>
      tx.records.put('authored-reserves', reserveIdOf(added as never), added)
    );

    assert.deepEqual(
      proposedIds(editor),
      proposedIds(editorOf(structuredClone(editor.read.value())))
    );
  });

  it('show the prefix spare a later record write stores when it comes first in canonical JSON, as a fresh load does', () => {
    const editor = editorOf(
      [
        whole(
          { children: [{ text: 's' }], id: 's', type: 'summary' },
          'delete',
          'A'
        ),
        p('x'),
      ],
      Headed
    );

    viewsOf(editor);
    put(editor, reserve('B', 'a', { slot: { prefix: 0 }, type: 'summary' }));

    const { load, view } = againstLoad(editor, Headed);

    assert.deepEqual(view, load);
  });

  describe('a command that stores a spare itself', () => {
    withoutLawCheck();

    it('show the prefix spare a command stores while it types into the run that takes it, as a fresh load does', () => {
      const editor = editorOf(
        [
          whole(
            { children: [{ text: 's' }], id: 's', type: 'summary' },
            'delete',
            'A'
          ),
          p('x'),
          p('y'),
        ],
        Headed
      );

      put(editor, reserve('B', 'z', { slot: { prefix: 0 }, type: 'summary' }));
      viewsOf(editor);

      const record = reserve('C', 'a', {
        slot: { prefix: 0 },
        type: 'summary',
      });
      const typeAndStore = defineCommand('authored-tree-spares.typeAndStore', {
        build: ({ state }) =>
          state.transaction((tx) => {
            tx.text.insert('q', { at: { offset: 0, path: [1, 0] } });
            tx.records.put('authored-reserves', reserveIdOf(record), record);
          }),
      });

      editor.update.command(typeAndStore);

      const { load, view } = againstLoad(editor, Headed);

      assert.deepEqual(view, load);
    });
  });

  it('resolve only the run that fills a root’s minimum again, in each mode, when a record write alone stores a spare for it', () => {
    const editor = editorOf([p('k'), whole(p('d'), 'delete', 'A')], RootPair);

    viewsOf(editor);

    const work = workOf(editor, () => put(editor, reserve('B', 'a')));
    const { load, view } = againstLoad(editor, RootPair);

    assert.deepEqual(
      { view, work },
      { view: load, work: { rebuilds: 0, runs: [1, 1] } }
    );
  });

  it('show the spare a write stores with content, beside a pending insertion it adds before the run that takes it, as a fresh load does', () => {
    const editor = editorOf([p('k'), whole(p('i'), 'insert', 'A')], RootPair);

    viewsOf(editor);
    editor.update((tx) => {
      tx.nodes.insert(whole(p('n'), 'insert', 'C') as never, { at: [1] });
      tx.records.put(
        'authored-reserves',
        reserveIdOf(reserve('B', 'a')),
        reserve('B', 'a')
      );
    });

    const { load, view } = againstLoad(editor, RootPair);

    assert.deepEqual(view, load);
  });

  it('resolve only the root whose records a write changes, beside another root that takes a spare', () => {
    const editor = editorOf(twoCards, Cards);
    const roots = ['card:1', 'card:2'];

    viewsOf(editor, roots);

    const work = workOf(
      editor,
      () => put(editor, reserve('C', 'a', { in: 'card:1' })),
      roots
    );
    const { load, view } = againstLoad(editor, Cards, roots);

    assert.deepEqual(
      { view, work },
      { view: load, work: { rebuilds: 0, runs: [1, 1] } }
    );
  });

  it('show the spare a write stores as it empties the root’s view, as a fresh load does', () => {
    const editor = editorOf([p('x')]);

    viewsOf(editor);
    editor.update((tx) => {
      tx.nodes.remove({ at: [0] });
      tx.nodes.insert(whole(p('y'), 'delete', 'A') as never, { at: [0] });
      tx.records.put(
        'authored-reserves',
        reserveIdOf(reserve('A', 'a')),
        reserve('A', 'a')
      );
    });

    const { load, view } = againstLoad(editor, Generated);

    assert.deepEqual(view, load);
  });

  it('show the other spare once a record write drops the one the view took, as a fresh load does', () => {
    const taken = reserve('A', 'a');
    const other = reserve('B', 'z');
    const editor = editorOf({
      children: [whole(p('x'), 'delete', 'A'), whole(p('y'), 'delete', 'B')],
      records: {
        'authored-reserves': {
          [reserveIdOf(taken)]: taken,
          [reserveIdOf(other)]: other,
        },
      },
    });

    viewsOf(editor);
    editor.update((tx) =>
      tx.records.drop('authored-reserves', reserveIdOf(taken as never))
    );

    const { load, view } = againstLoad(editor, Generated);

    assert.deepEqual(view, load);
  });

  it('show the spares left once a record write marks the one the view took built, while the root still needs two, as a fresh load does', () => {
    const first = reserve('A', 'a');
    const second = reserve('A', 'b', { slot: { min: 1 } });
    const third = reserve('B', 'c');
    const editor = editorOf(
      {
        children: [whole(p('x'), 'delete', 'A'), whole(p('y'), 'delete', 'A')],
        records: {
          'authored-reserves': Object.fromEntries(
            [first, second, third].map((record) => [
              reserveIdOf(record),
              record,
            ])
          ),
        },
      },
      RootPair
    );

    viewsOf(editor);
    editor.update((tx) => {
      const built = { ...first, built: true as const };

      tx.records.drop('authored-reserves', reserveIdOf(first));
      tx.records.put('authored-reserves', reserveIdOf(built), built);
    });

    const { load, view } = againstLoad(editor, RootPair);

    assert.deepEqual(view, load);
  });

  it('show a root an undo recreates under its old name with its spares, as a fresh load does', () => {
    const editor = createEditor<EditorValue, readonly unknown[]>({
      initialValue: structuredClone(twoCards) as never,
      plugins: [
        Cards,
        createAuthoredPlugin({ authorId: 'zed' }),
        withHistory(),
      ],
    });
    const roots = ['card:1', 'card:2'];

    viewsOf(editor, roots);
    editor.update((tx) => tx.nodes.remove({ at: [0] }));
    viewsOf(editor, ['card:2']);
    historyOf(editor).undo();

    const { load, view } = againstLoad(editor, Cards, roots);

    assert.deepEqual(view, load);
  });

  it('show the spare a record write stores once an undo brings back the run that took a spare before it, as a fresh load does', () => {
    const editor = createEditor<EditorValue, readonly unknown[]>({
      initialValue: [p('k'), whole(p('d'), 'delete', 'A')] as never,
      plugins: [
        RootPair,
        createAuthoredPlugin({ authorId: 'zed' }),
        withHistory(),
      ],
    });
    const added = reserve('B', 'a');

    viewsOf(editor);
    editor.update((tx) => tx.nodes.insert(p('e'), { at: [2] }));
    viewsOf(editor);
    editor.update((tx) => {
      tx.tags.add('history-skip');
      tx.records.put('authored-reserves', reserveIdOf(added), added);
    });
    viewsOf(editor);
    historyOf(editor).undo();

    const { load, view } = againstLoad(editor, RootPair);

    assert.deepEqual(view, load);
  });

  it('show what a decision that drops the root’s spare leaves, as a fresh load does', () => {
    const editor = editorOf([p('k'), whole(p('d'), 'delete', 'A')], RootPair);

    viewsOf(editor);
    authoredTestApi(editor).decide(reject('A'));

    const { load, view } = againstLoad(editor, RootPair);

    assert.deepEqual(view, load);
  });

  it('show the spares a reconfiguration’s load repair stores, as a fresh load does', () => {
    const slot = definePluginSlot('authored-tree-spares:warm-schema');
    const editor = createEditor<EditorValue, readonly unknown[]>({
      initialValue: [whole(p('x'), 'delete', 'A')] as never,
      plugins: [slot.of(Plain), createAuthoredPlugin({ authorId: 'zed' })],
    });

    viewsOf(editor);
    editor.update((tx) => tx.plugins.reconfigure(slot, Generated));

    const { load, view } = againstLoad(editor, Generated);

    assert.deepEqual(view, load);
  });

  it('show the spares an app’s value replace stores for content the view already shows, as a fresh load does', () => {
    const editor = editorOf([p('k'), whole(p('d'), 'delete', 'A')], RootPair);

    viewsOf(editor);
    editor.update((tx) =>
      tx.value.replace({
        children: editor.read.value().children,
        records: {
          'authored-reserves': {
            [reserveIdOf(reserve('B', 'a'))]: reserve('B', 'a'),
          },
        },
      })
    );

    const { load, view } = againstLoad(editor, RootPair);

    assert.deepEqual(view, load);
  });
});

describe('values a pending format tag still decides', () => {
  const formatted = {
    ...p('a', 'x'),
    authored: [
      {
        ...mark('format', 'F'),
        before: 'old',
        id: 'F-id',
        key: 'id',
        write: { kind: 'set', value: 'x' },
      },
    ],
  };
  const copy = {
    ...whole(p('a', 'm'), 'insert', 'M'),
    authored: [mark('insert', 'M'), { kind: 'as', values: { id: 'x' } }],
  };

  it('store one document in every order when rejecting the tag frees the value a copy shows', () => {
    assert.deepEqual(
      decidedInEveryOrder(loaded([formatted, copy]), [accept('M'), reject('F')])
        .children,
      [p('a', 'old'), p('a', 'x')]
    );
  });

  it('store one document in every order when rejecting the tag restores its base value, which a copy shows', () => {
    const history = {
      ...p('a', 'z'),
      authored: [
        {
          ...mark('format', 'F'),
          base: { kind: 'set', value: 'x' },
          before: 'y',
          id: 'F-id',
          key: 'id',
          over: [[{ id: 'gone', write: { kind: 'set', value: 'y' } }]],
          write: { kind: 'set', value: 'z' },
        },
      ],
    };

    assert.deepEqual(
      decidedInEveryOrder(loaded([history, copy]), [accept('M'), reject('F')])
        .children,
      [p('a', 'x'), p('a', 'm')]
    );
  });

  it('store one document in every order when rejecting a type tag drops the value a copy shows from its holder', () => {
    const retyped = {
      ...p('a', 'x'),
      authored: [
        {
          ...mark('format', 'F'),
          before: 'heading',
          id: 'F-id',
          key: 'type',
          write: { kind: 'set', value: 'paragraph' },
        },
      ],
    };

    assert.deepEqual(
      decidedInEveryOrder(
        loaded([retyped, copy], undefined, ParagraphIds),
        [accept('M'), reject('F')],
        ParagraphIds
      ).children,
      [{ children: [{ text: 'a' }], type: 'heading' }, p('a', 'x')]
    );
  });
});

describe('values a block shows in place of the one it stores', () => {
  const Headings = defineEditorSchema('schema:authored-tree-spares-headings', {
    elements: {
      heading: schema.element.textBlock(),
      paragraph: schema.element.textBlock(),
    },
    id: 'authored-tree-spares-headings',
    properties: [
      schema.elementProperty(
        'id',
        property.string({ generate: () => mint() }),
        {
          copy: 'drop',
          role: 'metadata',
          target: target.group('element'),
          typeChange: 'preserve-if-allowed',
        }
      ),
    ],
    root: c.types(['paragraph', 'heading'], {
      default: { type: 'paragraph' },
      min: 1,
    }),
    unknown: 'reject',
    version: 1,
  } as never);
  const shows = (node: Node, change: string, id: string): Node => ({
    ...whole(node, 'insert', change),
    authored: [mark('insert', change), { kind: 'as', values: { id } }],
  });
  const retyped: Node = {
    ...p('t'),
    authored: [
      {
        ...mark('format', 'T'),
        before: 'heading',
        id: 'T-id',
        key: 'type',
        write: { kind: 'set', value: 'paragraph' },
      },
    ],
  };

  it('settle a chain the same in every order, each block writing the value the next one frees', () => {
    assert.deepEqual(
      decidedInEveryOrder(
        loaded([shows(p('a', 'a'), 'M', 'b'), shows(p('b', 'b'), 'N', 'c')]),
        [accept('M'), accept('N')]
      ).children,
      [p('a', 'b'), p('b', 'c')]
    );
  });

  it('settle a chain the same in every order while a pending deletion holds its last value', () => {
    assert.deepEqual(
      decidedInEveryOrder(
        loaded([
          shows(p('a', 'a'), 'A', 'b'),
          shows(p('b', 'b'), 'B', 'c'),
          whole(p('c', 'c'), 'delete', 'C'),
        ]),
        [accept('A'), accept('B'), accept('C')]
      ).children,
      [p('a', 'b'), p('b', 'c')]
    );
  });

  it('settle once their own holders do, while an unrelated block holds a pending type tag', () => {
    assert.deepEqual(
      decidedInEveryOrder(
        loaded(
          [
            whole(p('a', 'x'), 'delete', 'D'),
            shows(p('m', 'm'), 'M', 'x'),
            retyped,
          ],
          undefined,
          Headings
        ),
        [accept('D'), accept('M')],
        Headings
      ).children[0],
      p('m', 'x')
    );
  });

  it('let an Editing insertion store the id it copies, while an unrelated block holds a pending type tag', () => {
    const editor = editorOf([p('a', 'x'), retyped], Headings);

    editor.update((tx) =>
      tx.nodes.insert(
        { children: [{ text: 'c' }], id: 'x', type: 'paragraph' } as never,
        { at: [1] }
      )
    );

    assert.deepEqual(editor.read.value().children[1], p('c', 'x'));
  });

  it('wait for a quote’s unbuilt spare that holds the value a block shows, in every order', () => {
    const value = loaded([
      shows(p('A', 'a'), 'M', 'b'),
      {
        ...el('quote', 'q', whole(p('d', 'd'), 'delete', 'D')),
        authored: [
          {
            ...mark('reserve', 'D'),
            node: p('', 'b'),
            slot: { min: 0 },
            type: 'quote',
          },
        ],
      },
    ]);

    assert.deepEqual(
      decidedInEveryOrder(value, [accept('M'), accept('D')]).children,
      [p('A', 'a'), el('quote', 'q', p('', 'b'))]
    );
    assert.deepEqual(
      decidedInEveryOrder(value, [accept('M'), reject('D')]).children,
      [p('A', 'b'), el('quote', 'q', p('d', 'd'))]
    );
  });

  it('wait for a root’s unbuilt spare that holds the value a block shows, in every order', () => {
    const value = loaded(
      [shows(p('A', 'a'), 'M', 'b'), whole(p('d', 'd'), 'delete', 'D')],
      undefined,
      RootPair
    );
    const reserves = (value.records as Record<string, Record<string, Node>>)[
      'authored-reserves'
    ];
    const [id, spare] = getDefined(
      Object.entries(reserves).find(([, record]) => record.change === 'D')
    );
    const holding: Value = {
      ...value,
      records: {
        ...value.records,
        'authored-reserves': {
          ...reserves,
          [id]: { ...spare, node: p('', 'b') },
        },
      },
    };

    assert.deepEqual(
      decidedInEveryOrder(holding, [accept('M'), accept('D')], RootPair)
        .children,
      [p('A', 'a'), p('', 'b')]
    );
    assert.deepEqual(
      decidedInEveryOrder(holding, [accept('M'), reject('D')], RootPair)
        .children,
      [p('A', 'b'), p('d', 'd')]
    );
  });

  it('drop a shown value the type a decision gives the block cannot hold', () => {
    const value = loaded(
      [
        {
          ...p('x', 'a'),
          authored: [
            {
              ...mark('format', 'F'),
              before: 'heading',
              id: 'F-id',
              key: 'type',
              write: { kind: 'set', value: 'paragraph' },
            },
            { kind: 'as', values: { id: 'b' } },
          ],
        },
      ],
      undefined,
      ParagraphIds
    );

    assert.deepEqual(
      decidedInEveryOrder(value, [reject('F')], ParagraphIds).children,
      [{ children: [{ text: 'x' }], type: 'heading' }]
    );
    assert.deepEqual(
      decidedInEveryOrder(value, [accept('F')], ParagraphIds).children,
      [p('x', 'b')]
    );
  });

  it('drop a shown value its block’s own type cannot hold, as another tool can store one, in the proposed view and once accepted', () => {
    const heading = { children: [{ text: 'x' }], type: 'heading' };
    const value = loaded([shows(heading, 'M', 'b')], undefined, ParagraphIds);

    assert.deepEqual(
      createEditorView(editorOf(value, ParagraphIds), {
        authored: { preview: 'proposed' },
      }).read.children(),
      [heading]
    );
    assert.deepEqual(
      decidedInEveryOrder(value, [accept('M')], ParagraphIds).children,
      [heading]
    );
  });
});

describe('a rejected Enter at a line’s start under an id only paragraphs hold', () => {
  /** A retype to heading, which drops the id a paragraph stores. */
  const retypeTags = (change: string, id: string) => [
    {
      ...mark('format', change),
      before: id,
      id: `${change}-id`,
      key: 'id',
      write: { kind: 'remove' },
    },
    {
      ...mark('format', change),
      before: 'paragraph',
      id: `${change}-id`,
      key: 'type',
      write: { kind: 'set', value: 'heading' },
    },
  ];

  it('stores the same line in every order while the moved text holds a pending retype to heading', () => {
    const value = loaded(
      [
        p('', 'a'),
        {
          authored: [...retypeTags('R', 'g1'), mark('split', 'B')],
          children: [{ text: 'b' }],
          type: 'heading',
        },
      ],
      undefined,
      ParagraphIds
    );

    assert.deepEqual(
      decidedInEveryOrder(value, [reject('B'), accept('R')], ParagraphIds)
        .children,
      [{ children: [{ text: 'b' }], type: 'heading' }]
    );
  });

  it('stores the same line in every order while the empty line holds a pending retype to heading and a pending deletion', () => {
    const value = loaded(
      [
        {
          authored: [...retypeTags('R', 'a'), mark('delete', 'D')],
          children: [{ authored: [mark('delete', 'D')], text: '' }],
          type: 'heading',
        },
        { ...p('b', 'g1'), authored: [mark('split', 'B')] },
      ],
      undefined,
      ParagraphIds
    );

    assert.deepEqual(
      decidedInEveryOrder(
        value,
        [reject('B'), reject('R'), reject('D')],
        ParagraphIds
      ).children,
      [p('b', 'g1')]
    );
  });
});

describe('the walks generated values take', () => {
  withoutLawCheck();

  it('read no element for its generated values in a decision where no spare is stored', () => {
    const editor = editorOf(
      [
        ...Array.from({ length: 500 }, (_, index) => p(`line ${index}`)),
        whole(p('b'), 'delete', 'A'),
      ],
      Plain
    );
    const before = readCoreWork();

    authoredTestApi(editor).decide(accept('A'));

    assert.equal(readCoreWork().valueHolderReads - before.valueHolderReads, 0);
  });
});

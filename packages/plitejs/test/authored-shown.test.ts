import assert from 'node:assert/strict';
import { join } from 'node:path';
import { afterEach, describe, it } from 'node:test';

import {
  createEditor,
  defineEditorSchema,
  definePlugin,
  DocumentChange,
  type Editor,
  property,
  schema,
  target,
  type Value as EditorValue,
} from 'plitejs';
import * as Y from 'yjs';

import { createAuthoredPlugin } from '../src/authored/authored';
import { contextRecordOf, reserveIdOf } from '../src/authored/facts/records';
import { getReviewLedger } from '../src/authored/ledger/ledger';
import * as refusal from '../src/authored/refusal';
import { valueRootIndex } from '../src/core/change/document-change';
import type { DocumentIndex } from '../src/core/change/document-index';
import {
  DOCUMENT_SETTLED_TAG,
  documentAdmissionPoint,
} from '../src/core/document-admission';
import { registerEditorDraftGuard } from '../src/core/document-recorder';
import { getEditorRuntimeOwner } from '../src/core/editor-runtime';
import { getCompiledEditorSchema } from '../src/core/plugin-registry';
import { readCoreWork } from '../src/core/work';
import { getEditorAuthoredDocumentCapability } from '../src/create-editor';
import { History, history } from '../src/history';
import { getDefined } from '../src/internal/get-defined';
import { yjs } from '../src/yjs';
import { getActiveYjsController } from '../src/yjs/core/controller-registry';
import { readPliteValueFromYjs } from '../src/yjs/core/document';
import {
  authoredTestApi,
  reviewRecords,
  staleRecordOf,
  unsettledCommits,
} from './support/authored';

const real = { ...refusal };
// Suggesting stays off under any element generator until the construction
// values plan's step 10 narrows the refusal, so the Suggesting rows lift it.
let lifted = false;
let fixedIds = false;

mock.module(join(import.meta.dir, '../src/authored/refusal.ts'), () => ({
  ...real,
  constructsValues: (...args: Parameters<typeof real.constructsValues>) =>
    !lifted && real.constructsValues(...args),
}));

type Node = Readonly<{
  authored?: ReadonlyArray<Record<string, unknown>>;
  children?: readonly Node[];
  id?: string;
  text?: string;
  type?: string;
  [key: string]: unknown;
}>;
type TestEditor = Editor<EditorValue, readonly unknown[]>;
type Decision = Readonly<{ action: 'accept' | 'reject'; changes: string[] }>;

const c = schema.content;
let made = 0;
const mintedIds = new Set<string>();
const mint = () => {
  const value = `g${(made += 1)}`;

  mintedIds.add(value);

  return value;
};
const Generated = defineEditorSchema('schema:authored-shown-concurrency', {
  elements: {
    paragraph: schema.element.textBlock(),
    quote: {
      content: c.type('paragraph', { default: { type: 'paragraph' }, min: 1 }),
    },
  },
  id: 'authored-shown-concurrency',
  properties: [
    schema.elementProperty('id', property.string({ generate: mint }), {
      copy: 'drop',
      role: 'metadata',
      target: target.group('element'),
      typeChange: 'preserve-if-allowed',
    }),
  ],
  root: c.types(['paragraph', 'quote'], {
    default: { type: 'paragraph' },
    min: 1,
  }),
  unknown: 'reject',
  version: 1,
} as never);
/** Only a paragraph holds an id, so a heading cannot hold the one it shows. */
const ParagraphIds = defineEditorSchema(
  'schema:authored-shown-concurrency-paragraph-ids',
  {
    elements: {
      heading: schema.element.textBlock(),
      paragraph: schema.element.textBlock(),
    },
    id: 'authored-shown-concurrency-paragraph-ids',
    properties: [
      schema.elementProperty('id', property.string({ generate: mint }), {
        copy: 'drop',
        role: 'metadata',
        target: target.type('paragraph'),
        typeChange: 'preserve-if-allowed',
      }),
    ],
    root: c.types(['paragraph', 'heading'], {
      default: { type: 'paragraph' },
      min: 1,
    }),
    unknown: 'reject',
    version: 1,
  } as never
);
const underQuote = target.parent(target.type('quote'));
/**
 * Paragraphs generate their id, a heading inside a quote holds only `"a"`,
 * and a heading elsewhere holds any string.
 */
const PlacedIds = defineEditorSchema(
  'schema:authored-shown-concurrency-placed-ids',
  {
    elements: {
      heading: schema.element.textBlock(),
      paragraph: schema.element.textBlock(),
      quote: {
        content: c.types(['paragraph', 'heading'], {
          default: { type: 'paragraph' },
          min: 1,
        }),
      },
      section: {
        content: c.types(['paragraph', 'heading'], {
          default: { type: 'paragraph' },
          min: 1,
        }),
      },
    },
    id: 'authored-shown-concurrency-placed-ids',
    properties: [
      schema.elementProperty('id', property.string({ generate: mint }), {
        copy: 'drop',
        role: 'metadata',
        split: 'drop',
        target: target.type('paragraph'),
        typeChange: 'preserve-if-allowed',
      }),
      schema.elementProperty(
        'id',
        property.string({
          validate: (value: unknown): value is string => value === 'a',
          validationVersion: 1,
        }),
        {
          role: 'metadata',
          split: 'drop',
          target: target.and(target.type('heading'), underQuote),
        }
      ),
      schema.elementProperty('id', property.string(), {
        role: 'metadata',
        split: 'drop',
        target: target.and(target.type('heading'), target.not(underQuote)),
      }),
    ],
    root: c.types(['paragraph', 'heading', 'quote', 'section'], {
      default: { type: 'paragraph' },
      min: 1,
    }),
    unknown: 'reject',
    version: 1,
  } as never
);
const paragraphId = (key: string) =>
  schema.elementProperty(key, property.string({ generate: mint }), {
    copy: 'drop',
    role: 'metadata',
    target: target.type('paragraph'),
    typeChange: 'preserve-if-allowed',
  });
/** A card's body is a root of its own, which removing the card orphans. */
const Cards = defineEditorSchema('schema:authored-shown-cards', {
  elements: {
    card: {
      content: c.text({ default: 'text', min: 1 }),
      contentRoots: {
        body: {
          content: c.type('paragraph', {
            default: { type: 'paragraph' },
            min: 1,
          }),
          ownership: 'exclusive',
        },
      },
    },
    paragraph: schema.element.textBlock(),
  },
  id: 'authored-shown-cards',
  properties: [paragraphId('id')],
  root: c.types(['paragraph', 'card'], {
    default: { type: 'paragraph' },
    min: 1,
  }),
  unknown: 'reject',
  version: 1,
} as never);
const TwoKeys = defineEditorSchema('schema:authored-shown-two-keys', {
  elements: { paragraph: schema.element.textBlock() },
  id: 'authored-shown-two-keys',
  properties: [paragraphId('id'), paragraphId('uid')],
  root: c.type('paragraph', { default: { type: 'paragraph' }, min: 1 }),
  unknown: 'reject',
  version: 1,
} as never);

const SetOrString = defineEditorSchema('schema:authored-shown-set-or-string', {
  elements: {
    paragraph: schema.element.textBlock(),
    s: schema.element.textBlock(),
    t: schema.element.textBlock(),
  },
  id: 'authored-shown-set-or-string',
  properties: [
    schema.elementProperty('id', property.string({ generate: mint }), {
      copy: 'drop',
      role: 'metadata',
      target: target.group('element'),
      typeChange: 'preserve-if-allowed',
    }),
    schema.elementProperty('tags', property.set(property.string()), {
      target: target.type('s'),
    }),
    schema.elementProperty('tags', property.string(), {
      target: target.type('t'),
    }),
  ],
  root: c.types(['paragraph', 's', 't'], {
    default: { type: 'paragraph' },
    min: 1,
  }),
  unknown: 'reject',
  version: 1,
} as never);
const paragraphs = {
  content: c.type('paragraph', { default: { type: 'paragraph' }, min: 1 }),
};
const SetOrStringUnder = defineEditorSchema(
  'schema:authored-shown-set-or-string-under',
  {
    elements: {
      paragraph: schema.element.textBlock(),
      s: paragraphs,
      t: paragraphs,
    },
    id: 'authored-shown-set-or-string-under',
    properties: [
      schema.elementProperty('id', property.string({ generate: mint }), {
        copy: 'drop',
        role: 'metadata',
        target: target.group('element'),
        typeChange: 'preserve-if-allowed',
      }),
      schema.elementProperty('tags', property.set(property.string()), {
        target: target.parent(target.type('s')),
      }),
      schema.elementProperty('tags', property.string(), {
        target: target.parent(target.type('t')),
      }),
    ],
    root: c.types(['paragraph', 's', 't'], {
      default: { type: 'paragraph' },
      min: 1,
    }),
    unknown: 'reject',
    version: 1,
  } as never
);

const documents = new Set<Y.Doc>();

const { guard: guarded, take: unsettled } = unsettledCommits();

afterEach(() => {
  lifted = false;
  fixedIds = false;
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
/** A pending insertion of `node` that shows `id` in place of the one it stores. */
const shows = (node: Node, change: string, id: string): Node => ({
  ...whole(node, 'insert', change),
  authored: [mark('insert', change), { kind: 'as', values: { id } }],
});
const accept = (change: string): Decision => ({
  action: 'accept',
  changes: [change],
});
const reject = (change: string): Decision => ({
  action: 'reject',
  changes: [change],
});

const authoredPlugin = () =>
  createAuthoredPlugin({
    authorId: 'zed',
    ...(fixedIds ? { createTagId: mint, now: () => 1 } : {}),
  });
const editorOf = (
  value: unknown,
  plugin: unknown,
  extra: readonly unknown[] = []
): TestEditor =>
  guarded(
    createEditor<EditorValue, readonly unknown[]>({
      initialValue: structuredClone(value) as never,
      plugins: [plugin, ...extra, authoredPlugin()],
    })
  );
const childrenOf = (editor: TestEditor): Node[] =>
  structuredClone(editor.read.value().children) as never;
const shownOf = (node: Node | undefined) =>
  (node?.authored ?? []).find((member) => member.kind === 'as')?.values ?? null;
const describeNode = (node: Node | undefined) =>
  JSON.stringify({ alias: shownOf(node), stored: node?.id });

/** One editor deciding `steps` in turn. */
const inTurn = (
  value: readonly Node[],
  steps: ReadonlyArray<readonly Decision[]>,
  plugin: unknown
) => {
  const editor = editorOf(value, plugin);
  const statuses = steps.map(
    (step) => authoredTestApi(editor).decide(step).status
  );

  return { children: childrenOf(editor), editor, statuses };
};

/** A peer of `doc`'s room that seeds the room with `seed` when one is given. */
const peerOn = (
  doc: Y.Doc,
  plugin: unknown,
  seed?: unknown,
  extra: readonly unknown[] = [],
  wrap: (editor: TestEditor) => TestEditor = guarded
) => {
  documents.add(doc);

  return wrap(
    createEditor<EditorValue, readonly unknown[]>({
      ...(seed ? { initialValue: structuredClone(seed) as never } : {}),
      plugins: [
        plugin,
        ...extra,
        authoredPlugin(),
        yjs({ doc, initialReady: true, ...(seed ? { seed: true } : {}) }),
      ] as never,
    })
  );
};
/** A peer of a room that holds `from`'s update. */
const joining = (from: Y.Doc, plugin: unknown) => {
  const doc = new Y.Doc();

  Y.applyUpdate(doc, Y.encodeStateAsUpdate(from));

  return peerOn(doc, plugin);
};
/** Gives `peer` of `to` what `update` holds, or what `from` holds that `to` lacks. */
const deliver = (update: Uint8Array | Y.Doc, to: Y.Doc, peer: TestEditor) => {
  Y.applyUpdate(
    to,
    update instanceof Y.Doc
      ? Y.encodeStateAsUpdate(update, Y.encodeStateVector(to))
      : update
  );
  getDefined(getActiveYjsController(peer)).debugProcessAvailableInput();
};

/**
 * Two peers on one room, each deciding its own decision before anything is
 * delivered; then each receives the other's update, `first`'s going out first.
 */
const concurrently = (
  value: unknown,
  decisions: readonly [Decision, Decision],
  first: 0 | 1,
  plugin: unknown = Generated
) => {
  const docs = [new Y.Doc(), new Y.Doc()] as const;
  const peers = [peerOn(docs[0], plugin, value)];

  Y.applyUpdate(docs[1], Y.encodeStateAsUpdate(docs[0]));
  peers.push(peerOn(docs[1], plugin));

  const loaded = childrenOf(peers[0]);
  const statuses = decisions.map(
    (decision, index) => authoredTestApi(peers[index]).decide(decision).status
  );
  const exchange = () => {
    deliver(docs[first], docs[1 - first], getDefined(peers[1 - first]));
    deliver(docs[1 - first], docs[first], getDefined(peers[first]));
  };

  exchange();

  return {
    docs,
    exchange,
    loaded,
    peers,
    read: () => peers.map(childrenOf),
    statuses,
  };
};

describe('shown values two peers decide at once', () => {
  for (const first of [0, 1] as const) {
    it(`settle Astra 2's spare holder once one peer accepts the insertion and the other rejects the deletion whose spare holds the shown value, peer ${first} delivering first`, () => {
      const value = [
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
      ];
      const decisions = [accept('M'), reject('D')] as const;
      const room = concurrently(value, decisions, first);
      const stored = room.read();
      const sequential = [
        inTurn(room.loaded, [[decisions[0]], [decisions[1]]], Generated),
        inTurn(room.loaded, [[decisions[1]], [decisions[0]]], Generated),
      ];
      const report = [
        `statuses ${JSON.stringify(room.statuses)}`,
        ...stored.map(
          (children, index) =>
            `peer ${index}: A ${describeNode(children[0])}; document ${JSON.stringify(children)}`
        ),
        ...sequential.map(
          (run, index) =>
            `in turn ${index === 0 ? 'M then D' : 'D then M'}: A ${describeNode(run.children[0])}`
        ),
      ].join('\n');

      for (const children of stored) {
        assert.deepEqual(children[0], p('A', 'b'), report);
      }
    });

    it(`settle two ordinary pending holders of one shown value, an insertion that shows it and a deletion of the block that stores it, once two peers accept them at once, peer ${first} delivering first`, () => {
      const value = [
        shows(p('A', 'a'), 'M', 'b'),
        whole(p('d', 'b'), 'delete', 'D'),
        whole(p('z', 'p-z'), 'insert', 'Z'),
      ];
      const decisions = [accept('M'), accept('D')] as const;
      const room = concurrently(value, decisions, first);
      const stored = room.read();
      const sequential = [
        inTurn(room.loaded, [[decisions[0]], [decisions[1]]], Generated),
        inTurn(room.loaded, [[decisions[1]], [decisions[0]]], Generated),
      ];

      authoredTestApi(room.peers[0]).decide(accept('Z'));
      room.exchange();

      const later = room.read();
      const report = [
        `statuses ${JSON.stringify(room.statuses)}`,
        ...stored.map(
          (children, index) =>
            `peer ${index}: A ${describeNode(children[0])}; document ${JSON.stringify(children)}`
        ),
        ...sequential.map(
          (run, index) =>
            `in turn ${index === 0 ? 'M then D' : 'D then M'}: A ${describeNode(run.children[0])}`
        ),
        ...later.map(
          (children, index) =>
            `after peer 0 accepts an unrelated Z: peer ${index} A ${describeNode(children[0])}`
        ),
      ].join('\n');

      for (const children of stored) {
        assert.deepEqual(children[0], p('A', 'b'), report);
      }
    });
  }
});

describe('shown values a storing visit judges', () => {
  it("store one value in every order when an accepted join moves Sol 4's heading out of the quote that cannot hold its shown value", () => {
    const value: Node[] = [
      p('t', 'p-t'),
      {
        children: [
          {
            authored: [
              {
                at: 1,
                author: 'erin',
                change: '~edit:erin',
                follows: JSON.stringify(['J', 1]),
                kind: 'insert',
              },
              { kind: 'as', values: { id: 'b' } },
            ],
            children: [{ text: 'f' }],
            id: 'a',
            type: 'heading',
          },
        ],
        type: 'quote',
      },
      { ...p('s', 'p-s'), authored: [mark('join', 'J')] },
      whole(p('u', 'p-u'), 'delete', 'C'),
    ];
    const loaded = childrenOf(editorOf(value, PlacedIds));
    const runs = [
      ['J then C', [[accept('J')], [accept('C')]]],
      ['C then J', [[accept('C')], [accept('J')]]],
      ['together', [[accept('J'), accept('C')]]],
    ] as const;
    const results = runs.map(([name, steps]) => {
      const run = inTurn(loaded, steps, PlacedIds);
      const heading = JSON.stringify(run.children).includes('"heading"')
        ? findHeading(run.children)
        : undefined;

      return { heading, name, ...run };
    });
    const report = [
      `loaded ${JSON.stringify(loaded)}`,
      ...results.map(
        ({ children, heading, name, statuses }) =>
          `${name}: ${JSON.stringify(statuses)} F ${describeNode(heading)}; document ${JSON.stringify(children)}`
      ),
    ].join('\n');
    const settled = results.filter(
      ({ statuses }) => !statuses.includes('blocked')
    );

    assert.ok(settled.length >= 2, report);
    for (const { children } of settled) {
      assert.deepEqual(children, settled[0]?.children, report);
    }
  });

  it("apply Opus 2's unrelated insertion while a heading that cannot hold its shown value keeps a pending type tag", () => {
    const heading: Node = {
      authored: [
        {
          ...mark('format', 'F'),
          before: 'paragraph',
          id: 'F-id',
          key: 'type',
          write: { kind: 'set', value: 'heading' },
        },
        { kind: 'as', values: { id: 'b' } },
      ],
      children: [{ text: 'h' }],
      type: 'heading',
    };
    const loaded = childrenOf(
      editorOf([heading, whole(p('x', 'p-x'), 'insert', 'X')], ParagraphIds)
    );
    const editor = editorOf(loaded, ParagraphIds);
    const result = authoredTestApi(editor).decide(accept('X'));
    const after = childrenOf(editor);
    const report = `loaded ${JSON.stringify(loaded)}\nresult ${JSON.stringify(result)}\nafter ${JSON.stringify(after)}`;

    assert.equal(result.status, 'applied', report);
    assert.deepEqual(after[0], loaded[0], report);
  });
});

function findHeading(nodes: readonly Node[]): Node | undefined {
  for (const node of nodes) {
    if (node.type === 'heading') return node;
    const inner = node.children ? findHeading(node.children) : undefined;

    if (inner) return inner;
  }
  return undefined;
}

/** An element that shows `id` in place of the one it stores, with nothing pending. */
const aliased = (node: Node, id: string): Node => ({
  ...node,
  authored: [{ kind: 'as', values: { id } }],
});
/** Whether each commit of `editor` from now on carries the settled tag. */
const settledCommits = (editor: TestEditor) => {
  const seen: boolean[] = [];

  editor.subscribeCommit((commit) =>
    seen.push(commit.tags.includes(DOCUMENT_SETTLED_TAG))
  );

  return seen;
};
const creatingBody = (tx: unknown) =>
  (
    tx as { roots: { create: (root: string, nodes: unknown) => void } }
  ).roots.create('b9', [aliased(p('B', 'a'), 'b')]);
const card = (root: string): Node => ({
  childRoots: { body: root },
  children: [{ text: 'C' }],
  type: 'card',
});
/** Bob's suggestion that retypes paragraph `c` into a card whose body is `root`. */
const retyped = (root: string): Node => {
  const tag = (key: string, fields: Record<string, unknown>) => ({
    at: 1,
    author: 'bob',
    change: 'bob:1',
    id: 'retype',
    key,
    kind: 'format',
    ...fields,
  });

  return {
    ...card(root),
    authored: [
      tag('id', { before: 'c', write: { kind: 'remove' } }),
      tag('type', {
        before: 'paragraph',
        write: { kind: 'set', value: 'card' },
      }),
      tag('childRoots', { write: { kind: 'set', value: { body: root } } }),
    ],
  };
};
const rejectedRetype = reviewRecords({
  verdicts: [
    {
      decision: 'd:1',
      member: { at: 1, change: 'bob:1' },
      verdict: 'reject',
    } as never,
  ],
});

describe('a commit settling shown values', () => {
  it('stores the value a shower shows in a card body the same commit creates', () => {
    const editor = editorOf([p('Z', 'z')], Cards);

    editor.update((tx) => {
      creatingBody(tx);
      tx.nodes.insert(card('b9') as never, { at: [1] });
    });

    assert.deepEqual(storedOf(editor), {
      children: [p('Z', 'z'), card('b9')],
      roots: { b9: [p('B', 'b')] },
    });
  });

  it('stores the value a shower shows under a generated key whose name holds a NUL once its insertion is accepted', () => {
    const key = 'id\u0000tail';
    const NulKey = defineEditorSchema('schema:authored-shown-nul-key', {
      elements: { paragraph: schema.element.textBlock() },
      id: 'authored-shown-nul-key',
      properties: [
        schema.elementProperty(key, property.string({ generate: mint }), {
          copy: 'drop',
          role: 'metadata',
          target: target.group('element'),
          typeChange: 'preserve-if-allowed',
        }),
      ],
      root: c.types(['paragraph'], { default: { type: 'paragraph' }, min: 1 }),
      unknown: 'reject',
      version: 1,
    } as never);
    const line = (value: string): Node => ({
      children: [{ text: 'A' }],
      [key]: value,
      type: 'paragraph',
    });
    const editor = editorOf(
      [
        {
          ...line('a'),
          authored: [
            mark('insert', 'M'),
            { kind: 'as', values: { [key]: 'b' } },
          ],
        },
      ],
      NulKey
    );

    authoredTestApi(editor).decide(accept('M'));

    assert.deepEqual(childrenOf(editor), [line('b')]);
  });

  it('leaves a shower whose own insertion is pending as it was when an unrelated decision commits', () => {
    const editor = editorOf(
      [shows(p('A', 'a'), 'M', 'b'), whole(p('x', 'p-x'), 'insert', 'X')],
      Generated
    );
    const before = childrenOf(editor)[0];

    authoredTestApi(editor).decide(accept('X'));

    assert.deepEqual(shownOf(before), { id: 'b' });
    assert.deepEqual(childrenOf(editor)[0], before);
  });

  it('tags the commit that settles a value, and no commit that settles none', () => {
    const editor = editorOf(
      [shows(p('A', 'a'), 'M', 'b'), whole(p('x', 'p-x'), 'insert', 'X')],
      Generated
    );
    const settled = settledCommits(editor);

    authoredTestApi(editor).decide(accept('X'));
    authoredTestApi(editor).decide(accept('M'));

    assert.deepEqual(
      { settled, shower: childrenOf(editor)[0] },
      { settled: [false, true], shower: p('A', 'b') }
    );
  });

  it('stores one value in both orders when the quote around a heading that shows it has a pending type tag', () => {
    const quoted: Node = {
      authored: [
        {
          ...mark('format', 'F'),
          before: 'section',
          id: 'F-id',
          key: 'type',
          write: { kind: 'set', value: 'quote' },
        },
      ],
      children: [
        shows(
          { children: [{ text: 'h' }], id: 'a', type: 'heading' },
          'M',
          'b'
        ),
      ],
      type: 'quote',
    };
    const runs = [
      inTurn([quoted], [[accept('M')], [reject('F')]], PlacedIds),
      inTurn([quoted], [[reject('F')], [accept('M')]], PlacedIds),
    ];
    const report = runs
      .map(
        ({ children, statuses }) => `${statuses} ${JSON.stringify(children)}`
      )
      .join('\n');

    for (const { children } of runs) {
      assert.deepEqual(
        children,
        [
          {
            children: [{ children: [{ text: 'h' }], id: 'b', type: 'heading' }],
            type: 'section',
          },
        ],
        report
      );
    }
  });

  it('keeps a shower waiting while the insertion its context carries is undecided', () => {
    const ctx = contextRecordOf(null, { at: 1, author: 'bob', change: 'B' });
    const editor = editorOf(
      {
        children: [
          {
            ...p('A', 'a'),
            authored: [
              { ctx: ctx.ctx, kind: 'in' },
              { kind: 'as', values: { id: 'b' } },
            ],
          },
        ],
        records: reviewRecords({ contexts: [ctx] }),
      },
      Generated
    );
    const loaded = describeNode(childrenOf(editor)[0]);

    authoredTestApi(editor).decide(accept('B'));

    assert.deepEqual(
      { decided: childrenOf(editor)[0], loaded },
      {
        decided: p('A', 'b'),
        loaded: JSON.stringify({ alias: { id: 'b' }, stored: 'a' }),
      }
    );
  });

  it('gives a shower two blocks before the decided block its value', () => {
    const { children } = inTurn(
      [
        shows(p('A', 'a'), 'M', 'b'),
        p('m', 'p-m'),
        whole(p('d', 'b'), 'delete', 'D'),
      ],
      [[accept('M')], [accept('D')]],
      Generated
    );

    assert.deepEqual(children, [p('A', 'b'), p('m', 'p-m')]);
  });

  it('stores one value in every decision order and on two peers when two showers show it', () => {
    const value = [shows(p('A', 'a'), 'M', 'b'), shows(p('C', 'c'), 'N', 'b')];
    const results = [
      inTurn(value, [[accept('M')], [accept('N')]], Generated).children,
      inTurn(value, [[accept('N')], [accept('M')]], Generated).children,
      inTurn(value, [[{ action: 'accept', changes: ['M', 'N'] }]], Generated)
        .children,
      ...([0, 1] as const).flatMap((first) =>
        concurrently(value, [accept('M'), accept('N')], first).read()
      ),
    ];

    for (const children of results) {
      assert.deepEqual(
        children,
        [p('A', 'b'), p('C', 'c')],
        JSON.stringify(results)
      );
    }
  });

  it('settles each key of an element that shows two keys by itself', () => {
    const editor = editorOf(
      [
        {
          ...p('A', 'a'),
          authored: [
            { kind: 'as', values: { id: 'b' } },
            { kind: 'as', values: { uid: 'v' } },
          ],
          uid: 'u',
        },
        whole({ ...p('d', 'p-d'), uid: 'v' }, 'delete', 'D'),
      ],
      TwoKeys
    );
    const loaded = childrenOf(editor)[0];

    authoredTestApi(editor).decide(accept('D'));

    assert.deepEqual(
      { decided: childrenOf(editor), loaded },
      {
        decided: [{ ...p('A', 'b'), uid: 'v' }],
        loaded: {
          ...p('A', 'b'),
          authored: [{ kind: 'as', values: { uid: 'v' } }],
          uid: 'u',
        },
      }
    );
  });

  it('stores one value on two peers and a late joiner when each peer settles the other’s decision before their repairs cross', () => {
    const value = [
      shows(p('A', 'a'), 'M', 'b'),
      whole(p('d', 'b'), 'delete', 'D'),
    ];
    const docs = [new Y.Doc(), new Y.Doc()] as const;
    const peers = [peerOn(docs[0], Generated, value)] as const;

    Y.applyUpdate(docs[1], Y.encodeStateAsUpdate(docs[0]));

    const both = [...peers, peerOn(docs[1], Generated)] as const;

    authoredTestApi(both[0]).decide(accept('M'));
    authoredTestApi(both[1]).decide(accept('D'));

    const decisions = docs.map((doc) => Y.encodeStateAsUpdate(doc));

    deliver(getDefined(decisions[1]), docs[0], both[0]);
    deliver(getDefined(decisions[0]), docs[1], both[1]);

    const settled = both.map(childrenOf);

    deliver(docs[0], docs[1], both[1]);
    deliver(docs[1], docs[0], both[0]);

    const room = [
      ...both.map(childrenOf),
      ...both.map((peer) =>
        readPliteValueFromYjs(
          getDefined(getActiveYjsController(peer)).debugRoot()
        )
      ),
      childrenOf(joining(docs[0], Generated)),
    ];

    for (const children of [...settled, ...room]) {
      assert.deepEqual(children, [p('A', 'b')], JSON.stringify(room));
    }
  });
});

describe('a load settling shown values', () => {
  it('settles a ready alias when nothing else repairs the document, on the loading peer and a peer that imports its seed', () => {
    const value = [aliased(p('A', 'a'), 'b'), p('x', 'p-x')];
    const doc = new Y.Doc();
    const loaded = [editorOf(value, Generated), peerOn(doc, Generated, value)];

    for (const children of [...loaded, joining(doc, Generated)].map(
      childrenOf
    )) {
      assert.deepEqual(children, [p('A', 'b'), p('x', 'p-x')]);
    }
  });

  it('settles a ready alias in a document an import or a migration repairs through the authored capability', () => {
    const editor = editorOf([p('x', 'p-x')], Generated);
    const repaired = getDefined(
      getEditorAuthoredDocumentCapability(editor)
    ).repair(
      { children: [aliased(p('A', 'a'), 'b'), p('x', 'p-x')] } as never,
      getCompiledEditorSchema(editor)
    );

    assert.deepEqual(repaired.children, [p('A', 'b'), p('x', 'p-x')]);
  });

  it('settles in the load that drops a rejected retype’s root holding a pending holder, and loading the result again changes nothing', () => {
    const editor = editorOf(
      {
        children: [aliased(p('A', 'a'), 'b'), retyped('b9')],
        records: rejectedRetype,
        roots: { b9: [whole(p('B', 'b'), 'insert', 'Q')] },
      },
      Cards
    );
    const loaded = editor.read.value();

    assert.deepEqual(
      { children: childrenOf(editor), roots: loaded.roots ?? {} },
      { children: [p('A', 'b'), p('C', 'c')], roots: {} }
    );
    assert.deepEqual(editorOf(loaded, Cards).read.value(), loaded);
  });

  it('gives a shower the value a root the load drops stored', () => {
    const editor = editorOf(
      {
        children: [aliased(p('A', 'a'), 'b'), retyped('b9')],
        records: rejectedRetype,
        roots: { b9: [p('B', 'b')] },
      },
      Cards
    );

    assert.deepEqual(childrenOf(editor), [p('A', 'b'), p('C', 'c')]);
  });
});

const UniqueIds = defineEditorSchema('schema:authored-shown-unique-ids', {
  elements: { paragraph: schema.element.textBlock() },
  id: 'authored-shown-unique-ids',
  properties: [
    schema.elementProperty('id', property.string({ generate: mint }), {
      copy: 'drop',
      role: 'metadata',
      target: target.group('element'),
      typeChange: 'preserve-if-allowed',
      unique: true,
    }),
  ],
  root: c.type('paragraph', { default: { type: 'paragraph' }, min: 1 }),
  unknown: 'reject',
  version: 1,
} as never);

type HistorySteps = Readonly<{ redo: () => void; undo: () => void }>;

const historyOf = (editor: TestEditor) =>
  (editor as unknown as { api: { history: HistorySteps } }).api.history;
const authoredIn = (tx: unknown) =>
  (
    tx as {
      authored: {
        decide: (decision: object) => void;
        propose: (input: object) => void;
      };
    }
  ).authored;
const textOf = (node: Node) => node.children?.[0]?.text;
const lineOf = (children: readonly Node[], text: string) =>
  children.find((node) => textOf(node) === text);
/** Decides `decision` in an update that history merges into its last step. */
const decideMerged = (editor: TestEditor, decision: Decision) => {
  const authored = editor as unknown as {
    read: { authored: { change: (id: string) => object | null } };
  };

  editor.update({ tags: ['history-merge'] }, (tx) =>
    authoredIn(tx).decide({
      action: decision.action,
      changes: decision.changes.flatMap(
        (id) => authored.read.authored.change(id) ?? []
      ),
    })
  );
};
/** Two peers on one room seeded from `value`; peer 0 keeps history. */
const historyRoom = (value: readonly Node[], plugin: unknown = Generated) => {
  const docs = [new Y.Doc(), new Y.Doc()] as const;
  const zero = peerOn(docs[0], plugin, value, [history()]);

  Y.applyUpdate(docs[1], Y.encodeStateAsUpdate(docs[0]));

  const peers = [zero, peerOn(docs[1], plugin)] as const;

  return {
    docs,
    peers,
    read: () => peers.map(childrenOf),
    send: (from: 0 | 1) => deliver(docs[from], docs[1 - from], peers[1 - from]),
  };
};
const WAITING = JSON.stringify({ alias: { id: 'b' }, stored: 'a' });
/** An original that stores `b` and its pending deletion, before a copy that shows `b`. */
const original = () => [
  whole(p('d', 'b'), 'delete', 'D'),
  shows(p('A', 'a'), 'M', 'b'),
];
/** A pending insertion before everything else that shows `b`. */
const pendingShower = () => shows(p('X', 'x'), 'X', 'b');
const formattedA = (): Node => ({
  ...p('A', 'a'),
  authored: [
    {
      at: 1,
      author: 'bob',
      before: 'c',
      change: 'F',
      id: 'f',
      key: 'id',
      kind: 'format',
      write: { kind: 'set', value: 'a' },
    },
    { kind: 'as', values: { id: 'b' } },
  ],
});

describe('history replaying a settled decision', () => {
  it('redoes a rejected id format to the value it restores after a skipped write puts a pending shower of the shown value before it', () => {
    const editor = editorOf([formattedA()], Generated, [history()]);

    authoredTestApi(editor).decide(reject('F'));

    const settled = childrenOf(editor);

    historyOf(editor).undo();
    editor.update({ tags: ['history-skip'] }, (tx) => {
      tx.nodes.insert(pendingShower() as never, { at: [0] });
    });

    const stored = editor.read.value();

    historyOf(editor).redo();

    const fresh = editorOf(stored, Generated);

    authoredTestApi(fresh).decide(reject('F'));

    assert.deepEqual(
      { redone: childrenOf(editor), settled },
      { redone: childrenOf(fresh), settled: [p('A', 'b')] }
    );
  });

  it('redoes a rejected unique id format to a fresh id when another element loaded with the id the rejection restores', () => {
    const editor = editorOf([formattedA(), p('C', 'c')], UniqueIds, [
      history(),
    ]);

    authoredTestApi(editor).decide(reject('F'));
    historyOf(editor).undo();
    editor.update({ tags: ['history-skip'] }, (tx) => {
      tx.nodes.insert(pendingShower() as never, { at: [0] });
    });

    const fresh = editorOf(editor.read.value(), UniqueIds);

    historyOf(editor).redo();
    authoredTestApi(fresh).decide(reject('F'));

    const minted = (nodes: readonly Node[]) =>
      nodes.map((node) =>
        /^g\d+$/.test(String(node.id)) ? { ...node, id: 'minted' } : node
      );

    assert.deepEqual(minted(childrenOf(editor)), minted(childrenOf(fresh)));
  });

  it('undoes a settled decision to the fresh id and its note, and redoes the decision’s bytes, with the original before the copy', () => {
    const editor = editorOf(original(), Generated, [history()]);
    const api = authoredTestApi(editor);

    api.decide(accept('M'));

    const waiting = childrenOf(editor);

    api.decide(accept('D'));

    const settled = childrenOf(editor);

    historyOf(editor).undo();

    const undone = childrenOf(editor);

    historyOf(editor).redo();

    assert.deepEqual(
      { redone: childrenOf(editor), settled, undone },
      { redone: [p('A', 'b')], settled: [p('A', 'b')], undone: waiting }
    );
  });

  it('keeps the group waiting through redo after a skipped write puts a pending shower before the copy, and accepting it stores what a fresh decision stores', () => {
    const editor = editorOf(original(), Generated, [history()]);
    const api = authoredTestApi(editor);

    api.decide(accept('M'));
    api.decide(accept('D'));
    historyOf(editor).undo();
    editor.update({ tags: ['history-skip'] }, (tx) => {
      tx.nodes.insert(pendingShower() as never, { at: [0] });
    });

    const stored = editor.read.value();

    historyOf(editor).redo();

    const redone = describeNode(lineOf(childrenOf(editor), 'A'));

    api.decide(accept('X'));

    const fresh = editorOf(stored, Generated);

    authoredTestApi(fresh).decide(accept('D'));
    authoredTestApi(fresh).decide(accept('X'));

    assert.deepEqual(
      { accepted: childrenOf(editor), redone },
      { accepted: childrenOf(fresh), redone: WAITING }
    );
  });

  it('keeps the group waiting through redo after a peer puts a pending shower before the copy, and accepting it stores what a fresh decision stores', () => {
    const room = historyRoom(original());
    const [zero, one] = room.peers;

    authoredTestApi(zero).decide(accept('M'));
    authoredTestApi(zero).decide(accept('D'));
    room.send(0);
    historyOf(zero).undo();
    room.send(0);
    one.update((tx) => {
      tx.nodes.insert(pendingShower() as never, { at: [0] });
    });
    room.send(1);

    const stored = zero.read.value();

    historyOf(zero).redo();
    room.send(0);

    const redone = room
      .read()
      .map((children) => describeNode(lineOf(children, 'A')));

    authoredTestApi(zero).decide(accept('X'));
    room.send(0);

    const fresh = editorOf(stored, Generated);

    authoredTestApi(fresh).decide(accept('D'));
    authoredTestApi(fresh).decide(accept('X'));

    assert.deepEqual(
      { accepted: room.read(), redone },
      {
        accepted: [childrenOf(fresh), childrenOf(fresh)],
        redone: [WAITING, WAITING],
      }
    );
  });

  it('gives a settled loser the value on redo once the winner is gone', () => {
    const editor = editorOf(
      [shows(p('W', 'w'), 'M', 'b'), shows(p('L', 'l'), 'N', 'b')],
      Generated,
      [history()]
    );
    const api = authoredTestApi(editor);

    api.decide(accept('M'));
    api.decide(accept('N'));

    const settled = childrenOf(editor);

    historyOf(editor).undo();
    editor.update({ tags: ['history-skip'] }, (tx) => {
      tx.nodes.remove({ at: [0] });
    });
    historyOf(editor).redo();

    assert.deepEqual(
      { redone: childrenOf(editor), settled },
      { redone: [p('L', 'b')], settled: [p('W', 'b'), p('L', 'l')] }
    );
  });

  it('gives a redone winner back its fresh id beside a peer’s holder that stores the shown value under a unique key', () => {
    const room = historyRoom(
      [shows(p('A', 'a'), 'M', 'b'), p('X', 'x')],
      UniqueIds
    );
    const [zero, one] = room.peers;

    authoredTestApi(zero).decide(accept('M'));
    room.send(0);
    historyOf(zero).undo();
    room.send(0);
    one.update((tx) => {
      tx.nodes.set({ id: 'b' } as never, { at: [1] });
    });
    room.send(1);
    historyOf(zero).redo();
    room.send(0);

    for (const children of room.read()) {
      assert.deepEqual(
        children,
        [p('A', 'a'), p('X', 'b')],
        JSON.stringify(room.read())
      );
    }
  });

  it('keeps an explicitly merged write that makes a shower and the decision that settles it in two undo steps, so a peer’s pending shower keeps the group waiting through both redos', () => {
    const room = historyRoom([whole(p('d', 'b'), 'delete', 'D')]);
    const [zero, one] = room.peers;

    zero.update((tx) => {
      tx.nodes.insert(shows(p('A', 'a'), 'M', 'b') as never, { at: [1] });
    });
    decideMerged(zero, {
      action: 'accept',
      changes: ['D', 'M'],
    });

    const settled = childrenOf(zero);

    room.send(0);
    historyOf(zero).undo();
    historyOf(zero).undo();
    room.send(0);
    one.update((tx) => {
      tx.nodes.insert(pendingShower() as never, { at: [0] });
    });
    room.send(1);
    historyOf(zero).redo();
    historyOf(zero).redo();
    room.send(0);

    assert.deepEqual(
      {
        redone: room
          .read()
          .map((children) => describeNode(lineOf(children, 'A'))),
        settled,
      },
      { redone: [WAITING, WAITING], settled: [p('A', 'b')] }
    );
  });

  it('keeps an id edit merged after a settlement through undo and redo', () => {
    const editor = editorOf([shows(p('A', 'a'), 'M', 'b')], Generated, [
      history(),
    ]);

    authoredTestApi(editor).decide(accept('M'));
    editor.update({ tags: ['history-merge'] }, (tx) => {
      tx.nodes.set({ id: 'c' } as never, { at: [0] });
    });
    historyOf(editor).undo();
    historyOf(editor).redo();

    assert.deepEqual(childrenOf(editor), [p('A', 'c')]);
  });
});

type Tx = Parameters<Parameters<TestEditor['update']>[1]>[0];
type Write = (tx: Tx, editor: TestEditor) => void;

const canonical = (value: unknown) => {
  const order = new Map<string, string>();
  const read = (item: unknown): unknown => {
    if (typeof item === 'string' && mintedIds.has(item)) {
      if (!order.has(item)) order.set(item, `minted ${order.size + 1}`);

      return order.get(item);
    }
    if (Array.isArray(item)) return item.map(read);
    if (item === null || typeof item !== 'object') return item;

    return Object.fromEntries(
      Object.keys(item)
        .sort()
        .map((key) => [key, read((item as Record<string, unknown>)[key])])
    );
  };

  return read(value);
};
const storedIds = (nodes: readonly Node[]): unknown[] =>
  nodes.flatMap((node) =>
    node.children ? [node.id, ...storedIds(node.children)] : []
  );
const assertDistinct = (nodes: readonly Node[]) => {
  const ids = storedIds(nodes);

  assert.equal(new Set(ids).size, ids.length, JSON.stringify(ids));
};
const storesAs = (actual: readonly Node[], expected: readonly Node[]) => {
  assertDistinct(actual);
  assertDistinct(expected);
  assert.deepEqual(
    canonical(actual),
    canonical(expected),
    JSON.stringify({ actual, expected })
  );
};
const updateWith = (
  editor: TestEditor,
  writes: readonly Write[],
  tags: readonly string[] = []
) => {
  editor.update({ tags: [...tags] as never }, (tx) => {
    for (const write of writes) write(tx, editor);
  });
};
const skip = (editor: TestEditor, ...writes: Write[]) =>
  updateWith(editor, writes, ['history-skip']);
const inserting =
  (node: Node, at: number): Write =>
  (tx) => {
    tx.nodes.insert(structuredClone(node), { at: [at] });
  };
const removing =
  (at: number): Write =>
  (tx) => {
    tx.nodes.remove({ at: [at] });
  };
const writing =
  (values: Record<string, string>, at: number): Write =>
  (tx) => {
    tx.nodes.set(values, { at: [at] });
  };
const acceptingD: Write = (tx, editor) => {
  const read = editor as unknown as {
    read: { authored: { change: (id: string) => object | null } };
  };

  authoredIn(tx).decide({
    action: 'accept',
    changes: [read.read.authored.change('D')],
  });
};
const addingShower = inserting(pendingShower(), 0);
type Step = (editor: TestEditor) => void;
const decides =
  (decision: Decision): Step =>
  (editor) => {
    authoredTestApi(editor).decide(decision);
  };
const updates =
  (...writes: Write[]): Step =>
  (editor) =>
    updateWith(editor, writes);
const withoutHistory = (value: unknown, plugin: unknown, ...steps: Step[]) => {
  const editor = editorOf(value, plugin);

  for (const step of steps) step(editor);

  return editor;
};
const hasRedo = (editor: TestEditor) =>
  (
    editor as unknown as { read: { history: { hasRedo: () => boolean } } }
  ).read.history.hasRedo();
const undoSteps = (editor: TestEditor) =>
  (
    editor as unknown as {
      read: {
        history: () => {
          undos: ReadonlyArray<{ unsettle?: DocumentChange }>;
        };
      };
    }
  ).read.history().undos;
const formatted = (
  node: Node,
  before: string,
  shown?: string,
  change = 'F'
): Node => ({
  ...node,
  authored: [
    {
      at: 1,
      author: 'bob',
      before,
      change,
      id: `f-${String(node.id)}`,
      key: 'id',
      kind: 'format',
      write: { kind: 'set', value: node.id as string },
    },
    ...(shown ? [{ kind: 'as', values: { id: shown } }] : []),
  ],
});
const otherTaker = () => [
  formatted(p('E', 'b'), 'a', undefined, 'F2'),
  aliased(p('A', 'a'), 'b'),
];
const freedByWrite = () => [
  whole(p('n', 'b'), 'insert', 'N'),
  aliased(p('A', 'a'), 'b'),
];
const settledOriginal = () => {
  const editor = editorOf(original(), Generated, [history()]);

  authoredTestApi(editor).decide(accept('M'));
  authoredTestApi(editor).decide(accept('D'));

  return editor;
};
const saved = (editor: TestEditor) =>
  JSON.parse(JSON.stringify(History.toJSON(editor))) as {
    redos: Array<Record<string, unknown>>;
    undos: Array<Record<string, unknown>>;
    version: number;
  };
const restoring = (editor: TestEditor, json: unknown) => {
  const decoded = History.fromJSON(editor, json);

  editor.update((tx) =>
    (
      tx as unknown as { history: { restore: (value: unknown) => void } }
    ).history.restore(decoded)
  );
};

const itWithFixedIds = (name: string, test: () => void) => {
  it(name, () => {
    fixedIds = true;
    test();
  });
};

describe('the settlement a commit keeps for history', () => {
  itWithFixedIds(
    'keeps none on an undo step whose commit types, decides what settles nothing or only renames a repeated unique id',
    () => {
      const editor = editorOf(
        [
          pendingShower(),
          shows(p('A', 'a'), 'M', 'b'),
          whole(p('u', 'p-u'), 'insert', 'U'),
          p('C', 'c'),
        ],
        UniqueIds,
        [history()]
      );

      editor.update((tx) => {
        tx.text.insert('t', { at: { offset: 0, path: [3, 0] } });
      });
      authoredTestApi(editor).decide(accept('U'));
      editor.update((tx) => {
        tx.nodes.set({ id: 'p-u' } as never, { at: [3] });
      });

      assert.deepEqual(
        {
          renamed: mintedIds.has(String(lineOf(childrenOf(editor), 'tC')?.id)),
          unsettles: undoSteps(editor).map((step) => step.unsettle ?? null),
        },
        { renamed: true, unsettles: [null, null, null] }
      );
    }
  );

  itWithFixedIds(
    'keeps on a settling decision’s undo step the change that takes back each settled id and gives back its shown member',
    () => {
      const editor = editorOf([shows(p('A', 'a'), 'M', 'b')], Generated, [
        history(),
      ]);

      authoredTestApi(editor).decide(accept('M'));

      const unsettle = getDefined(undoSteps(editor).at(-1)?.unsettle);

      assert.deepEqual(
        {
          settled: childrenOf(editor),
          unsettled: unsettle.apply(editor.read.value() as never).children,
        },
        { settled: [p('A', 'b')], unsettled: [aliased(p('A', 'a'), 'b')] }
      );
    }
  );

  itWithFixedIds(
    'keeps the rename of a repeated unique id out of the take-back of an update that renames and settles',
    () => {
      const editor = editorOf([...original(), p('C', 'c')], UniqueIds, [
        history(),
      ]);

      authoredTestApi(editor).decide(accept('M'));

      const before = made;

      updateWith(editor, [writing({ id: 'c' }, 1), acceptingD]);

      const renamed = new Set(
        Array.from({ length: made - before }, (_, at) => `g${before + at + 1}`)
      );
      const takenBack = getDefined(undoSteps(editor).at(-1)?.unsettle).apply(
        editor.read.value() as never
      ).children as Node[];
      const [shower] = takenBack;

      assert.deepEqual(
        {
          renamed: renamed.has(String(shower?.id)),
          shown: shownOf(shower),
          stored: childrenOf(editor),
        },
        {
          renamed: true,
          shown: { id: 'b' },
          stored: [p('A', 'b'), p('C', 'c')],
        }
      );
    }
  );

  itWithFixedIds(
    'keeps none and reports a lifecycle error when a settle stage writes text',
    () => {
      const errors: unknown[] = [];
      const Texting = definePlugin('settle-writes-text', {
        contributions: [
          documentAdmissionPoint.of({
            commit: () => null,
            load: () => null,
            settle: (value, _schema, commit) => {
              const [first] = value.children as unknown as Node[];

              if (!commit || textOf(first) !== 'go') return null;

              return DocumentChange.between(value, {
                ...value,
                children: [{ ...first, children: [{ text: 'gone' }] }],
              } as never);
            },
          }),
        ],
      });
      const editor = createEditor<EditorValue, readonly unknown[]>({
        initialValue: { children: [p('g')] } as never,
        lifecycleErrorSink: (error: unknown) => errors.push(error),
        plugins: [Generated, Texting, history()],
      } as never);

      editor.update((tx) => {
        tx.text.insert('o', { at: { offset: 1, path: [0, 0] } });
      });

      assert.deepEqual(
        {
          errors: errors.length,
          stored: childrenOf(editor),
          unsettle: undoSteps(editor).at(-1)?.unsettle ?? null,
        },
        { errors: 1, stored: [p('gone', 'p-g')], unsettle: null }
      );
    }
  );
});

describe('history redoing a settled commit without its settlement', () => {
  for (const [name, value, plugin, decision] of [
    [
      'a rejected format whose restored value equals the shown value',
      [formatted(p('A', 'a'), 'b', 'b')],
      Generated,
      reject('F'),
    ],
    [
      'a rejection that restores, on another element, the value a taker stored before',
      otherTaker(),
      UniqueIds,
      reject('F2'),
    ],
    [
      'one change whose formats restore the shown value and the taker’s value',
      [formatted(p('A', 'a'), 'b', 'b'), formatted(p('C', 'c'), 'a')],
      UniqueIds,
      reject('F'),
    ],
    [
      'an accepted format whose commit settled the key',
      [formatted(p('A', 'a'), 'c', 'b')],
      Generated,
      accept('F'),
    ],
    [
      'an accepted format whose restored value equals the shown value',
      [formatted(p('A', 'a'), 'b', 'b')],
      Generated,
      accept('F'),
    ],
  ] as const) {
    itWithFixedIds(
      `stores what the same edits store with no history when it redoes ${name} after a skipped pending shower`,
      () => {
        const editor = editorOf(value, plugin, [history()]);

        authoredTestApi(editor).decide(decision);
        historyOf(editor).undo();
        skip(editor, addingShower);
        historyOf(editor).redo();

        storesAs(
          childrenOf(editor),
          childrenOf(
            withoutHistory(
              value,
              plugin,
              updates(addingShower),
              decides(decision)
            )
          )
        );
      }
    );
  }

  itWithFixedIds(
    'stores what the same rejection stores with no history when it redoes, with nothing between, a rejection that renamed another element',
    () => {
      const editor = editorOf(otherTaker(), UniqueIds, [history()]);

      authoredTestApi(editor).decide(reject('F2'));
      historyOf(editor).undo();
      historyOf(editor).redo();

      storesAs(
        childrenOf(editor),
        childrenOf(
          withoutHistory(otherTaker(), UniqueIds, decides(reject('F2')))
        )
      );
    }
  );

  for (const id of ['b', 'c']) {
    itWithFixedIds(
      `keeps ${id} written directly under the shown b when it redoes an update that writes it onto a shower and frees b, after a skipped pending shower`,
      () => {
        const editor = editorOf(original(), Generated, [history()]);

        authoredTestApi(editor).decide(accept('M'));
        updateWith(editor, [writing({ id }, 1), acceptingD]);
        historyOf(editor).undo();
        skip(editor, addingShower);
        historyOf(editor).redo();

        const reference = withoutHistory(
          original(),
          Generated,
          decides(accept('M')),
          updates(addingShower),
          updates(writing({ id }, 2), acceptingD)
        );

        storesAs(childrenOf(editor), childrenOf(reference));
        assert.deepEqual(
          lineOf(childrenOf(editor), 'A'),
          aliased(p('A', id), 'b')
        );
      }
    );
  }

  itWithFixedIds(
    'redoes an undo that the uniqueness repair renamed to what the same edits store with no history',
    () => {
      const editor = editorOf([formattedA()], UniqueIds, [history()]);

      authoredTestApi(editor).decide(reject('F'));
      skip(editor, inserting(p('C', 'a'), 1));
      historyOf(editor).undo();

      const undone = lineOf(childrenOf(editor), 'A');

      skip(editor, addingShower);
      historyOf(editor).redo();

      assert.ok(mintedIds.has(String(undone?.id)), JSON.stringify(undone));
      storesAs(
        childrenOf(editor),
        childrenOf(
          withoutHistory(
            [formattedA()],
            UniqueIds,
            updates(addingShower),
            decides(reject('F')),
            updates(inserting(p('C', 'a'), 2))
          )
        )
      );
    }
  );

  itWithFixedIds(
    'redoes an undo moved past a skipped pending shower to what deciding again on the undone document stores',
    () => {
      const editor = editorOf([formattedA()], Generated, [history()]);

      authoredTestApi(editor).decide(reject('F'));
      skip(editor, addingShower);
      historyOf(editor).undo();

      const undone = editor.read.value();

      historyOf(editor).redo();

      storesAs(
        childrenOf(editor),
        childrenOf(withoutHistory(undone, Generated, decides(reject('F'))))
      );
      assert.deepEqual(
        lineOf(childrenOf(editor), 'A'),
        aliased(p('A', 'c'), 'b')
      );
    }
  );

  itWithFixedIds(
    'stores what the same edits store with no history after an undo and redo, then an undo, a skipped pending shower and a redo',
    () => {
      const editor = editorOf([formattedA()], Generated, [history()]);

      authoredTestApi(editor).decide(reject('F'));
      historyOf(editor).undo();
      historyOf(editor).redo();
      historyOf(editor).undo();
      skip(editor, addingShower);
      historyOf(editor).redo();

      storesAs(
        childrenOf(editor),
        childrenOf(
          withoutHistory(
            [formattedA()],
            Generated,
            updates(addingShower),
            decides(reject('F'))
          )
        )
      );
    }
  );

  itWithFixedIds(
    'stores what the same edits store with no history after a redo that waits on a skipped pending shower, an undo, the shower removed outside history and a redo',
    () => {
      const editor = editorOf([formattedA()], Generated, [history()]);

      authoredTestApi(editor).decide(reject('F'));
      historyOf(editor).undo();
      skip(editor, addingShower);
      historyOf(editor).redo();

      const waited = describeNode(lineOf(childrenOf(editor), 'A'));

      historyOf(editor).undo();
      skip(editor, removing(0));
      historyOf(editor).redo();

      assert.equal(waited, JSON.stringify({ alias: { id: 'b' }, stored: 'c' }));
      storesAs(
        childrenOf(editor),
        childrenOf(
          withoutHistory(
            [formattedA()],
            Generated,
            updates(addingShower),
            updates(removing(0)),
            decides(reject('F'))
          )
        )
      );
    }
  );

  for (const [name, settled, decision] of [
    [
      'a rejected format',
      () => {
        const editor = editorOf([formattedA()], Generated, [history()]);

        authoredTestApi(editor).decide(reject('F'));

        return editor;
      },
      reject('F'),
    ],
    ['an accepted deletion', settledOriginal, accept('D')],
  ] as const) {
    itWithFixedIds(
      `stores what deciding ${name} again on the undone document stores when its undo writes over a skipped write of the settled id`,
      () => {
        const editor = settled();

        skip(editor, writing({ id: 'z' }, 0));
        historyOf(editor).undo();

        const undone = editor.read.value();

        historyOf(editor).redo();

        storesAs(
          childrenOf(editor),
          childrenOf(withoutHistory(undone, Generated, decides(decision)))
        );
        assert.equal(lineOf(childrenOf(editor), 'A')?.id, 'b');
      }
    );
  }

  it('undoes and redoes a settling commit that retypes an element whose tags are a set under its old type and a string under its new one', () => {
    const value = [
      { ...p('B', 'bb'), tags: ['x'], type: 's' },
      whole(p('d', 'b'), 'delete', 'D'),
      aliased(p('A', 'a'), 'b'),
    ];
    const editor = editorOf(value, SetOrString, [history()]);

    updateWith(editor, [
      writing({ type: 't' }, 0),
      writing({ tags: 'y' }, 0),
      acceptingD,
    ]);

    const settled = childrenOf(editor);

    historyOf(editor).undo();

    const undone = childrenOf(editor);

    historyOf(editor).redo();

    assert.deepEqual(
      { redone: childrenOf(editor), settled, undone },
      {
        redone: [{ ...p('B', 'bb'), tags: 'y', type: 't' }, p('A', 'b')],
        settled: [{ ...p('B', 'bb'), tags: 'y', type: 't' }, p('A', 'b')],
        undone: value,
      }
    );
  });

  const asSet = { ...p('B', 'bb'), tags: ['x'] };
  const asString = { ...p('B', 'bb'), tags: 'y' };
  const tagging =
    (at: number[]): Write =>
    (tx) => {
      tx.nodes.set({ tags: 'y' }, { at });
    };

  for (const [name, value, writes, expected] of [
    [
      'retypes its parent',
      [el('s', 'S', asSet)],
      [writing({ type: 't' }, 0), tagging([0, 0])],
      () => [el('t', 'S', asString)],
    ],
    [
      'merges its parent into one',
      [el('t', 'T', p('C', 'cc')), el('s', 'S', asSet)],
      [
        (tx) => {
          tx.nodes.merge({ at: [1] });
        },
        tagging([0, 1]),
      ],
      () => [el('t', 'T', p('C', 'cc'), asString)],
    ],
    [
      'splits its parent and retypes the half it lands in',
      [el('s', 'S', p('C', 'cc'), asSet)],
      [
        (tx) => {
          tx.nodes.split({ at: [0, 1] });
        },
        writing({ type: 't' }, 1),
        tagging([1, 0]),
      ],
      (settled: readonly Node[]) => [
        el('s', 'S', p('C', 'cc')),
        el('t', String(settled[1]?.id), asString),
      ],
    ],
  ] as const) {
    it(`undoes and redoes a settling commit that ${name} under which the tags of an element are a string, where they were a set`, () => {
      const start = [
        ...value,
        whole(p('d', 'b'), 'delete', 'D'),
        aliased(p('A', 'a'), 'b'),
      ];
      const editor = editorOf(start, SetOrStringUnder, [history()]);

      updateWith(editor, [acceptingD, ...writes]);

      const settled = childrenOf(editor);

      historyOf(editor).undo();

      const undone = childrenOf(editor);

      historyOf(editor).redo();

      assert.deepEqual(
        { redone: childrenOf(editor), settled, undone },
        {
          redone: settled,
          settled: [...expected(settled), p('A', 'b')],
          undone: start,
        }
      );
    });
  }

  it('undoes and redoes a commit that creates a card body and settles a shower inside it', () => {
    const editor = editorOf(
      [whole(p('d', 'b'), 'delete', 'D'), p('Z', 'z')],
      Cards,
      [history()]
    );

    updateWith(editor, [
      (tx) => {
        creatingBody(tx);
        tx.nodes.insert(card('b9'), { at: [2] });
      },
      acceptingD,
    ]);

    const settled = storedOf(editor);

    historyOf(editor).undo();

    const undone = storedOf(editor);

    historyOf(editor).redo();

    assert.deepEqual(
      { redone: storedOf(editor), settled, undone },
      {
        redone: settled,
        settled: {
          children: [p('Z', 'z'), card('b9')],
          roots: { b9: [p('B', 'b')] },
        },
        undone: {
          children: [whole(p('d', 'b'), 'delete', 'D'), p('Z', 'z')],
          roots: {},
        },
      }
    );
  });

  itWithFixedIds(
    'redoes a rejection over a skipped write of the shower’s own id to what the same edits store with no history',
    () => {
      const editor = editorOf([formattedA()], Generated, [history()]);

      authoredTestApi(editor).decide(reject('F'));
      historyOf(editor).undo();
      skip(editor, writing({ id: 'z' }, 0));
      historyOf(editor).redo();

      storesAs(
        childrenOf(editor),
        childrenOf(
          withoutHistory(
            [formattedA()],
            Generated,
            updates(writing({ id: 'z' }, 0)),
            decides(reject('F'))
          )
        )
      );
    }
  );

  itWithFixedIds(
    'keeps a peer’s write of the settled id under the shown value when the step sat on the undo stack and a pending shower arrives after the undo',
    () => {
      const editor = settledOriginal();

      skip(editor, writing({ id: 'z' }, 0));
      historyOf(editor).undo();
      skip(editor, addingShower);
      historyOf(editor).redo();

      const reference = withoutHistory(
        original(),
        Generated,
        decides(accept('M')),
        updates(addingShower),
        decides(accept('D')),
        updates(writing({ id: 'z' }, 1))
      );

      storesAs(childrenOf(editor), childrenOf(reference));
      assert.deepEqual(
        lineOf(childrenOf(editor), 'A'),
        aliased(p('A', 'z'), 'b')
      );
    }
  );

  itWithFixedIds(
    'keeps a skipped write of the shower’s own id beside a pending shower while the step sits on the redo stack',
    () => {
      const editor = settledOriginal();

      historyOf(editor).undo();
      skip(editor, writing({ id: 'z' }, 1), addingShower);
      historyOf(editor).redo();

      const reference = withoutHistory(
        original(),
        Generated,
        decides(accept('M')),
        updates(writing({ id: 'z' }, 1), addingShower),
        decides(accept('D'))
      );

      storesAs(childrenOf(editor), childrenOf(reference));
      assert.deepEqual(
        lineOf(childrenOf(editor), 'A'),
        aliased(p('A', 'z'), 'b')
      );
    }
  );

  for (const stack of ['undo', 'redo'] as const) {
    itWithFixedIds(
      `keeps a format a peer suggests on the shower while the step sits on the ${stack} stack`,
      () => {
        lifted = true;

        const suggesting: Write = (tx) => {
          authoredIn(tx).propose({ changeId: 'bob:uid' });
          tx.nodes.set(
            { uid: 'q' },
            {
              at: [stack === 'undo' ? 0 : 1],
            }
          );
        };
        const value = original().map((node) => ({
          ...node,
          uid: `u-${textOf(node)}`,
        }));
        const editor = editorOf(value, TwoKeys, [history()]);

        authoredTestApi(editor).decide(accept('M'));
        authoredTestApi(editor).decide(accept('D'));
        if (stack === 'undo') skip(editor, suggesting);
        historyOf(editor).undo();
        if (stack === 'redo') skip(editor, suggesting);
        skip(editor, addingShower);
        historyOf(editor).redo();

        const reference =
          stack === 'undo'
            ? withoutHistory(
                value,
                TwoKeys,
                decides(accept('M')),
                updates(addingShower),
                decides(accept('D')),
                updates((tx) => {
                  authoredIn(tx).propose({ changeId: 'bob:uid' });
                  tx.nodes.set({ uid: 'q' }, { at: [1] });
                })
              )
            : withoutHistory(
                value,
                TwoKeys,
                decides(accept('M')),
                updates(suggesting),
                updates(addingShower),
                decides(accept('D'))
              );

        storesAs(childrenOf(editor), childrenOf(reference));
      }
    );
  }

  itWithFixedIds(
    'redoes an Editing write of a shower’s stored id that settles it to what the same write stores with no history after a skipped pending shower',
    () => {
      const value = [
        aliased(p('A', 'a'), 'b'),
        whole(p('d', 'a'), 'delete', 'D'),
      ];
      const editor = editorOf(value, Generated, [history()]);

      updateWith(editor, [writing({ id: 'c' }, 0)]);
      historyOf(editor).undo();
      skip(editor, addingShower);
      historyOf(editor).redo();

      storesAs(
        childrenOf(editor),
        childrenOf(
          withoutHistory(
            value,
            Generated,
            updates(addingShower),
            updates(writing({ id: 'c' }, 1))
          )
        )
      );
    }
  );

  itWithFixedIds(
    'has nothing to redo once a skipped edit removes what an Editing write that settled wrote, and keeps the shower showing its value',
    () => {
      const editor = editorOf(freedByWrite(), Generated, [history()]);

      updateWith(editor, [writing({ id: 'q' }, 0)]);
      historyOf(editor).undo();
      skip(editor, removing(0), addingShower);

      const redoes = hasRedo(editor);

      historyOf(editor).redo();

      assert.equal(redoes, false);
      storesAs(
        childrenOf(editor),
        childrenOf(
          withoutHistory(
            freedByWrite(),
            Generated,
            updates(removing(0), addingShower)
          )
        )
      );
      assert.deepEqual(
        lineOf(childrenOf(editor), 'A'),
        aliased(p('A', 'a'), 'b')
      );
    }
  );

  itWithFixedIds(
    'has nothing to redo once a skipped edit removes the shower an Editing removal took away, and keeps the skipped write of the id',
    () => {
      const value = [pendingShower(), aliased(p('A', 'a'), 'b')];
      const editor = editorOf(value, Generated, [history()]);
      const other = shows(p('Y', 'y'), 'Y', 'b');

      updateWith(editor, [removing(0)]);
      historyOf(editor).undo();
      skip(editor, removing(0), inserting(other, 0), writing({ id: 'z' }, 1));

      const redoes = hasRedo(editor);

      historyOf(editor).redo();

      assert.equal(redoes, false);
      storesAs(childrenOf(editor), [other, aliased(p('A', 'z'), 'b')]);
    }
  );

  itWithFixedIds(
    'leaves nothing to redo when the undo of an Editing write that settled meets a skipped edit that removed what it wrote',
    () => {
      const editor = editorOf(freedByWrite(), Generated, [history()]);

      updateWith(editor, [writing({ id: 'q' }, 0)]);
      skip(editor, removing(0), addingShower);
      historyOf(editor).undo();

      assert.deepEqual(
        { redoes: hasRedo(editor), shower: lineOf(childrenOf(editor), 'A') },
        { redoes: false, shower: aliased(p('A', 'a'), 'b') }
      );
      assertDistinct(childrenOf(editor));
    }
  );

  itWithFixedIds(
    'redoes a settling write the uniqueness repair renamed to the id the original commit minted, once a skipped edit removed the collision after the undo',
    () => {
      const value = [...original(), p('C', 'c')];
      const editor = editorOf(value, UniqueIds, [history()]);

      authoredTestApi(editor).decide(accept('M'));

      const before = made;

      updateWith(editor, [writing({ id: 'c' }, 1), acceptingD]);

      const during = Array.from(
        { length: made - before },
        (_, at) => `g${before + at + 1}`
      );

      historyOf(editor).undo();
      skip(editor, removing(2), addingShower);
      historyOf(editor).redo();

      const redone = lineOf(childrenOf(editor), 'A');

      assert.ok(
        during.includes(String(redone?.id)),
        JSON.stringify({ during, redone })
      );
      storesAs(
        childrenOf(editor),
        childrenOf(
          withoutHistory(
            value,
            UniqueIds,
            decides(accept('M')),
            updates(removing(2), addingShower),
            updates(writing({ id: String(redone?.id) }, 2), acceptingD)
          )
        )
      );
    }
  );

  const insertingY = inserting(shows(p('Y', 'y'), 'Y', 'b'), 2);
  const beforeY = () => [pendingShower(), shows(p('A', 'a'), 'M', 'b')];

  for (const [name, plugin] of [
    ['generated', Generated],
    ['unique', UniqueIds],
  ] as const) {
    for (const decision of [accept('Y'), reject('Y')]) {
      itWithFixedIds(
        `redoes an insertion whose undo settles to what the same edits store with no history, then ${decision.action}s it the same, under ${name} ids`,
        () => {
          const editor = editorOf(beforeY(), plugin, [history()]);

          authoredTestApi(editor).decide(accept('M'));
          updateWith(editor, [insertingY]);
          skip(editor, removing(0));
          historyOf(editor).undo();

          const undone = describeNode(lineOf(childrenOf(editor), 'A'));

          historyOf(editor).redo();

          const reference = withoutHistory(
            beforeY(),
            plugin,
            decides(accept('M')),
            updates(insertingY),
            updates(removing(0))
          );
          const redone = childrenOf(editor);

          storesAs(redone, childrenOf(reference));
          authoredTestApi(editor).decide(decision);
          authoredTestApi(reference).decide(decision);
          storesAs(childrenOf(editor), childrenOf(reference));
          assert.equal(undone, JSON.stringify({ alias: null, stored: 'b' }));
        }
      );

      itWithFixedIds(
        `redoes an insertion whose undo settles and an older step beneath it to what the same edits store with no history, then ${decision.action}s it the same, under ${name} ids`,
        () => {
          const editor = editorOf(beforeY(), plugin, [history()]);

          authoredTestApi(editor).decide(accept('M'));
          updateWith(editor, [insertingY]);
          updateWith(editor, [inserting(p('Q', 'q'), 3)]);
          skip(editor, removing(0));
          historyOf(editor).undo();
          historyOf(editor).undo();
          historyOf(editor).redo();
          historyOf(editor).redo();

          const reference = withoutHistory(
            beforeY(),
            plugin,
            decides(accept('M')),
            updates(insertingY),
            updates(inserting(p('Q', 'q'), 3)),
            updates(removing(0))
          );

          storesAs(childrenOf(editor), childrenOf(reference));
          authoredTestApi(editor).decide(decision);
          authoredTestApi(reference).decide(decision);
          storesAs(childrenOf(editor), childrenOf(reference));
        }
      );

      itWithFixedIds(
        `redoes an insertion as recorded after a skipped edit lets another block store the id it shows, then ${decision.action}s it, under ${name} ids`,
        () => {
          const editor = editorOf(beforeY(), plugin, [history()]);

          authoredTestApi(editor).decide(accept('M'));
          updateWith(editor, [insertingY]);
          historyOf(editor).undo();
          skip(editor, removing(0));
          historyOf(editor).redo();

          const redone = childrenOf(editor);

          authoredTestApi(editor).decide(decision);

          storesAs(redone, [p('A', 'b'), shows(p('Y', 'y'), 'Y', 'b')]);
          storesAs(
            childrenOf(editor),
            decision.action === 'accept'
              ? [p('A', 'b'), p('Y', 'y')]
              : [p('A', 'b')]
          );
        }
      );
    }
  }

  itWithFixedIds(
    'keeps the id the undo’s settling freed with the block a skipped write gave it, and gives the redone block a fresh one',
    () => {
      const editor = editorOf([...beforeY(), p('Z', 'z')], UniqueIds, [
        history(),
      ]);

      authoredTestApi(editor).decide(accept('M'));
      updateWith(editor, [insertingY]);
      skip(editor, removing(0));
      historyOf(editor).undo();
      skip(editor, writing({ id: 'a' }, 1));

      const before = made;

      historyOf(editor).redo();

      const redone = childrenOf(editor);
      const shower = lineOf(redone, 'A');

      assert.ok(
        Number(String(shower?.id).slice(1)) > before,
        JSON.stringify({ before, redone })
      );
      storesAs(redone, [
        aliased(p('A', String(shower?.id)), 'b'),
        shows(p('Y', 'y'), 'Y', 'b'),
        p('Z', 'a'),
      ]);
    }
  );

  itWithFixedIds(
    'redoes an insertion whose undo settled, after a skipped import of a pending format that holds the restored id, to what the same edits store with no history',
    () => {
      const imported: Node = {
        ...p('Z', 'z'),
        authored: [
          {
            at: 1,
            author: 'bob',
            before: 'a',
            change: 'F',
            id: 'f-z',
            key: 'id',
            kind: 'format',
            write: { kind: 'set', value: 'z' },
          },
        ],
      };
      const editor = editorOf(beforeY(), UniqueIds, [history()]);

      authoredTestApi(editor).decide(accept('M'));
      updateWith(editor, [insertingY]);
      skip(editor, removing(0));
      historyOf(editor).undo();
      updateWith(
        editor,
        [inserting(imported, 0)],
        ['collaboration', 'history-skip']
      );
      historyOf(editor).redo();

      const reference = withoutHistory(
        beforeY(),
        UniqueIds,
        decides(accept('M'))
      );

      updateWith(reference, [inserting(imported, 0)], ['collaboration']);
      updateWith(reference, [inserting(shows(p('Y', 'y'), 'Y', 'b'), 3)]);
      updateWith(reference, [removing(1)]);

      storesAs(childrenOf(editor), childrenOf(reference));
      assert.equal(lineOf(childrenOf(editor), 'A')?.id, 'a');
    }
  );

  itWithFixedIds(
    'stores on both peers, in both Yjs documents and in a late joiner what the same edits store with no history, when it redoes after a peer adds a pending shower',
    () => {
      const room = historyRoom(otherTaker(), UniqueIds);
      const [zero, one] = room.peers;

      authoredTestApi(zero).decide(reject('F2'));
      room.send(0);
      historyOf(zero).undo();
      room.send(0);
      updateWith(one, [addingShower]);
      room.send(1);
      historyOf(zero).redo();
      room.send(0);

      const reference = childrenOf(
        withoutHistory(
          otherTaker(),
          UniqueIds,
          updates(addingShower),
          decides(reject('F2'))
        )
      );
      const stored = [
        ...room.read(),
        ...room.peers.map(
          (peer) =>
            readPliteValueFromYjs(
              getDefined(getActiveYjsController(peer)).debugRoot()
            ) as Node[]
        ),
        childrenOf(joining(room.docs[0], UniqueIds)),
      ];

      for (const children of stored) storesAs(children, reference);
      assert.deepEqual(stored.slice(1), [
        stored[0],
        stored[0],
        stored[0],
        stored[0],
      ]);

      const [first, ...rest] = [
        ...room.peers,
        ...room.docs.map((doc) => joining(doc, UniqueIds)),
      ].map((peer) => peer.read.value());

      assert.deepEqual(rest, [first, first, first]);
    }
  );
});

describe('saved history of a settled commit', () => {
  itWithFixedIds(
    'redoes a settling step saved after its undo like one never saved',
    () => {
      const editor = editorOf([formattedA()], Generated, [history()]);

      authoredTestApi(editor).decide(reject('F'));
      historyOf(editor).undo();

      const restored = editorOf(editor.read.value(), Generated, [history()]);

      restoring(restored, saved(editor));
      for (const each of [editor, restored]) {
        skip(each, addingShower);
        historyOf(each).redo();
      }

      storesAs(childrenOf(restored), childrenOf(editor));
      assert.deepEqual(
        canonical(restored.read.value()),
        canonical(editor.read.value())
      );
    }
  );

  itWithFixedIds(
    'redoes a settling step saved on the undo stack, restored, undone and given a skipped pending shower, to what the same edits store with no history',
    () => {
      const editor = editorOf([formattedA()], Generated, [history()]);

      authoredTestApi(editor).decide(reject('F'));

      const restored = editorOf(editor.read.value(), Generated, [history()]);

      restoring(restored, saved(editor));
      historyOf(restored).undo();
      skip(restored, addingShower);
      historyOf(restored).redo();

      storesAs(
        childrenOf(restored),
        childrenOf(
          withoutHistory(
            [formattedA()],
            Generated,
            updates(addingShower),
            decides(reject('F'))
          )
        )
      );
    }
  );

  itWithFixedIds(
    'decodes a version 4 history whose undo steps carry no take-back',
    () => {
      const editor = editorOf([formattedA()], Generated, [history()]);

      authoredTestApi(editor).decide(reject('F'));

      const json = saved(editor);
      const restored = editorOf(editor.read.value(), Generated, [history()]);

      restoring(restored, {
        ...json,
        undos: json.undos.map(({ unsettle: _unsettle, ...step }) => step),
      });
      historyOf(restored).undo();

      assert.deepEqual(
        {
          taken: 'unsettle' in getDefined(json.undos[0]),
          version: json.version,
        },
        { taken: true, version: 4 }
      );
      assert.deepEqual(childrenOf(restored), [formattedA()]);
    }
  );

  itWithFixedIds(
    'refuses a redo step that carries a take-back, an undo step whose take-back does not apply and one whose take-back writes text',
    () => {
      const editor = editorOf([formattedA()], Generated, [history()]);

      authoredTestApi(editor).decide(reject('F'));

      const json = saved(editor);
      const step = getDefined(json.undos[0]);
      const longer = editorOf(
        [shows(p('A', 'a'), 'M', 'b'), p('C', 'c')],
        Generated,
        [history()]
      );

      authoredTestApi(longer).decide(accept('M'));
      historyOf(editor).undo();

      const undone = saved(editor);
      const typing = editorOf([p('A', 'a')], Generated, [history()]);

      typing.update((tx) => {
        tx.text.insert('t', { at: { offset: 0, path: [0, 0] } });
      });

      const decoding = (input: unknown, value: unknown) => {
        try {
          History.fromJSON(editorOf(value, Generated, [history()]), input);

          return null;
        } catch (error) {
          return (error as Error).message;
        }
      };
      const refused = [
        {
          ...undone,
          redos: undone.redos.map((redo) => ({
            ...redo,
            unsettle: step.unsettle,
          })),
        },
        {
          ...json,
          undos: [
            { ...step, unsettle: getDefined(saved(longer).undos[0]).unsettle },
          ],
        },
        {
          ...json,
          undos: [
            {
              ...step,
              unsettle: getDefined(saved(typing).undos[0]).change,
            },
          ],
        },
      ].map((input, at) =>
        decoding(input, at === 0 ? [formattedA()] : [p('A', 'b')])
      );

      const [redo, misplaced, texting] = refused;

      assert.deepEqual(
        {
          kept: [
            decoding(json, [p('A', 'b')]),
            decoding(undone, [formattedA()]),
          ],
          misplaced,
          redo,
          texting,
        },
        {
          kept: [null, null],
          misplaced: 'Cannot apply change length 10 to document length 5.',
          redo: 'Invalid history batch JSON.',
          texting:
            'A history step can take back only element properties its settle stage wrote.',
        },
        JSON.stringify(refused)
      );
    }
  );
});

/**
 * A card's body is a root of its own that can hold another card, and a
 * portal's body is a root every portal naming it shares.
 */
const Nested = defineEditorSchema('schema:authored-shown-nested', {
  elements: {
    card: {
      content: c.text({ default: 'text', min: 1 }),
      contentRoots: {
        body: {
          content: c.types(['card', 'paragraph', 'portal'], {
            default: { type: 'paragraph' },
            min: 1,
          }),
          ownership: 'exclusive',
        },
      },
    },
    paragraph: schema.element.textBlock(),
    portal: {
      content: c.text({ default: 'text', min: 1 }),
      contentRoots: {
        body: {
          content: c.types(['card', 'paragraph', 'portal'], {
            default: { type: 'paragraph' },
            min: 1,
          }),
          ownership: 'shared',
        },
      },
    },
  },
  id: 'authored-shown-nested',
  properties: [paragraphId('id')],
  root: c.types(['card', 'paragraph', 'portal'], {
    default: { type: 'paragraph' },
    min: 1,
  }),
  unknown: 'reject',
  version: 1,
} as never);
const portal = (root: string): Node => ({
  childRoots: { body: root },
  children: [{ text: 'P' }],
  type: 'portal',
});
const storedOf = (editor: TestEditor) => ({
  children: childrenOf(editor),
  roots: structuredClone(editor.read.value().roots ?? {}) as Record<
    string,
    Node[]
  >,
});
/** One editor of `value` deciding each of `steps` in turn. */
const decided = (
  value: unknown,
  steps: ReadonlyArray<Decision | readonly Decision[]>,
  plugin: unknown
) => {
  const editor = editorOf(value, plugin);

  for (const step of steps) authoredTestApi(editor).decide(step);

  return storedOf(editor);
};
const both = (...changes: string[]): Decision => ({
  action: 'accept',
  changes,
});
/** A shower whose group's other holder sits in the body of a card whose deletion is pending. */
const carded = () => ({
  children: [shows(p('A', 'a'), 'M', 'b'), whole(card('b9'), 'delete', 'D')],
  roots: { b9: [p('B', 'b')] },
});
const WON = { children: [p('A', 'b')], roots: {} };

describe('a holder in a content root whose owner is pending', () => {
  it('gives a shower the value a card’s body stores once the card’s deletion is accepted, in either order, together, and on two racing peers and a peer that joins late', () => {
    const results = [
      decided(carded(), [accept('M'), accept('D')], Cards),
      decided(carded(), [accept('D'), accept('M')], Cards),
      decided(carded(), [both('M', 'D')], Cards),
      ...([0, 1] as const).flatMap((first) => {
        const room = concurrently(
          carded(),
          [accept('M'), accept('D')],
          first,
          Cards
        );

        return [...room.peers, joining(room.docs[0], Cards)].map(storedOf);
      }),
    ];

    for (const stored of results) {
      assert.deepEqual(stored, WON, JSON.stringify(results));
    }
  });

  // Suggesting is off under a generated key, so an Editing write puts the
  // pending deletion on the card, leaving the body's blocks as they were.
  it('keeps the group waiting when the card’s pending deletion arrives after a commit read the card’s body', () => {
    const editor = editorOf(
      {
        children: [shows(p('A', 'a'), 'M', 'b'), card('b9'), p('x', 'p-x')],
        roots: { b9: [p('B', 'b')] },
      },
      Cards
    );
    const api = authoredTestApi(editor);

    editor.update((tx) => {
      tx.text.insert('y', { at: { offset: 1, path: [2, 0] } });
    });
    editor.update((tx) => {
      tx.nodes.remove({ at: [1] });
      tx.nodes.insert(whole(card('b9'), 'delete', 'D') as never, { at: [1] });
    });
    api.decide(accept('M'));

    const waiting = childrenOf(editor)[0];

    api.decide(accept('D'));

    assert.deepEqual(
      { stored: storedOf(editor), waiting: describeNode(waiting) },
      {
        stored: { children: [p('A', 'b'), p('xy', 'p-x')], roots: {} },
        waiting: JSON.stringify({ alias: { id: 'b' }, stored: 'a' }),
      }
    );
  });

  it('settles when the commit that decides the card’s deletion also moves the card', () => {
    const value = {
      children: [
        shows(p('A', 'a'), 'M', 'b'),
        whole(p('x', 'p-x'), 'delete', 'X'),
        whole(card('b9'), 'delete', 'D'),
      ],
      roots: { b9: [p('B', 'b')] },
    };
    const keptCard = [reject('D'), accept('X')] as const;
    const results = [
      decided(value, [accept('M'), keptCard], Cards),
      decided(value, [reject('D'), accept('X'), accept('M')], Cards),
    ];

    for (const stored of results) {
      assert.deepEqual(
        stored,
        { children: [p('A', 'a'), card('b9')], roots: { b9: [p('B', 'b')] } },
        JSON.stringify(results)
      );
    }
  });

  it('judges a card nested in a card’s body by the outer card’s pending deletion', () => {
    const value = {
      children: [
        shows(p('A', 'a'), 'M', 'b'),
        whole(card('r1'), 'delete', 'D'),
      ],
      roots: { r1: [card('r2')], r2: [p('B', 'b')] },
    };
    const results = [
      decided(value, [accept('M'), accept('D')], Nested),
      decided(value, [accept('D'), accept('M')], Nested),
      decided(value, [both('M', 'D')], Nested),
    ];

    for (const stored of results) {
      assert.deepEqual(stored, WON, JSON.stringify(results));
    }
  });

  it('keeps a holder in a cycle of shared roots waiting while the portal that reaches the cycle is pending, and settles once it is decided', () => {
    const value = {
      children: [
        shows(p('A', 'a'), 'M', 'b'),
        whole(portal('r1'), 'delete', 'D'),
      ],
      roots: { r1: [portal('r2')], r2: [portal('r1'), p('B', 'b')] },
    };
    const waiting = decided(value, [accept('M')], Nested);
    const results = [
      decided(value, [accept('M'), accept('D')], Nested),
      decided(value, [accept('D'), accept('M')], Nested),
      decided(value, [both('M', 'D')], Nested),
    ];

    assert.equal(
      describeNode(waiting.children[0]),
      JSON.stringify({ alias: { id: 'b' }, stored: 'a' })
    );
    for (const stored of results) {
      assert.deepEqual(
        stored,
        { children: [p('A', 'a')], roots: value.roots },
        JSON.stringify(results)
      );
    }
  });

  it('settles a holder in a shared root another portal keeps once the pending portal’s deletion is accepted, as the first commit after a load and after an unrelated one', () => {
    const value = {
      children: [
        aliased(p('A', 'a'), 'b'),
        whole(portal('r'), 'delete', 'D'),
        portal('r'),
        p('x', 'p-x'),
      ],
      roots: { r: [p('B', 'b')] },
    };
    const typed = editorOf(value, Nested);

    typed.update((tx) => {
      tx.text.insert('y', { at: { offset: 1, path: [3, 0] } });
    });
    authoredTestApi(typed).decide(accept('D'));

    const settled = (line: string) => ({
      children: [p('A', 'a'), portal('r'), p(line, 'p-x')],
      roots: value.roots,
    });

    assert.deepEqual(
      { first: decided(value, [accept('D')], Nested), typed: storedOf(typed) },
      { first: settled('x'), typed: settled('xy') }
    );
  });

  it('gives a shower the value a shared root stores once two peers each accept the deletion of one of its portals and the merge orphans it', () => {
    const value = {
      children: [
        aliased(p('A', 'a'), 'b'),
        whole(portal('r'), 'delete', 'D1'),
        whole(portal('r'), 'delete', 'D2'),
      ],
      roots: { r: [p('B', 'b')] },
    };
    const room = concurrently(value, [accept('D1'), accept('D2')], 0, Nested);

    room.exchange();

    const stored = [...room.peers, joining(room.docs[0], Nested)].map(storedOf);

    assert.deepEqual(stored, [WON, WON, WON], JSON.stringify(stored));
  });
});

describe('a commit that changes one input of a waiting group', () => {
  it('settles a waiting shower whose sibling an Editing move put after it once its storer is kept', () => {
    const quote = (...children: Node[]): Node => ({
      children,
      id: 'q',
      type: 'quote',
    });
    const editor = editorOf(
      [
        quote(p('P', 'p'), aliased(p('A', 'a'), 'b')),
        whole(p('d', 'b'), 'delete', 'D'),
      ],
      Generated
    );

    editor.update((tx) => {
      tx.nodes.move({ at: [0, 0], to: [0, 1] });
    });
    authoredTestApi(editor).decide(reject('D'));

    assert.deepEqual(childrenOf(editor), [
      quote(p('A', 'a'), p('P', 'p')),
      p('d', 'b'),
    ]);
  });

  it('settles the group an Editing write of a shower’s stored id takes away from a pending storer of that id', () => {
    const editor = editorOf(
      [aliased(p('A', 'a'), 'b'), whole(p('d', 'a'), 'delete', 'D')],
      Generated
    );
    const loaded = describeNode(childrenOf(editor)[0]);

    editor.update((tx) => {
      tx.nodes.set({ id: 'c' } as never, { at: [0] });
    });

    assert.deepEqual(
      { loaded, written: childrenOf(editor)[0] },
      { loaded: WAITING, written: p('A', 'b') }
    );
  });

  it('settles the group whose pending storer a deleted root that no element owns kept', () => {
    const Open = defineEditorSchema('schema:authored-shown-open', {
      elements: {
        paragraph: schema.element.textBlock(),
      },
      id: 'authored-shown-open',
      properties: [
        schema.elementProperty('id', property.string({ generate: mint }), {
          copy: 'drop',
          role: 'metadata',
          target: target.group('element'),
          typeChange: 'preserve-if-allowed',
        }),
      ],
      root: c.types(['paragraph'], { default: { type: 'paragraph' }, min: 1 }),
      unknown: 'preserve',
      version: 1,
    } as never);
    const editor = editorOf(
      {
        children: [aliased(p('A', 'a'), 'b')],
        roots: { island: [whole(p('d', 'a'), 'delete', 'D')] },
      },
      Open
    );
    const loaded = describeNode(childrenOf(editor)[0]);

    editor.update((tx) => {
      tx.roots.delete('island');
    });

    assert.deepEqual(
      { loaded, deleted: storedOf(editor) },
      { deleted: { children: [p('A', 'b')], roots: {} }, loaded: WAITING }
    );
  });

  it('settles the group a spare record’s build alone frees', () => {
    const spare = {
      at: 1,
      author: 'D',
      change: 'D',
      node: p('', 'b'),
      root: 'main',
      slot: { min: 0 },
    };
    const editor = editorOf(
      {
        children: [
          aliased(p('A', 'a'), 'b'),
          whole(p('d', 'p-d'), 'delete', 'D'),
        ],
        records: { 'authored-reserves': { [reserveIdOf(spare)]: spare } },
      },
      Generated
    );
    const loaded = describeNode(childrenOf(editor)[0]);
    const built = { ...spare, built: true as const };

    editor.update((tx) => {
      tx.records.drop('authored-reserves', reserveIdOf(spare));
      tx.records.put('authored-reserves', reserveIdOf(built), built);
    });

    assert.deepEqual(
      { built: childrenOf(editor)[0], loaded },
      { built: p('A', 'b'), loaded: WAITING }
    );
  });

  it('settles the group a rejected tag frees once an Editing deletion removes the last of its incarnation’s inserted text', () => {
    const K = { at: 1, author: 'bob', change: 'K' };
    const editor = editorOf(
      {
        children: [
          aliased(p('A', 'a'), 'b'),
          {
            ...p('H', 'b'),
            authored: [
              {
                ...K,
                before: 'c',
                id: 'K-id',
                key: 'id',
                kind: 'format',
                write: { kind: 'set', value: 'b' },
              },
            ],
          },
          {
            ...p('x', 'p-x'),
            children: [
              { text: 'x' },
              { authored: [{ ...K, kind: 'insert' }], text: 'Y' },
            ],
          },
        ],
        records: reviewRecords({
          verdicts: [
            {
              decision: 'd:1',
              member: { at: 1, change: 'K' },
              verdict: 'reject',
            } as never,
          ],
        }),
      },
      Generated
    );
    const loaded = describeNode(childrenOf(editor)[0]);

    editor.update((tx) => {
      tx.text.delete({
        at: {
          anchor: { offset: 0, path: [2, 1] },
          focus: { offset: 1, path: [2, 1] },
        },
      });
    });

    assert.deepEqual(
      { deleted: childrenOf(editor), loaded },
      {
        deleted: [p('A', 'b'), p('H', 'c'), p('x', 'p-x')],
        loaded: WAITING,
      }
    );
  });
});

/**
 * A pending suggested move of a section of `lines` lines: the original's
 * deletion, then its copy, each element of which shows the id the original's
 * element stores.
 */
const movedSection = (lines: number): Node[] => {
  const section = el(
    'quote',
    's',
    ...Array.from({ length: lines }, (_, at) => p(`s${at}`))
  );
  const copy = (node: Node): Node =>
    node.text === undefined
      ? {
          ...node,
          authored: [
            mark('insert', 'V'),
            { kind: 'as', values: { id: node.id } },
          ],
          children: node.children?.map(copy),
          id: `m-${node.id}`,
        }
      : { ...node, authored: [mark('insert', 'V')] };

  return [whole(section, 'delete', 'V'), copy(section)];
};
/** A 50 line quote, a line, and a pending move of a 50 line section. */
const besideMove = () => [
  el('quote', 'q', ...Array.from({ length: 50 }, (_, at) => p(`q${at}`))),
  p('x', 'p-x'),
  ...movedSection(50),
];
const BESIDE = [1, 0];
const QUOTED = [0, 49, 0];
const leafAt = (editor: TestEditor, path: readonly number[]) => {
  let node = { children: childrenOf(editor) } as Node;

  for (const at of path) node = getDefined(node.children?.[at]);

  return node;
};
/**
 * The settle stage's reads while `run` commits, and whether `editor` then
 * holds `k` at `path`, as a suggestion or not.
 */
const readsOf = (
  editor: TestEditor,
  path: readonly number[],
  run: () => void
) => {
  const before = readCoreWork();

  run();

  const after = readCoreWork();
  const leaf = leafAt(editor, path);

  return {
    groups: after.valueGroupReads - before.valueGroupReads,
    roots: after.holderRootMoves - before.holderRootMoves,
    suggested: (leaf.authored ?? []).length > 0,
    typed: leaf.text?.includes('k') ?? false,
  };
};
/** Types `k` at the start of the text at `path`, in Suggesting when `proposes`. */
const typeAt = (
  editor: TestEditor,
  path: readonly number[],
  proposes = false
) =>
  editor.update((tx) => {
    const at = { offset: 0, path: [...path] };

    if (proposes) authoredIn(tx).propose({ changeId: 'zed:type' });
    tx.selection.set({ anchor: at, focus: at });
    tx.text.insert('k');
  });
const unguarded = (editor: TestEditor) => editor;
/**
 * The settle stage's reads for a keystroke beside a pending move and inside a
 * quote, typed in one editor and imported by another, in Suggesting when
 * `proposes`.
 */
const keystrokeReads = (proposes: boolean) =>
  [BESIDE, QUOTED].flatMap((path) => {
    const local = createEditor<EditorValue, readonly unknown[]>({
      initialValue: structuredClone(besideMove()) as never,
      plugins: [Generated, createAuthoredPlugin({ authorId: 'zed' })],
    });
    const docs = [new Y.Doc(), new Y.Doc()] as const;
    const zero = peerOn(docs[0], Generated, besideMove(), [], unguarded);

    Y.applyUpdate(docs[1], Y.encodeStateAsUpdate(docs[0]));

    const one = peerOn(docs[1], Generated, undefined, [], unguarded);

    typeAt(one, path, proposes);

    return [
      readsOf(local, path, () => typeAt(local, path, proposes)),
      readsOf(zero, path, () => deliver(docs[1], docs[0], zero)),
    ];
  });
const noReads = (suggested: boolean) =>
  new Array(4).fill({ groups: 0, roots: 0, suggested, typed: true });

describe('a keystroke beside groups that wait', () => {
  it('reads no holder index and no group typed in Editing beside a pending move of a 50 line section and inside a 50 line quote, locally and imported', () => {
    assert.deepEqual(keystrokeReads(false), noReads(false));
  });
});

describe('a keystroke in Suggesting beside groups that wait', () => {
  it('reads no holder index and no group beside a pending move of a 50 line section and inside a 50 line quote, locally and imported', () => {
    lifted = true;

    assert.deepEqual(keystrokeReads(true), noReads(true));
  });
});

const Tags = defineEditorSchema('schema:authored-shown-tags', {
  elements: { paragraph: schema.element.textBlock() },
  id: 'authored-shown-tags',
  properties: [paragraphId('tag')],
  root: c.type('paragraph', { default: { type: 'paragraph' }, min: 1 }),
  unknown: 'reject',
  version: 1,
} as never);
const tagged = (text: string, tag: string): Node => ({
  children: [{ text }],
  tag,
  type: 'paragraph',
});
const recordOf = (editor: TestEditor) =>
  getReviewLedger(getEditorRuntimeOwner(editor))?.shown.fingerprint(
    editor.read.value()
  );

describe('the record a commit settles shown values through', () => {
  it('differs from a fresh record once its index and the homes it reads go stale at the same ranks', () => {
    const editor = editorOf(
      [pendingShower(), aliased(p('A', 'a'), 'b')],
      Generated
    );
    const value = editor.read.value();
    const { state } = getDefined(getReviewLedger(getEditorRuntimeOwner(editor)))
      .shown as unknown as {
      state: {
        homes: Map<unknown, { block: unknown }>;
        positions: Map<string, DocumentIndex>;
        showerHomes: Map<unknown, { block: unknown }>;
      };
    };
    const kept = staleRecordOf(editor, value);
    const index = getDefined(state.positions.get('main'));
    const stale = valueRootIndex(
      {
        ...value,
        children: value.children.map((node) => ({
          ...node,
          id: `stale ${String((node as Node).id)}`,
        })),
      },
      'main'
    );
    const homes = [...state.homes.values(), ...state.showerHomes.values()];

    for (const home of homes) {
      for (let rank = 0; rank < index.size; rank += 1) {
        if (index.child(rank) === home.block) home.block = stale.child(rank);
      }
    }
    state.positions.set('main', stale);

    assert.deepEqual(
      {
        homes: homes.length > 0,
        kept,
        planted: staleRecordOf(editor, value) !== null,
      },
      { homes: true, kept: null, planted: true }
    );
  });

  it('stays as it was when a draft guard refuses the decision that settles, and the same decision then settles', () => {
    const editor = editorOf(
      [shows(p('A', 'a'), 'M', 'b'), whole(p('x', 'p-x'), 'insert', 'X')],
      Generated
    );

    authoredTestApi(editor).decide(accept('X'));

    const kept = { children: childrenOf(editor), record: recordOf(editor) };
    const refuse = registerEditorDraftGuard(editor, () => {
      throw new Error('refused');
    });

    assert.throws(() => authoredTestApi(editor).decide(accept('M')), /refused/);
    refuse();

    const refused = { children: childrenOf(editor), record: recordOf(editor) };

    authoredTestApi(editor).decide(accept('M'));

    assert.deepEqual(
      { decided: childrenOf(editor), refused },
      { decided: [p('A', 'b'), p('x', 'p-x')], refused: kept }
    );
  });

  it('settles a shower whose context a peer accepts through a verdict record alone', () => {
    const ctx = contextRecordOf(null, { at: 1, author: 'bob', change: 'B' });
    const editor = editorOf(
      {
        children: [
          {
            ...p('A', 'a'),
            authored: [
              { ctx: ctx.ctx, kind: 'in' },
              { kind: 'as', values: { id: 'b' } },
            ],
          },
          p('x', 'p-x'),
        ],
        records: reviewRecords({ contexts: [ctx] }),
      },
      Generated
    );
    const loaded = describeNode(childrenOf(editor)[0]);
    const verdicts = reviewRecords({
      verdicts: [
        { decision: 'd:B', member: { at: 1, change: 'B' }, verdict: 'accept' },
      ],
    })['authored-verdicts'];

    editor.update({ tags: ['collaboration'] }, (tx) => {
      for (const [id, record] of Object.entries(verdicts ?? {})) {
        tx.records.put('authored-verdicts', id, record);
      }
    });

    assert.deepEqual(
      { imported: childrenOf(editor), loaded },
      {
        imported: [p('A', 'b'), p('x', 'p-x')],
        loaded: JSON.stringify({ alias: { id: 'b' }, stored: 'a' }),
      }
    );
  });

  it('reads no group for the first two Suggesting Enters or imported unrelated decisions after a load beside a pending move of a 50 line section, and visits at most 5 holders deciding a group whose value 50 blocks store', () => {
    lifted = true;

    const work = (run: () => void) => {
      const before = readCoreWork();

      run();

      const after = readCoreWork();

      return {
        groups: after.valueGroupReads - before.valueGroupReads,
        visits: after.groupHolderVisits - before.groupHolderVisits,
      };
    };
    const counted = (value: unknown, plugin: unknown) =>
      createEditor<EditorValue, readonly unknown[]>({
        initialValue: structuredClone(value) as never,
        plugins: [plugin, createAuthoredPlugin({ authorId: 'zed' })],
      });
    const local = counted(besideMove(), Generated);
    const split = () =>
      local.update((tx) => {
        const at = { offset: 0, path: BESIDE };

        authoredIn(tx).propose({ changeId: 'zed:enter' });
        tx.selection.set({ anchor: at, focus: at });
        tx.break.insert();
      });

    const enter = [work(split).groups, work(split).groups];
    const docs = [new Y.Doc(), new Y.Doc()] as const;
    const zero = peerOn(
      docs[0],
      Generated,
      [
        ...besideMove(),
        whole(p('u', 'p-u'), 'insert', 'U'),
        whole(p('w', 'p-w'), 'insert', 'W'),
      ],
      [],
      unguarded
    );

    Y.applyUpdate(docs[1], Y.encodeStateAsUpdate(docs[0]));

    const one = peerOn(docs[1], Generated, undefined, [], unguarded);

    const imported = ['U', 'W'].map((change) => {
      authoredTestApi(one).decide(accept(change));

      return work(() => deliver(docs[1], docs[0], zero)).groups;
    });
    const group = counted(
      [
        {
          ...whole(tagged('own', 'own'), 'insert', 'M'),
          authored: [
            mark('insert', 'M'),
            { kind: 'as', values: { tag: 'shared' } },
          ],
        },
        ...Array.from({ length: 50 }, (_, at) => tagged(`t${at}`, 'shared')),
      ],
      Tags
    );
    const deciding = work(() => authoredTestApi(group).decide(accept('M')));

    assert.deepEqual(
      {
        decided: deciding.visits <= 5,
        enter,
        imported,
        shower: childrenOf(group)[0],
      },
      {
        decided: true,
        enter: [0, 0],
        imported: [0, 0],
        shower: tagged('own', 'own'),
      },
      JSON.stringify({ deciding, enter, imported })
    );
  });
});

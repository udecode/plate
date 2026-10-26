import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Y from 'yjs';

import { createAuthoredPlugin } from '../../src/authored/authored';
import {
  authoredRecords,
  contextRecordOf,
  verdictIdOf,
} from '../../src/authored/facts/records';
import { authoredMarksSchema } from '../../src/authored/tree/marks';
import {
  createEditor,
  defineEditorSchema,
  definePlugin,
  property,
  schema,
  target,
} from '../../src/index';
import { yjs } from '../../src/yjs/core/plugin';
import { authoredTestApi, reviewRecords } from '../support/authored';
import { readEditorYjsState } from './support/collaboration';

const ann = { at: 1, author: 'ann', change: 'A', kind: 'insert' };
const bob = { at: 2, author: 'bob', change: 'B', kind: 'insert' };
const cat = { at: 3, author: 'cat', change: 'C', kind: 'insert' };
const inBob = contextRecordOf(null, bob);
const inCat = contextRecordOf(inBob.ctx, cat);
const stacked = { authored: [ann, bob], text: 'x' };
const compacted = {
  authored: [ann, { ctx: inBob.ctx, kind: 'in' }],
  text: 'x',
};
const paragraph = (...children: readonly unknown[]) => ({
  children,
  type: 'paragraph',
});

const WithoutContexts = definePlugin('authored', {
  schema: authoredMarksSchema,
});
const WithoutAdmission = definePlugin('authored', {
  dependencies: [authoredRecords],
  schema: authoredMarksSchema,
});

const cards = (unknown: 'preserve' | 'reject') =>
  defineEditorSchema(`yjs-authored-cards:${unknown}`, {
    elements: {
      card: {
        content: schema.content.text({ default: 'text', min: 1 }),
        contentRoots: {
          body: {
            content: schema.content.type('paragraph', {
              default: { type: 'paragraph' },
              min: 1,
            }),
            ownership: 'exclusive',
          },
        },
      },
      paragraph: { content: schema.content.text({ default: 'text', min: 1 }) },
    },
    root: schema.content.types(['paragraph', 'card'], {
      default: { type: 'paragraph' },
      min: 1,
    }),
    unknown,
  });
const CARDS = [cards('reject'), cards('preserve')];

const peer = (
  doc: Y.Doc,
  plugin: unknown,
  seeded?: unknown,
  initial: unknown = [paragraph({ text: '' })]
) => {
  const editor = createEditor({
    initialValue: (seeded ?? initial) as never,
    plugins: [plugin].flat() as never,
  });
  const binding = yjs({
    doc,
    initialReady: true,
    ...(seeded ? { seed: true } : {}),
  });

  editor.install(binding);

  return {
    doc,
    editor,
    read: () => ({
      admission: editor.plugin(binding).api.admissionStatus(),
      value: editor.read.value(),
    }),
  };
};

const copyOf = (doc: Y.Doc) => {
  const copy = new Y.Doc();

  Y.applyUpdate(copy, Y.encodeStateAsUpdate(doc));

  return copy;
};

const send = (from: Y.Doc, to: Y.Doc) =>
  Y.applyUpdate(to, Y.encodeStateAsUpdate(from, Y.encodeStateVector(to)));

const rootsOf = (doc: Y.Doc) => [...doc.getMap('document:roots').keys()];

const Shapes = defineEditorSchema('yjs-authored-settle-shapes', {
  elements: {
    blockquote: {
      content: schema.content.type('paragraph', {
        default: { type: 'paragraph' },
        min: 1,
      }),
    },
    heading: { content: schema.content.text({ default: 'text', min: 1 }) },
    link: { content: schema.content.text(), inline: true },
    paragraph: schema.element.textBlock(),
  },
  root: schema.content.any(
    ['paragraph', 'heading', 'blockquote'].map((type) =>
      schema.content.type(type)
    ),
    { default: { type: 'paragraph' }, min: 1 }
  ),
  unknown: 'reject',
});
const carol = { at: 1, author: 'carol', change: 'carol:1', kind: 'delete' };
const carolAccepted = reviewRecords({
  verdicts: [
    {
      decision: 'd:1',
      member: { at: 1, change: 'carol:1' },
      verdict: 'accept',
    },
  ],
});
const line = (text: string, type = 'paragraph') => ({
  children: [{ text }],
  type,
});
const gone = (text: string, type = 'paragraph') => ({
  authored: [carol],
  children: [{ authored: [carol], text }],
  type,
});
const quote = (...children: readonly unknown[]) => ({
  children,
  type: 'blockquote',
});
type Write = Parameters<ReturnType<typeof createEditor>['update']>[0];

const settled: Record<string, readonly [readonly unknown[], Write]> = {
  inline: [
    [line('keep'), line('after')],
    (tx) => tx.nodes.insert({ ...gone('gone', 'link') }, { at: [0, 1] }),
  ],
  text: [
    [line('keep'), line('after')],
    (tx) =>
      tx.nodes.insert(
        { authored: [carol], text: 'gone' },
        {
          at: [0, 1],
        }
      ),
  ],
  middle: [
    [line('keep'), line('after')],
    (tx) => tx.nodes.insert(gone('gone'), { at: [1] }),
  ],
  'root same type': [
    [line('x')],
    (tx) => {
      tx.nodes.insert(gone('gone'), { at: [1] });
      tx.nodes.remove({ at: [0] });
    },
  ],
  'root heading': [
    [line('x')],
    (tx) => {
      tx.nodes.insert(gone('gone', 'heading'), { at: [1] });
      tx.nodes.remove({ at: [0] });
    },
  ],
  'root two': [
    [line('x')],
    (tx) => {
      tx.nodes.insert(gone('one'), { at: [1] });
      tx.nodes.insert(gone('two', 'heading'), { at: [2] });
      tx.nodes.remove({ at: [0] });
    },
  ],
  'root two paragraphs': [
    [line('x')],
    (tx) => {
      tx.nodes.insert(gone('one'), { at: [1] });
      tx.nodes.insert(gone('two'), { at: [2] });
      tx.nodes.remove({ at: [0] });
    },
  ],
  'root heading first': [
    [line('x')],
    (tx) => {
      tx.nodes.insert(gone('one', 'heading'), { at: [1] });
      tx.nodes.insert(gone('two'), { at: [2] });
      tx.nodes.remove({ at: [0] });
    },
  ],
  'quote two': [
    [line('keep'), quote(line('stay'))],
    (tx) => {
      tx.nodes.insert(gone('one'), { at: [1, 1] });
      tx.nodes.insert(gone('two'), { at: [1, 2] });
      tx.nodes.remove({ at: [1, 0] });
    },
  ],
  'quote removal': [
    [line('keep'), quote(line('stay'))],
    (tx) => tx.nodes.insert(gone('gone'), { at: [1, 1] }),
  ],
  'two removals': [
    [line('keep'), line('after')],
    (tx) => {
      tx.nodes.insert(gone('one'), { at: [1] });
      tx.nodes.insert(gone('two'), { at: [2] });
    },
  ],
  quote: [
    [line('keep'), quote(line('stay'))],
    (tx) => {
      tx.nodes.insert(gone('gone'), { at: [1, 1] });
      tx.nodes.remove({ at: [1, 0] });
    },
  ],
};

const roomOf = (initial: readonly unknown[], write: Write) => {
  const room = new Y.Doc();
  const writer = peer(room, [Shapes, WithoutAdmission], {
    children: initial,
    records: carolAccepted,
  });
  const dana = peer(copyOf(room), [
    Shapes,
    createAuthoredPlugin({ authorId: 'dana' }),
  ]);
  const eve = peer(copyOf(room), [
    Shapes,
    createAuthoredPlugin({ authorId: 'eve' }),
  ]);

  writer.editor.update(write);

  return { dana, eve, room, writer };
};

const settleInRoom = (name: string) =>
  roomOf(...(settled[name] ?? [[], () => {}]));

const storedIn = (doc: Y.Doc, shapes: unknown = Shapes, initial?: unknown) =>
  peer(
    copyOf(doc),
    [shapes, WithoutAdmission],
    undefined,
    initial
  ).editor.read.children();

const storedBlocks = (doc: Y.Doc) => doc.get('document', Y.XmlElement).length;

const exchange = (peers: ReadonlyArray<Readonly<{ doc: Y.Doc }>>) => {
  for (const from of peers) {
    for (const to of peers) if (from !== to) send(from.doc, to.doc);
  }
};

const assertConverged = (
  peers: ReadonlyArray<ReturnType<typeof peer>>,
  expected?: readonly unknown[],
  shapes: unknown = Shapes,
  initial?: unknown
) => {
  const [first] = peers;
  const value = expected ?? first?.editor.read.children();

  for (const { doc, editor, read } of peers) {
    assert.deepEqual(read().admission, { state: 'ready' });
    assert.deepEqual(editor.read.children(), value);
    assert.deepEqual(storedIn(doc, shapes, initial), value);
  }
};

const rewrites = (editor: ReturnType<typeof createEditor>) =>
  readEditorYjsState(editor as never)
    .trace()
    .filter(({ strategy }) => strategy === 'rewrite');

describe('plitejs/yjs authored admission', () => {
  it('stores one copy of what two admitting peers settle from one update, and keeps it editable', () => {
    for (const name of Object.keys(settled)) {
      const { dana, eve, room, writer } = settleInRoom(name);
      const written: unknown[] = [];

      dana.doc
        .get('document', Y.XmlElement)
        .observeDeep((events, transaction) => {
          if (!transaction.local) return;
          for (const event of events) {
            for (const step of event.delta) {
              if (step.insert !== undefined) written.push(step.insert);
            }
          }
        });
      send(room, dana.doc);
      send(room, eve.doc);

      assert.deepEqual(written, [], `${name} writes no insertion`);

      const own = dana.editor.read.children();

      assert.deepEqual(eve.editor.read.children(), own, name);

      send(dana.doc, eve.doc);
      send(eve.doc, dana.doc);
      send(dana.doc, room);
      send(eve.doc, room);

      for (const { doc, editor } of [dana, eve, writer]) {
        assert.deepEqual(editor.read.children(), own, name);
        assert.deepEqual(storedIn(doc), own, name);
      }
      assert.deepEqual(
        [dana, eve].flatMap(({ editor }) => rewrites(editor)),
        [],
        name
      );

      const last = name.startsWith('quote') ? [1, 0, 0] : [own.length - 1, 0];

      dana.editor.update((tx) =>
        tx.text.insert('!', { at: { offset: 0, path: last } })
      );
      send(dana.doc, eve.doc);

      assert.deepEqual(dana.read().admission, { state: 'ready' }, name);
      assert.deepEqual(
        [eve.editor.read.children(), storedIn(dana.doc)],
        [dana.editor.read.children(), dana.editor.read.children()],
        name
      );
    }
  });

  it('keeps the letters a third peer types beside what two admitting peers remove, in either delivery order', () => {
    const typed = [
      ['inline', false, [0, 0], [line('!keep'), line('after')]],
      ['quote removal', false, [1, 0, 0], [line('keep'), quote(line('!stay'))]],
      ['root two', true, [0, 0], [line('!')]],
    ] as const;

    for (const [name, admits, path, expected] of typed) {
      for (const reversed of [false, true]) {
        const { dana, eve, room } = settleInRoom(name);
        const frank = peer(copyOf(room), [
          Shapes,
          admits
            ? createAuthoredPlugin({ authorId: 'frank' })
            : WithoutAdmission,
        ]);

        send(room, frank.doc);
        frank.editor.update((tx) =>
          tx.text.insert('!', { at: { offset: 0, path: [...path] } })
        );
        send(room, dana.doc);
        send(room, eve.doc);

        const peers = [dana, eve, frank];

        exchange(reversed ? peers.toReversed() : peers);
        assertConverged(peers, expected);
      }
    }
  });

  it('converges when a third peer’s letter reaches one admitting peer with the update it follows', () => {
    const { dana, eve, room } = settleInRoom('root two');
    const frank = peer(copyOf(room), [Shapes, WithoutAdmission]);

    send(room, frank.doc);
    frank.editor.update((tx) =>
      tx.text.insert('z', { at: { offset: 1, path: [0, 0] } })
    );
    send(frank.doc, dana.doc);
    send(room, eve.doc);
    exchange([dana, eve, frank]);

    assertConverged([dana, eve, frank]);
    assert.equal(dana.editor.read.children().length, 1);
  });

  it('loses the letters a third peer types inside a block the repair removes', () => {
    const { dana, eve, room } = settleInRoom('middle');
    const frank = peer(copyOf(room), [Shapes, WithoutAdmission]);

    send(room, frank.doc);
    frank.editor.update((tx) =>
      tx.text.insert('z', { at: { offset: 0, path: [1, 0] } })
    );
    send(room, dana.doc);
    send(room, eve.doc);
    exchange([dana, eve, frank]);

    assertConverged([dana, eve, frank], [line('keep'), line('after')]);
  });

  it('removes the occurrence carol’s deletion names among equal lines and letters', () => {
    const repeated = [
      [
        [line('keep'), quote(line('abc'))],
        (tx: Parameters<Write>[0]) =>
          tx.nodes.insert(gone('abc'), { at: [1, 0] }),
        { offset: 3, path: [1, 1, 0] },
        [line('keep'), quote(line('abc!'))],
      ],
      [
        [line('a')],
        (tx: Parameters<Write>[0]) =>
          tx.nodes.insert(
            { authored: [carol], text: 'a' },
            {
              at: [0, 1],
            }
          ),
        { offset: 1, path: [0, 0] },
        [line('a!')],
      ],
    ] as const;

    for (const [initial, write, at, expected] of repeated) {
      const room = new Y.Doc();
      const writer = peer(room, [Shapes, WithoutAdmission], {
        children: initial,
        records: carolAccepted,
      });
      const [dana, eve, frank] = ['dana', 'eve', null].map((authorId) =>
        peer(copyOf(room), [
          Shapes,
          authorId ? createAuthoredPlugin({ authorId }) : WithoutAdmission,
        ])
      ) as [
        ReturnType<typeof peer>,
        ReturnType<typeof peer>,
        ReturnType<typeof peer>,
      ];

      writer.editor.update(write);
      send(room, frank.doc);
      frank.editor.update((tx) => tx.text.insert('!', { at }));
      send(room, dana.doc);
      send(room, eve.doc);
      exchange([dana, eve, frank]);

      assertConverged([dana, eve, frank], expected);
    }
  });

  it('converges without a rewrite when two admitting peers know different verdicts as they settle one update', () => {
    const carolTwo = { ...carol, at: 2, change: 'carol:2' };
    const goneTwo = {
      authored: [carolTwo],
      children: [{ authored: [carolTwo], text: 'two' }],
      type: 'paragraph',
    };
    const room = new Y.Doc();
    const writer = peer(room, [Shapes, WithoutAdmission], {
      children: [line('x')],
      records: carolAccepted,
    });
    const [dana, eve] = ['dana', 'eve'].map((authorId) =>
      peer(copyOf(room), [Shapes, createAuthoredPlugin({ authorId })])
    ) as [ReturnType<typeof peer>, ReturnType<typeof peer>];
    const reviewer = peer(copyOf(room), [Shapes, WithoutAdmission]);
    const verdicts = reviewRecords({
      verdicts: [
        {
          decision: 'd:2',
          member: { at: 2, change: 'carol:2' },
          verdict: 'accept',
        },
      ],
    })['authored-verdicts'];

    reviewer.editor.update((tx) => {
      for (const [id, record] of Object.entries(verdicts ?? {})) {
        tx.records.put('authored-verdicts', id, record);
      }
    });
    send(reviewer.doc, dana.doc);
    writer.editor.update((tx) => {
      tx.nodes.insert(gone('one'), { at: [1] });
      tx.nodes.insert(goneTwo, { at: [2] });
      tx.nodes.remove({ at: [0] });
    });
    send(room, dana.doc);
    send(room, eve.doc);

    assert.deepEqual(
      [dana, eve].map(({ editor }) => editor.read.children()),
      [[line('')], [goneTwo]]
    );

    const peers = [dana, eve, writer, reviewer];

    exchange(peers);

    assertConverged(peers, [line('')]);
    assert.deepEqual(
      [dana, eve].flatMap(({ editor }) => rewrites(editor)),
      []
    );
  });

  it('writes back an import its admission undoes when the import also commits a record', () => {
    const { dana, eve, room, writer } = settleInRoom('middle');

    writer.editor.update((tx) =>
      tx.records.put('authored-contexts', inBob.ctx, { member: bob })
    );
    send(room, dana.doc);
    send(room, eve.doc);
    exchange([dana, eve]);

    assertConverged([dana, eve], [line('keep'), line('after')]);
  });

  it('drops the root of a suggested card a verdict rejects when a peer attaches, in both schema modes', () => {
    for (const Cards of CARDS) {
      const suggester = createEditor({
        initialValue: [paragraph({ text: 'C' }), paragraph({ text: 'aa' })],
        plugins: [
          Cards,
          createAuthoredPlugin({
            authorId: 'bob',
            createChangeId: () => 'bob:1',
            intent: 'propose',
            now: () => 1,
          }),
        ] as never,
      });

      suggester.update((tx) => {
        tx.roots.create('b9', [paragraph({ text: 'B' })] as never);
        tx.nodes.set({ type: 'card', childRoots: { body: 'b9' } } as never, {
          at: [0],
        });
      });

      const { records: _records, ...claimed } = suggester.read.value();
      const room = new Y.Doc();
      const writer = peer(room, [Cards, WithoutAdmission], {
        ...claimed,
        records: reviewRecords({
          verdicts: [
            {
              decision: 'd:1',
              member: { at: 1, change: 'bob:1' },
              verdict: 'reject',
            },
          ],
        }),
      });
      const dana = peer(copyOf(room), [
        Cards,
        createAuthoredPlugin({ authorId: 'dana' }),
      ]);

      send(dana.doc, room);

      assert.deepEqual(
        [dana, writer].map(({ doc, editor }) => [
          rootsOf(doc),
          editor.read.value().children.map((node: any) => node.type),
          editor.read.value().roots,
        ]),
        [
          [[], ['paragraph', 'paragraph'], undefined],
          [[], ['paragraph', 'paragraph'], undefined],
        ]
      );
    }
  });

  it('upgrades a room an authored build without review contexts wrote, whichever upgrade arrives first', () => {
    for (const danaFirst of [true, false]) {
      const room = new Y.Doc();

      peer(room, WithoutContexts, [paragraph({ text: 'a' }, stacked)]);

      const dana = peer(
        copyOf(room),
        createAuthoredPlugin({ authorId: 'dana' })
      );
      const erin = peer(
        copyOf(room),
        createAuthoredPlugin({ authorId: 'erin' })
      );
      const [first, second] = danaFirst ? [dana, erin] : [erin, dana];

      send(first.doc, second.doc);
      send(second.doc, first.doc);

      const reader = peer(copyOf(dana.doc), WithoutAdmission);
      const upgraded = {
        admission: { state: 'ready' },
        value: {
          children: [paragraph({ text: 'a' }, compacted)],
          records: reviewRecords({ contexts: [inBob] }),
        },
      };

      assert.deepEqual(
        [dana.read(), erin.read(), reader.read()],
        [upgraded, upgraded, upgraded]
      );
    }
  });

  it('writes back the claims it compacts in an update from a peer without admission, and later changes to them', () => {
    const room = new Y.Doc();
    const writer = peer(room, WithoutAdmission, [paragraph({ text: 'a' })]);
    const dana = peer(
      copyOf(room),
      createAuthoredPlugin({
        authorId: 'dana',
        createIncarnationId: () => 'd:1',
        intent: 'edit',
      })
    );

    writer.editor.update((tx) => {
      tx.nodes.insert(stacked as never, { at: [0, 1] });
    });
    send(room, dana.doc);
    send(dana.doc, room);

    const admitted = {
      admission: { state: 'ready' },
      value: {
        children: [paragraph({ text: 'a' }, compacted)],
        records: reviewRecords({ contexts: [inBob] }),
      },
    };

    assert.deepEqual([dana.read(), writer.read()], [admitted, admitted]);

    authoredTestApi(dana.editor).decide({ action: 'accept', changes: ['B'] });
    send(dana.doc, room);

    const accepted = {
      admission: { state: 'ready' },
      value: {
        children: [paragraph({ text: 'a' }, { authored: [ann], text: 'x' })],
        records: reviewRecords({
          contexts: [inBob],
          verdicts: [
            {
              decision: 'd:1',
              member: { at: bob.at, change: bob.change },
              verdict: 'accept',
            },
          ],
        }),
      },
    };

    assert.deepEqual([dana.read(), writer.read()], [accepted, accepted]);
  });

  it('refuses a remote verdict whose id names other content', () => {
    const room = new Y.Doc();

    peer(room, WithoutAdmission, [paragraph({ text: 'a' })]);

    const erin = peer(copyOf(room), createAuthoredPlugin({ authorId: 'erin' }));
    const forger = copyOf(room);
    const id = verdictIdOf({
      decision: 'd:1',
      member: { at: 2, change: 'B' },
      verdict: 'accept',
    });

    forger.getMap('document:records:authored-verdicts').set(
      id,
      JSON.stringify({
        at: 2,
        change: 'B',
        decision: 'd:1',
        verdict: 'reject',
      })
    );
    send(forger, erin.doc);

    const { admission, value } = erin.read();

    assert.deepEqual(
      {
        cause: admission.state === 'error' && String(admission.cause),
        value,
      },
      {
        cause: `AuthoredMarkError: Review verdict ${id} is malformed.`,
        value: { children: [paragraph({ text: 'a' })] },
      }
    );
  });

  it('refuses a remote drop of a context text still rests on', () => {
    const room = new Y.Doc();

    peer(room, createAuthoredPlugin({ authorId: 'ann' }), [paragraph(stacked)]);

    const erin = peer(copyOf(room), createAuthoredPlugin({ authorId: 'erin' }));
    const forger = copyOf(room);

    forger.getMap('document:records:authored-contexts').delete(inBob.ctx);
    send(forger, erin.doc);

    const { admission, value } = erin.read();

    assert.deepEqual(
      {
        cause: admission.state === 'error' && String(admission.cause),
        value,
      },
      {
        cause: `AuthoredMarkError: Review context ${inBob.ctx} was dropped while text rests on it.`,
        value: {
          children: [paragraph(compacted)],
          records: reviewRecords({ contexts: [inBob] }),
        },
      }
    );
  });

  it('refuses a remote drop of a context another kept context rests on', () => {
    const room = new Y.Doc();

    peer(room, createAuthoredPlugin({ authorId: 'ann' }), [
      paragraph({ authored: [ann, bob, cat], text: 'x' }),
    ]);

    const erin = peer(copyOf(room), createAuthoredPlugin({ authorId: 'erin' }));
    const forger = copyOf(room);

    forger.getMap('document:records:authored-contexts').delete(inBob.ctx);
    send(forger, erin.doc);

    const { admission, value } = erin.read();

    assert.deepEqual(
      {
        cause: admission.state === 'error' && String(admission.cause),
        value,
      },
      {
        cause: `AuthoredMarkError: Review context ${inBob.ctx} was dropped while context ${inCat.ctx} rests on it.`,
        value: {
          children: [
            paragraph({
              authored: [ann, { ctx: inCat.ctx, kind: 'in' }],
              text: 'x',
            }),
          ],
          records: reviewRecords({ contexts: [inBob, inCat] }),
        },
      }
    );
  });

  it('refuses a remote Editing deletion, which never stays stored', () => {
    const room = new Y.Doc();

    peer(room, createAuthoredPlugin({ authorId: 'ann' }), [
      paragraph({ text: 'a' }),
    ]);

    const erin = peer(copyOf(room), createAuthoredPlugin({ authorId: 'erin' }));
    const forger = peer(copyOf(room), WithoutAdmission);

    forger.editor.update((tx) =>
      tx.nodes.insert(
        paragraph({
          authored: [
            { at: 1, author: 'bob', change: '~edit:bob', kind: 'delete' },
          ],
          text: 'x',
        }) as never,
        { at: [1] }
      )
    );
    send(forger.doc, erin.doc);

    const { admission, value } = erin.read();

    assert.deepEqual(
      {
        cause: admission.state === 'error' && String(admission.cause),
        value,
      },
      {
        cause:
          'AuthoredMarkError: An Editing mark of kind "delete" never stays stored; only a join, a split, an insertion that follows a join or a format written over other tags does.',
        value: { children: [paragraph({ text: 'a' })] },
      }
    );
  });
});

describe('plitejs/yjs authored admission repair', () => {
  const annKeeps = { at: 1, author: 'ann', change: 'ann:1', kind: 'insert' };
  const carolRemoves = { ...carol, at: 2 };
  const bothAccepted = reviewRecords({
    verdicts: [
      {
        decision: 'a:1',
        member: { at: 1, change: 'ann:1' },
        verdict: 'accept',
      },
      {
        decision: 'c:1',
        member: { at: 2, change: 'carol:1' },
        verdict: 'accept',
      },
    ],
  });
  const marked = (mark: object, text: string) => ({
    authored: [mark],
    children: [{ authored: [mark], text }],
    type: 'paragraph',
  });
  const link = (...children: readonly unknown[]) => ({
    children,
    type: 'link',
  });
  const admitting = (
    room: Y.Doc,
    shapes: unknown = Shapes,
    initial?: unknown
  ) =>
    ['dana', 'eve'].map((authorId) =>
      peer(
        copyOf(room),
        [shapes, createAuthoredPlugin({ authorId })],
        undefined,
        initial
      )
    ) as [ReturnType<typeof peer>, ReturnType<typeof peer>];
  const rewritesOf = (peers: ReadonlyArray<ReturnType<typeof peer>>) =>
    peers.flatMap(({ editor }) => rewrites(editor));
  const replacing = (kept: string, removed: string) => {
    const room = new Y.Doc();
    const writer = peer(room, [Shapes, WithoutAdmission], {
      children: [quote(line('old'))],
      records: bothAccepted,
    });
    const [dana, eve] = admitting(room);
    const frank = peer(copyOf(room), [Shapes, WithoutAdmission]);

    writer.editor.update((tx) => {
      tx.nodes.insert(marked(annKeeps, kept), { at: [0, 1] });
      tx.nodes.insert(marked(carolRemoves, removed), { at: [0, 2] });
      tx.nodes.remove({ at: [0, 0] });
    });

    return { dana, eve, frank, room, writer };
  };
  const flanked = () =>
    roomOf([line('keep'), quote(line('stay'))], (tx) => {
      tx.nodes.insert(gone('one'), { at: [1, 0] });
      tx.nodes.insert(gone('two'), { at: [1, 2] });
    });

  it('keeps the quote line between two removed lines', () => {
    const { dana, eve, room, writer } = flanked();

    send(room, dana.doc);
    send(room, eve.doc);
    exchange([dana, eve, writer]);

    assertConverged([dana, eve, writer], [line('keep'), quote(line('stay'))]);
    assert.deepEqual(rewritesOf([dana, eve]), []);
  });

  it('stores one quote when the kept and removed lines differ', () => {
    const { dana, eve, room, writer } = replacing('keep', 'gone');

    send(room, dana.doc);
    send(room, eve.doc);
    exchange([dana, eve, writer]);

    assertConverged([dana, eve, writer], [quote(line('keep'))]);
    assert.deepEqual(rewritesOf([dana, eve]), []);
  });

  it('keeps a letter typed into the kept line of two equal lines, in either delivery order', () => {
    for (const early of [true, false]) {
      const { dana, eve, frank, room } = replacing('abc', 'abc');

      send(room, frank.doc);
      frank.editor.update((tx) =>
        tx.text.insert('!', { at: { offset: 3, path: [0, 0, 0] } })
      );
      send(early ? frank.doc : room, dana.doc);
      send(early ? frank.doc : room, eve.doc);
      exchange([dana, eve, frank]);

      assertConverged([dana, eve, frank], [quote(line('abc!'))]);
      assert.deepEqual(rewritesOf([dana, eve]), [], `early: ${early}`);
    }
  });

  it('keeps a letter typed into the kept empty quote line, in either delivery order', () => {
    for (const early of [true, false]) {
      const { dana, eve, room } = roomOf(
        [line('keep'), quote(line(''))],
        (tx) => {
          tx.nodes.insert(gone('one'), { at: [1, 0] });
          tx.nodes.insert(gone('two'), { at: [1, 2] });
        }
      );
      const frank = peer(copyOf(room), [Shapes, WithoutAdmission]);

      frank.editor.update((tx) =>
        tx.text.insert('!', { at: { offset: 0, path: [1, 1, 0] } })
      );
      send(early ? frank.doc : room, dana.doc);
      send(early ? frank.doc : room, eve.doc);
      exchange([dana, eve, frank]);

      assertConverged([dana, eve, frank], [line('keep'), quote(line('!'))]);
      assert.deepEqual(rewritesOf([dana, eve]), [], `early: ${early}`);
    }
  });

  const weight = schema.textProperty(
    'weight',
    property.number({ default: 400 }),
    { target: target.type('paragraph') }
  );
  const Weighted = defineEditorSchema('yjs-authored-weighted', {
    elements: {
      blockquote: {
        content: schema.content.type('paragraph', {
          default: { type: 'paragraph' },
          min: 1,
        }),
      },
      paragraph: { content: schema.content.text({ default: 'text', min: 1 }) },
    },
    properties: [weight],
    root: schema.content.types(['paragraph', 'blockquote'], {
      default: { type: 'paragraph' },
      min: 1,
    }),
    unknown: 'reject',
  });
  const WeightedLinks = defineEditorSchema('yjs-authored-weighted-links', {
    elements: {
      link: { content: schema.content.text(), inline: true },
      paragraph: schema.element.textBlock(),
    },
    properties: [weight],
    root: schema.content.type('paragraph', {
      default: { type: 'paragraph' },
      min: 1,
    }),
    unknown: 'reject',
  });
  const weighted = (text: string) => ({
    children: [{ text, weight: 400 }],
    type: 'paragraph',
  });
  const quoteDeleted = (records: unknown) => {
    const room = new Y.Doc();
    const writer = peer(room, [Weighted, WithoutAdmission], {
      children: [weighted('x')],
      records,
    });
    const [dana, eve] = admitting(room, Weighted, [weighted('')]);

    writer.editor.update((tx) => {
      tx.nodes.insert(
        {
          authored: [carol],
          children: [
            {
              authored: [carol],
              children: [{ authored: [carol], text: 'gone', weight: 400 }],
              type: 'paragraph',
            },
          ],
          type: 'blockquote',
        } as never,
        { at: [1] }
      );
      tx.nodes.remove({ at: [0] });
    });
    send(room, dana.doc);
    send(room, eve.doc);
    send(dana.doc, eve.doc);
    send(eve.doc, dana.doc);

    return { dana, eve, room, writer };
  };

  it('settles a deleted quote whose completion needs a text default', () => {
    const { dana, eve } = quoteDeleted(carolAccepted);

    assertConverged([dana, eve], [weighted('')], Weighted, [weighted('')]);
    assert.deepEqual(
      [dana, eve].map(({ doc }) => storedBlocks(doc)),
      [1, 1]
    );
    assert.deepEqual(rewritesOf([dana, eve]), []);
  });

  it('stores one paragraph when a second accepted deletion reaches a paragraph whose text a default completed', () => {
    const carolTwo = { ...carol, at: 2, change: 'carol:2' };
    const { dana, eve, room, writer } = quoteDeleted(
      reviewRecords({
        verdicts: [
          {
            decision: 'd:1',
            member: { at: 1, change: 'carol:1' },
            verdict: 'accept',
          },
          {
            decision: 'd:2',
            member: { at: 2, change: 'carol:2' },
            verdict: 'accept',
          },
        ],
      })
    );

    writer.editor.update((tx) => {
      for (const at of [[0], [0, 0], [0, 0, 0]]) {
        tx.nodes.set({ authored: [carolTwo] } as never, { at });
      }
    });
    send(room, dana.doc);
    send(room, eve.doc);
    send(dana.doc, eve.doc);
    send(eve.doc, dana.doc);

    assertConverged([dana, eve], [weighted('')], Weighted, [weighted('')]);
    assert.deepEqual(
      [dana, eve].map(({ doc }) => storedBlocks(doc)),
      [1, 1]
    );
    assert.deepEqual(rewritesOf([dana, eve]), []);
  });

  it('stores one paragraph when a deleted link leaves spacer texts that take a default', () => {
    const room = new Y.Doc();
    const writer = peer(room, [WeightedLinks, WithoutAdmission], {
      children: [weighted('keep')],
      records: carolAccepted,
    });
    const peers = admitting(room, WeightedLinks, [weighted('')]);

    writer.editor.update((tx) =>
      tx.nodes.insert(gone('gone', 'link'), { at: [0, 1] })
    );
    for (const { doc } of peers) send(room, doc);
    exchange(peers);

    assertConverged(peers, [weighted('keep')], WeightedLinks, [weighted('')]);
    assert.deepEqual(rewritesOf(peers), []);
  });

  it('keeps a line and a letter that reach storage while an import notifies its commit', () => {
    const { dana, eve, frank, room, writer } = replacing('abc', 'abc');
    let delivered = false;

    send(room, frank.doc);
    frank.editor.update((tx) => {
      tx.text.insert('!', { at: { offset: 3, path: [0, 0, 0] } });
      tx.nodes.insert(line('peer'), { at: [0, 1] });
    });

    const unsubscribe = dana.editor.subscribeCommit((commit) => {
      if (delivered || !commit.tags.includes('remote-yjs-import')) return;
      delivered = true;
      send(frank.doc, dana.doc);
    });

    send(room, dana.doc);
    unsubscribe();
    assert.equal(delivered, true);
    send(room, eve.doc);
    exchange([dana, eve, frank, writer]);

    assertConverged(
      [dana, eve, frank, writer],
      [quote(line('abc!'), line('peer'))]
    );
    assert.deepEqual(rewritesOf([dana, eve]), []);
  });

  it('settles an update whose readiness rises inside the Yjs transaction that applied it', () => {
    const room = new Y.Doc();

    peer(room, [Shapes, WithoutAdmission], {
      children: [line('keep'), gone('gone')],
      records: carolAccepted,
    });

    const doc = new Y.Doc();
    const listeners = new Set<() => void>();
    let loaded = false;
    const editor = createEditor({
      initialValue: [line('')] as never,
      plugins: [Shapes, createAuthoredPlugin({ authorId: 'dana' })] as never,
    });
    const binding = yjs({
      doc,
      initialReady: {
        doc,
        getSnapshot: () => loaded,
        subscribe: (listener: () => void) => {
          listeners.add(listener);

          return () => listeners.delete(listener);
        },
      },
    });
    const transact = doc.transact.bind(doc);
    let transactions = 0;

    editor.install(binding);
    doc.transact = ((f, origin) => {
      transactions += 1;
      if (transactions > 30) throw new Error('the binding keeps importing');

      return transact(f, origin);
    }) as typeof doc.transact;
    transact(() => {
      send(room, doc);
      loaded = true;
      for (const listener of listeners) listener();
    });

    assert.deepEqual(editor.plugin(binding).api.admissionStatus(), {
      state: 'ready',
    });
    assert.deepEqual(editor.read.children(), [line('keep')]);
    assert.equal(storedBlocks(doc), 1);
  });

  it('imports an update once when a commit listener writes to a map under the binding’s name as it imports', () => {
    const { dana, eve, room, writer } = replacing('abc', 'abc');
    let imports = 0;

    const unsubscribe = dana.editor.subscribeCommit((commit) => {
      if (!commit.tags.includes('remote-yjs-import')) return;
      imports += 1;
      if (imports === 1) {
        dana.doc.getMap('document:meta').set('imported', true);
      }
    });

    send(room, dana.doc);
    unsubscribe();
    send(room, eve.doc);
    exchange([dana, eve, writer]);

    assert.equal(imports, 1);
    assertConverged([dana, eve, writer], [quote(line('abc'))]);
    assert.deepEqual(rewritesOf([dana, eve]), []);
  });

  it('stores one paragraph when a deleted link leaves an implicit spacer that takes a generated property', () => {
    let generated = 0;
    const Tokens = defineEditorSchema('yjs-authored-generated-tokens', {
      elements: {
        link: { content: schema.content.text(), inline: true },
        paragraph: schema.element.textBlock(),
      },
      properties: [
        schema.textProperty(
          'token',
          property.string({
            generate: () => {
              generated += 1;

              return `g${generated}`;
            },
          }),
          { target: target.type('paragraph') }
        ),
      ],
      root: schema.content.type('paragraph', {
        default: { type: 'paragraph' },
        min: 1,
      }),
      unknown: 'reject',
    });
    const tokened = (text: string) => ({
      children: [{ text, token: 'keep' }],
      type: 'paragraph',
    });
    const room = new Y.Doc();
    const writer = peer(room, [Tokens, WithoutAdmission], {
      children: [tokened('keep')],
      records: carolAccepted,
    });
    const peers = admitting(room, Tokens, [tokened('')]);

    writer.editor.update((tx) =>
      tx.nodes.insert(gone('gone', 'link'), { at: [0, 1] })
    );
    for (const { doc } of peers) send(room, doc);
    exchange(peers);

    assertConverged(peers, [tokened('keep')], Tokens, [tokened('')]);
    assert.deepEqual(
      peers.map(({ doc }) => storedBlocks(doc)),
      [1, 1]
    );
    assert.deepEqual(rewritesOf(peers), []);
  });

  it('keeps a letter a peer typed when another peer writes both verdicts in a plain update', () => {
    const room = new Y.Doc();
    const writer = peer(room, [Shapes, WithoutAdmission], {
      children: [quote(marked(annKeeps, 'abc'), marked(carolRemoves, 'abc'))],
    });
    const [dana] = admitting(room);
    const frank = peer(copyOf(room), [Shapes, WithoutAdmission]);

    frank.editor.update((tx) =>
      tx.text.insert('!', { at: { offset: 3, path: [0, 0, 0] } })
    );
    dana.editor.update((tx) => {
      for (const [id, record] of Object.entries(
        bothAccepted['authored-verdicts'] ?? {}
      )) {
        tx.records.put('authored-verdicts', id, record);
      }
    });
    exchange([dana, frank, writer]);

    assertConverged([dana, frank, writer], [quote(line('abc!'))]);
    assert.deepEqual(rewritesOf([dana]), []);
  });

  it('drops each removed node by the index it was read at when earlier nodes of its level go', () => {
    const { dana, eve, room, writer } = roomOf([line('x')], (tx) => {
      tx.nodes.insert(
        {
          children: [
            { text: 'keep' },
            { authored: [carol], text: 'x' },
            gone('l', 'link'),
            { text: '' },
            link({ text: 'a' }, { authored: [carol], text: 'y' }),
            { text: '' },
          ],
          type: 'paragraph',
        },
        { at: [1] }
      );
      tx.nodes.remove({ at: [0] });
    });

    send(room, dana.doc);
    send(room, eve.doc);
    exchange([dana, eve, writer]);

    assertConverged(
      [dana, eve, writer],
      [paragraph({ text: 'keep' }, link({ text: 'a' }), { text: '' })]
    );
    assert.deepEqual(rewritesOf([dana, eve]), []);
  });

  it('removes letters a stored run holds across several texts', () => {
    const room = new Y.Doc();
    const writer = peer(room, [Shapes, WithoutAdmission], {
      children: [
        paragraph({ text: 'ab' }, link({ text: 'x' }), { text: 'cd' }),
      ],
      records: carolAccepted,
    });

    writer.editor.update((tx) => tx.nodes.remove({ at: [0, 1] }));

    const [dana, eve] = admitting(room);
    const frank = peer(copyOf(room), [Shapes, WithoutAdmission]);

    writer.editor.update((tx) =>
      tx.nodes.set(
        { authored: [carol] } as never,
        {
          at: {
            anchor: { offset: 1, path: [0, 0] },
            focus: { offset: 3, path: [0, 0] },
          },
          match: (node: any) => typeof node.text === 'string',
          split: true,
        } as never
      )
    );
    send(room, frank.doc);
    frank.editor.update((tx) => {
      tx.text.insert('1', { at: { offset: 0, path: [0, 0] } });
      tx.text.insert('2', { at: { offset: 1, path: [0, 2] } });
    });
    send(room, dana.doc);
    send(room, eve.doc);
    exchange([dana, eve, frank]);

    assertConverged([dana, eve, frank], [line('1ad2')]);
    assert.deepEqual(rewritesOf([dana, eve]), []);
  });

  it('repairs a named root', () => {
    const [Cards] = CARDS;
    const room = new Y.Doc();
    const value = (body: readonly unknown[]) => ({
      children: [
        { childRoots: { body: 'b9' }, children: [{ text: 'C' }], type: 'card' },
      ],
      roots: { b9: body },
    });
    const writer = peer(room, [Cards, WithoutAdmission], {
      ...value([line('keep'), line('after')]),
      records: carolAccepted,
    });
    const [dana, eve] = admitting(room, Cards);
    const frank = peer(copyOf(room), [Cards, WithoutAdmission]);

    writer.editor.update((tx) =>
      tx.roots.replace('b9', [
        line('keep'),
        gone('gone'),
        line('after'),
      ] as never)
    );
    send(room, frank.doc);
    frank.editor.update((tx) =>
      tx.text.insert('!', { at: { offset: 0, path: [2, 0], root: 'b9' } })
    );
    send(room, dana.doc);
    send(room, eve.doc);
    exchange([dana, eve, frank]);

    const expected = value([line('keep'), line('!after')]);

    for (const { doc, editor, read } of [dana, eve, frank]) {
      const { records: _records, ...read_ } = read().value;

      assert.deepEqual(read().admission, { state: 'ready' });
      assert.deepEqual(read_, expected);
      assert.deepEqual(
        peer(copyOf(doc), [Cards, WithoutAdmission]).editor.read.value().roots,
        expected.roots
      );
      assert.equal(editor.read.children().length, 1);
    }
    assert.deepEqual(rewritesOf([dana, eve]), []);
  });

  it('keeps exact sections when one import compacts claims, removes a fragment and relinks its cuts', () => {
    const cut = (change: string, name: string, side: 'end' | 'start') => ({
      at: 4,
      author: 'dan',
      change,
      cut: name,
      kind: 'split',
      side,
    });
    const split = (change: string) => ({
      at: 4,
      author: 'dan',
      change,
      kind: 'split',
    });
    const fragment = (
      text: object,
      cuts: readonly object[],
      authored?: readonly object[]
    ) => ({
      ...(authored ? { authored } : {}),
      children: [
        { text: '' },
        { authored: cuts, children: [text], type: 'link' },
        { text: '' },
      ],
      type: 'paragraph',
    });
    const { dana, eve, room } = roomOf([line('x')], (tx) => {
      [
        fragment({ text: 'a' }, [cut('dan:1', 'k1', 'end')]),
        fragment(
          { authored: [carol], text: 'b' },
          [carol, cut('dan:1', 'k1', 'start'), cut('dan:2', 'k2', 'end')],
          [carol, split('dan:1')]
        ),
        fragment(
          { text: 'c' },
          [cut('dan:2', 'k2', 'start')],
          [split('dan:2')]
        ),
        paragraph(stacked),
      ].forEach((block, at) => tx.nodes.insert(block, { at: [at + 1] }));
      tx.nodes.remove({ at: [0] });
    });
    const frank = peer(copyOf(room), [Shapes, WithoutAdmission]);

    frank.editor.update((tx) => {
      tx.text.insert('!', { at: { offset: 0, path: [0, 1, 0] } });
      tx.text.insert('!', { at: { offset: 1, path: [2, 1, 0] } });
    });
    send(room, dana.doc);
    send(room, eve.doc);
    exchange([dana, eve, frank]);

    assertConverged(
      [dana, eve, frank],
      [
        fragment({ text: '!a' }, [
          cut('dan:1', 'k1', 'end'),
          cut('dan:2', 'k2', 'end'),
        ]),
        fragment(
          { text: 'c!' },
          [cut('dan:1', 'k1', 'start'), cut('dan:2', 'k2', 'start')],
          [split('dan:2')]
        ),
        paragraph(compacted),
      ]
    );
    assert.deepEqual(rewritesOf([dana, eve]), []);
  });
});

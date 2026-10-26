import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  defineEditorSchema,
  property,
  schema,
  target,
} from 'plitejs';

import { createAuthoredPlugin } from '../src/authored/authored';
import { authoredResolveSchemaOf } from '../src/authored/resolve-schema';
import { projectAuthoredFragment } from '../src/authored/tree/resolve';
import { authoredTestApi, expandedChildren } from './support/authored';

type Node = Readonly<{
  authored?: readonly unknown[];
  children?: readonly Node[];
  text?: string;
  type?: string;
  [key: string]: unknown;
}>;
type Decision = Readonly<{
  action: 'accept' | 'reject';
  changes: readonly string[];
}>;

const c = schema.content;
const textMin1 = () => c.text({ default: 'text', min: 1 });
const define = (id: string, definition: object) =>
  defineEditorSchema(id, {
    id,
    properties: [schema.textProperty('bold', property.boolean())],
    unknown: 'reject',
    version: 1,
    ...definition,
  } as never);
const blocks = (...types: string[]) =>
  c.any(
    types.map((type) => c.type(type)),
    { default: { type: types[0] }, min: 1 }
  );

const t = (text: string, extra: object = {}): Node => ({ text, ...extra });
const el = (type: string, ...children: Node[]): Node => ({ children, type });
const mark = (kind: string, change: string) => ({
  at: 1,
  author: change.split(':')[0],
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
const plain = (nodes: readonly Node[]): Node[] =>
  nodes.map(({ authored: _authored, children, ...rest }) =>
    children ? { ...rest, children: plain(children) } : rest
  );

const reviewing = (plugin: unknown, value: readonly Node[]) =>
  createEditor({
    initialValue: structuredClone(value) as never,
    plugins: [plugin, createAuthoredPlugin({ authorId: 'zed' })] as never,
  });
const editing = (
  plugin: unknown,
  value: readonly Node[],
  ...steps: ReadonlyArray<
    Parameters<ReturnType<typeof createEditor>['update']>[0]
  >
) => {
  const editor = createEditor({
    initialValue: structuredClone(value) as never,
    plugins: [plugin] as never,
  });

  for (const step of steps) editor.update(step);

  return plain(editor.read.children() as readonly Node[]);
};
/** Decide each decision in order on a fresh review of `value`. */
const decided = (
  plugin: unknown,
  value: readonly Node[],
  ...decisions: ReadonlyArray<Decision | readonly Decision[]>
) => {
  const editor = reviewing(plugin, value);
  const results = decisions.map((decision) =>
    authoredTestApi(editor).decide(decision)
  );

  return {
    children: expandedChildren(editor) as readonly Node[],
    results,
  };
};
const suggesting = (
  plugin: unknown,
  value: readonly Node[],
  ...steps: ReadonlyArray<
    readonly [string, Parameters<ReturnType<typeof createEditor>['update']>[0]]
  >
) => {
  const editor = createEditor({
    initialValue: structuredClone(value) as never,
    plugins: [
      plugin,
      createAuthoredPlugin({
        authorId: 'ann',
        intent: 'propose',
        now: () => 1,
      }),
    ] as never,
  });

  for (const [change, step] of steps) {
    authoredTestApi(editor).propose(change, step as never);
  }

  return expandedChildren(editor) as readonly Node[];
};

const Titled = define('decide-titled', {
  elements: { h1: { content: textMin1() }, paragraph: { content: textMin1() } },
  root: c.prefix([{ element: 'h1' }], blocks('paragraph', 'h1')),
});
const cells = (options: object) => ({
  cell: { content: textMin1() },
  group: { content: c.type('cell', options) },
  paragraph: { content: textMin1() },
  wrapper: { content: c.type('cell', { min: 1 }) },
});
const Grid = define('decide-grid', {
  elements: cells({ min: 2 }),
  root: blocks('paragraph', 'group', 'cell'),
});
const WrappedGrid = define('decide-wrapped-grid', {
  elements: {
    ...cells({ min: 2 }),
    group: {
      content: c.types(['cell', 'wrapper'], {
        default: { type: 'cell' },
        min: 2,
      }),
    },
  },
  root: blocks('paragraph', 'group', 'cell'),
});
const rows = (scope: 'grandparent' | 'parent' | null) =>
  define(`decide-rows-${scope}`, {
    elements: {
      box: { content: c.type('group', { min: 1 }) },
      group: { content: c.type('row', { min: 1 }) },
      paragraph: { content: c.text() },
      row: { content: c.text() },
    },
    ...(scope
      ? {
          properties: [
            schema.elementProperty(
              'role',
              property.string({ default: 'nested' }),
              {
                target: target.and(
                  target.type('row'),
                  scope === 'parent'
                    ? target.parent(target.type('group'))
                    : target.parent(target.parent(target.type('box')))
                ),
              }
            ),
          ],
        }
      : {}),
    root: blocks('paragraph', 'group', 'box'),
  });
const Columns = define('decide-columns', {
  elements: {
    column: { content: c.type('paragraph', { min: 1 }) },
    column_group: { content: c.type('column', { min: 2 }) },
    paragraph: { content: c.text() },
  },
  root: blocks('paragraph', 'column_group'),
});
const Linked = define('decide-linked', {
  elements: {
    link: { content: textMin1(), inline: true },
    paragraph: { content: c.any([c.text(), c.type('link')]) },
  },
  root: blocks('paragraph'),
});
const Shapes = define('decide-shapes', {
  elements: {
    mix: {
      content: c.any([c.text(), c.type('x')], {
        default: { type: 'x' },
        min: 1,
      }),
    },
    paragraph: { content: c.text() },
    t0: { content: c.text() },
    x: { content: c.text() },
  },
  root: blocks('paragraph', 't0', 'mix'),
});

const Typed = define('decide-typed', {
  elements: {
    cell: { content: c.text() },
    narrow: { content: c.type('cell', { min: 2 }) },
    paragraph: { content: c.text() },
    row: { content: c.text() },
    wide: {
      content: c.types(['cell', 'row'], { default: { type: 'row' }, min: 2 }),
    },
  },
  root: blocks('paragraph', 'narrow', 'wide'),
});

const Lifted = define('decide-lifted', {
  elements: {
    group: {
      content: c.types(['row', 'wrapper'], {
        default: { type: 'row' },
        min: 1,
      }),
    },
    paragraph: { content: c.text() },
    row: { content: c.text() },
    wrapper: { content: c.type('row', { min: 1 }) },
  },
  properties: [
    schema.elementProperty('role', property.string({ default: 'nested' }), {
      target: target.and(
        target.type('row'),
        target.parent(target.type('group'))
      ),
    }),
  ],
  root: blocks('paragraph', 'group', 'row'),
});

const Emptied = define('decide-emptied', {
  elements: {
    cell: { content: c.text() },
    h1: { content: textMin1() },
    item: { content: textMin1() },
    list: { content: c.type('item', { min: 1 }) },
    mix: { content: c.prefix([{ element: 'cell' }], c.text()) },
    mixes: { content: c.type('mix', { min: 1 }) },
    nest: {
      content: c.types(['paragraph', 'quote'], {
        default: { type: 'paragraph' },
        min: 1,
      }),
    },
    note: { content: c.type('paragraph', { min: 1 }) },
    pair: { content: c.type('paragraph', { min: 2 }) },
    paragraph: { content: textMin1() },
    quote: { content: c.type('paragraph', { min: 1 }) },
    slot: {
      content: c.prefix([{ element: 'paragraph' }], c.text({ max: 0 })),
    },
  },
  properties: [
    schema.textProperty('bold', property.boolean()),
    schema.elementProperty('role', property.string({ default: 'inner' }), {
      target: target.and(
        target.type('paragraph'),
        target.parent(target.type('note'))
      ),
    }),
  ],
  root: blocks(
    'paragraph',
    'h1',
    'list',
    'mix',
    'mixes',
    'nest',
    'note',
    'pair',
    'quote',
    'slot'
  ),
});

const lead = el('paragraph', t('p'));
const grid = () => [lead, el('group', el('cell', t('a')), el('cell', t('b')))];

describe('authored review tree decisions that complete', () => {
  it('accepts and rejects every gesture of probe 1 as Editing does, without masking empty blocks', () => {
    // `refused`: Suggesting refuses deleting every character, because the
    // line anchors it keeps beside the struck texts overflow the maximum.
    const shapes: Record<
      string,
      Readonly<{
        blocks?: boolean;
        elements: object;
        refused?: boolean;
        start: Node[];
      }>
    > = {
      'inline default min 2 max 3': {
        elements: {
          el: {
            content: c.any([c.text(), c.type('xi')], {
              default: { type: 'xi' },
              max: 3,
              min: 2,
            }),
          },
          xi: { content: textMin1(), inline: true },
        },
        refused: true,
        start: [t('a'), el('xi', t('q')), t('b')],
      },
      'inline default min 3 max 3': {
        elements: {
          el: {
            content: c.any([c.text(), c.type('xi')], {
              default: { type: 'xi' },
              max: 3,
              min: 3,
            }),
          },
          xi: { content: textMin1(), inline: true },
        },
        refused: true,
        start: [t('a'), el('xi', t('q')), t('b')],
      },
      'mixed block default': {
        elements: {
          el: {
            content: c.any([c.text(), c.type('xb')], {
              default: { type: 'xb' },
              min: 1,
            }),
          },
          xb: { content: c.text() },
        },
        start: [t('abc')],
      },
      'mixed inline default': {
        elements: {
          el: {
            content: c.any([c.text(), c.type('xi')], {
              default: { type: 'xi' },
              min: 1,
            }),
          },
          xi: { content: textMin1(), inline: true },
        },
        start: [t('abc')],
      },
      'open content': {
        elements: { el: { content: c.open() } },
        start: [t('abc')],
      },
      'prefix no text room': {
        blocks: true,
        elements: {
          el: {
            content: c.prefix([{ element: 'header' }], c.text({ max: 0 })),
          },
          header: { content: c.text() },
        },
        start: [el('header', t('h'))],
      },
      'prefix then text': {
        elements: {
          el: { content: c.prefix([{ element: 'header' }], c.text()) },
          header: { content: c.text() },
        },
        start: [el('header', t('h')), t('abc')],
      },
      'text min 0': {
        elements: { el: { content: c.text() } },
        start: [t('abc')],
      },
      'text min 1': {
        elements: { el: { content: textMin1() } },
        start: [t('abc')],
      },
      'block container': {
        blocks: true,
        elements: {
          el: { content: c.type('para', { min: 1 }) },
          para: { content: c.text() },
        },
        start: [el('para', t('abc'))],
      },
    };
    const gestures: Record<
      string,
      (
        children: readonly Node[]
      ) => Parameters<ReturnType<typeof createEditor>['update']>[0]
    > = {
      'deleting every character': (children) => (tx) => {
        const last = children.length - 1;
        const lastNode = children[last];
        const end =
          lastNode.text === undefined
            ? {
                offset: lastNode.children?.[0]?.text?.length ?? 0,
                path: [1, last, 0],
              }
            : { offset: lastNode.text.length, path: [1, last] };

        tx.text.delete({
          at: {
            anchor: {
              offset: 0,
              path: [
                1,
                children.findIndex((child) => child.text !== undefined),
              ],
            },
            focus: end,
          },
        });
      },
      'removing every child': (children) => (tx) => {
        for (let index = children.length - 1; index >= 0; index -= 1) {
          tx.nodes.remove({ at: [1, index] });
        }
      },
    };

    for (const [name, shape] of Object.entries(shapes)) {
      const plugin = define(`decide-p1-${name.replaceAll(' ', '-')}`, {
        elements: { paragraph: { content: c.text() }, ...shape.elements },
        root: blocks('paragraph', 'el'),
      });
      const start = [lead, el('el', ...shape.start)];

      for (const [gesture, step] of Object.entries(gestures)) {
        if (
          gesture === 'deleting every character' &&
          (shape.blocks || shape.refused)
        ) {
          continue;
        }

        const recorded = suggesting(plugin, start, ['s1', step(shape.start)]);

        assert.deepEqual(
          plain(
            decided(plugin, recorded, { action: 'accept', changes: ['s1'] })
              .children
          ),
          editing(plugin, start, step(shape.start)),
          `${name}, ${gesture}: accepting differs from Editing`
        );
        assert.deepEqual(
          plain(
            decided(plugin, recorded, { action: 'reject', changes: ['s1'] })
              .children
          ),
          start,
          `${name}, ${gesture}: rejecting differs from the start`
        );
      }
    }
  });

  it('applies the scoped default of a row it builds, as Editing does (probe 3)', () => {
    const Scoped = rows('parent');
    const row = { children: [t('x')], role: 'nested', type: 'row' };

    assert.deepEqual(
      plain(
        decided(Scoped, [lead, el('group', whole(row, 'delete', 'bob:1'))], {
          action: 'accept',
          changes: ['bob:1'],
        }).children
      ),
      editing(Scoped, [lead, el('group', row)], (tx) =>
        tx.nodes.remove({ at: [1, 0] })
      )
    );
  });

  it('gives Editing’s result for two changes that empty one element, in each order and as a batch (probe 4)', () => {
    for (const [type, children, steps] of [
      [
        't0',
        [t('a'), t('b', { bold: true })],
        [
          (tx) =>
            tx.text.delete({
              at: {
                anchor: { offset: 0, path: [1, 0] },
                focus: { offset: 1, path: [1, 0] },
              },
            }),
          (tx) => tx.nodes.remove({ at: [1, 0] }),
        ],
      ],
      [
        'mix',
        [el('x', t('q')), t('z')],
        [
          (tx) => tx.nodes.remove({ at: [1, 0] }),
          (tx) => tx.nodes.remove({ at: [1, 0] }),
        ],
      ],
    ] as const) {
      const value = [
        lead,
        el(
          type,
          whole(children[0], 'delete', 'a:1'),
          whole(children[1], 'delete', 'b:1')
        ),
      ];
      const expected = editing(Shapes, [lead, el(type, ...children)], ...steps);

      for (const decisions of [
        [{ action: 'accept', changes: ['a:1', 'b:1'] }],
        [
          { action: 'accept', changes: ['a:1'] },
          { action: 'accept', changes: ['b:1'] },
        ],
        [
          { action: 'accept', changes: ['b:1'] },
          { action: 'accept', changes: ['a:1'] },
        ],
      ] as const) {
        assert.deepEqual(
          plain(decided(Shapes, value, ...decisions).children),
          expected
        );
      }
    }
  });

  it('completes a group below its minimum in every schedule as Editing does (probe 8)', () => {
    const value = [
      lead,
      el(
        'group',
        whole(el('cell', t('a')), 'delete', 'a:1'),
        whole(el('cell', t('b')), 'delete', 'b:1')
      ),
    ];
    const both = editing(
      Grid,
      grid(),
      (tx) => tx.nodes.remove({ at: [1, 0] }),
      (tx) => tx.nodes.remove({ at: [1, 0] })
    );
    const onlyA = editing(Grid, grid(), (tx) =>
      tx.nodes.remove({ at: [1, 0] })
    );

    for (const [decisions, expected] of [
      [[{ action: 'accept', changes: ['a:1', 'b:1'] }], both],
      [
        [
          { action: 'accept', changes: ['a:1'] },
          { action: 'accept', changes: ['b:1'] },
        ],
        both,
      ],
      [
        [
          { action: 'accept', changes: ['b:1'] },
          { action: 'accept', changes: ['a:1'] },
        ],
        both,
      ],
      [
        [
          { action: 'accept', changes: ['a:1'] },
          { action: 'reject', changes: ['b:1'] },
        ],
        onlyA,
      ],
      [
        [
          { action: 'reject', changes: ['b:1'] },
          { action: 'accept', changes: ['a:1'] },
        ],
        onlyA,
      ],
    ] as const) {
      assert.deepEqual(
        plain(decided(Grid, value, ...decisions).children),
        expected
      );
    }
  });

  it('keeps a rejected split in place when the first container the decision empties or lifts before it is not one completion rebuilds, outside any prefix slot, as one empty line with exactly the split block’s properties, or when the split block carries a format tag', () => {
    const split = (node: Node, ...authored: object[]) => ({
      ...node,
      authored: [...authored, mark('split', 'b:1')],
    });
    const p = (text: string) => el('paragraph', t(text));
    const accept = { action: 'accept', changes: ['a:1'] } as const;
    const reject = { action: 'reject', changes: ['a:1'] } as const;
    const cases = [
      [
        [
          el('quote', whole(p('a'), 'delete', 'a:1')),
          el('list', whole(el('item', t('c')), 'delete', 'a:1')),
          split(p('b')),
        ],
        [accept],
        [el('quote', p('')), el('list', el('item', t(''))), p('b')],
      ],
      [
        [
          el(
            'pair',
            whole(p('a'), 'delete', 'a:1'),
            whole(p('c'), 'delete', 'a:1')
          ),
          split(p('b')),
        ],
        [accept],
        [el('pair', p(''), p('')), p('b')],
      ],
      [
        [el('slot', whole(p('a'), 'insert', 'a:1')), split(p('b'))],
        [reject],
        [el('slot', p('')), p('b')],
      ],
      [
        [
          el(
            'mixes',
            whole(el('mix', el('cell', t('a')), t('a')), 'delete', 'a:1')
          ),
          split(el('mix', el('cell', t('b')), t('b'))),
        ],
        [accept],
        [
          el('mixes', el('mix', el('cell', t('')), t(''))),
          el('mix', el('cell', t('b')), t('b')),
        ],
      ],
      [
        [
          el('quote', whole(p('a'), 'insert', 'b:1')),
          split(p('b'), {
            ...mark('format', 'b:1'),
            before: 'h1',
            id: 'b-tag:1',
            key: 'type',
            write: { kind: 'set', value: 'paragraph' },
          }),
        ],
        [],
        [el('quote', p('')), el('h1', t('b'))],
      ],
      [
        [
          el('note', whole({ ...p('a'), role: 'inner' }, 'delete', 'a:1')),
          split(p('b')),
        ],
        [accept],
        [el('note', { ...p(''), role: 'inner' }), p('b')],
      ],
      [
        [
          el('quote', whole(p('x'), 'delete', 'a:1')),
          el('nest', {
            ...el('quote', whole(p('a'), 'delete', 'a:1')),
            authored: [mark('unwrap', 'a:1')],
          }),
          split(p('b')),
        ],
        [accept],
        [el('quote', p('')), el('nest', p('')), p('b')],
      ],
    ] as const;

    for (const [value, decisions, expected] of cases) {
      const { children, results } = decided(Emptied, value, [
        ...decisions,
        { action: 'reject', changes: ['b:1'] },
      ]);

      assert.deepEqual(
        results.map(({ status }) => status),
        ['applied']
      );
      assert.deepEqual(plain(children), expected);
    }
  });

  const keyed = {
    elements: {
      paragraph: { content: textMin1() },
      quote: { content: c.type('paragraph', { min: 1 }) },
    },
    properties: [
      schema.elementProperty('key', property.string(), {
        role: 'metadata',
        split: 'drop',
        target: target.group('element'),
      }),
    ],
    root: blocks('paragraph', 'quote'),
  };
  const Keyed = define('decide-emptied-keyed', keyed);
  const KeyedKeepingUnknown = define('decide-emptied-keyed-unknown', {
    ...keyed,
    root: c.not(c.text()),
    unknown: 'preserve',
  });
  const landsKeyed = (splitMarks: readonly object[], plugin = Keyed) => {
    const value = [
      el(
        'quote',
        whole({ ...el('paragraph', t('a')), key: 'k1' }, 'delete', 'a:1')
      ),
      { ...el('paragraph', t('b')), authored: splitMarks, key: 'k2' },
    ];
    const accept = { action: 'accept', changes: ['a:1'] } as const;
    const reject = { action: 'reject', changes: ['b:1'] } as const;
    const together = decided(plugin, value, [accept, reject]);
    const inTurn = decided(plugin, value, accept, reject);

    assert.deepEqual(
      [...together.results, ...inTurn.results].map(({ status }) => status),
      ['applied', 'applied', 'applied']
    );
    assert.deepEqual(plain(inTurn.children), plain(together.children));

    return plain(together.children);
  };

  it('lands a rejected split in the quote the decision empties whatever the two lines hold under a key every element holds, as accepting the deletion first does', () => {
    assert.deepEqual(landsKeyed([mark('split', 'b:1')]), [
      el('quote', el('paragraph', t('b'))),
    ]);
  });

  it('lands a rejected split in the quote the decision empties while another suggestion sets that key on the split line, as accepting the deletion first does', () => {
    assert.deepEqual(
      landsKeyed([
        mark('split', 'b:1'),
        {
          ...mark('format', 'c:1'),
          before: 'kb',
          id: 'c-key',
          key: 'key',
          write: { kind: 'set', value: 'k2' },
        },
      ]),
      [el('quote', el('paragraph', t('b')))]
    );
  });

  it('lands a rejected split in the quote the decision empties, keeping its own value of a key a retype to an unknown type can drop, as accepting the deletion first does', () => {
    assert.deepEqual(landsKeyed([mark('split', 'b:1')], KeyedKeepingUnknown), [
      el('quote', { ...el('paragraph', t('b')), key: 'k2' }),
    ]);
  });

  it('keeps the split line’s content value whether the deletion before it is decided with the rejected split or first, when another type holds that key as metadata', () => {
    const Tokens = define('decide-emptied-token', {
      elements: {
        heading: { content: textMin1() },
        paragraph: { content: textMin1() },
        pbox: { content: c.type('paragraph', { min: 1 }) },
        quote: { content: c.type('heading', { min: 1 }) },
      },
      properties: [
        schema.elementProperty('token', property.string(), {
          role: 'metadata',
          target: target.type('paragraph'),
        }),
        schema.elementProperty('token', property.string(), {
          role: 'content',
          target: target.type('heading'),
        }),
      ],
      root: blocks('quote', 'heading', 'pbox'),
    });
    const value = [
      el('quote', whole(el('heading', t('a')), 'delete', 'a:1')),
      {
        ...el('heading', t('b')),
        authored: [mark('split', 'b:1')],
        token: 'two',
      },
    ];
    const accept = { action: 'accept', changes: ['a:1'] } as const;
    const reject = { action: 'reject', changes: ['b:1'] } as const;
    const tokenOfB = (nodes: readonly Node[]): unknown =>
      nodes
        .map((node) =>
          node.children?.some((child) => child.text === 'b')
            ? node.token
            : tokenOfB(node.children ?? [])
        )
        .find((token) => token !== undefined);

    assert.deepEqual(
      [
        tokenOfB(decided(Tokens, value, [accept, reject]).children),
        tokenOfB(decided(Tokens, value, accept, reject).children),
      ],
      ['two', 'two']
    );
  });

  it('rejoins a rejected split into the quote the deletion before it empties in both orders, the line keeping its content value and its pending tag, under a content key a split drops', () => {
    const KeyedContent = define('decide-emptied-keyed-content', {
      ...keyed,
      properties: [
        schema.elementProperty('key', property.string(), {
          role: 'content',
          split: 'drop',
          target: target.group('element'),
        }),
      ],
    });
    const tag = {
      ...mark('format', 'c:1'),
      before: 'kb',
      id: 'c-key',
      key: 'key',
      write: { kind: 'set', value: 'k2' },
    };
    const value = [
      el(
        'quote',
        whole({ ...el('paragraph', t('a')), key: 'k1' }, 'delete', 'a:1')
      ),
      {
        ...el('paragraph', t('b')),
        authored: [mark('split', 'b:1'), tag],
        key: 'k2',
      },
    ];
    const accept = { action: 'accept', changes: ['a:1'] } as const;
    const reject = { action: 'reject', changes: ['b:1'] } as const;
    const line = { ...el('paragraph', t('b')), authored: [tag], key: 'k2' };

    assert.deepEqual(
      [
        decided(KeyedContent, value, [accept, reject]).children,
        decided(KeyedContent, value, accept, reject).children,
      ],
      [[el('quote', line)], [el('quote', line)]]
    );
  });

  it('rejoins a rejected split into the quote the deletion before it empties in both orders, the line keeping its content value and its pending tag, when another type holds that key as metadata and both drop it on split', () => {
    const Tokens = define('decide-emptied-token-dropped', {
      elements: {
        heading: { content: textMin1() },
        paragraph: { content: textMin1() },
        pbox: { content: c.type('paragraph', { min: 1 }) },
        quote: { content: c.type('heading', { min: 1 }) },
      },
      properties: [
        schema.elementProperty('token', property.string(), {
          role: 'metadata',
          split: 'drop',
          target: target.type('paragraph'),
        }),
        schema.elementProperty('token', property.string(), {
          role: 'content',
          split: 'drop',
          target: target.type('heading'),
        }),
      ],
      root: blocks('quote', 'heading', 'pbox'),
    });
    const tag = {
      ...mark('format', 'c:1'),
      before: 'one',
      id: 'c-token',
      key: 'token',
      write: { kind: 'set', value: 'two' },
    };
    const value = [
      el('quote', whole(el('heading', t('a')), 'delete', 'a:1')),
      {
        ...el('heading', t('b')),
        authored: [mark('split', 'b:1'), tag],
        token: 'two',
      },
    ];
    const accept = { action: 'accept', changes: ['a:1'] } as const;
    const reject = { action: 'reject', changes: ['b:1'] } as const;
    const line = { ...el('heading', t('b')), authored: [tag], token: 'two' };

    assert.deepEqual(
      [
        decided(Tokens, value, [accept, reject]).children,
        decided(Tokens, value, accept, reject).children,
      ],
      [[el('quote', line)], [el('quote', line)]]
    );
  });

  it('rejoins a rejected split past a quote whose unwrap it decides with the deletion of the quote’s paragraph, as deciding the two in turn does', () => {
    const value = [
      el('paragraph', t('x')),
      {
        ...el('quote', whole(el('paragraph', t('a')), 'delete', 'a:1')),
        authored: [mark('unwrap', 'a:1')],
      },
      whole(el('paragraph', t('z')), 'delete', 'a:1'),
      { ...el('paragraph', t('b')), authored: [mark('split', 'b:1')] },
    ];
    const accept = { action: 'accept', changes: ['a:1'] } as const;
    const reject = { action: 'reject', changes: ['b:1'] } as const;

    for (const decisions of [[[accept, reject]], [accept, reject]]) {
      const { children, results } = decided(Emptied, value, ...decisions);

      assert.deepEqual(
        results.map(({ status }) => status),
        decisions.map(() => 'applied')
      );
      assert.deepEqual(plain(children), [el('paragraph', t('xb'))]);
    }
  });

  it('keeps a column group after accepting the deletion of one of its two columns', () => {
    const column = (text: string) => el('column', el('paragraph', t(text)));
    const start = [el('column_group', column('left'), column('right'))];

    assert.deepEqual(
      plain(
        decided(
          Columns,
          [
            el(
              'column_group',
              column('left'),
              whole(column('right'), 'delete', 'bob:1')
            ),
          ],
          { action: 'accept', changes: ['bob:1'] }
        ).children
      ),
      editing(Columns, start, (tx) => tx.nodes.remove({ at: [0, 1] }))
    );
  });

  it('merges the neighbours of an accepted struck word, and keeps the spacer before an inline element', () => {
    const link = el('link', t('l'));

    assert.deepEqual(
      plain(
        decided(
          Linked,
          [
            el(
              'paragraph',
              t('a '),
              whole(t('mid'), 'delete', 'bob:1'),
              t(' b')
            ),
          ],
          { action: 'accept', changes: ['bob:1'] }
        ).children
      ),
      [el('paragraph', t('a  b'))]
    );
    assert.deepEqual(
      plain(
        decided(
          Linked,
          [el('paragraph', whole(t('x'), 'delete', 'bob:1'), link, t('y'))],
          { action: 'accept', changes: ['bob:1'] }
        ).children
      ),
      [el('paragraph', t(''), link, t('y'))]
    );
  });

  it('reads a completed element through a fragment as the full projection does', () => {
    const value = {
      children: [
        lead,
        el(
          'group',
          whole(el('cell', t('a')), 'delete', 'a:1'),
          el('cell', t('b'))
        ),
      ],
    };
    const editor = reviewing(Grid, value.children);
    const projected = authoredTestApi(editor).project('proposed').value
      .children as readonly Node[];

    assert.deepEqual(
      projectAuthoredFragment(
        value as never,
        'proposed',
        [[1]],
        authoredResolveSchemaOf(editor as never)
      ),
      [projected[1]]
    );
  });

  it('waits on an ancestor’s pending unwrap when the row it builds reads its site past its parent', () => {
    const row = { ...el('row', t('x')), role: 'nested' };

    assert.deepEqual(
      decided(
        rows('grandparent'),
        [
          lead,
          {
            authored: [mark('unwrap', 'carol:1')],
            children: [el('group', whole(row, 'delete', 'bob:1'))],
            type: 'box',
          },
        ],
        { action: 'accept', changes: ['bob:1'] }
      ).results[0],
      { ids: ['bob:1'], status: 'blocked', with: ['carol:1'] }
    );
  });

  it('decides a grid’s cell deletion recorded after a pending unwrap of its group by the unwrap’s outcome', () => {
    const recorded = suggesting(
      Grid,
      grid(),
      ['u:1', (tx) => tx.nodes.unwrap({ at: [1] })],
      ['d:1', (tx) => tx.nodes.remove({ at: [1, 0] })]
    );

    assert.deepEqual(
      decided(Grid, recorded, { action: 'accept', changes: ['d:1'] })
        .results[0],
      { ids: ['d:1'], status: 'blocked', with: ['u:1'] }
    );
    assert.deepEqual(
      plain(
        decided(Grid, recorded, { action: 'accept', changes: ['u:1', 'd:1'] })
          .children
      ),
      editing(
        Grid,
        grid(),
        (tx) => tx.nodes.unwrap({ at: [1] }),
        (tx) => tx.nodes.remove({ at: [1] })
      )
    );
    assert.deepEqual(
      plain(
        decided(
          Grid,
          recorded,
          { action: 'reject', changes: ['u:1'] },
          { action: 'accept', changes: ['d:1'] }
        ).children
      ),
      editing(Grid, grid(), (tx) => tx.nodes.remove({ at: [1, 0] }))
    );
  });

  it('waits on a sibling wrapper’s pending unwrap, and on its group’s pending deletion, before building a cell', () => {
    const wrapped = [
      lead,
      el(
        'group',
        {
          authored: [mark('unwrap', 'u:1')],
          children: [el('cell', t('a'))],
          type: 'wrapper',
        },
        whole(el('cell', t('b')), 'delete', 'd:1')
      ),
    ];
    const struckGroup = [
      lead,
      {
        authored: [mark('delete', 'g:1')],
        children: [
          whole(el('cell', t('a')), 'delete', 'd:1'),
          el('cell', t('b')),
        ],
        type: 'group',
      },
    ];

    assert.deepEqual(
      decided(WrappedGrid, wrapped, { action: 'accept', changes: ['d:1'] })
        .results[0],
      { ids: ['d:1'], status: 'blocked', with: ['u:1'] }
    );
    assert.deepEqual(
      decided(Grid, struckGroup, { action: 'accept', changes: ['d:1'] })
        .results[0],
      { ids: ['d:1'], status: 'blocked', with: ['g:1'] }
    );
  });

  it('waits on the pending insertions before a required title it would rebuild', () => {
    const titleAt = [
      whole(el('h1', t('X')), 'insert', 'i:1'),
      whole(el('paragraph', t('Y')), 'insert', 'j:1'),
      el('h1', t('Title')),
      el('paragraph', t('Q')),
    ];

    assert.deepEqual(
      decided(Titled, titleAt, { action: 'reject', changes: ['i:1'] })
        .results[0],
      { ids: ['i:1'], status: 'blocked', with: ['j:1'] }
    );
    for (const decisions of [
      [{ action: 'reject', changes: ['i:1', 'j:1'] }],
      [
        { action: 'reject', changes: ['j:1'] },
        { action: 'reject', changes: ['i:1'] },
      ],
    ] as const) {
      assert.deepEqual(plain(decided(Titled, titleAt, ...decisions).children), [
        el('h1', t('Title')),
        el('paragraph', t('Q')),
      ]);
    }
    assert.throws(
      () =>
        editing(Titled, [el('h1', t('Title')), el('paragraph', t('Q'))], (tx) =>
          tx.nodes.insert(el('paragraph', t('Y')), { at: [0] })
        ),
      /cannot contain "paragraph"/
    );
    assert.deepEqual(
      decided(Titled, titleAt, [
        { action: 'reject', changes: ['i:1'] },
        { action: 'accept', changes: ['j:1'] },
      ]).results[0],
      { ids: ['i:1', 'j:1'], status: 'invalid' }
    );

    const struck = [
      whole(el('h1', t('X')), 'insert', 'i:1'),
      whole(el('h1', t('Title')), 'delete', 'd:1'),
      whole(el('paragraph', t('P')), 'delete', 'b:1'),
      el('h1', t('Body')),
      el('paragraph', t('Q')),
    ];

    assert.deepEqual(
      decided(Titled, struck, { action: 'accept', changes: ['d:1'] })
        .results[0],
      { ids: ['d:1'], status: 'blocked', with: ['i:1'] }
    );

    const afterTitle = decided(
      Titled,
      struck,
      { action: 'reject', changes: ['i:1'] },
      { action: 'accept', changes: ['d:1'] }
    );

    assert.deepEqual(afterTitle.results[1]?.status, 'applied');
    assert.deepEqual(plain(afterTitle.children), [
      el('h1', t('')),
      el('paragraph', t('P')),
      el('h1', t('Body')),
      el('paragraph', t('Q')),
    ]);

    const steps: readonly Decision[] = [
      { action: 'reject', changes: ['i:1'] },
      { action: 'accept', changes: ['d:1'] },
      { action: 'accept', changes: ['b:1'] },
    ];
    const orders = [
      [0, 1, 2],
      [0, 2, 1],
      [2, 0, 1],
    ];

    for (const order of orders) {
      assert.deepEqual(
        plain(
          decided(Titled, struck, ...order.map((index) => steps[index]))
            .children
        ),
        [el('h1', t('')), el('h1', t('Body')), el('paragraph', t('Q'))],
        `order ${order.join(', ')}`
      );
    }
  });

  it('decides a title’s deletion beside a rejected title insertion when the title slot declares a required property its grandparent scopes', () => {
    const Roled = define('decide-roled', {
      elements: {
        box: { content: c.type('group', { min: 1 }) },
        group: {
          content: c.prefix(
            [{ element: 'heading', properties: { role: 'title' } }],
            blocks('paragraph', 'heading')
          ),
        },
        heading: { content: c.text() },
        paragraph: { content: c.text() },
      },
      properties: [
        schema.elementProperty('role', property.string({ required: true }), {
          target: target.and(
            target.type('heading'),
            target.parent(target.parent(target.type('box')))
          ),
        }),
      ],
      root: blocks('paragraph', 'box'),
    });
    const title = (text: string) => ({
      ...el('heading', t(text)),
      role: 'title',
    });
    const start = [
      el('box', el('group', title('Title'), el('paragraph', t('body')))),
    ];
    const recorded = suggesting(
      Roled,
      start,
      ['i:1', (tx) => tx.nodes.insert(title('New'), { at: [0, 0, 0] })],
      ['d:1', (tx) => tx.nodes.remove({ at: [0, 0, 1] })]
    );

    assert.deepEqual(
      plain(
        decided(Roled, recorded, [
          { action: 'reject', changes: ['i:1'] },
          { action: 'accept', changes: ['d:1'] },
        ]).children
      ),
      editing(Roled, start, (tx) => tx.nodes.remove({ at: [0, 0, 0] }))
    );
  });

  it('gives a cell it builds inside a pending insertion that insertion, so rejecting the insertion after removes the group as a batch does', () => {
    const Pair = define('decide-pair', {
      elements: cells({ max: 2, min: 2 }),
      root: blocks('paragraph', 'group', 'cell'),
    });
    const review = [
      lead,
      whole(
        el(
          'group',
          whole(el('cell', t('a')), 'delete', 'bob:1'),
          el('cell', t('b'))
        ),
        'insert',
        'ann:1'
      ),
    ];
    const accept = { action: 'accept', changes: ['bob:1'] } as const;
    const reject = { action: 'reject', changes: ['ann:1'] } as const;

    assert.deepEqual(
      [
        plain(decided(Pair, review, accept, reject).children),
        plain(decided(Pair, review, [accept, reject]).children),
      ],
      [[lead], [lead]]
    );
  });

  it('fills a group whose type its transaction changes, so accepting a later unwrap of it gives Editing’s cells', () => {
    const Sized = define('decide-sized', {
      elements: {
        cell: { content: c.text() },
        narrow: { content: c.type('cell', { min: 2 }) },
        paragraph: { content: c.text() },
        wide: { content: c.type('cell', { min: 1 }) },
      },
      root: blocks('paragraph', 'wide', 'narrow', 'cell'),
    });
    const start = [lead, el('wide', el('cell', t('a')), el('cell', t('b')))];
    const narrow: Parameters<ReturnType<typeof createEditor>['update']>[0] = (
      tx
    ) => {
      tx.nodes.set({ type: 'narrow' }, { at: [1] });
      tx.nodes.remove({ at: [1, 0] });
    };
    const unwrap: Parameters<ReturnType<typeof createEditor>['update']>[0] = (
      tx
    ) => tx.nodes.unwrap({ at: [1] });
    const recorded = suggesting(Sized, start, ['d:1', narrow], ['u:1', unwrap]);

    assert.deepEqual(
      plain(
        decided(Sized, recorded, {
          action: 'accept',
          changes: ['d:1', 'u:1'],
        }).children
      ),
      editing(Sized, start, narrow, unwrap)
    );
  });

  it('drops a property its new site refuses from a row an accepted unwrap lifts out', () => {
    const review = [
      lead,
      {
        ...el('group', { ...el('row', t('x')), role: 'nested' }),
        authored: [mark('unwrap', 'carol:1')],
      },
    ];
    const result = decided(Lifted, review, {
      action: 'accept',
      changes: ['carol:1'],
    });

    assert.deepEqual(result.results[0], {
      ids: ['carol:1'],
      status: 'applied',
    });
    assert.deepEqual(plain(result.children), [lead, el('row', t('x'))]);
  });

  it('rests a fill on the pending type change under an Editing one, not on the Editing write', () => {
    const editor = createEditor({
      initialValue: structuredClone([
        lead,
        el('wide', el('cell', t('a')), el('cell', t('b'))),
      ]) as never,
      plugins: [
        Typed,
        createAuthoredPlugin({
          authorId: 'ann',
          intent: 'propose',
          now: () => 1,
        }),
      ] as never,
    });
    const api = authoredTestApi(editor);

    api.propose('k:1', ((tx) =>
      tx.nodes.set({ type: 'narrow' }, { at: [1] })) as never);
    api.setIntent('edit');
    editor.update((tx) => tx.nodes.set({ type: 'wide' } as never, { at: [1] }));
    api.setIntent('propose');
    api.propose('a:1', ((tx) => tx.nodes.remove({ at: [1, 0] })) as never);
    const fill = (expandedChildren(editor) as readonly Node[])[1]?.children?.at(
      -1
    );

    assert.equal(fill?.type, 'row');
    assert.deepEqual(
      (
        (fill?.authored ?? []) as ReadonlyArray<{
          change: string;
          kind: string;
        }>
      )
        .filter(({ kind }) => kind === 'insert')
        .map(({ change }) => change)
        .sort(),
      ['a:1', 'k:1']
    );
  });

  it('waits on a pending change of the element’s own type before building into it', () => {
    const start = [lead, el('wide', el('cell', t('a')), el('cell', t('b')))];
    const recorded = suggesting(
      Typed,
      start,
      ['k:1', (tx) => tx.nodes.set({ type: 'narrow' }, { at: [1] })],
      ['a:1', (tx) => tx.nodes.remove({ at: [1, 0] })],
      ['b:1', (tx) => tx.nodes.remove({ at: [1, 1] })]
    );
    const onlyB = [
      { action: 'accept', changes: ['b:1'] },
      { action: 'reject', changes: ['a:1'] },
    ] as const;
    const expected = editing(Typed, start, (tx) =>
      tx.nodes.remove({ at: [1, 1] })
    );

    assert.deepEqual(decided(Typed, recorded, onlyB).results[0], {
      ids: ['b:1', 'a:1'],
      status: 'blocked',
      with: ['k:1'],
    });
    assert.deepEqual(
      plain(
        decided(Typed, recorded, [
          ...onlyB,
          { action: 'reject', changes: ['k:1'] },
        ]).children
      ),
      expected
    );
    assert.deepEqual(
      plain(
        decided(Typed, recorded, { action: 'reject', changes: ['k:1'] }, onlyB)
          .children
      ),
      expected
    );
  });
});

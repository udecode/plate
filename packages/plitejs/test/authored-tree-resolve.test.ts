import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  defineEditorSchema,
  property,
  schema,
  target,
} from 'plitejs';
import { history } from 'plitejs/history';

import { createAuthoredPlugin } from '../src/authored/authored';
import { authoredResolveSchemaOf } from '../src/authored/resolve-schema';
import { resolveAuthoredChildren } from '../src/authored/tree/resolve';
import { authoredTestApi, reviewedValue } from './support/authored';

const AT = 1000;
const mark = (
  kind: 'delete' | 'insert' | 'join' | 'split' | 'unwrap' | 'wrap',
  author = 'bob',
  change = `${author}:1`
) => ({ at: AT, author, change, kind });
const paragraph = (...children: Array<Record<string, unknown>>) => ({
  type: 'paragraph',
  children,
});
const heading = (...children: Array<Record<string, unknown>>) => ({
  type: 'heading',
  children,
});
const point = (offset: number, path = [0, 0]) => ({ offset, path });
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
const accept = (id: string) => (change: string) =>
  change === id ? ('accept' as const) : ('keep' as const);
const reject = (id: string) => (change: string) =>
  change === id ? ('reject' as const) : ('keep' as const);

const Columns = defineEditorSchema('columns-schema', {
  elements: {
    column: { content: schema.content.type('paragraph', { min: 1 }) },
    column_group: { content: schema.content.type('column', { min: 2 }) },
    paragraph: { content: schema.content.text() },
  },
  id: 'columns-schema',
  properties: [
    schema.elementProperty('layout', property.string(), {
      target: target.type('column_group'),
    }),
  ],
  root: schema.content.any(
    [schema.content.type('paragraph'), schema.content.type('column_group')],
    { default: { type: 'paragraph' }, min: 1 }
  ),
  unknown: 'reject',
  version: 1,
});

describe('authored review tree decisions', () => {
  const replacement = [
    paragraph(
      { text: 'keep ' },
      { text: 'gone ', authored: [mark('delete')] },
      { text: 'NEW ', authored: [mark('insert')] },
      { text: 'tail' }
    ),
  ];

  it('accepts a replacement: struck text goes and inserted text stays plain', () => {
    assert.deepEqual(
      resolveAuthoredChildren(replacement, accept('bob:1')).children,
      [paragraph({ text: 'keep NEW tail' })]
    );
  });

  it('rejects a replacement: inserted text goes and struck text returns', () => {
    assert.deepEqual(
      resolveAuthoredChildren(replacement, reject('bob:1')).children,
      [paragraph({ text: 'keep gone tail' })]
    );
  });

  it('merges a rejected split back into the previous block', () => {
    const split = [
      paragraph({ text: 'ab' }),
      { ...paragraph({ text: 'cd' }), authored: [mark('split')] },
    ];

    assert.deepEqual(resolveAuthoredChildren(split, reject('bob:1')).children, [
      paragraph({ text: 'abcd' }),
    ]);
  });

  it('rejoins a rejected split with the emptied piece it cut from Alice’s inserted line, not with the line above', () => {
    const rotated = [
      whole(paragraph({ text: 'ab' }), mark('delete', 'alice')),
      whole(paragraph({ text: 'cd' }), mark('delete', 'alice')),
      whole(paragraph({ text: '' }), mark('insert', 'alice')),
      {
        ...paragraph(
          { text: 'N' },
          { text: 'cd', authored: [mark('insert', 'alice')] }
        ),
        authored: [mark('insert', 'alice'), mark('split')],
      },
      whole(paragraph({ text: 'ab' }), mark('insert', 'alice')),
    ];

    assert.deepEqual(
      resolveAuthoredChildren(rotated, () => 'reject').children,
      [
        paragraph({ text: 'ab' }),
        paragraph({ text: 'cd' }),
        paragraph({ text: 'N' }),
      ]
    );
  });

  it('rejoins a rejected split with the piece it cut, past a line Bob inserted between them', () => {
    const moved = [
      paragraph({ text: 'ab' }),
      {
        type: 'quote',
        children: [
          paragraph({ text: 'c' }, { text: 'd', authored: [mark('delete')] }),
          whole(paragraph({ text: '' }), mark('delete')),
          {
            ...whole(paragraph({ text: 'gh' }), mark('insert')),
            authored: [mark('insert'), mark('join')],
          },
          {
            ...paragraph({ text: 'ef', authored: [mark('delete')] }),
            authored: [mark('split', 'alice'), mark('delete')],
          },
        ],
      },
      whole(paragraph({ text: 'gh' }), mark('delete')),
    ];

    assert.deepEqual(resolveAuthoredChildren(moved, () => 'reject').children, [
      paragraph({ text: 'ab' }),
      {
        type: 'quote',
        children: [paragraph({ text: 'cd' }), paragraph({ text: 'ef' })],
      },
      paragraph({ text: 'gh' }),
    ]);
  });

  describe('a join Bob wrote in Editing across lines Alice struck', () => {
    const struck = [
      paragraph({ text: 'ab' }),
      whole(paragraph({ text: 'cd' }), mark('delete', 'alice')),
      whole(paragraph({ text: 'ef' }), mark('delete', 'alice')),
      {
        ...paragraph({ text: 'gh' }),
        authored: [{ at: 0, author: 'bob', change: '~edit:bob', kind: 'join' }],
      },
    ];

    it('stays stored, waiting on nothing, while Alice’s deletion is pending', () => {
      const resolution = resolveAuthoredChildren(struck, () => 'keep');

      assert.deepEqual(
        { blockers: resolution.blockers, children: resolution.children },
        { blockers: [], children: struck }
      );
    });

    it('joins the line before the struck lines when Alice’s deletion is accepted', () => {
      assert.deepEqual(
        resolveAuthoredChildren(struck, accept('alice:1')).children,
        [paragraph({ text: 'abgh' })]
      );
    });

    it('joins the last struck line when Alice’s deletion is rejected', () => {
      assert.deepEqual(
        resolveAuthoredChildren(struck, reject('alice:1')).children,
        [
          paragraph({ text: 'ab' }),
          paragraph({ text: 'cd' }),
          paragraph({ text: 'efgh' }),
        ]
      );
    });
  });

  describe('a line Bob split off a line Alice’s pending join pulls into a quote', () => {
    const piece = {
      ...paragraph({ text: 'd' }),
      authored: [
        { ...mark('split'), follows: JSON.stringify(['alice:1', AT]) },
      ],
    };
    const split = [
      { type: 'quote', children: [paragraph({ text: 'ab' })] },
      { ...paragraph({ text: 'c' }), authored: [mark('join', 'alice')] },
      piece,
    ];

    it('follows the line into the quote, still pending, when only the join is accepted', () => {
      assert.deepEqual(
        resolveAuthoredChildren(split, accept('alice:1')).children,
        [
          {
            type: 'quote',
            children: [paragraph({ text: 'abc' }), piece],
          },
        ]
      );
    });

    it('waits on the join when only the split is accepted', () => {
      assert.deepEqual(
        resolveAuthoredChildren(split, accept('bob:1')).blockers,
        ['alice:1']
      );
    });

    it('follows the line into the quote past a block Carol moved between them', () => {
      const moved = whole(paragraph({ text: 'x' }), mark('insert', 'carol'));

      assert.deepEqual(
        resolveAuthoredChildren(
          [...split.slice(0, 2), moved, piece],
          () => 'accept'
        ).children,
        [
          {
            type: 'quote',
            children: [paragraph({ text: 'abc' }), paragraph({ text: 'd' })],
          },
          paragraph({ text: 'x' }),
        ]
      );
    });

    it('stays outside the quote when the split is accepted and the join rejected', () => {
      assert.deepEqual(
        resolveAuthoredChildren(split, (change) =>
          change === 'bob:1' ? 'accept' : 'reject'
        ).children,
        [
          { type: 'quote', children: [paragraph({ text: 'ab' })] },
          paragraph({ text: 'c' }),
          paragraph({ text: 'd' }),
        ]
      );
    });
  });

  describe('a joining line whose target holds no text', () => {
    const joining = (text: string) => ({
      ...paragraph({ text }),
      authored: [mark('join', 'alice')],
    });

    it('takes the target’s place, before a line moved between them', () => {
      const moved = {
        ...paragraph({ text: 'ef' }),
        authored: [
          {
            ...mark('insert', 'carol'),
            follows: JSON.stringify(['alice:1', AT]),
          },
        ],
      };

      assert.deepEqual(
        resolveAuthoredChildren(
          [paragraph({ text: '' }), moved, joining('cd')],
          () => 'accept'
        ).children,
        [paragraph({ text: 'cd' }), paragraph({ text: 'ef' })]
      );
    });

    it('appears once when the target it replaces took an emptied target’s place', () => {
      const inserted = (text: string) => ({
        authored: [mark('insert', 'alice')],
        text,
      });

      assert.deepEqual(
        resolveAuthoredChildren(
          [
            paragraph(inserted('O')),
            { ...paragraph(inserted('o')), authored: [mark('split', 'alice')] },
            { ...paragraph({ text: 'ef' }), authored: [mark('split')] },
          ],
          () => 'reject'
        ).children,
        [paragraph({ text: 'ef' })]
      );
    });

    it('lands a line moved before it after the line that takes its place when a later join empties it too', () => {
      const moved = {
        ...paragraph({ text: 'gh' }),
        authored: [
          {
            ...mark('insert', 'carol'),
            follows: JSON.stringify(['alice:1', AT]),
          },
        ],
      };

      assert.deepEqual(
        resolveAuthoredChildren(
          [
            paragraph({ text: '' }),
            moved,
            joining(''),
            {
              ...paragraph({ text: 'ef' }),
              authored: [mark('join', 'alice', 'alice:2')],
            },
          ],
          () => 'accept'
        ).children,
        [paragraph({ text: 'ef' }), paragraph({ text: 'gh' })]
      );
    });

    it('takes the target’s place inside the quote that holds it', () => {
      const lines = [
        {
          type: 'quote',
          children: [paragraph({ text: 'ab' }), paragraph({ text: '' })],
        },
        joining('gh'),
      ];

      assert.deepEqual(
        resolveAuthoredChildren(lines, accept('alice:1')).children,
        [
          {
            type: 'quote',
            children: [paragraph({ text: 'ab' }), paragraph({ text: 'gh' })],
          },
        ]
      );
      assert.deepEqual(
        resolveAuthoredChildren(lines, reject('alice:1')).children,
        [lines[0], paragraph({ text: 'gh' })]
      );
    });

    it('keeps an empty heading’s type and reports the joined text landing past the moved line', () => {
      const moved = {
        ...paragraph({ text: 'ef' }),
        authored: [
          {
            ...mark('insert', 'carol'),
            follows: JSON.stringify(['alice:1', AT]),
          },
        ],
      };
      const lines = [heading({ text: '' }), moved, joining('cd')];
      const resolution = resolveAuthoredChildren(lines, () => 'accept');

      assert.deepEqual(
        {
          children: resolution.children,
          hidden: resolution.hidden,
          placements: resolution.placements,
        },
        {
          children: [heading({ text: 'cd' }), paragraph({ text: 'ef' })],
          hidden: [],
          placements: [{ after: lines[0], node: lines[2] }],
        }
      );
    });

    it('collapses the emptied piece a rejected split rejoins, and a line hidden between them, into the rejoined piece under Accepted', () => {
      const lines = [
        paragraph({ text: 'X', authored: [mark('insert', 'alice')] }),
        whole(paragraph({ text: 'y' }), mark('insert', 'carol')),
        { ...paragraph({ text: 'cd' }), authored: [mark('split')] },
      ];
      const resolution = resolveAuthoredChildren(lines, () => 'reject');

      assert.deepEqual(
        {
          children: resolution.children,
          hidden: resolution.hidden,
          placements: resolution.placements,
        },
        {
          children: [paragraph({ text: 'cd' })],
          hidden: [
            { at: [0], owner: [0] },
            { at: [1], owner: [0] },
          ],
          placements: [],
        }
      );
    });
  });

  describe('the report of where a decision shows each block', () => {
    it('leaves out a follower’s landing that passes no shown line', () => {
      const follower = {
        ...paragraph({ text: 'ab' }),
        authored: [
          { ...mark('split', 'carol'), follows: JSON.stringify(['bob:1', AT]) },
        ],
      };
      const joining = {
        ...paragraph({ text: 'gh', authored: [mark('delete')] }),
        authored: [mark('join')],
      };
      const resolution = resolveAuthoredChildren(
        [
          paragraph({ text: 'cd' }),
          paragraph({ text: 'e' }, { text: 'f', authored: [mark('delete')] }),
          follower,
          joining,
        ],
        () => 'accept'
      );

      assert.deepEqual(
        {
          children: resolution.children,
          placements: resolution.placements,
        },
        {
          children: [
            paragraph({ text: 'cd' }),
            paragraph({ text: 'e' }),
            paragraph({ text: 'ab' }),
          ],
          placements: [],
        }
      );
    });

    it('reports each block hidden whole with the shown block it collapses into', () => {
      const removed = paragraph({ text: 'z' });

      assert.deepEqual(
        resolveAuthoredChildren(
          [
            {
              type: 'quote',
              children: [
                paragraph({ text: 'ab' }),
                whole(paragraph({ text: 'x' }), mark('delete', 'carol')),
              ],
            },
            paragraph({ text: 'cd' }),
            whole(paragraph({ text: 'y' }), mark('delete', 'carol')),
            { ...paragraph({ text: 'ef' }), authored: [mark('join')] },
            removed,
          ],
          () => 'accept',
          null,
          'main',
          { removed: new Set([removed]) }
        ).hidden,
        [
          { at: [0, 1], owner: [0] },
          { at: [2], owner: [1] },
          { at: [4], owner: null },
        ]
      );
    });

    it('completes a container’s children in the container’s schema', () => {
      const Quotes = defineEditorSchema('quoted-headings-schema', {
        elements: {
          heading: schema.element.textBlock(),
          quote: {
            content: schema.content.types(['heading'], {
              default: { type: 'heading' },
              min: 1,
            }),
          },
        },
        id: 'quoted-headings-schema',
        root: schema.content.types(['quote'], {
          default: { type: 'quote' },
          min: 1,
        }),
        unknown: 'reject',
        version: 1,
      });
      const editor = createEditor({
        plugins: [Quotes, createAuthoredPlugin({ authorId: 'dave' })],
        initialValue: [
          {
            type: 'quote',
            children: [
              whole(heading({ text: 'gone' }), mark('delete', 'alice')),
            ],
          },
        ],
      });
      const resolver = authoredResolveSchemaOf(editor);
      const value = editor.read.children() as never;
      const [quote] = editor.read.children();

      assert.deepEqual(
        [
          resolveAuthoredChildren(
            quote.children as never,
            () => 'accept',
            resolver,
            'main',
            { site: [quote as never] }
          ).children,
          resolveAuthoredChildren(value, () => 'accept', resolver).children,
        ],
        [
          [heading({ text: '' })],
          [{ type: 'quote', children: [heading({ text: '' })] }],
        ]
      );
    });
  });

  it('merges an accepted join into the previous block', () => {
    const join = [
      paragraph({ text: 'ab' }),
      { ...paragraph({ text: 'cd' }), authored: [mark('join')] },
    ];

    assert.deepEqual(resolveAuthoredChildren(join, accept('bob:1')).children, [
      paragraph({ text: 'abcd' }),
    ]);
  });

  it('keeps Bob’s text inside Alice’s insertion pending when Alice’s is accepted, and removes it when hers is rejected', () => {
    const nested = [
      paragraph(
        { text: 'a' },
        { text: 'X', authored: [mark('insert', 'alice'), mark('insert')] },
        { text: 'b' }
      ),
    ];

    assert.deepEqual(
      resolveAuthoredChildren(nested, accept('alice:1')).children,
      [
        paragraph(
          { text: 'a' },
          { text: 'X', authored: [mark('insert')] },
          { text: 'b' }
        ),
      ]
    );
    assert.deepEqual(
      resolveAuthoredChildren(nested, reject('alice:1')).children,
      [paragraph({ text: 'ab' })]
    );
  });

  it('restores a rejected format change’s previous value', () => {
    const formatted = [
      paragraph({
        authored: [
          {
            at: AT,
            author: 'bob',
            change: 'bob:1',
            id: 't1',
            key: 'bold',
            kind: 'format',
            write: { kind: 'set', value: true },
          },
        ],
        bold: true,
        text: 'word',
      }),
    ];

    assert.deepEqual(
      resolveAuthoredChildren(formatted, reject('bob:1')).children,
      [paragraph({ text: 'word' })]
    );
  });

  it('decides one change as one undoable step', () => {
    const editor = createEditor({
      plugins: [
        history(),
        createAuthoredPlugin({ authorId: 'bob', now: () => AT }),
      ],
      initialValue: replacement,
    });

    authoredTestApi(editor).decide({ action: 'accept', changes: ['bob:1'] });
    assert.deepEqual(editor.read.children(), [
      paragraph({ text: 'keep NEW tail' }),
    ]);
    editor.api.history.undo();
    assert.deepEqual(editor.read.children(), replacement);
  });

  it('restores the user’s own pending suggestion when an AI rewrite over it is discarded', () => {
    const initial = [
      paragraph(
        { text: 'a' },
        { text: 'draft', authored: [mark('insert')] },
        { text: 'b' }
      ),
    ];
    const editor = createEditor({
      plugins: [
        createAuthoredPlugin({
          authorId: 'bob',
          intent: 'propose',
          now: () => AT,
        }),
      ],
      initialValue: initial,
    });

    editor.update((tx) => {
      tx.authored.propose({ changeId: 'ai:1' });
      tx.selection.set({ anchor: point(0, [0, 1]), focus: point(5, [0, 1]) });
      tx.text.insert('better');
    });
    authoredTestApi(editor).decide({ action: 'reject', changes: ['ai:1'] });

    assert.deepEqual(reviewedValue(editor).children, initial);
  });

  const group = (
    columns: Array<Record<string, unknown>>,
    extra: Record<string, unknown> = {}
  ) => ({
    type: 'column_group',
    ...extra,
    children: columns,
  });
  const column = (text: string, extra: Record<string, unknown> = {}) => ({
    type: 'column',
    ...extra,
    children: [paragraph({ text })],
  });
  const columnsEditor = (initialValue: Array<Record<string, unknown>>) =>
    createEditor({
      plugins: [
        Columns,
        createAuthoredPlugin({ authorId: 'bob', now: () => AT }),
      ],
      initialValue,
    });

  it('reads a struck column group’s surviving text in both the proposed read and the decided document', () => {
    const editor = columnsEditor([
      group([column('left'), whole(column('right'), mark('delete'))]),
    ]);
    const proposed = authoredTestApi(editor).project('proposed').value.children;

    authoredTestApi(editor).decide({ action: 'accept', changes: ['bob:1'] });
    assert.deepEqual(proposed, [group([column('left'), column('')])]);
    assert.deepEqual(editor.read.children(), proposed);
  });

  it('decides a group format change and a column deletion to one result in either order', () => {
    const format = {
      at: AT,
      author: 'alice',
      before: 'even',
      change: 'alice:1',
      id: 't1',
      key: 'layout',
      kind: 'format',
      write: { kind: 'set', value: 'wide' },
    };
    const initial = [
      group([column('left'), whole(column('right'), mark('delete'))], {
        authored: [format],
        layout: 'wide',
      }),
    ];
    const first = columnsEditor(initial);
    const second = columnsEditor(initial);

    authoredTestApi(first).decide({ action: 'accept', changes: ['alice:1'] });
    authoredTestApi(first).decide({ action: 'accept', changes: ['bob:1'] });
    authoredTestApi(second).decide({ action: 'accept', changes: ['bob:1'] });
    authoredTestApi(second).decide({ action: 'accept', changes: ['alice:1'] });

    assert.deepEqual(second.read.children(), first.read.children());
    assert.deepEqual(first.read.children(), [
      group([column('left'), column('')], { layout: 'wide' }),
    ]);
  });

  it('keeps a column group whose two column deletions are accepted together, as Editing does', () => {
    const initial = [
      paragraph({ text: 'before' }),
      group([column('left'), column('right')]),
    ];
    const editor = columnsEditor([
      initial[0],
      group([
        whole(column('left'), mark('delete', 'alice')),
        whole(column('right'), mark('delete')),
      ]),
    ]);
    const plain = columnsEditor(initial);

    authoredTestApi(editor).decide({
      action: 'accept',
      changes: ['bob:1', 'alice:1'],
    });
    plain.update((tx) => {
      tx.nodes.remove({ at: [1, 1] });
      tx.nodes.remove({ at: [1, 0] });
    });
    assert.deepEqual(editor.read.children(), plain.read.children());
  });

  it('keeps the root’s required block when its only block’s deletion is accepted', () => {
    const editor = columnsEditor([
      whole(paragraph({ text: 'x' }), mark('delete')),
    ]);
    const proposed = authoredTestApi(editor).project('proposed').value.children;
    const result = authoredTestApi(editor).decide({
      action: 'accept',
      changes: ['bob:1'],
    });

    const plain = columnsEditor([paragraph({ text: 'x' })]);

    plain.update((tx) => tx.nodes.remove({ at: [0] }));
    assert.equal(result.status, 'applied');
    assert.deepEqual(editor.read.children(), plain.read.children());
    assert.deepEqual(proposed, editor.read.children());
  });

  it('keeps the spacer text an inline element needs when a decision removes a neighbour', () => {
    const Inline = defineEditorSchema('inline-schema', {
      elements: {
        link: {
          content: schema.content.text({ default: 'text', min: 1 }),
          inline: true,
        },
      },
      id: 'inline-schema',
      root: schema.content.not(schema.content.text()),
      unknown: 'preserve',
      version: 1,
    });
    const editor = createEditor({
      plugins: [Inline, createAuthoredPlugin({ authorId: 'carol' })],
      initialValue: [
        paragraph(
          { text: '' },
          { type: 'link', children: [{ text: 'L' }] },
          { text: 'tail', authored: [mark('insert')] }
        ),
      ],
    });

    const result = authoredTestApi(editor).decide({
      action: 'reject',
      changes: ['bob:1'],
    });

    assert.equal(result.status, 'applied');
    assert.deepEqual(editor.read.children(), [
      paragraph(
        { text: '' },
        { type: 'link', children: [{ text: 'L' }] },
        { text: '' }
      ),
    ]);
  });

  it('blocks a decision that empties a column holding another pending structural change', () => {
    const editor = columnsEditor([
      group([
        {
          type: 'column',
          authored: [mark('split', 'alice')],
          children: [whole(paragraph({ text: 'new' }), mark('insert'))],
        },
        column('right'),
        column('third'),
      ]),
    ]);

    assert.deepEqual(
      authoredTestApi(editor).decide({ action: 'reject', changes: ['bob:1'] }),
      { ids: ['bob:1'], status: 'blocked', with: ['alice:1'] }
    );
  });

  it('leaves the root’s default block unchanged on a later decision', () => {
    const editor = columnsEditor([
      whole(paragraph({ text: 'x' }), mark('delete')),
    ]);

    authoredTestApi(editor).decide({ action: 'accept', changes: ['bob:1'] });

    assert.deepEqual(
      authoredTestApi(editor).decide({ action: 'accept', changes: [] }),
      { ids: [], status: 'unchanged' }
    );
  });

  it('restores an empty paragraph, as Editing’s undo does, when the typing into it is rejected', () => {
    const editor = columnsEditor([
      paragraph({ text: 'a' }),
      paragraph({ text: 'x', authored: [mark('insert')] }),
    ]);
    const plain = createEditor({
      plugins: [Columns, history()],
      initialValue: [paragraph({ text: 'a' }), paragraph({ text: '' })],
    });

    plain.update((tx) => tx.text.insert('x', { at: point(0, [1, 0]) }));
    plain.api.history.undo();
    authoredTestApi(editor).decide({ action: 'reject', changes: ['bob:1'] });

    assert.deepEqual(editor.read.children(), plain.read.children());
  });
});

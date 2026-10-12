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

import { authoredTreeProof } from '../src/authored/tree/proof-plugin';
import { resolveAuthoredChildren } from '../src/authored/tree/resolve';

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

  it('reads a tag written over a decided tag as written over the accepted value', () => {
    // Bob unbolded on top of t1, which a decision has since accepted.
    const formatted = [
      paragraph({
        authored: [
          {
            at: AT,
            author: 'bob',
            before: true,
            change: 'bob:2',
            id: 't2',
            key: 'bold',
            kind: 'format',
            over: ['t1'],
          },
        ],
        text: 'word',
      }),
    ];

    assert.deepEqual(
      resolveAuthoredChildren(formatted, reject('bob:2')).children,
      [paragraph({ bold: true, text: 'word' })]
    );
  });

  it('decides one change as one undoable step', () => {
    const editor = createEditor({
      plugins: [
        history(),
        authoredTreeProof({ authorId: 'bob', now: () => AT }),
      ],
      initialValue: replacement,
    });

    editor.api.authoredTree.decide({ action: 'accept', changes: ['bob:1'] });
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
        authoredTreeProof({
          authorId: 'bob',
          intent: 'propose',
          now: () => AT,
        }),
      ],
      initialValue: initial,
    });

    editor.api.authoredTree.propose('ai:1', () => {
      editor.update((tx) => {
        tx.selection.set({ anchor: point(0, [0, 1]), focus: point(5, [0, 1]) });
        tx.text.insert('better');
      });
    });
    editor.api.authoredTree.decide({ action: 'reject', changes: ['ai:1'] });

    assert.deepEqual(editor.read.children(), initial);
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
      plugins: [Columns, authoredTreeProof({ authorId: 'bob', now: () => AT })],
      initialValue,
    });

  it('reads a struck column group’s surviving text in both the proposed read and the decided document', () => {
    const editor = columnsEditor([
      group([column('left'), whole(column('right'), mark('delete'))]),
    ]);
    const proposed = editor.api.authoredTree.project('proposed').value.children;

    editor.api.authoredTree.decide({ action: 'accept', changes: ['bob:1'] });
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
    };
    const initial = [
      group([column('left'), whole(column('right'), mark('delete'))], {
        authored: [format],
        layout: 'wide',
      }),
    ];
    const first = columnsEditor(initial);
    const second = columnsEditor(initial);

    first.api.authoredTree.decide({ action: 'accept', changes: ['alice:1'] });
    first.api.authoredTree.decide({ action: 'accept', changes: ['bob:1'] });
    second.api.authoredTree.decide({ action: 'accept', changes: ['bob:1'] });
    second.api.authoredTree.decide({ action: 'accept', changes: ['alice:1'] });

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

    editor.api.authoredTree.decide({
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
    const proposed = editor.api.authoredTree.project('proposed').value.children;
    const result = editor.api.authoredTree.decide({
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
      plugins: [Inline, authoredTreeProof({ authorId: 'carol' })],
      initialValue: [
        paragraph(
          { text: '' },
          { type: 'link', children: [{ text: 'L' }] },
          { text: 'tail', authored: [mark('insert')] }
        ),
      ],
    });

    const result = editor.api.authoredTree.decide({
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
      editor.api.authoredTree.decide({ action: 'reject', changes: ['bob:1'] }),
      { ids: ['bob:1'], status: 'blocked', with: ['alice:1'] }
    );
  });

  it('leaves the root’s default block unchanged on a later decision', () => {
    const editor = columnsEditor([
      whole(paragraph({ text: 'x' }), mark('delete')),
    ]);

    editor.api.authoredTree.decide({ action: 'accept', changes: ['bob:1'] });

    assert.deepEqual(
      editor.api.authoredTree.decide({ action: 'accept', changes: ['bob:1'] }),
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
    editor.api.authoredTree.decide({ action: 'reject', changes: ['bob:1'] });

    assert.deepEqual(editor.read.children(), plain.read.children());
  });
});

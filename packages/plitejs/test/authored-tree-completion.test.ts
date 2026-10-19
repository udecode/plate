import assert from 'node:assert/strict';
import { join } from 'node:path';
import { describe, it } from 'node:test';

import * as representation from '../src/core/representation';
import { authoredTestApi } from './support/authored';

const real = { ...representation };
let completions = 0;
let built = 0;
// When set, completion returns the children it was given, unfinished.
let skipCompletion = false;

mock.module(join(import.meta.dir, '../src/core/representation.ts'), () => ({
  ...real,
  completeChildrenAt: (
    ...args: Parameters<typeof representation.completeChildrenAt>
  ) => {
    const completion = skipCompletion
      ? { built: [], children: args[2], sources: args[2] }
      : real.completeChildrenAt(...args);

    completions += 1;
    built += completion?.built.length ?? 0;

    return completion;
  },
}));

const { createEditor, defineEditorSchema, property, schema } =
  await import('plitejs');
const { createAuthoredPlugin } = await import('../src/authored/authored');
const { authoredTestApi, expandedChildren } =
  await import('./support/authored');
const { proposedChildren, proposedHost } =
  await import('../src/authored/tree/proposed');

type Node = Readonly<{
  authored?: ReadonlyArray<Readonly<{ change: string; kind: string }>>;
  children?: readonly Node[];
  text?: string;
  type?: string;
}>;

const c = schema.content;
const textMin1 = () => c.text({ default: 'text', min: 1 });
const define = (id: string, elements: object, root: object) =>
  defineEditorSchema(id, {
    elements,
    id,
    properties: [schema.textProperty('bold', property.boolean())],
    root,
    unknown: 'reject',
    version: 1,
  } as never);
const blocks = (...types: string[]) =>
  c.any(
    types.map((type) => c.type(type)),
    { default: { type: types[0] }, min: 1 }
  );
const Titled = define(
  'completion-titled',
  { h1: { content: textMin1() }, paragraph: { content: textMin1() } },
  c.prefix([{ element: 'h1' }], blocks('paragraph', 'h1'))
);
const cells = (options: object) => ({
  cell: { content: textMin1() },
  group: { content: c.type('cell', options) },
  paragraph: { content: textMin1() },
});
const Grid = define(
  'completion-grid',
  cells({ min: 2 }),
  blocks('paragraph', 'group', 'cell')
);
const GridMax = define(
  'completion-grid-max',
  cells({ max: 2, min: 2 }),
  blocks('paragraph', 'group', 'cell')
);
const Grid3 = define(
  'completion-grid-3',
  cells({ min: 3 }),
  blocks('paragraph', 'group', 'cell')
);
const Wrapped = define(
  'completion-wrapped',
  {
    ...cells({}),
    group: {
      content: c.types(['cell', 'wrapper'], {
        default: { type: 'cell' },
        min: 2,
      }),
    },
    wrapper: { content: c.type('cell') },
  },
  blocks('paragraph', 'group', 'cell')
);
const Header = define(
  'completion-header',
  {
    el: { content: c.prefix([{ element: 'header' }], c.text({ max: 0 })) },
    header: { content: c.text() },
    paragraph: { content: c.text() },
  },
  blocks('paragraph', 'el')
);
const Inline3 = define(
  'completion-inline3',
  {
    el: {
      content: c.any([c.text(), c.type('xi')], {
        default: { type: 'xi' },
        max: 3,
        min: 3,
      }),
    },
    paragraph: { content: c.text() },
    xi: { content: textMin1(), inline: true },
  },
  blocks('paragraph', 'el')
);
const Heading = define(
  'completion-heading',
  {
    heading: { content: textMin1() },
    paragraph: { content: textMin1() },
    titled: {
      content: c.prefix(
        [{ element: 'heading' }],
        c.types(['paragraph'], { default: { type: 'paragraph' }, min: 0 })
      ),
    },
  },
  c.types(['paragraph', 'titled'], { default: { type: 'paragraph' }, min: 1 })
);
const Mixed = define(
  'completion-mixed',
  {
    el: {
      content: c.any([c.text(), c.type('xb')], {
        default: { type: 'xb' },
        min: 2,
      }),
    },
    paragraph: { content: c.text() },
    xb: { content: c.text() },
  },
  blocks('paragraph', 'el')
);
const Quotes = define(
  'completion-quotes',
  {
    paragraph: { content: c.text() },
    quote: { content: c.type('paragraph', { min: 1 }) },
  },
  blocks('paragraph', 'quote')
);
const Headed = define(
  'completion-headed',
  {
    h1: { content: c.text() },
    h2: { content: c.text() },
    paragraph: { content: c.text() },
  },
  c.prefix(
    [{ element: 'h1' }, { element: 'h2' }],
    blocks('paragraph', 'h1', 'h2')
  )
);

const t = (text: string): Node => ({ text });
const el = (type: string, ...children: Node[]): Node => ({ children, type });
const titled = () => [el('h1', t('Title')), el('paragraph', t('p'))];
const grid = () => [
  el('paragraph', t('p')),
  el('group', el('cell', t('a')), el('cell', t('b'))),
];

/** Each node as its type or text, with its review marks after a bar. */
const shape = (nodes: readonly Node[]): unknown[] =>
  nodes.map((node) => {
    const marks = (node.authored ?? [])
      .map((mark) => `${mark.kind}:${mark.change}`)
      .join(',');
    const name = `${node.type ?? node.text}${marks ? `|${marks}` : ''}`;

    return node.children ? { [name]: shape(node.children) } : name;
  });
const plain = (nodes: readonly Node[]): Node[] =>
  nodes.map(({ authored: _authored, children, ...rest }) =>
    children ? { ...rest, children: plain(children) } : rest
  );
const unmarkedElements = (nodes: readonly Node[]): number =>
  nodes.reduce(
    (count, node) =>
      node.children
        ? count +
          (node.authored?.length ? 0 : 1) +
          unmarkedElements(node.children)
        : count,
    0
  );

const editorWith = (
  plugin: unknown,
  value: readonly Node[],
  intent: 'edit' | 'propose'
) => {
  let changes = 0;

  return createEditor({
    initialValue: structuredClone(value) as never,
    plugins: [
      plugin,
      createAuthoredPlugin({
        authorId: 'ann',
        createChangeId: () => {
          changes += 1;

          return `c${changes}`;
        },
        intent,
        now: () => 1,
      }),
    ] as never,
  });
};
const children = (editor: ReturnType<typeof editorWith>) =>
  expandedChildren(editor) as readonly Node[];
/** Suggest `run`, asserting the canonical pass after recording built nothing. */
const suggest = (
  editor: ReturnType<typeof editorWith>,
  run: (tx: Parameters<Parameters<typeof editor.update>[0]>[0]) => void
) => {
  const before = unmarkedElements(children(editor));

  editor.update(run);
  assert.ok(
    unmarkedElements(children(editor)) <= before,
    'the recorder slot built an unmarked element'
  );
};
const editing = (
  plugin: unknown,
  value: readonly Node[],
  run: Parameters<ReturnType<typeof editorWith>['update']>[0]
) => {
  const editor = editorWith(plugin, value, 'edit');

  editor.update(run);

  return plain(children(editor));
};
// A later suggestion can withdraw an earlier one of the same author, so only
// the changes the document still holds are decided.
const acceptAll = (editor: ReturnType<typeof editorWith>, ids: string[]) => {
  authoredTestApi(editor).decide({
    action: 'accept',
    changes: ids.filter((id) => editor.read.authored.change(id)),
  });

  return plain(children(editor));
};

describe('authored review tree completion while recording', () => {
  it('keeps a required title it deletes with its text struck, where Editing builds a fresh title', () => {
    const editor = editorWith(Titled, titled(), 'propose');

    editor.update((tx) => tx.selection.set({ offset: 2, path: [0, 0] }));
    suggest(editor, (tx) => tx.nodes.remove({ at: [0] }));

    assert.deepEqual(shape(children(editor)), [
      { h1: ['Title|delete:c1'] },
      { paragraph: ['p'] },
    ]);
    assert.deepEqual(editor.read.selection()?.anchor, {
      offset: 0,
      path: [1, 0],
    });
    assert.deepEqual(
      acceptAll(editor, ['c1']),
      editing(Titled, titled(), (tx) => tx.nodes.remove({ at: [0] }))
    );
  });

  it('inserts the cell a group’s minimum needs after the last cell, and keeps that last cell when it is the one deleted', () => {
    const first = editorWith(Grid, grid(), 'propose');
    const last = editorWith(Grid, grid(), 'propose');

    suggest(first, (tx) => tx.nodes.remove({ at: [1, 0] }));
    suggest(last, (tx) => tx.nodes.remove({ at: [1, 1] }));

    assert.deepEqual(shape(children(first)), [
      { paragraph: ['p'] },
      {
        group: [
          { 'cell|delete:c1': ['a|delete:c1'] },
          { cell: ['b'] },
          { 'cell|insert:c1': ['|insert:c1'] },
        ],
      },
    ]);
    assert.deepEqual(shape(children(last)), [
      { paragraph: ['p'] },
      { group: [{ cell: ['a'] }, { cell: ['b|delete:c1'] }] },
    ]);
  });

  it('records each bounded shape without a refusal', () => {
    for (const [plugin, value, at] of [
      [Header, [el('el', el('header', t('h')))], [0, 0]],
      [Inline3, [el('el', t('a'), el('xi', t('q')), t('b'))], [0, 1]],
      [
        Heading,
        [el('titled', el('heading', t('Title')), el('paragraph', t('Body')))],
        [0, 0],
      ],
    ] as const) {
      const editor = editorWith(plugin, value, 'propose');

      suggest(editor, (tx) => tx.nodes.remove({ at: [...at] }));
      assert.match(JSON.stringify(children(editor)), /"delete"/);
    }
  });

  it('inserts the block mixed content needs after its text', () => {
    const editor = editorWith(
      Mixed,
      [el('el', el('xb', t('a')), t('hello'))],
      'propose'
    );

    suggest(editor, (tx) => tx.nodes.remove({ at: [0, 0] }));

    assert.deepEqual(shape(children(editor)), [
      {
        el: [
          { 'xb|delete:c1': ['a|delete:c1'] },
          'hello',
          { 'xb|insert:c1': ['|insert:c1'] },
        ],
      },
    ]);
  });

  it('defers a cell a maximum leaves no room for beside the struck cell, and keeps no shell of a deleted inline element', () => {
    const cell = editorWith(GridMax, grid(), 'propose');
    const inline = editorWith(
      Inline3,
      [el('el', t('a'), el('xi', t('q')), t('b'))],
      'propose'
    );

    built = 0;
    suggest(cell, (tx) => tx.nodes.remove({ at: [1, 0] }));
    assert.equal(built, 1);
    suggest(inline, (tx) => tx.nodes.remove({ at: [0, 1] }));

    assert.deepEqual(shape(children(cell)), [
      { paragraph: ['p'] },
      { group: [{ 'cell|delete:c1': ['a|delete:c1'] }, { cell: ['b'] }] },
    ]);
    assert.deepEqual(shape(children(inline)), [
      { el: ['a', { 'xi|delete:c1': ['q|delete:c1'] }, 'b'] },
    ]);
  });

  it('inserts a cell that another change’s pending deletion made necessary with that change’s insertion too, so rejecting the deletion removes it', () => {
    const start = [
      el('paragraph', t('p')),
      el('group', el('cell', t('a')), el('cell', t('b')), el('cell', t('c'))),
    ];
    const editor = editorWith(Grid, start, 'propose');

    suggest(editor, (tx) => tx.nodes.remove({ at: [1, 0] }));
    suggest(editor, (tx) => tx.nodes.remove({ at: [1, 1] }));
    assert.deepEqual(shape(children(editor)).at(1), {
      group: [
        { 'cell|delete:c1': ['a|delete:c1'] },
        { 'cell|delete:c2': ['b|delete:c2'] },
        { cell: ['c'] },
        { 'cell|insert:c1,insert:c2': ['|insert:c1,insert:c2'] },
      ],
    });
    authoredTestApi(editor).decide([
      { action: 'accept', changes: ['c2'] },
      { action: 'reject', changes: ['c1'] },
    ]);
    assert.deepEqual(
      plain(children(editor)),
      editing(Grid, start, (tx) => tx.nodes.remove({ at: [1, 1] }))
    );
  });

  it('fills a group whose cell the change strikes inside a wrapper it unwrapped, once', () => {
    const start = [
      el('paragraph', t('p')),
      el('group', el('wrapper', el('cell', t('a'))), el('cell', t('b'))),
    ];
    const editor = editorWith(Wrapped, start, 'propose');

    authoredTestApi(editor).propose('c1', (tx) =>
      tx.nodes.unwrap({ at: [1, 0] })
    );
    authoredTestApi(editor).propose('c1', (tx) =>
      tx.nodes.remove({ at: [1, 0, 0] })
    );

    assert.deepEqual(shape(children(editor)).at(1), {
      group: [
        { 'wrapper|unwrap:c1': [{ 'cell|delete:c1': ['a|delete:c1'] }] },
        { cell: ['b'] },
        { 'cell|insert:c1': ['|insert:c1'] },
      ],
    });
    assert.deepEqual(
      acceptAll(editor, ['c1']),
      editing(Wrapped, start, (tx) => {
        tx.nodes.unwrap({ at: [1, 0] });
        tx.nodes.remove({ at: [1, 0] });
      })
    );
  });

  it('keeps the cell a transaction struck as the shell, not a cell it typed into', () => {
    const start = [
      el('paragraph', t('p')),
      el('group', el('cell', t('a')), el('cell', t('b')), el('cell', t('c'))),
    ];
    const run = (
      tx: Parameters<Parameters<ReturnType<typeof editorWith>['update']>[0]>[0]
    ) => {
      tx.text.insert('X', { at: { offset: 1, path: [1, 1, 0] } });
      tx.nodes.remove({ at: [1, 2] });
    };
    const editor = editorWith(Grid3, start, 'propose');

    suggest(editor, run);

    assert.deepEqual(shape(children(editor)).at(1), {
      group: [
        { cell: ['a'] },
        { cell: ['b', 'X|insert:c1'] },
        { cell: ['c|delete:c1'] },
      ],
    });
    assert.deepEqual(acceptAll(editor, ['c1']), editing(Grid3, start, run));
  });

  it('gives a fill inside a quote another change inserted that change’s insertion too, so rejecting it removes the quote whole', () => {
    const editor = editorWith(Quotes, [el('paragraph', t('a'))], 'propose');

    suggest(editor, (tx) =>
      tx.nodes.insert(el('quote', el('paragraph', t('xy'))), { at: [1] })
    );
    suggest(editor, (tx) => tx.nodes.remove({ at: [1, 0] }));

    assert.deepEqual(shape(children(editor)).at(1), {
      'quote|insert:c1': [
        { 'paragraph|insert:c1,insert:c2': ['|insert:c1,insert:c2'] },
      ],
    });

    authoredTestApi(editor).decide({ action: 'reject', changes: ['c1'] });

    assert.deepEqual(plain(children(editor)), [el('paragraph', t('a'))]);
  });

  it('records the fresh title as an insertion of the deletion that withdraws one’s own pending heading above it', () => {
    const editor = editorWith(Titled, titled(), 'propose');

    suggest(editor, (tx) => tx.nodes.insert(el('h1', t('X')), { at: [0] }));
    suggest(editor, (tx) => tx.nodes.remove({ at: [0] }));

    assert.deepEqual(shape(children(editor)), [
      { 'h1|insert:c2': ['|insert:c2'] },
      { h1: ['Title'] },
      { paragraph: ['p'] },
    ]);

    // Removing the heading withdrew c1, one's own pending insertion.
    authoredTestApi(editor).decide({ action: 'reject', changes: ['c2'] });

    assert.deepEqual(plain(children(editor)), titled());
  });

  it('fills a struck quote whose paragraphs are withdrawn with an empty paragraph that accepting its removal removes', () => {
    const own = [{ at: 1, author: 'ann', change: 'c0', kind: 'insert' }];
    const editor = editorWith(
      Quotes,
      [
        el('paragraph', t('a')),
        el('quote', {
          authored: own,
          children: [{ authored: own, text: 'q' }],
          type: 'paragraph',
        }),
      ],
      'propose'
    );

    suggest(editor, (tx) => tx.nodes.remove({ at: [1] }));

    assert.deepEqual(shape(children(editor)), [
      { paragraph: ['a'] },
      { 'quote|delete:c1': [{ 'paragraph|delete:c1': ['|delete:c1'] }] },
    ]);
    assert.deepEqual(acceptAll(editor, ['c1']), [el('paragraph', t('a'))]);
  });

  it('keeps both required headings one transaction strikes, where Editing builds both afresh', () => {
    const start = [el('h1', t('A')), el('h2', t('B')), el('paragraph', t('p'))];
    const both: Parameters<ReturnType<typeof editorWith>['update']>[0] = (
      tx
    ) => {
      tx.nodes.remove({ at: [0] });
      tx.nodes.remove({ at: [0] });
    };
    const editor = editorWith(Headed, start, 'propose');

    suggest(editor, both);

    assert.deepEqual(shape(children(editor)), [
      { h1: ['A|delete:c1'] },
      { h2: ['B|delete:c1'] },
      { paragraph: ['p'] },
    ]);
    assert.deepEqual(acceptAll(editor, ['c1']), editing(Headed, start, both));
  });

  it('inserts both required headings in order when the transaction withdraws one’s own pending headings', () => {
    const own = [{ at: 1, author: 'ann', change: 'c0', kind: 'insert' }];
    const pending = (type: string, text: string) => ({
      authored: own,
      children: [{ authored: own, text }],
      type,
    });
    const editor = editorWith(
      Headed,
      [pending('h1', 'A'), pending('h2', 'B'), el('paragraph', t('p'))],
      'propose'
    );

    suggest(editor, (tx) => {
      tx.nodes.remove({ at: [0] });
      tx.nodes.remove({ at: [0] });
    });

    assert.deepEqual(shape(children(editor)), [
      { 'h1|insert:c1': ['|insert:c1'] },
      { 'h2|insert:c1': ['|insert:c1'] },
      { paragraph: ['p'] },
    ]);
  });

  it('inserts the second required heading after the first, kept, when the transaction withdraws one’s own pending second heading', () => {
    const own = [{ at: 1, author: 'ann', change: 'c0', kind: 'insert' }];
    const editor = editorWith(
      Headed,
      [
        el('h1', t('A')),
        { authored: own, children: [{ authored: own, text: 'B' }], type: 'h2' },
        el('paragraph', t('p')),
      ],
      'propose'
    );

    suggest(editor, (tx) => {
      tx.nodes.remove({ at: [0] });
      tx.nodes.remove({ at: [0] });
    });

    assert.deepEqual(shape(children(editor)), [
      { h1: ['A|delete:c1'] },
      { 'h2|insert:c1': ['|insert:c1'] },
      { paragraph: ['p'] },
    ]);
  });

  it('records the fill past a quote with no paragraph left, where a join reaches the paragraph before the quote', () => {
    const Three = define(
      'completion-three',
      {
        paragraph: { content: c.text() },
        quote: { content: c.type('paragraph') },
      },
      c.any([c.type('paragraph'), c.type('quote')], {
        default: { type: 'paragraph' },
        min: 3,
      })
    );
    const editor = editorWith(
      Three,
      [
        el('paragraph', t('a')),
        el('quote', el('paragraph', t('x'))),
        el('paragraph', t('b')),
        el('paragraph', t('c')),
      ],
      'propose'
    );

    suggest(editor, (tx) => tx.nodes.remove({ at: [1, 0] }));
    suggest(editor, (tx) => {
      const caret = { offset: 0, path: [2, 0] };

      tx.selection.set({ anchor: caret, focus: caret });
      tx.text.deleteBackward();
    });
    suggest(editor, (tx) => tx.nodes.move({ at: [1, 1], to: [2] }));
    suggest(editor, (tx) => tx.nodes.remove({ at: [4] }));

    assert.deepEqual(shape(children(editor)).at(-1), {
      'paragraph|insert:c2,insert:c4': ['|insert:c2,insert:c4'],
    });
  });

  it('keeps a fresh title through rejecting another change’s deletion past it', () => {
    const start = [...titled(), el('paragraph', t('q'))];
    const insert: Parameters<ReturnType<typeof editorWith>['update']>[0] = (
      tx
    ) => tx.nodes.insert(el('h1', t('X')), { at: [0] });
    const remove: Parameters<ReturnType<typeof editorWith>['update']>[0] = (
      tx
    ) => tx.nodes.remove({ at: [0] });
    const editor = editorWith(Titled, start, 'propose');
    const edit = editorWith(Titled, start, 'edit');

    suggest(editor, insert);
    suggest(editor, (tx) => tx.nodes.remove({ at: [2] }));
    suggest(editor, remove);
    authoredTestApi(editor).decide({ action: 'reject', changes: ['c2'] });
    edit.update(insert);
    edit.update(remove);

    assert.deepEqual(acceptAll(editor, ['c1', 'c3']), plain(children(edit)));
  });

  it('keeps a replacement title and its typed text through rejecting a deletion past it', () => {
    const start = titled();
    const typed: Parameters<ReturnType<typeof editorWith>['update']>[0] = (
      tx
    ) => tx.text.insert('New', { at: { offset: 0, path: [0, 0] } });
    const editor = editorWith(Titled, start, 'propose');
    const edit = editorWith(Titled, start, 'edit');

    suggest(editor, (tx) => tx.nodes.insert(el('h1', t('X')), { at: [0] }));
    suggest(editor, (tx) => tx.nodes.remove({ at: [1] }));
    suggest(editor, (tx) => tx.nodes.remove({ at: [2] }));
    suggest(editor, (tx) => tx.nodes.remove({ at: [0] }));
    suggest(editor, typed);
    authoredTestApi(editor).decide({ action: 'reject', changes: ['c3'] });
    edit.update((tx) => tx.nodes.remove({ at: [0] }));
    edit.update(typed);

    assert.deepEqual(
      acceptAll(editor, ['c1', 'c2', 'c4', 'c5']),
      plain(children(edit))
    );
  });

  it('runs no completion for typing, Enter or a mark, and none would build anything there', () => {
    const editor = editorWith(Titled, titled(), 'propose');

    completions = 0;
    suggest(editor, (tx) =>
      tx.text.insert('k', { at: { offset: 1, path: [1, 0] } })
    );
    suggest(editor, (tx) => {
      tx.selection.set({ offset: 1, path: [1, 0] });
      tx.break.insert();
    });
    suggest(editor, (tx) => {
      tx.selection.set({
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 3, path: [0, 0] },
      });
      tx.marks.add('bold', true);
    });
    assert.equal(completions, 0);

    const value = children(editor);
    const hosts: number[][] = [[]];
    const walk = (nodes: readonly Node[], path: number[]) => {
      nodes.forEach((node, index) => {
        if (!node.children) return;
        hosts.push([...path, index]);
        walk(node.children, [...path, index]);
      });
    };

    walk(value, []);
    built = 0;
    for (const path of hosts) {
      const host = proposedHost(value as never, path);

      if (!host) continue;

      let node: Node | undefined;
      const site: Node[] = [];
      let level = value;

      for (const index of host) {
        node = level[index];
        if (node) site.unshift(node);
        level = node?.children ?? [];
      }
      built +=
        real.completeChildrenAt(
          editor as never,
          site as never,
          proposedChildren(value as never, host).map(
            ({ node: child }) => child
          ) as never,
          'main'
        )?.built.length ?? 0;
    }
    assert.equal(built, 0);
  });
});

describe('authored review tree decisions the canonical check refuses', () => {
  it('returns invalid and leaves the document when a resolution it plants is not canonical', () => {
    const Lines = define(
      'completion-lines',
      { paragraph: { content: c.text() } },
      blocks('paragraph')
    );
    const start = [
      el('paragraph', {
        authored: [{ at: 1, author: 'bob', change: 'bob:1', kind: 'delete' }],
        text: 'x',
      } as Node),
    ];
    const editor = editorWith(Lines, start, 'edit');

    skipCompletion = true;
    try {
      assert.deepEqual(
        authoredTestApi(editor).decide({
          action: 'accept',
          changes: ['bob:1'],
        }),
        { ids: ['bob:1'], status: 'invalid' }
      );
    } finally {
      skipCompletion = false;
    }
    assert.deepEqual(children(editor), start);
  });
});

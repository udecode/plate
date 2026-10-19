import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  definePlugin,
  type Element,
  NodeApi,
  type NodeTextRangeRoot,
  schema,
} from 'plitejs';

import { registerEditorContent } from '../src/core/content';

const root = (children: Element['children']): Element => ({
  type: 'root',
  children,
});

const snapshotRoot = (children: Element['children']): NodeTextRangeRoot => ({
  children,
});

it('finds literal text ranges across adjacent leaves in one text run', () => {
  assert.deepEqual(
    NodeApi.findTextRanges(
      root([
        {
          type: 'paragraph',
          children: [{ text: 'look ' }, { text: 'for' }, { text: 'ward' }],
        },
      ]),
      'forward'
    ),
    [
      {
        anchor: { path: [0, 1], offset: 0 },
        focus: { path: [0, 2], offset: 4 },
      },
    ]
  );
});

it('does not join separate text runs', () => {
  assert.deepEqual(
    NodeApi.findTextRanges(
      root([
        { type: 'paragraph', children: [{ text: 'foo' }] },
        { type: 'paragraph', children: [{ text: 'bar' }] },
      ]),
      'foobar'
    ),
    []
  );
});

it('joins text through schema inline descendants for live editor roots', () => {
  const editor = createEditor({
    plugins: [
      definePlugin('links', {
        schema: {
          elements: {
            link: {
              content: schema.content.text({ default: 'text', min: 1 }),
              inline: true,
            },
          },
        },
      }),
    ],
    initialValue: [
      {
        type: 'paragraph',
        children: [
          { text: 'hello ' },
          { type: 'link', children: [{ text: 'world' }] },
          { text: ' again' },
        ],
      },
      { type: 'paragraph', children: [{ text: 'outside' }] },
    ],
  });

  assert.deepEqual(NodeApi.findTextRanges(editor, 'hello world again'), [
    {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 2], offset: 6 },
    },
  ]);
  assert.deepEqual(NodeApi.findTextRanges(editor, 'againoutside'), []);
});

it('accepts snapshot roots with children only', () => {
  assert.deepEqual(
    NodeApi.findTextRanges(
      snapshotRoot([{ type: 'paragraph', children: [{ text: 'snapshot' }] }]),
      'shot'
    ),
    [
      {
        anchor: { path: [0, 0], offset: 4 },
        focus: { path: [0, 0], offset: 8 },
      },
    ]
  );
});

it('supports case-insensitive string matches', () => {
  assert.deepEqual(
    NodeApi.findTextRanges(
      root([
        {
          type: 'paragraph',
          children: [{ text: 'Alpha alpha' }],
        },
      ]),
      'alpha',
      { caseSensitive: false }
    ),
    [
      {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 5 },
      },
      {
        anchor: { path: [0, 0], offset: 6 },
        focus: { path: [0, 0], offset: 11 },
      },
    ]
  );
});

it('supports regular expressions without mutating caller lastIndex', () => {
  const query = /f.o/gi;
  query.lastIndex = 2;

  assert.deepEqual(
    NodeApi.findTextRanges(
      root([
        {
          type: 'paragraph',
          children: [{ text: 'foo Fao' }],
        },
      ]),
      query
    ),
    [
      {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 3 },
      },
      {
        anchor: { path: [0, 0], offset: 4 },
        focus: { path: [0, 0], offset: 7 },
      },
    ]
  );
  assert.equal(query.lastIndex, 2);
});

it('supports callback matches and ignores invalid offsets', () => {
  assert.deepEqual(
    NodeApi.findTextRanges(
      root([
        {
          type: 'paragraph',
          children: [{ text: 'custom text' }],
        },
      ]),
      () => [
        { start: 0, end: 6 },
        { start: 8, end: 4 },
        { start: -1, end: 2 },
      ]
    ),
    [
      {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 6 },
      },
    ]
  );
});

it('ignores empty string and zero-width regular expression matches', () => {
  const value = root([
    {
      type: 'paragraph',
      children: [{ text: 'alpha' }],
    },
  ]);

  assert.deepEqual(NodeApi.findTextRanges(value, ''), []);
  assert.deepEqual(NodeApi.findTextRanges(value, /(?=a)/g), []);
});

it('limits the search to the node at `at` and keeps document paths', () => {
  const entries: unknown[] = [];

  assert.deepEqual(
    NodeApi.findTextRanges(
      root([
        { type: 'paragraph', children: [{ text: 'foo' }] },
        { type: 'paragraph', children: [{ text: 'a foo' }] },
      ]),
      (text, entry) => {
        entries.push(entry[1]);

        return Array.from(text.matchAll(/foo/g), (match) => ({
          start: match.index,
          end: match.index + match[0].length,
        }));
      },
      { at: [1] }
    ),
    [
      {
        anchor: { path: [1, 0], offset: 2 },
        focus: { path: [1, 0], offset: 5 },
      },
    ]
  );
  assert.deepEqual(entries, [[1]]);
});

describe('read and transaction view roots', () => {
  const create = () => {
    const editor = createEditor({
      plugins: [
        definePlugin('links', {
          schema: {
            elements: {
              link: {
                content: schema.content.text({ default: 'text', min: 1 }),
                inline: true,
              },
            },
          },
        }),
      ],
      initialValue: [
        { type: 'paragraph', children: [{ text: 'skip keep' }] },
        {
          type: 'paragraph',
          children: [
            { text: 'keep ' },
            { text: 'gone ', struck: true },
            { type: 'link', children: [{ text: 'NEW' }] },
            { text: ' tail' },
          ],
        },
      ],
    });

    registerEditorContent(
      editor,
      (_owner, node) => !(node as { struck?: boolean }).struck
    );

    return editor;
  };
  const expected = [
    {
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 2, 0], offset: 3 },
    },
  ];

  it('joins inline runs and skips non-content text in a read view', () => {
    const editor = create();

    assert.deepEqual(
      editor.read((state) =>
        NodeApi.findTextRanges(state, 'keep NEW', { at: [1], content: true })
      ),
      expected
    );
    assert.deepEqual(
      editor.read((state) =>
        NodeApi.findTextRanges(state, 'gone', { content: true })
      ),
      []
    );
  });

  it('reads the transaction draft with the same rules', () => {
    const editor = create();
    let found: unknown;

    editor.update((tx) => {
      tx.text.insert('!', { at: { path: [1, 3], offset: 5 } });
      found = [
        NodeApi.findTextRanges(tx, 'keep NEW', { at: [1], content: true }),
        NodeApi.findTextRanges(tx, 'tail!', { content: true }).length,
      ];
    });

    assert.deepEqual(found, [expected, 1]);
  });
});

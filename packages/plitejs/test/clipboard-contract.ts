import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  ContentSlice,
  createEditor,
  type Descendant,
  type Element,
  type TextInsertFragmentOptions,
} from 'plitejs';
import { history } from 'plitejs/history';

import {
  getLastCommit as editorGetLastCommit,
  getSnapshot as editorGetSnapshot,
  replace as editorReplace,
} from '../src/internal';
import { extendTestSchema } from './support/schema';

const createChildren = (): Element[] => [
  {
    type: 'paragraph',
    children: [{ text: 'alpha' }],
  },
  {
    type: 'paragraph',
    children: [{ text: 'beta' }],
  },
];

const replaceSlice = (
  editor: ReturnType<typeof createEditor>,
  content: readonly Descendant[],
  options?: TextInsertFragmentOptions
) =>
  editor.update((tx) => {
    tx.fragment.replace(content, options);
  });

const createOpenSlice = (content: readonly Descendant[], depth = 1) =>
  ContentSlice.fromJSON({
    content,
    openEnd: depth,
    openStart: depth,
  });

describe('plite slice contract', () => {
  it('extracts the selected fragment from an expanded selection', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: createChildren(),
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 5 },
      },
    });

    assert.deepEqual(
      editor.read((state) => state.fragment()),
      [
        {
          type: 'paragraph',
          children: [{ text: 'alpha' }],
        },
      ]
    );
  });

  it('extracts partial selected text leaves without mutating source text', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: '01234' }, { bold: true, text: '56789' }],
        },
      ],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 1], offset: 4 },
      },
    });

    const fragment = editor.read((state) => state.fragment());

    assert.deepEqual(fragment, [
      {
        type: 'paragraph',
        children: [{ text: '1234' }, { bold: true, text: '5678' }],
      },
    ]);

    (fragment[0].children[0] as { text: string }).text = 'different';
    (fragment[0].children[1] as { text: string }).text = 'also different';

    assert.deepEqual(editorGetSnapshot(editor).children, [
      {
        type: 'paragraph',
        children: [{ text: '01234' }, { bold: true, text: '56789' }],
      },
    ]);
  });

  it('extracts a mixed inline fragment from a single top-level block selection', () => {
    const editor = createEditor();
    extendTestSchema(editor, { chip: { inline: true } });

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [
            { text: 'alpha ' },
            {
              type: 'chip',
              children: [{ text: 'beta' }],
            },
            { text: ' gamma' },
          ],
        },
      ],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 2], offset: 3 },
      },
    });

    assert.deepEqual(
      editor.read((state) => state.fragment()),
      [
        {
          type: 'paragraph',
          children: [
            { text: 'ha ' },
            {
              type: 'chip',
              children: [{ text: 'beta' }],
            },
            { text: ' ga' },
          ],
        },
      ]
    );
  });

  it('extracts whole top-level blocks from a large surrounding document', () => {
    const editor = createEditor();
    const children = Array.from({ length: 20 }, (_, index) => ({
      type: 'paragraph',
      children: [{ text: `block-${index}` }],
    })) satisfies Element[];

    editorReplace(editor, {
      children,
      selection: {
        kind: 'text' as const,
        anchor: { path: [10, 0], offset: 0 },
        focus: { path: [11, 0], offset: 'block-11'.length },
      },
    });

    assert.deepEqual(
      editor.read((state) => state.fragment()),
      [
        {
          type: 'paragraph',
          children: [{ text: 'block-10' }],
        },
        {
          type: 'paragraph',
          children: [{ text: 'block-11' }],
        },
      ]
    );
  });

  it('extracts a selected whole list with its wrapping list element', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        {
          type: 'bulleted-list',
          children: [
            {
              type: 'list-item',
              children: [{ text: 'one' }],
            },
            {
              type: 'list-item',
              children: [{ text: 'two' }],
            },
          ],
        },
      ],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0, 0], offset: 0 },
        focus: { path: [0, 1, 0], offset: 'two'.length },
      },
    });

    assert.deepEqual(
      editor.read((state) => state.fragment()),
      [
        {
          type: 'bulleted-list',
          children: [
            {
              type: 'list-item',
              children: [{ text: 'one' }],
            },
            {
              type: 'list-item',
              children: [{ text: 'two' }],
            },
          ],
        },
      ]
    );
  });

  it('copies a partial list item with a following block and inserts it into an empty block', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        {
          type: 'bulleted-list',
          children: [
            {
              type: 'list-item',
              children: [{ text: 'one' }],
            },
            {
              type: 'list-item',
              children: [{ text: 'two' }],
            },
            {
              type: 'list-item',
              children: [{ text: 'three' }],
            },
          ],
        },
        {
          type: 'paragraph',
          children: [{ text: 'Some text.' }],
        },
      ],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 2, 0], offset: 3 },
        focus: { path: [1, 0], offset: 'Some text.'.length },
      },
    });

    const slice = editor.read((state) => state.slice.get());

    assert.deepEqual(slice, {
      content: [
        {
          type: 'bulleted-list',
          children: [
            {
              type: 'list-item',
              children: [{ text: 'ee' }],
            },
          ],
        },
        {
          type: 'paragraph',
          children: [{ text: 'Some text.' }],
        },
      ],
      openEnd: 1,
      openStart: 2,
    });

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: '' }],
        },
      ],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      },
    });

    editor.update((tx) => {
      tx.slice.replace(slice);
    });

    const snapshot = editorGetSnapshot(editor);

    assert.deepEqual(snapshot.children, [
      {
        type: 'bulleted-list',
        children: [
          {
            type: 'list-item',
            children: [{ text: 'ee' }],
          },
        ],
      },
      {
        type: 'paragraph',
        children: [{ text: 'Some text.' }],
      },
    ]);
    assert.deepEqual(snapshot.selection, {
      kind: 'text',
      anchor: { path: [1, 0], offset: 'Some text.'.length },
      focus: { path: [1, 0], offset: 'Some text.'.length },
    });
  });

  it('inserts a partial list-plus-block fragment into an empty list item by splitting the list', () => {
    const editor = createEditor();
    const fragment: Element[] = [
      {
        type: 'bulleted-list',
        children: [
          {
            type: 'list-item',
            children: [{ text: 'ee' }],
          },
        ],
      },
      {
        type: 'paragraph',
        children: [{ text: 'Some text.' }],
      },
    ];

    editorReplace(editor, {
      children: [
        {
          type: 'bulleted-list',
          children: [
            {
              type: 'list-item',
              children: [{ text: 'one' }],
            },
            {
              type: 'list-item',
              children: [{ text: '' }],
            },
            {
              type: 'list-item',
              children: [{ text: 'two' }],
            },
            {
              type: 'list-item',
              children: [{ text: 'three' }],
            },
          ],
        },
        {
          type: 'paragraph',
          children: [{ text: 'Some text.' }],
        },
      ],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 1, 0], offset: 0 },
        focus: { path: [0, 1, 0], offset: 0 },
      },
    });

    editor.update((tx) => {
      tx.slice.replace(
        ContentSlice.fromJSON({
          content: fragment,
          openEnd: 0,
          openStart: 2,
        })
      );
    });

    const snapshot = editorGetSnapshot(editor);

    assert.deepEqual(snapshot.children, [
      {
        type: 'bulleted-list',
        children: [
          {
            type: 'list-item',
            children: [{ text: 'one' }],
          },
          {
            type: 'list-item',
            children: [{ text: 'ee' }],
          },
        ],
      },
      {
        type: 'paragraph',
        children: [{ text: 'Some text.' }],
      },
      {
        type: 'bulleted-list',
        children: [
          {
            type: 'list-item',
            children: [{ text: 'two' }],
          },
          {
            type: 'list-item',
            children: [{ text: 'three' }],
          },
        ],
      },
      {
        type: 'paragraph',
        children: [{ text: 'Some text.' }],
      },
    ]);
    assert.deepEqual(snapshot.selection, {
      kind: 'text',
      anchor: { path: [1, 0], offset: 'Some text.'.length },
      focus: { path: [1, 0], offset: 'Some text.'.length },
    });
  });

  it('inserts a partial list-plus-block fragment at the end of a populated list item', () => {
    const editor = createEditor();
    const fragment: Element[] = [
      {
        type: 'bulleted-list',
        children: [
          {
            type: 'list-item',
            children: [{ text: 'ee' }],
          },
        ],
      },
      {
        type: 'paragraph',
        children: [{ text: 'Some text.' }],
      },
    ];

    editorReplace(editor, {
      children: [
        {
          type: 'bulleted-list',
          children: [
            {
              type: 'list-item',
              children: [{ text: 'one' }],
            },
            {
              type: 'list-item',
              children: [{ text: 'two' }],
            },
            {
              type: 'list-item',
              children: [{ text: 'three' }],
            },
          ],
        },
      ],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 2, 0], offset: 'three'.length },
        focus: { path: [0, 2, 0], offset: 'three'.length },
      },
    });

    editor.update((tx) => {
      tx.slice.replace(
        ContentSlice.fromJSON({
          content: fragment,
          openEnd: 0,
          openStart: 2,
        })
      );
    });

    const snapshot = editorGetSnapshot(editor);

    assert.deepEqual(snapshot.children, [
      {
        type: 'bulleted-list',
        children: [
          {
            type: 'list-item',
            children: [{ text: 'one' }],
          },
          {
            type: 'list-item',
            children: [{ text: 'two' }],
          },
          {
            type: 'list-item',
            children: [{ text: 'three' }],
          },
          {
            type: 'list-item',
            children: [{ text: 'ee' }],
          },
        ],
      },
      {
        type: 'paragraph',
        children: [{ text: 'Some text.' }],
      },
    ]);
    assert.deepEqual(snapshot.selection, {
      kind: 'text',
      anchor: { path: [1, 0], offset: 'Some text.'.length },
      focus: { path: [1, 0], offset: 'Some text.'.length },
    });
  });

  it('deletes across a list without leaving an orphan list item', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'before' }],
        },
        {
          type: 'bulleted-list',
          children: [
            {
              type: 'list-item',
              children: [{ text: 'one' }],
            },
            {
              type: 'list-item',
              children: [{ text: 'two' }],
            },
          ],
        },
        {
          type: 'paragraph',
          children: [{ text: 'after' }],
        },
      ],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 'before'.length },
        focus: { path: [2, 0], offset: 0 },
      },
    });

    editor.update((tx) => {
      tx.fragment.delete();
    });

    const snapshot = editorGetSnapshot(editor);

    assert.deepEqual(snapshot.children, [
      {
        type: 'paragraph',
        children: [{ text: 'beforeafter' }],
      },
    ]);
    assert.deepEqual(snapshot.selection, {
      kind: 'text',
      anchor: { path: [0, 0], offset: 'before'.length },
      focus: { path: [0, 0], offset: 'before'.length },
    });
  });

  it('treats an empty fragment insert as a no-op', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: createChildren(),
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [0, 0], offset: 2 },
      },
    });

    const before = editorGetSnapshot(editor);

    editor.update((tx) => {
      tx.slice.replace(ContentSlice.closed([]));
    });

    const after = editorGetSnapshot(editor);

    assert.equal(after, before);
  });

  it('records full-document fragment replacement as one undoable change', () => {
    const editor = createEditor({ extensions: [history()] as const });
    const children = createChildren();
    const replacement: Element[] = [
      {
        type: 'paragraph',
        children: [{ text: 'one' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'two' }],
      },
    ];

    editorReplace(editor, {
      children,
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [1, 0], offset: 'beta'.length },
      },
    });

    editor.update((tx) => {
      tx.slice.replace(ContentSlice.closed(replacement));
    });

    assert.deepEqual(editorGetSnapshot(editor).children, replacement);
    assert.deepEqual(editorGetSnapshot(editor).selection, {
      kind: 'text',
      anchor: { path: [1, 0], offset: 'two'.length },
      focus: { path: [1, 0], offset: 'two'.length },
    });
    assert.equal(editorGetLastCommit(editor)?.changes.empty, false);
    assert.equal(
      editor.read((state) => state.history.undos().length),
      1
    );
    assert.equal(
      editor.read((state) => state.history.undos()[0]?.change.empty),
      false
    );

    editor.update((tx) => {
      tx.history.undo();
    });

    assert.deepEqual(editorGetSnapshot(editor).children, children);
    assert.deepEqual(editorGetSnapshot(editor).selection, {
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [1, 0], offset: 'beta'.length },
    });
  });

  it('inserts a fragment into a collapsed text selection', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: createChildren(),
      selection: {
        kind: 'text' as const,
        anchor: { path: [1, 0], offset: 2 },
        focus: { path: [1, 0], offset: 2 },
      },
    });

    editor.update((tx) => {
      tx.slice.replace(
        createOpenSlice([
          {
            type: 'paragraph',
            children: [{ text: 'alpha' }],
          },
        ])
      );
    });

    const snapshot = editorGetSnapshot(editor);

    assert.deepEqual(snapshot.children, [
      {
        type: 'paragraph',
        children: [{ text: 'alpha' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'bealphata' }],
      },
    ]);
    assert.deepEqual(snapshot.selection, {
      kind: 'text',
      anchor: { path: [1, 0], offset: 7 },
      focus: { path: [1, 0], offset: 7 },
    });
    assert.equal(editorGetLastCommit(editor)?.changes.empty, false);
  });

  it('preserves block separation for a multi-block fragment inserted in the middle of a text block', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'before after' }],
        },
      ],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 'before '.length },
        focus: { path: [0, 0], offset: 'before '.length },
      },
    });

    editor.update((tx) => {
      tx.slice.replace(
        createOpenSlice([
          {
            type: 'paragraph',
            children: [{ text: 'one' }],
          },
          {
            type: 'paragraph',
            children: [{ text: 'two' }],
          },
        ])
      );
    });

    const snapshot = editorGetSnapshot(editor);

    assert.deepEqual(snapshot.children, [
      {
        type: 'paragraph',
        children: [{ text: 'before one' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'twoafter' }],
      },
    ]);
    assert.deepEqual(snapshot.selection, {
      kind: 'text',
      anchor: { path: [1, 0], offset: 'two'.length },
      focus: { path: [1, 0], offset: 'two'.length },
    });
    assert.equal(editorGetLastCommit(editor)?.changes.empty, false);
  });

  it('slice replacement inserts at an explicit target instead of the current selection', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: createChildren(),
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [0, 0], offset: 2 },
      },
    });

    editor.update((tx) => {
      tx.slice.replace(
        createOpenSlice([
          {
            type: 'paragraph',
            children: [{ text: 'X' }],
          },
        ]),
        {
          at: {
            anchor: { path: [1, 0], offset: 2 },
            focus: { path: [1, 0], offset: 2 },
          },
        }
      );
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [
      {
        type: 'paragraph',
        children: [{ text: 'alpha' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'beXta' }],
      },
    ]);
  });

  it('replaces selected text with a single text-block fragment as one canonical change', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'abcd' }],
        },
      ],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 3 },
      },
    });

    editor.update((tx) => {
      tx.slice.replace(
        createOpenSlice([
          {
            type: 'paragraph',
            children: [{ text: 'XY' }],
          },
        ])
      );
    });

    const snapshot = editorGetSnapshot(editor);

    assert.deepEqual(snapshot.children, [
      {
        type: 'paragraph',
        children: [{ text: 'aXYd' }],
      },
    ]);
    assert.deepEqual(snapshot.selection, {
      kind: 'text',
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });
    assert.equal(editorGetLastCommit(editor)?.changes.empty, false);
  });

  it('replaces selected text before an inline with a single text-block fragment', () => {
    const editor = createEditor();

    extendTestSchema(editor, { link: { inline: true } });

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [
            { text: 'text' },
            {
              type: 'link',
              url: 'https://test.com/',
              children: [{ text: 'link' }],
            },
            { text: 'tail' },
          ],
        },
      ],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 'text'.length },
      },
    });

    editor.update((tx) => {
      tx.slice.replace(
        createOpenSlice([
          {
            type: 'paragraph',
            children: [{ text: 'replaced' }],
          },
        ])
      );
    });

    const snapshot = editorGetSnapshot(editor);

    assert.deepEqual(snapshot.children, [
      {
        type: 'paragraph',
        children: [
          { text: 'replaced' },
          {
            type: 'link',
            url: 'https://test.com/',
            children: [{ text: 'link' }],
          },
          { text: 'tail' },
        ],
      },
    ]);
    assert.deepEqual(snapshot.selection, {
      kind: 'text',
      anchor: { path: [0, 0], offset: 'replaced'.length },
      focus: { path: [0, 0], offset: 'replaced'.length },
    });
    assert.equal(editorGetLastCommit(editor)?.changes.empty, false);
  });

  it('replaces selected text after an inline with a single text-block fragment', () => {
    const editor = createEditor();

    extendTestSchema(editor, { link: { inline: true } });

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [
            { text: '' },
            {
              type: 'link',
              url: 'https://test.com/',
              children: [{ text: 'link' }],
            },
            { text: 'text' },
          ],
        },
      ],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 2], offset: 0 },
        focus: { path: [0, 2], offset: 'text'.length },
      },
    });

    editor.update((tx) => {
      tx.slice.replace(
        createOpenSlice([
          {
            type: 'paragraph',
            children: [{ text: 'replaced' }],
          },
        ])
      );
    });

    const snapshot = editorGetSnapshot(editor);

    assert.deepEqual(snapshot.children, [
      {
        type: 'paragraph',
        children: [
          { text: '' },
          {
            type: 'link',
            url: 'https://test.com/',
            children: [{ text: 'link' }],
          },
          { text: 'replaced' },
        ],
      },
    ]);
    assert.deepEqual(snapshot.selection, {
      kind: 'text',
      anchor: { path: [0, 2], offset: 'replaced'.length },
      focus: { path: [0, 2], offset: 'replaced'.length },
    });
    assert.equal(editorGetLastCommit(editor)?.changes.empty, false);
  });

  it('preserves marked text while fitting a single text-block fragment as one canonical change', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'ad' }],
        },
      ],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 1 },
      },
    });

    editor.update((tx) => {
      tx.slice.replace(
        createOpenSlice([
          {
            type: 'paragraph',
            children: [{ bold: true, text: 'BC' }],
          },
        ])
      );
    });

    const snapshot = editorGetSnapshot(editor);

    assert.deepEqual(snapshot.children, [
      {
        type: 'paragraph',
        children: [{ text: 'a' }, { bold: true, text: 'BC' }, { text: 'd' }],
      },
    ]);
    assert.deepEqual(snapshot.selection, {
      kind: 'text',
      anchor: { path: [0, 1], offset: 2 },
      focus: { path: [0, 1], offset: 2 },
    });
    assert.equal(editorGetLastCommit(editor)?.changes.empty, false);
  });

  it('pastes rich text into selected inline link text without swallowing the paste into the link', () => {
    const editor = createEditor();

    extendTestSchema(editor, { link: { inline: true } });

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [
            { text: 'Hello ' },
            {
              type: 'link',
              url: 'https://test.com/',
              children: [{ text: 'World' }],
            },
            { text: '' },
          ],
        },
      ],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 1, 0], offset: 0 },
        focus: { path: [0, 1, 0], offset: 'Wor'.length },
      },
    });

    editor.update((tx) => {
      tx.slice.replace(
        createOpenSlice([
          {
            type: 'paragraph',
            children: [{ text: 'Hello ' }, { bold: true, text: 'bold' }],
          },
        ])
      );
    });

    const snapshot = editorGetSnapshot(editor);

    assert.deepEqual(snapshot.children, [
      {
        type: 'paragraph',
        children: [
          { text: 'Hello Hello ' },
          { bold: true, text: 'bold' },
          {
            type: 'link',
            url: 'https://test.com/',
            children: [{ text: 'ld' }],
          },
          { text: '' },
        ],
      },
    ]);
    assert.deepEqual(snapshot.selection, {
      kind: 'text',
      anchor: { path: [0, 1], offset: 'bold'.length },
      focus: { path: [0, 1], offset: 'bold'.length },
    });
    assert.equal(editorGetLastCommit(editor)?.changes.empty, false);
  });

  it('preserves inline fragment children while fitting a single text-block fragment as one canonical change', () => {
    const editor = createEditor();

    extendTestSchema(editor, { chip: { inline: true } });

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'ad' }],
        },
      ],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 1 },
      },
    });

    editor.update((tx) => {
      tx.slice.replace(
        createOpenSlice([
          {
            type: 'paragraph',
            children: [
              { text: 'B' },
              { type: 'chip', children: [{ text: 'C' }] },
              { text: 'D' },
            ],
          },
        ])
      );
    });

    const snapshot = editorGetSnapshot(editor);

    assert.deepEqual(snapshot.children, [
      {
        type: 'paragraph',
        children: [
          { text: 'aB' },
          { type: 'chip', children: [{ text: 'C' }] },
          { text: 'Dd' },
        ],
      },
    ]);
    assert.deepEqual(snapshot.selection, {
      kind: 'text',
      anchor: { path: [0, 2], offset: 1 },
      focus: { path: [0, 2], offset: 1 },
    });
    assert.equal(editorGetLastCommit(editor)?.changes.empty, false);
  });

  it('fits a single nested text-block fragment into the active nested text block', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        {
          type: 'code-block',
          children: [
            {
              type: 'code-line',
              children: [{ text: '// Add the initial value.' }],
            },
            {
              type: 'code-line',
              children: [{ text: 'const initialValue = [' }],
            },
          ],
        },
      ],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0, 0], offset: 0 },
        focus: { path: [0, 0, 0], offset: 0 },
      },
    });

    editor.update((tx) => {
      tx.slice.replace(
        createOpenSlice(
          [
            {
              type: 'code-block',
              children: [
                {
                  type: 'code-line',
                  children: [{ text: 'Add' }],
                },
              ],
            },
          ],
          2
        )
      );
    });

    const snapshot = editorGetSnapshot(editor);

    assert.deepEqual(snapshot.children, [
      {
        type: 'code-block',
        children: [
          {
            type: 'code-line',
            children: [{ text: 'Add// Add the initial value.' }],
          },
          {
            type: 'code-line',
            children: [{ text: 'const initialValue = [' }],
          },
        ],
      },
    ]);
    assert.deepEqual(snapshot.selection, {
      kind: 'text',
      anchor: { path: [0, 0, 0], offset: 3 },
      focus: { path: [0, 0, 0], offset: 3 },
    });
    assert.equal(editorGetLastCommit(editor)?.changes.empty, false);
  });

  it('preserves partial inline link content when copying and pasting a fragment', () => {
    const editor = createEditor();

    extendTestSchema(editor, { link: { inline: true } });
    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [
            { text: 'text' },
            {
              type: 'link',
              url: 'https://test.com/',
              children: [{ text: 'link' }],
            },
            { text: 'tail' },
          ],
        },
      ],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 1, 0], offset: 1 },
        focus: { path: [0, 1, 0], offset: 3 },
      },
    });

    const slice = editor.read((state) => state.slice.get());

    assert.deepEqual(slice, {
      content: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'link',
              url: 'https://test.com/',
              children: [{ text: 'in' }],
            },
          ],
        },
      ],
      openEnd: 2,
      openStart: 2,
    });

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'paste here' }],
        },
      ],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 'paste '.length },
        focus: { path: [0, 0], offset: 'paste '.length },
      },
    });

    editor.update((tx) => {
      tx.slice.replace(slice);
    });

    const snapshot = editorGetSnapshot(editor);

    assert.deepEqual(snapshot.children, [
      {
        type: 'paragraph',
        children: [
          { text: 'paste ' },
          {
            type: 'link',
            url: 'https://test.com/',
            children: [{ text: 'in' }],
          },
          { text: 'here' },
        ],
      },
    ]);
    assert.deepEqual(snapshot.selection, {
      kind: 'text',
      anchor: { path: [0, 1, 0], offset: 2 },
      focus: { path: [0, 1, 0], offset: 2 },
    });
    assert.equal(editorGetLastCommit(editor)?.changes.empty, false);
  });

  it('inserts a block fragment into an empty block as one canonical change', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: '' }],
        },
      ],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      },
    });

    editor.update((tx) => {
      tx.slice.replace(
        ContentSlice.closed([
          {
            type: 'paragraph',
            children: [{ text: 'one' }],
          },
          {
            type: 'paragraph',
            children: [{ text: 'two' }],
          },
          {
            type: 'paragraph',
            children: [{ text: 'three' }],
          },
        ])
      );
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [
      {
        type: 'paragraph',
        children: [{ text: 'one' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'two' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'three' }],
      },
    ]);
    assert.deepEqual(editorGetSnapshot(editor).selection, {
      kind: 'text',
      anchor: { path: [2, 0], offset: 'three'.length },
      focus: { path: [2, 0], offset: 'three'.length },
    });
    assert.equal(editorGetLastCommit(editor)?.changes.empty, false);
  });

  it('slice replacement places selection after inserting a text-block fragment into an empty block', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: '' }],
        },
      ],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      },
    });

    replaceSlice(editor, [
      {
        type: 'paragraph',
        children: [{ text: 'inserted' }],
      },
    ]);

    const snapshot = editorGetSnapshot(editor);

    assert.deepEqual(snapshot.children, [
      {
        type: 'paragraph',
        children: [{ text: 'inserted' }],
      },
    ]);
    assert.deepEqual(snapshot.selection, {
      kind: 'text',
      anchor: { path: [0, 0], offset: 'inserted'.length },
      focus: { path: [0, 0], offset: 'inserted'.length },
    });
  });

  it('slice replacement preserves a copied text-block type over an empty target block', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'before' }],
        },
        {
          type: 'paragraph',
          children: [{ text: '' }],
        },
      ],
      selection: {
        kind: 'text' as const,
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 0 },
      },
    });

    replaceSlice(editor, [
      {
        type: 'heading',
        children: [{ text: 'inserted' }],
      },
    ]);

    const snapshot = editorGetSnapshot(editor);

    assert.deepEqual(snapshot.children, [
      {
        type: 'paragraph',
        children: [{ text: 'before' }],
      },
      {
        type: 'heading',
        children: [{ text: 'inserted' }],
      },
    ]);
    assert.deepEqual(snapshot.selection, {
      kind: 'text',
      anchor: { path: [1, 0], offset: 'inserted'.length },
      focus: { path: [1, 0], offset: 'inserted'.length },
    });
  });

  it('slice replacement preserves copied text-block types over an empty target block', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'before' }],
        },
        {
          type: 'paragraph',
          children: [{ text: '' }],
        },
        {
          type: 'paragraph',
          children: [{ text: 'after' }],
        },
      ],
      selection: {
        kind: 'text' as const,
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 0 },
      },
    });

    replaceSlice(editor, [
      {
        type: 'heading',
        children: [{ text: 'heading' }],
      },
      {
        type: 'quote',
        children: [{ text: 'quote' }],
      },
      {
        type: 'code',
        children: [{ text: 'code' }],
      },
    ]);

    const snapshot = editorGetSnapshot(editor);

    assert.deepEqual(snapshot.children, [
      {
        type: 'paragraph',
        children: [{ text: 'before' }],
      },
      {
        type: 'heading',
        children: [{ text: 'heading' }],
      },
      {
        type: 'quote',
        children: [{ text: 'quote' }],
      },
      {
        type: 'code',
        children: [{ text: 'code' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'after' }],
      },
    ]);
    assert.deepEqual(snapshot.selection, {
      kind: 'text',
      anchor: { path: [3, 0], offset: 'code'.length },
      focus: { path: [3, 0], offset: 'code'.length },
    });
  });

  it('slice replacement places selection after an inline void pasted into an empty target block', () => {
    const editor = createEditor();
    extendTestSchema(editor, { mention: { void: 'markable-inline' } });

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'before' }],
        },
        {
          type: 'paragraph',
          children: [{ text: '' }],
        },
      ],
      selection: {
        kind: 'text' as const,
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 0 },
      },
    });

    replaceSlice(editor, [
      {
        type: 'paragraph',
        children: [
          { text: 'hello ' },
          {
            type: 'mention',
            character: 'Leia Organa',
            children: [{ text: '' }],
          },
        ],
      },
    ]);

    const snapshot = editorGetSnapshot(editor);

    assert.deepEqual(snapshot.children, [
      {
        type: 'paragraph',
        children: [{ text: 'before' }],
      },
      {
        type: 'paragraph',
        children: [
          { text: 'hello ' },
          {
            type: 'mention',
            character: 'Leia Organa',
            children: [{ text: '' }],
          },
          { text: '' },
        ],
      },
    ]);
    assert.deepEqual(snapshot.selection, {
      kind: 'text',
      anchor: { path: [1, 2], offset: 0 },
      focus: { path: [1, 2], offset: 0 },
    });
  });

  it('slice replacement preserves a copied text-block type over a single empty document block', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: '' }],
        },
      ],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      },
    });

    replaceSlice(editor, [
      {
        type: 'heading',
        children: [{ text: 'inserted' }],
      },
    ]);

    const snapshot = editorGetSnapshot(editor);

    assert.deepEqual(snapshot.children, [
      {
        type: 'heading',
        children: [{ text: 'inserted' }],
      },
    ]);
    assert.deepEqual(snapshot.selection, {
      kind: 'text',
      anchor: { path: [0, 0], offset: 'inserted'.length },
      focus: { path: [0, 0], offset: 'inserted'.length },
    });
  });

  it('slice replacement preserves copied text-block props over a single empty document block', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: '' }],
        },
      ],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      },
    });

    replaceSlice(editor, [
      {
        type: 'paragraph',
        indent: 1,
        listType: 'bulleted',
        children: [{ text: 'one' }],
      },
      {
        type: 'paragraph',
        indent: 2,
        listType: 'bulleted',
        children: [{ text: 'two' }],
      },
    ]);

    const snapshot = editorGetSnapshot(editor);

    assert.deepEqual(snapshot.children, [
      {
        type: 'paragraph',
        indent: 1,
        listType: 'bulleted',
        children: [{ text: 'one' }],
      },
      {
        type: 'paragraph',
        indent: 2,
        listType: 'bulleted',
        children: [{ text: 'two' }],
      },
    ]);
    assert.deepEqual(snapshot.selection, {
      kind: 'text',
      anchor: { path: [1, 0], offset: 'two'.length },
      focus: { path: [1, 0], offset: 'two'.length },
    });
  });

  it('slice replacement preserves copied block void attributes over an empty target block', () => {
    const editor = createEditor();
    const image = {
      type: 'image',
      className: 'copied-image',
      id: 'image-1',
      opinionId: 'opinion-1',
      url: 'https://example.com/copied.png',
      children: [{ text: '' }],
    } as Descendant;

    extendTestSchema(editor, { image: { void: 'block' } });

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: '' }],
        },
      ],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      },
    });

    replaceSlice(editor, [image]);

    const snapshot = editorGetSnapshot(editor);

    assert.deepEqual(snapshot.children, [image]);
    assert.deepEqual(snapshot.selection, {
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });
  });

  it('replaces selected top-level blocks with one structural change', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: createChildren(),
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 'alpha'.length },
      },
    });

    editor.update((tx) => {
      tx.slice.replace(
        ContentSlice.closed([
          {
            type: 'bulleted-list',
            children: [
              {
                type: 'list-item',
                children: [{ text: 'one' }],
              },
              {
                type: 'list-item',
                children: [{ text: 'two' }],
              },
            ],
          },
        ])
      );
    });

    const snapshot = editorGetSnapshot(editor);

    assert.deepEqual(snapshot.children, [
      {
        type: 'bulleted-list',
        children: [
          {
            type: 'list-item',
            children: [{ text: 'one' }],
          },
          {
            type: 'list-item',
            children: [{ text: 'two' }],
          },
        ],
      },
      {
        type: 'paragraph',
        children: [{ text: 'beta' }],
      },
    ]);
    assert.deepEqual(snapshot.selection, {
      kind: 'text',
      anchor: { path: [0, 1, 0], offset: 'two'.length },
      focus: { path: [0, 1, 0], offset: 'two'.length },
    });
    assert.equal(editorGetLastCommit(editor)?.changes.empty, false);
  });

  it('inserts a copied list fragment into selected text without swallowing surrounding text', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: '12345' }],
        },
      ],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [0, 0], offset: 3 },
      },
    });

    editor.update((tx) => {
      tx.slice.replace(
        ContentSlice.closed([
          {
            type: 'bulleted-list',
            children: [
              {
                type: 'list-item',
                children: [{ text: 'one' }],
              },
              {
                type: 'list-item',
                children: [{ text: 'two' }],
              },
            ],
          },
        ])
      );
    });

    const snapshot = editorGetSnapshot(editor);

    assert.deepEqual(snapshot.children, [
      {
        type: 'paragraph',
        children: [{ text: '12' }],
      },
      {
        type: 'bulleted-list',
        children: [
          {
            type: 'list-item',
            children: [{ text: 'one' }],
          },
          {
            type: 'list-item',
            children: [{ text: 'two' }],
          },
        ],
      },
      {
        type: 'paragraph',
        children: [{ text: '45' }],
      },
    ]);
    assert.deepEqual(snapshot.selection, {
      kind: 'text',
      anchor: { path: [1, 1, 0], offset: 'two'.length },
      focus: { path: [1, 1, 0], offset: 'two'.length },
    });
  });

  it('inserts paragraph fragments into a list item by keeping the first block in the list and splitting the tail', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        {
          type: 'bulleted-list',
          children: [
            {
              type: 'list-item',
              children: [{ text: 'one' }],
            },
            {
              type: 'list-item',
              children: [{ text: 'two' }],
            },
            {
              type: 'list-item',
              children: [{ text: 'three' }],
            },
            {
              type: 'list-item',
              children: [{ text: 'four' }],
            },
            {
              type: 'list-item',
              children: [{ text: 'five' }],
            },
          ],
        },
      ],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 3, 0], offset: 2 },
        focus: { path: [0, 3, 0], offset: 2 },
      },
    });

    editor.update((tx) => {
      tx.slice.replace(
        createOpenSlice([
          {
            type: 'paragraph',
            children: [{ text: 'Hello' }],
          },
          {
            type: 'paragraph',
            children: [{ text: 'World' }],
          },
        ])
      );
    });

    const snapshot = editorGetSnapshot(editor);

    assert.deepEqual(snapshot.children, [
      {
        type: 'bulleted-list',
        children: [
          {
            type: 'list-item',
            children: [{ text: 'one' }],
          },
          {
            type: 'list-item',
            children: [{ text: 'two' }],
          },
          {
            type: 'list-item',
            children: [{ text: 'three' }],
          },
          {
            type: 'list-item',
            children: [{ text: 'foHello' }],
          },
        ],
      },
      {
        type: 'paragraph',
        children: [{ text: 'Worldur' }],
      },
      {
        type: 'bulleted-list',
        children: [
          {
            type: 'list-item',
            children: [{ text: 'five' }],
          },
        ],
      },
    ]);
    assert.deepEqual(snapshot.selection, {
      kind: 'text',
      anchor: { path: [1, 0], offset: 'World'.length },
      focus: { path: [1, 0], offset: 'World'.length },
    });
  });

  it('inserts paragraph fragments at the end of a list as one list item followed by blocks', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        {
          type: 'bulleted-list',
          children: [
            {
              type: 'list-item',
              children: [{ text: 'one' }],
            },
            {
              type: 'list-item',
              children: [{ text: 'two' }],
            },
            {
              type: 'list-item',
              children: [{ text: '' }],
            },
          ],
        },
      ],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 2, 0], offset: 0 },
        focus: { path: [0, 2, 0], offset: 0 },
      },
    });

    editor.update((tx) => {
      tx.slice.replace(
        createOpenSlice([
          {
            type: 'paragraph',
            children: [{ text: 'Hello' }],
          },
          {
            type: 'paragraph',
            children: [{ text: 'World' }],
          },
        ])
      );
    });

    const snapshot = editorGetSnapshot(editor);

    assert.deepEqual(snapshot.children, [
      {
        type: 'bulleted-list',
        children: [
          {
            type: 'list-item',
            children: [{ text: 'one' }],
          },
          {
            type: 'list-item',
            children: [{ text: 'two' }],
          },
          {
            type: 'list-item',
            children: [{ text: 'Hello' }],
          },
        ],
      },
      {
        type: 'paragraph',
        children: [{ text: 'World' }],
      },
    ]);
    assert.deepEqual(snapshot.selection, {
      kind: 'text',
      anchor: { path: [1, 0], offset: 'World'.length },
      focus: { path: [1, 0], offset: 'World'.length },
    });
  });

  it('replaces an expanded text selection with a fragment', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: createChildren(),
      selection: {
        kind: 'text' as const,
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 4 },
      },
    });

    editor.update((tx) => {
      tx.slice.replace(
        createOpenSlice([
          {
            type: 'paragraph',
            children: [{ text: 'alpha' }],
          },
        ])
      );
    });

    const snapshot = editorGetSnapshot(editor);

    assert.deepEqual(snapshot.children, [
      {
        type: 'paragraph',
        children: [{ text: 'alpha' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'alpha' }],
      },
    ]);
    assert.deepEqual(snapshot.selection, {
      kind: 'text',
      anchor: { path: [1, 0], offset: 5 },
      focus: { path: [1, 0], offset: 5 },
    });
  });

  it('preserves the target block type when replacing its selected text with a single text-block fragment', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        {
          type: 'heading',
          children: [{ text: 'beta' }],
        },
      ],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 4 },
      },
    });

    editor.update((tx) => {
      tx.slice.replace(
        createOpenSlice([
          {
            type: 'paragraph',
            children: [{ text: 'alpha' }],
          },
        ])
      );
    });

    const snapshot = editorGetSnapshot(editor);

    assert.deepEqual(snapshot.children, [
      {
        type: 'heading',
        children: [{ text: 'alpha' }],
      },
    ]);
    assert.deepEqual(snapshot.selection, {
      kind: 'text',
      anchor: { path: [0, 0], offset: 5 },
      focus: { path: [0, 0], offset: 5 },
    });
  });
});

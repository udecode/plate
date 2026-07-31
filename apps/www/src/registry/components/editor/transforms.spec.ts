import { CodeBlockPlugin } from '@platejs/code-block/react';
import { LinkPlugin } from '@platejs/link/react';
import { BasePlaceholderPlugin } from '@platejs/media';
import { SuggestionPlugin } from '@platejs/suggestion/react';
import { type Selection, type Value, KEYS, schema } from 'platejs';
import { createPlateEditor, createPlatePlugin } from 'platejs/react';

import { BaseBasicBlocksKit } from './plugins/basic-blocks-base-kit';
import { BaseListKit } from './plugins/list-base-kit';
import { BaseToggleKit } from './plugins/toggle-base-kit';
import { insertBlock, insertInlineElement, setBlockType } from './transforms';
import {
  insertBlock as insertClassicBlock,
  setBlockType as setClassicBlockType,
} from './transforms-classic';

const CustomBlockPlugin = createPlatePlugin({
  name: 'customOwner',
  schema: { element: schema.element.textBlock() },
  type: 'custom',
});

const createEditor = ({
  selection = {
    kind: 'text',
    anchor: { offset: 2, path: [1, 0] },
    focus: { offset: 2, path: [1, 0] },
  },
  initialValue = [
    { children: [{ text: 'one' }], type: 'p' },
    { children: [{ text: 'two' }], type: 'p' },
  ],
}: Partial<{
  initialValue: Value;
  selection: Selection;
}> = {}) =>
  createPlateEditor({
    plugins: [
      ...BaseBasicBlocksKit,
      ...BaseListKit,
      ...BaseToggleKit,
      CodeBlockPlugin,
      LinkPlugin,
      BasePlaceholderPlugin,
      SuggestionPlugin,
      CustomBlockPlugin,
    ],
    selection,
    initialValue,
  });

describe('editor block transforms', () => {
  it('opens the floating link owner without a stale trigger API', () => {
    const editor = createEditor();

    insertInlineElement(editor, KEYS.link);

    expect(editor.plugin(LinkPlugin).store.get()).toMatchObject({
      mode: 'insert',
      openEditorId: editor.id,
      text: '',
    });
  });

  it('keeps selection inside the wrapped paragraph when turning a block into a blockquote', () => {
    const editor = createEditor();

    setBlockType(editor, KEYS.blockquote);

    expect(editor.read.children()).toMatchObject([
      { children: [{ text: 'one' }], type: 'p' },
      {
        children: [{ children: [{ text: 'two' }], type: 'p' }],
        type: 'blockquote',
      },
    ]);
    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 2, path: [1, 0, 0] },
      focus: { offset: 2, path: [1, 0, 0] },
    });
  });

  it('keeps selection inside the wrapped paragraph when turning a path into a blockquote', () => {
    const editor = createEditor();

    setBlockType(editor, KEYS.blockquote, { at: [1] });

    expect(editor.read.children()).toMatchObject([
      { children: [{ text: 'one' }], type: 'p' },
      {
        children: [{ children: [{ text: 'two' }], type: 'p' }],
        type: 'blockquote',
      },
    ]);
    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 2, path: [1, 0, 0] },
      focus: { offset: 2, path: [1, 0, 0] },
    });
  });

  it('does not nest a blockquote inside an active blockquote', () => {
    const editor = createEditor({
      selection: {
        kind: 'text',
        anchor: { offset: 2, path: [0, 0, 0] },
        focus: { offset: 2, path: [0, 0, 0] },
      },
      initialValue: [
        {
          children: [{ children: [{ text: 'two' }], type: 'p' }],
          type: KEYS.blockquote,
        },
      ],
    });

    setBlockType(editor, KEYS.blockquote);

    expect(editor.read.children()).toMatchObject([
      {
        children: [{ children: [{ text: 'two' }], type: 'p' }],
        type: KEYS.blockquote,
      },
    ]);
  });

  it('turns a paragraph into a list inside the owning update', () => {
    const editor = createEditor();

    setBlockType(editor, KEYS.ul);

    expect(editor.read.children()).toMatchObject([
      { children: [{ text: 'one' }], type: 'p' },
      {
        children: [{ text: 'two' }],
        indent: 1,
        listStyleType: KEYS.ul,
        type: KEYS.p,
      },
    ]);
  });

  it('selects the inserted blockquote paragraph instead of the previous block', () => {
    const editor = createEditor();

    insertBlock(editor, KEYS.blockquote);

    expect(editor.read.children()).toMatchObject([
      { children: [{ text: 'one' }], type: 'p' },
      { children: [{ text: 'two' }], type: 'p' },
      {
        children: [{ children: [{ text: '' }], type: 'p' }],
        type: 'blockquote',
      },
    ]);
    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 0, path: [2, 0, 0] },
      focus: { offset: 0, path: [2, 0, 0] },
    });
  });

  it('selects the inserted blockquote when replacing an empty current block', () => {
    const editor = createEditor({
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [1, 0] },
        focus: { offset: 0, path: [1, 0] },
      },
      initialValue: [
        { children: [{ text: 'one' }], type: 'p' },
        { children: [{ text: '' }], type: 'p' },
      ],
    });

    insertBlock(editor, KEYS.blockquote);

    expect(editor.read.children()).toMatchObject([
      { children: [{ text: 'one' }], type: 'p' },
      {
        children: [{ children: [{ text: '' }], type: 'p' }],
        type: 'blockquote',
      },
    ]);
    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 0, path: [1, 0, 0] },
      focus: { offset: 0, path: [1, 0, 0] },
    });
  });

  it('inserts a block and removes the empty source in one commit', () => {
    const editor = createEditor({
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [1, 0] },
        focus: { offset: 0, path: [1, 0] },
      },
      initialValue: [
        { children: [{ text: 'one' }], type: 'p' },
        { children: [{ text: '' }], type: 'p' },
      ],
    });
    const version = editor.read.lastCommit()?.version ?? 0;

    insertBlock(editor, KEYS.h2);

    expect(editor.read.lastCommit()?.version).toBe(version + 1);
    expect(editor.read.children()).toMatchObject([
      { children: [{ text: 'one' }], type: 'p' },
      { children: [{ text: '' }], type: KEYS.h2 },
    ]);
  });

  it('keeps a code block converted in place from an empty paragraph', () => {
    const editor = createEditor({
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [1, 0] },
        focus: { offset: 0, path: [1, 0] },
      },
      initialValue: [
        { children: [{ text: 'one' }], type: 'p' },
        { children: [{ text: '' }], type: 'p' },
      ],
    });

    insertBlock(editor, KEYS.codeBlock);

    expect(editor.read.children()).toMatchObject([
      { children: [{ text: 'one' }], type: 'p' },
      {
        children: [{ children: [{ text: '' }], type: 'code_line' }],
        type: 'code_block',
      },
    ]);
  });

  it.each([
    KEYS.audio,
    KEYS.file,
    KEYS.video,
  ])('inserts a %s placeholder through its plugin owner', (mediaType) => {
    const editor = createEditor({
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [1, 0] },
        focus: { offset: 0, path: [1, 0] },
      },
      initialValue: [
        { children: [{ text: 'one' }], type: KEYS.p },
        { children: [{ text: '' }], type: KEYS.p },
      ],
    });

    insertBlock(editor, mediaType);

    expect(editor.read.children()).toMatchObject([
      { children: [{ text: 'one' }], type: KEYS.p },
      {
        children: [{ text: '' }],
        mediaType,
        type: KEYS.placeholder,
      },
    ]);
  });
});

describe('classic editor block transforms', () => {
  it('keeps raw block types when no plugin owns the name', () => {
    const editor = createEditor();

    setClassicBlockType(editor, 'custom');

    expect(editor.read.children()).toMatchObject([
      { children: [{ text: 'one' }], type: 'p' },
      { children: [{ text: 'two' }], type: 'custom' },
    ]);
  });

  it('inserts raw block types when no plugin owns the name', () => {
    const editor = createEditor();

    insertClassicBlock(editor, 'custom');

    expect(editor.read.children()).toMatchObject([
      { children: [{ text: 'one' }], type: 'p' },
      { children: [{ text: 'two' }], type: 'p' },
      { children: [{ text: '' }], type: 'custom' },
    ]);
  });
});

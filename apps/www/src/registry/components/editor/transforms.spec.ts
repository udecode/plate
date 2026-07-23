import { CodeBlockPlugin } from '@platejs/code-block/react';
import { SuggestionPlugin } from '@platejs/suggestion/react';
import { type Selection, type Value, KEYS } from 'platejs';
import { createPlateEditor } from 'platejs/react';

import { BaseBasicBlocksKit } from './plugins/basic-blocks-base-kit';
import { BaseListKit } from './plugins/list-base-kit';
import { BaseToggleKit } from './plugins/toggle-base-kit';
import { insertBlock, setBlockType } from './transforms';

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
      SuggestionPlugin,
    ],
    selection,
    initialValue,
  });

describe('editor block transforms', () => {
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
});

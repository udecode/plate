import { SuggestionPlugin } from '@platejs/suggestion/react';
import { createBaseEditor, KEYS } from 'platejs';
import { CodeBlockPlugin } from '@platejs/code-block/react';

import { BaseBlockquotePlugin } from '../../../../../../packages/basic-nodes/src/lib/BaseBlockquotePlugin';
import { insertBlock, setBlockType } from './transforms';

const createEditor = ({
  selection = {
    anchor: { offset: 2, path: [1, 0] },
    focus: { offset: 2, path: [1, 0] },
  },
  value = [
    { children: [{ text: 'one' }], type: 'p' },
    { children: [{ text: 'two' }], type: 'p' },
  ],
}: Partial<{
  selection: any;
  value: any;
}> = {}) =>
  createBaseEditor({
    plugins: [BaseBlockquotePlugin, CodeBlockPlugin, SuggestionPlugin],
    selection,
    value,
  } as any);

describe('editor block transforms', () => {
  it('keeps selection inside the wrapped paragraph when turning a block into a blockquote', () => {
    const editor = createEditor();

    setBlockType(editor as any, KEYS.blockquote);

    expect(editor.read.children()).toMatchObject([
      { children: [{ text: 'one' }], type: 'p' },
      {
        children: [{ children: [{ text: 'two' }], type: 'p' }],
        type: 'blockquote',
      },
    ]);
    expect(editor.read.selection()).toEqual({
      anchor: { offset: 2, path: [1, 0, 0] },
      focus: { offset: 2, path: [1, 0, 0] },
    });
  });

  it('keeps selection inside the wrapped paragraph when turning a path into a blockquote', () => {
    const editor = createEditor();

    setBlockType(editor as any, KEYS.blockquote, { at: [1] });

    expect(editor.read.children()).toMatchObject([
      { children: [{ text: 'one' }], type: 'p' },
      {
        children: [{ children: [{ text: 'two' }], type: 'p' }],
        type: 'blockquote',
      },
    ]);
    expect(editor.read.selection()).toEqual({
      anchor: { offset: 2, path: [1, 0, 0] },
      focus: { offset: 2, path: [1, 0, 0] },
    });
  });

  it('selects the inserted blockquote paragraph instead of the previous block', () => {
    const editor = createEditor();

    insertBlock(editor as any, KEYS.blockquote);

    expect(editor.read.children()).toMatchObject([
      { children: [{ text: 'one' }], type: 'p' },
      { children: [{ text: 'two' }], type: 'p' },
      {
        children: [{ children: [{ text: '' }], type: 'p' }],
        type: 'blockquote',
      },
    ]);
    expect(editor.read.selection()).toEqual({
      anchor: { offset: 0, path: [2, 0, 0] },
      focus: { offset: 0, path: [2, 0, 0] },
    });
  });

  it('selects the inserted blockquote when replacing an empty current block', () => {
    const editor = createEditor({
      selection: {
        anchor: { offset: 0, path: [1, 0] },
        focus: { offset: 0, path: [1, 0] },
      },
      value: [
        { children: [{ text: 'one' }], type: 'p' },
        { children: [{ text: '' }], type: 'p' },
      ],
    });

    insertBlock(editor as any, KEYS.blockquote);

    expect(editor.read.children()).toMatchObject([
      { children: [{ text: 'one' }], type: 'p' },
      {
        children: [{ children: [{ text: '' }], type: 'p' }],
        type: 'blockquote',
      },
    ]);
    expect(editor.read.selection()).toEqual({
      anchor: { offset: 0, path: [1, 0, 0] },
      focus: { offset: 0, path: [1, 0, 0] },
    });
  });

  it('keeps a code block converted in place from an empty paragraph', () => {
    const editor = createEditor({
      selection: {
        anchor: { offset: 0, path: [1, 0] },
        focus: { offset: 0, path: [1, 0] },
      },
      value: [
        { children: [{ text: 'one' }], type: 'p' },
        { children: [{ text: '' }], type: 'p' },
      ],
    });

    insertBlock(editor as any, KEYS.codeBlock);

    expect(editor.read.children()).toMatchObject([
      { children: [{ text: 'one' }], type: 'p' },
      {
        children: [{ children: [{ text: '' }], type: 'code_line' }],
        type: 'code_block',
      },
    ]);
  });
});

import { createBaseEditor } from '@platejs/core';

import { BlockSelectionPlugin } from '../BlockSelectionPlugin';
import { insertBlocksAndSelect } from './insertBlocksAndSelect';
import { removeBlockSelectionNodes } from './removeBlockSelectionNodes';
import {
  setBlockSelectionIndent,
  setBlockSelectionNodes,
  setBlockSelectionTexts,
} from './setBlockSelectionNodes';

const createBlockSelectionEditor = () =>
  createBaseEditor({
    plugins: [BlockSelectionPlugin],
    value: [
      {
        id: 'block1',
        children: [{ text: 'One' }],
        type: 'p',
      },
      {
        id: 'block2',
        children: [{ text: 'Two' }],
        type: 'p',
      },
    ],
  }) as any;

describe('block selection document transforms', () => {
  it('inserts blocks through the editor update API', () => {
    const editor = createBlockSelectionEditor();

    insertBlocksAndSelect(
      editor,
      [
        {
          id: 'block3',
          children: [{ text: 'Three' }],
          type: 'p',
        },
      ],
      { at: [1] }
    );

    expect(editor.read.children().map((node: any) => node.id)).toEqual([
      'block1',
      'block3',
      'block2',
    ]);
  });

  it('removes selected blocks through the editor update API', () => {
    const editor = createBlockSelectionEditor();

    editor
      .plugin(BlockSelectionPlugin)
      .setOption('selectedIds', new Set(['block1']));

    removeBlockSelectionNodes(editor);

    expect(editor.read.children().map((node: any) => node.id)).toEqual([
      'block2',
    ]);
  });

  it('sets selected block element props through the editor update API', () => {
    const editor = createBlockSelectionEditor();

    editor
      .plugin(BlockSelectionPlugin)
      .setOption('selectedIds', new Set(['block1']));

    setBlockSelectionNodes(editor, { align: 'center' } as any);

    expect(editor.read.children()[0].align).toBe('center');
    expect(editor.read.children()[1].align).toBeUndefined();
  });

  it('sets selected block indentation through the editor update API', () => {
    const editor = createBlockSelectionEditor();

    editor
      .plugin(BlockSelectionPlugin)
      .setOption('selectedIds', new Set(['block1']));

    setBlockSelectionIndent(editor, 2);
    setBlockSelectionIndent(editor, -5);

    expect(editor.read.children()[0].indent).toBe(0);
  });

  it('sets selected text props through the editor update API', () => {
    const editor = createBlockSelectionEditor();

    editor
      .plugin(BlockSelectionPlugin)
      .setOption('selectedIds', new Set(['block1']));

    setBlockSelectionTexts(editor, { bold: true } as any);

    expect(editor.read.children()[0].children[0].bold).toBe(true);
    expect(editor.read.children()[1].children[0].bold).toBeUndefined();
  });
});

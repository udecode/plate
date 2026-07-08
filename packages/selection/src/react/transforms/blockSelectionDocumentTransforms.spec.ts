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
  });

describe('block selection document transforms', () => {
  it('inserts blocks through the editor update API', () => {
    const editor = createBlockSelectionEditor();

    editor.update((tx) => {
      insertBlocksAndSelect(
        editor,
        tx,
        [
          {
            id: 'block3',
            children: [{ text: 'Three' }],
            type: 'p',
          },
        ],
        { at: [1] }
      );
    });

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

    editor.update((tx) => {
      removeBlockSelectionNodes(editor, tx);
    });

    expect(editor.read.children().map((node: any) => node.id)).toEqual([
      'block2',
    ]);
  });

  it('sets selected block element props through the editor update API', () => {
    const editor = createBlockSelectionEditor();

    editor
      .plugin(BlockSelectionPlugin)
      .setOption('selectedIds', new Set(['block1']));

    editor.update((tx) => {
      setBlockSelectionNodes(editor, tx, { align: 'center' } as any);
    });

    expect(editor.read.children()[0].align).toBe('center');
    expect(editor.read.children()[1].align).toBeUndefined();
  });

  it('sets selected block indentation through the editor update API', () => {
    const editor = createBlockSelectionEditor();

    editor
      .plugin(BlockSelectionPlugin)
      .setOption('selectedIds', new Set(['block1']));

    editor.update((tx) => {
      setBlockSelectionIndent(editor, tx, 2);
      setBlockSelectionIndent(editor, tx, -5);
    });

    expect(editor.read.children()[0].indent).toBe(0);
  });

  it('sets selected text props through the editor update API', () => {
    const editor = createBlockSelectionEditor();

    editor
      .plugin(BlockSelectionPlugin)
      .setOption('selectedIds', new Set(['block1']));

    editor.update((tx) => {
      setBlockSelectionTexts(editor, tx, { bold: true } as any);
    });

    expect(editor.read.children()[0].children[0].bold).toBe(true);
    expect(editor.read.children()[1].children[0].bold).toBeUndefined();
  });
});

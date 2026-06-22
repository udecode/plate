import { createSlateEditor } from 'platejs';

import { BlockSelectionPlugin } from '../BlockSelectionPlugin';
import { insertBlocksAndSelect } from './insertBlocksAndSelect';
import { removeBlockSelectionNodes } from './removeBlockSelectionNodes';
import {
  setBlockSelectionIndent,
  setBlockSelectionNodes,
  setBlockSelectionTexts,
} from './setBlockSelectionNodes';

const createBlockSelectionEditor = () =>
  createSlateEditor({
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

const spyOnUpdate = (editor: any) => {
  const update = editor.update;
  const updateSpy = mock((callback: (tx: unknown) => unknown) =>
    update(callback)
  );

  editor.update = updateSpy;

  return updateSpy;
};

describe('block selection document transforms', () => {
  it('inserts blocks through the editor update transaction', () => {
    const editor = createBlockSelectionEditor();
    const updateSpy = spyOnUpdate(editor);

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

    expect(updateSpy).toHaveBeenCalled();
    expect(editor.children.map((node: any) => node.id)).toEqual([
      'block1',
      'block3',
      'block2',
    ]);
  });

  it('removes selected blocks through the editor update transaction', () => {
    const editor = createBlockSelectionEditor();
    const updateSpy = spyOnUpdate(editor);

    editor.setOption(BlockSelectionPlugin, 'selectedIds', new Set(['block1']));

    removeBlockSelectionNodes(editor);

    expect(updateSpy).toHaveBeenCalled();
    expect(editor.children.map((node: any) => node.id)).toEqual(['block2']);
  });

  it('sets selected block element props through the editor update transaction', () => {
    const editor = createBlockSelectionEditor();
    const updateSpy = spyOnUpdate(editor);

    editor.setOption(BlockSelectionPlugin, 'selectedIds', new Set(['block1']));

    setBlockSelectionNodes(editor, { align: 'center' } as any);

    expect(updateSpy).toHaveBeenCalled();
    expect(editor.children[0].align).toBe('center');
    expect(editor.children[1].align).toBeUndefined();
  });

  it('sets selected block indentation through the editor update transaction', () => {
    const editor = createBlockSelectionEditor();
    const updateSpy = spyOnUpdate(editor);

    editor.setOption(BlockSelectionPlugin, 'selectedIds', new Set(['block1']));

    setBlockSelectionIndent(editor, 2);
    setBlockSelectionIndent(editor, -5);

    expect(updateSpy).toHaveBeenCalledTimes(2);
    expect(editor.children[0].indent).toBe(0);
  });

  it('sets selected text props through the editor update transaction', () => {
    const editor = createBlockSelectionEditor();
    const updateSpy = spyOnUpdate(editor);

    editor.setOption(BlockSelectionPlugin, 'selectedIds', new Set(['block1']));

    setBlockSelectionTexts(editor, { bold: true } as any);

    expect(updateSpy).toHaveBeenCalled();
    expect(editor.children[0].children[0].bold).toBe(true);
    expect(editor.children[1].children[0].bold).toBeUndefined();
  });
});

import { createBaseEditor } from '@platejs/core';

import {
  TestBoldPlugin,
  TestElementPropertiesPlugin,
} from '../../__tests__/testPlugins';
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
    plugins: [
      BlockSelectionPlugin,
      TestBoldPlugin,
      TestElementPropertiesPlugin,
    ],
    initialValue: [
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
    const insertedCallback = mock();

    editor.update((tx, context) => {
      insertBlocksAndSelect(
        editor,
        tx,
        context,
        [
          {
            id: 'block3',
            children: [{ text: 'Three' }],
            type: 'p',
          },
        ],
        { at: [1], insertedCallback }
      );
    });

    expect(editor.read.children().map((node: any) => node.id)).toEqual([
      'block1',
      'block3',
      'block2',
    ]);
    expect(insertedCallback).toHaveBeenCalledTimes(1);
    expect(
      editor.plugin(BlockSelectionPlugin).getOption('selectedIds')
    ).toEqual(new Set(['block3']));
  });

  it('does not publish insert callbacks or plugin state on rollback', () => {
    const editor = createBlockSelectionEditor();
    const insertedCallback = mock();
    const selectedIds = editor
      .plugin(BlockSelectionPlugin)
      .getOption('selectedIds');

    expect(() =>
      editor.update((tx, context) => {
        insertBlocksAndSelect(
          editor,
          tx,
          context,
          [
            {
              id: 'block3',
              children: [{ text: 'Three' }],
              type: 'p',
            },
          ],
          { at: [1], insertedCallback }
        );
        throw new Error('rollback');
      })
    ).toThrow('rollback');

    expect(insertedCallback).not.toHaveBeenCalled();
    expect(editor.read.children().map((node: any) => node.id)).toEqual([
      'block1',
      'block2',
    ]);
    expect(editor.plugin(BlockSelectionPlugin).getOption('selectedIds')).toBe(
      selectedIds
    );
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

  it('sets a selected block inserted earlier in the same transaction', () => {
    const editor = createBlockSelectionEditor();

    editor
      .plugin(BlockSelectionPlugin)
      .setOption('selectedIds', new Set(['block3']));

    editor.update((tx) => {
      tx.nodes.insert(
        { id: 'block3', children: [{ text: 'Three' }], type: 'p' },
        { at: [1] }
      );
      setBlockSelectionNodes(editor, tx, { align: 'center' } as any);
    });

    expect(editor.read.children()[1].align).toBe('center');
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

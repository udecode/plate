import { createBaseEditor } from '@platejs/core';

import {
  TestBoldPlugin,
  TestElementPropertiesPlugin,
} from '../../__tests__/testPlugins';
import { BlockSelectionPlugin } from '../BlockSelectionPlugin';

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

    editor.update((tx) => {
      tx.blockSelection.insertBlocksAndSelect(
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
      editor.plugin(BlockSelectionPlugin).store.get('selectedIds')
    ).toEqual(new Set(['block3']));
  });

  it('does not publish insert callbacks or plugin state on rollback', () => {
    const editor = createBlockSelectionEditor();
    const insertedCallback = mock();
    const selectedIds = editor
      .plugin(BlockSelectionPlugin)
      .store.get('selectedIds');

    expect(() =>
      editor.update((tx) => {
        tx.blockSelection.insertBlocksAndSelect(
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
    expect(editor.plugin(BlockSelectionPlugin).store.get('selectedIds')).toBe(
      selectedIds
    );
  });

  it('removes selected blocks through the editor update API', () => {
    const editor = createBlockSelectionEditor();

    editor
      .plugin(BlockSelectionPlugin)
      .store.set({ selectedIds: new Set(['block1']) });

    editor.update((tx) => {
      tx.blockSelection.removeNodes();
    });

    expect(editor.read.children().map((node: any) => node.id)).toEqual([
      'block2',
    ]);
  });

  it('sets selected block element props through the editor update API', () => {
    const editor = createBlockSelectionEditor();

    editor
      .plugin(BlockSelectionPlugin)
      .store.set({ selectedIds: new Set(['block1']) });

    editor.update((tx) => {
      tx.blockSelection.setNodes({ align: 'center' } as any);
    });

    expect(editor.read.children()[0].align).toBe('center');
    expect(editor.read.children()[1].align).toBeUndefined();
  });

  it('sets a selected block inserted earlier in the same transaction', () => {
    const editor = createBlockSelectionEditor();

    editor
      .plugin(BlockSelectionPlugin)
      .store.set({ selectedIds: new Set(['block3']) });

    editor.update((tx) => {
      tx.nodes.insert(
        { id: 'block3', children: [{ text: 'Three' }], type: 'p' },
        { at: [1] }
      );
      tx.blockSelection.setNodes({ align: 'center' } as any);
    });

    expect(editor.read.children()[1].align).toBe('center');
  });

  it('sets selected block indentation through the editor update API', () => {
    const editor = createBlockSelectionEditor();

    editor
      .plugin(BlockSelectionPlugin)
      .store.set({ selectedIds: new Set(['block1']) });

    editor.update((tx) => {
      tx.blockSelection.setIndent(2);
      tx.blockSelection.setIndent(-5);
    });

    expect(editor.read.children()[0].indent).toBe(0);
  });

  it('sets selected text props through the editor update API', () => {
    const editor = createBlockSelectionEditor();

    editor
      .plugin(BlockSelectionPlugin)
      .store.set({ selectedIds: new Set(['block1']) });

    editor.update((tx) => {
      tx.blockSelection.setTexts({ bold: true } as any);
    });

    expect(editor.read.children()[0].children[0].bold).toBe(true);
    expect(editor.read.children()[1].children[0].bold).toBeUndefined();
  });
});

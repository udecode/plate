import { type BaseEditor, createBaseEditor } from '@platejs/core';

import { BlockSelectionPlugin } from '../../BlockSelectionPlugin';
import { setSelectedIds } from './setSelectedIds';

const createTestEditor = () =>
  createBaseEditor({
    plugins: [BlockSelectionPlugin],
    value: [
      {
        id: 'existing',
        children: [{ text: 'Existing' }],
        type: 'p',
      },
      {
        id: 'row-1',
        children: [{ text: 'Row 1' }],
        type: 'tr',
      },
      {
        id: 'row-2',
        children: [{ text: 'Row 2' }],
        type: 'tr',
      },
    ],
  });

const createSelectableElement = (id?: string) =>
  ({
    dataset: id ? { blockId: id } : {},
  }) as unknown as Element;

const getSelectedIds = (editor: BaseEditor) =>
  Array.from(
    editor.plugin(BlockSelectionPlugin).getOption('selectedIds') ?? []
  ).sort();

describe('setSelectedIds', () => {
  let editor: BaseEditor;

  beforeEach(() => {
    editor = createTestEditor();
  });

  it('replaces the selection when explicit ids are provided', () => {
    editor
      .plugin(BlockSelectionPlugin)
      .setOption('selectedIds', new Set(['existing']));

    setSelectedIds(editor, { ids: ['row-1', 'row-2'] });

    expect(getSelectedIds(editor)).toEqual(['row-1', 'row-2']);
    expect(editor.plugin(BlockSelectionPlugin).getOption('isSelecting')).toBe(
      true
    );
  });

  it('merges added ids and removes removed ids from selectable elements', () => {
    editor
      .plugin(BlockSelectionPlugin)
      .setOption('selectedIds', new Set(['existing', 'row-2']));

    setSelectedIds(editor, {
      added: [createSelectableElement('row-1'), createSelectableElement()],
      removed: [createSelectableElement('row-2'), createSelectableElement()],
    });

    expect(getSelectedIds(editor)).toEqual(['existing', 'row-1']);
    expect(editor.plugin(BlockSelectionPlugin).getOption('isSelecting')).toBe(
      true
    );
  });
});

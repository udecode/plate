import { type BaseEditor, createBaseEditor } from '@platejs/core';

import {
  TestTableCellPlugin,
  TestTablePlugin,
  TestTableRowPlugin,
} from '../../../__tests__/testPlugins';
import * as domUtils from '../../../lib';
import { BlockSelectionPlugin } from '../../BlockSelectionPlugin';
import { addSelectedRow, setSelectedIds } from './setSelectedIds';

const createTestEditor = () =>
  createBaseEditor({
    plugins: [
      BlockSelectionPlugin,
      TestTablePlugin,
      TestTableRowPlugin,
      TestTableCellPlugin,
    ],
    initialValue: [
      {
        id: 'existing',
        children: [{ text: 'Existing' }],
        type: 'p',
      },
      {
        id: 'table',
        children: [
          {
            id: 'row-1',
            children: [
              {
                children: [
                  {
                    children: [{ text: 'Row 1' }],
                    type: 'p',
                  },
                ],
                type: 'td',
              },
            ],
            type: 'tr',
          },
          {
            id: 'row-2',
            children: [
              {
                children: [
                  {
                    children: [{ text: 'Row 2' }],
                    type: 'p',
                  },
                ],
                type: 'td',
              },
            ],
            type: 'tr',
          },
        ],
        type: 'table',
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
  let querySelectorSelectableSpy: AnyTestMock;

  beforeEach(() => {
    querySelectorSelectableSpy = spyOn(
      domUtils,
      'querySelectorSelectable'
    ).mockImplementation((id: string) => {
      const element = document.createElement('div');

      element.dataset.blockId = id;

      return element;
    });

    editor = createTestEditor();
  });

  afterEach(() => {
    querySelectorSelectableSpy?.mockRestore();
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

  it('adds a selected row and clears the previous selection by default', () => {
    editor
      .plugin(BlockSelectionPlugin)
      .setOption('selectedIds', new Set(['existing']));

    addSelectedRow(editor, 'row-1');

    expect(getSelectedIds(editor)).toEqual(['row-1']);
  });

  it('adds a selected row without clearing when requested', () => {
    editor
      .plugin(BlockSelectionPlugin)
      .setOption('selectedIds', new Set(['existing']));

    addSelectedRow(editor, 'row-1', { clear: false });

    expect(getSelectedIds(editor)).toEqual(['existing', 'row-1']);
  });

  it('removes a selected row after the delay', async () => {
    addSelectedRow(editor, 'row-1', { delay: 1 });

    expect(getSelectedIds(editor)).toEqual(['row-1']);

    await new Promise((resolve) => setTimeout(resolve, 5));

    expect(getSelectedIds(editor)).toEqual([]);
  });

  it('exposes addSelectedRow through the block selection API', () => {
    editor.plugin(BlockSelectionPlugin).api.addSelectedRow('row-1');

    expect(getSelectedIds(editor)).toEqual(['row-1']);
  });
});

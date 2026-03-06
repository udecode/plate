import { createSlateEditor, type SlateEditor } from 'platejs';

import * as domUtils from '../../../lib';
import { BlockSelectionPlugin } from '../../BlockSelectionPlugin';
import { addSelectedRow, setSelectedIds } from './setSelectedIds';

const createTestEditor = () =>
  createSlateEditor({
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

const getSelectedIds = (editor: SlateEditor) =>
  Array.from(
    editor.getOption(BlockSelectionPlugin, 'selectedIds') ?? []
  ).sort();

describe('setSelectedIds', () => {
  let editor: SlateEditor;

  beforeEach(() => {
    editor = createTestEditor();
  });

  it('replaces the selection when explicit ids are provided', () => {
    editor.setOption(
      BlockSelectionPlugin,
      'selectedIds',
      new Set(['existing'])
    );

    setSelectedIds(editor, { ids: ['row-1', 'row-2'] });

    expect(getSelectedIds(editor)).toEqual(['row-1', 'row-2']);
    expect(editor.getOption(BlockSelectionPlugin, 'isSelecting')).toBe(true);
  });

  it('merges added ids and removes removed ids from selectable elements', () => {
    editor.setOption(
      BlockSelectionPlugin,
      'selectedIds',
      new Set(['existing', 'row-2'])
    );

    setSelectedIds(editor, {
      added: [createSelectableElement('row-1'), createSelectableElement()],
      removed: [createSelectableElement('row-2'), createSelectableElement()],
    });

    expect(getSelectedIds(editor)).toEqual(['existing', 'row-1']);
    expect(editor.getOption(BlockSelectionPlugin, 'isSelecting')).toBe(true);
  });
});

describe('addSelectedRow', () => {
  let editor: SlateEditor;
  let querySelectorSelectableSpy: ReturnType<typeof spyOn> | undefined;
  let setTimeoutSpy: ReturnType<typeof spyOn> | undefined;

  afterEach(() => {
    querySelectorSelectableSpy?.mockRestore();
    setTimeoutSpy?.mockRestore();
  });

  beforeEach(() => {
    editor = createTestEditor();
  });

  it('clears the previous selection before selecting a new row by default', () => {
    querySelectorSelectableSpy = spyOn(
      domUtils,
      'querySelectorSelectable'
    ).mockImplementation(((id: string) =>
      createSelectableElement(id)) as typeof domUtils.querySelectorSelectable);
    editor.setOption(
      BlockSelectionPlugin,
      'selectedIds',
      new Set(['existing'])
    );

    addSelectedRow(editor, 'row-1');

    expect(getSelectedIds(editor)).toEqual(['row-1']);
  });

  it('preserves the existing selection when clear is false', () => {
    querySelectorSelectableSpy = spyOn(
      domUtils,
      'querySelectorSelectable'
    ).mockImplementation(((id: string) =>
      createSelectableElement(id)) as typeof domUtils.querySelectorSelectable);
    editor.setOption(
      BlockSelectionPlugin,
      'selectedIds',
      new Set(['existing'])
    );

    addSelectedRow(editor, 'row-1', { clear: false });

    expect(getSelectedIds(editor)).toEqual(['existing', 'row-1']);
  });

  it('keeps selection state unchanged when the row cannot be found', () => {
    querySelectorSelectableSpy = spyOn(
      domUtils,
      'querySelectorSelectable'
    ).mockReturnValue(null);
    editor.setOption(
      BlockSelectionPlugin,
      'selectedIds',
      new Set(['existing'])
    );

    addSelectedRow(editor, 'missing');

    expect(getSelectedIds(editor)).toEqual(['existing']);
  });

  it('removes the temporary row selection after the configured delay', () => {
    querySelectorSelectableSpy = spyOn(
      domUtils,
      'querySelectorSelectable'
    ).mockImplementation(((id: string) =>
      createSelectableElement(id)) as typeof domUtils.querySelectorSelectable);
    setTimeoutSpy = spyOn(globalThis, 'setTimeout').mockImplementation(((
      callback: TimerHandler
    ) => {
      if (typeof callback === 'function') {
        callback();
      }

      return 0 as any;
    }) as typeof globalThis.setTimeout);
    editor.setOption(
      BlockSelectionPlugin,
      'selectedIds',
      new Set(['existing'])
    );

    addSelectedRow(editor, 'row-1', { clear: false, delay: 25 });

    expect(setTimeoutSpy.mock.calls[0]?.[1]).toBe(25);
    expect(getSelectedIds(editor)).toEqual(['existing']);
  });
});

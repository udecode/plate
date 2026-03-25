/** @jsx jsxt */

import { type SlateEditor, createSlateEditor } from 'platejs';

import { jsxt } from '@platejs/test-utils';

import { getTestTablePlugins } from '../__tests__/getTestTablePlugins';
import {
  getSelectedCell,
  getSelectedCellEntries,
  getSelectedCellIds,
  getSelectedCells,
  getSelectedTableIds,
  getSelectedTables,
  isCellSelected,
  isSelectingCell,
} from './getSelectedCells';

jsxt;

const createTableEditor = (input: SlateEditor) =>
  createSlateEditor({
    nodeId: true,
    plugins: getTestTablePlugins(),
    selection: input.selection,
    value: input.children,
  });

describe('getSelectedCells helpers', () => {
  it('returns selected cells, ids, and tables for a multi-cell selection', () => {
    const input = (
      <editor>
        <htable id="table-1">
          <htr>
            <htd id="c11">
              <hp>
                <anchor />
                11
              </hp>
            </htd>
            <htd id="c12">
              <hp>12</hp>
            </htd>
          </htr>
          <htr>
            <htd id="c21">
              <hp>
                21
                <focus />
              </hp>
            </htd>
            <htd>
              <hp>22</hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as any as SlateEditor;

    const editor = createTableEditor(input);

    expect(getSelectedCellEntries(editor)).toHaveLength(2);
    expect(getSelectedCells(editor)?.map((cell) => cell.id)).toEqual([
      'c11',
      'c21',
    ]);
    expect(getSelectedCells(editor)).toBe(getSelectedCells(editor));
    expect(getSelectedCellIds(editor)).toEqual(['c11', 'c21']);
    expect(getSelectedTableIds(editor)).toBeNull();
    expect(getSelectedTables(editor)).toHaveLength(1);
    expect(getSelectedCell(editor, 'c21')?.id).toBe('c21');
    expect(isCellSelected(editor, 'c11')).toBe(true);
    expect(isSelectingCell(editor)).toBe(true);
  });

  it('returns nullish values when only one cell is active and updates after selection changes', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd>
              <hp>
                11
                <cursor />
              </hp>
            </htd>
            <htd>
              <hp>12</hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as any as SlateEditor;

    const editor = createTableEditor(input);

    expect(getSelectedCells(editor)).toBeNull();
    expect(getSelectedCellIds(editor)).toBeNull();
    expect(getSelectedTables(editor)).toBeNull();
    expect(isSelectingCell(editor)).toBe(false);

    editor.tf.select({
      anchor: { offset: 0, path: [0, 0, 0, 0, 0] },
      focus: { offset: 0, path: [0, 0, 1, 0, 0] },
    });

    expect(getSelectedCells(editor)).toHaveLength(2);
    expect(isSelectingCell(editor)).toBe(true);
  });

  it('caches null results for single-cell selections and returns null table ids', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd>
              <hp>
                one
                <cursor />
              </hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as any as SlateEditor;

    const editor = createTableEditor(input);

    expect(getSelectedCells(editor)).toBeNull();
    expect(getSelectedCells(editor)).toBeNull();
    expect(getSelectedCellIds(editor)).toBeNull();
    expect(getSelectedCellIds(editor)).toBeNull();
    expect(getSelectedTableIds(editor)).toBeNull();
    expect(getSelectedTableIds(editor)).toBeNull();
  });
});

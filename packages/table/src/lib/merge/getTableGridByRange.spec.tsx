/** @jsx jsxt */

import { createPlateEditor } from '@platejs/core/react';
import { NodeApi } from '@platejs/plite';
import type { TTableRowElement } from '@platejs/utils';

import { jsxt, type TestEditor } from '@platejs/test-utils';

import { getTestTablePlugins } from '../__tests__/getTestTablePlugins';
import { getTableMergeGridByRange } from './getTableGridByRange';

jsxt;

const createTableEditor = (input: TestEditor) =>
  createPlateEditor({
    nodeId: true,
    plugins: getTestTablePlugins({ disableMerge: false }),
    selection: input.selection,
    initialValue: input.children,
  });

describe('getTableMergeGridByRange', () => {
  it('returns both cell entries and a table entry for format=all', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd>
              <hp>
                <anchor />
                11
              </hp>
            </htd>
            <htd>
              <hp>12</hp>
            </htd>
          </htr>
          <htr>
            <htd>
              <hp>21</hp>
            </htd>
            <htd>
              <hp>
                22
                <focus />
              </hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as TestEditor;

    const editor = createTableEditor(input);
    const result = getTableMergeGridByRange(editor, {
      at: editor.read.selection()!,
      format: 'all',
    });

    expect(result.cellEntries).toHaveLength(4);
    expect(result.tableEntries).toHaveLength(1);
    expect(result.tableEntries[0]?.[1]).toEqual([0]);
    const table = result.tableEntries[0]?.[0];
    const firstRow = table?.children[0] as TTableRowElement | undefined;

    expect(table?.children).toHaveLength(2);
    expect(firstRow?.children).toHaveLength(2);
  });

  it('returns only the cell entries for format=cell', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd colSpan={2}>
              <hp>
                <anchor />
                11
              </hp>
            </htd>
            <htd>
              <hp>13</hp>
            </htd>
          </htr>
          <htr>
            <htd>
              <hp>21</hp>
            </htd>
            <htd>
              <hp>
                22
                <focus />
              </hp>
            </htd>
            <htd>
              <hp>23</hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as TestEditor;

    const editor = createTableEditor(input);
    const result = getTableMergeGridByRange(editor, {
      at: editor.read.selection()!,
      format: 'cell',
    });

    expect(result.map(([cell]) => NodeApi.string(cell))).toEqual([
      '11',
      '21',
      '22',
    ]);
  });
});

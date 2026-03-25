/** @jsx jsxt */

import { type SlateEditor, createSlateEditor } from 'platejs';

import { jsxt } from '@platejs/test-utils';

import { getTestTablePlugins } from '../__tests__/getTestTablePlugins';
import { getTableMergeGridByRange } from './getTableGridByRange';

jsxt;

const createTableEditor = (input: SlateEditor) =>
  createSlateEditor({
    nodeId: true,
    plugins: getTestTablePlugins({ disableMerge: false }),
    selection: input.selection,
    value: input.children,
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
    ) as any as SlateEditor;

    const editor = createTableEditor(input);
    const result = getTableMergeGridByRange(editor, {
      at: editor.selection!,
      format: 'all',
    });

    expect(result.cellEntries).toHaveLength(4);
    expect(result.tableEntries).toHaveLength(1);
    expect(result.tableEntries[0]?.[1]).toEqual([0]);
    expect((result.tableEntries[0]?.[0] as any).children).toHaveLength(2);
    expect(
      (result.tableEntries[0]?.[0] as any).children[0].children
    ).toHaveLength(2);
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
    ) as any as SlateEditor;

    const editor = createTableEditor(input);
    const result = getTableMergeGridByRange(editor, {
      at: editor.selection!,
      format: 'cell',
    });

    expect(
      result.map(([cell]) => (cell as any).children[0].children[0].text)
    ).toEqual(['11', '21', '22']);
  });
});

/** @jsx jsxt */

import { createPlateEditor } from '@platejs/core/react';
import type { TTableCellElement } from '@platejs/utils';

import { jsxt, type TestEditor } from '@platejs/test-utils';

import { getTestTablePlugins } from '../__tests__/getTestTablePlugins';
import { getTableRowIndex } from './getTableRowIndex';

jsxt;

const createTableEditor = (input: TestEditor) =>
  createPlateEditor({
    nodeId: true,
    plugins: getTestTablePlugins(),
    value: input.children,
  });

describe('getTableRowIndex', () => {
  it('returns the row index for a table cell in the editor tree', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd>
              <hp>11</hp>
            </htd>
          </htr>
          <htr>
            <htd>
              <hp>21</hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as TestEditor;

    const editor = createTableEditor(input);
    const cellNode = editor.read.nodes.get<TTableCellElement>([0, 1, 0], {
      required: true,
    })[0];

    expect(getTableRowIndex(editor, cellNode)).toBe(1);
  });

  it('falls back to zero for detached cells', () => {
    const editor = createTableEditor((<editor />) as TestEditor);

    expect(
      getTableRowIndex(editor, {
        children: [{ text: 'ghost' }],
        type: 'td',
      })
    ).toBe(0);
  });
});

/** @jsx jsxt */

import { type SlateEditor, createSlateEditor } from 'platejs';

import { jsxt } from '@platejs/test-utils';

import { getTestTablePlugins } from '../__tests__/getTestTablePlugins';
import { getTableRowIndex } from './getTableRowIndex';

jsxt;

const createTableEditor = (input: SlateEditor) =>
  createSlateEditor({
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
    ) as any as SlateEditor;

    const editor = createTableEditor(input);
    const cellNode = ((editor.children[0] as any).children[1] as any)
      .children[0];

    expect(getTableRowIndex(editor, cellNode)).toBe(1);
  });

  it('falls back to zero for detached cells', () => {
    const editor = createTableEditor((<editor />) as any as SlateEditor);

    expect(
      getTableRowIndex(editor, {
        children: [{ text: 'ghost' }],
        type: 'td',
      } as any)
    ).toBe(0);
  });
});

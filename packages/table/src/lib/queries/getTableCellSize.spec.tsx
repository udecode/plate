/** @jsx jsxt */

import { type SlateEditor, createSlateEditor } from 'platejs';

import { jsxt } from '@platejs/test-utils';

import { getTestTablePlugins } from '../__tests__/getTestTablePlugins';
import { getTableCellSize } from './getTableCellSize';

jsxt;

const createTableEditor = (input: SlateEditor) =>
  createSlateEditor({
    nodeId: true,
    plugins: getTestTablePlugins(),
    value: input.children,
  });

describe('getTableCellSize', () => {
  it('falls back to zero width and height when the cell has no row parent', () => {
    const input = (
      <editor>
        <htd>
          <hp>orphan</hp>
        </htd>
      </editor>
    ) as any as SlateEditor;

    const editor = createTableEditor(input);
    const element = editor.children[0] as any;

    expect(getTableCellSize(editor, { element })).toEqual({
      minHeight: 0,
      width: 0,
    });
  });

  it('sums the table column widths across the current cell colSpan', () => {
    const input = (
      <editor>
        <htable colSizes={[40, 50, 60]}>
          <htr size={72}>
            <htd>
              <hp>11</hp>
            </htd>
            <htd colSpan={2}>
              <hp>12</hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as any as SlateEditor;

    const editor = createTableEditor(input);
    const element = ((editor.children[0] as any).children[0] as any)
      .children[1];

    expect(getTableCellSize(editor, { element })).toEqual({
      minHeight: 72,
      width: 110,
    });
  });

  it('uses explicit row and column sizes when provided', () => {
    const input = (
      <editor>
        <htable colSizes={[40, 50, 60]}>
          <htr size={72}>
            <htd>
              <hp>11</hp>
            </htd>
            <htd colSpan={2}>
              <hp>12</hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as any as SlateEditor;

    const editor = createTableEditor(input);
    const element = ((editor.children[0] as any).children[0] as any)
      .children[1];

    expect(
      getTableCellSize(editor, {
        colSizes: [10, 20, 30],
        element,
        rowSize: 99,
      })
    ).toEqual({
      minHeight: 99,
      width: 50,
    });
  });
});

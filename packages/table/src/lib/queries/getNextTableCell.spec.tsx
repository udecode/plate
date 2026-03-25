/** @jsx jsxt */

import { type SlateEditor, createSlateEditor } from 'platejs';

import { jsxt } from '@platejs/test-utils';

import { getTestTablePlugins } from '../__tests__/getTestTablePlugins';
import { getNextTableCell } from './getNextTableCell';

jsxt;

const createTableEditor = (input: SlateEditor) =>
  createSlateEditor({
    nodeId: true,
    plugins: getTestTablePlugins(),
    value: input.children,
  });

describe('getNextTableCell', () => {
  it('returns the next sibling cell when one exists', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd>
              <hp>11</hp>
            </htd>
            <htd>
              <hp>12</hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as any as SlateEditor;

    const editor = createTableEditor(input);
    const currentCell = editor.api.node([0, 0, 0])!;
    const currentRow = editor.api.node([0, 0])!;

    const nextCell = getNextTableCell(
      editor,
      currentCell,
      [0, 0, 0],
      currentRow
    )!;

    expect(nextCell[1]).toEqual([0, 0, 1]);
    expect(editor.api.string(nextCell[1])).toBe('12');
  });

  it('falls back to the next row first cell when the current cell is last in the row', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd>
              <hp>11</hp>
            </htd>
            <htd>
              <hp>12</hp>
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
    const currentCell = editor.api.node([0, 0, 1])!;
    const currentRow = editor.api.node([0, 0])!;

    const nextCell = getNextTableCell(
      editor,
      currentCell,
      [0, 0, 1],
      currentRow
    )!;

    expect(nextCell[1]).toEqual([0, 1, 0]);
    expect(editor.api.string(nextCell[1])).toBe('21');
  });
});

/** @jsx jsxt */

import { type SlateEditor, createSlateEditor } from 'platejs';

import { jsxt } from '@platejs/test-utils';

import { getTestTablePlugins } from '../__tests__/getTestTablePlugins';
import { getPreviousTableCell } from './getPreviousTableCell';

jsxt;

const createTableEditor = (input: SlateEditor) =>
  createSlateEditor({
    nodeId: true,
    plugins: getTestTablePlugins(),
    value: input.children,
  });

describe('getPreviousTableCell', () => {
  it('returns the previous sibling cell when one exists', () => {
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
    const currentCell = editor.api.node([0, 0, 1])!;
    const currentRow = editor.api.node([0, 0])!;

    const previousCell = getPreviousTableCell(
      editor,
      currentCell,
      [0, 0, 1],
      currentRow
    )!;

    expect(previousCell[1]).toEqual([0, 0, 0]);
    expect(editor.api.string(previousCell[1])).toBe('11');
  });

  it('falls back to the previous row last cell when the current cell is first in the row', () => {
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
    const currentCell = editor.api.node([0, 1, 0])!;
    const currentRow = editor.api.node([0, 1])!;

    const previousCell = getPreviousTableCell(
      editor,
      currentCell,
      [0, 1, 0],
      currentRow
    )!;

    expect(previousCell[1]).toEqual([0, 0, 1]);
    expect(editor.api.string(previousCell[1])).toBe('12');
  });
});

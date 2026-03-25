/** @jsx jsxt */

import { type SlateEditor, createSlateEditor } from 'platejs';

import { jsxt } from '@platejs/test-utils';

import { getTestTablePlugins } from '../__tests__/getTestTablePlugins';
import { getCellInPreviousTableRow } from './getCellInPreviousTableRow';

jsxt;

const createTableEditor = (input: SlateEditor) =>
  createSlateEditor({
    nodeId: true,
    plugins: getTestTablePlugins(),
    value: input.children,
  });

describe('getCellInPreviousTableRow', () => {
  it('returns the last cell from the previous row', () => {
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
    const previousCell = getCellInPreviousTableRow(editor, [0, 1])!;

    expect(previousCell[1]).toEqual([0, 0, 1]);
    expect(editor.api.string(previousCell[1])).toBe('12');
  });

  it('returns undefined when there is no previous row', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd>
              <hp>11</hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as any as SlateEditor;

    const editor = createTableEditor(input);

    expect(getCellInPreviousTableRow(editor, [0, 0])).toBeUndefined();
  });
});

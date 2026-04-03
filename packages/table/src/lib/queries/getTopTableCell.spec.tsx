/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';
import { type SlateEditor, type TElement, createSlateEditor } from 'platejs';

import { getTestTablePlugins } from '../__tests__/getTestTablePlugins';
import { getTopTableCell } from './getTopTableCell';

jsxt;

const createEditorInstance = (input: any) =>
  createSlateEditor({
    nodeId: true,
    plugins: getTestTablePlugins(),
    selection: input.selection,
    value: input.children,
  });

describe('getTopTableCell', () => {
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
          <htd>
            <hp>
              22
              <cursor />
            </hp>
          </htd>
        </htr>
      </htable>
    </editor>
  ) as any as SlateEditor;

  it('returns the cell above the current cell', () => {
    const editor = createEditorInstance(input);
    const cellAbove = getTopTableCell(editor);
    expect((cellAbove?.[0].children as TElement[])[0].children[0].text).toBe(
      '12'
    );
  });

  it('returns undefined if the current cell is in the first row', () => {
    const editor = createEditorInstance(input);
    editor.selection = {
      anchor: { offset: 0, path: [0, 0, 0] },
      focus: { offset: 0, path: [0, 0, 0] },
    };
    const cellAbove = getTopTableCell(editor, {
      at: editor.selection.anchor.path,
    });
    expect(cellAbove).toBeUndefined();
  });

  it('returns undefined if no matching cell is found', () => {
    const emptyEditor = createEditorInstance({ children: [] });
    const cellAbove = getTopTableCell(emptyEditor);
    expect(cellAbove).toBeUndefined();
  });

  it('returns the spanning cell above when the row above has a merged column', () => {
    const mergedInput = (
      <editor>
        <htable>
          <htr>
            <htd colSpan={2} id="c11">
              <hp>11</hp>
            </htd>
            <htd id="c13">
              <hp>13</hp>
            </htd>
          </htr>
          <htr>
            <htd id="c21">
              <hp>21</hp>
            </htd>
            <htd id="c22">
              <hp>
                22
                <cursor />
              </hp>
            </htd>
            <htd id="c23">
              <hp>23</hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as any as SlateEditor;
    const editor = createEditorInstance(mergedInput);

    expect(getTopTableCell(editor)).toEqual([
      expect.objectContaining({ id: 'c11' }),
      [0, 0, 0],
    ]);
  });
});

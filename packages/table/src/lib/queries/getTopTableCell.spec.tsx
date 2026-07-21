/** @jsx jsxt */

import { jsxt, type TestEditor } from '@platejs/test-utils';
import { type Element } from '@platejs/plite';
import { createPlateEditor } from '@platejs/core/react';

import { getTestTablePlugins } from '../__tests__/getTestTablePlugins';
import { getTopTableCell } from './getTopTableCell';

jsxt;

const createEditorInstance = (input: TestEditor) =>
  createPlateEditor({
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
  ) as TestEditor;

  it('returns the cell above the current cell', () => {
    const editor = createEditorInstance(input);
    const cellAbove = getTopTableCell(editor);
    expect((cellAbove?.[0].children as Element[])[0].children[0].text).toBe(
      '12'
    );
  });

  it('returns undefined if the current cell is in the first row', () => {
    const editor = createEditorInstance(input);
    editor.update.selection.set({
      kind: 'text',
      anchor: { offset: 0, path: [0, 0, 0, 0, 0] },
      focus: { offset: 0, path: [0, 0, 0, 0, 0] },
    });
    const cellAbove = getTopTableCell(editor, {
      at: editor.read.selection()!.anchor.path,
    });
    expect(cellAbove).toBeUndefined();
  });

  it('returns undefined if no matching cell is found', () => {
    const emptyInput = (<editor />) as TestEditor;
    const emptyEditor = createEditorInstance(emptyInput);
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
    ) as TestEditor;
    const editor = createEditorInstance(mergedInput);

    expect(getTopTableCell(editor)).toEqual([
      expect.objectContaining({ id: 'c11' }),
      [0, 0, 0],
    ]);
  });
});

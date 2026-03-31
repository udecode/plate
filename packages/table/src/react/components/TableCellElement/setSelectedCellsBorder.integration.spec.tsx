/** @jsx jsxt */

import type { SlateEditor, TTableCellElement } from 'platejs';
import { createSlateEditor } from 'platejs';

import { jsxt } from '@platejs/test-utils';

import { getTestTablePlugins } from '../../../lib/__tests__/getTestTablePlugins';
import { getLeftTableCell } from '../../../lib/queries/getLeftTableCell';
import { getSelectedCells } from '../../../lib/queries/getSelectedCells';
import * as setBorderSizeModule from '../../../lib/transforms/setBorderSize';
import { setBorderSize } from '../../../lib/transforms/setBorderSize';
import { setSelectedCellsBorder } from './getOnSelectTableBorderFactory';

jsxt;

const createTableEditor = (input: SlateEditor) =>
  createSlateEditor({
    nodeId: true,
    plugins: getTestTablePlugins(),
    selection: input.selection,
    value: input.children,
  });

describe('setSelectedCellsBorder integration', () => {
  it('toggles the left border for every selected first-column cell in a multi-row selection', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd id="c11">
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
            <htd id="c21">
              <hp>
                21
                <focus />
              </hp>
            </htd>
            <htd>
              <hp>22</hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as any as SlateEditor;

    const editor = createTableEditor(input);
    const cells = getSelectedCells(editor) as TTableCellElement[];

    expect(cells.map((cell) => cell.id)).toEqual(['c11', 'c21']);

    setSelectedCellsBorder(editor, { border: 'left', cells });

    expect(editor.children).toMatchObject(
      (
        <editor>
          <htable>
            <htr>
              <htd borders={{ left: { size: 0 } }} id="c11">
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
              <htd borders={{ left: { size: 0 } }} id="c21">
                <hp>
                  21
                  <focus />
                </hp>
              </htd>
              <htd>
                <hp>22</hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ).children
    );
  });

  it('toggles the left border for every selected non-first-column cell in a multi-row selection', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd id="c11">
              <hp>11</hp>
            </htd>
            <htd id="c12">
              <hp>
                <anchor />
                12
              </hp>
            </htd>
          </htr>
          <htr>
            <htd id="c21">
              <hp>21</hp>
            </htd>
            <htd id="c22">
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
    const cells = getSelectedCells(editor) as TTableCellElement[];

    expect(cells.map((cell) => cell.id)).toEqual(['c12', 'c22']);
    expect(editor.api.findPath(cells[1])).toEqual([0, 1, 1]);
    expect(
      getLeftTableCell(editor, { at: editor.api.findPath(cells[1])! })?.[0].id
    ).toBe('c21');

    const setBorderSizeSpy = spyOn(setBorderSizeModule, 'setBorderSize');

    setSelectedCellsBorder(editor, { border: 'left', cells });

    expect(
      setBorderSizeSpy.mock.calls
        .filter(([, , options]) => options?.border === 'right')
        .map(([, , options]) => options?.at)
    ).toEqual([
      [0, 0, 0],
      [0, 1, 0],
    ]);

    expect(editor.children).toMatchObject(
      (
        <editor>
          <htable>
            <htr>
              <htd borders={{ right: { size: 0 } }} id="c11">
                <hp>11</hp>
              </htd>
              <htd id="c12">
                <hp>
                  <anchor />
                  12
                </hp>
              </htd>
            </htr>
            <htr>
              <htd borders={{ right: { size: 0 } }} id="c21">
                <hp>21</hp>
              </htd>
              <htd id="c22">
                <hp>
                  22
                  <focus />
                </hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ).children
    );

    setBorderSizeSpy.mockRestore();
  });

  it('can set the lower-row adjacent right border directly by path', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd id="c11">
              <hp>11</hp>
            </htd>
            <htd id="c12">
              <hp>12</hp>
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
          </htr>
        </htable>
      </editor>
    ) as any as SlateEditor;

    const editor = createTableEditor(input);

    setBorderSize(editor, 0, { at: [0, 1, 0], border: 'right' });

    expect(editor.children).toMatchObject(
      (
        <editor>
          <htable>
            <htr>
              <htd id="c11">
                <hp>11</hp>
              </htd>
              <htd id="c12">
                <hp>12</hp>
              </htd>
            </htr>
            <htr>
              <htd borders={{ right: { size: 0 } }} id="c21">
                <hp>21</hp>
              </htd>
              <htd id="c22">
                <hp>
                  22
                  <cursor />
                </hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ).children
    );
  });

  it('can set both adjacent right borders sequentially by path', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd id="c11">
              <hp>11</hp>
            </htd>
            <htd id="c12">
              <hp>12</hp>
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
          </htr>
        </htable>
      </editor>
    ) as any as SlateEditor;

    const editor = createTableEditor(input);

    setBorderSize(editor, 0, { at: [0, 0, 0], border: 'right' });
    setBorderSize(editor, 0, { at: [0, 1, 0], border: 'right' });

    expect(editor.children).toMatchObject(
      (
        <editor>
          <htable>
            <htr>
              <htd borders={{ right: { size: 0 } }} id="c11">
                <hp>11</hp>
              </htd>
              <htd id="c12">
                <hp>12</hp>
              </htd>
            </htr>
            <htr>
              <htd borders={{ right: { size: 0 } }} id="c21">
                <hp>21</hp>
              </htd>
              <htd id="c22">
                <hp>
                  22
                  <cursor />
                </hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ).children
    );
  });

  it('toggles the top border on the spanning cell above a merged column selection', () => {
    const input = (
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

    const editor = createTableEditor(input);
    const table = editor.children[0] as any;
    const target = table.children[1].children[1] as TTableCellElement;

    expect(target.id).toBe('c22');

    setSelectedCellsBorder(editor, { border: 'top', cells: [target] });

    expect(editor.children).toMatchObject(
      (
        <editor>
          <htable>
            <htr>
              <htd borders={{ bottom: { size: 0 } }} colSpan={2} id="c11">
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
      ).children
    );
  });
});

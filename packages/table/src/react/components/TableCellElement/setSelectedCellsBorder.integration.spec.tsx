/** @jsx jsxt */

import assert from 'node:assert/strict';
import { type TTableCellElement } from '@platejs/utils';
import { createPlateEditor } from '@platejs/core/react';

import { jsxt, type TestEditor } from '@platejs/test-utils';

import { getTestTablePlugins } from '../../../lib/__tests__/getTestTablePlugins';
import { getLeftTableCell } from '../../../lib/queries/getLeftTableCell';
import { getSelectedCells } from '../../../lib/queries/getSelectedCells';
import { setBorderSize } from '../../../lib/transforms/setBorderSize';
import { setSelectedCellsBorder } from './getOnSelectTableBorderFactory';

jsxt;

const createTableEditor = (input: TestEditor) =>
  createPlateEditor({
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
    ) as TestEditor;

    const editor = createTableEditor(input);
    const cells = getSelectedCells(editor) as TTableCellElement[];

    expect(cells.map((cell) => cell.id)).toEqual(['c11', 'c21']);

    setSelectedCellsBorder(editor, { border: 'left', cells });

    expect(editor.read.children()).toMatchObject(
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
    ) as TestEditor;

    const editor = createTableEditor(input);
    const cells = getSelectedCells(editor) as TTableCellElement[];

    expect(cells.map((cell) => cell.id)).toEqual(['c12', 'c22']);
    expect(editor.read.nodes.path(cells[1])).toEqual([0, 1, 1]);
    expect(
      getLeftTableCell(editor, {
        at: editor.read.nodes.path(cells[1]),
      })?.[0].id
    ).toBe('c21');

    setSelectedCellsBorder(editor, { border: 'left', cells });

    expect(editor.read.history.undos()).toHaveLength(1);

    expect(editor.read.children()).toMatchObject(
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

    editor.update.history.undo();

    expect(editor.read.children()).toMatchObject(input.children);
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
    ) as TestEditor;

    const editor = createTableEditor(input);

    setBorderSize(editor, 0, { at: [0, 1, 0], border: 'right' });

    expect(editor.read.children()).toMatchObject(
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
    ) as TestEditor;

    const editor = createTableEditor(input);

    setBorderSize(editor, 0, { at: [0, 0, 0], border: 'right' });
    setBorderSize(editor, 0, { at: [0, 1, 0], border: 'right' });

    expect(editor.read.children()).toMatchObject(
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
    ) as TestEditor;

    const editor = createTableEditor(input);
    const entry = editor.read.nodes.get<TTableCellElement>([0, 1, 1]);
    assert(entry);
    const [target] = entry;

    expect(target.id).toBe('c22');

    setSelectedCellsBorder(editor, { border: 'top', cells: [target] });

    expect(editor.read.children()).toMatchObject(
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

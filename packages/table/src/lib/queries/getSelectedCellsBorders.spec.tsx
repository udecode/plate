/** @jsx jsx */

import assert from 'node:assert/strict';
import { createPlateEditor } from '@platejs/core/react';
import type { Value } from '@platejs/plite';
import type { TTableCellElement } from '@platejs/utils';
import { jsx, type TestEditor } from '@platejs/test-utils';

import { getTestTablePlugins } from '../__tests__/getTestTablePlugins';
import {
  getSelectedCellsBorders,
  isSelectedCellBorder,
  isSelectedCellBordersNone,
  isSelectedCellBordersOuter,
} from './getSelectedCellsBorders';

jsx;

const input = (
  <editor>
    <htable>
      <htr>
        <htd id="c11">
          <hp>
            11
            <cursor />
          </hp>
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
          <hp>22</hp>
        </htd>
      </htr>
    </htable>
  </editor>
) as TestEditor;

const createEditor = () =>
  createPlateEditor({
    nodeId: true,
    plugins: getTestTablePlugins(),
    selection: input.selection,
    initialValue: input.children,
  });

const getCell = (editor: ReturnType<typeof createEditor>, path: number[]) => {
  const entry = editor.read.nodes.get<TTableCellElement>(path);
  assert(entry);

  return entry[0];
};

const setBorders = (
  editor: ReturnType<typeof createEditor>,
  path: number[],
  borders: TTableCellElement['borders']
) => editor.update.nodes.set<TTableCellElement>({ borders }, { at: path });

const visible = { size: 1 };
const hidden = { size: 0 };

describe('getSelectedCellsBorders', () => {
  it('returns defaults outside a table and reads the current cell', () => {
    const outsideValue: Value = [
      { children: [{ text: 'outside' }], type: 'p' },
    ];
    const outside = createPlateEditor({
      plugins: getTestTablePlugins(),
      initialValue: outsideValue,
    });

    expect(getSelectedCellsBorders(outside)).toEqual({
      bottom: true,
      left: true,
      none: false,
      outer: true,
      right: true,
      top: true,
    });

    const editor = createEditor();
    setBorders(editor, [0, 0, 0], {
      bottom: visible,
      left: visible,
      right: visible,
      top: visible,
    });

    expect(getSelectedCellsBorders(editor)).toEqual({
      bottom: true,
      left: true,
      none: false,
      outer: true,
      right: true,
      top: true,
    });
  });

  it('detects a borderless cell without fake path or adjacency mocks', () => {
    const editor = createEditor();
    setBorders(editor, [0, 0, 0], {
      bottom: hidden,
      left: hidden,
      right: hidden,
      top: hidden,
    });
    const cell = getCell(editor, [0, 0, 0]);

    expect(getSelectedCellsBorders(editor, [cell]).none).toBe(true);
    expect(isSelectedCellBordersNone(editor, [cell])).toBe(true);
  });

  it('computes outer and side borders across adjacent cells', () => {
    const editor = createEditor();
    setBorders(editor, [0, 0, 0], {
      bottom: visible,
      left: visible,
      top: visible,
    });
    setBorders(editor, [0, 0, 1], {
      bottom: visible,
      right: visible,
      top: visible,
    });
    const cells = [getCell(editor, [0, 0, 0]), getCell(editor, [0, 0, 1])];

    expect(getSelectedCellsBorders(editor, cells).outer).toBe(true);
    expect(isSelectedCellBordersOuter(editor, cells)).toBe(true);
    expect(isSelectedCellBorder(editor, cells, 'top')).toBe(true);

    setBorders(editor, [0, 0, 1], {
      bottom: visible,
      right: hidden,
      top: visible,
    });

    expect(
      getSelectedCellsBorders(editor, [
        getCell(editor, [0, 0, 0]),
        getCell(editor, [0, 0, 1]),
      ]).outer
    ).toBe(false);
  });

  it('reads top and left edges from adjacent cells', () => {
    const editor = createEditor();
    setBorders(editor, [0, 0, 1], { bottom: visible });
    setBorders(editor, [0, 1, 0], { right: visible });
    setBorders(editor, [0, 1, 1], {
      bottom: visible,
      right: visible,
    });

    expect(
      getSelectedCellsBorders(editor, [getCell(editor, [0, 1, 1])])
    ).toEqual({
      bottom: true,
      left: true,
      none: false,
      outer: true,
      right: true,
      top: true,
    });
  });

  it('skips side computation when it is not requested', () => {
    const editor = createEditor();
    const cell = getCell(editor, [0, 0, 0]);

    expect(
      getSelectedCellsBorders(editor, [cell], {
        select: { none: false, outer: false, side: false },
      })
    ).toEqual({
      bottom: true,
      left: true,
      none: false,
      outer: true,
      right: true,
      top: true,
    });
  });
});

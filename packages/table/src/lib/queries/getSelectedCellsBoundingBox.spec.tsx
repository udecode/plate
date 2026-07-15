/** @jsx jsx */

import assert from 'node:assert/strict';
import { createPlateEditor } from '@platejs/core/react';
import type { TTableCellElement } from '@platejs/utils';
import { jsx, type TestEditor } from '@platejs/test-utils';

import { getTestTablePlugins } from '../__tests__/getTestTablePlugins';
import { getSelectedCellsBoundingBox } from './getSelectedCellsBoundingBox';

jsx;

const value = (
  <editor>
    <htable>
      <htr>
        <htd id="c11">
          <hp>11</hp>
        </htd>
        <htd id="c12">
          <hp>12</hp>
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
          <hp>22</hp>
        </htd>
        <htd id="c23">
          <hp>23</hp>
        </htd>
      </htr>
      <htr>
        <htd id="c31">
          <hp>31</hp>
        </htd>
        <htd id="c32">
          <hp>32</hp>
        </htd>
        <htd id="c33">
          <hp>33</hp>
        </htd>
      </htr>
    </htable>
  </editor>
) as TestEditor;

const createEditor = () =>
  createPlateEditor({
    nodeId: true,
    plugins: getTestTablePlugins(),
    value: value.children,
  });

const getCell = (editor: ReturnType<typeof createEditor>, path: number[]) => {
  const entry = editor.read.nodes.get<TTableCellElement>(path);
  assert(entry);

  return entry[0];
};

describe('getSelectedCellsBoundingBox', () => {
  it('returns the bounds of one cell', () => {
    const editor = createEditor();

    expect(
      getSelectedCellsBoundingBox(editor, [getCell(editor, [0, 1, 1])])
    ).toEqual({ maxCol: 1, maxRow: 1, minCol: 1, minRow: 1 });
  });

  it('returns the bounds of horizontal, vertical, and L-shaped selections', () => {
    const editor = createEditor();

    expect(
      getSelectedCellsBoundingBox(editor, [
        getCell(editor, [0, 1, 0]),
        getCell(editor, [0, 1, 1]),
        getCell(editor, [0, 1, 2]),
      ])
    ).toEqual({ maxCol: 2, maxRow: 1, minCol: 0, minRow: 1 });
    expect(
      getSelectedCellsBoundingBox(editor, [
        getCell(editor, [0, 0, 1]),
        getCell(editor, [0, 1, 1]),
        getCell(editor, [0, 2, 1]),
      ])
    ).toEqual({ maxCol: 1, maxRow: 2, minCol: 1, minRow: 0 });
    expect(
      getSelectedCellsBoundingBox(editor, [
        getCell(editor, [0, 0, 0]),
        getCell(editor, [0, 1, 0]),
        getCell(editor, [0, 1, 1]),
      ])
    ).toEqual({ maxCol: 1, maxRow: 1, minCol: 0, minRow: 0 });
  });

  it('includes diagonal corners and cell spans', () => {
    const editor = createEditor();

    expect(
      getSelectedCellsBoundingBox(editor, [
        getCell(editor, [0, 0, 0]),
        getCell(editor, [0, 2, 2]),
      ])
    ).toEqual({ maxCol: 2, maxRow: 2, minCol: 0, minRow: 0 });

    editor.update.nodes.set<TTableCellElement>(
      { colSpan: 2, rowSpan: 2 },
      { at: [0, 1, 1] }
    );

    expect(
      getSelectedCellsBoundingBox(editor, [getCell(editor, [0, 1, 1])])
    ).toEqual({ maxCol: 2, maxRow: 2, minCol: 1, minRow: 1 });
  });
});

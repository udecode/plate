/** @jsx jsxt */

import { createPlateEditor } from '@platejs/core/react';
import type { TTableCellElement } from '@platejs/utils';

import { jsxt, type TestEditor } from '@platejs/test-utils';

import { getTestTablePlugins } from '../__tests__/getTestTablePlugins';
import { getTableCellSize } from './getTableCellSize';

jsxt;

const createTableEditor = (input: TestEditor) =>
  createPlateEditor({
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
    ) as TestEditor;

    const editor = createTableEditor(input);
    const element = editor.read.nodes.get<TTableCellElement>([0], {
      required: true,
    })[0];

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
    ) as TestEditor;

    const editor = createTableEditor(input);
    const element = editor.read.nodes.get<TTableCellElement>([0, 0, 1], {
      required: true,
    })[0];

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
    ) as TestEditor;

    const editor = createTableEditor(input);
    const element = editor.read.nodes.get<TTableCellElement>([0, 0, 1], {
      required: true,
    })[0];

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

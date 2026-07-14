/** @jsx jsxt */

import { createPlateEditor } from '@platejs/core/react';
import type { TTableCellElement } from '@platejs/utils';

import { jsxt, type TestEditor } from '@platejs/test-utils';

import { getTestTablePlugins } from '../__tests__/getTestTablePlugins';
import { getTableColumnIndex } from './getTableColumnIndex';

jsxt;

const createTableEditor = (input: TestEditor) =>
  createPlateEditor({
    nodeId: true,
    plugins: getTestTablePlugins(),
    value: input.children,
  });

describe('getTableColumnIndex', () => {
  it('returns the exact sibling index for the same cell object', () => {
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
            <htd>
              <hp>13</hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as TestEditor;

    const editor = createTableEditor(input);
    const cellNode = editor.read.nodes.get<TTableCellElement>([0, 0, 1], {
      required: true,
    })[0];

    expect(getTableColumnIndex(editor, cellNode)).toBe(1);
  });

  it('returns -1 for a detached or cloned cell object', () => {
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
    ) as TestEditor;

    const editor = createTableEditor(input);
    const clonedCell = structuredClone(
      editor.read.nodes.get<TTableCellElement>([0, 0, 1], { required: true })[0]
    );

    expect(getTableColumnIndex(editor, clonedCell)).toBe(-1);
    expect(
      getTableColumnIndex(editor, {
        children: [{ text: 'ghost' }],
        type: 'td',
      })
    ).toBe(-1);
  });
});

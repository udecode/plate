/** @jsx jsxt */

import assert from 'node:assert/strict';
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

const getCell = (editor: ReturnType<typeof createTableEditor>) => {
  const entry = editor.read.nodes.get<TTableCellElement>([0, 0, 1]);
  assert(entry);

  return entry[0];
};

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
    const cellNode = getCell(editor);

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
    const clonedCell = structuredClone(getCell(editor));

    expect(getTableColumnIndex(editor, clonedCell)).toBe(-1);
    expect(
      getTableColumnIndex(editor, {
        children: [{ text: 'ghost' }],
        type: 'td',
      })
    ).toBe(-1);
  });
});

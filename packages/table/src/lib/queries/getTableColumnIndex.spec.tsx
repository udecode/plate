/** @jsx jsxt */

import { type BasePlateEditor, createBasePlateEditor } from 'platejs';

import { jsxt } from '@platejs/test-utils';

import { getTestTablePlugins } from '../__tests__/getTestTablePlugins';
import { getTableColumnIndex } from './getTableColumnIndex';

jsxt;

const createTableEditor = (input: BasePlateEditor) =>
  createBasePlateEditor({
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
    ) as any as BasePlateEditor;

    const editor = createTableEditor(input);
    const cellNode = ((editor.children[0] as any).children[0] as any)
      .children[1];

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
    ) as any as BasePlateEditor;

    const editor = createTableEditor(input);
    const clonedCell = structuredClone(
      ((editor.children[0] as any).children[0] as any).children[1]
    );

    expect(getTableColumnIndex(editor, clonedCell)).toBe(-1);
    expect(
      getTableColumnIndex(editor, {
        children: [{ text: 'ghost' }],
        type: 'td',
      } as any)
    ).toBe(-1);
  });
});

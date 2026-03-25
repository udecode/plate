/** @jsx jsxt */

import { type SlateEditor, createSlateEditor } from 'platejs';

import { jsxt } from '@platejs/test-utils';

import { getTestTablePlugins } from '../__tests__/getTestTablePlugins';
import { insertTableMergeRow } from './insertTableRow';

jsxt;

const createTableEditor = (input: SlateEditor) =>
  createSlateEditor({
    nodeId: true,
    plugins: getTestTablePlugins({ disableMerge: false }),
    selection: input.selection,
    value: input.children,
  });

describe('insertTableMergeRow', () => {
  it('treats a table path as insert-at-end using the last row', () => {
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
              <hp>
                21
                <cursor />
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

    insertTableMergeRow(editor, { at: [0], select: true });

    expect((editor.children[0] as any).children).toHaveLength(3);
  });

  it('extends row-spanning cells and updates rowspan attributes when inserting inside a merged span', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd attributes={{ rowspan: '2' }} rowSpan={2}>
              <hp>11</hp>
            </htd>
            <htd>
              <hp>12</hp>
            </htd>
          </htr>
          <htr>
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

    const editor = createTableEditor(input);

    insertTableMergeRow(editor, { at: [0, 1] });

    expect(editor.children).toMatchObject([
      {
        children: [
          {
            children: [
              {
                attributes: { rowspan: '3' },
                rowSpan: 3,
                type: 'td',
              },
              { type: 'td' },
            ],
            type: 'tr',
          },
          {
            children: [{ colSpan: 1, rowSpan: 1, type: 'td' }],
            type: 'tr',
          },
          {
            children: [{ type: 'td' }],
            type: 'tr',
          },
        ],
        type: 'table',
      },
    ]);
  });
});

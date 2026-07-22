/** @jsx jsxt */

import { createPlateEditor } from '@platejs/core/react';

import { jsxt, type TestEditor } from '@platejs/test-utils';

import { getTestTablePlugins } from '../__tests__/getTestTablePlugins';

jsxt;

const createTableEditor = (input: TestEditor) =>
  createPlateEditor({
    nodeId: true,
    plugins: getTestTablePlugins({ disableMerge: false }),
    selection: input.selection,
    initialValue: input.children,
  });

describe('deleteTableMergeColumn', () => {
  it('deletes a selected column spanning every row', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd>
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
            <htd>
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

    editor.update.remove.tableColumn();

    expect(editor.read.text.string([0])).toBe('1222');
    expect(
      editor.read.nodes.toArray({ at: [], match: { type: 'td' } })
    ).toHaveLength(2);
  });

  it('shrinks spanning cells and table colSizes when deleting a merged column', () => {
    const input = (
      <editor>
        <htable colSizes={[40, 60]}>
          <htr>
            <htd attributes={{ colspan: '2' }} colSpan={2}>
              <hp>11</hp>
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

    const editor = createTableEditor(input);

    editor.update.remove.tableColumn();

    expect(editor.read.children()).toMatchObject([
      {
        colSizes: [40],
        type: 'table',
        children: [
          {
            children: [
              {
                attributes: { colspan: '1' },
                colSpan: 1,
                type: 'td',
              },
            ],
            type: 'tr',
          },
          {
            children: [
              {
                children: [{ children: [{ text: '21' }] }],
                type: 'td',
              },
            ],
            type: 'tr',
          },
        ],
      },
    ]);
  });

  it('removes every colSize covered by the selected spanning cell', () => {
    const input = (
      <editor>
        <htable colSizes={[40, 50, 60]}>
          <htr>
            <htd colSpan={2}>
              <hp>
                11
                <cursor />
              </hp>
            </htd>
            <htd>
              <hp>13</hp>
            </htd>
          </htr>
          <htr>
            <htd>
              <hp>21</hp>
            </htd>
            <htd>
              <hp>22</hp>
            </htd>
            <htd>
              <hp>23</hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as TestEditor;

    const editor = createTableEditor(input);

    editor.update.remove.tableColumn();

    expect(editor.read.children()).toMatchObject([{ colSizes: [60] }]);
    expect(editor.read.text.string([0])).toBe('1323');
    expect(
      editor.read.nodes.toArray({ at: [], match: { type: 'td' } })
    ).toHaveLength(2);
  });
});

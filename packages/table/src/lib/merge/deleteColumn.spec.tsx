/** @jsx jsxt */

import { type SlateEditor, createSlateEditor } from 'platejs';

import { jsxt } from '@platejs/test-utils';

import { getTestTablePlugins } from '../__tests__/getTestTablePlugins';
import * as deleteColumnExpandedModule from './deleteColumnWhenExpanded';
import { deleteTableMergeColumn } from './deleteColumn';

jsxt;

const createTableEditor = (input: SlateEditor) =>
  createSlateEditor({
    nodeId: true,
    plugins: getTestTablePlugins({ disableMerge: false }),
    selection: input.selection,
    value: input.children,
  });

describe('deleteTableMergeColumn', () => {
  it('delegates expanded selections to deleteColumnWhenExpanded', () => {
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
              <hp>
                12
                <focus />
              </hp>
            </htd>
          </htr>
          <htr>
            <htd>
              <hp>21</hp>
            </htd>
            <htd>
              <hp>22</hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as any as SlateEditor;

    const editor = createTableEditor(input);
    const spy = spyOn(
      deleteColumnExpandedModule,
      'deleteColumnWhenExpanded'
    ).mockReturnValue(undefined as any);

    deleteTableMergeColumn(editor);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0]?.[1][1]).toEqual([0]);
    spy.mockRestore();
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
    ) as any as SlateEditor;

    const editor = createTableEditor(input);

    deleteTableMergeColumn(editor);

    expect(editor.children).toMatchObject([
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
});

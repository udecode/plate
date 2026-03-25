/** @jsx jsxt */

import { type SlateEditor, createSlateEditor } from 'platejs';

import { jsxt } from '@platejs/test-utils';

import { getTestTablePlugins } from '../__tests__/getTestTablePlugins';
import * as mergeModule from '../merge';
import * as deleteMergeRowModule from '../merge/deleteRow';
import { deleteRow } from './deleteRow';

jsxt;

const createTableEditor = (
  input: SlateEditor,
  { disableMerge = true }: { disableMerge?: boolean } = {}
) =>
  createSlateEditor({
    nodeId: true,
    plugins: getTestTablePlugins({ disableMerge }),
    selection: input.selection,
    value: input.children,
  });

describe('deleteRow', () => {
  it('delegates to merged-row deletion when merge support is enabled', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd>
              <hp>
                11
                <cursor />
              </hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as any as SlateEditor;

    const editor = createTableEditor(input, { disableMerge: false });
    const spy = spyOn(
      deleteMergeRowModule,
      'deleteTableMergeRow'
    ).mockReturnValue(undefined as any);

    deleteRow(editor);

    expect(spy).toHaveBeenCalledWith(editor);
    spy.mockRestore();
  });

  it('delegates expanded selections to deleteRowWhenExpanded', () => {
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
    const spy = spyOn(mergeModule, 'deleteRowWhenExpanded').mockReturnValue(
      undefined as any
    );

    deleteRow(editor);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0]?.[0]).toBe(editor);
    expect(spy.mock.calls[0]?.[1][1]).toEqual([0]);
    spy.mockRestore();
  });

  it('removes the current row when the table has more than one row', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd>
              <hp>11</hp>
            </htd>
          </htr>
          <htr>
            <htd>
              <hp>
                21
                <cursor />
              </hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as any as SlateEditor;

    const editor = createTableEditor(input);

    deleteRow(editor);

    expect((editor.children[0] as any).children).toHaveLength(1);
    expect(editor.api.string([0, 0, 0])).toBe('11');
  });

  it('keeps the last remaining row intact', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd>
              <hp>
                11
                <cursor />
              </hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as any as SlateEditor;

    const editor = createTableEditor(input);

    deleteRow(editor);

    expect(editor.children).toMatchObject(input.children);
  });
});

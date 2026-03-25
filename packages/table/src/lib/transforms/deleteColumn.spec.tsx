/** @jsx jsxt */

import { type SlateEditor, createSlateEditor } from 'platejs';

import { jsxt } from '@platejs/test-utils';

import { getTestTablePlugins } from '../__tests__/getTestTablePlugins';
import * as deleteColumnExpandedModule from '../merge/deleteColumnWhenExpanded';
import { deleteColumn } from './deleteColumn';

jsxt;

describe('deleteColumn', () => {
  describe('when 2x2', () => {
    it.each([
      { disableMerge: true },
      { disableMerge: false },
    ])('deletes a column (disableMerge: $disableMerge)', ({ disableMerge }) => {
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

      const output = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>11</hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>21</hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as SlateEditor;

      const editor = createSlateEditor({
        nodeId: true,
        plugins: getTestTablePlugins({ disableMerge }),
        selection: input.selection,
        value: input.children,
      });

      deleteColumn(editor);

      expect(editor.children).toMatchObject(output.children);
    });
  });

  describe('when first row has 2 cells, second row has 1 cell, focus 12', () => {
    it.each([
      { disableMerge: true },
      { disableMerge: false },
    ])('deletes cell 12 (disableMerge: $disableMerge)', ({ disableMerge }) => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>11</hp>
              </htd>
              <htd>
                <hp>
                  12
                  <cursor />
                </hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>21</hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as SlateEditor;

      const output = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>11</hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>21</hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as SlateEditor;

      const editor = createSlateEditor({
        nodeId: true,
        plugins: getTestTablePlugins({ disableMerge }),
        selection: input.selection,
        value: input.children,
      });

      deleteColumn(editor);

      expect(editor.children).toMatchObject(output.children);
    });
  });

  describe('when first row has 2 cells, second row has 1 cell, focus 11', () => {
    it.each([
      { disableMerge: true },
      { disableMerge: false },
    ])('deletes cell 11 (disableMerge: $disableMerge)', ({ disableMerge }) => {
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
              <htd>
                <hp>12</hp>
              </htd>
            </htr>
            <htr>
              <htd colSpan={2}>
                <hp>21</hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as SlateEditor;

      const output = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>12</hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>21</hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as SlateEditor;

      const editor = createSlateEditor({
        nodeId: true,
        plugins: getTestTablePlugins({ disableMerge }),
        selection: input.selection,
        value: input.children,
      });

      deleteColumn(editor);

      expect(editor.children).toMatchObject(output.children);
    });
  });

  describe('when first row has 2 cells, second row has 1 cell, focus 21', () => {
    it.each([
      { disableMerge: true },
      { disableMerge: false },
    ])('keeps the table unchanged when no second-column match exists (disableMerge: $disableMerge)', ({
      disableMerge,
    }) => {
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
            </htr>
          </htable>
        </editor>
      ) as any as SlateEditor;

      const output = (
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
            </htr>
          </htable>
        </editor>
      ) as any as SlateEditor;

      const editor = createSlateEditor({
        nodeId: true,
        plugins: getTestTablePlugins({ disableMerge }),
        selection: input.selection,
        value: input.children,
      });

      deleteColumn(editor);

      expect(editor.children).toMatchObject(output.children);
    });
  });

  it('shrinks table colSizes when deleting a column', () => {
    const input = (
      <editor>
        <htable colSizes={[40, 60]}>
          <htr>
            <htd>
              <hp>11</hp>
            </htd>
            <htd>
              <hp>
                12
                <cursor />
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

    const editor = createSlateEditor({
      nodeId: true,
      plugins: getTestTablePlugins({ disableMerge: true }),
      selection: input.selection,
      value: input.children,
    });

    deleteColumn(editor);

    expect(editor.children).toMatchObject([
      {
        colSizes: [40],
        type: 'table',
      },
    ]);
  });

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

    const editor = createSlateEditor({
      nodeId: true,
      plugins: getTestTablePlugins({ disableMerge: true }),
      selection: input.selection,
      value: input.children,
    });
    const spy = spyOn(
      deleteColumnExpandedModule,
      'deleteColumnWhenExpanded'
    ).mockReturnValue(undefined as any);

    deleteColumn(editor);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0]?.[1][1]).toEqual([0]);
    spy.mockRestore();
  });
});
